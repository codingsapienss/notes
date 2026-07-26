---
sidebar_label: Isolation Problems
sidebar_position: 1
---

# Isolation Problems

## 1. Introduction to Isolation Problems

Isolation controls how concurrent transactions interact with each other.

But why is isolation necessary?

Consider an e-commerce application where multiple customers are purchasing products simultaneously.

Suppose a product has only 10 units in stock.

Two customers attempt to purchase products at almost the same time.

Both transactions read the inventory, calculate the remaining stock, and update the database.

If their operations are not coordinated properly, the application may produce incorrect results.

This happens because database transactions can execute concurrently.

### 1.1 What is concurrency?

Concurrency means multiple transactions make progress during overlapping periods.

For example:

```text
Transaction A                 Transaction B
      |                              |
      v                              v
Read account balance           Read account balance
      |                              |
      v                              v
Calculate new balance          Calculate new balance
      |                              |
      v                              v
Update account                 Update account
      |                              |
      +---------------+--------------+
                      |
                      v
                Database
```

The database may interleave operations from different transactions.

Concurrency improves resource utilization and allows multiple users to work simultaneously.

However, without appropriate concurrency control, transactions can produce unexpected results.

### 1.2 What are isolation anomalies?

An isolation anomaly is an unexpected result caused by interactions between concurrent transactions.

For example:

- One transaction reads another transaction's uncommitted changes.
- A transaction reads the same row twice and gets different values.
- A repeated query returns additional or missing rows.
- Two transactions overwrite each other's updates.

These problems are known as transaction anomalies.

The four major anomalies covered in this chapter are:

| Anomaly             | Basic meaning                                                     |
| ------------------- | ----------------------------------------------------------------- |
| Dirty Read          | Reading another transaction's uncommitted changes                 |
| Non-Repeatable Read | Reading the same row twice and getting different committed values |
| Phantom Read        | Repeating a query and getting a different set of matching rows    |
| Lost Update         | One transaction overwrites another transaction's update           |

---

## 2. Dirty Read

### 2.1 What is a dirty read?

A dirty read occurs when one transaction reads data modified by another transaction that has not yet committed.

The problem is that the modifying transaction may eventually roll back.

This means the reading transaction has observed data that never became committed database state.

### 2.2 Real-world example

Suppose a banking application has an account balance of ₹10,000.

Two transactions are executing.

**Transaction A:**

- Deducts ₹5,000.
- Has not committed yet.

**Transaction B:**

- Reads the account balance.
- Sees ₹5,000.

Then Transaction A encounters an error and rolls back.

The actual balance returns to ₹10,000.

But Transaction B has already read ₹5,000, which was never committed.

That is a dirty read.

### 2.3 Execution timeline

Initial balance:

```text
Account balance = ₹10,000
```

| Step | Transaction A            | Transaction B                             |
| ---- | ------------------------ | ----------------------------------------- |
| 1    | BEGIN                    |                                           |
| 2    | Update balance to ₹5,000 |                                           |
| 3    |                          | BEGIN                                     |
| 4    |                          | Read balance = ₹5,000                     |
| 5    | ROLLBACK                 |                                           |
| 6    |                          | Transaction B has already observed ₹5,000 |

Visual representation:

```text
Transaction A                  Transaction B
      |                               |
      v                               |
BEGIN                                 |
      |                               |
      v                               |
Update balance = 5,000                |
      |                               |
      |                               v
      |                             BEGIN
      |                               |
      |                               v
      |                         Read balance
      |                         = ₹5,000
      |                               |
      v                               |
ROLLBACK                              |
      |                               |
      v                               v
Balance = ₹10,000              Saw uncommitted
                               balance = ₹5,000
```

Transaction B read a value that was later rolled back.

### 2.4 Why is a dirty read dangerous?

Imagine Transaction B uses the dirty value to make another business decision.

For example:

1. Transaction A temporarily changes a customer's account status to `ACTIVE`.
2. Transaction B reads that status.
3. Transaction B grants the customer access.
4. Transaction A rolls back.
5. The customer was never actually activated.

Transaction B has made a decision using data that never became committed.

This can cause:

- Incorrect financial calculations.
- Invalid business decisions.
- Inconsistent application behavior.
- Incorrect reporting.

### 2.5 Can dirty reads happen in PostgreSQL?

PostgreSQL does not allow dirty reads.

Even when you request the `READ UNCOMMITTED` isolation level, PostgreSQL behaves as `READ COMMITTED`.

This means Transaction B cannot see Transaction A's uncommitted changes.

Other database systems may implement `READ UNCOMMITTED` differently.

**Key takeaway:** A dirty read means observing uncommitted data that may later be rolled back.

---

## 3. Non-Repeatable Read

### 3.1 What is a non-repeatable read?

A non-repeatable read occurs when a transaction reads the same row more than once and gets different values because another committed transaction modified that row between the reads.

The important distinction is:

- The first read returns one value.
- Another transaction commits an update.
- The second read returns a different value.

### 3.2 Real-world example

Suppose a product costs ₹1,000.

Transaction A wants to display the product price and calculate an invoice.

Transaction A reads the price:

```text
Price = ₹1,000
```

Meanwhile, Transaction B updates the product price to ₹1,200 and commits.

Transaction A reads the same product again.

Now it sees:

```text
Price = ₹1,200
```

The same transaction has observed two different committed values for the same row.

This is a non-repeatable read.

### 3.3 Execution timeline

Initial data:

| Product ID | Product |  Price |
| ---------: | ------- | -----: |
|        101 | Laptop  | ₹1,000 |

Transactions:

| Step | Transaction A             | Transaction B          |
| ---- | ------------------------- | ---------------------- |
| 1    | BEGIN                     |                        |
| 2    | Read price = ₹1,000       |                        |
| 3    |                           | BEGIN                  |
| 4    |                           | Update price to ₹1,200 |
| 5    |                           | COMMIT                 |
| 6    | Read price again = ₹1,200 |                        |

Visual representation:

```text
Transaction A                  Transaction B
      |                               |
      v                               |
BEGIN                                 |
      |                               |
      v                               |
Read price = ₹1,000                   |
      |                               |
      |                               v
      |                             BEGIN
      |                               |
      |                               v
      |                         Update price
      |                         = ₹1,200
      |                               |
      |                               v
      |                             COMMIT
      |                               |
      v                               |
Read price again                      |
      |                               |
      v                               |
Price = ₹1,200                        |
```

Transaction A read the same row twice but received different values.

### 3.4 Why is this dangerous?

Consider an order-processing application.

Transaction A:

1. Reads a product price of ₹1,000.
2. Calculates the total.
3. Reads the price again.
4. Gets ₹1,200.

Now the transaction may use inconsistent pricing information.

Other possible examples:

- Account balances changing during a report.
- Employee salary changing during payroll calculations.
- Product prices changing during order processing.
- Inventory values changing during stock calculations.

### 3.5 Important distinction

A non-repeatable read concerns an existing row whose values change.

Example:

```text
First read:  Product 101 price = ₹1,000
Second read: Product 101 price = ₹1,200
```

The same row exists in both reads, but its value has changed.

**Key takeaway:** A non-repeatable read occurs when the same transaction reads the same row multiple times and sees different committed values.

---

## 4. Phantom Read

### 4.1 What is a phantom read?

A phantom read occurs when a transaction executes the same query more than once and receives a different set of rows because another transaction has inserted, deleted, or modified rows that affect the query result.

The important distinction is that phantom reads concern the result set of a query, not simply a changed value in an existing row.

### 4.2 Real-world example

Suppose an application wants to find all products priced above ₹1,000.

Transaction A executes:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

Initial result:

|  id | product | price |
| --: | ------- | ----: |
| 101 | Laptop  | 65000 |
| 102 | Monitor | 12000 |

While Transaction A is running, Transaction B inserts another product:

```sql
INSERT INTO products (id, name, price)
VALUES (103, 'Keyboard', 2500);
```

Transaction B commits.

Transaction A executes the same query again.

Now the result is:

|  id | product  | price |
| --: | -------- | ----: |
| 101 | Laptop   | 65000 |
| 102 | Monitor  | 12000 |
| 103 | Keyboard |  2500 |

A new matching row has appeared.

This is a phantom read.

### 4.3 Execution timeline

| Step | Transaction A                       | Transaction B                |
| ---- | ----------------------------------- | ---------------------------- |
| 1    | BEGIN                               |                              |
| 2    | Query products above ₹1,000: 2 rows |                              |
| 3    |                                     | BEGIN                        |
| 4    |                                     | Insert product priced ₹2,500 |
| 5    |                                     | COMMIT                       |
| 6    | Run the same query again: 3 rows    |                              |

Visual representation:

```text
Transaction A                  Transaction B
      |                               |
      v                               |
BEGIN                                 |
      |                               |
      v                               |
SELECT price > 1000                   |
      |                               |
      v                               |
2 rows returned                       |
      |                               |
      |                               v
      |                             BEGIN
      |                               |
      |                               v
      |                         INSERT product
      |                         price = ₹2,500
      |                               |
      |                               v
      |                             COMMIT
      |                               |
      v                               |
SELECT price > 1000 again             |
      |                               |
      v                               |
3 rows returned                       |
```

A new row appeared in the repeated query result.

### 4.4 Phantom read vs non-repeatable read

These two anomalies are easy to confuse.

**Non-repeatable read:**

An existing row changes.

```text
First query:
Product 101 = ₹1,000

Second query:
Product 101 = ₹1,200
```

**Phantom read:**

The set of rows matching a query changes.

```text
First query:
Product 101
Product 102

Second query:
Product 101
Product 102
Product 103
```

### 4.5 Can phantom reads happen through DELETE?

Yes.

Suppose Transaction A executes:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

It receives three rows.

Transaction B deletes one matching product and commits.

When Transaction A runs the same query again, it receives only two rows.

This is also a phantom read because the result set has changed.

### 4.6 Can phantom reads happen through UPDATE?

Yes.

Suppose a product initially costs ₹800.

Transaction A queries:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

Transaction B updates that product's price to ₹1,500 and commits.

Transaction A repeats the query.

The product now appears in the result even though it did not previously match the condition.

An update can therefore change the membership of a query's result set.

### 4.7 Database-specific behavior

Phantom-read behavior depends on the isolation level and database implementation.

For example:

- PostgreSQL's `REPEATABLE READ` uses snapshot isolation and prevents phantom reads within a transaction's snapshot.
- PostgreSQL's `SERIALIZABLE` provides stronger guarantees and can abort transactions when concurrent execution cannot be safely serialized.
- InnoDB's `REPEATABLE READ` uses MVCC and locking mechanisms, including next-key locking in relevant cases, to control certain phantom scenarios.

We will examine these differences in Part 2D.

**Key takeaway:** A phantom read occurs when the set of rows returned by a repeated query changes due to concurrent committed operations.

---

## 5. Lost Update

### 5.1 What is a lost update?

A lost update occurs when two transactions read the same original value, independently calculate new values, and then one transaction overwrites the other's update.

The result is that one transaction's change is lost.

### 5.2 Real-world example

Suppose an account has a balance of ₹10,000.

Two transactions are running simultaneously.

Transaction A wants to deposit ₹2,000.

Transaction B wants to withdraw ₹1,000.

Expected result:

\[
10000 + 2000 - 1000 = 11000
\]

The correct final balance should be ₹11,000.

But suppose both transactions read the original balance before either update is committed.

**Transaction A:**

```text
Read balance = ₹10,000
Calculate new balance = ₹12,000
```

**Transaction B:**

```text
Read balance = ₹10,000
Calculate new balance = ₹9,000
```

Now Transaction A writes ₹12,000.

Then Transaction B writes ₹9,000.

Final result:

```text
Balance = ₹9,000
```

Transaction A's deposit of ₹2,000 has been lost.

### 5.3 Execution timeline

| Step | Transaction A          | Transaction B          |
| ---- | ---------------------- | ---------------------- |
| 1    | Read balance = ₹10,000 |                        |
| 2    |                        | Read balance = ₹10,000 |
| 3    | Calculate ₹12,000      |                        |
| 4    |                        | Calculate ₹9,000       |
| 5    | Write ₹12,000          |                        |
| 6    | COMMIT                 |                        |
| 7    |                        | Write ₹9,000           |
| 8    |                        | COMMIT                 |

Visual representation:

```text
Transaction A                  Transaction B
      |                               |
      v                               v
Read ₹10,000                    Read ₹10,000
      |                               |
      v                               v
Calculate ₹12,000               Calculate ₹9,000
      |                               |
      v                               |
Write ₹12,000                          |
      |                               |
      v                               |
COMMIT                                |
      |                               |
      |                               v
      |                         Write ₹9,000
      |                               |
      |                               v
      |                             COMMIT
      |                               |
      +---------------+---------------+
                      |
                      v
              Final balance:
                 ₹9,000
```

The deposit operation was overwritten.

### 5.4 Why is this dangerous?

Lost updates can cause:

- Incorrect account balances.
- Incorrect inventory counts.
- Overwritten user profile changes.
- Incorrect order quantities.
- Lost application settings.

This is especially important in applications where multiple requests can modify the same record.

### 5.5 A Node.js example

Consider this application code:

```javascript
const account = await db.query(
  "SELECT balance FROM accounts WHERE account_id = $1",
  [accountId],
);

const newBalance = account.rows[0].balance + amount;

await db.query("UPDATE accounts SET balance = $1 WHERE account_id = $2", [
  newBalance,
  accountId,
]);
```

This approach reads a value into application memory, calculates a new value, and writes it back.

Two requests can read the same original balance and overwrite each other's calculations.

### 5.6 Better approach: Atomic SQL update

Instead of reading the balance, calculating in JavaScript, and writing the result back, perform the calculation inside the SQL statement.

```sql
UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 1;
```

For a withdrawal:

```sql
UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1
  AND balance >= 1000;
```

The database performs the update as one statement.

Conflicting updates to the same row are coordinated by the database's concurrency-control mechanisms.

For the withdrawal example, check the affected-row count to determine whether the withdrawal succeeded.

This avoids the basic application-level read-modify-write race shown earlier.

**Important:** Atomic SQL updates are useful, but they do not solve every concurrency problem. More complex business operations may require transactions, row locks, optimistic concurrency control, or stronger isolation guarantees.

**Key takeaway:** A lost update happens when one transaction overwrites another transaction's change.

---

## 6. Comparing All Four Isolation Problems

This is the most important comparison in the chapter.

| Anomaly             | What happens?                              | Typical example                                       |
| ------------------- | ------------------------------------------ | ----------------------------------------------------- |
| Dirty Read          | Reads uncommitted data                     | Reads ₹5,000 before another transaction rolls it back |
| Non-Repeatable Read | Same row returns different values          | Product price changes from ₹1,000 to ₹1,200           |
| Phantom Read        | Same query returns a different set of rows | A new matching product appears                        |
| Lost Update         | One update overwrites another              | Two transactions modify the same balance              |

### Visual memory guide

```text
DIRTY READ
Read another transaction's uncommitted change.

NON-REPEATABLE READ
Read the same row twice and get different values.

PHANTOM READ
Repeat a query and get a different set of rows.

LOST UPDATE
One transaction overwrites another transaction's update.
```

---

## 7. Other Concurrency Anomalies Worth Knowing

The locked roadmap specifically covers four major isolation problems. Two additional terms are useful when studying database concurrency.

### 7.1 Dirty Write

A dirty write occurs when one transaction overwrites data written by another transaction before the first transaction commits.

Example:

```text
Initial balance = ₹10,000

Transaction A writes ₹8,000 but has not committed.

Transaction B writes ₹7,000 over A's uncommitted value.
```

This can create difficult recovery and rollback problems.

Database systems generally prevent dirty writes through their concurrency-control mechanisms.

### 7.2 Read Skew

Read skew occurs when a transaction reads related values from different points in time and observes a combination that never represented one consistent database snapshot.

Example:

Suppose a banking system has:

```text
Account A = ₹10,000
Account B = ₹5,000
Total     = ₹15,000
```

Transaction A transfers ₹2,000 from Account A to Account B.

Transaction B reads Account A before the transfer commits:

```text
Account A = ₹10,000
```

Then the transfer commits.

Transaction B reads Account B afterward:

```text
Account B = ₹7,000
```

Transaction B calculates:

\[
10000 + 7000 = 17000
\]

But the actual total is ₹15,000.

Transaction B has combined values from different points in time.

This is an example of read skew.

Snapshot-based isolation can prevent this type of inconsistent cross-row observation by ensuring the transaction reads from a consistent snapshot.

---

## 8. Why Do These Problems Occur?

The root cause is the interaction between concurrent transactions.

Consider the following operations:

```text
Transaction A:
    Read value
    Calculate
    Write value

Transaction B:
    Read value
    Calculate
    Write value
```

If these operations are interleaved without suitable coordination, unexpected results can occur.

The database needs a mechanism to control the execution.

Common approaches include:

### 8.1 Locking

A database can acquire locks on data to prevent conflicting operations.

For example:

```sql
BEGIN;

SELECT balance
FROM accounts
WHERE account_id = 1
FOR UPDATE;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;

COMMIT;
```

`FOR UPDATE` requests a row-level lock in PostgreSQL.

Another transaction trying to acquire a conflicting row lock must generally wait until the current transaction releases it.

### 8.2 MVCC

MVCC stands for Multi-Version Concurrency Control.

Instead of making every reader wait for every writer, the database maintains multiple versions of records.

This allows transactions to read an appropriate version while other transactions modify data.

For example:

```text
Version 1: Balance = ₹10,000
Version 2: Balance = ₹12,000
Version 3: Balance = ₹11,000
```

Different transactions may see different versions depending on their snapshots and isolation guarantees.

### 8.3 Isolation levels

Databases provide isolation levels that define which anomalies are permitted or prevented.

The standard SQL isolation levels are:

- Read Uncommitted.
- Read Committed.
- Repeatable Read.
- Serializable.

The choice of isolation level affects concurrency, visibility, and transaction behavior.

We will cover this in Part 2D.

---

## 9. Important PostgreSQL Behavior

Since PostgreSQL is a practical database for backend development, understand how it behaves.

| Anomaly             | PostgreSQL behavior                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirty Read          | Prevented, even under READ UNCOMMITTED                                                                                                                |
| Non-Repeatable Read | Possible under READ COMMITTED; prevented within a REPEATABLE READ transaction's snapshot                                                              |
| Phantom Read        | Possible under READ COMMITTED; prevented within a REPEATABLE READ transaction's snapshot                                                              |
| Lost Update         | Conflicting writes are coordinated, but application-level read-modify-write logic can still produce lost-update-style behavior under weaker isolation |

A few important details:

1. PostgreSQL uses MVCC.
2. `READ COMMITTED` is the default isolation level.
3. `REPEATABLE READ` provides snapshot isolation.
4. `SERIALIZABLE` provides stronger guarantees using Serializable Snapshot Isolation and may abort transactions that need to be retried.
5. PostgreSQL's behavior should not be assumed to match every other relational database.

The exact behavior of isolation levels will be covered in Part 2D.

---

## 10. Common Misconceptions

### Misconception 1: Dirty read and non-repeatable read are the same.

Incorrect.

A dirty read observes uncommitted data.

A non-repeatable read observes a different committed value for the same row on a later read.

### Misconception 2: Phantom read means a row's value changed.

Incorrect.

A phantom read concerns changes in the set of rows returned by a repeated query.

### Misconception 3: Lost update and non-repeatable read are the same.

Incorrect.

A non-repeatable read concerns observing different values across reads.

A lost update concerns one transaction overwriting another transaction's modification.

### Misconception 4: Transactions automatically prevent every isolation problem.

Incorrect.

Transactions group operations, but the isolation level and concurrency-control mechanisms determine how concurrent transactions interact.

### Misconception 5: PostgreSQL supports dirty reads at READ UNCOMMITTED.

Incorrect.

PostgreSQL treats READ UNCOMMITTED as READ COMMITTED.

### Misconception 6: MVCC means databases never use locks.

Incorrect.

MVCC reduces unnecessary blocking between readers and writers, but databases still use locks for conflicting modifications and other operations.

### Misconception 7: Atomic SQL updates eliminate every lost update problem.

Incorrect.

They eliminate the specific read-modify-write race shown in the basic example, but complex multi-step transactions still require suitable concurrency control.

---

## 11. Interview Questions

### Q1. What is a dirty read?

A dirty read occurs when one transaction reads changes made by another transaction before those changes are committed.

### Q2. What is a non-repeatable read?

A non-repeatable read occurs when a transaction reads the same row multiple times and receives different committed values because another transaction modified that row.

### Q3. What is a phantom read?

A phantom read occurs when a transaction executes the same query multiple times and gets a different set of rows because concurrent committed operations changed which rows match the query.

### Q4. What is a lost update?

A lost update occurs when one transaction overwrites another transaction's update, causing one modification to be lost.

### Q5. What is the difference between a phantom read and a non-repeatable read?

A non-repeatable read concerns changes to an existing row's values. A phantom read concerns changes in the set of rows matching a query.

### Q6. Can a phantom read happen because of an UPDATE?

Yes. An UPDATE can cause a row to start or stop matching a query condition, changing the result set.

### Q7. Can dirty reads happen in PostgreSQL?

No. PostgreSQL prevents dirty reads, including when READ UNCOMMITTED is requested.

### Q8. How can you prevent a lost update?

Possible approaches include:

- Atomic SQL updates.
- Row-level locking.
- Optimistic concurrency control.
- Appropriate transaction isolation.

The right choice depends on the application and operation.

### Q9. What is read skew?

Read skew occurs when a transaction observes related values from different points in time, producing a combination that may never have existed as one consistent database state.

### Q10. Does MVCC prevent all concurrency anomalies?

No. MVCC provides version-based concurrency control, but the isolation level determines which anomalies are prevented. Some systems also use locking or transaction retries.

### Q11. What is dirty write?

A dirty write occurs when one transaction overwrites another transaction's uncommitted modification.

### Q12. Why do isolation levels exist?

Isolation levels let applications choose the concurrency guarantees they need while balancing correctness, contention, and performance.

---

## 12. Chapter Summary

| Problem             | Definition                                          | Example                                                     |
| ------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| Dirty Read          | Reading uncommitted data                            | Reading a balance that another transaction later rolls back |
| Non-Repeatable Read | Same row produces different values                  | Product price changes between reads                         |
| Phantom Read        | Same query produces a different row set             | New product matches a repeated query                        |
| Lost Update         | One update overwrites another                       | Concurrent balance modifications                            |
| Dirty Write         | Overwriting another transaction's uncommitted write | Transaction B overwrites Transaction A's uncommitted value  |
| Read Skew           | Reading related values from inconsistent snapshots  | Account values read from different points in time           |

### Final takeaway

Isolation problems occur because transactions execute concurrently and their operations can interfere.

The four major anomalies to remember are:

1. **Dirty Read:** Reading uncommitted data.
2. **Non-Repeatable Read:** Reading the same row twice and seeing different values.
3. **Phantom Read:** Repeating a query and seeing a different set of rows.
4. **Lost Update:** Overwriting another transaction's change.

Understanding these problems is necessary before choosing an appropriate transaction isolation level.

The next chapter explains how databases use different isolation levels to control these anomalies.
