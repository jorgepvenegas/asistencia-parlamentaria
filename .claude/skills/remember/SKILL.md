---
name: remember
description: Capture methodology learnings and operational corrections. Rule Zero — methodology is the canonical spec. Use when you notice something that should change how the system works. Triggers on "/remember", "remember this", "always do X", "note that".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Grep, Glob
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- If target describes a correction ("always do X", "never do Y") → create methodology note in `memory/ops/methodology/`
- If target describes friction → create observation in `memory/ops/observations/`
- If target describes a contradiction → create tension in `memory/ops/tensions/`

**Observation format** (`memory/ops/observations/YYYY-MM-DD-slug.md`):
```markdown
---
description: What happened and what it suggests
category: friction | surprise | process-gap | methodology
status: pending
observed: YYYY-MM-DD
---
# the observation as a sentence

What happened and what might improve.
```

**Tension format** (`memory/ops/tensions/YYYY-MM-DD-slug.md`):
```markdown
---
description: What conflicts and why it matters
status: pending
observed: YYYY-MM-DD
involves: ["[[record A]]", "[[record B]]"]
---
# the tension as a sentence
```

**Methodology note format** (`memory/ops/methodology/YYYY-MM-DD-slug.md`):
```markdown
---
description: The directive and its rationale
category: behavioral-correction | vocabulary | schema | workflow
status: active
created: YYYY-MM-DD
---
# the directive as a sentence

What to do and why. This overrides any conflicting instruction in CLAUDE.md for this specific case.
```

After writing: confirm what was captured and where. If it's a methodology correction, ask: "Do you want me to also update CLAUDE.md to reflect this?"
