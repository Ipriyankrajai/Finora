"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface EmptyStateAction {
	label: string;
	onClick?: () => void;
	href?: string;
}

interface EmptyStateProps {
	icon: ReactNode;
	title: string;
	description: string;
	action?: EmptyStateAction;
}

/**
 * Reusable empty state component with icon, title, description, and optional CTA.
 * Used across dashboard, transactions, loans, and tags pages.
 */
export function EmptyState({
	icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
				{icon}
			</div>
			<h3 className="mb-2 font-semibold text-lg">{title}</h3>
			<p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">
				{description}
			</p>
			{action && <EmptyStateActionButton action={action} />}
		</div>
	);
}

function EmptyStateActionButton({ action }: { action: EmptyStateAction }) {
	if (action.href) {
		return (
			<Button asChild>
				<Link href={action.href as "/dashboard"}>{action.label}</Link>
			</Button>
		);
	}

	return <Button onClick={action.onClick}>{action.label}</Button>;
}
