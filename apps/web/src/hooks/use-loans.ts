"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

/**
 * Loan with calculated balance and interest totals
 * Note: loanType is not stored in database - loan schema only has interestType (SIMPLE/COMPOUND)
 */
export interface LoanWithBalance {
  id: string;
  name: string;
  interestType: "SIMPLE" | "COMPOUND";
  principalCents: bigint;
  balanceCents: bigint;
  totalInterestPaidCents: bigint;
  annualRatePercent: number;
  termMonths: number;
  monthlyPaymentCents: bigint;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cache data type helper for loan list queries
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoanListCache = any[];

/**
 * Hook to fetch all loans for the current user with calculated balances.
 * Sorted by balanceCents descending (highest first per CONTEXT.md).
 */
export function useLoans() {
  const queryOptions = trpc.loan.list.queryOptions();
  const query = useQuery(queryOptions);

  // Sort loans by balance descending (highest balance first - snowball style)
  const sortedLoans = [...(query.data ?? [])].sort((a, b) => {
    const balanceA = Number(a.balanceCents);
    const balanceB = Number(b.balanceCents);
    return balanceB - balanceA;
  }) as LoanWithBalance[];

  return {
    loans: sortedLoans,
    isLoading: query.isLoading,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch a single loan with full details, payments, and projection.
 */
export function useLoan(id: string) {
  const queryOptions = trpc.loan.getById.queryOptions({ id });
  const query = useQuery({
    ...queryOptions,
    enabled: !!id,
  });

  return {
    loan: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to create a new loan with optimistic update.
 * Input: { name, loanType, interestType, principal, annualRatePercent, termMonths, monthlyPayment, startDate }
 */
export function useCreateLoan() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.loan.create.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (newLoan) => {
      // Cancel any outgoing refetches for all loan.list queries
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      // Snapshot the previous values for all loan.list queries
      const previousQueries = queryClient.getQueriesData<LoanListCache>({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      // Create optimistic loan
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const now = new Date();
      const optimisticLoan = {
        id: tempId,
        name: newLoan.name,
        interestType: newLoan.interestType ?? "COMPOUND",
        principalCents: BigInt(Math.round(parseFloat(newLoan.principal) * 100)),
        balanceCents: BigInt(Math.round(parseFloat(newLoan.principal) * 100)),
        totalInterestPaidCents: BigInt(0),
        annualRatePercent: newLoan.annualRatePercent,
        termMonths: newLoan.termMonths,
        monthlyPaymentCents: BigInt(Math.round(parseFloat(newLoan.monthlyPayment) * 100)),
        startDate: newLoan.startDate,
        userId: "temp",
        createdAt: now,
        updatedAt: now,
      };

      // Optimistically add to all matching caches
      for (const [queryKey] of previousQueries) {
        queryClient.setQueryData<LoanListCache>(queryKey, (old) => {
          if (!old) return [optimisticLoan];
          return [optimisticLoan, ...old];
        });
      }

      return { previousQueries };
    },
    onError: (_err, _newLoan, context) => {
      // Rollback to previous values
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to create loan");
    },
    onSuccess: () => {
      toast.success("Loan created");
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });
    },
  });
}

/**
 * Hook to update an existing loan with optimistic update.
 * Input: { id, name?, loanType?, interestType?, principal?, annualRatePercent?, termMonths?, monthlyPayment?, startDate? }
 */
export function useUpdateLoan() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.loan.update.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (updatedLoan) => {
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      const previousQueries = queryClient.getQueriesData<LoanListCache>({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      const now = new Date();

      // Optimistically update in all matching caches
      for (const [queryKey] of previousQueries) {
        queryClient.setQueryData<LoanListCache>(queryKey, (old) => {
          if (!old) return old;
          return old.map((loan) => {
            if (loan.id !== updatedLoan.id) return loan;
            return {
              ...loan,
              name: updatedLoan.name ?? loan.name,
              interestType: updatedLoan.interestType ?? loan.interestType,
              principalCents: updatedLoan.principal
                ? BigInt(Math.round(parseFloat(updatedLoan.principal) * 100))
                : loan.principalCents,
              annualRatePercent: updatedLoan.annualRatePercent ?? loan.annualRatePercent,
              termMonths: updatedLoan.termMonths ?? loan.termMonths,
              monthlyPaymentCents: updatedLoan.monthlyPayment
                ? BigInt(Math.round(parseFloat(updatedLoan.monthlyPayment) * 100))
                : loan.monthlyPaymentCents,
              startDate: updatedLoan.startDate ?? loan.startDate,
              updatedAt: now,
            };
          });
        });
      }

      return { previousQueries };
    },
    onError: (_err, _updatedLoan, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to update loan");
    },
    onSuccess: () => {
      toast.success("Loan updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });
    },
  });
}

/**
 * Hook to delete a loan with optimistic update.
 * Input: { id }
 */
export function useDeleteLoan() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.loan.delete.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async (deleteInput) => {
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      const previousQueries = queryClient.getQueriesData<LoanListCache>({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });

      // Optimistically remove from all matching caches
      for (const [queryKey] of previousQueries) {
        queryClient.setQueryData<LoanListCache>(queryKey, (old) => {
          if (!old) return old;
          return old.filter((loan) => loan.id !== deleteInput.id);
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
      toast.error("Failed to delete loan");
    },
    onSuccess: () => {
      toast.success("Loan deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan") &&
          query.queryKey[0].includes("list"),
      });
    },
  });
}

/**
 * Payment result type returned from addPayment mutation
 */
export type PaymentResult = {
  id: string;
  loanId: string;
  amountCents: bigint;
  principalCents: bigint;
  interestCents: bigint;
  isExtra: boolean;
  paidAt: Date;
};

/**
 * Hook to add a payment to a loan with optimistic cache invalidation.
 * Server calculates principal/interest split based on current balance.
 * Input: { loanId, amount (string), paidAt, isExtra }
 */
export function useAddPayment() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.loan.addPayment.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async () => {
      // Cancel queries for loan list and specific loan
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan"),
      });

      // Snapshot for rollback - capture both list and getById queries
      const previousQueries = queryClient.getQueriesData({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan"),
      });

      // Note: We don't optimistically update calculated fields
      // Server calculates principal/interest split, balance, etc.
      // Just show loading state in UI

      return { previousQueries };
    },
    onError: (_err, _newPayment, context) => {
      // Rollback all loan queries
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to log payment");
    },
    onSuccess: () => {
      toast.success("Payment logged");
    },
    onSettled: () => {
      // Invalidate both loan.list and loan.getById queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan"),
      });
    },
  });
}

/**
 * Hook to delete a payment from a loan with cache invalidation.
 * Balance is recalculated server-side after deletion.
 * Input: { id }
 */
export function useDeletePayment() {
  const queryClient = useQueryClient();
  const mutationOptions = trpc.loan.deletePayment.mutationOptions();

  return useMutation({
    ...mutationOptions,
    onMutate: async () => {
      // Cancel all loan queries
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan"),
      });

      // Snapshot for rollback
      const previousQueries = queryClient.getQueriesData({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan"),
      });

      return { previousQueries };
    },
    onError: (_err, _deleteInput, context) => {
      // Rollback all loan queries
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to delete payment");
    },
    onSuccess: () => {
      toast.success("Payment deleted");
    },
    onSettled: () => {
      // Invalidate all loan queries to refresh balance calculations
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey[0]) &&
          query.queryKey[0].includes("loan"),
      });
    },
  });
}
