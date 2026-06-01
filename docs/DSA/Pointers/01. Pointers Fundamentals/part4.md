---
sidebar_label: 'Pointers Part 1D'
sidebar_position: 4
---
# C++ Pointers Fundamentals — Part 1D

## Pointer States, Pass By Address, Address Copy vs Value Copy, Special Pointer Behaviors

> In Part 1A, Part 1B, and Part 1C we learned:
>
> - Memory
> - Addresses
> - Pointer Basics
> - Dereferencing
> - Pointer Arithmetic
>
> At this point many developers know the syntax:
>
> ```cpp
> int *ptr = &num;
> ```
>
> but still do not fully understand:
>
> - Why pointers actually exist
> - Why pass-by-address is useful
> - Different states of pointers
> - Value copy vs address copy
> - Special behavior of character pointers
> - Common pointer traps
>
> This chapter fills those gaps before we move to Arrays and Pointers.

---

## Learning Roadmap

In this chapter we will cover:

1. Why Pointers Exist
2. Pointer States
3. Null Pointer
4. Wild Pointer
5. Dangling Pointer (Introduction)
6. Value Copy vs Address Copy
7. Pass By Value
8. Pass By Address
9. Why Pass By Address Is Useful
10. Special Behavior of Character Pointers
11. Pointer Safety Rules
12. Common Bugs
13. Interview Questions

---

## Why Do Pointers Exist?

Before learning more syntax, we need to answer:

```text
Why were pointers invented?
```

---

## Problem Without Pointers

Suppose:

```cpp
void increment(int value)
{
    value++;
}
```

---

## Program

```cpp
#include<iostream>
using namespace std;

void increment(int value)
{
    value++;
}

int main()
{
    int number = 10;

    increment(number);

    cout << number;
}
```

Expected Output:

```text
10
```

---

## Why?

Because:

```cpp
increment(number);
```

creates a copy.

Memory:

```text
number

Address: 1000
Value: 10
```

Function receives:

```text
value

Address: 2000
Value: 10
```

Different memory locations.

---

## Visual

```text
number
 10

↓

COPY

value
 10
```

---

## Result

Changing:

```cpp
value++
```

changes only:

```text
value
```

not:

```text
number
```

---

## How Can We Modify Original Variable?

We must somehow provide:

```text
Original memory address
```

to the function.

This is where pointers become useful.

---

## Pass By Address

Example:

```cpp
void increment(int *ptr)
{
    (*ptr)++;
}
```

---

## Program

```cpp
#include<iostream>
using namespace std;

void increment(int *ptr)
{
    (*ptr)++;
}

int main()
{
    int number = 10;

    increment(&number);

    cout << number;
}
```

Expected Output:

```text
11
```

---

## Execution Flow

Before:

```text
number

Address: 1000
Value: 10
```

---

Function call:

```cpp
increment(&number);
```

passes:

```text
1000
```

---

Inside function:

```text
ptr = 1000
```

---

Operation:

```cpp
(*ptr)++
```

means:

```text
Go to address 1000

Increment value
```

---

Memory After

```text
number

Address: 1000
Value: 11
```

---

## Why Pointers Are Powerful

Without pointers:

```text
Only copies can be modified.
```

With pointers:

```text
Original memory can be modified.
```

---

## Pointer States

A pointer can exist in multiple states.

Understanding these states prevents bugs.

---

## Overview

| Pointer State    | Safe? |
| ---------------- | ----- |
| Valid Pointer    | Yes   |
| Null Pointer     | Yes   |
| Wild Pointer     | No    |
| Dangling Pointer | No    |

---

## Valid Pointer

### Definition

Pointer contains address of valid memory.

---

Example

```cpp
int value = 100;

int *ptr = &value;
```

Memory:

```text
ptr

↓

value
100
```

---

## Null Pointer

### Definition

Pointer intentionally points nowhere.

---

Example

```cpp
int *ptr = nullptr;
```

---

Memory

```text
ptr

↓

NULL
```

---

## Why Null Pointers Exist

Instead of:

```text
Random garbage address
```

we explicitly say:

```text
Pointer currently points nowhere.
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

## Best Practice

Always prefer:

```cpp
int *ptr = nullptr;
```

instead of:

```cpp
int *ptr;
```

---

## Wild Pointer

### Definition

Pointer declared but never initialized.

---

Example

```cpp
int *ptr;
```

---

Memory

```text
ptr

↓

Random Address
```

Example:

```text
0xABCD1234
```

---

## Why Dangerous?

Program believes:

```text
Valid memory exists there
```

even though it doesn't.

---

## Example

```cpp
int *ptr;

cout << ptr;
```

Possible Output:

```text
Random Address
```

---

## Even Worse

```cpp
int *ptr;

cout << *ptr;
```

Possible Result:

```text
Crash
Segmentation Fault
Undefined Behavior
```

---

## Wild Pointer vs Null Pointer

| Feature     | Wild Pointer | Null Pointer |
| ----------- | ------------ | ------------ |
| Initialized | No           | Yes          |
| Safe        | No           | Yes          |
| Known State | No           | Yes          |
| Recommended | No           | Yes          |

---

## Dangling Pointer

### Definition

Pointer that points to memory that no longer exists.

---

## Example

```cpp
int *ptr;

{
    int number = 10;

    ptr = &number;
}
```

---

## Memory

Initially:

```text
ptr

↓

number
10
```

---

## After Block Ends

```cpp
{
    int number = 10;
}
```

Variable destroyed.

---

But:

```cpp
ptr
```

still stores old address.

---

## Visual

```text
ptr

↓

Memory No Longer Valid
```

---

## Why Dangerous?

Pointer thinks:

```text
Object still exists
```

Reality:

```text
Object already destroyed
```

---

## Example

```cpp
int *ptr;

{
    int number = 10;

    ptr = &number;
}

cout << *ptr;
```

Result:

```text
Undefined Behavior
```

---

## Important Note

We will study dangling pointers in detail later during:

```text
Dynamic Memory Allocation
```

---

## Value Copy vs Address Copy

One of the most important interview concepts.

---

## Value Copy

Example:

```cpp
int firstNumber = 100;

int secondNumber = firstNumber;
```

---

## Memory

```text
firstNumber

Address: 1000
Value: 100


secondNumber

Address: 2000
Value: 100
```

---

## Modify Second Variable

```cpp
secondNumber = 500;
```

Result:

```text
firstNumber = 100

secondNumber = 500
```

---

## Why?

Because:

```text
Value copied
```

not memory.

---

## Address Copy

Example

```cpp
int value = 100;

int *pointerOne = &value;

int *pointerTwo = pointerOne;
```

---

## Memory

```text
pointerOne

↓

value
100

pointerTwo

↓

value
100
```

---

## Visual

```text
pointerOne ──┐
             │
             ▼

           value
            100

             ▲
             │

pointerTwo ──┘
```

---

## Modify Through Second Pointer

```cpp
*pointerTwo = 999;
```

---

Result

```text
value = 999
```

---

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int value = 100;

    int *pointerOne = &value;

    int *pointerTwo = pointerOne;

    *pointerTwo = 999;

    cout << value;
}
```

Expected Output:

```text
999
```

---

## Comparison Table

| Feature               | Value Copy | Address Copy |
| --------------------- | ---------- | ------------ |
| Copies Value          | Yes        | No           |
| Copies Address        | No         | Yes          |
| Shared Memory         | No         | Yes          |
| Modification Reflects | No         | Yes          |

---

## Why Pass By Address Is Useful

Consider swapping two numbers.

Without pointers:

```cpp
void swapValues(int a,int b)
{
    int temp = a;
    a = b;
    b = temp;
}
```

---

## Program

```cpp
#include<iostream>
using namespace std;

void swapValues(int a,int b)
{
    int temp = a;
    a = b;
    b = temp;
}

int main()
{
    int x = 10;
    int y = 20;

    swapValues(x,y);

    cout << x << " " << y;
}
```

Expected Output:

```text
10 20
```

---

## Why Failed?

Function received:

```text
Copies
```

---

## Using Pointers

```cpp
void swapValues(
int *first,
int *second
)
{
    int temp = *first;

    *first = *second;

    *second = temp;
}
```

---

## Program

```cpp
#include<iostream>
using namespace std;

void swapValues(
int *first,
int *second
)
{
    int temp = *first;

    *first = *second;

    *second = temp;
}

int main()
{
    int x = 10;
    int y = 20;

    swapValues(&x,&y);

    cout << x << " " << y;
}
```

Expected Output:

```text
20 10
```

---

## Why Successful?

Function modifies:

```text
Original memory locations
```

instead of copies.

---

## Special Behavior of Character Pointers

This is a very common interview trap.

---

## Example

```cpp
char grade = 'A';

char *ptr = &grade;

cout << ptr;
```

---

## Beginner Expectation

```text
Address
```

---

## Actual Behavior

Undefined / unexpected output.

Possibly:

```text
A▒▒▒▒...
```

---

## Why?

Because:

```cpp
cout
```

treats:

```cpp
char*
```

as:

```text
C-style string
```

---

## Example

```cpp
char name[] = "Prashant";

char *ptr = name;

cout << ptr;
```

Expected Output:

```text
Prashant
```

---

## Why?

`cout` assumes:

```cpp
char*
```

points to a string.

---

## How To Print Actual Address?

Use:

```cpp
cout << static_cast<void*>(ptr);
```

---

## Example

```cpp
char name[] = "Hello";

char *ptr = name;

cout << static_cast<void*>(ptr);
```

Expected Output:

```text
0x7fffdd3ef8c4
```

---

## Pointer Safety Rules

---

## Rule 1

Always initialize pointers.

Good:

```cpp
int *ptr = nullptr;
```

Bad:

```cpp
int *ptr;
```

---

## Rule 2

Never dereference null pointers.

Wrong:

```cpp
*ptr
```

when:

```cpp
ptr == nullptr
```

---

## Rule 3

Never dereference wild pointers.

Wrong:

```cpp
int *ptr;

*ptr = 10;
```

---

## Rule 4

Do not use dangling pointers.

---

## Rule 5

When unsure:

```cpp
ptr = nullptr;
```

---

## Common Bugs

---

## Bug 1

```cpp
int *ptr = nullptr;

cout << *ptr;
```

Reason:

```text
Null Pointer Dereference
```

---

## Bug 2

```cpp
int *ptr;

*ptr = 100;
```

Reason:

```text
Wild Pointer
```

---

## Bug 3

```cpp
char ch='A';

char *ptr=&ch;

cout << ptr;
```

Reason:

```text
cout treats char* specially
```

---

## Bug 4

```cpp
int *ptr;

{
    int x = 10;

    ptr = &x;
}

cout << *ptr;
```

Reason:

```text
Dangling Pointer
```

---

## Interview Questions

---

### Q1

Why do pointers exist?

#### Answer

To work with original memory addresses and allow direct memory manipulation.

---

### Q2

Difference between null pointer and wild pointer?

#### Answer

| Null Pointer | Wild Pointer  |
| ------------ | ------------- |
| Initialized  | Uninitialized |
| Safe State   | Unsafe State  |
| Known Value  | Garbage Value |

---

### Q3

What is a dangling pointer?

#### Answer

Pointer pointing to memory that no longer exists.

---

### Q4

Difference between value copy and address copy?

#### Answer

Value copy duplicates data.

Address copy shares access to same memory.

---

### Q5

Why does:

```cpp
cout << charPointer;
```

behave differently?

#### Answer

Because `cout` treats `char*` as a C-style string.

---

## Cheat Sheet

```cpp
int *ptr = nullptr;

int *ptr;

*ptr;

(*ptr)++;

void increment(int *ptr)
{
    (*ptr)++;
}

increment(&value);

int *p1 = &value;

int *p2 = p1;

char *ptr = name;

cout << static_cast<void*>(ptr);
```

---

## Key Takeaways

- Pointers exist to work with original memory.
- Pass by value creates copies.
- Pass by address allows modification of original data.
- Null pointers are safe placeholders.
- Wild pointers are dangerous.
- Dangling pointers reference destroyed memory.
- Value copy and address copy are fundamentally different.
- Multiple pointers can point to the same memory.
- `char*` has special behavior with `cout`.
- Always initialize pointers.

---

## End of Pointers Fundamentals — Part 1D
