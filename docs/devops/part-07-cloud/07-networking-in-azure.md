---
sidebar_label: Networking in Azure
sidebar_position: 7
---


# Networking in Azure

### Overview

So far in this part, we have learned:

- Cloud Computing
- Cloud Service Models
- Azure Basics
- Resource Groups
- Virtual Machines
- Storage

However, creating a Virtual Machine alone is not enough.

A server without networking is like a computer with no network cable—it cannot communicate with anything.

To make a Virtual Machine useful, it must be connected to a network so it can:

- Communicate with other Azure resources
- Access the Internet
- Receive requests from users
- Connect to databases
- Connect to storage services

Azure provides a complete networking infrastructure that is very similar to networking in physical data centers.

Once you understand Azure networking, concepts such as **Network Security Groups**, **Public IPs**, **Load Balancers**, and **Private Communication** become much easier.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand Azure networking fundamentals.
- Learn what a Virtual Network (VNet) is.
- Understand Subnets.
- Learn about Network Interfaces (NICs).
- Understand routing.
- Learn how Azure resources communicate.
- Understand internet connectivity.

---

## Azure Networking Overview

Every Azure resource communicates through Azure's networking infrastructure.

A simplified architecture looks like this:

```text id="net01"
Internet
      │
      ▼
Azure Network
      │
      ▼
Virtual Network (VNet)
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
VM1  VM2      Database
```

The Virtual Network forms the foundation of communication between Azure resources.

---

## What is a Virtual Network (VNet)?

A **Virtual Network (VNet)** is Azure's private network.

Think of it as your organization's own private network inside Azure.

Example:

```text id="net02"
Office Network

↓

Switches

↓

Servers
```

Cloud equivalent:

```text id="net03"
Azure

↓

Virtual Network (VNet)

↓

Virtual Machines
```

Resources inside a VNet can communicate privately with one another.

---

## Why Use a VNet?

Without a VNet:

```text id="net04"
VM

×

Database
```

There is no private communication.

With a VNet:

```text id="net05"
VM

↓

Private Network

↓

Database
```

Benefits include:

- Private communication
- Better security
- Lower latency
- Easier network management

---

## IP Address Ranges

Every VNet is assigned a private IP address range.

Example:

```text id="net06"
10.0.0.0/16
```

This range defines the private IP addresses available inside the network.

Example:

```text id="net07"
10.0.0.4

10.0.0.5

10.0.1.4

10.0.2.10
```

These addresses are accessible only within the network unless explicitly exposed.

---

## What is a Subnet?

A **Subnet** divides a Virtual Network into smaller logical networks.

Example:

```text id="net08"
Virtual Network

10.0.0.0/16
```

Split into:

```text id="net09"
10.0.1.0/24

10.0.2.0/24

10.0.3.0/24
```

Architecture:

```text id="net10"
Virtual Network
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
Subnet  Subnet   Subnet
  A       B         C
```

Subnets improve organization and network security.

---

## Why Use Multiple Subnets?

Different application components often require different security rules.

Example:

```text id="net11"
Frontend

↓

Subnet A
```

```text id="net12"
Backend API

↓

Subnet B
```

```text id="net13"
Database

↓

Subnet C
```

Architecture:

```text id="net14"
VNet
 │
 ├── Web Subnet
 ├── API Subnet
 └── Database Subnet
```

This separation limits unnecessary communication between components.

---

## Network Interface (NIC)

Every Virtual Machine requires a **Network Interface (NIC)**.

Without a NIC:

```text id="net15"
VM

↓

No Network
```

With a NIC:

```text id="net16"
VM

↓

NIC

↓

Virtual Network
```

The NIC connects the Virtual Machine to the Virtual Network.

---

## Private IP Address

Each Network Interface receives a private IP address.

Example:

```text id="net17"
VM

↓

10.0.1.5
```

Private IP addresses are used for communication inside Azure.

Example:

```text id="net18"
Web Server

↓

10.0.1.5

↓

Database

10.0.2.5
```

No internet access is required for this communication.

---

## Public Internet Access

Not every Virtual Machine needs internet access.

Typical architecture:

```text id="net19"
Internet

↓

Public IP

↓

Virtual Machine
```

Without a Public IP:

```text id="net20"
Internet

×

Virtual Machine
```

The VM remains private inside the Virtual Network.

---

## Internet Communication Flow

Example:

```text id="net21"
Browser

↓

Public IP

↓

NIC

↓

Virtual Machine
```

The Public IP directs internet traffic to the VM's Network Interface.

---

## Routing

A **Route** tells Azure where network traffic should go.

Simplified example:

```text id="net22"
Request

↓

Routing

↓

Destination
```

Azure automatically creates system routes so that resources within the same VNet can communicate without additional configuration.

---

## Route Tables

Administrators can define custom routing behavior using **Route Tables**.

Example:

```text id="net23"
Internet Traffic

↓

Firewall

↓

Application
```

Custom routes are commonly used in enterprise environments to direct traffic through security appliances or other network devices.

---

## Network Communication

Example architecture:

```text id="net24"
VM 1

↓

Private Network

↓

VM 2

↓

Private Network

↓

Database
```

All communication occurs within the Virtual Network using private IP addresses.

---

## DNS Inside Azure

Azure provides internal DNS resolution within a Virtual Network.

Example:

```text id="net25"
Web Server

↓

Database Name

↓

Private IP
```

Resources can often communicate using hostnames rather than manually configured IP addresses, depending on the environment and DNS configuration.

---

## Typical Web Application Architecture

```text id="net26"
Internet
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
Private Network
      │
      ▼
Database
```

Users access only the web server.

The database remains inaccessible from the public internet.

---

## Multiple Subnet Architecture

```text id="net27"
Internet
      │
      ▼
Web Subnet
      │
      ▼
Application Subnet
      │
      ▼
Database Subnet
```

This layered architecture is common in production deployments.

---

## Azure Networking Components

| Component               | Purpose                      |
| ----------------------- | ---------------------------- |
| Virtual Network (VNet)  | Private cloud network        |
| Subnet                  | Logical division of a VNet   |
| Network Interface (NIC) | Connects a VM to the network |
| Private IP              | Internal communication       |
| Public IP               | Internet communication       |
| Route Table             | Controls traffic routing     |
| DNS                     | Name resolution              |

---

## Typical Production Deployment

```text id="net28"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Azure Public IP
      │
      ▼
Virtual Network
      │
 ┌────┼────────────┐
 ▼    ▼            ▼
Web  API      Database
VM    VM          VM
 │     │           │
 └─────┴───────────┘
      Private Network
```

Each component communicates securely over the Virtual Network while only the web server is exposed to the internet.

---

## Real-World Example

Suppose you deploy an e-commerce application.

Resources:

- Web Server
- API Server
- Database

Instead of exposing every server publicly:

```text id="net29"
Internet

↓

Web Server

↓

API Server

↓

Database
```

Only the Web Server has a Public IP.

The API Server and Database communicate using private IP addresses inside the Virtual Network.

This reduces the attack surface while maintaining efficient communication.

---

## Best Practices

- Place related resources inside the same Virtual Network when appropriate.
- Use separate subnets for different application layers.
- Expose only resources that require internet access.
- Prefer private communication whenever possible.
- Plan IP address ranges before creating a VNet.
- Keep databases and internal services on private networks.
- Document your network architecture.

---

## Common Mistakes

#### Giving Every Virtual Machine a Public IP

Most backend services should remain private and communicate only within the Virtual Network.

---

#### Placing Every Resource in One Subnet

Using separate subnets for web servers, application servers, and databases improves organization and security.

---

#### Poor IP Address Planning

Changing IP ranges after deployment can be complex. Design the address space before creating the Virtual Network.

---

#### Confusing VNets with Resource Groups

A Resource Group organizes Azure resources, while a Virtual Network provides network connectivity.

---

#### Ignoring Network Design

As applications grow, an unplanned network layout becomes difficult to maintain and secure.

---

## Summary

Azure networking provides the foundation for communication between cloud resources. Virtual Networks (VNets) create private cloud networks, Subnets divide those networks into logical segments, and Network Interfaces connect Virtual Machines to the network. Private IP addresses enable secure internal communication, while Public IP addresses provide controlled internet access. Together with routing and DNS, these components form the networking layer that supports secure, scalable, and well-organized cloud applications.

---

### Next Chapter

➡️ **08 - Network Security Groups**
