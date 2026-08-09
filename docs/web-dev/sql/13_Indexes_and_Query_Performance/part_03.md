---
sidebar_label: "Composite and Specialized Indexes"
sidebar_position: 1
---

# Composite and Specialized Indexes

## 1. Introduction

Beyond basic single-column indexes, PostgreSQL supports advanced indexing techniques for queries involving multiple columns, expressions, partial conditions and specialized search patterns.

This chapter covers:

1. Composite (multi-column) indexes.
2. Column order and leftmost-prefix behavior.
3. Indexes with ASC and DESC ordering.
4. Covering indexes and INCLUDE.
5. Partial indexes.
6. Expression indexes.
7. Unique indexes with multiple columns.
8. Pattern-matching indexes.
9. Index-only scans.
10. Practical index design and optimization.

These techniques are important when optimizing production database queries.

---

## 2. Composite Indexes

A composite index is an index created on multiple columns.

It is also called a multi-column index.

### Syntax

```sql
CREATE INDEX index_name
ON table_name (column1, column2);
```

### Example

Suppose your application frequently executes:

```sql
SELECT *
FROM orders
WHERE customer_id = 101
  AND status = 'completed';
```

You can create a composite index:

```sql
CREATE INDEX idx_orders_customer_status
ON orders(customer_id, status);
```

This index stores entries ordered by the combination of:

1. `customer_id`
2. `status`

It can help PostgreSQL locate rows matching both conditions.

### Another example: Employee department and salary

```sql
CREATE INDEX idx_employees_department_salary
ON employees(department_id, salary);
```

Query:

```sql
SELECT *
FROM employees
WHERE department_id = 2
  AND salary > 50000;
```

This index can support the equality condition on `department_id` followed by the range condition on `salary`.

---

## 3. Column Order Matters

This is one of the most important concepts in composite indexing.

Consider:

```sql
CREATE INDEX idx_orders_customer_status
ON orders(customer_id, status);
```

The index is ordered primarily by `customer_id`, then by `status` within each customer.

### Query 1: Both columns

```sql
SELECT *
FROM orders
WHERE customer_id = 101
  AND status = 'completed';
```

<badge color="success">Good index match</badge>

Both indexed columns are used.

### Query 2: First column only

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

<badge color="success">Good index match</badge>

The leading column is available.

### Query 3: Second column only

```sql
SELECT *
FROM orders
WHERE status = 'completed';
```

<badge color="warning">Not an ideal match</badge>

The index is not generally efficient for this query because the leading column is not constrained.

PostgreSQL may still consider skip-scan strategies in suitable circumstances, but do not design an index assuming that a trailing-column-only query will be efficient.

### Comparison

| Index                   | Query                            | Expected usefulness |
| ----------------------- | -------------------------------- | ------------------- |
| `(customer_id, status)` | Filter by customer_id            | Good                |
| `(customer_id, status)` | Filter by customer_id and status | Good                |
| `(customer_id, status)` | Filter only by status            | Usually limited     |
| `(status, customer_id)` | Filter only by status            | Good                |
| `(status, customer_id)` | Filter by both columns           | Good                |

**Rule:** Put columns in an order that matches your important query patterns. Equality conditions commonly come before range conditions, but actual workload and selectivity matter.

---

## 4. Composite Index vs Multiple Single-Column Indexes

Suppose your application frequently runs:

```sql
SELECT *
FROM orders
WHERE customer_id = 101
  AND status = 'completed';
```

Option A: Two separate indexes.

```sql
CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_status
ON orders(status);
```

Option B: One composite index.

```sql
CREATE INDEX idx_orders_customer_status
ON orders(customer_id, status);
```

### Comparison

| Separate indexes                                | Composite index                                    |
| ----------------------------------------------- | -------------------------------------------------- |
| Each indexes one column                         | Indexes a combination of columns                   |
| PostgreSQL may combine indexes using BitmapAnd  | Directly supports the indexed column combination   |
| Can support queries on either individual column | Most effective when queries use the leading column |
| Requires multiple index structures              | Requires one index structure                       |

PostgreSQL can combine multiple indexes using bitmap scans.

For example, it may use `BitmapAnd` to combine the results of separate customer and status indexes.

A composite index is not automatically better. Choose based on the actual mix of queries and write workload.

---

## 5. Index Ordering — ASC and DESC

B-tree indexes can store ordering specifications for individual columns.

### Example

```sql
CREATE INDEX idx_orders_created_at_desc
ON orders(created_at DESC);
```

This can support queries such as:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 20;
```

### Composite index with different ordering

```sql
CREATE INDEX idx_orders_customer_created
ON orders(
    customer_id ASC,
    created_at DESC
);
```

Useful query:

```sql
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC;
```

### Why does ordering matter?

Consider an index on:

```sql
(customer_id ASC, created_at ASC)
```

A backward scan reverses the ordering of both columns.

It does not directly produce:

```text
customer_id ASC, created_at DESC
```

for multiple customer groups.

For mixed-direction ordering, specify the required direction in the index definition.

**Important:** For a single-column B-tree index, PostgreSQL can scan forward or backward. Explicit DESC is not necessary merely because a query sorts one column descending.

---

## 6. Covering Indexes and INCLUDE

A covering index contains all columns needed by a particular query, allowing PostgreSQL to potentially return results without fetching the corresponding table rows.

PostgreSQL supports this through `INCLUDE`.

### Syntax

```sql
CREATE INDEX index_name
ON table_name (indexed_column)
INCLUDE (additional_column);
```

### Example

Query:

```sql
SELECT
    customer_id,
    total_amount
FROM orders
WHERE customer_id = 101;
```

Index:

```sql
CREATE INDEX idx_orders_customer_covering
ON orders(customer_id)
INCLUDE (total_amount);
```

The index contains:

- `customer_id` as an indexed search key.
- `total_amount` as an included value.

PostgreSQL may be able to perform an index-only scan.

### Important difference

```sql
CREATE INDEX idx_orders_customer_amount
ON orders(customer_id, total_amount);
```

Both columns are search keys.

But:

```sql
CREATE INDEX idx_orders_customer_covering
ON orders(customer_id)
INCLUDE (total_amount);
```

Only `customer_id` is a search key. `total_amount` is stored as an additional payload column.

### Another example

```sql
CREATE INDEX idx_employees_department_covering
ON employees(department_id)
INCLUDE (employee_name, salary);
```

Query:

```sql
SELECT
    employee_name,
    salary
FROM employees
WHERE department_id = 2;
```

This query may benefit from an index-only scan.

**Important:** INCLUDE does not guarantee an index-only scan. PostgreSQL must also be able to establish tuple visibility using its visibility map. Otherwise, it may still need heap fetches.

---

## 7. Partial Indexes

A partial index contains entries only for rows satisfying a specified WHERE condition.

It is useful when queries frequently target a subset of a large table.

### Syntax

```sql
CREATE INDEX index_name
ON table_name(column_name)
WHERE condition;
```

### Example: Index only pending orders

```sql
CREATE INDEX idx_orders_pending
ON orders(created_at)
WHERE status = 'pending';
```

Query:

```sql
SELECT *
FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC;
```

This index is smaller than a full-table index when pending orders represent only a small portion of the table.

### Example: Index active employees only

```sql
CREATE INDEX idx_employees_active_department
ON employees(department_id)
WHERE status = 'active';
```

Query:

```sql
SELECT *
FROM employees
WHERE status = 'active'
  AND department_id = 2;
```

### Example: Partial unique index

Suppose you want to enforce uniqueness only for non-NULL emails.

```sql
CREATE UNIQUE INDEX idx_customers_email_not_null
ON customers(email)
WHERE email IS NOT NULL;
```

This enforces uniqueness for non-NULL email values.

However, PostgreSQL's ordinary UNIQUE constraint already allows multiple NULLs by default, so this partial index is not needed merely to reproduce that behavior.

### Important rule

PostgreSQL must be able to prove that the query condition implies the partial-index predicate.

For example, an index defined with:

```sql
WHERE status = 'pending'
```

is naturally suited to queries that explicitly filter for pending rows.

A generic prepared query with a parameterized status may not always allow the planner to prove that the predicate applies, especially when using a generic plan.

---

## 8. Expression Indexes

An expression index indexes the result of an expression rather than only a raw column.

It is useful when queries repeatedly apply functions or transformations to columns.

### Example: Case-insensitive email lookup

Query:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@example.com';
```

A normal index on `email` may not efficiently support this expression.

Create an expression index:

```sql
CREATE INDEX idx_customers_lower_email
ON customers(LOWER(email));
```

Now PostgreSQL can potentially use the expression index for the query.

### Example: Index on a calculated value

```sql
CREATE INDEX idx_products_discounted_price
ON products(price * 0.90);
```

Query:

```sql
SELECT *
FROM products
WHERE price * 0.90 < 1000;
```

The query expression must match the indexed expression closely enough for PostgreSQL to recognize it.

### Important

Expression indexes:

- Store the calculated expression result in the index.
- Add maintenance cost when underlying values change.
- Can accelerate matching expression-based queries.
- Require immutable expressions in PostgreSQL index definitions.

---

## 9. Unique Composite Indexes

A unique composite index enforces uniqueness across a combination of columns.

### Example

Suppose each customer should have a unique order reference within their own account.

```sql
CREATE UNIQUE INDEX idx_orders_customer_reference
ON orders(customer_id, order_reference);
```

The existing TechBazaar `orders` schema does not contain `order_reference`. This is a proposed extension.

```sql
ALTER TABLE orders
ADD COLUMN order_reference VARCHAR(100);
```

Now the combination of `customer_id` and `order_reference` must be unique for non-NULL combinations under the default NULL-distinct behavior.

### Another example: Employee email per department

```sql
CREATE UNIQUE INDEX idx_employees_department_email
ON employees(department_id, email);
```

This also requires an `email` column on employees, which is not part of the supplied schema.

### Important

A composite unique index does not make each individual column unique.

For example:

```sql
CREATE UNIQUE INDEX idx_example
ON some_table(column_a, column_b);
```

These combinations can be valid:

| column_a | column_b |
| -------- | -------- |
| 1        | 10       |
| 1        | 20       |
| 2        | 10       |

But the exact same combination cannot be inserted twice, subject to NULL uniqueness semantics.

---

## 10. Pattern-Matching Indexes

Ordinary B-tree indexes have limitations with pattern matching.

### Prefix search

```sql
SELECT *
FROM customers
WHERE email LIKE 'rahul%';
```

A B-tree index may support prefix searches depending on collation and operator class.

For some non-C locale collations, a pattern operator class may be needed.

```sql
CREATE INDEX idx_customers_email_pattern
ON customers(email text_pattern_ops);
```

### Leading wildcard search

```sql
SELECT *
FROM customers
WHERE email LIKE '%gmail.com';
```

A normal B-tree index is generally not useful for this pattern because the search begins with a wildcard.

For substring searches, PostgreSQL's `pg_trgm` extension can help.

### Enable extension

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Create GIN trigram index

```sql
CREATE INDEX idx_customers_email_trgm
ON customers
USING GIN (email gin_trgm_ops);
```

Now PostgreSQL may use this index for:

```sql
SELECT *
FROM customers
WHERE email LIKE '%gmail.com';
```

It can also support similarity searches:

```sql
SELECT
    email,
    similarity(email, 'rahul@gmail.com') AS score
FROM customers
WHERE email % 'rahul@gmail.com'
ORDER BY score DESC;
```

The `%` operator checks whether similarity exceeds the configured threshold.

**Important:** Trigram indexes are useful for substring and similarity searches, but they are not a replacement for ordinary B-tree indexes.

---

## 11. Index-Only Scans

An index-only scan is an execution strategy where PostgreSQL can retrieve the requested values from an index without accessing the table heap for every row.

### Example

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

Possible plan:

```text
Index Only Scan using idx_orders_customer_amount
```

### Why is it useful?

It can reduce heap access, especially for queries that:

- Read relatively few columns.
- Use indexed filter conditions.
- Have suitable visibility-map coverage.

### Important: Visibility map

PostgreSQL uses the visibility map to determine whether all tuples on a heap page are visible to all relevant transactions.

If a page is marked all-visible, PostgreSQL can often avoid checking the heap for tuple visibility.

Otherwise, heap fetches may still be required.

---

## 12. Designing Indexes Based on Real Queries

Do not create indexes randomly.

Start with actual application queries.

### Query 1: Customer order history

```sql
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

Candidate index:

```sql
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at DESC);
```

### Query 2: Pending orders by creation time

```sql
SELECT *
FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC;
```

Candidate partial index:

```sql
CREATE INDEX idx_orders_pending_created
ON orders(created_at DESC)
WHERE status = 'pending';
```

### Query 3: Employee salary lookup by department

```sql
SELECT
    employee_name,
    salary
FROM employees
WHERE department_id = 2
ORDER BY salary DESC;
```

Candidate index:

```sql
CREATE INDEX idx_employees_department_salary
ON employees(department_id, salary DESC)
INCLUDE (employee_name);
```

### Query 4: Case-insensitive customer lookup

```sql
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@example.com';
```

Candidate index:

```sql
CREATE INDEX idx_customers_email_lower
ON customers(LOWER(email));
```

These are candidates. Validate each with representative data and execution plans.

---

## 13. Important Index Design Rules

| Rule                                            | Explanation                                                   |
| ----------------------------------------------- | ------------------------------------------------------------- |
| Match indexes to query patterns                 | Design around real WHERE, JOIN and ORDER BY clauses           |
| Consider column order                           | Leading columns strongly influence composite index usefulness |
| Prefer selective filters where appropriate      | They can reduce the number of rows retrieved                  |
| Use partial indexes for stable subsets          | Avoid indexing irrelevant rows                                |
| Use INCLUDE for output-only columns             | Avoid making every selected column part of the search key     |
| Use expression indexes for repeated expressions | Match the query expression                                    |
| Avoid redundant indexes                         | Extra indexes consume storage and increase write cost         |
| Measure before and after                        | Use EXPLAIN ANALYZE and representative workloads              |

### Important: More indexes do not mean better performance

Suppose an orders table has:

- One primary key index.
- A customer ID index.
- A status index.
- A customer + status index.
- A customer + created_at index.
- A created_at index.

Some of these may be useful, but others may be redundant depending on the actual workload.

Review existing indexes before creating new ones.

---

## 14. Common Mistakes

| Mistake                                                                                      | Correct understanding                              |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Creating `(customer_id, status)` and expecting it to efficiently support status-only queries | Leading-column order matters                       |
| Treating INCLUDE columns as search keys                                                      | INCLUDE columns are payload, not index search keys |
| Assuming a partial index is always used                                                      | The query predicate must imply the index predicate |
| Using a normal B-tree for `%substring%` searches                                             | Consider trigram indexing                          |
| Creating an expression index for a different expression than the query uses                  | Expression matching matters                        |
| Assuming composite unique indexes make individual columns unique                             | Only the complete combination is unique            |
| Assuming an index-only scan never accesses the heap                                          | Visibility-map coverage affects heap fetches       |
| Adding too many indexes                                                                      | Every index adds storage and write overhead        |
| Assuming a composite index always beats multiple single-column indexes                       | Compare actual execution plans                     |

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Create a composite index on `orders(customer_id, status)`.
2. Test queries filtering by customer_id only.
3. Test queries filtering by status only.
4. Compare `(customer_id, status)` with `(status, customer_id)`.
5. Create a composite index on `orders(customer_id, created_at DESC)`.
6. Create an index using INCLUDE for customer_id and total_amount.
7. Inspect whether an index-only scan is possible.
8. Create a partial index for pending orders.
9. Create a partial index for active employees.
10. Create an expression index on `LOWER(customers.email)`.
11. Create a unique composite index on two proposed columns.
12. Enable `pg_trgm` and create a GIN trigram index.
13. Compare prefix search and substring search.
14. Create an index for a query filtering by department_id and sorting by salary.
15. Compare separate single-column indexes with a composite index using EXPLAIN ANALYZE.
16. Identify redundant indexes in a hypothetical production orders table.
17. Explain why a parameterized query might not use a partial index under a generic plan.
18. Explain the difference between index keys and INCLUDE columns.

---

## 16. Interview Questions

**Q1. What is a composite index?**

An index created on multiple columns.

**Q2. Why does column order matter in composite indexes?**

Because the index is ordered by its leading columns first, which affects which query conditions can efficiently use it.

**Q3. What is the leftmost-prefix principle?**

A composite B-tree index is generally most useful for queries that constrain its leading columns.

**Q4. What is a covering index?**

An index containing all the columns needed by a query, potentially allowing PostgreSQL to avoid heap access.

**Q5. What is INCLUDE in PostgreSQL?**

INCLUDE stores additional payload columns in an index without making them search keys.

**Q6. What is a partial index?**

An index containing only rows that satisfy a specified WHERE condition.

**Q7. What is an expression index?**

An index built on an expression, such as `LOWER(email)`.

**Q8. What is a unique composite index?**

An index enforcing uniqueness across a combination of columns.

**Q9. Can a composite index support a query using only its second column?**

Usually not efficiently. PostgreSQL may use skip scan in suitable cases, but the leading-column limitation remains important when designing indexes.

**Q10. What is an index-only scan?**

An execution strategy that can return requested values from the index without needing heap access for every row.

**Q11. Does INCLUDE guarantee an index-only scan?**

No. Visibility-map coverage and query requirements also matter.

**Q12. How do you optimize `%text%` searches?**

Consider a trigram index using `pg_trgm`.

**Q13. What is the difference between a partial index and an ordinary index?**

An ordinary index covers all applicable rows; a partial index covers only rows satisfying its predicate.

**Q14. Why should you avoid redundant indexes?**

They increase storage and write overhead without necessarily improving queries.

**Q15. How do you decide whether a composite index is useful?**

Inspect actual query patterns, column order, selectivity, execution plans and write overhead.

---

## Key Takeaways

- Composite indexes cover multiple columns.
- Column order matters, especially for B-tree indexes.
- INCLUDE adds payload columns without making them search keys.
- Partial indexes cover only rows satisfying a predicate.
- Expression indexes support queries using matching expressions.
- Unique composite indexes enforce uniqueness across column combinations.
- Trigram indexes support substring and similarity searches.
- Index-only scans can reduce heap access but depend on visibility-map coverage.
- Design indexes around actual production queries.
- Avoid redundant indexes and validate improvements using EXPLAIN ANALYZE.
