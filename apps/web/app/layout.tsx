import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finora",
  description:
    "Finora is a modern finance management platform that helps individuals and businesses track expenses, monitor budgets, and make informed financial decisions with clarity and confidence.",
};

const lora = Lora({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${GeistSans.variable} ${GeistMono.variable} ${lora.variable} font-sans`,
          "antialiased"
        )}
      >
        {children}
      </body>
    </html>
  );
}
