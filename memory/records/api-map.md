---
description: Navigation map for the Hono + Drizzle + Cloudflare Workers API layer — stack, storage, security, and schema decisions
type: map
created: 2026-02-19
---

# api-map — Hono/Drizzle/Cloudflare Workers API layer

## Records in This Area

- [[the API uses Hono + Drizzle and runs on Cloudflare Workers]] — the stack choice and its hard constraints (no Node.js APIs, edge-only deps)
- [[Turso (libsql) is the database backend accessed via Drizzle from Cloudflare Workers]] — why libsql over HTTP; DATABASE_URL and DATABASE_AUTH_TOKEN as Wrangler secrets
- [[Zod schemas validate all API responses at system boundaries]] — all responses parsed through Zod; inferred type is the authoritative type
- [[schema changes are high impact and require documented migration]] — additive and destructive schema changes both require migration docs before execution
- [[Security relies on framework defaults rather than custom security code]] — Drizzle prepared statements, Astro escaping, Hono CORS; bypassing Drizzle changes the security posture

## Key Decisions

- [[the API uses Hono + Drizzle and runs on Cloudflare Workers]] — Hono chosen for Workers compatibility; Drizzle for edge-compatible ORM with type safety
- [[Turso (libsql) is the database backend accessed via Drizzle from Cloudflare Workers]] — libsql over HTTP required by Workers runtime; TCP databases not viable

## Open Questions

- Is CORS currently configured for production domains, or still open?
- Are there any raw SQL queries bypassing Drizzle? If so, the security posture note applies.

---

Topics:
- [[index]]
