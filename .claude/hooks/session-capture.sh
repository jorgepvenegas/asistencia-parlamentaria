#!/bin/bash
# session-capture.sh — runs at session end via Stop hook to persist session state

VAULT="memory"
SESSIONS_DIR="$VAULT/ops/sessions"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
SESSION_FILE="$SESSIONS_DIR/${TIMESTAMP}.md"

mkdir -p "$SESSIONS_DIR"

# Write a minimal session record
cat > "$SESSION_FILE" << EOF
---
created: $(date +"%Y-%m-%d")
timestamp: $TIMESTAMP
mined: false
---

# session $TIMESTAMP

Session ended. Review memory/self/goals.md for current state.

Inbox: $(ls "$VAULT/inbox"/*.md 2>/dev/null | wc -l | tr -d ' ') items
Records: $(ls "$VAULT/records"/*.md 2>/dev/null | wc -l | tr -d ' ') total
EOF
