"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowRight, PieChart, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  delay = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  return (
    <span
      className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

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

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group relative p-6 border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="inline-flex p-3 border border-border/50 mb-4 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
          <Icon className="size-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        </div>

        <h3 className="text-sm font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #10b981 0%,
            #06b6d4 25%,
            #10b981 50%,
            #06b6d4 75%,
            #10b981 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Background elements */}
      <GridPattern />

      {/* Floating orbs - matching auth pages */}
      <FloatingOrb
        className="w-[500px] h-[500px] bg-emerald-500 -top-40 -left-40"
        delay="0s"
      />
      <FloatingOrb
        className="w-[400px] h-[400px] bg-cyan-500 top-1/2 -right-40"
        delay="3s"
      />
      <FloatingOrb
        className="w-[300px] h-[300px] bg-emerald-400 bottom-20 left-1/4"
        delay="6s"
      />

      {/* Gradient mesh overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-24">
        {/* Hero section */}
        <div className="text-center mb-20">
          {/* Eyebrow */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 mb-8 border border-primary/20 bg-primary/5 text-xs text-primary tracking-wide transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
          >
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            PERSONAL FINANCE CLARITY
          </div>

          {/* Main headline */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <span className="block">Know where your</span>
            <span className="block mt-2 shimmer-text">money goes</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed mb-10 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            Track expenses with tags, visualize spending patterns, and see
            exactly when your loans will be paid off.
          </p>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            {session ? (
              <Button asChild size="lg" className="min-w-[200px] group">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="min-w-[200px] group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                >
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats section */}
        <div
          className={`grid grid-cols-3 gap-px bg-border/50 border border-border/50 mb-20 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="bg-background p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-primary">
              <AnimatedNumber value={100} suffix="%" delay={600} />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Privacy First
            </div>
          </div>
          <div className="bg-background p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-primary">
              <AnimatedNumber prefix="$" value={0} delay={800} />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Monthly Cost
            </div>
          </div>
          <div className="bg-background p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-primary">
              <AnimatedNumber value={2} delay={1000} />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Min to Start
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div id="features" className="grid md:grid-cols-3 gap-px bg-border/30 mb-20">
          <FeatureCard
            icon={Wallet}
            title="Expense Tracking"
            description="Log income and expenses with custom tags. See exactly where your money flows each month."
            delay={700}
          />
          <FeatureCard
            icon={PieChart}
            title="Visual Insights"
            description="Beautiful charts show spending breakdowns by category and trends over time."
            delay={900}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Loan Management"
            description="Track loans, simulate extra payments, and see your debt-free date move closer."
            delay={1100}
          />
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center transition-all duration-700 delay-700 ${mounted ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="inline-flex flex-col items-center p-8 border border-dashed border-primary/30 bg-primary/2">
            <p className="text-sm text-muted-foreground mb-4">
              Ready to take control of your finances?
            </p>
            {session ? (
              <Button asChild variant="outline">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            ) : (
              <Button
                asChild
                className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
              >
                <Link href="/sign-up">Create Free Account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
