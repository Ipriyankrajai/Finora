import { auth } from "@finora2/auth";
import {
	ArrowDownRight,
	ArrowUpRight,
	DollarSign,
	TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Your financial overview at a glance.",
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getSession() {
	return auth.api.getSession({
		headers: await headers(),
	});
}

const stats = [
	{
		title: "Total Balance",
		value: "$12,450.00",
		change: "+12.5%",
		trend: "up",
		icon: DollarSign,
	},
	{
		title: "Income",
		value: "$5,230.00",
		change: "+8.2%",
		trend: "up",
		icon: ArrowUpRight,
	},
	{
		title: "Expenses",
		value: "$2,180.00",
		change: "-4.1%",
		trend: "down",
		icon: ArrowDownRight,
	},
	{
		title: "Savings Rate",
		value: "58.3%",
		change: "+2.3%",
		trend: "up",
		icon: TrendingUp,
	},
];

export default async function DashboardPage() {
	const session = await getSession();

	return (
		<div className="space-y-8">
			{/* Welcome */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">
					Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
				</h1>
				<p className="mt-1 text-muted-foreground">
					Here&apos;s an overview of your finances this month.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="font-medium text-muted-foreground text-sm">
								{stat.title}
							</CardTitle>
							<stat.icon className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stat.value}</div>
							<p
								className={`text-xs ${
									stat.trend === "up" ? "text-emerald-600" : "text-red-600"
								}`}
							>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Transactions Placeholder */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Transactions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center text-muted-foreground">
						<p>No transactions yet.</p>
						<p className="mt-1 text-sm">
							Start tracking your expenses to see them here.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
