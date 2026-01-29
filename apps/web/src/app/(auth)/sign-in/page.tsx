"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

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

function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="text-2xl font-light tracking-tight text-foreground/90">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { isPending, data: session } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session && !isPending) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Welcome back!");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending || session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
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

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-slide-up {
          animation: fadeSlideUp 0.6s ease-out forwards;
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

          {/* Center - Main headline */}
          <div className="flex-1 flex items-center">
            <div>
              <div
                className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 mb-8">
                  Welcome back
                </span>
              </div>

              <h1
                className={`text-5xl xl:text-6xl font-extralight tracking-tight text-foreground leading-[1.1] mb-6 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                Your financial
                <br />
                <span className="shimmer-text font-light">clarity awaits</span>
              </h1>

              <p
                className={`text-base text-muted-foreground leading-relaxed max-w-md transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                Pick up where you left off. Your expenses, loans, and insights
                are ready for you.
              </p>

              <div
                className={`mt-12 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <AnimatedLine delay={800} />
                <div className="grid grid-cols-3 gap-8 mt-8">
                  <StatCard value="256-bit" label="Encryption" delay={900} />
                  <StatCard value="99.9%" label="Uptime" delay={1000} />
                  <StatCard value="0" label="Data sold" delay={1100} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Trust indicators */}
          <div
            className={`transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-xs text-muted-foreground/60">
              Your data never leaves your control
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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

          {/* Form header */}
          <div
            className={`mb-10 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">
              Sign in
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className={`space-y-6 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="space-y-2">
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Email
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/[0.07] transition-all"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        key={error?.message}
                        className="text-xs text-destructive/80"
                      >
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="space-y-2">
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/[0.07] transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {field.state.meta.errors.map((error) => (
                      <p
                        key={error?.message}
                        className="text-xs text-destructive/80"
                      >
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="w-full h-12 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {state.isSubmitting ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              )}
            </form.Subscribe>
          </form>

          {/* Divider */}
          <div
            className={`flex items-center gap-4 my-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground/50">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign up link */}
          <div
            className={`text-center transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors font-medium"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div
            className={`mt-16 text-center transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-xs text-muted-foreground/40">
              By signing in, you agree to our{" "}
              <Link
                href="#"
                className="text-muted-foreground/60 hover:text-muted-foreground"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="text-muted-foreground/60 hover:text-muted-foreground"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
