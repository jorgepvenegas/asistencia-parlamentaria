---
description: Navigation map for the Hono + Drizzle + Cloudflare Workers API layer — stack, storage, security, and schema decisions
type: map
created: 2026-02-19
---

# api-map — Hono/Drizzle/Cloudflare Workers API layer

## Records in This Area

- [[hono-drizzle-cloudflare-workers-api]] — the stack choice and its hard constraints (no Node.js APIs, edge-only deps)
- [[turso-libsql-database-backend]] — why libsql over HTTP; DATABASE_URL and DATABASE_AUTH_TOKEN as Wrangler secrets
- [[zod-schemas-validate-api-responses]] — all responses parsed through Zod; inferred type is the authoritative type
- [[schema-changes-require-documented-migration]] — additive and destructive schema changes both require migration docs before execution
- [[security-by-framework-defaults]] — Drizzle prepared statements, Astro escaping, Hono CORS; bypassing Drizzle changes the security posture

## Key Decisions

- [[hono-drizzle-cloudflare-workers-api]] — Hono chosen for Workers compatibility; Drizzle for edge-compatible ORM with type safety
- [[turso-libsql-database-backend]] — libsql over HTTP required by Workers runtime; TCP databases not viable

## Open Questions

- Is CORS currently configured for production domains, or still open?
- Are there any raw SQL queries bypassing Drizzle? If so, the security posture note applies.

---

Topics:
- [[index]]
