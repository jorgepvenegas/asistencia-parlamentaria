---
engine_version: "0.2.0"
research_snapshot: "2026-02-10"
generated_at: "2026-02-19T00:00:00Z"
platform: claude-code
kernel_version: "1.0"

dimensions:
  granularity: atomic
  organization: flat
  linking: explicit+implicit
  processing: moderate
  navigation: 3-tier
  maintenance: condition-based
  schema: moderate
  automation: full

active_blocks:
  - wiki-links
  - processing-pipeline
  - schema
  - maintenance
  - self-evolution
  - methodology-knowledge
  - session-rhythm
  - templates
  - ethical-guardrails
  - helper-functions
  - graph-analysis
  - self-space
  - atomic-notes
  - mocs

coherence_result: passed

vocabulary:
  # Level 1: Folder names
  notes: "records"
  inbox: "inbox"
  archive: "archive"
  ops: "ops"

  # Level 2: Note types
  note: "record"
  note_plural: "records"

  # Level 3: Schema field names (structural — stay universal)
  description: "description"
  topics: "topics"
  relevant_notes: "relevant records"

  # Level 4: Navigation terms
  topic_map: "map"
  hub: "index"

  # Level 5: Process verbs
  reduce: "document"
  reflect: "connect"
  reweave: "update"
  verify: "review"
  validate: "validate"
  rethink: "retrospect"

  # Level 6: Command names
  cmd_reduce: "/document"
  cmd_reflect: "/connect"
  cmd_reweave: "/update"
  cmd_verify: "/review"
  cmd_rethink: "/retrospect"

  # Level 7: Extraction categories
  extraction_categories:
    - name: "architectural decisions"
      what_to_find: "choices made about system design, technology, or structure — with the rationale"
      output_type: "decision"
    - name: "component structure"
      what_to_find: "how parts of the codebase fit together, API contracts, data shapes"
      output_type: "map"
    - name: "data flow patterns"
      what_to_find: "how data moves through the system — server-side fetch, prop passing, API calls"
      output_type: "record"
    - name: "change records"
      what_to_find: "significant code changes with their motivation and affected files"
      output_type: "change"
    - name: "dependencies and constraints"
      what_to_find: "external dependencies, package choices, and internal constraints worth remembering"
      output_type: "record"
    - name: "gotchas and patterns"
      what_to_find: "non-obvious behaviors, required conventions, traps to avoid, patterns that work"
      output_type: "pattern"

platform_hints:
  context: fork
  allowed_tools:
    - Read
    - Write
    - Edit
    - Grep
    - Glob
    - Bash
  semantic_search_tool: null
  semantic_search_autoapprove: []

personality:
  warmth: clinical
  opinionatedness: neutral
  formality: professional
  emotional_awareness: task-focused
---
