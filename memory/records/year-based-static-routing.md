---
description: Frontend routes are statically generated for years 2022-2025 using Astro's static path generation
type: decision
status: active
created: 2026-02-19
---

# frontend routing uses year-based static paths covering 2022 to 2025

Astro generates static pages for each year in range 2022-2025. The year is a path segment, and all legislative session data for that year is fetched and rendered at build time.

When a new legislative year is added, the static path list must be updated. This is the only way to add new year coverage.

---

Relevant Records:
- [[astro-server-fetch-to-react-client-load]] — how data is fetched for each static route
- [[hono-drizzle-cloudflare-workers-api]] — the API that each year route queries at build time

Topics:
- [[frontend-map]]
