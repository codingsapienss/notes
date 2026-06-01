---
sidebar_label: 'Pointers Part 1A'
sidebar_position: 1
---
# C++ Pointers Fundamentals — Part 1A

## Memory, Addresses, Symbol Table, Pointer Fundamentals

> Before learning pointers, you must first understand how variables actually exist inside memory.
>
> Most beginners memorize:
>
> ```cpp
> int num = 5;
> ```
>
> without understanding:
>
> - Where is `num` stored?
> - What exactly is a memory address?
> - Why do pointers exist?
> - Why can't we simply store addresses in normal variables?
> - What is the compiler actually doing?
>
> This chapter answers those questions from first principles.

---

## Learning Roadmap

In this chapter we will cover:

1. How memory works
2. RAM basics
3. How variables are stored
4. Stack memory
5. Memory addresses
6. Symbol table
7. Address-of operator (`&`)
8. Why pointers exist
9. Pointer declaration
10. Pointer initialization
11. Different pointer types
12. Null pointers
13. Uninitialized pointers
14. Pointer size
15. 32-bit vs 64-bit systems
16. Common mistakes
17. Interview questions

---

## What Is Memory?

### Intuition

When a program runs, it needs space to store:

- numbers
- strings
- objects
- arrays
- functions
- temporary values

That storage space is called:

```text
Memory (RAM)
```

---

## Real World Analogy

Imagine a huge apartment building.

```text
Building
│
├── Room 100
├── Room 101
├── Room 102
├── Room 103
└── Room 104
```

Each room:

```text
Has an address
Stores something
```

Memory works similarly.

```text
Memory
│
├── Address 1000
├── Address 1001
├── Address 1002
├── Address 1003
└── Address 1004
```

Each location:

```text
Has an address
Stores data
```

---

## Memory Is Just Bytes

Computers store information in bytes.

```text
1 Byte = 8 Bits
```

Memory looks like:

```text
Address      Content

1000         ?
1001         ?
1002         ?
1003         ?
1004         ?
```

---

## Variables Inside Memory

Consider:

```cpp
int age = 25;
```

Many beginners imagine:

```text
age = 25
```

But internally:

```text
Address      Value

1000         25
1001
1002
1003
```

because:

```cpp
sizeof(int)
```

typically equals:

```text
4 bytes
```

---

## Important Observation

Memory stores:

```text
25
```

Memory does NOT store:

```text
age
```

This is extremely important.

---

## Then Where Does Variable Name Exist?

The variable name:

```cpp
age
```

exists primarily for:

```text
Programmer convenience
```

The CPU does not execute:

```text
age
```

The CPU executes:

```text
memory addresses
```

---

## Symbol Table

### Definition

A symbol table is a compiler-maintained structure that maps:

```text
Variable Name

↓

Memory Location
```

---

## Example

Code:

```cpp
int age = 25;
int salary = 50000;
```

Conceptually:

```text
Symbol Table

age     → 0x1000

salary  → 0x2000
```

---

## Why Symbol Table Exists

Without symbol tables:

```cpp
cout << age;
```

would be impossible.

Compiler needs a way to know:

```text
Which memory location belongs to age?
```

---

## Important Note

The symbol table is mostly a:

```text
Compile-time concept
```

At runtime:

```text
CPU works with addresses
```

not variable names.

---

## Stack Memory

### Definition

Local variables are generally stored in:

```text
Stack Memory
```

---

## Example

```cpp
int marks = 95;
double cgpa = 8.4;
char grade = 'A';
```

Possible memory:

```text
Stack

Address        Value

0x1000         95
0x1004         8.4
0x1012         A
```

---

## Visual Representation

```text
Stack Memory

┌──────────┐
│ grade    │
├──────────┤
│ cgpa     │
├──────────┤
│ marks    │
└──────────┘
```

---

## Memory Addresses

### Definition

Every memory location has a unique address.

Think of it like:

```text
House Number
```

for memory.

---

## Example

```cpp
int number = 100;
```

Possible memory:

```text
Address         Value

0x7fffdd3ef8c4  100
```

---

## Why Hexadecimal?

Memory addresses are usually displayed in:

```text
Hexadecimal
```

Example:

```text
0x7fffdd3ef8c4
```

---

## Why Not Decimal?

Decimal:

```text
140734622234564
```

Hexadecimal:

```text
0x7fffdd3ef8c4
```

Much shorter and easier.

---

## Address-of Operator (`&`)

### Definition

The address-of operator returns the memory address of a variable.

Symbol:

```cpp
&
```

---

## Syntax

```cpp
&variableName
```

---

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int number = 100;

    cout << &number;
}
```

---

## Expected Output

```text
0x7fffdd3ef8c4
```

Actual address varies every run.

---

## Code Explanation

```cpp
&number
```

means:

```text
Give me the address where number is stored.
```

---

## Example With Multiple Variables

```cpp
int age = 25;
double salary = 50000.5;
char grade = 'A';

cout << &age << endl;
cout << &salary << endl;
cout << &grade << endl;
```

Expected Output:

```text
Different addresses
```

Example:

```text
0x7fff1000
0x7fff1008
0x7fff1016
```

---

## Why Pointers Exist?

Suppose:

```cpp
int number = 100;
```

Address:

```text
0x7fffdd3ef8c4
```

Question:

```text
Can we store this address?
```

Yes.

---

## Naive Approach

```cpp
long long address = 0x7fffdd3ef8c4;
```

Why is this bad?

Because:

```text
Address is not just a number.
```

It represents:

```text
Location of a specific data type.
```

---

## Problem With Storing Addresses In Normal Variables

Consider:

```cpp
int number = 100;
double price = 19.99;
```

Addresses:

```text
0x1000
0x2000
```

If we store both inside:

```cpp
long long
```

compiler loses information:

```text
What type exists at that address?
```

---

## Solution: Pointers

Pointers store:

```text
Memory addresses
```

while preserving:

```text
Type information
```

---

## Definition of Pointer

A pointer is a variable that stores the address of another variable.

---

## Pointer Declaration

### Syntax

```cpp
datatype *pointerName;
```

---

## Example

```cpp
int *ptr;
```

Read as:

```text
ptr is a pointer to int
```

---

## Memory Diagram

```cpp
int number = 100;

int *ptr = &number;
```

```text
number

Address: 1000
Value:   100


ptr

Address: 2000
Value:   1000
```

---

## Visual Representation

```text
ptr
 │
 │ stores address
 ▼

number
 100
```

---

## Complete Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int number = 100;

    int *ptr = &number;

    cout << "Address stored in ptr: "
         << ptr << endl;
}
```

Expected Output:

```text
Address stored in ptr:
0x7fffdd3ef8c4
```

---

## Understanding The Syntax

Many students incorrectly think:

```cpp
int* ptr;
```

means:

```text
ptr is an integer
```

Wrong.

Actual meaning:

```text
ptr stores address of an integer.
```

---

## Different Pointer Types

---

### Integer Pointer

```cpp
int value = 10;

int *ptr = &value;
```

---

### Double Pointer

```cpp
double price = 2.34;

double *ptr = &price;
```

---

### Character Pointer

```cpp
char grade = 'A';

char *ptr = &grade;
```

---

### Float Pointer

```cpp
float marks = 99.5f;

float *ptr = &marks;
```

---

## Why Different Pointer Types Exist

Because compiler must know:

```text
What type exists at the target address?
```

This becomes extremely important later for:

```text
Dereferencing

Pointer Arithmetic
```

---

## Uninitialized Pointer

### Dangerous Example

```cpp
int *ptr;
```

---

## What Happens?

Pointer contains:

```text
Garbage address
```

Example:

```text
0xABCD1234
```

---

## Why Dangerous?

Program thinks:

```text
Valid memory exists there
```

even though it doesn't.

---

## Never Do This

```cpp
int *ptr;

cout << ptr;
```

Output:

```text
Random address
```

---

## Even Worse

```cpp
int *ptr;

cout << *ptr;
```

Possible result:

```text
Crash
Segmentation Fault
Undefined Behavior
```

---

## Best Practice

Always initialize pointers.

Good:

```cpp
int *ptr = nullptr;
```

---

## Null Pointer

### Definition

Null pointer points to:

```text
No valid memory location
```

---

## Syntax

```cpp
int *ptr = nullptr;
```

---

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int *ptr = nullptr;

    cout << ptr;
}
```

Expected Output:

```text
0
```

or

```text
(nullptr)
```

depending on compiler.

---

## Why Null Pointer Is Useful

Instead of:

```text
Random garbage address
```

we explicitly say:

```text
This pointer currently points nowhere.
```

---

## Assign Later

```cpp
int value = 5;

int *ptr = nullptr;

ptr = &value;
```

This is completely valid.

---

## Pointer Size

A very common interview question.

---

## Example

```cpp
int value = 100;

int *intPtr = &value;

double number = 2.34;

double *doublePtr = &number;
```

---

## Check Sizes

```cpp
cout << sizeof(intPtr) << endl;

cout << sizeof(doublePtr);
```

Expected Output (64-bit system):

```text
8
8
```

---

## Why Same Size?

Pointers store:

```text
Addresses
```

not actual data.

---

## Important Observation

| Type     | Size    |
| -------- | ------- |
| int      | 4 bytes |
| double   | 8 bytes |
| char     | 1 byte  |
| int\*    | 8 bytes |
| double\* | 8 bytes |
| char\*   | 8 bytes |

---

## Why?

Because:

```text
All memory addresses require the same number of bits.
```

---

## Null Pointer Size

Example:

```cpp
int *nullPtr = nullptr;

cout << sizeof(nullPtr);
```

Expected Output:

```text
8
```

---

## Why?

Pointer size depends on:

```text
Architecture
```

NOT:

```text
Stored value
```

---

## 32-bit vs 64-bit Systems

---

### 32-bit System

Address size:

```text
4 bytes
```

Therefore:

```cpp
sizeof(pointer)
```

Output:

```text
4
```

---

### 64-bit System

Address size:

```text
8 bytes
```

Therefore:

```cpp
sizeof(pointer)
```

Output:

```text
8
```

---

## Summary Table

| Architecture | Pointer Size |
| ------------ | ------------ |
| 32-bit       | 4 Bytes      |
| 64-bit       | 8 Bytes      |

---

## Common Mistakes

### Mistake 1

```cpp
int *ptr;

cout << *ptr;
```

Reason:

```text
Uninitialized pointer
```

---

### Mistake 2

```cpp
int *ptr = nullptr;

cout << *ptr;
```

Reason:

```text
Null pointer dereference
```

---

### Mistake 3

```cpp
long long address = &number;
```

Reason:

Loses pointer type information.

---

## Interview Questions

### Q1

What is a pointer?

#### Answer

A pointer is a variable that stores the address of another variable.

---

### Q2

Why do pointers have data types?

#### Answer

Compiler must know:

```text
What type exists at the stored address.
```

---

### Q3

Why are addresses displayed in hexadecimal?

#### Answer

Hexadecimal is more compact and easier to read than decimal.

---

### Q4

What is the difference between:

```cpp
int *ptr;
```

and

```cpp
int *ptr = nullptr;
```

#### Answer

First:

```text
Garbage address
```

Second:

```text
Points nowhere safely
```

---

### Q5

Why is size of every pointer same?

#### Answer

Pointers store addresses.

Address size depends on architecture, not data type.

---

## Key Takeaways

- Variables live in memory.
- Memory is organized using addresses.
- Variable names are mostly compiler conveniences.
- CPU works with addresses, not variable names.
- Symbol tables map names to memory locations.
- `&` returns address of a variable.
- Pointers store addresses.
- Pointer types preserve type information.
- Always initialize pointers.
- Prefer `nullptr` over uninitialized pointers.
- Pointer size depends on architecture, not data type.
- On modern systems, pointer size is usually 8 bytes.

---

## End of Pointers Fundamentals — Part 1A
