import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Finora's Privacy Policy. Learn how we collect, use, and protect your personal and financial data with bank-level security.",
  openGraph: {
    title: "Privacy Policy - Finora",
    description: "How Finora protects your personal and financial data.",
  },
};

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
      className={`absolute rounded-full blur-[100px] opacity-10 dark:opacity-20 ${className}`}
      style={{
        animation: `float 20s ease-in-out infinite`,
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
      className={`mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both ${className}`}
    >
      <h2 className="text-lg font-semibold tracking-tight mb-4 text-foreground flex items-center gap-3">
        <span className="size-1.5 bg-primary" />
        {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-4 pl-4 border-l border-border/50">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      {/* Background elements */}
      <GridPattern />

      {/* Floating orbs - subtle for legal pages */}
      <FloatingOrb
        className="w-[400px] h-[400px] bg-emerald-500 -top-40 -right-40"
        delay="0s"
      />
      <FloatingOrb
        className="w-[300px] h-[300px] bg-cyan-500 bottom-40 -left-40"
        delay="5s"
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Back link */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-both">
          <Button asChild variant="ghost" size="sm" className="group -ml-4">
            <Link href="/">
              <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            <div className="p-3 border border-border/50 bg-card/50 backdrop-blur-sm">
              <Shield className="size-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Legal
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            Privacy Policy
          </h1>

          <p className="text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-0">
          <Section title="Introduction" className="delay-300">
            <p>
              At Finora, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our personal finance management
              application.
            </p>
            <p>
              Please read this privacy policy carefully. By using Finora, you
              agree to the collection and use of information in accordance with
              this policy.
            </p>
          </Section>

          <Section title="Information We Collect" className="delay-500">
            <p>
              <strong className="text-foreground">
                Account Information:
              </strong>{" "}
              When you create an account, we collect your email address and
              encrypted password. We use secure authentication methods and never
              store plain-text passwords.
            </p>
            <p>
              <strong className="text-foreground">Financial Data:</strong> The
              expense tracking data, income records, loan information, and tags
              you enter are stored securely in our database. This data is
              associated with your account and is used solely to provide you
              with the Finora service.
            </p>
            <p>
              <strong className="text-foreground">Usage Data:</strong> We may
              collect information about how you access and use the application,
              including device information, browser type, and usage patterns.
              This helps us improve our service.
            </p>
          </Section>

          <Section title="How We Use Your Information" className="delay-500">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your financial tracking data</li>
              <li>Send you important updates about the service</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>
                Monitor and analyze usage patterns to enhance user experience
              </li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </Section>

          <Section title="Data Security" className="delay-500">
            <p>
              We implement appropriate technical and organizational security
              measures to protect your personal information. Your data is
              encrypted both in transit and at rest.
            </p>
            <p>
              However, no method of transmission over the Internet or electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your information, we cannot guarantee
              its absolute security.
            </p>
          </Section>

          <Section title="Data Retention" className="delay-500">
            <p>
              We retain your personal information for as long as your account is
              active or as needed to provide you services. You can request
              deletion of your account and associated data at any time by
              contacting us.
            </p>
          </Section>

          <Section title="Third-Party Services" className="delay-500">
            <p>
              Finora does not sell, trade, or rent your personal information to
              third parties. We may share generic aggregated demographic
              information not linked to any personal identification information
              for analytics purposes.
            </p>
          </Section>

          <Section title="Your Rights" className="delay-500">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </Section>

          <Section title="Changes to This Policy" className="delay-500">
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>
          </Section>

          <Section title="Contact Us" className="delay-500">
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@finora.app"
                className="text-primary hover:underline"
              >
                privacy@finora.app
              </a>
            </p>
          </Section>
        </div>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between animate-in fade-in duration-500 delay-700 fill-mode-both">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/terms">View Terms of Service</Link>
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
