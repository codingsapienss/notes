---
sidebar_label: Database Isolation Levels
sidebar_position: 1
---

# Database Isolation Levels

## 1. What Are Isolation Levels?

In last section, we studied concurrency problems that can occur when multiple transactions execute simultaneously:

- Dirty Read
- Non-Repeatable Read
- Phantom Read
- Lost Update
- Read Skew

The database needs a mechanism to control which changes one transaction can see while other transactions are running.

This is where **Isolation Levels** come in.

An isolation level defines the degree to which one transaction is isolated from the effects of other concurrent transactions.

In simple terms:

> An isolation level determines what one transaction is allowed to observe about another transaction's work.

Higher isolation generally provides stronger guarantees but can reduce concurrency or increase the possibility of transaction retries.

### Why do we need different isolation levels?

Imagine an e-commerce application.

Two users are purchasing the last available product.

Initial inventory:

```text
Product: Laptop
Available Stock: 1
```

Two transactions execute simultaneously:

```text
Transaction A                  Transaction B
-------------                  -------------
Read stock = 1                 Read stock = 1
Check stock > 0                Check stock > 0
Reduce stock by 1               Reduce stock by 1
Commit                         Commit
```

Depending on the database's concurrency control and the application's SQL, both transactions might incorrectly proceed.

The database needs rules to control concurrent operations.

Different isolation levels provide different strengths of protection.

---

## 2. The Four Standard SQL Isolation Levels

SQL defines four major isolation levels:

1. Read Uncommitted
2. Read Committed
3. Repeatable Read
4. Serializable

They are generally ordered from weakest to strongest isolation.

```text
Weakest Isolation
       |
       v
READ UNCOMMITTED
       |
       v
READ COMMITTED
       |
       v
REPEATABLE READ
       |
       v
SERIALIZABLE
       |
       v
Strongest Isolation
```

This ordering represents their intended isolation guarantees. Actual behavior and implementation details vary between database systems.

---

## 3. Read Uncommitted

### 3.1 Definition

Read Uncommitted is the weakest standard isolation level.

It allows a transaction to read changes made by another transaction even before those changes have been committed.

This means **dirty reads are possible** under the standard's intended semantics.

### 3.2 Example

Suppose an account has a balance of ₹10,000.

Transaction A transfers ₹2,000 from the account.

Transaction B checks the account balance at the same time.

```sql
-- Transaction A
BEGIN;

UPDATE accounts
SET balance = 8000
WHERE account_id = 1;

-- Not committed yet
```

At this point, Transaction A has changed the balance but has not committed.

Transaction B:

```sql
-- Transaction B
BEGIN;

SELECT balance
FROM accounts
WHERE account_id = 1;
```

Under Read Uncommitted semantics, Transaction B could see:

```text
balance
-------
8000
```

However, Transaction A might subsequently execute:

```sql
ROLLBACK;
```

The actual committed balance returns to:

```text
10000
```

Transaction B has read a value that was never committed.

That is a **Dirty Read**.

### 3.3 What does Read Uncommitted prevent?

It does not guarantee protection against:

- Dirty reads
- Non-repeatable reads
- Phantom reads

Lost updates and other write anomalies also depend on the database's concurrency-control mechanisms and the operations being performed.

### 3.4 When would you use it?

It is rarely appropriate for business-critical operations.

Even analytics or reporting applications should be careful because uncommitted values can produce inconsistent results.

### 3.5 PostgreSQL behavior

Important: PostgreSQL does not actually provide dirty reads.

Although PostgreSQL accepts:

```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

it internally behaves like:

```sql
READ COMMITTED
```

Therefore, in PostgreSQL, you cannot use Read Uncommitted to read another transaction's uncommitted changes.

---

## 4. Read Committed

### 4.1 Definition

Read Committed guarantees that a transaction reads only committed data.

A transaction cannot see another transaction's uncommitted changes.

However, if another transaction commits changes between two queries, the first transaction may see different values when it reads again.

This means:

- Dirty reads are prevented.
- Non-repeatable reads are possible.
- Phantom reads are possible.

### 4.2 Example: Non-Repeatable Read

Suppose an account has a balance of ₹10,000.

Two transactions execute concurrently.

**Transaction A**

```sql
BEGIN;

SELECT balance
FROM accounts
WHERE account_id = 1;
```

Result:

```text
10000
```

**Transaction B**

```sql
BEGIN;

UPDATE accounts
SET balance = 12000
WHERE account_id = 1;

COMMIT;
```

Transaction B commits the updated balance.

Now Transaction A executes the same query again:

```sql
SELECT balance
FROM accounts
WHERE account_id = 1;
```

Result:

```text
12000
```

Transaction A received two different values for the same row.

This is a **Non-Repeatable Read**.

### 4.3 Why does this happen?

Under Read Committed, each SQL statement generally gets a view of data that includes transactions committed before that statement's snapshot was established.

Therefore:

```text
Transaction A:
    SELECT balance  -> 10000

Transaction B:
    UPDATE balance  -> 12000
    COMMIT

Transaction A:
    SELECT balance  -> 12000
```

The second query can see Transaction B's committed change.

### 4.4 Phantom Read Example

Suppose Transaction A wants to find all products costing more than ₹1,000.

```sql
BEGIN;

SELECT *
FROM products
WHERE price > 1000;
```

Initial result:

```text
product_id | name       | price
-----------+------------+------
1          | Keyboard   | 1500
2          | Monitor    | 5000
```

Now Transaction B inserts another product:

```sql
BEGIN;

INSERT INTO products (name, price)
VALUES ('Mouse', 1200);

COMMIT;
```

Transaction A runs the same query again:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

New result:

```text
product_id | name       | price
-----------+------------+------
1          | Keyboard   | 1500
2          | Monitor    | 5000
3          | Mouse      | 1200
```

A new matching row appeared.

This is a **Phantom Read**.

### 4.5 What does Read Committed prevent?

| Anomaly             | Prevented?     |
| ------------------- | -------------- |
| Dirty Read          | Yes            |
| Non-Repeatable Read | No             |
| Phantom Read        | No             |
| Lost Update         | Not guaranteed |

### 4.6 PostgreSQL default isolation level

PostgreSQL uses **READ COMMITTED by default**.

For example:

```sql
BEGIN;

SELECT *
FROM accounts
WHERE account_id = 1;

COMMIT;
```

Unless you explicitly change the isolation level, PostgreSQL executes the transaction using Read Committed.

### 4.7 When should you use Read Committed?

It is a common choice for ordinary application operations:

- Fetching user profiles
- Reading product information
- Updating individual records
- Creating orders
- Performing routine CRUD operations

However, do not assume that Read Committed automatically makes complex business operations safe.

For example, inventory reservation, balance transfers, and coupon limits may require atomic SQL operations, constraints, row locks, or stronger isolation.

---

## 5. Repeatable Read

### 5.1 Definition

Repeatable Read provides a stronger guarantee than Read Committed.

Once a transaction reads a row, repeated reads of that row should return the same committed version throughout the transaction.

It prevents:

- Dirty reads
- Non-repeatable reads

The exact treatment of phantom reads depends on the database implementation.

### 5.2 Example: Non-Repeatable Read Prevention

Suppose an account has a balance of ₹10,000.

**Transaction A**

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT balance
FROM accounts
WHERE account_id = 1;
```

Result:

```text
10000
```

**Transaction B**

```sql
BEGIN;

UPDATE accounts
SET balance = 12000
WHERE account_id = 1;

COMMIT;
```

Now Transaction A executes the same query again:

```sql
SELECT balance
FROM accounts
WHERE account_id = 1;
```

Under snapshot-based Repeatable Read, Transaction A continues seeing:

```text
10000
```

It does not see Transaction B's newly committed value.

Why?

Because Transaction A continues reading from its established transaction snapshot rather than obtaining a new committed-data snapshot for each statement.

### 5.3 What about Phantom Reads?

This is where database-specific behavior matters.

The SQL standard permits phantom reads under Repeatable Read.

However, some databases provide stronger behavior.

**PostgreSQL:**

PostgreSQL's Repeatable Read uses snapshot isolation.

It prevents ordinary phantom reads within the transaction because all consistent reads use the same transaction snapshot.

For example:

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT *
FROM products
WHERE price > 1000;
```

Suppose another transaction inserts a matching product and commits.

When the first transaction repeats the query, it continues seeing the original snapshot. The newly inserted product does not appear.

**MySQL/InnoDB:**

MySQL/InnoDB also uses MVCC for consistent reads under Repeatable Read.

However, consistent snapshot reads and locking reads have different behavior. InnoDB uses mechanisms such as next-key locking for relevant locking operations to prevent certain phantom scenarios.

Do not assume that every query type behaves identically across databases.

### 5.4 Important: Repeatable Read does not eliminate every concurrency anomaly

A major misconception is:

"Repeatable Read means transactions behave exactly as if they ran one after another."

That is incorrect.

Snapshot isolation can still allow certain serialization anomalies, particularly **write skew**.

### 5.5 Write Skew Example

Imagine a hospital requires at least one doctor to remain on duty.

Two doctors are currently on duty:

```text
Doctor A: On Duty = TRUE
Doctor B: On Duty = TRUE
```

Two transactions execute simultaneously.

**Transaction A**

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT COUNT(*)
FROM doctors
WHERE on_duty = TRUE;
```

Result:

```text
2
```

Transaction A decides Doctor A can go off duty because Doctor B is still available.

```sql
UPDATE doctors
SET on_duty = FALSE
WHERE doctor_id = 1;
```

**Transaction B**

At approximately the same time:

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT COUNT(*)
FROM doctors
WHERE on_duty = TRUE;
```

Result:

```text
2
```

Transaction B decides Doctor B can go off duty because Doctor A is still available.

```sql
UPDATE doctors
SET on_duty = FALSE
WHERE doctor_id = 2;
```

Both transactions update different rows.

Both may commit under snapshot isolation.

Final result:

```text
Doctor A: Off Duty
Doctor B: Off Duty
```

The business rule has been violated.

This is called **Write Skew**.

The problem is that both transactions made decisions using a valid snapshot, but their combined changes violated a rule that depended on multiple rows.

### 5.6 What does Repeatable Read prevent?

| Anomaly                 | SQL standard guarantee | PostgreSQL                   |
| ----------------------- | ---------------------- | ---------------------------- |
| Dirty Read              | Yes                    | Prevented                    |
| Non-Repeatable Read     | Yes                    | Prevented                    |
| Phantom Read            | Not guaranteed         | Prevented for snapshot reads |
| Write Skew              | Not guaranteed         | Possible                     |
| Serialization anomalies | Not guaranteed         | Possible                     |

### 5.7 When should you use Repeatable Read?

Useful when a transaction needs a consistent view of data across multiple queries.

Examples:

- Generating a report from multiple queries
- Reading related financial records
- Performing multi-step calculations
- Processing a consistent snapshot of records

But if the business rule spans multiple rows, Repeatable Read alone may not be sufficient.

---

## 6. Serializable

### 6.1 Definition

Serializable is the strongest standard SQL isolation level.

It guarantees that successfully committed transactions produce a result equivalent to some serial execution of those transactions.

In simpler terms:

> Even if transactions execute concurrently, the final result must be equivalent to executing them one at a time in some valid order.

Consider:

```text
Transaction A
Transaction B
Transaction C
```

They may execute concurrently, but the database must ensure that their committed result is equivalent to a valid serial ordering such as:

```text
A → B → C
```

or:

```text
B → A → C
```

The database does not necessarily execute transactions one after another. It coordinates concurrency to preserve serializable outcomes.

### 6.2 Example: Write Skew Prevention

Recall the hospital example.

Initial state:

```text
Doctor A: On Duty = TRUE
Doctor B: On Duty = TRUE
```

Both transactions read the number of doctors on duty.

Both try to take one doctor off duty.

Under Serializable isolation, the database must prevent both transactions from committing if their combined result cannot be represented by a valid serial execution.

One transaction may successfully commit.

The other may fail with a serialization error.

The application must then retry the failed transaction when appropriate.

### 6.3 PostgreSQL Serializable Example

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT COUNT(*)
FROM doctors
WHERE on_duty = TRUE;

UPDATE doctors
SET on_duty = FALSE
WHERE doctor_id = 1;

COMMIT;
```

If a concurrent transaction creates a serialization conflict, PostgreSQL may abort one transaction.

A common PostgreSQL error is:

```text
ERROR: could not serialize access due to
read/write dependencies among transactions
```

The exact error depends on the conflict.

### 6.4 Does Serializable mean transactions cannot run concurrently?

No.

This is an important distinction.

Serializable does not necessarily mean:

```text
Transaction A finishes
        |
        v
Transaction B starts
        |
        v
Transaction C starts
```

Transactions can overlap in time.

The database ensures that their committed effects are equivalent to a serial ordering.

### 6.5 What does Serializable prevent?

| Anomaly                 | Prevented?                                 |
| ----------------------- | ------------------------------------------ |
| Dirty Read              | Yes                                        |
| Non-Repeatable Read     | Yes                                        |
| Phantom Read            | Yes                                        |
| Write Skew              | Yes, when it would violate serializability |
| Serialization anomalies | Yes                                        |

### 6.6 Performance considerations

Serializable can introduce additional overhead.

Depending on the database implementation, it may involve:

- More extensive locking or conflict tracking
- Transaction aborts
- Retrying failed transactions
- Reduced successful transaction throughput under contention

It is not automatically the best choice for every query.

### 6.7 When should you use Serializable?

Consider it when correctness depends on complex business rules involving multiple rows or concurrent transactions.

Examples:

- Financial operations with cross-record invariants
- Seat or ticket allocation
- Limited-stock reservations
- Maintaining complex account or resource constraints
- Operations where inconsistent concurrent decisions are unacceptable

The application must handle serialization failures correctly.

---

## 7. Complete Isolation Level Comparison

This is the most important comparison table in this chapter.

### 7.1 Standard SQL Isolation Guarantees

| Isolation Level  | Dirty Read | Non-Repeatable Read | Phantom Read |
| ---------------- | ---------- | ------------------- | ------------ |
| Read Uncommitted | Possible   | Possible            | Possible     |
| Read Committed   | Prevented  | Possible            | Possible     |
| Repeatable Read  | Prevented  | Prevented           | Possible     |
| Serializable     | Prevented  | Prevented           | Prevented    |

This table represents the minimum guarantees defined by the SQL standard. A database can provide stronger guarantees than the standard requires.

### 7.2 PostgreSQL vs MySQL/InnoDB

| Feature                             | PostgreSQL                            | MySQL/InnoDB                                                                            |
| ----------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| Default isolation                   | Read Committed                        | Repeatable Read                                                                         |
| Read Uncommitted                    | Behaves like Read Committed           | Supported as a distinct isolation level                                                 |
| Read Committed                      | Supported                             | Supported                                                                               |
| Repeatable Read                     | Snapshot isolation                    | MVCC-based Repeatable Read                                                              |
| Phantom reads under Repeatable Read | Prevented for snapshot reads          | Prevented for consistent snapshot reads; locking reads have additional locking behavior |
| Serializable implementation         | Serializable Snapshot Isolation (SSI) | Locking-based serializable behavior                                                     |
| Serialization conflicts             | Can abort transactions                | May cause blocking or deadlocks, depending on the operation                             |

**Important:** This comparison describes common behavior, not every possible edge case. Query type, locking clauses, storage engine, and transaction configuration matter.

---

## 8. How to Set Isolation Levels in SQL

### 8.1 PostgreSQL

You can set the isolation level when starting a transaction:

```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

SELECT *
FROM accounts;

COMMIT;
```

Other examples:

```sql
BEGIN TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

You can also change the isolation level before executing queries in a transaction:

```sql
BEGIN;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT *
FROM accounts;

COMMIT;
```

### 8.2 MySQL

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

START TRANSACTION;

SELECT *
FROM accounts;

COMMIT;
```

For a particular session:

```sql
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

For the server's default:

```sql
SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

The global setting affects new sessions, not transactions already running.

---

## 9. Isolation Levels in Node.js Backend Applications

Understanding isolation levels is useful, but knowing how to apply them in application code is more important.

Suppose you are using Node.js, Express, and PostgreSQL with the `pg` package.

### 9.1 Example: Starting a Serializable Transaction

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateAccount(accountId, amount) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    const result = await client.query(
      `SELECT balance
       FROM accounts
       WHERE account_id = $1`,
      [accountId],
    );

    const balance = Number(result.rows[0].balance);

    if (balance < amount) {
      throw new Error("Insufficient balance");
    }

    await client.query(
      `UPDATE accounts
       SET balance = balance - $1
       WHERE account_id = $2`,
      [amount, accountId],
    );

    await client.query("COMMIT");

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

Notice:

- The same database connection is used for the entire transaction.
- The isolation level is set when starting the transaction.
- Errors trigger rollback.
- The connection is released afterward.

### 9.2 Handling Serialization Failures

Serializable transactions can fail because of concurrent conflicts.

In PostgreSQL, serialization failures use SQLSTATE:

```text
40001
```

Your application should retry the entire transaction, not just the last failed SQL statement.

Example:

```javascript
async function runSerializableTransaction(callback, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");

      const result = await callback(client);

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

Usage:

```javascript
const result = await runSerializableTransaction(async (client) => {
  const account = await client.query(
    `SELECT balance
     FROM accounts
     WHERE account_id = $1`,
    [1],
  );

  const balance = Number(account.rows[0].balance);

  if (balance < 500) {
    throw new Error("Insufficient balance");
  }

  await client.query(
    `UPDATE accounts
     SET balance = balance - 500
     WHERE account_id = $1`,
    [1],
  );

  return { success: true };
});
```

**Production considerations:**

- Add bounded retries with backoff and jitter.
- Retry only recognized transient errors.
- Keep transactions short.
- Ensure the transaction callback does not perform non-idempotent external side effects such as sending an email or charging a payment provider.
- Make sure rollback failures do not silently leave a connection in an unusable state.

The example demonstrates the retry pattern; production code should also handle connection failures and cleanup errors carefully.

---

## 10. Choosing the Right Isolation Level

Do not blindly use Serializable everywhere.

The correct isolation level depends on the consistency requirement of the operation.

| Scenario                                   | Possible approach                                        |
| ------------------------------------------ | -------------------------------------------------------- |
| Fetching a user profile                    | Read Committed                                           |
| Fetching product details                   | Read Committed                                           |
| Ordinary CRUD operations                   | Read Committed                                           |
| Generating a consistent multi-query report | Repeatable Read                                          |
| Complex multi-row business invariants      | Serializable or explicit locking                         |
| Inventory reservation                      | Atomic conditional UPDATE, constraints, or locking       |
| Financial transfers                        | Transactions, constraints, appropriate locking/isolation |
| Preventing duplicate bookings              | Unique constraint, often combined with a transaction     |

### Example: Inventory Reservation

Suppose a product has one item remaining.

A simple but unsafe application pattern is:

```javascript
const product = await db.query("SELECT stock FROM products WHERE id = $1", [
  productId,
]);

if (product.rows[0].stock > 0) {
  await db.query("UPDATE products SET stock = stock - 1 WHERE id = $1", [
    productId,
  ]);
}
```

Two requests could both read stock as 1 before either updates it.

A better approach is an atomic conditional update:

```sql
UPDATE products
SET stock = stock - 1
WHERE id = 1
  AND stock > 0
RETURNING stock;
```

Interpret the result:

- One returned row: stock was successfully reserved.
- Zero returned rows: stock was unavailable.

This makes the stock check and decrement one atomic database operation.

For a larger workflow involving order creation, payment state, and inventory reservation, use an appropriate transaction and additional safeguards.

**Key lesson:** A stronger isolation level is not a substitute for good data modeling, constraints, and atomic SQL operations.

---

## 11. Common Misconceptions

### Misconception 1: Serializable means transactions execute one by one.

Incorrect.

Transactions may overlap. Their committed effects must be equivalent to a valid serial execution.

### Misconception 2: Repeatable Read always prevents phantom reads.

Incorrect as a universal statement.

The SQL standard permits phantoms under Repeatable Read. PostgreSQL and MySQL/InnoDB provide stronger behavior for their consistent snapshot reads.

### Misconception 3: PostgreSQL Read Uncommitted allows dirty reads.

Incorrect.

PostgreSQL treats Read Uncommitted as Read Committed.

### Misconception 4: Higher isolation is always better.

Incorrect.

Stronger isolation can increase contention, blocking, or transaction retries.

Choose isolation based on correctness requirements.

### Misconception 5: Serializable eliminates the need for error handling.

Incorrect.

Serializable transactions can be aborted. Applications must handle and retry appropriate serialization failures.

### Misconception 6: Transactions automatically prevent all business logic bugs.

Incorrect.

A transaction ensures atomicity and coordinates concurrent database operations. It does not automatically enforce every business rule.

Use database constraints and carefully designed queries.

### Misconception 7: Read Committed prevents lost updates.

Not necessarily.

Two transactions can both read the same value and then overwrite each other's changes. Use atomic updates, locking, optimistic concurrency control, or stronger isolation where appropriate.

---

## 12. Interview Questions and Answers

### Q1. What is an isolation level?

An isolation level defines how much one transaction is isolated from concurrent transactions and which anomalies are permitted.

### Q2. Name the four standard isolation levels.

1. Read Uncommitted
2. Read Committed
3. Repeatable Read
4. Serializable

### Q3. Which isolation level prevents dirty reads?

Read Committed, Repeatable Read, and Serializable.

PostgreSQL also prevents dirty reads when Read Uncommitted is requested because it behaves like Read Committed.

### Q4. Which isolation level prevents non-repeatable reads?

Repeatable Read and Serializable.

### Q5. Does Repeatable Read prevent phantom reads?

The SQL standard does not require it.

PostgreSQL's snapshot-based Repeatable Read prevents ordinary phantom reads. MySQL/InnoDB also provides snapshot consistency for ordinary consistent reads.

### Q6. What is the strongest isolation level?

Serializable.

It guarantees that committed transactions produce a result equivalent to a serial execution.

### Q7. What is the default isolation level in PostgreSQL?

Read Committed.

### Q8. What is the default isolation level in MySQL/InnoDB?

Repeatable Read.

### Q9. What is write skew?

Write skew occurs when concurrent transactions read the same consistent snapshot, update different rows, and collectively violate a business constraint.

### Q10. Can Repeatable Read allow write skew?

Yes. PostgreSQL Repeatable Read uses snapshot isolation, which can allow write skew.

### Q11. What happens when PostgreSQL detects a serialization conflict?

It may abort one transaction with SQLSTATE `40001`. The application should retry the entire transaction when appropriate.

### Q12. Should every application use Serializable?

No.

Use the weakest isolation level that safely satisfies the business consistency requirements, alongside appropriate constraints, locking, and atomic operations.

---

## 13. Chapter Summary

### Isolation Levels at a Glance

| Level            | Main Guarantee                 | Important Limitation                                  |
| ---------------- | ------------------------------ | ----------------------------------------------------- |
| Read Uncommitted | Weakest isolation              | Dirty reads can be allowed by the standard            |
| Read Committed   | Reads committed data           | Non-repeatable and phantom reads possible             |
| Repeatable Read  | Stable transaction snapshot    | Serialization anomalies such as write skew can remain |
| Serializable     | Equivalent to serial execution | May abort transactions and require retries            |

### Remember These Database-Specific Facts

| Fact             | PostgreSQL                  | MySQL/InnoDB                 |
| ---------------- | --------------------------- | ---------------------------- |
| Default          | Read Committed              | Repeatable Read              |
| Read Uncommitted | Behaves like Read Committed | Distinct isolation level     |
| Repeatable Read  | Snapshot isolation          | MVCC-based snapshot reads    |
| Serializable     | SSI                         | Locking-based implementation |

### Most Important Concepts to Retain

1. Isolation levels control the visibility and concurrency behavior of transactions.
2. Read Committed prevents dirty reads but permits non-repeatable and phantom reads.
3. Repeatable Read provides a stable snapshot in PostgreSQL.
4. Snapshot isolation does not guarantee full serializability.
5. Write skew is an important anomaly that can occur under snapshot isolation.
6. Serializable provides the strongest standard isolation guarantee.
7. PostgreSQL may abort Serializable transactions, so application-level retries matter.
8. Good SQL design, constraints, atomic updates, and appropriate isolation work together.
