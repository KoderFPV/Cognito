.PHONY: help dev dev-full dev-infra stop logs restart clean test install build

help:
	@echo "Cognito Development Commands"
	@echo ""
	@echo "Quick Start:"
	@echo "  make dev-full    - Start everything (Docker + Next.js dev server)"
	@echo "  make dev         - Start only Next.js dev server (requires Docker running)"
	@echo "  make dev-infra   - Start only Docker services (MongoDB, Weaviate, vLLM)"
	@echo ""
	@echo "Docker Management:"
	@echo "  make stop        - Stop all Docker services"
	@echo "  make restart     - Restart Docker services"
	@echo "  make logs        - View Docker logs (follow mode)"
	@echo "  make clean       - Stop and remove all Docker volumes"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install npm dependencies"
	@echo "  make build       - Build Next.js production bundle"
	@echo "  make test        - Run all tests"
	@echo "  make test-watch  - Run tests in watch mode"
	@echo "  make lint        - Run ESLint"
	@echo "  make type-check  - Run TypeScript type checking"
	@echo ""
	@echo "Production:"
	@echo "  make start       - Start production server (requires build)"
	@echo ""

dev-full:
	@echo "🚀 Starting full development environment..."
	@echo "   - Docker services (MongoDB, Weaviate, vLLM)"
	@echo "   - Next.js dev server on http://localhost:2137"
	@npm run dev:full

dev:
	@echo "🚀 Starting Next.js dev server on http://localhost:2137"
	@npm run dev

dev-infra:
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d
	@echo "✅ Docker services started:"
	@echo "   - MongoDB:   localhost:2138"
	@echo "   - Weaviate:  localhost:2139 (HTTP), localhost:2140 (gRPC)"
	@echo "   - vLLM Qwen3-VL: localhost:2141"
	@echo "   - vLLM Qwen3:    localhost:2142"

stop:
	@echo "🛑 Stopping Docker services..."
	@docker-compose down
	@echo "✅ Docker services stopped"

logs:
	@echo "📋 Following Docker logs (Ctrl+C to exit)..."
	@docker-compose logs -f

restart:
	@echo "🔄 Restarting Docker services..."
	@docker-compose restart
	@echo "✅ Docker services restarted"

clean:
	@echo "🧹 Cleaning Docker services and volumes..."
	@docker-compose down -v
	@echo "✅ Docker services and volumes removed"

install:
	@echo "📦 Installing npm dependencies..."
	@npm install --legacy-peer-deps
	@echo "✅ Dependencies installed"

build:
	@echo "🏗️  Building Next.js production bundle..."
	@npm run build
	@echo "✅ Build complete"

start:
	@echo "🚀 Starting production server on http://localhost:2137"
	@npm start

test:
	@echo "🧪 Running all tests..."
	@npm run test:all

test-watch:
	@echo "🧪 Running tests in watch mode..."
	@npm run test:watch

test-e2e:
	@echo "🧪 Running E2E tests..."
	@npm run test:e2e

lint:
	@echo "🔍 Running ESLint..."
	@npm run lint

type-check:
	@echo "📝 Running TypeScript type checking..."
	@npm run type-check

status:
	@echo "📊 Docker Services Status:"
	@docker-compose ps
