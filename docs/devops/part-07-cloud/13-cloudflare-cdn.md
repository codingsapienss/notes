---
sidebar_label: Cloudflare CDN
sidebar_position: 13
---


# Cloudflare CDN

### Overview

In the previous chapter, we learned how Cloudflare provides secure HTTPS communication using SSL/TLS.

However, security is only one part of building a modern web application.

Imagine your application is hosted on an Azure Virtual Machine in **Central India**.

Now consider users visiting your website from:

- India
- Australia
- Germany
- Brazil
- Canada

Without a Content Delivery Network (CDN), every user request must travel all the way to your Azure server.

This increases:

- Network latency
- Server load
- Response time

Cloudflare solves this problem using its **Content Delivery Network (CDN)**.

Instead of serving every request from your origin server, Cloudflare stores copies of cacheable content on servers around the world.

Users receive content from the nearest Cloudflare data center rather than waiting for it to travel from the origin every time.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a CDN is.
- Learn how Cloudflare's CDN works.
- Understand edge servers.
- Learn cache hits and cache misses.
- Understand cache expiration.
- Learn which content should be cached.
- Follow CDN best practices.

---

## What is a CDN?

A **Content Delivery Network (CDN)** is a globally distributed network of servers that stores copies of content closer to users.

Instead of serving every request from a single server:

```text id="cdn01"
Users

↓

Origin Server
```

A CDN serves cached content from nearby locations.

```text id="cdn02"
Users

↓

Nearest CDN Server

↓

Origin Server (if needed)
```

The goal is to reduce latency and improve performance.

---

## Why Do We Need a CDN?

Suppose your application is hosted in India.

Without a CDN:

```text id="cdn03"
User (Brazil)

↓

Internet

↓

India

↓

Origin Server
```

Every request travels thousands of kilometers.

With Cloudflare CDN:

```text id="cdn04"
User (Brazil)

↓

Cloudflare Brazil Edge

↓

Cached Content
```

The request is served much closer to the user.

---

## Cloudflare Edge Network

Cloudflare operates a large global network of edge data centers.

Architecture:

```text id="cdn05"
Users

↓

Nearest Cloudflare Edge

↓

Origin Server
```

Every edge location can store cached copies of static resources.

---

## What is an Edge Server?

An **Edge Server** is a Cloudflare server located closer to end users.

Instead of requesting data from the origin server every time:

```text id="cdn06"
User

↓

Edge Server

↓

Origin Server
```

The Edge Server can respond immediately if it already has the requested content.

---

## First Request

Suppose a user requests:

```text id="cdn07"
logo.png
```

Cloudflare checks its cache.

```text id="cdn08"
Edge Server

↓

Cache Empty

↓

Origin Server
```

The origin server sends the file.

Cloudflare stores a copy.

---

## Second Request

Later, another nearby user requests the same file.

```text id="cdn09"
Edge Server

↓

Cached File

↓

User
```

The request no longer reaches the origin server.

This reduces server workload and improves response times.

---

## Cache Hit

A **Cache Hit** occurs when Cloudflare already has the requested resource.

```text id="cdn10"
User

↓

Cloudflare Cache

↓

Response
```

Advantages:

- Faster response
- Lower latency
- Reduced origin traffic

---

## Cache Miss

A **Cache Miss** occurs when the requested content is not yet cached.

```text id="cdn11"
User

↓

Cloudflare

↓

Origin Server

↓

Cloudflare Cache

↓

User
```

After retrieving the content, Cloudflare stores it for future requests.

---

## Cache Lifecycle

A simplified cache lifecycle:

```text id="cdn12"
Request

↓

Cache Hit?

↓

Yes

↓

Return Cached Copy

↓

No

↓

Origin Server

↓

Store in Cache
```

Cloudflare repeats this process continuously for cacheable resources.

---

## What Can Be Cached?

Typical cacheable resources include:

- Images
- CSS
- JavaScript
- Fonts
- PDFs
- Static HTML (when configured)
- Videos (depending on configuration)

These files usually change infrequently.

---

## What Should Not Be Cached?

Dynamic content is generally served by the origin server.

Examples include:

- User login pages
- Shopping carts
- Payment pages
- Personalized dashboards
- API responses (unless specifically configured)
- Database queries

Serving outdated dynamic content can lead to incorrect application behavior.

---

## Static vs Dynamic Content

| Static Content | Dynamic Content |
| -------------- | --------------- |
| Images         | Login pages     |
| CSS            | Shopping cart   |
| JavaScript     | User profile    |
| Fonts          | Payment page    |
| Documents      | API responses   |
| Logos          | Live dashboards |

Understanding this distinction is essential for effective caching.

---

## Cache Expiration

Cached content should eventually be refreshed.

```text id="cdn13"
Cache

↓

Expiration Time

↓

Refresh from Origin
```

Cloudflare uses cache-control information and caching policies to determine when cached content should be updated.

---

## Cache-Control Headers

Origin servers can influence caching behavior using HTTP response headers.

Common directives include:

| Header          | Purpose                             |
| --------------- | ----------------------------------- |
| `Cache-Control` | Defines caching behavior            |
| `Expires`       | Specifies an expiration time        |
| `ETag`          | Helps validate cached content       |
| `Last-Modified` | Indicates when content last changed |

These headers allow the origin server to communicate caching policies to intermediaries such as Cloudflare and browsers.

---

## CDN Performance Benefits

Without CDN:

```text id="cdn14"
User

↓

Origin Server

↓

Response
```

With CDN:

```text id="cdn15"
User

↓

Nearby Edge Server

↓

Response
```

Benefits include:

- Lower latency
- Faster page loads
- Reduced bandwidth usage
- Lower origin server load
- Improved scalability

---

## Typical Production Architecture

```text id="cdn16"
Users
   │
   ▼
Nearest Cloudflare Edge
   │
   ▼
Cloudflare Cache
   │
Cache Miss?
   │
   ▼
Azure Virtual Machine
   │
   ▼
Nginx
   │
   ▼
Node.js
```

Only requests that cannot be served from the cache reach the origin server.

---

## CDN and Global Traffic

Suppose users are located in multiple countries.

```text id="cdn17"
India Users

↓

India Edge
```

```text id="cdn18"
Europe Users

↓

Europe Edge
```

```text id="cdn19"
Australia Users

↓

Australia Edge
```

Each region receives content from its nearest Cloudflare edge location whenever possible.

---

## CDN and Origin Server Load

Without Cloudflare CDN:

```text id="cdn20"
10,000 Users

↓

10,000 Requests

↓

Origin Server
```

With Cloudflare CDN:

```text id="cdn21"
10,000 Users

↓

Cloudflare Cache

↓

1,000 Requests

↓

Origin Server
```

The exact reduction depends on the application's cacheability, but serving repeated requests from cache significantly decreases load on the origin.

---

## Typical Deployment Example

Suppose your Node.js application serves:

- Company logo
- Product images
- CSS
- JavaScript
- Fonts

Architecture:

```text id="cdn22"
Browser
   │
   ▼
Cloudflare Edge
   │
 ┌────┼─────────────┐
 ▼    ▼             ▼
CSS Images     JavaScript
(Cache)
```

Dynamic API requests continue to the origin server, while static assets are delivered from the cache.

---

## Real-World Example

Suppose an e-commerce company hosts its application in Central India.

Every product page contains:

- 20 product images
- CSS files
- JavaScript bundles
- Company logo
- Font files

Without a CDN, every customer worldwide downloads these files directly from the Azure Virtual Machine.

After enabling Cloudflare CDN:

- Product images are cached at Cloudflare edge locations.
- CSS and JavaScript bundles are served from nearby edge servers.
- The Azure server mainly handles dynamic operations such as authentication, shopping carts, inventory checks, and order processing.

As a result:

- Pages load faster.
- Bandwidth consumption decreases.
- The origin server handles fewer requests.
- The application scales more efficiently under high traffic.

---

## Best Practices

- Cache static assets such as images, CSS, JavaScript, and fonts.
- Avoid caching sensitive or personalized content unless explicitly designed for it.
- Use appropriate cache-control headers.
- Version static assets so updates are reflected when new files are deployed.
- Monitor cache performance using Cloudflare analytics.
- Test application behavior after changing caching rules.
- Combine CDN caching with proper compression and image optimization.

---

## Common Mistakes

#### Caching Dynamic Pages

Caching personalized or frequently changing content can result in users seeing outdated or incorrect information.

---

#### Forgetting Cache Invalidation

After updating static files, failing to invalidate or version cached assets may cause users to receive older versions.

---

#### Assuming Every Request Is Cached

Only cacheable resources are served from Cloudflare's edge. Dynamic requests usually continue to the origin server unless explicitly configured otherwise.

---

#### Ignoring HTTP Cache Headers

Poor cache-control settings can reduce CDN effectiveness or keep outdated content in cache longer than intended.

---

#### Using the Origin Server for All Static Assets

Serving large static resources directly from the origin increases bandwidth usage and unnecessary server load.

---

## Summary

A Content Delivery Network (CDN) improves website performance by storing cacheable content on geographically distributed edge servers. Cloudflare's CDN serves static resources such as images, CSS, JavaScript, fonts, and documents from locations closer to users, reducing latency and decreasing load on the origin server. Understanding concepts such as edge servers, cache hits, cache misses, cache expiration, and cache-control headers enables administrators to build faster, more scalable web applications while using cloud resources more efficiently.

---

### Next Chapter

➡️ **Part 8 - Monitoring & Logging**
