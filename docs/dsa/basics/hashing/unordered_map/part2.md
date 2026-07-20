# How Hashing Works Internally (Hash Tables)

> We know that:
>
> ```text
> unordered_map
>
> Average Time Complexity
>
> O(1)
> ```
>
> But the next question is:
>
> ```text
> How is this possible?
> ```
>
> The answer lies in the internal working of a **Hash Table**.
>
> Understanding this chapter will explain:
>
> - How hashing works internally
> - What a hash function is
> - What buckets are
> - Why lookups are usually O(1)
> - Why collisions happen (covered in detail in Part 3C)

---

### What is a Hash Table?

A **Hash Table** is a data structure that stores data in an array called

```text
Buckets
```

Instead of searching every element,

a key is first converted into an array index.

Visualization

```text
Key

↓

Hash Function

↓

Bucket Index

↓

Store Value
```

---

### Components of a Hash Table

A Hash Table mainly consists of:

```text
1. Keys

2. Values

3. Hash Function

4. Buckets
```

---

### Step 1 — The Key

A key is the value we want to store or search.

Example

```text
10

25

100

"A"

"Apple"
```

---

### Step 2 — Hash Function

A **Hash Function** converts a key into an array index.

Example

```text
Key = 25
```

Hash Function

```text
25 % 10
```

Result

```text
5
```

So,

```text
Bucket Number = 5
```

---

### What is a Hash Function?

A Hash Function is simply a function that converts

```text
Large Keys

↓

Small Array Index
```

Example

```text
Key = 125

Hash Function

125 % 10

↓

5
```

---

Another Example

```text
Key = 247

247 % 10

↓

7
```

---

### Why Do We Need a Hash Function?

Imagine storing

```text
1

100

1000000

999999999
```

We cannot create an array of size

```text
999999999
```

Instead,

the hash function converts them into a much smaller range.

Example

```text
Hash Table Size = 10
```

Possible indices

```text
0

↓

9
```

---

### Buckets

A bucket is simply one location inside the hash table.

Suppose

```text
Hash Table Size = 10
```

Then

```text
Bucket

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

Each bucket stores one or more elements.

---

### Example

Suppose

```text
Hash Function

Key % 10
```

Insert

```text
15

27

33

42
```

Calculations

```text
15 % 10 = 5

27 % 10 = 7

33 % 10 = 3

42 % 10 = 2
```

Table

```text
Bucket

0

1

2 → 42

3 → 33

4

5 → 15

6

7 → 27

8

9
```

---

### Searching

Need to search

```text
27
```

Hash Function

```text
27 % 10

↓

7
```

Directly go to

```text
Bucket 7
```

Found.

Notice

```text
No need to search

Bucket 0

Bucket 1

Bucket 2

...
```

This is why hashing is fast.

---

### Why is Hashing O(1)?

Suppose

```text
Array Size

1,000,000
```

Searching in an array

```text
Linear Search

↓

O(N)
```

---

Hash Table

```text
Hash Function

↓

Bucket Number

↓

Direct Access
```

Time

```text
O(1)
```

Average.

---

### Division Method (Most Important)

The most common hash function is

```text
Division Method
```

Formula

```text
Hash(key)

=

key % TableSize
```

---

Example

Table Size

```text
10
```

Keys

```text
21

43

65

98
```

Hash Values

```text
21 % 10 = 1

43 % 10 = 3

65 % 10 = 5

98 % 10 = 8
```

---

### Why Use Modulo?

Modulo ensures

```text
Output

↓

Always inside

0

↓

TableSize - 1
```

Example

```text
99999999 % 10

↓

9
```

So even a huge key maps into a valid bucket.

---

### Other Hashing Methods

Besides the Division Method, there are other ways to design hash functions.

Examples

- Division Method ✅ (Most common)
- Folding Method
- Mid-Square Method
- Multiplication Method
- Universal Hashing

For DSA interviews,

the **Division Method** is the only one you usually need to understand in detail.

---

### Good Hash Function

A good hash function should:

- Be fast to compute.
- Distribute keys uniformly.
- Minimize collisions.
- Always produce a valid bucket index.

---

### Poor Hash Function

Suppose

```text
Hash(key)

=

1
```

for every key.

Then

```text
10

20

30

40

50
```

All go into

```text
Bucket 1
```

Searching becomes very slow.

---

### Ideal Distribution

Good

```text
Bucket

0 → 45

1 → 11

2 → 89

3 → 54

4 → 12

5 → 67

6 → 91

7 → 30

8 → 71

9 → 25
```

Every bucket has roughly the same number of elements.

---

Bad

```text
Bucket

0

1

2

3

4

5

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

6

7

8

9
```

Almost everything is stored in one bucket.

---

### What Happens After Finding the Bucket?

Finding the bucket is only the first step.

If multiple elements are stored in the same bucket,

the hash table must decide

```text
Which one is mine?
```

This problem is called

```text
Collision
```

Collision handling techniques include:

- Linear Chaining (used by most `unordered_map` implementations)
- Open Addressing
- Quadratic Probing
- Double Hashing

We'll study **Linear Chaining and Collisions** in detail in **Part 3C**.

---

### Time Complexity

| Operation      | Average | Worst                    |
| -------------- | ------- | ------------------------ |
| Hash Function  | O(1)    | O(1)                     |
| Bucket Lookup  | O(1)    | O(1)                     |
| Overall Search | O(1)    | O(N) (due to collisions) |

---

### Space Complexity

Suppose

```text
N
```

elements are stored.

Space

```text
O(N)
```

Additional memory is required for the bucket array.

---

### Advantages of Hash Tables

- Extremely fast lookups.
- Fast insertion.
- Fast deletion.
- Excellent for frequency counting.
- Supports large key ranges.

---

### Limitations

- No ordering of keys.
- Performance depends on the quality of the hash function.
- Collisions can reduce performance.
- Uses extra memory.

---

### Interview Questions

#### Q1. What is a Hash Table?

**Answer**

A Hash Table is a data structure that stores key-value pairs by mapping keys to bucket indices using a hash function.

---

#### Q2. What is a Hash Function?

**Answer**

A function that converts a key into a valid bucket index inside the hash table.

---

#### Q3. Why is the Division Method so common?

**Answer**

Because it is simple, fast, and guarantees that the bucket index remains within the table size using the modulo operator.

---

#### Q4. Why are hash table operations usually O(1)?

**Answer**

Because the hash function directly computes the bucket location, avoiding a linear search through all elements.

---

#### Q5. What is the purpose of buckets?

**Answer**

Buckets are storage locations in the hash table where elements are placed after applying the hash function.

---

### Key Takeaways

- `unordered_map` is implemented using a **Hash Table**.
- A hash table stores data in **buckets**.
- A **hash function** converts a key into a bucket index.
- The **Division Method (`key % tableSize`)** is the most common hashing technique.
- Good hash functions distribute keys uniformly across buckets.
- Direct bucket access gives **O(1)** average lookup time.
- Multiple keys may map to the same bucket, causing **collisions**, which are handled using collision resolution techniques.
- Understanding hash tables is essential for mastering `unordered_map`.

---
