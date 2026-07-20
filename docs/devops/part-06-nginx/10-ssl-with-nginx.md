---
sidebar_label: SSL with Nginx
sidebar_position: 10
---


# SSL with Nginx

### Overview

So far, we have built a production-ready Nginx server capable of:

- Hosting websites
- Reverse proxying backend applications
- Serving static files
- Compressing responses
- Caching resources

However, one critical problem still exists.

Suppose your website is available at:

```text id="v83qtx"
http://example.com
```

All communication between the browser and your server is transmitted in **plain text**.

This means anyone able to intercept the network traffic may be able to read or modify the transmitted data.

To solve this problem, modern websites use **HTTPS**, which encrypts communication using **SSL/TLS**.

In this chapter, you will learn how SSL works, how Nginx handles HTTPS, and how to configure SSL certificates using **Let's Encrypt**.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand HTTP vs HTTPS.
- Learn how SSL/TLS encryption works.
- Understand SSL certificates.
- Configure HTTPS in Nginx.
- Install Let's Encrypt certificates.
- Redirect HTTP traffic to HTTPS.
- Follow production security best practices.

---

## What is HTTP?

HTTP (HyperText Transfer Protocol) is the standard protocol used for communication between web browsers and web servers.

Example:

```text id="6d8q2o"
Browser
     │
 HTTP
     │
     ▼
Web Server
```

The problem:

- No encryption
- Data travels in plain text
- Vulnerable to interception
- Vulnerable to modification during transmission

---

## What is HTTPS?

HTTPS is simply:

```text id="l52m3j"
HTTP

+

SSL/TLS
```

Instead of transmitting readable data:

```text id="vgh0eq"
Username

Password

Cookies
```

the information is encrypted before it leaves the browser.

Workflow:

```text id="jq3wkc"
Browser
     │
Encrypted Data
     │
     ▼
Nginx
```

Anyone intercepting the traffic sees encrypted data rather than the original content.

---

## Why HTTPS is Important

Without HTTPS:

```text id="m4glz5"
Browser

↓

Internet

↓

Attacker Can Read Traffic

↓

Server
```

With HTTPS:

```text id="h2zv7m"
Browser

↓

Encrypted Connection

↓

Internet

↓

Server
```

Encryption protects data while it travels across the network.

---

## What is SSL/TLS?

Historically:

- SSL = Secure Sockets Layer
- TLS = Transport Layer Security

Today, TLS is the modern protocol, although the term **SSL** is still commonly used.

For simplicity, administrators often refer to SSL certificates even though modern deployments use TLS.

---

## What is an SSL Certificate?

An SSL certificate is a digital certificate that proves the identity of a website.

It contains information such as:

- Domain name
- Public key
- Certificate issuer
- Expiration date
- Digital signature

Example:

```text id="5dtj1o"
example.com

↓

SSL Certificate

↓

Verified Identity
```

Browsers use certificates to establish secure connections with servers.

---

## HTTPS Connection Workflow

```text id="91m7lj"
Browser
      │
HTTPS Request
      │
      ▼
Nginx
      │
SSL Certificate
      │
      ▼
Encrypted Connection
      │
      ▼
Application
```

Nginx terminates the HTTPS connection and forwards requests to the backend application.

---

## What is Let's Encrypt?

**Let's Encrypt** is a free Certificate Authority (CA) that issues trusted SSL/TLS certificates.

Benefits:

- Free
- Trusted by major browsers
- Automated certificate renewal
- Widely supported
- Production-ready

Let's Encrypt has made HTTPS accessible for websites of all sizes.

---

## Installing Certbot

On Ubuntu:

```bash id="fdz4ut"
sudo apt update

sudo apt install certbot python3-certbot-nginx
```

Verify installation:

```bash id="o7m18i"
certbot --version
```

---

## Obtaining a Certificate

Assume your domain:

```text id="j0h1mk"
example.com
```

Request a certificate:

```bash id="jlwmwq"
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot will:

- Verify domain ownership.
- Request a certificate from Let's Encrypt.
- Configure Nginx automatically (when possible).
- Reload Nginx.

---

## Certificate Files

After successful installation, certificates are typically stored in:

```text id="9kxftx"
/etc/letsencrypt/live/

example.com/
```

Common files:

| File            | Purpose                   |
| --------------- | ------------------------- |
| `fullchain.pem` | Certificate chain         |
| `privkey.pem`   | Private key               |
| `cert.pem`      | Server certificate        |
| `chain.pem`     | Intermediate certificates |

The private key must be protected and should never be shared publicly.

---

## Basic HTTPS Server Block

Example:

```nginx id="4w4jlwm"
server {

    listen 443 ssl;

    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {

        proxy_pass http://localhost:3000;

    }

}
```

Explanation:

| Directive             | Purpose                         |
| --------------------- | ------------------------------- |
| `listen 443 ssl`      | Accept HTTPS traffic            |
| `ssl_certificate`     | Path to the certificate         |
| `ssl_certificate_key` | Path to the private key         |
| `proxy_pass`          | Forward requests to the backend |

---

## HTTP to HTTPS Redirect

Users may still visit:

```text id="rdr4xu"
http://example.com
```

A common practice is to redirect all HTTP traffic to HTTPS.

Example:

```nginx id="w25txj"
server {

    listen 80;

    server_name example.com;

    return 301 https://$host$request_uri;

}
```

Workflow:

```text id="krg2d7"
Browser

↓

HTTP

↓

Nginx

↓

301 Redirect

↓

HTTPS
```

This ensures all users access the secure version of the website.

---

## HTTPS Request Lifecycle

```text id="plx4sq"
Browser
      │
HTTPS Request
      │
      ▼
Nginx
      │
Decrypt
      │
      ▼
Reverse Proxy
      │
      ▼
Node.js
      │
      ▼
Response
      │
Encrypt
      │
      ▼
Browser
```

Encryption and decryption occur at the Nginx layer.

---

## SSL Termination

One of Nginx's major responsibilities is **SSL Termination**.

Instead of every backend application handling encryption:

```text id="iz73t8"
Browser

↓

HTTPS

↓

Nginx

↓

HTTP

↓

Node.js
```

The backend communicates with Nginx over a trusted internal connection.

Benefits:

- Simpler backend configuration
- Reduced application overhead
- Centralized certificate management
- Easier certificate renewal

---

## Automatic Certificate Renewal

Let's Encrypt certificates are valid for approximately **90 days**.

Renew manually:

```bash id="bmtd6w"
sudo certbot renew
```

Test renewal:

```bash id="p8xw3q"
sudo certbot renew --dry-run
```

Many Linux distributions automatically configure scheduled renewal jobs when Certbot is installed.

---

## Checking HTTPS

Test Nginx configuration:

```bash id="sbs4na"
sudo nginx -t
```

Reload Nginx:

```bash id="nbm1qc"
sudo systemctl reload nginx
```

Verify certificate information:

```bash id="vtyb7l"
openssl s_client -connect example.com:443
```

View certificate expiry:

```bash id="0hd8ee"
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Typical Production Architecture

```text id="xl5jsk"
Browser
      │
HTTPS
      │
      ▼
Cloudflare
      │
HTTPS
      │
      ▼
Nginx
      │
HTTP
      │
      ▼
PM2
      │
      ▼
Node.js
      │
      ▼
MongoDB Atlas
```

Some deployments also use HTTPS between Nginx and the backend, particularly when services are distributed across different machines or networks.

---

## Common SSL Ports

| Port | Purpose |
| ---- | ------- |
| 80   | HTTP    |
| 443  | HTTPS   |

Port **80** is commonly used only to redirect clients to HTTPS.

---

## Real-World Example

Suppose an Express.js application runs on:

```text id="h7qls5"
localhost:3000
```

Users access:

```text id="mjlwm8"
https://shop.example.com
```

The request flow is:

```text id="0rmx8h"
Browser

↓

HTTPS

↓

Nginx

↓

Decrypt Request

↓

Node.js

↓

Response

↓

Encrypt Response

↓

Browser
```

The backend application never needs to manage SSL certificates directly because Nginx handles encryption at the edge.

---

## Best Practices

- Always use HTTPS in production.
- Redirect HTTP traffic to HTTPS.
- Use Let's Encrypt for trusted certificates.
- Protect private key files with appropriate permissions.
- Enable automatic certificate renewal.
- Test renewal periodically with `--dry-run`.
- Validate Nginx configuration using `nginx -t` before reloading.

---

## Common Mistakes

#### Exposing Websites Over HTTP Only

Modern websites should serve users over HTTPS to protect transmitted data.

---

#### Forgetting Certificate Renewal

Expired certificates cause browsers to display security warnings and may block access.

---

#### Sharing Private Keys

The private key should remain confidential and accessible only to authorized processes.

---

#### Not Redirecting HTTP

Allowing both HTTP and HTTPS can lead to inconsistent user experiences and reduced security.

---

#### Ignoring Configuration Validation

Always test the configuration before reloading Nginx.

```bash id="ubjlwm"
sudo nginx -t
```

---

## Summary

HTTPS is an essential component of modern web infrastructure. By using SSL/TLS certificates, Nginx encrypts communication between browsers and servers, protecting sensitive information during transmission. Let's Encrypt provides trusted certificates at no cost, while Certbot automates certificate issuance and renewal. Nginx performs SSL termination, allowing backend applications to focus on business logic while the web server manages encryption, certificate handling, and secure client communication.

---

### Next Chapter

➡️ **11 - Logging**
