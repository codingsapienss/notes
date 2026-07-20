---
sidebar_label: Real-World Production Debugging
sidebar_position: 9
---


# Real-World Production Debugging

### Overview

In previous chapters, you learned how to troubleshoot individual components such as Linux, networking, SSH, Nginx, Node.js, PM2, Cloudflare, and SSL.

In production environments, however, failures rarely occur in isolation.

A single incident may involve multiple components:

- DNS
- Cloudflare
- SSL
- Nginx
- PM2
- Node.js
- Database
- Operating System
- External APIs

Professional engineers do not rely on guesswork. Instead, they follow a structured debugging methodology to identify the true root cause while minimizing downtime.

This chapter combines everything learned throughout this handbook into real production debugging scenarios.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Approach production incidents systematically.
- Perform end-to-end debugging.
- Isolate failures quickly.
- Conduct root cause analysis (RCA).
- Differentiate symptoms from root causes.
- Restore services safely.
- Document production incidents.
- Apply debugging best practices used by experienced engineers.

---

## The Golden Rule of Production Debugging

The first reported problem is rarely the actual problem.

Example:

```text
User Reports

↓

Website Down

↓

502 Error

↓

Nginx

↓

Node.js

↓

Database

↓

Wrong Database Password
```

The visible error is only a symptom.

The objective of debugging is to identify the underlying cause.

---

## Production Debugging Workflow

Every production issue should follow the same process.

```text
Incident Reported

↓

Verify Issue

↓

Collect Information

↓

Determine Scope

↓

Identify Layer

↓

Investigate

↓

Find Root Cause

↓

Fix

↓

Verify

↓

Document
```

Following a consistent workflow reduces downtime and prevents unnecessary changes.

---

## Step 1 – Reproduce the Problem

Never begin troubleshooting based solely on someone else's description.

Questions to answer:

- Can the issue be reproduced?
- Does it affect all users?
- Does it affect one API?
- Is the issue intermittent?
- Did it begin after deployment?

Example:

```text
Customer

↓

Reports 502

↓

Administrator Confirms 502
```

Always verify the reported issue before making changes.

---

## Step 2 – Determine the Scope

Identify the impact.

Possible questions:

- One user or all users?
- One endpoint or the entire website?
- Production only?
- Staging also affected?
- Internal users only?

Example:

```text
Entire Website

↓

Likely Infrastructure

API Only

↓

Likely Application
```

Understanding the scope significantly narrows the investigation.

---

## Step 3 – Identify the Affected Layer

Determine where the failure occurs.

```text
Browser

↓

DNS

↓

Cloudflare

↓

Network

↓

Firewall

↓

Nginx

↓

PM2

↓

Node.js

↓

Database
```

Work through the layers one at a time.

---

## Step 4 – Gather Evidence

Never troubleshoot without evidence.

Collect:

- Application logs
- Nginx logs
- System logs
- PM2 logs
- Monitoring graphs
- Deployment history
- Recent configuration changes

Useful commands:

```bash
pm2 logs
```

```bash
sudo journalctl -xe
```

```bash
sudo tail -f /var/log/nginx/error.log
```

```bash
top
```

The goal is to understand what changed and when.

---

## Step 5 – Form a Hypothesis

After gathering evidence, form a possible explanation.

Example:

```text
High CPU

↓

Slow API

↓

Timeout

↓

504 Error
```

A hypothesis should be tested before making changes.

---

## Step 6 – Test One Change at a Time

Avoid changing multiple configurations simultaneously.

Incorrect approach:

```text
Restart PM2

↓

Restart Nginx

↓

Modify Firewall

↓

Update DNS

↓

No Idea What Fixed It
```

Correct approach:

```text
One Change

↓

Test

↓

Verify

↓

Next Change (if needed)
```

This makes the debugging process repeatable and understandable.

---

## Step 7 – Verify the Solution

Never assume the issue is resolved.

Verify:

- Website loads.
- APIs respond.
- Logs are clean.
- CPU returns to normal.
- Memory remains stable.
- Users confirm resolution.

Continue monitoring after the fix.

---

## Root Cause Analysis (RCA)

A production incident should conclude with a Root Cause Analysis.

Example format:

| Item       | Description                                     |
| ---------- | ----------------------------------------------- |
| Incident   | API unavailable                                 |
| Start Time | 09:05                                           |
| End Time   | 09:27                                           |
| Root Cause | Invalid environment variable                    |
| Resolution | Updated configuration and restarted application |
| Prevention | Deployment validation checklist                 |

RCA prevents recurring incidents.

---

## Case Study 1 – 502 Bad Gateway

### Incident

Users report **502 Bad Gateway**.

#### Investigation

```bash
curl http://localhost:3000
```

Fails.

Check PM2.

```bash
pm2 list
```

Application is offline.

Check logs.

```bash
pm2 logs
```

Output:

```text
Error:

Cannot find module 'dotenv'
```

#### Root Cause

A deployment skipped dependency installation.

#### Resolution

```bash
npm install
pm2 restart api
```

#### Lesson

Always install dependencies during deployment.

---

## Case Study 2 – Website Not Loading

### Incident

Users cannot access the website.

#### Investigation

Nginx:

```bash
sudo systemctl status nginx
```

Running.

Firewall:

```bash
sudo ufw status
```

Port **443** is blocked.

#### Resolution

```bash
sudo ufw allow 443
```

#### Lesson

Infrastructure changes should include firewall validation.

---

## Case Study 3 – Database Connection Failure

### Incident

Every API request returns **500 Internal Server Error**.

#### Investigation

Logs show:

```text
MongoServerError

Authentication Failed
```

Environment variable:

```text
MONGO_URI
```

Contains an outdated password.

#### Resolution

Update `.env`.

```bash
pm2 reload api
```

#### Lesson

Configuration changes require validation before deployment.

---

## Case Study 4 – High Memory Usage

### Incident

Application restarts every few hours.

#### Investigation

```bash
pm2 monit
```

Memory continuously increases.

Developers identify a memory leak caused by retaining uploaded file buffers in memory.

#### Resolution

Fix the application logic.

Deploy the updated version.

#### Lesson

Restarting applications is not a permanent solution for memory leaks.

---

## Case Study 5 – SSL Certificate Expired

### Incident

Users receive browser security warnings.

#### Investigation

```bash
openssl x509 -enddate -noout -in certificate.crt
```

Certificate expired.

Automatic renewal failed because port **80** was blocked.

#### Resolution

```bash
sudo ufw allow 80
sudo certbot renew
```

#### Lesson

Monitor certificate expiration proactively.

---

## Case Study 6 – Cloudflare Error 522

### Incident

Website displays **522 Connection Timed Out**.

#### Investigation

Cloudflare reaches the network but cannot establish a connection.

Server responds to `ping`.

Nginx is running.

Firewall blocks incoming HTTP traffic.

#### Resolution

```bash
sudo ufw allow 80
sudo ufw allow 443
```

#### Lesson

Always verify the origin firewall before assuming a Cloudflare issue.

---

## Case Study 7 – Deployment Failure

### Incident

Deployment completes successfully, but users still see the old application.

#### Investigation

PM2 process was never reloaded.

#### Resolution

```bash
pm2 reload api
```

#### Lesson

Successful code deployment does not automatically update running processes.

---

## Complete Production Debugging Flow

```text
Incident

↓

Reproduce

↓

Determine Scope

↓

Identify Layer

↓

Collect Logs

↓

Check Recent Changes

↓

Form Hypothesis

↓

Test

↓

Fix

↓

Verify

↓

Monitor

↓

Root Cause Analysis
```

This workflow can be applied to almost every production incident.

---

## Incident Checklist

| Check                 | Completed |
| --------------------- | --------- |
| Problem reproduced    | □         |
| Scope identified      | □         |
| Logs reviewed         | □         |
| Monitoring checked    | □         |
| Root cause identified | □         |
| Fix verified          | □         |
| Monitoring confirmed  | □         |
| RCA documented        | □         |

Using a checklist reduces the risk of missing important steps during high-pressure situations.

---

## Essential Debugging Commands

| Command                            | Purpose                 |
| ---------------------------------- | ----------------------- |
| `systemctl status nginx`           | Verify web server       |
| `pm2 list`                         | Verify application      |
| `pm2 logs`                         | Review application logs |
| `pm2 monit`                        | Monitor resources       |
| `journalctl -xe`                   | Review system logs      |
| `tail -f /var/log/nginx/error.log` | Review Nginx errors     |
| `ss -tulpn`                        | Check listening ports   |
| `curl http://localhost`            | Test local services     |
| `ping`                             | Verify connectivity     |
| `top`                              | Monitor CPU usage       |
| `free -h`                          | Monitor memory usage    |
| `df -h`                            | Check disk usage        |

---

## Production Debugging Mindset

Successful engineers follow these principles:

- Stay calm during incidents.
- Gather evidence before making changes.
- Treat symptoms and root causes separately.
- Change one thing at a time.
- Verify every fix.
- Communicate clearly with stakeholders.
- Document every production incident.
- Learn from every outage.

A disciplined approach consistently outperforms rushed troubleshooting.

---

## Best Practices

- Follow a standard debugging workflow for every incident.
- Review logs before restarting services.
- Correlate monitoring data with deployment history.
- Validate configuration changes before deployment.
- Use monitoring tools to detect issues early.
- Maintain detailed runbooks for common incidents.
- Perform Root Cause Analysis after every major outage.
- Conduct post-incident reviews to improve operational processes.

---

## Common Mistakes

#### Jumping Directly to a Restart

Restarting services may temporarily restore functionality but often hides the underlying issue.

---

#### Ignoring Recent Changes

Many production incidents occur shortly after deployments or configuration changes.

---

#### Changing Multiple Components Simultaneously

Making several changes at once makes it difficult to determine which action resolved the problem.

---

#### Confusing Symptoms with Root Causes

A 502 error, timeout, or high CPU usage is often a symptom rather than the underlying problem.

---

#### Skipping Root Cause Analysis

Resolving the immediate issue without understanding why it occurred increases the likelihood of future incidents.

---

## Summary

Real-world production debugging combines technical knowledge with a disciplined troubleshooting methodology. Rather than relying on assumptions, experienced engineers reproduce the issue, determine its scope, identify the affected layer, collect evidence, test hypotheses, implement targeted fixes, verify the solution, and document the root cause. This systematic approach minimizes downtime, improves reliability, and transforms production incidents into opportunities for continuous improvement.

---

### Next Chapter

➡️ **Part 11 – Reference Guide**
