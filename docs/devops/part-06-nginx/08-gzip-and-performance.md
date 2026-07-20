---
sidebar_label: Gzip and Performance
sidebar_position: 8
---


# Gzip and Performance

### Overview

By now, our Nginx server can:

- Accept incoming requests
- Route requests using Server Blocks
- Match URLs using Location Blocks
- Forward requests to backend applications
- Serve static files efficiently

However, there is another major aspect of a production web server:

> **Performance Optimization**

A fast website improves:

- User experience
- Page load times
- Server efficiency
- Network bandwidth usage
- Scalability

One of the easiest and most effective optimizations in Nginx is **Gzip Compression**.

In this chapter, we will learn how Gzip works, how to enable it, and explore several additional Nginx performance settings.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand HTTP compression.
- Learn how Gzip works.
- Configure Gzip in Nginx.
- Understand which files should be compressed.
- Learn about worker processes and worker connections.
- Optimize Nginx for production.
- Follow performance best practices.

---

## Why Performance Matters

Suppose a webpage contains:

- HTML
- CSS
- JavaScript
- Images
- Fonts

Without optimization:

```text
Browser
     │
     ▼
Download Large Files
     │
     ▼
Slow Page Load
```

With optimization:

```text
Browser
     │
     ▼
Compressed Files
     │
     ▼
Faster Page Load
```

Smaller responses generally mean less data transferred across the network.

---

## What is Gzip?

**Gzip** is a compression algorithm.

Instead of sending plain text files directly, Nginx compresses them before transmission.

Workflow:

```text
Original File
      │
      ▼
Gzip Compression
      │
      ▼
Compressed Response
      │
      ▼
Browser
      │
      ▼
Automatic Decompression
```

Modern browsers automatically decompress Gzip-compressed responses.

---

## Why Compress Files?

Suppose a JavaScript bundle is:

```text
500 KB
```

After Gzip compression:

```text
150 KB
```

Instead of downloading:

```text
500 KB
```

the browser downloads:

```text
150 KB
```

Benefits:

- Less bandwidth usage
- Faster downloads
- Reduced network latency
- Improved loading performance, especially on slower connections

The exact reduction depends on the file's contents.

---

## Which Files Should Be Compressed?

Text-based files usually compress very well.

Examples:

| File Type  | Compress? |
| ---------- | --------- |
| HTML       | Yes       |
| CSS        | Yes       |
| JavaScript | Yes       |
| JSON       | Yes       |
| XML        | Yes       |
| SVG        | Yes       |
| Plain Text | Yes       |

---

## Which Files Should NOT Be Compressed?

Many binary formats are already compressed.

Examples:

| File Type     | Compress?  |
| ------------- | ---------- |
| JPEG          | No         |
| PNG           | No         |
| GIF           | No         |
| MP4           | No         |
| ZIP           | No         |
| PDF (usually) | Usually No |
| MP3           | No         |

Compressing these files often provides little benefit while increasing CPU usage.

---

## Enabling Gzip

Basic configuration:

```nginx
gzip on;
```

This enables Gzip support.

However, production systems typically use additional settings.

---

## Production Gzip Configuration

Example:

```nginx
gzip on;

gzip_comp_level 5;

gzip_min_length 1024;

gzip_types
    text/plain
    text/css
    application/json
    application/javascript
    application/xml
    image/svg+xml;
```

Explanation:

| Directive         | Purpose                |
| ----------------- | ---------------------- |
| `gzip on`         | Enable Gzip            |
| `gzip_comp_level` | Compression level      |
| `gzip_min_length` | Minimum response size  |
| `gzip_types`      | File types to compress |

---

## Understanding Compression Levels

Compression level ranges from:

```text
1 → Fastest

↓

9 → Highest Compression
```

Comparison:

| Level | CPU Usage | Compression |
| ----- | --------- | ----------- |
| 1     | Low       | Lower       |
| 5     | Moderate  | Good        |
| 9     | High      | Maximum     |

For most production servers, levels around **4–6** provide a good balance between CPU usage and compression efficiency.

---

## gzip_min_length

Example:

```nginx
gzip_min_length 1024;
```

Meaning:

Only responses larger than **1024 bytes** are compressed.

Small responses often do not benefit enough from compression to justify the additional processing.

---

## gzip_types

By default, only a limited set of responses may be compressed.

Example:

```nginx
gzip_types

text/css

application/javascript

application/json

text/plain;
```

This tells Nginx which MIME types should be compressed before being sent to clients.

---

## Compression Workflow

```text
Browser
      │
      ▼
Request
      │
      ▼
Nginx
      │
Compress?
      │
 ┌────┴─────┐
 │          │
Yes         No
 │          │
 ▼          ▼
Gzip     Original File
 │          │
 └────┬─────┘
      ▼
Browser
```

---

## Worker Processes

Performance is not only about compression.

Nginx also uses **worker processes**.

Example:

```nginx
worker_processes auto;
```

Meaning:

Nginx automatically chooses an appropriate number of worker processes based on the available CPU cores.

Architecture:

```text
CPU Cores
     │
     ▼
Worker Processes
     │
     ▼
Incoming Requests
```

This allows Nginx to efficiently utilize multi-core systems.

---

## Worker Connections

Each worker process can handle many simultaneous connections.

Example:

```nginx
events {

    worker_connections 1024;

}
```

Meaning:

Each worker process can manage up to **1024** connections.

Total potential connections:

```text
Worker Processes

×

Worker Connections

=

Maximum Concurrent Connections
```

Actual capacity also depends on operating system limits and available resources.

---

## sendfile

Example:

```nginx
sendfile on;
```

Purpose:

Allows Nginx to transfer files efficiently using operating system capabilities, reducing unnecessary data copying between kernel and user space.

This improves performance when serving static files.

---

## tcp_nopush

Example:

```nginx
tcp_nopush on;
```

Purpose:

Optimizes how large responses are sent over the network by reducing the number of packets transmitted.

It is commonly used together with `sendfile`.

---

## tcp_nodelay

Example:

```nginx
tcp_nodelay on;
```

Purpose:

Reduces delays for small, interactive responses by sending packets promptly instead of waiting to accumulate additional data.

---

## keepalive_timeout

Example:

```nginx
keepalive_timeout 65;
```

Instead of closing every TCP connection immediately:

```text
Request

↓

Response

↓

Connection Closed
```

Nginx can keep the connection open for a short period.

```text
Request

↓

Response

↓

Connection Reused
```

This reduces the overhead of establishing new TCP connections for subsequent requests.

---

## Typical Performance Configuration

Example:

```nginx
worker_processes auto;

events {

    worker_connections 1024;

}

http {

    sendfile on;

    tcp_nopush on;

    tcp_nodelay on;

    keepalive_timeout 65;

    gzip on;

}
```

These settings provide a solid foundation for many production deployments.

---

## Request Lifecycle with Gzip

```text
Browser
      │
      ▼
Request
      │
      ▼
Nginx
      │
Static File
      │
      ▼
Gzip Compression
      │
      ▼
Network
      │
      ▼
Browser
      │
      ▼
Automatic Decompression
```

Compression is transparent to users.

---

## Measuring Performance

Useful commands:

Check Nginx configuration:

```bash
sudo nginx -t
```

Reload configuration:

```bash
sudo systemctl reload nginx
```

View active worker processes:

```bash
ps aux | grep nginx
```

Monitor CPU usage:

```bash
top
```

Monitor memory usage:

```bash
free -h
```

These tools help verify that performance settings are applied correctly and that the server is operating within expected resource limits.

---

## Real-World Example

Suppose a company hosts an Express.js application behind Nginx.

The homepage downloads:

- HTML
- CSS
- JavaScript
- JSON data

Without Gzip:

```text
Browser

↓

2.5 MB Download
```

With Gzip enabled:

```text
Browser

↓

Approximately 700 KB Download
```

The exact reduction depends on the content being served, but text-based resources are often compressed significantly.

As a result:

- Pages load faster.
- Less bandwidth is consumed.
- The server can handle more clients using the same network capacity.

---

## Best Practices

- Enable Gzip for text-based responses.
- Do not compress already compressed file formats.
- Use `worker_processes auto`.
- Configure an appropriate number of worker connections.
- Enable `sendfile` for static file delivery.
- Test configuration changes with `nginx -t`.
- Monitor CPU usage after enabling compression.
- Balance compression level with available server resources.

---

## Common Mistakes

#### Compressing Already Compressed Files

Applying Gzip to formats such as JPEG, PNG, MP4, or ZIP usually wastes CPU time without meaningful size reduction.

---

#### Using Maximum Compression Everywhere

Higher compression levels consume more CPU and may not provide proportionally better results.

---

#### Setting Worker Connections Too Low

An unnecessarily small limit can reduce the number of concurrent clients the server can handle.

---

#### Forgetting to Reload Nginx

Configuration changes are applied only after reloading or restarting the service.

---

#### Skipping Configuration Validation

Always verify configuration before reloading:

```bash
sudo nginx -t
```

---

## Summary

Performance optimization is a key responsibility of Nginx in production environments. Gzip compression reduces the size of text-based responses, resulting in faster page loads and lower bandwidth usage. Additional settings such as `worker_processes`, `worker_connections`, `sendfile`, `tcp_nopush`, `tcp_nodelay`, and `keepalive_timeout` improve request handling and resource utilization. Together, these optimizations help Nginx deliver fast, efficient, and scalable web services.

---

### Next Chapter

➡️ **09 - Caching**
