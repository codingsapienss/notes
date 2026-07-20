---
sidebar_label: Linux Interview Preparation
sidebar_position: 1
---


# Linux Interview Preparation

### Overview

Linux is one of the most frequently tested topics in Backend, DevOps, Cloud, Site Reliability Engineering (SRE), and System Administration interviews.

Interviewers generally don't want candidates who have memorized commands—they want engineers who understand **how Linux works**, **why commands are used**, and **how production issues are solved**.

This chapter covers:

- Linux fundamentals
- Frequently asked interview questions
- Command-based questions
- Scenario-based discussions
- Production troubleshooting
- Advanced interview topics

---

## Learning Objectives

After completing this chapter, you will be able to:

- Answer Linux interview questions confidently.
- Explain Linux concepts instead of memorizing commands.
- Solve production scenarios.
- Demonstrate troubleshooting skills.
- Discuss real-world Linux administration.

---

## Linux Knowledge Roadmap

```text id="l1road"
Linux Basics

↓

Filesystem

↓

Permissions

↓

Processes

↓

Services

↓

Networking

↓

Storage

↓

Security

↓

Troubleshooting

↓

Production Scenarios
```

---

## Interview Expectations

Interviewers usually evaluate:

| Skill                 | Importance |
| --------------------- | ---------- |
| Linux Commands        | High       |
| Process Management    | High       |
| File System Knowledge | High       |
| Networking            | High       |
| Troubleshooting       | Very High  |
| Security              | Medium     |
| Performance Analysis  | High       |
| Production Experience | Very High  |

---

## Beginner Interview Questions

### Q1. What is Linux?

**Answer**

Linux is an open-source Unix-like operating system kernel created by Linus Torvalds in 1991. Modern Linux distributions combine the Linux kernel with GNU utilities, package managers, and additional software to create complete operating systems such as Ubuntu, Debian, Fedora, and Rocky Linux.

---

### Q2. What is a Linux Distribution?

Examples:

- Ubuntu
- Debian
- Fedora
- CentOS Stream
- Rocky Linux
- AlmaLinux
- Arch Linux

A distribution packages the Linux kernel together with software, libraries, installers, and package management tools.

---

### Q3. Difference between Linux Kernel and Operating System?

| Linux Kernel       | Operating System          |
| ------------------ | ------------------------- |
| Core component     | Complete software package |
| Manages hardware   | Includes kernel + tools   |
| Memory management  | User applications         |
| Process scheduling | Package manager           |
| Device drivers     | Shell and utilities       |

---

### Q4. What is the Linux Shell?

A shell is a command interpreter that allows users to interact with the operating system.

Popular shells include:

- Bash
- Zsh
- Fish
- Dash

---

### Q5. What is the Root Directory?

The root directory (`/`) is the top-level directory of the Linux filesystem hierarchy. Every file and directory originates from it.

---

## Filesystem Questions

### Q6. Difference between `/` and `/root`

| `/`                      | `/root`                     |
| ------------------------ | --------------------------- |
| Root of filesystem       | Home directory of root user |
| Contains all directories | Contains root user's files  |

---

### Q7. What is stored inside `/etc`?

Configuration files for:

- Nginx
- SSH
- Users
- DNS
- Networking
- Services

---

### Q8. What is `/proc`?

`/proc` is a virtual filesystem that provides runtime information about the kernel and currently running processes.

Examples:

```bash id="lq001"
cat /proc/cpuinfo
```

```bash id="lq002"
cat /proc/meminfo
```

---

### Q9. Difference between Hard Link and Soft Link?

| Hard Link                 | Soft Link                  |
| ------------------------- | -------------------------- |
| Shares inode              | Separate inode             |
| Cannot span filesystems   | Can span filesystems       |
| Works if original renamed | Breaks if original removed |

Create symbolic link:

```bash id="lq003"
ln -s original.txt shortcut.txt
```

---

## File Permission Questions

### Q10. Explain Linux permissions.

Example:

```text id="lq004"
-rwxr-xr--
```

Breakdown:

- Owner
- Group
- Others

Permission values:

| Permission | Value |
| ---------- | ----- |
| Read       | 4     |
| Write      | 2     |
| Execute    | 1     |

---

### Q11. What does `chmod 755` mean?

Owner:

- Read
- Write
- Execute

Group:

- Read
- Execute

Others:

- Read
- Execute

---

### Q12. Difference between chmod and chown?

| chmod               | chown             |
| ------------------- | ----------------- |
| Changes permissions | Changes ownership |

Examples:

```bash id="lq005"
chmod 755 app.js
```

```bash id="lq006"
chown ubuntu:ubuntu app.js
```

---

## Process Questions

### Q13. How do you view running processes?

```bash id="lq007"
ps aux
```

or

```bash id="lq008"
top
```

---

### Q14. Difference between process and service?

| Process         | Service                    |
| --------------- | -------------------------- |
| Running program | Managed background process |
| User started    | Usually managed by systemd |

---

### Q15. How do you stop a process?

```bash id="lq009"
kill PID
```

Force stop:

```bash id="lq010"
kill -9 PID
```

---

## Systemd Questions

### Q16. What is systemd?

systemd is the initialization and service management system used by most modern Linux distributions.

---

### Q17. Common systemctl commands?

```bash id="lq011"
systemctl status nginx
```

```bash id="lq012"
systemctl restart nginx
```

```bash id="lq013"
systemctl enable nginx
```

---

## Networking Questions

### Q18. Difference between TCP and UDP?

| TCP                 | UDP                   |
| ------------------- | --------------------- |
| Reliable            | Faster                |
| Connection-oriented | Connectionless        |
| Ordered delivery    | No ordering guarantee |

---

### Q19. How do you find your IP address?

```bash id="lq014"
ip addr
```

---

### Q20. How do you verify if a server is reachable?

```bash id="lq015"
ping google.com
```

---

### Q21. Which command shows listening ports?

```bash id="lq016"
ss -tulpn
```

---

### Q22. What does DNS do?

DNS converts domain names into IP addresses.

Example:

```text id="lq017"
example.com

↓

203.0.113.15
```

---

## Storage Questions

### Q23. Difference between df and du?

| df         | du               |
| ---------- | ---------------- |
| Disk usage | Folder/file size |

Examples:

```bash id="lq018"
df -h
```

```bash id="lq019"
du -sh /var/www
```

---

### Q24. What happens if disk becomes full?

Possible effects:

- Applications crash
- Databases fail
- Logs stop writing
- Deployments fail
- Services may stop

---

## Logging Questions

### Q25. Where are system logs stored?

Typically:

```text id="lq020"
/var/log/
```

---

### Q26. How do you continuously monitor logs?

```bash id="lq021"
tail -f /var/log/syslog
```

---

## Security Questions

### Q27. Why disable root SSH login?

Reasons:

- Reduces attack surface.
- Prevents direct root authentication.
- Encourages privilege escalation through `sudo`.
- Improves auditability.

---

### Q28. Why use SSH keys?

Advantages:

- More secure than passwords.
- Resistant to brute-force password guessing.
- Convenient for automation.

---

## Intermediate Questions

### Q29. Difference between reboot and shutdown?

| reboot          | shutdown          |
| --------------- | ----------------- |
| Restarts system | Powers off system |

---

### Q30. What is swap memory?

Swap is disk space used as an extension of RAM when physical memory becomes insufficient.

---

### Q31. What is a daemon?

A daemon is a background process that runs continuously to provide services.

Examples:

- nginx
- sshd
- cron

---

## Advanced Interview Questions

### Q32. Why is Linux preferred for servers?

Typical reasons include:

- Stability
- Performance
- Security
- Automation
- Open-source ecosystem
- Strong networking capabilities

---

### Q33. What happens when you run a command?

```text id="lq022"
Shell

↓

Kernel

↓

System Call

↓

CPU

↓

Output
```

The shell parses the command, the kernel performs the requested operations through system calls, and the results are returned to the user.

---

### Q34. What happens during system boot?

```text id="lq023"
Power On

↓

BIOS / UEFI

↓

Bootloader

↓

Linux Kernel

↓

systemd

↓

Services

↓

Login Prompt
```

---

## Scenario-Based Questions

### Scenario 1

**Question**

Users report that the website is down. How would you investigate?

**Suggested Answer**

A structured approach:

1. Verify server connectivity.
2. Check system resource usage.
3. Verify Nginx status.
4. Check the application process.
5. Inspect listening ports.
6. Review logs.
7. Test locally using `curl`.
8. Verify firewall and DNS if necessary.

Typical commands:

```bash id="lq024"
systemctl status nginx
```

```bash id="lq025"
pm2 list
```

```bash id="lq026"
ss -tulpn
```

```bash id="lq027"
tail -f /var/log/nginx/error.log
```

Interviewers generally value a logical troubleshooting sequence more than immediately identifying a specific cause.

---

### Scenario 2

**Question**

Your application works locally but not externally.

Possible checks:

- Firewall
- Security groups
- Reverse proxy configuration
- Listening address
- DNS
- SSL
- Port bindings

---

### Scenario 3

**Question**

CPU usage suddenly reaches 100%.

Suggested investigation:

```text id="lq028"
top

↓

Identify Process

↓

Check Logs

↓

Determine Cause

↓

Mitigate

↓

Monitor
```

---

## Production Experience Questions

Examples:

- Describe a production issue you resolved.
- Explain your deployment process.
- How do you restart services safely?
- How do you investigate high memory usage?
- How do you verify a deployment?
- How do you monitor production systems?
- What precautions do you take before restarting a server?

Interviewers often look for structured reasoning, risk awareness, and practical experience.

---

## Interview Tips

- Explain _why_, not just _what_.
- Think aloud during troubleshooting questions.
- Follow a systematic approach.
- Mention verification after every change.
- Avoid making assumptions without evidence.
- Use production examples where possible.

---

## Common Mistakes

#### Memorizing Commands Without Understanding Them

Interviewers usually ask follow-up questions that require conceptual understanding.

---

#### Jumping Directly to a Solution

Describe your investigation process before proposing a fix.

---

#### Ignoring Logs

Logs are often the first place to gather evidence during troubleshooting.

---

#### Not Verifying Changes

After applying a fix, always explain how you would confirm the issue is resolved.

---

#### Giving One-Word Answers

Expand your responses with reasoning, examples, and trade-offs.

---

## Summary

Linux interviews focus on practical system administration, troubleshooting methodology, and real-world production experience. Strong candidates demonstrate an understanding of Linux internals, networking, permissions, services, and structured debugging rather than relying solely on memorized commands.

---

### Next Chapter

➡️ **02 - Networking Interview Preparation**
