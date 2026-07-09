---
sidebar_label: PM2 Deployment
sidebar_position: 7
---


# PM2 Deployment

## Overview

In the previous chapter, we secured our application using HTTPS and configured Nginx to serve requests securely.

At this point, our application can be started manually.

Example:

```bash id="pm201"
node app.js
```

or

```bash id="pm202"
npm start
```

Although this works, it is **not suitable for production**.

Problems with manual execution:

- Application stops if the terminal is closed.
- Application does not restart after a crash.
- Server reboot stops the application.
- No centralized log management.
- No process monitoring.

This is where **PM2** becomes essential.

PM2 is a production-grade process manager for Node.js applications. It keeps applications running continuously, automatically restarts them after failures, manages logs, and supports zero-downtime deployments.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand why PM2 is needed.
- Start Node.js applications using PM2.
- Manage running applications.
- Configure automatic startup.
- Monitor applications.
- View logs.
- Understand cluster mode at a high level.
- Prepare applications for zero-downtime deployment.

---

# What is PM2?

PM2 is a process manager designed for Node.js applications.

Instead of running:

```text id="pm203"
Terminal

↓

node app.js
```

you run:

```text id="pm204"
PM2

↓

Node.js Application
```

PM2 manages the application's lifecycle.

---

# Why Use PM2?

Without PM2:

```text id="pm205"
Application Crash

↓

Stopped
```

With PM2:

```text id="pm206"
Application Crash

↓

PM2

↓

Automatic Restart
```

This improves application availability without requiring manual intervention.

---

# PM2 in Production

Typical architecture:

```text id="pm207"
Users

↓

Cloudflare

↓

Nginx

↓

PM2

↓

Node.js
```

PM2 sits between the operating system and the Node.js process, ensuring that the application continues running reliably.

---

# Starting an Application

Start an application directly.

```bash id="pm203"
pm2 start app.js
```

PM2 launches the application in the background.

---

# Starting with a Name

Assign a meaningful name.

```bash id="pm204"
pm2 start app.js --name ecommerce-api
```

Example:

```text id="pm208"
PM2

↓

ecommerce-api
```

Meaningful names simplify administration when multiple applications run on the same server.

---

# Starting an npm Application

Many projects use npm scripts.

Example:

```bash id="pm205"
pm2 start npm --name ecommerce -- start
```

PM2 executes the `start` script defined in `package.json`.

---

# Viewing Running Applications

List managed applications.

```bash id="pm206"
pm2 list
```

Typical information displayed:

| Field         | Description                  |
| ------------- | ---------------------------- |
| Name          | Application name             |
| Status        | Online, stopped, errored     |
| CPU           | CPU usage                    |
| Memory        | Memory usage                 |
| Uptime        | Running duration             |
| Restart Count | Number of automatic restarts |

---

# Application Status

PM2 continuously monitors process state.

```text id="pm209"
Running

↓

Monitoring

↓

Healthy
```

If an application crashes:

```text id="pm210"
Crash

↓

PM2 Restart

↓

Running Again
```

---

# Restarting an Application

Restart an application.

```bash id="pm207"
pm2 restart ecommerce-api
```

Use this after configuration changes or updates that require a full restart.

---

# Reloading an Application

Reload an application.

```bash id="pm208"
pm2 reload ecommerce-api
```

Reloading is especially useful when running in cluster mode because it can update the application with minimal interruption.

---

# Stopping an Application

Stop an application.

```bash id="pm209"
pm2 stop ecommerce-api
```

The application remains registered with PM2 but is no longer running.

---

# Deleting an Application

Remove it from PM2.

```bash id="pm210"
pm2 delete ecommerce-api
```

The process is removed from PM2's process list.

---

# Viewing Logs

Display application logs.

```bash id="pm211"
pm2 logs ecommerce-api
```

Logs help diagnose:

- Startup failures
- Runtime exceptions
- Database connection issues
- Unexpected application behavior

---

# Monitoring Applications

PM2 provides a built-in monitoring interface.

```bash id="pm212"
pm2 monit
```

Example:

```text id="pm211"
CPU Usage

Memory Usage

Restart Count

Status
```

Monitoring helps identify performance issues before they affect users.

---

# Saving the Process List

After configuring applications:

```bash id="pm213"
pm2 save
```

Workflow:

```text id="pm212"
Running Processes

↓

pm2 save

↓

Saved Configuration
```

This stores the current PM2 process list.

---

# Starting Applications After Reboot

Generate the startup configuration.

```bash id="pm214"
pm2 startup
```

PM2 displays a command similar to:

```bash id="pm215"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

Run the generated command.

Result:

```text id="pm213"
Server Reboot

↓

PM2 Starts

↓

Applications Start Automatically
```

Without this configuration, applications will not restart automatically after a system reboot.

---

# PM2 Ecosystem File

For larger projects, PM2 supports ecosystem configuration files.

Example:

```javascript id="pm216"
module.exports = {
  apps: [
    {
      name: "ecommerce-api",
      script: "app.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

Start the application.

```bash id="pm217"
pm2 start ecosystem.config.js
```

An ecosystem file centralizes deployment configuration.

---

# PM2 and Environment Variables

PM2 loads environment variables before starting the application.

```text id="pm214"
.env

↓

PM2

↓

Node.js
```

This ensures the application starts with the correct production configuration.

---

# PM2 and Nginx

Production request flow:

```text id="pm215"
Users

↓

Cloudflare

↓

Nginx

↓

PM2

↓

Node.js
```

Nginx forwards requests to the application managed by PM2.

---

# PM2 Deployment Workflow

```text id="pm216"
Clone Repository

↓

npm install

↓

Configure .env

↓

pm2 start

↓

Test

↓

pm2 save

↓

pm2 startup
```

This prepares the application for long-term production operation.

---

# Deployment Verification Checklist

| Check                   | Expected Result |
| ----------------------- | --------------- |
| Application Running     | ✓               |
| PM2 Status Online       | ✓               |
| Logs Accessible         | ✓               |
| Monitoring Working      | ✓               |
| Process Saved           | ✓               |
| Auto Startup Configured | ✓               |

---

# Real-World Example

Suppose a company deploys an Express.js application on an Ubuntu server.

The deployment engineer:

1. Clones the latest source code.
2. Installs project dependencies.
3. Configures the production `.env` file.
4. Starts the application using:

```bash id="pm218"
pm2 start app.js --name ecommerce-api
```

5. Confirms the process is online using `pm2 list`.
6. Verifies application logs.
7. Runs `pm2 save`.
8. Configures automatic startup using `pm2 startup`.

If the server reboots or the application crashes unexpectedly, PM2 automatically restores the application without manual intervention.

---

# Best Practices

- Give every application a descriptive PM2 name.
- Save the process list after deployment.
- Configure automatic startup after server reboots.
- Monitor CPU and memory usage regularly.
- Review logs after every deployment.
- Store deployment configuration in an ecosystem file for larger projects.
- Use `reload` when appropriate to minimize service interruption.

---

# Common Mistakes

### Running Applications with `node app.js` in Production

Applications started directly from the terminal stop when the session ends or the process crashes.

---

### Forgetting `pm2 save`

Without saving the process list, PM2 may not restore applications after a reboot.

---

### Ignoring Logs

Application logs often provide the quickest way to diagnose deployment failures or runtime errors.

---

### Using Generic Process Names

Names such as `app` or `server` become confusing when managing multiple applications.

---

### Forgetting Automatic Startup

Installing PM2 alone does not ensure applications restart after a system reboot. The startup service must also be configured.

---

# Summary

PM2 is a production-grade process manager that keeps Node.js applications running reliably. It automatically restarts crashed processes, manages logs, provides monitoring tools, and restores applications after server reboots. By starting applications through PM2, saving the process list, and configuring automatic startup, administrators can significantly improve the reliability and maintainability of production deployments.

---

## Next Chapter

➡️ **08 - Zero Downtime Deployment**
