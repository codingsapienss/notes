---
sidebar_label: Environment Variables
sidebar_position: 4
---


# Environment Variables

### Overview

Applications require configuration values to function correctly. These values may include:

- Database connection strings
- API keys
- Server ports
- Email credentials
- JWT secrets
- Cloud storage credentials

Hardcoding these values directly into source code makes applications difficult to configure and creates serious security risks.

**Environment Variables** provide a secure and flexible way to store configuration separately from the application's source code.

In this chapter, you will learn how environment variables work, how to use `.env` files in Node.js applications, and how to manage configuration securely on Linux servers.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand environment variables.
- Understand why they are used.
- Use the `dotenv` package.
- Create and manage `.env` files.
- Access environment variables in Node.js.
- Configure applications for different environments.
- Follow production best practices.

---

## What are Environment Variables?

Environment variables are **key-value pairs** that are made available to an application while it is running.

Instead of writing configuration values inside the source code, the application reads them from its environment.

```text
Application
      │
      ▼
Environment Variables
      │
      ▼
Configuration Values
```

Example:

| Variable | Value      |
| -------- | ---------- |
| PORT     | 3000       |
| DB_HOST  | localhost  |
| NODE_ENV | production |

---

## Why Use Environment Variables?

Imagine writing the database password directly inside your application.

```javascript
const password = "myDatabasePassword123";
```

Problems:

- Password exposed in source code
- Difficult to change
- Unsafe to commit to Git
- Different environments require different values

A better approach:

```javascript
const password = process.env.DB_PASSWORD;
```

Now the application reads the value at runtime instead of storing it permanently in the code.

---

## Development vs Production

Different environments often require different configurations.

```text
                Development
                     │
          Database → localhost
          Debug → Enabled
          Port → 3000

                     │

                Production
                     │
          Database → Remote Cluster
          Debug → Disabled
          Port → 80 / 443
```

The application code remains the same, while the environment variables change.

---

## The .env File

During development, environment variables are commonly stored in a file named:

```text
.env
```

Example:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=27017
DB_NAME=myapp

JWT_SECRET=my-secret-key

API_KEY=abcd1234
```

Each line represents a single environment variable.

---

## Using dotenv

Node.js does not automatically read `.env` files.

The most common solution is the **dotenv** package.

Install it:

```bash
npm install dotenv
```

Load it in your application:

```javascript
require("dotenv").config();
```

or using ES Modules:

```javascript
import dotenv from "dotenv";

dotenv.config();
```

After loading `dotenv`, all variables become available through `process.env`.

---

## Accessing Environment Variables

Example:

```javascript
console.log(process.env.PORT);

console.log(process.env.DB_HOST);

console.log(process.env.JWT_SECRET);
```

Output:

```text
3000

localhost

my-secret-key
```

---

## Using Environment Variables in Express

Example:

```javascript
require("dotenv").config();

const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
```

If `PORT` is not defined, the application uses the default value.

---

## Common Environment Variables

Most Node.js applications contain variables similar to these.

```env
NODE_ENV=production

PORT=3000

MONGODB_URI=mongodb+srv://...

JWT_SECRET=super-secret-key

SMTP_HOST=smtp.example.com

SMTP_USER=user@example.com

SMTP_PASSWORD=password

REDIS_URL=redis://localhost:6379
```

The exact variables depend on the application's requirements.

---

## How Node.js Reads Environment Variables

```text
.env File
      │
dotenv.config()
      │
      ▼
process.env
      │
      ▼
Application Code
```

Every configuration value is accessed through `process.env`.

---

## System Environment Variables

Environment variables do not always come from a `.env` file.

They can also be defined directly by the operating system.

Temporary variable:

```bash
export PORT=5000
```

Verify:

```bash
echo $PORT
```

Run the application:

```bash
node app.js
```

The application can access:

```javascript
process.env.PORT;
```

---

## Temporary vs Permanent Variables

### Temporary

```bash
export NODE_ENV=production
```

Available only for the current shell session.

---

### Permanent

Variables can be added to shell configuration files such as:

```text
~/.bashrc

~/.profile

~/.zshrc
```

or configured through process managers like PM2 or system services.

---

## Environment Variables with PM2

PM2 allows environment variables to be defined inside its ecosystem configuration.

Example:

```javascript
module.exports = {
  apps: [
    {
      name: "my-app",
      script: "app.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

PM2 automatically provides these variables to the application when it starts.

---

## .gitignore

The `.env` file often contains sensitive information.

It should never be committed to Git.

Example:

```text
.gitignore

node_modules/

.env

logs/
```

This ensures secrets remain outside version control.

---

## Production Configuration

A typical production deployment looks like this:

```text
Ubuntu Server
       │
       ▼
Node.js Application
       │
       ▼
process.env
       │
       ▼
Database
Email Service
Redis
Cloud Storage
```

Configuration remains separate from the application source code.

---

## Real-World Example

Suppose an Express.js application connects to MongoDB Atlas.

`.env`

```env
PORT=3000

NODE_ENV=production

MONGODB_URI=mongodb+srv://cluster-url

JWT_SECRET=very-secure-secret
```

Application:

```javascript
require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);
```

When moving the application from development to production, only the `.env` file changes. The application code remains unchanged.

---

## Best Practices

- Never hardcode secrets in source code.
- Keep `.env` files out of Git repositories.
- Use descriptive variable names.
- Provide sensible default values where appropriate.
- Use different configurations for development, testing, and production.
- Restrict permissions on `.env` files (for example, `chmod 600 .env`).
- Rotate secrets periodically.
- Use dedicated secret management services for large production environments.

---

## Common Mistakes

#### Committing the .env File

A leaked `.env` file can expose database credentials, API keys, and authentication secrets.

---

#### Hardcoding Credentials

Configuration should be separated from application logic to improve security and maintainability.

---

#### Using the Same Secrets Everywhere

Development, testing, and production environments should use different credentials and configuration values.

---

#### Forgetting to Load dotenv

If `dotenv.config()` is not called before accessing `process.env`, variables stored in `.env` will not be available.

---

#### Logging Sensitive Values

Avoid printing secrets such as passwords, API keys, or tokens to the console or application logs.

---

## Summary

Environment variables allow applications to separate configuration from source code, making deployments more secure and flexible. By storing configuration in `.env` files during development and using secure environment management in production, developers can maintain the same codebase across multiple environments while protecting sensitive information.

---

### Next Chapter

➡️ **05 - PM2**
