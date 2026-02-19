---
name: tasks
description: Task queue management — view, add, advance, or archive pipeline tasks. Triggers on "/tasks", "show queue", "task queue status".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
context: fork
---

## EXECUTE NOW

**Target: $ARGUMENTS**

Parse:
- Empty or "show" → display queue status
- "add [task]" → add task to queue
- "done [id]" → mark task complete
- "archive" → archive completed tasks to ops/queue/archive/

Queue file: `memory/ops/queue/queue.json`

**Show format:**
```
Task Queue

Pending: N
  - [id] [type] [target] (phase: current_phase)

In progress: N
  - [id] [type] [target]

Done today: N
```

If queue file doesn't exist, create it:
```json
{
  "schema_version": 3,
  "tasks": [],
  "maintenance_conditions": {
    "orphan_notes": {"threshold": 1, "action": "connect"},
    "inbox_pressure": {"threshold": 3, "action": "document"},
    "observation_accumulation": {"threshold": 10, "action": "retrospect"},
    "tension_accumulation": {"threshold": 5, "action": "retrospect"}
  }
}
```
