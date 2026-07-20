---
sidebar_label: Linux Command Reference
sidebar_position: 1
---


# Linux Command Reference

### Overview

Throughout this handbook, you have learned numerous Linux commands used in server administration. This chapter serves as a quick-reference guide that consolidates the most frequently used commands into one place.

Unlike previous chapters, this chapter is designed as a reference manual rather than a tutorial. You can revisit it whenever you need to remember a command or its purpose.

---

## Learning Objectives

After completing this chapter, you will be able to:

* Quickly locate common Linux commands.
* Understand the purpose of frequently used utilities.
* Find commands for system administration tasks.
* Perform file, process, user, networking, and storage operations efficiently.
* Use this chapter as a daily command reference.

---

## Linux Command Categories

```text
Linux Commands

├── File Management
├── Directory Management
├── File Permissions
├── Users & Groups
├── Process Management
├── Package Management
├── Networking
├── Storage
├── Monitoring
├── Security
├── Compression
├── Search
└── System Information
```

---

## Getting Help

| Command           | Purpose                   |
| ----------------- | ------------------------- |
| `man command`     | View manual page          |
| `command --help`  | Display help information  |
| `info command`    | GNU documentation         |
| `whatis command`  | Short command description |
| `apropos keyword` | Search manual pages       |

Examples:

```bash
man ls
```

```bash
ls --help
```

```bash
apropos network
```

---

## Navigation Commands

| Command        | Purpose                |
| -------------- | ---------------------- |
| `pwd`          | Show current directory |
| `ls`           | List files             |
| `ls -l`        | Long listing           |
| `ls -la`       | Show hidden files      |
| `cd directory` | Change directory       |
| `cd ..`        | Parent directory       |
| `cd ~`         | Home directory         |
| `tree`         | Display directory tree |

Examples:

```bash
pwd
```

```bash
ls -la
```

```bash
cd /var/www
```

---

## File Management Commands

| Command          | Purpose                      |
| ---------------- | ---------------------------- |
| `touch file`     | Create empty file            |
| `cat file`       | Display file                 |
| `less file`      | View large file              |
| `head file`      | First 10 lines               |
| `tail file`      | Last 10 lines                |
| `tail -f file`   | Monitor file updates         |
| `cp source dest` | Copy files                   |
| `mv source dest` | Move or rename               |
| `rm file`        | Delete file                  |
| `rm -rf dir`     | Delete directory recursively |

Examples:

```bash
touch app.js
```

```bash
cp app.js backup.js
```

```bash
tail -f /var/log/syslog
```

---

## Directory Management

| Command          | Purpose                   |
| ---------------- | ------------------------- |
| `mkdir dir`      | Create directory          |
| `mkdir -p path`  | Create nested directories |
| `rmdir dir`      | Remove empty directory    |
| `find . -type d` | Find directories          |

Examples:

```bash
mkdir project
```

```bash
mkdir -p apps/backend/api
```

---

## File Permissions

| Command | Purpose             |
| ------- | ------------------- |
| `chmod` | Change permissions  |
| `chown` | Change owner        |
| `chgrp` | Change group        |
| `umask` | Default permissions |

Examples:

```bash
chmod 755 script.sh
```

```bash
chmod +x deploy.sh
```

```bash
chown ubuntu:ubuntu app.js
```

---

## User Management

| Command   | Purpose          |
| --------- | ---------------- |
| `whoami`  | Current user     |
| `id`      | User information |
| `adduser` | Create user      |
| `passwd`  | Change password  |
| `su`      | Switch user      |
| `sudo`    | Execute as root  |
| `groups`  | View groups      |

Examples:

```bash
whoami
```

```bash
sudo adduser developer
```

---

## Process Management

| Command       | Purpose              |
| ------------- | -------------------- |
| `ps`          | Running processes    |
| `ps aux`      | Detailed processes   |
| `top`         | Live process monitor |
| `htop`        | Interactive monitor  |
| `kill PID`    | Terminate process    |
| `kill -9 PID` | Force terminate      |
| `pkill name`  | Kill by name         |
| `pgrep name`  | Find process         |

Examples:

```bash
ps aux
```

```bash
kill 1234
```

```bash
pkill node
```

---

## Service Management (systemd)

| Command             | Purpose              |
| ------------------- | -------------------- |
| `systemctl status`  | Service status       |
| `systemctl start`   | Start service        |
| `systemctl stop`    | Stop service         |
| `systemctl restart` | Restart service      |
| `systemctl reload`  | Reload configuration |
| `systemctl enable`  | Enable at boot       |
| `systemctl disable` | Disable at boot      |

Examples:

```bash
sudo systemctl status nginx
```

```bash
sudo systemctl restart nginx
```

---

## Package Management (APT)

| Command          | Purpose                |
| ---------------- | ---------------------- |
| `apt update`     | Update package list    |
| `apt upgrade`    | Upgrade packages       |
| `apt install`    | Install package        |
| `apt remove`     | Remove package         |
| `apt autoremove` | Remove unused packages |
| `apt search`     | Search packages        |

Examples:

```bash
sudo apt update
```

```bash
sudo apt install git
```

---

## Networking Commands

| Command      | Purpose            |
| ------------ | ------------------ |
| `ping`       | Test connectivity  |
| `curl`       | HTTP requests      |
| `wget`       | Download files     |
| `ip addr`    | View IP addresses  |
| `ip route`   | Routing table      |
| `ss -tulpn`  | Listening ports    |
| `traceroute` | Trace network path |
| `dig`        | DNS lookup         |
| `nslookup`   | DNS query          |

Examples:

```bash
ping google.com
```

```bash
curl https://example.com
```

```bash
ss -tulpn
```

---

## Disk & Storage Commands

| Command    | Purpose               |
| ---------- | --------------------- |
| `df -h`    | Disk usage            |
| `du -sh`   | Directory size        |
| `lsblk`    | Block devices         |
| `mount`    | Mounted filesystems   |
| `umount`   | Unmount filesystem    |
| `fdisk -l` | Partition information |

Examples:

```bash
df -h
```

```bash
du -sh /var/log
```

---

## Memory & CPU Monitoring

| Command   | Purpose                   |
| --------- | ------------------------- |
| `free -h` | Memory usage              |
| `top`     | CPU usage                 |
| `htop`    | Interactive monitoring    |
| `uptime`  | System uptime             |
| `vmstat`  | Virtual memory statistics |
| `iostat`  | Disk I/O statistics       |

Examples:

```bash
free -h
```

```bash
uptime
```

---

## Log Management

| Command          | Purpose             |
| ---------------- | ------------------- |
| `journalctl`     | System logs         |
| `journalctl -xe` | Recent errors       |
| `tail -f`        | Live log monitoring |
| `cat`            | View logs           |
| `grep`           | Search logs         |

Examples:

```bash
sudo journalctl -xe
```

```bash
tail -f /var/log/nginx/error.log
```

---

## Search Commands

| Command   | Purpose          |
| --------- | ---------------- |
| `find`    | Search files     |
| `locate`  | Fast file search |
| `grep`    | Search text      |
| `which`   | Command location |
| `whereis` | Binary locations |

Examples:

```bash
find . -name "*.js"
```

```bash
grep "ERROR" app.log
```

---

## Compression Commands

| Command    | Purpose            |
| ---------- | ------------------ |
| `zip`      | Create ZIP archive |
| `unzip`    | Extract ZIP        |
| `tar -czf` | Create tar.gz      |
| `tar -xzf` | Extract tar.gz     |
| `gzip`     | Compress file      |
| `gunzip`   | Decompress file    |

Examples:

```bash
tar -czf backup.tar.gz project/
```

```bash
tar -xzf backup.tar.gz
```

---

## SSH Commands

| Command         | Purpose           |
| --------------- | ----------------- |
| `ssh user@host` | Connect via SSH   |
| `scp`           | Secure copy       |
| `ssh-keygen`    | Generate SSH keys |
| `ssh-copy-id`   | Copy public key   |

Examples:

```bash
ssh ubuntu@192.168.1.10
```

```bash
scp file.txt ubuntu@server:/home/ubuntu/
```

---

## Environment Variables

| Command    | Purpose                       |
| ---------- | ----------------------------- |
| `env`      | Display environment variables |
| `printenv` | Print variables               |
| `export`   | Set variable                  |
| `unset`    | Remove variable               |

Examples:

```bash
export NODE_ENV=production
```

```bash
printenv
```

---

## File Permission Reference

| Permission | Numeric | Meaning        |
| ---------- | ------- | -------------- |
| `r`        | 4       | Read           |
| `w`        | 2       | Write          |
| `x`        | 1       | Execute        |
| `rwx`      | 7       | Full access    |
| `r-x`      | 5       | Read & Execute |
| `rw-`      | 6       | Read & Write   |
| `r--`      | 4       | Read only      |

Common combinations:

| Mode  | Meaning                           |
| ----- | --------------------------------- |
| `755` | Executable applications           |
| `644` | Regular files                     |
| `700` | Private directories               |
| `777` | Full access (avoid in production) |

---

## Useful Keyboard Shortcuts

| Shortcut   | Purpose                |
| ---------- | ---------------------- |
| `Ctrl + C` | Stop process           |
| `Ctrl + Z` | Suspend process        |
| `Ctrl + D` | Logout                 |
| `Ctrl + L` | Clear screen           |
| `Ctrl + R` | Search command history |
| `↑ / ↓`    | Previous/Next command  |
| `Tab`      | Auto-completion        |

---

## Daily Linux Administration Commands

```text
System Health

├── uptime
├── free -h
├── df -h
├── top
├── ss -tulpn

Logs

├── journalctl -xe
├── tail -f
├── grep

Services

├── systemctl status
├── systemctl restart

Network

├── ping
├── curl
├── ip addr

Files

├── ls -la
├── find
├── grep
```

---

## Real-World Example

A website becomes inaccessible after deployment.

A Linux administrator performs the following checks:

```bash
uptime
```

Confirms the server is running.

```bash
df -h
```

Verifies disk space is available.

```bash
free -h
```

Checks memory usage.

```bash
systemctl status nginx
```

Confirms Nginx is active.

```bash
pm2 list
```

Verifies the Node.js application is running.

```bash
curl http://localhost:3000
```

Tests the backend application directly.

By following these commands in sequence, the administrator quickly narrows the problem to the application layer instead of the operating system.

---

## Best Practices

* Use `man` pages to understand unfamiliar commands.
* Prefer `sudo` over logging in directly as the root user.
* Validate commands before running destructive operations.
* Use absolute paths in production scripts.
* Monitor system resources regularly.
* Review logs before restarting services.
* Practice commands in a test environment before using them in production.

---

## Common Mistakes

#### Running Destructive Commands as Root

Commands such as `rm -rf` can permanently remove critical files if executed incorrectly.

---

#### Forgetting Command Options

Using `ls` instead of `ls -la` or `tail` instead of `tail -f` may hide important information during troubleshooting.

---

#### Ignoring Manual Pages

Many commands provide extensive built-in documentation through `man` and `--help`.

---

#### Using `chmod 777`

Granting full permissions to everyone creates significant security risks and should be avoided in production.

---

## Summary

This Linux Command Reference provides a consolidated guide to the commands used most frequently in Linux server administration. By organizing commands into functional categories—including navigation, file management, networking, monitoring, security, and system administration—it serves as a practical handbook for day-to-day operations, troubleshooting, and production maintenance.

---

### Next Chapter

➡️ **02 - Nginx Reference**
