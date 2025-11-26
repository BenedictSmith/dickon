# Architecture Overview

This document provides a high-level overview of the Dickon project architecture. For detailed system design, see [SILOBREAKER.md](SILOBREAKER.md).

## Project: SiloBreaker

**SiloBreaker** is a production-grade system for automated discovery, federation, and visualization of relationships across disparate SQLite databases, using knowledge graphs to break down enterprise data silos.

## System Design

The system follows a strict layered architecture:

```
Presentation Layer (React + TypeScript)
         ↓
Application Layer (GraphQL API - Apollo Server)
         ↓
Domain Layer (Business Logic & Services)
         ↓
Infrastructure Layer (Neo4j, SQLite, Logging)
```

### Core Layers:
1. **Data Sources Layer**: Multiple SQLite databases (Chinook, Northwind, Sakila)
2. **Discovery & Ingestion**: Schema extraction and entity matching
3. **Knowledge Graph Layer**: Neo4j graph database for relationship mapping
4. **Application Layer**: TypeScript backend with GraphQL API
5. **Presentation Layer**: React frontend with D3.js visualizations

## Key Components

### Backend (TypeScript + Node.js)
- **GraphQL API Server**: Apollo Server 4 for API layer
- **Schema Service**: SQLite metadata extraction and profiling
- **Discovery Service**: Automated relationship detection across databases
- **Federation Service**: Cross-database query execution
- **Graph Service**: Neo4j operations and graph management
- **Repositories**: Data access abstraction for Neo4j and SQLite

### Frontend (React + TypeScript)
- **Graph Visualization**: D3.js force-directed graph of database relationships
- **Schema Explorer**: Interactive tree view of database schemas
- **Query Builder**: Visual interface for federated queries
- **Relationship Annotator**: Manual relationship validation and annotation

### Infrastructure
- **Neo4j**: Graph database for storing relationships and metadata
- **Docker Compose**: Containerized development environment
- **GitHub Actions**: CI/CD pipeline with automated testing

## Data Flow

1. **Discovery Phase**:
   - User adds SQLite databases to the system
   - Schema extractor analyzes table structures, columns, and constraints
   - Entity matcher identifies potential relationships using similarity algorithms
   - Discovered relationships stored in Neo4j with confidence scores

2. **Visualization Phase**:
   - Frontend queries GraphQL API for graph data
   - D3.js renders interactive force-directed graph
   - Users explore relationships and validate connections

3. **Federation Phase**:
   - Users construct queries spanning multiple databases
   - Federation service executes queries and joins results
   - Results visualized with data lineage tracking

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript 5+
- **API**: Apollo Server 4 (GraphQL)
- **Graph DB**: Neo4j 5+ with neo4j-driver
- **SQLite**: better-sqlite3
- **Validation**: Zod for runtime type checking
- **Testing**: Jest + ts-jest
- **Logging**: Winston + OpenTelemetry

### Frontend
- **Framework**: React 18+ with TypeScript
- **Visualization**: D3.js v7
- **GraphQL Client**: Apollo Client
- **UI**: shadcn/ui + Tailwind CSS
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

### DevOps
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier + Husky
- **Architecture Enforcement**: dependency-cruiser

## Design Decisions

All architectural decisions are documented as Architecture Decision Records (ADRs) in the `ADR/` folder.

Key principles:
- **Strict Layered Architecture**: No layer bypassing
- **Domain-Driven Design**: Entities, value objects, aggregates, repositories
- **Type Safety**: End-to-end TypeScript with strict mode
- **Testing**: 80%+ coverage requirement
- **Observability**: Structured logging and distributed tracing

## Detailed Documentation

For comprehensive system design, data models, compliance mechanisms, and deployment instructions, see:
- **[SILOBREAKER.md](SILOBREAKER.md)** - Complete system architecture
- **[ADR/](ADR/)** - Architecture decision records
