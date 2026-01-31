"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
	return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverContent({
	className,
	align = "center",
	sideOffset = 4,
	...props
}: PopoverPrimitive.Popup.Props &
	Pick<PopoverPrimitive.Positioner.Props, "align" | "sideOffset">) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				align={align}
				className="isolate z-50 outline-none"
				sideOffset={sideOffset}
			>
				<PopoverPrimitive.Popup
					className={cn(
						"w-72 rounded-md bg-popover p-4 text-popover-foreground shadow-md",
						"ring-1 ring-foreground/10",
						"outline-none",
						"data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in",
						"data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out",
						"data-[side=bottom]:slide-in-from-top-2",
						"data-[side=left]:slide-in-from-right-2",
						"data-[side=right]:slide-in-from-left-2",
						"data-[side=top]:slide-in-from-bottom-2",
						"duration-100",
						className
					)}
					data-slot="popover-content"
					{...props}
				/>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

function PopoverArrow({ className, ...props }: PopoverPrimitive.Arrow.Props) {
	return (
		<PopoverPrimitive.Arrow
			className={cn("fill-popover drop-shadow-sm", className)}
			data-slot="popover-arrow"
			{...props}
		/>
	);
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent, PopoverArrow };
