---
sidebar_label: Preparing Server
sidebar_position: 2
---


# Preparing Server

## Overview

In the previous chapter, we learned about the deployment process and the overall production architecture.

Before deploying any application, the server itself must be prepared.

A newly created Virtual Machine is similar to purchasing a brand-new computer. It contains an operating system, but it is **not yet configured** for hosting production applications.

A production server typically requires:

- Operating system updates
- Security configuration
- SSH access
- Firewall configuration
- Required software installation
- Proper directory structure
- Deployment user
- Application runtime

Preparing the server correctly ensures that future deployments are secure, reliable, and easier to maintain.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Connect to a new Linux server.
- Update the operating system.
- Create deployment users.
- Understand file permissions.
- Configure SSH securely.
- Configure the firewall.
- Install required software.
- Organize the server for production deployments.

---

# A Fresh Ubuntu Server

When you create an Azure Virtual Machine, the operating system is installed automatically.

Initially, the server contains only the basic operating system.

```text id="prep01"
Azure VM

↓

Ubuntu

↓

Empty Server
```

Your application is **not** installed.

Node.js is **not** installed.

Nginx is **not** installed.

PM2 is **not** installed.

Everything must be configured before deployment.

---

# Connecting to the Server

The first step is connecting to the server using SSH.

```bash
ssh azureuser@20.204.115.45
```

Example:

```text id="prep02"
Developer Laptop

↓

SSH

↓

Ubuntu Server
```

Once connected, all server administration is performed from the terminal.

---

# Updating the Operating System

Before installing anything else, update the package lists.

```bash
sudo apt update
```

Upgrade installed packages.

```bash
sudo apt upgrade -y
```

Remove unnecessary packages.

```bash
sudo apt autoremove -y
```

Why update?

- Install security patches.
- Fix software bugs.
- Improve stability.
- Receive newer package versions.

Updating should be one of the first tasks performed on a new server.

---

# Keeping the Server Updated

A production server should be updated regularly.

Typical maintenance cycle:

```text id="prep03"
Security Updates

↓

Package Updates

↓

System Stable

↓

Deploy Applications
```

Operating system updates reduce the risk of known vulnerabilities.

---

# Creating a Deployment User

Many cloud providers create a default user during VM creation.

Example:

```text id="prep04"
azureuser
```

For larger teams, organizations often create dedicated deployment users.

Example:

```bash
sudo adduser deploy
```

Grant sudo access if necessary.

```bash
sudo usermod -aG sudo deploy
```

Using dedicated users makes access management easier and improves accountability.

---

# Why Avoid Daily Work as Root?

The **root** account has unrestricted access to the operating system.

```text id="prep05"
Root User

↓

Everything Allowed
```

A mistake made while logged in as root can affect the entire server.

Instead:

```text id="prep06"
Developer

↓

Deployment User

↓

sudo (When Needed)
```

This follows the **Principle of Least Privilege**, where users operate with only the permissions required for their tasks.

---

# Understanding File Permissions

Linux controls access using:

- Owner
- Group
- Others

Example:

```text id="prep07"
Application Folder

↓

Owner

↓

Group

↓

Others
```

Proper permissions help protect application files from accidental or unauthorized modification.

---

# Configuring SSH

SSH provides secure remote access to the server.

Basic connection:

```bash
ssh username@server-ip
```

Production recommendations include:

- Disable password authentication (use SSH keys).
- Disable direct root login.
- Use strong SSH keys.
- Limit server access to authorized users.

Example architecture:

```text id="prep08"
Developer Laptop

↓

SSH Key

↓

Ubuntu Server
```

---

# SSH Keys

Instead of passwords, production servers commonly use SSH key pairs.

```text id="prep09"
Private Key

↓

Authentication

↓

Public Key

↓

Server
```

Advantages:

- Stronger authentication.
- Resistant to password guessing.
- More convenient for regular administration.

---

# Configuring the Firewall

Ubuntu commonly uses **UFW (Uncomplicated Firewall)**.

Check firewall status.

```bash
sudo ufw status
```

Allow SSH.

```bash
sudo ufw allow OpenSSH
```

Allow HTTP.

```bash
sudo ufw allow 80
```

Allow HTTPS.

```bash
sudo ufw allow 443
```

Enable the firewall.

```bash
sudo ufw enable
```

---

# Typical Firewall Rules

| Port | Purpose |
| ---- | ------- |
| 22   | SSH     |
| 80   | HTTP    |
| 443  | HTTPS   |

Avoid opening unnecessary ports to the Internet.

---

# Installing Git

Git is used to download and update application code.

Install Git:

```bash
sudo apt install git -y
```

Verify installation:

```bash
git --version
```

Git allows production servers to retrieve code directly from repositories.

---

# Installing Node.js

Node.js executes JavaScript applications on the server.

Example installation using NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

sudo apt install nodejs -y
```

Verify installation.

```bash
node -v

npm -v
```

---

# Installing PM2

PM2 manages Node.js applications.

Install globally.

```bash
sudo npm install -g pm2
```

Verify:

```bash
pm2 -v
```

PM2 automatically restarts applications if they crash and supports zero-downtime reloads.

---

# Installing Nginx

Install Nginx.

```bash
sudo apt install nginx -y
```

Start the service.

```bash
sudo systemctl start nginx
```

Enable automatic startup.

```bash
sudo systemctl enable nginx
```

Verify status.

```bash
sudo systemctl status nginx
```

---

# Suggested Directory Structure

A common project layout:

```text id="prep10"
/home/deploy/
│
├── apps/
│   ├── project-a/
│   ├── project-b/
│   └── project-c/
│
├── backups/
│
├── logs/
│
└── scripts/
```

Keeping projects organized simplifies maintenance.

---

# Environment Files

Production applications usually use environment variables stored in a `.env` file.

Example:

```text id="prep11"
Project

↓

.env

↓

Application Configuration
```

The `.env` file commonly contains:

- Database connection strings
- API keys
- JWT secrets
- Port numbers
- Third-party credentials

It should **never** be committed to version control.

---

# Verifying the Server

Before deploying an application, verify that all required software is installed.

Example:

```bash
node -v
npm -v
git --version
nginx -v
pm2 -v
```

A quick verification prevents unnecessary troubleshooting later.

---

# Typical Production Preparation Workflow

```text id="prep12"
Create VM

↓

Update Ubuntu

↓

Create User

↓

Configure SSH

↓

Configure Firewall

↓

Install Git

↓

Install Node.js

↓

Install PM2

↓

Install Nginx

↓

Server Ready
```

---

# Server Preparation Checklist

| Task                      | Status |
| ------------------------- | ------ |
| Ubuntu Updated            | ✓      |
| SSH Working               | ✓      |
| Firewall Configured       | ✓      |
| Git Installed             | ✓      |
| Node.js Installed         | ✓      |
| PM2 Installed             | ✓      |
| Nginx Installed           | ✓      |
| Deployment User Created   | ✓      |
| Directory Structure Ready | ✓      |

---

# Real-World Example

Suppose a company provisions a new Ubuntu Virtual Machine in Azure.

The system administrator performs the following tasks:

1. Updates Ubuntu packages.
2. Creates a deployment user.
3. Configures SSH key authentication.
4. Enables the firewall with ports **22**, **80**, and **443**.
5. Installs Git, Node.js, PM2, and Nginx.
6. Creates an organized directory structure for applications and backups.
7. Verifies that all required software is installed successfully.

At this point, the server is fully prepared for deploying production Node.js applications.

---

# Best Practices

- Update the operating system before installing software.
- Use SSH keys instead of passwords.
- Avoid working directly as the root user.
- Open only required firewall ports.
- Keep software versions up to date.
- Organize application directories consistently.
- Store secrets in environment variables.
- Verify installations before deployment.

---

# Common Mistakes

### Deploying Without Updating the Server

Older packages may contain known security vulnerabilities or bugs.

---

### Using the Root Account for Daily Administration

Operating as root increases the risk of accidental or destructive changes.

---

### Opening Too Many Firewall Ports

Every exposed port increases the server's attack surface.

---

### Storing Secrets in Source Code

API keys, passwords, and credentials should be stored in environment variables rather than application code.

---

### Skipping Installation Verification

Assuming software is installed correctly without checking versions can lead to deployment failures later.

---

# Summary

Preparing a server is the first practical step in deploying a production application. It involves updating the operating system, creating appropriate users, securing SSH access, configuring the firewall, installing essential software such as Git, Node.js, PM2, and Nginx, and organizing the server's directory structure. A properly prepared server provides a secure and stable foundation for reliable application deployments.

---

## Next Chapter

➡️ **03 - Deploying Node.js Application**
