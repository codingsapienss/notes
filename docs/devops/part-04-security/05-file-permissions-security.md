---
sidebar_label: File Permissions Security
sidebar_position: 5
---


# File Permissions Security

## Overview

Every file and directory on a Linux system has permissions that determine **who can access it and what actions they are allowed to perform**.

A web server should not be able to modify system files.

A normal user should not be able to read another user's private SSH keys.

A Node.js application should not have permission to delete operating system files.

Linux enforces these restrictions using its permission system.

Incorrect file permissions are one of the most common causes of production security incidents. Even a perfectly secured SSH server and firewall cannot protect sensitive data if confidential files are readable by everyone.

This chapter explains how Linux file permissions help secure production servers and how to apply them correctly.

---

## Learning Objectives

After completing this chapter, you will be able to:

- Understand Linux file ownership.
- Learn how file permissions work.
- Interpret permission notation.
- Secure sensitive files.
- Use `chmod`, `chown`, and `chgrp`.
- Understand special permissions.
- Apply production best practices.

---

# Why File Permissions Matter

Imagine a production server containing:

- Application source code
- Database credentials
- SSL certificates
- SSH keys
- Environment variables
- User uploads

If every user could access every file, the server would be insecure.

Linux prevents this through permissions.

```text
                Linux Server
                     │
     ┌───────────────┴───────────────┐
     │                               │
 Authorized User               Unauthorized User
     │                               │
   Allowed                    Permission Denied
```

Proper permissions ensure that only authorized users and services can access sensitive resources.

---

# Linux Ownership Model

Every file belongs to:

- One **Owner**
- One **Group**

Everyone else falls into the **Others** category.

```text
            File
              │
     ┌────────┼────────┐
     │        │        │
   Owner    Group    Others
```

Linux evaluates permissions based on these three categories.

---

# Permission Types

Each category can have three permissions.

| Permission | Symbol | Meaning                             |
| ---------- | ------ | ----------------------------------- |
| Read       | `r`    | View file contents                  |
| Write      | `w`    | Modify or delete a file             |
| Execute    | `x`    | Execute a file or enter a directory |

---

# Viewing File Permissions

Display permissions:

```bash
ls -l
```

Example:

```text
-rwxr-xr-- 1 ubuntu developers 2048 app.js
```

Breakdown:

```text
-rwxr-xr--
 │ │ │ │
 │ │ │ └── Others
 │ │ └──── Group
 │ └────── Owner
 └──────── File Type
```

---

# Understanding Permission Bits

Example:

```text
-rwxr-x---
```

Breakdown:

| Category | Permissions | Meaning              |
| -------- | ----------- | -------------------- |
| Owner    | rwx         | Read, Write, Execute |
| Group    | r-x         | Read, Execute        |
| Others   | ---         | No Access            |

Only the owner can modify the file.

---

# Numeric Permission Values

Permissions can also be represented numerically.

| Permission | Value |
| ---------- | ----: |
| Read       |     4 |
| Write      |     2 |
| Execute    |     1 |

Examples:

| Numeric | Symbolic  |
| ------- | --------- |
| 777     | rwxrwxrwx |
| 755     | rwxr-xr-x |
| 750     | rwxr-x--- |
| 700     | rwx------ |
| 644     | rw-r--r-- |
| 600     | rw------- |

---

# Changing Permissions with chmod

Grant execute permission:

```bash
chmod +x deploy.sh
```

Remove write permission:

```bash
chmod -w file.txt
```

Using numeric notation:

```bash
chmod 755 app.js
```

Restrict a confidential file:

```bash
chmod 600 .env
```

---

# Changing File Ownership

Change owner:

```bash
sudo chown ubuntu app.js
```

Change owner and group:

```bash
sudo chown ubuntu:developers app.js
```

---

# Changing Group Ownership

```bash
sudo chgrp developers app.js
```

Useful when multiple administrators need shared access.

---

# Secure Permissions for Common Files

| File               | Recommended Permissions      |
| ------------------ | ---------------------------- |
| `.env`             | 600                          |
| SSH Private Key    | 600                          |
| `authorized_keys`  | 600                          |
| SSH Directory      | 700                          |
| Application Source | 644 or 755 where appropriate |
| SSL Private Key    | 600                          |

Sensitive files should never be world-readable.

---

# Directory Permissions

Directory permissions behave differently from file permissions.

| Permission | Meaning                 |
| ---------- | ----------------------- |
| Read       | List directory contents |
| Write      | Create/Delete files     |
| Execute    | Enter the directory     |

Example:

```text
drwxr-x---
```

Only the owner and group can access the directory.

---

# Special Permissions

Linux also supports special permission bits.

| Permission | Purpose                                                  |
| ---------- | -------------------------------------------------------- |
| SUID       | Execute with file owner's privileges                     |
| SGID       | Execute with group privileges or inherit directory group |
| Sticky Bit | Restricts file deletion in shared directories            |

Example:

```text
drwxrwxrwt
```

The `t` indicates the Sticky Bit.

A common example is:

```text
/tmp
```

where users can create files but cannot delete files owned by other users.

---

# Common Permission Mistakes

## Using 777 Everywhere

```bash
chmod 777 app.js
```

Result:

```text
Everyone can

Read

Write

Execute
```

This should almost never be used on production servers.

---

## Exposing Private Keys

Example:

```text
id_ed25519
```

If readable by other users, anyone with access to the server could impersonate the administrator.

Always restrict private keys:

```bash
chmod 600 ~/.ssh/id_ed25519
```

---

## Exposing Environment Variables

Example:

```text
.env

DB_PASSWORD
JWT_SECRET
API_KEY
```

Never make `.env` files publicly readable.

---

# Production Example

Suppose you deploy a Node.js application.

Project structure:

```text
/var/www/myapp
│
├── app.js
├── package.json
├── .env
├── uploads/
└── logs/
```

Recommended permissions:

| Path         | Permissions | Owner   |
| ------------ | ----------- | ------- |
| app.js       | 644         | appuser |
| package.json | 644         | appuser |
| .env         | 600         | appuser |
| uploads      | 755         | appuser |
| logs         | 750         | appuser |

Only the application user can read sensitive configuration files.

---

# Permission Verification

Useful commands:

View permissions:

```bash
ls -l
```

View directory permissions:

```bash
ls -ld directory_name
```

View ownership:

```bash
stat app.js
```

Find world-writable files:

```bash
find / -type f -perm -002
```

Find world-writable directories:

```bash
find / -type d -perm -002
```

These commands are commonly used during security audits.

---

# Best Practices

- Follow the Principle of Least Privilege.
- Never use `777` unless absolutely necessary.
- Restrict SSH private keys to the owner.
- Protect `.env` files and SSL private keys.
- Use dedicated service accounts for applications.
- Regularly audit file permissions.
- Remove unnecessary write permissions.

---

# Common Mistakes

### Running Everything as Root

Applications should run under dedicated service accounts whenever possible.

---

### Making Sensitive Files World-Readable

Files containing passwords, API keys, certificates, or private keys should only be readable by authorized users.

---

### Ignoring Directory Permissions

A secure file inside an insecure directory may still be vulnerable if unauthorized users can access the directory.

---

### Copying Permissions Blindly

Different files require different permission levels. Avoid applying the same permissions to every file without understanding their purpose.

---

# Summary

Linux file permissions are a fundamental security mechanism that controls access to files and directories. By combining ownership, groups, and read/write/execute permissions, Linux ensures that users and applications have only the access they require. Correct use of `chmod`, `chown`, and `chgrp`, along with careful protection of sensitive files such as SSH keys and environment variables, significantly strengthens the security of a production Linux server.

---

## Next Chapter

➡️ **06 - Security Updates**
