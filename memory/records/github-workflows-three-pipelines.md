---
description: Three GitHub Actions workflows cover deployment, performance auditing, and data sync — each with distinct triggers and independently runnable
type: pattern
status: active
created: 2026-02-19
affected_files: [.github/workflows/frontend-build.yaml, .github/workflows/lighthouse.yaml, .github/workflows/sync-automation.yaml]
---

# Three GitHub Actions workflows cover deployment, Lighthouse audits, and data sync

The project uses three workflow files with non-overlapping responsibilities:

- `frontend-build.yaml` — triggers on push and PR; builds and deploys the Astro frontend to Cloudflare Pages. This is the primary CI gate.
- `lighthouse.yaml` — runs on a schedule and can be triggered manually; performs Lighthouse performance audits on the deployed frontend. Does not deploy anything.
- `sync-automation.yaml` — runs on a schedule and can be triggered manually; executes the Playwright/Cheerio scraper to pull fresh attendance data and sync it to Turso.

The separation of deploy (`frontend-build.yaml`) from data sync (`sync-automation.yaml`) is intentional: data updates happen independently of code deploys. The sync workflow is the production path for the automation package — it's how scraped data enters the database.

Manual triggers on `lighthouse.yaml` and `sync-automation.yaml` allow out-of-schedule runs without requiring a code push.

---

Relevant Records:
- [[Playwright and Cheerio power the attendance scraper in the automation package]] — sync-automation.yaml runs that scraper
- [[deploy commands must never be run unless explicitly requested]] — deploy commands are automated here; avoid running them locally unless explicitly asked
- [[Turso (libsql) is the database backend accessed via Drizzle from Cloudflare Workers]] — sync workflow writes scraped data to Turso as its final step

Topics:
- [[architecture-map]]
