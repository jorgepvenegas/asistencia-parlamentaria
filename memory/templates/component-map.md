---
_schema:
  entity_type: "component-map"
  applies_to: "records/*-map.md"
  required:
    - description
  optional:
    - type
    - created
  enums:
    type:
      - map
  constraints:
    description:
      max_length: 200
      format: "One sentence describing what this map covers"

description: ""
type: map
created: YYYY-MM-DD
---

# component map name — what this area of the codebase does

## Records in This Area

- [[record title]] — one-line context phrase explaining relevance
- [[record title]] — one-line context phrase

## Key Decisions

- [[decision record]] — summary of the decision and its status

## Open Questions

- what are the unresolved questions about this component?

---

Topics:
- [[index]]
