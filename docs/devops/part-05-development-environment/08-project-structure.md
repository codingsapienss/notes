---
sidebar_label: Project Structure
sidebar_position: 8
---


# Project Structure

## Overview

As applications grow, organizing files and directories becomes increasingly important.

A well-structured project is easier to:

- Understand
- Maintain
- Scale
- Debug
- Deploy
- Collaborate on

Poor organization leads to confusion, duplicated code, and difficult deployments.

This chapter introduces a practical project structure for Node.js applications running on Linux servers. While every project has unique requirements, following a consistent directory layout makes production deployments more predictable and easier to manage.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand why project organization matters.
- Learn common Node.js directory structures.
- Separate application code from configuration and data.
- Organize production deployments.
- Structure projects for maintainability and scalability.
- Follow industry best practices.

---

# Why Does Project Structure Matter?

Imagine a project where every file is placed in one directory.

```text
my-app/

app.js

db.js

routes.js

login.js

payment.js

auth.js

upload.js

helper.js

utils.js

config.js

controller.js

middleware.js
```

As the project grows, locating files becomes increasingly difficult.

Instead, files should be grouped by their responsibilities.

```text
my-app/

controllers/

models/

routes/

middleware/

config/

public/

views/
```

A logical structure makes development and maintenance much easier.

---

# Typical Node.js Project Structure

A common Express.js project might look like:

```text
my-app/
│
├── app.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── public/
├── views/
├── uploads/
├── logs/
└── node_modules/
```

Each directory has a specific responsibility.

---

# Root Directory

The root directory usually contains project-level configuration.

```text
my-app/
│
├── app.js
├── package.json
├── package-lock.json
├── .env
└── ecosystem.config.js
```

| File                  | Purpose                 |
| --------------------- | ----------------------- |
| `app.js`              | Application entry point |
| `package.json`        | Project metadata        |
| `package-lock.json`   | Dependency versions     |
| `.env`                | Configuration variables |
| `ecosystem.config.js` | PM2 configuration       |

---

# Configuration Directory

```text
config/
```

Contains configuration files.

Example:

```text
config/
│
├── database.js
├── redis.js
├── cloudflare.js
└── constants.js
```

Configuration logic should remain separate from business logic.

---

# Routes

Routes define the application's endpoints.

```text
routes/
│
├── auth.js
├── users.js
├── orders.js
└── products.js
```

Example:

```text
GET    /users

POST   /login

PUT    /profile

DELETE /orders/:id
```

Routes receive requests and forward them to controllers.

---

# Controllers

Controllers process incoming requests.

```text
controllers/
│
├── authController.js
├── userController.js
└── orderController.js
```

Typical flow:

```text
Client

↓

Route

↓

Controller

↓

Database

↓

Response
```

Controllers should contain request handling logic, not server configuration.

---

# Models

Models define how data is stored and retrieved.

```text
models/
│
├── User.js
├── Product.js
└── Order.js
```

For MongoDB applications, models often contain Mongoose schemas.

---

# Middleware

Middleware executes before requests reach controllers.

```text
middleware/
│
├── auth.js
├── upload.js
├── logger.js
└── validator.js
```

Examples include:

- Authentication
- Request validation
- File uploads
- Logging
- Rate limiting

---

# Services

Services contain reusable business logic.

```text
services/
│
├── emailService.js
├── paymentService.js
└── notificationService.js
```

Instead of placing large amounts of business logic inside controllers, services help keep the code modular and reusable.

---

# Utilities

Utility functions are shared across the project.

```text
utils/
│
├── helper.js
├── date.js
├── logger.js
└── validator.js
```

Examples:

- Date formatting
- String manipulation
- Encryption helpers
- Utility functions

---

# Public Directory

Static files are commonly stored here.

```text
public/
│
├── css/
├── js/
├── images/
└── videos/
```

These files are served directly to users.

---

# Views

Projects using server-side rendering (such as Express with EJS) store templates here.

```text
views/
│
├── index.ejs
├── login.ejs
└── dashboard.ejs
```

Frontend frameworks like React or Next.js typically do not use this directory in the same way.

---

# Uploads

User-uploaded content is often stored separately.

```text
uploads/
│
├── invoices/
├── profile-images/
└── documents/
```

In larger production systems, uploaded files are commonly stored in cloud object storage (such as Amazon S3, Cloudflare R2, or Azure Blob Storage) instead of the local filesystem.

---

# Logs

Application logs should be separated from application code.

```text
logs/
│
├── access.log
├── error.log
└── application.log
```

Logs assist with:

- Troubleshooting
- Monitoring
- Auditing

Many production environments centralize logs using dedicated logging platforms.

---

# node_modules

Installed dependencies are stored in:

```text
node_modules/
```

This directory is generated automatically by npm.

It should **never** be modified manually.

It is also excluded from Git using `.gitignore`.

---

# Linux Deployment Structure

While the project itself has an internal structure, Linux servers also benefit from a consistent deployment layout.

Example:

```text
/var/www/
│
├── my-app/
│   ├── app.js
│   ├── package.json
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── public/
│   └── ...
│
├── backups/
│
└── shared/
```

Many organizations store web applications under `/var/www`, although the exact location may vary.

---

# Separating Application and Data

Application code and persistent data should not always reside together.

```text
Application
│
├── Source Code
├── Routes
├── Controllers
└── Views

Persistent Data
│
├── Uploads
├── Backups
├── Logs
└── Database
```

Separating these components simplifies deployments and backup strategies.

---

# Typical Production Architecture

```text
                    Internet
                        │
                        ▼
                     Cloudflare
                        │
                        ▼
                      Nginx
                        │
                        ▼
                       PM2
                        │
                        ▼
                 Node.js Application
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
    Controllers      Services       Middleware
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                     Models
                        │
                        ▼
                  MongoDB Atlas
```

A clear project structure mirrors the application's architecture and improves long-term maintainability.

---

# Deployment Workflow

```text
GitHub Repository
        │
        ▼
git pull
        │
        ▼
npm ci
        │
        ▼
Verify Project Structure
        │
        ▼
PM2 Reload
        │
        ▼
Application Running
```

A predictable directory layout makes deployments safer and easier to automate.

---

# Real-World Example

Suppose an Express.js application is deployed on an Ubuntu server.

Project directory:

```text
/var/www/inventory-api/
│
├── app.js
├── package.json
├── ecosystem.config.js
├── .env
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── public/
├── uploads/
└── logs/
```

Deployment process:

1. Clone the repository into `/var/www/inventory-api`.
2. Install dependencies using `npm ci`.
3. Configure environment variables in `.env`.
4. Start the application using PM2.
5. Configure Nginx as the reverse proxy.

Because configuration, business logic, static assets, and logs are clearly separated, future maintenance becomes significantly easier.

---

# Best Practices

- Follow a consistent directory structure across projects.
- Separate routes, controllers, models, and services.
- Keep configuration files inside a dedicated directory.
- Store uploaded files separately from source code.
- Exclude `node_modules` and `.env` from Git.
- Separate logs from application code.
- Keep business logic out of route definitions.
- Use meaningful directory and file names.

---

# Common Mistakes

### Putting Everything in app.js

As projects grow, a single large file becomes difficult to maintain and debug.

---

### Mixing Business Logic with Routes

Routes should primarily handle request routing, while business logic belongs in controllers and services.

---

### Committing Generated Files

Directories such as `node_modules` and log files should not be committed to version control.

---

### Storing Sensitive Files in Public Directories

Configuration files, secrets, and private documents should never be accessible through publicly served directories.

---

### Ignoring Consistency

Using different structures for every project increases onboarding time and makes maintenance more difficult.

---

# Summary

A well-organized project structure is fundamental to building maintainable Node.js applications. By separating configuration, routing, business logic, data models, static assets, uploads, and logs into dedicated directories, developers create applications that are easier to understand, deploy, scale, and troubleshoot. Consistent project organization also simplifies collaboration and prepares applications for reliable production deployments.

---

## Next Chapter

➡️ **Part 6 – Nginx**
