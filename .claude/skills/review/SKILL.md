---
name: review
description: Verify record quality — description test, schema compliance, link health, map membership. The final phase of the processing pipeline. Triggers on "/review", "/review [record]", "verify quality", "check this record".
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

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- If target is a record name or path: review that record
- If target is "all": review all records in memory/records/
- If target is empty: review the most recently created record

**For each record, run three checks:**

### Check 1: Cold-Read Test (description quality)

Read ONLY the title and description. Without reading the body, predict what the record contains. Then read the body. Does your prediction match?

| Result | Action |
|--------|--------|
| Prediction accurate | PASS |
| Prediction missed key content | FAIL — improve description |
| Description just restates title | FAIL — description must add information |

A good description adds scope, mechanism, or implication that the title doesn't cover.

### Check 2: Schema Compliance

Check YAML frontmatter:
- [ ] `description` field exists and is non-empty
- [ ] `type` value is one of: decision, change, pattern, map, question, tension
- [ ] `status` value (if present) is one of: active, superseded, preliminary
- [ ] No unknown fields that aren't in the template schema

### Check 3: Link Health

- [ ] All `[[wiki links]]` in the record point to files that exist in `memory/`
- [ ] Record appears in at least one component map in `memory/records/`
- [ ] Relevant Records section has context phrases (not just bare links)

---

## Fixing Failures

**Description fails:** Rewrite it. Max 200 chars. No trailing period. Must add information beyond the title.

**Schema fails:** Fix the offending field. Refer to `memory/templates/` for valid values.

**Broken link:** Either create the missing record (if it should exist) or remove the link (if it was speculative). Don't leave dangling links.

**Not in any map:** Add it to the relevant component map with a context phrase.

---

## Output Format

```
Review: [[record title]]

Check 1 - Description: PASS | FAIL
  [If FAIL: original description → suggested rewrite]

Check 2 - Schema: PASS | FAIL
  [If FAIL: field name → issue → fix applied]

Check 3 - Links: PASS | FAIL
  [If FAIL: broken links listed → resolution]

Map membership: PASS | FAIL
  [If FAIL: added to [[map name]]]

Overall: PASS | PASS WITH FIXES | FAIL (needs manual attention)
```
