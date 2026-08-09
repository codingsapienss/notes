---
sidebar_label: "SQL Query Optimization"
sidebar_position: 1
---

# SQL Query Optimization

## 1. Introduction

SQL query optimization is the process of improving query performance by reducing unnecessary database work.

A query can be logically correct but inefficient when it:

- Scans millions of unnecessary rows.
- Uses inappropriate indexes.
- Performs expensive joins.
- Retrieves unnecessary columns.
- Sorts large datasets unnecessarily.
- Executes repeated subqueries.
- Processes too much data before filtering.

The objective is not simply to make queries shorter. It is to reduce execution time, resource consumption and database load while preserving correctness.

### Core optimization workflow

1. Identify the slow query.
2. Understand its execution plan.
3. Identify the expensive operation.
4. Optimize the query, index or data access pattern.
5. Measure the result.
6. Verify correctness under realistic conditions.

---

## 2. Avoid SELECT \*

One of the simplest optimization practices is retrieving only the columns you need.

### Less efficient

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

This retrieves every column, even if the application needs only three.

### Better

```sql
SELECT
    order_id,
    total_amount,
    status
FROM orders
WHERE customer_id = 101;
```

### Why?

- Less data transferred from PostgreSQL to the application.
- Less memory required to process results.
- Potentially enables index-only scans.
- Avoids transferring unnecessary large columns.

**Important:** `SELECT *` is not automatically slow in every situation. The problem is retrieving unnecessary data, especially from large tables or across application boundaries.

---

## 3. Use Appropriate Indexes

Indexes can reduce the number of rows PostgreSQL needs to examine.

### Example

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

Candidate index:

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

For a query that filters and sorts:

```sql
SELECT
    order_id,
    total_amount,
    created_at
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

### Important considerations

- Index columns used frequently in filters and joins.
- Consider column order in composite indexes.
- Use partial indexes for suitable subsets.
- Use expression indexes for repeated expressions.
- Avoid redundant indexes.
- Measure actual performance.

An index is not automatically beneficial. PostgreSQL may choose a sequential scan when that is cheaper.

---

## 4. Avoid Functions on Indexed Columns When Possible

Applying a function to an indexed column can prevent a normal index from being used efficiently.

### Example

```sql
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@example.com';
```

A regular B-tree index on `email` does not directly index the `LOWER(email)` expression.

### Solution 1: Expression index

```sql
CREATE INDEX idx_customers_lower_email
ON customers(LOWER(email));
```

Now the query can potentially use the expression index.

### Solution 2: Store normalized values

An application can normalize email values before storing or comparing them, provided the data model and uniqueness rules consistently enforce that policy.

**Rule:** Avoid unnecessary transformations on indexed columns. If a transformation is essential to the query pattern, consider an expression index.

---

## 5. Optimize Filtering with WHERE

Filter rows as early as possible when the query logic allows it.

### Example: Less efficient structure

```sql
SELECT *
FROM orders
WHERE customer_id IN (
    SELECT customer_id
    FROM customers
    WHERE customer_name LIKE 'Rahul%'
);
```

This is not inherently inefficient. PostgreSQL may transform it into an efficient semi-join.

A more explicit alternative is:

```sql
SELECT o.*
FROM orders o
JOIN customers c
    ON c.customer_id = o.customer_id
WHERE c.customer_name LIKE 'Rahul%';
```

Neither form is universally faster. Compare execution plans.

### Another example: Filter before aggregation

```sql
SELECT
    customer_id,
    SUM(total_amount)
FROM orders
WHERE status = 'completed'
GROUP BY customer_id;
```

This filters orders before grouping.

Compare that with unnecessarily aggregating a much larger input and filtering afterward.

**Important:** PostgreSQL can push filters through many query structures automatically. Write logically clear SQL first, then inspect the plan.

---

## 6. Avoid Unnecessary DISTINCT

`DISTINCT` removes duplicate result rows.

However, it may require sorting or hashing a large result set.

### Example

```sql
SELECT DISTINCT customer_id
FROM orders;
```

If the requirement is simply to find customers who have orders, use `EXISTS` when that expresses the logic more clearly.

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

This expresses a semi-join: return each qualifying customer once, regardless of how many matching orders exist.

### Important

`DISTINCT` is not inherently bad. Use it when duplicate elimination is genuinely required.

Do not remove it if doing so changes the required result.

---

## 7. Use EXISTS Instead of Unnecessary COUNT

Suppose you only need to know whether a customer has placed an order.

### Less suitable

```sql
SELECT COUNT(*)
FROM orders
WHERE customer_id = 101;
```

This calculates the number of matching orders.

### Better for an existence check

```sql
SELECT EXISTS (
    SELECT 1
    FROM orders
    WHERE customer_id = 101
);
```

`EXISTS` can stop once it finds a qualifying row.

### Another example

Find customers who have never placed an order:

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

This is generally safer than `NOT IN` when the subquery might return NULL.

---

## 8. Avoid the NOT IN and NULL Problem

Consider:

```sql
SELECT *
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
);
```

If the subquery returns a NULL, the comparison can evaluate to UNKNOWN, preventing expected rows from being returned.

### Better

```sql
SELECT *
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

This expresses the anti-join directly and avoids the NULL-related problem.

---

## 9. Optimize JOIN Operations

Joins can become expensive when tables contain large numbers of rows.

### Example

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id;
```

### Optimization checklist

- Ensure join columns have compatible data types.
- Index frequently used join keys where appropriate.
- Filter unnecessary rows.
- Select only required columns.
- Avoid accidental many-to-many multiplication.
- Check actual join strategy with EXPLAIN ANALYZE.

### Index example

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

PostgreSQL automatically creates an index for a primary key on `customers.customer_id`.

It does not automatically create an index on the referencing `orders.customer_id` foreign key.

### Important

An index on a join column does not guarantee that PostgreSQL will use a Nested Loop Join or an index scan. A Hash Join or sequential scan may be cheaper.

---

## 10. Avoid JOIN Multiplication

This is a common source of incorrect aggregate results.

Suppose a customer has:

- 3 orders.
- 2 payments associated with those orders.

Joining independent one-to-many relationships can multiply rows.

### Example of a problematic query

```sql
SELECT
    c.customer_id,
    COUNT(o.order_id) AS total_orders,
    SUM(p.amount) AS total_payments
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
LEFT JOIN payments p
    ON p.order_id = o.order_id
GROUP BY c.customer_id;
```

Depending on the data, multiple payments per order can duplicate order rows and inflate counts.

### Better: Pre-aggregate independently

```sql
WITH order_summary AS (
    SELECT
        customer_id,
        COUNT(*) AS total_orders
    FROM orders
    GROUP BY customer_id
),
payment_summary AS (
    SELECT
        o.customer_id,
        SUM(p.amount) AS total_payments
    FROM orders o
    JOIN payments p
        ON p.order_id = o.order_id
    GROUP BY o.customer_id
)
SELECT
    c.customer_id,
    COALESCE(os.total_orders, 0) AS total_orders,
    COALESCE(ps.total_payments, 0) AS total_payments
FROM customers c
LEFT JOIN order_summary os
    ON os.customer_id = c.customer_id
LEFT JOIN payment_summary ps
    ON ps.customer_id = c.customer_id;
```

Each relationship is aggregated before being joined to the customer table.

This preserves the intended aggregation grain.

---

## 11. Optimize Pagination

Applications often use pagination to display records in manageable batches.

### OFFSET pagination

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 20 OFFSET 10000;
```

This can become expensive for deep pages because PostgreSQL may need to process and discard many preceding rows.

### Keyset pagination

Instead, use the last-seen ordering values.

For example, if the previous page ended with:

- `created_at = '2026-11-10 10:00:00+00'`
- `order_id = 500`

Query:

```sql
SELECT *
FROM orders
WHERE (created_at, order_id)
    < ('2026-11-10 10:00:00+00', 500)
ORDER BY created_at DESC, order_id DESC
LIMIT 20;
```

Supporting index:

```sql
CREATE INDEX idx_orders_created_order
ON orders(created_at DESC, order_id DESC);
```

### Why keyset pagination?

- Avoids scanning and discarding large OFFSET ranges.
- Performs well for deep pagination with a suitable index.
- Provides a stable continuation point when ordering values are unique together.

### Important

The ordering columns should form a deterministic order. Include a unique tie-breaker such as the primary key.

Keyset pagination is not a drop-in replacement for arbitrary page-number navigation. It is especially useful for feeds, timelines and sequential browsing.

---

## 12. Use LIMIT When You Need Only a Few Rows

### Example

```sql
SELECT *
FROM orders
ORDER BY created_at DESC;
```

This retrieves all rows.

If the application only needs the latest 10 orders:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

Supporting index:

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at DESC);
```

PostgreSQL may be able to retrieve the first 10 rows directly from the index without sorting the entire table.

### Important

`LIMIT` without `ORDER BY` does not guarantee which rows PostgreSQL returns.

---

## 13. Avoid Repeated Correlated Subqueries When a JOIN or Aggregation Is Better

Consider finding each customer's order count.

### Correlated subquery

```sql
SELECT
    c.customer_id,
    c.customer_name,
    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id
    ) AS order_count
FROM customers c;
```

This is logically valid. PostgreSQL may optimize it, but depending on the plan and workload, repeated execution can be expensive.

### Alternative: Aggregate once and join

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(o.order_count, 0) AS order_count
FROM customers c
LEFT JOIN (
    SELECT
        customer_id,
        COUNT(*) AS order_count
    FROM orders
    GROUP BY customer_id
) o
    ON o.customer_id = c.customer_id;
```

The second version explicitly aggregates orders once before joining.

**Important:** Do not assume every correlated subquery is slow. PostgreSQL can transform or efficiently execute many subqueries. Measure both approaches.

---

## 14. Use CTEs Correctly

CTEs improve query organization and readability.

```sql
WITH completed_orders AS (
    SELECT *
    FROM orders
    WHERE status = 'completed'
)
SELECT
    customer_id,
    SUM(total_amount)
FROM completed_orders
GROUP BY customer_id;
```

### Are CTEs always slower?

No.

Modern PostgreSQL can inline many non-recursive CTEs into the main query.

However:

```sql
WITH completed_orders AS MATERIALIZED (
    SELECT *
    FROM orders
    WHERE status = 'completed'
)
SELECT *
FROM completed_orders;
```

`MATERIALIZED` forces separate calculation of the CTE result.

It can be useful in specific cases but may prevent optimizations such as predicate pushdown.

### NOT MATERIALIZED

```sql
WITH completed_orders AS NOT MATERIALIZED (
    SELECT *
    FROM orders
    WHERE status = 'completed'
)
SELECT *
FROM completed_orders;
```

This requests that PostgreSQL fold the CTE into the surrounding query where possible.

**Rule:** Use CTEs for clarity first. Use MATERIALIZED or NOT MATERIALIZED only when you understand the execution implications.

---

## 15. Avoid Unnecessary Sorting

Sorting can consume CPU and memory.

### Example

```sql
SELECT *
FROM orders
ORDER BY created_at DESC;
```

A suitable index:

```sql
CREATE INDEX idx_orders_created_desc
ON orders(created_at DESC);
```

PostgreSQL may use the index ordering rather than an explicit Sort node.

### Composite ordering

```sql
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC;
```

Candidate index:

```sql
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at DESC);
```

Inspect the execution plan to see whether PostgreSQL avoids sorting.

---

## 16. Use Appropriate Data Types

Data types affect storage, comparison operations, indexing and query behavior.

Examples:

- Use INTEGER or BIGINT for integer identifiers, depending on range.
- Use NUMERIC for exact decimal monetary values.
- Use TIMESTAMPTZ for timestamps representing real-world instants.
- Use BOOLEAN for true/false values.
- Use appropriate VARCHAR or TEXT columns for textual data.

### Avoid unnecessary type conversions

Less suitable:

```sql
SELECT *
FROM orders
WHERE customer_id::TEXT = '101';
```

Better:

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

Casting the indexed column can prevent use of a normal index on that column unless a matching expression index exists.

**Rule:** Keep comparison types compatible and avoid unnecessary casts on indexed columns.

---

## 17. Avoid Leading Wildcards in B-tree Searches

A B-tree index may support prefix searches:

```sql
SELECT *
FROM customers
WHERE email LIKE 'rahul%';
```

But this pattern generally cannot use a normal B-tree index efficiently:

```sql
SELECT *
FROM customers
WHERE email LIKE '%gmail.com';
```

For substring searches, consider PostgreSQL's `pg_trgm` extension.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_customers_email_trgm
ON customers
USING GIN (email gin_trgm_ops);
```

This can support suitable substring and similarity searches.

---

## 18. Avoid N+1 Query Problems in Backend Applications

This is especially important when using Node.js and PostgreSQL.

Suppose an API retrieves 100 customers and then runs a separate query for each customer's orders.

### N+1 pattern

```javascript
const customers = await db.query(
  "SELECT customer_id, customer_name FROM customers",
);

for (const customer of customers.rows) {
  const orders = await db.query("SELECT * FROM orders WHERE customer_id = $1", [
    customer.customer_id,
  ]);

  customer.orders = orders.rows;
}
```

This produces:

- 1 query to retrieve customers.
- 100 additional queries to retrieve orders.

Total: 101 database queries.

### Better: Fetch related data in one query

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount,
    o.status
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id;
```

Alternatively, retrieve customers and orders using a controlled number of batched queries.

### Why does this matter?

- Reduces database round trips.
- Reduces application-server overhead.
- Reduces connection-pool pressure.
- Can improve API response latency.

**Important:** A single JOIN can produce many rows. For complex relationships, batching or aggregation may be more appropriate.

---

## 19. Use Parameterized Queries

Parameterized queries are important for both security and reliable query execution.

### Unsafe approach

```javascript
const sql = `
  SELECT *
  FROM customers
  WHERE email = '${email}'
`;
```

This can expose the application to SQL injection.

### Better approach

```javascript
const sql = `
  SELECT *
  FROM customers
  WHERE email = $1
`;

const result = await pool.query(sql, [email]);
```

Benefits:

- Protects against SQL injection when used correctly.
- Separates SQL structure from user-supplied values.
- Makes parameter handling more reliable.

### Prepared statements

PostgreSQL can reuse prepared statements, but execution plans depend on whether custom or generic plans are selected.

Do not assume prepared statements always improve performance. Parameter distributions can affect which plan is best.

---

## 20. Use Transactions Efficiently

Transactions help maintain consistency, but unnecessarily long transactions can cause problems.

### Example

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;

INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (
    101,
    1500,
    'pending'
);

COMMIT;
```

### Best practices

- Keep transactions short.
- Avoid unnecessary network calls inside transactions.
- Avoid waiting for user input while holding locks.
- Commit or roll back promptly.
- Use appropriate isolation levels.

Long-running transactions can delay vacuum cleanup and increase contention.

---

## 21. Use EXPLAIN ANALYZE for Every Meaningful Optimization

Do not optimize based only on assumptions.

Example:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    order_id,
    total_amount
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC
LIMIT 20;
```

Inspect:

| What to inspect          | Why                                    |
| ------------------------ | -------------------------------------- |
| Scan type                | Understand how rows are accessed       |
| Estimated vs actual rows | Identify estimation errors             |
| Actual time              | Identify expensive operations          |
| Loops                    | Find repeatedly executed nodes         |
| Buffers                  | Understand page access                 |
| Sort nodes               | Identify unnecessary sorting           |
| Rows removed by filter   | Find potentially inefficient filtering |

After optimization, run the same query against representative data and compare the results.

---

## 22. Query Optimization Checklist

Use this checklist when investigating a slow query.

| Area              | Check                                              |
| ----------------- | -------------------------------------------------- |
| SELECT            | Are unnecessary columns being retrieved?           |
| WHERE             | Can filtering be performed efficiently?            |
| Indexes           | Are suitable indexes available?                    |
| Composite indexes | Is column order appropriate?                       |
| JOIN              | Are join conditions correct and efficient?         |
| Aggregation       | Is unnecessary data being grouped?                 |
| DISTINCT          | Is duplicate removal actually required?            |
| Subqueries        | Can an alternative structure reduce repeated work? |
| Pagination        | Is OFFSET becoming expensive?                      |
| Sorting           | Can an index provide the required order?           |
| Data types        | Are unnecessary casts being applied?               |
| Backend           | Is an N+1 query pattern present?                   |
| Transactions      | Are transactions unnecessarily long?               |
| Statistics        | Are planner statistics current?                    |
| Measurement       | Has EXPLAIN ANALYZE confirmed the improvement?     |

---

## 23. Practice Exercises

Use the TechBazaar database.

1. Rewrite a query using `SELECT *` to retrieve only required columns.
2. Optimize customer order history using a composite index.
3. Compare a normal email index with an expression index on `LOWER(email)`.
4. Rewrite an existence check using EXISTS instead of COUNT.
5. Find customers without orders using NOT EXISTS.
6. Compare OFFSET pagination with keyset pagination.
7. Identify a query that unnecessarily uses DISTINCT.
8. Optimize a customer and order JOIN.
9. Find a query that suffers from JOIN multiplication and fix it using pre-aggregation.
10. Compare a correlated subquery with a pre-aggregated JOIN.
11. Inspect whether a CTE is inlined or materialized.
12. Optimize an ORDER BY query using an appropriate index.
13. Identify a leading-wildcard search and consider pg_trgm.
14. Identify an N+1 query pattern in a Node.js application.
15. Use parameterized queries instead of string concatenation.
16. Inspect a slow query using EXPLAIN ANALYZE and BUFFERS.
17. Compare execution plans before and after adding a composite index.
18. Identify a query that performs unnecessary type conversion.
19. Investigate an inaccurate row estimate and run ANALYZE.
20. Document the performance difference between two query implementations.

---

## 24. Interview Questions

**Q1. What is SQL query optimization?**

Improving query execution efficiency while preserving the expected result.

**Q2. Is SELECT \* always bad?**

No, but retrieving unnecessary columns can increase data transfer, memory usage and processing overhead.

**Q3. Why can functions on indexed columns reduce index usage?**

A normal index stores the original column values, not necessarily the function's result. An expression index may be needed.

**Q4. When should you use EXISTS instead of COUNT?**

When you only need to know whether at least one matching row exists.

**Q5. Why is NOT EXISTS often safer than NOT IN?**

NOT IN can produce unexpected UNKNOWN results when its subquery returns NULL.

**Q6. What is the N+1 query problem?**

A backend retrieves a set of records and then executes another query for each individual record.

**Q7. What is keyset pagination?**

Pagination using the last-seen ordering values instead of OFFSET.

**Q8. Why can OFFSET pagination become slow?**

PostgreSQL may need to process and discard many rows before returning the requested page.

**Q9. Does a JOIN always perform better than a subquery?**

No. PostgreSQL can optimize many equivalent query structures. Compare execution plans.

**Q10. What is JOIN multiplication?**

When joining multiple one-to-many relationships, rows can multiply and produce incorrect aggregate results.

**Q11. What is predicate pushdown?**

Applying filters as close as possible to the underlying data source to reduce unnecessary processing.

**Q12. Are CTEs always slower than subqueries?**

No. PostgreSQL can inline many non-recursive CTEs. MATERIALIZED can create an optimization boundary.

**Q13. How can an index improve ORDER BY performance?**

A suitable index can provide rows in the required order and potentially avoid an explicit sort.

**Q14. How do you identify a slow operation in a query?**

Use EXPLAIN ANALYZE with BUFFERS and inspect actual times, rows, loops and buffer activity.

**Q15. Why are parameterized queries important?**

They help prevent SQL injection and provide reliable separation of SQL structure from input values.

**Q16. Can too many indexes hurt performance?**

Yes. They consume storage and increase the cost of INSERT, UPDATE and DELETE operations.

**Q17. Why should transactions be short?**

Long-running transactions can hold locks, increase contention and delay vacuum cleanup.

**Q18. What is the most reliable way to confirm a query optimization?**

Compare execution plans and actual measurements before and after the change using representative data and workload conditions.

---

## Key Takeaways

- Optimize based on measured bottlenecks, not assumptions.
- Retrieve only the columns your application needs.
- Design indexes around actual query patterns.
- Use EXISTS for existence checks.
- Prefer NOT EXISTS when NULLs can affect NOT IN.
- Use pre-aggregation to avoid JOIN multiplication.
- Consider keyset pagination for deep sequential browsing.
- Avoid unnecessary sorting, casting and duplicate elimination.
- Watch for N+1 queries in backend applications.
- Keep transactions short and use parameterized queries.
- Validate meaningful optimizations using EXPLAIN ANALYZE and BUFFERS.

**The core principle:** A well-optimized query minimizes unnecessary database work while returning exactly the required result.
