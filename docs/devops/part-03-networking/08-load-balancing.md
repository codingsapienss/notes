---
sidebar_label: Load Balancing
sidebar_position: 8
---


# Load Balancing

## Overview

Imagine you deploy a Node.js application on a single server.

Initially, everything works perfectly.

As your application becomes more popular, thousands of users begin accessing it simultaneously. Eventually, the server becomes overloaded.

Symptoms may include:

- Slow response times
- High CPU usage
- High memory consumption
- Request timeouts
- Application crashes

Simply purchasing a larger server is not always the best solution.

Instead, production systems often **distribute incoming requests across multiple servers** using a **Load Balancer**.

Load balancing improves:

- Performance
- Availability
- Reliability
- Fault tolerance
- Scalability

Modern cloud platforms and web infrastructures rely heavily on load balancing to serve millions of users every day.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what load balancing is.
- Learn why load balancing is necessary.
- Understand horizontal and vertical scaling.
- Learn common load balancing algorithms.
- Understand health checks.
- Learn session persistence.
- Understand how Nginx performs load balancing.

---

# Why Do We Need Load Balancing?

Consider a single application server.

```text id="r8m3qy"
Users

↓

Server

↓

Node.js
```

As traffic increases, the server eventually reaches its limits.

Instead of handling all requests with one server, a load balancer distributes traffic across multiple servers.

```text id="t4k9xa"
Users

↓

Load Balancer

↓

App 1

App 2

App 3
```

Each server handles only a portion of the total traffic.

---

# What is a Load Balancer?

A **Load Balancer** is a system that receives incoming client requests and distributes them across multiple backend servers.

Clients communicate only with the load balancer.

The backend servers remain hidden behind it.

```text id="p6v2lc"
Client

↓

Load Balancer

↓

Backend Servers
```

The client is unaware of which backend server processed the request.

---

# Load Balancer vs Reverse Proxy

Many beginners confuse these concepts.

| Reverse Proxy                                  | Load Balancer                                        |
| ---------------------------------------------- | ---------------------------------------------------- |
| Receives requests on behalf of backend servers | Distributes requests across multiple backend servers |
| Can forward traffic to one or more servers     | Specifically focuses on traffic distribution         |
| Can terminate SSL/TLS                          | Can also terminate SSL/TLS                           |
| Can cache, compress, and secure traffic        | Often includes reverse proxy features                |

**Important:**

Many modern reverse proxies (including **Nginx**) can also function as load balancers.

---

# Vertical Scaling vs Horizontal Scaling

## Vertical Scaling

Increase the resources of an existing server.

Example:

```text id="h2q8wf"
2 CPU

↓

8 CPU
```

or

```text id="d9m4rz"
4 GB RAM

↓

16 GB RAM
```

Advantages:

- Simple
- No application changes required

Disadvantages:

- Hardware limits
- Downtime during upgrades
- Higher costs

---

## Horizontal Scaling

Instead of upgrading one server, add more servers.

```text id="c7p5xy"
Server 1

Server 2

Server 3

Server 4
```

Traffic is distributed among all servers.

Advantages:

- Better scalability
- Improved fault tolerance
- Higher availability
- Easier maintenance

Most production cloud systems prefer horizontal scaling.

---

# Basic Architecture

```text id="g5n2vm"
Internet

↓

Load Balancer

↓

Server A

Server B

Server C
```

If 900 users connect simultaneously, each server may receive approximately 300 requests (depending on the balancing algorithm).

---

# Common Load Balancing Algorithms

A load balancer decides where to send each request.

Different algorithms make this decision differently.

---

## Round Robin

The simplest algorithm.

Requests are distributed one by one.

```text id="x8k4rt"
Request 1 → Server A

Request 2 → Server B

Request 3 → Server C

Request 4 → Server A

Request 5 → Server B
```

Advantages:

- Simple
- Fair distribution
- No server state required

Suitable when backend servers have similar capacity.

---

## Least Connections

The request goes to the server handling the fewest active connections.

Example:

```text id="u6v9la"
Server A → 120 Connections

Server B → 40 Connections

↓

Next Request

↓

Server B
```

Useful when request durations vary significantly.

---

## IP Hash

The client's IP address determines the backend server.

```text id="a1r7pk"
192.168.1.10

↓

Server A
```

The same client is consistently routed to the same backend while the server pool remains unchanged.

This helps maintain user sessions without additional storage.

---

## Weighted Round Robin

Some servers may have greater processing capacity.

Example:

```text id="v9q3mn"
Server A

Weight 4

Server B

Weight 2

Server C

Weight 1
```

Server A receives more requests because it has a higher weight.

---

# Health Checks

What happens if one backend server crashes?

A load balancer continuously checks server health.

```text id="m7w5fd"
Server A ✓

Server B ✓

Server C ✗
```

If a server becomes unhealthy, it is removed from the rotation.

Requests continue flowing to healthy servers.

This improves availability.

---

# Failover

Suppose three backend servers exist.

```text id="e4x8jh"
App 1 ✓

App 2 ✓

App 3 ✗
```

Instead of sending traffic to the failed server:

```text id="q5n1tb"
Users

↓

Load Balancer

↓

App 1

App 2
```

Traffic is automatically redirected to healthy servers.

Users may never notice the failure.

---

# Session Persistence (Sticky Sessions)

Some applications store user session data in server memory.

Without session persistence:

```text id="k8v4ry"
Login

↓

Server A

↓

Next Request

↓

Server B
```

Server B does not know about the user's session.

A load balancer can keep sending requests from the same client to the same backend.

This is called **Sticky Sessions** or **Session Persistence**.

However, modern applications often avoid this requirement by storing sessions in shared storage such as **Redis**, allowing any backend server to process requests.

---

# Load Balancing with Nginx

Nginx can distribute requests across multiple Node.js servers.

Example architecture:

```text id="y3m7qp"
Internet

↓

Nginx

↓

Node 1 :3000

Node 2 :3001

Node 3 :3002
```

Nginx receives requests and forwards them according to the configured balancing algorithm.

---

# PM2 Cluster Mode vs Load Balancer

These concepts complement each other but solve different problems.

| PM2 Cluster                               | Load Balancer                               |
| ----------------------------------------- | ------------------------------------------- |
| Multiple Node.js processes on one machine | Multiple servers or services                |
| Uses all CPU cores                        | Uses multiple backend instances             |
| Improves performance on a single server   | Improves scalability across servers         |
| Local to one machine                      | Can span multiple machines and data centers |

A common production setup uses both:

```text id="p2k8zw"
Internet

↓

Nginx

↓

VM 1 (PM2 Cluster)

VM 2 (PM2 Cluster)

VM 3 (PM2 Cluster)
```

---

# Cloud Load Balancers

Major cloud providers offer managed load balancers.

Examples:

| Cloud Provider | Service                                         |
| -------------- | ----------------------------------------------- |
| Azure          | Azure Load Balancer / Azure Application Gateway |
| AWS            | Elastic Load Balancer (ELB)                     |
| Google Cloud   | Cloud Load Balancing                            |

Managed services provide:

- Automatic health checks
- High availability
- Auto scaling integration
- SSL/TLS support
- Traffic routing

---

# Real-World Example

Imagine your application receives **200,000 users** during a promotional campaign.

Without load balancing:

```text id="n6q4ha"
Users

↓

Single Azure VM

↓

CPU 100%

↓

Application Slow
```

With load balancing:

```text id="c8r1mv"
Users

↓

Cloudflare

↓

Azure Load Balancer

↓

VM 1

VM 2

VM 3

↓

Nginx

↓

Node.js
```

Traffic is distributed across multiple virtual machines.

If one VM fails, requests continue flowing to the remaining healthy instances.

This architecture supports high traffic while maintaining availability.

---

# Best Practices

- Design applications to be stateless whenever possible.
- Use shared storage (such as Redis or databases) for session data.
- Enable health checks to detect failed servers.
- Combine reverse proxies with load balancing for production deployments.
- Monitor CPU, memory, and response times to determine when scaling is required.
- Test failover scenarios before deploying to production.

---

# Common Mistakes

### Assuming Bigger Servers Solve Every Problem

Vertical scaling has practical limits.

Horizontal scaling is generally more flexible and resilient for growing applications.

---

### Storing Sessions Only in Memory

When using multiple backend servers, in-memory sessions may lead to inconsistent user experiences.

Use shared session storage or token-based authentication where appropriate.

---

### Ignoring Health Checks

Without health checks, a load balancer may continue sending requests to failed servers.

---

### Confusing PM2 Cluster with Load Balancing

PM2 Cluster distributes work across CPU cores on a single machine.

A load balancer distributes traffic across multiple backend instances or servers.

They solve different scaling problems.

---

# Summary

Load balancing distributes incoming requests across multiple backend servers, improving scalability, performance, and fault tolerance. Modern load balancers support algorithms such as Round Robin, Least Connections, IP Hash, and Weighted Round Robin while providing health checks and failover capabilities. Nginx can act as both a reverse proxy and a load balancer, making it a common choice for production deployments. Combined with stateless application design and shared session storage, load balancing forms the foundation of highly available web architectures.

---

## Next Chapter

➡️ **09 - Network Troubleshooting**
