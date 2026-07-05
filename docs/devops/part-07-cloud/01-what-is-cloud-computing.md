---
sidebar_label: What is Cloud Computing
sidebar_position: 1
---


# What is Cloud Computing

## Overview

Over the past few sections of this handbook, we have learned how to build and deploy applications on Linux servers.

A typical deployment looked like this:

- Linux Server
- Node.js Application
- Nginx
- SSL
- Domain Name
- Cloudflare

While this setup works well, an important question remains:

**Where does the Linux server actually come from?**

Years ago, companies had to purchase physical servers, install them in data centers, configure networking, maintain hardware, and replace failing components themselves.

Today, cloud providers such as **Microsoft Azure**, **Amazon Web Services (AWS)**, and **Google Cloud Platform (GCP)** provide computing resources on demand. Instead of purchasing physical hardware, organizations rent the infrastructure they need and pay only for what they use.

This model is known as **Cloud Computing**.

In this chapter, you will learn how cloud computing evolved, why it became the standard for modern infrastructure, and the fundamental concepts used by all major cloud providers.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what cloud computing is.
- Learn how traditional infrastructure worked.
- Understand the limitations of on-premises servers.
- Learn why cloud computing became popular.
- Recognize the major cloud providers.
- Understand regions and availability zones.
- Follow the lifecycle of a cloud-hosted application.

---

# Before Cloud Computing

Imagine a company wants to launch a website.

Years ago, the process looked like this:

```text id="q81tfc"
Company

↓

Purchase Servers

↓

Purchase Networking Equipment

↓

Build Server Room

↓

Install Operating Systems

↓

Deploy Applications

↓

Maintain Everything
```

The company was responsible for every aspect of the infrastructure.

Typical equipment included:

- Physical servers
- Hard drives
- Switches
- Routers
- Firewalls
- Backup systems
- UPS units
- Cooling systems

Everything had to be purchased, installed, and maintained.

---

# What is On-Premises Infrastructure?

When servers are owned and managed by the organization itself, the infrastructure is called **On-Premises** (or **On-Prem**).

Example:

```text id="w9d5um"
Company Office

┌──────────────────────┐
│                      │
│  Server Room         │
│                      │
│  Linux Servers       │
│  Switches            │
│  Routers             │
│  Firewalls           │
│  Storage             │
│                      │
└──────────────────────┘
```

All hardware remains under the company's control.

---

# Problems with On-Premises Infrastructure

Although on-premises infrastructure offers complete control, it introduces several challenges.

### High Initial Cost

Organizations must purchase hardware before launching applications.

Example:

- Servers
- Networking equipment
- Storage
- Backup devices

This requires significant upfront investment.

---

### Maintenance

Hardware eventually fails.

Administrators are responsible for:

- Replacing disks
- Upgrading RAM
- Replacing power supplies
- Updating firmware
- Monitoring hardware health

---

### Scaling

Suppose a website suddenly becomes popular.

Current server:

```text id="n4v4v0"
CPU

RAM

Storage
```

becomes insufficient.

The organization must:

- Purchase another server
- Wait for delivery
- Install hardware
- Configure networking
- Deploy applications

Scaling may take days or weeks.

---

### Downtime Risk

If a server fails:

```text id="0tlfxq"
Application

↓

Server Failure

↓

Website Offline
```

Recovery depends on available backups and spare hardware.

---

### Limited Global Reach

If all servers are located in one country, users from other regions may experience higher latency.

Example:

```text id="m0ol9l"
India Server

↓

Users in Europe

↓

Longer Response Time
```

Serving users worldwide efficiently becomes difficult.

---

# The Rise of Cloud Computing

Cloud providers solved many of these challenges by operating massive data centers around the world.

Instead of buying hardware, organizations rent resources over the internet.

New workflow:

```text id="pw98u7"
Developer

↓

Cloud Provider

↓

Virtual Server

↓

Deploy Application
```

Provisioning a server can often be completed within minutes.

---

# What is Cloud Computing?

Cloud Computing is the delivery of computing services over the internet.

Instead of purchasing physical hardware, users rent resources such as:

- Virtual Machines
- Storage
- Databases
- Networking
- Load Balancers
- AI Services
- Monitoring Tools

These resources can be created, modified, and removed as needed.

---

# Cloud Computing Analogy

Think of electricity.

Most homes do not generate their own electricity.

Instead:

```text id="j55xzx"
Electric Company

↓

Electricity

↓

Home

↓

Monthly Bill
```

Cloud computing follows a similar model.

Instead of owning servers:

```text id="jlwmc1"
Cloud Provider

↓

Virtual Servers

↓

Your Application

↓

Pay for Usage
```

You consume infrastructure as a service.

---

# Major Cloud Providers

Today, several companies provide cloud computing services.

| Provider                    | Common Name |
| --------------------------- | ----------- |
| Amazon Web Services         | AWS         |
| Microsoft Azure             | Azure       |
| Google Cloud Platform       | GCP         |
| Oracle Cloud Infrastructure | OCI         |
| IBM Cloud                   | IBM Cloud   |

Although each platform has unique services, the core concepts are largely the same.

---

# What Does a Cloud Provider Own?

Cloud providers operate large-scale data centers.

```text id="jlwmc2"
Cloud Data Center

┌──────────────────────────────┐
│ Thousands of Servers         │
│ High-Speed Networking        │
│ Storage Systems              │
│ Backup Infrastructure        │
│ Power Systems                │
│ Cooling Systems              │
│ Security                     │
└──────────────────────────────┘
```

Customers rent virtual resources running on this infrastructure.

---

# Virtualization

Cloud computing relies heavily on **virtualization**.

Instead of one operating system using an entire physical server, a hypervisor allows multiple virtual machines to share the same hardware.

```text id="jlwmc3"
Physical Server
        │
        ▼
Hypervisor
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
VM 1   VM 2   VM 3
```

Each virtual machine behaves like an independent computer.

---

# Benefits of Cloud Computing

Cloud computing provides many advantages.

| Benefit            | Description                               |
| ------------------ | ----------------------------------------- |
| Scalability        | Increase or decrease resources quickly    |
| High Availability  | Multiple data centers improve reliability |
| Lower Initial Cost | No hardware purchases required            |
| Global Reach       | Deploy closer to users                    |
| Flexibility        | Create or remove resources on demand      |
| Managed Services   | Access databases, storage, AI, and more   |

These benefits have made cloud computing the preferred deployment model for many organizations.

---

# Cloud Regions

Cloud providers operate infrastructure across multiple geographic locations called **Regions**.

Example:

```text id="jlwmc4"
World

├── India
├── Europe
├── North America
├── South America
├── Australia
└── Asia
```

Each region contains independent infrastructure.

Choosing a region closer to users generally reduces network latency.

---

# Availability Zones

Within a region, cloud providers often operate multiple **Availability Zones (AZs)**.

```text id="jlwmc5"
Region

├── Zone A
├── Zone B
└── Zone C
```

Each zone has separate power, cooling, and networking infrastructure.

Deploying applications across multiple availability zones improves resilience if one zone experiences an outage.

---

# Typical Cloud Architecture

A simple deployment might look like:

```text id="jlwmc6"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Cloud Provider
      │
      ▼
Virtual Machine
      │
      ▼
Nginx
      │
      ▼
Node.js
      │
      ▼
Database
```

Much of the application stack remains the same; the primary difference is that the infrastructure is hosted by a cloud provider.

---

# Cloud vs On-Premises

| Feature              | On-Premises | Cloud          |
| -------------------- | ----------- | -------------- |
| Hardware Purchase    | Required    | Not Required   |
| Upfront Cost         | High        | Low            |
| Scaling              | Slow        | Fast           |
| Hardware Maintenance | Customer    | Cloud Provider |
| Global Deployment    | Difficult   | Easy           |
| Pay-as-you-go        | No          | Yes            |

---

# Real-World Example

Suppose a startup launches an e-commerce website.

With an on-premises approach, it would need to:

- Purchase servers.
- Build networking infrastructure.
- Configure backup systems.
- Maintain hardware.
- Plan for future growth.

Instead, the startup creates:

- One virtual machine.
- One storage account.
- One public IP address.
- One domain name.

The website is deployed within hours rather than weeks. As traffic grows, the startup can increase server capacity or add additional resources without purchasing new physical hardware.

---

# Best Practices

- Choose cloud regions close to your users.
- Design applications so they can scale as demand changes.
- Monitor cloud resource usage to avoid unnecessary costs.
- Use cloud services that match your application's needs.
- Understand the pricing model before deploying resources.
- Keep infrastructure documented and organized.

---

# Common Mistakes

### Assuming the Cloud Eliminates All Responsibilities

Cloud providers manage the underlying hardware, but customers are still responsible for securing operating systems, applications, and data.

---

### Choosing the Wrong Region

Deploying resources far from users can increase latency and reduce performance.

---

### Over-Provisioning Resources

Creating larger virtual machines than necessary increases costs without improving efficiency.

---

### Ignoring Cost Monitoring

Cloud resources continue to incur charges while they are running. Unused resources should be stopped or removed when no longer needed.

---

### Treating Cloud Servers Differently from Linux Servers

A cloud virtual machine is still a Linux or Windows server. Good practices for security, updates, backups, and monitoring remain essential.

---

# Summary

Cloud computing allows organizations to rent computing resources instead of purchasing and maintaining physical hardware. By leveraging virtualization, global data centers, and on-demand provisioning, cloud providers offer scalable, reliable, and cost-effective infrastructure. Concepts such as regions, availability zones, and virtual machines form the foundation of modern cloud platforms. Understanding these fundamentals prepares you to work with services offered by providers such as Microsoft Azure, AWS, and Google Cloud.

---

## Next Chapter

➡️ **02 - Cloud Service Models**
