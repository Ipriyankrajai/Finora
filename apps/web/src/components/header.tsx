"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
] as const;

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      {/* Animated logo mark */}
      <div className="relative size-8 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 border border-foreground/20 group-hover:border-foreground/40 transition-colors duration-500" />

        {/* Inner animated element */}
        <div className="absolute inset-1.5 border border-foreground/10 group-hover:border-foreground/30 group-hover:inset-1 transition-all duration-500" />

        {/* Center letter */}
        <span className="relative text-sm font-bold tracking-tighter group-hover:scale-110 transition-transform duration-300">
          F
        </span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span className="text-base font-semibold tracking-tight leading-none">
          finora
        </span>
        <span className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          finance clarity
        </span>
      </div>
    </Link>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="relative py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
    >
      {label}
      {/* Animated underline */}
      <span className="absolute bottom-0 left-0 w-0 h-px bg-foreground group-hover:w-full transition-all duration-300 ease-out" />
    </a>
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
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close menu"
      >
        <X className="size-6" />
      </button>

      {/* Mobile nav content */}
      <nav className="flex flex-col items-center justify-center h-full gap-8">
        {navLinks.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "text-2xl font-medium text-muted-foreground hover:text-foreground transition-all duration-300",
              isOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{
              transitionDelay: isOpen ? `${index * 100 + 100}ms` : "0ms",
            }}
          >
            {link.label}
          </a>
        ))}

        {/* Mobile CTAs */}
        <div
          className={cn(
            "flex flex-col gap-4 mt-8 transition-all duration-300",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: isOpen ? "400ms" : "0ms",
          }}
        >
          {session ? (
            <Button asChild size="lg">
              <Link href="/dashboard" onClick={onClose}>
                Dashboard
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="lg">
                <Link href="/sign-in" onClick={onClose}>
                  Sign In
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/sign-up" onClick={onClose}>
                  Get Started
                  <ArrowRight className="size-4 ml-2" />
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
            ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation - only show on landing page */}
            {isLandingPage && (
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </nav>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ModeToggle />

              {session ? (
                <Button asChild size="sm" className="group">
                  <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="size-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="group">
                    <Link href="/sign-up">
                      Get Started
                      <ArrowRight className="size-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle bottom border animation on scroll */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent transition-opacity duration-500",
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
