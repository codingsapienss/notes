---
sidebar_label: Azure Basics
sidebar_position: 3
---


# Azure Basics

## Overview

In the previous chapters, we learned:

- What Cloud Computing is.
- Why organizations use cloud platforms.
- The different cloud service models such as IaaS, PaaS, SaaS, and FaaS.

Now it is time to learn one of the world's largest cloud platforms:

**Microsoft Azure**

Azure provides hundreds of cloud services that allow organizations to build, deploy, and manage applications without owning physical infrastructure.

Whether you want to host a Linux server, deploy a web application, store files, train AI models, or build enterprise-scale systems, Azure provides services for each of these needs.

Although Azure offers a vast ecosystem of services, the underlying concepts remain straightforward once you understand the platform's organization and terminology.

This chapter introduces the Azure Portal, account hierarchy, subscriptions, tenants, and the core services that form the foundation of most Azure deployments.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what Microsoft Azure is.
- Learn Azure's account hierarchy.
- Understand Azure Tenants and Subscriptions.
- Navigate the Azure Portal.
- Recognize common Azure services.
- Understand how Azure resources are organized.
- Prepare for creating cloud infrastructure.

---

# What is Microsoft Azure?

Microsoft Azure is a cloud computing platform developed by Microsoft.

It provides cloud services including:

- Virtual Machines
- Storage
- Databases
- Networking
- Artificial Intelligence
- Analytics
- Monitoring
- Identity Management
- Containers
- Serverless Computing

Instead of purchasing hardware, organizations create cloud resources directly from Azure.

---

# Azure Around the World

Azure operates data centers across multiple geographic regions.

```text id="az1wq2"
Users

↓

Nearest Azure Region

↓

Azure Data Center

↓

Application
```

Deploying applications closer to users generally reduces network latency and improves performance.

---

# Accessing Azure

Azure is managed through several interfaces.

```text id="az3kl8"
Azure

├── Azure Portal
├── Azure CLI
├── Azure PowerShell
├── ARM Templates
└── APIs
```

For beginners, the **Azure Portal** is the easiest way to create and manage resources.

---

# Azure Portal

The Azure Portal is Microsoft's web-based management interface.

Typical tasks include:

- Creating Virtual Machines
- Managing Storage
- Configuring Networking
- Monitoring Resources
- Viewing Billing
- Managing Users
- Deploying Applications

Architecture:

```text id="az2kn9"
Browser

↓

Azure Portal

↓

Azure Cloud
```

Most infrastructure can be managed without using the command line.

---

# Azure Account Hierarchy

Azure organizes resources using a hierarchical structure.

```text id="az4jq1"
Management Group
        │
        ▼
Tenant
        │
        ▼
Subscription
        │
        ▼
Resource Group
        │
        ▼
Resources
```

Each level serves a different purpose.

---

# What is a Tenant?

A **Tenant** represents an organization's identity within Microsoft Entra ID (formerly Azure Active Directory).

A tenant contains:

- Users
- Groups
- Applications
- Authentication policies
- Identity management

Example:

```text id="az5mu7"
Company

↓

Azure Tenant

↓

Employees

↓

Applications
```

Most organizations have one primary tenant, although larger enterprises may use multiple tenants for different business units or environments.

---

# What is a Subscription?

A **Subscription** is a billing and resource management boundary.

Everything you create in Azure belongs to a subscription.

A subscription defines:

- Billing
- Spending limits
- Resource quotas
- Permissions

Example:

```text id="az6bt4"
Tenant

├── Production Subscription
├── Development Subscription
└── Testing Subscription
```

Using separate subscriptions helps isolate environments and control costs.

---

# Why Multiple Subscriptions?

Organizations often separate workloads.

Example:

```text id="az7ls3"
Production

↓

Separate Subscription

Development

↓

Separate Subscription

Testing

↓

Separate Subscription
```

Benefits:

- Independent billing
- Resource isolation
- Different permissions
- Easier cost tracking

---

# What are Azure Resources?

Almost everything created in Azure is called a **Resource**.

Examples include:

- Virtual Machine
- Storage Account
- Public IP Address
- Virtual Network
- Database
- Load Balancer
- Network Security Group

Architecture:

```text id="az8xp5"
Subscription

↓

Resource Group

↓

Resources
```

We will explore Resource Groups in the next chapter.

---

# Common Azure Services

Azure contains hundreds of services.

Some of the most commonly used are:

| Service                | Purpose                        |
| ---------------------- | ------------------------------ |
| Azure Virtual Machines | Host Linux and Windows servers |
| Azure Storage          | Store files and objects        |
| Azure Virtual Network  | Private cloud networking       |
| Azure Load Balancer    | Distribute incoming traffic    |
| Azure App Service      | Host web applications          |
| Azure SQL Database     | Managed relational database    |
| Azure Functions        | Serverless computing           |
| Azure Monitor          | Monitoring and metrics         |
| Microsoft Entra ID     | Identity and authentication    |

You do not need to learn every Azure service to become productive.

---

# Azure Regions

Azure infrastructure is divided into **Regions**.

Examples:

```text id="az9he8"
Central India

West Europe

East US

Japan East

Australia East
```

When deploying resources, you choose a region.

Factors to consider:

- User location
- Regulatory requirements
- Service availability
- Disaster recovery

---

# Availability Zones

Many Azure regions include multiple **Availability Zones**.

```text id="az10pn4"
Azure Region

├── Zone 1
├── Zone 2
└── Zone 3
```

Each zone has independent:

- Power
- Cooling
- Networking

Deploying across multiple zones increases application availability.

---

# Azure Resource Organization

A simplified deployment might look like this:

```text id="az11fj6"
Tenant

↓

Subscription

↓

Resource Group

↓

Virtual Machine

↓

Nginx

↓

Node.js
```

This hierarchy makes Azure resources easier to manage as projects grow.

---

# Azure Pricing

Azure generally follows a **pay-as-you-go** pricing model.

Example:

```text id="az12cs9"
Create VM

↓

VM Runs

↓

Usage Recorded

↓

Monthly Bill
```

The exact cost depends on the services used and how long they remain active.

---

# Azure Free Account

Microsoft offers a free Azure account that typically includes:

- Free services for a limited period
- A limited amount of promotional credit for new users (where applicable)
- Always-free services with usage limits
- Access to the Azure Portal

The available offers may change over time depending on Microsoft's current program.

---

# Typical Azure Deployment

Suppose you want to host a Node.js application.

Architecture:

```text id="az13uo7"
Internet
      │
      ▼
Cloudflare
      │
      ▼
Azure Public IP
      │
      ▼
Azure Virtual Machine
      │
      ▼
Ubuntu Linux
      │
      ▼
Nginx
      │
      ▼
Node.js
```

This architecture closely resembles what we built in the previous sections of this handbook.

The difference is that the infrastructure is now hosted inside Azure.

---

# Azure Management Tools

Although the Azure Portal is commonly used, administrators often automate tasks.

| Tool             | Purpose                           |
| ---------------- | --------------------------------- |
| Azure Portal     | Graphical management interface    |
| Azure CLI        | Command-line management           |
| Azure PowerShell | PowerShell automation             |
| ARM Templates    | Infrastructure as Code            |
| Bicep            | Simplified Infrastructure as Code |
| REST APIs        | Programmatic access               |

As you gain experience, automation becomes increasingly important.

---

# Real-World Example

A startup wants to deploy its first production application.

The team creates:

- One Azure subscription.
- One Resource Group.
- One Ubuntu Virtual Machine.
- One Public IP address.
- One Virtual Network.
- One Network Security Group.

They install:

- Ubuntu Linux
- Nginx
- Node.js
- PM2

Finally, they connect a domain through Cloudflare and make the application available to users worldwide.

This deployment uses only a small number of Azure services, yet it demonstrates the core workflow used by many production applications.

---

# Best Practices

- Use meaningful names for Azure resources.
- Deploy resources in the region closest to your users.
- Separate production and development environments.
- Understand subscription boundaries before deploying resources.
- Monitor costs regularly.
- Remove unused resources to avoid unnecessary charges.
- Learn the Azure Portal before moving to automation tools.

---

# Common Mistakes

### Confusing Tenants and Subscriptions

A tenant manages identities, while a subscription manages billing and cloud resources.

---

### Creating Resources in the Wrong Region

Moving resources between regions can be difficult or require redeployment.

---

### Leaving Unused Resources Running

Virtual Machines, Public IPs, and other resources may continue to generate charges while allocated.

---

### Trying to Learn Every Azure Service

Azure contains hundreds of services. Focus first on the services required for your applications.

---

### Ignoring Resource Organization

Poor organization makes permissions, billing, and maintenance more difficult as cloud environments grow.

---

# Summary

Microsoft Azure is a comprehensive cloud platform that enables organizations to build and manage infrastructure without owning physical hardware. Azure organizes resources through a hierarchy consisting of Management Groups, Tenants, Subscriptions, Resource Groups, and Resources. Understanding this structure, along with the Azure Portal, regions, availability zones, and the platform's core services, provides the foundation for deploying and managing cloud infrastructure effectively.

---

## Next Chapter

➡️ **04 - Resource Groups**
