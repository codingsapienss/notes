---
sidebar_label: PM2 Monitoring
sidebar_position: 7
---


# PM2 Monitoring

## Overview

In production environments, simply starting a Node.js application is not enough. Administrators must continuously monitor the application's health to ensure it remains available, responsive, and stable.

PM2 is more than just a process manager—it is also a powerful monitoring tool. It provides real-time information about:

- Running applications
- CPU usage
- Memory usage
- Process uptime
- Restart count
- Application logs
- Cluster status
- Process health

Using PM2, administrators can quickly determine whether an application is healthy or requires attention.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand PM2 monitoring.
- Monitor application status.
- Analyze CPU and memory usage.
- View application logs.
- Monitor cluster mode.
- Understand restart behavior.
- Diagnose common production issues.
- Apply PM2 monitoring best practices.

---

# Why Monitor Applications?

A running server does not necessarily mean the application is healthy.

Consider the following situation:

```text id="pm201"
Ubuntu Server

↓

Running

↓

Node.js Application

↓

Crashed
```

The server is online, but the application is unavailable.

Monitoring ensures that administrators detect such issues immediately.

---

# PM2 Architecture

```text id="pm202"
Users

↓

Nginx

↓

PM2

↓

Node.js Application
```

PM2 sits between the operating system and the application, continuously monitoring the application's lifecycle.

---

# Checking Running Applications

Display all managed applications.

```bash id="pm2cmd01"
pm2 list
```

Example output:

```text id="pm203"
App Name     Status    CPU    Memory

api          online    3%     120 MB

admin        online    2%      95 MB
```

This command provides a quick overview of all running applications.

---

# Understanding PM2 Status

Common application states:

| Status            | Meaning                                     |
| ----------------- | ------------------------------------------- |
| online            | Application is running normally             |
| stopped           | Application has been stopped                |
| errored           | Application failed to start                 |
| launching         | Application is starting                     |
| waiting restart   | PM2 is preparing to restart the application |
| one-launch-status | Temporary startup state                     |

The **online** status indicates that the application is actively running.

---

# Monitoring CPU Usage

PM2 displays CPU utilization for each application.

```text id="pm204"
Application

↓

CPU Usage

↓

3%
```

High CPU usage may indicate:

- Heavy traffic
- Infinite loops
- Expensive computations
- Poor application performance

CPU usage should be interpreted alongside other system metrics.

---

# Monitoring Memory Usage

Memory usage is displayed for every running process.

```text id="pm205"
Application

↓

Memory

↓

180 MB
```

Steadily increasing memory usage may indicate:

- Memory leaks
- Large cached objects
- Inefficient data handling

Memory trends are often more important than individual values.

---

# Interactive Monitoring

PM2 includes a built-in monitoring dashboard.

Launch it using:

```bash id="pm2cmd02"
pm2 monit
```

Example:

```text id="pm206"
+------------------------------------+

Application CPU Memory Restarts

api 4% 150MB 0

admin 2% 110MB 1

+------------------------------------+
```

The dashboard refreshes continuously and is useful during live troubleshooting.

---

# Viewing Application Logs

Display logs for every application.

```bash id="pm2cmd03"
pm2 logs
```

View logs for a specific application.

```bash id="pm2cmd04"
pm2 logs api
```

Logs help explain why an application restarted or encountered errors.

---

# Describing an Application

View detailed information.

```bash id="pm2cmd05"
pm2 describe api
```

Typical information includes:

- Process ID
- Uptime
- Restart count
- Script path
- Environment variables
- Node.js version
- Memory usage

This command provides a complete overview of a single application.

---

# Monitoring Restarts

Unexpected restarts often indicate underlying issues.

Example:

```text id="pm207"
Application

↓

Crash

↓

PM2 Restart

↓

Crash Again
```

Frequent restarts should always be investigated.

Possible causes include:

- Unhandled exceptions
- Memory leaks
- Database failures
- Configuration errors

---

# Monitoring Uptime

PM2 tracks how long an application has been running.

Example:

```text id="pm208"
Application

↓

Running

↓

18 Days
```

Short uptimes combined with high restart counts may indicate instability.

---

# Cluster Monitoring

When running in Cluster Mode, multiple Node.js processes handle incoming requests.

Example:

```text id="pm209"
PM2

├── Worker 1

├── Worker 2

├── Worker 3

└── Worker 4
```

Administrators should monitor each worker individually.

One unhealthy worker can reduce application performance even if others remain online.

---

# Viewing Cluster Processes

Display running processes.

```bash id="pm2cmd06"
pm2 list
```

Each cluster worker appears as a separate process with its own resource usage.

---

# Restarting Applications

Restart a single application.

```bash id="pm2cmd07"
pm2 restart api
```

Restart all applications.

```bash id="pm2cmd08"
pm2 restart all
```

Restarting should be used carefully in production and only after understanding the underlying issue.

---

# Reloading Applications

For applications running in Cluster Mode:

```bash id="pm2cmd09"
pm2 reload api
```

Reloading performs a **zero-downtime restart**, allowing new workers to start before old workers stop.

---

# Viewing Process Status

Display detailed process information.

```bash id="pm2cmd10"
pm2 status
```

This provides another quick way to verify that applications are running correctly.

---

# Saving Process List

Save current processes.

```bash id="pm2cmd11"
pm2 save
```

This allows PM2 to restore applications automatically after a server reboot.

---

# Startup Configuration

Generate startup configuration.

```bash id="pm2cmd12"
pm2 startup
```

Follow the generated command to register PM2 with the operating system.

---

# PM2 Monitoring Workflow

```text id="pm210"
Application Running

↓

PM2

↓

CPU

Memory

Restarts

Logs

↓

Administrator
```

PM2 continuously collects operational information about managed applications.

---

# Production Monitoring Architecture

```text id="pm211"
Users
   │
   ▼
Nginx
   │
   ▼
PM2
   │
   ├──────────────┬──────────────┐
   ▼              ▼              ▼
CPU          Memory         Restart Count
   │
   ▼
Administrator
```

PM2 provides application-level monitoring, complementing system monitoring tools.

---

# Useful PM2 Commands

| Command              | Purpose                          |
| -------------------- | -------------------------------- |
| `pm2 list`           | List running applications        |
| `pm2 monit`          | Interactive monitoring dashboard |
| `pm2 logs`           | View application logs            |
| `pm2 describe <app>` | Display detailed information     |
| `pm2 status`         | Show application status          |
| `pm2 restart <app>`  | Restart application              |
| `pm2 reload <app>`   | Zero-downtime reload             |
| `pm2 save`           | Save process list                |
| `pm2 startup`        | Configure startup on boot        |

---

# Real-World Example

An Express.js API occasionally becomes unavailable.

The administrator performs the following steps:

1. Runs:

```bash id="pm2cmd13"
pm2 list
```

2. Notices the application has restarted **18 times**.

3. Opens the logs.

```bash id="pm2cmd14"
pm2 logs api
```

4. Finds repeated database connection timeout errors.

5. Uses:

```bash id="pm2cmd15"
pm2 describe api
```

6. Observes that memory usage increases continuously before each restart.

7. Developers identify and fix a memory leak.

8. After deployment, restart count remains at zero and memory usage stabilizes.

PM2 monitoring quickly identified the application's instability and provided the information needed to diagnose the root cause.

---

# Best Practices

- Monitor applications continuously using `pm2 monit`.
- Investigate unexpected restarts immediately.
- Monitor CPU and memory trends rather than isolated values.
- Review logs before restarting applications.
- Use `pm2 reload` instead of `restart` for Cluster Mode deployments.
- Save the PM2 process list after configuration changes.
- Enable PM2 startup so applications recover automatically after server reboots.
- Combine PM2 monitoring with Linux system metrics and Nginx logs.

---

# Common Mistakes

### Ignoring Restart Count

A high restart count often indicates recurring application failures that require investigation.

---

### Monitoring Only CPU Usage

CPU usage alone does not reveal memory leaks, crashes, or restart behavior.

---

### Restarting Without Reading Logs

Restarting an application may temporarily hide the issue without resolving the underlying problem.

---

### Forgetting to Save PM2 Configuration

Failing to run `pm2 save` can prevent applications from restarting automatically after a reboot.

---

### Using Restart Instead of Reload in Cluster Mode

For production cluster deployments, `pm2 reload` minimizes downtime by replacing worker processes gracefully.

---

# Summary

PM2 is both a process manager and a powerful application monitoring tool. It provides real-time visibility into application status, CPU usage, memory consumption, uptime, restart counts, logs, and cluster workers. By regularly monitoring these metrics and investigating abnormal behavior, administrators can maintain reliable Node.js applications and respond quickly to production issues.

---

## Next Chapter

➡️ **08 - Performance Tuning**
