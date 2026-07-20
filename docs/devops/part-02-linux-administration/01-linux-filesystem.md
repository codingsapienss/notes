---
sidebar_label: Linux Filesystem
sidebar_position: 1
---


# Linux Filesystem

### Overview

Unlike Windows, which organizes storage around **drive letters** such as `C:\`, `D:\`, and `E:\`, Linux follows a **single hierarchical directory structure**.

Everything in Linux starts from a single directory called the **Root Directory (`/`)**.

Whether it is a hard disk, SSD, USB drive, network storage, or even system information, everything is represented as part of this single directory tree.

Understanding the Linux filesystem is one of the most important skills for Linux administration because almost every configuration file, application, log, and service is stored somewhere within this hierarchy.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand how the Linux filesystem is organized.
- Learn what the Root Directory is.
- Understand the purpose of major Linux directories.
- Navigate the filesystem efficiently.
- Know where common configuration files and applications are stored.

---

## Understanding the Linux Filesystem

The Linux filesystem follows a tree structure.

Everything begins from the **Root Directory (`/`)**.

```text
/
├── bin
├── boot
├── dev
├── etc
├── home
├── lib
├── media
├── mnt
├── opt
├── proc
├── root
├── run
├── sbin
├── srv
├── sys
├── tmp
├── usr
└── var
```

Unlike Windows:

```text
C:\
D:\
E:\
```

Linux has **only one filesystem tree**, regardless of how many storage devices are attached.

Additional disks are simply **mounted** somewhere inside this directory tree.

---

## The Root Directory (/)

The **Root Directory (`/`)** is the highest level of the Linux filesystem.

Everything else exists beneath it.

Example:

```text
/
├── home
├── etc
├── var
└── usr
```

Think of it as the starting point of the entire operating system.

---

## Major Linux Directories

### /bin

The `/bin` directory contains **essential user commands** required for basic system operation.

Examples:

- `ls`
- `cp`
- `mv`
- `cat`
- `pwd`
- `echo`

These commands are available even if other filesystems have not yet been mounted.

---

### /boot

Contains files required during the boot process.

Typical contents include:

- Linux Kernel
- GRUB configuration
- Bootloader files
- Initial RAM filesystem (initramfs)

Example:

```text
/boot
├── grub
├── vmlinuz
├── initrd.img
```

Normally, users rarely modify this directory manually.

---

### /dev

Linux treats hardware devices as files.

The `/dev` directory contains these device files.

Examples:

```text
/dev/sda
/dev/sdb
/dev/null
/dev/random
/dev/tty
```

Examples:

- Hard disks
- SSDs
- USB devices
- Terminals
- Random number generators

This design allows hardware to be accessed using standard file operations.

---

### /etc

One of the most important directories for Linux administrators.

`/etc` stores **system-wide configuration files**.

Examples:

```text
/etc
├── nginx
├── ssh
├── systemd
├── hosts
├── passwd
├── fstab
```

During this handbook, you will frequently work inside this directory.

Examples include:

```text
/etc/nginx/
/etc/ssh/
/etc/systemd/
```

---

### /home

Contains personal directories for normal users.

Example:

```text
/home
├── alice
├── bob
└── developer
```

Each user stores personal files, downloads, documents, and projects here.

Example:

```text
/home/developer/projects
```

---

### /lib

Contains shared libraries required by programs.

Libraries provide reusable functionality that multiple applications can use.

Instead of every application including identical code, they share common libraries from this directory.

---

### /media

Used for automatically mounted removable devices.

Examples include:

- USB Drives
- DVDs
- External Hard Drives

Example:

```text
/media/username/USB_DRIVE
```

---

### /mnt

Traditionally used for manually mounted filesystems.

Example:

```text
/mnt/backup
```

System administrators often mount temporary storage here.

---

### /opt

Contains optional third-party software.

Applications installed outside the standard package manager are often placed here.

Example:

```text
/opt/google
/opt/custom-app
```

---

### /proc

Unlike normal directories, `/proc` is a **virtual filesystem**.

It does not store actual files on disk.

Instead, it provides real-time information about:

- Running processes
- CPU information
- Memory usage
- Kernel settings

Examples:

```text
/proc/cpuinfo
/proc/meminfo
/proc/version
```

Many Linux monitoring tools read information from `/proc`.

---

### /root

The home directory of the **root user**.

Do not confuse:

```text
/
```

with

```text
/root
```

The root directory (`/`) is the top of the filesystem.

The `/root` directory is simply the home folder for the root user.

---

### /run

Contains temporary runtime information.

Examples include:

- Running process information
- Process IDs (PIDs)
- Lock files
- System sockets

Contents are typically recreated every time the system boots.

---

### /sbin

Contains essential system administration commands.

Examples:

- `reboot`
- `shutdown`
- `mount`
- `fsck`

Many commands here require administrative privileges.

---

### /srv

Stores data served by system services.

Examples:

- FTP server files
- Web server content
- Application data

Although not always heavily used, it follows the Linux Filesystem Hierarchy Standard.

---

### /sys

Like `/proc`, `/sys` is a virtual filesystem.

It provides information about:

- Hardware
- Devices
- Kernel configuration
- Drivers

Administrators use this directory for advanced hardware configuration and diagnostics.

---

### /tmp

Stores temporary files.

Characteristics:

- Applications create temporary data here.
- Files may be deleted automatically.
- Contents should not be considered permanent.

Example:

```text
/tmp
```

---

### /usr

Contains the majority of user-installed software and shared resources.

Subdirectories include:

```text
/usr
├── bin
├── lib
├── share
├── local
```

Examples:

- Installed applications
- Documentation
- Shared libraries
- Development tools

Most software installed using package managers eventually places files somewhere inside `/usr`.

---

### /var

Stores data that changes while the system is running.

Examples include:

```text
/var
├── log
├── cache
├── spool
├── tmp
└── www
```

One of the most important directories is:

```text
/var/log
```

which stores system and application logs.

For example:

```text
/var/log/nginx/
/var/log/syslog
```

---

## Real-World Example

Suppose you deploy a Node.js application with Nginx.

Your server might use directories like:

```text
/
├── etc
│   ├── nginx
│   └── systemd
│
├── home
│   └── developer
│
├── var
│   ├── log
│   └── www
│
└── usr
    └── bin
```

Examples:

| Directory                 | Purpose                     |
| ------------------------- | --------------------------- |
| `/etc/nginx`              | Nginx configuration         |
| `/var/log/nginx`          | Nginx logs                  |
| `/home/developer/project` | Application source code     |
| `/usr/bin/node`           | Node.js executable          |
| `/tmp`                    | Temporary application files |

Understanding where files belong makes server management much easier.

---

## Best Practices

- Learn the purpose of each major directory instead of memorizing paths.
- Store personal projects inside your home directory unless there is a specific reason not to.
- Keep configuration files inside `/etc`.
- Avoid storing important data inside `/tmp`.
- Be cautious when modifying system directories.

---

## Common Mistakes

#### Confusing `/` with `/root`

`/` is the root of the filesystem.

`/root` is the home directory of the root user.

They are different directories.

---

#### Editing Files Without Understanding Their Purpose

Many configuration files inside `/etc` directly affect system behavior.

Always understand a file before modifying it.

---

#### Storing Permanent Files in `/tmp`

Files in `/tmp` are temporary and may be removed automatically by the operating system.

Do not rely on this directory for permanent storage.

---

## Summary

The Linux filesystem follows a single hierarchical structure rooted at `/`. Every file, directory, device, and mounted storage location exists somewhere beneath this root.

Knowing the purpose of the major directories—such as `/etc` for configuration, `/home` for user data, `/var` for logs, and `/usr` for installed software—is a fundamental skill for Linux administration.

As you continue through this handbook, you will repeatedly work with these directories while configuring services, deploying applications, and troubleshooting servers.

---

### Next Chapter

➡️ **02 - Users and Groups**
