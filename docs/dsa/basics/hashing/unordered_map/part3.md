# Collisions, Chaining & Rehashing

> In previous lession, we learned that a **Hash Function** converts a key into a bucket index.
>
> But what happens if **two different keys generate the same bucket index?**
>
> This situation is called a **Collision**.
>
> Collision handling is one of the most important concepts behind `unordered_map`.

---

# What is a Collision?

A **Collision** occurs when **two or more different keys** are mapped to the **same bucket** by the hash function.

Example

```text
Hash Function

key % 10
```

Keys

```text
15

25

35
```

Calculation

```text
15 % 10 = 5

25 % 10 = 5

35 % 10 = 5
```

All three keys map to

```text
Bucket 5
```

This is called a

```text
Collision
```

---

# Why Do Collisions Happen?

A hash table has a **fixed number of buckets**.

Example

```text
Buckets

0

1

2

3

4

5

6

7

8

9
```

Only

```text
10 Buckets
```

But there can be

```text
100

1000

100000
```

different keys.

Since many keys are mapped into a limited number of buckets,

collisions are **unavoidable**.

---

# Visual Example

Hash Function

```text
key % 10
```

Insert

```text
12

22

42

35

17
```

Calculation

```text
12 → 2

22 → 2

42 → 2

35 → 5

17 → 7
```

Result

```text
Bucket

0

1

2 → 12
   → 22
   → 42

3

4

5 → 35

6

7 → 17

8

9
```

Notice

```text
12

22

42
```

all collide.

---

# How Does unordered_map Handle Collisions?

The most common technique is

```text
Separate Chaining

(Linear Chaining)
```

Instead of storing only one element in a bucket,

each bucket stores a

```text
Linked List
```

or another dynamic container.

Visualization

```text
Bucket

2

↓

12

↓

22

↓

42

↓

NULL
```

---

# Searching

Suppose we need

```text
22
```

Step 1

Hash Function

```text
22 % 10

↓

2
```

Go to

```text
Bucket 2
```

---

Step 2

Traverse the chain

```text
12

↓

22

↓

42
```

Found

```text
22
```

---

# Why is Average Time Complexity O(1)?

Most of the time,

a good hash function distributes keys

evenly.

Example

```text
Bucket

0 → 12

1 → 45

2 → 19

3 → 87

4 → 61

5 → 29

6 → 90

7 → 33

8 → 70

9 → 15
```

Each bucket contains only a few elements.

Searching becomes

```text
Hash Function

↓

One Small Bucket

↓

Done
```

Time

```text
O(1)
```

Average.

---

# Worst Case

Imagine a poor hash function.

Every key maps to

```text
Bucket 0
```

Visualization

```text
Bucket

0

↓

10

↓

20

↓

30

↓

40

↓

50

↓

60
```

Searching

```text
10

↓

20

↓

30

↓

40

↓

50

↓

60
```

Time

```text
O(N)
```

---

# Why Does Worst Case Rarely Happen?

Modern STL implementations use

- High-quality hash functions
- Dynamic resizing
- Rehashing

to minimize collisions.

Therefore,

the worst case is **possible**, but **rare** under normal conditions.

---

# What is a Load Factor?

The **Load Factor** measures how full the hash table is.

Formula

```text
Load Factor

=

Number of Elements

──────────────

Number of Buckets
```

Example

```text
100 Elements

50 Buckets
```

Load Factor

```text
100 / 50

=

2
```

Meaning

On average,

each bucket contains

```text
2 Elements
```

---

# Why is Load Factor Important?

As the load factor increases,

more collisions occur.

Example

```text
10 Buckets

1000 Elements
```

Average

```text
100 Elements

per Bucket
```

Searching becomes slower.

---

# Rehashing

When the load factor becomes too large,

`unordered_map` automatically performs

```text
Rehashing
```

---

# What is Rehashing?

Rehashing means

```text
Create More Buckets

↓

Recalculate Bucket Index

↓

Move Every Element
```

---

Example

Initially

```text
10 Buckets
```

After rehashing

```text
20 Buckets
```

Now

```text
Hash Function

↓

key % 20
```

instead of

```text
key % 10
```

The elements become more evenly distributed.

---

# Why is Rehashing Useful?

Without rehashing

```text
Many Collisions

↓

Long Chains

↓

Slow Searching
```

With rehashing

```text
More Buckets

↓

Short Chains

↓

Fast Searching
```

---

# Collision Resolution Techniques

There are several methods.

---

## 1. Separate Chaining ✅

Uses

```text
Linked Lists
```

Most common approach.

Used by many `unordered_map` implementations.

---

## 2. Open Addressing

Stores collided elements in another empty bucket.

---

## 3. Quadratic Probing

Searches for another bucket using a quadratic formula.

---

## 4. Double Hashing

Uses a second hash function to find another bucket.

---

For interviews,

understanding

```text
Separate Chaining
```

is usually sufficient.

---

# Complexity

| Operation | Average | Worst |
| --------- | ------- | ----- |
| Insert    | O(1)    | O(N)  |
| Search    | O(1)    | O(N)  |
| Delete    | O(1)    | O(N)  |

---

# Space Complexity

```text
O(N)
```

where

```text
N = Number of Stored Elements
```

---

# map vs unordered_map

| Feature            | map            | unordered_map |
| ------------------ | -------------- | ------------- |
| Internal Structure | Red-Black Tree | Hash Table    |
| Ordering           | Sorted         | No Order      |
| Average Search     | O(log N)       | O(1)          |
| Worst Search       | O(log N)       | O(N)          |
| Collision Possible | ❌             | ✅            |
| Rehashing          | ❌             | ✅            |

---

# When Should You Use map?

Use `map` when:

- Sorted order is required.
- You need `lower_bound()` or `upper_bound()`.
- Predictable `O(log N)` performance is preferred.

---

# When Should You Use unordered_map?

Use `unordered_map` when:

- Ordering does not matter.
- Fast average lookup is important.
- Frequency counting.
- Most DSA interview problems.

---

# Common Misconception

Many students say:

> "Worst case O(N) happens once in a blue moon."

A more accurate statement is:

```text
Worst-case O(N) is uncommon in normal programs
because modern hash functions and rehashing
keep collisions low.

However, it is still theoretically possible,
especially if many keys hash to the same bucket
or if someone deliberately constructs
collision-heavy inputs.
```

---

# Interview Questions

## Q1. What is a collision?

**Answer**

A collision occurs when two or more different keys are mapped to the same bucket by the hash function.

---

## Q2. Why are collisions unavoidable?

**Answer**

Because the number of possible keys is much larger than the fixed number of buckets in a hash table.

---

## Q3. How does `unordered_map` resolve collisions?

**Answer**

Most implementations use **Separate Chaining**, where each bucket stores a linked list (or a similar dynamic structure) of elements.

---

## Q4. What is a load factor?

**Answer**

The load factor is the ratio of:

```text
Number of Elements

──────────────

Number of Buckets
```

It indicates how full the hash table is.

---

## Q5. What is rehashing?

**Answer**

Rehashing increases the number of buckets and redistributes all existing elements using a new bucket calculation, reducing collisions and improving performance.

---

# Key Takeaways

- A **collision** occurs when multiple keys map to the same bucket.
- Collisions are unavoidable because hash tables have a limited number of buckets.
- `unordered_map` typically resolves collisions using **Separate Chaining**.
- Average lookup remains **O(1)** because a good hash function distributes keys evenly.
- In the worst case, if many keys collide, operations degrade to **O(N)**.
- The **load factor** measures how full the hash table is.
- **Rehashing** increases the number of buckets and redistributes elements to reduce collisions.
- `unordered_map` is usually preferred for fast lookups, while `map` is preferred when sorted order is required.

---
