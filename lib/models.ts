import AsyncOpenAI from 'openai'

export interface modelSchema {
    name: string,
    id: string,
    modelID: string,
    provider: AsyncOpenAI,
    maxTokens?: number;
}

const digitalOceanProvider = new AsyncOpenAI({
    apiKey:  process?.env.DIGITALOCEAN_KEY,
    baseURL: 'https://inference.do-ai.run/v1',
})

export const hackClubProvider = new AsyncOpenAI({
    apiKey: process?.env.HACKCLUB_KEY,
    baseURL: "https://ai.hackclub.com/proxy/v1",
})

export const models: modelSchema[] = [
    {
      'name': 'large',
      'id': 'large',
      'modelID': 'moonshotai/kimi-k2.6',
      'provider': hackClubProvider,
    },
    {
        'name': 'Ernie-Medium',
        'id': 'medium',
        'modelID': '~anthropic/claude-sonnet-latest',
        'provider': hackClubProvider,
    },
]

export const getModelById = (id: string): modelSchema | undefined => {
    return models.find(model => model.id === id);
}

export const getAvailableModelIds = (): string[] => {
    return models.map(model => model.id);
}