---
name: update
description: Refresh stale records with current context. The backward pass — ask whether existing records still reflect what's true. Use after significant refactors, when a record feels outdated, or as part of the maintenance cycle. Triggers on "/update", "/update [record]", "update old records", "refresh stale", "backward pass".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## Runtime Configuration (Step 0)

Read `memory/ops/derivation-manifest.md` for vocabulary.
Vault: `memory/`   Records: `memory/records/`

---

## THE MISSION

Records are living documents, not finished artifacts. A record written three months ago was written with three months ago's understanding. Since then: the codebase changed, new records exist, the architectural understanding deepened. Updating is completely reconsidering a record based on current knowledge.

**The core question for each record: "If I wrote this today, what would be different?"**

---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- If target is a record name: update that record
- If target is "stale": find records older than 30 days with sparse connections (< 2 links)
- If target is "maps": update all component maps (highest-priority after refactors)
- If target is empty: check for maintenance queue items needing updates

**For each record being updated:**

1. Read the record fully
2. Check modification date and connection density
3. Ask: what has changed in the codebase since this was written?
4. Search for newer records that relate to this one but aren't linked
5. Evaluate what needs to change:

| Action | When |
|--------|------|
| Add connections | Newer records exist that should link here |
| Rewrite section | Understanding evolved, prose should reflect it |
| Sharpen title | Title is too vague to work as prose |
| Split the record | Multiple distinct ideas bundled together |
| Mark superseded | The decision or pattern has been replaced |
| Archive | The record is no longer relevant |

6. Apply changes using Edit tool
7. Report what changed and why

---

## Superseded Decision Format

When a decision or pattern has been replaced:

```yaml
status: superseded
superseded_by: [[new decision record]]
superseded_date: YYYY-MM-DD
```

Don't delete superseded records — history matters. Future sessions may want to understand why an approach was abandoned.

## Quality Gates

- [ ] Title still works as prose and reflects current understanding
- [ ] Description still adds information beyond the title
- [ ] No broken wiki links after edit
- [ ] If content substantially changed, check that connected records still make sense

## After Updating

Output: records updated, what changed (summary), any records marked superseded.
Next step: `Next: /review [updated record]` to verify quality.
