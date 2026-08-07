---
sidebar_label: "Real-World JOIN Problems"
sidebar_position: 1
---

# Real-World JOIN Problems

## 1. Understanding Real-World JOIN Queries

In production applications, JOINs are rarely isolated operations. They are commonly combined with:

- Multiple related tables.
- Aggregation and filtering.
- Subqueries and CTEs.
- NULL handling.
- Conditional expressions.
- Pagination and sorting.
- Existence checks.
- Data reconciliation.

The objective is to retrieve accurate business information without accidentally duplicating or excluding records.

The following problems use the TechBazaar database:

`customers`, `orders`, `order_items`, `products`, `payments`, `employees`, and `departments`.

---

## 2. Problem 1 — Display Complete Order Details

**Requirement:** Display customer name, order ID, product name, quantity, unit price and item total.

### Solution

```sql
SELECT
    c.customer_name,
    o.order_id,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price AS item_total
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
INNER JOIN order_items AS oi
    ON o.order_id = oi.order_id
INNER JOIN products AS p
    ON oi.product_id = p.product_id
ORDER BY o.order_id;
```

### Explanation

1. Customers are connected to orders.
2. Orders are connected to order_items.
3. Order items are connected to products.
4. Each result row represents an order item.

**Important:** An order containing five products generates five result rows.

---

## 3. Problem 2 — Find Customers Who Have Never Ordered

**Requirement:** Find customers who do not have any orders.

### Solution 1: LEFT JOIN

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

### Solution 2: NOT EXISTS

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

### Explanation

- LEFT JOIN preserves all customers.
- Customers without matching orders receive NULL in the order columns.
- NOT EXISTS checks whether a matching order is absent.

**Recommendation:** Use NOT EXISTS when the requirement is explicitly about the absence of related records.

---

## 4. Problem 3 — Total Orders and Spending Per Customer

**Requirement:** Display every customer with their total number of orders and total spending, including customers who have never ordered.

### Solution

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name
ORDER BY total_spent DESC;
```

### Explanation

- LEFT JOIN preserves customers without orders.
- COUNT(o.order_id) counts only actual orders.
- SUM calculates total order value.
- COALESCE converts NULL spending into zero.

### Common mistake

```sql
COUNT(*)
```

This counts the NULL-extended row for customers without orders.

Use:

```sql
COUNT(o.order_id)
```

---

## 5. Problem 4 — Find Customers Who Spent More Than ₹10,000

**Requirement:** Calculate customer spending and return customers whose total spending exceeds ₹10,000.

### Solution

```sql
SELECT
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name
HAVING SUM(o.total_amount) > 10000
ORDER BY total_spent DESC;
```

### Explanation

- JOIN connects customers with orders.
- GROUP BY calculates one aggregate result per customer.
- HAVING filters groups based on their spending.

**Why HAVING instead of WHERE?**

WHERE filters individual rows before aggregation. HAVING filters aggregated groups.

---

## 6. Problem 5 — Find Products That Have Never Been Purchased

**Requirement:** Display products that do not appear in any order_items record.

### Solution

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

### Alternative: LEFT JOIN

```sql
SELECT
    p.product_id,
    p.product_name
FROM products AS p
LEFT JOIN order_items AS oi
    ON p.product_id = oi.product_id
WHERE oi.product_id IS NULL;
```

### Explanation

Both queries find products without matching order items.

This is an anti-join problem.

---

## 7. Problem 6 — Calculate Total Quantity Sold Per Product

**Requirement:** Display every product and its total quantity sold, including products that have never been purchased.

### Solution

```sql
SELECT
    p.product_id,
    p.product_name,
    COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold
FROM products AS p
LEFT JOIN order_items AS oi
    ON p.product_id = oi.product_id
GROUP BY
    p.product_id,
    p.product_name
ORDER BY total_quantity_sold DESC;
```

### Explanation

- LEFT JOIN keeps every product.
- SUM calculates the total quantity sold.
- COALESCE converts missing sales into zero.

### Business use

This query can support:

- Product performance reports.
- Inventory planning.
- Sales dashboards.
- Identifying products with no demand.

---

## 8. Problem 7 — Find the Top 5 Best-Selling Products

**Requirement:** Find the five products with the highest total quantity sold.

### Solution

```sql
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.quantity) AS total_quantity_sold
FROM products AS p
INNER JOIN order_items AS oi
    ON p.product_id = oi.product_id
GROUP BY
    p.product_id,
    p.product_name
ORDER BY
    total_quantity_sold DESC,
    p.product_id
LIMIT 5;
```

### Explanation

- JOIN connects products with their order items.
- SUM calculates total units sold.
- GROUP BY produces one row per product.
- ORDER BY ranks products by quantity.
- LIMIT returns five rows.

The product ID provides a deterministic tie-breaker.

---

## 9. Problem 8 — Display Orders Alongside Payment Information

**Requirement:** Display every order, including orders that do not have a payment record.

### Solution

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount,
    p.payment_id,
    p.amount,
    p.payment_status
FROM orders AS o
LEFT JOIN payments AS p
    ON o.order_id = p.order_id
ORDER BY o.order_id;
```

### Explanation

LEFT JOIN ensures that orders without payments are included.

Their payment columns will contain NULL.

### Important

If an order has multiple payment records, it will appear multiple times.

Do not assume one order always produces one result row.

---

## 10. Problem 9 — Calculate Total Payments Per Order

**Requirement:** Display every order with its total received payment.

### Solution

```sql
SELECT
    o.order_id,
    o.total_amount,
    COALESCE(SUM(p.amount), 0) AS total_paid
FROM orders AS o
LEFT JOIN payments AS p
    ON o.order_id = p.order_id
GROUP BY
    o.order_id,
    o.total_amount
ORDER BY o.order_id;
```

### Explanation

- Each order can have multiple payment records.
- SUM adds all payment amounts for that order.
- LEFT JOIN preserves orders without payments.
- COALESCE returns zero when no payment exists.

**Business consideration:** This query sums every payment record. If your application stores failed, refunded or reversed transactions, you must define which payment statuses should count toward actual received payments.

For example, if only completed payments should count:

```sql
SELECT
    o.order_id,
    o.total_amount,
    COALESCE(
        SUM(p.amount) FILTER (
            WHERE p.payment_status = 'completed'
        ),
        0
    ) AS total_paid
FROM orders AS o
LEFT JOIN payments AS p
    ON o.order_id = p.order_id
GROUP BY
    o.order_id,
    o.total_amount;
```

The status value must match the values actually used by your application.

---

## 11. Problem 10 — Find Orders That Have No Payments

**Requirement:** Find orders without any associated payment records.

### Solution

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount
FROM orders AS o
WHERE NOT EXISTS (
    SELECT 1
    FROM payments AS p
    WHERE p.order_id = o.order_id
);
```

### Alternative

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.total_amount
FROM orders AS o
LEFT JOIN payments AS p
    ON o.order_id = p.order_id
WHERE p.payment_id IS NULL;
```

Both queries implement an anti-join.

---

## 12. Problem 11 — Find Employees With Their Department Names

**Requirement:** Display employees and their corresponding department names.

### Solution

```sql
SELECT
    e.employee_id,
    e.first_name,
    d.department_name
FROM employees AS e
INNER JOIN departments AS d
    ON e.department_id = d.department_id;
```

### Include employees without a department

```sql
SELECT
    e.employee_id,
    e.first_name,
    d.department_name
FROM employees AS e
LEFT JOIN departments AS d
    ON e.department_id = d.department_id;
```

### Include departments without employees

```sql
SELECT
    d.department_id,
    d.department_name,
    e.employee_id,
    e.first_name
FROM departments AS d
LEFT JOIN employees AS e
    ON d.department_id = e.department_id;
```

The preserved table determines which unmatched records remain.

---

## 13. Problem 12 — Find Departments Without Employees

**Requirement:** Display departments that have no employees.

### Solution

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

### Alternative

```sql
SELECT
    d.department_id,
    d.department_name
FROM departments AS d
LEFT JOIN employees AS e
    ON d.department_id = e.department_id
WHERE e.employee_id IS NULL;
```

### Business use

Useful for:

- Organization reports.
- Identifying unused departments.
- Administrative dashboards.
- Organizational cleanup.

---

## 14. Problem 13 — Display Employees Alongside Their Managers

**Requirement:** Display each employee and their manager's name.

### Solution

```sql
SELECT
    e.employee_id,
    e.first_name AS employee_name,
    m.first_name AS manager_name
FROM employees AS e
LEFT JOIN employees AS m
    ON e.manager_id = m.employee_id;
```

### Explanation

This is a SELF JOIN.

- `e` represents the employee.
- `m` represents the manager.
- Both aliases reference the same table.

LEFT JOIN preserves employees who do not have a manager.

---

## 15. Problem 14 — Find the Latest Order for Every Customer

**Requirement:** Display every customer with their most recent order.

### Solution using LEFT JOIN LATERAL

```sql
SELECT
    c.customer_id,
    c.customer_name,
    latest.order_id,
    latest.order_date,
    latest.total_amount
FROM customers AS c
LEFT JOIN LATERAL (
    SELECT
        order_id,
        order_date,
        total_amount
    FROM orders
    WHERE customer_id = c.customer_id
    ORDER BY order_date DESC, order_id DESC
    LIMIT 1
) AS latest ON TRUE
ORDER BY c.customer_id;
```

### Explanation

For every customer:

1. Find their orders.
2. Sort orders by date, newest first.
3. Use order ID as a tie-breaker.
4. Return the first order.
5. Preserve customers without orders.

The `order_id` tie-breaker ensures deterministic selection when timestamps are equal.

---

## 16. Problem 15 — Find Customers Who Purchased a Specific Product

**Requirement:** Find customers who purchased a product named `Laptop`.

### Solution

```sql
SELECT DISTINCT
    c.customer_id,
    c.customer_name
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
INNER JOIN order_items AS oi
    ON o.order_id = oi.order_id
INNER JOIN products AS p
    ON oi.product_id = p.product_id
WHERE p.product_name = 'Laptop';
```

### Alternative using EXISTS

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    INNER JOIN order_items AS oi
        ON o.order_id = oi.order_id
    INNER JOIN products AS p
        ON oi.product_id = p.product_id
    WHERE o.customer_id = c.customer_id
      AND p.product_name = 'Laptop'
);
```

### Why EXISTS can be better here

The requirement is to find customers, not to retrieve every matching purchase.

EXISTS avoids repeated customer rows when the customer purchased the product multiple times.

---

## 17. Problem 16 — Find Customers Who Purchased Every Product in a Category

**Requirement:** Find customers who have purchased every product belonging to a particular category.

This is a relational division problem.

Assume the `products` table contains `category_id`.

### Solution using double NOT EXISTS

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM products AS p
    WHERE p.category_id = 1
      AND NOT EXISTS (
          SELECT 1
          FROM orders AS o
          INNER JOIN order_items AS oi
              ON o.order_id = oi.order_id
          WHERE o.customer_id = c.customer_id
            AND oi.product_id = p.product_id
      )
);
```

### How it works

The outer NOT EXISTS checks that there is no product in category 1 for which the customer has no purchase.

In simpler terms:

- Find every product in the category.
- Check whether the customer purchased each product.
- Return the customer only when no required product is missing.

**Important:** If category 1 contains zero products, this query returns every customer. This follows the logic of universal quantification. If that is not the intended business rule, add a separate condition requiring the category to contain at least one product.

---

## 18. Problem 17 — Find Customers Whose Orders Are All Completed

**Requirement:** Find customers who have at least one order and whose every order is completed.

### Solution

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
)
AND NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
      AND o.status <> 'completed'
);
```

### Explanation

Two conditions are checked:

1. The customer must have at least one order.
2. No order belonging to that customer can have a status other than completed.

The first condition matters. Without it, customers with zero orders would also satisfy the second condition.

**NULL consideration:** If `status` can be NULL, `status <> 'completed'` evaluates to UNKNOWN for those rows. If NULL should count as not completed, use:

```sql
AND o.status IS DISTINCT FROM 'completed'
```

---

## 19. Problem 18 — Compare Expected and Actual Payment Data

**Requirement:** Compare expected transactions with payment records and identify missing or mismatched payments.

Assume these two tables:

- `expected_payments(transaction_reference, expected_amount)`
- `bank_payments(transaction_reference, bank_amount)`

### Solution

```sql
SELECT
    COALESCE(
        e.transaction_reference,
        b.transaction_reference
    ) AS transaction_reference,

    e.expected_amount,
    b.bank_amount,

    CASE
        WHEN e.transaction_reference IS NULL
            THEN 'Missing in expected payments'

        WHEN b.transaction_reference IS NULL
            THEN 'Missing in bank payments'

        WHEN e.expected_amount IS DISTINCT FROM b.bank_amount
            THEN 'Amount mismatch'

        ELSE 'Matched'
    END AS reconciliation_status

FROM expected_payments AS e
FULL OUTER JOIN bank_payments AS b
    ON e.transaction_reference = b.transaction_reference;
```

### Explanation

- FULL OUTER JOIN preserves records from both tables.
- COALESCE displays the available transaction reference.
- CASE classifies each result.
- IS DISTINCT FROM safely compares amounts, including NULL values.

This example assumes transaction references are unique and non-NULL in both tables.

---

## 20. Problem 19 — Calculate Monthly Revenue Per Customer

**Requirement:** Display each customer's monthly order totals.

### Solution

```sql
SELECT
    c.customer_id,
    c.customer_name,
    DATE_TRUNC('month', o.order_date) AS order_month,
    SUM(o.total_amount) AS monthly_revenue
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name,
    DATE_TRUNC('month', o.order_date)
ORDER BY
    order_month DESC,
    monthly_revenue DESC;
```

### Explanation

- JOIN connects customers and orders.
- DATE_TRUNC groups timestamps by month.
- SUM calculates monthly spending.
- GROUP BY produces one row per customer per month.

---

## 21. Problem 20 — Find the Highest-Spending Customer

**Requirement:** Find the customer with the highest total order value.

### Solution

```sql
SELECT
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name
ORDER BY
    total_spent DESC,
    c.customer_id
LIMIT 1;
```

### Alternative using a CTE

```sql
WITH customer_spending AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT
    c.customer_id,
    c.customer_name,
    cs.total_spent
FROM customer_spending AS cs
INNER JOIN customers AS c
    ON cs.customer_id = c.customer_id
ORDER BY
    cs.total_spent DESC,
    c.customer_id
LIMIT 1;
```

If you need all customers tied for the highest spending, use a ranking function or compare against the maximum aggregate rather than LIMIT 1.

---

## 22. Advanced JOIN Problem-Solving Checklist

Before writing a complex JOIN query, answer these questions:

| Question                                              | Why it matters                                               |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| What is the main entity?                              | Identifies the base table                                    |
| What relationships connect the tables?                | Determines JOIN conditions                                   |
| Is each relationship one-to-one or one-to-many?       | Predicts row multiplication                                  |
| Must unmatched records be included?                   | Determines INNER vs OUTER JOIN                               |
| Do I need columns or only existence checks?           | Helps choose JOIN vs EXISTS                                  |
| Am I aggregating after joining multiple child tables? | Prevents double-counting                                     |
| Can NULL values occur?                                | Determines correct filtering and comparison                  |
| Do I need one row per entity?                         | May require aggregation, DISTINCT or a different query shape |
| Is the result deterministic?                          | Requires appropriate ORDER BY tie-breakers                   |
| Is the query efficient?                               | Requires suitable indexes and execution-plan inspection      |

---

## 23. Common Production-Level JOIN Mistakes

| Mistake                                                          | Correct approach                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Summing parent values after joining multiple child relationships | Pre-aggregate child tables                                |
| Using INNER JOIN when unmatched records matter                   | Use the appropriate OUTER JOIN                            |
| Filtering optional-side columns in WHERE unintentionally         | Move match restrictions into ON when preserving left rows |
| Using DISTINCT to hide incorrect JOIN logic                      | Fix the relationship or aggregation                       |
| Using COUNT(\*) for child counts after LEFT JOIN                 | Count a non-NULL child primary key                        |
| Using NOT IN with nullable subqueries                            | Prefer NOT EXISTS                                         |
| Assuming one order produces one joined row                       | Understand order-item and payment cardinality             |
| Ignoring NULL in comparisons                                     | Use IS NULL, IS NOT NULL or NULL-safe operators           |
| Using SELECT \* in complex production queries                    | Select required columns explicitly                        |
| Assuming an index always improves performance                    | Verify using EXPLAIN ANALYZE                              |

---

## 24. Practical Interview Exercises

Write SQL queries for these requirements without looking at the solutions above.

1. Find the top three customers by total spending.
2. Find customers who have placed more than five orders.
3. Find customers who have never purchased any product.
4. Find products that have never been sold.
5. Find the department with the highest number of employees.
6. Display every department with its employee count, including empty departments.
7. Find employees who do not have a manager.
8. Display employees earning more than their manager, if a salary column exists.
9. Find the latest payment for every order.
10. Find orders whose total completed payments are less than the order amount.
11. Find customers who purchased products from at least three distinct categories.
12. Find customers who purchased every product in a given category.
13. Find products whose total sales quantity is greater than the average product sales quantity.
14. Find customers who have orders in every month of a specified quarter.
15. Reconcile two transaction datasets and identify missing or mismatched transactions.
16. Find the second-highest spending customer, handling ties correctly.
17. Find the top two products by quantity sold in each category.
18. Calculate monthly revenue and include months with zero revenue, assuming a calendar table is available.

---

## 25. Interview Concepts to Remember

| Concept          | Key point                                |
| ---------------- | ---------------------------------------- |
| INNER JOIN       | Only matching rows                       |
| LEFT JOIN        | Preserves left-side rows                 |
| FULL OUTER JOIN  | Preserves both sides                     |
| SELF JOIN        | Same table joined with itself            |
| CROSS JOIN       | Cartesian product                        |
| Anti-join        | Finds rows without matches               |
| Semi-join        | Finds rows with matches                  |
| LATERAL JOIN     | Per-row correlated FROM subquery         |
| Pre-aggregation  | Prevents inflated aggregate calculations |
| EXISTS           | Checks whether a matching row exists     |
| USING            | Equality join on shared column names     |
| ON               | Explicit join condition                  |
| IS DISTINCT FROM | NULL-safe comparison                     |

## Key Takeaways

- Correct JOIN logic depends on understanding table relationships and cardinality.
- One-to-many relationships naturally produce repeated parent rows.
- Multiple one-to-many JOINs can inflate aggregates.
- Pre-aggregate related tables when calculating independent totals.
- Use LEFT JOIN when unmatched left-side records must remain.
- Use EXISTS and NOT EXISTS for existence requirements.
- Use LATERAL for per-row related queries such as latest order per customer.
- Use FULL OUTER JOIN for reconciliation.
- Use GROUP BY and HAVING for aggregate business reports.
- Never use DISTINCT as a substitute for understanding why duplicate rows exist.
- Verify complex production queries with realistic data and execution plans.
