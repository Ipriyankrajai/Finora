"use client";

import { Tag } from "lucide-react";

import { EmptyState } from "./empty-state";

interface TagsEmptyProps {
	onCreateTag: () => void;
}

/**
 * Empty state for the tags sidebar section.
 * Shows when user has no tags yet.
 */
export function TagsEmpty({ onCreateTag }: TagsEmptyProps) {
	return (
		<EmptyState
			action={{
				label: "Create Tag",
				onClick: onCreateTag,
			}}
			description="Create tags to categorize your transactions."
			icon={<Tag className="size-6 text-primary" />}
			title="No tags yet"
		/>
	);
}
