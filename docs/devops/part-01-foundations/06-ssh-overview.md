---
sidebar_label: SSH Overview
sidebar_position: 6
---


# SSH Overview

### Overview

Most Linux servers do not have a monitor, keyboard, or mouse attached to them. Instead, they are managed remotely over a network.

**SSH (Secure Shell)** is the standard protocol used to securely connect to remote Linux systems. It allows administrators and developers to execute commands, transfer files, configure applications, and manage servers from anywhere in the world.

Whether your server is hosted on Azure, AWS, Google Cloud, DigitalOcean, or your own data center, SSH is the primary method of accessing it.

Throughout this handbook, every server configuration and deployment task will begin with an SSH connection.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what SSH is.
- Learn why SSH is preferred over older remote access protocols.
- Understand how SSH authentication works.
- Learn the difference between public and private keys.
- Connect to a Linux server using SSH.
- Understand basic SSH security best practices.

---

## What is SSH?

**SSH (Secure Shell)** is a secure network protocol that allows you to access and manage a remote computer over a network.

Instead of physically sitting in front of the server, SSH lets you execute commands remotely as if you were using the server directly.

For example, after connecting through SSH, you can:

- Install software
- Configure Nginx
- Deploy applications
- Restart services
- View logs
- Manage files
- Monitor system resources

All communication between your computer and the server is encrypted.

---

## Why Do We Need SSH?

Imagine your server is running in a cloud data center located hundreds or even thousands of kilometers away.

Without SSH, every administrative task would require physical access to the machine.

SSH eliminates this problem by providing secure remote administration over the internet.

Typical workflow:

```text
Your Computer
      │
      ▼
Internet
      │
      ▼
Encrypted SSH Connection
      │
      ▼
Linux Server
```

This allows administrators to manage servers from anywhere while keeping communication secure.

---

## SSH vs Telnet

Before SSH became popular, many systems used **Telnet** for remote access.

The major problem with Telnet was that it transmitted data, including usernames and passwords, in plain text.

SSH solves this problem by encrypting all communication.

| Feature               | SSH | Telnet |
| --------------------- | --- | ------ |
| Encryption            | Yes | No     |
| Secure Authentication | Yes | No     |
| Password Protection   | Yes | No     |
| Recommended Today     | Yes | No     |

Today, SSH has almost completely replaced Telnet for Linux server administration.

---

## How SSH Works

When you connect to a server, the following sequence occurs:

```text
Client
   │
   ▼
Connect to Server
   │
   ▼
Identity Verification
   │
   ▼
Authentication
   │
   ▼
Encrypted Session Established
   │
   ▼
Execute Commands Securely
```

Once the secure session is established, all communication between the client and the server is encrypted.

---

## SSH Authentication

SSH supports multiple authentication methods.

The two most common are:

### Password Authentication

The user provides:

- Username
- Password

If the credentials are correct, access is granted.

Although simple, password authentication is more vulnerable to brute-force attacks.

---

### Key-Based Authentication

Modern Linux servers typically use **SSH keys** instead of passwords.

This method uses two related keys:

- Public Key
- Private Key

Key-based authentication is both more secure and more convenient for production environments.

---

## Public Key and Private Key

SSH key authentication is based on a key pair.

### Public Key

The public key is copied to the server.

It can be shared safely.

The server uses it to verify your identity.

---

### Private Key

The private key remains on your local computer.

It should **never** be shared.

If someone gains access to your private key, they may be able to access your servers.

---

### How They Work Together

```text
Private Key (Your Computer)
            │
            ▼
Authentication Request
            │
            ▼
Server Uses Public Key
            │
            ▼
Identity Verified
            │
            ▼
Secure Connection Established
```

The server never receives your private key.

Instead, it verifies that your private key matches the stored public key.

---

## PEM Files

Cloud providers often generate SSH private keys with a `.pem` extension.

Example:

```text
my-server-key.pem
```

This file contains your **private key**.

It should:

- Be stored securely.
- Never be committed to Git.
- Never be shared publicly.
- Have restricted file permissions.

If the private key is lost and no alternative authentication method exists, accessing the server may become difficult.

---

## Connecting to a Linux Server

A typical SSH command looks like:

```bash
ssh username@server-ip
```

Example:

```bash
ssh ubuntu@192.168.1.10
```

If a private key is required:

```bash
ssh -i my-server-key.pem ubuntu@192.168.1.10
```

Breaking down the command:

| Component           | Description                         |
| ------------------- | ----------------------------------- |
| `ssh`               | Starts the SSH client               |
| `-i`                | Specifies the private key file      |
| `my-server-key.pem` | Private key used for authentication |
| `ubuntu`            | Username on the remote server       |
| `192.168.1.10`      | Server IP address                   |

---

## Real-World Example

Throughout this handbook, you will work with cloud servers.

A typical workflow is:

```text
Create Cloud VM
        │
        ▼
Receive Public IP
        │
        ▼
Download Private Key (.pem)
        │
        ▼
Open Terminal
        │
        ▼
Connect Using SSH
        │
        ▼
Manage Linux Server
```

Once connected, you can execute commands exactly as if you were sitting in front of the machine.

---

## Common SSH Operations

After connecting, administrators commonly perform tasks such as:

```bash
pwd
ls -la
cd /var/www
sudo apt update
git pull
pm2 restart app
sudo systemctl restart nginx
```

SSH simply provides the secure channel through which these commands are executed.

---

## SSH Security Best Practices

To keep your servers secure:

- Prefer SSH key authentication over passwords.
- Protect your private key and never share it.
- Disable password authentication on production servers when possible.
- Avoid logging in directly as the root user.
- Keep the SSH service updated.
- Use a firewall to restrict access when appropriate.
- Remove unused public keys from the server.

Good SSH practices significantly reduce the risk of unauthorized access.

---

## Common Mistakes

#### Sharing the Private Key

The private key should never be emailed, uploaded to public repositories, or shared with others.

---

#### Losing the Private Key

If the private key is lost and no backup authentication method exists, accessing the server may require recovery procedures provided by the cloud platform.

---

#### Confusing Public and Private Keys

The **public key** is stored on the server.

The **private key** stays on your computer.

Never copy the private key to the server.

---

#### Using Password Authentication Everywhere

Password authentication is convenient for testing but key-based authentication is generally recommended for production servers.

---

## Summary

SSH is the foundation of remote Linux administration. It provides an encrypted and secure method of connecting to remote systems, allowing administrators and developers to manage servers from anywhere.

Throughout the rest of this handbook, nearly every practical task—installing packages, configuring Nginx, deploying applications, monitoring logs, and troubleshooting issues—will begin with an SSH connection.

Understanding SSH is therefore the first practical step toward becoming proficient in Linux server administration.

---

### Next Chapter

➡️ **Part 2 - Linux Administration**
