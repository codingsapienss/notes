---
sidebar_label: "Navigation Window Functions"
sidebar_position: 1
---

# Navigation Window Functions

## 1. Introduction

Navigation window functions allow you to access values from other rows within the same result set or partition.

They are useful when you need to:

- Compare current and previous transactions.
- Find the next order or event.
- Track changes in employee salaries.
- Calculate differences between consecutive records.
- Identify first and last values in a group.
- Analyze user activity over time.

PostgreSQL provides these navigation functions:

| Function        | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `LAG()`         | Accesses a value from a preceding row                         |
| `LEAD()`        | Accesses a value from a following row                         |
| `FIRST_VALUE()` | Returns the first value in the window frame                   |
| `LAST_VALUE()`  | Returns the last value in the window frame                    |
| `NTH_VALUE()`   | Returns the value at a specified position in the window frame |

---

## 2. LAG()

`LAG()` accesses a value from a previous row without requiring a self-join.

Syntax:

```sql
LAG(expression, offset, default_value)
OVER (
    PARTITION BY column_name
    ORDER BY column_name
)
```

Parameters:

| Parameter       | Meaning                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `expression`    | Column or expression whose value you want                                        |
| `offset`        | Number of rows backward; defaults to 1                                           |
| `default_value` | Value returned when the requested preceding row does not exist; defaults to NULL |

### Example: Get the previous order amount

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    LAG(total_amount) OVER (
        ORDER BY created_at, order_id
    ) AS previous_order_amount

FROM orders;
```

Example result:

| order_id | total_amount | previous_order_amount |
| -------: | -----------: | --------------------: |
|      101 |         1000 |                  NULL |
|      102 |         2000 |                  1000 |
|      103 |         1500 |                  2000 |
|      104 |         3000 |                  1500 |

The first row has no preceding row, so the result is NULL.

### Example: Get the previous order for each customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    LAG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS previous_customer_order

FROM orders;
```

The previous value is calculated independently for each customer.

### Example: Get the amount from two orders earlier

```sql
SELECT
    order_id,
    total_amount,

    LAG(total_amount, 2) OVER (
        ORDER BY created_at, order_id
    ) AS amount_two_orders_ago

FROM orders;
```

### Example: Provide a default value

```sql
SELECT
    order_id,
    total_amount,

    LAG(total_amount, 1, 0) OVER (
        ORDER BY created_at, order_id
    ) AS previous_order_amount

FROM orders;
```

If no preceding row exists, PostgreSQL returns `0` instead of NULL.

**Important:** The default value is used only when the requested row does not exist. It does not replace NULL values stored in an existing row.

---

## 3. LEAD()

`LEAD()` accesses a value from a following row.

It is the opposite of LAG().

Syntax:

```sql
LEAD(expression, offset, default_value)
OVER (
    PARTITION BY column_name
    ORDER BY column_name
)
```

### Example: Get the next order amount

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    LEAD(total_amount) OVER (
        ORDER BY created_at, order_id
    ) AS next_order_amount

FROM orders;
```

Example result:

| order_id | total_amount | next_order_amount |
| -------: | -----------: | ----------------: |
|      101 |         1000 |              2000 |
|      102 |         2000 |              1500 |
|      103 |         1500 |              3000 |
|      104 |         3000 |              NULL |

The last row has no following row.

### Example: Get the next order for each customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    LEAD(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS next_customer_order

FROM orders;
```

### Example: Get the amount from two orders ahead

```sql
SELECT
    order_id,
    total_amount,

    LEAD(total_amount, 2) OVER (
        ORDER BY created_at, order_id
    ) AS amount_two_orders_ahead

FROM orders;
```

### LAG vs LEAD

| LAG                              | LEAD                             |
| -------------------------------- | -------------------------------- |
| Looks backward                   | Looks forward                    |
| Accesses preceding rows          | Accesses following rows          |
| Useful for previous transactions | Useful for upcoming transactions |
| Default offset is 1              | Default offset is 1              |

---

## 4. Practical Use Case — Comparing Consecutive Orders

Suppose you want to calculate the difference between an order and the customer's previous order.

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    LAG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS previous_amount,

    total_amount - LAG(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS amount_difference

FROM orders;
```

Example result:

| order_id | total_amount | previous_amount | amount_difference |
| -------: | -----------: | --------------: | ----------------: |
|      101 |         1000 |            NULL |              NULL |
|      102 |         2000 |            1000 |              1000 |
|      103 |         1500 |            2000 |              -500 |
|      104 |         3000 |            1500 |              1500 |

This identifies whether the order amount increased or decreased.

### Calculate percentage change

```sql
WITH order_comparison AS (
    SELECT
        order_id,
        customer_id,
        total_amount,

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

    ROUND(
        (
            (total_amount - previous_amount)
            / NULLIF(previous_amount, 0)
        ) * 100,
        2
    ) AS percentage_change

FROM order_comparison;
```

`NULLIF(previous_amount, 0)` prevents division by zero.

---

## 5. FIRST_VALUE()

`FIRST_VALUE()` returns the value from the first row of the current window frame.

Syntax:

```sql
FIRST_VALUE(expression)
OVER (
    PARTITION BY column_name
    ORDER BY column_name
    frame_clause
)
```

### Example: Get the highest-paid employee's name in each department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    FIRST_VALUE(employee_name) OVER (
        PARTITION BY department_id
        ORDER BY salary DESC, employee_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS highest_paid_employee

FROM employees;
```

Every employee in a department receives the name of that department's highest-paid employee.

### Example: Get the earliest order amount per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    FIRST_VALUE(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS first_order_amount

FROM orders;
```

**Important:** FIRST_VALUE() depends on the window frame. If the frame starts at UNBOUNDED PRECEDING, the first value is the first row in that partition.

---

## 6. LAST_VALUE()

`LAST_VALUE()` returns the value from the last row of the current window frame.

This function has an important PostgreSQL behavior that frequently causes confusion.

### Example

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    LAST_VALUE(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
    ) AS last_order_amount

FROM orders;
```

You might expect this to return the customer's final order amount for every row.

However, that is not what the default frame does.

When ORDER BY is specified, the default frame ends at CURRENT ROW and includes its peers.

Therefore, LAST_VALUE() generally returns the current row's value when the ordering is unique.

### Correct approach: Get the final order amount for every customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at,

    LAST_VALUE(total_amount) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS last_order_amount

FROM orders;
```

Now the frame includes the entire partition, so every row receives the final order amount.

**Remember:** When using LAST_VALUE() to get the final value in a partition, explicitly extend the frame to UNBOUNDED FOLLOWING.

---

## 7. NTH_VALUE()

`NTH_VALUE()` returns the value at a specified position within the current window frame.

Syntax:

```sql
NTH_VALUE(expression, n)
OVER (
    PARTITION BY column_name
    ORDER BY column_name
    frame_clause
)
```

Here, `n` is the position, starting from 1.

### Example: Get the second-highest salary in each department

```sql
SELECT
    employee_id,
    employee_name,
    department_id,
    salary,

    NTH_VALUE(salary, 2) OVER (
        PARTITION BY department_id
        ORDER BY salary DESC, employee_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS second_employee_salary

FROM employees;
```

Every employee receives the salary of the second employee in the department's ordered list.

**Important:** This returns the second row's salary, not necessarily the second-highest distinct salary. If multiple employees have the same highest salary, use DENSE_RANK() to identify the second-highest distinct salary.

### Example: Get the third order amount per customer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,

    NTH_VALUE(total_amount, 3) OVER (
        PARTITION BY customer_id
        ORDER BY created_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING
        AND UNBOUNDED FOLLOWING
    ) AS third_order_amount

FROM orders;
```

If a customer has fewer than three orders, the result is NULL.

---

## 8. Navigation Functions Comparison

| Function      | Direction / position | Example use           |
| ------------- | -------------------- | --------------------- |
| LAG()         | Previous row         | Previous order amount |
| LEAD()        | Next row             | Next transaction      |
| FIRST_VALUE() | First row in frame   | First order           |
| LAST_VALUE()  | Last row in frame    | Final order           |
| NTH_VALUE()   | Nth row in frame     | Third order           |

### Important distinction

`LAG()` and `LEAD()` access rows by offset in the partition. They do not use the window frame to limit their search.

`FIRST_VALUE()`, `LAST_VALUE()` and `NTH_VALUE()` are frame-sensitive.

---

## 9. Practical Example — Employee Salary Changes

Suppose you want to compare each employee's current salary with their previous salary.

The current `employees` schema does not contain salary history. To analyze salary changes over time, you would need a separate history table.

Proposed extension:

```sql
CREATE TABLE employee_salary_history (
    history_id BIGSERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(employee_id),
    salary NUMERIC(12, 2) NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL
);
```

### Compare current and previous recorded salary

```sql
SELECT
    employee_id,
    salary,
    effective_at,

    LAG(salary) OVER (
        PARTITION BY employee_id
        ORDER BY effective_at, history_id
    ) AS previous_salary

FROM employee_salary_history;
```

### Calculate salary increase or decrease

```sql
WITH salary_changes AS (
    SELECT
        employee_id,
        salary,
        effective_at,

        LAG(salary) OVER (
            PARTITION BY employee_id
            ORDER BY effective_at, history_id
        ) AS previous_salary

    FROM employee_salary_history
)

SELECT
    employee_id,
    salary,
    previous_salary,

    salary - previous_salary AS salary_difference

FROM salary_changes;
```

This is a common use case for LAG() in HR and payroll systems.

---

## 10. Navigation Functions with CTEs

Window functions cannot be directly used in WHERE.

Use a CTE or derived table to filter their results.

### Example: Find customers whose latest order is greater than their previous order

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
        ) AS previous_amount,

        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY created_at DESC, order_id DESC
        ) AS latest_order_rank

    FROM orders
)

SELECT
    customer_id,
    order_id,
    total_amount,
    previous_amount

FROM order_history

WHERE latest_order_rank = 1
  AND total_amount > previous_amount;
```

This returns customers whose latest order amount exceeds their previous order amount.

---

## 11. Common Mistakes

| Mistake                                                             | Correct understanding                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| Forgetting ORDER BY in LAG/LEAD                                     | The row sequence is undefined                           |
| Forgetting PARTITION BY                                             | Previous/next rows may come from another customer       |
| Assuming LAG default replaces NULL column values                    | Default applies only when the offset row does not exist |
| Assuming LAST_VALUE returns the final partition value automatically | Its result depends on the frame                         |
| Forgetting UNBOUNDED FOLLOWING for full-partition LAST_VALUE        | The default frame may end at the current row            |
| Using NTH_VALUE to find the Nth distinct value                      | NTH_VALUE returns the Nth row's value                   |
| Using window functions directly in WHERE                            | Filter in an outer query                                |
| Ordering only by a non-unique timestamp                             | Add a tie-breaker for deterministic navigation          |

---

## 12. Practice Exercises

Use the TechBazaar database.

1. Display every order with the previous order amount.
2. Display every order with the next order amount.
3. Get the previous order amount for each customer.
4. Get the amount from two orders earlier.
5. Calculate the difference between consecutive orders for each customer.
6. Calculate percentage change between consecutive orders.
7. Find the first order amount for each customer.
8. Find the final order amount for each customer using LAST_VALUE().
9. Find the second order amount for each customer using NTH_VALUE().
10. Display the highest-paid employee's name alongside every employee in their department.
11. Display the lowest-paid employee's salary alongside every employee in their department.
12. Find customers whose latest order amount exceeds their previous order amount.
13. Identify consecutive orders where the amount decreased.
14. Compare the current and previous payment amounts using the `payments` table.
15. Explain why LAST_VALUE() may return the current row's value instead of the final partition value.
16. Explain the difference between LAG() and FIRST_VALUE().
17. Explain why NTH_VALUE() is frame-sensitive but LAG() is not.

---

## 13. Interview Questions

**Q1. What are navigation window functions?**

Functions that access values from other rows within a window without requiring self-joins.

**Q2. What is the difference between LAG() and LEAD()?**

LAG accesses preceding rows; LEAD accesses following rows.

**Q3. What happens when LAG() cannot find the requested preceding row?**

It returns NULL by default, or the supplied default value.

**Q4. Does the default argument of LAG() replace NULL values in existing rows?**

No. It applies only when the requested offset row does not exist.

**Q5. What is the difference between FIRST_VALUE() and LAST_VALUE()?**

FIRST_VALUE returns the first value in the frame; LAST_VALUE returns the last value in the frame.

**Q6. Why does LAST_VALUE() sometimes return the current row's value?**

Because the default ordered frame ends at the current row and its peers.

**Q7. How do you get the final value in a partition using LAST_VALUE()?**

Use `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.

**Q8. What does NTH_VALUE() do?**

Returns the value at a specified position in the current window frame.

**Q9. Does LAG() depend on the window frame?**

No. LAG() accesses rows by offset in the partition, independently of the frame.

**Q10. Can navigation functions be used in WHERE?**

Not directly. Use a CTE or derived table.

**Q11. How do you compare consecutive transaction amounts?**

Use LAG() to retrieve the previous amount, then subtract it from the current amount.

**Q12. Why is a tie-breaker important in navigation functions?**

It makes row ordering deterministic when the primary ordering column contains duplicate values.

---

## Key Takeaways

- `LAG()` accesses preceding rows.
- `LEAD()` accesses following rows.
- `FIRST_VALUE()` returns the first value in the current frame.
- `LAST_VALUE()` returns the last value in the current frame.
- `NTH_VALUE()` returns the value at a specified position in the current frame.
- PARTITION BY isolates navigation within groups.
- ORDER BY determines row sequence.
- LAG and LEAD are offset-based and do not depend on window frames.
- FIRST_VALUE, LAST_VALUE and NTH_VALUE are frame-sensitive.
- Explicitly use UNBOUNDED FOLLOWING when you need the final value across an entire partition.
- Use a unique tie-breaker for deterministic ordering.
- Use CTEs or derived tables when filtering navigation-function results.
