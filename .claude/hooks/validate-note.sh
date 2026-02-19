#!/bin/bash
# validate-note.sh — validates records written to memory/records/ on PostToolUse Write

# Only validate files in the memory/records/ directory
FILE="$1"
if [ -z "$FILE" ]; then exit 0; fi
if [[ "$FILE" != memory/records/*.md ]]; then exit 0; fi
if [ ! -f "$FILE" ]; then exit 0; fi

ISSUES=()

# Check for description field
if ! grep -q '^description:' "$FILE"; then
  ISSUES+=("missing description field")
fi

# Check description is not empty
DESC=$(grep '^description:' "$FILE" | head -1 | sed 's/^description: //')
if [ -z "$DESC" ] || [ "$DESC" = '""' ] || [ "$DESC" = "''" ]; then
  ISSUES+=("description is empty")
fi

# Check for type field with valid value
if grep -q '^type:' "$FILE"; then
  TYPE=$(grep '^type:' "$FILE" | head -1 | sed 's/^type: //')
  if ! echo "$TYPE" | grep -qE '^(decision|change|pattern|map|question|tension)$'; then
    ISSUES+=("invalid type value: $TYPE")
  fi
fi

# Report issues
if [ ${#ISSUES[@]} -gt 0 ]; then
  echo "Memory schema warning in $FILE:"
  for issue in "${ISSUES[@]}"; do
    echo "  - $issue"
  done
fi

exit 0  # Non-blocking — warn but don't prevent write
