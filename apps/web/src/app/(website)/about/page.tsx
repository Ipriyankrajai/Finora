import Link from "next/link";

import { ArrowRight, Heart, Lock, Sparkles, Target } from "lucide-react";

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your financial data is yours. We don't sell your data, and we use bank-level encryption to keep it secure.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    description:
      "Finance doesn't have to be complicated. We design tools that are powerful yet easy to use.",
  },
  {
    icon: Target,
    title: "Transparency",
    description:
      "No hidden fees, no surprise charges. What you see is what you get, always.",
  },
  {
    icon: Heart,
    title: "User-Centered",
    description:
      "Every feature we build starts with your needs. Your feedback shapes our roadmap.",
  },
];

const stats = [
  { value: "100%", label: "Free Forever" },
  { value: "0", label: "Data Sold" },
  { value: "24/7", label: "Access" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <PageBackground variant="top-heavy" />

      {/* Hero */}
      <section className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/20 bg-primary/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-both">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              Financial clarity for{" "}
              <span className="shimmer-text">everyone</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
              Finora was built with a simple belief: understanding your money should be
              easy, private, and free. We&apos;re on a mission to help millions achieve
              financial peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 divide-x divide-border/50">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${
                  index === 0 ? "delay-300" : index === 1 ? "delay-500" : "delay-700"
                }`}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-700 delay-300 fill-mode-both">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Finora started from a simple frustration: existing finance apps were
                  either too complex, too expensive, or too invasive with user data.
                </p>
                <p>
                  We believed there had to be a better way. A tool that gives you
                  complete visibility into your finances without requiring a finance
                  degree to use, and without selling your data to advertisers.
                </p>
                <p>
                  Today, Finora helps people track expenses, manage loans, and
                  visualize their financial journey—all while keeping their data
                  completely private.
                </p>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
              <div className="aspect-square bg-linear-to-br from-emerald-500/10 to-cyan-500/10 border border-border/50 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center p-8">
                  <div className="text-7xl font-bold shimmer-text mb-4">F</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    Built for clarity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 py-16 md:py-24 bg-card/30 border-y border-border/50 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These principles guide everything we do at Finora.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`group p-6 border border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : index === 2 ? "delay-300" : "delay-500"
                }`}
              >
                <div className="inline-flex p-3 border border-border/50 mb-4 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                  <value.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center animate-in fade-in duration-500 fill-mode-both">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of people who have taken control of their finances with Finora.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
              >
                <Link href="/sign-up">
                  Create Free Account
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
