---
sidebar_label: Backup and Rollback
sidebar_position: 10
---


# Backup and Rollback

## Overview

No matter how carefully a deployment is planned, failures can still occur.

Examples include:

- A deployment introduces a critical bug.
- A database migration fails.
- A configuration file is accidentally modified.
- A server update causes compatibility issues.
- An application crashes after deployment.

Without a backup, recovering from these failures can be difficult or even impossible.

A well-designed production system always includes two essential capabilities:

- **Backup** — Creating copies of important data and configurations.
- **Rollback** — Restoring the previous working version when something goes wrong.

In this chapter, we will learn how to create reliable backups and perform safe rollbacks during production deployments.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand backup strategies.
- Learn different types of backups.
- Back up application files.
- Back up databases.
- Back up configuration files.
- Restore backups.
- Perform application rollbacks.
- Build a disaster recovery workflow.

---

# Why Backups Matter

Imagine the following deployment:

```text id="bk01"
Deploy New Version

↓

Unexpected Error

↓

Website Down
```

Without a backup:

```text id="bk02"
Recovery

↓

Very Difficult
```

With a backup:

```text id="bk03"
Restore Previous Version

↓

Website Running
```

Backups reduce downtime and protect valuable data.

---

# What Should Be Backed Up?

Production systems contain several important components.

| Component               | Should Be Backed Up?           |
| ----------------------- | ------------------------------ |
| Application Source Code | Yes                            |
| Database                | Yes                            |
| Environment Variables   | Yes                            |
| Nginx Configuration     | Yes                            |
| SSL Certificates        | Yes                            |
| Uploaded Files          | Yes                            |
| Logs                    | Optional (depending on policy) |

A complete recovery often requires more than just the application code.

---

# Types of Backups

| Backup Type         | Description                                    |
| ------------------- | ---------------------------------------------- |
| Full Backup         | Copies all selected data                       |
| Incremental Backup  | Copies only changes since the last backup      |
| Differential Backup | Copies changes since the last full backup      |
| Snapshot            | Point-in-time copy of an entire system or disk |

Different backup types serve different operational needs.

---

# Production Backup Architecture

```text id="bk04"
Production Server
       │
       ├────────────┐
       │            │
       ▼            ▼
Application     Database
       │            │
       └──────┬─────┘
              │
              ▼
         Backup Storage
```

A reliable backup includes both the application and its associated data.

---

# Backing Up Application Files

Compress the project directory.

```bash id="bkcmd01"
tar -czvf app-backup.tar.gz /home/deploy/apps/project
```

Explanation:

| Option | Purpose             |
| ------ | ------------------- |
| `-c`   | Create archive      |
| `-z`   | Compress using gzip |
| `-v`   | Show progress       |
| `-f`   | Specify output file |

This creates a compressed archive of the application files.

---

# Backing Up Environment Files

The `.env` file contains important configuration such as:

- Database credentials
- API keys
- Secret tokens
- Service URLs

Example:

```bash id="bkcmd02"
cp .env .env.backup
```

Environment files should be stored securely because they often contain sensitive information.

---

# Backing Up Nginx Configuration

Backup the Nginx configuration.

```bash id="bkcmd03"
sudo cp -r /etc/nginx /backup/nginx
```

This preserves:

- Server Blocks
- Reverse proxy configuration
- SSL configuration
- Redirect rules

---

# Backing Up SSL Certificates

If certificates are stored locally:

```bash id="bkcmd04"
sudo cp -r /etc/letsencrypt /backup/ssl
```

This allows certificate restoration if the server must be rebuilt.

---

# Database Backup

For MongoDB:

```bash id="bkcmd05"
mongodump --out ./mongodb-backup
```

Example workflow:

```text id="bk05"
Database

↓

mongodump

↓

Backup Folder
```

For relational databases, use the database's recommended backup tools.

---

# Server Snapshot

Cloud providers often support virtual machine snapshots.

Example:

```text id="bk06"
Virtual Machine

↓

Snapshot

↓

Point-in-Time Recovery
```

Snapshots typically include:

- Operating system
- Installed software
- Configuration
- Application files

Snapshots are especially useful before major operating system upgrades.

---

# Backup Workflow

```text id="bk07"
Stop Risky Changes

↓

Create Backup

↓

Verify Backup

↓

Deploy

↓

Monitor
```

A backup should always be completed before making significant production changes.

---

# What is Rollback?

Rollback means returning the system to the last known working version.

Example:

```text id="bk08"
Version 1.0

↓

Deploy 1.1

↓

Problem

↓

Rollback

↓

Version 1.0
```

Rollback minimizes downtime when deployments fail.

---

# Application Rollback

Suppose deployment introduces an error.

Recovery process:

```text id="bk09"
Deploy

↓

Error

↓

Restore Previous Files

↓

Reload PM2

↓

Application Running
```

A successful rollback restores service quickly while the issue is investigated.

---

# Database Rollback

Database changes require extra care.

Workflow:

```text id="bk10"
Backup Database

↓

Run Migration

↓

Migration Failed

↓

Restore Backup
```

Some migrations cannot be automatically reversed, making backups especially important.

---

# Restoring Application Files

Extract the archived backup.

```bash id="bkcmd06"
tar -xzvf app-backup.tar.gz
```

Restart or reload the application.

```bash id="bkcmd07"
pm2 reload ecosystem.config.js
```

Verify the application after restoration.

---

# Disaster Recovery Workflow

```text id="bk11"
Failure Detected

↓

Identify Cause

↓

Restore Backup

↓

Verify Application

↓

Users Return
```

Recovery should follow a documented process rather than ad hoc decisions.

---

# Backup Storage

Never store the only backup on the same production server.

Better strategy:

```text id="bk12"
Production Server

↓

Backup

↓

Cloud Storage

or

Separate Backup Server
```

Off-site or cloud storage protects backups from hardware failures affecting the production server.

---

# Backup Schedule

Typical production schedule:

| Frequency | Backup               |
| --------- | -------------------- |
| Daily     | Database             |
| Weekly    | Application Files    |
| Weekly    | Configuration Files  |
| Monthly   | Full Server Snapshot |

Actual schedules depend on business requirements and acceptable data loss.

---

# Verification

A backup is useful only if it can be restored.

Verify:

| Check               | Expected Result |
| ------------------- | --------------- |
| Archive Opens       | ✓               |
| Database Restores   | ✓               |
| Configuration Valid | ✓               |
| Application Starts  | ✓               |
| Website Works       | ✓               |

Regular restoration testing is as important as creating backups.

---

# Complete Backup Architecture

```text id="bk13"
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

        │
        ▼

   Backup Storage
```

The backup system protects every critical layer of the deployment.

---

# Real-World Example

An online learning platform deploys a new version of its backend.

Before deployment, the operations engineer:

1. Creates a MongoDB backup using `mongodump`.
2. Archives the application directory.
3. Backs up the `.env` file.
4. Copies the Nginx configuration.
5. Creates a virtual machine snapshot.
6. Deploys the new application.

After deployment, users report that the login service is failing because of an unexpected authentication bug.

The engineer immediately restores the previous application version, reloads PM2, and verifies that users can log in again. Since reliable backups were available, the service is restored quickly while the development team investigates the issue.

---

# Best Practices

- Create backups before every production deployment.
- Store backups outside the production server.
- Encrypt sensitive backup files when appropriate.
- Test restoration procedures regularly.
- Maintain multiple backup generations.
- Document rollback procedures.
- Automate recurring backups whenever possible.
- Monitor backup jobs for failures.

---

# Common Mistakes

### Not Testing Backups

Creating backups without verifying that they can be restored provides a false sense of security.

---

### Storing Backups on the Same Server

If the production server fails completely, locally stored backups may be lost as well.

---

### Forgetting Configuration Files

Recovering only the application code may not restore the production environment if configuration files are missing.

---

### Deploying Without a Rollback Plan

Every production deployment should have a documented recovery procedure before changes begin.

---

### Keeping Only One Backup

A single backup may already contain corrupted data or accidental changes. Maintaining multiple backup versions improves recovery options.

---

# Summary

Backups and rollbacks are fundamental components of production operations. A comprehensive backup strategy includes application files, databases, configuration files, SSL certificates, and environment variables. Combined with well-tested rollback procedures and secure off-site storage, these practices allow administrators to recover quickly from deployment failures, configuration mistakes, and unexpected system issues while minimizing downtime and data loss.

---

## Next Chapter

➡️ **11 - Complete Deployment Walkthrough**
