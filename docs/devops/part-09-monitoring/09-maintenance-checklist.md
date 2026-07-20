---
sidebar_label: Maintenance Checklist
sidebar_position: 9
---


# Maintenance Checklist

### Overview

Deploying and monitoring a server are only part of a Linux administrator's responsibilities.

A production server requires **continuous maintenance** to remain:

- Secure
- Stable
- Reliable
- Performant
- Available

Without regular maintenance, even a perfectly configured server will eventually encounter problems such as:

- Full disks
- Expired SSL certificates
- Security vulnerabilities
- Memory leaks
- Slow applications
- Database growth
- Failed backups

A structured maintenance schedule helps administrators detect problems before they affect users.

This chapter provides a practical maintenance checklist that can be used for most Linux production servers.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand preventive maintenance.
- Create routine maintenance schedules.
- Perform daily server health checks.
- Maintain Linux services.
- Verify backups.
- Apply security updates.
- Plan capacity upgrades.
- Maintain production environments confidently.

---

## What is Server Maintenance?

Server maintenance is the routine process of inspecting, updating, optimizing, and securing a production server.

Example:

```text id="maint01"
Production Server

↓

Regular Checks

↓

Healthy Server

↓

Reliable Service
```

Maintenance is proactive rather than reactive.

Instead of waiting for failures, administrators regularly inspect the system to prevent them.

---

## Why Maintenance Matters

Imagine a production server that receives no maintenance.

```text id="maint02"
Month 1

↓

Works Well

↓

Month 6

↓

Large Logs

↓

Old Packages

↓

Disk Nearly Full

↓

Application Problems
```

Now compare it with a maintained server.

```text id="maint03"
Daily Checks

↓

Weekly Updates

↓

Monthly Cleanup

↓

Healthy Production Server
```

Regular maintenance significantly reduces downtime and operational risk.

---

## Maintenance Workflow

A typical maintenance cycle:

```text id="maint04"
Inspect

↓

Analyze

↓

Update

↓

Optimize

↓

Verify

↓

Document
```

Every maintenance task should be documented for future reference.

---

## Daily Maintenance Checklist

Daily tasks focus on identifying urgent production issues.

| Task                         | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| Check server uptime          | Verify system availability               |
| Review CPU usage             | Detect overload                          |
| Review memory usage          | Detect memory pressure                   |
| Check disk usage             | Prevent storage exhaustion               |
| Verify running services      | Ensure applications are online           |
| Review PM2 status            | Confirm Node.js applications are healthy |
| Review Nginx logs            | Identify request errors                  |
| Review application logs      | Detect exceptions                        |
| Verify database connectivity | Confirm backend availability             |
| Check backup status          | Ensure recent backups exist              |

Useful commands:

```bash id="maintcmd01"
uptime
```

```bash id="maintcmd02"
free -h
```

```bash id="maintcmd03"
df -h
```

```bash id="maintcmd04"
pm2 list
```

```bash id="maintcmd05"
sudo systemctl status nginx
```

---

## Weekly Maintenance Checklist

Weekly tasks focus on housekeeping and system health.

| Task                        | Purpose                        |
| --------------------------- | ------------------------------ |
| Update package lists        | Refresh repository metadata    |
| Review failed logins        | Detect suspicious activity     |
| Clean package cache         | Recover storage                |
| Remove unnecessary packages | Reduce clutter                 |
| Review large log files      | Prevent disk exhaustion        |
| Verify firewall rules       | Maintain security              |
| Check SSL expiry            | Prevent certificate expiration |

Commands:

```bash id="maintcmd06"
sudo apt update
```

```bash id="maintcmd07"
sudo apt autoremove
```

```bash id="maintcmd08"
sudo apt clean
```

---

## Monthly Maintenance Checklist

Monthly maintenance involves deeper inspections.

| Task                     | Purpose                      |
| ------------------------ | ---------------------------- |
| Install security updates | Patch vulnerabilities        |
| Review disk growth       | Plan storage expansion       |
| Review user accounts     | Remove unused users          |
| Review SSH configuration | Improve security             |
| Verify database size     | Plan capacity                |
| Test restore process     | Validate backups             |
| Review scheduled tasks   | Ensure automation is working |

Commands:

```bash id="maintcmd09"
sudo apt upgrade
```

```bash id="maintcmd10"
crontab -l
```

---

## Quarterly Maintenance Checklist

Quarterly maintenance focuses on infrastructure improvements.

Tasks include:

- Review server capacity.
- Analyze performance trends.
- Upgrade application dependencies.
- Review monitoring dashboards.
- Audit firewall rules.
- Review SSL configuration.
- Verify backup retention policies.
- Review disaster recovery documentation.

Quarterly reviews help ensure the infrastructure continues to meet business requirements.

---

## Yearly Maintenance Checklist

Annual maintenance is strategic rather than operational.

Tasks include:

- Upgrade operating system (when appropriate).
- Review server architecture.
- Replace unsupported software versions.
- Renew long-term certificates.
- Review security policies.
- Test disaster recovery plans.
- Review monitoring strategy.
- Evaluate hardware requirements.

These activities prepare the infrastructure for long-term reliability.

---

## Security Maintenance

Security should be reviewed continuously.

Checklist:

- Install security patches.
- Review SSH authentication.
- Remove inactive users.
- Disable unused services.
- Rotate credentials.
- Audit firewall configuration.
- Verify file permissions.
- Monitor authentication logs.

Example:

```text id="maint05"
Security Updates

↓

System Hardened

↓

Lower Risk
```

---

## Storage Maintenance

Storage should be monitored regularly.

Checklist:

- Review filesystem usage.
- Remove temporary files.
- Archive old logs.
- Delete obsolete backups.
- Verify inode usage.
- Monitor disk I/O.

Commands:

```bash id="maintcmd11"
df -h
```

```bash id="maintcmd12"
df -i
```

```bash id="maintcmd13"
du -sh /*
```

---

## Application Maintenance

Applications also require routine care.

Checklist:

- Review PM2 restart count.
- Review application logs.
- Update dependencies.
- Monitor response times.
- Verify scheduled jobs.
- Test APIs.
- Validate environment variables.

Commands:

```bash id="maintcmd14"
pm2 monit
```

```bash id="maintcmd15"
pm2 logs
```

---

## Database Maintenance

Database health directly affects application performance.

Checklist:

- Verify database backups.
- Review slow queries.
- Monitor database size.
- Verify indexes.
- Archive obsolete data.
- Test database restoration.

Example:

```text id="maint06"
Application

↓

Database

↓

Backup

↓

Restore Test
```

A backup is valuable only if it can be restored successfully.

---

## Documentation Maintenance

Documentation should evolve with the infrastructure.

Maintain records for:

- Server inventory
- Network diagrams
- Firewall rules
- Installed software
- Environment variables
- Deployment procedures
- Backup procedures
- Recovery procedures

Well-maintained documentation reduces recovery time during incidents.

---

## Maintenance Calendar

```text id="maint07"
Daily
 │
 ▼
Weekly
 │
 ▼
Monthly
 │
 ▼
Quarterly
 │
 ▼
Yearly
```

Different maintenance activities occur at different intervals.

---

## Complete Production Checklist

```text id="maint08"
Server

├── CPU ✓

├── Memory ✓

├── Disk ✓

├── Network ✓

├── Nginx ✓

├── PM2 ✓

├── Node.js ✓

├── Database ✓

├── SSL ✓

└── Backups ✓
```

Every production server should be reviewed systematically.

---

## Useful Maintenance Commands

| Command                  | Purpose                    |
| ------------------------ | -------------------------- |
| `uptime`                 | Check server uptime        |
| `top`                    | CPU monitoring             |
| `free -h`                | Memory usage               |
| `df -h`                  | Disk usage                 |
| `df -i`                  | Inode usage                |
| `pm2 list`               | Running applications       |
| `pm2 monit`              | PM2 monitoring             |
| `pm2 logs`               | Application logs           |
| `systemctl status nginx` | Nginx status               |
| `journalctl`             | System logs                |
| `apt update`             | Update package lists       |
| `apt upgrade`            | Upgrade installed packages |

---

## Real-World Example

A software company hosts several production Node.js applications on an Ubuntu server.

Every morning, the system administrator:

1. Checks `pm2 list` to verify all applications are online.
2. Reviews CPU, memory, and disk usage.
3. Examines the previous day's Nginx and application logs.
4. Confirms that automated backups completed successfully.

Every Friday:

- Cleans package caches.
- Reviews failed SSH login attempts.
- Verifies SSL certificate validity.
- Checks firewall rules.

At the end of each month:

- Installs operating system updates.
- Tests restoring the latest database backup.
- Reviews disk growth and storage planning.
- Updates deployment and recovery documentation.

Because these maintenance tasks are performed consistently, the production environment remains stable and major outages are rare.

---

## Best Practices

- Follow a documented maintenance schedule.
- Automate repetitive maintenance tasks where appropriate.
- Test backups regularly.
- Apply security updates promptly.
- Review monitoring dashboards every day.
- Keep documentation current.
- Investigate unusual trends immediately.
- Schedule maintenance during low-traffic periods.
- Record all significant maintenance activities.

---

## Common Mistakes

#### Skipping Routine Maintenance

Small issues accumulate over time and can eventually cause major production failures.

---

#### Never Testing Backups

A backup that cannot be restored is effectively useless.

---

#### Ignoring Security Updates

Delaying security patches increases exposure to known vulnerabilities.

---

#### Performing Maintenance Without Documentation

Undocumented changes make troubleshooting and future maintenance more difficult.

---

#### Waiting for Users to Report Problems

Maintenance should prevent incidents rather than respond only after users notice them.

---

## Summary

Routine maintenance is essential for keeping Linux production servers secure, stable, and performant. By following structured daily, weekly, monthly, quarterly, and yearly maintenance checklists, administrators can detect issues early, reduce downtime, maintain security, and extend the life of their infrastructure. Preventive maintenance, combined with monitoring and documentation, forms the foundation of reliable production operations.

---
