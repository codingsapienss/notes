---
sidebar_label: "ACID Properties in PostgreSQL"
sidebar_position: 1
---

# ACID Properties in PostgreSQL

## 1. Introduction

ACID is a set of four properties that define reliable database transactions.

ACID stands for:

- **A — Atomicity**
- **C — Consistency**
- **I — Isolation**
- **D — Durability**

These properties help ensure that database transactions remain reliable even when errors, concurrent operations or system failures occur.

Consider an e-commerce application where a customer places an order and pays for it.

The database must ensure that:

- Related operations succeed or fail together.
- Database constraints remain satisfied.
- Concurrent transactions do not produce invalid results.
- Committed changes survive system failures.

ACID provides the foundation for achieving these guarantees.

---

## 2. Atomicity

Atomicity means **all operations in a transaction succeed together, or none of their database changes are committed.**

A transaction should not leave behind a partially completed operation.

### Example: Bank transfer

Suppose:

| Account   | Initial balance |
| --------- | --------------: |
| Account A |         ₹10,000 |
| Account B |          ₹5,000 |

Transfer ₹2,000 from A to B.

Two operations are required:

1. Deduct ₹2,000 from A.
2. Add ₹2,000 to B.

### Without a transaction

```sql
UPDATE bank_accounts
SET balance = balance - 2000
WHERE account_id = 1;

UPDATE bank_accounts
SET balance = balance + 2000
WHERE account_id = 2;
```

Suppose the first operation succeeds but the second fails.

Account A loses ₹2,000, but account B does not receive it.

This creates an inconsistent business result.

### With a transaction

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

If an operation fails, the application should roll back the transaction.

```sql
ROLLBACK;
```

### Result

<text>
| Account | Before | After successful transfer |
|---|---:|---:|
| A | ₹10,000 | ₹8,000 |
| B | ₹5,000 | ₹7,000 |
</text>

If the transaction rolls back, both accounts retain their original committed balances.

**Important:** Atomicity applies to database transaction changes. It does not automatically reverse external actions such as payment gateway requests, emails or messages already sent.

---

## 3. Consistency

Consistency means a transaction must preserve the database's defined integrity rules.

A transaction should move the database from one valid state to another valid state.

PostgreSQL helps enforce consistency using:

- PRIMARY KEY constraints.
- FOREIGN KEY constraints.
- UNIQUE constraints.
- NOT NULL constraints.
- CHECK constraints.
- Exclusion constraints.
- Triggers and other application-defined rules.

### Example: Product price

Suppose a product's price must never be negative.

Create a CHECK constraint:

```sql
ALTER TABLE products
ADD CONSTRAINT chk_products_price
CHECK (price >= 0);
```

Now:

```sql
UPDATE products
SET price = 1500
WHERE product_id = 101;
```

This is valid.

But:

```sql
UPDATE products
SET price = -500
WHERE product_id = 101;
```

PostgreSQL rejects this operation because it violates the constraint.

### Example: Foreign key consistency

Suppose every order must reference an existing customer.

```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    total_amount NUMERIC(12, 2) NOT NULL
);
```

This prevents inserting an order with a non-NULL customer_id that does not exist in the customers table.

### Important distinction

Consistency does not mean PostgreSQL automatically understands every business rule.

For example, a CHECK constraint can validate a row's price, but a rule such as:

"Customers cannot spend more than their available account balance"

requires appropriate transactional logic and concurrency control.

**Rule:** Database constraints enforce defined integrity rules; application logic and transaction design must handle business rules that constraints alone cannot express.

---

## 4. Isolation

Isolation means concurrent transactions should not interfere with each other in ways that violate the guarantees of the selected isolation level.

Multiple users can access and modify the same database simultaneously.

For example:

- Customer A places an order.
- Customer B purchases the same product.
- An administrator updates product inventory.
- A background process processes payments.

These operations may overlap.

Without appropriate concurrency control, transactions can observe or produce problematic results.

### Example: Concurrent inventory updates

Suppose a product has 10 units in stock.

Two customers attempt to purchase 7 units each.

If both transactions independently read the initial stock of 10, both may believe the purchase is possible.

A simple unsafe workflow is:

```sql
SELECT stock_quantity
FROM products
WHERE product_id = 101;
```

Then each transaction decides whether to purchase.

The problem is that the read and subsequent update are separate operations, and another transaction may modify inventory between them.

### Better: Atomic conditional update

Assuming `stock_quantity` is a proposed extension to the supplied TechBazaar schema:

```sql
UPDATE products
SET stock_quantity = stock_quantity - 7
WHERE product_id = 101
  AND stock_quantity >= 7
RETURNING stock_quantity;
```

The application checks whether one row was returned.

- One returned row: inventory was successfully reserved.
- No returned row: the product did not have sufficient inventory or did not exist.

PostgreSQL performs this conditional update atomically for the row.

For a larger order transaction, combine this operation with the order and order-item inserts, committing only if inventory reservation succeeds.

### Important

Isolation is not simply "only one transaction can execute at a time."

PostgreSQL supports concurrent transactions using MVCC and locking. The selected isolation level determines which concurrent behaviors are permitted.

Detailed isolation levels and concurrency anomalies are covered in Part 14C.

---

## 5. Durability

Durability means that once a transaction is successfully committed, its changes are preserved even if the database server crashes afterward.

PostgreSQL provides durability primarily through Write-Ahead Logging (WAL).

### What is WAL?

WAL stands for Write-Ahead Log.

PostgreSQL records changes in WAL before the corresponding modified data pages need to be written to their final locations in the database files.

This allows PostgreSQL to recover committed changes after a crash.

### Simplified process

1. A transaction modifies database records.
2. PostgreSQL generates corresponding WAL records.
3. Required WAL is flushed according to the commit durability configuration.
4. PostgreSQL confirms the commit.
5. Modified data pages can be written to their final locations later.

### Example

```sql
BEGIN;

UPDATE products
SET price = 1800
WHERE product_id = 101;

COMMIT;
```

After a successful durable commit, PostgreSQL can recover the committed change following a crash using WAL.

### Important

PostgreSQL's durability guarantees depend on configuration and the storage system honoring the required flush operations.

For example, disabling `fsync` weakens crash-safety guarantees.

Asynchronous commit settings can also allow a transaction to be acknowledged before its WAL record is durably flushed.

---

## 6. All Four ACID Properties Together

Consider an order placement transaction.

The application needs to:

1. Create an order.
2. Insert order items.
3. Reduce inventory.
4. Record payment information.

| ACID property | How it applies                                                                   |
| ------------- | -------------------------------------------------------------------------------- |
| Atomicity     | Related database operations succeed or roll back together                        |
| Consistency   | Constraints and business rules remain satisfied                                  |
| Isolation     | Concurrent transactions are controlled according to the selected isolation level |
| Durability    | Committed changes survive recoverable server failures                            |

### Example transaction

The following example assumes `stock_quantity` is a proposed extension to the products table.

```sql
BEGIN;

-- 1. Create order
INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (
    101,
    2500,
    'pending'
)
RETURNING order_id;

-- 2. Insert order item
INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    unit_price
)
VALUES (
    501,
    101,
    2,
    1250
);

-- 3. Reserve inventory
UPDATE products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 101
  AND stock_quantity >= 2;

-- Application must verify that exactly one row was updated.

-- 4. Insert payment record
INSERT INTO payments (
    order_id,
    amount,
    payment_status
)
VALUES (
    501,
    2500,
    'pending'
);

COMMIT;
```

The example uses `501` as an illustrative order ID. In actual application code, use the ID returned by `INSERT ... RETURNING` rather than hardcoding it.

Also, verify inventory availability before committing.

If any required operation fails, roll back the entire database transaction.

---

## 7. How PostgreSQL Supports ACID

| ACID property | PostgreSQL mechanisms                                |
| ------------- | ---------------------------------------------------- |
| Atomicity     | Transaction management, rollback, WAL-based recovery |
| Consistency   | Constraints, triggers, transaction logic             |
| Isolation     | MVCC, row/table locks, isolation levels              |
| Durability    | WAL, crash recovery, durable commit configuration    |

### MVCC

MVCC stands for Multi-Version Concurrency Control.

PostgreSQL uses MVCC to maintain multiple row versions so concurrent transactions can access consistent snapshots without requiring every read to block every write.

### WAL

WAL records changes before modified data pages are required to be written to their final database locations.

It supports crash recovery and durability.

Both concepts are important to understanding how PostgreSQL implements reliable transactions.

---

## 8. ACID vs BASE

ACID and BASE describe different approaches to data-system behavior.

BASE stands for:

- Basically Available.
- Soft State.
- Eventual Consistency.

| ACID                                                      | BASE                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| Focuses on transaction guarantees                         | Focuses on availability and eventual convergence                            |
| Strong transactional consistency within its defined scope | May allow temporarily inconsistent replicas or views                        |
| Common in relational database transactions                | Common in distributed and eventually consistent systems                     |
| Useful for financial and transactional workflows          | Useful for systems that prioritize availability and distributed scalability |

### Example

**ACID use cases:**

- Bank transfers.
- Payment records.
- Inventory reservations.
- Order creation.
- Financial ledgers.

**BASE-style use cases:**

- Distributed social feeds.
- Analytics pipelines.
- Eventually synchronized read models.
- Some distributed caching systems.

### Important

ACID and BASE are not mutually exclusive product categories.

A distributed system can use ACID transactions within individual services or databases while using eventual consistency between services.

---

## 9. Common Misconceptions

| Misconception                                                            | Correct understanding                                                 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| ACID means transactions execute one at a time                            | PostgreSQL supports concurrent transactions                           |
| COMMIT guarantees every external operation succeeded                     | It commits database changes, not external API actions                 |
| Consistency means every business rule is automatic                       | Only defined constraints and correctly implemented logic are enforced |
| Isolation prevents all concurrency problems automatically                | Guarantees depend on isolation level and transaction design           |
| Durability means data pages are immediately written to their final files | WAL supports recovery even when data pages are written later          |
| ROLLBACK reverses an already committed transaction                       | A committed transaction cannot be rolled back                         |
| Every database supports ACID identically                                 | Implementation and guarantees vary between systems                    |

---

## 10. Practice Exercises

Use the TechBazaar database.

1. Create a CHECK constraint preventing negative product prices.
2. Attempt to insert a negative product price and inspect the error.
3. Create an order and its order items inside one transaction.
4. Intentionally violate a foreign key and observe transaction behavior.
5. Demonstrate atomicity using two updates followed by ROLLBACK.
6. Explain how a primary key helps maintain consistency.
7. Implement an atomic conditional inventory update.
8. Explain how two customers purchasing the same product can create a concurrency problem.
9. Explain how PostgreSQL MVCC supports concurrent transactions.
10. Describe how WAL supports crash recovery.
11. Explain why a committed transaction cannot be undone using ROLLBACK.
12. Compare ACID and BASE using an e-commerce example.
13. Explain why a successful SQL transaction cannot automatically reverse a payment gateway request.
14. Identify which ACID properties are relevant to a bank transfer.

---

## 11. Interview Questions

**Q1. What is ACID?**

A set of four properties describing reliable database transactions: Atomicity, Consistency, Isolation and Durability.

**Q2. Explain Atomicity.**

All operations in a transaction succeed together or their database changes are rolled back.

**Q3. Explain Consistency.**

Transactions preserve the database's defined integrity constraints and rules.

**Q4. Explain Isolation.**

Concurrent transactions are controlled so their interactions follow the guarantees of the selected isolation level.

**Q5. Explain Durability.**

Committed changes survive recoverable system failures, supported in PostgreSQL by WAL and crash recovery.

**Q6. How does PostgreSQL provide durability?**

Primarily through Write-Ahead Logging, crash recovery and appropriate durable commit settings.

**Q7. What is WAL?**

Write-Ahead Logging records database changes before modified data pages need to be written to their final locations.

**Q8. What is MVCC?**

Multi-Version Concurrency Control maintains multiple row versions to support concurrent transactions and consistent snapshots.

**Q9. Does ACID guarantee that every business rule is enforced?**

No. Business rules must be represented through constraints, transaction logic and application-level validation.

**Q10. Does isolation mean transactions cannot execute concurrently?**

No. PostgreSQL allows concurrent execution and uses MVCC and locks to coordinate access.

**Q11. What happens if a PostgreSQL server crashes after a durable commit?**

PostgreSQL uses WAL during recovery to restore the committed database state.

**Q12. What is the difference between ACID and BASE?**

ACID emphasizes transactional guarantees, while BASE emphasizes availability and eventual consistency in distributed systems.

**Q13. Can a transaction roll back an external payment?**

No. External actions need compensation, idempotency and appropriate distributed transaction patterns.

**Q14. Which ACID property is most directly related to WAL?**

Durability, although WAL also supports atomicity and crash recovery.

---

## Key Takeaways

- **Atomicity:** All database changes succeed together or roll back.
- **Consistency:** Database integrity rules remain satisfied.
- **Isolation:** Concurrent transactions follow defined isolation guarantees.
- **Durability:** Committed changes survive recoverable failures.
- PostgreSQL uses MVCC for concurrency control.
- PostgreSQL uses WAL for crash recovery and durability.
- Constraints are essential for enforcing data integrity.
- ACID does not automatically reverse external side effects.
- A transaction is reliable only when database operations and business logic are designed correctly.
