---
sidebar_label: "Advanced Aggregation"
sidebar_position: 1
---

# Advanced Aggregation

## 1. Advanced Aggregation Fundamentals

Advanced aggregation techniques help solve complex reporting and analytical problems.

They are commonly used for:

- Business intelligence dashboards.
- Revenue and sales reports.
- Customer segmentation.
- Conditional statistics.
- Multi-level summaries.
- Data reconciliation.
- API reporting.

Important PostgreSQL features covered here:

1. Conditional aggregation.
2. DISTINCT aggregation.
3. Aggregate FILTER.
4. Multiple grouping levels.
5. GROUPING SETS.
6. ROLLUP and CUBE.
7. Aggregate functions with FILTER and CASE.
8. Aggregate functions with JOINs.
9. Ordered-set aggregates.
10. Percentiles and statistical aggregates.

---

## 2. Conditional Aggregation

Conditional aggregation calculates different metrics based on conditions within the same query.

### Example: Order statistics by status

```sql
SELECT
    COUNT(*) AS total_orders,

    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders,

    COUNT(*) FILTER (
        WHERE status = 'pending'
    ) AS pending_orders,

    COUNT(*) FILTER (
        WHERE status = 'cancelled'
    ) AS cancelled_orders,

    SUM(total_amount) FILTER (
        WHERE status = 'completed'
    ) AS completed_revenue

FROM orders;
```

### Alternative using CASE

```sql
SELECT
    COUNT(*) AS total_orders,

    SUM(
        CASE WHEN status = 'completed'
        THEN 1 ELSE 0 END
    ) AS completed_orders,

    SUM(
        CASE WHEN status = 'pending'
        THEN 1 ELSE 0 END
    ) AS pending_orders,

    SUM(
        CASE WHEN status = 'cancelled'
        THEN 1 ELSE 0 END
    ) AS cancelled_orders

FROM orders;
```

### FILTER vs CASE

| FILTER                                       | CASE                                 |
| -------------------------------------------- | ------------------------------------ |
| PostgreSQL aggregate filtering syntax        | General conditional expression       |
| Applies condition to an individual aggregate | Produces a value for aggregation     |
| Clear for multiple conditional metrics       | Useful for more complex calculations |
| Supported by PostgreSQL                      | Supported by PostgreSQL              |

**Recommendation:** Use FILTER when you simply need to restrict the input rows for an aggregate. Use CASE when the calculation itself needs conditional values.

---

## 3. Multiple Conditional Aggregates

You can calculate several business metrics in one query.

### Example: Revenue by payment status

```sql
SELECT
    COUNT(*) AS total_payments,

    COUNT(*) FILTER (
        WHERE payment_status = 'completed'
    ) AS successful_payments,

    COUNT(*) FILTER (
        WHERE payment_status = 'failed'
    ) AS failed_payments,

    SUM(amount) FILTER (
        WHERE payment_status = 'completed'
    ) AS successful_amount,

    SUM(amount) FILTER (
        WHERE payment_status = 'failed'
    ) AS failed_amount

FROM payments;
```

This produces one summary row.

### Business use cases

- Payment success rates.
- Order status dashboards.
- Employee status reports.
- Product availability reports.
- Customer segmentation.

---

## 4. DISTINCT Aggregation

DISTINCT removes duplicate input values before applying an aggregate function.

### Count unique customers

```sql
SELECT
    COUNT(DISTINCT customer_id) AS unique_customers
FROM orders;
```

### Count unique products purchased by each customer

```sql
SELECT
    o.customer_id,
    COUNT(DISTINCT oi.product_id) AS unique_products
FROM orders AS o
JOIN order_items AS oi
    ON o.order_id = oi.order_id
GROUP BY o.customer_id;
```

### Multiple DISTINCT aggregates

```sql
SELECT
    COUNT(DISTINCT customer_id) AS unique_customers,
    COUNT(DISTINCT status) AS unique_statuses
FROM orders;
```

Each aggregate independently removes duplicate values from its own input.

### Important distinction

```sql
SUM(DISTINCT total_amount)
```

does not calculate total revenue correctly when different orders have the same amount.

Example:

| order_id | total_amount |
| -------: | -----------: |
|      101 |         5000 |
|      102 |         5000 |
|      103 |         3000 |

```sql
SELECT SUM(total_amount)
FROM orders;
```

Result: `13000`

```sql
SELECT SUM(DISTINCT total_amount)
FROM orders;
```

Result: `8000`

DISTINCT removes the repeated amount of 5000, even though it belongs to two different orders.

---

## 5. GROUPING SETS

`GROUPING SETS` allows multiple grouping combinations in one query.

Instead of writing multiple GROUP BY queries and combining them with UNION ALL, you can calculate several aggregation levels together.

### Example: Employee count by department and status

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

| Grouping set              | Meaning                        |
| ------------------------- | ------------------------------ |
| `(department_id, status)` | Count by department and status |
| `(department_id)`         | Count by department            |
| `(status)`                | Count by status                |
| `()`                      | Grand total                    |

### Understanding the result

A simplified result could look like:

| department_id | status   | total_employees |
| ------------: | -------- | --------------: |
|             1 | active   |               5 |
|             1 | inactive |               2 |
|             1 | NULL     |               7 |
|             2 | active   |               4 |
|          NULL | active   |               9 |
|          NULL | NULL     |              15 |

The NULL values can represent either:

- An actual NULL in the source data.
- A column omitted from a grouping set.

Use the GROUPING function to distinguish them.

---

## 6. GROUPING() Function

`GROUPING()` identifies whether a column was omitted from the current grouping set.

It returns:

- `0` if the column participates in the current grouping level.
- `1` if the column was omitted.

### Example

```sql
SELECT
    department_id,
    status,
    COUNT(*) AS total_employees,

    GROUPING(department_id) AS department_grouped,
    GROUPING(status) AS status_grouped

FROM employees

GROUP BY GROUPING SETS (
    (department_id, status),
    (department_id),
    (status),
    ()
);
```

### Example interpretation

| department_id | status | department_grouped | status_grouped |
| ------------: | ------ | -----------------: | -------------: |
|             1 | active |                  0 |              0 |
|             1 | NULL   |                  0 |              1 |
|          NULL | active |                  1 |              0 |
|          NULL | NULL   |                  1 |              1 |

Interpretation:

- `0, 0`: Both columns participate.
- `0, 1`: Department-level subtotal.
- `1, 0`: Status-level subtotal.
- `1, 1`: Grand total.

This is especially useful in reporting queries.

---

## 7. ROLLUP

ROLLUP generates hierarchical subtotals based on the specified column order.

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

Equivalent grouping levels:

```sql
GROUP BY GROUPING SETS (
    (department_id, status),
    (department_id),
    ()
);
```

### How it works

For:

```sql
ROLLUP (department_id, status)
```

PostgreSQL calculates:

1. Department + status.
2. Department subtotal.
3. Grand total.

### Three-column example

```sql
SELECT
    department_id,
    status,
    DATE_TRUNC('year', created_at) AS joining_year,
    COUNT(*) AS total_employees
FROM employees
GROUP BY ROLLUP (
    department_id,
    status,
    DATE_TRUNC('year', created_at)
);
```

This creates progressively broader subtotals:

1. Department + status + year.
2. Department + status.
3. Department.
4. Grand total.

**Important:** ROLLUP follows the specified column order. Changing the order changes the hierarchy.

---

## 8. CUBE

CUBE generates every possible grouping combination of the specified columns.

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

Equivalent grouping sets:

```sql
GROUP BY GROUPING SETS (
    (department_id, status),
    (department_id),
    (status),
    ()
);
```

### CUBE with three columns

```sql
SELECT
    department_id,
    status,
    DATE_TRUNC('year', created_at) AS joining_year,
    COUNT(*) AS total_employees
FROM employees
GROUP BY CUBE (
    department_id,
    status,
    DATE_TRUNC('year', created_at)
);
```

With three grouping columns, CUBE produces:

\[
2^3 = 8
\]

grouping combinations.

### ROLLUP vs CUBE vs GROUPING SETS

| Feature               | ROLLUP                 | CUBE                      | GROUPING SETS                  |
| --------------------- | ---------------------- | ------------------------- | ------------------------------ |
| Purpose               | Hierarchical subtotals | All combinations          | Explicit grouping combinations |
| Grouping combinations | Hierarchical           | Every subset              | User-defined                   |
| Column order matters  | Yes                    | No for combinations       | Depends on specified sets      |
| Common use            | Hierarchical reports   | Multidimensional analysis | Custom reports                 |

**Performance consideration:** CUBE can generate many grouping combinations. With many columns, the number of combinations grows exponentially.

---

## 9. Ordered-Set Aggregate Functions

PostgreSQL supports ordered-set aggregates for calculations that depend on the ordering of values.

A common example is the percentile.

### Percentile using PERCENTILE_CONT

`PERCENTILE_CONT` calculates a continuous percentile and can interpolate between values.

```sql
SELECT
    PERCENTILE_CONT(0.5)
    WITHIN GROUP (
        ORDER BY total_amount
    ) AS median_order_value
FROM orders;
```

This calculates the median order value.

### PERCENTILE_DISC

`PERCENTILE_DISC` returns an actual value from the ordered input rather than interpolating.

```sql
SELECT
    PERCENTILE_DISC(0.5)
    WITHIN GROUP (
        ORDER BY total_amount
    ) AS median_order_value
FROM orders;
```

### Difference

| PERCENTILE_CONT                     | PERCENTILE_DISC                 |
| ----------------------------------- | ------------------------------- |
| Continuous percentile               | Discrete percentile             |
| Can interpolate                     | Returns an existing input value |
| Result may not exist in source data | Result exists in source data    |

### Example: 90th percentile

```sql
SELECT
    PERCENTILE_CONT(0.90)
    WITHIN GROUP (
        ORDER BY total_amount
    ) AS p90_order_value
FROM orders;
```

This gives the 90th percentile order amount.

**Business use:** Understanding the distribution of order values, salaries, delivery times and transaction amounts.

---

## 10. Percentiles Per Group

You can calculate percentiles separately for each group.

### Example: Median product price per category

```sql
SELECT
    category_id,

    PERCENTILE_CONT(0.5)
    WITHIN GROUP (
        ORDER BY price
    ) AS median_price

FROM products
GROUP BY category_id;
```

### Example: 90th percentile order amount per customer

```sql
SELECT
    customer_id,

    PERCENTILE_CONT(0.90)
    WITHIN GROUP (
        ORDER BY total_amount
    ) AS p90_order_amount

FROM orders
GROUP BY customer_id;
```

---

## 11. Statistical Aggregate Functions

PostgreSQL provides statistical aggregates.

| Function        | Purpose                       |
| --------------- | ----------------------------- |
| `VAR_POP()`     | Population variance           |
| `VAR_SAMP()`    | Sample variance               |
| `STDDEV_POP()`  | Population standard deviation |
| `STDDEV_SAMP()` | Sample standard deviation     |
| `CORR()`        | Correlation coefficient       |
| `COVAR_POP()`   | Population covariance         |
| `COVAR_SAMP()`  | Sample covariance             |

### Variance

Variance measures how far values are spread around their mean.

```sql
SELECT
    VAR_POP(total_amount) AS population_variance,
    VAR_SAMP(total_amount) AS sample_variance
FROM orders;
```

### Standard deviation

```sql
SELECT
    STDDEV_POP(total_amount) AS population_stddev,
    STDDEV_SAMP(total_amount) AS sample_stddev
FROM orders;
```

### Correlation

```sql
SELECT
    CORR(quantity, unit_price) AS quantity_price_correlation
FROM order_items;
```

Correlation ranges from -1 to +1:

| Value | Interpretation                       |
| ----: | ------------------------------------ |
|    +1 | Perfect positive linear relationship |
|     0 | No linear correlation                |
|    -1 | Perfect negative linear relationship |

Correlation does not establish causation.

---

## 12. Aggregate Functions with FILTER and GROUP BY

FILTER can be combined with GROUP BY for group-level conditional metrics.

### Example: Order statistics per customer

```sql
SELECT
    customer_id,

    COUNT(*) AS total_orders,

    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders,

    COUNT(*) FILTER (
        WHERE status = 'pending'
    ) AS pending_orders,

    SUM(total_amount) FILTER (
        WHERE status = 'completed'
    ) AS completed_revenue

FROM orders
GROUP BY customer_id;
```

### Example: Payment statistics per order

```sql
SELECT
    order_id,

    COUNT(*) AS total_payments,

    COUNT(*) FILTER (
        WHERE payment_status = 'completed'
    ) AS successful_payments,

    SUM(amount) FILTER (
        WHERE payment_status = 'completed'
    ) AS successful_amount

FROM payments
GROUP BY order_id;
```

This is useful for financial and operational reporting.

---

## 13. Aggregate FILTER vs WHERE

These queries have different purposes.

### WHERE filters the entire input

```sql
SELECT
    customer_id,
    COUNT(*) AS completed_orders
FROM orders
WHERE status = 'completed'
GROUP BY customer_id;
```

Only completed orders participate in the query.

### FILTER applies conditions to individual aggregates

```sql
SELECT
    customer_id,

    COUNT(*) AS all_orders,

    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders,

    COUNT(*) FILTER (
        WHERE status = 'pending'
    ) AS pending_orders

FROM orders
GROUP BY customer_id;
```

This calculates multiple metrics from the same input rows.

---

## 14. Advanced Aggregation with CTEs

CTEs can separate complex calculations into readable steps.

### Example: Customer revenue and payment totals

```sql
WITH customer_revenue AS (
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
    COALESCE(cr.total_orders, 0) AS total_orders,
    COALESCE(cr.total_order_value, 0) AS total_order_value,
    COALESCE(cp.total_paid, 0) AS total_paid
FROM customers AS c
LEFT JOIN customer_revenue AS cr
    ON c.customer_id = cr.customer_id
LEFT JOIN customer_payments AS cp
    ON c.customer_id = cp.customer_id;
```

### Why separate the aggregations?

Orders and payments have a one-to-many relationship.

Aggregating them separately avoids accidentally multiplying order rows by payment rows.

**Business consideration:** This example sums completed payment records. Refunds, reversals and partial payments require additional business rules.

---

## 15. Aggregate Functions with Window Functions

Aggregate functions can also be used as window functions.

### Normal aggregation

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

Returns one row per customer.

### Window aggregation

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    SUM(total_amount) OVER (
        PARTITION BY customer_id
    ) AS customer_total_spent

FROM orders;
```

Returns every order with the customer's total spending.

### Comparison

| GROUP BY                   | OVER()                        |
| -------------------------- | ----------------------------- |
| Groups rows                | Defines a window of rows      |
| Reduces result rows        | Preserves individual rows     |
| Returns group-level output | Adds calculations to each row |
| Uses GROUP BY              | Uses OVER()                   |

Detailed window functions are covered in Part 11.

---

## 16. Common Advanced Aggregation Mistakes

| Mistake                                                  | Correct approach                             |
| -------------------------------------------------------- | -------------------------------------------- |
| Using SUM(DISTINCT amount) to fix duplicate JOIN rows    | Fix the JOIN cardinality or pre-aggregate    |
| Confusing ROLLUP and CUBE                                | Understand hierarchical vs all combinations  |
| Forgetting GROUPING()                                    | Distinguish subtotal NULLs from actual NULLs |
| Generating too many CUBE combinations                    | Use only necessary grouping columns          |
| Assuming PERCENTILE_CONT returns an existing value       | It can interpolate                           |
| Assuming correlation proves causation                    | Correlation only measures linear association |
| Joining multiple one-to-many tables before aggregation   | Aggregate independently first                |
| Using WHERE when separate conditional metrics are needed | Use FILTER                                   |
| Assuming aggregate output is sorted                      | Use ORDER BY explicitly                      |

---

## 17. Practice Exercises

Use the TechBazaar database.

1. Calculate total, completed and pending orders per customer.
2. Calculate completed and failed payment amounts per order.
3. Count unique products purchased by each customer.
4. Calculate the median order amount.
5. Calculate the 90th percentile order amount.
6. Calculate the median product price per category.
7. Calculate average and standard deviation of order values.
8. Calculate correlation between quantity and unit price.
9. Use GROUPING SETS to calculate department, status and grand totals.
10. Use ROLLUP to calculate department-level employee subtotals.
11. Use CUBE to calculate all department-status combinations.
12. Use GROUPING() to distinguish actual NULLs from subtotal NULLs.
13. Calculate total order value and total successful payments per customer without double-counting.
14. Build a customer revenue summary using CTEs.
15. Compare PERCENTILE_CONT and PERCENTILE_DISC.
16. Explain why SUM(DISTINCT total_amount) is not a reliable duplicate-row fix.
17. Calculate the number of customers in each city and the overall customer count using GROUPING SETS.
18. Create a conditional sales report using FILTER and GROUP BY.

---

## 18. Interview Questions

**Q1. What is conditional aggregation?**

Calculating multiple aggregate metrics using different conditions within one query.

**Q2. What is the difference between FILTER and WHERE?**

WHERE filters the entire input dataset. FILTER applies a condition to an individual aggregate function.

**Q3. What is GROUPING SETS?**

A PostgreSQL feature that calculates multiple grouping combinations in one query.

**Q4. What is ROLLUP?**

It generates hierarchical subtotals and a grand total.

**Q5. What is CUBE?**

It generates all possible grouping combinations for specified columns.

**Q6. What does GROUPING() do?**

It identifies whether a column was omitted from the current grouping set.

**Q7. What is the difference between PERCENTILE_CONT and PERCENTILE_DISC?**

PERCENTILE_CONT can interpolate between values. PERCENTILE_DISC returns an actual value from the ordered input.

**Q8. What is standard deviation?**

It measures the spread of values around their mean.

**Q9. What is CORR() in PostgreSQL?**

It calculates the correlation coefficient between two numeric variables.

**Q10. Why should independent one-to-many tables be aggregated before joining?**

To avoid row multiplication and incorrect aggregate calculations.

**Q11. Can aggregate functions be used with OVER()?**

Yes. They can operate as window functions and preserve individual rows.

**Q12. How many grouping combinations does CUBE generate for N columns?**

It generates \(2^N\) grouping combinations.

---

## Key Takeaways

- Conditional aggregation calculates multiple metrics using FILTER or CASE.
- DISTINCT removes duplicate aggregate inputs.
- GROUPING SETS calculates multiple grouping levels in one query.
- ROLLUP generates hierarchical subtotals.
- CUBE generates all possible grouping combinations.
- GROUPING() distinguishes subtotal NULLs from actual NULL values.
- PERCENTILE_CONT and PERCENTILE_DISC calculate percentiles differently.
- PostgreSQL provides statistical aggregates such as VARIANCE, STDDEV and CORR.
- CTEs help organize complex aggregation queries.
- Pre-aggregate independent one-to-many relationships to avoid inflated totals.
- Aggregate functions can also be used as window functions with OVER().
