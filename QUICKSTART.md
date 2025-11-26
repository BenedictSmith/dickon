# Quick Start Guide

**Get up and running with SiloBreaker in 5 minutes.**

## Prerequisites

Ensure you have these installed:
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)

Verify installations:
```bash
node --version    # Should be v20.x or higher
docker --version  # Should be 20.x or higher
git --version     # Any recent version
```

## One-Time Setup

### 1. Clone Repository

```bash
git clone https://github.com/BenedictSmith/dickon.git
cd dickon
```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all packages (backend, frontend, shared)
- Set up Husky git hooks (pre-commit, commit-msg, pre-push)
- Install ESLint, TypeScript, Jest, etc.

### 3. Start Services

```bash
docker-compose up -d
```

This starts:
- **Neo4j** (graph database) on ports 9474 (HTTP) and 9687 (Bolt)
- Available at: http://localhost:9474
- Credentials: `neo4j` / `dickon-ktb3`

### 4. Verify Setup

```bash
# Check everything works
npm run type-check   # TypeScript compilation
npm run lint         # Code quality
npm test            # Run tests
```

If all pass: **You're ready to code!** 🎉

---

## Daily Development Workflow

### Start Coding Session

```bash
# 1. Start services
docker-compose up -d

# 2. Pull latest changes
git checkout master
git pull origin master

# 3. Create feature branch (see naming below)
git checkout -b feature/your-feature-name

# 4. Start tests in watch mode (separate terminal)
npm run test:unit -- --watch
```

### While Coding

**Follow TDD (Test-Driven Development):**
1. 🔴 Write a failing test
2. 🟢 Write minimal code to pass
3. 🔵 Refactor while keeping tests green

**Run checks frequently:**
```bash
npm run lint         # Check code style
npm test            # Run all tests
npm run type-check  # Check TypeScript
```

### Before Committing

**Hooks will automatically run:**
- Type checking
- Linting
- Dependency rules check
- Unit tests

If any fail, your commit is blocked. Fix issues first.

### End Coding Session

```bash
# Stop services
docker-compose down

# Or keep them running for next session
docker-compose stop
```

---

## Command-Line Workflow (For Carsten)

### Branch Management

**Create feature branch:**
```bash
# Always start from master
git checkout master
git pull origin master

# Create and switch to new branch
git checkout -b feature/epic-1.1-schema-extraction
```

**Branch naming convention:**
```bash
feature/epic-X.Y-description    # New features
fix/description                 # Bug fixes
test/description                # Test additions
docs/description                # Documentation
refactor/description            # Code refactoring
chore/description               # Build/config changes
```

**Examples:**
```bash
git checkout -b feature/epic-1.1-schema-extraction
git checkout -b feature/discovery-algorithm
git checkout -b fix/neo4j-connection-leak
git checkout -b test/add-integration-tests
git checkout -b refactor/extract-confidence-scorer
```

### Making Changes

**Check status:**
```bash
git status              # See modified files
git diff                # See changes
git diff --staged       # See staged changes
```

**Stage and commit:**
```bash
# Stage specific files
git add src/services/SchemaService.ts
git add tests/unit/services/SchemaService.test.ts

# Or stage all changes
git add .

# Commit with proper format
git commit -m "feat(schema): add SQLite schema extraction

Implements SchemaExtractor service to read table and column
metadata from SQLite databases using PRAGMA statements.

Part of Epic 1.1 - Schema Extraction"
```

**Commit message format:**
```
type(scope): brief description

Longer explanation of what and why.
Can span multiple lines.

Part of Epic X.Y
Closes #123
```

**Types:** `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `perf`, `chore`

### Pushing and Creating PR

**Push branch:**
```bash
# First push (creates remote branch)
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

**Create PR via GitHub CLI:**
```bash
gh pr create \
  --title "feat(schema): Add SQLite schema extraction" \
  --body "## Description
Implements SchemaExtractor service for Epic 1.1

## TDD Checklist
- [x] Wrote tests first
- [x] Implementation passes tests
- [x] Refactored for quality

## Testing
- [x] Unit tests added
- [x] All tests passing
- [x] Coverage maintained >80%"

# Or create PR via web
# Push will show a URL to create PR
```

**Request review:**
```bash
# Request review from Benedict
gh pr review --request @BenedictSmith

# Or via web: go to PR and click "Request Review"
```

### Working with PRs

**Check PR status:**
```bash
gh pr status              # Your PRs
gh pr view 123            # View specific PR
gh pr checks              # See CI status
```

**Update PR after feedback:**
```bash
# Make changes
git add .
git commit -m "refactor: address review feedback"
git push

# PR updates automatically
```

**Merge PR:**
```bash
# After approval via web UI or CLI
gh pr merge 123 --squash   # Squash commits
gh pr merge 123 --merge    # Keep commits
gh pr merge 123 --rebase   # Rebase commits
```

### Syncing with Master

**Update your branch with latest master:**
```bash
# Save your work first
git add .
git commit -m "wip: save progress"

# Get latest master
git checkout master
git pull origin master

# Back to your branch and merge
git checkout feature/your-feature
git merge master

# Resolve conflicts if any
# Then continue working
```

**Or use rebase (cleaner history):**
```bash
git checkout feature/your-feature
git fetch origin
git rebase origin/master

# Resolve conflicts if any
git rebase --continue

# Force push (rebase rewrites history)
git push --force-with-lease
```

### Checking Out Others' Branches

**View all branches:**
```bash
git branch -a             # All branches
gh pr list                # Open PRs
```

**Check out Benedict's branch:**
```bash
# Fetch all remote branches
git fetch origin

# Check out the branch
git checkout feature/benedicts-feature

# Or create local branch tracking remote
git checkout -b feature/benedicts-feature origin/feature/benedicts-feature
```

**Test their changes:**
```bash
npm install              # Install any new dependencies
npm run type-check
npm run lint
npm test
```

### Cleaning Up

**Delete merged branches:**
```bash
# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

**List merged branches:**
```bash
git branch --merged master
```

---

## Common Tasks

### Run Specific Tests

```bash
# Single test file
npm run test:unit -- SchemaService.test.ts

# Pattern matching
npm run test:unit -- Schema

# Watch mode
npm run test:unit -- --watch

# With coverage
npm run test:unit -- --coverage
```

### Check Test Coverage

```bash
npm run test:unit -- --coverage

# Opens HTML report
open coverage/lcov-report/index.html
```

### Fix Linting Issues

```bash
# See issues
npm run lint

# Auto-fix what's possible
npm run lint -- --fix
```

### Format Code

```bash
# Format all files
npm run format

# Check formatting (don't change)
npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
```

### Check Architectural Boundaries

```bash
# Verify no layer violations
npm run check:deps

# See dependency graph
npx depcruise --output-type dot apps packages | dot -T svg > dependency-graph.svg
```

### Access Neo4j Browser

```bash
# Open in browser
open http://localhost:9474

# Or direct Bolt connection
# bolt://localhost:9687
# Username: neo4j
# Password: dickon-ktb3

# Query from command line
docker exec -it dickon-neo4j cypher-shell -u neo4j -p dickon-ktb3
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f          # All services
docker-compose logs -f neo4j    # Specific service

# Restart service
docker-compose restart neo4j

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

### Reset Everything

```bash
# Nuclear option: fresh start
docker-compose down -v           # Remove containers and volumes
rm -rf node_modules              # Delete dependencies
npm install                      # Reinstall
docker-compose up -d             # Restart services
npm test                         # Verify
```

---

## Project Structure

```
dickon/
├── apps/
│   ├── backend/           # Node.js GraphQL API
│   │   ├── src/
│   │   │   ├── resolvers/ # GraphQL resolvers
│   │   │   ├── services/  # Business logic
│   │   │   ├── repositories/ # Data access
│   │   │   └── domain/    # Domain entities
│   │   └── package.json
│   └── frontend/          # React + D3.js UI
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       └── package.json
├── packages/
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Shared utilities
├── tests/
│   ├── unit/              # Fast, isolated tests
│   ├── integration/       # Service boundary tests
│   ├── e2e/               # End-to-end tests
│   └── fixtures/          # Test data
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── SILOBREAKER.md
│   ├── TESTING.md
│   └── ADR/               # Architecture decisions
├── PROJECT_STATE.md       # 📊 START HERE
├── README.md
├── SETUP.md
├── CONTRIBUTING.md
├── ROADMAP.md
└── package.json           # Root workspace
```

---

## Key Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start all services |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:unit -- --watch` | Watch mode |
| `npm run lint` | Check code quality |
| `npm run type-check` | TypeScript validation |
| `npm run check:deps` | Architectural rules |
| `npm run format` | Format all files |
| `docker-compose up -d` | Start services |
| `docker-compose down` | Stop services |
| `gh pr create` | Create pull request |
| `gh pr list` | List open PRs |

---

## Troubleshooting

### "npm install fails"

```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Docker won't start"

```bash
# Check Docker is running
docker ps

# Restart Docker Desktop
# Then try again
docker-compose up -d
```

### "Tests fail with Neo4j connection error"

```bash
# Check Neo4j is running
docker ps | grep neo4j

# View Neo4j logs
docker-compose logs neo4j

# Restart Neo4j
docker-compose restart neo4j
```

### "Git hooks aren't running"

```bash
# Reinstall hooks
npm run prepare

# Check hooks exist
ls -la .husky/
```

### "Pre-commit hook fails"

```bash
# Run checks manually to see errors
npm run type-check
npm run lint
npm run test:unit

# Fix issues, then commit again
```

### "Merge conflicts"

```bash
# See conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<, ======, >>>>>> markers

# After fixing
git add .
git commit  # No message needed for merge commits
```

---

## Getting Help

- 📊 **[PROJECT_STATE.md](PROJECT_STATE.md)** - Project overview and documentation index
- 🏗️ **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design
- 🧪 **[TESTING.md](docs/TESTING.md)** - TDD guide
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow
- 🗺️ **[ROADMAP.md](ROADMAP.md)** - Project phases

**Questions?**
- Open an issue on GitHub
- Ask in PR reviews
- Tag @BenedictSmith in comments

---

## Next Steps

1. ✅ Complete setup above
2. 📚 Read [PROJECT_STATE.md](PROJECT_STATE.md)
3. 🏗️ Review [ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. 🧪 Read [TESTING.md](docs/TESTING.md)
5. 🚀 Start with Epic 1.1 - Schema Extraction

**Ready to contribute? Create your first feature branch:**

```bash
git checkout -b feature/epic-1.1-schema-extraction
npm run test:unit -- --watch
# Start coding with TDD!
```
