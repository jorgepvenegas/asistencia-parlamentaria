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
- [[shared-package-cross-package-types]] — what shared exports
- [[astro-server-fetch-to-react-client-load]] — consequence of API being in CF Workers
- [[pnpm-f-flag-required-for-package-scoped-commands]] — gotcha that applies across all four packages
- [[playwright-cheerio-scraper-automation]] — the fourth package and how it runs

Topics:
- [[architecture-map]]
