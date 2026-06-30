---
sidebar_label: SSH Security
sidebar_position: 2
---


# SSH Security

## Overview

After deploying a Linux server, the first service most administrators configure is **SSH (Secure Shell)**.

SSH allows you to remotely access and manage a Linux server from anywhere in the world.

However, because SSH provides administrative access, it is also one of the most targeted services on the Internet.

Within minutes of assigning a public IP to a server, automated bots begin attempting:

- Password guessing
- Brute-force attacks
- Username enumeration
- Credential stuffing
- Exploitation of vulnerable SSH configurations

A properly configured SSH server is extremely secure. Most successful SSH compromises are caused by **weak passwords, poor configuration, or outdated software**, not weaknesses in the SSH protocol itself.

This chapter explains how SSH works and how to configure it securely for production environments.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand SSH and why it is used.
- Learn how SSH authentication works.
- Understand password and SSH key authentication.
- Generate and use SSH keys.
- Configure OpenSSH securely.
- Understand important `sshd_config` settings.
- Learn production SSH security best practices.

---

# What is SSH?

SSH stands for:

> **Secure Shell**

It is a secure network protocol used to remotely access Linux systems over an encrypted connection.

Instead of physically sitting in front of a server, an administrator can securely manage it from another computer.

Example:

```text id="g1k7va"
Administrator Laptop
          │
      Encrypted SSH
          │
          ▼
Linux Server
```

SSH is commonly used for:

- Remote server administration
- File transfers (SCP/SFTP)
- Git operations
- Remote command execution
- Secure tunneling

---

# Why SSH Replaced Telnet

Before SSH, administrators commonly used **Telnet**.

Telnet transmitted everything—including usernames and passwords—in plain text.

```text id="m4r8kp"
Administrator

↓

Telnet

↓

Username
Password

↓

Server
```

Anyone intercepting the traffic could read the credentials.

SSH encrypts all communication.

```text id="x6v2nf"
Administrator

↓

Encrypted Connection

↓

Linux Server
```

Today, Telnet is considered insecure for remote administration and has largely been replaced by SSH.

---

# How SSH Works

A typical SSH connection follows these steps:

```text id="a8p3jw"
Administrator

↓

TCP Connection (Port 22)

↓

SSH Handshake

↓

Authentication

↓

Encrypted Session

↓

Remote Shell
```

Once authentication succeeds, every command and response is encrypted.

---

# Default SSH Port

By default, SSH listens on:

```text id="c2w5ld"
Port 22
```

Verify that SSH is listening:

```bash id="n7m1xr"
ss -tulpn | grep ssh
```

or

```bash id="z3k8pt"
sudo systemctl status ssh
```

---

# SSH Authentication Methods

SSH supports multiple authentication methods.

| Method                      | Description                 | Production Recommendation         |
| --------------------------- | --------------------------- | --------------------------------- |
| Password Authentication     | Username + Password         | Avoid if possible                 |
| Public Key Authentication   | Cryptographic key pair      | Recommended                       |
| Multi-Factor Authentication | SSH Key + Additional Factor | Recommended for sensitive systems |

---

# Password Authentication

Traditional authentication requires:

```text id="w9v2mq"
Username

+

Password

↓

Authentication
```

Example:

```bash id="u8r5jc"
ssh ubuntu@203.0.113.10
```

Problems with password authentication:

- Weak passwords
- Password reuse
- Brute-force attacks
- Phishing
- Credential leaks

Production servers generally avoid password-based authentication.

---

# SSH Key Authentication

SSH keys use public-key cryptography instead of passwords.

Each administrator has:

- One **Private Key**
- One **Public Key**

```text id="d5q9vh"
Administrator

Private Key
      │
      ▼
SSH Authentication
      │
      ▼
Server

Public Key
```

The server verifies that the administrator owns the corresponding private key without the private key ever leaving the local computer.

---

# Generating SSH Keys

Generate an Ed25519 key pair:

```bash id="j6x4pa"
ssh-keygen -t ed25519
```

Generate an RSA key pair:

```bash id="e3m8tw"
ssh-keygen -t rsa -b 4096
```

Modern Linux distributions generally recommend **Ed25519** for new deployments.

---

# SSH Key Files

Typical files:

| File                     | Purpose                            |
| ------------------------ | ---------------------------------- |
| `~/.ssh/id_ed25519`      | Private key                        |
| `~/.ssh/id_ed25519.pub`  | Public key                         |
| `~/.ssh/authorized_keys` | Public keys allowed to log in      |
| `~/.ssh/known_hosts`     | Stores trusted server fingerprints |

---

## authorized_keys

The server stores trusted public keys inside:

```text id="b2w7nf"
~/.ssh/authorized_keys
```

Only users possessing the matching private key can authenticate.

---

## known_hosts

The client stores information about servers it has connected to.

```text id="v5p1qy"
~/.ssh/known_hosts
```

This helps detect situations where a server's identity unexpectedly changes, which may indicate a misconfiguration or a potential man-in-the-middle attack.

---

# OpenSSH Server Configuration

The SSH server configuration file is:

```text id="m9k4rz"
/etc/ssh/sshd_config
```

Common settings include:

- Authentication methods
- Allowed users
- Login restrictions
- Timeouts
- Logging
- Network settings

Any configuration changes should be validated before restarting the SSH service.

---

# Important SSH Configuration Options

## Disable Root Login

```text id="r3v7kh"
PermitRootLogin no
```

Instead:

```text id="g6w1tb"
Regular User

↓

sudo

↓

Administrative Tasks
```

---

## Disable Password Authentication

If all administrators use SSH keys:

```text id="n4p8cx"
PasswordAuthentication no
```

Benefits:

- Prevents password guessing
- Stops credential stuffing
- Eliminates weak password attacks

**Important:** Verify SSH key access before disabling password authentication.

---

## Allow Specific Users

Restrict SSH access:

```text id="h8q2mj"
AllowUsers ubuntu alice devops
```

Only listed users may log in.

---

## Change the SSH Port

Example:

```text id="k5m9pn"
Port 2222
```

Changing the port reduces automated scan noise but **does not provide meaningful security by itself**.

Attackers can discover non-standard ports through port scanning.

---

## Configure Idle Timeouts

Example settings:

```text id="p2v6xr"
ClientAliveInterval 300

ClientAliveCountMax 2
```

Inactive sessions are automatically closed after a defined period.

---

# Restarting the SSH Service

After modifying the configuration:

```bash id="t1k8wb"
sudo systemctl restart ssh
```

Check the service status:

```bash id="y7r4qd"
sudo systemctl status ssh
```

Always verify that the service starts successfully after configuration changes.

---

# Viewing SSH Logs

View SSH service logs:

```bash id="f9w3ja"
journalctl -u ssh
```

Authentication logs on many Linux distributions:

```text id="c8m6lv"
/var/log/auth.log
```

These logs help investigate:

- Failed login attempts
- Successful logins
- Authentication errors
- Configuration problems

---

# Production SSH Workflow

A secure SSH connection typically looks like this:

```text id="u3p8zn"
Developer Laptop
        │
Private SSH Key
        │
Encrypted SSH
        │
Azure VM
        │
OpenSSH Server
        │
Ubuntu User
        │
sudo
```

The application itself does **not** require SSH access.

Only administrators connect through SSH.

---

# Real-World Example

Suppose you deploy a Node.js application on an Azure Virtual Machine.

### Initial Configuration

```text id="q7v2mx"
Public IP

↓

SSH (Port 22)

↓

Ubuntu Server
```

Developers connect using SSH keys generated on their local machines.

The server stores only the public keys inside `authorized_keys`.

Production configuration includes:

- SSH key authentication
- Root login disabled
- Password authentication disabled
- Individual user accounts
- Administrative access through `sudo`
- Regular review of SSH logs

This approach is used by many production Linux environments.

---

# SSH Security Checklist

```text id="l2k5tw"
✓ Use SSH Keys

✓ Disable Root Login

✓ Disable Password Authentication

✓ Create Individual User Accounts

✓ Use sudo Instead of Root

✓ Review SSH Logs

✓ Keep OpenSSH Updated

✓ Restrict SSH Access Where Possible
```

---

# Best Practices

- Use Ed25519 SSH keys for new deployments.
- Keep private keys secure and never share them.
- Disable direct root login.
- Use individual administrator accounts.
- Verify SSH key authentication before disabling passwords.
- Keep OpenSSH updated with security patches.
- Review authentication logs regularly.

---

# Common Mistakes

### Sharing Private Keys

Every administrator should use a unique SSH key pair.

Sharing private keys reduces accountability and increases security risk.

---

### Leaving Password Authentication Enabled Unnecessarily

If all administrators use SSH keys, disabling password authentication significantly reduces the attack surface.

---

### Disabling Root Login Before Creating Another Administrator

Always ensure another user has `sudo` privileges before disabling root access.

---

### Assuming a Different SSH Port Makes the Server Secure

Changing the SSH port only reduces automated scanning noise.

Strong authentication and proper configuration remain the primary security controls.

---

# Summary

SSH is the standard protocol for securely administering Linux servers over encrypted connections. By using public-key authentication, disabling direct root and password-based logins where appropriate, configuring OpenSSH securely, and following production best practices, administrators can greatly reduce the risk of unauthorized access. A properly secured SSH configuration forms the foundation of secure remote server management.

---

## Next Chapter

➡️ **03 - UFW Firewall**
