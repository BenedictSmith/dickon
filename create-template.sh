#!/bin/bash

# Script to create typescript-monorepo-template from dickon

echo "Creating TypeScript Monorepo Template..."

cd ~/BenedictSmith

# Clone dickon
echo "1. Cloning dickon repository..."
git clone https://github.com/BenedictSmith/dickon.git typescript-monorepo-template
cd typescript-monorepo-template

# Remove project-specific files
echo "2. Removing project-specific files..."
rm -rf data/
rm -f docs/SILOBREAKER.md docs/ARCHITECTURE.md
rm -f ROADMAP.md WORK_SPLIT.md

# Remove git history
echo "3. Removing git history..."
rm -rf .git

echo "4. Template ready! Now run the update scripts in Windows to update README and PROJECT_STATE"
echo "   Then come back here to initialize and push"

echo ""
echo "Next steps:"
echo "  1. Wait for Windows scripts to update files"
echo "  2. Then run: ./push-template.sh"
