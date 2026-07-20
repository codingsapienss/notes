---
sidebar_label: Nginx Troubleshooting
sidebar_position: 4
---


# Nginx Troubleshooting

### Overview

Nginx is one of the most reliable web servers and reverse proxies, but production issues can still occur due to configuration mistakes, application failures, SSL problems, networking issues, or resource exhaustion.

When users report that a website is unavailable, slow, or returning unexpected errors, Nginx is often one of the first components administrators investigate.

Common problems include:

- Nginx not starting
- 502 Bad Gateway
- 504 Gateway Timeout
- 403 Forbidden
- 404 Not Found
- SSL errors
- Reverse proxy failures
- Incorrect server block configuration
- Permission issues

Understanding how Nginx processes requests makes troubleshooting much easier.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand common Nginx failures.
- Follow a structured troubleshooting workflow.
- Diagnose HTTP status code errors.
- Debug reverse proxy issues.
- Analyze Nginx logs.
- Resolve SSL-related problems.
- Validate configurations before deployment.
- Apply production troubleshooting best practices.

---

## Nginx Request Flow

Every request follows a sequence before reaching the application.

```text id="ngt01"
User

↓

DNS

↓

Cloudflare (Optional)

↓

Nginx

↓

Reverse Proxy

↓

Node.js

↓

Response
```

A failure at any stage affects the final response returned to the user.

---

## Nginx Troubleshooting Workflow

Always troubleshoot in a structured manner.

```text id="ngt02"
Website Issue

↓

Verify Website

↓

Check Nginx Service

↓

Validate Configuration

↓

Review Logs

↓

Check Reverse Proxy

↓

Check Application

↓

Fix

↓

Verify
```

Never modify configurations before understanding the actual problem.

---

## Step 1 – Verify the Problem

First, reproduce the issue.

Questions to answer:

- Is the website completely unavailable?
- Does every page fail?
- Is only one API affected?
- Which HTTP status code is returned?
- Did the problem start after a deployment?

Example:

```text id="ngt03"
Browser

↓

502 Bad Gateway
```

The status code provides an important clue about where to begin.

---

## Step 2 – Check Nginx Service

Verify that Nginx is running.

```bash id="ngtcmd01"
sudo systemctl status nginx
```

Expected output:

```text id="ngt04"
Active: active (running)
```

If the service has stopped:

```bash id="ngtcmd02"
sudo systemctl start nginx
```

Enable automatic startup.

```bash id="ngtcmd03"
sudo systemctl enable nginx
```

---

## Step 3 – Validate Configuration

Before restarting Nginx, always validate the configuration.

```bash id="ngtcmd04"
sudo nginx -t
```

Successful validation:

```text id="ngt05"
syntax is ok

test is successful
```

If errors appear, correct them before restarting.

Reload configuration safely.

```bash id="ngtcmd05"
sudo systemctl reload nginx
```

---

## Step 4 – Review Nginx Logs

Nginx provides two primary log files.

| Log        | Purpose                 |
| ---------- | ----------------------- |
| Access Log | Records client requests |
| Error Log  | Records server errors   |

View error log.

```bash id="ngtcmd06"
sudo tail -f /var/log/nginx/error.log
```

View access log.

```bash id="ngtcmd07"
sudo tail -f /var/log/nginx/access.log
```

The error log is often the fastest way to identify configuration or proxy issues.

---

## Step 5 – Verify Listening Ports

Ensure Nginx is listening on the expected ports.

```bash id="ngtcmd08"
ss -tulpn | grep nginx
```

Typical output:

```text id="ngt06"
0.0.0.0:80

0.0.0.0:443
```

If no listening ports appear, Nginx is not accepting requests.

---

## Step 6 – Test Locally

Test the web server from the server itself.

```bash id="ngtcmd09"
curl http://localhost
```

For HTTPS:

```bash id="ngtcmd10"
curl -k https://localhost
```

If localhost works but remote access fails, investigate networking or firewall issues.

---

## Step 7 – Verify Reverse Proxy

Many production deployments use Nginx as a reverse proxy.

Example:

```text id="ngt07"
User

↓

Nginx

↓

Node.js

↓

Response
```

If the backend application is unavailable, Nginx cannot forward requests correctly.

Verify the backend application.

```bash id="ngtcmd11"
pm2 list
```

Test the backend directly.

```bash id="ngtcmd12"
curl http://localhost:3000
```

---

## Understanding Common HTTP Errors

### 400 Bad Request

Possible causes:

- Invalid request
- Malformed headers
- Large request headers

---

### 403 Forbidden

Possible causes:

- Incorrect permissions
- Missing index file
- Access restrictions
- Incorrect root directory

Example:

```text id="ngt08"
User

↓

Nginx

↓

Permission Denied
```

---

### 404 Not Found

Possible causes:

- Incorrect location block
- Wrong document root
- Missing static file
- Incorrect routing

---

### 500 Internal Server Error

Usually indicates an application-side failure.

Possible causes:

- Application exceptions
- PHP-FPM failure
- Backend crash
- Misconfigured FastCGI

---

### 502 Bad Gateway

One of the most common production errors.

Flow:

```text id="ngt09"
User

↓

Nginx

↓

Node.js Offline

↓

502
```

Common causes:

- Backend application stopped
- Wrong proxy port
- PM2 application offline
- Application crash

Always verify the backend before modifying Nginx.

---

### 503 Service Unavailable

Possible causes:

- Backend overloaded
- Maintenance mode
- Resource exhaustion

---

### 504 Gateway Timeout

Flow:

```text id="ngt10"
User

↓

Nginx

↓

Node.js

↓

Slow Response

↓

504
```

Possible causes:

- Slow database
- Infinite loops
- Heavy processing
- Timeout configuration

---

## SSL Troubleshooting

Common SSL issues include:

- Expired certificate
- Incorrect certificate path
- Missing private key
- Certificate mismatch

Verify configuration.

```bash id="ngtcmd13"
sudo nginx -t
```

Verify HTTPS locally.

```bash id="ngtcmd14"
curl -I https://localhost -k
```

---

## File Permission Problems

Static websites often fail because Nginx cannot access files.

Verify permissions.

```bash id="ngtcmd15"
ls -l /var/www
```

Example:

```text id="ngt11"
Nginx

↓

Permission Denied

↓

403
```

---

## Firewall Verification

Even if Nginx is running, firewall rules may block access.

Ubuntu:

```bash id="ngtcmd16"
sudo ufw status
```

Verify that:

- Port 80 is allowed.
- Port 443 is allowed.

Cloud firewalls or security groups should also be checked.

---

## Configuration Verification Checklist

Before restarting Nginx, verify:

- Configuration syntax
- Correct server block
- Valid SSL paths
- Correct root directory
- Reverse proxy target
- Listening ports
- DNS configuration

This checklist prevents many production outages.

---

## Nginx Troubleshooting Decision Tree

```text id="ngt12"
Website Down

      │

      ▼

Nginx Running?

 │           │

No          Yes

│

Start Service

            │

            ▼

Configuration OK?

            │

            ▼

Backend Running?

            │

            ▼

Logs

            │

            ▼

Fix
```

---

## Useful Nginx Commands

| Command                   | Purpose                    |
| ------------------------- | -------------------------- |
| `systemctl status nginx`  | Check Nginx service        |
| `systemctl restart nginx` | Restart Nginx              |
| `systemctl reload nginx`  | Reload configuration       |
| `nginx -t`                | Validate configuration     |
| `tail -f error.log`       | View error log             |
| `tail -f access.log`      | View access log            |
| `curl localhost`          | Test locally               |
| `ss -tulpn`               | View listening ports       |
| `pm2 list`                | Verify backend application |

---

## Production Troubleshooting Workflow

```text id="ngt13"
Website Error

↓

HTTP Status

↓

Nginx Status

↓

Configuration

↓

Logs

↓

Backend

↓

Database

↓

Fix

↓

Verify
```

Following this workflow avoids unnecessary configuration changes.

---

## Real-World Example

Users begin reporting **502 Bad Gateway** errors after a new deployment.

The administrator investigates:

1. Opens the website and confirms the **502** response.
2. Checks Nginx.

```bash id="ngtcmd17"
sudo systemctl status nginx
```

Nginx is running.

3. Validates the configuration.

```bash id="ngtcmd18"
sudo nginx -t
```

Configuration is valid.

4. Tests the backend.

```bash id="ngtcmd19"
curl http://localhost:3000
```

The connection fails.

5. Checks PM2.

```bash id="ngtcmd20"
pm2 list
```

The Node.js application is offline.

6. Reviews PM2 logs.

```bash id="ngtcmd21"
pm2 logs
```

The application failed to start because of a missing environment variable introduced during deployment.

7. The environment variable is restored, the application is reloaded, and the website immediately begins returning **HTTP 200 OK**.

The root cause was the backend application, not Nginx.

---

## Best Practices

- Always validate the configuration using `nginx -t` before reloading.
- Check the backend application before modifying reverse proxy settings.
- Review the error log before restarting Nginx.
- Test services locally using `curl`.
- Monitor HTTP status codes during deployments.
- Use `reload` instead of `restart` whenever possible to avoid interrupting active connections.
- Keep backups of working Nginx configurations.
- Document configuration changes.

---

## Common Mistakes

#### Restarting Nginx Without Validation

An invalid configuration can prevent Nginx from starting.

---

#### Assuming Every 502 Error Is an Nginx Problem

Most 502 errors originate from the backend application rather than Nginx itself.

---

#### Ignoring Error Logs

The error log often identifies the exact configuration or runtime issue.

---

#### Forgetting Firewall Rules

Ports 80 and 443 may be blocked even though Nginx is functioning correctly.

---

#### Changing Multiple Configurations Simultaneously

Making several changes at once complicates troubleshooting and increases the risk of introducing new issues.

---

## Summary

Nginx troubleshooting requires a systematic approach that begins with verifying the reported issue, checking the Nginx service, validating the configuration, reviewing logs, confirming listening ports, testing the reverse proxy, and verifying backend application health. By following a structured workflow and relying on evidence rather than assumptions, administrators can efficiently resolve production web server issues while minimizing downtime.

---

### Next Chapter

➡️ **05 - Node.js Troubleshooting**
