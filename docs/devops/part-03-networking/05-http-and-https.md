---
sidebar_label: HTTP and HTTPS
sidebar_position: 5
---


# HTTP and HTTPS

## Overview

After learning about TCP/IP, ports, and DNS, the next step is understanding **how web browsers communicate with web servers**.

When you visit a website, your browser doesn't simply "open" a webpage. It sends an **HTTP request** to a web server. The server processes the request and returns an **HTTP response** containing the requested data.

HTTP is the foundation of the World Wide Web.

However, HTTP alone is not secure. Anyone intercepting the traffic can potentially read or modify the transmitted data. To solve this problem, **HTTPS** combines HTTP with **TLS (Transport Layer Security)** to provide encryption, authentication, and data integrity.

Understanding HTTP and HTTPS is essential for web development, APIs, cloud deployments, reverse proxies, and production server administration.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what HTTP and HTTPS are.
- Learn how the request-response model works.
- Understand HTTP methods.
- Learn common HTTP status codes.
- Understand headers.
- Learn about cookies and sessions.
- Understand why HTTPS is necessary.
- Follow the complete lifecycle of a web request.

---

# What is HTTP?

**HTTP** stands for:

> **HyperText Transfer Protocol**

HTTP is an **application-layer protocol** used for communication between clients and servers.

Example:

```text id="t8m3vx"
Browser

↓

HTTP Request

↓

Web Server

↓

HTTP Response

↓

Browser
```

Although HTTP is commonly used for websites, it is also used for:

- REST APIs
- Mobile applications
- Web services
- Microservices
- IoT devices

---

# Why Do We Need HTTP?

Suppose you enter:

```text id="p5r8kn"
https://example.com
```

The browser must communicate with the web server.

It needs a standard way to ask questions such as:

- Which webpage is requested?
- Which file should be returned?
- Is the user authenticated?
- What data is being submitted?

HTTP defines the rules for this communication.

---

# The Client-Server Model

HTTP follows a **request-response model**.

```text id="m7x2cp"
Client
(Browser)

      │ Request

      ▼

Server

      │ Response

      ▼

Client
```

The client always initiates the communication.

The server waits for incoming requests and sends responses.

---

# The Lifecycle of an HTTP Request

Consider visiting:

```text id="v4q9fd"
https://example.com
```

The communication flow is:

```text id="c2w7rk"
Browser

↓

DNS Lookup

↓

TCP Connection

↓

HTTPS Handshake

↓

HTTP Request

↓

Server Processing

↓

HTTP Response

↓

Browser Renders Page
```

Each step builds upon concepts learned in previous chapters.

---

# HTTP Request Structure

An HTTP request contains several components.

```text id="g5n1lb"
Request Line

Headers

Blank Line

Body (Optional)
```

Example:

```http id="f9k4pd"
GET /products HTTP/1.1
Host: example.com
User-Agent: Chrome

```

---

# HTTP Response Structure

The server responds with:

```text id="h8v6ma"
Status Line

Headers

Blank Line

Body
```

Example:

```http id="r6m2zc"
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

---

# HTTP Methods

HTTP methods define the action the client wants the server to perform.

| Method  | Purpose                      |
| ------- | ---------------------------- |
| GET     | Retrieve data                |
| POST    | Create new data              |
| PUT     | Replace existing data        |
| PATCH   | Update part of existing data |
| DELETE  | Remove data                  |
| HEAD    | Retrieve headers only        |
| OPTIONS | Discover supported methods   |

---

## GET

Retrieves information.

Example:

```http id="w1p8ky"
GET /users
```

Used for:

- Loading webpages
- Fetching API data
- Downloading files

GET requests should not modify server data.

---

## POST

Creates new resources.

Example:

```http id="k3q7tb"
POST /users
```

Typical use cases:

- Registration
- Login
- File uploads
- Form submissions

---

## PUT

Replaces an existing resource.

Example:

```http id="z6r4hn"
PUT /users/15
```

---

## PATCH

Updates part of a resource.

Example:

```http id="u2v9jd"
PATCH /users/15
```

---

## DELETE

Removes a resource.

Example:

```http id="b7x5lm"
DELETE /users/15
```

---

# HTTP Headers

Headers provide additional information about requests and responses.

Example request headers:

```http id="n8c2wr"
Host: example.com
User-Agent: Chrome
Authorization: Bearer Token
Content-Type: application/json
Accept: application/json
```

Example response headers:

```http id="q4m8yf"
Content-Type: application/json
Content-Length: 512
Cache-Control: no-cache
Set-Cookie: session=abc123
```

Headers allow clients and servers to exchange metadata without changing the message body.

---

# HTTP Status Codes

Every HTTP response includes a **status code** indicating the result.

---

## 1xx — Informational

Example:

```text id="j5w1ra"
100 Continue
```

---

## 2xx — Success

| Code | Meaning    |
| ---- | ---------- |
| 200  | OK         |
| 201  | Created    |
| 204  | No Content |

---

## 3xx — Redirection

| Code | Meaning            |
| ---- | ------------------ |
| 301  | Permanent Redirect |
| 302  | Temporary Redirect |
| 304  | Not Modified       |

---

## 4xx — Client Errors

| Code | Meaning            |
| ---- | ------------------ |
| 400  | Bad Request        |
| 401  | Unauthorized       |
| 403  | Forbidden          |
| 404  | Not Found          |
| 405  | Method Not Allowed |
| 429  | Too Many Requests  |

---

## 5xx — Server Errors

| Code | Meaning               |
| ---- | --------------------- |
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |
| 504  | Gateway Timeout       |

---

# Cookies

HTTP is **stateless**.

This means every request is independent.

To remember users between requests, servers use **cookies**.

Example:

```text id="d1k6vt"
Browser

↓

Cookie

↓

Server
```

Example response:

```http id="x8m4ph"
Set-Cookie:
session=abc123
```

The browser automatically sends the cookie with future requests.

---

# Sessions

A **session** stores user-specific information on the server.

Typical flow:

```text id="y7n3rc"
Login

↓

Server Creates Session

↓

Session ID Sent in Cookie

↓

Future Requests Include Cookie

↓

Server Identifies User
```

This enables features such as:

- Logged-in users
- Shopping carts
- Personalized dashboards

---

# What is HTTPS?

HTTPS stands for:

> **HyperText Transfer Protocol Secure**

It is simply:

```text id="f3v8ja"
HTTPS

=

HTTP

+

TLS Encryption
```

HTTPS encrypts all communication between the client and server.

---

# Why HTTPS is Necessary

Without HTTPS:

```text id="p6x1qm"
Browser

↓

Plain Text

↓

Internet

↓

Anyone Can Read Data
```

Sensitive information such as passwords, tokens, and payment details can be intercepted.

With HTTPS:

```text id="n2w9lb"
Browser

↓

Encrypted Data

↓

Internet

↓

Server
```

Only the intended server can decrypt the data.

---

# Benefits of HTTPS

HTTPS provides:

- Encryption
- Authentication
- Data Integrity

This protects against:

- Password theft
- Session hijacking
- Data tampering
- Man-in-the-middle attacks

TLS makes HTTPS suitable for production environments.

---

# HTTP vs HTTPS

| HTTP                                | HTTPS                                   |
| ----------------------------------- | --------------------------------------- |
| Port 80                             | Port 443                                |
| No encryption                       | Encrypted                               |
| Less secure                         | Highly secure                           |
| Vulnerable to interception          | Protected using TLS                     |
| Suitable only for limited scenarios | Recommended for all public applications |

---

# HTTP Keep-Alive

Without Keep-Alive:

```text id="r9m4zk"
Request

↓

Open TCP Connection

↓

Close Connection
```

Repeated for every request.

With Keep-Alive:

```text id="w5j7xp"
Open Connection

↓

Multiple HTTP Requests

↓

Close Connection
```

This improves performance by reducing connection overhead.

---

# Real-World Example

Consider your production deployment on Azure.

```text id="a4q8ny"
Browser
      │
HTTPS
      │
Cloudflare
      │
Nginx
      │
Reverse Proxy
      │
Node.js Application
```

The sequence is:

1. The browser resolves the domain using DNS.
2. A TCP connection is established.
3. A TLS handshake creates a secure connection.
4. The browser sends an HTTPS request.
5. Nginx receives the request.
6. Nginx forwards it to the Node.js application.
7. The application processes the request.
8. The response travels back through Nginx and Cloudflare to the browser.

This architecture is commonly used in production systems.

---

# Best Practices

- Always use HTTPS for public-facing applications.
- Return appropriate HTTP status codes.
- Use the correct HTTP method for each operation.
- Send meaningful response headers.
- Store only minimal information in cookies.
- Use secure and HttpOnly cookie attributes where appropriate.

---

# Common Mistakes

### Assuming HTTP Is Secure

HTTP transmits data in plain text.

Sensitive information should never be sent over HTTP in production.

---

### Misusing HTTP Methods

For example:

- Using GET to delete data.
- Using POST for simple retrieval operations.

Choose methods based on their intended semantics.

---

### Ignoring Status Codes

Returning `200 OK` for every response makes debugging and client-side error handling difficult.

Use appropriate status codes to accurately reflect the outcome of each request.

---

### Storing Sensitive Data in Cookies

Cookies should not contain passwords or confidential information.

Instead, store a session identifier or secure token, and keep sensitive data on the server.

---

# Summary

HTTP is the standard protocol that enables communication between clients and servers using a request-response model. It defines methods, headers, status codes, and message formats that power websites and APIs across the Internet. HTTPS extends HTTP by adding TLS encryption, ensuring confidentiality, authentication, and data integrity during transmission.

A solid understanding of HTTP and HTTPS is essential for web development, API design, reverse proxies, cloud deployments, and production Linux server administration.

---

## Next Chapter

➡️ **06 - SSL and TLS**
