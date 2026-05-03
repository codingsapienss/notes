---
sidebar_label: 'Character Arrays & Pointers'
sidebar_position: 6
---
# Character Arrays, Character Pointers, String Literals, and `cout` Behavior

> Character arrays and character pointers are one of the most misunderstood areas in C++.
>
> Most developers understand:
>
> ```cpp
> int *ptr;
> ```
>
> but get confused when:
>
> ```cpp
> char *ptr;
> ```
>
> behaves completely differently.
>
> Questions that confuse most developers:
>
> - Why does `cout << intPtr` print an address?
> - Why does `cout << charPtr` print characters?
> - Why does `cout << charArray` print an entire string?
> - Why is `char *ptr = "Hello"` dangerous?
> - What happens if `'\0'` does not exist?
> - How does `cout` know where the string ends?
>
> This chapter answers all of these questions.

---

### Learning Roadmap

In this chapter we will cover:

1. Character Arrays Recap
2. Character Pointers
3. Why `cout` Behaves Differently
4. Integer Array vs Character Array Output
5. Character Pointer Internals
6. Null Terminator (`'\0'`)
7. How `cout` Prints Strings
8. What Happens Without `'\0'`
9. Character Array vs Character Pointer
10. String Literals
11. Read-Only Memory
12. Dangerous Cases
13. Common Bugs
14. Interview Questions

---

### Character Arrays Recap

Consider:

```cpp
char name[] = "Prashant";
```

Internally:

```text
P r a s h a n t \0
```

Memory:

```text
Address      Value

1000         P
1001         r
1002         a
1003         s
1004         h
1005         a
1006         n
1007         t
1008         \0
```

---

### Important Observation

Character arrays are stored:

```text
One character per byte
```

because:

```cpp
sizeof(char) == 1
```

---

### Character Array Name

Just like integer arrays:

```cpp
char name[] = "Prashant";
```

Array name:

```cpp
name
```

decays to:

```cpp
&name[0]
```

---

### Example

```cpp
char name[] = "Prashant";

cout << name << endl;

cout << &name[0];
```

Expected Output:

```text
Prashant
Prashant
```

---

### Wait... Why Not Addresses?

For integer arrays:

```cpp
int arr[5] = {1,2,3,4,5};

cout << arr;
```

Output:

```text
0x7fff1234
```

Address.

---

But:

```cpp
char name[] = "Prashant";

cout << name;
```

Output:

```text
Prashant
```

Not an address.

Why?

---

### The Most Important Concept

`cout` has special handling for:

```cpp
char*
```

and

```cpp
const char*
```

---

### Integer Pointer Example

```cpp
int value = 100;

int *ptr = &value;

cout << ptr;
```

Expected Output:

```text
0x7fff1234
```

Address.

---

### Character Pointer Example

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

### Why Does This Happen?

Because internally:

```cpp
cout
```

contains special overloads.

Conceptually:

```cpp
cout << int*
```

means:

```text
Print Address
```

---

But:

```cpp
cout << char*
```

means:

```text
Treat pointer as string
```

---

### Visual Representation

Integer Pointer:

```text
intPtr

↓

100
```

Output:

```text
0x7fff1000
```

---

Character Pointer:

```text
charPtr

↓

P r a s h a n t \0
```

Output:

```text
Prashant
```

---

### How Does cout Know Where To Stop?

Excellent question.

Consider:

```cpp
char name[] = "Hello";
```

Memory:

```text
H e l l o \0
```

---

### Printing Process

```cpp
cout << name;
```

Execution:

```text
Print H
Print e
Print l
Print l
Print o

'\0' found

STOP
```

---

### The Null Terminator

#### Definition

Null character:

```cpp
'\0'
```

ASCII:

```text
0
```

Purpose:

```text
Marks end of C-style string
```

---

### Why Is It Needed?

Without:

```cpp
'\0'
```

`cout` has no idea where the string ends.

---

### Dangerous Example

```cpp
char name[5] =
{
'H',
'e',
'l',
'l',
'o'
};
```

Memory:

```text
H e l l o
```

Notice:

```text
No '\0'
```

---

### Program

```cpp
cout << name;
```

Possible Output:

```text
Hello▒▒▒@#...
```

or

```text
Crash
```

or

```text
Undefined Behavior
```

---

### Why?

Printing process:

```text
Print H
Print e
Print l
Print l
Print o

Continue reading memory...

Continue...

Continue...
```

until:

```cpp
'\0'
```

is accidentally found.

---

### Visual Diagram

```text
Memory

1000  H
1001  e
1002  l
1003  l
1004  o
1005  ?
1006  ?
1007  ?
1008  ?

No '\0'
```

`cout` keeps reading.

---

### Correct Version

```cpp
char name[6] =
{
'H',
'e',
'l',
'l',
'o',
'\0'
};
```

---

### Memory

```text
1000 H
1001 e
1002 l
1003 l
1004 o
1005 \0
```

---

### Output

```text
Hello
```

---

### Character Pointer

Consider:

```cpp
char name[] = "Prashant";

char *ptr = &name[0];
```

---

### Memory

```text
ptr

↓

P r a s h a n t \0
```

---

### Printing Pointer

```cpp
cout << ptr;
```

Output:

```text
Prashant
```

---

### Why Entire String?

Because:

```cpp
ptr
```

points to first character.

`cout` starts reading from there.

---

### Execution

```text
P
r
a
s
h
a
n
t

'\0'

STOP
```

---

### Important Example

```cpp
char name[] = "Prashant";

char *ptr = name + 3;

cout << ptr;
```

---

### Memory

```text
P r a s h a n t \0
      ↑
      ptr
```

---

### Output

```text
shant
```

---

### Why?

Printing begins from:

```text
s
```

until:

```cpp
'\0'
```

is found.

---

### Very Common Interview Trap

Consider:

```cpp
char ch = 'A';

char *ptr = &ch;

cout << ptr;
```

---

### Expected By Beginners

```text
Address
```

---

### Actual Result

Undefined Behavior.

Possible:

```text
A▒▒▒▒...
```

---

### Why?

Memory:

```text
Address      Value

1000         A
1001         ?
1002         ?
1003         ?
```

---

### Problem

`cout` assumes:

```cpp
ptr
```

points to a string.

---

### Execution

```text
Print A

Continue...

Continue...

Continue...
```

until:

```cpp
'\0'
```

appears somewhere.

---

### Correct Way To Print Address

Use:

```cpp
cout << static_cast<void*>(ptr);
```

---

### Example

```cpp
char ch = 'A';

char *ptr = &ch;

cout << static_cast<void*>(ptr);
```

Expected Output:

```text
0x7fff1234
```

---

### Integer Array vs Character Array

---

### Integer Array

```cpp
int arr[5] =
{
1,2,3,4,5
};

cout << arr;
```

Output:

```text
Address
```

---

### Character Array

```cpp
char arr[] = "Hello";

cout << arr;
```

Output:

```text
Hello
```

---

### Why Different?

Because:

```cpp
cout
```

has special handling for:

```cpp
char*
```

only.

---

### Comparison Table

| Type         | Output  |
| ------------ | ------- |
| int\*        | Address |
| double\*     | Address |
| float\*      | Address |
| char\*       | String  |
| const char\* | String  |

---

### Character Array vs Character Pointer

Many developers think these are identical.

They are related but different.

---

### Character Array

```cpp
char name[] = "Hello";
```

Memory:

```text
H e l l o \0
```

Stored directly.

---

### Character Pointer

```cpp
char *ptr = name;
```

Memory:

```text
ptr

↓

H e l l o \0
```

---

### Difference

Array:

```text
Owns storage
```

Pointer:

```text
Stores address
```

---

### Example

```cpp
char name[] = "Hello";

char *ptr = name;
```

---

### Size Comparison

```cpp
cout << sizeof(name);
```

Output:

```text
6
```

---

```cpp
cout << sizeof(ptr);
```

Output:

```text
8
```

(64-bit system)

---

### String Literals

Consider:

```cpp
"Hello"
```

---

### Internal Representation

```text
H e l l o \0
```

Compiler automatically adds:

```cpp
'\0'
```

---

### String Literal Memory

String literals are stored in:

```text
Read-Only Memory
```

---

### Dangerous Example

```cpp
char *ptr = "Hello";
```

This compiles on some compilers (or gives warnings).

---

### Internal Memory

```text
ptr

↓

Read-only Memory

H e l l o \0
```

---

### Why Dangerous?

Consider:

```cpp
ptr[0] = 'M';
```

---

### Result

```text
Undefined Behavior
```

Possible:

```text
Segmentation Fault
```

---

### Correct Approach

```cpp
char name[] = "Hello";

name[0] = 'M';
```

Output:

```text
Mello
```

---

### Why Safe?

Because:

```cpp
char name[]
```

creates writable memory.

---

### Behind The Scenes

```cpp
char name[] = "Hello";
```

Compiler does:

Temporary literal:

```text
H e l l o \0
```

Then copies into:

```text
Array memory
```

---

### Visual

```text
Literal

↓

"Hello"

↓

Copy

↓

name[]
```

---

### Modern C++ Recommendation

Instead of:

```cpp
char *ptr = "Hello";
```

use:

```cpp
const char *ptr = "Hello";
```

because:

```text
String literal is read-only.
```

---

### Common Bugs

---

### Bug 1

```cpp
char ch='A';

char *ptr=&ch;

cout<<ptr;
```

Reason:

```text
Not a string
```

---

### Bug 2

```cpp
char name[5]={'H','e','l','l','o'};

cout<<name;
```

Reason:

```text
Missing '\0'
```

---

### Bug 3

```cpp
char *ptr="Hello";

ptr[0]='M';
```

Reason:

```text
Read-only memory
```

---

### Bug 4

Thinking:

```cpp
char*
```

always prints address.

Wrong.

---

### Interview Questions

---

#### Q1

Why does:

```cpp
cout << charPtr;
```

print characters?

##### Answer

Because `cout` treats `char*` as a C-style string.

---

#### Q2

Why does:

```cpp
cout << intPtr;
```

print an address?

##### Answer

No special string handling exists.

---

#### Q3

What is the role of `'\0'`?

##### Answer

Marks end of C-style string.

---

#### Q4

What happens if `'\0'` is missing?

##### Answer

Undefined behavior.

---

#### Q5

Why is:

```cpp
char *ptr = "Hello";
```

dangerous?

##### Answer

String literal resides in read-only memory.

---

#### Q6

How do you safely represent a string literal?

##### Answer

```cpp
const char *ptr = "Hello";
```

---

### Cheat Sheet

```cpp
char name[] = "Hello";

char *ptr = name;

cout << ptr;

cout << static_cast<void*>(ptr);

char *ptr = &name[0];

char *ptr = name + 2;

const char *ptr = "Hello";

sizeof(name);

sizeof(ptr);
```

---

### Key Takeaways

- Character pointers behave differently from other pointers.
- `cout` treats `char*` as a C-style string.
- `'\0'` marks the end of a string.
- Missing `'\0'` causes undefined behavior.
- Character arrays own storage.
- Character pointers store addresses.
- String literals are stored in read-only memory.
- Never modify string literals through pointers.
- Prefer `const char*` when pointing to string literals.
- Understanding `char*` behavior is critical for interviews and legacy C/C++ code.

---
