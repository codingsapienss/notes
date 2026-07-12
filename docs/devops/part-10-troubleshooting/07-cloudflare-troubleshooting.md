---
sidebar_label: Cloudflare Troubleshooting
sidebar_position: 7
---


# Cloudflare Troubleshooting

## Overview

Cloudflare sits between your users and your origin server, acting as a reverse proxy, CDN, DNS provider, firewall, and SSL termination point.

Because Cloudflare introduces an additional network layer, problems may originate from:

- Incorrect DNS configuration
- SSL/TLS mismatches
- Origin server downtime
- Firewall blocks
- Caching issues
- Proxy configuration errors
- Cloudflare security rules
- Network connectivity problems

When troubleshooting websites using Cloudflare, administrators must determine whether the problem lies with:

- Client
- Cloudflare
- DNS
- Network
- Origin server
- Application

A systematic approach significantly reduces troubleshooting time.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand the Cloudflare request flow.
- Diagnose common Cloudflare error pages.
- Troubleshoot DNS configuration.
- Resolve SSL/TLS issues.
- Verify origin server connectivity.
- Debug caching problems.
- Investigate firewall blocks.
- Apply Cloudflare troubleshooting best practices.

---

# Cloudflare Request Flow

Every request passes through multiple layers.

```text
User

↓

Browser

↓

Cloudflare DNS

↓

Cloudflare Edge

↓

Internet

↓

Origin Server

↓

Nginx

↓

Node.js

↓

Database
```

A problem at any layer may result in an unavailable website.

---

# Cloudflare Troubleshooting Workflow

Follow a structured workflow.

```text
Website Issue

↓

Check DNS

↓

Check Cloudflare Status

↓

Check SSL

↓

Check Origin Server

↓

Check Nginx

↓

Check Application

↓

Fix

↓

Verify
```

Never assume Cloudflare is the source of every issue.

---

# Step 1 – Identify the Error

Cloudflare provides informative error pages.

Typical errors include:

| Error | Meaning                              |
| ----- | ------------------------------------ |
| 520   | Unknown origin error                 |
| 521   | Web server refused connection        |
| 522   | Connection timed out                 |
| 523   | Origin unreachable                   |
| 524   | Timeout after connection established |
| 525   | SSL handshake failed                 |
| 526   | Invalid SSL certificate              |

The displayed error code usually indicates where troubleshooting should begin.

---

# Step 2 – Verify DNS Records

Cloudflare depends on correct DNS configuration.

Verify:

- A Record
- AAAA Record
- CNAME Record
- MX Record (if required)
- Correct Origin IP

Example:

```text
Domain

↓

Cloudflare DNS

↓

Origin IP
```

Incorrect DNS records are one of the most common deployment mistakes.

---

# Step 3 – Verify DNS Propagation

After changing DNS records, propagation may take time.

Verify:

- Correct IP
- Correct hostname
- Global propagation
- Cached records

Possible symptoms:

- Website works in one location.
- Website fails elsewhere.
- Old IP still resolves.

---

# Step 4 – Verify Cloudflare Proxy Status

Cloudflare supports two modes.

| Icon         | Meaning  |
| ------------ | -------- |
| Orange Cloud | Proxied  |
| Grey Cloud   | DNS Only |

Flow:

```text
Orange Cloud

↓

Cloudflare Proxy

↓

Origin
```

```text
Grey Cloud

↓

Direct DNS

↓

Origin
```

If troubleshooting Cloudflare-specific issues, temporarily switching to **DNS Only** can help determine whether the proxy layer is involved.

---

# Step 5 – Verify Origin Server

Cloudflare cannot serve dynamic requests if the origin server is unavailable.

Verify:

```bash
ping SERVER_IP
```

Verify HTTP.

```bash
curl http://SERVER_IP
```

Verify HTTPS.

```bash
curl -k https://SERVER_IP
```

If the origin server is unreachable directly, Cloudflare cannot reach it either.

---

# Step 6 – Verify Nginx

Confirm that Nginx is operational.

```bash
sudo systemctl status nginx
```

Validate configuration.

```bash
sudo nginx -t
```

Check logs.

```bash
sudo tail -f /var/log/nginx/error.log
```

Cloudflare frequently reports origin errors that are actually caused by Nginx failures.

---

# Step 7 – Verify Application

Test the backend application directly.

```bash
curl http://localhost:3000
```

Check PM2.

```bash
pm2 list
```

If the application is unavailable, Cloudflare will eventually return an origin-related error.

---

# Understanding Cloudflare Error 521

**Error 521** means Cloudflare successfully reached the server but the server refused the connection.

Typical causes:

- Nginx stopped
- Firewall blocking Cloudflare IPs
- Incorrect listening ports
- Service not running

Flow:

```text
Cloudflare

↓

Origin

↓

Connection Refused

↓

521
```

---

# Understanding Cloudflare Error 522

**Error 522** indicates that Cloudflare could not establish a TCP connection before the timeout.

Possible causes:

- Server offline
- Firewall dropping packets
- Network outage
- High server load

Flow:

```text
Cloudflare

↓

Waiting

↓

Timeout

↓

522
```

---

# Understanding Cloudflare Error 523

**Error 523** means Cloudflare cannot locate the origin server.

Possible causes:

- Incorrect DNS record
- Wrong IP address
- Deleted server
- Routing problem

---

# Understanding Cloudflare Error 524

**Error 524** occurs when Cloudflare connects successfully but the origin takes too long to respond.

Possible causes:

- Slow database queries
- Large file processing
- Long-running API requests
- Resource exhaustion

Flow:

```text
Cloudflare

↓

Origin Connected

↓

Slow Response

↓

524
```

---

# Understanding Cloudflare Error 525

**Error 525** indicates an SSL handshake failure.

Possible causes:

- Missing certificate
- Invalid certificate
- Expired certificate
- Incorrect SSL mode

Flow:

```text
Cloudflare

↓

SSL Handshake

↓

Failed

↓

525
```

---

# Understanding Cloudflare Error 526

**Error 526** means the origin certificate is invalid while using **Full (Strict)** SSL mode.

Possible causes:

- Self-signed certificate
- Expired certificate
- Incorrect certificate chain

---

# SSL Troubleshooting

Verify:

- Certificate validity
- Certificate expiration
- Certificate path
- SSL mode

Common SSL modes:

| Mode          | Description                                    |
| ------------- | ---------------------------------------------- |
| Off           | No encryption                                  |
| Flexible      | HTTPS to Cloudflare, HTTP to origin            |
| Full          | HTTPS to origin without certificate validation |
| Full (Strict) | HTTPS with certificate validation              |

The SSL mode configured in Cloudflare must match the origin server's SSL configuration.

---

# Cache Troubleshooting

Cloudflare caches static assets.

Common cache symptoms:

- Website shows old content.
- CSS not updating.
- JavaScript changes not visible.
- Images remain outdated.

Flow:

```text
Browser

↓

Cloudflare Cache

↓

Origin
```

Possible solutions:

- Purge cache.
- Hard refresh browser.
- Reduce cache TTL.
- Verify cache headers.

---

# Firewall Troubleshooting

Cloudflare may block requests because of:

- WAF rules
- Rate limiting
- Country restrictions
- IP blocking
- Security rules

Also verify the origin firewall.

Ubuntu:

```bash
sudo ufw status
```

Cloud providers may additionally enforce:

- Security Groups
- Network Security Groups
- Firewall Rules

---

# Cloudflare Troubleshooting Decision Tree

```text
Website Down

        │

        ▼

DNS Correct?

  │         │

 No        Yes

 │

Fix DNS

          │

          ▼

Origin Reachable?

          │

          ▼

Nginx Running?

          │

          ▼

Application Running?

          │

          ▼

SSL Correct?

          │

          ▼

Fix
```

Following this order reduces unnecessary configuration changes.

---

# Useful Commands

| Command                     | Purpose                    |
| --------------------------- | -------------------------- |
| `ping SERVER_IP`            | Verify server reachability |
| `curl http://SERVER_IP`     | Test HTTP directly         |
| `curl -k https://SERVER_IP` | Test HTTPS directly        |
| `systemctl status nginx`    | Verify Nginx               |
| `nginx -t`                  | Validate configuration     |
| `pm2 list`                  | Verify Node.js application |
| `pm2 logs`                  | Review application logs    |
| `ufw status`                | Verify firewall rules      |
| `ss -tulpn`                 | Check listening ports      |

---

# Production Troubleshooting Workflow

```text
User Reports Website Down

↓

Cloudflare Error

↓

DNS

↓

Origin

↓

SSL

↓

Nginx

↓

Application

↓

Database

↓

Fix

↓

Verify
```

A structured workflow helps isolate the failing layer efficiently.

---

# Real-World Example

Users report **Error 522 Connection Timed Out** when accessing a production website.

The administrator investigates:

1. Confirms the domain resolves to the correct Cloudflare IPs.

2. Attempts to access the origin server directly.

```bash
curl http://SERVER_IP
```

The request times out.

3. Pings the server.

```bash
ping SERVER_IP
```

The server responds successfully.

4. Checks Nginx.

```bash
sudo systemctl status nginx
```

Nginx is running.

5. Verifies firewall rules.

```bash
sudo ufw status
```

Port **80** was accidentally removed during a firewall update.

6. Restores access.

```bash
sudo ufw allow 80
sudo ufw allow 443
```

7. Tests the website again.

The Cloudflare error disappears immediately.

The root cause was the server firewall blocking HTTP and HTTPS traffic rather than a Cloudflare outage.

---

# Best Practices

- Start with the Cloudflare error code before changing configurations.
- Verify DNS records after every deployment.
- Match Cloudflare SSL mode with the origin server configuration.
- Test the origin server directly before investigating Cloudflare.
- Monitor firewall rules on both Cloudflare and the origin server.
- Purge cache only when necessary.
- Keep SSL certificates renewed.
- Document DNS and Cloudflare configuration changes.

---

# Common Mistakes

### Assuming Cloudflare Is Always the Problem

Most Cloudflare error pages indicate issues with the origin server rather than Cloudflare itself.

---

### Ignoring DNS Configuration

An incorrect DNS record can make an otherwise healthy server unreachable.

---

### Using the Wrong SSL Mode

A mismatch between Cloudflare SSL mode and the origin server configuration commonly causes SSL handshake failures.

---

### Forgetting the Origin Firewall

Even if Cloudflare is configured correctly, blocked ports on the origin server will prevent successful connections.

---

### Purging Cache for Every Issue

Caching problems are only one category of Cloudflare issues. Always identify the root cause before clearing the cache.

---

# Summary

Cloudflare troubleshooting requires understanding the complete request path from the client to the origin server. By identifying the Cloudflare error code, verifying DNS records, checking SSL configuration, testing origin connectivity, reviewing Nginx and application health, and validating firewall rules, administrators can efficiently resolve most production issues. A structured troubleshooting methodology minimizes downtime and avoids unnecessary configuration changes.

---

## Next Chapter

➡️ **08 - SSL Troubleshooting**
