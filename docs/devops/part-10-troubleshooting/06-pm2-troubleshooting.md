---
sidebar_label: PM2 Troubleshooting
sidebar_position: 6
---


# PM2 Troubleshooting

### Overview

PM2 is one of the most widely used process managers for Node.js applications. It keeps applications running, restarts crashed processes, supports cluster mode, and provides monitoring capabilities.

However, PM2 itself can experience problems due to:

- Application crashes
- Restart loops
- Memory limit violations
- Incorrect ecosystem configuration
- Missing environment variables
- Startup configuration issues
- Cluster mode failures
- Permission problems

When an application managed by PM2 becomes unstable, administrators must determine whether the issue originates from PM2 or from the application it manages.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand common PM2 issues.
- Diagnose application restart loops.
- Troubleshoot startup failures.
- Resolve ecosystem configuration problems.
- Debug Cluster Mode.
- Monitor PM2 processes.
- Recover applications safely.
- Apply PM2 troubleshooting best practices.

---

## PM2 Architecture

PM2 sits between the operating system and the Node.js application.

```text id="pm2t01"
Linux

↓

PM2

↓

Node.js

↓

Application
```

If PM2 is healthy but the application fails, PM2 will attempt to restart it automatically.

---

## PM2 Troubleshooting Workflow

Always follow a structured workflow.

```text id="pm2t02"
Application Problem

↓

Check PM2 Status

↓

Check Logs

↓

Check Restart Count

↓

Verify Configuration

↓

Verify Application

↓

Fix

↓

Verify
```

Avoid restarting applications repeatedly without understanding why they are failing.

---

## Step 1 – Check PM2 Status

View all managed applications.

```bash id="pm2cmd01"
pm2 list
```

Example:

```text id="pm2t03"
App Name

Status

api

online
```

Possible statuses:

| Status          | Meaning           |
| --------------- | ----------------- |
| online          | Running normally  |
| stopped         | Manually stopped  |
| errored         | Failed to start   |
| launching       | Starting          |
| waiting restart | Restart scheduled |

Status information provides the first indication of the application's health.

---

## Step 2 – Review PM2 Logs

Logs contain valuable diagnostic information.

```bash id="pm2cmd02"
pm2 logs
```

Application-specific logs:

```bash id="pm2cmd03"
pm2 logs api
```

Example:

```text id="pm2t04"
Error:

EADDRINUSE

Port 3000 already in use
```

Always review logs before restarting applications.

---

## Step 3 – Check Restart Count

Repeated restarts indicate recurring failures.

```bash id="pm2cmd04"
pm2 describe api
```

Example:

```text id="pm2t05"
Restart Count

27
```

A high restart count usually indicates:

- Unhandled exceptions
- Memory leaks
- Invalid configuration
- Database failures

The restart count is often one of the quickest indicators of application instability.

---

## Restart Loop

Example:

```text id="pm2t06"
Start

↓

Crash

↓

Restart

↓

Crash

↓

Restart
```

This continuous cycle is called a **restart loop**.

Restart loops should be investigated immediately because they consume CPU resources and make applications unavailable.

---

## Step 4 – Verify Application

PM2 manages applications but does not fix application bugs.

Run the application manually.

```bash id="pm2cmd05"
node app.js
```

If the application also fails outside PM2, the problem lies in the application rather than PM2.

---

## Step 5 – Verify Environment Variables

PM2 loads environment variables when starting an application.

Typical issues:

- Missing `.env`
- Incorrect variable name
- Wrong database URL
- Invalid API keys

Example:

```text id="pm2t07"
PM2

↓

Environment Variables

↓

Application
```

Incorrect environment configuration is a common cause of startup failures.

---

## Step 6 – Verify Ecosystem Configuration

Many production deployments use an ecosystem configuration file.

Example:

```text id="pm2t08"
ecosystem.config.js
```

Common mistakes include:

- Wrong script path
- Incorrect working directory
- Invalid environment variables
- Wrong application name

Verify configuration carefully before restarting.

---

## Step 7 – Monitor Resource Usage

Launch the monitoring dashboard.

```bash id="pm2cmd06"
pm2 monit
```

Monitor:

- CPU
- Memory
- Restart count
- Process status

Resource trends often reveal issues before applications fail.

---

## Memory Limit Exceeded

Applications may restart because of memory limits.

Example:

```text id="pm2t09"
Application

↓

Memory Growth

↓

Limit Reached

↓

Restart
```

Possible causes:

- Memory leaks
- Large datasets
- Infinite object creation

Increasing the memory limit should not replace fixing memory leaks.

---

## High CPU Usage

Symptoms:

- Slow API responses
- High system load
- Increased response times

Possible causes:

- Infinite loops
- Expensive computations
- Blocking synchronous code

Monitor CPU using:

```bash id="pm2cmd07"
pm2 monit
```

or

```bash id="pm2cmd08"
top
```

---

## Cluster Mode Issues

Cluster Mode runs multiple workers.

```text id="pm2t10"
PM2

├── Worker 1

├── Worker 2

├── Worker 3

└── Worker 4
```

Common issues:

- One worker crashes repeatedly.
- Workers use excessive memory.
- Uneven traffic distribution.
- Shared state assumptions.

Each worker should be investigated independently.

---

## Startup Problems After Reboot

Applications may not restart after server reboot.

Verify startup configuration.

```bash id="pm2cmd09"
pm2 startup
```

Save process list.

```bash id="pm2cmd10"
pm2 save
```

Without these commands, PM2 may not automatically restore applications after reboot.

---

## Application Not Updating

Sometimes deployments appear successful but the old version continues running.

Reload the application.

```bash id="pm2cmd11"
pm2 reload api
```

If necessary:

```bash id="pm2cmd12"
pm2 restart api
```

Reloading is preferred because it minimizes downtime.

---

## Deleting and Recreating Processes

Occasionally, recreating a PM2 process resolves configuration inconsistencies.

Delete:

```bash id="pm2cmd13"
pm2 delete api
```

Start again:

```bash id="pm2cmd14"
pm2 start app.js --name api
```

This should only be done after understanding the reason for the failure.

---

## PM2 Troubleshooting Decision Tree

```text id="pm2t11"
Application Down

        │

        ▼

PM2 Running?

  │          │

 No         Yes

 │

Start PM2

 │

 ▼

Logs

 │

 ▼

Restart Count

 │

 ▼

Application

 │

 ▼

Configuration

 │

 ▼

Fix
```

This workflow helps distinguish PM2 problems from application problems.

---

## Common PM2 Errors

| Error                        | Possible Cause      |
| ---------------------------- | ------------------- |
| Restart loop                 | Application crash   |
| Script not found             | Incorrect file path |
| EADDRINUSE                   | Port conflict       |
| Module not found             | Missing dependency  |
| Out of memory                | Memory leak         |
| Environment variable missing | Configuration issue |
| Application offline          | Startup failure     |

---

## Useful PM2 Commands

| Command        | Purpose                      |
| -------------- | ---------------------------- |
| `pm2 list`     | View running applications    |
| `pm2 logs`     | View logs                    |
| `pm2 monit`    | Interactive monitoring       |
| `pm2 describe` | Detailed process information |
| `pm2 restart`  | Restart application          |
| `pm2 reload`   | Zero-downtime reload         |
| `pm2 delete`   | Remove process               |
| `pm2 save`     | Save process list            |
| `pm2 startup`  | Configure startup            |
| `pm2 status`   | View process status          |

---

## Production Troubleshooting Workflow

```text id="pm2t12"
Application Failure

↓

PM2 Status

↓

Logs

↓

Restart Count

↓

Environment

↓

Application

↓

Resources

↓

Fix

↓

Verify
```

A disciplined workflow helps reduce downtime and prevents unnecessary restarts.

---

## Real-World Example

A production API becomes unavailable every few hours.

The administrator investigates:

1. Checks PM2.

```bash id="pm2cmd15"
pm2 list
```

The application status is **online**, but the restart count is increasing.

2. Opens the monitoring dashboard.

```bash id="pm2cmd16"
pm2 monit
```

Memory usage steadily increases from **200 MB** to **1.8 GB**.

3. Reviews application logs.

```bash id="pm2cmd17"
pm2 logs api
```

No configuration or database errors are present.

4. Developers inspect the code and discover that uploaded file buffers are being retained in memory after processing.

5. The memory leak is fixed and the application is redeployed.

6. Over the next several days, memory usage remains stable and the restart count no longer increases.

The PM2 restart loop was a symptom; the root cause was a memory leak in the application.

---

## Best Practices

- Review logs before restarting applications.
- Investigate increasing restart counts immediately.
- Use `pm2 reload` for production deployments whenever possible.
- Monitor CPU and memory trends continuously.
- Save the PM2 process list after configuration changes.
- Configure PM2 to start automatically after system reboot.
- Validate ecosystem configuration before deployment.
- Treat restart loops as symptoms rather than solutions.
- Document production incidents and resolutions.

---

## Common Mistakes

#### Assuming PM2 Is the Problem

Most PM2 incidents are actually caused by application bugs, configuration errors, or resource exhaustion.

---

#### Ignoring Restart Counts

Frequent restarts are early warning signs of instability and should not be ignored.

---

#### Repeatedly Restarting the Application

Restarting may temporarily restore service without addressing the underlying cause.

---

#### Forgetting `pm2 save`

Without saving the process list, applications may not restart automatically after a server reboot.

---

#### Increasing Memory Limits Instead of Fixing Leaks

Allocating more memory may delay failures but does not resolve the underlying memory leak.

---

## Summary

PM2 troubleshooting focuses on determining whether an issue originates from the process manager or the application itself. By checking process status, logs, restart counts, environment variables, resource usage, and ecosystem configuration, administrators can efficiently diagnose production issues. A structured troubleshooting process ensures that recurring failures are resolved at their root cause rather than temporarily masked through repeated restarts.

---

### Next Chapter

➡️ **07 - Cloudflare Troubleshooting**
