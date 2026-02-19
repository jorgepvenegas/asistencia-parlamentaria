---
description: Every API response is validated through a Zod schema — serving as both a runtime guard and the source of inferred TypeScript types
type: pattern
status: active
created: 2026-02-19
---

# Zod schemas validate all API responses at system boundaries

All data crossing the API boundary is parsed through a Zod schema. This catches shape mismatches at runtime and makes the expected data contract explicit in code. The inferred TypeScript type is the authoritative type for that response shape — no separate interface needed.

This convention means: if you're working with API data and the type isn't derived from a Zod schema, it's probably wrong.

---

Relevant Records:
- [[shared package is the single source of truth for cross-package types]] — where schemas live
- [[Astro pages fetch server-side and pass data to React components via client:load]] — where parsing happens

Topics:
- [[api-map]]
