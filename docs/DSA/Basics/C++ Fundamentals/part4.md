---
sidebar_label: 'Fundamentals Part 4'
sidebar_position: 4
---

# Input / Output Handling

> Programs become useful only when they can interact with users.
>
> Input allows a program to receive data.
>
> Output allows a program to display results.

---

## What is Input and Output?

```text
User Input
     ↓
 Program
     ↓
Output Result
```

Example:

```text
Enter Age: 25

Your Age is 25
```

---

## Output in C++

Output is performed using:

```cpp
cout
```

where:

```cpp
cout
```

stands for:

```text
Character Output
```

---

## Basic Output

```cpp
#include <iostream>
using namespace std;

int main()
{
    cout << "Hello World";

    return 0;
}
```

#### Output

```text
Hello World
```

---

## Printing Multiple Values

```cpp
int age = 25;

cout << "Age: " << age;
```

#### Output

```text
Age: 25
```

---

## The Insertion Operator (`<<`)

Used to send data to output stream.

```cpp
cout << "Hello";
```

Read as:

```text
Insert "Hello" into cout
```

---

## Multiple Outputs

```cpp
cout << "Age: " << 25 << " Years";
```

#### Output

```text
Age: 25 Years
```

---

## New Line

### Using `endl`

```cpp
cout << "Hello" << endl;
cout << "World";
```

#### Output

```text
Hello
World
```

---

### Using `\n`

```cpp
cout << "Hello\n";
cout << "World";
```

#### Output

```text
Hello
World
```

---

## `endl` vs `\n`

| Feature        | endl | \n  |
| -------------- | ---- | --- |
| New Line       | Yes  | Yes |
| Flushes Buffer | Yes  | No  |
| Faster         | No   | Yes |

---

### Recommendation

Prefer:

```cpp
"\n"
```

for better performance.

---

## Input in C++

Input is performed using:

```cpp
cin
```

where:

```text
Character Input
```

---

## Basic Input

```cpp
int age;

cin >> age;
```

#### Input

```text
25
```

#### Output

```cpp
cout << age;
```

```text
25
```

---

## Extraction Operator (`>>`)

Used to extract data from input stream.

```cpp
cin >> age;
```

Read as:

```text
Take data from cin and store in age
```

---

## Multiple Inputs

```cpp
int a, b;

cin >> a >> b;
```

#### Input

```text
10 20
```

#### Values

```text
a = 10
b = 20
```

---

## Example Program

```cpp
#include <iostream>
using namespace std;

int main()
{
    int age;

    cout << "Enter Age: ";

    cin >> age;

    cout << "Age: " << age;

    return 0;
}
```

---

## Problem with `cin`

Consider:

```cpp
string name;

cin >> name;
```

Input:

```text
Prashant Sharma
```

---

Stored Value:

```text
Prashant
```

Only first word is captured.

---

## Why?

`cin >>` stops reading when it encounters:

```text
Space (' ')
Tab (\t)
Newline (\n)
```

---

# getline()

Used to read an entire line.

---

## Syntax

```cpp
getline(cin, name);
```

---

## Example

```cpp
string name;

getline(cin, name);

cout << name;
```

Input:

```text
Prashant Sharma
```

Output:

```text
Prashant Sharma
```

---

# cin vs getline()

| Feature           | cin >> | getline() |
| ----------------- | ------ | --------- |
| Reads Single Word | Yes    | Yes       |
| Reads Spaces      | No     | Yes       |
| Stops at Space    | Yes    | No        |
| Stops at Enter    | Yes    | Yes       |

---

# Common Issue with getline()

Example:

```cpp
int age;

cin >> age;

string name;

getline(cin, name);
```

Input:

```text
25
Prashant
```

---

Output:

```text
name = ""
```

---

# Why Does This Happen?

After:

```cpp
cin >> age;
```

the Enter key remains inside input buffer.

---

Memory:

```text
25\n
   ↑
Remaining
```

---

`getline()` immediately reads that leftover newline.

---

## Solution: cin.ignore()

```cpp
int age;

cin >> age;

cin.ignore();

string name;

getline(cin, name);
```

---

Now:

Input:

```text
25
Prashant Sharma
```

Output:

```text
Prashant Sharma
```

---

## Input Buffer

Whenever user enters data:

```text
Keyboard
   ↓
Input Buffer
   ↓
cin
```

---

Example

Input:

```text
10 20 30
```

Buffer:

```text
10 20 30
```

---

After:

```cpp
cin >> a;
```

Buffer:

```text
20 30
```

---

After:

```cpp
cin >> b;
```

Buffer:

```text
30
```

---

## Input Failure

Example:

```cpp
int age;

cin >> age;
```

Input:

```text
abc
```

---

Result:

```text
Input Failure
```

---

## Checking Input Failure

```cpp
int age;

cin >> age;

if(cin.fail())
{
    cout << "Invalid Input";
}
```

---

## Clearing Input Error

```cpp
cin.clear();
```

Used to clear error flags.

---

Example

```cpp
cin.clear();
cin.ignore(1000, '\n');
```

---

## Output Formatting

---

## fixed

```cpp
double pi = 3.1415926535;

cout << fixed << pi;
```

Output:

```text
3.141593
```

---

## setprecision()

Requires:

```cpp
#include <iomanip>
```

---

Example

```cpp
cout << fixed << setprecision(2);

cout << 3.14159;
```

Output:

```text
3.14
```

---

## Example

```cpp
#include <iostream>
#include <iomanip>

using namespace std;

int main()
{
    double price = 99.9999;

    cout << fixed
         << setprecision(2)
         << price;
}
```

Output:

```text
100.00
```

---

## Common Beginner Mistakes

---

### Forgetting `&`

Wrong:

```cpp
cin << age;
```

---

Correct:

```cpp
cin >> age;
```

---

### Using `cin` for Full Names

Wrong:

```cpp
cin >> name;
```

Input:

```text
Prashant Sharma
```

Output:

```text
Prashant
```

---

Use:

```cpp
getline()
```

instead.

---

### Mixing `cin` and `getline`

Wrong:

```cpp
cin >> age;

getline(cin, name);
```

---

Correct:

```cpp
cin >> age;

cin.ignore();

getline(cin, name);
```

---

## Interview Questions

### Q1. Difference between `cin` and `cout`?

#### Answer

```cpp
cin
```

takes input.

```cpp
cout
```

produces output.

---

### Q2. Difference between `endl` and `\n`?

#### Answer

Both create a new line.

`endl` also flushes the output buffer.

---

## Q3. Why does `cin >>` stop at spaces?

### Answer

Because space, tab and newline are treated as delimiters.

---

## Q4. When should we use `getline()`?

### Answer

When input may contain spaces.

---

## Q5. Why is `cin.ignore()` used?

### Answer

To remove leftover newline characters from the input buffer.

---

# Cheat Sheet

```cpp
cout << "Hello";

cout << "Hello\n";

cout << "Hello" << endl;
```

```cpp
int age;

cin >> age;
```

```cpp
string name;

getline(cin, name);
```

```cpp
cin.ignore();
```

```cpp
if(cin.fail())
{
    cout << "Invalid Input";
}
```

```cpp
cout << fixed << setprecision(2);
```

---

# Key Takeaways

- `cout` is used for output.
- `cin` is used for input.
- `<<` is the insertion operator.
- `>>` is the extraction operator.
- `\n` and `endl` create new lines.
- `cin >>` stops at space, tab, and newline.
- `getline()` reads entire lines including spaces.
- `cin.ignore()` helps when mixing `cin` and `getline()`.
- Input is processed through an input buffer.
- `fixed` and `setprecision()` are used for formatted output.

---