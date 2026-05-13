---
sidebar_label: "Pointers Part 1C"
sidebar_position: 3
---

# C++ Pointers Fundamentals

### Pointer Arithmetic Fundamentals

> In Part 1A we learned:
>
> - Memory
> - Addresses
> - Pointers
> - Pointer Types
>
> In Part 1B we learned:
>
> - Dereferencing
> - Reading values through pointers
> - Writing values through pointers
> - Pointer copying
>
> Now we answer one of the most important questions:
>
> ```text
> What happens when we add or subtract numbers from pointers?
> ```
>
> Many beginners think:
>
> ```cpp
> ptr + 1
> ```
>
> means:
>
> ```text
> Address + 1 byte
> ```
>
> This is WRONG.
>
> Understanding pointer arithmetic is one of the most important steps toward mastering:
>
> - Arrays
> - Dynamic Memory
> - STL Iterators
> - Memory Traversal
> - Low-level Programming

---

### Learning Roadmap

In this chapter we will cover:

1. Why Pointer Arithmetic Exists
2. What Happens During `ptr + 1`
3. What Happens During `ptr - 1`
4. Pointer Increment (`ptr++`)
5. Pointer Decrement (`ptr--`)
6. Pointer Arithmetic With Different Data Types
7. `(*ptr)++` vs `ptr++`
8. Pointer Addition
9. Pointer Subtraction
10. Valid and Invalid Operations
11. Memory Diagrams
12. Common Bugs
13. Interview Questions

---

### Why Does Pointer Arithmetic Exist?

Consider:

```cpp
int marks[5] = {10,20,30,40,50};
```

Memory:

```text
Address      Value

1000         10
1004         20
1008         30
1012         40
1016         50
```

Question:

```text
How can we move from one element to the next?
```

Pointer arithmetic solves this problem.

---

### First Example

```cpp
int value = 100;

int *ptr = &value;
```

Memory:

```text
Address: 1000

Value: 100
```

Suppose:

```cpp
ptr = ptr + 1;
```

What should happen?

---

### Common Beginner Assumption

Many think:

```text
1000 + 1

↓

1001
```

Wrong.

---

### Actual Rule

When adding:

```cpp
ptr + n
```

compiler performs:

```text
Current Address

+

(n × sizeof(data_type))
```

---

### General Formula

```text
New Address

=

Current Address

+

(Number × Size Of Data Type)
```

---

### Integer Pointer Arithmetic

Example:

```cpp
int value = 100;

int *ptr = &value;
```

Assume:

```text
ptr = 1000
```

---

### Memory Layout

```text
Address

1000
1004
1008
1012
1016
```

because:

```cpp
sizeof(int) = 4
```

---

### ptr + 1

```cpp
ptr + 1
```

Calculation:

```text
1000 + (1 × 4)

=

1004
```

Result:

```text
1004
```

---

### ptr + 2

```cpp
ptr + 2
```

Calculation:

```text
1000 + (2 × 4)

=

1008
```

---

### Visual Representation

```text
1000
  │
  ▼

ptr


ptr+1

↓

1004


ptr+2

↓

1008
```

---

### Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    int number = 100;

    int *ptr = &number;

    cout << ptr << endl;

    cout << ptr + 1 << endl;

    cout << ptr + 2;
}
```

Expected Output:

```text
Different addresses
```

Example:

```text
1000
1004
1008
```

Actual addresses vary.

---

### Why Not Add One Byte?

Because compiler knows:

```cpp
ptr
```

is:

```cpp
int*
```

Meaning:

```text
Pointer to integer
```

Moving by one means:

```text
Move to next integer
```

not:

```text
Move to next byte
```

---

### Character Pointer Arithmetic

Consider:

```cpp
char grade = 'A';

char *ptr = &grade;
```

---

### Memory Layout

```text
Address

1000
1001
1002
1003
```

because:

```cpp
sizeof(char) = 1
```

---

### ptr + 1

Calculation:

```text
1000 + (1 × 1)

=

1001
```

---

### Example

```cpp
char grade = 'A';

char *ptr = &grade;

cout << ptr << endl;

cout << ptr + 1;
```

Addresses differ by:

```text
1 byte
```

---

### Double Pointer Arithmetic

Consider:

```cpp
double price = 2.34;

double *ptr = &price;
```

Assume:

```cpp
sizeof(double) = 8
```

---

### Memory Layout

```text
1000
1008
1016
1024
```

---

### ptr + 1

Calculation:

```text
1000 + (1 × 8)

=

1008
```

---

### Comparison Table

| Data Type | Size    | ptr+1 Moves |
| --------- | ------- | ----------- |
| char      | 1 byte  | 1 byte      |
| int       | 4 bytes | 4 bytes     |
| float     | 4 bytes | 4 bytes     |
| double    | 8 bytes | 8 bytes     |
| long long | 8 bytes | 8 bytes     |

---

### Pointer Increment

#### Syntax

```cpp
ptr++;
```

---

### Meaning

```cpp
ptr = ptr + 1;
```

---

### Example

```cpp
int value = 100;

int *ptr = &value;

ptr++;
```

Equivalent to:

```cpp
ptr = ptr + 1;
```

---

### Visual

Before:

```text
ptr

↓

1000
```

After:

```text
ptr

↓

1004
```

---

### Pointer Decrement

#### Syntax

```cpp
ptr--;
```

Equivalent:

```cpp
ptr = ptr - 1;
```

---

### Example

Assume:

```text
ptr = 1008
```

Operation:

```cpp
ptr--;
```

Result:

```text
1004
```

---

### Pointer Subtraction

#### Example

```cpp
ptr - 1
```

For integer pointer:

```text
1000 - 4

=

996
```

---

### Visual

```text
1000

↑

ptr


996

↑

ptr-1
```

---

### Very Important Difference

Many beginners confuse:

```cpp
(*ptr)++
```

and

```cpp
ptr++
```

These are completely different.

---

### Case 1

```cpp
(*ptr)++;
```

Changes:

```text
Value stored at memory
```

---

### Example

```cpp
int number = 100;

int *ptr = &number;

(*ptr)++;
```

Memory:

Before:

```text
100
```

After:

```text
101
```

---

### Program

```cpp
#include<iostream>
using namespace std;

int main()
{
    int number = 100;

    int *ptr = &number;

    (*ptr)++;

    cout << number;
}
```

Expected Output:

```text
101
```

---

### Case 2

```cpp
ptr++;
```

Changes:

```text
Pointer address
```

NOT:

```text
Stored value
```

---

### Example

```cpp
int number = 100;

int *ptr = &number;

ptr++;
```

Result:

```text
Pointer moves

Value remains unchanged
```

---

### Side-by-Side Comparison

| Expression | Changes |
| ---------- | ------- |
| (\*ptr)++  | Value   |
| ptr++      | Address |
| ++(\*ptr)  | Value   |
| ++ptr      | Address |

---

### Memory Visualization

Example:

```cpp
int value = 100;

int *ptr = &value;
```

Memory:

```text
Address      Value

1000         100
1004         ?
1008         ?
```

---

### Operation

```cpp
ptr++;
```

Result:

```text
ptr

↓

1004
```

---

### Operation

```cpp
(*ptr)++;
```

Result:

```text
Address      Value

1000         101
```

---

### Pointer Addition

Valid:

```cpp
ptr + 1

ptr + 2

ptr + 5
```

---

### Example

```cpp
int *ptr;

ptr + 5;
```

Meaning:

```text
Move 5 integers ahead
```

---

### Pointer Subtraction

Valid:

```cpp
ptr - 1

ptr - 3
```

---

### Example

```cpp
int *ptr;

ptr - 2;
```

Meaning:

```text
Move 2 integers backward
```

---

### Invalid Operation

Wrong:

```cpp
ptr * 2;
```

---

### Why?

Pointers support:

```text
Addition

Subtraction
```

but not:

```text
Multiplication

Division
```

---

### Invalid Example

```cpp
ptr / 2;
```

Compilation Error.

---

### Why Compiler Disallows It

Multiplication and division have:

```text
No meaningful memory interpretation
```

---

### Pointer Difference

Suppose:

```text
ptr1 = 1008

ptr2 = 1000
```

---

### Operation

```cpp
ptr1 - ptr2
```

Result:

```text
2
```

not:

```text
8
```

---

### Why?

Compiler calculates:

```text
(Address Difference)

/

sizeof(data_type)
```

---

### Example

```cpp
int arr[5];

int *start = &arr[0];

int *end = &arr[3];

cout << end - start;
```

Expected Output:

```text
3
```

---

### Why Useful?

Used heavily in:

- Arrays
- STL Iterators
- Algorithms

---

### Common Bugs

---

### Bug 1

```cpp
int value = 100;

int *ptr = &value;

ptr++;

cout << *ptr;
```

Problem:

```text
Pointer now points somewhere else
```

Undefined behavior.

---

### Bug 2

```cpp
int *ptr = nullptr;

ptr++;

cout << *ptr;
```

Invalid memory access.

---

### Bug 3

```cpp
(*ptr)++;

ptr++;
```

Thinking both do same thing.

They do not.

---

### Interview Questions

---

#### Q1

What does:

```cpp
ptr + 1
```

mean?

##### Answer

Move pointer to next object of its data type.

---

#### Q2

Why does:

```cpp
int*
```

move 4 bytes?

##### Answer

Because:

```cpp
sizeof(int)=4
```

---

#### Q3

Difference between:

```cpp
ptr++
```

and

```cpp
(*ptr)++
```

##### Answer

| Expression | Changes |
| ---------- | ------- |
| ptr++      | Address |
| (\*ptr)++  | Value   |

---

#### Q4

Can pointers be multiplied?

##### Answer

No.

Only addition and subtraction are meaningful.

---

#### Q5

Why does:

```cpp
end - start
```

return element count instead of byte count?

##### Answer

Compiler divides by:

```cpp
sizeof(data_type)
```

---

### Cheat Sheet

```cpp
int *ptr;

ptr + 1;

ptr - 1;

ptr++;

ptr--;

(*ptr)++;

++(*ptr);

ptr1 - ptr2;
```

---

### Key Takeaways

- Pointer arithmetic works in units of data types.
- `ptr+1` does NOT mean one byte.
- Integer pointers usually move 4 bytes.
- Double pointers usually move 8 bytes.
- Character pointers move 1 byte.
- `ptr++` changes address.
- `(*ptr)++` changes value.
- Pointer subtraction returns element distance.
- Multiplication and division are invalid.
- Pointer arithmetic is the foundation of arrays and iterators.

---

### End of Pointers Fundamentals — Part 1C
