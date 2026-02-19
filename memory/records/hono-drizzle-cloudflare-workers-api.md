---
description: The API layer uses Hono as the framework, Drizzle as the ORM, and runs on Cloudflare Workers — constraining what Node.js APIs are available
type: decision
status: active
created: 2026-02-19
affected_files: [packages/api/]
---

# the API uses Hono + Drizzle and runs on Cloudflare Workers

Hono was chosen for its compatibility with the Cloudflare Workers runtime. Drizzle was chosen as the ORM because it supports the edge runtime and produces type-safe queries. Express and Prisma are off the table — they require Node.js APIs unavailable in Workers.

Running on Cloudflare Workers means: no filesystem access, no native Node.js modules, edge-compatible deps only. This constraint shapes every dependency decision in the api package.

---

Relevant Records:
- [[Astro pages fetch server-side and pass data to React components via client:load]] — consequence of API being edge-only
- [[monorepo uses pnpm workspaces with four packages]] — api is one of four packages
- [[Turso (libsql) is the database backend accessed via Drizzle from Cloudflare Workers]] — the storage layer Drizzle connects to
- [[Zod schemas validate all API responses at system boundaries]] — responses produced by this layer are the boundary being validated
- [[Security relies on framework defaults rather than custom security code]] — Hono CORS and Drizzle prepared statements are the security surface

Topics:
- [[api-map]]
