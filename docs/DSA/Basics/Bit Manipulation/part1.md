---
sidebar_label: 'Binary Number System Fundamentals'
sidebar_position: 1
---

# Binary Number System Fundamentals

> Computers understand only two states:
>
> ```text
> ON  → 1
> OFF → 0
> ```
>
> This foundational chapter explains how data is digitally encoded at the lowest level. Every number, character, and image is ultimately a sequence of 0s and 1s.

---

## What is Binary?

Binary is a number system with only:

```text
2 Digits

0
1
```

Unlike Decimal:

```text
Decimal → Base 10

Digits:
0 - 9
```

Binary is:

```text
Base 2

Digits:
0
1
```

---

## Decimal Number System

We use decimal numbers daily.

Example:

```text
572
```

Expands as:

```text
572

=
5 × 10²
+
7 × 10¹
+
2 × 10⁰
```

```text
=
500 + 70 + 2

=
572
```

---

## Binary Number System

Example:

```text
1011₂
```

Expands as:

```text
1 × 2³
+
0 × 2²
+
1 × 2¹
+
1 × 2⁰
```

```text
=
8 + 0 + 2 + 1

=
11
```

---

## Powers of 2

Memorizing powers of 2 is extremely important.

| Power | Value |
| ----- | ----- |
| 2⁰    | 1     |
| 2¹    | 2     |
| 2²    | 4     |
| 2³    | 8     |
| 2⁴    | 16    |
| 2⁵    | 32    |
| 2⁶    | 64    |
| 2⁷    | 128   |
| 2⁸    | 256   |
| 2⁹    | 512   |
| 2¹⁰   | 1024  |

---

## Binary Position Values

Consider:

```text
101101
```

Positions:

```text
Bit Position

5 4 3 2 1 0
↓ ↓ ↓ ↓ ↓ ↓

1 0 1 1 0 1
```

Weights:

```text
32 16 8 4 2 1
```

---

## Binary to Decimal Conversion

---

### Method

Multiply every bit with its corresponding power of 2.

---

### Example 1

Convert:

```text
1011₂
```

to decimal.

---

#### Step 1

Write powers of 2.

```text
Bit      1 0 1 1

Power    3 2 1 0
```

---

#### Step 2

Multiply.

```text
=
1 × 2³
+
0 × 2²
+
1 × 2¹
+
1 × 2⁰
```

---

#### Step 3

Calculate.

```text
=
8 + 0 + 2 + 1
```

```text
=
11
```

---

## Example 2

Convert:

```text
110101₂
```

---

```text
=
1 × 2⁵
+
1 × 2⁴
+
0 × 2³
+
1 × 2²
+
0 × 2¹
+
1 × 2⁰
```

---

```text
=
32 + 16 + 0 + 4 + 0 + 1
```

---

```text
=
53
```

---

## Binary to Decimal Code

```cpp
#include <iostream>
#include <cmath>
using namespace std;

int binaryToDecimal(int binary)
{
    int answer = 0;
    int power = 0;

    while(binary > 0)
    {
        int digit = binary % 10;

        answer += digit * pow(2, power);

        power++;

        binary /= 10;
    }

    return answer;
}

int main()
{
    cout << binaryToDecimal(1011);
}
```

#### Output

```text
11
```

---

## Complexity

#### Time Complexity

```text
O(N)
```

where:

```text
N = Number of Binary Digits
```

---

#### Space Complexity

```text
O(1)
```

---

## Decimal to Binary Conversion

---

### Method

Repeatedly divide by:

```text
2
```

and store remainders.

---

## Example 1

Convert:

```text
13
```

to binary.

---

#### Step 1

```text
13 / 2 = 6 remainder 1
```

---

#### Step 2

```text
6 / 2 = 3 remainder 0
```

---

#### Step 3

```text
3 / 2 = 1 remainder 1
```

---

#### Step 4

```text
1 / 2 = 0 remainder 1
```

---

Collected Remainders:

```text
1 0 1 1
```

Read from bottom to top:

```text
1101₂
```

---

## Visual Representation

```text
13

13 ÷ 2 = 6  r=1
6  ÷ 2 = 3  r=0
3  ÷ 2 = 1  r=1
1  ÷ 2 = 0  r=1

Bottom to Top

1101
```

---

## Example 2

Convert:

```text
25
```

---

```text
25 ÷ 2 = 12 r=1
12 ÷ 2 = 6  r=0
6  ÷ 2 = 3  r=0
3  ÷ 2 = 1  r=1
1  ÷ 2 = 0  r=1
```

Read bottom to top:

```text
11001₂
```

---

## Decimal to Binary Code

```cpp
#include <iostream>
using namespace std;

int decimalToBinary(int n)
{
    int answer = 0;
    int place = 1;

    while(n > 0)
    {
        int bit = n % 2;

        answer += bit * place;

        place *= 10;

        n /= 2;
    }

    return answer;
}

int main()
{
    cout << decimalToBinary(13);
}
```

#### Output

```text
1101
```

---

## Complexity

#### Time Complexity

```text
O(log₂ N)
```

Reason:

Every iteration divides the number by 2.

---

#### Space Complexity

```text
O(log₂ N)
```

if storing all binary digits.

---

## Understanding Bits

Each binary digit is called a:

```text
Bit
```

Example:

```text
1101
```

contains:

```text
4 bits
```

---

## Most Significant Bit (MSB)

Leftmost bit.

```text
1101
↑
MSB
```

---

## Least Significant Bit (LSB)

Rightmost bit.

```text
1101
   ↑
   LSB
```

---

## Binary Addition

Exactly like decimal addition.

---

## Rule 1

```text
0 + 0 = 0
```

---

## Rule 2

```text
0 + 1 = 1
```

---

## Rule 3

```text
1 + 0 = 1
```

---

## Rule 4

```text
1 + 1 = 10
```

Meaning:

```text
Result Bit = 0

Carry = 1
```

---

## Why?

Because:

```text
1 + 1 = 2
```

and:

```text
2 in binary = 10
```

---

## Binary Addition Example

Add:

```text
1011
+
0110
```

---

Step-by-Step:

```text
1 + 0 = 1

1 + 1 = 10
        ↑ Carry

0 + 1 + Carry(1)

= 10

1 + 0 + Carry(1)

= 10
```

Result:

```text
10001
```

---

## Verify

```text
1011 = 11

0110 = 6

11 + 6 = 17

17 = 10001₂
```

Correct.

---

## Why Binary Matters?

Every future topic depends on it.

Examples:

```text
Bitwise Operators

AND

OR

XOR

Shift Operators

Bit Masks

Set Bits

Power of 2 Checks

Bit Manipulation Problems
```

All operate directly on binary representation.

---

## Common Beginner Mistakes

---

### Reading Remainders Top to Bottom

Wrong:

```text
13

1
0
1
1
```

Reading:

```text
1011
```

Incorrect.

---

Always read:

```text
Bottom → Top
```

---

### Forgetting Powers of 2

Wrong:

```text
1011

=
1×8 + 0×4 + 1×1 + 1×0
```

---

Correct:

```text
1×8 + 0×4 + 1×2 + 1×1
```

---

### Confusing Decimal and Binary Digits

```text
1011
```

is not:

```text
One Thousand Eleven
```

It is:

```text
Binary Number
```

---

## Interview Questions

### Q1. What is binary?

#### Answer

A base-2 number system using only:

```text
0 and 1
```

---

### Q2. Why do computers use binary?

#### Answer

Electronic circuits naturally represent:

```text
ON  → 1

OFF → 0
```

---

### Q3. Time Complexity of Decimal → Binary Conversion?

#### Answer

```text
O(log₂N)
```

---

### Q4. Time Complexity of Binary → Decimal Conversion?

#### Answer

```text
O(N)
```

where:

```text
N = Number of Bits
```

---

### Q5. What are MSB and LSB?

#### Answer

```text
MSB → Leftmost Bit

LSB → Rightmost Bit
```

---

## Cheat Sheet

```text
Decimal → Binary

Repeated Division by 2
Read Remainders Bottom to Top
```

---

```text
Binary → Decimal

Multiply each bit
by corresponding power of 2
```

---

```text
1 + 1 = 10
```

---

```text
MSB → Leftmost Bit

LSB → Rightmost Bit
```

---

## Key Takeaways

- Binary uses only `0` and `1`.
- Computers store and process data using binary.
- Decimal to Binary uses repeated division by 2.
- Binary to Decimal uses powers of 2.
- Time Complexity of Decimal → Binary is `O(log₂N)`.
- Time Complexity of Binary → Decimal is `O(N)`.
- Every binary digit is called a bit.
- MSB is the leftmost bit.
- LSB is the rightmost bit.
- Understanding binary is essential before learning bitwise operators and bit manipulation.

---
