"use client";

import { format } from "date-fns";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type SpendingTrendDataPoint,
	useSpendingTrend,
} from "@/hooks/use-dashboard";
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCents } from "@/lib/format";

interface SpendingTimelineProps {
	initialGranularity?: "weekly" | "daily";
	months?: number;
}

/**
 * Chart data structure with numeric values for Recharts.
 */
interface ChartData {
	date: string; // Formatted date for display
	rawDate: Date;
	income: number; // Dollar amount (not cents)
	expenses: number; // Dollar amount (not cents)
	incomeCents: bigint;
	expenseCents: bigint;
}

/**
 * Custom tooltip props from Recharts content prop
 */
interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ payload: ChartData; dataKey: string; color: string }>;
	label?: string;
}

/**
 * Custom tooltip component for timeline chart.
 * Shows date, income, and expenses with formatting.
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
	const { data: settings } = useUserSettings();
	const currencySymbol = settings?.currencySymbol ?? "$";

	if (!(active && payload?.length)) {
		return null;
	}
	const data = payload[0]?.payload;
	if (!data) {
		return null;
	}

	return (
		<div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
			<p className="mb-1 font-medium">{data.date}</p>
			<p className="text-green-600">
				Income: {formatCents(data.incomeCents, currencySymbol)}
			</p>
			<p className="text-red-600">
				Expenses: {formatCents(data.expenseCents, currencySymbol)}
			</p>
		</div>
	);
}

/**
 * Empty state when no spending data exists.
 */
function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<FileQuestion className="mb-4 size-12 text-muted-foreground/50" />
			<h3 className="font-medium text-lg">No transactions in this period</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Your spending trend will appear here once you log some transactions.
			</p>
		</div>
	);
}

/**
 * Loading skeleton for timeline chart
 */
function TimelineSkeleton() {
	return (
		<div className="flex h-[300px] items-center justify-center">
			<div className="h-[200px] w-full">
				<Skeleton className="h-full w-full" />
			</div>
		</div>
	);
}

/**
 * Toggle button component for granularity selection
 */
function GranularityToggle({
	granularity,
	onChange,
}: {
	granularity: "weekly" | "daily";
	onChange: (value: "weekly" | "daily") => void;
}) {
	return (
		<div className="flex gap-1 rounded-md border bg-muted p-1">
			<button
				className={`rounded px-3 py-1 text-sm transition-colors ${
					granularity === "weekly"
						? "bg-background font-medium shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				}`}
				onClick={() => onChange("weekly")}
				type="button"
			>
				Weekly
			</button>
			<button
				className={`rounded px-3 py-1 text-sm transition-colors ${
					granularity === "daily"
						? "bg-background font-medium shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				}`}
				onClick={() => onChange("daily")}
				type="button"
			>
				Daily
			</button>
		</div>
	);
}

/**
 * Dollar formatter for Y-axis
 */
function formatYAxis(value: number): string {
	if (value >= 1000) {
		return `$${(value / 1000).toFixed(0)}k`;
	}
	return `$${value}`;
}

/**
 * Spending trend timeline chart with weekly bars or daily area views.
 * Per CONTEXT.md: "weekly bars and daily line views"
 * Per RESEARCH.md: Convert BigInt at chart boundary, use preserveStartEnd for XAxis
 */
export function SpendingTimeline({
	initialGranularity = "weekly",
	months = 3,
}: SpendingTimelineProps) {
	const [granularity, setGranularity] = useState<"weekly" | "daily">(
		initialGranularity
	);
	const { data, isLoading, error } = useSpendingTrend(granularity, months);

	// Transform API data for Recharts (convert BigInt to number)
	const chartData: ChartData[] = data.map((point: SpendingTrendDataPoint) => {
		const dateObj = new Date(point.date);
		return {
			date:
				granularity === "weekly"
					? format(dateObj, "MMM d")
					: format(dateObj, "MMM d"),
			rawDate: dateObj,
			income: Number(point.incomeCents) / 100,
			expenses: Number(point.expenseCents) / 100,
			incomeCents: point.incomeCents,
			expenseCents: point.expenseCents,
		};
	});

	// Check if there's any data with actual values
	const hasData = chartData.some((d) => d.income > 0 || d.expenses > 0);

	// Render content based on state
	const renderChartContent = () => {
		if (isLoading) {
			return <TimelineSkeleton />;
		}

		if (error) {
			return (
				<div className="flex h-[300px] items-center justify-center text-center">
					<p className="text-muted-foreground">Failed to load spending trend</p>
				</div>
			);
		}

		if (!hasData) {
			return <EmptyState />;
		}

		// Weekly uses BarChart, Daily uses AreaChart (per CONTEXT.md)
		if (granularity === "weekly") {
			return (
				<div className="h-[300px]">
					<ResponsiveContainer height="100%" width="100%">
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="date"
								interval="preserveStartEnd"
								tick={{ fontSize: 12 }}
								tickLine={false}
							/>
							<YAxis
								tick={{ fontSize: 12 }}
								tickFormatter={formatYAxis}
								tickLine={false}
								width={50}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar
								dataKey="income"
								fill="#22c55e"
								name="Income"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="expenses"
								fill="#ef4444"
								name="Expenses"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			);
		}

		// Daily view uses AreaChart
		return (
			<div className="h-[300px]">
				<ResponsiveContainer height="100%" width="100%">
					<AreaChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="date"
							interval="preserveStartEnd"
							tick={{ fontSize: 12 }}
							tickLine={false}
						/>
						<YAxis
							tick={{ fontSize: 12 }}
							tickFormatter={formatYAxis}
							tickLine={false}
							width={50}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Area
							dataKey="income"
							fill="#22c55e"
							fillOpacity={0.3}
							name="Income"
							stroke="#22c55e"
							strokeWidth={2}
							type="monotone"
						/>
						<Area
							dataKey="expenses"
							fill="#ef4444"
							fillOpacity={0.3}
							name="Expenses"
							stroke="#ef4444"
							strokeWidth={2}
							type="monotone"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle>Spending Trend</CardTitle>
				<GranularityToggle
					granularity={granularity}
					onChange={setGranularity}
				/>
			</CardHeader>
			<CardContent>{renderChartContent()}</CardContent>
		</Card>
	);
}
