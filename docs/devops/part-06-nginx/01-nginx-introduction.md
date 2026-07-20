---
sidebar_label: Nginx Introduction
sidebar_position: 1
---


# Nginx Introduction

### Overview

So far, we have prepared our Linux server by:

- Securing the server
- Installing Git
- Installing Node.js
- Managing dependencies with npm
- Running applications with PM2

However, there is still one major problem.

A Node.js application running on port **3000** is **not ready to be exposed directly to the Internet**.

Production applications require a dedicated web server that can:

- Accept incoming HTTP and HTTPS requests
- Handle SSL/TLS encryption
- Serve static files efficiently
- Forward requests to backend applications
- Improve security
- Handle thousands of concurrent connections

This is where **Nginx** comes in.

Nginx is one of the world's most popular web servers and reverse proxies. It is widely used to host websites, APIs, microservices, and enterprise applications.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what Nginx is.
- Learn why web servers are needed.
- Understand where Nginx fits in a web architecture.
- Learn the primary roles of Nginx.
- Compare Nginx with Apache.
- Understand the request lifecycle.
- Know why Nginx is the preferred choice for many production systems.

---

## What is Nginx?

**Nginx** (pronounced **"Engine-X"**) is an open-source web server first released in **2004**.

It was designed to solve one of the biggest problems of early web servers:

> Handling a very large number of concurrent connections efficiently.

Today, Nginx is commonly used as:

- A web server
- A reverse proxy
- A load balancer
- An SSL/TLS terminator
- A static file server
- An API gateway (in many architectures)

---

## Why Do We Need a Web Server?

Suppose you start a Node.js application.

```bash
node app.js
```

The application listens on:

```text
http://localhost:3000
```

Although it is running, several challenges remain:

- No HTTPS support
- Limited static file serving
- No request routing
- No load balancing
- No caching
- Limited production features

A dedicated web server solves these problems.

---

## Where Does Nginx Fit?

Without Nginx:

```text
Internet
     │
     ▼
Node.js
```

Every client communicates directly with the application.

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

Nginx becomes the **public entry point** for all incoming requests.

The Node.js application remains protected behind it.

---

## What Does Nginx Do?

Nginx performs several important responsibilities.

```text
Incoming Request
        │
        ▼
      Nginx
 ┌──────┼────────┐
 ▼      ▼        ▼
HTTPS  Static   Reverse
       Files     Proxy
          │
          ▼
      Node.js
```

Instead of simply forwarding requests, Nginx can inspect, modify, secure, and optimize traffic before it reaches the application.

---

## Primary Uses of Nginx

### 1. Web Server

Nginx can directly serve web pages and static content.

```text
Browser

↓

Nginx

↓

HTML
CSS
JavaScript
Images
```

---

### 2. Reverse Proxy

Nginx forwards requests to backend applications.

Example:

```text
Client

↓

Nginx

↓

Node.js

↓

Response
```

Users never communicate directly with the backend application.

---

### 3. Load Balancer

If multiple backend servers exist, Nginx distributes requests.

```text
Clients
    │
    ▼
  Nginx
 ┌──┼──┐
 ▼  ▼  ▼
App1 App2 App3
```

This improves scalability and availability.

---

### 4. SSL/TLS Termination

Instead of every application managing certificates:

```text
Internet

↓

HTTPS

↓

Nginx

↓

HTTP

↓

Node.js
```

Nginx decrypts HTTPS traffic and forwards requests internally.

---

### 5. Static File Serving

Static files are delivered directly.

```text
Browser

↓

Nginx

↓

CSS

JS

Images

Fonts
```

Serving static files through Nginx is generally faster and more efficient than serving them through a Node.js application.

---

## Why Not Expose Node.js Directly?

Running:

```bash
node app.js
```

works, but production deployments require much more.

Node.js alone does not provide:

- Efficient static file delivery
- Virtual hosting
- Request routing
- HTTPS management
- Compression
- Browser caching
- Advanced logging
- Reverse proxy capabilities

Instead:

```text
Internet

↓

Nginx

↓

Node.js
```

Each component focuses on its own responsibility.

---

## Nginx Request Lifecycle

Every incoming request follows a predictable path.

```text
Browser
    │
    ▼
DNS
    │
    ▼
Cloudflare
    │
    ▼
Nginx
    │
    ▼
Location Rules
    │
    ▼
Reverse Proxy
    │
    ▼
Node.js
    │
    ▼
Response
```

Nginx decides what should happen to every request before it reaches the application.

---

## Nginx vs Apache

Nginx and Apache are both widely used web servers.

| Feature                 | Nginx        | Apache                                        |
| ----------------------- | ------------ | --------------------------------------------- |
| Architecture            | Event-driven | Process/Thread-based (traditional model)      |
| Memory Usage            | Lower        | Higher under heavy concurrency                |
| Static File Performance | Excellent    | Very Good                                     |
| Reverse Proxy           | Excellent    | Supported                                     |
| Concurrent Connections  | Very High    | Good                                          |
| Configuration           | Centralized  | Centralized with optional `.htaccess` support |

Both are mature and production-ready.

Nginx is particularly well known for handling large numbers of simultaneous connections efficiently.

---

## Event-Driven Architecture

One of Nginx's defining characteristics is its **event-driven architecture**.

Traditional servers often create a separate process or thread for many incoming requests.

```text
Client 1 → Process 1

Client 2 → Process 2

Client 3 → Process 3
```

As the number of clients grows, the number of processes or threads also increases.

Nginx takes a different approach.

```text
Thousands of Clients

↓

Few Nginx Worker Processes

↓

Event Loop

↓

Responses
```

Each worker process can efficiently handle many simultaneous connections by responding to network events instead of dedicating one process or thread to each client.

This architecture contributes to Nginx's low memory usage and strong performance under heavy load.

---

## Nginx in a Production Environment

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
Node.js
      │
      ▼
MongoDB Atlas
```

Each layer has a dedicated responsibility:

| Component     | Responsibility                   |
| ------------- | -------------------------------- |
| Cloudflare    | DNS, CDN, DDoS protection        |
| Nginx         | Web server, reverse proxy, HTTPS |
| PM2           | Process management               |
| Node.js       | Application logic                |
| MongoDB Atlas | Database                         |

This separation improves security, scalability, and maintainability.

---

## Advantages of Using Nginx

- High performance
- Low memory usage
- Efficient handling of concurrent connections
- Excellent reverse proxy capabilities
- Built-in SSL/TLS support
- Static file optimization
- Load balancing
- Compression support
- Browser caching
- Production-grade logging

---

## Real-World Example

Suppose an Express.js application is running on an Ubuntu server.

Without Nginx:

```text
Internet
     │
     ▼
Node.js (Port 3000)
```

Users connect directly to the application.

With Nginx:

```text
Internet
     │
     ▼
Cloudflare
     │
     ▼
Nginx (80/443)
     │
     ▼
PM2
     │
     ▼
Express.js (3000)
```

Nginx accepts all public traffic, terminates HTTPS, serves static assets, and forwards dynamic requests to the Express application. The backend application remains isolated from direct internet access while benefiting from Nginx's routing, logging, and performance features.

---

## Best Practices

- Place Nginx in front of backend applications.
- Expose only ports **80** and **443** to the public.
- Keep backend services accessible only internally whenever possible.
- Use Nginx to terminate HTTPS connections.
- Let Nginx serve static files instead of the application.
- Keep Nginx updated with security patches.
- Test configuration changes before reloading the service.

---

## Common Mistakes

#### Exposing the Application Directly

Allowing users to connect directly to Node.js bypasses many of the security and performance features provided by Nginx.

---

#### Treating Nginx as the Application Server

Nginx handles HTTP traffic, routing, and static content. The application's business logic still runs inside Node.js.

---

#### Assuming Nginx Replaces PM2

Nginx manages web traffic, while PM2 manages application processes. They serve different purposes and are commonly used together.

---

#### Ignoring the Layered Architecture

Production systems benefit from separating responsibilities across Cloudflare, Nginx, PM2, the application, and the database rather than combining everything into a single component.

---

## Summary

Nginx is a high-performance web server and reverse proxy that sits between users and backend applications. It accepts incoming HTTP and HTTPS requests, serves static content efficiently, forwards dynamic requests to application servers, and provides features such as SSL termination, load balancing, compression, and logging. In modern Linux deployments, Nginx is a core component that improves security, scalability, and reliability while allowing backend applications such as Node.js to focus solely on business logic.

---

### Next Chapter

➡️ **02 - Installing Nginx**
