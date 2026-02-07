import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { graphLogger } from '@/services/logger/graphLogger';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { findProductByName } from '@/models/products/productsModel';
import { createOllamaClient } from '@/services/llm/llm.service';
import { createProductReferenceExtractionPrompt, createProductDetailsPrompt } from '@/agents/prompts/productPrompts';
import { IProduct, IProductAttribute } from '@/domain/product';

const REFERENCE_EXTRACTION_TEMPERATURE = 0.1;
const REFERENCE_EXTRACTION_MAX_TOKENS = 100;
const DETAILS_EXTRACTION_TEMPERATURE = 0.1;
const DETAILS_EXTRACTION_MAX_TOKENS = 500;

export interface IProductReference {
  type: 'position' | 'name' | 'unknown';
  position?: number;
  name?: string;
}

export interface IProductTranslations {
  notFound: string;
  noReference: string;
  noSearchResults: string;
  productDetails: string;
  price: string;
  category: string;
  inStock: string;
  outOfStock: string;
  specifications: string;
  description: string;
  error: string;
}

export interface ISearchResults {
  products: IProduct[];
}

export const extractProductReference = async (
  message: string,
  locale: string
): Promise<IProductReference> => {
  const llm = createOllamaClient(REFERENCE_EXTRACTION_TEMPERATURE, REFERENCE_EXTRACTION_MAX_TOKENS);
  const systemPrompt = createProductReferenceExtractionPrompt(locale);

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(message),
  ]);

  const content = response.content.toString().trim();

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        type: parsed.type || 'unknown',
        position: parsed.position,
        name: parsed.name,
      };
    }
  } catch {
    graphLogger.warn('product', `Failed to parse reference: ${content}`);
  }

  return { type: 'unknown' };
};

export const extractAttributesFromDescription = async (
  description: string,
  locale: string
): Promise<IProductAttribute[]> => {
  const llm = createOllamaClient(DETAILS_EXTRACTION_TEMPERATURE, DETAILS_EXTRACTION_MAX_TOKENS);
  const systemPrompt = createProductDetailsPrompt(locale);

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(description),
  ]);

  const content = response.content.toString().trim();

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((attr: { name: string; value: string; unit?: string }) => ({
        name: attr.name,
        value: attr.value,
        unit: attr.unit,
      }));
    }
  } catch {
    graphLogger.warn('product', `Failed to parse attributes from description: ${content}`);
  }

  return [];
};

export const findProductByReference = async (
  reference: IProductReference,
  searchResults: ISearchResults | null
): Promise<IProduct | null> => {
  if (reference.type === 'position') {
    if (!searchResults || searchResults.products.length === 0) {
      return null;
    }

    const index = (reference.position || 1) - 1;
    if (index >= 0 && index < searchResults.products.length) {
      return searchResults.products[index];
    }
    return null;
  }

  if (reference.type === 'name' && reference.name) {
    const db = await connectToMongo();
    return findProductByName(db, reference.name);
  }

  return null;
};

export const formatProductDetails = (
  product: IProduct,
  attributes: IProductAttribute[],
  t: IProductTranslations
): string => {
  const lines: string[] = [];

  lines.push(`## ${product.name}`);
  lines.push('');
  lines.push(`**${t.price}:** ${product.price.toFixed(2)} zł`);
  lines.push(`**${t.category}:** ${product.category}`);
  lines.push(`**${product.stock > 0 ? t.inStock : t.outOfStock}**`);
  lines.push('');

  if (attributes.length > 0) {
    lines.push(`### ${t.specifications}`);
    for (const attr of attributes) {
      const value = attr.unit ? `${attr.value} ${attr.unit}` : attr.value;
      lines.push(`- **${attr.name}:** ${value}`);
    }
    lines.push('');
  }

  lines.push(`### ${t.description}`);
  lines.push(product.description);

  return lines.join('\n');
};

export const getProductWithAttributes = async (
  product: IProduct,
  locale: string
): Promise<{ product: IProduct; attributes: IProductAttribute[] }> => {
  let attributes = product.attributes || [];

  if (attributes.length === 0) {
    graphLogger.info('product', 'No attributes found, extracting from description');
    attributes = await extractAttributesFromDescription(product.description, locale);
  }

  return { product, attributes };
};
