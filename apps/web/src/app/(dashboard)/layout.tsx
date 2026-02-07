import { auth } from "@finora2/auth";
import prisma from "@finora2/db";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";

export const metadata: Metadata = {
	title: {
		template: "%s | Finora",
		default: "Dashboard | Finora",
	},
	description: "Manage your finances with Finora dashboard.",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/sign-in");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { hasCompletedOnboarding: true },
	});

	if (!user?.hasCompletedOnboarding) {
		redirect("/onboarding");
	}

	return (
		<div className="flex min-h-svh">
			<DashboardSidebar user={session.user} />
			<div className="flex flex-1 flex-col">
				<DashboardHeader user={session.user} />
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	);
}
