# Contributing to Dickon

## Table of Contents
- [Test-Driven Development](#test-driven-development)
- [Workflow](#workflow)
- [Testing Requirements](#testing-requirements)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Test-Driven Development

**SiloBreaker follows strict TDD.** All production code must be written using the Red-Green-Refactor cycle.

### TDD Workflow

1. **🔴 RED**: Write a failing test first
   ```typescript
   it('should calculate levenshtein distance', () => {
     expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
   });
   ```

2. **🟢 GREEN**: Write minimal code to pass
   ```typescript
   export function levenshteinDistance(a: string, b: string): number {
     // Implement algorithm
     return result;
   }
   ```

3. **🔵 REFACTOR**: Improve while keeping tests green
   ```typescript
   export function levenshteinDistance(a: string, b: string): number {
     // Optimized implementation with validation
     this.validate(a, b);
     return this.calculate(a, b);
   }
   ```

**See [docs/TESTING.md](docs/TESTING.md) for comprehensive TDD guide.**

---

## Workflow

### 1. Create a Feature Branch

```bash
# Start from master
git checkout master
git pull origin master

# Create feature branch
git checkout -b feature/epic-1.1-schema-extraction
```

**Branch naming:**
- `feature/` - New features (e.g., `feature/discovery-service`)
- `fix/` - Bug fixes (e.g., `fix/neo4j-connection-leak`)
- `test/` - Test-only changes (e.g., `test/add-integration-tests`)
- `docs/` - Documentation updates (e.g., `docs/update-testing-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-scorer-class`)

### 2. Write Tests First (TDD)

```bash
# Run tests in watch mode
npm run test:unit -- --watch

# Write failing test
# Implement minimal code
# Refactor
```

**Never write production code without a failing test first.**

### 3. Make Your Changes

- Write clear, focused commits
- Follow architectural boundaries (ESLint will enforce)
- Run linter: `npm run lint`
- Ensure tests pass: `npm test`

### 4. Verify Before Pushing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Check architectural boundaries
npm run check:deps

# Run all tests
npm test

# Check coverage
npm run test:unit -- --coverage
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

- Fill out the PR template (includes TDD checklist)
- Request review from your collaborator
- Link to related issues

### 6. Code Review

- Address feedback promptly
- Keep discussions respectful and constructive
- Update tests if requirements change
- Wait for approval before merging

---

## Testing Requirements

### Coverage Targets

| Layer           | Minimum Coverage |
| --------------- | ---------------- |
| Domain Entities | 95%              |
| Services        | 90%              |
| Repositories    | 85%              |
| Resolvers       | 80%              |
| Overall         | 80%              |

### Running Tests

```bash
# Unit tests (fast, no dependencies)
npm run test:unit

# Integration tests (requires Neo4j)
npm run test:integration

# E2E tests (requires all services)
npm run test:e2e

# All tests
npm test

# Watch mode (for TDD)
npm run test:unit -- --watch

# Specific file
npm run test:unit -- SchemaService.test.ts

# With coverage
npm run test:unit -- --coverage
```

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = createInput();

      // Act
      const result = service.method(input);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should handle edge case', () => {
      // Test edge case
    });

    it('should throw error for invalid input', () => {
      expect(() => service.method(invalid)).toThrow(ValidationError);
    });
  });
});
```

### Test File Location

```
src/services/SchemaService.ts
tests/unit/services/SchemaService.test.ts

src/repositories/Neo4jRepository.ts
tests/integration/repositories/Neo4jRepository.test.ts
```

---

## Code Style

### TypeScript Strict Mode

- No `any` types (enforced by ESLint)
- Explicit return types for functions
- Strict null checks
- No unused variables

### Formatting

```bash
# Format all files
npm run format

# Check formatting
npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
```

**Prettier will auto-format on save in VS Code.**

### Linting

```bash
# Lint all files
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Architectural Rules

ESLint enforces layer boundaries:
- ❌ Frontend cannot import backend
- ❌ Resolvers cannot import repositories directly (use services)
- ❌ Domain cannot depend on infrastructure
- ❌ Services cannot import resolvers

**Dependency-cruiser validates architecture:**

```bash
npm run check:deps
```

---

## Commit Guidelines

### Commit Message Format

```
type(scope): brief description

Longer explanation if needed.
Why this change was made.

Closes #123
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `refactor`: Code refactoring (no behavior change)
- `docs`: Documentation updates
- `style`: Code style changes (formatting, no logic change)
- `perf`: Performance improvements
- `chore`: Build process, dependency updates

### Examples

```bash
git commit -m "feat(discovery): add levenshtein distance algorithm

Implements string similarity calculation for column name matching.
Uses dynamic programming approach with O(mn) complexity.

Part of Epic 2.1 - Column Similarity Analysis"

git commit -m "test(schema): add integration tests for SQLite extraction

Tests cover:
- Table enumeration
- Column metadata extraction
- Foreign key detection

Closes #45"

git commit -m "fix(neo4j): prevent connection leak in repository

Ensures driver.close() is called in all error paths.
Adds connection pool monitoring."
```

### Pre-commit Hooks

Husky automatically runs before each commit:
- ✅ Type checking
- ✅ Linting
- ✅ Dependency rules
- ✅ Unit tests

**If any check fails, commit is blocked.**

---

## Pull Request Process

### PR Checklist

Before creating a PR, ensure:

- [ ] Tests written first (TDD red-green-refactor)
- [ ] All tests passing locally
- [ ] Coverage ≥80% (check with `--coverage`)
- [ ] No linting errors
- [ ] No type errors
- [ ] Architectural rules satisfied
- [ ] Documentation updated if needed
- [ ] Commit messages follow format

### PR Template

```markdown
## Description
[What does this PR do?]

## Type of Change
- [ ] New feature (Epic X.Y)
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation
- [ ] Tests only

## TDD Checklist
- [ ] Wrote tests before implementation (red phase)
- [ ] Implemented minimal code to pass (green phase)
- [ ] Refactored for quality (refactor phase)
- [ ] Coverage maintained or increased

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Coverage ≥80%

## Architectural Compliance
- [ ] No layer violations (ESLint passing)
- [ ] No circular dependencies (depcruise passing)
- [ ] Follows DDD patterns

## Checklist
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] No debugging code (console.log, etc.)
- [ ] Error handling is appropriate
- [ ] Types are explicit (no `any`)

## Related Issues
Closes #[issue number]
```

### Review Guidelines

**As a Reviewer:**
- Verify tests were written first
- Check for TDD anti-patterns
- Ensure coverage didn't decrease
- Validate architectural compliance
- Test the changes locally if complex
- Provide constructive feedback
- Approve when requirements are met

**As an Author:**
- Respond to feedback promptly
- Don't take criticism personally
- Update tests if behavior changes
- Ask questions if unclear
- Mark conversations resolved when addressed

### CI/CD Requirements

All checks must pass:
- ✅ Type checking
- ✅ Linting
- ✅ Dependency rules
- ✅ Unit tests
- ✅ Integration tests
- ✅ Code coverage ≥80%
- ✅ Build succeeds

**PRs with failing CI cannot be merged.**

---

## Local Development Setup

### First-Time Setup

```bash
# Clone repository
git clone https://github.com/BenedictSmith/dickon.git
cd dickon

# Install dependencies
npm install

# Start services
docker-compose up -d

# Verify setup
npm run type-check
npm run lint
npm test
```

### Daily Workflow

```bash
# Start dev environment
docker-compose up

# In another terminal: run tests in watch mode
npm run test:unit -- --watch

# Make changes following TDD
# Tests auto-run on save

# Before committing
npm run lint
npm test
npm run check:deps
```

---

## Getting Help

- **Architecture Questions**: See `docs/ARCHITECTURE.md`
- **Testing Questions**: See `docs/TESTING.md`
- **Technical Design**: See `docs/SILOBREAKER.md`
- **Decisions**: See `docs/ADR/`
- **Bugs**: Open an issue with `bug` label
- **Feature Ideas**: Open an issue with `idea` label

---

## Code of Conduct

- Be respectful and constructive
- Assume good intent
- Focus on the code, not the person
- Help each other learn
- Celebrate good work
- Document decisions
- Ask questions when unclear

---

## Branch Naming Reference

```
feature/epic-1.1-schema-extraction
feature/discovery-algorithm
fix/memory-leak-in-discovery
test/add-neo4j-integration-tests
refactor/extract-confidence-scorer
docs/update-api-documentation
chore/upgrade-dependencies
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/)
- [Test-Driven Development by Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
