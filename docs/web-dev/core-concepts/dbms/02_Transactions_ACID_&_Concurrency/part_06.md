---
sidebar_label: Database Deadlocks
sidebar_position: 1
---

# Database Deadlocks

## 1. What Is a Deadlock?

A **deadlock** occurs when two or more transactions are waiting for each other to release locks, creating a circular dependency.

As a result, none of the involved transactions can proceed without intervention.

Consider two bank accounts:

```text
Account A
Account B
```

Two transactions want to update both accounts.

- Transaction A locks Account A and then requests Account B.
- Transaction B locks Account B and then requests Account A.

Now both transactions are waiting for each other.

Neither can continue.

This situation is called a **deadlock**.

### Simple visualization

```text
Transaction A                  Transaction B
-------------                  -------------
Locks Account A                Locks Account B
       |                              |
       v                              v
Requests Account B             Requests Account A
       |                              |
       v                              v
     WAIT                           WAIT
       |                              |
       +---------- DEADLOCK ----------+
```

The database cannot allow both transactions to wait forever.

It must detect the deadlock and resolve it.

---

## 2. Why Do Deadlocks Occur?

Deadlocks generally occur when multiple transactions acquire locks on resources in different orders.

Consider two database records:

```text
Account 1
Account 2
```

Transaction A:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 100
WHERE account_id = 2;

COMMIT;
```

Transaction B:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 200
WHERE account_id = 2;

UPDATE accounts
SET balance = balance + 200
WHERE account_id = 1;

COMMIT;
```

Suppose both transactions execute concurrently.

### Execution sequence

**Step 1:** Transaction A updates Account 1.

It obtains a lock on Account 1.

**Step 2:** Transaction B updates Account 2.

It obtains a lock on Account 2.

**Step 3:** Transaction A attempts to update Account 2.

But Transaction B already holds a conflicting lock.

Transaction A must wait.

**Step 4:** Transaction B attempts to update Account 1.

But Transaction A already holds a conflicting lock.

Transaction B must wait.

Final state:

```text
Transaction A:
Holds Account 1 lock
Waiting for Account 2 lock

Transaction B:
Holds Account 2 lock
Waiting for Account 1 lock
```

Neither transaction can proceed.

<badge color="danger">Deadlock</badge>

---

## 3. Four Necessary Conditions for Deadlock

In operating systems and database theory, four conditions are commonly associated with deadlocks.

All four must hold simultaneously for a deadlock to be possible.

### 3.1 Mutual Exclusion

A resource can be held by one transaction in a way that prevents another transaction from acquiring a conflicting lock.

Example:

```text
Transaction A holds an exclusive lock on Account 1.
Transaction B cannot acquire a conflicting exclusive lock.
```

### 3.2 Hold and Wait

A transaction holds one resource while waiting for another resource.

Example:

```text
Transaction A:
Holds Account 1
Waiting for Account 2
```

### 3.3 No Preemption

A resource cannot simply be taken away from a transaction at an arbitrary point.

The transaction normally releases its locks through commit or rollback, or the database aborts the transaction to resolve the conflict.

### 3.4 Circular Wait

A circular chain of transactions exists, where each transaction waits for a resource held by another transaction in the chain.

Example:

```text
Transaction A waits for B
Transaction B waits for C
Transaction C waits for A
```

### Summary

| Condition        | Meaning                                             |
| ---------------- | --------------------------------------------------- |
| Mutual Exclusion | Conflicting resource access cannot be shared        |
| Hold and Wait    | Transaction holds one lock while requesting another |
| No Preemption    | Locks are not arbitrarily taken away                |
| Circular Wait    | Transactions form a circular waiting dependency     |

**Important:** These are the classic necessary conditions. Breaking any one of them prevents this form of deadlock.

---

## 4. How Does a Database Detect Deadlocks?

Databases generally use a mechanism called a **Wait-For Graph** to detect deadlocks.

### 4.1 What Is a Wait-For Graph?

A wait-for graph represents dependencies between transactions.

- Each node represents a transaction.
- An edge from A to B means Transaction A is waiting for a lock held by Transaction B.
- A cycle indicates a deadlock.

### 4.2 Example

Suppose:

```text
Transaction A holds Account 1.
Transaction B holds Account 2.
```

Transaction A requests Account 2.

Transaction B requests Account 1.

The graph becomes:

```text
A ───────> B
^          |
|          |
└──────────┘
```

Meaning:

```text
A waits for B
B waits for A
```

There is a cycle.

Therefore, the database identifies a deadlock.

### 4.3 Three-Transaction Example

```text
Transaction A waits for B
Transaction B waits for C
Transaction C waits for A
```

Wait-for graph:

```text
A ─────> B
^        |
|        v
C <──────┘
```

The cycle indicates a deadlock.

### 4.4 What Happens After Detection?

The database selects one transaction as a victim.

It aborts or rolls back that transaction to release its locks.

The other transaction can then continue.

---

## 5. How Does PostgreSQL Handle Deadlocks?

PostgreSQL automatically detects deadlocks.

It does not wait forever for a circular lock dependency to resolve itself.

### 5.1 Deadlock Detection

PostgreSQL uses a deadlock detector that examines lock-wait dependencies.

The default `deadlock_timeout` is generally one second.

This means PostgreSQL normally waits for a lock request to remain blocked for approximately that period before checking whether a deadlock exists.

It does not mean every lock wait is automatically treated as a deadlock after one second.

You can inspect the setting:

```sql
SHOW deadlock_timeout;
```

Example output:

```text
deadlock_timeout
----------------
1s
```

You can configure it:

```sql
SET deadlock_timeout = '500ms';
```

This changes when PostgreSQL performs deadlock checks. It does not change the fundamental locking rules.

### 5.2 PostgreSQL Deadlock Error

When PostgreSQL detects a deadlock, it aborts one of the involved transactions.

A typical error looks like:

```text
ERROR: deadlock detected
SQL state: 40P01
DETAIL: Process 123 waits for ShareLock on transaction 456;
blocked by process 789.
Process 789 waits for ShareLock on transaction 123;
blocked by process 123.
HINT: See server log for query details.
```

The exact process IDs and lock details vary.

Important SQLSTATE:

```text
40P01
```

This identifies a deadlock detected by PostgreSQL.

### 5.3 Which Transaction Is Aborted?

PostgreSQL chooses a transaction to abort to break the deadlock.

Do not assume it always aborts the transaction that started last or the one that performed the most operations.

The application should handle the error rather than depend on which transaction becomes the victim.

### 5.4 What Happens to the Aborted Transaction?

The transaction is rolled back.

Its locks are released, allowing other waiting transactions to continue when possible.

The application must decide whether to retry the operation.

---

## 6. How Does MySQL/InnoDB Handle Deadlocks?

MySQL's InnoDB storage engine also detects deadlocks automatically.

When it detects a deadlock, InnoDB selects a transaction to roll back.

It generally attempts to choose a transaction that is less expensive to roll back, taking factors such as transaction size into account.

You may see an error similar to:

```text
ERROR 1213 (40001):
Deadlock found when trying to get lock;
try restarting transaction
```

Important error information:

| Database     | Deadlock Error                 |
| ------------ | ------------------------------ |
| PostgreSQL   | SQLSTATE `40P01`               |
| MySQL/InnoDB | Error `1213`, SQLSTATE `40001` |

### Inspecting InnoDB Deadlocks

You can inspect the latest detected deadlock:

```sql
SHOW ENGINE INNODB STATUS;
```

Look for the section:

```text
LATEST DETECTED DEADLOCK
```

It contains details about the transactions, locks, and statements involved.

InnoDB also supports deadlock-related monitoring through its information schema and Performance Schema instrumentation.

---

## 7. Deadlock vs Lock Timeout

These two concepts are related but not identical.

### 7.1 Deadlock

A deadlock occurs when transactions form a circular waiting dependency.

Example:

```text
A waits for B
B waits for A
```

The database detects the cycle and aborts a transaction.

### 7.2 Lock Timeout

A lock timeout occurs when a transaction waits longer than the configured allowed duration for a lock.

Example:

```text
Transaction A holds Account 1.

Transaction B requests Account 1.

Transaction B waits.

The configured timeout expires.
```

There may be no circular dependency.

Transaction A might simply be taking too long to finish.

### Comparison

| Feature                       | Deadlock                             | Lock Timeout                                                  |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| Cause                         | Circular waiting dependency          | Lock wait exceeds configured duration                         |
| Requires circular dependency  | Yes                                  | No                                                            |
| Detection                     | Deadlock detection mechanism         | Timeout mechanism                                             |
| Resolution                    | Database aborts a victim transaction | Waiting operation or transaction fails, depending on database |
| Can occur without a deadlock? | No                                   | Yes                                                           |

### PostgreSQL Lock Timeout

Inspect the setting:

```sql
SHOW lock_timeout;
```

Set it for the current session:

```sql
SET lock_timeout = '5s';
```

This means a lock request that waits longer than five seconds will fail.

**Remember:** `deadlock_timeout` and `lock_timeout` serve different purposes.

- `deadlock_timeout`: when PostgreSQL should check for a deadlock.
- `lock_timeout`: how long a lock request may wait before timing out.

---

## 8. How to Prevent Deadlocks

Deadlocks can often be reduced through better transaction design.

There is no guarantee that every possible deadlock can be eliminated from a complex concurrent application.

### 8.1 Acquire Locks in a Consistent Order

This is one of the most effective prevention strategies.

Problematic implementation:

Transaction A:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 100
WHERE account_id = 2;

COMMIT;
```

Transaction B:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 200
WHERE account_id = 2;

UPDATE accounts
SET balance = balance + 200
WHERE account_id = 1;

COMMIT;
```

The transactions acquire locks in opposite orders.

Better approach:

Always acquire locks in ascending account ID order.

```sql
BEGIN;

SELECT *
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id
FOR UPDATE;

-- Perform the required updates.

COMMIT;
```

Both transactions now attempt to acquire locks in the same order.

This prevents the particular circular-wait pattern caused by opposite acquisition order.

**Important:** Consistent ordering reduces deadlocks but does not eliminate every possible deadlock involving other tables, constraints, or resources.

### 8.2 Keep Transactions Short

Avoid unnecessary work inside a transaction.

Bad:

```text
BEGIN

Lock account

Call external API

Wait for response

Perform calculation

Wait for user input

Update account

COMMIT
```

Better:

```text
Perform independent preparation

BEGIN

Lock required records

Perform database operations

COMMIT

Perform appropriate external follow-up
```

Keep the critical database transaction short.

### 8.3 Avoid Unnecessary Locks

Do not use `FOR UPDATE` on every SELECT.

Example:

Unnecessary locking:

```sql
SELECT *
FROM products
WHERE product_id = 10
FOR UPDATE;
```

If the operation only needs to display product details, a normal SELECT may be sufficient.

Use explicit locking when the operation requires protection against concurrent changes.

### 8.4 Update Records in a Consistent Sequence

If multiple transactions modify:

- Users
- Accounts
- Orders
- Inventory

Establish a consistent lock acquisition sequence across application workflows.

For example:

```text
1. User
2. Account
3. Order
4. Inventory
```

Apply this order consistently where those resources are acquired.

### 8.5 Use Appropriate Indexes

Indexes can help databases locate rows efficiently.

Without suitable indexes, some operations may examine or lock more data than expected.

For example:

```sql
UPDATE orders
SET status = 'processed'
WHERE customer_id = 100;
```

An appropriate index on `customer_id` can improve row lookup efficiency.

However, an index does not automatically eliminate deadlocks. Locking behavior depends on the database, query plan, constraints, and isolation level.

### 8.6 Avoid Unnecessary User Interaction Inside Transactions

Never keep a transaction open while waiting for a user to confirm an operation.

Bad:

```text
BEGIN

Lock seat

Wait for user confirmation

User takes 2 minutes

COMMIT
```

Better:

- Create a temporary reservation with an expiration time.
- Commit the reservation quickly.
- Let the user confirm through a separate request.
- Expire or release the reservation if confirmation does not arrive.

This is particularly useful for ticket booking and inventory reservation systems.

---

## 9. Deadlock Handling in Node.js and PostgreSQL

Preventing every deadlock is unrealistic.

Production applications should also know how to handle deadlock errors.

### 9.1 Basic Error Handling

Using the `pg` package:

```javascript
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE accounts
       SET balance = balance - $1
       WHERE account_id = $2`,
      [amount, fromId],
    );

    await client.query(
      `UPDATE accounts
       SET balance = balance + $1
       WHERE account_id = $2`,
      [amount, toId],
    );

    await client.query("COMMIT");

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "40P01") {
      console.error("Deadlock detected");
    }

    throw error;
  } finally {
    client.release();
  }
}
```

The deadlock error is identified using:

```javascript
error.code === "40P01";
```

### 9.2 Retrying Deadlocked Transactions

A common production strategy is to retry the entire transaction.

Example:

```javascript
async function retryOnDeadlock(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isDeadlock = error.code === "40P01";

      if (!isDeadlock || attempt === maxRetries) {
        throw error;
      }

      const delay = 100 * Math.pow(2, attempt - 1);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

Usage:

```javascript
const result = await retryOnDeadlock(() => transferMoney(1, 2, 1000));
```

This is a simplified retry wrapper.

A production implementation should also:

- Acquire a fresh database connection for each retry.
- Retry the entire transaction, not an individual failed statement.
- Use bounded retries with backoff and jitter.
- Handle rollback and connection cleanup errors.
- Ensure external side effects are not duplicated.

### 9.3 Why Retry the Entire Transaction?

Suppose a transaction performs:

```text
1. Read account balance
2. Check available balance
3. Deduct money
4. Update transaction history
```

If the database aborts the transaction due to a deadlock, its previous operations are rolled back.

Retrying only the failed UPDATE would be unsafe because the original decision may no longer be valid.

The entire logical transaction must execute again using fresh database state.

---

## 10. Practical Example: E-Commerce Inventory Deadlock

Imagine an e-commerce system with two products:

```text
Product A
Product B
```

Two orders are being processed.

Order 1 requires:

```text
Product A → Product B
```

Order 2 requires:

```text
Product B → Product A
```

Each transaction reserves inventory.

### Problematic execution

```text
Order 1                         Order 2
-------                         -------
Lock Product A                  Lock Product B
                                  |
Request Product B               Request Product A
WAIT                            WAIT
```

Deadlock occurs.

### Better approach

Both transactions lock products in the same order:

```text
Product A → Product B
```

Execution:

```text
Order 1                         Order 2
-------                         -------
Lock Product A                  WAIT
Lock Product B                  WAIT
Update inventory                WAIT
Commit                          WAIT
                                Lock Product A
                                Lock Product B
                                Update inventory
                                Commit
```

The second transaction waits, but there is no circular dependency.

This is an important distinction:

**Waiting is not necessarily a deadlock.**

A transaction can wait for another transaction without forming a cycle.

---

## 11. How to Debug Deadlocks in Production

When a deadlock occurs, do not immediately increase timeouts or change isolation levels.

First identify the actual cause.

### 11.1 PostgreSQL: Inspect Deadlock Logs

Useful PostgreSQL settings include:

```sql
SHOW log_lock_waits;
SHOW deadlock_timeout;
SHOW log_min_error_statement;
```

You can enable lock-wait logging:

```sql
ALTER SYSTEM SET log_lock_waits = 'on';
```

Then reload the configuration:

```sql
SELECT pg_reload_conf();
```

For more detailed lock-wait diagnostics, inspect the PostgreSQL server logs.

### 11.2 Inspect Active Queries

```sql
SELECT
    pid,
    usename,
    state,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity
WHERE state = 'active';
```

This helps identify active sessions and their wait events.

### 11.3 Inspect Blocking Relationships

PostgreSQL provides `pg_blocking_pids()`.

```sql
SELECT
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query,
    blocker.pid AS blocker_pid,
    blocker.query AS blocker_query
FROM pg_stat_activity AS blocked
JOIN LATERAL unnest(
    pg_blocking_pids(blocked.pid)
) AS blocking_pid(pid) ON TRUE
JOIN pg_stat_activity AS blocker
    ON blocker.pid = blocking_pid.pid;
```

This identifies sessions blocked by other sessions.

Note that this shows current blocking relationships. A deadlock may already have been resolved by the time you run the query.

### 11.4 Inspect Locks

```sql
SELECT
    locktype,
    relation::regclass AS table_name,
    mode,
    granted,
    pid
FROM pg_locks;
```

This helps inspect locks held and requested by database sessions.

### 11.5 Debugging Checklist

When investigating a deadlock:

1. Identify the SQLSTATE or database error code.
2. Find the involved SQL statements.
3. Identify which resources each transaction locked.
4. Reconstruct the lock acquisition order.
5. Find the circular dependency.
6. Check whether the transactions touch multiple tables or indexes.
7. Review application transaction boundaries.
8. Fix the ordering or transaction design.
9. Add bounded retry handling.
10. Monitor whether the deadlock frequency decreases.

---

## 12. Deadlocks vs Other Concurrency Problems

Do not confuse deadlocks with the anomalies discussed in Part 2C.

| Concept             | Meaning                                                   |
| ------------------- | --------------------------------------------------------- |
| Dirty Read          | Reading uncommitted data                                  |
| Non-Repeatable Read | Reading the same row and seeing different values          |
| Phantom Read        | Repeating a query and seeing a different matching row set |
| Lost Update         | One update overwrites another                             |
| Write Skew          | Concurrent decisions violate a shared business invariant  |
| Deadlock            | Transactions wait on each other in a circular dependency  |
| Lock Timeout        | A lock request waits longer than the configured timeout   |

A deadlock is primarily a **concurrency coordination problem**, not an incorrect data-read anomaly.

---

## 13. Common Misconceptions

### Misconception 1: Every transaction waiting for a lock is in a deadlock.

Incorrect.

A transaction can wait for another transaction without a circular dependency.

Deadlock requires a cycle.

### Misconception 2: Increasing the lock timeout solves deadlocks.

Incorrect.

A deadlock is a circular dependency. Increasing the timeout does not remove that dependency.

The database needs to detect and break the cycle.

### Misconception 3: Databases do not automatically handle deadlocks.

Incorrect.

PostgreSQL and MySQL/InnoDB have automatic deadlock detection and resolution mechanisms.

Applications still need appropriate error handling.

### Misconception 4: Using indexes completely prevents deadlocks.

Incorrect.

Indexes can improve lookup efficiency and sometimes reduce the amount of locking required, but deadlocks can still occur.

### Misconception 5: Deadlocks only happen when updating the same row.

Incorrect.

Transactions can deadlock while updating different rows if they acquire locks in conflicting orders.

### Misconception 6: Retrying only the failed SQL statement is sufficient.

Incorrect.

The database may have aborted the entire transaction. Retry the entire logical transaction.

### Misconception 7: Deadlocks always indicate a database bug.

Incorrect.

Deadlocks can be a normal consequence of concurrent transactions acquiring resources in different orders.

The application and database design should minimize them and handle them safely.

---

## 14. Interview Questions and Answers

### Q1. What is a database deadlock?

A deadlock occurs when two or more transactions wait for one another's locks in a circular dependency, preventing all involved transactions from progressing.

### Q2. What are the four necessary conditions for deadlock?

1. Mutual Exclusion
2. Hold and Wait
3. No Preemption
4. Circular Wait

### Q3. How does a database detect deadlocks?

A database can use a wait-for graph. If a cycle exists in the graph, it indicates a deadlock.

### Q4. How does PostgreSQL resolve deadlocks?

PostgreSQL detects the cycle and aborts one transaction, releasing its locks so other transactions can continue.

### Q5. What is the PostgreSQL deadlock error code?

```text
40P01
```

### Q6. What is the MySQL/InnoDB deadlock error code?

```text
1213
```

SQLSTATE:

```text
40001
```

### Q7. What is the difference between a deadlock and a lock timeout?

A deadlock requires a circular waiting dependency. A lock timeout occurs when a transaction waits longer than the configured limit, even without a cycle.

### Q8. How can you prevent deadlocks?

- Acquire locks in a consistent order.
- Keep transactions short.
- Avoid unnecessary locks.
- Use appropriate indexes.
- Avoid waiting for external APIs inside transactions.
- Apply consistent transaction design.

### Q9. What is the most effective general strategy for reducing deadlocks?

Consistent lock acquisition order across transactions is one of the most effective strategies.

### Q10. Should applications retry deadlock errors?

Yes, when the operation is safe to retry. Retry the entire transaction with bounded retries and backoff.

### Q11. Does SELECT FOR UPDATE cause deadlocks?

It can contribute to deadlocks if multiple transactions acquire locks in conflicting orders.

### Q12. Is a deadlock the same as a lost update?

No.

A lost update is a data consistency anomaly. A deadlock is a circular lock-wait condition.

---

## 15. Chapter Summary

### Deadlock Lifecycle

```text
Transaction A                  Transaction B
-------------                  -------------
Locks Resource 1               Locks Resource 2
Requests Resource 2            Requests Resource 1
       |                              |
       v                              v
     WAIT                           WAIT
       |                              |
       +-------- DEADLOCK ------------+
                     |
                     v
              Database detects
                 deadlock
                     |
                     v
              Selects a victim
                     |
                     v
              Rolls back victim
                     |
                     v
              Releases locks
                     |
                     v
             Other transaction
                 continues
```

### Key Points to Remember

1. A deadlock is a circular waiting dependency between transactions.
2. Four necessary conditions are mutual exclusion, hold and wait, no preemption, and circular wait.
3. Databases can detect deadlocks using wait-for graphs.
4. PostgreSQL uses SQLSTATE `40P01` for deadlock detection.
5. MySQL/InnoDB reports error `1213`.
6. A deadlock is different from a lock timeout.
7. Consistent lock ordering is a key prevention strategy.
8. Keep transactions short and avoid unnecessary locks.
9. Retry the entire transaction when a deadlock occurs and retrying is safe.
10. Waiting does not automatically mean a deadlock.
