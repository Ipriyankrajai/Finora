# Quick Start Guide

Get authentication up and running in 5 minutes!

## 1. Install Dependencies

```bash
bun install
```

## 2. Add Database Tables

Update `packages/database/prisma/schema.prisma` with the auth tables from `README.md`, then:

```bash
cd packages/database
bun run db:push
```

## 3. Set Environment Variables

Create `.env.local` in your app:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finora"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Create API Route

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@finora/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## 5. Add Middleware (Optional)

Create `middleware.ts` in your app root:

```typescript
import { createAuthMiddleware } from "@finora/auth/middleware";

export const middleware = createAuthMiddleware({
  protectedRoutes: ["/dashboard"],
  publicRoutes: ["/", "/login"],
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## 6. Use in Your App

### Client Component

```typescript
"use client";
import { useAuth, signOut } from "@finora/auth";

export function MyComponent() {
  const auth = useAuth();

  if (auth.status === "authenticated") {
    return (
      <div>
        <p>Welcome {auth.session.user.name}!</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return <a href="/login">Sign In</a>;
}
```

### Server Component

```typescript
import { getSession } from "@finora/auth/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <h1>Welcome {session.user.name}!</h1>;
}
```

## Next Steps

- Check out `examples/` folder for complete component examples
- Read `INTEGRATION.md` for detailed integration guide
- See `README.md` for full API documentation

## Need Help?

- [Better Auth Docs](https://better-auth.com)
- Check the examples in `packages/auth/examples/`
- Review the integration guide in `INTEGRATION.md`
