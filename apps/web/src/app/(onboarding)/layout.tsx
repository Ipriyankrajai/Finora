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
		<div className="relative flex min-h-svh items-start justify-center overflow-hidden bg-background pt-[12vh] sm:pt-[14vh]">
			{/* Ambient background — floating orbs */}
			<div
				className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-emerald-500 opacity-[0.06] blur-[140px] dark:opacity-[0.1]"
				style={{
					animation: "float 20s ease-in-out infinite",
				}}
			/>
			<div
				className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-500 opacity-[0.05] blur-[120px] dark:opacity-[0.08]"
				style={{
					animation: "float 20s ease-in-out infinite",
					animationDelay: "5s",
				}}
			/>
			{/* <div
				className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 opacity-[0.03] blur-[100px] dark:opacity-[0.06]"
				style={{
					animation: "onboarding-pulse 8s ease-in-out infinite",
				}}
			/> */}

			{/* Grid overlay */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `
						linear-gradient(to right, currentColor 1px, transparent 1px),
						linear-gradient(to bottom, currentColor 1px, transparent 1px)
					`,
					backgroundSize: "60px 60px",
				}}
			/>

			{/* Radial gradient accent */}
			<div
				className="pointer-events-none absolute inset-0 opacity-30"
				style={{
					backgroundImage: `
						radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
						radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)
					`,
				}}
			/>

			{/* Content */}
			<div className="relative z-10 w-full max-w-2xl p-6">{children}</div>
		</div>
	);
}
