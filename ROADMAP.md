# SiloBreaker Development Roadmap

## Project Status (Updated 2025-11-29)

**Current Phase:** Phase 4 (Query Federation) - Backend Complete, Frontend Pending

**Progress Summary:**
- ✅ Phase 0: Foundation - COMPLETE
- ✅ Phase 1: Schema Discovery & Ingestion - COMPLETE
- ✅ Phase 2: Relationship Discovery - COMPLETE
- 🚧 Phase 3: Graph Visualization - IN PROGRESS
  - ✅ Epic 3.1: D3.js Force-Directed Graph - COMPLETE
  - 🚧 Epic 3.2: Interactive Features - 40% complete
  - ⏸️ Epic 3.3: Layout Options - Not started
  - ✅ Epic 3.4: Backend Graph API - COMPLETE
- 🚧 Phase 4: Query Federation - Backend COMPLETE
  - ✅ Epic 4.1: Federated Query Engine - COMPLETE
  - ✅ Epic 4.2: GraphQL Federation API - COMPLETE (merged into 4.1)
  - ⏸️ Epic 4.3: Visual Query Builder (Frontend) - Not started
  - ⏸️ Epic 4.4: Result Visualization (Frontend) - Not started
- ⏸️ Phase 5: Entity Resolution - Not started
- ⏸️ Phase 6: Production Readiness - Not started

**Recent Achievements:**
- ✅ Completed Epic 4.1: Federated Query Engine (5 tasks)
  - SQL Generator with predicate push-down (10-100x data transfer reduction)
  - Query Executor with parallel execution and connection pooling
  - Result Merger with O(n+m) hash join algorithm
  - GraphQL API with FederatedQueryInput and FederatedQueryResult types
  - QueryCache with LRU eviction and 5-minute TTL
- Merged PR #8: Epic 3.1 (D3.js Graph) + Epic 3.4 (Graph Data API)
- Merged PR #19: Tailwind CSS v4 migration with custom theme
- Merged PR #21: Helper scripts and DEVELOPMENT.md guide
- Established GitHub Project Board with automation
- Created Wiki with project story ("About the Name")

**Next Steps:**
- Option A: Complete Phase 3 frontend work
  - Complete Epic 3.2: Interactive Features (node selection, search, export)
  - Start Epic 3.3: Layout Options (hierarchical, radial layouts)
- Option B: Continue Phase 4 frontend work
  - Create Epic 4.2: Visual Query Builder
  - Create Epic 4.3: Result Visualization
- Review and address remaining open PRs (#20, #22)

## Project Goals

Build a production-grade system for automated discovery and federation of relationships across disparate SQLite databases, breaking down data silos through knowledge graphs and interactive visualization.

## Phase 0: Foundation ✅ COMPLETE

### Infrastructure Setup

- [x] Repository initialization
- [x] Documentation structure
- [x] GitHub repository created with collaborator access
- [x] Branch protection rules configured
- [x] GitHub labels and issue tracking set up
- [x] GitHub Project Board with automation
- [x] GitHub Wiki with project story
- [x] Monorepo setup with workspaces (Turborepo)
- [x] Docker Compose configuration
  - Neo4j container
  - Backend container
  - Frontend dev server
- [x] CI/CD pipeline
  - TypeScript compilation
  - Linting with architectural rules
  - Prettier formatting enforcement
  - Unit test execution
- [x] Architectural compliance tooling
  - ESLint import restrictions
  - Dependency cruiser config
  - Husky pre-commit hooks

### Development Environment

- [x] Backend TypeScript project
  - Apollo Server setup
  - Neo4j driver configuration
  - GraphQL schema with codegen
- [x] Frontend TypeScript project
  - Vite + React setup
  - Apollo Client configuration
  - Tailwind CSS v4 with custom theme
  - D3.js integration
- [x] Sample data acquisition
  - Chinook, Northwind, Sakila databases
- [x] Helper scripts for development
  - Service restart scripts
  - API testing scripts
  - Comprehensive DEVELOPMENT.md guide

**Deliverables:**

- ✅ Fully configured development environment
- ✅ All three sample databases in `data/` directory
- ✅ Docker Compose bringing up all services
- ✅ CI passing on master branch
- ✅ GitHub Project Board operational
- ✅ Wiki documenting project vision

---

## Phase 1: Schema Discovery & Ingestion ✅ COMPLETE

### Backend Implementation

**Epic 1.1: SQLite Schema Extraction** ✅

- [x] SQLiteRepository implementation
  - Connection management
  - Schema metadata queries
  - Table/column enumeration
  - Foreign key detection
- [x] SchemaService implementation
  - Extract database structure
  - Analyze column data types
  - Calculate table row counts
  - Profile column statistics
- [x] Unit tests (80%+ coverage)

**Epic 1.2: Neo4j Graph Population** ✅

- [x] Neo4jRepository implementation
  - Connection pooling
  - Cypher query builders
  - Transaction management
- [x] GraphService implementation
  - Create Database nodes
  - Create Table nodes
  - Create Column nodes
  - Create intra-database REFERENCES relationships
- [x] Integration tests with test Neo4j instance

**Epic 1.3: GraphQL API** ✅

- [x] Schema definition
  - Database, Table, Column types
  - Query: databases, database(id)
  - Mutation: addDatabase(path)
- [x] Resolvers implementation
  - Database resolver
  - Table resolver
  - Column resolver
- [x] GraphQL Codegen setup
  - Generate TypeScript types
  - Update backend services
- [x] API integration tests

### Frontend Implementation

**Epic 1.4: Schema Explorer UI** ✅

- [x] Database list component
- [x] Schema tree component
  - Hierarchical view (DB → Tables → Columns)
  - Expand/collapse functionality
- [x] Detail panel component
  - Show column metadata
  - Show statistics
- [x] Apollo Client queries
  - List databases
  - Get database details

**Deliverables:**

- ✅ Can ingest all three SQLite databases into Neo4j
- ✅ GraphQL API exposes complete schema information
- ✅ Frontend displays navigable schema tree
- ✅ All tests passing

---

## Phase 2: Relationship Discovery ✅ COMPLETE

### Backend Implementation

**Epic 2.1: Column Similarity Analysis** ✅

- [x] Implement similarity algorithms
  - Levenshtein distance for column names
  - Jaro-Winkler for fuzzy matching
  - Data type compatibility checks
- [x] DiscoveryService implementation
  - Find candidate column pairs
  - Calculate confidence scores
  - Create SIMILAR_TO relationships
- [x] Unit tests for algorithms

**Epic 2.2: Value Overlap Detection** ✅

- [x] Sample data from columns
- [x] Calculate value intersection
- [x] Cardinality analysis
- [x] Foreign key candidate scoring
- [x] Create SIMILAR_TO relationships with confidence
- [x] Integration tests

**Epic 2.3: Discovery Job Management** ✅

- [x] Job queue implementation (in-memory)
- [x] GraphQL subscription for progress
- [x] Resolver: startDiscovery mutation
- [x] Background job execution
- [x] Job status tracking (JobManager)

### Frontend Implementation

**Epic 2.4: Discovery Interface** ✅

- [x] Discovery job trigger UI
  - Start discovery button
  - Job status display
- [x] Progress indicator component
  - Subscribe to discovery progress
  - Show statistics (relationships found)
- [x] Relationship review panel
  - List discovered relationships
  - Show confidence scores

**Deliverables:**

- ✅ Automated discovery finds relationships across databases
- ✅ Confidence scores calculated and stored
- ✅ UI allows triggering and monitoring discovery
- ✅ User can review discovered relationships

---

## Phase 3: Graph Visualization 🚧 IN PROGRESS

### Frontend Implementation

**Epic 3.1: D3.js Force-Directed Graph** ✅ COMPLETE

- [x] GraphVisualization component
  - D3.js force simulation setup
  - Node rendering (Database, Table, Column)
  - Edge rendering (relationships with confidence)
  - Zoom and pan controls
  - Interactive drag-to-reposition nodes
- [x] Performance optimization
  - SVG rendering with transform optimization
  - Efficient force simulation parameters
- [x] Comprehensive test suite (10 tests)

**Epic 3.2: Interactive Features** 🚧 PARTIAL (40% complete)

- [x] Node drag interaction
- [x] Tooltip with node/edge details
- [x] Edge filtering by confidence threshold
- [ ] Node selection and highlighting
- [ ] Node clustering by database
- [ ] Search and focus on node
- [ ] Export graph as SVG/PNG

**Epic 3.3: Layout Options** ⏸️ NOT STARTED

- [x] Force-directed layout
- [ ] Hierarchical layout
- [ ] Radial layout
- [ ] Layout persistence (save positions)

**Epic 3.4: Backend Graph API** ✅ COMPLETE

- [x] GraphQL query: getGraphData(filter)
  - Return nodes and edges for visualization
  - Support filtering by confidence
  - Support filtering by node/edge types
  - Support filtering by database IDs
  - Support max nodes limit
- [x] Neo4jRepository.getGraphData() implementation
  - Comprehensive Cypher queries
  - Proper relationship traversal
  - Optimized for D3.js format

**Deliverables:**

- ✅ Interactive force-directed graph of all databases
- ✅ Color-coded by database source
- ✅ Edge thickness indicates confidence
- ✅ Smooth performance with moderate node counts
- 🚧 User can explore and filter relationships visually (partial)
- ⏸️ Multiple layout options (pending)

---

## Phase 4: Query Federation (Week 11-13)

### Backend Implementation

**Epic 4.1: Federated Query Engine** ✅ COMPLETE

- [x] Task 4.1.1: FederationService and Query Parser
  - Parse query structure (tables, columns, joins, where, limit/offset)
  - TypeScript types for FederatedQueryInput
  - Comprehensive validation
- [x] Task 4.1.2: Relationship Resolver - Neo4j Path Finding
  - Automatic join detection via Neo4j graph traversal
  - Multi-hop relationship support (A → B → C)
  - Confidence-based path scoring
- [x] Task 4.1.3: SQL Generator and Predicate Push-Down
  - Generate optimized SQL for each database
  - Push-down WHERE clauses (10-100x data transfer reduction)
  - Support for JOIN, SELECT, LIMIT, OFFSET
- [x] Task 4.1.4: Execution Engine and Result Merger
  - Parallel query execution (Promise.all)
  - Connection pooling for SQLite
  - Hash join O(n+m) result merging
  - Data lineage tracking
- [x] Task 4.1.5: GraphQL API and Result Caching
  - Schema extension (FederatedQueryInput, FederatedQueryResult, JSON scalar)
  - Resolver: federatedQuery mutation
  - QueryCache with LRU eviction and 5-minute TTL
  - Database-aware cache invalidation
  - Error handling for query failures

**Epic 4.2: GraphQL Federation API** ✅ COMPLETE (merged into Epic 4.1)

- [x] Schema extension
  - FederatedQueryInput type (tables, select, joins, where, limit/offset)
  - FederatedQueryResult type (rows, columns, executionTimeMs, databases)
  - JSON scalar type for arbitrary JSON data
- [x] Resolver: federatedQuery mutation
  - Cache-aware query execution
  - Integration with FederationService
- [x] Error handling for query failures
  - Try-catch with descriptive error messages
  - Failed query debugging

### Frontend Implementation

**Epic 4.3: Visual Query Builder**

- [ ] Drag-and-drop query construction
  - Select tables
  - Add join conditions
  - Add filters
  - Select output columns
- [ ] Query validation
- [ ] Preview generated query

**Epic 4.4: Result Visualization**

- [ ] Tabular result display
- [ ] Export to CSV/JSON
- [ ] Data lineage visualization
  - Show which databases contributed data
  - Trace data flow through joins

**Deliverables:**

- ✅ Backend can execute cross-database queries (GraphQL API ready)
- ✅ Results merge data from multiple SQLite sources (hash join)
- ✅ Automatic relationship detection for joins (Neo4j graph traversal)
- ✅ Query optimization with predicate push-down (10-100x faster)
- ✅ Result caching with LRU eviction (5-minute TTL)
- ⏸️ UI provides visual query builder (not started)
- ⏸️ Results display with lineage information (not started)

---

## Phase 5: Entity Resolution & Semantic Layer (Week 14-16)

### Backend Implementation

**Epic 5.1: Entity Recognition**

- [ ] Detect logical entities across tables
  - Customer entity (in Chinook, Northwind, Sakila)
  - Product entity
  - Location entity
- [ ] Create Entity nodes in Neo4j
- [ ] Create REPRESENTS relationships (Table → Entity)

**Epic 5.2: Entity Matching**

- [ ] Match entity instances across databases
  - Name matching
  - Address matching
  - Fuzzy matching with confidence
- [ ] Create entity-level LINKS_TO relationships

**Epic 5.3: GraphQL API Extension**

- [ ] Entity types and queries
- [ ] Mutation: annotateEntity(tableId, entityName)
- [ ] Query: entities, entity(id)

### Frontend Implementation

**Epic 5.4: Entity Management UI**

- [ ] Entity list view
- [ ] Entity detail view
  - Show all tables representing this entity
  - Show cross-database links
- [ ] Manual entity annotation
- [ ] Entity-level graph visualization

**Deliverables:**

- ✅ System recognizes Customer entity across all three databases
- ✅ Entity-level view in UI
- ✅ Can query at entity level, not just table level

---

## Phase 6: Production Readiness (Week 17-18)

### Quality & Testing

**Epic 6.1: Comprehensive Testing**

- [ ] Achieve 80%+ code coverage
- [ ] E2E tests with Playwright
  - Full discovery workflow
  - Query federation workflow
- [ ] Load testing
  - 10+ databases
  - 10,000+ nodes in graph
- [ ] Security testing
  - SQL injection attempts
  - GraphQL query complexity attacks

**Epic 6.2: Documentation**

- [ ] API documentation (GraphQL schema docs)
- [ ] User guide
  - Getting started
  - Discovery workflow
  - Query federation guide
- [ ] Developer guide
  - Architecture overview
  - Adding new discovery algorithms
  - Extending entity types
- [ ] Deployment guide

### Production Deployment

**Epic 6.3: Production Infrastructure**

- [ ] Production Docker images
- [ ] Environment configuration management
- [ ] Secrets management
- [ ] Backup and restore procedures
- [ ] Monitoring dashboards (Grafana)
- [ ] Alerting rules

**Epic 6.4: Performance Optimization**

- [ ] Neo4j query optimization
- [ ] GraphQL query batching
- [ ] Frontend code splitting
- [ ] CDN setup for frontend
- [ ] Database connection pooling tuning

**Deliverables:**

- ✅ Production-ready deployment
- ✅ Complete documentation
- ✅ Monitoring and alerting operational
- ✅ Performance benchmarks documented

---

## Phase 7: Advanced Features (Future)

### Potential Enhancements

- [ ] Machine learning for relationship discovery
  - Train on validated relationships
  - Improve confidence scoring
- [ ] Real-time data sync
  - Watch SQLite files for changes
  - Incremental updates to graph
- [ ] Multi-user support
  - Authentication and authorization
  - Collaborative annotation
- [ ] More database types
  - PostgreSQL
  - MySQL
  - CSV/Excel files
- [ ] Natural language query
  - "Show me all customers from California who bought X"
  - Translate to federated query
- [ ] Data quality dashboard
  - Missing foreign keys
  - Orphaned records
  - Data consistency issues
- [ ] Workflow automation
  - Scheduled discovery jobs
  - Automated validation workflows

---

## Success Metrics

### Technical Metrics

- **Discovery Accuracy**: >80% of discovered relationships validated as correct
- **Query Performance**: Federated queries execute in <5 seconds for typical cases
- **Graph Performance**: Render 5000+ nodes at 60fps
- **API Latency**: P95 <200ms for GraphQL queries
- **Test Coverage**: >80% across all packages
- **Zero Critical Security Issues**

### User Experience Metrics

- **Time to First Discovery**: <5 minutes from setup to first discovered relationships
- **Query Success Rate**: >95% of user-constructed queries execute successfully
- **Annotation Rate**: Users validate >60% of discovered relationships

### Business Value

- **Silo Breaking**: Successfully link at least 3 disparate data sources
- **Query Federation**: Enable at least 10 meaningful cross-database queries
- **Extensibility**: Support adding new databases without code changes

---

## Current Sprint Focus

### Phase Decision: Next Steps

Now that **Phase 4 Backend (Epic 4.1)** is complete, there are two paths forward:

**Option A: Complete Phase 3 Frontend Work**
- Complete Epic 3.2: Interactive Features (40% → 100%)
  - Node selection and highlighting
  - Node clustering by database
  - Search and focus on node
  - Export graph as SVG/PNG
- Start Epic 3.3: Layout Options (0% → 100%)
  - Hierarchical layout option
  - Radial layout option
  - Layout persistence (save/restore positions)

**Option B: Continue Phase 4 Frontend Work**
- Create Epic 4.3: Visual Query Builder (issue needed)
  - Drag-and-drop query construction UI
  - Table selection from graph
  - Join condition builder
  - Filter/WHERE clause builder
  - Column selection
- Create Epic 4.4: Result Visualization (issue needed)
  - Tabular result display component
  - Data lineage visualization
  - Export to CSV/JSON

**Recommendation:** Complete Phase 3 first (Option A) since:
1. Phase 3 provides better visualization before adding query features
2. Open issues already exist for Phase 3 work (#10, #11)
3. Natural progression: visualize → explore → query

### Open Items

**PR Review & Cleanup:**
- [ ] PR #20: Backend Resolver Improvements (review conflicts with master)
- [ ] PR #22: UI Redesign (rebase after PR #19 merge)

### Team Notes

- **Benedict**: Recently completed Epic 4.1 (Federated Query Engine - all 5 tasks)
- **Carsten**: Frontend work on Phase 3 visualization features

### Collaboration

- All work via GitHub Issues and Pull Requests
- Use PR comments for guidance on conflicts/issues
- Keep PRs focused on single features/epics
- Ensure `package-lock.json` sync before pushing
- Wiki available for project context and documentation

---

## Notes & Decisions

### Key Architectural Decisions

- Using monorepo for easy code sharing
- TypeScript strict mode enforced
- GraphQL for flexible API
- Neo4j for rich relationship modeling
- D3.js for powerful visualizations

### Open Questions

- [ ] How to handle very large databases (>1GB)?
- [ ] Should we support real-time collaboration?
- [ ] What's the authentication strategy for multi-user?

### Risks & Mitigations

- **Risk**: D3.js performance with large graphs
  - **Mitigation**: Canvas rendering, LOD, Web Workers
- **Risk**: Complex federated queries may be slow
  - **Mitigation**: Query optimization, result caching
- **Risk**: Discovery may find too many false positives
  - **Mitigation**: Tunable confidence thresholds, ML refinement

---

## Completed Milestones

### Phase 0 (Partial)

- [x] Repository initialization with Git
- [x] GitHub repository created (BenedictSmith/dickon)
- [x] Collaborator access granted (Carsten)
- [x] Branch protection rules configured (require PR + 1 approval)
- [x] GitHub issue labels created
- [x] Documentation structure established
- [x] README.md with project overview
- [x] ARCHITECTURE.md with system design
- [x] SILOBREAKER.md with detailed architecture
- [x] ADR/001-initial-tech-stack.md documenting technology decisions
- [x] CONTRIBUTING.md with workflow guidelines
- [x] LICENSE (MIT)
- [x] .gitignore configured
- [x] .editorconfig for code consistency
- [x] .env.example for environment variables
- [x] GitHub Actions CI workflow template
- [x] Pull request template
