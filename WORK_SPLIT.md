# Work Split: Ben & Carsten

**Strategic division of responsibilities for Phase 1-2 implementation.**

---

## 🎯 Philosophy

**Parallel Development Strategy:**

- Ben focuses on **Backend + Infrastructure** (data layer, services, API)
- Carsten focuses on **Frontend + Visualization** (UI, components, interactions)
- Both follow strict TDD practices
- Regular sync points to integrate work
- Clear interface contracts (GraphQL schema)

**Why this split works:**

1. **Minimizes merge conflicts** - Different file paths
2. **Enables parallel progress** - Independent work streams
3. **Clear ownership** - Each person owns their domain
4. **Natural integration points** - GraphQL API boundary
5. **Skill alignment** - Backend/Frontend specialization

---

## 👨‍💻 Ben's Responsibilities

### Phase 0: Foundation (Current)

- ✅ Repository setup and configuration
- ✅ Documentation structure
- ✅ CI/CD pipeline configuration
- ⏳ **NEXT: Backend project initialization**

### Phase 1: Schema Discovery & Ingestion

#### Epic 1.1: SQLite Schema Extraction (Week 3)

**Owner:** Ben
**Branch:** `feature/epic-1.1-schema-extraction`

**Tasks:**

1. Create `apps/backend/` project structure
   - Initialize TypeScript project
   - Configure tsconfig, package.json
   - Set up Jest for testing

2. Implement SQLiteRepository (TDD)
   - `src/repositories/SQLiteRepository.ts`
   - Connection management
   - Schema metadata queries (`PRAGMA table_info`, `PRAGMA foreign_key_list`)
   - Tests: `tests/unit/repositories/SQLiteRepository.test.ts`

3. Implement SchemaService (TDD)
   - `src/services/SchemaService.ts`
   - Extract database structure
   - Analyze column data types
   - Calculate statistics
   - Tests: `tests/unit/services/SchemaService.test.ts`

4. Create Domain Entities
   - `src/domain/Database.ts`
   - `src/domain/Table.ts`
   - `src/domain/Column.ts`
   - Value objects for types

**Deliverables:**

- [ ] SQLiteRepository with 90%+ coverage
- [ ] SchemaService with 90%+ coverage
- [ ] Domain entities with 95%+ coverage
- [ ] Integration tests with sample databases

**Estimated:** 3-4 days

---

#### Epic 1.2: Neo4j Graph Population (Week 3-4)

**Owner:** Ben
**Branch:** `feature/epic-1.2-neo4j-graph`

**Tasks:**

1. Implement Neo4jRepository (TDD)
   - `src/repositories/Neo4jRepository.ts`
   - Connection pooling with neo4j-driver
   - Cypher query builders
   - Transaction management
   - Tests: `tests/integration/repositories/Neo4jRepository.test.ts`

2. Implement GraphService (TDD)
   - `src/services/GraphService.ts`
   - Create Database nodes
   - Create Table/Column nodes
   - Create REFERENCES relationships
   - Tests: `tests/unit/services/GraphService.test.ts`

3. Integration Testing
   - Test with Neo4j test instance (port 7688)
   - Seed test data
   - Verify graph structure

**Deliverables:**

- [ ] Neo4jRepository with 85%+ coverage
- [ ] GraphService with 90%+ coverage
- [ ] Integration tests passing
- [ ] All three sample databases in Neo4j

**Estimated:** 3-4 days

---

#### Epic 1.3: GraphQL API (Week 4)

**Owner:** Ben
**Branch:** `feature/epic-1.3-graphql-api`

**Tasks:**

1. Define GraphQL Schema
   - `src/schema/schema.graphql`
   - Types: Database, Table, Column
   - Queries: databases, database(id)
   - Mutations: addDatabase(path)

2. Implement Resolvers (TDD)
   - `src/resolvers/DatabaseResolver.ts`
   - `src/resolvers/TableResolver.ts`
   - `src/resolvers/ColumnResolver.ts`
   - DataLoader for batch loading
   - Tests: `tests/unit/resolvers/*.test.ts`

3. Apollo Server Setup
   - `src/server.ts`
   - Configure Apollo Server 4
   - Add logging middleware
   - Add error handling

4. GraphQL Codegen
   - Configure graphql-codegen
   - Generate TypeScript types
   - Update services to use generated types

**Deliverables:**

- [ ] GraphQL schema defined
- [ ] Resolvers with 80%+ coverage
- [ ] Apollo Server running
- [ ] API integration tests
- [ ] Postman/Insomnia collection for testing

**Estimated:** 3-4 days

---

### Phase 2: Relationship Discovery (Week 5-7)

#### Epic 2.1: Column Similarity Analysis (Week 5)

**Owner:** Ben
**Branch:** `feature/epic-2.1-similarity`

**Tasks:**

1. Implement similarity algorithms
   - Levenshtein distance
   - Jaro-Winkler similarity
   - Data type compatibility
   - Tests with extensive examples

2. Implement DiscoveryService
   - Find candidate column pairs
   - Calculate confidence scores
   - Create SIMILAR_TO relationships

**Deliverables:**

- [ ] Similarity algorithms with 95%+ coverage
- [ ] DiscoveryService with 90%+ coverage

**Estimated:** 2-3 days

---

#### Epic 2.2: Value Overlap Detection (Week 6)

**Owner:** Ben
**Branch:** `feature/epic-2.2-value-overlap`

**Tasks:**

1. Sample data from columns
2. Calculate value intersection
3. Foreign key candidate scoring
4. Create LINKS_TO relationships

**Deliverables:**

- [ ] Value overlap detection
- [ ] Confidence scoring
- [ ] Integration tests

**Estimated:** 3-4 days

---

#### Epic 2.3: Discovery Job Management (Week 6-7)

**Owner:** Ben
**Branch:** `feature/epic-2.3-job-management`

**Tasks:**

1. Job queue implementation
2. GraphQL subscription for progress
3. Background job execution

**Deliverables:**

- [ ] Job queue working
- [ ] Progress subscriptions
- [ ] Job status tracking

**Estimated:** 2-3 days

---

## 👨‍💼 Carsten's Responsibilities

### Phase 0: Foundation (Current)

- ⏳ **NEXT: Frontend project initialization**
- ⏳ Review Ben's GraphQL schema design
- ⏳ Set up local development environment

### Phase 1: Schema Discovery & Ingestion

#### Epic 1.4: Schema Explorer UI (Week 4)

**Owner:** Carsten
**Branch:** `feature/epic-1.4-schema-ui`

**Prerequisites:**

- ⚠️ **BLOCKED until Epic 1.3 complete** (needs GraphQL API)
- Can start with mock data and Apollo Client setup

**Tasks:**

1. Frontend Project Setup
   - Initialize Vite + React + TypeScript
   - Configure Apollo Client
   - Set up Tailwind CSS
   - Install shadcn/ui components

2. Database List Component (TDD)
   - `src/components/DatabaseList.tsx`
   - Apollo query for databases
   - Loading/error states
   - Tests: `src/components/DatabaseList.test.tsx`

3. Schema Tree Component (TDD)
   - `src/components/SchemaTree.tsx`
   - Hierarchical display (DB → Tables → Columns)
   - Expand/collapse functionality
   - Tests: `src/components/SchemaTree.test.tsx`

4. Detail Panel Component (TDD)
   - `src/components/DetailPanel.tsx`
   - Show column metadata
   - Display statistics
   - Tests: `src/components/DetailPanel.test.tsx`

5. GraphQL Queries
   - `src/graphql/queries.ts`
   - Use GraphQL Codegen for types
   - Apollo Client cache configuration

**Deliverables:**

- [ ] Frontend running on localhost:5173
- [ ] Database list displaying
- [ ] Schema tree navigable
- [ ] Detail panel showing metadata
- [ ] Component tests with 80%+ coverage

**Estimated:** 4-5 days

---

### Phase 2: Relationship Discovery (Week 5-7)

#### Epic 2.4: Discovery Interface (Week 7)

**Owner:** Carsten
**Branch:** `feature/epic-2.4-discovery-ui`

**Prerequisites:**

- ⚠️ **BLOCKED until Epic 2.3 complete** (needs discovery API)

**Tasks:**

1. Discovery Control Panel
   - Start/stop discovery
   - Configure parameters
   - Progress indicators

2. Discovery Status Display
   - Real-time progress updates
   - GraphQL subscriptions
   - Job status

**Deliverables:**

- [ ] Discovery controls working
- [ ] Real-time progress display
- [ ] Component tests

**Estimated:** 3-4 days

---

#### Epic 2.5: Relationship Visualization (Week 7-8)

**Owner:** Carsten
**Branch:** `feature/epic-2.5-graph-viz`

**Tasks:**

1. D3.js Graph Component
   - Force-directed graph layout
   - Node/edge rendering
   - Zoom/pan controls

2. Relationship Display
   - Show discovered relationships
   - Confidence indicators
   - Interactive exploration

**Deliverables:**

- [ ] Interactive graph visualization
- [ ] Relationship filtering
- [ ] Performance optimization

**Estimated:** 4-5 days

---

## 🤝 Integration Points

### Week 4: Phase 1 Integration

**Meeting:** Sync after Epic 1.3 complete

**Agenda:**

1. Ben: Demo GraphQL API with Postman
2. Carsten: Test API from frontend
3. Verify schema matches frontend needs
4. Deploy to shared development environment

**Deliverable:** Integrated Phase 1 demo

---

### Week 7: Phase 2 Integration

**Meeting:** Sync after Epic 2.3 complete

**Agenda:**

1. Ben: Demo discovery API
2. Carsten: Test subscriptions
3. Verify real-time updates work
4. Performance testing

**Deliverable:** Integrated Phase 2 demo

---

## 📋 Shared Responsibilities

### Both Ben & Carsten

**Code Review:**

- Review each other's PRs within 24 hours
- Verify tests are comprehensive
- Check architectural compliance
- Ensure documentation is clear

**Documentation:**

- Update relevant docs when making changes
- Document decisions in ADRs
- Keep PROJECT_STATE.md updated

**Testing:**

- Maintain 80%+ coverage across all code
- Write tests BEFORE implementation (TDD)
- Add integration tests at boundaries

**Communication:**

- Daily async updates (GitHub comments/discussions)
- Weekly sync meetings (Monday planning, Friday demo)
- Unblock each other quickly on Slack/Discord

---

## 🗓️ Timeline Overview

### Week 3

- **Ben:** Epic 1.1 (SQLite extraction) + Epic 1.2 start
- **Carsten:** Frontend setup, mock UI development

### Week 4

- **Ben:** Epic 1.2 complete + Epic 1.3 (GraphQL API)
- **Carsten:** Epic 1.4 (Schema UI) with real API

**Milestone:** Phase 1 Complete - Schema ingestion working end-to-end

### Week 5

- **Ben:** Epic 2.1 (Similarity algorithms)
- **Carsten:** Polish Phase 1 UI, prepare for Phase 2

### Week 6

- **Ben:** Epic 2.2 (Value overlap) + Epic 2.3 start
- **Carsten:** Begin Epic 2.4 (Discovery UI) with mocks

### Week 7

- **Ben:** Epic 2.3 complete (Job management)
- **Carsten:** Epic 2.4 complete + Epic 2.5 start

### Week 8

- **Ben:** Performance optimization, bug fixes
- **Carsten:** Epic 2.5 complete (Visualization)

**Milestone:** Phase 2 Complete - Relationship discovery working end-to-end

---

## 🚨 Risk Mitigation

### Carsten Blocked on Backend API

**Scenario:** Carsten needs API but Ben's work delayed

**Mitigation:**

1. Use GraphQL mocks (MSW - Mock Service Worker)
2. Define schema contract early
3. Carsten proceeds with mock data
4. Swap to real API when ready

**Example:**

```typescript
// Mock GraphQL responses
const mocks = {
  Query: () => ({
    databases: () => [
      { id: '1', name: 'Chinook', path: '/data/chinook.db' },
      { id: '2', name: 'Northwind', path: '/data/northwind.db' },
    ],
  }),
};
```

---

### Ben Blocked on Requirements Clarification

**Scenario:** Ben unsure about frontend requirements

**Mitigation:**

1. Carsten creates UI mockups/wireframes
2. Define data needs in GitHub issues
3. Over-communicate via comments
4. Quick Slack call if needed

---

### Merge Conflicts

**Scenario:** Both touch same files (unlikely with this split)

**Mitigation:**

1. Pull master frequently
2. Keep PRs small and focused
3. Merge master into feature branches daily
4. Coordinate on shared files (GraphQL schema, types)

---

## 🎯 Success Metrics

### Week 4 (Phase 1)

- [ ] All three databases ingested into Neo4j
- [ ] GraphQL API responds to queries
- [ ] Frontend displays schema tree
- [ ] 80%+ test coverage
- [ ] CI pipeline green

### Week 8 (Phase 2)

- [ ] Relationship discovery runs successfully
- [ ] Frontend visualizes discovered relationships
- [ ] Real-time progress updates work
- [ ] Performance acceptable (<10s for discovery)
- [ ] 80%+ test coverage maintained

---

## 📞 Communication Channels

**Daily Updates:**

- GitHub PR comments
- GitHub discussions for questions

**Weekly Sync:**

- Monday 9 AM: Planning (30 min)
- Friday 3 PM: Demo + Retrospective (60 min)

**Emergency/Blockers:**

- Slack/Discord for immediate needs
- Tag in GitHub issues with `@BenedictSmith` or `@Carsten`

---

## 🛠️ Development Environment Checklist

### Ben's Environment

- [ ] Node.js 20+ installed
- [ ] Docker running Neo4j
- [ ] VSCode with TypeScript extensions
- [ ] Postman/Insomnia for API testing
- [ ] Sample SQLite databases in `data/`

### Carsten's Environment

- [ ] Node.js 20+ installed
- [ ] Docker running Neo4j (for integration testing)
- [ ] VSCode with React/TypeScript extensions
- [ ] React DevTools browser extension
- [ ] Apollo Client DevTools
- [ ] Access to Ben's deployed API (or running locally)

---

## 📚 Reference Documentation

**For Ben:**

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [TESTING.md](docs/TESTING.md) - TDD strategy
- [SILOBREAKER.md](docs/SILOBREAKER.md) - Technical details
- [Neo4j Driver Docs](https://neo4j.com/docs/javascript-manual/current/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)

**For Carsten:**

- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Workflow
- [TESTING.md](docs/TESTING.md) - TDD strategy
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [D3.js Docs](https://d3js.org/)

---

**Remember:** This is a collaborative project. Help each other, communicate frequently, and celebrate wins together! 🎉
