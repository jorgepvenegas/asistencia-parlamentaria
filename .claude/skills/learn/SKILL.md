---
name: learn
description: Research a topic related to the project — find best practices, understand a library, explore architectural options. Files results to inbox with provenance. Triggers on "/learn", "/learn [topic]", "research X", "what does Y do".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Glob, WebSearch, WebFetch
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

1. Determine the research question from the target
2. Research using available tools (WebSearch, WebFetch)
3. Synthesize findings relevant to asistencia-camara context
4. Write to `memory/inbox/YYYY-MM-DD-[topic-slug].md` with provenance:

```markdown
---
source_type: research
research_prompt: "[the query used]"
research_server: web-search
generated: YYYY-MM-DDTHH:MM:SSZ
status: pending
---

# research: [topic]

[Synthesized findings relevant to the project]

## Key Points
- [point 1]
- [point 2]

## Relevant to asistencia-camara
[How these findings apply to the project specifically]
```

5. Output: `Saved to memory/inbox/[filename]. Next: /document memory/inbox/[filename]`
