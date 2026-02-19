---
description: The frontend is actively migrating from inline styles and shared.css to Tailwind — both coexist during the transition
type: change
status: active
created: 2026-02-19
affected_files: [src/styles/shared.css]
---

# the frontend is mid-migration from inline styles and shared.css to Tailwind

During the migration, three styling approaches coexist: inline styles, shared `src/styles/shared.css`, and Tailwind classes. The preference order is: Tailwind first, then shared.css for customizations, inline styles last.

Do not remove shared.css entries until their Tailwind equivalents are confirmed working. Do not add new inline styles — use Tailwind instead.

---

Relevant Records:
- [[monorepo uses pnpm workspaces with four packages]] — Tailwind lives in the frontend package
- [[ATTENDANCE_COLORS in constants/colors.ts is the single source of truth for attendance colors]] — colors defined there must be preserved during Tailwind migration

Topics:
- [[frontend-map]]
