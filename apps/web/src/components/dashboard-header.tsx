"use client";

import { Bell, Search } from "lucide-react";

import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UserMenu from "./user-menu";

interface DashboardHeaderProps {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
	return (
		<header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-border/50 border-b bg-background/80 px-6 backdrop-blur-md">
			{/* Mobile logo */}
			<div className="md:hidden">
				<Logo size="sm" />
			</div>

			{/* Search */}
			<div className="hidden flex-1 md:flex">
				<div className="relative w-full max-w-sm">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-9 border-border/50 bg-muted/50 pl-9"
						placeholder="Search..."
						type="search"
					/>
				</div>
			</div>

			{/* Actions */}
			<div className="ml-auto flex items-center gap-2">
				<Button className="relative" size="icon" variant="ghost">
					<Bell className="size-4" />
					<span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
				</Button>
				<ModeToggle />
				<UserMenu user={user} />
			</div>
		</header>
	);
}
