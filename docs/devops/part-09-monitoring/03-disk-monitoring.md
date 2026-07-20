---
sidebar_label: Disk Monitoring
sidebar_position: 3
---


# Disk Monitoring

### Overview

Disk storage is one of the most critical resources on a Linux server.

Unlike CPU or memory, disk space is **finite**. Once a filesystem becomes full, applications may fail to:

- Write log files
- Upload files
- Store database records
- Create temporary files
- Start new processes

Many production outages occur not because of software bugs, but because a server simply runs out of available disk space.

Monitoring disk usage helps administrators detect storage problems early and maintain healthy production systems.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand Linux storage monitoring.
- Monitor filesystem usage.
- Understand partitions and mount points.
- Monitor disk space and inodes.
- Identify large files and directories.
- Monitor disk I/O.
- Use common Linux disk monitoring commands.
- Apply storage management best practices.

---

## Why Disk Monitoring Matters

Imagine an application server.

Initially:

```text id="disk01"
Disk Usage

20%
```

Months later:

```text id="disk02"
Logs

+

Uploads

+

Database

↓

Disk Usage

98%
```

Eventually:

```text id="disk03"
Disk Full

↓

Application Errors

↓

Service Downtime
```

Continuous monitoring prevents storage-related failures.

---

## Understanding Linux Storage

A Linux server may contain multiple storage devices.

Example:

```text id="disk04"
Linux Server

↓

SSD

↓

Partitions

↓

Filesystems

↓

Directories
```

Each filesystem should be monitored independently.

---

## Filesystems

A filesystem organizes data on a storage device.

Common Linux filesystems include:

| Filesystem | Description                        |
| ---------- | ---------------------------------- |
| ext4       | Most common Linux filesystem       |
| XFS        | High-performance filesystem        |
| Btrfs      | Advanced filesystem with snapshots |
| FAT32      | Compatibility with many devices    |
| NTFS       | Common on Windows systems          |

Production Linux servers commonly use **ext4** or **XFS**.

---

## Mount Points

Linux attaches filesystems to directories called **mount points**.

Example:

```text id="disk05"
/

├── home

├── var

├── boot

└── data
```

Each mount point may belong to a different partition or storage device.

---

## Viewing Filesystems

Display mounted filesystems.

```bash id="diskcmd01"
df -h
```

Example output:

| Filesystem | Size | Used | Available | Mounted On |
| ---------- | ---- | ---- | --------- | ---------- |
| /dev/sda1  | 50G  | 18G  | 30G       | /          |
| /dev/sdb1  | 100G | 45G  | 55G       | /data      |

The `-h` option displays values in a human-readable format.

---

## Understanding df Output

Important columns:

| Column     | Meaning             |
| ---------- | ------------------- |
| Filesystem | Storage device      |
| Size       | Total capacity      |
| Used       | Used space          |
| Available  | Free space          |
| Use%       | Percentage utilized |
| Mounted On | Mount point         |

Administrators should pay particular attention to the **Use%** column.

---

## Disk Usage by Directory

Sometimes the filesystem has enough space, but one directory consumes most of it.

Check directory size.

```bash id="diskcmd02"
du -sh /var
```

Check multiple directories.

```bash id="diskcmd03"
du -sh /*
```

Example:

```text id="disk06"
/var

↓

18 GB
```

This helps identify storage-heavy directories.

---

## Finding Large Files

Large files can unexpectedly consume storage.

Find files larger than 500 MB.

```bash id="diskcmd04"
find / -type f -size +500M
```

Example:

```text id="disk07"
Server

↓

Large Log File

↓

12 GB
```

Removing unnecessary large files can quickly recover storage space.

---

## Viewing Block Devices

Display disks and partitions.

```bash id="diskcmd05"
lsblk
```

Example:

```text id="disk08"
sda

├── sda1

└── sda2

sdb

└── sdb1
```

This command provides an overview of attached storage devices.

---

## Viewing Mounted Filesystems

Display mount information.

```bash id="diskcmd06"
mount
```

This command shows:

- Mounted filesystems
- Mount options
- Mount points

Understanding mounted storage is important during troubleshooting.

---

## Disk I/O

Disk I/O measures how frequently the operating system reads from and writes to storage.

Example:

```text id="disk09"
Application

↓

Read

Write

↓

SSD
```

High disk utilization may slow application performance even when plenty of disk space remains.

---

## Monitoring Disk I/O

View disk statistics.

```bash id="diskcmd07"
iostat
```

Virtual memory statistics.

```bash id="diskcmd08"
vmstat
```

Important metrics include:

- Read operations
- Write operations
- Device utilization
- I/O wait

---

## Inodes

Linux stores metadata about every file using **inodes**.

A filesystem can run out of inodes even when free disk space remains.

Example:

```text id="disk10"
Filesystem

↓

Millions of Small Files

↓

No Free Inodes
```

Check inode usage.

```bash id="diskcmd09"
df -i
```

Monitor both disk space and inode usage.

---

## Disk Cleanup

Temporary files and logs often consume storage over time.

Common cleanup targets:

- Old log files
- Temporary directories
- Package cache
- Archived backups
- Unused application files

Always verify files before deleting them.

---

## Package Cache

Clean downloaded package files.

```bash id="diskcmd10"
sudo apt clean
```

Remove unnecessary packages.

```bash id="diskcmd11"
sudo apt autoremove
```

These commands help recover disk space safely.

---

## Using ncdu

`ncdu` provides an interactive disk usage viewer.

Install:

```bash id="diskcmd12"
sudo apt install ncdu
```

Run:

```bash id="diskcmd13"
ncdu /
```

Advantages:

- Interactive navigation
- Directory size visualization
- Easy identification of large directories

---

## Storage Monitoring Workflow

```text id="disk11"
Check Disk Usage

↓

Identify Large Directories

↓

Identify Large Files

↓

Clean Unnecessary Data

↓

Verify Free Space
```

This workflow helps maintain healthy storage usage.

---

## Production Storage Architecture

```text id="disk12"
Linux Server
      │
      ▼
Storage Devices
      │
      ▼
Partitions
      │
      ▼
Filesystems
      │
      ▼
Applications
```

Every storage layer contributes to overall system performance.

---

## Useful Disk Monitoring Commands

| Command     | Purpose                       |
| ----------- | ----------------------------- |
| `df -h`     | Filesystem usage              |
| `df -i`     | Inode usage                   |
| `du -sh`    | Directory size                |
| `find`      | Locate large files            |
| `lsblk`     | List disks and partitions     |
| `mount`     | Show mounted filesystems      |
| `iostat`    | Disk I/O statistics           |
| `vmstat`    | System statistics             |
| `ncdu`      | Interactive disk usage viewer |
| `apt clean` | Remove package cache          |

---

## Real-World Example

A production Node.js application suddenly begins failing to upload user images.

The administrator investigates:

1. `df -h` shows the root filesystem is **100% full**.
2. `du -sh /var/*` reveals that log files consume over **25 GB**.
3. `find /var/log -type f -size +1G` identifies several unusually large log files.
4. Old log files are archived and removed.
5. `apt clean` is executed to remove cached package files.
6. Disk usage falls to **58%**, and image uploads begin working again.

The issue was caused by insufficient disk space rather than a problem in the application itself.

---

## Best Practices

- Monitor disk usage regularly.
- Keep filesystem utilization below critical levels.
- Monitor inode usage as well as free space.
- Archive or rotate large log files.
- Remove unnecessary backups and temporary files.
- Use separate filesystems for large datasets when appropriate.
- Investigate unexpected storage growth immediately.
- Review storage trends over time.

---

## Common Mistakes

#### Monitoring Only Free Disk Space

A filesystem can exhaust its available inodes even when significant storage capacity remains.

---

#### Ignoring Log Growth

Application and web server logs often grow continuously and can consume large amounts of storage if not managed.

---

#### Deleting Files Without Investigation

Removing files without understanding their purpose may break applications or eliminate important diagnostic information.

---

#### Ignoring Disk I/O

A server may have plenty of available storage but still perform poorly due to excessive read or write activity.

---

#### Waiting Until the Disk Is Full

Storage issues should be addressed proactively before they begin affecting production applications.

---

## Summary

Disk monitoring is an essential aspect of Linux server administration. By monitoring filesystem usage, partitions, mount points, directory sizes, disk I/O, and inode consumption, administrators can prevent storage-related outages and maintain healthy production systems. Regular inspections, timely cleanup, and continuous monitoring help ensure that applications always have the storage resources they require.

---

### Next Chapter

➡️ **04 - Memory Monitoring**
