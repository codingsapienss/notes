---
sidebar_label: part_06
sidebar_position: 1
---

#Indexing Tradeoffs & Maintenance

## 1. Introduction: Indexes Are Not Free

So far, we have studied how indexes improve query performance.

But there is another side to indexing.

Every index consumes storage and requires maintenance whenever relevant table data changes.

Consider a table:

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(30),
    total NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

Suppose we create these indexes:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_orders_created
ON orders(created_at);

CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
```

We have four additional indexes.

Every index can improve certain read queries, but PostgreSQL must also maintain these indexes when rows are inserted, updated, or deleted.

This introduces a fundamental tradeoff:

**Indexes improve selected read operations but increase storage requirements and write-maintenance costs.**

The goal is not to create as many indexes as possible. The goal is to create the right indexes for the application's actual workload.

---

## 2. Advantages of Indexing

### 2.1 Faster SELECT Queries

Consider:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

Without a suitable index, PostgreSQL may perform a sequential scan.

With:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);
```

PostgreSQL may locate matching rows more efficiently.

This is particularly useful for large tables and selective queries.

### 2.2 Faster JOIN Operations

Consider:

```sql
SELECT
    u.name,
    o.total
FROM users u
JOIN orders o
ON u.id = o.user_id;
```

An index on `orders.user_id` can improve certain join strategies, particularly when PostgreSQL uses indexed lookups into the orders table.

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);
```

The optimizer still decides whether to use the index or a different join algorithm.

### 2.3 Faster ORDER BY Operations

Consider:

```sql
SELECT *
FROM orders
WHERE user_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

A suitable index:

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

It can help PostgreSQL retrieve rows in the required order without performing a separate sort.

### 2.4 Enforcing Uniqueness

Indexes are also used to enforce data integrity.

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email);
```

This prevents duplicate non-NULL email values.

Alternatively:

```sql
ALTER TABLE users
ADD CONSTRAINT users_email_unique UNIQUE(email);
```

PostgreSQL creates a supporting unique index for the constraint.

### 2.5 Faster Range Queries

Consider:

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-01-01'
AND created_at < '2026-02-01';
```

A B-tree index on `created_at` can help locate rows within the requested date range.

---

## 3. Disadvantages of Indexing

### 3.1 Additional Storage

An index is a separate data structure stored alongside the table.

Suppose:

| Object             | Approximate size |
| ------------------ | ---------------: |
| Orders table       |             2 GB |
| User index         |           300 MB |
| Status index       |           150 MB |
| Created date index |           250 MB |
| Composite index    |           450 MB |

<text color="secondary" size="xs">Illustrative numbers, not actual PostgreSQL measurements.</text>

The total storage becomes approximately 3.15 GB.

As the table grows, indexes can also grow.

Consequences:

- More disk consumption.
- More backup storage.
- More data to maintain.
- Potentially more cache pressure.

### 3.2 Slower INSERT Operations

Consider:

```sql
INSERT INTO orders (
    user_id,
    status,
    total
)
VALUES (
    101,
    'pending',
    1500
);
```

Without additional indexes, PostgreSQL needs to insert the new row into the table and maintain indexes required by constraints.

With multiple indexes, PostgreSQL must also insert the appropriate entries into each relevant index.

Conceptually:

```text
             INSERT
                |
                v
           Orders Table
                |
       +--------+--------+
       |        |        |
       v        v        v
    Index 1  Index 2  Index 3
```

More indexes generally mean more write work.

### 3.3 Slower UPDATE Operations

Consider:

```sql
UPDATE orders
SET status = 'completed'
WHERE id = 101;
```

If `status` is indexed, the index must be maintained because the indexed value changes.

An update to an unindexed column can have a different cost profile.

However, PostgreSQL uses MVCC and creates new tuple versions for updates. Even when indexed values do not change, updates still have storage and maintenance implications.

### 3.4 Slower DELETE Operations

Consider:

```sql
DELETE FROM orders
WHERE id = 101;
```

PostgreSQL marks the relevant tuple version as deleted for MVCC purposes.

Index entries associated with the old tuple version are not necessarily removed immediately. Cleanup is handled through vacuuming and related maintenance.

This means deleted or obsolete tuple versions can temporarily contribute to storage usage.

### 3.5 Increased Maintenance

More indexes mean more work for:

- VACUUM.
- ANALYZE.
- Index cleanup.
- REINDEX when necessary.
- Backups and restores.
- Schema changes.

This can increase operational complexity.

---

## 4. What Happens Internally When Data Changes?

Understanding PostgreSQL's MVCC behavior is important here.

### 4.1 INSERT

When a row is inserted:

1. PostgreSQL creates a new heap tuple.
2. It creates index entries for relevant indexes.
3. WAL records are generated for durability and recovery.
4. The transaction commits when successful.

### 4.2 UPDATE

Consider:

```sql
UPDATE orders
SET status = 'completed'
WHERE id = 101;
```

PostgreSQL generally creates a new tuple version rather than modifying the old tuple in place.

Conceptually:

```text
Before UPDATE:

Tuple Version 1
status = pending


After UPDATE:

Tuple Version 1
status = pending
      |
      v
Tuple Version 2
status = completed
```

The old version may remain until it is no longer needed by active transactions and can be cleaned up.

If an indexed column changes, PostgreSQL must maintain the corresponding index entries.

### 4.3 HOT Updates

PostgreSQL supports Heap-Only Tuple (HOT) updates.

A HOT update can avoid creating new index entries when:

- No column referenced by a non-summarizing index is modified.
- There is enough free space on the same heap page for the new tuple version.

For example, if `status` is not indexed:

```sql
UPDATE orders
SET status = 'completed'
WHERE id = 101;
```

This update may qualify for HOT optimization if the page has enough space.

If `status` is indexed, changing it generally prevents this optimization.

This is one reason unnecessary indexes can increase update costs.

**Important:** HOT is an optimization, not a guarantee. Page space and index definitions matter.

---

## 5. Index Bloat

Index bloat refers to inefficiently occupied index space.

Over time, PostgreSQL tables and indexes can accumulate dead or obsolete entries due to:

- UPDATE operations.
- DELETE operations.
- Page splits.
- Changes in data distribution.
- Long-running transactions preventing cleanup.

### 5.1 Why does bloat matter?

Imagine an index initially occupies 500 MB.

After extensive updates and deletes, it may occupy significantly more space than necessary for its live entries.

Consequences:

- More disk space.
- More pages to read.
- Reduced cache efficiency.
- Potentially slower queries.

The exact impact depends on the index structure and workload.

### 5.2 How does PostgreSQL handle cleanup?

PostgreSQL uses VACUUM to reclaim space from dead tuples when they are no longer visible to active transactions.

For example:

```sql
VACUUM orders;
```

Or:

```sql
VACUUM (ANALYZE) orders;
```

`VACUUM` makes reusable space available within the relation and performs cleanup.

It generally does not return all reclaimed space to the operating system.

### 5.3 What about REINDEX?

When an index needs rebuilding:

```sql
REINDEX INDEX idx_orders_user;
```

This rebuilds the specified index.

For a larger production system, consider:

```sql
REINDEX INDEX CONCURRENTLY idx_orders_user;
```

Concurrent reindexing reduces blocking of normal table operations but has additional operational requirements and overhead.

---

## 6. VACUUM and ANALYZE

These are two important PostgreSQL maintenance operations.

### 6.1 VACUUM

PostgreSQL uses MVCC.

When a row is updated or deleted, old tuple versions may remain in the table.

VACUUM helps clean up tuple versions that are no longer needed.

```sql
VACUUM orders;
```

It helps:

- Make dead-tuple space reusable.
- Clean up obsolete index entries.
- Maintain visibility information.
- Prevent transaction ID wraparound through related maintenance processes.

### 6.2 ANALYZE

ANALYZE collects statistics about table data.

```sql
ANALYZE orders;
```

The query planner uses these statistics to estimate:

- Number of matching rows.
- Data distribution.
- Distinct values.
- Most common values.
- Selectivity of conditions.

Without reasonably current statistics, PostgreSQL may select a poor execution plan.

### 6.3 VACUUM ANALYZE

```sql
VACUUM ANALYZE orders;
```

This performs both operations.

| Operation      | Main purpose                                                         |
| -------------- | -------------------------------------------------------------------- |
| VACUUM         | Clean up obsolete tuple versions and maintain visibility information |
| ANALYZE        | Update planner statistics                                            |
| VACUUM ANALYZE | Perform both                                                         |

PostgreSQL normally handles routine vacuuming and analysis through autovacuum.

Manual commands are useful for maintenance and investigation, but they should not replace proper autovacuum configuration.

---

## 7. Autovacuum

Autovacuum is PostgreSQL's automatic maintenance mechanism.

It launches background workers to perform VACUUM and ANALYZE when configured thresholds are reached.

Why is it important?

Without sufficient vacuuming:

- Dead tuples can accumulate.
- Tables and indexes can become bloated.
- Visibility-map information may become less useful.
- Transaction ID wraparound risks can increase.

### 7.1 Check whether autovacuum is enabled

```sql
SHOW autovacuum;
```

### 7.2 Inspect table maintenance statistics

```sql
SELECT
    relname,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

Important columns:

| Column             | Meaning                    |
| ------------------ | -------------------------- |
| `n_live_tup`       | Estimated live tuple count |
| `n_dead_tup`       | Estimated dead tuple count |
| `last_vacuum`      | Last manual vacuum         |
| `last_autovacuum`  | Last automatic vacuum      |
| `last_analyze`     | Last manual analyze        |
| `last_autoanalyze` | Last automatic analyze     |

These are statistics, not exact real-time counts.

### 7.3 Why should backend developers care?

Imagine an application processing millions of orders and frequently updating order statuses.

Without effective vacuuming, dead tuples can accumulate.

A slow query may not be caused by a missing index alone. It could also involve table bloat, index bloat, outdated statistics, or long-running transactions.

---

## 8. Finding Unused or Duplicate Indexes

Indexes that are never used can waste storage and increase write overhead.

PostgreSQL exposes index usage statistics.

### 8.1 Find indexes with low usage

```sql
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

Important fields:

| Field           | Meaning                                          |
| --------------- | ------------------------------------------------ |
| `idx_scan`      | Number of index scans                            |
| `idx_tup_read`  | Number of index entries returned by scans        |
| `idx_tup_fetch` | Number of live table rows fetched by index scans |

A low `idx_scan` count may indicate an index is rarely used.

However, do not drop an index just because the count is low.

It may be:

- Required for a rare but important query.
- Needed for a unique constraint.
- Needed for foreign-key or integrity-related workloads.
- Recently created.
- Part of a workload not yet represented in the statistics.

Statistics can also reset, so consider the observation period.

### 8.2 Find index sizes

```sql
SELECT
    indexrelname AS index_name,
    pg_size_pretty(
        pg_relation_size(indexrelid)
    ) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 8.3 Find table and index sizes

```sql
SELECT
    relname AS table_name,
    pg_size_pretty(
        pg_relation_size(relid)
    ) AS table_size,
    pg_size_pretty(
        pg_indexes_size(relid)
    ) AS indexes_size,
    pg_size_pretty(
        pg_total_relation_size(relid)
    ) AS total_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

This helps identify tables whose indexes consume substantial storage.

### 8.4 Duplicate indexes

Consider:

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);

CREATE INDEX idx_orders_user_duplicate
ON orders(user_id);
```

These indexes have the same indexed column and ordering.

Maintaining both is generally unnecessary.

Before removing an index, verify that it is not required for a constraint or a distinct workload.

---

## 9. Index Maintenance Commands

PostgreSQL provides several commands for managing indexes.

### 9.1 Create an Index

```sql
CREATE INDEX idx_orders_user
ON orders(user_id);
```

### 9.2 Drop an Index

```sql
DROP INDEX idx_orders_user;
```

For production environments, consider:

```sql
DROP INDEX CONCURRENTLY idx_orders_user;
```

Concurrent dropping avoids taking the same level of blocking lock as a regular drop, but has operational restrictions.

### 9.3 Rebuild an Index

```sql
REINDEX INDEX idx_orders_user;
```

Or:

```sql
REINDEX INDEX CONCURRENTLY idx_orders_user;
```

### 9.4 Create an Index Concurrently

```sql
CREATE INDEX CONCURRENTLY idx_orders_created
ON orders(created_at);
```

This is particularly useful on production tables.

A normal `CREATE INDEX` blocks writes to the table while the index is being built.

`CREATE INDEX CONCURRENTLY` allows normal INSERT, UPDATE, and DELETE operations to continue during most of the build process.

However, it:

- Takes longer.
- Performs additional work.
- Cannot run inside a transaction block.
- Can leave an invalid index if the operation fails.

Check index validity when investigating a failed concurrent build.

Example:

```sql
SELECT
    indexrelid::regclass AS index_name,
    indisvalid,
    indisready
FROM pg_index
WHERE indrelid = 'orders'::regclass;
```

---

## 10. Production Indexing Strategy

Creating indexes in a production database requires more care than creating indexes locally.

Suppose your application has:

- 10 million users.
- 50 million orders.
- 100 million event logs.
- Thousands of queries per minute.

A poor indexing strategy can increase storage consumption and reduce write throughput.

Use a systematic process.

### Step 1: Identify slow queries

Use query logs and PostgreSQL monitoring tools.

The `pg_stat_statements` extension can help identify expensive query patterns.

### Step 2: Understand the query

Example:

```sql
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
```

Identify:

- Filter columns.
- Join columns.
- Sorting columns.
- Selected columns.
- Result limits.

### Step 3: Inspect the current execution plan

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE user_id = 101
AND status = 'pending'
ORDER BY created_at DESC
LIMIT 20;
```

### Step 4: Design the index

A possible index:

```sql
CREATE INDEX CONCURRENTLY idx_orders_user_status_created
ON orders(user_id, status, created_at DESC);
```

### Step 5: Measure the impact

Compare the query plan and execution time before and after.

### Step 6: Measure write impact

Observe:

- INSERT throughput.
- UPDATE throughput.
- Index storage.
- CPU usage.
- Disk I/O.
- Locking and index-build impact.

### Step 7: Monitor over time

A new index may look beneficial during testing but create additional costs under production traffic.

Monitor the workload over a representative period.

---

## 11. Read-Heavy vs Write-Heavy Workloads

Different applications require different indexing strategies.

### 11.1 Read-Heavy Applications

Example:

- Reporting dashboards.
- Product catalogs.
- Search and filtering.
- Analytics APIs.
- Read-intensive content platforms.

These applications execute many SELECT queries.

They can benefit from carefully designed indexes.

Example:

```sql
CREATE INDEX idx_products_category_price
ON products(category_id, price);
```

### 11.2 Write-Heavy Applications

Example:

- Event ingestion.
- Payment processing.
- Tracking systems.
- High-volume logging.
- Inventory updates.

These applications execute many INSERT and UPDATE operations.

Too many indexes can become expensive.

A write-heavy system may benefit from:

- Fewer unnecessary indexes.
- Carefully chosen composite indexes.
- Appropriate partitioning.
- Batch inserts where appropriate.
- Efficient schema and query design.

### Comparison

| Feature        | Read-heavy workload                      | Write-heavy workload             |
| -------------- | ---------------------------------------- | -------------------------------- |
| Main priority  | Fast retrieval                           | High write throughput            |
| Index strategy | More targeted read indexes may be useful | Minimize unnecessary indexes     |
| Main risk      | Excessive index storage                  | Index maintenance overhead       |
| Optimization   | Query access paths                       | Write efficiency and maintenance |

Neither workload should blindly maximize or minimize indexes. The correct strategy follows the actual workload.

---

## 12. Indexing and Database Scaling

Indexes improve query execution within a database, but they do not solve every scaling problem.

Consider a table containing 500 million event records.

Even with indexes, the system may face:

- Large storage requirements.
- Expensive maintenance.
- High write throughput.
- Large backup sizes.
- Increased operational complexity.

Other database techniques may become necessary.

### 12.1 Partitioning

Partitioning divides a large logical table into smaller physical partitions.

For example, event logs can be partitioned by month.

```sql
CREATE TABLE event_logs (
    id BIGINT,
    user_id BIGINT,
    event_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL
)
PARTITION BY RANGE (created_at);
```

Example partition:

```sql
CREATE TABLE event_logs_2026_11
PARTITION OF event_logs
FOR VALUES FROM ('2026-11-01')
TO ('2026-12-01');
```

Partition pruning can help PostgreSQL avoid scanning irrelevant partitions.

Partitioning and indexing solve different problems:

- Partitioning organizes data into smaller partitions.
- Indexing provides efficient access paths within tables or partitions.

They can be used together.

### 12.2 Replication

Replication creates copies of database data on other servers.

It can help distribute read traffic and improve availability.

Indexes are generally maintained on the replicated database as part of database changes being applied.

Replication does not eliminate the need for proper indexing.

### 12.3 Sharding

Sharding distributes data across multiple database instances.

It can help distribute storage and workload beyond the capacity of one database server.

However, it introduces additional complexity around routing, joins, transactions, and consistency.

Indexing remains important within each shard.

---

## 13. Common Indexing Mistakes

| Mistake                                               | Why it is problematic                                         |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| Indexing every column                                 | Increases storage and write overhead                          |
| Keeping duplicate indexes                             | Wastes resources                                              |
| Ignoring write performance                            | Index maintenance can reduce throughput                       |
| Never checking index usage                            | Unnecessary indexes accumulate                                |
| Ignoring VACUUM                                       | Dead tuples and maintenance problems can accumulate           |
| Ignoring statistics                                   | Planner may make poor decisions                               |
| Rebuilding indexes without evidence                   | Causes unnecessary operational work                           |
| Creating indexes during peak traffic without planning | Can affect production performance                             |
| Assuming indexes solve every scaling issue            | Large systems may need partitioning, replication, or sharding |

---

## 14. Practical Lab

Use the following exercises to understand indexing overhead and maintenance.

### Step 1: Create a table

```sql
CREATE TABLE test_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(30),
    total NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Insert sample data

```sql
INSERT INTO test_orders (
    user_id,
    status,
    total
)
SELECT
    (random() * 10000)::BIGINT + 1,

    CASE
        WHEN random() < 0.5 THEN 'completed'
        WHEN random() < 0.8 THEN 'pending'
        ELSE 'cancelled'
    END,

    (random() * 10000)::NUMERIC(10, 2)

FROM generate_series(1, 1000000);
```

### Step 3: Check table size

```sql
SELECT
    pg_size_pretty(
        pg_relation_size('test_orders')
    ) AS table_size;
```

### Step 4: Create indexes

```sql
CREATE INDEX idx_test_orders_user
ON test_orders(user_id);

CREATE INDEX idx_test_orders_status
ON test_orders(status);

CREATE INDEX idx_test_orders_created
ON test_orders(created_at);
```

### Step 5: Check index sizes

```sql
SELECT
    indexrelname,
    pg_size_pretty(
        pg_relation_size(indexrelid)
    ) AS index_size
FROM pg_stat_user_indexes
WHERE relname = 'test_orders';
```

### Step 6: Test a query

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM test_orders
WHERE user_id = 101;
```

### Step 7: Test write operations

```sql
INSERT INTO test_orders (
    user_id,
    status,
    total
)
VALUES (
    101,
    'pending',
    1500
);
```

Compare the workload before and after adding indexes using repeatable benchmarks rather than timing a single INSERT.

### Step 8: Inspect dead tuples and maintenance

```sql
SELECT
    relname,
    n_live_tup,
    n_dead_tup,
    last_autovacuum,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE relname = 'test_orders';
```

### Step 9: Run VACUUM ANALYZE

```sql
VACUUM ANALYZE test_orders;
```

### Step 10: Inspect the updated statistics

Run the query in Step 8 again.

Observe how maintenance information changes.

---

## 15. Important Interview Questions

### Q1. What are the disadvantages of database indexes?

- Additional storage.
- Slower INSERT, UPDATE, and DELETE operations.
- Maintenance overhead.
- Potential index bloat.
- Increased operational complexity.

### Q2. Why do indexes slow down INSERT operations?

Because PostgreSQL must insert the new row and maintain relevant index entries.

### Q3. What happens to indexes during UPDATE?

If indexed values change, PostgreSQL must maintain the corresponding indexes. Updates also create new tuple versions under MVCC.

### Q4. What is a HOT update?

A Heap-Only Tuple update is a PostgreSQL optimization that can avoid creating new index entries when no column referenced by a non-summarizing index changes and there is enough free space on the same heap page.

### Q5. What is index bloat?

Index bloat is inefficiently occupied index space that can develop due to updates, deletes, page splits, and other workload effects.

### Q6. What is VACUUM?

A PostgreSQL maintenance operation that cleans up dead tuple versions when they are no longer needed and maintains visibility information.

### Q7. What is ANALYZE?

It collects statistics about table data so the query planner can make better execution-plan decisions.

### Q8. What is autovacuum?

PostgreSQL's automatic background mechanism for performing VACUUM and ANALYZE when configured thresholds are reached.

### Q9. Does VACUUM return all reclaimed space to the operating system?

No. Ordinary VACUUM generally makes space reusable within the relation rather than returning all of it to the operating system.

### Q10. What is REINDEX?

It rebuilds an index, which can help address index corruption or inefficient index structure.

### Q11. What is CREATE INDEX CONCURRENTLY?

It creates an index while allowing normal INSERT, UPDATE, and DELETE operations to continue during most of the build process.

It takes longer, has additional overhead, and cannot run inside a transaction block.

### Q12. How do you identify unused indexes?

Use PostgreSQL statistics such as `pg_stat_user_indexes` and inspect `idx_scan`.

Do not drop indexes based on one statistic without understanding their purpose and workload.

### Q13. How do you check index storage?

Use:

```sql
SELECT
    indexrelname,
    pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes;
```

### Q14. What is the difference between VACUUM and REINDEX?

- VACUUM cleans up dead tuple versions and maintains visibility information.
- REINDEX rebuilds the index structure.

They solve different maintenance problems.

### Q15. How would you optimize indexing in a production database?

1. Identify expensive queries.
2. Inspect execution plans.
3. Understand query patterns.
4. Create targeted indexes.
5. Measure read and write performance.
6. Monitor index usage and storage.
7. Remove genuinely unnecessary indexes.
8. Maintain statistics and vacuuming.

---

## 16. Chapter Summary

| Concept                   | Key takeaway                                                          |
| ------------------------- | --------------------------------------------------------------------- |
| Index advantages          | Faster selective searches, joins, sorting, and uniqueness enforcement |
| Index disadvantages       | Storage and write-maintenance overhead                                |
| INSERT overhead           | New index entries must be maintained                                  |
| UPDATE overhead           | Changes to indexed values require index maintenance                   |
| DELETE overhead           | Dead tuple versions require eventual cleanup                          |
| HOT update                | Can avoid new index entries under specific conditions                 |
| Index bloat               | Inefficiently occupied index space                                    |
| VACUUM                    | Cleans up obsolete tuple versions                                     |
| ANALYZE                   | Updates query planner statistics                                      |
| Autovacuum                | Automatically performs routine maintenance                            |
| REINDEX                   | Rebuilds an index                                                     |
| Concurrent index creation | Reduces blocking of normal writes during index creation               |
| Index monitoring          | Helps identify expensive or unused indexes                            |
| Partitioning              | Organizes large tables into partitions                                |
| Replication               | Maintains copies of database data                                     |
| Sharding                  | Distributes data across database instances                            |

### Final mental model

An index is a performance investment.

You spend:

- Disk space.
- Write throughput.
- Maintenance resources.
- Operational complexity.

In exchange, you gain faster access paths for selected queries.

The objective is not to maximize the number of indexes. It is to maximize the performance benefit of each index relative to its maintenance cost.

**A good backend developer knows not only how to create an index, but also when not to create one, when to remove one, and how to maintain it in production.**
