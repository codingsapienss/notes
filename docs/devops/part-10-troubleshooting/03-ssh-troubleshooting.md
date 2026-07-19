---
sidebar_label: SSH Troubleshooting
sidebar_position: 3
---


# SSH Troubleshooting

## Overview

Secure Shell (SSH) is the primary method used by Linux administrators to remotely access servers. If SSH becomes unavailable, administrators may lose the ability to manage production systems remotely.

SSH issues can occur due to:

- Incorrect credentials
- Invalid SSH keys
- Firewall restrictions
- Incorrect file permissions
- SSH daemon failures
- Network connectivity problems
- Configuration errors
- Port misconfiguration

Because SSH is often the only remote management interface, administrators must troubleshoot SSH issues carefully to avoid locking themselves out of the server.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand common SSH failures.
- Diagnose authentication problems.
- Verify SSH service status.
- Troubleshoot SSH key issues.
- Resolve permission problems.
- Verify firewall and port configuration.
- Use SSH debugging tools.
- Apply SSH troubleshooting best practices.

---

# SSH Connection Flow

Understanding the SSH connection process helps identify where failures occur.

```text id="ssh01"
SSH Client

↓

DNS

↓

Server IP

↓

Port 22

↓

SSH Daemon

↓

Authentication

↓

Linux Shell
```

A failure at any stage prevents successful login.

---

# SSH Troubleshooting Workflow

Follow a consistent workflow.

```text id="ssh02"
Cannot Connect

↓

Check Network

↓

Check SSH Port

↓

Check SSH Service

↓

Check Authentication

↓

Check Permissions

↓

Review Logs

↓

Fix

↓

Verify
```

Avoid making configuration changes before determining where the failure occurs.

---

# Step 1 – Verify Network Connectivity

Before troubleshooting SSH itself, confirm that the server is reachable.

Test connectivity.

```bash id="sshcmd01"
ping SERVER_IP
```

If the server cannot be reached:

- Verify internet connectivity.
- Check the public IP address.
- Confirm routing.
- Verify cloud networking configuration.

SSH cannot work if the server is unreachable.

---

# Step 2 – Verify SSH Port

SSH normally listens on port **22**, although some environments use custom ports.

Check connectivity.

```bash id="sshcmd02"
nc -zv SERVER_IP 22
```

Expected result:

```text id="ssh03"
Connection to SERVER_IP 22 succeeded
```

If the port is closed:

- SSH daemon may not be running.
- Firewall may block access.
- SSH may be configured on another port.

---

# Step 3 – Verify SSH Service

Check whether the SSH daemon is running.

Ubuntu:

```bash id="sshcmd03"
sudo systemctl status ssh
```

Example:

```text id="ssh04"
Active: active (running)
```

If the service is stopped:

```bash id="sshcmd04"
sudo systemctl start ssh
```

Enable automatic startup.

```bash id="sshcmd05"
sudo systemctl enable ssh
```

---

# Step 4 – Verify Listening Port

Confirm that SSH is listening.

```bash id="sshcmd06"
ss -tulpn | grep ssh
```

Example:

```text id="ssh05"
LISTEN

0.0.0.0:22
```

If no listening port appears, review the SSH configuration.

---

# Step 5 – Verify SSH Configuration

The primary SSH configuration file is:

```text id="ssh06"
/etc/ssh/sshd_config
```

Common settings:

```text id="ssh07"
Port 22

PermitRootLogin no

PasswordAuthentication yes

PubkeyAuthentication yes
```

After making changes:

```bash id="sshcmd07"
sudo systemctl restart ssh
```

Always validate the configuration before restarting.

```bash id="sshcmd08"
sudo sshd -t
```

---

# Step 6 – Troubleshoot Authentication

Common authentication failures include:

```text id="ssh08"
Permission denied (publickey)

Permission denied (password)
```

Possible causes:

- Incorrect username
- Incorrect password
- Invalid SSH key
- Disabled password authentication
- Incorrect permissions

Authentication failures are among the most common SSH issues.

---

# Password Authentication Problems

If password authentication is enabled:

Verify:

- Correct username.
- Correct password.
- PasswordAuthentication setting.
- User account status.

Example:

```text id="ssh09"
Client

↓

Password

↓

SSH Server

↓

Authentication
```

---

# SSH Key Authentication

SSH keys are preferred for production environments.

Authentication process:

```text id="ssh10"
Private Key

↓

SSH Client

↓

Public Key

↓

authorized_keys

↓

Login
```

If login fails:

- Verify the correct private key is being used.
- Confirm the public key exists in `authorized_keys`.
- Verify permissions.

---

# Verify File Permissions

SSH enforces strict permissions.

Typical permissions:

```bash id="sshcmd09"
chmod 700 ~/.ssh
```

```bash id="sshcmd10"
chmod 600 ~/.ssh/authorized_keys
```

Incorrect permissions may cause SSH to reject valid keys.

---

# Verify User Permissions

Ensure the user account exists.

```bash id="sshcmd11"
id username
```

Verify the home directory.

```bash id="sshcmd12"
ls -ld /home/username
```

A missing home directory or incorrect ownership can prevent login.

---

# Review SSH Logs

SSH logs provide valuable diagnostic information.

Ubuntu:

```bash id="sshcmd13"
sudo journalctl -u ssh
```

or

```bash id="sshcmd14"
sudo tail -f /var/log/auth.log
```

Common log messages:

- Invalid user
- Authentication failed
- Permission denied
- Connection closed
- Bad ownership or modes

Always review logs before changing configuration.

---

# Debugging SSH Client

Increase client-side logging.

```bash id="sshcmd15"
ssh -v user@server
```

More detailed output:

```bash id="sshcmd16"
ssh -vvv user@server
```

Example:

```text id="ssh11"
Connecting...

Authenticating...

Permission denied
```

Verbose mode shows every stage of the SSH connection process.

---

# Firewall Troubleshooting

Verify that the firewall allows SSH.

Ubuntu UFW:

```bash id="sshcmd17"
sudo ufw status
```

Allow SSH:

```bash id="sshcmd18"
sudo ufw allow 22
```

If using a custom port:

```bash id="sshcmd19"
sudo ufw allow 2222
```

Cloud firewalls or security groups should also be verified.

---

# Custom SSH Port

Many production servers use a non-default SSH port.

Example:

```text id="ssh12"
SSH Port

↓

2222
```

Connect using:

```bash id="sshcmd20"
ssh -p 2222 user@server
```

Ensure both the SSH daemon configuration and firewall allow the custom port.

---

# SSH Troubleshooting Decision Tree

```text id="ssh13"
Cannot Connect

       │

       ▼

Can Ping Server?

  │          │

Yes         No

 │

 ▼

Port Open?

 │

 ▼

SSH Running?

 │

 ▼

Authentication?

 │

 ▼

Permissions?

 │

 ▼

Login Successful
```

Following this sequence prevents unnecessary troubleshooting steps.

---

# Common SSH Errors

| Error                        | Possible Cause                   |
| ---------------------------- | -------------------------------- |
| Connection refused           | SSH service stopped              |
| Connection timed out         | Firewall or network issue        |
| Permission denied            | Invalid credentials or keys      |
| No route to host             | Routing or gateway issue         |
| Host key verification failed | Changed server fingerprint       |
| Connection reset             | SSH daemon terminated connection |

---

# Useful SSH Commands

| Command                     | Purpose                      |
| --------------------------- | ---------------------------- |
| `systemctl status ssh`      | Check SSH service            |
| `systemctl restart ssh`     | Restart SSH service          |
| `ss -tulpn`                 | View listening ports         |
| `ssh -v`                    | Enable verbose client output |
| `ssh -vvv`                  | Maximum client debugging     |
| `journalctl -u ssh`         | SSH service logs             |
| `tail -f /var/log/auth.log` | Authentication logs          |
| `chmod 700 ~/.ssh`          | Secure SSH directory         |
| `chmod 600 authorized_keys` | Secure authorized keys       |
| `nc -zv server 22`          | Test SSH port                |

---

# Production Troubleshooting Workflow

```text id="ssh14"
Cannot Login

↓

Connectivity

↓

Port

↓

SSH Service

↓

Configuration

↓

Authentication

↓

Permissions

↓

Logs

↓

Fix

↓

Verify
```

This workflow minimizes the risk of overlooking a common cause.

---

# Real-World Example

A developer reports that they can no longer connect to a production server using SSH.

The administrator performs the following steps:

1. Confirms the server is reachable.

```bash id="sshcmd21"
ping SERVER_IP
```

2. Verifies that port **22** is open.

```bash id="sshcmd22"
nc -zv SERVER_IP 22
```

3. Checks the SSH service.

```bash id="sshcmd23"
sudo systemctl status ssh
```

The service is running.

4. Uses verbose SSH output.

```bash id="sshcmd24"
ssh -vvv user@SERVER_IP
```

The output shows:

```text id="ssh15"
Permission denied (publickey)
```

5. Reviews the user's `authorized_keys` file and discovers it has incorrect permissions.

6. Fixes the permissions.

```bash id="sshcmd25"
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

7. The developer reconnects successfully.

The issue was caused by file permissions rather than an SSH service failure.

---

# Best Practices

- Prefer SSH keys over passwords.
- Validate SSH configuration before restarting the service.
- Keep an active SSH session open while making configuration changes.
- Restrict SSH access using firewalls or security groups.
- Use verbose client output for debugging.
- Review authentication logs before modifying settings.
- Test connectivity before assuming authentication problems.
- Document configuration changes.

---

# Common Mistakes

### Restarting SSH Without Validating Configuration

An invalid configuration may prevent the SSH service from starting, potentially locking administrators out of the server.

---

### Incorrect File Permissions

SSH requires strict permissions for the `.ssh` directory and `authorized_keys` file.

---

### Forgetting Firewall Rules

The SSH service may be running correctly while the firewall blocks access.

---

### Closing the Only Active SSH Session

Always keep an existing session open while modifying SSH settings to avoid losing remote access.

---

### Assuming Authentication Is the Problem

Many SSH failures are caused by networking, firewall, or service issues rather than invalid credentials.

---

# Summary

SSH troubleshooting involves systematically verifying connectivity, port availability, SSH service status, configuration, authentication, file permissions, and logs. By following a structured workflow and using tools such as `systemctl`, `ss`, `journalctl`, and verbose SSH client output, administrators can efficiently diagnose and resolve remote access issues while minimizing the risk of server lockout.

---

## Next Chapter

➡️ **04 - Nginx Troubleshooting**
