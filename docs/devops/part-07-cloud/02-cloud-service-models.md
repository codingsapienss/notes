---
sidebar_label: Cloud Service Models
sidebar_position: 2
---


# Cloud Service Models

### Overview

In the previous chapter, we learned what cloud computing is and why organizations moved from traditional on-premises infrastructure to the cloud.

However, cloud providers do not offer just one type of service.

Some customers want complete control over their servers.

Others simply want to deploy an application without managing operating systems.

Some only need ready-to-use software such as email or office applications.

To meet these different needs, cloud providers offer several **Cloud Service Models**.

The four most common models are:

- Infrastructure as a Service (IaaS)
- Platform as a Service (PaaS)
- Software as a Service (SaaS)
- Function as a Service (FaaS)

Understanding these models is essential because nearly every cloud service belongs to one of them.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand why cloud service models exist.
- Learn the differences between IaaS, PaaS, SaaS, and FaaS.
- Understand the Shared Responsibility Model.
- Identify real-world examples of each service model.
- Determine which model best fits different scenarios.

---

## Why Different Service Models?

Imagine you want to open a restaurant.

You have several options.

Option 1:

Buy land.

Construct the building.

Purchase kitchen equipment.

Hire staff.

Manage everything yourself.

Option 2:

Rent a fully equipped kitchen.

Only prepare food.

Option 3:

Order ready-made food and simply serve customers.

Each option offers a different balance between **control** and **responsibility**.

Cloud computing works in a similar way.

---

## The Cloud Stack

Every application depends on several layers.

```text id="cj8s1k"
Applications
        │
Runtime
        │
Operating System
        │
Virtual Machines
        │
Physical Servers
        │
Networking
        │
Storage
```

Depending on the cloud service model, different layers are managed by either the cloud provider or the customer.

---

## Infrastructure as a Service (IaaS)

Infrastructure as a Service provides virtual infrastructure.

The cloud provider manages:

- Physical servers
- Storage
- Networking
- Virtualization

The customer manages:

- Operating System
- Updates
- Security patches
- Installed software
- Applications
- Data

Architecture:

```text id="ybm6wd"
Customer
   │
   ├── Applications
   ├── Runtime
   ├── Operating System
   │
Cloud Provider
   ├── Virtual Machines
   ├── Storage
   ├── Networking
   └── Physical Hardware
```

Examples:

- Azure Virtual Machines
- Amazon EC2
- Google Compute Engine

---

## Advantages of IaaS

- Maximum flexibility
- Full server control
- Install any software
- Choose operating system
- Suitable for custom applications

---

## Disadvantages of IaaS

- Customer manages updates
- Customer secures the operating system
- Higher operational responsibility
- More maintenance required

---

## Real Example of IaaS

Everything learned in the previous parts of this handbook fits into the IaaS model.

Example deployment:

```text id="d9sh2a"
Azure Virtual Machine
        │
Ubuntu Linux
        │
Nginx
        │
Node.js
        │
MongoDB
```

You are responsible for configuring and maintaining every software component.

---

## Platform as a Service (PaaS)

Platform as a Service removes much of the infrastructure management.

The cloud provider manages:

- Servers
- Virtual Machines
- Operating System
- Runtime
- Updates

The customer manages:

- Application code
- Configuration
- Data

Architecture:

```text id="r4m2oq"
Customer
   │
   ├── Application
   └── Data

Cloud Provider
   ├── Runtime
   ├── Operating System
   ├── Virtual Machines
   ├── Networking
   └── Hardware
```

Developers focus primarily on writing code.

Examples:

- Azure App Service
- Google App Engine
- AWS Elastic Beanstalk

---

## Advantages of PaaS

- Faster deployments
- No server maintenance
- Automatic operating system updates
- Built-in scaling
- Reduced operational overhead

---

## Disadvantages of PaaS

- Less control
- Platform restrictions
- Limited operating system customization
- Vendor-specific features

---

## Real Example of PaaS

Instead of creating an Ubuntu VM and installing Node.js manually:

```text id="tm0mx9"
Write Code

↓

Push to Azure App Service

↓

Application Runs
```

The platform handles the underlying infrastructure.

---

## Software as a Service (SaaS)

Software as a Service provides complete applications over the internet.

Users simply access the software.

The cloud provider manages everything.

Architecture:

```text id="mn84re"
User

↓

Browser

↓

Software

↓

Cloud Provider Manages Everything
```

Examples:

- Microsoft 365
- Gmail
- Dropbox
- Slack
- Zoom
- Salesforce

No server management is required from the user.

---

## Advantages of SaaS

- No installation
- Automatic updates
- Accessible from anywhere
- Minimal maintenance
- Quick adoption

---

## Disadvantages of SaaS

- Limited customization
- Subscription costs
- Dependence on the provider
- Limited infrastructure control

---

## Function as a Service (FaaS)

Function as a Service allows developers to deploy individual functions rather than complete applications.

The function runs only when triggered.

Workflow:

```text id="9vxjlwm"
Event

↓

Cloud Function

↓

Execute Code

↓

Return Response

↓

Stop Running
```

Examples:

- Azure Functions
- AWS Lambda
- Google Cloud Functions

---

## Advantages of FaaS

- No server management
- Pay only when functions execute
- Automatic scaling
- Ideal for event-driven workloads

---

## Disadvantages of FaaS

- Execution time limits
- Cold starts
- Stateless execution
- Not suitable for every application

---

## Shared Responsibility Model

One of the most important concepts in cloud computing is the **Shared Responsibility Model**.

The cloud provider and the customer each have responsibilities.

```text id="mjlwm02"
Cloud Provider

↓

Infrastructure

↓

Customer

↓

Applications & Data
```

As you move from IaaS to SaaS, more responsibility shifts to the provider.

---

## Responsibility Comparison

| Component         | IaaS     | PaaS     | SaaS       |
| ----------------- | -------- | -------- | ---------- |
| Applications      | Customer | Customer | Provider   |
| Data              | Customer | Customer | Provider\* |
| Runtime           | Customer | Provider | Provider   |
| Operating System  | Customer | Provider | Provider   |
| Virtual Machines  | Provider | Provider | Provider   |
| Storage           | Provider | Provider | Provider   |
| Networking        | Provider | Provider | Provider   |
| Physical Hardware | Provider | Provider | Provider   |

> \*Although SaaS providers manage the infrastructure, customers remain responsible for the data they create, user access, and how the service is used.

---

## Comparing All Service Models

| Feature                | IaaS   | PaaS   | SaaS    | FaaS      |
| ---------------------- | ------ | ------ | ------- | --------- |
| Server Management      | Yes    | No     | No      | No        |
| OS Management          | Yes    | No     | No      | No        |
| Write Application Code | Yes    | Yes    | No      | Yes       |
| Infrastructure Control | High   | Medium | Low     | Very Low  |
| Deployment Speed       | Medium | Fast   | Instant | Very Fast |

---

## Which Model Should You Choose?

Choose **IaaS** if:

- You need complete server control.
- You manage custom infrastructure.
- You want to install your own software.

Choose **PaaS** if:

- You only want to build and deploy applications.
- You do not want to manage operating systems.

Choose **SaaS** if:

- You simply need software to use.

Choose **FaaS** if:

- Your application is event-driven.
- Small independent functions are sufficient.

---

## Real-World Example

Suppose you are building an online shopping platform.

#### IaaS

```text id="vjlwm3"
Azure VM

↓

Ubuntu

↓

Nginx

↓

Node.js

↓

MongoDB
```

You manage everything.

---

#### PaaS

```text id="jlwm4"
Azure App Service

↓

Upload Node.js App

↓

Application Runs
```

Azure manages the infrastructure.

---

#### SaaS

Instead of building your own email system:

```text id="jlwm5"
Use Microsoft 365

or

Use Gmail
```

The provider delivers the complete application.

---

#### FaaS

When a customer uploads an image:

```text id="jlwm6"
Image Upload

↓

Azure Function

↓

Resize Image

↓

Store Result
```

The function runs only for the duration of the task.

---

## Best Practices

- Choose the simplest service model that satisfies your requirements.
- Understand which responsibilities remain with your organization.
- Consider long-term maintenance before selecting a platform.
- Evaluate scalability, cost, and operational overhead.
- Avoid managing infrastructure that your application does not require.

---

## Common Mistakes

#### Choosing IaaS for Every Project

Not every application requires full server control. Managed platforms may reduce operational effort.

---

#### Assuming the Cloud Provider Handles Security Completely

Even in managed services, customers remain responsible for identity management, access control, application security, and data protection.

---

#### Ignoring Vendor Lock-In

Some PaaS and FaaS services rely on provider-specific features that can make migration more difficult.

---

#### Using FaaS for Long-Running Applications

Serverless functions are designed for short-lived, event-driven workloads rather than continuously running applications.

---

#### Selecting a Model Based Only on Cost

Operational complexity, maintenance, scalability, and developer productivity should also influence the decision.

---

## Summary

Cloud providers offer multiple service models to meet different infrastructure and application needs. Infrastructure as a Service (IaaS) provides the greatest flexibility and control, while Platform as a Service (PaaS) simplifies application deployment by managing the underlying infrastructure. Software as a Service (SaaS) delivers complete applications ready for use, and Function as a Service (FaaS) enables event-driven execution without server management. Understanding these models and the Shared Responsibility Model helps organizations choose the most appropriate cloud architecture for their workloads.

---

### Next Chapter

➡️ **03 - Azure Basics**
