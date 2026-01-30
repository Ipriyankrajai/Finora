"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { useTags, useDeleteTag } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
  });

  // Form dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingTag, setEditingTag] = React.useState<Tag | undefined>();

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingTag, setDeletingTag] = React.useState<Tag | undefined>();

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
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
          Tags
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="size-5"
          onClick={handleAddTag}
          aria-label="Add tag"
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
            <div className="text-xs text-destructive">
              <p>Failed to load tags</p>
              <Button
                variant="link"
                size="xs"
                className="h-auto p-0 text-xs"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && tags.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">
              No tags yet.{" "}
              <button
                onClick={handleAddTag}
                className="text-primary hover:underline"
              >
                Create one
              </button>
            </p>
          )}

          {/* Tag list */}
          {!isLoading && !error && tags.length > 0 && (
            <ul className="space-y-0.5">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <div
                    className={cn(
                      "group flex items-center justify-between rounded px-2 py-1.5",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <TagChip
                      name={tag.name}
                      color={tag.color}
                      size="sm"
                      className="flex-1 min-w-0"
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className={cn(
                              "size-5 opacity-0 group-hover:opacity-100",
                              "transition-opacity focus:opacity-100"
                            )}
                            aria-label={`Options for ${tag.name}`}
                          >
                            <MoreHorizontal className="size-3" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" side="right">
                        <DropdownMenuItem
                          onClick={() => handleEditTag(tag)}
                        >
                          <Pencil className="mr-2 size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteTag(tag)}
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
        tag={editingTag}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription className="pt-2">
              This will remove the tag from future use but keep it on existing transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleteTag.isPending}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTag.isPending}
            >
              {deleteTag.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
