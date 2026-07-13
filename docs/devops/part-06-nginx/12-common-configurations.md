---
sidebar_label: Common Configurations
sidebar_position: 12
---


# Common Configurations

## Overview

Throughout this part, we have learned the individual building blocks of Nginx:

- Installing Nginx
- Directory Structure
- Server Blocks
- Location Blocks
- Reverse Proxy
- Static File Serving
- Gzip
- Caching
- SSL/TLS
- Logging

Each topic explained a specific feature.

However, in real production environments, these features are **combined together** to create complete server configurations.

This chapter brings everything together by exploring some of the most common Nginx configurations used in production systems.

These examples are not intended to be copied blindly. Instead, they demonstrate how different directives work together to solve practical deployment scenarios.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Configure Nginx for a Node.js application.
- Host a static website.
- Redirect HTTP to HTTPS.
- Host multiple websites.
- Configure custom error pages.
- Add security headers.
- Configure file upload limits.
- Understand common production configuration patterns.

---

# Example 1: Basic Static Website

One of the simplest Nginx deployments is serving a static website.

Project structure:

```text id="7m0bpk"
/var/www/html/

index.html

about.html

css/

js/

images/
```

Configuration:

```nginx id="xj0hrv"
server {

    listen 80;

    server_name example.com;

    root /var/www/html;

    index index.html;

}
```

Workflow:

```text id="g33kq0"
Browser
     │
     ▼
Nginx
     │
     ▼
Static Files
```

No backend application is required.

---

# Example 2: Node.js Reverse Proxy

Suppose an Express application is running on:

```text id="gxql3v"
localhost:3000
```

Configuration:

```nginx id="mzjlwm"
server {

    listen 80;

    server_name api.example.com;

    location / {

        proxy_pass http://localhost:3000;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;

    }

}
```

Architecture:

```text id="2jyzns"
Internet
      │
      ▼
Nginx
      │
      ▼
Express.js
```

This is one of the most common production configurations.

---

# Example 3: Static Files + API

Many web applications contain both static assets and backend APIs.

Configuration:

```nginx id="jlwmz6"
server {

    listen 80;

    server_name app.example.com;

    root /var/www/html;

    location / {

        try_files $uri $uri/ /index.html;

    }

    location /api/ {

        proxy_pass http://localhost:3000;

    }

}
```

Architecture:

```text id="mjlwm1"
Browser
      │
      ▼
Nginx
      │
 ┌────┴─────┐
 ▼          ▼
Static     API
Files     Node.js
```

This pattern is common for single-page applications (SPAs) backed by an API server.

---

# Example 4: HTTP to HTTPS Redirect

Configuration:

```nginx id="jlwmk7"
server {

    listen 80;

    server_name example.com;

    return 301 https://$host$request_uri;

}
```

Workflow:

```text id="x8eq5b"
Browser

↓

HTTP

↓

301 Redirect

↓

HTTPS
```

Users are automatically redirected to the secure version of the website.

---

# Example 5: HTTPS Reverse Proxy

```nginx id="jlwmk8"
server {

    listen 443 ssl;

    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {

        proxy_pass http://localhost:3000;

    }

}
```

Architecture:

```text id="jlwmk9"
Browser
     │
HTTPS
     │
     ▼
Nginx
     │
HTTP
     │
     ▼
Node.js
```

Nginx handles HTTPS while the backend communicates over the internal network.

---

# Example 6: Multiple Websites

One Nginx server can host multiple domains.

```text id="jlwm10"
Internet
      │
      ▼
Nginx
      │
 ┌────┼──────────┐
 ▼    ▼          ▼
Site1 Site2    Site3
```

Configuration:

```nginx id="jlwm11"
server {

    server_name site1.com;

}

server {

    server_name site2.com;

}

server {

    server_name site3.com;

}
```

Each Server Block manages its own domain.

---

# Example 7: Custom Error Pages

Instead of showing the default Nginx error page:

```text id="jlwm12"
404 Not Found
```

You can serve a custom page.

Configuration:

```nginx id="jlwm13"
server {

    error_page 404 /404.html;

    location = /404.html {

        root /var/www/errors;

    }

}
```

Directory:

```text id="jlwm14"
/var/www/errors/

404.html
```

Users receive a branded error page instead of the default one.

---

# Example 8: File Upload Limit

By default, uploads may be limited.

Increase the limit:

```nginx id="jlwm15"
server {

    client_max_body_size 100M;

}
```

Meaning:

Maximum upload size:

```text id="jlwm16"
100 MB
```

Useful for:

- File uploads
- Video uploads
- PDF uploads
- Image uploads

---

# Example 9: Security Headers

Security headers help browsers enforce safer behavior.

Example:

```nginx id="jlwm17"
add_header X-Frame-Options "SAMEORIGIN";

add_header X-Content-Type-Options "nosniff";

add_header Referrer-Policy "strict-origin-when-cross-origin";
```

Purpose:

| Header                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `X-Frame-Options`        | Helps protect against clickjacking                |
| `X-Content-Type-Options` | Prevents MIME type sniffing                       |
| `Referrer-Policy`        | Controls referrer information sent by the browser |

Modern applications often include additional security headers depending on their requirements.

---

# Example 10: Denying Access to Hidden Files

Configuration:

```nginx id="jlwm18"
location ~ /\. {

    deny all;

}
```

Blocks requests such as:

```text id="jlwm19"
.git

.env

.htaccess
```

These files should generally never be publicly accessible.

---

# Example 11: Serving Downloads

Configuration:

```nginx id="jlwm20"
location /downloads/ {

    alias /var/www/files/;

}
```

Directory:

```text id="jlwm21"
/var/www/files/

manual.pdf

software.zip
```

Request:

```text id="jlwm22"
/downloads/manual.pdf
```

The file is served directly by Nginx.

---

# Example 12: Enabling Compression

Configuration:

```nginx id="jlwm23"
gzip on;

gzip_comp_level 5;

gzip_types
    text/css
    application/javascript
    application/json;
```

Workflow:

```text id="jlwm24"
Browser

↓

Request

↓

Nginx

↓

Compress Response

↓

Browser
```

This reduces bandwidth usage for text-based content.

---

# Example 13: Browser Caching

Configuration:

```nginx id="jlwm25"
location ~* \.(css|js|png|jpg|svg)$ {

    expires 30d;

}
```

Workflow:

```text id="jlwm26"
Browser

↓

Download File

↓

Store Cache

↓

Reuse Later
```

This reduces repeat downloads for static assets.

---

# Example 14: WebSocket Support

Applications using WebSockets require additional proxy settings.

```nginx id="jlwm27"
location /socket.io/ {

    proxy_pass http://localhost:3000;

    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;

    proxy_set_header Connection "Upgrade";

}
```

Common use cases:

- Chat applications
- Real-time dashboards
- Live notifications
- Multiplayer games

---

# Example 15: SPA (Single-Page Application) Routing

Frameworks such as React, Vue, and Angular often rely on client-side routing.

Configuration:

```nginx id="jlwm28"
location / {

    try_files $uri $uri/ /index.html;

}
```

Workflow:

```text id="jlwm29"
Browser

↓

/dashboard

↓

Nginx

↓

index.html

↓

Frontend Router
```

This allows the frontend application to handle route resolution.

---

# Putting Everything Together

A production deployment may combine many of these features.

```text id="jlwm30"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Nginx
      │
 ┌────┼──────────────┐
 ▼    ▼              ▼
HTTPS Static Files Reverse Proxy
 │       │              │
 ▼       ▼              ▼
Browser  Files      Node.js
                      │
                      ▼
                  MongoDB
```

Nginx becomes the central gateway responsible for:

- HTTPS
- Request routing
- Static content
- Compression
- Caching
- Logging
- Security headers
- Reverse proxying

---

# Real-World Example

Consider an online learning platform.

Requirements:

- React frontend
- Express.js backend
- MongoDB database
- Video downloads
- PDF notes
- HTTPS
- Custom error pages
- Browser caching
- Gzip compression

Architecture:

```text id="jlwm31"
Users
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
 ┌───┴──────────────┐
 ▼                  ▼
React          Express API
Static Files        │
                    ▼
                MongoDB
```

Nginx:

- Redirects HTTP to HTTPS.
- Serves the React build.
- Proxies API requests.
- Compresses responses.
- Caches static assets.
- Delivers downloadable files.
- Logs requests and errors.

This is a typical architecture for many modern web applications.

---

# Best Practices

- Keep configurations modular by using separate Server Blocks.
- Validate changes with `nginx -t` before reloading.
- Use HTTPS for all production websites.
- Serve static assets directly through Nginx.
- Protect sensitive files such as `.env` and `.git`.
- Configure security headers.
- Enable compression and browser caching.
- Store configuration files under version control when appropriate.

---

# Common Mistakes

### Placing Everything in One Configuration File

Large monolithic configurations are difficult to maintain. Split applications into separate Server Blocks or include files.

---

### Forgetting Proxy Headers

Backend applications may lose information about the original client if proxy headers are omitted.

---

### Exposing Sensitive Files

Files such as `.env` or `.git` should never be publicly accessible.

---

### Ignoring Upload Limits

Applications accepting uploads may fail unexpectedly if `client_max_body_size` is too small.

---

### Making Changes Without Testing

Always verify the configuration before applying it:

```bash id="jlwm32"
sudo nginx -t
```

Then reload Nginx:

```bash id="jlwm33"
sudo systemctl reload nginx
```

---

# Summary

Real-world Nginx deployments combine multiple features into a single, cohesive configuration. Static file serving, reverse proxying, HTTPS, caching, compression, logging, security headers, custom error pages, upload limits, and WebSocket support are all common requirements in production environments. Understanding these configuration patterns enables administrators to build reliable, secure, and high-performance web servers that can support modern applications.

---

## Next Chapter

➡️ **13 - Troubleshooting Nginx**
