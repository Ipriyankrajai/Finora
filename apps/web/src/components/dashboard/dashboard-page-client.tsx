"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CreditCard, Plus } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useState } from "react";

import { DashboardEmpty } from "@/components/empty-states/dashboard-empty";
import { MoneyDisplay } from "@/components/shared/money-display";
import { TagChip } from "@/components/tags/tag-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type LoanOverview, useDashboard } from "@/hooks/use-dashboard";
import { useTags } from "@/hooks/use-tags";
import { formatRelativeDate, formatTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";
import { LoanAmortizationChart } from "./loan-amortization-chart";
import { LoanOverviewCard } from "./loan-overview-card";
import { MonthlySummary } from "./monthly-summary";
import { QuickAddFAB } from "./quick-add-fab";
import { RecentTransactions } from "./recent-transactions";
import { RecurringBanner } from "./recurring-banner";
import { SpendingPieChart } from "./spending-pie-chart";
import { SpendingTimeline } from "./spending-timeline";
import { WhatIfSimulator } from "./what-if-simulator";

/**
 * Stable keys for skeleton items (skeletons don't reorder)
 */
const SUMMARY_SKELETON_KEYS = ["income", "expenses", "net"];
const TAG_SKELETON_KEYS = ["tag-1", "tag-2", "tag-3"];
const LOAN_SKELETON_KEYS = ["loan-1", "loan-2"];

/** No-op handler for disabled/static components */
function noop() {
	// Intentionally empty - used for static card displays
}

/**
 * Loading skeleton for dashboard summary
 */
function SummarySkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			{SUMMARY_SKELETON_KEYS.map((key) => (
				<Card key={key}>
					<CardHeader className="pb-2">
						<Skeleton className="h-4 w-16" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-24" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

/**
 * Loading skeleton for pie chart
 */
function ChartSkeleton() {
	return (
		<div className="flex h-[300px] items-center justify-center">
			<Skeleton className="size-[200px] rounded-full" />
		</div>
	);
}

/**
 * Loading skeleton for loans section
 */
function LoansSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{LOAN_SKELETON_KEYS.map((key) => (
				<Card key={key}>
					<CardHeader className="pb-2">
						<Skeleton className="h-5 w-32" />
					</CardHeader>
					<CardContent className="space-y-3">
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-1.5 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

/**
 * Transaction item for tag expansion view
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

function TagTransactionItem({ transaction }: { transaction: Transaction }) {
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
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Expanded tag transactions view
 * Shows transactions for a selected tag below the pie chart
 */
function TagTransactionsExpanded({
	tagId,
	tagName,
	onClose,
}: {
	tagId: string | "other";
	tagName: string;
	onClose: () => void;
}) {
	// For "other", we'd need a special endpoint - for now just show a message
	// For specific tags, filter by tagId
	const isOther = tagId === "other";
	const queryOptions = trpc.transaction.list.queryOptions(
		isOther ? { limit: 10 } : { tagId, limit: 10 }
	);
	const { data, isLoading } = useQuery({
		...queryOptions,
		enabled: !isOther,
	});

	const transactions = data?.items as Transaction[] | undefined;

	return (
		<div className="mt-4 rounded-md border bg-muted/30 p-4">
			<div className="mb-3 flex items-center justify-between">
				<h4 className="font-medium text-sm">{tagName} Transactions</h4>
				<button
					className="text-muted-foreground text-xs hover:text-foreground"
					onClick={onClose}
					type="button"
				>
					Close
				</button>
			</div>

			{isOther && (
				<p className="py-4 text-center text-muted-foreground text-sm">
					"Other" includes all tags beyond the top 5. View all transactions to
					filter by specific tags.
				</p>
			)}

			{!isOther && isLoading && (
				<div className="space-y-2 py-2">
					{TAG_SKELETON_KEYS.map((key) => (
						<div className="flex items-center gap-3" key={key}>
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 flex-1" />
						</div>
					))}
				</div>
			)}

			{!(isOther || isLoading) && transactions?.length === 0 && (
				<p className="py-4 text-center text-muted-foreground text-sm">
					No transactions found for this tag
				</p>
			)}

			{!(isOther || isLoading) && transactions && transactions.length > 0 && (
				<div className="divide-y">
					{transactions.map((transaction) => (
						<TagTransactionItem
							key={transaction.id}
							transaction={transaction}
						/>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Memoized amortization chart section.
 * Extracted to prevent re-renders when WhatIfSimulator state changes.
 * Per Vercel rule `rerender-memo`: Extract expensive work into memoized components.
 */
const AmortizationSection = memo(function AmortizationSection({
	loanId,
	loanName,
}: {
	loanId: string;
	loanName: string;
}) {
	return (
		<div className="overflow-hidden border bg-card">
			<div className="border-b bg-muted/30 px-5 py-3">
				<h4 className="font-semibold">Amortization Schedule</h4>
				<p className="text-muted-foreground text-sm">
					See how your balance decreases over time
				</p>
			</div>
			<div className="p-5">
				<LoanAmortizationChart loanId={loanId} loanName={loanName} />
			</div>
		</div>
	);
});

/**
 * Memoized close button to prevent recreation.
 */
const CloseDetailsButton = memo(function CloseDetailsButton({
	onClose,
}: {
	onClose: () => void;
}) {
	return (
		<div className="text-center">
			<button
				className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background px-4 py-2 text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:text-foreground"
				onClick={onClose}
				type="button"
			>
				Collapse details
			</button>
		</div>
	);
});

/**
 * Expanded loan view with what-if simulator and amortization chart.
 * Only shown for loans that are not paid off.
 * Components are memoized to prevent re-renders when slider state changes.
 */
function LoanExpanded({
	loan,
	onClose,
}: {
	loan: LoanOverview;
	onClose: () => void;
}) {
	// We need additional loan data for the simulator
	// Fetch the full loan details to get monthlyPaymentCents and annualRatePercent
	const queryOptions = trpc.loan.getById.queryOptions({ id: loan.id });
	const { data: fullLoan, isLoading } = useQuery(queryOptions);

	// Don't show what-if for paid off loans
	if (loan.balanceCents === 0n) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="mt-6 space-y-4">
				<Skeleton className="h-[360px] w-full rounded-xl" />
				<Skeleton className="h-[300px] w-full rounded-xl" />
			</div>
		);
	}

	if (!fullLoan) {
		return (
			<div className="mt-6 rounded-xl border bg-muted/30 p-6 text-center">
				<p className="text-muted-foreground">Could not load loan details</p>
				<button
					className="mt-3 text-primary text-sm hover:underline"
					onClick={onClose}
					type="button"
				>
					Close
				</button>
			</div>
		);
	}

	return (
		<div className="fade-in slide-in-from-top-4 mt-6 animate-in space-y-6 duration-300">
			{/* What-If Simulator - has internal state, isolated re-renders */}
			<WhatIfSimulator
				annualRatePercent={fullLoan.annualRatePercent}
				balanceCents={fullLoan.balanceCents}
				monthlyPaymentCents={fullLoan.monthlyPaymentCents}
				name={fullLoan.name}
			/>

			{/* Amortization Chart - memoized, won't re-render on slider change */}
			<AmortizationSection loanId={loan.id} loanName={loan.name} />

			{/* Close button - memoized */}
			<CloseDetailsButton onClose={onClose} />
		</div>
	);
}

/**
 * Dashboard page client component.
 * Orchestrates monthly summary, spending charts, loans section, and quick-add FAB.
 * Per CONTEXT.md:
 * - Monthly summary (income/expense/net) prominently at top
 * - Below: spending charts, then loans section
 * - Responsive: stack vertically on mobile/tablet
 * - Quick-add FAB always visible in bottom-right
 */
export function DashboardPageClient() {
	const {
		monthlySummary,
		topTags,
		otherTagsTotal,
		loanOverview,
		isLoading,
		error,
	} = useDashboard();
	const { tags } = useTags();
	const [expandedTag, setExpandedTag] = useState<{
		id: string | "other";
		name: string;
	} | null>(null);
	const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

	// Determine if dashboard is empty (new user with no data)
	// Show checklist until all 3 items done OR user skips
	const hasTransactions =
		!isLoading &&
		monthlySummary &&
		(monthlySummary.incomeCents > 0n || monthlySummary.expenseCents > 0n);
	const hasTags = tags.length > 0;
	const checklistComplete = hasTransactions && hasTags;
	const isDashboardEmpty = !(isLoading || checklistComplete);

	// Handle pie chart click
	const handleTagClick = (tagId: string | "other") => {
		if (expandedTag?.id === tagId) {
			// Close if clicking same tag
			setExpandedTag(null);
		} else {
			// Find tag name for display
			const tag = topTags.find((t) => t.tagId === tagId);
			const tagName = tag?.tagName ?? (tagId === "other" ? "Other" : "Unknown");
			setExpandedTag({ id: tagId, name: tagName });
		}
	};

	// Handle close tag
	const handleCloseExpandedTag = () => {
		setExpandedTag(null);
	};

	// Handle loan card click - only allow toggle for active loans
	const handleLoanToggle = (loanId: string) => {
		const loan = loanOverview.find((l) => l.id === loanId);
		// Don't expand paid off loans
		if (loan && loan.balanceCents === 0n) {
			return;
		}
		setExpandedLoanId(expandedLoanId === loanId ? null : loanId);
	};

	// Handle close loan - stable reference via useCallback
	// Per Vercel rule `rerender-functional-setstate`: using functional form isn't needed here
	// but `useCallback` ensures stable reference for memoized children
	const handleCloseLoan = useCallback(() => {
		setExpandedLoanId(null);
	}, []);

	if (error) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">Failed to load dashboard data</p>
				<p className="mt-1 text-muted-foreground/70 text-sm">{error.message}</p>
			</div>
		);
	}

	// Show guided checklist until all items completed or skipped
	if (isDashboardEmpty) {
		return (
			<div className="space-y-6">
				<DashboardEmpty
					tagCount={tags.length}
					transactionCount={hasTransactions ? 1 : 0}
				/>
				<QuickAddFAB />
			</div>
		);
	}

	// Render monthly summary section
	const renderMonthlySummary = () => {
		if (isLoading) {
			return <SummarySkeleton />;
		}
		if (monthlySummary) {
			return (
				<MonthlySummary
					expenseCents={monthlySummary.expenseCents}
					incomeCents={monthlySummary.incomeCents}
					netCents={monthlySummary.netCents}
				/>
			);
		}
		return null;
	};

	// Get expanded loan if any
	const expandedLoan = expandedLoanId
		? loanOverview.find((l) => l.id === expandedLoanId)
		: null;

	// Separate active loans from paid off loans
	const activeLoans = loanOverview.filter((l) => l.balanceCents > 0n);
	const paidOffLoans = loanOverview.filter((l) => l.balanceCents === 0n);

	// Render loans section - extracted to avoid nested ternary
	const renderLoansSection = () => {
		if (isLoading) {
			return <LoansSkeleton />;
		}

		if (loanOverview.length === 0) {
			return (
				<div className="border-2 border-border/60 border-dashed bg-linear-to-br from-card/80 to-transparent p-8 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center bg-primary/10">
						<CreditCard className="size-6 text-primary" />
					</div>
					<h3 className="mb-2 font-semibold text-lg">No loans yet</h3>
					<p className="mx-auto mb-4 max-w-sm text-muted-foreground text-sm">
						Track your loans to see projected payoff dates and explore what-if
						scenarios for faster debt freedom.
					</p>
					<Link
						className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:from-emerald-500 hover:to-emerald-400"
						href="/dashboard/loans"
					>
						<Plus className="size-4" />
						Add your first loan
					</Link>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				{/* Active loans */}
				{activeLoans.length > 0 && (
					<div className="space-y-4">
						{activeLoans.length > 0 && paidOffLoans.length > 0 && (
							<h3 className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
								<span className="size-2 rounded-full bg-amber-500" />
								Active ({activeLoans.length})
							</h3>
						)}
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{activeLoans.map((loan) => (
								<LoanOverviewCard
									isExpanded={expandedLoanId === loan.id}
									key={loan.id}
									loan={loan}
									onToggle={() => handleLoanToggle(loan.id)}
								/>
							))}
						</div>
					</div>
				)}

				{/* Expanded loan details (what-if + chart) */}
				{expandedLoan && expandedLoan.balanceCents > 0n && (
					<LoanExpanded loan={expandedLoan} onClose={handleCloseLoan} />
				)}

				{/* Paid off loans */}
				{paidOffLoans.length > 0 && (
					<div className="space-y-4">
						{activeLoans.length > 0 && (
							<h3 className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
								<span className="size-2 rounded-full bg-emerald-500" />
								Completed ({paidOffLoans.length})
							</h3>
						)}
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{paidOffLoans.map((loan) => (
								<LoanOverviewCard
									isExpanded={false}
									key={loan.id}
									loan={loan}
									onToggle={noop}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Monthly Summary - prominently at top */}
			{renderMonthlySummary()}

			{/* Recurring transactions banner */}
			<RecurringBanner />

			{/* Two-column grid on desktop: pie chart left, recent transactions right */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Spending Pie Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Spending by Category</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<ChartSkeleton />
						) : (
							<>
								<SpendingPieChart
									onTagClick={handleTagClick}
									otherTagsTotal={otherTagsTotal}
									topTags={topTags}
								/>
								{/* Expanded tag transactions */}
								{expandedTag && (
									<TagTransactionsExpanded
										onClose={handleCloseExpandedTag}
										tagId={expandedTag.id}
										tagName={expandedTag.name}
									/>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Recent Transactions */}
				<RecentTransactions />
			</div>

			{/* Spending Timeline - full width */}
			<SpendingTimeline />

			{/* Loans Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center bg-primary/10">
							<CreditCard className="size-4 text-primary" />
						</div>
						<div>
							<h2 className="font-semibold text-lg">Your Loans</h2>
							{!isLoading && loanOverview.length > 0 && (
								<p className="text-muted-foreground text-xs">
									{activeLoans.length} active
									{paidOffLoans.length > 0 &&
										` · ${paidOffLoans.length} completed`}
								</p>
							)}
						</div>
					</div>
					{!isLoading && loanOverview.length > 0 && (
						<Link
							className="flex items-center gap-1.5 text-primary text-sm hover:underline"
							href="/dashboard/loans"
						>
							View all
							<ChevronRight className="size-4" />
						</Link>
					)}
				</div>

				{renderLoansSection()}
			</div>

			{/* Quick Add FAB - always visible */}
			<QuickAddFAB />
		</div>
	);
}
