---
description: Security is achieved through framework defaults — Drizzle prepared statements, Astro auto-escaping, Hono CORS middleware — with no secrets committed to the repo
type: pattern
status: active
created: 2026-02-19
affected_files: [packages/api/src/index.ts, packages/api/src/db/]
---

# Security relies on framework defaults rather than custom security code

The project's security posture is built on what each framework provides by default rather than custom middleware:

- **SQL injection**: Drizzle ORM uses prepared statements for all queries — no raw SQL string concatenation.
- **XSS**: Astro auto-escapes all template variables — no `innerHTML` or `dangerouslySetInnerHTML` needed.
- **CORS**: Hono's CORS middleware is configured at the API entry point (`src/index.ts`) to control cross-origin access.
- **Secrets**: `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are Wrangler secrets, not committed. No `.env` file should contain production credentials.

This is a constraint: if a future change bypasses Drizzle for raw SQL (e.g., for performance), the security posture for that query changes and must be reviewed explicitly.

---

Relevant Records:
- [[turso-libsql-database-backend]] — the credentials managed as Wrangler secrets
- [[hono-drizzle-cloudflare-workers-api]] — the layer where CORS and prepared statements operate

Topics:
- [[api-map]]
