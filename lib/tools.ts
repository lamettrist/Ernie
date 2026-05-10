import { tool } from '@openai/agents';
import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';

const execAsync = promisify(exec);
const workspaceRoot = process.cwd();

function resolveWorkspacePath(inputPath: string) {
    const resolvedPath = resolve(workspaceRoot, inputPath);
    const normalizedRoot = workspaceRoot.endsWith(sep) ? workspaceRoot : `${workspaceRoot}${sep}`;

    if (resolvedPath !== workspaceRoot && !resolvedPath.startsWith(normalizedRoot)) {
        throw new Error(`Path escapes the workspace root: ${inputPath}`);
    }

    return resolvedPath;
}

function formatLines(contents: string, startLine: number, endLine: number) {
    const allLines = contents.split(/\r?\n/);
    const safeStart = Math.max(1, startLine);
    const safeEnd = Math.max(safeStart, endLine);

    return allLines
        .slice(safeStart - 1, safeEnd)
        .map((line, index) => `${safeStart + index}: ${line}`)
        .join('\n');
}

async function readWorkspaceFile(path: string, lines: number[]) {
    const filePath = resolveWorkspacePath(path);
    const contents = await fs.readFile(filePath, 'utf8');

    if (lines.length === 0) {
        return contents;
    }

    const [startLine, endLine = startLine] = lines;
    return formatLines(contents, startLine, endLine);
}

async function writeWorkspaceFile(path: string, lines: number[], content: string) {
    const filePath = resolveWorkspacePath(path);

    if (lines.length === 0) {
        await fs.mkdir(resolve(filePath, '..'), { recursive: true });
        await fs.writeFile(filePath, content, 'utf8');
        return `Wrote ${relative(workspaceRoot, filePath)}`;
    }

    const existingContents = await fs.readFile(filePath, 'utf8').catch(() => '');
    const existingLines = existingContents.length > 0 ? existingContents.split(/\r?\n/) : [];
    const [startLine, endLine = startLine] = lines;
    const startIndex = Math.max(0, startLine - 1);
    const endIndex = Math.max(startIndex, endLine - 1);

    while (existingLines.length < startIndex) {
        existingLines.push('');
    }

    const replacementLines = content.split(/\r?\n/);
    existingLines.splice(startIndex, endIndex - startIndex + 1, ...replacementLines);

    await fs.mkdir(resolve(filePath, '..'), { recursive: true });
    await fs.writeFile(filePath, existingLines.join('\n'), 'utf8');

    return `Updated ${relative(workspaceRoot, filePath)} lines ${startLine}-${endLine}`;
}

async function listWorkspaceTree(directoryPath: string, depth = 0, maxDepth = 4): Promise<string> {
    if (depth > maxDepth) {
        return '';
    }

    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const ignored = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.turbo']);
    const visibleEntries = entries
        .filter((entry) => !ignored.has(entry.name))
        .sort((left, right) => left.name.localeCompare(right.name));

    const lines: string[] = [];

    for (const entry of visibleEntries) {
        const prefix = '  '.repeat(depth);
        if (entry.isDirectory()) {
            lines.push(`${prefix}${entry.name}/`);
            const childTree = await listWorkspaceTree(resolve(directoryPath, entry.name), depth + 1, maxDepth);
            if (childTree) {
                lines.push(childTree);
            }
        } else {
            lines.push(`${prefix}${entry.name}`);
        }
    }

    return lines.join('\n');
}

async function summarizeWorkspace() {
    const tree = await listWorkspaceTree(workspaceRoot, 0, 2);
    const packageJsonPath = resolve(workspaceRoot, 'package.json');
    const packageJson = await fs.readFile(packageJsonPath, 'utf8').then((text) => JSON.parse(text)).catch(() => undefined);

    const dependencySummary = packageJson?.dependencies
        ? Object.entries(packageJson.dependencies)
            .map(([name, version]) => `${name}@${version}`)
            .join(', ')
        : 'No package.json dependencies found.';

    return [
        `Workspace root: ${workspaceRoot}`,
        `Dependencies: ${dependencySummary}`,
        'Files:',
        tree || '(empty)',
    ].join('\n');
}
export const tools = [
    tool({
        name: 'read_file',
        description: "Reads a file in the environment",
        parameters: z.object({
            path: z.string(),
            lines: z.array(z.number()),
        }),
        async execute({ path, lines }) {
            try {
                return await readWorkspaceFile(path, lines);
            } catch (error) {
                return error instanceof Error ? error.message : String(error);
            }
        },
    }),
    tool({
        name: 'write_file',
        description: "Write content to a file in the environment",
        parameters: z.object({
            path: z.string(),
            lines: z.array(z.number()),
            content: z.string()
        }),
        async execute({ path, lines, content }) {
            console.log(`Data passed: ${path}, lines: ${lines}, content length: ${content.length}`);
            try {
                return await writeWorkspaceFile(path, lines, content);
            } catch (error) {
                return error instanceof Error ? error.message : String(error);
            }
        },
    }),
    tool({
        name: 'terminal',
        description: "View the terminal and run commands",
        parameters: z.object({
            command: z.string(),
        }),
        async execute({ command }) {
            console.log(`Data passed: ${command}`);
            try {
                const result = await execAsync(command, {
                    cwd: workspaceRoot,
                    shell: '/bin/bash',
                    maxBuffer: 10 * 1024 * 1024,
                });

                return [
                    result.stdout?.trimEnd() || '',
                    result.stderr?.trimEnd() || '',
                ].filter(Boolean).join('\n');
            } catch (error) {
                if (error && typeof error === 'object' && 'stdout' in error && 'stderr' in error) {
                    const execError = error as { stdout?: string; stderr?: string; code?: number | string };
                    return [
                        execError.stdout?.trimEnd() || '',
                        execError.stderr?.trimEnd() || '',
                        `Command failed with code: ${execError.code ?? 'unknown'}`,
                    ].filter(Boolean).join('\n');
                }

                return error instanceof Error ? error.message : String(error);
            }
        },
    }),
    tool({
        name: 'compress_context',
        description: 'Compress your context to better fit the window',
        parameters: z.object(),
        async execute() {
            return summarizeWorkspace();
        },
    }),
    tool({
        name: 'list_files_and_folders',
        description: 'List all files and content in folders within the current environment (DO THIS FIRST)',
        parameters: z.object({}),
        async execute() {
            console.log('Listing files and folders in workspace');
            try {
                return await listWorkspaceTree(workspaceRoot);
            } catch (error) {
                return error instanceof Error ? error.message : String(error);
            }
        },
    }),
]

/* {
        "type": "function",
        "name": "read_file",
        "description": "Reads a file",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The filepath to read the file in the current environment",
                },
                "lines": {
                    "type": "number",
                    "description": "The specific lines that will be read in the file"
                }
            },
            "required": ["path"],
        },
    },
    {
        "type": "function",
        "name": "write_file",
        "description": "Write content to a file",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The path to write to in curent environment",
                },
                "content": {
                    "type": "string",
                    "description": "The content you are trying to write to the file",
                },
                "lines": {
                    "type": "string",
                    "description": "The lines to specifically overwrite within a file"
                }
            },
            "required": ["path", "content"],
        },
    },
{
        "type": "function",
        "name": "compress_context",
        "description": "Compresses your context window (and all interactions) so you can continue your objectives.",
        "parameters": {
            "type": "object",
            "properties": {                
            },
            "required": [],
        },
    },
*/