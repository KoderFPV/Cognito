# Cognito

Modern AI-powered agentic e-commerce platform, similar to Magento or WooCommerce, designed to autonomously handle complex commerce operations.

**Open Source Software** - Licensed under the Functional Source License (FSL). Free to use and modify.

## Design Vision

Below are the reference designs that showcase how the platform should look and feel:

**Home Page**
![Home Page Design](./template/assets/Desktop/home.png)

**Product Listing**
![Product Listing Design](./template/assets/Desktop/listing_1.png)

**Product Page**
![Product Page Design](./template/assets/Desktop/product_page.png)

For more details about the template system and customization, see [template/README.md](./template/README.md).

## Project Overview

Cognito is an innovative **agentic e-commerce platform** that leverages artificial intelligence and autonomous agents to enhance the shopping experience. Unlike traditional e-commerce systems, Cognito uses AI agents to handle complex workflows, customer interactions, and business processes autonomously.

### Main Components

1. **API Backend (Agentic)**
   - Built with LangGraph - framework for building stateful, multi-agent AI applications
   - Autonomous AI agents handle complex e-commerce workflows and business processes
   - MongoDB for application data storage
   - Weaviate for vector embeddings and semantic search
   - Multi-agent orchestration for order processing, inventory management, and customer service

2. **AI Chat**
   - Natural language product search
   - Intelligent recommendations
   - Direct purchase capability through chat
   - Mobile-first responsive design with desktop support

3. **CMS**
   - Admin panel for store configuration
   - Product management
   - Order and inventory management
   - Personalization and settings
   - Mobile-first responsive design with desktop support

### Technologies

- **Frontend**: Next.js + TypeScript
- **Backend**: LangGraph + MongoDB
- **AI**: LangGraph for conversational commerce
- **Database**:
  - MongoDB - Primary database for application data
  - Weaviate - Vector database for AI-powered search and recommendations
- **i18n**: next-intl (English and Polish support)

## Status

Project in initialization phase.

## Progress

| Feature | Status |
|---------|--------|
| Login | ❌ |
| Product Search | ❌ |
| Checkout | ❌ |
| Payments | ❌ |
| Add New Products | ❌ |
| Store Configuration | ❌ |
| Browse Orders | ❌ |
| Browse Users | ❌ |
| Other | ❌ |

## Running the Project

### Docker (Recommended)

Run the entire application with MongoDB using Docker Compose:

```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

Available services:
- **Application**: http://localhost:2137
- **MongoDB**: localhost:27017

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production version
npm run build
npm start
```

## Configuration

Copy `.env.example` to `.env` and adjust environment variables:

```bash
cp .env.example .env
```
# cognito
