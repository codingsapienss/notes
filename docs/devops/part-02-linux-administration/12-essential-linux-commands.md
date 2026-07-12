---
sidebar_label: Essential Linux Commands
sidebar_position: 12
---


# Essential Linux Commands

## Overview

Throughout this handbook, you have encountered dozens of Linux commands. While each command serves a specific purpose, some are used so frequently that they become part of every Linux administrator's daily workflow.

This chapter brings together the most essential commands into a single reference. Rather than introducing new concepts, it summarizes the commands that every Linux user should know for navigating the filesystem, managing files, inspecting processes, monitoring systems, troubleshooting networking, and administering servers.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Navigate the Linux filesystem efficiently.
- Manage files and directories.
- Search for files and text.
- Inspect processes and system resources.
- View logs.
- Monitor networking.
- Manage permissions.
- Perform common administration tasks.

---

# Command Structure

Most Linux commands follow the same format:

```text id="a1x9kp"
command [options] [arguments]
```

Example:

```bash id="b2w8jq"
ls -lh /home
```

Where:

| Part    | Meaning  |
| ------- | -------- |
| `ls`    | Command  |
| `-lh`   | Options  |
| `/home` | Argument |

---

# Navigation Commands

## Display Current Directory

```bash id="c8p1zn"
pwd
```

Example output:

```text id="k7r2fj"
/home/developer/projects
```

---

## List Files

```bash id="f5y3mc"
ls
```

Detailed listing:

```bash id="t6m4vd"
ls -l
```

Show hidden files:

```bash id="n2x8qa"
ls -la
```

Human-readable sizes:

```bash id="g9j7wr"
ls -lh
```

---

## Change Directory

```bash id="e4q2kt"
cd /var/log
```

Go to home directory:

```bash id="u3m9fw"
cd
```

Go back one directory:

```bash id="v1c6ha"
cd ..
```

Previous directory:

```bash id="j8r5px"
cd -
```

---

# File and Directory Management

## Create Directory

```bash id="h5n1tv"
mkdir project
```

Create nested directories:

```bash id="p2d8zs"
mkdir -p projects/node/api
```

---

## Create Empty File

```bash id="r4w7jy"
touch notes.txt
```

---

## Copy Files

```bash id="x6q9bc"
cp file.txt backup.txt
```

Copy directories:

```bash id="m3v8ke"
cp -r project backup
```

---

## Move or Rename Files

Move:

```bash id="k9z4tn"
mv file.txt /tmp/
```

Rename:

```bash id="s1f2hr"
mv old.txt new.txt
```

---

## Remove Files

Delete file:

```bash id="a6t5yv"
rm file.txt
```

Delete directory recursively:

```bash id="d8x3mq"
rm -rf project
```

**Warning:** `rm -rf` permanently deletes files without moving them to a recycle bin.

---

# Viewing File Contents

## Display Entire File

```bash id="f9h2cw"
cat file.txt
```

---

## View Beginning of a File

```bash id="p7m4jq"
head file.txt
```

First 20 lines:

```bash id="y5r1kv"
head -20 file.txt
```

---

## View End of a File

```bash id="g3n8sd"
tail file.txt
```

Follow updates:

```bash id="v8k5ht"
tail -f /var/log/syslog
```

---

## View Large Files

```bash id="m6q2pz"
less file.txt
```

Useful shortcuts:

| Key   | Action        |
| ----- | ------------- |
| Space | Next page     |
| b     | Previous page |
| /     | Search        |
| q     | Quit          |

---

# Searching

## Find Files

```bash id="r1d6fa"
find /home -name "*.js"
```

Find directories:

```bash id="u8w4ln"
find . -type d
```

---

## Search Inside Files

```bash id="c2t7ke"
grep "error" app.log
```

Recursive search:

```bash id="n4j8xy"
grep -r "MongoDB" .
```

Ignore case:

```bash id="l5v1qs"
grep -i "warning" app.log
```

---

# File Permissions

View permissions:

```bash id="b9x4pt"
ls -l
```

Change permissions:

```bash id="d2n6mw"
chmod 755 script.sh
```

Change ownership:

```bash id="w7r3jk"
chown developer:developers app.js
```

---

# Disk Usage

Filesystem usage:

```bash id="f4m8ze"
df -h
```

Directory size:

```bash id="q6y2nx"
du -sh project
```

---

# Memory Usage

Display memory:

```bash id="s5p7jc"
free -h
```

Virtual memory statistics:

```bash id="v9k3rd"
vmstat
```

---

# Process Management

Running processes:

```bash id="x1m4qb"
ps aux
```

Interactive process monitor:

```bash id="g7n8pl"
top
```

Enhanced process monitor:

```bash id="a3d9wh"
htop
```

Kill a process:

```bash id="k5v2tf"
kill PID
```

Force kill:

```bash id="r8j1pn"
kill -9 PID
```

---

# Networking

View interfaces:

```bash id="e2c6ks"
ip a
```

Routing table:

```bash id="h9w5mx"
ip route
```

Ping a server:

```bash id="j4q8tv"
ping google.com
```

DNS lookup:

```bash id="n7p1xd"
nslookup example.com
```

HTTP request:

```bash id="m2z6fr"
curl https://example.com
```

Listening ports:

```bash id="y8d4qk"
ss -tuln
```

---

# Package Management

Refresh repositories:

```bash id="c3f7lw"
sudo apt update
```

Upgrade packages:

```bash id="w6m2nh"
sudo apt upgrade
```

Install software:

```bash id="k1x9rv"
sudo apt install nginx
```

Remove software:

```bash id="t4v8ja"
sudo apt remove nginx
```

---

# Service Management

Check status:

```bash id="p5r2cy"
systemctl status nginx
```

Start:

```bash id="a8m4qx"
sudo systemctl start nginx
```

Restart:

```bash id="z2k6fw"
sudo systemctl restart nginx
```

Enable at boot:

```bash id="b1t9nh"
sudo systemctl enable nginx
```

---

# User Management

Current user:

```bash id="f7x5jp"
whoami
```

Logged-in users:

```bash id="m9n3sv"
who
```

Current user ID:

```bash id="q4d8yk"
id
```

Switch user:

```bash id="u6p1hc"
su username
```

Run as administrator:

```bash id="r3w7mz"
sudo command
```

---

# Archiving and Compression

Create a tar archive:

```bash id="x5j9vn"
tar -cvf backup.tar project/
```

Extract:

```bash id="d1m8ke"
tar -xvf backup.tar
```

Create compressed archive:

```bash id="p8z4rc"
tar -czvf backup.tar.gz project/
```

Extract compressed archive:

```bash id="g2y6tw"
tar -xzvf backup.tar.gz
```

---

# Useful Keyboard Shortcuts

| Shortcut   | Purpose                 |
| ---------- | ----------------------- |
| `Ctrl + C` | Stop running command    |
| `Ctrl + Z` | Suspend process         |
| `Ctrl + D` | Logout / End input      |
| `Ctrl + L` | Clear terminal          |
| `Ctrl + R` | Search command history  |
| `Tab`      | Auto-complete           |
| `↑`        | Previous command        |
| `↓`        | Next command            |
| `!!`       | Repeat previous command |

---

# Common Administration Workflow

A Linux administrator troubleshooting a web server might use:

```bash id="k7m5pd"
ssh server
```

```bash id="r4x8fq"
systemctl status nginx
```

```bash id="n9c2vz"
journalctl -u nginx -n 50
```

```bash id="p1d7wm"
ss -tulpn
```

```bash id="h6q3xt"
df -h
```

```bash id="t8m1ka"
free -h
```

```bash id="y2v6re"
top
```

```bash id="w5j8nc"
curl http://localhost
```

These commands provide a quick overview of service status, logs, networking, storage, memory, and application health.

---

# Command Categories

| Category        | Common Commands                    |
| --------------- | ---------------------------------- |
| Navigation      | `pwd`, `ls`, `cd`                  |
| File Management | `cp`, `mv`, `rm`, `touch`, `mkdir` |
| File Viewing    | `cat`, `less`, `head`, `tail`      |
| Searching       | `find`, `grep`                     |
| Permissions     | `chmod`, `chown`                   |
| Disk            | `df`, `du`, `lsblk`                |
| Memory          | `free`, `vmstat`                   |
| Processes       | `ps`, `top`, `htop`, `kill`        |
| Networking      | `ip`, `ping`, `curl`, `ss`, `dig`  |
| Packages        | `apt`, `dpkg`                      |
| Services        | `systemctl`, `journalctl`          |
| Users           | `whoami`, `id`, `sudo`             |

---

# Best Practices

- Learn commands by understanding their purpose rather than memorizing them.
- Use `--help` and the `man` pages to explore available options.
- Verify destructive commands before pressing Enter.
- Prefer command-line tools over graphical interfaces when administering servers.
- Combine simple commands to automate repetitive tasks.

---

# Common Mistakes

### Running Destructive Commands Without Verification

Commands such as:

```bash id="z7n5mr"
rm -rf
```

can permanently delete important data.

Always verify the target path before executing destructive operations.

---

### Forgetting `sudo`

Administrative commands require elevated privileges.

If a command fails with **Permission denied**, verify whether it should be executed with `sudo`.

---

### Using Wildcards Carelessly

Commands such as:

```bash id="b8q2xf"
rm *.log
```

can delete more files than intended.

Review wildcard matches before running destructive commands.

---

### Ignoring Command Documentation

Nearly every Linux command includes built-in documentation.

Examples:

```bash id="c6v9pj"
man ls
```

```bash id="m4t7rw"
ls --help
```

Learning to use these resources is an important skill for every administrator.

---

# Summary

This chapter consolidated the most commonly used Linux commands into a practical reference for daily administration. Together, these commands provide the foundation for navigating the filesystem, managing users, monitoring processes, troubleshooting networks, inspecting logs, administering services, and maintaining Linux servers.

While Linux includes hundreds of commands, mastering the utilities covered throughout **Part 2** will enable you to perform the vast majority of day-to-day system administration tasks with confidence.

---

## Next Chapter

➡️ **Part 3 – Shell Scripting**
