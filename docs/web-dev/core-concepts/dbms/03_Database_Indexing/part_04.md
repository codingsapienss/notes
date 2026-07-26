---
sidebar_label: Composite Indexes & Indexing Strategies
sidebar_position: 1
---

# Composite Indexes & Indexing Strategies

## 1. Single-Column Index vs Composite Index

Before understanding composite indexes, distinguish between two types of indexes.

### 1.1 Single-Column Index

A single-column index is created on one column of a table.

```sql
CREATE INDEX idx_users_email
ON users(email);
```

This index helps queries that search using the `email` column.

```sql
SELECT *
FROM users
WHERE email = 'user@example.com';
```

Conceptually, the index stores searchable entries containing:

| Indexed value     | Row reference |
| ----------------- | ------------- |
| alice@example.com | Row 1         |
| bob@example.com   | Row 2         |
| user@example.com  | Row 3         |

The database can use the index to locate matching rows without scanning the entire table.

### 1.2 Composite Index

A composite index, also called a multicolumn index, is an index created on two or more columns.

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

This index contains entries organized using both `user_id` and `status`.

It is useful for queries such as:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

Instead of maintaining separate indexes for every search condition, a composite index can efficiently support this recurring combination.

### 1.3 Comparison

| Feature                   | Single-column index        | Composite index             |
| ------------------------- | -------------------------- | --------------------------- |
| Number of indexed columns | One                        | Two or more                 |
| Example                   | `(email)`                  | `(user_id, status)`         |
| Best suited for           | Individual column searches | Combined search conditions  |
| Storage                   | Usually smaller            | Usually larger              |
| Query flexibility         | Focused on one column      | Depends on column order     |
| Maintenance               | Lower overhead             | Potentially higher overhead |

**Important:** A composite index is not automatically better than multiple single-column indexes. Its usefulness depends on actual query patterns.

---

## 2. Column Order in Composite Indexes

Column order is one of the most important concepts in composite indexing.

Consider:

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

The index column order is:

1. `user_id`
2. `status`

Conceptually, its entries are sorted first by `user_id`, and then by `status` within each `user_id` group.

For example:

| user_id | status    |
| ------: | --------- |
|     101 | cancelled |
|     101 | completed |
|     101 | pending   |
|     102 | cancelled |
|     102 | completed |
|     103 | completed |

This is a simplified illustration of the ordering. Actual PostgreSQL index entries also contain tuple references and implementation metadata.

### 2.1 Why does order matter?

Suppose we have this index:

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

Let's examine different queries.

**Query 1: Search using both columns**

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

<badge color="success">Good fit</badge>

Both indexed columns are constrained. PostgreSQL can efficiently locate the relevant index range.

**Query 2: Search using only the first column**

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

<badge color="success">Good fit</badge>

The index is ordered by `user_id` first, so it can efficiently find entries belonging to that user.

**Query 3: Search using only the second column**

```sql
SELECT *
FROM orders
WHERE status = 'completed';
```

<badge color="warning">Not an ideal fit</badge>

The index is primarily ordered by `user_id`, not `status`.

PostgreSQL may still choose to scan the index or use a skip-scan strategy in suitable circumstances, depending on the PostgreSQL version, data distribution, and query plan. However, you should not assume that this index efficiently supports a search on `status` alone.

If this query is frequent, a separate index may be appropriate:

```sql
CREATE INDEX idx_orders_status
ON orders(status);
```

### 2.2 The Leftmost-Prefix Principle

The leftmost-prefix principle is a common way to understand composite indexes.

For an index:

```sql
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at);
```

The useful leading-column combinations are:

| Query conditions              | How well the index fits                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `user_id`                     | Good                                                                |
| `user_id, status`             | Good                                                                |
| `user_id, status, created_at` | Good                                                                |
| `user_id, created_at`         | Can use `user_id`; `created_at` may not narrow the scan effectively |
| `status`                      | Generally not an efficient leading-column lookup                    |
| `created_at`                  | Generally not an efficient leading-column lookup                    |
| `status, created_at`          | Generally not an efficient leading-column lookup                    |

The key idea:

**A composite B-tree index is most effective when queries constrain its leading columns.**

This is especially important when designing indexes for frequently executed queries.

Note that PostgreSQL can sometimes use skip scans to exploit conditions on later columns even when an earlier column is not constrained. This is an optimization, not a reason to ignore column order.

---

## 3. How to Decide Column Order

A common mistake is assuming that the column with the highest cardinality must always come first.

That is an oversimplification.

Column order should be based on:

1. Actual query patterns.
2. Equality and range conditions.
3. Required sorting.
4. Whether queries need leading-column prefixes.
5. Data distribution and selectivity.
6. Other queries that should reuse the same index.

### 3.1 Equality Conditions Before Range Conditions

Consider:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed'
AND created_at >= '2026-01-01';
```

A suitable index is:

```sql
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at);
```

Why?

- `user_id` uses equality.
- `status` uses equality.
- `created_at` uses a range condition.

For a conventional multicolumn B-tree access path, equality constraints on leading columns followed by a range constraint on the next column are especially effective.

### 3.2 Why does the range condition usually come later?

Suppose the index is:

```sql
CREATE INDEX idx_orders_created_user_status
ON orders(created_at, user_id, status);
```

The first column is `created_at`.

If the query asks for:

```sql
WHERE created_at >= '2026-01-01'
AND user_id = 101
AND status = 'completed'
```

The database can use the date range to identify an index range. The conditions on `user_id` and `status` can still be checked, but they generally cannot narrow that initial range as effectively as leading equality conditions followed by the range.

This is why the following order is often preferable for the query:

```sql
(user_id, status, created_at)
```

**Practical rule:** Put frequently constrained equality columns before the first range column when designing a B-tree index for this access pattern.

This is a useful starting point, not an absolute rule. Sorting requirements and other queries may justify a different order.

---

## 4. Indexes on Multiple WHERE Conditions

Consider a table containing millions of orders.

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(30),
    total NUMERIC(10, 2),
    created_at TIMESTAMP
);
```

Suppose the application frequently executes:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

There are three possible indexing strategies.

### Strategy A: No Index

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

The database may perform a sequential scan.

Conceptually:

1. Read table rows.
2. Check `user_id`.
3. Check `status`.
4. Return matching rows.

Cost can become expensive when the table is large.

### Strategy B: Two Single-Column Indexes

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(status);
```

PostgreSQL may use both indexes and combine their results through a bitmap operation.

For example:

```text
Bitmap Index Scan on idx_orders_user
                 |
                 v
             BitmapAnd
                 ^
                 |
Bitmap Index Scan on idx_orders_status
                 |
                 v
          Bitmap Heap Scan
                 |
                 v
          Matching rows
```

The operations are conceptually:

1. Find matching row locations using the `user_id` index.
2. Find matching row locations using the `status` index.
3. Intersect the row locations.
4. Fetch the corresponding table rows.

This can be efficient, depending on selectivity and table size.

### Strategy C: Composite Index

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

Now the database can search using the combined key.

For a frequently executed query involving both conditions, this can be more efficient than combining separate indexes.

### Comparison

| Strategy                  | Advantages                    | Limitations                     |
| ------------------------- | ----------------------------- | ------------------------------- |
| No index                  | No index maintenance          | May require full table scan     |
| Two single-column indexes | Flexible for separate queries | May require bitmap combination  |
| Composite index           | Efficient combined lookup     | Column order affects usefulness |

**Practical conclusion:** If a particular combination of columns is frequently used together, consider a composite index. If columns are independently queried by many different workloads, separate indexes may be more appropriate.

---

## 5. Indexes for JOIN Operations

Indexes are important when joining large tables.

Consider two tables:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    total NUMERIC(10, 2)
);
```

We want to retrieve orders along with their users:

```sql
SELECT
    users.name,
    orders.total
FROM users
JOIN orders
ON users.id = orders.user_id;
```

### 5.1 Which columns should be indexed?

The `users.id` column is a primary key.

PostgreSQL automatically creates a unique B-tree index for a primary key.

However, PostgreSQL does **not** automatically create an index on the referencing foreign-key column `orders.user_id`.

We can create one:

```sql
CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

### 5.2 Why index the foreign-key column?

Suppose one user has thousands of orders.

The database can use the index to locate orders belonging to that user without scanning the entire orders table.

For example:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

This index can also help certain join execution plans.

### 5.3 Do we need indexes on both sides?

Not necessarily.

In this example:

- `users.id` already has an index because it is a primary key.
- `orders.user_id` may benefit from an index.

You should not blindly create duplicate indexes on both columns.

Also remember that the optimizer can choose different join algorithms:

- Nested Loop Join
- Hash Join
- Merge Join

An index is particularly useful for certain nested-loop access patterns, but a hash join may be faster for large scans. An index does not guarantee that the database will use it.

---

## 6. Indexes for ORDER BY

Indexes can help databases retrieve rows in the required order.

Consider:

```sql
SELECT *
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC;
```

Without a suitable index, the database may:

1. Find matching orders.
2. Sort them by `created_at`.
3. Return the results.

Sorting a large result set can consume memory and CPU and may require disk-based sorting.

### 6.1 Create a composite index

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

This index is ordered by:

1. `user_id`
2. `created_at` descending within each user.

Now PostgreSQL can potentially retrieve a user's orders in the required order directly from the index.

Conceptually:

```text
Index: (user_id ASC, created_at DESC)

user_id = 101
    |
    +-- 2026-11-14
    +-- 2026-11-12
    +-- 2026-11-10
    +-- 2026-11-08
```

### 6.2 Why does the column order matter?

Consider this index instead:

```sql
CREATE INDEX idx_orders_created_user
ON orders(created_at DESC, user_id);
```

It is primarily ordered by `created_at`, not by `user_id`.

It is therefore not an equivalent replacement for the previous index when retrieving one user's orders in date order.

### 6.3 ASC and DESC

PostgreSQL B-tree indexes can be scanned in forward or backward order.

For a single-column index, an ascending index can often serve a descending sort through a backward scan.

However, direction matters for mixed-order multicolumn sorting.

Consider:

```sql
SELECT *
FROM orders
ORDER BY user_id ASC, created_at DESC;
```

A matching index is:

```sql
CREATE INDEX idx_orders_user_created_mixed
ON orders(user_id ASC, created_at DESC);
```

An index with both columns ascending cannot necessarily satisfy this mixed ordering through a simple forward or backward scan.

**Important:** An index can help with sorting, but the planner may still choose an explicit sort if that is cheaper.

---

## 7. Covering Indexes

A covering index is an index that contains all the columns needed by a particular query.

Consider:

```sql
SELECT user_id, created_at, status
FROM orders
WHERE user_id = 101;
```

A possible index is:

```sql
CREATE INDEX idx_orders_covering
ON orders(user_id, created_at, status);
```

The index contains all three columns required by the query.

The database may be able to return the requested values directly from the index rather than fetching each matching table row.

This is related to an **Index Only Scan** in PostgreSQL.

### 7.1 Why are covering indexes useful?

Normally, an index lookup may involve two steps:

```text
Index lookup
     |
     v
Find matching row location
     |
     v
Visit table (heap)
     |
     v
Read requested columns
```

With a suitable covering index:

```text
Index lookup
     |
     v
Read required values from index
     |
     v
Return results
```

Potential benefits:

- Fewer heap accesses.
- Less random I/O.
- Better performance for suitable read-heavy queries.

However, PostgreSQL still needs to verify tuple visibility.

An index-only scan can avoid heap visits only when the visibility map indicates that the relevant heap pages are all-visible. Otherwise, PostgreSQL may still perform heap fetches.

Therefore:

**Having all requested columns in an index does not guarantee that every execution will avoid heap access.**

---

## 8. PostgreSQL INCLUDE Columns

PostgreSQL supports the `INCLUDE` clause.

It allows us to store additional columns in an index without making them part of the index's search key or ordering.

Example:

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC)
INCLUDE (status, total);
```

Here:

| Column       | Role                    |
| ------------ | ----------------------- |
| `user_id`    | Search key              |
| `created_at` | Search key and ordering |
| `status`     | Included payload        |
| `total`      | Included payload        |

Consider:

```sql
SELECT user_id, created_at, status, total
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC;
```

The index contains all requested columns.

PostgreSQL may use an Index Only Scan if visibility conditions permit it.

### 8.1 Key Columns vs Included Columns

| Feature                             | Key columns | INCLUDE columns |
| ----------------------------------- | ----------- | --------------- |
| Used for index search               | Yes         | No              |
| Used for index ordering             | Yes         | No              |
| Stored in index                     | Yes         | Yes             |
| Can support index-only scans        | Yes         | Yes             |
| Affect uniqueness of a unique index | Yes         | No              |

For example:

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email)
INCLUDE (name);
```

This enforces uniqueness on `email`, not on the combination of `email` and `name`.

### 8.2 When should INCLUDE be used?

Use it when:

- A query frequently filters using a small set of key columns.
- It also returns a few additional columns.
- Avoiding heap access could improve performance.
- The additional storage and write overhead are acceptable.

Do not include every column in every index. Large included payloads increase index size and maintenance cost.

---

## 9. Partial Indexes Combined with Composite Indexes

A partial index stores entries only for rows satisfying a particular condition.

For example, suppose most queries retrieve pending orders.

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'pending';
```

We could create:

```sql
CREATE INDEX idx_pending_orders_user
ON orders(user_id)
WHERE status = 'pending';
```

This index contains only pending orders.

### 9.1 Partial Composite Index

We can combine partial indexing with composite indexing:

```sql
CREATE INDEX idx_pending_orders_user_created
ON orders(user_id, created_at DESC)
WHERE status = 'pending';
```

This index:

- Contains only pending orders.
- Is organized by `user_id`.
- Stores orders in descending `created_at` order within each user.

It is suitable for:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'pending'
ORDER BY created_at DESC;
```

### 9.2 Why is this useful?

Imagine:

- Total orders: 10 million.
- Pending orders: 200,000.
- Completed orders: 8 million.
- Cancelled orders: 1.8 million.

A partial index on pending orders may be substantially smaller than a full-table index.

Potential advantages:

- Less index storage.
- Fewer index entries to maintain.
- Faster searches for the targeted workload.

### 9.3 Important limitation: Predicate matching

PostgreSQL must be able to establish that the query condition implies the partial-index predicate.

For example, this query clearly matches:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'pending';
```

But a parameterized query such as:

```sql
SELECT *
FROM orders
WHERE user_id = $1
AND status = $2;
```

may not always use the partial index, especially when PostgreSQL uses a generic prepared plan and cannot prove that `$2` is always `'pending'`.

Always inspect the actual execution plan.

---

## 10. Real-World Indexing Strategies

Let's apply these concepts to backend application scenarios.

### 10.1 User Login

Query:

```sql
SELECT *
FROM users
WHERE email = 'user@example.com';
```

Recommended index:

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email);
```

Why?

- Email is frequently used for login.
- A unique constraint is often required.
- Lookup is based on one column.

Note: If you define `email` as a `UNIQUE` constraint, PostgreSQL automatically creates the supporting unique index. You do not need to create another one.

### 10.2 User Order History

Query:

```sql
SELECT *
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

Recommended index:

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

Why?

- Filter by user.
- Retrieve newest orders first.
- `LIMIT 20` allows the database to stop after finding the required rows when the plan supports it.

### 10.3 Filter Orders by Status and Date

Query:

```sql
SELECT *
FROM orders
WHERE status = 'completed'
AND created_at >= '2026-01-01';
```

Possible index:

```sql
CREATE INDEX idx_orders_status_created
ON orders(status, created_at);
```

Why?

- Equality condition on status.
- Range condition on created_at.

But this is workload-dependent. If nearly all orders have the same status, the index may be less selective than expected.

### 10.4 Pending Orders for a User

Query:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'pending'
ORDER BY created_at DESC;
```

Possible index:

```sql
CREATE INDEX idx_pending_user_created
ON orders(user_id, created_at DESC)
WHERE status = 'pending';
```

Why?

- Targets only pending orders.
- Supports user lookup.
- Supports descending date order.

### 10.5 Inventory Lookup

Query:

```sql
SELECT *
FROM inventory
WHERE product_id = 500
AND warehouse_id = 10;
```

Possible index:

```sql
CREATE INDEX idx_inventory_product_warehouse
ON inventory(product_id, warehouse_id);
```

Why?

- Both conditions are frequently used together.
- Composite lookup can be efficient.

If the application also frequently searches by `warehouse_id` alone, consider whether a separate index is needed.

### 10.6 Event Logs

Query:

```sql
SELECT *
FROM event_logs
WHERE user_id = 101
AND event_type = 'game_completed'
AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

Possible index:

```sql
CREATE INDEX idx_events_user_type_created
ON event_logs(user_id, event_type, created_at DESC);
```

Why?

- Equality on `user_id`.
- Equality on `event_type`.
- Range and ordering on `created_at`.

For very large append-heavy event tables, other approaches such as time partitioning and BRIN indexes may also be worth evaluating. They solve different problems and should not be treated as automatic replacements for this B-tree index.

---

## 11. Common Indexing Mistakes

### Mistake 1: Creating an index on every column

Bad approach:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_orders_created
ON orders(created_at);

CREATE INDEX idx_orders_total
ON orders(total);
```

Creating indexes without understanding query patterns increases:

- Storage usage.
- INSERT overhead.
- UPDATE overhead.
- DELETE overhead.
- Maintenance and vacuum work.

Create indexes based on real workload requirements.

### Mistake 2: Ignoring column order

Suppose the application frequently executes:

```sql
WHERE user_id = 101
AND status = 'pending'
```

An index on:

```sql
(status, user_id)
```

can still support that query because both columns have equality conditions.

But it will not provide the same leading-prefix usefulness as:

```sql
(user_id, status)
```

when other queries search by `user_id` alone.

Choose the order based on the full workload, not one query in isolation.

### Mistake 3: Assuming the most selective column must come first

Higher selectivity can matter, but it is not the only factor.

Consider:

```sql
WHERE user_id = 101
AND status = 'completed'
ORDER BY created_at DESC
```

The index:

```sql
(user_id, status, created_at DESC)
```

may be more useful than an index ordered purely by cardinality.

Equality predicates, range conditions, ordering, and query reuse all matter.

### Mistake 4: Forgetting indexes on foreign-key columns

PostgreSQL does not automatically index the referencing side of a foreign key.

For example:

```sql
orders.user_id REFERENCES users(id)
```

If orders are frequently searched or joined by `user_id`, consider:

```sql
CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

### Mistake 5: Using a composite index for unrelated queries

Index:

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

Query:

```sql
SELECT *
FROM orders
WHERE status = 'pending';
```

This is not an ideal leading-column match.

A separate index may be necessary if this query is important.

### Mistake 6: Ignoring write overhead

Every additional index needs maintenance when its indexed data changes.

For example:

```sql
INSERT INTO orders (...)
VALUES (...);
```

The database must maintain the table and all relevant indexes.

Indexes improve some reads at the cost of additional writes and storage.

### Mistake 7: Assuming a covering index always eliminates table access

Even when every selected column exists in the index, PostgreSQL may need heap fetches to verify visibility.

Check the actual execution plan and heap fetch count.

### Mistake 8: Creating duplicate indexes

For example:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_user_duplicate
ON orders(user_id);
```

These indexes serve essentially the same purpose.

Duplicate indexes waste storage and increase write overhead.

A primary key or unique constraint may already provide the required index.

---

## 12. How to Verify Whether an Index Is Useful

Do not create an index and assume it works.

Use PostgreSQL's execution-plan tools.

### 12.1 EXPLAIN

```sql
EXPLAIN
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

`EXPLAIN` displays the planned execution strategy without executing the query.

### 12.2 EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

This actually executes the query and reports execution measurements.

Look for:

| Plan node         | Meaning                                   |
| ----------------- | ----------------------------------------- |
| Seq Scan          | Sequential table scan                     |
| Index Scan        | Index lookup followed by heap access      |
| Index Only Scan   | Attempts to return data from the index    |
| Bitmap Index Scan | Builds a bitmap of matching row locations |
| Bitmap Heap Scan  | Fetches matching heap pages               |
| Sort              | Explicit sorting operation                |

### 12.3 Example plan shape

A possible plan might look like:

```text
Index Scan using idx_orders_user_status
on orders
  Index Cond:
    ((user_id = 101)
     AND (status = 'completed'))
```

The exact plan depends on data size, statistics, selectivity, and planner cost estimates.

### 12.4 Important measurements

When evaluating a plan, inspect:

- Estimated rows versus actual rows.
- Actual execution time.
- Rows removed by filters.
- Heap fetches for index-only scans.
- Buffer reads and hits.
- Whether a sort is still required.

For deeper investigation:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed';
```

`BUFFERS` helps show buffer activity, which is useful when diagnosing I/O behavior.

Remember that `EXPLAIN ANALYZE` executes the query. Be careful when analyzing statements that modify data.

---

## 13. Practical Lab

Let's create a table and experiment with different index strategies.

### Step 1: Create the table

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    total NUMERIC(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Step 2: Insert test data

For a meaningful performance experiment, create a sufficiently large dataset.

```sql
INSERT INTO orders (
    user_id,
    status,
    total,
    created_at
)
SELECT
    (random() * 10000)::BIGINT + 1,

    CASE
        WHEN random() < 0.5 THEN 'completed'
        WHEN random() < 0.8 THEN 'pending'
        ELSE 'cancelled'
    END,

    (random() * 10000)::NUMERIC(10, 2),

    NOW() - (random() * INTERVAL '365 days')

FROM generate_series(1, 1000000);
```

### Step 3: Update table statistics

```sql
ANALYZE orders;
```

This collects statistics used by PostgreSQL's query planner.

### Step 4: Test without a composite index

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed'
ORDER BY created_at DESC;
```

### Step 5: Create a composite index

```sql
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at DESC);
```

### Step 6: Test again

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'completed'
ORDER BY created_at DESC;
```

Compare the plans.

Look for:

- Whether PostgreSQL chooses the new index.
- Whether it avoids an explicit sort.
- Whether fewer rows or pages are scanned.
- Whether execution time changes.

### Step 7: Test the leftmost-prefix concept

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 101;
```

Then:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE status = 'completed';
```

The first query can use the leading column of the composite index. The second is not an ideal fit because `status` is not the leading column.

The optimizer may still choose a sequential scan or another available strategy.

---

## 14. Important Interview Questions

### Q1. What is a composite index?

An index created on multiple columns.

Example:

```sql
CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

It is useful for queries that search using combinations of these columns.

### Q2. Why does column order matter in a composite index?

Because the index is organized according to its column order.

The leading columns determine which searches can efficiently locate a relevant index range.

### Q3. Explain the leftmost-prefix principle.

A composite B-tree index is generally most effective when queries constrain its leading columns.

For an index `(a, b, c)`, queries on `a`, `(a, b)`, and `(a, b, c)` are natural matches.

### Q4. Can an index on `(user_id, status)` be used for a query filtering only by `status`?

Generally, it is not an efficient leading-column match.

PostgreSQL may sometimes use skip scan or another index strategy, but a separate index on `status` may be more appropriate for a frequent status-only query.

### Q5. Should the most selective column always come first?

No.

Column order depends on query patterns, equality and range conditions, ordering, prefix reuse, and data distribution.

### Q6. What is a covering index?

An index that contains all the columns needed by a query, potentially allowing the database to return results without reading the table heap.

### Q7. What is INCLUDE in PostgreSQL?

`INCLUDE` adds non-key payload columns to an index.

These columns can help support index-only scans but do not participate in index search ordering or uniqueness.

### Q8. Does PostgreSQL automatically index foreign-key columns?

No.

It automatically creates an index for a primary key or unique constraint, but does not automatically index the referencing foreign-key column.

### Q9. Can PostgreSQL combine multiple indexes?

Yes.

It can use bitmap operations such as `BitmapAnd` and `BitmapOr` to combine index results.

### Q10. Can a composite index support ORDER BY?

Yes, if the index's column order and direction are compatible with the query's ordering requirements.

### Q11. What is a partial composite index?

A multicolumn index that stores entries only for rows satisfying a specified predicate.

Example:

```sql
CREATE INDEX idx_pending_orders
ON orders(user_id, created_at DESC)
WHERE status = 'pending';
```

### Q12. Why shouldn't we create too many indexes?

They increase storage usage and add maintenance overhead to INSERT, UPDATE, and DELETE operations.

### Q13. Does an index always improve query performance?

No.

For small tables, low-selectivity conditions, or queries returning most rows, a sequential scan may be faster.

### Q14. What is the difference between Index Scan and Index Only Scan?

- Index Scan: Uses the index to find rows and fetches table data from the heap.
- Index Only Scan: Attempts to return required values from the index itself, with heap visibility checks when necessary.

### Q15. How do you verify whether an index improves performance?

Use:

```sql
EXPLAIN ANALYZE
```

For more detailed I/O information:

```sql
EXPLAIN (ANALYZE, BUFFERS)
```

Compare actual execution plans, rows, buffer activity, and execution time.

---

## 15. Chapter Summary

| Concept             | Key takeaway                                                        |
| ------------------- | ------------------------------------------------------------------- |
| Single-column index | Index on one column                                                 |
| Composite index     | Index on multiple columns                                           |
| Column order        | Determines index organization and useful access patterns            |
| Leftmost-prefix     | Leading columns are especially important                            |
| Equality vs range   | Leading equality conditions followed by a range are often effective |
| WHERE conditions    | Composite indexes can support recurring combinations                |
| JOIN indexes        | Index frequently searched or joined columns where beneficial        |
| ORDER BY            | B-tree indexes can provide ordered retrieval                        |
| Covering index      | Contains all columns required by a query                            |
| INCLUDE             | Stores extra non-key columns in PostgreSQL                          |
| Partial index       | Stores only rows satisfying a predicate                             |
| Indexing strategy   | Must follow real application query patterns                         |
| EXPLAIN ANALYZE     | Verifies the actual execution strategy and performance              |

### The most important rules to remember

1. Do not create indexes blindly.
2. Design indexes around actual query patterns.
3. Understand composite-index column order.
4. Prefer equality conditions on leading columns before range conditions when appropriate.
5. Consider `ORDER BY` when designing composite indexes.
6. Use `INCLUDE` when additional columns can help index-only scans.
7. Use partial indexes for well-defined subsets of frequently queried data.
8. Do not forget index maintenance and write overhead.
9. Always verify performance using execution plans.

**Core mental model:**

An index is not just about which columns are indexed. It is also about the order in which those columns are organized and the queries the database needs to execute.
