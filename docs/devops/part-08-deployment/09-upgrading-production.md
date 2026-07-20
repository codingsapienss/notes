---
sidebar_label: Upgrading Production
sidebar_position: 9
---


# Upgrading Production

### Overview

Deploying an application for the first time is only the beginning of a production system's lifecycle.

Over time, you will need to upgrade:

- Your application
- Node.js
- npm packages
- Ubuntu packages
- Nginx
- PM2
- SSL certificates
- Environment variables
- Server configurations

Unlike development environments, upgrading production systems requires careful planning because mistakes can affect real users.

A poorly planned upgrade may result in:

- Website downtime
- Data corruption
- Security vulnerabilities
- Performance degradation
- Failed deployments

This chapter explains how to safely upgrade production systems while minimizing risk.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Plan production upgrades.
- Perform safe application upgrades.
- Upgrade server packages.
- Upgrade Node.js and dependencies.
- Validate deployments after upgrades.
- Reduce deployment risks.
- Understand maintenance windows.
- Roll back safely if necessary.

---

## What is a Production Upgrade?

A production upgrade is the process of replacing an existing production component with a newer version.

Examples include:

- Deploying a new application version.
- Updating Node.js.
- Updating Ubuntu packages.
- Upgrading Nginx.
- Installing security patches.
- Updating PM2.
- Changing server configuration.

Unlike a fresh deployment, production upgrades affect an already running application serving real users.

---

## Production Upgrade Architecture

```text id="up01"
Current Production

↓

Upgrade

↓

Testing

↓

Users Continue
```

The goal is to improve the system without disrupting users.

---

## Types of Production Upgrades

| Upgrade Type     | Example                                    |
| ---------------- | ------------------------------------------ |
| Application      | New features, bug fixes                    |
| Operating System | Ubuntu updates                             |
| Runtime          | Node.js upgrade                            |
| Dependencies     | npm package updates                        |
| Web Server       | Nginx upgrade                              |
| Process Manager  | PM2 update                                 |
| Security         | SSL certificates, patches                  |
| Configuration    | Environment variables, Nginx configuration |

Each upgrade should be evaluated independently before being applied.

---

## Planning an Upgrade

Never begin by immediately changing the production server.

Instead, follow a structured process.

```text id="up02"
Plan

↓

Backup

↓

Test

↓

Deploy

↓

Verify
```

Planning reduces the likelihood of unexpected failures.

---

## Maintenance Window

Some upgrades may require a scheduled maintenance window.

Example:

```text id="up03"
Saturday

↓

11:00 PM

↓

Upgrade

↓

Monitoring

↓

Complete
```

Maintenance windows reduce the impact on users by scheduling work during periods of lower traffic.

---

## Before Starting

Verify the following:

| Checklist             | Status |
| --------------------- | ------ |
| Backup Created        | ✓      |
| Source Code Committed | ✓      |
| Rollback Plan Ready   | ✓      |
| Team Notified         | ✓      |
| Monitoring Enabled    | ✓      |
| Disk Space Available  | ✓      |

Never begin an upgrade without preparation.

---

## Updating Application Code

Fetch the latest code.

```bash id="upcmd01"
git pull origin main
```

Install updated dependencies.

```bash id="upcmd02"
npm install
```

If the application requires a build step:

```bash id="upcmd03"
npm run build
```

Reload the application.

```bash id="upcmd04"
pm2 reload ecosystem.config.js
```

This sequence updates the application while minimizing service interruption.

---

## Upgrading npm Packages

Check for outdated packages.

```bash id="upcmd05"
npm outdated
```

Update packages.

```bash id="upcmd06"
npm update
```

For major dependency upgrades, test thoroughly in a staging environment before deploying to production.

---

## Upgrading Node.js

Check the installed version.

```bash id="upcmd07"
node -v
```

Verify compatibility with your application and dependencies before upgrading.

After upgrading Node.js:

```text id="up04"
Upgrade Node.js

↓

Restart PM2

↓

Verify Application
```

Always validate that the application behaves correctly after the runtime changes.

---

## Updating Ubuntu Packages

Refresh package information.

```bash id="upcmd08"
sudo apt update
```

Upgrade installed packages.

```bash id="upcmd09"
sudo apt upgrade -y
```

For full system upgrades:

```bash id="upcmd10"
sudo apt full-upgrade -y
```

Review the list of packages before confirming upgrades on production servers.

---

## Upgrading Nginx

Update package information.

```bash id="upcmd11"
sudo apt update
```

Upgrade Nginx.

```bash id="upcmd12"
sudo apt install --only-upgrade nginx
```

Test the configuration.

```bash id="upcmd13"
sudo nginx -t
```

Reload Nginx.

```bash id="upcmd14"
sudo systemctl reload nginx
```

Configuration validation should always precede reloading.

---

## Updating PM2

Install the latest PM2 version globally.

```bash id="upcmd15"
npm install -g pm2
```

Update the running PM2 daemon.

```bash id="upcmd16"
pm2 update
```

Verify applications remain online after the update.

---

## Environment Variable Changes

If `.env` values change:

```text id="up05"
Update .env

↓

Reload Application

↓

Verify Configuration
```

Changes to environment variables generally require the application to be reloaded or restarted before taking effect.

---

## Database Migrations

Some releases include database schema changes.

Typical workflow:

```text id="up06"
Backup Database

↓

Run Migration

↓

Deploy Application

↓

Verify Data
```

Database migrations should be tested carefully because they may be difficult to reverse.

---

## Upgrade Verification

After every upgrade, verify:

| Item               | Expected Result |
| ------------------ | --------------- |
| Website Loads      | ✓               |
| API Responds       | ✓               |
| Database Connected | ✓               |
| PM2 Status Online  | ✓               |
| Nginx Running      | ✓               |
| HTTPS Working      | ✓               |
| Logs Clean         | ✓               |

Verification is a mandatory part of the upgrade process.

---

## Monitoring After Upgrade

Continue monitoring after deployment.

```text id="up07"
Upgrade

↓

Monitor Logs

↓

Monitor CPU

↓

Monitor Memory

↓

Healthy System
```

Some issues appear only after users begin interacting with the updated application.

---

## Upgrade Workflow

```text id="up08"
Backup

↓

Git Pull

↓

npm Install

↓

Build

↓

Reload PM2

↓

Verify

↓

Monitor
```

This workflow provides a structured and repeatable deployment process.

---

## Complete Production Architecture

```text id="up09"
Users
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
Node.js
   │
   ▼
Database
```

Every layer should be validated after an upgrade.

---

## Real-World Example

Suppose an online shopping platform releases version **2.5** of its backend.

The deployment engineer follows this process:

1. Creates a database backup.
2. Confirms all changes are committed to Git.
3. Pulls the latest code using `git pull`.
4. Installs updated dependencies with `npm install`.
5. Runs `npm run build`.
6. Reloads the application using `pm2 reload ecosystem.config.js`.
7. Confirms Nginx is functioning correctly.
8. Verifies API endpoints, checkout functionality, and application logs.
9. Monitors CPU, memory usage, and error logs for the next several hours.

Because the upgrade was planned and verified, users continue using the platform without noticeable disruption.

---

## Best Practices

- Upgrade during periods of low user activity whenever possible.
- Create backups before every production upgrade.
- Test upgrades in a staging environment first.
- Upgrade one component at a time.
- Monitor logs after every deployment.
- Keep rollback procedures documented.
- Inform relevant stakeholders before planned maintenance.
- Validate every critical feature after deployment.

---

## Common Mistakes

#### Upgrading Directly in Production

Deploying untested changes directly to production increases the risk of outages and unexpected behavior.

---

#### Skipping Backups

Without backups, recovering from a failed upgrade may be slow or impossible.

---

#### Upgrading Everything Simultaneously

Updating the operating system, runtime, dependencies, and application in a single deployment makes troubleshooting significantly more difficult.

---

#### Ignoring Compatibility

A newer Node.js version or dependency may introduce breaking changes that affect the application.

---

#### Leaving Immediately After Deployment

Production upgrades should be monitored for a period after completion to detect issues that appear under real user traffic.

---

## Summary

Production upgrades are a routine but critical aspect of operating reliable software systems. Whether upgrading application code, Node.js, Ubuntu, Nginx, PM2, or project dependencies, every change should follow a structured process: plan, back up, test, deploy, verify, and monitor. By upgrading components carefully and validating the entire application after each change, administrators can reduce risk while keeping production services stable and available.

---

### Next Chapter

➡️ **10 - Backup and Rollback**
