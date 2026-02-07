"use client";

import { Settings, User } from "lucide-react";

import { AccountSection } from "@/components/settings/account-section";
import { ProfileForm } from "@/components/settings/profile-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
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
					<CardDescription>
						Update your display name and currency preference.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileForm />
				</CardContent>
			</Card>

			{/* Account */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="size-5" />
						Account
					</CardTitle>
					<CardDescription>
						Manage your account settings and session.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AccountSection />
				</CardContent>
			</Card>
		</div>
	);
}
