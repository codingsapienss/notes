---
sidebar_label: 'Interview Problems Using Bit Manipulation'
sidebar_position: 6
---

# Bit Manipulation & Binary

# Part 6F — Interview Problems Using Bit Manipulation

> This chapter combines everything learned so far:
>
> - Binary Representation
> - XOR
> - AND
> - Set Bits
> - Bit Masks
> - Power of 2 Concepts
>
> These are among the most frequently asked Bit Manipulation interview questions.

---

# Problem 1 — Minimum Bit Flips to Convert a Number

---

## Problem Statement

Given:

```text
start = 10
goal  = 7
```

Find minimum bit flips required to convert:

```text
10 → 7
```

---

# Observation

A bit needs flipping only when:

```text
Bits are different.
```

---

# XOR Property

```text
Same Bits      → 0

Different Bits → 1
```

Therefore:

```cpp
start ^ goal
```

directly tells us:

```text
Which bits differ.
```

---

# Example

```text
start = 10

1010
```

---

```text
goal = 7

0111
```

---

XOR

```text
1010

0111
----
1101
```

---

Count Set Bits

```text
1101
```

contains:

```text
3 set bits
```

---

Answer

```text
3
```

---

# Code

```cpp
int minBitFlips(int start, int goal)
{
    int diff = start ^ goal;

    return __builtin_popcount(diff);
}
```

---

## Complexity

### Time

```text
O(log(start ^ goal))
```

---

### Space

```text
O(1)
```

---

# Problem 2 — Power Set Using Bit Manipulation

---

## Problem Statement

Given:

```text
[1,2,3]
```

Generate all subsets.

---

# Observation

For:

```text
n elements
```

there are:

```text
2^n subsets
```

---

# Binary Representation

For:

```text
n = 3
```

Masks:

```text
000
001
010
011
100
101
110
111
```

---

Each bit decides:

```text
Include Element ?

1 → Yes

0 → No
```

---

# Example

Mask:

```text
101
```

---

Array:

```text
[1,2,3]
```

---

Interpretation

```text
1 → Include 1

0 → Skip 2

1 → Include 3
```

---

Subset:

```text
[1,3]
```

---

# Complete Dry Run

| Mask | Subset  |
| ---- | ------- |
| 000  | []      |
| 001  | [1]     |
| 010  | [2]     |
| 011  | [1,2]   |
| 100  | [3]     |
| 101  | [1,3]   |
| 110  | [2,3]   |
| 111  | [1,2,3] |

---

# Code

```cpp
vector<vector<int>> subsets(vector<int>& nums)
{
    int n = nums.size();

    vector<vector<int>> answer;

    for(int mask = 0; mask < (1 << n); mask++)
    {
        vector<int> subset;

        for(int i = 0; i < n; i++)
        {
            if(mask & (1 << i))
            {
                subset.push_back(nums[i]);
            }
        }

        answer.push_back(subset);
    }

    return answer;
}
```

---

# Complexity

### Time

```text
O(N × 2^N)
```

---

### Space

```text
O(2^N)
```

---

# Problem 3 — Single Number I

---

## Problem Statement

Every element appears:

```text
Twice
```

except one element.

Find that element.

---

Example

```text
[4,1,2,1,2]
```

Answer:

```text
4
```

---

# Brute Force

Use Hash Map.

---

### Complexity

```text
O(N)
```

Space:

```text
O(N)
```

---

# Optimal XOR Solution

---

# Key Property

```text
A ^ A = 0

A ^ 0 = A
```

---

Example

```text
4 ^ 1 ^ 2 ^ 1 ^ 2
```

---

Rearrange

```text
4 ^ (1 ^ 1) ^ (2 ^ 2)
```

---

```text
4 ^ 0 ^ 0
```

---

```text
4
```

---

# Code

```cpp
int singleNumber(vector<int>& nums)
{
    int answer = 0;

    for(int num : nums)
    {
        answer ^= num;
    }

    return answer;
}
```

---

# Complexity

### Time

```text
O(N)
```

---

### Space

```text
O(1)
```

---

# Problem 4 — Single Number II

---

## Problem Statement

Every element appears:

```text
3 times
```

except one element.

Find that unique element.

---

Example

```text
[2,2,2,5]
```

Answer:

```text
5
```

---

# Brute Force

Hash Map.

---

Time:

```text
O(N)
```

Space:

```text
O(N)
```

---

# Better Bit Counting Solution

---

## Observation

If every number appears:

```text
3 times
```

then every bit count should be:

```text
Multiple of 3
```

except bits belonging to the unique number.

---

Example

```text
2 = 0010

2 = 0010

2 = 0010

5 = 0101
```

---

Bit Count

```text
Position 0 → 1

Position 1 → 3

Position 2 → 1

Position 3 → 0
```

---

Take:

```text
count % 3
```

---

Remaining bits form:

```text
0101
```

which is:

```text
5
```

---

# Code

```cpp
int singleNumber(vector<int>& nums)
{
    int answer = 0;

    for(int bit = 0; bit < 32; bit++)
    {
        int count = 0;

        for(int num : nums)
        {
            if(num & (1 << bit))
            {
                count++;
            }
        }

        if(count % 3)
        {
            answer |= (1 << bit);
        }
    }

    return answer;
}
```

---

# Complexity

### Time

```text
O(32 × N)

≈ O(N)
```

---

### Space

```text
O(1)
```

---

# Problem 5 — Single Number III

---

## Problem Statement

Every number appears:

```text
Twice
```

except:

```text
Two Numbers
```

which appear once.

---

Example

```text
[1,2,1,3,2,5]
```

Answer:

```text
[3,5]
```

---

# Step 1

Take XOR of all numbers.

---

```text
1 ^ 2 ^ 1 ^ 3 ^ 2 ^ 5
```

Pairs cancel.

---

Result:

```text
3 ^ 5
```

---

Assume:

```text
3 = 011

5 = 101
```

---

```text
3 ^ 5

110
```

---

# Step 2

Find Rightmost Set Bit

```cpp
mask = xorValue & (-xorValue);
```

---

Example

```text
110
```

Rightmost Set Bit:

```text
010
```

---

# Why?

Because:

```text
3 and 5 differ here.
```

---

# Step 3

Create Two Buckets

Group numbers by:

```text
Set
or
Unset
```

at that bit.

---

Bucket 1

```text
1
1
5
```

---

Bucket 2

```text
2
2
3
```

---

Now XOR each bucket separately.

Pairs disappear.

---

Result:

```text
3

5
```

---

# Code

```cpp
vector<int> singleNumber(vector<int>& nums)
{
    int xorAll = 0;

    for(int num : nums)
    {
        xorAll ^= num;
    }

    int mask = xorAll & (-xorAll);

    int a = 0;
    int b = 0;

    for(int num : nums)
    {
        if(num & mask)
        {
            a ^= num;
        }
        else
        {
            b ^= num;
        }
    }

    return {a, b};
}
```

---

# Complexity

### Time

```text
O(N)
```

---

### Space

```text
O(1)
```

---

# Comparison Table

| Problem           | Optimal Technique    |
| ----------------- | -------------------- |
| Min Bit Flips     | XOR + Count Set Bits |
| Power Set         | Bit Masking          |
| Single Number I   | XOR                  |
| Single Number II  | Bit Counting         |
| Single Number III | XOR + Bucket Split   |

---

# Pattern Recognition Cheat Sheet

---

## Every Number Appears Twice

Think:

```text
XOR
```

---

## Two Unique Numbers

Think:

```text
XOR + Buckets
```

---

## Three Times Except One

Think:

```text
Bit Counting
```

---

## Generate Subsets

Think:

```text
Bit Masking
```

---

## Compare Two Numbers Bit by Bit

Think:

```text
XOR
```

---

# Common Interview Questions

## Q1

Why does XOR solve Single Number I?

### Answer

```text
A ^ A = 0

A ^ 0 = A
```

---

## Q2

Why does Power Set contain 2^N subsets?

### Answer

Each element has:

```text
2 choices

Take
Skip
```

---

## Q3

How do you isolate the rightmost set bit?

### Answer

```cpp
n & (-n)
```

---

## Q4

How do you count differing bits between two numbers?

### Answer

```cpp
start ^ goal
```

then count set bits.

---

## Q5

Which bit manipulation problem appears most frequently?

### Answer

```text
Single Number
```

variants.

---

# Key Takeaways

- XOR is the most important operator for interview problems.
- Power Set generation is based on bit masking.
- Single Number I is solved using XOR cancellation.
- Single Number II is solved using bit counting.
- Single Number III is solved using XOR bucket partitioning.
- Minimum Bit Flips uses XOR + Popcount.
- Recognizing patterns is more important than memorizing solutions.
- Most bit manipulation interview problems reduce to a few core identities.

---
