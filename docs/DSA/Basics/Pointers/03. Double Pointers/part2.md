---
sidebar_label: 'Double Pointers & Functions'
sidebar_position: 10
---

# Double Pointers and Functions

> Up until now, every pointer we have seen had a specific type:
>
> ```cpp
> int* ptr;
> double* ptr;
> char* ptr;
> ```
>
> The compiler always knew:
>
> - What type of data exists at the memory address
> - How many bytes to read during dereferencing
> - How many bytes to move during pointer arithmetic
>
> But what if we want a pointer that can store the address of:
>
> - an integer
> - a double
> - a character
> - a structure
> - an object
>
> without caring about the actual type?
>
> That is where:
>
> ```cpp
> void*
> ```
>
> comes into the picture.

---

### Learning Roadmap

In this chapter we will cover:

1. Why Pointer Types Exist
2. What Is a Void Pointer?
3. Why Void Pointers Were Created
4. Storing Different Data Types
5. Internal Working
6. Why Dereferencing Fails
7. Type Casting
8. Void Pointer Memory Diagrams
9. Void Pointer Limitations
10. Pointer Arithmetic on Void Pointers
11. Real-World Applications
12. Common Bugs
13. Interview Questions

---

### Why Do Normal Pointers Need Types?

Consider:

```cpp
int number = 10;

int* ptr = &number;
```

---

Compiler knows:

```text
Address contains an integer
```

---

Therefore:

```cpp
*ptr
```

means:

```text
Read 4 bytes
```

(assuming int = 4 bytes)

---

Similarly:

```cpp
double price = 10.5;

double* ptr = &price;
```

Compiler knows:

```text
Read 8 bytes
```

---

Pointer arithmetic:

```cpp
ptr + 1
```

also works because compiler knows:

```text
Move 8 bytes
```

---

### Problem

Suppose we want a pointer that can point to:

```cpp
int
```

today,

```cpp
double
```

tomorrow,

and

```cpp
char
```

later.

---

Normal pointers cannot do this.

Example:

```cpp
int value = 10;

int* ptr = &value;

double price = 4.5;

ptr = &price;
```

Compilation Error.

---

### Why?

Because:

```cpp
int*
```

can only store:

```text
Address of int
```

---

### Solution

Use:

```cpp
void*
```

---

### What Is a Void Pointer?

#### Definition

A void pointer is a special pointer that can store the address of any data type.

---

### Syntax

```cpp
void* ptr;
```

---

### Read As

```text
Pointer to unknown type
```

or

```text
Generic pointer
```

---

### Important Clarification

Many beginners think:

```text
Void pointer stores no type.
```

This is not entirely accurate.

---

A better statement:

```text
Compiler does not know the type
stored at the address.
```

---

### Example

```cpp
int number = 10;

void* ptr = &number;
```

Valid.

---

Memory:

```text
Address      Value

1000         10
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
ptr
 │
 ▼

number
  10
```

---

### Compiler View

Compiler knows:

```text
Pointer stores an address
```

---

Compiler does NOT know:

```text
Address contains an integer
```

---

### Storing Different Data Types

One of the biggest advantages of void pointers.

---

### Integer Example

```cpp
int number = 10;

void* ptr = &number;
```

Valid.

---

### Double Example

```cpp
double price = 99.5;

void* ptr = &price;
```

Valid.

---

### Character Example

```cpp
char grade = 'A';

void* ptr = &grade;
```

Valid.

---

### Structure Example

```cpp
struct Student
{
    int id;
};

Student s;

void* ptr = &s;
```

Valid.

---

### Important Observation

Same pointer type:

```cpp
void*
```

can point to:

```text
int
double
char
struct
class
object
```

---

### Why Was Void Pointer Created?

Without void pointers:

Every generic function would need multiple versions.

---

Example:

```cpp
copyInt()
copyDouble()
copyChar()
copyStudent()
```

---

Instead:

```cpp
copy(void*)
```

can handle all of them.

---

### Internal Working

Consider:

```cpp
int number = 100;

void* ptr = &number;
```

---

Memory

```text
1000 → 100
```

---

Pointer

```text
2000 → 1000
```

---

Question:

```text
Can compiler know what exists at 1000?
```

Answer:

```text
No
```

---

Compiler only knows:

```text
Some data exists there.
```

---

### Why Dereferencing Fails

Most important concept of this chapter.

---

### Example

```cpp
int number = 100;

void* ptr = &number;

cout << *ptr;
```

Compilation Error.

---

### Why?

Compiler asks:

```text
How many bytes should I read?
```

---

Possible answers:

```text
1 byte ?
4 bytes ?
8 bytes ?
16 bytes ?
```

---

Compiler cannot determine.

Therefore:

```cpp
*ptr
```

is illegal.

---

### Error Explanation

Normal pointer:

```cpp
int* ptr;
```

Compiler knows:

```text
Read 4 bytes
```

---

Void pointer:

```cpp
void* ptr;
```

Compiler knows:

```text
Read how many bytes?
```

Unknown.

---

### Solution: Type Casting

Before dereferencing a void pointer, we must tell the compiler:

```text
What data type exists there.
```

---

### Integer Example

```cpp
int number = 100;

void* ptr = &number;

cout << *(int*)ptr;
```

Output:

```text
100
```

---

### Execution

Compiler sees:

```cpp
(int*)ptr
```

Now knows:

```text
Read integer
```

---

Equivalent

```cpp
int* temp = (int*)ptr;

cout << *temp;
```

---

### Double Example

```cpp
double price = 99.5;

void* ptr = &price;

cout << *(double*)ptr;
```

Output:

```text
99.5
```

---

### Character Example

```cpp
char grade = 'A';

void* ptr = &grade;

cout << *(char*)ptr;
```

Output:

```text
A
```

---

### Modern C++ Style Cast

Prefer:

```cpp
static_cast<int*>(ptr)
```

instead of:

```cpp
(int*)ptr
```

---

Example

```cpp
cout << *static_cast<int*>(ptr);
```

---

### Memory Diagram

Example:

```cpp
int value = 500;
```

Memory:

```text
Address      Value

1000         500
```

---

Pointer:

```cpp
void* ptr = &value;
```

Memory:

```text
Address      Value

2000         1000
```

---

Dereference Flow

```cpp
static_cast<int*>(ptr)
```

↓

```text
int*
```

↓

```cpp
*ptr
```

↓

```text
500
```

---

### Pointer Arithmetic on Void Pointer

Extremely common interview question.

---

### Example

```cpp
void* ptr;

ptr++;
```

---

### Is This Valid?

According to standard C++:

```text
No
```

---

### Why?

Compiler asks:

```text
Move by how many bytes?
```

---

For:

```cpp
int*
```

Compiler knows:

```text
4 bytes
```

---

For:

```cpp
double*
```

Compiler knows:

```text
8 bytes
```

---

For:

```cpp
char*
```

Compiler knows:

```text
1 byte
```

---

For:

```cpp
void*
```

Compiler knows:

```text
???
```

---

Therefore:

```cpp
ptr++
```

is illegal in standard C++.

---

### Comparison Table

| Pointer Type | Size Known? | Arithmetic Possible? |
| ------------ | ----------- | -------------------- |
| int\*        | Yes         | Yes                  |
| double\*     | Yes         | Yes                  |
| char\*       | Yes         | Yes                  |
| void\*       | No          | No                   |

---

### Real-World Applications

Void pointers are heavily used in:

---

### 1. malloc()

C-style memory allocation:

```cpp
int* arr = (int*)malloc(10 * sizeof(int));
```

---

Return type of:

```cpp
malloc()
```

is:

```cpp
void*
```

---

Why?

Because malloc can allocate memory for:

```text
int
double
char
struct
class
```

---

### 2. memcpy()

```cpp
memcpy(destination,
       source,
       bytes);
```

Uses:

```cpp
void*
```

internally.

---

Reason:

```text
Can copy any data type.
```

---

### 3. Generic Libraries

Low-level libraries frequently use:

```cpp
void*
```

for generic interfaces.

---

### 4. Operating Systems

Many OS APIs return:

```cpp
void*
```

because actual type depends on usage.

---

### Advantages of Void Pointers

##### Generic

Can point to any data type.

---

##### Flexible

Useful for reusable APIs.

---

##### Efficient

No need for multiple function versions.

---

### Disadvantages of Void Pointers

##### No Direct Dereferencing

Requires casting.

---

##### No Type Safety

Compiler cannot verify correctness.

---

##### Easy To Make Mistakes

Wrong casts can cause bugs.

---

### Dangerous Example

```cpp
double price = 99.5;

void* ptr = &price;

cout << *(int*)ptr;
```

---

Possible Output:

```text
Garbage Value
```

or

```text
Undefined Behavior
```

---

### Why?

Compiler interprets:

```text
Double memory
```

as:

```text
Integer memory
```

---

### Common Bugs

---

### Bug 1

```cpp
void* ptr;

cout << *ptr;
```

Compilation Error.

---

### Bug 2

```cpp
void* ptr = &value;

ptr++;
```

Not valid in standard C++.

---

### Bug 3

Wrong cast.

```cpp
double price = 10.5;

void* ptr = &price;

cout << *(int*)ptr;
```

---

### Bug 4

Assuming void pointer stores type information.

It does not.

---

### Comparison: Normal Pointer vs Void Pointer

| Feature            | int\* | void\* |
| ------------------ | ----- | ------ |
| Stores Address     | Yes   | Yes    |
| Knows Data Type    | Yes   | No     |
| Direct Dereference | Yes   | No     |
| Pointer Arithmetic | Yes   | No     |
| Type Safe          | Yes   | No     |
| Needs Casting      | No    | Yes    |

---

### Interview Questions

---

#### Q1

What is a void pointer?

##### Answer

A generic pointer capable of storing the address of any data type.

---

#### Q2

Can a void pointer point to an integer?

##### Answer

Yes.

```cpp
int value = 10;

void* ptr = &value;
```

---

#### Q3

Can you dereference a void pointer directly?

##### Answer

No.

Compiler does not know the data type.

---

#### Q4

Why is casting required?

##### Answer

Compiler must know:

```text
How many bytes to read.
```

---

#### Q5

Can pointer arithmetic be performed on void pointers?

##### Answer

Not in standard C++.

---

#### Q6

Why does malloc return void\*?

##### Answer

Because allocated memory can be used for any type.

---

### Cheat Sheet

```cpp
void* ptr;

int value = 10;

ptr = &value;

cout << *static_cast<int*>(ptr);

double price = 10.5;

ptr = &price;

cout << *static_cast<double*>(ptr);

// Invalid
// *ptr

// Invalid in standard C++
// ptr++
```

---

### Key Takeaways

- A void pointer is a generic pointer.
- It can store the address of any data type.
- Compiler does not know what type exists at the address.
- Void pointers cannot be dereferenced directly.
- Casting is required before dereferencing.
- Pointer arithmetic is not allowed in standard C++.
- `malloc()` and `memcpy()` rely heavily on void pointers.
- Void pointers trade type safety for flexibility.
- Wrong casts can lead to undefined behavior.
- Understanding void pointers is essential for low-level C/C++ programming.

---
