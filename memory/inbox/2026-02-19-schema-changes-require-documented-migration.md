---
description: Database schema changes are treated as high-impact events requiring explicit migration documentation before execution
type: pattern
status: active
created: 2026-02-19
---

# schema changes are high impact and require documented migration

Any change to the Drizzle schema is a high-impact operation. Before making one, document the migration: what changes, what data is affected, what the rollback path is. Schema changes cannot be undone without a compensating migration.

This applies to both additive changes (new columns) and destructive ones (column removal, type changes).

---

Relevant Records:
- [[deploy commands must never be run unless explicitly requested]] — same class of irreversible action
- [[monorepo uses pnpm workspaces with four packages]] — Drizzle lives in the api package

Topics:
- [[api-map]]
