---
sidebar_label: Domain Name System (DNS)
sidebar_position: 4
---


# Domain Name System (DNS)

### Overview

Imagine trying to browse the Internet if every website had to be accessed using its IP address.

Instead of visiting:

```text id="n4k7xd"
https://google.com
```

you would need to remember something like:

```text id="b9m3qw"
142.250.193.46
```

This would be impractical.

The **Domain Name System (DNS)** solves this problem by translating **human-readable domain names** into **IP addresses** that computers can understand.

DNS is often called the **phonebook of the Internet** because it maps names to addresses.

Without DNS, browsing websites, sending emails, connecting APIs, and accessing cloud services would be extremely difficult.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what DNS is.
- Learn why DNS is necessary.
- Understand the DNS resolution process.
- Learn about DNS records.
- Understand authoritative name servers.
- Learn about DNS caching.
- Understand DNS in cloud deployments.

---

## Why Do We Need DNS?

Computers communicate using IP addresses.

Humans, however, prefer memorable names.

For example:

| Domain     | IP Address |
| ---------- | ---------- |
| google.com | 142.x.x.x  |
| github.com | 140.x.x.x  |
| openai.com | 104.x.x.x  |

DNS acts as the translator between these two worlds.

---

## What is DNS?

**DNS (Domain Name System)** is a distributed system that translates:

```text id="f2r8pk"
Domain Name

↓

IP Address
```

Example:

```text id="m7v5ja"
example.com

↓

93.184.216.34
```

Once the IP address is known, the browser can connect to the destination server.

---

## What is a Domain Name?

A **domain name** is the human-friendly name of a website.

Examples:

- google.com
- github.com
- microsoft.com
- example.org

A domain is easier to remember than an IP address.

---

## Domain Structure

A domain consists of multiple parts.

Example:

```text id="d5x9lh"
www.example.com
```

Breakdown:

```text id="a3q6tv"
www       example       com
│            │           │
Subdomain   Domain      Top-Level Domain
```

| Part      | Description            |
| --------- | ---------------------- |
| `www`     | Subdomain              |
| `example` | Second-Level Domain    |
| `.com`    | Top-Level Domain (TLD) |

---

## What Happens When You Open a Website?

Suppose you type:

```text id="k8n2wp"
https://example.com
```

The browser cannot communicate using the domain name alone.

It first needs the IP address.

The process looks like this:

```text id="r7m4bc"
Browser

↓

DNS Resolver

↓

DNS Server

↓

IP Address

↓

Web Server
```

Only after receiving the IP address does the browser establish a TCP connection.

---

## DNS Resolution Process

The complete DNS lookup involves several components.

```text id="p4j8ye"
User

↓

Browser Cache

↓

Operating System Cache

↓

Recursive DNS Resolver

↓

Root DNS Server

↓

TLD Server (.com)

↓

Authoritative Name Server

↓

IP Address Returned
```

Let's understand each step.

---

### Step 1 — Browser Cache

Modern browsers cache recently visited domains.

Example:

```text id="x6r1fn"
example.com

↓

93.184.216.34
```

If found, the browser immediately uses the cached IP address.

---

### Step 2 — Operating System Cache

If the browser cache misses, the operating system checks its own DNS cache.

Linux, Windows, and macOS all maintain DNS caches to improve performance.

---

### Step 3 — Recursive DNS Resolver

If no cache entry exists, the request is sent to a **recursive DNS resolver**.

Examples include:

- Google DNS (8.8.8.8)
- Cloudflare DNS (1.1.1.1)
- ISP DNS servers

The resolver performs the lookup on behalf of the client.

---

### Step 4 — Root Name Server

The root server knows where to find Top-Level Domain (TLD) servers.

Example:

```text id="t3w8rm"
example.com

↓

Ask Root Server

↓

".com" Name Server
```

The root server does not know the final IP address.

It only directs the resolver to the correct TLD server.

---

### Step 5 — TLD Server

The Top-Level Domain server handles domains ending in:

- .com
- .org
- .net
- .in
- .io

Example:

```text id="c5v2hq"
example.com

↓

TLD Server

↓

Authoritative Name Server
```

---

### Step 6 — Authoritative Name Server

The authoritative name server stores the actual DNS records for the domain.

Example:

```text id="h8y6nk"
example.com

↓

93.184.216.34
```

The resolver receives the IP address and returns it to the browser.

---

## DNS Resolution Summary

```text id="v9m4pd"
Browser
     │
Cache
     │
Recursive Resolver
     │
Root Server
     │
TLD Server
     │
Authoritative Server
     │
IP Address
     │
Browser Connects
```

This entire process usually completes in a few milliseconds.

---

## DNS Records

DNS stores different types of information using **records**.

---

### A Record

Maps a domain to an IPv4 address.

Example:

```text id="g7k3tw"
example.com

↓

93.184.216.34
```

---

### AAAA Record

Maps a domain to an IPv6 address.

---

### CNAME Record

Creates an alias for another domain.

Example:

```text id="n5r8qb"
www.example.com

↓

example.com
```

---

### MX Record

Specifies which mail server receives email.

Example:

```text id="u2m7lv"
example.com

↓

mail.example.com
```

---

### NS Record

Specifies the authoritative name servers.

Example:

```text id="f6j4rh"
example.com

↓

ns1.cloudflare.com
ns2.cloudflare.com
```

---

### TXT Record

Stores arbitrary text information.

Common uses include:

- SPF
- DKIM
- Domain Verification
- Google Search Console
- Microsoft 365 Verification

---

## DNS TTL (Time To Live)

Each DNS record includes a **TTL** value.

Example:

```text id="b1x9cp"
TTL = 300 seconds
```

This means DNS resolvers can cache the record for **5 minutes** before requesting it again.

A shorter TTL allows faster propagation of changes but increases DNS queries.

---

## DNS Caching

Caching improves performance.

Without caching:

```text id="r4w6mf"
Every Website Visit

↓

Full DNS Lookup
```

With caching:

```text id="k9q2va"
First Lookup

↓

Stored in Cache

↓

Future Requests Use Cache
```

This significantly reduces lookup time.

---

## DNS Propagation

When you update a DNS record, changes are not visible everywhere immediately.

Reasons include:

- Resolver caches
- ISP caches
- Browser caches
- TTL values

This delay is commonly referred to as **DNS propagation**.

Depending on the TTL and resolver behavior, changes may become visible within minutes or take several hours.

---

## DNS in Cloud Deployments

Suppose you deploy a Node.js application on Azure.

Your infrastructure might look like this:

```text id="y5v8pk"
example.com
      │
DNS
      │
Cloudflare
      │
Azure Public IP
      │
Nginx
      │
Node.js Application
```

Typical DNS configuration:

| Record | Value                   |
| ------ | ----------------------- |
| A      | Azure Public IP         |
| CNAME  | www → example.com       |
| NS     | Cloudflare Name Servers |
| TXT    | Domain Verification     |

When users visit the domain, DNS directs them to your Azure server.

---

## Checking DNS from Linux

Resolve a domain:

```bash id="m3q7dh"
nslookup example.com
```

Example output:

```text id="e8v2ra"
Name: example.com

Address: 93.184.216.34
```

---

Using `dig`:

```bash id="q6m1ty"
dig example.com
```

Retrieve only the IP address:

```bash id="x4j9fc"
dig +short example.com
```

Display name servers:

```bash id="h7n5vp"
dig NS example.com
```

---

## Real-World Example

Consider your production deployment using Cloudflare and Azure.

```text id="w2k8lz"
Browser
      │
DNS Lookup
      │
Cloudflare Name Servers
      │
Azure Public IP
      │
Nginx
      │
Node.js
```

When you changed your domain's nameservers to Cloudflare, the registrar delegated DNS authority to Cloudflare. Cloudflare then became responsible for answering DNS queries for your domain, allowing it to provide services such as proxying, CDN, SSL termination, and DNS management before forwarding traffic to your Azure Virtual Machine.

---

## Best Practices

- Use a reliable DNS provider with global infrastructure.
- Configure appropriate TTL values for your environment.
- Keep authoritative name servers consistent.
- Verify DNS records after making changes.
- Use `dig` or `nslookup` when troubleshooting DNS issues.

---

## Common Mistakes

#### Confusing Domains with IP Addresses

A domain name is a human-readable identifier.

An IP address is the numeric network address that computers use.

---

#### Assuming DNS Changes Are Instant

DNS changes take time to propagate because of caching and TTL values.

---

#### Forgetting to Update Name Servers

If you move DNS management to another provider, update the domain's NS records at the registrar. Otherwise, DNS queries will continue to be answered by the previous provider.

---

#### Misconfiguring DNS Records

Incorrect A, CNAME, MX, or NS records can make websites, email, or APIs inaccessible.

Always verify records after making changes.

---

## Summary

The Domain Name System (DNS) is the Internet's distributed naming service. It translates human-friendly domain names into IP addresses, allowing browsers and applications to locate servers across the world. Through components such as recursive resolvers, root servers, TLD servers, and authoritative name servers, DNS performs fast and reliable name resolution for billions of requests every day.

A strong understanding of DNS is essential for managing domains, configuring cloud infrastructure, deploying applications, troubleshooting connectivity issues, and working with services such as Cloudflare, Azure, AWS, and Nginx.

---

### Next Chapter

➡️ **05 - HTTP and HTTPS**
