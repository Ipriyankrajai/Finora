import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Goals",
	description: "Set and track your financial goals.",
};

export default function GoalsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Goals</h1>
					<p className="mt-1 text-muted-foreground">
						Set and track your financial goals.
					</p>
				</div>
				<Button className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400">
					<Plus className="mr-2 size-4" />
					Create Goal
				</Button>
			</div>

			{/* Goals Grid */}
			<Card>
				<CardHeader>
					<CardTitle>Your Goals</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center text-muted-foreground">
						<p>No goals set yet.</p>
						<p className="mt-1 text-sm">
							Create a goal to start tracking your progress.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
