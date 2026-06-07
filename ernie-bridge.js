#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'node:fs';
import { WorldAgent } from './lib/agents.ts';
import { models } from './lib/models.ts';

const requestPath = process.argv[2];
if (!requestPath) {
  console.error('Usage: ernie-bridge.js <request.json>');
  process.exit(1);
}

const req = JSON.parse(readFileSync(requestPath, 'utf8'));
const prompt = String(req.prompt ?? '');
const modelId = String(req.model ?? 'medium');
const model = models.find(m => m.id === modelId) ?? models[1];

const agent = new WorldAgent(model);
const output = await agent.run(prompt);

const reply = {
  ok: true,
  model: model.name,
  prompt,
  output,
  cwd: req.cwd,
};

writeFileSync(req.responsePath, JSON.stringify(reply, null, 2) + '\n');