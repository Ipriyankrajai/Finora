"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogBackdrop({
	className,
	...props
}: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			className={cn(
				"fixed inset-0 z-50 bg-black/50",
				"transition-opacity duration-150",
				"data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
				className
			)}
			data-slot="dialog-backdrop"
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	...props
}: DialogPrimitive.Popup.Props) {
	return (
		<DialogPrimitive.Portal>
			<DialogBackdrop />
			<DialogPrimitive.Popup
				className={cn(
					"fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
					"w-full max-w-lg p-6",
					"bg-popover text-popover-foreground",
					"rounded-lg shadow-lg",
					"ring-1 ring-foreground/10",
					"transition-all duration-150",
					"data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
					"data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
					"outline-none",
					className
				)}
				data-slot="dialog-content"
				{...props}
			>
				{children}
			</DialogPrimitive.Popup>
		</DialogPrimitive.Portal>
	);
}

function DialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex flex-col gap-1.5 text-center sm:text-left",
				className
			)}
			data-slot="dialog-header"
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className
			)}
			data-slot="dialog-footer"
			{...props}
		/>
	);
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			className={cn(
				"font-semibold text-lg leading-none tracking-tight",
				className
			)}
			data-slot="dialog-title"
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			className={cn("text-muted-foreground text-sm", className)}
			data-slot="dialog-description"
			{...props}
		/>
	);
}

function DialogCloseButton({
	className,
	...props
}: DialogPrimitive.Close.Props) {
	return (
		<DialogPrimitive.Close
			className={cn(
				"absolute top-4 right-4",
				"rounded-sm opacity-70 ring-offset-background",
				"transition-opacity hover:opacity-100",
				"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				"disabled:pointer-events-none",
				className
			)}
			data-slot="dialog-close-button"
			{...props}
		>
			<XIcon className="size-4" />
			<span className="sr-only">Close</span>
		</DialogPrimitive.Close>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogPortal,
	DialogBackdrop,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogCloseButton,
};
