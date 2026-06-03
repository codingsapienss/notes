---
sidebar_label: 'Part 1'
sidebar_position: 1
---

# C++ Basics & Program Structure

> Before learning data types, memory, arrays, pointers, and OOP, it is important to understand how a C++ program is structured and how execution begins.

---

## Learning Objectives

In this chapter, you will learn:

- Structure of a C++ program
- Header files
- Preprocessor directives
- Namespace
- `main()` function
- Statements
- Comments
- Keywords
- Identifiers
- Variables (Introduction)
- Constants (Introduction)
- Program execution flow

---

## Your First C++ Program

```cpp
#include <iostream>

using namespace std;

int main()
{
    cout << "Hello World";

    return 0;
}
```

#### Output

```text
Hello World
```

---

## Understanding Program Structure

Every C++ program follows a basic structure:

```cpp
#include <iostream>

using namespace std;

int main()
{
    // Program Code

    return 0;
}
```

---

### Structure Diagram

```text
Header Files
      ↓
Namespaces
      ↓
main()
      ↓
Statements
      ↓
return
```

---

## Header Files

### What Are Header Files?

Header files contain declarations of functions, classes, and objects that can be used in a program.

---

### Example

```cpp
#include <iostream>
```

---

### Why Do We Need It?

Without:

```cpp
#include <iostream>
```

the compiler does not know about:

```cpp
cout
cin
endl
```

Example:

```cpp
cout << "Hello";
```

will produce a compilation error if `<iostream>` is not included.

---

### Common Header Files

| Header File  | Purpose                |
| ------------ | ---------------------- |
| `<iostream>` | Input and Output       |
| `<string>`   | String Support         |
| `<vector>`   | Dynamic Arrays         |
| `<cmath>`    | Mathematical Functions |
| `<iomanip>`  | Output Formatting      |

---

## Preprocessor Directives

### What Are They?

Lines beginning with:

```cpp
# 
```

are called preprocessor directives.

They are processed before compilation.

---

### Example

```cpp
#include <iostream>
```

---

Other examples:

```cpp
#define PI 3.14
```

```cpp
#ifdef
```

```cpp
#ifndef
```

---

### Important Point

The compiler does not process preprocessor directives directly.

The:

```text
Preprocessor
```

handles them before compilation starts.

---

## Namespace

### What Problem Does It Solve?

Different libraries may contain functions or objects with the same name.

Namespaces prevent naming conflicts.

---

### Example

```cpp
using namespace std;
```

---

Now we can write:

```cpp
cout << "Hello";
```

instead of:

```cpp
std::cout << "Hello";
```

---

### Without Namespace

```cpp
#include <iostream>

int main()
{
    std::cout << "Hello";
}
```

---

### With Namespace

```cpp
#include <iostream>

using namespace std;

int main()
{
    cout << "Hello";
}
```

---

## The `main()` Function

### What Is It?

The entry point of every C++ program.

Program execution always starts from:

```cpp
main()
```

---

### Syntax

```cpp
int main()
{
}
```

---

### Example

```cpp
int main()
{
    cout << "Program Started";

    return 0;
}
```

---

#### Output

```text
Program Started
```

---

## Why Does `main()` Return `int`?

```cpp
int main()
```

means:

```text
main returns an integer value.
```

---

Usually:

```cpp
return 0;
```

indicates:

```text
Program executed successfully.
```

---

## return 0

Example:

```cpp
int main()
{
    cout << "Hello";

    return 0;
}
```

---

#### Meaning

```text
Return control to Operating System
with success status.
```

---

## Statements

### What Is A Statement?

A statement is an instruction given to the computer.

---

Example:

```cpp
cout << "Hello";
```

---

Example:

```cpp
int age = 20;
```

---

Most statements end with:

```cpp
;
```

called:

```text
Semicolon
```

---

## Semicolon (`;`)

### Why Is It Needed?

Marks the end of a statement.

---

Correct:

```cpp
int age = 20;
```

---

Wrong:

```cpp
int age = 20
```

Compilation Error.

---

## Comments

Comments are ignored by the compiler.

Used to explain code.

---

### Single Line Comment

```cpp
// This is a comment
```

---

Example:

```cpp
// Store user's age
int age = 20;
```

---

### Multi-line Comment

```cpp
/*
This is
a multi-line
comment
*/
```

---

Example:

```cpp
/*
Program:
Calculate Sum
Author:
Prashant
*/
```

---

## Keywords

### What Are Keywords?

Reserved words that already have a meaning in C++.

---

Examples:

```cpp
int
double
char
return
if
else
for
while
class
void
```

---

### Invalid Example

```cpp
int int = 10;
```

Compilation Error.

---

Because:

```cpp
int
```

is a keyword.

---

## Identifiers

### What Are Identifiers?

Names given to:

- Variables
- Functions
- Classes
- Objects

---

Example:

```cpp
int age = 20;
```

Identifier:

```cpp
age
```

---

## Identifier Rules

---

### Rule 1

Can contain:

```text
Letters
Digits
Underscores
```

---

Valid:

```cpp
studentAge
_age
count123
```

---

### Rule 2

Cannot start with a digit.

Invalid:

```cpp
123count
```

---

Valid:

```cpp
count123
```

---

### Rule 3

Cannot be a keyword.

Invalid:

```cpp
int return = 10;
```

---

### Rule 4

C++ is case-sensitive.

```cpp
age
Age
AGE
```

are different identifiers.

---

## Variables (Introduction)

### What Is A Variable?

A named memory location used to store data.

---

Example:

```cpp
int age = 20;
```

---

Here:

```cpp
age
```

is the variable.

---

Value stored:

```cpp
20
```

---

## Variable Declaration

```cpp
int age;
```

---

## Variable Initialization

```cpp
int age = 20;
```

---

## Multiple Variables

```cpp
int a = 10;
int b = 20;
int c = 30;
```

---

## Constants (Introduction)

### What Is A Constant?

A value that cannot be changed after initialization.

---

Example

```cpp
const int MAX_SIZE = 100;
```

---

Invalid:

```cpp
MAX_SIZE = 200;
```

Compilation Error.

---

## constexpr

Modern C++ provides:

```cpp
constexpr
```

Example:

```cpp
constexpr double PI = 3.14159;
```

---

Used for compile-time constants.

---

## Program Execution Flow

Consider:

```cpp
#include <iostream>

using namespace std;

int main()
{
    cout << "A" << endl;

    cout << "B" << endl;

    cout << "C" << endl;

    return 0;
}
```

---

#### Output

```text
A
B
C
```

---

#### Execution Flow

```text
Program Starts
      ↓
main()
      ↓
Statement 1
      ↓
Statement 2
      ↓
Statement 3
      ↓
return 0
      ↓
Program Ends
```

---

## Common Beginner Mistakes

---

### Missing Semicolon

Wrong:

```cpp
int age = 20
```

---

Correct:

```cpp
int age = 20;
```

---

### Missing Header File

Wrong:

```cpp
cout << "Hello";
```

without:

```cpp
#include <iostream>
```

---

### Using Keyword As Variable Name

Wrong:

```cpp
int return = 10;
```

---

### Forgetting `main()`

Every C++ program must have:

```cpp
main()
```

---

## Interview Questions

### Q1. What is the entry point of a C++ program?

#### Answer

```cpp
main()
```

---

### Q2. Why do we use `#include <iostream>`?

#### Answer

To use input/output objects such as:

```cpp
cin
cout
endl
```

---

### Q3. What is a namespace?

#### Answer

A mechanism used to avoid naming conflicts.

---

### Q4. What does `return 0` mean?

#### Answer

Program executed successfully.

---

### Q5. What is an identifier?

#### Answer

A user-defined name given to variables, functions, classes, etc.

---

## Cheat Sheet

```cpp
#include <iostream>

using namespace std;

int main()
{
    cout << "Hello World";

    return 0;
}
```

```cpp
// Single Line Comment

/*
Multi-line
Comment
*/
```

```cpp
int age = 20;

const int MAX_SIZE = 100;

constexpr double PI = 3.14159;
```

---

## Key Takeaways

- Every C++ program starts execution from `main()`.
- Header files provide declarations for library features.
- `#include` is a preprocessor directive.
- Namespaces help avoid naming conflicts.
- Statements usually end with a semicolon (`;`).
- Comments are ignored by the compiler.
- Keywords are reserved words in C++.
- Identifiers are names given to program entities.
- Variables store data in memory.
- Constants store values that cannot be modified.
- Program execution follows a top-to-bottom flow inside `main()`.

---