"use client";

import { Check, ChevronDown, Tag } from "lucide-react";
import * as React from "react";

import { useTags } from "@/hooks/use-tags";
import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
export function TagMultiSelect({ value, onChange, className }: TagMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2",
          "rounded-none border border-border bg-background px-3 text-sm",
          "ring-offset-background",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          value.length === 0 && "text-muted-foreground",
          className,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <Tag className="size-4 shrink-0" />
          <span className="truncate">{getDisplayText()}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading tags...
          </div>
        ) : tags.length === 0 ? (
          <div className="py-6 text-center">
            <Tag className="mx-auto mb-2 size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No tags yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create tags in the sidebar
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {tags.map((tag) => {
              const isSelected = value.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggle(tag.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5",
                    "text-sm transition-colors",
                    "hover:bg-muted focus:bg-muted focus:outline-none",
                    isSelected && "bg-muted/50",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    tabIndex={-1}
                    className="pointer-events-none"
                  />
                  <TagChip name={tag.name} color={tag.color} size="sm" />
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
