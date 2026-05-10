/*
    World Agents in Ernie are those that endure through the world state, unlike John.
*/
import { Agent, OpenAIResponsesModel, RunConfig, Runner } from '@openai/agents';
import {models, modelSchema} from './models'
import { tools } from './tools';
import { SYSTEM_PROMPT } from './prompts';
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
                    effort: 'medium',
                    summary: 'detailed' // This forces the summary to exist so Ernie doesn't crash
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
        });
        this.lastResponseId = result.lastResponseId;
        return result.finalOutput;
    }
}

const john = new WorldAgent(models[1], SYSTEM_PROMPT);
console.log(await john.run('Hi Ernie! Could you tell me if you are a novel platform? Try doing a search.'))
