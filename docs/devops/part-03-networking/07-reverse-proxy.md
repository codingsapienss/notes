---
sidebar_label: Reverse Proxy
sidebar_position: 7
---


# Reverse Proxy

### Overview

Modern web applications rarely expose their backend applications directly to the Internet.

Instead, requests first reach a **Reverse Proxy**, which sits between users and one or more backend servers.

A reverse proxy performs many important tasks, including:

- Receiving client requests
- Forwarding requests to backend applications
- SSL/TLS termination
- Load balancing
- Caching
- Compression
- Security filtering
- Logging

In most production environments, **Nginx** acts as the reverse proxy, forwarding requests to application servers such as Node.js, Python, Java, or PHP.

Understanding reverse proxies is essential before learning Nginx configuration and production deployments.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a reverse proxy is.
- Differentiate between forward and reverse proxies.
- Learn how a reverse proxy processes requests.
- Understand why production applications use reverse proxies.
- Learn how Nginx acts as a reverse proxy.
- Understand reverse proxy architecture in cloud deployments.

---

## What is a Proxy?

A **proxy** is an intermediary that receives requests from one party and forwards them to another.

Instead of communicating directly, the two parties communicate through the proxy.

```text id="r3x7ha"
Client

↓

Proxy

↓

Destination
```

There are two common types:

- Forward Proxy
- Reverse Proxy

---

## Forward Proxy

A **Forward Proxy** represents the **client**.

The client sends requests to the proxy, which then contacts external servers.

```text id="m5v2pk"
Client

↓

Forward Proxy

↓

Internet

↓

Website
```

Examples:

- Corporate Internet gateways
- School networks
- Anonymous browsing services
- Content filtering systems

The destination server sees the proxy instead of the original client.

---

## Reverse Proxy

A **Reverse Proxy** represents the **server**.

Clients believe they are communicating directly with the server, but requests first reach the reverse proxy.

```text id="k9n4lw"
Client

↓

Reverse Proxy

↓

Application Server
```

The backend server is usually hidden from public access.

---

## Why Do We Need a Reverse Proxy?

Imagine a Node.js application running directly on port **3000**.

```text id="c6y8qt"
Internet

↓

Node.js

Port 3000
```

Problems include:

- Direct exposure of the application.
- No centralized SSL handling.
- Difficult load balancing.
- Limited caching.
- Harder request logging.
- Increased attack surface.

Now introduce a reverse proxy.

```text id="h2r5mf"
Internet

↓

Nginx

↓

Node.js

Port 3000
```

Now the Node.js application is private while Nginx handles all external traffic.

---

## How a Reverse Proxy Works

Suppose a user visits:

```text id="x7q3jc"
https://example.com
```

The request flow becomes:

```text id="v4p8nb"
Browser

↓

Nginx

↓

Node.js

↓

Nginx

↓

Browser
```

The browser never communicates directly with the backend application.

---

## Reverse Proxy Request Flow

A complete request typically follows this path.

```text id="g8m2tw"
Browser

↓

DNS

↓

Cloudflare

↓

Nginx

↓

Node.js

↓

MongoDB

↓

Node.js

↓

Nginx

↓

Browser
```

Each component has a dedicated responsibility.

---

## Responsibilities of a Reverse Proxy

A reverse proxy performs much more than simple request forwarding.

Common responsibilities include:

- Routing requests
- SSL termination
- Load balancing
- Compression
- Static file serving
- Security filtering
- Logging
- Rate limiting
- Authentication
- Caching

---

## Request Routing

Different requests can be sent to different backend applications.

Example:

```text id="p5k7vz"
example.com/api

↓

Node.js API
```

```text id="a9m4rh"
example.com/images

↓

Static File Server
```

```text id="w1n8qx"
example.com/admin

↓

Admin Application
```

A single reverse proxy can distribute traffic to multiple backend services.

---

## SSL Termination

Instead of every backend application managing TLS certificates, the reverse proxy handles HTTPS.

```text id="j6v2ly"
Browser

↓

HTTPS

↓

Nginx

↓

HTTP

↓

Node.js
```

Benefits:

- Simpler application configuration.
- Centralized certificate management.
- Better performance.
- Easier certificate renewal.

---

## Static File Serving

Reverse proxies efficiently serve static assets.

Examples:

- Images
- CSS
- JavaScript
- Fonts
- Videos

```text id="t4q9wc"
Browser

↓

Nginx

↓

Static Files
```

This reduces the workload on backend applications.

---

## Compression

Nginx can compress responses before sending them.

```text id="d8r3mp"
Node.js

↓

1 MB Response

↓

Nginx Compression

↓

250 KB Response

↓

Browser
```

Benefits:

- Faster page loads.
- Lower bandwidth usage.
- Improved user experience.

---

## Caching

Frequently requested content can be cached.

```text id="b3x7hf"
Browser

↓

Nginx Cache

↓

Response
```

Instead of repeatedly contacting the backend, Nginx serves cached responses when appropriate.

---

## Security

A reverse proxy provides an additional security layer.

Examples include:

- IP filtering.
- Rate limiting.
- Blocking malicious requests.
- Header validation.
- Request size limits.
- Hiding backend infrastructure.

The backend application remains inaccessible from the public Internet.

---

## Logging

Every incoming request can be logged.

Example information:

- Client IP
- Request URL
- Status code
- Response time
- User-Agent

These logs are invaluable for monitoring and troubleshooting.

---

## Reverse Proxy vs Direct Access

### Without Reverse Proxy

```text id="u2m6fj"
Browser

↓

Node.js

Port 3000
```

Problems:

- Backend exposed.
- TLS handled by application.
- No centralized logging.
- No caching.
- Limited scalability.

---

### With Reverse Proxy

```text id="q7p4zd"
Browser

↓

Nginx

↓

Node.js
```

Benefits:

- Backend hidden.
- Centralized HTTPS.
- Better performance.
- Easier scaling.
- Enhanced security.

---

## Reverse Proxy vs Load Balancer

A reverse proxy forwards requests to backend services.

A load balancer distributes requests across multiple backend servers.

```text id="k5w9ra"
Browser

↓

Nginx

↓

App 1

App 2

App 3
```

Many reverse proxies, including Nginx, can also perform load balancing.

The next chapter explores this capability in detail.

---

## Example: Nginx Reverse Proxy

A common production architecture:

```text id="m1x8cv"
Internet

↓

Cloudflare

↓

Azure VM

↓

Nginx

↓

localhost:3000

↓

Node.js
```

Node.js listens only on:

```text id="v6n2qy"
127.0.0.1:3000
```

Nginx listens publicly on:

```text id="a4r7pb"
80

443
```

Only Nginx is exposed to the Internet.

---

## Why Not Expose Node.js Directly?

Although Node.js can serve HTTP traffic directly, using it as the public-facing server is uncommon in production.

Reasons include:

- No built-in static file optimization comparable to Nginx.
- More complex TLS certificate management.
- Reduced flexibility for routing multiple services.
- Less efficient handling of large numbers of concurrent static asset requests.
- Missing centralized logging and caching capabilities.

Using a reverse proxy allows the application to focus solely on business logic.

---

## Real-World Example

This closely matches a production deployment.

```text id="n8k3tf"
User

↓

example.com

↓

DNS

↓

Cloudflare

↓

Azure Public IP

↓

Nginx

↓

Node.js (localhost:3000)

↓

MongoDB Atlas
```

Request lifecycle:

1. The user enters the domain.
2. DNS resolves the domain.
3. Cloudflare receives the request.
4. Traffic reaches the Azure Virtual Machine.
5. Nginx terminates HTTPS.
6. Nginx forwards the request to the Node.js application.
7. Node.js queries MongoDB if necessary.
8. The response travels back through Nginx and Cloudflare to the user.

This architecture is widely used for production Node.js deployments.

---

## Best Practices

- Never expose backend applications directly unless necessary.
- Place a reverse proxy in front of application servers.
- Let the reverse proxy manage TLS certificates.
- Serve static assets from the reverse proxy.
- Enable request logging for monitoring and troubleshooting.
- Restrict backend applications to private interfaces such as `127.0.0.1`.

---

## Common Mistakes

#### Exposing Backend Ports Publicly

Allowing direct access to ports such as **3000**, **5000**, or **8000** increases the attack surface.

Expose only the reverse proxy to the public Internet.

---

#### Terminating HTTPS in Every Application

Managing certificates individually for multiple applications becomes difficult.

Centralize TLS termination at the reverse proxy whenever practical.

---

#### Forgetting to Forward Client Information

When forwarding requests, ensure the backend receives the original client IP using headers such as `X-Forwarded-For` and the original protocol using `X-Forwarded-Proto`.

---

#### Assuming a Reverse Proxy Replaces Application Security

A reverse proxy improves security but does not eliminate the need for secure application code, authentication, authorization, or input validation.

---

## Summary

A reverse proxy sits between clients and backend servers, receiving requests and forwarding them to the appropriate application. Beyond request forwarding, reverse proxies provide TLS termination, routing, caching, compression, logging, security, and static file serving. In production environments, Nginx commonly performs this role, allowing backend applications such as Node.js to remain private and focused on application logic.

Understanding reverse proxies is essential before learning Nginx configuration, cloud deployments, and scalable web architectures.

---

### Next Chapter

➡️ **08 - Load Balancing**
