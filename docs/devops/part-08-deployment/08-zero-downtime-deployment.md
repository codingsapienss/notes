---
sidebar_label: Zero Downtime Deployment
sidebar_position: 8
---


# Zero Downtime Deployment

### Overview

In the previous chapter, we learned how PM2 manages Node.js applications in production.

A typical deployment process might look like this:

```text id="zero01"
Developer

↓

Git Pull

↓

Restart Application
```

Although this updates the application, there is one major problem.

When the application is restarted, it temporarily stops accepting requests.

During that brief period:

- Users may receive errors.
- Active requests may fail.
- Customers may experience downtime.

For small personal projects, this may not be a major concern.

However, for production systems serving thousands of users, even a few seconds of downtime can affect user experience and business operations.

To solve this problem, production environments use **Zero Downtime Deployment**.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand downtime during deployments.
- Learn what Zero Downtime Deployment is.
- Understand PM2 reload.
- Learn the role of cluster mode.
- Understand graceful application restarts.
- Learn deployment verification.
- Follow production deployment practices.

---

## What is Downtime?

Downtime is any period during which users cannot access the application.

Example:

```text id="zero02"
Users

↓

Application Restarting

↓

Application Unavailable
```

Even a short interruption can impact user experience.

---

## Traditional Deployment

A simple deployment often looks like this:

```text id="zero03"
Git Pull

↓

npm install

↓

Restart Application

↓

Application Starts
```

During the restart, the application is unavailable.

Timeline:

```text id="zero04"
Running

↓

Stopped

↓

Starting

↓

Running
```

The **Stopped** phase causes downtime.

---

## Why Downtime Happens

Suppose the application runs as a single process.

```text id="zero05"
Users

↓

Node.js
```

When restarting:

```text id="zero06"
Stop Process

↓

No Application Running

↓

Start New Process
```

Since no process is available during the restart, incoming requests cannot be handled.

---

## What is Zero Downtime Deployment?

Zero Downtime Deployment updates an application while continuing to serve user requests.

Instead of stopping everything at once:

```text id="zero07"
Old Version

↓

New Version Starts

↓

Traffic Switches

↓

Old Version Stops
```

Users continue accessing the application throughout the deployment.

---

## PM2 Reload

PM2 provides the `reload` command.

```bash id="zero_cmd01"
pm2 reload ecosystem.config.js
```

or

```bash id="zero_cmd02"
pm2 reload ecommerce-api
```

Unlike `restart`, `reload` attempts to replace processes gradually, reducing service interruption when running in cluster mode.

---

## Restart vs Reload

| Command       | Behaviour                                           |
| ------------- | --------------------------------------------------- |
| `pm2 restart` | Stops the application before starting it again      |
| `pm2 reload`  | Replaces running processes gradually (cluster mode) |

For production deployments using multiple instances, `reload` is generally preferred.

---

## Why Cluster Mode Matters

Zero downtime requires more than one running application instance.

Single process:

```text id="zero08"
Users

↓

Application
```

Cluster mode:

```text id="zero09"
Users

↓

PM2

↓

Instance 1

Instance 2

Instance 3

Instance 4
```

While one instance is restarting, the remaining instances continue serving requests.

---

## How Reload Works

Simplified workflow:

```text id="zero10"
Instance 1

↓

Start New Instance

↓

Switch Traffic

↓

Stop Old Instance
```

The process repeats for every application instance.

Users continue receiving responses during the deployment.

---

## Deployment Workflow

Typical production deployment:

```text id="zero11"
Git Pull

↓

npm install

↓

Build Application

↓

PM2 Reload

↓

Health Check

↓

Deployment Complete
```

Each step should complete successfully before moving to the next.

---

## Graceful Shutdown

A production application should shut down gracefully.

Instead of immediately terminating:

```text id="zero12"
Stop Immediately

↓

Dropped Requests
```

A graceful shutdown allows:

```text id="zero13"
Finish Active Requests

↓

Close Database Connections

↓

Exit
```

This reduces the likelihood of interrupted requests or incomplete operations.

---

## Health Checks

After deployment, verify that the application is healthy.

Example:

```text id="zero14"
Deployment

↓

Health Check

↓

Healthy?

↓

Users Continue
```

Typical health checks include:

- Homepage responds.
- API endpoints return expected responses.
- Database connectivity works.
- Logs show no startup errors.
- Memory usage is normal.

---

## Handling Failures

If deployment verification fails:

```text id="zero15"
Deploy

↓

Error Detected

↓

Rollback

↓

Previous Version
```

A rollback plan should exist before every production deployment.

---

## Production Deployment Flow

```text id="zero16"
Developer

↓

Git Push

↓

SSH

↓

Git Pull

↓

npm install

↓

Build

↓

PM2 Reload

↓

Verify

↓

Users Continue
```

This minimizes service interruption while deploying new code.

---

## Zero Downtime Architecture

```text id="zero17"
Users
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ▼
PM2 Cluster
   │
 ┌──┼──┬──┐
 ▼  ▼  ▼  ▼
App1 App2 App3 App4
```

PM2 distributes application processes, allowing updates to occur without stopping every instance simultaneously.

---

## Deployment Verification Checklist

After deployment, verify:

| Check               | Expected Result |
| ------------------- | --------------- |
| Website Opens       | ✓               |
| API Responds        | ✓               |
| PM2 Status Online   | ✓               |
| No Startup Errors   | ✓               |
| Database Connected  | ✓               |
| CPU & Memory Normal | ✓               |
| Logs Reviewed       | ✓               |

Deployment is not complete until these checks pass.

---

## When Zero Downtime Is Not Possible

Some deployments may still require brief maintenance windows.

Examples include:

- Major database schema changes.
- Operating system upgrades.
- Kernel updates requiring a reboot.
- Infrastructure migrations.
- Hardware maintenance.

Even in these cases, careful planning can minimize disruption.

---

## Real-World Example

Suppose an e-commerce website receives thousands of visitors every hour.

The development team releases a new version.

Instead of running:

```bash id="zero_cmd03"
pm2 restart ecommerce-api
```

they deploy the update using:

```bash id="zero_cmd04"
git pull
npm install
pm2 reload ecosystem.config.js
```

PM2 starts updated application instances while existing instances continue serving users. Once the new instances are running correctly, the old ones are replaced. After deployment, the team verifies the website, API endpoints, and application logs before declaring the deployment successful.

Customers continue shopping without noticing the deployment.

---

## Best Practices

- Use PM2 cluster mode for production deployments.
- Prefer `pm2 reload` over `pm2 restart` when appropriate.
- Test deployments in a staging environment first.
- Verify application health after every deployment.
- Review application logs immediately after deployment.
- Keep a rollback plan ready before deploying.
- Notify stakeholders before high-risk production releases.

---

## Common Mistakes

#### Using `pm2 restart` for Every Deployment

Restarting all application processes at once can temporarily interrupt user requests.

---

#### Running Only One Application Instance

A single instance cannot provide zero-downtime reloads because there is no second instance available to handle requests during replacement.

---

#### Skipping Health Checks

Completing a deployment without verifying application health may allow production issues to remain undetected.

---

#### Deploying Without a Rollback Plan

If a deployment introduces critical issues, recovery becomes slower and more difficult without a prepared rollback strategy.

---

#### Ignoring Application Logs

Startup warnings and runtime errors often appear in logs immediately after deployment and should be reviewed before considering the deployment complete.

---

## Summary

Zero Downtime Deployment is a deployment strategy that minimizes or eliminates service interruption while releasing new application versions. By using PM2 cluster mode and the `reload` command, new application instances can replace existing ones gradually while continuing to serve user requests. Combined with graceful shutdowns, health checks, and rollback planning, this approach provides a reliable deployment process suitable for production environments with continuous user traffic.

---

### Next Chapter

➡️ **09 - Upgrading Production**
