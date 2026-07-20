---
sidebar_label: Ports and Sockets
sidebar_position: 3
---


# Ports and Sockets

### Overview

In the previous chapter, you learned that **IP addresses** identify devices on a network. However, an IP address alone is not enough.

A single server can run multiple applications simultaneously:

- Nginx
- Node.js API
- SSH Server
- MySQL
- Redis
- MongoDB

If a packet reaches the server's IP address, **how does the operating system know which application should receive it?**

The answer is **ports**.

Once the correct application is identified, the operating system creates a **socket**, which acts as the communication endpoint between two applications.

Ports and sockets form the backbone of application-level networking.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what ports are.
- Understand why ports are necessary.
- Learn what sockets are.
- Understand how clients connect to servers.
- Learn the lifecycle of a network connection.
- Differentiate between TCP and UDP ports.
- Inspect open ports on Linux.

---

## Why Are Ports Needed?

Imagine a company office.

The office has a single address:

```text id="k8r4wa"
123 Business Street
```

Inside the office are many departments:

- Sales
- HR
- Accounts
- Support

The address gets you to the building.

The department tells you where to go inside.

Networking works the same way.

```text id="m2q9pl"
IP Address
      │
      ▼
Server
      │
      ▼
Port Number
      │
      ▼
Application
```

The IP address identifies the **device**, while the port identifies the **application**.

---

## What is a Port?

A **port** is a logical communication endpoint assigned to an application.

Every network request contains:

- Destination IP Address
- Destination Port

Example:

```text id="v4n6yt"
IP Address : 104.18.32.45
Port       : 443
```

The operating system receives the packet and forwards it to the application listening on port **443**.

---

## Port Number Range

Ports are represented by **16-bit numbers**.

Valid port numbers range from:

```text id="r7c2km"
0 – 65535
```

They are divided into three categories.

| Range         | Category                  | Examples                     |
| ------------- | ------------------------- | ---------------------------- |
| 0 – 1023      | Well-Known Ports          | HTTP, HTTPS, SSH             |
| 1024 – 49151  | Registered Ports          | Databases, Applications      |
| 49152 – 65535 | Dynamic / Ephemeral Ports | Temporary client connections |

---

## Common Port Numbers

| Port  | Service     |
| ----- | ----------- |
| 20    | FTP Data    |
| 21    | FTP Control |
| 22    | SSH         |
| 25    | SMTP        |
| 53    | DNS         |
| 80    | HTTP        |
| 110   | POP3        |
| 143   | IMAP        |
| 443   | HTTPS       |
| 3306  | MySQL       |
| 5432  | PostgreSQL  |
| 6379  | Redis       |
| 27017 | MongoDB     |

Knowing these ports is extremely useful during deployment and troubleshooting.

---

## One Server, Multiple Applications

Consider an Azure Virtual Machine running several services.

```text id="t6p4nv"
Server
│
├── Port 22     → SSH
├── Port 80     → Nginx
├── Port 443    → HTTPS
├── Port 3000   → Node.js
├── Port 3306   → MySQL
└── Port 6379   → Redis
```

All applications share the same IP address but listen on different ports.

---

## What Does "Listening on a Port" Mean?

When an application starts, it asks the operating system to reserve a port.

Example in Node.js:

```javascript id="h3k8mz"
app.listen(3000);
```

This means:

> "Start accepting incoming connections on port **3000**."

The operating system records this information and waits for requests on that port.

---

## What is a Socket?

A **socket** is one endpoint of a network communication.

It combines:

- IP Address
- Port Number
- Transport Protocol (TCP or UDP)

A socket uniquely identifies a communication endpoint.

Example:

```text id="x5q7wb"
192.168.1.20:3000
```

When two applications communicate, they do so through sockets.

---

## Client Socket and Server Socket

A connection always has two endpoints.

```text id="n8m4pr"
Client Socket
      │
      │
Internet
      │
      │
Server Socket
```

Example:

```text id="z2f9vk"
Laptop
192.168.1.10:52431

↓

Azure VM
20.120.10.5:443
```

Notice that:

- The client uses a temporary (ephemeral) port.
- The server uses a well-known port.

---

## Ephemeral Ports

Clients usually do **not** use ports like 80 or 443.

Instead, the operating system automatically assigns a temporary port.

Example:

```text id="a6v3cx"
Browser

↓

192.168.1.20:52743

↓

example.com:443
```

After the communication ends, the temporary port is released.

---

## How a Connection is Established

Suppose you visit:

```text id="y1r5kp"
https://example.com
```

The communication looks like this:

```text id="d4n7hq"
Browser
192.168.1.15:52431
          │
          │
Internet
          │
          │
104.18.10.20:443
Nginx
```

The browser uses a temporary port.

Nginx listens on port **443**.

---

## TCP Socket Lifecycle

A typical TCP connection follows these stages.

```text id="c8w2mz"
Socket Created
        │
        ▼
Connection Requested
        │
        ▼
Connection Accepted
        │
        ▼
Data Transfer
        │
        ▼
Connection Closed
```

Once closed, the socket is destroyed.

---

## TCP vs UDP Ports

Both TCP and UDP use port numbers.

However, they behave differently.

| TCP                      | UDP                            |
| ------------------------ | ------------------------------ |
| Connection-oriented      | Connectionless                 |
| Reliable                 | Faster                         |
| Error checking           | Minimal overhead               |
| Ordered delivery         | No ordering guarantee          |
| Used by HTTP, HTTPS, SSH | Used by DNS, Streaming, Gaming |

Port **53**, for example, can exist for both TCP and UDP because they are different transport protocols.

---

## Viewing Open Ports in Linux

Display listening sockets:

```bash id="g7m3rt"
ss -tuln
```

Example output:

```text id="q2n6vf"
Netid State  Local Address:Port

tcp   LISTEN 0.0.0.0:22
tcp   LISTEN 0.0.0.0:80
tcp   LISTEN 0.0.0.0:443
tcp   LISTEN 127.0.0.1:3000
```

---

Display processes using ports:

```bash id="m9x5kc"
sudo ss -tulpn
```

Example:

```text id="v6f2pa"
tcp LISTEN 0 511 *:80 users:(("nginx",pid=801))
```

---

Using `netstat` (older systems):

```bash id="k4r8nw"
netstat -tuln
```

---

## Finding Which Process Uses a Port

Using `lsof`:

```bash id="w8p1xd"
sudo lsof -i :3000
```

Example output:

```text id="f3v6my"
COMMAND PID USER FD TYPE DEVICE

node 4521 ubuntu 21u IPv4 TCP *:3000
```

This is useful when troubleshooting port conflicts.

---

## Port Conflicts

Only one process can normally bind to the same IP address, port, and protocol combination.

Example:

```text id="n4y9qe"
Node.js → Port 3000

↓

Another Node.js App → Port 3000

↓

Address already in use
```

The second application will fail to start unless configured to use a different port.

---

## Firewalls and Ports

A service may be listening on a port, but external users still cannot access it if the firewall blocks the traffic.

Example:

```text id="u2q7lj"
Internet
     │
Firewall
     │
Port 80 Blocked
     │
Server
```

Both the application **and** the firewall must allow the connection.

---

## Real-World Example

Consider your production deployment.

```text id="r5k8xc"
Internet
      │
Cloudflare
      │
Azure VM
      │
Nginx
      │
localhost:3000
      │
Node.js
```

Typical configuration:

| Component | Port                    |
| --------- | ----------------------- |
| SSH       | 22                      |
| HTTP      | 80                      |
| HTTPS     | 443                     |
| Node.js   | 3000                    |
| MongoDB   | 27017 (usually private) |
| Redis     | 6379 (usually private)  |

Nginx listens on ports **80** and **443**, while forwarding requests internally to your Node.js application on **port 3000**.

---

## Best Practices

- Use standard ports whenever practical.
- Avoid exposing databases directly to the public Internet.
- Restrict sensitive services using firewalls.
- Verify listening ports after deploying applications.
- Close unused ports to reduce the attack surface.

---

## Common Mistakes

#### Confusing IP Addresses with Ports

An IP address identifies the device.

A port identifies the application running on that device.

---

#### Assuming an Open Port Means an Application Is Reachable

Firewalls, security groups, reverse proxies, or routing issues can still prevent access.

Always verify the complete network path.

---

#### Exposing Internal Services

Services such as MongoDB, Redis, and PostgreSQL should generally only be accessible from trusted internal networks.

---

#### Forgetting to Check Port Conflicts

If an application fails to start with an "Address already in use" error, inspect the port using:

```bash id="e1m7tr"
sudo ss -tulpn
```

or

```bash id="h9q4vw"
sudo lsof -i :PORT
```

---

## Summary

Ports enable multiple applications to share the same IP address by directing incoming traffic to the correct service. Sockets represent the communication endpoints that applications use to exchange data. Together, ports and sockets allow web servers, databases, APIs, SSH servers, and countless other applications to communicate efficiently over TCP or UDP.

Understanding ports and sockets is fundamental for deploying applications, configuring firewalls, troubleshooting connectivity issues, and managing production Linux servers.

---

### Next Chapter

➡️ **04 - DNS**
