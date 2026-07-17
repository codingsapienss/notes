---
sidebar_label: Configuring Nginx
sidebar_position: 4
---


# Configuring Nginx

## Overview

In the previous chapter, we deployed our Node.js application onto the server and verified that it was running correctly.

For example, the application might be running on:

```text id="ngdep01"
http://SERVER_IP:3000
```

Although users can access the application this way, this is **not** how production applications are typically deployed.

Instead, users access the application through:

```text id="ngdep02"
https://example.com
```

Nginx acts as the web server that receives incoming HTTP/HTTPS requests and forwards them to the Node.js application.

In production, users never communicate directly with the Node.js process.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Configure Nginx for a Node.js application.
- Create a Server Block.
- Configure Reverse Proxy.
- Route HTTP requests.
- Serve static files.
- Test Nginx configuration.
- Reload Nginx safely.
- Verify production deployment.

---

# Production Architecture

Without Nginx:

```text id="ngdep03"
Users

↓

Server IP:3000

↓

Node.js
```

With Nginx:

```text id="ngdep04"
Users

↓

Nginx

↓

Node.js
```

Nginx becomes the public-facing web server.

---

# Why Use Nginx?

Node.js can serve HTTP requests directly.

However, Nginx provides several production advantages.

| Feature             | Benefit                                 |
| ------------------- | --------------------------------------- |
| Reverse Proxy       | Hides the application server            |
| SSL Termination     | Handles HTTPS connections               |
| Static File Serving | Efficient delivery of static assets     |
| Load Balancing      | Supports multiple application instances |
| Compression         | Reduces response size                   |
| Security Headers    | Improves application security           |
| Request Routing     | Routes traffic to appropriate services  |

---

# Application Before Configuration

Suppose our application is running:

```text id="ngdep05"
localhost:3000
```

Only the local server can access it directly.

Architecture:

```text id="ngdep06"
Node.js

↓

Port 3000
```

Nginx will expose the application on standard web ports instead.

---

# Nginx Server Blocks

Each website usually has its own Server Block.

Example:

```text id="ngdep07"
/etc/nginx/sites-available/
```

Typical files:

```text id="ngdep08"
default

crm

ecommerce

portfolio
```

Each file contains the configuration for one website or application.

---

# Creating a Server Block

Create a configuration file.

```bash id="nxd01"
sudo nano /etc/nginx/sites-available/project
```

Example configuration:

```nginx id="nxd02"
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This configuration forwards incoming requests to the Node.js application.

---

# Understanding the Configuration

| Directive          | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `listen`           | Port Nginx listens on                         |
| `server_name`      | Domain names handled by this configuration    |
| `location`         | URL path matching                             |
| `proxy_pass`       | Destination Node.js application               |
| `proxy_set_header` | Passes request information to the application |

---

# Enabling the Configuration

Create a symbolic link.

```bash id="nxd03"
sudo ln -s /etc/nginx/sites-available/project /etc/nginx/sites-enabled/
```

Architecture:

```text id="ngdep09"
sites-available

↓

Symbolic Link

↓

sites-enabled
```

Only configurations inside `sites-enabled` are loaded by Nginx.

---

# Removing the Default Configuration

Many deployments remove the default website.

```bash id="nxd04"
sudo rm /etc/nginx/sites-enabled/default
```

This prevents the default Nginx page from being served.

---

# Testing the Configuration

Before reloading Nginx, validate the configuration.

```bash id="nxd05"
sudo nginx -t
```

Example output:

```text id="ngdep10"
Syntax OK

Configuration Successful
```

Always test the configuration before reloading the service.

---

# Reloading Nginx

Apply configuration changes.

```bash id="nxd06"
sudo systemctl reload nginx
```

Reloading applies the new configuration without stopping the service.

---

# Restart vs Reload

| Command   | Effect                                               |
| --------- | ---------------------------------------------------- |
| `reload`  | Applies configuration changes without stopping Nginx |
| `restart` | Stops and starts the service again                   |

Reloading is generally preferred for configuration updates.

---

# Request Flow

Once configured:

```text id="ngdep11"
Browser

↓

example.com

↓

Nginx

↓

localhost:3000

↓

Node.js
```

Nginx forwards requests to the application running locally.

---

# Serving Static Files

Suppose static files are stored here:

```text id="ngdep12"
/home/deploy/apps/project/public
```

Example configuration:

```nginx id="nxd07"
location /images/ {
    alias /home/deploy/apps/project/public/images/;
}
```

Nginx serves these files directly without involving Node.js.

Benefits:

- Faster responses.
- Reduced application workload.
- Better scalability.

---

# Handling Large File Uploads

Some applications allow users to upload files.

Increase the maximum request size if necessary.

```nginx id="nxd08"
client_max_body_size 100M;
```

Without this configuration, large uploads may be rejected.

---

# Forwarding Client Information

Nginx forwards useful request details.

Example headers include:

- Original Host
- Client IP Address
- Protocol (HTTP or HTTPS)

Example:

```text id="ngdep13"
Browser

↓

Nginx

↓

Headers

↓

Node.js
```

Applications often use these headers for logging, security, and generating correct URLs.

---

# Complete Request Flow

```text id="ngdep14"
Users
   │
   ▼
example.com
   │
   ▼
Nginx (Port 80 / 443)
   │
   ▼
localhost:3000
   │
   ▼
Express.js
```

Only Nginx is directly exposed to incoming web traffic.

---

# Deployment Verification

Verify the following after configuration.

| Check         | Expected Result      |
| ------------- | -------------------- |
| `nginx -t`    | Configuration valid  |
| Nginx Service | Running              |
| Application   | Running on localhost |
| Domain        | Opens website        |
| Static Files  | Accessible           |
| Reverse Proxy | Working              |

---

# Typical Deployment Workflow

```text id="ngdep15"
Node.js Running

↓

Create Server Block

↓

Enable Configuration

↓

Test Configuration

↓

Reload Nginx

↓

Verify Website
```

---

# Real-World Example

Suppose a company deploys an Express.js application on an Ubuntu Virtual Machine.

The application runs on:

```text id="ngdep16"
localhost:3000
```

The deployment engineer:

1. Creates an Nginx Server Block.
2. Sets `server_name` to the company's domain.
3. Configures `proxy_pass` to `http://localhost:3000`.
4. Enables the configuration.
5. Tests the configuration using `nginx -t`.
6. Reloads Nginx.
7. Verifies the website by opening the domain in a browser.

Users now access the application through the domain name without needing to know the internal application port.

---

# Best Practices

- Keep one Server Block per application.
- Always test configurations using `nginx -t`.
- Prefer `reload` over `restart` for configuration changes.
- Serve static assets directly through Nginx when appropriate.
- Configure appropriate upload limits.
- Keep configuration files organized and well documented.
- Remove unused or obsolete Server Blocks.

---

# Common Mistakes

### Forgetting to Enable the Server Block

Creating a configuration file in `sites-available` alone is not sufficient. It must also be enabled through `sites-enabled`.

---

### Skipping Configuration Testing

Reloading Nginx without running `nginx -t` may result in service failures caused by configuration errors.

---

### Incorrect `proxy_pass` Port

If the Node.js application runs on a different port than configured, requests will fail because Nginx cannot reach the application.

---

### Restarting Instead of Reloading

Using `restart` unnecessarily can briefly interrupt active connections, whereas `reload` applies configuration changes with minimal disruption.

---

### Exposing the Application Port Publicly

Node.js applications should typically listen only on `localhost`, allowing Nginx to be the only component exposed to public web traffic.

---

# Summary

Nginx acts as the public-facing web server for production Node.js applications. It receives incoming HTTP and HTTPS requests, forwards them to the application using a reverse proxy, serves static files efficiently, and provides features such as request routing and upload handling. By creating and enabling Server Blocks, validating configurations, and reloading Nginx safely, administrators can deploy applications in a secure, maintainable, and production-ready manner.

---

## Next Chapter

➡️ **05 - Domain Setup**
