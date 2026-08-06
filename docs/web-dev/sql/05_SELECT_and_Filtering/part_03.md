---
sidebar_label: "NULL Handling"
sidebar_position: 1
---

# NULL Handling

## 1. Understanding NULL in PostgreSQL

`NULL` represents missing, unknown, or unavailable information in a database.

It does not mean:

- `0`
- Empty string (`''`)
- `FALSE`
- A default value

Example:

```sql
SELECT
    NULL AS missing_value,
    0 AS zero_value,
    '' AS empty_string,
    FALSE AS boolean_value;
```

These are four different values.

### Example table

```sql
CREATE TABLE customer_contacts (
    contact_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20)
);
```

Insert sample records:

```sql
INSERT INTO customer_contacts (customer_name, email, phone)
VALUES
    ('Rahul', 'rahul@example.com', '9876543210'),
    ('Amit', NULL, '9876543211'),
    ('Priya', 'priya@example.com', NULL),
    ('Neha', NULL, NULL),
    ('Rohit', '', '9876543212');
```

Notice:

- Amit has no email.
- Priya has no phone.
- Neha has neither.
- Rohit has an empty email string, not NULL.

---

## 2. Why NULL Requires Special Handling

In SQL, comparing NULL using ordinary comparison operators does not produce TRUE or FALSE. It produces UNKNOWN.

```sql
SELECT
    NULL = NULL AS result1,
    NULL <> NULL AS result2,
    NULL > 10 AS result3;
```

All three comparisons produce NULL (UNKNOWN).

This happens because SQL cannot determine whether two unknown values are equal or whether an unknown value is greater than a number.

**Important:** NULL is not equal to another NULL using `=`.

---

## 3. IS NULL

Use `IS NULL` to find records where a column contains NULL.

### Syntax

```sql
SELECT *
FROM table_name
WHERE column_name IS NULL;
```

Example:

```sql
SELECT *
FROM customer_contacts
WHERE email IS NULL;
```

Returns Amit and Neha.

### Find records with missing phone numbers

```sql
SELECT *
FROM customer_contacts
WHERE phone IS NULL;
```

Returns Priya and Neha.

---

## 4. IS NOT NULL

Use `IS NOT NULL` to find records where a column contains a value.

```sql
SELECT *
FROM customer_contacts
WHERE email IS NOT NULL;
```

Returns Rahul, Priya, and Rohit.

**Important:** An empty string is not NULL, so Rohit's record is included.

---

## 5. Incorrect NULL Comparisons

Never use ordinary equality or inequality operators to check NULL.

Incorrect:

```sql
SELECT *
FROM customer_contacts
WHERE email = NULL;
```

Incorrect:

```sql
SELECT *
FROM customer_contacts
WHERE email <> NULL;
```

Correct:

```sql
SELECT *
FROM customer_contacts
WHERE email IS NULL;
```

```sql
SELECT *
FROM customer_contacts
WHERE email IS NOT NULL;
```

---

## 6. NULL vs Empty String vs Zero

These values have different meanings.

| Value   | Meaning                  |
| ------- | ------------------------ |
| `NULL`  | Missing or unknown value |
| `''`    | Empty string             |
| `0`     | Numeric zero             |
| `FALSE` | Boolean false            |
| `'0'`   | String containing zero   |

Example:

```sql
SELECT *
FROM customer_contacts
WHERE email = '';
```

This retrieves Rohit's record.

To find either NULL or empty email values:

```sql
SELECT *
FROM customer_contacts
WHERE email IS NULL
   OR email = '';
```

This retrieves Amit, Neha, and Rohit.

### NULLIF

`NULLIF(value1, value2)` returns NULL when both arguments are equal. Otherwise, it returns the first argument.

```sql
SELECT
    NULLIF('', '') AS result1,
    NULLIF('hello', '') AS result2;
```

Result:

| result1 | result2 |
| ------- | ------- |
| NULL    | hello   |

Useful when converting empty strings into NULL:

```sql
SELECT
    NULLIF(email, '') AS normalized_email
FROM customer_contacts;
```

This changes only the query output, not stored data.

---

## 7. COALESCE()

`COALESCE()` returns the first non-NULL value from its arguments.

### Syntax

```sql
COALESCE(value1, value2, value3, ...);
```

Example:

```sql
SELECT
    customer_name,
    COALESCE(email, 'Email Not Available') AS email
FROM customer_contacts;
```

If email is NULL, the fallback value is displayed.

### Multiple fallback values

```sql
SELECT
    customer_name,
    COALESCE(email, phone, 'No Contact Available') AS contact
FROM customer_contacts;
```

Evaluation order:

1. Check email.
2. If email is NULL, check phone.
3. If phone is also NULL, return the fallback string.

### COALESCE with numeric values

```sql
SELECT
    product_name,
    COALESCE(price, 0) AS price
FROM products;
```

Displays zero when price is NULL.

**Important:** COALESCE arguments must be convertible to a common data type.

### Real-world example: Calculate order amount

Suppose a query needs to treat a missing discount as zero:

```sql
SELECT
    order_id,
    total_amount,
    COALESCE(discount, 0) AS discount,
    total_amount - COALESCE(discount, 0) AS final_amount
FROM orders;
```

This assumes the `orders` table contains a `discount` column. Add it only if it exists in your schema.

---

## 8. NULLIF()

`NULLIF()` compares two expressions.

If they are equal, it returns NULL. Otherwise, it returns the first expression.

### Syntax

```sql
NULLIF(value1, value2);
```

Examples:

```sql
SELECT
    NULLIF(10, 10) AS result1,
    NULLIF(10, 20) AS result2;
```

Result:

| result1 | result2 |
| ------- | ------: |
| NULL    |      10 |

### Prevent division by zero

Suppose you want to calculate conversion rate:

```sql
SELECT
    total_orders,
    total_visitors,
    total_orders::NUMERIC
        / NULLIF(total_visitors, 0) AS conversion_rate
FROM campaign_stats;
```

If `total_visitors` is zero, `NULLIF` returns NULL instead of zero, preventing division by zero.

The resulting conversion rate is NULL when the denominator is zero.

---

## 9. IS DISTINCT FROM

PostgreSQL provides `IS DISTINCT FROM` for NULL-safe comparison.

Unlike `<>`, it treats NULL as a comparable value.

### Example

```sql
SELECT
    NULL IS DISTINCT FROM NULL AS result1,
    NULL IS DISTINCT FROM 10 AS result2,
    10 IS DISTINCT FROM 10 AS result3;
```

Result:

| result1 | result2 | result3 |
| ------- | ------- | ------- |
| FALSE   | TRUE    | FALSE   |

### Practical example

Find customers whose email differs from a specific value, including customers with NULL emails:

```sql
SELECT *
FROM customer_contacts
WHERE email IS DISTINCT FROM 'rahul@example.com';
```

This returns:

- Customers with a different email.
- Customers whose email is NULL.

It excludes customers whose email equals the specified address.

---

## 10. IS NOT DISTINCT FROM

`IS NOT DISTINCT FROM` performs a NULL-safe equality comparison.

```sql
SELECT
    NULL IS NOT DISTINCT FROM NULL AS result1,
    NULL IS NOT DISTINCT FROM 10 AS result2,
    10 IS NOT DISTINCT FROM 10 AS result3;
```

Result:

| result1 | result2 | result3 |
| ------- | ------- | ------- |
| TRUE    | FALSE   | TRUE    |

### Practical example

```sql
SELECT *
FROM customer_contacts
WHERE email IS NOT DISTINCT FROM NULL;
```

This returns the same rows as:

```sql
SELECT *
FROM customer_contacts
WHERE email IS NULL;
```

Use `IS NOT DISTINCT FROM` when comparing two expressions where both may contain NULL.

---

## 11. Three-Valued Logic

SQL conditions can produce three possible results:

1. TRUE
2. FALSE
3. UNKNOWN

UNKNOWN commonly occurs when NULL participates in comparisons.

### Comparison examples

| Expression         | Result  |
| ------------------ | ------- |
| `10 = 10`          | TRUE    |
| `10 = 20`          | FALSE   |
| `NULL = 10`        | UNKNOWN |
| `NULL <> 10`       | UNKNOWN |
| `NULL > 10`        | UNKNOWN |
| `NULL IS NULL`     | TRUE    |
| `NULL IS NOT NULL` | FALSE   |

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
| TRUE    | TRUE    | TRUE    |
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

**Important:** WHERE returns only rows for which the condition evaluates to TRUE. FALSE and UNKNOWN rows are excluded.

---

## 12. NULL with NOT IN

One of the most important NULL-related SQL mistakes involves `NOT IN`.

Consider:

```sql
SELECT 10 NOT IN (1, 2, NULL);
```

Result: UNKNOWN.

Why?

PostgreSQL evaluates the equivalent comparisons:

```sql
10 <> 1
AND 10 <> 2
AND 10 <> NULL
```

The first two comparisons are TRUE, but the last is UNKNOWN.

Therefore, the complete expression is UNKNOWN.

### Real-world problem

```sql
SELECT *
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
);
```

If the subquery returns even one NULL, the result can be UNKNOWN for every otherwise non-matching customer.

### Safer approach: NOT EXISTS

```sql
SELECT *
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

This retrieves customers who have no matching orders without the `NOT IN` NULL problem.

---

## 13. NULL with Aggregate Functions

Aggregate functions handle NULL differently.

| Function        | NULL behaviour         |
| --------------- | ---------------------- |
| `COUNT(*)`      | Counts all rows        |
| `COUNT(column)` | Counts non-NULL values |
| `SUM(column)`   | Ignores NULL values    |
| `AVG(column)`   | Ignores NULL values    |
| `MIN(column)`   | Ignores NULL values    |
| `MAX(column)`   | Ignores NULL values    |

### Example

```sql
CREATE TABLE salary_data (
    employee_id INT,
    salary NUMERIC(10, 2)
);

INSERT INTO salary_data (employee_id, salary)
VALUES
    (1, 30000),
    (2, 40000),
    (3, NULL),
    (4, 50000);
```

Run:

```sql
SELECT
    COUNT(*) AS total_rows,
    COUNT(salary) AS available_salaries,
    SUM(salary) AS total_salary,
    AVG(salary) AS average_salary
FROM salary_data;
```

Result:

| total_rows | available_salaries | total_salary | average_salary |
| ---------: | -----------------: | -----------: | -------------: |
|          4 |                  3 |       120000 |          40000 |

`COUNT(*)` counts all four records, while `COUNT(salary)` counts only the three non-NULL salary values.

### Important: Aggregate over no rows

Most aggregate functions return NULL when no input rows are available.

`COUNT()` is the exception and returns zero.

---

## 14. NULL with GROUP BY and DISTINCT

PostgreSQL groups NULL values together for grouping and duplicate elimination.

### GROUP BY

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees
FROM employees
GROUP BY department_id;
```

If multiple employees have NULL department IDs, they appear in one NULL group.

### DISTINCT

```sql
SELECT DISTINCT department_id
FROM employees;
```

Only one NULL appears in the result, even if many employees have NULL department IDs.

**Important:** GROUP BY and DISTINCT treat NULL values as belonging to the same group for these purposes. This does not mean NULL equals NULL under ordinary `=` comparison.

---

## 15. NULL with ORDER BY

PostgreSQL supports explicit NULL ordering.

```sql
SELECT *
FROM customers
ORDER BY email ASC NULLS LAST;
```

### Available options

```sql
ORDER BY email ASC NULLS FIRST;
```

```sql
ORDER BY email DESC NULLS LAST;
```

PostgreSQL defaults:

| Sort direction | Default NULL position |
| -------------- | --------------------- |
| ASC            | NULLS LAST            |
| DESC           | NULLS FIRST           |

Use explicit NULL ordering when the placement matters to the application.

---

## 16. NULL with INSERT, UPDATE and Constraints

### INSERT explicit NULL

```sql
INSERT INTO customers (customer_name, email)
VALUES ('Rahul Sharma', NULL);
```

This succeeds only if `email` permits NULL.

### INSERT with omitted column

```sql
INSERT INTO customers (customer_name)
VALUES ('Amit Sharma');
```

The omitted email column receives:

- Its DEFAULT value, if one is defined.
- Otherwise NULL, if NULL is permitted.

### UPDATE a column to NULL

```sql
UPDATE customers
SET email = NULL
WHERE customer_id = 10;
```

This fails if the email column has a NOT NULL constraint.

### NOT NULL constraint

```sql
CREATE TABLE employees_demo (
    employee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL
);
```

The following insert fails:

```sql
INSERT INTO employees_demo (employee_name)
VALUES (NULL);
```

**Important:** A CHECK constraint alone does not necessarily reject NULL.

Example:

```sql
CREATE TABLE products_demo (
    product_id INT,
    price NUMERIC CHECK (price > 0)
);
```

A NULL price passes this CHECK because the condition evaluates to UNKNOWN, not FALSE.

To prohibit NULL, use both:

```sql
price NUMERIC NOT NULL CHECK (price > 0)
```

---

## 17. NULL Handling in Node.js with PostgreSQL

The `pg` library maps PostgreSQL NULL values to JavaScript `null`.

Example:

```javascript
const result = await pool.query(
  `SELECT customer_id, customer_name, email
     FROM customers
     WHERE customer_id = $1`,
  [10],
);

const customer = result.rows[0];

console.log(customer.email);
```

If the database email is NULL:

```javascript
console.log(customer.email); // null
```

### Passing NULL as a query parameter

```javascript
await pool.query(
  `UPDATE customers
     SET email = $1
     WHERE customer_id = $2`,
  [null, 10],
);
```

This sets the email column to SQL NULL, provided the column allows it.

### Dynamic optional filters

Suppose email filtering is optional.

Avoid writing:

```sql
WHERE email = $1
```

and passing NULL when you want to find NULL emails. Ordinary equality does not work that way.

Instead, build the condition deliberately:

```javascript
const result = await pool.query(
  `SELECT *
     FROM customers
     WHERE ($1::text IS NULL OR email = $1)`,
  [email],
);
```

This means:

- If the parameter is NULL, return all customers.
- Otherwise, match the specified email.

For a production application, consider separate query paths when optional filters become complex, and inspect query plans for performance.

---

## 18. Common NULL Mistakes

| Mistake                                     | Correct approach                 |
| ------------------------------------------- | -------------------------------- |
| `column = NULL`                             | `column IS NULL`                 |
| `column <> NULL`                            | `column IS NOT NULL`             |
| Treating empty string as NULL               | Check both conditions separately |
| Using NOT IN with nullable subquery results | Prefer NOT EXISTS                |
| Assuming COUNT(column) counts NULL          | Use COUNT(\*) to count rows      |
| Assuming CHECK rejects NULL                 | Add NOT NULL separately          |
| Assuming COALESCE updates stored data       | It changes only the query result |
| Dividing by a potentially zero value        | Use NULLIF on the denominator    |
| Assuming NULL = NULL is TRUE                | Use IS NOT DISTINCT FROM         |

---

## 19. Practice Exercises

Use the TechBazaar database.

1. Retrieve customers whose email is NULL.
2. Retrieve customers whose email is not NULL.
3. Find customers whose email is either NULL or an empty string.
4. Display `Not Provided` when a customer's email is NULL using COALESCE.
5. Convert empty email strings to NULL using NULLIF in a SELECT query.
6. Find customers whose email is distinct from `rahul@example.com`, including NULL emails.
7. Find customers whose email is not distinct from NULL.
8. Calculate the average product price and observe how NULL prices are handled.
9. Compare COUNT(\*) and COUNT(email) on a table containing NULL values.
10. Group employees by department and inspect the NULL group.
11. Retrieve customers who have no orders using NOT EXISTS.
12. Test NOT IN with a subquery that returns NULL.
13. Use NULLIF to prevent division by zero.
14. Create a table with a CHECK constraint and test whether NULL passes it.
15. Create a NOT NULL column and try inserting NULL.

---

## 20. Interview Questions

**Q1. What is NULL in SQL?**

NULL represents missing or unknown information. It is not equal to zero, an empty string, or FALSE.

**Q2. Why can't we use `= NULL`?**

Because ordinary comparisons involving NULL produce UNKNOWN. Use `IS NULL` instead.

**Q3. What is the difference between NULL and an empty string?**

NULL represents missing information. An empty string is a valid string containing zero characters.

**Q4. What is COALESCE?**

It returns the first non-NULL value from a list of expressions.

**Q5. What is NULLIF?**

It returns NULL when two expressions are equal; otherwise, it returns the first expression.

**Q6. What is the difference between IS DISTINCT FROM and <>?**

`IS DISTINCT FROM` compares values safely even when either value is NULL. `<>` produces UNKNOWN when a compared value is NULL.

**Q7. What is SQL three-valued logic?**

SQL conditions can evaluate to TRUE, FALSE, or UNKNOWN.

**Q8. What is the difference between COUNT(\*) and COUNT(column)?**

- COUNT(\*) counts all rows.
- COUNT(column) counts only non-NULL values in that column.

**Q9. Why can NOT IN produce unexpected results?**

If the list or subquery contains NULL, comparisons can produce UNKNOWN, causing rows to be excluded.

**Q10. Does GROUP BY group NULL values together?**

Yes. PostgreSQL places NULL values into one group.

**Q11. Does a CHECK constraint reject NULL?**

Not necessarily. A CHECK rejects FALSE, but TRUE and UNKNOWN pass. Use NOT NULL separately.

**Q12. How do you prevent division by zero?**

Use NULLIF:

```sql
SELECT numerator / NULLIF(denominator, 0)
FROM calculations;
```

---

## Key Takeaways

- NULL represents missing or unknown information.
- NULL is different from zero, empty string, and FALSE.
- Use IS NULL and IS NOT NULL for NULL checks.
- Ordinary comparisons involving NULL produce UNKNOWN.
- COALESCE returns the first non-NULL value.
- NULLIF converts a matching value into NULL.
- IS DISTINCT FROM and IS NOT DISTINCT FROM provide NULL-safe comparisons.
- SQL uses TRUE, FALSE, and UNKNOWN.
- NOT IN can behave unexpectedly when NULL appears in its input.
- COUNT(\*) counts rows; COUNT(column) ignores NULL.
- GROUP BY and DISTINCT treat NULL values together.
- CHECK constraints do not automatically reject NULL.
- Use NULLIF to prevent division-by-zero errors.
- In Node.js with `pg`, PostgreSQL NULL values are represented as JavaScript `null`.
