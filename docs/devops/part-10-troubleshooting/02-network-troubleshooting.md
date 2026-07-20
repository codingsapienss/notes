---
sidebar_label: Network Troubleshooting
sidebar_position: 2
---


# Network Troubleshooting

### Overview

Networking is the backbone of every modern server. Regardless of how well an application is built, it becomes inaccessible if network communication fails.

Network problems can occur due to:

- Incorrect IP configuration
- DNS failures
- Firewall rules
- Routing problems
- Closed ports
- Gateway failures
- ISP issues
- Cloud networking misconfiguration

Unlike application bugs, network issues often affect multiple services simultaneously. Therefore, administrators must follow a structured troubleshooting approach to identify where communication is breaking.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand common network problems.
- Follow a systematic troubleshooting process.
- Test network connectivity.
- Diagnose DNS issues.
- Verify routing.
- Check listening ports.
- Analyze firewall-related problems.
- Resolve common production networking issues.

---

## Understanding Network Communication

Before troubleshooting, understand the communication flow.

```text id="net01"
User

↓

Internet

↓

Cloudflare

↓

Public IP

↓

Firewall

↓

Nginx

↓

Node.js

↓

Database
```

A failure at any layer can prevent users from accessing the application.

---

## Network Troubleshooting Workflow

Always troubleshoot from the outermost layer toward the application.

```text id="net02"
Problem Reported

↓

Check Connectivity

↓

Check DNS

↓

Check Routing

↓

Check Firewall

↓

Check Listening Ports

↓

Check Services

↓

Fix

↓

Verify
```

Avoid skipping steps, as doing so can lead to incorrect conclusions.

---

## Step 1 – Verify Basic Connectivity

The first step is determining whether the server is reachable.

Use `ping`.

```bash id="netcmd01"
ping google.com
```

Example output:

```text id="net03"
64 bytes from google.com

time=22 ms
```

If the ping fails, the server may have:

- No internet connectivity
- Incorrect gateway configuration
- Firewall restrictions
- Network interface problems

---

## Testing Connectivity to an IP Address

Sometimes DNS fails while networking is still functional.

Example:

```bash id="netcmd02"
ping 8.8.8.8
```

Interpretation:

| Result                   | Meaning                |
| ------------------------ | ---------------------- |
| IP works, hostname fails | DNS problem            |
| Both fail                | Connectivity problem   |
| Both succeed             | Network likely healthy |

This simple comparison quickly narrows the scope of investigation.

---

## Step 2 – Verify DNS Resolution

Check whether domain names resolve correctly.

```bash id="netcmd03"
nslookup google.com
```

or

```bash id="netcmd04"
dig google.com
```

Expected flow:

```text id="net04"
Application

↓

DNS Query

↓

DNS Server

↓

IP Address
```

Without DNS resolution, applications cannot locate remote servers by hostname.

---

## Step 3 – Verify Network Interfaces

Display available network interfaces.

```bash id="netcmd05"
ip addr
```

Example:

```text id="net05"
eth0

192.168.1.20
```

Verify:

- Interface is UP.
- Correct IP address is assigned.
- Expected network interface exists.

---

## Step 4 – Verify Routing

Display the routing table.

```bash id="netcmd06"
ip route
```

Example:

```text id="net06"
default via 192.168.1.1
```

The default gateway is responsible for forwarding traffic outside the local network.

Without a valid default route, internet access usually fails.

---

## Step 5 – Test the Network Path

Sometimes connectivity exists, but packets fail somewhere along the route.

Use:

```bash id="netcmd07"
traceroute google.com
```

or

```bash id="netcmd08"
tracepath google.com
```

Example:

```text id="net07"
Server

↓

Router

↓

ISP

↓

Internet

↓

Destination
```

Traceroute identifies where packets stop progressing.

---

## Step 6 – Verify Listening Ports

Even if the server is reachable, the required service may not be listening.

View listening ports.

```bash id="netcmd09"
ss -tulpn
```

Example:

```text id="net08"
Port 80

LISTEN
```

Common ports:

| Port  | Service |
| ----- | ------- |
| 22    | SSH     |
| 80    | HTTP    |
| 443   | HTTPS   |
| 3000  | Node.js |
| 27017 | MongoDB |

---

## Step 7 – Verify Open Ports

Test whether a port is accessible.

Example:

```bash id="netcmd10"
nc -zv localhost 3000
```

Example output:

```text id="net09"
Connection succeeded
```

If the port is closed:

- Application may not be running.
- Firewall may block access.
- Service configuration may be incorrect.

---

## Step 8 – Check Firewall

Firewall rules may prevent legitimate traffic.

Ubuntu UFW:

```bash id="netcmd11"
sudo ufw status
```

View iptables rules:

```bash id="netcmd12"
sudo iptables -L
```

Example:

```text id="net10"
Internet

↓

Firewall

↓

Blocked
```

Always verify firewall rules before assuming an application problem.

---

## Step 9 – Check Active Connections

Display active TCP connections.

```bash id="netcmd13"
ss -ant
```

This helps determine:

- Whether clients are connected.
- Which ports are active.
- Whether connections remain stuck.

---

## Step 10 – Test HTTP Requests

Use `curl` to verify web services.

Example:

```bash id="netcmd14"
curl http://localhost
```

For HTTPS:

```bash id="netcmd15"
curl -I https://example.com
```

Expected response:

```text id="net11"
HTTP/1.1 200 OK
```

This confirms that the web server is responding correctly.

---

## DNS Troubleshooting

Common DNS problems include:

- Incorrect nameserver
- Expired DNS records
- Missing A record
- Missing CNAME
- DNS propagation delay

Troubleshooting process:

```text id="net12"
Domain

↓

DNS Lookup

↓

Resolved?

↓

Yes → Continue

No → Fix DNS
```

---

## Network Troubleshooting Decision Tree

```text id="net13"
Cannot Reach Server

        │

        ▼

Can Ping IP?

   │           │

 Yes          No

 │             │

DNS?      Connectivity

 │

 ▼

Can Reach Port?

 │

 ▼

Application Running?
```

This decision tree helps isolate failures efficiently.

---

## Common Network Problems

| Problem              | Possible Cause                     |
| -------------------- | ---------------------------------- |
| Cannot ping          | Network failure, firewall, gateway |
| DNS not resolving    | DNS server issue                   |
| Website unreachable  | Service stopped, firewall, routing |
| Connection refused   | Service not listening              |
| Connection timed out | Firewall or routing issue          |
| High latency         | Network congestion                 |
| Packet loss          | ISP or hardware issue              |

---

## Useful Network Commands

| Command      | Purpose                     |
| ------------ | --------------------------- |
| `ping`       | Test connectivity           |
| `ip addr`    | View network interfaces     |
| `ip route`   | View routing table          |
| `ss -tulpn`  | View listening ports        |
| `ss -ant`    | View active TCP connections |
| `nslookup`   | DNS lookup                  |
| `dig`        | Advanced DNS diagnostics    |
| `traceroute` | Trace packet path           |
| `tracepath`  | Alternative to traceroute   |
| `curl`       | Test HTTP/HTTPS endpoints   |
| `nc`         | Test TCP/UDP ports          |
| `ufw status` | View firewall status        |

---

## Production Network Troubleshooting Flow

```text id="net14"
User Reports Issue

↓

Ping

↓

DNS

↓

Route

↓

Firewall

↓

Ports

↓

Services

↓

Logs

↓

Fix

↓

Verify
```

Following this sequence avoids unnecessary troubleshooting steps.

---

## Real-World Example

Users report that `https://example.com` is unavailable.

The administrator proceeds as follows:

1. Tests internet connectivity.

```bash id="netcmd16"
ping 8.8.8.8
```

Internet connectivity is working.

2. Checks DNS.

```bash id="netcmd17"
nslookup example.com
```

The domain resolves correctly.

3. Verifies HTTPS connectivity.

```bash id="netcmd18"
curl -I https://example.com
```

The request times out.

4. Checks listening ports.

```bash id="netcmd19"
ss -tulpn
```

Port **443** is not listening.

5. Verifies Nginx.

```bash id="netcmd20"
sudo systemctl status nginx
```

Nginx has stopped because of an invalid configuration.

6. Validates the configuration.

```bash id="netcmd21"
sudo nginx -t
```

A syntax error is reported.

7. Corrects the configuration and restarts Nginx.

```bash id="netcmd22"
sudo systemctl restart nginx
```

8. Runs `curl` again and receives:

```text id="net15"
HTTP/1.1 200 OK
```

The outage was caused by an invalid Nginx configuration rather than a network failure.

---

## Best Practices

- Follow a structured troubleshooting workflow.
- Start with basic connectivity tests.
- Test IP addresses before hostnames.
- Verify DNS separately from network connectivity.
- Check routing before modifying firewall rules.
- Confirm that required ports are listening.
- Validate service configurations before restarting services.
- Verify every fix after implementation.
- Document the root cause and resolution.

---

## Common Mistakes

#### Assuming Every Problem Is a DNS Issue

Many connectivity problems are caused by firewall rules, routing errors, or stopped services.

---

#### Skipping Basic Connectivity Tests

Simple commands like `ping` and `curl` often eliminate multiple possibilities within seconds.

---

#### Ignoring the Routing Table

A missing or incorrect default gateway can make a server appear completely offline.

---

#### Restarting Services Without Diagnosis

Restarting services without understanding the problem may temporarily hide the underlying issue.

---

#### Changing Firewall Rules Randomly

Always verify which traffic is actually blocked before modifying firewall configurations.

---

## Summary

Network troubleshooting is the process of systematically identifying communication failures between systems. By verifying connectivity, DNS resolution, routing, firewall rules, listening ports, and running services in a logical order, administrators can quickly isolate and resolve production networking issues. A disciplined methodology minimizes downtime and reduces unnecessary configuration changes.

---

### Next Chapter

➡️ **03 - SSH Troubleshooting**
