---
sidebar_label: Database Indexing Fundamentals
sidebar_position: 1
---

# Database Indexing Fundamentals

## 1. What Is Database Indexing?

Imagine an e-commerce application with 10 million users.

You need to find a user using their email address:

```sql
SELECT *
FROM users
WHERE email = 'prashant@example.com';
```

Without an index, the database may need to examine millions of rows to find the matching user.

This is called a **Full Table Scan**.

An index provides an additional data structure that helps the database locate records without examining every row.

> A database index is a data structure that improves the speed of data retrieval by allowing the database to locate rows more efficiently.

Think of a database index like the index at the back of a textbook.

Without an index:

- You read every page.
- You search for the required topic.
- You eventually find the relevant page.

With an index:

- You look up the topic.
- You find the page number.
- You directly navigate to the relevant section.

Databases use the same fundamental idea, although their internal data structures are more sophisticated.

---

## 2. Why Do We Need Indexes?

Consider this table:

### Users Table

|  id | name     | email              | city    |
| --: | -------- | ------------------ | ------- |
|   1 | Rahul    | rahul@gmail.com    | Delhi   |
|   2 | Amit     | amit@gmail.com     | Noida   |
|   3 | Prashant | prashant@gmail.com | Lucknow |
|   4 | Neha     | neha@gmail.com     | Delhi   |
|   5 | Karan    | karan@gmail.com    | Mumbai  |

Suppose we execute:

```sql
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

The database needs to locate the matching row.

There are two broad approaches:

1. Scan the table.
2. Use an index to locate the row.

### 2.1 Without an Index

Suppose the database has 10 million records.

It may perform something conceptually similar to:

```text
Check Row 1
   |
   v
Check Row 2
   |
   v
Check Row 3
   |
   v
...
   |
   v
Check Row 10,000,000
```

In the worst case, it examines all 10 million rows.

For a table with N rows, a full scan has approximately O(N) row examination complexity.

### 2.2 With an Index

Suppose we create an index on email:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

The database now has an additional structure organized around email values.

Conceptually:

```text
Index on email
       |
       v
Locate prashant@gmail.com
       |
       v
Find corresponding row location
       |
       v
Fetch user record
```

Depending on the index structure, finding a matching key can take substantially fewer operations than scanning the entire table.

For a balanced tree index, lookup is typically O(log N), followed by the cost of retrieving the matching rows.

**Important:** An index does not guarantee that every query becomes faster. The query planner decides whether using the index is cheaper than scanning the table.

---

## 3. Full Table Scan vs Index Scan

These are two important database execution strategies.

### 3.1 Full Table Scan

A full table scan means the database examines the table's rows to identify records satisfying the query condition.

Example:

```sql
SELECT *
FROM users
WHERE city = 'Delhi';
```

If there is no useful index on `city`, the database may scan the table.

Conceptually:

```text
Users Table
--------------------------------
id | name      | city
--------------------------------
1  | Rahul     | Delhi       CHECK
2  | Amit      | Noida       CHECK
3  | Prashant  | Lucknow     CHECK
4  | Neha      | Delhi       CHECK
5  | Karan     | Mumbai      CHECK
--------------------------------

Result:
Rahul
Neha
```

It checks rows to determine which ones match.

### 3.2 Index Scan

Suppose we create:

```sql
CREATE INDEX idx_users_city
ON users(city);
```

Now the database can potentially use the index to find records where city is Delhi.

Conceptually:

```text
Index on city
-------------------------
Delhi      → Row 1, Row 4
Lucknow    → Row 3
Mumbai     → Row 5
Noida      → Row 2
-------------------------
```

The database locates the relevant index entries and retrieves the corresponding rows.

### 3.3 Comparison

| Feature                  | Full Table Scan                             | Index Scan                               |
| ------------------------ | ------------------------------------------- | ---------------------------------------- |
| Data examined            | Potentially all table rows                  | Relevant index entries and required rows |
| Lookup cost              | Approximately O(N) row examination          | Often O(log N + K) for a tree index      |
| Additional index storage | Not required                                | Required                                 |
| Best for                 | Small tables or queries returning many rows | Selective queries                        |
| Performance              | Can be expensive for large tables           | Often faster for selective queries       |

Here, K represents the number of matching rows.

---

## 4. How Does an Index Actually Store Data?

An index is not simply a shortcut or a pointer list.

It is an organized data structure maintained by the database.

For example, consider:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

Conceptually, the index stores entries similar to:

| Email              | Row Location |
| ------------------ | ------------ |
| amit@gmail.com     | Row 2        |
| karan@gmail.com    | Row 5        |
| neha@gmail.com     | Row 4        |
| prashant@gmail.com | Row 3        |
| rahul@gmail.com    | Row 1        |

The database can search the organized index to locate the required row.

The exact representation depends on the index type and database implementation.

### Important: Indexes Usually Store Keys and Row References

A conventional secondary index generally contains:

1. Indexed column value.
2. Information identifying the corresponding table row.

For example:

```text
email = prashant@gmail.com
             |
             v
      Row identifier
             |
             v
      Fetch table row
```

The row identifier is database-specific.

- PostgreSQL uses a tuple identifier (TID) for heap rows.
- InnoDB secondary indexes contain the primary key, which is used to locate the clustered record.

We will study these internal differences in later chapters.

---

## 5. What Happens When We Create an Index?

Consider this SQL:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

The database generally performs the following operations:

1. Reads the existing table data.
2. Extracts the email values.
3. Organizes index entries according to the selected index structure.
4. Stores the index.
5. Makes the index available to the query planner.

Conceptually:

```text
Existing Users Table
        |
        v
Extract email values
        |
        v
Organize index entries
        |
        v
Store index structure
        |
        v
Index available for queries
```

After creation, the database must maintain the index when relevant data changes.

For example:

```sql
INSERT INTO users (name, email, city)
VALUES ('Ravi', 'ravi@gmail.com', 'Noida');
```

The database must:

- Insert the new row into the table.
- Insert the corresponding entry into the email index.
- Maintain any other affected indexes and constraints.

Indexes are therefore not free.

---

## 6. Types of Basic Indexes

There are multiple types of database indexes.

We will study their internal structures and advanced use cases in Part 3B and Part 3C.

For now, understand these fundamental categories.

### 6.1 Primary Key Index

A primary key uniquely identifies each row.

Example:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);
```

In PostgreSQL, defining a primary key automatically creates a unique B-tree index.

This helps the database enforce uniqueness and locate rows efficiently.

Example:

```sql
SELECT *
FROM users
WHERE id = 100;
```

The primary key index can be used for this lookup.

### 6.2 Unique Index

A unique index ensures that duplicate indexed values are not allowed, subject to the database's NULL semantics.

Example:

```sql
CREATE UNIQUE INDEX idx_users_email_unique
ON users(email);
```

Now duplicate non-NULL email values are rejected.

Example:

```sql
INSERT INTO users (name, email)
VALUES ('Rahul', 'rahul@gmail.com');

INSERT INTO users (name, email)
VALUES ('Amit', 'rahul@gmail.com');
```

The second insertion fails because the email already exists.

**Important distinction:**

- A primary key is a table constraint that identifies each row.
- A unique index is an index that enforces uniqueness.
- A primary key automatically creates a unique index in PostgreSQL.
- A table can have only one primary key but can have multiple unique constraints.

### 6.3 Single-Column Index

An index created on one column.

```sql
CREATE INDEX idx_users_city
ON users(city);
```

Useful for queries such as:

```sql
SELECT *
FROM users
WHERE city = 'Delhi';
```

### 6.4 Composite Index

An index created on multiple columns.

```sql
CREATE INDEX idx_users_city_name
ON users(city, name);
```

It can help with queries involving the leading column and, depending on the query, additional indexed columns.

Example:

```sql
SELECT *
FROM users
WHERE city = 'Delhi'
  AND name = 'Neha';
```

The order of columns matters.

We will cover this in detail in Part 3D.

### 6.5 Partial Index

A partial index contains entries only for rows satisfying a specified condition.

Example:

```sql
CREATE INDEX idx_active_users
ON users(email)
WHERE status = 'active';
```

This index contains entries for active users rather than every user.

It can be useful when queries frequently target a small subset of rows.

Example:

```sql
SELECT *
FROM users
WHERE email = 'prashant@gmail.com'
  AND status = 'active';
```

PostgreSQL can use the partial index when the query predicate is compatible with the index condition.

---

## 7. When Should You Create an Index?

Creating indexes on every column is a bad strategy.

You should create indexes based on actual query patterns.

Consider a backend application with the following queries:

```sql
SELECT *
FROM users
WHERE email = 'user@gmail.com';
```

```sql
SELECT *
FROM orders
WHERE user_id = 100;
```

```sql
SELECT *
FROM orders
WHERE status = 'pending';
```

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-11-01';
```

These columns might be candidates for indexing:

- `users.email`
- `orders.user_id`
- `orders.status`
- `orders.created_at`

But whether each index is beneficial depends on:

- Table size
- Number of distinct values
- Distribution of values
- Query frequency
- Number of matching rows
- Write frequency
- Existing indexes
- Query execution plan

### 7.1 Index Columns Used in WHERE

Example:

```sql
SELECT *
FROM users
WHERE email = 'user@gmail.com';
```

Candidate:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

### 7.2 Index Columns Used in JOIN

Example:

```sql
SELECT *
FROM orders o
JOIN users u
ON o.user_id = u.id;
```

An index on `orders.user_id` may improve relevant join plans.

```sql
CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

The primary key on `users.id` is already indexed in PostgreSQL.

### 7.3 Index Columns Used in ORDER BY

Example:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC;
```

An index on `created_at` may help avoid a separate sorting operation, depending on the query plan and data distribution.

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at);
```

### 7.4 Index Columns Used in Range Queries

Example:

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-11-01'
  AND created_at < '2026-12-01';
```

A B-tree index on `created_at` can be useful for range lookups.

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at);
```

We will study B-tree indexing in Part 3B.

---

## 8. When Is an Index Not Useful?

Indexes are not automatically beneficial.

### 8.1 Small Tables

Suppose a table contains only 10 rows.

```sql
SELECT *
FROM countries
WHERE country_code = 'IN';
```

Scanning 10 rows may be cheaper than accessing an index and then fetching a table row.

The database may correctly choose a sequential scan.

### 8.2 Low-Selectivity Columns

Suppose an orders table contains 10 million records.

```text
status = pending      4 million
status = completed    5 million
status = cancelled    1 million
```

An index on `status` may not be useful for a query that returns 90% of the table.

Why?

The database might need to perform millions of index lookups and table-row fetches.

A sequential scan may be cheaper.

However, a low-cardinality column is not automatically a bad index candidate. Partial indexes, composite indexes, and workload-specific queries can change the calculation.

### 8.3 Queries Returning Most of the Table

Example:

```sql
SELECT *
FROM users;
```

An index on email does not help retrieve every user.

The database will generally prefer scanning the table.

### 8.4 Functions Applied to Indexed Columns

Consider:

```sql
SELECT *
FROM users
WHERE LOWER(email) = 'prashant@gmail.com';
```

A normal index on `email` may not directly support this expression.

In PostgreSQL, you can create an expression index:

```sql
CREATE INDEX idx_users_lower_email
ON users(LOWER(email));
```

Now the database can potentially use the expression index for the query.

---

## 9. Indexing Has a Cost

Indexes improve some read operations but introduce overhead.

This is one of the most important concepts in database optimization.

### 9.1 Additional Storage

An index requires disk space.

Suppose:

```text
Users Table: 2 GB
Email Index: 500 MB
City Index: 300 MB
Created At Index: 400 MB
```

Total storage becomes:

```text
2 GB + 500 MB + 300 MB + 400 MB
= 3.2 GB
```

These are illustrative numbers, not fixed index-size ratios.

### 9.2 Slower INSERT Operations

Suppose you have:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

When inserting a new user, the database must update:

1. The table.
2. The email index.
3. Any other affected indexes.

More indexes can increase insertion overhead.

### 9.3 Slower UPDATE Operations

Consider:

```sql
UPDATE users
SET email = 'new@gmail.com'
WHERE id = 10;
```

If email is indexed, the database must maintain the index to reflect the changed value.

Other indexed columns and indexes may also need maintenance depending on the update.

### 9.4 Slower DELETE Operations

When a row is deleted, the database must also maintain the relevant indexes.

For example:

```sql
DELETE FROM users
WHERE id = 10;
```

The index entries associated with that row must be handled according to the database's storage and maintenance mechanisms.

### 9.5 Index Tradeoff

| Operation   | Effect of Indexes                 |
| ----------- | --------------------------------- |
| SELECT      | Can improve lookup performance    |
| INSERT      | Adds index-maintenance overhead   |
| UPDATE      | May require index updates         |
| DELETE      | Requires index maintenance        |
| Storage     | Requires additional disk space    |
| Maintenance | Can require rebuilding or cleanup |

The goal is not to maximize the number of indexes.

The goal is to create the indexes that provide the best overall workload performance.

---

## 10. How to Check Whether PostgreSQL Uses an Index

Do not assume that creating an index means PostgreSQL will use it.

Use:

```sql
EXPLAIN
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

This displays the query plan without executing the query.

For actual execution statistics:

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

### 10.1 Example: Sequential Scan

You may see:

```text
Seq Scan on users
  Filter: (email = 'prashant@gmail.com')
```

Meaning:

PostgreSQL is scanning the table and filtering rows.

### 10.2 Example: Index Scan

You may see:

```text
Index Scan using idx_users_email on users
  Index Cond: (email = 'prashant@gmail.com')
```

Meaning:

PostgreSQL is using the index to locate the matching row.

### 10.3 Example: Bitmap Index Scan

You may see:

```text
Bitmap Heap Scan on users
  Recheck Cond: (city = 'Delhi')
  -> Bitmap Index Scan on idx_users_city
       Index Cond: (city = 'Delhi')
```

This is another index-based execution strategy.

PostgreSQL first identifies matching tuple locations using the index, then fetches the relevant table pages.

It can be beneficial when a query matches multiple rows.

We will study these execution strategies more deeply in Part 3E.

### 10.4 Important: Why Might PostgreSQL Ignore an Index?

Possible reasons:

- The table is small.
- The query returns a large percentage of rows.
- The index is not selective enough.
- The query uses an expression that does not match the index.
- Statistics suggest a sequential scan is cheaper.
- The indexed column is not useful for the query condition.

The optimizer chooses the plan it estimates will have the lowest cost.

An index being available does not mean it must be used.

---

## 11. Practical PostgreSQL Lab

Let's create a small database and experiment with indexing.

### Step 1: Create a Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Insert Sample Data

```sql
INSERT INTO users (name, email, city)
VALUES
('Rahul', 'rahul@gmail.com', 'Delhi'),
('Amit', 'amit@gmail.com', 'Noida'),
('Prashant', 'prashant@gmail.com', 'Lucknow'),
('Neha', 'neha@gmail.com', 'Delhi'),
('Karan', 'karan@gmail.com', 'Mumbai');
```

### Step 3: Check Query Plan Without an Email Index

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

Because the table is tiny, PostgreSQL will probably use a sequential scan.

### Step 4: Create an Index

```sql
CREATE INDEX idx_users_email
ON users(email);
```

### Step 5: Run the Query Again

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

PostgreSQL may still choose a sequential scan because the table is too small.

This is expected.

### Step 6: Inspect Existing Indexes

In `psql`:

```sql
\d users
```

You can also query PostgreSQL's index catalog:

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users';
```

### Step 7: Inspect Index Size

```sql
SELECT
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE relname = 'users';
```

### Step 8: Drop an Index

```sql
DROP INDEX idx_users_email;
```

Dropping an index removes the index structure but does not delete the table data.

**Lab tip:** For a meaningful performance comparison, experiment with a large dataset and compare execution plans and timings. Do not use `SET enable_seqscan = off` as proof that an index is beneficial; forcing a plan can hide the optimizer's actual decision.

---

## 12. Common Misconceptions

### Misconception 1: Indexes always make SELECT queries faster.

Incorrect.

An index may be slower than a sequential scan when a query returns a large portion of the table.

### Misconception 2: Every column should have an index.

Incorrect.

Every index adds storage and write-maintenance overhead.

Create indexes based on query patterns and measured performance.

### Misconception 3: Indexing a foreign key is automatic in PostgreSQL.

Incorrect.

PostgreSQL automatically creates an index for a primary key or unique constraint, but it does not automatically create an index on the referencing foreign-key column.

Example:

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id)
);
```

If your queries frequently filter or join using `orders.user_id`, consider:

```sql
CREATE INDEX idx_orders_user_id
ON orders(user_id);
```

### Misconception 4: A primary key is just a normal index.

Incorrect.

A primary key is a logical constraint that uniquely identifies rows and does not allow NULL values.

PostgreSQL implements it using a unique index.

### Misconception 5: Indexes store the entire table.

Not necessarily.

A conventional secondary index stores indexed key values and row-identifying information. Some index types and database implementations store additional data.

### Misconception 6: If an index exists, PostgreSQL will use it.

Incorrect.

The query planner decides whether using the index is cheaper.

### Misconception 7: Indexes eliminate the need for optimization.

Incorrect.

You still need good queries, appropriate data types, statistics, constraints, and an understanding of execution plans.

---

## 13. Interview Questions and Answers

### Q1. What is a database index?

An index is an auxiliary data structure that improves data retrieval by allowing the database to locate matching rows more efficiently.

### Q2. Why are indexes required?

They reduce the amount of data the database may need to examine for selective queries.

### Q3. What is a full table scan?

A full table scan examines the table's rows to identify records matching a query condition.

### Q4. What is an index scan?

An index scan uses an index to locate matching entries and retrieve the corresponding table rows.

### Q5. What is the time complexity of searching a B-tree index?

For a balanced B-tree, lookup is generally O(log N), followed by the cost of fetching matching rows.

### Q6. What are the disadvantages of indexes?

- Additional storage.
- Slower inserts.
- Additional update overhead.
- Additional delete overhead.
- Index maintenance costs.

### Q7. Does PostgreSQL automatically index foreign keys?

No. It automatically indexes primary keys and unique constraints, but not the referencing foreign-key columns.

### Q8. What is a unique index?

An index that enforces uniqueness of the indexed key values, subject to the database's NULL rules.

### Q9. What is a composite index?

An index created using multiple columns.

Example:

```sql
CREATE INDEX idx_users_city_name
ON users(city, name);
```

### Q10. How do you check whether PostgreSQL uses an index?

Use:

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'test@gmail.com';
```

### Q11. Why might PostgreSQL use a sequential scan even when an index exists?

Because the table may be small, the query may return many rows, or the estimated cost of using the index may be higher.

### Q12. Can indexes improve JOIN performance?

Yes. Indexes on join columns can improve relevant join execution plans, depending on the join algorithm, table sizes, and query selectivity.

### Q13. What is a partial index?

An index that contains entries only for rows satisfying a specified condition.

Example:

```sql
CREATE INDEX idx_active_users
ON users(email)
WHERE status = 'active';
```

---

## 14. Chapter Summary

### Core Concepts

| Concept             | Meaning                                                            |
| ------------------- | ------------------------------------------------------------------ |
| Database Index      | Data structure that improves data retrieval                        |
| Full Table Scan     | Examines table rows to find matching records                       |
| Index Scan          | Uses an index to locate matching records                           |
| Primary Key Index   | Unique index automatically created for a primary key in PostgreSQL |
| Unique Index        | Enforces uniqueness of indexed values                              |
| Single-Column Index | Index on one column                                                |
| Composite Index     | Index on multiple columns                                          |
| Partial Index       | Index containing only rows satisfying a condition                  |
| Sequential Scan     | PostgreSQL execution plan that scans the table                     |
| Index Maintenance   | Work required to keep indexes synchronized with table changes      |

### Most Important Takeaways

1. Indexes improve lookup performance by reducing the amount of data that needs to be examined.
2. A full table scan is not necessarily bad; it can be the cheapest execution strategy.
3. B-tree indexes commonly provide O(log N) lookup behavior.
4. Indexes consume additional storage.
5. Indexes introduce write-maintenance overhead.
6. Index columns based on actual query patterns.
7. PostgreSQL does not automatically index foreign-key columns.
8. Use `EXPLAIN ANALYZE` to inspect actual query execution.
9. The database optimizer decides whether an index should be used.
10. The goal is not maximum indexing; it is efficient overall database performance.
