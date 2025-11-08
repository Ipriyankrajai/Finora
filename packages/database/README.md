# @repo/database

Shared database package using Prisma ORM for the Finora monorepo.

## Setup

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Update the `DATABASE_URL` in `.env` with your database credentials.

3. Install dependencies:
```bash
bun install
```

4. Generate Prisma Client:
```bash
bun run db:generate
```

5. Push the schema to your database:
```bash
bun run db:push
```

## Usage

Import the Prisma client in your apps:

```typescript
import { prisma } from "@repo/database";

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

