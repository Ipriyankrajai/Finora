"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowLeft, Home, Search } from "lucide-react";

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
      className={`absolute rounded-full blur-[100px] opacity-15 dark:opacity-25 ${className}`}
      style={{
        animation: `float 15s ease-in-out infinite`,
        animationDelay: delay,
      }}
    />
  );
}

function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

function GlitchText({ children }: { children: string }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 text-emerald-500/30 animate-pulse"
        style={{ clipPath: "inset(0 0 50% 0)" }}
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        className="absolute inset-0 text-cyan-500/30 animate-pulse"
        style={{
          clipPath: "inset(50% 0 0 0)",
          animationDelay: "150ms",
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background flex items-center justify-center">
      {/* Background elements */}
      <GridPattern />

      {/* Floating orbs */}
      <FloatingOrb
        className="w-[600px] h-[600px] bg-emerald-500 -top-60 -left-60"
        delay="0s"
      />
      <FloatingOrb
        className="w-[400px] h-[400px] bg-cyan-500 bottom-0 -right-40"
        delay="3s"
      />
      <FloatingOrb
        className="w-[300px] h-[300px] bg-emerald-400 top-1/2 left-1/4"
        delay="6s"
      />

      {/* Gradient mesh overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        {/* Large 404 with parallax effect */}
        <div
          className={`mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            transform: mounted
              ? `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
              : undefined,
          }}
        >
          <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter text-foreground/5">
            <GlitchText>404</GlitchText>
          </h1>
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Icon */}
          <div
            className={`mb-6 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          >
            <div className="relative inline-flex p-4 border border-border/50 bg-card/50 backdrop-blur-sm">
              <Search className="size-8 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 size-3 border border-emerald-500/50 bg-emerald-500/20" />
            </div>
          </div>

          {/* Headline */}
          <h2
            className={`text-2xl md:text-3xl font-bold tracking-tight mb-3 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Page not found
          </h2>

          {/* Description */}
          <p
            className={`text-muted-foreground max-w-md mb-8 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              asChild
              className="group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
            >
              <Link href="/">
                <Home className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="group">
              <Link href="/dashboard">
                <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-8 left-8 size-16 border-l border-t border-border/30" />
        <div className="absolute top-8 right-8 size-16 border-r border-t border-border/30" />
        <div className="absolute bottom-8 left-8 size-16 border-l border-b border-border/30" />
        <div className="absolute bottom-8 right-8 size-16 border-r border-b border-border/30" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
