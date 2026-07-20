---
sidebar_label: Why Linux?
sidebar_position: 1
---


# Why Linux?

### Overview

Linux is one of the most influential technologies in modern computing. It powers websites, cloud platforms, smartphones, supercomputers, embedded devices, networking equipment, and millions of servers around the world.

Whether you are deploying a Node.js application, configuring Nginx, working with Docker, or managing cloud infrastructure, Linux is the operating system you will interact with most often.

This chapter introduces Linux from a beginner's perspective and explains why learning Linux is one of the best investments for software developers, backend engineers, DevOps engineers, and system administrators.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what Linux is.
- Learn how Linux originated.
- Understand why Linux became the standard operating system for servers.
- Identify where Linux is used today.
- Understand why Ubuntu Server is widely used in cloud environments.
- Explain why Linux knowledge is essential for modern software development.

---

## What is Linux?

Linux is an **open-source operating system kernel** originally created by **Linus Torvalds** in 1991.

> **Important**
>
> Technically, Linux is **not the complete operating system**. Linux is the **kernel**, while the complete operating system consists of the Linux kernel along with system utilities, libraries, package managers, and other software.

When people say:

> "I use Linux."

they usually mean a Linux-based operating system such as:

- Ubuntu
- Debian
- Fedora
- Arch Linux
- Rocky Linux
- AlmaLinux

Each of these distributions uses the Linux kernel but provides different tools, software, and release strategies.

---

## A Brief History of Linux

Before Linux existed, UNIX was the dominant operating system used in universities, research institutions, and enterprise environments.

Although UNIX was powerful, it was expensive and proprietary.

In the early 1980s, Richard Stallman started the **GNU Project** with the goal of creating a completely free operating system.

The GNU Project successfully created many essential tools such as:

- GCC Compiler
- Bash Shell
- Core Utilities
- GNU Debugger
- Libraries

However, it still lacked a production-ready kernel.

In 1991, Linus Torvalds, a computer science student from Finland, began developing a hobby operating system kernel.

He released the first version publicly, allowing developers around the world to contribute.

Over time, the GNU tools combined with the Linux kernel became what we commonly refer to today as **Linux** or **GNU/Linux**.

---

## Why Linux Became So Popular

Linux grew rapidly because it solved many problems faced by developers and organizations.

### 1. Open Source

Anyone can:

- View the source code.
- Study it.
- Modify it.
- Distribute it.

This encourages innovation and allows companies to customize Linux for their own needs.

---

### 2. Stability

Linux systems are designed to run continuously for long periods without requiring frequent restarts.

Many production servers remain operational for months or even years, restarting only for planned maintenance or major kernel updates.

This makes Linux ideal for production workloads.

---

### 3. Performance

Linux is lightweight and efficient.

It consumes fewer system resources compared to many desktop-oriented operating systems.

This means:

- Lower memory usage
- Better CPU utilization
- Faster networking performance
- Higher scalability

These characteristics are especially valuable for cloud servers where resources directly impact cost.

---

### 4. Security

Linux follows a strong security model based on:

- User permissions
- Group permissions
- File ownership
- Process isolation
- Least privilege

Because Linux is open source, vulnerabilities are often discovered and patched quickly by the global community.

---

### 5. Flexibility

Linux can run on devices ranging from tiny embedded boards with limited memory to large cloud servers with hundreds of CPU cores.

The same operating system family powers:

- Raspberry Pi
- Home routers
- Android devices
- Enterprise servers
- Cloud infrastructure
- Supercomputers

---

### 6. Community Support

Linux has one of the largest technical communities in the world.

There are extensive resources available, including:

- Official documentation
- Community forums
- Technical blogs
- Open-source projects
- Tutorials
- Books

This makes troubleshooting and learning significantly easier.

---

## Where Linux Is Used Today

Linux is used in almost every major area of computing.

| Industry         | Example                                                        |
| ---------------- | -------------------------------------------------------------- |
| Cloud Computing  | AWS, Azure, Google Cloud virtual machines                      |
| Web Servers      | Nginx, Apache, Node.js servers                                 |
| Mobile Devices   | Android uses the Linux kernel                                  |
| Supercomputers   | The majority of the world's top supercomputers run Linux       |
| Containers       | Docker containers typically run Linux-based environments       |
| Kubernetes       | Kubernetes clusters are primarily deployed on Linux            |
| Embedded Systems | Smart TVs, routers, IoT devices                                |
| Cybersecurity    | Penetration testing and security distributions like Kali Linux |

Learning Linux opens opportunities across all of these domains.

---

## Why Developers Should Learn Linux

Even if you primarily develop applications on Windows or macOS, production deployments are commonly performed on Linux.

A typical backend deployment might look like:

```text
Developer
     │
     ▼
GitHub Repository
     │
     ▼
Linux Server
     │
     ▼
Node.js Application
     │
     ▼
PM2 Process Manager
     │
     ▼
Nginx Reverse Proxy
     │
     ▼
Internet Users
```

Understanding Linux enables you to:

- Deploy applications confidently.
- Debug production issues.
- Configure servers securely.
- Automate deployments.
- Work effectively with cloud platforms.
- Understand DevOps workflows.

Without Linux knowledge, many deployment tasks become dependent on tutorials rather than understanding.

---

## Why We Are Using Ubuntu Server

Throughout this handbook, the primary examples will use **Ubuntu Server**.

Ubuntu is one of the most widely adopted Linux distributions because it provides:

- Long Term Support (LTS) releases
- Excellent documentation
- Large community support
- Extensive software repositories
- Strong cloud integration
- Beginner-friendly package management

Major cloud providers offer official Ubuntu images that are ready for deployment in minutes.

For beginners, Ubuntu provides an excellent balance between simplicity and production readiness.

---

## Key Takeaways

- Linux is the foundation of modern server infrastructure.
- Technically, Linux refers to the kernel, while distributions provide the complete operating system.
- Linux is open source, stable, secure, and highly customizable.
- Most cloud servers, web servers, containers, and DevOps platforms rely on Linux.
- Learning Linux is an essential skill for backend development, cloud engineering, and system administration.
- Ubuntu Server will be the primary Linux distribution used throughout this handbook.

---

## Summary

Linux has transformed from a student project into the operating system that powers much of the modern internet. Its reliability, performance, security model, and flexibility have made it the preferred choice for servers, cloud computing, and enterprise infrastructure.

As you progress through this handbook, you will move from understanding _why_ Linux matters to learning _how_ to administer Linux servers, deploy applications, configure services, and troubleshoot real-world production environments.

The next chapter introduces the concept of an **Operating System**, explaining the relationship between hardware, the kernel, system software, and applications.

---
