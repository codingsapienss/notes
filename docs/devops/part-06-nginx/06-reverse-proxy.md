---
sidebar_label: Reverse Proxy
sidebar_position: 6
---


# Reverse Proxy

## Overview

So far in this part, we have learned:

- What Nginx is
- How to install Nginx
- The Nginx directory structure
- Server Blocks
- Location Blocks

Now we reach one of the **most important features of Nginx**:

> **Reverse Proxy**

Almost every production Node.js application runs **behind an Nginx reverse proxy**.

Instead of users connecting directly to the Node.js application, they communicate with Nginx. Nginx then forwards appropriate requests to the backend application.

This architecture improves:

- Security
- Performance
- Scalability
- Reliability
- Flexibility

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Reverse Proxy is.
- Differentiate between a Forward Proxy and a Reverse Proxy.
- Learn how Nginx forwards requests to backend applications.
- Configure a basic reverse proxy.
- Understand common proxy headers.
- Learn how WebSocket proxying works.
- Follow production best practices.

---

# What is a Proxy?

A **proxy** is an intermediary between two systems.

Instead of two systems communicating directly, communication passes through the proxy.

General idea:

```text
Client
   │
   ▼
 Proxy
   │
   ▼
Server
```

There are two common types:

- Forward Proxy
- Reverse Proxy

---

# Forward Proxy

A **Forward Proxy** represents the client.

```text
Client
    │
    ▼
Forward Proxy
    │
    ▼
Internet
    │
    ▼
Website
```

Examples:

- Corporate internet gateways
- School networks
- Anonymous browsing services
- Content filtering

The destination server usually sees the proxy rather than the original client.

---

# Reverse Proxy

A **Reverse Proxy** represents the server.

```text
Client
    │
    ▼
Reverse Proxy
    │
    ▼
Application Server
```

Clients are often unaware that multiple backend servers may exist behind the reverse proxy.

Nginx is one of the most widely used reverse proxies.

---

# Why Do We Need a Reverse Proxy?

Suppose an Express application is running.

```text
Node.js

↓

Port 3000
```

Without Nginx:

```text
Internet
     │
     ▼
Node.js
```

Every client connects directly to the application.

Problems include:

- Public exposure of the application port
- No centralized HTTPS handling
- Limited static file performance
- No load balancing
- No centralized request logging
- No compression or caching

A reverse proxy addresses these concerns.

---

# Reverse Proxy Architecture

With Nginx:

```text
Internet
      │
      ▼
Cloudflare
      │
      ▼
Nginx
      │
      ▼
PM2
      │
      ▼
Node.js
```

The backend application communicates only with Nginx.

---

# Request Flow

Suppose a browser requests:

```text
https://example.com/api/users
```

The request travels as follows.

```text
Browser
      │
      ▼
Cloudflare
      │
      ▼
Nginx
      │
      ▼
Reverse Proxy
      │
      ▼
Node.js
      │
      ▼
Database
      │
      ▼
Response
      │
      ▼
Browser
```

To the user, it appears as though Nginx itself generated the response.

---

# Basic Reverse Proxy Configuration

A simple reverse proxy:

```nginx id="7klf4w"
server {

    listen 80;

    server_name example.com;

    location / {

        proxy_pass http://localhost:3000;

    }

}
```

Explanation:

| Directive     | Purpose                                     |
| ------------- | ------------------------------------------- |
| `listen`      | Accept requests on a port                   |
| `server_name` | Match the requested domain                  |
| `location`    | Match the URL path                          |
| `proxy_pass`  | Forward requests to the backend application |

Every request matching `/` is forwarded to the Node.js application running on port **3000**.

---

# Understanding proxy_pass

The most important directive is:

```nginx id="pjlwmk"
proxy_pass http://localhost:3000;
```

Workflow:

```text
Client
     │
     ▼
Nginx
     │
proxy_pass
     │
     ▼
localhost:3000
```

Nginx acts as the intermediary while the backend processes the request.

---

# Reverse Proxy with PM2

Most production applications use PM2.

Architecture:

```text
Internet
      │
      ▼
Nginx
      │
      ▼
PM2
      │
      ▼
Node.js Application
```

PM2 manages the application processes, while Nginx manages incoming web traffic.

---

# Proxy Headers

When forwarding requests, Nginx can include additional HTTP headers so the backend receives information about the original request.

Common configuration:

```nginx id="m9rgt3"
location / {

    proxy_pass http://localhost:3000;

    proxy_set_header Host $host;

    proxy_set_header X-Real-IP $remote_addr;

    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    proxy_set_header X-Forwarded-Proto $scheme;

}
```

Common headers:

| Header              | Purpose                           |
| ------------------- | --------------------------------- |
| `Host`              | Original requested domain         |
| `X-Real-IP`         | Client's IP address               |
| `X-Forwarded-For`   | Proxy chain of client IPs         |
| `X-Forwarded-Proto` | Original protocol (HTTP or HTTPS) |

These headers allow backend applications to make decisions based on the original client request.

---

# Why Proxy Headers Matter

Without proxy headers:

```text
Browser
     │
     ▼
Nginx
     │
     ▼
Node.js
```

The backend mainly sees requests coming from Nginx.

With proxy headers:

```text
Browser
     │
Original IP
     │
     ▼
Nginx
     │
Adds Headers
     │
     ▼
Node.js
```

The backend can identify:

- Original client IP
- Original domain
- Original protocol

This information is useful for logging, authentication, rate limiting, and security.

---

# Proxying WebSocket Connections

Applications using WebSockets require additional configuration.

Example:

```nginx id="mfubmc"
location /socket.io/ {

    proxy_pass http://localhost:3000;

    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;

    proxy_set_header Connection "Upgrade";

}
```

This allows protocol upgrades required for WebSocket communication.

Examples include:

- Live chat
- Real-time dashboards
- Multiplayer games
- Notification systems

---

# Reverse Proxy for APIs

Many production APIs use:

```text
api.example.com
```

Architecture:

```text
Browser
     │
     ▼
Nginx
     │
     ▼
Express API
     │
     ▼
MongoDB Atlas
```

Clients never communicate directly with the Express application.

---

# Reverse Proxy for Multiple Applications

One Nginx server can proxy multiple backend services.

```text
Internet
      │
      ▼
Nginx
      │
 ┌────┼────────────┐
 ▼    ▼            ▼
API  Dashboard   Admin
 │      │          │
 ▼      ▼          ▼
3000   3001      3002
```

Each application listens on a different internal port, while Nginx presents a unified interface to users.

---

# Production Architecture

A common production deployment:

```text
Internet
      │
      ▼
Cloudflare
      │
      ▼
Nginx
      │
      ▼
PM2 Cluster
      │
      ▼
Express.js
      │
      ▼
MongoDB Atlas
```

Each component has a distinct responsibility:

| Component     | Responsibility                |
| ------------- | ----------------------------- |
| Cloudflare    | DNS, CDN, DDoS protection     |
| Nginx         | Reverse proxy, HTTPS, routing |
| PM2           | Process management            |
| Express.js    | Business logic                |
| MongoDB Atlas | Data storage                  |

---

# Benefits of a Reverse Proxy

- Hides backend application ports.
- Centralizes HTTPS termination.
- Serves static assets efficiently.
- Simplifies request routing.
- Supports load balancing.
- Preserves client information through proxy headers.
- Enables centralized logging.
- Improves scalability.

---

# Real-World Example

Suppose an Express.js application runs on:

```text
localhost:3000
```

The server's public IP is:

```text
203.0.113.10
```

Instead of exposing:

```text
http://203.0.113.10:3000
```

Nginx is configured to listen on ports **80** and **443**.

Users access:

```text
https://example.com
```

Nginx receives the request, terminates HTTPS, forwards it to `localhost:3000`, receives the response, and returns it to the client. Throughout this process, the Node.js application remains inaccessible directly from the internet.

---

# Best Practices

- Place all backend applications behind Nginx.
- Use `localhost` or private network addresses for backend services.
- Configure proxy headers for client information.
- Keep backend ports inaccessible from the public internet whenever possible.
- Use HTTPS at the Nginx layer.
- Test configurations using `nginx -t` before reloading.
- Separate reverse proxy rules for different applications and services.

---

# Common Mistakes

### Exposing Backend Ports Publicly

Applications listening on ports such as **3000** or **5000** should generally not be directly accessible from the internet.

---

### Forgetting Proxy Headers

Without forwarding client information, backend logs and application logic may not accurately reflect the original request.

---

### Using Restart Instead of Reload

Configuration changes usually require only a reload, reducing disruption to active connections.

---

### Mixing Multiple Applications in One Location Block

Each backend service should have clear and maintainable proxy rules.

---

### Not Testing Configuration

Always validate changes with:

```bash id="4ud4c6"
sudo nginx -t
```

before reloading Nginx.

---

# Summary

A reverse proxy is one of Nginx's most important production features. It receives client requests, applies routing and security policies, and forwards traffic to backend applications such as Node.js running under PM2. By centralizing HTTPS, request routing, static file delivery, logging, and client metadata through proxy headers, Nginx provides a secure and scalable architecture that allows backend applications to focus on business logic while remaining protected from direct public access.

---

## Next Chapter

➡️ **07 - Static File Serving**
