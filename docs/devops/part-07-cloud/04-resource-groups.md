---
sidebar_label: Resource Groups
sidebar_position: 4
---


# Resource Groups

### Overview

In the previous chapter, we learned about Azure's hierarchy:

```text id="azrg01"
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

We also learned that every Azure resource belongs to a subscription.

However, subscriptions alone are not enough to organize hundreds or even thousands of cloud resources.

Imagine deploying an application that contains:

- Virtual Machine
- Public IP
- Virtual Network
- Network Security Group
- Storage Account
- Backup Services
- Monitoring

Now imagine deploying **20 different applications**.

Without proper organization, finding related resources would become extremely difficult.

To solve this problem, Azure introduces **Resource Groups**.

A Resource Group acts as a logical container that groups related Azure resources together.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Resource Group is.
- Learn why Resource Groups exist.
- Understand how Azure resources are organized.
- Learn Resource Group lifecycle management.
- Understand naming strategies.
- Follow production best practices.

---

## What is a Resource Group?

A **Resource Group (RG)** is a logical container used to organize related Azure resources.

Think of it as a project folder.

Example:

```text id="azrg02"
Resource Group

├── Virtual Machine
├── Public IP
├── Virtual Network
├── Network Security Group
├── Storage Account
└── Backup Vault
```

The Resource Group itself does not perform any computation.

It simply organizes resources.

---

## Why Resource Groups?

Suppose your company hosts three applications.

```text id="azrg03"
E-Commerce

CRM

HR Portal
```

Each application requires several Azure resources.

Without Resource Groups:

```text id="azrg04"
Subscription

├── VM1
├── VM2
├── VM3
├── Storage1
├── Storage2
├── PublicIP1
├── PublicIP2
├── NSG1
├── NSG2
├── VNet1
├── VNet2
└── ...
```

Finding resources for a specific application becomes difficult.

With Resource Groups:

```text id="azrg05"
Subscription

├── RG-ECommerce
│     ├── VM
│     ├── Storage
│     ├── Public IP
│     └── NSG
│
├── RG-CRM
│     ├── VM
│     ├── Storage
│     └── NSG
│
└── RG-HR
      ├── VM
      ├── Storage
      └── Database
```

Resources are much easier to locate and manage.

---

## Resource Group Hierarchy

Every Azure resource belongs to exactly one Resource Group.

```text id="azrg06"
Subscription
      │
      ▼
Resource Group
      │
 ┌────┼──────┐
 ▼    ▼      ▼
VM  Storage  Network
```

Although resources inside a Resource Group can interact with resources in other groups, each resource has only one parent Resource Group.

---

## What Can Be Stored in a Resource Group?

Almost every Azure service is created inside a Resource Group.

Examples include:

- Virtual Machines
- Public IP Addresses
- Virtual Networks
- Managed Disks
- Storage Accounts
- Databases
- Network Security Groups
- Load Balancers
- Application Gateways
- Azure Functions

This makes the Resource Group the primary organizational unit for Azure deployments.

---

## Creating a Resource Group

Using the Azure Portal, the basic workflow is:

```text id="azrg07"
Azure Portal

↓

Resource Groups

↓

Create

↓

Name

↓

Choose Subscription

↓

Choose Region

↓

Create
```

After creation, resources can be deployed into the group.

---

## Resource Group Region

When creating a Resource Group, Azure asks for a region.

Example:

```text id="azrg08"
Central India

West Europe

East US
```

The Resource Group's region stores its metadata.

**Important:**

The region of the Resource Group does **not** require all resources inside it to be deployed in the same region.

Example:

```text id="azrg09"
Resource Group

├── VM → Central India
├── Storage → Central India
└── Backup → West Europe
```

Although technically possible, keeping related resources in the same region is generally simpler and can reduce latency and data transfer costs.

---

## Resource Group Naming

A consistent naming convention makes cloud environments easier to manage.

Examples:

```text id="azrg10"
rg-production

rg-development

rg-staging

rg-ecommerce

rg-api

rg-monitoring
```

For large organizations:

```text id="azrg11"
rg-prod-india-api

rg-dev-web

rg-test-payment

rg-monitoring-prod
```

Meaningful names reduce confusion as the number of resources grows.

---

## Lifecycle Management

One major advantage of Resource Groups is lifecycle management.

Suppose an application contains:

```text id="azrg12"
VM

Storage

Public IP

NSG

Virtual Network
```

When the application is no longer needed:

```text id="azrg13"
Delete Resource Group

↓

All Resources Deleted
```

This simplifies cleanup of temporary environments such as development or testing.

> **Warning:** Deleting a Resource Group permanently deletes all resources contained within it unless specific recovery mechanisms exist for those resources.

---

## Permissions

Permissions can be assigned at the Resource Group level.

Example:

```text id="azrg14"
RG-Production

↓

Admin Team
```

```text id="azrg15"
RG-Development

↓

Developers
```

Benefits:

- Easier access management
- Separation between environments
- Reduced administrative effort

Azure uses Role-Based Access Control (RBAC) to manage these permissions, which is covered in more advanced Azure topics.

---

## Tags vs Resource Groups

Both Resource Groups and Tags help organize resources, but they serve different purposes.

| Resource Groups                     | Tags                             |
| ----------------------------------- | -------------------------------- |
| Organize resources into containers  | Add metadata to resources        |
| Every resource belongs to one group | Resources can have multiple tags |
| Used for lifecycle management       | Used for filtering and reporting |
| Required                            | Optional                         |

Example tags:

```text id="azrg16"
Environment = Production

Department = Finance

Owner = Backend Team

Project = E-Commerce
```

Tags complement Resource Groups rather than replacing them.

---

## Resource Group Architecture

Example deployment:

```text id="azrg17"
Subscription
       │
       ▼
RG-ECommerce
       │
 ┌─────┼─────────────┐
 ▼     ▼             ▼
VM   Public IP    Storage
 │
 ▼
Nginx
 │
 ▼
Node.js
```

Everything related to the application remains together.

---

## Multiple Applications

Large organizations often create one Resource Group per application or environment.

```text id="azrg18"
Subscription

├── rg-ecommerce-prod
├── rg-ecommerce-dev
├── rg-crm-prod
├── rg-crm-dev
├── rg-monitoring
└── rg-backups
```

This structure improves organization and access control.

---

## Typical Production Architecture

```text id="azrg19"
Azure Subscription
         │
         ▼
Resource Group
         │
 ┌───────┼─────────────┐
 ▼       ▼             ▼
Network  Compute    Storage
   │        │           │
   ▼        ▼           ▼
 VNet      VM       Storage Account
             │
             ▼
         Nginx
             │
             ▼
         Node.js
```

The Resource Group serves as the logical boundary for the application's Azure resources.

---

## Real-World Example

Suppose your company hosts two products:

- Customer Portal
- Internal HR System

Instead of placing every resource into one large Resource Group, the infrastructure is organized as follows:

```text id="azrg20"
Subscription

├── rg-customer-portal
│      ├── VM
│      ├── Storage
│      ├── Public IP
│      └── NSG
│
└── rg-hr-system
       ├── VM
       ├── Database
       ├── Storage
       └── NSG
```

When the HR system is retired, only its Resource Group is removed. The Customer Portal continues operating without any changes.

---

## Best Practices

- Create separate Resource Groups for different applications or environments.
- Use consistent naming conventions.
- Keep related resources together.
- Apply tags for cost tracking and reporting.
- Assign permissions at the Resource Group level whenever practical.
- Review resources before deleting a Resource Group.
- Remove unused Resource Groups to reduce unnecessary costs.

---

## Common Mistakes

#### Putting Every Resource into One Resource Group

Large Resource Groups become difficult to manage and reduce organizational clarity.

---

#### Creating Too Many Small Resource Groups

Avoid creating a separate Resource Group for every individual resource unless there is a specific operational reason.

---

#### Using Unclear Names

Names such as `test1`, `newgroup`, or `temp` make environments difficult to understand over time.

---

#### Deleting a Resource Group Without Reviewing Its Contents

Deleting a Resource Group removes all contained resources, which may include production workloads.

---

#### Ignoring Tags

Tags make it easier to filter resources, allocate costs, and identify ownership across large Azure environments.

---

## Summary

Resource Groups are the primary organizational building block in Microsoft Azure. They provide a logical container for related resources, simplify lifecycle management, support permission assignment, and improve the organization of cloud environments. By grouping resources according to applications or environments and following consistent naming and tagging strategies, administrators can manage Azure infrastructure more effectively and reduce operational complexity.

---

### Next Chapter

➡️ **05 - Virtual Machines**
