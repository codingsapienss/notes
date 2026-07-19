---
sidebar_label: Package Management
sidebar_position: 7
---


# Package Management

## Overview

One of the biggest advantages of Linux is its centralized software management system.

Unlike some operating systems where software is typically downloaded from individual websites, Linux distributions use **package managers** that install, update, and remove software from trusted repositories.

Package management simplifies software installation, ensures dependencies are handled automatically, and keeps systems secure through regular updates.

For Ubuntu and Debian-based systems, the primary package manager is **APT (Advanced Package Tool)**.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand what packages are.
- Learn how package managers work.
- Understand software repositories.
- Install, update, upgrade, and remove packages.
- Learn the difference between `apt` and `dpkg`.
- Manage software safely on production servers.

---

# What is a Package?

A **package** is a compressed file that contains everything required to install a piece of software.

A package typically includes:

- Executable programs
- Libraries
- Configuration files
- Documentation
- Metadata
- Installation scripts

Instead of manually copying files into various system directories, the package manager performs these tasks automatically.

---

# Why Package Management?

Imagine installing Nginx manually.

You would need to:

- Download the source code.
- Install required libraries.
- Compile the software.
- Copy files to the correct directories.
- Configure permissions.
- Register the service.

A package manager automates these steps with a single command.

Example:

```bash id="9k5v1q"
sudo apt install nginx
```

---

# How Package Management Works

The installation process generally follows this sequence:

```text id="k7m1wz"
User
   │
   ▼
APT
   │
   ▼
Repository
   │
   ▼
Download Package
   │
   ▼
Resolve Dependencies
   │
   ▼
Install Software
   │
   ▼
Ready to Use
```

APT downloads packages from trusted repositories, verifies them, installs required dependencies, and configures the software.

---

# What is APT?

**APT (Advanced Package Tool)** is the default package management system for Ubuntu and Debian-based Linux distributions.

It provides commands to:

- Install software
- Remove software
- Update package information
- Upgrade installed packages
- Search available packages
- Manage software dependencies

APT works with packages in the `.deb` format.

---

# What is a Repository?

A **repository** is a server that stores software packages.

Instead of downloading software from random websites, Linux retrieves packages from configured repositories.

```text id="3t4wfd"
Ubuntu Server
       │
       ▼
Ubuntu Repository
       │
       ▼
Download Packages
       │
       ▼
Install on System
```

Repositories are maintained by distribution maintainers and are regularly updated with security patches and bug fixes.

---

# Package Installation Workflow

Suppose you install Git.

```bash id="u2d9yx"
sudo apt install git
```

APT performs several tasks:

1. Checks configured repositories.
2. Finds the requested package.
3. Resolves dependencies.
4. Downloads required files.
5. Verifies package integrity.
6. Installs the software.
7. Configures the package.

The user only needs to execute a single command.

---

# Updating Package Information

Before installing software, update the local package index.

```bash id="n5r8co"
sudo apt update
```

This command:

- Downloads the latest package information.
- Refreshes repository metadata.
- Does **not** install updates.

Think of it as refreshing the catalog of available software.

---

# Upgrading Installed Packages

Upgrade installed packages:

```bash id="e0q6mj"
sudo apt upgrade
```

This installs newer versions of already-installed packages.

Typical workflow:

```bash id="l4g2hw"
sudo apt update
sudo apt upgrade
```

The first command refreshes package information, and the second installs available updates.

---

# Installing Packages

Install software using:

```bash id="1r9cve"
sudo apt install package-name
```

Examples:

Install Git:

```bash id="b7xv21"
sudo apt install git
```

Install Nginx:

```bash id="g6m3fy"
sudo apt install nginx
```

Install Node.js (from Ubuntu repositories):

```bash id="n8a5wr"
sudo apt install nodejs
```

APT automatically installs required dependencies.

---

# Removing Packages

Remove a package while keeping configuration files:

```bash id="2k1nqs"
sudo apt remove nginx
```

Completely remove a package and its configuration files:

```bash id="d5f8pa"
sudo apt purge nginx
```

After removing packages, unused dependencies can be cleaned up.

---

# Removing Unused Dependencies

Run:

```bash id="y7m4ec"
sudo apt autoremove
```

APT removes libraries and packages that are no longer required.

This helps keep the system clean.

---

# Searching for Packages

Search repositories:

```bash id="x6n0ld"
apt search nginx
```

Example output:

```text id="w9e2ta"
nginx
nginx-common
nginx-core
nginx-full
```

This command is useful when you know part of a package name but not the exact package.

---

# Viewing Installed Packages

List installed packages:

```bash id="q3z8jm"
apt list --installed
```

Search installed packages:

```bash id="h0v5tn"
apt list --installed | grep nginx
```

---

# Package Information

View detailed information:

```bash id="r2g7kf"
apt show nginx
```

Example information includes:

- Version
- Dependencies
- Maintainer
- Description
- Installed size

---

# What is dpkg?

`dpkg` is the low-level package management tool used by Debian-based systems.

APT actually uses `dpkg` internally to install `.deb` packages.

Comparison:

| Tool   | Purpose                                               |
| ------ | ----------------------------------------------------- |
| `apt`  | High-level package manager with dependency resolution |
| `dpkg` | Low-level package installation tool                   |

Normally, administrators interact with APT rather than `dpkg`.

---

# Installing a Local Package

If you download a `.deb` file manually:

```text id="3x5jqc"
software.deb
```

Install it using:

```bash id="m4t9we"
sudo dpkg -i software.deb
```

If dependencies are missing:

```bash id="v8c2rl"
sudo apt --fix-broken install
```

APT downloads the required packages automatically.

---

# Where Packages Are Installed

Package files are distributed across multiple directories.

Examples:

| Directory    | Purpose                            |
| ------------ | ---------------------------------- |
| `/usr/bin`   | Executable programs                |
| `/usr/lib`   | Shared libraries                   |
| `/etc`       | Configuration files                |
| `/var/log`   | Application logs                   |
| `/usr/share` | Documentation and shared resources |

The package manager places files in the appropriate locations automatically.

---

# Common APT Commands

| Command                    | Purpose                          |
| -------------------------- | -------------------------------- |
| `sudo apt update`          | Refresh package information      |
| `sudo apt upgrade`         | Upgrade installed packages       |
| `sudo apt install package` | Install a package                |
| `sudo apt remove package`  | Remove a package                 |
| `sudo apt purge package`   | Remove package and configuration |
| `sudo apt autoremove`      | Remove unused dependencies       |
| `apt search package`       | Search repositories              |
| `apt show package`         | View package information         |
| `apt list --installed`     | List installed packages          |

---

# Real-World Example

A newly created Ubuntu server often begins with:

```bash id="k5d8ys"
sudo apt update
sudo apt upgrade
```

Next, install the software required for a Node.js deployment:

```bash id="v1x6nr"
sudo apt install nginx
sudo apt install git
sudo apt install curl
sudo apt install unzip
```

Later in this handbook, you will also install:

- Node.js
- PM2
- Nginx
- Certbot
- Build tools

Most of these components are installed through the package management system.

---

# Best Practices

- Run `sudo apt update` before installing new software.
- Keep systems updated with security patches.
- Install software only from trusted repositories whenever possible.
- Remove unused packages to reduce system clutter.
- Review package information before installing unfamiliar software.

---

# Common Mistakes

### Confusing `apt update` with `apt upgrade`

`apt update` refreshes the package index.

`apt upgrade` installs newer versions of installed packages.

They perform different tasks.

---

### Installing Software from Untrusted Sources

Downloading packages from unofficial websites increases the risk of installing malicious or outdated software.

Prefer trusted repositories whenever possible.

---

### Forgetting to Remove Unused Dependencies

After uninstalling applications, unused libraries may remain on the system.

Run:

```bash id="p7r4za"
sudo apt autoremove
```

periodically to clean them up.

---

### Using `dpkg` for Normal Installations

`dpkg` installs local `.deb` files but does not automatically resolve dependencies.

For most software installations, prefer `apt`.

---

# Summary

Package management is one of Linux's greatest strengths.

APT simplifies software installation, updates, dependency management, and removal by using trusted repositories. Understanding how packages, repositories, and package managers work is essential for maintaining secure and reliable Linux systems.

Throughout the remainder of this handbook, most software installations will use the APT package manager.

---

## Next Chapter

➡️ **08 - systemd and Services**
