import { AIMessage, HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { IGraphState } from '@/agents/graph/state';
import { isHumanMessage } from '@/agents/utils/messageUtils';
import { connectToWeaviate } from '@/clients/weaviate/weaviate';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { searchProductIdsInWeaviate } from '@/models/products/weaviateProductsModel';
import { getProductById } from '@/models/products/productsModel';
import { createOllamaClient } from '@/services/llm/llm.service';
import { createProductSearchQueryPrompt } from '@/agents/prompts/productsPrompts';
import { IProduct } from '@/domain/product';
import { getAgentTranslations } from '@/agents/utils/translations';

const SEARCH_LIMIT = 5;
const MAX_CONTEXT_MESSAGES = 10;
const QUERY_EXTRACTION_TEMPERATURE = 0.1;
const QUERY_EXTRACTION_MAX_TOKENS = 100;

const formatConversation = (messages: BaseMessage[]) => {
  return messages
    .map((m) => {
      const role = isHumanMessage(m) ? 'User' : 'Assistant';
      return `${role}: ${m.content?.toString() || ''}`;
    })
    .join('\n');
};

const extractSearchQuery = async (messages: BaseMessage[], locale: string) => {
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
  const conversationText = formatConversation(recentMessages);

  const llm = createOllamaClient(QUERY_EXTRACTION_TEMPERATURE, QUERY_EXTRACTION_MAX_TOKENS);
  const systemPrompt = createProductSearchQueryPrompt(locale);

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Conversation:\n${conversationText}`),
  ]);

  const query = response.content.toString().trim();

  if (query === 'EMPTY' || query.length === 0) {
    return null;
  }

  return query;
};

interface IProductsTranslations {
  noQueryDetected: string;
  noProductsFound: string;
  foundProducts: string;
  inStock: string;
  outOfStock: string;
  category: string;
  searchError: string;
}

const formatProductsResponse = (products: IProduct[], t: IProductsTranslations) => {
  if (products.length === 0) {
    return t.noProductsFound;
  }

  const header = t.foundProducts.replace('{count}', String(products.length)) + '\n\n';

  const productsList = products
    .map((p, i) => {
      const price = p.price.toFixed(2);
      const stockText = p.stock > 0 ? t.inStock : t.outOfStock;
      return `${i + 1}. **${p.name}** - ${price} zł\n   ${p.description}\n   ${t.category}: ${p.category} | ${stockText}`;
    })
    .join('\n\n');

  return header + productsList;
};

export const productsNode = async (state: IGraphState) => {
  const locale = state.locale || 'en';
  const t = getAgentTranslations(locale, 'agents.products');

  const translations: IProductsTranslations = {
    noQueryDetected: t('noQueryDetected'),
    noProductsFound: t('noProductsFound'),
    foundProducts: t('foundProducts'),
    inStock: t('inStock'),
    outOfStock: t('outOfStock'),
    category: t('category'),
    searchError: t('searchError'),
  };

  graphLogger.info('products', 'Starting product search');

  try {
    const searchQuery = await extractSearchQuery(state.messages, locale);

    if (!searchQuery) {
      const message = translations.noQueryDetected;
      return { messages: [new AIMessage(message)], response: message };
    }

    graphLogger.info('products', `Extracted search query: "${searchQuery}"`);

    const weaviateClient = await connectToWeaviate();
    const productIds = await searchProductIdsInWeaviate(weaviateClient, searchQuery, SEARCH_LIMIT);

    graphLogger.info('products', `Found ${productIds.length} product IDs in Weaviate`);

    if (productIds.length === 0) {
      const message = formatProductsResponse([], translations);
      return { messages: [new AIMessage(message)], response: message };
    }

    const db = await connectToMongo();
    const products: IProduct[] = [];

    for (const mongoId of productIds) {
      const product = await getProductById(db, mongoId);
      if (product && !product.deleted && product.isActive) {
        products.push(product);
      }
    }

    graphLogger.info('products', `Retrieved ${products.length} products from MongoDB`);

    const responseMessage = formatProductsResponse(products, translations);
    return {
      messages: [new AIMessage(responseMessage)],
      response: responseMessage,
      lastSearchResults: {
        products,
        query: searchQuery,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    graphLogger.error('products', `Search failed: ${errorMsg}`);

    const message = translations.searchError;
    return { messages: [new AIMessage(message)], response: message };
  }
};
