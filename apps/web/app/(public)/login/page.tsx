import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailSignIn } from "@/components/auth/email-sign-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
            <div className="w-full max-w-md space-y-8">
              {/* Welcome Section */}
              <div className="text-center">
                <h1 className="text-lg mb-4 font-medium">Welcome to Finora</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  New here or coming back? Choose how you want to continue
                </p>
              </div>

              {/* Sign In Options */}
              <div className="space-y-4">
                {/* Primary Sign In Option */}
                <div className="space-y-3">
                  <GoogleSignIn />
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Or</span>
                </div>

                {/* More Options Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-0">
                    <AccordionTrigger className="flex justify-center items-center text-sm py-2 hover:no-underline">
                      <span>Other options</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-3">
                        <EmailSignIn />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center absolute bottom-4 left-0 right-0 px-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By signing in you agree to our{" "}
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
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign up
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
