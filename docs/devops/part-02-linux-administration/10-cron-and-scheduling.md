---
sidebar_label: Cron and Scheduling
sidebar_position: 10
---


# Cron and Scheduling

## Overview

Many system administration tasks need to run automatically at specific times or regular intervals. Examples include database backups, log cleanup, report generation, SSL certificate renewal, and scheduled application maintenance.

Linux provides a built-in scheduling system called **Cron**, which allows administrators to automate these recurring tasks without manual intervention.

Cron is one of the most widely used utilities in Linux and is an essential skill for managing production servers.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what Cron is.
- Learn how the Cron service works.
- Create and manage cron jobs.
- Understand cron expressions.
- Schedule recurring tasks.
- Monitor cron execution.
- Learn best practices for production environments.

---

# What is Cron?

**Cron** is a time-based job scheduler in Linux.

It automatically executes commands or scripts at predefined times.

Examples of tasks commonly automated with Cron include:

- Database backups
- Log cleanup
- Email reports
- File synchronization
- SSL certificate renewal
- Health checks
- Scheduled application restarts

Instead of remembering to run these commands manually, Cron executes them automatically.

---

# How Cron Works

The scheduling process is straightforward.

```text id="7t9gxa"
Cron Daemon
      │
      ▼
Checks Schedule
Every Minute
      │
      ▼
Is a Job Due?
      │
   Yes ▼
Execute Command
```

The Cron daemon continuously checks scheduled jobs every minute.

If a job matches the current date and time, it is executed automatically.

---

# Cron Daemon

The Cron service runs as a background daemon.

Common service names include:

```text id="h4p8wd"
cron
crond
```

Check whether the service is running:

```bash id="u2v5rs"
systemctl status cron
```

On some Linux distributions:

```bash id="j7m3kt"
systemctl status crond
```

---

# What is Crontab?

A **crontab** (Cron table) is a configuration file that contains scheduled jobs.

Each user can have their own crontab.

View the current user's crontab:

```bash id="w5r9pz"
crontab -l
```

Edit the crontab:

```bash id="k3x8nv"
crontab -e
```

Delete all scheduled jobs:

```bash id="b8t6yh"
crontab -r
```

Be careful with `crontab -r` because it removes all cron jobs for the current user.

---

# Cron Job Format

Each cron entry consists of five time fields followed by the command.

```text id="q2m7fc"
* * * * * command
│ │ │ │ │
│ │ │ │ └── Day of Week
│ │ │ └──── Month
│ │ └────── Day of Month
│ └──────── Hour
└────────── Minute
```

---

# Cron Time Fields

| Field        | Allowed Values                 |
| ------------ | ------------------------------ |
| Minute       | 0–59                           |
| Hour         | 0–23                           |
| Day of Month | 1–31                           |
| Month        | 1–12                           |
| Day of Week  | 0–7 (0 and 7 represent Sunday) |

---

# Common Cron Expressions

Run every minute:

```text id="n8f2qx"
* * * * *
```

Run every hour:

```text id="m4j9wr"
0 * * * *
```

Run every day at midnight:

```text id="y6v3kp"
0 0 * * *
```

Run every day at 2:30 AM:

```text id="d1s7eu"
30 2 * * *
```

Run every Monday at 9:00 AM:

```text id="g8h5tz"
0 9 * * 1
```

Run every Sunday at midnight:

```text id="x5n2jq"
0 0 * * 0
```

---

# Special Characters

## Asterisk (`*`)

Represents **every value**.

Example:

```text id="r4c8pa"
* * * * *
```

Runs every minute.

---

## Comma (`,`)

Specify multiple values.

Example:

```text id="k9v1hd"
0 8,20 * * *
```

Runs at:

- 8:00 AM
- 8:00 PM

---

## Hyphen (`-`)

Specify a range.

Example:

```text id="z2w6mf"
0 9-17 * * *
```

Runs every hour between 9 AM and 5 PM.

---

## Slash (`/`)

Specify intervals.

Example:

```text id="t7j4ys"
*/5 * * * *
```

Runs every five minutes.

Another example:

```text id="a5r8pw"
0 */2 * * *
```

Runs every two hours.

---

# Creating a Cron Job

Open the crontab:

```bash id="v6n3eg"
crontab -e
```

Example:

```text id="e4q7mf"
0 2 * * * /home/developer/backup.sh
```

This executes:

```text id="s9h2vd"
/home/developer/backup.sh
```

every day at **2:00 AM**.

---

# Running Shell Scripts

Suppose you have:

```text id="f1x5rn"
/home/developer/scripts/cleanup.sh
```

Cron entry:

```text id="w8m4kp"
0 3 * * * /home/developer/scripts/cleanup.sh
```

The script runs every day at **3:00 AM**.

---

# Redirecting Output

Without redirection, Cron emails command output to the user (if mail is configured).

Save output to a log file:

```text id="c5j8tn"
0 2 * * * /home/developer/backup.sh >> /var/log/backup.log 2>&1
```

Explanation:

| Part   | Meaning                                  |
| ------ | ---------------------------------------- |
| `>>`   | Append standard output                   |
| `2>&1` | Redirect standard error to the same file |

Logging cron output is useful for troubleshooting scheduled jobs.

---

# Environment Variables

Cron jobs execute in a limited environment.

Commands that work in an interactive shell may fail under Cron because:

- `PATH` may be different.
- Environment variables may not be loaded.
- User profiles are not automatically sourced.

A safer approach is to use full paths.

Instead of:

```text id="j2q6sl"
node app.js
```

use:

```text id="p8v3xf"
/usr/bin/node /home/developer/app/app.js
```

---

# System-Wide Cron Jobs

User-specific cron jobs are stored separately from system-wide schedules.

Important locations include:

```text id="u9f5hr"
/etc/crontab
```

and

```text id="r6w1jb"
/etc/cron.d/
```

Additional scheduled directories:

```text id="d3n8mt"
/etc/cron.daily/
/etc/cron.weekly/
/etc/cron.monthly/
```

Scripts placed in these directories run according to the configured schedule.

---

# Viewing Cron Logs

Depending on the Linux distribution, Cron activity can be viewed using:

```bash id="x7h2me"
journalctl -u cron
```

or

```bash id="b4y8cq"
journalctl -u crond
```

Some systems also record Cron activity in:

```text id="h5p9kr"
/var/log/syslog
```

Search for Cron entries:

```bash id="v1r4ts"
grep CRON /var/log/syslog
```

---

# Useful Cron Commands

| Command                 | Purpose            |
| ----------------------- | ------------------ |
| `crontab -e`            | Edit cron jobs     |
| `crontab -l`            | List cron jobs     |
| `crontab -r`            | Remove cron jobs   |
| `systemctl status cron` | Check Cron service |
| `journalctl -u cron`    | View Cron logs     |

---

# Real-World Example

A production server hosts a Node.js application.

Every night at **1:00 AM**, the database should be backed up.

Cron entry:

```text id="m8t2ya"
0 1 * * * /home/developer/scripts/backup.sh >> /var/log/backup.log 2>&1
```

Every Sunday at **4:00 AM**, old log files are deleted.

```text id="q3v7hj"
0 4 * * 0 /home/developer/scripts/cleanup.sh
```

Every five minutes, the server performs a health check.

```text id="y4k1dx"
*/5 * * * * /home/developer/scripts/health-check.sh
```

These automated jobs reduce manual maintenance and improve system reliability.

---

# Best Practices

- Use absolute paths for commands and scripts.
- Redirect output to log files for troubleshooting.
- Test scripts manually before scheduling them.
- Avoid scheduling resource-intensive jobs during peak traffic hours.
- Keep cron jobs simple and well documented.

---

# Common Mistakes

### Forgetting Execute Permissions

A script without execute permission will fail.

Grant permission:

```bash id="e7q9pv"
chmod +x backup.sh
```

---

### Using Relative Paths

Relative paths may not work under Cron.

Prefer:

```text id="f6t3mw"
/home/developer/project/script.sh
```

instead of:

```text id="w2h8xn"
./script.sh
```

---

### Assuming Environment Variables Exist

Cron runs with a minimal environment.

Always verify required variables or specify them explicitly.

---

### Ignoring Job Output

If a scheduled job silently fails, the problem may go unnoticed.

Redirect output to log files and review them regularly.

---

# Summary

Cron is Linux's built-in scheduling system for automating recurring tasks.

Using `crontab`, administrators can schedule scripts and commands to execute at specific times or intervals. Understanding cron expressions, environment limitations, output redirection, and logging is essential for building reliable automation on Linux servers.

Automation through Cron is a fundamental part of production system administration and helps reduce manual effort while improving consistency.

---

## Next Chapter

➡️ **11 - Linux Networking Tools**
