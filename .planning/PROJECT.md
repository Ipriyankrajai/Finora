# Finora

## What This Is

A personal finance app that helps users understand where their money goes, stay within budgets, reach savings goals, and pay off debt strategically. Users track income and expenses with tags, set budgets per category, create savings and income goals, view deep analytics on spending patterns, manage loans with interactive payoff projections and multi-loan debt strategies, and export their data. Built for a broader audience who want clarity and control over their finances.

## Core Value

Users can see exactly where their money goes (by tag, over time), stay on budget, track progress toward financial goals, and optimize their debt payoff strategy.

## Current Milestone: v2.0 Smart Finance

**Goal:** Transform Finora from a tracker into a proactive financial planning tool with budgets, goals, debt strategies, recurring transactions, analytics, and export.

**Target features:**
- Recurring transactions (auto-generate on schedule)
- Budgets (monthly limits per tag with progress tracking)
- Debt strategies (snowball/avalanche with payment allocation)
- Goals (savings targets + income targets with auto-tracking)
- Analytics page (deep pattern analysis, differentiated from dashboard)
- Export (CSV transactions, PDF amortization)

## Requirements

### Validated

- ✓ User authentication with email/password — v1
- ✓ Type-safe API layer with tRPC — v1
- ✓ PostgreSQL database with Prisma ORM — v1
- ✓ shadcn/ui component library — v1
- ✓ Dark mode support — v1
- ✓ Monorepo structure with Turborepo — v1
- ✓ Transaction CRUD (income and expenses) — v1
- ✓ Transaction filtering by date, type, tag, amount — v1
- ✓ Tags CRUD with color support — v1
- ✓ Multi-tag assignment to transactions — v1
- ✓ Dashboard with monthly summary (income, expenses, net) — v1
- ✓ Spending breakdown pie chart by tag — v1
- ✓ Spending trend timeline chart (weeks/months) — v1
- ✓ Loans CRUD (car, home, personal, other) — v1
- ✓ Loan payment tracking with extra payment support — v1
- ✓ Loan detail page with payoff summary — v1
- ✓ Loan amortization chart (balance over time) — v1
- ✓ Interactive "what if" payoff simulator for extra payments — v1
- ✓ Account settings (name, currency symbol display) — v1
- ✓ Guided onboarding introducing expense tracking and loan features — v1

### Active

- [ ] Recurring transactions with daily/weekly/monthly/yearly frequency
- [ ] Skip or modify individual recurring transaction occurrences
- [ ] Monthly budget limits per tag
- [ ] Budget progress tracking (spent vs limit)
- [ ] Budget warnings when approaching/exceeding limit
- [ ] Savings goals with target amount and optional deadline
- [ ] Income targets with monthly reset
- [ ] Goal progress via tag-linked transactions or manual contributions
- [ ] Debt payoff strategy selection (snowball vs avalanche)
- [ ] Recommended payment allocation across multiple loans
- [ ] Debt-free countdown date
- [ ] Analytics page with customizable time ranges
- [ ] Spending trend comparisons across periods
- [ ] Category/tag analysis over time
- [ ] Income vs expenses historical view
- [ ] Export transactions to CSV
- [ ] Export loan amortization schedule to PDF

### Out of Scope

- Bank account syncing (Plaid) — complexity, not core value
- Google OAuth / magic link auth — email/password sufficient
- Multi-currency conversion — display-only currency symbol
- Receipt attachments/OCR — not core value
- Shared/family accounts — single-user focus
- Credit score, investing, taxes — different product category
- Smart alerts/notifications — v3+ feature
- Mobile native app — web-first

## Context

**Target users:**
1. **Everyday tracker** — wants to see where money goes without complexity
2. **Goal-driven borrower** — has loans, wants to understand payoff timeline
3. **Budget-conscious planner** — wants to set limits and track against them
4. **Goal setter** — saving for specific targets, tracking income goals

**User journey (v2):**
- Recurring transactions reduce manual entry for regular income/expenses
- Budgets give monthly spending guardrails per category
- Goals give longer-term targets to work toward (savings, income)
- Debt strategies optimize loan payoff across multiple loans
- Analytics page reveals patterns dashboard can't show (multi-month trends, period comparisons)
- Export lets users take their data to spreadsheets or advisors

**Dashboard vs Analytics split:**
- Dashboard = "How am I doing right now?" — this month's snapshot, current balances, recent activity
- Analytics = "What are my patterns and where am I heading?" — time ranges, comparisons, trend analysis

**Existing foundation:**
- Next.js 16 with App Router
- tRPC 11 with React Query
- Prisma 7 with PostgreSQL
- Better Auth with email/password
- shadcn/ui (base-lyra style) with Tailwind v4
- Turborepo monorepo
- Recharts for charts, date-fns for dates, currency.js for formatting
- TanStack Form + Zod for form validation

## Constraints

- **Data model**: Extend existing Prisma schema (add RecurringTransaction, Budget, Goal models)
- **Charting**: Use Recharts for visualizations (already established)
- **Forms**: TanStack Form + Zod (established pattern from v1)
- **Auth**: Email/password only (Better Auth already configured)
- **Currency**: Display-only symbol, no conversion
- **Money**: BigInt cents storage pattern (established in v1)
- **Export**: Server-side generation for CSV/PDF (no client-side file generation)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Both expense tracking and loan features are equally core | User wants to address "where does my money go" AND loan payoff visibility | ✓ Good |
| Guided onboarding for new users | Introduces both value props early, not just empty dashboard | ✓ Good |
| Delightful visualizations | Charts are a differentiator, not commodity | ✓ Good |
| BigInt cents for money storage | Safety margin over Int for large transactions | ✓ Good |
| Email/password auth only for MVP | Simplify auth, OAuth can come later | ✓ Good |
| Goals are savings targets + income targets only | Spending limits covered by Budgets, debt payoff by Debt Strategies — no unified wrapper | — Pending |
| Dashboard vs Analytics split | Dashboard = current snapshot, Analytics = patterns over time with time-range selection | — Pending |
| Hybrid goal tracking | Tag-linked auto-tracking + manual contributions for savings goals | — Pending |

---
*Last updated: 2026-02-07 after v2.0 milestone start*
