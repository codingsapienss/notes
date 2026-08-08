---
sidebar_label: "Advanced Window Function Problems"
sidebar_position: 1
---

# Advanced Window Function Problems

## 1. Introduction

Advanced window function problems combine multiple window functions, CTEs, aggregations, filtering and conditional logic to solve real-world SQL problems.

Common applications:

- Finding the top N records per group.
- Identifying consecutive transactions.
- Detecting gaps in activity.
- Calculating running balances.
- Finding first and latest records.
- Comparing current and previous periods.
- Calculating cumulative percentages.
- Identifying changes in user behavior.
- Building business analytics and leaderboards.

This chapter combines concepts from:

- Aggregate window functions.
- Ranking window functions.
- Navigation window functions.
- Window frames.
- CTEs and subqueries.

---

## 2. Find the Latest Record Per Group

A common requirement is retrieving the latest order for every customer.

### Using ROW_NUMBER()

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

SELECT *
FROM ranked_orders
WHERE rn = 1;
```

**How it works:**

1. PARTITION BY separates orders by customer.
2. ORDER BY places the newest order first.
3. ROW_NUMBER assigns 1 to the latest order.
4. The outer query filters for `rn = 1`.

**Important:** The `order_id` tie-breaker makes the selection deterministic when timestamps match.

### Alternative: Using DISTINCT ON

PostgreSQL also supports `DISTINCT ON`.

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

`DISTINCT ON` is PostgreSQL-specific. Its expressions must match the leftmost ORDER BY expressions.

---

## 3. Find the Top N Records Per Group

### Problem: Find the top 3 highest-revenue products in each category.

First calculate product revenue.

```sql
WITH product_revenue AS (
    SELECT
        p.product_id,
        p.product_name,
        p.category_id,

        SUM(oi.quantity * oi.unit_price) AS total_revenue

    FROM products p

    JOIN order_items oi
        ON p.product_id = oi.product_id

    GROUP BY
        p.product_id,
        p.product_name,
        p.category_id
),

ranked_products AS (
    SELECT
        *,

        ROW_NUMBER() OVER (
            PARTITION BY category_id
            ORDER BY total_revenue DESC, product_id
        ) AS rn

    FROM product_revenue
)

SELECT *
FROM ranked_products
WHERE rn <= 3;
```

### Variations

| Requirement                                                   | Function   |
| ------------------------------------------------------------- | ---------- |
| Exactly three products per category, where available          | ROW_NUMBER |
| Include all products tied within the top three rank positions | RANK       |
| Include products from the top three distinct revenue levels   | DENSE_RANK |

---

## 4. Calculate Running Account Balance

This is a common financial and transaction-processing problem.

Suppose a customer has transactions:

| Transaction | Amount | Type   |
| ----------- | -----: | ------ |
| 1           |   1000 | Credit |
| 2           |    300 | Debit  |
| 3           |    500 | Credit |
| 4           |    200 | Debit  |

The balance changes after every transaction.

### SQL example

The existing TechBazaar schema does not contain a transaction ledger with credit/debit types. The following example uses a proposed table for illustration.

```sql
CREATE TABLE account_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,

    CHECK (transaction_type IN ('credit', 'debit'))
);
```

### Calculate running balance

```sql
SELECT
    transaction_id,
    customer_id,
    amount,
    transaction_type,
    created_at,

    SUM(
        CASE
            WHEN transaction_type = 'credit' THEN amount
            WHEN transaction_type = 'debit' THEN -amount
        END
    ) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, transaction_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_balance

FROM account_transactions;
```

### Expected result

| Transaction | Amount | Type   | Balance |
| ----------: | -----: | ------ | ------: |
|           1 |   1000 | Credit |    1000 |
|           2 |    300 | Debit  |     700 |
|           3 |    500 | Credit |    1200 |
|           4 |    200 | Debit  |    1000 |

**Key concept:** Use CASE inside SUM() OVER() to convert credits and debits into signed values before calculating the running balance.

This example assumes the starting balance is zero. If an account has an opening balance, add it to the cumulative result.

---

## 5. Find Consecutive Records With Changes

### Problem: Identify orders where the amount increased compared with the previous order.

```sql
WITH order_history AS (
    SELECT
        order_id,
        customer_id,
        total_amount,
        created_at,

        LAG(total_amount) OVER (
            PARTITION BY customer_id
            ORDER BY created_at, order_id
        ) AS previous_amount

    FROM orders
)

SELECT
    order_id,
    customer_id,
    total_amount,
    previous_amount,

    total_amount - previous_amount AS amount_difference

FROM order_history

WHERE total_amount > previous_amount;
```

### Identify decreases instead

```sql
WHERE total_amount < previous_amount;
```

### Identify unchanged amounts

```sql
WHERE total_amount = previous_amount;
```

This pattern is useful for:

- Transaction monitoring.
- Customer spending analysis.
- Price changes.
- Performance comparisons.

---

## 6. Detect Gaps Between Consecutive Events

A common backend analytics requirement is identifying gaps between user activities.

For example:

- When did a customer last place an order?
- How much time passed between orders?
- Which customers have unusually long gaps between purchases?

### Example: Calculate time between consecutive orders

```sql
WITH order_gaps AS (
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
    created_at,
    previous_order_time,

    created_at - previous_order_time AS time_between_orders

FROM order_gaps;
```

PostgreSQL timestamp subtraction returns an interval.

### Find customers with more than 30 days between orders

```sql
WITH order_gaps AS (
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

SELECT *
FROM order_gaps

WHERE created_at - previous_order_time > INTERVAL '30 days';
```

The first order for each customer has no previous order and therefore produces NULL for the gap.

---

## 7. Calculate Running Percentage of Total Revenue

### Problem: Find each order's contribution to cumulative company revenue.

```sql
SELECT
    order_id,
    total_amount,
    created_at,

    SUM(total_amount) OVER (
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_revenue,

    SUM(total_amount) OVER () AS total_revenue,

    ROUND(
        100.0 * SUM(total_amount) OVER (
            ORDER BY created_at, order_id
            ROWS BETWEEN UNBOUNDED PRECEDING
            AND CURRENT ROW
        )
        / NULLIF(SUM(total_amount) OVER (), 0),
        2
    ) AS cumulative_revenue_percentage

FROM orders;
```

### Example

| Order | Amount | Running revenue | Total revenue | Cumulative % |
| ----: | -----: | --------------: | ------------: | -----------: |
|     1 |   1000 |            1000 |         10000 |          10% |
|     2 |   2000 |            3000 |         10000 |          30% |
|     3 |   3000 |            6000 |         10000 |          60% |
|     4 |   4000 |           10000 |         10000 |         100% |

This is useful for cumulative sales and revenue contribution reports.

---

## 8. Find the First and Last Order Per Customer

You can use FIRST_VALUE() and LAST_VALUE() together.

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    FIRST_VALUE(order_id) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS first_order_id,

    LAST_VALUE(order_id) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS last_order_id

FROM orders;
```

Every order row receives the first and last order IDs for its customer.

### Alternative: Get only the first and last order rows

```sql
WITH ranked_orders AS (
    SELECT
        *,

        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY created_at, order_id
        ) AS first_rank,

        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY created_at DESC, order_id DESC
        ) AS last_rank

    FROM orders
)

SELECT *
FROM ranked_orders

WHERE first_rank = 1
   OR last_rank = 1;
```

---

## 9. Find the Second-Highest Distinct Salary

### Problem

Find the second-highest distinct salary in each department.

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
)

SELECT *
FROM ranked_employees
WHERE salary_rank = 2;
```

Why DENSE_RANK?

Suppose salaries are:

| Employee | Salary | DENSE_RANK |
| -------- | -----: | ---------: |
| A        | 100000 |          1 |
| B        | 100000 |          1 |
| C        |  90000 |          2 |
| D        |  80000 |          3 |

The second-highest distinct salary is 90000.

Using RANK() would assign rank 3 to the 90000 salary, which is not what we want.

---

## 10. Identify Duplicate Records Using Window Functions

Window functions can help identify duplicate values without collapsing the result.

### Example: Find customers sharing the same email

```sql
SELECT
    customer_id,
    customer_name,
    email,

    COUNT(*) OVER (
        PARTITION BY email
    ) AS email_count

FROM customers;
```

### Return only duplicate email records

```sql
WITH duplicate_customers AS (
    SELECT
        customer_id,
        customer_name,
        email,

        COUNT(*) OVER (
            PARTITION BY email
        ) AS email_count

    FROM customers
)

SELECT *
FROM duplicate_customers
WHERE email_count > 1;
```

**Important:** This example assumes email values should be compared directly. If NULL emails exist, all NULL email rows form one partition. Filter NULL values if they should not be considered duplicates.

### Identify which duplicate row to retain

```sql
WITH duplicate_customers AS (
    SELECT
        customer_id,
        customer_name,
        email,

        ROW_NUMBER() OVER (
            PARTITION BY email
            ORDER BY customer_id
        ) AS rn

    FROM customers
    WHERE email IS NOT NULL
)

SELECT *
FROM duplicate_customers
WHERE rn > 1;
```

This identifies duplicate rows after the first row in each email group.

Do not delete these records automatically. Verify the business rules and references before removing duplicates.

---

## 11. Calculate Percentage Contribution Within a Group

### Problem: Calculate each employee's salary contribution to their department's total salary.

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    SUM(salary) OVER (
        PARTITION BY department_id
    ) AS department_total_salary,

    ROUND(
        100.0 * salary /
        NULLIF(
            SUM(salary) OVER (
                PARTITION BY department_id
            ),
            0
        ),
        2
    ) AS salary_contribution_percentage

FROM employees;
```

This shows what percentage of the department's total salary belongs to each employee.

### Example

| Employee | Salary | Department total | Contribution |
| -------- | -----: | ---------------: | -----------: |
| A        |  50000 |           200000 |          25% |
| B        |  70000 |           200000 |          35% |
| C        |  80000 |           200000 |          40% |

---

## 12. Identify Consecutive Days of Activity

A common analytics problem is finding consecutive days on which a customer placed orders.

The following example uses the existing `orders.created_at` column.

### Step 1: Get distinct activity dates

```sql
WITH customer_activity AS (
    SELECT DISTINCT
        customer_id,
        created_at::date AS activity_date

    FROM orders
)
```

### Step 2: Assign row numbers

```sql
WITH customer_activity AS (
    SELECT DISTINCT
        customer_id,
        created_at::date AS activity_date

    FROM orders
),

numbered_activity AS (
    SELECT
        customer_id,
        activity_date,

        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY activity_date
        ) AS rn

    FROM customer_activity
)

SELECT *
FROM numbered_activity;
```

### Step 3: Identify consecutive date groups

For consecutive dates, subtracting the row number from the date produces the same grouping key.

```sql
WITH customer_activity AS (
    SELECT DISTINCT
        customer_id,
        created_at::date AS activity_date

    FROM orders
),

numbered_activity AS (
    SELECT
        customer_id,
        activity_date,

        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY activity_date
        ) AS rn

    FROM customer_activity
),

activity_groups AS (
    SELECT
        customer_id,
        activity_date,

        activity_date - rn::integer AS group_key

    FROM numbered_activity
)

SELECT
    customer_id,
    MIN(activity_date) AS streak_start,
    MAX(activity_date) AS streak_end,
    COUNT(*) AS consecutive_days

FROM activity_groups

GROUP BY
    customer_id,
    group_key

ORDER BY
    customer_id,
    streak_start;
```

### Why does this work?

Consider:

| Activity date | Row number | Date - row number |
| ------------- | ---------: | ----------------- |
| Nov 1         |          1 | Oct 31            |
| Nov 2         |          2 | Oct 31            |
| Nov 3         |          3 | Oct 31            |
| Nov 5         |          4 | Nov 1             |
| Nov 6         |          5 | Nov 1             |

Consecutive dates produce the same group key.

When there is a gap, the group key changes.

**Important:** `created_at::date` uses the PostgreSQL session time zone when converting a `TIMESTAMPTZ` value to a date. For business-day analytics, explicitly choose the intended time zone if necessary.

---

## 13. Use Multiple Window Functions Together

Advanced SQL often requires multiple calculations in one query.

### Example: Customer order analytics

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    ROW_NUMBER() OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS order_sequence,

    LAG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS previous_order_amount,

    LEAD(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS next_order_amount,

    SUM(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND CURRENT ROW
    ) AS running_customer_spending,

    AVG(total_amount) OVER (
        PARTITION BY customer_id
    ) AS average_order_amount,

    COUNT(*) OVER (
        PARTITION BY customer_id
    ) AS total_customer_orders

FROM orders;
```

This single query calculates:

- Order sequence.
- Previous order amount.
- Next order amount.
- Running customer spending.
- Average order amount.
- Total customer order count.

No GROUP BY is required because individual order rows must remain in the output.

---

## 14. Important Performance Considerations

Window functions can be computationally expensive on large datasets.

### 14.1 Index the partition and ordering columns

For this query:

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    LAG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    )

FROM orders;
```

A potentially useful index is:

```sql
CREATE INDEX idx_orders_customer_created_order
ON orders (customer_id, created_at, order_id);
```

This index aligns with the partition and ordering columns.

However, an index does not guarantee PostgreSQL will avoid sorting. The planner chooses the execution strategy based on the query and available statistics.

### 14.2 Filter rows before calculating windows when appropriate

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    ROW_NUMBER() OVER (
        PARTITION BY customer_id
        ORDER BY created_at DESC, order_id DESC
    ) AS rn

FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-01-01 00:00:00+00';
```

This calculates row numbers only for the filtered rows.

Be careful: filtering changes the population being ranked. If you need the latest order across all history, filtering to a recent date range first can produce an incorrect answer.

### 14.3 Avoid unnecessary repeated calculations

Use named windows or CTEs when they make the query easier to understand and maintain.

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    SUM(total_amount) OVER customer_window
        AS customer_total,

    AVG(total_amount) OVER customer_window
        AS customer_average

FROM orders

WINDOW customer_window AS (
    PARTITION BY customer_id
);
```

### 14.4 Inspect query execution

```sql
EXPLAIN ANALYZE
SELECT
    order_id,
    customer_id,
    total_amount,

    ROW_NUMBER() OVER (
        PARTITION BY customer_id
        ORDER BY created_at DESC, order_id DESC
    ) AS rn

FROM orders;
```

Check:

- Sort operations.
- Actual execution time.
- Rows processed.
- Sequential scans versus index scans.
- Memory usage and disk spills where reported.

Detailed query optimization is covered in Part 13.

---

## 15. Common Mistakes

| Mistake                                                              | Correct understanding                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| Filtering a window function directly in WHERE                        | Use a CTE or derived table                               |
| Forgetting PARTITION BY                                              | Calculations may span unrelated groups                   |
| Forgetting a deterministic tie-breaker                               | Results can vary when ordering values tie                |
| Using RANK instead of DENSE_RANK for distinct positions              | RANK leaves gaps                                         |
| Using LAST_VALUE without considering the frame                       | It may return the current row's value                    |
| Assuming LAG skips NULL values                                       | PostgreSQL's standard LAG behavior respects NULL values  |
| Filtering records before ranking without considering the requirement | The ranking population changes                           |
| Using ROW_NUMBER to identify all tied top records                    | Use RANK or DENSE_RANK when ties must be preserved       |
| Assuming indexes always eliminate window sorting                     | The execution planner decides whether an index is useful |

---

## 16. Practice Exercises

Use the TechBazaar database.

1. Find the latest order for every customer.
2. Find the first order for every customer.
3. Find the top three revenue-generating products in each category.
4. Find all products tied within the top three revenue ranks in each category.
5. Calculate running spending for every customer.
6. Calculate the time gap between consecutive customer orders.
7. Find customers with more than 30 days between consecutive orders.
8. Identify orders whose amounts increased compared with the previous order.
9. Calculate each employee's salary contribution to department salary.
10. Find the second-highest distinct salary in each department.
11. Identify duplicate customer emails using COUNT() OVER().
12. Identify duplicate customer records using ROW_NUMBER().
13. Calculate the cumulative percentage of company revenue.
14. Find customers with at least three consecutive days of order activity.
15. Find the first and last order IDs for every customer.
16. Calculate the next and previous payment amount for each order.
17. Build a single query combining ROW_NUMBER, LAG, LEAD, SUM and AVG.
18. Explain why filtering before a ranking operation can change the result.
19. Suggest an index for a query partitioned by customer_id and ordered by created_at.
20. Use EXPLAIN ANALYZE to inspect a query containing ROW_NUMBER().

---

## 17. Interview Questions

**Q1. How do you find the latest record for each customer?**

Use ROW_NUMBER() partitioned by customer and ordered by the timestamp descending. Filter for row number 1.

**Q2. How do you find the top three products in each category?**

Calculate product revenue, apply ROW_NUMBER() or RANK() partitioned by category, and filter the result.

**Q3. How do you calculate a running account balance?**

Use SUM() OVER() with CASE to convert credits and debits into positive and negative amounts.

**Q4. How do you compare consecutive transactions?**

Use LAG() to retrieve the previous transaction value and compare it with the current value.

**Q5. How do you detect gaps between user activities?**

Use LAG() to retrieve the previous activity timestamp and subtract it from the current timestamp.

**Q6. How do you find the second-highest distinct salary?**

Use DENSE_RANK() ordered by salary descending and filter for rank 2.

**Q7. How do you identify duplicates without GROUP BY?**

Use COUNT() OVER(PARTITION BY duplicate_column) and filter for counts greater than one.

**Q8. How do you calculate percentage contribution within a department?**

Divide each employee's salary by SUM(salary) OVER(PARTITION BY department_id).

**Q9. What is the gaps-and-islands problem?**

It identifies consecutive sequences of records and separates them into groups when gaps occur.

**Q10. How can you identify consecutive activity dates?**

Use ROW_NUMBER() over ordered distinct dates and subtract the row number from each date to generate a common group key.

**Q11. Can you filter a window function in WHERE?**

No. Use a CTE, derived table or another outer query.

**Q12. Can multiple window functions be used in one SELECT?**

Yes. Multiple window functions can calculate different metrics over the same or different window definitions.

**Q13. Do window functions always require indexes?**

No. Indexes can improve some execution plans, but their usefulness depends on the query, table size, data distribution and planner decisions.

**Q14. What is the difference between GROUP BY and window functions?**

GROUP BY combines rows into groups and produces fewer rows. Window functions calculate across related rows while preserving individual rows.

**Q15. What is the difference between ROW_NUMBER() and DISTINCT ON in PostgreSQL?**

Both can retrieve one row per group. DISTINCT ON is PostgreSQL-specific and concise, while ROW_NUMBER() is more flexible for ranking and selecting multiple rows per group.

---

## Key Takeaways

- Advanced window problems combine aggregation, ranking, navigation and filtering.
- Use ROW_NUMBER() to select the latest or first record per group.
- Use RANK() and DENSE_RANK() when tied positions matter.
- Use LAG() and LEAD() to compare consecutive records.
- Use SUM() OVER() for running balances and cumulative totals.
- Use COUNT() OVER() to identify duplicates without collapsing rows.
- Use date arithmetic and ROW_NUMBER() to solve gaps-and-islands problems.
- Use CTEs or derived tables to filter window function results.
- Use explicit window frames when the calculation depends on a specific set of rows.
- Indexes can help with partitioning and ordering, but always inspect the execution plan.
- Understand the business requirement before choosing a ranking or navigation function.
