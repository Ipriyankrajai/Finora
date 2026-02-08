"use client";

import {
	MoreHorizontal,
	Pause,
	Pencil,
	Play,
	SkipForward,
	Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RecurringRuleData } from "@/hooks/use-recurring";
import {
	usePauseRecurringRule,
	useResumeRecurringRule,
	useSkipOccurrence,
} from "@/hooks/use-recurring";
import { formatDate } from "@/lib/format";

interface OccurrenceControlsProps {
	rule: RecurringRuleData;
	onEdit: () => void;
	onDelete: () => void;
}

/**
 * Inline action controls for a recurring rule row.
 * Provides edit, pause/resume, skip next occurrence, and delete actions.
 */
export function OccurrenceControls({
	rule,
	onEdit,
	onDelete,
}: OccurrenceControlsProps) {
	const pauseRule = usePauseRecurringRule();
	const resumeRule = useResumeRecurringRule();
	const skipOccurrence = useSkipOccurrence();

	const isActive = rule.status === "ACTIVE";
	const isPending =
		pauseRule.isPending || resumeRule.isPending || skipOccurrence.isPending;

	const handlePauseResume = () => {
		if (isActive) {
			pauseRule.mutate({ id: rule.id });
		} else {
			resumeRule.mutate({ id: rule.id });
		}
	};

	const handleSkipNext = () => {
		skipOccurrence.mutate({
			ruleId: rule.id,
			scheduledDate: rule.nextOccurrenceDate,
		});
	};

	return (
		<div className="flex items-center gap-1">
			{/* Inline resume button for paused rules (prominent per CONTEXT.md) */}
			{!isActive && (
				<Button
					className="h-7 gap-1.5 text-xs"
					disabled={isPending}
					onClick={() => resumeRule.mutate({ id: rule.id })}
					size="sm"
					variant="outline"
				>
					<Play className="size-3" />
					Resume
				</Button>
			)}

			{/* Actions dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button disabled={isPending} size="icon-sm" variant="ghost">
							<MoreHorizontal className="size-4" />
							<span className="sr-only">Rule actions</span>
						</Button>
					}
				/>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={onEdit}>
						<Pencil className="mr-2 size-4" />
						Edit Rule
					</DropdownMenuItem>

					<DropdownMenuItem onClick={handlePauseResume}>
						{isActive ? (
							<>
								<Pause className="mr-2 size-4" />
								Pause
							</>
						) : (
							<>
								<Play className="mr-2 size-4" />
								Resume
							</>
						)}
					</DropdownMenuItem>

					{/* Skip next occurrence - only shown for ACTIVE rules */}
					{isActive && (
						<DropdownMenuItem onClick={handleSkipNext}>
							<SkipForward className="mr-2 size-4" />
							Skip {formatDate(new Date(rule.nextOccurrenceDate))}
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={onDelete} variant="destructive">
						<Trash2 className="mr-2 size-4" />
						Delete Rule
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
