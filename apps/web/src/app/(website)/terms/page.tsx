import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Terms of Service",
	description:
		"Read Finora's Terms of Service. Understand your rights and responsibilities when using our personal finance management platform.",
	openGraph: {
		title: "Terms of Service - Finora",
		description: "Finora Terms of Service and user agreement.",
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

export default function TermsPage() {
	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			{/* Background elements */}
			<GridPattern />

			{/* Floating orbs - subtle for legal pages */}
			<FloatingOrb
				className="-top-40 -left-40 h-[400px] w-[400px] bg-emerald-500"
				delay="0s"
			/>
			<FloatingOrb
				className="-right-40 bottom-40 h-[300px] w-[300px] bg-cyan-500"
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
							<FileText className="size-5 text-primary" />
						</div>
						<span className="text-muted-foreground text-xs uppercase tracking-wider">
							Legal
						</span>
					</div>

					<h1 className="fade-in slide-in-from-bottom-4 mb-4 animate-in fill-mode-both font-bold text-3xl tracking-tight delay-200 duration-700 md:text-4xl">
						Terms of Service
					</h1>

					<p className="fade-in slide-in-from-bottom-4 animate-in fill-mode-both text-muted-foreground delay-300 duration-700">
						Last updated: January 2025
					</p>
				</div>

				{/* Content */}
				<div className="space-y-0">
					<Section className="delay-300" title="Agreement to Terms">
						<p>
							By accessing or using Finora, you agree to be bound by these Terms
							of Service. If you disagree with any part of these terms, you may
							not access the service.
						</p>
						<p>
							These Terms of Service apply to all visitors, users, and others
							who access or use the service.
						</p>
					</Section>

					<Section className="delay-500" title="Description of Service">
						<p>
							Finora is a personal finance management application that allows
							users to track expenses, manage income, monitor loans, and gain
							insights into their financial habits through visual analytics.
						</p>
						<p>
							The service is provided &quot;as is&quot; and &quot;as
							available&quot; without any warranties of any kind, either express
							or implied.
						</p>
					</Section>

					<Section className="delay-500" title="User Accounts">
						<p>
							When you create an account with us, you must provide accurate,
							complete, and current information. Failure to do so constitutes a
							breach of the Terms, which may result in immediate termination of
							your account.
						</p>
						<p>
							You are responsible for safeguarding the password you use to
							access the service and for any activities or actions under your
							password.
						</p>
						<p>
							You agree not to disclose your password to any third party. You
							must notify us immediately upon becoming aware of any breach of
							security or unauthorized use of your account.
						</p>
					</Section>

					<Section className="delay-500" title="User Responsibilities">
						<p>
							You agree to use Finora only for lawful purposes. You agree not
							to:
						</p>
						<ul className="ml-2 list-inside list-disc space-y-2">
							<li>
								Use the service in any way that violates any applicable laws or
								regulations
							</li>
							<li>
								Attempt to gain unauthorized access to any portion of the
								service
							</li>
							<li>
								Interfere with or disrupt the service or servers connected to
								the service
							</li>
							<li>
								Use the service to transmit any harmful code or malicious
								software
							</li>
							<li>
								Impersonate or attempt to impersonate Finora, a Finora employee,
								or another user
							</li>
						</ul>
					</Section>

					<Section className="delay-500" title="Your Data">
						<p>
							You retain all rights to the financial data you enter into Finora.
							By using the service, you grant us a limited license to process
							and store your data solely for the purpose of providing the
							service to you.
						</p>
						<p>
							We do not claim ownership of your data. You may export or delete
							your data at any time through the application settings.
						</p>
					</Section>

					<Section className="delay-500" title="Intellectual Property">
						<p>
							The service and its original content, features, and functionality
							are and will remain the exclusive property of Finora and its
							licensors. The service is protected by copyright, trademark, and
							other laws.
						</p>
						<p>
							Our trademarks and trade dress may not be used in connection with
							any product or service without the prior written consent of
							Finora.
						</p>
					</Section>

					<Section className="delay-500" title="Termination">
						<p>
							We may terminate or suspend your account immediately, without
							prior notice or liability, for any reason whatsoever, including
							without limitation if you breach these Terms.
						</p>
						<p>
							Upon termination, your right to use the service will immediately
							cease. If you wish to terminate your account, you may simply
							discontinue using the service or delete your account through the
							application settings.
						</p>
					</Section>

					<Section className="delay-500" title="Limitation of Liability">
						<p>
							In no event shall Finora, nor its directors, employees, partners,
							agents, suppliers, or affiliates, be liable for any indirect,
							incidental, special, consequential, or punitive damages, including
							without limitation, loss of profits, data, use, goodwill, or other
							intangible losses, resulting from your access to or use of or
							inability to access or use the service.
						</p>
					</Section>

					<Section className="delay-500" title="Disclaimer">
						<p>
							Finora is a tool for personal finance tracking and does not
							provide financial, investment, tax, or legal advice. The
							information provided through the service is for informational
							purposes only.
						</p>
						<p>
							You should consult with qualified professionals for advice
							tailored to your specific situation. We make no representations or
							warranties about the accuracy or completeness of any calculations
							or projections.
						</p>
					</Section>

					<Section className="delay-500" title="Changes to Terms">
						<p>
							We reserve the right to modify or replace these Terms at any time.
							If a revision is material, we will try to provide at least 30
							days&apos; notice prior to any new terms taking effect.
						</p>
						<p>
							By continuing to access or use our service after those revisions
							become effective, you agree to be bound by the revised terms.
						</p>
					</Section>

					<Section className="delay-500" title="Governing Law">
						<p>
							These Terms shall be governed and construed in accordance with the
							laws of the jurisdiction in which Finora operates, without regard
							to its conflict of law provisions.
						</p>
					</Section>

					<Section className="delay-500" title="Contact Us">
						<p>
							If you have any questions about these Terms, please contact us at{" "}
							<a
								className="text-primary hover:underline"
								href="mailto:legal@finora.app"
							>
								legal@finora.app
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
						<Link href="/privacy">View Privacy Policy</Link>
					</Button>
				</div>
			</div>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
