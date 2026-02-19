---
description: The project is a pnpm workspaces monorepo with four packages, each with a distinct runtime and responsibility
type: decision
status: active
created: 2026-02-19
affected_files: [package.json, pnpm-workspace.yaml]
---

# monorepo uses pnpm workspaces with four packages

Four packages:
- `@quienatiende/frontend` — Astro + React + Tailwind, static site
- `@quienatiende/api` — Hono + Drizzle + Cloudflare Workers
- `@quienatiende/shared` — types, schemas, utilities shared across packages
- `automation` — scraping tooling

The monorepo boundary enforces that shared types live in one place and are imported by both frontend and API. This prevents type drift between the two runtimes.

---

Relevant Records:
- [[shared package is the single source of truth for cross-package types]] — what shared exports
- [[Astro pages fetch server-side and pass data to React components via client:load]] — consequence of API being in CF Workers

Topics:
- [[architecture-map]]
