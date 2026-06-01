---
sidebar_label: 'Bitwise Operators'
sidebar_position: 3
---

# Bitwise Operators: The Logic of Bits

> Bitwise operators work directly on the binary representation of numbers.
>
> Instead of operating on decimal values:
>
> ```cpp
> 10 + 5
> ```
>
> Bitwise operators operate on:
>
> ```text
> 1010
> 0101
> ```
>
> at the bit level.
>
> This makes them extremely fast and heavily used in:
>
> - Competitive Programming
> - Operating Systems
> - Embedded Systems
> - Networking
> - Game Engines
> - Interview Problems

---

# What are Bitwise Operators?

Bitwise operators manipulate individual bits.

For example:

```cpp
5 & 3
```

does NOT work on:

```text
5 and 3
```

directly.

It first converts them into binary:

```text
5 = 101

3 = 011
```

Then performs the operation bit by bit.

---

# Available Bitwise Operators

| Operator | Name        |
| -------- | ----------- |
| &        | AND         |
| \|       | OR          |
| ^        | XOR         |
| ~        | NOT         |
| <<       | Left Shift  |
| >>       | Right Shift |

---

# Binary Refresher

Example:

```text
13
```

Binary:

```text
1101
```

---

Positions:

```text
Bit Position

3 2 1 0

1 1 0 1
```

---

# Bitwise AND (&)

---

## Rule

```text
Both bits must be 1

to produce 1
```

Otherwise:

```text
0
```

---

# Truth Table

| A   | B   | A & B |
| --- | --- | ----- |
| 0   | 0   | 0     |
| 0   | 1   | 0     |
| 1   | 0   | 0     |
| 1   | 1   | 1     |

---

# Example

```cpp
5 & 3
```

---

Convert to Binary

```text
5 = 101

3 = 011
```

---

Perform AND

```text
 101
&011
----
 001
```

---

Result

```text
1
```

---

## Code

```cpp
#include <iostream>
using namespace std;

int main()
{
    cout << (5 & 3);
}
```

### Output

```text
1
```

---

# Why?

```text
1 & 1 = 1

0 & 1 = 0

1 & 0 = 0
```

---

# Common Uses of AND

## Check if Number is Even

```cpp
if((n & 1) == 0)
{
    cout << "Even";
}
```

---

Reason:

```text
Even Number

Last Bit = 0
```

---

Example

```text
10

1010
```

---

```cpp
10 & 1
```

```text
1010
0001
----
0000
```

Result:

```text
0
```

Even.

---

# Bitwise OR (|)

---

## Rule

```text
At least one bit must be 1
```

---

# Truth Table

| A   | B   | A \| B |
| --- | --- | ------ |
| 0   | 0   | 0      |
| 0   | 1   | 1      |
| 1   | 0   | 1      |
| 1   | 1   | 1      |

---

# Example

```cpp
5 | 3
```

---

Binary

```text
5 = 101

3 = 011
```

---

Operation

```text
 101
|011
----
 111
```

---

Result

```text
7
```

---

## Code

```cpp
cout << (5 | 3);
```

### Output

```text
7
```

---

# Common Use

Set a Bit

Covered in Part 6D.

---

# Bitwise XOR (^)

---

## Rule

```text
Same Bits     → 0

Different Bits → 1
```

---

# Truth Table

| A   | B   | A ^ B |
| --- | --- | ----- |
| 0   | 0   | 0     |
| 0   | 1   | 1     |
| 1   | 0   | 1     |
| 1   | 1   | 0     |

---

# Important Shortcut

```text
XOR of same bits = 0
```

---

Example

```text
1 ^ 1 = 0

0 ^ 0 = 0
```

---

# Example

```cpp
5 ^ 3
```

Binary

```text
101

011
```

---

Operation

```text
101
011
---
110
```

---

Result

```text
6
```

---

# Code

```cpp
cout << (5 ^ 3);
```

### Output

```text
6
```

---

# Extremely Important XOR Properties

---

## Property 1

```text
A ^ A = 0
```

Example:

```cpp
7 ^ 7
```

Output:

```text
0
```

---

## Property 2

```text
A ^ 0 = A
```

Example:

```cpp
10 ^ 0
```

Output:

```text
10
```

---

## Property 3

```text
A ^ B ^ B = A
```

Example:

```text
5 ^ 3 ^ 3

= 5
```

---

## Property 4

Order Doesn't Matter

```text
A ^ B

=
B ^ A
```

---

# Why XOR Is Famous?

Many interview questions are solved using XOR.

Example:

```text
Single Number

Missing Number

Swap Without Temp
```

---

# Bitwise NOT (~)

---

## Rule

Flip Every Bit

```text
0 → 1

1 → 0
```

---

# Example

```cpp
~5
```

---

Step 1

```text
5

00000101
```

---

Step 2

Flip Bits

```text
11111010
```

---

Step 3

Interpret Result

Using Two's Complement.

---

Two's Complement Again:

```text
11111010
```

One's Complement:

```text
00000101
```

Add 1:

```text
00000110
```

```text
=
6
```

Therefore:

```text
~5 = -6
```

---

# Shortcut Formula

```text
~n = -(n + 1)
```

---

Examples

```cpp
~5
```

```text
-6
```

---

```cpp
~10
```

```text
-11
```

---

# NOT with Negative Number

Example:

```cpp
~(-5)
```

---

Step 1

Store -5

```text
00000101

↓

11111011
```

(Two's Complement)

---

Step 2

Apply NOT

```text
00000100
```

---

Result

```text
4
```

---

# Right Shift (>>)

Moves bits towards right.

---

# Formula

```text
x >> k

≈ x / (2^k)
```

For positive numbers.

---

# Example

```cpp
13 >> 1
```

---

Binary

```text
13

1101
```

---

Shift Right

```text
1101

↓

0110
```

---

Result

```text
6
```

---

Verification

```text
13 / 2 = 6
```

---

# Example

```cpp
13 >> 2
```

---

Binary

```text
1101
```

Shift

```text
0011
```

---

Result

```text
3
```

---

Verification

```text
13 / 4 = 3
```

---

# Code

```cpp
cout << (13 >> 1);
```

Output:

```text
6
```

---

```cpp
cout << (13 >> 2);
```

Output:

```text
3
```

---

# Left Shift (<<)

Moves bits towards left.

---

# Formula

```text
x << k

≈ x × (2^k)
```

---

# Example

```cpp
13 << 1
```

---

Binary

```text
1101
```

---

Shift

```text
11010
```

---

Result

```text
26
```

---

Verification

```text
13 × 2 = 26
```

---

# Example

```cpp
13 << 2
```

---

Binary

```text
1101
```

---

Shift

```text
110100
```

---

Result

```text
52
```

---

Verification

```text
13 × 4 = 52
```

---

# Why Does Shift Work?

Consider:

```text
1101

=
8 + 4 + 1
```

---

After Left Shift:

```text
11010
```

Now:

```text
16 + 8 + 2
```

Every bit's weight doubled.

Therefore:

```text
Multiply by 2
```

---

# Important Warning

Avoid:

```cpp
1 << 31
```

for signed integers.

Reason:

```text
May cause Undefined Behavior
```

---

Safer:

```cpp
1LL << 31
```

---

# Operator Precedence

Bitwise operators have lower precedence than arithmetic operators.

---

Example

```cpp
cout << 5 + 3 & 1;
```

Interpreted as:

```cpp
(5 + 3) & 1
```

---

Always use:

```cpp
(5 & 3)
```

for clarity.

---

# Common Interview Questions

---

## Why is XOR Used for Single Number Problems?

Because:

```text
A ^ A = 0
```

and

```text
A ^ 0 = A
```

---

## Why Does Right Shift Divide By 2?

Because every bit moves to a position having half the weight.

---

## Why Does Left Shift Multiply By 2?

Because every bit moves to a position having double the weight.

---

## What is ~5?

```text
-6
```

---

## What is 5 ^ 5?

```text
0
```

---

# Cheat Sheet

---

## AND

```cpp
A & B
```

```text
1 & 1 = 1
```

---

## OR

```cpp
A | B
```

```text
1 | 0 = 1
```

---

## XOR

```cpp
A ^ B
```

```text
1 ^ 1 = 0
```

---

## NOT

```cpp
~A
```

```text
Flip Bits
```

---

## Right Shift

```cpp
A >> k
```

```text
≈ A / 2^k
```

---

## Left Shift

```cpp
A << k
```

```text
≈ A × 2^k
```

---

# Key Takeaways

- Bitwise operators work directly on binary representations.
- `&` returns 1 only when both bits are 1.
- `|` returns 1 if at least one bit is 1.
- `^` returns 1 when bits differ.
- `A ^ A = 0` is one of the most important XOR properties.
- `~` flips every bit.
- `~n = -(n+1)` for signed integers.
- Right shift generally divides by powers of two.
- Left shift generally multiplies by powers of two.
- XOR is the foundation of many interview-level bit manipulation problems.

---
