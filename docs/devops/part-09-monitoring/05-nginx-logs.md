---
sidebar_label: Nginx Logs
sidebar_position: 5
---


# Nginx Logs

## Overview

Nginx is the first component that receives requests from users before forwarding them to your application.

Every request processed by Nginx generates valuable information that is written to log files. These logs help administrators understand:

- Who visited the server
- Which pages were requested
- Response status codes
- Client IP addresses
- Response times
- Server errors
- SSL problems
- Reverse proxy issues

Logs are one of the most important tools for troubleshooting production servers. When a website stops working, Nginx logs are often the first place administrators investigate.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand the purpose of Nginx logs.
- Differentiate between Access Logs and Error Logs.
- Locate Nginx log files.
- Monitor logs in real time.
- Filter logs efficiently.
- Analyze HTTP status codes.
- Troubleshoot common production issues.
- Apply logging best practices.

---

# What Are Nginx Logs?

Whenever Nginx receives a request, it records information about that request.

Example:

```text id="nglog01"
User

↓

Cloudflare

↓

Nginx

↓

Log File

↓

Node.js Application
```

Every request leaves a record that can later be analyzed.

---

# Why Nginx Logs Matter

Imagine users report:

- Website not loading
- Images missing
- APIs failing
- SSL certificate errors
- Slow page loads

Without logs:

```text id="nglog02"
Problem

↓

Guess

↓

Try Random Fixes
```

With logs:

```text id="nglog03"
Problem

↓

Read Logs

↓

Find Error

↓

Fix Problem
```

Logs eliminate guesswork.

---

# Types of Nginx Logs

Nginx primarily maintains two log files.

| Log        | Purpose                            |
| ---------- | ---------------------------------- |
| Access Log | Records every client request       |
| Error Log  | Records server errors and warnings |

Both logs are essential during troubleshooting.

---

# Access Log

The Access Log records every HTTP request handled by Nginx.

Information typically includes:

- Client IP
- Date and time
- HTTP method
- Requested URL
- Status code
- Response size
- Browser information

Example:

```text id="nglog04"
Client

↓

GET /

↓

200 OK

↓

Logged
```

---

# Default Access Log Location

On Ubuntu:

```text id="nglog05"
/var/log/nginx/access.log
```

View the log:

```bash id="ngcmd01"
cat /var/log/nginx/access.log
```

---

# Viewing Recent Requests

Display the last 20 entries.

```bash id="ngcmd02"
tail -20 /var/log/nginx/access.log
```

Monitor requests in real time.

```bash id="ngcmd03"
tail -f /var/log/nginx/access.log
```

`tail -f` is one of the most commonly used commands during production troubleshooting.

---

# Understanding Access Log Entries

Example entry:

```text id="nglog06"
192.168.1.10 - - [20/Jul/2026:10:25:31 +0000]

"GET /api/users HTTP/1.1"

200

512
```

Breakdown:

| Field      | Meaning               |
| ---------- | --------------------- |
| IP Address | Client IP             |
| Date       | Request time          |
| GET        | HTTP Method           |
| /api/users | Requested resource    |
| HTTP/1.1   | Protocol version      |
| 200        | Response status       |
| 512        | Response size (bytes) |

Every request follows this structure.

---

# Error Log

The Error Log records problems encountered by Nginx.

Examples include:

- Missing files
- Reverse proxy failures
- Permission issues
- SSL errors
- Configuration mistakes
- Backend connection failures

Example:

```text id="nglog07"
User

↓

Nginx

↓

Error

↓

error.log
```

---

# Default Error Log Location

On Ubuntu:

```text id="nglog08"
/var/log/nginx/error.log
```

View errors.

```bash id="ngcmd04"
cat /var/log/nginx/error.log
```

Monitor live errors.

```bash id="ngcmd05"
tail -f /var/log/nginx/error.log
```

---

# Common HTTP Status Codes

The Access Log records HTTP response codes.

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Resource Created      |
| 301  | Permanent Redirect    |
| 302  | Temporary Redirect    |
| 304  | Not Modified          |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |
| 504  | Gateway Timeout       |

Status codes quickly indicate the nature of a request outcome.

---

# Finding 404 Errors

Search for missing resources.

```bash id="ngcmd06"
grep "404" /var/log/nginx/access.log
```

Example:

```text id="nglog09"
GET /images/logo.png

404
```

This often indicates missing files or incorrect URLs.

---

# Finding 500 Errors

Search for internal server errors.

```bash id="ngcmd07"
grep "500" /var/log/nginx/access.log
```

500-series errors usually require investigation of both Nginx and the backend application.

---

# Searching Logs

Find requests containing a keyword.

```bash id="ngcmd08"
grep "login" /var/log/nginx/access.log
```

Search case-insensitively.

```bash id="ngcmd09"
grep -i "error" /var/log/nginx/error.log
```

Searching logs efficiently is an essential Linux administration skill.

---

# Counting Requests

Count total requests.

```bash id="ngcmd10"
wc -l /var/log/nginx/access.log
```

Count requests matching a pattern.

```bash id="ngcmd11"
grep "404" /var/log/nginx/access.log | wc -l
```

This helps measure the frequency of errors.

---

# Viewing Logs Page by Page

Large log files should not be opened using a text editor.

Instead, use:

```bash id="ngcmd12"
less /var/log/nginx/access.log
```

Useful navigation:

| Key   | Action        |
| ----- | ------------- |
| Space | Next page     |
| b     | Previous page |
| /     | Search        |
| q     | Quit          |

---

# Using awk

Extract specific fields.

Example:

```bash id="ngcmd13"
awk '{print $9}' /var/log/nginx/access.log
```

This prints HTTP status codes.

Another example:

```bash id="ngcmd14"
awk '{print $1}' /var/log/nginx/access.log
```

This prints client IP addresses.

---

# Log Monitoring Workflow

```text id="nglog10"
User Reports Problem

↓

Check Access Log

↓

Check Error Log

↓

Identify Cause

↓

Resolve Issue
```

---

# Nginx Logging Architecture

```text id="nglog11"
Users
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ├─────────────┐
   ▼             ▼
Access Log   Error Log
   │             │
   └──────┬──────┘
          ▼
Administrator
```

Logs provide visibility into every request reaching the web server.

---

# Common Errors Found in Error Logs

| Error                 | Possible Cause                      |
| --------------------- | ----------------------------------- |
| Permission denied     | Incorrect file permissions          |
| Connection refused    | Backend application not running     |
| No such file          | Missing resource                    |
| SSL certificate error | Incorrect certificate configuration |
| Upstream timed out    | Slow backend server                 |
| Host not found        | DNS or upstream configuration issue |

Recognizing these messages speeds up troubleshooting.

---

# Real-World Example

Users begin reporting **502 Bad Gateway** errors.

The administrator follows these steps:

1. Opens the Nginx Error Log.

```bash id="ngcmd15"
tail -f /var/log/nginx/error.log
```

2. Finds the message:

```text id="nglog12"
connect() failed (111: Connection refused)
```

3. Checks the Node.js application.

```bash id="ngcmd16"
pm2 status
```

4. Discovers that the backend application has stopped.

5. Restarts the application.

```bash id="ngcmd17"
pm2 restart app
```

6. Verifies that Nginx now forwards requests successfully.

The issue was resolved without modifying the Nginx configuration because the logs clearly identified the backend connection failure.

---

# Best Practices

- Monitor both Access and Error Logs.
- Use `tail -f` during live troubleshooting.
- Review recurring 4xx and 5xx errors.
- Rotate log files regularly.
- Archive old logs before deletion.
- Investigate repeated backend connection failures.
- Protect log files from unauthorized access.
- Correlate Nginx logs with application logs.

---

# Common Mistakes

### Checking Only the Access Log

Many production issues are recorded exclusively in the Error Log.

---

### Ignoring Repeated 404 Errors

Frequent 404 responses may indicate broken links, missing assets, or malicious scanning.

---

### Opening Huge Logs in a Text Editor

Large log files should be viewed using tools such as `tail`, `less`, `grep`, or `awk`.

---

### Deleting Logs Without Review

Log files contain valuable information for troubleshooting and auditing.

---

### Ignoring Backend Errors

A healthy Nginx server can still return errors if the backend application is unavailable.

---

# Summary

Nginx logs provide a detailed record of every request and every server-side issue encountered by the web server. By understanding Access Logs, Error Logs, HTTP status codes, and Linux log analysis tools such as `tail`, `grep`, `awk`, and `less`, administrators can quickly diagnose production issues and maintain reliable web services. Mastering Nginx logs is an essential skill for operating production Linux servers.

---

## Next Chapter

➡️ **06 - Node.js Logs**
