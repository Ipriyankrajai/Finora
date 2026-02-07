"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { RecurringRuleData } from "@/hooks/use-recurring";
import { useDeleteRecurringRule } from "@/hooks/use-recurring";

interface DeleteRuleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rule: RecurringRuleData | null;
}

/**
 * Confirmation dialog for deleting a recurring rule.
 * Offers two choices: delete rule only (keep transactions) or
 * delete rule and all generated transactions.
 */
export function DeleteRuleDialog({
	open,
	onOpenChange,
	rule,
}: DeleteRuleDialogProps) {
	const deleteRule = useDeleteRecurringRule();

	const handleDelete = (deleteTransactions: boolean) => {
		if (!rule) {
			return;
		}
		deleteRule.mutate(
			{ id: rule.id, deleteTransactions },
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			}
		);
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Recurring Rule</DialogTitle>
					<DialogDescription>
						This will permanently delete the rule
						{rule?.description ? ` "${rule.description}"` : ""}. What would you
						like to do with the transactions already generated from this rule?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<DialogClose
						render={
							<Button disabled={deleteRule.isPending} variant="outline">
								Cancel
							</Button>
						}
					/>
					<Button
						disabled={deleteRule.isPending}
						onClick={() => handleDelete(false)}
						variant="outline"
					>
						{deleteRule.isPending ? "Deleting..." : "Delete Rule Only"}
					</Button>
					<Button
						disabled={deleteRule.isPending}
						onClick={() => handleDelete(true)}
						variant="destructive"
					>
						{deleteRule.isPending
							? "Deleting..."
							: "Delete Rule & Transactions"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
