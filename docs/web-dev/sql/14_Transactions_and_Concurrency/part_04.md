---
sidebar_label: "Locks and Deadlocks"
sidebar_position: 1
---

# Locks and Deadlocks

## 1. Introduction

PostgreSQL uses locks to coordinate concurrent transactions and protect database objects from conflicting operations.

Consider an e-commerce application:

- Customer A updates a product's inventory.
- Customer B purchases the same product.
- An administrator modifies the product price.
- A background process updates order status.

When multiple transactions access the same data, PostgreSQL must coordinate their operations.

Locks help prevent conflicting modifications and maintain database integrity.

This chapter covers:

1. Lock fundamentals.
2. Table-level locks.
3. Row-level locks.
4. Shared and exclusive locks.
5. SELECT FOR UPDATE and related clauses.
6. Lock compatibility.
7. Deadlocks.
8. Deadlock prevention and handling.
9. Lock inspection in PostgreSQL.
10. Practical Node.js examples.

---

## 2. What Is a Database Lock?

A lock is a mechanism that controls concurrent access to database resources.

Locks help ensure that incompatible operations do not interfere with each other.

### Example

Suppose a product has 10 units in stock.

Transaction A:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;
```

Transaction A holds a row-level lock on the modified product row until its transaction ends.

Transaction B:

```sql
BEGIN;

UPDATE products
SET price = 1800
WHERE product_id = 101;
```

Transaction B must wait for Transaction A to finish before it can update the conflicting row.

If A commits, B can proceed using the updated row version.

### Important

- Locks coordinate conflicting operations.
- Some locks are held until transaction completion.
- PostgreSQL supports concurrent reads and writes using MVCC.
- Not every database operation requires an exclusive lock.
- Long-running transactions can cause lock contention.

---

## 3. Types of Locks in PostgreSQL

PostgreSQL has several lock categories.

| Lock category     | Purpose                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Table-level locks | Coordinate operations on database tables                          |
| Row-level locks   | Coordinate conflicting operations on individual rows              |
| Page-level locks  | Short-term protection of pages during certain internal operations |
| Advisory locks    | Application-defined coordination mechanisms                       |
| Predicate locks   | Track read dependencies for SERIALIZABLE transactions             |

The two most important categories for application developers are table-level and row-level locks.

---

## 4. Table-Level Locks

Table-level locks coordinate operations that affect a table.

PostgreSQL automatically acquires table locks for many SQL statements.

Examples:

```sql
SELECT *
FROM products;
```

```sql
INSERT INTO products (
    product_name,
    price
)
VALUES (
    'Keyboard',
    1500
);
```

```sql
UPDATE products
SET price = 1800
WHERE product_id = 101;
```

Different SQL operations acquire different lock modes.

### Important table lock modes

| Lock mode              | Typical use                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| ACCESS SHARE           | Ordinary SELECT                                                      |
| ROW SHARE              | SELECT FOR UPDATE and SELECT FOR SHARE                               |
| ROW EXCLUSIVE          | INSERT, UPDATE, DELETE, MERGE                                        |
| SHARE UPDATE EXCLUSIVE | Some maintenance operations, including VACUUM (non-FULL) and ANALYZE |
| SHARE                  | Certain operations that need a stable table                          |
| SHARE ROW EXCLUSIVE    | Certain schema and maintenance operations                            |
| EXCLUSIVE              | Restricts concurrent access more strongly                            |
| ACCESS EXCLUSIVE       | Strongest table lock; blocks ordinary reads and writes               |

### Example: ACCESS SHARE

An ordinary SELECT obtains an ACCESS SHARE table lock.

```sql
BEGIN;

SELECT *
FROM products;

COMMIT;
```

ACCESS SHARE is compatible with most table lock modes but conflicts with ACCESS EXCLUSIVE.

### Example: ACCESS EXCLUSIVE

```sql
BEGIN;

LOCK TABLE products
IN ACCESS EXCLUSIVE MODE;

COMMIT;
```

This lock blocks other transactions from accessing the table in ways that require conflicting table locks, including ordinary SELECT statements.

**Important:** Table-level locks do not mean that every UPDATE locks the entire table against other updates. PostgreSQL combines table-level and row-level locking.

---

## 5. Row-Level Locks

Row-level locks protect individual rows from conflicting operations.

They are particularly important for applications where multiple users may modify the same record.

### Example

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

The `FOR UPDATE` clause locks the selected rows.

Another transaction attempting a conflicting update or row lock on the same rows must wait.

### Why use row-level locks?

Suppose:

| Product  | Stock |
| -------- | ----: |
| Keyboard |    10 |
| Mouse    |    20 |

Transaction A locks the keyboard row.

Transaction B can still update the mouse row because it is a different row and there is no conflicting table-level lock.

This allows greater concurrency than locking the entire table against modifications.

### Important

PostgreSQL row locks do not generally block ordinary SELECT statements.

Readers can continue reading previously committed row versions through MVCC.

---

## 6. SELECT FOR UPDATE

`SELECT FOR UPDATE` obtains the strongest ordinary row-level lock used for a modification workflow.

### Syntax

```sql
SELECT *
FROM table_name
WHERE condition
FOR UPDATE;
```

### Example

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

### Behavior

1. PostgreSQL identifies matching rows.
2. It locks those rows.
3. Conflicting updates and row-locking operations must wait.
4. The locks remain until the transaction ends.

### Practical inventory example

Assume `stock_quantity` is a proposed extension to the supplied TechBazaar schema.

```sql
BEGIN;

SELECT stock_quantity
FROM products
WHERE product_id = 101
FOR UPDATE;

-- Application checks that sufficient stock exists.

UPDATE products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 101;

COMMIT;
```

This prevents another transaction from modifying the locked row while the application performs its check and update.

**Important:** Always keep this transaction short. Do not call external APIs or wait for user input while holding the lock.

---

## 7. SELECT FOR NO KEY UPDATE

`FOR NO KEY UPDATE` obtains a weaker row-level lock than `FOR UPDATE`.

### Syntax

```sql
SELECT *
FROM products
WHERE product_id = 101
FOR NO KEY UPDATE;
```

It is suitable for modifications that do not need the stronger key-protecting lock.

For example:

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 101
FOR NO KEY UPDATE;

UPDATE products
SET price = 1800
WHERE product_id = 101;

COMMIT;
```

This lock still conflicts with other updates and row-locking operations that require incompatible locks.

---

## 8. SELECT FOR SHARE

`FOR SHARE` obtains a shared row-level lock.

Multiple transactions can hold compatible SHARE locks on the same row.

However, a conflicting UPDATE or DELETE must wait.

### Example

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 101
FOR SHARE;

COMMIT;
```

Useful when an application needs to protect selected rows from modification during a transaction without exclusively locking them against other compatible readers.

---

## 9. SELECT FOR KEY SHARE

`FOR KEY SHARE` obtains a weaker row-level lock.

It primarily protects key values from changes that would affect certain foreign-key relationships.

### Example

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 101
FOR KEY SHARE;

COMMIT;
```

This lock is compatible with other KEY SHARE locks and certain weaker operations.

It conflicts with operations that would delete the row or change its key values.

### Comparison

| Lock clause       | Main purpose                                          |
| ----------------- | ----------------------------------------------------- |
| FOR UPDATE        | Strong row lock for modification workflows            |
| FOR NO KEY UPDATE | Weaker update lock when key protection is unnecessary |
| FOR SHARE         | Shared lock that prevents conflicting modifications   |
| FOR KEY SHARE     | Protects key values against certain changes           |

---

## 10. NOWAIT

Normally, a transaction waits if it encounters a conflicting row lock.

`NOWAIT` tells PostgreSQL to fail immediately instead of waiting.

### Example

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 101
FOR UPDATE NOWAIT;

COMMIT;
```

If another transaction holds a conflicting lock, PostgreSQL raises an error.

### Use case

Useful when an application prefers to report that a resource is currently busy rather than waiting.

Example:

- A user attempts to edit a resource.
- Another transaction currently holds the required lock.
- The application returns a conflict or retry response.

**Important:** A NOWAIT error inside an explicit transaction aborts that transaction unless handled through a savepoint.

---

## 11. SKIP LOCKED

`SKIP LOCKED` tells PostgreSQL to skip rows that are currently locked by conflicting transactions rather than waiting for them.

This is particularly useful for job queues.

### Example: Job queue

Assume a proposed table:

```sql
CREATE TABLE jobs (
    job_id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Two workers are processing jobs simultaneously.

Worker A:

```sql
BEGIN;

SELECT *
FROM jobs
WHERE status = 'pending'
ORDER BY created_at
LIMIT 5
FOR UPDATE SKIP LOCKED;
```

Worker B runs the same query.

Worker B skips rows already locked by Worker A and can select other available jobs.

After processing, each worker updates its selected jobs and commits.

### Example completion

```sql
UPDATE jobs
SET status = 'completed'
WHERE job_id = 101;

COMMIT;
```

### Why is SKIP LOCKED useful?

- Multiple workers can process jobs concurrently.
- Workers avoid waiting for rows already claimed by others.
- Reduces contention in queue-processing workloads.

### Important

SKIP LOCKED provides an inconsistent view of the data by intentionally skipping locked rows.

It is suitable for queue-like workloads, not general-purpose reporting queries.

---

## 12. Lock Compatibility

Not every lock conflicts with every other lock.

PostgreSQL has a lock compatibility matrix.

For example:

- ACCESS SHARE is compatible with ROW EXCLUSIVE.
- ROW EXCLUSIVE is compatible with another ROW EXCLUSIVE.
- ACCESS EXCLUSIVE conflicts with every other table-level lock mode.

### Simplified examples

| Lock A        | Lock B           | Compatible? |
| ------------- | ---------------- | ----------- |
| ACCESS SHARE  | ACCESS SHARE     | Yes         |
| ACCESS SHARE  | ROW EXCLUSIVE    | Yes         |
| ROW EXCLUSIVE | ROW EXCLUSIVE    | Yes         |
| ACCESS SHARE  | ACCESS EXCLUSIVE | No          |
| ROW EXCLUSIVE | ACCESS EXCLUSIVE | No          |

For row-level locks:

| Lock A            | Lock B        | Compatible? |
| ----------------- | ------------- | ----------- |
| FOR SHARE         | FOR SHARE     | Yes         |
| FOR KEY SHARE     | FOR KEY SHARE | Yes         |
| FOR NO KEY UPDATE | FOR KEY SHARE | Yes         |
| FOR UPDATE        | FOR SHARE     | No          |
| FOR UPDATE        | FOR UPDATE    | No          |

These are simplified examples. PostgreSQL's complete lock compatibility rules include all table and row lock modes.

---

## 13. What Is a Deadlock?

A deadlock occurs when two or more transactions wait for one another's locks in a cycle.

None of the transactions can proceed without another transaction releasing a lock.

### Example

Suppose two products exist:

| Product  |  ID |
| -------- | --: |
| Keyboard | 101 |
| Mouse    | 102 |

Transaction A:

```sql
BEGIN;

UPDATE products
SET price = 1500
WHERE product_id = 101;
```

Transaction B:

```sql
BEGIN;

UPDATE products
SET price = 2000
WHERE product_id = 102;
```

Now:

Transaction A attempts:

```sql
UPDATE products
SET price = 1600
WHERE product_id = 102;
```

Transaction B attempts:

```sql
UPDATE products
SET price = 2100
WHERE product_id = 101;
```

### What happens?

<escape>
Transaction A                  Transaction B
     |                               |
     | Locks product 101             |
     |                               | Locks product 102
     |                               |
     | Requests product 102          | Requests product 101
     |                               |
     | Waits for B                   | Waits for A
     |                               |
     +---------- DEADLOCK -----------+
</escape>

Transaction A waits for B.

Transaction B waits for A.

PostgreSQL detects the deadlock and aborts one transaction so the other can continue.

### Typical error

```text
ERROR: deadlock detected
SQLSTATE: 40P01
```

The application must handle the error and decide whether to retry the aborted transaction.

---

## 14. How PostgreSQL Detects Deadlocks

PostgreSQL maintains information about lock requests and waiting transactions.

When a transaction waits long enough, PostgreSQL performs deadlock detection.

If it finds a cycle in the lock dependency graph:

1. PostgreSQL identifies the deadlock.
2. It chooses a transaction as the victim.
3. It aborts that transaction.
4. Its locks are released.
5. Other waiting transactions can proceed.

### Important

PostgreSQL does not necessarily abort the transaction that started last.

The victim selection is based on internal criteria, not a guarantee that one particular transaction will always be selected.

The application must not depend on which transaction gets aborted.

---

## 15. How to Prevent Deadlocks

Deadlocks cannot always be eliminated, but good application design can reduce their frequency.

### 15.1 Access rows in a consistent order

This is one of the most effective techniques.

Bad pattern:

Transaction A:

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

Transaction B:

```sql
BEGIN;

UPDATE products
SET price = 2000
WHERE product_id = 102;

UPDATE products
SET price = 1500
WHERE product_id = 101;

COMMIT;
```

The transactions access rows in opposite orders.

Better: Make both transactions access rows in ascending product_id order.

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

Apply the same ordering in every code path that modifies these rows.

### 15.2 Keep transactions short

Avoid:

- Waiting for user input.
- Calling external APIs.
- Sending emails.
- Performing long computations.
- Holding locks while waiting for unrelated services.

### 15.3 Lock only required rows

Avoid unnecessarily broad locking.

Use appropriate WHERE conditions.

### 15.4 Use appropriate isolation levels

Do not select SERIALIZABLE without understanding its conflict and retry behavior.

### 15.5 Handle deadlock errors

Retry the complete transaction when appropriate.

SQLSTATE:

```text
40P01
```

### 15.6 Avoid unnecessary lock upgrades

Acquire the lock strength actually required for the operation.

---

## 16. Deadlock vs Lock Wait

These are different situations.

### Lock wait

One transaction is waiting for another transaction to release a lock.

Example:

- A holds a row lock.
- B requests a conflicting lock.
- B waits until A commits or rolls back.

This is not necessarily a deadlock.

### Deadlock

Two or more transactions form a circular waiting dependency.

Example:

- A waits for B.
- B waits for A.

### Comparison

| Lock wait                             | Deadlock                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| One transaction waits for another     | Transactions wait in a cycle                                        |
| May resolve when the blocker finishes | Cannot resolve without aborting a transaction or breaking the cycle |
| No deadlock error is necessary        | PostgreSQL detects and aborts a victim                              |
| Can happen during normal workloads    | Usually indicates conflicting lock acquisition patterns             |

---

## 17. Inspecting Locks in PostgreSQL

PostgreSQL exposes lock information through system views.

### View current locks

```sql
SELECT *
FROM pg_locks;
```

### View lock information with relation names

```sql
SELECT
    l.pid,
    a.usename,
    a.state,
    l.locktype,
    l.mode,
    l.granted,
    c.relname AS table_name
FROM pg_locks l
LEFT JOIN pg_stat_activity a
    ON a.pid = l.pid
LEFT JOIN pg_class c
    ON c.oid = l.relation
ORDER BY l.pid;
```

### Important columns

| Column          | Meaning                                   |
| --------------- | ----------------------------------------- |
| `pid`           | Backend process ID                        |
| `locktype`      | Type of lock                              |
| `mode`          | Lock mode                                 |
| `granted`       | Whether the lock has been granted         |
| `relation`      | Related object identifier when applicable |
| `transactionid` | Related transaction ID when applicable    |

A `granted = false` row indicates a lock request that is waiting.

---

## 18. Find Blocking Transactions

PostgreSQL provides `pg_blocking_pids()` to identify sessions blocking another backend.

```sql
SELECT
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query,
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN LATERAL unnest(
    pg_blocking_pids(blocked.pid)
) AS blocker_pid(pid)
    ON TRUE
JOIN pg_stat_activity blocking
    ON blocking.pid = blocker_pid.pid;
```

This helps identify:

- Which query is waiting.
- Which session is blocking it.
- What query the blocking session is executing.

### Check long-running transactions

```sql
SELECT
    pid,
    usename,
    state,
    xact_start,
    query_start,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start;
```

Look for transactions that have remained open for an unusually long time.

---

## 19. Terminating a Blocking Session

Sometimes an operational administrator needs to stop a problematic session.

PostgreSQL provides:

```sql
SELECT pg_cancel_backend(12345);
```

This requests cancellation of the current query.

To terminate a session:

```sql
SELECT pg_terminate_backend(12345);
```

This terminates the backend session and causes its active transaction to roll back.

### Important

Do not terminate sessions blindly.

Before doing so:

- Identify the session owner.
- Inspect the running query.
- Check whether it is performing critical work.
- Understand the effect of rolling back its transaction.
- Follow production incident procedures.

---

## 20. Advisory Locks

PostgreSQL supports application-defined locks called advisory locks.

Unlike ordinary row locks, advisory locks are not automatically associated with a particular table row.

The application decides what resource a lock represents.

### Transaction-level advisory lock

```sql
BEGIN;

SELECT pg_advisory_xact_lock(12345);

-- Perform protected application operation.

COMMIT;
```

The lock is released automatically when the transaction ends.

### Session-level advisory lock

```sql
SELECT pg_advisory_lock(12345);
```

Release it with:

```sql
SELECT pg_advisory_unlock(12345);
```

### Example use cases

- Preventing duplicate scheduled jobs.
- Ensuring only one worker performs a specific operation.
- Coordinating application workflows.
- Preventing concurrent generation of the same report.

### Important

Advisory locks are cooperative.

PostgreSQL does not automatically force ordinary SQL statements to respect them. Application code must consistently acquire the same advisory lock when coordination is required.

---

## 21. Locks in Node.js and Express

Suppose two API requests attempt to reserve the same product inventory.

Assume `stock_quantity` is a proposed extension to the TechBazaar products schema.

### Example using SELECT FOR UPDATE

```javascript
async function reserveInventory(pool, productId, quantity) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT stock_quantity
       FROM products
       WHERE product_id = $1
       FOR UPDATE`,
      [productId],
    );

    if (result.rowCount === 0) {
      throw new Error("Product not found");
    }

    const stock = result.rows[0].stock_quantity;

    if (stock < quantity) {
      throw new Error("Insufficient inventory");
    }

    await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity - $1
       WHERE product_id = $2`,
      [quantity, productId],
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

### What happens with concurrent requests?

1. Request A locks the product row.
2. Request B tries to lock the same row and waits.
3. Request A checks stock and updates it.
4. Request A commits.
5. Request B acquires the lock and reads the updated stock.
6. Request B proceeds only if sufficient inventory remains.

### Alternative: Atomic conditional UPDATE

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

For a simple inventory decrement, this is often more concise and avoids a separate SELECT FOR UPDATE.

Both approaches must be part of the same transaction as the related order operations.

---

## 22. Important PostgreSQL Locking Concepts

| Concept            | Meaning                                                    |
| ------------------ | ---------------------------------------------------------- |
| MVCC               | Maintains multiple row versions for concurrent access      |
| Row-level lock     | Coordinates conflicting operations on individual rows      |
| Table-level lock   | Coordinates operations on table objects                    |
| FOR UPDATE         | Obtains a strong row-level lock                            |
| NOWAIT             | Fails immediately if a conflicting lock cannot be acquired |
| SKIP LOCKED        | Skips rows that cannot be locked immediately               |
| Deadlock           | Circular waiting dependency between transactions           |
| Advisory lock      | Application-defined coordination lock                      |
| pg_locks           | View of current lock information                           |
| pg_blocking_pids() | Identifies sessions blocking another backend               |

---

## 23. Common Mistakes

| Mistake                                                           | Correct approach                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Assuming ordinary SELECT blocks UPDATE                            | MVCC allows ordinary reads to access committed row versions |
| Holding locks while calling external APIs                         | Keep transactions short                                     |
| Updating multiple rows in inconsistent orders                     | Use a consistent lock acquisition order                     |
| Assuming every lock wait is a deadlock                            | A lock wait may resolve normally                            |
| Using SKIP LOCKED for ordinary reporting                          | It intentionally skips locked rows                          |
| Using advisory locks without consistent application participation | Advisory locks are cooperative                              |
| Terminating database sessions without investigation               | Inspect blocking relationships first                        |
| Retrying only one statement after a deadlock                      | Retry the complete transaction                              |
| Assuming row locks lock the whole table                           | Row locks protect selected rows                             |
| Using SELECT FOR UPDATE for every read                            | Acquire locks only when the workflow requires them          |

---

## 24. Practice Exercises

Use the TechBazaar database.

1. Start a transaction and acquire a row lock using SELECT FOR UPDATE.
2. Open a second PostgreSQL session and try to update the same row.
3. Observe how the second session waits.
4. Commit the first transaction and observe the second session proceed.
5. Repeat using ROLLBACK.
6. Test SELECT FOR UPDATE NOWAIT.
7. Test SELECT FOR UPDATE SKIP LOCKED.
8. Create two transactions that update two products in opposite orders.
9. Observe PostgreSQL's deadlock detection.
10. Identify SQLSTATE `40P01`.
11. Repeat the update scenario using a consistent row order.
12. Inspect locks using pg_locks.
13. Find blocking sessions using pg_blocking_pids().
14. Inspect long-running transactions using pg_stat_activity.
15. Experiment with transaction-level advisory locks.
16. Implement inventory reservation using row locking in Node.js.
17. Implement the same operation using an atomic conditional UPDATE.
18. Compare both approaches under concurrent requests.

---

## 25. Interview Questions

**Q1. What is a database lock?**

A mechanism that coordinates concurrent access to database resources.

**Q2. What is the difference between table-level and row-level locks?**

Table-level locks coordinate access to an entire table; row-level locks coordinate conflicting operations on individual rows.

**Q3. Does an ordinary SELECT block an UPDATE in PostgreSQL?**

Generally, no. MVCC allows ordinary readers and writers to operate concurrently.

**Q4. What does SELECT FOR UPDATE do?**

It locks selected rows against conflicting updates and row-locking operations until the transaction ends.

**Q5. What is the difference between FOR UPDATE and FOR SHARE?**

FOR UPDATE obtains a stronger row lock, while FOR SHARE allows compatible shared row locks but prevents conflicting modifications.

**Q6. What is NOWAIT?**

It makes a locking query fail immediately if a conflicting lock cannot be acquired.

**Q7. What is SKIP LOCKED?**

It skips rows that cannot be locked immediately instead of waiting for them.

**Q8. What is a deadlock?**

A circular waiting dependency where transactions are waiting for locks held by one another.

**Q9. How does PostgreSQL handle deadlocks?**

It detects the cycle and aborts one transaction so the others can proceed.

**Q10. What is SQLSTATE 40P01?**

The PostgreSQL error code for a deadlock detected.

**Q11. How can deadlocks be prevented?**

Use consistent lock acquisition order, short transactions, appropriate lock scope and proper error handling.

**Q12. What is an advisory lock?**

An application-defined lock used to coordinate operations that are not necessarily tied to a particular row.

**Q13. What does pg_blocking_pids() do?**

It returns the process IDs of sessions blocking a specified backend.

**Q14. What is the difference between pg_cancel_backend() and pg_terminate_backend()?**

The first cancels the current query; the second terminates the backend session.

**Q15. Why should transactions be short?**

Long transactions can hold locks longer, increase contention and delay cleanup of obsolete row versions.

**Q16. How would you prevent two users from purchasing the last available product simultaneously?**

Use an atomic conditional inventory UPDATE or lock the product row with SELECT FOR UPDATE, then perform the related order operations in one transaction.

---

## Key Takeaways

- PostgreSQL uses table-level and row-level locks to coordinate concurrent operations.
- MVCC allows ordinary readers and writers to operate concurrently.
- `SELECT FOR UPDATE` locks selected rows against conflicting modifications.
- `NOWAIT` fails immediately instead of waiting.
- `SKIP LOCKED` skips rows that are already locked.
- A deadlock occurs when transactions form a circular lock dependency.
- PostgreSQL detects deadlocks and aborts one transaction.
- SQLSTATE `40P01` identifies deadlock errors.
- Consistent row access order helps prevent deadlocks.
- `pg_locks`, `pg_stat_activity` and `pg_blocking_pids()` help investigate locking problems.
- Advisory locks provide application-defined coordination.
- Keep transactions short and retry failed transactions safely.
