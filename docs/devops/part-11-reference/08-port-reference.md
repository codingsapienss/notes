---
sidebar_label: Port Reference
sidebar_position: 8
---


# Port Reference

### Overview

Every network service communicates through one or more **ports**. A port acts as a logical communication endpoint that allows multiple services to operate on a single IP address simultaneously.

Understanding common ports is essential for:

- Server deployment
- Firewall configuration
- Application hosting
- Troubleshooting
- Security auditing
- Cloud networking

This chapter serves as a quick-reference guide to the most commonly used TCP and UDP ports in Linux and production environments.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand how ports work.
- Differentiate TCP and UDP.
- Identify common service ports.
- Inspect listening ports.
- Configure firewalls correctly.
- Troubleshoot port-related issues.
- Secure production servers.

---

## What is a Port?

A **port** is a 16-bit logical communication endpoint associated with an IP address.

Example:

```text
IP Address: 203.0.113.10

HTTP   → Port 80

HTTPS  → Port 443

SSH    → Port 22

NodeJS → Port 3000
```

A single server can host thousands of services by assigning each one a different port.

---

## Communication Flow

```text
Browser

↓

DNS

↓

Server IP

↓

Port

↓

Application

↓

Response
```

Example:

```text
https://example.com

↓

203.0.113.10

↓

443

↓

Nginx

↓

Node.js
```

---

## Port Number Ranges

| Range       | Category            | Purpose                       |
| ----------- | ------------------- | ----------------------------- |
| 0–1023      | Well-Known Ports    | Standard system services      |
| 1024–49151  | Registered Ports    | User and application services |
| 49152–65535 | Dynamic / Ephemeral | Temporary client ports        |

---

## TCP vs UDP

| Feature         | TCP              | UDP                        |
| --------------- | ---------------- | -------------------------- |
| Connection      | Yes              | No                         |
| Reliability     | High             | Best effort                |
| Packet Ordering | Guaranteed       | Not guaranteed             |
| Error Checking  | Yes              | Limited                    |
| Speed           | Slower           | Faster                     |
| Typical Uses    | HTTP, HTTPS, SSH | DNS, DHCP, VoIP, Streaming |

---

## Well-Known Ports

| Port | Protocol | Service          | Typical Use              |
| ---- | -------- | ---------------- | ------------------------ |
| 20   | TCP      | FTP Data         | File transfer            |
| 21   | TCP      | FTP Control      | FTP commands             |
| 22   | TCP      | SSH              | Secure remote login      |
| 23   | TCP      | Telnet           | Remote terminal (legacy) |
| 25   | TCP      | SMTP             | Email transfer           |
| 53   | TCP/UDP  | DNS              | Name resolution          |
| 67   | UDP      | DHCP Server      | IP assignment            |
| 68   | UDP      | DHCP Client      | IP assignment            |
| 69   | UDP      | TFTP             | Simple file transfer     |
| 80   | TCP      | HTTP             | Web traffic              |
| 110  | TCP      | POP3             | Email retrieval          |
| 119  | TCP      | NNTP             | News service             |
| 123  | UDP      | NTP              | Time synchronization     |
| 135  | TCP      | RPC              | Remote Procedure Calls   |
| 137  | UDP      | NetBIOS Name     | Windows networking       |
| 138  | UDP      | NetBIOS Datagram | Windows networking       |
| 139  | TCP      | NetBIOS Session  | Windows file sharing     |
| 143  | TCP      | IMAP             | Email retrieval          |
| 161  | UDP      | SNMP             | Network monitoring       |
| 162  | UDP      | SNMP Trap        | Monitoring alerts        |
| 179  | TCP      | BGP              | Internet routing         |
| 389  | TCP      | LDAP             | Directory services       |
| 443  | TCP      | HTTPS            | Secure web traffic       |
| 445  | TCP      | SMB              | Windows file sharing     |
| 465  | TCP      | SMTPS            | Secure SMTP              |
| 514  | UDP      | Syslog           | Remote logging           |
| 587  | TCP      | SMTP Submission  | Outgoing email           |
| 636  | TCP      | LDAPS            | Secure LDAP              |
| 873  | TCP      | rsync            | File synchronization     |
| 993  | TCP      | IMAPS            | Secure IMAP              |
| 995  | TCP      | POP3S            | Secure POP3              |

---

## Database Ports

| Port  | Database              |
| ----- | --------------------- |
| 1433  | Microsoft SQL Server  |
| 1521  | Oracle Database       |
| 3306  | MySQL                 |
| 5432  | PostgreSQL            |
| 6379  | Redis                 |
| 9042  | Cassandra             |
| 9200  | Elasticsearch         |
| 9300  | Elasticsearch Cluster |
| 11211 | Memcached             |
| 27017 | MongoDB               |

---

## Application Ports

| Port | Application            |
| ---- | ---------------------- |
| 3000 | Node.js / Express      |
| 4000 | Development Server     |
| 5000 | Flask / APIs           |
| 5173 | Vite Development       |
| 5500 | Live Server            |
| 5601 | Kibana                 |
| 5672 | RabbitMQ               |
| 8000 | Django / Python        |
| 8080 | Alternative HTTP       |
| 8081 | Development Server     |
| 8443 | Alternative HTTPS      |
| 9000 | PHP-FPM / Applications |
| 9090 | Prometheus             |

---

## Cloud & DevOps Ports

| Port | Service                    |
| ---- | -------------------------- |
| 2375 | Docker API (Insecure)      |
| 2376 | Docker API (TLS)           |
| 2377 | Docker Swarm               |
| 6443 | Kubernetes API             |
| 7946 | Docker Swarm Communication |
| 8472 | Kubernetes VXLAN           |
| 9093 | Alertmanager               |
| 9100 | Node Exporter              |

---

## Secure Shell (SSH)

Default SSH port:

```text
22/TCP
```

Connect:

```bash
ssh ubuntu@203.0.113.10
```

Change SSH port:

```text
/etc/ssh/sshd_config
```

Example:

```text
Port 2222
```

Restart SSH.

```bash
sudo systemctl restart ssh
```

---

## HTTP & HTTPS

| Port | Purpose |
| ---- | ------- |
| 80   | HTTP    |
| 443  | HTTPS   |

Typical architecture:

```text
Internet

↓

80 / 443

↓

Nginx

↓

3000

↓

Node.js
```

Users only access ports **80** and **443**, while internal services remain private.

---

## Email Ports

| Port | Protocol        |
| ---- | --------------- |
| 25   | SMTP            |
| 465  | SMTPS           |
| 587  | SMTP Submission |
| 110  | POP3            |
| 995  | POP3S           |
| 143  | IMAP            |
| 993  | IMAPS           |

---

## View Listening Ports

Using `ss`:

```bash
ss -tulpn
```

TCP only:

```bash
ss -tlpn
```

UDP only:

```bash
ss -ulpn
```

Example output:

```text
LISTEN

0.0.0.0:22

0.0.0.0:80

0.0.0.0:443

127.0.0.1:3000
```

---

## Using lsof

Find which process uses a port.

```bash
sudo lsof -i :3000
```

Example:

```text
node

PID 1456

TCP *:3000
```

---

## Using netstat

```bash
netstat -tulpn
```

Although `ss` is preferred, `netstat` remains common on older systems.

---

## Test Port Connectivity

Using `nc` (Netcat):

```bash
nc -zv example.com 443
```

Local application:

```bash
nc -zv localhost 3000
```

Successful output:

```text
Connection succeeded
```

---

## Firewall Configuration

Allow SSH.

```bash
sudo ufw allow 22
```

Allow HTTP.

```bash
sudo ufw allow 80
```

Allow HTTPS.

```bash
sudo ufw allow 443
```

Allow a custom application.

```bash
sudo ufw allow 3000
```

View firewall rules.

```bash
sudo ufw status numbered
```

---

## Reserved Ports

Ports below **1024** are considered privileged ports.

Examples:

| Port | Service |
| ---- | ------- |
| 22   | SSH     |
| 53   | DNS     |
| 80   | HTTP    |
| 443  | HTTPS   |

On Linux, binding to these ports typically requires elevated privileges or appropriate capabilities.

---

## Private Application Ports

Typical production setup:

```text
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

In this configuration:

- Port **443** is public.
- Port **3000** is accessible only from the local machine.

This improves security by preventing direct access to the application server.

---

## Port Troubleshooting Workflow

```text
Application Unreachable

↓

Check Service

↓

Check Listening Port

↓

Check Firewall

↓

Check Security Group

↓

Check Reverse Proxy

↓

Resolved
```

---

## Daily Port Commands

```text
Ports

├── ss -tulpn
├── lsof -i
├── netstat -tulpn

Connectivity

├── curl
├── nc
├── ping

Firewall

├── ufw status
├── ufw allow
```

---

## Useful Port Commands

| Command          | Purpose                   |
| ---------------- | ------------------------- |
| `ss -tulpn`      | View listening ports      |
| `lsof -i :PORT`  | Find process using a port |
| `netstat -tulpn` | Legacy port listing       |
| `nc -zv`         | Test connectivity         |
| `curl`           | Test HTTP services        |
| `ufw allow`      | Open firewall port        |
| `ufw status`     | View firewall rules       |

---

## Real-World Example

A production website returns **502 Bad Gateway**.

Investigation begins.

Check Nginx.

```bash
sudo systemctl status nginx
```

Nginx is running.

Check if the backend application is listening.

```bash
ss -tulpn
```

Output:

```text
LISTEN

0.0.0.0:80

0.0.0.0:443
```

Port **3000** is missing.

Check PM2.

```bash
pm2 list
```

The application is offline.

Restart it.

```bash
pm2 restart api
```

Verify.

```bash
ss -tulpn
```

Output:

```text
127.0.0.1:3000
```

The application is now accepting connections, allowing Nginx to proxy requests successfully.

---

## Best Practices

- Expose only required ports to the internet.
- Keep databases on private networks whenever possible.
- Use HTTPS instead of HTTP in production.
- Restrict SSH access using firewall rules and IP allowlists.
- Periodically audit listening ports.
- Place reverse proxies in front of application servers.
- Close unused ports to reduce the attack surface.

---

## Common Mistakes

#### Exposing Database Ports Publicly

Database services such as MySQL, PostgreSQL, MongoDB, and Redis should generally not be accessible directly from the internet.

---

#### Running Applications on Privileged Ports

Bind applications to higher-numbered ports (for example, 3000 or 8080) and let Nginx handle ports 80 and 443.

---

#### Forgetting Firewall Rules

An application may be running correctly but remain inaccessible because the firewall blocks its port.

---

#### Ignoring Listening Addresses

Applications bound only to `127.0.0.1` cannot be reached from external hosts unless accessed through a reverse proxy.

---

#### Assuming a Port Is Open

Always verify with tools such as `ss`, `lsof`, or `nc` instead of relying on assumptions.

---

## Summary

Ports are the foundation of network communication. Understanding common port numbers, associated services, firewall rules, and diagnostic commands enables administrators to deploy secure services, troubleshoot connectivity issues, and maintain production environments with confidence.

---

### Next Chapter

➡️ **09 - Linux Cheat Sheet**
