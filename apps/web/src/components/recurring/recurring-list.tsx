"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { TagChip } from "@/components/tags/tag-chip";
import type { RecurringRuleData } from "@/hooks/use-recurring";
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCents, formatDate } from "@/lib/format";

import { DeleteRuleDialog } from "./delete-rule-dialog";
import { OccurrenceControls } from "./occurrence-controls";

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
	const currencySymbol = settings?.currencySymbol ?? "$";
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
											{formatCents(rule.amountCents, currencySymbol)}
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
									{formatCents(rule.amountCents, currencySymbol)}
								</td>

								{/* Frequency */}
								<td className="px-4 py-3 text-sm">
									{frequencyLabel(rule.frequency)}
								</td>

								{/* Next Date */}
								<td className="px-4 py-3 text-sm">
									{rule.status === "PAUSED" ? (
										<span className="text-muted-foreground">Paused</span>
									) : (
										formatDate(new Date(rule.nextOccurrenceDate))
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
											`${frequencyLabel(rule.frequency)} ${formatCents(rule.amountCents, currencySymbol)}`}
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
								{formatCents(rule.amountCents, currencySymbol)}
							</span>
						</div>

						<div className="flex items-center justify-between">
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
