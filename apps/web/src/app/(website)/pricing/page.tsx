import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { ArrowRight, Check, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Finora. Start free with unlimited expense tracking, or upgrade to Pro for advanced analytics and premium features.",
  openGraph: {
    title: "Pricing - Finora",
    description:
      "Simple, transparent pricing. Start free with unlimited expense tracking.",
  },
};

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    description: "Everything you need to track your finances",
    price: "$0",
    period: "forever",
    cta: "Get Started",
    ctaVariant: "outline" as const,
    href: "/sign-up",
    features: [
      "Unlimited expense tracking",
      "Custom tags and categories",
      "Visual spending insights",
      "Loan tracking & simulation",
      "Monthly/yearly reports",
      "Data export (CSV)",
      "Mobile responsive",
      "Bank-level encryption",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Advanced features for power users",
    price: "$5",
    period: "per month",
    cta: "Coming Soon",
    ctaVariant: "default" as const,
    href: "#",
    features: [
      "Everything in Free",
      "Advanced analytics",
      "Budget forecasting",
      "Multi-currency support",
      "Recurring transactions",
      "Custom reports",
      "Priority support",
      "API access",
    ],
    highlighted: true,
    badge: "Popular",
  },
  {
    name: "Family",
    description: "Shared finances made simple",
    price: "$9",
    period: "per month",
    cta: "Coming Soon",
    ctaVariant: "outline" as const,
    href: "#",
    features: [
      "Everything in Pro",
      "Up to 5 family members",
      "Shared budgets",
      "Family dashboard",
      "Spending comparisons",
      "Allowance tracking",
      "Goal sharing",
      "Family reports",
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Is Finora really free?",
    answer:
      "Yes! The Free plan includes everything most people need to track expenses, manage loans, and gain financial insights. We'll never put essential features behind a paywall.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "For Pro and Family plans, we accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. There are no contracts or commitments. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Your security is our top priority. We use bank-level 256-bit encryption, never store sensitive credentials, and never sell your data. Your information belongs to you.",
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <PageBackground variant="centered" />

      {/* Header */}
      <section className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 text-center">
          <span className="inline-flex px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/20 bg-primary/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-both">
            Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative flex flex-col p-6 border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${
                  plan.highlighted
                    ? "border-primary/50 bg-primary/[0.02]"
                    : "border-border/50 bg-card/50"
                } ${index === 0 ? "delay-300" : index === 1 ? "delay-500" : "delay-700"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
                      <Sparkles className="size-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.ctaVariant}
                  className={`w-full group ${
                    plan.highlighted
                      ? "bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                      : ""
                  }`}
                  disabled={plan.href === "#"}
                >
                  {plan.href === "#" ? (
                    <span>{plan.cta}</span>
                  ) : (
                    <Link href={plan.href as Route}>
                      {plan.cta}
                      <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-16 md:py-24 bg-card/30 border-y border-border/50 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Have questions? We have answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className={`p-6 border border-border/50 bg-background/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : index === 2 ? "delay-300" : "delay-500"
                }`}
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4 animate-in fade-in duration-500 fill-mode-both">
            Ready to take control?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-in fade-in duration-500 delay-100 fill-mode-both">
            Start tracking your finances today. It&apos;s free, forever.
          </p>
          <Button
            asChild
            size="lg"
            className="group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both"
          >
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
