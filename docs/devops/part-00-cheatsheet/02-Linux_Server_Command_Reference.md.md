---
sidebar_label: Linux Server Setup Cheat Sheet
sidebar_position: 2
---

# Linux Server Setup Cheat Sheet

> A quick reference for all commands used during Linux server provisioning, security hardening, Node.js deployment, Nginx setup, SSL configuration, and production verification.

---

# 1. SSH Connection

```bash
ssh -i "<key.pem>" username@server-ip
```

---

# 2. System Information

```bash
hostnamectl
lscpu
free -h
df -h
timedatectl
```

---

# 3. Package Management

## Update Package List

```bash
sudo apt update
```

## Check Available Updates

```bash
apt list --upgradable
```

## Upgrade Packages

```bash
sudo apt upgrade -y
```

## Install Packages

```bash
sudo apt install fail2ban -y
sudo apt install git -y
sudo apt install unzip zip curl wget build-essential -y
sudo apt install -y nodejs
sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx -y
```

---

# 4. UFW Firewall

## Check Firewall Status

```bash
sudo ufw status
sudo ufw status verbose
sudo ufw status numbered
```

## Allow Services & Ports

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Show Added Rules

```bash
sudo ufw show added
```

## Enable Firewall

```bash
sudo ufw enable
```

---

# 5. Swap Memory

## Create Swap File

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Verify Swap

```bash
free -h
```

## Make Swap Persistent

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
cat /etc/fstab
```

---

# 6. Fail2Ban

## Install

```bash
sudo apt install fail2ban -y
```

## Enable Service

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo systemctl status fail2ban
```

## Check Status

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

## View Jail Configuration

```bash
sudo fail2ban-client get sshd maxretry
sudo fail2ban-client get sshd findtime
sudo fail2ban-client get sshd bantime
```

---

# 7. SSH Hardening

## Check Current SSH Configuration

```bash
sudo grep -E '^(#)?(PasswordAuthentication|PubkeyAuthentication|PermitRootLogin|ChallengeResponseAuthentication|KbdInteractiveAuthentication|UsePAM)' /etc/ssh/sshd_config
```

## Backup SSH Config

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
```

## Edit SSH Config

```bash
sudo nano /etc/ssh/sshd_config
```

## Validate SSH Config

```bash
sudo sshd -t
```

## Reload SSH

```bash
sudo systemctl reload ssh
```

---

# 8. Git

## Install

```bash
sudo apt install git -y
```

## Verify Installation

```bash
git --version
```

## Repository Commands

```bash
git init
git branch -m main
git clone <repository-url>
git pull origin main
git add .
git commit -m "message"
git push origin main
```

---

# 9. General Linux Commands

```bash
pwd
ls
mkdir -p ~/apps
cd ~/apps
cat .env
```

---

# 10. Node.js

## Install Using NodeSource

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## Verify Installation

```bash
node -v
npm -v
```

---

# 11. NVM

## Install

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
```

## Verify

```bash
nvm --version
nvm ls-remote --lts
nvm use system
```

---

# 12. PM2

## Install

```bash
sudo npm install -g pm2
```

## Start Applications

```bash
pm2 start app.js
pm2 start app.js --name uat
pm2 start api.js -i 4
```

## Monitoring

```bash
pm2 list
pm2 monit
pm2 logs
pm2 logs uat --lines 20
```

## Startup

```bash
pm2 startup
pm2 save
```

## Process Management

```bash
pm2 restart all
pm2 stop all
pm2 delete all
```

---

# 13. Nginx

## Install

```bash
sudo apt install nginx -y
```

## Verify

```bash
nginx -v
```

## Service Management

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
```

## Configuration

```bash
sudo nano /etc/nginx/sites-available/uat.makear.co.in
sudo nginx -t
sudo nginx -T | grep server_name
```

## Site Management

```bash
sudo ln -s /etc/nginx/sites-available/uat.makear.co.in /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

## View Configuration

```bash
cat /etc/nginx/sites-available/uat.makear.co.in
sudo cat /etc/nginx/sites-available/uat.makear.co.in
ls -l /etc/nginx/sites-enabled/
```

---

# 14. Networking

## Listening Ports

```bash
sudo ss -tulpn
sudo ss -tulpn | grep :80
```

## HTTP Testing

```bash
curl http://localhost
curl http://127.0.0.1:3000
curl -I http://localhost
curl -I http://uat.makear.co.in
curl -I -H "Host: uat.makear.co.in" http://127.0.0.1
curl -I -H "Host: www.uat.makear.co.in" http://127.0.0.1
```

## Public IP

```bash
curl ifconfig.me
```

## DNS

```bash
nslookup uat.makear.co.in
nslookup www.uat.makear.co.in
```

---

# 15. SSL / Certbot

## Install

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Generate SSL

```bash
sudo certbot --nginx
sudo certbot --nginx -d uat.makear.co.in -d www.uat.makear.co.in
```

## Verify

```bash
certbot --version
sudo systemctl status certbot.timer
```

---

# 16. OpenSSL

## Inspect Certificate

```bash
openssl x509 -in /etc/letsencrypt/live/uat.makear.co.in/fullchain.pem -text -noout | grep "Public-Key"
```

---

# 17. File Operations

```bash
ls -lh /home/iciciadmin/uat.makear.co.in.cer
cd /home/iciciadmin
zip uat.makear.co.in.cer.zip uat.makear.co.in.cer
```

---

# 18. Frequently Used Verification Commands

```bash
hostnamectl
free -h
df -h
timedatectl
systemctl status nginx
systemctl status fail2ban
pm2 list
pm2 logs
sudo nginx -t
sudo ufw status verbose
curl -I http://localhost
curl -I https://your-domain.com
node -v
npm -v
git --version
```
