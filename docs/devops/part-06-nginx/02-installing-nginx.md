---
sidebar_label: Installing Nginx
sidebar_position: 2
---


# Installing Nginx

### Overview

In the previous chapter, we learned what Nginx is and why it is an essential component of a production server.

In this chapter, we will install Nginx on an Ubuntu server and learn how to manage it using **systemd**.

By the end of this chapter, you will have a running Nginx web server capable of serving HTTP requests and ready to be configured as a reverse proxy for Node.js applications.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Install Nginx on Ubuntu.
- Verify a successful installation.
- Understand the Nginx service.
- Start, stop, restart, and reload Nginx.
- Enable Nginx to start automatically on boot.
- Check the installed version.
- Follow production installation best practices.

---

## Prerequisites

Before installing Nginx, ensure:

- Ubuntu Server is installed.
- The package list is up to date.
- Internet connectivity is available.
- You have sudo privileges.

Verify your Ubuntu version:

```bash
lsb_release -a
```

or

```bash
cat /etc/os-release
```

---

## Updating Package Information

Before installing any software, update the package index.

```bash
sudo apt update
```

This downloads the latest package information from the configured repositories.

It does **not** install or upgrade software.

---

## Installing Nginx

Install Nginx using Ubuntu's package manager.

```bash
sudo apt install nginx
```

Example output:

```text
Reading package lists...

Building dependency tree...

The following NEW packages will be installed:

nginx

nginx-common

...
```

Once installation completes, Ubuntu automatically creates the Nginx service.

---

## Verifying Installation

Check the installed version.

```bash
nginx -v
```

Example:

```text
nginx version: nginx/1.24.0
```

To view additional build information:

```bash
nginx -V
```

Example output includes:

- Version
- Build options
- Compiler
- Enabled modules
- Configuration paths

---

## Understanding the Nginx Service

After installation, Nginx runs as a **systemd service**.

```text
Ubuntu
    │
    ▼
systemd
    │
    ▼
Nginx Service
    │
    ▼
Worker Processes
```

The operating system starts and manages Nginx through systemd.

---

## Checking Service Status

Verify whether Nginx is running.

```bash
sudo systemctl status nginx
```

Example:

```text
● nginx.service

Active: active (running)
```

If you see **active (running)**, the installation was successful.

---

## Starting Nginx

If the service is stopped:

```bash
sudo systemctl start nginx
```

Verify:

```bash
sudo systemctl status nginx
```

---

## Stopping Nginx

Stop the web server.

```bash
sudo systemctl stop nginx
```

This immediately stops serving HTTP requests.

---

## Restarting Nginx

Restart the service.

```bash
sudo systemctl restart nginx
```

Use restart after:

- Package upgrades
- Significant configuration changes
- Recovering from service issues

Restart briefly interrupts active connections.

---

## Reloading Nginx

Reload configuration without fully stopping the service.

```bash
sudo systemctl reload nginx
```

Workflow:

```text
Configuration Changed
         │
         ▼
Reload
         │
         ▼
New Configuration Applied
```

Reload is generally preferred over restart for routine configuration updates because it minimizes disruption.

---

## Enabling Nginx at Boot

Enable automatic startup.

```bash
sudo systemctl enable nginx
```

Verify:

```bash
systemctl is-enabled nginx
```

Example:

```text
enabled
```

Now:

```text
Server Boot

↓

systemd

↓

Nginx Starts Automatically
```

---

## Disabling Automatic Startup

Disable startup:

```bash
sudo systemctl disable nginx
```

This prevents Nginx from starting automatically after future reboots.

---

## Testing Nginx

One of the simplest ways to verify installation is through a web browser.

Open:

```text
http://SERVER_IP
```

Example:

```text
http://192.168.1.50
```

You should see the default Nginx welcome page.

Architecture:

```text
Browser
     │
     ▼
Port 80
     │
     ▼
Nginx
     │
     ▼
Default Welcome Page
```

---

## Testing from the Terminal

If you have terminal access to the server:

```bash
curl http://localhost
```

Example response:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>

    ...
  </head>
</html>
```

This confirms that Nginx is responding to HTTP requests.

---

## Checking Listening Ports

Verify which ports Nginx is using.

```bash
sudo ss -tulpn
```

Typical output:

```text
tcp LISTEN 0 511 0.0.0.0:80

tcp LISTEN 0 511 0.0.0.0:443
```

Normally:

| Port | Purpose |
| ---- | ------- |
| 80   | HTTP    |
| 443  | HTTPS   |

Initially, only port **80** may be active until SSL is configured.

---

## Checking Firewall Rules

If UFW is enabled:

```bash
sudo ufw status
```

Allow Nginx traffic:

```bash
sudo ufw allow 'Nginx Full'
```

Available profiles:

```bash
sudo ufw app list
```

Typical profiles:

| Profile     | Ports      |
| ----------- | ---------- |
| Nginx HTTP  | 80         |
| Nginx HTTPS | 443        |
| Nginx Full  | 80 and 443 |

---

## Updating Nginx

Update package information:

```bash
sudo apt update
```

Upgrade Nginx:

```bash
sudo apt upgrade nginx
```

Verify:

```bash
nginx -v
```

Keeping Nginx updated ensures you receive the latest security patches and bug fixes.

---

## Configuration Testing

Before applying configuration changes, always validate them.

```bash
sudo nginx -t
```

Successful output:

```text
nginx: configuration file ... syntax is ok

nginx: configuration file ... test is successful
```

Recommended workflow:

```text
Edit Configuration
        │
        ▼
nginx -t
        │
        ▼
No Errors
        │
        ▼
Reload Nginx
```

Testing configuration before reloading prevents service outages caused by syntax errors.

---

## Common systemctl Commands

| Command                   | Purpose              |
| ------------------------- | -------------------- |
| `systemctl status nginx`  | View service status  |
| `systemctl start nginx`   | Start service        |
| `systemctl stop nginx`    | Stop service         |
| `systemctl restart nginx` | Restart service      |
| `systemctl reload nginx`  | Reload configuration |
| `systemctl enable nginx`  | Start on boot        |
| `systemctl disable nginx` | Disable startup      |

---

## Typical Installation Workflow

```text
Ubuntu Server
        │
        ▼
sudo apt update
        │
        ▼
sudo apt install nginx
        │
        ▼
systemctl status nginx
        │
        ▼
Browser Test
        │
        ▼
nginx -t
        │
        ▼
Ready for Configuration
```

---

## Real-World Example

Suppose you provision a fresh Ubuntu virtual machine for hosting an Express.js application.

Deployment begins by installing Nginx:

```bash
sudo apt update

sudo apt install nginx
```

Verify the service:

```bash
sudo systemctl status nginx
```

Open the server's public IP address in a browser.

```text
http://SERVER_PUBLIC_IP
```

The default Nginx welcome page confirms that:

- Nginx is installed.
- The service is running.
- The server is accepting HTTP requests.

The next step is replacing the default site with a configuration that proxies requests to the Node.js application.

---

## Best Practices

- Update package repositories before installation.
- Install Nginx from Ubuntu's official repositories unless a newer version is specifically required.
- Enable automatic startup using `systemctl enable nginx`.
- Test configuration with `nginx -t` before every reload.
- Prefer `reload` over `restart` for routine configuration updates.
- Keep Nginx updated with security patches.
- Allow only required firewall ports.

---

## Common Mistakes

#### Editing Configuration Without Testing

Always run `nginx -t` before reloading to avoid downtime caused by configuration errors.

---

#### Forgetting the Firewall

Nginx may be running correctly, but firewall rules can still prevent external access.

---

#### Using Restart for Every Change

Restarting unnecessarily interrupts active connections. Reload is usually sufficient after configuration updates.

---

#### Ignoring Service Status

If Nginx fails to start, check `systemctl status nginx` before troubleshooting other components.

---

#### Exposing Unnecessary Ports

Only ports required by the application—typically **80** and **443**—should be publicly accessible.

---

## Summary

Installing Nginx on Ubuntu is straightforward using the APT package manager. Once installed, Nginx is managed through systemd, allowing administrators to start, stop, reload, and monitor the service. Validating configuration changes with `nginx -t`, enabling automatic startup, and confirming that the server responds to HTTP requests establish a solid foundation for configuring Nginx as a production web server.

---

### Next Chapter

➡️ **03 - Nginx Directory Structure**
