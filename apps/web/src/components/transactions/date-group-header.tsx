"use client";

import { cn } from "@/lib/utils";

interface DateGroupHeaderProps {
	label: string; // "Today", "Yesterday", "Jan 28"
	className?: string;
}

/**
 * Sticky header for date groups in transaction list.
 * Displays relative date label ("Today", "Yesterday") or formatted date.
 */
export function DateGroupHeader({ label, className }: DateGroupHeaderProps) {
	return (
		<div
			className={cn(
				"sticky top-0 z-10",
				"bg-background/95 backdrop-blur",
				"px-4 py-2",
				"border-border/50 border-b",
				className
			)}
		>
			<h3 className="font-medium text-muted-foreground text-sm">{label}</h3>
		</div>
	);
}
