---
sidebar_label: Monitoring Basics
sidebar_position: 1
---


# Monitoring Basics

## Overview

Deploying an application to production is **not the end of a server administrator's job**.

Once an application is live, it must be continuously monitored to ensure that it remains:

- Available
- Secure
- Fast
- Reliable
- Healthy

Servers operate 24 hours a day, often serving thousands or even millions of users. Hardware failures, software bugs, network issues, resource exhaustion, or unexpected traffic spikes can occur at any time.

Without monitoring, administrators may only discover problems after users begin reporting them.

Monitoring allows administrators to detect issues early, understand system behavior, and take corrective action before problems become critical.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what server monitoring is.
- Learn why monitoring is important.
- Differentiate between monitoring and logging.
- Understand various types of monitoring.
- Learn common production metrics.
- Understand proactive and reactive monitoring.
- Become familiar with basic Linux monitoring commands.

---

# What is Monitoring?

Monitoring is the continuous process of collecting information about a system's health, performance, and availability.

Instead of checking the server manually every few hours, monitoring continuously observes the server and reports its current condition.

Example:

```text id="mon01"
Linux Server

↓

Collect Metrics

↓

Analyze Health

↓

Administrator
```

Monitoring answers questions such as:

- Is the server running?
- Is CPU usage too high?
- Is memory running out?
- Is disk space nearly full?
- Is the application responding?
- Are users experiencing errors?

---

# Why Monitoring Matters

Imagine an online shopping website.

Everything appears to be working normally until suddenly:

- CPU reaches 100%.
- Memory becomes exhausted.
- Disk storage fills up.
- Database becomes unavailable.
- Application crashes.

Without monitoring:

```text id="mon02"
Problem Occurs

↓

Nobody Knows

↓

Users Complain

↓

Investigation Begins
```

With monitoring:

```text id="mon03"
Problem Detected

↓

Alert Generated

↓

Administrator Responds

↓

Users Hardly Notice
```

Monitoring reduces downtime and improves user experience.

---

# Monitoring vs Logging

Many beginners confuse monitoring with logging.

Although related, they serve different purposes.

| Monitoring                          | Logging                                   |
| ----------------------------------- | ----------------------------------------- |
| Shows current system health         | Records events that have already occurred |
| Focuses on metrics                  | Focuses on messages                       |
| Detects abnormal behavior           | Explains why it happened                  |
| Often generates alerts              | Used during troubleshooting               |
| Usually visualized using dashboards | Usually analyzed using log files          |

Example:

Monitoring:

```text id="mon04"
CPU Usage

95%
```

Logging:

```text id="mon05"
2026-07-20 10:15:32

Database Connection Failed
```

Monitoring tells you **something is wrong**.

Logs help explain **why it is wrong**.

---

# Types of Monitoring

Production systems are monitored from multiple perspectives.

```text id="mon06"
Production Server
       │
       ├───────────────┐
       │               │
       ▼               ▼
 Infrastructure    Application
       │               │
       └──────┬────────┘
              │
              ▼
          Administrator
```

Monitoring should cover the complete production environment.

---

# Infrastructure Monitoring

Infrastructure monitoring focuses on the operating system and hardware resources.

Common metrics include:

- CPU usage
- Memory usage
- Disk utilization
- Network traffic
- Running processes
- Server uptime

Example:

```text id="mon07"
Ubuntu Server

↓

CPU

RAM

Disk

Network
```

Infrastructure monitoring answers:

> "Is the server healthy?"

---

# Application Monitoring

Infrastructure may be healthy while the application itself is failing.

Application monitoring focuses on:

- API response times
- Request failures
- Application crashes
- Response status codes
- Database connectivity
- Background jobs

Example:

```text id="mon08"
Node.js Application

↓

API Requests

↓

Success Rate

↓

Administrator
```

Application monitoring answers:

> "Is the application working correctly?"

---

# Service Monitoring

Modern production servers often run several services.

Example:

```text id="mon09"
Linux Server

├── Nginx

├── PM2

├── MongoDB

└── Redis
```

Each service should be monitored independently.

Typical checks include:

- Is the service running?
- Has it restarted unexpectedly?
- Is it consuming excessive resources?

---

# Network Monitoring

Network monitoring helps identify communication issues.

Common metrics include:

- Network latency
- Incoming traffic
- Outgoing traffic
- Packet loss
- Open ports
- Failed connections

Example:

```text id="mon10"
Internet

↓

Firewall

↓

Server

↓

Application
```

A healthy application is of little use if users cannot reach it.

---

# Security Monitoring

Security monitoring focuses on detecting suspicious activity.

Examples include:

- Repeated failed SSH logins
- Unexpected user accounts
- Unauthorized file modifications
- Firewall violations
- Suspicious network traffic

Monitoring security events helps identify potential attacks before they cause significant damage.

---

# Proactive vs Reactive Monitoring

## Reactive Monitoring

Problems are discovered only after users report them.

```text id="mon11"
Problem

↓

Users Report

↓

Administrator Investigates
```

Reactive monitoring usually leads to longer downtime.

---

## Proactive Monitoring

The system detects issues automatically.

```text id="mon12"
Problem

↓

Monitoring Detects

↓

Alert

↓

Administrator Fixes
```

Proactive monitoring significantly improves system reliability.

---

# What Should Be Monitored?

A production server should monitor multiple resources simultaneously.

| Component        | Why Monitor?                         |
| ---------------- | ------------------------------------ |
| CPU              | Detect heavy processing              |
| Memory           | Prevent out-of-memory errors         |
| Disk Space       | Prevent storage exhaustion           |
| Disk I/O         | Detect slow storage                  |
| Network          | Identify connectivity problems       |
| Processes        | Verify critical services are running |
| Logs             | Detect application and system errors |
| SSL Certificates | Prevent certificate expiration       |
| Database         | Ensure availability and performance  |

No single metric provides a complete picture of system health.

---

# Basic Monitoring Commands

Linux provides several built-in tools.

| Command            | Purpose                     |
| ------------------ | --------------------------- |
| `top`              | View running processes      |
| `htop`             | Interactive process viewer  |
| `uptime`           | Show server uptime and load |
| `free -h`          | Display memory usage        |
| `df -h`            | Display disk usage          |
| `ps`               | List running processes      |
| `systemctl status` | Check service status        |

Examples:

View uptime:

```bash id="moncmd01"
uptime
```

View memory usage:

```bash id="moncmd02"
free -h
```

View disk usage:

```bash id="moncmd03"
df -h
```

View running processes:

```bash id="moncmd04"
top
```

These commands provide a quick overview of server health.

---

# Monitoring Workflow

A typical monitoring cycle looks like this:

```text id="mon13"
Collect Metrics

↓

Analyze

↓

Detect Problems

↓

Generate Alerts

↓

Administrator Responds

↓

System Healthy
```

This cycle repeats continuously throughout the lifetime of the server.

---

# Monitoring Architecture

A simplified production monitoring architecture:

```text id="mon14"
Users
   │
   ▼
Application
   │
   ▼
Linux Server
   │
   ▼
Metrics
   │
   ▼
Monitoring System
   │
   ▼
Administrator
```

The monitoring system continuously gathers information and presents it in a meaningful way.

---

# Benefits of Monitoring

| Benefit                | Description                          |
| ---------------------- | ------------------------------------ |
| High Availability      | Detect failures quickly              |
| Better Performance     | Identify bottlenecks                 |
| Faster Troubleshooting | Locate issues more efficiently       |
| Improved Security      | Detect suspicious activity           |
| Capacity Planning      | Predict future resource requirements |
| Reduced Downtime       | Respond before users are affected    |

Monitoring is a key component of maintaining reliable production systems.

---

# Real-World Example

Suppose an e-commerce website experiences a sudden increase in visitors during a holiday sale.

The monitoring system reports:

- CPU usage increasing from 25% to 90%.
- Memory usage approaching its limit.
- API response times becoming slower.
- Nginx returning occasional **502 Bad Gateway** responses.

Because these metrics are detected early, the operations team scales the application, investigates the increased load, and restores normal performance before the majority of users experience failures.

Without monitoring, the issue might only be discovered after customers begin reporting that the website is unavailable.

---

# Best Practices

- Monitor both infrastructure and applications.
- Review monitoring dashboards regularly.
- Use proactive monitoring instead of relying on user complaints.
- Monitor trends over time, not just current values.
- Monitor every critical production service.
- Establish performance baselines for normal operation.
- Combine monitoring with log analysis for effective troubleshooting.

---

# Common Mistakes

### Monitoring Only the Application

A healthy application cannot function properly if the operating system or hardware resources are failing.

---

### Ignoring Resource Trends

Resource usage that gradually increases over time may indicate a memory leak or capacity problem even if current usage appears acceptable.

---

### Confusing Monitoring with Logging

Monitoring identifies abnormal behavior, while logs provide detailed information to diagnose the underlying cause.

---

### Waiting for User Reports

Production issues should ideally be detected by monitoring systems before they are noticed by users.

---

### Monitoring Too Few Metrics

Focusing on only CPU usage while ignoring memory, disk, network, and application health provides an incomplete view of the system.

---

# Summary

Monitoring is the continuous observation of a server's health, performance, and availability. It enables administrators to detect issues early, respond proactively, and maintain reliable production services. Effective monitoring covers infrastructure, applications, services, networks, and security, while working alongside logging to provide complete visibility into system behavior. Mastering monitoring fundamentals is the first step toward operating stable and scalable production environments.

---

## Next Chapter

➡️ **02 - System Metrics**
