"use client";

import { useState } from "react";
import { useSession, signOut } from "@finora/auth/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-lg font-medium text-gray-600">
          Redirecting to login...
        </div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4">
      <div className="mx-auto max-w-4xl space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back to Finora</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Signing out..." : "Sign Out"}
          </button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {user.image ? (
                  <Image
                    width={80}
                    height={80}
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-20 w-20 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                    {user.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      ""}
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="mt-1 text-lg font-medium">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-lg font-medium">{user.email}</p>
                </div>

                {user.emailVerified !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          user.emailVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.emailVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Finora! 🎉</CardTitle>
            <CardDescription>
              You&apos;ve successfully signed in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This is your dashboard where you can manage your finances and
                track your financial goals.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold">Getting Started</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Set up your financial profile and start tracking your
                    expenses.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold">Connect Accounts</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Link your bank accounts to get a complete financial
                    overview.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">Total Balance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
