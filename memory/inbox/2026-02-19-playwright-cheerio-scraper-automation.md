---
description: The automation package uses Playwright for browser-driven scraping and Cheerio for HTML parsing to collect Costa Rican parliamentary attendance data
type: decision
status: active
created: 2026-02-19
affected_files: [packages/automation/src/scrapers/attendance.ts, packages/automation/src/api-clients/, packages/automation/scripts/]
---

# Playwright and Cheerio power the attendance scraper in the automation package

The Costa Rican assembly website requires JavaScript rendering for its attendance tables, making a simple HTTP fetch insufficient. Playwright handles headless browser automation to fully render pages; Cheerio then parses the resulting HTML as a jQuery-like DOM traversal layer. The combination handles both dynamic content (Playwright) and static HTML extraction (Cheerio) without having to write raw DOM queries.

The automation package is intentionally separated from the API: it runs on a schedule via `sync-automation.yaml` GitHub Actions workflow, not as part of the API process. This decoupling means scraper failures don't affect API availability.

Runnable scripts in `packages/automation/scripts/` are entry points invoked via `pnpm -F @quienatiende/automation <script-name>`: `scrape-attendance`, `create-parties`, `create-politicians`, `sync`, `sync:year`.

The automation package is excluded from the root `pnpm build` and `pnpm test` commands — it must be run explicitly with `-F`.

---

Relevant Records:
- [[pnpm -F flag required for package-scoped commands]] — automation is the package most often forgotten in this pattern
- [[monorepo pnpm workspaces four packages]] — automation is the fourth package

Topics:
- [[architecture-map]]
