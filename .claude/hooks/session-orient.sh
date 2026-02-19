#!/bin/bash
# session-orient.sh — runs at session start to surface context and maintenance triggers

VAULT="memory"
GOALS="$VAULT/self/goals.md"
REMINDERS="$VAULT/ops/reminders.md"
OBSERVATIONS="$VAULT/ops/observations"
TENSIONS="$VAULT/ops/tensions"

# Count pending observations
OBS_COUNT=0
if [ -d "$OBSERVATIONS" ]; then
  OBS_COUNT=$(grep -rl '^status: pending' "$OBSERVATIONS" 2>/dev/null | wc -l | tr -d ' ')
fi

# Count pending tensions
TENSION_COUNT=0
if [ -d "$TENSIONS" ]; then
  TENSION_COUNT=$(grep -rl '^status: pending' "$TENSIONS" 2>/dev/null | wc -l | tr -d ' ')
fi

# Count inbox items
INBOX_COUNT=0
if [ -d "$VAULT/inbox" ]; then
  INBOX_COUNT=$(ls "$VAULT/inbox"/*.md 2>/dev/null | wc -l | tr -d ' ')
fi

# Output orientation summary if there's anything to surface
if [ "$OBS_COUNT" -ge 10 ] || [ "$TENSION_COUNT" -ge 5 ] || [ "$INBOX_COUNT" -ge 3 ]; then
  echo ""
  echo "Memory system: attention needed"
  [ "$INBOX_COUNT" -ge 3 ] && echo "  inbox: $INBOX_COUNT items pending → /document"
  [ "$OBS_COUNT" -ge 10 ] && echo "  observations: $OBS_COUNT pending → /retrospect"
  [ "$TENSION_COUNT" -ge 5 ] && echo "  tensions: $TENSION_COUNT pending → /retrospect"
  echo ""
fi
