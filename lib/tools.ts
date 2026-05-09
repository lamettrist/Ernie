import { Agent, tool } from '@openai/agents';
import { z } from 'zod';
export const tools = [
    tool({
        name: 'read_file',
        description: "Reads a file in the environment",
        parameters: z.object({
            path: z.string(),
            lines: z.array(z.number()),
        }),
        async execute({ path, lines }) {
            console.log(`Data passed: ${path}, ${lines}`);
            return 'This file does not exist.'
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
            console.log(`Data passed: ${path}, ${lines}\n\n${content}`);
            return 'This file does not exist.'
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
            return 'Not implemented yet.'
        },
    }),
    tool({
        name: 'compress_context',
        description: 'Compress your context to better fit the window',
        parameters: z.object(),
        async execute() {
            return 'Compressed'
        },
    }),
    tool({
        name: 'list_files_and_folders',
        description: 'List all files and content in folders within the current environment (DO THIS FIRST)',
        parameters: z.object({}),
        async execute() {
            console.log("Executed list all files and folders")
            return "Nothing in the current environment."
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