import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailSignIn } from "@/components/auth/email-sign-in";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import Link from "next/link";

export default function LoginPage() {
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
              Welcome to Finora
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
              Manage your finances with ease. Track expenses, create budgets,
              and achieve your financial goals.
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full lg:w-1/2 relative">
          {/* Form Content */}
          <div className="relative z-10 flex h-full items-center justify-center p-6">
            <div className="w-full max-w-md flex flex-col gap-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Welcome to Finora</CardTitle>
                  <CardDescription>
                    Login with your Google account or email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <GoogleSignIn />
                    </Field>
                    <FieldSeparator>Or continue with</FieldSeparator>
                    <Field>
                      <EmailSignIn />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Terms and Privacy */}
              <FieldDescription className="text-center">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                .
              </FieldDescription>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
