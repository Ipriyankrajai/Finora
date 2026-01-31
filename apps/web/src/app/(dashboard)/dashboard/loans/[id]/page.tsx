import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Loan Details",
  description: "View loan details, payment history, and payoff projections.",
};

interface LoanDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Loan detail page placeholder.
 * Full implementation in Plan 04-02.
 */
export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loan Details</h1>
        <p className="text-muted-foreground mt-1">
          View payment history and payoff projections.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Loan ID: {id}</p>
            <p className="text-sm mt-1">
              Full loan details and payment logging coming in Plan 04-02.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
