---
sidebar_label: Nginx Reference
sidebar_position: 2
---


# Nginx Reference

## Overview

Nginx is one of the world's most popular web servers and reverse proxies. It is commonly used to:

- Serve static websites
- Reverse proxy applications
- Load balance traffic
- Terminate SSL/TLS
- Cache content
- Compress responses
- Improve performance
- Enhance security

This chapter is a quick-reference guide covering the most useful Nginx commands, directives, configuration examples, and production practices.

---

# Learning Objectives

After completing this chapter, you will be able to:

- Quickly reference common Nginx commands.
- Understand important configuration directives.
- Configure reverse proxies.
- Manage SSL.
- Optimize performance.
- Configure logging.
- Use Nginx in production environments.

---

# Nginx Architecture

```text
Internet

↓

Nginx

├── Static Files
├── Reverse Proxy
├── SSL
├── Cache
├── Load Balancer

↓

Application
```

---

# Nginx Directory Structure

| Location                      | Purpose                      |
| ----------------------------- | ---------------------------- |
| `/etc/nginx/`                 | Main configuration directory |
| `/etc/nginx/nginx.conf`       | Main configuration file      |
| `/etc/nginx/sites-available/` | Virtual host configurations  |
| `/etc/nginx/sites-enabled/`   | Enabled virtual hosts        |
| `/var/log/nginx/access.log`   | Access logs                  |
| `/var/log/nginx/error.log`    | Error logs                   |
| `/usr/share/nginx/html/`      | Default website directory    |

---

# Common Nginx Commands

| Command                   | Purpose                     |
| ------------------------- | --------------------------- |
| `nginx -v`                | Show version                |
| `nginx -V`                | Detailed build information  |
| `nginx -t`                | Test configuration          |
| `nginx -T`                | Dump complete configuration |
| `systemctl start nginx`   | Start Nginx                 |
| `systemctl stop nginx`    | Stop Nginx                  |
| `systemctl restart nginx` | Restart Nginx               |
| `systemctl reload nginx`  | Reload configuration        |
| `systemctl status nginx`  | Service status              |

Examples:

```bash
nginx -v
```

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

---

# Basic Server Block

```nginx
server {
    listen 80;

    server_name example.com www.example.com;

    root /var/www/html;

    index index.html;
}
```

Purpose:

- Defines a virtual host
- Specifies the domain
- Specifies document root
- Defines default index page

---

# Reverse Proxy Configuration

```nginx
server {

    listen 80;

    server_name example.com;

    location / {

        proxy_pass http://localhost:3000;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;
    }

}
```

Used for:

- Node.js
- Express
- Next.js
- React SSR
- Python
- Java
- Go

---

# SSL Configuration

```nginx
server {

    listen 443 ssl;

    server_name example.com;

    ssl_certificate /etc/ssl/example.crt;

    ssl_certificate_key /etc/ssl/example.key;

}
```

Common SSL directives:

| Directive             | Purpose              |
| --------------------- | -------------------- |
| `ssl_certificate`     | Public certificate   |
| `ssl_certificate_key` | Private key          |
| `ssl_protocols`       | Allowed TLS versions |
| `ssl_ciphers`         | Cipher suites        |

---

# HTTP to HTTPS Redirect

```nginx
server {

    listen 80;

    server_name example.com;

    return 301 https://$host$request_uri;

}
```

This permanently redirects all HTTP traffic to HTTPS.

---

# Static File Configuration

```nginx
location /images/ {

    root /var/www/html;

}
```

Alternative:

```nginx
location /assets/ {

    alias /home/ubuntu/assets/;

}
```

Difference:

| Directive | Meaning               |
| --------- | --------------------- |
| `root`    | Appends request path  |
| `alias`   | Replaces request path |

---

# Important Directives

| Directive     | Purpose              |
| ------------- | -------------------- |
| `listen`      | Port number          |
| `server_name` | Domain               |
| `root`        | Website directory    |
| `index`       | Default file         |
| `location`    | URL matching         |
| `proxy_pass`  | Reverse proxy        |
| `try_files`   | File lookup          |
| `return`      | Redirect or response |
| `rewrite`     | Rewrite URL          |
| `error_page`  | Custom error page    |

---

# Location Matching

```nginx
location / {

}
```

Matches all requests.

```nginx
location /api {

}
```

Matches `/api`.

```nginx
location = /login {

}
```

Exact match.

```nginx
location ~ \.php$ {

}
```

Regex match.

---

# Proxy Headers

```nginx
proxy_set_header Host $host;

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

proxy_set_header X-Forwarded-Proto $scheme;

proxy_set_header X-Real-IP $remote_addr;
```

These headers preserve client request information when forwarding traffic to backend applications.

---

# Timeouts

| Directive               | Purpose            |
| ----------------------- | ------------------ |
| `proxy_connect_timeout` | Connection timeout |
| `proxy_send_timeout`    | Send timeout       |
| `proxy_read_timeout`    | Response timeout   |
| `send_timeout`          | Client timeout     |

Example:

```nginx
proxy_read_timeout 120s;
```

---

# Gzip Compression

```nginx
gzip on;

gzip_types
text/plain
text/css
application/json
application/javascript;
```

Benefits:

- Faster loading
- Reduced bandwidth
- Improved performance

---

# Caching

Example:

```nginx
location ~* \.(jpg|png|css|js)$ {

    expires 30d;

}
```

Used for:

- Images
- CSS
- JavaScript
- Fonts

---

# Logging

Access log:

```nginx
access_log /var/log/nginx/access.log;
```

Error log:

```nginx
error_log /var/log/nginx/error.log;
```

View logs:

```bash
tail -f /var/log/nginx/access.log
```

```bash
tail -f /var/log/nginx/error.log
```

---

# Load Balancing

Example:

```nginx
upstream backend {

    server 10.0.0.11;

    server 10.0.0.12;

    server 10.0.0.13;

}
```

Use:

```nginx
proxy_pass http://backend;
```

Load balancing methods:

| Method            | Description               |
| ----------------- | ------------------------- |
| Round Robin       | Default                   |
| Least Connections | Lowest active connections |
| IP Hash           | Same client → same server |

---

# Security Headers

Example:

```nginx
add_header X-Frame-Options SAMEORIGIN;

add_header X-Content-Type-Options nosniff;

add_header Referrer-Policy strict-origin;

add_header X-XSS-Protection "1; mode=block";
```

These headers improve browser-side security.

---

# File Upload Size

```nginx
client_max_body_size 50M;
```

Common values:

| Value | Usage         |
| ----- | ------------- |
| 5M    | Forms         |
| 20M   | Images        |
| 100M  | Videos        |
| 500M  | Large uploads |

---

# Common Error Codes

| Code | Meaning               |
| ---- | --------------------- |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 413  | Payload Too Large     |
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |
| 504  | Gateway Timeout       |

---

# Nginx Configuration Flow

```text
Client

↓

DNS

↓

Nginx

↓

Server Block

↓

Location

↓

Reverse Proxy

↓

Application
```

---

# Testing Configuration

Validate configuration:

```bash
sudo nginx -t
```

View complete configuration:

```bash
sudo nginx -T
```

Reload:

```bash
sudo systemctl reload nginx
```

Never reload Nginx before validating the configuration.

---

# Useful File Locations

| File                      | Purpose              |
| ------------------------- | -------------------- |
| `nginx.conf`              | Global configuration |
| `sites-available/default` | Default virtual host |
| `sites-enabled/`          | Enabled sites        |
| `mime.types`              | MIME mappings        |
| `access.log`              | Request logs         |
| `error.log`               | Error logs           |

---

# Daily Administration Commands

```text
Configuration

├── nginx -t
├── nginx -T

Service

├── systemctl status nginx
├── systemctl restart nginx
├── systemctl reload nginx

Logs

├── tail -f access.log
├── tail -f error.log

Ports

├── ss -tulpn
```

---

# Real-World Example

A production website returns **502 Bad Gateway**.

The administrator performs the following checks:

Validate configuration:

```bash
sudo nginx -t
```

Configuration is valid.

Check service:

```bash
sudo systemctl status nginx
```

Nginx is running.

Test backend:

```bash
curl http://localhost:3000
```

Connection is refused.

Check PM2:

```bash
pm2 list
```

The backend application is offline.

Restart application:

```bash
pm2 restart api
```

Refresh the website.

The issue is resolved.

The problem was not with Nginx itself but with the upstream application.

---

# Best Practices

- Always run `nginx -t` before reloading.
- Prefer `reload` over `restart` for configuration changes.
- Keep virtual hosts organized in separate files.
- Enable HTTPS for all production websites.
- Configure security headers.
- Rotate logs regularly.
- Cache static assets.
- Use reverse proxy headers correctly.
- Keep Nginx updated with security patches.

---

# Common Mistakes

### Restarting Without Testing

Reloading an invalid configuration can cause Nginx to fail.

---

### Forgetting Proxy Headers

Missing proxy headers may cause incorrect client IPs or broken authentication.

---

### Using `restart` Instead of `reload`

A restart briefly interrupts active connections, while a reload applies configuration changes with minimal disruption.

---

### Ignoring Log Files

Most Nginx issues can be diagnosed quickly by reviewing `error.log`.

---

### Not Configuring `client_max_body_size`

Large file uploads may fail with **413 Payload Too Large** if the upload limit is too small.

---

# Summary

This Nginx Reference chapter serves as a practical handbook for everyday administration. It consolidates the most commonly used commands, directives, configuration examples, and production best practices into a single reference, enabling administrators to configure, maintain, and troubleshoot Nginx efficiently.

---

## Next Chapter

➡️ **03 - systemctl Reference**
