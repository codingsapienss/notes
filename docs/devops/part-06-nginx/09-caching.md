---
sidebar_label: Caching
sidebar_position: 9
---


# Caching

### Overview

In the previous chapter, we optimized Nginx using:

- Gzip Compression
- Worker Processes
- Worker Connections
- Sendfile
- Keep-Alive Connections

Another major optimization used by production web servers is **Caching**.

Instead of generating or downloading the same content repeatedly, Nginx can instruct browsers or store responses so they can be reused.

Benefits include:

- Faster page loads
- Reduced server load
- Lower bandwidth usage
- Better scalability
- Improved user experience

Caching is one of the simplest ways to significantly improve the performance of a website or API.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what caching is.
- Learn why caching improves performance.
- Understand browser caching.
- Learn proxy caching fundamentals.
- Configure cache headers.
- Understand cache expiration.
- Follow production caching best practices.

---

## What is Caching?

Caching is the process of **temporarily storing data so it can be reused instead of generating or downloading it again**.

Without caching:

```text
Browser
     │
     ▼
Request
     │
     ▼
Server
     │
     ▼
Response
```

Every request reaches the server.

With caching:

```text
Browser
     │
     ▼
Cache Available?
     │
 ┌───┴────┐
 │        │
Yes       No
 │         │
 ▼         ▼
Cached   Server
Copy     Request
```

If a valid cached copy exists, the server may not need to process the request again.

---

## Why is Caching Important?

Suppose a website contains:

- Company logo
- CSS files
- JavaScript bundles
- Fonts

These files usually change infrequently.

Without caching:

```text
Visit 1

↓

Download Everything

↓

Visit 2

↓

Download Everything Again
```

With caching:

```text
Visit 1

↓

Download Files

↓

Store in Browser

↓

Visit 2

↓

Reuse Cached Files
```

Only new or changed resources need to be downloaded.

---

## Types of Caching

Nginx commonly works with two types of caching.

| Cache Type    | Purpose                              |
| ------------- | ------------------------------------ |
| Browser Cache | Stores files on the user's device    |
| Proxy Cache   | Stores responses on the Nginx server |

---

## Browser Caching

Browser caching tells the user's browser:

> "You may reuse this file for a specified amount of time."

Example:

```text
Browser
     │
     ▼
Request CSS
     │
     ▼
Nginx
     │
     ▼
CSS + Cache Header
     │
     ▼
Browser Stores File
```

On future visits, the browser can use the local copy if it is still valid.

---

## Cache-Control Header

One of the most important HTTP headers is:

```text
Cache-Control
```

Example:

```text
Cache-Control: public, max-age=86400
```

Meaning:

- `public` → Any cache may store the response.
- `max-age=86400` → Cache the response for **86,400 seconds (24 hours)**.

---

## Expires Header

Another commonly used header is:

```text
Expires
```

Example:

```text
Expires: Wed, 01 Jan 2027 00:00:00 GMT
```

This specifies an exact date and time after which the cached resource is considered expired.

Modern applications often rely primarily on `Cache-Control`, but `Expires` is still supported and commonly used.

---

## Configuring Browser Caching

Example:

```nginx
location /images/ {

    expires 30d;

}
```

Meaning:

Images may be cached for **30 days**.

Workflow:

```text
Browser

↓

Request Image

↓

Nginx

↓

Expires: 30 Days

↓

Browser Cache
```

---

## Caching CSS and JavaScript

Example:

```nginx
location ~* \.(css|js)$ {

    expires 7d;

}
```

Files matching:

```text
style.css

app.js

bundle.js
```

may be cached for **7 days**.

---

## Caching Images

Example:

```nginx
location ~* \.(png|jpg|jpeg|gif|svg|webp)$ {

    expires 30d;

}
```

Images usually change less frequently than CSS or JavaScript files.

Longer cache durations are therefore common.

---

## Cache-Control Example

Example configuration:

```nginx
location / {

    add_header Cache-Control "public, max-age=3600";

}
```

Meaning:

```text
Cache Response

↓

1 Hour
```

The browser can reuse the response for up to one hour before checking for an updated version.

---

## Browser Cache Workflow

```text
First Visit
      │
      ▼
Browser
      │
      ▼
Nginx
      │
      ▼
Response + Cache Headers
      │
      ▼
Browser Stores Copy
      │
      ▼
Future Visit
      │
      ▼
Use Cached Copy
```

This reduces network traffic and improves loading speed.

---

## Proxy Caching

Unlike browser caching, **Proxy Caching** stores responses on the Nginx server itself.

Architecture:

```text
Browser
      │
      ▼
Nginx Cache
      │
 ┌────┴─────┐
 │          │
Hit         Miss
 │           │
 ▼           ▼
Response   Backend
```

If the requested content already exists in the proxy cache and is still valid, Nginx can return it without contacting the backend application.

---

## Why Proxy Cache?

Suppose an API endpoint returns the same data repeatedly.

Without proxy cache:

```text
100 Users

↓

100 Requests

↓

100 Database Queries
```

With proxy cache:

```text
100 Users

↓

Nginx Cache

↓

1 Backend Request
```

This significantly reduces backend workload for cacheable responses.

---

## Basic Proxy Cache Configuration

A simplified example:

```nginx
proxy_cache_path /var/cache/nginx
                 levels=1:2
                 keys_zone=my_cache:10m;

server {

    location /api/ {

        proxy_cache my_cache;

        proxy_pass http://localhost:3000;

    }

}
```

Explanation:

| Directive          | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `proxy_cache_path` | Defines where cached responses are stored  |
| `keys_zone`        | Allocates shared memory for cache metadata |
| `proxy_cache`      | Enables caching for the location           |
| `proxy_pass`       | Forwards requests to the backend           |

This configuration introduces the basic concept of proxy caching. Production deployments often include additional settings such as cache durations, cache validation, and rules for bypassing the cache.

---

## Cache Hit vs Cache Miss

```text
Request
   │
   ▼
Cache Lookup
   │
 ┌─┴─────┐
 │       │
Hit      Miss
 │        │
 ▼        ▼
Return   Backend
Cache    Response
```

Definitions:

- **Cache Hit** → Response served directly from cache.
- **Cache Miss** → Backend application generates the response.

A higher cache hit rate generally improves performance.

---

## What Should Be Cached?

Good candidates:

- Images
- CSS
- JavaScript
- Fonts
- Static HTML
- Public API responses
- Documentation

These resources typically change infrequently or can tolerate short periods of caching.

---

## What Should NOT Be Cached?

Avoid caching:

- Login pages
- Payment requests
- User profiles
- Shopping carts
- Session-specific data
- Administrative interfaces

These resources often contain personalized or frequently changing information.

---

## Typical Production Architecture

```text
Browser
     │
     ▼
Cloudflare
     │
     ▼
Nginx
     │
 ┌────┴──────────┐
 ▼               ▼
Browser Cache  Proxy Cache
                  │
                  ▼
              Node.js
                  │
                  ▼
              MongoDB
```

Caching can occur at multiple layers, each reducing work for the layer beneath it.

---

## Measuring Cache Benefits

Without caching:

```text
1000 Requests

↓

1000 Backend Responses
```

With effective caching:

```text
1000 Requests

↓

900 Cached Responses

↓

100 Backend Responses
```

This reduces CPU usage, memory consumption, and database activity.

---

## Real-World Example

Suppose an online shopping website serves:

- Product images
- CSS
- JavaScript bundles
- Product categories

Product images rarely change, so they are cached for **30 days**.

CSS and JavaScript files are cached for **7 days**.

Public API responses showing product categories are cached briefly on the Nginx proxy.

However, pages such as:

- Checkout
- Login
- User Orders
- Payment Confirmation

are **not** cached because they contain user-specific or frequently changing information.

This combination improves performance while ensuring users always receive accurate dynamic data.

---

## Best Practices

- Cache static assets aggressively.
- Use `Cache-Control` and `Expires` headers appropriately.
- Cache public API responses only when safe.
- Avoid caching authenticated or personalized content.
- Use versioned filenames for CSS and JavaScript when possible.
- Monitor cache effectiveness after deployment.
- Test configuration using `nginx -t` before reloading.

---

## Common Mistakes

#### Caching Dynamic User Data

Personalized pages should generally not be cached unless the application explicitly supports it.

---

#### Using Excessively Long Cache Durations

Frequently updated resources may continue to display outdated content if cache lifetimes are too long.

---

#### Forgetting Cache Invalidation

When content changes, cached copies may need to expire or be replaced so users receive the latest version.

---

#### Caching Sensitive Information

Responses containing authentication details, personal information, or payment data should never be cached publicly.

---

#### Skipping Configuration Validation

Always verify configuration changes before reloading Nginx.

```bash
sudo nginx -t
```

---

## Summary

Caching is one of the most effective performance optimizations available in Nginx. Browser caching stores resources on the client, while proxy caching stores responses on the server. Together, these mechanisms reduce bandwidth usage, improve response times, decrease backend workload, and enhance scalability. By understanding cache headers, expiration policies, cache hits, and cache misses, administrators can design efficient caching strategies that improve performance without compromising data accuracy.

---

### Next Chapter

➡️ **10 - SSL with Nginx**
