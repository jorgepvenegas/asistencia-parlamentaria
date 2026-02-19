---
description: How this knowledge system was derived — enables architect and reseed commands
created: 2026-02-19
engine_version: "1.0.0"
---

# System Derivation

## Configuration Dimensions

| Dimension | Position | Conversation Signal | Confidence |
|-----------|----------|--------------------|--------------------|
| Granularity | Atomic | "both" (what changed and why + current state) — each decision or change gets its own record | High |
| Organization | Flat | Single project, scoped to asistencia-camara monorepo | High |
| Linking | Explicit + implicit | Code changes relate to architecture; decisions connect across components | High (cascade) |
| Processing | Moderate | Need structured extraction from sessions, not academic-depth processing | Medium |
| Navigation | 3-tier | Component maps + individual change/decision records + root index | High |
| Maintenance | Condition-based | Default — fires when orphans, stale records, or inbox pressure accumulates | Default |
| Schema | Moderate | Need type, affected-files, rationale fields; not sparse but not dense | Medium |
| Automation | Full | Claude Code platform — session hooks, validate-on-write, auto-commit | High |

## Personality Dimensions

| Dimension | Position | Signal |
|-----------|----------|--------|
| Warmth | clinical | No warmth signals — developer tool context, neutral-helpful default |
| Opinionatedness | neutral | No preference signals |
| Formality | professional | Developer domain default |
| Emotional Awareness | task-focused | No emotional signals — pure knowledge tracking |

## Vocabulary Mapping

| Universal Term | Domain Term | Category |
|---------------|-------------|----------|
| notes | records | folder |
| inbox | inbox | folder |
| archive | archive | folder |
| note (type) | record | note type |
| note_plural | records | note type |
| reduce | document | process phase |
| reflect | connect | process phase |
| reweave | update | process phase |
| verify | review | process phase |
| validate | validate | process phase |
| rethink | retrospect | process phase |
| MOC | map | navigation |
| topic_map | map | navigation |
| description | description | schema field |
| topics | topics | schema field |
| relevant_notes | relevant records | schema field |
| cmd_reduce | /document | command |
| cmd_reflect | /connect | command |
| cmd_reweave | /update | command |
| cmd_verify | /review | command |
| cmd_rethink | /retrospect | command |

## Platform

- Tier: Claude Code
- Automation: full (default)

## Active Feature Blocks

- [x] wiki-links — always included (kernel)
- [x] processing-pipeline — always included
- [x] schema — always included
- [x] maintenance — always included
- [x] self-evolution — always included
- [x] methodology-knowledge — always included
- [x] session-rhythm — always included
- [x] templates — always included
- [x] ethical-guardrails — always included
- [x] helper-functions — always included
- [x] graph-analysis — always included
- [x] self-space — included (agent needs persistent identity to maintain continuity)
- [x] atomic-notes — included (granularity = atomic)
- [x] mocs — included (navigation = 3-tier)
- [ ] semantic-search — excluded (single project, flat search sufficient)
- [ ] multi-domain — excluded (single project scope)
- [ ] personality — excluded (no signals, neutral-helpful default)

## Coherence Validation Results

- Hard constraints checked: 3. Violations: none
- Soft constraints checked: 6. Auto-adjusted: none. User-confirmed: none
- Compensating mechanisms active: atomic + moderate processing → session capture hook auto-documents, reducing manual burden

## Failure Mode Risks

1. **Temporal Staleness** (HIGH) — Architecture records become stale as code evolves; mitigation: /update skill + stale-records condition trigger
2. **Collector's Fallacy** (MEDIUM) — Capturing every git commit without synthesizing the why; mitigation: quality gate in /document requires rationale, not description
3. **Orphan Drift** (MEDIUM) — Change records with no connection to architecture maps; mitigation: /connect phase is mandatory after /document
4. **Cognitive Outsourcing** (LOW) — Over-relying on the system and losing own understanding; low risk for single-developer tool use

## Generation Parameters

- Folder names: records/, inbox/, archive/, self/, templates/, ops/
- Domain: asistencia-camara monorepo (Astro+React frontend, Hono+Drizzle+CF Workers API, shared types, automation)
- Preset: PM-adjacent (project memory, decision-centric)
- Skills to generate: 16 (vocabulary-transformed to developer/project vocabulary)
- Hooks to generate: session-orient, session-capture, validate-note, auto-commit
- Templates to create: decision-record.md, change-record.md, component-map.md
- Topology: single-agent
