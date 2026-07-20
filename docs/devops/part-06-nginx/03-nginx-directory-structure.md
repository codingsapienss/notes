---
sidebar_label: Nginx Directory Structure
sidebar_position: 3
---


# Nginx Directory Structure

### Overview

After installing Nginx, it is important to understand **where everything is stored**.

Unlike many applications that keep all configuration in a single file, Nginx organizes its configuration across multiple directories. This modular structure makes it easier to:

- Manage multiple websites
- Organize configurations
- Enable or disable sites
- Separate logs from configuration
- Scale deployments

Before creating reverse proxies or hosting websites, you should become familiar with the Nginx directory layout.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand the Nginx directory structure.
- Learn the purpose of important directories.
- Understand how configuration files are organized.
- Learn how sites are enabled and disabled.
- Locate log files.
- Understand the Nginx configuration hierarchy.
- Navigate the Nginx installation confidently.

---

## Nginx Installation Layout

A default Ubuntu installation creates several directories.

```text
/etc/nginx/
│
├── nginx.conf
├── conf.d/
├── modules-enabled/
├── mime.types
├── proxy_params
├── fastcgi_params
├── snippets/
├── sites-available/
└── sites-enabled/
```

Log files are stored separately.

```text
/var/log/nginx/
```

The web root is typically:

```text
/var/www/html/
```

---

## Overall Directory Structure

A simplified view:

```text
Ubuntu
│
├── /etc/nginx/
│      │
│      ├── Configuration
│      ├── Sites
│      └── Modules
│
├── /var/log/nginx/
│      │
│      └── Logs
│
└── /var/www/
       │
       └── Website Files
```

Each directory has a dedicated responsibility.

---

## The Main Configuration File

The central configuration file is:

```text
/etc/nginx/nginx.conf
```

View it:

```bash
cat /etc/nginx/nginx.conf
```

or

```bash
nano /etc/nginx/nginx.conf
```

This file contains the global Nginx configuration.

Example structure:

```text
nginx.conf
│
├── Events
├── HTTP
│
├── Include Sites
│
└── Global Settings
```

Almost every other configuration file is eventually loaded from `nginx.conf`.

---

## Configuration Hierarchy

The configuration loading process looks like this.

```text
nginx.conf
      │
      ▼
Include Files
      │
      ▼
sites-enabled
      │
      ▼
Website Configuration
```

Nginx starts by reading `nginx.conf`, which then includes additional configuration files.

---

## The sites-available Directory

Location:

```text
/etc/nginx/sites-available/
```

Purpose:

Store configuration files for every website or application.

Example:

```text
sites-available/
│
├── default
├── api.example.com
├── admin.example.com
└── dashboard.example.com
```

A file in this directory **does not automatically become active**.

Think of this directory as a library of available site configurations.

---

## The sites-enabled Directory

Location:

```text
/etc/nginx/sites-enabled/
```

Purpose:

Contains symbolic links to the site configurations that are currently active.

Example:

```text
sites-enabled/
│
├── default
└── api.example.com
```

Only the configurations present in this directory are loaded by Nginx.

---

## How Sites are Enabled

```text
sites-available
        │
        ▼
Configuration File
        │
Create Symbolic Link
        │
        ▼
sites-enabled
        │
        ▼
Nginx Loads Site
```

This approach allows administrators to enable or disable websites without deleting their configuration files.

---

## Creating a Symbolic Link

Enable a site:

```bash
sudo ln -s /etc/nginx/sites-available/my-app \
/etc/nginx/sites-enabled/
```

Verify:

```bash
ls -l /etc/nginx/sites-enabled
```

Example:

```text
my-app -> /etc/nginx/sites-available/my-app
```

---

## Disabling a Site

Remove the symbolic link.

```bash
sudo rm /etc/nginx/sites-enabled/my-app
```

Then reload Nginx.

```bash
sudo systemctl reload nginx
```

The configuration file remains safely stored inside `sites-available`.

---

## The conf.d Directory

Location:

```text
/etc/nginx/conf.d/
```

Purpose:

Contains additional configuration files.

Example:

```text
conf.d/
│
├── compression.conf
├── security.conf
└── cache.conf
```

Many organizations use this directory for shared configuration that applies across multiple websites.

---

## The snippets Directory

Location:

```text
/etc/nginx/snippets/
```

Purpose:

Reusable configuration fragments.

Example:

```text
snippets/
│
├── ssl.conf
├── security-headers.conf
└── gzip.conf
```

Instead of duplicating configuration across many sites, snippets allow common settings to be included wherever needed.

---

## The modules-enabled Directory

Location:

```text
/etc/nginx/modules-enabled/
```

Purpose:

Contains enabled Nginx modules.

Example:

```text
modules-enabled/
│
├── 50-mod-http-image-filter.conf
└── 50-mod-stream.conf
```

Most standard deployments rarely require manual changes here.

---

## MIME Types

Location:

```text
/etc/nginx/mime.types
```

This file maps file extensions to content types.

Example:

| Extension | MIME Type                |
| --------- | ------------------------ |
| `.html`   | `text/html`              |
| `.css`    | `text/css`               |
| `.js`     | `application/javascript` |
| `.png`    | `image/png`              |

When a browser requests a file, Nginx uses these mappings to send the correct `Content-Type` header.

---

## Proxy Parameters

Useful helper files include:

```text
proxy_params

fastcgi_params

uwsgi_params
```

These contain predefined parameters used when forwarding requests to backend services.

For Node.js applications, `proxy_params` is commonly included in reverse proxy configurations.

---

## Log Directory

Logs are stored separately.

```text
/var/log/nginx/
```

Typical contents:

```text
nginx/
│
├── access.log
└── error.log
```

| Log File     | Purpose                |
| ------------ | ---------------------- |
| `access.log` | Every incoming request |
| `error.log`  | Errors and warnings    |

These logs are essential for troubleshooting.

---

## Web Root

The default web root is:

```text
/var/www/html/
```

Example:

```text
/var/www/html/
│
├── index.html
├── css/
├── js/
└── images/
```

When someone visits the server before any custom configuration is created, Nginx serves files from this directory.

For Node.js applications using a reverse proxy, the application code is usually stored elsewhere (for example, `/var/www/my-app`), while Nginx simply forwards requests to it.

---

## Viewing the Directory Structure

List the configuration directory:

```bash
ls -la /etc/nginx
```

List enabled sites:

```bash
ls -la /etc/nginx/sites-enabled
```

List available sites:

```bash
ls -la /etc/nginx/sites-available
```

List logs:

```bash
ls -la /var/log/nginx
```

These commands help you quickly inspect an Nginx installation.

---

## Configuration Workflow

A common workflow when adding a new application:

```text
Create Configuration
        │
        ▼
sites-available
        │
        ▼
Create Symbolic Link
        │
        ▼
sites-enabled
        │
        ▼
nginx -t
        │
        ▼
Reload Nginx
```

This minimizes the risk of configuration errors affecting existing websites.

---

## Real-World Example

Suppose you deploy an Express.js application named `inventory-api`.

Project directory:

```text
/var/www/inventory-api
```

Nginx configuration:

```text
/etc/nginx/sites-available/inventory-api
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/inventory-api \
/etc/nginx/sites-enabled/
```

Verify the configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

If the configuration contains no errors, Nginx begins serving requests for the new application while preserving the existing directory structure and configuration organization.

---

## Best Practices

- Keep global settings inside `nginx.conf`.
- Store individual website configurations in `sites-available`.
- Enable sites using symbolic links in `sites-enabled`.
- Use `snippets` for reusable configuration.
- Keep logs under `/var/log/nginx`.
- Test configurations using `nginx -t` before reloading.
- Use descriptive names for site configuration files.

---

## Common Mistakes

#### Editing Files in sites-enabled Directly

Since files in `sites-enabled` are symbolic links, edit the original configuration in `sites-available` instead.

---

#### Deleting Configuration Files Instead of Disabling Them

Removing the symbolic link is safer than deleting the configuration file.

---

#### Ignoring Configuration Organization

Placing every setting inside `nginx.conf` makes large deployments difficult to maintain.

---

#### Forgetting to Test Configuration

Always validate configuration with `nginx -t` before reloading the service.

---

#### Mixing Application Code with Web Server Configuration

Keep application source code under directories such as `/var/www/my-app` and Nginx configuration under `/etc/nginx`.

---

## Summary

Nginx organizes its configuration into a modular directory structure that separates global settings, individual site configurations, reusable snippets, logs, and web content. Understanding directories such as `sites-available`, `sites-enabled`, `conf.d`, `snippets`, and `/var/log/nginx` is essential for managing production servers efficiently. This structure allows administrators to enable, disable, and maintain websites with minimal risk while keeping configurations clean and scalable.

---

### Next Chapter

➡️ **04 - Server Blocks**
