import type { Metadata } from "next";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Track and manage your income and expenses.",
};

export default function TransactionsPage() {
  // TODO: Wire up add transaction modal in plan 03-04
  const handleAddTransaction = () => {
    // Placeholder - will open transaction form modal
  };

  // TODO: Wire up edit/delete handlers in plan 03-04
  const handleEdit = (id: string) => {
    console.log("Edit transaction:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete transaction:", id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Track your income and expenses.
          </p>
        </div>
        <Button
          className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
          onClick={handleAddTransaction}
        >
          <Plus className="size-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilters />

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionList onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
