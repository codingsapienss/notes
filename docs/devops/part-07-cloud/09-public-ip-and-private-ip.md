---
sidebar_label: Public IP and Private IP
sidebar_position: 9
---


# Public IP and Private IP

## Overview

In the previous chapters, we learned about:

- Virtual Networks (VNets)
- Subnets
- Network Interfaces (NICs)
- Network Security Groups (NSGs)

We now know how Azure resources communicate inside a Virtual Network.

However, an important question remains:

**How do users on the Internet reach our application?**

For example, suppose you deploy a website on an Azure Virtual Machine.

How does a user's browser know where to send the request?

The answer lies in **IP addresses**.

Azure primarily uses two kinds of IP addresses:

- **Private IP Addresses** – used for communication inside a Virtual Network.
- **Public IP Addresses** – used for communication over the Internet.

Understanding the difference between these two types of addresses is fundamental to designing secure cloud architectures.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand IP addressing in Azure.
- Learn the difference between Public and Private IPs.
- Understand when each type should be used.
- Learn how Public IPs are assigned.
- Understand secure network architecture.
- Follow production best practices.

---

# What is an IP Address?

An **IP (Internet Protocol) Address** is a unique network identifier assigned to a device.

Just as every house has a postal address, every device on a network requires an IP address so data knows where to go.

Example:

```text id="ip01"
Internet

↓

IP Address

↓

Server
```

Without an IP address, devices cannot communicate over a network.

---

# Public IP Address

A **Public IP Address** is reachable from the Internet.

Anyone on the Internet can send requests to a Public IP, provided security rules allow it.

Example:

```text id="ip02"
Internet

↓

20.50.xxx.xxx

↓

Azure VM
```

Typical uses include:

- Websites
- APIs
- Public applications
- SSH (when required)
- Load Balancers

---

# Private IP Address

A **Private IP Address** is used only inside a private network such as an Azure Virtual Network.

Example:

```text id="ip03"
10.0.1.4
```

Resources with private IP addresses cannot be reached directly from the Internet.

Example:

```text id="ip04"
Web Server

↓

10.0.1.4

↓

Database

10.0.2.5
```

Communication occurs entirely within the Virtual Network.

---

# Public vs Private IP

| Feature                  | Public IP         | Private IP             |
| ------------------------ | ----------------- | ---------------------- |
| Accessible from Internet | Yes               | No                     |
| Used inside VNet         | Yes (if attached) | Yes                    |
| Typical Use              | Websites, APIs    | Internal communication |
| Security Exposure        | Higher            | Lower                  |
| Routable on Internet     | Yes               | No                     |

Each serves a different purpose in cloud networking.

---

# How Azure Assigns IP Addresses

Every Network Interface receives a private IP address when connected to a Virtual Network.

```text id="ip05"
Virtual Machine

↓

Network Interface

↓

Private IP
```

A Public IP is optional.

```text id="ip06"
Virtual Machine

↓

Network Interface

↓

Public IP (Optional)
```

Not every Virtual Machine requires one.

---

# Static vs Dynamic Public IP

Azure supports two allocation methods.

| Allocation | Description                                                               |
| ---------- | ------------------------------------------------------------------------- |
| Static     | Remains the same unless changed or deleted                                |
| Dynamic    | Assigned automatically and may change depending on the resource lifecycle |

For production applications, Static Public IP addresses are generally preferred because DNS records can consistently point to the same address.

---

# Static vs Dynamic Private IP

Private IP addresses can also be configured.

| Allocation | Description                                              |
| ---------- | -------------------------------------------------------- |
| Dynamic    | Azure assigns an available private IP automatically      |
| Static     | Administrator specifies the private IP within the subnet |

Dynamic allocation is common, while static private IPs are useful when a resource must always use the same internal address.

---

# Communication Flow

Suppose a user opens a website.

```text id="ip07"
Browser
   │
   ▼
Public IP
   │
   ▼
Network Interface
   │
   ▼
Virtual Machine
```

The browser never sees the server's private IP.

---

# Internal Communication

Resources inside a Virtual Network communicate using private IP addresses.

```text id="ip08"
Web Server

10.0.1.4

↓

Private Network

↓

Database

10.0.2.5
```

This communication does not pass through the public Internet.

---

# Why Not Give Every VM a Public IP?

Consider this architecture:

```text id="ip09"
Internet
 │
 ├── Web Server
 ├── API Server
 ├── Database
 └── Redis
```

Every service is exposed publicly.

This significantly increases the attack surface.

A better design is:

```text id="ip10"
Internet
     │
     ▼
Web Server
     │
Private Network
     │
 ├── API Server
 ├── Database
 └── Redis
```

Only the web server is reachable from the Internet.

---

# Public IP with Network Security Group

A Public IP alone does not determine accessibility.

Traffic must also pass through the Network Security Group.

```text id="ip11"
Internet
      │
      ▼
Public IP
      │
      ▼
NSG
      │
      ▼
Virtual Machine
```

If the NSG blocks a port, the Public IP cannot be used to access that service.

---

# Private Communication Architecture

Example:

```text id="ip12"
Virtual Network
      │
 ┌────┼──────────┐
 ▼    ▼          ▼
Web   API    Database
VM    VM        VM
```

Each resource communicates over private IP addresses, improving security and reducing exposure.

---

# Typical Production Architecture

```text id="ip13"
Users
   │
   ▼
Cloudflare
   │
   ▼
Public IP
   │
   ▼
Web Server
   │
Private IP
   │
   ▼
API Server
   │
Private IP
   │
   ▼
Database
```

This layered architecture is widely used in production cloud deployments.

---

# Public IP and Domain Names

Users rarely access applications by entering IP addresses directly.

Instead, a domain name points to the Public IP.

Example:

```text id="ip14"
example.com

↓

DNS

↓

Public IP

↓

Azure VM
```

In later chapters, you will learn how DNS and Cloudflare simplify this process.

---

# Azure Resources That Use Public IPs

Common resources that may use Public IP addresses include:

- Virtual Machines
- Load Balancers
- Application Gateways
- Azure Firewall
- NAT Gateway

Many backend resources operate entirely with private IP addresses.

---

# Azure Resources That Typically Use Only Private IPs

Examples include:

- Databases
- Internal APIs
- Redis Cache
- Internal application servers
- Monitoring servers
- Backend services

Keeping these resources private reduces the attack surface.

---

# Typical Deployment Example

Suppose you deploy a Node.js application.

Architecture:

```text id="ip15"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Public IP
      │
      ▼
Ubuntu VM
      │
      ▼
Nginx
      │
      ▼
Node.js
      │
      ▼
MongoDB Atlas
```

Users access the application through the Public IP (or domain), while application components communicate securely using private networking where applicable.

---

# Real-World Example

A company hosts an e-commerce website.

Infrastructure:

- Web Server
- API Server
- Database Server

Configuration:

- Web Server → Public IP
- API Server → Private IP only
- Database → Private IP only

Customers can browse the website, but attackers cannot directly connect to the API server or database because those systems are not exposed to the Internet.

This architecture improves security without affecting application functionality.

---

# Best Practices

- Assign Public IPs only to resources that require direct Internet access.
- Use Private IPs for internal communication.
- Protect Public IPs with Network Security Groups.
- Prefer Static Public IPs for production services.
- Place databases and backend services on private networks.
- Use domain names instead of sharing raw IP addresses with users.
- Regularly review which resources have Public IP addresses assigned.

---

# Common Mistakes

### Assigning Public IPs to Every Resource

Most backend services should remain private.

---

### Confusing Public and Private IP Addresses

A Public IP is Internet-routable, while a Private IP is intended for communication within private networks.

---

### Forgetting Network Security Groups

Even with a Public IP, access should be restricted through properly configured NSG rules.

---

### Exposing Databases Directly

Production databases should typically use private networking rather than public endpoints.

---

### Using Dynamic Public IPs for Production DNS

If a Public IP changes unexpectedly, DNS records may no longer point to the correct resource. Static Public IPs help avoid this issue.

---

# Summary

Public and Private IP addresses serve different roles in Azure networking. Public IPs allow Internet users to reach cloud resources such as web servers, while Private IPs enable secure communication within a Virtual Network. By exposing only the necessary services through Public IPs and keeping backend systems on Private IPs, organizations can build cloud environments that are both secure and scalable. Combined with Network Security Groups and proper network design, this approach forms the basis of modern production infrastructure.

---

## Next Chapter

➡️ **10 - DNS and Domain**
