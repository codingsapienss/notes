---
sidebar_label: "Common Bit Manipulation Techniques"
sidebar_position: 4
---

# Common Bit Manipulation Techniques

> This chapter contains the most important bit manipulation tricks asked in coding interviews.
>
> Most of these operations can be performed in:
>
> ```text
> O(1)
> ```
>
> time using Bitwise Operators.
>
> These techniques form the foundation for:
>
> - Competitive Programming
> - DSA Interviews
> - Low-Level Programming
> - System Programming

---

## Binary Position Refresher

Consider:

```text
13
```

Binary:

```text
1101
```

Bit Positions:

```text
3 2 1 0

1 1 0 1
```

---

## Check if ith Bit is Set

---

### Problem

Determine whether:

```text
ith bit
```

is:

```text
1 (SET)
```

or

```text
0 (UNSET)
```

---

## Method 1 — Left Shift Mask

---

### Formula

```cpp
n & (1 << i)
```

---

### Logic

Create a mask having:

```text
Only ith bit = 1
```

---

Example:

```text
n = 13

1101
```

Check:

```text
i = 2
```

---

#### Step 1

Create Mask

```cpp
1 << 2
```

Binary:

```text
0100
```

---

#### Step 2

AND

```text
1101

0100
----
0100
```

---

Result:

```text
Non-Zero
```

Therefore:

```text
Bit is SET
```

---

## Code

```cpp
bool isSet(int n, int i)
{
    return (n & (1 << i)) != 0;
}
```

---

#### Example

```cpp
cout << isSet(13, 2);
```

Output:

```text
1
```

---

## Method 2 — Right Shift

---

### Formula

```cpp
(n >> i) & 1
```

---

### Logic

Bring the desired bit to the last position.

---

Example

```text
13

1101
```

Check:

```text
i = 2
```

---

#### Step 1

Shift

```text
1101 >> 2

0011
```

---

#### Step 2

AND with 1

```text
0011

0001
----
0001
```

---

Result:

```text
1
```

Bit is set.

---

## Code

```cpp
bool isSet(int n, int i)
{
    return ((n >> i) & 1);
}
```

---

## Complexity

| Complexity | Value |
| ---------- | ----- |
| Time       | O(1)  |
| Space      | O(1)  |

---

## Set ith Bit

---

### Problem

Make ith bit:

```text
1
```

regardless of its current value.

---

### Formula

```cpp
n | (1 << i)
```

---

## Example

```text
n = 9

1001
```

Set:

```text
i = 1
```

---

Mask:

```text
0010
```

---

OR

```text
1001

0010
----
1011
```

---

Result

```text
11
```

---

## Code

```cpp
int setBit(int n, int i)
{
    return n | (1 << i);
}
```

---

## Clear ith Bit

---

### Problem

Make ith bit:

```text
0
```

regardless of current value.

---

### Formula

```cpp
n & ~(1 << i)
```

---

## Example

```text
n = 13

1101
```

Clear:

```text
i = 2
```

---

Mask

```text
1 << 2

0100
```

---

Invert

```text
1011
```

---

AND

```text
1101

1011
----
1001
```

---

Result

```text
9
```

---

## Code

```cpp
int clearBit(int n, int i)
{
    return n & ~(1 << i);
}
```

---

## Toggle ith Bit

---

### Problem

Flip the bit.

---

Meaning:

```text
0 → 1

1 → 0
```

---

### Formula

```cpp
n ^ (1 << i)
```

---

## Example

```text
13

1101
```

Toggle:

```text
i = 2
```

Mask:

```text
0100
```

---

XOR

```text
1101

0100
----
1001
```

---

Result

```text
9
```

---

## Code

```cpp
int toggleBit(int n, int i)
{
    return n ^ (1 << i);
}
```

---

## Remove Rightmost Set Bit

One of the most famous tricks.

---

### Formula

```cpp
n & (n - 1)
```

---

## Example

```text
n = 12

1100
```

---

#### Step 1

```text
n-1

1011
```

---

#### Step 2

AND

```text
1100

1011
----
1000
```

---

Result

```text
8
```

---

## Why Does This Work?

Observation:

```text
n

xxxxx1000
```

---

```text
n-1

xxxxx0111
```

---

The first set bit gets removed.

---

## Code

```cpp
int removeLastSetBit(int n)
{
    return n & (n - 1);
}
```

---

## Check if Number is Power of 2

---

### Observation

Power of 2 always contains:

```text
Exactly One Set Bit
```

---

Examples

```text
1  = 0001

2  = 0010

4  = 0100

8  = 1000
```

---

Notice:

```text
n & (n-1)

always becomes 0
```

---

## Formula

```cpp
n > 0 &&
(n & (n - 1)) == 0
```

---

## Example

```text
8

1000
```

---

```text
7

0111
```

---

AND

```text
1000

0111
----
0000
```

---

Result

```text
Power of 2
```

---

## Code

```cpp
bool isPowerOfTwo(int n)
{
    return n > 0 &&
           (n & (n - 1)) == 0;
}
```

---

## Swap Two Numbers Without Extra Variable

---

### XOR Method

---

Initial

```text
a = 5

b = 7
```

---

#### Step 1

```cpp
a = a ^ b;
```

---

#### Step 2

```cpp
b = a ^ b;
```

---

Becomes

```text
(a ^ b) ^ b

= a
```

---

#### Step 3

```cpp
a = a ^ b;
```

Becomes

```text
(a ^ b) ^ a

= b
```

---

## Code

```cpp
int a = 5;
int b = 7;

a ^= b;
b ^= a;
a ^= b;
```

---

Result

```text
a = 7

b = 5
```

---

## Why XOR Swap is Rarely Used Today

Modern approach:

```cpp
swap(a, b);
```

is:

- More readable
- Compiler optimized
- Safer

---

## Extract Rightmost Set Bit

---

### Formula

```cpp
n & (-n)
```

---

## Example

```text
12

1100
```

---

Two's Complement:

```text
0100
```

---

AND

```text
1100

0100
----
0100
```

---

Result

```text
4
```

---

Meaning:

```text
Rightmost Set Bit
```

was isolated.

---

## Common Interview Questions

---

### Check Odd or Even

```cpp
n & 1
```

---

If:

```text
1
```

Odd.

---

If:

```text
0
```

Even.

---

## Multiply by 2

```cpp
n << 1
```

---

## Divide by 2

```cpp
n >> 1
```

---

## Multiply by 8

```cpp
n << 3
```

---

## Divide by 8

```cpp
n >> 3
```

---

## Summary Table

| Operation            | Formula        |
| -------------------- | -------------- | ------- |
| Check ith Bit        | `n & (1<<i)`   |
| Check ith Bit        | `(n>>i)&1`     |
| Set ith Bit          | `n             | (1<<i)` |
| Clear ith Bit        | `n & ~(1<<i)`  |
| Toggle ith Bit       | `n ^ (1<<i)`   |
| Remove Last Set Bit  | `n & (n-1)`    |
| Extract Last Set Bit | `n & (-n)`     |
| Power of 2           | `(n&(n-1))==0` |
| Odd Check            | `n & 1`        |

---

## Interview Questions

### Q1

How do you check whether the 5th bit is set?

```cpp
n & (1 << 5)
```

---

### Q2

How do you remove the rightmost set bit?

```cpp
n & (n - 1)
```

---

### Q3

How do you check if a number is a power of 2?

```cpp
(n & (n - 1)) == 0
```

---

### Q4

How do you toggle a bit?

```cpp
n ^ (1 << i)
```

---

### Q5

How do you set a bit?

```cpp
n | (1 << i)
```

---

## Cheat Sheet

```cpp
// Check Bit
n & (1 << i)
```

```cpp
// Set Bit
n | (1 << i)
```

```cpp
// Clear Bit
n & ~(1 << i)
```

```cpp
// Toggle Bit
n ^ (1 << i)
```

```cpp
// Remove Last Set Bit
n & (n - 1)
```

```cpp
// Extract Last Set Bit
n & (-n)
```

```cpp
// Power Of Two
(n & (n - 1)) == 0
```

---

## Key Takeaways

- Most common bit tricks are based on AND, OR, XOR and shifts.
- Checking, setting, clearing and toggling bits can all be done in O(1).
- `n & (n-1)` is one of the most important formulas in bit manipulation.
- A power of two contains exactly one set bit.
- XOR has powerful cancellation properties.
- Bit manipulation often converts seemingly complex problems into constant-time operations.
- These formulas are among the most frequently asked in coding interviews.

---
