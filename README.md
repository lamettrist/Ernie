# Ernie

<i>Augmented LLM-derived agents with unrestricted access to the tools necessary to interact with the world.</i>

## What is this?

Ernie is an agent platform that wraps OpenAI-compatible models with a tool-using runtime and a very small CLI bridge.

The current CLI flow is:

1. A C++ binary writes a request JSON file.
2. The binary launches exactly one JavaScript file with Bun.
3. The JavaScript bridge creates a `WorldAgent` and runs the prompt.
4. The agent can use tools like file reads/writes, terminal commands, directory listing, and context compression.
5. The bridge writes a response JSON file.
6. The C++ binary prints the response.

## Requirements

- Bun
- A valid API key for the model provider configured in `lib/models.ts`
- A C++17 compiler such as `g++`

## Project layout

- `cli.cpp` — C++ CLI wrapper
- `ernie-bridge.js` — Bun entrypoint used by the CLI
- `lib/agents.ts` — `WorldAgent` wrapper around `@openai/agents`
- `lib/tools.ts` — tools exposed to the agent
- `lib/models.ts` — model definitions
- `lib/prompts.ts` — system prompt
- `dist/` — build output

## Available models

The CLI currently supports the model IDs defined in `lib/models.ts`:

- `large` → `Ernie-Large`
- `medium` → `Ernie-Medium`
- `small` → `Ernie-Small`

If no model is passed, the CLI defaults to `medium`.

## Build

```bash
npm run build
```

This runs:

- `bun build ./ernie-bridge.js --outfile ./dist/ernie-bridge.js`
- `g++ -std=c++17 -O2 -o ./dist/ernie-cli ./cli.cpp`

## Run the CLI

From the repo root:

```bash
./dist/ernie-cli ./ernie-bridge.js "Hello Ernie"
```

Optional model selection:

```bash
./dist/ernie-cli ./ernie-bridge.js "Hello Ernie" small
```

You can also point the binary at the bundled JavaScript artifact if you built it and want to use that instead:

```bash
./dist/ernie-cli ./dist/ernie-bridge.js "Hello Ernie"
```

## Request / response format

The C++ binary passes a JSON request to the JS bridge with these fields:

- `prompt`
- `model`
- `cwd`
- `responsePath`
- `requestPath`

The JS bridge returns JSON shaped like:

```json
{
  "ok": true,
  "model": "Ernie-Medium",
  "prompt": "Hello Ernie",
  "output": "...",
  "cwd": "/path/to/repo"
}
```

## Tools available to the agent

The agent can use these tools from `lib/tools.ts`:

- `list_files_and_folders` — inspect the workspace tree
- `read_file` — read files, optionally by line range
- `write_file` — create or update files
- `terminal` — run shell commands in the workspace
- `compress_context` — summarize the workspace state

## Notes

- The C++ binary only ever launches one JavaScript file.
- The JavaScript bridge instantiates `WorldAgent` and runs the prompt.
- The agent is expected to inspect the workspace first, then use tools as needed.
- If you want to extend the CLI, update the JS bridge or the C++ wrapper separately.
