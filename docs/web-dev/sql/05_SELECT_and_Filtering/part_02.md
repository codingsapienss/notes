---
sidebar_label: "WHERE and Filtering Operators"
sidebar_position: 1
---

# WHERE and Filtering Operators

## 1. Introduction to WHERE

`WHERE` is used to filter rows based on specified conditions.

Only rows satisfying the condition are returned by a SELECT query.

### Syntax

```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```

Example:

```sql
SELECT *
FROM employees
WHERE department_id = 1;
```

Returns employees belonging to department `1`.

`WHERE` is also used with:

- `UPDATE`
- `DELETE`

Example:

```sql
UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5;
```

```sql
DELETE FROM employees
WHERE employee_id = 5;
```

**Important:** Without a WHERE condition, UPDATE and DELETE affect every row in the target table.

---

## 2. Comparison Operators

Comparison operators compare two values.

| Operator | Meaning               | Example         |
| -------- | --------------------- | --------------- |
| `=`      | Equal                 | `price = 1000`  |
| `<>`     | Not equal             | `price <> 1000` |
| `!=`     | Not equal             | `price != 1000` |
| `>`      | Greater than          | `price > 1000`  |
| `<`      | Less than             | `price < 1000`  |
| `>=`     | Greater than or equal | `price >= 1000` |
| `<=`     | Less than or equal    | `price <= 1000` |

PostgreSQL supports both `<>` and `!=` for inequality. `<>` is the SQL-standard operator.

### Examples

```sql
-- Products costing more than 1,000
SELECT *
FROM products
WHERE price > 1000;
```

```sql
-- Employees whose status is not inactive
SELECT *
FROM employees
WHERE status <> 'inactive';
```

```sql
-- Orders with an amount greater than or equal to 5,000
SELECT *
FROM orders
WHERE total_amount >= 5000;
```

Use the actual column names defined in your schema.

---

## 3. Logical Operators: AND, OR, NOT

Logical operators combine or reverse conditions.

### AND

All conditions must be TRUE.

```sql
SELECT *
FROM products
WHERE price > 1000
  AND category_id = 2;
```

Returns products satisfying both conditions.

### OR

At least one condition must be TRUE.

```sql
SELECT *
FROM employees
WHERE department_id = 1
   OR department_id = 2;
```

Returns employees belonging to either department.

### NOT

Reverses a condition.

```sql
SELECT *
FROM employees
WHERE NOT status = 'inactive';
```

Equivalent to:

```sql
SELECT *
FROM employees
WHERE status <> 'inactive';
```

However, these expressions differ when `status` is NULL: both exclude NULL rows because the comparison produces UNKNOWN.

### Combining AND and OR

```sql
SELECT *
FROM products
WHERE category_id = 1
  AND (price < 500 OR price > 5000);
```

Parentheses make the intended logic explicit.

### Operator precedence

PostgreSQL evaluates logical operators in this order:

1. `NOT`
2. `AND`
3. `OR`

Example:

```sql
SELECT *
FROM employees
WHERE department_id = 1
   OR department_id = 2
  AND status = 'active';
```

This is interpreted as:

```sql
WHERE department_id = 1
   OR (department_id = 2 AND status = 'active');
```

If you want both departments to require active status:

```sql
SELECT *
FROM employees
WHERE (department_id = 1 OR department_id = 2)
  AND status = 'active';
```

**Best practice:** Use parentheses whenever combining multiple AND and OR conditions.

---

## 4. BETWEEN Operator

`BETWEEN` checks whether a value falls within a range.

### Syntax

```sql
SELECT *
FROM table_name
WHERE column_name BETWEEN value1 AND value2;
```

Both endpoints are inclusive.

### Example

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

Equivalent to:

```sql
SELECT *
FROM products
WHERE price >= 1000
  AND price <= 5000;
```

### NOT BETWEEN

```sql
SELECT *
FROM products
WHERE price NOT BETWEEN 1000 AND 5000;
```

Returns products priced below 1,000 or above 5,000.

### BETWEEN with dates

```sql
SELECT *
FROM orders
WHERE created_at BETWEEN
    TIMESTAMP '2026-01-01 00:00:00'
    AND TIMESTAMP '2026-01-31 23:59:59';
```

**Important:** For timestamp ranges, using an exclusive upper boundary is generally safer, especially when timestamp precision matters.

Recommended pattern:

```sql
SELECT *
FROM orders
WHERE created_at >= TIMESTAMP '2026-01-01 00:00:00'
  AND created_at < TIMESTAMP '2026-02-01 00:00:00';
```

This includes the entire month of January without depending on timestamp precision.

---

## 5. IN Operator

`IN` checks whether a value matches any value in a specified list.

### Syntax

```sql
SELECT *
FROM table_name
WHERE column_name IN (value1, value2, value3);
```

### Example

```sql
SELECT *
FROM employees
WHERE department_id IN (1, 2, 3);
```

Equivalent to:

```sql
SELECT *
FROM employees
WHERE department_id = 1
   OR department_id = 2
   OR department_id = 3;
```

### NOT IN

```sql
SELECT *
FROM employees
WHERE department_id NOT IN (1, 2);
```

Returns employees whose department ID is neither 1 nor 2, excluding NULL department IDs.

### IN with a subquery

```sql
SELECT *
FROM products
WHERE category_id IN (
    SELECT category_id
    FROM categories
    WHERE category_name IN ('Electronics', 'Accessories')
);
```

The inner query retrieves category IDs. The outer query retrieves products belonging to those categories.

**Important NULL behaviour:** If a `NOT IN` subquery returns even one NULL, the result can become UNKNOWN for otherwise non-matching rows. Prefer `NOT EXISTS` when checking that no related record exists.

---

## 6. LIKE Operator

`LIKE` performs pattern matching on strings.

PostgreSQL supports two important wildcards:

| Wildcard | Meaning                 |
| -------- | ----------------------- |
| `%`      | Zero or more characters |
| `_`      | Exactly one character   |

### Starts with

```sql
SELECT *
FROM customers
WHERE customer_name LIKE 'Rah%';
```

Matches names beginning with `Rah`.

Examples: Rahul, Rakesh, Rahim.

### Ends with

```sql
SELECT *
FROM customers
WHERE customer_name LIKE '%sh';
```

Matches names ending with `sh`.

### Contains

```sql
SELECT *
FROM customers
WHERE customer_name LIKE '%rah%';
```

Matches names containing `rah`.

### Exactly one character wildcard

```sql
SELECT *
FROM customers
WHERE customer_name LIKE 'A_it';
```

Matches four-character strings beginning with A and ending with it, with any single character in the middle.

### NOT LIKE

```sql
SELECT *
FROM customers
WHERE customer_name NOT LIKE 'Rah%';
```

Returns names that do not match the pattern, excluding NULL values.

**Important:** `LIKE` is case-sensitive in PostgreSQL.

---

## 7. ILIKE Operator — PostgreSQL-Specific

`ILIKE` performs case-insensitive pattern matching.

```sql
SELECT *
FROM customers
WHERE customer_name ILIKE 'rah%';
```

Matches values such as:

- Rahul
- RAHUL
- rahul
- RaHuL

### Contains search

```sql
SELECT *
FROM customers
WHERE customer_name ILIKE '%sharma%';
```

Useful for case-insensitive search in applications.

### ILIKE with NOT

```sql
SELECT *
FROM customers
WHERE customer_name NOT ILIKE '%test%';
```

Excludes names containing `test`, regardless of letter case.

**Important:** `ILIKE` is a PostgreSQL extension, not part of standard SQL.

---

## 8. IS NULL and IS NOT NULL

`NULL` represents missing or unknown information.

It is not equal to:

- Zero
- Empty string
- False

### Find NULL values

```sql
SELECT *
FROM customers
WHERE email IS NULL;
```

### Find non-NULL values

```sql
SELECT *
FROM customers
WHERE email IS NOT NULL;
```

### Incorrect NULL comparison

```sql
SELECT *
FROM customers
WHERE email = NULL;
```

This does not correctly match NULL values.

Use:

```sql
WHERE email IS NULL;
```

### IS DISTINCT FROM

PostgreSQL provides `IS DISTINCT FROM` for NULL-safe comparisons.

```sql
SELECT *
FROM customers
WHERE email IS DISTINCT FROM 'rahul@example.com';
```

Behaviour:

| email               | Result |
| ------------------- | ------ |
| `rahul@example.com` | FALSE  |
| `amit@example.com`  | TRUE   |
| NULL                | TRUE   |

Unlike `<>`, this operator treats NULL as a comparable value.

### IS NOT DISTINCT FROM

```sql
SELECT *
FROM customers
WHERE email IS NOT DISTINCT FROM 'rahul@example.com';
```

It returns TRUE when the values are equal, including when both compared values are NULL.

---

## 9. Understanding SQL's Three-Valued Logic

SQL conditions can produce three results:

- TRUE
- FALSE
- UNKNOWN

UNKNOWN commonly occurs when NULL participates in a comparison.

Example:

```sql
SELECT
    NULL = 10 AS comparison,
    NULL <> 10 AS inequality,
    NULL IS NULL AS null_check;
```

Conceptually:

| Expression     | Result  |
| -------------- | ------- |
| `NULL = 10`    | UNKNOWN |
| `NULL <> 10`   | UNKNOWN |
| `NULL IS NULL` | TRUE    |

### AND truth table

| A       | B       | A AND B |
| ------- | ------- | ------- |
| TRUE    | TRUE    | TRUE    |
| TRUE    | FALSE   | FALSE   |
| TRUE    | UNKNOWN | UNKNOWN |
| FALSE   | UNKNOWN | FALSE   |
| UNKNOWN | UNKNOWN | UNKNOWN |

### OR truth table

| A       | B       | A OR B  |
| ------- | ------- | ------- |
| TRUE    | UNKNOWN | TRUE    |
| FALSE   | UNKNOWN | UNKNOWN |
| FALSE   | FALSE   | FALSE   |
| UNKNOWN | UNKNOWN | UNKNOWN |

### NOT truth table

| A       | NOT A   |
| ------- | ------- |
| TRUE    | FALSE   |
| FALSE   | TRUE    |
| UNKNOWN | UNKNOWN |

**Important:** A WHERE clause returns only rows where the condition is TRUE. Rows producing FALSE or UNKNOWN are excluded.

---

## 10. ANY and SOME Operators

`ANY` compares a value against the results of a subquery or array.

The condition is TRUE if at least one comparison is TRUE.

### Example

```sql
SELECT *
FROM products
WHERE price > ANY (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

Returns products whose price is greater than at least one price in category 1.

### Equivalent example using IN

```sql
SELECT *
FROM employees
WHERE department_id = ANY (ARRAY[1, 2, 3]);
```

This is equivalent to:

```sql
SELECT *
FROM employees
WHERE department_id IN (1, 2, 3);
```

`SOME` is a synonym for `ANY`.

---

## 11. ALL Operator

`ALL` compares a value against every value returned by a subquery or array.

The condition is TRUE only if every comparison is TRUE.

### Example

```sql
SELECT *
FROM products
WHERE price > ALL (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

Returns products whose price is greater than every price in category 1.

### ANY vs ALL

| Operator       | Meaning                         |
| -------------- | ------------------------------- |
| `> ANY (...)`  | Greater than at least one value |
| `> ALL (...)`  | Greater than every value        |
| `= ANY (...)`  | Equal to at least one value     |
| `<> ALL (...)` | Not equal to every value        |

**Important:** NULL values in the comparison set can produce UNKNOWN results. Empty subqueries also have special behaviour: `ANY` over an empty set is FALSE, while `ALL` over an empty set is TRUE.

---

## 12. EXISTS and NOT EXISTS

`EXISTS` checks whether a subquery returns at least one row.

### EXISTS

```sql
SELECT *
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

Returns customers who have at least one order.

### NOT EXISTS

```sql
SELECT *
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

Returns customers who have no orders.

### Important

- `EXISTS` checks whether rows exist.
- The values selected inside the subquery are irrelevant; `SELECT 1` is a common convention.
- `NOT EXISTS` is generally safer than `NOT IN` when the subquery may contain NULL values.

Detailed subquery behaviour is covered in Part 9.

---

## 13. SIMILAR TO and Regular Expressions

PostgreSQL provides advanced pattern matching beyond LIKE.

### SIMILAR TO

`SIMILAR TO` supports SQL regular-expression-like pattern matching.

```sql
SELECT *
FROM customers
WHERE customer_name SIMILAR TO '(Rahul|Amit)%';
```

Matches names beginning with Rahul or Amit.

### Regular expression matching

PostgreSQL supports POSIX regular expressions.

| Operator | Meaning                          |
| -------- | -------------------------------- |
| `~`      | Case-sensitive regex match       |
| `~*`     | Case-insensitive regex match     |
| `!~`     | Case-sensitive regex non-match   |
| `!~*`    | Case-insensitive regex non-match |

Example:

```sql
SELECT *
FROM customers
WHERE customer_name ~* '^rah';
```

Matches names beginning with `rah`, regardless of case.

Example with digits:

```sql
SELECT *
FROM customers
WHERE customer_name ~ '[0-9]';
```

Matches names containing at least one digit.

Use regular expressions when LIKE or ILIKE is insufficient.

---

## 14. Filtering with Dates and Times

PostgreSQL supports comparisons on DATE, TIMESTAMP, and TIMESTAMPTZ columns.

### Orders after a date

```sql
SELECT *
FROM orders
WHERE created_at >= DATE '2026-01-01';
```

### Orders before a date

```sql
SELECT *
FROM orders
WHERE created_at < DATE '2026-02-01';
```

### Orders within a month

```sql
SELECT *
FROM orders
WHERE created_at >= TIMESTAMP '2026-01-01 00:00:00'
  AND created_at < TIMESTAMP '2026-02-01 00:00:00';
```

### Current date

```sql
SELECT *
FROM orders
WHERE created_at::date = CURRENT_DATE;
```

This retrieves orders whose date matches today.

**Performance note:** Casting the table column with `::date` can prevent a normal index on `created_at` from being used as efficiently. For indexed timestamp columns, prefer a range condition:

```sql
SELECT *
FROM orders
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day';
```

For `TIMESTAMPTZ`, the date boundaries are interpreted using the session time zone. Make sure this matches the business time zone.

---

## 15. Combining Multiple Filtering Operators

Real-world queries often combine several operators.

### Example: Active employees in selected departments

```sql
SELECT *
FROM employees
WHERE status = 'active'
  AND department_id IN (1, 2, 3);
```

### Example: Products within a price range

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 10000
  AND category_id = 2;
```

### Example: Customers with matching names and available emails

```sql
SELECT *
FROM customers
WHERE customer_name ILIKE '%sharma%'
  AND email IS NOT NULL;
```

### Example: Orders from a date range with selected statuses

```sql
SELECT *
FROM orders
WHERE created_at >= TIMESTAMP '2026-01-01 00:00:00'
  AND created_at < TIMESTAMP '2026-02-01 00:00:00'
  AND status IN ('pending', 'completed');
```

---

## 16. WHERE with UPDATE and DELETE

Filtering is not limited to SELECT.

### UPDATE with multiple conditions

```sql
UPDATE products
SET price = price * 1.10
WHERE category_id = 2
  AND price < 5000;
```

Only matching products are updated.

### DELETE with multiple conditions

```sql
DELETE FROM orders
WHERE status = 'cancelled'
  AND created_at < TIMESTAMP '2025-01-01 00:00:00'
RETURNING *;
```

Only matching orders are deleted.

**Production practice:** Before running an UPDATE or DELETE, execute a SELECT using the same WHERE condition to verify the affected rows.

---

## 17. Filtering and Index Performance

Filtering performance depends on indexes, data distribution, table size, and query structure.

### Example

```sql
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

A B-tree index on `email` can help PostgreSQL locate matching rows efficiently.

### LIKE and indexes

A normal B-tree index can often support prefix searches:

```sql
SELECT *
FROM customers
WHERE customer_name LIKE 'Rah%';
```

However, a leading wildcard generally prevents a normal B-tree index from supporting the search efficiently:

```sql
SELECT *
FROM customers
WHERE customer_name LIKE '%Rah%';
```

For large-scale substring searches, PostgreSQL's `pg_trgm` extension with a GIN or GiST index may help.

### Case-insensitive filtering

For frequent case-insensitive equality searches:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = LOWER('RAHUL@EXAMPLE.COM');
```

A matching expression index can help:

```sql
CREATE INDEX idx_customers_lower_email
ON customers (LOWER(email));
```

**Important:** Do not add indexes to every filtered column automatically. Indexes consume storage and add overhead to INSERT, UPDATE, and DELETE operations.

---

## 18. Common Filtering Mistakes

| Mistake                                      | Problem                                        |
| -------------------------------------------- | ---------------------------------------------- |
| Using `= NULL`                               | NULL must be checked with `IS NULL`            |
| Using NOT IN with NULL values                | Can unexpectedly exclude all non-matching rows |
| Forgetting parentheses                       | AND/OR precedence can change the result        |
| Assuming BETWEEN excludes endpoints          | BETWEEN includes both endpoints                |
| Using LIKE for case-insensitive matching     | LIKE is case-sensitive                         |
| Using ILIKE in non-PostgreSQL databases      | ILIKE is PostgreSQL-specific                   |
| Using a timestamp upper boundary of 23:59:59 | Can miss fractional-second records             |
| Using leading-wildcard LIKE on huge tables   | Can be expensive without specialized indexing  |
| Ignoring NULL in logical conditions          | UNKNOWN rows are filtered out by WHERE         |

---

## 19. Practice Exercises

Use the TechBazaar database.

1. Retrieve employees belonging to department 1.
2. Retrieve employees whose status is not inactive.
3. Retrieve products priced above ₹5,000.
4. Retrieve products priced between ₹1,000 and ₹10,000.
5. Retrieve employees belonging to departments 1, 2, and 3 using IN.
6. Retrieve customers whose names start with `A`.
7. Retrieve customers whose names contain `sharma`, case-insensitively.
8. Retrieve customers whose email is NULL.
9. Retrieve customers whose email is not NULL.
10. Retrieve orders created during January 2026 using an exclusive upper date boundary.
11. Retrieve active employees from departments 1 or 2 using parentheses.
12. Retrieve customers who have at least one order using EXISTS.
13. Retrieve customers who have no orders using NOT EXISTS.
14. Retrieve products priced higher than every product in category 1 using ALL.
15. Retrieve products priced higher than at least one product in category 1 using ANY.
16. Find customers whose names contain a numeric digit using a regular expression.
17. Update products in category 2 with a price increase of 10%.
18. Delete cancelled orders older than a specified date, after verifying the matching rows with SELECT.

---

## 20. Interview Questions

**Q1. What is WHERE in SQL?**

WHERE filters rows based on specified conditions.

**Q2. What is the difference between AND and OR?**

- AND requires every condition to be TRUE.
- OR requires at least one condition to be TRUE.

**Q3. What is the difference between BETWEEN and IN?**

- BETWEEN checks whether a value falls within an inclusive range.
- IN checks whether a value matches one of the specified values.

**Q4. What is the difference between LIKE and ILIKE?**

- LIKE performs case-sensitive pattern matching.
- ILIKE performs case-insensitive pattern matching in PostgreSQL.

**Q5. What is the difference between IN and EXISTS?**

- IN checks whether a value matches a value returned by a list or subquery.
- EXISTS checks whether a subquery returns at least one row.

**Q6. What is the difference between ANY and ALL?**

- ANY requires at least one comparison to be TRUE.
- ALL requires every comparison to be TRUE.

**Q7. Why should NOT EXISTS often be preferred over NOT IN?**

NOT IN can produce UNKNOWN results when its subquery returns NULL. NOT EXISTS avoids this particular NULL-related problem.

**Q8. What is SQL three-valued logic?**

SQL conditions can produce TRUE, FALSE, or UNKNOWN. Comparisons involving NULL commonly produce UNKNOWN.

**Q9. What is the difference between IS NULL and IS DISTINCT FROM?**

- IS NULL checks whether a value is NULL.
- IS DISTINCT FROM performs a NULL-safe comparison between two values.

**Q10. Does BETWEEN include its endpoints?**

Yes. Both lower and upper endpoints are included.

**Q11. What is the difference between LIKE and regular expressions?**

LIKE supports simple `%` and `_` wildcards. Regular expressions support more complex patterns.

**Q12. Can WHERE be used with UPDATE and DELETE?**

Yes. It determines which rows are modified or removed.

---

## Key Takeaways

- `WHERE` filters rows based on conditions.
- Comparison operators evaluate equality and ranges.
- AND, OR, and NOT combine conditions.
- BETWEEN includes both endpoints.
- IN matches values from a list or subquery.
- LIKE is case-sensitive; ILIKE is case-insensitive in PostgreSQL.
- IS NULL and IS NOT NULL handle missing values.
- IS DISTINCT FROM provides NULL-safe comparison.
- SQL uses TRUE, FALSE, and UNKNOWN.
- ANY checks whether at least one comparison is TRUE.
- ALL requires every comparison to be TRUE.
- EXISTS and NOT EXISTS check whether related rows exist.
- PostgreSQL supports SIMILAR TO and POSIX regular expressions.
- Use exclusive upper boundaries for timestamp ranges.
- Indexes can improve filtering performance, but must be chosen based on actual query patterns.
