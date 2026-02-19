---
name: connect
description: Find connections between records and update component maps. Use after /document creates records, when exploring how a change relates to architecture, or when a record seems isolated. Triggers on "/connect", "/connect [record]", "find connections", "update maps", "connect these records".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## Runtime Configuration (Step 0)

Read `memory/ops/derivation-manifest.md` for vocabulary.
Read `memory/ops/config.yaml` for processing depth.

Vault: `memory/`   Records: `memory/records/`

---

## THE MISSION

**The network IS the knowledge.** An isolated record is less valuable than a connected one. Your job is to find genuine relationships and encode them as wiki links.

This is semantic judgment — understanding what records MEAN. A record about "API response validation with Zod" connects to "shared types package structure" even without shared keywords. Build a traversable graph, not a tagged document set.

**Quality over speed. Explicit over vague.**

Every connection must pass the articulation test: can you say WHY these records connect?

`[[Zod schemas validate all API responses]] — foundation for [[shared types package exports Zod schemas]]`

Bad: "related"
Good: "extends by adding the runtime enforcement aspect"
Good: "foundation that makes this possible"

---

## EXECUTE NOW

**Target: $ARGUMENTS**

1. Read the target record fully — understand its proposition and context
2. Search `memory/records/` for related records using Grep:
   - Search by topic area (frontend, api, routing, types, etc.)
   - Search for records that mention the same components or patterns
3. For each candidate, evaluate: is there a genuine relationship? Can you say WHY?
4. **Forward connections:** Add wiki links inline or in the footer of the target record
5. **Map update:** Find the relevant component map(s) and add this record with a context phrase
6. **Backward connections:** For each connected record, consider whether it should link back
7. Report: what was connected, what maps were updated, what was evaluated but not connected

---

## Connection Types

| Type | When to Use | Example |
|------|-------------|---------|
| extends | Builds on the idea | `[[Astro pages fetch server-side]] extends [[API is only accessible from server]]` |
| foundation | Provides the base constraint | `[[Drizzle ORM for type-safe queries]] — foundation for [[API response Zod validation]]` |
| contradicts | Conflicts with (capture as tension) | Rare — if found, create a tension note |
| enables | Makes this possible | `[[Cloudflare Workers edge deployment]] enables [[API latency under 50ms]]` |
| example | Illustrates the pattern | `[[party page routing uses year parameter]] — example of [[year-based static paths pattern]]` |

## Map Update Format

When adding a record to a component map:
```markdown
- [[record title]] — one-sentence context phrase explaining why this record belongs here
```

Not just `- [[record title]]`. The context phrase tells future agents why to follow this link.

## Quality Gates

- [ ] Every connection can be articulated (not just "related")
- [ ] Every new record is in at least one component map
- [ ] No dangling links created (verify targets exist before linking)
- [ ] Backward pass completed for strong connections

## After Connecting

Output: connections made (with relationship type), maps updated, backward connections added.
Next step: `Next: /update [oldest related record]` for backward pass if older records need updating.
