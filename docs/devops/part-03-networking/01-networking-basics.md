---
sidebar_label: Networking Basics
sidebar_position: 1
---


# Networking Basics

### Overview

Every modern application depends on networking.

Whether you are opening a website, making an API request, connecting to a database, deploying a server on Azure, or accessing a Linux machine over SSH, data is constantly traveling between devices across a network.

Before learning TCP/IP, DNS, HTTP, SSL, or Cloud Infrastructure, it is essential to understand the fundamental concepts of networking.

This chapter introduces the building blocks of computer networks and explains how devices communicate with each other.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a computer network is.
- Learn why networking is important.
- Identify different types of networks.
- Understand clients and servers.
- Learn how data travels between devices.
- Understand networking hardware.
- Build a strong foundation for advanced networking topics.

---

## What is a Computer Network?

A **computer network** is a collection of two or more devices connected together so they can exchange information.

These devices may include:

- Computers
- Mobile phones
- Servers
- Routers
- Printers
- IoT devices
- Cloud virtual machines

Example:

```text id="g7m9la"
Laptop
    │
    │
Wi-Fi Router
    │
    │
Internet
    │
    │
Azure Server
```

Every time information moves between devices, networking is involved.

---

## Why Do We Need Networking?

Imagine if computers could not communicate.

You would not be able to:

- Browse websites
- Send emails
- Use WhatsApp
- Stream videos
- Play online games
- Access cloud servers
- Connect to databases
- Deploy web applications

Networking allows devices to exchange information quickly, securely, and reliably.

---

## Real-World Examples

You already use networking hundreds of times every day.

Examples include:

- Opening `google.com`
- Watching YouTube
- Using ChatGPT
- Connecting to GitHub
- Logging into an Azure Virtual Machine using SSH
- Calling an API from a Node.js application
- Uploading images to Cloudflare R2
- Connecting MongoDB Atlas to an application

All of these rely on networking.

---

## Types of Networks

Networks are commonly classified based on their size.

### Personal Area Network (PAN)

A **PAN** connects devices located very close to each other.

Examples:

- Phone and smartwatch
- Bluetooth headphones
- Wireless keyboard
- Fitness tracker

```text id="m5k2ha"
Phone
   │
Bluetooth
   │
Headphones
```

---

### Local Area Network (LAN)

A **LAN** connects devices within a limited area.

Examples:

- Home network
- Office network
- School
- College
- Computer lab

```text id="r8n3qw"
Laptop
     │
Desktop
     │
Wi-Fi Router
     │
Printer
```

Devices communicate at high speed because they are physically close.

---

### Metropolitan Area Network (MAN)

A **MAN** connects multiple LANs across a city.

Examples:

- University campuses
- Large corporate offices
- Government networks

---

### Wide Area Network (WAN)

A **WAN** connects devices over very large geographical distances.

The **Internet** is the world's largest WAN.

Example:

```text id="c4y8vm"
India
    │
    │
Internet
    │
    │
USA
```

Cloud providers such as Azure, AWS, and Google Cloud operate global WANs connecting data centers around the world.

---

## Client and Server

Networking commonly follows the **Client-Server Model**.

```text id="u2r6kp"
Client
   │ Request
   ▼
Server
   │ Response
   ▼
Client
```

#### Client

A client requests information.

Examples:

- Browser
- Mobile app
- Node.js application
- Postman
- curl

#### Server

A server provides information.

Examples:

- Nginx
- Node.js API
- Apache
- Database server
- File server

---

## Example: Opening a Website

Suppose you visit:

```text id="a7m3xe"
https://example.com
```

The communication looks like this:

```text id="n6k8tv"
Browser
    │
    ▼
Internet
    │
    ▼
Web Server
    │
HTML Response
    ▼
Browser
```

Your browser acts as the client, while the web server processes the request and returns the webpage.

---

## Data Communication

Networking is simply the exchange of data.

Every communication involves:

- Sender
- Receiver
- Data
- Communication medium

Example:

```text id="z4w9hj"
Phone
   │
Internet
   │
Server
```

The sender transmits data, and the receiver processes it.

---

## Wired vs Wireless Networks

### Wired Network

Uses physical cables.

Examples:

- Ethernet
- Fiber Optic

Advantages:

- Faster
- Lower latency
- More stable
- Less interference

---

### Wireless Network

Uses radio waves.

Examples:

- Wi-Fi
- Mobile networks
- Bluetooth

Advantages:

- Mobility
- Easy installation
- No physical cables

Trade-offs include higher latency and possible interference compared with wired networks.

---

## Network Devices

Several devices work together to make networking possible.

### Router

A router connects different networks together.

Example:

```text id="x9t4pl"
Home Network
      │
      ▼
Router
      │
      ▼
Internet
```

Every home and office network typically has a router.

---

### Switch

A switch connects devices within the same LAN.

```text id="v1m8df"
PC
 │
Switch
 │
Printer
 │
Server
```

Unlike a router, a switch does not route traffic between different networks.

---

### Modem

A modem connects your local network to your Internet Service Provider (ISP).

```text id="d8q5cn"
ISP
 │
Modem
 │
Router
 │
Laptop
```

In many home networks, the modem and router are combined into a single device.

---

## Network Topology

A topology describes how devices are connected.

Common examples include:

- Star Topology
- Bus Topology
- Ring Topology
- Mesh Topology

The most common topology today is the **Star Topology**, where all devices connect to a central switch or router.

```text id="f6y2kp"
      Router
   /   |   \
 PC  Laptop Printer
```

---

## How Data Travels

Suppose your browser requests a webpage.

```text id="b2r9tw"
Browser
    │
Router
    │
ISP
    │
Internet
    │
Cloud Data Center
    │
Web Server
```

The server processes the request and sends the response back along a similar path.

Although this happens in milliseconds, the data may travel through many routers across different countries.

---

## Common Networking Terms

| Term     | Description                                     |
| -------- | ----------------------------------------------- |
| Network  | Connected devices communicating with each other |
| Client   | Device requesting data                          |
| Server   | Device providing data                           |
| Internet | Global network of interconnected networks       |
| LAN      | Local Area Network                              |
| WAN      | Wide Area Network                               |
| Router   | Connects different networks                     |
| Switch   | Connects devices within a LAN                   |
| Modem    | Connects a network to an ISP                    |

---

## Real-World Example

You deploy a Node.js application to an Azure Virtual Machine.

A user opens:

```text id="p8j4rh"
https://myapp.com
```

The request travels through several components:

```text id="l5q7vn"
User Browser
      │
Local Wi-Fi
      │
Internet Service Provider
      │
Internet
      │
Cloudflare
      │
Azure Virtual Machine
      │
Nginx
      │
Node.js Application
```

The application processes the request and sends the response back through the same networking infrastructure.

Although users only see a webpage, multiple networking components are involved behind the scenes.

---

## Best Practices

- Learn networking concepts before studying protocols such as TCP/IP and HTTP.
- Understand the difference between clients and servers.
- Remember that almost every cloud service depends on networking.
- Practice visualizing how requests travel across networks.
- Build a strong conceptual foundation before learning packet-level details.

---

## Common Mistakes

#### Thinking the Internet Is a Single Computer

The Internet is a massive collection of interconnected networks spread across the world.

---

#### Confusing the Internet with Wi-Fi

Wi-Fi is only a method of connecting a device to a local network.

Internet access is provided through an ISP and routed beyond the local network.

---

#### Assuming Every Server Is Physical

Modern servers are often virtual machines or containers running inside cloud data centers.

Applications interact with them the same way regardless of the underlying hardware.

---

#### Believing Data Travels Directly Between Devices

Data typically passes through multiple routers, switches, ISPs, and cloud networks before reaching its destination.

Understanding this path is essential for troubleshooting network issues.

---

## Summary

Computer networking enables devices to exchange information across local and global networks. Concepts such as clients, servers, LANs, WANs, routers, switches, and communication paths form the foundation of every modern application and cloud infrastructure.

A solid understanding of these basics makes advanced topics such as TCP/IP, DNS, HTTP, SSL, reverse proxies, and load balancing much easier to understand. These concepts will be explored throughout the remainder of **Part 3 – Networking Fundamentals**.

---

### Next Chapter

➡️ **02 - TCP/IP**
