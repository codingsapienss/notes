---
sidebar_label: SSL Setup
sidebar_position: 6
---


# SSL Setup

## Overview

In the previous chapter, we connected our domain to the server.

Our application is now accessible using:

```text id="sslsetup01"
http://example.com
```

Although users can access the website, all communication currently uses **HTTP**, which means data is transferred without encryption.

For applications handling:

- User logins
- Payment information
- Personal details
- API tokens
- Cookies

HTTP is not sufficient.

To protect communication, websites use **HTTPS**, which encrypts data between the user's browser and the server.

In this chapter, we will configure HTTPS using SSL/TLS certificates and prepare the server for secure production traffic.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand the SSL setup process.
- Install Certbot.
- Obtain SSL certificates.
- Configure HTTPS in Nginx.
- Redirect HTTP traffic to HTTPS.
- Enable automatic certificate renewal.
- Integrate SSL with Cloudflare.

---

# HTTP vs HTTPS

Without HTTPS:

```text id="sslsetup02"
Browser

↓

HTTP

↓

Nginx

↓

Node.js
```

Data is transmitted without encryption.

With HTTPS:

```text id="sslsetup03"
Browser

↓

HTTPS

↓

Encrypted Connection

↓

Nginx

↓

Node.js
```

Sensitive information remains encrypted while traveling across the network.

---

# SSL Certificate

An SSL/TLS certificate proves the identity of a website and enables encrypted communication.

Example:

```text id="sslsetup04"
Website

↓

SSL Certificate

↓

HTTPS Enabled
```

Browsers verify the certificate before establishing a secure connection.

---

# Let's Encrypt

**Let's Encrypt** is a free Certificate Authority (CA) that issues trusted SSL/TLS certificates.

Benefits include:

- Free certificates
- Trusted by modern browsers
- Automated renewal
- Widely supported

It is one of the most common choices for production web servers.

---

# What is Certbot?

**Certbot** is a tool that automatically obtains and installs SSL certificates from Let's Encrypt.

Workflow:

```text id="sslsetup05"
Certbot

↓

Let's Encrypt

↓

SSL Certificate

↓

Nginx
```

Certbot can also modify Nginx configurations to enable HTTPS automatically.

---

# Installing Certbot

Update package information.

```bash id="sslcmd01"
sudo apt update
```

Install Certbot and the Nginx plugin.

```bash id="sslcmd02"
sudo apt install certbot python3-certbot-nginx -y
```

Verify installation.

```bash id="sslcmd03"
certbot --version
```

---

# Obtaining an SSL Certificate

Ensure that:

- The domain points to your server.
- Nginx is running.
- Port **80** is accessible.

Then run:

```bash id="sslcmd04"
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot performs the following tasks:

- Verifies domain ownership.
- Requests a certificate.
- Installs the certificate.
- Updates the Nginx configuration.
- Enables HTTPS.

---

# Certificate Installation Process

```text id="sslsetup06"
Domain

↓

Let's Encrypt Validation

↓

Certificate Issued

↓

Nginx Configured

↓

HTTPS Enabled
```

After successful validation, the website can serve secure HTTPS traffic.

---

# Nginx After SSL

A simplified configuration:

```nginx id="sslcfg01"
server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

Nginx terminates the HTTPS connection and forwards requests to the Node.js application.

---

# Redirecting HTTP to HTTPS

Users may still access:

```text id="sslsetup07"
http://example.com
```

Redirect HTTP requests to HTTPS.

Example:

```nginx id="sslcfg02"
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://$host$request_uri;
}
```

Result:

```text id="sslsetup08"
HTTP

↓

301 Redirect

↓

HTTPS
```

This ensures all users use encrypted connections.

---

# Testing the Configuration

Validate the Nginx configuration.

```bash id="sslcmd05"
sudo nginx -t
```

Reload Nginx.

```bash id="sslcmd06"
sudo systemctl reload nginx
```

Open:

```text id="sslsetup09"
https://example.com
```

A successful configuration displays the browser's secure connection indicator.

---

# Automatic Certificate Renewal

Let's Encrypt certificates are valid for a limited period and must be renewed.

Test renewal:

```bash id="sslcmd07"
sudo certbot renew --dry-run
```

Typical workflow:

```text id="sslsetup10"
Certificate

↓

Approaching Expiration

↓

Automatic Renewal

↓

Continue HTTPS
```

Most Certbot installations configure automatic renewal through a scheduled system task.

---

# Certificate Files

Common certificate locations:

| File            | Purpose                                  |
| --------------- | ---------------------------------------- |
| `fullchain.pem` | Server certificate and certificate chain |
| `privkey.pem`   | Private key                              |
| `chain.pem`     | Intermediate certificates                |
| `cert.pem`      | Server certificate                       |

These files are typically stored under:

```text id="sslsetup11"
/etc/letsencrypt/live/
```

---

# Firewall Configuration

Ensure HTTPS traffic is allowed.

```bash id="sslcmd08"
sudo ufw allow 443
```

Verify firewall status.

```bash id="sslcmd09"
sudo ufw status
```

Typical firewall configuration:

| Port | Purpose |
| ---- | ------- |
| 22   | SSH     |
| 80   | HTTP    |
| 443  | HTTPS   |

---

# Integrating with Cloudflare

If Cloudflare is used:

```text id="sslsetup12"
Browser

↓

Cloudflare

↓

HTTPS

↓

Nginx

↓

Node.js
```

Recommended Cloudflare SSL mode:

```text id="sslsetup13"
Full (Strict)
```

This provides encrypted communication between:

- Browser ↔ Cloudflare
- Cloudflare ↔ Origin Server

---

# Complete HTTPS Architecture

```text id="sslsetup14"
Users
   │
HTTPS
   │
   ▼
Cloudflare
   │
HTTPS
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

HTTPS protects communication across the entire public network path.

---

# SSL Deployment Workflow

```text id="sslsetup15"
Domain Ready

↓

Install Certbot

↓

Request Certificate

↓

Configure Nginx

↓

Enable HTTPS

↓

Redirect HTTP

↓

Test Website
```

---

# Deployment Verification Checklist

| Check                     | Expected Result |
| ------------------------- | --------------- |
| Domain Resolves           | ✓               |
| Certificate Installed     | ✓               |
| HTTPS Accessible          | ✓               |
| HTTP Redirects to HTTPS   | ✓               |
| Nginx Configuration Valid | ✓               |
| Automatic Renewal Tested  | ✓               |

---

# Real-World Example

Suppose a company hosts an Express.js application on an Azure Virtual Machine.

The deployment engineer:

1. Verifies that the domain points to the server.
2. Installs Certbot.
3. Requests a certificate for `company.com` and `www.company.com`.
4. Configures Nginx to listen on port **443**.
5. Redirects HTTP traffic to HTTPS.
6. Opens port **443** in the firewall.
7. Tests certificate renewal.
8. Configures Cloudflare to use **Full (Strict)** SSL mode.

Users now access the application securely using HTTPS.

---

# Best Practices

- Always use HTTPS in production.
- Redirect all HTTP traffic to HTTPS.
- Keep Certbot up to date.
- Test certificate renewal regularly.
- Protect private key files.
- Use **Full (Strict)** mode when using Cloudflare.
- Verify SSL after every deployment.

---

# Common Mistakes

### Requesting a Certificate Before DNS Is Ready

Let's Encrypt must verify domain ownership. If DNS has not propagated correctly, certificate issuance will fail.

---

### Forgetting to Open Port 443

Even with a valid certificate, HTTPS will not work if firewall rules block incoming traffic.

---

### Not Redirecting HTTP to HTTPS

Users may continue accessing the insecure HTTP version of the website.

---

### Ignoring Certificate Renewal

Expired certificates produce browser warnings and may prevent users from accessing the website.

---

### Using Flexible SSL with Cloudflare Unnecessarily

For production environments where the origin server supports HTTPS, **Full (Strict)** provides stronger security by encrypting and validating both connections.

---

# Summary

SSL/TLS enables secure HTTPS communication by encrypting data exchanged between browsers and web servers. During deployment, Certbot and Let's Encrypt simplify obtaining and installing trusted certificates for Nginx. After configuring HTTPS, redirecting HTTP traffic, enabling automatic renewal, and using Cloudflare's **Full (Strict)** mode when applicable, a production Node.js application can provide secure, encrypted communication for all users.

---

## Next Chapter

➡️ **07 - PM2 Deployment**
