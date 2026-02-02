# Phase 5: Visualizations & Dashboard - Research

**Researched:** 2026-01-31
**Domain:** React data visualization, interactive charts, dashboard components
**Confidence:** HIGH

## Summary

This phase transforms the existing dashboard API data into visual charts and interactive simulations. The research focused on charting libraries for React, interactive patterns for what-if simulators, accessible FAB patterns, and empty state design. The existing `dashboard.summary` endpoint already provides most data (monthly summary, top tags with "Other" grouping, loan overview); Phase 5 adds spending timeline and amortization chart endpoints, plus client-side simulation.

The standard approach is **Recharts** for all charting needs - it provides pie charts, line charts, and area charts with a JSX-based API, built-in responsiveness, TypeScript support, and click/hover handlers needed for the interactive requirements. For what-if simulation, React 19's `useDeferredValue` combined with `useMemo` provides better UX than debouncing for slider interactions.

**Primary recommendation:** Use Recharts with ResponsiveContainer for all charts. Keep what-if calculations client-side for instant feedback. Add two new API endpoints: `getSpendingTrend` (timeline) and `getAmortizationSchedule` (loan chart data).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^2.15 | SVG charts (pie, line, area) | Most popular React charting lib, 24.8K GitHub stars, D3-based with JSX API, built-in TypeScript, excellent documentation |
| date-fns | ^4.1.0 | Date calculations for timeline | Already installed, used throughout codebase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.546.0 | Icons for empty states, FAB | Already installed |
| sonner | ^2.0.5 | Toast for quick-add success | Already installed |
| @tanstack/react-query | ^5.90.12 | Data fetching hooks | Already installed, use for all API calls |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Visx | More flexible but steeper learning curve, lower-level primitives |
| Recharts | Chart.js | Lighter but less React-native, canvas-based |
| Recharts | Nivo | More chart types but larger bundle |

**Installation:**
```bash
cd apps/web && bun add recharts
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   ├── dashboard/           # Dashboard page components
│   │   ├── monthly-summary.tsx    # Income/expense/net cards
│   │   ├── spending-pie-chart.tsx # Pie chart with click-to-expand
│   │   ├── spending-timeline.tsx  # Weekly/monthly line chart
│   │   ├── loan-overview-card.tsx # Loan card with payoff date
│   │   ├── loan-amortization-chart.tsx
│   │   ├── what-if-simulator.tsx  # Slider + payoff display
│   │   ├── quick-add-fab.tsx      # Floating action button
│   │   ├── recent-transactions.tsx # Last 5 transactions
│   │   └── dashboard-page-client.tsx # Page orchestration
│   └── ui/
│       └── slider.tsx             # Slider component for what-if
├── hooks/
│   └── use-dashboard.ts           # Dashboard data hooks
└── lib/
    └── loan-calculations.ts       # Client-side what-if math
packages/api/src/
├── routers/
│   └── dashboard.ts               # Add getSpendingTrend, getAmortizationSchedule
└── schemas/
    └── dashboard.ts               # Add timeline and amortization schemas
```

### Pattern 1: ResponsiveContainer Wrapper
**What:** All Recharts require explicit dimensions; ResponsiveContainer provides 100% width/height
**When to use:** Every chart component
**Example:**
```typescript
// Source: Recharts official docs
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

function SpendingPieChart({ data }: { data: TagSpending[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="totalCents"
          nameKey="tagName"
          cx="50%"
          cy="50%"
          outerRadius={100}
          onClick={(entry) => onTagClick(entry.tagId)}
        >
          {data.map((entry, index) => (
            <Cell key={entry.tagId} fill={entry.tagColor} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 2: useDeferredValue for Slider
**What:** React 19's concurrent rendering for non-blocking slider updates
**When to use:** What-if simulator where slider input shouldn't block UI
**Example:**
```typescript
// Source: React official docs (react.dev)
import { useDeferredValue, useMemo } from 'react';

function WhatIfSimulator({ loan }: { loan: LoanOverview }) {
  const [extraPayment, setExtraPayment] = useState(0);
  const deferredExtra = useDeferredValue(extraPayment);

  // Calculation runs with deferred value, doesn't block slider
  const projection = useMemo(() => {
    return projectPayoffWithExtra(
      loan.balanceCents,
      loan.annualRatePercent,
      loan.monthlyPaymentCents,
      BigInt(deferredExtra * 100) // Convert dollars to cents
    );
  }, [loan.balanceCents, loan.annualRatePercent, loan.monthlyPaymentCents, deferredExtra]);

  return (
    <div>
      <Slider
        value={extraPayment}
        onChange={setExtraPayment}
        min={0}
        max={1000}
        step={25}
      />
      <PayoffDisplay projection={projection} isPending={extraPayment !== deferredExtra} />
    </div>
  );
}
```

### Pattern 3: Click-to-Expand Chart Interaction
**What:** Clicking pie segment shows transactions for that tag inline below chart
**When to use:** Per CONTEXT.md decision for pie chart interaction
**Example:**
```typescript
function SpendingBreakdown({ topTags, otherTagsTotal }: Props) {
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const handlePieClick = (data: TagSpending) => {
    setExpandedTag(prev => prev === data.tagId ? null : data.tagId);
  };

  return (
    <Card>
      <CardContent>
        <SpendingPieChart data={topTags} onTagClick={handlePieClick} />
        {expandedTag && (
          <TransactionListForTag tagId={expandedTag} />
        )}
      </CardContent>
    </Card>
  );
}
```

### Pattern 4: Empty State with Illustration
**What:** Friendly empty state when no data exists
**When to use:** All charts when user has no transactions/loans
**Example:**
```typescript
function EmptyChart({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="size-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-medium text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm mt-1">{message}</p>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Nested ResponsiveContainers:** Causes cascading resize events; use one per chart
- **Chart inside unstable parent:** Parent must have stable dimensions; avoid flexbox issues
- **Client-side aggregation of large datasets:** Keep aggregation server-side; dashboard endpoint already does this
- **Debouncing slider with setTimeout:** Use useDeferredValue instead for better UX
- **Hardcoded chart dimensions:** Always use ResponsiveContainer for responsiveness

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pie chart segments | Custom SVG paths | Recharts Pie + Cell | Math is complex, labels/tooltips included |
| Responsive charts | ResizeObserver listener | ResponsiveContainer | Handles debouncing, SSR, edge cases |
| Chart tooltips | Custom mouse tracking | Recharts Tooltip | Positioning, portal handling included |
| Amortization schedule | Manual loop | `projectPayoff` utility | Already built in Phase 1, handles edge cases |
| Date range grouping | Manual date math | date-fns functions | `eachWeekOfInterval`, `eachMonthOfInterval` |
| Money formatting | `toFixed(2)` | `formatCents` utility | Already handles Intl, cents conversion |

**Key insight:** The calculation utilities from Phase 1 (`projectPayoff`, `calculateCompoundInterest`) already handle loan math. Phase 5 just visualizes these - do not rebuild calculation logic.

## Common Pitfalls

### Pitfall 1: BigInt in Charts
**What goes wrong:** Recharts expects numbers, not BigInts. Passing BigInt causes "cannot convert BigInt to number" errors.
**Why it happens:** Dashboard API returns `bigint` for money fields. Recharts dataKey reads raw values.
**How to avoid:** Convert BigInt to number at chart boundary: `Number(totalCents)`
**Warning signs:** Runtime error mentioning BigInt conversion

### Pitfall 2: ResponsiveContainer in Flex Parent
**What goes wrong:** Chart renders with 0 height or overflows container
**Why it happens:** ResponsiveContainer needs parent with explicit height; flex items without height collapse
**How to avoid:** Set explicit height on parent: `<div className="h-[300px]"><ResponsiveContainer>...`
**Warning signs:** Chart not visible, parent has height: 0 in DevTools

### Pitfall 3: Tooltip Flicker on Click
**What goes wrong:** Tooltip shows/hides erratically when clicking pie segments
**Why it happens:** Click event changes state, causing re-render that dismisses tooltip
**How to avoid:** Use `trigger="click"` on Tooltip if you want persistent tooltip, or accept that click dismisses
**Warning signs:** Tooltip disappears immediately after click

### Pitfall 4: Timeline X-Axis Crowding
**What goes wrong:** All date labels overlap, unreadable axis
**Why it happens:** Too many data points for available width
**How to avoid:** Use `interval="preserveStartEnd"` or compute tick count based on data length
**Warning signs:** X-axis labels overlap each other

### Pitfall 5: What-If Blocks UI
**What goes wrong:** Slider feels laggy because calculations block main thread
**Why it happens:** Using controlled input without deferring the calculation
**How to avoid:** Use `useDeferredValue` to keep slider responsive while calculation catches up
**Warning signs:** Slider position jumps or feels unresponsive

### Pitfall 6: Empty "Other" in Pie Chart
**What goes wrong:** "Other" slice shows when otherTagsTotal is 0n
**Why it happens:** Unconditionally adding "Other" to data array
**How to avoid:** Only include "Other" if `otherTagsTotal > 0n`
**Warning signs:** Tiny empty slice or "Other: $0.00" in legend

## Code Examples

Verified patterns from official sources:

### Pie Chart with Custom Tooltip
```typescript
// Source: Recharts official docs + project conventions
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCents } from '@/lib/format';

interface SpendingData {
  tagId: string;
  tagName: string;
  tagColor: string;
  totalCents: bigint;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.tagName}</p>
      <p className="text-muted-foreground">{formatCents(data.totalCents)}</p>
    </div>
  );
}

function SpendingPieChart({ data, onTagClick }: {
  data: SpendingData[];
  onTagClick: (tagId: string) => void;
}) {
  // Convert BigInt to number for Recharts
  const chartData = data.map(d => ({
    ...d,
    value: Number(d.totalCents),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="tagName"
          cx="50%"
          cy="50%"
          outerRadius={100}
          onClick={(entry) => onTagClick(entry.tagId)}
          style={{ cursor: 'pointer' }}
        >
          {chartData.map((entry) => (
            <Cell key={entry.tagId} fill={entry.tagColor} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Area Chart for Amortization
```typescript
// Source: Recharts official docs
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface AmortizationPoint {
  month: Date;
  balanceCents: bigint;
  interestPaidCents: bigint;
}

function AmortizationChart({ schedule }: { schedule: AmortizationPoint[] }) {
  const chartData = schedule.map(p => ({
    month: format(p.month, 'MMM yy'),
    balance: Number(p.balanceCents) / 100,
    interestPaid: Number(p.interestPaidCents) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Client-Side What-If Projection
```typescript
// Source: Based on existing projectPayoff from packages/api/src/lib/calculations.ts
export function projectPayoffWithExtra(
  balanceCents: bigint,
  annualRatePercent: number,
  monthlyPaymentCents: bigint,
  extraPaymentCents: bigint
): {
  monthsRemaining: number;
  totalInterestCents: bigint;
  payoffDate: Date;
  monthsSaved: number;
  interestSaved: bigint;
} {
  const totalPayment = monthlyPaymentCents + extraPaymentCents;

  // Calculate with extra payment
  const withExtra = projectPayoff(balanceCents, annualRatePercent, totalPayment);

  // Calculate without extra payment (baseline)
  const baseline = projectPayoff(balanceCents, annualRatePercent, monthlyPaymentCents);

  return {
    ...withExtra,
    monthsSaved: baseline.monthsRemaining - withExtra.monthsRemaining,
    interestSaved: baseline.totalInterestCents - withExtra.totalInterestCents,
  };
}
```

### Floating Action Button
```typescript
// Source: MUI FAB pattern adapted for project
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function QuickAddFAB({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
      size="icon"
      aria-label="Add transaction"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
```

## API Endpoints Needed

Based on CONTEXT.md requirements, the existing `dashboard.summary` needs enhancement:

### New: getSpendingTrend
Returns spending aggregated by time period for timeline chart.

```typescript
// Input
{
  granularity: 'weekly' | 'daily',
  months: number // How many months back
}

// Output
Array<{
  date: Date;
  incomeCents: bigint;
  expenseCents: bigint;
}>
```

### New: getAmortizationSchedule
Returns projected balance over time for loan chart.

```typescript
// Input
{
  loanId: string;
  extraPaymentCents?: bigint; // For comparison view
}

// Output
{
  standard: Array<{ month: Date; balanceCents: bigint; }>;
  withExtra?: Array<{ month: Date; balanceCents: bigint; }>;
}
```

### New: getRecentTransactions
Returns last 5 transactions for dashboard widget.

```typescript
// Input: none (uses current user)

// Output
Array<{
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: bigint;
  date: Date;
  description: string | null;
  tags: Array<{ tag: { id: string; name: string; color: string; } }>;
}>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Debounce with setTimeout | useDeferredValue | React 18 (2022) | Better UX, no fixed delay needed |
| Class-based Recharts | Functional with hooks | Recharts 2.x | Simpler code, better tree-shaking |
| Manual resize handling | ResizeObserver native | Modern browsers | ResponsiveContainer now stable |

**Deprecated/outdated:**
- `react-chartjs-2` canvas approach: SVG (Recharts) preferred for React accessibility/styling
- Lodash debounce for sliders: React concurrent features (useDeferredValue) preferred
- D3 direct DOM manipulation: Declarative Recharts preferred for React projects

## Open Questions

Things that couldn't be fully resolved:

1. **Slider Component Source**
   - What we know: Base UI has primitives, shadcn has a slider
   - What's unclear: Whether to use Base UI Slider or add shadcn slider
   - Recommendation: Use Base UI primitives consistent with existing project; create custom Slider component

2. **Amortization Chart Granularity**
   - What we know: Monthly points make sense for most loans
   - What's unclear: How many months to show for very long loans (30-year mortgages)
   - Recommendation: Cap at 360 points (30 years), show yearly markers after 5 years

3. **Chart Animation on Data Change**
   - What we know: Recharts has built-in animation
   - What's unclear: Whether animation helps or hinders UX on filter changes
   - Recommendation: Keep default animation for initial load, consider disabling on filter changes

## Sources

### Primary (HIGH confidence)
- Recharts official documentation (recharts.org) - API, examples, ResponsiveContainer
- React official documentation (react.dev) - useDeferredValue, concurrent rendering
- Existing codebase - dashboard.ts router, calculations.ts, format.ts utilities

### Secondary (MEDIUM confidence)
- [LogRocket Blog - Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) - Library comparison
- [npm-compare](https://npm-compare.com/@visx/visx,chart.js,d3,react-vis,recharts) - Download stats
- [Embeddable Blog](https://embeddable.com/blog/react-chart-libraries) - Feature comparison

### Tertiary (LOW confidence)
- Various Medium articles on Recharts patterns (patterns verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts is clear leader, already chosen by many similar projects
- Architecture: HIGH - Follows existing project patterns, extends proven API
- Pitfalls: HIGH - Based on official docs warnings and common GitHub issues

**Research date:** 2026-01-31
**Valid until:** 60 days (Recharts stable, React 19 mature)
