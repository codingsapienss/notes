---
sidebar_label: "UNION and UNION ALL"
sidebar_position: 1
---

# UNION and UNION ALL

## 1. Introduction

SQL set operations combine the results of multiple SELECT queries into a single result set.

PostgreSQL supports four major set operations:

| Operator    | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| `UNION`     | Combines results and removes duplicates                     |
| `UNION ALL` | Combines results and preserves duplicates                   |
| `INTERSECT` | Returns rows common to both result sets                     |
| `EXCEPT`    | Returns rows present in the first result but not the second |

This chapter covers UNION and UNION ALL.

### Basic syntax

```sql
SELECT column1, column2
FROM table1

UNION

SELECT column1, column2
FROM table2;
```

The two SELECT statements are combined into one result.

---

## 2. UNION

`UNION` combines the results of multiple SELECT queries and removes duplicate rows.

### Example: Get all customer names from two tables

Suppose you have:

- `customers`
- `employees`

```sql
SELECT customer_name AS person_name
FROM customers

UNION

SELECT employee_name AS person_name
FROM employees;
```

If the same name exists in both tables, it appears only once.

### Example data

Customers:

| customer_name |
| ------------- |
| Rahul         |
| Aman          |
| Priya         |

Employees:

| employee_name |
| ------------- |
| Aman          |
| Neha          |
| Rahul         |

### UNION result

| person_name |
| ----------- |
| Rahul       |
| Aman        |
| Priya       |
| Neha        |

Duplicates are removed.

**Important:** UNION removes duplicates based on the complete selected row, not just one column.

---

## 3. UNION ALL

`UNION ALL` combines results without removing duplicates.

### Example

```sql
SELECT customer_name AS person_name
FROM customers

UNION ALL

SELECT employee_name AS person_name
FROM employees;
```

Result:

| person_name |
| ----------- |
| Rahul       |
| Aman        |
| Priya       |
| Aman        |
| Neha        |
| Rahul       |

Duplicates remain.

### UNION vs UNION ALL

| UNION                                       | UNION ALL                              |
| ------------------------------------------- | -------------------------------------- |
| Removes duplicate rows                      | Preserves duplicate rows               |
| Performs duplicate elimination              | Does not perform duplicate elimination |
| Usually requires more processing            | Usually faster                         |
| Useful when unique result rows are required | Useful when all rows must be retained  |

**Performance recommendation:** Prefer UNION ALL when duplicate removal is not required.

---

## 4. Rules for UNION and UNION ALL

PostgreSQL requires the SELECT statements to be compatible.

### Rule 1: Same number of columns

Valid:

```sql
SELECT
    employee_name,
    salary
FROM employees

UNION

SELECT
    customer_name,
    customer_id
FROM customers;
```

Both queries return two columns.

Invalid:

```sql
SELECT employee_name
FROM employees

UNION

SELECT customer_name, customer_id
FROM customers;
```

Error: Each UNION query must have the same number of columns.

### Rule 2: Corresponding columns must have compatible data types

Valid:

```sql
SELECT employee_name
FROM employees

UNION

SELECT customer_name
FROM customers;
```

Both columns are text-compatible.

Invalid example:

```sql
SELECT employee_name
FROM employees

UNION

SELECT salary
FROM employees;
```

PostgreSQL cannot directly resolve a common type between these columns.

You can explicitly cast values when the conversion makes sense:

```sql
SELECT employee_name::TEXT AS value
FROM employees

UNION

SELECT salary::TEXT AS value
FROM employees;
```

### Rule 3: Column names come from the first SELECT

```sql
SELECT employee_name AS person
FROM employees

UNION

SELECT customer_name AS customer
FROM customers;
```

The resulting column name is `person`.

### Rule 4: Column order matters

PostgreSQL matches columns by their position, not by their aliases.

Correct:

```sql
SELECT
    employee_name,
    salary
FROM employees

UNION ALL

SELECT
    customer_name,
    customer_id::NUMERIC
FROM customers;
```

The first column combines with the first column, and the second combines with the second.

Do not assume matching aliases will rearrange columns automatically.

---

## 5. UNION Across Multiple Tables

You can combine more than two SELECT statements.

### Example: Get all people from employees, customers and another source

```sql
SELECT employee_name AS person_name
FROM employees

UNION

SELECT customer_name
FROM customers

UNION

SELECT 'Admin' AS person_name;
```

All three result sets are combined.

### Using UNION ALL

```sql
SELECT employee_name AS person_name
FROM employees

UNION ALL

SELECT customer_name
FROM customers

UNION ALL

SELECT 'Admin' AS person_name;
```

Every occurrence is preserved.

---

## 6. ORDER BY with UNION

To sort the final combined result, place ORDER BY after the final SELECT.

```sql
SELECT employee_name AS person_name
FROM employees

UNION

SELECT customer_name
FROM customers

ORDER BY person_name ASC;
```

### Important rule

ORDER BY at the end sorts the complete combined result, not just the second SELECT.

Avoid writing ORDER BY independently inside each SELECT unless using a properly structured subquery or applying a supported parenthesized query with LIMIT/OFFSET.

### Example: Sort combined salaries

```sql
SELECT
    employee_name AS name,
    salary
FROM employees

UNION ALL

SELECT
    customer_name,
    NULL::NUMERIC AS salary
FROM customers

ORDER BY salary DESC NULLS LAST;
```

This example combines employee salaries with customer names. Customer salary values are NULL because the customers table does not contain an employee salary field.

---

## 7. UNION with WHERE Conditions

Each SELECT can have its own WHERE condition.

### Example: Active employees and customers with a specific status

The current TechBazaar schema has `employees.status` and `orders.status`, but the `customers` table does not have a customer status field in the supplied schema.

Example using employees and orders:

```sql
SELECT
    employee_name AS name
FROM employees
WHERE status = 'active'

UNION

SELECT
    customer_name
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
);
```

This returns:

- Active employee names.
- Customer names belonging to customers who have placed orders.

Duplicate names are removed.

### UNION ALL version

```sql
SELECT
    employee_name AS name
FROM employees
WHERE status = 'active'

UNION ALL

SELECT
    customer_name
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
);
```

Duplicate names are preserved.

---

## 8. UNION vs JOIN

These operations are fundamentally different.

### UNION

UNION combines rows vertically.

```sql
SELECT employee_name AS name
FROM employees

UNION ALL

SELECT customer_name
FROM customers;
```

Conceptually:

| name       |
| ---------- |
| Employee 1 |
| Employee 2 |
| Customer 1 |
| Customer 2 |

### JOIN

JOIN combines columns horizontally based on a relationship.

```sql
SELECT
    e.employee_name,
    d.department_name

FROM employees e

JOIN departments d
    ON e.department_id = d.department_id;
```

Conceptually:

| employee_name | department_name |
| ------------- | --------------- |
| Aman          | Sales           |
| Rahul         | Support         |

### Comparison

| UNION                                          | JOIN                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| Combines rows vertically                       | Combines columns horizontally                             |
| Requires compatible column counts and types    | Requires a join condition for relational matching         |
| Does not require a relationship between tables | Commonly uses related columns                             |
| Can remove duplicates                          | Duplicate behavior depends on matching rows and join type |

**Remember:** UNION combines result sets. JOIN combines related data.

---

## 9. UNION with Aggregation

You can combine aggregated results from multiple tables.

### Example: Employee count and customer count

```sql
SELECT
    'Employees' AS category,
    COUNT(*) AS total_count
FROM employees

UNION ALL

SELECT
    'Customers',
    COUNT(*)
FROM customers;
```

Example result:

| category  | total_count |
| --------- | ----------: |
| Employees |          12 |
| Customers |         150 |

This is useful for dashboard summaries.

### Example: Combine order and payment totals

```sql
SELECT
    'Orders' AS source,
    SUM(total_amount) AS total_amount
FROM orders

UNION ALL

SELECT
    'Payments',
    SUM(amount)
FROM payments;
```

The result provides separate totals for orders and payments.

Do not assume these totals should be equal: payment status, partial payments, refunds and unpaid orders can make them different.

---

## 10. UNION with CTEs

You can use CTEs to organize complex UNION queries.

### Example: Combine high-value orders and high-value payments

```sql
WITH high_value_orders AS (
    SELECT
        order_id AS reference_id,
        total_amount AS amount
    FROM orders
    WHERE total_amount >= 10000
),

high_value_payments AS (
    SELECT
        payment_id AS reference_id,
        amount
    FROM payments
    WHERE amount >= 10000
)

SELECT
    'Order' AS source,
    reference_id,
    amount
FROM high_value_orders

UNION ALL

SELECT
    'Payment',
    reference_id,
    amount
FROM high_value_payments;
```

The source column identifies where each record originated.

**Important:** `reference_id` is not necessarily globally unique across both tables. If you need a unique identifier across the combined result, retain the source type alongside the ID.

---

## 11. UNION and Duplicate Handling

UNION compares complete rows.

### Example

```sql
SELECT
    employee_name,
    salary
FROM employees

UNION

SELECT
    employee_name,
    salary
FROM employees;
```

Identical `(employee_name, salary)` rows appear only once.

Now consider:

```sql
SELECT
    employee_name,
    salary
FROM employees

UNION

SELECT
    employee_name,
    salary + 1000
FROM employees;
```

Even though employee names match, the rows are different because the salary values differ.

Both rows can appear.

### NULL handling

For duplicate elimination in UNION, rows with NULL in corresponding positions are treated as duplicates when the other values match.

Example:

```sql
SELECT NULL::INTEGER AS value

UNION

SELECT NULL::INTEGER;
```

Result: one NULL row.

---

## 12. Parentheses and Set Operation Precedence

When combining multiple set operations, parentheses can make the intended evaluation explicit.

PostgreSQL evaluates INTERSECT before UNION and EXCEPT unless parentheses change the grouping.

For example:

```sql
(
    SELECT customer_id
    FROM orders
    WHERE status = 'completed'
)

UNION

(
    SELECT customer_id
    FROM orders
    WHERE status = 'pending'
);
```

This combines customers with completed or pending orders.

Parentheses are especially useful when combining different set operators or applying LIMIT/OFFSET to an individual component.

---

## 13. Common Mistakes

| Mistake                                               | Correct understanding                               |
| ----------------------------------------------------- | --------------------------------------------------- |
| Different number of columns                           | Every SELECT must return the same number of columns |
| Incompatible column types                             | Corresponding columns need compatible types         |
| Assuming aliases control matching                     | Columns are matched by position                     |
| Expecting UNION ALL to remove duplicates              | It preserves all rows                               |
| Using UNION when duplicates are meaningful            | Use UNION ALL                                       |
| Placing ORDER BY inside every SELECT                  | Sort the combined result with the final ORDER BY    |
| Confusing UNION with JOIN                             | UNION combines rows; JOIN combines columns          |
| Assuming UNION removes duplicates based on one column | It compares the complete selected row               |
| Assuming the first SELECT's aliases are irrelevant    | Output column names come from the first SELECT      |

---

## 14. Practice Exercises

Use the TechBazaar database.

1. Combine employee names and customer names using UNION.
2. Repeat the query using UNION ALL and compare the results.
3. Combine employee IDs and customer IDs into a single column.
4. Combine product names and category names into one result.
5. Combine high-value orders and high-value payments with a source label.
6. Get active employee names and customers who have placed orders.
7. Combine employee and customer counts into one summary result.
8. Combine order totals and payment totals using UNION ALL.
9. Sort the final combined result alphabetically.
10. Combine three SELECT statements using UNION ALL.
11. Cast incompatible types to a common type before using UNION.
12. Demonstrate how UNION removes complete duplicate rows.
13. Demonstrate how rows with the same first column but different second columns are preserved.
14. Explain why UNION ALL is generally faster than UNION.
15. Explain the difference between UNION and JOIN.
16. Write a UNION query using two CTEs.
17. Explain how NULL values are treated during UNION duplicate elimination.

---

## 15. Interview Questions

**Q1. What is UNION in SQL?**

UNION combines the results of multiple SELECT statements and removes duplicate rows.

**Q2. What is UNION ALL?**

UNION ALL combines result sets while preserving duplicates.

**Q3. What is the difference between UNION and UNION ALL?**

UNION performs duplicate elimination; UNION ALL does not.

**Q4. Which is faster: UNION or UNION ALL?**

UNION ALL is generally faster because it avoids duplicate elimination.

**Q5. What conditions must be satisfied to use UNION?**

Every SELECT must return the same number of columns, and corresponding columns must have compatible data types.

**Q6. Does UNION compare column names or positions?**

It compares corresponding columns by position.

**Q7. Which SELECT determines the output column names?**

The first SELECT determines the output column names.

**Q8. Can UNION combine more than two tables?**

Yes. Multiple SELECT statements can be combined.

**Q9. Can ORDER BY be used with UNION?**

Yes. Use ORDER BY after the final SELECT to sort the combined result.

**Q10. Does UNION remove duplicates based on one column?**

No. It removes duplicate complete rows.

**Q11. What happens when both SELECT statements return NULL in the same position?**

If the complete rows match, UNION treats them as duplicates and returns one row.

**Q12. What is the difference between UNION and JOIN?**

UNION combines rows vertically; JOIN combines columns horizontally based on matching conditions.

**Q13. Can UNION be used with aggregate queries?**

Yes. Aggregated SELECT results can be combined as long as their output structures are compatible.

**Q14. Is UNION an SQL join operation?**

No. UNION is a set operation.

---

## Key Takeaways

- UNION combines multiple SELECT result sets and removes duplicate rows.
- UNION ALL combines result sets and preserves duplicates.
- All SELECT statements must return the same number of columns.
- Corresponding columns must have compatible data types.
- Column matching is positional, not based on aliases.
- Output column names come from the first SELECT.
- ORDER BY at the end sorts the combined result.
- UNION removes duplicates based on complete rows.
- UNION ALL is generally faster when duplicate removal is unnecessary.
- UNION combines rows vertically; JOIN combines columns horizontally.
- Both UNION and UNION ALL can be used with CTEs, WHERE conditions and aggregate queries.
