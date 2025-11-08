/**
 * Example Server Component with authentication
 */

import { getSession, getCurrentUser } from "@finora/auth/server";
import { redirect } from "next/navigation";

// Example 1: Protected page that redirects if not authenticated
export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name || session.user.email}!</p>
      <p>User ID: {session.user.id}</p>
    </div>
  );
}

// Example 2: Page that shows different content based on auth status
export async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1>Home Page</h1>
      {user ? (
        <div>
          <p>Welcome back, {user.name}!</p>
          <a href="/dashboard">Go to Dashboard</a>
        </div>
      ) : (
        <div>
          <p>Welcome! Please sign in to continue.</p>
          <a href="/login">Sign In</a>
          <a href="/signup">Sign Up</a>
        </div>
      )}
    </div>
  );
}

// Example 3: User profile page with full session data
export async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div>
      <h1>Profile</h1>
      <div>
        {user.image && (
          <img src={user.image} alt={user.name || "User"} />
        )}
        <h2>{user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Verified: {user.emailVerified ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}

