import { ChatOpenAI } from '@langchain/openai';

const getOllamaConfig = () => {
  const ollamaUrl = process.env.OLLAMA_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;

  if (!ollamaUrl) {
    throw new Error('OLLAMA_URL environment variable is not set');
  }

  if (!ollamaModel) {
    throw new Error('OLLAMA_MODEL environment variable is not set');
  }

  return { ollamaUrl, ollamaModel };
};

export const createOllamaClient = (temperature: number, maxTokens: number) => {
  const { ollamaUrl, ollamaModel } = getOllamaConfig();

  return new ChatOpenAI({
    model: ollamaModel,
    temperature,
    maxTokens,
    apiKey: 'ollama',
    configuration: {
      baseURL: ollamaUrl,
    },
  });
};
