---
sidebar_label: 'Pointers Part 4B'
sidebar_position: 14
---
# Static vs Dynamic Memory

### Dynamic Memory Allocation, Stack vs Heap, Runtime Memory, `new`, `delete`, and Dynamic Arrays

> In previous chapters, we worked with variables whose size was known before the program started running:
>
> ```cpp
> int num = 10;
>
> int arr[100];
> ```
>
> This is sufficient for many situations.
>
> However, real-world software often faces problems where:
>
> - Data size is unknown beforehand
> - Memory requirements change during execution
> - Objects must survive beyond a local scope
>
> Examples:
>
> - User enters number of students
> - Dynamic lists
> - Browsers
> - Databases
> - Games
> - Operating Systems
>
> These situations require:
>
> ```cpp
> Dynamic Memory Allocation
> ```
>
> Understanding dynamic memory is one of the most important topics in C++ because nearly every advanced data structure relies on it.

---

### Learning Roadmap

In this chapter we will cover:

1. Compile Time vs Runtime
2. Program Memory Layout
3. Stack Memory
4. Heap Memory
5. Why Dynamic Memory Exists
6. Static vs Dynamic Allocation
7. The `new` Operator
8. Dynamic Variables
9. Dynamic Arrays
10. Memory Layout Diagrams
11. The `delete` Operator
12. `delete` vs `delete[]`
13. Common Mistakes
14. Interview Questions

---

### Compile Time vs Runtime

Before learning dynamic memory, we must understand when memory decisions happen.

---

### What Is Compile Time?

#### Definition

Compile time is the phase where source code is translated into machine code.

---

Example:

```cpp
int arr[100];
```

Compiler immediately knows:

```text
Array size = 100
```

Memory required:

```text
100 × 4 = 400 bytes
```

---

Compiler can prepare instructions because:

```text
Size is known beforehand.
```

---

### What Is Runtime?

#### Definition

Runtime begins when the compiled program starts executing.

---

Example:

```cpp
int n;

cin >> n;
```

Compiler does NOT know:

```text
What value user will enter.
```

---

Possible values:

```text
10
100
1000
100000
```

Unknown until execution.

---

### Key Difference

| Compile Time           | Runtime               |
| ---------------------- | --------------------- |
| Before execution       | During execution      |
| Compiler active        | Program active        |
| Sizes known            | Values discovered     |
| Generates machine code | Executes machine code |

---

### Why Is This Important?

Consider:

```cpp
int n;

cin >> n;

int arr[n];
```

---

Many beginners write this.

---

### Is This Valid C++?

According to:

```text
Standard C++
```

No.

---

Reason:

Compiler needs array size during compilation.

---

But:

```text
GCC
Clang
```

may allow it as an extension called:

```text
Variable Length Arrays (VLA)
```

---

### Important Interview Answer

```text
int arr[n]
```

is:

```text
Not Standard C++
```

even if some compilers accept it.

---

### Why Dynamic Memory Exists

Consider:

```cpp
int studentCount;

cin >> studentCount;
```

---

Suppose user enters:

```text
50000
```

---

Compiler could never know this beforehand.

---

We need memory allocation:

```text
During execution
```

instead of:

```text
Before execution
```

---

This is Dynamic Memory Allocation.

---

### Program Memory Layout

A simplified process memory layout looks like:

```text
High Memory
┌─────────────────┐
│     Stack       │
└─────────────────┘
         ↑↓

┌─────────────────┐
│      Heap       │
└─────────────────┘

┌─────────────────┐
│ Global/Static   │
└─────────────────┘

┌─────────────────┐
│ Program Code    │
└─────────────────┘
Low Memory
```

---

### Important Sections

For this chapter:

```text
Stack
Heap
```

are the most important.

---

### Stack Memory

#### Definition

Stack memory stores:

- Local variables
- Function parameters
- Return addresses
- References

---

Example:

```cpp
int main()
{
    int num = 10;
}
```

---

Memory

```text
Stack

num = 10
```

---

### Characteristics

##### Fast Allocation

Very fast.

---

##### Automatic Cleanup

Memory automatically released.

---

##### Small Size

Usually much smaller than heap.

---

##### Managed By Compiler

No manual cleanup required.

---

### Example

```cpp
void fun()
{
    int x = 10;
}
```

---

When function ends:

```text
x destroyed automatically.
```

---

### Heap Memory

#### Definition

Heap memory is used for memory allocated during runtime.

---

Allocated using:

```cpp
new
```

---

Released using:

```cpp
delete
```

---

### Characteristics

##### Runtime Allocation

Size can be decided while program runs.

---

##### Manual Cleanup

Programmer responsible.

---

##### Larger Memory Region

Generally much larger than stack.

---

##### Slightly Slower

Requires allocator management.

---

### Stack vs Heap

| Feature    | Stack       | Heap          |
| ---------- | ----------- | ------------- |
| Allocation | Automatic   | Manual        |
| Cleanup    | Automatic   | Manual        |
| Speed      | Faster      | Slower        |
| Size       | Smaller     | Larger        |
| Lifetime   | Scope-based | Until deleted |
| Managed By | Compiler    | Programmer    |

---

### Static Memory Allocation

#### Definition

Memory size known before execution.

---

Example

```cpp
int arr[100];
```

---

Compiler knows:

```text
400 bytes needed.
```

---

Allocation occurs on stack.

---

### Dynamic Memory Allocation

#### Definition

Memory size decided while program executes.

---

Example

```cpp
int n;

cin >> n;

int* arr = new int[n];
```

---

Now:

```text
Size determined at runtime.
```

---

### The `new` Operator

#### Definition

`new` allocates memory on the heap and returns its address.

---

### Syntax

```cpp
new datatype;
```

---

### Example

```cpp
new int;
```

---

### What Happens Internally?

#### Step 1

Heap memory allocated.

---

#### Step 2

Address returned.

---

Visual

```text
Heap

Address 5000

[ int ]
```

---

Returned:

```text
5000
```

---

### Why Can't We Access It Directly?

Heap objects have:

```text
No variable names
```

---

Example

```cpp
new int;
```

---

This allocates memory.

But:

```text
Address lost immediately.
```

---

Memory leak occurs.

---

### Correct Usage

```cpp
int* ptr = new int;
```

---

### Memory Diagram

Stack:

```text
ptr
```

stores:

```text
5000
```

---

Heap:

```text
5000

[ int ]
```

---

Visual

```text
Stack

ptr
 │
 ▼

Heap

[ int ]
```

---

### Dynamic Integer Example

```cpp
int* ptr = new int;
```

---

Meaning:

```text
Heap:
4-byte integer

Stack:
8-byte pointer
```

(on most 64-bit systems)

---

### Dynamic Character Example

```cpp
char* ch = new char;
```

---

Memory

```text
Heap

1 byte char
```

---

Pointer

```text
Stack

8-byte pointer
```

---

### Assigning Values

```cpp
int* ptr = new int;

*ptr = 50;
```

---

Memory

```text
Heap

50
```

---

Output

```cpp
cout << *ptr;
```

```text
50
```

---

### Dynamic Arrays

One of the most important uses of heap memory.

---

### Problem

```cpp
int n;

cin >> n;
```

Size unknown.

---

### Solution

```cpp
int* arr = new int[n];
```

---

### What Happens?

Suppose:

```text
n = 5
```

---

Heap

```text
[ ][ ][ ][ ][ ]
```

---

Pointer stores first address.

---

### Memory Diagram

```text
Stack

arr
 │
 ▼

Heap

┌────┬────┬────┬────┬────┐
│    │    │    │    │    │
└────┴────┴────┴────┴────┘
```

---

### Input Example

```cpp
for(int i=0;i<n;i++)
{
    cin >> arr[i];
}
```

---

Works exactly like normal arrays.

---

### Dynamic Array Example

```cpp
int n;

cin >> n;

int* arr = new int[n];

for(int i=0;i<n;i++)
{
    cin >> arr[i];
}
```

---

### Why Does This Work?

Because:

```cpp
new int[n]
```

allocates:

```text
Contiguous memory block
```

just like a normal array.

---

### Dynamic Arrays vs Static Arrays

| Feature                    | Static Array | Dynamic Array |
| -------------------------- | ------------ | ------------- |
| Size Known At Compile Time | Yes          | No            |
| Stored In                  | Stack        | Heap          |
| Resize                     | No           | No            |
| Runtime Size               | No           | Yes           |
| Requires Delete            | No           | Yes           |

---

### The `delete` Operator

#### Definition

`delete` releases heap memory.

---

### Why Needed?

Heap memory is NOT automatically cleaned.

---

### Example

```cpp
int* ptr = new int;
```

Allocates memory.

---

To release:

```cpp
delete ptr;
```

---

Memory freed.

---

### Visual

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

Heap object destroyed.

---

### Deleting Dynamic Arrays

For arrays:

```cpp
int* arr = new int[50];
```

---

Must use:

```cpp
delete[] arr;
```

---

### Why?

Compiler must know:

```text
Entire array block
```

must be released.

---

### Wrong

```cpp
delete arr;
```

Undefined behavior.

---

### Correct

```cpp
delete[] arr;
```

---

### Memory Leak Example

Consider:

```cpp
while(true)
{
    int* ptr = new int;
}
```

---

### What Happens?

Every iteration:

```text
New heap memory allocated.
```

---

Never released.

---

Heap grows forever.

---

Eventually:

```text
Program exhausts memory.
```

---

This is called:

```text
Memory Leak
```

---

### Compare With Stack Example

```cpp
while(true)
{
    int num = 5;
}
```

---

Every iteration:

```text
num destroyed automatically.
```

---

No memory leak.

---

### Why?

Stack cleanup is automatic.

---

Heap cleanup is manual.

---

### Best Practice

After deleting:

```cpp
delete ptr;

ptr = nullptr;
```

---

Why?

Avoid accidental use of freed memory.

---

### Common Bugs

---

### Bug 1

```cpp
new int;
```

without storing address.

Memory leak.

---

### Bug 2

```cpp
delete ptr;
```

forgotten.

Memory leak.

---

### Bug 3

```cpp
delete arr;
```

for dynamic array.

Wrong.

---

### Bug 4

Using:

```cpp
int arr[n];
```

expecting portable C++.

Not standard.

---

### Bug 5

Assuming heap memory auto-cleans.

It does not.

---

### Interview Questions

---

#### Q1

What is Dynamic Memory Allocation?

##### Answer

Allocating memory during runtime instead of compile time.

---

#### Q2

Why do we use heap memory?

##### Answer

When size or lifetime cannot be determined beforehand.

---

#### Q3

What does `new` return?

##### Answer

Address of allocated memory.

---

#### Q4

Why can't heap objects have names?

##### Answer

They are created during runtime.

Only addresses identify them.

---

#### Q5

Difference between stack and heap?

##### Answer

Stack is automatic and fast.

Heap is manual and flexible.

---

#### Q6

Difference between:

```cpp
delete ptr;
```

and

```cpp
delete[] arr;
```

##### Answer

One deletes a single object.

The other deletes an entire dynamic array.

---

#### Q7

What is a memory leak?

##### Answer

Allocated memory that is never released.

---

### Cheat Sheet

```cpp
int* ptr = new int;

*ptr = 50;

delete ptr;

ptr = nullptr;


int n;

cin >> n;

int* arr = new int[n];

delete[] arr;
```

---

### Key Takeaways

- Dynamic memory allocation occurs during runtime.
- Stack memory is automatic and scope-based.
- Heap memory is manually managed.
- `new` allocates memory on the heap and returns an address.
- Heap objects do not have variable names.
- Dynamic arrays allow runtime-sized allocation.
- `delete` releases single heap objects.
- `delete[]` releases dynamic arrays.
- Forgetting `delete` causes memory leaks.
- Understanding stack and heap is essential before learning memory leaks, dangling pointers, and smart pointers.

---
