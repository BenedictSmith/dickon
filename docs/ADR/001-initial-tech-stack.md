# 1. SiloBreaker Technology Stack

Date: 2024-11-26

## Status
Accepted

## Context

The SiloBreaker project requires a robust, type-safe, and scalable architecture for:
1. **Graph-based data modeling**: Representing complex relationships between disparate databases
2. **Real-time discovery**: Automated detection of cross-database relationships
3. **Interactive visualization**: Force-directed graphs for exploring database connections
4. **Federated queries**: Executing queries spanning multiple SQLite sources
5. **Production-grade quality**: Strict type safety, architectural compliance, and high test coverage

The system must balance developer productivity with long-term maintainability while handling complex graph traversals and real-time visualizations.

## Decision

### Backend Stack
- **Runtime**: Node.js 20+ with TypeScript 5+
  - Mature ecosystem, excellent TypeScript support
  - Strong async/await primitives for I/O-heavy operations
- **API Framework**: Apollo Server 4 (GraphQL)
  - Type-safe API contracts with schema-first development
  - Built-in subscriptions for real-time discovery progress
  - Excellent tooling and client integrations
- **Graph Database**: Neo4j 5+
  - Native graph storage and traversal (superior to relational for our use case)
  - Cypher query language optimized for relationship queries
  - Strong TypeScript driver support
- **SQLite Access**: better-sqlite3
  - Synchronous API (simpler than async for read-heavy operations)
  - Excellent performance for local database access
- **Validation**: Zod
  - Runtime type validation at service boundaries
  - Excellent TypeScript integration and error messages
- **Testing**: Jest + ts-jest
  - Industry standard, mature tooling
  - Great coverage reporting

### Frontend Stack
- **Framework**: React 18+ with TypeScript
  - Component-based architecture aligns with our UI needs
  - Large ecosystem, strong TypeScript support
  - Concurrent rendering benefits for complex visualizations
- **Visualization**: D3.js v7
  - Industry standard for force-directed graphs
  - Full control over graph rendering and interactions
  - Excellent documentation and examples
- **GraphQL Client**: Apollo Client
  - Seamless integration with Apollo Server
  - Built-in caching and state management
  - Subscription support for real-time updates
- **UI Components**: shadcn/ui + Tailwind CSS
  - Modern, accessible component library
  - Utility-first CSS for rapid development
  - Easy customization and theming
- **Build Tool**: Vite
  - Lightning-fast HMR for development
  - Optimized production builds
  - Native TypeScript support

### Infrastructure & Quality
- **Containerization**: Docker + Docker Compose
  - Consistent development environments
  - Easy Neo4j and application orchestration
- **CI/CD**: GitHub Actions
  - Native GitHub integration
  - Free for public repositories
  - Excellent ecosystem of actions
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
  - Enforces consistent code style
  - Catches errors at compile time
  - Reduces cognitive load in reviews
- **Architecture Enforcement**: dependency-cruiser
  - Prevents layer violations
  - Enforces architectural boundaries
  - Fails builds on circular dependencies

## Consequences

### Positive
- **End-to-end type safety**: GraphQL schema generates TypeScript types for both client and server
- **Excellent DX**: Fast feedback loops with Vite, TypeScript, and Jest
- **Production-ready**: Battle-tested technologies with strong community support
- **Graph-optimized**: Neo4j provides superior performance for relationship queries vs. relational databases
- **Maintainability**: Strict architectural rules enforced by tooling reduce technical debt
- **Real-time capabilities**: GraphQL subscriptions enable live progress updates during discovery
- **Modern UI**: React 18 concurrent rendering handles complex visualizations without blocking

### Negative
- **Learning curve**: Neo4j and Cypher require upfront investment for developers unfamiliar with graph databases
- **Infrastructure complexity**: Neo4j adds another service to manage (vs. simpler relational DB)
- **Bundle size**: React + D3.js + Apollo Client results in larger frontend bundle than simpler alternatives
- **GraphQL overhead**: More complex than REST for simple CRUD operations
- **Type generation**: Requires codegen step in build pipeline (additional tooling)
- **Node.js limitations**: Single-threaded runtime may require worker threads for CPU-intensive discovery algorithms

### Mitigations
- **Neo4j learning curve**: Comprehensive documentation, sample Cypher queries in codebase
- **Infrastructure**: Docker Compose abstracts Neo4j setup; managed Neo4j available for production
- **Bundle size**: Code splitting and lazy loading for visualization components
- **GraphQL complexity**: Apollo Server abstracts most complexity; strong typing benefits outweigh overhead
- **Codegen**: Automated in CI/CD; pre-commit hooks ensure types stay in sync
- **CPU-bound tasks**: OpenTelemetry tracing helps identify bottlenecks; worker threads for heavy algorithms

## Alternatives Considered

### Backend Alternatives
- **REST API**: Rejected due to lack of strong typing and inefficient for nested graph data
- **tRPC**: Considered, but GraphQL subscriptions and existing ecosystem favored Apollo
- **PostgreSQL with pg_graph**: Rejected in favor of native graph database (Neo4j)

### Frontend Alternatives
- **Vue 3**: Rejected due to team familiarity with React and larger React ecosystem
- **Svelte**: Considered for bundle size, but React's maturity and hiring pool favored React
- **Plotly/Recharts**: Too limited for custom force-directed graph interactions; D3.js provides full control

## Compliance Mechanism
- TypeScript compiler with `strict: true` enforces type safety
- ESLint rules with `no-restricted-paths` enforce layer boundaries
- dependency-cruiser validates architecture in CI/CD
- Pre-commit hooks run type checking, linting, and unit tests
- 80%+ test coverage required for CI to pass
