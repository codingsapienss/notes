---
sidebar_label: Virtual Machines
sidebar_position: 5
---


# Virtual Machines

## Overview

So far in this section, we have learned:

- What Cloud Computing is.
- Cloud Service Models.
- Azure Basics.
- Resource Groups.

Now we arrive at one of the most important Azure services:

**Azure Virtual Machines (Azure VMs)**

If you have been following this handbook from the beginning, everything you have learned about:

- Linux
- SSH
- Networking
- Nginx
- PM2
- Node.js
- SSL
- Cloudflare

will eventually run on a Virtual Machine.

An Azure Virtual Machine is simply a computer running inside Microsoft's cloud infrastructure.

Instead of buying a physical computer, Azure provides a virtual one that you can create, configure, resize, and delete whenever required.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Virtual Machine is.
- Learn how virtualization works.
- Understand Azure VM components.
- Learn VM sizes and pricing.
- Choose an operating system.
- Understand disks and networking.
- Follow production deployment best practices.

---

# What is a Virtual Machine?

A **Virtual Machine (VM)** is a software-based computer that behaves like a physical computer.

It has:

- CPU
- Memory (RAM)
- Storage
- Network Interface
- Operating System

The only difference is that it runs on shared physical hardware inside a cloud data center.

---

# Physical Server vs Virtual Machine

Traditional infrastructure:

```text id="vm01"
One Physical Server

↓

One Operating System

↓

One Application
```

Modern cloud infrastructure:

```text id="vm02"
Physical Server
        │
        ▼
Hypervisor
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
VM 1   VM 2     VM 3
```

Multiple virtual machines share the same physical hardware while remaining isolated from each other.

---

# How Virtualization Works

A special software layer called a **Hypervisor** manages virtual machines.

```text id="vm03"
Physical Hardware
        │
        ▼
Hypervisor
        │
 ┌──────┼───────────┐
 ▼      ▼           ▼
Ubuntu Windows Debian
 VM       VM         VM
```

The hypervisor allocates CPU, memory, storage, and networking resources to each VM.

Users generally do not interact with the hypervisor directly.

---

# Why Use Virtual Machines?

Virtual Machines provide several advantages over physical servers.

| Benefit           | Description                   |
| ----------------- | ----------------------------- |
| Fast Provisioning | Create servers within minutes |
| Scalability       | Resize CPU and RAM easily     |
| Isolation         | Each VM runs independently    |
| Cost Efficiency   | Pay only for resources used   |
| Flexibility       | Run Linux or Windows          |
| Easy Replacement  | Delete and recreate quickly   |

---

# Components of an Azure VM

Creating a VM involves more than selecting an operating system.

Typical architecture:

```text id="vm04"
Virtual Machine
       │
 ┌─────┼─────────────┐
 ▼     ▼             ▼
CPU   Memory      Storage
       │
       ▼
Network Interface
       │
       ▼
Public / Private IP
```

Each component can usually be configured independently.

---

# Choosing an Operating System

Azure supports multiple operating systems.

Common Linux distributions:

- Ubuntu
- Debian
- Rocky Linux
- AlmaLinux
- Red Hat Enterprise Linux
- SUSE Linux

Windows options:

- Windows Server 2022
- Windows Server 2019

For Node.js, Nginx, Docker, and most web applications, **Ubuntu Server** is one of the most popular choices.

---

# Azure VM Images

When creating a VM, Azure uses an **Image**.

An image is a preconfigured operating system template.

Example:

```text id="vm05"
Ubuntu 24.04 LTS

↓

Azure Image

↓

New Virtual Machine
```

Creating multiple VMs from the same image ensures consistent environments.

---

# VM Sizes

Azure provides many VM sizes optimized for different workloads.

Examples:

| Series   | Typical Use                         |
| -------- | ----------------------------------- |
| B-Series | Development and burstable workloads |
| D-Series | General-purpose applications        |
| E-Series | Memory-intensive workloads          |
| F-Series | Compute-intensive workloads         |

Example:

```text id="vm06"
Small Website

↓

B2s

Production API

↓

D-Series

Database

↓

E-Series
```

Selecting the appropriate size balances performance and cost.

---

# CPU and Memory

Every VM includes a defined number of virtual CPUs (vCPUs) and RAM.

Example:

| VM Size | vCPU | RAM   |
| ------- | ---- | ----- |
| Small   | 2    | 4 GB  |
| Medium  | 4    | 8 GB  |
| Large   | 8    | 16 GB |

The available sizes vary by Azure region and VM family.

---

# Virtual Disks

Every Azure VM requires storage.

Common disk types:

| Disk Type      | Typical Use                |
| -------------- | -------------------------- |
| Standard HDD   | Low-cost storage           |
| Standard SSD   | General workloads          |
| Premium SSD    | Production applications    |
| Premium SSD v2 | High-performance workloads |
| Ultra Disk     | Very high I/O requirements |

Architecture:

```text id="vm07"
Virtual Machine

↓

Managed Disk

↓

Azure Storage
```

The operating system is installed on the OS disk, while additional data disks can be attached if needed.

---

# Networking

Every VM is connected to an Azure Virtual Network.

Typical setup:

```text id="vm08"
Internet
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

Private communication between Azure resources occurs through private IP addresses within the Virtual Network.

---

# Connecting to a Linux VM

Most Linux VMs are accessed using SSH.

```bash id="vm09"
ssh azureuser@<public-ip>
```

Example:

```text id="vm10"
Laptop

↓

SSH

↓

Azure VM

↓

Ubuntu
```

This is the same method used throughout the Linux sections of this handbook.

---

# Typical Web Server Deployment

After connecting to the VM, administrators install:

- Ubuntu updates
- Node.js
- Nginx
- PM2
- SSL tools
- Git

Architecture:

```text id="vm11"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Azure Public IP
      │
      ▼
Ubuntu VM
      │
      ▼
Nginx
      │
      ▼
Node.js
```

This closely matches the production environments built earlier in this handbook.

---

# Resizing a Virtual Machine

One advantage of cloud infrastructure is the ability to resize a VM.

Example:

```text id="vm12"
2 vCPU

↓

Application Grows

↓

4 vCPU

↓

8 vCPU
```

Unlike physical hardware, increasing resources often requires only changing the VM size and restarting the machine.

---

# Starting and Stopping VMs

Virtual Machines can be managed as needed.

```text id="vm13"
Create

↓

Start

↓

Run

↓

Stop

↓

Delete
```

Stopping a VM can reduce compute costs, although some associated resources (such as managed disks or reserved public IP addresses) may continue to incur charges.

---

# Azure VM Pricing

VM pricing generally depends on:

- VM size
- Operating System
- Region
- Storage type
- Running time

Example:

```text id="vm14"
Larger VM

↓

More CPU

↓

More RAM

↓

Higher Cost
```

Selecting a VM larger than necessary increases operating costs.

---

# Availability

Critical applications should avoid relying on a single VM.

Example:

```text id="vm15"
Internet
      │
      ▼
Load Balancer
      │
 ┌────┴────┐
 ▼         ▼
VM 1     VM 2
```

Multiple VMs improve reliability and reduce downtime during failures or maintenance.

---

# Typical Production Architecture

```text id="vm16"
Users
   │
   ▼
Cloudflare
   │
   ▼
Azure Public IP
   │
   ▼
Load Balancer (Optional)
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

The Virtual Machine provides the compute environment where the application runs.

---

# Real-World Example

A company wants to deploy a production Express.js application.

The team creates:

- One Ubuntu Virtual Machine
- One Public IP Address
- One Virtual Network
- One Network Security Group

After connecting through SSH, they install:

- Git
- Node.js
- PM2
- Nginx
- Certbot

Finally, they deploy the application, configure Nginx as a reverse proxy, enable HTTPS, and point the domain through Cloudflare.

The Azure VM functions as the production server for the application.

---

# Best Practices

- Choose the smallest VM that meets current requirements.
- Use Ubuntu LTS releases for long-term stability.
- Keep the operating system updated.
- Use SSH key authentication instead of passwords.
- Resize VMs when resource utilization changes.
- Use Premium SSDs for production workloads that require consistent performance.
- Shut down or delete unused VMs to reduce costs.
- Use multiple VMs or availability features for high availability when required.

---

# Common Mistakes

### Choosing an Oversized VM

Allocating more CPU or memory than necessary increases costs without improving application efficiency.

---

### Using Password Authentication

SSH key authentication is generally more secure than password-based logins.

---

### Forgetting About Attached Resources

Deleting or stopping a VM does not automatically remove all associated resources such as disks or public IP addresses.

---

### Ignoring Monitoring

CPU, memory, disk usage, and network activity should be monitored regularly to identify performance issues before they affect users.

---

### Treating Cloud VMs as Disposable Without Backups

Although VMs can be recreated, application data and configuration should still be backed up appropriately.

---

# Summary

Azure Virtual Machines provide on-demand computing resources that behave like traditional physical servers while benefiting from the flexibility of cloud infrastructure. By understanding virtualization, VM sizes, operating systems, storage, networking, and pricing, administrators can deploy and manage reliable Linux or Windows servers for a wide range of workloads. The Linux, Nginx, Node.js, and deployment techniques covered earlier in this handbook are directly applicable to Azure Virtual Machines, making them a foundational service for cloud-hosted applications.

---

## Next Chapter

➡️ **06 - Storage**
