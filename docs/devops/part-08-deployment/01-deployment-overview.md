---
sidebar_label: Deployment Overview
sidebar_position: 1
---


# Deployment Overview

### Overview

So far in this handbook, we have learned how to:

- Work with Linux servers
- Configure networking
- Secure servers
- Build Node.js applications
- Configure Nginx
- Deploy applications on Azure
- Configure domains
- Protect applications with Cloudflare

Now it's time to combine everything into a real production deployment.

Deployment is the process of making an application available for users by moving it from a development environment to a production server.

Instead of running your application only on your local computer:

```text id="dep01"
Developer Laptop

↓

Node.js Application
```

you deploy it to a server where users can access it from anywhere in the world.

```text id="dep02"
Users

↓

Internet

↓

Cloudflare

↓

Azure VM

↓

Nginx

↓

Node.js
```

Deployment is one of the most important responsibilities of a backend or full-stack developer because writing code is only half the job—the application must also run reliably in production.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what deployment is.
- Learn why deployment is necessary.
- Understand development, staging, and production environments.
- Learn the deployment lifecycle.
- Understand common deployment strategies.
- Learn the overall deployment architecture.
- Prepare for the practical deployment chapters.

---

## What is Deployment?

Deployment is the process of moving an application from the developer's machine to a server where users can access it.

Simple workflow:

```text id="dep03"
Write Code

↓

Test

↓

Deploy

↓

Users Access Application
```

Deployment involves much more than copying files. It also includes:

- Configuring servers
- Installing dependencies
- Setting environment variables
- Configuring web servers
- Securing the application
- Monitoring the application
- Updating applications safely

---

## Why Do We Need Deployment?

Applications running only on a developer's laptop are not accessible to users.

Without deployment:

```text id="dep04"
Developer Laptop

↓

Application

↓

Only Developer Can Access
```

With deployment:

```text id="dep05"
Users

↓

Internet

↓

Production Server

↓

Application
```

Deployment makes the application available to customers, clients, or internal users.

---

## Development vs Production

Software is usually developed in different environments.

| Environment | Purpose                             |
| ----------- | ----------------------------------- |
| Development | Writing and testing code            |
| Staging     | Final testing before release        |
| Production  | Live environment used by real users |

Each environment serves a different purpose.

---

## Development Environment

The development environment is where programmers build the application.

Typical setup:

```text id="dep06"
VS Code

↓

Node.js

↓

Local Database

↓

localhost:3000
```

Characteristics:

- Frequent code changes
- Debugging enabled
- Local databases
- Experimental features
- Suitable only for developers

---

## Staging Environment

The staging environment closely resembles production.

```text id="dep07"
Developer

↓

Staging Server

↓

Testing

↓

Production
```

It allows teams to verify changes before exposing them to real users.

Common uses include:

- Client approval
- Final QA testing
- Performance testing
- Integration testing

---

## Production Environment

Production is the live environment accessed by users.

```text id="dep08"
Real Users

↓

Production Server

↓

Live Application
```

Characteristics:

- High availability
- Security
- Monitoring
- Backups
- Stable releases
- Minimal downtime

---

## Typical Deployment Lifecycle

Most deployments follow a similar sequence.

```text id="dep09"
Write Code

↓

Commit

↓

Push to Git

↓

Deploy

↓

Test

↓

Users
```

Larger organizations may include additional approval and testing stages.

---

## Components of a Production Deployment

A typical Node.js deployment includes multiple components.

```text id="dep10"
Application
    │
    ▼
Node.js
    │
    ▼
PM2
    │
    ▼
Nginx
    │
    ▼
Cloudflare
    │
    ▼
Internet
```

Each component performs a specific responsibility.

---

## Production Architecture

A complete deployment may look like this:

```text id="dep11"
Users
   │
   ▼
Cloudflare
   │
HTTPS
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
PM2
   │
   ▼
Node.js Application
   │
   ▼
MongoDB
```

This architecture combines the technologies covered throughout the previous parts of this handbook.

---

## Deployment Strategies

There are several ways to deploy applications.

| Strategy              | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| Manual Deployment     | Developer manually updates the server                                        |
| Automated Deployment  | Deployment performed using CI/CD pipelines                                   |
| Rolling Deployment    | Servers are updated gradually                                                |
| Blue-Green Deployment | Two production environments are maintained and traffic switches between them |
| Canary Deployment     | New version is released to a small percentage of users first                 |

For this handbook, the focus will primarily be on **manual deployment**, as it provides the foundation for understanding more advanced deployment strategies.

---

## Manual Deployment Workflow

A simple deployment process:

```text id="dep12"
Git Pull

↓

Install Dependencies

↓

Build

↓

Restart PM2

↓

Verify Website
```

This is suitable for small projects and learning environments.

---

## Automated Deployment (Overview)

In larger organizations, deployments are often automated.

```text id="dep13"
Git Push

↓

CI/CD Pipeline

↓

Build

↓

Tests

↓

Deploy
```

Automation reduces manual effort and helps maintain consistency.

---

## What Happens During Deployment?

Deployment involves several tasks.

| Task                  | Purpose                               |
| --------------------- | ------------------------------------- |
| Copy Code             | Move latest application to server     |
| Install Packages      | Download required dependencies        |
| Build Application     | Generate production build if required |
| Configure Environment | Load production configuration         |
| Start Application     | Launch the application                |
| Configure Web Server  | Route HTTP/HTTPS traffic              |
| Verify Deployment     | Ensure everything works correctly     |

Each step is important for a successful deployment.

---

## Deployment Checklist

Before deploying an application, administrators should verify:

- Server is updated.
- Required software is installed.
- Environment variables are configured.
- Database is accessible.
- Firewall rules are correct.
- Domain is configured.
- SSL certificates are valid.
- PM2 configuration is ready.
- Nginx configuration is tested.
- Backups are available.

A checklist helps reduce deployment errors.

---

## Goals of a Good Deployment

A successful deployment should provide:

- High availability
- Minimal downtime
- Secure communication
- Easy rollback
- Fast recovery
- Scalability
- Monitoring
- Reliable performance

These goals guide production deployment practices.

---

## Real-World Example

Suppose a company develops an Express.js application locally.

Development:

```text id="dep14"
VS Code

↓

localhost:3000
```

Before releasing the application:

- Code is committed to Git.
- The latest version is copied to an Azure Virtual Machine.
- Dependencies are installed.
- Environment variables are configured.
- Nginx is configured as a reverse proxy.
- PM2 starts the application.
- Cloudflare provides DNS, HTTPS, and CDN services.
- Users access the application through the domain name.

This transforms a locally developed application into a production-ready service accessible worldwide.

---

## Best Practices

- Keep development and production environments separate.
- Test thoroughly before deploying.
- Store sensitive configuration in environment variables.
- Use a process manager such as PM2.
- Place Nginx in front of the application.
- Secure the application with HTTPS.
- Keep backups before major deployments.
- Verify deployment after every release.
- Maintain version control for all application code.

---

## Common Mistakes

#### Deploying Without Testing

Unverified changes can introduce production issues and downtime.

---

#### Editing Files Directly in Production

Production servers should not become the primary place for development. Make changes in version control and deploy them properly.

---

#### Forgetting Environment Variables

Missing or incorrect environment variables can prevent the application from starting.

---

#### Restarting Instead of Planning

Restarting services without understanding the impact can disconnect users unnecessarily. Use controlled deployment procedures whenever possible.

---

#### Ignoring Rollback Plans

Every deployment should have a strategy to restore the previous working version if something goes wrong.

---

## Summary

Deployment is the process of making an application available to users by moving it from a development environment to a production server. A successful deployment involves much more than transferring application files—it includes configuring servers, web servers, environment variables, security, monitoring, and process management. Understanding the deployment lifecycle, production architecture, and deployment strategies provides the foundation for the practical chapters that follow, where we will deploy a complete Node.js application step by step.

---

### Next Chapter

➡️ **02 - Preparing Server**
