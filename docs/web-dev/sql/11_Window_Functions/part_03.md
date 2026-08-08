---
sidebar_label: "Ranking Window Functions"
sidebar_position: 1
---

# Ranking Window Functions

## 1. Introduction

Ranking window functions assign a rank or position to rows within a result set or partition.

They are commonly used for:

- Finding top-performing employees.
- Ranking products by sales.
- Identifying top customers.
- Finding the highest-paid employees in each department.
- Generating leaderboards.
- Finding top N records per group.

PostgreSQL provides these ranking functions:

| Function         | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `ROW_NUMBER()`   | Assigns a unique sequential number to every row    |
| `RANK()`         | Assigns ranks, leaving gaps after ties             |
| `DENSE_RANK()`   | Assigns ranks without gaps after ties              |
| `NTILE(n)`       | Divides rows into approximately equal-sized groups |
| `PERCENT_RANK()` | Calculates the relative rank of a row              |
| `CUME_DIST()`    | Calculates the cumulative distribution of a row    |

All these functions require an `OVER()` clause.

---

## 2. ROW_NUMBER()

`ROW_NUMBER()` assigns a unique sequential number to every row within a partition.

Syntax:

```sql
ROW_NUMBER() OVER (
    PARTITION BY column_name
    ORDER BY column_name
)
```

### Example: Rank employees by salary

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    ROW_NUMBER() OVER (
        ORDER BY salary DESC
    ) AS row_num

FROM employees;
```

Example result:

| employee_name | salary | row_num |
| ------------- | -----: | ------: |
| Aman          |  90000 |       1 |
| Rahul         |  80000 |       2 |
| Priya         |  80000 |       3 |
| Neha          |  70000 |       4 |

Even when two employees have the same salary, they receive different row numbers.

**Important:** If the ORDER BY values are tied, their relative row-number order is not guaranteed. Add a unique tie-breaker for deterministic results.

```sql
ROW_NUMBER() OVER (
    ORDER BY salary DESC, employee_id ASC
)
```

### Example: Number employees separately in each department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    ROW_NUMBER() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC, employee_id
    ) AS department_row_num

FROM employees;
```

The numbering restarts for every department.

---

## 3. RANK()

`RANK()` assigns the same rank to rows with equal ordering values.

However, it leaves gaps after tied ranks.

### Example

```sql
SELECT
    employee_name,
    salary,

    RANK() OVER (
        ORDER BY salary DESC
    ) AS salary_rank

FROM employees;
```

Example result:

| employee_name | salary | salary_rank |
| ------------- | -----: | ----------: |
| Aman          |  90000 |           1 |
| Rahul         |  80000 |           2 |
| Priya         |  80000 |           2 |
| Neha          |  70000 |           4 |
| Karan         |  60000 |           5 |

Notice:

- Aman gets rank 1.
- Rahul and Priya both get rank 2.
- Neha gets rank 4, not 3.

The next rank accounts for the number of rows tied at the previous rank.

### When to use RANK()

Use it when tied positions should share the same rank and subsequent positions should reflect skipped places.

Example: Competition leaderboard.

---

## 4. DENSE_RANK()

`DENSE_RANK()` also assigns the same rank to tied rows, but does not leave gaps.

### Example

```sql
SELECT
    employee_name,
    salary,

    DENSE_RANK() OVER (
        ORDER BY salary DESC
    ) AS dense_salary_rank

FROM employees;
```

Example result:

| employee_name | salary | dense_salary_rank |
| ------------- | -----: | ----------------: |
| Aman          |  90000 |                 1 |
| Rahul         |  80000 |                 2 |
| Priya         |  80000 |                 2 |
| Neha          |  70000 |                 3 |
| Karan         |  60000 |                 4 |

### When to use DENSE_RANK()

Use it when you want to rank distinct salary values or scores without gaps.

Example: Find the second-highest distinct salary.

---

## 5. ROW_NUMBER vs RANK vs DENSE_RANK

This is one of the most important interview concepts.

Suppose the salaries are:

| Employee | Salary |
| -------- | -----: |
| A        | 100000 |
| B        |  90000 |
| C        |  90000 |
| D        |  80000 |
| E        |  70000 |

Comparison:

| Employee | Salary | ROW_NUMBER | RANK | DENSE_RANK |
| -------- | -----: | ---------: | ---: | ---------: |
| A        | 100000 |          1 |    1 |          1 |
| B        |  90000 |          2 |    2 |          2 |
| C        |  90000 |          3 |    2 |          2 |
| D        |  80000 |          4 |    4 |          3 |
| E        |  70000 |          5 |    5 |          4 |

**Remember:**

- `ROW_NUMBER()` → Every row gets a unique number.
- `RANK()` → Ties share ranks; gaps are left.
- `DENSE_RANK()` → Ties share ranks; no gaps.

---

## 6. PARTITION BY with Ranking Functions

PARTITION BY divides rows into independent groups.

Ranking starts again inside each partition.

### Example: Rank employees by salary within each department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    RANK() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC
    ) AS department_salary_rank

FROM employees;
```

Example result:

| Employee | Department | Salary | Rank |
| -------- | ---------: | -----: | ---: |
| Aman     |          1 |  90000 |    1 |
| Rahul    |          1 |  80000 |    2 |
| Priya    |          1 |  80000 |    2 |
| Neha     |          2 |  85000 |    1 |
| Karan    |          2 |  75000 |    2 |

Each department has an independent ranking.

---

## 7. Finding Top N Records Per Group

This is one of the most common real-world uses of ranking functions.

You cannot directly use a window function in WHERE because window functions are evaluated after WHERE.

Use a CTE or derived table.

### Example: Find the top 3 highest-paid employees in each department

```sql
WITH ranked_employees AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,

        ROW_NUMBER() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC, employee_id
        ) AS rn

    FROM employees
)

SELECT *
FROM ranked_employees
WHERE rn <= 3;
```

### Why use ROW_NUMBER()?

It returns at most three employees per department.

If salaries are tied, the employee ID provides a deterministic order.

### Alternative: Include all employees tied within the top 3 rank positions

```sql
WITH ranked_employees AS (
    SELECT
        employee_id,
        employee_name,
        department_id,
        salary,

        RANK() OVER (
            PARTITION BY department_id
            ORDER BY salary DESC
        ) AS salary_rank

    FROM employees
)

SELECT *
FROM ranked_employees
WHERE salary_rank <= 3;
```

This can return more than three employees per department if there are ties.

### Alternative: Top 3 distinct salary levels

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
        ) AS salary_level_rank

    FROM employees
)

SELECT *
FROM ranked_employees
WHERE salary_level_rank <= 3;
```

This returns employees whose salaries fall within the top three distinct salary levels in each department.

---

## 8. NTILE(n)

`NTILE(n)` distributes rows into `n` approximately equal-sized buckets.

Syntax:

```sql
NTILE(number_of_buckets) OVER (
    ORDER BY column_name
)
```

### Example: Divide employees into four salary groups

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    NTILE(4) OVER (
        ORDER BY salary DESC, employee_id
    ) AS salary_quartile

FROM employees;
```

Possible output:

| Employee | Salary | Salary quartile |
| -------- | -----: | --------------: |
| A        | 100000 |               1 |
| B        |  90000 |               1 |
| C        |  85000 |               2 |
| D        |  80000 |               2 |
| E        |  75000 |               3 |
| F        |  70000 |               4 |

The exact bucket sizes depend on the number of rows.

### Important behavior

If there are 10 rows and you use `NTILE(4)`, PostgreSQL distributes them as evenly as possible:

| Bucket | Number of rows |
| ------ | -------------: |
| 1      |              3 |
| 2      |              3 |
| 3      |              2 |
| 4      |              2 |

Larger buckets are assigned first.

### Use cases

- Dividing customers into spending groups.
- Segmenting employees by salary.
- Dividing products into performance tiers.
- Creating quartile-based analytics.

---

## 9. PERCENT_RANK()

`PERCENT_RANK()` calculates the relative rank of a row within a partition.

Formula:

\[
\text{PERCENT_RANK}
=
\frac{\text{RANK} - 1}{\text{Total Rows} - 1}
\]

The result ranges from 0 to 1.

### Example

```sql
SELECT
    employee_name,
    salary,

    PERCENT_RANK() OVER (
        ORDER BY salary
    ) AS salary_percent_rank

FROM employees;
```

Example result:

| Employee | Salary | Rank | Percent rank |
| -------- | -----: | ---: | -----------: |
| A        |  50000 |    1 |         0.00 |
| B        |  60000 |    2 |         0.25 |
| C        |  70000 |    3 |         0.50 |
| D        |  80000 |    4 |         0.75 |
| E        |  90000 |    5 |         1.00 |

### Important points

- Lowest-ranked row gets 0.
- Highest-ranked row generally gets 1.
- Tied rows receive the same result.
- A partition containing only one row returns 0.

### Use case

Understand how an employee's salary ranks relative to other employees in the department.

```sql
SELECT
    employee_name,
    department_id,
    salary,

    PERCENT_RANK() OVER (
        PARTITION BY department_id
        ORDER BY salary
    ) AS department_percent_rank

FROM employees;
```

---

## 10. CUME_DIST()

`CUME_DIST()` calculates the cumulative distribution of a row.

It represents the proportion of rows whose ordering values are less than or equal to the current row's ordering value.

Formula:

\[
\text{CUME_DIST}
=
\frac{\text{Number of rows preceding or tied with current row}}
{\text{Total rows in partition}}
\]

### Example

```sql
SELECT
    employee_name,
    salary,

    CUME_DIST() OVER (
        ORDER BY salary
    ) AS salary_cumulative_distribution

FROM employees;
```

Example result:

| Employee | Salary | CUME_DIST |
| -------- | -----: | --------: |
| A        |  50000 |      0.20 |
| B        |  60000 |      0.40 |
| C        |  70000 |      0.60 |
| D        |  80000 |      0.80 |
| E        |  90000 |      1.00 |

### Example with ties

Suppose salaries are:

| Employee | Salary |
| -------- | -----: |
| A        |  50000 |
| B        |  60000 |
| C        |  60000 |
| D        |  80000 |

Query:

```sql
SELECT
    employee_name,
    salary,

    CUME_DIST() OVER (
        ORDER BY salary
    ) AS cumulative_distribution

FROM employees;
```

Result:

| Employee | Salary | CUME_DIST |
| -------- | -----: | --------: |
| A        |  50000 |      0.25 |
| B        |  60000 |      0.75 |
| C        |  60000 |      0.75 |
| D        |  80000 |      1.00 |

Both employees earning 60000 receive 0.75 because three of the four rows have salary less than or equal to 60000.

---

## 11. PERCENT_RANK vs CUME_DIST

Both functions return values between 0 and 1, but their calculations differ.

| PERCENT_RANK                             | CUME_DIST                                      |
| ---------------------------------------- | ---------------------------------------------- |
| Based on RANK()                          | Based on cumulative number of rows             |
| Formula: `(rank - 1) / (total rows - 1)` | Formula: `rows preceding or tied / total rows` |
| Lowest rank gets 0                       | Lowest value gets at least `1 / total rows`    |
| Highest rank generally gets 1            | Highest value gets 1                           |
| Tied rows receive the same result        | Tied rows receive the same result              |

### Example

For four rows with distinct values:

| Value | PERCENT_RANK | CUME_DIST |
| ----: | -----------: | --------: |
|    10 |         0.00 |      0.25 |
|    20 |         0.33 |      0.50 |
|    30 |         0.67 |      0.75 |
|    40 |         1.00 |      1.00 |

Use:

- `PERCENT_RANK()` to understand relative rank position.
- `CUME_DIST()` to understand the cumulative proportion of rows at or below a value when ordering ascending.

---

## 12. Combining Ranking Functions

You can use multiple ranking functions in one query.

### Example: Employee salary analytics

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
    ) AS dense_salary_rank,

    NTILE(4) OVER (
        PARTITION BY department_id
        ORDER BY salary DESC, employee_id
    ) AS salary_quartile

FROM employees;
```

This query calculates four different rankings for every employee.

---

## 13. Ranking Products by Revenue

A practical e-commerce example.

First calculate revenue per product from `order_items`.

```sql
WITH product_revenue AS (
    SELECT
        product_id,
        SUM(quantity * unit_price) AS total_revenue

    FROM order_items
    GROUP BY product_id
)

SELECT
    product_id,
    total_revenue,

    RANK() OVER (
        ORDER BY total_revenue DESC
    ) AS revenue_rank

FROM product_revenue;
```

### Rank products within categories

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
        DENSE_RANK() OVER (
            PARTITION BY category_id
            ORDER BY total_revenue DESC
        ) AS category_revenue_rank

    FROM product_revenue
)

SELECT *
FROM ranked_products
WHERE category_revenue_rank <= 3;
```

This returns products in the top three distinct revenue ranks within each category.

**Note:** This example ranks products that have at least one matching order item. To include products with no sales, use a LEFT JOIN and handle NULL revenue with `COALESCE`.

---

## 14. Important Rules and Common Mistakes

| Mistake                                                              | Correct understanding                           |
| -------------------------------------------------------------------- | ----------------------------------------------- |
| Using a window function directly in WHERE                            | Use a CTE or derived table                      |
| Assuming ROW_NUMBER preserves ties                                   | It always assigns unique numbers                |
| Assuming RANK has no gaps                                            | Ties create gaps in subsequent ranks            |
| Assuming DENSE_RANK assigns unique ranks                             | Tied rows share ranks                           |
| Adding a unique tie-breaker to RANK ordering when ties should remain | It breaks the ties and produces different ranks |
| Assuming NTILE always creates equal-sized buckets                    | Bucket sizes differ by at most one row          |
| Confusing PERCENT_RANK and CUME_DIST                                 | Their formulas and interpretations differ       |
| Forgetting PARTITION BY                                              | Ranking may happen across the entire result     |
| Assuming window ORDER BY sorts final output                          | Use an outer ORDER BY for presentation          |

### Important: Ranking and ties

Consider:

```sql
RANK() OVER (
    ORDER BY salary DESC, employee_id
)
```

If employee IDs are unique, no two rows tie on the complete ordering criteria.

If you want employees with equal salaries to share ranks, use:

```sql
RANK() OVER (
    ORDER BY salary DESC
)
```

You can still use an outer ORDER BY for deterministic display:

```sql
ORDER BY salary DESC, employee_id;
```

The window ordering and final result ordering serve different purposes.

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Assign a unique row number to every employee based on salary, highest first.
2. Rank employees by salary across the entire company.
3. Rank employees by salary within each department.
4. Compare ROW_NUMBER(), RANK() and DENSE_RANK() using employees with equal salaries.
5. Find the highest-paid employee in each department.
6. Find the top three employees in every department using ROW_NUMBER().
7. Find all employees tied within the top three rank positions in each department.
8. Find employees earning the second-highest distinct salary in each department.
9. Divide employees into four salary groups using NTILE(4).
10. Calculate each employee's PERCENT_RANK within their department.
11. Calculate each employee's CUME_DIST within their department.
12. Rank products by total revenue.
13. Find the top three revenue-ranked products in each category.
14. Rank customers by their total order spending.
15. Divide customers into five spending groups using NTILE(5).
16. Explain why adding employee_id to the RANK() window ordering can change tie behavior.
17. Explain the difference between filtering `ROW_NUMBER() <= 3` and `RANK() <= 3`.

---

## 16. Interview Questions

**Q1. What are ranking window functions?**

Functions that assign positions or relative rankings to rows without collapsing the result set.

**Q2. What is the difference between ROW_NUMBER(), RANK() and DENSE_RANK()?**

ROW_NUMBER assigns unique sequential numbers. RANK gives tied rows the same rank and leaves gaps. DENSE_RANK gives tied rows the same rank without gaps.

**Q3. How do you find the top three employees in every department?**

Use ROW_NUMBER() partitioned by department and filter the result to row numbers less than or equal to three.

**Q4. How do you include all employees tied at the third rank?**

Use RANK() and filter ranks less than or equal to three.

**Q5. How do you find the second-highest distinct salary?**

Use DENSE_RANK() ordered by salary descending and filter for rank 2.

**Q6. What does NTILE(4) do?**

Divides rows into four approximately equal-sized buckets.

**Q7. What does PERCENT_RANK() return?**

A relative rank value calculated using `(rank - 1) / (total rows - 1)`.

**Q8. What does CUME_DIST() return?**

The proportion of rows preceding or tied with the current row, including the current peer group.

**Q9. Can ranking functions be used in WHERE?**

Not directly. Use a CTE or derived table.

**Q10. Do ranking functions require a window frame?**

No. Ranking functions use partitioning and ordering; frame specifications do not determine their ranking behavior.

**Q11. What happens if ORDER BY is omitted?**

The ordering is unspecified. For ranking functions, use ORDER BY to define meaningful rankings.

**Q12. How can you make ROW_NUMBER deterministic?**

Add a unique tie-breaker, such as the primary key, to the window ORDER BY.

---

## Key Takeaways

- `ROW_NUMBER()` assigns a unique sequential number to each row.
- `RANK()` gives ties the same rank and leaves gaps.
- `DENSE_RANK()` gives ties the same rank without gaps.
- `NTILE(n)` divides rows into approximately equal-sized groups.
- `PERCENT_RANK()` calculates relative rank.
- `CUME_DIST()` calculates cumulative distribution.
- `PARTITION BY` creates independent ranking groups.
- Use CTEs or derived tables to filter ranking results.
- Use ROW_NUMBER for a fixed maximum number of rows per group.
- Use RANK when tied positions should share competition ranks.
- Use DENSE_RANK when ranking distinct values without gaps.
- Add a unique tie-breaker to ROW_NUMBER for deterministic results, but do not add one to RANK or DENSE_RANK when you intend equal values to remain tied.
