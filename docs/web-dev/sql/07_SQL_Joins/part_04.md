---
sidebar_label: "Part 7D — Advanced JOIN Scenarios"
sidebar_position: 1
---

# Part 7D — Advanced JOIN Scenarios

## 1. Joining Multiple Tables with Different Relationships

Real-world queries rarely involve only two tables. You often need to combine several related tables to retrieve complete business information.

### Example: Customer → Orders → Order Items → Products

Relationship:

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

### Query: Complete order details

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.order_date,
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

**Important:** Each order can contain multiple order items. Therefore, one order can appear multiple times in the result.

---

## 2. Joining Multiple One-to-Many Relationships

This is a common source of incorrect totals.

Suppose:

- One customer has multiple orders.
- One order has multiple payments.

Joining both relationships can multiply rows.

### Example data

**orders**

| order_id | customer_id | total_amount |
| -------: | ----------: | -----------: |
|      101 |           1 |         5000 |

**payments**

| payment_id | order_id | amount |
| ---------: | -------: | -----: |
|          1 |      101 |   2000 |
|          2 |      101 |   3000 |

### Query

```sql
SELECT
    o.order_id,
    o.total_amount,
    p.payment_id,
    p.amount
FROM orders AS o
JOIN payments AS p
    ON o.order_id = p.order_id;
```

Result:

| order_id | total_amount | payment_id | amount |
| -------: | -----------: | ---------: | -----: |
|      101 |         5000 |          1 |   2000 |
|      101 |         5000 |          2 |   3000 |

If you now calculate:

```sql
SELECT
    SUM(o.total_amount) AS total_order_amount,
    SUM(p.amount) AS total_payment_amount
FROM orders AS o
JOIN payments AS p
    ON o.order_id = p.order_id;
```

The result is:

| total_order_amount | total_payment_amount |
| -----------------: | -------------------: |
|              10000 |                 5000 |

The order amount is incorrectly doubled.

### Why?

The order row is repeated once for every matching payment.

### Correct approach: Aggregate before joining

```sql
SELECT
    o.order_id,
    o.total_amount,
    COALESCE(p.total_paid, 0) AS total_paid
FROM orders AS o
LEFT JOIN (
    SELECT
        order_id,
        SUM(amount) AS total_paid
    FROM payments
    GROUP BY order_id
) AS p
    ON o.order_id = p.order_id;
```

Now the payment subquery produces one row per order before joining.

**Rule:** When joining multiple one-to-many relationships, understand row multiplication before calculating aggregates.

---

## 3. Joining Aggregated Subqueries

You can aggregate one table first and then JOIN its results with another table.

### Example: Customer spending

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(o.total_spent, 0) AS total_spent
FROM customers AS c
LEFT JOIN (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS o
    ON c.customer_id = o.customer_id;
```

The subquery:

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

Produces one row per customer with orders.

The outer query attaches those totals to all customers.

### When useful

- Customer spending reports.
- Product sales reports.
- Department employee counts.
- Monthly revenue reports.
- Payment summaries.

---

## 4. Joining with CTEs

Common Table Expressions (CTEs) allow you to organize complex JOIN queries into readable steps.

### Example: Total spending per customer

```sql
WITH customer_orders AS (
    SELECT
        customer_id,
        COUNT(*) AS total_orders,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(co.total_orders, 0) AS total_orders,
    COALESCE(co.total_spent, 0) AS total_spent
FROM customers AS c
LEFT JOIN customer_orders AS co
    ON c.customer_id = co.customer_id;
```

### Execution conceptually

1. Calculate order statistics in the CTE.
2. JOIN the result with customers.
3. Replace missing aggregate values with zero.

**Note:** A CTE is a query-organization feature, not automatically a performance optimization. PostgreSQL can inline many CTEs.

---

## 5. Joining the Same Table Multiple Times

Sometimes a table contains multiple foreign keys referencing the same parent table.

### Example: Employees with manager and mentor

Suppose `employees` has these columns:

- `employee_id`
- `first_name`
- `manager_id`
- `mentor_id`

Both `manager_id` and `mentor_id` reference `employees.employee_id`.

### Query

```sql
SELECT
    e.employee_id,
    e.first_name AS employee_name,
    m.first_name AS manager_name,
    mentor.first_name AS mentor_name
FROM employees AS e
LEFT JOIN employees AS m
    ON e.manager_id = m.employee_id
LEFT JOIN employees AS mentor
    ON e.mentor_id = mentor.employee_id;
```

### Why multiple aliases?

Each reference represents a different role:

| Alias  | Meaning  |
| ------ | -------- |
| e      | Employee |
| m      | Manager  |
| mentor | Mentor   |

**Important:** `manager_id` and `mentor_id` are proposed schema extensions for this example. They are not assumed to exist in the original TechBazaar schema.

---

## 6. Joining Tables Without a Direct Relationship

Sometimes two tables do not have a direct foreign-key relationship, but they can be connected through another table.

### Example: Customers and products purchased

Customers and products do not necessarily have a direct relationship.

The relationship is established through:

```text
customers
    |
  orders
    |
 order_items
    |
 products
```

### Query

```sql
SELECT DISTINCT
    c.customer_id,
    c.customer_name,
    p.product_id,
    p.product_name
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id
JOIN order_items AS oi
    ON o.order_id = oi.order_id
JOIN products AS p
    ON oi.product_id = p.product_id;
```

This returns customers and the products they have purchased.

`DISTINCT` is used here to remove repeated customer-product combinations if the same product was purchased in multiple orders.

---

## 7. JOIN with Date Conditions

JOIN conditions can include date comparisons.

### Example: Match payments with orders created on the same date

```sql
SELECT
    o.order_id,
    o.order_date,
    p.payment_id,
    p.payment_date
FROM orders AS o
JOIN payments AS p
    ON o.order_id = p.order_id
   AND o.order_date::date = p.payment_date::date;
```

This example uses `::date` to compare calendar dates.

### Important performance consideration

Applying a function or cast to a column in a JOIN condition can make ordinary indexes less useful.

If both columns are timestamps and you need a date-range match, consider expressing the comparison as a range:

```sql
SELECT
    o.order_id,
    p.payment_id
FROM orders AS o
JOIN payments AS p
    ON p.order_id = o.order_id
   AND p.payment_date >= date_trunc('day', o.order_date)
   AND p.payment_date < date_trunc('day', o.order_date)
                              + INTERVAL '1 day';
```

This avoids casting the payment timestamp to DATE, although the exact best plan depends on indexes and data distribution.

---

## 8. LATERAL JOIN

`LATERAL` allows a subquery in the FROM clause to reference columns from preceding FROM items.

This is useful when you need a separate query for each row of another table.

### Example: Get the latest order for every customer

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
        o.order_id,
        o.order_date,
        o.total_amount
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
    ORDER BY o.order_date DESC, o.order_id DESC
    LIMIT 1
) AS latest ON TRUE;
```

### How it works

For each customer:

1. PostgreSQL evaluates the LATERAL subquery using that customer's ID.
2. It sorts their orders from newest to oldest.
3. It selects one order.
4. LEFT JOIN preserves customers without orders.

### Why ON TRUE?

The matching condition is already inside the LATERAL subquery:

```sql
WHERE o.customer_id = c.customer_id
```

`ON TRUE` means there is no additional join filter.

### CROSS JOIN LATERAL

Use CROSS JOIN LATERAL when you only want outer rows that produce a result from the lateral subquery.

```sql
SELECT
    c.customer_name,
    latest.order_id
FROM customers AS c
CROSS JOIN LATERAL (
    SELECT
        o.order_id
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
    ORDER BY o.order_date DESC, o.order_id DESC
    LIMIT 1
) AS latest;
```

Customers without orders are excluded.

### Common use cases

- Latest order per customer.
- Top N products per category.
- Most recent payment per order.
- Per-row calculations using related records.

---

## 9. Top N Records Per Group Using JOIN LATERAL

Suppose you need the latest three orders for every customer.

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers AS c
LEFT JOIN LATERAL (
    SELECT
        order_id,
        order_date,
        total_amount
    FROM orders
    WHERE customer_id = c.customer_id
    ORDER BY order_date DESC, order_id DESC
    LIMIT 3
) AS o ON TRUE
ORDER BY c.customer_id, o.order_date DESC;
```

This returns up to three orders per customer.

**Alternative:** Window functions such as `ROW_NUMBER()` can also solve top-N-per-group problems. They are covered in Part 11.

---

## 10. FULL OUTER JOIN for Data Reconciliation

FULL OUTER JOIN is useful when comparing two datasets and identifying missing records on either side.

### Example

Suppose you have:

- `expected_payments`: payments expected by your system.
- `bank_payments`: payments reported by the bank.

Both tables contain `transaction_reference`.

```sql
SELECT
    COALESCE(e.transaction_reference,
             b.transaction_reference) AS transaction_reference,
    e.expected_amount,
    b.bank_amount,
    CASE
        WHEN e.transaction_reference IS NULL
            THEN 'Missing in expected payments'
        WHEN b.transaction_reference IS NULL
            THEN 'Missing in bank payments'
        WHEN e.expected_amount <> b.bank_amount
            THEN 'Amount mismatch'
        ELSE 'Matched'
    END AS reconciliation_status
FROM expected_payments AS e
FULL OUTER JOIN bank_payments AS b
    ON e.transaction_reference = b.transaction_reference;
```

### Possible results

| Transaction | Expected | Bank | Status                       |
| ----------- | -------: | ---: | ---------------------------- |
| TXN101      |     5000 | 5000 | Matched                      |
| TXN102      |     2000 | 1800 | Amount mismatch              |
| TXN103      |     1000 | NULL | Missing in bank payments     |
| TXN104      |     NULL | 3000 | Missing in expected payments |

**Important:** This example assumes transaction references are unique in both tables. If either table contains duplicates, the JOIN can produce multiple combinations. Also, if amounts can be NULL, use explicit NULL-safe comparisons such as `IS DISTINCT FROM`.

---

## 11. JOIN with Conditional Aggregation

You can combine JOINs with CASE and aggregate functions.

### Example: Count completed and pending orders per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    COUNT(o.order_id) FILTER (
        WHERE o.status = 'completed'
    ) AS completed_orders,
    COUNT(o.order_id) FILTER (
        WHERE o.status = 'pending'
    ) AS pending_orders
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

PostgreSQL's `FILTER` clause applies a condition to an individual aggregate.

Equivalent CASE approach:

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    COUNT(
        CASE WHEN o.status = 'completed'
             THEN o.order_id
        END
    ) AS completed_orders
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

Both approaches are valid.

---

## 12. JOIN with EXISTS and NOT EXISTS

Sometimes joining tables is unnecessary when you only need to check whether related records exist.

### Find customers who have at least one order

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

### Find customers who have no orders

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

### Why use EXISTS?

- It avoids returning repeated customer rows.
- It expresses an existence requirement clearly.
- PostgreSQL can use semi-join or anti-join execution strategies.

Do not assume EXISTS is always faster than JOIN. Performance depends on the query, indexes, statistics and data distribution.

---

## 13. Common Advanced JOIN Performance Considerations

### 13.1 Index join columns

Frequently used join columns may benefit from indexes.

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);

CREATE INDEX idx_order_items_order_id
ON order_items(order_id);
```

PostgreSQL automatically indexes primary keys and unique constraints, but it does not automatically index referencing foreign-key columns.

### 13.2 Avoid SELECT \*

Instead of:

```sql
SELECT *
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

Prefer:

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

This makes the output explicit and avoids unnecessary columns.

### 13.3 Understand row multiplication

Before calculating SUM or COUNT, identify whether the JOIN creates repeated rows.

### 13.4 Inspect query plans

```sql
EXPLAIN ANALYZE
SELECT
    c.customer_name,
    o.order_id
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

PostgreSQL may choose:

- Nested Loop Join
- Hash Join
- Merge Join

The planner chooses based on estimated cost, available indexes, statistics and other factors.

Detailed execution-plan analysis belongs to Part 13.

---

## 14. Practice Exercises

Use the TechBazaar database.

1. Display customer names, order IDs, product names and quantities by joining four tables.
2. Calculate total spending for every customer without double-counting orders.
3. Calculate total payments per order, including orders without payments.
4. Find customers who purchased at least one product.
5. Find customers who have never purchased a product.
6. Display each employee with their manager's name.
7. Use a proposed `mentor_id` column to display employee and mentor names.
8. Find the latest order for every customer using LEFT JOIN LATERAL.
9. Find the latest three orders for every customer using LATERAL.
10. Reconcile expected payments against bank payments using FULL OUTER JOIN.
11. Count completed and pending orders for each customer.
12. Join products with order_items and calculate total quantity sold per product.
13. Explain how joining orders and payments can inflate an order-level SUM.
14. Rewrite a JOIN-based existence query using EXISTS.
15. Compare a correlated LATERAL query with a window-function solution for top-N-per-group.

---

## 15. Interview Questions

**Q1. What is row multiplication in JOINs?**

When one row matches multiple rows in another table, the original row appears multiple times in the joined result.

**Q2. Why can joining two one-to-many relationships produce incorrect SUM results?**

Because each row from one relationship can be repeated for every matching row in the other relationship. Aggregate before joining when necessary.

**Q3. How can you avoid double-counting when joining multiple child tables?**

Aggregate each child relationship to the required level first, then JOIN the aggregated results.

**Q4. What is a LATERAL JOIN?**

It allows a FROM-clause subquery to reference columns from preceding FROM items.

**Q5. What is the difference between CROSS JOIN LATERAL and LEFT JOIN LATERAL?**

CROSS JOIN LATERAL excludes outer rows that produce no subquery result. LEFT JOIN LATERAL preserves them with NULL values.

**Q6. What does ON TRUE mean in LEFT JOIN LATERAL?**

It adds no extra join restriction because the lateral subquery already contains its filtering conditions.

**Q7. How do you retrieve the latest order for every customer?**

Use LEFT JOIN LATERAL with ORDER BY and LIMIT 1, or use a window function such as ROW_NUMBER().

**Q8. How do you compare two datasets and identify missing records on either side?**

Use FULL OUTER JOIN and check which side has NULL values.

**Q9. Does PostgreSQL always execute joins in the order written?**

No. The planner can reorder many joins when doing so preserves query semantics. Outer joins impose additional restrictions.

**Q10. Does adding an index always make a JOIN faster?**

No. Index usefulness depends on selectivity, table size, query shape, statistics and the chosen execution plan.

**Q11. What is the difference between joining a subquery and joining a CTE?**

Both can provide derived result sets to a JOIN. CTEs primarily provide a named, reusable query structure.

**Q12. When should you use EXISTS instead of JOIN?**

When you only need to check whether a matching row exists and do not need columns from the related table.

---

## Key Takeaways

- Multiple JOINs let you combine data across complex relationships.
- One-to-many relationships can multiply rows.
- Joining multiple one-to-many tables can inflate aggregate results.
- Pre-aggregate child tables before joining when necessary.
- CTEs and derived tables help organize complex JOINs.
- SELF JOIN can connect multiple roles within the same table.
- LATERAL JOIN supports per-row subqueries.
- FULL OUTER JOIN is useful for reconciliation.
- EXISTS and NOT EXISTS are useful for existence checks.
- Indexes on frequently joined foreign-key columns can improve performance.
- Always inspect row cardinality and aggregate correctness before optimizing query execution.
