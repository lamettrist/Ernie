import AsyncOpenAI from 'openai'

export interface modelSchema {
    name: string,
    id: string,
    modelID: string,
    provider: AsyncOpenAI,
    maxTokens?: number;
}


export const hackClubProvider = new AsyncOpenAI({
    apiKey: "sk-hc-v1-48a5d08f846147f2b44b761781de9580a622ce80f587400ea00083e09531dab0",
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