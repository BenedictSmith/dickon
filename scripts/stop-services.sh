#!/bin/bash

# SiloBreaker Service Stop Script
# Stops all running SiloBreaker services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  SiloBreaker Service Stop Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

echo "Stopping services..."

# Kill backend (port 4000)
if lsof -ti:4000 > /dev/null 2>&1; then
    lsof -ti:4000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}Stopped backend on port 4000${NC}"
else
    echo "Backend not running on port 4000"
fi

# Kill frontend (port 5173)
if lsof -ti:5173 > /dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}Stopped frontend on port 5173${NC}"
else
    echo "Frontend not running on port 5173"
fi

echo ""
echo -e "${GREEN}All services stopped.${NC}"
