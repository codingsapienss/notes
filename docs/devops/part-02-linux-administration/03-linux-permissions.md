---
sidebar_label: Linux Permissions
sidebar_position: 3
---


# Linux Permissions

## Overview

One of the most powerful security features of Linux is its **permission system**.

Every file and directory in Linux has an owner, a group, and a set of permissions that determine **who can read, modify, or execute it**.

This permission model prevents unauthorized users from accessing sensitive data and ensures that applications only have the access they require.

Whether you are hosting a website with Nginx, running a Node.js application, or managing a production server, understanding Linux permissions is essential.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand file ownership.
- Learn how Linux permissions work.
- Interpret permission strings.
- Understand read, write, and execute permissions.
- Change permissions using `chmod`.
- Change ownership using `chown`.
- Learn numeric (octal) permissions.
- Apply permissions safely in production.

---

# Why Linux Uses Permissions

Imagine a server used by multiple developers.

Without permissions:

- Anyone could delete system files.
- Applications could overwrite each other's data.
- Private files would be accessible to everyone.
- Malware would have unrestricted access.

Linux prevents these problems by assigning permissions to every file and directory.

---

# File Ownership

Every file in Linux has three ownership attributes:

- Owner (User)
- Group
- Others

Example:

```text
project.js

Owner  → developer
Group  → developers
Others → Everyone else
```

Every permission decision is based on these three categories.

---

# Viewing File Permissions

Use the following command:

```bash
ls -l
```

Example output:

```text
-rwxr-xr-- 1 developer developers 2048 Jul 19 app.js
```

Breaking it down:

```text
-rwxr-xr--
│││ │││ │││
│││ │││ │└└ Others
│││ └└└ Group
└└└──── Owner
```

---

# Understanding the Permission String

Example:

```text
-rwxr-xr--
```

Let's examine each part.

## First Character

The first character represents the file type.

| Symbol | Meaning          |
| ------ | ---------------- |
| `-`    | Regular file     |
| `d`    | Directory        |
| `l`    | Symbolic link    |
| `c`    | Character device |
| `b`    | Block device     |

Example:

```text
-rwxr-xr--
```

The first `-` indicates a regular file.

---

# Permission Groups

The remaining nine characters are divided into three groups.

```text
rwx r-x r--
│   │   │
│   │   └── Others
│   └────── Group
└────────── Owner
```

Each group contains three permissions.

- Read
- Write
- Execute

---

# Read Permission (r)

Symbol:

```text
r
```

For a file:

- View contents
- Open the file

For a directory:

- List directory contents

Example:

```text
r--
```

The user can read but cannot modify or execute.

---

# Write Permission (w)

Symbol:

```text
w
```

For a file:

- Modify contents
- Save changes

For a directory:

- Create files
- Delete files
- Rename files

Example:

```text
rw-
```

The user can read and modify the file.

---

# Execute Permission (x)

Symbol:

```text
x
```

For a file:

- Execute the file as a program or script.

For a directory:

- Enter the directory using `cd`.

Example:

```text
rwx
```

The user has full access.

---

# Permission Examples

## Example 1

```text
rw-r--r--
```

| User   | Permission  |
| ------ | ----------- |
| Owner  | Read, Write |
| Group  | Read        |
| Others | Read        |

---

## Example 2

```text
rwxr-xr-x
```

| User   | Permission           |
| ------ | -------------------- |
| Owner  | Read, Write, Execute |
| Group  | Read, Execute        |
| Others | Read, Execute        |

This is a common permission for executable programs.

---

## Example 3

```text
rw-------
```

Only the owner has access.

This is commonly used for private files.

---

# Changing Permissions

Linux uses the `chmod` command.

General syntax:

```bash
chmod permissions file
```

---

## Symbolic Mode

Add execute permission:

```bash
chmod +x app.sh
```

Remove write permission:

```bash
chmod -w notes.txt
```

Give owner execute permission:

```bash
chmod u+x app.sh
```

Give group write permission:

```bash
chmod g+w project.txt
```

Remove execute permission from others:

```bash
chmod o-x script.sh
```

Where:

| Symbol | Meaning      |
| ------ | ------------ |
| `u`    | User (Owner) |
| `g`    | Group        |
| `o`    | Others       |
| `a`    | All          |

---

# Numeric (Octal) Permissions

Linux also supports numeric permission values.

Each permission has a value.

| Permission | Value |
| ---------- | ----: |
| Read       |     4 |
| Write      |     2 |
| Execute    |     1 |

Add the required values together.

Example:

```text
Read + Write + Execute

4 + 2 + 1 = 7
```

---

# Common Numeric Permissions

| Numeric | Permission |
| ------: | ---------- |
|     777 | rwxrwxrwx  |
|     755 | rwxr-xr-x  |
|     744 | rwxr--r--  |
|     700 | rwx------  |
|     644 | rw-r--r--  |
|     600 | rw-------  |

---

## Example

```bash
chmod 755 app.sh
```

Results in:

```text
rwxr-xr-x
```

---

## Another Example

```bash
chmod 644 config.json
```

Results in:

```text
rw-r--r--
```

---

# Changing Ownership

Ownership is managed using `chown`.

General syntax:

```bash
chown owner file
```

Example:

```bash
sudo chown developer app.js
```

Change both owner and group:

```bash
sudo chown developer:developers app.js
```

---

# Changing Group Only

Use `chgrp`.

Example:

```bash
sudo chgrp developers app.js
```

---

# Recursive Changes

To apply changes to an entire directory:

Permissions:

```bash
chmod -R 755 project/
```

Ownership:

```bash
sudo chown -R developer:developers project/
```

Be cautious when using recursive operations on production systems.

---

# File Permissions vs Directory Permissions

Many beginners assume permissions work the same for files and directories.

They do not.

| Permission | File               | Directory                       |
| ---------- | ------------------ | ------------------------------- |
| Read       | Read file contents | List directory contents         |
| Write      | Modify file        | Create, delete, or rename files |
| Execute    | Execute program    | Enter the directory (`cd`)      |

Understanding this distinction helps explain why you may be able to see a directory but not enter it, or enter it without being able to list its contents.

---

# Real-World Example

Suppose your Node.js application is stored here:

```text
/var/www/my-app
```

The ownership might be:

```text
Owner : developer
Group : developers
```

Application files:

```text
rw-r--r--
```

Executable startup script:

```text
rwxr-xr-x
```

Nginx configuration:

```text
/etc/nginx/nginx.conf
```

Typical permissions:

```text
rw-r--r--
```

The configuration is writable only by its owner but readable by other processes that need access.

---

# Best Practices

- Follow the **principle of least privilege**—grant only the permissions required.
- Prefer `755` for executable scripts and directories that need public read access.
- Prefer `644` for configuration and source code files.
- Use `600` for sensitive files such as SSH private keys.
- Review ownership after deploying applications.
- Avoid using the root user as the owner unless necessary.

---

# Common Mistakes

### Using `777` Everywhere

Setting permissions to:

```bash
chmod 777 file
```

gives everyone full access.

Although it may temporarily solve a permission problem, it creates a serious security risk and should rarely be used.

---

### Confusing Ownership with Permissions

Changing permissions does not change ownership.

Similarly, changing ownership does not automatically change permissions.

These are separate concepts.

---

### Forgetting Recursive Operations

Changing permissions on a directory without `-R` affects only the directory itself, not the files inside it.

Always verify whether recursive changes are appropriate before using them.

---

### Giving Execute Permission to Every File

Not every file should be executable.

Source code, configuration files, and text files generally do not require execute permission.

---

# Summary

Linux secures files and directories through a combination of **ownership** and **permissions**.

Every filesystem object belongs to an owner and a group, while permissions determine what the owner, group members, and everyone else can do.

Key commands introduced in this chapter include:

- `ls -l` — View permissions and ownership.
- `chmod` — Change permissions.
- `chown` — Change owner and group.
- `chgrp` — Change the group.

A solid understanding of Linux permissions is fundamental for securely managing users, applications, and production servers.

---

## Next Chapter

➡️ **04 - Process Management**
