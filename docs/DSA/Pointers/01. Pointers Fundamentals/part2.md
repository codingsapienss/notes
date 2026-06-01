---
sidebar_label: 'Pointers Part 1B'
sidebar_position: 2
---
# C++ Pointers Fundamentals — Part 1B

## Dereference Operator, Memory Access, Pointer Copying, Call By Value Fundamentals

> In Part 1A we learned:
>
> - Memory addresses
> - Address-of operator (`&`)
> - Pointer declaration
> - Pointer initialization
> - Null pointers
> - Pointer sizes
>
> But a major question still remains:
>
> ```text
> We stored the address.
>
> Now what?
> ```
>
> A pointer becomes useful only when we can access the memory it points to.
>
> This chapter teaches:
>
> - Dereferencing
> - Reading values through pointers
> - Modifying values through pointers
> - Pointer copying
> - Value copying
> - Shared memory concepts
> - Call by Value fundamentals

---

## Learning Roadmap

In this chapter we will cover:

1. Dereference Operator (`*`)
2. Reading Through Pointers
3. Writing Through Pointers
4. Relationship Between Variable and Pointer
5. Multiple Names For Same Memory
6. Copying Variables
7. Copying Pointers
8. Multiple Pointers To Same Variable
9. Memory Diagrams
10. Call By Value
11. Why Changes Sometimes Don't Reflect
12. Common Bugs
13. Interview Questions

---

## Revisiting Pointer Basics

Consider:

```cpp
int score = 100;

int *scorePtr = &score;
```

Memory:

```text
score

Address: 1000
Value:   100


scorePtr

Address: 2000
Value:   1000
```

Visual:

```text
scorePtr
    │
    │ stores address
    ▼

 score
 100
```

---

## The Big Question

We know:

```cpp
scorePtr
```

contains:

```text
1000
```

which is the address of:

```cpp
score
```

But how do we access:

```text
100
```

stored at that address?

---

## Dereference Operator (`*`)

### Definition

The dereference operator accesses the value stored at the address held by a pointer.

Symbol:

```cpp
*
```

---

## Syntax

```cpp
*pointerName
```

Example:

```cpp
*scorePtr
```

Meaning:

```text
Go to the address stored inside scorePtr
and give me the value stored there.
```

---

## Memory Diagram

```cpp
int score = 100;

int *scorePtr = &score;
```

Memory:

```text
score

Address: 1000
Value:   100


scorePtr

Address: 2000
Value:   1000
```

Evaluation:

```cpp
*scorePtr
```

Step 1:

```text
scorePtr contains 1000
```

Step 2:

```text
Go to address 1000
```

Step 3:

```text
Read value stored there
```

Result:

```text
100
```

---

## First Dereference Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int score = 100;

    int *scorePtr = &score;

    cout << *scorePtr;
}
```

Expected Output:

```text
100
```

---

## Code Explanation

```cpp
scorePtr
```

contains:

```text
address of score
```

---

```cpp
*scorePtr
```

means:

```text
value stored at address inside scorePtr
```

---

## Pointer vs Dereferenced Pointer

One of the most important concepts.

---

## Pointer

```cpp
scorePtr
```

stores:

```text
Address
```

Example:

```text
0x7fffdd3ef8c4
```

---

## Dereferenced Pointer

```cpp
*scorePtr
```

stores:

```text
Value at that address
```

Example:

```text
100
```

---

## Example

```cpp
cout << scorePtr << endl;

cout << *scorePtr;
```

Expected Output:

```text
0x7fffdd3ef8c4
100
```

---

## Common Interview Question

What is the difference between:

```cpp
ptr
```

and

```cpp
*ptr
```

Answer:

| Expression | Meaning          |
| ---------- | ---------------- |
| ptr        | Address          |
| \*ptr      | Value at address |

---

## Relationship Between Variable and Dereferenced Pointer

Consider:

```cpp
int marks = 95;

int *marksPtr = &marks;
```

---

## Memory

```text
Address: 1000

Value: 95
```

---

## Access Through Variable

```cpp
cout << marks;
```

Output:

```text
95
```

---

## Access Through Pointer

```cpp
cout << *marksPtr;
```

Output:

```text
95
```

---

## Important Observation

Both produce:

```text
95
```

Why?

Because both ultimately refer to:

```text
same memory location
```

---

## Visual Diagram

```text
marks
  │
  │
  ▼

Address 1000
Value 95

  ▲
  │
  │

*marksPtr
```

---

## Key Rule

For a valid pointer:

```cpp
marks == *marksPtr
```

in terms of value.

---

## Writing Through Pointer

Until now we only read values.

Now let's modify them.

---

## Example

```cpp
int score = 100;

int *scorePtr = &score;

*scorePtr = 500;
```

---

## Memory Before

```text
Address: 1000

Value: 100
```

---

## Execution

```cpp
*scorePtr = 500;
```

means:

```text
Go to address stored in scorePtr

Store 500 there
```

---

## Memory After

```text
Address: 1000

Value: 500
```

---

## Complete Program

```cpp
#include<iostream>
using namespace std;

int main()
{
    int score = 100;

    int *scorePtr = &score;

    *scorePtr = 500;

    cout << score;
}
```

Expected Output:

```text
500
```

---

## Why Did score Change?

Many beginners think:

```text
Pointer stores a copy
```

Wrong.

Pointer stores:

```text
Address
```

not value.

---

## Visual Representation

Before:

```text
score
100
```

Pointer:

```text
scorePtr

↓

score
100
```

---

After:

```cpp
*scorePtr = 500;
```

Memory becomes:

```text
score
500
```

---

## Reading and Writing Together

```cpp
#include<iostream>
using namespace std;

int main()
{
    int value = 200;

    int *valuePtr = &value;

    cout << "Before: "
         << value << endl;

    *valuePtr = 700;

    cout << "After: "
         << value;
}
```

Expected Output:

```text
Before: 200

After: 700
```

---

## Increment Through Pointer

Example:

```cpp
int value = 200;

int *valuePtr = &value;

(*valuePtr)++;
```

---

## Execution

Before:

```text
200
```

---

Operation:

```cpp
(*valuePtr)++
```

means:

```text
Increment value stored
at target memory location.
```

---

After:

```text
201
```

---

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int value = 200;

    int *valuePtr = &value;

    (*valuePtr)++;

    cout << value;
}
```

Expected Output:

```text
201
```

---

## Important Distinction

Many students confuse:

```cpp
(*ptr)++
```

and

```cpp
ptr++
```

These are NOT the same.

---

## Version 1

```cpp
(*ptr)++
```

Changes:

```text
Stored value
```

---

## Version 2

```cpp
ptr++
```

Changes:

```text
Pointer address
```

---

Pointer arithmetic will be covered later.

---

## Copying Variables

Now let's compare variable copying and pointer copying.

---

## Example

```cpp
int firstNumber = 100;

int secondNumber = firstNumber;
```

---

## Memory

```text
firstNumber

Address: 1000
Value:   100


secondNumber

Address: 2000
Value:   100
```

---

## Important Observation

Two separate variables.

Two separate memory locations.

---

## Modify One

```cpp
secondNumber = 500;
```

Memory:

```text
firstNumber = 100

secondNumber = 500
```

---

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int firstNumber = 100;

    int secondNumber = firstNumber;

    secondNumber = 500;

    cout << firstNumber << endl;

    cout << secondNumber;
}
```

Expected Output:

```text
100
500
```

---

## Why?

Because:

```text
Value was copied
```

not memory.

---

## Pointer Copying

Now compare:

```cpp
int value = 100;

int *pointerOne = &value;

int *pointerTwo = pointerOne;
```

---

## Memory

```text
value

Address: 1000
Value:   100


pointerOne

Address: 2000
Value:   1000


pointerTwo

Address: 3000
Value:   1000
```

---

## Important Observation

Both pointers store:

```text
Same address
```

---

## Visual Diagram

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

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int value = 100;

    int *pointerOne = &value;

    int *pointerTwo = pointerOne;

    cout << *pointerOne << endl;

    cout << *pointerTwo;
}
```

Expected Output:

```text
100
100
```

---

## Modify Through Second Pointer

```cpp
*pointerTwo = 999;
```

---

## Memory

Before:

```text
value = 100
```

After:

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

    cout << value << endl;

    cout << *pointerOne << endl;

    cout << *pointerTwo;
}
```

Expected Output:

```text
999
999
999
```

---

## Why?

All three refer to:

```text
same memory location
```

---

## Multiple Pointers To Same Variable

Example:

```cpp
int marks = 80;

int *p1 = &marks;

int *p2 = &marks;

int *p3 = &marks;
```

---

## Visual

```text
p1 ──┐
      │
p2 ──┼──► marks
      │      80
p3 ──┘
```

---

## Modify Through Any Pointer

```cpp
*p2 = 150;
```

Result:

```text
marks = 150
```

---

## Call By Value Fundamentals

Consider:

```cpp
void update(int value)
{
    value = 500;
}
```

---

## Program

```cpp
#include<iostream>
using namespace std;

void update(int value)
{
    value = 500;
}

int main()
{
    int number = 100;

    update(number);

    cout << number;
}
```

Expected Output:

```text
100
```

---

## Why Did It Not Change?

Many beginners expect:

```text
500
```

---

## What Actually Happens

When function is called:

```cpp
update(number);
```

compiler creates:

```text
COPY
```

---

## Memory

Before:

```text
number

Address: 1000
Value: 100
```

---

Function receives:

```text
value

Address: 2000
Value: 100
```

---

## Visual

```text
number
100

↓

copy

value
100
```

---

## Modify Copy

```cpp
value = 500;
```

Now:

```text
number = 100

value = 500
```

---

## After Function Ends

```text
value destroyed
```

Only:

```text
number = 100
```

remains.

---

## Call By Value Summary

Function receives:

```text
Copy of value
```

Therefore:

```text
Changes do not affect original variable.
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
Dereferencing null pointer
```

---

## Bug 2

```cpp
int *ptr;

*ptr = 100;
```

Reason:

```text
Uninitialized pointer
```

---

## Bug 3

```cpp
int *ptr = nullptr;

(*ptr)++;
```

Reason:

```text
No valid memory exists
```

---

## Interview Questions

---

### Q1

What does:

```cpp
*ptr
```

mean?

#### Answer

Value stored at the address held by pointer.

---

### Q2

Difference between:

```cpp
ptr
```

and

```cpp
*ptr
```

#### Answer

| Expression | Meaning          |
| ---------- | ---------------- |
| ptr        | Address          |
| \*ptr      | Value at address |

---

### Q3

Why does:

```cpp
*ptr = 500;
```

change original variable?

#### Answer

Because pointer accesses original memory location.

---

### Q4

Difference between copying variable and copying pointer?

#### Answer

Variable copy:

```text
Copies value
```

Pointer copy:

```text
Copies address
```

---

### Q5

Why does call by value not modify original variable?

#### Answer

Function receives a separate copy.

---

## Cheat Sheet

```cpp
int value = 100;

int *ptr = &value;

cout << ptr;      // address

cout << *ptr;     // value

*ptr = 500;

(*ptr)++;

int *ptr2 = ptr;

*ptr2 = 999;


int a = 100;

int b = a;        // value copy
```

---

## Key Takeaways

- `ptr` stores an address.
- `*ptr` accesses the value at that address.
- Reading through a pointer is called dereferencing.
- Writing through a pointer modifies original memory.
- Variable copying creates independent memory.
- Pointer copying shares memory access.
- Multiple pointers can point to the same variable.
- Call by value creates copies.
- Changes to copies do not affect originals.
- Understanding `ptr` vs `*ptr` is the foundation of all advanced pointer topics.

---

## End of Pointers Fundamentals — Part 1B
