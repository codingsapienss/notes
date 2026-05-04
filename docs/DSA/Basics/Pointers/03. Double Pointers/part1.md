---
sidebar_label: 'Double Pointers Basics'
sidebar_position: 9
---

# Double Pointers Fundamentals

> Most developers understand:
>
> ```cpp
> int value = 10;
>
> int *ptr = &value;
> ```
>
> But very few ask:
>
> ```text
> If a pointer is also a variable,
> then does a pointer itself have an address?
> ```
>
> The answer is:
>
> ```text
> YES
> ```
>
> And that single idea leads to:
>
> ```cpp
> int **ptr;
> ```
>
> Double pointers.
>
> This chapter explains double pointers from first principles using memory diagrams, symbol tables, execution traces, and real interview examples.

---

### Learning Roadmap

In this chapter we will cover:

1. Why Double Pointers Exist
2. Address of a Pointer
3. Pointer to Pointer
4. Double Pointer Declaration
5. Memory Layout
6. Symbol Table Visualization
7. Understanding `p`, `*p`, `**p`
8. Multi-Level Dereferencing
9. Triple Pointers
10. Function Examples
11. Analysis of:
    - `p = p + 1`
    - `*p = *p + 1`
    - `**p = **p + 1`
12. Common Bugs
13. Interview Questions

---

### Recap: Single Pointer

Consider:

```cpp
int value = 5;

int *valuePtr = &value;
```

---

### Symbol Table

```text
Variable        Value

value           5

valuePtr        Address of value
```

---

### Memory Layout

```text
Address      Value

1000         5
```

---

Pointer:

```text
Address      Value

2000         1000
```

---

### Visual Diagram

```text
valuePtr
   │
   │ stores address
   ▼

 value
   5
```

---

### Important Observation

Most beginners stop here.

But look carefully:

```text
value
```

has an address.

---

```text
valuePtr
```

is also a variable.

Therefore:

```text
valuePtr must also have an address.
```

---

### Address of a Pointer

Example:

```cpp
int value = 5;

int *valuePtr = &value;
```

---

### Printing Addresses

```cpp
cout << &value << endl;

cout << &valuePtr << endl;
```

Possible Output:

```text
0x1000
0x2000
```

---

### Memory Diagram

```text
Address      Value

1000         5

2000         1000
```

---

### Interpretation

```text
valuePtr
```

contains:

```text
1000
```

---

But:

```text
valuePtr
```

itself lives at:

```text
2000
```

---

### Visual Representation

```text
valuePtr

Address: 2000
Value:   1000


value

Address: 1000
Value:   5
```

---

### Why Is This Important?

Because now we can store:

```text
Address of valuePtr
```

inside another pointer.

---

### What Is A Double Pointer?

#### Definition

A double pointer is a pointer that stores the address of another pointer.

---

### Syntax

```cpp
int **ptr;
```

Read as:

```text
ptr is a pointer
to a pointer
to an integer
```

---

### First Example

```cpp
int value = 5;

int *valuePtr = &value;

int **doublePtr = &valuePtr;
```

---

### Symbol Table

```text
Variable          Value

value             5

valuePtr          Address of value

doublePtr         Address of valuePtr
```

---

### Memory Layout

Assume:

```text
value     at 1000
valuePtr  at 2000
doublePtr at 3000
```

---

Memory:

```text
Address      Value

1000         5

2000         1000

3000         2000
```

---

### Visual Diagram

```text
doublePtr
     │
     ▼

valuePtr
     │
     ▼

 value
   5
```

---

### Multi-Level Memory Diagram

```text
doublePtr

Address: 3000
Value:   2000


valuePtr

Address: 2000
Value:   1000


value

Address: 1000
Value:   5
```

---

### Understanding p, \*p, \*\*p

This is the most important concept.

---

### Example

```cpp
int value = 5;

int *valuePtr = &value;

int **doublePtr = &valuePtr;
```

---

### Step 1

```cpp
doublePtr
```

Value:

```text
2000
```

Meaning:

```text
Address of valuePtr
```

---

### Step 2

```cpp
*doublePtr
```

Go to:

```text
2000
```

Read value:

```text
1000
```

Result:

```text
Address of value
```

---

### Step 3

```cpp
**doublePtr
```

First:

```cpp
*doublePtr
```

gives:

```text
1000
```

---

Then:

```cpp
*(1000)
```

gives:

```text
5
```

---

Result:

```text
5
```

---

### Summary Table

| Expression    | Meaning              | Result |
| ------------- | -------------------- | ------ |
| `doublePtr`   | Address of pointer   | 2000   |
| `*doublePtr`  | Pointer value        | 1000   |
| `**doublePtr` | Actual integer value | 5      |

---

### Example Program

```cpp
#include<iostream>
using namespace std;

int main()
{
    int value = 5;

    int *valuePtr = &value;

    int **doublePtr = &valuePtr;

    cout << value << endl;

    cout << valuePtr << endl;

    cout << *valuePtr << endl;

    cout << doublePtr << endl;

    cout << *doublePtr << endl;

    cout << **doublePtr << endl;
}
```

---

### Expected Output

Addresses vary.

Structure:

```text
5

0x1000

5

0x2000

0x1000

5
```

---

### Understanding All Expressions

---

#### value

```cpp
value
```

Output:

```text
5
```

---

#### valuePtr

```cpp
valuePtr
```

Output:

```text
Address of value
```

---

#### \*valuePtr

```cpp
*valuePtr
```

Output:

```text
5
```

---

#### doublePtr

```cpp
doublePtr
```

Output:

```text
Address of valuePtr
```

---

#### \*doublePtr

```cpp
*doublePtr
```

Output:

```text
Address of value
```

---

#### \*\*doublePtr

```cpp
**doublePtr
```

Output:

```text
5
```

---

### Why Do We Need Double Pointers?

Many developers ask:

```text
Why not just use normal pointers?
```

---

### Reason 1

Modify pointers inside functions.

---

### Reason 2

Dynamic memory management.

---

### Reason 3

Complex data structures.

Examples:

- Linked Lists
- Trees
- Graphs
- Dynamic 2D Arrays

---

### Reason 4

Functions that need to change:

```cpp
pointer itself
```

not just:

```cpp
value pointed to
```

---

### Understanding Function Behavior

Consider:

```cpp
void update(int **p)
{
}
```

---

### Initial Setup

```cpp
int num = 20;

int *numPtr = &num;

int **numPtr2 = &numPtr;
```

---

### Memory

```text
num

Address: 1000
Value: 20


numPtr

Address: 2000
Value: 1000


numPtr2

Address: 3000
Value: 2000
```

---

### Case 1

#### p = p + 1

Function:

```cpp
void update(int **p)
{
    p = p + 1;
}
```

---

### What Changes?

Only:

```text
Local copy
```

changes.

---

Before:

```text
p = 3000
```

---

After:

```text
p = 3008
```

(assuming 8-byte pointers)

---

### Outside Function

```cpp
numPtr2
```

remains unchanged.

---

### Why?

Function receives:

```text
Copy of double pointer
```

---

### Visual

Before:

```text
numPtr2 ---> numPtr ---> num
```

---

Inside:

```text
p ---> numPtr ---> num
```

---

After:

```cpp
p = p+1;
```

Only:

```text
p
```

changes.

---

Original:

```text
numPtr2
```

unchanged.

---

### Case 2

#### *p = *p + 1

Function:

```cpp
void update(int **p)
{
    *p = *p + 1;
}
```

---

### Evaluation

```cpp
*p
```

is:

```cpp
numPtr
```

---

Operation:

```cpp
numPtr = numPtr + 1;
```

---

### What Changes?

Original pointer:

```cpp
numPtr
```

changes.

---

### Memory

Before:

```text
numPtr = 1000
```

---

After:

```text
numPtr = 1004
```

---

### Effect

Pointer now points somewhere else.

---

### num Value?

```text
Still 20
```

---

### Case 3

#### **p = **p + 1

Function:

```cpp
void update(int **p)
{
    **p = **p + 1;
}
```

---

### Evaluation

```cpp
**p
```

is:

```cpp
num
```

---

Operation:

```cpp
num = num + 1;
```

---

### Memory

Before:

```text
num = 20
```

---

After:

```text
num = 21
```

---

### What Changes?

Only:

```text
Actual value
```

changes.

---

Pointers remain same.

---

### Comparison Table

| Operation     | Changes                      |
| ------------- | ---------------------------- |
| `p = p+1`     | Local copy of double pointer |
| `*p = *p+1`   | Original pointer             |
| `**p = **p+1` | Original integer value       |

---

### Triple Pointers

If pointers have addresses:

```text
Pointer
```

↓

can be pointed to by

```text
Double Pointer
```

---

Then:

```text
Double Pointer
```

also has an address.

---

Therefore:

```cpp
int ***triplePtr;
```

is possible.

---

### Example

```cpp
int value = 5;

int *ptr = &value;

int **doublePtr = &ptr;

int ***triplePtr = &doublePtr;
```

---

### Diagram

```text
triplePtr
     │
     ▼

doublePtr
     │
     ▼

ptr
     │
     ▼

value
  5
```

---

### General Rule

```cpp
*
```

Number of stars:

```text
Number of dereferences required
to reach actual value.
```

---

### Example

```cpp
int ***ptr;
```

Requires:

```cpp
***ptr
```

to reach integer.

---

### Pointer Declaration Style

You asked:

```cpp
int *ptr;
```

vs

```cpp
int* ptr;
```

Which is correct?

---

### Answer

Both are identical.

---

### Example

```cpp
int *ptr;
```

---

```cpp
int* ptr;
```

Compiler treats both same.

---

### Industry Recommendation

Prefer:

```cpp
int *ptr;
```

because:

```cpp
int *ptr1, *ptr2;
```

makes pointer nature clearer.

---

### Common Bugs

---

### Bug 1

```cpp
int **ptr;

cout << **ptr;
```

Uninitialized double pointer.

---

### Bug 2

```cpp
int *ptr = nullptr;

int **doublePtr = &ptr;

cout << **doublePtr;
```

Null pointer dereference.

---

### Bug 3

Confusing:

```cpp
*p
```

and

```cpp
**p
```

---

### Interview Questions

---

#### Q1

What is a double pointer?

##### Answer

A pointer that stores the address of another pointer.

---

#### Q2

Why do double pointers exist?

##### Answer

To work with pointers indirectly and modify pointers inside functions.

---

#### Q3

Difference between:

```cpp
p
```

```cpp
*p
```

```cpp
**p
```

##### Answer

| Expression | Meaning            |
| ---------- | ------------------ |
| `p`        | Address of pointer |
| `*p`       | Pointer            |
| `**p`      | Actual value       |

---

#### Q4

What does:

```cpp
*p = *p + 1;
```

change?

##### Answer

Original pointer.

---

#### Q5

What does:

```cpp
**p = **p + 1;
```

change?

##### Answer

Original value.

---

### Cheat Sheet

```cpp
int value = 5;

int *ptr = &value;

int **doublePtr = &ptr;

doublePtr;

*doublePtr;

**doublePtr;

p = p + 1;

*p = *p + 1;

**p = **p + 1;
```

---

### Key Takeaways

- Every pointer is itself a variable.
- Every pointer has its own address.
- Double pointers store addresses of pointers.
- `p`, `*p`, and `**p` represent different levels of indirection.
- Double pointers are essential for modifying pointers inside functions.
- `p = p+1`, `*p = *p+1`, and `**p = **p+1` affect completely different memory locations.
- Triple pointers are possible by extending the same concept.
- The number of `*` operators corresponds to the level of dereferencing required.

---
