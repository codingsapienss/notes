---
sidebar_label: "UPDATE Operations"
sidebar_position: 1
---

# UPDATE Operations

## 1. Introduction to UPDATE

`UPDATE` is a DML (Data Manipulation Language) command used to modify existing records in a table.

Common use cases:

- Updating customer details.
- Changing product prices.
- Updating employee status.
- Modifying order status.
- Updating multiple columns in one query.

**Important:** `UPDATE` modifies existing rows. It does not create new records.

---

## 2. Basic UPDATE Syntax

```sql
UPDATE table_name
SET column1 = value1,
    column2 = value2
WHERE condition;
```

Example:

```sql
UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5;
```

Only the employee with `employee_id = 5` is updated.

Verify:

```sql
SELECT *
FROM employees
WHERE employee_id = 5;
```

**Important:** Always understand the condition before executing an UPDATE query.

---

## 3. UPDATE Multiple Columns

You can update multiple columns in one statement.

```sql
UPDATE employees
SET
    first_name = 'Rahul',
    last_name = 'Sharma',
    status = 'active'
WHERE employee_id = 5;
```

All specified columns are updated for the matching row.

You do not need separate UPDATE statements for each column.

---

## 4. UPDATE Without WHERE

You can execute UPDATE without a `WHERE` condition.

```sql
UPDATE employees
SET status = 'inactive';
```

This updates every row in the table.

**Danger:** Forgetting `WHERE` is one of the most common causes of accidental data modification.

Before executing:

```sql
SELECT *
FROM employees;
```

If you intend to update only one record, use a specific condition:

```sql
UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5;
```

---

## 5. UPDATE Using Expressions

You can use existing column values in the `SET` clause.

### Increase product prices by 10%

```sql
UPDATE products
SET price = price * 1.10;
```

### Increase a specific product's price

```sql
UPDATE products
SET price = price + 500
WHERE product_id = 10;
```

### Decrease stock quantity

If your inventory table contains a `quantity` column:

```sql
UPDATE inventory
SET quantity = quantity - 5
WHERE product_id = 10;
```

This assumes the `inventory` table has the specified columns.

### Update using CASE

```sql
UPDATE employees
SET status = CASE
    WHEN employee_id = 5 THEN 'inactive'
    WHEN employee_id = 6 THEN 'active'
    ELSE status
END
WHERE employee_id IN (5, 6);
```

`CASE` allows conditional values within a single UPDATE statement.

---

## 6. UPDATE with NULL

Use `IS NULL` to find rows where a column has no value.

```sql
UPDATE customers
SET email = 'unknown@example.com'
WHERE email IS NULL;
```

To set a column to NULL:

```sql
UPDATE customers
SET email = NULL
WHERE customer_id = 10;
```

This works only if the column allows NULL.

**Important:** Never use `= NULL` to check for NULL.

Incorrect:

```sql
UPDATE customers
SET email = 'unknown@example.com'
WHERE email = NULL;
```

Correct:

```sql
UPDATE customers
SET email = 'unknown@example.com'
WHERE email IS NULL;
```

---

## 7. UPDATE with RETURNING

PostgreSQL supports `RETURNING` to retrieve updated records.

### Return the updated row

```sql
UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5
RETURNING *;
```

### Return selected columns

```sql
UPDATE products
SET price = price + 100
WHERE product_id = 10
RETURNING product_id, product_name, price;
```

### Return old and new values

PostgreSQL supports referencing the old and new row values in `RETURNING`.

```sql
UPDATE products
SET price = price + 100
WHERE product_id = 10
RETURNING
    old.price AS old_price,
    new.price AS new_price;
```

This is useful when an application needs to know exactly what changed.

**Version note:** The `old` and `new` aliases in `RETURNING` are supported in PostgreSQL 18 and later. On earlier versions, use a transaction with a suitable `SELECT` or another approach to capture the previous value.

---

## 8. UPDATE Using a Subquery

You can use a subquery in an UPDATE condition or in the value being assigned.

### Example: Update employees in a particular department

```sql
UPDATE employees
SET status = 'inactive'
WHERE department_id IN (
    SELECT department_id
    FROM departments
    WHERE department_name = 'Support'
);
```

All employees belonging to the Support department are updated.

### Example: Set a value using a subquery

Suppose you want to assign an employee's department based on another employee's department:

```sql
UPDATE employees
SET department_id = (
    SELECT department_id
    FROM employees
    WHERE employee_id = 2
)
WHERE employee_id = 5;
```

The subquery must return at most one row. If it returns multiple rows, PostgreSQL raises an error.

---

## 9. UPDATE Using FROM (PostgreSQL)

PostgreSQL supports `UPDATE ... FROM`, which allows you to update a table using data from another table.

### Syntax

```sql
UPDATE target_table
SET column_name = source_table.column_name
FROM source_table
WHERE target_table.id = source_table.id;
```

### Example: Update employee department information

```sql
UPDATE employees AS e
SET department_id = d.department_id
FROM departments AS d
WHERE d.department_name = 'Engineering'
  AND e.employee_id = 5;
```

This assigns employee 5 to the Engineering department.

### Important: Duplicate matches

If the `FROM` clause produces multiple matching rows for a target row, PostgreSQL uses one matching row, but which one is used is not predictable.

Ensure the join produces at most one source row per target row.

---

## 10. UPDATE Multiple Rows with Different Values

You can update multiple records with different values using `CASE`.

Example:

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

This updates three employees in one statement.

Another approach is to use `UPDATE ... FROM` with a `VALUES` table:

```sql
UPDATE employees AS e
SET status = v.new_status
FROM (
    VALUES
        (1, 'active'),
        (2, 'inactive'),
        (3, 'active')
) AS v(employee_id, new_status)
WHERE e.employee_id = v.employee_id;
```

This is useful when updating many rows with different values.

---

## 11. UPDATE with LIMIT — PostgreSQL Workaround

PostgreSQL does not support a direct `LIMIT` clause in `UPDATE`.

This syntax is invalid:

```sql
UPDATE employees
SET status = 'inactive'
LIMIT 5;
```

Use a subquery or CTE to select the rows first.

```sql
WITH selected_employees AS (
    SELECT employee_id
    FROM employees
    WHERE status = 'active'
    ORDER BY employee_id
    LIMIT 5
)
UPDATE employees
SET status = 'inactive'
WHERE employee_id IN (
    SELECT employee_id
    FROM selected_employees
)
RETURNING *;
```

This updates at most five selected employees.

**Important:** Use a deterministic `ORDER BY` when selecting a limited set of rows. Without it, the selected rows are not guaranteed to be consistent.

---

## 12. UPDATE and Constraints

PostgreSQL checks constraints when an UPDATE modifies a row.

Consider:

```sql
CREATE TABLE products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) CHECK (price >= 0),
    sku VARCHAR(50) UNIQUE
);
```

### NOT NULL violation

```sql
UPDATE products
SET product_name = NULL
WHERE product_id = 1;
```

Fails because `product_name` is NOT NULL.

### CHECK violation

```sql
UPDATE products
SET price = -500
WHERE product_id = 1;
```

Fails because the price must be non-negative.

### UNIQUE violation

```sql
UPDATE products
SET sku = 'SKU-101'
WHERE product_id = 2;
```

Fails if another product already has `SKU-101`.

### FOREIGN KEY violation

```sql
UPDATE employees
SET department_id = 9999
WHERE employee_id = 5;
```

Fails if department `9999` does not exist and the foreign key is enforced.

---

## 13. UPDATE and Foreign Keys

Updating a referenced primary key can affect related tables depending on the foreign-key action.

Suppose `employees.department_id` references `departments.department_id`.

If the foreign key uses:

```sql
ON UPDATE CASCADE
```

Updating a referenced department ID automatically updates the corresponding foreign-key values in referencing rows.

If the foreign key uses `RESTRICT` or `NO ACTION`, PostgreSQL may reject the update while referencing rows exist.

**Best practice:** Prefer stable primary keys. Avoid changing IDs that other tables depend on unless there is a clear reason.

---

## 14. UPDATE and Transactions

An UPDATE can be executed inside a transaction.

### Example

```sql
BEGIN;

UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5;

SELECT *
FROM employees
WHERE employee_id = 5;

COMMIT;
```

The update is committed.

### Rollback

```sql
BEGIN;

UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5;

ROLLBACK;
```

The previous value is restored.

### Using SAVEPOINT

A savepoint allows you to roll back part of a transaction.

```sql
BEGIN;

UPDATE employees
SET status = 'inactive'
WHERE employee_id = 5;

SAVEPOINT before_second_update;

UPDATE employees
SET status = 'inactive'
WHERE employee_id = 6;

ROLLBACK TO SAVEPOINT before_second_update;

COMMIT;
```

The first update is committed, while the second update is undone.

---

## 15. UPDATE and Concurrency

When PostgreSQL updates a row, it acquires a row-level lock on that row.

This prevents conflicting transactions from modifying the same row simultaneously without coordination.

Example:

```sql
BEGIN;

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 10;

COMMIT;
```

If another transaction attempts to update the same row, it may need to wait until the first transaction completes.

### Safer inventory update

Suppose you want to reduce inventory only when enough stock is available:

```sql
UPDATE inventory
SET quantity = quantity - 5
WHERE product_id = 10
  AND quantity >= 5
RETURNING quantity;
```

If no row is returned, either:

- The product does not exist in the inventory table.
- The available quantity is less than 5.

This combines the condition and modification into one atomic statement.

It is safer than first reading the quantity in application code and then issuing an unconditional update.

---

## 16. UPDATE in Node.js with PostgreSQL

Use parameterized queries when accepting values from users or application input.

### Example using `pg`

```javascript
const result = await pool.query(
  `UPDATE customers
     SET customer_name = $1,
         email = $2
     WHERE customer_id = $3
     RETURNING customer_id, customer_name, email`,
  ["Rahul Sharma", "rahul@example.com", 10],
);

if (result.rowCount === 0) {
  console.log("Customer not found");
} else {
  console.log(result.rows[0]);
}
```

### Important concepts

- `$1`, `$2`, `$3` are positional parameters.
- User values are passed separately from SQL.
- `RETURNING` retrieves the updated record.
- `rowCount` tells you how many rows were affected.
- Always check whether the expected row was updated.

### Unsafe query

```javascript
const query = `
    UPDATE customers
    SET email = '${email}'
    WHERE customer_id = ${customerId}
`;
```

This can expose the application to SQL injection.

Use parameterized queries instead.

---

## 17. Common UPDATE Mistakes

| Mistake                              | Problem                                          |
| ------------------------------------ | ------------------------------------------------ |
| Missing WHERE                        | Updates every row                                |
| Using `= NULL`                       | Does not correctly match NULL values             |
| Updating a primary key unnecessarily | Can affect foreign-key relationships             |
| Ignoring constraints                 | Causes the statement to fail                     |
| Using an unparameterized query       | Creates SQL injection risk                       |
| Assuming UPDATE supports LIMIT       | PostgreSQL does not support direct UPDATE LIMIT  |
| Using a non-unique FROM join         | Can produce unpredictable source-row selection   |
| Not checking rowCount                | Application may silently miss an expected update |

---

## 18. Practice Exercises

Use the TechBazaar database.

1. Update the status of employee `5` to `inactive`.
2. Update the first and last name of employee `3`.
3. Increase all product prices by 10%.
4. Increase the price of product `10` by ₹500.
5. Set the email of customer `15` to NULL.
6. Update all employees belonging to the Support department.
7. Update a product's price and return the updated record.
8. Update three employees with different statuses using CASE.
9. Update the first five active employees using a CTE and RETURNING.
10. Reduce inventory by five units only if at least five units are available.
11. Execute an UPDATE inside a transaction and roll it back.
12. Try updating a product with a negative price and observe the constraint error.

---

## 19. Interview Questions

**Q1. What is UPDATE in SQL?**

A DML command used to modify existing records in a table.

**Q2. What happens if UPDATE is executed without WHERE?**

Every row in the target table is updated.

**Q3. Can we update multiple columns in one query?**

Yes, by specifying multiple assignments in the `SET` clause.

**Q4. What is RETURNING in PostgreSQL UPDATE?**

It returns the updated rows or selected columns from those rows.

**Q5. Can UPDATE use data from another table?**

Yes. PostgreSQL supports `UPDATE ... FROM`.

**Q6. Does PostgreSQL support LIMIT directly in UPDATE?**

No. Use a CTE or subquery to select the rows to update.

**Q7. What happens when an UPDATE violates a CHECK constraint?**

PostgreSQL rejects the update.

**Q8. Can an UPDATE be rolled back?**

Yes, if it is executed inside an uncommitted transaction.

**Q9. What is the difference between UPDATE and UPSERT?**

- `UPDATE` modifies existing rows.
- UPSERT inserts a row or updates an existing row when a specified conflict occurs.

**Q10. How can you safely decrement inventory?**

Use a conditional UPDATE:

```sql
UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 10
  AND quantity >= 1
RETURNING quantity;
```

This avoids decrementing below zero when the condition is enforced by the statement and suitable constraints.

---

## Key Takeaways

- `UPDATE` modifies existing rows.
- `SET` specifies the columns and new values.
- `WHERE` determines which rows are updated.
- Without `WHERE`, every row is updated.
- `RETURNING` retrieves updated records.
- `UPDATE ... FROM` allows updates using another table.
- Use `CASE` for different values across multiple rows.
- PostgreSQL does not support direct `UPDATE LIMIT`.
- Constraints and foreign keys are enforced during updates.
- Use transactions and parameterized queries in backend applications.
- Conditional updates are useful for concurrency-safe operations such as inventory management.
