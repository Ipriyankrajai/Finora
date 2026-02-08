"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

/**
 * Hook to fetch current user settings (name, email, currencyCode, hasCompletedOnboarding).
 */
export function useUserSettings() {
	const queryOptions = trpc.user.getSettings.queryOptions();
	return useQuery(queryOptions);
}

/**
 * Hook to update the user's display name.
 * Invalidates user settings cache on success.
 */
export function useUpdateProfile() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.user.updateProfile.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to update profile");
		},
		onSuccess: () => {
			toast.success("Profile updated");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0].includes("user") &&
					query.queryKey[0].includes("getSettings"),
			});
		},
	});
}

/**
 * Hook to update the user's preferred currency code.
 * Invalidates user settings cache on success.
 */
export function useUpdateCurrency() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.user.updateCurrency.mutationOptions();

	return useMutation({
		...mutationOptions,
		onError: () => {
			toast.error("Failed to update currency");
		},
		onSuccess: () => {
			toast.success("Currency updated");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0].includes("user") &&
					query.queryKey[0].includes("getSettings"),
			});
		},
	});
}

/**
 * Hook to mark onboarding as complete.
 * Invalidates user settings cache on success.
 */
export function useCompleteOnboarding() {
	const queryClient = useQueryClient();
	const mutationOptions = trpc.user.completeOnboarding.mutationOptions();

	return useMutation({
		...mutationOptions,
		onSettled: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0].includes("user") &&
					query.queryKey[0].includes("getSettings"),
			});
		},
	});
}
