# Phase 3: Tags & Transactions UI - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage tags and record transactions with full filtering capabilities. This includes tag CRUD with colors, transaction CRUD with multi-tag support, and filtering by date range, type, tag, and amount. Creating charts, dashboards, or loan features are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Tag management flow
- Tag management lives in **sidebar section** — always visible in navigation for quick access
- Color picker: **Preset palette with custom option** — start with 8-12 curated colors, reveal full picker for "custom"
- Tags displayed as **compact chips with color dots** — shows many tags at once
- Tag deletion: **Soft delete (archive)** — hide from selection, keep association on existing transactions

### Transaction list layout
- Transactions grouped **by date with daily sections** — "Today", "Yesterday", "Jan 28" headers
- Row content: **Standard** — shows amount, note, tags, and time (date in section header)
- Income vs expense: **Color + sign** — green +$100 for income, red -$50 for expense
- List pagination: **Page numbers** — predictable navigation, not infinite scroll

### Filtering experience
- Filter placement: **Inline above list** — filter bar always visible above transactions
- Multi-filter logic: **AND (narrowing)** — must match ALL active filters
- Date range: **Presets + custom option** — quick picks (this month, last 30 days) with custom date range option
- Active filters shown as **removable chips below filter bar** — easy to clear individually

### Form interactions
- Add transaction form appears as **modal/dialog** — overlay focuses attention with clear start/end
- Multi-tag selection: **Dropdown with checkboxes** — click to open, check tags to select
- Income/expense selection: **Toggle/tabs at top of form** — switch between modes in one form
- Validation: **Inline errors under fields** — error message appears immediately below invalid field

### Claude's Discretion
- Exact color palette selection for presets
- Date picker component choice
- Pagination controls styling (page numbers, arrows)
- Modal animation and transition timing
- Empty state illustrations and copy
- Mobile responsive breakpoints and adjustments

</decisions>

<specifics>
## Specific Ideas

- Sidebar tag management should feel quick to access while working with transactions
- Filter chips should be easy to dismiss with a clear "x" on each
- Color + sign for amounts makes scanning the list quick and unambiguous
- Daily date grouping helps users find recent transactions naturally

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-tags-transactions-ui*
*Context gathered: 2026-01-30*
