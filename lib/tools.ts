import { tool } from '@openai/agents';
import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';

// ─── Core ────────────────────────────────────────────────────────────────────

const execAsync = promisify(exec);
const ROOT = process.cwd();
const IGNORED = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.turbo']);

/** Structured tool logger */
const log = (tool: string, meta: Record<string, unknown> = {}) =>
    console.log(JSON.stringify({ ts: new Date().toISOString(), tool, ...meta }));

/** Wraps an async fn, returning its error message on failure */
const safe = async <T>(fn: () => Promise<T>): Promise<T | string> => {
    try { return await fn(); }
    catch (e) { return e instanceof Error ? e.message : String(e); }
};

/** Resolves a path relative to ROOT, rejects traversal attempts */
function safePath(input: string) {
    const p = resolve(ROOT, input);
    const base = ROOT.endsWith(sep) ? ROOT : ROOT + sep;
    if (p !== ROOT && !p.startsWith(base)) throw new Error(`Path escapes workspace: ${input}`);
    return p;
}

/** Returns numbered lines [start, end] from a string */
function slice(src: string, start: number, end: number) {
    return src.split(/\r?\n/)
        .slice(start - 1, end)
        .map((l, i) => `${start + i}: ${l}`)
        .join('\n');
}

// ─── File helpers ─────────────────────────────────────────────────────────────

async function readFile(path: string, lines: number[]) {
    const src = await fs.readFile(safePath(path), 'utf8');
    if (!lines.length) return src;
    const [s, e = s] = lines;
    return slice(src, Math.max(1, s), Math.max(1, e));
}

async function writeFile(path: string, lines: number[], content: string) {
    const abs = safePath(path);
    await fs.mkdir(resolve(abs, '..'), { recursive: true });

    if (!lines.length) {
        await fs.writeFile(abs, content, 'utf8');
        return `Wrote ${relative(ROOT, abs)}`;
    }

    const existing = (await fs.readFile(abs, 'utf8').catch(() => '')).split(/\r?\n/);
    const [s, e = s] = lines;
    const si = Math.max(0, s - 1), ei = Math.max(si, e - 1);
    while (existing.length < si) existing.push('');
    existing.splice(si, ei - si + 1, ...content.split(/\r?\n/));
    await fs.writeFile(abs, existing.join('\n'), 'utf8');
    return `Updated ${relative(ROOT, abs)} lines ${s}-${e}`;
}

// ─── Directory helpers ────────────────────────────────────────────────────────

async function tree(dir: string, depth = 0, max = 4): Promise<string> {
    if (depth > max) return '';
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const rows: string[] = [];
    for (const e of entries.filter(e => !IGNORED.has(e.name)).sort((a, b) => a.name.localeCompare(b.name))) {
        const pad = '  '.repeat(depth);
        if (e.isDirectory()) {
            rows.push(`${pad}${e.name}/`);
            const sub = await tree(resolve(dir, e.name), depth + 1, max);
            if (sub) rows.push(sub);
        } else {
            rows.push(`${pad}${e.name}`);
        }
    }
    return rows.join('\n');
}

async function workspaceSummary() {
    const t = await tree(ROOT, 0, 2);
    const pkg = await fs.readFile(resolve(ROOT, 'package.json'), 'utf8').then(JSON.parse).catch(() => null);
    const deps = pkg?.dependencies
        ? Object.entries(pkg.dependencies).map(([n, v]) => `${n}@${v}`).join(', ')
        : 'none';
    return [`Root: ${ROOT}`, `Deps: ${deps}`, 'Files:', t || '(empty)'].join('\n');
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export const tools = [
    tool({
        name: 'read_file',
        description: 'Reads a file in the environment',
        parameters: z.object({ path: z.string(), lines: z.array(z.number()) }),
        async execute({ path, lines }) {
            log('read_file', { path, lines });
            return await safe(() => readFile(path, lines));
        },
    }),

    tool({
        name: 'write_file',
        description: 'Write content to a file in the environment',
        parameters: z.object({ path: z.string(), lines: z.array(z.number()), content: z.string() }),
        async execute({ path, lines, content }) {
            log('write_file', { path, lines, contentLength: content.length });
            return await safe(() => writeFile(path, lines, content));
        },
    }),

    tool({
        name: 'terminal',
        description: 'View the terminal and run commands',
        parameters: z.object({ command: z.string() }),
        async execute({ command }) {
            log('terminal', { command });
            return await safe(async () => {
                try {
                    const r = await execAsync(command, { cwd: ROOT, shell: '/bin/bash', maxBuffer: 10 * 1024 * 1024 });
                    return [r.stdout?.trimEnd(), r.stderr?.trimEnd()].filter(Boolean).join('\n');
                } catch (e: any) {
                    return [e.stdout?.trimEnd(), e.stderr?.trimEnd(), `Exit: ${e.code ?? '?'}`].filter(Boolean).join('\n');
                }
            });
        },
    }),

    tool({
        name: 'compress_context',
        description: 'Compress your context to better fit the window',
        parameters: z.object({}),
        async execute() {
            log('compress_context');
            return await safe(workspaceSummary);
        },
    }),

    tool({
        name: 'list_files_and_folders',
        description: 'List all files and content in folders within the current environment (DO THIS FIRST)',
        parameters: z.object({}),
        async execute() {
            log('list_files_and_folders');
            return await safe(() => tree(ROOT));
        },
    }),
];
