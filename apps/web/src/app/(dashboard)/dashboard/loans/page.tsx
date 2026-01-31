import type { Metadata } from "next";

import { LoansPageClient } from "@/components/loans/loans-page-client";

export const metadata: Metadata = {
  title: "Loans",
  description: "Track your loans and simulate payoff strategies.",
};

export default function LoansPage() {
  return <LoansPageClient />;
}
