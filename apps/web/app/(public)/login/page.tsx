import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailSignIn } from "@/components/auth/email-sign-in";
import { AuthSidePanel } from "@/components/auth/auth-side-panel";
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
      {/* Main Layout */}
      <div className="flex h-full">
        {/* Background Section - Hidden on mobile, visible on desktop */}
        <AuthSidePanel />

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
