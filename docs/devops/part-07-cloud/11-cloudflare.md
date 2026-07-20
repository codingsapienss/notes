---
sidebar_label: Cloudflare
sidebar_position: 11
---


# Cloudflare

### Overview

In the previous chapter, we learned how DNS converts domain names into IP addresses.

Without Cloudflare, a typical request looks like this:

```text id="cf01"
Browser
   │
   ▼
DNS
   │
   ▼
Public IP
   │
   ▼
Azure Virtual Machine
```

This works perfectly.

However, exposing your server directly to the Internet has several disadvantages:

- Your server's IP address is publicly visible.
- Every request reaches your server directly.
- DDoS attacks can overwhelm your infrastructure.
- Static files are served only from your server.
- Users located far from your server experience higher latency.

Cloudflare solves many of these problems by acting as an intelligent layer between users and your origin server.

Today, Cloudflare is used by millions of websites ranging from small personal blogs to large global platforms.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what Cloudflare is.
- Learn how Cloudflare works.
- Understand reverse proxy architecture.
- Learn about Cloudflare's global edge network.
- Understand DNS proxying.
- Learn the advantages of using Cloudflare.
- Follow production best practices.

---

## What is Cloudflare?

Cloudflare is a cloud platform that provides services including:

- Reverse Proxy
- Content Delivery Network (CDN)
- DNS Hosting
- DDoS Protection
- SSL/TLS Management
- Web Application Firewall (WAF)
- Caching
- Performance Optimization

Instead of users connecting directly to your server, they first connect to Cloudflare.

---

## Traditional Architecture

Without Cloudflare:

```text id="cf02"
Users
   │
   ▼
Internet
   │
   ▼
Azure Public IP
   │
   ▼
Nginx
   │
   ▼
Node.js
```

Every request reaches your server directly.

---

## Architecture with Cloudflare

With Cloudflare:

```text id="cf03"
Users
   │
   ▼
Cloudflare Edge
   │
   ▼
Azure Public IP
   │
   ▼
Nginx
   │
   ▼
Node.js
```

Cloudflare becomes the public-facing entry point for your application.

---

## Reverse Proxy

Cloudflare functions as a **Reverse Proxy**.

Instead of clients communicating directly with your server:

```text id="cf04"
Browser

↓

Cloudflare

↓

Origin Server
```

Cloudflare receives the request, performs security and performance checks, and forwards the request to your origin server when necessary.

Users generally communicate only with Cloudflare.

---

## What is an Origin Server?

The **Origin Server** is the server where your application actually runs.

Example:

```text id="cf05"
Cloudflare

↓

Azure VM

↓

Ubuntu

↓

Nginx

↓

Node.js
```

Cloudflare does not replace your server—it protects and accelerates access to it.

---

## Cloudflare Edge Network

Cloudflare operates data centers across the world.

```text id="cf06"
Users

↓

Nearest Cloudflare Data Center

↓

Origin Server
```

Instead of every request traveling directly to your server, users first connect to the nearest Cloudflare edge location.

This reduces latency and improves performance.

---

## DNS Management

Cloudflare also provides DNS hosting.

Example:

```text id="cf07"
example.com

↓

Cloudflare DNS

↓

Public IP
```

Cloudflare's DNS service resolves domain names while also supporting optional proxying through its edge network.

---

## DNS Proxy

Cloudflare can proxy DNS records.

Example:

```text id="cf08"
User

↓

Cloudflare

↓

Origin Server
```

Instead of revealing the origin server directly, requests pass through Cloudflare's infrastructure.

When a DNS record is proxied, the client connects to a Cloudflare IP rather than the origin server's Public IP.

---

## Hiding the Origin IP

Without Cloudflare:

```text id="cf09"
Browser

↓

Origin IP Visible
```

With Cloudflare:

```text id="cf10"
Browser

↓

Cloudflare IP

↓

Origin IP Hidden
```

Hiding the origin IP adds another layer of protection against direct attacks.

---

## Content Delivery Network (CDN)

Cloudflare includes a global **Content Delivery Network (CDN)**.

Static assets such as:

- Images
- CSS
- JavaScript
- Fonts
- Videos (depending on configuration)
- Documents

can be served from Cloudflare's edge locations.

Example:

```text id="cf11"
User

↓

Nearest Cloudflare Server

↓

Cached Image
```

This reduces the distance data must travel.

---

## Dynamic vs Static Content

Not every request is cached.

| Content Type     | Typical Handling                                        |
| ---------------- | ------------------------------------------------------- |
| Images           | Cached                                                  |
| CSS              | Cached                                                  |
| JavaScript       | Cached                                                  |
| Fonts            | Cached                                                  |
| API Responses    | Usually forwarded to origin unless configured otherwise |
| Database Queries | Processed by the origin server                          |

Cloudflare primarily accelerates cacheable content while forwarding dynamic requests to the application server.

---

## DDoS Protection

Cloudflare helps protect websites against Distributed Denial-of-Service (DDoS) attacks.

Without protection:

```text id="cf12"
Millions of Requests

↓

Origin Server

↓

Overloaded
```

With Cloudflare:

```text id="cf13"
Millions of Requests

↓

Cloudflare

↓

Filtered Traffic

↓

Origin Server
```

Malicious traffic can be filtered before it reaches the application.

---

## Web Application Firewall (WAF)

Cloudflare offers a Web Application Firewall.

Example:

```text id="cf14"
Incoming Request

↓

Cloudflare WAF

↓

Allowed?

↓

Origin Server
```

The WAF can block many common web attacks based on configurable security rules.

---

## SSL/TLS Support

Cloudflare simplifies HTTPS deployment.

Architecture:

```text id="cf15"
Browser

↓

HTTPS

↓

Cloudflare

↓

HTTPS

↓

Origin Server
```

The connection between the browser, Cloudflare, and the origin server can all be encrypted.

The next chapter covers Cloudflare SSL/TLS modes in detail.

---

## Caching

Cloudflare stores frequently requested static resources at edge locations.

```text id="cf16"
First Request

↓

Origin Server

↓

Cloudflare Cache
```

Later requests:

```text id="cf17"
User

↓

Cloudflare Cache

↓

Response
```

This reduces load on the origin server and decreases response times.

---

## Typical Production Architecture

```text id="cf18"
Users
   │
   ▼
Cloudflare
   │
   ▼
Azure Public IP
   │
   ▼
Network Security Group
   │
   ▼
Ubuntu VM
   │
   ▼
Nginx
   │
   ▼
Node.js
```

Cloudflare serves as the public entry point while the Azure Virtual Machine remains the origin server.

---

## Real-World Example

Suppose you deploy an Express.js application on an Azure Virtual Machine.

Without Cloudflare:

- Users connect directly to the server.
- The server handles every request.
- The origin IP is publicly exposed.
- Static assets are served from a single location.

After enabling Cloudflare:

- DNS is managed through Cloudflare.
- Users connect to the nearest Cloudflare edge location.
- Static files are cached closer to users.
- Cloudflare filters malicious traffic.
- The origin IP is hidden behind Cloudflare's proxy.
- The server primarily handles dynamic application requests.

The application becomes more secure and can often serve users with lower latency.

---

## Benefits of Cloudflare

| Feature             | Benefit                             |
| ------------------- | ----------------------------------- |
| DNS Hosting         | Fast and reliable DNS resolution    |
| Reverse Proxy       | Hides the origin server             |
| CDN                 | Faster delivery of static assets    |
| DDoS Protection     | Mitigates large-scale attacks       |
| SSL/TLS             | Simplifies secure HTTPS connections |
| WAF                 | Filters common web attacks          |
| Global Edge Network | Lower latency for users worldwide   |
| Caching             | Reduces origin server load          |

---

## Best Practices

- Proxy public web applications through Cloudflare.
- Keep the origin server updated and secured.
- Enable HTTPS for both client and origin connections.
- Cache static assets appropriately.
- Monitor Cloudflare analytics and security events.
- Restrict direct access to the origin server where possible.
- Review DNS records regularly.

---

## Common Mistakes

#### Treating Cloudflare as a Hosting Provider

Cloudflare is not where your application runs. Your application still executes on your origin server.

---

#### Assuming Everything Is Cached

Dynamic content is typically forwarded to the origin server unless specific caching rules are configured.

---

#### Exposing the Origin Server Directly

If the origin server remains publicly accessible without appropriate restrictions, attackers may bypass Cloudflare.

---

#### Ignoring Cache Configuration

Improper cache settings can lead to stale content or missed performance improvements.

---

#### Forgetting Origin Security

Cloudflare enhances security but does not replace server hardening, operating system updates, firewalls, or secure application development.

---

## Summary

Cloudflare is a reverse proxy and edge platform that sits between Internet users and an application's origin server. It provides DNS hosting, a global CDN, DDoS protection, caching, SSL/TLS support, and web application security while helping reduce latency and shield the origin server from direct exposure. When combined with Azure Virtual Machines, Nginx, and proper network security, Cloudflare becomes an important component of a modern, secure, and high-performance cloud architecture.

---

### Next Chapter

➡️ **12 - Cloudflare SSL/TLS**
