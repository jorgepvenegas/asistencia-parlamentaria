---
name: validate
description: Schema compliance check across all records. Batch validation of YAML frontmatter, required fields, enum values. Triggers on "/validate", "validate schema", "check all records".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

Check all records in `memory/records/` against schema requirements.

```bash
# Records missing description
echo "Missing description:"
rg -L '^description:' memory/records/*.md 2>/dev/null

# Records with invalid type
echo "Invalid type values:"
rg '^type:' memory/records/ --no-filename | grep -vE 'decision|change|pattern|map|question|tension'

# Records with invalid status
echo "Invalid status values:"
rg '^status:' memory/records/ --no-filename | grep -vE 'active|superseded|preliminary'
```

**Output:**

```
Schema Validation

PASS: N records
WARN: N records (optional fields missing)
FAIL: N records

Failures:
  - [filename]: missing description
  - [filename]: invalid type value "X"

Run /review [record] to fix individual failures.
```
