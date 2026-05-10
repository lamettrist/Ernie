#!/usr/bin/env bash
# entrypoint.sh
# Runs Ernie (lib/agents.ts) and automatically restarts it whenever
# it exits with the special reload code 42 (RELOAD_EXIT_CODE).
# Any other exit code breaks the loop.

RELOAD_CODE=42

echo "[entrypoint] Starting Ernie…"

while true; do
    bun run lib/agents.ts
    EXIT_CODE=$?

    if [ "$EXIT_CODE" -eq "$RELOAD_CODE" ]; then
        echo ""
        echo "[entrypoint] ↺  Reload triggered (exit $RELOAD_CODE). Restarting Ernie…"
        echo ""
        sleep 0.2
    else
        echo "[entrypoint] Ernie exited with code $EXIT_CODE. Stopping."
        exit $EXIT_CODE
    fi
done
