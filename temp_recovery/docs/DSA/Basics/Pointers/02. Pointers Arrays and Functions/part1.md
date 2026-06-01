---
sidebar_label: 'Pointers Part 2A'
sidebar_position: 5
---
# Arrays and Pointers (Integer Arrays)

> This chapter is one of the most important chapters in C++.
>
> Most developers learn:
>
> ```cpp
> int arr[5] = {10,20,30,40,50};
> ```
>
> and
>
> ```cpp
> int *ptr = arr;
> ```
>
> but never truly understand:
>
> - Why array names behave like pointers
> - Why arrays are not pointers
> - Why `arr[i]` works
> - How compiler computes indexing
> - Why `arr = arr + 1` fails
> - Why `ptr = ptr + 1` works
> - Why `sizeof(arr)` and `sizeof(ptr)` are different
> - What actually gets stored in memory
>
> This chapter builds the foundation required for:
>
> - Arrays
> - Pointer Arithmetic
> - Dynamic Memory
> - STL Iterators
> - Function Parameters
> - Advanced C++

---

## Learning Roadmap

In this chapter we will cover:

1. How Arrays Are Stored In Memory
2. Relationship Between Arrays and Pointers
3. What Array Name Really Means
4. `arr`
5. `&arr`
6. `&arr[0]`
7. Array Name Decay
8. Internal Working of `arr[i]`
9. `*(arr+i)`
10. `i[arr]`
11. Arrays vs Pointers
12. Why `arr = arr + 1` Fails
13. Why `ptr = ptr + 1` Works
14. `sizeof(arr)` vs `sizeof(ptr)`
15. Memory Diagrams
16. Common Bugs
17. Interview Questions

---

## How Arrays Are Stored In Memory

Consider:

```cpp
int numbers[4] = {1,3,4,5};
```

---

## Memory Allocation

Each integer typically occupies:

```text
4 bytes
```

Array size:

```cpp
4 × 4 = 16 bytes
```

Memory:

```text
Address      Value

1000         1
1004         3
1008         4
1012         5
```

---

## Important Observation

Array elements are stored:

```text
Contiguously
```

Meaning:

```text
One after another
```

without gaps.

---

## Visual Representation

```text
numbers

┌───────┬───────┬───────┬───────┐
│   1   │   3   │   4   │   5   │
└───────┴───────┴───────┴───────┘

1000    1004    1008    1012
```

---

## What Is Array Name?

Consider:

```cpp
int numbers[4] = {1,3,4,5};
```

Question:

```text
What exactly is "numbers"?
```

Many beginners answer:

```text
Pointer
```

This answer is:

```text
Partially Correct
```

---

## Correct Answer

Array name is:

```text
NOT a pointer
```

However:

```text
In most expressions it behaves like a pointer
```

More specifically:

```text
Array name decays to pointer
to first element.
```

---

## What Does Array Name Represent?

```cpp
numbers
```

represents:

```cpp
&numbers[0]
```

in most situations.

---

## Example

```cpp
int numbers[4] = {1,3,4,5};

cout << numbers;
```

Possible Output:

```text
0x7fff1000
```

---

## Equivalent

```cpp
cout << &numbers[0];
```

Output:

```text
0x7fff1000
```

---

## Important Rule

Most of the time:

```cpp
numbers
```

behaves like:

```cpp
&numbers[0]
```

---

## Memory Diagram

```text
numbers

Address      Value

1000         1
1004         3
1008         4
1012         5
```

Array name:

```cpp
numbers
```

evaluates to:

```text
1000
```

---

## arr vs &arr[0]

Example:

```cpp
int arr[4]={1,2,3,4};

cout << arr << endl;

cout << &arr[0];
```

Expected Output:

```text
Same address value
```

Example:

```text
0x1000
0x1000
```

---

## Are They Actually Same?

No.

This is an extremely important interview concept.

---

## arr Type

```cpp
arr
```

after decay behaves like:

```cpp
int*
```

---

## &arr[0] Type

```cpp
&arr[0]
```

type:

```cpp
int*
```

---

## So Why Do They Look Same?

Because both represent:

```text
Address of first element
```

---

## arr vs &arr

Many developers incorrectly believe:

```cpp
arr
```

and

```cpp
&arr
```

are identical.

They are not.

---

## Example

```cpp
int arr[4]={1,2,3,4};

cout << arr << endl;

cout << &arr;
```

Possible Output:

```text
0x1000
0x1000
```

Looks identical.

---

## Hidden Difference

### arr

Type:

```cpp
int*
```

(after decay)

---

### &arr

Type:

```cpp
int (*)[4]
```

Read as:

```text
Pointer to entire array
```

---

## Why Does This Matter?

Because pointer arithmetic behaves differently.

---

## Example

Assume:

```text
arr = 1000
```

Array size:

```text
4 integers
```

---

### arr + 1

```text
1000 + 4

=

1004
```

Moves to:

```text
Next integer
```

---

### &arr + 1

```text
1000 + 16

=

1016
```

Moves past entire array.

---

## Visual

```text
arr

1000
 ↓
[1][2][3][4]



arr+1

1004
 ↓
[2]



&arr+1

1016
 ↓
After whole array
```

---

## Internal Working of Array Indexing

Most developers know:

```cpp
arr[3]
```

But very few know what compiler actually does.

---

## Example

```cpp
int arr[4]={1,3,4,5};

cout << arr[2];
```

Output:

```text
4
```

---

## Internal Compiler Conversion

Compiler converts:

```cpp
arr[i]
```

into:

```cpp
*(arr+i)
```

---

## Formula

```cpp
arr[i]

=

*(arr+i)
```

---

## Example

```cpp
arr[2]
```

becomes:

```cpp
*(arr+2)
```

---

## Memory

```text
Address      Value

1000         1
1004         3
1008         4
1012         5
```

---

## Evaluation

```cpp
arr+2
```

Address:

```text
1008
```

---

Then:

```cpp
*(1008)
```

Value:

```text
4
```

---

## Result

```text
4
```

---

## Example

```cpp
cout << arr[2];
cout << *(arr+2);
```

Expected Output:

```text
4
4
```

---

## Important Interview Question

Why does:

```cpp
*(arr+2)
```

work?

Because:

```cpp
arr
```

decays to:

```cpp
&arr[0]
```

and pointer arithmetic becomes possible.

---

## Strange But Valid Syntax

Most developers don't know this.

---

## Example

```cpp
int arr[4]={1,3,4,5};

cout << 2[arr];
```

Expected Output:

```text
4
```

---

## Why?

Compiler converts:

```cpp
arr[i]
```

to:

```cpp
*(arr+i)
```

Addition is commutative.

Therefore:

```cpp
*(arr+i)

=

*(i+arr)
```

Therefore:

```cpp
i[arr]
```

works.

---

## Example

```cpp
cout << arr[3];
cout << 3[arr];
```

Expected Output:

```text
5
5
```

---

## Arrays vs Pointers

This is one of the most misunderstood topics.

---

## Array

```cpp
int arr[10];
```

Memory:

```text
40 bytes allocated
```

because:

```cpp
10 × sizeof(int)
```

---

## Pointer

```cpp
int *ptr=&arr[0];
```

Memory:

```text
Only pointer variable created
```

Usually:

```text
8 bytes
```

on modern systems.

---

## Memory Diagram

Array:

```text
arr

40 bytes
```

---

Pointer:

```text
ptr

8 bytes

contains address
```

---

## Example

```cpp
int arr[10];

int *ptr=&arr[0];

cout << sizeof(arr) << endl;

cout << sizeof(ptr);
```

Expected Output (64-bit):

```text
40
8
```

---

## Why Different?

Array:

```text
Actual storage
```

Pointer:

```text
Stores address only
```

---

## Important Difference Table

| Feature           | Array           | Pointer      |
| ----------------- | --------------- | ------------ |
| Own Memory        | Yes             | No           |
| Size Fixed        | Yes             | No           |
| Can Change Target | No              | Yes          |
| sizeof()          | Full Array Size | Pointer Size |
| Stores Elements   | Yes             | No           |
| Stores Address    | No              | Yes          |

---

## Why arr = arr + 1 Fails

Very common interview question.

---

## Example

```cpp
int arr[10];

arr = arr + 1;
```

Compilation Error.

---

## Why?

Array name is:

```text
Not a modifiable variable
```

---

## Important Concept

Compiler symbol table stores:

```text
arr

↓

Starting address of array
```

This mapping is fixed.

---

## Visual

```text
Symbol Table

arr

↓

1000
```

---

Compiler does not allow:

```text
Change array identity
```

---

## Therefore

```cpp
arr = arr+1;
```

fails.

---

## Why ptr = ptr + 1 Works

Example:

```cpp
int arr[10];

int *ptr=&arr[0];
```

---

Memory

```text
ptr

Address: 5000

Value: 1000
```

---

Operation

```cpp
ptr = ptr+1;
```

---

Before

```text
ptr = 1000
```

After

```text
ptr = 1004
```

---

## Why Allowed?

Because:

```cpp
ptr
```

is a normal variable.

Normal variables can change values.

---

## Important Distinction

Array name:

```text
Not assignable
```

Pointer variable:

```text
Assignable
```

---

## sizeof Examples

Example:

```cpp
int arr[10];

cout << sizeof(arr);
```

Expected Output:

```text
40
```

---

## Why?

Array owns:

```text
10 integers
```

---

## Example

```cpp
cout << sizeof(arr[0]);
```

Expected Output:

```text
4
```

---

## Example

```cpp
int *ptr=&arr[0];

cout << sizeof(ptr);
```

Expected Output:

```text
8
```

---

## Example

```cpp
cout << sizeof(*ptr);
```

Expected Output:

```text
4
```

---

## Why?

Because:

```cpp
*ptr
```

is:

```cpp
int
```

---

## Common Bugs

---

## Bug 1

```cpp
arr = arr+1;
```

Compilation Error.

---

## Bug 2

Assuming:

```cpp
sizeof(arr)
```

and

```cpp
sizeof(ptr)
```

are same.

Wrong.

---

## Bug 3

Thinking:

```cpp
arr
```

is literally a pointer.

Wrong.

Array and pointer are different entities.

---

## Interview Questions

---

### Q1

What does array name represent?

#### Answer

In most expressions:

```cpp
arr
```

decays to:

```cpp
&arr[0]
```

---

### Q2

How does compiler evaluate:

```cpp
arr[i]
```

#### Answer

```cpp
*(arr+i)
```

---

### Q3

Why does:

```cpp
i[arr]
```

work?

#### Answer

Because:

```cpp
*(arr+i)

=

*(i+arr)
```

---

### Q4

Difference between:

```cpp
arr
```

and

```cpp
&arr
```

#### Answer

Different types.

```cpp
arr      -> int*
&arr     -> pointer to entire array
```

---

### Q5

Why does:

```cpp
arr = arr+1;
```

fail?

#### Answer

Array name is not modifiable.

---

### Q6

Why does:

```cpp
ptr = ptr+1;
```

work?

#### Answer

Pointer is a normal variable storing an address.

---

## Cheat Sheet

```cpp
arr

&arr

&arr[0]

arr[i]

*(arr+i)

i[arr]

sizeof(arr)

sizeof(arr[0])

int *ptr=&arr[0];

sizeof(ptr);

sizeof(*ptr);

ptr = ptr+1;
```

---

## Key Takeaways

- Arrays and pointers are closely related but not identical.
- Array name usually decays to pointer to first element.
- `arr[i]` is internally `*(arr+i)`.
- `i[arr]` is valid C++.
- Arrays own memory; pointers store addresses.
- `sizeof(arr)` gives total array size.
- `sizeof(ptr)` gives pointer size.
- `arr` and `&arr` are different types.
- `arr = arr+1` is illegal.
- `ptr = ptr+1` is legal because pointers are variables.

---
