# Node + C++ bridge for Ernie

This example shows a tiny C++ program that can be spawned from Node.js.

## Build

```bash
g++ -std=c++17 -O2 -o node_cpp_bridge examples/node_cpp_bridge.cpp
```

## Use from Node.js

```ts
import { spawn } from 'node:child_process';

const child = spawn('./node_cpp_bridge', [], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let out = '';
child.stdout.on('data', (chunk) => out += chunk.toString());
child.on('close', () => {
  console.log('C++ said:', out);
});

child.stdin.write(JSON.stringify({ prompt: 'Yo Ernie' }) + '\n');
child.stdin.end();
```

## Notes

- This C++ file is intentionally simple and safe.
- If you want it to actually talk to Ernie/OpenAI, the usual pattern is:
  1. Node calls your C++ binary
  2. C++ returns structured data
  3. Node forwards that data to your Ernie agent
