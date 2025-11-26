#!/bin/bash

# Script to push the template repository to GitHub

echo "Pushing template to GitHub..."

cd ~/BenedictSmith/typescript-monorepo-template

# Initialize new git repo
echo "1. Initializing git repository..."
git init
git add .
git commit -m "feat: initial TypeScript monorepo template

Production-ready monorepo template featuring:
- Backend: Node.js + TypeScript + Apollo Server
- Frontend: React + TypeScript + Vite
- Shared packages with npm workspaces
- TDD infrastructure (Jest + Vitest)
- CI/CD with GitHub Actions
- Git hooks with Husky
- Comprehensive documentation

Ready to use as a GitHub template repository."

# Create GitHub repo
echo "2. Creating GitHub repository..."
gh repo create typescript-monorepo-template \
  --public \
  --description "Production-ready TypeScript monorepo template with TDD, CI/CD, and best practices" \
  --source=. \
  --push

echo ""
echo "✅ Template repository created!"
echo ""
echo "📝 Final steps:"
echo "   1. Mark as template at: https://github.com/BenedictSmith/typescript-monorepo-template/settings"
echo "   2. Check 'Template repository' box"
echo "   3. Also mark dickon as template at: https://github.com/BenedictSmith/dickon/settings"
