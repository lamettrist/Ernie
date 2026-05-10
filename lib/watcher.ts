/**
 * watcher.ts
 * Watches core Ernie files for changes and triggers a process reload
 * when any of them are modified. A reload is achieved by exiting with
 * the special code RELOAD_EXIT_CODE (42), which the outer entrypoint
 * shell loop interprets as "restart immediately".
 */

import { watch } from 'node:fs';
import { resolve } from 'node:path';

export const RELOAD_EXIT_CODE = 42;

// Files / directories to watch for hot-reload
const WATCHED = [
    'lib/agents.ts',
    'lib/tools.ts',
    'lib/prompts.ts',
    'lib/models.ts',
    'lib/watcher.ts',
    'memories',
];

const ROOT = process.cwd();

let reloadScheduled = false;

/**
 * Starts the file watcher. When a watched path changes the process exits
 * with RELOAD_EXIT_CODE so the entrypoint loop can restart it.
 */
export function startWatcher() {
    for (const rel of WATCHED) {
        const abs = resolve(ROOT, rel);
        try {
            watch(abs, { recursive: true }, (event, filename) => {
                if (reloadScheduled) return;
                reloadScheduled = true;
                console.log(
                    `\n[watcher] Detected ${event} on ${filename ?? rel} — scheduling reload…`
                );
                // Give any pending async work a moment to finish, then exit.
                setTimeout(() => {
                    console.log('[watcher] Reloading now (exit code 42).');
                    process.exit(RELOAD_EXIT_CODE);
                }, 300);
            });
        } catch {
            // Path may not exist yet (e.g. memories/ before first write) — ignore.
        }
    }
    console.log('[watcher] Hot-reload active. Watching:', WATCHED.join(', '));
}
