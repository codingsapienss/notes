---
sidebar_label: "Aggregate Window Functions"
sidebar_position: 1
---

# Aggregate Window Functions

## 1. Introduction

Aggregate window functions apply aggregate calculations across a window of rows while preserving individual rows.

Unlike ordinary aggregation with GROUP BY, they do not collapse multiple rows into one result row.

Important functions:

| Function         | Purpose              |
| ---------------- | -------------------- |
| `SUM() OVER()`   | Calculates totals    |
| `AVG() OVER()`   | Calculates averages  |
| `COUNT() OVER()` | Counts rows          |
| `MIN() OVER()`   | Finds minimum values |
| `MAX() OVER()`   | Finds maximum values |

This chapter focuses on:

- Running totals.
- Running averages.
- Cumulative counts.
- Moving averages.
- Window frames.
- ROWS vs RANGE.
- UNBOUNDED PRECEDING and FOLLOWING.
- CURRENT ROW.
- Conditional aggregate window functions.

---

## 2. Aggregate Window Functions Without ORDER BY

When you use PARTITION BY without ORDER BY, the aggregate is calculated over the entire partition.

### Example: Total spending per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    SUM(total_amount) OVER (
        PARTITION BY customer_id
    ) AS customer_total_spending

FROM orders;
```

Every order displays its customer's total spending.

### Example: Average salary per department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    AVG(salary) OVER (
        PARTITION BY department_id
    ) AS department_avg_salary

FROM employees;
```

### Example: Department employee count

```sql
SELECT
    employee_id,
    employee_name,
    department_id,

    COUNT(*) OVER (
        PARTITION BY department_id
    ) AS department_employee_count

FROM employees;
```

**Important:** Without ORDER BY, each row in the same partition receives the same aggregate result.

---

## 3. Running Total

A running total is a cumulative sum calculated row by row.

It is commonly used in:

- Daily revenue reports.
- Customer spending history.
- Account balances.
- Transaction tracking.
- Inventory movement.

### Example: Running total of order revenue

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_revenue

FROM orders;
```

### How it works

Suppose the orders are:

| order_id | total_amount |
| -------: | -----------: |
|      101 |         1000 |
|      102 |         2000 |
|      103 |         1500 |
|      104 |         3000 |

Running total:

| order_id | total_amount | running_revenue |
| -------: | -----------: | --------------: |
|      101 |         1000 |            1000 |
|      102 |         2000 |            3000 |
|      103 |         1500 |            4500 |
|      104 |         3000 |            7500 |

Each row includes the sum of all preceding rows and the current row.

### Important syntax

```sql
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
```

Meaning:

- `UNBOUNDED PRECEDING`: Start from the first row in the partition.
- `CURRENT ROW`: Include the current row.

---

## 4. Running Total Per Customer

You can calculate separate running totals for every customer.

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    SUM(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS customer_running_total

FROM orders;
```

Each customer's running total starts from zero conceptually and accumulates independently.

### Example

| customer_id | order_id | total_amount | running_total |
| ----------: | -------: | -----------: | ------------: |
|         101 |        1 |         1000 |          1000 |
|         101 |        2 |         2000 |          3000 |
|         101 |        3 |         1500 |          4500 |
|         102 |        4 |         3000 |          3000 |
|         102 |        5 |         1000 |          4000 |

When the customer changes, the running total starts again.

---

## 5. Running Average

A running average calculates the average from the beginning of the partition up to the current row.

### Example: Running average order amount

```sql
SELECT
    order_id,
    total_amount,
    created_at,

    AVG(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_average

FROM orders;
```

### Example calculation

| Order | Amount | Running average |
| ----: | -----: | --------------: |
|     1 |   1000 |            1000 |
|     2 |   2000 |            1500 |
|     3 |   3000 |            2000 |
|     4 |   4000 |            2500 |

Formula:

\[
\text{Running Average}
=
\frac{\text{Cumulative Sum}}{\text{Number of Rows}}
\]

### Running average per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    AVG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS customer_running_average

FROM orders;
```

---

## 6. Running COUNT

COUNT can also be used for cumulative calculations.

### Example: Number of orders processed so far

```sql
SELECT
    order_id,
    customer_id,
    created_at,

    COUNT(*) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS cumulative_order_count

FROM orders;
```

### Example: Number of orders per customer so far

```sql
SELECT
    order_id,
    customer_id,
    created_at,

    COUNT(*) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS customer_order_number

FROM orders;
```

This produces a cumulative count of orders for each customer.

---

## 7. Understanding Window Frames

A window frame defines which rows inside a partition participate in the calculation for the current row.

Syntax:

```sql
ROWS BETWEEN frame_start AND frame_end
```

Important frame boundaries:

| Boundary              | Meaning                                                |
| --------------------- | ------------------------------------------------------ |
| `UNBOUNDED PRECEDING` | First row in the partition                             |
| `n PRECEDING`         | n rows before the current row                          |
| `CURRENT ROW`         | Current row or its peer group, depending on frame mode |
| `n FOLLOWING`         | n rows after the current row                           |
| `UNBOUNDED FOLLOWING` | Last row in the partition                              |

### Example

```sql
SUM(total_amount) OVER (
    ORDER BY created_at, order_id
    ROWS BETWEEN 2 PRECEDING
    AND CURRENT ROW
)
```

This includes:

- Two preceding rows.
- The current row.

It calculates a sum over up to three rows.

---

## 8. ROWS vs RANGE

PostgreSQL supports different window frame modes.

The most important are:

- `ROWS`
- `RANGE`
- `GROUPS`

### 8.1 ROWS

ROWS counts physical rows in the ordered partition.

```sql
SELECT
    order_id,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN 2 PRECEDING
        AND CURRENT ROW
    ) AS recent_three_order_total

FROM orders;
```

This includes the current row and up to two preceding rows.

### 8.2 RANGE

RANGE considers ordering values and peer groups.

Rows with equal ORDER BY values are peers.

```sql
SELECT
    order_id,
    created_at,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at
        RANGE BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS cumulative_total

FROM orders;
```

If multiple orders have the same timestamp, they are peers and receive the same cumulative total under this frame.

### 8.3 GROUPS

GROUPS counts peer groups rather than individual rows.

```sql
SELECT
    order_id,
    created_at,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at
        GROUPS BETWEEN 1 PRECEDING
        AND CURRENT ROW
    ) AS current_and_previous_timestamp_group_total

FROM orders;
```

This includes the current timestamp peer group and the preceding timestamp peer group.

### Comparison

| ROWS                                     | RANGE                                                             | GROUPS                                              |
| ---------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| Counts physical rows                     | Uses ordering values and peer groups                              | Counts peer groups                                  |
| Useful for row-based moving calculations | Useful for value-based ranges and cumulative calculations         | Useful for calculations across tied ordering groups |
| `2 PRECEDING` means two rows             | `2 PRECEDING` represents an ordering-value offset where supported | `2 PRECEDING` means two peer groups                 |

---

## 9. Default Window Frame Behavior

This is an important PostgreSQL concept.

When an aggregate window function uses ORDER BY but does not specify a frame, PostgreSQL uses a default frame equivalent to:

```sql
RANGE BETWEEN UNBOUNDED PRECEDING
AND CURRENT ROW
```

This includes the current row and its peers.

### Example

```sql
SELECT
    order_id,
    created_at,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at
    ) AS running_total

FROM orders;
```

If several orders have identical timestamps, they can receive the same running total because they are peers.

### Safer approach for row-by-row running totals

```sql
SELECT
    order_id,
    created_at,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_total

FROM orders;
```

The unique order ID provides deterministic ordering, and ROWS gives row-by-row accumulation.

**Recommendation:** Explicitly specify ROWS when you need a physical-row running calculation.

---

## 10. Moving Average

A moving average calculates the average over a fixed-size window that moves as the current row changes.

Common uses:

- Sales trend analysis.
- Daily traffic analysis.
- Website engagement.
- Financial metrics.
- Performance monitoring.

### Example: Three-order moving average

```sql
SELECT
    order_id,
    total_amount,
    created_at,

    AVG(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN 2 PRECEDING
        AND CURRENT ROW
    ) AS moving_average

FROM orders;
```

Each row calculates the average of:

- Current order.
- Previous order.
- Two-orders-ago.

For the first two rows, fewer than three rows are available, so PostgreSQL averages the available rows.

### Example calculation

| Order | Amount | Moving average |
| ----: | -----: | -------------: |
|     1 |   1000 |           1000 |
|     2 |   2000 |           1500 |
|     3 |   3000 |           2000 |
|     4 |   4000 |           3000 |
|     5 |   5000 |           4000 |

### Moving average per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    AVG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN 2 PRECEDING
        AND CURRENT ROW
    ) AS customer_moving_average

FROM orders;
```

Each customer's moving average is calculated independently.

---

## 11. Forward-Looking Window Frames

A window frame can also include following rows.

### Example: Current and next two orders

```sql
SELECT
    order_id,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN CURRENT ROW
        AND 2 FOLLOWING
    ) AS upcoming_three_order_total

FROM orders;
```

This calculates the total of the current order and the next two orders.

### Entire partition

```sql
SELECT
    order_id,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS total_revenue

FROM orders;
```

Every row receives the total amount across the entire partition.

This is logically similar to:

```sql
SUM(total_amount) OVER ()
```

when no partitioning is used.

---

## 12. Conditional Aggregate Window Functions

PostgreSQL supports FILTER with aggregate window functions.

### Example: Running total of completed orders

```sql
SELECT
    order_id,
    customer_id,
    status,
    total_amount,
    created_at,

    SUM(total_amount) FILTER (
        WHERE status = 'completed'
    ) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS completed_running_total

FROM orders;
```

This calculates cumulative completed-order revenue for each customer.

### Example: Completed order count per customer

```sql
SELECT
    order_id,
    customer_id,
    status,

    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) OVER (
        PARTITION BY customer_id
    ) AS completed_order_count

FROM orders;
```

FILTER restricts the input rows for the aggregate without removing rows from the final result.

---

## 13. Combining Multiple Window Aggregates

You can calculate several metrics in one query.

### Example: Customer order analytics

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    SUM(total_amount) OVER customer_window
        AS customer_total,

    AVG(total_amount) OVER customer_window
        AS customer_average,

    COUNT(*) OVER customer_window
        AS customer_order_count,

    MAX(total_amount) OVER customer_window
        AS customer_max_order,

    MIN(total_amount) OVER customer_window
        AS customer_min_order

FROM orders

WINDOW customer_window AS (
    PARTITION BY customer_id
);
```

All five metrics are calculated per customer, while preserving each order row.

### Running metrics with a named window

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    SUM(total_amount) OVER running_window
        AS running_total,

    AVG(total_amount) OVER running_window
        AS running_average,

    COUNT(*) OVER running_window
        AS running_count

FROM orders

WINDOW running_window AS (
    PARTITION BY customer_id
    ORDER BY created_at, order_id
    ROWS BETWEEN UNBOUNDED PRECEDING
    AND CURRENT ROW
);
```

Named windows reduce repeated definitions and make queries easier to maintain.

---

## 14. Important Difference: ROWS vs RANGE in Practice

Suppose the data contains:

| order_id | created_at       | total_amount |
| -------: | ---------------- | -----------: |
|      101 | 2026-11-01 10:00 |         1000 |
|      102 | 2026-11-01 10:00 |         2000 |
|      103 | 2026-11-02 10:00 |         3000 |

### Using RANGE

```sql
SELECT
    order_id,
    created_at,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at
        RANGE BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_total

FROM orders;
```

The first two rows are peers because their timestamps match.

Both receive a cumulative total of 3000.

### Using ROWS

```sql
SELECT
    order_id,
    created_at,
    total_amount,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_total

FROM orders;
```

Result:

| order_id | total_amount | running_total |
| -------: | -----------: | ------------: |
|      101 |         1000 |          1000 |
|      102 |         2000 |          3000 |
|      103 |         3000 |          6000 |

The calculation advances one physical row at a time.

---

## 15. Common Mistakes

| Mistake                                                        | Correct understanding                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| Assuming SUM() OVER() reduces rows                             | It preserves individual rows                                    |
| Forgetting PARTITION BY                                        | All rows may belong to one window                               |
| Assuming ORDER BY guarantees unique ordering                   | Add a unique tie-breaker                                        |
| Assuming the default frame is always row-by-row                | Default RANGE includes peers                                    |
| Confusing ROWS and RANGE                                       | ROWS counts physical rows; RANGE uses ordering values and peers |
| Using an incorrect frame boundary                              | Understand PRECEDING, CURRENT ROW and FOLLOWING                 |
| Forgetting that early moving-average frames contain fewer rows | PostgreSQL uses the available rows                              |
| Using GROUP BY when individual rows are needed                 | Use window aggregates                                           |
| Assuming FILTER removes output rows                            | FILTER affects only the aggregate input                         |

---

## 16. Practice Exercises

Use the TechBazaar database.

1. Display every order with total spending per customer.
2. Display every employee with average salary per department.
3. Calculate company-wide running revenue.
4. Calculate running revenue separately for each customer.
5. Calculate running average order value per customer.
6. Calculate cumulative order count per customer.
7. Find the three-order moving average of order amounts.
8. Calculate the moving average separately for each customer.
9. Calculate cumulative completed-payment amount per order.
10. Calculate total successful payments per customer without removing individual payment rows.
11. Calculate the sum of the current and next two orders.
12. Compare ROWS and RANGE using records with identical timestamps.
13. Compare ROWS and GROUPS using peer groups.
14. Calculate the total amount across the entire partition using UNBOUNDED FOLLOWING.
15. Create a query using three aggregate window functions with a named window.
16. Explain why an ORDER BY tie can change default RANGE behavior.
17. Write a query that calculates running revenue with an explicit ROWS frame.

---

## 17. Interview Questions

**Q1. What is an aggregate window function?**

An aggregate function used with OVER() to calculate values across a window while preserving individual rows.

**Q2. What is a running total?**

A cumulative sum that includes preceding rows and the current row.

**Q3. What is a moving average?**

An average calculated over a moving subset of rows.

**Q4. What is a window frame?**

The subset of rows within a partition used for the current row's window calculation.

**Q5. What is the difference between ROWS and RANGE?**

ROWS counts physical rows. RANGE considers ordering values and peer groups.

**Q6. What is UNBOUNDED PRECEDING?**

It identifies the first row in the partition as the frame's starting boundary.

**Q7. What is CURRENT ROW?**

It identifies the current row or its peer group, depending on the frame mode.

**Q8. What is the default frame when ORDER BY is used in a window aggregate?**

`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.

**Q9. Why should you specify ROWS explicitly for running totals?**

To get physical-row accumulation and avoid peer-group behavior from the default RANGE frame.

**Q10. Can FILTER be used with aggregate window functions?**

Yes. FILTER restricts the input to an aggregate while preserving output rows.

**Q11. What is the difference between a running average and a moving average?**

A running average includes all rows from the start through the current row. A moving average uses a fixed-size or otherwise bounded moving frame.

**Q12. Can a window frame include future rows?**

Yes. Use FOLLOWING or UNBOUNDED FOLLOWING.

---

## Key Takeaways

- Aggregate window functions calculate values without collapsing individual rows.
- SUM, AVG, COUNT, MIN and MAX can operate as window functions.
- PARTITION BY separates calculations into logical groups.
- ORDER BY defines the sequence inside each partition.
- Running totals use UNBOUNDED PRECEDING through CURRENT ROW.
- Moving averages use bounded frames such as 2 PRECEDING through CURRENT ROW.
- ROWS counts physical rows; RANGE uses ordering values and peer groups; GROUPS counts peer groups.
- PostgreSQL's default ordered aggregate frame is RANGE from UNBOUNDED PRECEDING through CURRENT ROW.
- Use explicit ROWS frames for predictable row-by-row running calculations.
- FILTER can be combined with aggregate window functions.
- Named windows allow multiple calculations to share the same window definition.
