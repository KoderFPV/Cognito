import { ChatOpenAI } from '@langchain/openai';

const getVllmConfig = () => {
  const vllmQwen3VlUrl = process.env.VLLM_QWEN3_VL_URL;
  const vllmQwen3Url = process.env.VLLM_QWEN3_URL;
  const vllmApiKey = process.env.VLLM_API_KEY;

  if (!vllmQwen3VlUrl) {
    throw new Error('VLLM_QWEN3_VL_URL environment variable is not set');
  }

  if (!vllmQwen3Url) {
    throw new Error('VLLM_QWEN3_URL environment variable is not set');
  }

  if (!vllmApiKey) {
    throw new Error('VLLM_API_KEY environment variable is not set');
  }

  return { vllmQwen3VlUrl, vllmQwen3Url, vllmApiKey };
};

export const createQwen3VLClient = (temperature: number, maxTokens: number) => {
  const { vllmQwen3VlUrl, vllmApiKey } = getVllmConfig();

  return new ChatOpenAI({
    model: 'Qwen/Qwen3-VL-8B-Instruct-FP8',
    temperature,
    maxTokens,
    apiKey: vllmApiKey,
    configuration: {
      baseURL: vllmQwen3VlUrl,
    },
  });
};

export const createQwen3Client = (temperature: number, maxTokens: number) => {
  const { vllmQwen3Url, vllmApiKey } = getVllmConfig();

  return new ChatOpenAI({
    model: 'Qwen/Qwen3-8B-FP8',
    temperature,
    maxTokens,
    apiKey: vllmApiKey,
    configuration: {
      baseURL: vllmQwen3Url,
    },
  });
};
