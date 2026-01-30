---
phase: 03-tags-transactions-ui
plan: 01
subsystem: ui-foundation
tags: [tRPC, superjson, BigInt, ui-components, base-ui]
dependency-graph:
  requires: [02-api-layer]
  provides: [tRPC-client-bigint, ui-primitives, money-display, color-picker, date-picker, filter-chip]
  affects: [03-02, 03-03, 03-04]
tech-stack:
  added: [superjson@2.2.6, react-colorful@5.6.1, date-fns@4.1.0, react-day-picker@9.13.0]
  patterns: [compound-components, base-ui-wrappers, format-utilities]
key-files:
  created:
    - apps/web/src/lib/format.ts
    - apps/web/src/components/ui/dialog.tsx
    - apps/web/src/components/ui/select.tsx
    - apps/web/src/components/ui/popover.tsx
    - apps/web/src/components/ui/color-picker.tsx
    - apps/web/src/components/ui/date-picker.tsx
    - apps/web/src/components/ui/filter-chip.tsx
    - apps/web/src/components/shared/money-display.tsx
  modified:
    - apps/web/package.json
    - apps/web/src/utils/trpc.ts
    - bun.lock
decisions:
  - id: superjson-transformer
    choice: "superjson for tRPC transformer"
    reason: "Required for BigInt serialization from Phase 2 API"
  - id: preset-colors
    choice: "12 curated colors in 6x2 grid with custom option"
    reason: "Balance between quick selection and customization per CONTEXT.md"
  - id: date-presets
    choice: "Sidebar presets with Today, Yesterday, This week, This month, Last month"
    reason: "Quick access to common date filters"
  - id: money-sign-color
    choice: "Green +$X for income, red -$X for expense"
    reason: "Per CONTEXT.md: Color + sign makes scanning quick and unambiguous"
metrics:
  duration: 5m
  completed: 2026-01-30
---

# Phase 03 Plan 01: UI Foundation & tRPC Setup Summary

tRPC client with superjson transformer for BigInt support, plus reusable UI primitives for tag/transaction features

## What Changed

### tRPC Client Configuration
- Added superjson transformer to httpBatchLink for BigInt serialization
- This is critical - without superjson, BigInt fields from Phase 2 API would cause JSON serialization errors
- All tRPC responses now properly deserialize BigInt amounts

### Format Utilities (apps/web/src/lib/format.ts)
- `formatDate(date)` - "MMM d, yyyy" format
- `formatTime(date)` - "h:mm a" format
- `formatRelativeDate(date)` - "Today", "Yesterday", or formatted date
- `formatCents(cents)` - BigInt/number to "$1,234.56" format

### Base UI Primitives
- **Dialog**: Portal, backdrop with fade, content with scale animation, compound exports
- **Select**: Trigger, content with scroll arrows, items with checkmark indicator
- **Popover**: Trigger, positioned content with slide animations

### Feature Components
- **ColorPicker**: 12 preset colors in 6x2 grid, custom picker toggle with HexColorPicker
- **DatePicker**: Calendar UI via react-day-picker, sidebar with date presets
- **FilterChip**: Removable pill badge for active filters
- **MoneyDisplay**: Formatted currency with income/expense coloring

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| tRPC transformer | superjson | Required for BigInt serialization from API layer |
| Preset color count | 12 colors in 6x2 grid | Good variety without overwhelming, matches Tailwind palette |
| Date presets | 5 presets in sidebar | Common filters (Today, Yesterday, Week, Month, Last month) |
| Money coloring | Green income, red expense | Per CONTEXT.md decision for quick scanning |

## Commits

| Hash | Description |
|------|-------------|
| a92a2a8 | feat(03-01): configure tRPC client with superjson transformer |
| b78a951 | feat(03-01): create Base UI primitive wrappers |
| ecaf04d | feat(03-01): create ColorPicker, DatePicker, FilterChip, and MoneyDisplay |

## Technical Notes

### Pre-existing Issues
- TypeScript errors in packages/api for BigInt literals (ES2020 target issue)
- Not related to this plan - errors existed before Phase 3

### Base UI API Notes
- Select uses `List` not `Viewport` for content wrapper
- Popover does not export `Anchor` component
- SelectRoot is generic: `<Value, Multiple extends boolean | undefined = false>`

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 03-02:** Tag management UI can now use:
- ColorPicker for tag color selection
- Dialog for tag create/edit modals
- FilterChip for displaying active tag filters

**Ready for 03-03:** Transaction UI can use:
- MoneyDisplay for amount formatting with colors
- DatePicker for date filtering
- Select for tag multi-select dropdowns
- FilterChip for active filters
