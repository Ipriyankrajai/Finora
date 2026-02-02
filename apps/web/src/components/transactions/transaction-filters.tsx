"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTags } from "@/hooks/use-tags";
import {
	type DatePreset,
	datePresetLabels,
	type TransactionType,
	useTransactionFilters,
} from "@/hooks/use-transaction-filters";
import { cn } from "@/lib/utils";

/**
 * Transaction filter bar with date, type, tag, and amount filters.
 * Per CONTEXT.md: "Inline above list", "Active filters shown as removable chips"
 */
export function TransactionFilters() {
	const { filters, setFilter, setFilters, clearFilters, activeFilterCount } =
		useTransactionFilters();
	const { tags, isLoading: tagsLoading } = useTags();

	// Amount filter popover state
	const [amountOpen, setAmountOpen] = useState(false);
	const [amountMin, setAmountMin] = useState(filters.amountMin ?? "");
	const [amountMax, setAmountMax] = useState(filters.amountMax ?? "");

	// Convert cents to dollars for display
	const centsToDisplayDollars = (cents: string | undefined): string => {
		if (!cents) {
			return "";
		}
		const num = Number.parseInt(cents, 10);
		if (Number.isNaN(num)) {
			return "";
		}
		return (num / 100).toFixed(2);
	};

	// Convert dollars to cents for storage
	const dollarsToCents = (dollars: string): string | undefined => {
		if (!dollars) {
			return undefined;
		}
		const num = Number.parseFloat(dollars);
		if (Number.isNaN(num)) {
			return undefined;
		}
		return Math.round(num * 100).toString();
	};

	// Handle amount filter apply
	const handleApplyAmountFilter = () => {
		setFilters({
			amountMin: dollarsToCents(amountMin),
			amountMax: dollarsToCents(amountMax),
		});
		setAmountOpen(false);
	};

	// Handle amount filter clear
	const handleClearAmountFilter = () => {
		setAmountMin("");
		setAmountMax("");
		setFilters({
			amountMin: undefined,
			amountMax: undefined,
		});
		setAmountOpen(false);
	};

	// Check if amount filter has values
	const hasAmountFilter = filters.amountMin || filters.amountMax;

	// Get tag name by id
	const getTagName = (tagId: string | undefined) => {
		if (!tagId) {
			return "";
		}
		return tags.find((t) => t.id === tagId)?.name ?? "Unknown";
	};

	// Format amount range for chip label
	const formatAmountRange = () => {
		const min = centsToDisplayDollars(filters.amountMin);
		const max = centsToDisplayDollars(filters.amountMax);
		if (min && max) {
			return `$${min} - $${max}`;
		}
		if (min) {
			return `Min $${min}`;
		}
		if (max) {
			return `Max $${max}`;
		}
		return "";
	};

	return (
		<div className="space-y-3">
			{/* Filter controls row */}
			<div className="flex flex-wrap gap-2">
				{/* Date filter */}
				<Select
					onValueChange={(value) =>
						setFilter("datePreset", (value as DatePreset) || null)
					}
					value={filters.datePreset ?? ""}
				>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Date range" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All time</SelectItem>
						{Object.entries(datePresetLabels).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Type filter */}
				<Select
					onValueChange={(value) =>
						setFilter("type", (value as TransactionType) || null)
					}
					value={filters.type ?? ""}
				>
					<SelectTrigger className="w-[110px]">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All types</SelectItem>
						<SelectItem value="INCOME">Income</SelectItem>
						<SelectItem value="EXPENSE">Expense</SelectItem>
					</SelectContent>
				</Select>

				{/* Tag filter */}
				<Select
					disabled={tagsLoading}
					onValueChange={(value) => setFilter("tagId", value || null)}
					value={filters.tagId ?? ""}
				>
					<SelectTrigger className="w-[130px]">
						<SelectValue placeholder="Tag" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All tags</SelectItem>
						{tags.map((tag) => (
							<SelectItem key={tag.id} value={tag.id}>
								<span className="flex items-center gap-2">
									<span
										className="size-2 rounded-full"
										style={{ backgroundColor: tag.color }}
									/>
									{tag.name}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Amount filter popover */}
				<Popover onOpenChange={setAmountOpen} open={amountOpen}>
					<PopoverTrigger
						render={
							<Button
								className={cn(
									"gap-2",
									hasAmountFilter && "border-primary text-primary"
								)}
								size="default"
								variant="outline"
							>
								<SlidersHorizontal className="size-3.5" />
								Amount
							</Button>
						}
					/>
					<PopoverContent align="start" className="w-64">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="amountMin">Minimum ($)</Label>
								<Input
									id="amountMin"
									min="0"
									onChange={(e) => setAmountMin(e.target.value)}
									placeholder="0.00"
									step="0.01"
									type="number"
									value={amountMin}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="amountMax">Maximum ($)</Label>
								<Input
									id="amountMax"
									min="0"
									onChange={(e) => setAmountMax(e.target.value)}
									placeholder="0.00"
									step="0.01"
									type="number"
									value={amountMax}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									className="flex-1"
									onClick={handleClearAmountFilter}
									size="sm"
									variant="outline"
								>
									Clear
								</Button>
								<Button
									className="flex-1"
									onClick={handleApplyAmountFilter}
									size="sm"
								>
									Apply
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Active filter chips */}
			{activeFilterCount > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					{filters.datePreset && (
						<FilterChip
							label={datePresetLabels[filters.datePreset]}
							onRemove={() => setFilter("datePreset", null)}
						/>
					)}
					{filters.type && (
						<FilterChip
							label={filters.type === "INCOME" ? "Income" : "Expense"}
							onRemove={() => setFilter("type", null)}
						/>
					)}
					{filters.tagId && (
						<FilterChip
							label={getTagName(filters.tagId)}
							onRemove={() => setFilter("tagId", null)}
						/>
					)}
					{hasAmountFilter && (
						<FilterChip
							label={formatAmountRange()}
							onRemove={() =>
								setFilters({ amountMin: undefined, amountMax: undefined })
							}
						/>
					)}
					{activeFilterCount > 1 && (
						<Button
							className="h-6 text-muted-foreground text-xs"
							onClick={clearFilters}
							size="xs"
							variant="ghost"
						>
							Clear all
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
