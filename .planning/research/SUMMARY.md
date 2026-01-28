# Project Research Summary

**Project:** Finora - Personal Finance App
**Domain:** Personal finance (expense tracking + loan management)
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

Finora is a personal finance application combining expense tracking with dedicated loan payoff management and "what-if" simulation capabilities. The research reveals a strong architectural foundation using Next.js, tRPC, and Prisma, with clear needs for charting (Recharts), money handling (currency.js), and date manipulation (date-fns). The product occupies a relatively uncrowded niche between pure expense trackers (Monefy, Goodbudget) and debt-focused calculators (Undebt.it), offering both without requiring bank account linking.

The recommended approach follows a data-first architecture where financial calculations execute server-side for auditability, while "what-if" simulations run client-side using shared utilities for instant feedback. Money must be stored as integer cents to avoid floating-point precision errors, and charts should render pre-aggregated data for performance. The build order follows strict dependencies: schema → API → UI → charts, with calculation utilities established early and reused across server and client contexts.

Critical risks center on floating-point currency handling (use integer cents), amortization formula accuracy (validate against bank calculators), and chart performance with growing datasets (aggregate on backend). Additional concerns include security hardening beyond basic authentication, pie chart usability with many categories, and effective onboarding to demonstrate value immediately. These risks are mitigable with proper patterns established in the foundation phase and validation checkpoints at each stage.

## Key Findings

### Recommended Stack

The existing stack (Next.js 16, tRPC 11, Prisma 7, Better Auth) provides a solid foundation. Three strategic additions complete the technical requirements for financial features.

**Core additions:**
- **Recharts 3.7.0**: Financial visualizations — Native React components with official shadcn/ui integration, handles pie/line/area charts needed for expense breakdown and loan projections. Latest stable release with improved TypeScript support and performance optimizations.
- **currency.js 2.0.3**: Decimal-safe money calculations — Tiny footprint (1.14KB) library working with integer cents internally, provides formatting and safe arithmetic. Avoids Prisma Decimal conversion overhead while ensuring precision.
- **date-fns 4.1.0**: Date manipulation and formatting — Tree-shakeable, immutable operations, works with native Date objects. Critical for month boundaries, loan payoff projections, and chart labels.

**Implementation approach:**
- Store all monetary values as integer cents in Prisma (Int type, not Decimal or Money)
- Implement custom amortization functions rather than using unmaintained libraries
- Use Recharts with shadcn/ui chart components for consistent design system integration
- Aggregate data server-side before sending to charts to maintain performance

**What to avoid:**
- PostgreSQL @db.Money type (locale issues, no currency metadata)
- Prisma.Decimal for amounts (returns object requiring conversion, adds complexity)
- Floating-point numbers for storage (0.1 + 0.2 !== 0.3)
- Dinero.js (overkill for single-currency app, larger bundle)
- Chart.js or D3 directly (less integration with existing stack)

### Expected Features

**Must have (table stakes):**
- Transaction CRUD with income/expense distinction, date, amount, notes — users expect basic recording capabilities
- Tag/category management with multi-tag assignment — more flexible than single-category systems
- Transaction filtering by date range, type, tag, amount — finding specific transactions is essential
- Monthly summary showing income total, expense total, net — fundamental financial snapshot
- Spending breakdown by category as pie chart — core value of expense tracking
- Loan CRUD with type, principal, rate, term, minimum payment — basic debt tracking
- Payment tracking with extra payment support — enables payoff calculation
- Payoff date and total interest calculations — answers "when am I done?" question

**Should have (competitive differentiators):**
- Interactive "what-if" payoff simulator with slider UI — Finora's primary value proposition, lets users experiment with extra payments and see instant impact
- Visual payoff comparison chart — side-by-side baseline vs accelerated payoff scenarios
- Interest saved calculator — motivational display showing dollar savings from extra payments
- Amortization chart showing balance over time — visual loan progress
- Spending trend timeline — line chart revealing patterns over weeks/months, not just current snapshot
- Delightful chart visualizations — animations and polish making data "a joy to look at"
- Guided onboarding flow — introduces value props early, sets up first transaction and loan

**Defer (v2+):**
- Debt payoff strategy selection (snowball/avalanche) — complex prioritization logic, users can manually decide initially
- Recurring transaction automation — edge case handling complexity not justified for MVP
- Budget limits and spending alerts — different product category (budgeting vs tracking), adds scope
- Spending anomaly detection — requires historical pattern analysis
- Receipt attachments or OCR — nice-to-have but not core value
- Bank account syncing (Plaid) — high complexity, privacy concerns, many users prefer manual entry
- Multi-currency, shared accounts, investment tracking — explicit scope decisions to stay focused

### Architecture Approach

Finora's architecture builds on a well-structured monorepo with clear separation between presentation (apps/web), API layer (packages/api via tRPC), and data layer (packages/db via Prisma). Financial calculations live primarily on the server for auditability and precision, with shared calculation utilities exposed to the client for instant "what-if" simulation feedback. Charts render client-side using server-aggregated data to balance performance with interactivity.

**Major components:**
1. **tRPC Routers** — Entity-based organization (transaction, tag, loan, dashboard) providing CRUD operations and data aggregation. Dashboard router pre-computes summaries rather than returning raw data.
2. **Calculation Utilities** — Shared functions for amortization schedules, payoff projections, monthly payments. Used both server-side (authoritative) and client-side (interactive previews).
3. **Prisma Schema Extensions** — Finance entities (Transaction, Tag, TransactionTag, Loan, LoanPayment) with composite indexes for date-range queries. Money stored as integer cents, interest rates as Decimal.
4. **Chart Components** — Thin wrappers around Recharts receiving pre-aggregated, chart-ready data from API. Includes SpendingPieChart, SpendingTrendChart, LoanAmortizationChart, PayoffComparisonChart.

**Data flow patterns:**
- Transaction creation: form validation → tRPC mutation → convert to cents → Prisma create → React Query cache invalidation → dashboard refetch
- Dashboard aggregation: tRPC query with date range → server aggregates via Prisma (SUM, GROUP BY) → return pre-aggregated data → Recharts renders
- Loan "what-if" simulation: slider adjustment → client-side calculation utility → instant chart update (no server round-trip) → optional save scenario

**Build order:**
1. Phase 1 (Data Foundation): Prisma schema, migrations, calculation utilities
2. Phase 2 (API Layer): Tag router → Transaction router → Loan router → Dashboard router (respects dependencies)
3. Phase 3 (Core UI): Tag management → Transaction list/forms → Loan list/forms → Payment logging
4. Phase 4 (Visualizations): Dashboard layout → Spending pie chart → Spending trend → Loan amortization → What-if simulator
5. Phase 5 (Polish): Onboarding flow, settings, mobile responsiveness

### Critical Pitfalls

1. **Floating-point currency calculations** — Storing money as JavaScript Number causes precision errors (0.1 + 0.2 = 0.30000000000000004) that compound over thousands of transactions, leading to drift in totals and loss of user trust. Prevention: Store as integer cents in database, use currency.js for calculations, only convert to dollars for display. Address in Foundation phase.

2. **Amortization formula implementation errors** — Incorrect formulas, wrong compounding periods, or rounding at intermediate steps produce schedules that don't match bank statements, destroying trust in the app's core value proposition. Prevention: Use standard PMT formula, validate against CFPB/Bankrate calculators, comprehensive test suite with edge cases (0% interest, extra payment exceeding balance). Address in Loan Management phase.

3. **Security theater instead of security** — Basic email/password feels "done" but leaves financial data vulnerable to breaches, session hijacking, and credential stuffing. Prevention: Rate limiting on auth endpoints, audit logging for data access, proper session expiration, input validation on all endpoints, never log sensitive amounts. Address in Foundation phase (basics) and pre-launch security hardening phase.

4. **Chart performance degradation** — Recharts struggles with large datasets as SVG renders every point as DOM element. After a year of daily transactions (365+ points) or detailed amortization schedules (360 months), charts become sluggish. Prevention: Aggregate data on backend (weekly/monthly for >30 days), disable animations for large datasets, lazy load off-screen charts. Address in Chart Implementation phase from the start.

5. **Pie chart misuse** — Spending breakdown with 10+ tags becomes unreadable with invisible small slices and overlapping labels. Prevention: Limit to 5 categories max with "Other" grouping for remainder, provide drill-down for hidden categories, consider bar charts for many categories. Address in Dashboard/Charts phase during design.

## Implications for Roadmap

Based on research, suggested phase structure follows strict data dependencies and builds complexity progressively:

### Phase 1: Foundation & Data Model
**Rationale:** Everything depends on the data model. Financial calculations require absolute precision, so storage patterns must be correct from day one. Schema changes after data exists are risky in finance apps.

**Delivers:**
- Prisma schema with Transaction, Tag, TransactionTag, Loan, LoanPayment models
- Database migrations establishing tables and indexes
- Calculation utilities module (amortization, payoff, monthly payment functions)
- Money handling patterns (integer cents) established across codebase

**Addresses:**
- Table stakes: Data persistence, secure authentication foundation
- Pitfall #1: Floating-point currency (use integer cents in schema)
- Pitfall #3: Security basics (rate limiting, session expiration, input validation)

**Critical decisions:**
- Store all amounts as Int (cents), not Decimal or Float
- Composite indexes on [userId, date] and [userId, type] for transaction queries
- Index junction table [transactionId, tagId] for tag filtering performance
- Interest rates as Decimal for precise calculation

### Phase 2: API Layer (tRPC Routers)
**Rationale:** With schema defined, build the type-safe API layer before UI. Entity-based router organization (not feature-based) promotes reusability. Tag router must exist before Transaction router due to foreign key dependency.

**Delivers:**
- Tag router: CRUD operations, user-scoped queries
- Transaction router: CRUD with tag assignment, filtering, date-range queries
- Loan router: CRUD, payment tracking, current balance calculation
- Dashboard router: Pre-aggregated data for charts (monthly summary, spending by tag, trend data)

**Uses:**
- tRPC 11.7.2 for type-safe endpoints
- Zod 4.1.13 for input validation (pitfall #3 prevention)
- Calculation utilities from Phase 1

**Implements:**
- Server-side aggregation pattern (prevents pitfall #4)
- Money conversion layer (cents to display, display to cents)
- Authorization checks on all routes (Better Auth session context)

**Avoids:**
- N+1 query pitfalls with proper Prisma includes
- Client-side aggregation (data transfer overhead)
- Floating-point calculations in business logic

### Phase 3: Core Expense Tracking UI
**Rationale:** Build foundational features before differentiators. Tags enable categorization, transactions depend on tags, filtering requires both. This phase establishes the basic expense tracking value before adding loan features.

**Delivers:**
- Tag management: CRUD UI with color picker
- Transaction list: sortable, filterable table with pagination
- Transaction forms: add/edit with date picker, amount input, multi-tag selector
- Monthly summary display: income/expense totals with net

**Addresses:**
- Table stakes: Manual transaction entry, category assignment, transaction list, basic filtering
- Feature dependency: Tag Assignment → Spending Breakdown (enables Phase 4)

**Uses:**
- TanStack Form 1.27.3 for form handling (already in stack)
- shadcn/ui components for consistent design
- Optimistic updates pattern (fast perceived performance)

**Quality gates:**
- Date handling tests (month boundaries, timezone consistency)
- Currency display formatting consistency
- Filter accuracy validation

### Phase 4: Loan Tracking & Management UI
**Rationale:** With expense tracking functional, add the second core feature. Loan CRUD must exist before payment tracking, payments enable balance calculation, balance enables projections. Linear dependency chain.

**Delivers:**
- Loan management: CRUD UI with type selector, term input, rate input
- Payment logging: form capturing date, amount, extra payment flag
- Loan detail page: current balance, payoff date, total interest
- Payment history view: chronological list with principal/interest breakdown

**Addresses:**
- Table stakes: Loan details input, multiple loan support, payment tracking, payoff date calculation
- Feature dependency: Loan → Payment → Balance → Payoff Projection (enables Phase 5)
- Pitfall #2: Amortization formula accuracy (validate against bank calculators)

**Uses:**
- Calculation utilities from Phase 1 (shared server/client)
- date-fns for payoff date projections

**Validation checklist:**
- Monthly payment matches known calculators within $1
- Final amortization balance within $1 of zero
- Extra payment recalculates correctly
- Edge cases: 0% interest, single payment remaining

### Phase 5: Visualizations & Dashboard
**Rationale:** Charts require data to visualize, so CRUD features must exist first. Dashboard aggregates data from both expense and loan domains. This phase delivers the "delightful" visualization differentiator.

**Delivers:**
- Dashboard layout: unified view of financial status
- Spending pie chart: breakdown by tag with colors, donut variant, "Other" grouping
- Spending trend chart: weekly/monthly line chart showing patterns
- Loan amortization chart: area chart of balance over time with principal/interest split
- Interactive "what-if" simulator: slider for extra payment with real-time comparison

**Addresses:**
- Differentiators: Spending trend timeline, amortization chart, visual payoff comparison, interactive simulator, delightful visualizations
- Pitfall #4: Chart performance (server aggregation, data sampling)
- Pitfall #5: Pie chart misuse (5 category limit, "Other" grouping)

**Uses:**
- Recharts 3.7.0 with shadcn/ui chart components
- Client-side calculation utilities for instant simulator feedback
- Dashboard router's pre-aggregated data

**Quality gates:**
- Renders in <500ms with 1 year of data
- Accessible: data tables alongside charts, WCAG color contrast
- Handles edge cases: zero data points, single category, many categories
- What-if simulation: instant updates (<16ms for 60fps)

### Phase 6: Onboarding & Polish
**Rationale:** With core features functional, add the experience layer that ensures users understand value and start using the product. Research shows high drop-off after registration when users see empty dashboard.

**Delivers:**
- Guided onboarding: walkthrough adding first transaction, first tag, first loan
- Empty states: explanatory messages when no data exists
- Progress indicators: "Setup 2/4 steps complete"
- Settings page: user preferences (name, currency symbol display)
- Mobile responsiveness: touch-optimized inputs and layouts

**Addresses:**
- Differentiator: Guided onboarding
- Pitfall #10: Empty state abandonment
- Table stakes: Mobile-responsive design, user preferences

**Quality gates:**
- Onboarding completion rate >60%
- Mobile usability testing on iOS/Android
- Settings persistence validation

### Phase Ordering Rationale

- **Data before API, API before UI:** Strict dependency chain prevents rework. Changing schema after API exists is painful; changing API after UI exists is worse.
- **Foundation phase is non-negotiable:** Money handling patterns (integer cents) must be correct from day one. Retrofitting is nearly impossible once data exists.
- **Tags before Transactions:** Foreign key dependency and feature dependency (can't categorize without categories).
- **CRUD before visualizations:** Charts need data to render. Building charts first leads to mocking, which hides real performance issues.
- **Core features before polish:** Validates value proposition before investing in onboarding flow. If simulator doesn't resonate, onboarding won't save it.
- **Security hardening spans multiple phases:** Basics in Foundation (authentication, validation), continuous through API (authorization, rate limiting), pre-launch audit (comprehensive review).

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (API Layer):** Dashboard aggregation queries with Prisma — verify performance with realistic data volumes, may need query optimization research for grouping operations.
- **Phase 5 (Visualizations):** Recharts performance tuning — if 360-month amortization schedules cause issues, may need research into data sampling algorithms (LTTB) or Web Worker implementation.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Prisma schema design is well-documented with clear patterns for financial data modeling.
- **Phase 3 (Expense Tracking UI):** CRUD forms with TanStack Form + shadcn/ui are established patterns in existing stack.
- **Phase 4 (Loan Management UI):** Extends patterns from Phase 3 with same form handling approach.
- **Phase 6 (Onboarding):** UX patterns for empty states and progress indicators are well-documented, no novel technical challenges.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Recharts, currency.js, date-fns are well-maintained with official docs and active communities. Version 3.7.0 of Recharts released Jan 2025. Existing stack (Next.js, tRPC, Prisma) is proven. |
| Features | MEDIUM | Feature expectations cross-verified across 10+ sources (NerdWallet, CNBC, app reviews). Competitive landscape analysis identifies Finora's niche clearly. Some inference on MVP prioritization based on dependencies rather than user validation. |
| Architecture | HIGH | Architecture builds on existing validated codebase structure. Money-as-cents pattern is industry standard with extensive documentation. Server-side aggregation and client-side simulation patterns are proven in finance apps. |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls (floating-point, amortization errors, security) verified across multiple industry sources. Performance thresholds (Recharts with 365+ points) based on GitHub issues and documented limitations. Some mitigation strategies are informed recommendations rather than battle-tested. |

**Overall confidence:** HIGH

The research benefits from an existing, functioning codebase with clear architectural patterns. Stack additions are minimal and well-justified. The primary uncertainties are around feature prioritization (solved through MVP scoping in PRD) and real-world performance at scale (addressed through Phase 5 validation checklist).

### Gaps to Address

**Onboarding flow specifics:** Research identifies onboarding as critical (pitfall #10) but doesn't specify optimal flow. During Phase 6 planning, validate whether to use product tour library (Shepherd.js, Intro.js) or custom implementation, and determine minimum viable onboarding (just tooltips vs full walkthrough).

**Dashboard aggregation performance:** Research recommends server-side aggregation but doesn't validate Prisma query performance with large datasets. During Phase 2, benchmark aggregation queries with 1000+ transactions to confirm response times. If >500ms, research Redis caching or materialized views.

**Multi-tag pie chart visualization:** Research suggests limiting to 5 categories with "Other" grouping, but doesn't specify how to handle transactions with multiple tags (count once per tag vs split value). During Phase 5 planning, define UX for multi-tag breakdown (separate chart showing tag overlap, or proportional splitting).

**Accessibility testing approach:** Research identifies accessibility as requirement (pitfall #8) but doesn't specify testing strategy. During Phase 5, determine whether to use automated tools (axe-core, pa11y) only, or include manual screen reader testing. Budget testing time accordingly.

**Extra payment UI pattern:** "What-if" simulator is core differentiator but research doesn't specify optimal slider configuration (range, step size, display format). During Phase 5 planning, prototype slider interaction to determine whether linear slider ($0-$500) or percentage-based works better for varied loan sizes.

## Sources

### Primary (HIGH confidence)
- Recharts GitHub releases — v3.7.0 verification, feature documentation
- shadcn/ui Charts documentation — component integration patterns
- currency.js official documentation — API reference, precision handling
- date-fns official documentation — date manipulation patterns
- Prisma documentation — Decimal vs Money type recommendations
- tRPC documentation — Next.js App Router integration
- CFPB amortize module — reference amortization implementation
- Better Auth documentation — session management patterns

### Secondary (MEDIUM confidence)
- NerdWallet Best Expense Tracker Apps — feature expectations verification
- CNBC Select Best Expense Tracker Apps 2026 — competitive landscape
- YNAB Loan Planner documentation — "what-if" feature reference
- LendEDU Best Debt Payoff Apps — debt feature comparison
- Honeybadger currency calculations guide — floating-point pitfall documentation
- Robin Wieruch rounding errors article — JavaScript precision issues
- Netguru finance app mistakes article — security and UX pitfalls
- A11Y Collective accessible charts checklist — accessibility standards
- Data-to-viz pie chart issues — visualization best practices
- Recharts performance guide — large dataset handling

### Tertiary (LOW confidence)
- Recharts GitHub issue #1146 — performance thresholds (365+ points), single-issue source
- Web Worker suggestion for heavy calculations — inference, not tested in financial app context
- Specific onboarding completion rate targets — generalized UX metrics, not finance-app specific

---
*Research completed: 2026-01-29*
*Ready for roadmap: yes*
