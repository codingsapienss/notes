---
sidebar_label: How Databases Implement Isolation
sidebar_position: 1
---

# How Databases Implement Isolation

## 1. Introduction

In last section, we studied the four standard SQL isolation levels:

1. Read Uncommitted
2. Read Committed
3. Repeatable Read
4. Serializable

But an important question remains:

**How does a database actually implement these isolation guarantees?**

When multiple transactions execute simultaneously, the database must coordinate their reads and writes without unnecessarily blocking every operation.

For this, databases primarily use two approaches:

1. **Lock-based concurrency control**
2. **MVCC (Multi-Version Concurrency Control)**

Some databases use a combination of both.

For example:

- PostgreSQL uses MVCC for ordinary reads and writes, with locks for coordinating conflicting operations.
- MySQL/InnoDB uses MVCC alongside row-level and other locks.

Understanding these mechanisms helps explain why different isolation levels behave differently.

---

## 2. Lock-Based Concurrency Control

### 2.1 What is a database lock?

A lock is a mechanism used by a database to control concurrent access to data.

Before performing certain operations, a transaction may acquire a lock on a database resource.

The lock determines whether another transaction can read or modify that resource at the same time.

Consider an account:

```text
account_id = 1
balance = 10000
```

Transaction A wants to update the balance.

The database can acquire a lock to prevent another conflicting transaction from modifying the same record simultaneously.

### 2.2 Why do databases need locks?

Imagine two transactions updating the same account.

```text
Initial balance = 10000

Transaction A                  Transaction B
-------------                  -------------
Read balance = 10000           Read balance = 10000
Add 1000                       Subtract 2000
Write 11000                    Write 8000
```

If both transactions proceed without appropriate coordination, one update can overwrite the other.

The final balance might incorrectly become ₹11,000 or ₹8,000 instead of ₹9,000.

Locks help coordinate conflicting operations.

### 2.3 Basic lock lifecycle

A simplified transaction lifecycle:

```text
Transaction starts
       |
       v
Request a lock
       |
       v
Database grants lock
       |
       v
Perform operation
       |
       v
Commit or Rollback
       |
       v
Release lock
```

Locks are generally held until a defined point in the transaction, often until commit or rollback. Exact behavior depends on the lock type and database.

---

## 3. Types of Database Locks

There are several types of locks. Two fundamental categories are:

1. Shared Lock (S Lock)
2. Exclusive Lock (X Lock)

### 3.1 Shared Lock (S Lock)

A shared lock is generally used when a transaction needs to read data under a locking-read mechanism.

Multiple transactions can hold shared locks on the same resource simultaneously.

However, an exclusive lock generally cannot be granted while conflicting shared locks are held.

Example:

```text
Transaction A                  Transaction B
-------------                  -------------
Acquire S Lock                 Acquire S Lock
Read account balance           Read account balance
Read data                      Read data
Release S Lock                 Release S Lock
```

Both transactions can read the same resource concurrently.

### 3.2 Exclusive Lock (X Lock)

An exclusive lock is generally used when a transaction needs to modify data.

Only one conflicting exclusive lock can be held on a resource at a time.

Other transactions requesting conflicting locks must wait.

Example:

```text
Transaction A                  Transaction B
-------------                  -------------
Acquire X Lock                 Request X Lock
Update balance                 WAIT
Commit                         WAIT
Release X Lock                 Acquire X Lock
                               Update balance
                               Commit
```

Transaction B waits until Transaction A releases the conflicting lock.

### 3.3 Shared vs Exclusive Lock

| Feature                     | Shared Lock                         | Exclusive Lock                                    |
| --------------------------- | ----------------------------------- | ------------------------------------------------- |
| Purpose                     | Read under locking                  | Modify data                                       |
| Multiple transactions       | Compatible shared locks allowed     | Conflicting exclusive locks not allowed           |
| Another transaction reading | May be allowed with compatible lock | Usually blocked if it requests a conflicting lock |
| Another transaction writing | Conflicting write lock blocked      | Conflicting write lock blocked                    |
| Typical notation            | S                                   | X                                                 |

**Important:** An ordinary `SELECT` does not necessarily acquire a shared row lock in MVCC databases. A locking read, such as `SELECT ... FOR SHARE`, explicitly requests locking behavior.

---

## 4. Other Important Lock Types

Databases have additional lock types and lock granularities.

### 4.1 Row-Level Locks

A row-level lock protects an individual row or record from conflicting operations.

Example:

```sql
BEGIN;

SELECT *
FROM accounts
WHERE account_id = 1
FOR UPDATE;

UPDATE accounts
SET balance = balance - 500
WHERE account_id = 1;

COMMIT;
```

`FOR UPDATE` requests a row-level lock on the selected row.

Another transaction attempting a conflicting update or locking operation on that row may have to wait.

The benefit is that transactions updating different rows can often proceed concurrently.

Example:

```text
Transaction A                  Transaction B
-------------                  -------------
Lock account 1                 Lock account 2
Update account 1               Update account 2
Commit                         Commit
```

These operations can proceed concurrently because they target different rows.

### 4.2 Table-Level Locks

A table-level lock protects a table rather than an individual row.

Example:

```sql
LOCK TABLE accounts IN EXCLUSIVE MODE;
```

The exact lock mode determines which other operations are allowed.

Table-level locks are useful for operations that need broader protection, but they can reduce concurrency.

### 4.3 Page-Level Locks

A page is a unit of storage containing multiple database records.

Some database systems use page-level locking.

A page-level lock can affect multiple rows stored on the same page, even when the transactions are interested in different rows.

This can reduce concurrency compared with row-level locking.

### 4.4 Intent Locks

Intent locks communicate that a transaction intends to acquire more specific locks within a larger resource.

For example, a database may acquire an intent lock on a table before acquiring row-level locks within that table.

This helps the database coordinate table-level and row-level locking.

MySQL/InnoDB uses intention locks.

### 4.5 Lock Granularity Comparison

| Lock Granularity | Protected Resource | Typical Tradeoff                                  |
| ---------------- | ------------------ | ------------------------------------------------- |
| Row-level        | Individual row     | Higher concurrency, more lock-management overhead |
| Page-level       | Storage page       | May affect multiple rows                          |
| Table-level      | Entire table       | Broader protection, lower concurrency             |
| Database-level   | Entire database    | Very broad protection, usually restrictive        |

Not every database supports all these granularities in the same way.

---

## 5. Pessimistic Concurrency Control

### 5.1 Definition

Pessimistic concurrency control assumes that conflicts are possible and uses locks to prevent conflicting operations from proceeding simultaneously.

In simple terms:

> Lock the data before modifying it so that conflicting transactions must wait.

### 5.2 Example: Bank Transfer

Suppose we need to transfer ₹1,000 from Account A to Account B.

Initial balances:

```text
Account A = 10000
Account B = 5000
```

Transaction:

```sql
BEGIN;

SELECT *
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id
FOR UPDATE;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 2;

COMMIT;
```

The `FOR UPDATE` statement requests locks on the selected rows.

Another transaction trying to perform a conflicting operation on these rows may need to wait.

### 5.3 Why use ORDER BY?

Suppose two transactions transfer money in opposite directions:

```text
Transaction A:
Lock Account 1
Lock Account 2

Transaction B:
Lock Account 2
Lock Account 1
```

This can create a deadlock.

Acquiring locks in a consistent order reduces the chance of this particular deadlock pattern.

It does not eliminate all possible deadlocks.

### 5.4 Advantages

- Prevents conflicting modifications while locks are held.
- Useful for operations requiring explicit coordination.
- Can be effective when contention is high.
- Allows precise control over which records are locked.

### 5.5 Disadvantages

- Transactions may block while waiting for locks.
- Long-running transactions can hold locks for too long.
- Deadlocks can occur.
- High contention can reduce throughput.

---

## 6. MVCC — Multi-Version Concurrency Control

MVCC is one of the most important database concepts.

### 6.1 What is MVCC?

MVCC stands for:

**Multi-Version Concurrency Control.**

Instead of forcing every reader to wait for writers, an MVCC database can maintain multiple versions of a row.

A transaction reads the version that is visible to its snapshot.

This allows readers and writers to operate concurrently in many situations.

The central idea:

> Readers can access an appropriate committed version of data without necessarily blocking a concurrent writer.

### 6.2 Why was MVCC introduced?

Consider a traditional lock-based approach.

Transaction A wants to read an account balance.

Transaction B wants to update the same account.

Without MVCC, a locking strategy might require one transaction to wait for the other, depending on the locks acquired.

This can reduce performance when many users access the same data.

MVCC helps by allowing a reader to access an older visible version while a writer creates a newer version.

### 6.3 Simple Example

Suppose the database contains:

```text
Account ID: 1
Balance: 10000
```

Transaction A starts and reads the account.

```text
Transaction A:
Read balance = 10000
```

At the same time, Transaction B updates the balance:

```sql
UPDATE accounts
SET balance = 12000
WHERE account_id = 1;
```

Conceptually, the database now has two versions:

```text
Version 1:
Balance = 10000

Version 2:
Balance = 12000
```

Transaction A may continue reading the older version, while a new transaction can see the newer committed version.

```text
Transaction A                 Transaction B
-------------                 -------------
Read 10000                    Update to 12000
                              Commit
Read again: 10000
```

Under a snapshot-based isolation level, Transaction A continues seeing the same snapshot.

Under Read Committed, the next statement may see the newly committed value instead.

The exact version visible depends on the isolation level and snapshot rules.

### 6.4 MVCC does not mean there are no locks

This is a common misconception.

MVCC reduces the need for readers and writers to block each other.

However, databases still use locks for:

- Conflicting writes
- Explicit locking reads
- Schema changes
- Referential integrity operations
- Other concurrency-control requirements

MVCC and locking work together.

---

## 7. How MVCC Works Conceptually

An MVCC database maintains information that helps determine which row versions are visible to a transaction.

Conceptually, each version has metadata such as:

- Which transaction created it
- Whether that transaction committed
- Which transaction invalidated or replaced it
- Whether the version is visible to the current transaction

Example:

```text
Row: Account 1

Version 1:
Balance = 10000
Created by Transaction 10

Version 2:
Balance = 12000
Created by Transaction 20

Version 3:
Balance = 9000
Created by Transaction 30
```

Suppose Transaction 20 committed but Transaction 30 has not committed.

Different transactions may see different versions depending on their snapshots.

```text
Transaction A snapshot:
Sees Version 1

Transaction B snapshot:
Sees Version 2

Transaction C after Transaction 30 commits:
Sees Version 3
```

This is a simplified conceptual model. Real databases use transaction identifiers, visibility rules, undo information, or other metadata rather than maintaining a simple numbered list in this exact form.

---

## 8. Database Snapshots

### 8.1 What is a snapshot?

A snapshot represents the database state that a transaction is allowed to observe.

It determines which committed changes are visible to that transaction.

For example:

```text
Time T1:
Balance = 10000

Time T2:
Transaction A starts

Time T3:
Transaction B updates balance to 12000

Time T4:
Transaction B commits

Time T5:
Transaction A reads balance
```

The result depends on the isolation level.

**Read Committed:**

Each statement generally gets a new snapshot.

Transaction A may see:

```text
12000
```

**Repeatable Read:**

Transaction A continues using its transaction snapshot.

It may see:

```text
10000
```

even after Transaction B commits.

### 8.2 Statement Snapshot vs Transaction Snapshot

| Isolation Level | Typical Snapshot Behavior                                                            |
| --------------- | ------------------------------------------------------------------------------------ |
| Read Committed  | New snapshot for each statement                                                      |
| Repeatable Read | One consistent transaction snapshot                                                  |
| Serializable    | Consistent transaction snapshot plus serializability checks or equivalent mechanisms |

This distinction is central to understanding PostgreSQL isolation behavior.

---

## 9. PostgreSQL MVCC Internals

PostgreSQL uses MVCC as a fundamental part of its concurrency-control architecture.

To understand it, we need to know how PostgreSQL stores row versions.

### 9.1 PostgreSQL Does Not Normally Overwrite a Row in Place

Suppose a row contains:

```text
account_id = 1
balance = 10000
```

We execute:

```sql
UPDATE accounts
SET balance = 12000
WHERE account_id = 1;
```

Conceptually, PostgreSQL creates a new row version.

```text
Old Tuple:
account_id = 1
balance = 10000

New Tuple:
account_id = 1
balance = 12000
```

The old version may remain physically present until PostgreSQL determines it is no longer needed.

This is a major difference between the simplified idea of overwriting a row and PostgreSQL's MVCC implementation.

### 9.2 Important Tuple Metadata

PostgreSQL tuples contain transaction-related metadata.

Two important fields are:

| Field  | Meaning                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `xmin` | Transaction ID that inserted the tuple version                           |
| `xmax` | Transaction ID associated with deleting or superseding the tuple version |

Example:

```text
Tuple 1:
balance = 10000
xmin = 100
xmax = 200

Tuple 2:
balance = 12000
xmin = 200
xmax = 0
```

Conceptually:

- Transaction 100 created the old version.
- Transaction 200 created the new version.
- The old version was superseded by Transaction 200.
- The new version currently has no deleting transaction recorded.

Actual visibility depends on transaction status and snapshot rules. An `xmax` value does not automatically mean a tuple is invisible to every transaction.

### 9.3 How PostgreSQL Determines Visibility

When a transaction reads a row, PostgreSQL checks:

1. Which transaction created the row version?
2. Was that transaction committed?
3. Is the creating transaction visible to the current snapshot?
4. Has the row version been deleted or superseded by a transaction visible to the current snapshot?

Based on these rules, PostgreSQL decides whether that version is visible.

### 9.4 What Happens to Old Row Versions?

Old row versions cannot always be deleted immediately.

An older transaction may still need them to maintain its snapshot.

PostgreSQL uses **VACUUM** to reclaim space occupied by dead tuples when they are no longer needed.

For example:

```sql
VACUUM accounts;
```

Autovacuum normally performs this maintenance automatically according to database configuration and workload.

### 9.5 Why Is VACUUM Important?

Without cleanup, obsolete row versions would accumulate.

This can lead to:

- Increased storage usage
- More disk reads
- Reduced query performance
- Table and index bloat
- Transaction ID wraparound risks if transaction ID maintenance is neglected

PostgreSQL's autovacuum system is therefore an important part of normal database operations.

---

## 10. MySQL/InnoDB MVCC Internals

MySQL's InnoDB storage engine also uses MVCC.

However, its internal implementation differs from PostgreSQL.

### 10.1 Undo Logs

InnoDB uses undo logs to preserve information about previous versions of rows.

Suppose a row contains:

```text
balance = 10000
```

A transaction updates it:

```sql
UPDATE accounts
SET balance = 12000
WHERE account_id = 1;
```

InnoDB stores information needed to reconstruct the previous version in its undo log.

A transaction reading an older snapshot can use this information to access the appropriate previous version.

### 10.2 Clustered Index and Record Versions

InnoDB stores table rows in its clustered index.

MVCC-related metadata and undo records help reconstruct the versions required by consistent reads.

### 10.3 Undo Log vs Redo Log

These two logs have different purposes.

| Log      | Purpose                                                                |
| -------- | ---------------------------------------------------------------------- |
| Undo Log | Supports rollback and reconstruction of previous row versions          |
| Redo Log | Supports crash recovery by recording changes that need to be reapplied |

Do not confuse undo and redo logs.

### 10.4 Purge Process

Old undo information cannot be removed while active transactions may still need it.

InnoDB's purge process cleans up obsolete undo records when they are no longer required.

Long-running transactions can delay cleanup and contribute to undo history growth.

---

## 11. PostgreSQL vs MySQL/InnoDB: MVCC Comparison

| Feature                       | PostgreSQL                           | MySQL/InnoDB                                    |
| ----------------------------- | ------------------------------------ | ----------------------------------------------- |
| MVCC                          | Yes                                  | Yes                                             |
| How old versions are retained | Old tuple versions in table storage  | Previous versions reconstructed using undo logs |
| Version metadata              | `xmin`, `xmax`, and related metadata | Transaction IDs and undo information            |
| Cleanup                       | VACUUM / autovacuum                  | Purge process                                   |
| Consistent reads              | MVCC snapshots                       | MVCC snapshots                                  |
| Ordinary reads vs writes      | Often do not block each other        | Often do not block each other                   |
| Explicit locking              | Supported                            | Supported                                       |

**Important:** These are architectural differences. Neither database is universally faster or better because of its MVCC design alone.

---

## 12. Locking vs MVCC

Now compare the two major approaches.

| Feature             | Lock-Based Concurrency                        | MVCC                                 |
| ------------------- | --------------------------------------------- | ------------------------------------ |
| Main idea           | Coordinate access using locks                 | Maintain multiple row versions       |
| Readers and writers | May block each other                          | Often proceed concurrently           |
| Storage overhead    | Lock-management overhead                      | Additional version storage           |
| Write conflicts     | Managed through locks                         | Still require coordination           |
| Old versions        | Not fundamental to basic locking              | Fundamental to MVCC                  |
| Cleanup             | Lock release                                  | Old-version cleanup                  |
| Typical use         | Explicit protection of conflicting operations | Snapshot-based reads and concurrency |

### Can databases use both?

Yes.

This is how modern relational databases commonly operate.

For example, PostgreSQL:

- Uses MVCC for ordinary reads.
- Uses row-level locks for conflicting updates.
- Supports explicit locking with `FOR UPDATE`.
- Uses Serializable Snapshot Isolation to detect dangerous transaction dependencies.

MySQL/InnoDB:

- Uses MVCC for consistent reads.
- Uses locks for writes and locking reads.
- Uses next-key locks in relevant operations under Repeatable Read.

---

## 13. How Serializable Snapshot Isolation Works in PostgreSQL

This is an important advanced topic.

PostgreSQL implements Serializable isolation using **Serializable Snapshot Isolation (SSI)**.

### 13.1 Why is SSI Needed?

Snapshot isolation provides consistent snapshots, but it can permit write skew.

Recall the hospital example:

- Transaction A reads that two doctors are on duty.
- Transaction B reads that two doctors are on duty.
- Transaction A updates Doctor A.
- Transaction B updates Doctor B.
- Both attempt to commit.

Each transaction updates a different row, so ordinary write-write conflict detection may not be enough to detect the business-rule violation.

SSI tracks read/write dependencies between transactions to identify dangerous structures that could produce a non-serializable result.

### 13.2 Predicate Locks

PostgreSQL uses predicate-locking information in Serializable transactions.

These are represented internally through `SIReadLock` locks.

They are used for tracking read dependencies, not as ordinary blocking locks.

For example:

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT *
FROM doctors
WHERE on_duty = TRUE;
```

PostgreSQL tracks the relevant read dependency.

If another transaction changes data in a way that creates a dangerous serialization dependency, PostgreSQL may abort one transaction.

### 13.3 Does SSI Block Every Conflicting Transaction?

No.

SSI is designed to detect dangerous dependency patterns and abort transactions when necessary.

It does not simply force all reads and writes to execute one after another.

### 13.4 What Does the Application Need to Do?

The application should:

1. Start a Serializable transaction.
2. Execute all related database operations.
3. Commit.
4. Detect serialization failures.
5. Retry the entire transaction when appropriate.

PostgreSQL commonly reports SQLSTATE `40001` for serialization failures.

---

## 14. Practical PostgreSQL Locking Examples

### 14.1 SELECT FOR UPDATE

Use it when you want to read a row and protect it against conflicting modifications.

```sql
BEGIN;

SELECT *
FROM products
WHERE product_id = 10
FOR UPDATE;

UPDATE products
SET stock = stock - 1
WHERE product_id = 10;

COMMIT;
```

A concurrent transaction attempting to acquire a conflicting row lock generally waits.

### 14.2 SELECT FOR SHARE

This requests a shared row-level lock.

```sql
BEGIN;

SELECT *
FROM accounts
WHERE account_id = 1
FOR SHARE;

COMMIT;
```

It allows compatible shared locking operations while preventing conflicting modifications until the lock is released.

### 14.3 NOWAIT

Normally, a locking query waits if another transaction holds a conflicting lock.

`NOWAIT` tells PostgreSQL to fail immediately instead.

```sql
SELECT *
FROM products
WHERE product_id = 10
FOR UPDATE NOWAIT;
```

If the required lock cannot be acquired immediately, PostgreSQL raises an error.

### 14.4 SKIP LOCKED

`SKIP LOCKED` skips rows that are already locked by another transaction.

This is particularly useful for background job queues.

```sql
BEGIN;

SELECT *
FROM jobs
WHERE status = 'pending'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;

COMMIT;
```

Suppose multiple workers are processing jobs.

```text
Worker A                  Worker B
--------                  --------
Locks Job 1               Skips Job 1
Processes Job 1           Locks Job 2
```

This allows multiple workers to claim different available jobs without waiting for each other.

A production implementation should update the selected job's status or otherwise claim it within the same transaction before committing.

---

## 15. Common Mistakes in Real Backend Applications

### Mistake 1: Reading and Updating Without Atomicity

Weak implementation:

```javascript
const product = await pool.query("SELECT stock FROM products WHERE id = $1", [
  productId,
]);

if (product.rows[0].stock > 0) {
  await pool.query("UPDATE products SET stock = stock - 1 WHERE id = $1", [
    productId,
  ]);
}
```

Problem:

Two requests may both read the same stock value and both decide that stock is available.

Better:

```sql
UPDATE products
SET stock = stock - 1
WHERE id = $1
  AND stock > 0
RETURNING stock;
```

### Mistake 2: Holding Locks During External API Calls

Bad pattern:

```text
BEGIN TRANSACTION

Lock inventory row

Call payment gateway

Wait for payment response

Update order

COMMIT
```

Problem:

The transaction holds database locks while waiting for an external network request.

This can cause unnecessary blocking and contention.

Better approach:

- Keep database transactions short.
- Use an appropriate reservation or order state.
- Call external services outside long-running database transactions.
- Use idempotency and a reliable payment/order workflow.

### Mistake 3: Keeping Transactions Open Too Long

Long-running transactions can:

- Hold locks for longer periods.
- Delay old-version cleanup.
- Increase contention.
- Consume database resources.

Keep transactions as short as practical.

### Mistake 4: Assuming MVCC Prevents All Conflicts

Incorrect.

MVCC helps readers and writers work concurrently, but it does not eliminate write conflicts, deadlocks, or serialization anomalies.

### Mistake 5: Using SELECT FOR UPDATE Everywhere

Locking every row read can unnecessarily reduce concurrency.

Use explicit locks when there is a clear consistency requirement.

---

## 16. Important Concepts to Remember

| Concept                 | Meaning                                                     |
| ----------------------- | ----------------------------------------------------------- |
| Shared Lock             | Allows compatible shared access                             |
| Exclusive Lock          | Protects against conflicting access                         |
| Row-Level Lock          | Locks an individual row                                     |
| Table-Level Lock        | Locks a table                                               |
| Pessimistic Concurrency | Uses locks to prevent conflicts                             |
| MVCC                    | Maintains multiple row versions                             |
| Snapshot                | Defines which versions a transaction can see                |
| Undo Log                | Preserves information for rollback and older versions       |
| Redo Log                | Supports crash recovery                                     |
| VACUUM                  | Cleans obsolete PostgreSQL row versions                     |
| Purge                   | Cleans obsolete InnoDB undo information                     |
| SSI                     | PostgreSQL's Serializable Snapshot Isolation implementation |
| Predicate Lock          | Tracks read dependencies for serializability                |

---

## 17. Interview Questions and Answers

### Q1. What is MVCC?

MVCC stands for Multi-Version Concurrency Control. It allows a database to maintain multiple versions of rows so transactions can read versions appropriate to their snapshots.

### Q2. Why do databases use MVCC?

To improve concurrency, particularly by allowing readers and writers to operate without unnecessarily blocking each other.

### Q3. Does MVCC eliminate locks?

No. Databases still use locks for conflicting writes, explicit locking reads, schema changes, and other operations.

### Q4. What is the difference between shared and exclusive locks?

Shared locks allow compatible shared access. Exclusive locks prevent conflicting access, generally for modifications.

### Q5. What is the difference between pessimistic and optimistic concurrency control?

Pessimistic concurrency control assumes conflicts may happen and uses locks to coordinate access.

Optimistic concurrency control allows operations to proceed with less upfront locking and checks for conflicts when changes are applied or committed.

MVCC is not synonymous with optimistic concurrency control, although MVCC databases often use optimistic techniques for some operations.

### Q6. What are `xmin` and `xmax` in PostgreSQL?

They are transaction-related tuple metadata:

- `xmin`: transaction ID associated with creating a tuple version.
- `xmax`: transaction ID associated with deleting or superseding a tuple version.

### Q7. Why does PostgreSQL need VACUUM?

PostgreSQL retains old row versions while they may still be needed by active snapshots. VACUUM helps reclaim space occupied by obsolete tuple versions.

### Q8. What is the difference between undo and redo logs?

Undo logs support rollback and reconstruction of older data versions.

Redo logs support crash recovery by reapplying logged changes.

### Q9. What is the difference between PostgreSQL and InnoDB MVCC?

PostgreSQL generally retains old tuple versions in table storage and cleans them through VACUUM.

InnoDB uses undo logs to reconstruct older versions and cleans obsolete undo information through its purge process.

### Q10. What is SELECT FOR UPDATE?

It is a locking read that requests row-level locks to protect selected rows against conflicting operations until the transaction ends.

### Q11. What is SKIP LOCKED used for?

It allows a transaction to skip rows that are already locked. It is useful for concurrent background job workers and queue processing.

### Q12. How does PostgreSQL implement Serializable isolation?

PostgreSQL uses Serializable Snapshot Isolation (SSI), tracking read/write dependencies and aborting transactions when necessary to preserve serializability.

---

## 18. Chapter Summary

The key takeaway is that isolation levels define the guarantees, while concurrency-control mechanisms implement those guarantees.

```text
                  DATABASE
                     |
          -----------------------
          |                     |
          v                     v
    Lock-Based Control         MVCC
          |                     |
          v                     v
    Coordinate access      Multiple versions
          |                     |
          v                     v
    Prevent conflicting   Snapshot-based reads
    operations                  |
          |                     |
          ----------- -----------
                     |
                     v
            Transaction Isolation
```

Remember:

1. Locks coordinate access to shared database resources.
2. Shared locks allow compatible shared access.
3. Exclusive locks prevent conflicting access.
4. Pessimistic concurrency control uses locks to prevent conflicts.
5. MVCC maintains multiple versions of rows.
6. Snapshots determine which versions transactions can see.
7. PostgreSQL uses `xmin`, `xmax`, tuple versions, and VACUUM.
8. InnoDB uses undo logs and a purge process for old versions.
9. MVCC does not eliminate locks.
10. PostgreSQL implements Serializable isolation using SSI.
