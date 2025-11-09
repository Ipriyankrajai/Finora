import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finora",
  description: "Finora is a platform for managing your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
