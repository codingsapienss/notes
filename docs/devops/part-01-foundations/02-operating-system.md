---
sidebar_label: Operating System
sidebar_position: 2
---


# Operating System

## Overview

Before learning Linux administration, it is important to understand what an **Operating System (OS)** actually is.

Every application you use—whether it is Google Chrome, Visual Studio Code, Node.js, or a game—depends on the operating system to communicate with the computer's hardware.

Without an operating system, every application would have to know how to interact with processors, memory, disks, keyboards, network cards, and countless other hardware devices directly.

The operating system acts as a bridge between **hardware** and **software**, making computers easier, safer, and more efficient to use.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand the purpose of an operating system.
- Identify the major components of a computer system.
- Understand how applications communicate with hardware.
- Learn the responsibilities of an operating system.
- Understand the difference between the operating system and the kernel.
- Understand why Linux is considered an operating system family.

---

# What is an Operating System?

An **Operating System (OS)** is system software that manages a computer's hardware and provides services that allow applications to run safely and efficiently.

Think of the operating system as the **manager of the entire computer**.

It is responsible for deciding:

- Which application gets CPU time.
- How memory is allocated.
- Where files are stored.
- Which users can access specific resources.
- How devices communicate.
- How applications interact with hardware.

Without an operating system, modern computers would be extremely difficult to use.

---

# Why Do We Need an Operating System?

Imagine writing a simple program that prints:

```javascript
console.log("Hello World");
```

Even this simple program requires many operations behind the scenes:

- Loading the application from storage.
- Allocating memory.
- Scheduling CPU execution.
- Writing text to the terminal.
- Releasing allocated resources after execution.

Instead of handling these tasks manually, the operating system performs them automatically.

This allows developers to focus on building applications rather than managing hardware.

---

# Computer Architecture

A simplified computer system looks like this:

```text
+--------------------------------------+
|            Applications              |
|--------------------------------------|
| Chrome | VS Code | Node.js | Python  |
+--------------------------------------+
|         Operating System             |
+--------------------------------------+
| CPU | RAM | Disk | Network | Devices |
+--------------------------------------+
```

Applications communicate with the operating system.

The operating system communicates with the hardware.

Applications generally do **not** communicate directly with hardware.

---

# Major Responsibilities of an Operating System

An operating system performs many important tasks.

## 1. Process Management

Every running application becomes a **process**.

The operating system:

- Starts processes.
- Stops processes.
- Schedules CPU time.
- Switches between multiple running applications.
- Prevents processes from interfering with one another.

For example:

If Google Chrome, Spotify, VS Code, and Node.js are running simultaneously, the operating system continuously decides which process should use the CPU.

---

## 2. Memory Management

RAM is a limited resource.

The operating system manages memory by:

- Allocating memory to applications.
- Preventing one application from accessing another application's memory.
- Reclaiming unused memory.
- Managing virtual memory and swap space.

Without proper memory management, one faulty application could crash the entire computer.

---

## 3. File Management

The operating system organizes data using a **file system**.

It manages:

- Files
- Directories
- Permissions
- Storage devices
- File access

When you save a document, the operating system decides where it is physically stored on the disk.

---

## 4. Device Management

A computer contains many hardware devices, including:

- Keyboard
- Mouse
- Monitor
- Printer
- SSD
- Network Card
- USB Devices

The operating system communicates with these devices using **device drivers**.

Applications do not need to know how each hardware component works internally.

---

## 5. Security

The operating system protects the computer by providing:

- User accounts
- Authentication
- Authorization
- File permissions
- Process isolation
- Encryption support

Linux is particularly well known for its robust security model.

---

## 6. Networking

Modern operating systems include built-in networking capabilities.

They manage:

- IP addresses
- Network interfaces
- TCP/IP communication
- DNS resolution
- Firewall rules
- Internet connectivity

Without these services, accessing websites or communicating with remote servers would not be possible.

---

# How Applications Communicate with Hardware

Applications cannot normally control hardware directly.

Instead, they request services from the operating system.

A simplified workflow looks like this:

```text
Application
      │
      ▼
Operating System
      │
      ▼
Device Driver
      │
      ▼
Hardware
```

For example, when a web browser wants to save a downloaded file:

1. The browser requests the operating system to create a file.
2. The operating system validates the request.
3. The file system determines where the data should be stored.
4. The storage driver writes the data to the disk.
5. The operating system reports success back to the browser.

This layered approach improves both security and reliability.

---

# Operating System vs Kernel

These two terms are often confused.

## Operating System

The operating system includes:

- Kernel
- Shell
- System utilities
- Package manager
- Libraries
- File system tools
- User applications

It provides the complete environment required to operate a computer.

---

## Kernel

The **kernel** is the core component of the operating system.

It is responsible for:

- CPU scheduling
- Memory management
- Device communication
- Process management
- System calls
- Hardware interaction

The kernel is always running while the system is powered on.

It acts as the bridge between software and hardware.

---

# Common Operating Systems

Some popular operating systems include:

| Operating System | Common Usage                                  |
| ---------------- | --------------------------------------------- |
| Windows          | Personal computers, gaming, business          |
| macOS            | Apple computers                               |
| Linux            | Servers, cloud, embedded systems, development |
| Android          | Smartphones and tablets                       |
| iOS              | Apple mobile devices                          |

Although these operating systems serve similar purposes, they differ significantly in design, licensing, and target users.

---

# Real-World Example

Suppose you start an Express.js application on an Ubuntu server.

```bash
node app.js
```

Several operations occur behind the scenes:

1. The operating system loads the Node.js executable into memory.
2. A new process is created.
3. Memory is allocated.
4. The CPU scheduler assigns execution time.
5. The operating system opens the network port requested by the application.
6. Incoming network requests are delivered to the Node.js process.
7. When the application exits, the operating system releases allocated resources.

Although you only executed one command, the operating system coordinated every step required to run the application.

---

# Best Practices

- Learn operating system fundamentals before studying server administration.
- Understand that applications rely on the operating system for hardware access.
- Avoid thinking of the operating system as just a graphical interface; it performs many critical background tasks.
- Remember that the kernel is only one part of the complete operating system.

---

# Common Mistakes

### Mistaking Linux for a Complete Operating System

Linux is technically the **kernel**, while distributions such as Ubuntu provide the complete operating system.

---

### Assuming Applications Access Hardware Directly

Most applications communicate with hardware through the operating system, not directly.

---

### Ignoring Operating System Responsibilities

Tasks such as memory allocation, process scheduling, networking, and file management are handled automatically by the operating system, allowing applications to remain portable and secure.

---

# Summary

The operating system is the foundation upon which every application runs. It manages hardware resources, provides common services, enforces security, and creates a consistent environment for software development.

Understanding the operating system helps explain why Linux is so powerful in server environments and prepares you to explore the internal architecture of Linux itself.

In the next chapter, you will learn how the Linux operating system is structured internally, including the roles of the kernel, shell, system libraries, user space, and hardware.

---

## Next Chapter

➡️ **03 - Linux Architecture**
