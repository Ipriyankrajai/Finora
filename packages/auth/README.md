# @finora/auth

Better Auth configuration for the Finora monorepo.

## Features

- 🔐 Email & Password authentication
- 🌐 OAuth providers (Google, GitHub)
- 🔄 Session management
- 🗄️ Database integration with Prisma
- 📱 React hooks for client-side
- 🔒 Secure cookie-based sessions

## Installation

This package is part of the Finora monorepo and doesn't need separate installation.

## Setup

### 1. Update Prisma Schema

Add the required auth tables to your `packages/database/prisma/schema.prisma`:

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
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finora"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 3. Run Database Migrations

```bash
cd packages/database
bun run db:push
```

## Usage

### Server-side (API Routes)

Create an API route in your Next.js app at `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@finora/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Client-side (React Components)

```typescript
import { signIn, signUp, signOut, useSession } from "@finora/auth";

function LoginForm() {
  const { data: session, isPending } = useSession();

  const handleSignIn = async (email: string, password: string) => {
    await signIn.email({
      email,
      password,
    });
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    await signUp.email({
      email,
      password,
      name,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isPending) return <div>Loading...</div>;

  if (session) {
    return (
      <div>
        <p>Welcome, {session.user.name}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      {/* Your sign in/up form */}
    </div>
  );
}
```

### OAuth Sign In

```typescript
import { signIn } from "@finora/auth";

function SocialLogin() {
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const handleGithubSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleGithubSignIn}>Sign in with GitHub</button>
    </div>
  );
}
```

### Protecting Routes (Middleware)

Create `middleware.ts` in your Next.js app:

```typescript
import { auth } from "@finora/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

## Configuration Options

The auth configuration in `src/config.ts` supports:

- **Email & Password**: Enable/disable, email verification
- **Social Providers**: Google, GitHub, and more
- **Session Management**: Expiration, update frequency, cookie cache
- **Advanced Options**: Cookie prefix, cross-subdomain cookies, trusted origins

Customize these settings based on your requirements.

## Learn More

- [Better Auth Documentation](https://better-auth.com)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
