# Development Guide

Quick reference for common development tasks.

## Getting Started

### First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/KoderFPV/Cognito.git
cd Cognito

# 2. Copy environment file
cp .env.example .env.local

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start everything
make dev-full
```

### Daily Development

```bash
# Quick start (Docker + Next.js)
make dev-full

# Or step by step:
make dev-infra    # Start Docker services first
make dev          # Then start Next.js
```

## Common Commands

### Development

```bash
make dev-full       # Start everything (recommended)
make dev            # Start only Next.js
make dev-infra      # Start only Docker services
make stop           # Stop Docker services
make restart        # Restart Docker services
make logs           # View Docker logs
make status         # Check Docker services status
```

### Testing

```bash
make test           # Run all tests (unit + E2E)
make test-watch     # Run tests in watch mode
make test-e2e       # Run only E2E tests
make lint           # Run ESLint
make type-check     # Run TypeScript type checking
```

### Building

```bash
make build          # Build production bundle
make start          # Start production server (after build)
```

### Cleanup

```bash
make clean          # Remove Docker volumes (DANGER: deletes data)
make stop           # Just stop services (keeps data)
```

## Project Structure

```
Cognito/
├── app/[locale]/              # Next.js app router (pages + API routes)
│   ├── api/                   # API routes
│   │   └── chat/send/         # Chat API endpoint (SSE streaming)
│   ├── cms/                   # Admin panel
│   └── shop/                  # Shop frontend
│       └── chat/              # AI Chat interface
├── components/                # React components (business logic)
│   ├── shop/chat/             # Chat components
│   └── ...
├── template/                  # Presentational layer (UI only)
│   ├── components/            # Template components
│   └── styles/                # Global styles
├── domain/                    # Domain models (interfaces)
│   ├── conversation.ts        # Chat conversation types
│   ├── agent.ts               # AI agent types
│   └── ...
├── models/                    # Database operations (MongoDB, Weaviate)
│   ├── conversations/         # Chat conversations CRUD
│   └── ...
├── repositories/              # Client-side API communication
│   └── api/chat/              # Chat API repository
├── services/                  # Business logic
│   ├── agents/                # LangGraph AI agents
│   │   ├── router/            # Router Agent (intent routing)
│   │   ├── specialized/       # Specialized agents (Chat, Product, etc.)
│   │   ├── graph/             # LangGraph state machine
│   │   └── state/             # Agent state management
│   ├── chat/                  # Chat service
│   └── llm/                   # LLM client (vLLM)
├── clients/                   # External service clients
│   ├── mongodb/               # MongoDB client
│   └── weaviate/              # Weaviate client
└── messages/                  # i18n translations (EN, PL)
```

## Architecture Patterns

### Functional Programming
- **No classes** - use pure functions only
- **No default parameters** - all values explicit
- **Immutability** - prefer const and immutable operations

### Type Safety
- **Interfaces start with "I"** - e.g., IUser, IProduct
- **No explicit return types** - TypeScript inference
- **Optional properties use ?** - not `| undefined`

### Code Organization
- **Domain** - Pure types, no implementation
- **Models** - Database operations only
- **Services** - Business logic + validation
- **Repositories** - API communication (client-side)
- **Components** - React UI + state management
- **Templates** - Pure presentation (no business logic)

## AI Chat Architecture

```
User Message
    ↓
useChatWindow (React Hook)
    ↓
streamChatMessage (Repository - SSE client)
    ↓
POST /[locale]/api/chat/send (API Route)
    ↓
streamChatResponse (Chat Service)
    ↓
executeChatGraph (LangGraph)
    ├─→ Router Agent (analyze intent)
    ├─→ Chat Agent (general conversation)
    ├─→ Products Agent (search - TODO)
    └─→ Product Agent (details - TODO)
    ↓
vLLM (Qwen3 model)
    ↓
SSE Stream back to client
    ↓
Real-time UI update
```

## Database

### MongoDB Collections
- `users` - User accounts
- `products` - Product catalog
- `conversations` - Chat conversations and history

### Weaviate Collections
- `Products` - Vector embeddings for semantic product search

## Environment Variables

Required in `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:2138/cognito

# Weaviate
WEAVIATE_HTTP_HOST=localhost
WEAVIATE_HTTP_PORT=2139
WEAVIATE_GRPC_HOST=localhost
WEAVIATE_GRPC_PORT=2140
WEAVIATE_SECURE=false
WEAVIATE_API_KEY=cognito-key
ENABLE_VECTORIZERS=true

# vLLM (AI Models)
VLLM_QWEN3_VL_URL=http://localhost:2141/v1
VLLM_QWEN3_URL=http://localhost:2142/v1
VLLM_API_KEY=placeholder

# NextAuth
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:2137

# Next.js
PORT=2137
NODE_ENV=development
```

## Ports Reference

| Service | Port | Description |
|---------|------|-------------|
| Next.js | 2137 | Main application |
| MongoDB | 2138 | Database |
| Weaviate (HTTP) | 2139 | Vector DB HTTP |
| Weaviate (gRPC) | 2140 | Vector DB gRPC |
| vLLM Qwen3-VL | 2141 | Vision-Language Model |
| vLLM Qwen3 | 2142 | Text Model |

## Troubleshooting

### Docker services won't start
```bash
# Check Docker is running
docker --version

# Check ports are free
lsof -i :2138  # MongoDB
lsof -i :2139  # Weaviate

# Clean everything and restart
make clean
make dev-infra
```

### Next.js won't start
```bash
# Kill process on port 2137
lsof -i :2137
kill -9 <PID>

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Tests failing
```bash
# Clear test cache
npm run test -- --clearCache

# Run specific test file
npm test -- path/to/test.ts
```

### Dependency conflicts
```bash
# Always use legacy peer deps
npm install --legacy-peer-deps

# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push -u origin feature/your-feature-name

# Create PR on GitHub
```

## Testing Chat

1. Start services: `make dev-full`
2. Open chat: http://localhost:2137/en/shop/chat
3. Type a message and see streaming response
4. Check Docker logs: `make logs`

## Useful Links

- **Local App**: http://localhost:2137
- **AI Chat (EN)**: http://localhost:2137/en/shop/chat
- **AI Chat (PL)**: http://localhost:2137/pl/shop/chat
- **CMS (EN)**: http://localhost:2137/en/cms
- **CMS (PL)**: http://localhost:2137/pl/cms
- **GitHub Issues**: https://github.com/KoderFPV/Cognito/issues
- **Documentation**: [docs/AGENTS.md](docs/AGENTS.md)
