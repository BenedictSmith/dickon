#!/bin/bash

# SiloBreaker API Test Script
# Tests all GraphQL API endpoints via CURL

set -e

API_URL="${API_URL:-http://localhost:4000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  SiloBreaker API Test Suite${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "API URL: ${CYAN}$API_URL${NC}"
echo ""

# Function to run a GraphQL query and check for errors
run_test() {
    local name=$1
    local query=$2
    local expected_field=$3

    echo -n "Testing: $name... "

    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")

    # Check for GraphQL errors
    if echo "$response" | grep -q '"errors"'; then
        echo -e "${RED}FAILED${NC}"
        echo "  Response: $response"
        ((FAILED++))
        return 1
    fi

    # Check for expected field if provided
    if [ -n "$expected_field" ]; then
        if echo "$response" | grep -q "\"$expected_field\""; then
            echo -e "${GREEN}PASSED${NC}"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}FAILED${NC}"
            echo "  Expected field '$expected_field' not found"
            echo "  Response: $response"
            ((FAILED++))
            return 1
        fi
    fi

    echo -e "${GREEN}PASSED${NC}"
    ((PASSED++))
    return 0
}

# Health check
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  1. Health Check${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Checking API health...${NC}"
if curl -s "$API_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}API is healthy!${NC}"
else
    echo -e "${RED}API is not responding at $API_URL${NC}"
    echo "Make sure the backend is running with: ./scripts/restart-services.sh"
    exit 1
fi
echo ""

# Query tests
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  2. Query Tests${NC}"
echo -e "${CYAN}========================================${NC}"

run_test "Query: databases" \
    "{ databases { id name path } }" \
    "databases"

run_test "Query: jobs" \
    "{ jobs { id status progress } }" \
    "jobs"

run_test "Query: getGraphData" \
    "{ getGraphData { nodes { id label type } edges { source target type } } }" \
    "getGraphData"

run_test "Query: getGraphData with minConfidence filter" \
    "{ getGraphData(input: { minConfidence: 0.5 }) { nodes { id } edges { source target } } }" \
    "getGraphData"

echo ""

# Mutation tests
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  3. Mutation Tests${NC}"
echo -e "${CYAN}========================================${NC}"

run_test "Mutation: startDiscovery" \
    "mutation { startDiscovery { success job { id status } } }" \
    "startDiscovery"

echo -e "${YELLOW}Skipping addDatabase mutation (requires valid SQLite file)${NC}"

echo ""

# Field resolver tests
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  4. Field Resolver Tests${NC}"
echo -e "${CYAN}========================================${NC}"

run_test "Field Resolver: Database.tables" \
    "{ databases { id name tables { id name rowCount } } }" \
    "tables"

run_test "Field Resolver: Job date serialization" \
    "{ jobs { id createdAt updatedAt } }" \
    "createdAt"

echo ""

# Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Test Results Summary${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "Total Tests: $((PASSED + FAILED))"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
