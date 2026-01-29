import { auth } from "@finora2/auth";
import { headers } from "next/headers";

import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp } from "lucide-react";

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
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your finances this month.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions yet.</p>
            <p className="text-sm mt-1">
              Start tracking your expenses to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
