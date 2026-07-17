---
sidebar_label: Linux Cheat Sheet
sidebar_position: 9
---


# Linux Cheat Sheet

## Overview

This chapter provides a **quick-reference cheat sheet** for the commands used most frequently by Linux administrators, backend developers, DevOps engineers, and cloud engineers.

Unlike previous chapters that explain concepts in detail, this chapter is designed for **rapid lookup** during day-to-day work.

---

# Learning Objectives

After completing this chapter, you will be able to:

- Quickly locate commonly used Linux commands.
- Navigate the filesystem efficiently.
- Manage files and permissions.
- Monitor processes and services.
- Troubleshoot networking issues.
- Manage Node.js deployments.
- Perform Git operations rapidly.

---

# Linux Administration Workflow

```text id="1vy7hk"
Login

↓

Navigate

↓

Inspect

↓

Modify

↓

Deploy

↓

Monitor

↓

Troubleshoot
```

---

# Directory Navigation

| Command        | Purpose                |
| -------------- | ---------------------- |
| `pwd`          | Show current directory |
| `ls`           | List files             |
| `ls -la`       | Detailed listing       |
| `cd directory` | Change directory       |
| `cd ..`        | Move up one level      |
| `cd ~`         | Home directory         |
| `cd /`         | Root directory         |
| `tree`         | Display directory tree |

Examples:

```bash id="d4q5k8"
pwd

ls -la

cd /var/www
```

---

# File Management

| Command               | Purpose                   |
| --------------------- | ------------------------- |
| `touch file.txt`      | Create file               |
| `mkdir folder`        | Create directory          |
| `mkdir -p path`       | Create nested directories |
| `cp file backup`      | Copy file                 |
| `cp -r dir newdir`    | Copy directory            |
| `mv old new`          | Move or rename            |
| `rm file`             | Delete file               |
| `rm -rf folder`       | Delete directory          |
| `find . -name "*.js"` | Search files              |
| `locate nginx.conf`   | Locate file               |

---

# File Viewing

| Command          | Purpose        |
| ---------------- | -------------- |
| `cat file`       | Display file   |
| `less file`      | View file      |
| `head file`      | First 10 lines |
| `tail file`      | Last 10 lines  |
| `tail -f log`    | Follow log     |
| `wc -l file`     | Count lines    |
| `grep text file` | Search text    |

Examples:

```bash id="jlwm01"
tail -f /var/log/nginx/error.log
```

```bash id="jlwm02"
grep ERROR app.log
```

---

# Permissions

| Command                | Purpose             |
| ---------------------- | ------------------- |
| `chmod 755 file`       | Change permissions  |
| `chmod +x script.sh`   | Make executable     |
| `chown user:user file` | Change ownership    |
| `umask`                | Default permissions |

View permissions:

```bash id="jlwm03"
ls -l
```

Permission example:

```text id="jlwm04"
-rwxr-xr-x
```

---

# User Management

| Command        | Purpose         |
| -------------- | --------------- |
| `whoami`       | Current user    |
| `id`           | User details    |
| `sudo command` | Run as root     |
| `passwd`       | Change password |
| `groups`       | View groups     |
| `adduser user` | Create user     |
| `deluser user` | Delete user     |

---

# Process Management

| Command       | Purpose             |
| ------------- | ------------------- |
| `ps aux`      | List processes      |
| `top`         | Live processes      |
| `htop`        | Interactive monitor |
| `kill PID`    | Stop process        |
| `kill -9 PID` | Force stop          |
| `pgrep node`  | Find process        |
| `pkill node`  | Kill by name        |

---

# Disk Usage

| Command         | Purpose         |
| --------------- | --------------- |
| `df -h`         | Disk usage      |
| `du -sh folder` | Folder size     |
| `free -h`       | Memory usage    |
| `lsblk`         | Storage devices |
| `mount`         | Mounted disks   |

---

# Networking

| Command               | Purpose         |
| --------------------- | --------------- |
| `ip addr`             | IP addresses    |
| `ip route`            | Routing table   |
| `ping google.com`     | Connectivity    |
| `curl URL`            | HTTP request    |
| `wget URL`            | Download file   |
| `dig domain.com`      | DNS lookup      |
| `nslookup domain.com` | DNS lookup      |
| `traceroute host`     | Route analysis  |
| `ss -tulpn`           | Listening ports |

---

# SSH

| Command                    | Purpose         |
| -------------------------- | --------------- |
| `ssh user@host`            | Remote login    |
| `scp file user@host:/path` | Copy file       |
| `ssh-keygen`               | Generate key    |
| `ssh-copy-id user@host`    | Install SSH key |

SSH keys:

```text id="jlwm05"
~/.ssh/
```

---

# Package Management (APT)

| Command           | Purpose                |
| ----------------- | ---------------------- |
| `apt update`      | Update package index   |
| `apt upgrade`     | Upgrade packages       |
| `apt install pkg` | Install package        |
| `apt remove pkg`  | Remove package         |
| `apt autoremove`  | Remove unused packages |
| `apt search pkg`  | Search packages        |

---

# systemctl

| Command                   | Purpose         |
| ------------------------- | --------------- |
| `systemctl status nginx`  | Status          |
| `systemctl start nginx`   | Start           |
| `systemctl stop nginx`    | Stop            |
| `systemctl restart nginx` | Restart         |
| `systemctl reload nginx`  | Reload          |
| `systemctl enable nginx`  | Start at boot   |
| `systemctl disable nginx` | Disable at boot |

---

# journalctl

| Command               | Purpose           |
| --------------------- | ----------------- |
| `journalctl`          | View logs         |
| `journalctl -u nginx` | Service logs      |
| `journalctl -f`       | Follow logs       |
| `journalctl -xe`      | Recent errors     |
| `journalctl -b`       | Current boot logs |

---

# Nginx

| Command                   | Purpose            |
| ------------------------- | ------------------ |
| `nginx -v`                | Version            |
| `nginx -t`                | Test configuration |
| `nginx -T`                | Show configuration |
| `systemctl reload nginx`  | Reload             |
| `systemctl restart nginx` | Restart            |

Logs:

```text id="jlwm06"
/var/log/nginx/access.log

/var/log/nginx/error.log
```

---

# PM2

| Command            | Purpose           |
| ------------------ | ----------------- |
| `pm2 list`         | Running apps      |
| `pm2 start app.js` | Start             |
| `pm2 stop app`     | Stop              |
| `pm2 restart app`  | Restart           |
| `pm2 reload app`   | Reload            |
| `pm2 logs`         | Logs              |
| `pm2 monit`        | Monitoring        |
| `pm2 save`         | Save process list |
| `pm2 startup`      | Enable startup    |

---

# Git

| Command               | Purpose  |
| --------------------- | -------- |
| `git status`          | Status   |
| `git add .`           | Stage    |
| `git commit -m`       | Commit   |
| `git push`            | Upload   |
| `git pull`            | Download |
| `git fetch`           | Fetch    |
| `git branch`          | Branches |
| `git checkout branch` | Switch   |
| `git merge`           | Merge    |
| `git log --oneline`   | History  |

---

# Docker (Basic)

| Command                   | Purpose            |
| ------------------------- | ------------------ |
| `docker ps`               | Running containers |
| `docker images`           | Images             |
| `docker logs id`          | Logs               |
| `docker exec -it id bash` | Shell              |
| `docker stop id`          | Stop               |
| `docker rm id`            | Remove             |
| `docker system prune`     | Cleanup            |

---

# File Compression

| Command                         | Purpose         |
| ------------------------------- | --------------- |
| `zip archive.zip file`          | Compress        |
| `unzip archive.zip`             | Extract         |
| `tar -czf backup.tar.gz folder` | Create archive  |
| `tar -xzf backup.tar.gz`        | Extract archive |
| `gzip file`                     | Compress        |
| `gunzip file.gz`                | Decompress      |

---

# Firewall (UFW)

| Command         | Purpose      |
| --------------- | ------------ |
| `ufw status`    | View rules   |
| `ufw allow 22`  | Allow SSH    |
| `ufw allow 80`  | Allow HTTP   |
| `ufw allow 443` | Allow HTTPS  |
| `ufw deny 3000` | Block port   |
| `ufw reload`    | Reload rules |

---

# Environment Variables

Current shell:

```bash id="jlwm07"
echo $PATH
```

List variables:

```bash id="jlwm08"
printenv
```

Persistent variables:

```text id="jlwm09"
~/.bashrc

/etc/environment
```

---

# Monitoring

| Command   | Purpose             |
| --------- | ------------------- |
| `top`     | CPU usage           |
| `htop`    | Interactive monitor |
| `free -h` | Memory              |
| `df -h`   | Disk                |
| `du -sh`  | Folder size         |
| `uptime`  | System uptime       |
| `vmstat`  | Virtual memory      |
| `iostat`  | Disk I/O            |

---

# Logs

| Log            | Location                    |
| -------------- | --------------------------- |
| Nginx Access   | `/var/log/nginx/access.log` |
| Nginx Error    | `/var/log/nginx/error.log`  |
| System         | `/var/log/syslog`           |
| Authentication | `/var/log/auth.log`         |
| PM2            | `~/.pm2/logs/`              |

Follow logs:

```bash id="jlwm10"
tail -f /var/log/syslog
```

---

# Useful Shortcuts

| Shortcut   | Action                  |
| ---------- | ----------------------- |
| `Ctrl + C` | Stop process            |
| `Ctrl + Z` | Suspend process         |
| `Ctrl + D` | Exit shell              |
| `Ctrl + L` | Clear terminal          |
| `Ctrl + R` | Search command history  |
| `!!`       | Repeat previous command |
| `history`  | View history            |

---

# Common File Locations

| Location              | Purpose             |
| --------------------- | ------------------- |
| `/etc`                | Configuration       |
| `/var/log`            | Logs                |
| `/var/www`            | Web applications    |
| `/home`               | User directories    |
| `/root`               | Root home           |
| `/tmp`                | Temporary files     |
| `/opt`                | Optional software   |
| `/etc/nginx`          | Nginx configuration |
| `/etc/systemd/system` | Custom services     |
| `~/.pm2/logs`         | PM2 logs            |

---

# Daily Production Workflow

```text id="jlwm11"
SSH

↓

git pull

↓

npm install

↓

Build

↓

pm2 reload

↓

Check Logs

↓

Verify Website
```

---

# Troubleshooting Workflow

```text id="jlwm12"
Website Down

↓

Ping

↓

SSH

↓

systemctl

↓

PM2

↓

Logs

↓

Nginx

↓

Application

↓

Resolved
```

---

# Daily Command Checklist

```text id="jlwm13"
Navigation

├── pwd
├── ls
├── cd

Monitoring

├── top
├── free -h
├── df -h

Networking

├── ping
├── curl
├── ss

Deployment

├── git pull
├── npm install
├── pm2 reload

Services

├── systemctl status
├── journalctl

Logs

├── tail -f
```

---

# Real-World Example

A deployment has completed, but users report that the website is unavailable.

Quick verification steps:

```bash id="jlwm14"
systemctl status nginx
```

```bash id="’wini15"
pm2 list
```

```bash id="’wini16"
ss -tulpn
```

```bash id="’wini17"
tail -f /var/log/nginx/error.log
```

```bash id="’wini18"
curl http://localhost:3000
```

Within a few minutes, these commands identify whether the issue lies with Nginx, the Node.js application, networking, or the operating system.

---

# Best Practices

- Learn frequently used commands instead of memorizing every available option.
- Prefer modern commands such as `ip` and `ss` over deprecated alternatives.
- Test configuration changes before restarting services.
- Monitor logs continuously during deployments.
- Use aliases for repetitive commands where appropriate.
- Keep a personal cheat sheet for project-specific commands.

---

# Common Mistakes

### Running Destructive Commands Without Verification

Commands such as `rm -rf` and `git reset --hard` should always be reviewed before execution.

---

### Ignoring Exit Status

Always verify whether a command completed successfully before moving to the next step.

---

### Restarting Services Before Reading Logs

Inspect logs first to identify the root cause instead of restarting services immediately.

---

### Forgetting to Check Resource Usage

High CPU, memory, or disk utilization can cause application failures that appear unrelated.

---

### Memorizing Commands Without Understanding Them

Understanding the purpose of each command is more valuable than remembering syntax alone.

---

# Summary

This Linux Cheat Sheet consolidates the commands most frequently used in Linux administration, networking, deployments, monitoring, and troubleshooting. It is intended as a rapid-reference guide for everyday production work, allowing administrators and developers to quickly locate essential commands without consulting extensive documentation.

---

## Next Chapter

➡️ **10 - Production Checklists**
