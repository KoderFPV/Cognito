import { AIMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';

export const productsNode = async (state: IGraphState) => {
  const locale = state.locale || 'en';
  const fallbackMessage =
    locale === 'pl'
      ? 'Funkcja wyszukiwania produktów jest obecnie w trakcie implementacji. Proszę spróbować później.'
      : 'Product search functionality is currently under implementation. Please try again later.';

  graphLogger.info('products', 'Returning fallback message');

  return { messages: [new AIMessage(fallbackMessage)], response: fallbackMessage };
};
