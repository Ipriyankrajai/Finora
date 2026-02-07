import { auth } from "@finora2/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: {
		template: "%s | Finora",
		default: "Get Started | Finora",
	},
	description: "Set up your Finora account and discover your financial tools.",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function OnboardingLayout({
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

	return (
		<div className="flex min-h-svh items-center justify-center bg-background p-6">
			<div className="w-full max-w-2xl">{children}</div>
		</div>
	);
}
