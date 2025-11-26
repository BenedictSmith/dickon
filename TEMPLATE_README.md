# TypeScript Monorepo Template

**Production-ready TypeScript monorepo template with best practices baked in.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- ✅ **Monorepo Structure** - npm workspaces + Turbo for fast builds
- ✅ **Backend** - Node.js + TypeScript + Apollo Server
- ✅ **Frontend** - React 18 + TypeScript + Vite
- ✅ **Shared Packages** - Types and utilities
- ✅ **TDD Ready** - Jest (backend) + Vitest (frontend) with coverage
- ✅ **Strict Linting** - ESLint + Prettier + architectural rules
- ✅ **Git Hooks** - Husky pre-commit hooks (type-check, lint, test)
- ✅ **CI/CD** - GitHub Actions workflow
- ✅ **Docker** - Docker Compose for services
- ✅ **Documentation** - Comprehensive guides and ADRs

## Quick Start

### Use This Template

```bash
# Click "Use this template" button above, or:
gh repo create my-awesome-project --template BenedictSmith/typescript-monorepo-template --public
cd my-awesome-project
npm install
```

### Verify Setup

```bash
npm run type-check  # TypeScript compilation
npm run lint        # Code quality
npm test           # Run all tests
npm run dev        # Start development
```

## Documentation

- 📊 **[PROJECT_STATE.md](PROJECT_STATE.md)** - Central project index
- ⚡ **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- 🚀 **[SETUP.md](SETUP.md)** - Detailed installation guide
- 🧪 **[TESTING.md](docs/TESTING.md)** - TDD strategy
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow

## Technology Stack

### Backend
- Node.js 20+ | TypeScript 5+ | Apollo Server 4 | Jest

### Frontend
- React 18 | Vite 5 | TypeScript | Vitest | Tailwind CSS

### Infrastructure
- npm workspaces | Turbo | ESLint | Prettier | Husky | Docker Compose

## Key Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev mode |
| `npm test` | Run all tests |
| `npm run lint` | Check code quality |
| `docker-compose up -d` | Start services |

## Customization

After creating from this template:

1. Update package names in all `package.json` files
2. Update this README with your project details
3. Modify placeholder code in `apps/`
4. Update `PROJECT_STATE.md` with your roadmap

## License

MIT - see [LICENSE](LICENSE)

## Credits

Created by [Benedict Smith](https://github.com/BenedictSmith)

---

**Ready to build? Click "Use this template" above!**
