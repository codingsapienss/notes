---
sidebar_label: 'Pointers Part 2D'
sidebar_position: 8
---
# Advanced Array-Pointer Relationships

> At this point, you understand:
>
> - Arrays
> - Pointers
> - Array Decay
> - Pointer Arithmetic
> - Character Arrays
> - Arrays in Functions
>
> However, there are still several advanced concepts that frequently appear in:
>
> - Interviews
> - Competitive Programming
> - Legacy C/C++ Codebases
> - System Programming
>
> This chapter focuses on the subtle but extremely important relationship between arrays and pointers.

---

## Learning Roadmap

In this chapter we will cover:

1. Arrays vs Pointers (Deep Comparison)
2. Array Name vs Pointer Variable
3. `arr` vs `&arr`
4. Pointer To Entire Array
5. Array Of Pointers
6. Traversing Arrays Using Pointers
7. Multi-Level Memory Diagrams
8. Common Traps
9. Interview Questions

---

## Arrays Are Not Pointers

One of the biggest misconceptions in C++.

---

## Incorrect Statement

```text
Array is a pointer.
```

Wrong.

---

## Correct Statement

```text
Array is NOT a pointer.

Array name often behaves like a pointer.
```

---

## Example

```cpp
int arr[5] = {10,20,30,40,50};

int *ptr = arr;
```

Many developers conclude:

```text
arr and ptr are same.
```

Wrong.

---

## Why They Look Similar

Both allow:

```cpp
arr[2]
```

and

```cpp
ptr[2]
```

---

Both allow:

```cpp
*(arr+2)
```

and

```cpp
*(ptr+2)
```

---

Both produce:

```text
30
```

---

## Why They Are Different

Arrays and pointers have different identities.

---

## Memory Diagram

```cpp
int arr[5]={10,20,30,40,50};

int *ptr=arr;
```

Memory:

```text
Array Memory

1000 -> 10
1004 -> 20
1008 -> 30
1012 -> 40
1016 -> 50
```

---

Pointer Memory:

```text
ptr

Address: 5000

Value: 1000
```

---

## Visual

```text
ptr
 │
 ▼

arr

┌────┬────┬────┬────┬────┐
│10  │20  │30  │40  │50  │
└────┴────┴────┴────┴────┘
```

---

## Key Observation

Array:

```text
Owns storage
```

Pointer:

```text
Stores address
```

---

## sizeof Comparison

Example:

```cpp
int arr[5];

int *ptr = arr;

cout << sizeof(arr) << endl;

cout << sizeof(ptr);
```

Expected Output (64-bit system):

```text
20
8
```

---

## Why?

Array:

```text
5 integers
```

Memory:

```text
5 × 4 = 20 bytes
```

---

Pointer:

```text
Stores only address
```

Memory:

```text
8 bytes
```

---

## Assignment Comparison

Pointer:

```cpp
ptr = ptr + 1;
```

Valid.

---

Array:

```cpp
arr = arr + 1;
```

Invalid.

---

## Why?

Pointer:

```text
Normal variable
```

can change.

---

Array Name:

```text
Fixed identity
```

cannot change.

---

## Comparison Table

| Feature            | Array           | Pointer      |
| ------------------ | --------------- | ------------ |
| Owns Memory        | Yes             | No           |
| Stores Address     | No              | Yes          |
| `sizeof()`         | Full Array Size | Pointer Size |
| Assignable         | No              | Yes          |
| Decays To Pointer  | Yes             | N/A          |
| Can Be Incremented | No              | Yes          |

---

## arr vs &arr

This is a very common interview question.

---

## Example

```cpp
int arr[5]={10,20,30,40,50};

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

## Important Reality

Values appear same.

Types are different.

---

## Type Of arr

In most expressions:

```cpp
arr
```

decays to:

```cpp
int*
```

---

## Type Of &arr

```cpp
&arr
```

type:

```cpp
int (*)[5]
```

Read as:

```text
Pointer to entire array
```

---

## Visual Representation

```text
arr

↓

First Element



&arr

↓

Entire Array
```

---

## Memory Layout

```text
1000 -> 10
1004 -> 20
1008 -> 30
1012 -> 40
1016 -> 50
```

---

## arr + 1

Calculation:

```text
1000 + sizeof(int)

=

1004
```

---

## &arr + 1

Calculation:

```text
1000 + sizeof(entire array)

=

1000 + 20

=

1020
```

---

## Example

```cpp
int arr[5]={10,20,30,40,50};

cout << arr << endl;

cout << arr+1 << endl;

cout << &arr << endl;

cout << &arr+1 << endl;
```

Possible Output:

```text
1000
1004
1000
1020
```

---

## Visual

```text
arr

1000
 ↓

[10][20][30][40][50]



arr+1

1004
 ↓

[20]



&arr+1

1020
 ↓

Past entire array
```

---

## Pointer To Entire Array

One of the least understood concepts.

---

## Declaration

```cpp
int arr[5];

int (*ptr)[5] = &arr;
```

---

## Understanding The Syntax

Start from variable name:

```cpp
ptr
```

---

Move right:

```cpp
Nothing
```

---

Move left:

```cpp
*
```

means:

```text
Pointer
```

---

Move right:

```cpp
[5]
```

means:

```text
Array of 5 integers
```

---

Final Meaning:

```text
Pointer to an array of 5 integers
```

---

## Memory Diagram

```text
ptr

↓

arr

┌────┬────┬────┬────┬────┐
│10  │20  │30  │40  │50  │
└────┴────┴────┴────┴────┘
```

---

## Accessing Elements

```cpp
int arr[5]={10,20,30,40,50};

int (*ptr)[5] = &arr;

cout << (*ptr)[0];
```

Expected Output:

```text
10
```

---

## Why?

```cpp
*ptr
```

gives:

```cpp
arr
```

---

Then:

```cpp
(*ptr)[0]
```

means:

```cpp
arr[0]
```

---

## Pointer To Entire Array vs Pointer To First Element

---

### Pointer To First Element

```cpp
int *ptr = arr;
```

Type:

```cpp
int*
```

Points To:

```text
First Integer
```

---

### Pointer To Entire Array

```cpp
int (*ptr)[5] = &arr;
```

Type:

```cpp
int (*)[5]
```

Points To:

```text
Whole Array
```

---

## Comparison Table

| Feature      | `int *ptr`    | `int (*ptr)[5]` |
| ------------ | ------------- | --------------- |
| Points To    | First Element | Entire Array    |
| Type         | `int*`        | `int (*)[5]`    |
| Arithmetic   | 4 Bytes       | 20 Bytes        |
| Common Usage | Very Common   | Rare            |

---

## Array Of Pointers

Another very important concept.

---

## Declaration

```cpp
int *arr[3];
```

---

## Read It Carefully

Many beginners confuse:

```cpp
int *arr[3];
```

with:

```cpp
int (*arr)[3];
```

They are completely different.

---

## Rule

Array notation:

```cpp
[]
```

has higher precedence than:

```cpp
*
```

---

## Meaning

```cpp
int *arr[3];
```

means:

```text
Array of 3 pointers to integers
```

---

## Example

```cpp
int a=10;
int b=20;
int c=30;

int *arr[3]=
{
    &a,
    &b,
    &c
};
```

---

## Memory

```text
arr[0] -> &a

arr[1] -> &b

arr[2] -> &c
```

---

## Visual

```text
arr

┌─────────┐
│  &a     │
├─────────┤
│  &b     │
├─────────┤
│  &c     │
└─────────┘
```

---

## Access Values

```cpp
cout << *arr[0];
```

Output:

```text
10
```

---

```cpp
cout << *arr[1];
```

Output:

```text
20
```

---

```cpp
cout << *arr[2];
```

Output:

```text
30
```

---

## Array Of Pointers vs Pointer To Array

This is an extremely popular interview question.

---

## Array Of Pointers

```cpp
int *arr[3];
```

Meaning:

```text
Array containing pointers
```

---

Visual:

```text
┌────┐
│&a  │
├────┤
│&b  │
├────┤
│&c  │
└────┘
```

---

## Pointer To Array

```cpp
int (*ptr)[3];
```

Meaning:

```text
Single pointer
pointing to entire array
```

---

Visual:

```text
ptr

↓

[10][20][30]
```

---

## Comparison Table

| Feature | Array of Pointers | Pointer to Array |
| ------- | ----------------- | ---------------- |
| Syntax  | `int *arr[3]`     | `int (*ptr)[3]`  |
| Meaning | Multiple Pointers | One Pointer      |
| Stores  | Addresses         | Address of Array |
| Common  | Yes               | Rare             |

---

## Traversing Arrays Using Pointers

Most developers traverse arrays using indices.

---

## Traditional Method

```cpp
int arr[5]={10,20,30,40,50};

for(int i=0;i<5;i++)
{
    cout << arr[i] << " ";
}
```

Output:

```text
10 20 30 40 50
```

---

## Pointer Method

```cpp
int arr[5]={10,20,30,40,50};

int *ptr = arr;

for(int i=0;i<5;i++)
{
    cout << *(ptr+i) << " ";
}
```

Output:

```text
10 20 30 40 50
```

---

## Why Does This Work?

Compiler converts:

```cpp
arr[i]
```

to:

```cpp
*(arr+i)
```

---

## Pure Pointer Traversal

```cpp
int arr[5]={10,20,30,40,50};

int *ptr=arr;

while(ptr != arr+5)
{
    cout << *ptr << " ";

    ptr++;
}
```

Output:

```text
10 20 30 40 50
```

---

## Memory Trace

Initial:

```text
ptr -> 10
```

After:

```cpp
ptr++
```

```text
ptr -> 20
```

---

Then:

```text
ptr -> 30
```

---

Then:

```text
ptr -> 40
```

---

Then:

```text
ptr -> 50
```

---

## Common Bugs

---

## Bug 1

Confusing:

```cpp
arr
```

and

```cpp
&arr
```

They may print same value but have different types.

---

## Bug 2

Confusing:

```cpp
int *arr[3];
```

and

```cpp
int (*arr)[3];
```

Completely different declarations.

---

## Bug 3

Assuming arrays are pointers.

Wrong.

Arrays are separate language constructs.

---

## Bug 4

Forgetting parentheses.

Wrong:

```cpp
int *ptr[5];
```

Array of pointers.

---

Correct:

```cpp
int (*ptr)[5];
```

Pointer to array.

---

## Interview Questions

---

### Q1

Is an array a pointer?

#### Answer

No.

Array name often decays to pointer, but an array is not a pointer.

---

### Q2

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
arr     -> int*
&arr    -> int (*)[N]
```

---

### Q3

Difference between:

```cpp
int *arr[5];
```

and

```cpp
int (*arr)[5];
```

#### Answer

Array of pointers vs pointer to array.

---

### Q4

Why does:

```cpp
&arr+1
```

move farther than:

```cpp
arr+1
```

#### Answer

Because it points to entire array.

---

### Q5

Can arrays be incremented?

#### Answer

No.

```cpp
arr++
```

is illegal.

---

## Cheat Sheet

```cpp
int arr[5];

arr;

&arr;

arr+1;

&arr+1;

int *ptr = arr;

int (*ptrToArray)[5] = &arr;

int *pointerArray[3];

*(arr+i);

i[arr];

while(ptr != arr+5)
{
    cout << *ptr;
    ptr++;
}
```

---

## Key Takeaways

- Arrays and pointers are closely related but not identical.
- `arr` and `&arr` often print the same address but have different types.
- `arr+1` moves by one element.
- `&arr+1` moves by the size of the entire array.
- `int *arr[3]` means array of pointers.
- `int (*ptr)[3]` means pointer to array.
- Arrays cannot be reassigned or incremented.
- Pointer traversal and index traversal are fundamentally equivalent.
- Understanding array-pointer relationships is critical before learning double pointers and dynamic memory.

---
