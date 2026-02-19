---
name: pipeline
description: Batch pipeline processing — process multiple inbox items or run a named batch through the full pipeline. Triggers on "/pipeline", "process batch", "run all inbox".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- Empty or "all" → process all items in `memory/inbox/`
- Specific file or glob → process matching items

For each item, run the full pipeline via /ralph logic. Track progress:

```json
{
  "batch": "YYYY-MM-DD",
  "total": N,
  "completed": N,
  "current": "filename",
  "records_created": N
}
```

Write progress to `memory/ops/queue/queue.json`.

After completion: summarize records created, connections made, items archived.
Move completed items to `memory/archive/`.
