#!/usr/bin/env bun
/**
 * Ernie CLI  –  interactive REPL for chatting with Ernie
 *
 * Usage:
 *   bun run cli          (via package.json script)
 *   ./cli.sh             (via shell launcher)
 *   bun run lib/cli.ts   (directly)
 *
 * Special commands (type at the prompt):
 *   /exit   or   /quit   – end the session
 *   /clear               – start a fresh conversation (clears history)
 *   /model <id>          – switch to a different model at runtime
 *   /models              – list available model IDs
 *   /help                – show this help text
 */

import * as readline from 'node:readline/promises';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { WorldAgent } from './agents';
import { models, getAvailableModelIds, getModelById } from './models';
import { SYSTEM_PROMPT } from './prompts';
import { consumeReloadRequest, isReloadRequested, RELOAD_EXIT_CODE } from './watcher';

// ── ANSI colour helpers ───────────────────────────────────────────────────────
const c = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    cyan:   '\x1b[36m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
    magenta:'\x1b[35m',
    blue:   '\x1b[34m',
};
const paint = (colour: string, text: string) => `${colour}${text}${c.reset}`;
const SESSION_STATE_PATH = resolve(process.cwd(), 'memories/session/cli-state.json');

type SessionState = {
    modelId?: string;
    lastResponseId?: string;
};

async function loadSessionState(): Promise<SessionState> {
    try {
        const raw = await fs.readFile(SESSION_STATE_PATH, 'utf8');
        const parsed = JSON.parse(raw) as SessionState;
        return {
            modelId: parsed.modelId,
            lastResponseId: parsed.lastResponseId,
        };
    } catch {
        return {};
    }
}

async function saveSessionState(state: SessionState) {
    await fs.mkdir(resolve(SESSION_STATE_PATH, '..'), { recursive: true });
    await fs.writeFile(SESSION_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// ── Banner ────────────────────────────────────────────────────────────────────
function printBanner() {
    console.log();
    console.log(paint(c.cyan + c.bold, '╔══════════════════════════════════════╗'));
    console.log(paint(c.cyan + c.bold, '║         Welcome to Ernie CLI         ║'));
    console.log(paint(c.cyan + c.bold, '║       Powered by the Sunol Platform  ║'));
    console.log(paint(c.cyan + c.bold, '╚══════════════════════════════════════╝'));
    console.log();
    console.log(paint(c.dim, `  Type ${paint(c.yellow, '/help')} for available commands.`));
    console.log(paint(c.dim, `  Type ${paint(c.yellow, '/exit')} or ${paint(c.yellow, '/quit')} to leave.`));
    console.log();
}

// ── Help text ────────────────────────────────────────────────────────────────
function printHelp() {
    console.log();
    console.log(paint(c.bold, 'Available commands:'));
    console.log(`  ${paint(c.yellow, '/exit')} / ${paint(c.yellow, '/quit')}   – End the session`);
    console.log(`  ${paint(c.yellow, '/clear')}           – Start a fresh conversation`);
    console.log(`  ${paint(c.yellow, '/model')} ${paint(c.dim, '<id>')}    – Switch model (e.g. /model large)`);
    console.log(`  ${paint(c.yellow, '/models')}          – List available model IDs`);
    console.log(`  ${paint(c.yellow, '/help')}            – Show this help text`);
    console.log();
    console.log(paint(c.dim, '  Anything else is sent to Ernie as a message.'));
    console.log();
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    printBanner();

    // Default to the medium / "Ernie" model (index 1)
    const savedState = await loadSessionState();
    let currentModel = getModelById(savedState.modelId ?? '') ?? models[1] ?? models[0];
    let agent = new WorldAgent(currentModel, SYSTEM_PROMPT, savedState.lastResponseId);

    const persistState = async () => {
        await saveSessionState({
            modelId: currentModel.id,
            lastResponseId: agent.lastResponseId,
        });
    };

    console.log(paint(c.green, `  Model: ${currentModel.name} (${currentModel.id})`));
    console.log();

    const rl = readline.createInterface({ input, output, terminal: true });

    // Graceful SIGINT (Ctrl-C)
    rl.on('SIGINT', () => {
        console.log('\n' + paint(c.dim, '  (Use /exit to quit gracefully)'));
        // Re-display the prompt after the notice
        rl.write('', { ctrl: true, name: 'u' }); // clear current line
    });

    while (true) {
        let userInput: string;
        try {
            userInput = await rl.question(paint(c.blue + c.bold, 'You › ') + ' ');
        } catch {
            // EOF / stream closed
            break;
        }

        const trimmed = userInput.trim();
        if (!trimmed) continue;

        // ── Special commands ────────────────────────────────────────────────
        if (trimmed === '/exit' || trimmed === '/quit') {
            console.log('\n' + paint(c.cyan, '  Goodbye! 👋') + '\n');
            break;
        }

        if (trimmed === '/clear') {
            agent = new WorldAgent(currentModel, SYSTEM_PROMPT);
            await persistState();
            console.log('\n' + paint(c.green, '  ✓ Conversation cleared. Fresh start!\n'));
            continue;
        }

        if (trimmed === '/help') {
            printHelp();
            continue;
        }

        if (trimmed === '/models') {
            const ids = getAvailableModelIds();
            console.log();
            console.log(paint(c.bold, '  Available models:'));
            for (const id of ids) {
                const m = getModelById(id)!;
                const marker = id === currentModel.id ? paint(c.green, ' ◀ current') : '';
                console.log(`    ${paint(c.yellow, id)}  –  ${m.name}${marker}`);
            }
            console.log();
            continue;
        }

        if (trimmed.startsWith('/model ')) {
            const id = trimmed.slice(7).trim();
            const m = getModelById(id);
            if (!m) {
                console.log('\n' + paint(c.red, `  ✗ Unknown model: "${id}". Run /models to see options.\n`));
            } else {
                currentModel = m;
                agent = new WorldAgent(currentModel, SYSTEM_PROMPT);
                await persistState();
                console.log('\n' + paint(c.green, `  ✓ Switched to model: ${m.name} (${m.id})\n`));
            }
            continue;
        }

        if (trimmed.startsWith('/')) {
            console.log('\n' + paint(c.red, `  ✗ Unknown command: "${trimmed}". Try /help.\n`));
            continue;
        }

        // ── Send to Ernie ───────────────────────────────────────────────────
        console.log();
        process.stdout.write(paint(c.magenta + c.bold, 'Ernie › ') + ' ');

        try {
            const reply = await agent.run(trimmed);
            await persistState();
            // Clear the "Ernie › " prefix line and print cleanly
            process.stdout.write('\r\x1b[K'); // carriage-return + erase line
            console.log(paint(c.magenta + c.bold, 'Ernie › ') + ' ' + (reply ?? '(no response)'));
        } catch (err) {
            process.stdout.write('\r\x1b[K');
            const msg = err instanceof Error ? err.message : String(err);
            console.log(paint(c.red, `  ✗ Error: ${msg}`));
        }

        console.log();

        if (consumeReloadRequest() || isReloadRequested()) {
            await persistState();
            console.log(paint(c.dim, `  Hot reload requested. Restarting with preserved session state (exit ${RELOAD_EXIT_CODE}).`));
            rl.close();
            process.exit(RELOAD_EXIT_CODE);
        }
    }

    rl.close();
    process.exit(0);
}

main();
