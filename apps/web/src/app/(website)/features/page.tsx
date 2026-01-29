import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Bell,
  Calculator,
  CreditCard,
  FileSpreadsheet,
  Lock,
  PieChart,
  Repeat,
  Shield,
  Smartphone,
  Tags,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Features",
  description:
    "Discover Finora's powerful features: expense tracking, income management, loan monitoring, visual analytics, custom tags, recurring transactions, and more.",
  openGraph: {
    title: "Features - Finora",
    description:
      "Powerful personal finance features: expense tracking, analytics, loan management, and more.",
  },
});

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";

const featureCategories = [
  {
    title: "Expense Tracking",
    description: "Complete visibility into where your money goes",
    icon: Wallet,
    features: [
      {
        icon: Tags,
        title: "Custom Tags & Categories",
        description:
          "Organize transactions your way with unlimited custom tags. Create hierarchies and filter by any combination.",
      },
      {
        icon: Repeat,
        title: "Recurring Transactions",
        description:
          "Set up recurring income and expenses once. Finora automatically logs them so you never miss a payment.",
      },
      {
        icon: CreditCard,
        title: "Multi-Account Support",
        description:
          "Track cash, credit cards, savings, and investments all in one place. Get a complete financial picture.",
      },
    ],
  },
  {
    title: "Visual Analytics",
    description: "Beautiful insights that reveal spending patterns",
    icon: PieChart,
    features: [
      {
        icon: BarChart3,
        title: "Interactive Charts",
        description:
          "Explore your finances with dynamic pie charts, bar graphs, and trend lines. Zoom, filter, and drill down into details.",
      },
      {
        icon: TrendingUp,
        title: "Trend Analysis",
        description:
          "See how your spending evolves over time. Identify patterns and catch unusual activity before it becomes a problem.",
      },
      {
        icon: FileSpreadsheet,
        title: "Custom Reports",
        description:
          "Generate detailed reports for any time period. Export to CSV or PDF for tax time or personal records.",
      },
    ],
  },
  {
    title: "Loan Management",
    description: "Take control of your debt and see the finish line",
    icon: Calculator,
    features: [
      {
        icon: Calculator,
        title: "Payoff Calculator",
        description:
          "Enter your loan details and see exactly when you'll be debt-free. Simulate extra payments to find the fastest path.",
      },
      {
        icon: TrendingUp,
        title: "Amortization Schedules",
        description:
          "View detailed payment breakdowns showing principal vs. interest over the life of your loan.",
      },
      {
        icon: Zap,
        title: "Acceleration Strategies",
        description:
          "Compare snowball vs. avalanche methods. See how small extra payments can save thousands in interest.",
      },
    ],
  },
];

const additionalFeatures = [
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "256-bit encryption protects your data. We never store passwords or sell your information.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Full functionality on any device. Track expenses on the go with our responsive design.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get alerts for unusual spending, upcoming bills, and milestone achievements.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data belongs to you. We don't share, sell, or monetize your financial information.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative p-6 border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${className}`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="inline-flex p-3 border border-border/50 mb-4 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
          <Icon className="size-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        </div>

        <h3 className="text-base font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  index,
}: {
  category: (typeof featureCategories)[0];
  index: number;
}) {
  const Icon = category.icon;
  const isEven = index % 2 === 0;

  return (
    <section className="relative z-10 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div
          className={`grid md:grid-cols-2 gap-12 items-start ${
            isEven ? "" : "md:flex-row-reverse"
          }`}
        >
          {/* Category header */}
          <div
            className={`animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${isEven ? "" : "md:order-2"}`}
          >
            <div className="sticky top-24">
              <div className="inline-flex p-4 border border-primary/20 bg-primary/5 mb-6">
                <Icon className="size-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {category.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className={`space-y-4 ${isEven ? "" : "md:order-1"}`}>
            {category.features.map((feature, featureIndex) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className={featureIndex === 0 ? "delay-100" : featureIndex === 1 ? "delay-200" : "delay-300"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <PageBackground variant="default" />

      {/* Hero */}
      <section className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/20 bg-primary/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-both">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Features
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            Everything you need for
            <br />
            <span className="shimmer-text">financial clarity</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            Powerful tools designed to be simple. Track expenses, visualize spending,
            manage loans, and finally understand where your money goes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <Button
              asChild
              size="lg"
              className="group bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
            >
              <Link href="/sign-up">
                Start Free
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, index) => (
        <div
          key={category.title}
          className={index % 2 === 1 ? "bg-card/30 backdrop-blur-sm border-y border-border/50" : ""}
        >
          <CategorySection category={category} index={index} />
        </div>
      ))}

      {/* Additional Features Grid */}
      <section className="relative z-10 py-16 md:py-24 bg-card/30 backdrop-blur-sm border-y border-border/50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              And so much more
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature is designed with your privacy and ease of use in mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`group p-6 border border-border/50 bg-background/50 backdrop-blur-sm text-center transition-all duration-700 hover:border-primary/30 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : index === 2 ? "delay-300" : "delay-500"
                }`}
              >
                <div className="inline-flex p-3 border border-border/50 mb-4 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex flex-col items-center p-12 border border-dashed border-primary/30 bg-primary/2 backdrop-blur-sm animate-in fade-in duration-500 fill-mode-both">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to take control?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Join thousands who&apos;ve transformed their financial life with Finora.
              It&apos;s free to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
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
                <Link href="/about">Learn More</Link>
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
