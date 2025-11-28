#!/bin/bash

# SiloBreaker Service Restart Script
# Stops and restarts backend and frontend services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  SiloBreaker Service Restart Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Parse arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --backend-only) BACKEND_ONLY=true ;;
        --frontend-only) FRONTEND_ONLY=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Step 1: Stop existing services
echo -e "${CYAN}Step 1: Stopping existing services...${NC}"

if [ "$FRONTEND_ONLY" = false ]; then
    # Kill backend (port 4000)
    if lsof -ti:4000 > /dev/null 2>&1; then
        lsof -ti:4000 | xargs kill -9 2>/dev/null || true
        echo "Stopped backend on port 4000"
    fi
fi

if [ "$BACKEND_ONLY" = false ]; then
    # Kill frontend (port 5173)
    if lsof -ti:5173 > /dev/null 2>&1; then
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        echo "Stopped frontend on port 5173"
    fi
fi

echo -e "${GREEN}Existing services stopped.${NC}"
echo ""

# Step 2: Verify ports are available
echo -e "${CYAN}Step 2: Verifying ports are available...${NC}"
sleep 1

if [ "$FRONTEND_ONLY" = false ]; then
    if lsof -ti:4000 > /dev/null 2>&1; then
        echo -e "${RED}ERROR: Port 4000 is still in use${NC}"
        exit 1
    fi
    echo -e "${GREEN}Port 4000 is available${NC}"
fi

if [ "$BACKEND_ONLY" = false ]; then
    if lsof -ti:5173 > /dev/null 2>&1; then
        echo -e "${RED}ERROR: Port 5173 is still in use${NC}"
        exit 1
    fi
    echo -e "${GREEN}Port 5173 is available${NC}"
fi

echo ""

# Step 3: Start services
echo -e "${CYAN}Step 3: Starting services...${NC}"

cd "$PROJECT_DIR"

if [ "$FRONTEND_ONLY" = false ]; then
    echo -e "${YELLOW}Starting backend on port 4000...${NC}"
    NEO4J_URI=bolt://localhost:7687 NEO4J_USERNAME=neo4j NEO4J_PASSWORD=tstpwdpwd \
        npm run dev --workspace=@dickon/backend > /tmp/silobreaker-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
fi

if [ "$BACKEND_ONLY" = false ]; then
    echo -e "${YELLOW}Starting frontend on port 5173...${NC}"
    npm run dev --workspace=@dickon/frontend > /tmp/silobreaker-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
fi

echo ""

# Step 4: Wait for services to be ready
echo -e "${CYAN}Step 4: Waiting for services to be ready...${NC}"

if [ "$FRONTEND_ONLY" = false ]; then
    echo -e "${YELLOW}Waiting for Backend to be ready...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:4000 > /dev/null 2>&1; then
            echo -e "${GREEN}Backend is ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

if [ "$BACKEND_ONLY" = false ]; then
    echo -e "${YELLOW}Waiting for Frontend to be ready...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo -e "${GREEN}Frontend is ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend:  ${CYAN}http://localhost:4000${NC}"
echo -e "Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "GraphQL:  ${CYAN}http://localhost:4000/graphql${NC}"
echo ""
echo "Logs:"
echo "  Backend:  /tmp/silobreaker-backend.log"
echo "  Frontend: /tmp/silobreaker-frontend.log"
echo ""
echo -e "To stop services: ${YELLOW}./scripts/stop-services.sh${NC}"
