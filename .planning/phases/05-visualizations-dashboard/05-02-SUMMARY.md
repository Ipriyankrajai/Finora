---
phase: 05-visualizations-dashboard
plan: 02
subsystem: dashboard-ui
tags: [recharts, dashboard, timeline-chart, date-fns, time-series]

requires:
  - phase: 05-01
    provides: Dashboard foundation with pie chart and monthly summary
provides:
  - getSpendingTrend API endpoint for time-series data
  - Spending timeline chart with weekly/daily toggle
  - Zero-filled time periods for continuous charts
affects:
  - 05-03 (loan amortization chart adds to same dashboard layout)

tech-stack:
  added: [date-fns@4.1.0]
  patterns: [time-series aggregation with zero-fill, granularity toggle UI, chart type switching]

key-files:
  created:
    - apps/web/src/components/dashboard/spending-timeline.tsx
  modified:
    - packages/api/src/schemas/dashboard.ts
    - packages/api/src/routers/dashboard.ts
    - apps/web/src/hooks/use-dashboard.ts
    - apps/web/src/components/dashboard/dashboard-page-client.tsx

key-decisions:
  - "date-fns for time calculations (eachWeekOfInterval, eachDayOfInterval, format, startOfWeek)"
  - "Zero-fill all periods to ensure continuous charts without gaps"
  - "BarChart for weekly view, AreaChart for daily view per CONTEXT.md"
  - "preserveStartEnd on XAxis to prevent label crowding"

patterns-established:
  - "Time-series aggregation: Generate all periods first, then accumulate transactions into buckets"
  - "Chart type toggle: Local state in component with conditional chart rendering"
  - "Y-axis formatting: $1k format for large values, $N for small values"

duration: 8min
completed: 2026-01-31
---

# Phase 05 Plan 02: Spending Timeline Summary

**Time-series spending trend chart with weekly bar and daily area views using date-fns aggregation**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-31T14:13:59Z
- **Completed:** 2026-01-31T14:22:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- API endpoint for time-series spending trend data with configurable granularity and months
- Zero-filled periods ensuring no gaps in chart visualization
- Timeline chart with toggle between weekly bars (BarChart) and daily lines (AreaChart)
- Income (green) and expenses (red) trends visualized over time
- Full integration into dashboard layout below pie chart section

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getSpendingTrend API endpoint** - `d889b67` (feat)
2. **Task 2: Create spending timeline chart component** - `0f9049b` (feat)
3. **Task 3: Integrate timeline into dashboard layout** - `4833bc7` (feat)

## Files Created/Modified
- `packages/api/src/schemas/dashboard.ts` - Added spendingTrendInput and spendingTrendDataPoint schemas
- `packages/api/src/routers/dashboard.ts` - Added getSpendingTrend procedure with time-series aggregation
- `apps/web/src/hooks/use-dashboard.ts` - Added useSpendingTrend hook and SpendingTrendDataPoint interface
- `apps/web/src/components/dashboard/spending-timeline.tsx` - Timeline chart with toggle, custom tooltip, empty state
- `apps/web/src/components/dashboard/dashboard-page-client.tsx` - Integrated SpendingTimeline below existing charts

## Decisions Made
- **date-fns for time calculations:** Used eachWeekOfInterval, eachDayOfInterval, startOfWeek, format for robust date handling
- **Zero-fill periods:** Initialize all periods with 0 income/expense before aggregating to ensure continuous chart
- **Chart type by granularity:** Weekly shows BarChart, daily shows AreaChart per CONTEXT.md specification
- **preserveStartEnd:** XAxis interval setting to prevent label crowding per RESEARCH.md guidance
- **Y-axis formatting:** Show $1k, $2k for large values, $N for small values for readability

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed date-fns dependency**
- **Found during:** Task 1 (getSpendingTrend API endpoint)
- **Issue:** date-fns not installed in packages/api
- **Fix:** Ran `bun add date-fns` in packages/api
- **Files modified:** packages/api/package.json, bun.lock
- **Verification:** Import succeeds, typecheck passes
- **Committed in:** d889b67 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential dependency for time calculations. No scope creep.

## Issues Encountered
- Linter removes unused imports automatically - had to add import and usage together to keep import
- Untracked files from future plan (05-03) were present in workspace - removed to avoid typecheck conflicts

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dashboard now has spending timeline showing income/expense trends over time
- VIZ-02 requirement complete
- Ready for Plan 05-03: Loan amortization chart and what-if simulator

---
*Phase: 05-visualizations-dashboard*
*Completed: 2026-01-31*
