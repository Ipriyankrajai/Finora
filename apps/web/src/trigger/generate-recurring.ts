import db from "@finora2/db";
import { logger, schedules } from "@trigger.dev/sdk";
import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	getDate,
	lastDayOfMonth,
	setDate,
} from "date-fns";

/**
 * Compute the next occurrence date from the current one.
 *
 * Duplicated from packages/api/src/lib/recurring.ts to avoid import
 * complexity in the Trigger.dev worker bundler. Keep in sync with
 * the canonical source.
 */
type Frequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

function computeNextOccurrence(
	frequency: Frequency,
	currentDate: Date,
	anchorDay?: number
): Date {
	switch (frequency) {
		case "DAILY":
			return addDays(currentDate, 1);
		case "WEEKLY":
			return addWeeks(currentDate, 1);
		case "BIWEEKLY":
			return addWeeks(currentDate, 2);
		case "MONTHLY": {
			const nextMonth = addMonths(currentDate, 1);
			if (anchorDay) {
				const lastDay = getDate(lastDayOfMonth(nextMonth));
				const targetDay = Math.min(anchorDay, lastDay);
				return setDate(nextMonth, targetDay);
			}
			return nextMonth;
		}
		case "YEARLY":
			return addYears(currentDate, 1);
		default: {
			const _exhaustive: never = frequency;
			throw new Error(`Unknown frequency: ${_exhaustive}`);
		}
	}
}

/** Safety limit: max occurrences to generate per rule per run */
const MAX_OCCURRENCES_PER_RUN = 100;

type RuleWithTags = Awaited<
	ReturnType<(typeof db)["recurringRule"]["findMany"]>
>[number] & {
	tags: Array<{ ruleId: string; tagId: string; assignedAt: Date }>;
};

/**
 * Generate all due occurrences for a single recurring rule.
 * Returns the number of transactions created.
 */
async function generateOccurrencesForRule(
	rule: RuleWithTags,
	now: Date
): Promise<number> {
	let currentDate = new Date(rule.nextOccurrenceDate);
	let generated = 0;
	let localCompletedCount = rule.completedCount;
	const anchorDay =
		rule.frequency === "MONTHLY" ? (rule.dayOfMonth ?? undefined) : undefined;

	while (currentDate <= now) {
		// Safety limit to prevent runaway loops
		if (generated >= MAX_OCCURRENCES_PER_RUN) {
			logger.warn(
				`Safety limit reached for rule ${rule.id}: generated ${String(generated)} occurrences in one run`
			);
			break;
		}

		// Check end conditions before generating
		if (rule.endDate && currentDate > rule.endDate) {
			break;
		}
		if (
			rule.maxOccurrences !== null &&
			localCompletedCount >= rule.maxOccurrences
		) {
			break;
		}

		// Idempotency check: skip if occurrence already exists
		const existing = await db.recurringOccurrence.findUnique({
			where: {
				ruleId_scheduledDate: {
					ruleId: rule.id,
					scheduledDate: currentDate,
				},
			},
		});

		if (existing) {
			// Already generated, advance and continue
			currentDate = computeNextOccurrence(
				rule.frequency as Frequency,
				currentDate,
				anchorDay
			);
			continue;
		}

		// Generate transaction and occurrence inside a transaction block
		await db.$transaction(async (tx) => {
			// Create the transaction record
			const transaction = await tx.transaction.create({
				data: {
					userId: rule.userId,
					type: rule.type,
					amountCents: rule.amountCents,
					date: currentDate,
					description: rule.description,
					currencyCode: rule.currencyCode,
				},
			});

			// Copy tags from rule to transaction
			if (rule.tags.length > 0) {
				await tx.transactionTag.createMany({
					data: rule.tags.map((tag) => ({
						transactionId: transaction.id,
						tagId: tag.tagId,
					})),
				});
			}

			// Create the occurrence record (links rule to transaction)
			await tx.recurringOccurrence.create({
				data: {
					ruleId: rule.id,
					scheduledDate: currentDate,
					status: "GENERATED",
					transactionId: transaction.id,
				},
			});

			// Update rule tracking fields
			await tx.recurringRule.update({
				where: { id: rule.id },
				data: {
					completedCount: { increment: 1 },
					lastGeneratedDate: currentDate,
				},
			});
		});

		generated += 1;
		localCompletedCount += 1;

		// Advance to next occurrence date
		currentDate = computeNextOccurrence(
			rule.frequency as Frequency,
			currentDate,
			anchorDay
		);
	}

	// Update nextOccurrenceDate to the next future date
	if (generated > 0) {
		// Check if rule has hit its end conditions
		const shouldDeactivate =
			(rule.endDate && currentDate > rule.endDate) ||
			(rule.maxOccurrences !== null &&
				localCompletedCount >= rule.maxOccurrences);

		if (shouldDeactivate) {
			await db.recurringRule.update({
				where: { id: rule.id },
				data: {
					nextOccurrenceDate: currentDate,
					status: "PAUSED",
				},
			});
		} else {
			await db.recurringRule.update({
				where: { id: rule.id },
				data: {
					nextOccurrenceDate: currentDate,
				},
			});
		}
	}

	return generated;
}

/**
 * Scheduled task: Generate recurring transactions.
 *
 * Runs every hour, finds all active recurring rules with a past-due
 * nextOccurrenceDate, and generates transactions for each one.
 * Uses idempotent deduplication via @@unique([ruleId, scheduledDate]).
 */
export const generateRecurringTransactions = schedules.task({
	id: "generate-recurring-transactions",
	cron: "0 * * * *",
	run: async (payload) => {
		const now = payload.timestamp;

		// Find all active rules where nextOccurrenceDate <= now
		const dueRules = await db.recurringRule.findMany({
			where: {
				status: "ACTIVE",
				nextOccurrenceDate: { lte: now },
			},
			include: {
				tags: true,
			},
		});

		logger.info(`Found ${String(dueRules.length)} due recurring rules`);

		let totalGenerated = 0;

		for (const rule of dueRules) {
			try {
				const generated = await generateOccurrencesForRule(rule, now);
				totalGenerated += generated;
				if (generated > 0) {
					logger.info(
						`Rule ${rule.id}: generated ${String(generated)} transactions`
					);
				}
			} catch (error) {
				// Log error but continue processing other rules
				logger.error(
					`Failed to process rule ${rule.id}: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}

		logger.info(
			`Generated ${String(totalGenerated)} transactions from ${String(dueRules.length)} rules`
		);

		return {
			rulesProcessed: dueRules.length,
			transactionsGenerated: totalGenerated,
		};
	},
});
