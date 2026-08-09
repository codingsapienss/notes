---
sidebar_label: "EXPLAIN and EXPLAIN ANALYZE"
sidebar_position: 1
---

# EXPLAIN and EXPLAIN ANALYZE

## 1. Introduction

PostgreSQL provides `EXPLAIN` commands to understand how a SQL query will be executed.

They help answer questions such as:

- Is PostgreSQL using an index or performing a sequential scan?
- Which table is being scanned?
- How are tables joined?
- How many rows does PostgreSQL expect?
- How much time does query execution take?
- Where is the query spending most of its time?
- Is the query performing more work than expected?

The two most important commands are:

| Command           | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `EXPLAIN`         | Shows the estimated execution plan without executing the query |
| `EXPLAIN ANALYZE` | Executes the query and shows the actual execution statistics   |

---

## 2. EXPLAIN

### Syntax

```sql
EXPLAIN
SELECT *
FROM orders
WHERE customer_id = 101;
```

PostgreSQL returns an estimated execution plan.

Example output:

```text
Seq Scan on orders
  (cost=0.00..25.00 rows=5 width=40)
  Filter: (customer_id = 101)
```

### Understanding the output

| Field              | Meaning                                    |
| ------------------ | ------------------------------------------ |
| `Seq Scan`         | Sequential scan of the table               |
| `cost=0.00..25.00` | Estimated startup cost and total cost      |
| `rows=5`           | Estimated number of output rows            |
| `width=40`         | Estimated average output row size in bytes |
| `Filter`           | Condition applied to scanned rows          |

**Important:** Cost is an internal planner estimate, not execution time in milliseconds.

The planner uses statistics, configuration settings and cost estimates to choose an execution plan.

---

## 3. EXPLAIN ANALYZE

`EXPLAIN ANALYZE` actually executes the query and reports real execution statistics.

### Syntax

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE customer_id = 101;
```

Example output:

```text
Seq Scan on orders
  (cost=0.00..25.00 rows=5 width=40)
  (actual time=0.020..0.080 rows=5 loops=1)
  Filter: (customer_id = 101)
  Rows Removed by Filter: 995
Planning Time: 0.150 ms
Execution Time: 0.120 ms
```

### Understanding actual statistics

| Field                      | Meaning                                             |
| -------------------------- | --------------------------------------------------- |
| `actual time=0.020..0.080` | Time to produce the first row and complete the node |
| `rows=5`                   | Actual number of rows emitted per loop              |
| `loops=1`                  | Number of executions of the plan node               |
| `Rows Removed by Filter`   | Rows discarded by the filter                        |
| `Planning Time`            | Time spent generating the plan                      |
| `Execution Time`           | Total execution time                                |

The actual time values are in milliseconds.

### Important: EXPLAIN vs EXPLAIN ANALYZE

| EXPLAIN                                     | EXPLAIN ANALYZE                         |
| ------------------------------------------- | --------------------------------------- |
| Does not execute the query                  | Executes the query                      |
| Shows estimates                             | Shows estimates and actual measurements |
| Safer for expensive or modifying statements | Can consume resources and modify data   |
| Useful for understanding planner decisions  | Useful for measuring actual execution   |

**Warning:** `EXPLAIN ANALYZE` executes the statement. For example, using it with an UPDATE or DELETE actually changes data.

Use a transaction and roll it back when testing modifying statements:

```sql
BEGIN;

EXPLAIN ANALYZE
UPDATE orders
SET status = 'completed'
WHERE order_id = 101;

ROLLBACK;
```

This protects the database from retaining the modification, although the statement still executes and may acquire locks or trigger other side effects.

---

## 4. Sequential Scan (Seq Scan)

A sequential scan means PostgreSQL reads the table's heap pages and checks rows against the query condition.

Example:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE status = 'completed';
```

Possible plan:

```text
Seq Scan on orders
  (cost=0.00..50.00 rows=100 width=40)
  (actual time=0.020..0.500 rows=100 loops=1)
  Filter: (status = 'completed')
  Rows Removed by Filter: 900
```

Here:

- PostgreSQL scans the table.
- It checks the status condition.
- It returns matching rows.
- It discards rows that do not match.

### Is Seq Scan always bad?

No.

Sequential scans can be faster when:

- The table is small.
- A large percentage of rows must be returned.
- The table is physically stored efficiently for sequential access.
- An index scan would require many random heap accesses.

Do not assume that every query should use an index.

---

## 5. Index Scan

An index scan means PostgreSQL uses an index to locate matching entries and then retrieves the corresponding table rows when necessary.

### Create an index

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

Run:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE customer_id = 101;
```

Possible output:

```text
Index Scan using idx_orders_customer_id on orders
  (cost=0.15..8.20 rows=5 width=40)
  (actual time=0.030..0.060 rows=5 loops=1)
  Index Cond: (customer_id = 101)
```

### Important terms

| Term                           | Meaning                                        |
| ------------------------------ | ---------------------------------------------- |
| `Index Scan`                   | Uses an index and retrieves matching heap rows |
| `using idx_orders_customer_id` | Name of the index being used                   |
| `Index Cond`                   | Condition used to search the index             |

### Index Cond vs Filter

These are not the same.

```text
Index Cond: (customer_id = 101)
Filter: (status = 'completed')
```

- `Index Cond`: Used to locate candidate rows through the index.
- `Filter`: Applied after candidate rows are retrieved.

An index can help with one condition while another condition is evaluated separately.

---

## 6. Bitmap Index Scan and Bitmap Heap Scan

PostgreSQL can use bitmap scans when an index identifies multiple matching rows.

Instead of immediately fetching heap rows one at a time, PostgreSQL builds a bitmap of matching tuple locations and then accesses the corresponding heap pages.

### Example

```sql
CREATE INDEX idx_orders_status
ON orders(status);
```

Query:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE status = 'completed';
```

Possible plan:

```text
Bitmap Heap Scan on orders
  Recheck Cond: (status = 'completed')
  -> Bitmap Index Scan on idx_orders_status
       Index Cond: (status = 'completed')
```

### How it works

1. Bitmap Index Scan finds matching index entries.
2. PostgreSQL builds a bitmap of matching heap locations.
3. Bitmap Heap Scan accesses the relevant heap pages.
4. PostgreSQL returns matching rows.

### BitmapAnd

PostgreSQL can combine multiple indexes.

Suppose these indexes exist:

```sql
CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_status
ON orders(status);
```

Query:

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE customer_id = 101
  AND status = 'completed';
```

A possible plan:

```text
Bitmap Heap Scan on orders
  Recheck Cond: (
    (customer_id = 101)
    AND (status = 'completed')
  )
  -> BitmapAnd
       -> Bitmap Index Scan on idx_orders_customer
       -> Bitmap Index Scan on idx_orders_status
```

`BitmapAnd` combines matching locations from both indexes.

`BitmapOr` can combine locations when either condition matches.

**Important:** PostgreSQL chooses these strategies based on estimated costs. It is not guaranteed to combine indexes simply because multiple indexes exist.

---

## 7. Index Only Scan

An index-only scan retrieves the required values from the index without needing to access the table heap for every row.

Example:

```sql
CREATE INDEX idx_orders_customer_amount
ON orders(customer_id)
INCLUDE (total_amount);
```

Query:

```sql
EXPLAIN ANALYZE
SELECT
    customer_id,
    total_amount
FROM orders
WHERE customer_id = 101;
```

Possible output:

```text
Index Only Scan using idx_orders_customer_amount on orders
  Index Cond: (customer_id = 101)
  Heap Fetches: 0
```

### What does Heap Fetches mean?

- `Heap Fetches: 0` means no heap tuple visibility checks were needed for this scan.
- A positive number means PostgreSQL had to visit the heap for some visibility checks.

Index-only scans depend on the visibility map and the columns required by the query.

---

## 8. Understanding the Cost

Consider:

```text
(cost=0.00..125.50 rows=50 width=64)
```

There are two cost values:

```text
cost=startup_cost..total_cost
```

| Cost         | Meaning                                             |
| ------------ | --------------------------------------------------- |
| Startup cost | Estimated cost before the first row can be returned |
| Total cost   | Estimated cost to complete the node                 |

### Important points

- Costs are relative planner units, not milliseconds.
- PostgreSQL calculates them using configurable cost parameters.
- Costs help compare alternative plans.
- Costs are not directly comparable to execution time.
- A lower estimated cost does not guarantee lower actual execution time.

For example, an operation with a low startup cost may be useful for a query with `LIMIT`, even if its total cost is higher.

---

## 9. Understanding Rows and Width

Example:

```text
(cost=0.00..100.00 rows=200 width=120)
```

### rows

The planner estimates that the node will return 200 rows.

### width

The planner estimates that each output row will average 120 bytes.

These estimates influence planning decisions, including:

- Join strategy.
- Scan method.
- Memory requirements.
- Sorting and aggregation choices.

### Estimated rows vs actual rows

Suppose the plan shows:

```text
rows=1000
(actual rows=10)
```

This is a significant estimation error.

It may indicate:

- Outdated statistics.
- Data distribution that is difficult to estimate.
- Correlated columns.
- Skewed values.
- Insufficient statistics.

Large estimation errors can cause PostgreSQL to choose inefficient execution plans.

---

## 10. ANALYZE and Database Statistics

PostgreSQL uses table statistics to estimate query costs and row counts.

Run:

```sql
ANALYZE orders;
```

This collects statistics for the table.

To analyze all tables in the current database:

```sql
ANALYZE;
```

PostgreSQL's autovacuum system normally performs automatic analysis when needed.

### Check statistics

```sql
SELECT
    tablename,
    attname,
    n_distinct,
    null_frac,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE tablename = 'orders';
```

Important columns:

| Column              | Meaning                             |
| ------------------- | ----------------------------------- |
| `n_distinct`        | Estimated number of distinct values |
| `null_frac`         | Estimated fraction of NULL values   |
| `most_common_vals`  | Frequently occurring values         |
| `most_common_freqs` | Frequencies of those values         |

### When should you run ANALYZE?

Consider it after:

- Large bulk inserts.
- Large updates or deletes.
- Significant changes in data distribution.
- Investigating inaccurate row estimates.

`ANALYZE` updates planner statistics. It does not rebuild indexes.

---

## 11. EXPLAIN Options

PostgreSQL supports several options to provide more detailed execution information.

### 11.1 BUFFERS

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE customer_id = 101;
```

Shows buffer activity.

Important fields:

| Field                     | Meaning                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `Buffers: shared hit`     | Requested pages found in PostgreSQL shared buffers                  |
| `Buffers: shared read`    | Pages read into shared buffers from the operating system or storage |
| `Buffers: shared dirtied` | Shared buffer pages dirtied by the operation                        |
| `Buffers: shared written` | Shared buffer pages written by the operation                        |

A shared buffer hit does not necessarily mean the data was in physical RAM before the query; PostgreSQL's shared buffers and the operating system's page cache are different layers.

### 11.2 VERBOSE

```sql
EXPLAIN (VERBOSE)
SELECT *
FROM orders
WHERE customer_id = 101;
```

Provides additional details, including output expressions and relation information.

### 11.3 COSTS

```sql
EXPLAIN (COSTS OFF)
SELECT *
FROM orders
WHERE customer_id = 101;
```

Hides cost estimates.

### 11.4 SETTINGS

```sql
EXPLAIN (ANALYZE, SETTINGS)
SELECT *
FROM orders
WHERE customer_id = 101;
```

Shows relevant non-default planner settings that affect the plan.

### 11.5 WAL

```sql
EXPLAIN (ANALYZE, WAL)
UPDATE orders
SET status = 'completed'
WHERE order_id = 101;
```

Reports WAL-related statistics for supported operations.

**Warning:** This UPDATE executes. Use a test database or a transaction that you roll back.

### 11.6 FORMAT JSON

```sql
EXPLAIN (ANALYZE, FORMAT JSON)
SELECT *
FROM orders
WHERE customer_id = 101;
```

Returns the execution plan in JSON format, useful for programmatic analysis and tooling.

---

## 12. Join Execution Plans

PostgreSQL uses different algorithms to execute joins.

The three important join strategies are:

1. Nested Loop Join.
2. Hash Join.
3. Merge Join.

### 12.1 Nested Loop Join

Example:

```sql
EXPLAIN ANALYZE
SELECT
    c.customer_name,
    o.order_id
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id
WHERE c.customer_id = 101;
```

Possible plan:

```text
Nested Loop
  -> Index Scan using customers_pkey on customers c
       Index Cond: (customer_id = 101)
  -> Index Scan using idx_orders_customer_id on orders o
       Index Cond: (customer_id = c.customer_id)
```

How it works:

1. PostgreSQL retrieves a customer.
2. It searches for matching orders.
3. It repeats the inner operation for each outer row.

Useful when:

- The outer relation produces relatively few rows.
- The inner relation can be accessed efficiently, often through an index.

### 12.2 Hash Join

A hash join builds a hash table from one input and probes it using the other input.

Example:

```sql
EXPLAIN ANALYZE
SELECT
    c.customer_name,
    o.order_id
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id;
```

Possible plan:

```text
Hash Join
  Hash Cond: (o.customer_id = c.customer_id)
  -> Seq Scan on orders o
  -> Hash
       -> Seq Scan on customers c
```

How it works:

1. PostgreSQL reads one input.
2. It builds a hash table using the join key.
3. It reads the other input.
4. It probes the hash table for matches.

Useful for many equality joins, particularly when joining larger inputs.

### 12.3 Merge Join

A merge join combines two inputs that are ordered by their join keys.

Example:

```sql
EXPLAIN ANALYZE
SELECT
    c.customer_name,
    o.order_id
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id
ORDER BY c.customer_id;
```

Possible plan:

```text
Merge Join
  Merge Cond: (c.customer_id = o.customer_id)
  -> Index Scan using customers_pkey on customers c
  -> Index Scan using idx_orders_customer_id on orders o
```

How it works:

1. Both inputs are ordered by the join key.
2. PostgreSQL compares the current keys.
3. It advances through the inputs to find matching values.

Useful when inputs are already suitably ordered or sorting is economical.

### Comparison

| Join type   | Main approach              | Often useful when                                   |
| ----------- | -------------------------- | --------------------------------------------------- |
| Nested Loop | Repeated inner lookup      | Outer input is small                                |
| Hash Join   | Build and probe hash table | Equality joins on larger inputs                     |
| Merge Join  | Combine ordered inputs     | Inputs are already ordered or sorting is worthwhile |

No join strategy is universally fastest. PostgreSQL chooses based on estimated costs.

---

## 13. Sort and Aggregate Nodes

### Sort

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
ORDER BY created_at DESC;
```

Possible plan:

```text
Sort
  Sort Key: created_at DESC
  Sort Method: quicksort
  Memory: 80kB
  -> Seq Scan on orders
```

A Sort node indicates that PostgreSQL performs sorting during execution.

An appropriate index may allow PostgreSQL to avoid an explicit sort.

### Aggregate

```sql
EXPLAIN ANALYZE
SELECT
    customer_id,
    COUNT(*)
FROM orders
GROUP BY customer_id;
```

Possible plan:

```text
HashAggregate
  Group Key: customer_id
  -> Seq Scan on orders
```

Common aggregation nodes:

| Node             | Meaning                                                 |
| ---------------- | ------------------------------------------------------- |
| `HashAggregate`  | Groups rows using a hash table                          |
| `GroupAggregate` | Aggregates ordered groups                               |
| `Aggregate`      | Performs an aggregate operation, often without grouping |

---

## 14. Loops and Actual Time

Consider:

```text
Index Scan
  (actual time=0.010..0.020 rows=3 loops=10)
```

This node executed 10 times.

The displayed row count and time are generally averages per loop when loops is greater than one.

Approximate total rows emitted across executions:

```text
3 × 10 = 30 rows
```

Do not interpret `rows=3` as the total output across all 10 executions.

For performance investigation, pay particular attention to nodes with:

- High loop counts.
- High actual time.
- Large row counts.
- Significant rows removed by filters.

A cheap operation executed thousands of times can still dominate the total query work.

---

## 15. EXPLAIN ANALYZE for Production Queries

A practical investigation workflow:

### Step 1: Identify the slow query

Example:

```sql
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

### Step 2: Inspect the estimated plan

```sql
EXPLAIN
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

### Step 3: Execute with actual measurements

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

### Step 4: Identify the expensive operations

Look for:

- Sequential scans over large tables.
- Large estimated-versus-actual row differences.
- Expensive sorts.
- Nested loops with excessive iterations.
- Large buffer reads.
- Repeated scans of the same relation.

### Step 5: Consider an appropriate index

```sql
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at DESC);
```

### Step 6: Measure again

Run the same query with the same representative dataset.

Compare:

- Execution time.
- Buffer activity.
- Scan type.
- Rows processed.
- Whether the explicit Sort node disappeared.

Do not assume an index improved performance merely because PostgreSQL uses it. Compare actual measurements.

---

## 16. Important Production Considerations

### EXPLAIN ANALYZE executes queries

Avoid running expensive or destructive statements carelessly in production.

### Execution time varies

Performance can change because of:

- Cache state.
- Concurrent traffic.
- Lock contention.
- Data volume.
- Storage performance.
- CPU and memory pressure.

### Test with representative data

A query that performs well on 100 rows may behave very differently on 10 million rows.

### EXPLAIN ANALYZE is not a complete production monitoring solution

It measures a particular execution. Production monitoring should also track query frequency, latency distributions, resource consumption and concurrency.

### Do not disable planner strategies to force an index

Changing planner settings can be useful for controlled experiments, but it is not a substitute for fixing statistics, indexes or query design.

---

## 17. Practice Exercises

Use the TechBazaar database.

1. Run EXPLAIN on a query filtering orders by customer_id.
2. Run EXPLAIN ANALYZE on the same query.
3. Compare estimated rows with actual rows.
4. Create an index on `orders(customer_id)` and compare plans.
5. Test a query filtering orders by status.
6. Compare Seq Scan and Index Scan behavior on a small and a large table.
7. Create two separate indexes on customer_id and status. Investigate whether PostgreSQL chooses BitmapAnd.
8. Create a covering index using INCLUDE and investigate whether an Index Only Scan is possible.
9. Run EXPLAIN ANALYZE with BUFFERS.
10. Run ANALYZE on orders and inspect pg_stats.
11. Execute a join between customers and orders and identify its join strategy.
12. Identify a Sort node and investigate whether an index can support the ordering.
13. Run a GROUP BY query and identify its aggregation node.
14. Compare estimated and actual row counts for a query with multiple filters.
15. Test the same query before and after adding a suitable composite index.
16. Use FORMAT JSON and inspect the output structure.
17. Explain why EXPLAIN ANALYZE on UPDATE can be dangerous.
18. Identify a node with a high loop count and calculate its approximate total emitted rows.

---

## 18. Interview Questions

**Q1. What is EXPLAIN in PostgreSQL?**

It displays the query execution plan estimated by the PostgreSQL planner.

**Q2. What is EXPLAIN ANALYZE?**

It executes the query and reports actual execution statistics alongside the plan.

**Q3. What is the difference between cost and actual time?**

Cost is a planner estimate in relative units; actual time is measured execution time in milliseconds.

**Q4. What is a sequential scan?**

PostgreSQL scans the table's heap pages and checks rows against the query conditions.

**Q5. Is a sequential scan always bad?**

No. It can be more efficient for small tables or queries returning a large percentage of rows.

**Q6. What is an Index Scan?**

PostgreSQL uses an index to locate matching entries and retrieves the corresponding heap rows when needed.

**Q7. What is a Bitmap Heap Scan?**

It retrieves heap rows using a bitmap of matching tuple locations, often reducing random heap access.

**Q8. What is the difference between Index Cond and Filter?**

Index Cond helps locate candidates through the index. Filter evaluates additional conditions on candidate rows.

**Q9. What is an Index Only Scan?**

It retrieves required values from the index without needing heap access for every row, subject to visibility requirements.

**Q10. What is the purpose of ANALYZE?**

It collects table statistics used by the query planner to estimate row counts and costs.

**Q11. What is the difference between Hash Join and Nested Loop Join?**

Hash Join builds and probes a hash table. Nested Loop repeatedly searches the inner relation for each outer row.

**Q12. What is a Merge Join?**

It joins two ordered inputs by advancing through their join keys.

**Q13. What does loops mean in EXPLAIN ANALYZE?**

It indicates how many times a plan node was executed.

**Q14. What does BUFFERS show?**

It reports buffer activity, helping investigate memory-cache hits and reads.

**Q15. Why can estimated rows differ from actual rows?**

Statistics may be stale or insufficient to represent data distribution and column correlations.

**Q16. Does creating an index guarantee better performance?**

No. Index scans can be more expensive than sequential scans depending on selectivity, table size and access costs.

**Q17. What is the difference between Planning Time and Execution Time?**

Planning Time is spent generating the plan; Execution Time is spent executing the statement.

**Q18. Why should EXPLAIN ANALYZE be used carefully with UPDATE and DELETE?**

Because it actually executes the statement and modifies data.

---

## Key Takeaways

- `EXPLAIN` shows the estimated execution plan.
- `EXPLAIN ANALYZE` executes the query and reports actual measurements.
- `Seq Scan` reads table heap pages.
- `Index Scan` uses an index to locate matching rows.
- `Bitmap Index Scan` and `Bitmap Heap Scan` can efficiently retrieve multiple matching rows.
- `Index Only Scan` can avoid heap access when visibility requirements permit.
- Cost is an estimate, not execution time.
- Estimated row counts should be compared with actual row counts.
- `ANALYZE` collects planner statistics.
- PostgreSQL uses Nested Loop, Hash Join and Merge Join strategies.
- `BUFFERS` helps identify data-access behavior.
- Always measure query performance before and after optimization.
