# Domain Pitfalls: Personal Finance Apps

**Domain:** Personal finance app (expense tracking + loan management)
**Researched:** 2026-01-29
**Confidence:** MEDIUM-HIGH (verified with multiple industry sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, user trust loss, or fundamental calculation errors.

---

### Pitfall 1: Floating-Point Currency Calculations

**What goes wrong:** Using JavaScript's native `Number` type for currency math leads to precision errors. `0.1 + 0.2 = 0.30000000000000004`. These tiny errors compound over thousands of transactions, causing balances to drift from expected values.

**Why it happens:** Developers assume JavaScript handles decimals correctly. It doesn't. IEEE 754 floating-point cannot precisely represent many decimal fractions.

**Consequences:**
- Monthly totals off by pennies (users notice and lose trust)
- Amortization schedules don't sum to loan principal
- Tax calculations off (regulatory/legal implications)
- "Where did my 3 cents go?" support tickets

**Warning signs:**
- Totals that don't match when manually verified
- Amortization schedule final balance not exactly zero
- Sum of pie chart segments doesn't equal 100%

**Prevention:**
1. Store all monetary values as **integers (cents)** in database
2. Only convert to dollars for display (divide by 100)
3. For complex calculations (amortization), use a library like `Decimal.js` or `currency.js`
4. Add validation: `Math.abs(calculatedTotal - expectedTotal) < 0.01`

**Phase to address:** Foundation/Data Model phase. Must be baked into the schema from day one.

**Sources:** [Honeybadger - Currency Calculations in JavaScript](https://www.honeybadger.io/blog/currency-money-calculations-in-javascript/), [Robin Wieruch - JavaScript Rounding Errors](https://www.robinwieruch.de/javascript-rounding-errors/)

---

### Pitfall 2: Amortization Formula Implementation Errors

**What goes wrong:** Implementing loan amortization with incorrect formulas, wrong compounding periods, or rounding at intermediate steps produces schedules that don't match bank statements.

**Why it happens:**
- Confusing annual vs monthly interest rates
- Rounding after each calculation step instead of at the end
- Mismatched compounding period and payment frequency
- Forgetting that extra payments change the principal, not the interest rate

**Consequences:**
- Users compare to bank statements and see discrepancies
- "What if" simulations give false expectations about payoff dates
- Interest savings calculations are wrong by hundreds of dollars
- Complete loss of trust in the app's core value proposition

**Warning signs:**
- Calculated monthly payment differs from actual loan by more than $1
- Final balance in amortization schedule not within $1 of zero
- Extra payment scenarios don't recalculate remaining balance correctly
- Interest + principal doesn't equal monthly payment (within rounding)

**Prevention:**
1. Use the standard amortization formula: `M = P * [r(1+r)^n] / [(1+r)^n - 1]`
   - M = monthly payment
   - P = principal
   - r = monthly interest rate (annual rate / 12)
   - n = total number of payments
2. Keep full precision during calculations, round only for display
3. Validate against known calculators (CFPB, Bankrate) with sample loans
4. Add unit tests with edge cases: 0% interest, 1 payment remaining, extra payment exceeds balance

**Phase to address:** Loan Management feature phase. Implement with comprehensive test suite.

**Sources:** [CFPB Amortize Module](https://github.com/cfpb/amortize), [Calculator.net Loan Calculator](https://www.calculator.net/loan-calculator.html)

---

### Pitfall 3: Security Theater Instead of Security

**What goes wrong:** Treating security as a checkbox (add password requirements, done) rather than a fundamental design principle. Financial apps handle sensitive data but often ship with basic authentication and no encryption at rest.

**Why it happens:**
- Security "feels done" after adding email/password auth
- MVP pressure to ship features, defer security hardening
- Assumption that Prisma/PostgreSQL handles security automatically

**Consequences:**
- Data breach exposes transaction history (embarrassing/dangerous)
- Session tokens stolen via XSS
- Credential stuffing attacks succeed because no rate limiting
- User loses $0 but loses all trust

**Warning signs:**
- No rate limiting on auth endpoints
- Sensitive data visible in browser DevTools network tab
- No audit logging for data access
- JWT tokens never expire

**Prevention:**
1. **Better Auth configuration:** Ensure session expiration, secure cookie flags
2. **Input validation:** Zod schemas on all tRPC endpoints (already planned)
3. **Rate limiting:** Add to auth endpoints minimum
4. **Audit logging:** Log who accessed what financial data
5. **HTTPS everywhere:** No mixed content
6. **Sensitive data handling:** Don't log transaction amounts, mask in error reports

**Phase to address:** Foundation phase for basics; dedicated security hardening phase pre-launch.

**Sources:** [Netguru - Mistakes in Creating Finance App](https://www.netguru.com/blog/mistakes-in-creating-finance-app), [Secureframe - Top Data Breaches 2025](https://secureframe.com/blog/top-data-breaches-2025)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 4: Chart Performance with Growing Data

**What goes wrong:** Recharts (and most SVG-based chart libraries) struggle with large datasets. After a year of daily transactions (365+ points) or detailed amortization schedules (360 months), charts become sluggish or crash.

**Why it happens:**
- Initial development uses small test datasets
- SVG renders every data point as a DOM element
- No data aggregation or sampling implemented

**Warning signs:**
- Timeline charts taking >500ms to render
- Browser becomes unresponsive when viewing yearly data
- Memory usage spikes when opening charts
- `getStringSize()` appearing in performance profiles

**Prevention:**
1. **Aggregate data on backend:** For timeline charts, aggregate by week/month for >30 days
2. **Data sampling:** Use LTTB algorithm for large datasets (1000+ points)
3. **Disable animations:** `isAnimationActive={data.length < 500}`
4. **Simplify rendering:** `type="linear"` instead of curves, disable dots
5. **Lazy load charts:** Don't render off-screen charts

**Phase to address:** Chart Implementation phase. Build aggregation into data fetching from the start.

**Sources:** [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/), [Recharts Issue #1146](https://github.com/recharts/recharts/issues/1146)

---

### Pitfall 5: Pie Chart Misuse for Spending Breakdown

**What goes wrong:** Pie charts with many small categories (10+ tags) become unreadable. Small spending categories are invisible. Users can't compare similar-sized segments.

**Why it happens:**
- Pie charts are the "default" for showing percentages
- Designer/developer doesn't test with realistic category counts
- Small categories are edge cases in testing

**Warning signs:**
- More than 5-6 slices in the pie
- Legend has 10+ items
- Slices smaller than 3% are invisible
- Similar colors for adjacent slices
- Labels overlap or extend outside container

**Prevention:**
1. **Limit to 5 categories max:** Group remainder into "Other"
2. **Consider bar charts:** Easier to compare, better for many categories
3. **Use donut variant:** Center can show total
4. **Smart grouping:** Aggregate categories below 5% threshold into "Other"
5. **Provide drill-down:** "Other" can expand to show hidden categories

**Phase to address:** Dashboard/Charts phase. Design with category limits from wireframe stage.

**Sources:** [Data-to-viz - Pie Chart Issues](https://www.data-to-viz.com/caveat/pie.html), [Eval Academy - Pie Chart Misuses](https://www.evalacademy.com/articles/common-pie-chart-misuses-and-how-to-fix-them)

---

### Pitfall 6: Overloaded "What-If" Simulator

**What goes wrong:** Building a loan simulator with too many variables (extra monthly payment, lump sum, changed rate, biweekly payments, refinance) makes it unusable. Users get confused, enter contradictory values, or don't trust results.

**Why it happens:**
- Feature creep ("while we're at it, let's add...")
- Trying to match every competitor feature
- Not validating with target users

**Warning signs:**
- Simulator has >3 adjustable inputs
- Results don't update in real-time (too many calculations)
- Users can create impossible scenarios (pay more than balance)
- No clear "reset to original" action

**Prevention:**
1. **Single primary input:** Extra monthly payment slider is the core feature
2. **Progressive disclosure:** Advanced options hidden by default
3. **Real-time comparison:** Show baseline vs modified side-by-side
4. **Guardrails:** Validate that extra payment doesn't exceed remaining balance
5. **Clear communication:** "Pay off X months earlier, save $Y in interest"

**Phase to address:** Loan Features phase. Design focused UX before building.

**Sources:** [Morningstar - Financial Scenario Analysis](https://www.morningstar.com/business/insights/blog/portfolio-construction/financial-scenario-analysis), [InsightSoftware - Scenario Modeling Tips](https://insightsoftware.com/blog/financial-scenario-analysis-and-modeling/)

---

### Pitfall 7: Tag System Performance Degradation

**What goes wrong:** Many-to-many relationship between transactions and tags, combined with naive queries, leads to N+1 query problems. Filtering by tag becomes slow as data grows.

**Why it happens:**
- Initial queries work fine with small datasets
- Prisma's `include` syntax makes N+1 easy to write accidentally
- No database indexes on junction table

**Warning signs:**
- Transaction list page slows down over time
- Filtering by tag takes >500ms
- Database CPU spikes during list loads
- Prisma query logs show hundreds of queries for one page load

**Prevention:**
1. **Index the junction table:** Create composite index on `(transactionId, tagId)`
2. **Eager loading:** Use Prisma `include` correctly, not in loops
3. **Query analysis:** Use `EXPLAIN` to verify index usage
4. **Pagination:** Never load all transactions at once
5. **Denormalization option:** Consider caching tag names on transaction for list views

**Phase to address:** Foundation/Data Model phase. Add indexes upfront; monitor query performance.

**Sources:** [Charles Leifer - Tagging Schemas](https://charlesleifer.com/blog/a-tour-of-tagging-schemas-many-to-many-bitmaps-and-more/), [Medium - Association Patterns in Database Design](https://medium.com/@artemkhrenov/association-patterns-in-database-design-one-to-many-many-to-many-and-beyond-06aaa1b8ddd6)

---

## Minor Pitfalls

Mistakes that cause annoyance or polish issues.

---

### Pitfall 8: Inaccessible Charts

**What goes wrong:** SVG charts without proper ARIA labels, keyboard navigation, or color contrast fail WCAG compliance. Screen reader users get no information from charts. Color-blind users can't distinguish categories.

**Why it happens:**
- Accessibility tested late or not at all
- Default chart library settings don't include accessibility
- Assumption that charts are "visual only"

**Prevention:**
1. **Text alternatives:** Provide data table alongside every chart
2. **Color contrast:** Minimum 3:1 ratio between adjacent segments
3. **Patterns + colors:** Don't rely on color alone (add patterns or labels)
4. **Keyboard nav:** Ensure tooltips are keyboard-accessible
5. **ARIA labels:** Add descriptive labels to chart containers

**Phase to address:** Chart Implementation phase. Include in definition of done.

**Sources:** [A11Y Collective - Accessible Charts Checklist](https://www.a11y-collective.com/blog/accessible-charts/), [TPGi - Accessible Data Visualizations](https://www.tpgi.com/making-data-visualizations-accessible/)

---

### Pitfall 9: Inconsistent Date Handling

**What goes wrong:** Mixing timezones, date formats, and date libraries leads to transactions appearing on wrong days, month boundaries miscalculated, and filters returning unexpected results.

**Why it happens:**
- JavaScript Date is notoriously difficult
- Server in UTC, client in local timezone, database in yet another
- "January 31" + "1 month" = ??? (date math edge cases)

**Prevention:**
1. **Store in UTC:** All database timestamps in UTC
2. **Use date-fns or dayjs:** Don't use native Date for calculations
3. **Timezone-aware display:** Convert to user timezone only at display
4. **Test month boundaries:** First/last day of month edge cases
5. **ISO format:** Always use ISO 8601 in API responses

**Phase to address:** Foundation phase. Establish date handling patterns early.

---

### Pitfall 10: Onboarding That Doesn't Demonstrate Value

**What goes wrong:** Users complete sign-up, see empty dashboard, don't understand what to do, and leave. No guidance on adding first transaction or loan.

**Why it happens:**
- Developers test with seeded data, never see empty states
- Onboarding deferred as "polish"
- Assumption users will "figure it out"

**Warning signs:**
- High drop-off after registration
- Support questions: "What do I do now?"
- Users never add second transaction

**Prevention:**
1. **Guided onboarding:** Walk through adding first transaction and first loan
2. **Sample data option:** "Explore with demo data" for tire-kickers
3. **Empty states:** Explain what each section does when empty
4. **Progress indicators:** "Set up 2/4 steps complete"
5. **Quick wins:** Celebrate first transaction, first tag, first loan

**Phase to address:** Onboarding phase (as specified in PRD). Not optional polish.

**Sources:** [Netguru - Finance App User Retention](https://www.netguru.com/blog/mistakes-in-creating-finance-app)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|----------------|------------|
| **Foundation/Data Model** | Floating-point currency (#1) | Store as integers from day one |
| **Foundation/Data Model** | Tag query performance (#7) | Add indexes, test with 1000+ transactions |
| **Expense Tracking** | Pie chart overload (#5) | Design for 5-6 max categories with "Other" |
| **Expense Tracking** | Date handling (#9) | Establish timezone patterns in first endpoint |
| **Loan Management** | Amortization errors (#2) | Validate against bank calculators, comprehensive tests |
| **Loan Management** | Complex simulator (#6) | Start with single slider, add complexity later |
| **Charts/Visualization** | Performance (#4) | Build aggregation into data layer |
| **Charts/Visualization** | Accessibility (#8) | Include data tables, test with screen reader |
| **Onboarding** | Empty states (#10) | Design onboarding flow before dashboard |
| **Pre-Launch** | Security gaps (#3) | Security audit checklist before beta |

---

## Validation Checklist

Before considering each feature complete:

### For Any Monetary Calculation
- [ ] All amounts stored as integers (cents)
- [ ] Sum of parts equals total (within rounding)
- [ ] Tested with edge cases: $0.00, $0.01, $999,999.99

### For Amortization/Interest
- [ ] Monthly payment matches known calculator within $1
- [ ] Final balance within $1 of zero
- [ ] Extra payment recalculates remaining balance correctly
- [ ] 0% interest edge case works

### For Charts
- [ ] Renders in <500ms with 1 year of data
- [ ] Has text alternative or data table
- [ ] Passes color contrast check
- [ ] Gracefully handles 0 data points
- [ ] Handles >10 categories without visual breakage

### For Security
- [ ] No sensitive data in browser console/network tab
- [ ] Rate limiting on auth endpoints
- [ ] Session expiration configured
- [ ] Input validation on all endpoints

---

## Sources Summary

**Financial Calculations:**
- [Honeybadger - Currency Calculations in JavaScript](https://www.honeybadger.io/blog/currency-money-calculations-in-javascript/)
- [Robin Wieruch - JavaScript Rounding Errors](https://www.robinwieruch.de/javascript-rounding-errors/)
- [CFPB Amortize Module](https://github.com/cfpb/amortize)

**UX/Design:**
- [Data-to-viz - Pie Chart Issues](https://www.data-to-viz.com/caveat/pie.html)
- [Eval Academy - Pie Chart Misuses](https://www.evalacademy.com/articles/common-pie-chart-misuses-and-how-to-fix-them)
- [A11Y Collective - Accessible Charts](https://www.a11y-collective.com/blog/accessible-charts/)

**Performance:**
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/)
- [Recharts Large Data Issue](https://github.com/recharts/recharts/issues/1146)

**Security & Industry:**
- [Netguru - Mistakes in Creating Finance App](https://www.netguru.com/blog/mistakes-in-creating-finance-app)
- [Secureframe - Data Breaches 2025](https://secureframe.com/blog/top-data-breaches-2025)

**Database Design:**
- [Charles Leifer - Tagging Schemas](https://charlesleifer.com/blog/a-tour-of-tagging-schemas-many-to-many-bitmaps-and-more/)
