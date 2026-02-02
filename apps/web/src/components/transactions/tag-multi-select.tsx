"use client";

import { ChevronDown, Tag } from "lucide-react";
import { useState } from "react";

import { TagChip } from "@/components/tags/tag-chip";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useTags } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";

interface TagMultiSelectProps {
	value: string[]; // Selected tag IDs
	onChange: (tagIds: string[]) => void;
	className?: string;
}

/**
 * Multi-tag selection dropdown with checkboxes.
 * Per CONTEXT.md: "Dropdown with checkboxes - click to open, check tags to select"
 */
export function TagMultiSelect({
	value,
	onChange,
	className,
}: TagMultiSelectProps) {
	const [open, setOpen] = useState(false);
	const { tags, isLoading } = useTags();

	const handleToggle = (tagId: string) => {
		if (value.includes(tagId)) {
			onChange(value.filter((id) => id !== tagId));
		} else {
			onChange([...value, tagId]);
		}
	};

	// Get display text for trigger button
	const getDisplayText = () => {
		if (value.length === 0) {
			return "Select tags";
		}
		if (value.length === 1) {
			const tag = tags.find((t) => t.id === value[0]);
			return tag?.name ?? "1 tag";
		}
		return `${value.length} tags`;
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger
				className={cn(
					"flex h-9 w-full items-center justify-between gap-2",
					"rounded-none border border-border bg-background px-3 text-sm",
					"ring-offset-background",
					"focus:outline-none focus:ring-1 focus:ring-ring",
					"disabled:cursor-not-allowed disabled:opacity-50",
					value.length === 0 && "text-muted-foreground",
					className
				)}
			>
				<span className="flex items-center gap-2 truncate">
					<Tag className="size-4 shrink-0" />
					<span className="truncate">{getDisplayText()}</span>
				</span>
				<ChevronDown className="size-4 shrink-0 opacity-50" />
			</PopoverTrigger>
			<PopoverContent align="start" className="w-56 p-2">
				{isLoading && (
					<div className="py-6 text-center text-muted-foreground text-sm">
						Loading tags...
					</div>
				)}
				{!isLoading && tags.length === 0 && (
					<div className="py-6 text-center">
						<Tag className="mx-auto mb-2 size-6 text-muted-foreground" />
						<p className="text-muted-foreground text-sm">No tags yet</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Create tags in the sidebar
						</p>
					</div>
				)}
				{!isLoading && tags.length > 0 && (
					<div className="space-y-1">
						{tags.map((tag) => {
							const isSelected = value.includes(tag.id);
							return (
								<button
									className={cn(
										"flex w-full items-center gap-2 rounded-sm px-2 py-1.5",
										"text-sm transition-colors",
										"hover:bg-muted focus:bg-muted focus:outline-none",
										isSelected && "bg-muted/50"
									)}
									key={tag.id}
									onClick={() => handleToggle(tag.id)}
									type="button"
								>
									<Checkbox
										checked={isSelected}
										className="pointer-events-none"
										tabIndex={-1}
									/>
									<TagChip color={tag.color} name={tag.name} size="sm" />
								</button>
							);
						})}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
