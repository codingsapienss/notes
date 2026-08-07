---
sidebar_label: "GROUP BY"
sidebar_position: 1
---

# GROUP BY

## 1. What is GROUP BY?

`GROUP BY` is used to group rows that have the same values in specified columns.

It is commonly used with aggregate functions such as:

- COUNT()
- SUM()
- AVG()
- MIN()
- MAX()
- STRING_AGG()

Instead of calculating one result for the entire table, GROUP BY calculates separate results for each group.

### Example: Orders table

| order_id | customer_id | total_amount |
| -------: | ----------: | -----------: |
|      101 |           1 |         2000 |
|      102 |           2 |         3000 |
|      103 |           1 |         1500 |
|      104 |           3 |         4000 |
|      105 |           2 |         2500 |

Without GROUP BY:

```sql
SELECT
    SUM(total_amount) AS total_revenue
FROM orders;
```

Result:

| total_revenue |
| ------------: |
|         13000 |

With GROUP BY:

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

Result:

| customer_id | total_spent |
| ----------: | ----------: |
|           1 |        3500 |
|           2 |        5500 |
|           3 |        4000 |

Each customer gets a separate aggregate result.

---

## 2. GROUP BY Syntax

```sql
SELECT
    column1,
    AGGREGATE_FUNCTION(column2)
FROM table_name
WHERE condition
GROUP BY column1;
```

### Execution concept

A simplified logical processing order is:

1. FROM and JOIN
2. WHERE
3. GROUP BY
4. Aggregate calculations
5. HAVING
6. SELECT
7. ORDER BY
8. LIMIT

This explains why WHERE filters individual rows before grouping, while HAVING filters groups after aggregation.

---

## 3. GROUP BY with COUNT()

### Example: Count orders per customer

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders
FROM orders
GROUP BY customer_id;
```

Result:

| customer_id | total_orders |
| ----------: | -----------: |
|           1 |            2 |
|           2 |            2 |
|           3 |            1 |

### Count employees per department

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees
FROM employees
GROUP BY department_id;
```

### Count unique customers per city

```sql
SELECT
    city,
    COUNT(DISTINCT customer_id) AS total_customers
FROM customers
GROUP BY city;
```

**Important:** NULL values in a GROUP BY column form their own group.

Example:

| city  | total_customers |
| ----- | --------------: |
| Delhi |              10 |
| Noida |               8 |
| NULL  |               3 |

---

## 4. GROUP BY with SUM()

SUM calculates the total for each group.

### Example: Total spending per customer

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

### Example: Total quantity sold per product

```sql
SELECT
    product_id,
    SUM(quantity) AS total_quantity_sold
FROM order_items
GROUP BY product_id;
```

### Example: Total revenue by order status

```sql
SELECT
    status,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY status;
```

Possible result:

| status    | total_revenue |
| --------- | ------------: |
| completed |         50000 |
| pending   |         12000 |
| cancelled |          5000 |

---

## 5. GROUP BY with AVG(), MIN() and MAX()

You can use different aggregate functions for the same grouping.

### Example: Product price statistics by category

```sql
SELECT
    category_id,
    COUNT(*) AS total_products,
    ROUND(AVG(price), 2) AS average_price,
    MIN(price) AS cheapest_price,
    MAX(price) AS highest_price
FROM products
GROUP BY category_id;
```

### Result structure

| category_id | total_products | average_price | cheapest_price | highest_price |
| ----------: | -------------: | ------------: | -------------: | ------------: |
|           1 |             10 |       1500.00 |            500 |          3000 |
|           2 |              8 |       2500.00 |           1000 |          5000 |

Each category gets its own statistics.

---

## 6. GROUP BY Multiple Columns

You can group by more than one column.

### Example: Revenue by customer and status

```sql
SELECT
    customer_id,
    status,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY
    customer_id,
    status;
```

Suppose the data is:

| order_id | customer_id | status    | total_amount |
| -------: | ----------: | --------- | -----------: |
|      101 |           1 | completed |         2000 |
|      102 |           1 | pending   |         1000 |
|      103 |           1 | completed |         1500 |
|      104 |           2 | completed |         3000 |
|      105 |           2 | pending   |          500 |

Result:

| customer_id | status    | total_revenue |
| ----------: | --------- | ------------: |
|           1 | completed |          3500 |
|           1 | pending   |          1000 |
|           2 | completed |          3000 |
|           2 | pending   |           500 |

### How does it work?

PostgreSQL groups rows using the combination of both columns.

The groups are:

- Customer 1 + completed
- Customer 1 + pending
- Customer 2 + completed
- Customer 2 + pending

**Important:** Grouping by two columns does not create separate groups independently for each column. It creates groups for each distinct combination.

---

## 7. GROUP BY with Multiple Aggregate Functions

You can calculate several metrics for each group.

### Example: Customer order statistics

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent,
    ROUND(AVG(total_amount), 2) AS average_order_value,
    MIN(total_amount) AS smallest_order,
    MAX(total_amount) AS largest_order
FROM orders
GROUP BY customer_id;
```

This is a common reporting query.

### Business application

A customer dashboard can display:

| Metric              | Calculation       |
| ------------------- | ----------------- |
| Total orders        | COUNT(\*)         |
| Total spending      | SUM(total_amount) |
| Average order value | AVG(total_amount) |
| Smallest order      | MIN(total_amount) |
| Largest order       | MAX(total_amount) |

---

## 8. GROUP BY with WHERE

WHERE filters individual records before grouping.

### Example: Calculate completed revenue per customer

```sql
SELECT
    customer_id,
    SUM(total_amount) AS completed_revenue
FROM orders
WHERE status = 'completed'
GROUP BY customer_id;
```

### Execution

1. Read orders.
2. Keep only completed orders.
3. Group the remaining rows by customer.
4. Calculate SUM for each customer.

### Another example: Orders above ₹1,000

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent
FROM orders
WHERE total_amount > 1000
GROUP BY customer_id;
```

Only orders above ₹1,000 participate in the aggregation.

---

## 9. GROUP BY with HAVING

HAVING filters groups after aggregation.

### Example: Customers with more than three orders

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 3;
```

### Example: Customers spending more than ₹10,000

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

### WHERE vs HAVING

| WHERE                                                           | HAVING                             |
| --------------------------------------------------------------- | ---------------------------------- |
| Filters individual rows                                         | Filters grouped results            |
| Applied before GROUP BY                                         | Applied after GROUP BY             |
| Usually uses row-level conditions                               | Commonly uses aggregate conditions |
| Cannot directly use aggregate functions at the same query level | Can use aggregate functions        |

Detailed comparison and advanced filtering are covered in Part 8C.

---

## 10. GROUP BY with JOIN

GROUP BY is frequently used after JOIN operations.

### Example: Number of employees in each department

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
ORDER BY total_employees DESC;
```

### Why LEFT JOIN?

It preserves departments without employees.

### Why COUNT(e.employee_id)?

For an empty department, the LEFT JOIN produces a row with NULL employee columns.

- COUNT(\*) would return 1.
- COUNT(e.employee_id) returns 0.

### Example: Total revenue per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

---

## 11. GROUP BY with Date and Time Functions

Grouping by date components is common in analytics.

### A. Revenue per day

```sql
SELECT
    DATE_TRUNC('day', order_date) AS order_day,
    SUM(total_amount) AS daily_revenue
FROM orders
GROUP BY DATE_TRUNC('day', order_date)
ORDER BY order_day;
```

### B. Revenue per month

```sql
SELECT
    DATE_TRUNC('month', order_date) AS order_month,
    SUM(total_amount) AS monthly_revenue
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY order_month;
```

### C. Revenue per year

```sql
SELECT
    EXTRACT(YEAR FROM order_date) AS order_year,
    SUM(total_amount) AS yearly_revenue
FROM orders
GROUP BY EXTRACT(YEAR FROM order_date)
ORDER BY order_year;
```

### D. Orders per day

```sql
SELECT
    order_date::date AS order_day,
    COUNT(*) AS total_orders
FROM orders
GROUP BY order_date::date
ORDER BY order_day;
```

**Important:** Grouping by a timestamp groups by its full value. If you want daily or monthly groups, normalize the timestamp using DATE_TRUNC or cast it to DATE as appropriate.

---

## 12. GROUP BY with CASE

CASE can classify rows before aggregation.

### Example: Categorize orders by amount

```sql
SELECT
    CASE
        WHEN total_amount < 1000 THEN 'Low Value'
        WHEN total_amount < 5000 THEN 'Medium Value'
        ELSE 'High Value'
    END AS order_category,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY
    CASE
        WHEN total_amount < 1000 THEN 'Low Value'
        WHEN total_amount < 5000 THEN 'Medium Value'
        ELSE 'High Value'
    END;
```

### Explanation

Every order is classified into one category:

- Low Value: below ₹1,000.
- Medium Value: ₹1,000 to below ₹5,000.
- High Value: ₹5,000 or more.

Then GROUP BY combines orders belonging to the same category.

**Tip:** In PostgreSQL, you can also group by the SELECT expression's ordinal position:

```sql
GROUP BY 1;
```

However, explicit expressions are generally easier to maintain in complex queries.

---

## 13. GROUP BY and NULL Values

GROUP BY treats NULL values as belonging to the same group.

### Example

Suppose employees contain:

| employee_id | department_id |
| ----------: | ------------: |
|           1 |            10 |
|           2 |            10 |
|           3 |            20 |
|           4 |          NULL |
|           5 |          NULL |

Query:

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees
FROM employees
GROUP BY department_id;
```

Result:

| department_id | total_employees |
| ------------: | --------------: |
|            10 |               2 |
|            20 |               1 |
|          NULL |               2 |

Both employees with NULL department IDs belong to the same group.

**Important:** NULL values are not equal under ordinary SQL equality comparison, but GROUP BY groups NULL values together.

---

## 14. GROUP BY with DISTINCT

DISTINCT and GROUP BY can sometimes produce similar results, but their purposes differ.

### DISTINCT

Returns unique combinations of selected columns.

```sql
SELECT DISTINCT city
FROM customers;
```

### GROUP BY

Groups rows and supports aggregate calculations.

```sql
SELECT
    city,
    COUNT(*) AS total_customers
FROM customers
GROUP BY city;
```

### Comparison

| DISTINCT                                           | GROUP BY                        |
| -------------------------------------------------- | ------------------------------- |
| Removes duplicate result rows                      | Creates groups                  |
| Commonly used for unique values                    | Commonly used with aggregates   |
| Does not calculate aggregates by itself            | Supports aggregate calculations |
| Can return unique combinations of multiple columns | Can group by multiple columns   |

For unique values alone, DISTINCT is usually clearer.

---

## 15. GROUP BY with STRING_AGG and ARRAY_AGG

You can collect multiple values within each group.

### Example: Employee names per department

```sql
SELECT
    department_id,
    STRING_AGG(
        first_name,
        ', ' ORDER BY first_name
    ) AS employee_names
FROM employees
GROUP BY department_id;
```

### Example: Product IDs per category

```sql
SELECT
    category_id,
    ARRAY_AGG(product_id ORDER BY product_id) AS product_ids
FROM products
GROUP BY category_id;
```

### Example: Orders per customer as JSONB

```sql
SELECT
    customer_id,
    JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'order_id', order_id,
            'amount', total_amount
        )
        ORDER BY order_date DESC
    ) AS orders
FROM orders
GROUP BY customer_id;
```

These are useful for API responses and reporting.

---

## 16. GROUP BY with Multiple Tables — Avoiding Double Counting

This is an important production-level issue.

Suppose:

- One order has three order items.
- The same order has two payment records.

Joining both child tables produces:

\[
3 \times 2 = 6 \text{ rows}
\]

If you aggregate after this JOIN, quantities and payment amounts can be multiplied.

### Incorrect approach

```sql
SELECT
    o.order_id,
    SUM(oi.quantity) AS total_quantity,
    SUM(p.amount) AS total_paid
FROM orders AS o
LEFT JOIN order_items AS oi
    ON o.order_id = oi.order_id
LEFT JOIN payments AS p
    ON o.order_id = p.order_id
GROUP BY o.order_id;
```

The totals can be incorrect because each order item is repeated for every matching payment.

### Correct approach: Pre-aggregate

```sql
WITH item_totals AS (
    SELECT
        order_id,
        SUM(quantity) AS total_quantity
    FROM order_items
    GROUP BY order_id
),
payment_totals AS (
    SELECT
        order_id,
        SUM(amount) AS total_paid
    FROM payments
    GROUP BY order_id
)
SELECT
    o.order_id,
    COALESCE(i.total_quantity, 0) AS total_quantity,
    COALESCE(p.total_paid, 0) AS total_paid
FROM orders AS o
LEFT JOIN item_totals AS i
    ON o.order_id = i.order_id
LEFT JOIN payment_totals AS p
    ON o.order_id = p.order_id;
```

Now each subquery returns at most one row per order.

**Rule:** Aggregate independent one-to-many relationships before joining them when their row multiplication would distort calculations.

---

## 17. GROUP BY Multiple Levels Using GROUPING SETS

PostgreSQL supports advanced grouping features.

`GROUPING SETS` allows multiple grouping combinations in one query.

### Example

```sql
SELECT
    department_id,
    status,
    COUNT(*) AS total_employees
FROM employees
GROUP BY GROUPING SETS (
    (department_id, status),
    (department_id),
    (status),
    ()
);
```

This calculates:

1. Employee counts per department and status.
2. Employee counts per department.
3. Employee counts per status.
4. The grand total.

The empty grouping set `()` produces the grand total.

### Example result structure

| department_id | status   | total_employees |
| ------------: | -------- | --------------: |
|             1 | active   |               5 |
|             1 | inactive |               2 |
|             1 | NULL     |               7 |
|             2 | active   |               4 |
|          NULL | active   |               9 |
|          NULL | NULL     |              15 |

**Important:** NULL values generated by grouping sets can be confused with actual NULL values in source columns. Use `GROUPING()` to identify whether a column was aggregated away.

---

## 18. ROLLUP

ROLLUP generates hierarchical subtotals.

### Example

```sql
SELECT
    department_id,
    status,
    COUNT(*) AS total_employees
FROM employees
GROUP BY ROLLUP (
    department_id,
    status
);
```

It generates grouping levels:

- `(department_id, status)`
- `(department_id)`
- `()`

This is useful for department-level subtotals and a grand total.

---

## 19. CUBE

CUBE generates all possible grouping combinations of the specified columns.

### Example

```sql
SELECT
    department_id,
    status,
    COUNT(*) AS total_employees
FROM employees
GROUP BY CUBE (
    department_id,
    status
);
```

It generates:

- `(department_id, status)`
- `(department_id)`
- `(status)`
- `()`

### ROLLUP vs CUBE

| ROLLUP                             | CUBE                                    |
| ---------------------------------- | --------------------------------------- |
| Generates hierarchical subtotals   | Generates all grouping combinations     |
| Follows the specified column order | Produces every possible grouping subset |
| Useful for hierarchical reporting  | Useful for multidimensional reporting   |

---

## 20. GROUP BY Performance Considerations

### A. Filter before grouping

```sql
SELECT
    customer_id,
    SUM(total_amount)
FROM orders
WHERE status = 'completed'
GROUP BY customer_id;
```

Filtering unnecessary rows reduces the input to aggregation.

### B. Indexes may help

An index on a frequently filtered or grouped column can sometimes improve performance.

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

However, PostgreSQL may still prefer a sequential scan and hash aggregation.

### C. Understand aggregation strategies

PostgreSQL may use:

- HashAggregate
- GroupAggregate

The chosen strategy depends on the query, available ordering, memory and planner estimates.

### D. Avoid unnecessary grouping columns

Every additional grouping column can increase the number of groups.

Only include columns required by the intended grouping.

### E. Inspect execution plans

```sql
EXPLAIN ANALYZE
SELECT
    customer_id,
    SUM(total_amount)
FROM orders
GROUP BY customer_id;
```

Detailed query-plan analysis is covered in Part 13.

---

## 21. Common GROUP BY Mistakes

| Mistake                                                      | Explanation                                 |
| ------------------------------------------------------------ | ------------------------------------------- |
| Selecting a non-grouped column without aggregation           | PostgreSQL generally rejects it             |
| Grouping by the wrong combination of columns                 | Produces incorrect group granularity        |
| Using WHERE for aggregate conditions                         | Use HAVING                                  |
| Assuming NULL creates separate groups                        | NULL values are grouped together            |
| Using COUNT(\*) after LEFT JOIN for child counts             | Counts NULL-extended rows                   |
| Aggregating after row-multiplying JOINs                      | Can inflate totals                          |
| Grouping by a full timestamp when daily grouping is required | Creates separate groups for different times |
| Using DISTINCT to hide incorrect grouping                    | Does not fix the underlying logic           |
| Assuming GROUP BY sorts output                               | Use ORDER BY explicitly                     |

### Important PostgreSQL rule

Consider:

```sql
SELECT
    customer_id,
    customer_name,
    SUM(total_amount)
FROM orders
GROUP BY customer_id;
```

If `customer_name` is not available in the `orders` table, this query is invalid.

PostgreSQL also permits certain ungrouped columns when they are functionally dependent on grouped primary-key columns from the same table. Do not rely on this exception in queries where the dependency is unclear.

A safe explicit approach is:

```sql
SELECT
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

---

## 22. Practice Exercises

Use the TechBazaar database.

1. Count the total orders per customer.
2. Calculate total revenue per order status.
3. Calculate average product price per category.
4. Find the highest and lowest order amount per customer.
5. Count employees per department, including empty departments.
6. Find customers with more than five orders.
7. Find customers whose total spending exceeds ₹20,000.
8. Calculate daily order revenue.
9. Calculate monthly revenue.
10. Count unique customers per city.
11. Display all employees in each department using STRING_AGG.
12. Collect product IDs per category using ARRAY_AGG.
13. Return orders per customer as a JSONB array.
14. Categorize orders into low, medium and high value using CASE and GROUP BY.
15. Calculate completed and pending order counts per customer.
16. Explain the difference between grouping by customer_id and grouping by customer_id plus status.
17. Demonstrate why COUNT(\*) and COUNT(child_id) differ after LEFT JOIN.
18. Calculate order item quantities and payment totals without double-counting.
19. Use ROLLUP to generate department and grand totals.
20. Use CUBE to generate department-status summaries.

---

## 23. Interview Questions

**Q1. What is GROUP BY?**

GROUP BY combines rows having the same values in specified columns into groups, usually for aggregate calculations.

**Q2. Can GROUP BY be used without aggregate functions?**

Yes. It can return unique combinations of grouped columns, although DISTINCT is often clearer for that purpose.

**Q3. Can we group by multiple columns?**

Yes. PostgreSQL groups rows based on the distinct combination of all specified columns.

**Q4. What happens to NULL values in GROUP BY?**

All NULL values for a grouping column belong to the same group.

**Q5. What is the difference between WHERE and HAVING?**

WHERE filters individual rows before grouping. HAVING filters groups after aggregation.

**Q6. Can we use aggregate functions in WHERE?**

Not at the same query level. Use HAVING or a subquery.

**Q7. Does GROUP BY automatically sort the output?**

No. Use ORDER BY when a specific order is required.

**Q8. What is the difference between GROUP BY and DISTINCT?**

DISTINCT removes duplicate result rows. GROUP BY creates groups and supports aggregate calculations.

**Q9. What is ROLLUP?**

ROLLUP generates hierarchical subtotals and a grand total.

**Q10. What is CUBE?**

CUBE generates every possible grouping combination for the specified columns.

**Q11. What is GROUPING SETS?**

It allows multiple grouping combinations to be calculated in one query.

**Q12. How can JOINs cause incorrect GROUP BY results?**

JOINs can multiply rows, causing aggregate values to be counted multiple times. Pre-aggregate independent one-to-many relationships when necessary.

**Q13. What is the difference between GROUP BY and window functions?**

GROUP BY reduces rows to group-level results. Window functions preserve individual rows while calculating over related rows.

---

## Key Takeaways

- GROUP BY creates groups based on one or more columns.
- Aggregate functions calculate values for each group.
- Multiple columns create groups based on their combinations.
- WHERE filters rows before grouping.
- HAVING filters groups after aggregation.
- NULL values form their own groups.
- GROUP BY does not guarantee output ordering.
- GROUP BY works with JOINs, CASE, date functions and aggregate functions.
- ROLLUP generates hierarchical subtotals.
- CUBE generates all grouping combinations.
- GROUPING SETS supports multiple grouping levels.
- Pre-aggregate independent one-to-many relationships to prevent incorrect totals.
