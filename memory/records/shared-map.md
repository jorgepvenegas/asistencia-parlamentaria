---
description: Navigation map for the @quienatiende/shared package — cross-package types, Zod schemas, and the single-source-of-truth pattern
type: map
created: 2026-02-19
---

# shared-map — @quienatiende/shared package

## Records in This Area

- [[shared package is the single source of truth for cross-package types]] — types and schemas used by more than one package live here; frontend-only types stay in src/types/
- [[Zod schemas validate all API responses at system boundaries]] — schemas in shared serve dual purpose: runtime validation and TypeScript type derivation

## Key Decisions

- [[shared package is the single source of truth for cross-package types]] — split prevents shared from accumulating UI concerns; Zod schemas derive the authoritative TS types

## Open Questions

- What types currently live in shared vs. frontend src/types/? Is the split clean?
- Are there any types duplicated between shared and frontend that should be merged?

---

Topics:
- [[index]]
