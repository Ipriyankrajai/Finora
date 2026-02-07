"use client";

import { Repeat, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { useTodayGenerated } from "@/hooks/use-recurring";

/**
 * Dismissible banner shown on the dashboard when recurring transactions
 * were auto-generated today. Shows count and links to the recurring page.
 * Dismissal persists for the current session only (useState).
 */
export function RecurringBanner() {
	const { count, isLoading } = useTodayGenerated();
	const [dismissed, setDismissed] = useState(false);

	if (isLoading || count === 0 || dismissed) {
		return null;
	}

	return (
		<div className="flex items-center gap-3 border border-primary/20 bg-primary/5 px-4 py-3">
			<Repeat className="size-4 shrink-0 text-primary" />
			<p className="flex-1 text-sm">
				<span className="font-medium">{count}</span> recurring transaction
				{count === 1 ? " was" : "s were"} generated today.{" "}
				<Link
					className="font-medium text-primary underline-offset-4 hover:underline"
					href={"/dashboard/recurring" as Route}
				>
					View rules
				</Link>
			</p>
			<button
				aria-label="Dismiss recurring transactions banner"
				className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
				onClick={() => setDismissed(true)}
				type="button"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}
