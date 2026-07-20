---
sidebar_label: Location Blocks
sidebar_position: 5
---


# Location Blocks

### Overview

In the previous chapter, we learned that **Server Blocks** determine **which website or application** should handle an incoming request.

However, once a request reaches the correct Server Block, another question remains:

> **How should different URLs be handled?**

For example:

- `/`
- `/login`
- `/images/logo.png`
- `/api/users`
- `/admin/dashboard`

Should these requests:

- Serve static files?
- Return HTML?
- Forward to a Node.js application?
- Redirect somewhere else?

This is the purpose of **Location Blocks**.

Location Blocks allow Nginx to match URL paths and decide exactly how each request should be processed.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Location Block is.
- Learn how URL matching works.
- Configure prefix and exact matches.
- Understand regular expression matching.
- Route requests to different applications.
- Serve static files using Location Blocks.
- Follow production best practices.

---

## What is a Location Block?

A Location Block defines **how Nginx should process requests for a specific URL path**.

General syntax:

```nginx
location PATH {

    ...

}
```

Every request entering a Server Block is compared against one or more Location Blocks.

---

## Server Block vs Location Block

It is important to understand the difference.

```text
Incoming Request
        │
        ▼
Server Block
(Which Website?)
        │
        ▼
Location Block
(Which URL?)
        │
        ▼
Response
```

Think of it as two stages:

| Component      | Determines                              |
| -------------- | --------------------------------------- |
| Server Block   | Which website/application               |
| Location Block | How the requested URL should be handled |

---

## Basic Example

```nginx
server {

    listen 80;

    server_name example.com;

    location / {

        root /var/www/html;

    }

}
```

When someone visits:

```text
http://example.com/
```

Nginx matches:

```text
/
```

and serves content from:

```text
/var/www/html
```

---

## Request Matching Process

Every incoming request follows this workflow.

```text
Browser
      │
      ▼
Server Block
      │
      ▼
Location Matching
      │
      ▼
Matching Location
      │
      ▼
Response
```

Only one Location Block ultimately handles the request.

---

## Prefix Match

The most common type is the **prefix match**.

Example:

```nginx
location /images/ {

    ...

}
```

Requests:

```text
/images/logo.png

/images/banner.jpg

/images/icons/home.svg
```

All begin with:

```text
/images/
```

Therefore, this Location Block is selected.

---

## Root Location

The root location:

```nginx
location / {

    ...

}
```

matches **every URL** unless a more specific Location Block is found.

Example:

```text
/

/about

/contact

/login

/products

/blog/article
```

All are initially eligible for this block.

---

## Exact Match

Sometimes only one URL should match.

Example:

```nginx
location = / {

    ...

}
```

Matches:

```text
/
```

Does **not** match:

```text
/about

/login

/index.html
```

Exact matching is useful for handling a single endpoint efficiently.

---

## Longest Prefix Match

Suppose Nginx has:

```nginx
location / {

}

location /api/ {

}

location /api/v1/ {

}
```

Incoming request:

```text
/api/v1/users
```

Matching process:

```text
/

↓

/api/

↓

/api/v1/

↓

Selected
```

Nginx chooses the **longest matching prefix**.

---

## Regular Expression Matching

Nginx also supports regular expressions.

Case-sensitive:

```nginx
location ~ \.php$ {

}
```

Case-insensitive:

```nginx
location ~* \.(jpg|png|gif)$ {

}
```

Example matches:

```text
photo.jpg

banner.PNG

icon.gif
```

Regular expressions provide flexible matching but should be used carefully because they are generally more complex than simple prefix matches.

---

## Common Match Types

| Modifier | Meaning                                     |
| -------- | ------------------------------------------- |
| _(none)_ | Prefix match                                |
| `=`      | Exact match                                 |
| `~`      | Case-sensitive regular expression           |
| `~*`     | Case-insensitive regular expression         |
| `^~`     | Prefer this prefix over regular expressions |

---

## Example: Static Images

```nginx
location /images/ {

    root /var/www/html;

}
```

Workflow:

```text
Browser

↓

/images/logo.png

↓

Location Match

↓

Serve File
```

No backend application is required.

---

## Example: API Requests

```nginx
location /api/ {

    proxy_pass http://localhost:3000;

}
```

Workflow:

```text
Browser

↓

/api/users

↓

Nginx

↓

Node.js
```

Nginx forwards matching requests to the backend application.

---

## Example: Downloads

```nginx
location /downloads/ {

    root /var/www/files;

}
```

Request:

```text
/downloads/report.pdf
```

Nginx serves the file directly from the filesystem.

---

## Multiple Location Blocks

One Server Block can contain many Location Blocks.

```text
Server Block
│
├── /
├── /images/
├── /css/
├── /js/
├── /api/
├── /downloads/
└── /admin/
```

Each URL can be handled differently.

---

## Example Configuration

```nginx
server {

    listen 80;

    server_name example.com;

    location / {

        root /var/www/html;

    }

    location /images/ {

        root /var/www/html;

    }

    location /api/ {

        proxy_pass http://localhost:3000;

    }

}
```

This configuration:

- Serves website pages
- Serves images
- Proxies API requests

all from the same domain.

---

## Request Flow Example

Suppose the following request arrives:

```text
https://example.com/api/users
```

Workflow:

```text
Browser
     │
     ▼
Server Block
(example.com)
     │
     ▼
Location Matching
     │
     ▼
/api/
     │
     ▼
proxy_pass
     │
     ▼
Node.js
```

Now consider:

```text
https://example.com/images/logo.png
```

Workflow:

```text
Browser
     │
     ▼
Server Block
     │
     ▼
Location
/images/
     │
     ▼
Static File
```

No request reaches the Node.js application.

---

## Location Matching Priority

Simplified matching order:

```text
Incoming URL
      │
      ▼
Exact Match (=)
      │
      ▼
Longest Prefix
      │
      ▼
Regular Expressions
      │
      ▼
Selected Location
```

This priority ensures that the most appropriate Location Block handles the request.

---

## Typical Production Configuration

```text
Server Block
│
├── /
│      │
│      └── Website
│
├── /api/
│      │
│      └── Node.js
│
├── /images/
│      │
│      └── Static Files
│
├── /css/
│      │
│      └── Static Files
│
└── /downloads/
       │
       └── Documents
```

A single website often combines static assets, backend APIs, and downloadable content through different Location Blocks.

---

## Real-World Example

Suppose an e-commerce website uses the following URLs:

| URL           | Purpose          |
| ------------- | ---------------- |
| `/`           | Homepage         |
| `/products`   | Product catalog  |
| `/images/`    | Product images   |
| `/css/`       | Stylesheets      |
| `/js/`        | JavaScript files |
| `/api/`       | REST API         |
| `/downloads/` | Product manuals  |

The Server Block matches the domain:

```text
shop.example.com
```

The Location Blocks then determine how each URL is processed.

Static assets are served directly by Nginx, while requests beginning with `/api/` are forwarded to the Node.js application. This reduces the application's workload and improves response times.

---

## Best Practices

- Keep Location Blocks organized and easy to read.
- Use prefix matching whenever possible.
- Reserve regular expressions for cases where simple prefixes are insufficient.
- Serve static assets directly through Nginx.
- Route backend API requests using `proxy_pass`.
- Test configuration changes with `nginx -t`.
- Keep URL routing consistent across applications.

---

## Common Mistakes

#### Using Regular Expressions Unnecessarily

Simple prefix matches are usually easier to understand and maintain.

---

#### Creating Overlapping Rules

Multiple similar Location Blocks can make request routing confusing if their matching behavior is not clearly understood.

---

#### Serving Static Files Through the Backend

Images, CSS, JavaScript, and other static assets should generally be served directly by Nginx instead of passing through Node.js.

---

#### Forgetting to Reload Nginx

Configuration changes do not take effect until Nginx is reloaded.

---

#### Ignoring Match Priority

A broader Location Block such as `/` may be overridden by a more specific rule, so understanding the matching order is essential.

---

## Summary

Location Blocks define how Nginx handles individual URL paths after a request has been assigned to a Server Block. They enable administrators to route requests to backend applications, serve static content, deliver downloads, and apply different behaviors to different parts of a website. By understanding prefix matching, exact matching, regular expressions, and match priority, you can build flexible and efficient Nginx configurations for production environments.

---

### Next Chapter

➡️ **06 - Reverse Proxy**
