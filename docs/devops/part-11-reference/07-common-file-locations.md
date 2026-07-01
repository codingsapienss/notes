---
sidebar_label: Common File Locations
sidebar_position: 7
---


# Common File Locations

## Overview

Linux organizes files using a standardized directory hierarchy known as the **Filesystem Hierarchy Standard (FHS)**. Understanding where configuration files, logs, binaries, libraries, applications, and user data are stored is essential for system administration, troubleshooting, deployment, and security.

This chapter serves as a quick-reference guide to the most important Linux file locations used in day-to-day server management.

---

# Learning Objectives

After completing this chapter, you will be able to:

- Understand the Linux filesystem hierarchy.
- Locate important configuration files.
- Find system logs.
- Manage application directories.
- Navigate user home directories.
- Locate service configuration files.
- Troubleshoot servers using filesystem knowledge.

---

# Linux Filesystem Overview

```text
/

├── bin
├── boot
├── dev
├── etc
├── home
├── lib
├── media
├── mnt
├── opt
├── proc
├── root
├── run
├── sbin
├── srv
├── sys
├── tmp
├── usr
└── var
```

Everything in Linux begins from the root directory (`/`).

---

# Filesystem Hierarchy

| Directory | Purpose                           |
| --------- | --------------------------------- |
| `/`       | Root filesystem                   |
| `/bin`    | Essential user commands           |
| `/sbin`   | System administration commands    |
| `/etc`    | Configuration files               |
| `/home`   | User home directories             |
| `/root`   | Root user's home directory        |
| `/usr`    | User programs and libraries       |
| `/var`    | Variable data (logs, cache, mail) |
| `/tmp`    | Temporary files                   |
| `/opt`    | Optional software                 |
| `/boot`   | Bootloader files                  |
| `/dev`    | Device files                      |
| `/proc`   | Process information               |
| `/sys`    | Kernel information                |
| `/run`    | Runtime information               |
| `/mnt`    | Temporary mount points            |
| `/media`  | Removable media                   |

---

# Root Directory

```text
/
```

The root directory is the highest level in the Linux filesystem.

Example:

```text
/

├── etc
├── home
├── var
└── usr
```

---

# Home Directories

Regular users:

```text
/home/
```

Example:

```text
/home/ubuntu

/home/john

/home/admin
```

Home directories typically contain:

- Documents
- Downloads
- SSH keys
- Project files
- User-specific configuration

---

# Root User Home

```text
/root
```

This directory belongs exclusively to the root user and should not be confused with the root filesystem (`/`).

---

# Configuration Directory

```text
/etc/
```

Most Linux configuration files are stored here.

Common examples:

| File               | Purpose                      |
| ------------------ | ---------------------------- |
| `/etc/hosts`       | Local hostname mapping       |
| `/etc/hostname`    | System hostname              |
| `/etc/resolv.conf` | DNS configuration            |
| `/etc/passwd`      | User accounts                |
| `/etc/group`       | Groups                       |
| `/etc/fstab`       | Filesystem mounts            |
| `/etc/crontab`     | Scheduled tasks              |
| `/etc/environment` | System environment variables |

---

# Nginx Configuration

Directory:

```text
/etc/nginx/
```

Important files:

| File               | Purpose                   |
| ------------------ | ------------------------- |
| `nginx.conf`       | Main configuration        |
| `mime.types`       | MIME definitions          |
| `sites-available/` | Available virtual hosts   |
| `sites-enabled/`   | Enabled virtual hosts     |
| `conf.d/`          | Additional configurations |

Example:

```text
/etc/nginx

├── nginx.conf
├── mime.types
├── sites-available
└── sites-enabled
```

---

# Apache Configuration

Ubuntu:

```text
/etc/apache2/
```

Important files:

```text
apache2.conf

ports.conf

sites-available

sites-enabled
```

---

# SSH Configuration

Server configuration:

```text
/etc/ssh/sshd_config
```

Client configuration:

```text
~/.ssh/config
```

SSH keys:

```text
~/.ssh/
```

Common files:

```text
id_rsa

id_ed25519

authorized_keys

known_hosts
```

---

# Systemd Service Files

Installed services:

```text
/lib/systemd/system/
```

Custom services:

```text
/etc/systemd/system/
```

Example:

```text
node-api.service
```

---

# Log Directory

```text
/var/log/
```

Common logs:

| File                        | Purpose              |
| --------------------------- | -------------------- |
| `/var/log/syslog`           | System log           |
| `/var/log/auth.log`         | Authentication log   |
| `/var/log/kern.log`         | Kernel log           |
| `/var/log/dpkg.log`         | Package installation |
| `/var/log/nginx/access.log` | Nginx access log     |
| `/var/log/nginx/error.log`  | Nginx error log      |

---

# Application Logs

PM2 logs:

```text
~/.pm2/logs/
```

Example:

```text
api-out.log

api-error.log

pm2.log
```

Application-specific logs are often stored under:

```text
/var/log/<application>/
```

---

# Web Server Files

Default website:

```text
/var/www/html/
```

Production example:

```text
/var/www/

├── api
├── admin
├── frontend
└── uploads
```

---

# User Applications

Optional software:

```text
/opt/
```

Example:

```text
/opt/nodejs

/opt/custom-app
```

---

# Executable Files

Essential commands:

```text
/bin
```

Administrative commands:

```text
/sbin
```

User applications:

```text
/usr/bin
```

Administrative binaries:

```text
/usr/sbin
```

Locate an executable.

```bash
which nginx
```

Example output:

```text
/usr/sbin/nginx
```

---

# Shared Libraries

Common library directories:

```text
/lib

/lib64

/usr/lib
```

Libraries provide shared functionality for applications.

---

# Temporary Files

System temporary directory:

```text
/tmp
```

Characteristics:

- Writable by all users (with sticky bit protection).
- Frequently cleared during reboot.
- Suitable for temporary data only.

---

# Runtime Files

```text
/run
```

Stores runtime information such as:

- Process IDs
- Sockets
- Lock files
- Runtime state

Example:

```text
/run/nginx.pid
```

---

# Process Information

```text
/proc
```

Useful files:

| File            | Purpose            |
| --------------- | ------------------ |
| `/proc/cpuinfo` | CPU information    |
| `/proc/meminfo` | Memory information |
| `/proc/uptime`  | System uptime      |
| `/proc/version` | Kernel version     |

Examples:

```bash
cat /proc/cpuinfo
```

```bash
cat /proc/meminfo
```

---

# Device Files

```text
/dev
```

Examples:

```text
/dev/null

/dev/sda

/dev/random

/dev/tty
```

These files represent hardware and virtual devices.

---

# Mounted Filesystems

Temporary mounts:

```text
/mnt
```

Removable devices:

```text
/media
```

Example:

```text
/media/usb
```

---

# Boot Files

```text
/boot
```

Contains:

- Linux kernel
- Initial RAM filesystem
- Bootloader configuration

Example:

```text
vmlinuz

initrd.img

grub/
```

---

# Package Management Files

APT cache:

```text
/var/cache/apt/
```

APT configuration:

```text
/etc/apt/
```

Installed package logs:

```text
/var/log/dpkg.log
```

---

# Cron Configuration

System-wide:

```text
/etc/crontab
```

Cron jobs:

```text
/etc/cron.daily/

/etc/cron.weekly/

/etc/cron.monthly/
```

User cron jobs:

```bash
crontab -e
```

---

# Environment Variables

System-wide:

```text
/etc/environment
```

Shell-specific:

```text
~/.bashrc

~/.profile

~/.zshrc
```

---

# SSL Certificates

Common certificate locations:

```text
/etc/ssl/

/etc/letsencrypt/
```

Let's Encrypt example:

```text
/etc/letsencrypt/live/example.com/
```

Contains:

- fullchain.pem
- privkey.pem

---

# Node.js Applications

Common production layout:

```text
/var/www/api

├── app.js
├── package.json
├── node_modules
├── ecosystem.config.js
└── uploads
```

---

# Daily Navigation Commands

```text
Filesystem

├── pwd
├── ls
├── cd

Configuration

├── /etc
├── /etc/nginx
├── /etc/systemd

Logs

├── /var/log
├── ~/.pm2/logs

Applications

├── /var/www
├── /opt

Users

├── /home
├── /root
```

---

# Useful File Commands

| Command    | Purpose                |
| ---------- | ---------------------- |
| `pwd`      | Current directory      |
| `ls`       | List files             |
| `cd`       | Change directory       |
| `tree`     | Display directory tree |
| `find`     | Search files           |
| `locate`   | Fast file lookup       |
| `which`    | Locate executable      |
| `realpath` | Show absolute path     |
| `stat`     | File information       |

---

# Real-World Example

A Node.js application fails to start after deployment.

The administrator investigates.

Check the application directory.

```bash
cd /var/www/api

ls
```

The `ecosystem.config.js` file is present.

Inspect the logs.

```bash
tail -f ~/.pm2/logs/api-error.log
```

The log indicates that the `.env` file is missing.

Verify the configuration.

```bash
ls -la
```

The environment file was not copied during deployment.

Create or restore the `.env` file, then restart the application.

```bash
pm2 restart api
```

The application starts successfully.

**Lesson:** Understanding standard file locations significantly reduces troubleshooting time.

---

# Best Practices

- Keep applications under `/var/www` or `/opt`.
- Store custom systemd services in `/etc/systemd/system`.
- Keep logs in `/var/log`.
- Never modify files under `/proc` or `/sys` unless necessary.
- Secure sensitive configuration files with appropriate permissions.
- Organize SSL certificates in standard directories.
- Document custom application locations.

---

# Common Mistakes

### Confusing `/` and `/root`

The root filesystem (`/`) and the root user's home directory (`/root`) are different.

---

### Storing Important Files in `/tmp`

Files in `/tmp` may be removed automatically during reboot or cleanup.

---

### Editing Installed systemd Files

Avoid modifying files under `/lib/systemd/system/`. Place custom service definitions or overrides in `/etc/systemd/system/`.

---

### Mixing Configuration and Application Files

Keep configuration in standard locations such as `/etc` and application code under directories like `/var/www` or `/opt`.

---

### Ignoring Log Locations

Many production issues can be diagnosed quickly by checking the appropriate log directory.

---

# Summary

The Linux filesystem hierarchy provides a predictable structure for configuration, applications, logs, binaries, libraries, runtime data, and user files. Familiarity with these standard locations enables administrators to deploy, maintain, secure, and troubleshoot systems more efficiently.

---

## Next Chapter

➡️ **08 - Port Reference**
