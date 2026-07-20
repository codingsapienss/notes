---
sidebar_label: Security Updates
sidebar_position: 6
---


# Security Updates

### Overview

One of the simplest yet most effective ways to secure a Linux server is to **keep it updated**.

Every year, security researchers discover thousands of vulnerabilities in operating systems, libraries, web servers, databases, and applications. Once these vulnerabilities become public, attackers quickly begin scanning the Internet for servers that have not yet been patched.

Keeping a server updated closes known security vulnerabilities before they can be exploited.

Many real-world security incidents occur **not because a vulnerability was unknown**, but because administrators delayed installing updates that were already available.

This chapter explains how Linux security updates work, how to install them safely, and how to manage updates in production environments.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand why security updates are important.
- Learn the different types of Linux updates.
- Update packages using APT.
- Understand kernel updates.
- Learn safe update practices for production servers.
- Automate security updates where appropriate.

---

## Why Security Updates Matter

Every software package contains code.

Sometimes vulnerabilities are discovered in that code.

For example:

- OpenSSH
- OpenSSL
- Nginx
- Node.js
- Linux Kernel
- Python
- PHP

If attackers know about a vulnerability and your server remains unpatched, they may be able to exploit it.

```text
Security Researcher
        │
Finds Vulnerability
        │
Software Maintainer
        │
Releases Security Patch
        │
Administrator Updates Server
        │
Server Protected
```

Installing updates promptly significantly reduces risk.

---

## Types of Updates

Not every update has the same purpose.

| Update Type        | Purpose                        |
| ------------------ | ------------------------------ |
| Security Update    | Fixes security vulnerabilities |
| Bug Fix Update     | Resolves software defects      |
| Feature Update     | Adds new functionality         |
| Performance Update | Improves efficiency            |
| Kernel Update      | Updates the Linux kernel       |

Production environments generally prioritize **security updates**.

---

## Updating Package Information

Before installing updates, refresh the package index.

```bash
sudo apt update
```

This downloads the latest package information from the configured repositories.

It **does not** install any updates.

---

## Upgrading Installed Packages

Install available updates:

```bash
sudo apt upgrade
```

Upgrade everything, including packages with changed dependencies:

```bash
sudo apt full-upgrade
```

Remove unused packages:

```bash
sudo apt autoremove
```

Clean downloaded package files:

```bash
sudo apt clean
```

---

## Typical Update Workflow

A common update process is:

```text
Update Package Index
        │
sudo apt update
        │
        ▼
Review Available Updates
        │
        ▼
Install Updates
        │
sudo apt upgrade
        │
        ▼
Restart Services
        │
(if required)
        │
        ▼
Reboot Server
(if kernel updated)
```

---

## Checking Available Updates

View packages that can be upgraded:

```bash
apt list --upgradable
```

Example output:

```text
openssl
openssh-server
curl
systemd
```

Review updates before installing them on production servers.

---

## Kernel Updates

The Linux kernel controls:

- Memory management
- Process scheduling
- Device drivers
- Networking
- File systems

Kernel vulnerabilities can be particularly serious because they affect the operating system itself.

When the kernel is updated:

```text
Old Kernel
      │
Install Update
      │
Reboot
      │
New Kernel Running
```

Most kernel updates require a reboot before they become active.

---

## Checking the Running Kernel

Display the current kernel version:

```bash
uname -r
```

Example:

```text
6.8.0-1023-azure
```

This is useful when verifying whether a reboot is required after a kernel update.

---

## Automatic Security Updates

Ubuntu provides **Unattended Upgrades**, which can automatically install security patches.

Install it if needed:

```bash
sudo apt install unattended-upgrades
```

Enable automatic security updates:

```bash
sudo dpkg-reconfigure unattended-upgrades
```

Automatic updates are particularly useful for small servers and development environments.

Large production environments often use staged update processes instead.

---

## Updating a Production Server Safely

Avoid updating a production server blindly.

Recommended process:

```text
Test Environment
       │
Install Updates
       │
Run Application Tests
       │
Verify Services
       │
Deploy Same Updates
       │
Production Server
```

Testing first reduces the risk of unexpected downtime.

---

## Restarting Services

Some updates affect running services.

Example:

```bash
sudo systemctl restart nginx
```

```bash
sudo systemctl restart ssh
```

```bash
sudo systemctl restart node-app
```

Restart only the services that require it whenever possible.

---

## When Should You Reboot?

A reboot is commonly required after:

- Linux kernel updates
- System library updates
- Certain driver updates

Check whether a reboot is recommended:

```bash
[ -f /var/run/reboot-required ] && echo "Reboot Required"
```

Always schedule production reboots during maintenance windows whenever possible.

---

## Risks of Delaying Updates

Running outdated software can expose your server to:

- Publicly known vulnerabilities
- Remote code execution attacks
- Privilege escalation
- Information disclosure
- Denial-of-Service attacks

Attackers often automate scans for systems running vulnerable software versions.

---

## Production Example

Suppose your Node.js application is deployed on an Ubuntu Azure VM.

```text
Cloudflare
      │
Azure VM
      │
Ubuntu
      │
Nginx
      │
Node.js
```

A security advisory is released for OpenSSL.

Recommended workflow:

1. Read the advisory.
2. Verify package availability.
3. Update a staging server.
4. Test HTTPS functionality.
5. Update the production VM.
6. Restart affected services.
7. Verify application health.
8. Monitor logs after deployment.

This minimizes downtime while maintaining security.

---

## Best Practices

- Install security updates regularly.
- Keep package repositories up to date.
- Test updates in staging before production deployment.
- Reboot after kernel updates.
- Remove unused packages.
- Monitor vendor security advisories.
- Maintain recent backups before major upgrades.

---

## Common Mistakes

#### Ignoring Security Updates

Leaving known vulnerabilities unpatched increases the likelihood of compromise.

---

#### Updating Production Without Testing

Major updates may introduce compatibility issues.

Test critical updates before deploying them to production.

---

#### Forgetting to Reboot After Kernel Updates

Installing a new kernel is not enough.

The server must reboot to begin using the updated kernel.

---

#### Updating Without Backups

Always ensure recent backups are available before performing major system updates.

---

## Summary

Keeping a Linux server updated is one of the most effective ways to maintain its security. Regularly installing security patches protects the system against known vulnerabilities, while kernel updates strengthen the operating system itself. Production servers should follow a structured update process that includes testing, controlled deployment, service verification, and scheduled reboots when necessary. A disciplined update strategy greatly reduces the risk of successful attacks.

---

### Next Chapter

➡️ **07 - Secrets and Environment Variables**
