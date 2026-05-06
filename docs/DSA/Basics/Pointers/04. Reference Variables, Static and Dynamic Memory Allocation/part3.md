---
sidebar_label: 'Dynamic Arrays & Memory'
sidebar_position: 15
---

# Dynamic Arrays & Memory Management

> Dynamic Memory Allocation gives programmers enormous flexibility.
>
> However, with great flexibility comes great responsibility.
>
> Unlike stack memory:
>
> ```text
> Heap memory is NOT cleaned automatically.
> ```
>
> Therefore, incorrect memory management can lead to:
>
> - Memory Leaks
> - Dangling Pointers
> - Wild Pointers
> - Double Deletion
> - Undefined Behavior
> - Program Crashes
> - Security Vulnerabilities
>
> Understanding these problems is essential before learning:
>
> - Smart Pointers
> - STL Allocators
> - RAII
> - Modern C++ Memory Management

---

### Learning Roadmap

In this chapter we will cover:

1. Why Memory Management Is Important
2. Heap Lifetime
3. Memory Leaks
4. Dangling Pointers
5. Wild Pointers
6. Null Pointers Revisited
7. Double Delete
8. Use-After-Free Errors
9. Heap Corruption
10. Memory Safety Best Practices
11. Real-World Examples
12. Interview Questions

---

### Why Memory Management Matters

Consider:

```cpp
int* ptr = new int;
```

---

Memory:

```text
Stack

ptr
 │
 ▼

Heap

[ int ]
```

---

The operating system provides memory.

---

Question:

```text
Who is responsible for releasing it?
```

Answer:

```text
Programmer
```

---

This is fundamentally different from:

```cpp
int num = 10;
```

---

Because:

```text
Stack memory cleans itself.
```

---

Heap memory does not.

---

### Heap Object Lifetime

Consider:

```cpp
int* ptr = new int;
```

---

Heap Memory:

```text
Allocated
```

---

It remains alive until:

```cpp
delete ptr;
```

---

or

```text
Program terminates.
```

---

### Visual

```text
new
 │
 ▼

Memory Exists

...

delete

↓

Memory Destroyed
```

---

### Memory Leak

#### Definition

A memory leak occurs when dynamically allocated memory becomes unreachable before being freed.

---

### Simple Example

```cpp
int* ptr = new int;
```

---

Memory:

```text
ptr
 │
 ▼

Heap Object
```

---

Now:

```cpp
ptr = nullptr;
```

---

Memory Diagram

Before:

```text
ptr
 │
 ▼

Heap Object
```

---

After:

```text
ptr = nullptr
```

---

Heap Object:

```text
Still Exists
```

---

Problem:

```text
Address lost forever.
```

---

Memory can no longer be deleted.

---

This is:

```text
Memory Leak
```

---

### Visual

```text
Heap Object

[ 100 ]
```

Still allocated.

---

But:

```text
No pointer references it.
```

---

### Why Is This Dangerous?

Leaked memory:

```text
Remains allocated
```

for the rest of program execution.

---

### Real World Consequences

Long-running applications:

- Browsers
- Servers
- Databases
- Games

may consume:

```text
Gigabytes of memory
```

if leaks exist.

---

### Classic Leak Example

```cpp
while(true)
{
    int* ptr = new int;
}
```

---

### What Happens?

Iteration 1

```text
Allocate Memory
```

---

Iteration 2

```text
Allocate More Memory
```

---

Iteration 1000000

```text
Allocate Even More Memory
```

---

Nothing is released.

---

Eventually:

```text
Program exhausts memory.
```

---

Possible outcomes:

```text
Slow performance
Crash
Out Of Memory Error
```

---

### Visual

```text
Heap

[ ]
[ ]
[ ]
[ ]
[ ]
[ ]
[ ]
[ ]
[ ]
...
```

Growing forever.

---

### Correct Version

```cpp
while(true)
{
    int* ptr = new int;

    delete ptr;
}
```

---

Now:

```text
Memory allocated

↓

Memory released

↓

Repeat
```

---

No leak.

---

### Another Memory Leak Example

```cpp
int* ptr = new int;

ptr = new int;
```

---

What happened?

---

Before

```text
ptr

↓

Object A
```

---

After

```text
ptr

↓

Object B
```

---

Object A:

```text
Still allocated.
```

---

But address lost.

---

Memory leak occurs.

---

### Dangling Pointer

#### Definition

A dangling pointer is a pointer that points to memory that has already been released.

---

### Example

```cpp
int* ptr = new int;

delete ptr;
```

---

After delete:

```text
Memory destroyed.
```

---

But:

```text
ptr still contains old address.
```

---

Memory Diagram

Before:

```text
ptr
 │
 ▼

Heap Object
```

---

After:

```cpp
delete ptr;
```

---

```text
ptr
 │
 ▼

Invalid Memory
```

---

Pointer:

```text
Still exists
```

---

Object:

```text
Gone
```

---

### Dangerous Code

```cpp
int* ptr = new int;

delete ptr;

cout << *ptr;
```

---

Possible outcomes:

```text
Garbage Value
Crash
Seemingly Correct Value
```

---

All are possible.

---

Reason:

```text
Undefined Behavior
```

---

### Why Does It Sometimes Work?

Because:

```text
Freed memory may not immediately be overwritten.
```

---

Example:

```cpp
int* ptr = new int(100);

delete ptr;

cout << *ptr;
```

May print:

```text
100
```

---

This does NOT mean code is correct.

---

Still undefined behavior.

---

### Preventing Dangling Pointers

Best Practice:

```cpp
delete ptr;

ptr = nullptr;
```

---

Now:

```text
Pointer clearly indicates
"No Valid Object"
```

---

### Visual

Before

```text
ptr

↓

Heap Object
```

---

After

```cpp
delete ptr;

ptr = nullptr;
```

---

```text
ptr

↓

nullptr
```

---

Much safer.

---

### Wild Pointer

#### Definition

A wild pointer is a pointer that was never initialized.

---

### Example

```cpp
int* ptr;
```

---

Memory

```text
Unknown Address
```

---

Value:

```text
Garbage
```

---

Possible Contents

```text
0xA12345
0xDEADBEEF
Random Bits
```

---

### Dangerous Usage

```cpp
cout << *ptr;
```

---

Possible results:

```text
Crash
Garbage
Undefined Behavior
```

---

### Visual

```text
ptr

↓

Unknown Memory
```

---

### Correct Version

```cpp
int* ptr = nullptr;
```

---

Now:

```text
Known State
```

---

### Null Pointer

#### Definition

A pointer intentionally pointing to no object.

---

### Example

```cpp
int* ptr = nullptr;
```

---

Visual

```text
ptr

↓

NULL
```

---

### Why Useful?

Indicates:

```text
No valid memory currently assigned.
```

---

### Difference Between Wild Pointer and Null Pointer

| Feature             | Wild Pointer | Null Pointer |
| ------------------- | ------------ | ------------ |
| Initialized         | No           | Yes          |
| Safe State          | No           | Yes          |
| Value Known         | No           | Yes          |
| Indicates No Object | No           | Yes          |

---

### Double Delete

#### Definition

Deleting the same memory twice.

---

### Example

```cpp
int* ptr = new int;

delete ptr;

delete ptr;
```

---

Problem:

First delete:

```text
Memory released.
```

---

Second delete:

```text
Memory already released.
```

---

Result:

```text
Undefined Behavior
```

---

Possible outcomes:

```text
Crash
Heap Corruption
Random Behavior
```

---

### Safe Version

```cpp
delete ptr;

ptr = nullptr;
```

---

Then:

```cpp
delete ptr;
```

Safe.

---

Because:

```cpp
delete nullptr;
```

does nothing.

---

### Use-After-Free Error

One of the most dangerous bugs.

---

### Example

```cpp
int* ptr = new int(50);

delete ptr;

*ptr = 100;
```

---

Problem:

```text
Object no longer exists.
```

---

Yet program attempts:

```text
Write to freed memory.
```

---

Result:

```text
Undefined Behavior
```

---

### Visual

```text
Memory Freed

↓

Attempt Access

↓

Disaster
```

---

### Heap Corruption

Occurs when memory management damages heap metadata.

---

Example:

```cpp
delete ptr;

delete ptr;
```

---

or

```cpp
Writing beyond allocated memory
```

---

Example

```cpp
int* arr = new int[5];

arr[100] = 10;
```

---

Possible Result:

```text
Heap Corruption
```

---

### Memory Safety Checklist

Always:

---

Initialize pointers.

```cpp
int* ptr = nullptr;
```

---

Delete allocated memory.

```cpp
delete ptr;
```

---

Use:

```cpp
delete[]
```

for arrays.

---

Set pointers to:

```cpp
nullptr
```

after delete.

---

Avoid:

```cpp
Dangling pointers
```

---

Avoid:

```cpp
Wild pointers
```

---

Avoid:

```cpp
Double delete
```

---

### Real-World Example

Bad:

```cpp
void process()
{
    int* data = new int[1000];

    return;
}
```

---

Problem:

```text
Memory leak.
```

---

Correct:

```cpp
void process()
{
    int* data = new int[1000];

    delete[] data;
}
```

---

Memory released.

---

### Common Bugs

---

### Bug 1

```cpp
int* ptr;
```

Wild pointer.

---

### Bug 2

```cpp
delete ptr;

cout << *ptr;
```

Dangling pointer.

---

### Bug 3

```cpp
delete ptr;

delete ptr;
```

Double delete.

---

### Bug 4

```cpp
new int;

return;
```

Memory leak.

---

### Bug 5

```cpp
delete arr;
```

instead of:

```cpp
delete[] arr;
```

for arrays.

---

### Interview Questions

---

#### Q1

What is a memory leak?

##### Answer

Allocated memory that becomes unreachable before being released.

---

#### Q2

What is a dangling pointer?

##### Answer

A pointer pointing to memory that has already been freed.

---

#### Q3

What is a wild pointer?

##### Answer

An uninitialized pointer containing garbage data.

---

#### Q4

Difference between null pointer and wild pointer?

##### Answer

Null pointer is intentionally initialized.

Wild pointer is uninitialized.

---

#### Q5

Why is double delete dangerous?

##### Answer

Memory is released twice causing undefined behavior.

---

#### Q6

Why assign `nullptr` after delete?

##### Answer

To prevent accidental access to freed memory.

---

#### Q7

What is use-after-free?

##### Answer

Accessing memory after it has been deleted.

---

### Cheat Sheet

```cpp
int* ptr = nullptr;

ptr = new int;

delete ptr;

ptr = nullptr;


int* arr = new int[100];

delete[] arr;


int* ptr;          // Wild Pointer

delete ptr;        // Dangerous

*ptr = 10;         // Dangerous

delete ptr;
delete ptr;        // Dangerous
```

---

### Quick Comparison Table

| Problem          | Description               |
| ---------------- | ------------------------- |
| Memory Leak      | Memory never released     |
| Dangling Pointer | Points to deleted memory  |
| Wild Pointer     | Uninitialized pointer     |
| Double Delete    | Same memory deleted twice |
| Use-After-Free   | Access after delete       |
| Heap Corruption  | Heap metadata damaged     |

---

### Key Takeaways

- Heap memory must be managed manually.
- Forgetting `delete` causes memory leaks.
- A dangling pointer points to destroyed memory.
- A wild pointer is an uninitialized pointer.
- A null pointer intentionally points to nothing.
- Double deletion causes undefined behavior.
- Use-after-free bugs are extremely dangerous.
- Always initialize pointers.
- Always release dynamically allocated memory.
- Set pointers to `nullptr` after deletion.
- Understanding these issues is essential before learning smart pointers and RAII.

---
