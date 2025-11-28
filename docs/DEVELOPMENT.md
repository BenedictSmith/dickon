# Development Guide - SiloBreaker

This document contains essential information for developers working on SiloBreaker, including setup, architecture decisions, and best practices.

## Quick Start for Developers

### Prerequisites

- **Node.js 20+** (required for sql.js compatibility)
- **Docker & Docker Compose** (for Neo4j)
- **Git**

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/BenedictSmith/dickon.git
cd dickon

# Install dependencies
npm install

# Start Neo4j
docker-compose up -d

# Start all services
./scripts/restart-services.sh

# Verify everything works
./scripts/test-api.sh
```

### Development Scripts

The project includes helper scripts in `scripts/`:

| Script | Description |
|--------|-------------|
| `./scripts/restart-services.sh` | Stops and restarts all services cleanly |
| `./scripts/restart-services.sh --backend-only` | Restart only backend |
| `./scripts/restart-services.sh --frontend-only` | Restart only frontend |
| `./scripts/stop-services.sh` | Stop all running services |
| `./scripts/test-api.sh` | Test all GraphQL API endpoints via CURL |

### Service Ports

- **Backend GraphQL API**: http://localhost:4000
- **Frontend**: http://localhost:5173
- **Neo4j Browser**: http://localhost:9474
- **Neo4j Bolt**: bolt://localhost:7687

### Environment Variables

```bash
# Neo4j connection (required for backend)
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=tstpwdpwd
```

---

## Architecture Decisions

### SQLite Library Migration: better-sqlite3 → sql.js

**Date**: November 2025
**Status**: Implemented

#### Context

The original implementation used `better-sqlite3`, a native Node.js addon that provides synchronous SQLite bindings. However, Node.js v25.2.1 introduced compatibility issues with native addons, causing build failures.

#### Decision

Migrated from `better-sqlite3` to `sql.js`, a pure JavaScript/WebAssembly implementation of SQLite.

#### Consequences

**Positive:**
- No native compilation required
- Works on all platforms without build tools
- Compatible with newer Node.js versions (v20+)
- Works in browsers (future-proofs for potential client-side usage)

**Negative:**
- Slightly higher memory usage (entire database loaded into memory)
- Synchronous API differences required code changes
- File I/O handled differently (manual file reads/writes)

#### Migration Details

**Package.json Changes:**
```json
// OLD (apps/backend/package.json)
"dependencies": {
  "better-sqlite3": "^9.2.2"
},
"devDependencies": {
  "@types/better-sqlite3": "^7.6.8"
}

// NEW
"dependencies": {
  "sql.js": "^1.12.0"
},
"devDependencies": {
  "@types/sql.js": "^1.4.9"
}
```

**Code Changes:**
```typescript
// OLD: better-sqlite3
import Database from 'better-sqlite3';
const db = new Database(path);
const rows = db.prepare('SELECT * FROM table').all();
db.close();

// NEW: sql.js
import initSqlJs from 'sql.js';
const SQL = await initSqlJs();
const filebuffer = fs.readFileSync(path);
const db = new SQL.Database(filebuffer);
const result = db.exec('SELECT * FROM table');
const rows = result[0]?.values || [];
db.close();
```

---

## Test-Driven Development (TDD)

SiloBreaker strictly follows TDD principles. **No new functionality is added without writing a test first.**

### TDD Workflow

```
1. 🔴 RED    - Write a failing test
2. 🟢 GREEN  - Write minimal code to pass
3. 🔵 BLUE   - Refactor while keeping tests green
```

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only (requires Neo4j)
npm run test:integration

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:unit -- --coverage
```

### Test Coverage Requirements

| Layer | Minimum Coverage |
|-------|-----------------:|
| Domain Entities | 95% |
| Services | 90% |
| Repositories | 85% |
| Resolvers | 80% |
| Utilities | 90% |
| Overall | 80% |

---

## Code Quality Checks

Before committing:

```bash
# TypeScript compilation
npm run type-check

# ESLint
npm run lint

# All tests
npm test

# Format code
npm run format
```

Pre-commit hooks automatically run type-check, lint, and unit tests.
