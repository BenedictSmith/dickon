# GitHub Project Board Automation Setup

This guide explains how to configure automatic project board updates for the SiloBreaker Development project.

## Overview

The project board stays synchronized through two complementary systems:

1. **GitHub's Built-in Project Automations** - Native workflows within Projects
2. **GitHub Actions Workflows** - Custom automation for advanced scenarios

---

## Part 1: GitHub Built-in Project Automations

These are the easiest to set up and handle most common scenarios.

### Setup Steps

1. Go to your project: https://github.com/users/BenedictSmith/projects/2
2. Click the `⋯` menu (top right) → **Settings**
3. Click **Workflows** in the left sidebar
4. Enable the following workflows:

#### Workflow 1: Auto-add items

- **Trigger:** Item added to project
- **Action:** Set Status to "Todo"
- **Purpose:** All new issues/PRs start in the backlog

#### Workflow 2: Item closed

- **Trigger:** Item closed
- **Action:** Set Status to "Done"
- **Purpose:** Completed issues automatically move to Done

#### Workflow 3: Pull request merged

- **Trigger:** Pull request merged
- **Action:** Set Status to "Done"
- **Purpose:** Merged PRs move to Done

#### Workflow 4: Pull request opened/reopened

- **Trigger:** Pull request opened or reopened
- **Action:** Set Status to "In Review"
- **Purpose:** Active PRs move to In Review

#### Workflow 5: Issue/PR assigned

- **Trigger:** Issue or pull request assigned
- **Action:** Set Status to "In Progress"
- **Condition:** Only if current status is "Todo" or "Ready"
- **Purpose:** Self-assignment indicates work has started

### Expected Behavior

After setup, the project will automatically:

- ✅ Add new issues to the project in "Todo" status
- ✅ Move assigned issues to "In Progress"
- ✅ Move PRs to "In Review" when opened
- ✅ Move items to "Done" when closed or merged

---

## Part 2: GitHub Actions Automation

For advanced automation beyond GitHub's built-in workflows.

### Current Workflow

Location: `.github/workflows/project-automation.yml`

**Features:**

- Automatically adds new issues to the project
- Automatically adds new PRs to the project
- Logs automation events for debugging

### Setup Requirements

#### Step 1: Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set the following:
   - **Name:** `SiloBreaker Project Automation`
   - **Expiration:** 90 days (or custom)
   - **Scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `project` (Full control of projects)
     - ✅ `read:org` (Read org and team membership)
4. Click "Generate token"
5. **Copy the token immediately** (you won't see it again)

#### Step 2: Add Token as Repository Secret

1. Go to repository: https://github.com/BenedictSmith/dickon
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter:
   - **Name:** `PROJECT_TOKEN`
   - **Secret:** Paste the token from Step 1
5. Click **Add secret**

#### Step 3: Verify Workflow

1. The workflow is already committed to the repository
2. It will activate on the next issue or PR event
3. Check workflow runs: **Actions** tab → **Project Board Automation**

### Token Maintenance

**Important:** Personal Access Tokens expire!

- Set a calendar reminder to renew the token before expiration
- When renewing, generate a new token and update the `PROJECT_TOKEN` secret
- GitHub will email you before expiration

---

## Part 3: Manual Workflows

Some updates are better done manually for quality control.

### Setting Epic and Phase Fields

When creating a new issue:

1. Add the issue to the project (automatic via workflows)
2. Manually set these fields:
   - **Phase:** Select from Phase 0-5
   - **Epic:** Enter epic number (e.g., "Epic 3.1")
   - **Owner:** Select Ben (Backend), Carsten (Frontend), or Both
   - **Priority:** Set based on importance (only for current phase work)
   - **Estimate:** Optional story points or day estimate

### Recommended Labels

Apply these labels when creating issues:

- `phase-1`, `phase-2`, `phase-3`, etc. - Matches Phase field
- `backend` - Ben's work
- `frontend` - Carsten's work
- `enhancement` - New features
- `bug` - Bug fixes
- `documentation` - Documentation updates

### Issue Templates (Future Enhancement)

Consider creating issue templates that:

- Pre-populate Phase and Epic fields
- Include checklist for TDD workflow
- Auto-assign labels based on type

---

## Testing the Automation

### Test 1: Create a New Issue

1. Create a test issue: `Test: Project automation`
2. Verify it appears in the project with "Todo" status
3. Assign yourself to the issue
4. Verify it moves to "In Progress"
5. Close the issue
6. Verify it moves to "Done"
7. Reopen the issue
8. Close and delete the test issue

### Test 2: Create a PR

1. Create a branch and make a small change
2. Create a PR
3. Verify the PR appears in the project with "In Review" status
4. Merge the PR
5. Verify it moves to "Done"

---

## Troubleshooting

### Issue doesn't appear in project

**Check:**

- Is the "Auto-add items" workflow enabled?
- Is the GitHub Actions workflow running? (Check Actions tab)
- Does the repository have the `PROJECT_TOKEN` secret configured?

**Fix:**

- Manually add the issue using the project UI
- Enable the workflow in project settings

### Status doesn't update automatically

**Check:**

- Are the built-in workflows enabled?
- Did you perform the trigger action (assign, close, merge)?

**Fix:**

- Manually update the status field
- Re-trigger the action (re-assign, re-open then close, etc.)

### GitHub Actions workflow fails

**Check:**

- Does the `PROJECT_TOKEN` secret exist?
- Has the token expired?
- Check the workflow run logs in the Actions tab

**Fix:**

- Regenerate the token and update the secret
- Check workflow file syntax

---

## Advanced Customization

### Adding Custom Automation Rules

Edit `.github/workflows/project-automation.yml` to add:

- Automatic priority assignment based on labels
- Slack/Discord notifications on status changes
- Automatic epic field population based on issue title
- Time tracking and SLA monitoring

### Example: Auto-set Priority based on Labels

```yaml
- name: Set priority based on labels
  if: contains(github.event.issue.labels.*.name, 'critical')
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.PROJECT_TOKEN }}
    script: |
      // GraphQL mutation to set Priority field to "🔴 High"
```

---

## Maintenance Schedule

### Weekly

- Review automation workflow runs for errors
- Check for items stuck in wrong status
- Verify new issues were added to project

### Monthly

- Review and update automation rules as needed
- Check token expiration dates
- Audit project board for cleanup

### Quarterly

- Rotate Personal Access Token (if using 90-day expiration)
- Review automation effectiveness
- Consider additional automation opportunities

---

## Security Best Practices

1. **Use Classic PAT, not Fine-grained** (for now)
   - Fine-grained tokens don't yet support Projects v2

2. **Minimize Token Scopes**
   - Only grant `repo` and `project` scopes
   - Don't grant `admin` or `delete_repo`

3. **Rotate Tokens Regularly**
   - Set 90-day expiration
   - Update secret before expiration

4. **Audit Token Usage**
   - Check "Token last used" in GitHub settings
   - Revoke unused tokens immediately

5. **Separate Tokens per Purpose**
   - Don't reuse tokens across multiple projects
   - Use repository-specific tokens when possible

---

## Support and Resources

- **GitHub Projects Documentation:** https://docs.github.com/en/issues/planning-and-tracking-with-projects
- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Project Automation Examples:** https://github.com/actions/add-to-project

---

**Last Updated:** 2025-11-28
