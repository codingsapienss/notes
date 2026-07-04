---
sidebar_label: Git
sidebar_position: 1
---


# Git

## Overview

Before deploying an application to a Linux server, the application's source code must first be transferred to the server.

While there are many ways to copy files (such as FTP, SCP, or ZIP archives), the industry standard is to use **Git**.

Git is a distributed version control system that allows developers to:

- Track code changes
- Collaborate with teams
- Maintain version history
- Roll back to previous versions
- Deploy applications directly from source repositories

In production environments, Linux servers typically pull application code from repositories hosted on platforms such as GitHub, GitLab, or Bitbucket.

This chapter explains how Git works, how to install and configure it on a Linux server, and how it fits into the deployment workflow.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what Git is.
- Install Git on Ubuntu.
- Configure Git.
- Clone repositories.
- Understand HTTPS vs SSH authentication.
- Configure GitHub SSH access.
- Perform common Git operations on a production server.

---

# What is Git?

Git is a **Distributed Version Control System (DVCS)**.

Instead of storing only the latest version of a project, Git records every change made over time.

```text
Developer
     │
     ▼
Git Repository
     │
     ▼
Complete History
```

This enables developers to:

- View previous versions
- Restore deleted code
- Compare changes
- Work collaboratively

---

# Why Use Git?

Imagine deploying a Node.js application manually.

```text
Developer

↓

ZIP File

↓

Copy to Server

↓

Replace Old Files
```

Problems:

- No version history
- Difficult rollback
- Easy to overwrite files
- Poor collaboration

Now using Git:

```text
Developer

↓

GitHub Repository

↓

Linux Server

↓

git pull
```

Benefits:

- Version history
- Easy updates
- Rollback capability
- Team collaboration
- Consistent deployments

---

# Git Workflow

A typical Git workflow looks like this.

```text
Developer
      │
git commit
      │
      ▼
Git Repository
      │
git push
      │
      ▼
GitHub
      │
git pull
      │
      ▼
Production Server
```

The production server generally **pulls** code from the repository rather than developers manually copying files.

---

# Installing Git

Update package information:

```bash
sudo apt update
```

Install Git:

```bash
sudo apt install git
```

Verify installation:

```bash
git --version
```

Example:

```text
git version 2.43.0
```

---

# Configuring Git

Set your username:

```bash
git config --global user.name "John Doe"
```

Set your email:

```bash
git config --global user.email "john@example.com"
```

View configuration:

```bash
git config --list
```

These settings identify the author of future commits.

---

# Git Repository

A Git repository contains:

- Project source code
- Commit history
- Branches
- Tags
- Configuration

Hidden Git directory:

```text
my-app/
│
├── .git/
├── package.json
├── app.js
└── routes/
```

The `.git` directory stores all version control metadata.

---

# Local Repository vs Remote Repository

```text
Developer Laptop
      │
Local Repository
      │
git push
      ▼
GitHub
      ▲
git pull
      │
Linux Server
```

| Repository        | Purpose                  |
| ----------------- | ------------------------ |
| Local Repository  | Developer's working copy |
| Remote Repository | Shared source of truth   |

---

# Cloning a Repository

Clone using HTTPS:

```bash
git clone https://github.com/company/my-app.git
```

Clone using SSH:

```bash
git clone git@github.com:company/my-app.git
```

This downloads the complete project along with its Git history.

---

# HTTPS vs SSH Authentication

Git supports two common authentication methods.

| HTTPS                         | SSH                         |
| ----------------------------- | --------------------------- |
| Username/Token                | SSH Keys                    |
| Easier for beginners          | Preferred for servers       |
| Requires credentials          | Passwordless authentication |
| Suitable for personal systems | Ideal for production        |

Production Linux servers generally use **SSH authentication**.

---

# Generating an SSH Key for GitHub

Generate a key:

```bash
ssh-keygen -t ed25519
```

Default location:

```text
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

The private key remains on the server.

The public key is uploaded to GitHub.

---

# Adding the SSH Key to GitHub

Display the public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the displayed key.

Then:

1. Open GitHub.
2. Navigate to **Settings**.
3. Select **SSH and GPG Keys**.
4. Click **New SSH Key**.
5. Paste the public key.
6. Save.

Now the server can authenticate securely without passwords.

---

# Testing the Connection

Verify SSH authentication:

```bash
ssh -T git@github.com
```

Expected response:

```text
Hi username!

You've successfully authenticated.
```

---

# Common Git Commands

| Command        | Purpose                          |
| -------------- | -------------------------------- |
| `git status`   | View repository status           |
| `git pull`     | Download latest changes          |
| `git fetch`    | Download changes without merging |
| `git log`      | View commit history              |
| `git branch`   | View branches                    |
| `git checkout` | Switch branches                  |
| `git restore`  | Restore modified files           |
| `git diff`     | View code differences            |

---

# Updating an Existing Project

Move into the project directory:

```bash
cd my-app
```

Download the latest changes:

```bash
git pull origin main
```

The server now contains the latest version of the application.

---

# Viewing Commit History

Display commit history:

```bash
git log
```

Compact format:

```bash
git log --oneline
```

Example:

```text
3a1d4b2 Fix authentication bug

b9f6c51 Add payment API

72e84f3 Initial deployment
```

---

# Ignoring Files

Some files should never be committed.

Example:

```text
.gitignore
```

Typical entries:

```text
node_modules/
.env
logs/
uploads/
```

This prevents sensitive or generated files from entering version control.

---

# Git in Production

A common deployment workflow is:

```text
Developer
      │
Commit Changes
      │
Push to GitHub
      │
Linux Server
      │
git pull
      │
npm install
      │
Restart PM2
```

Git becomes the mechanism for delivering application updates.

---

# Real-World Example

Suppose your Node.js application is hosted on GitHub.

Deployment steps:

```text
GitHub
     │
git clone
     │
Ubuntu Server
     │
npm install
     │
PM2
     │
Nginx
```

Whenever new code is released:

```bash
git pull origin main
npm install
pm2 restart ecosystem.config.js
```

The server updates to the latest version with minimal effort.

---

# Best Practices

- Use SSH authentication instead of HTTPS on production servers.
- Never commit `.env` files or secrets.
- Pull code from a trusted repository only.
- Review changes before deploying.
- Use meaningful commit messages.
- Keep repositories clean using `.gitignore`.
- Deploy from the main or release branch rather than untested feature branches.

---

# Common Mistakes

### Editing Production Code Directly

Production servers should receive changes through Git, not manual file edits.

---

### Committing Secrets

Passwords, API keys, and private certificates should never be committed to a Git repository.

---

### Using the Root User

Clone repositories and deploy applications using a dedicated application user instead of `root`.

---

### Deploying Without Reviewing Changes

Always review incoming commits before updating a production server to avoid unexpected behavior.

---

# Summary

Git is the industry-standard version control system used to manage and deploy application source code. On Linux servers, it enables reliable, repeatable deployments by allowing applications to be cloned and updated directly from remote repositories. Using SSH authentication, maintaining clean repositories, and following disciplined deployment practices ensures secure and efficient application management.

---

## Next Chapter

➡️ **02 - Node.js**
