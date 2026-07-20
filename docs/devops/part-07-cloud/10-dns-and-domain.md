---
sidebar_label: DNS and Domain
sidebar_position: 10
---


# DNS and Domain

### Overview

In the previous chapter, we learned about **Public IP Addresses** and **Private IP Addresses**.

Suppose you deploy a website on Azure and it receives the following Public IP:

```text id="dns01"
20.204.115.45
```

Now imagine asking every user to remember that IP address.

This would be difficult.

Instead, users type:

```text id="dns02"
www.example.com
```

or

```text id="dns03"
example.com
```

The system that converts human-readable domain names into IP addresses is called the **Domain Name System (DNS)**.

Without DNS, browsing the Internet would be extremely inconvenient.

Every website you visit—from search engines to online stores—relies on DNS.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a domain name is.
- Learn how DNS works.
- Understand the DNS resolution process.
- Learn common DNS records.
- Understand domain registration.
- Connect a domain to an Azure-hosted application.
- Follow DNS best practices.

---

## What is a Domain?

A **Domain Name** is a human-readable name that identifies a website or service on the Internet.

Examples:

```text id="dns04"
google.com

github.com

microsoft.com

example.com
```

A domain replaces the need to remember numerical IP addresses.

---

## Why Do We Need DNS?

Computers communicate using IP addresses.

People prefer readable names.

Without DNS:

```text id="dns05"
User

↓

20.204.115.45
```

With DNS:

```text id="dns06"
User

↓

example.com

↓

20.204.115.45
```

DNS bridges the gap between human-friendly names and machine-readable addresses.

---

## What is DNS?

**DNS (Domain Name System)** is a distributed system that translates domain names into IP addresses.

Think of DNS as the Internet's phone book.

```text id="dns07"
Name

↓

Phone Book

↓

Phone Number
```

Cloud equivalent:

```text id="dns08"
Domain Name

↓

DNS

↓

IP Address
```

Applications use the returned IP address to establish network connections.

---

## How DNS Resolution Works

Suppose a user enters:

```text id="dns09"
www.example.com
```

A simplified DNS resolution process is:

```text id="dns10"
Browser
   │
   ▼
DNS Resolver
   │
   ▼
DNS Server
   │
   ▼
IP Address
   │
   ▼
Web Server
```

The browser then connects to the server using the resolved IP address.

---

## DNS Resolution Step-by-Step

A more detailed flow is:

```text id="dns11"
User

↓

Browser

↓

DNS Resolver

↓

Authoritative DNS Server

↓

Public IP Address

↓

Azure Server
```

This entire process usually completes within milliseconds.

---

## Domain Registration

A domain must be registered before it can be used.

Typical process:

```text id="dns12"
Choose Domain

↓

Check Availability

↓

Purchase Domain

↓

Configure DNS

↓

Website Goes Live
```

Once registered, you become responsible for managing its DNS settings.

---

## Domain Structure

A domain consists of multiple parts.

Example:

```text id="dns13"
www.example.com
```

Breakdown:

| Part    | Description            |
| ------- | ---------------------- |
| www     | Subdomain              |
| example | Second-Level Domain    |
| .com    | Top-Level Domain (TLD) |

Another example:

```text id="dns14"
api.example.com
```

Here:

- `api` is the subdomain.
- `example.com` is the primary domain.

---

## Common DNS Records

DNS uses different record types for different purposes.

| Record | Purpose                               |
| ------ | ------------------------------------- |
| A      | Maps a domain to an IPv4 address      |
| AAAA   | Maps a domain to an IPv6 address      |
| CNAME  | Points one domain name to another     |
| MX     | Mail server configuration             |
| TXT    | Verification and security information |
| NS     | Nameserver information                |

Each record serves a specific role in DNS management.

---

## A Record

An **A Record** maps a domain directly to an IPv4 address.

Example:

```text id="dns15"
example.com

↓

20.204.115.45
```

When users visit the domain, DNS returns that IP address.

---

## CNAME Record

A **CNAME (Canonical Name)** points one hostname to another.

Example:

```text id="dns16"
www.example.com

↓

example.com
```

Instead of storing another IP address, the DNS lookup continues using the target hostname.

---

## MX Record

MX records specify which mail servers receive email for a domain.

Example:

```text id="dns17"
example.com

↓

Mail Server
```

These records are essential for email services.

---

## TXT Record

TXT records store text information associated with a domain.

Common uses include:

- Domain ownership verification
- Email authentication
- Security policies
- Third-party service validation

Example:

```text id="dns18"
TXT

↓

Verification Code
```

---

## NS Record

NS records specify the authoritative nameservers for a domain.

Example:

```text id="dns19"
example.com

↓

Nameserver 1

↓

Nameserver 2
```

These nameservers answer DNS queries for the domain.

---

## DNS TTL (Time To Live)

Every DNS record has a **Time To Live (TTL)** value.

TTL tells DNS resolvers how long they may cache a record.

Example:

```text id="dns20"
DNS Record

↓

TTL

↓

Cache
```

Lower TTL values allow faster updates but may increase DNS query traffic.

Higher TTL values reduce DNS lookups but make changes propagate more slowly.

---

## Connecting a Domain to Azure

Suppose your Azure Virtual Machine has the Public IP:

```text id="dns21"
20.204.115.45
```

You create an A Record:

```text id="dns22"
example.com

↓

20.204.115.45
```

Users can now access the website using the domain name instead of the IP address.

---

## DNS in a Typical Deployment

```text id="dns23"
Browser
   │
   ▼
example.com
   │
   ▼
DNS
   │
   ▼
Public IP
   │
   ▼
Azure Virtual Machine
```

DNS acts as the bridge between the domain name and the server.

---

## Subdomains

Organizations often use subdomains for different services.

Examples:

```text id="dns24"
www.example.com

api.example.com

admin.example.com

cdn.example.com
```

Each subdomain can point to a different service or server.

---

## Typical Production Architecture

```text id="dns25"
Users
   │
   ▼
example.com
   │
   ▼
DNS
   │
   ▼
Cloudflare
   │
   ▼
Azure Public IP
   │
   ▼
Nginx
   │
   ▼
Node.js
```

The user interacts only with the domain name while DNS and networking direct the request to the correct server.

---

## Real-World Example

Suppose a company deploys an Express.js application on an Azure Virtual Machine.

The server receives a Static Public IP.

The company registers:

```text id="dns26"
shop.company.com
```

They create an A Record pointing the domain to the Azure Public IP.

When customers enter the domain into their browser:

1. DNS resolves the domain name.
2. The browser receives the server's Public IP.
3. The browser connects to the Azure Virtual Machine.
4. Nginx forwards the request to the Node.js application.
5. The application returns the requested webpage.

The customer never needs to know the server's IP address.

---

## Best Practices

- Use meaningful domain names that represent your brand or application.
- Prefer Static Public IP addresses for production websites.
- Configure appropriate TTL values based on how frequently records change.
- Keep DNS records organized and remove unused entries.
- Use subdomains to separate different services.
- Protect domain registrar accounts with multi-factor authentication.
- Regularly review DNS records for accuracy.

---

## Common Mistakes

#### Using Dynamic Public IPs with Production Domains

If the Public IP changes, DNS records may point to the wrong server.

---

#### Deleting Important DNS Records

Removing records such as A, MX, or NS can make websites or email services unavailable.

---

#### Setting Extremely High TTL Values During Migration

High TTL values can delay the propagation of DNS changes.

---

#### Creating Duplicate or Unused Records

Unused records make DNS zones more difficult to manage and may create confusion.

---

#### Confusing Domain Registration with DNS Hosting

Registering a domain gives you ownership of the name, while DNS hosting is the service that stores and answers DNS records for that domain.

---

## Summary

The Domain Name System (DNS) translates human-readable domain names into IP addresses, allowing users to access Internet services without memorizing numerical addresses. Domains are registered through registrars, while DNS records such as A, CNAME, MX, TXT, and NS determine how traffic and services are routed. By pointing a domain to an Azure-hosted application using the appropriate DNS records, organizations make their services accessible, reliable, and easy for users to reach.

---

### Next Chapter

➡️ **11 - Cloudflare**
