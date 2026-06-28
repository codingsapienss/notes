---
sidebar_label: Complete Deployment Walkthrough
sidebar_position: 11
---


# Complete Deployment Walkthrough

## Overview

Throughout this part, we learned every individual component involved in deploying a Node.js application to production.

We covered:

- Preparing a Linux server
- Deploying a Node.js application
- Configuring Nginx
- Connecting a domain
- Enabling HTTPS
- Managing applications with PM2
- Zero-downtime deployment
- Production upgrades
- Backup and rollback

This chapter combines everything into a single deployment workflow that can be followed whenever a new production server is created.

By the end of this chapter, you will understand the complete lifecycle of deploying a production-ready Node.js application.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Deploy a production application from scratch.
- Configure every required component.
- Understand the deployment sequence.
- Verify production readiness.
- Troubleshoot common deployment issues.
- Follow deployment best practices.

---

# Production Architecture

Complete deployment architecture:

```text id="walk01"
                 Users
                    │
                    ▼
             Cloudflare DNS
                    │
                    ▼
            Cloudflare CDN
                    │
              HTTPS (443)
                    │
                    ▼
              Azure Public IP
                    │
                    ▼
              Ubuntu Server
                    │
                    ▼
                 Nginx
                    │
             Reverse Proxy
                    │
                    ▼
                 PM2
                    │
                    ▼
            Node.js Application
                    │
                    ▼
                MongoDB
```

Every request follows this path before reaching the application.

---

# Step 1 — Create the Virtual Machine

Provision an Ubuntu Virtual Machine.

Recommended configuration:

| Component | Recommendation   |
| --------- | ---------------- |
| OS        | Ubuntu LTS       |
| CPU       | 2 vCPU or higher |
| RAM       | 4 GB or more     |
| Public IP | Static           |
| SSH       | Enabled          |
| Firewall  | 22, 80, 443      |

---

# Step 2 — Connect to the Server

Connect using SSH.

```bash id="walkcmd01"
ssh username@SERVER_PUBLIC_IP
```

Verify connectivity.

```bash id="walkcmd02"
whoami
```

Check operating system.

```bash id="walkcmd03"
lsb_release -a
```

---

# Step 3 — Update the Server

Update package information.

```bash id="walkcmd04"
sudo apt update
```

Upgrade installed packages.

```bash id="walkcmd05"
sudo apt upgrade -y
```

This ensures the server starts from an up-to-date state.

---

# Step 4 — Install Required Software

Install Git.

```bash id="walkcmd06"
sudo apt install git -y
```

Install Node.js.

```bash id="walkcmd07"
node -v
```

Install PM2.

```bash id="walkcmd08"
npm install -g pm2
```

Install Nginx.

```bash id="walkcmd09"
sudo apt install nginx -y
```

Verify services.

```bash id="walkcmd10"
sudo systemctl status nginx
```

---

# Step 5 — Clone the Project

Navigate to the application directory.

```bash id="walkcmd11"
mkdir -p ~/apps
```

```bash id="walkcmd12"
cd ~/apps
```

Clone the repository.

```bash id="walkcmd13"
git clone <repository-url>
```

Navigate into the project.

```bash id="walkcmd14"
cd project
```

---

# Step 6 — Install Dependencies

```bash id="walkcmd15"
npm install
```

If required:

```bash id="walkcmd16"
npm run build
```

Verify package installation completes successfully.

---

# Step 7 — Configure Environment Variables

Create the environment file.

```bash id="walkcmd17"
nano .env
```

Example:

```text id="walk02"
PORT=3000
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
```

Save the file.

---

# Step 8 — Start the Application

Start using PM2.

```bash id="walkcmd18"
pm2 start app.js --name ecommerce-api
```

Verify.

```bash id="walkcmd19"
pm2 list
```

View logs.

```bash id="walkcmd20"
pm2 logs ecommerce-api
```

---

# Step 9 — Configure Nginx

Create a Server Block.

```bash id="walkcmd21"
sudo nano /etc/nginx/sites-available/project
```

Example:

```nginx id="walkcfg01"
server {
    listen 80;

    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

Enable the configuration.

```bash id="walkcmd22"
sudo ln -s /etc/nginx/sites-available/project /etc/nginx/sites-enabled/
```

Test configuration.

```bash id="walkcmd23"
sudo nginx -t
```

Reload Nginx.

```bash id="walkcmd24"
sudo systemctl reload nginx
```

---

# Step 10 — Configure the Domain

Configure DNS records.

| Type  | Host | Value       |
| ----- | ---- | ----------- |
| A     | @    | Public IP   |
| CNAME | www  | example.com |

Verify DNS.

```bash id="walkcmd25"
nslookup example.com
```

Wait for propagation before continuing.

---

# Step 11 — Enable HTTPS

Install Certbot.

```bash id="walkcmd26"
sudo apt install certbot python3-certbot-nginx -y
```

Request certificates.

```bash id="walkcmd27"
sudo certbot --nginx -d example.com -d www.example.com
```

Verify HTTPS.

```text id="walk03"
https://example.com
```

---

# Step 12 — Configure Cloudflare

Enable:

- DNS Proxy
- SSL/TLS → Full (Strict)
- Automatic HTTPS Rewrites
- Always Use HTTPS

Architecture:

```text id="walk04"
Users

↓

Cloudflare

↓

HTTPS

↓

Nginx
```

---

# Step 13 — Save PM2 Configuration

Save running applications.

```bash id="walkcmd28"
pm2 save
```

Enable startup.

```bash id="walkcmd29"
pm2 startup
```

Execute the generated command.

This ensures applications start automatically after server reboots.

---

# Step 14 — Verify Deployment

Check:

| Component | Status    |
| --------- | --------- |
| Node.js   | Running   |
| PM2       | Online    |
| Nginx     | Running   |
| HTTPS     | Working   |
| Domain    | Resolving |
| Database  | Connected |

Verify every component before considering deployment complete.

---

# Complete Deployment Flow

```text id="walk05"
Create VM

↓

Install Software

↓

Clone Repository

↓

Install Packages

↓

Configure .env

↓

Start PM2

↓

Configure Nginx

↓

Configure DNS

↓

Enable HTTPS

↓

Configure Cloudflare

↓

Verify

↓

Production Ready
```

---

# Deployment Verification Commands

Useful commands after deployment.

Check PM2.

```bash id="walkcmd30"
pm2 list
```

View logs.

```bash id="walkcmd31"
pm2 logs
```

Check Nginx.

```bash id="walkcmd32"
sudo systemctl status nginx
```

Validate configuration.

```bash id="walkcmd33"
sudo nginx -t
```

Check firewall.

```bash id="walkcmd34"
sudo ufw status
```

Check open ports.

```bash id="walkcmd35"
ss -tulpn
```

---

# Troubleshooting Workflow

```text id="walk06"
Website Not Working

↓

Domain?

↓

DNS?

↓

HTTPS?

↓

Nginx?

↓

PM2?

↓

Application?

↓

Database?
```

Troubleshoot from the outermost layer inward rather than beginning with the application.

---

# Deployment Checklist

| Task                             | Completed |
| -------------------------------- | --------- |
| VM Created                       | ✓         |
| Static Public IP Assigned        | ✓         |
| Ubuntu Updated                   | ✓         |
| Node.js Installed                | ✓         |
| PM2 Installed                    | ✓         |
| Nginx Installed                  | ✓         |
| Repository Cloned                | ✓         |
| Dependencies Installed           | ✓         |
| Environment Variables Configured | ✓         |
| Application Running              | ✓         |
| Nginx Configured                 | ✓         |
| Domain Connected                 | ✓         |
| HTTPS Enabled                    | ✓         |
| Cloudflare Configured            | ✓         |
| PM2 Startup Enabled              | ✓         |
| Deployment Verified              | ✓         |

---

# Real-World Example

A company wants to launch a new customer portal.

The DevOps engineer performs the following steps:

1. Creates an Ubuntu Virtual Machine in Azure.
2. Assigns a Static Public IP.
3. Installs Git, Node.js, PM2, and Nginx.
4. Clones the project repository.
5. Installs project dependencies.
6. Configures the production `.env` file.
7. Starts the application using PM2.
8. Configures Nginx as a reverse proxy.
9. Points the company's domain to the server using DNS records.
10. Obtains SSL certificates with Certbot.
11. Enables HTTPS.
12. Configures Cloudflare with **Full (Strict)** SSL.
13. Saves the PM2 process list and enables automatic startup.
14. Verifies logs, application status, API endpoints, and HTTPS access.

The customer portal is now securely available to users over the Internet.

---

# Best Practices

- Automate repetitive deployment tasks where possible.
- Use a Static Public IP in production.
- Keep environment variables outside source control.
- Always use HTTPS.
- Test Nginx configurations before reloading.
- Monitor logs after every deployment.
- Create backups before upgrades.
- Use PM2 for process management.
- Enable automatic application startup.
- Document every production deployment.

---

# Common Mistakes

### Deploying Without Verification

A deployment should not be considered complete until every critical service has been verified.

---

### Exposing Node.js Directly

Production traffic should pass through Nginx rather than connecting directly to the Node.js application.

---

### Forgetting Environment Variables

Missing or incorrect `.env` values are a common cause of startup failures.

---

### Ignoring Logs

Deployment issues often become immediately apparent in PM2 or Nginx logs.

---

### Skipping Backups

Creating backups before deployments and upgrades provides a recovery path if unexpected issues occur.

---

# Summary

This chapter combined every concept from the Deployment section into a complete production workflow. Beginning with provisioning an Ubuntu Virtual Machine, the process continued through software installation, application deployment, Nginx configuration, DNS setup, HTTPS enablement, Cloudflare integration, PM2 configuration, and deployment verification. Following this structured sequence helps produce reliable, secure, and maintainable Node.js deployments suitable for real-world production environments.

---

## Next Chapter

➡️ **Part 9 — Monitoring and Logging**
