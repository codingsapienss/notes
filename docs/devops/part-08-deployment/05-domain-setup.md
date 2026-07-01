---
sidebar_label: Domain Setup
sidebar_position: 5
---


# Domain Setup

## Overview

In the previous chapter, we configured Nginx as a reverse proxy for our Node.js application.

At this point, our application is accessible using the server's Public IP.

Example:

```text id="dom01"
http://20.204.115.45
```

Although this works, users rarely visit websites using IP addresses.

Instead, they use domain names such as:

```text id="dom02"
https://example.com

https://www.example.com
```

To make this possible, the domain must be connected to the server by configuring DNS records.

In this chapter, we will connect a domain to an Azure Virtual Machine and prepare it for HTTPS.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand the domain setup process.
- Connect a domain to an Azure Virtual Machine.
- Configure DNS records.
- Understand A and CNAME records.
- Verify DNS propagation.
- Configure Nginx for the domain.
- Prepare the website for SSL/TLS.

---

# Deployment Before Domain Setup

Current architecture:

```text id="dom03"
Users

↓

Public IP

↓

Azure VM

↓

Nginx

↓

Node.js
```

Users access the application using the server's IP address.

---

# Deployment After Domain Setup

Once the domain is configured:

```text id="dom04"
Users

↓

example.com

↓

DNS

↓

Azure VM

↓

Nginx

↓

Node.js
```

The domain replaces the Public IP as the user-facing address.

---

# Prerequisites

Before configuring a domain, ensure the following are ready.

| Requirement         | Description                             |
| ------------------- | --------------------------------------- |
| Public IP           | Static Public IP assigned to the server |
| Domain Name         | Registered domain                       |
| Nginx               | Installed and configured                |
| Node.js Application | Running correctly                       |
| Firewall            | Ports 80 and 443 allowed                |

Without these components, the domain setup may not function correctly.

---

# Registering a Domain

The first step is purchasing or registering a domain.

Example:

```text id="dom05"
example.com
```

Typical registration process:

```text id="dom06"
Choose Domain

↓

Check Availability

↓

Purchase

↓

Manage DNS
```

Once registered, you can configure its DNS records.

---

# Understanding DNS Records

DNS records determine where traffic should be routed.

Common records used during deployment:

| Record | Purpose                           |
| ------ | --------------------------------- |
| A      | Maps a domain to an IPv4 address  |
| AAAA   | Maps a domain to an IPv6 address  |
| CNAME  | Points one hostname to another    |
| TXT    | Verification and security records |
| MX     | Email routing                     |

For a basic website deployment, the **A Record** is the most important.

---

# Configuring an A Record

Suppose the Azure Virtual Machine has the Public IP:

```text id="dom07"
20.204.115.45
```

Create the following DNS record:

| Type | Host | Value         |
| ---- | ---- | ------------- |
| A    | @    | 20.204.115.45 |

Result:

```text id="dom08"
example.com

↓

20.204.115.45
```

When users visit the domain, DNS resolves it to the server's Public IP.

---

# Configuring the WWW Subdomain

Many websites also support:

```text id="dom09"
www.example.com
```

A common configuration is:

| Type  | Host | Value       |
| ----- | ---- | ----------- |
| CNAME | www  | example.com |

Architecture:

```text id="dom10"
www.example.com

↓

example.com

↓

20.204.115.45
```

Both addresses now reach the same website.

---

# DNS Flow

When a user opens:

```text id="dom11"
https://example.com
```

The request follows this path:

```text id="dom12"
Browser

↓

DNS Resolver

↓

DNS Server

↓

Public IP

↓

Azure VM
```

DNS converts the domain into an IP address before the browser connects to the server.

---

# DNS Propagation

DNS changes are not visible immediately across the Internet.

Example:

```text id="dom13"
Update DNS

↓

Internet

↓

Propagation

↓

Users
```

Depending on caching and TTL values, propagation may take anywhere from a few minutes to several hours, and in some cases up to 48 hours.

---

# Verifying DNS

One way to verify DNS resolution is with the `nslookup` command.

Example:

```bash id="domcmd01"
nslookup example.com
```

Expected result:

```text id="dom14"
example.com

↓

20.204.115.45
```

Another useful command:

```bash id="domcmd02"
dig example.com
```

These tools help confirm that DNS is pointing to the correct server.

---

# Configuring Nginx for the Domain

Update the Server Block.

Example:

```nginx id="domcfg01"
server {
    listen 80;

    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

The `server_name` directive tells Nginx which domain names this configuration should handle.

---

# Testing the Configuration

Validate the Nginx configuration.

```bash id="domcmd03"
sudo nginx -t
```

Reload Nginx.

```bash id="domcmd04"
sudo systemctl reload nginx
```

Now open:

```text id="dom15"
http://example.com
```

If DNS propagation has completed, the application should load successfully.

---

# Preparing for HTTPS

At this stage, traffic is still using HTTP.

Current architecture:

```text id="dom16"
Browser

↓

HTTP

↓

Nginx

↓

Node.js
```

The next step is enabling HTTPS.

Future architecture:

```text id="dom17"
Browser

↓

HTTPS

↓

Nginx

↓

Node.js
```

This will be covered in the next chapter.

---

# Domain Setup Workflow

```text id="dom18"
Purchase Domain

↓

Configure A Record

↓

Configure CNAME

↓

Wait for DNS Propagation

↓

Update Nginx

↓

Test Website

↓

Ready for HTTPS
```

---

# Typical Production Architecture

```text id="dom19"
Users
   │
   ▼
example.com
   │
   ▼
DNS
   │
   ▼
Azure Public IP
   │
   ▼
Ubuntu Server
   │
   ▼
Nginx
   │
   ▼
Node.js
```

The domain becomes the public entry point for the application.

---

# Deployment Verification Checklist

| Check                      | Expected Result |
| -------------------------- | --------------- |
| Domain Registered          | ✓               |
| A Record Configured        | ✓               |
| WWW Record Configured      | ✓               |
| DNS Resolves Correctly     | ✓               |
| Nginx Server Block Updated | ✓               |
| Website Opens by Domain    | ✓               |

---

# Real-World Example

Suppose a company deploys an Express.js application on an Azure Virtual Machine with the Public IP:

```text id="dom20"
20.204.115.45
```

The deployment engineer:

1. Registers `company.com`.
2. Creates an A Record pointing to `20.204.115.45`.
3. Creates a CNAME record for `www.company.com`.
4. Updates the Nginx `server_name` directive.
5. Tests the configuration using `nginx -t`.
6. Reloads Nginx.
7. Waits for DNS propagation.

After propagation completes, users can access the application using the domain name instead of the server's Public IP.

---

# Best Practices

- Use a Static Public IP for production servers.
- Configure both the root domain and the `www` subdomain if required.
- Verify DNS records after making changes.
- Test the Nginx configuration before reloading.
- Keep DNS records organized and remove unused entries.
- Use meaningful TTL values based on expected update frequency.
- Plan to enable HTTPS immediately after the domain is working.

---

# Common Mistakes

### Using a Dynamic Public IP

If the server's IP address changes, the DNS records become invalid and users can no longer reach the website.

---

### Incorrect DNS Records

A typo in an A Record or CNAME record can prevent the domain from resolving correctly.

---

### Forgetting to Update `server_name`

If the Nginx Server Block does not include the domain, requests may be handled by the wrong configuration.

---

### Testing Before DNS Propagation Completes

DNS updates require time to propagate across the Internet. Immediate testing may produce inconsistent results.

---

### Confusing DNS Issues with Application Issues

If the application works using the server's Public IP but not the domain, the issue is often related to DNS configuration rather than the application itself.

---

# Summary

Connecting a domain to a production server involves registering a domain, configuring DNS records, pointing them to the server's Static Public IP, updating the Nginx Server Block, and verifying DNS propagation. Once these steps are complete, users can access the application using a human-readable domain name. This also prepares the deployment for the next stage: enabling secure HTTPS communication.

---

## Next Chapter

➡️ **06 - SSL Setup**
