---
sidebar_label: 'Fundamentals Part 10'
sidebar_position: 10
---

# Functions

> Functions are one of the most important concepts in programming.
>
> They help us:
>
> - Reuse code
> - Reduce duplication
> - Improve readability
> - Break large problems into smaller parts
> - Write modular programs

---

## What is a Function?

A Function is a reusable block of code that performs a specific task.

---

### Without Functions

```cpp
cout << "Welcome" << endl;
cout << "Welcome" << endl;
cout << "Welcome" << endl;
```

Repeated code.

---

### With Functions

```cpp
void printWelcome()
{
    cout << "Welcome" << endl;
}
```

```cpp
printWelcome();
printWelcome();
printWelcome();
```

---

## Real Life Analogy

Think of a function like a machine.

```text
Input
  ↓
Function
  ↓
Output
```

Example:

```text
5 , 10
 ↓
Add Function
 ↓
15
```

---

## Syntax of a Function

```cpp
returnType functionName(parameters)
{
    // code
}
```

---

### Example

```cpp
void greet()
{
    cout << "Hello";
}
```

---

## Parts of a Function

```cpp
int add(int a, int b)
{
    return a + b;
}
```

| Part             | Value        |
| ---------------- | ------------ |
| Return Type      | int          |
| Function Name    | add          |
| Parameters       | int a, int b |
| Function Body    | `{}`         |
| Return Statement | return a+b   |

---

## Function Declaration

Also called:

```text
Function Prototype
```

Tells the compiler that a function exists.

---

### Example

```cpp
int add(int, int);
```

---

## Function Definition

Actual implementation.

---

### Example

```cpp
int add(int a, int b)
{
    return a + b;
}
```

---

## Function Call

Invoking a function.

---

### Example

```cpp
add(10, 20);
```

---

## Complete Example

```cpp
#include <iostream>
using namespace std;

void greet()
{
    cout << "Hello World";
}

int main()
{
    greet();

    return 0;
}
```

#### Output

```text
Hello World
```

---

## Function Execution Flow

```text
main()
   ↓
greet()
   ↓
Execute Function Body
   ↓
Return to main()
```

---

## Return Type

Defines what a function returns.

---

## Void Function

Returns nothing.

---

### Example

```cpp
void greet()
{
    cout << "Hello";
}
```

---

## Function Returning Value

```cpp
int getNumber()
{
    return 10;
}
```

---

### Example

```cpp
int num = getNumber();

cout << num;
```

#### Output

```text
10
```

---

## Parameters and Arguments

Many beginners confuse these.

---

## Parameters

Variables defined in function definition.

---

### Example

```cpp
void print(int num)
{
    cout << num;
}
```

Here:

```cpp
num
```

is a parameter.

---

## Arguments

Actual values passed during function call.

---

### Example

```cpp
print(50);
```

Here:

```cpp
50
```

is an argument.

---

## Example

```cpp
void greet(string name)
{
    cout << "Hello " << name;
}

int main()
{
    greet("Prashant");
}
```

#### Output

```text
Hello Prashant
```

---

## Multiple Parameters

```cpp
int add(int a, int b)
{
    return a + b;
}
```

---

### Example

```cpp
cout << add(10, 20);
```

#### Output

```text
30
```

---

## Pass By Value

Default behavior in C++.

---

### Example

```cpp
void update(int num)
{
    num++;
}
```

```cpp
int main()
{
    int value = 10;

    update(value);

    cout << value;
}
```

#### Output

```text
10
```

---

## Why?

Because:

```text
A copy is created.
```

---

Memory:

```text
value = 10

      Copy

num = 10
```

Different memory locations.

---

## Pass By Reference (Introduction)

Allows function to work on the original variable.

---

### Example

```cpp
void update(int& num)
{
    num++;
}
```

```cpp
int value = 10;

update(value);

cout << value;
```

#### Output

```text
11
```

---

> Detailed discussion of references will be covered in later chapters.

---

## Function Overloading

Multiple functions with the same name but different parameters.

---

### Example

```cpp
int add(int a, int b)
{
    return a + b;
}
```

```cpp
double add(double a, double b)
{
    return a + b;
}
```

---

### Usage

```cpp
cout << add(10, 20);
```

Output:

```text
30
```

---

```cpp
cout << add(2.5, 3.5);
```

Output:

```text
6
```

---

## Local Variables

Variables declared inside a function.

---

### Example

```cpp
void fun()
{
    int x = 10;
}
```

---

### Scope

```cpp
x
```

can only be accessed inside:

```cpp
fun()
```

---

## Scope Example

```cpp
void fun()
{
    int x = 10;
}

int main()
{
    cout << x;
}
```

Compilation Error.

---

## Call Stack (Basic Understanding)

Whenever a function is called:

```text
Memory is allocated
for that function.
```

---

Example:

```cpp
main()
  ↓
add()
```

Stack:

```text
┌───────┐
│ add() │
├───────┤
│ main()│
└───────┘
```

---

When:

```cpp
add()
```

finishes,

its memory is removed.

---

## Common Beginner Mistakes

---

### Forgetting Function Call

```cpp
void greet()
{
    cout << "Hello";
}
```

Nothing prints until:

```cpp
greet();
```

is called.

---

### Missing Return Value

Wrong

```cpp
int getNum()
{
}
```

---

Correct

```cpp
int getNum()
{
    return 10;
}
```

---

### Wrong Number of Arguments

```cpp
add(10);
```

when function expects:

```cpp
add(int,int);
```

Compilation Error.

---

## Interview Questions

### Q1. What is a function?

#### Answer

A reusable block of code designed to perform a specific task.

---

### Q2. Difference between parameter and argument?

#### Answer

Parameters are variables in function definition.

Arguments are actual values passed during function call.

---

### Q3. What is a function prototype?

#### Answer

A declaration that informs the compiler about a function before its use.

---

### Q4. What is function overloading?

#### Answer

Multiple functions with the same name but different parameter lists.

---

### Q5. What is pass by value?

#### Answer

A copy of the variable is passed to the function.

---

## Cheat Sheet

```cpp
void greet()
{
}
```

```cpp
int add(int a, int b)
{
    return a + b;
}
```

```cpp
add(10,20);
```

```cpp
int add(int, int);
```

```cpp
void update(int& value);
```

---

## Key Takeaways

- Functions improve code reusability and modularity.
- Every function has a return type, name, parameters, and body.
- Function declaration informs the compiler about a function.
- Function definition contains the actual implementation.
- Function calls execute the function.
- Parameters receive values from arguments.
- Pass by value creates a copy.
- Pass by reference works on the original variable.
- Function overloading allows multiple functions with the same name.
- Functions use the call stack during execution.

---