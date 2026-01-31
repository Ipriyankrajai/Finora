"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

/**
 * Tag type returned from API
 */
interface Tag {
	id: string;
	name: string;
	color: string;
	userId: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Hook to fetch user's active tags
 */
export function useTags() {
	const queryOptions = trpc.tag.list.queryOptions();

	const { data, isLoading, error, refetch } = useQuery(queryOptions);

	return {
		tags: data ?? [],
		isLoading,
		error,
		refetch,
	};
}

/**
 * Hook to create a new tag with optimistic update
 */
export function useCreateTag() {
	const queryClient = useQueryClient();
	const queryOptions = trpc.tag.list.queryOptions();
	const mutationOptions = trpc.tag.create.mutationOptions();

	return useMutation({
		...mutationOptions,
		onMutate: async (newTag) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: queryOptions.queryKey });

			// Snapshot the previous value
			const previousTags = queryClient.getQueryData<Tag[]>(
				queryOptions.queryKey
			);

			// Optimistically add the new tag
			const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
			const optimisticTag: Tag = {
				id: tempId,
				name: newTag.name,
				color: newTag.color,
				userId: "temp",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			queryClient.setQueryData<Tag[]>(queryOptions.queryKey, (old) =>
				old
					? [...old, optimisticTag].sort((a, b) => a.name.localeCompare(b.name))
					: [optimisticTag]
			);

			return { previousTags };
		},
		onError: (_err, _newTag, context) => {
			// Rollback to previous value
			if (context?.previousTags) {
				queryClient.setQueryData(queryOptions.queryKey, context.previousTags);
			}
			toast.error("Failed to create tag");
		},
		onSuccess: () => {
			toast.success("Tag created");
		},
		onSettled: () => {
			// Refetch to sync with server
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});
}

/**
 * Hook to update an existing tag with optimistic update
 */
export function useUpdateTag() {
	const queryClient = useQueryClient();
	const queryOptions = trpc.tag.list.queryOptions();
	const mutationOptions = trpc.tag.update.mutationOptions();

	return useMutation({
		...mutationOptions,
		onMutate: async (updatedTag) => {
			await queryClient.cancelQueries({ queryKey: queryOptions.queryKey });

			const previousTags = queryClient.getQueryData<Tag[]>(
				queryOptions.queryKey
			);

			queryClient.setQueryData<Tag[]>(queryOptions.queryKey, (old) =>
				old
					?.map((tag) =>
						tag.id === updatedTag.id
							? { ...tag, ...updatedTag, updatedAt: new Date() }
							: tag
					)
					.sort((a, b) => a.name.localeCompare(b.name))
			);

			return { previousTags };
		},
		onError: (_err, _updatedTag, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(queryOptions.queryKey, context.previousTags);
			}
			toast.error("Failed to update tag");
		},
		onSuccess: () => {
			toast.success("Tag updated");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});
}

/**
 * Hook to delete (soft delete) a tag with optimistic update
 */
export function useDeleteTag() {
	const queryClient = useQueryClient();
	const queryOptions = trpc.tag.list.queryOptions();
	const mutationOptions = trpc.tag.delete.mutationOptions();

	return useMutation({
		...mutationOptions,
		onMutate: async (deleteInput) => {
			await queryClient.cancelQueries({ queryKey: queryOptions.queryKey });

			const previousTags = queryClient.getQueryData<Tag[]>(
				queryOptions.queryKey
			);

			// Optimistically remove the tag (soft delete hides from list)
			queryClient.setQueryData<Tag[]>(queryOptions.queryKey, (old) =>
				old?.filter((tag) => tag.id !== deleteInput.id)
			);

			return { previousTags };
		},
		onError: (_err, _deleteInput, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(queryOptions.queryKey, context.previousTags);
			}
			toast.error("Failed to delete tag");
		},
		onSuccess: () => {
			toast.success("Tag deleted");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});
}
