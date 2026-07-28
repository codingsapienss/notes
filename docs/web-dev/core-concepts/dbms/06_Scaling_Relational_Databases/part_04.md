---
sidebar_label: Replication Challenges
sidebar_position: 1
---

# Replication Challenges

## 1. Introduction: Replication Is Not as Simple as Copying Data

In last 2 sections, we learned how replication works, what is asynchronous and synchronous replication.

Now consider a production system:

- One primary PostgreSQL database.
- Three replica databases.
- A Node.js backend.
- Thousands of users creating orders and making payments.

The architecture looks like this:

```text
                  Node.js Backend
                         |
                    Primary DB
                    /    |    \
                   /     |     \
                  v      v      v
             Replica 1 Replica 2 Replica 3
```

It looks straightforward, but production systems introduce several problems:

1. Replicas may fall behind the primary.
2. Users may receive stale data.
3. The primary may crash.
4. Replicas may contain different amounts of data.
5. Two servers may incorrectly believe they are the primary.
6. A replica may become disconnected.
7. Promoting the wrong replica may cause data loss.
8. Replication may stop because required WAL is unavailable.

These are replication challenges.

The objective of this chapter is to understand how these problems occur and how production systems handle them.

---

## 2. Replication Lag

### 2.1 What Is Replication Lag?

Replication lag is the delay between a change being committed on the primary and that change becoming available on a replica.

Consider:

```sql
INSERT INTO orders (user_id, total_amount)
VALUES (101, 2500);
```

The primary commits the transaction.

However, the replica has not yet received or replayed the corresponding WAL.

For some time, the primary and replica contain different database states.

```text
             PRIMARY
        -----------------
          Order 101 exists
        -----------------
                 |
                 | WAL replication
                 |
                 v
             REPLICA
        -----------------
          Order 101 missing
        -----------------
```

The replica is behind the primary.

This delay is called replication lag.

### 2.2 Why Does Replication Lag Occur?

Several factors can cause replication lag.

**1. Network latency**

If the primary and replica are in different geographical regions, WAL transfer can take longer.

**2. High write workload**

A primary generating large amounts of WAL may produce changes faster than a replica can process them.

**3. Slow replica hardware**

A replica with insufficient CPU, RAM, or storage performance may struggle to replay WAL quickly.

**4. Heavy queries on replicas**

Long-running queries can compete with WAL replay for resources. In some situations, standby conflict handling can also delay or cancel queries.

**5. Network interruptions**

A temporary network failure can interrupt WAL transfer.

**6. Large transactions**

A large transaction can generate substantial WAL and affect how quickly changes become visible on the replica.

### 2.3 Types of Replication Lag

It is useful to distinguish different stages of replication.

```text
Primary
   |
   | WAL generated
   v
WAL Sent
   |
   | Network transfer
   v
WAL Received
   |
   | Written / Flushed
   v
WAL Replayed
   |
   v
Changes Visible to Queries
```

There are several important stages:

| Stage            | Meaning                                        |
| ---------------- | ---------------------------------------------- |
| Write lag        | Delay before the replica receives WAL          |
| Flush lag        | Delay before WAL is flushed on the replica     |
| Replay lag       | Delay before the replica applies WAL           |
| Visibility delay | Delay before changes become visible to queries |

These are related but not identical.

For example, a replica might have received and flushed WAL but not yet replayed it.

Therefore, a replica can be durable with respect to received WAL while still serving queries against an older database state.

### 2.4 Example

Suppose:

| Event                 |     Time |
| --------------------- | -------: |
| Primary commits order | 10:00:00 |
| Replica receives WAL  | 10:00:02 |
| Replica flushes WAL   | 10:00:03 |
| Replica replays WAL   | 10:00:05 |

The order becomes visible on the replica around 10:00:05.

The replica has approximately five seconds of visibility delay relative to the primary commit.

### 2.5 How to Reduce Replication Lag

Possible approaches:

- Improve network connectivity.
- Use faster storage on replicas.
- Provide sufficient CPU and memory.
- Distribute read traffic across replicas.
- Avoid overwhelming replicas with expensive reporting queries.
- Monitor WAL generation and replay rates.
- Scale replica capacity according to workload.

Adding replicas alone does not solve a slow-replay problem. Each replica has to process the replicated changes.

---

## 3. Stale Reads

### 3.1 What Is a Stale Read?

A stale read occurs when an application reads an older version of data from a replica instead of the latest committed version available on the primary.

Example:

A user updates their profile name.

```sql
UPDATE users
SET name = 'Prashant Sharma'
WHERE user_id = 101;
```

The primary commits the update.

Immediately afterward, the application reads the user's profile from a replica.

The replica has not applied the update yet.

The application receives the old name.

```text
                 PRIMARY
              name = New Name
                    |
                    |
               Replication
                    |
                    v
                 REPLICA
              name = Old Name
```

This is a stale read.

### 3.2 Real-World Example: Order Creation

Consider this sequence:

1. User creates an order.
2. Primary successfully commits the order.
3. Application receives success.
4. Application redirects the user to the order-details page.
5. The order-details API reads from a replica.
6. The replica has not caught up.
7. The API returns "Order not found."

The order exists on the primary, but the replica is behind.

This creates a confusing user experience.

### 3.3 How to Prevent Stale Reads

**Approach 1: Read from the primary after writes**

```javascript
async function createOrder(userId, amount) {
  const result = await primaryPool.query(
    `INSERT INTO orders (user_id, total_amount)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, amount],
  );

  return result.rows[0];
}

async function getOrder(orderId) {
  const result = await primaryPool.query(
    `SELECT * FROM orders
     WHERE order_id = $1`,
    [orderId],
  );

  return result.rows[0];
}
```

This avoids reading the new order from a lagging replica.

**Approach 2: Route selected reads to the primary**

For example:

| Operation                   | Database |
| --------------------------- | -------- |
| Create order                | Primary  |
| Immediately fetch new order | Primary  |
| Update payment status       | Primary  |
| Browse public products      | Replica  |
| Historical reports          | Replica  |

**Approach 3: Session-level read-your-writes routing**

After a user performs a write, the application can temporarily route that user's related reads to the primary.

This provides a practical way to maintain read-your-writes behavior.

**Approach 4: Wait for a replication position**

More advanced systems can track a WAL position associated with a transaction and wait until a replica has replayed that position before reading from it.

PostgreSQL provides WAL position functions for this purpose.

This requires careful implementation and timeout handling.

### 3.4 Important Concept: Read-Your-Writes Consistency

Read-your-writes consistency means that after a client successfully performs a write, its subsequent reads should reflect that write.

It does not necessarily mean every user in the entire system immediately sees every change.

This is a useful consistency guarantee for applications that use read replicas.

---

## 4. Primary Failure

### 4.1 What Happens When the Primary Crashes?

Imagine:

```text
                 Primary DB
                    |
              -------------
              |           |
           Replica 1   Replica 2
```

The primary suddenly crashes.

Possible causes:

- Hardware failure
- Operating-system crash
- Database process failure
- Network isolation
- Storage failure
- Infrastructure outage

The application can no longer use the primary normally.

This creates a database availability problem.

### 4.2 What Is Failover?

Failover is the process of switching database service from a failed primary to another database server.

A replica is selected and promoted to become the new primary.

```text
BEFORE FAILURE

             Primary
             /     \
            v       v
       Replica 1  Replica 2


AFTER FAILURE

          Primary (Failed)
                 X

          Replica 1
          (Promoted)

          Replica 2
          (Standby)
```

The promoted replica becomes responsible for accepting writes.

### 4.3 Basic Failover Process

A typical failover process involves:

**Step 1: Detect failure**

The system detects that the primary is unavailable or unhealthy.

**Step 2: Evaluate replicas**

The system identifies which replicas are healthy and sufficiently up to date.

**Step 3: Select a candidate**

A suitable replica is selected for promotion.

**Step 4: Promote the replica**

The replica exits standby recovery and becomes a primary.

**Step 5: Redirect application traffic**

Applications and connection pools must connect to the new primary.

**Step 6: Reconfigure the old primary**

If the old primary returns, it must be handled safely. It cannot simply resume accepting writes as though nothing happened.

It may need to be rebuilt or rejoined as a standby.

### 4.4 PostgreSQL Promotion

PostgreSQL provides:

```sql
SELECT pg_promote();
```

This requests promotion of a standby server.

Alternatively, the command-line utility can be used:

```bash
pg_ctl promote -D /path/to/data
```

These commands are examples of promotion mechanisms. A production failover system must also handle candidate selection, split-brain prevention, routing, and rejoining the old primary.

### 4.5 Automatic vs Manual Failover

| Manual Failover                   | Automatic Failover                             |
| --------------------------------- | ---------------------------------------------- |
| Administrator initiates promotion | Monitoring/orchestration initiates promotion   |
| More human control                | Faster response when configured correctly      |
| Can take longer                   | Can reduce recovery time                       |
| Depends on operational response   | Depends on reliable failure detection          |
| Useful in controlled environments | Useful in systems requiring automated recovery |

Automatic failover is not automatically safer. Incorrect failure detection can cause two database servers to accept writes simultaneously.

---

## 5. Split-Brain Problem

### 5.1 What Is Split Brain?

Split brain occurs when two or more database servers incorrectly operate as independent primaries for the same logical database system.

This can happen when the original primary is isolated from the monitoring or failover system but is still accessible to some application clients.

Consider:

```text
             Network Partition

        Primary A       Replica B
           |                |
      App Group 1       App Group 2
           |                |
       Accepts Writes   Promoted to Primary
```

Both servers accept writes.

Now suppose:

- Application Group 1 creates order 101 on Primary A.
- Application Group 2 creates order 102 on Primary B.

The two servers now contain different transaction histories.

When connectivity is restored, those histories may conflict.

### 5.2 Why Is Split Brain Dangerous?

Possible consequences:

- Conflicting updates
- Duplicate records
- Missing transactions
- Inconsistent inventory
- Incorrect account balances
- Data reconciliation problems

In a payment system, split brain can be especially damaging.

For example, two independent primaries might both accept a withdrawal against the same logical account balance.

### 5.3 How to Prevent Split Brain

**1. Fencing**

Ensure that the old primary cannot continue accepting writes after it has been replaced.

This may involve stopping the database, shutting down the host, revoking access, or using infrastructure-level isolation.

**2. Quorum**

Require a sufficient number of trusted members to agree before promoting a new primary.

**3. Leader election**

Use a reliable coordination mechanism to select one active primary.

**4. Monitoring and orchestration**

Use systems designed to manage primary selection, promotion, and failover safely.

**5. Single-writer architecture**

Ensure that only the currently authorized primary can accept writes.

### 5.4 What Is Fencing?

Fencing is the process of preventing an old or failed primary from continuing to serve writes after a new primary has been selected.

For example:

```text
Old Primary
     |
     v
Fenced / Isolated
     |
     X
Cannot Accept Writes

New Primary
     |
     v
Accepts Writes
```

The important principle is:

**Do not promote a replacement primary while the old primary might still be accepting independent writes.**

---

## 6. Replica Promotion and Data Loss

### 6.1 Why Can Failover Cause Data Loss?

Consider asynchronous replication.

The primary commits three transactions:

```text
Primary:
  Transaction A
  Transaction B
  Transaction C
```

But the replica has received only:

```text
Replica:
  Transaction A
  Transaction B
```

Now the primary crashes permanently.

If the replica is promoted, Transaction C may be missing.

```text
Primary (Failed)
  A
  B
  C

Replica (Promoted)
  A
  B
```

This is possible because the primary acknowledged Transaction C before the replica received or durably stored the relevant WAL.

### 6.2 What Is RPO?

RPO stands for **Recovery Point Objective**.

It describes how much data loss an organization is prepared to tolerate, measured in time.

Example:

An organization has an RPO of five minutes.

It aims to recover with no more than five minutes of data loss after a disaster.

An asynchronous replication setup may be designed to meet an RPO target, but actual results depend on WAL transfer, storage, failure conditions, and the recovery procedure.

### 6.3 What Is RTO?

RTO stands for **Recovery Time Objective**.

It describes how long an organization can tolerate a service interruption before the system must be restored.

Example:

An organization has an RTO of ten minutes.

It aims to restore service within ten minutes of an outage.

### 6.4 RPO vs RTO

| Concept | Meaning                          | Example    |
| ------- | -------------------------------- | ---------- |
| RPO     | Maximum acceptable data loss     | 5 minutes  |
| RTO     | Maximum acceptable recovery time | 10 minutes |

Remember:

- RPO is about data loss.
- RTO is about downtime.

### 6.5 How to Reduce Failover Data Loss

Possible approaches:

- Use synchronous replication where appropriate.
- Monitor replication progress.
- Select the most up-to-date suitable replica.
- Preserve and archive WAL.
- Maintain reliable backups.
- Test failover and recovery procedures.

Even synchronous replication requires careful design around the failure model and acknowledgment level.

---

## 7. WAL Retention and Replica Disconnection

### 7.1 Why Does a Replica Need WAL?

A PostgreSQL standby needs WAL records to catch up with the primary.

Suppose:

1. A standby loses network connectivity.
2. The primary continues accepting writes.
3. WAL files accumulate and eventually become eligible for recycling.
4. The standby reconnects.
5. Some WAL records it needs are no longer available on the primary.

The standby may be unable to continue recovery from the available WAL stream.

### 7.2 Example

```text
Time 1:
Primary -------------- Replica
       Connected

Time 2:
Primary       X        Replica
          Disconnected

Time 3:
Primary continues generating WAL.
Required older WAL is no longer available.

Time 4:
Replica reconnects.
Required WAL is missing.
```

The replica cannot simply replay WAL that no longer exists in the available sources.

### 7.3 How Can PostgreSQL Handle This?

There are mechanisms to help standby servers obtain required WAL.

**1. `wal_keep_size`**

This setting controls a minimum amount of recent WAL that PostgreSQL retains for standby servers.

Example:

```ini
wal_keep_size = 2GB
```

This is a retention floor, not a guarantee that every disconnected standby can always catch up.

**2. WAL archiving**

PostgreSQL can archive completed WAL segments to separate storage.

A standby may retrieve required WAL from the archive through `restore_command`.

**3. Replication slots**

Replication slots help prevent PostgreSQL from recycling WAL that a connected or disconnected consumer still needs.

Example:

```sql
SELECT *
FROM pg_replication_slots;
```

A physical replication slot can retain WAL required by a standby.

However, a stalled replication slot can cause substantial WAL accumulation and fill the primary's storage.

**4. Rebuild the replica**

If the required WAL is unavailable, the standby may need to be recreated from a fresh base backup.

### 7.4 Important PostgreSQL Configuration

```sql
SHOW wal_keep_size;

SHOW max_replication_slots;

SHOW max_wal_senders;
```

These settings are related to WAL retention and replication capacity.

The correct values depend on workload, number of replicas, expected disconnection duration, and available storage.

---

## 8. Replication Conflicts

Replication conflicts occur when changes being replayed on a standby interact with activities running on that standby.

This is particularly relevant to PostgreSQL physical standby servers that also serve read queries.

### 8.1 Example: Long-Running Query

Suppose:

1. A reporting query starts on a standby.
2. It needs to read an older row version.
3. The primary updates or deletes that row.
4. The primary generates WAL associated with cleanup or other changes.
5. The standby needs to replay WAL that conflicts with the query.

PostgreSQL may have to choose between delaying replay and allowing the query to continue.

Depending on standby settings and conditions, the query may be canceled to allow recovery to proceed.

### 8.2 Why Does This Matter?

Suppose you use a replica for a report:

```sql
SELECT
    product_id,
    COUNT(*)
FROM orders
GROUP BY product_id;
```

The query takes several minutes.

During that time, WAL replay may encounter a conflict.

The query may be canceled.

This can be surprising if you expect replicas to behave exactly like independent read-only databases.

### 8.3 How to Handle Replication Conflicts

Possible approaches:

- Avoid unnecessarily long-running queries on replicas.
- Optimize reporting queries.
- Use dedicated reporting infrastructure.
- Tune standby conflict-related settings carefully.
- Monitor canceled queries and recovery delays.

PostgreSQL settings and mechanisms include:

```ini
max_standby_streaming_delay = 30s
```

This controls how long the standby may delay WAL replay to resolve conflicts with queries using streaming replication.

Another setting is:

```ini
hot_standby_feedback = on
```

This allows the standby to communicate information about queries that may need older row versions.

However, enabling hot standby feedback can increase dead-tuple retention and table bloat on the primary.

These settings involve tradeoffs; they should not be enabled blindly.

---

## 9. Failover Is Not Just Promoting a Replica

A common mistake is assuming that promoting a replica is enough to restore an application.

It is not.

A production system must also handle:

1. Failure detection
2. Replica selection
3. Safe promotion
4. Preventing the old primary from accepting writes
5. Database connection routing
6. Application connection-pool recovery
7. Rebuilding or rejoining the old primary
8. Monitoring and verification

### Example Architecture

```text
                Node.js Application
                         |
                    DB Endpoint
                         |
                   Failover Router
                         |
                 Current Primary
                         |
                -----------------
                |               |
             Replica 1       Replica 2
```

After failover:

```text
                Node.js Application
                         |
                    DB Endpoint
                         |
                   Failover Router
                         |
                    Replica 1
                    (New Primary)
                         |
                -----------------
                |               |
           Old Primary      Replica 2
          (Fenced/Repair)     (Standby)
```

The application should connect through a mechanism that can identify the current primary.

This might involve:

- A database proxy
- A managed database endpoint
- DNS or service discovery
- A failover-aware connection manager

The actual mechanism depends on the deployment architecture.

### Node.js Connection Pool Consideration

A Node.js application may have an existing PostgreSQL connection pool connected to the old primary.

After failover, those connections may become invalid.

The application needs to:

- Detect connection failures.
- Re-establish connections.
- Connect to the new primary endpoint.
- Handle transactions that were interrupted.
- Avoid blindly retrying non-idempotent operations.

This is an application-level part of database high availability.

---

## 10. Idempotency During Failover and Retries

This is particularly important for backend developers.

Imagine:

1. A user submits a payment.
2. The database commits the payment.
3. The primary crashes before the API response reaches the client.
4. The client retries the request.
5. The backend processes the payment again.

The application may create duplicate payment records or charge the user twice if the operation is not protected.

### 10.1 What Is Idempotency?

An operation is idempotent if performing it multiple times has the same intended effect as performing it once.

For example, setting an order status to `PAID` is conceptually idempotent when repeated with the same target state.

Creating a new payment record is not automatically idempotent.

### 10.2 Use Idempotency Keys

The client sends a unique request identifier:

```json
{
  "idempotencyKey": "payment-req-12345",
  "orderId": 101,
  "amount": 2500
}
```

The database stores this key with a unique constraint.

```sql
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    order_id INTEGER NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL
);
```

The backend checks whether the key has already been processed.

Conceptually:

```javascript
async function processPayment(request) {
  const existing = await primaryPool.query(
    `SELECT *
     FROM payments
     WHERE idempotency_key = $1`,
    [request.idempotencyKey],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Perform the payment workflow with appropriate
  // transaction handling and uniqueness protection.
}
```

The example illustrates the idea, but a production implementation must also handle concurrent requests safely.

A unique constraint and transaction-based insert strategy are more reliable than relying only on a separate SELECT followed by INSERT.

For example:

```sql
INSERT INTO payments (
    idempotency_key,
    order_id,
    amount,
    status
)
VALUES (
    'payment-req-12345',
    101,
    2500,
    'SUCCESS'
)
ON CONFLICT (idempotency_key)
DO NOTHING;
```

The application must then retrieve and return the existing result when a conflict occurs.

**Important:** Idempotency protects application operations from duplicate processing. It does not itself solve replication consistency or guarantee that a transaction survives failover.

---

## 11. Monitoring Replication in PostgreSQL

Replication should not be configured and then ignored.

You need to monitor whether replicas are connected, receiving WAL, and replaying changes.

### 11.1 Check Connected Replicas on the Primary

```sql
SELECT
    application_name,
    client_addr,
    state,
    sync_state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn
FROM pg_stat_replication;
```

Important columns:

| Column             | Meaning                                     |
| ------------------ | ------------------------------------------- |
| `application_name` | Standby's application name                  |
| `client_addr`      | Standby's connection address                |
| `state`            | Replication connection state                |
| `sync_state`       | Whether the standby is async or synchronous |
| `sent_lsn`         | WAL position sent by primary                |
| `write_lsn`        | WAL position written by standby             |
| `flush_lsn`        | WAL position flushed by standby             |
| `replay_lsn`       | WAL position replayed by standby            |

### 11.2 Check Replication Receiver on the Standby

```sql
SELECT
    status,
    receive_start_lsn,
    written_lsn,
    flushed_lsn,
    latest_end_lsn
FROM pg_stat_wal_receiver;
```

This view provides information about the standby's WAL receiver.

### 11.3 Check Recovery Status

```sql
SELECT pg_is_in_recovery();
```

- `true`: The server is in recovery, such as a standby.
- `false`: The server is not currently in recovery, such as a primary.

### 11.4 Check Replication Lag on the Primary

PostgreSQL provides:

```sql
SELECT
    application_name,
    state,
    write_lag,
    flush_lag,
    replay_lag
FROM pg_stat_replication;
```

These columns provide time-based estimates of recent write, flush, and replay delays.

They are not guaranteed to represent the exact current lag at every moment. For example, lag values can become NULL when there has been no recent relevant activity.

### 11.5 Compare WAL Positions

You can inspect the current WAL position on the primary:

```sql
SELECT pg_current_wal_lsn();
```

On a standby:

```sql
SELECT pg_last_wal_receive_lsn();

SELECT pg_last_wal_replay_lsn();
```

The receive position and replay position help distinguish WAL transfer from WAL application.

LSN stands for **Log Sequence Number**.

It identifies a position in the WAL stream.

Do not subtract textual LSN values directly. PostgreSQL provides functions such as `pg_wal_lsn_diff()` for calculating the byte difference between WAL positions.

---

## 12. Replication Challenges: Summary Table

| Challenge                 | What Happens?                              | Common Approach                                                        |
| ------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| Replication lag           | Replica falls behind primary               | Monitor and improve transfer/replay capacity                           |
| Stale reads               | Application receives old data              | Route consistency-sensitive reads to primary                           |
| Primary failure           | Primary becomes unavailable                | Failover                                                               |
| Split brain               | Multiple servers accept writes             | Fencing, quorum, leader coordination                                   |
| Data loss during failover | Promoted replica lacks recent transactions | Synchronous replication, WAL preservation, correct candidate selection |
| WAL retention issue       | Replica cannot obtain required WAL         | WAL archiving, replication slots, rebuilding                           |
| Replication conflicts     | Recovery conflicts with standby queries    | Optimize queries and tune standby settings                             |
| Connection failure        | Application cannot use old connections     | Reconnect and route to current primary                                 |
| Duplicate operations      | Retry repeats an already committed action  | Idempotency keys and unique constraints                                |

---

## 13. Practical Scenario: Primary Failure During an Order

Consider this production situation.

Your application has:

- One primary database.
- Three asynchronous replicas.
- A Node.js backend.
- Thousands of active users.

The primary crashes while users are creating orders.

The replicas have different replay positions:

| Server                 | Latest Replayed Transaction |
| ---------------------- | --------------------------- |
| Primary before failure | Transaction 1050            |
| Replica 1              | Transaction 1049            |
| Replica 2              | Transaction 1048            |
| Replica 3              | Transaction 1050            |

Replica 3 is the most up to date.

### What Should Happen?

**Step 1: Detect primary failure**

The monitoring system identifies that the primary is unavailable.

**Step 2: Prevent the old primary from accepting writes**

The old primary must be fenced or otherwise prevented from becoming an independent writer.

**Step 3: Select a suitable replica**

Replica 3 is a candidate because it has replayed the most recent transaction.

**Step 4: Promote the candidate**

Replica 3 is promoted.

**Step 5: Redirect application connections**

The Node.js application connects to the new primary.

**Step 6: Handle interrupted requests**

Some requests may have committed before the crash, while others may not have committed.

The application must determine outcomes safely, using transaction status checks and idempotency where appropriate.

**Step 7: Rebuild or rejoin the old primary**

The old primary must be synchronized with the new primary before rejoining the topology.

### Important Question

What happens to Transaction 1050 if the old primary crashed before its WAL reached any replica?

It may be lost after promotion.

This is a fundamental risk of asynchronous replication.

Selecting the most up-to-date replica reduces the risk of data loss, but cannot recover WAL that was never received or preserved elsewhere.

---

## 14. Important PostgreSQL Tools and Concepts

| Tool / Setting                | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `pg_stat_replication`         | Monitor standby connections from primary             |
| `pg_stat_wal_receiver`        | Inspect WAL receiver on standby                      |
| `pg_is_in_recovery()`         | Determine whether server is in recovery              |
| `pg_current_wal_lsn()`        | Get current WAL position on primary                  |
| `pg_last_wal_receive_lsn()`   | Get latest WAL receive position on standby           |
| `pg_last_wal_replay_lsn()`    | Get latest WAL replay position on standby            |
| `pg_wal_lsn_diff()`           | Calculate difference between WAL positions           |
| `wal_keep_size`               | Retain a minimum amount of recent WAL                |
| `max_replication_slots`       | Configure the maximum number of replication slots    |
| `max_wal_senders`             | Configure the maximum number of WAL sender processes |
| `hot_standby_feedback`        | Send feedback to primary about standby query needs   |
| `max_standby_streaming_delay` | Control standby delay for conflicting queries        |

---

## 15. Common Misconceptions

### Misconception 1: Replicas are always identical to the primary.

Incorrect.

Replicas can temporarily lag behind the primary.

### Misconception 2: If the primary crashes, any replica can safely become primary.

Incorrect.

The replica's replay position and the failure scenario matter. Promoting an outdated replica can lose recently committed transactions.

### Misconception 3: Failover is just running `pg_promote()`.

Incorrect.

Promotion is only one step. You must also prevent split brain, route application traffic, and handle the old primary.

### Misconception 4: Synchronous replication eliminates every replication problem.

Incorrect.

It can strengthen acknowledgment guarantees, but it does not eliminate stale reads in every configuration, split brain, application errors, or the need for backups.

### Misconception 5: Replication lag is always caused by network latency.

Incorrect.

Slow storage, high write volume, insufficient CPU, long-running queries, and other resource constraints can also contribute.

### Misconception 6: A replica is a backup.

Incorrect.

Replication can propagate unwanted changes. Backups provide separate recovery points.

### Misconception 7: Restarting a disconnected replica always fixes replication.

Incorrect.

If the required WAL is no longer available, the standby may need WAL from an archive or a new base backup.

### Misconception 8: Retrying a failed API request is always safe.

Incorrect.

The database may have committed the transaction even though the application did not receive the response. Use idempotency and transaction-status handling for important operations.

---

## 16. Interview Questions

### Q1. What is replication lag?

Replication lag is the delay between a change occurring on the primary and that change being received, flushed, or replayed on a replica.

### Q2. What causes replication lag?

Network latency, high write volume, slow replica hardware, storage limitations, heavy queries, and large transactions can cause replication lag.

### Q3. What is a stale read?

A stale read occurs when an application reads an older version of data from a replica instead of the latest version available on the primary.

### Q4. How do you prevent read-after-write inconsistency?

Route reads requiring the latest committed data to the primary, use session-level read-your-writes routing, or wait until a replica has replayed the relevant WAL position.

### Q5. What is failover?

Failover is the process of switching database service from a failed primary to another suitable database server.

### Q6. What is replica promotion?

Promotion is the process of converting a standby into a primary so that it can accept writes.

### Q7. What is split brain?

Split brain occurs when multiple servers incorrectly operate as independent primaries for the same logical database system.

### Q8. How can split brain be prevented?

Use fencing, quorum, leader coordination, and reliable failover orchestration to ensure that only one authorized primary accepts writes.

### Q9. What is RPO?

Recovery Point Objective describes the maximum amount of data loss an organization is prepared to tolerate, measured in time.

### Q10. What is RTO?

Recovery Time Objective describes the maximum acceptable time required to restore service after an outage.

### Q11. What happens if a replica needs WAL that has already been removed?

The replica may be unable to continue recovery from the primary's available WAL. It may need to retrieve archived WAL or be rebuilt from a new base backup.

### Q12. What is a replication slot?

A PostgreSQL replication slot tracks the WAL required by a replication consumer and prevents required WAL from being recycled prematurely.

### Q13. What is the risk of replication slots?

If a consumer stops progressing, a slot can retain large amounts of WAL and cause disk-space exhaustion.

### Q14. What are replication conflicts?

They occur when WAL replay on a standby conflicts with activities such as long-running read queries.

### Q15. What is fencing?

Fencing prevents an old or failed primary from continuing to accept writes after another server has been promoted.

### Q16. Why is idempotency important during failover?

A request may have committed even though the client did not receive the response. Idempotency prevents a retry from performing the same business operation twice.

### Q17. Does synchronous replication guarantee zero downtime?

No. It improves replication acknowledgment guarantees, but failover, promotion, application reconnection, and recovery still take time.

### Q18. How would you monitor PostgreSQL replication?

Use `pg_stat_replication` on the primary, `pg_stat_wal_receiver` on the standby, WAL positions, and recovery status.

### Q19. What is the difference between WAL receive lag and replay lag?

Receive lag concerns how far WAL has been transferred to the standby. Replay lag concerns how far the standby has applied that WAL.

### Q20. Why should the old primary not simply restart after failover?

It may contain a different transaction history. It must be safely reconfigured and synchronized with the new primary before rejoining.

---

## 17. Practical Learning Exercise

You can run these queries on a PostgreSQL test environment. Replication-specific views may be empty if you have not configured a standby.

### Exercise A: Check Whether the Server Is Primary or Standby

```sql
SELECT pg_is_in_recovery();
```

### Exercise B: Inspect Connected Replicas

Run on the primary:

```sql
SELECT
    application_name,
    client_addr,
    state,
    sync_state,
    replay_lsn
FROM pg_stat_replication;
```

### Exercise C: Inspect WAL Receiver

Run on the standby:

```sql
SELECT
    status,
    written_lsn,
    flushed_lsn,
    latest_end_lsn
FROM pg_stat_wal_receiver;
```

### Exercise D: Understand WAL Positions

On the primary:

```sql
SELECT pg_current_wal_lsn();
```

On the standby:

```sql
SELECT
    pg_last_wal_receive_lsn(),
    pg_last_wal_replay_lsn();
```

### Exercise E: Calculate WAL Position Difference

On the primary, you can inspect the difference between its current WAL position and the replay position reported for a standby:

```sql
SELECT
    application_name,
    pg_wal_lsn_diff(
        pg_current_wal_lsn(),
        replay_lsn
    ) AS bytes_behind
FROM pg_stat_replication;
```

This gives a WAL byte-distance estimate. It is not a direct measurement of time-based replication lag.

### Exercise F: Design a Failure-Recovery Plan

Assume:

- One primary.
- Two asynchronous replicas.
- Primary crashes.
- Replica 1 is 2 seconds behind.
- Replica 2 is 10 seconds behind.

Answer these questions:

1. Which replica would you initially consider for promotion?
2. What must happen to the old primary before promotion?
3. How will you redirect Node.js connections?
4. How will you handle requests whose commit status is unknown?
5. What will you do with the old primary after recovery?

Expected reasoning:

- Replica 1 is the more up-to-date candidate, subject to validating its health and WAL state.
- Prevent the old primary from accepting independent writes.
- Route connections to the new primary.
- Use idempotency and transaction-status checks for uncertain requests.
- Rebuild or safely rejoin the old primary as a standby.

---

## 18. Chapter Summary

| Topic                 | Key Takeaway                                                  |
| --------------------- | ------------------------------------------------------------- |
| Replication Lag       | Replica is behind the primary                                 |
| Stale Reads           | Application receives older data                               |
| Read-Your-Writes      | A client should see its successful writes in subsequent reads |
| Failover              | Switch service to another database server                     |
| Promotion             | Convert standby into primary                                  |
| Split Brain           | Multiple servers accept independent writes                    |
| Fencing               | Prevent the old primary from accepting writes                 |
| RPO                   | Maximum acceptable data loss                                  |
| RTO                   | Maximum acceptable recovery time                              |
| WAL Retention         | Required WAL must remain available                            |
| Replication Slots     | Prevent required WAL from being recycled                      |
| Replication Conflicts | WAL replay conflicts with standby queries                     |
| Idempotency           | Prevent duplicate business operations during retries          |
| Monitoring            | Track replication state, WAL positions, and lag               |

### The most important mental model

A production replication architecture must answer five questions:

1. **Is the replica up to date?** — Replication lag.
2. **Will the application see fresh data?** — Read consistency.
3. **What happens when the primary fails?** — Failover.
4. **Can two servers accept writes simultaneously?** — Split-brain prevention.
5. **How much data and time can we afford to lose?** — RPO and RTO.

Replication is not just about copying data. It is about maintaining a reliable database system when servers, networks, and applications fail.
