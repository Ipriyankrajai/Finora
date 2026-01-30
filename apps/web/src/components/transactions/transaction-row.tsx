"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { TagChip } from "@/components/tags/tag-chip";
import { MoneyDisplay } from "@/components/shared/money-display";
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
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <MoneyDisplay
            cents={amountCents}
            type={type}
            className="font-medium"
          />
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>

        {/* Description and tags row */}
        <div className="flex items-center gap-2 min-w-0">
          {description && (
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {description}
            </span>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {tags.map(({ tag }) => (
                <TagChip
                  key={tag.id}
                  name={tag.name}
                  color={tag.color}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Transaction actions</span>
          </Button>
        } />
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(id)}>
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
