# Testing Strategy - SiloBreaker

## Philosophy: Test-Driven Development (TDD)

SiloBreaker follows strict Test-Driven Development practices. **Code without tests will not be merged.**

### TDD Red-Green-Refactor Cycle

```
🔴 RED → 🟢 GREEN → 🔵 REFACTOR
```

1. **🔴 RED**: Write a failing test first
2. **🟢 GREEN**: Write minimal code to make it pass
3. **🔵 REFACTOR**: Improve code while keeping tests green

### Why TDD?

- **Design-first thinking**: Tests force you to think about interfaces before implementation
- **Living documentation**: Tests document how code should be used
- **Confidence**: Refactor fearlessly knowing tests will catch regressions
- **Architectural compliance**: TDD naturally enforces separation of concerns

---

## Testing Pyramid

```
        /\
       /E2E\          ← Few, slow, comprehensive
      /------\
     /Integr.\       ← Some, moderate, service boundaries
    /----------\
   /   Unit     \    ← Many, fast, isolated
  /--------------\
```

### Target Distribution
- **70% Unit Tests**: Fast, isolated, pure logic
- **20% Integration Tests**: Database, API, external dependencies
- **10% E2E Tests**: Full user workflows

### Coverage Requirements
- **Minimum**: 80% overall code coverage
- **Services**: 90%+ coverage (core business logic)
- **Repositories**: 85%+ coverage (data access)
- **Resolvers**: 80%+ coverage (API layer)
- **Domain Entities**: 95%+ coverage (critical logic)

---

## Test Types by Layer

### 1. Unit Tests

**Characteristics:**
- No external dependencies (mocked)
- Fast (<1ms per test)
- Isolated and deterministic
- Test pure functions and business logic

**What to Test:**
- Domain entities and value objects
- Service methods with mocked repositories
- Utility functions
- Algorithms (similarity, scoring, etc.)

**Example TDD Workflow:**

```typescript
// Step 1: 🔴 RED - Write failing test
describe('LevenshteinDistance', () => {
  it('should calculate distance between two strings', () => {
    const result = levenshteinDistance('kitten', 'sitting');
    expect(result).toBe(3);
  });
});

// Step 2: 🟢 GREEN - Minimal implementation
export function levenshteinDistance(a: string, b: string): number {
  // TODO: Implement
  return 0; // Test fails ✗
}

// Step 3: Implement to pass
export function levenshteinDistance(a: string, b: string): number {
  const matrix = /* algorithm */;
  return matrix[a.length][b.length]; // Test passes ✓
}

// Step 4: 🔵 REFACTOR - Improve without breaking tests
```

**Location:** `apps/backend/tests/unit/`

**Run:** `npm run test:unit --workspace=apps/backend`

---

### 2. Integration Tests

**Characteristics:**
- Test interactions between layers
- Use real databases (test instances)
- Moderate speed (~100ms-1s per test)
- Verify contracts between components

**What to Test:**
- Repository operations against real Neo4j
- Service methods calling real repositories
- GraphQL resolvers with real services
- Schema extraction from real SQLite files

**Example TDD Workflow:**

```typescript
// Step 1: 🔴 RED - Write failing integration test
describe('Neo4jRepository', () => {
  let repository: Neo4jRepository;
  let driver: Driver;

  beforeAll(async () => {
    driver = neo4j.driver(
      process.env.NEO4J_TEST_URI!,
      neo4j.auth.basic('neo4j', 'testpass')
    );
    repository = new Neo4jRepository(driver);
  });

  afterAll(async () => {
    await driver.close();
  });

  afterEach(async () => {
    // Clean up test data
    await repository.deleteAll();
  });

  it('should create and retrieve a database node', async () => {
    const db = {
      id: 'test-db-1',
      name: 'Test Database',
      path: '/path/to/db.sqlite',
    };

    await repository.createDatabase(db);
    const result = await repository.getDatabase('test-db-1');

    expect(result).toEqual(db);
  });
});
```

**Location:** `apps/backend/tests/integration/`

**Run:** `npm run test:integration --workspace=apps/backend`

---

### 3. End-to-End (E2E) Tests

**Characteristics:**
- Test complete user workflows
- All services running (Docker Compose)
- Slow (5-30s per test)
- Browser-based (Playwright)

**What to Test:**
- Critical user journeys
- Discovery workflow (add DB → discover relationships → visualize)
- Query federation workflow
- Error scenarios

**Example Test:**

```typescript
// tests/e2e/discovery.spec.ts
import { test, expect } from '@playwright/test';

test('complete discovery workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');

  // Upload database
  await page.click('[data-testid="add-database-button"]');
  await page.setInputFiles('input[type="file"]', 'data/chinook.db');
  await expect(page.locator('text=Chinook')).toBeVisible();

  // Trigger discovery
  await page.click('[data-testid="discover-button"]');
  await page.click('text=Start Discovery');

  // Wait for completion
  await expect(page.locator('text=Discovery Complete')).toBeVisible({
    timeout: 30000,
  });

  // Verify relationships found
  const relationshipCount = await page
    .locator('[data-testid="relationship-count"]')
    .textContent();
  expect(parseInt(relationshipCount!)).toBeGreaterThan(0);

  // Verify graph visualization
  await expect(page.locator('svg.graph-visualization')).toBeVisible();
});
```

**Location:** `tests/e2e/`

**Run:** `npm run test:e2e`

---

## Test Structure Standards

### File Naming Conventions

```
src/services/SchemaService.ts
tests/unit/services/SchemaService.test.ts

src/repositories/Neo4jRepository.ts
tests/integration/repositories/Neo4jRepository.test.ts
```

### Test Organization

```typescript
describe('ServiceName', () => {
  // Setup
  beforeAll(() => {
    // One-time setup
  });

  afterAll(() => {
    // One-time teardown
  });

  beforeEach(() => {
    // Per-test setup
  });

  afterEach(() => {
    // Per-test cleanup
  });

  // Group related tests
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = setupInput();

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle edge case', () => {
      // Test edge case
    });

    it('should throw error for invalid input', () => {
      // Test error handling
      expect(() => service.methodName(invalidInput)).toThrow(ValidationError);
    });
  });
});
```

---

## TDD Workflow by Epic

### Epic 1.1: SQLite Schema Extraction (Example)

#### Step 1: Write Test for SchemaService

```typescript
// tests/unit/services/SchemaService.test.ts
describe('SchemaService', () => {
  it('should extract table names from SQLite database', async () => {
    const mockRepo = {
      getTables: jest.fn().mockResolvedValue(['users', 'posts']),
    };
    const service = new SchemaService(mockRepo);

    const result = await service.extractSchema('test.db');

    expect(result.tables).toHaveLength(2);
    expect(result.tables[0].name).toBe('users');
  });
});
```

**Result:** ❌ Test fails (SchemaService doesn't exist)

#### Step 2: Implement Minimal Code

```typescript
// src/services/SchemaService.ts
export class SchemaService {
  constructor(private repository: SQLiteRepository) {}

  async extractSchema(path: string): Promise<DatabaseSchema> {
    const tables = await this.repository.getTables(path);
    return {
      tables: tables.map((name) => ({ name })),
    };
  }
}
```

**Result:** ✅ Test passes

#### Step 3: Add More Tests (TDD Continues)

```typescript
it('should extract column information for each table', async () => {
  // New failing test
});

it('should detect primary keys', async () => {
  // New failing test
});

it('should detect foreign key relationships', async () => {
  // New failing test
});
```

Repeat Red-Green-Refactor cycle for each test.

---

## Mocking Strategy

### What to Mock

✅ **Mock in Unit Tests:**
- External dependencies (repositories, APIs)
- Database connections
- File system operations
- Time-dependent functions

❌ **Don't Mock in Integration Tests:**
- Databases (use test instances)
- Internal services
- Business logic

### Mock Examples

**Jest Mocks:**

```typescript
// Mock repository
const mockNeo4jRepo = {
  createDatabase: jest.fn(),
  getDatabase: jest.fn(),
  deleteDatabase: jest.fn(),
} as jest.Mocked<Neo4jRepository>;

// Mock with return value
mockNeo4jRepo.getDatabase.mockResolvedValue({
  id: 'db-1',
  name: 'Test DB',
});

// Verify mock was called
expect(mockNeo4jRepo.createDatabase).toHaveBeenCalledWith(
  expect.objectContaining({ name: 'Test DB' })
);
```

**Dependency Injection for Testability:**

```typescript
// Good: Dependencies injected
export class DiscoveryService {
  constructor(
    private neo4jRepo: Neo4jRepository,
    private sqliteRepo: SQLiteRepository
  ) {}
}

// Test with mocks
const service = new DiscoveryService(mockNeo4j, mockSQLite);
```

---

## Test Data Management

### Test Fixtures

**Location:** `tests/fixtures/`

```
tests/fixtures/
├── databases/
│   ├── test-chinook.db (small subset)
│   ├── test-northwind.db
│   └── test-sakila.db
├── neo4j/
│   └── seed-data.cypher
└── graphql/
    └── sample-queries.graphql
```

### Fixture Best Practices

1. **Keep fixtures small**: Use subsets of real data
2. **Version control fixtures**: Check them into Git
3. **Document fixture structure**: README per directory
4. **Clean up after tests**: Always reset state

**Example Fixture:**

```typescript
// tests/fixtures/database-fixtures.ts
export const testDatabase = {
  id: 'test-db-1',
  name: 'Test Chinook',
  path: path.join(__dirname, 'databases/test-chinook.db'),
  addedAt: new Date('2024-01-01'),
};

export const testTable = {
  id: 'table-1',
  name: 'Artist',
  databaseId: 'test-db-1',
  rowCount: 275,
};

export const testColumn = {
  id: 'col-1',
  name: 'ArtistId',
  dataType: 'INTEGER',
  tableId: 'table-1',
  isPrimaryKey: true,
  nullable: false,
};
```

---

## Test Environment Setup

### Local Test Environment

```bash
# Install dependencies
npm install

# Start test Neo4j (separate from dev)
docker run -d \
  --name dickon-neo4j-test \
  -p 7688:7687 \
  -e NEO4J_AUTH=neo4j/testpass \
  neo4j:5.13

# Run unit tests (fast, no dependencies)
npm run test:unit

# Run integration tests (requires Neo4j)
NEO4J_URI=bolt://localhost:7688 \
NEO4J_USER=neo4j \
NEO4J_PASSWORD=testpass \
npm run test:integration

# Run all tests
npm test
```

### CI Test Environment

GitHub Actions provides:
- Neo4j service container
- Isolated environment per test run
- Coverage reporting to Codecov

---

## Coverage Requirements

### Measuring Coverage

```bash
# Run tests with coverage
npm run test:unit -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Targets by Layer

| Layer            | Target | Why                              |
| ---------------- | ------ | -------------------------------- |
| Domain Entities  | 95%+   | Critical business logic          |
| Services         | 90%+   | Core application logic           |
| Repositories     | 85%+   | Data access patterns             |
| Resolvers        | 80%+   | API contract enforcement         |
| Utilities        | 90%+   | Pure functions, high reusability |
| Infrastructure   | 70%+   | Often thin wrappers              |

### Coverage Enforcement

- **CI fails if coverage drops below 80%**
- **PR reviews should check coverage diff**
- **Aim to increase coverage, never decrease**

---

## TDD Anti-Patterns to Avoid

### ❌ Don't Do This

1. **Writing tests after code**

   ```typescript
   // Bad: Code already written, test just confirms it works
   ```

2. **Testing implementation details**

   ```typescript
   // Bad: Test should not know about internal variables
   expect(service['_internalCache']).toBeDefined();
   ```

3. **Fragile tests (depends on order)**

   ```typescript
   // Bad: Test depends on previous test
   it('test 1', () => {
     /* mutates state */
   });
   it('test 2', () => {
     /* assumes test 1 ran */
   });
   ```

4. **Testing private methods directly**

   ```typescript
   // Bad: Test public interface, not private methods
   expect(service['_privateHelper']()).toBe(true);
   ```

5. **Mocking everything**
   ```typescript
   // Bad: Over-mocked, not testing anything real
   jest.mock('./everything');
   ```

### ✅ Do This Instead

1. **Write test first (TDD)**

   ```typescript
   // Good: Define behavior before implementation
   it('should calculate confidence score', () => {
     expect(calculateConfidence(0.8, 0.9)).toBeCloseTo(0.85);
   });
   ```

2. **Test behavior, not implementation**

   ```typescript
   // Good: Test public API
   expect(await service.discover()).toHaveLength(5);
   ```

3. **Isolated tests**

   ```typescript
   // Good: Each test sets up its own state
   beforeEach(() => {
     service = new Service(mockRepo);
   });
   ```

4. **Test public interface**

   ```typescript
   // Good: Private methods tested via public API
   expect(service.publicMethod()).toBe(expected);
   ```

5. **Mock only external dependencies**
   ```typescript
   // Good: Mock database, but not business logic
   const mockRepo = createMockRepository();
   const service = new Service(mockRepo); // Real service
   ```

---

## Test Performance

### Speed Targets

- Unit test: <10ms per test
- Integration test: <1s per test
- E2E test: <30s per test
- Full suite: <5 minutes

### Optimization Strategies

1. **Parallel execution**: Jest runs tests concurrently
2. **Test isolation**: No shared state between tests
3. **Selective testing**: Run only changed files in watch mode
4. **Connection pooling**: Reuse database connections
5. **Fixture caching**: Load fixtures once per suite

```bash
# Watch mode (runs only changed tests)
npm run test:unit -- --watch

# Run specific file
npm run test:unit -- SchemaService.test.ts

# Run tests matching pattern
npm run test:unit -- --testNamePattern="should extract"
```

---

## Debugging Tests

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debugging Tips

```typescript
// Use test.only to run single test
it.only('should debug this test', () => {
  debugger; // Will pause in VS Code
});

// Use console.log (visible in test output)
console.log('Debug value:', result);

// Use Jest snapshots for complex objects
expect(result).toMatchSnapshot();
```

---

## GraphQL Testing

### Resolver Testing

```typescript
// tests/unit/resolvers/schema.resolver.test.ts
describe('Schema Resolver', () => {
  it('should return all databases', async () => {
    const mockService = {
      getAllDatabases: jest
        .fn()
        .mockResolvedValue([{ id: 'db-1', name: 'Test' }]),
    };

    const resolver = new SchemaResolver(mockService);
    const result = await resolver.Query.databases();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test');
  });
});
```

### Integration Testing GraphQL API

```typescript
// tests/integration/api/schema.api.test.ts
import { ApolloServer } from '@apollo/server';

describe('Schema API', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = await createTestServer();
  });

  it('should query databases via GraphQL', async () => {
    const result = await server.executeOperation({
      query: `
        query {
          databases {
            id
            name
          }
        }
      `,
    });

    expect(result.body.kind).toBe('single');
    if (result.body.kind === 'single') {
      expect(result.body.singleResult.data?.databases).toBeDefined();
    }
  });
});
```

---

## Frontend Testing

### Component Testing (Vitest + React Testing Library)

```typescript
// apps/frontend/tests/SchemaExplorer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { SchemaExplorer } from '../src/components/SchemaExplorer';

describe('SchemaExplorer', () => {
  it('should render database list', async () => {
    const mockQuery = {
      data: {
        databases: [{ id: '1', name: 'Chinook' }],
      },
    };

    render(
      <MockedProvider mocks={[mockQuery]}>
        <SchemaExplorer />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Chinook')).toBeInTheDocument();
    });
  });
});
```

---

## Continuous Testing

### Watch Mode for TDD

```bash
# Terminal 1: Run tests in watch mode
npm run test:unit -- --watch

# Terminal 2: Write code
# Tests auto-run on file save
```

### Pre-commit Hook Testing

Tests run automatically via Husky before each commit:

```bash
# .husky/pre-commit runs:
npm run test:unit
```

---

## Summary: TDD Checklist

Before writing any feature code:

- [ ] Write failing test first (🔴 RED)
- [ ] Run test to confirm it fails
- [ ] Write minimal code to pass (🟢 GREEN)
- [ ] Run test to confirm it passes
- [ ] Refactor while keeping tests green (🔵 REFACTOR)
- [ ] Commit tests AND code together
- [ ] Verify coverage increased or stayed the same
- [ ] Ensure all tests still pass

**Remember:** If you're not writing tests first, you're not doing TDD!

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright E2E Testing](https://playwright.dev/)
- [Test-Driven Development by Example (Kent Beck)](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
