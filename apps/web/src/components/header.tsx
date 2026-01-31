"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

const navLinks = [
	{ href: "/features", label: "Features" },
	{ href: "/pricing", label: "Pricing" },
	{ href: "/about", label: "About" },
	{ href: "/blog", label: "Blog" },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
	const isHashLink = href.startsWith("/#");

	if (isHashLink) {
		return (
			<a
				className="group relative py-2 text-muted-foreground text-sm transition-colors duration-300 hover:text-foreground"
				href={href}
			>
				{label}
				<span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full" />
			</a>
		);
	}

	return (
		<Link
			className="group relative py-2 text-muted-foreground text-sm transition-colors duration-300 hover:text-foreground"
			href={href as Route}
		>
			{label}
			<span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full" />
		</Link>
	);
}

function MobileMenu({
	isOpen,
	onClose,
	session,
}: {
	isOpen: boolean;
	onClose: () => void;
	session: boolean;
}) {
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 bg-background/95 backdrop-blur-md transition-all duration-500 md:hidden",
				isOpen
					? "pointer-events-auto opacity-100"
					: "pointer-events-none opacity-0"
			)}
		>
			{/* Close button */}
			<button
				aria-label="Close menu"
				className="absolute top-4 right-4 p-2 text-muted-foreground transition-colors hover:text-foreground"
				onClick={onClose}
			>
				<X className="size-6" />
			</button>

			{/* Mobile nav content */}
			<nav className="flex h-full flex-col items-center justify-center gap-8">
				{navLinks.map((link, index) => {
					const isHashLink = link.href.startsWith("/#");
					const className = cn(
						"font-medium text-2xl text-muted-foreground transition-all duration-300 hover:text-foreground",
						isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					);
					const style = {
						transitionDelay: isOpen ? `${index * 100 + 100}ms` : "0ms",
					};

					if (isHashLink) {
						return (
							<a
								className={className}
								href={link.href}
								key={link.href}
								onClick={onClose}
								style={style}
							>
								{link.label}
							</a>
						);
					}

					return (
						<Link
							className={className}
							href={link.href as Route}
							key={link.href}
							onClick={onClose}
							style={style}
						>
							{link.label}
						</Link>
					);
				})}

				{/* Mobile CTAs */}
				<div
					className={cn(
						"mt-8 flex flex-col gap-4 transition-all duration-300",
						isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					)}
					style={{
						transitionDelay: isOpen ? "400ms" : "0ms",
					}}
				>
					{session ? (
						<Button asChild size="lg">
							<Link href="/dashboard" onClick={onClose}>
								Dashboard
								<ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					) : (
						<>
							<Button asChild size="lg" variant="outline">
								<Link href="/sign-in" onClick={onClose}>
									Sign In
								</Link>
							</Button>
							<Button
								asChild
								className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
								size="lg"
							>
								<Link href="/sign-up" onClick={onClose}>
									Get Started
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</>
					)}
				</div>
			</nav>
		</div>
	);
}

export default function Header() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileMenuOpen]);

	const isLandingPage = pathname === "/";

	return (
		<>
			<header
				className={cn(
					"sticky top-0 z-50 transition-all duration-500",
					scrolled
						? "border-border/50 border-b bg-background/80 shadow-sm backdrop-blur-md"
						: "bg-transparent"
				)}
			>
				<div className="mx-auto max-w-6xl px-6">
					<div className="flex h-16 items-center justify-between">
						{/* Logo */}
						<Logo size="sm" />

						{/* Desktop Navigation - show on all website pages */}
						<nav className="hidden items-center gap-8 md:flex">
							{navLinks.map((link) => (
								<NavLink key={link.href} {...link} />
							))}
						</nav>

						{/* Desktop Actions */}
						<div className="hidden items-center gap-3 md:flex">
							<ModeToggle />

							{session ? (
								<Button asChild className="group" size="sm">
									<Link href="/dashboard">
										Dashboard
										<ArrowRight className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5" />
									</Link>
								</Button>
							) : (
								<>
									<Button asChild size="sm" variant="ghost">
										<Link href="/sign-in">Sign In</Link>
									</Button>
									<Button
										asChild
										className="group bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
										size="sm"
									>
										<Link href="/sign-up">
											Get Started
											<ArrowRight className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5" />
										</Link>
									</Button>
								</>
							)}
						</div>

						{/* Mobile menu button */}
						<div className="flex items-center gap-2 md:hidden">
							<ModeToggle />
							<button
								aria-label="Open menu"
								className="p-2 text-muted-foreground transition-colors hover:text-foreground"
								onClick={() => setMobileMenuOpen(true)}
							>
								<Menu className="size-5" />
							</button>
						</div>
					</div>
				</div>

				{/* Subtle bottom border animation on scroll */}
				<div
					className={cn(
						"absolute right-0 bottom-0 left-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent transition-opacity duration-500",
						scrolled ? "opacity-100" : "opacity-0"
					)}
				/>
			</header>

			{/* Mobile Menu */}
			<MobileMenu
				isOpen={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
				session={!!session}
			/>
		</>
	);
}
