---
description: Navigation map for the Astro + React + Tailwind frontend — routing, data flow, and styling decisions
type: map
created: 2026-02-19
---

# frontend-map — Astro/React frontend structure and conventions

## Records in This Area

- [[Astro pages fetch server-side and pass data to React components via client:load]] — the core data flow pattern; API calls happen in Astro scripts, not React components
- [[frontend routing uses year-based static paths covering 2022 to 2025]] — how legislative year pages are generated; requires manual update when adding new years
- [[the frontend is mid-migration from inline styles and shared.css to Tailwind]] — active styling transition; Tailwind first, shared.css for overrides, no new inline styles
- [[ATTENDANCE_COLORS in constants/colors.ts is the single source of truth for attendance colors]] — hard constraint: attendance state colors must never be defined inline or duplicated

## Key Decisions

- [[Astro pages fetch server-side and pass data to React components via client:load]] — API inaccessible from browser; server-side fetch is the only path
- [[frontend routing uses year-based static paths covering 2022 to 2025]] — static generation over server-side rendering; year list must be updated manually

## Open Questions

- When will the Tailwind migration be complete? What's the remaining surface?
- Will routing expand beyond year-based paths (e.g., per-party or per-politician pages)?

---

Topics:
- [[index]]
