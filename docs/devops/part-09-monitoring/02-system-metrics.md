---
sidebar_label: System Metrics
sidebar_position: 2
---


# System Metrics

### Overview

In the previous chapter, we learned why monitoring is essential for production servers.

However, monitoring is useful only when we understand **what** is being monitored.

A Linux server constantly generates information about its performance. These measurements are known as **system metrics**.

System metrics provide real-time insight into the health of the server and help administrators answer questions such as:

- Is the CPU overloaded?
- Is memory running low?
- Is disk activity too high?
- Is the server handling too many processes?
- Is the network becoming a bottleneck?

Understanding these metrics is one of the most important skills for Linux administrators because they help identify problems before they affect users.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand common Linux system metrics.
- Interpret CPU usage.
- Understand Load Average.
- Monitor running processes.
- Analyze system uptime.
- Monitor network activity.
- Understand disk I/O metrics.
- Use common Linux monitoring commands.

---

## What Are System Metrics?

System metrics are numerical measurements that describe how a server is performing.

Example:

```text id="sys01"
Linux Server

↓

Collect Metrics

↓

CPU

Memory

Disk

Network

Processes
```

These metrics continuously change as users interact with the server.

---

## Why System Metrics Matter

Suppose users report that a website has become slow.

Without metrics:

```text id="sys02"
Slow Website

↓

Guess the Problem
```

With metrics:

```text id="sys03"
Slow Website

↓

Check CPU

↓

Check Memory

↓

Check Disk

↓

Find Bottleneck
```

Metrics replace guesswork with measurable information.

---

## CPU Usage

The CPU performs calculations required by the operating system and applications.

Typical CPU states include:

| State             | Meaning                                  |
| ----------------- | ---------------------------------------- |
| User (us)         | Time spent running user applications     |
| System (sy)       | Time spent executing kernel operations   |
| Idle (id)         | CPU waiting for work                     |
| I/O Wait (wa)     | CPU waiting for storage operations       |
| Nice (ni)         | Time spent on low-priority processes     |
| Interrupt (hi/si) | Hardware and software interrupt handling |

Example:

```text id="sys04"
CPU

100%

├── User

├── System

├── Idle

└── I/O Wait
```

High CPU usage is not always a problem. A busy CPU serving many legitimate requests may be functioning normally.

---

## Viewing CPU Usage

Use:

```bash id="syscmd01"
top
```

or

```bash id="syscmd02"
htop
```

Example output may display:

- CPU utilization
- Running processes
- Memory usage
- System load

---

## Load Average

One of Linux's most misunderstood metrics is **Load Average**.

Load Average represents the average number of processes that are:

- Running on the CPU.
- Waiting for CPU time.
- Waiting for certain system resources.

Example:

```text id="sys05"
CPU

↓

Running Processes

+

Waiting Processes

↓

Load Average
```

Linux displays three values:

```text id="sys06"
0.25

0.40

0.65
```

These represent averages over:

- 1 minute
- 5 minutes
- 15 minutes

---

## Understanding Load Average

Suppose a server has **4 CPU cores**.

| Load Average | Interpretation         |
| ------------ | ---------------------- |
| 1.0          | Light workload         |
| 2.0          | Moderate workload      |
| 4.0          | CPUs fully utilized    |
| 6.0          | Some processes waiting |
| 10.0         | Heavy overload         |

Load Average should always be interpreted relative to the number of CPU cores.

---

## Viewing Load Average

Use:

```bash id="syscmd03"
uptime
```

Example:

```text id="sys07"
14:32:15 up 8 days,

load average:

0.34, 0.42, 0.51
```

A steadily increasing Load Average may indicate CPU contention or blocked processes.

---

## Running Processes

Every running program is represented by one or more processes.

Example:

```text id="sys08"
Linux

↓

Nginx

PM2

Node.js

MongoDB
```

Monitoring processes helps detect:

- Stuck applications
- High CPU consumers
- Zombie processes
- Unexpected services

---

## Viewing Processes

List all processes.

```bash id="syscmd04"
ps aux
```

Interactive view:

```bash id="syscmd05"
top
```

Tree view:

```bash id="syscmd06"
pstree
```

Each tool provides a different perspective on process activity.

---

## Server Uptime

Uptime indicates how long the server has been running since the last reboot.

Example:

```text id="sys09"
Server Boot

↓

Running

↓

15 Days
```

View uptime.

```bash id="syscmd07"
uptime
```

Long uptimes are common in stable production environments, though occasional reboots may still be required for kernel updates or maintenance.

---

## Context Switching

A CPU can execute only a limited number of instructions at any given moment.

When multiple processes require CPU time, Linux switches rapidly between them.

```text id="sys10"
CPU

↓

Process A

↓

Process B

↓

Process C
```

Frequent context switching is normal, but excessive switching may reduce performance.

View statistics:

```bash id="syscmd08"
vmstat
```

---

## Disk I/O

Disk I/O measures how quickly data is read from and written to storage.

Heavy disk activity may slow applications.

Example:

```text id="sys11"
Application

↓

Disk Read

Disk Write

↓

Storage
```

High disk utilization can become a bottleneck even when CPU usage is low.

---

## Viewing Disk I/O

Use:

```bash id="syscmd09"
iostat
```

or

```bash id="syscmd10"
vmstat
```

Useful metrics include:

- Read operations
- Write operations
- Disk utilization
- I/O wait

---

## Network Activity

Servers continuously exchange data with clients.

Network metrics include:

- Incoming traffic
- Outgoing traffic
- Open connections
- Network errors
- Bandwidth usage

Example:

```text id="sys12"
Users

↓

Internet

↓

Linux Server
```

Monitoring network activity helps identify congestion or unusual traffic patterns.

---

## Viewing Network Information

Display network statistics.

```bash id="syscmd11"
ss -tuln
```

View network interfaces.

```bash id="syscmd12"
ip addr
```

Display network statistics.

```bash id="syscmd13"
ip -s link
```

These commands help monitor connectivity and interface activity.

---

## File Descriptors

Linux represents many resources as file descriptors, including:

- Files
- Network sockets
- Pipes

If an application exhausts available file descriptors, it may fail to accept new connections.

View the current limit.

```bash id="syscmd14"
ulimit -n
```

Administrators should monitor file descriptor usage on high-traffic systems.

---

## System Metrics Workflow

```text id="sys13"
Collect Metrics

↓

Analyze

↓

Compare With Baseline

↓

Detect Problems

↓

Investigate

↓

Resolve
```

Interpreting metrics requires understanding what is normal for a specific server.

---

## Production Monitoring Architecture

```text id="sys14"
Users
   │
   ▼
Linux Server
   │
   ├──────────┬──────────┬──────────┐
   ▼          ▼          ▼          ▼
 CPU      Memory      Disk      Network
   │
   ▼
Administrator
```

Multiple metrics should always be evaluated together rather than in isolation.

---

## Useful Monitoring Commands

| Command      | Purpose                              |
| ------------ | ------------------------------------ |
| `top`        | Live process monitoring              |
| `htop`       | Interactive process viewer           |
| `uptime`     | Uptime and Load Average              |
| `vmstat`     | Virtual memory and system statistics |
| `iostat`     | Disk I/O statistics                  |
| `ps aux`     | Process list                         |
| `ss -tuln`   | Network sockets                      |
| `ip addr`    | Network interfaces                   |
| `ip -s link` | Network interface statistics         |
| `pstree`     | Process hierarchy                    |

---

## Real-World Example

An online ticket booking platform begins responding slowly during a major event.

The operations engineer checks:

- `top` and observes CPU usage at 98%.
- `uptime` and notices a Load Average of **18** on a 4-core server.
- `vmstat` reports significant CPU wait time.
- `iostat` shows normal disk activity.
- `ss -tuln` indicates a large number of active client connections.

Based on these metrics, the engineer determines that the primary bottleneck is CPU saturation rather than storage or networking. The team scales the application by adding more instances behind the load balancer, reducing CPU utilization and restoring normal response times.

---

## Best Practices

- Monitor multiple metrics together rather than relying on a single value.
- Establish baseline performance during normal operation.
- Investigate sudden changes in CPU, load, or I/O.
- Review system metrics regularly, not only during incidents.
- Correlate metrics with application logs when troubleshooting.
- Understand the hardware configuration before interpreting metrics.
- Track trends over time to identify gradual performance degradation.

---

## Common Mistakes

#### Assuming High CPU Usage Is Always Bad

High CPU usage may simply indicate that the server is actively processing legitimate requests.

---

#### Ignoring Load Average

CPU utilization alone does not reveal how many processes are waiting for execution.

---

#### Looking at Only One Metric

Performance problems often involve multiple system resources. CPU, memory, disk, and network metrics should be analyzed together.

---

#### Ignoring I/O Wait

A server with low CPU utilization can still perform poorly if processes spend significant time waiting for storage operations.

---

#### Troubleshooting Without a Baseline

Without knowing what normal system behavior looks like, it is difficult to determine whether current metrics indicate a genuine problem.

---

## Summary

System metrics provide a quantitative view of a Linux server's health and performance. By monitoring CPU usage, Load Average, processes, uptime, disk I/O, network activity, and file descriptors, administrators can identify bottlenecks, diagnose issues, and maintain reliable production systems. Understanding how these metrics relate to one another is a fundamental skill for operating Linux servers effectively.

---

### Next Chapter

➡️ **03 - Disk Monitoring**
