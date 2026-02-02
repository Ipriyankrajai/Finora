"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface LabelProps extends ComponentProps<"label"> {
	htmlFor?: string;
	children?: ReactNode;
}

function Label({ className, htmlFor, children, ...props }: LabelProps) {
	return (
		<label
			className={cn(
				"flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className
			)}
			data-slot="label"
			htmlFor={htmlFor}
			{...props}
		>
			{children}
		</label>
	);
}

export { Label };
