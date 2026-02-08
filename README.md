# Finora

A personal finance app that helps you understand where your money goes and when your loans will be paid off.

## Overview

Finora is designed for two core user personas:

- **Everyday tracker** - Wants to see where money goes without complexity
- **Goal-driven borrower** - Has loans and wants to understand payoff timelines

The app lets you track spending patterns by category and simulate loan payoff scenarios with interactive "what-if" features.

## Features

### Expense Tracking
- Create income/expense transactions with date, amount, and optional notes
- Tag-based categorization with multi-tag support per transaction
- Filter transactions by date range, type, tag, and amount
- Monthly summary dashboard showing income, expenses, and net balance
- Spending breakdown visualization by category
- Spending trend timeline showing patterns over weeks/months

### Loan Management
- Create and manage loans (car, home, personal, other types)
- Log payments with support for extra payments
- Calculate remaining balance and total interest paid
- Project payoff dates based on payment schedule
- Interactive "what-if" simulator for extra payment scenarios
- Amortization chart showing balance over time

### Account Management
- Email/password authentication
- User profile with display name
- Currency symbol display preferences

## Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Bun 1.3.2 |
| **Frontend** | Next.js 16, React 19, React Compiler |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **API** | tRPC 11, React Query 5 |
| **Database** | PostgreSQL, Prisma 7 |
| **Authentication** | Better-Auth |
| **Monorepo** | Turborepo |
| **Code Quality** | TypeScript 5, Biome |

### Planned Libraries
- **Recharts** - Chart visualizations
- **currency.js** - Decimal-safe money calculations
- **date-fns** - Date manipulation

## Project Structure

```
finora/
├── apps/
│   └── web/              # Next.js full-stack application
├── packages/
│   ├── api/              # tRPC API layer (routers & procedures)
│   ├── auth/             # Better-Auth configuration
│   ├── db/               # Prisma ORM & database schema
│   ├── env/              # Type-safe environment variables
│   └── config/           # Shared TypeScript configuration
└── .planning/            # Project documentation & roadmap
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.3.2 or later
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finora
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env
```
Update `apps/web/.env` with your PostgreSQL connection details.

4. Apply the database schema:
```bash
bun run db:push
```

5. Start the development server:
```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all applications in development mode |
| `bun run build` | Build all applications for production |
| `bun run typecheck` | Check TypeScript types across all packages |
| `bun run db:push` | Push schema changes to database |
| `bun run db:studio` | Open Prisma Studio for visual database exploration |
| `bun run lint` | Run Biome formatting and linting |

## Architecture

### Data Flow
```
React Components → tRPC Client → tRPC Server → Prisma → PostgreSQL
```

### Key Design Decisions

- **Money as Cents**: All monetary amounts stored as integers to avoid floating-point precision errors
- **Server-side Aggregation**: Dashboard data aggregated on backend for performance
- **End-to-end Type Safety**: TypeScript across frontend, API, and database layers

## Development Roadmap

1. **Foundation** - Database schema, calculation utilities
2. **API Layer** - tRPC routers for tags, transactions, loans
3. **Tags & Transactions UI** - Tag management and transaction CRUD
4. **Loans UI** - Loan management, payment tracking
5. **Visualizations** - Charts, what-if simulator, dashboard
6. **Onboarding & Polish** - Guided onboarding, settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses Biome for linting and formatting:
- Tabs for indentation
- Double quotes for strings

Run `bun run lint` before committing.

## License

This project is private and not licensed for public use.
