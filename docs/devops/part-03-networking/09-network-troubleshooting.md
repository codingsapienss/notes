---
sidebar_label: Network Troubleshooting
sidebar_position: 9
---


# Network Troubleshooting

## Overview

No matter how well a network is designed, problems eventually occur.

Common issues include:

- Website not loading
- DNS failures
- SSH connection refused
- API timeouts
- SSL certificate errors
- High latency
- Packet loss
- Reverse proxy failures
- Firewall blocking traffic

The difference between an experienced engineer and a beginner is **not** knowing every command—it's knowing **how to troubleshoot methodically**.

This chapter brings together everything learned throughout **Part 3** and introduces a structured workflow for diagnosing networking problems.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Follow a systematic troubleshooting process.
- Verify network connectivity.
- Diagnose DNS issues.
- Check open ports.
- Test HTTP and HTTPS services.
- Identify routing problems.
- Analyze packet flow.
- Troubleshoot production deployments.

---

# A Troubleshooting Mindset

When a network issue occurs, avoid making assumptions.

Instead, ask questions such as:

- Is the server running?
- Is the network reachable?
- Does DNS resolve correctly?
- Is the correct port open?
- Is the firewall blocking traffic?
- Is the application running?
- Is Nginx forwarding requests correctly?
- Is SSL configured properly?

Always isolate the problem one layer at a time.

---

# The Troubleshooting Workflow

A structured workflow reduces guesswork.

```text id="a4m9qt"
Problem Reported
        │
        ▼
Check Connectivity
        │
        ▼
Check DNS
        │
        ▼
Check Routing
        │
        ▼
Check Ports
        │
        ▼
Check Firewall
        │
        ▼
Check Services
        │
        ▼
Check Application Logs
        │
        ▼
Resolve Issue
```

Never skip steps.

---

# Step 1 — Verify Basic Connectivity

The first question is:

> **Can the destination be reached?**

Use:

```bash id="b7r2xm"
ping google.com
```

Example output:

```text id="c9v5lp"
64 bytes from google.com

time=18 ms
```

If responses are received:

- Network connectivity exists.
- DNS resolution is working.
- ICMP packets are reaching the destination.

If not:

- Internet connection may be unavailable.
- Firewall may block ICMP.
- DNS may be failing.
- The destination may be offline.

---

# Step 2 — Verify DNS

Check whether the domain resolves correctly.

Using `dig`:

```bash id="d8k4wn"
dig example.com
```

Retrieve only the IP address:

```bash id="e3m7rz"
dig +short example.com
```

Using `nslookup`:

```bash id="f6q2yb"
nslookup example.com
```

Example:

```text id="g1p8vx"
Name:

example.com

Address:

93.184.216.34
```

If DNS fails, investigate:

- Name servers
- DNS records
- TTL
- Registrar configuration
- Cloudflare settings

---

# Step 3 — Check Routing

Packets may be taking an unexpected route.

Use:

```bash id="h5w9kc"
traceroute example.com
```

Example:

```text id="i2n6rm"
Router

↓

ISP

↓

Regional Router

↓

Cloud Provider

↓

Destination
```

If packets stop midway, the issue may involve:

- ISP routing
- Firewall filtering
- Network outage
- Misconfigured routes

---

# Step 4 — Verify Open Ports

Check whether the server is listening.

```bash id="j7m4tf"
ss -tulpn
```

Example:

```text id="k8r1wv"
22

80

443

3000
```

Verify that the expected service is bound to the correct port.

---

# Step 5 — Test HTTP Services

Use `curl` to test a web service.

```bash id="l9q5xd"
curl http://example.com
```

View headers only:

```bash id="m3v8jh"
curl -I https://example.com
```

Verbose output:

```bash id="n6x2pk"
curl -v https://example.com
```

Useful information includes:

- HTTP status
- Redirects
- TLS negotiation
- Response headers

---

# Step 6 — Check Running Services

Verify that required services are running.

```bash id="o4k7qa"
systemctl status nginx
```

```bash id="p8m1wc"
systemctl status ssh
```

```bash id="q5v9ln"
systemctl status docker
```

A stopped service often explains why a port is unavailable.

---

# Step 7 — Check Logs

Logs frequently reveal the root cause.

Examples:

```bash id="r2p6xf"
journalctl -u nginx
```

```bash id="s7m3ky"
tail -f /var/log/nginx/error.log
```

Look for:

- Permission errors
- Port conflicts
- Configuration mistakes
- TLS failures
- Missing files

---

# Step 8 — Verify Firewall Rules

Even if an application is running, traffic may be blocked.

Ubuntu UFW:

```bash id="t1q8vr"
sudo ufw status
```

Example:

```text id="u6m4pb"
22 ALLOW

80 ALLOW

443 ALLOW
```

Cloud environments also have firewall rules.

Examples:

- Azure Network Security Groups (NSGs)
- AWS Security Groups
- Google Cloud Firewall Rules

Both the operating system and cloud firewall must permit the traffic.

---

# Step 9 — Test TLS

Verify certificate details.

```bash id="v9k2nd"
openssl s_client -connect example.com:443
```

Useful checks:

- Expiration date
- Certificate chain
- Supported TLS version
- Cipher suite

---

# Step 10 — Capture Packets

When necessary, inspect actual network traffic.

Use:

```bash id="w5r7xt"
sudo tcpdump -i eth0
```

Example:

```text id="x4m8cy"
Client

↓

TCP SYN

↓

Server

↓

TCP SYN-ACK
```

Packet captures help diagnose:

- Packet loss
- Retransmissions
- Incorrect routing
- Connection resets
- Firewall issues

---

# Common Networking Problems

## Problem 1 — Website Does Not Open

Possible causes:

- DNS failure
- Server offline
- Firewall blocking traffic
- Nginx stopped
- Application crashed

Recommended workflow:

```text id="y8p3lj"
Ping

↓

Dig

↓

Curl

↓

Systemctl

↓

Logs
```

---

## Problem 2 — SSH Connection Refused

Possible causes:

- SSH service stopped
- Port 22 blocked
- Firewall rules
- Wrong IP address

Commands:

```bash id="z7v6mq"
systemctl status ssh
```

```bash id="a2q5xn"
ss -tulpn
```

---

## Problem 3 — DNS Not Resolving

Check:

```bash id="b4k8yr"
dig example.com
```

Possible causes:

- Incorrect A record
- Wrong NS records
- DNS propagation
- Expired domain
- Resolver cache

---

## Problem 4 — Port Not Reachable

Check:

```bash id="c6m1wt"
ss -tulpn
```

Then verify:

- Firewall
- Reverse proxy
- Application
- Cloud security rules

---

## Problem 5 — SSL Certificate Errors

Check:

```bash id="d3v7pk"
openssl s_client -connect example.com:443
```

Common causes:

- Expired certificate
- Incorrect certificate chain
- Domain mismatch
- Self-signed certificate
- TLS configuration errors

---

# Useful Troubleshooting Commands

| Command            | Purpose                  |
| ------------------ | ------------------------ |
| `ping`             | Test connectivity        |
| `dig`              | DNS lookup               |
| `nslookup`         | DNS lookup               |
| `traceroute`       | Trace packet path        |
| `curl`             | Test HTTP/HTTPS          |
| `ss -tulpn`        | Show listening ports     |
| `systemctl status` | Check services           |
| `journalctl`       | View service logs        |
| `openssl s_client` | Inspect TLS certificates |
| `tcpdump`          | Capture packets          |

---

# Complete Production Troubleshooting Example

Suppose users report:

> **"The website is down."**

Production architecture:

```text id="e8x5wh"
User

↓

DNS

↓

Cloudflare

↓

Azure VM

↓

Nginx

↓

Node.js

↓

MongoDB Atlas
```

A systematic investigation might look like this:

1. Verify Internet connectivity.

```bash id="f1n9rm"
ping example.com
```

2. Confirm DNS resolution.

```bash id="g5k3qt"
dig example.com
```

3. Test HTTPS.

```bash id="h7p6lv"
curl -I https://example.com
```

4. Verify Nginx.

```bash id="i4m2xc"
systemctl status nginx
```

5. Verify Node.js.

```bash id="j9v8pn"
pm2 status
```

6. Check listening ports.

```bash id="k2q7wb"
ss -tulpn
```

7. Review logs.

```bash id="l6r4mf"
journalctl -u nginx
```

This step-by-step approach isolates the problem quickly instead of relying on trial and error.

---

# Troubleshooting Checklist

```text id="m8w1qy"
✓ Internet Connectivity

✓ DNS Resolution

✓ Routing

✓ Open Ports

✓ Firewall

✓ Running Services

✓ Application Logs

✓ TLS Certificate

✓ Reverse Proxy

✓ Backend Application
```

Following the same checklist every time reduces mistakes and speeds up diagnosis.

---

# Best Practices

- Follow a consistent troubleshooting workflow.
- Change only one variable at a time.
- Verify assumptions with commands rather than guesses.
- Read logs before modifying configurations.
- Keep monitoring and alerting in place for production systems.
- Document recurring issues and their resolutions.

---

# Common Mistakes

### Jumping Directly to Configuration Changes

Changing configurations before identifying the root cause can introduce new problems.

Always gather evidence first.

---

### Ignoring Logs

Most networking and service failures leave useful information in system or application logs.

Logs should be one of the first places you investigate.

---

### Forgetting Cloud Firewalls

Opening a port in UFW does not automatically allow Internet access.

Cloud firewall rules (such as Azure NSGs or AWS Security Groups) must also permit the traffic.

---

### Troubleshooting Multiple Layers Simultaneously

Network issues often involve several components.

Test one layer at a time—connectivity, DNS, routing, ports, services, and application behavior—to isolate the failure efficiently.

---

# Summary

Effective network troubleshooting relies on a structured process rather than guesswork. By systematically verifying connectivity, DNS, routing, ports, firewalls, services, logs, TLS, and packet flow, engineers can isolate and resolve problems efficiently. The tools introduced in this chapter—such as `ping`, `dig`, `curl`, `ss`, `systemctl`, `journalctl`, `openssl`, and `tcpdump`—form the core toolkit used by Linux administrators, DevOps engineers, and cloud engineers in production environments.

With this chapter, you have completed **Part 3 – Networking Fundamentals**, providing the networking knowledge required to move into **server security**, where you will learn how to protect Linux systems and production applications.

---

## Next Chapter

➡️ **Part 4 – Server Security**
