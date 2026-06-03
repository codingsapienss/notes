---
sidebar_label: 'Fundamentals Part 11'
sidebar_position: 11
---

# Advanced Function Concepts

> These are important language features commonly used with functions and large codebases.
>
> They help improve:
>
> - Readability
> - Maintainability
> - Performance
> - Code Reusability

---

## Topics Covered

- Macros
- Global Variables
- Inline Functions
- Default Arguments

---

## Macros

### What is a Macro?

A macro is a piece of code that gets replaced before compilation.

Created using:

```cpp
#define
```

---

### Example

```cpp
#define PI 3.14159

int main()
{
    cout << PI;
}
```

Before compilation:

```cpp
cout << 3.14159;
```

---

### Why Use Macros?

Avoid repeating values.

---

Instead of:

```cpp
cout << 3.14159;
cout << 3.14159;
cout << 3.14159;
```

Use:

```cpp
#define PI 3.14159

cout << PI;
```

---

### Macro Replacement

```cpp
#define MAX_SIZE 100

int arr[MAX_SIZE];
```

Compiler sees:

```cpp
int arr[100];
```

---

### Modern Alternative

Prefer:

```cpp
constexpr double PI = 3.14159;
```

because it is:

- Type Safe
- Debug Friendly
- Modern C++

---

## Global Variables

### What is a Global Variable?

A variable declared outside all functions.

---

### Example

```cpp
#include <iostream>
using namespace std;

int count = 0;

void increment()
{
    count++;
}

int main()
{
    increment();

    cout << count;
}
```

#### Output

```text
1
```

---

### Scope

Accessible from all functions within the file.

---

### Lifetime

Exists:

```text
Program Start
       ↓
Program End
```

---

### Why Use Global Variables?

To share data between functions.

---

### Problems

Any function can modify it.

---

Example:

```cpp
int count = 0;

void fun1()
{
    count++;
}

void fun2()
{
    count = 100;
}
```

Tracking changes becomes difficult.

---

### Best Practice

Avoid mutable global variables whenever possible.

Prefer:

```cpp
const int MAX_SIZE = 100;
```

or

```cpp
constexpr int MAX_SIZE = 100;
```

---

## Inline Functions

### Why Do We Need Inline Functions?

Normal function calls have overhead.

---

Example:

```cpp
add(10,20);
```

Compiler must:

```text
Create Stack Frame
Pass Parameters
Jump To Function
Return Back
```

---

### Inline Function

```cpp
inline int square(int x)
{
    return x * x;
}
```

---

### Usage

```cpp
cout << square(5);
```

Compiler may replace it with:

```cpp
cout << 5 * 5;
```

---

### Benefit

Reduces function call overhead.

---

### Important Note

```text
inline is only a request.
```

Compiler may ignore it.

---

### Good Candidate

```cpp
inline int maxVal(int a, int b)
{
    return a > b ? a : b;
}
```

Small utility functions.

---

## Inline Function vs Macro

Macro:

```cpp
#define SQUARE(x) ((x)*(x))
```

---

Inline Function:

```cpp
inline int square(int x)
{
    return x*x;
}
```

---

| Feature        | Macro | Inline Function |
| -------------- | ----- | --------------- |
| Type Safe      | ❌    | ✅              |
| Debug Friendly | ❌    | ✅              |
| Recommended    | ❌    | ✅              |

---

## Default Arguments

### What Are Default Arguments?

Values automatically supplied if arguments are omitted.

---

### Example

```cpp
void print(int value = 10)
{
    cout << value;
}
```

---

#### Call

```cpp
print();
```

#### Output

```text
10
```

---

#### Call

```cpp
print(50);
```

#### Output

```text
50
```

---

## Multiple Default Arguments

```cpp
void display(
    int a = 10,
    int b = 20
)
{
    cout << a << " " << b;
}
```

---

#### Call

```cpp
display();
```

Output:

```text
10 20
```

---

#### Call

```cpp
display(5);
```

Output:

```text
5 20
```

---

#### Call

```cpp
display(5, 6);
```

Output:

```text
5 6
```

---

## Important Rule

Default arguments must be provided from right to left.

---

### Valid

```cpp
void func(int a, int b = 10);
```

---

### Valid

```cpp
void func(
    int a,
    int b = 10,
    int c = 20
);
```

---

### Invalid

```cpp
void func(int a = 5, int b);
```

Compilation Error.

---

## Comparison Table

| Feature          | Purpose                       |
| ---------------- | ----------------------------- |
| Macro            | Compile-time text replacement |
| Global Variable  | Shared data across functions  |
| Inline Function  | Reduce function call overhead |
| Default Argument | Optional function parameters  |

---

## Common Beginner Mistakes

---

### Using Macro for Constants

Avoid:

```cpp
#define PI 3.14
```

Prefer:

```cpp
constexpr double PI = 3.14;
```

---

### Overusing Global Variables

Avoid:

```cpp
int totalMarks;
int score;
int count;
int age;
```

as globals.

Pass values through functions whenever possible.

---

### Assuming Inline Always Works

Wrong assumption:

```text
inline guarantees inlining.
```

Compiler may ignore it.

---

### Default Argument Placement

Wrong:

```cpp
void func(int a = 10, int b);
```

---

Correct:

```cpp
void func(int a, int b = 10);
```

---

## Interview Questions

### Q1. What is a macro?

#### Answer

A preprocessor replacement that occurs before compilation.

---

### Q2. What is a global variable?

#### Answer

A variable declared outside all functions and accessible throughout the file.

---

### Q3. What is an inline function?

#### Answer

A function that requests the compiler to replace the function call with its body.

---

### Q4. Does inline guarantee inlining?

#### Answer

No.

It is only a compiler request.

---

### Q5. What are default arguments?

#### Answer

Arguments automatically supplied when values are not provided during a function call.

---

## Cheat Sheet

```cpp
#define PI 3.14
```

```cpp
constexpr double PI = 3.14159;
```

```cpp
int globalVar = 10;
```

```cpp
inline int square(int x)
{
    return x*x;
}
```

```cpp
void print(int value = 10);
```

```cpp
print();
```

```cpp
print(50);
```

---

## Key Takeaways

- Macros perform text replacement before compilation.
- Modern C++ prefers `constexpr` over macros for constants.
- Global variables are accessible throughout the file but should be used carefully.
- Inline functions help reduce function call overhead.
- `inline` is only a suggestion to the compiler.
- Default arguments allow optional function parameters.
- Default parameters must be specified from right to left.
- These concepts improve code organization and are frequently asked in interviews.

---