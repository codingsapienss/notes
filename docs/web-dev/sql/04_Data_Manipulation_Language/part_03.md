---
sidebar_label: "DELETE Operations"
sidebar_position: 1
---

# DELETE Operations

## 1. Introduction to DELETE

`DELETE` is a DML (Data Manipulation Language) command used to remove existing records from a table.

Common use cases:

- Deleting a customer account.
- Removing cancelled orders.
- Deleting inactive employees.
- Removing unwanted products.
- Deleting records based on conditions or relationships.

**Important:** `DELETE` removes rows, not the table structure.

---

## 2. Basic DELETE Syntax

```sql
DELETE FROM table_name
WHERE condition;
```

Example:

```sql
DELETE FROM employees
WHERE employee_id = 5;
```

Only the employee with `employee_id = 5` is deleted.

Verify:

```sql
SELECT *
FROM employees
WHERE employee_id = 5;
```

If the deletion succeeds, the query returns no matching row.

---

## 3. DELETE Multiple Rows

You can delete multiple records using a condition.

```sql
DELETE FROM employees
WHERE status = 'inactive';
```

All employees whose status is `inactive` are deleted.

Another example:

```sql
DELETE FROM products
WHERE price < 100;
```

Deletes all products with a price below 100.

---

## 4. DELETE Without WHERE

You can delete all rows from a table:

```sql
DELETE FROM employees;
```

This removes every employee record but keeps:

- Table structure.
- Columns and data types.
- Indexes.
- Constraints.
- Associated table definition.

**Critical:** Never execute a DELETE without `WHERE` unless removing every row is intentional.

---

## 5. DELETE with RETURNING

PostgreSQL supports `RETURNING` to retrieve deleted records.

### Return the complete deleted row

```sql
DELETE FROM employees
WHERE employee_id = 5
RETURNING *;
```

### Return selected columns

```sql
DELETE FROM customers
WHERE customer_id = 10
RETURNING customer_id, customer_name, email;
```

### Return multiple deleted rows

```sql
DELETE FROM employees
WHERE status = 'inactive'
RETURNING employee_id, first_name, last_name;
```

**Why useful?**

A backend application can retrieve the deleted record directly without executing another SELECT query.

---

## 6. DELETE with IN and Subqueries

You can delete records based on the result of another query.

### Example: Delete products from a particular category

```sql
DELETE FROM products
WHERE category_id IN (
    SELECT category_id
    FROM categories
    WHERE category_name = 'Discontinued'
);
```

All products belonging to the Discontinued category are deleted.

### Example: Delete customers who have no orders

```sql
DELETE FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
    WHERE customer_id IS NOT NULL
);
```

The `IS NOT NULL` condition matters because `NOT IN` can produce unexpected results if its subquery returns NULL.

A safer alternative is `NOT EXISTS`.

---

## 7. DELETE with EXISTS and NOT EXISTS

`EXISTS` checks whether a subquery returns at least one row.

### Delete customers who have no orders

```sql
DELETE FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

This deletes customers for whom no matching order exists.

### Delete orders that have no order items

```sql
DELETE FROM orders AS o
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items AS oi
    WHERE oi.order_id = o.order_id
);
```

This is useful for cleaning up incomplete or unwanted records.

**Important:** Make sure the deletion matches your business rules. An order without items may be valid in some systems.

---

## 8. DELETE Using USING (PostgreSQL)

PostgreSQL supports `DELETE ... USING`, allowing you to delete rows based on conditions involving another table.

### Syntax

```sql
DELETE FROM target_table
USING source_table
WHERE target_table.id = source_table.id;
```

### Example: Delete employees belonging to a particular department

```sql
DELETE FROM employees AS e
USING departments AS d
WHERE e.department_id = d.department_id
  AND d.department_name = 'Discontinued';
```

This deletes employees whose department is named Discontinued.

### Important

- `USING` behaves like a join source for the deletion condition.
- Only rows from the target table are deleted.
- Matching rows in the source table are not deleted.
- Ensure the join condition is correct to avoid unintended deletions.

---

## 9. DELETE with CTE

A Common Table Expression (CTE) can help organize deletion logic.

### Example: Delete the five oldest inactive employees

```sql
WITH selected_employees AS (
    SELECT employee_id
    FROM employees
    WHERE status = 'inactive'
    ORDER BY employee_id
    LIMIT 5
)
DELETE FROM employees
WHERE employee_id IN (
    SELECT employee_id
    FROM selected_employees
)
RETURNING *;
```

This deletes at most five selected employees.

**Important:** Use a deterministic `ORDER BY` when selecting rows with `LIMIT`. Otherwise, the selected records are not guaranteed to be consistent.

---

## 10. DELETE with LIMIT — PostgreSQL Workaround

PostgreSQL does not support a direct `LIMIT` clause in `DELETE`.

Invalid:

```sql
DELETE FROM employees
WHERE status = 'inactive'
LIMIT 5;
```

Use a CTE:

```sql
WITH selected_rows AS (
    SELECT employee_id
    FROM employees
    WHERE status = 'inactive'
    ORDER BY employee_id
    LIMIT 5
)
DELETE FROM employees AS e
USING selected_rows AS s
WHERE e.employee_id = s.employee_id
RETURNING e.*;
```

This deletes at most five selected employees.

For concurrent batch-processing systems, consider using `FOR UPDATE SKIP LOCKED` in the CTE so multiple workers can process different batches without waiting on the same selected rows.

---

## 11. DELETE and Foreign Keys

Foreign keys control what happens when a referenced row is deleted.

Suppose:

- `orders.customer_id` references `customers.customer_id`.
- `order_items.order_id` references `orders.order_id`.

### Case 1: ON DELETE RESTRICT

```sql
FOREIGN KEY (customer_id)
REFERENCES customers(customer_id)
ON DELETE RESTRICT
```

If a customer has related orders, PostgreSQL prevents deleting that customer.

### Case 2: ON DELETE CASCADE

```sql
FOREIGN KEY (customer_id)
REFERENCES customers(customer_id)
ON DELETE CASCADE
```

Deleting a customer automatically deletes its referencing orders.

If `order_items` also has `ON DELETE CASCADE` referencing `orders`, those related order items are deleted as well.

### Case 3: ON DELETE SET NULL

```sql
FOREIGN KEY (customer_id)
REFERENCES customers(customer_id)
ON DELETE SET NULL
```

When a referenced customer is deleted, the corresponding `orders.customer_id` values become NULL.

The column must permit NULL.

### Example

```sql
DELETE FROM customers
WHERE customer_id = 10;
```

The actual result depends on the foreign-key actions defined in the database.

**Important:** Never assume that deleting a parent row will automatically delete its child rows. Check the foreign-key definitions first.

---

## 12. DELETE and Transactions

PostgreSQL supports transactional DELETE operations.

### Example: Rollback

```sql
BEGIN;

DELETE FROM employees
WHERE employee_id = 5;

ROLLBACK;
```

The deleted employee is restored.

### Example: Commit

```sql
BEGIN;

DELETE FROM employees
WHERE employee_id = 5;

COMMIT;
```

The deletion is committed.

### Using SAVEPOINT

```sql
BEGIN;

DELETE FROM employees
WHERE employee_id = 5;

SAVEPOINT before_second_delete;

DELETE FROM employees
WHERE employee_id = 6;

ROLLBACK TO SAVEPOINT before_second_delete;

COMMIT;
```

Result:

- Employee 5 remains deleted.
- Employee 6 is restored.

---

## 13. DELETE and Concurrency

PostgreSQL acquires row-level locks when deleting rows.

If another transaction is modifying or locking the same row, the DELETE may wait until that transaction completes.

### Example

```sql
BEGIN;

DELETE FROM inventory
WHERE product_id = 10;

COMMIT;
```

A concurrent transaction attempting to update or delete the same row may need to wait.

### Safe deletion with a condition

Suppose you want to delete an expired record only if it is still expired:

```sql
DELETE FROM orders
WHERE order_id = 100
  AND status = 'cancelled'
RETURNING order_id, status;
```

The condition is checked as part of the DELETE statement.

This is generally safer than reading a row first and later deleting it without rechecking the condition.

---

## 14. DELETE in Node.js with PostgreSQL

Use parameterized queries when accepting values from application input.

### Example using `pg`

```javascript
const result = await pool.query(
  `DELETE FROM customers
     WHERE customer_id = $1
     RETURNING customer_id, customer_name, email`,
  [10],
);

if (result.rowCount === 0) {
  console.log("Customer not found");
} else {
  console.log("Deleted customer:", result.rows[0]);
}
```

### Important concepts

- `$1` is a positional parameter.
- User values are passed separately from SQL.
- `RETURNING` retrieves the deleted record.
- `rowCount` indicates how many rows were deleted.
- Check `rowCount` to determine whether a matching record existed.

### Unsafe query

```javascript
const query = `
    DELETE FROM customers
    WHERE customer_id = ${customerId}
`;
```

This can expose the application to SQL injection if `customerId` contains untrusted input.

### Safe query

```javascript
const result = await pool.query(
  `DELETE FROM customers
     WHERE customer_id = $1`,
  [customerId],
);
```

---

## 15. DELETE vs TRUNCATE vs DROP

| Feature                  | DELETE      | TRUNCATE                | DROP                                     |
| ------------------------ | ----------- | ----------------------- | ---------------------------------------- |
| Purpose                  | Remove rows | Empty a table           | Remove an object                         |
| Supports WHERE           | Yes         | No                      | No                                       |
| Removes selected rows    | Yes         | No                      | No                                       |
| Removes all rows         | Yes         | Yes                     | Yes                                      |
| Keeps table structure    | Yes         | Yes                     | No                                       |
| Supports RETURNING       | Yes         | No                      | No                                       |
| Fires DELETE triggers    | Yes         | No                      | No                                       |
| Transaction rollback     | Yes         | Yes                     | Yes for ordinary transactional DROP      |
| Resets identity sequence | No          | With `RESTART IDENTITY` | Removes the table and its owned sequence |

Choose based on the required operation, not simply performance.

---

## 16. Common DELETE Mistakes

| Mistake                        | Why it is problematic                              |
| ------------------------------ | -------------------------------------------------- |
| Missing WHERE                  | Deletes every row                                  |
| Using `= NULL`                 | Does not correctly match NULL values               |
| Ignoring foreign keys          | Deletion may fail or cascade to other rows         |
| Using NOT IN with NULL results | Can cause unexpected filtering                     |
| Incorrect JOIN/USING condition | Can delete unintended records                      |
| Not checking rowCount          | Application may not detect that no row was deleted |
| Unparameterized query          | Creates SQL injection risk                         |
| Assuming rollback after COMMIT | Committed changes are not automatically reversible |

---

## 17. Safe DELETE Practices

Before deleting production data:

1. Run a SELECT with the same condition.
2. Verify the exact records that will be deleted.
3. Check foreign-key dependencies and cascade behaviour.
4. Use a transaction when appropriate.
5. Use `RETURNING` to inspect deleted records.
6. Commit only after verifying the result.

Example:

```sql
BEGIN;

SELECT *
FROM employees
WHERE status = 'inactive';

DELETE FROM employees
WHERE status = 'inactive'
RETURNING *;

-- Verify the deleted records.

ROLLBACK;
-- Use COMMIT only when the deletion is confirmed.
```

For large tables, consider deleting in controlled batches to reduce long-running transactions, lock contention, and excessive resource usage.

---

## 18. Practice Exercises

Use the TechBazaar database.

1. Delete employee `5`.
2. Delete all inactive employees.
3. Delete products whose price is below ₹100.
4. Delete customers who have no orders using `NOT EXISTS`.
5. Delete products belonging to a particular category using a subquery.
6. Delete employees belonging to the Support department using `DELETE ... USING`.
7. Delete the five oldest inactive employees using a CTE.
8. Delete an order and observe how its foreign-key constraints behave.
9. Delete a customer and inspect the effect of `ON DELETE CASCADE`.
10. Delete a customer and return the deleted record.
11. Execute a DELETE inside a transaction and roll it back.
12. Write a parameterized DELETE query in Node.js using `pg`.

---

## 19. Interview Questions

**Q1. What is DELETE in SQL?**

A DML command used to remove existing rows from a table.

**Q2. What happens if DELETE is executed without WHERE?**

All rows in the target table are deleted.

**Q3. Does DELETE remove table structure?**

No. It removes rows while preserving the table definition.

**Q4. Can DELETE return deleted records in PostgreSQL?**

Yes, using `RETURNING`.

**Q5. Can PostgreSQL DELETE use another table?**

Yes, using `DELETE ... USING` or subqueries.

**Q6. Does PostgreSQL support LIMIT directly in DELETE?**

No. Use a CTE or subquery to select the rows to delete.

**Q7. What happens when a parent record is deleted?**

The result depends on the foreign-key action: `CASCADE`, `RESTRICT`, `NO ACTION`, `SET NULL`, or `SET DEFAULT`.

**Q8. Can DELETE be rolled back?**

Yes, if it is executed inside an uncommitted transaction.

**Q9. What is the difference between DELETE and TRUNCATE?**

DELETE supports conditional row removal. TRUNCATE removes all rows from a table and is generally faster for emptying an entire table.

**Q10. How do you safely delete a customer who has no orders?**

Use `NOT EXISTS`:

```sql
DELETE FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

---

## Key Takeaways

- `DELETE` removes existing rows without removing the table.
- `WHERE` determines which rows are deleted.
- Without `WHERE`, all rows are deleted.
- `RETURNING` retrieves deleted records.
- `EXISTS` and `NOT EXISTS` help with relationship-based deletion.
- PostgreSQL supports `DELETE ... USING`.
- PostgreSQL does not support direct `DELETE LIMIT`.
- Foreign-key actions determine what happens to related records.
- Transactions allow DELETE operations to be rolled back before commit.
- Use parameterized queries in backend applications.
- Always verify the target rows before executing production DELETE statements.
