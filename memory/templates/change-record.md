---
_schema:
  entity_type: "change-record"
  applies_to: "records/*.md"
  required:
    - description
  optional:
    - type
    - status
    - created
    - affected_files
    - commit
  enums:
    type:
      - decision
      - change
      - pattern
      - question
      - tension
    status:
      - active
      - superseded
      - preliminary
  constraints:
    description:
      max_length: 200
      format: "One sentence explaining what changed and why it mattered"

description: ""
type: change
status: active
created: YYYY-MM-DD
affected_files: []
commit: ""
---

# prose-as-title: state the change as a proposition about what improved or shifted

## What Changed

What was modified and in which files/packages?

## Why

What problem or goal prompted this change?

## Before / After

What did the old approach look like, and what does the new one look like?

## Impact

What does this change affect going forward? What should future sessions know?

---

Relevant Records:
- [[related record]] — how it connects

Topics:
- [[frontend-map]]
