#!/bin/bash
# Cloud sessions only: install npm dependencies when a session starts (hook in .claude/settings.json). Does nothing on your own machine.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ node_modules/.package-lock.json -nt package-lock.json ] && exit 0
npm ci --no-audit --no-fund --loglevel=error || npm install --no-audit --no-fund --loglevel=error
exit 0
