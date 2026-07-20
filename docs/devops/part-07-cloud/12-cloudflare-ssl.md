---
sidebar_label: Cloudflare SSL/TLS
sidebar_position: 12
---


# Cloudflare SSL/TLS

### Overview

In the previous chapter, we learned that Cloudflare acts as a reverse proxy between users and the origin server.

A request follows this path:

```text id="ssl01"
Browser
   │
   ▼
Cloudflare
   │
   ▼
Azure Virtual Machine
```

However, an important question remains:

**Is the data encrypted while traveling through the Internet?**

Imagine a user logging into your website.

The browser sends:

- Username
- Password
- Cookies
- Payment information
- Personal details

If this information travels as plain text, attackers may intercept it.

To prevent this, websites use **SSL/TLS encryption**.

Cloudflare provides several SSL/TLS modes that determine how encryption works between:

- Browser ↔ Cloudflare
- Cloudflare ↔ Origin Server

Understanding these modes is essential for deploying secure production applications.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand SSL and TLS.
- Learn how HTTPS works.
- Understand Cloudflare SSL/TLS architecture.
- Learn all Cloudflare SSL modes.
- Choose the correct SSL mode.
- Understand certificates.
- Follow production best practices.

---

## What is SSL/TLS?

**SSL (Secure Sockets Layer)** and **TLS (Transport Layer Security)** are protocols used to encrypt communication between systems.

Today, **TLS** is the modern protocol, although the term **SSL** is still widely used.

Encryption protects data such as:

- Passwords
- Payment details
- API tokens
- Cookies
- Personal information

---

## HTTP vs HTTPS

Without encryption:

```text id="ssl02"
Browser

↓

HTTP

↓

Server
```

Data is transmitted in plain text.

With encryption:

```text id="ssl03"
Browser

↓

HTTPS

↓

Encrypted Data

↓

Server
```

Even if traffic is intercepted, the encrypted content cannot be easily read.

---

## TLS Communication

When using Cloudflare, there are two separate network connections.

```text id="ssl04"
Browser

↓

TLS

↓

Cloudflare

↓

TLS

↓

Origin Server
```

Cloudflare independently manages each connection.

---

## Why Two Connections?

Cloudflare sits between users and the origin server.

```text id="ssl05"
User

↓

Cloudflare

↓

Azure VM
```

The browser does not communicate directly with the origin server.

Instead:

- Browser establishes a secure connection with Cloudflare.
- Cloudflare establishes another connection with the origin server.

These two connections may use different SSL/TLS configurations.

---

## SSL/TLS Modes

Cloudflare supports several encryption modes.

| Mode          | Browser → Cloudflare | Cloudflare → Origin           |
| ------------- | -------------------- | ----------------------------- |
| Off           | HTTP                 | HTTP                          |
| Flexible      | HTTPS                | HTTP                          |
| Full          | HTTPS                | HTTPS                         |
| Full (Strict) | HTTPS                | HTTPS (Validated Certificate) |

Choosing the appropriate mode is critical for security.

---

## Off Mode

Architecture:

```text id="ssl06"
Browser

↓

HTTP

↓

Cloudflare

↓

HTTP

↓

Server
```

Characteristics:

- No encryption.
- Not recommended for production.
- Suitable only for temporary testing in isolated environments.

---

## Flexible Mode

Architecture:

```text id="ssl07"
Browser

↓

HTTPS

↓

Cloudflare

↓

HTTP

↓

Origin Server
```

Advantages:

- Easy to configure.
- No certificate required on the origin server.

Disadvantages:

- Traffic between Cloudflare and the server is **not encrypted**.
- Not recommended for production systems.

---

## Full Mode

Architecture:

```text id="ssl08"
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

Characteristics:

- Encryption exists across both network connections.
- The origin server must support HTTPS.
- Cloudflare does **not** validate whether the origin certificate is issued by a trusted Certificate Authority.

This mode provides encryption but not full certificate validation.

---

## Full (Strict) Mode

Architecture:

```text id="ssl09"
Browser

↓

HTTPS

↓

Cloudflare

↓

HTTPS

↓

Origin Server

↓

Valid Certificate
```

Characteristics:

- End-to-end encryption.
- Origin certificate is validated.
- Highest level of security among the available SSL modes.

This is the recommended configuration for production deployments.

---

## Comparing SSL Modes

| Feature                   | Flexible | Full | Full (Strict) |
| ------------------------- | -------- | ---- | ------------- |
| Browser Encryption        | Yes      | Yes  | Yes           |
| Origin Encryption         | No       | Yes  | Yes           |
| Certificate Validation    | No       | No   | Yes           |
| Production Recommendation | No       | Good | Best          |

---

## What is an SSL Certificate?

An SSL/TLS certificate proves the identity of a server.

Example:

```text id="ssl10"
Website

↓

Certificate

↓

Trusted Identity
```

Certificates also contain the public keys used during encrypted communication.

---

## Certificate Authorities (CAs)

Certificates are typically issued by **Certificate Authorities (CAs)**.

Example:

```text id="ssl11"
Certificate Authority

↓

Certificate

↓

Website
```

Browsers trust certificates issued by recognized CAs.

---

## Cloudflare Origin Certificate

Cloudflare can generate a certificate specifically for communication between Cloudflare and the origin server.

Architecture:

```text id="ssl12"
Cloudflare

↓

Origin Certificate

↓

Azure VM
```

This certificate is intended for the connection between Cloudflare and your origin server and is not designed for direct browser trust.

---

## End-to-End Encryption

Production architecture:

```text id="ssl13"
Browser

↓

HTTPS

↓

Cloudflare

↓

HTTPS

↓

Nginx

↓

Node.js
```

Data remains encrypted while traveling across public networks.

---

## TLS Handshake (Simplified)

Before encrypted communication begins:

```text id="ssl14"
Browser

↓

Hello

↓

Certificate

↓

Key Exchange

↓

Encrypted Session
```

The TLS handshake establishes a secure session between the communicating parties.

---

## HTTPS Request Flow

Example:

```text id="ssl15"
User

↓

https://example.com

↓

Cloudflare

↓

Origin Server

↓

Response
```

All traffic uses encrypted HTTPS connections when Full (Strict) mode is correctly configured.

---

## Typical Production Deployment

```text id="ssl16"
Users
   │
   ▼
HTTPS
   │
   ▼
Cloudflare
   │
HTTPS (Full Strict)
   │
   ▼
Azure VM
   │
   ▼
Nginx
   │
   ▼
Node.js
```

This architecture provides encrypted communication throughout the network path.

---

## Common SSL Errors

Administrators may encounter SSL configuration issues.

| Error                        | Typical Cause                                   |
| ---------------------------- | ----------------------------------------------- |
| Certificate Expired          | Certificate renewal required                    |
| Certificate Not Trusted      | Invalid or untrusted certificate                |
| SSL Handshake Failed         | TLS negotiation problem                         |
| Mixed Content                | HTTPS page loading HTTP resources               |
| ERR_CERT_COMMON_NAME_INVALID | Certificate does not match the requested domain |

Understanding these errors simplifies troubleshooting.

---

## Real-World Example

Suppose you deploy a Node.js application on an Azure Virtual Machine.

Configuration:

- Ubuntu Server
- Nginx
- Cloudflare
- HTTPS enabled on the origin server
- Cloudflare Origin Certificate installed in Nginx

Cloudflare SSL mode:

```text id="ssl17"
Full (Strict)
```

Result:

- Browser connects securely to Cloudflare.
- Cloudflare securely connects to Nginx.
- Nginx forwards requests to the Node.js application.
- Sensitive user information remains encrypted throughout the network path.

This is a common production architecture for modern web applications.

---

## Best Practices

- Use **Full (Strict)** mode for production.
- Install valid certificates on the origin server.
- Renew certificates before expiration.
- Redirect HTTP traffic to HTTPS.
- Avoid serving HTTP resources from HTTPS pages.
- Disable weak or outdated TLS versions where appropriate.
- Regularly test SSL/TLS configuration after infrastructure changes.

---

## Common Mistakes

#### Using Flexible Mode in Production

Flexible mode leaves the connection between Cloudflare and the origin server unencrypted.

---

#### Forgetting to Install a Certificate on the Origin Server

Full and Full (Strict) modes require HTTPS support on the origin server.

---

#### Ignoring Certificate Expiration

Expired certificates can make websites inaccessible or produce browser security warnings.

---

#### Serving Mixed Content

Loading scripts, images, or stylesheets over HTTP from an HTTPS page causes browser warnings and may block those resources.

---

#### Choosing the Wrong SSL Mode

Using a mode that does not match the origin server's configuration can result in connection failures or security weaknesses.

---

## Summary

Cloudflare SSL/TLS protects communication between users and origin servers by encrypting network traffic. Because Cloudflare acts as a reverse proxy, it manages two separate TLS connections: one with the browser and another with the origin server. Cloudflare offers multiple SSL modes, ranging from unencrypted communication to fully validated end-to-end encryption. For production deployments, **Full (Strict)** mode, combined with a valid origin certificate, provides the strongest security and ensures encrypted communication across the entire request path.

---

### Next Chapter

➡️ **13 - Cloudflare CDN**
