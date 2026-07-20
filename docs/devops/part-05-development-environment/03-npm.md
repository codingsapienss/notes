---
sidebar_label: npm (Node Package Manager)
sidebar_position: 3
---


# npm (Node Package Manager)

### Overview

After installing Node.js, the next essential tool is **npm (Node Package Manager)**.

Modern Node.js applications rarely consist of only your own code. Instead, they rely on thousands of reusable libraries known as **packages**.

For example, an Express.js application may use packages for:

- HTTP server
- Database connectivity
- Authentication
- File uploads
- Validation
- Logging
- Environment variables

Instead of writing all of this functionality from scratch, developers install packages from the npm registry.

This chapter explains how npm works, how packages are managed, and how to use npm effectively in production environments.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand npm and its purpose.
- Install and manage packages.
- Understand dependencies.
- Learn the purpose of `package.json`.
- Understand `package-lock.json`.
- Use npm scripts.
- Follow production best practices.

---

## What is npm?

npm stands for:

> **Node Package Manager**

It is the default package manager that ships with Node.js.

npm performs three primary tasks:

- Downloads packages
- Manages project dependencies
- Executes project scripts

```text
Node.js
    │
    ▼
npm
    │
    ▼
npm Registry
```

The npm registry contains millions of publicly available JavaScript packages.

---

## Why Do We Need npm?

Imagine building an API server without npm.

You would have to write:

- HTTP server
- Routing
- Database driver
- Authentication
- File upload handling
- Validation

from scratch.

Instead:

```text
Developer

↓

npm install express

↓

Ready-to-use Web Framework
```

This dramatically reduces development time.

---

## The npm Registry

The npm registry is an online repository containing JavaScript packages.

```text
Developer
     │
npm install
     │
     ▼
npm Registry
     │
Download Package
     │
     ▼
Project
```

Common packages include:

| Package      | Purpose                       |
| ------------ | ----------------------------- |
| express      | Web framework                 |
| mongoose     | MongoDB ODM                   |
| dotenv       | Environment variables         |
| cors         | Cross-Origin Resource Sharing |
| jsonwebtoken | JWT authentication            |
| multer       | File uploads                  |

---

## package.json

Every Node.js project contains a file named:

```text
package.json
```

It describes the project and its dependencies.

Example:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

---

## Important Fields in package.json

| Field             | Purpose                   |
| ----------------- | ------------------------- |
| `name`            | Project name              |
| `version`         | Application version       |
| `main`            | Entry point               |
| `scripts`         | Executable commands       |
| `dependencies`    | Runtime packages          |
| `devDependencies` | Development-only packages |

---

## package-lock.json

When packages are installed, npm generates:

```text
package-lock.json
```

This file records the **exact versions** of every installed package and their dependencies.

```text
package.json
        │
Defines Requirements
        │
        ▼
package-lock.json
        │
Locks Exact Versions
```

This ensures every developer and production server installs the same dependency versions.

---

## node_modules

When packages are installed, npm creates:

```text
node_modules/
```

Example:

```text
my-app/
│
├── app.js
├── package.json
├── package-lock.json
└── node_modules/
```

The `node_modules` directory contains all downloaded packages.

It should **not** be committed to Git.

---

## Installing Dependencies

Install all project dependencies:

```bash
npm install
```

npm reads:

```text
package.json
```

and downloads all required packages.

---

## Installing a Package

Example:

```bash
npm install express
```

npm:

- Downloads Express
- Updates `package.json`
- Updates `package-lock.json`
- Installs files into `node_modules`

---

## Installing Development Dependencies

Development-only packages:

```bash
npm install --save-dev nodemon
```

Example development tools:

- nodemon
- eslint
- prettier
- typescript

These packages are generally **not required** in production.

---

## Local vs Global Packages

### Local Installation

```bash
npm install express
```

Installed only for the current project.

Preferred for almost every application dependency.

---

### Global Installation

```bash
npm install -g pm2
```

Installed once for the entire operating system.

Examples:

- pm2
- npm
- typescript (optional)
- yarn

---

## npm Scripts

Applications often define reusable commands.

Example:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "node test.js"
  }
}
```

Run a script:

```bash
npm run dev
```

or

```bash
npm start
```

Scripts provide a consistent interface for developers and deployment pipelines.

---

## Installing Production Dependencies

For production deployments:

```bash
npm install --production
```

or with modern npm:

```bash
npm install --omit=dev
```

This skips development dependencies and reduces:

- Disk usage
- Installation time
- Attack surface

---

## npm ci

Production deployments often use:

```bash
npm ci
```

Instead of:

```bash
npm install
```

Why?

| npm install                  | npm ci                 |
| ---------------------------- | ---------------------- |
| Updates lock file if needed  | Uses lock file exactly |
| Faster on clean environments | Yes                    |
| Best for production          | Yes                    |
| Best for CI/CD               | Yes                    |

`npm ci` requires an existing `package-lock.json`.

---

## Updating Packages

Check outdated packages:

```bash
npm outdated
```

Update packages:

```bash
npm update
```

Be cautious when updating major versions, as they may introduce breaking changes.

---

## Viewing Installed Packages

Project packages:

```bash
npm list
```

Global packages:

```bash
npm list -g --depth=0
```

---

## Project Structure After Installation

```text
my-app/
│
├── app.js
├── package.json
├── package-lock.json
├── node_modules/
├── routes/
├── controllers/
└── public/
```

---

## Typical Production Workflow

```text
Git Pull
     │
     ▼
package.json Updated
     │
     ▼
npm ci
     │
     ▼
Dependencies Installed
     │
     ▼
PM2 Restart
```

Every deployment begins by ensuring the correct dependency versions are installed.

---

## Real-World Example

Suppose your Express application depends on:

- Express
- Mongoose
- Dotenv
- Multer

Deployment process:

```text
GitHub
     │
git pull
     │
Ubuntu Server
     │
npm ci
     │
PM2 Restart
     │
Application Running
```

If a new dependency is added in GitHub, running `npm ci` installs the exact versions specified in `package-lock.json`, ensuring consistent deployments across environments.

---

## Best Practices

- Commit both `package.json` and `package-lock.json`.
- Do not commit `node_modules`.
- Use `npm ci` for production deployments.
- Keep dependencies updated with security patches.
- Install only trusted packages.
- Remove unused dependencies regularly.
- Separate development and production dependencies.

---

## Common Mistakes

#### Committing node_modules

The `node_modules` directory can contain thousands of files and should be regenerated using npm instead of being stored in version control.

---

#### Deleting package-lock.json

The lock file ensures consistent dependency versions.

Removing it may cause different environments to install different package versions.

---

#### Installing Everything Globally

Most application packages should be installed locally within the project.

Global installations should be limited to tools that are intended to be used system-wide.

---

#### Blindly Updating Dependencies

Major package updates may introduce breaking changes.

Always review release notes and test updates before deploying to production.

---

## Summary

npm is the package manager that powers the Node.js ecosystem. It enables developers to install, manage, and update project dependencies while ensuring applications remain consistent across different environments. Files such as `package.json` and `package-lock.json` play a central role in dependency management, and commands like `npm ci` provide reliable, repeatable installations for production deployments.

---

### Next Chapter

➡️ **04 - Environment Variables**
