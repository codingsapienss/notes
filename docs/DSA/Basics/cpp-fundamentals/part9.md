---
sidebar_label: 'Operators'
sidebar_position: 9
---

# Operators

> Operators are symbols that perform operations on values and variables.
>
> They are the building blocks of expressions and are used throughout C++ programs.

---

### What is an Operator?

An operator tells the compiler:

```text
What operation should be performed
on one or more operands.
```

Example:

```cpp
int a = 10;
int b = 20;

cout << a + b;
```

Here:

```cpp
+
```

is the operator.

```cpp
a
b
```

are operands.

---

### Types of Operators

```text
Operators
│
├── Arithmetic
├── Relational
├── Logical
├── Assignment
├── Increment / Decrement
├── Bitwise
├── Conditional (Ternary)
└── sizeof
```

---

### Arithmetic Operators

Used for mathematical calculations.

---

| Operator | Meaning             |
| -------- | ------------------- |
| +        | Addition            |
| -        | Subtraction         |
| \*       | Multiplication      |
| /        | Division            |
| %        | Modulus (Remainder) |

---

#### Addition

```cpp
int a = 10;
int b = 5;

cout << a + b;
```

##### Output

```text
15
```

---

#### Subtraction

```cpp
cout << 10 - 5;
```

##### Output

```text
5
```

---

#### Multiplication

```cpp
cout << 4 * 3;
```

##### Output

```text
12
```

---

#### Division

```cpp
cout << 10 / 2;
```

##### Output

```text
5
```

---

### Integer Division

```cpp
cout << 5 / 2;
```

##### Output

```text
2
```

Not:

```text
2.5
```

Because:

```cpp
Both operands are int
```

---

#### Getting Decimal Output

```cpp
cout << 5.0 / 2;
```

##### Output

```text
2.5
```

---

### Modulus Operator (%)

Returns remainder.

```cpp
cout << 10 % 3;
```

##### Output

```text
1
```

---

#### Common Uses

Check even/odd:

```cpp
if(num % 2 == 0)
{
    cout << "Even";
}
```

---

### Relational Operators

Used for comparisons.

---

| Operator | Meaning                  |
| -------- | ------------------------ |
| ==       | Equal To                 |
| !=       | Not Equal To             |
| >        | Greater Than             |
| <        | Less Than                |
| >=       | Greater Than or Equal To |
| <=       | Less Than or Equal To    |

---

#### Example

```cpp
cout << (10 > 5);
```

##### Output

```text
1
```

---

#### Example

```cpp
cout << (10 < 5);
```

##### Output

```text
0
```

---

### Important

Relational operators return:

```cpp
true
```

or

```cpp
false
```

which are displayed as:

```text
1
0
```

---

### Logical Operators

Used to combine multiple conditions.

---

| Operator | Meaning     |
| -------- | ----------- |
| &&       | Logical AND |
| \|\|     | Logical OR  |
| !        | Logical NOT |

---

### Logical AND (&&)

Returns true only if both conditions are true.

---

#### Example

```cpp
int age = 20;

cout << (age >= 18 && age <= 60);
```

##### Output

```text
1
```

---

### Logical OR (||)

Returns true if at least one condition is true.

---

#### Example

```cpp
cout << (10 > 5 || 5 > 10);
```

##### Output

```text
1
```

---

### Logical NOT (!)

Reverses the result.

---

#### Example

```cpp
cout << !(10 > 5);
```

##### Output

```text
0
```

---

### Assignment Operators

Used to assign values.

---

#### Basic Assignment

```cpp
int num = 10;
```

---

#### Compound Assignment Operators

| Operator | Meaning             |
| -------- | ------------------- |
| +=       | Add and Assign      |
| -=       | Subtract and Assign |
| \*=      | Multiply and Assign |
| /=       | Divide and Assign   |
| %=       | Modulus and Assign  |

---

#### Example

```cpp
int num = 10;

num += 5;

cout << num;
```

##### Output

```text
15
```

---

### Increment Operator (++)

Increases value by 1.

---

#### Example

```cpp
int x = 5;

x++;

cout << x;
```

##### Output

```text
6
```

---

### Decrement Operator (--)

Decreases value by 1.

---

#### Example

```cpp
int x = 5;

x--;

cout << x;
```

##### Output

```text
4
```

---

### Pre Increment

```cpp
++x
```

Increase first, then use.

---

#### Example

```cpp
int x = 5;

cout << ++x;
```

##### Output

```text
6
```

---

### Post Increment

```cpp
x++
```

Use first, then increase.

---

#### Example

```cpp
int x = 5;

cout << x++;
```

##### Output

```text
5
```

Final value of x:

```text
6
```

---

### Pre vs Post Increment

```cpp
int x = 5;

cout << ++x;
```

Output:

```text
6
```

---

```cpp
int x = 5;

cout << x++;
```

Output:

```text
5
```

---

### sizeof Operator

Returns memory occupied in bytes.

---

#### Example

```cpp
cout << sizeof(int);
```

##### Output

```text
4
```

---

#### Example

```cpp
double d;

cout << sizeof(d);
```

##### Output

```text
8
```

---

### Ternary Operator

Short form of if-else.

---

#### Syntax

```cpp
condition ? value1 : value2
```

---

#### Example

```cpp
int age = 20;

cout << (age >= 18 ? "Adult" : "Minor");
```

##### Output

```text
Adult
```

---

### Bitwise Operators (Introduction)

Operate directly on bits.

---

| Operator | Meaning     |
| -------- | ----------- |
| &        | AND         |
| \|       | OR          |
| ^        | XOR         |
| ~        | NOT         |
| <<       | Left Shift  |
| >>       | Right Shift |

---

#### Example

```cpp
cout << (5 & 3);
```

##### Output

```text
1
```

Because:

```text
5 = 101
3 = 011
---------
    001
```

---

#### Example

```cpp
cout << (5 | 3);
```

##### Output

```text
7
```

---

#### Example

```cpp
cout << (5 ^ 3);
```

##### Output

```text
6
```

---

### Operator Precedence

Not all operators execute in the same order.

---

#### Example

```cpp
cout << 10 + 5 * 2;
```

##### Output

```text
20
```

Because:

```text
5 * 2 = 10

10 + 10 = 20
```

---

### Using Parentheses

```cpp
cout << (10 + 5) * 2;
```

##### Output

```text
30
```

---

### Common Beginner Mistakes

---

#### Using = Instead of ==

Wrong

```cpp
if(age = 18)
```

---

Correct

```cpp
if(age == 18)
```

---

#### Expecting Decimal Result

```cpp
cout << 5 / 2;
```

Output:

```text
2
```

not:

```text
2.5
```

---

#### Confusing Pre and Post Increment

```cpp
int x = 5;

cout << x++;
```

Output:

```text
5
```

Many beginners expect:

```text
6
```

---

### Interview Questions

#### Q1. Difference between `=` and `==`?

##### Answer

```cpp
=
```

assigns value.

```cpp
==
```

compares values.

---

#### Q2. Output of `5 / 2`?

##### Answer

```text
2
```

because integer division truncates decimals.

---

#### Q3. Difference between `++x` and `x++`?

##### Answer

`++x` increments first.

`x++` uses current value first, then increments.

---

#### Q4. What does `%` do?

##### Answer

Returns remainder after division.

---

#### Q5. What does `sizeof()` return?

##### Answer

Memory occupied by a data type or variable in bytes.

---

### Cheat Sheet

```cpp
+
-
*
/
%
```

```cpp
==
!=
>
<
>=
<=
```

```cpp
&&
||
!
```

```cpp
=
+=
-=
*=
/=
```

```cpp
++
--
```

```cpp
sizeof(int)
```

```cpp
condition ? A : B
```

---

### Key Takeaways

- Operators perform operations on operands.
- Arithmetic operators perform mathematical calculations.
- Relational operators compare values.
- Logical operators combine conditions.
- Assignment operators store and update values.
- Increment and decrement operators change values by one.
- `sizeof()` returns memory size in bytes.
- The ternary operator is a compact form of if-else.
- Bitwise operators work directly on binary data.
- Understanding operators is essential before learning arrays, strings, functions, and pointers.

---