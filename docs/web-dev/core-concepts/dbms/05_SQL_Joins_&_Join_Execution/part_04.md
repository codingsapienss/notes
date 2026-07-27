---
sidebar_label: Join Algorithms
sidebar_position: 1
---

# Join Algorithms

## 1. Introduction

So far, we have studied different types of SQL JOINs:

- INNER JOIN
- LEFT JOIN
- RIGHT JOIN
- FULL OUTER JOIN
- CROSS JOIN
- SELF JOIN
- SEMI JOIN
- ANTI JOIN

But there is another important question:

**How does a database actually execute a JOIN internally?**

When you write:

```sql
SELECT
    users.name,
    orders.amount
FROM users
INNER JOIN orders
ON users.id = orders.user_id;
```

The database must find matching records between the two tables.

There are different ways to perform this operation.

These techniques are called **JOIN algorithms** or **JOIN execution algorithms**.

The three major algorithms used by relational databases are:

1. Nested Loop Join
2. Hash Join
3. Merge Join

The database query optimizer chooses an execution strategy based on factors such as:

- Number of rows in each table.
- Available indexes.
- Table statistics.
- Memory availability.
- Data ordering.
- Join conditions.
- Estimated execution cost.

**Important distinction:**

JOIN types describe the logical result you want.

JOIN algorithms describe how the database physically produces that result.

For example, an INNER JOIN can be executed using a Nested Loop Join, Hash Join, or Merge Join.

---

## 2. Understanding the difference between JOIN type and JOIN algorithm

Consider this query:

```sql
SELECT *
FROM users u
INNER JOIN orders o
ON u.id = o.user_id;
```

Here:

- `INNER JOIN` specifies the logical operation.
- The database chooses an algorithm to execute that operation.

The same SQL query can use different algorithms depending on the data and available resources.

For example:

```text
SQL QUERY
    |
    v
INNER JOIN
    |
    v
QUERY OPTIMIZER
    |
    +------------------+
    |                  |
    v                  v
Nested Loop         Hash Join
    |
    v
Merge Join
```

The optimizer estimates the cost of possible execution plans and selects a suitable plan.

It does not simply choose one algorithm permanently for a particular SQL JOIN type.

---

## 3. Nested Loop Join

### Definition

A Nested Loop Join works by taking rows from one table and searching for matching rows in the other table.

Conceptually:

1. Take one row from the outer table.
2. Search for matching rows in the inner table.
3. Return matching combinations.
4. Move to the next outer-table row.
5. Repeat until all outer rows have been processed.

It is called a Nested Loop because one loop runs inside another loop.

### Example

Consider these tables.

**users**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Priya |
|   3 | Amit  |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |    500 |
| 102 |       1 |    800 |
| 103 |       2 |    300 |

We want to join users with orders.

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.amount
FROM users u
INNER JOIN orders o
ON u.id = o.user_id;
```

### How Nested Loop Join works

Suppose users is the outer table and orders is the inner table.

**Iteration 1: Rahul**

```text
Outer row:
Rahul (id = 1)

Search orders:

Order 101 -> user_id = 1  MATCH
Order 102 -> user_id = 1  MATCH
Order 103 -> user_id = 2  NO MATCH
```

Result:

| name  | order_id | amount |
| ----- | -------: | -----: |
| Rahul |      101 |    500 |
| Rahul |      102 |    800 |

**Iteration 2: Priya**

```text
Outer row:
Priya (id = 2)

Search orders:

Order 101 -> user_id = 1  NO MATCH
Order 102 -> user_id = 1  NO MATCH
Order 103 -> user_id = 2  MATCH
```

Result:

| name  | order_id | amount |
| ----- | -------: | -----: |
| Priya |      103 |    300 |

**Iteration 3: Amit**

```text
Outer row:
Amit (id = 3)

Search orders:

Order 101 -> user_id = 1  NO MATCH
Order 102 -> user_id = 1  NO MATCH
Order 103 -> user_id = 2  NO MATCH
```

No matching record is found.

### Conceptual algorithm

```javascript
for (const user of users) {
  for (const order of orders) {
    if (user.id === order.user_id) {
      console.log(user, order);
    }
  }
}
```

This is a conceptual illustration, not the actual PostgreSQL implementation.

### Time complexity

If:

- Outer table has N rows.
- Inner table has M rows.

A basic Nested Loop Join that scans the entire inner table for every outer row performs approximately:

\[
O(N \times M)
\]

For example:

| Users | Orders | Comparisons |
| ----: | -----: | ----------: |
|    10 |    100 |       1,000 |
|   100 |  1,000 |     100,000 |
| 1,000 | 10,000 |  10,000,000 |

This can become expensive when both tables are large.

However, this basic complexity does not describe every Nested Loop Join. An index on the inner table can dramatically reduce the work.

### Nested Loop Join with an index

Suppose `orders.user_id` has an index.

```sql
CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

Now PostgreSQL can:

1. Read one user.
2. Use the index to find matching orders.
3. Read the matching order rows.
4. Move to the next user.

Instead of scanning every order for every user, the database can perform indexed lookups.

Conceptually:

```text
FOR EACH USER:
    SEARCH orders.user_id INDEX
    FETCH matching orders
```

This is commonly called an **Index Nested Loop Join**.

Its approximate work depends on the number of outer rows and the cost of each index lookup.

A simplified model is:

\[
O(N \times \log M + K)
\]

Where:

- N = number of outer rows.
- M = number of rows in the indexed inner table.
- K = total number of matching rows retrieved.

Actual performance also depends on index depth, cache hits, disk access, and row visibility.

### When is Nested Loop Join useful?

- One table is small.
- The outer table returns very few rows.
- An index exists on the inner table's join column.
- The query is highly selective.
- The database needs to retrieve only a small number of matching records.

### When can it become expensive?

- Both tables are large.
- The inner table has no useful index.
- The outer table contains many rows.
- The database repeatedly scans a large inner table.

**Key point:** Nested Loop Join is not inherently slow. With a suitable index and a small outer result, it can be extremely efficient.

---

## 4. Hash Join

### Definition

A Hash Join uses a hash table to find matching rows between two tables.

Instead of repeatedly scanning one table for every row of the other table, the database builds a hash table from one input and probes it using rows from the other input.

A Hash Join generally has two main phases:

1. Build phase.
2. Probe phase.

### Example

Consider:

**users**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Priya |
|   3 | Amit  |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |    500 |
| 102 |       1 |    800 |
| 103 |       2 |    300 |

Query:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.amount
FROM users u
INNER JOIN orders o
ON u.id = o.user_id;
```

Assume PostgreSQL chooses users as the hash-build input.

### Phase 1: Build phase

The database reads the users table and creates a hash table using `users.id`.

Conceptually:

```text
USERS TABLE

+----+-------+
| 1  | Rahul |
| 2  | Priya |
| 3  | Amit  |
+----+-------+

       |
       v

BUILD HASH TABLE
Using users.id

Hash(1) -> Rahul
Hash(2) -> Priya
Hash(3) -> Amit
```

The hash table stores enough information to retrieve the corresponding user row when a matching key is found.

### Phase 2: Probe phase

The database reads the orders table.

For every order, it calculates a hash using `orders.user_id` and searches the hash table.

```text
ORDERS TABLE

Order 101 -> user_id = 1
                 |
                 v
             Hash(1)
                 |
                 v
             Rahul MATCH

Order 102 -> user_id = 1
                 |
                 v
             Hash(1)
                 |
                 v
             Rahul MATCH

Order 103 -> user_id = 2
                 |
                 v
             Hash(2)
                 |
                 v
             Priya MATCH
```

### Final result

| name  | order_id | amount |
| ----- | -------: | -----: |
| Rahul |      101 |    500 |
| Rahul |      102 |    800 |
| Priya |      103 |    300 |

### Conceptual algorithm

```javascript
const hashTable = new Map();

// Build phase
for (const user of users) {
  if (!hashTable.has(user.id)) {
    hashTable.set(user.id, []);
  }

  hashTable.get(user.id).push(user);
}

// Probe phase
for (const order of orders) {
  const matchingUsers = hashTable.get(order.user_id) || [];

  for (const user of matchingUsers) {
    console.log(user, order);
  }
}
```

This illustrates the idea. Real database hash tables use specialized memory structures and handle duplicate keys, hash collisions, and memory limits.

### Time complexity

Building a hash table takes approximately:

\[
O(N)
\]

Probing it takes approximately:

\[
O(M)
\]

Therefore, under normal assumptions:

\[
O(N + M + K)
\]

Where:

- N = rows in the build input.
- M = rows in the probe input.
- K = matching output rows.

Hash lookup is expected to be approximately constant time on average, but collisions and output size still matter.

### What happens if the hash table becomes too large?

Hash tables consume memory.

Suppose the database wants to build a hash table from a table containing millions of records, but the available memory is insufficient.

PostgreSQL can use a **multi-batch Hash Join**.

Instead of keeping the entire hash table in memory, it partitions data into batches and uses temporary storage as necessary.

Conceptually:

```text
INPUT DATA
    |
    v
PARTITION INTO BATCHES
    |
    +----------+----------+
    |          |          |
    v          v          v
 Batch 1    Batch 2    Batch 3
    |          |          |
    v          v          v
 Build and probe each batch
    |
    v
COMBINE MATCHES
```

This can involve temporary disk I/O, making the join slower than an in-memory Hash Join.

### When is Hash Join useful?

- Both tables contain many rows.
- The join uses equality conditions.
- There is no especially useful index for a Nested Loop Join.
- The database can build a reasonably sized hash table.
- A large portion of the tables needs to be joined.

### Limitations

- Building the hash table requires memory.
- Large hash tables can spill to disk.
- Hash joins are generally intended for equality join conditions.
- They do not inherently provide sorted output.

**Key point:** Hash Join is particularly effective for large equality joins when an appropriate hash table can be built efficiently.

---

## 5. Merge Join

### Definition

A Merge Join works by combining two inputs that are ordered by their join keys.

The database compares the current keys from both inputs and advances through them in sorted order.

It is similar to merging two sorted arrays.

### Example

Consider:

**users**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Priya |
|   3 | Amit  |
|   4 | Neha  |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |    500 |
| 102 |       1 |    800 |
| 103 |       2 |    300 |
| 104 |       4 |    600 |

Both inputs are ordered by their respective join keys:

```text
USERS (sorted by id)

1 Rahul
2 Priya
3 Amit
4 Neha


ORDERS (sorted by user_id)

1 Order 101
1 Order 102
2 Order 103
4 Order 104
```

Query:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.amount
FROM users u
INNER JOIN orders o
ON u.id = o.user_id;
```

### How Merge Join works

The database maintains a position in each sorted input.

It compares the current keys.

**Step 1**

```text
USERS                  ORDERS

1 Rahul                1 Order 101

1 = 1

MATCH
```

**Step 2**

There are two orders with user_id = 1.

Both match Rahul.

```text
1 Rahul                1 Order 102

1 = 1

MATCH
```

**Step 3**

Move to the next distinct user key and next order key.

```text
2 Priya                2 Order 103

2 = 2

MATCH
```

**Step 4**

The next user is Amit, ID 3.

The next order belongs to user 4.

```text
3 Amit                 4 Order 104

3 < 4

Advance users
```

**Step 5**

Now compare Neha and order 104.

```text
4 Neha                 4 Order 104

4 = 4

MATCH
```

### Final result

| name  | order_id | amount |
| ----- | -------: | -----: |
| Rahul |      101 |    500 |
| Rahul |      102 |    800 |
| Priya |      103 |    300 |
| Neha  |      104 |    600 |

### Conceptual algorithm

```javascript
let i = 0;
let j = 0;

while (i < users.length && j < orders.length) {
  if (users[i].id === orders[j].user_id) {
    console.log(users[i], orders[j]);
    j++;
  } else if (users[i].id < orders[j].user_id) {
    i++;
  } else {
    j++;
  }
}
```

This is simplified pseudocode for understanding the matching process. A real Merge Join must also handle duplicate keys, join semantics, and the possibility of multiple matching rows on either side.

### Time complexity

If both inputs are already sorted:

\[
O(N + M + K)
\]

Where:

- N = rows in the first input.
- M = rows in the second input.
- K = matching output rows.

Why?

Because the algorithm can advance through both sorted inputs rather than repeatedly searching the entire opposite table.

However, if the inputs are not already sorted, the database may need to sort them first.

Sorting generally costs approximately:

\[
O(N\log N + M\log M)
\]

The total execution cost therefore includes the sorting work when required.

### Can indexes help Merge Join?

Yes.

Indexes can provide data in the required order, potentially avoiding an explicit sort.

For example:

```sql
CREATE INDEX idx_users_id
ON users(id);

CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

A suitable index scan may provide ordered input to a Merge Join.

However, an index is not automatically the best choice. The optimizer considers the cost of reading the indexes versus scanning and sorting the tables.

### When is Merge Join useful?

- Both inputs are already sorted by join keys.
- Suitable indexes can provide ordered input.
- Large datasets need to be joined.
- The query also benefits from sorted output.
- The database can process the inputs efficiently in order.

### Limitations

- Sorting can be expensive when the inputs are not already ordered.
- Maintaining sorted inputs may require additional work.
- Merge Join generally needs compatible ordering on the join keys.

**Key point:** Merge Join is efficient when both inputs can be processed in sorted order without excessive sorting overhead.

---

## 6. Comparison of the Three JOIN Algorithms

| Feature          | Nested Loop                       | Hash Join                      | Merge Join                             |
| ---------------- | --------------------------------- | ------------------------------ | -------------------------------------- |
| Basic approach   | Repeatedly searches inner input   | Builds and probes a hash table | Merges ordered inputs                  |
| Index usage      | Can benefit greatly               | Not required                   | Can help provide sorted input          |
| Requires sorting | No                                | No                             | Inputs must be ordered                 |
| Memory usage     | Generally low                     | Can be significant             | Depends on sorting and execution       |
| Best suited for  | Small/selective inputs            | Large equality joins           | Ordered inputs and large joins         |
| Equality joins   | Yes                               | Yes                            | Yes                                    |
| Range joins      | Possible with suitable conditions | Generally not                  | Possible for suitable merge conditions |
| Main risk        | Repeated inner scans              | Memory pressure and spilling   | Expensive sorting                      |

### Complexity comparison

| Algorithm                       | Approximate cost model                     |
| ------------------------------- | ------------------------------------------ |
| Nested Loop without inner index | O(N × M)                                   |
| Nested Loop with useful index   | Depends on indexed lookup cost and matches |
| Hash Join                       | Expected O(N + M + K)                      |
| Merge Join with sorted inputs   | O(N + M + K)                               |
| Merge Join with sorting         | Sorting cost + O(N + M + K)                |

These are simplified algorithmic models, not guarantees of actual database execution time.

Real execution also depends on disk I/O, cache state, row width, data distribution, memory, and result size.

---

## 7. How PostgreSQL chooses a JOIN algorithm

PostgreSQL uses a query optimizer to determine how a query should be executed.

Consider:

```sql
SELECT
    u.name,
    o.amount
FROM users u
JOIN orders o
ON u.id = o.user_id;
```

PostgreSQL does not blindly execute the JOIN using one fixed algorithm.

It considers:

1. Estimated row counts.
2. Table statistics.
3. Available indexes.
4. Estimated number of matching rows.
5. Estimated disk and memory costs.
6. Whether the inputs are already ordered.
7. Available join strategies.

It then selects a plan with an estimated low cost.

### Example scenarios

**Scenario 1: Small result set**

Suppose a query filters users down to five rows and `orders.user_id` has a suitable index.

PostgreSQL may choose an Index Nested Loop Join.

```text
Nested Loop
    -> Index Scan on users
    -> Index Scan on orders
```

**Scenario 2: Large tables**

Suppose both tables contain millions of rows and the query joins a large portion of them using equality.

PostgreSQL may choose a Hash Join.

```text
Hash Join
    -> Seq Scan on orders
    -> Hash
         -> Seq Scan on users
```

**Scenario 3: Already ordered inputs**

Suppose both inputs can be read efficiently in join-key order.

PostgreSQL may choose a Merge Join.

```text
Merge Join
    -> Index Scan on users
    -> Index Scan on orders
```

These are illustrative plan shapes. The actual plan depends on the query and data.

### Important: The optimizer does not always choose the algorithm you expect

You might create an index and expect PostgreSQL to use Nested Loop Join.

But it may choose Hash Join instead.

Why?

Because using an index repeatedly can cost more than scanning the tables and building a hash table.

An index is an available option, not a command forcing the optimizer to use it.

---

## 8. Understanding EXPLAIN and EXPLAIN ANALYZE

To understand how PostgreSQL executes JOINs, you need to inspect the execution plan.

Two important commands are:

### EXPLAIN

```sql
EXPLAIN
SELECT
    u.name,
    o.amount
FROM users u
JOIN orders o
ON u.id = o.user_id;
```

EXPLAIN displays the estimated execution plan.

It does not normally execute the query.

### EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT
    u.name,
    o.amount
FROM users u
JOIN orders o
ON u.id = o.user_id;
```

EXPLAIN ANALYZE executes the query and displays actual execution information.

It provides information such as:

- Actual execution time.
- Actual rows returned.
- Number of loops.
- Estimated rows.
- Actual rows.
- Planning time.
- Execution time.

**Important:** EXPLAIN ANALYZE actually executes the query. Be careful with INSERT, UPDATE, and DELETE statements. Use a transaction and roll it back when testing data-changing statements.

---

## 9. Understanding a Nested Loop execution plan

Example:

```text
Nested Loop
  (cost=0.29..16.50 rows=5 width=40)
  (actual time=0.030..0.080 rows=5 loops=1)

  -> Index Scan using users_pkey on users
       (actual rows=5 loops=1)

  -> Index Scan using idx_orders_user_id on orders
       (actual rows=1 loops=5)
       Index Cond: (user_id = users.id)
```

### How to read it

**Nested Loop**

PostgreSQL selected the Nested Loop algorithm.

**Index Scan using users_pkey**

The outer input is obtained using the users primary-key index.

**Index Scan using idx_orders_user_id**

For each outer user, PostgreSQL searches the orders index.

**loops=5**

The inner index scan executed five times, once for each outer row.

**Index Cond**

The index lookup condition is:

```sql
user_id = users.id
```

This is a good example of how an index can make Nested Loop Join efficient.

---

## 10. Understanding a Hash Join execution plan

Example:

```text
Hash Join
  (cost=20.00..120.00 rows=1000 width=40)
  (actual time=0.300..2.500 rows=1000 loops=1)

  Hash Cond: (orders.user_id = users.id)

  -> Seq Scan on orders
       (actual rows=1000 loops=1)

  -> Hash
       (actual rows=100 loops=1)

       -> Seq Scan on users
            (actual rows=100 loops=1)
```

### How to read it

**Hash Join**

PostgreSQL selected Hash Join.

**Hash Cond**

The matching condition is:

```sql
orders.user_id = users.id
```

**Seq Scan on users**

PostgreSQL reads the users table to build the hash table.

**Hash**

The database creates a hash table from the users input.

**Seq Scan on orders**

PostgreSQL reads the orders table to probe the hash table.

Notice that the plan shows the build side beneath the Hash node.

---

## 11. Understanding a Merge Join execution plan

Example:

```text
Merge Join
  (cost=0.60..100.00 rows=1000 width=40)
  (actual time=0.040..1.800 rows=1000 loops=1)

  Merge Cond: (users.id = orders.user_id)

  -> Index Scan using users_pkey on users
       (actual rows=100 loops=1)

  -> Index Scan using idx_orders_user_id on orders
       (actual rows=1000 loops=1)
```

### How to read it

**Merge Join**

PostgreSQL selected Merge Join.

**Merge Cond**

The join keys are:

```sql
users.id = orders.user_id
```

**Index Scan on users**

Reads users in the order of the index.

**Index Scan on orders**

Reads orders in the order of the index.

Because both inputs are ordered appropriately, PostgreSQL can merge them without an explicit Sort node in this illustrative plan.

---

## 12. What if PostgreSQL chooses the wrong JOIN algorithm?

Sometimes the optimizer chooses a plan that performs poorly because its estimates are inaccurate.

For example:

- PostgreSQL estimates 100 rows.
- The query actually returns 100,000 rows.
- The optimizer chooses a Nested Loop Join.
- The repeated inner lookups become expensive.

Common reasons include:

1. Outdated statistics.
2. Data distribution changes.
3. Incorrect cardinality estimates.
4. Highly skewed values.
5. Missing or unsuitable indexes.
6. Insufficient memory for a hash operation.
7. A query returning far more rows than expected.

### Step 1: Inspect the plan

```sql
EXPLAIN ANALYZE
SELECT *
FROM users u
JOIN orders o
ON u.id = o.user_id;
```

### Step 2: Compare estimated and actual rows

Look for:

```text
rows=100
actual rows=100000
```

A large difference indicates that the optimizer's estimate may be inaccurate.

### Step 3: Refresh statistics

```sql
ANALYZE users;
ANALYZE orders;
```

PostgreSQL uses table statistics to estimate row counts and selectivity.

### Step 4: Inspect indexes

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'orders';
```

### Step 5: Re-run EXPLAIN ANALYZE

Check whether the execution plan and actual performance improve.

### Important: Do not force JOIN algorithms as your first solution

PostgreSQL provides planner configuration parameters that can discourage particular join strategies during testing.

For example:

```sql
SET enable_nestloop = OFF;
```

This is useful for experimentation, but disabling algorithms globally or as a permanent workaround is usually a poor optimization strategy.

First investigate:

- Statistics.
- Indexes.
- Query conditions.
- Data distribution.
- Actual execution cost.

---

## 13. JOIN algorithms in real backend applications

Consider an e-commerce application.

It has:

- `users`: 500,000 rows.
- `orders`: 5,000,000 rows.
- `products`: 200,000 rows.
- `order_items`: 15,000,000 rows.

A typical query:

```sql
SELECT
    u.name,
    o.id AS order_id,
    p.name AS product_name,
    oi.quantity
FROM users u
JOIN orders o
    ON u.id = o.user_id
JOIN order_items oi
    ON o.id = oi.order_id
JOIN products p
    ON p.id = oi.product_id
WHERE u.id = 100;
```

What might PostgreSQL do?

1. Use an index to find user 100.
2. Use an index on `orders.user_id` to retrieve the user's orders.
3. Use an index on `order_items.order_id` to retrieve matching order items.
4. Use the products primary-key index to retrieve product details.

This may result in several Nested Loop Joins.

Why?

Because the query is highly selective: only one user is requested.

Now imagine a different query:

```sql
SELECT
    p.category_id,
    SUM(oi.quantity)
FROM products p
JOIN order_items oi
ON p.id = oi.product_id
GROUP BY p.category_id;
```

This query may need to process a large portion of both tables.

A Hash Join or Merge Join could be more efficient, depending on the indexes, data distribution, and available memory.

**Lesson:** The best JOIN algorithm depends on the workload, not just the table names or the SQL syntax.

---

## 14. Common Misconceptions

### Misconception 1: INNER JOIN always uses Nested Loop Join

Incorrect.

INNER JOIN is a logical operation. PostgreSQL may execute it using Nested Loop, Hash Join, or Merge Join.

### Misconception 2: Hash Join is always faster than Nested Loop Join

Incorrect.

For a small outer input and a useful index, Nested Loop Join can be significantly faster.

### Misconception 3: Indexes are mandatory for JOINs

Incorrect.

Hash Join and sequential scans can execute JOINs without indexes.

Indexes are useful, but they are not a requirement.

### Misconception 4: Merge Join always requires sorting

Not necessarily.

If the inputs are already available in the required order, such as through suitable index scans, an explicit sort may not be needed.

### Misconception 5: The smallest table is always the hash-build side

Not necessarily.

The optimizer considers estimated size, row width, join conditions, and costs. The smaller input is often a good build-side candidate, but it is not an absolute rule.

### Misconception 6: A Nested Loop Join is always bad for large tables

Incorrect.

A large table can be involved in an efficient Nested Loop Join if the outer input is selective and the inner lookups use suitable indexes.

### Misconception 7: EXPLAIN ANALYZE only estimates performance

Incorrect.

It executes the query and reports actual execution measurements.

---

## 15. Interview Questions

### Basic questions

**1. What are JOIN algorithms?**

JOIN algorithms are physical execution strategies used by a database to find matching records between tables.

**2. What are the three major JOIN algorithms?**

- Nested Loop Join
- Hash Join
- Merge Join

**3. What is a Nested Loop Join?**

It iterates through one input and searches the other input for matching rows.

**4. What is a Hash Join?**

It builds a hash table from one input and probes it using rows from the other input.

**5. What is a Merge Join?**

It processes two ordered inputs and matches their join keys by advancing through them.

**6. Which JOIN algorithm benefits from an index on the inner table?**

Nested Loop Join can benefit significantly from an index on its inner input.

### Intermediate questions

**7. Which JOIN algorithm is often effective for large equality joins?**

Hash Join is often effective when a suitable hash table can be built efficiently.

**8. Does Hash Join require an index?**

No. It builds its own hash structure.

**9. Does Merge Join require sorted inputs?**

Yes. Both inputs must be ordered appropriately. The database can obtain that order through indexes or explicit sorting.

**10. Can an INNER JOIN use a Hash Join?**

Yes. INNER JOIN specifies logical behavior, while Hash Join is a physical execution strategy.

**11. What happens if a Hash Join does not fit in memory?**

PostgreSQL can use multiple batches and temporary storage, increasing disk I/O.

**12. Why might PostgreSQL choose Nested Loop Join even when both tables are large?**

The query may be selective, the outer result may be small, and the inner input may have an efficient index.

**13. What is the difference between EXPLAIN and EXPLAIN ANALYZE?**

EXPLAIN displays the estimated plan. EXPLAIN ANALYZE executes the query and reports actual execution measurements.

**14. What does loops mean in EXPLAIN ANALYZE?**

It indicates how many times an execution-plan node ran.

**15. What should you investigate if estimated rows differ significantly from actual rows?**

Check statistics, data distribution, selectivity, and whether the planner has enough information to estimate the query correctly.

---

## 16. Chapter Summary

| Algorithm        | Main idea                           | Best suited for                                                |
| ---------------- | ----------------------------------- | -------------------------------------------------------------- |
| Nested Loop Join | Repeatedly search for matching rows | Small/selective inputs, especially with an inner index         |
| Hash Join        | Build and probe a hash table        | Large equality joins                                           |
| Merge Join       | Match two ordered inputs            | Inputs already sorted or efficiently available in sorted order |

### Key takeaways

1. JOIN types describe what result is required.
2. JOIN algorithms describe how the database produces that result.
3. Nested Loop Join uses repeated matching searches.
4. An index can make Nested Loop Join very efficient.
5. Hash Join uses a build phase and a probe phase.
6. Hash Join can spill to disk when memory is insufficient.
7. Merge Join processes ordered inputs.
8. Indexes can help provide the ordering needed by Merge Join.
9. PostgreSQL's optimizer selects the execution plan based on estimated costs.
10. EXPLAIN ANALYZE is essential for understanding actual JOIN performance.
