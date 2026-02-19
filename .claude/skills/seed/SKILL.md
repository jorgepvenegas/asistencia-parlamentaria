---
name: seed
description: Initialize processing for a new source — create inbox entry with provenance, queue for /document. Triggers on "/seed", "/seed [source]", "start processing", "add to inbox".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Glob
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Create an inbox entry for the source with metadata:

```markdown
---
source_type: session | file | git-log | manual
source_path: [path or description]
created: YYYY-MM-DD
status: pending
---

# source: [brief description]

[Content or reference to source]
```

Write to `memory/inbox/YYYY-MM-DD-[slug].md`.

Output: confirmation with path, and `Next: /document memory/inbox/[filename]`
