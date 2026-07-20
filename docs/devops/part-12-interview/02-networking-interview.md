---
sidebar_label: Networking Interview Preparation
sidebar_position: 2
---


# Networking Interview Preparation

### Overview

Networking is one of the most important topics in Backend, DevOps, Cloud, Site Reliability Engineering (SRE), and System Administration interviews.

Interviewers expect candidates to understand not only networking concepts but also how applications communicate over the internet and how to troubleshoot real production issues.

This chapter covers:

- Networking fundamentals
- Common interview questions
- Linux networking
- Cloud networking
- Security basics
- Production troubleshooting
- Scenario-based interview questions

---

## Learning Objectives

After completing this chapter, you will be able to:

- Explain networking concepts clearly.
- Answer common networking interview questions.
- Understand TCP/IP communication.
- Troubleshoot connectivity problems.
- Explain production networking architecture.
- Handle scenario-based interview discussions.

---

## Internet Communication

```text id="net001"
Browser

↓

DNS

↓

IP Address

↓

Internet

↓

Firewall

↓

Load Balancer

↓

Nginx

↓

Application

↓

Database
```

Understanding this complete request flow is essential for networking interviews.

---

## Networking Knowledge Roadmap

```text id="net002"
OSI Model

↓

TCP/IP

↓

IP Addressing

↓

Ports

↓

DNS

↓

Routing

↓

HTTP/HTTPS

↓

Firewalls

↓

Load Balancing

↓

Cloud Networking

↓

Troubleshooting
```

---

## Beginner Interview Questions

### Q1. What is a Computer Network?

**Answer**

A computer network is a collection of interconnected devices that communicate using standardized protocols to exchange data.

Examples include:

- Internet
- Office LAN
- Cloud networks
- Home Wi-Fi

---

### Q2. What is an IP Address?

An IP address uniquely identifies a device on a network.

Example:

```text id="net003"
192.168.1.10
```

Public example:

```text id="net004"
203.0.113.15
```

---

### Q3. Difference Between IPv4 and IPv6

| IPv4                   | IPv6                          |
| ---------------------- | ----------------------------- |
| 32-bit                 | 128-bit                       |
| ~4.3 Billion addresses | Extremely large address space |
| Decimal notation       | Hexadecimal notation          |

Example:

IPv4

```text id="net005"
192.168.1.10
```

IPv6

```text id="net006"
2001:db8::8a2e:370:7334
```

---

### Q4. What is DNS?

DNS (Domain Name System) converts domain names into IP addresses.

Example:

```text id="net007"
google.com

↓

142.250.x.x
```

Without DNS, users would have to remember IP addresses instead of domain names.

---

### Q5. What is a Domain Name?

A human-readable name mapped to an IP address.

Examples:

- example.com
- google.com
- github.com

---

## OSI Model Questions

### Q6. Explain the OSI Model.

| Layer | Name         | Example        |
| ----- | ------------ | -------------- |
| 7     | Application  | HTTP           |
| 6     | Presentation | SSL/TLS        |
| 5     | Session      | Authentication |
| 4     | Transport    | TCP            |
| 3     | Network      | IP             |
| 2     | Data Link    | Ethernet       |
| 1     | Physical     | Cable          |

Interview tip:

You do not usually need to memorize every detail of each layer, but you should understand which protocols operate at which layers.

---

### Q7. Difference Between OSI and TCP/IP?

| OSI             | TCP/IP               |
| --------------- | -------------------- |
| 7 Layers        | 4 Layers             |
| Reference Model | Practical Model      |
| Educational     | Used on the Internet |

---

## TCP/IP Questions

### Q8. Difference Between TCP and UDP?

| TCP                 | UDP                   |
| ------------------- | --------------------- |
| Reliable            | Faster                |
| Connection-oriented | Connectionless        |
| Ordered delivery    | No delivery guarantee |
| Retransmissions     | No retransmissions    |

Typical TCP examples:

- HTTP
- HTTPS
- SSH

Typical UDP examples:

- DNS
- DHCP
- VoIP
- Video streaming

---

### Q9. What is the Three-Way Handshake?

```text id="net008"
Client

SYN

↓

Server

SYN + ACK

↓

Client

ACK
```

This process establishes a TCP connection before data transfer begins.

---

### Q10. Why is TCP Slower than UDP?

TCP performs:

- Connection establishment
- Packet ordering
- Retransmission
- Error recovery

UDP skips these features, reducing overhead.

---

## IP Address Questions

### Q11. Difference Between Public and Private IP?

| Public                | Private                   |
| --------------------- | ------------------------- |
| Internet accessible   | Internal networks         |
| Globally unique       | Reusable                  |
| Assigned by ISP/Cloud | Used within organizations |

Private ranges:

```text id="net009"
10.0.0.0/8

172.16.0.0/12

192.168.0.0/16
```

---

### Q12. What is NAT?

Network Address Translation allows multiple private devices to share a single public IP address.

```text id="net010"
Laptop

↓

192.168.1.5

↓

Router

↓

Public IP

↓

Internet
```

---

## Port Questions

### Q13. What is a Port?

A logical communication endpoint for network services.

Examples:

| Port  | Service    |
| ----- | ---------- |
| 22    | SSH        |
| 80    | HTTP       |
| 443   | HTTPS      |
| 3306  | MySQL      |
| 5432  | PostgreSQL |
| 6379  | Redis      |
| 27017 | MongoDB    |

---

### Q14. Why Doesn't a Website Use Port 3000 Directly?

In production:

```text id="net011"
Internet

↓

443

↓

Nginx

↓

3000

↓

Node.js
```

The reverse proxy handles public traffic, while the application listens on a private port.

---

## HTTP Questions

### Q15. Difference Between HTTP and HTTPS?

| HTTP        | HTTPS     |
| ----------- | --------- |
| Unencrypted | Encrypted |
| Port 80     | Port 443  |
| No TLS      | TLS/SSL   |

---

### Q16. Common HTTP Methods

| Method | Purpose |
| ------ | ------- |
| GET    | Read    |
| POST   | Create  |
| PUT    | Replace |
| PATCH  | Update  |
| DELETE | Remove  |

---

### Q17. Common HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 301  | Permanent Redirect    |
| 302  | Temporary Redirect    |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 502  | Bad Gateway           |
| 503  | Service Unavailable   |

---

## DNS Questions

### Q18. What Happens When You Open google.com?

```text id="net012"
Browser

↓

DNS Lookup

↓

IP Address

↓

TCP Connection

↓

TLS (HTTPS)

↓

HTTP Request

↓

Server Response

↓

Page Rendered
```

---

### Q19. What is DNS Caching?

DNS responses are cached by browsers, operating systems, and DNS resolvers to reduce lookup time and network traffic.

---

## Routing Questions

### Q20. What is a Router?

A router forwards packets between different networks by determining the best available path.

---

### Q21. What is a Gateway?

A gateway is the device that allows a local network to communicate with external networks.

---

## Firewall Questions

### Q22. What Does a Firewall Do?

A firewall filters incoming and outgoing network traffic based on configured rules.

Example:

```text id="net013"
Internet

↓

Firewall

↓

Allowed

↓

Server
```

---

### Q23. Why Close Unused Ports?

Reasons:

- Reduces attack surface.
- Prevents unauthorized access.
- Improves security posture.

---

## Load Balancer Questions

### Q24. What is a Load Balancer?

A load balancer distributes incoming requests across multiple backend servers.

```text id="net014"
Users

↓

Load Balancer

↓

App 1

App 2

App 3
```

Benefits:

- High availability
- Better scalability
- Fault tolerance

---

## Linux Networking Questions

### Q25. How Do You Check Your IP Address?

```bash id="net015"
ip addr
```

---

### Q26. Which Command Shows Open Ports?

```bash id="net016"
ss -tulpn
```

---

### Q27. How Do You Test DNS?

```bash id="net017"
dig example.com
```

or

```bash id="net018"
nslookup example.com
```

---

### Q28. How Do You Test HTTP?

```bash id="net019"
curl https://example.com
```

---

## Cloud Networking Questions

### Q29. What is a Security Group?

A security group is a virtual firewall used by cloud providers to control inbound and outbound traffic to cloud resources.

---

### Q30. Difference Between Security Group and Firewall?

| Security Group              | Firewall                   |
| --------------------------- | -------------------------- |
| Cloud-level filtering       | Operating system filtering |
| Controls VM access          | Controls host access       |
| Examples: AWS SG, Azure NSG | Examples: UFW, iptables    |

---

## Advanced Questions

### Q31. Why Does HTTPS Need Certificates?

Certificates:

- Authenticate the server.
- Enable encrypted communication.
- Prevent impersonation and certain man-in-the-middle attacks.

---

### Q32. What is SSL/TLS?

TLS (Transport Layer Security) encrypts communication between clients and servers. SSL is the older protocol name that is still commonly used in conversation, although modern deployments use TLS.

---

### Q33. Explain Reverse Proxy.

```text id="net020"
Users

↓

Nginx

↓

Node.js

↓

Database
```

The reverse proxy:

- Receives client requests.
- Terminates TLS.
- Forwards traffic to backend services.
- Can perform load balancing and caching.

---

## Scenario-Based Questions

### Scenario 1

**Question**

A website is not opening. How would you troubleshoot it?

**Suggested Answer**

Follow a structured sequence:

1. Verify DNS resolution.
2. Ping the server (if applicable).
3. Check HTTP response with `curl`.
4. Verify firewall rules.
5. Confirm Nginx is running.
6. Check application status.
7. Review logs.
8. Verify SSL certificate if using HTTPS.

Typical commands:

```bash id="net021"
dig example.com
```

```bash id="net022"
curl -I https://example.com
```

```bash id="net023"
ss -tulpn
```

---

### Scenario 2

**Question**

The server responds locally but not from the internet.

Possible causes:

- Firewall rules
- Cloud security group
- DNS configuration
- Reverse proxy issues
- Incorrect listening address
- Routing problems

---

### Scenario 3

**Question**

Users report intermittent slow responses.

Investigation:

```text id="net024"
Network Latency

↓

Server Load

↓

Database

↓

Application Logs

↓

External APIs

↓

Root Cause
```

Potential causes include network congestion, overloaded servers, slow database queries, or dependencies on external services.

---

### Scenario 4

**Question**

The browser reports **502 Bad Gateway**.

Possible checks:

- Backend application running
- Reverse proxy configuration
- Backend listening port
- Application logs
- Network connectivity between proxy and backend

---

## Production Experience Questions

Interviewers may ask:

- Explain how a browser loads a website.
- How does DNS work?
- Describe a production networking issue you solved.
- How do you expose a Node.js application securely?
- Why use Nginx instead of exposing the application directly?
- How would you diagnose high network latency?

Focus on explaining your reasoning step by step rather than jumping directly to conclusions.

---

## Interview Tips

- Draw simple diagrams when explaining networking.
- Explain packet flow from client to server.
- Distinguish clearly between TCP and UDP.
- Understand the role of DNS, firewalls, and reverse proxies.
- Use real production examples whenever possible.
- Troubleshoot from the network layer toward the application layer.

---

## Common Mistakes

#### Confusing IP Addresses with Domain Names

A domain name is resolved to an IP address through DNS; they are not the same thing.

---

#### Memorizing Port Numbers Without Understanding Their Purpose

Know why a service uses a particular port, not just the number.

---

#### Ignoring DNS During Troubleshooting

Many connectivity problems originate from incorrect or outdated DNS records.

---

#### Assuming Network Connectivity Means the Application Is Healthy

A successful ping does not guarantee that the application is responding correctly.

---

#### Skipping Layer-by-Layer Investigation

Troubleshoot systematically: DNS → Network → Firewall → Reverse Proxy → Application → Database.

---

## Summary

Networking interviews emphasize understanding how systems communicate, how protocols interact, and how production issues are diagnosed. Strong candidates combine conceptual knowledge with practical troubleshooting skills and explain their reasoning using structured, step-by-step approaches.

---

### Next Chapter

➡️ **03 - Nginx Interview Preparation**
