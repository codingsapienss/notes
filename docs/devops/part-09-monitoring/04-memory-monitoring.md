---
sidebar_label: Memory Monitoring
sidebar_position: 4
---


# Memory Monitoring

## Overview

Memory (RAM) is one of the most valuable resources on a Linux server.

Every running process—including the operating system, applications, databases, web servers, and background services—requires memory to function.

Unlike disk storage, RAM is designed for **fast, temporary access**. If a server runs out of available memory, applications may slow down, become unresponsive, crash, or be terminated by the Linux kernel.

Monitoring memory usage helps administrators:

- Maintain application stability
- Detect memory leaks
- Prevent Out of Memory (OOM) conditions
- Optimize performance
- Plan future capacity upgrades

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand Linux memory management.
- Monitor RAM usage.
- Interpret `free` command output.
- Understand buffers and cache.
- Monitor swap usage.
- Detect memory leaks.
- Understand the Linux OOM Killer.
- Troubleshoot memory-related issues.

---

# What is RAM?

RAM (Random Access Memory) is temporary storage that holds the data and programs currently being used by the CPU.

Unlike storage devices:

- RAM is extremely fast.
- RAM is volatile (contents disappear after shutdown).
- Applications execute directly from RAM.
- The operating system continuously allocates and releases RAM.

Example:

```text
CPU
 │
 ▼
RAM
 │
 ▼
Applications
```

---

# Why Memory Monitoring Matters

Consider a production API server.

Initially:

```text
RAM Usage

35%
```

As traffic increases:

```text
Users

↓

Node.js

↓

More Requests

↓

Higher Memory Usage
```

Eventually:

```text
RAM Full

↓

No Available Memory

↓

OOM Killer

↓

Application Stops
```

Without monitoring, users discover the problem first.

With monitoring, administrators can resolve issues before they impact production.

---

# How Linux Uses Memory

Linux tries to use available RAM efficiently.

Memory is generally divided into:

```text
Total RAM

├── Used
├── Free
├── Buffers
└── Cache
```

Many new administrators believe that "high RAM usage" always indicates a problem.

In Linux, this is often **normal**, because unused memory is automatically used as filesystem cache.

---

# Viewing Memory Usage

Display memory statistics.

```bash
free -h
```

Example:

```text
              total   used   free   shared  buff/cache  available
Mem:           8Gi    2Gi     1Gi      120Mi      5Gi        5.6Gi
Swap:          2Gi      0B      2Gi
```

The `-h` option displays values in a human-readable format.

---

# Understanding free Output

| Column     | Meaning                               |
| ---------- | ------------------------------------- |
| Total      | Installed RAM                         |
| Used       | Memory currently allocated            |
| Free       | Completely unused memory              |
| Shared     | Shared memory                         |
| Buff/Cache | Filesystem cache and buffers          |
| Available  | Memory available for new applications |

The **Available** column is usually the most important value when evaluating memory health.

---

# Buffers and Cache

Linux improves performance by storing frequently accessed data in RAM.

```text
Disk

↓

Frequently Used Files

↓

RAM Cache

↓

Faster Access
```

Benefits include:

- Faster file access
- Reduced disk reads
- Better application performance

If applications require more memory, Linux automatically releases cached memory.

---

# Why High Memory Usage Is Not Always Bad

Example A:

```text
Used: 95%

Cache: 60%
```

Example B:

```text
Used: 95%

Applications: 95%
```

Although both systems report 95% memory usage, the first system still has significant reclaimable memory, while the second is close to exhaustion.

Always evaluate **Available** memory instead of relying only on **Used** memory.

---

# Swap Memory

Swap is disk space that Linux uses when RAM becomes insufficient.

```text
RAM Full

↓

Swap

↓

Disk
```

Because disks are much slower than RAM, heavy swap usage usually reduces performance.

---

# Viewing Swap Usage

Display swap information.

```bash
free -h
```

or

```bash
swapon --show
```

Regular swap activity may indicate that additional RAM or application optimization is required.

---

# Virtual Memory Statistics

Linux provides additional statistics through `vmstat`.

```bash
vmstat
```

This command displays:

- Memory usage
- Swap activity
- CPU utilization
- Process scheduling
- I/O statistics

---

# Monitoring Memory by Process

Identify applications consuming the most memory.

```bash
top
```

or

```bash
htop
```

These tools help identify:

- Large applications
- Unexpected memory consumption
- Possible memory leaks

---

# Memory Leaks

A memory leak occurs when an application allocates memory but never releases it.

```text
Application

↓

Allocate Memory

↓

Memory Never Released

↓

RAM Usage Continues Growing
```

Typical symptoms include:

- Increasing RAM usage
- Rising swap usage
- Slower performance
- Unexpected restarts

---

# Detecting Memory Leaks

Example trend:

```text
Morning

2.1 GB

↓

Afternoon

2.8 GB

↓

Evening

3.7 GB

↓

Night

4.8 GB
```

If workload remains relatively constant but memory continues increasing, a memory leak should be investigated.

---

# Out of Memory (OOM) Killer

When Linux cannot allocate additional memory, the kernel may terminate one or more processes.

```text
RAM Full

↓

No Available Memory

↓

OOM Killer

↓

Process Terminated
```

Applications terminated by the OOM Killer usually stop unexpectedly.

---

# Checking OOM Events

View kernel messages.

```bash
dmesg | grep -i oom
```

Or use:

```bash
journalctl -k
```

These logs help confirm whether a process was terminated due to insufficient memory.

---

# Memory Monitoring Workflow

```text
Check RAM

↓

Check Available Memory

↓

Check Swap

↓

Identify High Memory Processes

↓

Look for Memory Leak

↓

Resolve Issue
```

---

# Useful Memory Commands

| Command                | Purpose                     |
| ---------------------- | --------------------------- |
| `free -h`              | Memory and swap usage       |
| `top`                  | Live process monitoring     |
| `htop`                 | Interactive process viewer  |
| `vmstat`               | Virtual memory statistics   |
| `cat /proc/meminfo`    | Detailed memory information |
| `swapon --show`        | Active swap devices         |
| `dmesg \| grep -i oom` | OOM events                  |
| `journalctl -k`        | Kernel logs                 |

---

# Real-World Example

A production Express.js API begins restarting unexpectedly.

The administrator investigates:

1. `pm2 list` shows repeated restarts.
2. `free -h` reports less than **250 MB** of available memory.
3. `top` identifies the Node.js process consuming over **5 GB** of RAM.
4. `journalctl -k` confirms the OOM Killer terminated the process.
5. Developers identify a memory leak caused by unreleased objects.
6. After deploying the fix, memory usage stabilizes and application restarts stop.

---

# Best Practices

- Monitor available memory rather than only used memory.
- Watch swap usage regularly.
- Investigate steadily increasing RAM consumption.
- Monitor the highest memory-consuming processes.
- Review kernel logs for OOM events.
- Establish baseline memory usage during normal operation.
- Correlate memory metrics with CPU and application logs.

---

# Common Mistakes

### Assuming High RAM Usage Is Always Bad

Linux intentionally uses free RAM for caching to improve performance.

---

### Ignoring Swap

Heavy swap usage is often an early indicator of memory pressure.

---

### Restarting Applications Without Investigation

Restarting temporarily reduces memory usage but does not solve underlying memory leaks.

---

### Ignoring OOM Events

Repeated OOM kills indicate a serious production issue that requires investigation.

---

### Looking Only at Current Values

Long-term memory trends often reveal problems that single snapshots cannot.

---

# Summary

Memory monitoring is a core responsibility of Linux server administration. By understanding RAM usage, buffers, cache, swap, memory leaks, and the OOM Killer, administrators can maintain stable production systems and detect resource issues before they impact users. Combining memory metrics with CPU, disk, and application monitoring provides a complete view of system health.

---

## Next Chapter

➡️ **05 - Nginx Logs**
