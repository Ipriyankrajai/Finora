"use client";

import { format, getYear } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { TagChip } from "@/components/tags/tag-chip";
import type { RecurringRuleData } from "@/hooks/use-recurring";
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCents, formatDate } from "@/lib/format";

import { DeleteRuleDialog } from "./delete-rule-dialog";
import { OccurrenceControls } from "./occurrence-controls";

function formatShortDate(date: Date): string {
	const d = new Date(date);
	const currentYear = getYear(new Date());
	if (getYear(d) === currentYear) {
		return format(d, "MMM d");
	}
	return format(d, "MMM d, yyyy");
}

function formatSchedule(rule: RecurringRuleData): {
	start: string;
	end: string;
	progress?: { completed: number; total: number };
} {
	const start = formatShortDate(rule.startDate);

	if (rule.maxOccurrences) {
		return {
			start,
			end: `${rule.completedCount}/${rule.maxOccurrences}`,
			progress: {
				completed: rule.completedCount,
				total: rule.maxOccurrences,
			},
		};
	}

	if (rule.endDate) {
		return { start, end: formatShortDate(rule.endDate) };
	}

	return { start, end: "Forever" };
}

function getLastSkipped(rule: RecurringRuleData): Date | null {
	if (!rule.occurrences || rule.occurrences.length === 0) {
		return null;
	}
	return new Date(rule.occurrences[0].scheduledDate);
}

/**
 * Human-readable frequency label
 */
function frequencyLabel(frequency: RecurringRuleData["frequency"]): string {
	switch (frequency) {
		case "DAILY":
			return "Daily";
		case "WEEKLY":
			return "Weekly";
		case "BIWEEKLY":
			return "Every 2 weeks";
		case "MONTHLY":
			return "Monthly";
		case "YEARLY":
			return "Yearly";
		default: {
			const _exhaustive: never = frequency;
			return _exhaustive;
		}
	}
}

/**
 * Sort rules: ACTIVE first sorted by nextOccurrenceDate ascending,
 * then PAUSED at the bottom.
 */
function sortRules(rules: RecurringRuleData[]): RecurringRuleData[] {
	return [...rules].sort((a, b) => {
		// PAUSED rules go to the bottom
		if (a.status !== b.status) {
			return a.status === "ACTIVE" ? -1 : 1;
		}
		// Within same status, sort by next occurrence date ascending (soonest first)
		return (
			new Date(a.nextOccurrenceDate).getTime() -
			new Date(b.nextOccurrenceDate).getTime()
		);
	});
}

interface RecurringListProps {
	rules: RecurringRuleData[];
	onEdit: (rule: RecurringRuleData) => void;
}

/**
 * Table/list view of all recurring rules.
 * Shows status, description, type, amount, frequency, next date, tags, and actions.
 * Uses OccurrenceControls for pause/resume/skip and DeleteRuleDialog for deletion.
 */
export function RecurringList({ rules, onEdit }: RecurringListProps) {
	const { data: settings } = useUserSettings();
	const currencyCode = settings?.currencyCode ?? "USD";
	const [deletingRule, setDeletingRule] = useState<RecurringRuleData | null>(
		null
	);

	const sortedRules = sortRules(rules);

	return (
		<>
			{/* Desktop table */}
			<div className="hidden overflow-hidden border md:block">
				<table className="w-full">
					<thead>
						<tr className="border-b bg-muted/50">
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Status
							</th>
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Description
							</th>
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Type
							</th>
							<th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">
								Amount
							</th>
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Frequency
							</th>
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Schedule
							</th>
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Next Date
							</th>
							<th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">
								Tags
							</th>
							<th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedRules.map((rule) => (
							<tr
								className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
								key={rule.id}
							>
								{/* Status indicator */}
								<td className="px-4 py-3">
									{rule.status === "ACTIVE" ? (
										<span className="inline-flex items-center gap-1.5 text-xs">
											<span className="size-2 rounded-full bg-emerald-500" />
											Active
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 text-xs dark:text-amber-400">
											Paused
										</span>
									)}
								</td>

								{/* Description */}
								<td className="max-w-[200px] truncate px-4 py-3 text-sm">
									{rule.description || (
										<span className="text-muted-foreground">
											{frequencyLabel(rule.frequency)}{" "}
											{formatCents(rule.amountCents, currencyCode)}
										</span>
									)}
								</td>

								{/* Type indicator */}
								<td className="px-4 py-3">
									{rule.type === "INCOME" ? (
										<span className="inline-flex items-center gap-1 text-emerald-600 text-xs dark:text-emerald-400">
											<ArrowUp className="size-3" />
											Income
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-red-600 text-xs dark:text-red-400">
											<ArrowDown className="size-3" />
											Expense
										</span>
									)}
								</td>

								{/* Amount */}
								<td className="px-4 py-3 text-right font-medium text-sm">
									{formatCents(rule.amountCents, currencyCode)}
								</td>

								{/* Frequency */}
								<td className="px-4 py-3 text-sm">
									{frequencyLabel(rule.frequency)}
								</td>

								{/* Schedule */}
								<td className="px-4 py-3 text-sm">
									{(() => {
										const schedule = formatSchedule(rule);
										return (
											<div className="flex items-center gap-1.5">
												<span>{schedule.start}</span>
												<span className="text-muted-foreground">&rarr;</span>
												<span>{schedule.end}</span>
												{schedule.progress && (
													<div className="ml-1 h-1.5 w-12 overflow-hidden rounded-full bg-muted">
														<div
															className="h-full rounded-full bg-primary"
															style={{
																width: `${Math.min(100, (schedule.progress.completed / schedule.progress.total) * 100)}%`,
															}}
														/>
													</div>
												)}
											</div>
										);
									})()}
								</td>

								{/* Next Date */}
								<td className="px-4 py-3 text-sm">
									{rule.status === "PAUSED" ? (
										<span className="text-muted-foreground">Paused</span>
									) : (
										<div>
											<div>{formatDate(new Date(rule.nextOccurrenceDate))}</div>
											{(() => {
												const skipped = getLastSkipped(rule);
												if (!skipped) {
													return null;
												}
												return (
													<div className="text-muted-foreground text-xs">
														Skipped {formatShortDate(skipped)}
													</div>
												);
											})()}
										</div>
									)}
								</td>

								{/* Tags */}
								<td className="px-4 py-3">
									<div className="flex flex-wrap gap-1.5">
										{rule.tags.slice(0, 3).map(({ tag }) => (
											<TagChip
												color={tag.color}
												key={tag.id}
												name={tag.name}
												size="sm"
											/>
										))}
										{rule.tags.length > 3 && (
											<span className="text-muted-foreground text-xs">
												+{rule.tags.length - 3}
											</span>
										)}
									</div>
								</td>

								{/* Actions - using OccurrenceControls */}
								<td className="px-4 py-3">
									<div className="flex items-center justify-end">
										<OccurrenceControls
											onDelete={() => setDeletingRule(rule)}
											onEdit={() => onEdit(rule)}
											rule={rule}
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobile card view */}
			<div className="space-y-3 md:hidden">
				{sortedRules.map((rule) => (
					<div className="border bg-card p-4" key={rule.id}>
						<div className="mb-2 flex items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									{rule.type === "INCOME" ? (
										<ArrowUp className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
									) : (
										<ArrowDown className="size-3.5 shrink-0 text-red-600 dark:text-red-400" />
									)}
									<span className="truncate font-medium text-sm">
										{rule.description ||
											`${frequencyLabel(rule.frequency)} ${formatCents(rule.amountCents, currencyCode)}`}
									</span>
								</div>
								<div className="mt-1 flex items-center gap-2">
									{rule.status === "ACTIVE" ? (
										<span className="inline-flex items-center gap-1 text-xs">
											<span className="size-1.5 rounded-full bg-emerald-500" />
											Active
										</span>
									) : (
										<span className="inline-flex items-center gap-1 rounded-sm bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-600 text-xs dark:text-amber-400">
											Paused
										</span>
									)}
									<span className="text-muted-foreground text-xs">
										{frequencyLabel(rule.frequency)}
									</span>
								</div>
							</div>
							<span className="shrink-0 font-medium text-sm">
								{formatCents(rule.amountCents, currencyCode)}
							</span>
						</div>

						<div className="mb-2 flex items-center gap-1.5 text-muted-foreground text-xs">
							{(() => {
								const schedule = formatSchedule(rule);
								return (
									<>
										<span>{schedule.start}</span>
										<span>&rarr;</span>
										<span>{schedule.end}</span>
										{schedule.progress && (
											<div className="ml-1 h-1 w-8 overflow-hidden rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-primary"
													style={{
														width: `${Math.min(100, (schedule.progress.completed / schedule.progress.total) * 100)}%`,
													}}
												/>
											</div>
										)}
									</>
								);
							})()}
						</div>

						<div className="flex items-center justify-between">
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground text-xs">
										Next:{" "}
										{rule.status === "PAUSED"
											? "Paused"
											: formatDate(new Date(rule.nextOccurrenceDate))}
									</span>
									{rule.tags.slice(0, 2).map(({ tag }) => (
										<TagChip
											color={tag.color}
											key={tag.id}
											name={tag.name}
											size="sm"
										/>
									))}
								</div>
								{(() => {
									const skipped = getLastSkipped(rule);
									if (!skipped || rule.status === "PAUSED") {
										return null;
									}
									return (
										<span className="text-muted-foreground text-xs">
											Skipped {formatShortDate(skipped)}
										</span>
									);
								})()}
							</div>
							<OccurrenceControls
								onDelete={() => setDeletingRule(rule)}
								onEdit={() => onEdit(rule)}
								rule={rule}
							/>
						</div>
					</div>
				))}
			</div>

			{/* Delete confirmation dialog with rule-only vs rule-and-transactions choice */}
			<DeleteRuleDialog
				onOpenChange={(open) => !open && setDeletingRule(null)}
				open={!!deletingRule}
				rule={deletingRule}
			/>
		</>
	);
}
