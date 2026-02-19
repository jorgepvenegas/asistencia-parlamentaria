---
name: refactor
description: Restructure the vault — rename records safely, split oversized maps, reorganize record types. Triggers on "/refactor", "rename record", "restructure vault", "split this map".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- "rename [old] to [new]" → safe rename (update all links)
- "split [map]" → split oversized map into sub-maps
- "retype [record] to [type]" → change record type

**Safe Rename:**
1. Verify source file exists in `memory/records/`
2. Create new file with new name
3. Update ALL wiki links across `memory/` using Edit tool
4. Delete old file
5. Verify no dangling links remain

```bash
# Find all references to old title
rg "\[\[old title\]\]" memory/ --glob "*.md" -l
```

**Split Map:**
When a component map exceeds ~35 records:
1. Identify natural sub-groupings in the map
2. Create sub-maps in `memory/records/`
3. Distribute records with context phrases
4. Update the parent map to link to sub-maps
5. Update all records' Topics footers

**Output:** What changed, what was updated, verification that no links broke.
