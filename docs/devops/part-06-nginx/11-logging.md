---
sidebar_label: Logging
sidebar_position: 11
---


# Logging

### Overview

A production server should never be treated as a "black box."

When something goes wrong, administrators need answers such as:

- Is the website receiving requests?
- Which pages are users visiting?
- Are clients receiving errors?
- Which IP addresses are making requests?
- Why did Nginx fail to start?
- Why are users seeing a **404** or **502 Bad Gateway** error?

The answers to these questions are found in **logs**.

Logging is one of the most important features of Nginx because it provides visibility into server activity, user requests, and application problems.

In this chapter, we will learn how Nginx logs requests and errors, where log files are stored, how to customize log formats, and how logs are used for monitoring and troubleshooting.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand why logging is important.
- Learn the difference between Access Logs and Error Logs.
- Locate Nginx log files.
- Configure custom log formats.
- Read and analyze log entries.
- Monitor logs in real time.
- Follow production logging best practices.

---

## Why Logging Matters

Imagine a user reports:

> "Your website is not working."

Without logs:

```text
User

↓

Problem Report

↓

Guess the Cause
```

With logs:

```text
User

↓

Problem Report

↓

Check Logs

↓

Identify Problem

↓

Fix Issue
```

Logs provide evidence of what actually happened instead of relying on assumptions.

---

## Types of Nginx Logs

Nginx primarily maintains two types of logs.

| Log Type   | Purpose                               |
| ---------- | ------------------------------------- |
| Access Log | Records every incoming request        |
| Error Log  | Records server and application errors |

These logs work together to help administrators understand server behavior.

---

## Access Log

The **Access Log** records information about every HTTP request handled by Nginx.

Typical information includes:

- Client IP address
- Request time
- Requested URL
- HTTP method
- HTTP status code
- Response size
- Browser information

Every successful or unsuccessful request can generate an access log entry.

---

## Error Log

The **Error Log** records problems encountered while processing requests.

Examples include:

- Configuration errors
- Missing files
- Permission issues
- Upstream server failures
- SSL problems
- Startup failures

Unlike the Access Log, the Error Log focuses on issues rather than normal traffic.

---

## Default Log Locations

On Ubuntu, the default log directory is:

```text
/var/log/nginx/
```

Common files:

```text
/var/log/nginx/

access.log

error.log
```

Verify:

```bash
ls -l /var/log/nginx
```

Example output:

```text
access.log

error.log
```

---

## Access Log Example

A sample access log entry:

```text
192.168.1.20 - - [20/Jul/2026:10:30:45 +0000] "GET /index.html HTTP/1.1" 200 1532 "-" "Mozilla/5.0"
```

Breakdown:

| Field          | Meaning               |
| -------------- | --------------------- |
| `192.168.1.20` | Client IP             |
| `GET`          | HTTP method           |
| `/index.html`  | Requested resource    |
| `HTTP/1.1`     | Protocol version      |
| `200`          | HTTP status code      |
| `1532`         | Response size (bytes) |
| `Mozilla/5.0`  | Browser User-Agent    |

---

## Error Log Example

Example:

```text
2026/07/20 10:45:20 [error] 2143#2143: *52 open() "/var/www/html/favicon.ico" failed (2: No such file or directory)
```

Explanation:

| Field         | Meaning                    |
| ------------- | -------------------------- |
| Date & Time   | When the error occurred    |
| Error Level   | Severity                   |
| Process ID    | Nginx process              |
| Error Message | Description of the problem |

---

## Logging Workflow

```text
Browser
     │
     ▼
Request
     │
     ▼
Nginx
     │
 ┌────┴─────┐
 │          │
 ▼          ▼
Access     Error?
Log         │
            ▼
        Error Log
```

Normal requests are written to the Access Log.

Problems are written to the Error Log.

---

## Configuring Access Logs

Basic configuration:

```nginx
server {

    access_log /var/log/nginx/access.log;

}
```

A custom location may also be specified.

Example:

```nginx
server {

    access_log /var/log/nginx/myapp_access.log;

}
```

This allows each application to maintain its own access log.

---

## Configuring Error Logs

Example:

```nginx
server {

    error_log /var/log/nginx/error.log;

}
```

Custom file:

```nginx
server {

    error_log /var/log/nginx/myapp_error.log;

}
```

---

## Error Log Levels

Nginx supports multiple logging levels.

```nginx
error_log /var/log/nginx/error.log warn;
```

Common levels:

| Level    | Purpose                        |
| -------- | ------------------------------ |
| `debug`  | Detailed debugging information |
| `info`   | Informational events           |
| `notice` | Normal but noteworthy events   |
| `warn`   | Warnings                       |
| `error`  | General errors                 |
| `crit`   | Critical issues                |
| `alert`  | Immediate action required      |
| `emerg`  | System unusable                |

Higher severity levels generate fewer log entries.

---

## Custom Log Format

Nginx allows custom access log formats.

Example:

```nginx
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" '
                  '$status '
                  '$body_bytes_sent '
                  '"$http_referer" '
                  '"$http_user_agent"';
```

Using the format:

```nginx
access_log /var/log/nginx/access.log custom;
```

This makes it possible to include only the information required for analysis.

---

## Common Log Variables

| Variable           | Description           |
| ------------------ | --------------------- |
| `$remote_addr`     | Client IP             |
| `$request`         | Complete HTTP request |
| `$status`          | HTTP response status  |
| `$request_method`  | GET, POST, etc.       |
| `$request_uri`     | Requested URI         |
| `$host`            | Requested hostname    |
| `$body_bytes_sent` | Bytes sent            |
| `$http_user_agent` | Browser details       |
| `$http_referer`    | Referring page        |

These variables can be combined to build custom log formats.

---

## Monitoring Logs in Real Time

View new log entries continuously:

```bash
sudo tail -f /var/log/nginx/access.log
```

Monitor errors:

```bash
sudo tail -f /var/log/nginx/error.log
```

Workflow:

```text
User Request

↓

Nginx

↓

Log Written

↓

tail -f Displays Update
```

This is especially useful during deployments and troubleshooting.

---

## Searching Logs

Find requests containing a keyword:

```bash
grep "login" /var/log/nginx/access.log
```

Find HTTP 404 responses:

```bash
grep "404" /var/log/nginx/access.log
```

Count requests:

```bash
wc -l /var/log/nginx/access.log
```

View the latest entries:

```bash
tail -20 /var/log/nginx/access.log
```

View the first entries:

```bash
head -20 /var/log/nginx/access.log
```

These standard Linux tools make log analysis much easier.

---

## Understanding HTTP Status Codes

Common status codes:

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
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |
| 504  | Gateway Timeout       |

Access logs make it easy to identify frequent error responses.

---

## Troubleshooting Example

Suppose users report:

```text
502 Bad Gateway
```

Request flow:

```text
Browser
     │
     ▼
Nginx
     │
     ▼
502 Error
```

Administrator checks:

```bash
sudo tail -f /var/log/nginx/error.log
```

Possible message:

```text
connect() failed (111: Connection refused) while connecting to upstream
```

This indicates that the backend application is unavailable or not accepting connections.

Logs significantly reduce troubleshooting time.

---

## Typical Production Logging

```text
Internet
     │
     ▼
Nginx
     │
 ┌────┴────┐
 ▼         ▼
Access   Error
 Log      Log
     │
     ▼
Monitoring Tools
```

Many organizations forward these logs to centralized logging platforms for long-term storage and analysis.

---

## Real-World Example

Suppose an e-commerce website suddenly experiences slow response times.

Administrators begin by checking:

```bash
sudo tail -f /var/log/nginx/access.log
```

They observe a large number of requests from a single IP address.

Next, they inspect:

```bash
sudo tail -f /var/log/nginx/error.log
```

and discover repeated upstream timeout errors.

The logs reveal that the backend application is overloaded. The team can then investigate the application, database, or infrastructure instead of guessing where the problem originated.

---

## Best Practices

- Keep separate access and error logs.
- Use meaningful custom log formats when needed.
- Monitor logs regularly.
- Rotate logs to prevent excessive disk usage.
- Protect log files with appropriate permissions.
- Avoid logging sensitive information such as passwords or authentication tokens.
- Archive logs for auditing and troubleshooting.
- Monitor recurring error patterns.

---

## Common Mistakes

#### Ignoring Error Logs

Many production issues can be diagnosed quickly by checking the error log first.

---

#### Logging Sensitive Information

Passwords, session tokens, API keys, and personal data should never appear in log files.

---

#### Allowing Logs to Grow Indefinitely

Large log files can consume disk space and impact server management. Configure log rotation.

---

#### Deleting Logs During Troubleshooting

Historical logs often contain valuable information for identifying the root cause of problems.

---

#### Forgetting to Monitor Logs

Logs are only useful if they are reviewed or monitored regularly.

---

## Summary

Logging provides essential visibility into the operation of an Nginx server. Access Logs record every request, while Error Logs capture problems encountered by the server. Together with custom log formats and Linux command-line tools such as `tail`, `grep`, `head`, and `wc`, logs become one of the most valuable resources for monitoring traffic, diagnosing failures, analyzing performance, and maintaining reliable production systems.

---

### Next Chapter

➡️ **12 - Common Configurations**
