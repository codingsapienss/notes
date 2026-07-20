---
sidebar_label: Linux Networking Tools
sidebar_position: 11
---


# Linux Networking Tools

### Overview

Networking is at the core of almost every modern Linux server. Whether you are hosting a website, deploying APIs, connecting to databases, using cloud services, or managing remote servers, understanding networking tools is essential.

Linux provides a rich set of command-line utilities that help administrators inspect network interfaces, verify connectivity, troubleshoot DNS issues, identify open ports, test web services, and diagnose communication problems.

These tools are among the most frequently used utilities by Linux system administrators, DevOps engineers, and backend developers.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand basic Linux networking concepts.
- Inspect network interfaces and IP addresses.
- Test network connectivity.
- Diagnose DNS problems.
- Check listening ports.
- Inspect active network connections.
- Test HTTP services.
- Troubleshoot common networking issues.

---

## Basic Networking Concepts

Before learning the tools, it is useful to understand a few common networking terms.

| Term       | Description                                       |
| ---------- | ------------------------------------------------- |
| IP Address | Unique address assigned to a device               |
| Port       | Communication endpoint used by applications       |
| DNS        | Converts domain names into IP addresses           |
| Gateway    | Device that connects a network to another network |
| Interface  | Network adapter (physical or virtual)             |
| Socket     | Combination of an IP address and port             |

Example:

```text id="m1a7vp"
Client
   │
   ▼
192.168.1.20
   │
Port 443
   │
   ▼
Server
```

---

## Viewing Network Interfaces

Modern Linux systems use the `ip` command.

Display all network interfaces:

```bash id="v8p2mx"
ip addr
```

or the shorter version:

```bash id="k3j5rw"
ip a
```

Example output:

```text id="g7t4lc"
2: eth0:
    inet 192.168.1.50/24
```

This displays:

- Interface names
- IPv4 addresses
- IPv6 addresses
- MAC addresses
- Interface state

---

## Viewing Routing Information

Display the routing table:

```bash id="y4r8cz"
ip route
```

Example:

```text id="d2w9ph"
default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0
```

The **default gateway** determines where traffic is sent when the destination is outside the local network.

---

## Testing Connectivity with `ping`

The simplest networking test is:

```bash id="j8x1na"
ping google.com
```

Example output:

```text id="w3p6vt"
64 bytes from ...
```

Stop the command using:

```text id="f5q9he"
Ctrl + C
```

Common uses:

- Verify internet connectivity.
- Test whether another server is reachable.
- Measure network latency.
- Check packet loss.

---

## Testing Specific Packet Counts

Instead of running indefinitely:

```bash id="a6m2yk"
ping -c 4 google.com
```

This sends exactly four packets.

---

## Checking DNS Resolution

If `ping` fails because of a hostname, DNS may be the issue.

Example:

```bash id="n1r7du"
nslookup google.com
```

Example output:

```text id="u5k8zx"
Name: google.com
Address: 142.250.x.x
```

Another powerful tool:

```bash id="q9v4fp"
dig google.com
```

`dig` provides detailed DNS information, including:

- IP addresses
- Name servers
- Query time
- TTL values

---

## Testing HTTP Requests with `curl`

`curl` is one of the most useful networking tools.

Retrieve a webpage:

```bash id="b7y3qn"
curl https://example.com
```

View only the response headers:

```bash id="r2k8eh"
curl -I https://example.com
```

Test an API:

```bash id="z5m1ls"
curl https://api.example.com/users
```

Common uses include:

- API testing
- Health checks
- Downloading data
- Debugging HTTP responses

---

## Downloading Files with `wget`

Download a file:

```bash id="t4c7vx"
wget https://example.com/file.zip
```

Useful for:

- Downloading installation packages
- Fetching backups
- Retrieving datasets
- Automated scripts

---

## Viewing Listening Ports

Modern Linux systems use:

```bash id="h6p9aw"
ss -tuln
```

Meaning:

| Option | Description       |
| ------ | ----------------- |
| `-t`   | TCP sockets       |
| `-u`   | UDP sockets       |
| `-l`   | Listening sockets |
| `-n`   | Numeric addresses |

Example output:

```text id="c8v5my"
LISTEN
22
80
443
3000
```

This shows which ports are currently accepting incoming connections.

---

## Finding Which Process Uses a Port

Display process information:

```bash id="x1f8kr"
sudo ss -tulpn
```

Example:

```text id="j9w2lt"
LISTEN
0.0.0.0:80

users:
("nginx",pid=845)
```

Useful when determining which application owns a particular port.

---

## The Older `netstat` Command

Older systems often use:

```bash id="p4m6zs"
netstat -tuln
```

Although still available on some distributions, `ss` is faster and recommended for modern Linux systems.

---

## Viewing Active Connections

Display established connections:

```bash id="v2q7hd"
ss -tan
```

Useful for identifying:

- Connected clients
- Active TCP sessions
- Long-running connections

---

## Tracing Network Paths

If packets fail to reach a destination:

```bash id="e8y4nw"
traceroute google.com
```

This displays every router (hop) between your server and the destination.

Typical uses:

- Identifying routing problems.
- Measuring latency across hops.
- Diagnosing ISP issues.

---

## Viewing Host Information

Display local hostname:

```bash id="s3p1jc"
hostname
```

Display IP addresses associated with the host:

```bash id="w6n8ga"
hostname -I
```

Example:

```text id="r1k4xy"
192.168.1.50
```

---

## Testing Port Connectivity

Sometimes a server responds to `ping`, but a specific service is unavailable.

Example:

```bash id="l7h5vm"
nc -zv example.com 443
```

or:

```bash id="n4x2pq"
telnet example.com 443
```

These commands help determine whether a particular port is reachable.

---

## Useful Networking Commands

| Command       | Purpose                  |
| ------------- | ------------------------ |
| `ip a`        | View network interfaces  |
| `ip route`    | View routing table       |
| `ping`        | Test connectivity        |
| `nslookup`    | DNS lookup               |
| `dig`         | Detailed DNS information |
| `curl`        | Test HTTP requests       |
| `wget`        | Download files           |
| `ss -tuln`    | View listening ports     |
| `ss -tan`     | Active TCP connections   |
| `traceroute`  | Trace network path       |
| `hostname -I` | Display local IP         |

---

## Real-World Example

A Node.js application is deployed behind Nginx.

Users report that the website is unavailable.

An administrator performs the following checks:

Verify the web server is listening:

```bash id="k8t5sq"
sudo ss -tulpn
```

Confirm Nginx is responding:

```bash id="u4r1jd"
curl http://localhost
```

Verify DNS resolution:

```bash id="b2x9cf"
nslookup example.com
```

Check connectivity to an external API:

```bash id="f7m3wa"
ping api.example.com
```

Inspect the route:

```bash id="y5p6ne"
ip route
```

By combining these tools, the administrator can quickly determine whether the problem lies with the application, the web server, DNS, or the underlying network.

---

## Best Practices

- Prefer the `ip` command instead of deprecated networking tools.
- Use `ss` rather than `netstat` on modern systems.
- Verify DNS before assuming a network failure.
- Test services locally using `curl` before checking external access.
- Confirm that the expected ports are listening after deploying applications.

---

## Common Mistakes

#### Assuming `ping` Tests Everything

A successful `ping` only confirms basic network reachability.

It does not verify that HTTP, SSH, or database services are working.

---

#### Ignoring DNS

Many connectivity issues are caused by incorrect DNS configuration rather than network failures.

Use `nslookup` or `dig` to verify name resolution.

---

#### Forgetting Firewalls

A service may be running correctly but remain inaccessible because a firewall blocks the required port.

Always verify firewall rules when troubleshooting connectivity.

---

#### Confusing Listening Ports with Active Connections

A listening port indicates that an application is ready to accept connections.

An active connection indicates that a client is currently communicating with the application.

These are different concepts and should not be interpreted interchangeably.

---

## Summary

Linux includes a comprehensive set of networking tools for monitoring, testing, and troubleshooting network communication.

Commands such as `ip`, `ping`, `curl`, `dig`, `ss`, `hostname`, and `traceroute` enable administrators to inspect interfaces, verify connectivity, diagnose DNS issues, identify listening services, and debug application networking problems.

These utilities form the foundation of Linux network administration and are used daily on production servers.

---

### Next Chapter

➡️ **12 - Essential Linux Commands**
