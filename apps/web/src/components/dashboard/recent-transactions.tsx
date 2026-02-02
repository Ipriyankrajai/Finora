"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileQuestion } from "lucide-react";
import Link from "next/link";

import { MoneyDisplay } from "@/components/shared/money-display";
import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate, formatTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

/**
 * Transaction data shape from the API
 */
interface TransactionTag {
	tag: {
		id: string;
		name: string;
		color: string;
	};
}

interface Transaction {
	id: string;
	type: "INCOME" | "EXPENSE";
	amountCents: bigint;
	date: Date;
	description: string | null;
	tags: TransactionTag[];
}

/**
 * Empty state when no transactions exist
 */
function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<FileQuestion className="mb-3 size-10 text-muted-foreground/50" />
			<h3 className="font-medium">No transactions yet</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Start tracking your expenses to see them here.
			</p>
			<Button asChild className="mt-4" size="sm" variant="outline">
				<Link href="/dashboard/transactions">Add transaction</Link>
			</Button>
		</div>
	);
}

/**
 * Stable keys for skeleton items (skeletons don't reorder)
 */
const SKELETON_KEYS = ["txn-1", "txn-2", "txn-3", "txn-4", "txn-5"];

/**
 * Loading skeleton for transactions
 */
function TransactionsSkeleton() {
	return (
		<div className="space-y-3">
			{SKELETON_KEYS.map((key) => (
				<div className="flex items-center gap-3" key={key}>
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 flex-1" />
					<Skeleton className="h-4 w-16" />
				</div>
			))}
		</div>
	);
}

/**
 * Single transaction row in the recent transactions list
 */
function TransactionItem({ transaction }: { transaction: Transaction }) {
	const { type, amountCents, date, description, tags } = transaction;
	const relativeDate = formatRelativeDate(new Date(date));
	const time = formatTime(new Date(date));

	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<MoneyDisplay
						cents={amountCents}
						className="font-medium"
						type={type}
					/>
					<span className="text-muted-foreground text-xs">
						{relativeDate} {time}
					</span>
				</div>
				{(description || tags.length > 0) && (
					<div className="flex items-center gap-2">
						{description && (
							<span className="max-w-[200px] truncate text-muted-foreground text-xs">
								{description}
							</span>
						)}
						{tags.slice(0, 3).map(({ tag }) => (
							<TagChip
								color={tag.color}
								key={tag.id}
								name={tag.name}
								size="sm"
							/>
						))}
						{tags.length > 3 && (
							<span className="text-muted-foreground text-xs">
								+{tags.length - 3} more
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Recent transactions widget for the dashboard.
 * Shows the last 5 transactions with date, amount, and tags.
 */
export function RecentTransactions() {
	const queryOptions = trpc.transaction.list.queryOptions({ limit: 5 });
	const { data, isLoading, error } = useQuery(queryOptions);

	const transactions = data?.items as Transaction[] | undefined;

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Recent Transactions</CardTitle>
				<Button asChild size="sm" variant="ghost">
					<Link href="/dashboard/transactions">
						View all <ArrowRight className="ml-1 size-3" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				{isLoading && <TransactionsSkeleton />}
				{error && (
					<p className="py-4 text-center text-muted-foreground text-sm">
						Failed to load transactions
					</p>
				)}
				{!(isLoading || error) && transactions?.length === 0 && <EmptyState />}
				{!(isLoading || error) && transactions && transactions.length > 0 && (
					<div className="divide-y">
						{transactions.map((transaction) => (
							<TransactionItem key={transaction.id} transaction={transaction} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
