---
sidebar_label: Network Security Groups
sidebar_position: 8
---


# Network Security Groups

### Overview

In the previous chapter, we learned how Azure resources communicate through:

- Virtual Networks (VNets)
- Subnets
- Network Interfaces (NICs)
- Private IP Addresses
- Public IP Addresses
- Routing

However, simply connecting resources to a network is not enough.

Imagine a Virtual Machine with a Public IP address.

Without any security controls, anyone on the Internet could attempt to connect to every open port on that server.

Azure solves this problem using **Network Security Groups (NSGs)**.

A Network Security Group acts like a firewall for Azure networking.

It controls **which traffic is allowed and which traffic is denied** before the traffic reaches your Azure resources.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Network Security Group (NSG) is.
- Learn how NSGs work.
- Understand inbound and outbound rules.
- Learn rule priorities.
- Understand ports and protocols.
- Apply NSGs to Subnets and Network Interfaces.
- Follow production security best practices.

---

## What is a Network Security Group?

A **Network Security Group (NSG)** is a collection of firewall rules that control network traffic.

It filters traffic based on:

- Source
- Destination
- Port
- Protocol
- Direction
- Action (Allow or Deny)

Simplified architecture:

```text id="nsg01"
Internet
      │
      ▼
Network Security Group
      │
      ▼
Virtual Machine
```

Every packet entering or leaving a protected resource is evaluated against the NSG rules.

---

## Why Do We Need an NSG?

Suppose your Virtual Machine has a Public IP.

Without an NSG:

```text id="nsg02"
Internet

↓

Virtual Machine

(All traffic allowed)
```

This creates unnecessary security risks.

With an NSG:

```text id="nsg03"
Internet

↓

NSG

↓

Allowed Traffic Only

↓

Virtual Machine
```

Only approved traffic is permitted.

---

## Firewall Analogy

Think of an office building.

```text id="nsg04"
Office

↓

Security Guard

↓

Authorized Visitors
```

The security guard checks who may enter.

An NSG performs a similar function for network traffic.

```text id="nsg05"
Network Traffic

↓

NSG Rules

↓

Allow or Deny
```

---

## Traffic Direction

NSGs evaluate traffic in two directions.

| Direction | Description                 |
| --------- | --------------------------- |
| Inbound   | Traffic entering a resource |
| Outbound  | Traffic leaving a resource  |

Example:

```text id="nsg06"
Internet

↓

Inbound

↓

Virtual Machine

↓

Outbound

↓

Internet
```

Separate rules can be configured for each direction.

---

## Inbound Rules

Inbound rules control who can access your resources.

Example:

```text id="nsg07"
Internet

↓

Allow Port 80

↓

Web Server
```

Common inbound ports:

| Port | Service                  |
| ---- | ------------------------ |
| 22   | SSH                      |
| 80   | HTTP                     |
| 443  | HTTPS                    |
| 3389 | Remote Desktop (Windows) |

Only expose the ports your application actually requires.

---

## Outbound Rules

Outbound rules control where your resources can send traffic.

Example:

```text id="nsg08"
Application

↓

HTTPS

↓

API Server
```

Typical outbound traffic includes:

- Software updates
- External APIs
- Cloud storage
- Monitoring services

Many applications use the default outbound rules unless stricter controls are required.

---

## NSG Rules

Each NSG consists of multiple rules.

Example:

```text id="nsg09"
NSG

├── Rule 100
├── Rule 200
├── Rule 300
└── Rule 400
```

Each rule defines whether specific traffic should be allowed or denied.

---

## Components of an NSG Rule

Every rule contains several properties.

| Property         | Description                        |
| ---------------- | ---------------------------------- |
| Priority         | Order in which rules are processed |
| Source           | Origin of the traffic              |
| Source Port      | Source port number                 |
| Destination      | Target resource                    |
| Destination Port | Target port                        |
| Protocol         | TCP, UDP, or Any                   |
| Action           | Allow or Deny                      |

Azure evaluates these fields to decide whether a packet matches the rule.

---

## Rule Priority

Azure evaluates rules from the **lowest priority number** to the highest.

Example:

```text id="nsg10"
Priority 100

↓

Priority 200

↓

Priority 300
```

The first matching rule is applied, and processing stops.

Example:

| Priority | Rule        | Result                                   |
| -------- | ----------- | ---------------------------------------- |
| 100      | Allow HTTPS | Used                                     |
| 200      | Deny All    | Ignored because a match already occurred |

This makes rule ordering very important.

---

## Example Rules

Example configuration:

| Priority | Source   | Port | Action |
| -------- | -------- | ---- | ------ |
| 100      | Internet | 443  | Allow  |
| 110      | Internet | 80   | Allow  |
| 120      | Admin IP | 22   | Allow  |
| 4096     | Any      | Any  | Deny   |

This configuration allows HTTPS, HTTP, and SSH from a trusted administrative IP while denying other unmatched inbound traffic.

---

## NSG Processing Flow

```text id="nsg11"
Incoming Packet

↓

Rule 100

↓

Match?

↓

Yes

↓

Apply Rule

↓

Stop Processing
```

If a rule does not match, Azure continues evaluating the next rule.

---

## Applying an NSG

An NSG can be associated with either:

- A Subnet
- A Network Interface (NIC)

Architecture:

```text id="nsg12"
Virtual Network
       │
       ▼
Subnet
       │
      NSG
       │
       ▼
Virtual Machine
```

Or:

```text id="nsg13"
Virtual Machine

↓

NIC

↓

NSG
```

Applying an NSG to a subnet protects multiple resources, while applying it to a NIC affects only that specific network interface.

---

## Default Security Rules

Every NSG includes default rules.

Examples include:

- Allow communication within the Virtual Network.
- Allow responses to outbound connections.
- Deny unsolicited inbound traffic from the Internet.

These defaults provide a secure baseline while allowing normal network operations.

---

## Web Server Example

Suppose you deploy a Node.js application behind Nginx.

Required ports:

```text id="nsg14"
443

HTTPS
```

```text id="nsg15"
80

HTTP
```

```text id="nsg16"
22

SSH
```

Production configuration:

- Allow HTTP (80)
- Allow HTTPS (443)
- Allow SSH (22) only from trusted administrator IP addresses
- Deny unnecessary ports

---

## Database Example

A database server should remain private.

```text id="nsg17"
Internet

×

Database
```

Instead:

```text id="nsg18"
Web Server

↓

Private Network

↓

Database
```

The database accepts connections only from trusted resources inside the Virtual Network.

---

## Layered Security

NSGs work together with other Azure networking components.

```text id="nsg19"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Public IP
      │
      ▼
NSG
      │
      ▼
Web Server
```

Each layer provides additional protection.

---

## Typical Production Architecture

```text id="nsg20"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Azure Public IP
      │
      ▼
NSG
      │
      ▼
Web Server
      │
Private Network
      │
      ▼
API Server
      │
Private Network
      │
      ▼
Database
```

Only the web server accepts public traffic.

Backend systems remain protected within the Virtual Network.

---

## Real-World Example

Suppose a company deploys an Express.js application.

The infrastructure consists of:

- One Ubuntu Virtual Machine
- One Public IP
- One Network Security Group

The NSG is configured with these inbound rules:

| Priority | Port | Action                    |
| -------- | ---- | ------------------------- |
| 100      | 443  | Allow                     |
| 110      | 80   | Allow                     |
| 120      | 22   | Allow only from office IP |
| 4096     | Any  | Deny                      |

The application is publicly accessible over HTTPS, while SSH administration is restricted to authorized administrators.

---

## Best Practices

- Allow only the ports required by your application.
- Restrict SSH and Remote Desktop access to trusted IP addresses.
- Use HTTPS instead of HTTP whenever possible.
- Keep databases and internal services on private networks.
- Review NSG rules regularly.
- Use subnet-level NSGs for consistent policy enforcement.
- Document all custom security rules.

---

## Common Mistakes

#### Allowing Every Port

Opening unnecessary ports increases the attack surface and should be avoided.

---

#### Leaving SSH Open to the Entire Internet

Restrict SSH access to trusted IP addresses whenever practical.

---

#### Ignoring Rule Priority

A higher-priority rule can prevent lower-priority rules from ever being evaluated.

---

#### Exposing Databases Publicly

Databases should generally be accessible only through private networking.

---

#### Creating Duplicate Rules

Overlapping or redundant rules make NSGs harder to understand and maintain.

---

## Summary

Network Security Groups (NSGs) are Azure's primary network-level firewall mechanism. They protect resources by filtering inbound and outbound traffic based on configurable rules that consider source, destination, ports, protocols, and priority. By applying NSGs to subnets or network interfaces and allowing only the traffic required for an application, administrators can significantly improve the security of Azure environments while maintaining reliable network communication.

---

### Next Chapter

➡️ **09 - Public IP and Private IP**
