import AsyncOpenAI from 'openai'
import 'dotenv/config';

export interface modelSchema {
    name: string,
    id: string,
    modelID: string,
    provider: AsyncOpenAI,
    maxTokens?: number;
}


export const hackClubProvider = new AsyncOpenAI({
    apiKey: process.env.HACKCLUB_KEY,
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