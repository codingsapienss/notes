---
sidebar_label: "SELECT Fundamentals"
sidebar_position: 1
---

# SELECT Fundamentals

## 1. Introduction to SELECT

`SELECT` is a DQL (Data Query Language) command used to retrieve data from database tables.

It allows you to:

- Retrieve all columns or specific columns.
- Fetch individual records.
- Retrieve calculated values.
- Remove duplicate results using `DISTINCT`.
- Filter, sort, and limit results.
- Retrieve data from multiple tables using joins and subqueries.

Unlike INSERT, UPDATE, and DELETE, SELECT does not modify stored table data.

---

## 2. Basic SELECT Syntax

```sql
SELECT column1, column2
FROM table_name;
```

Example:

```sql
SELECT first_name, last_name
FROM employees;
```

This retrieves only the `first_name` and `last_name` columns from the `employees` table.

### SELECT all columns

```sql
SELECT *
FROM employees;
```

`*` represents all columns in the table.

**Best practice:** Use explicit column names in production queries instead of `SELECT *`. This reduces unnecessary data retrieval and makes queries more predictable.

---

## 3. SELECT Specific Columns

You can retrieve any combination of columns.

```sql
SELECT
    employee_id,
    first_name,
    email,
    department_id
FROM employees;
```

The output contains only the requested columns.

The order of columns in the SELECT clause determines their order in the result.

```sql
SELECT email, first_name, employee_id
FROM employees;
```

The result columns appear in that same order.

---

## 4. SELECT with Column Aliases

Aliases give temporary names to columns in query results.

### Using AS

```sql
SELECT
    first_name AS employee_name,
    email AS employee_email
FROM employees;
```

### Without AS

```sql
SELECT
    first_name employee_name,
    email employee_email
FROM employees;
```

Both are valid PostgreSQL syntax.

### Alias with calculated expressions

```sql
SELECT
    product_name,
    price,
    price * 0.18 AS tax_amount
FROM products;
```

The alias `tax_amount` is used as the output column name.

**Important:** A column alias does not rename the actual table column.

---

## 5. SELECT with Expressions and Calculations

You can perform calculations directly inside SELECT.

### Addition

```sql
SELECT
    product_name,
    price,
    price + 500 AS updated_price
FROM products;
```

### Multiplication

```sql
SELECT
    product_name,
    price,
    price * 1.10 AS price_after_increase
FROM products;
```

### Subtraction

```sql
SELECT
    product_name,
    price,
    price - 100 AS discounted_price
FROM products;
```

### Multiple calculations

```sql
SELECT
    product_name,
    price,
    price * 0.18 AS tax,
    price + (price * 0.18) AS price_with_tax
FROM products;
```

These calculations affect only the query result. They do not update the stored price.

---

## 6. SELECT with DISTINCT

`DISTINCT` removes duplicate rows from the query result.

### Syntax

```sql
SELECT DISTINCT column_name
FROM table_name;
```

### Example: Get unique employee statuses

```sql
SELECT DISTINCT status
FROM employees;
```

If many employees have the same status, each status appears only once.

### DISTINCT on multiple columns

```sql
SELECT DISTINCT department_id, status
FROM employees;
```

PostgreSQL returns unique combinations of `department_id` and `status`.

Example:

| department_id | status   |
| ------------: | -------- |
|             1 | active   |
|             1 | inactive |
|             2 | active   |
|             3 | active   |

A department can appear multiple times if its status combination differs.

### DISTINCT ON — PostgreSQL-specific

PostgreSQL provides `DISTINCT ON` to return one row for each distinct value of specified expressions.

Example:

```sql
SELECT DISTINCT ON (department_id)
    employee_id,
    first_name,
    department_id
FROM employees
ORDER BY department_id, employee_id;
```

This returns one employee per department, choosing the row with the smallest `employee_id`.

**Important:**

- `DISTINCT ON` is PostgreSQL-specific.
- Its expressions must match the leftmost `ORDER BY` expressions.
- Without a suitable `ORDER BY`, the selected row is unpredictable.

---

## 7. SELECT with String Concatenation

PostgreSQL supports the `||` operator for string concatenation.

```sql
SELECT
    first_name || ' ' || last_name AS full_name
FROM employees;
```

Example result:

| full_name    |
| ------------ |
| Rahul Sharma |
| Priya Singh  |

### CONCAT function

```sql
SELECT
    CONCAT(first_name, ' ', last_name) AS full_name
FROM employees;
```

`CONCAT()` treats NULL arguments as empty strings.

With the `||` operator, a NULL operand normally makes the entire concatenated expression NULL.

Example:

```sql
SELECT
    first_name || ' ' || last_name AS full_name,
    CONCAT(first_name, ' ', last_name) AS safe_full_name
FROM employees;
```

This distinction matters when nullable columns are involved.

---

## 8. SELECT with NULL Values

SQL uses `NULL` to represent missing or unknown information.

You cannot reliably compare NULL using `=`.

Incorrect:

```sql
SELECT *
FROM customers
WHERE email = NULL;
```

Correct:

```sql
SELECT *
FROM customers
WHERE email IS NULL;
```

To retrieve records where email is present:

```sql
SELECT *
FROM customers
WHERE email IS NOT NULL;
```

### COALESCE in SELECT

`COALESCE()` returns the first non-NULL argument.

```sql
SELECT
    customer_name,
    COALESCE(email, 'Not Provided') AS email
FROM customers;
```

This displays `Not Provided` when the email is NULL.

It changes only the query output, not the stored data.

---

## 9. SELECT Without FROM

PostgreSQL allows SELECT expressions without a table.

```sql
SELECT 10 + 20 AS result;
```

Output:

| result |
| -----: |
|     30 |

### Multiple expressions

```sql
SELECT
    100 AS price,
    18 AS tax_percentage,
    100 * 0.18 AS tax_amount;
```

### Current date and timestamp

```sql
SELECT
    CURRENT_DATE AS today,
    CURRENT_TIMESTAMP AS current_timestamp;
```

Useful for calculations, testing expressions, and retrieving database-generated values.

---

## 10. SELECT with WHERE

`WHERE` filters rows based on a condition.

```sql
SELECT *
FROM employees
WHERE department_id = 1;
```

Only employees belonging to department 1 are returned.

Another example:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

Only products with prices greater than 1000 are returned.

Common operators include:

| Operator     | Meaning                             |
| ------------ | ----------------------------------- |
| `=`          | Equal                               |
| `<>` or `!=` | Not equal                           |
| `>`          | Greater than                        |
| `<`          | Less than                           |
| `>=`         | Greater than or equal               |
| `<=`         | Less than or equal                  |
| `AND`        | Both conditions must be true        |
| `OR`         | At least one condition must be true |
| `IN`         | Matches any value in a list         |
| `BETWEEN`    | Within a range                      |
| `LIKE`       | Pattern matching                    |
| `IS NULL`    | Checks for NULL                     |

Detailed filtering behaviour is covered in Part 5B.

---

## 11. SELECT with ORDER BY

`ORDER BY` sorts the query result.

### Ascending order

```sql
SELECT *
FROM products
ORDER BY price ASC;
```

`ASC` sorts from lowest to highest. It is the default direction.

### Descending order

```sql
SELECT *
FROM products
ORDER BY price DESC;
```

Sorts from highest to lowest.

### Sort by multiple columns

```sql
SELECT *
FROM employees
ORDER BY department_id ASC, first_name ASC;
```

PostgreSQL:

1. Sorts by department ID.
2. For equal department IDs, sorts by first name.

### NULL sorting

PostgreSQL supports explicit NULL ordering:

```sql
SELECT *
FROM customers
ORDER BY email ASC NULLS LAST;
```

Available options:

- `NULLS FIRST`
- `NULLS LAST`

PostgreSQL defaults:

- `ASC` → NULL values last.
- `DESC` → NULL values first.

---

## 12. SELECT with LIMIT and OFFSET

`LIMIT` restricts the number of rows returned.

```sql
SELECT *
FROM products
LIMIT 5;
```

Returns at most five rows.

### OFFSET

`OFFSET` skips a specified number of rows.

```sql
SELECT *
FROM products
LIMIT 5 OFFSET 10;
```

Skips the first ten rows and returns the next five.

### Pagination example

Page 1:

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 0;
```

Page 2:

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 10;
```

Page 3:

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 20;
```

General formula:

\[
OFFSET = (page - 1) \times page_size
\]

**Important:** Always use a deterministic `ORDER BY` for predictable pagination.

Large OFFSET values can become inefficient because PostgreSQL still has to identify and skip preceding rows.

Keyset pagination is often more efficient for large datasets and is covered in Part 5D.

---

## 13. SELECT with FETCH

PostgreSQL also supports the SQL-standard `FETCH` syntax.

```sql
SELECT *
FROM products
ORDER BY product_id
FETCH FIRST 5 ROWS ONLY;
```

This is equivalent to:

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 5;
```

You can also use:

```sql
SELECT *
FROM products
ORDER BY product_id
OFFSET 5 ROWS
FETCH NEXT 5 ROWS ONLY;
```

`FETCH FIRST` and `FETCH NEXT` are useful alternatives to `LIMIT`.

---

## 14. SELECT with Aggregate Functions

Aggregate functions calculate a result from multiple rows.

Common aggregate functions:

| Function  | Purpose                        |
| --------- | ------------------------------ |
| `COUNT()` | Counts rows or non-NULL values |
| `SUM()`   | Calculates total               |
| `AVG()`   | Calculates average             |
| `MIN()`   | Finds minimum                  |
| `MAX()`   | Finds maximum                  |

### COUNT

```sql
SELECT COUNT(*)
FROM employees;
```

Counts all rows.

### SUM

```sql
SELECT SUM(price)
FROM products;
```

Calculates the sum of non-NULL product prices.

### AVG

```sql
SELECT AVG(price)
FROM products;
```

Calculates the average of non-NULL prices.

### MIN and MAX

```sql
SELECT
    MIN(price) AS minimum_price,
    MAX(price) AS maximum_price
FROM products;
```

**Important:** Aggregate functions generally ignore NULL values, except `COUNT(*)`, which counts rows regardless of NULL values.

Detailed aggregation is covered in Part 8.

---

## 15. SELECT with GROUP BY

`GROUP BY` groups rows that share the same values in specified columns.

Example: Count employees in each department.

```sql
SELECT
    department_id,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id;
```

Example result:

| department_id | employee_count |
| ------------: | -------------: |
|             1 |              5 |
|             2 |              3 |
|             3 |              7 |

`GROUP BY` is commonly used with aggregate functions.

Detailed grouping behaviour is covered in Part 8.

---

## 16. SELECT with JOIN

`JOIN` combines related records from multiple tables.

Example: Retrieve employee names and department names.

```sql
SELECT
    e.employee_id,
    e.first_name,
    d.department_name
FROM employees AS e
INNER JOIN departments AS d
    ON e.department_id = d.department_id;
```

Here:

- `employees` is the first table.
- `departments` is the second table.
- `ON` specifies the relationship.
- `e` and `d` are table aliases.

Detailed JOIN operations are covered in Part 7.

---

## 17. SELECT with Subqueries

A subquery is a query nested inside another SQL statement.

Example: Find products priced above the average product price.

```sql
SELECT *
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

The inner query calculates the average price.

The outer query retrieves products whose price exceeds that average.

Detailed subqueries are covered in Part 9.

---

## 18. SELECT with DISTINCT vs GROUP BY

Both can produce unique combinations, but their purposes differ.

### DISTINCT

```sql
SELECT DISTINCT department_id
FROM employees;
```

Retrieves unique department IDs.

### GROUP BY

```sql
SELECT department_id
FROM employees
GROUP BY department_id;
```

Also retrieves unique department IDs.

### Main difference

| DISTINCT                             | GROUP BY                            |
| ------------------------------------ | ----------------------------------- |
| Removes duplicate result rows        | Groups rows                         |
| Primarily used for unique results    | Commonly used for aggregation       |
| Does not require aggregate functions | Often used with aggregate functions |

Example:

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees
FROM employees
GROUP BY department_id;
```

Use `GROUP BY` when you need calculations for each group.

---

## 19. SELECT Execution Order

SQL is written in one order, but PostgreSQL logically processes a SELECT query in a different order.

Consider:

```sql
SELECT
    department_id,
    COUNT(*) AS total_employees
FROM employees
WHERE status = 'active'
GROUP BY department_id
HAVING COUNT(*) > 2
ORDER BY total_employees DESC
LIMIT 5;
```

Logical processing order:

| Order | Clause         | Purpose                        |
| ----: | -------------- | ------------------------------ |
|     1 | FROM           | Identify source tables         |
|     2 | WHERE          | Filter individual rows         |
|     3 | GROUP BY       | Create groups                  |
|     4 | HAVING         | Filter groups                  |
|     5 | SELECT         | Calculate selected expressions |
|     6 | DISTINCT       | Remove duplicate result rows   |
|     7 | ORDER BY       | Sort results                   |
|     8 | LIMIT / OFFSET | Restrict returned rows         |

**Important:** This is the logical processing model, not a guarantee of the physical execution plan. PostgreSQL's query planner can optimize the actual execution.

---

## 20. SELECT in Node.js with PostgreSQL

Use parameterized queries when passing application values.

### Example using `pg`

```javascript
const result = await pool.query(
  `SELECT employee_id, first_name, email
     FROM employees
     WHERE department_id = $1`,
  [1],
);

console.log(result.rows);
```

### Fetch one customer

```javascript
const result = await pool.query(
  `SELECT customer_id, customer_name, email
     FROM customers
     WHERE customer_id = $1`,
  [10],
);

if (result.rowCount === 0) {
  console.log("Customer not found");
} else {
  console.log(result.rows[0]);
}
```

### Fetch paginated products

```javascript
const result = await pool.query(
  `SELECT product_id, product_name, price
     FROM products
     ORDER BY product_id
     LIMIT $1 OFFSET $2`,
  [10, 20],
);

console.log(result.rows);
```

### Important concepts

- `result.rows` contains returned records.
- `result.rowCount` indicates the number of rows returned for a SELECT query.
- `$1`, `$2` are positional parameters.
- Avoid concatenating untrusted input into SQL strings.

**Important:** SQL parameters represent values, not identifiers. You cannot use `$1` as a table name or column name. Dynamic identifiers require safe allowlisting and proper identifier quoting.

---

## 21. Common SELECT Mistakes

| Mistake                               | Explanation                                       |
| ------------------------------------- | ------------------------------------------------- |
| Using `SELECT *` everywhere           | Retrieves unnecessary columns                     |
| Forgetting WHERE                      | May retrieve the entire table                     |
| Using `= NULL`                        | Does not correctly check NULL                     |
| Using LIMIT without ORDER BY          | Returned rows are not predictable                 |
| Confusing DISTINCT and GROUP BY       | They serve related but different purposes         |
| Assuming aliases always work in WHERE | SELECT aliases are generally unavailable in WHERE |
| Ignoring JOIN conditions              | Can produce a Cartesian product                   |
| Using large OFFSET values             | Can become inefficient                            |
| Concatenating user input into SQL     | Creates SQL injection risk                        |

---

## 22. Practice Exercises

Use the TechBazaar database.

1. Retrieve all columns from `employees`.
2. Retrieve only employee IDs, names, and emails.
3. Retrieve products with their names and prices.
4. Display employee full names using string concatenation.
5. Retrieve unique employee statuses.
6. Retrieve unique department and status combinations.
7. Retrieve products with a calculated 18% tax amount.
8. Retrieve customers whose email is NULL.
9. Retrieve the five most expensive products.
10. Retrieve the ten most recently created orders, using the actual timestamp column in your schema.
11. Count employees in each department.
12. Retrieve employee names with their department names using JOIN.
13. Retrieve products priced above the average product price.
14. Retrieve the second page of products with ten records per page.
15. Use SELECT without FROM to calculate `100 * 0.18`.

---

## 23. Interview Questions

**Q1. What is SELECT in SQL?**

A DQL command used to retrieve records from database tables.

**Q2. What is the difference between SELECT \* and SELECT column_name?**

`SELECT *` retrieves every column. Explicit column selection retrieves only requested columns.

**Q3. What does DISTINCT do?**

It removes duplicate rows from the query result.

**Q4. What is the difference between WHERE and HAVING?**

`WHERE` filters individual rows before grouping. `HAVING` filters groups after aggregation.

**Q5. Can SELECT be used without FROM in PostgreSQL?**

Yes. For example:

```sql
SELECT 10 + 20;
```

**Q6. What is an alias?**

A temporary name assigned to a column or table within a query.

**Q7. What is the difference between LIMIT and OFFSET?**

`LIMIT` restricts the number of returned rows. `OFFSET` skips rows before returning results.

**Q8. Why should ORDER BY be used with LIMIT?**

Without ordering, PostgreSQL does not guarantee which rows will be returned.

**Q9. What is DISTINCT ON?**

A PostgreSQL-specific feature that returns one row for each distinct value of specified expressions.

**Q10. Does SELECT modify database records?**

No. A normal SELECT retrieves data without modifying stored table rows.

---

## Key Takeaways

- `SELECT` retrieves data from database tables.
- `SELECT *` retrieves all columns.
- Explicit column selection is preferred in production queries.
- Aliases rename output columns temporarily.
- Expressions allow calculations inside SELECT.
- `DISTINCT` removes duplicate result rows.
- `DISTINCT ON` is a PostgreSQL-specific feature.
- `WHERE` filters rows.
- `ORDER BY` sorts results.
- `LIMIT` and `OFFSET` support pagination.
- Aggregate functions calculate values across rows.
- `GROUP BY` groups records for aggregation.
- JOIN combines related tables.
- Subqueries allow nested query logic.
- PostgreSQL uses positional parameters such as `$1` and `$2` in backend queries.
