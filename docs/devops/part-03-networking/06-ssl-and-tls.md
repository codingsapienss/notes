---
sidebar_label: SSL and TLS
sidebar_position: 6
---


# SSL and TLS

### Overview

In the previous chapter, you learned that **HTTPS** is simply **HTTP running over TLS**.

But what exactly is **TLS**, and how does it secure communication between your browser and a web server?

Whenever you:

- Log into your bank account
- Make an online payment
- Access GitHub
- Use ChatGPT
- Connect to your production server
- Deploy an application using Cloudflare

your data is protected using **TLS**.

TLS provides:

- Encryption
- Authentication
- Data Integrity

Without TLS, anyone positioned between you and the server could potentially read, modify, or steal sensitive information.

This chapter explains how TLS works and why it is one of the most important technologies on the Internet.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand SSL and TLS.
- Learn why SSL was replaced by TLS.
- Understand encryption.
- Learn symmetric and asymmetric encryption.
- Understand digital certificates.
- Learn about Certificate Authorities (CAs).
- Understand the TLS handshake.
- Learn how HTTPS establishes a secure connection.

---

## What is SSL?

**SSL** stands for:

> **Secure Sockets Layer**

SSL was the original protocol used to secure communication over the Internet.

Earlier versions included:

- SSL 2.0
- SSL 3.0

These versions contained multiple security weaknesses and are now obsolete.

Today, when people say:

> "Install an SSL Certificate"

they almost always mean:

> "Install a TLS Certificate."

The term **SSL** remains popular even though modern systems use **TLS**.

---

## What is TLS?

**TLS** stands for:

> **Transport Layer Security**

TLS is the modern security protocol that replaced SSL.

It provides:

- Confidentiality
- Authentication
- Integrity

TLS is used by:

- HTTPS
- SMTP over TLS
- IMAPS
- FTPS
- VPNs
- API communication
- Cloud services

---

## Why Do We Need TLS?

Imagine sending your banking password over plain HTTP.

```text id="q1m7dh"
Browser

↓

Password

↓

Internet

↓

Server
```

Anyone intercepting the traffic could read the password.

With TLS:

```text id="k6v2ra"
Browser

↓

Encrypted Password

↓

Internet

↓

Server
```

Even if someone captures the traffic, the encrypted data is unreadable without the appropriate keys.

---

## What Does TLS Provide?

TLS provides three essential security properties.

### 1. Encryption

Encryption converts readable data into unreadable ciphertext.

```text id="w8p5lc"
Hello

↓

Encryption

↓

X8#Q!@91P
```

Only authorized parties can decrypt the ciphertext.

---

### 2. Authentication

TLS verifies that you are communicating with the intended server.

For example, when visiting:

```text id="a3r8qy"
https://github.com
```

TLS helps ensure you are connected to GitHub's servers rather than an attacker pretending to be GitHub.

---

### 3. Data Integrity

TLS detects whether data has been altered during transmission.

If any part of the encrypted communication is modified, the integrity check fails and the connection is terminated.

---

## Symmetric Encryption

Symmetric encryption uses the **same key** for both encryption and decryption.

```text id="m2n9fk"
Shared Secret Key

↓

Encrypt

↓

Internet

↓

Decrypt

↓

Shared Secret Key
```

Advantages:

- Very fast
- Efficient
- Suitable for large amounts of data

Disadvantage:

Both parties must already share the same secret key.

---

## Asymmetric Encryption

Asymmetric encryption uses **two different keys**.

- Public Key
- Private Key

```text id="v5k1xp"
Public Key

↓

Encrypt

↓

Internet

↓

Private Key

↓

Decrypt
```

The public key can be shared freely.

The private key must remain secret.

Advantages:

- Secure key exchange
- Digital signatures
- Authentication

Disadvantage:

Asymmetric encryption is significantly slower than symmetric encryption.

---

## Why TLS Uses Both

TLS combines the strengths of both encryption methods.

```text id="x8j4rm"
Asymmetric Encryption

↓

Securely Exchange Session Key

↓

Symmetric Encryption

↓

Fast Data Transfer
```

This hybrid approach provides both security and performance.

---

## Digital Certificates

How does your browser know that a server's public key actually belongs to the correct website?

The answer is a **digital certificate**.

A certificate contains information such as:

- Domain name
- Public key
- Issuing Certificate Authority
- Expiration date
- Digital signature

Example:

```text id="n6v3ba"
example.com

↓

TLS Certificate

↓

Public Key
```

---

## Certificate Authority (CA)

A **Certificate Authority (CA)** is a trusted organization that verifies domain ownership and issues digital certificates.

Popular CAs include:

- Let's Encrypt
- DigiCert
- GlobalSign
- Sectigo

When a browser receives a certificate, it verifies that it was signed by a trusted CA.

---

## The TLS Handshake

Before encrypted communication begins, the client and server perform a **TLS Handshake**.

The handshake establishes:

- Identity
- Encryption algorithms
- Session keys

---

### Step 1 — Client Hello

The browser sends:

- Supported TLS versions
- Supported cipher suites
- Random value

```text id="h4p8wd"
Browser

↓

Client Hello
```

---

### Step 2 — Server Hello

The server responds with:

- Selected TLS version
- Cipher suite
- Server certificate

```text id="c7m2lj"
Server

↓

Certificate
```

---

### Step 3 — Certificate Verification

The browser verifies:

- The certificate is valid.
- The certificate has not expired.
- The domain name matches.
- The issuing CA is trusted.

If any check fails, the browser displays a security warning.

---

### Step 4 — Session Key Exchange

Using asymmetric cryptography, the browser and server securely establish a shared session key.

This key is used for subsequent communication.

---

### Step 5 — Secure Communication

Once the handshake is complete:

```text id="r9w5vn"
HTTPS Request

↓

Encrypted

↓

HTTPS Response
```

All application data is encrypted using the negotiated session key.

---

## TLS Handshake Summary

```text id="t2k8py"
Browser
     │
Client Hello
     │
Server Hello
     │
Certificate Verification
     │
Session Key Exchange
     │
Encrypted Communication
```

The handshake typically completes in milliseconds.

---

## Self-Signed vs Trusted Certificates

### Self-Signed Certificate

Generated by the server owner.

Advantages:

- Free
- Easy to create
- Useful for development

Disadvantages:

- Not trusted by browsers
- Security warnings are displayed

---

### Trusted Certificate

Issued by a recognized Certificate Authority.

Advantages:

- Trusted automatically by browsers
- Suitable for production
- Supports secure public websites

---

## Certificate Expiration

Certificates have an expiration date.

Example:

```text id="y7m1hq"
Valid From

↓

July 1

↓

Valid Until

↓

September 29
```

Expired certificates result in browser security warnings and should be renewed before they expire.

---

## HTTPS Connection Flow

Putting everything together:

```text id="g6r3vc"
Browser
      │
DNS Lookup
      │
TCP Connection
      │
TLS Handshake
      │
HTTPS Request
      │
Nginx
      │
Node.js
      │
HTTPS Response
```

This sequence occurs whenever a user accesses a secure website.

---

## Checking TLS Certificates

View certificate details using OpenSSL:

```bash id="k5n9rx"
openssl s_client -connect example.com:443
```

Display certificate dates:

```bash id="m8p4qt"
openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

These commands are commonly used when troubleshooting production servers.

---

## Real-World Example

Consider your production architecture.

```text id="p3v8mf"
Browser
      │
HTTPS
      │
Cloudflare
      │
TLS Connection
      │
Azure Virtual Machine
      │
Nginx
      │
Node.js
```

When a user visits your domain:

1. DNS resolves the domain to Cloudflare.
2. A TCP connection is established.
3. Cloudflare presents a trusted TLS certificate.
4. The browser verifies the certificate.
5. A secure session key is negotiated.
6. All HTTP traffic is encrypted.
7. Cloudflare communicates with your origin server according to your configured SSL mode (for example, **Full** or **Full (Strict)**).

This is the same architecture used by many production deployments.

---

## Best Practices

- Use TLS instead of legacy SSL.
- Always deploy trusted certificates for public services.
- Renew certificates before expiration.
- Disable obsolete protocols such as SSL 2.0 and SSL 3.0.
- Prefer modern TLS versions (TLS 1.2 and TLS 1.3).
- Verify certificate validity after deployment.

---

## Common Mistakes

#### Thinking SSL and TLS Are Different Technologies Today

In modern deployments, references to "SSL certificates" almost always mean TLS certificates.

---

#### Using Self-Signed Certificates in Production

Browsers do not trust self-signed certificates by default.

Use certificates issued by a trusted Certificate Authority for public-facing applications.

---

#### Ignoring Certificate Expiration

Expired certificates cause browser warnings and may prevent users from accessing your application.

Monitor certificate expiration dates and automate renewal where possible.

---

#### Assuming HTTPS Alone Protects Everything

HTTPS secures data in transit.

It does not protect against application vulnerabilities, weak authentication, or insecure server configurations.

---

## Summary

TLS is the modern security protocol that protects Internet communication by providing encryption, authentication, and data integrity. Using digital certificates issued by trusted Certificate Authorities, TLS verifies server identities and establishes encrypted sessions through the TLS handshake. HTTPS builds on this foundation to secure web traffic, making TLS an essential component of modern web applications, APIs, cloud infrastructure, and production deployments.

Understanding TLS prepares you for configuring secure reverse proxies, managing certificates, deploying HTTPS with Nginx, and using services such as Cloudflare and Azure securely.

---

### Next Chapter

➡️ **07 - Reverse Proxy**
