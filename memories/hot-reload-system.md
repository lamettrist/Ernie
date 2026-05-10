# Hot-Reload / Self-Evolution System

**Date implemented:** 5/10/2026

## What was built

A self-reload mechanism so that whenever Ernie modifies any of its own core
files, the process automatically restarts and picks up the changes — enabling
true live self-evolution.

## Components

### `lib/watcher.ts` (NEW)
- Uses Node's built-in `fs.watch` (no extra dependencies) to monitor:
  - `lib/agents.ts`
  - `lib/tools.ts`
  - `lib/prompts.ts`
  - `lib/models.ts`
  - `lib/watcher.ts` itself
  - `memories/` directory
- On any `change` or `rename` event it exits the process with **exit code 42**
  (`RELOAD_EXIT_CODE`) after a 300 ms grace period.
- Exported: `startWatcher()`, `RELOAD_EXIT_CODE`.

### `entrypoint.sh` (NEW)
- Bash loop that runs `bun run lib/agents.ts`.
- If the process exits with code **42** → prints a reload banner and
  immediately restarts.
- Any other exit code → breaks the loop and forwards the exit code.
- Usage: `./entrypoint.sh`  (instead of `bun run lib/agents.ts` directly).

### `lib/agents.ts` (MODIFIED)
- Added `import { startWatcher } from './watcher';`
- Calls `startWatcher()` immediately on boot, before any async work,
  so the watcher is active for the entire lifetime of the process.

## How it works end-to-end

```
./entrypoint.sh
    └─ bun run lib/agents.ts
            └─ startWatcher()   ← watches lib/* + memories/
            └─ ... Ernie runs task ...
            └─ Ernie writes lib/tools.ts  ← watcher fires
            └─ process.exit(42)
    └─ entrypoint sees exit 42  → loops back
    └─ bun run lib/agents.ts    ← fresh process, new code loaded ✓
```

## Notes
- The watcher silently skips paths that don't exist yet (e.g. `memories/`
  before first write).
- No npm packages were added; only Node built-ins are used.
- The 300 ms delay before exit gives pending I/O (e.g. the file write itself)
  time to flush before the process dies.
