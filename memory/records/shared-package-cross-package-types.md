---
description: @quienatiende/shared owns all cross-package types and Zod schemas; frontend-specific types live in src/types/
type: pattern
status: active
created: 2026-02-19
affected_files: [packages/shared/]
---

# shared package is the single source of truth for cross-package types

Types and Zod schemas used by more than one package live in `@quienatiende/shared`. Frontend-specific types that are not consumed by the API or automation live in the frontend's `src/types/`. This split prevents the shared package from accumulating UI concerns.

Zod schemas in shared serve double duty: they validate API responses at the boundary and provide the TypeScript types derived from those schemas.

---

Relevant Records:
- [[zod-schemas-validate-api-responses]] — how shared schemas are used
- [[monorepo-pnpm-workspaces-four-packages]] — the package structure this pattern lives in

Topics:
- [[shared-map]]
