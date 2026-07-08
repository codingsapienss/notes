---
sidebar_label: Backups
sidebar_position: 8
---


# Backups

## Overview

No matter how secure a Linux server is, failures can still occur.

A server may fail because of:

- Hardware failure
- Accidental file deletion
- Software bugs
- Malware or ransomware
- Human error
- Failed updates
- Data corruption
- Cloud infrastructure failures

Security measures such as SSH hardening, firewalls, and Fail2Ban help prevent attacks, but **they cannot recover lost data**.

That is the purpose of backups.

A backup is a copy of important data stored separately so it can be restored if the original data is lost or damaged.

In production environments, backups are not optional—they are a fundamental part of disaster recovery.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand why backups are essential.
- Learn different backup types.
- Understand the 3-2-1 backup strategy.
- Learn what should be backed up.
- Create backups using Linux tools.
- Verify backups.
- Apply production backup best practices.

---

# Why Are Backups Important?

Imagine running a production application.

```text
Ubuntu Server
     │
Node.js
     │
MongoDB
     │
Customer Data
```

Now suppose someone accidentally executes:

```bash
rm -rf /var/www/myapp
```

Without a backup:

```text
Application Lost

↓

Downtime

↓

Data Loss
```

With a backup:

```text
Backup Available

↓

Restore Files

↓

Application Running Again
```

Backups transform a potentially catastrophic event into a recoverable one.

---

# What Should Be Backed Up?

Not everything on a server needs to be backed up.

Focus on data that cannot be easily recreated.

Typical production backups include:

- Application source code
- Configuration files
- Databases
- Environment variables
- SSL certificates
- Uploaded user files
- Scheduled jobs
- Important scripts

Items that usually **do not** need backups:

- Temporary files
- Package cache
- Log files (unless required)
- Installed packages (can usually be reinstalled)

---

# Types of Backups

## Full Backup

A full backup copies all selected data.

```text
Server

↓

Copy Everything

↓

Backup Storage
```

Advantages:

- Simple restore
- Complete copy

Disadvantages:

- Larger storage requirement
- Longer backup time

---

## Incremental Backup

Only changes since the previous backup are copied.

```text
Day 1

Full Backup

↓

Day 2

Only New Changes

↓

Day 3

Only New Changes
```

Advantages:

- Faster backups
- Less storage

Disadvantages:

- Restore process is more complex.

---

## Differential Backup

Copies changes made since the last full backup.

```text
Full Backup

↓

Day 2

Changes Since Full

↓

Day 3

Changes Since Full
```

Advantages:

- Faster restoration than incremental backups.

Disadvantages:

- Uses more storage than incremental backups.

---

# The 3-2-1 Backup Rule

One of the most widely accepted backup strategies is the **3-2-1 Rule**.

```text
3 Copies of Data
        │
2 Different Storage Media
        │
1 Copy Stored Offsite
```

Example:

| Copy     | Location          |
| -------- | ----------------- |
| Original | Production Server |
| Backup 1 | External Disk     |
| Backup 2 | Cloud Storage     |

This protects against hardware failure, accidental deletion, and site-wide disasters.

---

# Local vs Remote Backups

| Local Backup               | Remote Backup                       |
| -------------------------- | ----------------------------------- |
| Faster restore             | Protects against physical disasters |
| No Internet required       | Accessible from anywhere            |
| Vulnerable if server fails | More resilient                      |
| Good for quick recovery    | Good for disaster recovery          |

Production environments often use **both**.

---

# Backup Frequency

How often backups should run depends on how frequently data changes.

| Data Type           | Suggested Frequency           |
| ------------------- | ----------------------------- |
| Databases           | Daily or Hourly               |
| User Uploads        | Daily                         |
| Configuration Files | After Changes                 |
| Application Code    | Version Controlled + Releases |
| Entire Server       | Weekly or Monthly             |

Critical production databases may require continuous replication in addition to scheduled backups.

---

# Creating Backups with tar

Create a compressed backup:

```bash
tar -czf backup.tar.gz /var/www/myapp
```

Explanation:

| Option | Meaning             |
| ------ | ------------------- |
| `-c`   | Create archive      |
| `-z`   | Compress using gzip |
| `-f`   | Specify filename    |

Restore:

```bash
tar -xzf backup.tar.gz
```

---

# Creating Backups with rsync

`rsync` is commonly used for efficient backups.

Example:

```bash
rsync -av /var/www/myapp /backup/
```

Advantages:

- Fast
- Copies only changed files
- Preserves permissions
- Suitable for scheduled backups

---

# Database Backups

Application files alone are not enough.

Databases should also be backed up.

Example workflow:

```text
Node.js
      │
MongoDB
      │
Database Backup
      │
Backup Storage
```

A restored application without its database is often unusable.

---

# Verifying Backups

Creating a backup is only the first step.

A backup that cannot be restored is effectively useless.

Verification should include:

- Confirm backup completed successfully.
- Verify backup file size.
- Check archive integrity.
- Perform test restores periodically.

```text
Create Backup

↓

Verify

↓

Test Restore

↓

Backup Trusted
```

---

# Automating Backups

Backups should not depend on manual execution.

They are commonly automated using:

- Cron jobs
- Systemd timers
- Backup software
- Cloud backup services

Example schedule:

```text
Every Day

02:00 AM

↓

Automatic Backup
```

Automation reduces the risk of missed backups.

---

# Backup Retention

Keeping every backup forever is impractical.

A retention policy defines how long backups are stored.

Example:

| Backup Type | Retention |
| ----------- | --------- |
| Daily       | 7 Days    |
| Weekly      | 4 Weeks   |
| Monthly     | 12 Months |

Retention policies balance storage usage and recovery requirements.

---

# Production Example

Suppose your application is hosted on an Azure Virtual Machine.

```text
Cloudflare
      │
Azure VM
      │
Ubuntu
      │
Node.js
      │
MongoDB Atlas
```

Backup strategy:

- Source code stored in Git.
- MongoDB Atlas performs scheduled database backups.
- User uploads synchronized daily to cloud storage.
- `.env` stored securely and backed up separately.
- Weekly compressed server configuration backup.
- Monthly restore testing in a staging environment.

This approach provides protection against accidental deletion, server failure, and infrastructure issues.

---

# Best Practices

- Follow the 3-2-1 backup rule.
- Automate backups.
- Encrypt backup archives containing sensitive data.
- Store backups in multiple locations.
- Test restoration procedures regularly.
- Monitor backup jobs for failures.
- Document backup and recovery procedures.

---

# Common Mistakes

### Never Testing Restores

A backup should not be considered reliable until it has been successfully restored.

---

### Storing Backups on the Same Server

If the server's disk fails, both the original data and the backup may be lost.

Always maintain at least one separate backup location.

---

### Backing Up Only Application Files

Databases, configuration files, SSL certificates, and environment variables are equally important.

---

### No Backup Schedule

Manual backups are easy to forget.

Automated backup jobs provide more consistent protection.

---

# Summary

Backups are a critical component of Linux server security and disaster recovery. They protect against hardware failures, accidental deletion, software issues, ransomware, and other unexpected events. A well-designed backup strategy includes regular automated backups, secure offsite storage, verification through test restores, and clear retention policies. Following practices such as the 3-2-1 rule ensures that important data can be recovered quickly when failures occur.

---

## Next Chapter

➡️ **09 - Production Security Checklist**
