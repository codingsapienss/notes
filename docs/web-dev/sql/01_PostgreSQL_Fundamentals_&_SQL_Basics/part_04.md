---
sidebar_label: "SQL Identifiers, Strings and Aliases"
sidebar_position: 1
---

# SQL Identifiers, Strings and Aliases

## 1. Identifiers in SQL

**Identifiers** are names used to identify database objects.

Examples:

- Database names
- Schema names
- Table names
- Column names
- Index names
- Constraint names

```sql
CREATE TABLE employees (
    employee_id INT,
    employee_name TEXT
);
```

Here, `employees`, `employee_id`, and `employee_name` are identifiers.

PostgreSQL supports two types of identifiers:

1. Unquoted identifiers
2. Quoted identifiers

## 2. Unquoted Identifiers

Identifiers written without double quotes are automatically converted to lowercase by PostgreSQL.

```sql
CREATE TABLE Employees (
    EmployeeID INT,
    EmployeeName TEXT
);
```

PostgreSQL treats this as:

```sql
CREATE TABLE employees (
    employeeid INT,
    employeename TEXT
);
```

Therefore, all these queries refer to the same table:

```sql
SELECT * FROM Employees;

SELECT * FROM EMPLOYEES;

SELECT * FROM employees;
```

**Important:** Unquoted identifiers are case-insensitive because PostgreSQL folds them to lowercase.

## 3. Quoted Identifiers

Double quotes preserve the exact case of an identifier.

```sql
CREATE TABLE "EmployeeDetails" (
    "EmployeeID" INT,
    "EmployeeName" TEXT
);
```

You must use the exact spelling and capitalization when referencing these identifiers:

```sql
SELECT "EmployeeID", "EmployeeName"
FROM "EmployeeDetails";
```

This will fail:

```sql
SELECT EmployeeID
FROM EmployeeDetails;
```

PostgreSQL converts unquoted names to lowercase, so it searches for `employeeid` and `employeedetails`.

**Best practice:** Prefer lowercase `snake_case` identifiers and avoid quoted mixed-case names.

```sql
employee_id
employee_name
created_at
order_items
```

## 4. Single Quotes vs Double Quotes

This is one of the most important PostgreSQL syntax rules.

| Quotes              | Purpose       | Example          |
| ------------------- | ------------- | ---------------- |
| Single quotes `' '` | String values | `'Rahul'`        |
| Double quotes `" "` | Identifiers   | `"employeeName"` |

Example:

```sql
SELECT *
FROM employees
WHERE employee_name = 'Rahul';
```

Here:

- `employee_name` is a column identifier.
- `'Rahul'` is a string value.

Incorrect:

```sql
SELECT *
FROM employees
WHERE employee_name = "Rahul";
```

PostgreSQL interprets `"Rahul"` as a column identifier, not a string. If that column does not exist, the query fails.

**Remember:** Single quotes for values; double quotes for identifiers.

## 5. String Literals

A **string literal** is a fixed text value written directly inside an SQL statement.

```sql
SELECT 'Hello PostgreSQL';

SELECT 'Prashant';

SELECT 'Order Completed';
```

Strings use single quotes.

### A. Strings containing apostrophes

To include an apostrophe inside a string, escape it by doubling the single quote.

```sql
SELECT 'Prashant''s Database';
```

Output:

```text
Prashant's Database
```

### B. Empty String vs NULL

These are different:

```sql
SELECT '' AS empty_string;

SELECT NULL AS missing_value;
```

| Empty string                              | NULL                                   |
| ----------------------------------------- | -------------------------------------- |
| A valid string containing zero characters | Represents an unknown or missing value |
| Has a value                               | Has no known value                     |
| `= ''` can compare it                     | Use `IS NULL` to test it               |

Example:

```sql
SELECT *
FROM customers
WHERE email = '';
```

Finds empty email strings.

```sql
SELECT *
FROM customers
WHERE email IS NULL;
```

Finds missing email values.

## 6. Case Sensitivity of Strings

Unlike unquoted SQL identifiers, string comparisons are generally case-sensitive under PostgreSQL's default deterministic text collation.

```sql
SELECT 'Rahul' = 'rahul';
```

Result:

```text
false
```

### Case-insensitive comparison using ILIKE

```sql
SELECT *
FROM employees
WHERE employee_name ILIKE 'rahul';
```

This matches values such as:

- Rahul
- RAHUL
- rahul

**Important:**

- `LIKE` performs pattern matching and is normally case-sensitive.
- `ILIKE` is PostgreSQL's case-insensitive pattern-matching extension.
- Collation and locale can affect text comparison behaviour.

## 7. Reserved Keywords

Reserved keywords are words with special meaning in SQL.

Examples:

```sql
SELECT
FROM
WHERE
ORDER
GROUP
TABLE
USER
```

Avoid using reserved keywords as table or column names.

Bad naming:

```sql
CREATE TABLE order (
    user INT
);
```

This can cause syntax errors because `ORDER` and `USER` have special SQL meanings.

Better:

```sql
CREATE TABLE orders (
    user_id INT
);
```

If a reserved word must be used, quote it:

```sql
CREATE TABLE "order" (
    "user" INT
);
```

However, avoiding reserved words is preferable.

## 8. Aliases in SQL

An **alias** gives a temporary alternative name to a table or column in a query.

Aliases improve readability and simplify complex queries.

### A. Column Alias

Use `AS` to assign an alias to a column or expression.

```sql
SELECT
    employee_name AS name,
    salary AS monthly_salary
FROM employees;
```

Output:

| name  | monthly_salary |
| ----- | -------------: |
| Rahul |          45000 |
| Priya |          55000 |

`AS` is optional for column aliases:

```sql
SELECT employee_name name
FROM employees;
```

Both forms are valid.

### B. Aliases for Calculated Columns

```sql
SELECT
    employee_name,
    salary * 12 AS annual_salary
FROM employees;
```

### C. Table Alias

```sql
SELECT e.employee_name, e.salary
FROM employees AS e;
```

Here, `e` is an alias for the `employees` table.

`AS` is optional:

```sql
SELECT e.employee_name
FROM employees e;
```

### D. Aliases in Joins

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

Aliases make queries involving multiple tables easier to read.

**Important:** A table alias is available throughout the query scope where it is defined. Once assigned, use the alias instead of the original table name in that scope.

## 9. Important Alias Rules in PostgreSQL

### A. Aliases are temporary

Aliases do not rename actual database columns or tables.

```sql
SELECT employee_name AS name
FROM employees;
```

The actual column remains `employee_name`.

### B. Column aliases cannot normally be used in WHERE

Incorrect:

```sql
SELECT salary * 12 AS annual_salary
FROM employees
WHERE annual_salary > 500000;
```

PostgreSQL cannot resolve the SELECT-list alias in `WHERE` because WHERE is evaluated before the SELECT output is formed.

Correct:

```sql
SELECT salary * 12 AS annual_salary
FROM employees
WHERE salary * 12 > 500000;
```

### C. Column aliases can be used in ORDER BY

```sql
SELECT salary * 12 AS annual_salary
FROM employees
ORDER BY annual_salary DESC;
```

### D. Column aliases can be used in GROUP BY

```sql
SELECT
    department_id AS department,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department
ORDER BY department;
```

PostgreSQL permits output-column aliases in `GROUP BY`, subject to name-resolution rules.

## 10. SQL Identifiers vs String Values

Understand the difference:

```sql
SELECT employee_name
FROM employees
WHERE department = 'IT';
```

| Expression       | Meaning           |
| ---------------- | ----------------- |
| `employee_name`  | Column identifier |
| `employees`      | Table identifier  |
| `department`     | Column identifier |
| `'IT'`           | String value      |
| `"EmployeeName"` | Quoted identifier |

A common mistake is confusing a string value with a column name.

```sql
SELECT 'employee_name'
FROM employees;
```

This returns the literal text `employee_name` for every row. It does not retrieve the column's value.

Correct:

```sql
SELECT employee_name
FROM employees;
```

## 11. Identifiers and SQL Injection

Never construct SQL queries by directly concatenating untrusted user input.

**Unsafe Node.js example:**

```javascript
const query = `
    SELECT * FROM users
    WHERE email = '${email}'
`;
```

An attacker could provide malicious SQL input.

**Safe PostgreSQL parameterized query using `pg`:**

```javascript
const query = `
    SELECT * FROM users
    WHERE email = $1
`;

const result = await pool.query(query, [email]);
```

- `$1`, `$2`, etc. are positional parameters in PostgreSQL.
- The driver sends values separately from the SQL command.
- Parameterized queries prevent user input from being interpreted as SQL syntax.

**Important:** SQL parameters represent values, not table or column identifiers. Dynamic identifiers require safe identifier quoting or an allowlist.

## 12. Quick Revision

| Concept              | Rule                                     |
| -------------------- | ---------------------------------------- |
| Identifier           | Name of a database object                |
| Unquoted identifier  | Folded to lowercase                      |
| Quoted identifier    | Preserves exact case                     |
| Single quotes        | String values                            |
| Double quotes        | Identifiers                              |
| Empty string         | `''`                                     |
| Missing value        | `NULL`                                   |
| Apostrophe in string | Double it: `''`                          |
| `LIKE`               | Pattern matching                         |
| `ILIKE`              | Case-insensitive pattern matching        |
| `AS`                 | Assigns an alias                         |
| Table alias          | Temporary table reference                |
| Column alias         | Temporary output-column name             |
| `ORDER BY`           | Can reference SELECT aliases             |
| `WHERE`              | Cannot normally reference SELECT aliases |

## 13. Practice Exercises

1. Create a table with an unquoted mixed-case name and inspect how PostgreSQL stores it.
2. Create another table using a quoted mixed-case name.
3. Retrieve a string containing an apostrophe.
4. Write queries to find empty strings and NULL values separately.
5. Find employees whose names match `rahul` regardless of capitalization.
6. Retrieve employee names using the alias `name`.
7. Calculate annual salary using the alias `annual_salary`.
8. Use table aliases to join employees and departments.
9. Explain why a SELECT alias cannot normally be used in WHERE.
10. Explain why single quotes and double quotes cannot be interchanged.

## 14. Interview Questions

1. What is an identifier in SQL?
2. What is the difference between quoted and unquoted identifiers in PostgreSQL?
3. Why does PostgreSQL convert unquoted identifiers to lowercase?
4. What is the difference between single quotes and double quotes?
5. What is the difference between an empty string and NULL?
6. What are reserved keywords?
7. What is a column alias?
8. What is a table alias?
9. Can a column alias be used in WHERE?
10. What is the difference between LIKE and ILIKE?
11. What happens when you write `SELECT 'employee_name' FROM employees`?
12. How do parameterized queries protect against SQL injection?
