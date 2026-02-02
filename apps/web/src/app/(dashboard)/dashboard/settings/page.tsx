"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

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
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your account and preferences.
				</p>
			</div>

			{/* Profile */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="size-5" />
						Profile
					</CardTitle>
					<CardDescription>Your personal information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<span className="font-medium text-muted-foreground text-sm">
								Name
							</span>
							<p className="text-foreground">{session?.user?.name || "—"}</p>
						</div>
						<div>
							<span className="font-medium text-muted-foreground text-sm">
								Email
							</span>
							<p className="text-foreground">{session?.user?.email || "—"}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Account Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Account</CardTitle>
					<CardDescription>Manage your account settings</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						className="gap-2"
						onClick={handleSignOut}
						variant="destructive"
					>
						<LogOut className="size-4" />
						Sign Out
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
