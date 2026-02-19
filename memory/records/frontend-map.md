---
description: Navigation map for the Astro + React + Tailwind frontend — routing, data flow, and styling decisions
type: map
created: 2026-02-19
---

# frontend-map — Astro/React frontend structure and conventions

## Records in This Area

- [[astro-server-fetch-to-react-client-load]] — the core data flow pattern; API calls happen in Astro scripts, not React components
- [[year-based-static-routing]] — how legislative year pages are generated; requires manual update when adding new years
- [[tailwind-migration-in-progress]] — active styling transition; Tailwind first, shared.css for overrides, no new inline styles
- [[attendance-colors-single-source-of-truth]] — hard constraint: attendance state colors must never be defined inline or duplicated

## Key Decisions

- [[astro-server-fetch-to-react-client-load]] — API inaccessible from browser; server-side fetch is the only path
- [[year-based-static-routing]] — static generation over server-side rendering; year list must be updated manually

## Open Questions

- When will the Tailwind migration be complete? What's the remaining surface?
- Will routing expand beyond year-based paths (e.g., per-party or per-politician pages)?

---

Topics:
- [[index]]
