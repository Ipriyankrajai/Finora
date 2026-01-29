import type { Metadata } from "next";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Loans",
  description: "Track your loans and simulate payoff strategies.",
};

export default function LoansPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground mt-1">
            Track your loans and simulate extra payments.
          </p>
        </div>
        <Button className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
          <Plus className="size-4 mr-2" />
          Add Loan
        </Button>
      </div>

      {/* Loans List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No loans added yet.</p>
            <p className="text-sm mt-1">
              Add your loans to track payoff progress and simulate strategies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payoff Simulator */}
      <Card>
        <CardHeader>
          <CardTitle>Payoff Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <p>Add a loan to simulate different payoff strategies.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
