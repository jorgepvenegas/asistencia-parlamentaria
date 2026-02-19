---
name: next
description: Surface the most valuable next action by combining queue state, inbox pressure, maintenance conditions, and goals. Recommends one specific action with rationale. Triggers on "/next", "what should I do", "what's next".
version: "1.0"
generated_from: "arscontexta-v1.6"
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
---

## EXECUTE NOW

**/next recommends, it does not execute.** Present one recommendation. The user decides.

**Steps:**

1. Read `memory/self/goals.md` — what's the current thread?
2. Read `memory/ops/reminders.md` — any overdue items?
3. Check `memory/inbox/` — how many unprocessed items?
4. Count orphan records: records in `memory/records/` not linked from any map
5. Check `memory/ops/observations/` — pending observations count
6. Check `memory/ops/tensions/` — pending tensions count
7. Check `memory/ops/queue/queue.json` if it exists — pending pipeline tasks

**Evaluate conditions in priority order:**

| Priority | Condition | Threshold | Suggested Action |
|----------|-----------|-----------|-----------------|
| session | Dangling links in records | Any | Run /review on affected records |
| session | Orphan records | Any | Run /connect on the orphan |
| session | Reminders overdue | Any | Address the reminder |
| session | Inbox items older than 3 days | Any | Run /document |
| multi_session | Pipeline tasks stalled | >2 sessions | Surface the batch |
| slow | Pending observations | >=10 | Run /retrospect |
| slow | Pending tensions | >=5 | Run /retrospect |
| slow | Goals not updated | Goals.md older than 3 sessions | Update goals |

**Output:**

```
Next Action: [specific command and target]
Reason: [why this is highest priority right now]

Also queued:
- [second priority if exists]
- [third priority if exists]
```

If nothing is queued and goals are current: suggest the next step from `self/goals.md`.
