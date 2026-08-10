---
sidebar_label: "SQL Interview and Practical Problem Solving"
sidebar_position: 1
---

# SQL Interview and Practical Problem Solving

## 1. Introduction

SQL interviews test more than syntax.

Interviewers evaluate whether you can:

- Understand business requirements.
- Translate requirements into SQL.
- Choose appropriate JOINs.
- Handle NULL values correctly.
- Write aggregations and subqueries.
- Use window functions.
- Solve complex data problems.
- Understand indexes and query performance.
- Handle transactions and concurrency.
- Write production-safe queries.

A strong SQL developer should be able to explain not only _what_ a query does, but also _why_ it is correct and what edge cases it handles.

---

# Section 1 — SQL Fundamentals

## 2. Basic SQL Interview Questions

**Q1. What is SQL?**

SQL (Structured Query Language) is used to define, manipulate, query and control relational databases.

**Q2. What is PostgreSQL?**

PostgreSQL is an open-source relational database management system that supports SQL, transactions, constraints, indexes, JSONB, window functions and advanced database features.

**Q3. What are DDL, DML, DQL, DCL and TCL?**

| Category | Purpose                    | Examples                |
| -------- | -------------------------- | ----------------------- |
| DDL      | Define database structures | CREATE, ALTER, DROP     |
| DML      | Modify data                | INSERT, UPDATE, DELETE  |
| DQL      | Retrieve data              | SELECT                  |
| DCL      | Control permissions        | GRANT, REVOKE           |
| TCL      | Manage transactions        | BEGIN, COMMIT, ROLLBACK |

**Q4. What is the difference between DELETE, TRUNCATE and DROP?**

| DELETE                              | TRUNCATE                                      | DROP                                          |
| ----------------------------------- | --------------------------------------------- | --------------------------------------------- |
| Removes selected or all rows        | Removes all rows                              | Removes database object                       |
| Supports WHERE                      | No WHERE                                      | No WHERE                                      |
| Row-level deletion triggers fire    | Does not fire row-level DELETE triggers       | Removes object                                |
| Can use RETURNING                   | Does not support RETURNING                    | Not applicable                                |
| Can be rolled back in a transaction | Can be rolled back in PostgreSQL transactions | Can be rolled back in PostgreSQL transactions |

**Q5. What is a primary key?**

A primary key uniquely identifies each row and cannot contain NULL values.

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100)
);
```

**Q6. What is a foreign key?**

A foreign key establishes a relationship between tables and enforces referential integrity.

```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id)
);
```

**Q7. What is the difference between PRIMARY KEY and UNIQUE?**

- PRIMARY KEY uniquely identifies a row and does not allow NULL.
- UNIQUE prevents duplicate values but allows NULL values by default in PostgreSQL.
- A table can have only one primary key constraint but multiple UNIQUE constraints.

**Q8. What is the difference between WHERE and HAVING?**

- WHERE filters individual rows before grouping.
- HAVING filters groups after aggregation.

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING COUNT(*) > 3;
```

**Q9. What is the difference between CHAR, VARCHAR and TEXT?**

| Type       | Description                                          |
| ---------- | ---------------------------------------------------- |
| CHAR(n)    | Fixed-length character type, blank-padded            |
| VARCHAR(n) | Variable-length text with a length limit             |
| TEXT       | Variable-length text without a declared length limit |

**Q10. What is NULL?**

NULL represents missing or unknown information. It is not equivalent to zero or an empty string.

```sql
SELECT *
FROM employees
WHERE manager_id IS NULL;
```

---

# Section 2 — SQL Joins

## 3. JOIN Interview Questions

**Q11. What is a JOIN?**

A JOIN combines rows from two or more tables based on a related condition.

**Q12. Explain the different types of JOINs.**

| JOIN            | Behavior                              |
| --------------- | ------------------------------------- |
| INNER JOIN      | Only matching rows                    |
| LEFT JOIN       | All left rows and matching right rows |
| RIGHT JOIN      | All right rows and matching left rows |
| FULL OUTER JOIN | All rows from both sides              |
| CROSS JOIN      | Cartesian product                     |
| SELF JOIN       | A table joined with itself            |

**Q13. Find all customers and their orders.**

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id;
```

**Q14. Find customers who have never placed an order.**

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

**Q15. What is the difference between conditions in ON and WHERE for a LEFT JOIN?**

Consider:

```sql
SELECT
    c.customer_id,
    o.order_id
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
   AND o.status = 'completed';
```

This preserves every customer, including those without completed orders.

But:

```sql
SELECT
    c.customer_id,
    o.order_id
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
WHERE o.status = 'completed';
```

This removes customers without matching completed orders.

The second query effectively behaves like an INNER JOIN for this condition.

**Q16. What is a self join?**

A table is joined with itself to establish relationships between rows.

Example: employee and manager.

```sql
SELECT
    e.employee_name AS employee,
    m.employee_name AS manager
FROM employees e
LEFT JOIN employees m
    ON e.manager_id = m.employee_id;
```

**Q17. What is a CROSS JOIN?**

It produces the Cartesian product of two tables.

If table A contains 5 rows and table B contains 4 rows, the result contains 20 combinations.

```sql
SELECT *
FROM products
CROSS JOIN categories;
```

**Q18. Why can a JOIN produce duplicate rows?**

Because one row in one table may match multiple rows in another table.

For example, one customer may have multiple orders.

This is expected behavior, not necessarily a duplicate-data problem.

---

# Section 3 — Subqueries and CTEs

## 4. Subquery and CTE Questions

**Q19. What is a subquery?**

A query nested inside another SQL query.

```sql
SELECT *
FROM employees
WHERE salary > (
    SELECT AVG(salary)
    FROM employees
);
```

**Q20. What is a correlated subquery?**

A subquery that references columns from the outer query.

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department_id = e.department_id
);
```

**Q21. What is the difference between IN and EXISTS?**

- IN checks whether a value matches an element in a set.
- EXISTS checks whether the subquery returns at least one row.

Example:

```sql
SELECT *
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
);
```

Equivalent existence-oriented pattern:

```sql
SELECT *
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

The PostgreSQL planner may optimize both similarly. Choose based on clarity and semantics.

**Q22. Why can NOT IN produce unexpected results?**

If the subquery returns NULL, a comparison may evaluate to UNKNOWN rather than TRUE.

Prefer NOT EXISTS when checking for missing related records.

**Q23. What is a CTE?**

A Common Table Expression is a named query result defined using WITH.

```sql
WITH completed_orders AS (
    SELECT *
    FROM orders
    WHERE status = 'completed'
)
SELECT *
FROM completed_orders;
```

**Q24. What is a recursive CTE?**

A CTE that references itself to process hierarchical or recursive relationships.

```sql
WITH RECURSIVE employee_hierarchy AS (
    SELECT
        employee_id,
        employee_name,
        manager_id,
        1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        eh.level + 1
    FROM employees e
    JOIN employee_hierarchy eh
        ON e.manager_id = eh.employee_id
)
SELECT *
FROM employee_hierarchy;
```

**Q25. Are CTEs always faster than subqueries?**

No. CTEs primarily improve readability and structure. PostgreSQL can inline eligible CTEs, while MATERIALIZED can force separate evaluation.

---

# Section 4 — Aggregation and Window Functions

## 5. Aggregation Questions

**Q26. What is the difference between COUNT(\*) and COUNT(column)?**

- COUNT(\*) counts rows.
- COUNT(column) counts non-NULL values in that column.

**Q27. Find total orders per customer.**

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders
FROM orders
GROUP BY customer_id;
```

**Q28. Find customers with more than five orders.**

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5;
```

**Q29. What is conditional aggregation?**

Applying conditions inside aggregate calculations.

```sql
SELECT
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders,
    COUNT(*) FILTER (
        WHERE status = 'pending'
    ) AS pending_orders
FROM orders;
```

**Q30. What is the difference between GROUP BY and PARTITION BY?**

| GROUP BY                 | PARTITION BY                              |
| ------------------------ | ----------------------------------------- |
| Reduces rows into groups | Preserves individual rows                 |
| Used with aggregation    | Used inside window functions              |
| Produces grouped results | Calculates values over logical partitions |

## 6. Window Function Questions

**Q31. What is a window function?**

A function that performs calculations across related rows while preserving individual result rows.

**Q32. Explain ROW_NUMBER, RANK and DENSE_RANK.**

Suppose salaries are:

```text
100000
90000
90000
80000
```

| Salary | ROW_NUMBER | RANK | DENSE_RANK |
| -----: | ---------: | ---: | ---------: |
| 100000 |          1 |    1 |          1 |
|  90000 |          2 |    2 |          2 |
|  90000 |          3 |    2 |          2 |
|  80000 |          4 |    4 |          3 |

**Q33. Find the second-highest distinct salary.**

```sql
WITH salary_ranking AS (
    SELECT
        employee_id,
        employee_name,
        salary,
        DENSE_RANK() OVER (
            ORDER BY salary DESC
        ) AS salary_rank
    FROM employees
    WHERE salary IS NOT NULL
)
SELECT *
FROM salary_ranking
WHERE salary_rank = 2;
```

**Q34. Find the top three employees in each department.**

```sql
WITH ranked_employees AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,
        ROW_NUMBER() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC, employee_id
        ) AS rn
    FROM employees
)
SELECT *
FROM ranked_employees
WHERE rn <= 3;
```

**Q35. What are LAG and LEAD?**

- LAG accesses a previous row.
- LEAD accesses a following row.

```sql
SELECT
    order_id,
    customer_id,
    created_at,
    LAG(created_at) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS previous_order
FROM orders;
```

**Q36. How do you calculate a running total?**

```sql
SELECT
    order_id,
    total_amount,
    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_total
FROM orders;
```

---

# Section 5 — Practical SQL Coding Problems

## 7. Problem 1 — Find the Second-Highest Salary

**Requirement:** Find the second-highest distinct salary.

```sql
SELECT MAX(salary) AS second_highest_salary
FROM employees
WHERE salary < (
    SELECT MAX(salary)
    FROM employees
);
```

**Alternative:**

```sql
SELECT DISTINCT salary
FROM employees
WHERE salary IS NOT NULL
ORDER BY salary DESC
OFFSET 1
LIMIT 1;
```

---

## 8. Problem 2 — Find Duplicate Emails

```sql
SELECT
    email,
    COUNT(*) AS occurrences
FROM customers
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;
```

**Retrieve all duplicate records:**

```sql
SELECT *
FROM customers
WHERE email IN (
    SELECT email
    FROM customers
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
);
```

---

## 9. Problem 3 — Find the Highest-Paid Employee in Each Department

```sql
WITH ranked_employees AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,
        RANK() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS salary_rank
    FROM employees
)
SELECT *
FROM ranked_employees
WHERE salary_rank = 1;
```

This returns all employees tied for the highest salary in their department.

---

## 10. Problem 4 — Find Customers With No Orders

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

---

## 11. Problem 5 — Find Monthly Revenue

```sql
SELECT
    DATE_TRUNC('month', created_at) AS revenue_month,
    SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY 1
ORDER BY 1;
```

For production reporting, use the business timezone explicitly when calculating month boundaries.

---

## 12. Problem 6 — Find Top 3 Products by Sales

```sql
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.quantity) AS total_sold
FROM products p
JOIN order_items oi
    ON oi.product_id = p.product_id
JOIN orders o
    ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY
    p.product_id,
    p.product_name
ORDER BY total_sold DESC
LIMIT 3;
```

---

## 13. Problem 7 — Find Employees Earning More Than Their Managers

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.salary AS employee_salary,
    m.employee_name AS manager_name,
    m.salary AS manager_salary
FROM employees e
JOIN employees m
    ON e.manager_id = m.employee_id
WHERE e.salary > m.salary;
```

---

## 14. Problem 8 — Find Customers With More Than Three Orders

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id
GROUP BY
    c.customer_id,
    c.customer_name
HAVING COUNT(o.order_id) > 3;
```

---

## 15. Problem 9 — Find the Latest Order for Every Customer

```sql
WITH ranked_orders AS (
    SELECT
        order_id,
        customer_id,
        total_amount,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY created_at DESC, order_id DESC
        ) AS rn
    FROM orders
)
SELECT *
FROM ranked_orders
WHERE rn = 1;
```

---

## 16. Problem 10 — Find Products Never Ordered

```sql
SELECT
    p.product_id,
    p.product_name
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.product_id = p.product_id
);
```

---

## 17. Problem 11 — Calculate Running Order Revenue

```sql
SELECT
    order_id,
    created_at,
    total_amount,
    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_revenue
FROM orders
WHERE status = 'completed'
ORDER BY created_at, order_id;
```

---

## 18. Problem 12 — Find Orders Without Successful Payments

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount
FROM orders o
WHERE NOT EXISTS (
    SELECT 1
    FROM payments p
    WHERE p.order_id = o.order_id
      AND p.payment_status = 'success'
);
```

---

## 19. Problem 13 — Find Payment Mismatches

Assumption: Successful payments should equal the order total.

```sql
WITH payment_totals AS (
    SELECT
        order_id,
        SUM(amount) AS paid_amount
    FROM payments
    WHERE payment_status = 'success'
    GROUP BY order_id
)
SELECT
    o.order_id,
    o.total_amount,
    COALESCE(pt.paid_amount, 0) AS paid_amount
FROM orders o
LEFT JOIN payment_totals pt
    ON pt.order_id = o.order_id
WHERE o.total_amount <> COALESCE(pt.paid_amount, 0);
```

Real reconciliation may require refund, reversal, currency and partial-payment handling.

---

## 20. Problem 14 — Find Consecutive Orders Within 5 Minutes

```sql
WITH order_history AS (
    SELECT
        order_id,
        customer_id,
        created_at,
        LAG(created_at) OVER (
            PARTITION BY customer_id
            ORDER BY created_at, order_id
        ) AS previous_order_time
    FROM orders
)
SELECT *
FROM order_history
WHERE created_at - previous_order_time
      < INTERVAL '5 minutes'
  AND previous_order_time IS NOT NULL;
```

---

## 21. Problem 15 — Find Customers Who Ordered Every Product in a Category

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.category_id = 5
      AND NOT EXISTS (
          SELECT 1
          FROM orders o
          JOIN order_items oi
              ON oi.order_id = o.order_id
          WHERE o.customer_id = c.customer_id
            AND o.status = 'completed'
            AND oi.product_id = p.product_id
      )
);
```

This uses nested NOT EXISTS to implement relational division.

---

# Section 6 — Indexes and Query Optimization

## 22. Index Interview Questions

**Q37. What is an index?**

An index is a database structure that helps PostgreSQL locate rows more efficiently for supported query conditions.

**Q38. What is the default PostgreSQL index type?**

B-tree.

**Q39. What are common PostgreSQL index types?**

| Index   | Common use                                                   |
| ------- | ------------------------------------------------------------ |
| B-tree  | Equality, range and ordered retrieval                        |
| Hash    | Equality comparisons                                         |
| GIN     | Arrays, JSONB and full-text search                           |
| GiST    | Geometric, range and other operator-class-supported searches |
| SP-GiST | Partitioned search structures                                |
| BRIN    | Large tables with physical correlation                       |

**Q40. What is a composite index?**

An index built on multiple columns.

```sql
CREATE INDEX idx_orders_customer_status
ON orders(customer_id, status);
```

Column order matters.

**Q41. Does PostgreSQL automatically index foreign keys?**

No. PostgreSQL automatically creates an index for a primary key or UNIQUE constraint, but not for the referencing foreign-key columns.

**Q42. What is a partial index?**

An index containing only rows satisfying a predicate.

```sql
CREATE INDEX idx_pending_orders
ON orders(created_at)
WHERE status = 'pending';
```

**Q43. What is an expression index?**

An index built on an expression rather than just a column.

```sql
CREATE INDEX idx_lower_customer_email
ON customers(LOWER(email));
```

It can support matching queries such as:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = LOWER('RAHUL@example.com');
```

**Q44. What is EXPLAIN?**

It displays the query planner's estimated execution plan.

**Q45. What is EXPLAIN ANALYZE?**

It executes the query and reports actual execution statistics alongside the plan.

**Q46. What is the difference between Sequential Scan and Index Scan?**

- Sequential Scan reads table pages.
- Index Scan uses an index to locate relevant rows and fetches corresponding table rows.

A sequential scan is not automatically bad. It can be the best plan for queries returning a large portion of a table.

---

## 23. Practical Optimization Example

Original query:

```sql
SELECT *
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC;
```

Potential index:

```sql
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at DESC);
```

Inspect:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    order_id,
    total_amount,
    created_at
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC;
```

Evaluate whether the index actually improves performance.

Do not assume an index is useful merely because it exists.

---

# Section 7 — Transactions and Concurrency

## 24. Transaction Interview Questions

**Q47. What is a transaction?**

A transaction is a logical unit of database work that commits or rolls back as a unit.

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 5;

COMMIT;
```

**Q48. What is ACID?**

| Property    | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| Atomicity   | All operations succeed or none do                                        |
| Consistency | Transactions preserve defined database invariants                        |
| Isolation   | Concurrent transactions are controlled according to an isolation level   |
| Durability  | Committed changes survive failures according to durability configuration |

**Q49. What is a dirty read?**

Reading uncommitted changes made by another transaction.

PostgreSQL's supported isolation levels do not permit dirty reads.

**Q50. What is a non-repeatable read?**

Reading the same row twice within a transaction and observing different committed values.

**Q51. What is a phantom read?**

Repeating a query and observing a changed set of matching rows due to concurrent transactions.

**Q52. What are PostgreSQL isolation levels?**

- READ UNCOMMITTED — behaves like READ COMMITTED in PostgreSQL.
- READ COMMITTED — default isolation level.
- REPEATABLE READ — stable transaction snapshot.
- SERIALIZABLE — strongest supported isolation level, with possible serialization failures.

**Q53. What is a deadlock?**

A situation where transactions wait for each other in a cycle.

PostgreSQL detects deadlocks and aborts one transaction.

**Q54. How do you prevent deadlocks?**

- Acquire locks in a consistent order.
- Keep transactions short.
- Avoid unnecessary locks.
- Retry suitable failed transactions.

**Q55. What is SELECT FOR UPDATE?**

It locks selected rows against conflicting modifications until the transaction ends.

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 5
FOR UPDATE;

COMMIT;
```

**Q56. What is SKIP LOCKED?**

It skips rows that cannot immediately be locked. It is useful for concurrent job queues.

```sql
SELECT *
FROM jobs
WHERE status = 'pending'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 10;
```

Here, `jobs` is an illustrative table, not part of the original TechBazaar schema.

---

# Section 8 — PostgreSQL-Specific Questions

## 25. PostgreSQL Advanced Questions

**Q57. What is the difference between SERIAL and IDENTITY?**

- SERIAL is a PostgreSQL shorthand involving an integer column and sequence.
- IDENTITY is the SQL-standard identity-column feature and is generally preferred for new designs.

**Q58. What is JSON vs JSONB?**

| JSON                                     | JSONB                                           |
| ---------------------------------------- | ----------------------------------------------- |
| Stores JSON text representation          | Stores decomposed binary representation         |
| Preserves input formatting and key order | Does not preserve input formatting or key order |
| Less suited to repeated querying         | Generally preferred for querying and indexing   |

**Q59. What is the difference between a VIEW and a MATERIALIZED VIEW?**

| VIEW                               | MATERIALIZED VIEW                      |
| ---------------------------------- | -------------------------------------- |
| Stores query definition            | Stores query result                    |
| Reads underlying data when queried | Needs refresh to reflect later changes |
| Does not persist result rows       | Persists result rows                   |

**Q60. What is a trigger?**

A trigger automatically invokes a trigger function when specified database events occur.

**Q61. What is the difference between a function and a procedure?**

- Functions are invoked in SQL expressions and can return values.
- Procedures are invoked using CALL and have different transaction-control capabilities.

**Q62. What is a sequence?**

A database object that generates numeric values, often used for identifiers.

```sql
SELECT nextval('orders_order_id_seq');
```

Sequence values are not rolled back like ordinary table changes.

**Q63. What is the difference between UNION and UNION ALL?**

- UNION removes duplicate result rows.
- UNION ALL preserves duplicates and generally avoids duplicate-elimination work.

**Q64. What is DISTINCT ON?**

A PostgreSQL-specific feature that returns the first row for each group of specified expressions according to ORDER BY.

```sql
SELECT DISTINCT ON (customer_id)
    customer_id,
    order_id,
    created_at
FROM orders
ORDER BY customer_id, created_at DESC, order_id DESC;
```

**Q65. What is PostgreSQL MVCC?**

Multi-Version Concurrency Control allows transactions to work with row versions according to their snapshots, reducing read/write blocking.

**Q66. What is VACUUM?**

VACUUM reclaims space occupied by obsolete row versions for reuse and supports transaction ID maintenance.

**Q67. What is ANALYZE?**

ANALYZE collects table statistics used by the query planner to estimate query costs and row counts.

---

# Section 9 — Production Backend Scenarios

## 26. Scenario 1 — Prevent Inventory Overselling

**Question:** Two customers try to buy the last available product simultaneously. How do you prevent both orders from succeeding?

Use an atomic conditional update:

```sql
UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE product_id = 5
  AND stock_quantity >= 1
RETURNING product_id, stock_quantity;
```

Only a successful update returns a row.

This assumes `stock_quantity` has been added to the schema.

For a complete order, perform the stock deduction and order creation in one transaction.

---

## 27. Scenario 2 — Prevent Duplicate Payments

**Question:** A payment webhook is delivered twice. How do you prevent duplicate processing?

Use a unique event identifier.

```sql
CREATE TABLE processed_events (
    event_id VARCHAR(150) PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

Attempt to claim the event:

```sql
INSERT INTO processed_events (event_id)
VALUES ($1)
ON CONFLICT DO NOTHING
RETURNING event_id;
```

Coordinate this insert and the corresponding database updates within one transaction.

---

## 28. Scenario 3 — Handle Concurrent Wallet Updates

**Question:** Two requests try to debit the same account simultaneously.

Assume an illustrative `wallets` table with `wallet_id` and `balance`.

```sql
UPDATE wallets
SET balance = balance - $1
WHERE wallet_id = $2
  AND balance >= $1
RETURNING balance;
```

The conditional update prevents the balance from becoming negative when the rule is enforced by this operation.

For financial systems, also use appropriate constraints, transaction boundaries, idempotency and ledger-based accounting.

---

## 29. Scenario 4 — Find Slow Queries

**Question:** A production API suddenly becomes slow. How would you investigate?

Start by checking active queries:

```sql
SELECT
    pid,
    now() - query_start AS duration,
    state,
    query
FROM pg_stat_activity
WHERE state <> 'idle'
ORDER BY duration DESC;
```

Then:

1. Identify expensive queries.
2. Check execution plans.
3. Inspect index usage.
4. Examine row estimates and actual rows.
5. Check locks and blocking sessions.
6. Evaluate database resource usage.
7. Measure the impact of changes.

Use:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

---

## 30. Scenario 5 — Handle a Failed Transaction

**Question:** An order is inserted successfully, but inserting an order item fails. What should happen?

The entire transaction should roll back.

```sql
BEGIN;

INSERT INTO orders (...);

INSERT INTO order_items (...);

COMMIT;
```

If the second operation fails:

```sql
ROLLBACK;
```

This prevents an incomplete order from being committed when both operations are required to succeed together.

---

# Section 10 — Practical SQL Test

## 31. Coding Assessment

Use the TechBazaar schema.

Try solving these problems without looking at the answers above.

### Beginner

1. Retrieve all employees.
2. Find employees earning more than ₹50,000.
3. Find customers without an email.
4. Count total orders.
5. Find the highest product price.
6. Find customers who placed more than three orders.
7. Find all completed orders.
8. Sort employees by salary.
9. Find products priced between ₹500 and ₹2,000.
10. Count employees in each department.

### Intermediate

11. Find the second-highest salary.
12. Find duplicate emails.
13. Find customers who have never placed an order.
14. Find products that have never been ordered.
15. Find the top five customers by spending.
16. Find the most expensive product per category.
17. Find employees earning more than their department average.
18. Find the latest order for every customer.
19. Calculate monthly revenue.
20. Find orders without successful payments.

### Advanced

21. Find customers who ordered every product in a category.
22. Calculate running revenue.
23. Find consecutive orders within five minutes.
24. Find the top three products per category.
25. Find employees earning more than their managers.
26. Find orders where stored totals differ from item totals.
27. Calculate the percentage contribution of each product to revenue.
28. Identify duplicate payment events.
29. Prevent concurrent inventory overselling.
30. Design a query to reconcile payments against orders.

---

# Section 11 — SQL Interview Preparation Strategy

## 32. How to Approach an SQL Interview Problem

Do not immediately start writing SQL.

Follow this sequence:

### Step 1: Clarify the requirement

Ask yourself:

- What should one output row represent?
- Should unmatched records appear?
- Should tied values return multiple rows?
- Should NULL values be included?
- Are we calculating total, average or distinct counts?

### Step 2: Identify tables and relationships

Map the required tables and their keys.

Example:

```text
customers
    |
    | customer_id
    |
orders
    |
    | order_id
    |
order_items
    |
    | product_id
    |
products
```

### Step 3: Identify the SQL technique

| Requirement                  | Useful technique         |
| ---------------------------- | ------------------------ |
| Find matching records        | JOIN                     |
| Find missing related records | NOT EXISTS               |
| Calculate totals             | GROUP BY                 |
| Filter aggregate results     | HAVING                   |
| Rank rows                    | Window functions         |
| Find latest record per group | ROW_NUMBER / DISTINCT ON |
| Compare neighboring rows     | LAG / LEAD               |
| Hierarchical relationships   | Recursive CTE            |
| Prevent duplicate inserts    | UNIQUE + ON CONFLICT     |
| Atomic business operation    | Transaction              |
| Improve lookup performance   | Index                    |

### Step 4: Test edge cases

Think about:

- No matching rows.
- Duplicate rows.
- NULL values.
- Equal ranking values.
- Empty tables.
- Multiple child records.
- Concurrent updates.
- Zero denominators.

### Step 5: Explain complexity and performance

Discuss:

- Expected result size.
- Index requirements.
- Join strategy.
- Data distribution.
- Whether the query scans a large table.
- Whether pagination is needed.

---

# Section 12 — Final SQL Knowledge Checklist

## 33. Concepts to Master

### SQL fundamentals

- [ ] SELECT, INSERT, UPDATE, DELETE
- [ ] CREATE, ALTER, DROP, TRUNCATE
- [ ] Constraints
- [ ] Primary and foreign keys
- [ ] Data types
- [ ] NULL handling
- [ ] CASE expressions
- [ ] Date and string functions

### Querying

- [ ] WHERE and HAVING
- [ ] GROUP BY
- [ ] INNER, LEFT, RIGHT and FULL JOIN
- [ ] Self JOIN
- [ ] Subqueries
- [ ] EXISTS and NOT EXISTS
- [ ] CTEs
- [ ] Recursive CTEs
- [ ] Set operations

### Advanced SQL

- [ ] Window functions
- [ ] Ranking functions
- [ ] LAG and LEAD
- [ ] Running totals
- [ ] Top-N per group
- [ ] Relational division
- [ ] Gaps and islands
- [ ] Complex aggregations

### Performance

- [ ] B-tree indexes
- [ ] Composite indexes
- [ ] Partial indexes
- [ ] GIN and GiST
- [ ] EXPLAIN
- [ ] EXPLAIN ANALYZE
- [ ] Query optimization
- [ ] Pagination
- [ ] N+1 query prevention

### PostgreSQL

- [ ] SERIAL and IDENTITY
- [ ] JSONB
- [ ] Arrays
- [ ] Views and materialized views
- [ ] Functions and procedures
- [ ] Triggers
- [ ] Schemas and permissions
- [ ] Backup and recovery
- [ ] Migrations

### Backend integration

- [ ] Node.js PostgreSQL driver
- [ ] Connection pooling
- [ ] Parameterized queries
- [ ] Transactions
- [ ] Error handling
- [ ] Idempotency
- [ ] Database security
- [ ] Production monitoring

---

## 34. Final Interview Advice

A common mistake is memorizing SQL queries without understanding the underlying data relationships.

For every query you practice, be able to explain:

1. Why you selected that JOIN type.
2. Why you used GROUP BY or a window function.
3. How NULL values affect the result.
4. Whether duplicates are possible.
5. What happens when no rows match.
6. Whether concurrent requests can create inconsistent results.
7. Whether an index could improve the query.
8. How you would verify the execution plan.

**The real test:** Can you convert an ambiguous business requirement into a correct, efficient and production-safe SQL solution?

That is the difference between knowing SQL syntax and being able to engineer with SQL.
