---
sidebar_label: Storage
sidebar_position: 6
---


# Storage

## Overview

Every application stores data.

Whether it is:

- Website files
- Images
- Videos
- User uploads
- Databases
- Backups
- Logs
- Virtual Machine disks

all of this information needs a place to live.

In traditional data centers, storage usually meant attaching hard drives or storage arrays to physical servers.

In cloud computing, storage is provided as a managed service.

Microsoft Azure offers several storage services, each designed for different use cases.

Choosing the correct storage service is important because it affects:

- Performance
- Reliability
- Cost
- Scalability
- Availability

In this chapter, you will learn the most commonly used Azure storage services and understand when each one should be used.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand Azure Storage.
- Learn about Storage Accounts.
- Understand Managed Disks.
- Learn Blob Storage.
- Learn Azure Files.
- Understand storage redundancy.
- Choose the appropriate storage service.

---

# What is Cloud Storage?

Cloud Storage is a service that stores data on infrastructure managed by the cloud provider.

Instead of purchasing physical disks:

```text id="st01"
Company

↓

Cloud Provider

↓

Store Data
```

The cloud provider handles:

- Hardware
- Disk failures
- Replication
- Maintenance
- Scaling

Customers simply store and retrieve data.

---

# Azure Storage Overview

Azure Storage consists of multiple storage services.

```text id="st02"
Azure Storage

├── Managed Disks
├── Blob Storage
├── Azure Files
├── Queue Storage
└── Table Storage
```

Each service is designed for a different type of data.

---

# What is a Storage Account?

Almost every Azure storage service begins with a **Storage Account**.

Think of it as a container for storage resources.

```text id="st03"
Storage Account

├── Blob Containers
├── File Shares
├── Queues
└── Tables
```

The Storage Account provides:

- Authentication
- Billing
- Security
- Redundancy settings
- Access management

Most Azure storage resources are created inside a Storage Account.

---

# Managed Disks

Virtual Machines require disks.

Azure provides **Managed Disks** to simplify disk management.

Architecture:

```text id="st04"
Virtual Machine

↓

Managed Disk

↓

Azure Storage
```

Azure automatically manages:

- Disk availability
- Replication
- Performance
- Scaling infrastructure

Administrators no longer manage physical storage hardware.

---

# Types of Managed Disks

Azure offers multiple disk options.

| Disk Type      | Best For                                 |
| -------------- | ---------------------------------------- |
| Standard HDD   | Development and archival workloads       |
| Standard SSD   | General-purpose applications             |
| Premium SSD    | Production applications                  |
| Premium SSD v2 | High-performance production workloads    |
| Ultra Disk     | Databases and I/O-intensive applications |

Choosing the correct disk depends on performance requirements and budget.

---

# Blob Storage

Blob Storage is Azure's object storage service.

It stores:

- Images
- Videos
- PDFs
- Documents
- Backups
- Static website files
- Application uploads

Architecture:

```text id="st05"
Application

↓

Blob Storage

↓

Azure Storage
```

Unlike a traditional file system, Blob Storage stores objects rather than directories and files in the operating system.

---

# Blob Containers

Inside Blob Storage, data is organized into **Containers**.

Example:

```text id="st06"
Storage Account

↓

Blob Container

├── image1.jpg
├── logo.png
├── video.mp4
└── manual.pdf
```

Containers help organize related blobs.

---

# Blob Storage Access Levels

Azure Blob Storage supports different access tiers.

| Tier    | Use Case                   |
| ------- | -------------------------- |
| Hot     | Frequently accessed data   |
| Cool    | Occasionally accessed data |
| Cold    | Infrequently accessed data |
| Archive | Long-term archival storage |

Lower-cost tiers generally have higher retrieval times or access costs.

---

# Azure Files

Azure Files provides managed network file shares.

Architecture:

```text id="st07"
Multiple Servers

↓

Azure File Share

↓

Shared Files
```

Common uses:

- Shared documents
- Configuration files
- Team folders
- Application file sharing

Multiple virtual machines can access the same file share simultaneously.

---

# Queue Storage

Queue Storage enables applications to exchange messages asynchronously.

Example workflow:

```text id="st08"
Application A

↓

Queue

↓

Application B
```

Queues are commonly used to decouple application components and process background tasks.

---

# Table Storage

Table Storage stores structured NoSQL data.

Example:

```text id="st09"
UserID

Name

Email

Phone
```

It is designed for large volumes of simple key-value or attribute-based data.

---

# Storage Redundancy

Hardware failures happen.

Azure protects data by creating additional copies.

Common redundancy options include:

| Option | Description                |
| ------ | -------------------------- |
| LRS    | Locally Redundant Storage  |
| ZRS    | Zone-Redundant Storage     |
| GRS    | Geo-Redundant Storage      |
| GZRS   | Geo-Zone-Redundant Storage |

---

# Locally Redundant Storage (LRS)

LRS stores multiple copies of data within a single Azure data center.

```text id="st10"
Data Center

├── Copy 1
├── Copy 2
└── Copy 3
```

Suitable for many development and production workloads where regional redundancy is not required.

---

# Zone-Redundant Storage (ZRS)

ZRS stores copies across multiple Availability Zones within the same region.

```text id="st11"
Region

├── Zone A
├── Zone B
└── Zone C
```

If one Availability Zone becomes unavailable, the data remains accessible from the others.

---

# Geo-Redundant Storage (GRS)

GRS stores data in one region and asynchronously replicates it to a paired region.

```text id="st12"
Primary Region

↓

Replication

↓

Secondary Region
```

This provides protection against regional outages.

---

# Storage Security

Azure Storage supports multiple security features.

Examples:

- Encryption at rest
- Encryption in transit
- Shared Access Signatures (SAS)
- Microsoft Entra ID authentication
- Access Keys
- Private Endpoints

These features help protect stored data from unauthorized access.

---

# Typical Web Application Storage

Suppose an application allows users to upload profile pictures.

Architecture:

```text id="st13"
Users

↓

Upload Image

↓

Node.js

↓

Azure Blob Storage

↓

Image URL
```

The application stores metadata in a database while the image itself resides in Blob Storage.

---

# Storage for Virtual Machines

Virtual Machines typically use:

```text id="st14"
Operating System

↓

OS Disk

Application Data

↓

Data Disk

Backups

↓

Backup Storage
```

Separating operating system and application data simplifies maintenance and recovery.

---

# Choosing the Right Storage

| Requirement          | Recommended Service |
| -------------------- | ------------------- |
| Virtual Machine Disk | Managed Disk        |
| Images & Videos      | Blob Storage        |
| Shared Folder        | Azure Files         |
| Background Messages  | Queue Storage       |
| Simple NoSQL Data    | Table Storage       |

Selecting the correct service improves performance, scalability, and cost efficiency.

---

# Typical Production Architecture

```text id="st15"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Azure VM
      │
 ┌────┼────────────┐
 ▼    ▼            ▼
OS Disk Blob    Database
         │
         ▼
Images
Videos
Backups
```

Different types of application data are stored using the storage service best suited to their requirements.

---

# Real-World Example

Suppose your company develops an e-commerce platform.

The infrastructure might use:

- One Managed Disk for the Ubuntu operating system.
- One additional Managed Disk for application data.
- Azure Blob Storage for product images.
- Azure Files for shared reports.
- Azure Backup for recovery.
- Geo-redundant storage for critical customer data.

Each storage service addresses a different requirement, resulting in a scalable and reliable architecture.

---

# Best Practices

- Choose the storage service that matches your workload.
- Use Blob Storage for large static files.
- Keep operating system and application data on separate disks when appropriate.
- Select the appropriate redundancy level based on business requirements.
- Enable encryption for sensitive data.
- Remove unused storage resources to control costs.
- Monitor storage usage and performance regularly.

---

# Common Mistakes

### Using Managed Disks for Large Media Libraries

Managed Disks are designed for Virtual Machines. Large collections of images or videos are generally better suited to Blob Storage.

---

### Choosing Expensive Storage Without Need

High-performance storage increases costs. Match the storage tier to the application's actual requirements.

---

### Ignoring Redundancy

Critical production data should be protected with an appropriate redundancy strategy.

---

### Mixing Different Types of Data

Operating system files, user uploads, backups, and shared documents often have different storage requirements and should be stored using the appropriate Azure service.

---

### Forgetting Security

Storage accounts should be secured with proper authentication, encryption, and access controls to prevent unauthorized access.

---

# Summary

Azure provides multiple storage services to support different application needs. Storage Accounts act as the foundation for services such as Blob Storage, Azure Files, Queue Storage, and Table Storage, while Managed Disks provide persistent storage for Virtual Machines. By understanding redundancy options, storage tiers, and workload-specific services, administrators can build cloud solutions that are reliable, scalable, secure, and cost-effective.

---

## Next Chapter

➡️ **07 - Networking in Azure**
