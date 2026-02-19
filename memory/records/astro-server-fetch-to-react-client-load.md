---
description: Astro pages handle server-side data fetching and pass results to React components via client:load — keeping API calls server-only
type: decision
status: active
created: 2026-02-19
---

# Astro pages fetch server-side and pass data to React components via client:load

Data fetching happens in Astro page scripts at build/request time. Results are passed as props to React components hydrated with `client:load`. This means React components receive already-fetched data and do not call the API directly from the browser.

This pattern works because the API runs on Cloudflare Workers and is not directly accessible from the browser context in the same request flow. Keeping fetches server-side also avoids exposing API internals to clients.

---

Relevant Records:
- [[monorepo uses pnpm workspaces with four packages]] — the API package runs in CF Workers, which shapes this data flow
- [[the API uses Hono + Drizzle and runs on Cloudflare Workers]] — the API endpoint that Astro pages fetch from
- [[Zod schemas validate all API responses at system boundaries]] — parsing happens in Astro page scripts before passing data to React
- [[frontend routing uses year-based static paths covering 2022 to 2025]] — each static route triggers a server-side fetch for that year's data

Topics:
- [[frontend-map]]
