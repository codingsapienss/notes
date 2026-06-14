---
sidebar_label: 'Counting Set Bits (Population Count)'
sidebar_position: 5
---

# Counting Set Bits (Population Count)

> Counting Set Bits is one of the most important topics in Bit Manipulation.
>
> A **Set Bit** means:
>
> ```text
> Bit = 1
> ```
>
> Example:
>
> ```text
> 13
> ```
>
> Binary:
>
> ```text
> 1101
> ```
>
> Number of set bits:
>
> ```text
> 3
> ```
>
> because:
>
> ```text
> 1 1 0 1
> ↑ ↑   ↑
> ```
>
> contains three `1`s.

---

## What is a Set Bit?

A bit having value:

```text
1
```

is called a:

```text
Set Bit
```

---

## What is an Unset Bit?

A bit having value:

```text
0
```

is called:

```text
Unset Bit
```

or

```text
Clear Bit
```

---

## Example

```text
13

Binary:

1101
```

---

Count:

```text
1 1 0 1

=
3 Set Bits
```

---

## Method 1 — Division by 2 (Basic Approach)

---

### Idea

Convert number into binary.

While converting:

```text
If remainder = 1

Count++
```

---

## Dry Run

Example:

```text
13
```

---

```text
13 % 2 = 1

Count = 1
```

---

```text
6 % 2 = 0

Count = 1
```

---

```text
3 % 2 = 1

Count = 2
```

---

```text
1 % 2 = 1

Count = 3
```

---

Result:

```text
3
```

---

## Code

```cpp
int countSetBits(int n)
{
    int count = 0;

    while(n > 0)
    {
        if(n % 2 == 1)
        {
            count++;
        }

        n /= 2;
    }

    return count;
}
```

---

### Example

```cpp
cout << countSetBits(13);
```

#### Output

```text
3
```

---

## Complexity

#### Time

```text
O(log₂N)
```

---

#### Space

```text
O(1)
```

---

## Method 2 — Right Shift Technique

Much more natural for Bit Manipulation.

---

### Idea

Check:

```text
Last Bit
```

using:

```cpp
n & 1
```

Then:

```cpp
n >>= 1
```

---

## Why Does It Work?

Last bit:

```text
1
```

means:

```text
Set Bit
```

---

Example

```text
13

1101
```

---

Last bit:

```text
1
```

---

Check:

```cpp
13 & 1
```

```text
1101

0001
----
0001
```

Result:

```text
1
```

---

## Dry Run

```text
13

1101
```

---

Iteration 1

```text
1101

Last Bit = 1

Count = 1
```

---

Shift

```text
0110
```

---

Iteration 2

```text
0110

Last Bit = 0
```

---

Shift

```text
0011
```

---

Iteration 3

```text
0011

Last Bit = 1

Count = 2
```

---

Shift

```text
0001
```

---

Iteration 4

```text
0001

Last Bit = 1

Count = 3
```

---

Result

```text
3
```

---

## Code

```cpp
int countSetBits(int n)
{
    int count = 0;

    while(n > 0)
    {
        count += (n & 1);

        n >>= 1;
    }

    return count;
}
```

---

## Complexity

| Complexity | Value    |
| ---------- | -------- |
| Time       | O(log₂N) |
| Space      | O(1)     |

---

## Method 3 — Brian Kernighan Algorithm

One of the most famous interview algorithms.

---

## Core Observation

Formula:

```cpp
n = n & (n - 1)
```

removes:

```text
Rightmost Set Bit
```

---

## Example

```text
12

1100
```

---

```text
11

1011
```

---

AND

```text
1100

1011
----
1000
```

---

Notice:

```text
One Set Bit Removed
```

---

## Idea

Instead of checking every bit:

```text
Remove one set bit at a time.
```

---

## Dry Run

Example:

```text
13

1101
```

---

Iteration 1

```text
1101

↓

1100
```

Count:

```text
1
```

---

Iteration 2

```text
1100

↓

1000
```

Count:

```text
2
```

---

Iteration 3

```text
1000

↓

0000
```

Count:

```text
3
```

---

Stop.

Result:

```text
3
```

---

## Code

```cpp
int countSetBits(int n)
{
    int count = 0;

    while(n)
    {
        count++;

        n = n & (n - 1);
    }

    return count;
}
```

---

## Complexity

#### Time

```text
O(Number of Set Bits)
```

---

Not:

```text
O(log N)
```

---

Example:

```text
1000000000000000
```

contains:

```text
1 set bit
```

Only:

```text
1 iteration
```

needed.

---

## Why Is This Better?

For sparse numbers:

```text
Very Few Set Bits
```

it is significantly faster.

---

## Method 4 — STL Built-in Function

C++ provides optimized CPU-level implementations.

---

## For int

```cpp
__builtin_popcount(n)
```

---

Example

```cpp
cout << __builtin_popcount(13);
```

Output:

```text
3
```

---

## For long long

```cpp
__builtin_popcountll(n)
```

---

Example

```cpp
long long num = 10000000000LL;

cout << __builtin_popcountll(num);
```

---

## Complexity

Typically:

```text
O(1)
```

or

```text
Very Fast Hardware Optimized
```

depending on architecture.

---

## Comparison of All Methods

| Method          | Time Complexity | Space |
| --------------- | --------------- | ----- |
| Division by 2   | O(log₂N)        | O(1)  |
| Right Shift     | O(log₂N)        | O(1)  |
| Brian Kernighan | O(Set Bits)     | O(1)  |
| STL Popcount    | Optimized       | O(1)  |

---

## Which Method Should You Use?

---

### Interview

Use:

```cpp
Brian Kernighan
```

because it demonstrates understanding.

---

### Production Code

Use:

```cpp
__builtin_popcount()
```

when available.

---

## Special Case — Count Set Bits from 1 to N

Example:

```text
1 → 5
```

---

```text
1 = 1     → 1

2 = 10    → 1

3 = 11    → 2

4 = 100   → 1

5 = 101   → 2
```

---

Total:

```text
7
```

---

This is a separate advanced problem often asked in interviews.

---

## Common Mistakes

---

### Forgetting Parentheses

Wrong

```cpp
n & n - 1
```

---

Correct

```cpp
n & (n - 1)
```

---

## Infinite Loop

Wrong

```cpp
while(n)
{
    count++;
}
```

---

Missing:

```cpp
n = n & (n - 1);
```

---

## Using popcount for long long

Wrong

```cpp
__builtin_popcount(num);
```

when:

```cpp
num = long long
```

---

Correct

```cpp
__builtin_popcountll(num);
```

---

## Interview Questions

### Q1

How do you count set bits using Bit Manipulation?

#### Answer

```cpp
while(n)
{
    count++;

    n &= (n - 1);
}
```

---

### Q2

What does:

```cpp
n & (n - 1)
```

do?

#### Answer

Removes the rightmost set bit.

---

### Q3

Which counting set bits algorithm is most famous?

#### Answer

```text
Brian Kernighan Algorithm
```

---

### Q4

Time complexity of Brian Kernighan?

#### Answer

```text
O(Number of Set Bits)
```

---

### Q5

Best STL function?

#### Answer

```cpp
__builtin_popcount()

__builtin_popcountll()
```

---

## Cheat Sheet

```cpp
// Method 1
n % 2
n /= 2
```

---

```cpp
// Method 2
n & 1

n >>= 1
```

---

```cpp
// Method 3
n &= (n - 1)
```

---

```cpp
// STL
__builtin_popcount(n)
```

---

```cpp
// STL long long
__builtin_popcountll(n)
```

---

## Key Takeaways

- A Set Bit is a bit having value `1`.
- Counting set bits is one of the most common bit manipulation problems.
- Division and Right Shift methods both work in `O(log₂N)`.
- Brian Kernighan's Algorithm works in `O(Number of Set Bits)`.
- `n & (n-1)` removes the rightmost set bit.
- `__builtin_popcount()` is the fastest and simplest solution in C++.
- Understanding set bit counting is essential for many advanced interview problems.

---
