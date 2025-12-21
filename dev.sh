#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    echo "Cognito Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start        - Start everything (Docker + Next.js)"
    echo "  stop         - Stop all services"
    echo "  restart      - Restart all services"
    echo "  logs         - View Docker logs"
    echo "  status       - Check services status"
    echo "  clean        - Stop and remove Docker volumes"
    echo "  test         - Run tests"
    echo "  build        - Build for production"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start    # Start development environment"
    echo "  ./dev.sh logs     # View logs"
    echo "  ./dev.sh stop     # Stop everything"
}

start_services() {
    echo "🚀 Starting Cognito development environment..."
    echo ""

    echo "📦 Starting Docker services..."
    docker-compose up -d

    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 3

    echo ""
    echo "✅ Docker services started:"
    echo "   - MongoDB:       localhost:2138"
    echo "   - Weaviate HTTP: localhost:2139"
    echo "   - Weaviate gRPC: localhost:2140"
    echo "   - vLLM Qwen3-VL: localhost:2141"
    echo "   - vLLM Qwen3:    localhost:2142"
    echo ""
    echo "🚀 Starting Next.js development server..."
    echo "   Application will be available at: http://localhost:2137"
    echo ""

    npm run dev
}

stop_services() {
    echo "🛑 Stopping services..."
    docker-compose down
    echo "✅ Services stopped"
}

restart_services() {
    echo "🔄 Restarting services..."
    docker-compose restart
    echo "✅ Services restarted"
}

view_logs() {
    echo "📋 Docker logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

check_status() {
    echo "📊 Services Status:"
    docker-compose ps
}

clean_services() {
    echo "🧹 Cleaning services and volumes..."
    echo "⚠️  This will delete all data in Docker volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        echo "✅ Services and volumes removed"
    else
        echo "❌ Cancelled"
    fi
}

run_tests() {
    echo "🧪 Running tests..."
    npm run test:all
}

build_production() {
    echo "🏗️  Building for production..."
    npm run build
    echo "✅ Build complete"
}

case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        view_logs
        ;;
    status)
        check_status
        ;;
    clean)
        clean_services
        ;;
    test)
        run_tests
        ;;
    build)
        build_production
        ;;
    help|--help|-h|*)
        show_help
        ;;
esac
