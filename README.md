# Dickon

A project inspired by Dickon from The Secret Garden - a shared workspace for collaborative development.

> 📊 **[View Complete Project State](PROJECT_STATE.md)** - Central index with architecture diagrams, documentation map, and current status.

## Project: SiloBreaker

**SiloBreaker** is a production-grade system for automated discovery, federation, and visualization of relationships across disparate SQLite databases, using knowledge graphs to break down enterprise data silos.

### Key Features

- **Automated Discovery**: Intelligently detects relationships between databases using schema analysis and value overlap
- **Knowledge Graph**: Uses Neo4j to map and visualize cross-database relationships
- **Visual Exploration**: Interactive D3.js force-directed graphs for exploring data connections
- **Federated Queries**: Execute queries spanning multiple SQLite databases
- **Type-Safe**: Full TypeScript coverage from backend to frontend

### Technology Stack

- **Backend**: Node.js 20+, TypeScript 5+, Apollo Server 4 (GraphQL), Neo4j 5+
- **Frontend**: React 18+, TypeScript, D3.js v7, Apollo Client, Tailwind CSS
- **Infrastructure**: Docker Compose, GitHub Actions, ESLint, Prettier

## Quick Links

- 📊 **[PROJECT_STATE.md](PROJECT_STATE.md)** - Project overview, documentation index, architecture diagrams
- 👥 **[WORK_SPLIT.md](WORK_SPLIT.md)** - Ben/Carsten work division and timeline
- ⚡ **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup and command-line workflow guide
- 🚀 **[SETUP.md](SETUP.md)** - Installation and activation guide
- 🧪 **[TESTING.md](docs/TESTING.md)** - TDD strategy and testing guide
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow and guidelines
- 🗺️ **[ROADMAP.md](ROADMAP.md)** - Project phases and epics
- 🏗️ **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- 📋 **[SILOBREAKER.md](docs/SILOBREAKER.md)** - Detailed technical design

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/BenedictSmith/dickon.git
cd dickon

# Start services with Docker Compose
docker-compose up -d

# Install dependencies (for local development)
npm install
```

### Running the Project

```bash
# Development mode
docker-compose up

# Backend only
cd apps/backend && npm run dev

# Frontend only
cd apps/frontend && npm run dev

# Run tests
npm test
```

## Documentation

**Start here:** [PROJECT_STATE.md](PROJECT_STATE.md) - Complete project overview with:

- 📚 Documentation index and links
- 🏗️ Interactive Mermaid architecture diagrams
- 📊 Current phase status and metrics
- ✅ Setup checklist
- 🗺️ Folder structure map

**Core Docs:**

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture overview
- [SILOBREAKER.md](docs/SILOBREAKER.md) - Detailed technical design
- [ADR/](docs/ADR/) - Architecture decision records

## Workflow with Carsten

When either of you wants to make changes:

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and push:**

   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/your-feature-name
   ```

3. **Create a PR on GitHub** - the template will guide you through the checklist

4. **Request review** from the other person

5. **After approval**, merge the PR

The branch protection ensures you can't accidentally push directly to master - everything goes through PRs with review!

## Repository Configuration

### Branch Protection (master branch):

- Requires pull request before merging
- Requires 1 approval before merge
- Dismisses stale reviews when new commits are pushed
- Blocks force pushes and branch deletion

### GitHub Labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `question` - Further information requested
- `idea` - Feature idea for discussion
- `in progress` - Currently being worked on

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed workflow and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details
