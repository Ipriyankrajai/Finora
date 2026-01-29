import type { Metadata } from "next";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Goals - Finora",
  description: "Set and track your financial goals.",
};

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set and track your financial goals.
          </p>
        </div>
        <Button className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
          <Plus className="size-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No goals set yet.</p>
            <p className="text-sm mt-1">
              Create a goal to start tracking your progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
