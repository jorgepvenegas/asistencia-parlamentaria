---
description: How I document, connect, and maintain project knowledge
type: moc
---

# methodology

## Principles

- **Prose-as-title** — every record is a proposition. `[[astro-server-fetch-to-react-client-load]]` works as a sentence.
- **Wiki links** — connections as graph edges. Each link carries a relationship.
- **Maps** — component maps are attention hubs. They tell me what to read without reading everything.
- **Capture fast, document slow** — inbox first, structure later.

## My Process

**Document** (from inbox item or session content)
Read the source through the project lens: is this an architectural decision, a change record, a pattern, or a gotcha? Extract atomic records. Write the WHY, not just the WHAT. For changes, include affected files. For decisions, include what alternatives were considered.

**Connect** (find relationships)
After creating records, search for connections to existing ones. What does this decision build on? What does this change affect? Which component map does it belong to? Update the map.

**Update** (backward pass)
After significant changes, ask which existing records need updating. Architecture maps especially. Mark superseded decisions as `status: superseded` rather than deleting them — history matters.

**Review** (verify quality)
Cold-read test: read only the title and description and predict the content. If the prediction misses, improve the description.

## What Goes Where

- Durable knowledge → `records/`
- Raw capture → `inbox/`
- My operational state → `self/`
- Friction signals → `ops/observations/`
- Contradictions → `ops/tensions/`

---

Topics:
- [[identity]]
