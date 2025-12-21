# Cognito

Modern AI-powered agentic e-commerce platform, designed to autonomously handle complex commerce operations.

**Open Source Software** - Licensed under the Functional Source License (FSL). Free to use and modify.

**Demo app link:** TBA

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

### AI Agents Architecture

![LangGraph Architecture](docs/graph.png)

The platform uses LangGraph to implement a multi-agent system where specialized AI agents autonomously handle different aspects of e-commerce operations. For detailed architecture documentation, see [docs/AGENTS.md](docs/AGENTS.md).

### AI Ideas & Planned Features

The platform will leverage multiple AI models to create an intelligent, safe, and autonomous e-commerce experience:

**Conversational Ecommerce Experience**
- **AI Chat Interface** - Natural language product discovery and purchase through conversational AI
- **Personalized Recommendations** - Context-aware product suggestions based on conversation
- **Smart Shopping Assistant** - Autonomous agent to guide customers through their shopping journey

**Content Moderation**
- **Qwen Guard** - Vulgar language detection for product submissions in demo store
- **Qwen Guard** - Comment filtering and moderation for inappropriate content

**Product Management**
- **Qwen 8 VL** - Automatic image analysis and product description generation
- **Neural Network Classifier** - Intelligent filter population and product categorization

**Inventory Personal Assistance**
- **AI Agent** - Supplier analysis and cost optimization to find cheaper suppliers
- **Competitive Analysis** - Automated competitor monitoring and pricing insights
- **Inventory Advisory** - Intelligent recommendations for stock management and reordering strategies

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

## MVP Progress

| Feature | Status |
|---------|--------|
| Login | ✅ |
| Product Search | ❌ |
| Checkout | ❌ |
| Payments | ❌ |
| Add New Products | ✅ |
| Store Configuration | ❌ |
| Browse Orders | ❌ |
| Browse Users | ❌ |
| Other | ❌ |

## Running the Project

### Quick Start (Easiest)

**Using Make (Recommended):**
```bash
# Start everything (Docker + Next.js) in one command
make dev-full
```

**Using npm:**
```bash
npm run dev:full
```

This will start:
- Docker services (MongoDB, Weaviate, vLLM)
- Next.js development server

### Manual Start

**Step 1: Start Infrastructure**
```bash
# Using Make
make dev-infra

# OR using npm
npm run docker:up

# OR using docker-compose directly
docker-compose up -d
```

**Step 2: Start Development Server**
```bash
# Using Make
make dev

# OR using npm
npm run dev
```

### Available Commands

**Make commands (easier to remember):**
```bash
make help         # Show all available commands
make dev-full     # Start everything
make dev          # Start only Next.js
make dev-infra    # Start only Docker services
make stop         # Stop Docker services
make logs         # View Docker logs
make restart      # Restart Docker services
make clean        # Remove Docker volumes
make test         # Run tests
make build        # Build for production
```

**npm scripts:**
```bash
npm run dev           # Next.js dev server only
npm run dev:full      # Docker + Next.js
npm run docker:up     # Start Docker services
npm run docker:down   # Stop Docker services
npm run docker:logs   # View logs
npm run test          # Run tests
npm run build         # Build for production
```

### Available Services

- **Application**: http://localhost:2137
  - Shop (AI Chat): http://localhost:2137/en/shop/chat
  - CMS (Admin): http://localhost:2137/en/cms
- **MongoDB**: localhost:2138
- **Weaviate**: localhost:2139 (HTTP), localhost:2140 (gRPC)
- **vLLM Qwen3-VL**: localhost:2141
- **vLLM Qwen3**: localhost:2142

### Production Deployment

```bash
# Build and start all containers (app + infrastructure)
docker-compose -f docker-compose.prod.yml up -d
```

## Configuration

Copy `.env.example` to `.env` and adjust environment variables:

```bash
cp .env.example .env
```
# cognito
