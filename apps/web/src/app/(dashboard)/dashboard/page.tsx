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

export default async function DashboardPage() {
	const session = await getSession();

	return (
		<div className="space-y-8">
			{/* Welcome */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">
					Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
				</h1>
				<p className="mt-1 text-muted-foreground">
					Here&apos;s an overview of your finances this month.
				</p>
			</div>

			{/* Dashboard Content */}
			<DashboardPageClient />
		</div>
	);
}
