---
sidebar_label: Server Blocks
sidebar_position: 4
---


# Server Blocks

### Overview

In the previous chapter, we explored the Nginx directory structure and learned how configuration files are organized.

Now it's time to understand one of the most important concepts in Nginx:

**Server Blocks**

A Server Block defines **how Nginx should respond to requests for a particular domain, IP address, or port.**

Using Server Blocks, a single Linux server can host:

- Multiple websites
- Multiple APIs
- Multiple Node.js applications
- Multiple subdomains

without requiring separate servers.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Server Block is.
- Learn how virtual hosting works.
- Configure multiple websites on one server.
- Understand the `listen` directive.
- Understand the `server_name` directive.
- Create and enable Server Blocks.
- Follow production best practices.

---

## What is a Server Block?

A **Server Block** is a section of an Nginx configuration file that tells Nginx:

- Which requests it should handle.
- Which domain names belong to it.
- Which port it should listen on.
- How requests should be processed.

General structure:

```nginx
server {

    ...

}
```

Each `server {}` block is independent.

A single Nginx installation can contain many Server Blocks.

---

## Why Are Server Blocks Needed?

Imagine a company hosting three applications.

- Website
- API
- Admin Dashboard

Without Server Blocks:

```text
Internet
     │
     ▼
One Configuration
     │
     ▼
Everything Mixed Together
```

Managing multiple applications quickly becomes difficult.

With Server Blocks:

```text
Internet
     │
     ▼
          Nginx
     ┌─────┼─────────┐
     ▼     ▼         ▼
Website   API     Dashboard
```

Each application has its own configuration.

---

## Virtual Hosting

Server Blocks implement **virtual hosting**.

Virtual hosting allows one physical server to host multiple websites.

Example:

| Domain            | Application     |
| ----------------- | --------------- |
| example.com       | Company Website |
| api.example.com   | REST API        |
| admin.example.com | Admin Dashboard |

Although all three domains point to the same server, Nginx routes each request to the correct Server Block.

---

## How Nginx Chooses a Server Block

When a request arrives, Nginx checks:

1. Port
2. Domain name
3. Matching Server Block

Workflow:

```text
Browser
     │
     ▼
example.com
     │
     ▼
Port 80
     │
     ▼
Nginx
     │
     ▼
Matching Server Block
```

The selected Server Block processes the request.

---

## Basic Server Block

Example:

```nginx
server {

    listen 80;

    server_name example.com;

    root /var/www/html;

}
```

This tells Nginx:

- Listen on port 80
- Respond to `example.com`
- Serve files from `/var/www/html`

---

## The listen Directive

The `listen` directive specifies which port Nginx should accept requests on.

Example:

```nginx
listen 80;
```

For HTTPS:

```nginx
listen 443 ssl;
```

Common ports:

| Port | Protocol |
| ---- | -------- |
| 80   | HTTP     |
| 443  | HTTPS    |

A Server Block can also listen on multiple ports.

Example:

```nginx
listen 80;

listen [::]:80;
```

---

## The server_name Directive

The `server_name` directive defines which domain names belong to the Server Block.

Example:

```nginx
server_name example.com;
```

Multiple domains:

```nginx
server_name example.com www.example.com;
```

Subdomain:

```nginx
server_name api.example.com;
```

Multiple subdomains:

```nginx
server_name api.example.com admin.example.com;
```

---

## Hosting Multiple Websites

Suppose one server hosts three websites.

```text
Internet
     │
     ▼
Nginx
     │
 ┌───┼────────────┐
 ▼   ▼            ▼
Site A  Site B  Site C
```

Configuration:

```text
sites-available/

site-a

site-b

site-c
```

Each file contains one or more Server Blocks.

---

## Default Server

What happens if a request doesn't match any configured domain?

Nginx uses the **default server**.

Example:

```nginx
listen 80 default_server;
```

Workflow:

```text
Incoming Request
        │
        ▼
Known Domain?
   │         │
 Yes         No
 │            │
 ▼            ▼
Site      Default Server
```

The default server often displays a default page or returns an error depending on the configuration.

---

## Typical Production Layout

```text
/etc/nginx/

sites-available/

    company

    api

    admin

sites-enabled/

    company

    api

    admin
```

Each configuration file usually represents one application or website.

---

## Example: Company Website

```nginx
server {

    listen 80;

    server_name company.com www.company.com;

    root /var/www/company;

    index index.html;

}
```

Requests:

```text
company.com

↓

Nginx

↓

/var/www/company
```

---

## Example: API

```nginx
server {

    listen 80;

    server_name api.company.com;

    ...

}
```

Instead of serving static files, the API Server Block usually forwards requests to a backend application.

---

## Example: Admin Dashboard

```nginx
server {

    listen 80;

    server_name admin.company.com;

    ...

}
```

The dashboard has its own independent configuration.

---

## Server Block Selection Example

Suppose Nginx has three Server Blocks.

```text
Server Block A

example.com

↓

Website

--------------------

Server Block B

api.example.com

↓

API

--------------------

Server Block C

admin.example.com

↓

Dashboard
```

Incoming requests:

| Request           | Selected Server Block |
| ----------------- | --------------------- |
| example.com       | Website               |
| api.example.com   | API                   |
| admin.example.com | Dashboard             |

Nginx performs this matching automatically.

---

## Configuration Workflow

Creating a new website usually follows this process.

```text
Create Configuration
        │
        ▼
sites-available
        │
        ▼
Create Symbolic Link
        │
        ▼
sites-enabled
        │
        ▼
Test Configuration
        │
        ▼
Reload Nginx
```

Commands:

```bash
sudo nginx -t

sudo systemctl reload nginx
```

Always test the configuration before reloading.

---

## Relationship with Location Blocks

A Server Block decides **which website or application** should receive the request.

Inside that Server Block, **Location Blocks** decide **how different URLs are handled**.

```text
Incoming Request
        │
        ▼
Server Block
        │
        ▼
Location Block
        │
        ▼
Response
```

The next chapter explores Location Blocks in detail.

---

## Real-World Example

Suppose a company owns the following domains:

| Domain            | Purpose            |
| ----------------- | ------------------ |
| company.com       | Marketing Website  |
| api.company.com   | Express API        |
| admin.company.com | Internal Dashboard |

All three domains point to the same Ubuntu server.

When a request arrives for:

```text
api.company.com
```

Nginx:

1. Receives the request.
2. Reads the `Host` header.
3. Matches the appropriate Server Block using `server_name`.
4. Applies the configuration defined for that API.
5. Returns the response or forwards the request to the backend application.

This approach allows multiple independent applications to run on a single server while maintaining separate configurations.

---

## Best Practices

- Create one configuration file per website or application.
- Use descriptive file names inside `sites-available`.
- Configure the correct `server_name` values.
- Keep unrelated applications in separate Server Blocks.
- Test configurations using `nginx -t`.
- Reload Nginx after successful validation.
- Configure a default server for unmatched requests.

---

## Common Mistakes

#### Putting Multiple Applications Inside One Server Block

Separate applications should generally have separate Server Blocks to simplify maintenance and troubleshooting.

---

#### Forgetting server_name

Without the correct `server_name`, Nginx may route requests to the wrong Server Block or fall back to the default server.

---

#### Editing Enabled Configurations Directly

Edit the original configuration file in `sites-available` rather than the symbolic link in `sites-enabled`.

---

#### Forgetting to Reload Nginx

Configuration changes are not applied until Nginx is reloaded or restarted.

---

#### Skipping Configuration Validation

Always run:

```bash
sudo nginx -t
```

before reloading the service.

---

## Summary

Server Blocks are the foundation of Nginx virtual hosting. They allow a single Nginx instance to host multiple websites, APIs, and applications by matching incoming requests based on ports and domain names. By organizing each application into its own Server Block, administrators can build scalable, maintainable, and production-ready web server configurations.

---

### Next Chapter

➡️ **05 - Location Blocks**
