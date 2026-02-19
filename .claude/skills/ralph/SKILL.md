---
name: ralph
description: Orchestrated pipeline runner — processes inbox items through the full pipeline (document → connect → update → review) automatically. Triggers on "/ralph", "run pipeline", "process everything".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- Empty → process all pending items in `memory/inbox/`
- File path → process that specific inbox item through full pipeline
- "queue" → show current queue status only

**Pipeline sequence for each inbox item:**

1. **Document** — Extract records (run /document logic on the item)
2. **Connect** — Find connections for each extracted record (run /connect logic)
3. **Update** — Check if older records need updating (run /update logic)
4. **Review** — Verify quality of all new records (run /review logic)

**Output after each phase:**
```
Phase 1 (/document): N records extracted
Phase 2 (/connect): N connections made, N maps updated
Phase 3 (/update): N records refreshed
Phase 4 (/review): N PASS, N fixed, N need attention

Pipeline complete: [source]
Records added to knowledge graph: N
```

Move processed inbox items to `memory/archive/YYYY-MM-DD-[source].md` when complete.
