# @finora/database

Shared database package using Prisma ORM for the Finora monorepo.

## Setup

1. Create a `.env` file in the **root** of the monorepo (not in this package):
```bash
# From the root directory
touch .env
```

2. Add your `DATABASE_URL` to the root `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finora?schema=public"
```

3. Install dependencies (from root):
```bash
bun install
```

4. Generate Prisma Client:
```bash
# From root
bun db:generate
# Or from this package
bun run db:generate
```

5. Push the schema to your database:
```bash
# From root
bun db:push
# Or from this package
bun run db:push
```

> **Note:** All database scripts automatically load environment variables from the root `.env` file using `dotenv-cli`.

## Usage

Import the Prisma client in your apps:

```typescript
import { prisma } from "@finora/database";

const users = await prisma.user.findMany();
```

## Scripts

- `db:generate` - Generate Prisma Client
- `db:push` - Push schema changes to database (for development)
- `db:migrate` - Create and apply migrations (for production)
- `db:studio` - Open Prisma Studio to view and edit data
- `db:seed` - Seed the database with initial data

## Development Workflow

1. Make changes to `prisma/schema.prisma`
2. Run `bun run db:generate` to update the Prisma Client
3. Run `bun run db:push` to apply changes to your database
4. (Optional) Run `bun run db:studio` to view your data

## Production Workflow

1. Make changes to `prisma/schema.prisma`
2. Run `bun run db:migrate` to create a migration
3. Commit the migration files
4. Deploy your application (migrations will run automatically)

