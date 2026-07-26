---
sidebar_label: ACID Properties
sidebar_position: 1
---

# ACID Properties

## 1. What Is ACID?

ACID is a set of four properties that describe important guarantees provided by database transactions.

These properties help databases maintain reliable and correct data when:

- Multiple operations execute together.
- Multiple users access the database simultaneously.
- An operation fails.
- The database crashes.
- The system experiences unexpected interruptions.

The four properties are:

| Property    | Meaning                                   | Main purpose                             |
| ----------- | ----------------------------------------- | ---------------------------------------- |
| Atomicity   | All or nothing                            | Prevent partially completed transactions |
| Consistency | Valid state to valid state                | Preserve database integrity rules        |
| Isolation   | Transactions do not interfere incorrectly | Control concurrent execution             |
| Durability  | Committed changes persist                 | Protect committed data against failures  |

Let's understand each property using a common example.

### Example: Banking transaction

Suppose we transfer ₹2,000 from Account A to Account B.

Initial balances:

| Account   |     Balance |
| --------- | ----------: |
| Account A |     ₹10,000 |
| Account B |      ₹5,000 |
| **Total** | **₹15,000** |

Required operations:

1. Deduct ₹2,000 from Account A.
2. Add ₹2,000 to Account B.

Expected final balances:

| Account   |     Balance |
| --------- | ----------: |
| Account A |      ₹8,000 |
| Account B |      ₹7,000 |
| **Total** | **₹15,000** |

The total money remains unchanged.

All four ACID properties contribute to making this transaction reliable.

---

## 2. Atomicity — All or Nothing

Atomicity means that a transaction's changes are treated as one indivisible logical unit.

Either the transaction completes successfully, or its uncommitted changes are rolled back.

In simple terms:

**All required operations succeed together, or none of the transaction's uncommitted changes are retained.**

### 2.1 Why do we need atomicity?

Consider our banking example.

Starting balances:

- Account A = ₹10,000
- Account B = ₹5,000

We execute:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 2;

COMMIT;
```

Suppose the first update succeeds, but the second update encounters an error.

Without atomicity, the first update could remain while the second fails.

The result would be:

| Account   |      Before | Incorrect result |
| --------- | ----------: | ---------------: |
| Account A |     ₹10,000 |           ₹8,000 |
| Account B |      ₹5,000 |           ₹5,000 |
| **Total** | **₹15,000** |      **₹13,000** |

The transaction would have completed only partially.

Atomicity ensures that the database does not retain the uncommitted deduction as a completed transaction.

### 2.2 How does atomicity work?

A database uses internal mechanisms to track transaction changes and recover from failures.

One important mechanism is a **transaction log**.

For example, PostgreSQL uses Write-Ahead Logging (WAL).

Conceptually:

```text
          BEGIN TRANSACTION
                 |
                 v
        Record transaction changes
                 |
                 v
        Execute database operations
                 |
           +-----+-----+
           |           |
        Success       Failure
           |           |
           v           v
         COMMIT      ABORT
           |           |
           v           v
      Keep committed  Undo uncommitted
      transaction     changes
```

The actual implementation is more sophisticated.

For example, a database may record enough information to redo or undo operations during recovery.

The important point is that the database maintains the information required to handle transaction completion and failure.

### 2.3 Example using ROLLBACK

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;

-- An error or business-rule failure occurs.

ROLLBACK;
```

After rollback, the uncommitted deduction is undone.

### 2.4 Atomicity in real applications

**E-commerce order placement**

Suppose placing an order involves:

1. Creating an order record.
2. Creating order-item records.
3. Reserving inventory.
4. Recording a payment-related database entry.

If a required operation fails, the transaction can be rolled back.

This prevents the database from retaining only part of the order operation.

However, an external payment gateway is not automatically included in a database transaction. External operations require additional coordination.

### 2.5 Important clarification

Atomicity applies to the transaction's database changes.

It does not automatically undo external side effects such as:

- Sending an email.
- Calling a payment gateway.
- Publishing a message to an external service.
- Sending an SMS.

For example:

```text
BEGIN
  |
  v
Update database
  |
  v
Send email
  |
  v
Database transaction fails
  |
  v
ROLLBACK
```

The database changes can be rolled back, but the email cannot be unsent.

This is why distributed applications often need patterns such as the transactional outbox or saga.

We will encounter these concepts when studying distributed systems and system architecture.

**Remember:** Atomicity does not mean every external operation is automatically reversible.

---

## 3. Consistency — Valid State to Valid State

Consistency means that a successfully committed transaction preserves the database's defined integrity rules.

A transaction should take the database from one valid state to another valid state.

### 3.1 What is a consistent database state?

A database is consistent when its applicable constraints and integrity rules are satisfied.

Examples:

- Primary keys must be unique.
- Required columns cannot be NULL.
- Foreign keys must reference valid records.
- Product stock cannot be negative if the database enforces that rule.
- Account balances must satisfy applicable constraints.

Consider:

**accounts**

| account_id | balance |
| ---------: | ------: |
|          1 |   10000 |
|          2 |    5000 |

Suppose our application requires account balances to be non-negative.

We can enforce this using a database constraint.

```sql
CREATE TABLE accounts (
    account_id INTEGER PRIMARY KEY,
    balance NUMERIC(12, 2)
        CHECK (balance >= 0)
);
```

Now consider:

```sql
UPDATE accounts
SET balance = -5000
WHERE account_id = 1;
```

The database rejects this update because it violates the `CHECK` constraint.

The database prevents the transaction from committing an invalid balance.

### 3.2 How does consistency work?

A DBMS uses mechanisms such as:

- Primary-key constraints.
- Foreign-key constraints.
- UNIQUE constraints.
- NOT NULL constraints.
- CHECK constraints.
- Data types.
- Triggers.
- Application-level validation.
- Transaction processing.

These mechanisms help enforce the rules defined by the database and application.

### 3.3 Example: Foreign-key consistency

Suppose we have:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**orders**

|  id | user_id |
| --: | ------: |
| 101 |       1 |
| 102 |       2 |

We define a foreign key:

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
);
```

Now try:

```sql
INSERT INTO orders (id, user_id)
VALUES (103, 99);
```

If user 99 does not exist, the database rejects the insertion.

The foreign-key constraint preserves referential integrity.

### 3.4 Consistency in the banking example

Suppose:

- Account A has ₹10,000.
- Account B has ₹5,000.

We transfer ₹2,000.

Before the transaction:

\[
10000 + 5000 = 15000
\]

After the transaction:

\[
8000 + 7000 = 15000
\]

The total remains ₹15,000.

This is an application-level business invariant.

The transaction should preserve it.

However, a critical distinction is necessary:

**A database does not automatically understand every business rule.**

For example, a database cannot infer that the sum of all account balances must remain unchanged merely because we are transferring money.

That rule must be correctly implemented through transaction logic and appropriate constraints or other mechanisms.

### 3.5 Consistency is not the same as data validation

Data validation checks whether individual input values satisfy certain rules.

Database consistency is broader.

It includes preserving all relevant integrity constraints across database operations.

Example:

- `age >= 18` is a validation rule.
- Every order must reference an existing user is a referential-integrity rule.
- A financial transfer must not create or destroy money is a business invariant.

These rules may be enforced at different layers.

### 3.6 Who is responsible for consistency?

Both the database and application can have responsibilities.

| Layer               | Responsibility                                            |
| ------------------- | --------------------------------------------------------- |
| Database            | Enforce declared constraints and transactional guarantees |
| Backend application | Enforce business rules and coordinate operations          |
| External services   | Provide their own guarantees for external operations      |

A reliable application should not depend exclusively on frontend validation for critical data-integrity rules.

---

## 4. Isolation — Transactions Should Not Interfere Incorrectly

Isolation controls how concurrent transactions interact with each other.

Multiple users may access and modify the same data simultaneously.

Without appropriate concurrency control, one transaction may observe or overwrite another transaction's changes in undesirable ways.

### 4.1 Why do we need isolation?

Suppose two customers try to purchase the last available laptop.

Initial stock:

```text
Available stock = 1
```

Two transactions execute almost simultaneously.

**Transaction A:**

```text
Read stock = 1
Purchase one laptop
Update stock = 0
```

**Transaction B:**

```text
Read stock = 1
Purchase one laptop
Update stock = 0
```

Both transactions may believe the laptop is available.

The system may accidentally confirm two purchases when only one unit exists.

This is a concurrency problem.

Isolation helps control how transactions interact so that conflicting operations do not produce invalid results.

### 4.2 What does isolation mean?

Isolation does not necessarily mean that only one transaction can execute at a time.

That would significantly reduce concurrency.

Instead, databases use mechanisms such as:

- Locks.
- MVCC (Multi-Version Concurrency Control).
- Snapshot-based reads.
- Serialization checks.
- Other concurrency-control techniques.

These mechanisms allow multiple transactions to execute concurrently while providing defined isolation guarantees.

### 4.3 Example: Concurrent bank withdrawals

Suppose an account has ₹5,000.

Two transactions attempt to withdraw ₹4,000 simultaneously.

```text
Initial balance = ₹5,000

Transaction A wants to withdraw ₹4,000.
Transaction B wants to withdraw ₹4,000.
```

Both transactions must not successfully withdraw ₹4,000 based on the same initial balance.

Appropriate concurrency control can coordinate the operations so that the balance does not become invalid.

One possible PostgreSQL approach is:

```sql
BEGIN;

SELECT balance
FROM accounts
WHERE account_id = 1
FOR UPDATE;

UPDATE accounts
SET balance = balance - 4000
WHERE account_id = 1
  AND balance >= 4000;

COMMIT;
```

The row lock helps serialize conflicting modifications to that account.

A production implementation should also check whether the update affected a row and roll back if the withdrawal was unsuccessful.

### 4.4 Isolation levels

Databases provide different isolation levels.

Common SQL isolation levels are:

1. Read Uncommitted.
2. Read Committed.
3. Repeatable Read.
4. Serializable.

Each level provides different guarantees concerning what a transaction can observe from other concurrent transactions.

We will study these levels and the anomalies they address in:

- Part 2C — Isolation Problems.
- Part 2D — Isolation Levels.
- Part 2E — How Databases Implement Isolation.

---

## 5. Durability — Committed Changes Must Persist

Durability means that once a transaction has successfully committed, its changes are protected against failures according to the database's durability guarantees.

In simple terms:

**A committed transaction should not disappear simply because the database or server crashes immediately afterward.**

### 5.1 Why do we need durability?

Suppose a customer completes a payment of ₹5,000.

The database updates the payment record:

```sql
UPDATE payments
SET status = 'SUCCESS'
WHERE payment_id = 101;
```

The transaction commits successfully.

Immediately afterward, the database server crashes.

When the database restarts, the committed payment update should still be present, assuming the configured durability guarantees were met.

Without durability, committed transactions could be lost after a crash.

### 5.2 How does a database provide durability?

Databases use mechanisms such as:

- Write-Ahead Logging (WAL).
- Transaction logs.
- Checkpoints.
- Recovery procedures.
- Durable storage.
- Replication and backups for additional protection.

For example, PostgreSQL uses WAL.

### 5.3 Understanding Write-Ahead Logging (WAL)

WAL follows an important principle:

**The database records the necessary change information in the log before the corresponding modified data pages need to be written to their final locations.**

Why is this useful?

Writing database data pages directly to their final disk locations can be expensive and may involve multiple disk operations.

Instead, the database records changes in a sequential log.

Conceptually:

```text
       Transaction
            |
            v
       Modify data
            |
            v
      Generate WAL records
            |
            v
     Flush required WAL
            |
            v
          COMMIT
            |
            v
   Data pages written later
   as part of normal processing
```

The actual write and commit behavior depends on database configuration and implementation.

### 5.4 What happens if the server crashes?

Suppose a transaction successfully commits.

The corresponding WAL information has been made durable according to the configured commit guarantees.

Then the server crashes before all modified data pages have been written to their final locations.

When PostgreSQL restarts:

1. It examines the available WAL and recovery information.
2. It identifies changes that need to be replayed.
3. It redoes required changes.
4. It restores the database to a recoverable state.

This is why committed changes can survive a crash even if the corresponding data pages were not all written before the crash.

### 5.5 Does durability mean data can never be lost?

No.

Durability has limits and depends on configuration and failure assumptions.

For example:

- A disk can fail.
- A storage device can be destroyed.
- A database can be misconfigured.
- A committed transaction may not have been replicated to a standby server yet.
- A user can accidentally delete important records.

Therefore, production systems also need:

- Backups.
- Replication.
- Monitoring.
- Disaster recovery procedures.
- Appropriate storage configuration.

**Important distinction:**

- WAL helps recover database changes after failures.
- Replication maintains copies of data on other database instances.
- Backups provide recovery from a wider range of failures, including accidental deletion and some forms of corruption.

These mechanisms complement one another; they are not interchangeable.

---

## 6. Understanding All Four ACID Properties Together

Let's return to the banking transaction.

Initial state:

| Account | Balance |
| ------- | ------: |
| A       | ₹10,000 |
| B       |  ₹5,000 |

Transfer ₹2,000 from A to B.

### Atomicity

Both database updates must succeed together, or the transaction's uncommitted changes must be rolled back.

### Consistency

The transaction must preserve applicable database constraints and business invariants, such as non-negative balances and conservation of money during the transfer.

### Isolation

Concurrent transactions must not interfere in a way that allows invalid transfers or inconsistent results.

### Durability

After the transfer commits, the committed changes must survive failures covered by the database's durability guarantees.

### Combined diagram

```text
              BANK TRANSFER
                    |
                    v
             BEGIN TRANSACTION
                    |
                    v
          Deduct ₹2,000 from A
                    |
                    v
           Add ₹2,000 to B
                    |
                    v
              COMMIT
                    |
       +------------+------------+
       |            |            |
       v            v            v
   Atomicity    Consistency   Isolation
       |            |            |
       |            |            |
   All or none  Valid state   Safe concurrent
                              execution
                    |
                    v
                Durability
                    |
                    v
          Committed data persists
```

All four properties work together to provide reliable transaction processing.

---

## 7. ACID: What Happens Without Each Property?

This is a useful way to remember the four properties.

| Missing property | Possible problem                  | Example                                      |
| ---------------- | --------------------------------- | -------------------------------------------- |
| Atomicity        | Partial transaction changes       | Money deducted but not credited              |
| Consistency      | Invalid database state            | Negative stock or invalid references         |
| Isolation        | Concurrent transactions interfere | Two customers purchase the last item         |
| Durability       | Committed changes disappear       | Successful payment record lost after a crash |

These are conceptual examples. A particular database may prevent some problems through constraints or other mechanisms even when a transaction is not explicitly written.

---

## 8. Does ACID Reduce Database Performance?

ACID guarantees require database mechanisms that consume resources.

However, the statement "ACID always makes databases slow" is incorrect.

Performance depends on:

- Transaction complexity.
- Isolation level.
- Lock contention.
- Indexes.
- Storage performance.
- WAL configuration.
- Query design.
- Hardware.
- Database architecture.
- Workload characteristics.

Let's understand the tradeoffs.

### 8.1 Atomicity overhead

The database needs to track transaction changes and support rollback and recovery.

This requires logging and transaction-management work.

### 8.2 Consistency overhead

Constraints may require additional checks.

For example:

- UNIQUE constraints require checking for conflicting values.
- Foreign keys require validating references.
- CHECK constraints require evaluating conditions.

These checks consume resources, but they protect data integrity.

### 8.3 Isolation overhead

Higher isolation guarantees can require additional coordination.

For example:

- Transactions may wait for locks.
- Conflicting transactions may be aborted.
- Serializable transactions may require retries.

This can affect throughput under heavy contention.

### 8.4 Durability overhead

Making committed data durable may require flushing log records to persistent storage.

This introduces I/O work.

### 8.5 Summary

| ACID property | Potential overhead                              |
| ------------- | ----------------------------------------------- |
| Atomicity     | Transaction logging and rollback support        |
| Consistency   | Constraint validation                           |
| Isolation     | Locking, version management, conflict detection |
| Durability    | Log persistence and recovery support            |

The goal is not to eliminate ACID guarantees to improve performance blindly.

The goal is to choose appropriate database architecture, transaction boundaries, isolation settings, and storage configuration for the application's requirements.

---

## 9. Do NoSQL Databases Support ACID?

A common misconception is:

**SQL databases support ACID, but NoSQL databases do not.**

This is incorrect.

NoSQL does not automatically mean the absence of transactions or ACID guarantees.

Different NoSQL databases provide different transaction capabilities.

### 9.1 MongoDB

MongoDB supports atomic operations at the single-document level.

It also supports multi-document transactions.

Example:

```javascript
const session = client.startSession();

try {
  session.startTransaction();

  await accounts.updateOne(
    { accountId: 1 },
    { $inc: { balance: -2000 } },
    { session },
  );

  await accounts.updateOne(
    { accountId: 2 },
    { $inc: { balance: 2000 } },
    { session },
  );

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

Both account updates participate in the same transaction.

MongoDB provides multi-document transaction support, although its guarantees and operational constraints should be understood for the deployment architecture being used.

### 9.2 Redis

Redis provides atomic execution of individual commands.

It also supports transaction mechanisms through `MULTI`, `EXEC`, and related commands.

However, Redis transactions do not behave identically to PostgreSQL transactions.

For example, Redis transactions do not provide the same general-purpose rollback behavior as traditional relational transactions.

### 9.3 Cassandra

Apache Cassandra provides lightweight transactions using its Paxos-based conditional update mechanism.

It also provides atomicity at the individual partition level for ordinary mutations.

Its transaction and consistency semantics differ significantly from traditional relational databases.

### 9.4 Important comparison

| Database       | Transaction support                                                               |
| -------------- | --------------------------------------------------------------------------------- |
| PostgreSQL     | Full relational transactions with ACID guarantees                                 |
| MySQL (InnoDB) | ACID transactions                                                                 |
| MongoDB        | Single-document atomicity and multi-document transactions                         |
| Redis          | Atomic commands and transaction mechanisms with different rollback semantics      |
| Cassandra      | Partition-level atomicity and lightweight transactions for conditional operations |

**Important:** Do not judge a database only by whether it supports the word ACID. Evaluate its actual transaction scope, isolation guarantees, durability configuration, and failure behavior.

---

## 10. ACID vs BASE

ACID is often discussed alongside BASE, particularly when comparing traditional relational databases with distributed NoSQL systems.

BASE stands for:

- Basically Available.
- Soft State.
- Eventual Consistency.

BASE is a broad design philosophy associated with some distributed systems. It is not a formal replacement for ACID, nor does every NoSQL database strictly follow it.

### 10.1 Basically Available

The system aims to remain available for requests despite certain failures.

This does not mean every request must always succeed or that every replica has the latest data.

### 10.2 Soft State

The system's state may change over time even without new user input, as replicas synchronize and background processes run.

### 10.3 Eventual Consistency

If updates stop and the system continues operating normally, replicas are expected to converge to a consistent state eventually.

For example:

```text
User updates profile
        |
        v
Primary node updated
        |
        v
Replica A receives update
        |
        v
Replica B receives update
        |
        v
Replicas converge
```

During propagation, different replicas may temporarily return different values.

### 10.4 ACID vs BASE comparison

| ACID                                                                | BASE                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Focuses on transaction guarantees                                   | Focuses on availability and eventual convergence in distributed systems |
| Commonly associated with transactional database design              | Commonly associated with some distributed database designs              |
| Consistency is tied to defined integrity and transaction guarantees | Eventual consistency allows temporary divergence                        |
| Often requires coordination for stronger guarantees                 | May relax immediate consistency to improve availability or scalability  |

**Important:** ACID and BASE are not strict opposites.

A distributed system can provide strong transactional guarantees in some operations and eventual consistency in other parts of its architecture.

---

## 11. ACID Does Not Mean Every Transaction Is Automatically Correct

This is a critical distinction.

ACID provides transaction guarantees, but it cannot automatically fix incorrect business logic.

Suppose an application performs:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 5000
WHERE account_id = 1;

COMMIT;
```

Assume Account 1 has only ₹1,000.

If the database schema does not prevent negative balances, this transaction can successfully commit a balance of -₹4,000.

The transaction may have executed atomically and durably.

But the business operation is incorrect.

To prevent this, enforce an appropriate constraint:

```sql
ALTER TABLE accounts
ADD CONSTRAINT balance_non_negative
CHECK (balance >= 0);
```

Or implement a conditional update:

```sql
UPDATE accounts
SET balance = balance - 5000
WHERE account_id = 1
  AND balance >= 5000;
```

The application must also check whether a row was updated.

This demonstrates an important principle:

**ACID protects transaction processing; correct business rules still need to be designed and enforced.**

---

## 12. Common Misconceptions

### Misconception 1: ACID means a database can never fail.

Incorrect.

Databases can crash, disks can fail, and network connections can be interrupted. ACID mechanisms help maintain and recover transaction state according to the database's guarantees.

### Misconception 2: Atomicity and durability mean the same thing.

Incorrect.

- Atomicity ensures that a transaction's changes are completed together or aborted.
- Durability ensures that successfully committed changes persist.

### Misconception 3: Consistency means every user always sees the latest data.

Incorrect.

That is not the meaning of ACID consistency.

ACID consistency concerns preserving defined database integrity rules. What concurrent transactions can see is primarily governed by isolation and the database's consistency model.

### Misconception 4: Isolation means transactions execute one by one.

Incorrect.

Databases allow concurrent execution. They use concurrency-control mechanisms to provide defined isolation guarantees.

### Misconception 5: ACID is available only in SQL databases.

Incorrect.

Some NoSQL databases support ACID transactions, but transaction scope and guarantees differ.

### Misconception 6: ACID always causes poor performance.

Incorrect.

ACID mechanisms introduce overhead, but their impact depends on the workload and implementation. Well-designed transactional systems can achieve high throughput.

### Misconception 7: A successful COMMIT means every external operation also succeeded.

Incorrect.

A database transaction does not automatically include external payment providers, email services, or other systems.

### Misconception 8: ACID guarantees that application business logic is correct.

Incorrect.

ACID cannot compensate for incorrect application logic or missing integrity constraints.

---

## 13. Interview Questions

### Q1. What is ACID?

ACID is a set of four transaction properties: Atomicity, Consistency, Isolation, and Durability.

### Q2. Explain atomicity with an example.

In a money transfer, both the debit and credit operations must succeed together. If the transaction is aborted, its uncommitted changes are rolled back.

### Q3. What is consistency in ACID?

Consistency ensures that a successfully committed transaction preserves the database's defined integrity constraints and rules.

### Q4. What is isolation?

Isolation controls how concurrent transactions interact and what data they can observe, preventing undesirable interference according to the selected isolation guarantees.

### Q5. What is durability?

Durability means committed changes are protected against failures according to the database's durability guarantees.

### Q6. What is the difference between atomicity and consistency?

Atomicity concerns whether transaction changes are completed together or aborted. Consistency concerns whether the resulting database state satisfies defined integrity rules.

### Q7. What is the difference between consistency and isolation?

Consistency preserves database rules. Isolation controls the interaction and visibility of concurrent transactions.

### Q8. How does PostgreSQL provide durability?

PostgreSQL uses Write-Ahead Logging (WAL), recovery mechanisms, and storage persistence to protect committed changes according to its configuration.

### Q9. What is Write-Ahead Logging?

WAL is a logging mechanism in which the database records change information before corresponding modified data pages need to be written to their final locations.

### Q10. Do NoSQL databases support ACID?

Some do. For example, MongoDB supports multi-document transactions. However, transaction scope and guarantees differ between NoSQL systems.

### Q11. What is BASE?

BASE stands for Basically Available, Soft State, and Eventual Consistency. It describes a broad design philosophy used in some distributed systems.

### Q12. Does ACID guarantee that money transfers are implemented correctly?

No. ACID provides transaction guarantees, but developers must implement the correct business rules, such as sufficient-balance checks and appropriate concurrency control.

### Q13. Can a transaction be ACID-compliant and still have incorrect business results?

Yes. A transaction can satisfy its database constraints while application logic implements an incorrect business operation. ACID does not automatically validate every business invariant.

---

## 14. Chapter Summary

| Property    | Meaning                                     | Example                                                                         |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| Atomicity   | All or nothing                              | Debit and credit succeed together                                               |
| Consistency | Preserve defined database rules             | Account balance cannot become negative                                          |
| Isolation   | Control concurrent transaction interactions | Two withdrawals cannot incorrectly spend the same balance                       |
| Durability  | Protect committed changes                   | A committed transfer survives a database crash covered by durability guarantees |

### Mechanisms commonly associated with ACID

| Mechanism           | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| Transactions        | Group related database operations              |
| Rollback            | Undo uncommitted changes                       |
| Constraints         | Enforce data-integrity rules                   |
| Locks               | Coordinate conflicting operations              |
| MVCC                | Manage concurrent access using record versions |
| WAL                 | Support crash recovery and durability          |
| Recovery procedures | Restore the database after failures            |

### Final takeaway

ACID is the foundation of reliable transaction processing.

- **Atomicity:** Do not retain partially completed transactions.
- **Consistency:** Preserve the database's defined integrity rules.
- **Isolation:** Coordinate concurrent transactions safely.
- **Durability:** Protect successfully committed changes.

A reliable database needs more than the ability to store records. It needs mechanisms to ensure that transactions behave correctly under failures and concurrent access.
