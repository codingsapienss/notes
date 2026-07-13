---
sidebar_label: UAT VM Deployment Cheat Sheet (Azure + Ubuntu 24.04)
sidebar_position: 1
---

# UAT VM Deployment Cheat Sheet (Azure + Ubuntu 24.04)

> Use this as the checklist for every new VM (UAT/Production).

---

# 1. Update Server

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

---

# 2. Install Basic Packages

```bash
sudo apt install -y git curl wget unzip zip build-essential ufw fail2ban
```

Verify

```bash
git --version
curl --version
wget --version
```

---

# 3. Configure Firewall (UFW)

Allow

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Verify

```bash
sudo ufw status
```

---

# 4. Enable Fail2Ban

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo systemctl status fail2ban
```

Check configuration

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd

sudo fail2ban-client get sshd maxretry
sudo fail2ban-client get sshd findtime
sudo fail2ban-client get sshd bantime
```

(Default)

- maxretry = 5
- findtime = 600
- bantime = 600

---

# 5. Verify SSH

```bash
sudo grep -E '^(#)?(PasswordAuthentication|PubkeyAuthentication|PermitRootLogin|ChallengeResponseAuthentication|KbdInteractiveAuthentication|UsePAM)' /etc/ssh/sshd_config
```

(Currently using SSH Key authentication.)

---

# 6. Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
```

Verify

```bash
nvm --version
```

---

# 7. Install Node.js LTS

```bash
nvm install --lts
nvm use --lts
nvm alias default lts/*
```

Verify

```bash
node -v
npm -v
```

---

# 8. Install PM2

```bash
npm install -g pm2
```

---

# 9. Install Nginx

```bash
sudo apt install nginx -y

sudo systemctl enable nginx
sudo systemctl start nginx

sudo systemctl status nginx
```

Verify

```bash
nginx -v

curl http://localhost
```

---

# 10. Clone Project

```bash
mkdir ~/apps
cd ~/apps

git clone <repo>
```

---

# 11. Start Application

```bash
pm2 start app.js --name uat

pm2 save
pm2 startup
```

Logs

```bash
pm2 status
pm2 logs uat
```

---

# 12. Configure Nginx Reverse Proxy

Create

```bash
sudo nano /etc/nginx/sites-available/uat.makear.co.in
```

Configuration

```nginx
server {
    listen 80;

    server_name uat.makear.co.in www.uat.makear.co.in;

    location / {

        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable

```bash
sudo ln -s /etc/nginx/sites-available/uat.makear.co.in /etc/nginx/sites-enabled/
```

(Test if already exists)

```bash
ls -l /etc/nginx/sites-enabled/
```

Verify

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

# 13. DNS (Cloudflare)

Added

```
A
uat.makear.co.in
→ Azure Public IP

CNAME
www.uat.makear.co.in
→ uat.makear.co.in
```

---

# 14. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Verify

```bash
certbot --version
```

---

# 15. Generate 4096-bit SSL Certificate

```bash
sudo certbot --nginx \
--key-type rsa \
--rsa-key-size 4096 \
-d uat.makear.co.in \
-d www.uat.makear.co.in
```

Certbot automatically

- Generated certificate
- Modified nginx
- Enabled HTTPS
- Configured renewal

---

# 16. Verify SSL

Confirm 4096-bit key

```bash
sudo openssl x509 \
-in /etc/letsencrypt/live/uat.makear.co.in/fullchain.pem \
-text -noout | grep "Public-Key"
```

Expected

```
Public-Key: (4096 bit)
```

View complete certificate

```bash
sudo openssl x509 \
-in /etc/letsencrypt/live/uat.makear.co.in/fullchain.pem \
-text -noout
```

---

# 17. Auto Renewal

Verify

```bash
sudo systemctl status certbot.timer
```

Renewal test

```bash
sudo certbot renew --dry-run
```

---

# 18. ICICI Onboarding Information Collected

- Azure Public IP
- Domain
- 4096-bit RSA CA Signed SSL
- X.509 Certificate
- HTTPS Enabled
- Auto Renewal Enabled

Certificate Location

```
/etc/letsencrypt/live/uat.makear.co.in/
```

Public Certificate

```
fullchain.pem
```

Private Key

```
privkey.pem
```

---

# 19. Useful Commands

```bash
pm2 status

pm2 logs uat

sudo nginx -t

sudo systemctl reload nginx

sudo systemctl restart nginx

sudo systemctl status nginx

sudo ufw status

sudo fail2ban-client status

sudo certbot renew --dry-run
```

---

# Status

✅ Ubuntu Updated

✅ Firewall Configured

✅ Fail2Ban Enabled

✅ SSH Key Login

✅ Git Installed

✅ Node.js Installed

✅ PM2 Installed

✅ Nginx Installed

✅ Reverse Proxy Configured

✅ Dummy App Deployed

✅ HTTPS Enabled

✅ 4096-bit RSA SSL Installed

✅ Automatic SSL Renewal Enabled

✅ Ready for ICICI UAT Onboarding
