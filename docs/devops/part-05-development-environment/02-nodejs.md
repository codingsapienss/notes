---
sidebar_label: Node.js
sidebar_position: 2
---


# Node.js

### Overview

After installing Git, the next step in preparing a Linux server for application deployment is installing **Node.js**.

Node.js is a JavaScript runtime that allows JavaScript code to execute outside the browser. It powers thousands of backend applications, REST APIs, real-time services, automation tools, and command-line utilities.

A production Linux server must have a stable and supported version of Node.js installed before deploying any Node.js application.

This chapter explains how Node.js works, how to install it correctly on Ubuntu, and how to manage Node.js versions for production environments.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what Node.js is.
- Learn how Node.js works.
- Install Node.js on Ubuntu.
- Understand LTS and Current releases.
- Verify the installation.
- Manage Node.js versions.
- Apply production installation best practices.

---

## What is Node.js?

Node.js is an open-source JavaScript runtime built on Google's **V8 JavaScript Engine**.

Instead of executing JavaScript inside a web browser, Node.js executes JavaScript directly on the operating system.

```text
JavaScript Code
       │
       ▼
Node.js Runtime
       │
       ▼
Linux Operating System
```

This allows JavaScript to:

- Read and write files
- Connect to databases
- Create web servers
- Access the operating system
- Handle network requests
- Build backend applications

---

## Why Do We Need Node.js?

A browser can execute frontend JavaScript, but it cannot:

- Listen on network ports
- Access the Linux file system
- Connect directly to databases
- Run background services

Node.js provides these capabilities.

Example:

```text
Browser

↓

HTTP Request

↓

Node.js Server

↓

MongoDB
```

This architecture is commonly used in MERN, MEAN, and Express-based applications.

---

## Node.js Architecture

A simplified architecture:

```text
Application Code
        │
        ▼
Node.js Runtime
        │
        ▼
V8 JavaScript Engine
        │
        ▼
Linux Kernel
```

Node.js also provides:

- Event Loop
- File System APIs
- Networking APIs
- Timers
- Streams
- Process Management

---

## LTS vs Current Releases

Node.js releases are generally categorized into:

| Version                 | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| LTS (Long-Term Support) | Stable, recommended for production          |
| Current                 | Latest features for testing and development |

Production servers should normally use the **LTS** release because it receives long-term maintenance and security updates.

---

## Installing Node.js

Although Ubuntu repositories include Node.js, they may not provide the latest LTS version.

A common production approach is to install Node.js using the **NodeSource** repository.

Update package information:

```bash
sudo apt update
```

Download the NodeSource setup script (replace `22.x` with the desired LTS major version if needed):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
```

Install Node.js:

```bash
sudo apt install -y nodejs
```

This installs both:

- Node.js
- npm (Node Package Manager)

---

## Verifying the Installation

Check the installed Node.js version:

```bash
node -v
```

Example:

```text
v22.15.0
```

Check npm:

```bash
npm -v
```

Confirm both commands execute successfully before deploying applications.

---

## Understanding the Node.js Executable

Once installed, Node.js is available through the `node` command.

Example:

```bash
node
```

Interactive shell:

```text
>
```

Exit:

```bash
.exit
```

Run a JavaScript file:

```bash
node app.js
```

---

## Running a Simple Program

Create a file:

```javascript
console.log("Hello, Linux!");
```

Run it:

```bash
node app.js
```

Output:

```text
Hello, Linux!
```

This confirms the runtime is functioning correctly.

---

## Checking Installation Paths

Locate the Node.js executable:

```bash
which node
```

Example:

```text
/usr/bin/node
```

Locate npm:

```bash
which npm
```

These commands help verify the installation and troubleshoot PATH-related issues.

---

## Node.js Version Management

Different applications may require different Node.js versions.

For example:

| Project         | Required Version |
| --------------- | ---------------- |
| Legacy API      | Node.js 18 LTS   |
| New Application | Node.js 22 LTS   |

Tools such as **NVM (Node Version Manager)** allow developers to switch between multiple Node.js versions.

However, production servers typically standardize on a single supported LTS version to reduce operational complexity.

---

## Updating Node.js

Check the current version:

```bash
node -v
```

Upgrade using the NodeSource repository:

```bash
sudo apt update
sudo apt upgrade nodejs
```

After updating:

```bash
node -v
```

Verify that the application remains compatible before deploying the updated runtime.

---

## Common Directories

Typical installation locations:

| Component       | Location                                         |
| --------------- | ------------------------------------------------ |
| Node.js Binary  | `/usr/bin/node`                                  |
| npm Binary      | `/usr/bin/npm`                                   |
| Global Packages | `/usr/lib/node_modules` (varies by distribution) |

Application source code should **not** be stored in these locations.

---

## Production Installation Workflow

```text
Fresh Ubuntu Server
        │
        ▼
Install Git
        │
        ▼
Install Node.js LTS
        │
        ▼
Verify Installation
        │
        ▼
Clone Repository
        │
        ▼
Install Dependencies
        │
        ▼
Run with PM2
```

This forms the foundation for deploying Node.js applications.

---

## Real-World Example

Suppose you deploy an Express.js application on an Ubuntu server hosted in Azure.

Deployment process:

```text
Ubuntu Server
      │
Git Clone
      │
Node.js Installed
      │
npm Install
      │
PM2
      │
Nginx
      │
Internet
```

Whenever a new version of the application is deployed:

1. Pull the latest code.
2. Install any new dependencies.
3. Restart the application using PM2.
4. Verify the application is healthy.

The Node.js runtime remains installed on the server while the application code is updated independently.

---

## Best Practices

- Use the latest supported LTS version for production.
- Install Node.js from a trusted source such as NodeSource.
- Keep Node.js updated with security releases.
- Verify the installed version after upgrades.
- Standardize the Node.js version across production servers.
- Test applications before upgrading to a new major release.

---

## Common Mistakes

#### Using an End-of-Life Version

Unsupported versions no longer receive security updates and should not be used in production.

---

#### Installing from Outdated Repositories

Distribution repositories may contain older versions that lack recent features or security fixes.

---

#### Upgrading Without Testing

Major version upgrades can introduce breaking changes.

Always test the application before upgrading production servers.

---

#### Installing Multiple Versions Unnecessarily

Using different Node.js versions across production servers makes troubleshooting and maintenance more difficult.

---

## Summary

Node.js is the runtime that enables JavaScript applications to execute on Linux servers. Installing a supported LTS release, verifying the installation, and maintaining consistent versions across environments are essential steps in preparing a production server. With Node.js in place, the server is ready to install project dependencies and run backend applications.

---

### Next Chapter

➡️ **03 - npm**
