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

Topics:
- [[frontend-map]]
