---
sidebar_label: 'Data Types'
sidebar_position: 2
---

# Data Types

> Every piece of data stored inside a program occupies memory. To store data correctly, the compiler must know:
>
> - What kind of data is being stored
> - How much memory is needed
> - What operations are allowed on it
>
> This information is provided through **Data Types**.

---

## What is a Data Type?

A Data Type defines:

```text
1. Type of data
2. Size of memory required
3. Range of values that can be stored
4. Allowed operations
```

---

### Example

```cpp
int age = 25;

char grade = 'A';

double salary = 50000.75;
```

Here:

```text
int    → Integer values
char   → Single characters
double → Decimal numbers
```

---

## Why Do We Need Data Types?

Imagine if C++ had no data types.

```cpp
10
'A'
3.14
true
```

The compiler would not know:

- How many bytes to allocate
- How to interpret the data
- Which operations are valid

Data types solve this problem.

---

## Classification of Data Types

```text
Data Types
│
├── Primitive / Fundamental
│   ├── int
│   ├── char
│   ├── bool
│   ├── float
│   ├── double
│   └── void
│
├── Derived
│   ├── Array
│   ├── Pointer
│   └── Reference
│
└── User Defined
    ├── struct
    ├── class
    ├── enum
    └── union
```

For now, we focus on:

```text
Fundamental Data Types
```

---

## Integer Types

Used for storing whole numbers.

---

### int

#### Syntax

```cpp
int age = 25;
```

#### Output

```cpp
cout << age;
```

```text
25
```

---

#### Memory

Typically:

```text
4 Bytes
```

---

#### Range

```text
-2,147,483,648

to

2,147,483,647
```

---

#### Example

```cpp
int population = 1500000;

cout << population;
```

#### Output

```text
1500000
```

---

## Character Type

### char

Stores a single character.

---

#### Syntax

```cpp
char grade = 'A';
```

---

#### Output

```cpp
cout << grade;
```

```text
A
```

---

#### Memory

```text
1 Byte
```

---

#### Important

Character must use:

```cpp
''
```

Single quotes.

---

Correct:

```cpp
char ch = 'A';
```

---

Wrong:

```cpp
char ch = "A";
```

Compilation Error.

---

## Boolean Type

### bool

Stores:

```text
true
false
```

---

#### Example

```cpp
bool isLoggedIn = true;
```

---

#### Output

```cpp
cout << isLoggedIn;
```

```text
1
```

---

#### Example

```cpp
cout << false;
```

Output:

```text
0
```

---

#### Memory

Typically:

```text
1 Byte
```

---

## Floating Point Types

Used for decimal numbers.

---

## float

#### Syntax

```cpp
float price = 12.5f;
```

---

#### Memory

```text
4 Bytes
```

---

#### Example

```cpp
float temperature = 36.5f;

cout << temperature;
```

#### Output

```text
36.5
```

---

## double

Higher precision than float.

---

#### Syntax

```cpp
double pi = 3.1415926535;
```

---

#### Memory

```text
8 Bytes
```

---

#### Example

```cpp
double salary = 50000.75;

cout << salary;
```

#### Output

```text
50000.8
```

(Formatting may vary)

---

## float vs double

| Feature     | float           | double          |
| ----------- | --------------- | --------------- |
| Size        | 4 Bytes         | 8 Bytes         |
| Precision   | Lower           | Higher          |
| Performance | Slightly Faster | Slightly Slower |
| Usage       | Less Common     | More Common     |

---

## Void Type

Represents:

```text
No Data
```

---

#### Example

```cpp
void print()
{
    cout << "Hello";
}
```

---

Meaning:

```text
Function returns nothing.
```

---

## Size of Data Types

Use:

```cpp
sizeof()
```

---

#### Example

```cpp
cout << sizeof(int);
```

#### Output

```text
4
```

---

#### Example

```cpp
cout << sizeof(double);
```

#### Output

```text
8
```

---

## Program to Check Sizes

```cpp
#include <iostream>
using namespace std;

int main()
{
    cout << "char   : " << sizeof(char) << endl;
    cout << "bool   : " << sizeof(bool) << endl;
    cout << "int    : " << sizeof(int) << endl;
    cout << "float  : " << sizeof(float) << endl;
    cout << "double : " << sizeof(double) << endl;

    return 0;
}
```

#### Possible Output

```text
char   : 1
bool   : 1
int    : 4
float  : 4
double : 8
```

---

## Signed and Unsigned

By default:

```cpp
int
```

is:

```cpp
signed int
```

---

## Signed Integer

Stores:

```text
Positive
Negative
```

numbers.

---

Example

```cpp
signed int num = -50;
```

---

## Unsigned Integer

Stores only:

```text
Positive Numbers
```

---

Example

```cpp
unsigned int num = 50;
```

---

Wrong:

```cpp
unsigned int num = -50;
```

Unexpected result due to conversion.

---

## Why Use Unsigned?

Because:

```text
No bits wasted for sign storage.
```

Range becomes larger.

---

## Type Modifiers

---

## short

Smaller integer.

```cpp
short num = 100;
```

---

## long

Larger integer.

```cpp
long num = 1000000;
```

---

## long long

Very large integers.

```cpp
long long population = 8000000000;
```

---

## Integer Type Comparison

| Type      | Typical Size |
| --------- | ------------ |
| short     | 2 Bytes      |
| int       | 4 Bytes      |
| long      | 4 or 8 Bytes |
| long long | 8 Bytes      |

---

## Type Conversion

Conversion of one type into another.

---

## Implicit Conversion

Done automatically by compiler.

---

Example

```cpp
int num = 10;

double d = num;
```

---

Result

```text
10 → 10.0
```

---

## Explicit Conversion

Done manually.

---

Example

```cpp
double pi = 3.14;

int num = (int)pi;
```

---

Output

```text
3
```

Decimal part removed.

---

Better Modern Syntax

```cpp
int num = static_cast<int>(pi);
```

---

## ASCII and char

Characters are stored as numbers internally.

---

Example

```cpp
char ch = 'A';

cout << (int)ch;
```

#### Output

```text
65
```

---

Example

```cpp
char ch = 'a';

cout << (int)ch;
```

#### Output

```text
97
```

---

## Character Arithmetic

```cpp
char ch = 'A';

cout << char(ch + 1);
```

#### Output

```text
B
```

---

## Overflow

Occurs when value exceeds storage capacity.

---

Example

```cpp
char ch = 127;

ch++;

cout << (int)ch;
```

Possible Output

```text
-128
```

---

Reason:

```text
Value exceeded allowed range.
```

---

## Common Mistakes

---

### Using Double Quotes for char

Wrong

```cpp
char ch = "A";
```

---

Correct

```cpp
char ch = 'A';
```

---

### Storing Large Numbers in int

Wrong

```cpp
int population = 8000000000;
```

---

Correct

```cpp
long long population = 8000000000;
```

---

### Comparing float Values Directly

Avoid:

```cpp
if(a == b)
```

for floating point numbers.

Precision issues may occur.

---

## Interview Questions

### Q1. What is a data type?

#### Answer

A data type defines the type of data, memory size, range, and allowed operations.

---

### Q2. Difference between float and double?

#### Answer

Double uses more memory and provides higher precision.

---

### Q3. What does sizeof() do?

#### Answer

Returns the memory occupied by a data type or variable in bytes.

---

### Q4. Difference between signed and unsigned?

#### Answer

Signed stores positive and negative values.

Unsigned stores only positive values.

---

### Q5. What is ASCII?

#### Answer

A character encoding standard where each character is represented by a numeric value.

---

## Cheat Sheet

```cpp
int age = 25;

char grade = 'A';

bool isValid = true;

float price = 99.5f;

double pi = 3.1415926535;

long long population = 8000000000;
```

```cpp
sizeof(int);
sizeof(double);
sizeof(char);
```

```cpp
signed int a;

unsigned int b;
```

---

## Key Takeaways

- Data types tell the compiler what kind of data is being stored.
- Every data type occupies memory.
- `int` stores whole numbers.
- `char` stores single characters.
- `bool` stores true/false values.
- `float` and `double` store decimal numbers.
- `double` is generally preferred over `float`.
- `sizeof()` returns memory usage in bytes.
- Characters are stored internally using ASCII values.
- Type conversion can be implicit or explicit.
- Choosing the correct data type improves memory usage and prevents overflow.

---