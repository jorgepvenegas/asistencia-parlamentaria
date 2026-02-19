---
name: document
description: Extract structured knowledge from source material — session notes, AGENTS.md, git logs, code comments. Comprehensive extraction is the default. Every architectural decision, change, pattern, or gotcha that serves project memory gets extracted. Zero extraction from a relevant source is a BUG. Triggers on "/document", "/document [file]", "extract records", "document this", "process this".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Grep, Glob, Bash
context: fork
---

## Runtime Configuration (Step 0 — before any processing)

Read `memory/ops/derivation-manifest.md` for vocabulary mapping and extraction categories.
Read `memory/ops/config.yaml` for processing depth and chaining.

Vault root: `memory/`
Records folder: `memory/records/`
Inbox folder: `memory/inbox/`

---

## THE MISSION

You are the extraction engine for project knowledge. Raw source material enters. Structured, atomic records exit.

### The Core Distinction

Having knowledge embedded in code or config is NOT the same as having it articulated as a traversable record. Even if information is visible in the codebase, the vault may lack the externalized reasoning explaining WHY it works. That reasoning is what you extract.

### Comprehensive Extraction

For project-relevant sources, extract ALL of:

1. **Architectural decisions** — design choices with rationale. Why Hono over Express? Why Astro for the frontend? Why Drizzle for the ORM? Each becomes its own record.

2. **Component structure** — how packages and layers relate. What does `@quienatiende/shared` export? How does the frontend consume the API? Each structural relationship is a record.

3. **Data flow patterns** — how data moves. Server-side Astro fetch → React component via `client:load` props. This IS a record because future sessions need to know it.

4. **Change records** — significant refactors with their motivation. "Restructured party URLs to slug-based routing because X" is a record. "Fixed typo" is not.

5. **Patterns and conventions** — `ATTENDANCE_COLORS` in `constants/colors.ts` is the single source of truth. Zod schemas validate all API responses. These are records.

6. **Gotchas** — "Never run deploy commands" is a constraint worth knowing. "pnpm -F flag required to scope commands to packages" is a gotcha record.

### INVALID Skip Reasons

- "already in AGENTS.md" — AGENTS.md is instructions for humans. Records are knowledge for agents. Extract.
- "obvious to anyone who reads the code" — not obvious to a session that hasn't read the code yet. Extract.
- "near-duplicate" — near-duplicates add nuance. Create with a note on the distinction.

### VALID Skip Reasons

- Completely off-domain (unrelated to asistencia-camara)
- Too vague (applies to every project)
- Pure boilerplate with zero extractable insight
- Literally identical text already exists as a record

---

## EXECUTE NOW

**Target: $ARGUMENTS**

1. Read `memory/ops/derivation-manifest.md` for vocabulary
2. If target is a file path, read the file fully
3. If target is empty, check `memory/inbox/` for unprocessed items
4. Extract records using the six extraction categories
5. For each record, verify: title works as prose, description adds information, WHY is visible
6. Write records to `memory/inbox/` with this naming pattern: `YYYY-MM-DD-slug.md`
7. Output a summary: how many records extracted, what categories, what was skipped and why

---

## Record Format

```markdown
---
description: One sentence adding context beyond the title
type: decision | change | pattern | question | tension
status: active
created: YYYY-MM-DD
affected_files: [optional list of key files]
---

# the proposition as a sentence — title works as prose when linked

[Body: context, rationale, consequences. For decisions: what was considered and why this won.
For changes: before/after, what it enables. For patterns: when to apply it and why it works.]

---

Relevant Records:
- [[related record]] — how it connects

Topics:
- [[component-map]]
```

## Quality Gates

Before writing a record:

- [ ] Title works as prose: `because [[title]]` reads naturally
- [ ] Description adds scope or mechanism the title doesn't cover
- [ ] Body answers WHY, not just WHAT
- [ ] For changes: affected files are listed, motivation is stated
- [ ] For decisions: alternatives considered are noted

If a gate fails, fix it before writing. An unprocessed inbox item is better than a record that fails the quality bar.

## After Extracting

Output includes:
- Count of records extracted
- Count of items skipped (with reasons)
- Next step: `Next: /connect [record title]` for each new record
