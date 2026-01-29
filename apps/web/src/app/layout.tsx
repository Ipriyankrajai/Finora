import type { Metadata, Viewport } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { createMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createMetadata({
  title: {
    default: "Finora - Finance Clarity",
    template: "%s | Finora",
  },
  description:
    "Take control of your finances with Finora. Track expenses, manage income, monitor loans, and gain insights into your financial habits through visual analytics.",
  keywords: [
    "personal finance",
    "expense tracker",
    "budget management",
    "income tracking",
    "loan management",
    "financial analytics",
    "money management",
    "finance app",
  ],
  authors: [{ name: "Finora" }],
  creator: "Finora",
  publisher: "Finora",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://finora.priyankrajai.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Finora",
    title: "Finora - Finance Clarity",
    description:
      "Take control of your finances with Finora. Track expenses, manage income, monitor loans, and gain insights into your financial habits.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finora - Finance Clarity",
    description:
      "Take control of your finances with Finora. Track expenses, manage income, monitor loans, and gain insights.",
    creator: "@finora",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
