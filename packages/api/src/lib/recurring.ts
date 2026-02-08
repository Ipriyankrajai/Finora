import {
	addDays,
	addMonths,
	addWeeks,
	addYears,
	getDate,
	lastDayOfMonth,
	setDate,
} from "date-fns";

type Frequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

/**
 * Compute the next occurrence date from the current one.
 *
 * For MONTHLY rules, an `anchorDay` (the original day-of-month the user chose)
 * prevents month-end drift. Example: Jan 31 -> Feb 28 -> Mar 31 (not Mar 28).
 */
export function computeNextOccurrence(
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

/**
 * Determine the initial `nextOccurrenceDate` for a newly created rule.
 *
 * If `startDate` is today or in the future, it is the first occurrence.
 * If `startDate` is in the past, walk forward until we find the next valid date.
 */
export function computeInitialNextOccurrence(
	frequency: Frequency,
	startDate: Date,
	dayOfMonth?: number
): Date {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const normalizedStart = new Date(startDate);
	normalizedStart.setHours(0, 0, 0, 0);

	if (normalizedStart >= today) {
		return startDate;
	}

	// Walk forward from startDate until we reach today or a future date
	let current = startDate;
	const anchorDay = frequency === "MONTHLY" ? dayOfMonth : undefined;

	while (current < today) {
		const next = computeNextOccurrence(frequency, current, anchorDay);
		if (next >= today) {
			return next;
		}
		current = next;
	}

	return current;
}
