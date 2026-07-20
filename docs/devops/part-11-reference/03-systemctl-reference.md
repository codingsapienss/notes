---
sidebar_label: systemctl Reference
sidebar_position: 3
---


# systemctl Reference

### Overview

`systemctl` is the command-line interface for **systemd**, the default init system used by most modern Linux distributions, including Ubuntu, Debian, CentOS, Rocky Linux, AlmaLinux, Fedora, and RHEL.

Systemd is responsible for:

- Starting the operating system
- Managing system services
- Handling boot targets
- Monitoring background processes
- Managing timers
- Handling dependencies
- Viewing service status

This chapter serves as a complete reference for the most commonly used `systemctl` commands in server administration.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Manage Linux services efficiently.
- Understand service states.
- Configure startup behavior.
- Inspect logs.
- Reload configurations safely.
- Understand systemd units.
- Troubleshoot services using systemctl.

---

## systemd Architecture

```text
Linux Kernel

↓

systemd (PID 1)

├── Services
├── Sockets
├── Timers
├── Mounts
├── Targets
├── Devices
└── Processes
```

Every system service is managed through **systemd**.

---

## What is a Unit?

A **Unit** is an object managed by systemd.

Common unit types:

| Extension  | Unit Type | Purpose                 |
| ---------- | --------- | ----------------------- |
| `.service` | Service   | Background applications |
| `.socket`  | Socket    | Socket activation       |
| `.target`  | Target    | Groups of services      |
| `.mount`   | Mount     | Mounted filesystems     |
| `.timer`   | Timer     | Scheduled tasks         |
| `.path`    | Path      | File monitoring         |
| `.device`  | Device    | Hardware devices        |

Examples:

```text
nginx.service

ssh.service

docker.service

pm2-root.service
```

---

## Service Lifecycle

```text
Stopped

↓

Start

↓

Running

↓

Reload

↓

Restart

↓

Stop
```

Understanding the lifecycle helps avoid unnecessary downtime.

---

## View Service Status

Check the status of a service.

```bash
sudo systemctl status nginx
```

Example output:

```text
Active: active (running)
```

Another example:

```bash
sudo systemctl status ssh
```

This command is the starting point for most troubleshooting tasks.

---

## Start a Service

```bash
sudo systemctl start nginx
```

Purpose:

- Starts a stopped service.
- Does nothing if already running.

---

## Stop a Service

```bash
sudo systemctl stop nginx
```

Purpose:

- Gracefully stops the service.

Use with caution on production servers.

---

## Restart a Service

```bash
sudo systemctl restart nginx
```

Purpose:

- Stops the service.
- Starts it again.

Use restart when:

- Application crashes.
- Configuration changes require a full restart.

---

## Reload a Service

```bash
sudo systemctl reload nginx
```

Purpose:

- Reloads configuration.
- Keeps existing processes running when supported.

Prefer `reload` over `restart` whenever possible.

---

## Enable a Service

Enable automatic startup during boot.

```bash
sudo systemctl enable nginx
```

Example:

```text
Created symlink

multi-user.target

↓

nginx.service
```

---

## Disable a Service

Prevent automatic startup.

```bash
sudo systemctl disable nginx
```

The service can still be started manually.

---

## Restart vs Reload

| Command   | Downtime | Configuration Reload | Process Restart |
| --------- | -------- | -------------------- | --------------- |
| `reload`  | Minimal  | Yes                  | No              |
| `restart` | Brief    | Yes                  | Yes             |

Use **reload** whenever the application supports it.

---

## Check if Service is Enabled

```bash
systemctl is-enabled nginx
```

Possible output:

```text
enabled
```

or

```text
disabled
```

---

## Check if Service is Active

```bash
systemctl is-active nginx
```

Possible output:

```text
active
```

or

```text
inactive
```

---

## List Running Services

```bash
systemctl list-units --type=service
```

Example:

```text
nginx.service

ssh.service

cron.service
```

---

## List All Installed Services

```bash
systemctl list-unit-files --type=service
```

Useful for discovering available services.

---

## View Failed Services

```bash
systemctl --failed
```

Example:

```text
mysql.service

failed
```

Checking failed services should be part of routine troubleshooting.

---

## Reload systemd Configuration

After modifying unit files:

```bash
sudo systemctl daemon-reload
```

Flow:

```text
Modify Unit File

↓

daemon-reload

↓

Restart Service
```

Without `daemon-reload`, systemd continues using the previous configuration.

---

## Mask a Service

Prevent a service from starting under any circumstances.

```bash
sudo systemctl mask apache2
```

Purpose:

- Completely disables the service.

---

## Unmask a Service

```bash
sudo systemctl unmask apache2
```

Allows the service to be started again.

---

## View Boot Time

```bash
systemd-analyze
```

Example:

```text
Startup finished in

4.8s
```

Useful for boot performance analysis.

---

## Analyze Slow Boot

```bash
systemd-analyze blame
```

Example:

```text
12.3s mysql.service

5.1s docker.service
```

This identifies services that delay system startup.

---

## View Service Logs

Systemd integrates with the journal.

```bash
journalctl -u nginx
```

View latest logs:

```bash
journalctl -u nginx -n 50
```

Follow logs:

```bash
journalctl -u nginx -f
```

Logs are one of the most valuable debugging resources.

---

## View System Logs

```bash
journalctl
```

Recent errors:

```bash
journalctl -xe
```

Boot logs:

```bash
journalctl -b
```

Previous boot:

```bash
journalctl -b -1
```

---

## Check Dependencies

Display service dependencies.

```bash
systemctl list-dependencies nginx
```

Example:

```text
nginx.service

├── network.target

├── sysinit.target

└── basic.target
```

Dependencies determine startup order.

---

## Service File Locations

| Location               | Purpose              |
| ---------------------- | -------------------- |
| `/lib/systemd/system/` | Installed unit files |
| `/etc/systemd/system/` | Custom unit files    |
| `/run/systemd/system/` | Runtime units        |

Custom services should generally be stored in:

```text
/etc/systemd/system/
```

---

## Example Custom Service

```ini
[Unit]
Description=Node API

[Service]
ExecStart=/usr/bin/node /home/ubuntu/app.js

WorkingDirectory=/home/ubuntu

Restart=always

User=ubuntu

[Install]
WantedBy=multi-user.target
```

Save as:

```text
/etc/systemd/system/node-api.service
```

Enable:

```bash
sudo systemctl daemon-reload

sudo systemctl enable node-api

sudo systemctl start node-api
```

---

## Common systemctl Commands

| Command                   | Purpose             |
| ------------------------- | ------------------- |
| `systemctl status`        | View status         |
| `systemctl start`         | Start               |
| `systemctl stop`          | Stop                |
| `systemctl restart`       | Restart             |
| `systemctl reload`        | Reload              |
| `systemctl enable`        | Enable at boot      |
| `systemctl disable`       | Disable at boot     |
| `systemctl mask`          | Prevent startup     |
| `systemctl unmask`        | Allow startup       |
| `systemctl daemon-reload` | Reload unit files   |
| `systemctl is-active`     | Check running state |
| `systemctl is-enabled`    | Check boot status   |
| `systemctl --failed`      | Failed services     |
| `systemctl list-units`    | Running services    |

---

## Production Administration Workflow

```text
Service Issue

↓

systemctl status

↓

journalctl

↓

Configuration

↓

daemon-reload

↓

restart/reload

↓

Verify

↓

Monitor
```

Following a consistent workflow simplifies troubleshooting.

---

## Real-World Example

A Node.js API does not start automatically after a server reboot.

The administrator investigates:

Check boot status.

```bash
systemctl is-enabled node-api
```

Output:

```text
disabled
```

Enable startup.

```bash
sudo systemctl enable node-api
```

Start the service.

```bash
sudo systemctl start node-api
```

Verify.

```bash
systemctl status node-api
```

Output:

```text
Active: active (running)
```

The issue was caused by the service not being enabled during system boot.

---

## Best Practices

- Use `reload` instead of `restart` whenever supported.
- Run `daemon-reload` after modifying unit files.
- Keep custom services in `/etc/systemd/system/`.
- Monitor failed services regularly.
- Review journal logs before restarting services.
- Enable critical services to start automatically.
- Use meaningful service descriptions in custom unit files.
- Document custom systemd services.

---

## Common Mistakes

#### Forgetting `daemon-reload`

Changes to service files are ignored until systemd reloads its configuration.

---

#### Restarting Instead of Reloading

Restarting may interrupt active connections unnecessarily.

---

#### Ignoring Journal Logs

Most service failures can be diagnosed by reviewing `journalctl` output.

---

#### Creating Unit Files in the Wrong Location

Custom service definitions should be stored in `/etc/systemd/system/`, not in system-managed directories.

---

#### Forgetting to Enable the Service

A service that starts manually but not after reboot is often simply not enabled.

---

## Summary

`systemctl` is the primary interface for managing services with systemd. It provides commands to start, stop, restart, reload, enable, disable, inspect, and troubleshoot services, making it an essential tool for Linux administrators. Combined with `journalctl`, it offers powerful capabilities for monitoring and maintaining production servers.

---

### Next Chapter

➡️ **04 - PM2 Reference**
