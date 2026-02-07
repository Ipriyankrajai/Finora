"use client";

import { LogOut, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

import { DeleteAccountDialog } from "./delete-account-dialog";

/**
 * Account management section: sign out, replay onboarding, delete account.
 */
export function AccountSection() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
					toast.success("Signed out successfully");
				},
			},
		});
	};

	return (
		<div className="space-y-6">
			{/* Email (read-only) */}
			<div>
				<span className="font-medium text-muted-foreground text-xs">Email</span>
				<p className="text-foreground text-sm">{session?.user?.email || "-"}</p>
			</div>

			{/* Actions */}
			<div className="flex flex-wrap gap-3">
				<Button className="gap-2" onClick={handleSignOut} variant="outline">
					<LogOut className="size-4" />
					Sign Out
				</Button>

				<Button asChild className="gap-2" variant="outline">
					<Link href="/onboarding">
						<RotateCcw className="size-4" />
						Replay Onboarding
					</Link>
				</Button>
			</div>

			{/* Danger Zone */}
			<div className="border-destructive/20 border-t pt-6">
				<h3 className="mb-1 font-medium text-destructive text-sm">
					Danger Zone
				</h3>
				<p className="mb-3 text-muted-foreground text-xs">
					Permanently delete your account and all associated data.
				</p>
				<Button
					className="gap-2"
					onClick={() => setDeleteDialogOpen(true)}
					variant="destructive"
				>
					<Trash2 className="size-4" />
					Delete Account
				</Button>
			</div>

			<DeleteAccountDialog
				onOpenChange={setDeleteDialogOpen}
				open={deleteDialogOpen}
			/>
		</div>
	);
}
