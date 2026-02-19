---
description: Navigation map for the @quienatiende/shared package — cross-package types, Zod schemas, and the single-source-of-truth pattern
type: map
created: 2026-02-19
---

# shared-map — @quienatiende/shared package

## Records in This Area

- [[shared-package-cross-package-types]] — types and schemas used by more than one package live here; frontend-only types stay in src/types/
- [[zod-schemas-validate-api-responses]] — schemas in shared serve dual purpose: runtime validation and TypeScript type derivation

## Key Decisions

- [[shared-package-cross-package-types]] — split prevents shared from accumulating UI concerns; Zod schemas derive the authoritative TS types

## Open Questions

- What types currently live in shared vs. frontend src/types/? Is the split clean?
- Are there any types duplicated between shared and frontend that should be merged?

---

Topics:
- [[index]]
