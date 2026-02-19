---
description: Navigation map for cross-cutting architectural decisions — monorepo structure, CI/CD, automation, and operational guardrails
type: map
created: 2026-02-19
---

# architecture-map — cross-cutting decisions and system-wide patterns

## Records in This Area

- [[monorepo uses pnpm workspaces with four packages]] — the four-package structure and why the monorepo boundary exists
- [[pnpm -F flag is required to scope commands to individual packages]] — gotcha: without -F, root scripts run or commands fail silently
- [[Three GitHub Actions workflows cover deployment, Lighthouse audits, and data sync]] — CI/CD separation of deploy, performance, and data sync concerns
- [[Playwright and Cheerio power the attendance scraper in the automation package]] — how the fourth package works; scheduled via sync-automation.yaml
- [[deploy commands must never be run unless explicitly requested]] — hard guardrail: production deploys are irreversible; no exceptions without explicit user instruction
- [[Security relies on framework defaults rather than custom security code]] — security surface is Drizzle + Astro + Hono defaults; deviating requires explicit review

## Key Decisions

- [[monorepo uses pnpm workspaces with four packages]] — monorepo over separate repos; shared types package enforces contract between frontend and API
- [[Playwright and Cheerio power the attendance scraper in the automation package]] — separate automation package keeps scraper failures isolated from API availability

## Open Questions

- Are there plans to add a fifth package (e.g., for CLI tooling or admin)?
- Is the Lighthouse workflow tracking any regressions over time, or just spot-checking?

---

Topics:
- [[index]]
