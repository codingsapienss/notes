---
sidebar_label: "Complex Real-World SQL Scenarios"
sidebar_position: 1
---

# Complex Real-World SQL Scenarios

## 1. Introduction

Real-world backend development requires combining multiple SQL concepts to solve business problems.

A production query may involve:

- Multiple JOINs.
- Subqueries and CTEs.
- Aggregations.
- Window functions.
- Conditional logic.
- Transactions.
- Indexes.
- Pagination.
- NULL handling.
- Concurrent operations.

The goal is not simply to write a query that works. It is to write one that produces correct results, handles edge cases and performs efficiently as data grows.

The following scenarios use the TechBazaar database.

---

## 2. Scenario 1 — Find Customers Who Have Never Placed an Order

**Requirement:** Find customers who exist in the `customers` table but have no corresponding order.

### Solution using NOT EXISTS

```sql
SELECT
    c.customer_id,
    c.customer_name,
    c.email
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

### Alternative using LEFT JOIN

```sql
SELECT
    c.customer_id,
    c.customer_name,
    c.email
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

### Why prefer NOT EXISTS?

- It directly expresses the requirement.
- It avoids the NULL-related problem associated with `NOT IN`.
- PostgreSQL can often produce an efficient anti-join plan.

**Interview concept:** Anti-join.

---

## 3. Scenario 2 — Find the Top 5 Customers by Total Spending

**Requirement:** Find the five customers who have spent the most money.

Assumption: `orders.total_amount` represents the amount to be counted as spending. The query includes only completed orders.

```sql
SELECT
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
GROUP BY
    c.customer_id,
    c.customer_name
ORDER BY total_spent DESC
LIMIT 5;
```

### Include customers with zero spending

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
   AND o.status = 'completed'
GROUP BY
    c.customer_id,
    c.customer_name
ORDER BY total_spent DESC
LIMIT 5;
```

### Important

The completed-order condition belongs in the `ON` clause here. Putting it in `WHERE` would remove customers without completed orders and effectively turn the LEFT JOIN into an inner join.

---

## 4. Scenario 3 — Find the Most Expensive Product in Each Category

**Requirement:** Return the highest-priced product from every category.

### Solution using ROW_NUMBER

```sql
WITH ranked_products AS (
    SELECT
        p.product_id,
        p.product_name,
        p.category_id,
        p.price,
        ROW_NUMBER() OVER (
            PARTITION BY p.category_id
            ORDER BY p.price DESC, p.product_id
        ) AS rn
    FROM products p
)
SELECT
    product_id,
    product_name,
    category_id,
    price
FROM ranked_products
WHERE rn = 1;
```

### Return all products tied for the highest price

Use `RANK()` instead:

```sql
WITH ranked_products AS (
    SELECT
        p.product_id,
        p.product_name,
        p.category_id,
        p.price,
        RANK() OVER (
            PARTITION BY p.category_id
            ORDER BY p.price DESC
        ) AS product_rank
    FROM products p
)
SELECT *
FROM ranked_products
WHERE product_rank = 1;
```

### Key distinction

- `ROW_NUMBER()` returns exactly one row per nonempty category.
- `RANK()` returns all products tied for the highest price.

---

## 5. Scenario 4 — Find Monthly Revenue

**Requirement:** Calculate completed-order revenue for every month.

```sql
SELECT
    DATE_TRUNC('month', created_at) AS revenue_month,
    SUM(total_amount) AS monthly_revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY revenue_month;
```

### Extract year and month separately

```sql
SELECT
    EXTRACT(YEAR FROM created_at) AS year,
    EXTRACT(MONTH FROM created_at) AS month,
    SUM(total_amount) AS monthly_revenue
FROM orders
WHERE status = 'completed'
GROUP BY
    EXTRACT(YEAR FROM created_at),
    EXTRACT(MONTH FROM created_at)
ORDER BY year, month;
```

### Important

For production reporting, define the business timezone explicitly.

`TIMESTAMPTZ` values are instants, and month boundaries depend on the timezone used for reporting.

For example, to report by India Standard Time:

```sql
SELECT
    DATE_TRUNC(
        'month',
        created_at AT TIME ZONE 'Asia/Kolkata'
    ) AS revenue_month_ist,
    SUM(total_amount) AS monthly_revenue
FROM orders
WHERE status = 'completed'
GROUP BY 1
ORDER BY 1;
```

---

## 6. Scenario 5 — Calculate Running Revenue

**Requirement:** Show each completed order and cumulative revenue over time.

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

### Example output

| order_id | total_amount | running_revenue |
| -------: | -----------: | --------------: |
|      101 |          500 |             500 |
|      102 |          700 |            1200 |
|      103 |          300 |            1500 |
|      104 |          900 |            2400 |

### Why specify ROWS?

It makes the intended row-by-row running calculation explicit, even when multiple orders have identical timestamps.

---

## 7. Scenario 6 — Find Customers With More Than 3 Orders

**Requirement:** Return customers who have placed more than three orders.

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

### Include customers with zero orders

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
GROUP BY
    c.customer_id,
    c.customer_name
HAVING COUNT(o.order_id) > 3;
```

**Important:** Use `COUNT(o.order_id)`, not `COUNT(*)`, when counting matching orders after a LEFT JOIN. `COUNT(*)` would count the preserved customer row even when no order exists.

---

## 8. Scenario 7 — Find the Second-Highest Salary

**Requirement:** Find the second-highest distinct salary among employees.

### Solution using DENSE_RANK

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
SELECT
    employee_id,
    employee_name,
    salary
FROM salary_ranking
WHERE salary_rank = 2;
```

### Alternative using a subquery

```sql
SELECT MAX(salary) AS second_highest_salary
FROM employees
WHERE salary < (
    SELECT MAX(salary)
    FROM employees
);
```

### Important

- `DENSE_RANK()` returns all employees sharing the second-highest distinct salary.
- `ROW_NUMBER()` returns one employee if you provide a deterministic tie-breaker.
- The subquery solution returns only the salary, not the employee details.

---

## 9. Scenario 8 — Find Products That Have Never Been Ordered

**Requirement:** Find products that do not appear in `order_items`.

```sql
SELECT
    p.product_id,
    p.product_name,
    p.price
FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.product_id = p.product_id
);
```

### Alternative using LEFT JOIN

```sql
SELECT
    p.product_id,
    p.product_name
FROM products p
LEFT JOIN order_items oi
    ON oi.product_id = p.product_id
WHERE oi.product_id IS NULL;
```

**Interview concept:** Anti-join using NOT EXISTS.

---

## 10. Scenario 9 — Find the Best-Selling Products

**Requirement:** Calculate total units sold for every product.

```sql
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.quantity) AS total_units_sold
FROM products p
JOIN order_items oi
    ON oi.product_id = p.product_id
JOIN orders o
    ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY
    p.product_id,
    p.product_name
ORDER BY total_units_sold DESC;
```

### Return only the top 5

```sql
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.quantity) AS total_units_sold
FROM products p
JOIN order_items oi
    ON oi.product_id = p.product_id
JOIN orders o
    ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY
    p.product_id,
    p.product_name
ORDER BY total_units_sold DESC
LIMIT 5;
```

### Important

The query counts only completed orders. If the business defines sales differently, adjust the status condition accordingly.

---

## 11. Scenario 10 — Find Employees Earning More Than Their Department Average

**Requirement:** Find employees whose salary is greater than the average salary of their department.

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.department_id,
    e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department_id = e.department_id
);
```

### Alternative using a window function

```sql
WITH employee_salary AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,
        AVG(salary) OVER (
            PARTITION BY department_id
        ) AS department_avg_salary
    FROM employees
)
SELECT *
FROM employee_salary
WHERE salary > department_avg_salary;
```

### Key concept

The window function calculates a department average without collapsing individual employee rows.

---

## 12. Scenario 11 — Find Customers Who Ordered Every Product in a Category

**Requirement:** Find customers who have ordered every product belonging to a specified category.

This is a relational division problem.

Assume category ID `5`.

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

### How it works

- The outer query considers each customer.
- The first NOT EXISTS looks for a product in category 5.
- The second NOT EXISTS checks whether the customer has ordered that product.
- A customer qualifies when no category product is missing from their completed orders.

### Important edge case

If category 5 contains no products, this query returns every customer because there is no missing product.

If that is not the intended business rule, explicitly require that the category contains at least one product.

---

## 13. Scenario 12 — Find Consecutive Orders Within a Short Time Gap

**Requirement:** Identify orders from the same customer that occurred less than 10 minutes after the previous order.

Use `LAG()`:

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
SELECT
    order_id,
    customer_id,
    previous_order_time,
    created_at,
    created_at - previous_order_time AS time_gap
FROM order_history
WHERE created_at - previous_order_time < INTERVAL '10 minutes'
  AND previous_order_time IS NOT NULL;
```

### Use cases

- Detect repeated order submissions.
- Identify unusual purchase patterns.
- Analyze customer activity.
- Investigate duplicate requests.

**Important:** A short time gap is an indicator for investigation, not proof of fraud or duplication.

---

## 14. Scenario 13 — Calculate Order Totals From Order Items

**Requirement:** Calculate the total value of each order using its line items.

```sql
SELECT
    oi.order_id,
    SUM(oi.quantity * oi.unit_price) AS calculated_total
FROM order_items oi
GROUP BY oi.order_id
ORDER BY oi.order_id;
```

### Compare with stored order totals

```sql
WITH calculated_totals AS (
    SELECT
        order_id,
        SUM(quantity * unit_price) AS calculated_total
    FROM order_items
    GROUP BY order_id
)
SELECT
    o.order_id,
    o.total_amount AS stored_total,
    ct.calculated_total,
    o.total_amount - ct.calculated_total AS difference
FROM orders o
JOIN calculated_totals ct
    ON ct.order_id = o.order_id
WHERE o.total_amount <> ct.calculated_total;
```

### Important

This comparison assumes that `orders.total_amount` should equal the sum of item values.

If the application includes shipping, tax, discounts or other adjustments, those must be accounted for before comparing totals.

---

## 15. Scenario 14 — Find Orders With No Successful Payment

**Requirement:** Find orders that have no successful payment record.

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount,
    o.status
FROM orders o
WHERE NOT EXISTS (
    SELECT 1
    FROM payments p
    WHERE p.order_id = o.order_id
      AND p.payment_status = 'success'
);
```

### Alternative using LEFT JOIN

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount
FROM orders o
LEFT JOIN payments p
    ON p.order_id = o.order_id
   AND p.payment_status = 'success'
WHERE p.payment_id IS NULL;
```

### Important

This finds orders without a successful payment record. It does not establish whether the order is unpaid, failed, pending, refunded or awaiting reconciliation.

Business rules must define what each payment state means.

---

## 16. Scenario 15 — Calculate Payment Totals Per Order

**Requirement:** Calculate total successful payments for every order.

```sql
SELECT
    o.order_id,
    o.total_amount,
    COALESCE(
        SUM(p.amount) FILTER (
            WHERE p.payment_status = 'success'
        ),
        0
    ) AS successful_payment_total
FROM orders o
LEFT JOIN payments p
    ON p.order_id = o.order_id
GROUP BY
    o.order_id,
    o.total_amount
ORDER BY o.order_id;
```

### Find orders with payment mismatches

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
    COALESCE(pt.paid_amount, 0) AS paid_amount,
    o.total_amount - COALESCE(pt.paid_amount, 0) AS remaining_amount
FROM orders o
LEFT JOIN payment_totals pt
    ON pt.order_id = o.order_id
WHERE o.total_amount <> COALESCE(pt.paid_amount, 0);
```

**Important:** This is a simplified reconciliation query. Real payment systems may need to account for refunds, partial captures, fees, currencies and payment reversals.

---

## 17. Scenario 16 — Avoid Row Multiplication When Joining Multiple One-to-Many Tables

This is one of the most important real-world SQL problems.

Suppose you want:

- Customer details.
- Total number of orders.
- Total number of successful payments.

A customer can have multiple orders, and each order can have multiple payment records.

### Problematic query

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    SUM(p.amount) AS total_payments
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
LEFT JOIN payments p
    ON p.order_id = o.order_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

Why can this produce incorrect results?

Suppose one order has:

- Two payment records.
- One order row.

The JOIN produces two result rows for that order.

Consequently, `COUNT(o.order_id)` counts the order twice.

### Correct solution: Pre-aggregate

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
    WHERE p.payment_status = 'success'
    GROUP BY o.customer_id
)
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(os.total_orders, 0) AS total_orders,
    COALESCE(ps.total_payments, 0) AS total_payments
FROM customers c
LEFT JOIN order_summary os
    ON os.customer_id = c.customer_id
LEFT JOIN payment_summary ps
    ON ps.customer_id = c.customer_id;
```

### Key principle

Aggregate independent one-to-many relationships before joining their results.

Do not use `COUNT(DISTINCT ...)` or `SUM(DISTINCT ...)` blindly to hide row multiplication. `SUM(DISTINCT amount)` can incorrectly discard legitimate equal-valued payments.

---

## 18. Scenario 17 — Find the Latest Order for Every Customer

**Requirement:** Return the latest order for each customer.

### Solution using ROW_NUMBER

```sql
WITH ranked_orders AS (
    SELECT
        order_id,
        customer_id,
        total_amount,
        status,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY created_at DESC, order_id DESC
        ) AS rn
    FROM orders
)
SELECT
    order_id,
    customer_id,
    total_amount,
    status,
    created_at
FROM ranked_orders
WHERE rn = 1;
```

### PostgreSQL-specific alternative: DISTINCT ON

```sql
SELECT DISTINCT ON (customer_id)
    order_id,
    customer_id,
    total_amount,
    status,
    created_at
FROM orders
ORDER BY
    customer_id,
    created_at DESC,
    order_id DESC;
```

### Include customers without orders

Use a LEFT JOIN LATERAL:

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount,
    o.created_at
FROM customers c
LEFT JOIN LATERAL (
    SELECT
        order_id,
        total_amount,
        created_at
    FROM orders
    WHERE customer_id = c.customer_id
    ORDER BY created_at DESC, order_id DESC
    LIMIT 1
) o ON TRUE;
```

---

## 19. Scenario 18 — Calculate Department Salary Rankings

**Requirement:** Rank employees by salary within their departments.

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,
    ROW_NUMBER() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC, employee_id
    ) AS row_number,
    RANK() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC
    ) AS salary_rank,
    DENSE_RANK() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC
    ) AS dense_salary_rank
FROM employees;
```

### Return the top three distinct salary levels

```sql
WITH ranked_employees AS (
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
    WHERE salary IS NOT NULL
)
SELECT *
FROM ranked_employees
WHERE salary_rank <= 3;
```

---

## 20. Scenario 19 — Find Employees and Their Manager Names

**Requirement:** Display each employee alongside their manager.

The `employees` table has a self-referencing `manager_id`.

```sql
SELECT
    e.employee_id,
    e.employee_name,
    m.employee_id AS manager_id,
    m.employee_name AS manager_name
FROM employees e
LEFT JOIN employees m
    ON m.employee_id = e.manager_id;
```

### Why LEFT JOIN?

Employees without managers should still appear in the result.

### Find employees who report directly to a specific manager

```sql
SELECT
    employee_id,
    employee_name,
    manager_id
FROM employees
WHERE manager_id = 10;
```

---

## 21. Scenario 20 — Find the Complete Employee Hierarchy

**Requirement:** Display all employees under a particular manager, including indirect reports.

Use a recursive CTE.

```sql
WITH RECURSIVE employee_hierarchy AS (
    SELECT
        employee_id,
        employee_name,
        manager_id,
        1 AS level
    FROM employees
    WHERE employee_id = 10

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
FROM employee_hierarchy
ORDER BY level, employee_id;
```

### Explanation

- Anchor query starts from employee ID 10.
- Recursive query finds employees reporting to the current hierarchy level.
- Recursion continues until no more subordinate employees are found.

### Important

If the employee hierarchy contains cycles because of bad data, recursion can continue indefinitely. Enforce valid manager relationships and use cycle detection where necessary.

---

## 22. Scenario 21 — Find Duplicate Customer Emails

**Requirement:** Identify email values used by multiple customer records.

```sql
SELECT
    email,
    COUNT(*) AS occurrences
FROM customers
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;
```

### Retrieve the duplicate customer records

```sql
WITH duplicate_emails AS (
    SELECT email
    FROM customers
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
)
SELECT
    c.customer_id,
    c.customer_name,
    c.email
FROM customers c
JOIN duplicate_emails d
    ON d.email = c.email
ORDER BY c.email, c.customer_id;
```

### Prevent future duplicates

After cleaning existing duplicates:

```sql
ALTER TABLE customers
ADD CONSTRAINT customers_email_unique
UNIQUE(email);
```

This assumes the business rule requires unique non-NULL emails. PostgreSQL's default UNIQUE constraint allows multiple NULL values.

---

## 23. Scenario 22 — Find Orders Within a Date Range

**Requirement:** Retrieve orders created during November 2026.

Avoid applying a date conversion to the indexed timestamp column when a direct range condition is possible.

### Recommended approach

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at
FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-11-01 00:00:00+00'
  AND created_at <  TIMESTAMPTZ '2026-12-01 00:00:00+00'
ORDER BY created_at;
```

### Why use an exclusive upper boundary?

It includes every timestamp in November without needing to guess the last fractional second of the month.

### Important

The example uses UTC boundaries. If the business reporting month follows another timezone, calculate the corresponding timezone-aware boundaries.

---

## 24. Scenario 23 — Find Customers With Orders in Every Month of a Period

**Requirement:** Find customers who placed at least one order in each of the three months from January through March 2026.

```sql
SELECT
    customer_id
FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-01-01 00:00:00+00'
  AND created_at <  TIMESTAMPTZ '2026-04-01 00:00:00+00'
GROUP BY customer_id
HAVING COUNT(
    DISTINCT DATE_TRUNC(
        'month',
        created_at AT TIME ZONE 'UTC'
    )
) = 3;
```

### Explanation

- Restricts orders to the three-month period.
- Groups by customer.
- Counts distinct months containing orders.
- Returns customers with activity in all three months.

This assumes the requested period consists of exactly three calendar months and uses UTC month boundaries.

---

## 25. Scenario 24 — Calculate Conversion Between Orders and Payments

**Requirement:** Calculate the percentage of orders with at least one successful payment.

```sql
SELECT
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (
        WHERE EXISTS (
            SELECT 1
            FROM payments p
            WHERE p.order_id = o.order_id
              AND p.payment_status = 'success'
        )
    ) AS paid_orders,
    ROUND(
        100.0 * COUNT(*) FILTER (
            WHERE EXISTS (
                SELECT 1
                FROM payments p
                WHERE p.order_id = o.order_id
                  AND p.payment_status = 'success'
            )
        ) / NULLIF(COUNT(*), 0),
        2
    ) AS payment_conversion_percentage
FROM orders o;
```

### Why NULLIF?

`NULLIF(COUNT(*), 0)` prevents division by zero if the orders table contains no rows.

### Alternative using conditional aggregation

```sql
SELECT
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (
        WHERE paid
    ) AS paid_orders,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE paid)
        / NULLIF(COUNT(*), 0),
        2
    ) AS payment_conversion_percentage
FROM (
    SELECT
        o.order_id,
        EXISTS (
            SELECT 1
            FROM payments p
            WHERE p.order_id = o.order_id
              AND p.payment_status = 'success'
        ) AS paid
    FROM orders o
) order_payment_status;
```

---

## 26. Scenario 25 — Safely Deduct Inventory for an Order

**Requirement:** Deduct inventory for a product only if enough stock is available.

A separate SELECT followed by UPDATE is unsafe under concurrency.

Use a conditional update:

```sql
BEGIN;

UPDATE products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 5
  AND stock_quantity >= 2
RETURNING product_id, stock_quantity;

-- Continue only if the UPDATE returned one row.

COMMIT;
```

If no row is returned, the product was unavailable or insufficient stock existed.

For multiple products:

1. Begin a transaction.
2. Deduct each required quantity using conditional UPDATE statements.
3. Verify that every deduction succeeded.
4. Insert the order and its items.
5. Commit only if all required operations succeed.
6. Otherwise roll back.

### Important

`stock_quantity` is not part of the original TechBazaar schema. This scenario assumes it was added through a schema migration.

---

## 27. Scenario 26 — Identify Revenue by Product Category

**Requirement:** Calculate completed-order revenue for each category.

```sql
SELECT
    p.category_id,
    SUM(oi.quantity * oi.unit_price) AS category_revenue
FROM products p
JOIN order_items oi
    ON oi.product_id = p.product_id
JOIN orders o
    ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.category_id
ORDER BY category_revenue DESC;
```

### Include category names

The original schema includes `categories`. Assuming its primary key is `category_id` and its display column is `category_name`:

```sql
SELECT
    c.category_id,
    c.category_name,
    SUM(oi.quantity * oi.unit_price) AS category_revenue
FROM categories c
JOIN products p
    ON p.category_id = c.category_id
JOIN order_items oi
    ON oi.product_id = p.product_id
JOIN orders o
    ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY
    c.category_id,
    c.category_name
ORDER BY category_revenue DESC;
```

---

## 28. Scenario 27 — Find the Percentage Contribution of Each Product to Revenue

**Requirement:** Calculate each product's percentage contribution to total completed-order item revenue.

```sql
WITH product_revenue AS (
    SELECT
        p.product_id,
        p.product_name,
        SUM(oi.quantity * oi.unit_price) AS revenue
    FROM products p
    JOIN order_items oi
        ON oi.product_id = p.product_id
    JOIN orders o
        ON o.order_id = oi.order_id
    WHERE o.status = 'completed'
    GROUP BY
        p.product_id,
        p.product_name
)
SELECT
    product_id,
    product_name,
    revenue,
    ROUND(
        100.0 * revenue
        / NULLIF(SUM(revenue) OVER (), 0),
        2
    ) AS revenue_percentage
FROM product_revenue
ORDER BY revenue DESC;
```

### Concepts used

- CTE.
- JOIN.
- GROUP BY.
- SUM.
- Window aggregate.
- NULLIF.
- ROUND.

---

## 29. Scenario 28 — Find Gaps in Order IDs

**Requirement:** Identify missing order ID ranges.

First, understand that sequence gaps are normal in PostgreSQL. Deleted records, rolled-back transactions and sequence caching can all produce gaps.

A simple method using `LEAD()`:

```sql
WITH ordered_ids AS (
    SELECT
        order_id,
        LEAD(order_id) OVER (
            ORDER BY order_id
        ) AS next_order_id
    FROM orders
)
SELECT
    order_id + 1 AS gap_start,
    next_order_id - 1 AS gap_end
FROM ordered_ids
WHERE next_order_id > order_id + 1;
```

### Important

A gap in sequence-generated IDs does not prove that an order was deleted or that the application failed.

---

## 30. Query Design Principles for Complex Scenarios

Before writing a complex query, follow this process:

### Step 1: Understand the requirement

Identify:

- Required output columns.
- Filtering conditions.
- Grouping requirements.
- Sorting requirements.
- Whether unmatched records should be included.
- Whether duplicates are expected.

### Step 2: Identify relationships

Understand:

- Primary keys.
- Foreign keys.
- One-to-one relationships.
- One-to-many relationships.
- Many-to-many relationships.

### Step 3: Break down the query

Use:

- CTEs for logical stages.
- Subqueries for intermediate results.
- Window functions for row-level analytics.
- JOINs for related records.
- EXISTS for existence checks.

### Step 4: Handle edge cases

Check:

- NULL values.
- Empty tables.
- Duplicate records.
- Missing relationships.
- Equal ranking values.
- Zero denominators.
- Multiple matching child rows.
- Timezone boundaries.

### Step 5: Verify correctness

Use:

- Small sample datasets.
- Independent calculations.
- COUNT checks.
- Comparison queries.
- Transactional test environments.

### Step 6: Optimize

Inspect:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

Then evaluate:

- Sequential scans.
- Index scans.
- Join strategies.
- Row estimates.
- Actual execution time.
- Buffer reads.
- Sort and aggregation costs.

Do not optimize based on assumptions alone.

---

## 31. Practice Exercises

Write SQL queries for the following requirements.

1. Find customers who have placed at least one completed order.
2. Find customers whose total spending exceeds ₹50,000.
3. Find the top three products by total units sold in each category.
4. Find departments where the average employee salary exceeds ₹50,000.
5. Find employees who earn more than their manager.
6. Find customers whose latest order is older than 90 days.
7. Find products that have never appeared in any completed order.
8. Find the month with the highest completed-order revenue.
9. Find customers who placed orders in at least six different months.
10. Find the top 10 customers by successful payment amount.
11. Find orders where the stored total differs from the sum of their items.
12. Find orders where successful payments exceed the order total.
13. Find employees who are among the top two earners in their departments.
14. Find duplicate customer emails and retrieve all matching customer records.
15. Find consecutive orders from the same customer within five minutes.
16. Find customers who ordered every product in a specified category.
17. Find the latest payment for every order.
18. Find the percentage of completed orders with successful payments.
19. Calculate a running monthly revenue total.
20. Find customers with no successful payments.
21. Retrieve the full employee hierarchy below a manager.
22. Find the top-selling product for each month.
23. Identify missing order ID ranges.
24. Find customers whose completed-order spending is higher than the overall average customer spending.
25. Deduct stock safely for multiple products within one transaction.

---

## 32. Interview Questions

**Q1. How do you find records that do not have a matching record in another table?**

Use `NOT EXISTS` or a LEFT JOIN with an IS NULL condition.

**Q2. How do you find the second-highest salary?**

Use a subquery with MAX or `DENSE_RANK()`.

**Q3. How do you find the top N records per group?**

Use `ROW_NUMBER()`, `RANK()` or `DENSE_RANK()` with PARTITION BY.

**Q4. What is relational division?**

A query pattern that finds entities associated with every item in another set, often implemented using nested NOT EXISTS.

**Q5. Why can joining two one-to-many relationships produce incorrect aggregates?**

The joined rows multiply, causing counts and sums to be duplicated.

**Q6. How do you avoid row multiplication?**

Pre-aggregate independent one-to-many relationships before joining their results.

**Q7. How do you calculate running totals?**

Use an aggregate window function with an explicit window frame.

**Q8. How do you retrieve the latest row per group in PostgreSQL?**

Use `ROW_NUMBER()`, `DISTINCT ON` or a suitable LATERAL subquery.

**Q9. How do you identify duplicate records?**

Use GROUP BY and HAVING COUNT(\*) > 1.

**Q10. How do you detect consecutive events within a time interval?**

Use `LAG()` or `LEAD()` to compare neighboring timestamps.

**Q11. How do you prevent inventory overselling?**

Use atomic conditional updates or appropriate row locking within a transaction.

**Q12. How do you find customers who ordered every product in a category?**

Use nested NOT EXISTS to implement relational division.

**Q13. What is the difference between COUNT(\*) and COUNT(column) after a LEFT JOIN?**

COUNT(\*) counts preserved rows, while COUNT(column) ignores NULL values.

**Q14. Why is NOT EXISTS often safer than NOT IN?**

NOT IN can produce UNKNOWN when its subquery contains NULL values.

**Q15. How do you calculate monthly revenue correctly?**

Filter the required order states, group by a timezone-aware month boundary and sum the appropriate revenue amount.

**Q16. How do you troubleshoot a complex slow query?**

Inspect its execution plan, actual row counts, buffers, joins, sorting and index usage.

**Q17. How do you handle duplicate payment webhooks?**

Use a unique event identifier and transactional idempotency handling.

**Q18. Why are sequence gaps normal?**

PostgreSQL sequences are not transactional in the same way as table row changes. Rollbacks and caching can consume values without producing committed rows.

---

## Key Takeaways

- Complex SQL combines joins, CTEs, subqueries, aggregation and window functions.
- Use NOT EXISTS for anti-join and relational division patterns.
- Use window functions for ranking, running totals and latest-row analysis.
- Use LAG and LEAD for neighboring-row comparisons.
- Pre-aggregate independent one-to-many relationships to prevent row multiplication.
- Use explicit timezone boundaries for reporting.
- Use atomic updates for concurrent business operations.
- Use transactions for multi-step operations that must succeed together.
- Distinguish business rules from assumptions in analytical queries.
- Validate query correctness before optimizing.
- Use EXPLAIN ANALYZE and BUFFERS to investigate performance.
