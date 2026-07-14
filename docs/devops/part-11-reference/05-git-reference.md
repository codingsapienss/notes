---
sidebar_label: Git Reference
sidebar_position: 5
---


# Git Reference

## Overview

Git is the world's most widely used distributed version control system. It enables developers to track changes, collaborate with teams, manage branches, recover previous versions, and deploy applications with confidence.

Whether you are working alone or in a team of hundreds, Git provides a reliable history of your project's evolution.

This chapter serves as a quick-reference guide to the most commonly used Git commands, concepts, and workflows used in professional software development.

---

# Learning Objectives

After completing this chapter, you will be able to:

- Understand Git fundamentals.
- Manage repositories efficiently.
- Work with branches.
- Commit changes correctly.
- Collaborate using remote repositories.
- Resolve merge conflicts.
- Recover from mistakes.
- Follow professional Git workflows.

---

# Git Architecture

```text
Working Directory

↓

Staging Area (Index)

↓

Local Repository

↓

Remote Repository (GitHub/GitLab/Bitbucket)
```

Every Git operation moves changes between these four stages.

---

# Git Workflow

```text
Edit Files

↓

git add

↓

git commit

↓

git push

↓

Remote Repository
```

This is the most common workflow followed by developers.

---

# Installing Git

Ubuntu:

```bash
sudo apt update

sudo apt install git
```

Verify installation.

```bash
git --version
```

---

# Configure Git

Set your identity.

```bash
git config --global user.name "John Doe"
```

```bash
git config --global user.email "john@example.com"
```

View configuration.

```bash
git config --list
```

---

# Create a Repository

Initialize Git.

```bash
git init
```

Creates:

```text
.git/
```

This hidden directory stores the complete Git history.

---

# Clone a Repository

```bash
git clone https://github.com/user/project.git
```

Clone into another directory.

```bash
git clone https://github.com/user/project.git my-project
```

---

# Check Repository Status

```bash
git status
```

Example output:

```text
Modified:

app.js

Untracked:

config.js
```

`git status` should be your most frequently used Git command.

---

# Track Files

Add one file.

```bash
git add app.js
```

Add multiple files.

```bash
git add file1.js file2.js
```

Add everything.

```bash
git add .
```

---

# Commit Changes

Create a commit.

```bash
git commit -m "Fix login validation"
```

Stage and commit tracked files.

```bash
git commit -am "Update API"
```

Commit messages should be short, descriptive, and meaningful.

---

# View Commit History

Compact history.

```bash
git log --oneline
```

Detailed history.

```bash
git log
```

Graph view.

```bash
git log --graph --oneline --all
```

---

# Branch Management

Create a branch.

```bash
git branch feature/login
```

Switch to a branch.

```bash
git checkout feature/login
```

Or use:

```bash
git switch feature/login
```

Create and switch.

```bash
git checkout -b feature/login
```

Modern alternative.

```bash
git switch -c feature/login
```

---

# Branch Workflow

```text
main

│

├─────────────┐

│             │

feature/api   feature/auth

│             │

└──────Merge──┘

↓

main
```

Feature branches isolate development work.

---

# View Branches

Local branches.

```bash
git branch
```

Remote branches.

```bash
git branch -r
```

All branches.

```bash
git branch -a
```

---

# Rename Branch

```bash
git branch -m old-name new-name
```

Rename current branch.

```bash
git branch -m new-name
```

---

# Delete Branch

Delete merged branch.

```bash
git branch -d feature/login
```

Force delete.

```bash
git branch -D feature/login
```

---

# Merge Branches

Switch to target branch.

```bash
git checkout main
```

Merge.

```bash
git merge feature/login
```

Merge workflow:

```text
feature

↓

Commit

↓

Merge

↓

main
```

---

# Rebase

Replay commits on another branch.

```bash
git rebase main
```

Purpose:

- Cleaner history
- Fewer merge commits

Use with caution on shared branches.

---

# Remote Repositories

View remotes.

```bash
git remote -v
```

Add remote.

```bash
git remote add origin https://github.com/user/project.git
```

Remove remote.

```bash
git remote remove origin
```

---

# Push Changes

Push current branch.

```bash
git push
```

First push.

```bash
git push -u origin main
```

Push feature branch.

```bash
git push origin feature/login
```

---

# Pull Changes

Download and merge.

```bash
git pull
```

Download only.

```bash
git fetch
```

Difference:

| Command     | Downloads | Merges |
| ----------- | --------- | ------ |
| `git fetch` | Yes       | No     |
| `git pull`  | Yes       | Yes    |

---

# Stashing Changes

Temporarily save work.

```bash
git stash
```

View stashes.

```bash
git stash list
```

Restore.

```bash
git stash pop
```

---

# Undo Changes

Discard working directory changes.

```bash
git restore app.js
```

Unstage a file.

```bash
git restore --staged app.js
```

Reset commit (keep files).

```bash
git reset --soft HEAD~1
```

Reset commit (discard changes).

```bash
git reset --hard HEAD~1
```

**Warning:** `--hard` permanently discards uncommitted changes.

---

# Compare Changes

Working directory.

```bash
git diff
```

Staged changes.

```bash
git diff --cached
```

Between commits.

```bash
git diff HEAD~1 HEAD
```

---

# Tags

Create tag.

```bash
git tag v1.0.0
```

List tags.

```bash
git tag
```

Push tags.

```bash
git push origin --tags
```

Tags are commonly used for production releases.

---

# Git Ignore

Example:

```text
node_modules/

.env

dist/

logs/

*.log
```

Typical ignored files:

- Dependencies
- Environment files
- Build output
- Logs
- IDE configuration

---

# Merge Conflicts

Conflict example:

```text
Branch A

↓

app.js

↑

Branch B
```

Git marks conflicts:

```text
<<<<<<< HEAD

Current Code

=======

Incoming Code

>>>>>>> feature
```

Steps:

1. Resolve conflict.
2. Save file.
3. Stage file.
4. Commit merge.

---

# Git Recovery

Recover deleted branch.

```bash
git reflog
```

Restore commit.

```bash
git checkout <commit-id>
```

Create branch from commit.

```bash
git checkout -b recovery <commit-id>
```

---

# Useful Git Commands

| Command        | Purpose                 |
| -------------- | ----------------------- |
| `git status`   | Repository status       |
| `git add`      | Stage changes           |
| `git commit`   | Create commit           |
| `git log`      | View history            |
| `git branch`   | List branches           |
| `git checkout` | Switch branch           |
| `git switch`   | Modern branch switching |
| `git merge`    | Merge branches          |
| `git rebase`   | Reapply commits         |
| `git push`     | Upload changes          |
| `git pull`     | Download and merge      |
| `git fetch`    | Download changes        |
| `git stash`    | Save temporary work     |
| `git restore`  | Restore files           |
| `git diff`     | Compare changes         |
| `git tag`      | Manage releases         |
| `git reflog`   | Recover history         |

---

# Professional Git Workflow

```text
Clone Repository

↓

Create Feature Branch

↓

Develop

↓

git add

↓

git commit

↓

git push

↓

Pull Request

↓

Code Review

↓

Merge

↓

Deploy
```

This workflow is commonly used in professional development teams.

---

# Daily Git Commands

```text
Repository

├── git status
├── git log
├── git diff

Development

├── git add .
├── git commit
├── git push

Collaboration

├── git fetch
├── git pull
├── git merge

Recovery

├── git stash
├── git restore
├── git reflog
```

---

# Real-World Example

A developer accidentally commits a `.env` file containing production credentials.

The issue is discovered before deployment.

Investigation:

```bash
git status
```

Shows the repository is clean because the commit has already been created.

The developer removes the file from version control while keeping it locally.

```bash
git rm --cached .env
```

Update `.gitignore`.

```text
.env
```

Commit the fix.

```bash
git add .gitignore

git commit -m "Remove environment file from repository"
```

Push the changes.

```bash
git push
```

Finally, rotate the exposed credentials because sensitive information was committed.

**Lesson:** Never store secrets in Git repositories, even if they are later removed.

---

# Best Practices

- Write clear and descriptive commit messages.
- Keep commits small and focused.
- Create feature branches for new work.
- Pull the latest changes before starting development.
- Review changes using `git diff` before committing.
- Use `.gitignore` to exclude generated files and secrets.
- Tag production releases.
- Perform code reviews before merging.
- Backup important repositories using remote platforms.

---

# Common Mistakes

### Committing Sensitive Files

Environment files, API keys, certificates, and passwords should never be committed.

---

### Working Directly on `main`

Feature development should occur in dedicated branches.

---

### Creating Large Commits

Smaller commits are easier to review, test, and revert.

---

### Forgetting to Pull Latest Changes

Working on an outdated branch often leads to unnecessary merge conflicts.

---

### Using `git reset --hard` Without Understanding It

This command permanently removes uncommitted work and should be used carefully.

---

# Summary

Git is an essential tool for modern software development, providing version control, collaboration, branching, recovery, and release management. By mastering the commands and workflows covered in this reference, developers can confidently manage projects of any size while maintaining a clean and reliable development history.

---

## Next Chapter

➡️ **06 - Networking Reference**
