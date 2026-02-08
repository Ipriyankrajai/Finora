"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const CONFIRMATION_TEXT = "DELETE";

interface DeleteAccountDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Confirmation dialog for permanent account deletion.
 * Requires typing "DELETE" to enable the delete button.
 * Uses authClient.deleteUser with fallback awareness.
 */
export function DeleteAccountDialog({
	open,
	onOpenChange,
}: DeleteAccountDialogProps) {
	const router = useRouter();
	const [confirmText, setConfirmText] = useState("");
	const [isPending, setIsPending] = useState(false);

	const isConfirmed = confirmText === CONFIRMATION_TEXT;

	const handleDelete = async () => {
		if (!isConfirmed) {
			return;
		}

		setIsPending(true);
		try {
			await authClient.deleteUser({
				fetchOptions: {
					onSuccess: () => {
						toast.success("Account deleted successfully");
						router.push("/");
					},
					onError: (ctx) => {
						toast.error(
							ctx.error?.message ||
								"Failed to delete account. Please try again."
						);
					},
				},
			});
		} catch {
			toast.error("Failed to delete account. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setConfirmText("");
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-5" />
						Delete Account
					</DialogTitle>
					<DialogDescription className="pt-2 text-sm">
						This action is permanent and cannot be undone. All your data will be
						permanently deleted, including:
					</DialogDescription>
				</DialogHeader>

				<ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
					<li>All transactions and their history</li>
					<li>All tags and categorizations</li>
					<li>All loans and payment records</li>
					<li>Your account and profile information</li>
				</ul>

				<div className="space-y-2 pt-2">
					<Label htmlFor="confirm-delete">
						Type{" "}
						<span className="font-mono font-semibold">{CONFIRMATION_TEXT}</span>{" "}
						to confirm
					</Label>
					<Input
						autoComplete="off"
						id="confirm-delete"
						onChange={(e) => setConfirmText(e.target.value)}
						placeholder={CONFIRMATION_TEXT}
						value={confirmText}
					/>
				</div>

				<DialogFooter>
					<DialogClose
						render={
							<Button disabled={isPending} type="button" variant="outline">
								Cancel
							</Button>
						}
					/>
					<Button
						disabled={!isConfirmed || isPending}
						onClick={handleDelete}
						variant="destructive"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete My Account"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
