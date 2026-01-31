"use client";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface FilterChipProps {
	label: string;
	onRemove: () => void;
	className?: string;
}

function FilterChip({ label, onRemove, className }: FilterChipProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1",
				"rounded-full bg-muted px-2.5 py-0.5",
				"text-muted-foreground text-xs",
				className
			)}
			data-slot="filter-chip"
		>
			<span className="truncate">{label}</span>
			<button
				aria-label={`Remove ${label} filter`}
				className={cn(
					"ml-0.5 rounded-full p-0.5",
					"hover:bg-muted-foreground/20",
					"focus:outline-none focus:ring-1 focus:ring-ring",
					"transition-colors"
				)}
				onClick={onRemove}
				type="button"
			>
				<XIcon className="size-3" />
			</button>
		</span>
	);
}

export { FilterChip };
export type { FilterChipProps };
