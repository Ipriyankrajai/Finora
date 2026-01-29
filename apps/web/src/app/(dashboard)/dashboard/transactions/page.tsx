import type { Metadata } from "next";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Transactions - Finora",
  description: "Track and manage your income and expenses.",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Track your income and expenses.
          </p>
        </div>
        <Button className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
          <Plus className="size-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions recorded yet.</p>
            <p className="text-sm mt-1">
              Click &quot;Add Transaction&quot; to start tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
