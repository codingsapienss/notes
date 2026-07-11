---
sidebar_label: Building Node.js Applications
sidebar_position: 7
---


# Building Node.js Applications

## Overview

Installing Node.js, npm, and PM2 prepares a Linux server to run applications. However, before an application can serve users, it must be **built, configured, verified, and deployed correctly**.

The term **building** varies depending on the type of Node.js application.

- A simple Express application may not require any build step.
- A TypeScript application must be compiled into JavaScript.
- A React or Next.js application generates optimized production assets.
- Some applications bundle frontend resources before deployment.

This chapter focuses on the **general production workflow** used to prepare and deploy Node.js applications on Linux servers.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what "building" means.
- Learn the production deployment workflow.
- Install project dependencies.
- Execute build commands.
- Verify successful builds.
- Start applications using PM2.
- Validate deployments before exposing them to users.

---

# What Does "Building" Mean?

Building is the process of preparing an application for production.

Depending on the project, it may include:

- Installing dependencies
- Compiling source code
- Optimizing assets
- Generating production files
- Running tests
- Creating distributable output

```text
Source Code
      │
      ▼
Install Dependencies
      │
      ▼
Build Process
      │
      ▼
Production Application
```

Not every Node.js application requires every step.

---

# Types of Node.js Applications

Different projects have different build requirements.

| Application Type | Build Required? |
| ---------------- | --------------- |
| Express.js       | Usually No      |
| REST API         | Usually No      |
| TypeScript API   | Yes             |
| React            | Yes             |
| Next.js          | Yes             |
| NestJS           | Yes             |

Example:

```text
Express

app.js

↓

Ready to Run
```

Whereas:

```text
TypeScript

↓

Compile

↓

dist/

↓

Run
```

---

# Typical Production Deployment Workflow

A production deployment generally follows this order.

```text
GitHub Repository
        │
        ▼
git pull
        │
        ▼
Install Dependencies
        │
        ▼
Build Application
        │
        ▼
Verify Build
        │
        ▼
Start/Reload PM2
        │
        ▼
Application Available
```

Each step should complete successfully before moving to the next.

---

# Step 1 — Pull the Latest Code

Navigate to the project directory.

```bash
cd /var/www/my-app
```

Update the repository.

```bash
git pull origin main
```

This downloads the latest application code.

---

# Step 2 — Install Dependencies

Install packages.

```bash
npm ci
```

If `package-lock.json` is unavailable:

```bash
npm install
```

Why use `npm ci`?

| npm install       | npm ci              |
| ----------------- | ------------------- |
| Flexible          | Strict              |
| Slower            | Faster              |
| Updates lock file | Uses exact versions |
| Development       | Production          |

---

# Step 3 — Build the Application

Some projects require a build step.

Example:

```bash
npm run build
```

Typical build script:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

For Express.js projects, there may be no build command.

Instead:

```text
Install Dependencies

↓

Ready to Run
```

---

# Step 4 — Verify Build Output

Confirm that the expected output exists.

Example:

```text
my-app/

├── dist/
├── package.json
├── package-lock.json
└── node_modules/
```

or

```text
.next/
```

for Next.js applications.

Verification ensures the application was built successfully.

---

# Step 5 — Start the Application

Start using PM2.

```bash
pm2 start app.js
```

or

```bash
pm2 start ecosystem.config.js
```

If already running:

```bash
pm2 reload my-app
```

Reloading minimizes downtime.

---

# Step 6 — Verify the Application

Confirm that the application is running.

Check PM2:

```bash
pm2 list
```

Check logs:

```bash
pm2 logs my-app
```

Verify locally:

```bash
curl http://localhost:3000
```

Expected flow:

```text
Application

↓

Listening

↓

Responding

↓

Healthy
```

---

# Health Checks

Before exposing an application to users, verify:

- Process is running
- Expected port is open
- Database connection succeeds
- API responds correctly
- Static assets load successfully

Useful commands:

```bash
ss -tulpn
```

```bash
curl http://localhost:3000
```

```bash
pm2 logs
```

---

# Production Deployment Example

Suppose a new version is released.

Deployment:

```bash
cd /var/www/my-app

git pull origin main

npm ci

npm run build

pm2 reload my-app
```

Workflow:

```text
GitHub

↓

git pull

↓

npm ci

↓

npm run build

↓

PM2 Reload

↓

Users Receive Updated Version
```

---

# Build Failures

Sometimes builds fail.

Common reasons include:

- Missing dependencies
- Syntax errors
- Missing environment variables
- TypeScript compilation errors
- Insufficient permissions
- Disk space issues

Typical workflow:

```text
Build Failed

↓

Read Error

↓

Fix Issue

↓

Run Build Again
```

Never ignore build errors.

---

# Build vs Runtime Errors

These are different types of problems.

| Build Error          | Runtime Error                      |
| -------------------- | ---------------------------------- |
| Happens during build | Happens after startup              |
| Stops deployment     | Application starts but fails later |
| Compile issues       | Logic or configuration issues      |

Understanding the difference helps narrow down troubleshooting efforts.

---

# Deployment Verification Checklist

After deployment, verify:

| Item                         | Status |
| ---------------------------- | ------ |
| Git pull completed           | □      |
| Dependencies installed       | □      |
| Build succeeded              | □      |
| PM2 running                  | □      |
| Logs reviewed                | □      |
| API responding               | □      |
| Database connected           | □      |
| Environment variables loaded | □      |

Only expose the application after every verification passes.

---

# Real-World Example

Suppose an Express.js API is deployed on Ubuntu.

Project structure:

```text
/var/www/api-server
│
├── app.js
├── package.json
├── package-lock.json
├── routes/
├── controllers/
├── models/
└── .env
```

Deployment process:

```text
Developer Pushes Code
          │
          ▼
GitHub
          │
          ▼
Ubuntu Server
          │
git pull
          │
npm ci
          │
pm2 reload api-server
          │
Verify Logs
          │
Application Ready
```

Because this Express application does not require compilation, the deployment skips the build step and proceeds directly to restarting the application.

---

# Best Practices

- Use `npm ci` in production whenever possible.
- Build applications before restarting services.
- Review build output for warnings or errors.
- Use PM2 reload instead of restart when appropriate.
- Verify application health after every deployment.
- Keep deployment steps consistent across environments.
- Automate deployments through CI/CD pipelines as infrastructure grows.

---

# Common Mistakes

### Deploying Without Installing Dependencies

New releases often introduce additional packages. Forgetting to install them can cause application startup failures.

---

### Ignoring Build Errors

A successful deployment requires a successful build. Fix build errors before continuing.

---

### Restarting Before the Build Completes

Restarting the application before verifying the build can result in serving incomplete or broken code.

---

### Skipping Health Checks

An application that starts successfully is not necessarily functioning correctly. Always verify connectivity, logs, and responses.

---

### Deploying Directly to Production Without Testing

Changes should be validated in a development or staging environment before reaching production whenever practical.

---

# Summary

Building a Node.js application is the process of preparing it for production by installing dependencies, compiling code when necessary, verifying the output, and deploying it through a process manager such as PM2. While some applications require compilation and others do not, the overall deployment workflow remains consistent: update the source code, install dependencies, build if required, verify the application, and confirm that it is healthy before making it available to users.

---

## Next Chapter

➡️ **08 - Project Structure**
