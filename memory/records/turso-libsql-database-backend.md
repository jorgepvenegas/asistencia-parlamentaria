---
description: Turso (hosted libsql) is the database — accessed through Drizzle ORM from Cloudflare Workers using DATABASE_URL and DATABASE_AUTH_TOKEN
type: decision
status: active
created: 2026-02-19
affected_files: [packages/api/src/db/, packages/api/wrangler.jsonc, packages/api/drizzle.config.ts]
---

# Turso (libsql) is the database backend accessed via Drizzle from Cloudflare Workers

The API runs on Cloudflare Workers, which cannot use traditional TCP-based databases. Turso uses libsql over HTTP, making it compatible with the serverless edge runtime. Drizzle ORM abstracts the libsql client, providing type-safe queries without raw SQL.

Two secrets are required at deploy time: `DATABASE_URL` (the Turso endpoint) and `DATABASE_AUTH_TOKEN` (the auth token). These are managed as Wrangler secrets — not committed to the repo and not in `.env` files. This is the deployment-time gotcha: schema pushes and migrations also require these secrets to be available locally via Wrangler.

Alternatives not chosen: PlanetScale (MySQL protocol, Workers-compatible but more expensive), Cloudflare D1 (would lock the project to CF primitives more deeply), Neon (Postgres but HTTP adapter less mature at decision time).

---

Relevant Records:
- [[the API uses Hono + Drizzle and runs on Cloudflare Workers]] — Turso is the storage layer in that stack
- [[schema changes are high impact and require documented migration]] — db:push and db:migrate commands target this Turso instance
- [[Playwright and Cheerio power the attendance scraper in the automation package]] — scraped data flows into this database via the sync workflow

Topics:
- [[api-map]]
