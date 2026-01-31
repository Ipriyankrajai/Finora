"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step: number;
	disabled?: boolean;
	label?: string;
	formatValue?: (value: number) => string;
	className?: string;
	id?: string;
}

/**
 * Accessible slider component using HTML range input with custom styling.
 * Supports value formatting for display, keyboard navigation, and ARIA labels.
 */
function Slider({
	value,
	onChange,
	min,
	max,
	step,
	disabled = false,
	label,
	formatValue,
	className,
	id,
}: SliderProps) {
	const displayValue = formatValue ? formatValue(value) : String(value);
	const sliderId = id ?? "slider";

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(Number(e.target.value));
	};

	// Calculate percentage for visual fill
	const percentage = ((value - min) / (max - min)) * 100;

	return (
		<div className={cn("space-y-2", className)}>
			{label && (
				<div className="flex items-center justify-between">
					<label className="font-medium text-sm" htmlFor={sliderId}>
						{label}
					</label>
					<span
						aria-live="polite"
						className="text-muted-foreground text-sm tabular-nums"
					>
						{displayValue}
					</span>
				</div>
			)}
			<input
				aria-label={label ?? "Slider"}
				aria-valuemax={max}
				aria-valuemin={min}
				aria-valuenow={value}
				aria-valuetext={displayValue}
				className={cn(
					"h-2 w-full cursor-pointer appearance-none rounded-sm bg-muted",
					"[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
					"[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:cursor-not-allowed disabled:opacity-50",
					disabled && "cursor-not-allowed opacity-50"
				)}
				disabled={disabled}
				id={sliderId}
				max={max}
				min={min}
				onChange={handleChange}
				step={step}
				style={{
					background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`,
				}}
				type="range"
				value={value}
			/>
		</div>
	);
}

export { Slider };
export type { SliderProps };
