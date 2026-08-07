---
sidebar_label: "Derived Tables"
sidebar_position: 1
---

# Derived Tables

## 1. What is a Derived Table?

A **derived table** is a temporary result set created by a subquery inside the `FROM` clause of another SQL query.

It behaves like a table while the outer query executes.

### Basic syntax

```sql
SELECT
    columns
FROM (
    SELECT
        columns
    FROM table_name
) AS derived_table;
```

**Important PostgreSQL rule:** A derived table must have an alias.

### Example: Customer-wise total spending

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
) AS customer_summary;
```

The inner query calculates total spending per customer.

The outer query reads that result as if it were a table named `customer_summary`.

---

## 2. Why Do We Need Derived Tables?

Derived tables are useful when you need to:

- Filter the result of an aggregate query.
- Perform calculations in multiple stages.
- Join pre-aggregated results with other tables.
- Simplify complex queries.
- Avoid repeating complicated expressions.
- Prepare intermediate results for further processing.

### Example: Customers spending more than ₹20,000

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

You cannot directly use `WHERE` to filter the result of `SUM()` because WHERE operates before grouping.

The derived table calculates the aggregate first, then the outer query filters it.

---

## 3. Derived Tables with Aggregate Functions

Derived tables are particularly useful for multi-stage aggregation.

### Example 1: Average customer spending

```sql
SELECT
    AVG(total_spent) AS average_customer_spending
FROM (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS customer_summary;
```

**Execution concept:**

1. Inner query calculates total spending per customer.
2. Outer query calculates the average of those customer totals.

This is different from:

```sql
SELECT AVG(total_amount)
FROM orders;
```

The first query calculates the average total spending per customer. The second calculates the average individual order amount.

### Example 2: Departments with above-average employee count

```sql
SELECT
    department_id,
    employee_count
FROM (
    SELECT
        department_id,
        COUNT(*) AS employee_count
    FROM employees
    GROUP BY department_id
) AS department_summary
WHERE employee_count > (
    SELECT AVG(employee_count)
    FROM (
        SELECT
            COUNT(*) AS employee_count
        FROM employees
        GROUP BY department_id
    ) AS department_counts
);
```

This compares each department's employee count against the average department employee count.

---

## 4. Derived Tables with JOINs

You can JOIN a derived table with another table.

### Example: Customer details with total spending

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(cs.total_spent, 0) AS total_spent
FROM customers AS c
LEFT JOIN (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS cs
    ON c.customer_id = cs.customer_id;
```

### How it works

1. The derived table calculates total spending per customer.
2. The outer query joins those results with customers.
3. LEFT JOIN preserves customers who have never placed orders.
4. COALESCE converts missing totals into zero.

### Example: Department details with average salary

```sql
SELECT
    d.department_id,
    d.department_name,
    ds.avg_salary,
    ds.employee_count
FROM departments AS d
LEFT JOIN (
    SELECT
        department_id,
        AVG(salary) AS avg_salary,
        COUNT(*) AS employee_count
    FROM employees
    GROUP BY department_id
) AS ds
    ON d.department_id = ds.department_id;
```

This returns department information along with pre-calculated employee statistics.

---

## 5. Multiple Derived Tables in One Query

You can use multiple derived tables to calculate independent metrics.

### Example: Customer order totals and payment totals

```sql
SELECT
    c.customer_id,
    c.customer_name,

    COALESCE(o.total_orders, 0) AS total_orders,
    COALESCE(o.order_value, 0) AS order_value,
    COALESCE(p.total_paid, 0) AS total_paid

FROM customers AS c

LEFT JOIN (
    SELECT
        customer_id,
        COUNT(*) AS total_orders,
        SUM(total_amount) AS order_value
    FROM orders
    GROUP BY customer_id
) AS o
    ON c.customer_id = o.customer_id

LEFT JOIN (
    SELECT
        o.customer_id,
        SUM(p.amount) AS total_paid
    FROM orders AS o
    JOIN payments AS p
        ON o.order_id = p.order_id
    WHERE p.payment_status = 'completed'
    GROUP BY o.customer_id
) AS p
    ON c.customer_id = p.customer_id;
```

### Why use separate derived tables?

Suppose:

- A customer has 3 orders.
- One order has 2 payment records.
- Another order has 3 payment records.

Joining orders and payments directly creates multiple rows for some orders.

If you aggregate after that join without accounting for the multiplication, order totals can be inflated.

Pre-aggregating independent metrics helps prevent this problem.

---

## 6. Derived Tables with GROUP BY and HAVING

You can combine grouping inside a derived table with filtering outside it.

### Example: Find departments with more than five employees

```sql
SELECT
    department_id,
    employee_count
FROM (
    SELECT
        department_id,
        COUNT(*) AS employee_count
    FROM employees
    GROUP BY department_id
) AS department_summary
WHERE employee_count > 5;
```

You can also write this directly using HAVING:

```sql
SELECT
    department_id,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5;
```

Both express the same filtering requirement.

### When to use which?

- Use HAVING for straightforward aggregate filtering.
- Use a derived table when the aggregated result needs additional processing, joins or multiple query stages.

---

## 7. Derived Tables with ORDER BY and LIMIT

Derived tables are useful for selecting a limited result set and then processing it.

### Example: Find the five highest-value orders

```sql
SELECT
    order_id,
    customer_id,
    total_amount
FROM (
    SELECT
        order_id,
        customer_id,
        total_amount
    FROM orders
    ORDER BY total_amount DESC, order_id
    LIMIT 5
) AS top_orders
ORDER BY total_amount DESC, order_id;
```

The inner query selects the five highest-value orders.

The outer query displays those selected rows.

**Important:** ORDER BY inside a derived table determines which rows are selected by LIMIT. It does not guarantee the final output order. Use ORDER BY in the outer query when the final result must be sorted.

---

## 8. Derived Tables vs Correlated Subqueries

Both can solve similar problems, but their structure differs.

### Problem: Find employees earning above their department average

**Using a correlated subquery:**

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.department_id,
    e.salary
FROM employees AS e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees AS e2
    WHERE e2.department_id = e.department_id
);
```

**Using a derived table:**

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.department_id,
    e.salary,
    d.avg_salary
FROM employees AS e
JOIN (
    SELECT
        department_id,
        AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
) AS d
    ON e.department_id = d.department_id
WHERE e.salary > d.avg_salary;
```

### Comparison

| Derived table                      | Correlated subquery                             |
| ---------------------------------- | ----------------------------------------------- |
| Creates an intermediate result set | References the current outer row                |
| Commonly used for pre-aggregation  | Commonly used for per-row conditions            |
| Can be JOINed with other tables    | Can be used in WHERE, SELECT and other contexts |
| Requires an alias in FROM          | Requires correct outer and inner references     |

Neither is automatically faster. PostgreSQL's optimizer determines the execution strategy.

---

## 9. Derived Tables vs CTEs

A CTE and a derived table can express similar query logic.

### Derived table

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

### CTE

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

### Comparison

| Derived table                         | CTE                                        |
| ------------------------------------- | ------------------------------------------ |
| Defined inside FROM                   | Defined using WITH                         |
| Useful for local intermediate results | Useful for named query stages              |
| Nested structure                      | Often easier to read in multi-step queries |
| Can be nested inside other queries    | Can define multiple CTEs                   |

**Performance note:** A CTE is not automatically faster than a derived table. PostgreSQL can inline many CTEs. Materialization behavior depends on the query and PostgreSQL version.

---

## 10. Derived Tables and LATERAL

A normal derived table cannot reference columns from preceding FROM items.

For that, PostgreSQL provides LATERAL.

### Normal derived table — not allowed to reference the outer FROM item

```sql
SELECT
    c.customer_id,
    o.order_id
FROM customers AS c
JOIN (
    SELECT *
    FROM orders
    WHERE customer_id = c.customer_id
) AS o
    ON TRUE;
```

The reference to `c.customer_id` is invalid in this ordinary derived table.

### Correct using LATERAL

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
LEFT JOIN LATERAL (
    SELECT
        order_id,
        total_amount
    FROM orders
    WHERE customer_id = c.customer_id
    ORDER BY created_at DESC, order_id DESC
    LIMIT 1
) AS o ON TRUE;
```

LATERAL allows the derived table to reference the preceding customer row.

This returns each customer with their latest order, preserving customers without orders.

---

## 11. Important Rules and Common Mistakes

### Rule 1: Always provide an alias

Incorrect:

```sql
SELECT *
FROM (
    SELECT customer_id
    FROM orders
);
```

Correct:

```sql
SELECT *
FROM (
    SELECT customer_id
    FROM orders
) AS order_data;
```

### Rule 2: Give calculated columns meaningful aliases

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
) AS customer_summary;
```

### Rule 3: Do not reference inner columns outside their scope

The outer query can access columns exposed by the derived table, not arbitrary columns from tables hidden inside it.

### Rule 4: Avoid unnecessary nesting

Unnecessarily complicated:

```sql
SELECT *
FROM (
    SELECT *
    FROM (
        SELECT *
        FROM products
    ) AS first_layer
) AS second_layer;
```

Simpler:

```sql
SELECT *
FROM products;
```

Use derived tables when they add meaningful query logic.

### Rule 5: Be careful with JOIN multiplication

If you JOIN multiple one-to-many relationships, pre-aggregate each relationship independently when calculating totals.

### Rule 6: Do not assume ordering is preserved

Use ORDER BY in the outermost query when output order matters.

---

## 12. Practice Exercises

Use the TechBazaar database.

1. Calculate total spending per customer using a derived table.
2. Find customers spending more than ₹20,000.
3. Find the average customer spending across all customers who have placed orders.
4. Calculate employee count and average salary per department.
5. Find departments with more than five employees.
6. Join customer details with their total order value.
7. Join department details with average employee salary.
8. Calculate order totals and completed payment totals separately, then join them without double-counting.
9. Find the five highest-value orders using ORDER BY and LIMIT inside a derived table.
10. Find employees earning above their department's average salary using a derived table.
11. Rewrite the previous query using a correlated subquery.
12. Find the latest order for every customer using LEFT JOIN LATERAL.
13. Find the top two highest-value orders per customer using LATERAL.
14. Rewrite a derived-table query using a CTE.
15. Explain why an alias is required for a derived table in PostgreSQL.
16. Explain why ORDER BY inside a derived table does not guarantee final output order.

---

## 13. Interview Questions

**Q1. What is a derived table?**

A temporary result set created by a subquery in the FROM clause.

**Q2. Does a derived table require an alias in PostgreSQL?**

Yes. A derived table must have an alias.

**Q3. Can we JOIN a derived table with a normal table?**

Yes. It behaves like a table within the outer query.

**Q4. Can a derived table contain GROUP BY?**

Yes. It is commonly used for pre-aggregation.

**Q5. What is the difference between a derived table and a CTE?**

A derived table is defined inside FROM. A CTE is defined using WITH.

**Q6. What is the difference between a derived table and a correlated subquery?**

A derived table creates an intermediate result set. A correlated subquery references values from the outer query.

**Q7. Can a derived table reference an outer FROM item?**

Not normally. Use LATERAL when it needs to reference preceding FROM items.

**Q8. Why use derived tables with JOINs?**

They allow pre-aggregation and make it easier to combine calculated metrics with other tables.

**Q9. Are derived tables always materialized?**

No. PostgreSQL can optimize derived tables without necessarily storing their results as a separate materialized dataset.

**Q10. Why should we pre-aggregate before joining multiple one-to-many relationships?**

To prevent row multiplication from producing incorrect aggregate totals.

---

## Key Takeaways

- A derived table is a subquery inside FROM.
- PostgreSQL requires a derived table alias.
- Derived tables behave like temporary result sets within the outer query.
- They are useful for multi-stage calculations and pre-aggregation.
- They can be JOINed with other tables and other derived tables.
- Use them to filter aggregate results in an outer query.
- LATERAL allows a derived table to reference preceding FROM items.
- Derived tables and CTEs can express similar logic.
- Avoid unnecessary nesting and watch for JOIN multiplication.
- Use outer ORDER BY when final result ordering matters.
