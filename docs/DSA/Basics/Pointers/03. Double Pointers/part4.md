---
sidebar_label: 'Pointers Part 3D'
sidebar_position: 12
---

# Advanced Double Pointers

> Until now, every pointer we have studied pointed to:
>
> - Variables
> - Arrays
> - Other pointers
>
> Examples:
>
> ```cpp
> int* ptr;
> char* ptr;
> int** ptr;
> ```
>
> But an important question arises:
>
> ```text
> If variables have memory addresses,
> do functions also have memory addresses?
> ```
>
> Answer:
>
> ```text
> YES
> ```
>
> Functions are stored in memory when a program executes.
>
> Therefore:
>
> ```text
> Functions also have addresses.
> ```
>
> And if functions have addresses:
>
> ```text
> We can store those addresses inside pointers.
> ```
>
> Those special pointers are called:
>
> ```text
> Function Pointers
> ```

---

### Learning Roadmap

In this chapter we will cover:

1. Functions Have Addresses
2. What Is A Function Pointer?
3. Function Pointer Syntax
4. Calling Functions Through Pointers
5. Memory Diagrams
6. Passing Function Pointers To Functions
7. Callbacks
8. Arrays Of Function Pointers
9. Function Pointers vs Normal Pointers
10. Modern C++ Alternatives
11. Common Bugs
12. Interview Questions

---

### Functions Have Addresses

Consider:

```cpp
void greet()
{
    cout << "Hello";
}
```

---

Most beginners think:

```text
Functions are just code.
```

Partially true.

---

Internally:

```text
Compiled machine code
```

is stored in memory.

---

Visual:

```text
Program Memory

┌─────────────────────┐
│ greet()             │
└─────────────────────┘
```

---

Therefore:

```cpp
greet
```

has an address.

---

### Printing Function Address

Example:

```cpp
#include <iostream>
using namespace std;

void greet()
{
    cout << "Hello";
}

int main()
{
    cout << (void*)greet;
}
```

Possible Output:

```text
0x4015A0
```

Address varies by system.

---

### Important Observation

Just like:

```cpp
&number
```

gives address of variable,

---

```cpp
greet
```

or

```cpp
&greet
```

gives address of function.

---

### Function Name Decay

Just like:

```cpp
arr
```

decays into:

```cpp
&arr[0]
```

---

Function names behave similarly.

---

Example:

```cpp
greet
```

is effectively:

```cpp
&greet
```

in most contexts.

---

### What Is A Function Pointer?

#### Definition

A function pointer is a pointer that stores the address of a function.

---

### Why Do We Need Function Pointers?

They allow us to:

- Call functions indirectly
- Pass functions to other functions
- Build callback systems
- Create event-driven systems
- Implement plugin architectures
- Design flexible APIs

---

### First Function Pointer

Function:

```cpp
void greet()
{
    cout << "Hello";
}
```

---

Pointer:

```cpp
void (*funcPtr)() = &greet;
```

---

### Reading The Declaration

Start from:

```cpp
funcPtr
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
()
```

means:

```text
Function
```

---

Move left again:

```cpp
void
```

means:

```text
Returns void
```

---

Final Meaning:

```text
funcPtr is a pointer to a function
that takes no parameters
and returns void.
```

---

### Memory Diagram

```text
funcPtr
   │
   │ stores
   ▼

Address of greet()
```

---

Visual:

```text
funcPtr

      │
      ▼

┌──────────────┐
│ greet()      │
└──────────────┘
```

---

### Calling Through Function Pointer

Function:

```cpp
void greet()
{
    cout << "Hello";
}
```

---

Pointer:

```cpp
void (*funcPtr)() = greet;
```

---

Call:

```cpp
funcPtr();
```

Output:

```text
Hello
```

---

### Alternative Syntax

Also valid:

```cpp
(*funcPtr)();
```

Output:

```text
Hello
```

---

### Why Both Work?

Compiler automatically dereferences function pointers.

---

Equivalent:

```cpp
funcPtr();
```

---

```cpp
(*funcPtr)();
```

---

Both call:

```cpp
greet()
```

---

### Example Program

```cpp
#include <iostream>
using namespace std;

void greet()
{
    cout << "Hello";
}

int main()
{
    void (*funcPtr)() = greet;

    funcPtr();
}
```

---

### Expected Output

```text
Hello
```

---

### Function Pointer With Parameters

Function:

```cpp
int add(int a, int b)
{
    return a + b;
}
```

---

Pointer:

```cpp
int (*funcPtr)(int,int) = add;
```

---

Reading:

```text
Pointer to function

takes:
int,int

returns:
int
```

---

### Calling

```cpp
cout << funcPtr(10,20);
```

Output:

```text
30
```

---

### Memory Diagram

```text
funcPtr

     │
     ▼

┌───────────────┐
│ add(int,int)  │
└───────────────┘
```

---

### Function Pointer Type Matching

Function:

```cpp
int add(int,int);
```

---

Valid:

```cpp
int (*ptr)(int,int);
```

---

Invalid:

```cpp
double (*ptr)(int,int);
```

---

Why?

Return types must match.

---

Invalid:

```cpp
int (*ptr)(double,double);
```

---

Why?

Parameter list must match.

---

### Passing Function Pointers To Functions

This is where function pointers become powerful.

---

### Example

Function:

```cpp
int add(int a,int b)
{
    return a+b;
}
```

---

Processor:

```cpp
void execute(
    int x,
    int y,
    int (*operation)(int,int)
)
{
    cout << operation(x,y);
}
```

---

Call:

```cpp
execute(10,20,add);
```

Output:

```text
30
```

---

### Why Useful?

Function behavior becomes dynamic.

---

### Example

```cpp
execute(10,20,add);
```

Output:

```text
30
```

---

```cpp
execute(10,20,multiply);
```

Output:

```text
200
```

---

Same function.

Different behavior.

---

### What Is A Callback?

#### Definition

A callback is a function passed as an argument to another function.

---

Visual:

```text
Function A

↓

receives

↓

Function B

↓

calls it later
```

---

### Example

```cpp
int add(int a,int b)
{
    return a+b;
}
```

---

```cpp
void execute(
    int a,
    int b,
    int (*callback)(int,int)
)
{
    cout << callback(a,b);
}
```

---

Call:

```cpp
execute(5,10,add);
```

---

Execution Flow

```text
execute()

↓

callback()

↓

add()

↓

15
```

---

### Real-World Example

GUI Systems:

```text
Button Click

↓

Callback Function

↓

Perform Action
```

---

Examples:

- Button Click Events
- Keyboard Events
- Mouse Events
- Networking Events

---

### Multiple Operations Example

Functions:

```cpp
int add(int a,int b)
{
    return a+b;
}
```

---

```cpp
int subtract(int a,int b)
{
    return a-b;
}
```

---

```cpp
int multiply(int a,int b)
{
    return a*b;
}
```

---

Processor:

```cpp
void calculate(
    int x,
    int y,
    int (*operation)(int,int)
)
{
    cout << operation(x,y);
}
```

---

Calls:

```cpp
calculate(10,5,add);
```

Output:

```text
15
```

---

```cpp
calculate(10,5,subtract);
```

Output:

```text
5
```

---

```cpp
calculate(10,5,multiply);
```

Output:

```text
50
```

---

### Arrays Of Function Pointers

Just like:

```cpp
int* arr[5];
```

creates array of pointers,

---

we can create:

```cpp
int (*operations[3])(int,int);
```

---

Meaning:

```text
Array of function pointers
```

---

Example

```cpp
operations[0] = add;

operations[1] = subtract;

operations[2] = multiply;
```

---

Call:

```cpp
cout << operations[0](10,5);
```

Output:

```text
15
```

---

### Memory Diagram

```text
operations

┌─────────────┐
│ add         │
├─────────────┤
│ subtract    │
├─────────────┤
│ multiply    │
└─────────────┘
```

---

### Function Pointer vs Normal Pointer

| Feature        | Normal Pointer | Function Pointer |
| -------------- | -------------- | ---------------- |
| Points To      | Data           | Function         |
| Dereference    | Value          | Function         |
| Arithmetic     | Yes            | No               |
| Can Call       | No             | Yes              |
| Stores Address | Yes            | Yes              |

---

### Function Pointer Arithmetic

Invalid:

```cpp
funcPtr++;
```

---

Why?

Function pointers are not intended for arithmetic traversal.

---

### Modern C++ Alternatives

Function pointers are still important.

However modern C++ often uses:

---

### Lambdas

```cpp
auto add =
[](int a,int b)
{
    return a+b;
};
```

---

### Functors

Objects that behave like functions.

---

### std::function

```cpp
std::function<int(int,int)> op;
```

---

These provide greater flexibility.

---

### Advantages of Function Pointers

##### Dynamic Behavior

Choose function at runtime.

---

##### Reusable Code

Avoid duplicate logic.

---

##### Callback Systems

Essential for event-driven programming.

---

##### Low-Level Efficiency

Very lightweight.

---

### Disadvantages

##### Complex Syntax

Can be difficult to read.

---

##### Limited Flexibility

Compared to lambdas and `std::function`.

---

##### Harder Maintenance

Complex declarations reduce readability.

---

### Common Bugs

---

### Bug 1

Incorrect Signature

```cpp
int (*ptr)(int,int);

ptr = greet;
```

Compilation Error.

---

### Bug 2

Forgetting Parentheses

Wrong:

```cpp
int *ptr(int,int);
```

Meaning:

```text
Function returning int*
```

---

Correct:

```cpp
int (*ptr)(int,int);
```

Meaning:

```text
Pointer to function
```

---

### Bug 3

Calling Null Function Pointer

```cpp
int (*ptr)(int,int) = nullptr;

ptr(1,2);
```

Undefined Behavior.

---

### Interview Questions

---

#### Q1

What is a function pointer?

##### Answer

A pointer that stores the address of a function.

---

#### Q2

Do functions have memory addresses?

##### Answer

Yes.

Functions are stored in program memory.

---

#### Q3

Difference between:

```cpp
funcPtr();
```

and

```cpp
(*funcPtr)();
```

##### Answer

No difference.

Both call the function.

---

#### Q4

What is a callback?

##### Answer

A function passed as an argument to another function.

---

#### Q5

Why are function pointers useful?

##### Answer

They enable dynamic behavior and callback systems.

---

#### Q6

Difference between:

```cpp
int *ptr(int,int);
```

and

```cpp
int (*ptr)(int,int);
```

##### Answer

| Declaration           | Meaning                    |
| --------------------- | -------------------------- |
| `int *ptr(int,int)`   | Function returning pointer |
| `int (*ptr)(int,int)` | Pointer to function        |

---

### Cheat Sheet

```cpp
void greet();

void (*funcPtr)() = greet;

funcPtr();

(*funcPtr)();

int add(int,int);

int (*ptr)(int,int) = add;

ptr(10,20);

void execute(
    int,
    int,
    int (*operation)(int,int)
);

int (*operations[3])(int,int);
```

---

### Key Takeaways

- Functions have memory addresses.
- Function names decay to function addresses in most contexts.
- Function pointers store addresses of functions.
- Function pointer signatures must exactly match the target function.
- Function pointers enable callbacks and dynamic behavior.
- Arrays of function pointers are possible.
- Function pointers are heavily used in event-driven systems.
- Modern C++ often uses lambdas and `std::function`, but function pointers remain fundamental.
- Understanding function pointers is essential for mastering advanced C++ APIs and systems programming.

---
