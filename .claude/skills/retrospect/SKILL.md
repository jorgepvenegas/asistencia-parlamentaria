---
name: retrospect
description: Challenge system assumptions against accumulated evidence. Triages observations and tensions, detects patterns, generates proposals for system improvement. Triggers on "/retrospect", "review observations", "what have I learned", "challenge assumptions".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## Runtime Configuration (Step 0)

Read `memory/ops/derivation-manifest.md` for vocabulary.
Vault: `memory/`

---

## THE MISSION

The system is not sacred. Evidence beats intuition. Observations in `memory/ops/observations/` capture friction from actual use. Tensions in `memory/ops/tensions/` capture unresolved conflicts. /retrospect triages these individually, then looks for patterns, and proposes changes when patterns emerge.

---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- Empty → full retrospect: triage all pending observations + tensions, detect patterns
- "triage" → triage only (no pattern detection)
- "drift" → check if methodology notes are stale relative to config changes
- Specific filename → triage that single item interactively

**Phase 0: Drift Check**

```bash
# Compare config modification time vs methodology notes
ls -lt memory/ops/methodology/ | head -5
ls -lt memory/ops/config.yaml
```

If `ops/config.yaml` is newer than all methodology notes, flag potential drift: the system was reconfigured but methodology wasn't updated.

**Phase 1: Triage Observations**

For each pending observation in `memory/ops/observations/`:

Read it. Decide one of four actions:

| Action | When | What to Do |
|--------|------|-----------|
| PROMOTE | Observation crystallized into a genuine insight | Create a record in `memory/records/` |
| IMPLEMENT | Points to a concrete system change | Update CLAUDE.md, templates, or workflows. Document in ops/methodology/. |
| ARCHIVE | Session-specific or no longer relevant | Set `status: archived` |
| KEEP | Not enough evidence yet | Set `status: pending`, add a note |

**Phase 2: Triage Tensions**

For each pending tension in `memory/ops/tensions/`:

Read it. Decide:

| Action | When |
|--------|------|
| RESOLVE | Create a new record that reconciles the conflict |
| DISSOLVE | The conflict was apparent, not real — the two ideas operate in different contexts |
| KEEP PENDING | More evidence needed |

**Phase 3: Pattern Detection**

After triaging, look for patterns across processed items:
- Do multiple friction observations point to the same area?
- Do resolved tensions reveal a gap in the record schema?
- Has the same type of record been hard to find repeatedly?

If patterns emerge, generate a proposal. Present the proposal — don't implement without approval.

---

## Output Format

```
/retrospect results

Observations triaged: N
  PROMOTED: [count] → records/ (list titles)
  IMPLEMENTED: [count] → system changes (describe)
  ARCHIVED: [count]
  KEPT PENDING: [count]

Tensions triaged: N
  RESOLVED: [count]
  DISSOLVED: [count]
  KEPT: [count]

Patterns detected: [list or "none"]

Proposals (if any):
  1. [proposed change] — evidence: [observations that support it]
```
