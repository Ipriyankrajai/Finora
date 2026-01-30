"use client";

import { SlidersHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTransactionFilters,
  datePresetLabels,
  type DatePreset,
  type TransactionType,
} from "@/hooks/use-transaction-filters";
import { useTags } from "@/hooks/use-tags";
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
  const [amountOpen, setAmountOpen] = React.useState(false);
  const [amountMin, setAmountMin] = React.useState(filters.amountMin ?? "");
  const [amountMax, setAmountMax] = React.useState(filters.amountMax ?? "");

  // Convert cents to dollars for display
  const centsToDisplayDollars = (cents: string | undefined): string => {
    if (!cents) return "";
    const num = parseInt(cents, 10);
    if (isNaN(num)) return "";
    return (num / 100).toFixed(2);
  };

  // Convert dollars to cents for storage
  const dollarsToCents = (dollars: string): string | undefined => {
    if (!dollars) return undefined;
    const num = parseFloat(dollars);
    if (isNaN(num)) return undefined;
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
    if (!tagId) return "";
    return tags.find((t) => t.id === tagId)?.name ?? "Unknown";
  };

  // Format amount range for chip label
  const formatAmountRange = () => {
    const min = centsToDisplayDollars(filters.amountMin);
    const max = centsToDisplayDollars(filters.amountMax);
    if (min && max) return `$${min} - $${max}`;
    if (min) return `Min $${min}`;
    if (max) return `Max $${max}`;
    return "";
  };

  return (
    <div className="space-y-3">
      {/* Filter controls row */}
      <div className="flex flex-wrap gap-2">
        {/* Date filter */}
        <Select
          value={filters.datePreset ?? ""}
          onValueChange={(value) =>
            setFilter("datePreset", value as DatePreset || null)
          }
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
          value={filters.type ?? ""}
          onValueChange={(value) =>
            setFilter("type", value as TransactionType || null)
          }
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
          value={filters.tagId ?? ""}
          onValueChange={(value) => setFilter("tagId", value || null)}
          disabled={tagsLoading}
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
        <Popover open={amountOpen} onOpenChange={setAmountOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="default"
                className={cn(
                  "gap-2",
                  hasAmountFilter && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                Amount
              </Button>
            }
          />
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amountMin">Minimum ($)</Label>
                <Input
                  id="amountMin"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountMax">Maximum ($)</Label>
                <Input
                  id="amountMax"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleClearAmountFilter}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleApplyAmountFilter}
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
        <div className="flex flex-wrap gap-2 items-center">
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
              variant="ghost"
              size="xs"
              className="h-6 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
