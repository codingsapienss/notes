---
sidebar_label: PM2 Cluster Mode
sidebar_position: 6
---


# PM2 Cluster Mode

### Overview

Modern servers typically have multiple CPU cores.

For example:

| Server          | CPU Cores |
| --------------- | --------- |
| Small VPS       | 2         |
| Production VM   | 4         |
| High-End Server | 8–32+     |

By default, a Node.js application runs as **a single process**, meaning it primarily utilizes **only one CPU core**, leaving the remaining cores underutilized.

PM2 **Cluster Mode** solves this problem by running multiple instances of the same application, allowing incoming requests to be distributed across all available CPU cores.

For CPU-intensive or high-traffic applications, this significantly improves performance, scalability, and availability.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand why Cluster Mode exists.
- Learn how Node.js uses CPU cores.
- Configure PM2 Cluster Mode.
- Understand request distribution.
- Perform zero-downtime reloads.
- Know when to use Cluster Mode.
- Follow production best practices.

---

## Single Process vs Cluster Mode

Without Cluster Mode:

```text
                4-Core Server

+-----------------------------------------+
| CPU 1 | Running Node.js Application      |
| CPU 2 | Idle                             |
| CPU 3 | Idle                             |
| CPU 4 | Idle                             |
+-----------------------------------------+
```

Only one CPU core is actively processing requests.

---

With Cluster Mode:

```text
                4-Core Server

+-----------------------------------------+
| CPU 1 | App Instance 1                  |
| CPU 2 | App Instance 2                  |
| CPU 3 | App Instance 3                  |
| CPU 4 | App Instance 4                  |
+-----------------------------------------+
```

Every CPU core participates in processing requests.

---

## Why Cluster Mode?

Suppose your application receives:

```text
20 Requests / Second
```

A single Node.js process may handle this comfortably.

Now imagine:

```text
2,000 Requests / Second
```

One process can become a bottleneck.

Cluster Mode distributes the workload.

```text
Incoming Requests
        │
        ▼
      PM2
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
App1   App2   App3
        │
        ▼
     Responses
```

Instead of one process doing all the work, multiple processes share the load.

---

## How PM2 Cluster Mode Works

PM2 internally uses the Node.js **Cluster Module**.

Architecture:

```text
               Internet
                   │
                   ▼
                Nginx
                   │
                   ▼
             PM2 Master
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
 Worker 1      Worker 2      Worker 3
      │            │            │
      └────────────┼────────────┘
                   ▼
             Same Application
```

Each worker runs an independent instance of the application.

---

## Starting Cluster Mode

Start an application using all available CPU cores:

```bash
pm2 start app.js -i max
```

Example:

```text
8-Core Server

↓

8 Worker Processes
```

PM2 automatically detects the number of CPU cores.

---

## Specifying the Number of Instances

Instead of using every core:

```bash
pm2 start app.js -i 4
```

This starts exactly four application instances.

Useful when:

- Reserving CPU for other services
- Running multiple applications
- Limiting resource usage

---

## Viewing Cluster Processes

List running processes:

```bash
pm2 list
```

Example:

```text
┌────┬──────────┬─────────┐
│ id │ name     │ mode    │
├────┼──────────┼─────────┤
│ 0  │ my-app   │ cluster │
│ 1  │ my-app   │ cluster │
│ 2  │ my-app   │ cluster │
│ 3  │ my-app   │ cluster │
└────┴──────────┴─────────┘
```

Each row represents one worker process.

---

## Request Distribution

Incoming requests are distributed among worker processes.

```text
Client Requests
        │
        ▼
      PM2
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
App1   App2   App3
 ▼      ▼      ▼
Responses Returned
```

This prevents a single process from becoming overloaded.

---

## Worker Failure

Suppose one worker crashes.

```text
App 1 ✓

App 2 ✗ Crash

App 3 ✓
```

PM2 detects the failure.

```text
Crash

↓

PM2 Restart

↓

New Worker Created
```

The remaining workers continue serving traffic while the failed worker is replaced.

---

## Zero-Downtime Reload

One of the biggest advantages of Cluster Mode is **zero-downtime reloads**.

Instead of restarting every process simultaneously:

```bash
pm2 reload my-app
```

PM2 performs:

```text
Worker 1 Restart

↓

Worker 2 Restart

↓

Worker 3 Restart

↓

Worker 4 Restart
```

Requests continue being served throughout the deployment.

This minimizes service interruptions during application updates.

---

## Restart vs Reload

| Restart                      | Reload                           |
| ---------------------------- | -------------------------------- |
| Stops every process          | Restarts workers one by one      |
| Temporary downtime may occur | Designed for near zero downtime  |
| Faster                       | Safer for production deployments |

For clustered production applications, `reload` is generally preferred over `restart`.

---

## Cluster Mode with Ecosystem Configuration

PM2 also supports Cluster Mode through an ecosystem configuration file.

Example:

```javascript
module.exports = {
  apps: [
    {
      name: "my-app",
      script: "app.js",
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
```

This approach is preferred for production deployments because configuration remains version controlled.

---

## Cluster Mode and Shared Resources

Although worker processes execute the same application, they do **not** share memory.

```text
Worker 1

Memory A

----------------

Worker 2

Memory B

----------------

Worker 3

Memory C
```

This means:

- Global variables are **not shared**
- In-memory caches are isolated
- Session data should not be stored in process memory

Shared services such as Redis or databases are commonly used when workers need common state.

---

## When Should You Use Cluster Mode?

Cluster Mode is recommended when:

- The server has multiple CPU cores.
- The application receives moderate or high traffic.
- High availability is required.
- Zero-downtime deployments are important.

Cluster Mode may not provide significant benefits for:

- Very small internal tools
- Low-traffic applications
- Development environments

---

## Production Deployment Workflow

```text
Developer

        │

GitHub

        │

git pull

        │

npm ci

        │

pm2 reload ecosystem.config.js

        │

Cluster Workers Updated

        │

Users Continue Accessing Application
```

This workflow minimizes downtime during deployments.

---

## Real-World Example

Suppose an Express.js API is deployed on a virtual machine with **8 CPU cores**.

Without Cluster Mode:

```text
8-Core Server

↓

1 Node.js Process

↓

7 CPU Cores Mostly Idle
```

With Cluster Mode:

```text
8-Core Server

↓

PM2

↓

8 Worker Processes

↓

Requests Shared Across All Workers
```

If one worker crashes due to an unexpected application error, PM2 automatically creates a replacement while the remaining workers continue serving client requests.

---

## Best Practices

- Use Cluster Mode on multi-core production servers.
- Prefer `instances: "max"` unless there is a reason to reserve CPU resources.
- Use `pm2 reload` for deployments instead of `restart`.
- Store sessions in Redis or another shared store rather than process memory.
- Monitor CPU and memory usage regularly.
- Test applications in Cluster Mode before production deployment.

---

## Common Mistakes

#### Assuming Workers Share Memory

Each worker is an independent process with its own memory space.

---

#### Using Global Variables for Shared State

Changes to global variables in one worker are not visible to other workers.

---

#### Using Restart Instead of Reload

Restarting every worker simultaneously can interrupt active user requests.

---

#### Running Cluster Mode on Single-Core Systems

Cluster Mode offers little or no performance benefit on servers with only one CPU core.

---

#### Ignoring Worker Crashes

Repeated worker crashes indicate an application issue that should be investigated rather than relying solely on PM2's automatic restart capability.

---

## Summary

PM2 Cluster Mode enables Node.js applications to utilize multiple CPU cores by running several worker processes simultaneously. It distributes incoming requests across workers, improves scalability, automatically replaces failed workers, and supports near zero-downtime deployments through sequential reloads. For production environments running on multi-core servers, Cluster Mode is a key feature for improving both performance and reliability.

---

### Next Chapter

➡️ **07 - Building Node Applications**
