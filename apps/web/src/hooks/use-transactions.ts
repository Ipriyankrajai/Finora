"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

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

  // Build query input from filters, excluding undefined values
  // The API schema rejects undefined - fields must be omitted entirely
  const queryInput = useMemo(() => {
    const input: {
      limit: number;
      datePreset?: "last7days" | "last30days" | "thisMonth" | "lastMonth" | "thisYear";
      dateFrom?: Date;
      dateTo?: Date;
      type?: "INCOME" | "EXPENSE";
      tagId?: string;
      amountMin?: string;
      amountMax?: string;
    } = { limit };

    if (filters.datePreset) input.datePreset = filters.datePreset;
    if (filters.dateFrom) input.dateFrom = new Date(filters.dateFrom);
    if (filters.dateTo) input.dateTo = new Date(filters.dateTo);
    if (filters.type) input.type = filters.type;
    if (filters.tagId) input.tagId = filters.tagId;
    if (filters.amountMin) input.amountMin = filters.amountMin;
    if (filters.amountMax) input.amountMax = filters.amountMax;

    return input;
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

/**
 * Cache data type helper for transaction list queries
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionListCache = { items: any[]; nextCursor?: string };

/**
 * Hook to create a new transaction with optimistic update.
 * Input: { type, amount, date, description, tagIds }
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.transaction.create.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (newTransaction) => {
      // Cancel any outgoing refetches for all transaction.list queries
      await queryClient.cancelQueries({
        queryKey: ["transaction", "list"],
        exact: false,
      });

      // Snapshot the previous values for all transaction.list queries
      const previousQueries = queryClient.getQueriesData<TransactionListCache>({
        queryKey: ["transaction", "list"],
        exact: false,
      });

      // Create optimistic transaction
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const now = new Date();
      const optimisticTransaction = {
        id: tempId,
        type: newTransaction.type,
        // Convert display amount to cents for optimistic display
        amountCents: BigInt(Math.round(parseFloat(newTransaction.amount) * 100)),
        date: newTransaction.date,
        description: newTransaction.description ?? null,
        userId: "temp",
        createdAt: now,
        updatedAt: now,
        tags: (newTransaction.tagIds ?? []).map((tagId) => ({
          transactionId: tempId,
          tagId,
          assignedAt: now,
          tag: {
            id: tagId,
            name: "",
            color: "#888888",
            userId: "temp",
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
        })),
      };

      // Optimistically add to all matching caches
      for (const [queryKey] of previousQueries) {
        queryClient.setQueryData<TransactionListCache>(queryKey, (old) => {
          if (!old) return { items: [optimisticTransaction], nextCursor: undefined };
          // Insert at beginning (most recent first)
          return {
            ...old,
            items: [optimisticTransaction, ...old.items],
          };
        });
      }

      return { previousQueries };
    },
    onError: (_err, _newTransaction, context) => {
      // Rollback to previous values
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to create transaction");
    },
    onSuccess: () => {
      toast.success("Transaction added");
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        queryKey: ["transaction", "list"],
        exact: false,
      });
    },
  });
}

/**
 * Hook to update an existing transaction with optimistic update.
 * Input: { id, type?, amount?, date?, description?, tagIds? }
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.transaction.update.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (updatedTransaction) => {
      await queryClient.cancelQueries({
        queryKey: ["transaction", "list"],
        exact: false,
      });

      const previousQueries = queryClient.getQueriesData<TransactionListCache>({
        queryKey: ["transaction", "list"],
        exact: false,
      });

      const now = new Date();

      // Optimistically update in all matching caches
      for (const [queryKey] of previousQueries) {
        queryClient.setQueryData<TransactionListCache>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) => {
              if (item.id !== updatedTransaction.id) return item;
              return {
                ...item,
                type: updatedTransaction.type ?? item.type,
                amountCents: updatedTransaction.amount
                  ? BigInt(Math.round(parseFloat(updatedTransaction.amount) * 100))
                  : item.amountCents,
                date: updatedTransaction.date ?? item.date,
                description:
                  updatedTransaction.description !== undefined
                    ? updatedTransaction.description
                    : item.description,
                updatedAt: now,
                tags:
                  updatedTransaction.tagIds !== undefined
                    ? updatedTransaction.tagIds.map((tagId: string) => ({
                        transactionId: item.id,
                        tagId,
                        assignedAt: now,
                        tag: {
                          id: tagId,
                          name: "",
                          color: "#888888",
                          userId: "temp",
                          isActive: true,
                          createdAt: now,
                          updatedAt: now,
                        },
                      }))
                    : item.tags,
              };
            }),
          };
        });
      }

      return { previousQueries };
    },
    onError: (_err, _updatedTransaction, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to update transaction");
    },
    onSuccess: () => {
      toast.success("Transaction updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transaction", "list"],
        exact: false,
      });
    },
  });
}

/**
 * Hook to delete a transaction with optimistic update.
 * Input: { id }
 * Note: This is a hard delete (transactions don't have isActive)
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.transaction.delete.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (deleteInput) => {
      await queryClient.cancelQueries({
        queryKey: ["transaction", "list"],
        exact: false,
      });

      const previousQueries = queryClient.getQueriesData<TransactionListCache>({
        queryKey: ["transaction", "list"],
        exact: false,
      });

      // Optimistically remove from all matching caches
      for (const [queryKey] of previousQueries) {
        queryClient.setQueryData<TransactionListCache>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== deleteInput.id),
          };
        });
      }

      return { previousQueries };
    },
    onError: (_err, _deleteInput, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to delete transaction");
    },
    onSuccess: () => {
      toast.success("Transaction deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transaction", "list"],
        exact: false,
      });
    },
  });
}
