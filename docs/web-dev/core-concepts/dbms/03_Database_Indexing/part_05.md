---
sidebar_label: How Databases Execute Queries Using Indexes
sidebar_position: 1
---

# How Databases Execute Queries Using Indexes

## 1. Introduction: What Happens When You Execute a Query?

Consider a PostgreSQL table containing 10 million orders.

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

The database needs to find all orders belonging to user `101`.

There are two broad approaches:

1. **Sequential Scan:** Read the table and check rows one by one.
2. **Index Scan:** Use an index to locate matching rows.

But how does PostgreSQL decide which approach to use?

How does it find the index?

How does it retrieve the actual table data?

How does it decide whether an index is faster than a sequential scan?

These are the questions covered in this chapter.

---

## 2. Query Execution Pipeline

When an application sends an SQL query to PostgreSQL, the database does not immediately execute it.

The query passes through several stages.

```text
Application (Node.js)
        |
        v
     SQL Query
        |
        v
  1. Parser
        |
        v
  2. Analyzer
        |
        v
  3. Rewriter
        |
        v
  4. Query Planner / Optimizer
        |
        v
  5. Execution Plan
        |
        v
  6. Executor
        |
        v
  7. Storage Engine
        |
        v
   Query Results
        |
        v
    Application
```

Let's understand each stage.

### 2.1 Parser

The parser checks whether the SQL statement follows valid SQL syntax.

Example:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

This is valid SQL.

But:

```sql
SELEC *
FROM orders;
```

This contains a syntax error.

The parser creates an internal representation of the query.

### 2.2 Analyzer

The analyzer checks whether the objects referenced in the query actually exist and whether the query makes semantic sense.

For example:

```sql
SELECT unknown_column
FROM orders;
```

If `unknown_column` does not exist, PostgreSQL reports an error.

The analyzer also resolves:

- Table references.
- Column references.
- Data types.
- Operators.
- Functions.
- Permissions.

### 2.3 Rewriter

PostgreSQL can transform the analyzed query using its rewrite rules.

For example, views can be expanded into their underlying queries.

The rewrite stage produces a query representation that can be planned.

### 2.4 Query Planner / Optimizer

This is the important stage for indexing.

The planner considers different ways to execute the query.

For example:

- Sequential Scan.
- Index Scan.
- Index Only Scan.
- Bitmap Index Scan.
- Bitmap Heap Scan.
- Different join algorithms.
- Different join orders.
- Sorting strategies.

It estimates the cost of different execution plans and chooses one based on its cost model.

### 2.5 Executor

The executor runs the selected execution plan.

It requests the required data through PostgreSQL's storage and buffer-management mechanisms.

### 2.6 Storage and Buffer Management

PostgreSQL reads data in fixed-size pages.

The commonly used default PostgreSQL block size is 8 KB, although it can differ between builds.

Data may already be available in PostgreSQL's shared buffers or may need to be read from the operating system's page cache or storage.

The executor processes the required rows and returns results to the application.

**Important:** The planner chooses an execution strategy; the executor carries it out. PostgreSQL does not simply choose an index every time one exists.

---

## 3. Sequential Scan (Seq Scan)

A sequential scan means PostgreSQL reads the table's heap pages sequentially and checks rows against the query condition.

Example:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

Suppose the table contains:

|  id | user_id | total |
| --: | ------: | ----: |
|   1 |     101 |   500 |
|   2 |     102 |   800 |
|   3 |     103 |   300 |
|   4 |     101 |   900 |
|   5 |     104 |   600 |
|   6 |     101 |   700 |

Conceptually, PostgreSQL checks each row:

```text
Read row 1 → user_id = 101 → Match
Read row 2 → user_id = 102 → No match
Read row 3 → user_id = 103 → No match
Read row 4 → user_id = 101 → Match
Read row 5 → user_id = 104 → No match
Read row 6 → user_id = 101 → Match
```

The database returns matching rows.

### 3.1 How does PostgreSQL perform a sequential scan?

1. Reads heap pages.
2. Examines tuples on those pages.
3. Applies the query filter.
4. Returns matching rows.

### 3.2 When is a sequential scan useful?

- The table is small.
- The query returns a large percentage of rows.
- No useful index exists.
- Reading the table sequentially is cheaper than performing many random lookups.

### 3.3 Example

```sql
EXPLAIN
SELECT *
FROM orders
WHERE user_id = 101;
```

Possible plan:

```text
Seq Scan on orders
  Filter: (user_id = 101)
```

The planner estimates that reading the table is cheaper than using an index.

**Important:** A sequential scan is not necessarily a bad execution plan. Sometimes it is the fastest option.

---

## 4. Index Scan

An Index Scan uses an index to locate matching rows.

Suppose we create:

```sql
CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

Now execute:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

PostgreSQL may choose an Index Scan.

### 4.1 How does an Index Scan work?

Consider a simplified B-tree index:

```text
             [101 | 103]
             /    |    \
            /     |     \
        Leaf 1  Leaf 2  Leaf 3
```

The actual index contains sorted entries and references to table tuples.

The execution process is approximately:

1. Start at the root page of the B-tree.
2. Follow the appropriate child pointers.
3. Reach the relevant leaf page.
4. Find entries matching `user_id = 101`.
5. Retrieve their tuple references.
6. Visit the corresponding heap pages.
7. Check tuple visibility and return the required columns.

### 4.2 Why does it access the heap?

An ordinary PostgreSQL B-tree index generally stores indexed values and references to table tuples. It does not necessarily contain every column required by the query.

For example:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

If the index contains only `user_id`, PostgreSQL still needs to retrieve the other columns from the table.

Conceptually:

```text
       SQL Query
           |
           v
     B-Tree Index
           |
           v
   Matching Index Entries
           |
           v
    Heap Tuple References
           |
           v
      Table (Heap)
           |
           v
       Result Rows
```

### 4.3 Example execution plan

```text
Index Scan using idx_orders_user_id on orders
  Index Cond: (user_id = 101)
```

The `Index Cond` indicates that PostgreSQL uses the indexed condition to locate matching index entries.

---

## 5. Index Scan vs Sequential Scan

| Feature         | Sequential Scan                     | Index Scan                          |
| --------------- | ----------------------------------- | ----------------------------------- |
| Access method   | Reads table pages sequentially      | Uses an index to find rows          |
| Best suited for | Small tables or many matching rows  | Selective queries                   |
| Index required  | No                                  | Yes                                 |
| Heap access     | Directly reads heap pages           | Usually visits heap pages           |
| Random I/O      | Usually less random                 | Can involve random heap access      |
| Performance     | Can be better for large result sets | Can be better for selective queries |

### Important observation

Suppose a table has 10 million rows.

Query A:

```sql
SELECT *
FROM orders
WHERE id = 101;
```

Only one row is required. An index is likely to be useful.

Query B:

```sql
SELECT *
FROM orders
WHERE status = 'completed';
```

Suppose 8 million rows have this status.

Using an index to locate millions of rows and then visiting the heap may be more expensive than reading the table sequentially.

The optimizer considers these costs before selecting a plan.

---

## 6. Bitmap Index Scan

A Bitmap Index Scan is another way PostgreSQL can use indexes.

It is particularly useful when a query matches multiple rows and visiting the heap one row at a time would be inefficient.

Consider:

```sql
SELECT *
FROM orders
WHERE status = 'completed';
```

Assume PostgreSQL has an index on `status`.

Instead of immediately visiting each matching heap tuple, it can build a bitmap representing the relevant heap locations.

### 6.1 How does it work?

```text
          SQL Query
              |
              v
      Bitmap Index Scan
              |
              v
      Matching Row Locations
              |
              v
          Bitmap
              |
              v
       Bitmap Heap Scan
              |
              v
        Matching Rows
```

The bitmap represents which heap locations contain potential matches.

The Bitmap Heap Scan then visits the relevant heap pages.

This allows PostgreSQL to organize heap access more efficiently, often reducing random I/O.

### 6.2 Example

```sql
CREATE INDEX idx_orders_status
ON orders(status);

EXPLAIN
SELECT *
FROM orders
WHERE status = 'completed';
```

A possible plan:

```text
Bitmap Heap Scan on orders
  Recheck Cond: (status = 'completed')
  -> Bitmap Index Scan on idx_orders_status
       Index Cond: (status = 'completed')
```

### 6.3 BitmapAnd

PostgreSQL can combine multiple indexes.

Suppose:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(status);
```

Query:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

A possible plan:

```text
Bitmap Heap Scan on orders
  Recheck Cond: (...)
  -> BitmapAnd
       -> Bitmap Index Scan on idx_orders_user
       -> Bitmap Index Scan on idx_orders_status
```

The database:

1. Finds matching locations from the first index.
2. Finds matching locations from the second index.
3. Intersects the bitmaps.
4. Visits the required heap pages.

For an OR condition, PostgreSQL can sometimes use `BitmapOr` instead.

### 6.4 When is a Bitmap Scan useful?

- Multiple rows match the query.
- Separate indexes can be combined.
- Heap access can be grouped by page.
- A regular Index Scan would involve many scattered heap visits.

A bitmap scan is not always better. For a query returning a very small number of rows, a regular Index Scan may be faster.

---

## 7. Index Only Scan

An Index Only Scan attempts to retrieve all the required data directly from the index.

Consider:

```sql
SELECT user_id, created_at
FROM orders
WHERE user_id = 101;
```

Create a composite index:

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at);
```

Both selected columns are available in the index.

PostgreSQL may use an Index Only Scan.

### 7.1 How does it work?

```text
        SQL Query
            |
            v
        B-Tree Index
            |
            v
    Matching Index Entries
            |
            v
     Required Column Values
            |
            v
       Result Rows
```

This can avoid visiting the heap for tuple data.

### 7.2 The Visibility Map

There is an important PostgreSQL-specific detail.

PostgreSQL uses MVCC, so a database must determine whether a tuple version is visible to the current transaction.

Ordinary index entries do not contain all the information needed to establish visibility for every transaction.

PostgreSQL maintains a visibility map to track whether heap pages are all-visible.

If a page is marked all-visible, PostgreSQL can often avoid visiting that heap page for visibility checks.

If it is not marked all-visible, PostgreSQL may need to visit the heap.

### 7.3 Example plan

```text
Index Only Scan using idx_orders_user_created
on orders
  Index Cond: (user_id = 101)
```

With:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT user_id, created_at
FROM orders
WHERE user_id = 101;
```

Inspect:

```text
Heap Fetches: 0
```

Zero heap fetches indicate that PostgreSQL did not need heap visibility checks for those tuples during that execution.

If heap fetches are greater than zero, some heap visits were necessary.

**Remember:** An Index Only Scan is a planner/executor strategy, not a guarantee that the heap will never be accessed.

---

## 8. Index Condition vs Filter Condition

This is an important concept when reading PostgreSQL execution plans.

Consider:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

Suppose we only have:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);
```

A possible plan:

```text
Index Scan using idx_orders_user on orders
  Index Cond: (user_id = 101)
  Filter: (status = 'completed')
```

What is happening?

### 8.1 Index Cond

```text
Index Cond: (user_id = 101)
```

PostgreSQL uses the index to locate entries for `user_id = 101`.

This condition helps determine which index entries to retrieve.

### 8.2 Filter

```text
Filter: (status = 'completed')
```

After finding candidate rows, PostgreSQL checks their `status`.

The `status` condition is not used to narrow the index search in this plan.

### 8.3 Improve the index

Create:

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

Now PostgreSQL may use:

```text
Index Scan using idx_orders_user_status on orders
  Index Cond: ((user_id = 101)
               AND (status = 'completed'))
```

Both conditions can be used to locate the relevant index entries.

### Comparison

| Index Cond                          | Filter                                |
| ----------------------------------- | ------------------------------------- |
| Helps locate matching index entries | Checks candidate rows                 |
| Applied during index access         | Applied after candidate retrieval     |
| Can reduce index entries visited    | May require additional row processing |

A Filter is not automatically bad. Some conditions cannot efficiently be used as index conditions, and filtering is a normal part of query execution.

---

## 9. How the Query Optimizer Decides Whether to Use an Index

PostgreSQL does not simply check whether an index exists.

It estimates the cost of different possible execution plans.

For example:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

Possible strategies:

- Sequential Scan.
- Index Scan.
- Bitmap Index Scan and Bitmap Heap Scan.

The planner estimates the cost of each strategy.

### 9.1 Important factors

**1. Table size**

A small table may be faster to scan sequentially.

**2. Selectivity**

Selectivity describes how much of the table matches a condition.

A highly selective condition matches a small fraction of rows.

Example:

```sql
WHERE email = 'user@example.com'
```

A unique email lookup is usually highly selective.

A low-selectivity condition might be:

```sql
WHERE status = 'active'
```

if almost every row has that status.

**3. Data distribution**

The same condition can return very different numbers of rows depending on the actual data distribution.

**4. Index type and structure**

Different indexes support different operators and access patterns.

**5. Required columns**

If the query needs many columns not present in the index, heap access may be necessary.

**6. Sorting and LIMIT**

An index that provides the requested order may be valuable, especially when the query uses `LIMIT`.

**7. Cache and I/O estimates**

Data already in memory may be cheaper to access than data requiring disk reads.

### 9.2 Statistics

PostgreSQL maintains statistics about table data.

You can update them manually:

```sql
ANALYZE orders;
```

The planner uses these statistics to estimate:

- Number of rows.
- Value distribution.
- Common values.
- Distinct values.
- Data correlation.

If statistics are outdated, the planner may choose a poor execution plan.

PostgreSQL normally updates statistics through autovacuum's automatic analyze process, but manual `ANALYZE` can be useful after substantial data changes.

---

## 10. Understanding Selectivity

Selectivity is an important factor in query optimization.

A condition is highly selective when it matches a small fraction of the rows.

Consider a table with 1 million orders.

| Condition              | Matching rows | Selectivity |
| ---------------------- | ------------: | ----------: |
| `id = 101`             |             1 |     0.0001% |
| `user_id = 101`        |            50 |      0.005% |
| `status = 'pending'`   |       100,000 |         10% |
| `status = 'completed'` |       850,000 |         85% |

A lookup by `id` is highly selective.

A lookup by `status = 'completed'` is less selective in this example.

### Why does selectivity matter?

Suppose PostgreSQL needs to return 850,000 rows.

An index lookup might require:

1. Reading index pages.
2. Locating hundreds of thousands of matching entries.
3. Visiting many heap pages.

A sequential scan may be cheaper.

But the exact threshold is not fixed. It depends on page layout, caching, row width, indexes, and other cost factors.

**Important:** Low selectivity does not automatically mean an index will never be used. The optimizer makes a cost-based decision.

---

## 11. Why Does PostgreSQL Sometimes Ignore an Index?

This is a common backend debugging question.

Suppose you create:

```sql
CREATE INDEX idx_orders_status
ON orders(status);
```

But the execution plan still shows:

```text
Seq Scan on orders
```

Possible reasons:

### Reason 1: The table is small

Reading the entire table may be cheaper.

### Reason 2: Too many rows match

The index would produce many heap lookups.

### Reason 3: Outdated statistics

The optimizer may have incorrect estimates.

Run:

```sql
ANALYZE orders;
```

### Reason 4: The query uses a function on the indexed column

Suppose:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

Query:

```sql
SELECT *
FROM users
WHERE LOWER(email) = 'user@example.com';
```

The query applies `LOWER()` to the column.

The ordinary index on `email` may not be usable for this expression.

One solution is an expression index:

```sql
CREATE INDEX idx_users_lower_email
ON users(LOWER(email));
```

Now the query can match the indexed expression.

### Reason 5: Type mismatch or implicit conversion

A query may apply a cast or conversion that prevents efficient use of an ordinary index.

For example, comparing an indexed text column using an expression that converts the column to another type may change index usability.

Use compatible parameter types and inspect the execution plan instead of assuming every cast prevents index usage.

### Reason 6: Leading wildcard in LIKE

Consider:

```sql
SELECT *
FROM users
WHERE email LIKE '%example.com';
```

A normal B-tree index generally cannot efficiently support an arbitrary leading-wildcard search.

For suitable text-search workloads, PostgreSQL's `pg_trgm` extension with a GIN or GiST index may help.

### Reason 7: The planner estimates another plan is cheaper

An index can be usable but still not selected.

That is normal cost-based optimization.

---

## 12. How to Read EXPLAIN ANALYZE

This is one of the most useful skills for backend developers.

Consider:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 101;
```

Possible output:

```text
Index Scan using idx_orders_user_id on orders
  (cost=0.42..15.20 rows=10 width=48)
  (actual time=0.025..0.060 rows=8 loops=1)
  Index Cond: (user_id = 101)
Planning Time: 0.150 ms
Execution Time: 0.090 ms
```

Let's understand the important fields.

### 12.1 cost

```text
cost=0.42..15.20
```

The planner's estimated cost.

- First value: estimated startup cost.
- Second value: estimated total cost.

These are internal cost units, not milliseconds.

### 12.2 rows

```text
rows=10
```

Estimated number of rows returned by the plan node.

### 12.3 width

```text
width=48
```

Estimated average row width in bytes.

### 12.4 actual time

```text
actual time=0.025..0.060
```

Actual execution timing for the plan node, in milliseconds.

- First value: time until the first row is produced.
- Second value: time until the node finishes producing rows.

### 12.5 Actual rows

```text
actual rows=8
```

The number of rows actually returned by the node.

### 12.6 loops

```text
loops=1
```

The number of times the node executed.

When a node executes multiple times, its displayed per-loop time and row counts need to be interpreted alongside the loop count.

### 12.7 Planning Time

Time spent generating the execution plan.

### 12.8 Execution Time

Total execution time reported by PostgreSQL for the statement.

**Important:** Execution plans can contain multiple nodes. Always read the complete tree, not just the first line.

---

## 13. Practical Backend Debugging Workflow

Imagine your Node.js API has an endpoint:

```text
GET /api/users/101/orders
```

The endpoint is slow because it retrieves the user's orders.

The SQL query is:

```sql
SELECT *
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

### Step 1: Inspect the execution plan

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

### Step 2: Identify the expensive operations

Look for:

- Sequential scans on large tables.
- Large row counts.
- Expensive sorts.
- High buffer reads.
- Large differences between estimated and actual rows.

### Step 3: Understand the access pattern

The query:

- Filters by `user_id`.
- Sorts by `created_at DESC`.
- Returns only 20 rows.

### Step 4: Create a suitable index

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

### Step 5: Refresh statistics if necessary

```sql
ANALYZE orders;
```

### Step 6: Execute the query again

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

### Step 7: Compare

Check whether:

- PostgreSQL uses the new index.
- The explicit sort is eliminated.
- Fewer pages are accessed.
- Execution time improves.

### Step 8: Verify at application level

Test the API under realistic load.

Database execution time and end-to-end API latency are different measurements. The application also spends time on network communication, connection pooling, serialization, and other processing.

---

## 14. Important Distinction: Index Does Not Mean No Table Scan

A common misconception is:

"If a query has an index, PostgreSQL will always avoid scanning the table."

Incorrect.

There are several possible plans:

| Plan             | Uses index?                     | Visits heap? |
| ---------------- | ------------------------------- | ------------ |
| Seq Scan         | No                              | Yes          |
| Index Scan       | Yes                             | Usually      |
| Index Only Scan  | Yes                             | Sometimes    |
| Bitmap Heap Scan | Yes, through bitmap index scans | Yes          |

An index is an access structure, not a guarantee of faster execution.

The optimizer selects the plan it estimates to be cheapest.

---

## 15. Interview Questions

### Q1. What happens when a SQL query is executed?

It passes through parsing, analysis, rewriting, planning, and execution. The executor runs the selected plan and accesses the required data.

### Q2. What is a sequential scan?

A sequential scan reads table pages and checks rows against the query conditions.

### Q3. What is an Index Scan?

An Index Scan uses an index to find matching entries and normally fetches corresponding tuples from the table heap.

### Q4. What is the difference between Index Scan and Index Only Scan?

An Index Scan generally fetches the required table data from the heap. An Index Only Scan attempts to retrieve the required values from the index, using the visibility map to determine whether heap visibility checks can be skipped.

### Q5. What is a Bitmap Index Scan?

It identifies matching tuple locations through an index and builds a bitmap that can be used by a Bitmap Heap Scan to fetch relevant heap pages.

### Q6. What is BitmapAnd?

It combines multiple bitmap index results using an intersection operation.

### Q7. Why does PostgreSQL sometimes prefer a sequential scan over an index scan?

Because the query may return many rows, the table may be small, or the estimated cost of sequential access may be lower.

### Q8. What is selectivity?

The fraction of table rows matching a particular condition. Highly selective conditions match a small proportion of rows.

### Q9. What is the difference between Index Cond and Filter?

Index Cond helps locate matching index entries. Filter checks candidate rows after they have been retrieved by the plan node.

### Q10. Why might PostgreSQL ignore an existing index?

Possible reasons include:

- Low selectivity.
- Small table size.
- Outdated statistics.
- Incompatible expressions or data types.
- The planner estimates another plan is cheaper.

### Q11. What is the role of ANALYZE?

It collects table statistics used by the query planner to estimate row counts and execution costs.

### Q12. What is EXPLAIN ANALYZE?

It executes the query and reports the actual execution plan, including measured execution times and actual row counts.

### Q13. What is the difference between estimated cost and actual time?

Estimated cost is an internal planner measurement. Actual time is the measured execution time, reported in milliseconds.

### Q14. Can PostgreSQL combine multiple indexes?

Yes. It can combine index results using BitmapAnd or BitmapOr when the planner determines that the strategy is beneficial.

### Q15. Does an Index Only Scan always avoid heap access?

No. PostgreSQL may still visit heap pages when the visibility map cannot establish that the relevant pages are all-visible.

---

## 16. Chapter Summary

| Concept           | Key takeaway                                              |
| ----------------- | --------------------------------------------------------- |
| Query pipeline    | Parse → Analyze → Rewrite → Plan → Execute                |
| Query optimizer   | Selects an execution strategy based on estimated costs    |
| Sequential Scan   | Reads table pages sequentially                            |
| Index Scan        | Uses an index and normally fetches heap tuples            |
| Bitmap Index Scan | Builds a bitmap of matching tuple locations               |
| Bitmap Heap Scan  | Fetches relevant heap pages using the bitmap              |
| BitmapAnd         | Combines multiple index results                           |
| Index Only Scan   | Attempts to retrieve results directly from the index      |
| Visibility Map    | Helps PostgreSQL avoid unnecessary heap visibility checks |
| Index Cond        | Condition used to locate index entries                    |
| Filter            | Condition applied to candidate rows                       |
| Selectivity       | Fraction of rows matching a condition                     |
| ANALYZE           | Collects statistics for the planner                       |
| EXPLAIN ANALYZE   | Shows actual execution behavior                           |

### The most important mental model

When a query executes, PostgreSQL does not blindly use an index.

It evaluates possible execution strategies, estimates their costs, and selects a plan.

The key skill for a backend developer is not simply knowing how to create indexes. It is knowing how to **read execution plans, identify expensive operations, understand why the optimizer chose them, and design indexes that improve real workloads.**
