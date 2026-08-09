---
sidebar_label: "Isolation Levels and Concurrency"
sidebar_position: 1
---

# Isolation Levels and Concurrency

## 1. Introduction

Database concurrency occurs when multiple transactions execute simultaneously and access or modify the same data.

Consider an e-commerce application:

- Customer A purchases a product.
- Customer B purchases the same product.
- An administrator updates its price.
- A background process updates inventory.

All these operations may happen concurrently.

Without appropriate concurrency control, transactions can produce incorrect results or observe unexpected data.

PostgreSQL handles concurrency using:

- MVCC (Multi-Version Concurrency Control).
- Transaction isolation levels.
- Row-level and table-level locks.
- Serialization conflict detection.

This chapter focuses on isolation levels and concurrency anomalies.

---

## 2. What Is Concurrency?

Concurrency means multiple transactions are executing during overlapping time periods.

Example:

Two transactions access the same bank account.

Initial balance: ₹10,000.

<escape>
Transaction A                  Transaction B
     |                               |
     | Read balance = 10,000         |
     |                               | Read balance = 10,000
     |                               |
     | Deduct 2,000                  |
     |                               | Deduct 3,000
     |                               |
     | Write 8,000                   |
     |                               | Write 7,000
     |                               |
     COMMIT                          COMMIT
</escape>

The final balance could incorrectly become ₹7,000 or ₹8,000 instead of ₹5,000.

This is an example of a lost update caused by an unsafe read-modify-write workflow.

Isolation and appropriate locking or atomic updates help prevent such problems.

---

## 3. What Is MVCC?

MVCC stands for **Multi-Version Concurrency Control**.

PostgreSQL uses MVCC to maintain multiple versions of rows.

Instead of making every reader wait for a writer, PostgreSQL allows transactions to read a consistent snapshot of data.

### Example

Suppose a product has a price of ₹1,000.

Transaction A:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;
```

Transaction A has not committed yet.

Transaction B:

```sql
SELECT price
FROM products
WHERE product_id = 101;
```

Under PostgreSQL's usual MVCC behavior, Transaction B does not see Transaction A's uncommitted value.

It sees the previously committed version, ₹1,000.

After Transaction A commits, a new statement under READ COMMITTED can see ₹1,500.

### Important concepts

- Readers generally do not block writers.
- Writers generally do not block ordinary readers.
- Conflicting writers may wait for one another.
- Transactions read row versions according to their snapshots.
- Old row versions may remain until vacuum can reclaim their space.

MVCC is one of the main reasons PostgreSQL can support concurrent workloads efficiently.

---

## 4. What Is a Dirty Read?

A dirty read occurs when one transaction reads data written by another transaction that has not committed.

### Example

Transaction A:

```sql
BEGIN;

UPDATE products
SET price = 2000
WHERE product_id = 101;

-- Not committed yet
```

Transaction B:

```sql
SELECT price
FROM products
WHERE product_id = 101;
```

In databases that permit dirty reads, Transaction B might see the uncommitted value of ₹2,000.

But PostgreSQL does not allow dirty reads.

Even if you set:

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

PostgreSQL treats READ UNCOMMITTED as READ COMMITTED.

**Result:** Transaction B sees only committed data.

---

## 5. What Is a Non-Repeatable Read?

A non-repeatable read occurs when a transaction reads the same row twice and gets different committed values.

### Example

Initial product price: ₹1,000.

Transaction A:

```sql
BEGIN;

SELECT price
FROM products
WHERE product_id = 101;
```

Result:

```text
1000
```

Meanwhile, Transaction B:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;

COMMIT;
```

Transaction A runs the same query again:

```sql
SELECT price
FROM products
WHERE product_id = 101;
```

Under READ COMMITTED, the result is:

```text
1500
```

The same transaction read two different committed values.

This is a non-repeatable read.

---

## 6. What Is a Phantom Read?

A phantom read occurs when a transaction repeats a query and finds a different set of rows because another transaction committed changes matching the query condition.

### Example

Transaction A:

```sql
BEGIN;

SELECT *
FROM orders
WHERE total_amount > 5000;
```

Suppose the query returns 5 rows.

Transaction B:

```sql
BEGIN;

INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (
    101,
    8000,
    'pending'
);

COMMIT;
```

Transaction A runs the query again:

```sql
SELECT *
FROM orders
WHERE total_amount > 5000;
```

Under READ COMMITTED, it may now return 6 rows.

The newly matching row is a phantom row.

---

## 7. What Is a Lost Update?

A lost update occurs when concurrent transactions overwrite each other's changes because both operate on an earlier value.

### Example

Initial balance: ₹10,000.

Transaction A:

```sql
BEGIN;

SELECT balance
FROM bank_accounts
WHERE account_id = 1;
```

Transaction B:

```sql
BEGIN;

SELECT balance
FROM bank_accounts
WHERE account_id = 1;
```

Both read ₹10,000.

Transaction A calculates:

```text
10,000 - 2,000 = 8,000
```

Transaction B calculates:

```text
10,000 - 3,000 = 7,000
```

Both issue updates based on their previously read values.

One update may overwrite the other.

### Better approach: Atomic update

```sql
UPDATE bank_accounts
SET balance = balance - 2000
WHERE account_id = 1;
```

Another transaction can execute:

```sql
UPDATE bank_accounts
SET balance = balance - 3000
WHERE account_id = 1;
```

PostgreSQL coordinates conflicting updates to the same row. Each update operates against the current row version after obtaining the necessary lock.

The resulting balance is ₹5,000.

For financial operations, also validate sufficient balance and use a transaction for all related operations.

---

## 8. PostgreSQL Isolation Levels

SQL defines four standard isolation levels:

1. READ UNCOMMITTED
2. READ COMMITTED
3. REPEATABLE READ
4. SERIALIZABLE

PostgreSQL supports all four names, but READ UNCOMMITTED behaves like READ COMMITTED.

### Isolation level comparison

| Isolation level  | Dirty reads  | Non-repeatable reads | Phantom reads                               | Serialization anomalies                           |
| ---------------- | ------------ | -------------------- | ------------------------------------------- | ------------------------------------------------- |
| READ UNCOMMITTED | Not possible | Possible             | Possible                                    | Possible                                          |
| READ COMMITTED   | Not possible | Possible             | Possible                                    | Possible                                          |
| REPEATABLE READ  | Not possible | Not possible         | Not possible in PostgreSQL's implementation | Possible                                          |
| SERIALIZABLE     | Not possible | Not possible         | Not possible                                | Prevented for successfully committed transactions |

**Important:** PostgreSQL's REPEATABLE READ is stronger than the minimum SQL-standard requirement because it uses snapshot isolation and prevents phantom reads.

---

## 9. READ COMMITTED

<badge color="success">PostgreSQL default</badge>

READ COMMITTED is PostgreSQL's default isolation level.

Each SQL statement gets a new snapshot of committed data.

### Syntax

```sql
BEGIN TRANSACTION
ISOLATION LEVEL READ COMMITTED;
```

Or:

```sql
BEGIN;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### Example

Transaction A:

```sql
BEGIN TRANSACTION
ISOLATION LEVEL READ COMMITTED;

SELECT price
FROM products
WHERE product_id = 101;
```

Suppose the result is ₹1,000.

Transaction B:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;

COMMIT;
```

Transaction A:

```sql
SELECT price
FROM products
WHERE product_id = 101;
```

Now it may see ₹1,500.

### Characteristics

- Each statement sees a fresh committed snapshot.
- Dirty reads are prevented.
- Non-repeatable reads are possible.
- Phantom reads are possible.
- Suitable for many ordinary application workloads.

### Important behavior

If an UPDATE encounters a row concurrently modified by another transaction, it may wait. After the other transaction commits, PostgreSQL rechecks the UPDATE condition against the updated row version.

This matters when implementing conditional updates.

---

## 10. REPEATABLE READ

REPEATABLE READ provides a stable snapshot for the transaction.

The transaction continues to see the committed data visible when its first relevant statement established the snapshot.

### Syntax

```sql
BEGIN TRANSACTION
ISOLATION LEVEL REPEATABLE READ;
```

### Example

Transaction A:

```sql
BEGIN TRANSACTION
ISOLATION LEVEL REPEATABLE READ;

SELECT price
FROM products
WHERE product_id = 101;
```

Result:

```text
1000
```

Transaction B:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;

COMMIT;
```

Transaction A:

```sql
SELECT price
FROM products
WHERE product_id = 101;
```

Result:

```text
1000
```

Transaction A continues to see its original snapshot.

### Characteristics

- Prevents dirty reads.
- Prevents non-repeatable reads.
- Prevents phantom reads in PostgreSQL.
- Can still permit serialization anomalies.
- Conflicting concurrent updates may cause a serialization failure.

### Important

A stable snapshot does not mean all possible concurrency anomalies are prevented.

For example, write skew can occur under snapshot isolation.

---

## 11. SERIALIZABLE

SERIALIZABLE is PostgreSQL's strongest isolation level.

It ensures that successfully committed concurrent transactions produce an outcome equivalent to some serial execution order.

PostgreSQL uses Serializable Snapshot Isolation (SSI) to detect dangerous dependency patterns.

When a transaction cannot safely commit under serializable rules, PostgreSQL may abort it with a serialization failure.

### Syntax

```sql
BEGIN TRANSACTION
ISOLATION LEVEL SERIALIZABLE;
```

### Example: Maintaining a business rule

Suppose at least one doctor must remain on duty.

The `doctors` table is a proposed example table.

| doctor_id | on_duty |
| --------- | ------- |
| 1         | TRUE    |
| 2         | TRUE    |

Transaction A:

```sql
BEGIN TRANSACTION
ISOLATION LEVEL SERIALIZABLE;

SELECT COUNT(*)
FROM doctors
WHERE on_duty = TRUE;

UPDATE doctors
SET on_duty = FALSE
WHERE doctor_id = 1;
```

Transaction B:

```sql
BEGIN TRANSACTION
ISOLATION LEVEL SERIALIZABLE;

SELECT COUNT(*)
FROM doctors
WHERE on_duty = TRUE;

UPDATE doctors
SET on_duty = FALSE
WHERE doctor_id = 2;
```

If both transactions independently conclude that another doctor will remain on duty, both may attempt to go off duty.

This is a write-skew scenario.

PostgreSQL's serializable conflict detection can abort one transaction rather than allowing an outcome that violates serializable execution.

### Characteristics

- Prevents dirty reads.
- Prevents non-repeatable reads.
- Prevents phantom reads.
- Prevents serialization anomalies for successfully committed transactions.
- May abort transactions that must be retried.

### Important

Applications using SERIALIZABLE must be prepared to retry transactions after SQLSTATE `40001` (serialization failure).

---

## 12. Write Skew

Write skew is a concurrency anomaly where two transactions read overlapping data and then update different rows based on the same snapshot.

Neither transaction necessarily overwrites the same row, so simple row-level write conflict detection may not catch the business-rule violation under snapshot isolation.

### Example

A hospital must always have at least one doctor on duty.

Initial state:

| Doctor | On duty |
| ------ | ------- |
| A      | TRUE    |
| B      | TRUE    |

Transaction 1 reads both rows and sees two doctors on duty.

It sets Doctor A off duty.

Transaction 2 also reads both rows and sees two doctors on duty.

It sets Doctor B off duty.

Both update different rows.

Under snapshot isolation, both may commit, leaving no doctor on duty.

### Possible solutions

- Use SERIALIZABLE isolation and retry serialization failures.
- Lock the shared rows or a common coordination row.
- Redesign the business rule using an appropriate database constraint or coordination mechanism.

**Key point:** A stable snapshot does not automatically prevent every business-level concurrency anomaly.

---

## 13. Setting Isolation Levels

### Set isolation for one transaction

```sql
BEGIN;

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT *
FROM orders;

COMMIT;
```

### Set isolation when beginning

```sql
BEGIN TRANSACTION
ISOLATION LEVEL SERIALIZABLE;

SELECT *
FROM orders;

COMMIT;
```

### Set default isolation for a session

```sql
SET SESSION CHARACTERISTICS AS TRANSACTION
ISOLATION LEVEL READ COMMITTED;
```

### Check current isolation level

```sql
SHOW transaction_isolation;
```

### Important

`SET TRANSACTION` must be executed before the first query or data-modification statement in the transaction.

---

## 14. Concurrency and Row-Level Locks

Isolation levels are not the only way to coordinate concurrent operations.

PostgreSQL also provides explicit row-level locking.

### SELECT FOR UPDATE

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 101
FOR UPDATE;

UPDATE products
SET price = 1800
WHERE product_id = 101;

COMMIT;
```

`FOR UPDATE` locks the selected rows against conflicting updates and row-locking operations until the transaction ends.

Another transaction attempting to update the same row may have to wait.

### SELECT FOR SHARE

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 101
FOR SHARE;

COMMIT;
```

This obtains a shared row lock that conflicts with certain row modifications but permits compatible locking reads.

### Other locking clauses

| Clause              | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `FOR UPDATE`        | Strong row lock for modification workflows                |
| `FOR NO KEY UPDATE` | Weaker update lock when key columns are not being changed |
| `FOR SHARE`         | Shared row lock                                           |
| `FOR KEY SHARE`     | Protects key values against certain modifications         |

Detailed locking behavior, lock conflicts and deadlocks are covered in Part 14D.

---

## 15. Concurrency in Node.js and PostgreSQL

Suppose multiple users place orders simultaneously.

A common mistake is:

1. Read inventory.
2. Check inventory in JavaScript.
3. Update inventory separately.

This introduces a race condition because another request can change inventory between steps.

### Better: Atomic conditional update

Assume `stock_quantity` is a proposed extension to the TechBazaar products table.

```sql
UPDATE products
SET stock_quantity = stock_quantity - $1
WHERE product_id = $2
  AND stock_quantity >= $1
RETURNING stock_quantity;
```

Node.js example:

```javascript
const result = await client.query(
  `UPDATE products
   SET stock_quantity = stock_quantity - $1
   WHERE product_id = $2
     AND stock_quantity >= $1
   RETURNING stock_quantity`,
  [quantity, productId],
);

if (result.rowCount === 0) {
  throw new Error("Insufficient inventory");
}
```

This avoids the separate read-then-write race for that inventory update.

For order creation, execute this statement and the related order inserts in the same transaction.

---

## 16. Handling Serialization Failures

A SERIALIZABLE transaction can fail even when the SQL statement itself is valid.

Example error:

```text
ERROR: could not serialize access due to read/write dependencies among transactions
SQLSTATE: 40001
```

This is expected behavior under SERIALIZABLE isolation.

The application should retry the entire transaction.

### Node.js retry example

```javascript
async function runTransaction(pool, work, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

      const result = await work(client);

      await client.query("COMMIT");

      return result;
    } catch (error) {
      await client.query("ROLLBACK");

      if (error.code === "40001" && attempt < maxRetries) {
        continue;
      }

      throw error;
    } finally {
      client.release();
    }
  }
}
```

Example usage:

```javascript
const result = await runTransaction(pool, async (client) => {
  const result = await client.query(
    `SELECT *
       FROM products
       WHERE product_id = $1`,
    [101],
  );

  return result.rows;
});
```

### Important production considerations

- Retry the entire transaction, not only the failed statement.
- Use bounded retries.
- Add backoff where appropriate.
- Do not repeat non-idempotent external operations inside the retryable transaction.
- Ensure the transaction can safely be executed again.

---

## 17. Which Isolation Level Should You Use?

| Isolation level  | Typical use                                                  |
| ---------------- | ------------------------------------------------------------ |
| READ COMMITTED   | General CRUD and many web application operations             |
| REPEATABLE READ  | Workflows requiring a stable transaction snapshot            |
| SERIALIZABLE     | Business rules requiring serializable execution              |
| READ UNCOMMITTED | Not meaningfully different from READ COMMITTED in PostgreSQL |

### Practical guidance

For many Node.js applications, READ COMMITTED is sufficient when:

- Updates are atomic.
- Constraints enforce integrity.
- Conflicting operations are handled correctly.

Use REPEATABLE READ when a transaction needs a consistent snapshot across multiple queries.

Use SERIALIZABLE when the business rules require serializable behavior and the application can handle retries.

Do not choose the strongest isolation level blindly. Higher isolation can introduce more transaction retries and contention.

---

## 18. Common Mistakes

| Mistake                                                             | Correct understanding                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Assuming PostgreSQL permits dirty reads                             | READ UNCOMMITTED behaves like READ COMMITTED                       |
| Assuming READ COMMITTED uses one snapshot for the whole transaction | Each statement gets a new snapshot                                 |
| Assuming REPEATABLE READ prevents every anomaly                     | Write skew can still occur                                         |
| Assuming SERIALIZABLE never produces errors                         | Serialization failures are expected and require retries            |
| Checking inventory in JavaScript and updating later                 | Use an atomic conditional update or appropriate locking            |
| Retrying only the failed SQL statement                              | Retry the entire transaction                                       |
| Keeping transactions open for a long time                           | Long transactions can increase contention and delay vacuum cleanup |
| Assuming MVCC eliminates all locks                                  | PostgreSQL still uses locks for conflicting operations             |
| Assuming SELECT FOR UPDATE locks every row in the table             | It locks selected rows, not the entire table                       |

---

## 19. Practice Exercises

Use the TechBazaar database.

1. Check the default isolation level.
2. Execute a transaction using READ COMMITTED.
3. Demonstrate a non-repeatable read using two database sessions.
4. Demonstrate a phantom read using two sessions.
5. Execute the same scenario under REPEATABLE READ.
6. Explain why PostgreSQL does not allow dirty reads.
7. Create two sessions that attempt concurrent updates to the same product.
8. Implement inventory reservation using an atomic conditional UPDATE.
9. Use SELECT FOR UPDATE to lock a product row.
10. Demonstrate write skew using a proposed doctors table.
11. Execute the write-skew scenario under SERIALIZABLE.
12. Observe a serialization failure and identify SQLSTATE `40001`.
13. Implement transaction retries in Node.js.
14. Compare READ COMMITTED, REPEATABLE READ and SERIALIZABLE.
15. Explain why a stronger isolation level may reduce throughput.

---

## 20. Interview Questions

**Q1. What is concurrency in databases?**

Multiple transactions executing during overlapping periods and accessing shared database resources.

**Q2. What is MVCC?**

Multi-Version Concurrency Control, a mechanism that allows transactions to access consistent row versions while supporting concurrent operations.

**Q3. What is a dirty read?**

Reading another transaction's uncommitted changes.

**Q4. Does PostgreSQL support dirty reads?**

No. READ UNCOMMITTED behaves like READ COMMITTED.

**Q5. What is a non-repeatable read?**

Reading the same row twice in one transaction and observing different committed values.

**Q6. What is a phantom read?**

Repeating a query and observing a different set of matching rows due to concurrent committed changes.

**Q7. What is a lost update?**

A concurrent update overwrites another transaction's change because it uses an earlier value.

**Q8. What is the default PostgreSQL isolation level?**

READ COMMITTED.

**Q9. What is the difference between READ COMMITTED and REPEATABLE READ?**

READ COMMITTED takes a new snapshot for each statement. REPEATABLE READ maintains a stable transaction snapshot.

**Q10. Does PostgreSQL REPEATABLE READ prevent phantom reads?**

Yes, under PostgreSQL's implementation.

**Q11. Does REPEATABLE READ prevent write skew?**

No. Snapshot isolation can still allow write-skew anomalies.

**Q12. What is SERIALIZABLE isolation?**

An isolation level that ensures successfully committed transactions behave as if executed in some serial order.

**Q13. What is Serializable Snapshot Isolation?**

PostgreSQL's technique for detecting dangerous read/write dependency patterns under SERIALIZABLE isolation.

**Q14. What is SQLSTATE 40001?**

Serialization failure. The application should generally retry the entire transaction.

**Q15. What does SELECT FOR UPDATE do?**

Locks selected rows against conflicting updates and row-locking operations until the transaction ends.

**Q16. How can you prevent overselling inventory?**

Use an atomic conditional UPDATE, suitable row locking or another correct concurrency-control mechanism.

**Q17. Does MVCC eliminate the need for locks?**

No. PostgreSQL still uses locks to coordinate conflicting operations.

**Q18. Which isolation level should a typical web application use?**

READ COMMITTED is a practical default for many applications, provided business operations are designed with correct atomic updates, constraints and locking.

---

## Key Takeaways

- Concurrency means multiple transactions execute simultaneously.
- PostgreSQL uses MVCC to support concurrent access.
- Dirty reads are not possible in PostgreSQL.
- READ COMMITTED is the default isolation level.
- READ COMMITTED takes a new snapshot for each statement.
- REPEATABLE READ maintains a stable transaction snapshot and prevents phantom reads in PostgreSQL.
- REPEATABLE READ can still permit write skew.
- SERIALIZABLE provides the strongest isolation guarantee.
- SERIALIZABLE transactions may fail with SQLSTATE `40001` and must be retried.
- Atomic conditional updates are useful for inventory and balance operations.
- `SELECT FOR UPDATE` provides explicit row-level locking.
- Correct concurrency design requires understanding isolation, locks and application-level business rules.
