"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTag, useUpdateTag } from "@/hooks/use-tags";

const tagSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name must be 50 characters or less"),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

interface TagFormProps {
	mode: "create" | "edit";
	tag?: { id: string; name: string; color: string };
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

/**
 * Tag create/edit form in a dialog.
 * Uses TanStack Form for validation and state management.
 */
export function TagForm({
	mode,
	tag,
	open,
	onOpenChange,
	onSuccess,
}: TagFormProps) {
	const createTag = useCreateTag();
	const updateTag = useUpdateTag();

	const isPending = createTag.isPending || updateTag.isPending;

	const form = useForm({
		defaultValues: {
			name: tag?.name ?? "",
			color: tag?.color ?? "#3b82f6",
		},
		onSubmit: async ({ value }) => {
			if (mode === "create") {
				await createTag.mutateAsync({
					name: value.name,
					color: value.color,
				});
			} else if (tag) {
				await updateTag.mutateAsync({
					id: tag.id,
					name: value.name,
					color: value.color,
				});
			}
			onOpenChange(false);
			onSuccess?.();
		},
		validators: {
			onSubmit: tagSchema,
		},
	});

	// Reset form when dialog opens with new tag data
	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			form.reset();
			form.setFieldValue("name", tag?.name ?? "");
			form.setFieldValue("color", tag?.color ?? "#3b82f6");
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Create Tag" : "Edit Tag"}
					</DialogTitle>
				</DialogHeader>

				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									autoFocus
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g., Groceries"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Field name="color">
						{(field) => (
							<div className="space-y-2">
								<Label>Color</Label>
								<ColorPicker
									onChange={(color) => field.handleChange(color)}
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<DialogClose
							render={
								<Button disabled={isPending} type="button" variant="outline">
									Cancel
								</Button>
							}
						/>
						<form.Subscribe>
							{(state) => (
								<Button
									disabled={!state.canSubmit || state.isSubmitting || isPending}
									type="submit"
								>
									{isPending ? "Saving..." : "Save"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
