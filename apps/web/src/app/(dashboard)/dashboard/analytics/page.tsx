import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Analytics",
	description: "Visualize your spending patterns and financial trends.",
};

export default function AnalyticsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Analytics</h1>
				<p className="mt-1 text-muted-foreground">
					Visualize your spending patterns and trends.
				</p>
			</div>

			{/* Charts Grid */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Spending by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex h-64 items-center justify-center text-muted-foreground">
							<p>Add transactions to see spending breakdown.</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Monthly Trends</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex h-64 items-center justify-center text-muted-foreground">
							<p>Add transactions to see monthly trends.</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Income vs Expenses */}
			<Card>
				<CardHeader>
					<CardTitle>Income vs Expenses</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-64 items-center justify-center text-muted-foreground">
						<p>Track your cash flow over time.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
