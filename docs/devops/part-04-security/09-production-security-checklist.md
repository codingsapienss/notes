---
sidebar_label: Production Security Checklist
sidebar_position: 9
---


# Production Security Checklist

### Overview

Throughout this part, you learned how to secure a Linux server using multiple layers of protection.

However, security is not achieved by completing a single task. Before putting any server into production, administrators should verify that every important security control has been configured correctly.

This chapter serves as a **production-ready security checklist** that can be used before deploying any Linux server.

Think of it as the final inspection before opening your server to the Internet.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Perform a basic security audit.
- Verify essential security settings.
- Identify common misconfigurations.
- Prepare a Linux server for production deployment.
- Develop a repeatable server hardening workflow.

---

## Production Security Workflow

A typical deployment should follow this sequence.

```text
Create Server
      │
      ▼
Update Operating System
      │
      ▼
Secure SSH
      │
      ▼
Configure Firewall
      │
      ▼
Install Application
      │
      ▼
Configure Secrets
      │
      ▼
Enable Backups
      │
      ▼
Deploy to Production
      │
      ▼
Continuous Monitoring
```

Skipping any step increases operational and security risks.

---

## 1. Operating System

### Checklist

| Check                             | Status |
| --------------------------------- | ------ |
| Latest security updates installed | □      |
| Unnecessary packages removed      | □      |
| Unused services disabled          | □      |
| Hostname configured correctly     | □      |
| Time synchronization enabled      | □      |

Useful commands:

```bash
sudo apt update
sudo apt upgrade
hostnamectl
timedatectl
systemctl list-unit-files --state=enabled
```

---

## 2. User Accounts

### Checklist

| Check                                                  | Status |
| ------------------------------------------------------ | ------ |
| No daily work performed as root                        | □      |
| Dedicated administrator accounts created               | □      |
| `sudo` configured correctly                            | □      |
| Unused user accounts removed                           | □      |
| Strong passwords configured (if password login exists) | □      |

Useful commands:

```bash
whoami
id
getent passwd
groups
sudo -l
```

---

## 3. SSH Security

### Checklist

| Check                                                   | Status |
| ------------------------------------------------------- | ------ |
| SSH keys configured                                     | □      |
| Root login disabled                                     | □      |
| Password authentication disabled (if SSH keys are used) | □      |
| SSH service running correctly                           | □      |
| SSH logs reviewed                                       | □      |

Useful commands:

```bash
sudo systemctl status ssh
journalctl -u ssh
cat /etc/ssh/sshd_config
```

---

## 4. Firewall

### Checklist

| Check                                    | Status |
| ---------------------------------------- | ------ |
| UFW enabled                              | □      |
| Default incoming policy is DENY          | □      |
| Only required ports opened               | □      |
| Backend services not publicly accessible | □      |

Useful commands:

```bash
sudo ufw status verbose
ss -tulpn
```

Example:

```text
22   SSH
80   HTTP
443  HTTPS

Everything Else
↓

Blocked
```

---

## 5. Fail2Ban

### Checklist

| Check                 | Status |
| --------------------- | ------ |
| Fail2Ban installed    | □      |
| SSH jail enabled      | □      |
| Ban policy configured | □      |
| Service running       | □      |

Useful commands:

```bash
sudo systemctl status fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## 6. File Permissions

### Checklist

| Check                                   | Status |
| --------------------------------------- | ------ |
| `.env` permissions restricted           | □      |
| SSH private keys secured                | □      |
| SSL private keys protected              | □      |
| Application files owned by correct user | □      |
| World-writable files reviewed           | □      |

Useful commands:

```bash
ls -la
stat .env
find / -perm -002
```

Recommended permissions:

| File            | Permission |
| --------------- | ---------- |
| `.env`          | 600        |
| Private SSH Key | 600        |
| `.ssh`          | 700        |
| SSL Private Key | 600        |

---

## 7. Secrets

### Checklist

| Check                                         | Status |
| --------------------------------------------- | ------ |
| No secrets hardcoded                          | □      |
| `.env` excluded from Git                      | □      |
| Production secrets separated from development | □      |
| Old credentials removed                       | □      |

Verify:

```text
✓ Database Password

✓ JWT Secret

✓ API Keys

✓ SMTP Password

Stored Securely
```

---

## 8. Backups

### Checklist

| Check                         | Status |
| ----------------------------- | ------ |
| Database backups enabled      | □      |
| Application backups scheduled | □      |
| Restore procedure tested      | □      |
| Offsite backup available      | □      |

Verify:

```text
Production Data
      │
      ▼
Backup Created
      │
      ▼
Restore Tested
```

Remember:

> **A backup is only useful if it can be successfully restored.**

---

## 9. Application Security

Before exposing the application publicly:

| Check                       | Status |
| --------------------------- | ------ |
| Reverse proxy configured    | □      |
| HTTPS enabled               | □      |
| Security headers configured | □      |
| Debug mode disabled         | □      |
| Application logs enabled    | □      |

Example architecture:

```text
Internet
     │
Cloudflare
     │
Nginx
     │
Node.js
     │
MongoDB Atlas
```

---

## 10. Monitoring

A production server should always be monitored.

Checklist:

| Check                    | Status |
| ------------------------ | ------ |
| Disk usage monitored     | □      |
| CPU usage monitored      | □      |
| Memory usage monitored   | □      |
| Service health monitored | □      |
| Log files reviewed       | □      |

Useful commands:

```bash
df -h
free -h
top
htop
journalctl
```

---

## 11. Final Security Audit

Before deployment, verify:

```text
Operating System

        ✓

SSH

        ✓

Firewall

        ✓

Fail2Ban

        ✓

Permissions

        ✓

Secrets

        ✓

Backups

        ✓

HTTPS

        ✓

Monitoring

        ✓
```

Only after every major area has been reviewed should the server be exposed to the Internet.

---

## Example: Production Deployment

Suppose you deploy a Node.js application on an Azure Virtual Machine.

Your deployment should resemble:

```text
                    Internet
                        │
                Cloudflare CDN
                        │
            Azure Network Security Group
                        │
                Ubuntu Linux Server
                        │
                  UFW Firewall
                        │
                   Fail2Ban
                        │
                    OpenSSH
                        │
                     Nginx
                        │
          Node.js (127.0.0.1:3000)
                        │
                 MongoDB Atlas
```

Deployment checklist:

- Ubuntu fully updated
- SSH secured with key authentication
- Root login disabled
- UFW allowing only ports 22, 80, and 443
- Fail2Ban protecting SSH
- `.env` secured with appropriate permissions
- Application running as a dedicated non-root user
- HTTPS configured
- Automated backups enabled
- Monitoring and logs verified

This layered approach significantly reduces the server's attack surface while improving resilience and recoverability.

---

## Best Practices

- Treat security as an ongoing process rather than a one-time setup.
- Follow the Principle of Least Privilege.
- Keep software updated.
- Use layered security controls.
- Review logs regularly.
- Test backups periodically.
- Perform routine security audits.
- Document server configurations and changes.

---

## Common Mistakes

#### Assuming Deployment Means Security

A working application is not necessarily a secure application.

---

#### Ignoring Routine Maintenance

Security updates, log reviews, and backup verification should continue throughout the server's lifecycle.

---

#### Depending on a Single Security Layer

No individual control—such as a firewall or SSH keys—provides complete protection. Security depends on multiple independent layers working together.

---

#### Never Reviewing Configurations

As applications evolve, firewall rules, users, secrets, and permissions should be reviewed to ensure they remain appropriate.

---

## Summary

Securing a Linux server requires more than installing individual tools. A production-ready system combines updated software, secure SSH configuration, firewall rules, intrusion prevention, proper file permissions, protected secrets, reliable backups, HTTPS, and continuous monitoring. By following a structured deployment checklist, administrators can reduce security risks, improve operational stability, and create a repeatable process for deploying production Linux servers.

This concludes **Part 4 – Server Security**.

---

### Next Chapter

➡️ **Part 5 – Development Environment** (`README.md`)
