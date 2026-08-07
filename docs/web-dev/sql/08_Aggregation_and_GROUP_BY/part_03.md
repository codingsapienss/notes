---
sidebar_label: "HAVING vs WHERE"
sidebar_position: 1
---

# HAVING vs WHERE

## 1. Understanding WHERE and HAVING

Both `WHERE` and `HAVING` are used to filter data, but they operate at different stages of query processing.

- **WHERE:** Filters individual rows before grouping and aggregation.
- **HAVING:** Filters groups after GROUP BY and aggregate calculations.

### Example: Orders table

| order_id | customer_id | total_amount |
| -------: | ----------: | -----------: |
|      101 |           1 |         2000 |
|      102 |           1 |         3000 |
|      103 |           2 |         1500 |
|      104 |           2 |         2500 |
|      105 |           3 |         5000 |

### Using WHERE

Find orders greater than ₹2,000.

```sql
SELECT *
FROM orders
WHERE total_amount > 2000;
```

Result:

| order_id | customer_id | total_amount |
| -------: | ----------: | -----------: |
|      102 |           1 |         3000 |
|      104 |           2 |         2500 |
|      105 |           3 |         5000 |

WHERE filters individual rows.

### Using HAVING

Find customers whose total spending exceeds ₹4,000.

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total_amount) > 4000;
```

Result:

| customer_id | total_spent |
| ----------: | ----------: |
|           1 |        5000 |
|           2 |        4000 |
|           3 |        5000 |

Correction to the example condition: customer 2 totals exactly ₹4,000, so it does not satisfy `> 4000`. The actual result is:

| customer_id | total_spent |
| ----------: | ----------: |
|           1 |        5000 |
|           3 |        5000 |

HAVING filters aggregated groups.

---

## 2. WHERE vs HAVING — Core Differences

| Feature                | WHERE                                                  | HAVING                            |
| ---------------------- | ------------------------------------------------------ | --------------------------------- |
| Purpose                | Filter individual rows                                 | Filter groups                     |
| Processing stage       | Before GROUP BY                                        | After GROUP BY                    |
| Aggregate functions    | Cannot directly use aggregates at the same query level | Can use aggregates                |
| Works without GROUP BY | Yes                                                    | Yes, on the single implicit group |
| Typical conditions     | `status = 'completed'`                                 | `SUM(amount) > 10000`             |
| Reduces input rows     | Yes                                                    | Filters completed groups          |

### Example comparison

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

Execution:

1. WHERE keeps completed orders.
2. GROUP BY groups the remaining orders by customer.
3. SUM calculates spending per customer.
4. HAVING keeps customers whose completed-order spending exceeds ₹10,000.

---

## 3. Using WHERE and HAVING Together

You can use both clauses in the same query.

### Example: Customers with more than three completed orders

```sql
SELECT
    customer_id,
    COUNT(*) AS completed_orders,
    SUM(total_amount) AS total_spent
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING COUNT(*) > 3;
```

### Explanation

- WHERE removes non-completed orders.
- GROUP BY groups completed orders by customer.
- COUNT calculates the number of completed orders.
- HAVING retains customers with more than three completed orders.

### Another example: Customers spending more than ₹20,000 on orders above ₹1,000

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent
FROM orders
WHERE total_amount > 1000
GROUP BY customer_id
HAVING SUM(total_amount) > 20000;
```

Only orders above ₹1,000 participate in the total.

---

## 4. Why Aggregate Functions Cannot Be Used Directly in WHERE

Consider:

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
WHERE SUM(total_amount) > 10000
GROUP BY customer_id;
```

This is invalid in PostgreSQL.

**Reason:** WHERE is evaluated before grouping and aggregation. The aggregate result does not exist at that stage.

### Correct query

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

### Alternative using a subquery

```sql
SELECT *
FROM (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS customer_summary
WHERE total_spent > 10000;
```

The outer WHERE filters rows produced by the subquery, where the aggregate result is already available.

---

## 5. HAVING Without GROUP BY

HAVING can be used without an explicit GROUP BY.

In this situation, PostgreSQL treats the filtered input as one implicit group.

### Example

```sql
SELECT
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue
FROM orders
HAVING SUM(total_amount) > 100000;
```

This returns:

- One aggregate row if total revenue exceeds ₹1,00,000.
- Zero rows if the condition is not satisfied.

### Another example

```sql
SELECT
    COUNT(*) AS total_customers
FROM customers
HAVING COUNT(*) > 100;
```

The query returns the count only if there are more than 100 customers.

**Important:** Without GROUP BY, HAVING filters the single aggregate result, not individual source rows.

---

## 6. HAVING with Multiple Conditions

HAVING supports AND, OR and other SQL conditions.

### Example: Customers with more than three orders and spending above ₹10,000

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING
    COUNT(*) > 3
    AND SUM(total_amount) > 10000;
```

Both conditions must be satisfied.

### Using OR

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING
    COUNT(*) > 5
    OR SUM(total_amount) > 50000;
```

A customer is returned if either condition is satisfied.

---

## 7. HAVING with COUNT(DISTINCT)

You can filter groups based on unique values.

### Example: Customers who purchased at least three different products

```sql
SELECT
    o.customer_id,
    COUNT(DISTINCT oi.product_id) AS unique_products
FROM orders AS o
INNER JOIN order_items AS oi
    ON o.order_id = oi.order_id
GROUP BY o.customer_id
HAVING COUNT(DISTINCT oi.product_id) >= 3;
```

### Explanation

- JOIN connects orders with their items.
- GROUP BY creates customer groups.
- COUNT(DISTINCT) counts unique products per customer.
- HAVING filters customers with at least three unique products.

This is different from counting order items because the same product can appear in multiple orders.

---

## 8. HAVING with JOIN

HAVING is commonly used with JOIN and GROUP BY.

### Example: Departments with more than five employees

```sql
SELECT
    d.department_id,
    d.department_name,
    COUNT(e.employee_id) AS total_employees
FROM departments AS d
LEFT JOIN employees AS e
    ON d.department_id = e.department_id
GROUP BY
    d.department_id,
    d.department_name
HAVING COUNT(e.employee_id) > 5;
```

### Example: Products with total sales above 100 units

```sql
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.quantity) AS total_sold
FROM products AS p
INNER JOIN order_items AS oi
    ON p.product_id = oi.product_id
GROUP BY
    p.product_id,
    p.product_name
HAVING SUM(oi.quantity) > 100;
```

---

## 9. Filtering Groups Using WHERE vs HAVING

Consider this requirement:

**Find customers whose completed orders total more than ₹10,000.**

### Correct approach

```sql
SELECT
    customer_id,
    SUM(total_amount) AS completed_revenue
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

Now consider a different requirement:

**Find customers whose total spending exceeds ₹10,000, but only count orders above ₹1,000.**

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
WHERE total_amount > 1000
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

These are different business rules.

- WHERE decides which orders contribute to the total.
- HAVING decides which customer groups qualify.

Moving a condition between these clauses can change the result.

---

## 10. HAVING with CASE

You can use conditional aggregate calculations inside HAVING.

### Example: Customers with at least three completed orders

```sql
SELECT
    customer_id,
    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders
FROM orders
GROUP BY customer_id
HAVING COUNT(*) FILTER (
    WHERE status = 'completed'
) >= 3;
```

### Alternative using CASE

```sql
SELECT
    customer_id,
    SUM(
        CASE
            WHEN status = 'completed' THEN 1
            ELSE 0
        END
    ) AS completed_orders
FROM orders
GROUP BY customer_id
HAVING SUM(
    CASE
        WHEN status = 'completed' THEN 1
        ELSE 0
    END
) >= 3;
```

Both approaches are valid PostgreSQL.

---

## 11. Common Mistakes

| Mistake                                                               | Correct approach                                                  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Using SUM() directly in WHERE                                         | Use HAVING or a subquery                                          |
| Using HAVING for ordinary row filtering                               | Use WHERE when the condition is row-level                         |
| Filtering rows after aggregation unintentionally                      | Place the condition in WHERE if it should affect aggregate inputs |
| Assuming HAVING requires GROUP BY                                     | HAVING can filter one implicit group                              |
| Confusing COUNT(\*) with COUNT(column)                                | COUNT(column) ignores NULL                                        |
| Moving conditions between WHERE and HAVING without checking semantics | They operate on different levels                                  |
| Using an aggregate alias in HAVING                                    | Prefer writing the aggregate expression explicitly in PostgreSQL  |
| Forgetting that WHERE changes aggregate values                        | Only rows passing WHERE contribute to aggregates                  |

### PostgreSQL alias consideration

This is valid:

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
ORDER BY total_spent DESC;
```

But do not assume the SELECT alias is available in HAVING:

```sql
-- Avoid relying on this
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING total_spent > 10000;
```

Use the aggregate expression:

```sql
HAVING SUM(total_amount) > 10000;
```

---

## 12. Practice Exercises

Use the TechBazaar database.

1. Find customers with more than five orders using HAVING.
2. Find customers whose total spending exceeds ₹20,000.
3. Find customers with at least three completed orders.
4. Calculate completed revenue per customer and retain customers above ₹10,000.
5. Find products with total quantity sold greater than 50.
6. Find departments with more than five employees.
7. Find categories with an average product price above ₹2,000.
8. Find customers who purchased at least four distinct products.
9. Find customers whose average order value exceeds ₹5,000.
10. Find order statuses with more than 100 orders.
11. Find customers who have more than two orders above ₹1,000.
12. Find customers whose completed-order revenue exceeds ₹15,000.
13. Write a query using WHERE and HAVING together.
14. Rewrite a HAVING query using a derived table and WHERE.
15. Write a HAVING query without GROUP BY.
16. Explain why an aggregate cannot be used directly in WHERE.
17. Explain how filtering orders in WHERE changes the result of SUM.
18. Find products whose total sales quantity exceeds the average sales quantity across all products.

---

## 13. Interview Questions

**Q1. What is the difference between WHERE and HAVING?**

WHERE filters individual rows before aggregation. HAVING filters groups after aggregation.

**Q2. Can we use aggregate functions in WHERE?**

Not at the same query level. Use HAVING or a subquery.

**Q3. Can HAVING be used without GROUP BY?**

Yes. PostgreSQL treats the input as one implicit group.

**Q4. Can WHERE and HAVING be used together?**

Yes. WHERE filters source rows, while HAVING filters the resulting groups.

**Q5. Can HAVING use COUNT(DISTINCT column)?**

Yes. It can filter groups based on the number of unique non-NULL values.

**Q6. Does HAVING always require an aggregate function?**

No. It can also filter grouped columns or expressions, although WHERE is generally clearer for ordinary row-level conditions.

**Q7. Which is generally more efficient: WHERE or HAVING?**

If a condition is genuinely row-level, WHERE is generally preferable because it can reduce rows before aggregation. The actual execution plan depends on the query and optimizer.

**Q8. Can we use a SELECT alias in HAVING in PostgreSQL?**

Do not rely on SELECT aliases in HAVING. Write the aggregate expression explicitly or use a subquery.

**Q9. What happens if HAVING filters out every group?**

The query returns zero rows.

**Q10. What is the difference between WHERE with an aggregate subquery and HAVING?**

HAVING filters groups at the current query level. An outer WHERE can filter rows produced by a subquery after aggregation.

---

## Key Takeaways

- WHERE filters individual rows before grouping.
- HAVING filters groups after aggregation.
- Aggregate functions cannot be used directly in WHERE at the same query level.
- WHERE and HAVING can be used together.
- HAVING supports COUNT, SUM, AVG, MIN, MAX and conditional aggregates.
- HAVING can be used without GROUP BY.
- Filtering rows in WHERE changes which records contribute to aggregate calculations.
- Use WHERE for row-level conditions and HAVING for group-level conditions.
- For aggregate filtering through an outer query, a subquery or CTE is an alternative to HAVING.
