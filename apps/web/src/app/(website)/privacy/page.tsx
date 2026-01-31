import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Privacy Policy",
	description:
		"Read Finora's Privacy Policy. Learn how we collect, use, and protect your personal and financial data with bank-level security.",
	openGraph: {
		title: "Privacy Policy - Finora",
		description: "How Finora protects your personal and financial data.",
	},
});

import { Button } from "@/components/ui/button";

function FloatingOrb({
	className,
	delay = "0s",
}: {
	className?: string;
	delay?: string;
}) {
	return (
		<div
			className={`absolute rounded-full opacity-10 blur-[100px] dark:opacity-20 ${className}`}
			style={{
				animation: "float 20s ease-in-out infinite",
				animationDelay: delay,
			}}
		/>
	);
}

function GridPattern() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
					backgroundSize: "60px 60px",
				}}
			/>
		</div>
	);
}

function Section({
	title,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<section
			className={`fade-in slide-in-from-bottom-4 mb-12 animate-in fill-mode-both duration-700 ${className}`}
		>
			<h2 className="mb-4 flex items-center gap-3 font-semibold text-foreground text-lg tracking-tight">
				<span className="size-1.5 bg-primary" />
				{title}
			</h2>
			<div className="space-y-4 border-border/50 border-l pl-4 text-muted-foreground text-sm leading-relaxed">
				{children}
			</div>
		</section>
	);
}

export default function PrivacyPage() {
	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			{/* Background elements */}
			<GridPattern />

			{/* Floating orbs - subtle for legal pages */}
			<FloatingOrb
				className="-top-40 -right-40 h-[400px] w-[400px] bg-emerald-500"
				delay="0s"
			/>
			<FloatingOrb
				className="bottom-40 -left-40 h-[300px] w-[300px] bg-cyan-500"
				delay="5s"
			/>

			{/* Main content */}
			<div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
				{/* Back link */}
				<div className="fade-in slide-in-from-top-4 mb-12 animate-in fill-mode-both duration-700">
					<Button asChild className="group -ml-4" size="sm" variant="ghost">
						<Link href="/">
							<ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
							Back to Home
						</Link>
					</Button>
				</div>

				{/* Header */}
				<div className="mb-16">
					<div className="fade-in slide-in-from-bottom-4 mb-6 inline-flex animate-in items-center gap-3 fill-mode-both delay-100 duration-700">
						<div className="border border-border/50 bg-card/50 p-3 backdrop-blur-sm">
							<Shield className="size-5 text-primary" />
						</div>
						<span className="text-muted-foreground text-xs uppercase tracking-wider">
							Legal
						</span>
					</div>

					<h1 className="fade-in slide-in-from-bottom-4 mb-4 animate-in fill-mode-both font-bold text-3xl tracking-tight delay-200 duration-700 md:text-4xl">
						Privacy Policy
					</h1>

					<p className="fade-in slide-in-from-bottom-4 animate-in fill-mode-both text-muted-foreground delay-300 duration-700">
						Last updated: January 2025
					</p>
				</div>

				{/* Content */}
				<div className="space-y-0">
					<Section className="delay-300" title="Introduction">
						<p>
							At Finora, we take your privacy seriously. This Privacy Policy
							explains how we collect, use, disclose, and safeguard your
							information when you use our personal finance management
							application.
						</p>
						<p>
							Please read this privacy policy carefully. By using Finora, you
							agree to the collection and use of information in accordance with
							this policy.
						</p>
					</Section>

					<Section className="delay-500" title="Information We Collect">
						<p>
							<strong className="text-foreground">Account Information:</strong>{" "}
							When you create an account, we collect your email address and
							encrypted password. We use secure authentication methods and never
							store plain-text passwords.
						</p>
						<p>
							<strong className="text-foreground">Financial Data:</strong> The
							expense tracking data, income records, loan information, and tags
							you enter are stored securely in our database. This data is
							associated with your account and is used solely to provide you
							with the Finora service.
						</p>
						<p>
							<strong className="text-foreground">Usage Data:</strong> We may
							collect information about how you access and use the application,
							including device information, browser type, and usage patterns.
							This helps us improve our service.
						</p>
					</Section>

					<Section className="delay-500" title="How We Use Your Information">
						<p>We use the information we collect to:</p>
						<ul className="ml-2 list-inside list-disc space-y-2">
							<li>Provide, maintain, and improve our services</li>
							<li>Process your financial tracking data</li>
							<li>Send you important updates about the service</li>
							<li>Respond to your comments, questions, and support requests</li>
							<li>
								Monitor and analyze usage patterns to enhance user experience
							</li>
							<li>Detect, prevent, and address technical issues</li>
						</ul>
					</Section>

					<Section className="delay-500" title="Data Security">
						<p>
							We implement appropriate technical and organizational security
							measures to protect your personal information. Your data is
							encrypted both in transit and at rest.
						</p>
						<p>
							However, no method of transmission over the Internet or electronic
							storage is 100% secure. While we strive to use commercially
							acceptable means to protect your information, we cannot guarantee
							its absolute security.
						</p>
					</Section>

					<Section className="delay-500" title="Data Retention">
						<p>
							We retain your personal information for as long as your account is
							active or as needed to provide you services. You can request
							deletion of your account and associated data at any time by
							contacting us.
						</p>
					</Section>

					<Section className="delay-500" title="Third-Party Services">
						<p>
							Finora does not sell, trade, or rent your personal information to
							third parties. We may share generic aggregated demographic
							information not linked to any personal identification information
							for analytics purposes.
						</p>
					</Section>

					<Section className="delay-500" title="Your Rights">
						<p>You have the right to:</p>
						<ul className="ml-2 list-inside list-disc space-y-2">
							<li>Access the personal information we hold about you</li>
							<li>Request correction of inaccurate data</li>
							<li>Request deletion of your data</li>
							<li>Export your data in a portable format</li>
							<li>Withdraw consent at any time</li>
						</ul>
					</Section>

					<Section className="delay-500" title="Changes to This Policy">
						<p>
							We may update our Privacy Policy from time to time. We will notify
							you of any changes by posting the new Privacy Policy on this page
							and updating the &quot;Last updated&quot; date.
						</p>
					</Section>

					<Section className="delay-500" title="Contact Us">
						<p>
							If you have any questions about this Privacy Policy, please
							contact us at{" "}
							<a
								className="text-primary hover:underline"
								href="mailto:privacy@finora.app"
							>
								privacy@finora.app
							</a>
						</p>
					</Section>
				</div>

				{/* Footer navigation */}
				<div className="fade-in mt-16 flex animate-in items-center justify-between border-border/50 border-t fill-mode-both pt-8 delay-700 duration-500">
					<Button asChild size="sm" variant="ghost">
						<Link href="/">Back to Home</Link>
					</Button>
					<Button asChild size="sm" variant="outline">
						<Link href="/terms">View Terms of Service</Link>
					</Button>
				</div>
			</div>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
