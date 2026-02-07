# Phase 6: Onboarding & Polish - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Guide new users through the app's value props (expense tracking + loan management) and provide settings and empty states so the app feels complete. Users understand Finora's two core features before landing on the dashboard, can configure their profile, and see helpful guidance on every page when no data exists.

</domain>

<decisions>
## Implementation Decisions

### Onboarding Flow
- Multi-step wizard format: Welcome → Expenses → Loans → Done (4 steps)
- Each step shows animated previews/mockups of the feature in action
- Subtle "Skip" text in corner — encourage completion but don't force it
- Progress indicator showing current step

### First-Run Experience
- New users redirect straight to onboarding wizard after signup (before seeing dashboard)
- Onboarding shows once automatically; "Replay onboarding" link available in settings
- Wizard collects display name and currency symbol during a setup step (before finishing)
- Final CTA: "Add your first transaction" — opens the transaction form directly to build habit
- Onboarding completion tracked with a flag on the user (hasCompletedOnboarding or similar)

### Settings Page
- Gear icon at bottom of existing sidebar, opens dedicated /settings page
- Two sections: Profile (display name, currency symbol) + Account (email display, sign out, delete account)
- Currency symbol: dropdown of 8-10 common symbols ($, £, €, ¥, ₹, etc.)
- Delete Account: red button at bottom of Account section with confirmation dialog warning about data loss
- "Replay onboarding" link in settings

### Empty States
- All main pages get tailored empty states: Dashboard, Transactions, Loans, Tags
- Style: composed Lucide icons with color accents + friendly headline + description + primary CTA button
- Dashboard gets a special guided empty state: checklist/progress card showing setup steps (Account created → Add tags → Add transaction → Add loan) with links to each action
- Other pages: illustration + descriptive message + action button (e.g., "No transactions yet — Add your first transaction")

### Claude's Discretion
- Exact animation/preview implementation for onboarding steps (CSS transitions, Framer Motion, etc.)
- Specific Lucide icon compositions for each empty state
- Settings page form layout and save behavior (auto-save vs. save button)
- Onboarding step transitions and progress indicator style
- Exact copy/microcopy for empty states and onboarding steps

</decisions>

<specifics>
## Specific Ideas

- Onboarding final step leads directly to "Add your first transaction" — not just the dashboard
- Dashboard empty state is a guided checklist, not just a generic empty message — gives users a clear path
- Settings has "Replay onboarding" for users who skipped or want a refresher
- Delete account requires explicit confirmation dialog — data safety is important

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-onboarding-polish*
*Context gathered: 2026-02-07*
