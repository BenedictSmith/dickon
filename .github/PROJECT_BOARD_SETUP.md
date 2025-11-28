# GitHub Project Board Setup Guide

## Project Configuration

**Project Name:** SiloBreaker Development
**Description:** Track development progress across all phases of the SiloBreaker project

**View Type:** Board (Kanban style)

## Columns/Status Fields

Create the following columns in this order:

1. **📋 Backlog** - Future work not yet started
2. **🎯 Ready** - Ready to be worked on
3. **🚧 In Progress** - Currently being developed
4. **👀 In Review** - PR created, awaiting review
5. **✅ Done** - Completed and merged

## Custom Fields

Add these custom fields to track additional metadata:

### 1. Phase

- **Type:** Single Select
- **Options:**
  - Phase 0: Foundation
  - Phase 1: Schema Discovery
  - Phase 2: Relationship Discovery
  - Phase 3: Graph Visualization
  - Phase 4: Query Federation
  - Phase 5: Entity Resolution

### 2. Epic

- **Type:** Text
- **Purpose:** Track which epic the issue belongs to (e.g., "Epic 3.1")

### 3. Owner

- **Type:** Single Select
- **Options:**
  - Ben (Backend)
  - Carsten (Frontend)
  - Both

### 4. Priority

- **Type:** Single Select
- **Options:**
  - 🔴 High
  - 🟡 Medium
  - 🟢 Low

### 5. Estimate

- **Type:** Number
- **Purpose:** Story points or day estimate

## Initial Issue Organization

### Phase 0-2 (Completed)

Move to **✅ Done**:

- Issues #1-4 (already closed)
- Any merged PRs from Phase 1-2

### Phase 3 (Next Up)

Move to **🎯 Ready**:

- Issue #12: Epic 3.4 - Graph Data API (Backend - Ben should start here)
- Issue #9: Epic 3.1 - D3.js Graph Component (Frontend - Carsten)

Move to **📋 Backlog**:

- Issue #10: Epic 3.2 - Interactive Graph Features (depends on #9)
- Issue #11: Epic 3.3 - Graph Layout Options (depends on #9)

## Automation Rules

Set up these automations:

1. **When issue closed** → Move to **✅ Done**
2. **When PR created** → Move linked issues to **👀 In Review**
3. **When PR merged** → Move linked issues to **✅ Done**
4. **When assigned** → Move to **🚧 In Progress** (if in Ready)

## Views

Create these additional views:

### By Phase

- **Type:** Board
- **Group by:** Phase field
- **Purpose:** See work organized by project phase

### By Owner

- **Type:** Board
- **Group by:** Owner field
- **Purpose:** See Ben vs Carsten workload

### Timeline

- **Type:** Roadmap
- **Purpose:** Visualize project timeline and dependencies

## Labels

The following labels are already created:

- `enhancement` - New features
- `bug` - Bug fixes
- `phase-3` - Phase 3 work
- `backend` - Backend work
- `frontend` - Frontend work

## Quick Setup Steps

1. Go to https://github.com/BenedictSmith/dickon/projects
2. Click "New project"
3. Choose "Board" template
4. Name it "SiloBreaker Development"
5. Add the 5 status columns listed above
6. Add the 5 custom fields listed above
7. Add all open issues to the project
8. Organize issues according to "Initial Issue Organization" section
9. Set up automation rules
10. Create additional views

## Maintenance

- **Weekly:** Review and update issue statuses
- **Sprint planning:** Move issues from Backlog to Ready
- **After merges:** Ensure completed work is in Done
- **New work:** Create issues and add to project with appropriate phase/epic tags

---

**Note:** This setup provides clear visibility into:

- What's been completed (Phases 0-2)
- What's next (Phase 3 epics)
- Who owns what (Ben vs Carsten)
- Progress tracking (status columns)
