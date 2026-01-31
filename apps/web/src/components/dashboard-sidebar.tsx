"use client";

import {
	CreditCard,
	Home,
	PieChart,
	Settings,
	TrendingUp,
	Wallet,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { TagList } from "./tags/tag-list";

interface DashboardSidebarProps {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

const navItems = [
	{ href: "/dashboard", icon: Home, label: "Overview" },
	{ href: "/dashboard/transactions", icon: Wallet, label: "Transactions" },
	{ href: "/dashboard/analytics", icon: PieChart, label: "Analytics" },
	{ href: "/dashboard/loans", icon: CreditCard, label: "Loans" },
	{ href: "/dashboard/goals", icon: TrendingUp, label: "Goals" },
	{ href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
	const pathname = usePathname();

	return (
		<aside className="hidden w-64 flex-col border-border/50 border-r bg-card/50 md:flex">
			{/* Logo */}
			<div className="flex h-16 items-center border-border/50 border-b px-6">
				<Logo size="sm" />
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 p-4">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/dashboard" && pathname.startsWith(item.href));

					return (
						<Link
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
								isActive
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
							href={item.href as Route}
							key={item.href}
						>
							<item.icon className="size-4" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* Tags section */}
			<div className="border-border/50 border-t">
				<TagList />
			</div>

			{/* User info */}
			<div className="border-border/50 border-t p-4">
				<div className="flex items-center gap-3 px-3 py-2">
					<div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
						<span className="font-medium text-primary text-sm">
							{user.name?.charAt(0).toUpperCase() || "U"}
						</span>
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-sm">{user.name}</p>
						<p className="truncate text-muted-foreground text-xs">
							{user.email}
						</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
