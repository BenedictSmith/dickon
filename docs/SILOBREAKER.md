# SiloBreaker Architecture

## Vision

A production-grade system for automated discovery, federation, and visualization of relationships across disparate SQLite databases, using knowledge graphs to break down enterprise data silos.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Sources Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Chinook  │  │Northwind │  │  Sakila  │                  │
│  │ (SQLite) │  │ (SQLite) │  │ (SQLite) │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Discovery & Ingestion                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Schema Extractor                                   │    │
│  │  - Metadata extraction from SQLite                  │    │
│  │  - Column profiling & statistics                    │    │
│  │  - Data type mapping                                │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Entity Matcher                                     │    │
│  │  - Column name similarity (Levenshtein, Jaro)      │    │
│  │  - Value overlap analysis                           │    │
│  │  - Semantic type detection                          │    │
│  │  - Confidence scoring                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Knowledge Graph Layer                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Neo4j Graph Database                               │    │
│  │                                                      │    │
│  │  Node Types:                                        │    │
│  │  - Database (metadata about source)                │    │
│  │  - Table (schema information)                      │    │
│  │  - Column (data type, constraints)                 │    │
│  │  - Entity (logical business entities)              │    │
│  │                                                      │    │
│  │  Relationship Types:                                │    │
│  │  - CONTAINS (DB→Table, Table→Column)               │    │
│  │  - REFERENCES (intra-DB foreign keys)              │    │
│  │  - LINKS_TO (cross-DB discovered relationships)    │    │
│  │  - SIMILAR_TO (column similarity)                  │    │
│  │  - REPRESENTS (Table→Entity mapping)               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer (TypeScript)             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  GraphQL API Server (Apollo Server)                │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Type Definitions (schema.graphql)           │ │    │
│  │  │  - Query: schemas, relationships, entities   │ │    │
│  │  │  - Mutation: annotate, discover, federate    │ │    │
│  │  │  - Subscription: discovery progress          │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Resolvers (src/resolvers/)                  │ │    │
│  │  │  - Schema resolvers                          │ │    │
│  │  │  - Discovery resolvers                       │ │    │
│  │  │  - Federation resolvers                      │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Domain Services (src/services/)                   │    │
│  │  - SchemaService: SQLite metadata extraction      │    │
│  │  - DiscoveryService: relationship detection       │    │
│  │  - FederationService: cross-DB query execution    │    │
│  │  - GraphService: Neo4j operations wrapper         │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Repository Layer (src/repositories/)              │    │
│  │  - Neo4jRepository: graph database access         │    │
│  │  - SQLiteRepository: source database access       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Web Frontend (React + TypeScript)                 │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Components                                   │ │    │
│  │  │  - GraphVisualization (D3.js force-directed) │ │    │
│  │  │  - SchemaExplorer (tree + detail view)       │ │    │
│  │  │  - QueryBuilder (visual query construction)  │ │    │
│  │  │  - RelationshipAnnotator (manual linking)    │ │    │
│  │  │  - DataLineage (query flow visualization)    │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Apollo Client (GraphQL state management)    │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend

- **Runtime**: Node.js 20+ with TypeScript 5+
- **API Framework**: Apollo Server 4 (GraphQL)
- **Graph Database**: Neo4j 5+ (with neo4j-driver)
- **SQLite Access**: better-sqlite3
- **Validation**: Zod for runtime type validation
- **Testing**: Jest + ts-jest
- **Logging**: Winston with structured logging
- **Tracing**: OpenTelemetry for distributed tracing
- **Process Management**: PM2 for production

### Frontend

- **Framework**: React 18+ with TypeScript
- **Visualization**: D3.js v7
- **GraphQL Client**: Apollo Client
- **State Management**: Apollo Client + React Context
- **UI Components**: shadcn/ui + Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
- **Git Hooks**: Husky + lint-staged

## Architectural Principles

### 1. Strict Layered Architecture

```
Presentation → Application → Domain → Infrastructure
```

- **No layer bypass**: Each layer only communicates with adjacent layers
- **Dependency direction**: Always inward (Presentation depends on Application, never reverse)
- **Interface segregation**: Each layer exposes minimal interfaces

### 2. Domain-Driven Design Patterns

- **Entities**: Database, Table, Column, Relationship
- **Value Objects**: ConfidenceScore, DataType, ColumnStatistics
- **Aggregates**: SchemaAggregate, DiscoveryAggregate
- **Repositories**: Abstract data access
- **Services**: Encapsulate business logic

### 3. Type Safety

- **End-to-end types**: GraphQL schema → TypeScript types (via codegen)
- **Runtime validation**: Zod schemas at service boundaries
- **Strict TypeScript**: `strict: true`, `noImplicitAny: true`
- **No `any` types**: Enforce via ESLint rules

### 4. Error Handling

- **Typed errors**: Custom error classes extending base Error
- **Error boundaries**: GraphQL error formatting
- **Structured logging**: All errors logged with context
- **No silent failures**: All errors either handled or propagated

### 5. Testing Strategy

- **Unit tests**: 80%+ coverage for services and utilities
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Critical user flows (Playwright)
- **Contract tests**: GraphQL schema validation

## Project Structure

```
dickon/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts                    # Entry point
│   │   │   ├── server.ts                   # Apollo Server setup
│   │   │   ├── schema.graphql              # GraphQL schema
│   │   │   ├── resolvers/                  # GraphQL resolvers
│   │   │   │   ├── index.ts
│   │   │   │   ├── schema.resolver.ts
│   │   │   │   ├── discovery.resolver.ts
│   │   │   │   └── federation.resolver.ts
│   │   │   ├── services/                   # Business logic
│   │   │   │   ├── SchemaService.ts
│   │   │   │   ├── DiscoveryService.ts
│   │   │   │   ├── FederationService.ts
│   │   │   │   └── GraphService.ts
│   │   │   ├── repositories/               # Data access
│   │   │   │   ├── Neo4jRepository.ts
│   │   │   │   └── SQLiteRepository.ts
│   │   │   ├── domain/                     # Domain models
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   └── aggregates/
│   │   │   ├── infrastructure/             # Technical concerns
│   │   │   │   ├── logger.ts
│   │   │   │   ├── tracing.ts
│   │   │   │   └── config.ts
│   │   │   ├── types/                      # Generated types
│   │   │   │   └── graphql.ts
│   │   │   └── utils/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── fixtures/
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── main.tsx                    # Entry point
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── graph/
│       │   │   │   ├── GraphVisualization.tsx
│       │   │   │   ├── ForceDirectedGraph.tsx
│       │   │   │   └── GraphControls.tsx
│       │   │   ├── schema/
│       │   │   │   ├── SchemaExplorer.tsx
│       │   │   │   ├── SchemaTree.tsx
│       │   │   │   └── SchemaDetail.tsx
│       │   │   ├── query/
│       │   │   │   ├── QueryBuilder.tsx
│       │   │   │   └── ResultVisualization.tsx
│       │   │   └── relationship/
│       │   │       └── RelationshipAnnotator.tsx
│       │   ├── hooks/
│       │   ├── graphql/
│       │   │   ├── queries/
│       │   │   ├── mutations/
│       │   │   └── subscriptions/
│       │   ├── types/                      # Generated types
│       │   │   └── graphql.ts
│       │   ├── utils/
│       │   └── styles/
│       ├── tests/
│       ├── Dockerfile
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                               # Shared code
│   ├── types/                             # Shared TypeScript types
│   └── utils/                             # Shared utilities
│
├── data/                                   # Sample databases
│   ├── chinook.db
│   ├── northwind.db
│   └── sakila.db
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── lint.yml
│       └── test.yml
└── docs/
    ├── ARCHITECTURE.md
    ├── SILOBREAKER.md
    ├── ADR/
    └── API.md
```

## Architectural Compliance Mechanisms

### 1. Import Linting (eslint-plugin-import)

```javascript
// .eslintrc.js rules
rules: {
  'import/no-restricted-paths': ['error', {
    zones: [
      // Presentation cannot import from Infrastructure
      {
        target: './apps/frontend/src',
        from: './apps/backend/src/infrastructure',
        message: 'Frontend cannot directly access backend infrastructure'
      },
      // Resolvers can only import from services, not repositories
      {
        target: './apps/backend/src/resolvers',
        from: './apps/backend/src/repositories',
        message: 'Resolvers must use services, not repositories directly'
      },
      // Domain cannot import from infrastructure
      {
        target: './apps/backend/src/domain',
        from: './apps/backend/src/infrastructure',
        message: 'Domain layer must be infrastructure-agnostic'
      }
    ]
  }]
}
```

### 2. Dependency Cruiser

```javascript
// .dependency-cruiser.js
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-domain-to-infrastructure',
      from: { path: '^src/domain' },
      to: { path: '^src/infrastructure' },
      severity: 'error',
    },
    {
      name: 'resolvers-via-services-only',
      from: { path: '^src/resolvers' },
      to: { path: '^src/repositories' },
      severity: 'error',
    },
  ],
};
```

### 3. TypeScript Project References

```json
// tsconfig.json (root)
{
  "references": [
    { "path": "./apps/backend" },
    { "path": "./apps/frontend" },
    { "path": "./packages/types" }
  ]
}

// Enforces build order and prevents circular dependencies
```

### 4. Architecture Decision Records (ADRs)

Every architectural decision must be documented in `docs/ADR/` with:

- Context
- Decision
- Consequences
- Compliance mechanism

### 5. Pre-commit Hooks (Husky)

```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type checking
npm run type-check

# Linting with architectural rules
npm run lint

# Run dependency cruiser
npm run check:deps

# Unit tests
npm run test:unit
```

### 6. CI/CD Gates

GitHub Actions must pass:

- ✅ TypeScript compilation (strict mode)
- ✅ ESLint with architectural rules
- ✅ Dependency cruiser validation
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests
- ✅ GraphQL schema validation

### 7. Code Review Checklist

Automated PR template enforces:

- [ ] No layer violations
- [ ] Types properly defined
- [ ] Tests added/updated
- [ ] ADR created if architectural change
- [ ] GraphQL schema updated if API change
- [ ] Documentation updated

## Data Models

### Neo4j Graph Schema

**Nodes:**

```cypher
// Database node
(:Database {
  id: string,
  name: string,
  path: string,
  addedAt: datetime
})

// Table node
(:Table {
  id: string,
  name: string,
  rowCount: integer,
  databaseId: string
})

// Column node
(:Column {
  id: string,
  name: string,
  dataType: string,
  nullable: boolean,
  isPrimaryKey: boolean,
  isForeignKey: boolean,
  tableId: string
})

// Entity node (logical business entity)
(:Entity {
  id: string,
  name: string,
  type: string,
  confidence: float
})

// Relationship node (discovered link)
(:Relationship {
  id: string,
  fromColumn: string,
  toColumn: string,
  confidence: float,
  discoveryMethod: string,
  validatedAt: datetime,
  validatedBy: string
})
```

**Relationships:**

```cypher
(:Database)-[:CONTAINS]->(:Table)
(:Table)-[:CONTAINS]->(:Column)
(:Column)-[:REFERENCES]->(:Column)        // Intra-DB FK
(:Column)-[:LINKS_TO {confidence: float}]->(:Column)  // Cross-DB discovery
(:Column)-[:SIMILAR_TO {score: float}]->(:Column)
(:Table)-[:REPRESENTS]->(:Entity)
```

### GraphQL Schema (Excerpt)

```graphql
type Database {
  id: ID!
  name: String!
  path: String!
  tables: [Table!]!
  addedAt: DateTime!
}

type Table {
  id: ID!
  name: String!
  database: Database!
  columns: [Column!]!
  rowCount: Int!
  entity: Entity
}

type Column {
  id: ID!
  name: String!
  dataType: String!
  table: Table!
  isPrimaryKey: Boolean!
  isForeignKey: Boolean!
  references: Column
  linkedColumns: [ColumnLink!]!
  statistics: ColumnStatistics
}

type ColumnLink {
  targetColumn: Column!
  confidence: Float!
  discoveryMethod: String!
  validated: Boolean!
}

type Entity {
  id: ID!
  name: String!
  type: String!
  tables: [Table!]!
}

type Query {
  databases: [Database!]!
  database(id: ID!): Database
  discoverRelationships(databaseIds: [ID!]!): DiscoveryJob!
  federatedQuery(query: FederatedQueryInput!): QueryResult!
}

type Mutation {
  addDatabase(path: String!): Database!
  validateRelationship(relationshipId: ID!): Relationship!
  annotateEntity(tableId: ID!, entityName: String!): Entity!
}

type Subscription {
  discoveryProgress(jobId: ID!): DiscoveryProgress!
}
```

## Security Considerations

1. **Input Validation**: All GraphQL inputs validated with Zod
2. **Query Complexity**: Limit GraphQL query depth and complexity
3. **Rate Limiting**: Per-client rate limits on API
4. **Sanitization**: SQL injection prevention via parameterized queries
5. **Authentication**: JWT-based (future: when multi-user)
6. **CORS**: Strict origin policy

## Performance Considerations

1. **Neo4j Indexes**: On node IDs and frequently queried properties
2. **Query Caching**: Apollo Server response caching
3. **DataLoader**: Batch and cache Neo4j queries
4. **Connection Pooling**: For both Neo4j and SQLite
5. **Lazy Loading**: Frontend only loads visible graph sections
6. **Web Workers**: Offload D3.js calculations from main thread

## Observability

### Logging

```typescript
// Structured logging with Winston
logger.info('Discovery job started', {
  jobId,
  databaseIds,
  timestamp: new Date().toISOString(),
});
```

### Tracing

```typescript
// OpenTelemetry spans
const span = tracer.startSpan('discovery.findRelationships');
// ... operation
span.end();
```

### Metrics

- GraphQL operation timing
- Neo4j query performance
- Discovery job duration
- Frontend render performance

## Deployment

### Development

```bash
docker-compose up
```

### Production

- Backend: Docker container with PM2
- Frontend: Static build on CDN
- Neo4j: Managed instance or containerized
- Monitoring: Prometheus + Grafana
