---
sidebar_label: "DROP, TRUNCATE and DELETE Comparison"
sidebar_position: 1
---

# DROP, TRUNCATE and DELETE Comparison

## 1. Overview

PostgreSQL provides three commands to remove database data or objects:

| Command    | Purpose                  | Removes                       |
| ---------- | ------------------------ | ----------------------------- |
| `DELETE`   | Remove selected rows     | Rows                          |
| `TRUNCATE` | Quickly remove all rows  | All rows from a table         |
| `DROP`     | Remove a database object | Table, database, schema, etc. |

**Core distinction:**

- `DELETE` removes records.
- `TRUNCATE` empties a table.
- `DROP` removes the table itself.

---

## 2. DELETE

`DELETE` is a DML command used to remove specific rows from a table.

### Syntax

```sql
DELETE FROM table_name
WHERE condition;
```

### Example: Delete one employee

```sql
DELETE FROM employees
WHERE employee_id = 5;
```

Only the employee with `employee_id = 5` is deleted.

### Delete multiple rows

```sql
DELETE FROM employees
WHERE status = 'inactive';
```

All employees whose status is `inactive` are deleted.

### Delete all rows

```sql
DELETE FROM employees;
```

This removes every row but keeps the table structure.

**Important:** Without a `WHERE` condition, every row is deleted.

### DELETE with RETURNING

PostgreSQL supports `RETURNING`, which lets you retrieve deleted rows.

```sql
DELETE FROM employees
WHERE employee_id = 5
RETURNING *;
```

Return only selected columns:

```sql
DELETE FROM employees
WHERE status = 'inactive'
RETURNING employee_id, first_name, email;
```

Useful when an application needs to know which records were deleted.

### DELETE with a subquery

Delete products belonging to discontinued categories:

```sql
DELETE FROM products
WHERE category_id IN (
    SELECT category_id
    FROM categories
    WHERE category_name = 'Discontinued'
);
```

The referenced columns must exist in your actual schema.

### Important DELETE behaviour

- Supports `WHERE`, subqueries, and `RETURNING`.
- Deletes matching rows individually.
- Does not reset identity sequences.
- Can activate `ON DELETE` foreign-key actions.
- Can be rolled back inside a transaction before commit.

---

## 3. TRUNCATE

`TRUNCATE` removes **all rows** from a table without scanning and deleting each row individually.

It is generally faster than `DELETE` when the intention is to empty an entire table.

### Syntax

```sql
TRUNCATE TABLE table_name;
```

### Example

```sql
TRUNCATE TABLE employees;
```

All employee records are removed, but the table structure remains.

### Truncate multiple tables

```sql
TRUNCATE TABLE employees, departments;
```

### RESTART IDENTITY

By default, `TRUNCATE` does not reset sequences.

Use `RESTART IDENTITY` to reset sequences owned by the truncated tables.

```sql
TRUNCATE TABLE employees
RESTART IDENTITY;
```

Suppose employee IDs were:

```text
1, 2, 3, 4, 5
```

After truncation with `RESTART IDENTITY`, the next generated ID normally starts again at the sequence's configured starting value.

### CONTINUE IDENTITY

This is the default behaviour.

```sql
TRUNCATE TABLE employees
CONTINUE IDENTITY;
```

Existing sequence values are retained.

### CASCADE

Suppose `order_items` references `orders` through a foreign key.

```sql
TRUNCATE TABLE orders;
```

PostgreSQL may reject this because other tables reference `orders`.

You can use:

```sql
TRUNCATE TABLE orders CASCADE;
```

This also truncates tables that have foreign-key references to the specified table, potentially including further dependent tables.

**Warning:** `CASCADE` can remove significantly more data than expected. It is not equivalent to deleting only matching child rows.

### RESTRICT

```sql
TRUNCATE TABLE orders RESTRICT;
```

This is the default behaviour. PostgreSQL rejects the operation if other tables have foreign-key references to the target table, unless those referencing tables are included in the same `TRUNCATE` command.

### Important TRUNCATE behaviour

- Removes all rows; it does not support `WHERE`.
- Supports multiple tables in one command.
- Supports `RESTART IDENTITY` and `CONTINUE IDENTITY`.
- Supports `CASCADE` and `RESTRICT`.
- Does not fire `ON DELETE` triggers because it is not a row-by-row `DELETE`.
- Fires `ON TRUNCATE` triggers, if defined.
- Acquires an `ACCESS EXCLUSIVE` lock on each table.
- Is transactional in PostgreSQL: it can be rolled back before commit.

---

## 4. DROP

`DROP` is a DDL command used to permanently remove database objects.

Unlike `DELETE` and `TRUNCATE`, it removes the object itself, not just its data.

### DROP TABLE

```sql
DROP TABLE employees;
```

This removes:

- Table structure
- All table data
- Indexes belonging to the table
- Constraints belonging to the table

### DROP TABLE IF EXISTS

```sql
DROP TABLE IF EXISTS employees;
```

Prevents an error if the table does not exist.

### DROP with CASCADE

Suppose another table has a foreign key referencing `departments`.

```sql
DROP TABLE departments CASCADE;
```

PostgreSQL removes dependent objects, such as the foreign-key constraint in the referencing table.

**Important:** It does not automatically drop every table that references `departments`. It removes dependent objects, which can include constraints, views, and other database objects.

### DROP with RESTRICT

```sql
DROP TABLE departments RESTRICT;
```

Prevents dropping the table when dependent objects exist. This is the default behaviour.

### DROP DATABASE

```sql
DROP DATABASE techbazaar;
```

Removes the entire database.

Important restrictions:

- You cannot drop the database you are currently connected to.
- You must have the required privileges.
- Active connections can prevent the operation.

### DROP SCHEMA

```sql
DROP SCHEMA sales;
```

Removes an empty schema.

To remove a schema and its contained objects:

```sql
DROP SCHEMA sales CASCADE;
```

**Warning:** `CASCADE` can remove many dependent objects. Inspect dependencies before executing it.

---

## 5. DELETE vs TRUNCATE vs DROP

| Feature                  | DELETE                           | TRUNCATE                                                | DROP                                                       |
| ------------------------ | -------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| Category                 | DML                              | DDL                                                     | DDL                                                        |
| Removes rows             | Yes                              | Yes, all                                                | Yes                                                        |
| Removes table structure  | No                               | No                                                      | Yes                                                        |
| Supports WHERE           | Yes                              | No                                                      | No                                                         |
| Supports RETURNING       | Yes                              | No                                                      | No                                                         |
| Supports multiple tables | No, one target table per command | Yes                                                     | Yes, for compatible DROP commands                          |
| Resets identity sequence | No                               | With `RESTART IDENTITY`                                 | Table and owned sequence are removed                       |
| Fires DELETE triggers    | Yes                              | No                                                      | No                                                         |
| Fires TRUNCATE triggers  | No                               | Yes                                                     | No                                                         |
| Foreign-key behaviour    | Uses FK delete actions           | Requires referencing tables to be included or `CASCADE` | Handles dependent objects using `RESTRICT`/`CASCADE`       |
| Transaction rollback     | Yes                              | Yes                                                     | Yes, for ordinary transactional PostgreSQL DROP operations |

### Performance difference

- `DELETE` performs row-level deletion and generates corresponding row-level work.
- `TRUNCATE` is generally faster for removing every row because it avoids individual row deletion.
- `DROP` removes the table object itself.

Do not choose `TRUNCATE` merely because it is faster. Choose the command based on the required result and dependencies.

---

## 6. Practical Examples

### Scenario 1: Delete one customer

```sql
DELETE FROM customers
WHERE customer_id = 10;
```

Use `DELETE` because only one customer should be removed.

### Scenario 2: Remove inactive employees

```sql
DELETE FROM employees
WHERE status = 'inactive';
```

Use `DELETE` because the condition determines which records are removed.

### Scenario 3: Empty a temporary table

```sql
TRUNCATE TABLE temporary_imports;
```

Use `TRUNCATE` because all imported records should be removed while retaining the table.

### Scenario 4: Empty a table and reset its IDs

```sql
TRUNCATE TABLE employees
RESTART IDENTITY;
```

Use this when the sequence should restart as well.

### Scenario 5: Remove an obsolete table

```sql
DROP TABLE IF EXISTS old_campaign_data;
```

Use `DROP` because the table is no longer required.

---

## 7. Transactions and Rollback

PostgreSQL supports transactional execution of `DELETE`, `TRUNCATE`, and ordinary `DROP` operations.

This means you can undo these changes before committing the transaction.

### Example: Rollback DELETE

```sql
BEGIN;

DELETE FROM employees
WHERE employee_id = 5;

ROLLBACK;
```

The deleted employee is restored.

### Example: Rollback TRUNCATE

```sql
BEGIN;

TRUNCATE TABLE employees;

ROLLBACK;
```

The table's rows are restored.

### Example: Rollback DROP

```sql
BEGIN;

DROP TABLE employees;

ROLLBACK;
```

The table is restored.

### Commit instead of rollback

```sql
BEGIN;

DELETE FROM employees
WHERE employee_id = 5;

COMMIT;
```

After `COMMIT`, the deletion becomes permanent from the transaction's perspective.

**Important:** Transaction rollback is not a substitute for backups. Once committed, recovery generally requires another recovery mechanism.

---

## 8. Common Mistakes

### Mistake 1: DELETE without WHERE

```sql
DELETE FROM customers;
```

This deletes every customer.

If you intend to delete only one customer:

```sql
DELETE FROM customers
WHERE customer_id = 10;
```

### Mistake 2: Expecting TRUNCATE to support WHERE

Invalid:

```sql
TRUNCATE TABLE employees
WHERE status = 'inactive';
```

Correct:

```sql
DELETE FROM employees
WHERE status = 'inactive';
```

### Mistake 3: Assuming TRUNCATE always resets IDs

```sql
TRUNCATE TABLE employees;
```

This does not automatically reset owned identity sequences.

Use:

```sql
TRUNCATE TABLE employees RESTART IDENTITY;
```

### Mistake 4: Using CASCADE without checking dependencies

```sql
TRUNCATE TABLE orders CASCADE;
```

This may empty additional referencing tables.

Similarly:

```sql
DROP TABLE departments CASCADE;
```

This may remove dependent constraints and other objects.

Always inspect dependencies before using `CASCADE`.

### Mistake 5: Confusing DROP and TRUNCATE

```sql
TRUNCATE TABLE employees;
```

The table remains available.

```sql
DROP TABLE employees;
```

The table no longer exists.

---

## 9. Safe Execution Practices

Before deleting production data:

1. Verify the target table and condition.
2. Run a `SELECT` with the same `WHERE` condition.
3. Check foreign-key dependencies.
4. Use a transaction when appropriate.
5. Review the affected rows before committing.

Example:

```sql
BEGIN;

SELECT *
FROM employees
WHERE status = 'inactive';

DELETE FROM employees
WHERE status = 'inactive'
RETURNING *;

-- Verify the result.

ROLLBACK;
-- Replace with COMMIT only after verification.
```

For a full-table operation:

```sql
BEGIN;

TRUNCATE TABLE temporary_imports;

-- Verify the result.

ROLLBACK;
-- Replace with COMMIT only after verification.
```

For `DROP`, verify the object name and dependencies before execution. Do not treat a production `DROP` as a routine cleanup operation.

---

## 10. Practice Exercises

Use the TechBazaar database.

1. Delete the customer whose `customer_id` is `15`.
2. Delete all employees whose status is `inactive`.
3. Delete all products belonging to a particular category using a subquery.
4. Delete a customer and return the deleted customer's details.
5. Empty the `temporary_imports` table.
6. Truncate the `employees` table and restart its identity sequence.
7. Explain why truncating `orders` may fail when `order_items` references it.
8. Drop a table only if it exists.
9. Explain the difference between `DROP TABLE ... CASCADE` and `TRUNCATE TABLE ... CASCADE`.
10. Start a transaction, delete a product, and roll back the transaction.

## 11. Interview Questions

**Q1. What is the main difference between DELETE and TRUNCATE?**

`DELETE` removes selected rows and supports `WHERE`. `TRUNCATE` removes all rows from a table without row-by-row deletion.

**Q2. Does TRUNCATE reset auto-increment IDs?**

Not by default. Use `RESTART IDENTITY` to reset sequences owned by the truncated table.

**Q3. Can we rollback TRUNCATE in PostgreSQL?**

Yes. PostgreSQL supports transactional `TRUNCATE`.

**Q4. Does DELETE remove table structure?**

No. It removes rows while preserving the table structure.

**Q5. Does DROP TABLE remove indexes?**

Yes. Indexes belonging to the dropped table are removed with it.

**Q6. Does TRUNCATE execute DELETE triggers?**

No. It executes `ON TRUNCATE` triggers instead.

**Q7. What is the difference between CASCADE in DROP and TRUNCATE?**

- `DROP ... CASCADE` removes dependent database objects.
- `TRUNCATE ... CASCADE` also truncates referencing tables.

**Q8. Which command is fastest for deleting all rows?**

`TRUNCATE` is generally faster than `DELETE` when all rows must be removed. Actual performance depends on table size, dependencies, locking, and other database activity.

**Q9. What happens if DELETE is executed without WHERE?**

All rows in the target table are deleted.

**Q10. Can DROP TABLE be rolled back in PostgreSQL?**

Yes, an ordinary `DROP TABLE` can be rolled back when executed inside an uncommitted transaction.

---

## Key Takeaways

- `DELETE` — Remove specific or all rows while keeping the table.
- `TRUNCATE` — Quickly empty a table while keeping its structure.
- `DROP` — Remove the database object itself.
- `WHERE` is supported by `DELETE`, not `TRUNCATE` or `DROP`.
- `RESTART IDENTITY` resets owned sequences during truncation.
- `CASCADE` can affect dependent objects or tables; understand its meaning for each command.
- PostgreSQL supports rollback for these commands when executed inside an uncommitted transaction.
