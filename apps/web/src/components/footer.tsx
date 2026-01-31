import type { Route } from "next";
import Link from "next/link";

import { Logo } from "./logo";

const footerLinks = {
	product: [
		{ label: "Features", href: "/features" },
		{ label: "Pricing", href: "/pricing" },
		{ label: "Blog", href: "/blog" },
	],
	company: [
		{ label: "About", href: "/about" },
		{ label: "Contact", href: "/contact" },
	],
	legal: [
		{ label: "Privacy", href: "/privacy" },
		{ label: "Terms", href: "/terms" },
	],
};

export default function Footer() {
	return (
		<footer className="border-border/50 border-t bg-background">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Logo size="sm" />
						<p className="mt-4 text-muted-foreground text-sm">
							Take control of your finances with clarity and confidence.
						</p>
					</div>

					{/* Product Links */}
					<div>
						<h3 className="font-semibold text-foreground text-sm">Product</h3>
						<ul className="mt-4 space-y-3">
							{footerLinks.product.map((link) => (
								<li key={link.href}>
									<Link
										className="text-muted-foreground text-sm transition-colors hover:text-foreground"
										href={link.href as Route}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Company Links */}
					<div>
						<h3 className="font-semibold text-foreground text-sm">Company</h3>
						<ul className="mt-4 space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.href}>
									<Link
										className="text-muted-foreground text-sm transition-colors hover:text-foreground"
										href={link.href as Route}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal Links */}
					<div>
						<h3 className="font-semibold text-foreground text-sm">Legal</h3>
						<ul className="mt-4 space-y-3">
							{footerLinks.legal.map((link) => (
								<li key={link.href}>
									<Link
										className="text-muted-foreground text-sm transition-colors hover:text-foreground"
										href={link.href as Route}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="mt-12 border-border/50 border-t pt-8">
					<p className="text-center text-muted-foreground text-xs">
						&copy; {new Date().getFullYear()} Finora. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
