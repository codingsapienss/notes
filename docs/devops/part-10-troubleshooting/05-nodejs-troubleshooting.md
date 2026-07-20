---
sidebar_label: Node.js Troubleshooting
sidebar_position: 5
---


# Node.js Troubleshooting

### Overview

A Node.js application can fail even when the Linux server, Nginx, and networking are functioning correctly.

Unlike infrastructure problems, Node.js issues usually originate from the application itself, such as:

- Programming errors
- Missing environment variables
- Database connection failures
- Memory leaks
- Infinite loops
- Dependency issues
- Port conflicts
- Unhandled exceptions

Understanding how to systematically troubleshoot Node.js applications is essential for maintaining reliable production systems.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Follow a structured Node.js troubleshooting workflow.
- Diagnose application startup failures.
- Investigate crashes and exceptions.
- Troubleshoot database connectivity.
- Identify memory leaks and CPU bottlenecks.
- Resolve dependency and configuration issues.
- Debug production applications efficiently.
- Apply production troubleshooting best practices.

---

## Node.js Request Flow

Understanding the request flow helps identify where failures occur.

```text id="node01"
Client

↓

Nginx

↓

PM2

↓

Node.js

↓

Business Logic

↓

Database

↓

Response
```

A failure at any stage may cause the application to return an error.

---

## Node.js Troubleshooting Workflow

Follow the same structured approach for every incident.

```text id="node02"
Problem Reported

↓

Check PM2

↓

Review Logs

↓

Check Environment

↓

Check Database

↓

Monitor Resources

↓

Identify Root Cause

↓

Fix

↓

Verify
```

Avoid making multiple changes simultaneously.

---

## Step 1 – Verify Application Status

Check whether the application is running.

```bash id="nodecmd01"
pm2 list
```

Example:

```text id="node03"
App Name

Status

api

online
```

If the application is offline or restarting repeatedly, investigate before attempting to restart it.

---

## Step 2 – Review Application Logs

Logs often contain the exact cause of an application failure.

View logs.

```bash id="nodecmd02"
pm2 logs
```

Or for a specific application:

```bash id="nodecmd03"
pm2 logs api
```

Example:

```text id="node04"
Error:

Cannot find module 'dotenv'
```

Logs should always be reviewed before modifying application code or configuration.

---

## Step 3 – Verify Environment Variables

Many production issues occur because required environment variables are missing or incorrect.

Example `.env`:

```text id="node05"
PORT=3000

MONGO_URI=...

JWT_SECRET=...
```

Verify:

- File exists.
- Variable names are correct.
- Values are correct.
- PM2 loads the updated environment after changes.

A missing environment variable can prevent an application from starting.

---

## Step 4 – Verify Dependencies

Applications may fail after deployment if dependencies are missing.

Install dependencies.

```bash id="nodecmd04"
npm install
```

Check installed packages.

```bash id="nodecmd05"
npm list
```

Example error:

```text id="node06"
Cannot find module
```

This usually indicates:

- Missing package
- Incorrect installation
- Corrupted `node_modules`

---

## Step 5 – Verify Database Connectivity

Many Node.js applications depend on databases.

Typical flow:

```text id="node07"
Node.js

↓

MongoDB

↓

Query

↓

Response
```

If the database cannot be reached:

- Verify connection string.
- Verify credentials.
- Verify database status.
- Verify firewall rules.
- Verify network connectivity.

---

## Step 6 – Check Listening Port

Verify that the application is listening.

```bash id="nodecmd06"
ss -tulpn
```

Example:

```text id="node08"
3000

LISTEN
```

If the application is not listening:

- Startup failed.
- Wrong port configured.
- Application crashed during initialization.

---

## Step 7 – Test the API Directly

Bypass Nginx and test the application.

```bash id="nodecmd07"
curl http://localhost:3000
```

Possible outcomes:

| Result             | Meaning                    |
| ------------------ | -------------------------- |
| 200 OK             | Application working        |
| Connection refused | Application not running    |
| Timeout            | Application hung           |
| 500 Error          | Internal application error |

Testing locally helps isolate Nginx from application issues.

---

## Step 8 – Monitor CPU Usage

High CPU usage often indicates inefficient code.

Monitor processes.

```bash id="nodecmd08"
top
```

or

```bash id="nodecmd09"
pm2 monit
```

Possible causes:

- Infinite loops
- Expensive computations
- Excessive synchronous processing
- High traffic

---

## Step 9 – Monitor Memory Usage

Gradually increasing memory usage may indicate a memory leak.

Example:

```text id="node09"
100 MB

↓

250 MB

↓

500 MB

↓

900 MB

↓

Crash
```

Monitor memory:

```bash id="nodecmd10"
pm2 monit
```

or

```bash id="nodecmd11"
free -h
```

Investigate applications that continuously consume more memory over time.

---

## Step 10 – Check Restart Count

Unexpected restarts often indicate instability.

```bash id="nodecmd12"
pm2 describe api
```

Example:

```text id="node10"
Restart Count:

18
```

Frequent restarts usually require further investigation rather than repeated restarts.

---

## Common Startup Errors

Typical startup failures include:

```text id="node11"
Module Not Found

↓

Application Stops
```

```text id="node12"
Port Already In Use

↓

Application Stops
```

```text id="node13"
Database Authentication Failed

↓

Startup Failed
```

These errors usually appear immediately in application logs.

---

## Port Conflict

If another process is already using the application's port:

```bash id="nodecmd13"
ss -tulpn | grep 3000
```

Example:

```text id="node14"
Port 3000

Already In Use
```

Resolve the conflict by:

- Stopping the conflicting process.
- Changing the application's port.
- Correcting the PM2 configuration.

---

## Unhandled Exceptions

Unhandled exceptions can terminate a Node.js process.

Example:

```javascript id="nodecode01"
throw new Error("Unexpected Error");
```

Without proper error handling:

```text id="node15"
Application

↓

Crash

↓

PM2 Restart
```

Applications should log exceptions and fail gracefully whenever possible.

---

## Debugging with Node.js

Run the application manually.

```bash id="nodecmd14"
node app.js
```

For debugging:

```bash id="nodecmd15"
node --inspect app.js
```

Running outside PM2 can simplify debugging during development or testing.

---

## Dependency Problems After Deployment

Common deployment issues include:

- Missing `node_modules`
- Different Node.js version
- Package-lock mismatch
- Missing build artifacts

Verify Node.js version.

```bash id="nodecmd16"
node -v
```

Verify npm version.

```bash id="nodecmd17"
npm -v
```

Ensure the production environment matches the application's requirements.

---

## Node.js Troubleshooting Decision Tree

```text id="node16"
Application Down

        │

        ▼

Running?

  │          │

 No         Yes

 │

Logs

 │

 ▼

Environment

 │

 ▼

Database

 │

 ▼

Resources

 │

 ▼

Fix
```

Following this sequence helps isolate the root cause efficiently.

---

## Useful Node.js Commands

| Command                 | Purpose                  |
| ----------------------- | ------------------------ |
| `pm2 list`              | Check application status |
| `pm2 logs`              | View logs                |
| `pm2 monit`             | Monitor CPU and memory   |
| `pm2 describe`          | View process details     |
| `node app.js`           | Run application manually |
| `node --inspect app.js` | Start debugger           |
| `npm install`           | Install dependencies     |
| `npm list`              | List installed packages  |
| `node -v`               | View Node.js version     |
| `ss -tulpn`             | View listening ports     |

---

## Production Troubleshooting Workflow

```text id="node17"
Application Failure

↓

PM2

↓

Logs

↓

Environment

↓

Dependencies

↓

Database

↓

Resources

↓

Fix

↓

Verify
```

This workflow minimizes unnecessary changes and speeds up diagnosis.

---

## Real-World Example

A production API begins returning **500 Internal Server Error** responses after a deployment.

The administrator investigates:

1. Checks PM2.

```bash id="nodecmd18"
pm2 list
```

The application is online.

2. Reviews the logs.

```bash id="nodecmd19"
pm2 logs api
```

The logs contain:

```text id="node18"
MongoServerError:

Authentication failed
```

3. Reviews the `.env` file and discovers that the production database password was changed during deployment.

4. Updates the `MONGO_URI` value.

5. Reloads the application.

```bash id="nodecmd20"
pm2 reload api
```

6. Tests the API locally.

```bash id="nodecmd21"
curl http://localhost:3000
```

The application returns:

```text id="node19"
HTTP/1.1 200 OK
```

The issue was caused by an incorrect environment variable rather than a problem with the application code.

---

## Best Practices

- Review application logs before restarting services.
- Keep environment variables synchronized across environments.
- Monitor CPU and memory continuously.
- Handle exceptions gracefully.
- Validate dependencies during deployment.
- Test APIs locally before investigating Nginx.
- Use PM2 monitoring to detect recurring issues.
- Investigate frequent restarts instead of simply restarting the application.
- Document root causes and resolutions.

---

## Common Mistakes

#### Restarting the Application Without Reading Logs

Restarting may temporarily restore service but rarely explains why the failure occurred.

---

#### Ignoring Environment Variables

Many production outages result from incorrect or missing configuration values.

---

#### Assuming Nginx Is the Problem

If Nginx returns a 502 or 500 error, the underlying issue often originates in the Node.js application.

---

#### Overlooking Database Connectivity

An unavailable database can make an otherwise healthy application appear broken.

---

#### Ignoring Memory Growth

A gradual increase in memory usage often indicates a memory leak that should be addressed before it causes repeated crashes.

---

## Summary

Node.js troubleshooting requires a systematic approach that begins with verifying the application's status, reviewing logs, checking environment variables, validating dependencies, confirming database connectivity, monitoring system resources, and identifying the root cause. By relying on evidence rather than assumptions, administrators can resolve production issues more efficiently and improve application reliability.

---

### Next Chapter

➡️ **06 - PM2 Troubleshooting**
