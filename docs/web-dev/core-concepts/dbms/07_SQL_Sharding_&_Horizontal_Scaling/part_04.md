---
sidebar_label: Sharding Challenges
sidebar_position: 1
---

# Sharding Challenges

## 1. Introduction: What Problems Does Sharding Introduce?

In last 3 sections we learned what sharding is and why databases use it, different sharding strategies and how queries execute across multiple shards.

Now comes the most important part: **What problems does sharding introduce in a production system?**

Sharding helps distribute storage and workload, but it also turns a relatively simple database architecture into a distributed system.

Consider an e-commerce application with three database shards:

- Shard 1 stores users.
- Shard 2 stores inventory.
- Shard 3 stores orders and payments.

A customer places an order.

The application needs to:

1. Validate the user.
2. Check product availability.
3. Reserve inventory.
4. Process payment.
5. Create the order.
6. Confirm the transaction.

What happens if inventory is reserved successfully, but payment fails?

What happens if payment succeeds, but the order database becomes unavailable?

In a single database, these operations might be handled within one ACID transaction.

Across multiple database servers, coordinating them becomes significantly harder.

This chapter covers the major challenges of sharding:

1. Cross-shard transactions
2. Distributed transactions
3. Two-Phase Commit (2PC)
4. Global unique IDs
5. Foreign keys across shards
6. Cross-shard JOIN complexity
7. Data migration
8. Rebalancing challenges
9. Hot shards
10. Failure handling and consistency

---

## 2. Cross-Shard Transactions

### 2.1 What Is a Cross-Shard Transaction?

A cross-shard transaction is a transaction that needs to modify or access data stored on multiple database shards.

Consider an e-commerce application.

| Data      | Shard   |
| --------- | ------- |
| Users     | Shard 1 |
| Inventory | Shard 2 |
| Orders    | Shard 3 |

A customer places an order.

The application needs to:

- Validate the user on Shard 1.
- Reserve inventory on Shard 2.
- Create the order on Shard 3.

```text
                 Create Order
                      |
             -------------------
             |        |        |
             v        v        v
          Shard 1  Shard 2  Shard 3
          Users    Inventory Orders
```

The operation involves multiple database servers.

This is a cross-shard operation.

### 2.2 Why Is It a Problem?

Consider this sequence:

1. Inventory is successfully reserved on Shard 2.
2. Payment is processed successfully.
3. Order creation fails on Shard 3.

Now the system has an inconsistent business state.

```text
Shard 2: Inventory Reserved
Shard 3: Order Not Created
```

The customer may have been charged without receiving a confirmed order.

This is the central problem: **A transaction on one database server does not automatically provide atomicity across other database servers.**

### 2.3 Single-Shard vs Cross-Shard Transactions

| Feature                   | Single-Shard Transaction                     | Cross-Shard Transaction                                         |
| ------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| Database servers involved | One                                          | Multiple                                                        |
| Coordination              | Local database                               | Distributed coordination                                        |
| Atomicity                 | Usually handled by local transaction manager | Requires distributed coordination or application-level recovery |
| Complexity                | Lower                                        | Higher                                                          |
| Network communication     | Usually local to one database                | Between multiple servers                                        |
| Failure handling          | Local rollback and recovery                  | Must handle partial completion                                  |

### 2.4 Important Design Principle

Whenever possible, design operations so that related transactional data lives on the same shard.

For example, if orders and their order items are frequently modified together, storing them on the same shard can simplify transactions.

However, not every operation can be confined to one shard.

Some business workflows naturally involve multiple services, databases, or external systems.

---

## 3. Distributed Transactions

### 3.1 What Is a Distributed Transaction?

A distributed transaction is a transaction involving multiple independent transactional participants, such as database servers.

The goal is to coordinate the participants so that the overall operation satisfies the required correctness guarantees.

For example:

```text
             Distributed Transaction
                       |
             ---------------------
             |         |         |
             v         v         v
          Shard 1   Shard 2   Shard 3
           Users   Inventory  Orders
```

All participating systems need to coordinate their work.

### 3.2 Why Do We Need Distributed Transactions?

Consider a bank transfer where:

- Account A is stored on Shard 1.
- Account B is stored on Shard 2.

The application needs to transfer ₹5,000.

The required operations are:

```text
Shard 1:
Deduct ₹5,000 from Account A

Shard 2:
Add ₹5,000 to Account B
```

The desired business invariant is:

**Money must not disappear or be created because only one side of the transfer completed.**

What if the deduction succeeds but the credit fails?

```text
Account A: ₹10,000 -> ₹5,000
Account B: ₹2,000  -> ₹2,000
```

The transfer is incomplete.

A distributed transaction mechanism attempts to coordinate these operations.

### 3.3 Distributed Transaction Requirements

Depending on the chosen protocol and system, the design may need to provide:

- Atomicity across participants.
- Consistent state transitions.
- Isolation guarantees.
- Durability of committed operations.
- Recovery after failures.

Not every distributed workflow uses a traditional distributed ACID transaction.

Some systems use eventual consistency and compensating operations instead.

### 3.4 Two Broad Approaches

There are two important approaches to coordinating multi-system business operations:

1. Distributed commit protocols, such as Two-Phase Commit.
2. Application-level workflows, such as the Saga pattern.

We will study both.

---

## 4. Two-Phase Commit (2PC)

### 4.1 What Is Two-Phase Commit?

Two-Phase Commit (2PC) is a distributed transaction protocol that coordinates multiple participants so they can commit or abort a transaction together.

It has two phases:

1. Prepare Phase
2. Commit Phase

The protocol typically involves:

- A coordinator
- Multiple participants

The coordinator manages the protocol.

Participants are the database servers involved in the transaction.

### 4.2 Architecture

```text
                Coordinator
                     |
          -----------------------
          |          |          |
          v          v          v
       Shard 1    Shard 2    Shard 3
      Participant Participant Participant
```

### 4.3 Phase 1: Prepare Phase

The coordinator asks all participants whether they are ready to commit.

```text
Coordinator -> Shard 1: PREPARE
Coordinator -> Shard 2: PREPARE
Coordinator -> Shard 3: PREPARE
```

Each participant:

1. Executes the required transactional operations.
2. Checks whether it can commit.
3. Persists the necessary transaction state.
4. Votes YES or NO.

Example:

| Participant | Vote |
| ----------- | ---- |
| Shard 1     | YES  |
| Shard 2     | YES  |
| Shard 3     | YES  |

If a participant cannot prepare, it votes NO.

A successful prepare means the participant has promised that it can commit later, assuming the protocol proceeds correctly.

It does not mean the transaction has already committed.

### 4.4 Phase 2: Commit Phase

If every participant votes YES, the coordinator decides to commit.

```text
Coordinator -> Shard 1: COMMIT
Coordinator -> Shard 2: COMMIT
Coordinator -> Shard 3: COMMIT
```

All participants commit their prepared transactions.

```text
              Coordinator
                   |
                COMMIT
                   |
        -----------------------
        |          |          |
        v          v          v
      Shard 1   Shard 2    Shard 3
      COMMIT    COMMIT     COMMIT
```

### 4.5 What If One Participant Votes NO?

Suppose:

| Participant | Vote |
| ----------- | ---- |
| Shard 1     | YES  |
| Shard 2     | NO   |
| Shard 3     | YES  |

The coordinator decides to abort.

It instructs the participants to roll back their prepared transactions.

```text
              Coordinator
                   |
                 ABORT
                   |
        -----------------------
        |          |          |
        v          v          v
      Shard 1   Shard 2    Shard 3
      ABORT     ABORT      ABORT
```

The goal is to prevent only some participants from committing the distributed transaction.

### 4.6 Complete 2PC Flow

<text weight="semibold" color="default" size="sm">Phase 1 — Prepare</text>

```text
Coordinator
     |
     | PREPARE
     |
     +-------> Shard 1
     |
     +-------> Shard 2
     |
     +-------> Shard 3
     |
     v
Collect Votes
     |
     v
All YES?
```

<text weight="semibold" color="default" size="sm">Phase 2 — Decision</text>

```text
             All YES?
              /    \
            YES     NO
             |       |
             v       v
          COMMIT   ABORT
             |       |
             v       v
        All Commit All Abort
```

### 4.7 Advantages of 2PC

- Coordinates atomic commit across multiple participants.
- Prevents a normal successful protocol execution from committing only a subset of participants.
- Useful when strong transactional guarantees are required.
- Provides a structured recovery protocol.

### 4.8 Disadvantages of 2PC

**1. Blocking**

A participant may remain prepared while waiting for the coordinator's final decision.

During this time, it may hold locks or other resources.

**2. Coordinator failure**

If the coordinator fails at a critical point, participants may not know whether to commit or abort.

They may need to wait for recovery and consult durable protocol state.

**3. Network dependency**

Participants must communicate with the coordinator.

Network failures can delay transaction completion.

**4. Performance overhead**

Prepare and commit require coordination across multiple servers.

**5. Operational complexity**

Distributed transaction recovery requires careful logging, monitoring, and failure handling.

### 4.9 Is 2PC Always the Best Solution?

No.

2PC is appropriate when the system genuinely needs distributed atomic commit and can tolerate its coordination and operational costs.

Many modern applications prefer to avoid distributed transactions across service boundaries and use Saga-style workflows instead.

---

## 5. Saga Pattern

### 5.1 What Is the Saga Pattern?

The Saga pattern is a way to manage a long-running business transaction as a sequence of smaller local transactions.

Each step commits independently.

If a later step fails, the application executes compensating transactions to reverse or counteract earlier business actions.

Unlike 2PC, a Saga does not keep every participant in one prepared transaction until a global commit decision.

### 5.2 E-Commerce Example

Suppose a customer places an order.

The workflow has these steps:

1. Reserve inventory.
2. Charge payment.
3. Create the order.
4. Confirm the order.

Each step is a separate local transaction.

```text
             Place Order
                  |
                  v
           Reserve Inventory
                  |
                  v
             Charge Payment
                  |
                  v
              Create Order
                  |
                  v
            Confirm Order
```

### 5.3 What Happens If Payment Fails?

Suppose inventory reservation succeeds but payment fails.

The system executes a compensating operation:

```text
Reserve Inventory
        |
        v
Payment Failed
        |
        v
Release Inventory
```

The compensating transaction reverses the business effect of the earlier reservation.

### 5.4 Saga With Compensation

| Forward Transaction | Compensating Transaction   |
| ------------------- | -------------------------- |
| Reserve inventory   | Release inventory          |
| Charge payment      | Refund payment             |
| Create order        | Cancel order               |
| Allocate shipment   | Cancel shipment allocation |

Compensation does not necessarily erase history.

For example, a refund is a new financial transaction, not the deletion of the original payment record.

### 5.5 Saga Architecture

```text
               Saga Coordinator
                      |
                      v
               Reserve Inventory
                      |
                      v
                 Charge Payment
                      |
                      v
                 Create Order
                      |
                      v
                Workflow Complete
```

If a step fails:

```text
               Saga Coordinator
                      |
                      v
               Reserve Inventory
                      |
                      v
                 Charge Payment
                      |
                      X
                      |
                 Payment Failed
                      |
                      v
              Release Inventory
                      |
                      v
                Workflow Failed
```

### 5.6 Two Saga Implementation Styles

**1. Orchestration**

A central coordinator decides which step executes next and which compensating action is needed.

```text
             Saga Orchestrator
               /     |      \
              v      v       v
         Inventory Payment  Orders
```

**2. Choreography**

Services react to events and trigger the next step without a central orchestrator.

```text
Inventory Reserved
        |
        v
Payment Service
        |
        v
Payment Completed
        |
        v
Order Service
        |
        v
Order Created
```

### 5.7 2PC vs Saga

| Feature          | Two-Phase Commit                                                      | Saga                                                             |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Coordination     | Distributed commit coordinator                                        | Orchestrator or event-driven workflow                            |
| Transactions     | Participants prepare and commit                                       | Multiple independent local transactions                          |
| Failure handling | Abort prepared transaction                                            | Execute compensating transactions                                |
| Atomicity        | Atomic commit decision across participants under protocol assumptions | No single global atomic commit                                   |
| Lock duration    | Can hold resources while waiting                                      | Usually avoids holding database locks across the entire workflow |
| Consistency      | Stronger transactional coordination                                   | Often eventual consistency                                       |
| Typical use      | Distributed transactional systems                                     | Long-running business workflows                                  |

### Important Distinction

A Saga is not equivalent to a traditional ACID transaction.

Compensating operations may fail, require retries, or need manual intervention.

A Saga therefore needs:

- Durable workflow state.
- Idempotent operations.
- Retry policies.
- Compensation logic.
- Monitoring and reconciliation.

---

## 6. Global Unique IDs

### 6.1 Why Are Global Unique IDs a Problem?

In a single PostgreSQL database, you can use:

```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100)
);
```

The database manages ID generation.

Now suppose you have three independent shards.

Each shard has its own sequence.

```text
Shard 1: 1, 2, 3, 4, 5
Shard 2: 1, 2, 3, 4, 5
Shard 3: 1, 2, 3, 4, 5
```

The same ID can exist on multiple shards.

If user ID 5 exists on all three shards, how do you identify the correct user globally?

This creates a unique-ID challenge.

### 6.2 Why Do We Need Global Uniqueness?

IDs may be used in:

- APIs
- Logs
- Event messages
- Orders
- Payments
- External integrations
- References between services

A globally unique identifier makes it possible to identify records without relying on the shard alone.

### 6.3 Solution 1: UUID

UUID stands for Universally Unique Identifier.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

Instead of using small sequential integers, each shard can generate UUIDs.

PostgreSQL example:

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    name VARCHAR(100)
);
```

UUID generation can happen in the application or database.

**Advantages**

- Can be generated independently.
- No central ID-generation service is required.
- Very low collision probability when generated correctly.

**Disadvantages**

- Larger than a 64-bit integer.
- Random UUID insertion can reduce B-tree locality.
- Indexes and foreign-key references can consume more storage.

UUIDv7 is a time-ordered UUID variant that can improve index locality compared with fully random UUIDv4 in many workloads.

### 6.4 Solution 2: Snowflake-Style IDs

A Snowflake-style ID generator creates a large numeric identifier using multiple components.

A common conceptual structure is:

```text
+----------------+----------------+----------------+
| Timestamp      | Node ID        | Sequence       |
+----------------+----------------+----------------+
```

For example:

- Timestamp identifies when the ID was generated.
- Node ID identifies the generator.
- Sequence distinguishes IDs generated during the same time unit.

Conceptually:

```text
Generator 1 -> IDs beginning with its node identifier
Generator 2 -> IDs beginning with its node identifier
Generator 3 -> IDs beginning with its node identifier
```

Each generator can produce IDs independently.

**Advantages**

- Numeric identifiers.
- Can be roughly time ordered.
- Distributed generation.
- Efficient storage compared with text UUIDs.

**Disadvantages**

- Requires unique generator/node identifiers.
- Clock synchronization matters.
- Sequence capacity must be managed.
- Generator configuration must prevent duplicate node identities.

### 6.5 Solution 3: Centralized ID Generator

A dedicated service generates IDs for the entire system.

```text
             Application Servers
                     |
                     v
              ID Generator
                     |
          -----------------------
          |          |          |
          v          v          v
       Shard 1    Shard 2    Shard 3
```

**Advantages**

- Centralized control.
- Easy to enforce one allocation policy.
- Can generate sequential identifiers.

**Disadvantages**

- Can become a bottleneck.
- Creates an additional dependency.
- Must be highly available.
- Network calls may increase latency.

### 6.6 Solution 4: Composite Identifiers

You can combine a shard identifier with a local record identifier.

For example:

```text
shard_id + local_id
```

Conceptually:

```text
Shard 1 + ID 101 -> 1-101
Shard 2 + ID 101 -> 2-101
Shard 3 + ID 101 -> 3-101
```

This makes identifiers distinguishable when the shard identifier is included.

However, composite identifiers require consistent handling across APIs, references, and application logic.

### 6.7 Comparison

| Strategy          | Main Advantage                                 | Main Disadvantage                        |
| ----------------- | ---------------------------------------------- | ---------------------------------------- |
| UUID              | Independent generation                         | Larger identifiers and index overhead    |
| Snowflake-style   | Compact numeric IDs and distributed generation | Clock and node coordination              |
| Central generator | Centralized uniqueness                         | Potential bottleneck and dependency      |
| Composite ID      | Uses local IDs with shard identity             | Requires shard-aware identifier handling |

---

## 7. Foreign Keys Across Shards

### 7.1 Why Are Foreign Keys a Problem?

In a single database, you can define:

```sql
CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id)
);
```

The database checks that the referenced user exists.

Now suppose:

```text
Shard 1:
users

Shard 2:
orders
```

The orders table is on one database server, and users are on another.

Can Shard 2 automatically enforce the normal PostgreSQL foreign key against Shard 1?

Not with an ordinary PostgreSQL foreign-key constraint.

A normal foreign key references a table available within the same database constraint context. Independent PostgreSQL servers do not automatically share one global referential-integrity mechanism.

### 7.2 Why Is This Difficult?

Suppose an order references:

```text
user_id = 101
```

The orders shard needs to verify that user 101 exists on another shard.

But what happens if:

1. The user is deleted after validation.
2. The remote shard becomes unavailable.
3. The user moves to another shard.
4. A request reaches the wrong shard.

The application must manage these cases.

### 7.3 Common Solutions

**1. Co-locate Related Data**

Store users and their orders on the same shard whenever possible.

This allows ordinary local foreign keys.

**2. Application-Level Validation**

The backend checks that the referenced record exists before creating the dependent record.

However, this is not equivalent to an atomic database foreign-key constraint. Concurrent deletion or migration can still introduce race conditions.

**3. Denormalized Reference Data**

Store selected information about the referenced record alongside the dependent record.

For example, an order might store:

```text
user_id
user_name_snapshot
shipping_address_snapshot
```

This is useful when historical information must remain available even if the original user record changes.

**4. Distributed Database Support**

Some distributed SQL systems provide global transactional and referential-integrity features, but the exact capabilities and limitations depend on the database.

### 7.4 Important Lesson

When designing a sharded database, relationships that were previously enforced by one database may become application-level responsibilities.

This is one of the major costs of sharding.

---

## 8. Cross-Shard JOIN Complexity

In Part 7C, we studied distributed JOIN execution.

Here, focus on why cross-shard JOINs become an architectural challenge.

Suppose:

```text
Shard 1:
users

Shard 2:
orders

Shard 3:
products
```

You need:

```sql
SELECT
    users.name,
    orders.order_id,
    products.product_name
FROM users
JOIN orders
    ON users.user_id = orders.user_id
JOIN products
    ON orders.product_id = products.product_id;
```

The query requires data from three separate servers.

### Problems

- Data must be transferred between servers or through a query engine.
- Network communication increases latency.
- Result sets may become large.
- Each shard can fail independently.
- Global sorting and pagination become more complicated.
- Consistent reads may require additional coordination.

### Solutions

1. Co-locate related records when appropriate.
2. Use shard keys that support common JOIN paths.
3. Denormalize frequently accessed data carefully.
4. Use application-level aggregation when the result sizes are manageable.
5. Use a distributed query engine when the architecture supports it.

**Do not assume every relational JOIN remains cheap after distributing tables across servers.**

---

## 9. Data Migration Between Shards

### 9.1 Why Is Data Migration Needed?

As an application grows, the original data distribution may no longer be suitable.

For example:

```text
Before:

Shard 1: 80 million records
Shard 2: 10 million records
Shard 3: 10 million records
```

Shard 1 is overloaded.

You decide to move 30 million records from Shard 1 to Shard 2 and Shard 3.

This is shard data migration.

### 9.2 Why Is Online Migration Difficult?

The application may continue receiving requests while records are being moved.

Suppose a user is being migrated.

During migration:

- A request updates the user's record on the old shard.
- Another request reads the new shard.
- The migration process copies an older version of the record.

The system could end up with stale or inconsistent data.

### 9.3 A Conceptual Migration Process

**Step 1: Identify Records**

Determine which records need to move.

**Step 2: Copy Existing Data**

Copy the records from the source shard to the destination shard.

**Step 3: Track Concurrent Writes**

Capture updates made while the copy is running.

**Step 4: Synchronize Changes**

Apply the captured changes to the destination.

**Step 5: Verify Data**

Compare counts, checksums, and important application-level invariants.

**Step 6: Switch Routing**

Update shard metadata so new requests use the destination.

**Step 7: Retire Old Data**

Remove the old copies only after the migration is confirmed safe.

### 9.4 Architecture

```text
             Source Shard
                  |
             Copy Data
                  |
                  v
            Destination Shard
                  |
            Apply New Changes
                  |
                  v
             Verify Data
                  |
                  v
            Update Routing
                  |
                  v
             Migration Done
```

### 9.5 Migration Challenges

- Concurrent writes
- Duplicate records
- Missing records
- Routing inconsistencies
- Downtime risk
- Network bandwidth
- Verification
- Rollback planning

Data migration is one of the most operationally difficult aspects of sharded database systems.

---

## 10. Rebalancing Challenges

### 10.1 What Is Rebalancing?

Rebalancing redistributes data or workload across shards to improve balance.

For example:

```text
Before:

Shard 1: 70M
Shard 2: 20M
Shard 3: 10M


After:

Shard 1: 34M
Shard 2: 33M
Shard 3: 33M
```

### 10.2 Why Is Rebalancing Difficult?

Rebalancing may involve moving millions of records while the application is running.

This can create:

- Heavy disk I/O
- Network congestion
- Increased database latency
- Additional replication traffic
- Temporary storage requirements
- More complicated routing

### 10.3 Data Balance vs Workload Balance

Consider:

| Shard   | Records | Requests/sec |
| ------- | ------: | -----------: |
| Shard 1 |     10M |       20,000 |
| Shard 2 |     10M |        2,000 |
| Shard 3 |     10M |        1,000 |

All three shards have equal record counts.

But Shard 1 handles much more traffic.

Rebalancing based only on storage size would not solve this problem.

A proper rebalancing strategy considers:

- Storage usage
- CPU usage
- Memory pressure
- Query latency
- Write throughput
- Network usage
- Request distribution

### 10.4 Rebalancing and Routing Metadata

After moving records, the router must know where those records now live.

If the routing metadata is updated too early or too late, requests can reach the wrong shard.

The migration and routing switch must therefore be coordinated.

---

## 11. Hot Shards

### 11.1 What Is a Hot Shard?

A hot shard is a shard that receives disproportionately high workload compared with other shards.

Example:

```text
Shard 1: 80% traffic
Shard 2: 10% traffic
Shard 3: 10% traffic
```

Shard 1 becomes a bottleneck even though the overall system has three servers.

### 11.2 Common Causes

**1. Poor shard key**

The selected key creates uneven distribution.

**2. Sequential keys**

Range-based sharding may send most new writes to the latest range.

**3. Large tenants**

One tenant may generate a disproportionate workload.

**4. Popular records**

A particular product or account may receive far more requests than other records.

**5. Uneven regional traffic**

One geographical region may have much more activity.

### 11.3 Solutions

- Reconsider the shard key.
- Move large tenants to dedicated shards.
- Rebalance data.
- Cache frequently requested records.
- Split hot ranges or partitions where appropriate.
- Use a distribution strategy that better matches the workload.

The correct solution depends on whether the hotspot comes from one record, one tenant, a key range, or an entire shard.

---

## 12. Failure Handling and Consistency

### 12.1 Why Is Failure Handling More Difficult?

In a single database, an application usually communicates with one database server for a transaction.

In a sharded system, multiple servers can fail independently.

For example:

```text
Shard 1: Available
Shard 2: Unavailable
Shard 3: Available
```

A query requiring all three shards may fail even though two shards are healthy.

### 12.2 Partial Failure

Consider a distributed order operation:

1. Inventory reservation succeeds.
2. Payment succeeds.
3. Order creation fails because Shard 3 is unavailable.

The system has a partial business operation.

This requires a recovery strategy.

Possible approaches include:

- Retrying the failed operation safely.
- Executing compensating actions.
- Using a distributed transaction protocol.
- Recording workflow state for later recovery.

### 12.3 Idempotency

Idempotency means that executing the same operation multiple times has the same intended effect as executing it once.

This is important because distributed systems often need retries.

Consider a payment request.

The application sends the payment request, but the response times out.

Did the payment succeed?

The application cannot safely assume it failed.

If it blindly retries, the customer might be charged twice.

A common solution is an idempotency key.

Example:

```text
payment_request_id = ORDER-1001-PAYMENT
```

The payment service records the key and ensures duplicate requests do not create duplicate charges.

Conceptual API request:

```javascript
await paymentService.charge({
  orderId: 1001,
  amount: 2500,
  idempotencyKey: "ORDER-1001-PAYMENT",
});
```

The payment service must persist and enforce the key correctly. Merely sending a unique string does not automatically provide idempotency.

### 12.4 Retry Strategy

Not every failure should be retried.

Examples:

| Failure                   | Possible Action                                |
| ------------------------- | ---------------------------------------------- |
| Temporary network timeout | Retry carefully                                |
| Deadlock                  | Retry the affected transaction                 |
| Validation error          | Do not retry without changing input            |
| Duplicate request         | Return the previously recorded result          |
| Shard unavailable         | Retry or fail according to availability policy |
| Payment timeout           | Check transaction status before retrying       |

Retries should use bounded attempts, appropriate backoff, and idempotency protections.

### 12.5 Consistency Across Shards

Suppose a user updates their profile.

The update succeeds on the primary shard, but a replica or another system has not received the change yet.

A subsequent read may return older data.

This is a consistency issue.

Distributed systems must decide what consistency guarantees are required for each operation.

For example:

- Payment confirmation may require strong correctness guarantees.
- Analytics dashboards may tolerate delayed updates.
- Activity feeds may tolerate eventual consistency.

There is no single consistency policy that is ideal for every operation.

---

## 13. Outbox Pattern and Reliable Event Delivery

A useful pattern for distributed applications is the Transactional Outbox Pattern.

### 13.1 What Problem Does It Solve?

Suppose the order service needs to:

1. Save an order in PostgreSQL.
2. Publish an `OrderCreated` event to a message broker.

A dangerous implementation is:

```text
Save Order
    |
    v
Publish Event
```

What happens if the order is saved but publishing the event fails?

The order exists, but downstream services never receive the event.

### 13.2 Transactional Outbox

Instead of publishing directly inside the business operation, store the event in an outbox table within the same local database transaction as the order.

```sql
BEGIN;

INSERT INTO orders (
    order_id,
    user_id,
    total_amount
)
VALUES (
    1001,
    101,
    2500
);

INSERT INTO outbox_events (
    event_id,
    event_type,
    payload
)
VALUES (
    'event-1001',
    'OrderCreated',
    '{"orderId": 1001}'
);

COMMIT;
```

A background worker reads the outbox and publishes events to the message broker.

```text
           Local Database Transaction
                      |
              -----------------
              |               |
              v               v
            Order          Outbox Event
              |               |
              -----------------
                      |
                   COMMIT
                      |
                      v
               Outbox Worker
                      |
                      v
                Message Broker
                      |
                      v
              Downstream Services
```

### 13.3 Advantages

- Order creation and event recording are atomic within the same database transaction.
- Events can be retried after temporary failures.
- Avoids the dual-write problem between the database and message broker.

### 13.4 Important Limitations

- The worker may publish an event more than once.
- Consumers should be idempotent.
- Outbox records need cleanup or archival.
- Event ordering may need additional handling.
- The pattern does not create a global ACID transaction across all services.

The outbox pattern is useful for reliable communication between independently managed components.

---

## 14. Sharding and Operational Complexity

Sharding increases the number of database servers and therefore increases operational responsibilities.

### 14.1 Backups

Each shard contains different data.

Backups must cover every shard.

A backup of only Shard 1 does not protect data stored on Shard 2 or Shard 3.

### 14.2 Monitoring

You need to monitor every shard individually.

For example:

| Metric          | Why It Matters               |
| --------------- | ---------------------------- |
| CPU             | Detect overloaded shards     |
| Memory          | Detect resource pressure     |
| Disk            | Prevent storage exhaustion   |
| Query latency   | Identify slow shards         |
| Connections     | Detect connection exhaustion |
| Replication lag | Monitor standby freshness    |
| Error rate      | Identify failures            |
| Request volume  | Detect workload imbalance    |

### 14.3 Schema Migrations

Suppose you add a column:

```sql
ALTER TABLE orders
ADD COLUMN delivery_status VARCHAR(30);
```

The schema change must be applied to every relevant shard.

If only some shards receive the change, application behavior may differ depending on which shard receives a query.

### 14.4 Disaster Recovery

A sharded system needs a recovery plan covering:

- Every shard
- Every replica
- Routing metadata
- ID generation infrastructure
- Distributed transaction state
- Application configuration

Recovering one shard does not necessarily recover the entire application.

---

## 15. How to Decide Between 2PC and Saga?

This is an important architectural decision.

| Requirement                                                     | Potential Approach              |
| --------------------------------------------------------------- | ------------------------------- |
| Strong atomic commit across transactional database participants | 2PC                             |
| Long-running business workflow                                  | Saga                            |
| Workflow includes external payment provider                     | Usually Saga-style coordination |
| Operations can be confined to one database                      | Local ACID transaction          |
| Event-driven microservices                                      | Often Saga + Outbox             |
| Compensation is acceptable                                      | Saga                            |
| All participants support distributed commit                     | 2PC may be appropriate          |

### Example 1: Bank Transfer

If two database participants must commit or abort a financial transfer as one distributed transaction, a distributed commit protocol may be appropriate.

The system must also account for recovery and operational behavior.

### Example 2: E-Commerce Order

An order involving inventory, payment, shipping, and notifications is often a better fit for a Saga.

Some steps involve external providers that cannot participate in a database-level 2PC transaction.

Compensating operations can handle failures.

### The Important Lesson

Do not automatically introduce distributed transactions whenever multiple databases are involved.

First determine:

1. Which business invariants must always hold?
2. Can the data be co-located?
3. Can the operation be modeled as independent local transactions?
4. Can compensation safely handle failure?
5. Is strong distributed atomic commit genuinely required?

---

## 16. Common Misconceptions

### Misconception 1: A transaction on one shard automatically covers all shards.

Incorrect.

A local database transaction does not automatically coordinate other database servers.

### Misconception 2: Two-Phase Commit eliminates every distributed failure.

Incorrect.

2PC coordinates commit decisions, but coordinator failures, blocking, network failures, and recovery still need to be handled.

### Misconception 3: Saga provides the same atomicity as 2PC.

Incorrect.

Saga uses independently committed local transactions and compensating actions. Intermediate states can be visible.

### Misconception 4: UUIDs guarantee absolutely zero collisions.

Incorrect.

UUID collisions are extremely unlikely when generated correctly, but uniqueness is probabilistic rather than mathematically impossible to violate.

### Misconception 5: Foreign keys work automatically across independent PostgreSQL shards.

Incorrect.

Normal PostgreSQL foreign-key constraints do not automatically enforce references across separate database servers.

### Misconception 6: Rebalancing only means copying rows.

Incorrect.

It also requires write synchronization, routing updates, verification, and safe retirement of old data.

### Misconception 7: Equal record counts mean balanced shards.

Incorrect.

Traffic and resource usage matter as much as record counts.

### Misconception 8: Retrying a failed payment request is always safe.

Incorrect.

A timeout does not prove the original request failed. Use idempotency and status checks.

### Misconception 9: The outbox pattern guarantees exactly-once event delivery.

Incorrect.

It helps ensure reliable event publication, but duplicate delivery is possible. Consumers need idempotent processing.

---

## 17. Interview Questions

### Q1. What is a cross-shard transaction?

A transaction involving data stored on multiple database shards.

### Q2. Why are cross-shard transactions difficult?

Because each shard has its own transaction manager, and local atomicity does not automatically provide global atomicity.

### Q3. What is a distributed transaction?

A transaction coordinated across multiple independent transactional participants.

### Q4. What is Two-Phase Commit?

A distributed commit protocol with a prepare phase and a commit or abort phase.

### Q5. What happens during the prepare phase?

The coordinator asks all participants to prepare. Each participant executes its work, records the prepared state, and votes YES or NO.

### Q6. What happens if one participant votes NO?

The coordinator decides to abort the transaction and instructs participants to roll back their prepared work.

### Q7. What is the main disadvantage of 2PC?

It can block participants while waiting for a final decision, especially when the coordinator fails.

### Q8. What is the Saga pattern?

A way to manage a long-running business transaction as a sequence of independent local transactions with compensating actions.

### Q9. What is a compensating transaction?

An operation that counteracts the business effect of an earlier successful transaction.

### Q10. What is the difference between 2PC and Saga?

2PC coordinates a distributed atomic commit. Saga uses local commits and compensating operations, usually allowing intermediate states.

### Q11. Why are global unique IDs needed?

To identify records uniquely across multiple database shards.

### Q12. What are common distributed ID-generation strategies?

UUIDs, Snowflake-style IDs, centralized ID generators, and composite identifiers.

### Q13. Why are foreign keys difficult across shards?

Independent database servers cannot automatically enforce normal local foreign-key constraints against tables on other servers.

### Q14. What is a hot shard?

A shard receiving disproportionately high workload compared with other shards.

### Q15. What is shard rebalancing?

Redistributing data or workload across shards to improve capacity and balance.

### Q16. Why is data migration difficult?

Because records may continue receiving writes while migration is happening, requiring synchronization, verification, and safe routing changes.

### Q17. What is idempotency?

An operation is idempotent when repeating it produces the same intended effect as performing it once.

### Q18. Why is idempotency important in distributed systems?

Because retries are common, and without idempotency they may create duplicate payments, orders, or other operations.

### Q19. What is the Transactional Outbox Pattern?

A pattern that records business changes and outgoing events in the same local database transaction, then publishes events asynchronously.

### Q20. Does the Outbox Pattern guarantee exactly-once delivery?

No. Duplicate delivery can happen, so consumers should process events idempotently.

### Q21. Why is schema migration more difficult in a sharded database?

The schema change must be applied consistently across all relevant shards while maintaining application compatibility.

### Q22. When should you avoid cross-shard transactions?

When the same business operation can be designed around one shard, or when independent local transactions and compensating actions can satisfy the business requirements more simply.

---

## 18. Practical Learning Exercise

### Exercise A: Identify the Challenge

Consider this architecture:

```text
Shard 1: Users
Shard 2: Inventory
Shard 3: Orders
Shard 4: Payments
```

A customer places an order.

Answer:

1. Which operations involve multiple shards?
2. What happens if inventory is reserved but payment fails?
3. What happens if payment succeeds but order creation fails?
4. Would a local PostgreSQL transaction cover all four shards?
5. Which distributed workflow approach could help?

Expected reasoning:

- The workflow crosses multiple database servers.
- Inventory must be released if the workflow is cancelled.
- A refund or payment reversal may be required if the charge succeeded.
- A local transaction cannot automatically cover all four independent servers.
- A Saga is a common way to coordinate this business workflow.

### Exercise B: 2PC

Assume three participants:

| Shard   | Vote |
| ------- | ---- |
| Shard 1 | YES  |
| Shard 2 | YES  |
| Shard 3 | NO   |

Questions:

1. What should the coordinator decide?
2. Should Shard 1 commit?
3. What should happen to the prepared work?

Expected answer:

- The coordinator decides ABORT.
- Shard 1 should not commit the distributed transaction.
- Participants are instructed to roll back their prepared work.

### Exercise C: Global ID Generation

You have three shards, each generating sequential IDs.

```text
Shard 1: 1, 2, 3
Shard 2: 1, 2, 3
Shard 3: 1, 2, 3
```

Questions:

1. Why is this a problem?
2. How can UUIDs solve it?
3. What information does a Snowflake-style ID typically encode?
4. What is the disadvantage of a centralized ID generator?

### Exercise D: Saga Design

Design a Saga for this workflow:

```text
Place Order
    |
Reserve Inventory
    |
Charge Payment
    |
Create Shipment
    |
Confirm Order
```

For each successful operation, identify a possible compensating operation.

Example:

| Forward Operation | Compensation      |
| ----------------- | ----------------- |
| Reserve inventory | Release inventory |
| Charge payment    | Refund payment    |
| Create shipment   | Cancel shipment   |

Consider what happens if each step fails.

### Exercise E: Identify the Failure

For each situation, identify the appropriate concept.

| Situation                                                                           | Concept                           |
| ----------------------------------------------------------------------------------- | --------------------------------- |
| Payment request times out and the client retries                                    | Idempotency                       |
| One shard has much higher CPU usage than others                                     | Hot shard                         |
| A tenant's records move to another server                                           | Data migration                    |
| Multiple participants prepare before a global commit decision                       | 2PC                               |
| Order creation and event recording must be saved together                           | Transactional Outbox              |
| One database server cannot enforce a foreign key against another independent server | Cross-shard referential integrity |

---

## 19. Chapter Summary

| Concept                 | Key Takeaway                                                  |
| ----------------------- | ------------------------------------------------------------- |
| Cross-Shard Transaction | Operation involving multiple shards                           |
| Distributed Transaction | Transaction coordinated across multiple participants          |
| 2PC                     | Prepare and commit/abort protocol                             |
| Coordinator             | Manages the distributed commit protocol                       |
| Participant             | Database server involved in the transaction                   |
| Saga                    | Sequence of local transactions with compensations             |
| Compensation            | Counteracts an earlier business operation                     |
| UUID                    | Distributed unique identifier                                 |
| Snowflake-Style ID      | Numeric ID using time, node, and sequence information         |
| Global Unique ID        | Identifier that can distinguish records across shards         |
| Cross-Shard Foreign Key | Referential-integrity problem across independent servers      |
| Data Migration          | Moving records between shards                                 |
| Rebalancing             | Redistributing data and workload                              |
| Hot Shard               | Shard with disproportionate workload                          |
| Idempotency             | Repeated requests have the same intended effect               |
| Transactional Outbox    | Reliable event publication using a local database transaction |

### The most important mental model

```text
SHARDING CHALLENGES

1. TRANSACTIONS
   How do multiple shards commit or abort together?

2. IDENTIFIERS
   How do we generate globally unique IDs?

3. RELATIONSHIPS
   How do we enforce references across servers?

4. DATA MOVEMENT
   How do we migrate and rebalance data safely?

5. FAILURES
   What happens when only some shards succeed?

6. CONSISTENCY
   How do we maintain correct business state?
```

The central lesson:

**Sharding solves the problem of distributing data and workload, but introduces the problem of coordinating independent database servers.**

The difficult part of sharding is not dividing the data. It is preserving correctness when data, transactions, and failures are distributed.
