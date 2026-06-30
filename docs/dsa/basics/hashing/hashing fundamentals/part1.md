# Introduction to Hashing

> Before learning `map`, `unordered_map`, or any hashing technique, it is important to understand **what hashing actually is and why we need it.**
>
> Hashing is one of the most important concepts in Data Structures and Algorithms because it allows us to answer queries much faster than brute force solutions.

---

# What is Hashing?

**Hashing** is a technique used to **store and retrieve data efficiently** by mapping a key to a specific location in memory.

Instead of searching through the entire data, hashing allows us to directly access the required information.

Think of it as:

```text
Input (Key)
      │
      ▼
 Hash Function
      │
      ▼
Memory Index
      │
      ▼
Stored Value
```

---

# Why Do We Need Hashing?

Suppose we have an array:

```cpp
arr = {1, 2, 1, 3, 2, 1, 5}
```

Now answer these questions:

```text
How many times does 1 occur?

How many times does 2 occur?

How many times does 5 occur?
```

One way is to scan the array every time.

---

## Brute Force Approach

For every query:

```text
Loop through entire array
Count occurrences
Return answer
```

Example

```cpp
int count = 0;

for (int i = 0; i < n; i++) {
    if (arr[i] == 1)
        count++;
}
```

---

### Time Complexity

If

```text
N = Size of array
Q = Number of queries
```

then

```text
One query  -> O(N)

Q queries  -> O(N × Q)
```

---

### Example

```text
N = 100000

Q = 100000
```

Operations

```text
100000 × 100000

=

10^10 operations
```

This is far too slow for competitive programming or real-world applications.

---

# Better Idea

Instead of searching every time,

count the frequencies **once**.

Store them.

Answer every query instantly.

This is the basic idea behind hashing.

---

# Frequency Table

Suppose

```cpp
arr = {1,2,1,3,2,1,5}
```

Frequency Table

| Number | Frequency |
| ------ | --------: |
| 1      |         3 |
| 2      |         2 |
| 3      |         1 |
| 5      |         1 |

Now if someone asks:

```text
Frequency of 2?
```

We already know the answer.

No need to search again.

---

# Hashing Concept

Instead of storing only the array,

we store

```text
Number

↓

Frequency
```

Example

```text
1 → 3

2 → 2

3 → 1

5 → 1
```

This mapping is called:

```text
Hashing
```

---

# Visual Representation

Original Array

```text
Index

0 1 2 3 4 5 6

↓

1 2 1 3 2 1 5
```

Hash Table

```text
Key      Frequency

1  ─────────► 3

2  ─────────► 2

3  ─────────► 1

5  ─────────► 1
```

---

# General Definition

Hashing is the process of:

```text
Taking a Key

↓

Mapping it

↓

To a Location

↓

Where information is stored
```

---

# What is a Key?

A **key** is simply the value we want to search.

Examples

```text
1

25

'A'

"Apple"

100000
```

All of these can be keys.

---

# What Can We Store?

Hashing is not limited to frequencies.

We can store almost anything.

Example

```text
Student ID

↓

Student Object
```

or

```text
Username

↓

Password Hash
```

or

```text
Word

↓

Number of Occurrences
```

---

# Real-Life Analogy

Imagine a library.

Without hashing:

```text
Need a book

↓

Search every shelf

↓

Find the book
```

Time-consuming.

---

With hashing:

```text
Need a book

↓

Search catalog

↓

Shelf Number

↓

Go directly there
```

Much faster.

---

# Why is Hashing Fast?

The goal of hashing is:

```text
Avoid Searching
```

Instead of

```text
Search

↓

Compare

↓

Search

↓

Compare
```

we directly access the stored information.

---

# Basic Hashing Workflow

```text
Input Array

↓

Process Once

↓

Build Hash Table

↓

Answer Multiple Queries Quickly
```

---

# Hashing Example

Array

```cpp
{4, 7, 4, 2, 7, 4}
```

Hash Table

```text
4 → 3

7 → 2

2 → 1
```

Queries

```text
Frequency of 4?

Answer:

3
```

---

```text
Frequency of 2?

Answer:

1
```

---

```text
Frequency of 5?

Answer:

0
```

---

# Advantages of Hashing

- Very fast searching.
- Efficient frequency counting.
- Reduces repeated work.
- Excellent for multiple queries.
- Widely used in DSA and real-world applications.

---

# Applications of Hashing

Hashing is used in many problems, including:

- Frequency counting
- Duplicate detection
- Counting distinct elements
- Two Sum
- Grouping anagrams
- Caching
- Database indexing
- Symbol tables
- Dictionaries
- Password storage (using cryptographic hashing)

---

# Brute Force vs Hashing

| Feature                  | Brute Force | Hashing        |
| ------------------------ | ----------- | -------------- |
| Search                   | Linear Scan | Direct Lookup  |
| One Query                | O(N)        | O(1) (average) |
| Multiple Queries         | O(N × Q)    | O(N + Q)       |
| Suitable for Large Input | ❌          | ✅             |

---

# Time Complexity

Suppose

```text
N = Number of Elements

Q = Number of Queries
```

### Brute Force

```text
Build

No preprocessing

↓

Queries

Q × O(N)

=

O(N × Q)
```

---

### Hashing

```text
Build Hash Table

O(N)

↓

Answer Queries

Q × O(1)

↓

Overall

O(N + Q)
```

---

# Important Observation

Hashing usually requires:

- Extra memory
- Less execution time

This is a classic example of:

```text
Time-Space Tradeoff
```

We use more memory to achieve much faster lookups.

---

# Interview Questions

## Q1. What is Hashing?

**Answer**

Hashing is a technique of mapping a key to a storage location so that data can be stored and retrieved efficiently.

---

## Q2. Why do we use Hashing?

**Answer**

To reduce searching time and answer repeated queries efficiently.

---

## Q3. What is Frequency Counting?

**Answer**

Frequency counting is the process of storing how many times each element appears in a collection.

---

## Q4. What is the biggest advantage of Hashing?

**Answer**

Fast lookup, insertion and retrieval of data.

---

## Q5. What is the main tradeoff in Hashing?

**Answer**

Hashing uses extra memory to reduce execution time.

---

# Key Takeaways

- Hashing maps a key to a storage location for fast access.
- It is primarily used to avoid repeated searching.
- Frequency counting is one of the simplest applications of hashing.
- Hashing is much faster than brute-force searching when handling many queries.
- Hashing follows a **time-space tradeoff**: it uses additional memory to achieve faster lookups.
- Hashing forms the foundation for data structures such as `unordered_map`, hash tables, dictionaries, and caches.

---
