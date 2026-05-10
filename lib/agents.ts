/*
    World Agents in Ernie are those that endure through the world state, unlike John.
*/
import { Agent, OpenAIResponsesModel, Runner } from '@openai/agents';
import { models, modelSchema } from './models'
import { tools } from './tools';
import { SYSTEM_PROMPT } from './prompts';
import { startWatcher } from './watcher';

// ── Boot the hot-reload file watcher ─────────────────────────────────────────
// This must happen before any await so the watcher is live for the entire run.
startWatcher();

export class WorldAgent {
    // State Information
    model: modelSchema;
    agent: Agent;
    lastResponseId?: string;

    // Constructor
    constructor(model: modelSchema, instructions: string, lastResponseId?: string) {
        this.model = model;
        this.lastResponseId = lastResponseId;
        this.agent = new Agent({
            'name': model.name,
            'instructions': instructions,
            'model': new OpenAIResponsesModel(model.provider, model.modelID),
            'tools': tools,
            modelSettings: {
                reasoning: {
                    effort: 'medium',
                    summary: 'auto',
                }
            },
        })
    }

    async run(task: string) {
        console.log(`[${this.model.name}] Starting Task: ${task}`);
        const result = await new Runner({
        }).run(this.agent, task, {
            'previousResponseId': this.lastResponseId,
            'maxTurns': 1000,
        });
        this.lastResponseId = result.lastResponseId;
        return result.finalOutput;
    }
}

// ── Standalone entry-point (bun run lib/agents.ts) ────────────────────────────
// Only runs when this file is executed directly, not when imported by cli.ts.
const isMain = process.argv[1]?.endsWith('/lib/agents.ts') || process.argv[1]?.endsWith('\\lib\\agents.ts');
if (isMain) {
    const john = new WorldAgent(models[1], SYSTEM_PROMPT);
    console.log(await john.run('Hi! What can you do?'));
}
