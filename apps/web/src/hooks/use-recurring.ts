"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

/**
 * Recurring rule with tags as returned by the API list endpoint
 */
export interface RecurringRuleData {
	id: string;
	type: "INCOME" | "EXPENSE";
	amountCents: bigint;
	description: string | null;
	frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
	dayOfWeek: number | null;
	dayOfMonth: number | null;
	startDate: Date;
	endDate: Date | null;
	maxOccurrences: number | null;
	completedCount: number;
	status: "ACTIVE" | "PAUSED";
	nextOccurrenceDate: Date;
	lastGeneratedDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
	tags: Array<{
		ruleId: string;
		tagId: string;
		assignedAt: Date;
		tag: {
			id: string;
			name: string;
			color: string;
		};
	}>;
}

/**
 * Cache data type helper for recurring rule list queries
 */
type RecurringListCache = RecurringRuleData[];

/**
 * Helper predicate to match recurring.list query keys
 */
function isRecurringListQuery(queryKey: readonly unknown[]): boolean {
	return (
		Array.isArray(queryKey[0]) &&
		queryKey[0].includes("recurring") &&
		queryKey[0].includes("list")
	);
}

/**
 * Helper predicate to match any recurring query keys
 */
function isRecurringQuery(queryKey: readonly unknown[]): boolean {
	return Array.isArray(queryKey[0]) && queryKey[0].includes("recurring");
}

/**
 * Hook to fetch all recurring rules for the current user.
 */
export function useRecurringRules() {
	const queryOptions = trpc.recurring.list.queryOptions();
	const query = useQuery(queryOptions);

	return {
		rules: (query.data ?? []) as RecurringRuleData[],
		isLoading: query.isLoading,
		isPending: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

/**
 * Hook to create a new recurring rule.
 * On success: toast notification, invalidate list queries.
 */
export function useCreateRecurringRule() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.recurring.create.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to create recurring rule");
		},
		onSuccess: () => {
			toast.success("Recurring rule created");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isRecurringListQuery(query.queryKey),
			});
		},
	});
}

/**
 * Hook to update an existing recurring rule.
 * On success: toast notification, invalidate list and getById queries.
 */
export function useUpdateRecurringRule() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.recurring.update.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to update recurring rule");
		},
		onSuccess: () => {
			toast.success("Recurring rule updated");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isRecurringQuery(query.queryKey),
			});
		},
	});
}

/**
 * Hook to delete a recurring rule with optimistic removal from cache.
 * Input: { id, deleteTransactions? }
 */
export function useDeleteRecurringRule() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.recurring.delete.mutationOptions();

	return useMutation({
		...mutationOptions,
		onMutate: async (deleteInput) => {
			await queryClient.cancelQueries({
				predicate: (query) => isRecurringListQuery(query.queryKey),
			});

			const previousQueries = queryClient.getQueriesData<RecurringListCache>({
				predicate: (query) => isRecurringListQuery(query.queryKey),
			});

			// Optimistically remove from all matching caches
			for (const [queryKey] of previousQueries) {
				queryClient.setQueryData<RecurringListCache>(queryKey, (old) => {
					if (!old) {
						return old;
					}
					return old.filter((rule) => rule.id !== deleteInput.id);
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
			toast.error("Failed to delete recurring rule");
		},
		onSuccess: () => {
			toast.success("Recurring rule deleted");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isRecurringListQuery(query.queryKey),
			});
		},
	});
}

/**
 * Hook to pause an active recurring rule.
 * On success: toast notification, invalidate list queries.
 */
export function usePauseRecurringRule() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.recurring.pause.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to pause recurring rule");
		},
		onSuccess: () => {
			toast.success("Rule paused");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isRecurringListQuery(query.queryKey),
			});
		},
	});
}

/**
 * Hook to resume a paused recurring rule.
 * On success: toast notification, invalidate list queries.
 */
export function useResumeRecurringRule() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.recurring.resume.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to resume recurring rule");
		},
		onSuccess: () => {
			toast.success("Rule resumed");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isRecurringListQuery(query.queryKey),
			});
		},
	});
}

/**
 * Hook to skip a single upcoming occurrence.
 * On success: toast notification, invalidate list and getById queries.
 */
export function useSkipOccurrence() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.recurring.skipOccurrence.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to skip occurrence");
		},
		onSuccess: () => {
			toast.success("Occurrence skipped");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) => isRecurringQuery(query.queryKey),
			});
		},
	});
}

/**
 * Hook to fetch upcoming occurrence dates for a rule.
 * Returns computed future dates with skip status.
 */
export function useUpcomingOccurrences(ruleId: string) {
	const queryOptions = trpc.recurring.upcomingOccurrences.queryOptions(
		{ ruleId },
		{ enabled: !!ruleId }
	);
	const query = useQuery(queryOptions);

	return {
		occurrences: query.data ?? [],
		isLoading: query.isLoading,
	};
}

/**
 * Hook to fetch today's generated recurring occurrence count.
 * Used by the dashboard banner to show auto-generated transaction count.
 */
export function useTodayGenerated() {
	const queryOptions = trpc.recurring.todayGenerated.queryOptions();
	const query = useQuery(queryOptions);

	return {
		count: query.data?.count ?? 0,
		isLoading: query.isLoading,
	};
}
