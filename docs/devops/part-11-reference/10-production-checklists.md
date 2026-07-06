---
sidebar_label: Production Checklists
sidebar_position: 10
---


# Production Checklists

## Overview

Production systems require consistency. A small oversight—such as forgetting to configure a firewall rule, renew an SSL certificate, or back up a database—can lead to outages, security incidents, or data loss.

This chapter provides practical checklists that can be followed before deployment, during maintenance, and while responding to incidents. These checklists are designed for Linux servers hosting web applications, APIs, databases, and reverse proxies.

---

# Learning Objectives

After completing this chapter, you will be able to:

- Prepare Linux servers for production.
- Verify deployments before release.
- Secure production infrastructure.
- Perform safe maintenance.
- Validate backups and recovery plans.
- Handle incidents systematically.
- Maintain production reliability.

---

# Production Workflow

```text id="p1d4rw"
Development

↓

Testing

↓

Deployment

↓

Verification

↓

Monitoring

↓

Maintenance

↓

Incident Response

↓

Continuous Improvement
```

---

# New Server Checklist

Before using a newly created server:

| Task                                   | Status |
| -------------------------------------- | ------ |
| Update packages                        | □      |
| Create non-root administrator          | □      |
| Configure SSH keys                     | □      |
| Disable password login (if applicable) | □      |
| Configure firewall                     | □      |
| Set hostname                           | □      |
| Configure timezone                     | □      |
| Install monitoring tools               | □      |
| Install Git                            | □      |
| Install Node.js (if required)          | □      |
| Install Nginx                          | □      |
| Install PM2                            | □      |
| Configure automatic security updates   | □      |
| Verify disk space                      | □      |

Commands:

```bash id="srv001"
sudo apt update

sudo apt upgrade -y
```

---

# Security Checklist

Verify the following before exposing a server to the internet.

| Item                      | Status |
| ------------------------- | ------ |
| Firewall enabled          | □      |
| SSH protected             | □      |
| Strong passwords          | □      |
| SSH keys configured       | □      |
| Root login restricted     | □      |
| Unused ports closed       | □      |
| Automatic updates enabled | □      |
| SSL installed             | □      |
| Secrets stored securely   | □      |
| File permissions verified | □      |

---

# Firewall Checklist

Ensure only required ports are open.

| Port     | Required      | Status |
| -------- | ------------- | ------ |
| 22       | SSH           | □      |
| 80       | HTTP          | □      |
| 443      | HTTPS         | □      |
| Database | Internal Only | □      |
| Redis    | Internal Only | □      |

Verify:

```bash id="srv002"
sudo ufw status
```

---

# Deployment Checklist

Before deployment:

| Task                           | Status |
| ------------------------------ | ------ |
| Code reviewed                  | □      |
| Tests passed                   | □      |
| Branch merged                  | □      |
| Dependencies updated           | □      |
| Environment variables verified | □      |
| Database migration reviewed    | □      |
| Backup completed               | □      |
| Rollback plan prepared         | □      |

Deployment steps:

```text id="srv003"
Git Pull

↓

Install Dependencies

↓

Build

↓

Restart Application

↓

Verify Logs

↓

Verify Website
```

---

# Node.js Deployment Checklist

Before restarting the application:

| Verify                    | Status |
| ------------------------- | ------ |
| package.json present      | □      |
| .env exists               | □      |
| node_modules installed    | □      |
| PM2 configuration correct | □      |
| Build completed           | □      |

Commands:

```bash id="srv004"
npm install

pm2 reload ecosystem.config.js
```

---

# Nginx Checklist

Before reloading Nginx:

| Item                          | Status |
| ----------------------------- | ------ |
| Configuration syntax verified | □      |
| SSL paths valid               | □      |
| Reverse proxy configured      | □      |
| Access logs enabled           | □      |
| Error logs enabled            | □      |

Test configuration:

```bash id="srv005"
sudo nginx -t
```

Reload:

```bash id="srv006"
sudo systemctl reload nginx
```

---

# SSL Checklist

| Task                           | Status |
| ------------------------------ | ------ |
| Certificate valid              | □      |
| Private key present            | □      |
| HTTPS redirect enabled         | □      |
| Renewal configured             | □      |
| Browser verification completed | □      |

Verify certificate:

```bash id="srv007"
openssl x509 -in fullchain.pem -text -noout
```

---

# Database Checklist

Before deploying database changes:

| Task                  | Status |
| --------------------- | ------ |
| Backup completed      | □      |
| Migration tested      | □      |
| Indexes reviewed      | □      |
| Disk space sufficient | □      |
| Rollback available    | □      |

Example:

```text id="srv008"
Backup

↓

Migration

↓

Verification

↓

Application Restart
```

---

# Backup Checklist

| Item                        | Status |
| --------------------------- | ------ |
| Database backup             | □      |
| Application backup          | □      |
| Configuration backup        | □      |
| SSL certificate backup      | □      |
| Environment files backed up | □      |
| Backup tested               | □      |

Recommended backup targets:

```text id="srv009"
/etc

/var/www

/etc/nginx

/etc/systemd

Database

.env
```

---

# Monitoring Checklist

Verify monitoring after deployment.

| Monitor          | Status |
| ---------------- | ------ |
| CPU              | □      |
| Memory           | □      |
| Disk             | □      |
| Network          | □      |
| Application Logs | □      |
| Nginx Logs       | □      |
| Database Health  | □      |

Useful commands:

```bash id="srv010"
top

free -h

df -h
```

---

# Log Verification Checklist

Review logs after every deployment.

| Log              | Checked |
| ---------------- | ------- |
| Application log  | □       |
| Nginx access log | □       |
| Nginx error log  | □       |
| System log       | □       |
| PM2 log          | □       |

Commands:

```bash id="srv011"
tail -f /var/log/nginx/error.log
```

```bash id="srv012"
pm2 logs
```

---

# Networking Checklist

| Task                      | Status |
| ------------------------- | ------ |
| DNS resolves correctly    | □      |
| HTTP accessible           | □      |
| HTTPS accessible          | □      |
| Reverse proxy operational | □      |
| Firewall rules verified   | □      |
| Listening ports verified  | □      |

Commands:

```bash id="srv013"
ping example.com
```

```bash id="srv014"
curl https://example.com
```

```bash id="srv015"
ss -tulpn
```

---

# Application Verification Checklist

Immediately after deployment:

| Test                          | Status |
| ----------------------------- | ------ |
| Homepage loads                | □      |
| Login works                   | □      |
| APIs respond                  | □      |
| Database connection succeeds  | □      |
| Upload functionality works    | □      |
| Downloads work                | □      |
| Error pages display correctly | □      |

---

# Production Maintenance Checklist

Perform regularly.

| Task                | Frequency   |
| ------------------- | ----------- |
| Package updates     | Weekly      |
| Security patches    | Immediately |
| Disk cleanup        | Monthly     |
| Backup verification | Monthly     |
| SSL review          | Monthly     |
| Log rotation check  | Monthly     |
| User audit          | Quarterly   |
| Dependency updates  | Quarterly   |

---

# Incident Response Checklist

```text id="srv016"
Incident

↓

Assess

↓

Contain

↓

Investigate

↓

Resolve

↓

Verify

↓

Document

↓

Review
```

During an incident:

| Task                | Status |
| ------------------- | ------ |
| Confirm issue       | □      |
| Determine impact    | □      |
| Preserve logs       | □      |
| Identify root cause | □      |
| Apply fix           | □      |
| Verify recovery     | □      |
| Document findings   | □      |

---

# Rollback Checklist

If deployment fails:

| Step                           | Status |
| ------------------------------ | ------ |
| Stop deployment                | □      |
| Restore previous release       | □      |
| Restore database (if required) | □      |
| Restart services               | □      |
| Verify functionality           | □      |
| Notify stakeholders            | □      |

---

# Server Health Checklist

Run daily.

```bash id="srv017"
uptime
```

```bash id="srv018"
free -h
```

```bash id="srv019"
df -h
```

```bash id="srv020"
systemctl --failed
```

Verify:

- No failed services.
- Sufficient disk space.
- Acceptable CPU usage.
- Adequate available memory.

---

# Daily Administrator Checklist

```text id="srv021"
Login

↓

Check Services

↓

Review Logs

↓

Verify Backups

↓

Review Monitoring

↓

Security Review

↓

End of Day
```

---

# Weekly Checklist

- □ Apply operating system updates.
- □ Review authentication logs.
- □ Check firewall rules.
- □ Remove unused files.
- □ Verify scheduled jobs.
- □ Confirm backups completed successfully.
- □ Review SSL certificate expiry.
- □ Inspect disk usage.

---

# Monthly Checklist

- □ Test disaster recovery procedure.
- □ Rotate credentials if required.
- □ Review user accounts and permissions.
- □ Verify backup restoration.
- □ Review monitoring alerts.
- □ Remove obsolete deployments.
- □ Audit installed packages.
- □ Update documentation.

---

# Production Readiness Checklist

Before going live:

| Requirement            | Status |
| ---------------------- | ------ |
| SSL configured         | □      |
| Domain configured      | □      |
| DNS propagated         | □      |
| Firewall configured    | □      |
| Monitoring active      | □      |
| Backups verified       | □      |
| Logging enabled        | □      |
| Alerting configured    | □      |
| Documentation complete | □      |
| Rollback tested        | □      |

---

# Real-World Example

A Node.js API is scheduled for deployment.

The operations team follows the production checklist:

1. Pull the latest code.
2. Confirm `.env` values.
3. Verify database backup.
4. Install dependencies.

```bash id="srv022"
npm install
```

5. Validate Nginx configuration.

```bash id="srv023"
sudo nginx -t
```

6. Reload the application.

```bash id="srv024"
pm2 reload ecosystem.config.js
```

7. Reload Nginx.

```bash id="srv025"
sudo systemctl reload nginx
```

8. Verify the application.

```bash id="srv026"
curl https://example.com
```

9. Monitor logs.

```bash id="srv027"
pm2 logs
```

The deployment completes successfully with no downtime.

**Lesson:** Following a standardized checklist minimizes human error and increases deployment reliability.

---

# Best Practices

- Always follow written deployment procedures.
- Test backups by restoring them periodically.
- Validate configurations before restarting services.
- Automate repetitive operational tasks where possible.
- Keep production and development environments separate.
- Review logs immediately after deployments.
- Document every production change.
- Conduct regular security audits.

---

# Common Mistakes

### Deploying Without a Backup

Always create and verify backups before making changes that affect production systems.

---

### Restarting Services Without Validation

Configuration syntax should be tested before restarting or reloading services.

---

### Ignoring Monitoring Alerts

Investigate alerts promptly to prevent minor issues from becoming outages.

---

### Making Manual Changes Without Documentation

Undocumented changes complicate troubleshooting and future maintenance.

---

### Skipping Rollback Planning

Every deployment should include a tested rollback strategy in case unexpected issues occur.

---

# Summary

Reliable production environments are built on repeatable processes rather than memory. Standardized checklists help ensure consistent deployments, stronger security, verified backups, effective monitoring, and faster incident response. By following these procedures, administrators can reduce operational risk and improve overall system reliability.

---
