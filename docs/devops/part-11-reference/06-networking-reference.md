---
sidebar_label: Networking Reference
sidebar_position: 6
---


# Networking Reference

## Overview

Networking is one of the most important aspects of Linux server administration. Every web request, API call, SSH connection, database query, and cloud service depends on a functioning network.

This chapter serves as a quick-reference guide covering networking commands, protocols, ports, DNS, routing, diagnostics, firewall tools, and troubleshooting techniques used in production environments.

---

# Learning Objectives

After completing this chapter, you will be able to:

- Understand core networking concepts.
- Use Linux networking commands effectively.
- Diagnose connectivity issues.
- Inspect ports and routing.
- Perform DNS lookups.
- Verify application connectivity.
- Troubleshoot production networking problems.

---

# Network Communication Flow

```text id="4h9x2k"
Client

↓

DNS

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

Every network request follows multiple layers before reaching the application.

---

# OSI Model Reference

| Layer | Name         | Example             |
| ----- | ------------ | ------------------- |
| 7     | Application  | HTTP, HTTPS         |
| 6     | Presentation | SSL/TLS             |
| 5     | Session      | Authentication      |
| 4     | Transport    | TCP, UDP            |
| 3     | Network      | IP                  |
| 2     | Data Link    | Ethernet            |
| 1     | Physical     | Cable, Fiber, Wi-Fi |

---

# TCP/IP Model

| Layer          | Protocols                  |
| -------------- | -------------------------- |
| Application    | HTTP, HTTPS, FTP, SSH, DNS |
| Transport      | TCP, UDP                   |
| Internet       | IP, ICMP                   |
| Network Access | Ethernet, Wi-Fi            |

---

# View IP Addresses

Display all network interfaces.

```bash id="0ygm4g"
ip addr
```

Short form.

```bash id="vhwml5"
ip a
```

Example output:

```text id="6obsvb"
eth0

192.168.1.25
```

---

# View Routing Table

```bash id="nb7jhu"
ip route
```

Example:

```text id="qmk7yx"
default via 192.168.1.1
```

This identifies the system's default gateway.

---

# Display Network Interfaces

```bash id="u0hv55"
ip link
```

Example:

```text id="9l4tga"
eth0

UP
```

A DOWN interface cannot transmit or receive packets.

---

# Test Connectivity

Ping another host.

```bash id="j9f3ye"
ping google.com
```

Limit packets.

```bash id="twq1b0"
ping -c 4 google.com
```

Purpose:

- Verify connectivity.
- Measure latency.
- Confirm DNS resolution.

---

# DNS Lookup

Using `dig`.

```bash id="e0jngk"
dig example.com
```

Query a specific record.

```bash id="e62sqk"
dig example.com A
```

MX records.

```bash id="m0zwth"
dig example.com MX
```

---

# nslookup

Alternative DNS lookup tool.

```bash id="8j2g67"
nslookup example.com
```

Query a DNS server.

```bash id="3kq0n4"
nslookup example.com 8.8.8.8
```

---

# Reverse DNS Lookup

```bash id="4gwnc3"
dig -x 8.8.8.8
```

Useful when investigating unknown IP addresses.

---

# Download Web Content

Using curl.

```bash id="8hxx3j"
curl https://example.com
```

View response headers.

```bash id="tjlwmn"
curl -I https://example.com
```

Verbose output.

```bash id="1l9nrv"
curl -v https://example.com
```

---

# Download Files

Using wget.

```bash id="rm0jui"
wget https://example.com/file.zip
```

Resume download.

```bash id="1rjlwm"
wget -c https://example.com/file.zip
```

---

# View Open Ports

Using `ss`.

```bash id="6x2o0x"
ss -tulpn
```

TCP only.

```bash id="s3h8hz"
ss -tlpn
```

UDP only.

```bash id="qfdc9d"
ss -ulpn
```

---

# netstat (Legacy)

```bash id="xtf89j"
netstat -tulpn
```

Although `ss` is recommended, `netstat` is still commonly found in older systems.

---

# Trace Network Path

```bash id="8xjlwm"
traceroute google.com
```

Shows every router between the client and destination.

Example:

```text id="jvjlwm"
Router 1

↓

Router 2

↓

Router 3

↓

Destination
```

---

# ARP Table

Display cached MAC address mappings.

```bash id="efjlwm"
ip neigh
```

Example:

```text id="kjlwm2"
192.168.1.10

aa:bb:cc:dd:ee:ff
```

---

# Check Active Connections

```bash id="92jlwm"
ss -tan
```

Useful for:

- Active HTTP connections
- SSH sessions
- Database connections

---

# Network Statistics

Interface statistics.

```bash id="2jlwm4"
ip -s link
```

General statistics.

```bash id="jlwm55"
sar -n DEV 1 5
```

Bandwidth monitoring tools help identify network bottlenecks.

---

# Firewall (UFW)

View status.

```bash id="jlwm66"
sudo ufw status
```

Allow HTTP.

```bash id="jlwm77"
sudo ufw allow 80
```

Allow HTTPS.

```bash id="jlwm88"
sudo ufw allow 443
```

Allow SSH.

```bash id="jlwm99"
sudo ufw allow 22
```

Reload firewall.

```bash id="jlwm10"
sudo ufw reload
```

---

# Common Network Ports

| Port  | Protocol | Service                 |
| ----- | -------- | ----------------------- |
| 20    | TCP      | FTP Data                |
| 21    | TCP      | FTP Control             |
| 22    | TCP      | SSH                     |
| 25    | TCP      | SMTP                    |
| 53    | TCP/UDP  | DNS                     |
| 67    | UDP      | DHCP                    |
| 68    | UDP      | DHCP Client             |
| 80    | TCP      | HTTP                    |
| 110   | TCP      | POP3                    |
| 123   | UDP      | NTP                     |
| 143   | TCP      | IMAP                    |
| 161   | UDP      | SNMP                    |
| 389   | TCP      | LDAP                    |
| 443   | TCP      | HTTPS                   |
| 465   | TCP      | SMTPS                   |
| 587   | TCP      | SMTP Submission         |
| 993   | TCP      | IMAPS                   |
| 995   | TCP      | POP3S                   |
| 1433  | TCP      | SQL Server              |
| 1521  | TCP      | Oracle                  |
| 3306  | TCP      | MySQL                   |
| 5432  | TCP      | PostgreSQL              |
| 6379  | TCP      | Redis                   |
| 8080  | TCP      | Alternate HTTP          |
| 8443  | TCP      | Alternate HTTPS         |
| 9000  | TCP      | Common Application Port |
| 27017 | TCP      | MongoDB                 |

---

# Useful ICMP Commands

| Command      | Purpose        |
| ------------ | -------------- |
| `ping`       | Connectivity   |
| `traceroute` | Route analysis |
| `tracepath`  | Path discovery |

---

# Hostname Commands

View hostname.

```bash id="jlwm11"
hostname
```

View detailed hostname information.

```bash id="jlwm12"
hostnamectl
```

Set hostname.

```bash id="jlwm13"
sudo hostnamectl set-hostname production-api
```

---

# DNS Configuration

System DNS resolver.

```text id="jlwm14"
/etc/resolv.conf
```

Hosts file.

```text id="jlwm15"
/etc/hosts
```

Example:

```text id="jlwm16"
127.0.0.1

localhost
```

---

# Test Application Port

Check a local application.

```bash id="jlwm17"
curl http://localhost:3000
```

Check HTTPS.

```bash id="jlwm18"
curl -I https://example.com
```

---

# Network Troubleshooting Workflow

```text id="jlwm19"
Application Down

↓

IP Address

↓

Gateway

↓

DNS

↓

Firewall

↓

Open Ports

↓

Service

↓

Application

↓

Resolved
```

Always troubleshoot layer by layer.

---

# Daily Networking Commands

```text id="jlwm20"
Connectivity

├── ping
├── curl
├── wget

DNS

├── dig
├── nslookup

Interfaces

├── ip addr
├── ip link

Ports

├── ss -tulpn

Firewall

├── ufw status

Routing

├── ip route
```

---

# Useful Networking Commands

| Command          | Purpose             |
| ---------------- | ------------------- |
| `ip addr`        | View IP addresses   |
| `ip link`        | View interfaces     |
| `ip route`       | Routing table       |
| `ping`           | Connectivity test   |
| `curl`           | HTTP requests       |
| `wget`           | Download files      |
| `dig`            | DNS lookup          |
| `nslookup`       | DNS lookup          |
| `traceroute`     | Network path        |
| `ss -tulpn`      | Open ports          |
| `netstat -tulpn` | Legacy port listing |
| `ip neigh`       | ARP table           |
| `hostnamectl`    | Hostname management |
| `ufw status`     | Firewall status     |

---

# Real-World Example

Users report that an API is unreachable from the internet.

The administrator performs the following investigation.

Verify the application.

```bash id="jlwm21"
curl http://localhost:3000
```

The API responds successfully.

Check Nginx.

```bash id="jlwm22"
sudo systemctl status nginx
```

Nginx is running.

Inspect listening ports.

```bash id="jlwm23"
ss -tulpn
```

Port **443** is listening.

Check the firewall.

```bash id="jlwm24"
sudo ufw status
```

Output:

```text id="jlwm25"
443 DENY
```

Allow HTTPS.

```bash id="jlwm26"
sudo ufw allow 443
```

Reload the firewall.

```bash id="jlwm27"
sudo ufw reload
```

Retest from an external machine.

The application is now accessible.

**Lesson:** Always verify connectivity from the application layer outward instead of assuming the issue lies with the application itself.

---

# Best Practices

- Use `ip` commands instead of deprecated networking tools whenever possible.
- Verify DNS before troubleshooting applications.
- Check firewall rules before modifying server configurations.
- Confirm services are listening on the expected ports.
- Test both localhost and external connectivity.
- Keep DNS records documented.
- Monitor network latency and packet loss.
- Restrict access to only required ports.

---

# Common Mistakes

### Assuming DNS Is Working

Always verify DNS resolution before investigating the application.

---

### Ignoring Firewall Rules

Many connectivity issues result from blocked ports rather than application failures.

---

### Confusing Local and External Connectivity

A service that responds on `localhost` may still be inaccessible externally because of firewall, routing, or reverse proxy issues.

---

### Forgetting to Check Listening Ports

Applications that are not listening on the expected port cannot receive traffic.

---

### Skipping Layer-by-Layer Troubleshooting

Jumping directly to application debugging often wastes time when the actual issue exists in the network stack.

---

# Summary

Linux networking is the foundation of modern server infrastructure. Understanding IP addressing, routing, DNS, ports, firewalls, and diagnostic tools allows administrators to identify and resolve connectivity issues efficiently. This reference chapter consolidates the most commonly used networking commands and workflows into a practical guide for day-to-day operations and production troubleshooting.

---

## Next Chapter

➡️ **07 - Common File Locations**
