---
sidebar_label: Log Management
sidebar_position: 9
---


# Log Management

## Overview

Logs are one of the most valuable sources of information when troubleshooting a Linux system. Almost every application, service, and component of the operating system records events such as startup, shutdown, warnings, errors, authentication attempts, and system activities.

Whether you are diagnosing a failed deployment, investigating a server crash, or monitoring suspicious login attempts, logs are often the first place to look.

Modern Linux systems primarily use **systemd-journald** for collecting logs, while many distributions also use **rsyslog** for storing logs as text files.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what logs are.
- Learn why logs are important.
- Understand journald and rsyslog.
- View logs using `journalctl`.
- Explore common log file locations.
- Monitor logs in real time.
- Understand log rotation.
- Troubleshoot common server issues using logs.

---

# What Are Logs?

A **log** is a record of an event that occurred on the system.

Examples include:

- User login
- Service startup
- Service shutdown
- Application errors
- System warnings
- Security events
- Hardware failures

Example log entry:

```text id="o4h7kj"
Jul 19 12:34:52 server nginx[845]: Started worker process
```

Every log entry provides information about **what happened**, **when it happened**, and often **which process generated it**.

---

# Why Are Logs Important?

Logs help administrators answer questions such as:

- Why did the server restart?
- Why won't Nginx start?
- Why can't users log in?
- Why did a Node.js application crash?
- Why is disk space full?
- When did an error first occur?

Without logs, diagnosing production issues becomes significantly more difficult.

---

# Linux Logging Architecture

A simplified logging flow looks like this:

```text id="y8d2pl"
Applications
Services
Kernel
     │
     ▼
systemd-journald
     │
     ├──────────────► journalctl
     │
     ▼
rsyslog (optional)
     │
     ▼
/var/log
```

- **systemd-journald** collects logs from the kernel and services.
- **journalctl** is used to read journal entries.
- **rsyslog** can store logs as traditional text files under `/var/log`.

Many modern distributions use both together.

---

# The `/var/log` Directory

Most traditional log files are stored inside:

```text id="j9x4ts"
/var/log
```

List available logs:

```bash id="z7q3fd"
ls /var/log
```

Example:

```text id="f1m8vk"
alternatives.log
auth.log
boot.log
dpkg.log
kern.log
syslog
nginx/
apache2/
```

Different applications may create their own subdirectories.

---

# Common Log Files

| File                | Purpose                      |
| ------------------- | ---------------------------- |
| `/var/log/syslog`   | General system messages      |
| `/var/log/auth.log` | Authentication and SSH logs  |
| `/var/log/kern.log` | Kernel messages              |
| `/var/log/boot.log` | Boot-related messages        |
| `/var/log/dpkg.log` | Package installation history |
| `/var/log/nginx/`   | Nginx logs                   |
| `/var/log/apache2/` | Apache logs                  |

Some distributions use different filenames depending on the logging system.

---

# systemd-journald

Modern Linux distributions use **systemd-journald** to collect logs.

It records logs from:

- Kernel
- Services
- Applications
- Boot process
- Hardware events

Instead of reading plain text files directly, administrators commonly use:

```bash id="b4v2jx"
journalctl
```

---

# Viewing All Journal Logs

Display all collected logs:

```bash id="g8r9np"
journalctl
```

Since the output can be very large, it is often combined with filters.

---

# Viewing Recent Logs

Display the latest log entries:

```bash id="u3d6fw"
journalctl -n 50
```

Example:

```text id="m7k2ec"
Jul 19 11:22:01 sshd started
Jul 19 11:23:12 nginx started
Jul 19 11:24:45 docker started
```

---

# Following Logs in Real Time

Monitor logs as new events occur:

```bash id="h6y8tr"
journalctl -f
```

This behaves similarly to:

```bash id="r4m9cw"
tail -f
```

and is useful while debugging applications.

---

# Viewing Logs for a Specific Service

Example:

```bash id="q2x5pb"
journalctl -u nginx
```

Recent logs:

```bash id="v9n1zk"
journalctl -u nginx -n 100
```

Follow live logs:

```bash id="p5k8sd"
journalctl -u nginx -f
```

This is one of the most frequently used commands by Linux administrators.

---

# Viewing Boot Logs

Display logs from the current boot:

```bash id="l8c4fy"
journalctl -b
```

Previous boot:

```bash id="w3m7ej"
journalctl -b -1
```

Useful when investigating crashes after a reboot.

---

# Filtering by Time

View logs since a specific time:

```bash id="a1v9rq"
journalctl --since "1 hour ago"
```

Or:

```bash id="d2w6jh"
journalctl --since "2026-07-19 10:00:00"
```

Until a specific time:

```bash id="t7q3nf"
journalctl --until "2026-07-19 12:00:00"
```

These filters help narrow down large log datasets.

---

# Reading Traditional Log Files

View an entire file:

```bash id="e8h5yn"
cat /var/log/syslog
```

View page by page:

```bash id="m6x2vp"
less /var/log/syslog
```

View the last few lines:

```bash id="k9r4bz"
tail /var/log/syslog
```

Monitor continuously:

```bash id="f5d1qt"
tail -f /var/log/syslog
```

---

# Application Logs

Many applications create dedicated log files.

Examples:

```text id="s8u2lm"
/var/log/nginx/access.log
/var/log/nginx/error.log
```

Useful commands:

```bash id="n3w8hf"
tail -f /var/log/nginx/error.log
```

```bash id="y4p6jd"
tail -100 /var/log/nginx/access.log
```

Application-specific logs are often the fastest way to identify configuration or runtime issues.

---

# Log Rotation

Log files continuously grow over time.

Without maintenance:

```text id="c1j7kp"
server.log

10 MB
100 MB
2 GB
20 GB
```

Eventually, logs could consume all available disk space.

Linux uses **logrotate** to manage log growth automatically.

Typical tasks include:

- Rotating old logs.
- Compressing archived logs.
- Removing very old logs.
- Creating new log files.

---

# Example Rotated Logs

Inside `/var/log`:

```text id="x9t4vh"
syslog
syslog.1
syslog.2.gz
syslog.3.gz
```

Older logs are compressed to save disk space.

---

# Logrotate Configuration

Main configuration:

```text id="j5k9sn"
/etc/logrotate.conf
```

Additional configurations:

```text id="r6v2em"
/etc/logrotate.d/
```

Many installed applications include their own rotation rules.

---

# Useful Log Commands

| Command                 | Purpose               |
| ----------------------- | --------------------- |
| `journalctl`            | View system journal   |
| `journalctl -u service` | Service logs          |
| `journalctl -f`         | Live journal          |
| `journalctl -b`         | Current boot logs     |
| `tail -f file`          | Follow log file       |
| `tail -100 file`        | Last 100 lines        |
| `less file`             | View large log files  |
| `cat file`              | Display file contents |

---

# Real-World Example

A Node.js application behind Nginx suddenly begins returning **502 Bad Gateway** errors.

An administrator investigates:

```bash id="q7h4pd"
systemctl status nginx
```

Then checks the service logs:

```bash id="g3m8xy"
journalctl -u nginx -n 50
```

Finally, reviews the application logs:

```bash id="v1j6rk"
journalctl -u myapp -f
```

The logs reveal that the Node.js application crashed because an environment variable was missing.

Without the logs, identifying the root cause would have taken much longer.

---

# Best Practices

- Check logs before restarting services.
- Monitor application logs during deployments.
- Rotate logs regularly using `logrotate`.
- Store logs on persistent storage in production environments.
- Restrict access to sensitive log files containing authentication or security information.

---

# Common Mistakes

### Ignoring Logs During Troubleshooting

Restarting services without reviewing logs often hides the original cause of a failure.

Always inspect relevant logs first.

---

### Deleting Large Log Files Manually

Removing active log files can confuse running applications.

Allow `logrotate` to manage log rotation whenever possible.

---

### Looking Only at Application Logs

Many problems originate in system services, networking, or permissions.

Check both application logs and system logs when troubleshooting.

---

### Forgetting Historical Logs

Some problems occurred hours or days earlier.

Use time-based filters and previous boot logs instead of examining only the latest entries.

---

# Summary

Logs provide a detailed history of system and application events, making them indispensable for troubleshooting, monitoring, and security investigations.

Modern Linux systems use **systemd-journald** to collect logs, while traditional log files are often stored under `/var/log`. Tools such as `journalctl`, `tail`, `less`, and `logrotate` enable administrators to inspect, monitor, and manage logs effectively.

Developing the habit of checking logs first is one of the most valuable skills for any Linux administrator.

---

## Next Chapter

➡️ **10 - Cron and Scheduling**
