import { auth } from "@finora2/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Your financial overview at a glance.",
};

async function getSession() {
	return auth.api.getSession({
		headers: await headers(),
	});
}

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) {
		return "Good morning";
	}
	if (hour < 17) {
		return "Good afternoon";
	}
	return "Good evening";
}

/**
 * Get current month name
 */
function getCurrentMonth(): string {
	return new Date().toLocaleDateString("en-US", { month: "long" });
}

export default async function DashboardPage() {
	const session = await getSession();
	const greeting = getGreeting();
	const currentMonth = getCurrentMonth();
	const firstName = session?.user?.name?.split(" ")[0] || "there";

	return (
		<div className="space-y-8">
			{/* Welcome Header with branded styling */}
			<div className="relative">
				{/* Subtle gradient background */}
				<div className="pointer-events-none absolute -inset-4 -top-8 -z-10 overflow-hidden rounded-2xl">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-emerald-500/[0.02]" />
				</div>

				<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
					<div>
						<p className="font-medium text-muted-foreground text-sm">
							{greeting},
						</p>
						<h1 className="font-bold text-3xl tracking-tight lg:text-4xl">
							{firstName}
						</h1>
					</div>
					<p className="text-muted-foreground text-sm">
						Here&apos;s your{" "}
						<span className="font-medium text-foreground">{currentMonth}</span>{" "}
						financial overview
					</p>
				</div>
			</div>

			{/* Dashboard Content */}
			<DashboardPageClient />
		</div>
	);
}
