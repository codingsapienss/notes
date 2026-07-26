---
sidebar_label: Transactions
sidebar_position: 1
---

# Transactions

## 1. What Is a Transaction?

A **transaction** is a sequence of one or more database operations treated as a single logical unit of work.

These operations may include:

- Inserting records.
- Updating records.
- Deleting records.
- Reading records.
- Performing calculations using retrieved data.

A transaction allows multiple operations to be managed together.

Consider a banking application.

Suppose Account A has ₹10,000 and Account B has ₹5,000.

We want to transfer ₹2,000 from Account A to Account B.

Two operations are required:

1. Deduct ₹2,000 from Account A.
2. Add ₹2,000 to Account B.

The expected result is:

| Account   |  Before |  After |
| --------- | ------: | -----: |
| Account A | ₹10,000 | ₹8,000 |
| Account B |  ₹5,000 | ₹7,000 |

Both operations represent one business action: transferring ₹2,000.

But what happens if the first operation succeeds and the second operation fails?

Account A would have ₹8,000, while Account B would still have ₹5,000.

The money would effectively disappear from the accounts.

This is precisely the kind of problem transactions are designed to prevent.

### Without a transaction

```text
Account A: ₹10,000
Account B: ₹5,000
       |
       v
Deduct ₹2,000 from Account A
       |
       v
Account A: ₹8,000
       |
       v
Add ₹2,000 to Account B
       |
       X
       |
    Operation fails
       |
       v
Account A: ₹8,000
Account B: ₹5,000

Result: Inconsistent financial data
```

### With a transaction

```text
          BEGIN TRANSACTION
                 |
                 v
       Deduct ₹2,000 from A
                 |
                 v
        Add ₹2,000 to B
                 |
          +------+------+
          |             |
       Success         Failure
          |             |
          v             v
        COMMIT        ROLLBACK
          |             |
          v             v
    Both changes    No changes from
    are saved       this transaction
```

The database treats both operations as one logical unit.

If everything succeeds, the transaction commits.

If an operation fails and the transaction is rolled back, the database reverses the transaction's uncommitted changes.

---

## 2. Why Do We Need Transactions?

Transactions are important whenever a business operation involves multiple database operations that must be coordinated.

Let's understand some practical situations.

### 2.1 Banking: Money transfer

Suppose we transfer ₹2,000 between two accounts.

```text
Account A: ₹10,000
Account B: ₹5,000
```

Required operations:

```sql
UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 2;
```

Both updates must succeed together.

If the debit succeeds but the credit fails, the transaction must not be allowed to remain partially completed.

### 2.2 E-commerce: Order placement

Suppose a customer purchases a product.

The application needs to:

1. Create an order.
2. Add order items.
3. Reduce product inventory.
4. Create an associated payment record or payment intent record, depending on the payment architecture.

Some of these database operations may need to succeed or fail together.

For example, creating an order while failing to reserve or allocate the required inventory could leave the application in an inconsistent state.

A transaction can group the relevant database operations.

**Important:** An external payment gateway is not part of an ordinary PostgreSQL transaction. Calling a payment provider and updating a local database require additional distributed-workflow techniques, which we will discuss in the appropriate system-design context.

### 2.3 Wallet: Debit and credit

Suppose a user sends ₹500 to another user's wallet.

Required operations:

- Deduct ₹500 from the sender.
- Add ₹500 to the receiver.
- Record the transfer.

These changes should be coordinated so that the database does not retain only some of them.

### 2.4 Employee management

Suppose an employee is transferred from Department A to Department B.

The application might need to:

1. Update the employee's department.
2. Update department-related records.
3. Record the transfer history.

If the operation fails halfway, the database could contain conflicting information.

A transaction can group the relevant changes.

### 2.5 Summary

| Application         | Operations that may need to be grouped         |
| ------------------- | ---------------------------------------------- |
| Banking             | Debit one account and credit another           |
| E-commerce          | Create order and update inventory              |
| Wallet              | Debit sender, credit receiver, record transfer |
| Employee management | Update department and transfer history         |
| Ticket booking      | Reserve a seat and create booking details      |

**The key idea:** Transactions are needed when multiple database operations form one logical business operation.

---

## 3. How Does a Transaction Work?

A transaction has a beginning, a sequence of operations, and an ending.

The ending is generally one of two outcomes:

- **COMMIT:** Confirm the transaction's changes.
- **ROLLBACK:** Abort the transaction and undo its uncommitted changes.

A simplified transaction lifecycle:

```text
        START TRANSACTION
                |
                v
        Execute SQL operations
                |
                v
       Are operations successful?
                |
          +-----+-----+
          |           |
         Yes          No
          |           |
          v           v
        COMMIT      ROLLBACK
          |           |
          v           v
      Changes      Uncommitted
      committed    changes undone
```

Let's understand each operation.

### 3.1 BEGIN

`BEGIN` starts a transaction in PostgreSQL.

Example:

```sql
BEGIN;
```

After this command, subsequent database statements execute within the transaction until it is committed or rolled back.

### 3.2 Execute operations

We can now execute multiple SQL statements.

Example:

```sql
UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 2;
```

These updates are part of the same transaction.

### 3.3 COMMIT

`COMMIT` successfully completes the transaction.

```sql
COMMIT;
```

The database confirms the transaction's changes.

Conceptually:

```text
BEGIN
  |
  v
UPDATE Account A
  |
  v
UPDATE Account B
  |
  v
COMMIT
  |
  v
Transaction completed
```

After a successful commit, the changes become committed database state.

### 3.4 ROLLBACK

`ROLLBACK` aborts the current transaction and reverses its uncommitted database changes.

```sql
ROLLBACK;
```

Example:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 999;

ROLLBACK;
```

Suppose account 999 does not exist.

The second update may execute successfully but affect zero rows. That is an important distinction: SQL does not automatically treat an update affecting zero rows as an error.

For this example, imagine the application checks that the required account exists and decides to abort the transaction.

After rollback, the first update is undone.

The database returns to the state it had before this transaction began, with respect to the transaction's changes.

**Important:** A rollback does not undo changes that were already committed by an earlier transaction.

---

## 4. Practical Example: Money Transfer in PostgreSQL

Let's implement a complete transaction.

### 4.1 Create the accounts table

```sql
CREATE TABLE accounts (
    account_id INTEGER PRIMARY KEY,
    account_holder VARCHAR(100),
    balance NUMERIC(12, 2) NOT NULL
        CHECK (balance >= 0)
);
```

### 4.2 Insert sample accounts

```sql
INSERT INTO accounts
    (account_id, account_holder, balance)
VALUES
    (1, 'Prashant', 10000),
    (2, 'Rahul', 5000);
```

Current data:

| account_id | account_holder | balance |
| ---------: | -------------- | ------: |
|          1 | Prashant       |   10000 |
|          2 | Rahul          |    5000 |

### 4.3 Start the transaction

```sql
BEGIN;
```

### 4.4 Deduct money from Account A

```sql
UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;
```

Account A now has a balance of ₹8,000 within the transaction.

### 4.5 Add money to Account B

```sql
UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 2;
```

Account B now has a balance of ₹7,000 within the transaction.

### 4.6 Commit

```sql
COMMIT;
```

The final database state is:

| account_id | account_holder | balance |
| ---------: | -------------- | ------: |
|          1 | Prashant       |    8000 |
|          2 | Rahul          |    7000 |

The transaction has completed successfully.

### Complete SQL

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

This example demonstrates how multiple SQL statements can be grouped into one transaction.

**Production consideration:** This example illustrates transaction boundaries, not a complete safe money-transfer implementation. A real transfer should also validate the source and destination accounts, check sufficient funds, verify that the expected rows were updated, and handle concurrent transfers safely. We will study the relevant concurrency and isolation mechanisms in later chapters.

---

## 5. What Happens When an Operation Fails?

Let's consider a failure scenario.

Starting balances:

| Account   | Balance |
| --------- | ------: |
| Account A | ₹10,000 |
| Account B |  ₹5,000 |

We execute:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 1;

-- Suppose a constraint violation or another SQL error occurs here.

UPDATE accounts
SET balance = balance + 2000
WHERE account_id = 2;

COMMIT;
```

The exact behavior depends on the error and database system.

In PostgreSQL, an ordinary statement error inside an explicit transaction places the transaction in a failed state. Subsequent ordinary statements are rejected until the transaction is rolled back or rolled back to a suitable savepoint.

Therefore, a `COMMIT` issued while the transaction is in that failed state does not commit the preceding changes; PostgreSQL effectively aborts the transaction.

The application should explicitly handle the error and issue a rollback when appropriate.

```sql
ROLLBACK;
```

Final state:

| Account   | Balance |
| --------- | ------: |
| Account A | ₹10,000 |
| Account B |  ₹5,000 |

The uncommitted deduction is undone.

### Important distinction: An error vs a business-rule failure

Not every unsuccessful business operation automatically creates a SQL error.

For example:

```sql
UPDATE accounts
SET balance = balance - 2000
WHERE account_id = 999;
```

If account 999 does not exist, PostgreSQL normally reports that zero rows were updated. It does not automatically abort the transaction.

The application must inspect the affected-row count and decide whether to continue or roll back.

This distinction is important when implementing reliable transaction logic.

---

## 6. Explicit vs Implicit Transactions

Transactions can be started explicitly by an application or handled implicitly by the database.

### 6.1 Explicit transactions

An explicit transaction is one that the application starts and ends using transaction-control commands.

Example:

```sql
BEGIN;

INSERT INTO users (id, name, email)
VALUES (1, 'Prashant', 'prashant@example.com');

UPDATE users
SET name = 'Prashant Sharma'
WHERE id = 1;

COMMIT;
```

Both operations belong to one transaction.

The application controls when the transaction commits or rolls back.

This is useful when multiple statements must be coordinated.

### 6.2 Implicit transactions

A database can also execute individual statements as their own transactions.

For example, in PostgreSQL's normal autocommit mode:

```sql
INSERT INTO users (id, name, email)
VALUES (1, 'Prashant', 'prashant@example.com');
```

If this statement succeeds, it is committed automatically.

There is no need to explicitly write:

```sql
BEGIN;
COMMIT;
```

Each standalone statement is effectively executed within its own transaction.

### 6.3 Explicit vs implicit transactions

| Explicit transaction                        | Implicit transaction / autocommit                        |
| ------------------------------------------- | -------------------------------------------------------- |
| Application explicitly starts a transaction | Database handles the statement transaction automatically |
| Multiple statements can be grouped          | Each standalone statement is committed independently     |
| Application controls commit and rollback    | Each statement normally commits automatically on success |
| Useful for multi-step operations            | Useful for independent operations                        |

**Important:** Autocommit behavior depends on the database client and connection configuration. PostgreSQL's `psql` normally operates in autocommit mode unless configured otherwise.

---

## 7. Transactions in Node.js with PostgreSQL

As a backend developer, you will frequently use transactions through database drivers rather than writing SQL manually in a database console.

Let's see how this works using the Node.js `pg` package.

### 7.1 Basic transaction implementation

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

    return {
      success: true,
      message: "Transfer completed",
    };
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
}
```

### 7.2 Understanding the code

**Step 1: Get a database connection**

```javascript
const client = await pool.connect();
```

A transaction must use the same database connection for all its statements.

This is important because transaction state belongs to the database session/connection.

**Step 2: Start the transaction**

```javascript
await client.query("BEGIN");
```

The database begins a transaction on this connection.

**Step 3: Execute database operations**

```javascript
await client.query(
  `UPDATE accounts
     SET balance = balance - $1
     WHERE account_id = $2`,
  [amount, fromId],
);
```

The update is executed inside the active transaction.

**Step 4: Commit**

```javascript
await client.query("COMMIT");
```

If all required operations and validations succeed, commit the transaction.

**Step 5: Roll back on failure**

```javascript
await client.query("ROLLBACK");
```

If an operation fails, roll back the transaction.

**Step 6: Release the connection**

```javascript
client.release();
```

The connection is returned to the connection pool.

### 7.3 Why must we use the same connection?

Consider:

```javascript
await pool.query("BEGIN");

await pool.query("UPDATE accounts ...");

await pool.query("COMMIT");
```

This is unsafe for a transaction using a connection pool.

The pool may execute these queries using different connections.

A transaction belongs to one database session. If the statements execute on different connections, they are not guaranteed to be part of the same transaction.

The correct approach is:

```javascript
const client = await pool.connect();

try {
  await client.query("BEGIN");

  await client.query("UPDATE ...");

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

**Remember:** Always use one checked-out connection for the complete transaction.

### 7.4 Production improvements

The previous example demonstrates transaction handling, but it is not sufficient for a production financial transfer.

A robust implementation should also:

- Validate that the amount is positive.
- Verify that the source and destination accounts exist.
- Check that sufficient funds are available.
- Verify the affected-row counts.
- Prevent unsafe concurrent withdrawals.
- Handle rollback failures without hiding the original error.
- Use an appropriate isolation or locking strategy.
- Record the transfer in a durable transaction ledger.

We will cover concurrency and isolation in the following chapters.

---

## 8. SAVEPOINT — Partial Rollback Inside a Transaction

Sometimes we want to undo only part of a transaction rather than rolling back everything.

A database can provide a mechanism called a **SAVEPOINT**.

A savepoint marks a position inside an active transaction.

Example:

```sql
BEGIN;

INSERT INTO users (id, name, email)
VALUES (1, 'Prashant', 'prashant@example.com');

SAVEPOINT user_created;

INSERT INTO users (id, name, email)
VALUES (2, 'Rahul', 'rahul@example.com');

ROLLBACK TO SAVEPOINT user_created;

COMMIT;
```

Conceptually:

```text
BEGIN
  |
  v
Insert Prashant
  |
  v
SAVEPOINT user_created
  |
  v
Insert Rahul
  |
  v
ROLLBACK TO SAVEPOINT
  |
  v
Rahul's insertion is undone
  |
  v
COMMIT
  |
  v
Prashant remains inserted
```

After the rollback to the savepoint:

- Prashant's insertion remains part of the transaction.
- Rahul's insertion is undone.
- The outer transaction remains active.
- `COMMIT` commits the remaining changes.

### 8.1 Why are savepoints useful?

They are useful when a transaction contains several operations, and some optional operations can fail without requiring the entire transaction to be abandoned.

For example:

An application may create an order and then attempt an optional operation such as applying a promotional benefit.

If that optional operation fails, the application might roll back to a savepoint and continue with the order, provided its business rules permit that behavior.

### 8.2 SAVEPOINT vs ROLLBACK

| ROLLBACK                                     | ROLLBACK TO SAVEPOINT                 |
| -------------------------------------------- | ------------------------------------- |
| Aborts the current transaction               | Undoes changes made after a savepoint |
| Ends the transaction                         | Keeps the outer transaction active    |
| Reverses all uncommitted transaction changes | Reverses only part of the transaction |

---

## 9. Transaction States

A transaction moves through different states during its lifecycle.

A useful conceptual model includes:

### 9.1 Active

The transaction is currently executing database operations.

Example:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;
```

The transaction is active.

### 9.2 Partially committed

The transaction has executed its final statement and is in the process of completing the commit.

The database may still need to perform work to make the commit durable.

This is a conceptual transaction state used in database theory.

### 9.3 Committed

The transaction has successfully completed.

Its changes are committed database state.

```sql
COMMIT;
```

### 9.4 Failed

An operation has failed, and the transaction cannot continue normally.

In PostgreSQL, an ordinary statement error inside a transaction generally places the transaction in a failed state.

### 9.5 Aborted

The transaction has been rolled back.

Its uncommitted changes have been undone.

```sql
ROLLBACK;
```

### 9.6 Terminated

The transaction has completed and is no longer active.

### Transaction state diagram

```text
             START
               |
               v
             ACTIVE
               |
        +------+------+
        |             |
     Success        Failure
        |             |
        v             v
 PARTIALLY          FAILED
 COMMITTED            |
        |             |
        v             v
    COMMITTED       ABORTED
        |             |
        +------+------+
               |
               v
           TERMINATED
```

This is a conceptual state model. Actual database implementations may use different internal state representations.

---

## 10. Transaction Boundaries and Autocommit

A transaction boundary determines which operations belong to the same transaction.

Consider:

```sql
BEGIN;

INSERT INTO orders (id, user_id, total_amount)
VALUES (101, 1, 2500);

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (101, 10, 2, 1250);

COMMIT;
```

Both inserts belong to the same transaction.

Now consider:

```sql
INSERT INTO orders (id, user_id, total_amount)
VALUES (101, 1, 2500);

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (101, 10, 2, 1250);
```

Under PostgreSQL's normal autocommit behavior, each statement is committed independently.

If the first insert succeeds and the second fails, the order record can remain without its corresponding order item.

That may violate the application's business requirements.

The correct transaction boundary should include all operations that must succeed or fail together.

**Design principle:** A transaction should be large enough to preserve the business operation's required consistency, but not unnecessarily long.

Long-running transactions can hold resources, increase contention, and delay cleanup of old row versions in MVCC-based databases.

---

## 11. What Does a Transaction Actually Guarantee?

Transactions are commonly associated with four important properties:

1. Atomicity.
2. Consistency.
3. Isolation.
4. Durability.

Together, these are known as **ACID properties**.

For now, understand the high-level idea:

| Property    | Basic meaning                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Atomicity   | All required transaction changes succeed together, or the transaction is rolled back               |
| Consistency | A transaction preserves the database's defined integrity rules                                     |
| Isolation   | Concurrent transactions are coordinated according to the selected isolation guarantees             |
| Durability  | Committed changes are protected against failures according to the database's durability guarantees |

We will study all four properties in detail in **Part 2B — ACID Properties**.

For now, remember that `BEGIN`, `COMMIT`, and `ROLLBACK` control transaction boundaries. They do not, by themselves, explain every guarantee that a database provides.

---

## 12. Common Transaction Mistakes

### Mistake 1: Forgetting to commit

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;
```

If the transaction is never committed or rolled back, it may remain open.

An open transaction can hold locks and other resources.

### Mistake 2: Forgetting to roll back after an error

Applications should handle transaction failures explicitly.

Leaving a failed transaction open can prevent subsequent operations on that connection from executing normally.

### Mistake 3: Using different connections for transaction statements

```javascript
await pool.query("BEGIN");
await pool.query("UPDATE ...");
await pool.query("COMMIT");
```

This does not guarantee that all statements use the same database session.

Use one checked-out connection.

### Mistake 4: Keeping transactions open for too long

Avoid performing unnecessary work inside a transaction.

For example:

```text
BEGIN
  |
  v
Update database
  |
  v
Call external API
  |
  v
Wait 30 seconds
  |
  v
Commit
```

The external API call can take time or fail.

Keeping a database transaction open during that wait may unnecessarily hold locks or other resources.

Prefer keeping database transactions short and focused.

### Mistake 5: Assuming every unsuccessful query causes rollback

An update affecting zero rows is not necessarily an SQL error.

Applications must inspect results and validate business conditions.

### Mistake 6: Assuming a database transaction includes external systems

A PostgreSQL transaction does not automatically include:

- A payment gateway.
- An email service.
- A third-party API.
- An external message broker.

Those systems require additional coordination patterns.

---

## 13. Interview Questions

### Q1. What is a database transaction?

A transaction is a sequence of database operations treated as one logical unit of work.

### Q2. Why do we need transactions?

Transactions help ensure that related database operations are coordinated and do not leave partially completed changes when the transaction is aborted.

### Q3. What is the difference between COMMIT and ROLLBACK?

`COMMIT` completes the transaction and saves its changes. `ROLLBACK` aborts the transaction and undoes its uncommitted changes.

### Q4. What is the purpose of BEGIN?

`BEGIN` explicitly starts a transaction.

### Q5. What is autocommit?

Autocommit is a mode in which individual statements are committed automatically after successful execution unless an explicit transaction is active.

### Q6. What happens if a transaction fails halfway?

The transaction should be rolled back so that its uncommitted changes are not retained. The exact failure handling depends on the database and the type of error.

### Q7. What is a SAVEPOINT?

A savepoint marks a position inside a transaction so that changes made after it can be rolled back without aborting the entire transaction.

### Q8. Can a transaction contain multiple SQL statements?

Yes. A transaction can contain multiple SQL statements that are managed as one logical unit.

### Q9. Why must a Node.js PostgreSQL transaction use the same connection?

Transaction state belongs to a database session. Using different pooled connections can cause statements to execute in different transactions.

### Q10. Does COMMIT guarantee that an external payment API call also succeeded?

No. A database transaction controls database operations. External systems require separate coordination mechanisms.

### Q11. Can a transaction remain open indefinitely?

It can remain open if the application fails to commit or roll it back, but this is undesirable because it can hold resources and interfere with other database operations.

### Q12. What are the four ACID properties?

Atomicity, Consistency, Isolation, and Durability.

---

## 14. Chapter Summary

| Concept               | Key point                                                |
| --------------------- | -------------------------------------------------------- |
| Transaction           | Group of database operations treated as one logical unit |
| BEGIN                 | Starts an explicit transaction                           |
| COMMIT                | Completes a transaction                                  |
| ROLLBACK              | Aborts a transaction and undoes uncommitted changes      |
| Explicit transaction  | Started and controlled by application commands           |
| Implicit transaction  | Individual statements managed automatically              |
| Autocommit            | Automatically commits successful standalone statements   |
| SAVEPOINT             | Marks a position inside a transaction                    |
| ROLLBACK TO SAVEPOINT | Undoes changes after a savepoint                         |
| Transaction boundary  | Defines which operations belong together                 |
| Active state          | Transaction is executing                                 |
| Committed state       | Transaction completed successfully                       |
| Failed state          | Transaction cannot continue normally                     |
| Aborted state         | Transaction has been rolled back                         |

### Final takeaway

A transaction is a fundamental mechanism for managing related database operations as one logical unit.

Consider the money-transfer example:

- Deduct money from Account A.
- Add money to Account B.
- Commit only when the required operations succeed.
- Roll back if the transaction must be abandoned.

Without transaction management, applications would have to handle partially completed database operations themselves, creating substantial risks of inconsistent data.

Understanding transactions is the foundation for the next chapter, where we will study the four ACID properties that define the guarantees expected from reliable transaction processing.
