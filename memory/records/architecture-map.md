---
description: Navigation map for cross-cutting architectural decisions — monorepo structure, CI/CD, automation, and operational guardrails
type: map
created: 2026-02-19
---

# architecture-map — cross-cutting decisions and system-wide patterns

## Records in This Area

- [[monorepo-pnpm-workspaces-four-packages]] — the four-package structure and why the monorepo boundary exists
- [[pnpm-f-flag-required-for-package-scoped-commands]] — gotcha: without -F, root scripts run or commands fail silently
- [[github-workflows-three-pipelines]] — CI/CD separation of deploy, performance, and data sync concerns
- [[playwright-cheerio-scraper-automation]] — how the fourth package works; scheduled via sync-automation.yaml
- [[never-run-deploy-commands]] — hard guardrail: production deploys are irreversible; no exceptions without explicit user instruction
- [[security-by-framework-defaults]] — security surface is Drizzle + Astro + Hono defaults; deviating requires explicit review

## Key Decisions

- [[monorepo-pnpm-workspaces-four-packages]] — monorepo over separate repos; shared types package enforces contract between frontend and API
- [[playwright-cheerio-scraper-automation]] — separate automation package keeps scraper failures isolated from API availability

## Open Questions

- Are there plans to add a fifth package (e.g., for CLI tooling or admin)?
- Is the Lighthouse workflow tracking any regressions over time, or just spot-checking?

---

Topics:
- [[index]]
