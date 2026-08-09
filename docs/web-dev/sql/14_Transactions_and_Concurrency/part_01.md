---
sidebar_label: "Transaction Fundamentals"
sidebar_position: 1
---

# Transaction Fundamentals

## 1. Introduction

A database transaction is a group of SQL operations treated as one logical unit of work.

A transaction ensures that related database operations are completed together or rolled back when they cannot be completed successfully.

Consider an e-commerce application where a customer places an order.

The application may need to:

1. Create an order.
2. Insert order items.
3. Reduce product inventory.
4. Record payment information.

If the order is created but inventory is not updated, the database may become inconsistent.

Transactions help prevent such partial operations from being committed.

---

## 2. What Is a Transaction?

A transaction is a sequence of database operations executed as a single logical unit.

Example:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;

UPDATE products
SET price = 2000
WHERE product_id = 102;

COMMIT;
```

Both updates belong to the same transaction.

If both operations succeed and the transaction commits, both changes become permanent.

If an error occurs and the transaction is rolled back, neither update remains committed.

### Transaction lifecycle

<escape>
BEGIN → SQL Operations → COMMIT
                    ↘ ROLLBACK
</escape>

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `BEGIN`                 | Starts a transaction                          |
| `COMMIT`                | Makes transaction changes permanent           |
| `ROLLBACK`              | Discards uncommitted changes                  |
| `SAVEPOINT`             | Creates a rollback point inside a transaction |
| `ROLLBACK TO SAVEPOINT` | Reverts changes made after a savepoint        |

---

## 3. BEGIN — Starting a Transaction

PostgreSQL supports explicit transaction control using `BEGIN`.

### Syntax

```sql
BEGIN;
```

You can also write:

```sql
START TRANSACTION;
```

Both start an explicit transaction.

### Example

```sql
BEGIN;

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul Sharma',
    'rahul@example.com'
);

COMMIT;
```

The inserted customer becomes part of the committed database state after COMMIT succeeds.

**Important:** PostgreSQL normally runs each standalone statement in its own implicit transaction when you are not inside an explicit transaction block.

---

## 4. COMMIT — Saving Changes

`COMMIT` successfully ends the current transaction and makes its changes permanent.

### Example

```sql
BEGIN;

UPDATE products
SET price = 1800
WHERE product_id = 101;

COMMIT;
```

After the commit, the new price is stored as a committed change.

### Important points

- All successful changes in the transaction are committed together.
- Other transactions can observe the committed changes according to PostgreSQL's isolation rules.
- You cannot roll back a transaction after it has successfully committed.
- A commit can fail, for example, because of deferred constraint violations or other errors.

---

## 5. ROLLBACK — Undoing Changes

`ROLLBACK` aborts the current transaction and discards its uncommitted database changes.

### Example

```sql
BEGIN;

UPDATE products
SET price = 500
WHERE product_id = 101;

ROLLBACK;
```

The price change is discarded.

The previously committed value remains unchanged.

### Another example

```sql
BEGIN;

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Amit',
    'amit@example.com'
);

DELETE FROM orders
WHERE order_id = 101;

ROLLBACK;
```

Both operations are rolled back.

### Important

Rollback does not mean PostgreSQL reverses every external side effect.

For example, a transaction rollback cannot automatically undo:

- An email sent by your application.
- An external payment processed by a payment gateway.
- A message already published to an external message broker.

These require separate application-level consistency mechanisms.

---

## 6. Practical Example — Bank Money Transfer

Suppose account A has ₹10,000 and account B has ₹5,000.

You need to transfer ₹2,000 from A to B.

### Step 1: Deduct money from A

```sql
UPDATE bank_accounts
SET balance = balance - 2000
WHERE account_id = 1;
```

### Step 2: Add money to B

```sql
UPDATE bank_accounts
SET balance = balance + 2000
WHERE account_id = 2;
```

Without a transaction, the first update might succeed while the second fails.

That would leave the accounts inconsistent.

### Correct implementation

```sql
BEGIN;

UPDATE bank_accounts
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE bank_accounts
SET balance = balance + 2000
WHERE account_id = 2;

COMMIT;
```

Now both changes belong to the same transaction.

If an operation fails, the application should roll back the transaction rather than commit a partial transfer.

### Better implementation with validation

```sql
BEGIN;

UPDATE bank_accounts
SET balance = balance - 2000
WHERE account_id = 1
  AND balance >= 2000;

-- Application must verify that exactly one row was updated.

UPDATE bank_accounts
SET balance = balance + 2000
WHERE account_id = 2;

-- Application must verify that exactly one row was updated.

COMMIT;
```

If either update affects an unexpected number of rows, the application must execute `ROLLBACK`.

For stronger protection against concurrent transfers, use appropriate locking or atomic conditional updates. Transaction boundaries alone do not prevent every concurrency problem.

---

## 7. Transactions and Errors

PostgreSQL behaves differently after an SQL statement fails inside an explicit transaction.

Suppose:

```sql
BEGIN;

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
);

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Amit',
    'duplicate@example.com'
);

COMMIT;
```

Assume the second INSERT violates a unique constraint.

PostgreSQL marks the transaction as aborted.

The final COMMIT does not successfully commit the earlier INSERT.

You must roll back:

```sql
ROLLBACK;
```

### Transaction states

| State          | Meaning                                                  |
| -------------- | -------------------------------------------------------- |
| Active         | Transaction is executing normally                        |
| Failed/aborted | A statement failed; transaction cannot continue normally |
| Committed      | Changes have been committed                              |
| Rolled back    | Uncommitted changes have been discarded                  |

### Important

After a statement error, ordinary SQL commands will fail until the transaction is rolled back or rolled back to a savepoint created before the error.

---

## 8. SAVEPOINT — Partial Rollback

A savepoint creates a rollback point inside an existing transaction.

It allows you to undo some operations without discarding the entire transaction.

### Syntax

```sql
SAVEPOINT savepoint_name;
```

Rollback to it:

```sql
ROLLBACK TO SAVEPOINT savepoint_name;
```

### Example

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;

SAVEPOINT price_updated;

UPDATE products
SET price = 2000
WHERE product_id = 102;

ROLLBACK TO SAVEPOINT price_updated;

COMMIT;
```

Result:

- Product 101's price update is committed.
- Product 102's price update is rolled back.

### Transaction flow

<escape>
BEGIN
  |
  v
UPDATE product 101
  |
  v
SAVEPOINT price_updated
  |
  v
UPDATE product 102
  |
  v
ROLLBACK TO SAVEPOINT
  |
  v
COMMIT
</escape>

### Important

`ROLLBACK TO SAVEPOINT` does not end the transaction.

You can continue executing SQL afterward.

---

## 9. RELEASE SAVEPOINT

`RELEASE SAVEPOINT` removes a savepoint.

### Example

```sql
BEGIN;

UPDATE products
SET price = 1600
WHERE product_id = 101;

SAVEPOINT product_update;

UPDATE products
SET price = 1800
WHERE product_id = 102;

RELEASE SAVEPOINT product_update;

COMMIT;
```

Both updates are committed.

### Important

Releasing a savepoint does not commit the transaction.

The transaction remains active until COMMIT or ROLLBACK.

---

## 10. PostgreSQL Autocommit

Most PostgreSQL clients operate in autocommit mode by default.

This means each SQL statement outside an explicit transaction block is committed automatically if successful.

Example:

```sql
INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
);
```

If the statement succeeds, its transaction is committed automatically.

### Explicit transaction

```sql
BEGIN;

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
);

INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (
    101,
    2500,
    'pending'
);

COMMIT;
```

Both statements are controlled by one transaction.

### Comparison

| Autocommit                                      | Explicit transaction                      |
| ----------------------------------------------- | ----------------------------------------- |
| Each standalone statement commits independently | Multiple statements share one transaction |
| Simple operations                               | Related operations                        |
| Failure affects the failed statement            | Failure can abort the entire transaction  |
| No manual COMMIT required                       | Explicit COMMIT or ROLLBACK required      |

---

## 11. Nested Transactions — Important PostgreSQL Behavior

PostgreSQL does not support independently nested transactions using repeated `BEGIN` statements.

Example:

```sql
BEGIN;

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
);

BEGIN;
```

The second BEGIN does not create an independent nested transaction. PostgreSQL reports a warning that a transaction is already in progress.

Use SAVEPOINT for partial rollback instead.

```sql
BEGIN;

INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
);

SAVEPOINT inner_operation;

UPDATE products
SET price = 1800
WHERE product_id = 101;

ROLLBACK TO SAVEPOINT inner_operation;

COMMIT;
```

The customer insert is committed, while the product update is discarded.

---

## 12. Transaction Status in PostgreSQL

You can inspect transaction information through PostgreSQL system functions.

### Check whether the current transaction is read-only

```sql
SHOW transaction_read_only;
```

### Check transaction isolation level

```sql
SHOW transaction_isolation;
```

### Check transaction deferrability

```sql
SHOW transaction_deferrable;
```

These settings help understand the current transaction configuration.

---

## 13. Transactions in Node.js and Express

Transactions are particularly important in backend applications.

Suppose an order creation API needs to:

1. Insert an order.
2. Insert order items.
3. Reduce inventory.

All these operations should succeed together.

Using the `pg` package:

```javascript
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const orderResult = await client.query(
    `INSERT INTO orders
      (customer_id, total_amount, status)
     VALUES ($1, $2, $3)
     RETURNING order_id`,
    [101, 2500, "pending"],
  );

  const orderId = orderResult.rows[0].order_id;

  await client.query(
    `INSERT INTO order_items
      (order_id, product_id, quantity, unit_price)
     VALUES ($1, $2, $3, $4)`,
    [orderId, 101, 2, 1250],
  );

  await client.query(
    `UPDATE products
     SET stock_quantity = stock_quantity - $1
     WHERE product_id = $2
       AND stock_quantity >= $1`,
    [2, 101],
  );

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

**Important:** `stock_quantity` is not part of the supplied TechBazaar schema. This example assumes a proposed extension to the products table.

Also, production code must verify that the inventory UPDATE affected exactly one row. Otherwise, the transaction should be rolled back.

### Why use one client?

All statements in a PostgreSQL transaction must run on the same database connection.

Do not use separate `pool.query()` calls for statements in one transaction because they may execute on different connections.

---

## 14. Common Transaction Mistakes

| Mistake                                               | Correct approach                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| Forgetting COMMIT                                     | Changes remain uncommitted until the transaction ends             |
| Forgetting ROLLBACK after an error                    | PostgreSQL keeps the transaction in an aborted state              |
| Using separate connections for transaction statements | Use one checked-out client                                        |
| Assuming BEGIN creates a nested transaction           | Use SAVEPOINT                                                     |
| Assuming ROLLBACK undoes external API calls           | Use application-level compensation or reliable messaging patterns |
| Keeping transactions open for too long                | Keep transaction duration short                                   |
| Assuming transactions prevent every concurrency issue | Understand isolation and locking                                  |
| Committing without validating affected rows           | Check row counts and business conditions                          |

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Start a transaction using BEGIN.
2. Insert a customer and commit.
3. Insert another customer and roll back.
4. Update two products inside one transaction.
5. Create a savepoint after the first update.
6. Roll back only the second update.
7. Release a savepoint and commit.
8. Intentionally violate a unique constraint and inspect transaction behavior.
9. Recover from a statement error using ROLLBACK.
10. Write a transaction that inserts an order and its order items.
11. Explain why all statements in a transaction must use the same PostgreSQL connection.
12. Implement a transaction in Node.js using `pool.connect()`.
13. Add inventory validation to an order transaction.
14. Explain why an external payment API call cannot be undone using SQL ROLLBACK.
15. Demonstrate the difference between autocommit and an explicit transaction.

---

## 16. Interview Questions

**Q1. What is a database transaction?**

A logical unit of work containing one or more database operations.

**Q2. What does BEGIN do?**

Starts an explicit transaction.

**Q3. What does COMMIT do?**

Makes the transaction's changes permanent.

**Q4. What does ROLLBACK do?**

Discards the uncommitted changes in the current transaction.

**Q5. What is a SAVEPOINT?**

A named point inside a transaction to which partial rollback is possible.

**Q6. What is the difference between ROLLBACK and ROLLBACK TO SAVEPOINT?**

ROLLBACK aborts the entire current transaction. ROLLBACK TO SAVEPOINT only undoes changes made after the specified savepoint.

**Q7. Does RELEASE SAVEPOINT commit a transaction?**

No. It removes the savepoint but leaves the transaction active.

**Q8. Does PostgreSQL support nested transactions?**

Not as independent nested transactions. SAVEPOINT provides similar partial-rollback functionality.

**Q9. What happens if a statement fails inside a PostgreSQL transaction?**

The transaction enters an aborted state until it is rolled back or rolled back to an earlier savepoint.

**Q10. What is autocommit?**

Each standalone statement is committed automatically when it succeeds.

**Q11. Can a transaction roll back an external payment?**

No. External side effects require separate compensation or distributed consistency mechanisms.

**Q12. Why should all transaction queries use the same connection?**

A transaction belongs to one database session. Another connection does not automatically participate in that transaction.

**Q13. Why are transactions important in money transfers?**

They prevent one account update from being committed without the corresponding update to the other account.

**Q14. Do transactions automatically prevent race conditions?**

No. Isolation levels, locks and appropriate SQL operations are also necessary.

**Q15. What happens if you forget to commit?**

The transaction remains open until it is explicitly committed, rolled back or the session ends. An open transaction can hold locks and interfere with database maintenance.

---

## Key Takeaways

- A transaction groups related SQL operations into one logical unit.
- `BEGIN` starts a transaction.
- `COMMIT` makes changes permanent.
- `ROLLBACK` discards uncommitted changes.
- `SAVEPOINT` enables partial rollback.
- `RELEASE SAVEPOINT` removes a savepoint without committing.
- PostgreSQL does not support independently nested transactions.
- PostgreSQL transactions become aborted after an unhandled statement error.
- Autocommit commits successful standalone statements automatically.
- Backend transactions must use the same database connection.
- SQL rollback cannot undo external side effects.
- Transactions alone do not solve every concurrency problem.
