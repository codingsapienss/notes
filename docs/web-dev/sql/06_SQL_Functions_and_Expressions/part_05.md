---
sidebar_label: "Aggregate Functions and Useful PostgreSQL Functions"
sidebar_position: 1
---

# Aggregate Functions and Useful PostgreSQL Functions

## 1. Introduction to Aggregate Functions

Aggregate functions perform calculations on multiple rows and return a single result or one result per group.

Common use cases:

- Calculate total sales.
- Find average product prices.
- Count registered customers.
- Find the highest and lowest order amounts.
- Calculate department-wise employee counts.
- Generate monthly revenue reports.
- Analyze campaign performance.

PostgreSQL provides several aggregate functions.

| Function     | Purpose                                  |
| ------------ | ---------------------------------------- |
| COUNT()      | Count rows or non-NULL values            |
| SUM()        | Calculate total                          |
| AVG()        | Calculate average                        |
| MIN()        | Find minimum value                       |
| MAX()        | Find maximum value                       |
| STRING_AGG() | Combine multiple values into one string  |
| ARRAY_AGG()  | Combine values into an array             |
| JSON_AGG()   | Combine values into a JSON array         |
| JSONB_AGG()  | Combine values into a JSONB array        |
| BOOL_AND()   | TRUE if all input values are TRUE        |
| BOOL_OR()    | TRUE if at least one input value is TRUE |

---

## 2. COUNT() — Count Rows

COUNT() counts rows or non-NULL values.

### Syntax

```sql
COUNT(*)
COUNT(column_name)
COUNT(DISTINCT column_name)
```

### COUNT(\*)

Counts all rows, including rows containing NULL values.

```sql
SELECT COUNT(*)
FROM employees;
```

### COUNT(column)

Counts only rows where the specified column is NOT NULL.

```sql
SELECT COUNT(email)
FROM customers;
```

### COUNT(DISTINCT column)

Counts unique non-NULL values.

```sql
SELECT COUNT(DISTINCT department_id)
FROM employees;
```

### Practical example: Count employees by department

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees
FROM employees
GROUP BY department_id;
```

### Important comparison

Suppose a table contains:

| employee_id | email       |
| ----------: | ----------- |
|           1 | a@gmail.com |
|           2 | NULL        |
|           3 | b@gmail.com |
|           4 | NULL        |

Results:

```sql
SELECT
    COUNT(*) AS total_rows,
    COUNT(email) AS emails_available,
    COUNT(DISTINCT email) AS unique_emails
FROM employees;
```

| total_rows | emails_available | unique_emails |
| ---------: | ---------------: | ------------: |
|          4 |                2 |             2 |

---

## 3. SUM() — Calculate Total

SUM() calculates the total of numeric values.

### Syntax

```sql
SUM(column_name)
```

### Example

```sql
SELECT SUM(total_amount)
FROM orders;
```

Returns the total order amount.

### Practical example: Total revenue

```sql
SELECT
    SUM(total_amount) AS total_revenue
FROM orders;
```

### Revenue by customer

```sql
SELECT
    customer_id,
    SUM(total_amount) AS customer_revenue
FROM orders
GROUP BY customer_id
ORDER BY customer_revenue DESC;
```

### Important NULL behaviour

SUM() ignores NULL values.

If there are no non-NULL input values, SUM() returns NULL rather than zero.

Use COALESCE() if you need zero as the fallback:

```sql
SELECT
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM orders;
```

---

## 4. AVG() — Calculate Average

AVG() calculates the arithmetic mean of non-NULL numeric values.

### Syntax

```sql
AVG(column_name)
```

### Example

```sql
SELECT AVG(price)
FROM products;
```

### Practical example: Average order value

```sql
SELECT
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders;
```

### Average order value by customer

```sql
SELECT
    customer_id,
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders
GROUP BY customer_id;
```

### Important NULL behaviour

AVG() ignores NULL values.

For example, values:

```text
100, 200, NULL, 300
```

Average:

```text
200
```

Calculation:

\[
\frac{100+200+300}{3}=200
\]

NULL is excluded from both the sum and the count.

---

## 5. MIN() — Find Minimum Value

Returns the smallest non-NULL value.

### Example

```sql
SELECT MIN(price)
FROM products;
```

### Practical example

```sql
SELECT
    MIN(total_amount) AS smallest_order,
    MIN(order_date) AS first_order_date
FROM orders;
```

MIN() works with comparable data types, including numbers, dates, timestamps, and text.

For text, the result follows the applicable collation ordering.

---

## 6. MAX() — Find Maximum Value

Returns the largest non-NULL value.

### Example

```sql
SELECT MAX(price)
FROM products;
```

### Practical example

```sql
SELECT
    MAX(total_amount) AS largest_order,
    MAX(order_date) AS latest_order_date
FROM orders;
```

MIN() and MAX() ignore NULL values.

---

## 7. Combining Aggregate Functions

You can use multiple aggregate functions in one query.

```sql
SELECT
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS average_order_value,
    MIN(total_amount) AS smallest_order,
    MAX(total_amount) AS largest_order
FROM orders;
```

This produces one summary row for the entire orders table.

Example:

| total_orders | total_revenue | average_order_value | smallest_order | largest_order |
| -----------: | ------------: | ------------------: | -------------: | ------------: |
|          100 |        500000 |             5000.00 |            500 |         25000 |

---

## 8. STRING_AGG() — Combine Multiple Rows Into a String

STRING_AGG() combines values from multiple rows into one string.

### Syntax

```sql
STRING_AGG(expression, delimiter)
```

### Example

```sql
SELECT STRING_AGG(first_name, ', ')
FROM employees;
```

Possible result:

```text
Rahul, Amit, Priya, Neha
```

### Practical example: Employees by department

```sql
SELECT
    department_id,
    STRING_AGG(first_name, ', ' ORDER BY first_name) AS employees
FROM employees
GROUP BY department_id;
```

### Important points

- NULL values are ignored.
- ORDER BY can be specified inside STRING_AGG().
- The order of concatenated values is not guaranteed unless specified.

---

## 9. ARRAY_AGG() — Combine Values Into an Array

ARRAY_AGG() collects values from multiple rows into a PostgreSQL array.

### Syntax

```sql
ARRAY_AGG(expression)
```

### Example

```sql
SELECT ARRAY_AGG(first_name)
FROM employees;
```

Possible result:

```text
{Rahul,Amit,Priya,Neha}
```

### Practical example: Employees by department

```sql
SELECT
    department_id,
    ARRAY_AGG(first_name ORDER BY first_name) AS employee_names
FROM employees
GROUP BY department_id;
```

### ARRAY_AGG() vs STRING_AGG()

| ARRAY_AGG()                        | STRING_AGG()                       |
| ---------------------------------- | ---------------------------------- |
| Returns an array                   | Returns text                       |
| Preserves values as array elements | Combines values into a string      |
| Useful for structured SQL results  | Useful for display-oriented output |

**Important:** Unlike STRING_AGG(), ARRAY_AGG() includes NULL input values as array elements.

---

## 10. JSON_AGG() — Aggregate Rows Into JSON

JSON_AGG() collects input values into a JSON array.

### Syntax

```sql
JSON_AGG(expression)
```

### Example

```sql
SELECT JSON_AGG(first_name)
FROM employees;
```

Possible result:

```json
["Rahul", "Amit", "Priya", "Neha"]
```

### Practical example: Return employee objects

```sql
SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
        'employee_id', employee_id,
        'name', first_name,
        'department_id', department_id
    )
)
FROM employees;
```

Possible result:

```json
[
  {
    "employee_id": 1,
    "name": "Rahul",
    "department_id": 1
  },
  {
    "employee_id": 2,
    "name": "Amit",
    "department_id": 2
  }
]
```

This is useful when building API responses directly from PostgreSQL.

---

## 11. JSONB_AGG() — Aggregate Into JSONB

JSONB_AGG() collects values into a JSONB array.

```sql
SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT(
        'employee_id', employee_id,
        'name', first_name
    )
)
FROM employees;
```

### JSON_AGG() vs JSONB_AGG()

| JSON_AGG()                                            | JSONB_AGG()                                          |
| ----------------------------------------------------- | ---------------------------------------------------- |
| Returns JSON                                          | Returns JSONB                                        |
| Preserves input JSON text representation more closely | Stores JSON in a decomposed binary representation    |
| Useful for JSON output                                | Useful when PostgreSQL JSONB operations are required |

JSONB is generally useful when you need to query or manipulate the generated JSON structure inside PostgreSQL.

---

## 12. BOOL_AND() — Check Whether All Values Are TRUE

Returns TRUE if all non-NULL input values are TRUE.

### Example

```sql
SELECT BOOL_AND(status = 'active')
FROM employees;
```

Returns:

- TRUE if every non-NULL evaluated condition is TRUE.
- FALSE if at least one condition is FALSE.
- NULL if there are no non-NULL input values.

### Practical example

```sql
SELECT
    department_id,
    BOOL_AND(status = 'active') AS all_employees_active
FROM employees
GROUP BY department_id;
```

This checks whether all employees in each department have active status.

---

## 13. BOOL_OR() — Check Whether Any Value Is TRUE

Returns TRUE if at least one non-NULL input value is TRUE.

### Example

```sql
SELECT BOOL_OR(status = 'active')
FROM employees;
```

### Practical example

```sql
SELECT
    department_id,
    BOOL_OR(status = 'active') AS has_active_employee
FROM employees
GROUP BY department_id;
```

This checks whether each department has at least one active employee.

---

## 14. FILTER — Conditional Aggregation

PostgreSQL supports FILTER to apply conditions to individual aggregate functions.

### Syntax

```sql
aggregate_function(expression)
FILTER (WHERE condition)
```

### Example: Count active employees

```sql
SELECT
    COUNT(*) FILTER (
        WHERE status = 'active'
    ) AS active_employees
FROM employees;
```

### Count active and inactive employees together

```sql
SELECT
    COUNT(*) AS total_employees,

    COUNT(*) FILTER (
        WHERE status = 'active'
    ) AS active_employees,

    COUNT(*) FILTER (
        WHERE status = 'inactive'
    ) AS inactive_employees
FROM employees;
```

### Example: Calculate conditional revenue

```sql
SELECT
    SUM(total_amount) AS total_revenue,

    SUM(total_amount) FILTER (
        WHERE status = 'completed'
    ) AS completed_revenue
FROM orders;
```

### FILTER vs CASE

Using CASE:

```sql
SELECT
    COUNT(
        CASE
            WHEN status = 'active' THEN 1
        END
    ) AS active_employees
FROM employees;
```

Using FILTER:

```sql
SELECT
    COUNT(*) FILTER (
        WHERE status = 'active'
    ) AS active_employees
FROM employees;
```

Both are valid. FILTER often makes conditional aggregation easier to read.

---

## 15. Aggregate Functions and DISTINCT

DISTINCT removes duplicate values before aggregation.

### Count unique customers

```sql
SELECT COUNT(DISTINCT customer_id)
FROM orders;
```

### Sum distinct values

```sql
SELECT SUM(DISTINCT total_amount)
FROM orders;
```

This sums each distinct order amount once.

**Important:** SUM(DISTINCT total_amount) is not the same as total revenue. Two different orders may legitimately have the same amount.

### STRING_AGG() with DISTINCT

```sql
SELECT
    department_id,
    STRING_AGG(DISTINCT status, ', ' ORDER BY status) AS employee_statuses
FROM employees
GROUP BY department_id;
```

---

## 16. Aggregate Functions and GROUP BY

Aggregate functions are commonly used with GROUP BY.

GROUP BY divides rows into groups and calculates aggregate results for each group.

### Example: Employees by department

```sql
SELECT
    department_id,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id;
```

### Example: Revenue by customer

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
ORDER BY total_spent DESC;
```

### Example: Average product price by category

```sql
SELECT
    category_id,
    ROUND(AVG(price), 2) AS average_price
FROM products
GROUP BY category_id;
```

**Important:** In a grouped query, every selected expression must either:

- Be included in GROUP BY, or
- Be used inside an aggregate function, or
- Be functionally dependent on grouped columns in a way PostgreSQL recognizes.

---

## 17. Aggregate Functions and HAVING

HAVING filters groups after aggregation.

### Example: Departments with more than five employees

```sql
SELECT
    department_id,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5;
```

### Example: Customers who spent more than 10,000

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

### WHERE vs HAVING

| WHERE                                              | HAVING                            |
| -------------------------------------------------- | --------------------------------- |
| Filters individual rows                            | Filters groups                    |
| Applied before grouping                            | Applied after grouping            |
| Normally does not use aggregate functions directly | Commonly uses aggregate functions |

Example:

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING SUM(total_amount) > 10000;
```

Execution conceptually:

1. WHERE filters completed orders.
2. GROUP BY groups remaining orders by customer.
3. SUM calculates revenue for each customer.
4. HAVING keeps customers whose revenue exceeds 10,000.

---

## 18. Aggregate Functions With Empty Tables

Aggregate functions behave differently when no rows are available.

```sql
SELECT
    COUNT(*) AS total_rows,
    SUM(price) AS total_price,
    AVG(price) AS average_price,
    MIN(price) AS minimum_price,
    MAX(price) AS maximum_price
FROM products
WHERE price < 0;
```

If no rows match:

| total_rows | total_price | average_price | minimum_price | maximum_price |
| ---------: | ----------- | ------------- | ------------- | ------------- |
|          0 | NULL        | NULL          | NULL          | NULL          |

COUNT() returns zero.

SUM(), AVG(), MIN(), and MAX() return NULL when there are no non-NULL input values.

Use COALESCE() when zero is the appropriate business fallback.

---

## 19. Useful PostgreSQL Functions

PostgreSQL provides additional functions that are useful in everyday backend development.

### 19.1 VERSION() — Get PostgreSQL Version

```sql
SELECT VERSION();
```

Returns the PostgreSQL server version and build information.

### 19.2 CURRENT_USER — Get Current Database User

```sql
SELECT CURRENT_USER;
```

Returns the database user currently used by the session.

### 19.3 SESSION_USER — Get Session User

```sql
SELECT SESSION_USER;
```

Returns the database user that originally established the current session.

### 19.4 CURRENT_SCHEMA — Get Current Schema

```sql
SELECT CURRENT_SCHEMA;
```

Returns the current schema according to the session's search path.

### 19.5 CURRENT_DATABASE() — Get Current Database

```sql
SELECT CURRENT_DATABASE();
```

Returns the name of the current database.

### 19.6 PG_BACKEND_PID() — Get Current Backend Process ID

```sql
SELECT PG_BACKEND_PID();
```

Returns the process ID associated with the current database connection.

### 19.7 PG_TYPEOF() — Inspect Data Type

```sql
SELECT PG_TYPEOF(100);
```

Result:

```text
integer
```

Another example:

```sql
SELECT PG_TYPEOF(100.50);
```

Result:

```text
numeric
```

Useful when debugging type conversion and expression results.

### 19.8 GENERATE_SERIES() — Generate Sequences

Generates a series of values.

```sql
SELECT GENERATE_SERIES(1, 10);
```

Result:

```text
1
2
3
4
5
6
7
8
9
10
```

Generate dates:

```sql
SELECT GENERATE_SERIES(
    DATE '2026-11-01',
    DATE '2026-11-07',
    INTERVAL '1 day'
)::DATE AS calendar_date;
```

Useful for calendar reports and generating test data.

### 19.9 FORMAT() — Format Text

Creates formatted strings using placeholders.

```sql
SELECT FORMAT(
    'Employee %s belongs to department %s',
    'Rahul',
    1
);
```

Result:

```text
Employee Rahul belongs to department 1
```

Common placeholders:

| Placeholder | Meaning                       |
| ----------- | ----------------------------- |
| `%s`        | String representation         |
| `%I`        | SQL identifier, safely quoted |
| `%L`        | SQL literal, safely quoted    |

Example:

```sql
SELECT FORMAT(
    'SELECT * FROM %I WHERE employee_id = %L',
    'employees',
    10
);
```

This generates SQL text. It does not execute that SQL.

**Important:** FORMAT() is useful for constructing SQL in controlled database code, but dynamic SQL still requires careful validation and appropriate execution methods.

### 19.10 PG_SIZE_PRETTY() — Format Database Sizes

```sql
SELECT PG_SIZE_PRETTY(
    PG_DATABASE_SIZE(CURRENT_DATABASE())
);
```

Returns a human-readable database size, such as:

```text
125 MB
```

The actual value depends on the database.

---

## 20. Real-World Reporting Examples

### 20.1 Overall business summary

```sql
SELECT
    COUNT(*) AS total_orders,
    COUNT(DISTINCT customer_id) AS unique_customers,
    COALESCE(SUM(total_amount), 0) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS average_order_value,
    MIN(total_amount) AS minimum_order,
    MAX(total_amount) AS maximum_order
FROM orders;
```

### 20.2 Department employee summary

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees,
    COUNT(*) FILTER (
        WHERE status = 'active'
    ) AS active_employees,
    COUNT(*) FILTER (
        WHERE status = 'inactive'
    ) AS inactive_employees,
    STRING_AGG(first_name, ', ' ORDER BY first_name) AS employee_names
FROM employees
GROUP BY department_id;
```

### 20.3 Customer spending report

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent,
    ROUND(AVG(total_amount), 2) AS average_order_value,
    MAX(total_amount) AS highest_order
FROM orders
GROUP BY customer_id
ORDER BY total_spent DESC;
```

### 20.4 Product category summary

```sql
SELECT
    category_id,
    COUNT(*) AS total_products,
    ROUND(AVG(price), 2) AS average_price,
    MIN(price) AS minimum_price,
    MAX(price) AS maximum_price
FROM products
GROUP BY category_id;
```

---

## 21. Common Aggregate Function Mistakes

| Mistake                                                    | Explanation                                              |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| Confusing COUNT(\*) and COUNT(column)                      | COUNT(column) ignores NULL                               |
| Assuming SUM() returns zero for empty input                | SUM() returns NULL when there are no non-NULL values     |
| Using COUNT(DISTINCT) incorrectly                          | It counts unique non-NULL values                         |
| Forgetting GROUP BY                                        | Non-aggregated selected columns generally need grouping  |
| Using WHERE with aggregate conditions                      | Use HAVING for filtering groups                          |
| Assuming STRING_AGG() has a guaranteed order               | Specify ORDER BY inside the aggregate                    |
| Confusing ARRAY_AGG() and STRING_AGG()                     | One returns an array; the other returns text             |
| Using SUM(DISTINCT amount) for revenue                     | Repeated valid transaction amounts are counted only once |
| Ignoring NULL in BOOL_AND() and BOOL_OR()                  | These functions ignore NULL inputs                       |
| Returning zero instead of NULL without considering meaning | Zero and unavailable data are not necessarily equivalent |

---

## 22. Practice Exercises

Use the TechBazaar database.

1. Count all employees using COUNT(\*).
2. Count employees with a non-NULL email using COUNT(email).
3. Count unique departments using COUNT(DISTINCT department_id).
4. Calculate total revenue using SUM().
5. Calculate average product price using AVG().
6. Find the minimum and maximum order amounts.
7. Calculate total orders and revenue for each customer.
8. Count active and inactive employees using FILTER.
9. Compare FILTER with CASE-based conditional aggregation.
10. Combine employee names into a string using STRING_AGG().
11. Collect employee names into an array using ARRAY_AGG().
12. Generate a JSON array of employee objects using JSON_AGG().
13. Generate a JSONB array of product objects using JSONB_AGG().
14. Check whether all employees in each department are active using BOOL_AND().
15. Check whether each department has at least one active employee using BOOL_OR().
16. Find customers who have placed more than three orders using HAVING.
17. Find customers whose total spending exceeds 10,000.
18. Generate an overall business summary using multiple aggregate functions.
19. Generate a sequence of integers from 1 to 100 using GENERATE_SERIES().
20. Inspect the data types of different expressions using PG_TYPEOF().

---

## 23. Interview Questions

**Q1. What are aggregate functions?**

Aggregate functions perform calculations across multiple rows and return a single result or one result per group.

**Q2. What is the difference between COUNT(\*) and COUNT(column)?**

COUNT(\*) counts all rows. COUNT(column) counts only non-NULL values.

**Q3. What is the difference between COUNT(\*) and COUNT(DISTINCT column)?**

COUNT(\*) counts all rows. COUNT(DISTINCT column) counts unique non-NULL values.

**Q4. Does SUM() return zero when no rows match?**

No. SUM() returns NULL when there are no non-NULL input values. Use COALESCE() if zero is required.

**Q5. What is the difference between WHERE and HAVING?**

WHERE filters rows before grouping. HAVING filters groups after aggregation.

**Q6. What is conditional aggregation?**

It calculates aggregate results using only rows that satisfy specified conditions. PostgreSQL's FILTER clause is a clear way to implement it.

**Q7. What is the difference between STRING_AGG() and ARRAY_AGG()?**

STRING_AGG() combines values into text. ARRAY_AGG() collects values into a PostgreSQL array.

**Q8. What is JSON_AGG()?**

It combines values from multiple rows into a JSON array.

**Q9. What is the difference between JSON_AGG() and JSONB_AGG()?**

JSON_AGG() returns JSON. JSONB_AGG() returns JSONB.

**Q10. What does BOOL_AND() do?**

It returns TRUE when all non-NULL input values are TRUE.

**Q11. What does BOOL_OR() do?**

It returns TRUE when at least one non-NULL input value is TRUE.

**Q12. Why should ORDER BY be specified inside STRING_AGG()?**

Without an explicit ordering, the concatenation order is not guaranteed.

**Q13. Can aggregate functions be nested directly?**

Ordinary aggregate functions cannot be directly nested at the same query level. Use a subquery or CTE to aggregate in stages.

Example:

```sql
SELECT AVG(customer_total)
FROM (
    SELECT
        customer_id,
        SUM(total_amount) AS customer_total
    FROM orders
    GROUP BY customer_id
) AS customer_totals;
```

This calculates the average total spending per customer.

**Q14. What is GENERATE_SERIES() used for?**

It generates a sequence of numbers or date/time values, useful for reports and test data.

---

## Key Takeaways

- Aggregate functions calculate results across multiple rows.
- COUNT(\*) counts rows; COUNT(column) ignores NULL values.
- SUM(), AVG(), MIN(), and MAX() perform common numerical and comparison calculations.
- STRING_AGG() combines values into text.
- ARRAY_AGG() combines values into arrays.
- JSON_AGG() and JSONB_AGG() generate JSON arrays.
- BOOL_AND() and BOOL_OR() perform Boolean aggregation.
- FILTER supports conditional aggregation.
- DISTINCT removes duplicate input values before aggregation.
- GROUP BY creates groups; HAVING filters those groups.
- COALESCE() can provide fallback values for NULL aggregate results.
- GENERATE_SERIES(), FORMAT(), PG_TYPEOF(), and database-information functions are useful PostgreSQL utilities.
