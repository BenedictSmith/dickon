# Handoff Document for Carsten

**Date:** 2025-01-29
**Project:** Dickon - SQLite Data Discovery & Federation Platform
**Status:** Development - Phase 4 Complete, Ready for Phase 5

---

## 🎯 Current State

The system is **fully operational** with the following capabilities:

### ✅ What's Working

1. **Database Ingestion** - Add SQLite databases and extract full schema
2. **Schema Storage** - Neo4j graph database stores all metadata
3. **Discovery Engine** - Finds similar columns across databases (2,221 relationships found)
4. **Graph Visualization** - Interactive D3.js force-directed graph
5. **Job Management** - Background job system with progress tracking
6. **Federated Queries** - Query across multiple databases with caching
7. **Modern UI** - React frontend with glassmorphism design

### 📊 System Stats

- **3 databases** loaded (Chinook, Northwind, Sakila)
- **40 tables** across all databases
- **241 columns** total
- **2,221 similarity relationships** discovered (≥50% confidence)
- **Fully functional** backend and frontend

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + TypeScript + Apollo Client + D3.js                 │
│  Location: apps/frontend/                                   │
│  Port: 5173                                                 │
└─────────────────────────────────────────────────────────────┘
                             ↕ GraphQL
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  Node.js + TypeScript + Apollo Server                       │
│  Location: apps/backend/                                    │
│  Port: 4000                                                 │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                        Neo4j Database                        │
│  Graph database for schema and relationships                │
│  Port: 9687 (bolt), 9474 (http)                            │
│  Docker: dickon-neo4j                                       │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                      SQLite Databases                        │
│  Actual data storage (Chinook, Northwind, Sakila)          │
│  Location: data/                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start

```bash
# 1. Start Neo4j
docker compose up -d

# 2. Install dependencies
npm install

# 3. Start backend (from project root)
cd apps/backend
NEO4J_URI=bolt://localhost:9687 NEO4J_PASSWORD=dickon-ktb3 npm run dev

# 4. Start frontend (new terminal, from project root)
cd apps/frontend
npm run dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend GraphQL: http://localhost:4000
# Neo4j Browser: http://localhost:9474 (neo4j / dickon-ktb3)
```

### Verify Everything Works

1. Open http://localhost:5173
2. You should see the dashboard with 3 databases
3. Click "Knowledge Graph" tab - see 284 nodes, 2502 edges
4. Click filter buttons (Similarity, FK References) to explore
5. The "Discovery Results" panel shows job history

---

## 📁 Project Structure

```
dickon/
├── apps/
│   ├── backend/              # Node.js GraphQL API
│   │   ├── src/
│   │   │   ├── domain/       # Domain entities (Database, Table, Column, Job)
│   │   │   ├── repositories/ # Data access (Neo4j, SQLite)
│   │   │   ├── services/     # Business logic (Discovery, Schema, Graph)
│   │   │   ├── resolvers/    # GraphQL resolvers
│   │   │   ├── schema/       # GraphQL schema definitions
│   │   │   └── server.ts     # Apollo Server setup
│   │   └── tests/            # Unit and integration tests
│   │
│   └── frontend/             # React UI
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── graphql/      # GraphQL queries/mutations
│       │   ├── types/        # TypeScript types
│       │   └── App.tsx       # Main app
│       └── tests/            # Component tests
│
├── data/                     # SQLite databases (gitignored)
├── docs/                     # Documentation
├── docker-compose.yml        # Neo4j setup
├── ROADMAP.md               # Current development plan
├── FUTURE_ROADMAP.md        # Advanced features vision
└── HANDOFF.md               # This document
```

---

## 🔑 Key Concepts

### Domain-Driven Design

The codebase follows DDD principles:

- **Entities:** `Database`, `Table`, `Column`, `Job`
- **Repositories:** Data access abstraction (`Neo4jRepository`, `SQLiteRepository`)
- **Services:** Business logic (`GraphService`, `SchemaService`, `DiscoveryService`, `JobManager`)
- **Resolvers:** GraphQL API layer

### Discovery Algorithm

Located in: `apps/backend/src/services/DiscoveryService.ts`

**How it works:**
1. Fetch all columns from Neo4j
2. Compare every column name to every other (using Levenshtein distance)
3. If similarity ≥ 50%, create `SIMILAR_TO` relationship
4. Store confidence score (0.0-1.0) on relationship
5. Jobs run in background with progress tracking

**Current limitation:** Only name-based matching (see FUTURE_ROADMAP.md for AI improvements)

### Graph Data Structure

**Neo4j Schema:**
```cypher
(Database)-[:HAS_TABLE]->(Table)-[:HAS_COLUMN]->(Column)
(Column)-[:SIMILAR_TO {confidence: 0.85, discoveredAt: "..."}]->(Column)
(Column)-[:REFERENCES]->(Column)  // Foreign keys (future)
```

### Federated Queries

Located in: `apps/backend/src/services/FederationService.ts`

**Capabilities:**
- Cross-database SELECT queries
- Auto-detected JOIN conditions (based on SIMILAR_TO relationships)
- Result caching with invalidation
- Executed via in-memory DuckDB for performance

---

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only

# Frontend tests
cd apps/frontend
npm test
```

**Test Coverage:**
- Domain entities: 100%
- Services: ~80%
- Repositories: ~70%
- Resolvers: Needs improvement
- Frontend components: ~60%

---

## 🐛 Known Issues & Gotchas

### 1. Backend Hot Reload

**Issue:** `tsx watch` auto-reloads on `.ts` file changes but NOT on `.graphql` schema changes.

**Workaround:** Manually restart backend after editing `apps/backend/src/schema/schema.graphql`

### 2. Neo4j Integer Parameters

**Issue:** Neo4j requires proper integer types, JavaScript floats cause errors.

**Solution:** Always use `neo4j.int(value)` when passing integer parameters. See `Neo4jRepository.ts:473`

### 3. Discovery Job Limits

**Issue:** Discovery is O(n²) - 241 columns = 58k comparisons. Scales poorly.

**Workaround:** Current implementation is fine for <500 columns. For larger datasets, needs optimization (batch processing, parallel execution).

### 4. Empty FK References

**Issue:** SQLite databases rarely have formal foreign key constraints defined.

**Explanation:** The "FK References" filter shows empty graph because test databases don't have FKs. The infrastructure is there, just no data.

### 5. Git Hooks Not Executable

**Issue:** Husky pre-commit hooks show warnings.

**Fix:**
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

---

## 📋 Roadmap

### Phase 4: Core Functionality ✅ COMPLETE

All features implemented and working:
- ✅ Epic 4.1: Federated Query Engine
- ✅ Epic 4.2: Discovery Job Management
- ✅ Epic 4.3: Basic Graph Visualization

### Phase 5: Next Steps (See ROADMAP.md)

**Priority order:**
1. **Epic 5.1:** Query Builder UI
2. **Epic 5.2:** Data Profiling Dashboard
3. **Epic 5.3:** Relationship Validation
4. **Epic 5.4:** Enhanced Visualization
5. **Epic 5.5:** Export & Integration

**Estimated effort:** 4-6 weeks for complete Phase 5

### Future Vision (See FUTURE_ROADMAP.md)

Long-term ideas include:
- AI-powered semantic discovery
- Natural language queries
- Multi-database type support (PostgreSQL, MongoDB, etc.)
- Real-time monitoring and alerting
- Privacy & compliance automation

---

## 🔧 Configuration

### Environment Variables

**Backend:**
```bash
NEO4J_URI=bolt://localhost:9687
NEO4J_USER=neo4j              # Default
NEO4J_PASSWORD=dickon-ktb3
PORT=4000                      # Optional, defaults to 4000
```

**Frontend:**
```bash
VITE_API_URL=http://localhost:4000  # Optional, defaults to localhost:4000
```

### Neo4j Configuration

Connection details:
- **Bolt URL:** bolt://localhost:9687
- **HTTP URL:** http://localhost:9474
- **Username:** neo4j
- **Password:** dickon-ktb3

### Docker Compose

Neo4j runs in Docker with:
- Persistent volume: `neo4j_data`
- Ports: 9687 (bolt), 9474 (http)
- Memory: 512MB heap, 1GB total

---

## 📝 Common Tasks

### Add a New Database

```typescript
// Via GraphQL mutation
mutation {
  addDatabase(input: {
    name: "MyDatabase"
    path: "/absolute/path/to/database.db"
  }) {
    success
    database { id name }
    error
  }
}
```

**Or via frontend:**
1. Click "Add Database" button (when implemented)
2. Enter name and path
3. System extracts schema automatically

### Run Discovery

```typescript
// Via GraphQL mutation
mutation {
  startDiscovery {
    success
    job { id status progress }
    error
  }
}
```

**Or via frontend:**
1. Click "Start Discovery" button
2. Monitor progress in "Discovery Results" panel
3. Results appear in graph automatically

### Query Neo4j Directly

```bash
# Via Docker
docker exec -it dickon-neo4j cypher-shell -u neo4j -p dickon-ktb3

# Count nodes
MATCH (n) RETURN labels(n) as type, count(n) as count;

# See all relationships
MATCH ()-[r]->() RETURN type(r), count(r);

# View similar columns
MATCH (c1:Column)-[r:SIMILAR_TO]->(c2:Column)
WHERE r.confidence > 0.7
RETURN c1.name, c2.name, r.confidence
LIMIT 10;
```

### Clear Neo4j and Restart

```bash
# Stop Neo4j
docker compose down

# Delete data
docker volume rm dickon_neo4j_data

# Restart
docker compose up -d

# Re-add databases via API
```

---

## 🆘 Troubleshooting

### Backend Won't Start

**Error:** "Cannot connect to Neo4j"

**Solution:**
1. Check Neo4j is running: `docker ps | grep neo4j`
2. Check ports: `netstat -an | grep 9687`
3. Verify password: Try connecting via Neo4j Browser
4. Check environment variables

### Frontend Shows No Data

**Error:** Blank graph or "Loading..."

**Solution:**
1. Check backend is running on port 4000
2. Open browser console for errors
3. Check GraphQL endpoint: http://localhost:4000/
4. Verify databases are loaded: Run `databases` query

### Discovery Finds 0 Relationships

**Error:** Job completes but relationshipsCreated = 0

**Solution:**
1. Check databases are loaded: Query Neo4j for `(d:Database)`
2. Check tables exist: `MATCH (t:Table) RETURN count(t)`
3. Check columns exist: `MATCH (c:Column) RETURN count(c)`
4. If counts are 0, re-add databases (schema extraction likely failed)

### Graph Visualization Shows Errors

**Error:** "node not found: [id]" in console

**Solution:**
- This was fixed in commit `6471ebb`
- If you see this, ensure you're on latest master
- The fix ensures all nodes referenced by edges are included

---

## 📚 Key Files to Understand

### Backend

**Core Services:**
- `apps/backend/src/services/DiscoveryService.ts` - Discovery algorithm
- `apps/backend/src/services/GraphService.ts` - Neo4j graph operations
- `apps/backend/src/services/SchemaService.ts` - SQLite schema extraction
- `apps/backend/src/services/FederationService.ts` - Cross-database queries
- `apps/backend/src/services/JobManager.ts` - Background job system

**Data Access:**
- `apps/backend/src/repositories/Neo4jRepository.ts` - All Neo4j queries
- `apps/backend/src/repositories/SQLiteRepository.ts` - SQLite schema reading

**API Layer:**
- `apps/backend/src/resolvers/index.ts` - GraphQL resolvers
- `apps/backend/src/schema/schema.graphql` - GraphQL schema

### Frontend

**Main Components:**
- `apps/frontend/src/components/GraphVisualization.tsx` - D3.js graph
- `apps/frontend/src/components/RelationshipReviewPanel.tsx` - Job results
- `apps/frontend/src/components/DatabasePanel.tsx` - Database list
- `apps/frontend/src/App.tsx` - Main layout

**GraphQL:**
- `apps/frontend/src/graphql/queries.ts` - All queries
- `apps/frontend/src/graphql/mutations.ts` - All mutations (future)

---

## 🎓 Learning Resources

### Technologies Used

- **TypeScript:** https://www.typescriptlang.org/docs/
- **Node.js:** https://nodejs.org/docs/
- **React:** https://react.dev/
- **Apollo GraphQL:** https://www.apollographql.com/docs/
- **Neo4j:** https://neo4j.com/docs/
- **D3.js:** https://d3js.org/
- **DuckDB:** https://duckdb.org/docs/

### Design Patterns

- **Domain-Driven Design:** Eric Evans' "Domain-Driven Design" book
- **Repository Pattern:** Martin Fowler's patterns catalog
- **Force-Directed Graphs:** D3.js force simulation documentation

---

## 🤝 Contributing

### Code Style

- TypeScript strict mode enabled
- ESLint for linting (some rules need fixing)
- Prettier for formatting (configure .prettierrc)
- Follow existing patterns (DDD, service layer, etc.)

### Commit Messages

Format: `<type>: <description>`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `chore:` Build/tooling

**Example:** `feat: add natural language query interface`

### Pull Requests

1. Create feature branch from master
2. Implement feature with tests
3. Update documentation
4. Create PR with clear description
5. Link to relevant issues

---

## 📞 Contact & Questions

**Project Repository:** https://github.com/BenedictSmith/dickon

**Original Developer:** Benedict Smith

**Handoff To:** Carsten

**Questions?** Create an issue in the GitHub repository or check existing documentation.

---

## ✅ Handoff Checklist

- [x] All code committed to master
- [x] System fully operational
- [x] Documentation complete (README, ROADMAP, FUTURE_ROADMAP, HANDOFF)
- [x] Tests passing
- [x] No critical bugs
- [x] Sample databases loaded (Chinook, Northwind, Sakila)
- [x] Discovery finding relationships (2,221 found)
- [x] Graph visualization working
- [x] Neo4j populated with data

**Status:** ✅ **READY FOR HANDOFF**

---

*Last Updated: 2025-01-29*
*Generated with assistance from Claude Code*
