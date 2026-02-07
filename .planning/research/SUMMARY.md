# Project Research Summary

**Project:** Finora v2.0 - Smart Finance Milestone
**Domain:** Personal finance tracker (subsequent milestone - v1 complete)
**Researched:** 2026-02-07
**Confidence:** HIGH

## Executive Summary

Finora v2.0 extends a working personal finance app with six interconnected features: recurring transactions, budgets, debt strategies, goals, analytics, and export. The existing architecture (Next.js App Router, tRPC v11, Prisma v7, BigInt cents, PostgreSQL Timestamptz) is robust and the v2 features integrate naturally without requiring infrastructure changes. Only two new dependencies are needed: jsPDF + jspdf-autotable for PDF generation (~280KB combined).

The recommended approach prioritizes features by dependency order and user impact. Build recurring transactions first (foundation for budget/goal auto-tracking), then budgets (high user value, self-contained), then goals (tag-linked mechanism), debt strategies (pure calculation), analytics (benefits from earlier features), and export last (consumes all data). This ordering avoids critical integration pitfalls: idempotent recurring generation, consistent month-boundary logic across features, and real-time data consistency.

Key risks center on temporal logic (month boundaries, timezone handling, end-of-month scheduling) and cross-feature consistency (recurring transactions must immediately affect budgets). Prevention requires extracting shared utilities for month calculation, using database-level uniqueness for idempotency, and designing budgets/goals as real-time queries rather than cached aggregations. All risks are well-documented with proven mitigation patterns from the existing codebase and industry standards.

## Key Findings

### Recommended Stack

The existing stack covers nearly all v2 requirements. Research focused on identifying gaps, not wholesale changes.

**New dependencies (only 2):**
- **jsPDF + jspdf-autotable**: PDF generation for amortization schedules and transaction reports. Chosen over alternatives (react-pdf has App Router issues, pdfmake is 3x larger). Active maintenance, TypeScript-native, works client and server-side. ~280KB combined.
- **Custom CSV generation**: Zero dependencies. Built-in APIs handle all CSV needs (20 lines of code vs 46KB papaparse overhead). Supports edge cases (commas, quotes, newlines).

**Platform features (zero dependencies):**
- **Vercel Cron Jobs**: Recurring transaction generation via daily cron + lazy generation on page load. Serverless-native (node-cron won't work). 2 free cron jobs sufficient.
- **Recharts 3.7.0**: Already installed. Supports all analytics chart types (stacked bars, grouped bars, area, line, composed, reference lines, brush). No new charting library needed.

**Deferred/rejected:**
- nuqs for URL state: Start with existing useSearchParams pattern, add only if complexity warrants it
- External scheduling services: Vercel Cron + lazy generation covers use case
- Snowball/avalanche libraries: None exist; custom implementation using existing calculations.ts patterns
- papaparse/fast-csv: Generation-only needs don't justify parsing libraries

**Integration with existing stack:**
All v2 features build on established patterns: BigInt cents + formatCents/displayToCents, tRPC entity routers, React Query hooks, raw SQL for aggregations, cursor-based pagination, Zod schemas, TanStack Form, optimistic updates.

### Expected Features

Research cross-verified across 6+ apps (YNAB, Monarch, Goodbudget, PocketGuard, Undebt.it) and multiple market analyses. v2 features fall into clear tiers.

**Must have (table stakes):**
- Recurring transactions with auto-generation, frequency selection (daily/weekly/biweekly/monthly/yearly), start/end dates
- Monthly budget limits per tag with progress bars, over-budget indicators
- Snowball and avalanche debt strategies with comparison view
- Savings goals with progress tracking, optional deadlines
- Analytics time range selector, spending by category, income vs expenses trends
- CSV transaction export, PDF amortization export

**Should have (differentiators):**
- Recurring transaction skip/modify individual occurrence
- Budget rollover (configurable per budget - defer to v2.1)
- Tag-linked auto-tracking for goals (unique: transactions auto-count toward goals)
- Hybrid debt strategy + custom priority ordering
- Month-over-month analytics comparison, budget vs actual overlay
- Explicit income targets (most apps only do savings goals)

**Defer (v3+ or avoid):**
- AI-based recurring detection from patterns (v3+, needs large dataset)
- Zero-based budgeting (YNAB-style, too opinionated)
- More than 4 debt strategies (diminishing returns past snowball/avalanche/hybrid/custom)
- Predictive spending forecasts (ML scope creep, often wrong)
- Net worth tracking (requires asset modeling beyond transaction data)

**Finora's differentiation:** Combined expense tracking + loan management + debt strategies in one app (competitors specialize). Tag-linked auto-tracking for goals. Manual-entry-first with no bank sync requirement. Configurable per-budget rollover.

### Architecture Approach

v2 extends existing architecture with new Prisma models, tRPC routers, and UI components following established patterns. Zero infrastructure changes.

**Major data models:**
1. **RecurringTransaction + RecurringTransactionTag**: Template model with nextOccurrence field for efficient querying. Links to generated transactions via optional FK. Mirrors existing Tag soft-delete pattern.
2. **Budget**: One row per user+tag with limitCents. Spent amount is real-time SUM query, not stored. No month column - budgets are always "current month" to avoid snapshot complexity.
3. **Goal + GoalTag + GoalContribution**: Hybrid tracking (auto from tagged transactions + manual contributions). Denormalized currentCents with audit trail via GoalContribution records.
4. **Debt strategies**: NO new model. Pure calculation over existing Loan data, extending calculations.ts with snowball/avalanche algorithms.

**Major routers:**
- recurring: list, create, update, pause, skip, generateDue (called on dashboard load + optional cron)
- budget: list (with spent calculation), upsert, delete, getProgress
- goal: list, create, update, addContribution, getContributions
- debt: getStrategy, getComparison (stateless calculation endpoints)
- analytics: getSpendingByCategory, getMonthlyComparison, getCategoryTrends (raw SQL)
- export: Next.js Route Handlers (not tRPC) for CSV/PDF file downloads

**Key patterns maintained:**
- Money as BigInt cents throughout
- Entity-based routers, not page-based
- Dashboard aggregation via raw SQL (db.$queryRaw)
- Cursor-based pagination with limit+1
- Custom hooks wrapping trpc.*.queryOptions()
- Optimistic updates with onMutate/onError/onSettled
- Client/Server split: Server Component pages, *-page-client.tsx for interactivity

**Integration flows:**
- Transaction creation triggers budget warning check + goal auto-contribution (both within Prisma $transaction block)
- Recurring generation creates Transactions + copies tags + triggers budget/goal flows atomically
- Budget/analytics share month-boundary utility extracted from existing dashboard.ts

### Critical Pitfalls

Top 5 risks with highest impact if not addressed from day one:

1. **Recurring duplicate generation on restart/retry** - Without idempotency, cron overlap or server restart doubles transactions. Prevention: nextOccurrence field + composite unique constraint (recurringTransactionId, generatedForDate) + Prisma $transaction with atomic updates. Database-level enforcement, not just application logic.

2. **End-of-month scheduling (31st) produces wrong-day transactions** - February 31st rolls to March 3rd via JavaScript Date overflow. Prevention: Store semantic dayOfMonth value, clamp with Math.min(day, daysInMonth), test all months including Feb leap years. Offer "last day of month" option explicitly.

3. **Month boundary disagreement between dashboard/budgets/analytics** - Three features compute "January" differently (JS Date constructors vs date-fns vs SQL date_trunc). Prevention: Extract single getMonthBoundaries() utility from existing dashboard.ts, use everywhere. Be explicit about timezone in SQL: date_trunc('month', date AT TIME ZONE $tz).

4. **Debt strategy rounding errors accumulate across multiple loans** - Independent rounding of 5 loans loses/doubles cents, drifting payoff dates by months. Prevention: Use "largest remainder" distribution method, cap payment at remaining balance with cascade to next loan, assert sum(allPayments) === totalAvailable at each step.

5. **Budget spent calculation lags behind recurring transaction generation** - If budgets cache totals, generated transactions bypass the cache. Prevention: Design budgets as real-time SUM queries (simplest), or ensure recurring generator invalidates cache within same Prisma transaction. Test: create recurring, trigger generation, verify budget updates immediately.

Additional moderate risks: timezone-unaware date_trunc in analytics SQL, BigInt serialization breaks JSON/CSV export (needs explicit Number() conversion), export memory exhaustion without streaming (use cursor-based batching).

## Implications for Roadmap

Based on dependency analysis and risk mitigation priorities, recommended 6-phase structure for v2:

### Phase 7: Schema Migration + Recurring Transactions
**Rationale:** Schema migration must come first (all v2 models in one atomic migration). Recurring transactions are the most foundational v2 feature - they produce Transaction records that feed into budgets, goals, and analytics. Building it first provides richer test data for downstream features and establishes the idempotency/month-boundary patterns other features will reuse.

**Delivers:** All new Prisma models (RecurringTransaction, RecurringTransactionTag, Budget, Goal, GoalTag, GoalContribution, Transaction.recurringTransactionId addition). Recurring transaction CRUD (list, create, update, pause, skip). Generation engine (lazy on page load + optional Vercel Cron). UI: recurring list, form, cards with upcoming preview.

**Addresses:** Recurring transaction table stakes from FEATURES.md (auto-generation, frequency, start/end dates). Establishes nextOccurrence pattern.

**Avoids:** Pitfalls #1 (duplicate generation), #2 (end-of-month), #5 (budget integration - designed but not yet integrated).

**Research flags:** Standard patterns (no additional research needed). Well-documented scheduling logic, existing similar implementations in YNAB/Goodbudget.

### Phase 8: Budgets
**Rationale:** Budgets depend only on Tags + Transactions (both exist in v1). Self-contained feature with high user value. Real-time spent calculation pattern established here becomes the template for goals and analytics. Budget warnings integrate into transaction creation as minimal cross-cutting addition.

**Delivers:** Budget router with dynamic spent calculation (raw SQL following dashboard.ts pattern). Budget UI (cards with progress bars, form, warning thresholds). Budget warning integration in transaction.create mutation (returns budgetWarnings array in response). Extraction of shared month-boundary utility from dashboard.ts.

**Uses:** Existing Tag model, Transaction aggregation patterns from dashboard.

**Implements:** Real-time query architecture (no caching), per-tag budget limits without month snapshots.

**Avoids:** Pitfalls #3 (month boundary consistency), #7 (rollover complexity - deferred), #8 (tag lifecycle - designed for soft-delete).

**Research flags:** Standard patterns (no additional research). Budget progress bars and limit tracking are universal in personal finance apps.

### Phase 9: Goals
**Rationale:** Goals depend on Tags + Transactions (exist) and benefit from recurring transactions already generating data. More complex than budgets (two types - SAVINGS/INCOME, hybrid tracking with auto-contributions, manual adds, audit trail). Tag-linked auto-tracking mechanism parallels budget-tag connection, reusing patterns.

**Delivers:** Goal router with contribution tracking (list, create, update, addContribution, getContributions). Goal UI (cards with progress rings, form, contribution history, deadline handling). Auto-contribution integration in transaction.create (similar to budget warnings but modifies Goal.currentCents). Income target tracking with monthly aggregation.

**Uses:** Tag-linked tracking pattern established, Transaction model, GoalContribution audit trail.

**Implements:** Hybrid tracking (auto from tagged transactions + manual contributions), denormalized currentCents with recalculable integrity.

**Avoids:** Pitfalls #9 (progress consistency - real-time query), #16 (deadline anxiety - nullable deadlines, positive messaging).

**Research flags:** Standard patterns with one unique element (tag-linked auto-tracking). Test hybrid tracking edge cases during implementation.

### Phase 10: Debt Strategies
**Rationale:** Pure calculation over existing Loan data. No new models (stateless). Can be built independently. More niche than budgets/goals (affects users with multiple loans only), so deprioritized despite self-contained scope. TDD-friendly (complex algorithm, pure functions).

**Delivers:** Snowball/avalanche calculation utilities in calculations.ts (extends existing projectPayoff pattern). Debt router (getStrategy, getComparison - stateless endpoints). Debt strategy UI section on loans page (comparison table, allocation view, debt-free countdown). Optional: hybrid strategy and custom priority ordering.

**Uses:** Existing Loan model, calculations.ts foundation (calculateMonthlyPayment, projectPayoff, calculateCompoundInterest).

**Implements:** Multi-loan payment allocation with priority-based distribution, cascade logic when loans pay off mid-month.

**Avoids:** Pitfalls #4 (rounding errors - largest remainder method), #13 (cascade logic - freed payments redistribute within same month).

**Research flags:** Algorithm logic is well-documented (Ramsey Solutions, Fidelity). Test edge cases (0% loans, minimum exceeds budget, multi-loan payoff in one month).

### Phase 11: Analytics
**Rationale:** Read-only aggregation over Transaction + Tag data. Benefits from budgets existing (can overlay budget limits on charts). Replaces placeholder page with full feature. Heavier queries (multi-month GROUP BY) than dashboard, so raw SQL is mandatory for performance.

**Delivers:** Analytics router with raw SQL queries (getSpendingByCategory, getMonthlyComparison, getCategoryTrends, getIncomeVsExpenses). Full analytics page UI (4+ chart types: stacked bars, grouped bars, area, line). Time range selector (3mo/6mo/1yr/custom). Budget vs actual overlay. Spending trend indicators (up/down arrows, percentage change).

**Uses:** Recharts 3.7.0 (already installed), raw SQL pattern from dashboard.ts, shared month-boundary utility from budgets phase.

**Implements:** Multi-month aggregation with GROUP BY month/tag, timezone-aware date_trunc, composite indexes for performance.

**Avoids:** Pitfalls #6 (slow queries - raw SQL + indexes), #12 (timezone-unaware date_trunc), #17 (re-fetch on granularity toggle - fetch once, aggregate client-side).

**Research flags:** Standard charting patterns. Verify composite index performance with EXPLAIN ANALYZE during implementation.

### Phase 12: Export + Dashboard Integration + Polish
**Rationale:** Export depends on all data being in place (transactions, loans, budgets, goals, debt strategies). Dashboard integration pulls v2 widgets together. Final polish phase for edge cases, loading states, and user flow refinement.

**Delivers:** CSV export route handler (transactions, budgets, goals). PDF export route handler (amortization schedules). Dashboard widgets (budget summary, goal progress, recurring status). Filter-aware export (respect current transaction filters). Loading/empty states for all v2 features. UTF-8 BOM for Excel compatibility.

**Uses:** jsPDF + jspdf-autotable (new dependencies installed this phase), custom CSV generation, Next.js Route Handlers for file downloads.

**Implements:** Streaming export with cursor-based pagination for large datasets, BigInt-to-Number serialization for JSON/CSV.

**Avoids:** Pitfalls #10 (BigInt serialization), #11 (memory exhaustion - streaming), #14 (CSV encoding - UTF-8 BOM).

**Research flags:** PDF generation library API (jsPDF) - verify specifics during implementation. Streaming pattern is standard.

### Phase Ordering Rationale

- **Schema first, recurring foundation:** Single migration avoids schema fragmentation. Recurring transactions generate data for all downstream features to consume.
- **Budgets before goals:** Simpler feature (one entity vs three), establishes real-time query pattern. Higher immediate user value (budget tracking is more universal than goal setting).
- **Debt after budgets/goals:** More niche feature (affects subset of users). Self-contained, can be built in parallel if desired.
- **Analytics after budgets:** Gains budget overlay capability. Heavy aggregation logic separated from dashboard lightweight queries.
- **Export last:** Maximum value when all features exist. Most dependent feature.

**Parallel opportunities:** Phases 8 (Budgets) and 10 (Debt Strategies) have zero dependencies on each other - can be built simultaneously. Phase 11 (Analytics) could start after Phase 7 since it only reads existing transaction data.

**Integration sequence prevents pitfalls:** Phase 7 establishes idempotency pattern. Phase 8 extracts shared month-boundary utility. Phases 9-12 reuse both patterns, avoiding duplicate bugs.

### Research Flags

**Phases with standard patterns (skip /gsd:research-phase):**
- **Phase 7 (Recurring):** Scheduling logic, cron patterns, and idempotency are well-documented across YNAB, Goodbudget, industry articles. Straight implementation.
- **Phase 8 (Budgets):** Budget progress tracking and limit logic are universal. Existing aggregation patterns apply.
- **Phase 9 (Goals):** Progress tracking mirrors budgets. Contribution audit trail is standard CRUD.
- **Phase 11 (Analytics):** Charting and aggregation patterns are well-established. Existing raw SQL approach scales.

**Phases needing implementation-time verification (no additional research-phase, but test edge cases):**
- **Phase 10 (Debt Strategies):** Algorithm logic is documented, but cascade behavior and rounding need TDD. Write algorithm tests first, verify against known amortization schedules.
- **Phase 12 (Export):** jsPDF API specifics should be verified during implementation. Streaming patterns are standard but test with realistic data volumes (5K+ transactions).

**No research-phase calls needed for v2.** All features are well-documented in the domain. Implementation-time testing and validation covers remaining uncertainties.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Minimal new dependencies (2). Existing stack proven in v1. jsPDF is actively maintained with TypeScript support (v4.1.0, Jan 2026). Vercel Cron is official platform feature. Custom CSV avoids library overhead. |
| Features | MEDIUM-HIGH | Cross-verified across 6+ apps and market analyses. Table stakes are universal. Differentiators (tag-linked goals, explicit income targets) are validated patterns but uniquely combined in Finora. Confidence docked slightly for rollover complexity (deferred). |
| Architecture | HIGH | All patterns extend existing v1 architecture. Direct codebase analysis of every router, model, and component. Prisma v7 multi-file schema already in use. tRPC v11 patterns established. Raw SQL aggregation proven in dashboard. BigInt cents handling comprehensive. |
| Pitfalls | HIGH | Top 5 critical pitfalls are well-documented with proven mitigations (idempotency, month boundaries, timezone handling, rounding distribution, real-time queries). Moderate pitfalls have clear prevention strategies. Phase-specific risks mapped to specific phases. |

**Overall confidence:** HIGH

v2 is a natural extension of v1 with minimal infrastructure risk. The existing architecture handles all requirements. Critical risks have database-level or pattern-level solutions. Feature expectations are validated across competitors. Only uncertainty is rollover complexity (deferred to post-v2.0).

### Gaps to Address

**During Phase 7 (Recurring):**
- Finalize lazy generation vs cron-only strategy: Recommend lazy (on page load) as primary with cron as backup. Lazy provides user feedback, cron handles edge cases if user doesn't visit.
- Timezone handling for nextOccurrence: If user timezone is added to User model, recurring generation must respect it. If not, default to UTC with clear documentation. Extracted month-boundary utility from Phase 8 will establish pattern.

**During Phase 8 (Budgets):**
- Rollover decision: Ship without rollover initially (avoid Pitfall #7 complexity). Add as v2.1 enhancement after observing user feedback on base budgets. If added, use snapshot approach (store rollover at month-end, don't retroactively recalculate).

**During Phase 10 (Debt Strategies):**
- Hybrid strategy formula: If implemented, validate scoring formula (balance weight + rate weight) against real loan datasets. Start with simple 50/50 weighting, allow user adjustment in v2.1+ if desired.

**During Phase 12 (Export):**
- PDF generation server-side limits: Verify jsPDF memory usage with 60+ month amortization schedules. May need pagination for very long-term loans (30-year mortgages). Test with realistic loan sizes during implementation.

**Cross-phase:**
- User timezone storage: Currently not in v1 User model. Month-boundary logic in Phase 8 should add optional timezone field. Affects recurring (Phase 7 retroactively), budgets (Phase 8), analytics (Phase 11). Default to UTC if null for backward compatibility. Consider adding timezone selector in settings during Phase 8.

All gaps are implementation decisions, not research gaps. No additional research-phase needed.

## Sources

### PRIMARY (HIGH confidence)

**Codebase analysis (v1):**
- All existing routers: `packages/api/src/routers/*.ts` (dashboard, transaction, loan, tag, user)
- All Prisma models: `packages/db/prisma/schema/*.prisma` (auth, finance)
- Calculation utilities: `packages/api/src/lib/calculations.ts`, `packages/api/src/lib/money.ts`
- UI patterns: `apps/web/src/components/*`, `apps/web/src/hooks/use-*.ts`
- Dashboard aggregation pattern: `dashboard.ts:85-109` (raw SQL with $queryRaw)

**Official documentation:**
- [jsPDF npm](https://www.npmjs.com/package/jspdf) - v4.1.0, published Jan 2026
- [jsPDF-AutoTable npm](https://www.npmjs.com/package/jspdf-autotable) - v5.0.7
- [Vercel Cron Jobs documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Cron pricing/limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Recharts API](https://recharts.github.io/en-US/api/)
- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)

**Competitor feature analysis:**
- [YNAB Scheduled Transactions](https://support.ynab.com/en_us/scheduled-transactions-a-guide-BygrAIFA9)
- [Monarch Money Budgeting](https://www.monarch.com/features/budgeting)
- [PocketGuard Rollover Budget](https://help.pocketguard.com/hc/en-us/articles/16287882423836-Rollover-budget-feature)
- [Undebt.it 7 Payoff Plans](https://undebt.it/blog/undebt-it-payoff-plans/)
- [Goodbudget Scheduled Fills](https://goodbudget.com/help/budgeting-with-goodbudget/how-to-schedule/)
- [Beyond Budget CSV/PDF Export](https://www.beyondbudgetapp.com/transactions/csv-pdf-export)

### SECONDARY (MEDIUM confidence)

**Implementation patterns:**
- [Traveling Coderman - Idempotent Cron Jobs](https://traveling-coderman.net/code/node-architecture/idempotent-cron-job/)
- [Mercari Engineering - Race Conditions in DB Transactions](https://engineering.mercari.com/en/blog/entry/20241206-the-race-condition-in-multiple-db-transactions-and-the-solutions/)
- [Firefly III - Recurring at End of Month Issue](https://github.com/firefly-iii/firefly-iii/issues/5830)
- [Green Dot - Recurring Transfer Scheduling](https://www.greendot.com/helpcenter/add-money/bank-transfer/)
- [Actual Budget - How Budgeting Works](https://actualbudget.org/docs/budgeting/)
- [DEV Community - Processing 1M SQL Rows to CSV](https://dev.to/danielevilela/processing-1-million-sql-rows-to-csv-using-nodejs-streams-3in2)
- [Medium - Timezone with date_trunc in PostgreSQL](https://medium.com/@ajaymaurya73130/how-to-handle-time-zones-with-date-trunc-in-postgresql-34d4298458b6)

**Market analysis:**
- [Bountisphere 2025 Personal Finance App Review](https://bountisphere.com/blog/personal-finance-apps-2025-review)
- [NerdWallet Best Budget Apps 2026](https://www.nerdwallet.com/finance/learn/best-budget-apps)
- [CNBC Best Tools for 2026 Financial Goals](https://www.cnbc.com/select/best-money-tips-to-help-reach-2026-financial-goals/)
- [WildNetEdge - Personal Finance Apps User Expectations 2025](https://www.wildnetedge.com/blogs/personal-finance-apps-what-users-expect-in-2025)

**Financial algorithms:**
- [Ramsey Solutions - Debt Snowball vs Avalanche](https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche)
- [Fidelity - Avalanche Snowball Debt](https://www.fidelity.com/learning-center/personal-finance/avalanche-snowball-debt)
- [National Debt Relief - Best Snowball Apps 2025](https://www.nationaldebtrelief.com/blog/financial-wellness/budgeting/top-5-best-apps-for-debt-snowball-method-in-2025/)

### TERTIARY (LOW confidence, needs validation)

**Library comparisons (used for elimination only):**
- [npm-compare: PDF libraries](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf)
- [LeanLabs - JS CSV Parsers Benchmarks](https://leanylabs.com/blog/js-csv-parsers-benchmarks/)
- [@react-pdf/renderer App Router issues](https://github.com/diegomura/react-pdf/issues/2460)
- [Prisma Issue #11130 - findMany vs queryRaw Performance](https://github.com/prisma/prisma/issues/11130)

---
**Research completed:** 2026-02-07
**Ready for roadmap:** YES

**Next step:** Load SUMMARY.md during roadmap creation. Phase suggestions above become starting point for ROADMAP.md structure. All critical pitfalls have phase assignments for mitigation planning.
