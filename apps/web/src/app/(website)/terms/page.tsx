"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowLeft, FileText } from "lucide-react";

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
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <section
      className={`mb-12 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
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

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      {/* Background elements */}
      <GridPattern />

      {/* Floating orbs - subtle for legal pages */}
      <FloatingOrb
        className="w-[400px] h-[400px] bg-emerald-500 -top-40 -left-40"
        delay="0s"
      />
      <FloatingOrb
        className="w-[300px] h-[300px] bg-cyan-500 bottom-40 -right-40"
        delay="5s"
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Back link */}
        <div
          className={`mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Button asChild variant="ghost" size="sm" className="group -ml-4">
            <Link href="/">
              <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-16">
          <div
            className={`inline-flex items-center gap-3 mb-6 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="p-3 border border-border/50 bg-card/50 backdrop-blur-sm">
              <FileText className="size-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Legal
            </span>
          </div>

          <h1
            className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Terms of Service
          </h1>

          <p
            className={`text-muted-foreground transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-0">
          <Section title="Agreement to Terms" delay={400}>
            <p>
              By accessing or using Finora, you agree to be bound by these Terms
              of Service. If you disagree with any part of these terms, you may
              not access the service.
            </p>
            <p>
              These Terms of Service apply to all visitors, users, and others
              who access or use the service.
            </p>
          </Section>

          <Section title="Description of Service" delay={500}>
            <p>
              Finora is a personal finance management application that allows
              users to track expenses, manage income, monitor loans, and gain
              insights into their financial habits through visual analytics.
            </p>
            <p>
              The service is provided &quot;as is&quot; and &quot;as
              available&quot; without any warranties of any kind, either express
              or implied.
            </p>
          </Section>

          <Section title="User Accounts" delay={600}>
            <p>
              When you create an account with us, you must provide accurate,
              complete, and current information. Failure to do so constitutes a
              breach of the Terms, which may result in immediate termination of
              your account.
            </p>
            <p>
              You are responsible for safeguarding the password you use to
              access the service and for any activities or actions under your
              password.
            </p>
            <p>
              You agree not to disclose your password to any third party. You
              must notify us immediately upon becoming aware of any breach of
              security or unauthorized use of your account.
            </p>
          </Section>

          <Section title="User Responsibilities" delay={700}>
            <p>You agree to use Finora only for lawful purposes. You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Use the service in any way that violates any applicable laws or
                regulations
              </li>
              <li>
                Attempt to gain unauthorized access to any portion of the
                service
              </li>
              <li>
                Interfere with or disrupt the service or servers connected to
                the service
              </li>
              <li>
                Use the service to transmit any harmful code or malicious
                software
              </li>
              <li>
                Impersonate or attempt to impersonate Finora, a Finora employee,
                or another user
              </li>
            </ul>
          </Section>

          <Section title="Your Data" delay={800}>
            <p>
              You retain all rights to the financial data you enter into Finora.
              By using the service, you grant us a limited license to process
              and store your data solely for the purpose of providing the
              service to you.
            </p>
            <p>
              We do not claim ownership of your data. You may export or delete
              your data at any time through the application settings.
            </p>
          </Section>

          <Section title="Intellectual Property" delay={900}>
            <p>
              The service and its original content, features, and functionality
              are and will remain the exclusive property of Finora and its
              licensors. The service is protected by copyright, trademark, and
              other laws.
            </p>
            <p>
              Our trademarks and trade dress may not be used in connection with
              any product or service without the prior written consent of
              Finora.
            </p>
          </Section>

          <Section title="Termination" delay={1000}>
            <p>
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the service will immediately
              cease. If you wish to terminate your account, you may simply
              discontinue using the service or delete your account through the
              application settings.
            </p>
          </Section>

          <Section title="Limitation of Liability" delay={1100}>
            <p>
              In no event shall Finora, nor its directors, employees, partners,
              agents, suppliers, or affiliates, be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of or
              inability to access or use the service.
            </p>
          </Section>

          <Section title="Disclaimer" delay={1200}>
            <p>
              Finora is a tool for personal finance tracking and does not
              provide financial, investment, tax, or legal advice. The
              information provided through the service is for informational
              purposes only.
            </p>
            <p>
              You should consult with qualified professionals for advice
              tailored to your specific situation. We make no representations or
              warranties about the accuracy or completeness of any calculations
              or projections.
            </p>
          </Section>

          <Section title="Changes to Terms" delay={1300}>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              If a revision is material, we will try to provide at least 30
              days&apos; notice prior to any new terms taking effect.
            </p>
            <p>
              By continuing to access or use our service after those revisions
              become effective, you agree to be bound by the revised terms.
            </p>
          </Section>

          <Section title="Governing Law" delay={1400}>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of the jurisdiction in which Finora operates, without regard
              to its conflict of law provisions.
            </p>
          </Section>

          <Section title="Contact Us" delay={1500}>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@finora.app"
                className="text-primary hover:underline"
              >
                legal@finora.app
              </a>
            </p>
          </Section>
        </div>

        {/* Footer navigation */}
        <div
          className={`mt-16 pt-8 border-t border-border/50 flex items-center justify-between transition-all duration-700 delay-[1600ms] ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/privacy">View Privacy Policy</Link>
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
