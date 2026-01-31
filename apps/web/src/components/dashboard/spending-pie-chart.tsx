"use client";

import { FileQuestion } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { TagSpending } from "@/hooks/use-dashboard";
import { formatCents } from "@/lib/format";

interface SpendingPieChartProps {
	topTags: TagSpending[];
	otherTagsTotal: bigint;
	onTagClick: (tagId: string | "other") => void;
}

/**
 * Chart data structure with numeric value for Recharts.
 */
interface ChartData {
	tagId: string | "other";
	tagName: string;
	tagColor: string;
	totalCents: bigint;
	value: number; // Numeric value for Recharts (BigInt converted)
}

/**
 * Custom tooltip props from Recharts content prop
 */
interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ payload: ChartData }>;
}

/**
 * Custom tooltip component for pie chart.
 * Shows tag name and formatted amount.
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
			<p className="font-medium">{data.tagName}</p>
			<p className="text-muted-foreground">{formatCents(data.totalCents)}</p>
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
			<h3 className="font-medium text-lg">No spending this month</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Your spending breakdown will appear here once you log some expenses.
			</p>
		</div>
	);
}

/**
 * Spending breakdown pie chart showing top 5 tags + "Other".
 * Per CONTEXT.md: "Click pie segment: inline expand to show transactions for that tag"
 * Per RESEARCH.md: Convert BigInt to number at chart boundary, set explicit parent height
 */
export function SpendingPieChart({
	topTags,
	otherTagsTotal,
	onTagClick,
}: SpendingPieChartProps) {
	// Check if there's any spending data
	const hasData = topTags.length > 0 || otherTagsTotal > 0n;

	if (!hasData) {
		return <EmptyState />;
	}

	// Build chart data, converting BigInt to number for Recharts
	const chartData: ChartData[] = topTags.map((tag) => ({
		tagId: tag.tagId,
		tagName: tag.tagName,
		tagColor: tag.tagColor,
		totalCents: tag.totalCents,
		value: Number(tag.totalCents),
	}));

	// Only add "Other" segment if otherTagsTotal > 0n (per RESEARCH.md Pitfall 6)
	if (otherTagsTotal > 0n) {
		chartData.push({
			tagId: "other",
			tagName: "Other",
			tagColor: "#9ca3af", // gray-400
			totalCents: otherTagsTotal,
			value: Number(otherTagsTotal),
		});
	}

	const handleClick = (data: ChartData) => {
		onTagClick(data.tagId);
	};

	return (
		// Explicit height on parent per RESEARCH.md Pitfall 2
		<div className="h-[300px]">
			<ResponsiveContainer height="100%" width="100%">
				<PieChart>
					<Pie
						cx="50%"
						cy="50%"
						data={chartData}
						dataKey="value"
						nameKey="tagName"
						onClick={handleClick}
						outerRadius={100}
						style={{ cursor: "pointer" }}
					>
						{chartData.map((entry) => (
							<Cell fill={entry.tagColor} key={entry.tagId} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
