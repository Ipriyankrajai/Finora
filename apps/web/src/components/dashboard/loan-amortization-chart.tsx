"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TrendingDown } from "lucide-react";
import { memo } from "react";
import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCents } from "@/lib/format";
import { trpc } from "@/utils/trpc";

interface LoanAmortizationChartProps {
	loanId: string;
	loanName: string;
}

/**
 * Chart data structure with numeric value for Recharts.
 */
interface ChartData {
	month: Date;
	balanceCents: bigint;
	value: number; // Numeric value for Recharts (BigInt converted)
	label: string; // Formatted month label
}

/**
 * Custom tooltip props from Recharts content prop
 */
interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ payload: ChartData }>;
}

/**
 * Custom tooltip component for amortization chart.
 * Shows month and balance amount.
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
	if (!(active && payload?.length)) {
		return null;
	}
	const data = payload[0]?.payload;
	if (!data) {
		return null;
	}

	return (
		<div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
			<p className="font-medium">{data.label}</p>
			<p className="text-muted-foreground">{formatCents(data.balanceCents)}</p>
		</div>
	);
}

/**
 * Format Y-axis tick values as currency (in thousands)
 */
function formatYAxisTick(value: number): string {
	if (value >= 1000) {
		return `$${Math.round(value / 1000)}k`;
	}
	return `$${value}`;
}

/**
 * Amortization chart showing loan balance over time.
 * Uses Recharts AreaChart with gradient fill.
 * Per RESEARCH.md: Convert BigInt to number at chart boundary, set explicit height
 * Wrapped in memo to prevent re-renders when parent state changes (e.g., what-if slider)
 */
export const LoanAmortizationChart = memo(function LoanAmortizationChart({
	loanId,
	loanName,
}: LoanAmortizationChartProps) {
	const queryOptions = trpc.dashboard.getAmortizationSchedule.queryOptions({
		loanId,
	});
	const { data, isLoading, error } = useQuery(queryOptions);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{/* Header skeleton matching final layout */}
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-40 rounded-md" />
					<Skeleton className="h-4 w-28 rounded-md" />
				</div>

				{/* Chart skeleton with decorative elements */}
				<div className="relative h-[250px] overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 via-background to-primary/[0.02]">
					{/* Y-axis placeholder */}
					<div className="absolute top-4 bottom-8 left-2 flex w-10 flex-col justify-between">
						{[0, 1, 2, 3, 4].map((i) => (
							<Skeleton
								className="h-3 w-8 rounded"
								key={i}
								style={{ animationDelay: `${i * 100}ms` }}
							/>
						))}
					</div>

					{/* Decorative chart area placeholder */}
					<div className="absolute inset-0 top-4 right-4 bottom-8 left-14">
						<svg
							aria-hidden="true"
							className="h-full w-full"
							preserveAspectRatio="none"
							viewBox="0 0 100 100"
						>
							<defs>
								<linearGradient
									id="skeletonGradient"
									x1="0"
									x2="0"
									y1="0"
									y2="1"
								>
									<stop
										offset="0%"
										stopColor="hsl(var(--primary))"
										stopOpacity={0.15}
									/>
									<stop
										offset="100%"
										stopColor="hsl(var(--primary))"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							{/* Decorative downward curve representing loan payoff */}
							<path
								className="animate-pulse"
								d="M0,20 Q25,25 50,50 T100,95"
								fill="none"
								stroke="hsl(var(--primary))"
								strokeDasharray="4 4"
								strokeOpacity={0.3}
								strokeWidth="2"
							/>
							<path
								className="animate-pulse"
								d="M0,20 Q25,25 50,50 T100,95 L100,100 L0,100 Z"
								fill="url(#skeletonGradient)"
							/>
						</svg>
					</div>

					{/* X-axis placeholder */}
					<div className="absolute right-4 bottom-2 left-14 flex justify-between">
						{[0, 1, 2, 3, 4].map((i) => (
							<Skeleton
								className="h-3 w-10 rounded"
								key={i}
								style={{ animationDelay: `${i * 75}ms` }}
							/>
						))}
					</div>

					{/* Center loading indicator */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 shadow-sm backdrop-blur-sm">
							<TrendingDown className="size-4 animate-pulse text-primary" />
							<span className="text-muted-foreground text-xs">
								Loading timeline...
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">
					Failed to load amortization data
				</p>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">No amortization data available</p>
			</div>
		);
	}

	// Convert data for Recharts (BigInt to number)
	const chartData: ChartData[] = data.map((point) => ({
		month: new Date(point.month),
		balanceCents: point.balanceCents,
		value: Number(point.balanceCents) / 100, // Convert to dollars for chart
		label: format(new Date(point.month), "MMM ''yy"),
	}));

	// Calculate payoff time
	const totalMonths = chartData.length - 1; // Exclude starting point
	const years = Math.floor(totalMonths / 12);
	const months = totalMonths % 12;

	function formatPayoffTime(): string {
		if (totalMonths <= 0) {
			return "Paid off";
		}
		if (years > 0) {
			const yearText = `${years} year${years !== 1 ? "s" : ""}`;
			const monthText =
				months > 0 ? ` ${months} month${months !== 1 ? "s" : ""}` : "";
			return yearText + monthText;
		}
		return `${months} month${months !== 1 ? "s" : ""}`;
	}

	const payoffTimeDisplay = formatPayoffTime();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="font-medium text-sm">{loanName} Payoff Timeline</h4>
				<span className="text-muted-foreground text-xs">
					{payoffTimeDisplay} to payoff
				</span>
			</div>

			{/* Explicit height on parent per RESEARCH.md */}
			<div className="h-[250px]">
				<ResponsiveContainer height="100%" width="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="balanceGradient" x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<XAxis
							axisLine={false}
							dataKey="label"
							fontSize={12}
							interval="preserveStartEnd"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickLine={false}
						/>
						<YAxis
							axisLine={false}
							fontSize={12}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickFormatter={formatYAxisTick}
							tickLine={false}
							width={50}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Area
							dataKey="value"
							fill="url(#balanceGradient)"
							fillOpacity={1}
							isAnimationActive={false}
							stroke="hsl(var(--primary))"
							strokeWidth={2}
							type="monotone"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
});
