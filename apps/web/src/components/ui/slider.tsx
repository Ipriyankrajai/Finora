"use client";

import {
	Range as SliderRange,
	Root as SliderRoot,
	Thumb as SliderThumb,
	Track as SliderTrack,
} from "@radix-ui/react-slider";

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
 * Accessible slider component using Radix UI Slider primitive.
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

	const handleValueChange = (values: number[]) => {
		if (values[0] !== undefined) {
			onChange(values[0]);
		}
	};

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
			<SliderRoot
				className={cn(
					"relative flex w-full touch-none select-none items-center",
					disabled && "cursor-not-allowed opacity-50"
				)}
				disabled={disabled}
				id={sliderId}
				max={max}
				min={min}
				onValueChange={handleValueChange}
				step={step}
				value={[value]}
			>
				<SliderTrack className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
					<SliderRange className="absolute h-full bg-primary" />
				</SliderTrack>
				<SliderThumb
					aria-label={label ?? "Slider"}
					aria-valuetext={displayValue}
					className="block size-5 rounded-full border-2 border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				/>
			</SliderRoot>
		</div>
	);
}

export { Slider };
export type { SliderProps };
