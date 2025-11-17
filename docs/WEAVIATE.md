# Weaviate Vector Database Setup

This document describes the Weaviate database integration for AI-powered search and product recommendations in Cognito.

## Overview

Weaviate is a vector database used to store and search product embeddings for AI-powered semantic search and recommendations. It enables natural language product discovery and personalized recommendations.

## Architecture

### Client Connection

The Weaviate client is initialized in `clients/weaviate/weaviate.ts`:
- **Connection Caching**: The client is cached after the first connection to reuse the same instance
- **Lazy Loading**: Connection is established on first use, not at application startup
- **Singleton Pattern**: Ensures only one client instance exists at a time

### Configuration

Weaviate configuration is managed through environment variables:

```bash
WEAVIATE_URL=http://localhost:8080
```

**Supported Protocols:**
- `http://` - for local development
- `https://` - for production with TLS

**URL Format:**
```
http://[host]:[port]
https://[host]:[port]/optional/path
```

## Development Setup

### Starting Weaviate

```bash
# Start infrastructure services (includes Weaviate)
docker-compose up -d

# Verify Weaviate is running
curl http://localhost:8080/v1/.well-known/ready
```

### Stopping Weaviate

```bash
docker-compose down
```

## Configuration Files

### Environment Variables

**Development** (`.env`):
```bash
WEAVIATE_URL=http://localhost:8080
```

**Testing** (`.env.test`):
```bash
WEAVIATE_URL=http://localhost:8080
```

**Configuration Service** (`services/config/config.service.ts`):
- `getWeaviateUrl()` - Retrieves and validates the Weaviate URL
- Throws error if URL is missing or invalid

## Connection Management

### Connecting to Weaviate

```typescript
import { connectToWeaviate } from '@/clients/weaviate/weaviate';

const client = await connectToWeaviate();
```

### Closing Connection

```typescript
import { closeWeaviateConnection } from '@/clients/weaviate/weaviate';

await closeWeaviateConnection();
```

## Using Weaviate in Models

Create Weaviate operations in the `models/` directory following the same pattern as MongoDB models:

```typescript
// models/products/productsVectorModel.ts
import { connectToWeaviate } from '@/clients/weaviate/weaviate';

export const searchProducts = async (
  query: string,
  limit: number = 10
) => {
  const client = await connectToWeaviate();

  const result = await client.graphql
    .get()
    .withClassName('Product')
    .withNearText({ concepts: [query] })
    .withLimit(limit)
    .do();

  return result.data.Get.Product;
};
```

## Testing

### Unit Tests

Tests for Weaviate client are located in `clients/weaviate/weaviate.test.ts`:

```bash
npm test -- clients/weaviate/weaviate.test.ts
```

### Test Configuration

Tests use mocked Weaviate client to avoid requiring actual Weaviate instance:
- Connection caching is tested
- Error handling is tested
- Connection closure is tested

### Configuration Tests

Config service tests in `services/config/config.service.test.ts` validate:
- URL validation (http/https protocols)
- Error handling for missing/invalid URLs

## Collections

Weaviate collections (equivalent to MongoDB collections) should be defined in the models layer:

### Example Collection Definition

Products collection should include:
- Product name
- Product description
- Product category
- Product embeddings (auto-generated)

## Error Handling

### Configuration Errors

If Weaviate URL is not configured:
```
Error: WEAVIATE_URL environment variable is required
```

If Weaviate URL has invalid protocol:
```
Error: WEAVIATE_URL must start with http:// or https://
```

### Connection Errors

Connection errors are thrown and should be handled by calling code using try-catch blocks.

## Performance Considerations

### Caching

The Weaviate client is cached to avoid repeated connection overhead:
- First call: Establishes new connection
- Subsequent calls: Returns cached client
- After close: Cache is cleared

### Batch Operations

For bulk operations, batch API should be used instead of individual insertions for better performance.

## Troubleshooting

### Connection Issues

1. **Verify Weaviate is running:**
   ```bash
   curl http://localhost:8080/v1/.well-known/ready
   ```

2. **Check environment variable:**
   ```bash
   echo $WEAVIATE_URL
   ```

3. **Check logs:**
   ```bash
   docker-compose logs weaviate
   ```

### Configuration Issues

1. **Invalid URL format:**
   - Must start with `http://` or `https://`
   - Example: `http://localhost:8080` ✓
   - Example: `localhost:8080` ✗

2. **Missing WEAVIATE_URL:**
   - Add to `.env` file in project root
   - Add to `.env.test` for testing

## Integration with Other Services

### MongoDB + Weaviate Pattern

For products with both MongoDB and vector search:

1. **MongoDB** stores: Product metadata (name, price, description, etc.)
2. **Weaviate** stores: Product embeddings and vectors

```typescript
export const createProductWithVectors = async (
  productData: IProduct,
  embedding: number[]
) => {
  // Save to MongoDB
  const product = await createProduct(productData);

  // Save vectors to Weaviate
  await addProductVectors(product._id, embedding);

  return product;
};
```

## Future Enhancements

- Implement collection schema configuration
- Add batch operations for bulk imports
- Implement vector embedding generation
- Add semantic search query builders
- Implement recommendation engine
- Add hybrid search (vector + keyword)

## References

- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
- [Weaviate Client Library](https://github.com/weaviate/typescript-client)
- [Vector Database Concepts](https://weaviate.io/blog/what-is-a-vector-database)
