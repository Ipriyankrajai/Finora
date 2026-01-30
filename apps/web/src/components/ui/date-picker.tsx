"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import {
  startOfWeek,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

interface DatePreset {
  label: string;
  getValue: () => Date;
}

const DATE_PRESETS: DatePreset[] = [
  { label: "Today", getValue: () => new Date() },
  { label: "Yesterday", getValue: () => subDays(new Date(), 1) },
  { label: "Start of this week", getValue: () => startOfWeek(new Date(), { weekStartsOn: 0 }) },
  { label: "Start of this month", getValue: () => startOfMonth(new Date()) },
  { label: "Last month", getValue: () => subMonths(new Date(), 1) },
];

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) {
      setOpen(false);
    }
  };

  const handlePreset = (preset: DatePreset) => {
    onChange(preset.getValue());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-8 w-full items-center justify-start gap-2",
          "rounded-none border border-border bg-background px-2.5 text-xs",
          "ring-offset-background",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="size-4" />
        <span>{value ? formatDate(value) : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets sidebar */}
          <div className="border-r border-border p-2">
            <div className="space-y-1">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handlePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleSelect}
              showOutsideDays
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                button_previous: cn(
                  "absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  "inline-flex items-center justify-center rounded-md",
                  "focus:outline-none focus:ring-1 focus:ring-ring",
                ),
                button_next: cn(
                  "absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  "inline-flex items-center justify-center rounded-md",
                  "focus:outline-none focus:ring-1 focus:ring-ring",
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: cn(
                  "relative p-0 text-center text-sm",
                  "focus-within:relative focus-within:z-20",
                  "[&:has([aria-selected])]:bg-accent",
                  "[&:has([aria-selected].day-outside)]:bg-accent/50",
                  "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                ),
                day_button: cn(
                  "size-8 p-0 font-normal",
                  "inline-flex items-center justify-center rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-1 focus:ring-ring",
                  "aria-selected:opacity-100",
                ),
                range_start: "day-range-start",
                range_end: "day-range-end",
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                today: "bg-accent text-accent-foreground",
                outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                disabled: "text-muted-foreground opacity-50",
                range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, DATE_PRESETS };
export type { DatePickerProps };
