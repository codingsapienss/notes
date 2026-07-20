---
sidebar_label: PM2 Reference
sidebar_position: 4
---


# PM2 Reference

### Overview

PM2 (Process Manager 2) is one of the most popular production process managers for Node.js applications. It ensures applications remain available by automatically restarting crashed processes, supporting zero-downtime reloads, clustering, monitoring, log management, and startup on system boot.

For many production Node.js deployments, PM2 acts as the bridge between the operating system and the application.

This chapter serves as a complete reference for the most commonly used PM2 commands, configuration options, and production workflows.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Start and manage Node.js applications using PM2.
- Monitor application health.
- Configure automatic startup.
- Manage logs efficiently.
- Use cluster mode.
- Perform zero-downtime deployments.
- Troubleshoot production applications.

---

## PM2 Architecture

```text
Internet

↓

Nginx

↓

PM2

├── App Instance 1
├── App Instance 2
├── App Instance 3
└── App Instance 4

↓

Node.js Application
```

PM2 manages one or more application instances while ensuring high availability.

---

## Installing PM2

Install globally using npm.

```bash
npm install -g pm2
```

Verify installation.

```bash
pm2 -v
```

---

## Starting an Application

Start a Node.js application.

```bash
pm2 start app.js
```

Start using a custom name.

```bash
pm2 start app.js --name api
```

Example output:

```text
┌────┬──────┬────────┬────────┐
│ id │ name │ status │ cpu    │
├────┼──────┼────────┼────────┤
│ 0  │ api  │ online │ 0%     │
└────┴──────┴────────┴────────┘
```

---

## Listing Applications

Display all managed processes.

```bash
pm2 list
```

Alternative:

```bash
pm2 ls
```

Typical columns:

| Column | Description              |
| ------ | ------------------------ |
| id     | Process ID inside PM2    |
| name   | Application name         |
| mode   | Fork or Cluster          |
| status | Online, Stopped, Errored |
| CPU    | CPU usage                |
| Memory | Memory usage             |

---

## Viewing Process Information

Display detailed information.

```bash
pm2 show api
```

or

```bash
pm2 describe api
```

Information includes:

- Status
- Restart count
- Uptime
- Script path
- Working directory
- Environment variables
- Log locations
- Memory usage

---

## Restarting Applications

Restart one application.

```bash
pm2 restart api
```

Restart by ID.

```bash
pm2 restart 0
```

Restart every application.

```bash
pm2 restart all
```

---

## Reloading Applications

Reload without dropping existing connections (cluster mode).

```bash
pm2 reload api
```

Reload all applications.

```bash
pm2 reload all
```

Reload should be preferred over restart for production cluster deployments whenever supported.

---

## Stopping Applications

Stop an application.

```bash
pm2 stop api
```

Stop all applications.

```bash
pm2 stop all
```

Stopped applications remain registered inside PM2.

---

## Deleting Applications

Remove an application from PM2.

```bash
pm2 delete api
```

Delete all applications.

```bash
pm2 delete all
```

Deleting removes the process from PM2's process list.

---

## Cluster Mode

Cluster mode utilizes multiple CPU cores.

```bash
pm2 start app.js -i max
```

Specify a fixed number of instances.

```bash
pm2 start app.js -i 4
```

Architecture:

```text
Nginx

↓

PM2 Cluster

├── Worker 1
├── Worker 2
├── Worker 3
└── Worker 4

↓

Node.js
```

Cluster mode improves throughput and fault tolerance.

---

## Monitoring Applications

Launch the monitoring dashboard.

```bash
pm2 monit
```

Displays:

- CPU usage
- Memory usage
- Restart count
- Active logs
- Running processes

---

## Viewing Logs

View logs for every application.

```bash
pm2 logs
```

View logs for a specific application.

```bash
pm2 logs api
```

Display only the last 100 lines.

```bash
pm2 logs api --lines 100
```

Flush log files.

```bash
pm2 flush
```

---

## Log Locations

Default log directory:

```text
~/.pm2/logs/
```

Typical files:

| File            | Purpose           |
| --------------- | ----------------- |
| `api-out.log`   | Standard output   |
| `api-error.log` | Error output      |
| `pm2.log`       | PM2 internal logs |

---

## Saving Process List

Save the current process configuration.

```bash
pm2 save
```

Purpose:

- Preserves running applications.
- Enables automatic restoration after reboot.

Workflow:

```text
Start Apps

↓

pm2 save

↓

Reboot

↓

Processes Restored
```

---

## Startup Script

Generate startup configuration.

```bash
pm2 startup
```

Typical output:

```text
Run the following command:

sudo env PATH=... pm2 startup systemd
```

Execute the generated command, then save the process list.

```bash
pm2 save
```

---

## Startup Workflow

```text
Boot

↓

systemd

↓

PM2

↓

Saved Processes

↓

Applications Online
```

---

## Environment Variables

Pass variables directly.

```bash
pm2 start app.js --env production
```

Or define them inside an ecosystem file.

---

## Ecosystem Configuration

Example:

```javascript
module.exports = {
  apps: [
    {
      name: "api",
      script: "app.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

Start using:

```bash
pm2 start ecosystem.config.js
```

This is the recommended approach for production deployments.

---

## Reload Ecosystem

```bash
pm2 reload ecosystem.config.js
```

Restart ecosystem.

```bash
pm2 restart ecosystem.config.js
```

---

## Memory Limit Restart

Automatically restart when memory exceeds a threshold.

```bash
pm2 start app.js --max-memory-restart 500M
```

Useful for protecting production servers from memory leaks.

---

## Watching Files

Automatically restart when files change.

```bash
pm2 start app.js --watch
```

Production recommendation:

```text
Development → Watch Enabled

Production → Watch Disabled
```

Watching files in production may trigger unnecessary restarts.

---

## Viewing PM2 Version

```bash
pm2 -v
```

Update PM2.

```bash
pm2 update
```

---

## Common PM2 Commands

| Command       | Purpose                      |
| ------------- | ---------------------------- |
| `pm2 start`   | Start application            |
| `pm2 stop`    | Stop application             |
| `pm2 restart` | Restart application          |
| `pm2 reload`  | Zero-downtime reload         |
| `pm2 delete`  | Remove application           |
| `pm2 list`    | List applications            |
| `pm2 monit`   | Resource monitoring          |
| `pm2 logs`    | View logs                    |
| `pm2 flush`   | Clear logs                   |
| `pm2 show`    | Detailed process information |
| `pm2 save`    | Save process list            |
| `pm2 startup` | Configure boot startup       |
| `pm2 update`  | Update PM2                   |

---

## PM2 Status Values

| Status            | Meaning                |
| ----------------- | ---------------------- |
| Online            | Running normally       |
| Stopped           | Manually stopped       |
| Errored           | Failed to start        |
| Launching         | Starting               |
| Waiting Restart   | Waiting before restart |
| One Launch Status | Startup phase          |

---

## Production Deployment Workflow

```text
Pull Latest Code

↓

npm install

↓

Build Application

↓

pm2 reload ecosystem.config.js

↓

Verify Logs

↓

Monitor
```

Reloading avoids unnecessary downtime during deployments.

---

## Real-World Example

A production API is returning **502 Bad Gateway** through Nginx.

The administrator performs the following investigation.

Check PM2.

```bash
pm2 list
```

Output:

```text
api

errored
```

Inspect the logs.

```bash
pm2 logs api --lines 50
```

Output:

```text
Error:

Cannot find module 'mongoose'
```

Dependencies were not installed after deployment.

Install dependencies.

```bash
npm install
```

Restart the application.

```bash
pm2 restart api
```

Verify.

```bash
pm2 list
```

Output:

```text
api

online
```

The upstream application is now reachable and Nginx returns normal responses.

---

## Best Practices

- Use meaningful application names.
- Prefer ecosystem configuration files for production.
- Use cluster mode for multi-core servers.
- Configure automatic startup using `pm2 startup`.
- Execute `pm2 save` after modifying running processes.
- Monitor CPU and memory usage regularly.
- Rotate or flush logs periodically.
- Use `reload` instead of `restart` for zero-downtime deployments when possible.
- Disable watch mode in production.
- Configure automatic memory restart limits for long-running applications.

---

## Common Mistakes

#### Forgetting `pm2 save`

Processes will not automatically restart after a reboot if they are not saved.

---

#### Not Configuring Startup

Applications that run manually but disappear after reboot usually lack a startup configuration.

---

#### Using Watch Mode in Production

Frequent file changes may cause unnecessary application restarts.

---

#### Ignoring Logs

Most PM2-related issues can be diagnosed quickly using `pm2 logs`.

---

#### Restarting Instead of Reloading

Restarting terminates existing processes before starting new ones, while reloading provides a smoother deployment experience in cluster mode.

---

## Summary

PM2 is a powerful production process manager that simplifies running, monitoring, and maintaining Node.js applications. Its capabilities—including automatic restarts, clustering, logging, monitoring, startup integration, and zero-downtime reloads—make it an essential tool for modern Node.js deployments. This reference chapter provides a centralized guide to the commands and workflows most commonly used in day-to-day production operations.

---

### Next Chapter

➡️ **05 - Git Reference**
