---
description: ATTENDANCE_COLORS in constants/colors.ts is the only place attendance color values are defined — do not define them elsewhere
type: pattern
status: active
created: 2026-02-19
affected_files: [src/constants/colors.ts]
---

# ATTENDANCE_COLORS in constants/colors.ts is the single source of truth for attendance colors

All attendance state colors (present, absent, leave, etc.) are defined once in `constants/colors.ts` as `ATTENDANCE_COLORS`. Any component or utility needing these colors imports from there. Defining colors inline or in component files breaks this contract and creates drift.

---

Relevant Records:
- [[shared-package-cross-package-types]] — same single-source pattern applied to a different concern
- [[tailwind-migration-in-progress]] — migration must not break the colors contract

Topics:
- [[frontend-map]]
