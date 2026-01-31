"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Select<Value, Multiple extends boolean | undefined = false>({
	...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return (
		<SelectPrimitive.Value
			className={cn("text-sm", className)}
			data-slot="select-value"
			{...props}
		/>
	);
}

function SelectTrigger({
	className,
	children,
	...props
}: SelectPrimitive.Trigger.Props) {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				"flex h-8 w-full items-center justify-between gap-2",
				"rounded-none border border-border bg-background px-2.5 text-xs",
				"ring-offset-background",
				"placeholder:text-muted-foreground",
				"focus:outline-none focus:ring-1 focus:ring-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[placeholder]:text-muted-foreground",
				"[&>span]:line-clamp-1",
				className
			)}
			data-slot="select-trigger"
			{...props}
		>
			{children}
			<SelectPrimitive.Icon>
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	align = "start",
	sideOffset = 4,
	...props
}: SelectPrimitive.Popup.Props &
	Pick<SelectPrimitive.Positioner.Props, "align" | "sideOffset">) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				align={align}
				className="isolate z-50 outline-none"
				sideOffset={sideOffset}
			>
				<SelectPrimitive.Popup
					className={cn(
						"relative max-h-[var(--available-height)] min-w-[8rem] overflow-hidden",
						"rounded-none bg-popover text-popover-foreground shadow-md",
						"ring-1 ring-foreground/10",
						"data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in",
						"data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out",
						"data-[side=bottom]:slide-in-from-top-2",
						"data-[side=top]:slide-in-from-bottom-2",
						"duration-100",
						className
					)}
					data-slot="select-content"
					{...props}
				>
					<SelectPrimitive.ScrollUpArrow className="flex cursor-default items-center justify-center py-1">
						<ChevronDownIcon className="size-4 rotate-180" />
					</SelectPrimitive.ScrollUpArrow>
					<SelectPrimitive.List className="p-1">
						{children}
					</SelectPrimitive.List>
					<SelectPrimitive.ScrollDownArrow className="flex cursor-default items-center justify-center py-1">
						<ChevronDownIcon className="size-4" />
					</SelectPrimitive.ScrollDownArrow>
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectGroupLabel({
	className,
	...props
}: SelectPrimitive.GroupLabel.Props) {
	return (
		<SelectPrimitive.GroupLabel
			className={cn(
				"px-2 py-1.5 font-medium text-muted-foreground text-xs",
				className
			)}
			data-slot="select-group-label"
			{...props}
		/>
	);
}

function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"relative flex w-full cursor-default select-none items-center",
				"rounded-sm py-1.5 pr-8 pl-2 text-xs outline-none",
				"focus:bg-accent focus:text-accent-foreground",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className
			)}
			data-slot="select-item"
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			data-slot="select-separator"
			{...props}
		/>
	);
}

export {
	Select,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectGroup,
	SelectGroupLabel,
	SelectItem,
	SelectSeparator,
};
