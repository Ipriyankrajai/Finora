# Finora

## What This Is

A personal finance app that helps users understand where their money goes and when their loans will be paid off. Users track income and expenses with tags, view spending breakdowns and trends, and manage loans with interactive payoff projections. Built for a broader audience who want clarity on their finances without the complexity of full-featured budgeting tools.

## Core Value

Users can see exactly where their money goes (by tag, over time) and when their loans will be paid off (with "what if" simulations for extra payments).

## Requirements

### Validated

- ✓ User authentication with email/password — existing
- ✓ Type-safe API layer with tRPC — existing
- ✓ PostgreSQL database with Prisma ORM — existing
- ✓ shadcn/ui component library — existing
- ✓ Dark mode support — existing
- ✓ Monorepo structure with Turborepo — existing

### Active

- [ ] Guided onboarding introducing expense tracking and loan features
- [ ] Transaction CRUD (income and expenses)
- [ ] Transaction filtering by date, type, tag, amount
- [ ] Tags CRUD with color support
- [ ] Multi-tag assignment to transactions
- [ ] Dashboard with monthly summary (income, expenses, net)
- [ ] Spending breakdown pie chart by tag
- [ ] Spending trend timeline chart (weeks/months)
- [ ] Loans CRUD (car, home, personal, other)
- [ ] Loan payment tracking with extra payment support
- [ ] Loan detail page with payoff summary
- [ ] Loan amortization chart (balance over time)
- [ ] Interactive "what if" payoff simulator for extra payments
- [ ] Account settings (name, currency symbol display)

### Out of Scope

- Bank account syncing (Plaid) — complexity, not core to MVP value
- Google OAuth / magic link auth — email/password sufficient for MVP
- Multi-currency conversion — display-only currency symbol for MVP
- Recurring transactions — V1+ feature
- Budgets and spending limits — V1+ feature
- Receipt attachments — V1+ feature
- Shared/family accounts — V1+ feature
- Credit score, investing, taxes — different product category
- Smart insights and alerts — V1+ feature

## Context

**Target users:**
1. **Everyday tracker** — wants to see where money goes without complexity
2. **Goal-driven borrower** — has loans, wants to understand payoff timeline

**User journey:**
- New users go through guided onboarding introducing both features
- Expense tracking: add transactions with tags, see pie chart and trends
- Loan tracking: add loan details, log payments, see payoff projection with "what if" slider

**Visualization quality:**
- Charts need to be "delightful" — a differentiator, not just functional
- Key charts: spending pie by tag, spending timeline, loan amortization, payoff comparison

**Existing foundation:**
- Next.js 16 with App Router
- tRPC 11 with React Query
- Prisma 7 with PostgreSQL
- Better Auth with email/password
- shadcn/ui (base-lyra style) with Tailwind v4
- Turborepo monorepo

## Constraints

- **Data model**: Follow PRD schema closely (Prisma entities for User, Transaction, Tag, TransactionTag, Loan, LoanPayment)
- **Charting**: Use Recharts for visualizations
- **Forms**: react-hook-form + zod for validation
- **Auth**: Email/password only (Better Auth already configured)
- **Currency**: Display-only symbol, no conversion

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Both expense tracking and loan features are equally core | User wants to address "where does my money go" AND loan payoff visibility | — Pending |
| Guided onboarding for new users | Introduces both value props early, not just empty dashboard | — Pending |
| Delightful visualizations | Charts are a differentiator, not commodity | — Pending |
| Follow PRD data model | User has thought through the schema | — Pending |
| Email/password auth only for MVP | Simplify auth, OAuth can come later | — Pending |

---
*Last updated: 2026-01-29 after initialization*
