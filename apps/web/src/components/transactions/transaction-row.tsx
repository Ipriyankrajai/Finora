"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { MoneyDisplay } from "@/components/shared/money-display";
import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TransactionTag {
	tag: {
		id: string;
		name: string;
		color: string;
	};
}

export interface Transaction {
	id: string;
	type: "INCOME" | "EXPENSE";
	amountCents: bigint;
	date: Date;
	description: string | null;
	tags: TransactionTag[];
}

interface TransactionRowProps {
	transaction: Transaction;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	className?: string;
}

/**
 * Transaction row displaying amount, time, description, and tags.
 * Per CONTEXT.md: "amount, note, tags, and time (date in section header)"
 */
export function TransactionRow({
	transaction,
	onEdit,
	onDelete,
	className,
}: TransactionRowProps) {
	const { id, type, amountCents, date, description, tags } = transaction;
	const time = formatTime(new Date(date));

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-4",
				"px-4 py-3",
				"hover:bg-muted/50",
				"transition-colors",
				className
			)}
		>
			{/* Left side: Amount, time, description, tags */}
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-center gap-3">
					<MoneyDisplay
						cents={amountCents}
						className="font-medium"
						type={type}
					/>
					<span className="text-muted-foreground text-xs">{time}</span>
				</div>

				{/* Description and tags row */}
				<div className="flex min-w-0 items-center gap-2">
					{description && (
						<span className="max-w-[200px] truncate text-muted-foreground text-sm">
							{description}
						</span>
					)}

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex flex-shrink-0 items-center gap-1.5">
							{tags.map(({ tag }) => (
								<TagChip
									color={tag.color}
									key={tag.id}
									name={tag.name}
									size="sm"
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Right side: Actions menu */}
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							className="opacity-0 focus:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
							size="icon-sm"
							variant="ghost"
						>
							<MoreHorizontal className="size-4" />
							<span className="sr-only">Transaction actions</span>
						</Button>
					}
				/>
				<DropdownMenuContent align="end">
					{onEdit && (
						<DropdownMenuItem onClick={() => onEdit(id)}>
							<Pencil className="mr-2 size-4" />
							Edit
						</DropdownMenuItem>
					)}
					{onDelete && (
						<DropdownMenuItem
							onClick={() => onDelete(id)}
							variant="destructive"
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
