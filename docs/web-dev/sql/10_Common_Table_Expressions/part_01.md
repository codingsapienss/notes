---
sidebar_label: "CTE Fundamentals"
sidebar_position: 1
---

# CTE Fundamentals

## 1. What is a CTE?

CTE stands for **Common Table Expression**.

A CTE is a temporary named result set defined using the `WITH` clause. You can reference it inside the main SQL statement.

It helps divide complex SQL queries into smaller, logical steps.

### Basic syntax

```sql
WITH cte_name AS (
    SELECT
        columns
    FROM table_name
)
SELECT *
FROM cte_name;
```

### Example: Customer-wise total spending

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
    total_spent
FROM customer_spending;
```

**How it works:**

1. The CTE calculates total spending per customer.
2. PostgreSQL makes the named CTE available to the main query.
3. The main query retrieves its result.

A CTE is not automatically a permanent table. Its scope is limited to the statement in which it is defined.

---

## 2. Why Do We Need CTEs?

CTEs are useful for:

- Breaking complex queries into readable steps.
- Separating calculations from final filtering.
- Reusing a named result within a query.
- Performing multi-stage aggregation.
- Organizing JOIN operations.
- Writing recursive queries.
- Improving query maintainability.

### Without a CTE

```sql
SELECT
    customer_id,
    total_spent
FROM (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS customer_summary
WHERE total_spent > 20000;
```

### With a CTE

```sql
WITH customer_summary AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT
    customer_id,
    total_spent
FROM customer_summary
WHERE total_spent > 20000;
```

Both queries produce the same logical result.

The CTE makes the intermediate calculation easier to identify and reuse.

---

## 3. CTE with Multiple Columns

A CTE can return multiple columns, just like a normal SELECT query.

```sql
WITH department_summary AS (
    SELECT
        department_id,
        COUNT(*) AS employee_count,
        AVG(salary) AS avg_salary,
        MAX(salary) AS highest_salary,
        MIN(salary) AS lowest_salary
    FROM employees
    GROUP BY department_id
)
SELECT *
FROM department_summary;
```

You can access all columns exposed by the CTE in the outer query.

### Filtering the CTE result

```sql
WITH department_summary AS (
    SELECT
        department_id,
        COUNT(*) AS employee_count,
        AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT *
FROM department_summary
WHERE employee_count > 5;
```

The outer query filters the aggregated result.

---

## 4. Multiple CTEs in One Query

You can define multiple CTEs using a single WITH clause.

Separate them using commas.

### Example: Customer order and payment summary

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
        SUM(p.amount) AS total_paid
    FROM orders AS o
    JOIN payments AS p
        ON o.order_id = p.order_id
    WHERE p.payment_status = 'completed'
    GROUP BY o.customer_id
)

SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(co.total_orders, 0) AS total_orders,
    COALESCE(co.total_order_value, 0) AS total_order_value,
    COALESCE(cp.total_paid, 0) AS total_paid
FROM customers AS c
LEFT JOIN customer_orders AS co
    ON c.customer_id = co.customer_id
LEFT JOIN customer_payments AS cp
    ON c.customer_id = cp.customer_id;
```

### Important points

- Each CTE has its own name.
- CTEs are separated by commas, not semicolons.
- A later CTE can reference an earlier CTE.
- The final SQL statement can reference the CTEs.

**Why separate customer orders and payments?**

Orders and payments have a one-to-many relationship. Aggregating them independently prevents payment rows from multiplying order rows and inflating totals.

---

## 5. CTE Referencing Another CTE

A CTE can reference a previously defined CTE.

### Example: Find customers spending above average

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
    cs.total_spent
FROM customer_spending AS cs
CROSS JOIN average_spending AS av
WHERE cs.total_spent > av.avg_spending;
```

### Logical steps

1. `customer_spending` calculates total spending per customer.
2. `average_spending` calculates the average of those customer totals.
3. The final query returns customers whose spending exceeds that average.

This is useful when a query contains several dependent calculations.

---

## 6. CTE with JOIN

CTEs can be joined with normal tables and other CTEs.

### Example: Employee details with department statistics

```sql
WITH department_stats AS (
    SELECT
        department_id,
        COUNT(*) AS employee_count,
        AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT
    e.employee_id,
    e.employee_name,
    e.salary,
    d.department_name,
    ds.employee_count,
    ds.avg_salary
FROM employees AS e
JOIN departments AS d
    ON e.department_id = d.department_id
JOIN department_stats AS ds
    ON e.department_id = ds.department_id;
```

The CTE calculates department-level statistics, and the main query attaches those statistics to individual employee rows.

---

## 7. CTE with INSERT

PostgreSQL allows CTEs to be used with data modification statements.

### Example: INSERT using a CTE

```sql
WITH high_value_orders AS (
    SELECT
        order_id,
        customer_id,
        total_amount
    FROM orders
    WHERE total_amount > 50000
)
INSERT INTO order_archive (
    order_id,
    customer_id,
    total_amount
)
SELECT
    order_id,
    customer_id,
    total_amount
FROM high_value_orders;
```

This example assumes an `order_archive` table with the specified columns exists. It is an additional example table, not part of the original TechBazaar schema.

The CTE identifies high-value orders, and the INSERT copies those rows into the archive table.

---

## 8. CTE with UPDATE

A CTE can provide rows used by an UPDATE statement.

### Example: Update employees based on department statistics

```sql
WITH department_stats AS (
    SELECT
        department_id,
        AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
UPDATE employees AS e
SET salary = salary * 1.05
FROM department_stats AS ds
WHERE e.department_id = ds.department_id
  AND e.salary < ds.avg_salary;
```

This increases the salary of employees earning below their department's average by 5%.

**Important:** This is a real data modification. Run it inside a transaction or test it on a development database before applying it to production.

---

## 9. CTE with DELETE

A CTE can identify rows to delete.

### Example: Delete cancelled orders

```sql
WITH cancelled_orders AS (
    SELECT order_id
    FROM orders
    WHERE status = 'cancelled'
)
DELETE FROM orders AS o
USING cancelled_orders AS co
WHERE o.order_id = co.order_id;
```

**Important:** This is an actual DELETE operation. Foreign key constraints may prevent it, or dependent rows may be affected according to their configured referential actions.

Use a SELECT first to inspect the target rows.

---

## 10. CTE with RETURNING

PostgreSQL supports RETURNING with data-modifying statements. The returned rows can be consumed by another CTE.

### Example: Delete and return affected records

```sql
WITH deleted_orders AS (
    DELETE FROM orders
    WHERE status = 'cancelled'
    RETURNING order_id, customer_id, total_amount
)
SELECT *
FROM deleted_orders;
```

This deletes the matching orders and returns their deleted values.

### Example: Update and return affected employees

```sql
WITH updated_employees AS (
    UPDATE employees
    SET status = 'inactive'
    WHERE status = 'on_leave'
    RETURNING employee_id, employee_name, status
)
SELECT *
FROM updated_employees;
```

The CTE exposes the rows returned by the UPDATE.

---

## 11. CTE vs Derived Table vs Temporary Table

These concepts are related but not interchangeable.

| Feature                                  | CTE               | Derived table      | Temporary table                             |
| ---------------------------------------- | ----------------- | ------------------ | ------------------------------------------- |
| Definition                               | WITH clause       | Subquery in FROM   | CREATE TEMP TABLE                           |
| Scope                                    | One SQL statement | One SQL statement  | Database session, subject to its definition |
| Named result                             | Yes               | Yes, through alias | Yes                                         |
| Can be reused across separate statements | No                | No                 | Yes                                         |
| Can be indexed separately                | No                | No                 | Yes                                         |
| Stores a persistent table                | No                | No                 | No                                          |
| Supports recursive queries               | Yes               | Not directly       | Not inherently                              |

### Temporary table example

```sql
CREATE TEMP TABLE customer_summary AS
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

You can use it in multiple statements during its session lifetime:

```sql
SELECT *
FROM customer_summary;
```

```sql
SELECT *
FROM customer_summary
WHERE total_spent > 20000;
```

A temporary table is useful when an intermediate result must be reused across multiple statements or needs its own indexes.

---

## 12. CTE Performance and Materialization

A common misconception is that CTEs always store their results in memory or execute separately before the main query.

That is not necessarily true.

Modern PostgreSQL can inline eligible CTEs into the main query.

### Default behavior

```sql
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

PostgreSQL may optimize this by folding the CTE into the main query.

### MATERIALIZED

You can explicitly request separate calculation of a CTE:

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

`MATERIALIZED` acts as an optimization fence: PostgreSQL calculates the CTE separately rather than folding it into the outer query.

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

### Comparison

| MATERIALIZED                                           | NOT MATERIALIZED                                        |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Calculates a separate CTE result                       | Allows query folding                                    |
| Can avoid repeating expensive calculations when reused | Can enable outer filters to be pushed into the CTE      |
| May prevent useful optimizations                       | May repeat work if the CTE is referenced multiple times |

**Important PostgreSQL behavior:**

- A non-recursive, side-effect-free CTE referenced once is generally eligible for inlining.
- A CTE referenced multiple times is generally materialized by default.
- `MATERIALIZED` and `NOT MATERIALIZED` allow you to influence this behavior.
- Recursive CTEs and data-modifying CTEs have different execution rules.

Do not add MATERIALIZED or NOT MATERIALIZED without a reason. Inspect the execution plan.

---

## 13. EXPLAIN ANALYZE with CTEs

You can inspect how PostgreSQL executes a CTE query.

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

Look for:

- Whether the CTE was inlined.
- Whether a CTE Scan appears.
- Whether PostgreSQL uses sequential or index scans.
- Actual rows processed.
- Execution time.
- Expensive aggregation operations.

The presence of a CTE does not guarantee better performance.

---

## 14. Common Mistakes

| Mistake                                                  | Correct understanding                               |
| -------------------------------------------------------- | --------------------------------------------------- |
| Treating a CTE as a permanent table                      | Its scope is one SQL statement                      |
| Separating CTEs with semicolons                          | Separate CTE definitions with commas                |
| Referencing a CTE before defining it                     | Define dependencies in the correct order            |
| Assuming CTEs are always materialized                    | PostgreSQL can inline eligible CTEs                 |
| Assuming CTEs are always faster                          | Performance depends on the query plan               |
| Using a CTE for simple logic unnecessarily               | A normal SELECT may be clearer                      |
| Assuming CTE results persist across queries              | Use a temporary table for cross-statement reuse     |
| Forgetting that data-modifying CTEs actually modify data | Treat them like INSERT, UPDATE or DELETE statements |

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Create a CTE that calculates total spending per customer.
2. Find customers whose total spending exceeds ₹20,000.
3. Calculate average spending across customers who have placed orders.
4. Create a CTE that calculates employee count and average salary per department.
5. Find employees earning above their department's average salary using a CTE.
6. Create two CTEs: one for customer order totals and another for completed payment totals.
7. Join the two CTEs with customers to build a customer financial summary.
8. Create a CTE to identify products that have never been ordered.
9. Use a CTE with INSERT to archive high-value orders. Use the additional archive table described earlier.
10. Use a CTE with UPDATE to update employee records based on department statistics. Test safely.
11. Use a data-modifying CTE with RETURNING to inspect deleted rows.
12. Rewrite a derived-table query using a CTE.
13. Rewrite a CTE query using a derived table.
14. Compare MATERIALIZED and NOT MATERIALIZED using EXPLAIN ANALYZE.
15. Explain when a temporary table is more appropriate than a CTE.

---

## 16. Interview Questions

**Q1. What is a CTE?**

A named temporary result set defined using the WITH clause and available within one SQL statement.

**Q2. What is the purpose of a CTE?**

To organize complex SQL queries into readable and manageable steps.

**Q3. Can we define multiple CTEs in one query?**

Yes. Separate their definitions with commas.

**Q4. Can one CTE reference another CTE?**

Yes. A later CTE can reference an earlier CTE.

**Q5. Can CTEs be used with INSERT, UPDATE and DELETE?**

Yes. PostgreSQL supports data-modifying statements with WITH clauses.

**Q6. What is a data-modifying CTE?**

A CTE containing an INSERT, UPDATE or DELETE statement, commonly using RETURNING to expose affected rows.

**Q7. What is the difference between a CTE and a temporary table?**

A CTE exists for one statement. A temporary table can be reused across multiple statements in its session.

**Q8. Are CTEs always materialized in PostgreSQL?**

No. Eligible non-recursive CTEs can be inlined by the optimizer.

**Q9. What does MATERIALIZED do?**

It requests separate calculation of the CTE and prevents normal query folding.

**Q10. What does NOT MATERIALIZED do?**

It requests query folding where possible.

**Q11. Can a CTE improve readability without improving performance?**

Yes. Readability and performance are separate concerns.

**Q12. What is the difference between a derived table and a CTE?**

A derived table is defined inside FROM. A CTE is defined using WITH and given a reusable name within the statement.

---

## Key Takeaways

- CTE stands for Common Table Expression.
- CTEs are defined using WITH.
- A CTE creates a named result set available within one SQL statement.
- Multiple CTEs can be defined and reference earlier CTEs.
- CTEs can be used with SELECT, INSERT, UPDATE and DELETE.
- RETURNING allows data-modifying CTEs to expose affected rows.
- CTEs improve query organization but do not automatically improve performance.
- PostgreSQL can inline eligible CTEs.
- MATERIALIZED and NOT MATERIALIZED influence CTE execution.
- Use temporary tables when intermediate results must survive across multiple SQL statements.
