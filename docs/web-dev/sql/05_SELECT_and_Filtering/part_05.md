---
sidebar_label: "CASE Expressions and Conditional Queries"
sidebar_position: 1
---

# CASE Expressions and Conditional Queries

## 1. Introduction to CASE

`CASE` is a conditional expression in SQL that allows you to return different values depending on specified conditions.

It works similarly to:

- `if`
- `else if`
- `else`

in programming languages such as JavaScript.

Common use cases:

- Categorizing products by price.
- Assigning employee performance labels.
- Calculating discounts.
- Displaying custom status messages.
- Applying conditional calculations.
- Sorting records using custom priorities.

**Important:** CASE is an SQL expression, not a procedural control-flow statement.

---

## 2. Simple CASE Expression

Simple CASE compares one expression against multiple possible values.

### Syntax

```sql
CASE expression
    WHEN value1 THEN result1
    WHEN value2 THEN result2
    ELSE default_result
END
```

### Example: Employee status labels

```sql
SELECT
    employee_id,
    first_name,
    status,
    CASE status
        WHEN 'active' THEN 'Currently Working'
        WHEN 'inactive' THEN 'Not Working'
        ELSE 'Unknown Status'
    END AS status_description
FROM employees;
```

Behaviour:

| status   | status_description |
| -------- | ------------------ |
| active   | Currently Working  |
| inactive | Not Working        |
| NULL     | Unknown Status     |

**Important:** Simple CASE uses equality comparisons. A NULL expression does not match `WHEN NULL`; use searched CASE with `IS NULL` for NULL checks.

---

## 3. Searched CASE Expression

Searched CASE evaluates independent Boolean conditions.

### Syntax

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ELSE default_result
END
```

### Example: Categorize products by price

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price < 1000 THEN 'Budget'
        WHEN price < 10000 THEN 'Mid Range'
        WHEN price >= 10000 THEN 'Premium'
        ELSE 'Unknown'
    END AS price_category
FROM products;
```

Behaviour:

| Price | Category  |
| ----: | --------- |
|   500 | Budget    |
|  5000 | Mid Range |
| 15000 | Premium   |
|  NULL | Unknown   |

### Important: Condition order

CASE evaluates conditions in order and returns the result for the first condition that is TRUE.

Example:

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price < 10000 THEN 'Budget'
        WHEN price < 1000 THEN 'Very Cheap'
        ELSE 'Premium'
    END AS category
FROM products;
```

The second condition is unreachable for prices below 1,000 because the first condition already matches.

Correct order:

```sql
CASE
    WHEN price < 1000 THEN 'Very Cheap'
    WHEN price < 10000 THEN 'Budget'
    ELSE 'Premium'
END
```

---

## 4. CASE Without ELSE

The `ELSE` clause is optional.

```sql
SELECT
    employee_id,
    first_name,
    CASE
        WHEN status = 'active' THEN 'Working'
    END AS employment_status
FROM employees;
```

If no condition matches, CASE returns NULL.

This is equivalent to having:

```sql
ELSE NULL
```

---

## 5. CASE with Comparison Operators

You can use comparison operators inside searched CASE.

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price > 50000 THEN 'Expensive'
        WHEN price >= 10000 THEN 'Moderate'
        WHEN price < 10000 THEN 'Affordable'
        ELSE 'Unknown'
    END AS price_category
FROM products;
```

Supported conditions include:

- `=`
- `<>`
- `>`
- `<`
- `>=`
- `<=`
- `BETWEEN`
- `IN`
- `LIKE`
- `IS NULL`
- `EXISTS`

---

## 6. CASE with AND and OR

You can combine multiple conditions.

### AND example

```sql
SELECT
    employee_id,
    first_name,
    department_id,
    status,
    CASE
        WHEN department_id = 1 AND status = 'active'
            THEN 'Active Engineering Employee'
        ELSE 'Other Employee'
    END AS employee_category
FROM employees;
```

### OR example

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price < 1000 OR price > 50000
            THEN 'Special Category'
        ELSE 'Regular Category'
    END AS product_category
FROM products;
```

### Combining multiple conditions

```sql
SELECT
    product_name,
    price,
    category_id,
    CASE
        WHEN category_id = 1 AND price < 1000 THEN 'Low-Cost Electronics'
        WHEN category_id = 1 AND price >= 1000 THEN 'Premium Electronics'
        WHEN category_id = 2 THEN 'Accessories'
        ELSE 'Other Products'
    END AS category_description
FROM products;
```

---

## 7. CASE with NULL

Use `IS NULL` and `IS NOT NULL` inside searched CASE.

```sql
SELECT
    customer_name,
    email,
    CASE
        WHEN email IS NULL THEN 'Email Missing'
        WHEN email = '' THEN 'Empty Email'
        ELSE 'Email Available'
    END AS email_status
FROM customers;
```

This distinguishes:

- NULL email.
- Empty email string.
- Available email.

**Important:** `email = NULL` is incorrect, even inside CASE.

---

## 8. CASE for Conditional Calculations

CASE can calculate different values based on conditions.

### Example: Product discount

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price >= 50000 THEN price * 0.20
        WHEN price >= 10000 THEN price * 0.10
        WHEN price >= 5000 THEN price * 0.05
        ELSE 0
    END AS discount
FROM products;
```

### Calculate final price

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price >= 50000 THEN price * 0.80
        WHEN price >= 10000 THEN price * 0.90
        WHEN price >= 5000 THEN price * 0.95
        ELSE price
    END AS final_price
FROM products;
```

These calculations affect only the query output, not the stored product price.

---

## 9. CASE with Aggregate Functions

CASE can be combined with aggregate functions to perform conditional aggregation.

### Count active employees

```sql
SELECT
    COUNT(
        CASE
            WHEN status = 'active' THEN 1
        END
    ) AS active_employees
FROM employees;
```

### Count active and inactive employees

```sql
SELECT
    COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_count,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) AS inactive_count
FROM employees;
```

### SUM with CASE

Suppose `order_items` contains a `quantity` column:

```sql
SELECT
    SUM(
        CASE
            WHEN quantity > 5 THEN quantity
            ELSE 0
        END
    ) AS quantity_above_threshold
FROM order_items;
```

This adds quantities only from rows where quantity is greater than five.

### PostgreSQL FILTER alternative

PostgreSQL supports the `FILTER` clause for aggregate functions.

```sql
SELECT
    COUNT(*) FILTER (WHERE status = 'active') AS active_count,
    COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_count
FROM employees;
```

For conditional aggregation, `FILTER` is often clearer than repeating CASE expressions.

---

## 10. CASE with GROUP BY

You can categorize rows using CASE and then group by the resulting category.

### Example: Group products by price range

```sql
SELECT
    CASE
        WHEN price < 1000 THEN 'Budget'
        WHEN price < 10000 THEN 'Mid Range'
        ELSE 'Premium'
    END AS price_category,
    COUNT(*) AS total_products
FROM products
GROUP BY
    CASE
        WHEN price < 1000 THEN 'Budget'
        WHEN price < 10000 THEN 'Mid Range'
        ELSE 'Premium'
    END;
```

Example result:

| price_category | total_products |
| -------------- | -------------: |
| Budget         |             20 |
| Mid Range      |             35 |
| Premium        |             10 |

This groups products according to their calculated price category.

---

## 11. CASE with ORDER BY

CASE can create custom sorting priorities.

### Example: Sort orders by business priority

```sql
SELECT *
FROM orders
ORDER BY
    CASE
        WHEN status = 'pending' THEN 1
        WHEN status = 'processing' THEN 2
        WHEN status = 'completed' THEN 3
        WHEN status = 'cancelled' THEN 4
        ELSE 5
    END,
    order_id DESC;
```

Sorting priority:

1. Pending orders.
2. Processing orders.
3. Completed orders.
4. Cancelled orders.
5. Other statuses.

Within each status group, newer or higher IDs appear first.

This is useful when business priority differs from alphabetical sorting.

---

## 12. CASE with UPDATE

CASE can assign different values to multiple rows in one UPDATE statement.

### Example: Update employee statuses

```sql
UPDATE employees
SET status = CASE
    WHEN employee_id = 1 THEN 'active'
    WHEN employee_id = 2 THEN 'inactive'
    WHEN employee_id = 3 THEN 'active'
    ELSE status
END
WHERE employee_id IN (1, 2, 3);
```

Each matching employee receives a different status.

### Example: Conditional price updates

```sql
UPDATE products
SET price = CASE
    WHEN price >= 50000 THEN price * 0.90
    WHEN price >= 10000 THEN price * 0.95
    ELSE price
END;
```

This:

- Reduces prices of products costing at least 50,000 by 10%.
- Reduces prices of products costing at least 10,000 but less than 50,000 by 5%.
- Leaves other prices unchanged.

**Warning:** Without WHERE, every row is considered for updating.

---

## 13. CASE with DELETE Conditions

CASE is an expression, not a direct replacement for WHERE. However, it can be used inside a filtering condition.

Example:

```sql
DELETE FROM orders
WHERE CASE
    WHEN status = 'cancelled' THEN TRUE
    WHEN status = 'completed' THEN FALSE
    ELSE FALSE
END
RETURNING *;
```

This deletes cancelled orders.

A simpler and clearer query is:

```sql
DELETE FROM orders
WHERE status = 'cancelled'
RETURNING *;
```

**Best practice:** Use CASE when you genuinely need conditional expressions. Do not use it to make straightforward WHERE conditions unnecessarily complex.

---

## 14. Nested CASE Expressions

A CASE expression can contain another CASE expression.

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price >= 10000 THEN
            CASE
                WHEN price >= 50000 THEN 'Premium'
                ELSE 'Mid Range'
            END
        ELSE 'Budget'
    END AS price_category
FROM products;
```

Behaviour:

| Price | Category  |
| ----: | --------- |
|   500 | Budget    |
| 15000 | Mid Range |
| 60000 | Premium   |

Nested CASE is valid, but excessive nesting can make queries difficult to maintain.

Prefer simpler searched CASE expressions when possible.

---

## 15. CASE vs COALESCE vs NULLIF

These expressions solve different problems.

| Expression | Purpose                                            |
| ---------- | -------------------------------------------------- |
| CASE       | Conditional result based on one or more conditions |
| COALESCE   | Returns the first non-NULL value                   |
| NULLIF     | Returns NULL when two expressions are equal        |

### CASE

```sql
SELECT
    CASE
        WHEN price > 1000 THEN 'Expensive'
        ELSE 'Affordable'
    END
FROM products;
```

### COALESCE

```sql
SELECT
    COALESCE(email, 'Not Available')
FROM customers;
```

### NULLIF

```sql
SELECT
    total_orders / NULLIF(total_visitors, 0)
FROM campaign_stats;
```

Choose the expression that matches the requirement.

---

## 16. CASE and Data Types

All result expressions in a CASE must be convertible to a common output type.

Incorrect example:

```sql
SELECT
    CASE
        WHEN price > 1000 THEN 'Expensive'
        ELSE 100
    END
FROM products;
```

PostgreSQL cannot resolve the incompatible text and integer result types in this expression.

Correct:

```sql
SELECT
    CASE
        WHEN price > 1000 THEN 'Expensive'
        ELSE '100'
    END
FROM products;
```

Or return numeric values consistently:

```sql
SELECT
    CASE
        WHEN price > 1000 THEN 100
        ELSE 0
    END
FROM products;
```

For more complex expressions, explicit casts may be required.

---

## 17. CASE in Node.js with PostgreSQL

CASE expressions can be used directly inside parameterized queries.

### Example: Categorize products dynamically

```javascript
const result = await pool.query(
  `SELECT
         product_id,
         product_name,
         price,
         CASE
             WHEN price >= $1 THEN 'Premium'
             WHEN price >= $2 THEN 'Mid Range'
             ELSE 'Budget'
         END AS price_category
     FROM products
     ORDER BY price DESC`,
  [10000, 1000],
);

console.log(result.rows);
```

### Important

- `$1` and `$2` are query parameters.
- CASE conditions are evaluated by PostgreSQL.
- The categorization is calculated when the query runs.
- It does not modify the stored product records.

---

## 18. Common CASE Mistakes

| Mistake                            | Explanation                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| Missing END                        | Every CASE expression must end with END                           |
| Incorrect condition order          | Earlier conditions may capture rows intended for later conditions |
| Using `= NULL`                     | Use IS NULL                                                       |
| Incompatible result types          | CASE result branches must resolve to a common type                |
| Forgetting ELSE                    | Unmatched conditions return NULL                                  |
| Excessive nested CASE              | Makes queries difficult to maintain                               |
| Using CASE instead of simple WHERE | Adds unnecessary complexity                                       |
| Assuming CASE updates stored data  | CASE only calculates an expression unless used inside UPDATE      |

---

## 19. Practice Exercises

Use the TechBazaar database.

1. Display employees as `Working` or `Not Working` based on status.
2. Categorize products into Budget, Mid Range, and Premium using price.
3. Display `Email Missing` when a customer's email is NULL.
4. Calculate a 10% discount for products priced above 10,000.
5. Calculate different discounts for products in three price ranges.
6. Count active and inactive employees using CASE with COUNT.
7. Perform the same conditional counts using PostgreSQL's FILTER clause.
8. Group products by calculated price category.
9. Sort orders using custom status priorities.
10. Update multiple employees with different statuses using CASE.
11. Update product prices conditionally using CASE.
12. Use CASE to classify orders into custom business categories.
13. Write a CASE expression that returns a numeric result consistently.
14. Compare CASE, COALESCE, and NULLIF with practical examples.

---

## 20. Interview Questions

**Q1. What is CASE in SQL?**

CASE is a conditional expression that returns different values depending on specified conditions.

**Q2. What are the two types of CASE expressions?**

- Simple CASE: Compares one expression against multiple values.
- Searched CASE: Evaluates independent Boolean conditions.

**Q3. What happens if no CASE condition matches?**

The ELSE result is returned. If ELSE is omitted, NULL is returned.

**Q4. Does CASE stop evaluating after a matching condition?**

CASE returns the result of the first condition that is TRUE.

**Q5. Can CASE be used inside SELECT?**

Yes. It can calculate conditional output values.

**Q6. Can CASE be used inside UPDATE?**

Yes. It can assign different values to rows in one UPDATE statement.

**Q7. Can CASE be used with aggregate functions?**

Yes. It supports conditional aggregation with COUNT, SUM, and other aggregate functions.

**Q8. What is the difference between CASE and COALESCE?**

CASE evaluates conditions. COALESCE returns the first non-NULL expression.

**Q9. What is the difference between CASE and NULLIF?**

CASE evaluates conditions. NULLIF returns NULL when two expressions are equal.

**Q10. Can CASE return different data types?**

Its result branches must resolve to a common data type. Explicit casts may be required.

**Q11. Can CASE be used in ORDER BY?**

Yes. It is useful for custom sorting priorities.

**Q12. Is CASE a procedural IF-ELSE statement?**

No. CASE is an SQL expression that returns a value.

---

## Key Takeaways

- CASE provides conditional logic inside SQL queries.
- Simple CASE compares one expression against specified values.
- Searched CASE evaluates independent conditions.
- The first TRUE condition determines the result.
- ELSE is optional; without it, unmatched conditions return NULL.
- CASE can be used in SELECT, UPDATE, ORDER BY, GROUP BY, and aggregate expressions.
- PostgreSQL FILTER is a useful alternative for conditional aggregation.
- CASE result branches must resolve to a compatible data type.
- COALESCE handles NULL fallback values.
- NULLIF handles equal-value comparisons and can prevent division by zero.
- Use CASE for genuine conditional logic, not to replace straightforward WHERE conditions.
