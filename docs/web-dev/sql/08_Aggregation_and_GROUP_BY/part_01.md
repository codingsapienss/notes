---
sidebar_label: "Aggregate Functions"
sidebar_position: 1
---

# Aggregate Functions

## 1. What Are Aggregate Functions?

Aggregate functions perform calculations on multiple rows and return a single result for the selected group of rows.

They are commonly used for:

- Calculating total revenue.
- Counting customers and orders.
- Finding average product prices.
- Finding highest and lowest salaries.
- Calculating total inventory.
- Generating business reports.

### Example

```sql
SELECT
    SUM(total_amount) AS total_revenue
FROM orders;
```

Instead of returning every order, this query returns one value representing the sum of all order amounts.

---

## 2. Types of Aggregate Functions in PostgreSQL

| Function       | Purpose                                     |
| -------------- | ------------------------------------------- |
| `COUNT()`      | Counts rows or non-NULL values              |
| `SUM()`        | Calculates the sum                          |
| `AVG()`        | Calculates the average                      |
| `MIN()`        | Returns the minimum value                   |
| `MAX()`        | Returns the maximum value                   |
| `STRING_AGG()` | Combines strings from multiple rows         |
| `ARRAY_AGG()`  | Collects values into an array               |
| `JSON_AGG()`   | Collects values into JSON                   |
| `JSONB_AGG()`  | Collects values into JSONB                  |
| `BOOL_AND()`   | TRUE if all non-NULL inputs are TRUE        |
| `BOOL_OR()`    | TRUE if at least one non-NULL input is TRUE |

The first five are the most frequently used general-purpose aggregate functions.

---

## 3. COUNT() — Count Records

COUNT returns the number of rows or non-NULL values.

### COUNT(\*)

Counts all rows.

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

### COUNT(column)

Counts only rows where the specified column is NOT NULL.

```sql
SELECT COUNT(email) AS customers_with_email
FROM customers;
```

### COUNT(DISTINCT column)

Counts unique non-NULL values.

```sql
SELECT COUNT(DISTINCT city) AS unique_cities
FROM customers;
```

### COUNT with conditions

```sql
SELECT
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders,
    COUNT(*) FILTER (
        WHERE status = 'pending'
    ) AS pending_orders
FROM orders;
```

PostgreSQL's `FILTER` clause applies a condition to an individual aggregate.

### COUNT comparison

Suppose a table contains:

| employee_id | email         |
| ----------: | ------------- |
|           1 | a@example.com |
|           2 | NULL          |
|           3 | c@example.com |
|           4 | NULL          |

```sql
SELECT
    COUNT(*) AS total_rows,
    COUNT(email) AS non_null_emails,
    COUNT(DISTINCT email) AS unique_emails
FROM employees;
```

Result:

| total_rows | non_null_emails | unique_emails |
| ---------: | --------------: | ------------: |
|          4 |               2 |             2 |

**Important:**

- `COUNT(*)` counts all rows.
- `COUNT(column)` ignores NULL.
- `COUNT(DISTINCT column)` ignores NULL and removes duplicates.

---

## 4. SUM() — Calculate Total

SUM calculates the total of non-NULL numeric values.

### Example: Total order revenue

```sql
SELECT
    SUM(total_amount) AS total_revenue
FROM orders;
```

### Example: Total quantity sold

```sql
SELECT
    SUM(quantity) AS total_quantity_sold
FROM order_items;
```

### SUM with conditions

```sql
SELECT
    SUM(total_amount) FILTER (
        WHERE status = 'completed'
    ) AS completed_revenue
FROM orders;
```

### SUM with CASE

```sql
SELECT
    SUM(
        CASE
            WHEN status = 'completed'
            THEN total_amount
            ELSE 0
        END
    ) AS completed_revenue
FROM orders;
```

Both approaches calculate completed-order revenue.

### Important behaviour

If there are no non-NULL input values, SUM returns NULL, not zero.

Use COALESCE when zero is required:

```sql
SELECT
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM orders;
```

---

## 5. AVG() — Calculate Average

AVG calculates the arithmetic mean of non-NULL numeric values.

Formula:

\[
\text{Average} = \frac{\text{Sum of values}}{\text{Number of non-NULL values}}
\]

### Example: Average order value

```sql
SELECT
    AVG(total_amount) AS average_order_value
FROM orders;
```

### Example: Average product price

```sql
SELECT
    AVG(price) AS average_product_price
FROM products;
```

### Round the average

```sql
SELECT
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders;
```

### AVG ignores NULL

Suppose values are:

```text
100, 200, NULL, 300
```

The average is:

\[
\frac{100 + 200 + 300}{3} = 200
\]

NULL is not treated as zero.

**Important:** AVG returns NULL if there are no non-NULL input values.

---

## 6. MIN() and MAX()

These functions return the minimum and maximum non-NULL values.

### MIN()

```sql
SELECT
    MIN(total_amount) AS smallest_order
FROM orders;
```

### MAX()

```sql
SELECT
    MAX(total_amount) AS largest_order
FROM orders;
```

### Find the cheapest and most expensive products

```sql
SELECT
    MIN(price) AS cheapest_product,
    MAX(price) AS most_expensive_product
FROM products;
```

### MIN and MAX with dates

```sql
SELECT
    MIN(order_date) AS first_order,
    MAX(order_date) AS latest_order
FROM orders;
```

### MIN and MAX with strings

```sql
SELECT
    MIN(customer_name) AS alphabetically_first,
    MAX(customer_name) AS alphabetically_last
FROM customers;
```

For strings, PostgreSQL uses the applicable collation ordering.

**Important:** MIN and MAX ignore NULL values. If all input values are NULL, they return NULL.

---

## 7. Multiple Aggregate Functions in One Query

You can use multiple aggregate functions in the same SELECT statement.

### Example: Order statistics

```sql
SELECT
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS average_order_value,
    MIN(total_amount) AS minimum_order,
    MAX(total_amount) AS maximum_order
FROM orders;
```

This returns one row containing all five statistics.

### Business application

A dashboard might display:

| Metric              | Aggregate         |
| ------------------- | ----------------- |
| Total orders        | COUNT(\*)         |
| Total revenue       | SUM(total_amount) |
| Average order value | AVG(total_amount) |
| Smallest order      | MIN(total_amount) |
| Largest order       | MAX(total_amount) |

---

## 8. STRING_AGG() — Combine Multiple Strings

STRING_AGG combines values from multiple rows into one string.

### Syntax

```sql
STRING_AGG(expression, delimiter)
```

### Example: Combine customer names

```sql
SELECT
    STRING_AGG(customer_name, ', ') AS customer_list
FROM customers;
```

Possible result:

```text
Rahul, Priya, Amit, Neha
```

### STRING_AGG with GROUP BY

Suppose employees belong to departments.

```sql
SELECT
    d.department_name,
    STRING_AGG(e.first_name, ', ') AS employees
FROM departments AS d
LEFT JOIN employees AS e
    ON d.department_id = e.department_id
GROUP BY
    d.department_id,
    d.department_name;
```

### Control the order inside STRING_AGG

```sql
SELECT
    STRING_AGG(
        first_name,
        ', ' ORDER BY first_name
    ) AS employees
FROM employees;
```

**Important:**

- STRING_AGG ignores NULL input values.
- Without ORDER BY inside the aggregate, the concatenation order is unspecified.
- The delimiter is inserted between values, not after the final value.

---

## 9. ARRAY_AGG() — Collect Values into an Array

ARRAY_AGG collects values from multiple rows into a PostgreSQL array.

### Example

```sql
SELECT
    ARRAY_AGG(customer_name) AS customer_names
FROM customers;
```

Possible result:

```text
{Rahul,Priya,Amit,Neha}
```

### ARRAY_AGG with GROUP BY

```sql
SELECT
    department_id,
    ARRAY_AGG(first_name ORDER BY first_name) AS employee_names
FROM employees
GROUP BY department_id;
```

### Include distinct values

```sql
SELECT
    ARRAY_AGG(DISTINCT city ORDER BY city) AS unique_cities
FROM customers;
```

### Important

Unlike STRING_AGG, ARRAY_AGG includes NULL values as array elements.

Example:

```sql
SELECT ARRAY_AGG(email)
FROM employees;
```

If some email values are NULL, the resulting array can contain NULL elements.

---

## 10. JSON_AGG() and JSONB_AGG()

These aggregate functions collect rows into JSON structures.

- `JSON_AGG()` returns JSON.
- `JSONB_AGG()` returns JSONB.

### Example: Collect customer names

```sql
SELECT
    JSON_AGG(customer_name) AS customers
FROM customers;
```

Possible result:

```json
["Rahul", "Priya", "Amit", "Neha"]
```

### JSONB_AGG with objects

```sql
SELECT
    JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'customer_id', customer_id,
            'customer_name', customer_name
        )
    ) AS customers
FROM customers;
```

Possible result:

```json
[
  {
    "customer_id": 1,
    "customer_name": "Rahul"
  },
  {
    "customer_id": 2,
    "customer_name": "Priya"
  }
]
```

### JSON aggregation with GROUP BY

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

This creates one JSONB array of orders per customer.

**Important:** JSON_AGG and JSONB_AGG include NULL input values. When aggregating after a LEFT JOIN, use FILTER to avoid producing an unwanted object or NULL element for a missing child row.

Example:

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'order_id', o.order_id,
                'amount', o.total_amount
            )
        ) FILTER (WHERE o.order_id IS NOT NULL),
        '[]'::jsonb
    ) AS orders
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

---

## 11. BOOL_AND() and BOOL_OR()

PostgreSQL provides aggregate functions for Boolean values.

### BOOL_AND()

Returns TRUE if every non-NULL input value is TRUE.

```sql
SELECT
    BOOL_AND(is_active) AS all_employees_active
FROM employees;
```

### BOOL_OR()

Returns TRUE if at least one non-NULL input value is TRUE.

```sql
SELECT
    BOOL_OR(is_active) AS any_employee_active
FROM employees;
```

### Behaviour

| Input values | BOOL_AND | BOOL_OR |
| ------------ | -------- | ------- |
| TRUE, TRUE   | TRUE     | TRUE    |
| TRUE, FALSE  | FALSE    | TRUE    |
| FALSE, FALSE | FALSE    | FALSE   |
| TRUE, NULL   | TRUE     | TRUE    |
| FALSE, NULL  | FALSE    | FALSE   |

Both functions ignore NULL values.

If there are no non-NULL input values, both return NULL.

---

## 12. Aggregate Functions and NULL Behaviour

Understanding NULL behaviour is essential for correct reports.

| Function      | NULL behaviour         | Empty/no non-NULL input |
| ------------- | ---------------------- | ----------------------- |
| COUNT(\*)     | Counts all rows        | 0                       |
| COUNT(column) | Ignores NULL           | 0                       |
| SUM(column)   | Ignores NULL           | NULL                    |
| AVG(column)   | Ignores NULL           | NULL                    |
| MIN(column)   | Ignores NULL           | NULL                    |
| MAX(column)   | Ignores NULL           | NULL                    |
| STRING_AGG()  | Ignores NULL values    | NULL                    |
| ARRAY_AGG()   | Includes NULL elements | NULL                    |
| JSON_AGG()    | Includes NULL values   | NULL                    |
| BOOL_AND()    | Ignores NULL           | NULL                    |
| BOOL_OR()     | Ignores NULL           | NULL                    |

### Example: COALESCE with aggregate functions

```sql
SELECT
    COUNT(*) AS total_orders,
    COALESCE(SUM(total_amount), 0) AS total_revenue,
    COALESCE(AVG(total_amount), 0) AS average_order_value
FROM orders
WHERE customer_id = 99999;
```

If customer 99999 has no orders:

| total_orders | total_revenue | average_order_value |
| -----------: | ------------: | ------------------: |
|            0 |             0 |                   0 |

COUNT naturally returns zero. COALESCE handles the NULL results from SUM and AVG.

---

## 13. Aggregate Functions with FILTER

PostgreSQL supports FILTER to apply different conditions to different aggregate calculations.

### Example: Order status statistics

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

This calculates several conditional metrics in one table scan at the SQL level.

### FILTER vs WHERE

**WHERE:**

```sql
SELECT
    COUNT(*) AS completed_orders
FROM orders
WHERE status = 'completed';
```

Filters rows for the entire query.

**FILTER:**

```sql
SELECT
    COUNT(*) FILTER (
        WHERE status = 'completed'
    ) AS completed_orders,

    COUNT(*) FILTER (
        WHERE status = 'pending'
    ) AS pending_orders
FROM orders;
```

Applies separate conditions to individual aggregate functions.

Use FILTER when you need multiple conditional aggregate results from the same input rows.

---

## 14. Aggregate Functions with DISTINCT

DISTINCT removes duplicate input values before aggregation.

### Count unique customers who placed orders

```sql
SELECT
    COUNT(DISTINCT customer_id) AS unique_customers
FROM orders;
```

### Sum unique values

```sql
SELECT
    SUM(DISTINCT total_amount) AS unique_order_amount_sum
FROM orders;
```

**Warning:** SUM(DISTINCT total_amount) is not the same as total revenue.

If two different orders both have an amount of ₹5,000, SUM(DISTINCT total_amount) counts ₹5,000 only once.

Use DISTINCT only when the business requirement genuinely asks for unique input values.

---

## 15. Aggregate Functions Without GROUP BY

When aggregate functions are used without GROUP BY, PostgreSQL returns one result row for the entire filtered input.

```sql
SELECT
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'completed';
```

Even if no rows match, the query returns one row:

| total_orders | total_revenue |
| -----------: | ------------: |
|            0 |          NULL |

COUNT returns zero, while SUM returns NULL.

---

## 16. Aggregate Functions with JOINs

Aggregate functions are frequently combined with JOINs.

### Example: Total revenue per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_revenue
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

### Include customers without orders

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

### Important: Avoid double-counting

Suppose an order has:

- Two order items.
- Two payment records.

Joining orders, order_items and payments can produce four combinations for that order.

If you sum the order amount or payment amount directly from that result, the totals can be inflated.

Pre-aggregate independent one-to-many relationships before joining them.

---

## 17. Aggregate Functions vs Window Functions

Both can calculate totals and averages, but their result structures differ.

### Aggregate function

```sql
SELECT
    customer_id,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id;
```

Returns one row per customer.

### Window function

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

Returns every order row and adds the customer's total spending to each row.

| Aggregate with GROUP BY     | Window function                             |
| --------------------------- | ------------------------------------------- |
| Combines rows into groups   | Preserves individual rows                   |
| Usually reduces row count   | Usually keeps the original row count        |
| Uses GROUP BY               | Uses OVER()                                 |
| Returns group-level results | Returns row-level results with calculations |

Window functions are covered in Part 11.

---

## 18. Practical Business Queries

### A. Total revenue and order count

```sql
SELECT
    COUNT(*) AS total_orders,
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM orders
WHERE status = 'completed';
```

### B. Average order value per customer

```sql
SELECT
    customer_id,
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders
GROUP BY customer_id;
```

### C. Highest and lowest product prices

```sql
SELECT
    MIN(price) AS lowest_price,
    MAX(price) AS highest_price,
    ROUND(AVG(price), 2) AS average_price
FROM products;
```

### D. Number of unique customers per city

```sql
SELECT
    city,
    COUNT(DISTINCT customer_id) AS total_customers
FROM customers
GROUP BY city
ORDER BY total_customers DESC;
```

### E. Total quantity sold per product

```sql
SELECT
    p.product_id,
    p.product_name,
    COALESCE(SUM(oi.quantity), 0) AS total_sold
FROM products AS p
LEFT JOIN order_items AS oi
    ON p.product_id = oi.product_id
GROUP BY
    p.product_id,
    p.product_name
ORDER BY total_sold DESC;
```

### F. Department employee statistics

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

---

## 19. Common Mistakes

| Mistake                                          | Correct understanding                                 |
| ------------------------------------------------ | ----------------------------------------------------- |
| Using COUNT(\*) to count non-NULL values         | Use COUNT(column)                                     |
| Assuming SUM returns zero when no rows match     | SUM returns NULL                                      |
| Assuming AVG includes NULL as zero               | AVG ignores NULL                                      |
| Using SUM(DISTINCT amount) for revenue           | It removes repeated amounts, not duplicate orders     |
| Using COUNT(\*) after LEFT JOIN for child counts | Count the child's primary key                         |
| Forgetting ORDER BY inside STRING_AGG            | Aggregate input order is unspecified without it       |
| Assuming ARRAY_AGG ignores NULL                  | It includes NULL elements                             |
| Forgetting FILTER                                | Use it for multiple conditional aggregates            |
| Aggregating after a row-multiplying JOIN         | Pre-aggregate independent relationships               |
| Confusing aggregate and window functions         | GROUP BY reduces rows; window functions preserve them |

---

## 20. Practice Exercises

Use the TechBazaar database.

1. Count all customers.
2. Count customers who have an email address.
3. Count unique customer cities.
4. Calculate total order revenue.
5. Calculate average order value.
6. Find the highest and lowest order amounts.
7. Calculate total quantity sold across all order items.
8. Find the average product price.
9. Count completed, pending and cancelled orders using FILTER.
10. Calculate completed-order revenue.
11. Display all employee names as a comma-separated string.
12. Collect all product names into a PostgreSQL array.
13. Create a JSONB array containing product IDs and names.
14. Count employees in each department, including empty departments.
15. Calculate total spending per customer, including customers with zero orders.
16. Find unique customers who have placed orders.
17. Explain the difference between COUNT(\*) and COUNT(column).
18. Explain why SUM(DISTINCT total_amount) can produce incorrect revenue.
19. Compare GROUP BY aggregation with a window aggregate.
20. Demonstrate how joining two one-to-many relationships can inflate aggregate results.

---

## 21. Interview Questions

**Q1. What are aggregate functions?**

Functions that calculate a result from multiple input rows, such as SUM, COUNT and AVG.

**Q2. What is the difference between COUNT(\*) and COUNT(column)?**

COUNT(\*) counts all rows. COUNT(column) counts only rows where the specified column is non-NULL.

**Q3. Does SUM return zero when there are no matching records?**

No. SUM returns NULL when there are no non-NULL input values. Use COALESCE to return zero.

**Q4. Does AVG include NULL values?**

No. AVG ignores NULL values.

**Q5. What is COUNT(DISTINCT column)?**

It counts unique non-NULL values.

**Q6. What is STRING_AGG()?**

It combines values from multiple rows into a single string with a specified delimiter.

**Q7. What is ARRAY_AGG()?**

It collects values from multiple rows into a PostgreSQL array.

**Q8. What is the difference between JSON_AGG and JSONB_AGG?**

JSON_AGG returns JSON; JSONB_AGG returns JSONB.

**Q9. What is the FILTER clause?**

It applies a condition to an individual aggregate function.

**Q10. What is the difference between aggregate functions and window functions?**

Aggregates with GROUP BY combine rows into groups. Window functions preserve individual rows while calculating over related rows.

**Q11. Can aggregate functions be used with JOINs?**

Yes. They are frequently used with JOINs and GROUP BY to generate business reports.

**Q12. Why can SUM return an incorrect result after multiple JOINs?**

JOINs can multiply rows, causing values to be counted more than once. Pre-aggregate independent one-to-many relationships when necessary.

---

## Key Takeaways

- Aggregate functions calculate summaries from multiple rows.
- COUNT(\*) counts rows; COUNT(column) ignores NULL.
- SUM, AVG, MIN and MAX ignore NULL inputs.
- SUM and AVG return NULL when there are no non-NULL inputs.
- COALESCE handles NULL aggregate results.
- DISTINCT removes duplicate input values before aggregation.
- FILTER supports conditional aggregation.
- STRING_AGG combines strings.
- ARRAY_AGG collects values into arrays.
- JSON_AGG and JSONB_AGG create JSON collections.
- BOOL_AND and BOOL_OR perform Boolean aggregation.
- JOIN cardinality must be understood before calculating aggregates.
- GROUP BY aggregation reduces rows; window functions preserve them.
