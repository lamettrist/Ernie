/*
    World Agents in Ernie are those that endure through the world state, unlike John.
*/
import { Agent, OpenAIResponsesModel, RunConfig, Runner } from '@openai/agents';
import {models, modelSchema} from './models'
import { tools } from './tools';
import { SYSTEM_PROMPT } from './prompts';
import { startWatcher } from './watcher';

// ── Boot the hot-reload file watcher ─────────────────────────────────────────
// This must happen before any await so the watcher is live for the entire run.
startWatcher();

class WorldAgent {
    // State Information
    model: modelSchema;
    agent: Agent;
    lastResponseId?: string;

    // Constructor
    constructor(model: modelSchema, instructions: string) {
        this.model = model;
        this.agent = new Agent({
            'name': model.name,
            'instructions': instructions,
            'model': new OpenAIResponsesModel(model.provider, model.modelID),
            'tools': tools,
            modelSettings: {
                reasoning: {
                    effort: 'none',
                    summary: 'auto',                
                }
            },
        })
    }

    async run(task: string) {
        console.log(`[${this.model.name}] Starting Task: ${task}`);
        const result = await new Runner({
            'traceIncludeSensitiveData': true,
        }).run(this.agent, task, {
            'previousResponseId': this.lastResponseId,
            'maxTurns': 1000,
        });
        this.lastResponseId = result.lastResponseId;
        return result.finalOutput;
    }
}

const john = new WorldAgent(models[1], SYSTEM_PROMPT);
console.log(await john.run('Hi Ernie! This is a pretty weird task for you, but can you make it so if you modify any file related to you, you basically reload? So you can evolve on your own? This would be really helpful for you to be able to get better over time!'))
