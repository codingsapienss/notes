---
sidebar_label: "Advanced CTE Usage"
sidebar_position: 1
---

# Advanced CTE Usage

## 1. Multiple CTEs with Complex Dependencies

A single SQL statement can contain multiple CTEs, where each CTE performs a separate calculation and later CTEs consume earlier results.

This is useful for building complex reports without deeply nested subqueries.

### Example: Customer financial summary

```sql
WITH customer_orders AS (
    SELECT
        customer_id,
        COUNT(*) AS total_orders,
        SUM(total_amount) AS total_order_value
    FROM orders
    GROUP BY customer_id
),

customer_payments AS (
    SELECT
        o.customer_id,
        COUNT(p.payment_id) AS total_payments,
        SUM(p.amount) FILTER (
            WHERE p.payment_status = 'completed'
        ) AS total_paid
    FROM orders AS o
    JOIN payments AS p
        ON o.order_id = p.order_id
    GROUP BY o.customer_id
),

customer_summary AS (
    SELECT
        co.customer_id,
        co.total_orders,
        co.total_order_value,
        COALESCE(cp.total_payments, 0) AS total_payments,
        COALESCE(cp.total_paid, 0) AS total_paid
    FROM customer_orders AS co
    LEFT JOIN customer_payments AS cp
        ON co.customer_id = cp.customer_id
)

SELECT
    c.customer_id,
    c.customer_name,
    cs.total_orders,
    cs.total_order_value,
    cs.total_payments,
    cs.total_paid
FROM customer_summary AS cs
JOIN customers AS c
    ON c.customer_id = cs.customer_id;
```

**Logical flow:**

1. `customer_orders` calculates order metrics.
2. `customer_payments` calculates payment metrics.
3. `customer_summary` combines both calculations.
4. Final SELECT adds customer details.

The CTEs create a logical pipeline.

---

## 2. Reusing the Same CTE Multiple Times

A CTE can be referenced more than once in the same statement.

### Example: Compare customer spending against average spending

```sql
WITH customer_spending AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)

SELECT
    customer_id,
    total_spent,
    (SELECT AVG(total_spent) FROM customer_spending)
        AS average_spending
FROM customer_spending
WHERE total_spent > (
    SELECT AVG(total_spent)
    FROM customer_spending
);
```

The CTE is referenced multiple times.

### Alternative using CROSS JOIN

```sql
WITH customer_spending AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
),

average_spending AS (
    SELECT
        AVG(total_spent) AS avg_spending
    FROM customer_spending
)

SELECT
    cs.customer_id,
    cs.total_spent,
    av.avg_spending
FROM customer_spending AS cs
CROSS JOIN average_spending AS av
WHERE cs.total_spent > av.avg_spending;
```

This version calculates the average in a separately named CTE and makes it available to the final query.

**Performance note:** A CTE referenced multiple times is generally materialized by default in PostgreSQL when eligible. `NOT MATERIALIZED` can allow inlining, but may cause repeated computation.

---

## 3. MATERIALIZED and NOT MATERIALIZED

PostgreSQL provides explicit control over CTE materialization.

### MATERIALIZED

```sql
WITH customer_summary AS MATERIALIZED (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT *
FROM customer_summary
WHERE total_spent > 20000;
```

PostgreSQL calculates the CTE separately and stores its result for use by the statement.

**Potential benefits:**

- Avoids repeating an expensive calculation when the CTE is referenced multiple times.
- Can provide an optimization boundary.

**Potential drawbacks:**

- May prevent useful filter pushdown.
- May require additional memory or temporary storage.
- Can increase execution time if the materialized result is large.

### NOT MATERIALIZED

```sql
WITH customer_summary AS NOT MATERIALIZED (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT *
FROM customer_summary
WHERE total_spent > 20000;
```

This requests that PostgreSQL fold the CTE into the surrounding query where possible.

**Potential benefits:**

- Allows more query optimization.
- Can enable predicate pushdown.
- May avoid storing an intermediate result.

**Potential drawbacks:**

- Multiple references may repeat the underlying calculation.
- Repeated computation can become expensive.

### Comparison

| MATERIALIZED                                     | NOT MATERIALIZED                                 |
| ------------------------------------------------ | ------------------------------------------------ |
| Separate CTE calculation                         | Allows query folding                             |
| Can reuse a calculated result                    | Can enable filter pushdown                       |
| Can prevent certain optimizations                | Can repeat computation                           |
| Useful when reuse outweighs materialization cost | Useful when inlining enables better optimization |

**Rule:** Do not use either option automatically. Measure the execution plan.

---

## 4. Data-Modifying CTEs

PostgreSQL allows INSERT, UPDATE and DELETE statements inside a WITH clause.

This is useful when multiple data modifications must be logically connected within one SQL statement.

### Example: INSERT and return inserted rows

```sql
WITH new_orders AS (
    INSERT INTO orders (
        customer_id,
        total_amount,
        status
    )
    VALUES
        (101, 15000, 'pending'),
        (102, 25000, 'pending')
    RETURNING order_id, customer_id, total_amount
)
SELECT *
FROM new_orders;
```

The INSERT creates orders, and RETURNING exposes the inserted rows to the outer query.

### Example: UPDATE and return affected rows

```sql
WITH updated_orders AS (
    UPDATE orders
    SET status = 'cancelled'
    WHERE status = 'pending'
      AND total_amount < 1000
    RETURNING order_id, customer_id, total_amount
)
SELECT *
FROM updated_orders;
```

The CTE returns the rows modified by the UPDATE.

### Important PostgreSQL rules

- A data-modifying CTE executes exactly once and to completion.
- Its RETURNING output forms the temporary result available to the rest of the statement.
- Data-modifying CTEs share the same statement snapshot.
- Do not attempt to modify the same row more than once in one statement; the result is not reliably predictable.

---

## 5. Moving Data Between Tables Using CTEs

A common production requirement is moving old records into an archive table.

Assume an additional table named `order_archive` exists with compatible columns.

### Example: Archive completed orders

```sql
WITH archived_orders AS (
    DELETE FROM orders
    WHERE status = 'completed'
      AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
    RETURNING
        order_id,
        customer_id,
        total_amount,
        status,
        created_at
)

INSERT INTO order_archive (
    order_id,
    customer_id,
    total_amount,
    status,
    created_at
)
SELECT
    order_id,
    customer_id,
    total_amount,
    status,
    created_at
FROM archived_orders;
```

### How it works

1. DELETE removes qualifying orders.
2. RETURNING exposes their original values.
3. INSERT copies those values into the archive table.
4. Both operations belong to one SQL statement.

If the INSERT fails, the DELETE is rolled back as part of the statement.

**Important:** Foreign key relationships, triggers and archive-table constraints must be considered before using this pattern in production.

---

## 6. CTE with UPSERT

CTEs can also organize an UPSERT workflow.

### Example: Insert or update a customer

```sql
WITH incoming_customer AS (
    SELECT
        'customer@example.com'::VARCHAR AS email,
        'Rahul Sharma'::VARCHAR AS customer_name
)

INSERT INTO customers (
    email,
    customer_name
)
SELECT
    email,
    customer_name
FROM incoming_customer

ON CONFLICT (email)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name

RETURNING *;
```

This example assumes `customers.email` has a UNIQUE constraint.

**How it works:**

1. The CTE defines the incoming customer data.
2. INSERT attempts to create the customer.
3. If the email already exists, the existing record is updated.
4. RETURNING provides the inserted or updated row.

---

## 7. CTE with Window Functions

CTEs are useful for separating window calculations from filtering.

PostgreSQL does not allow window functions directly in WHERE. A CTE provides an outer query where the calculated result can be filtered.

### Example: Find the highest-paid employee in each department

```sql
WITH employee_rankings AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,

        ROW_NUMBER() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC, employee_id
        ) AS salary_rank

    FROM employees
)

SELECT
    employee_id,
    employee_name,
    department_id,
    salary
FROM employee_rankings
WHERE salary_rank = 1;
```

### Example: Find the top three highest-paid employees per department

```sql
WITH employee_rankings AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,

        DENSE_RANK() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS salary_rank

    FROM employees
)

SELECT *
FROM employee_rankings
WHERE salary_rank <= 3;
```

**Important distinction:**

- `ROW_NUMBER()` assigns a unique sequential number.
- `RANK()` gives tied rows the same rank and leaves gaps.
- `DENSE_RANK()` gives tied rows the same rank without gaps.

Window functions are covered in Part 11.

---

## 8. CTE with Conditional Aggregation

CTEs can separate filtering, aggregation and final reporting.

### Example: Payment performance per customer

```sql
WITH payment_summary AS (
    SELECT
        o.customer_id,

        COUNT(*) AS total_payments,

        COUNT(*) FILTER (
            WHERE p.payment_status = 'completed'
        ) AS successful_payments,

        COUNT(*) FILTER (
            WHERE p.payment_status = 'failed'
        ) AS failed_payments,

        SUM(p.amount) FILTER (
            WHERE p.payment_status = 'completed'
        ) AS successful_amount

    FROM orders AS o
    JOIN payments AS p
        ON o.order_id = p.order_id

    GROUP BY o.customer_id
)

SELECT
    c.customer_id,
    c.customer_name,
    ps.total_payments,
    ps.successful_payments,
    ps.failed_payments,
    COALESCE(ps.successful_amount, 0) AS successful_amount
FROM customers AS c
LEFT JOIN payment_summary AS ps
    ON c.customer_id = ps.customer_id;
```

This produces a customer-level payment report.

---

## 9. CTE with Multiple Aggregation Levels

CTEs can separate aggregation levels when a report requires several calculations.

### Example: Average spending per customer and overall average

```sql
WITH customer_spending AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
),

spending_statistics AS (
    SELECT
        COUNT(*) AS customers_with_orders,
        SUM(total_spent) AS total_revenue,
        AVG(total_spent) AS average_customer_spending,
        MAX(total_spent) AS highest_customer_spending
    FROM customer_spending
)

SELECT *
FROM spending_statistics;
```

The first CTE calculates customer-level totals.

The second calculates statistics across those totals.

This distinction matters: `AVG(total_spent)` calculates the average across customers with orders, not the average order value.

---

## 10. CTEs and Transactions

A CTE is not a transaction.

A transaction controls whether multiple SQL statements are committed or rolled back.

A CTE organizes logic inside one SQL statement.

### Example: Transaction containing multiple statements

```sql
BEGIN;

UPDATE employees
SET salary = salary * 1.05
WHERE department_id = 1;

UPDATE employees
SET salary = salary * 1.03
WHERE department_id = 2;

COMMIT;
```

The two UPDATE statements belong to one transaction.

If an error occurs before COMMIT, you can roll back:

```sql
ROLLBACK;
```

### CTE vs transaction

| CTE                                                    | Transaction                          |
| ------------------------------------------------------ | ------------------------------------ |
| Organizes a single SQL statement                       | Groups multiple SQL statements       |
| Defined using WITH                                     | Defined using BEGIN                  |
| Does not independently provide commit/rollback control | Provides commit/rollback control     |
| Can contain data-modifying statements                  | Can contain many kinds of statements |

Transactions are covered in Part 14.

---

## 11. CTE Execution Order and Visibility

A CTE can reference a CTE defined before it.

### Valid example

```sql
WITH first_cte AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
),

second_cte AS (
    SELECT *
    FROM first_cte
    WHERE total_spent > 10000
)

SELECT *
FROM second_cte;
```

`second_cte` can reference `first_cte`.

### Invalid dependency order

```sql
WITH second_cte AS (
    SELECT *
    FROM first_cte
),

first_cte AS (
    SELECT *
    FROM orders
)

SELECT *
FROM second_cte;
```

This fails because `first_cte` has not been defined when `second_cte` references it.

For ordinary non-recursive CTEs, define dependencies in the correct order.

---

## 12. CTE vs Temporary Table vs Materialized View

These are different PostgreSQL features.

| Feature                    | CTE                          | Temporary table                                    | Materialized view          |
| -------------------------- | ---------------------------- | -------------------------------------------------- | -------------------------- |
| Scope                      | One statement                | Session or transaction, depending on configuration | Persistent database object |
| Stores data separately     | Not necessarily              | Yes                                                | Yes                        |
| Reusable across statements | No                           | Yes                                                | Yes                        |
| Can have indexes           | No separate indexes          | Yes                                                | Yes                        |
| Data freshness             | Based on statement execution | Depends on how it is populated                     | Requires refresh           |
| Main purpose               | Organize query logic         | Reuse intermediate data                            | Persist query results      |

### Materialized view example

```sql
CREATE MATERIALIZED VIEW customer_revenue AS
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

Query it:

```sql
SELECT *
FROM customer_revenue;
```

Refresh it:

```sql
REFRESH MATERIALIZED VIEW customer_revenue;
```

A materialized view stores query results beyond the statement. A CTE does not.

Materialized views are covered in Part 15D.

---

## 13. Performance Optimization with CTEs

Do not assume breaking a query into CTEs improves performance.

### Inspect execution plans

```sql
EXPLAIN ANALYZE
WITH customer_summary AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT *
FROM customer_summary
WHERE total_spent > 20000;
```

Check:

- Actual execution time.
- Number of rows processed.
- Sequential scans and index scans.
- Aggregation strategy.
- Whether a CTE was materialized.
- Whether repeated CTE references cause repeated work.

### Practical guidelines

1. Use CTEs to make complex logic readable.
2. Avoid creating unnecessary CTE layers.
3. Use MATERIALIZED only when separate calculation is beneficial.
4. Use NOT MATERIALIZED when query folding is useful.
5. Pre-aggregate independent one-to-many relationships before joining.
6. Compare execution plans before and after rewriting queries.

---

## 14. Common Mistakes

| Mistake                                                       | Correct understanding                                                   |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Assuming a CTE is a permanent table                           | It exists only for the statement                                        |
| Assuming CTEs always execute first and separately             | PostgreSQL can inline eligible CTEs                                     |
| Using MATERIALIZED everywhere                                 | Materialization can prevent optimizations                               |
| Using NOT MATERIALIZED everywhere                             | Multiple references may repeat computation                              |
| Modifying the same row in multiple data-modifying CTEs        | Results are not predictable                                             |
| Treating a CTE as a transaction                               | CTEs and transactions solve different problems                          |
| Forgetting RETURNING in data-modifying CTEs                   | The outer query needs returned rows to consume modified data            |
| Joining multiple one-to-many relationships before aggregation | Can inflate totals                                                      |
| Assuming CTEs persist across statements                       | Use a temporary table or materialized view when persistence is required |

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Create multiple CTEs to calculate customer order and payment statistics.
2. Reuse a customer-spending CTE to calculate average and maximum customer spending.
3. Use MATERIALIZED and NOT MATERIALIZED and compare execution plans.
4. Use a CTE with INSERT and RETURNING.
5. Use a CTE with UPDATE and RETURNING.
6. Use a CTE with DELETE and RETURNING.
7. Move old completed orders into an archive table using DELETE RETURNING followed by INSERT.
8. Use UPSERT with a CTE to insert or update a customer.
9. Find the highest-paid employee in each department using ROW_NUMBER().
10. Find the top three highest-paid employees per department using DENSE_RANK().
11. Build a payment success report using conditional aggregation inside a CTE.
12. Calculate average customer spending using two dependent CTEs.
13. Explain why a CTE is not equivalent to a transaction.
14. Explain when a temporary table is more appropriate than a CTE.
15. Identify the performance risks of materializing a large CTE.

---

## 16. Interview Questions

**Q1. Can a CTE be referenced multiple times?**

Yes. A CTE can be referenced multiple times in the same SQL statement.

**Q2. What is CTE materialization?**

It is the separate calculation of a CTE result rather than folding its definition into the outer query.

**Q3. What is the difference between MATERIALIZED and NOT MATERIALIZED?**

MATERIALIZED requests separate calculation. NOT MATERIALIZED requests query folding where possible.

**Q4. Can a CTE contain UPDATE or DELETE?**

Yes. PostgreSQL supports data-modifying CTEs.

**Q5. What is RETURNING used for in a CTE?**

It exposes the rows inserted, updated or deleted so another part of the statement can consume them.

**Q6. Can a CTE be used with window functions?**

Yes. It is commonly used to calculate window results and filter them in an outer query.

**Q7. Can a data-modifying CTE modify the same row more than once?**

Do not rely on this. PostgreSQL documents the result as unpredictable.

**Q8. Is a CTE a transaction?**

No. A CTE organizes a SQL statement; a transaction controls commit and rollback across statements.

**Q9. What is the difference between a CTE and a materialized view?**

A CTE exists for one statement. A materialized view is a persistent database object storing query results.

**Q10. When should you use MATERIALIZED?**

When separately calculating and reusing a CTE result is beneficial and the performance trade-off has been measured.

---

## Key Takeaways

- Multiple CTEs can form a logical query pipeline.
- A CTE can be referenced multiple times within one statement.
- MATERIALIZED and NOT MATERIALIZED influence PostgreSQL's query optimization.
- Data-modifying CTEs support INSERT, UPDATE and DELETE.
- RETURNING exposes modified rows to subsequent query operations.
- CTEs work with JOINs, aggregates, window functions and UPSERT.
- A CTE is not a transaction, temporary table or materialized view.
- Avoid modifying the same row multiple times in one data-modifying WITH statement.
- Use EXPLAIN ANALYZE to evaluate performance rather than assuming CTEs are faster.
