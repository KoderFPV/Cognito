# Product Search

This document describes the semantic product search implementation in Cognito.

## Overview

Cognito uses semantic search powered by Weaviate vector database to find products based on natural language queries. The system extracts search keywords from conversation context and performs vector similarity search.

## Architecture

```
User Message
    ↓
Router Node (LLM)
    ↓ routes to "products"
Products Node
    ↓
Query Extraction (LLM)
    ↓
Weaviate Vector Search
    ↓
MongoDB Product Fetch
    ↓
Formatted Response
```

## Components

### 1. Router Node

Location: `agents/graph/nodes/routerNode.ts`

The router analyzes user messages and routes product-related queries to the products agent:

- `"products"` - for product search/browsing
- `"product"` - for specific product details
- `"chat"` - for general conversation

### 2. Products Node

Location: `agents/graph/nodes/productsNode.ts`

Handles product search workflow:

1. **Query Extraction** - Uses LLM to extract search keywords from conversation
2. **Vector Search** - Queries Weaviate for semantically similar products
3. **Product Fetch** - Retrieves full product data from MongoDB
4. **Response Formatting** - Formats products into user-friendly response

### 3. Query Extraction Prompt

Location: `agents/prompts/productsPrompts.ts`

The LLM extracts search keywords from the entire conversation context, not just the last message. This enables multi-turn conversations:

```
User: I need something for gaming
Assistant: PC or console?
User: PC, with good graphics
→ "gaming PC graphics GPU computer"
```

### 4. Weaviate Product Model

Location: `models/products/weaviateProductsModel.ts`

Products are indexed in Weaviate with text vectorization:

```typescript
interface IWeaviateProduct {
  mongoId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  stock: number;
  imageUrl?: string;
}
```

Search uses `nearText` query on `text_vector` target.

## Data Flow

### Indexing Products

When a product is created:

1. Product saved to MongoDB
2. Product indexed in Weaviate with vector embedding

```typescript
await createProduct(productData);        // MongoDB
await addProductToWeaviate(client, product);  // Weaviate
```

### Searching Products

When user searches:

1. LLM extracts keywords from conversation
2. Weaviate returns product IDs by vector similarity
3. MongoDB fetches full product details
4. Only active, non-deleted products are returned

```typescript
const query = await extractSearchQuery(messages, locale);
const productIds = await searchProductIdsInWeaviate(client, query, limit);
const products = await Promise.all(
  productIds.map(id => getProductById(db, id))
);
```

## Configuration

### Environment Variables

```bash
# Weaviate
WEAVIATE_HTTP_HOST=localhost
WEAVIATE_HTTP_PORT=8080
WEAVIATE_GRPC_HOST=localhost
WEAVIATE_GRPC_PORT=50051
WEAVIATE_API_KEY=your-api-key

# Ollama (for LLM)
OLLAMA_URL=http://localhost:11434/v1
OLLAMA_MODEL=mistral-small3.2:24b-instruct-2506-q8_0
```

### Search Parameters

| Parameter | Value | Location |
|-----------|-------|----------|
| Search limit | 5 | `productsNode.ts` |
| Query extraction temperature | 0.1 | `productsNode.ts` |
| Query extraction max tokens | 100 | `productsNode.ts` |
| Max context messages | 10 | `productsNode.ts` |

## Translations

Product search responses are translated based on locale:

| Key | EN | PL |
|-----|----|----|
| `noQueryDetected` | No product query detected... | Nie wykryto zapytania... |
| `noProductsFound` | No products found... | Nie znaleziono produktów... |
| `foundProducts` | Found {count} products: | Znaleziono {count} produktów: |
| `inStock` | In stock | Dostępny |
| `outOfStock` | Out of stock | Niedostępny |

Translations: `messages/en.json`, `messages/pl.json`

## Testing

### Unit Tests

```bash
TEST_LOCALE=en npm test
```

Tests in `agents/graph/chatGraph.test.ts` cover:
- Router routing to products agent
- Query extraction
- Product filtering (deleted, inactive)
- Response formatting

### Evaluation Tests

```bash
TEST_LOCALE=en npm run test:eval
```

LLM-as-judge evaluation tests in `agents/__tests__/evaluation/`:
- Single-turn product searches
- Multi-turn conversations
- Edge cases (greetings, ambiguous queries)

See `docs/JENKINS_EVAL.md` for CI setup.

## Limitations

Current implementation is a simple semantic search:

- No filtering by price range
- No filtering by category
- No filtering by brand
- No sorting options
- Returns top 5 results by semantic similarity

These features are planned for future iterations.
