---
sidebar_label: Replication Modes
sidebar_position: 1
---

# Replication Modes

## 1. Introduction: How Does a Primary Confirm a Transaction?

In last section, we learned that replication maintains copies of database data across multiple database servers.

We also learned the basic PostgreSQL replication flow:

```text
Application
     |
     | Write Query
     v
Primary Database
     |
     | Generate WAL
     v
WAL Sender
     |
     | Replication Stream
     v
Replica Database
     |
     | WAL Replay
     v
Updated Data
```

But an important question remains:

**When the primary commits a transaction, should it wait for the replica before telling the application that the transaction succeeded?**

There are different approaches to this.

The two fundamental replication modes are:

1. Asynchronous replication
2. Synchronous replication

Some database systems also use the term semi-synchronous replication for an intermediate approach.

The choice affects:

- Transaction latency
- Data durability
- Availability
- Performance
- Risk of losing recently committed transactions during failures

---

## 2. Asynchronous Replication

### 2.1 What Is Asynchronous Replication?

In asynchronous replication, the primary does not wait for a replica to acknowledge receiving or applying the transaction before confirming the commit to the application.

The primary can commit the transaction locally and return success while replication continues in the background.

### 2.2 How It Works

Suppose a user creates an order.

```sql
INSERT INTO orders (user_id, total_amount)
VALUES (101, 2500);
```

The flow is:

**Step 1:** Application sends the INSERT query to the primary.

**Step 2:** Primary executes the transaction and generates WAL records.

**Step 3:** Primary commits the transaction locally.

**Step 4:** Primary responds successfully to the application without waiting for the replica.

**Step 5:** WAL is transferred to the replica.

**Step 6:** Replica receives and replays the WAL records.

```text
              Application
                   |
                   | INSERT order
                   v
              Primary DB
                   |
               Generate WAL
                   |
                   v
              Local Commit
                   |
                   | Success
                   v
              Application

                   |
                   | Replication continues
                   v
                Replica
                   |
                WAL Replay
                   |
                   v
              Updated Data
```

The important point is that the application receives success without waiting for the replica.

### 2.3 Example Timeline

Imagine the following timings:

| Operation                       |  Time |
| ------------------------------- | ----: |
| Application sends query         |  0 ms |
| Primary executes transaction    | 10 ms |
| Primary commits locally         | 15 ms |
| Primary responds to application | 16 ms |
| Replica receives WAL            | 25 ms |
| Replica applies WAL             | 35 ms |

The application receives success at approximately 16 ms.

The replica catches up at approximately 35 ms.

The application does not need to wait for the replica.

### 2.4 Advantages

**1. Lower write latency**

The primary does not need to wait for replica acknowledgment.

**2. Better write availability when replicas are unavailable**

A disconnected replica does not normally prevent the primary from committing transactions in an asynchronous setup.

**3. Better performance for write-heavy applications**

The primary can continue processing writes without waiting for remote replication.

**4. Suitable for geographically distributed replicas**

A replica may be located far away from the primary. Not waiting for remote acknowledgment avoids adding that network round-trip to every commit.

### 2.5 Disadvantages

**1. Risk of losing recently committed transactions**

Suppose:

1. Primary commits an order.
2. Primary responds successfully to the application.
3. The replica has not received the latest WAL.
4. Primary crashes permanently.
5. An older replica is promoted.

The newly committed order may be missing from the promoted replica.

This is the main durability tradeoff.

**2. Replica may contain older data**

A query executed on the replica may not immediately see the latest changes.

**3. Read-after-write inconsistency**

A user may create an order and immediately request it from a replica that has not caught up.

### 2.6 When Should You Use Asynchronous Replication?

It is appropriate when:

- Write performance is important.
- Small amounts of recent data loss are acceptable under certain failure scenarios.
- Replicas are primarily used for read scaling.
- Replicas are geographically distant.
- The application can tolerate some replication delay.

Examples:

- Product catalog browsing
- Analytics dashboards
- Historical reporting
- Activity feeds
- Non-critical event tracking

The correct choice depends on the business impact of losing recent transactions.

---

## 3. Synchronous Replication

### 3.1 What Is Synchronous Replication?

In synchronous replication, the primary waits for acknowledgment from the required standby server or servers before completing the commit response to the application.

The exact acknowledgment condition depends on the database system and its configuration.

In PostgreSQL, synchronous replication can be configured so that a transaction's commit waits for a synchronous standby to acknowledge the required WAL state.

### 3.2 How It Works

Consider the same order creation query:

```sql
INSERT INTO orders (user_id, total_amount)
VALUES (101, 2500);
```

The flow is:

**Step 1:** Application sends the query to the primary.

**Step 2:** Primary executes the transaction and generates WAL.

**Step 3:** Primary sends the relevant WAL to the synchronous standby.

**Step 4:** Standby receives and processes the WAL to the configured acknowledgment point.

**Step 5:** Standby sends acknowledgment to the primary.

**Step 6:** Primary completes the commit response to the application.

```text
              Application
                   |
                   | INSERT order
                   v
              Primary DB
                   |
               Generate WAL
                   |
             Local Commit Work
                   |
                   v
              WAL Sender
                   |
                   | WAL Stream
                   v
              Standby DB
                   |
          Required Acknowledgment
                   |
                   v
              Primary DB
                   |
             Commit Response
                   |
                   v
              Application
```

The primary waits for the configured standby acknowledgment before reporting the commit as successful.

### 3.3 Example Timeline

Imagine the following timings:

| Operation                           |  Time |
| ----------------------------------- | ----: |
| Application sends query             |  0 ms |
| Primary executes transaction        | 10 ms |
| Primary generates WAL               | 12 ms |
| Primary sends WAL                   | 15 ms |
| Standby acknowledges required state | 35 ms |
| Primary responds to application     | 37 ms |

The application receives success at approximately 37 ms.

Compare this with asynchronous replication, where the primary could respond before the standby acknowledges.

**Important:** Synchronous replication does not necessarily mean the standby has replayed the transaction and made it visible to read queries. That depends on the acknowledgment level configured.

### 3.4 Advantages

**1. Stronger protection against losing acknowledged transactions**

When configured appropriately, a primary failure is less likely to result in losing transactions that were already acknowledged to the application.

**2. Better coordination between primary and standby**

The primary waits for a defined replication acknowledgment before reporting successful commits.

**3. Useful for critical transactional systems**

Applications handling financially important transactions may prefer stronger durability guarantees.

### 3.5 Disadvantages

**1. Higher write latency**

The primary must wait for the standby acknowledgment.

**2. Network dependency**

The network connection between primary and standby becomes part of the commit path.

**3. Reduced write availability**

If the required synchronous standby becomes unavailable, transactions that require its acknowledgment may block or fail, depending on configuration and timeout behavior.

**4. Geographic distance matters**

If the standby is located far away, network round-trip time can significantly increase transaction latency.

### 3.6 When Should You Use Synchronous Replication?

It is useful when:

- Losing acknowledged transactions is unacceptable or very costly.
- Stronger durability is more important than minimum write latency.
- The standby is reliably connected.
- Network latency is manageable.
- The application can tolerate commits waiting for replication acknowledgment.

Examples:

- Financial transaction records
- Banking systems
- Critical payment records
- Important inventory transactions
- Systems where acknowledged writes must have stronger protection against primary failure

Synchronous replication reduces certain data-loss risks, but it does not eliminate every possible failure scenario. Backups and a complete disaster-recovery strategy are still necessary.

---

## 4. Asynchronous vs Synchronous Replication

This is the most important comparison in this chapter.

| Feature                                   | Asynchronous                           | Synchronous                                                    |
| ----------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| Primary waits for replica acknowledgment? | No                                     | Yes, according to configuration                                |
| Write latency                             | Usually lower                          | Usually higher                                                 |
| Write throughput                          | Generally easier to maximize           | Can be constrained by acknowledgment latency                   |
| Data-loss risk on primary failure         | Higher for unreplicated commits        | Lower for acknowledged commits under the configured guarantees |
| Dependency on standby availability        | Lower                                  | Higher                                                         |
| Network latency impact on commit          | Usually not on the acknowledgment path | Directly affects commit latency                                |
| Read scaling                              | Yes                                    | Yes                                                            |
| Typical use                               | Performance-oriented workloads         | Durability-oriented workloads                                  |

### Simple Mental Model

```text
ASYNCHRONOUS

Primary commits
      |
      v
Application gets success
      |
      v
Replica catches up later


SYNCHRONOUS

Primary prepares commit
      |
      v
Replica acknowledges
      |
      v
Primary confirms commit
      |
      v
Application gets success
```

The key difference is not whether replication happens.

Both modes replicate data.

The difference is **whether the primary waits for the replica's acknowledgment before confirming the commit**.

---

## 5. What Is Semi-Synchronous Replication?

### 5.1 Definition

Semi-synchronous replication is a term used by some database systems for an approach between fully asynchronous and synchronous replication.

A primary waits for at least some acknowledgment from a replica, but the exact acknowledgment guarantee may be weaker than waiting for the replica to fully apply the transaction.

The exact semantics are database-specific.

### 5.2 Conceptual Flow

```text
              Application
                   |
                   v
              Primary DB
                   |
                Generate WAL
                   |
                   v
                Replica
                   |
            Partial/Required
              Acknowledgment
                   |
                   v
              Primary DB
                   |
              Commit Response
                   |
                   v
              Application
```

For example, a system might wait until a replica has received a transaction's log data, without waiting for that transaction to become visible on the replica.

This is different from waiting for full replay.

### 5.3 Important PostgreSQL Clarification

PostgreSQL documentation primarily describes asynchronous and synchronous streaming replication.

It does not define a separate standard replication mode named _semi-synchronous replication_ in the same way some other database products do.

PostgreSQL instead provides configurable synchronous acknowledgment levels, which allow you to choose how far the standby must process WAL before acknowledging it.

We will examine those settings next.

---

## 6. PostgreSQL Synchronous Replication: Acknowledgment Levels

This is an important PostgreSQL-specific concept.

When PostgreSQL uses synchronous replication, the primary can be configured to wait for different levels of acknowledgment from the standby.

The key setting is:

```sql
synchronous_commit
```

It controls what PostgreSQL waits for before reporting a transaction commit as successful.

### 6.1 `synchronous_commit = off`

The transaction does not wait for local WAL flush before acknowledging the commit.

This can improve performance, but it weakens durability guarantees for recently acknowledged transactions.

It does not disable WAL generation or necessarily disable replication.

A PostgreSQL crash could lose recently acknowledged transactions that were not yet flushed, although database consistency is preserved through recovery.

### 6.2 `synchronous_commit = local`

The transaction waits for the local WAL to be flushed, but does not wait for synchronous standby acknowledgment.

This is useful when local durability is required but synchronous remote acknowledgment is not.

### 6.3 `synchronous_commit = remote_write`

The transaction waits until the synchronous standby confirms that WAL has been written to its operating system.

However, this does not guarantee that the WAL has been flushed to durable storage on the standby.

A standby operating-system crash or power failure could still lose data that was only written to volatile operating-system buffers.

### 6.4 `synchronous_commit = on`

The transaction waits until the synchronous standby confirms that the relevant WAL has been flushed to durable storage.

This provides stronger protection against losing acknowledged transactions if the primary fails, assuming the standby's storage and failure assumptions hold.

However, the standby may not have replayed the WAL yet.

### 6.5 `synchronous_commit = remote_apply`

The transaction waits until the synchronous standby confirms that the relevant WAL has been replayed.

This means the changes have been applied on the standby and are visible to queries running there under appropriate snapshot conditions.

This is useful when the application needs stronger read visibility guarantees from a synchronous standby.

### 6.6 Comparison

| Setting        | What Does the Primary Wait For?                      |
| -------------- | ---------------------------------------------------- |
| `off`          | No local WAL flush wait for commit acknowledgment    |
| `local`        | Local WAL flush                                      |
| `remote_write` | Standby confirms WAL written to its operating system |
| `on`           | Standby confirms WAL flushed to durable storage      |
| `remote_apply` | Standby confirms WAL replayed                        |

**Important:** `synchronous_commit` alone does not configure which standby is synchronous. Synchronous standby selection is configured separately.

For `remote_write`, `on`, and `remote_apply` to wait for a standby, synchronous replication must be configured and a qualifying synchronous standby must be available.

---

## 7. Configuring Synchronous Replication in PostgreSQL

Let's understand the important configuration parameters.

### 7.1 `synchronous_standby_names`

This setting defines which standby servers can participate in synchronous replication.

For example:

```ini
synchronous_standby_names = 'FIRST 1 (replica1, replica2)'
```

This means PostgreSQL selects the first available standby from the listed candidates according to their connection priority.

The primary needs the required synchronous standby acknowledgment before completing commits that wait for synchronous replication.

### 7.2 `synchronous_commit`

You can configure the default behavior:

```ini
synchronous_commit = on
```

Or set it for a particular session:

```sql
SET synchronous_commit = 'remote_apply';
```

You can also set it for an individual transaction:

```sql
BEGIN;

SET LOCAL synchronous_commit = 'on';

INSERT INTO orders (user_id, total_amount)
VALUES (101, 2500);

COMMIT;
```

`SET LOCAL` applies within the current transaction and reverts when that transaction ends.

### 7.3 `FIRST` vs `ANY`

PostgreSQL supports two important ways to select synchronous standbys.

**FIRST: Priority-based selection**

```ini
synchronous_standby_names = 'FIRST 1 (replica1, replica2)'
```

PostgreSQL waits for the required number of highest-priority available synchronous standbys.

**ANY: Quorum-based selection**

```ini
synchronous_standby_names = 'ANY 2 (replica1, replica2, replica3)'
```

PostgreSQL waits for acknowledgments from any two of the listed standby servers.

This is called quorum-based synchronous replication.

### 7.4 Why Quorum Matters

Suppose you have three standby servers:

```text
               Primary
                  |
          -------------------
          |        |        |
       Replica1 Replica2 Replica3
```

With:

```ini
synchronous_standby_names = 'ANY 2 (replica1, replica2, replica3)'
```

The primary needs acknowledgment from any two eligible standbys.

For example:

| Replica   | Acknowledgment |
| --------- | -------------- |
| Replica 1 | Yes            |
| Replica 2 | No             |
| Replica 3 | Yes            |

The required quorum of two has been reached.

The primary can complete the synchronous acknowledgment requirement.

This is different from requiring a particular replica to acknowledge every transaction.

**Note:** These configuration examples are illustrative. A real deployment also needs physical replication setup, standby configuration, authentication, network access, and a suitable failure-management strategy.

---

## 8. What Happens When a Synchronous Replica Goes Down?

This is one of the most important practical consequences of synchronous replication.

Suppose:

```text
              Primary
                 |
                 |
             Replica 1
```

The primary is configured to wait for Replica 1.

Now Replica 1 crashes.

What happens?

The primary may still execute the SQL statement and generate WAL, but a commit requiring synchronous acknowledgment cannot complete normally until the required acknowledgment condition is satisfied.

Depending on the configuration and failure-management behavior, the transaction can remain waiting.

This creates an important tradeoff:

- Asynchronous replication generally allows the primary to keep committing without waiting for the replica.
- Synchronous replication can make commit availability dependent on the required standby acknowledgment.

This is why synchronous replication must be designed carefully.

You should not simply enable it without understanding the impact of standby failure.

### Example

Consider a payment application.

A payment transaction is submitted.

The primary executes it, but the synchronous replica is unavailable.

If the system requires synchronous acknowledgment, the commit may wait.

The application must be prepared for delayed responses, timeouts, and appropriate retry behavior.

Never assume that a timeout means the transaction definitely failed. The client may have lost the connection after the database committed but before receiving the response. Applications handling important transactions should use idempotency keys and transaction-status checks.

---

## 9. Choosing the Right Replication Mode

There is no universally best replication mode.

The correct choice depends on business requirements.

| Application          | Typical Preference                                 | Reason                                                  |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| Product browsing     | Asynchronous                                       | Low-latency reads and tolerance for slightly stale data |
| Analytics dashboards | Asynchronous                                       | Reporting can often tolerate replication delay          |
| Activity feeds       | Asynchronous                                       | Small delays may be acceptable                          |
| Payment records      | Stronger synchronous guarantees may be appropriate | Losing acknowledged records is costly                   |
| Financial ledger     | Strong durability requirements                     | Acknowledged transactions are critical                  |
| Inventory management | Depends on business rules                          | Overselling and consistency requirements matter         |
| Banking transactions | Strong durability and consistency design           | Data loss can have serious consequences                 |

Do not choose synchronous replication merely because it sounds safer.

You must consider:

- Network latency
- Standby reliability
- Commit latency requirements
- Failure behavior
- Recovery procedures
- Business tolerance for data loss

Also remember that synchronous replication does not replace backups or a complete disaster-recovery strategy.

---

## 10. Practical Backend Example: Payment Processing

Imagine an e-commerce application.

A user pays ₹2,500 for an order.

The backend performs:

1. Record payment.
2. Update order status.
3. Update inventory.
4. Return payment confirmation.

These operations should be handled in a database transaction.

```sql
BEGIN;

INSERT INTO payments (
    order_id,
    amount,
    status
)
VALUES (
    101,
    2500,
    'SUCCESS'
);

UPDATE orders
SET status = 'PAID'
WHERE order_id = 101;

UPDATE products
SET stock = stock - 1
WHERE product_id = 501
  AND stock > 0;

COMMIT;
```

Assume the application has a synchronous standby.

### With Asynchronous Replication

```text
Payment Transaction
        |
        v
Primary Commits
        |
        v
Application Gets Success
        |
        v
Replica Receives Changes Later
```

If the primary permanently fails before the changes reach the replica, the promoted replica might not contain the payment transaction.

### With Synchronous Replication

```text
Payment Transaction
        |
        v
Primary Generates WAL
        |
        v
Standby Acknowledges
        |
        v
Primary Confirms Commit
        |
        v
Application Gets Success
```

The primary waits for the configured acknowledgment before confirming success.

This provides stronger protection against losing acknowledged transactions.

**Important application-level detail:** The SQL above is illustrative. A production implementation should check whether the inventory update actually affected one row before completing the transaction. Otherwise, the application could record a payment even when inventory was unavailable. Database replication does not fix incorrect transaction logic.

---

## 11. Common Misconceptions

### Misconception 1: Synchronous replication means zero data loss under every possible failure.

Incorrect.

It provides stronger guarantees for acknowledged transactions, depending on the acknowledgment level, storage durability, standby configuration, and failure scenario.

It does not protect against every possible disaster or operational mistake.

### Misconception 2: Asynchronous replication is unsafe.

Incorrect.

Asynchronous replication is widely used because it provides useful performance and availability characteristics.

It is appropriate when the application can tolerate the associated data-loss risk.

### Misconception 3: Synchronous replication always waits for the replica to execute the SQL query.

Incorrect.

PostgreSQL replicas process WAL. The primary can wait for WAL to be written, flushed, or replayed, depending on the configured acknowledgment level.

### Misconception 4: `synchronous_commit = on` means the standby has already applied the transaction.

Incorrect.

In PostgreSQL, `on` waits for the synchronous standby to flush the relevant WAL to durable storage. It does not necessarily wait for replay.

For replay acknowledgment, PostgreSQL provides `remote_apply`.

### Misconception 5: More synchronous replicas always mean better durability.

Incorrect.

More replicas can provide additional redundancy, but they also increase operational complexity and can affect latency and availability.

The acknowledgment policy matters.

### Misconception 6: Synchronous replication automatically creates a high-availability system.

Incorrect.

It provides replication guarantees, but failover, promotion, routing, monitoring, and recovery procedures still need to be designed.

### Misconception 7: Semi-synchronous is a universal database standard.

Incorrect.

It is terminology used by some database products. Exact behavior varies by implementation.

PostgreSQL exposes configurable synchronous acknowledgment levels rather than a separate standard mode named semi-synchronous.

---

## 12. Interview Questions

### Q1. What is asynchronous replication?

Asynchronous replication is a replication approach where the primary does not wait for replica acknowledgment before confirming a transaction commit to the application.

### Q2. What is synchronous replication?

Synchronous replication is an approach where the primary waits for the required synchronous standby acknowledgment before confirming a transaction commit.

### Q3. What is the main difference between synchronous and asynchronous replication?

The main difference is whether the primary waits for replica acknowledgment before confirming the commit.

### Q4. Which replication mode provides lower write latency?

Asynchronous replication generally provides lower write latency because the primary does not wait for remote acknowledgment.

### Q5. Which replication mode provides stronger protection against losing acknowledged transactions?

Synchronous replication, when configured with an appropriate acknowledgment level and reliable standby storage.

### Q6. What happens if a synchronous standby goes down?

Transactions requiring its acknowledgment may wait or fail, depending on configuration and timeout behavior. The primary's ability to complete commits can therefore be affected.

### Q7. What is `synchronous_commit` in PostgreSQL?

It is a PostgreSQL setting that controls how much WAL durability or replication progress must be acknowledged before a transaction commit is reported as successful.

### Q8. What is the difference between `remote_write` and `on`?

- `remote_write`: The standby confirms that WAL has been written to its operating system.
- `on`: The standby confirms that WAL has been flushed to durable storage.

### Q9. What is `remote_apply`?

It makes the primary wait until the synchronous standby has replayed the relevant WAL records.

### Q10. What is `synchronous_standby_names`?

It specifies which standby servers can participate in synchronous replication and how many acknowledgments are required.

### Q11. What is quorum-based replication in PostgreSQL?

It is a configuration where the primary waits for acknowledgments from a specified number of any eligible synchronous standbys, using the `ANY` option.

### Q12. Does synchronous replication eliminate the need for backups?

No. Backups are still required for recovery from accidental deletion, corruption, and other failures.

### Q13. Can asynchronous replication lose committed transactions?

Yes. If the primary fails before recent WAL changes reach a replica and an older replica is promoted, some transactions previously acknowledged by the primary may be missing.

### Q14. Does `synchronous_commit = on` guarantee that a replica can immediately serve the latest data?

Not necessarily. It waits for the standby to flush WAL, not necessarily replay it. `remote_apply` waits for replay.

### Q15. Is semi-synchronous replication a PostgreSQL replication mode?

PostgreSQL does not define it as a separate standard mode. It offers configurable synchronous acknowledgment levels.

---

## 13. Practical Learning Exercise

You can explore the settings and concepts without configuring replication on a production database.

### Exercise A: Check the Current Settings

```sql
SHOW synchronous_commit;

SHOW synchronous_standby_names;

SHOW wal_level;
```

These commands display the current configuration.

A database without configured synchronous standbys can still show:

```text
synchronous_commit = on
synchronous_standby_names =
```

That does not mean synchronous remote replication is active. The standby selection configuration matters.

### Exercise B: Experiment With Acknowledgment Settings

In a test session:

```sql
SET synchronous_commit = 'local';

SHOW synchronous_commit;
```

Then try:

```sql
SET synchronous_commit = 'remote_write';

SHOW synchronous_commit;
```

And:

```sql
SET synchronous_commit = 'remote_apply';

SHOW synchronous_commit;
```

These settings demonstrate the available acknowledgment levels. Without an appropriately configured synchronous standby, remote acknowledgment behavior cannot be tested meaningfully.

### Exercise C: Think Through a Failure

Assume:

- Primary commits an order.
- Replica has not received its WAL.
- Primary crashes permanently.

Answer:

1. What could happen with asynchronous replication?
2. What protection would synchronous replication provide?
3. Would a backup still be necessary?
4. Would synchronous replication guarantee zero downtime?

Expected reasoning:

- Asynchronous replication may lose the latest unreplicated transaction after promotion of an older replica.
- Synchronous replication can protect acknowledged transactions according to its configured acknowledgment guarantees.
- Backups remain necessary.
- Failover and application reconnection are still separate requirements.

---

## 14. Chapter Summary

| Concept                      | Key Takeaway                                                    |
| ---------------------------- | --------------------------------------------------------------- |
| Asynchronous Replication     | Primary does not wait for replica acknowledgment                |
| Synchronous Replication      | Primary waits for required standby acknowledgment               |
| Semi-Synchronous             | Product-specific intermediate replication behavior              |
| `synchronous_commit = off`   | Does not wait for local WAL flush before acknowledging          |
| `synchronous_commit = local` | Waits for local WAL flush                                       |
| `remote_write`               | Waits for standby OS-level write acknowledgment                 |
| `on`                         | Waits for standby WAL flush                                     |
| `remote_apply`               | Waits for standby WAL replay                                    |
| `synchronous_standby_names`  | Defines synchronous standby selection                           |
| `FIRST`                      | Priority-based standby selection                                |
| `ANY`                        | Quorum-based standby acknowledgment                             |
| Main Tradeoff                | Lower latency vs stronger replication acknowledgment guarantees |

### The most important mental model

<pre>
ASYNCHRONOUS
Primary commits
    |
    v
Application receives success
    |
    v
Replica catches up later

SYNCHRONOUS
Primary generates WAL
    |
    v
Replica acknowledges
    |
    v
Application receives success
</pre>

**Remember:** Asynchronous replication prioritizes commit responsiveness. Synchronous replication prioritizes stronger acknowledgment guarantees.

Neither mode is universally best. The choice must match the application's durability and availability requirements.
