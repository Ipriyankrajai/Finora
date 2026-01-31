"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface UserMenuProps {
	user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

export default function UserMenu({ user: propUser }: UserMenuProps) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	const user = propUser || session?.user;

	if (isPending && !propUser) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!user) {
		return (
			<Button asChild variant="outline">
				<Link href="/sign-in">Sign In</Link>
			</Button>
		);
	}

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button className="gap-2" variant="outline">
						<div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
							<span className="font-medium text-primary text-xs">
								{user.name?.charAt(0).toUpperCase() || "U"}
							</span>
						</div>
						<span className="hidden sm:inline">{user.name}</span>
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="font-medium text-sm">{user.name}</p>
							<p className="text-muted-foreground text-xs">{user.email}</p>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
						<User className="mr-2 size-4" />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
						<Settings className="mr-2 size-4" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} variant="destructive">
					<LogOut className="mr-2 size-4" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
