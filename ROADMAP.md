# SiloBreaker Development Roadmap

## Project Goals

Build a production-grade system for automated discovery and federation of relationships across disparate SQLite databases, breaking down data silos through knowledge graphs and interactive visualization.

## Phase 0: Foundation (Week 1-2)

### Infrastructure Setup

- [x] Repository initialization
- [x] Documentation structure
- [x] GitHub repository created with collaborator access
- [x] Branch protection rules configured
- [x] GitHub labels and issue tracking set up
- [ ] Monorepo setup with workspaces
- [ ] Docker Compose configuration
  - Neo4j container
  - Backend container
  - Frontend dev server
- [ ] CI/CD pipeline
  - TypeScript compilation
  - Linting with architectural rules
  - Dependency cruiser validation
  - Unit test execution
- [ ] Architectural compliance tooling
  - ESLint import restrictions
  - Dependency cruiser config
  - Husky pre-commit hooks

### Development Environment

- [ ] Backend TypeScript project
  - Apollo Server setup
  - Neo4j driver configuration
  - Winston logging
  - OpenTelemetry tracing
- [ ] Frontend TypeScript project
  - Vite + React setup
  - Apollo Client configuration
  - Tailwind + shadcn/ui
  - D3.js integration
- [ ] Sample data acquisition
  - Download Chinook database
  - Download Northwind database
  - Download Sakila database

**Deliverables:**

- ✅ Fully configured development environment
- ✅ All three sample databases in `data/` directory
- ✅ Docker Compose bringing up all services
- ✅ CI passing on main branch

---

## Phase 1: Schema Discovery & Ingestion (Week 3-4)

### Backend Implementation

**Epic 1.1: SQLite Schema Extraction**

- [ ] SQLiteRepository implementation
  - Connection management
  - Schema metadata queries
  - Table/column enumeration
  - Foreign key detection
- [ ] SchemaService implementation
  - Extract database structure
  - Analyze column data types
  - Calculate table row counts
  - Profile column statistics
- [ ] Unit tests (80%+ coverage)

**Epic 1.2: Neo4j Graph Population**

- [ ] Neo4jRepository implementation
  - Connection pooling
  - Cypher query builders
  - Transaction management
- [ ] GraphService implementation
  - Create Database nodes
  - Create Table nodes
  - Create Column nodes
  - Create intra-database REFERENCES relationships
- [ ] Integration tests with test Neo4j instance

**Epic 1.3: GraphQL API**

- [ ] Schema definition
  - Database, Table, Column types
  - Query: databases, database(id)
  - Mutation: addDatabase(path)
- [ ] Resolvers implementation
  - Database resolver
  - Table resolver (with DataLoader)
  - Column resolver
- [ ] GraphQL Codegen setup
  - Generate TypeScript types
  - Update backend services
- [ ] API integration tests

### Frontend Implementation

**Epic 1.4: Schema Explorer UI**

- [ ] Database list component
- [ ] Schema tree component
  - Hierarchical view (DB → Tables → Columns)
  - Expand/collapse functionality
- [ ] Detail panel component
  - Show column metadata
  - Show statistics
- [ ] Apollo Client queries
  - List databases
  - Get database details

**Deliverables:**

- ✅ Can ingest all three SQLite databases into Neo4j
- ✅ GraphQL API exposes complete schema information
- ✅ Frontend displays navigable schema tree
- ✅ All tests passing

---

## Phase 2: Relationship Discovery (Week 5-7)

### Backend Implementation

**Epic 2.1: Column Similarity Analysis**

- [ ] Implement similarity algorithms
  - Levenshtein distance for column names
  - Jaro-Winkler for fuzzy matching
  - Data type compatibility checks
- [ ] DiscoveryService implementation
  - Find candidate column pairs
  - Calculate confidence scores
  - Create SIMILAR_TO relationships
- [ ] Unit tests for algorithms

**Epic 2.2: Value Overlap Detection**

- [ ] Sample data from columns
- [ ] Calculate value intersection
- [ ] Cardinality analysis
- [ ] Foreign key candidate scoring
- [ ] Create LINKS_TO relationships with confidence
- [ ] Integration tests

**Epic 2.3: Discovery Job Management**

- [ ] Job queue implementation (in-memory for now)
- [ ] GraphQL subscription for progress
- [ ] Resolver: discoverRelationships mutation
- [ ] Background job execution
- [ ] Job status tracking

### Frontend Implementation

**Epic 2.4: Discovery Interface**

- [ ] Discovery job trigger UI
  - Select databases to analyze
  - Set confidence thresholds
- [ ] Progress indicator component
  - Subscribe to discovery progress
  - Show statistics (relationships found)
- [ ] Relationship review panel
  - List discovered relationships
  - Show confidence scores
  - Mark as validated/rejected

**Deliverables:**

- ✅ Automated discovery finds relationships across Chinook/Northwind/Sakila
- ✅ Confidence scores calculated and stored
- ✅ UI allows triggering and monitoring discovery
- ✅ User can review discovered relationships

---

## Phase 3: Graph Visualization (Week 8-10)

### Frontend Implementation

**Epic 3.1: D3.js Force-Directed Graph**

- [ ] GraphVisualization component
  - D3.js force simulation setup
  - Node rendering (Database, Table, Column)
  - Edge rendering (relationships with confidence)
  - Zoom and pan controls
- [ ] Performance optimization
  - Canvas rendering for large graphs
  - Level-of-detail (LOD) rendering
  - Web Worker for calculations

**Epic 3.2: Interactive Features**

- [ ] Node selection and highlighting
- [ ] Edge filtering by confidence threshold
- [ ] Node clustering by database
- [ ] Search and focus on node
- [ ] Tooltip with node/edge details
- [ ] Export graph as SVG/PNG

**Epic 3.3: Layout Options**

- [ ] Force-directed layout
- [ ] Hierarchical layout
- [ ] Radial layout
- [ ] Layout persistence (save positions)

**Backend Support**

- [ ] GraphQL query: getGraphData(filter)
  - Return nodes and edges for visualization
  - Support filtering by confidence
  - Support subgraph extraction

**Deliverables:**

- ✅ Interactive force-directed graph of all databases
- ✅ Color-coded by database source
- ✅ Edge thickness indicates confidence
- ✅ Smooth performance with 1000+ nodes
- ✅ User can explore and filter relationships visually

---

## Phase 4: Query Federation (Week 11-13)

### Backend Implementation

**Epic 4.1: Federated Query Engine**

- [ ] FederationService implementation
  - Parse query structure
  - Identify cross-database joins
  - Generate SQL for each database
  - Merge results in memory
- [ ] Query optimization
  - Push-down predicates
  - Minimize data transfer
- [ ] Result caching

**Epic 4.2: GraphQL Federation API**

- [ ] Schema extension
  - FederatedQueryInput type
  - QueryResult type
- [ ] Resolver: federatedQuery mutation
- [ ] Error handling for query failures

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

- ✅ Can execute cross-database queries
- ✅ Results merge data from multiple SQLite sources
- ✅ UI provides visual query builder
- ✅ Results display with lineage information

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

## Current Sprint (Week 1)

### This Week's Focus

- [ ] Complete monorepo setup
- [ ] Docker Compose configuration
- [ ] CI/CD pipeline enhancement
- [ ] Backend project scaffolding
- [ ] Frontend project scaffolding
- [ ] Download sample databases

### Team Assignments

- **Benedict**: Backend setup, Neo4j configuration, Docker Compose
- **Carsten**: Frontend setup, Vite configuration, Tailwind setup

### Communication

- Collaborate via GitHub Issues and Pull Requests
- Use PR reviews for knowledge sharing
- Document decisions in ADRs

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
