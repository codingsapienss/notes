---
sidebar_label: Process Management
sidebar_position: 4
---


# Process Management

## Overview

Every program running on a Linux system is executed as a **process**.

Whether you open a terminal, browse the web, start a Node.js application, or run an Nginx server, Linux creates one or more processes to perform the requested tasks.

The Linux kernel is responsible for creating, scheduling, monitoring, and terminating processes. Efficient process management enables Linux to run hundreds or even thousands of processes simultaneously while maintaining system stability and responsiveness.

Understanding how processes work is a fundamental skill for system administrators because diagnosing application issues, monitoring resource usage, and managing services all involve working with processes.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what a process is.
- Learn how Linux creates and manages processes.
- Understand Process IDs (PIDs).
- Learn foreground and background processes.
- Understand process states.
- Monitor running processes.
- Manage processes using common Linux commands.
- Learn how signals are used to control processes.

---

# What is a Process?

A **process** is an instance of a running program.

For example:

```bash id="gkz80u"
node app.js
```

The `node` program becomes a running process.

Similarly:

```bash id="u6iwku"
nginx
```

starts one or more Nginx processes.

A single program can create multiple processes depending on its design.

---

# Program vs Process

These terms are often confused.

| Program                    | Process                |
| -------------------------- | ---------------------- |
| Stored on disk             | Running in memory      |
| Passive                    | Active                 |
| Static file                | Executing instance     |
| Example: `node` executable | Example: `node app.js` |

Think of a program as a recipe and a process as the meal currently being prepared.

---

# Process Lifecycle

Every process follows a basic lifecycle.

```text id="8w14km"
Program Started
       │
       ▼
Process Created
       │
       ▼
Ready
       │
       ▼
Running
       │
       ▼
Waiting (if needed)
       │
       ▼
Running Again
       │
       ▼
Process Ends
```

The Linux scheduler manages transitions between these stages.

---

# Process ID (PID)

Every process receives a unique **Process ID (PID)**.

Example:

```text id="dxn4ml"
PID 1012 → nginx
PID 1208 → node
PID 2034 → mysql
```

Linux uses the PID to identify and manage a process.

You can view the current shell's PID:

```bash id="r1ay9q"
echo $$
```

---

# Parent and Child Processes

Processes can create other processes.

Example:

```text id="ehstow"
systemd (PID 1)
      │
      ├── sshd
      │      │
      │      └── bash
      │             │
      │             └── node app.js
      │
      └── nginx
```

The process that creates another process is called the **parent process**.

The newly created process is the **child process**.

---

# The init Process (systemd)

On modern Linux systems, the first userspace process started by the kernel is:

```text id="mjlwm4"
systemd
```

It always has:

```text id="ygq7lg"
PID = 1
```

`systemd` starts most other services on the system, including:

- SSH
- Nginx
- Docker
- Cron
- Network services

Almost every running process can ultimately be traced back to PID 1.

---

# Foreground Processes

A foreground process occupies the terminal until it completes.

Example:

```bash id="v9te5o"
python script.py
```

While it runs:

- The terminal waits.
- You cannot execute another command in the same terminal.
- The output appears immediately.

Foreground processes are common for interactive programs.

---

# Background Processes

A background process runs independently of the terminal.

Example:

```bash id="ec5qqh"
python script.py &
```

The `&` symbol sends the process to the background.

Advantages:

- Terminal remains usable.
- Multiple processes can run simultaneously.
- Common for servers and long-running tasks.

---

# Viewing Running Processes

## Using `ps`

Display running processes:

```bash id="kz4dfq"
ps
```

Detailed information:

```bash id="yo8bza"
ps -ef
```

Commonly used:

```bash id="zr8j7i"
ps aux
```

Typical output:

```text id="sr9sz0"
USER   PID  %CPU %MEM COMMAND
root     1   0.0  0.5 systemd
root   734   0.1  0.3 sshd
ubuntu 931   1.2  2.5 node
```

---

# Real-Time Monitoring with `top`

To monitor running processes in real time:

```bash id="6v07rt"
top
```

`top` displays:

- CPU usage
- Memory usage
- Running processes
- Load averages
- Process IDs

It updates continuously.

Press:

```text id="mlrjlwm"
q
```

to exit.

---

# Using `htop`

Many administrators prefer:

```bash id="2e0n5m"
htop
```

Advantages over `top`:

- Easier to read
- Interactive interface
- Colored display
- Keyboard navigation
- Process searching
- Easier process management

It may need to be installed first:

```bash id="wgcwwf"
sudo apt install htop
```

---

# Finding a Process

Search for a process by name:

```bash id="wnm4sh"
ps aux | grep nginx
```

Example output:

```text id="n0zjlwm"
root   732  nginx
www-data 733 nginx
www-data 734 nginx
```

This is commonly used while troubleshooting servers.

---

# Process States

Linux processes can exist in different states.

| State    | Meaning                         |
| -------- | ------------------------------- |
| Running  | Currently executing             |
| Sleeping | Waiting for an event            |
| Stopped  | Paused                          |
| Zombie   | Finished but not yet cleaned up |
| Dead     | Terminated                      |

Most processes spend a large portion of their time in the **Sleeping** state while waiting for work.

---

# Process Scheduling

The Linux scheduler decides:

- Which process runs next.
- How long it runs.
- When to switch to another process.

This scheduling happens thousands of times per second.

The goal is to keep the system responsive while sharing CPU time fairly among processes.

---

# Signals

Processes can receive **signals**, which are messages sent by the operating system or another process.

Common signals include:

| Signal  | Description                              |
| ------- | ---------------------------------------- |
| SIGTERM | Request graceful termination             |
| SIGKILL | Force immediate termination              |
| SIGINT  | Interrupt (Ctrl + C)                     |
| SIGHUP  | Reload configuration or restart behavior |

Signals allow administrators to control running processes without rebooting the system.

---

# Terminating Processes

Terminate a process gracefully:

```bash id="5vwwz2"
kill 1234
```

Here, `1234` is the PID.

Force termination:

```bash id="mjlwm7"
kill -9 1234
```

`-9` sends the **SIGKILL** signal.

Use force termination only when a process does not respond to normal termination requests.

---

# Terminating by Name

Instead of using the PID:

```bash id="b49l1f"
pkill nginx
```

Or:

```bash id="qqtmu8"
killall nginx
```

These commands terminate processes by name.

Use them carefully on production systems because they may affect multiple processes.

---

# Jobs

The shell can manage background jobs.

View active jobs:

```bash id="vr1kqo"
jobs
```

Bring a background job to the foreground:

```bash id="rjlwm2"
fg
```

Send a foreground process to the background:

```bash id="e9zjlwm"
bg
```

These commands work only for jobs started from the current shell.

---

# Real-World Example

Suppose your Node.js application is running on a production server.

You might verify it with:

```bash id="2c2n0j"
ps aux | grep node
```

Monitor system resources:

```bash id="fh6l4o"
htop
```

If the application becomes unresponsive:

```bash id="a0d7r4"
kill <PID>
```

If it still refuses to exit:

```bash id="c2yd8v"
kill -9 <PID>
```

In many production environments, process managers such as **PM2** are used to automatically restart applications if they crash. PM2 will be covered later in this handbook.

---

# Best Practices

- Use `ps`, `top`, or `htop` before terminating a process.
- Prefer graceful termination (`kill`) before using `kill -9`.
- Understand why a process is consuming resources before stopping it.
- Monitor long-running applications regularly.
- Use a process manager (such as PM2) for production applications instead of manually running programs.

---

# Common Mistakes

### Using `kill -9` Immediately

`kill -9` forces immediate termination and prevents the process from cleaning up resources.

Always attempt a normal `kill` first.

---

### Killing the Wrong Process

Always verify the PID before terminating a process, especially on production servers.

Stopping the wrong service can cause application downtime.

---

### Assuming High CPU Usage Always Indicates a Problem

Some applications legitimately consume significant CPU resources during startup, backups, or data processing.

Investigate before taking action.

---

### Confusing Services with Processes

A service (such as Nginx or SSH) may consist of multiple processes managed by `systemd`.

Stopping one process does not necessarily stop the entire service.

---

# Summary

Processes are the foundation of application execution in Linux.

The Linux kernel creates, schedules, and manages processes, while administrators monitor and control them using tools such as `ps`, `top`, `htop`, and `kill`.

Understanding process management is essential for troubleshooting applications, monitoring system health, and maintaining stable production servers.

---

## Next Chapter

➡️ **05 - Memory Management**
