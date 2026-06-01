---
sidebar_label: 'Data Representation in Memory'
sidebar_position: 2
---

# Data Representation: Bit-Level Storage

> Most developers learn Binary and Bitwise Operators, but very few understand how numbers are actually stored inside memory.
>
> This chapter explains what happens at the bit level when storing:
>
> - Integers
> - Negative Numbers
> - Floating Point Numbers
> - Characters
> - Boolean Values
> - Signed and Unsigned Types
>
> Understanding this chapter makes topics like:
>
> ```text
> Bit Manipulation
> Pointers
> Memory Management
> Low Level Programming
> System Design
> ```
>
> much easier.

---

# Memory Refresher

Memory is ultimately a collection of bits.

```text
Bit

0
or
1
```

---

## Byte

```text
1 Byte = 8 Bits
```

---

Example:

```text
01000001
```

contains:

```text
8 bits
=
1 byte
```

---

# How Data is Stored

When we write:

```cpp
int num = 5;
```

the compiler allocates:

```text
4 Bytes
=
32 Bits
```

for an integer.

---

Memory:

```text
00000000 00000000 00000000 00000101
```

---

Notice:

```text
5 = 101
```

but memory stores:

```text
00000000 00000000 00000000 00000101
```

---

# Why Extra Zeros?

Because:

```cpp
int
```

occupies:

```text
32 bits
```

on most modern systems.

---

Therefore:

```text
101
```

must be padded.

---

Example

```cpp
int num = 13;
```

Binary:

```text
1101
```

Stored as:

```text
00000000 00000000 00000000 00001101
```

---

# Data Type Sizes

| Type      | Typical Size |
| --------- | ------------ |
| bool      | 1 Byte       |
| char      | 1 Byte       |
| short     | 2 Bytes      |
| int       | 4 Bytes      |
| long      | 4/8 Bytes    |
| long long | 8 Bytes      |
| float     | 4 Bytes      |
| double    | 8 Bytes      |

---

# How char is Stored

Example:

```cpp
char ch = 'A';
```

ASCII:

```text
A = 65
```

Binary:

```text
01000001
```

Memory:

```text
01000001
```

---

# How bool is Stored

```cpp
bool flag = true;
```

Internally:

```text
00000001
```

---

```cpp
bool flag = false;
```

Internally:

```text
00000000
```

---

# How int is Stored

Example:

```cpp
int num = 13;
```

Binary:

```text
1101
```

Stored:

```text
00000000
00000000
00000000
00001101
```

Total:

```text
32 Bits
```

---

# How long long is Stored

Example:

```cpp
long long num = 13;
```

Memory:

```text
00000000 00000000
00000000 00000000
00000000 00000000
00000000 00001101
```

Total:

```text
64 Bits
```

---

# Signed vs Unsigned Numbers

Integers can be:

```cpp
signed
```

or

```cpp
unsigned
```

---

# Signed Integer

Can store:

```text
Positive
Negative
```

numbers.

---

Example

```cpp
int num = -10;
```

---

# Unsigned Integer

Stores only:

```text
Positive Numbers
```

---

Example

```cpp
unsigned int num = 10;
```

---

# Why Unsigned Exists?

Normally:

```text
1 bit
```

is reserved for sign.

---

Unsigned uses all bits for value storage.

Therefore:

```text
Larger Positive Range
```

---

# Integer Range Formula

For n bits:

---

## Signed

```text
-(2^(n-1))
to
(2^(n-1))-1
```

---

## Unsigned

```text
0
to
(2^n)-1
```

---

# Integer Ranges

## int (32 bit)

### Signed

```text
-2147483648

to

2147483647
```

---

### Unsigned

```text
0

to

4294967295
```

---

# long long (64 bit)

### Signed

```text
-9223372036854775808

to

9223372036854775807
```

---

### Unsigned

```text
0

to

18446744073709551615
```

---

# Binary Addition

Everything inside CPU happens using binary arithmetic.

---

# Rule 1

```text
0 + 0 = 0
```

---

# Rule 2

```text
0 + 1 = 1
```

---

# Rule 3

```text
1 + 0 = 1
```

---

# Rule 4

```text
1 + 1 = 10
```

Meaning:

```text
Result = 0

Carry = 1
```

---

# Example

```text
1
+
1
```

Result:

```text
10
```

---

Because:

```text
Decimal:

1 + 1 = 2

Binary:

2 = 10
```

---

# Example

```text
101
+
011
```

---

```text
 101
+011
----
1000
```

---

Verify:

```text
5 + 3 = 8
```

Correct.

---

# One's Complement

One's Complement means:

```text
Flip every bit
```

---

Example

```text
00000101
```

becomes:

```text
11111010
```

---

Rule:

```text
0 → 1

1 → 0
```

---

# Why Was One's Complement Introduced?

To represent:

```text
Negative Numbers
```

---

But it had a problem.

---

Example:

```text
+0 = 00000000

-0 = 11111111
```

Two zeros existed.

---

This caused complications.

---

Therefore:

```text
Two's Complement
```

was introduced.

---

# Two's Complement

Most important concept in Computer Science.

---

## Definition

To get Two's Complement:

### Step 1

Find One's Complement

---

### Step 2

Add 1

---

# Example

Represent:

```text
-5
```

---

Positive 5:

```text
00000101
```

---

One's Complement:

```text
11111010
```

---

Add 1:

```text
11111011
```

---

Result:

```text
-5
```

stored as:

```text
11111011
```

---

# Why Two's Complement?

Because:

```text
Only One Representation of Zero
```

exists.

---

```text
00000000
```

---

And arithmetic becomes much simpler for CPUs.

---

# How Negative Numbers Are Stored

Example:

```cpp
int num = -5;
```

---

Step 1

```text
5

00000101
```

---

Step 2

One's Complement

```text
11111010
```

---

Step 3

Add 1

```text
11111011
```

---

Stored Memory:

```text
11111011
```

---

# How Computer Reads Negative Numbers

Suppose memory contains:

```text
11111011
```

---

Check MSB:

```text
1
```

---

Meaning:

```text
Negative Number
```

---

Now:

### Step 1

Two's Complement Again

```text
11111011
```

---

One's Complement:

```text
00000100
```

---

Add 1:

```text
00000101
```

---

Result:

```text
5
```

Therefore:

```text
-5
```

---

# Sign Bit

Most Significant Bit (MSB)

acts as sign indicator.

---

Example

```text
01111111
```

MSB:

```text
0
```

Positive.

---

```text
11111111
```

MSB:

```text
1
```

Negative.

---

# Floating Point Numbers

Integers are easy.

Decimals are much harder.

---

Example

```cpp
float x = 5.75f;
```

---

Memory cannot store:

```text
5.75
```

directly.

---

Instead it uses:

```text
IEEE 754 Representation
```

---

# IEEE 754 (float)

A float uses:

```text
32 bits
```

divided into:

```text
1 Bit  → Sign

8 Bits → Exponent

23 Bits → Mantissa
```

---

Structure:

```text
┌────┬──────────┬──────────────────────┐
│Sign│Exponent  │ Mantissa             │
└────┴──────────┴──────────────────────┘

1      8              23
```

---

# Example

```cpp
float x = 5.75;
```

Internally stored approximately as:

```text
Sign
Exponent
Mantissa
```

not as:

```text
5.75
```

directly.

---

# Why Floating Point Errors Occur

Example:

```cpp
double x = 0.1;
double y = 0.2;

cout << x + y;
```

Output may be:

```text
0.30000000000000004
```

---

Reason:

```text
0.1

cannot be represented
exactly in binary.
```

---

# Largest Values of Common Types

| Type      | Signed Range              |
| --------- | ------------------------- |
| char      | -128 to 127               |
| short     | -32768 to 32767           |
| int       | -2147483648 to 2147483647 |
| long long | ±9.22 × 10¹⁸              |
| float     | ~3.4 × 10³⁸               |
| double    | ~1.7 × 10³⁰⁸              |

---

# Common Interview Questions

## Why Two's Complement Is Used?

Answer:

```text
1. Only one representation of zero

2. Easier arithmetic

3. Faster CPU operations
```

---

## How Many Bits Are In An int?

Usually:

```text
32 Bits
```

---

## How Are Negative Numbers Stored?

Using:

```text
Two's Complement
```

---

## Why Does Floating Point Precision Error Occur?

Because many decimal fractions cannot be represented exactly in binary.

---

# Cheat Sheet

```text
1 Byte = 8 Bits
```

---

```text
int

32 Bits
```

---

```text
long long

64 Bits
```

---

```text
One's Complement

Flip Bits
```

---

```text
Two's Complement

Flip Bits
+
Add 1
```

---

```text
MSB = Sign Bit
```

---

```text
Positive MSB = 0

Negative MSB = 1
```

---

# Key Takeaways

- Memory stores everything as bits.
- Integers are stored using binary representation.
- Extra leading zeros are added to fill available bits.
- Signed numbers use Two's Complement representation.
- One's Complement simply flips bits.
- Two's Complement = One's Complement + 1.
- Negative numbers are stored using Two's Complement.
- Floating point numbers use IEEE 754 representation.
- Floating point precision errors are normal and expected.
- Understanding memory representation is essential before learning Bitwise Operators.

---
