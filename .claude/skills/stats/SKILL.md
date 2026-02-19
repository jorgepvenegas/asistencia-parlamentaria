---
name: stats
description: Vault statistics — record counts, type distribution, link density, inbox pressure, map coverage. Quick health snapshot. Triggers on "/stats", "vault stats", "how many records".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

Run these checks and report:

```bash
# Total records
ls memory/records/*.md 2>/dev/null | wc -l

# Records by type
rg '^type:' memory/records/ --no-filename | sort | uniq -c | sort -rn

# Records missing description
rg -L '^description:' memory/records/*.md 2>/dev/null | wc -l

# Inbox items
ls memory/inbox/*.md 2>/dev/null | wc -l

# Observations pending
rg '^status: pending' memory/ops/observations/ 2>/dev/null -l | wc -l

# Tensions pending
rg '^status: pending' memory/ops/tensions/ 2>/dev/null -l | wc -l
```

**Output format:**

```
asistencia-camara memory — stats

Records:        N
  decisions:    N
  changes:      N
  patterns:     N
  maps:         N

Inbox:          N items pending
Observations:   N pending
Tensions:       N pending

Schema issues:  N records missing description

[If any issues: "Run /next for recommended action"]
```
