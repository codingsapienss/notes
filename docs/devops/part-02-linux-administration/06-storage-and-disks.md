---
sidebar_label: Storage and Disks
sidebar_position: 6
---


# Storage and Disks

## Overview

Every Linux system relies on storage devices to persist data. Whether it is the operating system, application source code, databases, log files, or user documents, everything is ultimately stored on a disk.

Linux provides a flexible storage architecture that separates **physical storage devices**, **partitions**, **filesystems**, and **mount points**. Understanding these concepts is essential for managing servers, expanding storage, troubleshooting disk issues, and deploying production applications.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand how Linux manages storage.
- Learn the difference between disks, partitions, and filesystems.
- Understand mounting and mount points.
- View storage devices and usage.
- Learn common disk management commands.
- Monitor available disk space.

---

# How Linux Views Storage

Unlike Windows, Linux does not use drive letters such as:

```text
C:\
D:\
E:\
```

Instead, every storage device becomes part of a single filesystem tree.

```text
                /
                │
      ┌─────────┴─────────┐
      │                   │
    /home              /var
      │                   │
      └─────────┬─────────┘
                │
        Mounted Storage
```

Whether you attach:

- An SSD
- A USB drive
- A cloud storage volume
- A network filesystem

it becomes accessible somewhere within the Linux directory hierarchy.

---

# Physical Storage Devices

A storage device is the actual hardware used to store data.

Examples include:

- HDD (Hard Disk Drive)
- SSD (Solid State Drive)
- NVMe SSD
- USB Flash Drive
- External Hard Disk
- Cloud Block Storage

Linux represents these devices as special files inside the `/dev` directory.

Examples:

```text
/dev/sda
/dev/sdb
/dev/nvme0n1
```

These names represent physical storage devices.

---

# Disk Naming Convention

Linux follows a consistent naming convention.

Examples:

```text
/dev/sda
/dev/sdb
/dev/sdc
```

Where:

| Device     | Meaning               |
| ---------- | --------------------- |
| `/dev/sda` | First storage device  |
| `/dev/sdb` | Second storage device |
| `/dev/sdc` | Third storage device  |

For NVMe drives:

```text
/dev/nvme0n1
/dev/nvme1n1
```

These names may differ depending on the hardware attached to the system.

---

# Partitions

A **partition** is a logical section of a storage device.

One physical disk can contain multiple partitions.

Example:

```text
Disk

+--------------------------------------+
|                                      |
|              SSD (500 GB)            |
|                                      |
+--------------------------------------+

          │
          ▼

+----------+-----------+--------------+
| Partition| Partition | Partition    |
|    1     |     2     |      3       |
+----------+-----------+--------------+
```

Linux identifies partitions by appending a number.

Example:

```text
/dev/sda1
/dev/sda2
/dev/sda3
```

For NVMe drives:

```text
/dev/nvme0n1p1
/dev/nvme0n1p2
```

---

# Filesystems

Before data can be stored on a partition, it must contain a **filesystem**.

A filesystem organizes how files and directories are stored.

Common Linux filesystems include:

| Filesystem | Description                                                 |
| ---------- | ----------------------------------------------------------- |
| ext4       | Most common Linux filesystem                                |
| XFS        | High-performance filesystem used on many enterprise systems |
| Btrfs      | Advanced filesystem supporting snapshots and checksums      |
| FAT32      | Common for USB drives                                       |
| NTFS       | Common Windows filesystem                                   |

A partition without a filesystem cannot be used to store normal files.

---

# Mounting

Linux does not automatically assign a drive letter to a new disk.

Instead, a filesystem is **mounted** into the existing directory tree.

Example:

```text
New SSD
    │
    ▼
Mount Point

/data
```

After mounting:

```text
/
├── home
├── etc
├── var
└── data
```

The new storage becomes accessible through `/data`.

---

# Mount Points

A **mount point** is simply an existing directory where another filesystem is attached.

Example:

```text
/mnt
/media
/data
/backup
```

These directories become the entry point for the mounted storage.

---

# Temporary Mounting

Mount a filesystem manually:

```bash
sudo mount /dev/sdb1 /mnt
```

Meaning:

| Component   | Description        |
| ----------- | ------------------ |
| `/dev/sdb1` | Partition to mount |
| `/mnt`      | Mount point        |

After mounting:

```bash
ls /mnt
```

shows the contents of that partition.

---

# Unmounting

To safely detach a mounted filesystem:

```bash
sudo umount /mnt
```

Notice that the command is:

```text
umount
```

not:

```text
unmount
```

The filesystem should not be actively in use before unmounting.

---

# Automatic Mounting

Linux stores automatic mount information inside:

```text
/etc/fstab
```

Example:

```text
UUID=xxxx-xxxx   /data   ext4   defaults   0   2
```

During system startup, Linux reads this file and mounts the listed filesystems automatically.

Improper configuration of `/etc/fstab` can prevent a system from booting correctly.

---

# Viewing Storage Devices

## Using `lsblk`

Display available storage devices:

```bash
lsblk
```

Example output:

```text
NAME    SIZE TYPE MOUNTPOINT
sda     100G disk
├─sda1   99G part /
└─sda2    1G part /boot
sdb     500G disk
└─sdb1  500G part /data
```

This command provides a clear overview of disks, partitions, and mount points.

---

# Viewing Disk Usage

## Using `df`

Display filesystem usage:

```bash
df -h
```

Example:

```text
Filesystem      Size Used Avail Use%
/dev/sda1        98G  35G   59G  38%
```

Important columns:

| Column | Meaning               |
| ------ | --------------------- |
| Size   | Total filesystem size |
| Used   | Used space            |
| Avail  | Available space       |
| Use%   | Percentage used       |

The `-h` option displays sizes in a human-readable format.

---

# Finding Large Directories

Use:

```bash
du -sh *
```

Example output:

```text
120M project
4.5G logs
250M backup
```

Useful options:

```bash
du -sh /var/log
```

```bash
du -sh /home/*
```

`du` is commonly used when investigating disk usage.

---

# Viewing Partition Information

Display partition information:

```bash
sudo fdisk -l
```

Example output includes:

- Disk size
- Partition layout
- Sector information
- Filesystem identifiers

This command is useful when configuring new storage devices.

---

# Viewing Mounted Filesystems

Display mounted filesystems:

```bash
mount
```

or

```bash
findmnt
```

These commands help verify whether storage devices have been mounted successfully.

---

# Common Storage Commands

| Command    | Purpose                       |
| ---------- | ----------------------------- |
| `lsblk`    | List disks and partitions     |
| `df -h`    | View filesystem usage         |
| `du -sh`   | Calculate directory size      |
| `mount`    | Mount a filesystem            |
| `umount`   | Unmount a filesystem          |
| `findmnt`  | Show mounted filesystems      |
| `fdisk -l` | Display partition information |

---

# Real-World Example

Suppose your production server contains:

```text
OS Disk
100 GB

Data Disk
500 GB
```

You mount the second disk as:

```text
/data
```

Your application stores:

```text
/data/uploads
```

while the operating system remains on:

```text
/
```

Benefits:

- Uploads remain separate from the operating system.
- Storage can be expanded independently.
- Reinstalling the operating system is easier.
- Backups become simpler to manage.

This is a common architecture for production servers.

---

# Best Practices

- Monitor disk usage regularly using `df -h`.
- Use `du` to identify large directories.
- Store application data on dedicated volumes when appropriate.
- Configure automatic mounts using `/etc/fstab` only after testing.
- Keep sufficient free disk space for logs, temporary files, and updates.

---

# Common Mistakes

### Confusing a Disk with a Partition

A physical disk can contain multiple partitions.

For example:

```text
Disk
└── sda
     ├── sda1
     ├── sda2
     └── sda3
```

---

### Forgetting to Mount a New Disk

Creating a partition and filesystem is not enough.

The filesystem must also be mounted before it can be used.

---

### Filling the Root Filesystem

Allowing the root filesystem (`/`) to reach 100% usage can prevent services from writing logs, creating temporary files, or even starting correctly.

Monitor root disk usage carefully.

---

### Editing `/etc/fstab` Without Verification

An incorrect entry in `/etc/fstab` can cause boot failures.

Always verify configuration changes before restarting a production server.

---

# Summary

Linux separates storage into **physical disks**, **partitions**, **filesystems**, and **mount points**, providing a flexible and scalable storage architecture.

Understanding how storage devices are identified, mounted, monitored, and managed is essential for administering Linux systems, expanding storage, troubleshooting disk issues, and deploying reliable production environments.

---

## Next Chapter

➡️ **07 - Package Management**
