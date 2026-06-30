---
sidebar_label: Users and Groups
sidebar_position: 2
---


# Users and Groups

## Overview

Linux is a **multi-user operating system**, meaning multiple users can use the same system while keeping their files, settings, and permissions separate.

Every process, file, and service in Linux is associated with a user and one or more groups. This ownership model provides security, accountability, and controlled access to system resources.

Understanding users and groups is essential for system administration because every server deployment, application installation, and permission configuration depends on them.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand how Linux manages users.
- Learn the different types of users.
- Understand groups and their purpose.
- Learn how user IDs (UIDs) and group IDs (GIDs) work.
- Create, modify, and delete users and groups.
- Understand the relationship between users, groups, and file ownership.

---

# Why Linux Uses Users

Imagine a server used by several developers.

Without separate user accounts:

- Anyone could modify another person's files.
- Every user would have complete control over the system.
- It would be impossible to determine who performed a particular action.
- Sensitive information would be exposed.

Linux solves these problems by assigning every action to a user account.

Each user has:

- A username
- A unique User ID (UID)
- A primary group
- A home directory
- A default shell

---

# Types of Users

Linux categorizes users into three main types.

## 1. Root User

The **root** user is the superuser of the system.

Characteristics:

- Complete administrative privileges
- Can access all files
- Can install or remove software
- Can create or delete users
- Can modify system configuration

Username:

```text
root
```

Home directory:

```text
/root
```

Because root has unrestricted access, it should be used only when necessary.

---

## 2. Regular Users

Regular users are created for people who use the system.

Examples:

```text
alice
bob
developer
ubuntu
```

Regular users:

- Cannot modify critical system files by default.
- Can manage their own files.
- Usually work inside their home directory.

Example:

```text
/home/developer
```

---

## 3. System Users

Some applications and services require their own dedicated accounts.

Examples:

```text
www-data
mysql
nginx
postgres
systemd-network
```

These users:

- Usually cannot log in interactively.
- Own files related to specific services.
- Improve security by isolating applications.

For example, the Nginx web server often runs as the `www-data` user on Ubuntu.

---

# Understanding User IDs (UID)

Internally, Linux identifies users using **User IDs (UIDs)** rather than usernames.

Example:

| Username  |  UID |
| --------- | ---: |
| root      |    0 |
| developer | 1000 |
| alice     | 1001 |

The username is primarily for human convenience.

The operating system uses the UID for permission checks and ownership.

You can view your UID using:

```bash
id
```

Example output:

```text
uid=1000(developer) gid=1000(developer) groups=1000(developer),27(sudo)
```

---

# What Are Groups?

A **group** is a collection of users who share common permissions.

Instead of assigning permissions individually to every user, Linux allows permissions to be granted to a group.

Example:

```text
Developers Group
├── Alice
├── Bob
└── Charlie
```

If all developers require access to the same project directory, assigning permissions to the group is simpler than configuring each user separately.

---

# Primary Group and Secondary Groups

Every user has:

- One **Primary Group**
- Zero or more **Secondary Groups**

Example:

```text
User: developer

Primary Group:
developer

Secondary Groups:
sudo
docker
www-data
```

Primary groups are generally used when creating new files, while secondary groups provide additional permissions.

---

# Understanding Group IDs (GID)

Just as users have UIDs, groups have **Group IDs (GIDs)**.

Example:

| Group     |  GID |
| --------- | ---: |
| root      |    0 |
| developer | 1000 |
| sudo      |   27 |
| docker    |  999 |

Linux uses the GID internally instead of the group name.

---

# Viewing Current User Information

To display information about the current user:

```bash
whoami
```

Example output:

```text
developer
```

To display detailed user information:

```bash
id
```

Example:

```text
uid=1000(developer)
gid=1000(developer)
groups=1000(developer),27(sudo)
```

To display the current logged-in users:

```bash
who
```

---

# Creating Users

A new user can be created using:

```bash
sudo adduser john
```

Typical process:

1. Create the user.
2. Create a home directory.
3. Create a primary group.
4. Set a password.
5. Copy default configuration files.

The new home directory becomes:

```text
/home/john
```

---

# Deleting Users

To remove a user:

```bash
sudo deluser john
```

To remove both the user and their home directory:

```bash
sudo deluser --remove-home john
```

Be careful, as deleting a home directory permanently removes the user's files.

---

# Creating Groups

Create a new group:

```bash
sudo groupadd developers
```

View group information:

```bash
getent group developers
```

Example output:

```text
developers:x:1002:
```

---

# Adding a User to a Group

To add a user to an existing group:

```bash
sudo usermod -aG developers john
```

Explanation:

| Option | Meaning                      |
| ------ | ---------------------------- |
| `-a`   | Append to existing groups    |
| `-G`   | Specify supplementary groups |

**Important:** Always use `-aG` together. Omitting `-a` may remove the user from existing secondary groups.

---

# Viewing Groups

To list groups for the current user:

```bash
groups
```

To list groups for another user:

```bash
groups john
```

---

# The sudo Group

Most Linux distributions discourage logging in directly as the root user.

Instead, administrative privileges are granted through the **sudo** mechanism.

Example:

```bash
sudo apt update
```

The `sudo` command temporarily executes a command with administrative privileges.

Users typically gain this ability by belonging to the `sudo` group.

Example:

```text
developer
└── sudo
```

This approach improves security because administrative actions are explicit and can be logged.

---

# User Home Directories

Each regular user receives a personal home directory.

Example:

```text
/home/alice
/home/bob
/home/developer
```

The home directory typically contains:

- Documents
- Downloads
- Configuration files
- SSH keys
- Development projects

When a user logs in, the shell usually starts in their home directory.

---

# Important User-Related Files

Linux stores user and group information in several important files.

| File           | Purpose                        |
| -------------- | ------------------------------ |
| `/etc/passwd`  | User account information       |
| `/etc/shadow`  | Encrypted password information |
| `/etc/group`   | Group definitions              |
| `/etc/gshadow` | Secure group information       |

Administrators should understand these files but avoid editing them manually unless necessary.

---

# Real-World Example

Suppose a company has three developers working on the same application.

```text
Users
├── alice
├── bob
└── charlie

Group
└── developers
```

All project files are owned by the `developers` group.

Each developer belongs to that group, allowing everyone to collaborate without assigning permissions individually to every user.

Meanwhile:

- Nginx runs as `www-data`
- MySQL runs as `mysql`
- System services run under their own dedicated accounts

This separation improves both organization and security.

---

# Best Practices

- Use regular user accounts for daily work.
- Use `sudo` instead of logging in directly as the root user.
- Assign permissions to groups rather than individual users whenever practical.
- Remove unused user accounts promptly.
- Review group memberships periodically.

---

# Common Mistakes

### Working as the Root User All the Time

Using the root account for everyday tasks increases the risk of accidental system changes.

Prefer a regular user account with `sudo` privileges.

---

### Forgetting the `-a` Option with `usermod`

Running:

```bash
sudo usermod -G developers john
```

without `-a` replaces the user's existing supplementary groups.

Use:

```bash
sudo usermod -aG developers john
```

to append the new group while preserving existing memberships.

---

### Sharing User Accounts

Each person should have an individual account.

Shared accounts reduce accountability and make auditing difficult.

---

# Summary

Linux uses a robust user and group model to provide secure, multi-user access to system resources.

- **Users** represent people or services.
- **Groups** simplify permission management.
- **UIDs** and **GIDs** uniquely identify users and groups.
- **sudo** enables controlled administrative access without requiring routine use of the root account.

A solid understanding of users and groups is essential before learning Linux file permissions, which determine what each user and group can actually access.

---

## Next Chapter

➡️ **03 - Linux Permissions**
