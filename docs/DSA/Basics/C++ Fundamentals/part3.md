---
sidebar_label: 'Memory Fundamentals'
sidebar_position: 3
---

# Memory Fundamentals

> Every program ultimately works with memory.
>
> Variables, arrays, strings, objects, pointers, functions — everything occupies memory.
>
> Understanding memory fundamentals is one of the most important concepts in C++ because it forms the foundation for:
>
> - Arrays
> - Strings
> - Pointers
> - Dynamic Memory Allocation
> - Data Structures
> - Object-Oriented Programming

---

### What is Memory?

Memory (RAM) is a collection of storage locations where data is stored while a program is running.

Think of memory as a large apartment building.

```text
Memory

┌───────┐
│ Room1 │
├───────┤
│ Room2 │
├───────┤
│ Room3 │
├───────┤
│ Room4 │
└───────┘
```

Each room has:

```text
Address
+
Value
```

---

### Memory Address

Every location in memory has a unique address.

Example:

```text
Address     Value

1000          10
1004          20
1008          30
1012          40
```

---

### Variables in Memory

Consider:

```cpp
int age = 25;
```

Internally:

```text
Variable Name : age

Address       : 1000

Value         : 25
```

Memory:

```text
Address     Value

1000          25
```

---

### How Variables Are Stored

When you write:

```cpp
int num = 10;
```

the compiler performs:

##### Step 1

Reserve memory.

---

##### Step 2

Assign an address.

---

##### Step 3

Store value.

---

Result:

```text
Variable : num

Address  : 1000

Value    : 10
```

---

### Memory and Data Types

Different data types occupy different amounts of memory.

| Data Type | Typical Size |
| --------- | ------------ |
| char      | 1 Byte       |
| bool      | 1 Byte       |
| int       | 4 Bytes      |
| float     | 4 Bytes      |
| double    | 8 Bytes      |

---

#### Example

```cpp
char grade = 'A';
```

Memory:

```text
Address : 1000

Size    : 1 Byte
```

---

```cpp
int age = 25;
```

Memory:

```text
Address : 1004

Size    : 4 Bytes
```

---

### What is a Byte?

Memory is measured in:

```text
Bits
Bytes
Kilobytes
Megabytes
Gigabytes
```

---

#### Bit

Smallest unit of memory.

Can store:

```text
0
or
1
```

---

#### Byte

```text
1 Byte = 8 Bits
```

Example:

```text
01000001
```

represents:

```text
65
```

or

```text
'A'
```

in ASCII.

---

### Memory Allocation

#### What is Memory Allocation?

The process of reserving memory for a variable.

---

Example:

```cpp
int age = 25;
```

Compiler allocates:

```text
4 Bytes
```

for the integer.

---

### Types of Memory Allocation

```text
Memory Allocation
│
├── Static Allocation
│
└── Dynamic Allocation
```

---

### Static Memory Allocation

Memory size is known before the program runs.

---

Example

```cpp
int age = 25;

double salary = 50000.5;
```

---

Example

```cpp
int arr[100];
```

Compiler knows:

```text
100 × 4 = 400 Bytes
```

before execution.

---

### Dynamic Memory Allocation

Memory size is decided during program execution.

---

Example

```cpp
int* ptr = new int;
```

---

Example

```cpp
int n;

cin >> n;

int* arr = new int[n];
```

Size becomes known at:

```text
Runtime
```

---

### Program Memory Layout

A simplified memory layout looks like:

```text
High Memory
┌─────────────┐
│    Stack    │
└─────────────┘
       ↑↓

┌─────────────┐
│    Heap     │
└─────────────┘

┌─────────────┐
│ Global Data │
└─────────────┘

┌─────────────┐
│ Program Code│
└─────────────┘
Low Memory
```

---

### Stack Memory

#### What is Stack Memory?

Stack memory stores:

- Local Variables
- Function Parameters
- References

---

Example

```cpp
int main()
{
    int age = 25;
}
```

---

Memory:

```text
Stack

age = 25
```

---

### Characteristics of Stack Memory

##### Automatic Allocation

Memory is allocated automatically.

---

##### Automatic Cleanup

Memory is freed automatically.

---

##### Fast

Very fast allocation and deallocation.

---

##### Limited Size

Usually much smaller than heap memory.

---

### Example

```cpp
void fun()
{
    int x = 10;
}
```

When function ends:

```text
x is automatically destroyed.
```

---

### Heap Memory

#### What is Heap Memory?

Heap memory is used for dynamic memory allocation.

---

Allocated using:

```cpp
new
```

Released using:

```cpp
delete
```

---

Example

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

### Characteristics of Heap Memory

##### Dynamic

Allocated during runtime.

---

##### Larger

Generally larger than stack memory.

---

##### Manual Cleanup

Programmer must free memory.

---

##### Slightly Slower

Compared to stack allocation.

---

### Stack vs Heap

| Feature    | Stack       | Heap          |
| ---------- | ----------- | ------------- |
| Allocation | Automatic   | Manual        |
| Cleanup    | Automatic   | Manual        |
| Speed      | Faster      | Slower        |
| Size       | Smaller     | Larger        |
| Lifetime   | Scope Based | Until Deleted |

|

---

### Memory Cleanup

One of the most important concepts in C++.

---

### Stack Memory Cleanup

Example:

```cpp
{
    int x = 10;
}
```

When block ends:

```text
Memory automatically released.
```

No action required.

---

### Heap Memory Cleanup

Example:

```cpp
int* ptr = new int;
```

Memory remains allocated.

---

To free memory:

```cpp
delete ptr;
```

---

### Dynamic Array Cleanup

Allocation:

```cpp
int* arr = new int[100];
```

Cleanup:

```cpp
delete[] arr;
```

---

### Memory Leak

Occurs when allocated memory is never released.

---

Example

```cpp
while(true)
{
    new int;
}
```

---

What Happens?

```text
Memory allocated
Memory allocated
Memory allocated
...
```

Never freed.

---

Result:

```text
Memory Leak
```

---

### Good Practice

Always match:

```cpp
new
```

with:

```cpp
delete
```

---

Example

```cpp
int* ptr = new int;

delete ptr;
```

---

### Example Program

```cpp
#include <iostream>
using namespace std;

int main()
{
    int age = 25;

    cout << "Age: " << age << endl;

    int* ptr = new int;

    *ptr = 100;

    cout << *ptr << endl;

    delete ptr;

    return 0;
}
```

##### Output

```text
Age: 25
100
```

---

### Common Beginner Mistakes

---

#### Forgetting delete

Wrong:

```cpp
int* ptr = new int;
```

Memory never released.

---

#### Using Memory After Delete

Wrong:

```cpp
delete ptr;

cout << *ptr;
```

Undefined Behavior.

---

#### Confusing Stack and Heap

```cpp
int age = 20;
```

Stored on:

```text
Stack
```

---

```cpp
int* ptr = new int;
```

Stored on:

```text
Heap
```

---

### Interview Questions

#### Q1. What is memory allocation?

##### Answer

The process of reserving memory for storing data.

---

#### Q2. What is the difference between stack and heap memory?

##### Answer

Stack is automatic and fast.

Heap is dynamic and manually managed.

---

#### Q3. Which keyword allocates memory on the heap?

##### Answer

```cpp
new
```

---

#### Q4. Which keyword frees heap memory?

##### Answer

```cpp
delete
```

---

#### Q5. What is a memory leak?

##### Answer

Allocated memory that is never released.

---

### Cheat Sheet

```cpp
int age = 25;       // Stack

int* ptr = new int; // Heap

delete ptr;
```

```cpp
int* arr = new int[100];

delete[] arr;
```

---

### Key Takeaways

- Memory stores data while a program runs.
- Every variable occupies memory.
- Each memory location has a unique address.
- Different data types require different amounts of memory.
- Stack memory is automatic and fast.
- Heap memory is dynamic and manually managed.
- `new` allocates memory on the heap.
- `delete` releases heap memory.
- Forgetting to release heap memory causes memory leaks.
- Understanding memory is essential before learning pointers and dynamic memory allocation.

---