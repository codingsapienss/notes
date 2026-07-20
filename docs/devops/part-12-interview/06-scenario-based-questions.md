---
sidebar_label: Scenario-Based Interview Questions
sidebar_position: 6
---


# Scenario-Based Interview Questions

### Overview

Most experienced developers fail interviews **not because they don't know commands**, but because they cannot solve real production problems.

Senior interviews rarely ask:

> "What does `chmod` do?"

Instead, interviewers ask:

> "Your production server is down. How will you investigate?"

This chapter teaches a structured way of thinking through production incidents rather than memorizing solutions.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Solve production scenarios methodically.
- Explain your troubleshooting process.
- Demonstrate practical engineering thinking.
- Handle infrastructure-related interview questions.
- Communicate investigation steps clearly.

---

## Golden Rule of Production Debugging

Never guess.

Always investigate using evidence.

A common investigation flow is:

```text id="sc001"
Observe

↓

Collect Information

↓

Verify

↓

Find Root Cause

↓

Fix

↓

Verify Again

↓

Monitor
```

Interviewers generally evaluate your reasoning process more than whether your first hypothesis is correct.

---

## Universal Troubleshooting Framework

Use this order whenever possible:

```text id="sc002"
User

↓

Browser

↓

DNS

↓

Network

↓

Firewall

↓

Cloud

↓

Nginx

↓

Application

↓

Database

↓

Logs
```

Avoid skipping directly to restarting services unless there is a clear reason.

---

## Scenario 1

### Website is Down

**Question**

Users report that the website is not opening.

---

#### Investigation Flow

```text id="sc003"
Can Server Be Reached?

↓

Is DNS Correct?

↓

Is Port Open?

↓

Is Nginx Running?

↓

Is Node Running?

↓

Database Healthy?

↓

Logs
```

---

#### Commands

```bash id="sc004"
ping example.com
```

```bash id="sc005"
dig example.com
```

```bash id="sc006"
curl -I https://example.com
```

```bash id="sc007"
systemctl status nginx
```

```bash id="sc008"
pm2 list
```

```bash id="sc009"
ss -tulpn
```

---

#### Interview Answer

A strong answer demonstrates a layered investigation:

1. Verify whether the issue is global or user-specific.
2. Check DNS resolution.
3. Confirm the server is reachable.
4. Verify reverse proxy status.
5. Check the application process.
6. Review logs.
7. Confirm database connectivity.
8. Validate the fix before closing the incident.

---

## Scenario 2

### 502 Bad Gateway

**Question**

Users receive:

```text id="sc010"
502 Bad Gateway
```

---

#### Possible Causes

| Cause           | Description                     |
| --------------- | ------------------------------- |
| Backend stopped | Application not running         |
| Wrong port      | Proxy configuration mismatch    |
| Crash           | Backend terminated unexpectedly |
| Firewall        | Backend inaccessible            |
| Timeout         | Slow backend response           |

---

#### Investigation

```text id="sc011"
Nginx

↓

Backend

↓

Logs

↓

Port

↓

Database

↓

Resolved
```

---

#### Commands

```bash id="sc012"
systemctl status nginx
```

```bash id="sc013"
pm2 logs
```

```bash id="sc014"
ss -tulpn
```

```bash id="sc015"
curl http://localhost:3000
```

---

#### Interview Tip

Explain why you are checking each layer instead of listing commands without context.

---

## Scenario 3

### High CPU Usage

**Question**

Production CPU suddenly reaches 100%.

---

#### Investigation

```text id="sc016"
CPU

↓

top

↓

Process

↓

Logs

↓

Traffic

↓

Fix
```

---

#### Commands

```bash id="sc017"
top
```

```bash id="sc018"
htop
```

```bash id="sc019"
ps aux --sort=-%cpu
```

---

#### Possible Causes

- Infinite loop
- Traffic spike
- Heavy database queries
- Large file processing
- Resource-intensive background jobs

---

#### Interview Answer

Describe how you would identify the process first, determine whether the load is expected or abnormal, inspect application logs, and decide whether scaling or optimization is the appropriate response.

---

## Scenario 4

### High Memory Usage

**Question**

Memory usage continues increasing until the application crashes.

---

#### Investigation

```text id="sc020"
Memory

↓

Application

↓

Heap

↓

Logs

↓

Leak

↓

Restart

↓

Monitor
```

---

#### Possible Causes

- Memory leak
- Large cache
- Unreleased objects
- Too many concurrent requests
- Excessive buffering

---

#### Commands

```bash id="sc021"
free -h
```

```bash id="sc022"
top
```

```bash id="sc023"
pm2 monit
```

---

## Scenario 5

### Database Connection Failure

**Question**

Your API suddenly cannot connect to MongoDB.

---

#### Investigation

```text id="sc024"
Application

↓

Connection String

↓

Database

↓

Firewall

↓

Network

↓

Logs
```

---

#### Possible Causes

- Wrong credentials
- Database offline
- IP whitelist issue
- Firewall restrictions
- Expired certificates
- DNS problems

---

#### Verification

Check:

- Database status
- Connection string
- Environment variables
- Network connectivity
- Application logs

---

## Scenario 6

### SSL Certificate Error

**Question**

Users report browser security warnings.

---

#### Investigation

```text id="sc025"
DNS

↓

Certificate

↓

Nginx

↓

HTTPS

↓

Browser
```

---

#### Possible Causes

- Expired certificate
- Incorrect certificate path
- DNS mismatch
- Missing intermediate certificate
- Wrong server block

---

#### Interview Answer

Verify certificate validity, confirm domain resolution, inspect Nginx configuration, and test HTTPS after applying any changes.

---

## Scenario 7

### Website Loads Slowly

**Question**

Users report slow page loads.

---

#### Investigation

```text id="sc026"
Browser

↓

Network

↓

Nginx

↓

Node

↓

Database

↓

External APIs
```

---

#### Possible Causes

- Slow database queries
- Missing indexes
- Large API responses
- Blocking synchronous code
- Network latency
- High CPU usage

---

#### Useful Checks

- Response time
- Database query duration
- CPU utilization
- Memory usage
- External dependency latency

---

## Scenario 8

### Server Disk is Full

**Question**

Production disk usage reaches 100%.

---

#### Investigation

```text id="sc027"
Disk

↓

Logs

↓

Backups

↓

Temporary Files

↓

Cleanup

↓

Verify
```

---

#### Commands

```bash id="sc028"
df -h
```

```bash id="sc029"
du -sh /*
```

---

#### Common Causes

- Log growth
- Large uploads
- Backup accumulation
- Temporary files
- Core dumps

---

## Scenario 9

### Users Cannot Log In

**Question**

Authentication suddenly stops working.

---

#### Investigation

```text id="sc030"
Frontend

↓

API

↓

JWT

↓

Database

↓

Logs
```

---

#### Possible Causes

- Invalid JWT secret
- Expired tokens
- Database unavailable
- Incorrect credentials
- Clock synchronization issues
- Session storage problems

---

## Scenario 10

### Deployment Failed

**Question**

After deployment, the application no longer works.

---

#### Investigation

```text id="sc031"
Git

↓

Dependencies

↓

Environment Variables

↓

PM2

↓

Nginx

↓

Logs
```

---

#### Typical Checks

- Was the correct branch deployed?
- Were dependencies installed?
- Were migrations executed?
- Are environment variables present?
- Is the process running?
- Does Nginx point to the correct port?

---

## Scenario 11

### API Works Locally but Not Publicly

Possible causes:

- Firewall
- Security group
- Reverse proxy configuration
- Wrong listening address
- DNS issues
- SSL configuration

---

#### Investigation

```text id="sc032"
localhost

↓

Public IP

↓

Firewall

↓

Reverse Proxy

↓

Resolved
```

---

## Scenario 12

### Application Keeps Restarting

Possible causes:

- Crash loop
- Missing environment variables
- Unhandled exceptions
- Memory exhaustion
- Port conflicts

---

#### Investigation

```text id="sc033"
PM2

↓

Logs

↓

Crash

↓

Fix

↓

Restart

↓

Verify
```

---

## Scenario 13

### DNS is Not Working

Possible causes:

- Incorrect A record
- Nameserver propagation
- DNS cache
- Expired domain
- Incorrect CNAME

---

#### Investigation

```text id="sc034"
Domain

↓

DNS

↓

IP

↓

Server

↓

Application
```

---

## Scenario 14

### Cloud Server is Reachable but Website Isn't

Possible causes:

- Nginx stopped
- Application stopped
- Firewall
- Wrong DNS
- SSL configuration
- Incorrect reverse proxy

---

## Scenario 15

### One Server is Slow in a Cluster

Possible causes:

- High CPU
- High memory usage
- Disk bottleneck
- Network latency
- Uneven traffic distribution
- Hardware issues

---

## Architecture Design Questions

### Question

Design a production architecture for a Node.js application.

Expected explanation:

```text id="sc035"
Users

↓

Cloudflare

↓

Load Balancer

↓

Nginx

↓

PM2 Cluster

↓

Node.js

↓

Redis

↓

MongoDB

↓

Backups
```

Discuss:

- SSL termination
- Load balancing
- Session handling
- Caching
- Database security
- Monitoring
- Backup strategy

---

## Behavioral Production Questions

Interviewers may ask:

- Describe the biggest production issue you handled.
- Tell me about a deployment that failed.
- How do you respond when production goes down?
- Describe a difficult debugging session.
- How do you avoid repeating incidents?
- How do you verify a production fix?
- How do you communicate during an outage?

A strong response includes:

1. Situation
2. Investigation
3. Root cause
4. Resolution
5. Verification
6. Lessons learned

---

## What Interviewers Look For

| Quality                  | Why It Matters                  |
| ------------------------ | ------------------------------- |
| Structured thinking      | Prevents random troubleshooting |
| Communication            | Demonstrates collaboration      |
| Evidence-based debugging | Avoids assumptions              |
| Production awareness     | Shows operational maturity      |
| Verification             | Confirms successful fixes       |
| Root cause analysis      | Prevents recurring incidents    |

---

## Interview Tips

- Think aloud while solving scenarios.
- Explain each investigation step.
- State what evidence you expect to collect.
- Avoid restarting services without understanding the cause.
- Discuss trade-offs when multiple solutions exist.
- Verify every fix before concluding the issue is resolved.

---

## Common Mistakes

#### Guessing the Root Cause

Start with evidence instead of assumptions.

---

#### Skipping Layers

Investigate from the client toward the application rather than jumping directly to the backend.

---

#### Ignoring Logs

Logs often provide the fastest path to identifying failures.

---

#### Restarting Everything Immediately

Restarting may temporarily hide symptoms without addressing the underlying issue.

---

#### Forgetting Verification

Always confirm that the issue has been resolved and monitor the system afterward.

---

## Summary

Scenario-based interviews assess analytical thinking, production experience, and communication. Strong candidates investigate methodically, explain why each step is taken, verify their conclusions with evidence, and describe how they would prevent similar incidents in the future.

---

### Next Chapter

➡️ **07 - Production Case Studies**
