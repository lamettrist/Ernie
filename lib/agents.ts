/*
    World Agents in Ernie are those that endure through the world state, unlike John from Brave New World.
*/
import { Agent, OpenAIResponsesModel, RunConfig, Runner } from '@openai/agents';
import {modelSchema} from './models'
import { tools } from './tools';
import { SYSTEM_PROMPT } from './prompts';
export class WorldAgent {
    // State Information
    model: modelSchema;
    agent: Agent;
    lastResponseId?: string;

    // Constructor
    constructor(model: modelSchema, instructions: string = SYSTEM_PROMPT) {
        this.model = model;
        this.agent = new Agent({
            'name': model.name,
            'instructions': instructions,
            'model': new OpenAIResponsesModel(model.provider, model.modelID),
            'tools': tools,
            // modelSettings: {
            //     reasoning: {
            //         effort: 'none',
            //         summary: 'detailed' 
            //     }
            // },
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