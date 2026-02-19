---
name: analyze
description: Graph analysis — find synthesis opportunities, detect orphans, measure link density, discover clusters. Triggers on "/analyze", "graph analysis", "find connections I'm missing", "synthesis opportunities".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- "triangles" or empty → synthesis opportunities (open triadic closures)
- "orphans" → records with no incoming links
- "density" → link density across records
- "clusters" → isolated groups of records
- Natural language question → route to appropriate analysis

**Synthesis Opportunities (default)**

Find records A and B that are both linked from the same map but don't link to each other:

```bash
# Get all records in each map and find pairs without direct connections
# For each map file, extract linked records
# For each pair in the same map, check if they cross-link
rg '\[\[' memory/records/*-map.md -o | grep -oP '\[\[\K[^\]]+' | sort
```

For each candidate pair: evaluate whether a genuine relationship exists. Report the top 5 synthesis opportunities with suggested connection type.

**Orphan Detection**

```bash
# Find records with no incoming links
for f in memory/records/*.md; do
  title=$(basename "$f" .md)
  count=$(rg -r "\[\[$title\]\]" memory/ --glob "*.md" -l 2>/dev/null | wc -l)
  [[ "$count" -eq 0 ]] && echo "Orphan: $title"
done
```

**Output:**

```
Graph Analysis: [mode]

[Results with context — not just lists]

Recommended action: [specific next step]
```
