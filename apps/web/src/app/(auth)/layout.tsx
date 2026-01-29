import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finora - Authentication",
  description: "Sign in or create your Finora account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
