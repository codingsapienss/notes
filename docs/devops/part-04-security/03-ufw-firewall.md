---
sidebar_label: UFW Firewall
sidebar_position: 3
---


# UFW Firewall

### Overview

A firewall is one of the first lines of defense for any Linux server.

Even if your application is secure, exposing unnecessary ports to the Internet creates additional opportunities for attackers.

A firewall acts like a security guard standing at the entrance of your server.

It decides:

- Which traffic is allowed
- Which traffic is blocked
- Which services are accessible
- Which IP addresses can connect

For example, if your Node.js application only needs ports **80** and **443**, there is no reason to expose ports like **3000**, **3306**, or **6379** directly to the Internet.

A properly configured firewall significantly reduces your server's attack surface.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a firewall is.
- Learn how Linux firewalls work.
- Understand UFW and its relationship with iptables/nftables.
- Configure firewall rules.
- Allow and block ports.
- Restrict access by IP address.
- Secure a production Linux server using UFW.

---

## What is a Firewall?

A firewall is software (or hardware) that filters incoming and outgoing network traffic based on predefined rules.

Instead of allowing every request to reach your server, the firewall evaluates each connection.

```text id="m7v3xp"
Internet
     │
Firewall
     │
Linux Server
```

If traffic matches an allowed rule, it is forwarded.

Otherwise, it is rejected or ignored.

---

## Why Do We Need a Firewall?

Imagine a newly deployed server.

```text id="j2w8na"
Internet
     │
Ubuntu Server
```

If every service is publicly accessible:

- SSH
- Node.js
- MongoDB
- Redis
- MySQL

an attacker can attempt to connect to all of them.

Now introduce a firewall.

```text id="n8r5pk"
Internet
     │
Firewall
     │
Allowed
  │     │
22    443
```

Everything else is blocked.

This dramatically reduces the attack surface.

---

## Linux Firewall Architecture

On Linux, packet filtering is performed by the kernel.

Historically, administrators configured it using:

- `iptables`

Modern Linux distributions increasingly use:

- `nftables`

Ubuntu provides **UFW (Uncomplicated Firewall)** as a simpler interface.

```text id="a6k2yt"
Administrator

↓

UFW

↓

iptables / nftables

↓

Linux Kernel

↓

Network Traffic
```

You manage UFW, and UFW manages the underlying firewall rules.

---

## What is UFW?

**UFW** stands for:

> **Uncomplicated Firewall**

It is the default firewall management tool on Ubuntu.

Benefits include:

- Easy syntax
- Quick configuration
- Suitable for beginners
- Production ready
- Built on proven Linux firewall technology

---

## Checking UFW Status

Check whether UFW is enabled.

```bash id="f3m9wb"
sudo ufw status
```

Example:

```text id="g5q7xr"
Status: active
```

Detailed output:

```bash id="u8n4pt"
sudo ufw status verbose
```

---

## Default Firewall Policies

A secure firewall begins with sensible defaults.

Recommended configuration:

```text id="h1k8vf"
Incoming

↓

DENY
```

```text id="x6r3jm"
Outgoing

↓

ALLOW
```

This means:

- New incoming connections are blocked unless explicitly allowed.
- The server may initiate outbound connections.

View default policies:

```bash id="m2p5zd"
sudo ufw status verbose
```

---

## Enabling UFW

Enable the firewall:

```bash id="v4n8qt"
sudo ufw enable
```

Disable it:

```bash id="r9m2jc"
sudo ufw disable
```

Reload rules:

```bash id="k7w5lh"
sudo ufw reload
```

---

## Allowing Services

Allow SSH:

```bash id="t5x8vr"
sudo ufw allow ssh
```

Equivalent:

```bash id="w3m6pk"
sudo ufw allow 22
```

Allow HTTP:

```bash id="n1v9yf"
sudo ufw allow 80
```

Allow HTTPS:

```bash id="q6k4zt"
sudo ufw allow 443
```

---

## Blocking Services

Deny a port:

```bash id="e8w3rn"
sudo ufw deny 3000
```

Delete an existing rule:

```bash id="l2q7xm"
sudo ufw delete allow 3000
```

---

## Allowing Specific IP Addresses

Sometimes only trusted administrators should access SSH.

Example:

```bash id="c4v8py"
sudo ufw allow from 203.0.113.25 to any port 22
```

Now only that IP address can establish SSH connections.

This is much safer than exposing SSH to the entire Internet.

---

## Allowing Port Ranges

Example:

```bash id="b9m4qd"
sudo ufw allow 8000:8100/tcp
```

---

## TCP vs UDP Rules

Allow TCP:

```bash id="j7r2wf"
sudo ufw allow 443/tcp
```

Allow UDP:

```bash id="s6k9na"
sudo ufw allow 53/udp
```

Always specify the protocol when required.

---

## Viewing Firewall Rules

Numbered list:

```bash id="d3x5qp"
sudo ufw status numbered
```

Example:

```text id="z8m1tr"
[1] 22

ALLOW

Anywhere
```

Delete by number:

```bash id="h2v7kc"
sudo ufw delete 1
```

---

## Typical Production Firewall Rules

For a Node.js application behind Nginx:

| Port  | Purpose | Public                 |
| ----- | ------- | ---------------------- |
| 22    | SSH     | Restricted if possible |
| 80    | HTTP    | Yes                    |
| 443   | HTTPS   | Yes                    |
| 3000  | Node.js | No                     |
| 27017 | MongoDB | No                     |
| 6379  | Redis   | No                     |

Node.js, MongoDB, and Redis should normally listen only on private interfaces or localhost.

---

## Cloud Firewalls vs UFW

Cloud platforms provide their own firewall layer.

Examples:

| Cloud        | Firewall                     |
| ------------ | ---------------------------- |
| Azure        | Network Security Group (NSG) |
| AWS          | Security Group               |
| Google Cloud | VPC Firewall Rules           |

Production traffic often passes through **both** firewall layers.

```text id="y4r8mv"
Internet
      │
Azure NSG
      │
Ubuntu UFW
      │
Nginx
      │
Node.js
```

Traffic must be permitted by both the cloud firewall and UFW.

---

## Example Production Configuration

Suppose your server hosts:

- Nginx
- Node.js
- MongoDB
- Redis

Firewall policy:

```text id="k6q3wp"
22

ALLOW (Admin IP)

80

ALLOW

443

ALLOW

3000

BLOCK

27017

BLOCK

6379

BLOCK
```

Users access the application through Nginx.

Backend services remain inaccessible from the Internet.

---

## Checking Listening Ports

Before creating firewall rules, identify active services.

```bash id="x9m2jt"
ss -tulpn
```

Example:

```text id="r5v8kn"
22

SSH

80

Nginx

443

Nginx

3000

Node.js
```

This helps ensure only required services are exposed.

---

## Real-World Example

Consider an Azure deployment.

```text id="v8n5qa"
Internet
     │
Cloudflare
     │
Azure NSG
     │
Ubuntu Server
     │
UFW Firewall
     │
Nginx
     │
Node.js (localhost:3000)
```

Configuration:

- Azure NSG allows ports **80** and **443** from the Internet.
- SSH (22) is restricted to trusted administrator IP addresses where possible.
- UFW allows **22**, **80**, and **443**.
- Node.js listens on `127.0.0.1:3000`, so no firewall rule is required.
- MongoDB Atlas is hosted externally and is not exposed on the VM.

Even if someone scans the server, only the intended services are reachable.

---

## Best Practices

- Use a default **deny incoming** policy.
- Open only the ports your application requires.
- Restrict SSH access by IP address whenever possible.
- Keep backend services private.
- Review firewall rules regularly.
- Use both cloud firewalls and operating system firewalls.

---

## Common Mistakes

#### Allowing Every Port

Opening unnecessary ports increases the attack surface.

Expose only services that users genuinely need.

---

#### Forgetting the Cloud Firewall

Opening a port in UFW is not enough if the cloud firewall blocks it.

Similarly, opening a port in the cloud firewall does not bypass UFW.

Both layers must be configured correctly.

---

#### Exposing Backend Services

Services such as MongoDB, Redis, or Node.js should rarely be directly accessible from the Internet.

Place them behind a reverse proxy or bind them to private interfaces.

---

#### Enabling UFW Before Allowing SSH

If SSH is not allowed before enabling the firewall, remote administrators may lock themselves out of the server.

Always allow SSH access first.

---

## Summary

A firewall controls which network traffic is permitted to reach a Linux server, making it one of the most important security mechanisms in production environments. Ubuntu's UFW provides a simple interface for managing firewall rules while relying on the Linux kernel's packet filtering capabilities. By allowing only required services, restricting administrative access, and combining UFW with cloud firewall rules, administrators can significantly reduce a server's attack surface and improve overall security.

---

### Next Chapter

➡️ **04 - Fail2Ban**
