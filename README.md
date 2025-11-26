# Dickon

A project inspired by Dickon from The Secret Garden - a shared workspace for collaborative development.

## Getting Started

### Prerequisites
- [List required software, versions]

### Installation
```bash
# Clone the repository
git clone https://github.com/BenedictSmith/dickon.git
cd dickon

# Installation steps
```

### Running the Project
```bash
# Commands to run the project
```

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
