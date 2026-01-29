"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  PieChart,
  TrendingUp,
  Wallet,
} from "lucide-react";

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
      className={`absolute rounded-full blur-[100px] opacity-30 ${className}`}
      style={{
        animation: `float 15s ease-in-out infinite`,
        animationDelay: delay,
      }}
    />
  );
}

function FeatureItem({
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
      className={`flex gap-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
    >
      <div className="shrink-0 size-10 border border-white/10 bg-white/5 flex items-center justify-center">
        <Icon className="size-4 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
        <p className="text-xs text-white/40 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-400",
    "bg-emerald-500",
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : "bg-white/10"}`}
          />
        ))}
      </div>
      <p className="text-xs text-white/40">
        Password strength:{" "}
        <span
          className={`${strength >= 4 ? "text-emerald-400" : strength >= 3 ? "text-yellow-400" : "text-red-400"}`}
        >
          {strengthLabels[strength - 1] || "Very weak"}
        </span>
      </p>
    </div>
  );
}

export default function SignUpPage() {
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
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Welcome to Finora!");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending || session) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="size-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0b] overflow-hidden">
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

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0a0a0b] via-[#0f1419] to-[#0a0a0b] overflow-hidden">
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
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                             linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo */}
          <div
            className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative size-10 flex items-center justify-center">
                {/* Shadow/offset layer */}
                <div className="absolute inset-0 border border-emerald-500/30 translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" />
                {/* Main box */}
                <div className="absolute inset-0 border border-white/40 bg-[#0a0a0b] group-hover:border-white/60 transition-colors" />
                <span className="relative text-base font-bold tracking-tighter text-white">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-white leading-none">
                  Finora
                </span>
                <span className="text-[9px] text-white/40 tracking-widest uppercase mt-0.5">
                  finance clarity
                </span>
              </div>
            </Link>
          </div>

          {/* Center - Main headline */}
          <div className="flex-1 flex items-center">
            <div>
              <div
                className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-400/80 border border-emerald-500/20 bg-emerald-500/5 mb-8">
                  Get started free
                </span>
              </div>

              <h1
                className={`text-5xl xl:text-6xl font-extralight tracking-tight text-white leading-[1.1] mb-6 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                Take control of
                <br />
                <span className="shimmer-text font-light">your finances</span>
              </h1>

              <p
                className={`text-base text-white/50 leading-relaxed max-w-md transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                Join thousands who&apos;ve transformed their financial life
                with clear insights and smart tracking.
              </p>

              {/* Features */}
              <div
                className={`mt-12 space-y-6 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}
              >
                <FeatureItem
                  icon={Wallet}
                  title="Smart Expense Tracking"
                  description="Categorize and tag every transaction for complete visibility"
                  delay={700}
                />
                <FeatureItem
                  icon={PieChart}
                  title="Beautiful Analytics"
                  description="Stunning charts that reveal your spending patterns"
                  delay={900}
                />
                <FeatureItem
                  icon={TrendingUp}
                  title="Loan Payoff Planning"
                  description="See your debt-free date and optimize payments"
                  delay={1100}
                />
              </div>
            </div>
          </div>

          {/* Bottom - Social proof */}
          <div
            className={`transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border-2 border-[#0a0a0b] bg-gradient-to-br from-emerald-400 to-cyan-500"
                    style={{
                      opacity: 1 - i * 0.15,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40">
                Trusted by{" "}
                <span className="text-white/60 font-medium">10,000+</span> users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-transparent to-transparent" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div
            className={`lg:hidden mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative size-10 flex items-center justify-center">
                {/* Shadow/offset layer */}
                <div className="absolute inset-0 border border-emerald-500/30 translate-x-1 translate-y-1" />
                {/* Main box */}
                <div className="absolute inset-0 border border-white/40 bg-[#0a0a0b]" />
                <span className="relative text-base font-bold tracking-tighter text-white">F</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-white leading-none">
                  Finora
                </span>
                <span className="text-[9px] text-white/40 tracking-widest uppercase mt-0.5">
                  finance clarity
                </span>
              </div>
            </Link>
          </div>

          {/* Form header */}
          <div
            className={`mb-10 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-2xl font-light tracking-tight text-white mb-2">
              Create your account
            </h2>
            <p className="text-sm text-white/50">
              Start your journey to financial clarity
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className={`space-y-5 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="space-y-2">
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-xs uppercase tracking-wider text-white/50"
                    >
                      Full Name
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="John Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        key={error?.message}
                        className="text-xs text-red-400/80"
                      >
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="space-y-2">
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-xs uppercase tracking-wider text-white/50"
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
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        key={error?.message}
                        className="text-xs text-red-400/80"
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
                      className="text-xs uppercase tracking-wider text-white/50"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
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
                        className="text-xs text-red-400/80"
                      >
                        {error?.message}
                      </p>
                    ))}
                    <PasswordStrength password={field.state.value} />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Benefits checklist */}
            <div className="py-4 space-y-3">
              {[
                "Free forever, no hidden costs",
                "Bank-level 256-bit encryption",
                "Your data stays private",
              ].map((benefit, index) => (
                <div
                  key={benefit}
                  className={`flex items-center gap-3 transition-all duration-500`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="size-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-white/50">{benefit}</span>
                </div>
              ))}
            </div>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {state.isSubmitting ? (
                      <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              )}
            </form.Subscribe>
          </form>

          {/* Divider */}
          <div
            className={`flex items-center gap-4 my-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Sign in link */}
          <div
            className={`text-center transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-sm text-white/50">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-xs text-white/20">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-white/40 hover:text-white/60">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-white/40 hover:text-white/60">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
