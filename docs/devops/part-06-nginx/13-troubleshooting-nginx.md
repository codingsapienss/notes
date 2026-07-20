---
sidebar_label: Troubleshooting Nginx
sidebar_position: 13
---


# Troubleshooting Nginx

### Overview

No matter how carefully a server is configured, problems will eventually occur.

Examples include:

- Nginx refuses to start.
- The website returns **502 Bad Gateway**.
- Users see **404 Not Found**.
- SSL certificates stop working.
- Static files fail to load.
- The backend application becomes unreachable.
- File uploads fail.
- Pages become slow.

Knowing how to troubleshoot these issues systematically is one of the most valuable skills for a Linux administrator.

Rather than guessing, successful troubleshooting follows a structured process:

1. Identify the symptom.
2. Collect evidence.
3. Verify the configuration.
4. Check logs.
5. Test connectivity.
6. Confirm the fix.

This chapter focuses on practical techniques and common problems encountered in production Nginx deployments.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Follow a structured troubleshooting process.
- Verify Nginx configurations.
- Read Nginx logs.
- Diagnose common HTTP errors.
- Test backend connectivity.
- Troubleshoot SSL issues.
- Use common Linux debugging tools.
- Follow production troubleshooting best practices.

---

## Troubleshooting Workflow

A good troubleshooting process is repeatable.

```text id="m0fg2k"
Problem Report
      │
      ▼
Identify Symptoms
      │
      ▼
Check Configuration
      │
      ▼
Inspect Logs
      │
      ▼
Verify Backend
      │
      ▼
Test Fix
      │
      ▼
Monitor
```

Avoid making multiple unrelated changes at once.

---

## Step 1: Check Nginx Configuration

Before restarting or reloading Nginx, always validate the configuration.

```bash id="gx4vpa"
sudo nginx -t
```

Successful output:

```text id="b5gh7w"
syntax is ok

test is successful
```

Example error:

```text id="mjlwm4"
unexpected "}" in /etc/nginx/nginx.conf
```

Fix configuration errors before proceeding.

---

## Step 2: Check Nginx Status

Verify whether Nginx is running.

```bash id="kjlwm1"
sudo systemctl status nginx
```

Possible states:

| Status           | Meaning                   |
| ---------------- | ------------------------- |
| active (running) | Nginx is running normally |
| inactive         | Service is stopped        |
| failed           | Startup failed            |
| activating       | Service is starting       |

Start Nginx if necessary:

```bash id="jlwm01"
sudo systemctl start nginx
```

Restart:

```bash id="jlwm02"
sudo systemctl restart nginx
```

Reload configuration:

```bash id="jlwm03"
sudo systemctl reload nginx
```

---

## Step 3: Check Error Logs

Most problems are recorded in the Error Log.

Monitor continuously:

```bash id="jlwm04"
sudo tail -f /var/log/nginx/error.log
```

Example:

```text id="jlwm05"
connect() failed (111: Connection refused)
```

This often indicates that the upstream application is unavailable.

---

## Step 4: Check Access Logs

Verify whether requests are reaching Nginx.

```bash id="jlwm06"
sudo tail -f /var/log/nginx/access.log
```

Example:

```text id="jlwm07"
GET / HTTP/1.1 200
```

Repeated error codes such as **404**, **500**, or **502** provide useful clues.

---

## Step 5: Verify Backend Application

Suppose Nginx proxies requests to:

```text id="jlwm08"
localhost:3000
```

Test the backend directly:

```bash id="jlwm09"
curl http://localhost:3000
```

If the backend does not respond:

```text id="jlwm10"
Connection Refused
```

the issue is likely with the application rather than Nginx.

---

## Step 6: Verify Listening Ports

Check whether Nginx is listening on the expected ports.

```bash id="jlwm11"
sudo ss -tulpn
```

Typical output:

```text id="jlwm12"
80

443
```

Verify backend ports:

```text id="jlwm13"
3000

5000
```

If a required port is missing, investigate the corresponding service.

---

## Common Error: 404 Not Found

Meaning:

The requested resource does not exist or cannot be located.

Workflow:

```text id="jlwm14"
Browser
     │
     ▼
Nginx
     │
404
```

Common causes:

- Incorrect `root`
- Incorrect `alias`
- Missing file
- Incorrect `location`
- Typographical errors in URLs

Check:

```bash id="jlwm15"
ls -l /var/www/html
```

Verify that the requested file exists.

---

## Common Error: 403 Forbidden

Meaning:

The server found the resource but refused access.

Common causes:

- Incorrect file permissions
- Incorrect directory permissions
- Missing read permissions
- Restricted configuration

Verify permissions:

```bash id="jlwm16"
ls -ld /var/www/html
```

View file ownership:

```bash id="jlwm17"
ls -l /var/www/html
```

---

## Common Error: 500 Internal Server Error

Meaning:

An unexpected server-side problem occurred.

Possible causes:

- Application errors
- Incorrect configuration
- Script failures
- Permission problems

Start with:

```bash id="jlwm18"
sudo tail -f /var/log/nginx/error.log
```

Then inspect the backend application's logs.

---

## Common Error: 502 Bad Gateway

One of the most common production errors.

Architecture:

```text id="jlwm19"
Browser
     │
     ▼
Nginx
     │
     ▼
Node.js
```

Error:

```text id="jlwm20"
502 Bad Gateway
```

Possible causes:

- Backend application stopped
- Incorrect `proxy_pass`
- Wrong port
- Backend crashed
- Firewall restrictions

Verify backend:

```bash id="jlwm21"
curl http://localhost:3000
```

If the application is managed by PM2:

```bash id="jlwm22"
pm2 status
```

Restart if necessary:

```bash id="jlwm23"
pm2 restart all
```

---

## Common Error: 503 Service Unavailable

Meaning:

The server is temporarily unable to process requests.

Possible causes:

- Backend overloaded
- Maintenance mode
- Resource exhaustion

Check:

```bash id="jlwm24"
top
```

Memory:

```bash id="jlwm25"
free -h
```

Disk:

```bash id="jlwm26"
df -h
```

---

## Common Error: SSL Problems

Users may receive browser warnings.

Common causes:

- Expired certificate
- Incorrect certificate path
- Incorrect private key
- Domain mismatch

Verify certificates:

```bash id="jlwm27"
sudo certbot certificates
```

Renew:

```bash id="jlwm28"
sudo certbot renew
```

Test renewal:

```bash id="jlwm29"
sudo certbot renew --dry-run
```

---

## Common Error: Port Already in Use

Example:

```text id="jlwm30"
bind() to 0.0.0.0:80 failed
```

Identify the process:

```bash id="jlwm31"
sudo ss -tulpn | grep :80
```

or

```bash id="jlwm32"
sudo lsof -i :80
```

Another application may already be using the port.

---

## Common Error: Permission Denied

Example:

```text id="jlwm33"
Permission denied
```

Possible causes:

- Incorrect ownership
- Incorrect file permissions
- Restricted directories

Check:

```bash id="jlwm34"
ls -l
```

Ownership:

```bash id="jlwm35"
sudo chown -R www-data:www-data /var/www/html
```

Permissions:

```bash id="jlwm36"
sudo chmod -R 755 /var/www/html
```

Always ensure permission changes are appropriate for your environment.

---

## Checking DNS

If the website is unreachable:

```text id="jlwm37"
example.com
```

Verify DNS:

```bash id="jlwm38"
dig example.com
```

or

```bash id="jlwm39"
nslookup example.com
```

Ensure the domain resolves to the correct server IP.

---

## Checking Firewall

Verify firewall rules:

```bash id="jlwm40"
sudo ufw status
```

Expected:

```text id="jlwm41"
80

443
```

should be allowed for incoming traffic.

---

## Testing from the Server

Test locally:

```bash id="jlwm42"
curl http://localhost
```

Test HTTPS:

```bash id="jlwm43"
curl -I https://localhost
```

Testing locally helps determine whether the issue is with Nginx itself or an external networking component.

---

## Useful Linux Commands

| Command                  | Purpose                |
| ------------------------ | ---------------------- |
| `nginx -t`               | Validate configuration |
| `systemctl status nginx` | Check service status   |
| `tail -f`                | Monitor logs           |
| `curl`                   | Test HTTP responses    |
| `ss -tulpn`              | View listening ports   |
| `top`                    | Monitor CPU usage      |
| `free -h`                | Check memory           |
| `df -h`                  | Check disk usage       |
| `dig`                    | Verify DNS             |
| `ufw status`             | Check firewall rules   |

---

## Complete Troubleshooting Flow

```text id="jlwm44"
Website Problem
       │
       ▼
nginx -t
       │
       ▼
Service Status
       │
       ▼
Error Log
       │
       ▼
Access Log
       │
       ▼
Backend Test
       │
       ▼
Ports
       │
       ▼
Firewall
       │
       ▼
DNS
       │
       ▼
Resolved
```

Following the same sequence reduces the chances of overlooking the actual cause.

---

## Real-World Example

Suppose users report:

```text id="jlwm45"
https://example.com

↓

502 Bad Gateway
```

An administrator investigates:

1. Validate configuration:

```bash id="jlwm46"
sudo nginx -t
```

Configuration is valid.

2. Check service:

```bash id="jlwm47"
sudo systemctl status nginx
```

Nginx is running.

3. Test backend:

```bash id="jlwm48"
curl http://localhost:3000
```

No response.

4. Check PM2:

```bash id="jlwm49"
pm2 status
```

The Node.js application has stopped.

5. Restart application:

```bash id="jlwm50"
pm2 restart all
```

6. Verify:

```bash id="jlwm51"
curl http://localhost:3000
```

The application responds successfully.

The problem was not Nginx itself—it was the unavailable backend application.

---

## Best Practices

- Always validate configurations before reloading Nginx.
- Read the Error Log before making configuration changes.
- Test backend services independently.
- Change only one thing at a time during troubleshooting.
- Keep backups of working configurations.
- Monitor CPU, memory, and disk usage.
- Document recurring issues and their solutions.
- Verify fixes after deployment.

---

## Common Mistakes

#### Restarting Services Without Investigation

Restarting may temporarily hide the issue without identifying the root cause.

---

#### Ignoring Error Logs

Most production problems leave useful information in the Error Log.

---

#### Assuming Nginx Is Always the Problem

Many "Nginx" issues are actually caused by backend applications, databases, DNS, or firewall configuration.

---

#### Changing Multiple Settings Simultaneously

Making many changes at once makes it difficult to determine which one resolved—or introduced—the problem.

---

#### Skipping Configuration Validation

Never reload Nginx without first running:

```bash id="jlwm52"
sudo nginx -t
```

---

## Summary

Troubleshooting Nginx requires a structured approach rather than trial and error. Begin by validating the configuration, checking the service status, reviewing access and error logs, verifying backend connectivity, inspecting listening ports, and confirming DNS and firewall settings. Most production issues—including 404, 403, 500, 502, and SSL-related problems—can be diagnosed efficiently using this workflow. Developing a consistent troubleshooting process reduces downtime, improves reliability, and makes production systems significantly easier to maintain.

---
