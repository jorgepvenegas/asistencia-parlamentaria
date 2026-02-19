---
description: Deploy commands must never be run unless the user explicitly requests deployment — this is a hard guardrail, not a suggestion
type: pattern
status: active
created: 2026-02-19
---

# deploy commands must never be run unless explicitly requested

Deployment is irreversible and affects production. The convention is: unless the user says "deploy" or equivalent, no deploy commands run. This applies even if tests pass and the build looks clean.

Prefer non-destructive git operations for the same reason — no force-push, no history rewriting without explicit instruction.

---

Relevant Records:
- [[schema changes are high impact and require documented migration]] — similar caution for another irreversible action

Topics:
- [[architecture-map]]
