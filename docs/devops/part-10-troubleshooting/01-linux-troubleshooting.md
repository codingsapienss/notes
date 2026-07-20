---
sidebar_label: Linux Troubleshooting
sidebar_position: 1
---


# Linux Troubleshooting

### Overview

No production server runs perfectly forever. Regardless of how well a system is configured, problems eventually occur due to software bugs, hardware failures, configuration changes, resource exhaustion, network issues, or human error.

A skilled Linux administrator is not defined by how rarely problems occur, but by **how quickly and accurately those problems are diagnosed and resolved**.

Troubleshooting is the process of:

- Identifying a problem
- Collecting evidence
- Finding the root cause
- Applying a solution
- Verifying the fix
- Preventing the issue from recurring

A structured troubleshooting process prevents guesswork and minimizes downtime.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand the Linux troubleshooting process.
- Follow a systematic debugging methodology.
- Identify common production issues.
- Collect diagnostic information.
- Use essential troubleshooting commands.
- Perform root cause analysis.
- Validate fixes before closing incidents.
- Follow production troubleshooting best practices.

---

## What is Troubleshooting?

Troubleshooting is the systematic process of discovering **why something is not working as expected**.

Example:

```text id="lts01"
Problem

↓

Investigation

↓

Root Cause

↓

Solution

↓

Verification
```

The goal is not simply to restart services until they work again. The goal is to understand **why** the failure occurred.

---

## Reactive vs Proactive Troubleshooting

| Reactive                      | Proactive                          |
| ----------------------------- | ---------------------------------- |
| Fix problems after they occur | Prevent problems before they occur |
| Triggered by incidents        | Triggered by monitoring            |
| Usually urgent                | Usually planned                    |
| May cause downtime            | Reduces downtime                   |

A good administrator combines both approaches.

---

## The Troubleshooting Mindset

When a production issue occurs:

**Do Not**

- Panic
- Guess the cause
- Randomly restart services
- Change multiple configurations at once

Instead:

- Observe
- Gather information
- Analyze evidence
- Form a hypothesis
- Test carefully
- Verify the outcome

This disciplined approach reduces the risk of making the situation worse.

---

## Standard Troubleshooting Workflow

Every production issue should follow a consistent workflow.

```text id="lts02"
Problem Reported

↓

Confirm Problem

↓

Collect Information

↓

Identify Root Cause

↓

Apply Fix

↓

Verify

↓

Document
```

Following the same process for every incident improves consistency and reduces mistakes.

---

## Step 1 – Confirm the Problem

Before making any changes, verify that the reported issue actually exists.

Questions to ask:

- What exactly is failing?
- When did it begin?
- Is the issue reproducible?
- Does it affect all users or only some?
- Did anything change recently?

Example:

```text id="lts03"
User Says:

Website is Down

↓

Verify

↓

Website Returns 502 Error
```

Never rely solely on user reports.

---

## Step 2 – Collect Information

Collect as much information as possible before making changes.

Useful information includes:

- Error messages
- Log files
- Running services
- CPU usage
- Memory usage
- Disk usage
- Network status
- Recent deployments
- Recent configuration changes

Example:

```text id="lts04"
Problem

↓

Logs

↓

Metrics

↓

Configuration

↓

Evidence
```

Good troubleshooting begins with good evidence.

---

## Step 3 – Check System Health

Always verify the overall health of the server.

Useful commands:

```bash id="ltscmd01"
uptime
```

```bash id="ltscmd02"
top
```

```bash id="ltscmd03"
free -h
```

```bash id="ltscmd04"
df -h
```

```bash id="ltscmd05"
vmstat
```

These commands quickly reveal whether the issue is related to CPU, memory, storage, or system load.

---

## Step 4 – Check Running Services

Many production issues occur because required services have stopped.

Example:

```bash id="ltscmd06"
sudo systemctl status nginx
```

```bash id="ltscmd07"
sudo systemctl status mongod
```

```bash id="ltscmd08"
pm2 list
```

If a required service is not running, determine **why** before restarting it.

---

## Step 5 – Check Logs

Logs often contain the exact cause of a problem.

Common log locations:

| Component   | Log Source            |
| ----------- | --------------------- |
| System      | `journalctl`          |
| Nginx       | `/var/log/nginx/`     |
| PM2         | `~/.pm2/logs/`        |
| Application | Application log files |

Useful commands:

```bash id="ltscmd09"
journalctl -xe
```

```bash id="ltscmd10"
tail -f /var/log/nginx/error.log
```

```bash id="ltscmd11"
pm2 logs
```

Always review logs before restarting applications.

---

## Step 6 – Identify the Root Cause

Symptoms and causes are different.

Example:

```text id="lts05"
Website Slow

↓

Database Timeout

↓

Missing Index

↓

Root Cause
```

In this example:

- Slow website = Symptom
- Missing database index = Root Cause

Fixing only the symptom usually results in the issue returning.

---

## Root Cause Analysis (RCA)

Root Cause Analysis is the process of identifying the fundamental reason an incident occurred.

Example:

```text id="lts06"
Application Crash

↓

Out of Memory

↓

Memory Leak

↓

Bug in Code
```

The actual problem is not the crash—it is the memory leak.

---

## Common Linux Problems

Production administrators frequently encounter issues such as:

- High CPU usage
- High memory usage
- Disk full
- Application crashes
- Service failures
- Permission problems
- SSL issues
- Network failures
- DNS failures
- Firewall misconfiguration

A structured approach can be applied to all of these scenarios.

---

## The "Change" Principle

One of the first questions to ask is:

> **What changed?**

Possible changes include:

- New deployment
- Package update
- Configuration modification
- Firewall update
- SSL renewal
- DNS change
- Infrastructure migration

Many production incidents are directly related to a recent change.

---

## Change Analysis Workflow

```text id="lts07"
Issue Started

↓

Recent Change?

↓

Yes

↓

Investigate Change
```

Always review deployment history and configuration changes before assuming hardware or software failure.

---

## Verifying the Fix

Applying a fix is not the final step.

Verification should include:

- Service status
- Application functionality
- Log review
- Resource usage
- User confirmation

Example:

```text id="lts08"
Fix Applied

↓

Restart Service

↓

Verify Logs

↓

Verify Users

↓

Incident Closed
```

Never assume a problem is solved without verification.

---

## Document Every Incident

Every production issue should be documented.

Record:

- Incident time
- Symptoms
- Root cause
- Commands executed
- Configuration changes
- Resolution
- Preventive actions

Documentation improves future troubleshooting and knowledge sharing.

---

## Essential Troubleshooting Commands

| Command            | Purpose                        |
| ------------------ | ------------------------------ |
| `uptime`           | Check server uptime and load   |
| `top`              | Monitor CPU and processes      |
| `htop`             | Interactive process monitoring |
| `free -h`          | Check memory usage             |
| `df -h`            | Check disk usage               |
| `vmstat`           | View system performance        |
| `journalctl -xe`   | Review system logs             |
| `systemctl status` | Check service status           |
| `pm2 list`         | Check Node.js applications     |
| `pm2 logs`         | View application logs          |
| `ss -tulpn`        | View listening ports           |
| `ping`             | Test connectivity              |

---

## Production Troubleshooting Flow

```text id="lts09"
Alert

↓

Collect Evidence

↓

System Health

↓

Logs

↓

Services

↓

Root Cause

↓

Fix

↓

Verify

↓

Document
```

A structured workflow minimizes downtime and reduces unnecessary actions.

---

## Real-World Example

A customer reports that the company website is unavailable.

The administrator follows the troubleshooting workflow:

1. Opens the website and confirms it returns **502 Bad Gateway**.
2. Checks Nginx status.

```bash id="ltscmd12"
sudo systemctl status nginx
```

Nginx is running normally.

3. Checks PM2.

```bash id="ltscmd13"
pm2 list
```

The Node.js application is offline.

4. Reviews application logs.

```bash id="ltscmd14"
pm2 logs
```

The logs reveal a database authentication failure.

5. Reviews the `.env` file and discovers an incorrect database password introduced during the latest deployment.

6. Corrects the configuration and reloads the application.

7. Confirms the website is accessible and verifies that no new errors appear in the logs.

The issue was resolved by identifying the root cause rather than repeatedly restarting services.

---

## Best Practices

- Follow the same troubleshooting workflow for every incident.
- Verify problems before making changes.
- Collect evidence before taking action.
- Read logs carefully.
- Identify the root cause instead of only fixing symptoms.
- Change one thing at a time.
- Verify every fix.
- Document all incidents and resolutions.
- Learn from recurring issues.

---

## Common Mistakes

#### Restarting Services Immediately

Restarting services may temporarily hide the problem without resolving the underlying cause.

---

#### Ignoring Logs

Most production issues leave evidence in log files. Skipping log analysis often delays resolution.

---

#### Making Multiple Changes Simultaneously

Changing several settings at once makes it difficult to determine which change resolved—or caused—the issue.

---

#### Assuming the First Error Is the Root Cause

The first visible error is often only a symptom of a deeper issue.

---

#### Closing Incidents Without Verification

Always confirm that the system is functioning correctly before considering the incident resolved.

---

## Summary

Linux troubleshooting is a structured process of identifying, diagnosing, and resolving production issues. Successful troubleshooting depends on collecting evidence, analyzing logs, checking system health, identifying the root cause, verifying the solution, and documenting the incident. Following a consistent methodology leads to faster resolutions, fewer mistakes, and more reliable production systems.

---

### Next Chapter

➡️ **02 - Network Troubleshooting**
