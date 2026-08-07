---
sidebar_label: "Correlated Subqueries"
sidebar_position: 1
---

# Correlated Subqueries

## 1. What is a Correlated Subquery?

A **correlated subquery** is a subquery that references a column from the outer query.

Unlike a normal subquery, it depends on the current row being processed by the outer query.

### Normal subquery

```sql
SELECT
    employee_id,
    employee_name,
    salary
FROM employees
WHERE salary > (
    SELECT AVG(salary)
    FROM employees
);
```

The inner query calculates one company-wide average salary. It does not reference the outer query's current row.

### Correlated subquery

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.salary,
    e.department_id
FROM employees AS e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees AS e2
    WHERE e2.department_id = e.department_id
);
```

The inner query references:

```sql
e.department_id
```

This belongs to the outer query.

The inner query calculates the average salary for the department of the current employee.

The outer query returns employees earning more than their own department's average salary.

---

## 2. How Does a Correlated Subquery Work?

Consider this simplified employee data:

| employee_id | employee_name | department_id | salary |
| ----------: | ------------- | ------------: | -----: |
|         101 | Rahul         |             1 |  50000 |
|         102 | Amit          |             1 |  70000 |
|         103 | Priya         |             1 |  90000 |
|         104 | Neha          |             2 |  40000 |
|         105 | Karan         |             2 |  60000 |

Query:

```sql
SELECT
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

Conceptually:

**For Rahul:**

```sql
SELECT AVG(salary)
FROM employees
WHERE department_id = 1;
```

Average = 70,000.

Rahul earns 50,000, so he is excluded.

**For Amit:**

Department average = 70,000.

Amit earns 70,000, so he is excluded because the condition uses `>` rather than `>=`.

**For Priya:**

Department average = 70,000.

Priya earns 90,000, so she is included.

The same calculation happens for employees in department 2.

### Expected result

| employee_name | department_id | salary |
| ------------- | ------------: | -----: |
| Priya         |             1 |  90000 |
| Karan         |             2 |  60000 |

**Important:** This is a conceptual explanation. PostgreSQL's optimizer may transform the query rather than literally executing the inner query once for every outer row.

---

## 3. Correlated vs Non-Correlated Subqueries

| Non-correlated subquery              | Correlated subquery                            |
| ------------------------------------ | ---------------------------------------------- |
| Does not reference the outer query   | References the outer query                     |
| Independent of the current outer row | Depends on the current outer row               |
| Can be evaluated independently       | Its logical result depends on outer-row values |
| Often used for global comparisons    | Often used for per-row comparisons             |

### Non-correlated example

Find products priced above the overall average:

```sql
SELECT *
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

### Correlated example

Find products priced above their category's average:

```sql
SELECT
    p.product_id,
    p.product_name,
    p.category_id,
    p.price
FROM products AS p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM products AS p2
    WHERE p2.category_id = p.category_id
);
```

The difference is the comparison level:

- Non-correlated: Overall average.
- Correlated: Average for the current product's category.

---

## 4. Correlated Subquery in WHERE

This is one of the most common uses.

### Example 1: Employees earning more than their department average

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.salary,
    e.department_id
FROM employees AS e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees AS e2
    WHERE e2.department_id = e.department_id
);
```

### Example 2: Products priced above their category average

```sql
SELECT
    p.product_id,
    p.product_name,
    p.price,
    p.category_id
FROM products AS p
WHERE p.price > (
    SELECT AVG(p2.price)
    FROM products AS p2
    WHERE p2.category_id = p.category_id
);
```

### Example 3: Orders greater than the customer's average order value

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount
FROM orders AS o
WHERE o.total_amount > (
    SELECT AVG(o2.total_amount)
    FROM orders AS o2
    WHERE o2.customer_id = o.customer_id
);
```

### Example 4: Employees earning more than their manager

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.salary,
    e.manager_id
FROM employees AS e
WHERE e.salary > (
    SELECT m.salary
    FROM employees AS m
    WHERE m.employee_id = e.manager_id
);
```

This compares each employee's salary with the salary of their manager.

If the employee has no manager, the inner query returns no rows, producing NULL. The comparison is UNKNOWN, so that employee is excluded.

---

## 5. Correlated Subquery with EXISTS

EXISTS is particularly useful with correlated subqueries.

### Example 1: Customers who have placed orders

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

The subquery checks for orders belonging to the current customer.

### Example 2: Products that have been ordered

```sql
SELECT
    p.product_id,
    p.product_name
FROM products AS p
WHERE EXISTS (
    SELECT 1
    FROM order_items AS oi
    WHERE oi.product_id = p.product_id
);
```

### Example 3: Departments containing active employees

```sql
SELECT
    d.department_id,
    d.department_name
FROM departments AS d
WHERE EXISTS (
    SELECT 1
    FROM employees AS e
    WHERE e.department_id = d.department_id
      AND e.status = 'active'
);
```

The subquery checks whether the current department has at least one active employee.

---

## 6. Correlated Subquery with NOT EXISTS

NOT EXISTS checks whether no matching row exists for the current outer row.

### Example 1: Customers who have never placed orders

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

### Example 2: Products never ordered

```sql
SELECT
    p.product_id,
    p.product_name
FROM products AS p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items AS oi
    WHERE oi.product_id = p.product_id
);
```

### Example 3: Departments without employees

```sql
SELECT
    d.department_id,
    d.department_name
FROM departments AS d
WHERE NOT EXISTS (
    SELECT 1
    FROM employees AS e
    WHERE e.department_id = d.department_id
);
```

These queries are examples of anti-join logic.

---

## 7. Correlated Subquery in SELECT

A correlated subquery can calculate a value for each outer row.

### Example: Total orders per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,

    (
        SELECT COUNT(*)
        FROM orders AS o
        WHERE o.customer_id = c.customer_id
    ) AS total_orders

FROM customers AS c;
```

### Example: Total completed payments per order

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount,

    (
        SELECT COALESCE(SUM(p.amount), 0)
        FROM payments AS p
        WHERE p.order_id = o.order_id
          AND p.payment_status = 'completed'
    ) AS total_paid

FROM orders AS o;
```

The inner query calculates the completed payment total for each order.

`COALESCE()` converts a NULL aggregate result into zero.

### Important performance consideration

A correlated subquery in SELECT may involve repeated logical work for outer rows. For large datasets, compare it with a pre-aggregated JOIN or CTE.

---

## 8. Correlated Subquery in FROM: LATERAL

A normal derived table in FROM cannot directly reference columns from another FROM item.

PostgreSQL provides `LATERAL` for this purpose.

### Example: Latest order for each customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    latest_order.order_id,
    latest_order.total_amount,
    latest_order.created_at
FROM customers AS c
LEFT JOIN LATERAL (
    SELECT
        o.order_id,
        o.total_amount,
        o.created_at
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
    ORDER BY o.created_at DESC, o.order_id DESC
    LIMIT 1
) AS latest_order ON TRUE;
```

### How it works

1. PostgreSQL considers a customer row.
2. The LATERAL subquery can access that customer's ID.
3. It finds the latest matching order.
4. LEFT JOIN preserves customers who have no orders.

### CROSS JOIN LATERAL vs LEFT JOIN LATERAL

| CROSS JOIN LATERAL                          | LEFT JOIN LATERAL                            |
| ------------------------------------------- | -------------------------------------------- |
| Excludes outer rows with no matching result | Preserves outer rows with no matching result |
| Similar to an inner lateral join            | Similar to a left lateral join               |
| Useful when a match is required             | Useful when optional related data is needed  |

### Example: Top two orders per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    recent_orders.order_id,
    recent_orders.total_amount
FROM customers AS c
CROSS JOIN LATERAL (
    SELECT
        o.order_id,
        o.total_amount
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
    ORDER BY o.total_amount DESC, o.order_id
    LIMIT 2
) AS recent_orders;
```

This returns up to two highest-value orders per customer.

---

## 9. Correlated Subquery vs JOIN

Many correlated subqueries can be rewritten using JOINs or pre-aggregated derived tables.

### Problem: Employees earning more than their department average

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

**Using a JOIN with pre-aggregation:**

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

Both calculate the average salary per department and return employees earning above it.

### Comparison

| Correlated subquery                       | JOIN with pre-aggregation                       |
| ----------------------------------------- | ----------------------------------------------- |
| Expresses per-row dependent logic         | Expresses matching against grouped results      |
| Often concise for existence checks        | Useful when aggregate values are also needed    |
| Can be easy to read for simple conditions | Can make shared aggregate calculations explicit |
| May involve repeated logical evaluation   | Can make aggregation reuse clearer              |

Neither is automatically faster. PostgreSQL can optimize correlated subqueries using strategies such as semi-joins, anti-joins or other plan transformations, depending on the query.

---

## 10. Correlated Subquery vs Window Function

Some correlated aggregate queries can be expressed using window functions.

### Correlated subquery

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

### Window function alternative

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,
    avg_salary
FROM (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,
        AVG(salary) OVER (
            PARTITION BY department_id
        ) AS avg_salary
    FROM employees
) AS employee_stats
WHERE salary > avg_salary;
```

### Comparison

| Correlated subquery                                           | Window function                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| Calculates a value based on the outer row                     | Calculates across a defined window                             |
| Useful for existence and conditional checks                   | Useful for per-row analytics                                   |
| Can be concise for simple comparisons                         | Often useful when the calculated metric must also be displayed |
| Does not automatically preserve the aggregate value in output | Can return the aggregate alongside each row                    |

Window functions are covered in Part 11.

---

## 11. Performance and Indexing

Correlated subqueries are not inherently slow. Performance depends on the query, indexes, table size, data distribution and PostgreSQL's chosen execution plan.

### Example

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

An index on `orders.customer_id` can help PostgreSQL find matching orders efficiently.

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

For a query that finds each customer's latest order:

```sql
CREATE INDEX idx_orders_customer_latest
ON orders(customer_id, created_at DESC, order_id DESC);
```

This index aligns with the filtering and ordering in the LATERAL example.

### Inspect the execution plan

```sql
EXPLAIN ANALYZE
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

Check:

- Scan types.
- Join strategies.
- Index usage.
- Actual rows.
- Execution time.
- Whether the plan performs repeated work.

`EXPLAIN ANALYZE` executes the query and reports actual execution statistics.

---

## 12. Common Mistakes

| Mistake                                                        | Correct understanding                                     |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| Assuming every subquery is correlated                          | It is correlated only if it references an outer query     |
| Forgetting table aliases                                       | Use separate aliases for outer and inner table references |
| Comparing against the company average instead of group average | Correlate using the appropriate grouping key              |
| Using `=` when the inner query may return multiple rows        | Use an appropriate multi-row operator                     |
| Using JOIN when only existence is needed                       | Consider EXISTS to avoid multiplying outer rows           |
| Assuming correlated queries are always slow                    | Inspect the actual execution plan                         |
| Using CROSS JOIN LATERAL when unmatched outer rows must remain | Use LEFT JOIN LATERAL                                     |
| Forgetting deterministic ordering in a top-N LATERAL query     | Add a unique tie-breaker to ORDER BY                      |

---

## 13. Practice Exercises

Use the TechBazaar database.

1. Find employees earning more than their department's average salary.
2. Find employees earning less than their department's average salary.
3. Find products priced above their category's average price.
4. Find orders whose amount exceeds the customer's average order amount.
5. Find employees earning more than their managers.
6. Find customers who have placed at least one order using correlated EXISTS.
7. Find customers who have never placed an order using correlated NOT EXISTS.
8. Find departments containing at least one active employee.
9. Find products that have never been ordered.
10. Display each customer with their total order count using a correlated SELECT subquery.
11. Display each order with its completed payment total.
12. Find each customer's highest-value order using LATERAL.
13. Find the two latest orders for every customer using LATERAL.
14. Rewrite the department-average correlated subquery using a JOIN.
15. Rewrite the department-average correlated subquery using a window function.
16. Compare the execution plans of EXISTS and JOIN for a customer-order query.

---

## 14. Interview Questions

**Q1. What is a correlated subquery?**

A subquery that references a column from the outer query.

**Q2. What is the main difference between correlated and non-correlated subqueries?**

A non-correlated subquery is independent of the outer query. A correlated subquery depends on values from the outer query.

**Q3. Can correlated subqueries be used with EXISTS?**

Yes. This is a common way to check whether matching records exist for each outer row.

**Q4. Can correlated subqueries be used in SELECT?**

Yes. They can calculate additional values for each outer row.

**Q5. What is LATERAL in PostgreSQL?**

LATERAL allows a FROM subquery to reference columns from preceding FROM items.

**Q6. What is the difference between CROSS JOIN LATERAL and LEFT JOIN LATERAL?**

CROSS JOIN LATERAL excludes outer rows without a matching result. LEFT JOIN LATERAL preserves them.

**Q7. Are correlated subqueries always slower than JOINs?**

No. PostgreSQL can optimize correlated queries. Performance must be measured.

**Q8. When would you prefer a correlated subquery over a JOIN?**

When expressing existence checks or straightforward per-row dependent conditions.

**Q9. When would you prefer a window function?**

When you need to calculate group-level or analytical values while preserving individual rows.

**Q10. How can you improve correlated subquery performance?**

Use suitable indexes, simplify the query, avoid unnecessary repeated work and inspect execution plans.

---

## Key Takeaways

- A correlated subquery references columns from an outer query.
- It is useful for per-row comparisons, such as comparing an employee's salary with their department average.
- EXISTS and NOT EXISTS are common correlated-subquery patterns.
- Correlated subqueries can appear in WHERE and SELECT.
- PostgreSQL's LATERAL allows correlated subqueries in FROM.
- CROSS JOIN LATERAL removes outer rows without matches; LEFT JOIN LATERAL preserves them.
- Many correlated aggregate queries can be rewritten using JOINs or window functions.
- Correlated does not automatically mean slow. Use EXPLAIN ANALYZE and appropriate indexes to evaluate performance.
