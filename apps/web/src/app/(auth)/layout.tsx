import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Finora",
    default: "Authentication | Finora",
  },
  description:
    "Sign in or create your Finora account to start managing your finances.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
