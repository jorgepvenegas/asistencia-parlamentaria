---
description: Why each configuration dimension was chosen for the asistencia-camara project memory system
category: derivation-rationale
created: 2026-02-19
status: active
---

# derivation rationale for asistencia-camara project memory

This system was derived from a conversation establishing the need to track code changes and architecture for the asistencia-camara monorepo so Claude Code instances can retrieve context after sessions end.

## Domain

asistencia-camara is a pnpm monorepo with four packages:
- `@quienatiende/frontend` — Astro + React + Tailwind, static-site generation
- `@quienatiende/api` — Hono + Drizzle + Cloudflare Workers
- `@quienatiende/shared` — shared TypeScript types and Zod schemas
- `@quienatiende/automation` — scraping automation

## Dimension Choices

**Atomic granularity** — The user wants to track both "what changed and why" AND "current state." These require separate records: a change record for the event, a decision record for the architectural rationale. Atomic notes allow these to link without one containing the other. Each record answers exactly one question.

**Flat organization** — Single project scope, no need for hierarchical namespacing. Component maps provide structure without folder hierarchy.

**Explicit + implicit linking** — Code changes have non-obvious connections to architectural decisions. A refactor of URL routing connects to a decision about URL structure which connects to the routing component map. These relationships need to be discoverable.

**Moderate processing** — Not extracting claims from academic papers. Processing happens after sessions: documenting what was done, why, and what it affects. Session capture auto-documents at low friction.

**3-tier navigation** — index → component maps → individual records. The index provides orientation, maps provide domain structure (frontend, API, shared, architecture), individual records provide the actual knowledge.

**Full automation** — Claude Code platform. Session hooks fire automatically. Validate-on-write catches schema drift. Auto-commit ensures nothing is lost.

**Self-space enabled** — The agent needs persistent identity and goals to maintain session-to-session continuity. Without goals.md being read at session start, every session re-discovers the codebase from scratch.

## Coherence Notes

Atomic + moderate processing has a soft constraint warning (atomic notes prefer heavy processing). Compensating mechanism: the session-capture hook auto-documents what happened, reducing the manual burden of /document to "extract the important decisions" rather than "document everything."

## Failure Mode Mitigations

- **Temporal Staleness** — /update skill, stale-notes condition trigger, status: superseded for obsolete decisions
- **Collector's Fallacy** — /document requires rationale, not just description
- **Orphan Drift** — /connect is mandatory step after /document

---

Topics:
- [[methodology]]
