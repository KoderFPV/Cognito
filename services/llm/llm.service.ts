import { ChatOpenAI } from '@langchain/openai';

const VLLM_QWEN3_VL_URL = process.env.VLLM_QWEN3_VL_URL;
const VLLM_QWEN3_URL = process.env.VLLM_QWEN3_URL;
const VLLM_API_KEY = process.env.VLLM_API_KEY;

if (!VLLM_QWEN3_VL_URL) {
  throw new Error('VLLM_QWEN3_VL_URL environment variable is not set');
}

if (!VLLM_QWEN3_URL) {
  throw new Error('VLLM_QWEN3_URL environment variable is not set');
}

if (!VLLM_API_KEY) {
  throw new Error('VLLM_API_KEY environment variable is not set');
}

export const createQwen3VLClient = (temperature: number, maxTokens: number) => {
  return new ChatOpenAI({
    model: 'Qwen/Qwen2-VL-7B-Instruct',
    temperature,
    maxTokens,
    openAIApiKey: VLLM_API_KEY,
    configuration: {
      baseURL: VLLM_QWEN3_VL_URL,
    },
  });
};

export const createQwen3Client = (temperature: number, maxTokens: number) => {
  return new ChatOpenAI({
    model: 'Qwen/Qwen2.5-7B-Instruct',
    temperature,
    maxTokens,
    openAIApiKey: VLLM_API_KEY,
    configuration: {
      baseURL: VLLM_QWEN3_URL,
    },
  });
};
