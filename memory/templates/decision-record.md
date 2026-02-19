---
_schema:
  entity_type: "decision-record"
  applies_to: "records/*.md"
  required:
    - description
  optional:
    - type
    - status
    - created
    - affected_files
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
      format: "One sentence adding context beyond the title"

description: ""
type: decision
status: active
created: YYYY-MM-DD
affected_files: []
---

# prose-as-title: state the decision as a proposition

## Context

What situation or problem prompted this decision?

## Decision

What was decided, and why?

## Alternatives Considered

What else was considered and why it wasn't chosen?

## Consequences

What does this decision constrain or enable going forward?

---

Relevant Records:
- [[related record]] — how it connects

Topics:
- [[architecture-map]]
