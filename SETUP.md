# SiloBreaker Setup Guide

This guide will help you complete the setup of the SiloBreaker development environment.

## Current Status

✅ **Configuration Files Created:**

- package.json with monorepo setup
- TypeScript configuration (strict mode)
- ESLint with architectural rules
- Dependency-cruiser for layer enforcement
- Prettier formatting
- Docker Compose with Neo4j
- GitHub Actions CI/CD
- VS Code settings
- Git hooks templates (.husky/)
- Testing documentation

❌ **Still Need to Install:**

- Node.js dependencies
- Husky git hooks
- Sample SQLite databases

---

## Step 1: Install Dependencies

```bash
# Install all dependencies (this will take a few minutes)
npm install

# This installs:
# - TypeScript, ESLint, Prettier
# - Turbo (monorepo build tool)
# - Dependency-cruiser
# - Husky (git hooks)
# - All dev dependencies
```

**Expected output:**

```
added 500+ packages in 2m
```

---

## Step 2: Initialize Husky Git Hooks

```bash
# Initialize Husky (this sets up the .husky directory)
npm run prepare

# This will:
# - Install git hooks
# - Enable pre-commit checks
# - Enable commit-msg validation
```

**Expected output:**

```
husky - Git hooks installed
```

**What this does:**

- `.husky/pre-commit` → Runs before each commit
  - Type checking
  - Linting
  - Dependency rules
  - Unit tests
- `.husky/commit-msg` → Validates commit message format
  - Enforces: `type(scope): description`
  - Examples: `feat(discovery): add algorithm`

---

## Step 3: Verify Git Hooks Work

```bash
# Try making a commit with bad format (should fail)
git commit --allow-empty -m "bad commit"

# Expected output:
# ❌ Invalid commit message format!

# Try with correct format (should succeed)
git commit --allow-empty -m "test: verify git hooks are working"

# Expected output:
# 🔍 Running pre-commit checks...
# 📘 Type checking...
# 🔧 Linting...
# 🔗 Checking architectural boundaries...
# 🧪 Running unit tests...
# ✅ All checks passed!
# ✅ Commit message format valid
```

**Note:** The pre-commit checks will be very fast initially because there's no code yet. Once you add code, they'll run your actual tests.

---

## Step 4: Download Sample SQLite Databases

These databases are used for development and testing.

### Option A: Download from Official Sources

1. **Chinook Database** (Music store)

   ```bash
   # Download from: https://github.com/lerocha/chinook-database
   curl -L https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite -o data/chinook.db
   ```

2. **Northwind Database** (Orders/Products)

   ```bash
   # Download from: https://github.com/jpwhite3/northwind-SQLite3
   curl -L https://raw.githubusercontent.com/jpwhite3/northwind-SQLite3/master/dist/northwind.db -o data/northwind.db
   ```

3. **Sakila Database** (DVD rental)
   ```bash
   # Download from: https://github.com/bradleygrant/sakila-sqlite3
   curl -L https://github.com/bradleygrant/sakila-sqlite3/raw/master/sakila.db -o data/sakila.db
   ```

### Option B: Create Test Databases

```bash
# Create the data directory
mkdir -p data

# You can also create small test databases manually
# (We'll create proper test fixtures during Phase 1)
```

---

## Step 5: Start Development Environment

```bash
# Start Neo4j and other services
docker-compose up -d

# Check services are running
docker-compose ps

# Expected output:
# NAME                IMAGE        STATUS
# dickon-neo4j        neo4j:5.13   Up (healthy)
```

**Access Neo4j Browser:**

- URL: http://localhost:7474
- Username: neo4j
- Password: dickon-ktb3

---

## Step 6: Verify Everything Works

```bash
# Type check (should pass with no code)
npm run type-check

# Lint (should pass with no code)
npm run lint

# Check dependencies (should pass)
npm run check:deps

# Run tests (no tests yet, but should not error)
npm test
```

**Expected output for all commands:**

```
✅ All checks passed
```

---

## Step 7: Create Your First Branch

```bash
# Make sure you're on master
git checkout master
git pull origin master

# Create a feature branch for Phase 1
git checkout -b feature/phase-0-setup-verification

# Make a test file to verify setup
echo "// Setup verification" > apps/backend/setup-test.ts

# Try to commit (hooks will run)
git add apps/backend/setup-test.ts
git commit -m "test: verify development environment setup"

# If hooks pass, clean up
git reset HEAD~1
rm apps/backend/setup-test.ts
git checkout master
```

---

## Troubleshooting

### Husky Not Working

```bash
# Reinstall Husky
rm -rf .husky/_
npm run prepare

# Make sure hooks are executable (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d

# View logs
docker-compose logs neo4j
```

### ESLint Errors

```bash
# The apps/ folders are empty, so ESLint might complain
# This is normal until we add actual TypeScript files

# To test ESLint works:
echo "const x: any = 5;" > apps/backend/test.ts
npm run lint
# Should show error about 'any' type

# Clean up
rm apps/backend/test.ts
```

### Dependencies Won't Install

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Next Steps After Setup

Once everything is installed and verified:

1. **Read the documentation:**
   - `docs/ARCHITECTURE.md` - System design
   - `docs/TESTING.md` - TDD workflow
   - `CONTRIBUTING.md` - Development workflow

2. **Plan Phase 1 with Carsten:**
   - Review `ROADMAP.md`
   - Decide on Epic 1.1 implementation approach
   - Assign tasks

3. **Start coding with TDD:**

   ```bash
   # Create feature branch
   git checkout -b feature/epic-1.1-schema-extraction

   # Start test watch mode
   npm run test:unit -- --watch

   # Write failing test
   # Implement code
   # Refactor
   # Commit
   ```

---

## Verification Checklist

Before starting Phase 1, ensure:

- [ ] `npm install` completed successfully
- [ ] `npm run prepare` initialized Husky
- [ ] Git hooks are working (test with a commit)
- [ ] Docker Compose brings up Neo4j (http://localhost:7474)
- [ ] Neo4j is accessible with password: dickon-ktb3
- [ ] Sample databases downloaded (chinook, northwind, sakila)
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run check:deps` passes
- [ ] VS Code is using workspace TypeScript
- [ ] Prettier formats on save in VS Code
- [ ] You've read TESTING.md
- [ ] You've read CONTRIBUTING.md
- [ ] You understand the TDD workflow

---

## Questions?

- **Architecture**: See `docs/ARCHITECTURE.md`
- **Testing**: See `docs/TESTING.md`
- **Contributing**: See `CONTRIBUTING.md`
- **GitHub Issues**: Create an issue with `question` label
- **Ask Carsten**: Pair program for setup help

---

## Summary of Enforcement Mechanisms

### 🪨 Pebbles (Hard Blocks)

- ✅ Pre-commit hooks (Husky) - **ACTIVE after `npm install`**
- ✅ Commit message validation - **ACTIVE after `npm install`**
- ✅ GitHub Actions CI - **ACTIVE** (runs on every push)
- ✅ Branch protection - **ACTIVE** (configured on GitHub)
- ✅ ESLint architectural rules - **ACTIVE** (runs in hooks & CI)
- ✅ TypeScript strict mode - **ACTIVE** (runs in hooks & CI)
- ✅ Coverage threshold - **WILL BE ACTIVE** (when tests exist)

### 🍞 Breadcrumbs (Soft Guidance)

- ✅ VS Code settings - **ACTIVE** (formatting, linting)
- ✅ Prettier - **ACTIVE** (auto-format on save)
- ✅ Documentation - **READY** (all docs created)
- ✅ PR template - **ACTIVE** (TDD checklist)
- ✅ Commit examples - **DOCUMENTED** (in CONTRIBUTING.md)

**After `npm install` and `npm run prepare`, all pebbles will be active!**
