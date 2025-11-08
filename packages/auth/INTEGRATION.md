# Integration Guide

This guide will help you integrate the `@finora/auth` package into your Next.js application.

## Step 1: Install Dependencies

The package is already set up in your monorepo. Just run:

```bash
bun install
```

## Step 2: Update Database Schema

Add the auth tables to `packages/database/prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Then run migrations:

```bash
cd packages/database
bun run db:push
```

## Step 3: Set Up Environment Variables

Copy the `.env.example` from `packages/auth` to your app root and fill in the values:

```bash
cp packages/auth/.env.example .env.local
```

## Step 4: Create API Route Handler

In your Next.js app (`apps/web` or `apps/docs`), create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@finora/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Step 5: Add Auth Provider (Optional but Recommended)

Create `app/providers.tsx`:

```typescript
"use client";

import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

Then wrap your app in `app/layout.tsx`:

```typescript
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Step 6: Create Login Page

Create `app/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { signIn } from "@finora/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during sign in");
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <h2 className="text-2xl font-bold">Sign In</h2>

        {error && (
          <div className="rounded bg-red-50 p-3 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded border px-4 py-2 hover:bg-gray-50"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
```

## Step 7: Protect Routes with Middleware

Create `middleware.ts` in your app root:

```typescript
import { createAuthMiddleware } from "@finora/auth/middleware";

export const middleware = createAuthMiddleware({
  protectedRoutes: ["/dashboard", "/profile", "/settings"],
  publicRoutes: ["/", "/login", "/signup"],
  loginPath: "/login",
  defaultRedirectPath: "/dashboard",
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## Step 8: Use Auth in Components

### Client Components

```typescript
"use client";

import { useAuth, signOut } from "@finora/auth";

export function UserProfile() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return <div>Loading...</div>;
  }

  if (auth.status === "unauthenticated") {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {auth.session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Server Components

```typescript
import { getSession } from "@finora/auth/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
}
```

### Server Actions

```typescript
"use server";

import { requireAuth } from "@finora/auth/server";

export async function updateProfile(formData: FormData) {
  const session = await requireAuth(); // Throws if not authenticated

  // Your logic here
  console.log("Updating profile for user:", session.user.id);
}
```

## Step 9: Add Package to App Dependencies

In your app's `package.json` (e.g., `apps/web/package.json`), add:

```json
{
  "dependencies": {
    "@finora/auth": "workspace:*"
  }
}
```

Then run:

```bash
bun install
```

## Complete!

Your authentication system is now set up! You can:

- Sign in with email/password
- Sign in with OAuth providers (Google, GitHub)
- Protect routes with middleware
- Access session data in both client and server components
- Handle authentication in server actions

## Customization

To customize the auth configuration, edit `packages/auth/src/config.ts`:

- Enable/disable features
- Add more OAuth providers
- Configure session duration
- Set up email verification
- Add custom fields to the user model

For more details, see the [README.md](./README.md) and [Better Auth documentation](https://better-auth.com).
