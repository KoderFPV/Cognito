import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';
import { isHumanMessage } from '@/agents/utils/messageUtils';
import { getAgentTranslations } from '@/agents/utils/translations';
import {
  extractProductReference,
  findProductByReference,
  getProductWithAttributes,
  formatProductDetails,
  IProductTranslations,
} from '@/services/product/productDetailsService';

const getLastUserMessage = (messages: BaseMessage[]): string => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isHumanMessage(messages[i])) {
      return messages[i].content?.toString() || '';
    }
  }
  return '';
};

const buildTranslations = (t: (key: string) => string): IProductTranslations => ({
  notFound: t('notFound'),
  noReference: t('noReference'),
  noSearchResults: t('noSearchResults'),
  productDetails: t('productDetails'),
  price: t('price'),
  category: t('category'),
  inStock: t('inStock'),
  outOfStock: t('outOfStock'),
  specifications: t('specifications'),
  description: t('description'),
  error: t('error'),
});

export const productNode = async (state: IGraphState) => {
  const locale = state.locale || 'en';
  const t = getAgentTranslations(locale, 'agents.product');
  const translations = buildTranslations(t);

  graphLogger.info('product', 'Starting product details lookup');

  try {
    const userMessage = getLastUserMessage(state.messages);
    if (!userMessage) {
      const message = translations.noReference;
      return { messages: [new AIMessage(message)], response: message };
    }

    const reference = await extractProductReference(userMessage, locale);
    graphLogger.info('product', `Extracted reference: ${JSON.stringify(reference)}`);

    if (reference.type === 'unknown') {
      const message = translations.noReference;
      return { messages: [new AIMessage(message)], response: message };
    }

    const product = await findProductByReference(reference, state.lastSearchResults);

    if (!product) {
      const message = reference.type === 'position' && (!state.lastSearchResults || state.lastSearchResults.products.length === 0)
        ? translations.noSearchResults
        : translations.notFound;
      return { messages: [new AIMessage(message)], response: message };
    }

    graphLogger.info('product', `Found product: ${product.name}`);

    const { attributes } = await getProductWithAttributes(product, locale);
    const responseMessage = formatProductDetails(product, attributes, translations);

    return { messages: [new AIMessage(responseMessage)], response: responseMessage };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    graphLogger.error('product', `Lookup failed: ${errorMsg}`);

    const message = translations.error;
    return { messages: [new AIMessage(message)], response: message };
  }
};
