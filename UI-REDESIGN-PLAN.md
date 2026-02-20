# UI Design Improvements Plan

## Phase 1: Navigation & Active States
**Files**: `Navigation.tsx`, `PageLayout.astro`, `LandingPage.tsx`

- Pass `currentPath` prop to `Navigation`
- Detect current route via `window.location.pathname`
- Add underline + white text on active nav link (desktop + mobile)

## Phase 2: Stat Cards Visual Upgrade
**Files**: `StatCards.tsx`

- Add subtle tinted background fill (10% opacity of category color)
- Increase number size from `text-4xl` to `text-5xl`
- Make progress bar thicker (h-1 → h-1.5) with rounded ends
- Add rounded corners to each card

## Phase 3: Table Improvements
**Files**: `MembersTableV2.tsx`

- Add alternating row backgrounds (`even:bg-[#FAFAFA]`)
- Add party color dot next to deputy name (requires passing `getPartyColor`)
- Add attendance percentage inline bar/badge on attendance column
- Improve hover state visibility

## Phase 4: Party Color Integration in Charts
**Files**: `PartyComparisonChart.tsx`, `colors.ts`

- Add party color dot/stripe next to party name in bar chart rows
- Fill missing parties in `PARTY_COLORS` (PEV, AMA, EVOP, DEM, PH, PNL, PAH, FRVS)

## Phase 5: Legend & Layout Polish
**Files**: `AttendanceLegend.tsx`, `GeneralAttendance.tsx`

- Make legend horizontal/inline instead of vertical stack
- Reduce whitespace between stat cards and chart
- Wrap legend + sort button in same row

## Phase 6: Landing Page Hero
**Files**: `LandingPage.tsx`

- Add gradient overlay or texture to hero section
- Increase hero heading size
- Add subtle animated pulse to the green "datos actualizados" dot
- Improve stat bar visual weight

## Phase 7: Typography Hierarchy
**Files**: `tailwind.config.mjs`, various components

- No config changes needed — just enforce size differentiation
- Page titles: `text-3xl md:text-4xl font-bold`
- Section headers: `text-xl font-semibold`
- Body: already fine at `text-base`

## Phase 8: Acerca De Page
**Files**: `acerca-de.astro`

- Add card sections with subtle borders
- Add icons (checkmark circles) for the data list items
- Better visual structure with background cards

## Phase 9: Mobile Responsiveness
**Files**: `MembersTableV2.tsx`, `StatCards.tsx`

- StatCards: single column on mobile (already 2-col, keep)
- Verify stacked bars don't overflow on mobile
- Ensure tables scroll horizontally on small screens

## Phase 10: Final Polish
- Verify all pages render correctly
- Run build to confirm no TypeScript errors
- Screenshot all pages for comparison

---

## Unresolved Questions
- None — all changes are CSS/visual, no data model or API changes needed.
