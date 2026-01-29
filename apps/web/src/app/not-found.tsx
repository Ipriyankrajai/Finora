"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowRight, Home, RefreshCw } from "lucide-react";

import { Logo } from "@/components/logo";
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
      className={`absolute rounded-full blur-[100px] opacity-20 dark:opacity-30 ${className}`}
      style={{
        animation: `float 15s ease-in-out infinite`,
        animationDelay: delay,
      }}
    />
  );
}

function AnimatedLine({ delay }: { delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(100);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-emerald-500/50 via-cyan-500/50 to-emerald-500/50 transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-background via-card to-background overflow-hidden">
        {/* Animated orbs */}
        <FloatingOrb
          className="w-96 h-96 bg-emerald-500 -top-20 -left-20"
          delay="0s"
        />
        <FloatingOrb
          className="w-64 h-64 bg-cyan-500 bottom-40 right-20"
          delay="3s"
        />
        <FloatingOrb
          className="w-48 h-48 bg-emerald-400 top-1/2 left-1/3"
          delay="6s"
        />

        {/* Gradient mesh overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo */}
          <div
            className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <Logo />
          </div>

          {/* Center - Main Content */}
          <div className="flex-1 flex items-center">
            <div>
              <div
                className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 mb-8">
                  Page not found
                </span>
              </div>

              <h1
                className={`text-5xl xl:text-6xl font-extralight tracking-tight text-foreground leading-[1.1] mb-6 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                Looks like you&apos;ve
                <br />
                <span className="shimmer-text font-light">wandered off</span>
              </h1>

              <p
                className={`text-base text-muted-foreground leading-relaxed max-w-md transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved. Let&apos;s get you back to managing your finances.
              </p>

              <div
                className={`mt-12 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <AnimatedLine delay={800} />
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            className={`transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-xs text-muted-foreground/60">
              Error 404 — Page not found
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-linear-to-t from-emerald-950/5 dark:from-emerald-950/10 via-transparent to-transparent" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div
            className={`lg:hidden mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <Logo />
          </div>

          {/* Large 404 */}
          <div
            className={`mb-8 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="text-[10rem] md:text-[12rem] font-extralight tracking-tighter leading-none text-foreground/10 select-none">
              404
            </div>
          </div>

          {/* Mobile message */}
          <div
            className={`lg:hidden mb-8 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h1 className="text-2xl font-light tracking-tight text-foreground mb-2">
              Page not found
            </h1>
            <p className="text-sm text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          {/* Desktop header */}
          <div
            className={`hidden lg:block mb-10 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">
              Let&apos;s get you back
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose where you&apos;d like to go
            </p>
          </div>

          {/* Action buttons */}
          <div
            className={`space-y-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Button
              asChild
              className="w-full h-12 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 group relative overflow-hidden"
            >
              <Link href="/">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Home className="size-4" />
                  Back to Home
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-12 border-border hover:bg-foreground/5 transition-all duration-300 group"
            >
              <Link href="/dashboard">
                <span className="flex items-center justify-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>
          </div>

          {/* Divider */}
          <div
            className={`flex items-center gap-4 my-8 transition-all duration-700 delay-400 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground/50">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Additional help */}
          <div
            className={`text-center transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <RefreshCw className="size-4 group-hover:-rotate-180 transition-transform duration-500" />
              Go back to previous page
            </button>
          </div>

          {/* Suggestions */}
          <div
            className={`mt-12 p-6 border border-border/50 bg-card/30 transition-all duration-700 delay-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Popular pages
            </h3>
            <div className="space-y-3">
              <Link
                href="/#features"
                className="block text-sm text-foreground/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block text-sm text-foreground/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block text-sm text-foreground/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-xs text-muted-foreground/40">
              Need help?{" "}
              <a
                href="mailto:support@finora.app"
                className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
