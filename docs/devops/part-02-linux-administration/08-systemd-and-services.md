---
sidebar_label: systemd and Services
sidebar_position: 8
---


# systemd and Services

## Overview

Modern Linux distributions use **systemd** as their initialization system and service manager.

When a Linux system boots, the kernel starts **systemd**, which becomes the **first userspace process (PID 1)**. From that point onward, systemd is responsible for starting, stopping, monitoring, and managing almost every background service running on the system.

Whether you are running Nginx, SSH, Docker, MongoDB, or a Node.js application, systemd is usually responsible for ensuring these services start correctly and continue running.

Understanding systemd is one of the most important skills for Linux administrators because almost every production server relies on it.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what systemd is.
- Learn what services (daemons) are.
- Understand systemd units.
- Start, stop, restart, and reload services.
- Enable and disable services during boot.
- View service status and logs.
- Understand system targets.
- Create a basic custom service.

---

# What is systemd?

**systemd** is the initialization system used by most modern Linux distributions.

It performs tasks such as:

- Starting system services.
- Managing background processes.
- Handling system startup.
- Monitoring services.
- Managing dependencies.
- Logging service information.
- Controlling system shutdown and reboot.

Immediately after the Linux kernel finishes initialization, it launches:

```text id="l2a0fy"
systemd
PID = 1
```

Every major service on the system is either started directly or indirectly by systemd.

---

# What is a Service?

A **service** is a program that runs in the background to perform a specific task.

Unlike interactive applications, services usually start automatically and continue running until the system shuts down.

Examples include:

| Service | Purpose            |
| ------- | ------------------ |
| SSH     | Remote login       |
| Nginx   | Web server         |
| Docker  | Container engine   |
| MySQL   | Database server    |
| Redis   | In-memory database |
| Cron    | Scheduled tasks    |

These services often start automatically during system boot.

---

# Daemons

Background services in Linux are commonly called **daemons**.

Examples:

```text id="v8c1za"
sshd
nginx
mysqld
cron
dockerd
```

Characteristics:

- Run in the background.
- Usually start automatically.
- Wait for requests or scheduled events.
- Continue running until stopped.

For example, the SSH daemon continuously waits for incoming SSH connections.

---

# How systemd Works

The startup sequence is:

```text id="j6h4ne"
Power On
      │
      ▼
Kernel
      │
      ▼
systemd (PID 1)
      │
      ▼
Start Services
      │
      ▼
SSH
Nginx
Docker
Cron
MySQL
```

systemd ensures that services start in the correct order and only after their dependencies are available.

---

# What Are Units?

systemd manages different types of resources using **unit files**.

A unit is simply a configuration file that tells systemd how to manage something.

Common unit types include:

| Unit       | Purpose                                |
| ---------- | -------------------------------------- |
| `.service` | Background services                    |
| `.target`  | Groups of units (similar to runlevels) |
| `.mount`   | Mounted filesystems                    |
| `.socket`  | Socket activation                      |
| `.timer`   | Scheduled tasks                        |
| `.device`  | Hardware devices                       |

The most frequently used unit type is the **service unit**.

Example:

```text id="gt5z2s"
nginx.service
ssh.service
docker.service
```

---

# Managing Services

systemd is controlled using the `systemctl` command.

General syntax:

```bash id="c3f4mr"
sudo systemctl <command> <service>
```

---

# Starting a Service

Start Nginx:

```bash id="f8u9qe"
sudo systemctl start nginx
```

The service starts immediately but will not automatically start after a reboot unless it is enabled.

---

# Stopping a Service

Stop Nginx:

```bash id="x2k6lj"
sudo systemctl stop nginx
```

This terminates the running service.

---

# Restarting a Service

Restart Nginx:

```bash id="d4r8zw"
sudo systemctl restart nginx
```

This is commonly used after changing configuration files.

---

# Reloading a Service

Some services support reloading configuration without stopping the process.

Example:

```bash id="m5p3yx"
sudo systemctl reload nginx
```

Reloading is generally preferred when supported because it avoids interrupting active connections.

---

# Viewing Service Status

Check service status:

```bash id="p1w7av"
systemctl status nginx
```

Example output:

```text id="e9j4rd"
● nginx.service - A high performance web server

Loaded: loaded
Active: active (running)
Main PID: 845
```

Important fields:

| Field    | Meaning                                   |
| -------- | ----------------------------------------- |
| Loaded   | Service configuration loaded successfully |
| Active   | Current state                             |
| Main PID | Primary process ID                        |

---

# Enabling a Service

Enable automatic startup during boot:

```bash id="u8h5ns"
sudo systemctl enable nginx
```

Now, every time the system starts, systemd automatically starts Nginx.

---

# Disabling a Service

Prevent automatic startup:

```bash id="a7q2pk"
sudo systemctl disable nginx
```

The service remains installed but will not start automatically during boot.

---

# Checking Whether a Service Is Enabled

```bash id="w4z9te"
systemctl is-enabled nginx
```

Example output:

```text id="g0r2ym"
enabled
```

or

```text id="x1k8jd"
disabled
```

---

# Listing Running Services

Display active services:

```bash id="y6v3lc"
systemctl list-units --type=service
```

List all services:

```bash id="q2f7mr"
systemctl list-unit-files --type=service
```

---

# Viewing Service Logs

systemd integrates with the system journal.

View logs for a service:

```bash id="k8t4zd"
journalctl -u nginx
```

Show recent logs:

```bash id="j5m1qx"
journalctl -u nginx -n 50
```

Follow logs in real time:

```bash id="b9c7wr"
journalctl -u nginx -f
```

This functionality is extremely useful for troubleshooting.

---

# System Targets

Older Linux systems used **runlevels**.

Modern Linux systems use **targets**.

Common targets include:

| Target              | Purpose                       |
| ------------------- | ----------------------------- |
| `multi-user.target` | Multi-user command-line mode  |
| `graphical.target`  | Graphical desktop environment |
| `rescue.target`     | Recovery mode                 |
| `emergency.target`  | Minimal emergency environment |

View the current target:

```bash id="h7p6mf"
systemctl get-default
```

Change the default target:

```bash id="c6x2av"
sudo systemctl set-default multi-user.target
```

---

# Creating a Custom Service

Suppose you have a Node.js application.

Instead of starting it manually:

```bash id="t5r8ko"
node app.js
```

you can create a service file.

Example:

```text id="v3n1qw"
/etc/systemd/system/myapp.service
```

Basic service file:

```ini id="p9k4jh"
[Unit]
Description=My Node.js Application
After=network.target

[Service]
ExecStart=/usr/bin/node /home/developer/app/app.js
WorkingDirectory=/home/developer/app
Restart=always
User=developer

[Install]
WantedBy=multi-user.target
```

Reload systemd after creating the file:

```bash id="z2m5ye"
sudo systemctl daemon-reload
```

Enable the service:

```bash id="l7v4dn"
sudo systemctl enable myapp
```

Start the service:

```bash id="n3q9fs"
sudo systemctl start myapp
```

The application now starts automatically after every reboot.

---

# Common systemctl Commands

| Command                        | Purpose                     |
| ------------------------------ | --------------------------- |
| `systemctl start service`      | Start a service             |
| `systemctl stop service`       | Stop a service              |
| `systemctl restart service`    | Restart a service           |
| `systemctl reload service`     | Reload configuration        |
| `systemctl status service`     | View service status         |
| `systemctl enable service`     | Start automatically at boot |
| `systemctl disable service`    | Disable automatic startup   |
| `systemctl is-enabled service` | Check boot status           |
| `systemctl list-units`         | List running units          |
| `systemctl daemon-reload`      | Reload unit files           |

---

# Real-World Example

After deploying a Node.js application, a production server might run:

```text id="s4f8kp"
systemd
├── ssh.service
├── nginx.service
├── docker.service
├── redis.service
└── myapp.service
```

If the application crashes unexpectedly, the service configuration can be set to:

```ini id="r5k2mz"
Restart=always
```

systemd automatically restarts the application, improving reliability without requiring manual intervention.

---

# Best Practices

- Manage long-running applications using systemd rather than manual terminal sessions.
- Enable essential services to start automatically during boot.
- Use `restart` only when necessary; prefer `reload` when a service supports configuration reloading.
- Review service logs using `journalctl` when troubleshooting.
- Keep custom service files inside `/etc/systemd/system`.

---

# Common Mistakes

### Starting a Service Without Enabling It

Running:

```bash id="f2t6ja"
sudo systemctl start nginx
```

starts the service immediately but does not configure it to start after a reboot.

Use:

```bash id="m8r3ye"
sudo systemctl enable nginx
```

if automatic startup is required.

---

### Forgetting `daemon-reload`

After creating or modifying a service file, systemd must reload its configuration.

```bash id="u4k9zw"
sudo systemctl daemon-reload
```

Without this step, systemd may continue using the old configuration.

---

### Ignoring Service Logs

When a service fails to start, the logs often provide the exact cause.

Always check:

```bash id="v1q8hn"
journalctl -u service-name
```

before making configuration changes.

---

### Running Production Applications Manually

Starting applications directly from the terminal means they stop when the terminal session ends or the user logs out.

Use systemd (or a dedicated process manager such as PM2) for production workloads.

---

# Summary

systemd is the foundation of service management on modern Linux systems.

It starts and monitors background services, manages system startup, tracks service dependencies, and provides powerful tools for administration and troubleshooting.

Mastering `systemctl`, service units, and `journalctl` is essential for managing production Linux servers and forms the basis for deploying reliable applications.

---

## Next Chapter

➡️ **09 - Log Management**
