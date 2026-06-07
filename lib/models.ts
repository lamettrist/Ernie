import AsyncOpenAI from 'openai'
import {config} from 'dotenv'
config();

export interface modelSchema {
    name: string,
    id: string,
    modelID: string,
    provider: AsyncOpenAI,
    maxTokens?: number;
}


export const hackClubProvider = new AsyncOpenAI({
    apiKey: "sk-hc-v1-f6372b9afd404efbae45a0f3f39b17bb3d97a9e56cb04bb9a2ed67b831342c09", // Replace this
    baseURL: "https://ai.hackclub.com/proxy/v1",
})

export const models: modelSchema[] = [
    {
      'name': 'Ernie-Large',
      'id': 'large',
      'modelID': '~anthropic/claude-opus-latest',
      'provider': hackClubProvider,
    },
    {
        'name': 'Ernie-Medium',
        'id': 'medium',
        'modelID': '~openai/gpt-mini-latest',
        'provider': hackClubProvider,
    },
    {
        'name': 'Ernie-Small',
        'id': 'small',
        'modelID': '~anthropic/claude-haiku-latest',
        'provider': hackClubProvider,
    },
]