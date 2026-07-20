---
sidebar_label: SSL/TLS Troubleshooting
sidebar_position: 8
---


# SSL/TLS Troubleshooting

### Overview

SSL (Secure Sockets Layer) and its successor TLS (Transport Layer Security) encrypt communication between clients and servers.

Although users simply see a padlock in their browser, multiple components work together to establish a secure HTTPS connection.

An SSL issue may originate from:

- Expired certificates
- Incorrect certificate paths
- Invalid private keys
- Certificate chain problems
- Cloudflare SSL configuration
- Nginx configuration errors
- Incorrect domain configuration
- Firewall or networking problems

Because HTTPS is now the standard for almost every website, SSL troubleshooting is an essential production skill.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand the SSL/TLS handshake.
- Diagnose common SSL errors.
- Verify certificate installation.
- Troubleshoot Nginx SSL configuration.
- Understand Cloudflare SSL modes.
- Validate certificate chains.
- Use OpenSSL for debugging.
- Apply SSL troubleshooting best practices.

---

## HTTPS Connection Flow

A secure connection involves several layers.

```text
Browser

↓

DNS

↓

Cloudflare (Optional)

↓

TLS Handshake

↓

Nginx

↓

Node.js

↓

Application
```

A failure anywhere in this process can prevent HTTPS from working.

---

## SSL Troubleshooting Workflow

Always troubleshoot methodically.

```text
HTTPS Issue

↓

Check Certificate

↓

Check Nginx

↓

Check Cloudflare

↓

Check DNS

↓

Check Origin

↓

Verify

↓

Fix

↓

Retest
```

Avoid changing multiple SSL settings simultaneously.

---

## Understanding the TLS Handshake

Before encrypted communication begins, both client and server perform a TLS handshake.

```text
Browser

↓

Hello

↓

Server Certificate

↓

Certificate Validation

↓

Session Key

↓

Encrypted Communication
```

If certificate validation fails, the browser terminates the connection.

---

## Step 1 – Verify HTTPS

Test HTTPS locally.

```bash
curl -I https://localhost -k
```

Test the public domain.

```bash
curl -I https://example.com
```

Expected response:

```text
HTTP/1.1 200 OK
```

This confirms that HTTPS is functioning correctly.

---

## Step 2 – Verify Nginx Configuration

Check configuration syntax.

```bash
sudo nginx -t
```

Verify the service.

```bash
sudo systemctl status nginx
```

Reload after changes.

```bash
sudo systemctl reload nginx
```

An invalid Nginx configuration can prevent HTTPS from starting.

---

## Step 3 – Verify Certificate Files

Typical certificate configuration:

```text
ssl_certificate

↓

Certificate File

ssl_certificate_key

↓

Private Key
```

Verify that:

- Certificate file exists.
- Private key exists.
- Correct paths are configured.
- Nginx has permission to read the files.

---

## Step 4 – Verify Certificate Expiration

Certificates eventually expire.

View certificate information.

```bash
openssl x509 -in certificate.crt -text -noout
```

Check expiration.

```bash
openssl x509 -enddate -noout -in certificate.crt
```

Example:

```text
Not After:

Jul 20 2027
```

Expired certificates must be renewed before browsers will trust them.

---

## Step 5 – Verify Certificate Chain

Modern browsers require a complete certificate chain.

Example:

```text
Browser

↓

Intermediate Certificate

↓

Root Certificate
```

If intermediate certificates are missing, browsers may display certificate errors even though the certificate itself is valid.

---

## Step 6 – Test the TLS Handshake

OpenSSL provides detailed TLS diagnostics.

```bash
openssl s_client -connect example.com:443
```

Example output includes:

- Certificate chain
- Cipher suite
- TLS version
- Verification status

This command is invaluable for SSL troubleshooting.

---

## Step 7 – Verify Listening Ports

HTTPS requires port **443**.

Check listening ports.

```bash
ss -tulpn | grep 443
```

Example:

```text
443

LISTEN
```

If port **443** is not listening:

- Nginx may not be running.
- SSL configuration may be invalid.
- Another process may already be using the port.

---

## Step 8 – Verify Firewall

Allow HTTPS traffic.

Ubuntu:

```bash
sudo ufw status
```

Allow HTTPS.

```bash
sudo ufw allow 443
```

Verify cloud firewalls as well.

- AWS Security Groups
- Azure Network Security Groups
- Cloud Firewalls

---

## Understanding Common SSL Errors

### NET::ERR_CERT_DATE_INVALID

Cause:

- Expired certificate.

Solution:

- Renew the certificate.

---

### NET::ERR_CERT_COMMON_NAME_INVALID

Cause:

- Certificate issued for another domain.

Solution:

- Install the correct certificate.

---

### NET::ERR_SSL_PROTOCOL_ERROR

Possible causes:

- Invalid SSL configuration.
- Unsupported TLS version.
- Misconfigured reverse proxy.

---

### SSL Handshake Failed

Possible causes:

- Invalid certificate.
- Incorrect private key.
- Certificate mismatch.
- Cloudflare SSL mode mismatch.

Flow:

```text
Browser

↓

Handshake

↓

Failed
```

---

## Cloudflare SSL Modes

Cloudflare supports several SSL modes.

| Mode          | Browser → Cloudflare | Cloudflare → Origin            |
| ------------- | -------------------- | ------------------------------ |
| Off           | HTTP                 | HTTP                           |
| Flexible      | HTTPS                | HTTP                           |
| Full          | HTTPS                | HTTPS                          |
| Full (Strict) | HTTPS                | HTTPS + Certificate Validation |

Using the wrong SSL mode frequently causes HTTPS failures.

---

## Let's Encrypt Problems

Common issues:

- Certificate expired.
- Renewal failed.
- DNS validation failure.
- Port 80 unavailable.
- Incorrect domain configuration.

Verify Certbot.

```bash
sudo certbot certificates
```

Test renewal.

```bash
sudo certbot renew --dry-run
```

Testing renewals regularly helps prevent certificate expiration.

---

## Redirect Problems

Incorrect redirects can create loops.

Example:

```text
HTTP

↓

Redirect

↓

HTTPS

↓

Redirect

↓

HTTP

↓

Loop
```

Symptoms:

- Browser reports "Too Many Redirects."
- Website never loads.

Verify both Nginx and Cloudflare redirect rules.

---

## SSL Troubleshooting Decision Tree

```text
HTTPS Failure

        │

        ▼

Certificate Valid?

  │            │

 No           Yes

 │

Renew

             │

             ▼

Nginx Running?

             │

             ▼

443 Listening?

             │

             ▼

Cloudflare SSL?

             │

             ▼

Fix
```

Following this order helps isolate the root cause quickly.

---

## Useful SSL Commands

| Command                   | Purpose                         |
| ------------------------- | ------------------------------- |
| `nginx -t`                | Validate Nginx configuration    |
| `systemctl status nginx`  | Check Nginx                     |
| `openssl s_client`        | Test TLS handshake              |
| `openssl x509 -text`      | View certificate details        |
| `openssl x509 -enddate`   | Check expiration                |
| `curl -I https://...`     | Test HTTPS                      |
| `ss -tulpn`               | Check listening ports           |
| `certbot certificates`    | View Let's Encrypt certificates |
| `certbot renew --dry-run` | Test renewal process            |

---

## Production Troubleshooting Workflow

```text
HTTPS Error

↓

Certificate

↓

Certificate Chain

↓

Nginx

↓

443

↓

Cloudflare

↓

Firewall

↓

Fix

↓

Verify
```

A structured workflow prevents unnecessary configuration changes.

---

## Real-World Example

Users report that browsers display **NET::ERR_CERT_DATE_INVALID** for a production website.

The administrator investigates:

1. Tests HTTPS.

```bash
curl -I https://example.com
```

The connection fails with a certificate warning.

2. Checks certificate details.

```bash
openssl x509 -enddate -noout -in certificate.crt
```

Output:

```text
Not After:

Jul 15 2026
```

The certificate expired several days earlier.

3. Verifies Certbot.

```bash
sudo certbot certificates
```

Automatic renewal had failed because port **80** was temporarily blocked by a firewall rule during the previous maintenance window.

4. Restores firewall access.

```bash
sudo ufw allow 80
```

5. Renews the certificate.

```bash
sudo certbot renew
```

6. Reloads Nginx.

```bash
sudo systemctl reload nginx
```

7. Tests HTTPS again.

```bash
curl -I https://example.com
```

The response returns:

```text
HTTP/1.1 200 OK
```

The outage was caused by an expired certificate resulting from a failed automatic renewal process.

---

## Best Practices

- Monitor certificate expiration dates.
- Test HTTPS after every deployment.
- Validate Nginx configuration before reloading.
- Use **Full (Strict)** SSL whenever possible.
- Test certificate renewal regularly.
- Verify certificate chains.
- Keep ports **80** and **443** accessible when required for certificate renewal.
- Document SSL configuration changes.

---

## Common Mistakes

#### Ignoring Certificate Expiration

Expired certificates immediately break HTTPS for users.

---

#### Using the Wrong Cloudflare SSL Mode

A mismatch between Cloudflare and the origin server commonly causes handshake failures.

---

#### Forgetting to Reload Nginx

Installing a new certificate without reloading Nginx leaves the old certificate in use.

---

#### Installing the Wrong Certificate

Using a certificate issued for another domain results in browser trust errors.

---

#### Assuming Every HTTPS Error Is a Certificate Problem

SSL failures can also originate from firewall rules, incorrect Nginx configuration, DNS issues, or application connectivity problems.

---

## Summary

SSL/TLS troubleshooting involves validating certificates, verifying certificate chains, testing TLS handshakes, checking Nginx configuration, confirming Cloudflare SSL settings, ensuring HTTPS ports are available, and monitoring certificate expiration. A structured troubleshooting process enables administrators to quickly restore secure communication while maintaining user trust and minimizing production downtime.

---

### Next Chapter

➡️ **09 - Real-World Debugging**
