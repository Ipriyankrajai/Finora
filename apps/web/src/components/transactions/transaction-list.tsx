"use client";

import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/use-transactions";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";

import { DateGroupHeader } from "./date-group-header";
import { TransactionRow } from "./transaction-row";

interface TransactionListProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Paginated transaction list with date grouping.
 * Per CONTEXT.md: "Grouped by date with daily sections", "Page numbers"
 */
export function TransactionList({ onEdit, onDelete }: TransactionListProps) {
  const { groups, isLoading, error, hasNextPage, refetch } = useTransactions();
  const { filters, setFilter } = useTransactionFilters();

  // Handle page navigation
  const handlePrevPage = () => {
    if (filters.page > 1) {
      setFilter("page", filters.page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setFilter("page", filters.page + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton headers and rows */}
        {[1, 2, 3].map((groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            <Skeleton className="h-8 w-24" />
            {[1, 2, 3].map((rowIndex) => (
              <Skeleton
                key={`${groupIndex}-${rowIndex}`}
                className="h-14 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="size-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load transactions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <Loader2 className="mr-2 size-4 animate-spin hidden" />
          Try again
        </Button>
      </div>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/50 rounded-full p-6 mb-4">
          <svg
            className="size-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No transactions found</h3>
        <p className="text-sm text-muted-foreground">
          {filters.datePreset || filters.type || filters.tagId || filters.amountMin || filters.amountMax
            ? "Try adjusting your filters to see more results."
            : "Click \"Add Transaction\" to start tracking your spending."}
        </p>
      </div>
    );
  }

  // Transaction list with date groups
  return (
    <div className="space-y-0">
      {/* Grouped transactions */}
      <div className="divide-y divide-border">
        {groups.map((group) => (
          <div key={group.label} className="group">
            <DateGroupHeader label={group.label} />
            <div className="divide-y divide-border/50">
              {group.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  className="group"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          disabled={filters.page <= 1}
          onClick={handlePrevPage}
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {filters.page}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={handleNextPage}
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
