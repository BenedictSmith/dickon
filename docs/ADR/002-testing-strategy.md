# 2. Test-Driven Development Strategy

Date: 2024-11-26

## Status

Accepted

## Context

The SiloBreaker project is a complex system involving:

- Graph database operations (Neo4j)
- Multiple data sources (SQLite databases)
- Real-time discovery algorithms
- Interactive visualizations
- Cross-database query federation

We need a testing strategy that:

1. **Ensures correctness** of complex algorithms (relationship discovery, similarity matching)
2. **Maintains architectural integrity** (prevents layer violations)
3. **Enables confident refactoring** (no fear of breaking changes)
4. **Serves as documentation** (tests describe intended behavior)
5. **Catches regressions early** (automated CI/CD)
6. **Supports multiple developers** (clear testing patterns)

Traditional "test-after" approaches lead to:

- Low test coverage (testing feels like overhead)
- Brittle tests (coupled to implementation)
- Poor design (code not built for testability)
- Technical debt accumulation

## Decision

We adopt **strict Test-Driven Development (TDD)** as the mandatory development methodology for all code in the SiloBreaker project.

### Core Principles

1. **Red-Green-Refactor Cycle**
   - 🔴 **RED**: Write a failing test before any implementation code
   - 🟢 **GREEN**: Write minimal code to make the test pass
   - 🔵 **REFACTOR**: Improve code quality while keeping tests green

2. **No Code Without Tests**
   - All production code must be preceded by a test
   - Code reviews must verify tests were written first
   - PR template includes TDD checklist

3. **Testing Pyramid**
   - 70% Unit Tests (fast, isolated)
   - 20% Integration Tests (service boundaries)
   - 10% E2E Tests (critical paths)

4. **Coverage Requirements**
   - Minimum 80% overall coverage (enforced by CI)
   - Domain layer: 95%+ (critical business logic)
   - Services: 90%+ (application logic)
   - Repositories: 85%+ (data access)

### Test Types by Layer

**Unit Tests** (`tests/unit/`)

- Domain entities and value objects
- Service methods (with mocked repositories)
- Utility functions and algorithms
- No external dependencies
- Speed: <10ms per test

**Integration Tests** (`tests/integration/`)

- Repository operations with real Neo4j
- Service methods with real repositories
- GraphQL resolvers with real services
- SQLite schema extraction with real databases
- Speed: <1s per test

**E2E Tests** (`tests/e2e/`)

- Complete user workflows
- Discovery → Visualization → Federation
- Browser-based with Playwright
- All services running via Docker Compose
- Speed: <30s per test

### TDD Workflow Example

```typescript
// Step 1: 🔴 RED - Write failing test
describe('ConfidenceScorer', () => {
  it('should calculate confidence from name similarity and value overlap', () => {
    const scorer = new ConfidenceScorer();
    const result = scorer.calculate({
      nameSimilarity: 0.8,
      valueOverlap: 0.9,
    });
    expect(result).toBeCloseTo(0.85);
  });
});

// Result: ❌ Test fails (ConfidenceScorer doesn't exist)

// Step 2: 🟢 GREEN - Minimal implementation
export class ConfidenceScorer {
  calculate(metrics: { nameSimilarity: number; valueOverlap: number }): number {
    return (metrics.nameSimilarity + metrics.valueOverlap) / 2;
  }
}

// Result: ✅ Test passes

// Step 3: 🔵 REFACTOR - Improve implementation
export class ConfidenceScorer {
  calculate(metrics: SimilarityMetrics): ConfidenceScore {
    // Weighted average with validation
    this.validateMetrics(metrics);
    const weighted = metrics.nameSimilarity * 0.4 + metrics.valueOverlap * 0.6;
    return new ConfidenceScore(weighted);
  }

  private validateMetrics(metrics: SimilarityMetrics): void {
    // Additional logic
  }
}

// Result: ✅ Tests still pass, code is better
```

### Test Infrastructure

**Local Development:**

- Jest for backend unit/integration tests
- Vitest for frontend tests
- Playwright for E2E tests
- Separate Neo4j test instance (port 7688)

**CI/CD:**

- GitHub Actions with Neo4j service container
- Parallel test execution
- Coverage reporting to Codecov
- Coverage diff in PR comments

**Test Data:**

- Fixtures in `tests/fixtures/`
- Small subsets of Chinook/Northwind/Sakila
- Seed scripts for Neo4j test data
- Cleaned up after each test

### Enforcement Mechanisms

1. **Pre-commit Hooks** (Husky)
   - Run unit tests before commit
   - Block commit if tests fail
   - Type-check and lint enforcement

2. **CI/CD Gates**
   - All tests must pass
   - Coverage must be ≥80%
   - No decrease in coverage allowed

3. **Code Review Checklist**
   - [ ] Tests written before implementation
   - [ ] All new code has tests
   - [ ] Tests follow TDD patterns
   - [ ] Coverage increased or maintained

4. **PR Template**

   ```markdown
   ## TDD Checklist

   - [ ] Wrote tests first (red)
   - [ ] Implemented minimal code (green)
   - [ ] Refactored for quality (refactor)
   - [ ] Coverage ≥80%
   ```

## Consequences

### Positive

1. **Higher Code Quality**
   - TDD forces small, focused functions
   - Natural dependency injection
   - Clear interfaces and contracts

2. **Living Documentation**
   - Tests describe how code should behave
   - Examples of usage patterns
   - Easier onboarding for new developers

3. **Confident Refactoring**
   - Green tests provide safety net
   - Can improve design without fear
   - Reduces technical debt accumulation

4. **Early Bug Detection**
   - Issues caught before code review
   - Regression prevention
   - Faster debugging (pinpoint failures)

5. **Design-First Thinking**
   - API designed before implementation
   - Forces consideration of edge cases
   - Prevents over-engineering

6. **Better Architecture**
   - Testable code is naturally decoupled
   - Respects layer boundaries
   - Easier to maintain

### Negative

1. **Initial Slowdown**
   - TDD feels slower at first
   - Learning curve for developers new to TDD
   - More upfront thinking required

2. **Test Maintenance**
   - Tests need updating when requirements change
   - Can accumulate technical debt if not maintained
   - Brittle tests if written poorly

3. **Over-Testing Temptation**
   - Risk of testing implementation details
   - Need discipline to test behavior, not internals
   - Can lead to fragile test suites

4. **Discipline Required**
   - Easy to skip "red" phase
   - Tempting to write code first when "you know the solution"
   - Requires team buy-in and enforcement

### Mitigations

1. **TDD Training**
   - Pair programming sessions
   - Code review feedback on TDD practices
   - Documentation in `docs/TESTING.md`

2. **Clear Guidelines**
   - Testing patterns documented
   - Examples for each layer
   - Anti-patterns to avoid

3. **Tooling Support**
   - Watch mode for instant feedback
   - Coverage visualization
   - Fast test execution (<5min for full suite)

4. **Cultural Enforcement**
   - TDD as non-negotiable requirement
   - Code review rejects code without tests
   - Celebrate good testing practices

5. **Test Quality Standards**
   - Tests must be readable
   - Use Arrange-Act-Assert pattern
   - Mock only external dependencies
   - No testing of private methods

## Alternatives Considered

### 1. Test-After Development

**Rejected:** Leads to low coverage, brittle tests, poor design

### 2. Behavior-Driven Development (BDD)

**Considered:** Too verbose for our use case. TDD provides sufficient structure without Gherkin overhead.

### 3. Property-Based Testing (e.g., fast-check)

**Complementary:** Will add for algorithms (similarity, scoring) but not primary strategy.

### 4. Mutation Testing

**Future:** May add in Phase 6 to verify test quality, but not required initially.

### 5. No Testing Strategy

**Rejected:** Unacceptable for production-grade system with complex algorithms and multiple developers.

## Compliance Mechanism

### CI/CD Enforcement

```yaml
# .github/workflows/ci.yml
- name: Run tests with coverage
  run: npm run test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run test:unit || exit 1
```

### Code Review Template

```markdown
## Testing

- [ ] All new code has tests
- [ ] Tests written before implementation (TDD)
- [ ] Coverage ≥80%
- [ ] No fragile tests (implementation coupling)
```

### Documentation

- `docs/TESTING.md` - Comprehensive TDD guide
- Test examples in each Epic
- Fixtures and helpers provided

## Success Metrics

- **Coverage:** Maintain ≥80% across all packages
- **Test Speed:** Full suite <5 minutes
- **Test Reliability:** <1% flakiness rate
- **Regression Rate:** <5% bugs in tested code
- **Developer Satisfaction:** TDD perceived as helpful, not burden

## Review Date

Reassess TDD strategy after Phase 2 (Week 7) based on:

- Developer feedback
- Test suite maintenance burden
- Coverage trends
- Bug detection effectiveness
