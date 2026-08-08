---
sidebar_label: "Window Function Fundamentals"
sidebar_position: 1
---

# Window Function Fundamentals

## 1. What are Window Functions?

A **Window Function** performs calculations across a set of related rows while preserving individual rows in the result.

Unlike GROUP BY, which combines rows into groups, window functions calculate values without reducing the number of output rows.

Common use cases:

- Ranking employees by salary.
- Calculating running totals.
- Finding average sales per customer.
- Comparing current and previous transactions.
- Calculating cumulative revenue.
- Finding top-performing products.
- Analyzing customer purchase patterns.

### Basic syntax

```sql
SELECT
    column_name,
    window_function() OVER (
        PARTITION BY column_name
        ORDER BY column_name
    ) AS result
FROM table_name;
```

The `OVER()` clause defines the window of rows used by the function.

---

## 2. GROUP BY vs Window Functions

This is the most important distinction.

### Using GROUP BY

```sql
SELECT
    department_id,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;
```

Example result:

| department_id | avg_salary |
| ------------: | ---------: |
|             1 |      70000 |
|             2 |      50000 |
|             3 |      60000 |

GROUP BY returns one row per department.

### Using a Window Function

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    AVG(salary) OVER (
        PARTITION BY department_id
    ) AS avg_department_salary

FROM employees;
```

Example result:

| employee_name | department_id | salary | avg_department_salary |
| ------------- | ------------: | -----: | --------------------: |
| Rahul         |             1 |  50000 |                 70000 |
| Amit          |             1 |  70000 |                 70000 |
| Priya         |             1 |  90000 |                 70000 |
| Neha          |             2 |  40000 |                 50000 |
| Karan         |             2 |  60000 |                 50000 |

Every employee row remains in the result.

### Comparison

| GROUP BY                                                                       | Window Function                                               |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Combines rows into groups                                                      | Preserves individual rows                                     |
| Reduces result rows                                                            | Usually returns the same number of rows as its input          |
| Uses aggregate functions                                                       | Uses aggregate, ranking and navigation functions              |
| Does not provide individual rows alongside aggregates without additional logic | Can display individual values and group calculations together |

**Mental model:**

- GROUP BY: Calculate something for each group.
- Window Function: Calculate something for each row using its related rows.

---

## 3. Understanding OVER()

`OVER()` tells PostgreSQL that a function should operate as a window function.

### Example: Company-wide average salary

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    AVG(salary) OVER () AS company_avg_salary

FROM employees;
```

Every employee receives the same company-wide average salary.

### Example: Company-wide total salary

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    SUM(salary) OVER () AS company_total_salary

FROM employees;
```

### Important

An empty `OVER()` means the window contains all rows in the query's input.

Without PARTITION BY or ORDER BY, the calculation is performed over the entire window.

---

## 4. Understanding PARTITION BY

`PARTITION BY` divides rows into separate logical groups for window calculations.

It is similar to GROUP BY in how it identifies groups, but it does not collapse their rows.

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

### Example: Total salary per department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    SUM(salary) OVER (
        PARTITION BY department_id
    ) AS department_total_salary

FROM employees;
```

### Multiple partition columns

You can partition by more than one column.

```sql
SELECT
    employee_id,
    department_id,
    status,
    salary,

    AVG(salary) OVER (
        PARTITION BY department_id, status
    ) AS avg_salary

FROM employees;
```

This calculates average salary separately for each department-status combination.

### PARTITION BY vs GROUP BY

| PARTITION BY                                 | GROUP BY                               |
| -------------------------------------------- | -------------------------------------- |
| Divides rows into logical windows            | Groups rows into result groups         |
| Preserves individual rows                    | Reduces rows                           |
| Used inside OVER()                           | Used directly in SELECT                |
| Supports ranking and navigation calculations | Primarily used for grouped aggregation |

---

## 5. Understanding ORDER BY Inside OVER()

`ORDER BY` inside `OVER()` defines the ordering of rows within the window.

It is important for:

- Ranking.
- Running totals.
- Previous and next row calculations.
- Cumulative averages.
- Moving calculations.

### Example: Rank employees by salary

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    ROW_NUMBER() OVER (
        ORDER BY salary DESC
    ) AS salary_position

FROM employees;
```

The highest salary receives position 1.

**Important:** ORDER BY inside OVER() does not guarantee the final output order.

Use an outer ORDER BY when you need sorted results.

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    ROW_NUMBER() OVER (
        ORDER BY salary DESC
    ) AS salary_position

FROM employees
ORDER BY salary DESC, employee_id;
```

---

## 6. Combining PARTITION BY and ORDER BY

You can partition rows and order them within each partition.

### Example: Rank employees within each department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    ROW_NUMBER() OVER (
        PARTITION BY department_id
        ORDER BY salary DESC, employee_id
    ) AS department_rank

FROM employees;
```

Example result:

| employee_name | department_id | salary | department_rank |
| ------------- | ------------: | -----: | --------------: |
| Priya         |             1 |  90000 |               1 |
| Amit          |             1 |  70000 |               2 |
| Rahul         |             1 |  50000 |               3 |
| Karan         |             2 |  60000 |               1 |
| Neha          |             2 |  40000 |               2 |

Each department gets its own ranking.

---

## 7. Aggregate Functions as Window Functions

Many aggregate functions can also operate as window functions.

Common examples:

| Function  | Purpose                        |
| --------- | ------------------------------ |
| `SUM()`   | Calculates total               |
| `AVG()`   | Calculates average             |
| `COUNT()` | Counts rows or non-NULL values |
| `MIN()`   | Finds minimum                  |
| `MAX()`   | Finds maximum                  |

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

Every order remains in the result, with its customer's total spending.

### Example: Average order amount per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    AVG(total_amount) OVER (
        PARTITION BY customer_id
    ) AS customer_avg_order_amount

FROM orders;
```

### Example: Number of orders per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    COUNT(*) OVER (
        PARTITION BY customer_id
    ) AS total_orders

FROM orders;
```

Detailed aggregate window calculations are covered in Part 11B.

---

## 8. Window Functions Without PARTITION BY

When PARTITION BY is omitted, all rows belong to one window.

### Example: Company-wide average salary

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    AVG(salary) OVER () AS company_avg_salary

FROM employees;
```

### Example: Company-wide employee count

```sql
SELECT
    employee_id,
    employee_name,

    COUNT(*) OVER () AS total_employees

FROM employees;
```

This is useful when every row needs a global statistic.

---

## 9. Named Windows Using WINDOW Clause

PostgreSQL allows you to define a named window and reuse it.

This is useful when several window functions share the same partitioning and ordering rules.

### Example

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    AVG(salary) OVER department_window AS avg_salary,

    MAX(salary) OVER department_window AS max_salary,

    MIN(salary) OVER department_window AS min_salary

FROM employees

WINDOW department_window AS (
    PARTITION BY department_id
);
```

Instead of repeating the same window definition, you define it once.

### Named window with ordering

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    SUM(total_amount) OVER customer_window AS running_total

FROM orders

WINDOW customer_window AS (
    PARTITION BY customer_id
    ORDER BY created_at, order_id
);
```

Named windows improve readability when multiple calculations use the same window specification.

---

## 10. Window Functions and Filtering

PostgreSQL does not allow window functions directly in WHERE.

### Incorrect

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    ROW_NUMBER() OVER (
        ORDER BY salary DESC
    ) AS salary_rank

FROM employees
WHERE salary_rank <= 5;
```

This fails because the window calculation is not available at the WHERE processing stage.

### Correct: Use a CTE

```sql
WITH employee_rankings AS (
    SELECT
        employee_id,
        employee_name,
        salary,

        ROW_NUMBER() OVER (
            ORDER BY salary DESC
        ) AS salary_rank

    FROM employees
)

SELECT *
FROM employee_rankings
WHERE salary_rank <= 5;
```

### Alternative: Use a derived table

```sql
SELECT *
FROM (
    SELECT
        employee_id,
        employee_name,
        salary,

        ROW_NUMBER() OVER (
            ORDER BY salary DESC
        ) AS salary_rank

    FROM employees
) AS employee_rankings
WHERE salary_rank <= 5;
```

The outer query can filter the calculated window result.

---

## 11. Window Functions vs Aggregate Functions

An aggregate function can operate in two different ways.

### Normal aggregate

```sql
SELECT
    department_id,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;
```

Returns one row per department.

### Aggregate window function

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    AVG(salary) OVER (
        PARTITION BY department_id
    ) AS avg_salary

FROM employees;
```

Returns every employee with their department average.

### Important distinction

`AVG(salary)` is an aggregate expression.

`AVG(salary) OVER (...)` is an aggregate window function.

The OVER clause changes how the aggregate operates.

---

## 12. Important Window Function Concepts

### 12.1 Window

A window is the set of rows considered by a window function for the current row.

### 12.2 Partition

A partition is a logical group of rows inside a window.

### 12.3 Ordering

Ordering determines the sequence of rows inside a partition.

### 12.4 Frame

A window frame defines which rows within the ordered partition participate in a particular calculation.

Example:

```sql
SUM(total_amount) OVER (
    PARTITION BY customer_id
    ORDER BY created_at, order_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
```

This calculates a running total for each customer.

Window frames are covered in more detail in Part 11B.

---

## 13. Logical Query Processing and Window Functions

A simplified logical processing order is:

1. FROM and JOIN
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT expressions, including window functions
6. DISTINCT
7. ORDER BY
8. LIMIT / OFFSET

This explains why:

- WHERE cannot directly filter window results.
- HAVING filters groups before window calculations.
- An outer query or CTE is needed to filter window results.

This is a conceptual logical order, not a guarantee of the database's physical execution sequence.

---

## 14. Common Mistakes

| Mistake                                            | Correct understanding                                       |
| -------------------------------------------------- | ----------------------------------------------------------- |
| Confusing GROUP BY with PARTITION BY               | GROUP BY collapses rows; PARTITION BY preserves them        |
| Assuming OVER() requires PARTITION BY              | Empty OVER() is valid                                       |
| Assuming ORDER BY inside OVER() sorts final output | Use outer ORDER BY for final ordering                       |
| Using a window alias in WHERE                      | Use a CTE or derived table                                  |
| Forgetting PARTITION BY                            | Without it, all input rows share one partition              |
| Assuming all window functions need ORDER BY        | Some calculations need only partitioning                    |
| Assuming ORDER BY always means running total       | The default frame can affect aggregate results              |
| Forgetting a unique tie-breaker                    | Ranking and row ordering can be nondeterministic among ties |

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Display all employees with the company-wide average salary.
2. Display all employees with their department's average salary.
3. Display all employees with their department's total salary.
4. Display all employees with their department's employee count.
5. Calculate total spending per customer without reducing order rows.
6. Calculate average order value per customer.
7. Rank employees by salary across the entire company using ROW_NUMBER().
8. Rank employees by salary within each department.
9. Create a query using multiple window functions over the same named window.
10. Find the five highest-paid employees using a CTE and ROW_NUMBER().
11. Find employees earning above their department average using a window function.
12. Compare GROUP BY and PARTITION BY using the same dataset.
13. Explain why window functions cannot be directly used in WHERE.
14. Explain the difference between ORDER BY inside OVER() and outer ORDER BY.
15. Experiment with a window aggregate using ORDER BY and inspect its default frame behavior.

---

## 16. Interview Questions

**Q1. What is a window function?**

A function that calculates a result across related rows while preserving individual rows.

**Q2. What is the purpose of OVER()?**

It defines the window over which the function operates.

**Q3. What is PARTITION BY?**

It divides rows into logical groups for window calculations without collapsing them.

**Q4. What is the difference between GROUP BY and PARTITION BY?**

GROUP BY reduces rows into groups. PARTITION BY preserves individual rows.

**Q5. Can aggregate functions be used as window functions?**

Yes. Functions such as SUM, AVG, COUNT, MIN and MAX support OVER().

**Q6. Does ORDER BY inside OVER() sort the final result?**

No. It controls the order within the window. Use an outer ORDER BY for final result ordering.

**Q7. Can window functions be used directly in WHERE?**

No. Use a CTE or derived table to filter their results.

**Q8. What happens if PARTITION BY is omitted?**

All input rows belong to one partition.

**Q9. What is a named window?**

A reusable window definition created using the WINDOW clause.

**Q10. What is a window frame?**

The subset of rows within a partition that participates in a window calculation for the current row.

**Q11. Can multiple window functions use the same window definition?**

Yes. Use a named window or repeat the same OVER specification.

**Q12. Are window functions always faster than GROUP BY?**

They solve different problems. Performance depends on the query and execution plan.

---

## Key Takeaways

- Window functions calculate across related rows without collapsing individual rows.
- OVER() defines the window.
- PARTITION BY divides rows into logical groups.
- ORDER BY defines ordering inside the window.
- Aggregate functions such as SUM, AVG and COUNT can be used as window functions.
- GROUP BY reduces rows; window functions preserve them.
- Named windows allow reusable window definitions.
- Window functions cannot be directly filtered in WHERE.
- Use a CTE or derived table to filter window results.
- Window frames determine which rows participate in ordered window calculations.
