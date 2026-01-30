import type { Metadata } from "next";

import { TransactionsPageClient } from "@/components/transactions/transactions-page-client";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Track and manage your income and expenses.",
};

export default function TransactionsPage() {
  return <TransactionsPageClient />;
}
