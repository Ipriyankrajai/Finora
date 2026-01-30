"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { formatRelativeDate } from "@/lib/format";
import { trpc } from "@/utils/trpc";

import { useTransactionFilters } from "./use-transaction-filters";

/**
 * Transaction with tags included
 */
export interface TransactionWithTags {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: bigint;
  date: Date;
  description: string | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

/**
 * Group of transactions for a single date
 */
export interface TransactionGroup {
  date: Date;
  label: string; // "Today", "Yesterday", "Jan 28"
  transactions: TransactionWithTags[];
}

/**
 * Group transactions by date for display
 */
function groupTransactionsByDate(
  transactions: TransactionWithTags[]
): TransactionGroup[] {
  const groups = new Map<string, TransactionWithTags[]>();

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    // Create key as YYYY-MM-DD to group same dates
    const key = date.toISOString().split("T")[0];

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(transaction);
  }

  // Convert map to array of groups, maintaining sort order (most recent first)
  return Array.from(groups.entries()).map(([dateStr, transactions]) => {
    const date = new Date(dateStr);
    return {
      date,
      label: formatRelativeDate(date),
      transactions,
    };
  });
}

/**
 * Hook to fetch and manage transactions with current filters.
 * Uses URL-based filter state from useTransactionFilters.
 */
export function useTransactions() {
  const { filters } = useTransactionFilters();

  const limit = 20;

  // Build query input from filters
  const queryInput = useMemo(() => {
    return {
      limit,
      datePreset: filters.datePreset,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      type: filters.type,
      tagId: filters.tagId,
      amountMin: filters.amountMin,
      amountMax: filters.amountMax,
      // For page-based pagination on cursor API:
      // We'll implement basic first-page support now and
      // extend pagination in the list component
    };
  }, [filters]);

  const queryOptions = trpc.transaction.list.queryOptions(queryInput);
  const query = useQuery(queryOptions);

  // Group transactions by date for display
  const groups = useMemo(() => {
    const items = (query.data?.items ?? []) as TransactionWithTags[];
    return groupTransactionsByDate(items);
  }, [query.data?.items]);

  // Calculate total for current view (useful for summary)
  const totals = useMemo(() => {
    const items = (query.data?.items ?? []) as TransactionWithTags[];
    let income = BigInt(0);
    let expense = BigInt(0);

    for (const transaction of items) {
      if (transaction.type === "INCOME") {
        income += transaction.amountCents;
      } else {
        expense += transaction.amountCents;
      }
    }

    return { income, expense, net: income - expense };
  }, [query.data?.items]);

  return {
    groups,
    items: (query.data?.items ?? []) as TransactionWithTags[],
    totals,
    isLoading: query.isLoading,
    isPending: query.isPending,
    error: query.error,
    hasNextPage: query.data?.nextCursor !== undefined,
    nextCursor: query.data?.nextCursor,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch tags for filter dropdown
 */
export function useTags() {
  const queryOptions = trpc.tag.list.queryOptions();
  const query = useQuery(queryOptions);

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
