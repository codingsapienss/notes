---
sidebar_label: Secrets and Environment Variables
sidebar_position: 7
---


# Secrets and Environment Variables

## Overview

Modern applications require various sensitive pieces of information to function, such as:

- Database passwords
- API keys
- JWT signing secrets
- Cloud credentials
- Payment gateway keys
- Email service passwords
- OAuth client secrets

Collectively, these are called **secrets**.

A common mistake made by beginners is storing these values directly inside the application's source code.

For example:

```javascript
const DB_PASSWORD = "MyPassword123";
const JWT_SECRET = "secret123";
```

If this code is uploaded to GitHub, shared with another developer, or leaked through a backup, the secrets are exposed.

Instead, production applications keep secrets **outside the source code** using **environment variables** or dedicated secret management systems.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what secrets are.
- Learn why secrets should never be hardcoded.
- Understand environment variables.
- Work with `.env` files.
- Secure sensitive configuration files.
- Learn production secret management practices.

---

# What Are Secrets?

A **secret** is any confidential information that should only be accessible to authorized users or applications.

Examples include:

| Secret               | Example              |
| -------------------- | -------------------- |
| Database Password    | MongoDB Password     |
| API Key              | Google Maps API Key  |
| JWT Secret           | Token Signing Key    |
| SMTP Password        | Email Authentication |
| Cloud Credentials    | AWS Access Key       |
| Payment Gateway Keys | Razorpay, Stripe     |
| OAuth Secret         | Google Login Secret  |

If attackers obtain these values, they may gain unauthorized access to your systems.

---

# Why Hardcoding Secrets is Dangerous

Suppose a developer writes:

```javascript
const password = "myDatabasePassword";
```

Now imagine the code is:

- Uploaded to GitHub
- Shared with another team
- Copied into logs
- Included in backups
- Sent in an email

The password is now compromised.

```text
Source Code
      │
Contains Password
      │
Repository Shared
      │
Password Exposed
```

Secrets should never be embedded directly into application code.

---

# What are Environment Variables?

Environment variables are key-value pairs provided by the operating system to running applications.

Example:

```text
DATABASE_URL=mongodb://...
JWT_SECRET=VeryStrongSecret
PORT=3000
```

Applications read these values when they start.

```text
Linux Server
      │
Environment Variables
      │
Application
      │
Configuration Loaded
```

This keeps configuration separate from the application source code.

---

# Accessing Environment Variables

In Linux:

```bash
echo $HOME
```

Display a specific variable:

```bash
echo $PATH
```

List all environment variables:

```bash
printenv
```

or

```bash
env
```

---

# Using Environment Variables in Node.js

Node.js applications access environment variables through:

```javascript
process.env;
```

Example:

```javascript
const port = process.env.PORT;
const db = process.env.DATABASE_URL;
```

The application remains unchanged across environments.

Only the environment variables differ.

---

# The .env File

During development, many applications store environment variables inside a `.env` file.

Example:

```text
PORT=3000
DATABASE_URL=mongodb://localhost:27017/app
JWT_SECRET=StrongSecretKey
API_KEY=xxxxxxxxxxxx
```

The application loads these values during startup.

For Node.js applications, packages such as `dotenv` are commonly used.

---

# Why .env Files Must Be Protected

A `.env` file often contains:

- Database credentials
- Cloud API keys
- Payment gateway secrets
- Encryption keys
- OAuth secrets

If an attacker gains access to this file, they may gain access to multiple systems.

Recommended permissions:

```bash
chmod 600 .env
```

This allows only the owner to read and modify the file.

---

# Never Commit Secrets to Git

A common beginner mistake:

```text
Project
│
├── app.js
├── package.json
└── .env
```

Running:

```bash
git add .
git commit
```

may upload `.env` to the repository.

Instead, include it in:

```text
.gitignore
```

Example:

```text
node_modules/
.env
logs/
```

Once a secret has been committed to Git, it should be considered compromised and replaced.

---

# Different Environments

Applications typically run in multiple environments.

```text
Development
      │
Testing
      │
Staging
      │
Production
```

Each environment uses different values.

| Variable | Development   | Production                   |
| -------- | ------------- | ---------------------------- |
| PORT     | 3000          | 80 / 443 (via reverse proxy) |
| Database | Local MongoDB | MongoDB Atlas                |
| API Keys | Test Keys     | Live Keys                    |

The source code remains the same.

Only the environment variables change.

---

# Environment Variables vs Hardcoded Values

| Hardcoded Values               | Environment Variables          |
| ------------------------------ | ------------------------------ |
| Stored in source code          | Stored outside source code     |
| Difficult to change            | Easy to modify                 |
| High risk of exposure          | Better security                |
| Different code per environment | Same code for all environments |

Using environment variables is the industry standard.

---

# Secret Rotation

Secrets should not remain unchanged forever.

Examples:

- Database password changed
- JWT secret updated
- API key regenerated
- Cloud credentials rotated

```text
Old Secret
      │
Generate New Secret
      │
Update Application
      │
Remove Old Secret
```

Regular secret rotation limits the impact of credential leaks.

---

# Production Secret Management

Large organizations often avoid `.env` files on production servers.

Instead, they use dedicated secret management services.

Examples:

| Platform     | Secret Management   |
| ------------ | ------------------- |
| Azure        | Azure Key Vault     |
| AWS          | AWS Secrets Manager |
| Google Cloud | Secret Manager      |
| Kubernetes   | Kubernetes Secrets  |
| Docker       | Docker Secrets      |

Applications retrieve secrets securely at runtime.

---

# Production Example

Suppose you deploy a Node.js application.

Project:

```text
/var/www/myapp
│
├── app.js
├── package.json
├── .env
└── uploads
```

The `.env` file contains:

```text
PORT=3000
DATABASE_URL=...
JWT_SECRET=...
SMTP_PASSWORD=...
```

Permissions:

```bash
chmod 600 .env
```

Ownership:

```bash
chown appuser:appuser .env
```

The application runs as `appuser`, so only that account can access the file.

In larger production environments, the secrets are retrieved from a secret management service instead of being stored locally.

---

# Common Secrets Found in Applications

| Secret              | Should Be Stored As  |
| ------------------- | -------------------- |
| Database Password   | Environment Variable |
| JWT Secret          | Environment Variable |
| API Keys            | Environment Variable |
| SMTP Password       | Environment Variable |
| OAuth Client Secret | Environment Variable |
| Cloud Credentials   | Secret Manager       |

---

# Best Practices

- Never hardcode secrets into source code.
- Keep `.env` files outside version control.
- Restrict permissions on secret files.
- Use different secrets for development and production.
- Rotate secrets periodically.
- Use dedicated secret management services in production.
- Remove unused credentials immediately.

---

# Common Mistakes

### Uploading `.env` to GitHub

This is one of the most common causes of credential leaks.

Always include `.env` in `.gitignore`.

---

### Reusing Secrets Across Environments

If the development environment is compromised, production credentials should remain protected.

Use separate secrets for each environment.

---

### Giving Everyone Access to Secret Files

Only the application and authorized administrators should be able to read secret files.

---

### Forgetting to Rotate Exposed Secrets

If a secret is accidentally exposed, replacing it is essential.

Simply deleting it from Git does not guarantee that it has not already been copied.

---

# Summary

Applications rely on secrets such as passwords, API keys, and encryption keys to interact with external systems securely. Storing these values directly in source code creates unnecessary risk. Environment variables separate configuration from code, making applications easier to deploy across multiple environments while reducing the chance of accidental exposure. In production, secret files should be protected with strict permissions, excluded from version control, and, where possible, replaced with dedicated secret management services such as Azure Key Vault or AWS Secrets Manager.

---

## Next Chapter

➡️ **08 - Backups**
