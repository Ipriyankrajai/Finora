"use client";

import {
	ChevronDown,
	ChevronRight,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTag, useTags } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";

import { TagChip } from "./tag-chip";
import { TagForm } from "./tag-form";

const COLLAPSED_STORAGE_KEY = "finora-tags-collapsed";

interface Tag {
	id: string;
	name: string;
	color: string;
}

/**
 * Tag management section for the sidebar.
 * Per CONTEXT.md: "Tag management lives in sidebar section"
 */
export function TagList() {
	const { tags, isLoading, error, refetch } = useTags();
	const deleteTag = useDeleteTag();

	// Collapsible state with localStorage persistence
	const [isCollapsed, setIsCollapsed] = useState(() => {
		if (typeof window === "undefined") {
			return false;
		}
		return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
	});

	// Form dialog state
	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [editingTag, setEditingTag] = useState<Tag | undefined>();

	// Delete confirmation dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingTag, setDeletingTag] = useState<Tag | undefined>();

	// Persist collapsed state
	const toggleCollapsed = () => {
		const newValue = !isCollapsed;
		setIsCollapsed(newValue);
		localStorage.setItem(COLLAPSED_STORAGE_KEY, String(newValue));
	};

	// Open create form
	const handleAddTag = () => {
		setFormMode("create");
		setEditingTag(undefined);
		setFormOpen(true);
	};

	// Open edit form
	const handleEditTag = (tag: Tag) => {
		setFormMode("edit");
		setEditingTag(tag);
		setFormOpen(true);
	};

	// Open delete confirmation
	const handleDeleteTag = (tag: Tag) => {
		setDeletingTag(tag);
		setDeleteDialogOpen(true);
	};

	// Confirm delete
	const confirmDelete = async () => {
		if (deletingTag) {
			await deleteTag.mutateAsync({ id: deletingTag.id });
			setDeleteDialogOpen(false);
			setDeletingTag(undefined);
		}
	};

	return (
		<div className="px-4 py-3">
			{/* Header */}
			<div className="mb-2 flex items-center justify-between">
				<button
					className="flex items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
					onClick={toggleCollapsed}
					type="button"
				>
					{isCollapsed ? (
						<ChevronRight className="size-3.5" />
					) : (
						<ChevronDown className="size-3.5" />
					)}
					Tags
				</button>
				<Button
					aria-label="Add tag"
					className="size-5"
					onClick={handleAddTag}
					size="icon-xs"
					variant="ghost"
				>
					<Plus className="size-3" />
				</Button>
			</div>

			{/* Content */}
			{!isCollapsed && (
				<div className="space-y-0.5">
					{/* Loading state */}
					{isLoading && (
						<div className="space-y-1.5">
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-6 w-5/6" />
						</div>
					)}

					{/* Error state */}
					{error && !isLoading && (
						<div className="text-destructive text-xs">
							<p>Failed to load tags</p>
							<Button
								className="h-auto p-0 text-xs"
								onClick={() => refetch()}
								size="xs"
								variant="link"
							>
								Retry
							</Button>
						</div>
					)}

					{/* Empty state */}
					{!(isLoading || error) && tags.length === 0 && (
						<p className="py-1 text-muted-foreground text-xs">
							No tags yet.{" "}
							<button
								className="text-primary hover:underline"
								onClick={handleAddTag}
								type="button"
							>
								Create one
							</button>
						</p>
					)}

					{/* Tag list */}
					{!(isLoading || error) && tags.length > 0 && (
						<ul className="space-y-0.5">
							{tags.map((tag) => (
								<li key={tag.id}>
									<div
										className={cn(
											"group flex items-center justify-between rounded px-2 py-1.5",
											"transition-colors hover:bg-muted/50"
										)}
									>
										<TagChip
											className="min-w-0 flex-1"
											color={tag.color}
											name={tag.name}
											size="sm"
										/>

										<DropdownMenu>
											<DropdownMenuTrigger
												render={
													<Button
														aria-label={`Options for ${tag.name}`}
														className={cn(
															"size-5 opacity-0 group-hover:opacity-100",
															"transition-opacity focus:opacity-100"
														)}
														size="icon-xs"
														variant="ghost"
													>
														<MoreHorizontal className="size-3" />
													</Button>
												}
											/>
											<DropdownMenuContent align="end" side="right">
												<DropdownMenuItem onClick={() => handleEditTag(tag)}>
													<Pencil className="mr-2 size-3.5" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDeleteTag(tag)}
													variant="destructive"
												>
													<Trash2 className="mr-2 size-3.5" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{/* Tag Form Dialog */}
			<TagForm
				mode={formMode}
				onOpenChange={setFormOpen}
				open={formOpen}
				tag={editingTag}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Delete Tag</DialogTitle>
						<DialogDescription className="pt-2">
							This will remove the tag from future use but keep it on existing
							transactions.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-4">
						<DialogClose
							render={
								<Button
									disabled={deleteTag.isPending}
									type="button"
									variant="outline"
								>
									Cancel
								</Button>
							}
						/>
						<Button
							disabled={deleteTag.isPending}
							onClick={confirmDelete}
							variant="destructive"
						>
							{deleteTag.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
