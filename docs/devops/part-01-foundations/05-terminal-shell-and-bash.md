---
sidebar_label: Terminal, Shell and Bash
sidebar_position: 5
---


# Terminal, Shell and Bash

### Overview

When people begin learning Linux, they often use the terms **Terminal**, **Shell**, and **Bash** interchangeably. Although they are closely related, they are **not the same thing**.

Understanding the difference between these components is essential because almost every server administration task—whether connecting via SSH, installing software, configuring Nginx, or deploying a Node.js application—is performed through the command line.

This chapter explains how these components work together and how your commands travel from the keyboard to the Linux kernel.

---

### Learning Objectives

After completing this chapter, you will be able to:

- Understand what a Terminal is.
- Understand what a Shell is.
- Learn what Bash is and why it is popular.
- Understand how commands are executed.
- Learn the structure of Linux commands.
- Understand common command-line concepts such as arguments, options, pipes, and redirection.

---

## What is a Terminal?

A **Terminal** (or **Terminal Emulator**) is the application that provides a text-based interface for interacting with the operating system.

Think of it as a window where you type commands and view their output.

Examples of terminal applications include:

- Windows Terminal
- GNOME Terminal
- macOS Terminal
- iTerm2
- PuTTY
- Visual Studio Code Integrated Terminal

The terminal itself **does not execute commands**.

Its primary responsibilities are:

- Display text
- Capture keyboard input
- Send commands to the shell
- Display the shell's output

---

## What is a Shell?

A **Shell** is a command interpreter.

It receives commands from the terminal, understands their meaning, and asks the operating system to execute them.

The shell acts as an interface between the user and the Linux kernel.

For example:

```bash
ls -la
```

The shell performs the following steps:

1. Reads the command.
2. Identifies the executable (`ls`).
3. Passes the arguments (`-la`).
4. Creates a new process.
5. Waits for execution.
6. Displays the result in the terminal.

Without a shell, the terminal would simply be an empty window that could display text but would not understand commands.

---

## What is Bash?

**Bash** stands for **Bourne Again SHell**.

It is the default shell on many Linux distributions and is one of the most widely used command interpreters in the world.

Bash provides features such as:

- Command execution
- Variables
- Loops
- Functions
- Command history
- Auto-completion
- Scripting
- Aliases
- Job control

Because of its stability and widespread adoption, Bash is the shell used throughout this handbook.

---

## Other Popular Shells

Although Bash is the most common shell, Linux supports several alternatives.

| Shell | Description                                                  |
| ----- | ------------------------------------------------------------ |
| Bash  | Default shell on many Linux distributions                    |
| Zsh   | Modern shell with improved auto-completion and customization |
| Fish  | Beginner-friendly shell with smart suggestions               |
| Dash  | Lightweight shell often used for system scripts              |
| Ksh   | Korn Shell, common in enterprise Unix environments           |

Most commands work the same regardless of the shell being used.

---

## How a Command is Executed

When you type a command into the terminal, several components work together.

```text
Keyboard
    │
    ▼
Terminal
    │
    ▼
Shell (Bash)
    │
    ▼
Linux Kernel
    │
    ▼
Hardware
    │
    ▼
Result
    │
    ▼
Terminal Output
```

For example:

```bash
pwd
```

Execution flow:

1. You type `pwd`.
2. The terminal sends the command to Bash.
3. Bash locates the executable.
4. The kernel creates a process.
5. The command executes.
6. Output is returned.
7. The terminal displays the result.

---

## Structure of a Linux Command

Most Linux commands follow a similar structure.

```bash
command [options] [arguments]
```

Example:

```bash
ls -la /home
```

Breaking it down:

| Component | Value   | Description                     |
| --------- | ------- | ------------------------------- |
| Command   | `ls`    | Program to execute              |
| Option    | `-la`   | Modifies the command's behavior |
| Argument  | `/home` | Target directory                |

Not every command requires both options and arguments.

---

## Understanding Options

Options (also called **flags**) modify how a command behaves.

Example:

```bash
ls -l
```

Displays files in a long format.

```bash
ls -a
```

Shows hidden files.

Multiple options can often be combined:

```bash
ls -la
```

This displays hidden files in a detailed format.

---

## Understanding Arguments

Arguments tell a command **what to operate on**.

Example:

```bash
cat notes.txt
```

Here:

- `cat` is the command.
- `notes.txt` is the argument.

Another example:

```bash
cd /var/www
```

The command changes the current directory to `/var/www`.

---

## Absolute vs Relative Paths

Linux commands often use file paths.

### Absolute Path

An absolute path starts from the root directory.

Example:

```bash
cd /var/www/html
```

This path is valid regardless of the current working directory.

---

### Relative Path

A relative path is interpreted based on the current directory.

Example:

```bash
cd projects
```

If the current directory is:

```text
/home/user
```

then the shell interprets the command as:

```text
/home/user/projects
```

---

## Pipes

A pipe (`|`) sends the output of one command as the input to another.

Example:

```bash
ps aux | grep nginx
```

Explanation:

- `ps aux` lists all running processes.
- `grep nginx` filters the results to show only processes containing "nginx".

Pipes allow multiple commands to work together efficiently.

---

## Redirection

Redirection changes where command input or output goes.

### Output Redirection

```bash
ls > files.txt
```

Instead of displaying the output on the screen, it is written to `files.txt`.

---

### Append Output

```bash
echo "Hello" >> notes.txt
```

Adds text to the end of the file without replacing its existing contents.

---

### Input Redirection

```bash
sort < names.txt
```

The `sort` command reads its input from `names.txt`.

---

## Command History

Bash automatically stores previously executed commands.

Useful keyboard shortcuts include:

| Shortcut | Description                           |
| -------- | ------------------------------------- |
| ↑        | Previous command                      |
| ↓        | Next command                          |
| Ctrl + R | Search command history                |
| Tab      | Auto-complete commands and file names |
| Ctrl + C | Stop the running process              |
| Ctrl + L | Clear the terminal screen             |

These shortcuts significantly improve productivity.

---

## Real-World Example

Suppose you connect to your Ubuntu server:

```bash
ssh username@server-ip
```

After logging in, you might execute:

```bash
cd /var/www/project
git pull
npm install
pm2 restart app
```

For every command:

1. The terminal captures your input.
2. Bash interprets the command.
3. The Linux kernel creates the required process.
4. The command executes.
5. The output is returned to the terminal.

Although these commands appear simple, the terminal, shell, kernel, and operating system work together to execute each one.

---

## Best Practices

- Learn command syntax instead of memorizing individual commands.
- Use the `Tab` key for auto-completion whenever possible.
- Use command history to avoid retyping long commands.
- Prefer absolute paths when writing deployment scripts.
- Read command documentation using `man <command>` whenever you encounter an unfamiliar command.

---

## Common Mistakes

#### Confusing the Terminal with Bash

The terminal is the application you interact with.

Bash is the program that interprets your commands.

---

#### Thinking Every Linux System Uses Bash

Many Linux systems use Bash by default, but others may use Zsh, Fish, Dash, or another shell.

---

#### Ignoring Command Syntax

Many command errors occur because arguments and options are provided in the wrong order or omitted entirely.

Always understand the expected syntax before executing a command.

---

## Summary

The terminal, shell, and Bash each play distinct roles in the Linux command-line environment.

- The **Terminal** provides the interface for user interaction.
- The **Shell** interprets commands and communicates with the operating system.
- **Bash** is one of the most widely used shells and serves as the primary command interpreter throughout this handbook.

Understanding these components provides the foundation for working confidently with Linux servers and command-line tools.

---

### Next Chapter

➡️ **06 - SSH Overview**
