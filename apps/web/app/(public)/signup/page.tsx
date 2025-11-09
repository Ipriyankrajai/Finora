"use client";

import { useState } from "react";
import { signIn, signUp } from "@finora/auth/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      console.error("Google sign-up error:", err);
      setError("Failed to sign up with Google");
    }
  };

  return (
    <div className="h-screen p-2">
      {/* Header - Logo */}
      <header className="absolute top-0 left-0 z-30 w-full">
        <div className="p-6 md:p-8">
          <div className="text-2xl font-bold">Finora</div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-full">
        {/* Background Section - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-l-2xl">
          {/* Light mode gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:hidden" />

          {/* Dark mode gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-indigo-950 to-purple-950 hidden dark:block" />

          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob" />
            <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000" />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start Your Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
              Join thousands of users managing their finances with ease. Track
              expenses, create budgets, and achieve your financial goals.
            </p>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="w-full lg:w-1/2 relative">
          {/* Form Content */}
          <div className="relative z-10 flex h-full items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
              {/* Welcome Section */}
              <div className="text-center">
                <h1 className="text-lg mb-4 font-medium">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Get started with Finora today
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Sign Up Options */}
              <div className="space-y-4">
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  className="w-full gap-2"
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    Or sign up with email
                  </span>
                </div>

                {/* Email Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center absolute bottom-4 left-0 right-0 px-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By signing up you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline hover:text-foreground"
                  >
                    Terms of service
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/privacy"
                    className="underline hover:text-foreground"
                  >
                    Privacy policy
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
