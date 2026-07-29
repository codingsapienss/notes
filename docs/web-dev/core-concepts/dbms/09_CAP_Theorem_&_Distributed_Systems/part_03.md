---
sidebar_label: CP vs AP
sidebar_position: 1
---

# CP vs AP

## 1. Introduction

In last section, we studied the CAP theorem and learned that during a network partition, a distributed system cannot guarantee both strong consistency and availability for every request.

Now we need to understand the practical differences between CP and AP systems.

The important question is not simply:

**Which system is better, CP or AP?**

The better question is:

**What should our application prioritize when distributed nodes cannot communicate?**

Consider two applications:

1. A banking application processing money transfers.
2. A social media application recording likes.

If a network partition occurs:

- The banking application may prefer rejecting a transaction rather than risk inconsistent account balances.
- The social media application may prefer accepting likes even if different regions temporarily show different counts.

Both choices can be correct because their business requirements are different.

---

## 2. Quick Recap: CP and AP

| Property         | CP                                                | AP                                         |
| ---------------- | ------------------------------------------------- | ------------------------------------------ |
| C                | Consistency                                       | Not the primary guarantee during partition |
| A                | Not guaranteed for every request during partition | Availability                               |
| P                | Partition tolerance                               | Partition tolerance                        |
| Main priority    | Strong consistency                                | Availability                               |
| During partition | May reject or delay requests                      | Continues responding                       |
| Data behavior    | Prevents conflicting authoritative updates        | May temporarily contain divergent data     |
| Recovery         | Restore coordination and synchronize              | Reconcile divergent updates                |

Remember:

- CP prioritizes consistency over availability during a partition.
- AP prioritizes availability over strong consistency during a partition.
- Both are designed to tolerate network partitions.

This does not mean a CP system is always unavailable or an AP system is always inconsistent. The trade-off becomes relevant under partition conditions.

---

## 3. CP Systems — Detailed Working

### 3.1 Understanding the architecture

A CP system prioritizes strong consistency.

A common implementation uses a leader or primary node and a consensus protocol to coordinate operations.

Example:

```text
                  Application
                       |
                       v
                +-------------+
                |   Leader    |
                |   Node A    |
                +-------------+
                       |
              Replication / Consensus
                 /           \
                v             v
           +---------+   +---------+
           | Node B  |   | Node C  |
           +---------+   +---------+
```

The leader coordinates operations with the cluster.

Depending on the database and protocol, a write may need acknowledgement from a majority before it is committed or reported as successful.

For a three-node cluster:

```text
Total nodes = 3
Majority = 2
```

### 3.2 Normal write operation

Suppose the current account balance is ₹10,000.

A client requests:

```text
Set balance = ₹15,000
```

The simplified flow:

```text
Client
  |
  v
Leader (Node A)
  |
  | Replicate operation
  |
  +-----------> Node B
  |
  +-----------> Node C
  |
  v
Wait for required acknowledgements
  |
  v
Commit operation
  |
  v
Return success to client
```

The exact replication and commit sequence depends on the database's consensus and transaction protocol.

The important idea is that the system coordinates the write before treating it as committed under its consistency guarantee.

### 3.3 What happens during a network partition?

Suppose Node A becomes isolated:

```text
             Network Partition

       +---------+       X       +---------+
       | Node A  |               | Node B  |
       |         |               +---------+
       +---------+                    |
                                      |
                                 +---------+
                                 | Node C  |
                                 +---------+
```

Node A is isolated.

Nodes B and C can still communicate.

The majority side has two nodes.

If the system requires a majority:

```text
Nodes B + C = 2
Required majority = 2
```

They can continue making progress.

Node A cannot independently commit authoritative operations requiring the cluster's majority.

### 3.4 What happens to requests?

| Request     | Node A (isolated)                                           | Nodes B and C (majority)       |
| ----------- | ----------------------------------------------------------- | ------------------------------ |
| Read        | May be rejected or unavailable under strong read guarantees | Can generally continue         |
| Write       | Cannot safely commit without required coordination          | Can generally continue         |
| Election    | Cannot elect a leader without a majority                    | Can elect or maintain a leader |
| Replication | Cannot communicate with majority                            | Can coordinate with each other |

A CP design does not necessarily make the entire cluster unavailable.

It can keep the majority side operational while refusing requests on the isolated side.

### 3.5 Why does CP make sense for financial systems?

Imagine two requests attempting to withdraw money from the same account.

Initial balance:

```text
Account balance = ₹5,000
```

During a partition:

```text
Node A receives withdrawal = ₹4,000
Node B receives withdrawal = ₹3,000
```

If both sides independently accept the transactions, the account may be overdrawn or the system may produce conflicting account states.

A CP-oriented design may reject or delay one request because it cannot safely coordinate the transaction.

This protects the correctness of the account balance.

**Important:** CAP does not itself guarantee financial correctness. You still need correct transaction design, concurrency control, constraints, and appropriate consistency guarantees.

---

## 4. AP Systems — Detailed Working

### 4.1 Understanding the architecture

An AP-oriented design prioritizes responding to requests even when some nodes cannot communicate.

A simplified architecture:

```text
               Application
                 /      \
                v        v
           +---------+ +---------+
           | Node A  | | Node B  |
           +---------+ +---------+
                \        /
                 \      /
                Replication
```

Both nodes can accept requests according to the system's design.

Data is replicated between nodes, but synchronization may not happen immediately.

### 4.2 Normal write operation

Suppose the current like count is 100.

A user likes a post through Node A.

```text
Client → Node A
```

Node A records the update:

```text
Node A: likes = 101
```

The update is replicated to Node B:

```text
Node B: likes = 101
```

Both nodes eventually contain the same value.

### 4.3 What happens during a partition?

Now the network connection breaks:

```text
              Network Partition

       +---------+       X       +---------+
       | Node A  |               | Node B  |
       +---------+               +---------+
            |                         |
         Client A                  Client B
```

Both nodes remain available.

Suppose:

- Node A receives 10 new likes.
- Node B receives 15 new likes.

Their local states become:

```text
Node A: likes = 111

Node B: likes = 116
```

Both sides can respond to their clients.

The values are temporarily different.

This is an availability-oriented behavior.

### 4.4 What happens after reconnection?

The network recovers:

```text
       +---------+----------------+---------+
       | Node A  |                | Node B  |
       | 111     |                | 116     |
       +---------+----------------+---------+
```

The system needs to reconcile the updates.

For a simple counter, it should not blindly choose the larger number or overwrite one value with another.

It needs to preserve both sets of increments.

For example, if the original count was 100:

```text
Node A increments = 10
Node B increments = 15

Final count = 100 + 10 + 15
            = 125
```

A conflict-free replicated counter or another suitable merge strategy can preserve both increments.

This is a useful example of why data modeling matters in distributed systems.

### 4.5 Where AP makes sense

AP-style behavior can be useful for:

- Social media likes and reactions.
- View counters.
- Activity feeds.
- Some shopping cart operations.
- Distributed logging.
- User presence information.
- Some collaborative editing systems.

However, do not assume that an entire application should be AP.

An application can use different consistency guarantees for different operations.

For example:

| Operation                | Possible design                         |
| ------------------------ | --------------------------------------- |
| Like a post              | Availability-oriented, merge increments |
| Update account balance   | Strong consistency                      |
| Display activity feed    | Stale reads may be acceptable           |
| Reserve the last product | Strong coordination may be necessary    |
| Record page views        | Eventual aggregation may be acceptable  |

---

## 5. Conflict Resolution in AP Systems

When different nodes accept updates independently, conflicting data may appear.

An AP-oriented system needs a strategy to reconcile these changes.

### 5.1 Last-Write-Wins (LWW)

The system chooses the update considered to be the latest.

Example:

```text
Node A:
Name = "Prashant"
Timestamp = 10:00:05

Node B:
Name = "Prashant Sharma"
Timestamp = 10:00:08
```

After reconciliation:

```text
Name = "Prashant Sharma"
```

The update with the later timestamp wins.

**Problem:** Clock differences can make timestamp ordering unreliable. Also, one update may overwrite another valid update.

LWW is appropriate only when its data-loss semantics are acceptable.

### 5.2 Version-Based Conflict Resolution

Instead of relying only on timestamps, systems can use version metadata.

Example:

```text
Node A:
Version = 5

Node B:
Version = 6
```

The system compares versions to determine whether one update supersedes another or whether the updates are concurrent.

Vector clocks are one mechanism that can help identify causal relationships between updates.

A vector clock tracks version information from multiple nodes.

Simplified example:

```text
Node A: [A: 2, B: 1]
Node B: [A: 1, B: 2]
```

Neither version necessarily supersedes the other.

They represent concurrent updates, so the system may need an application-level merge.

### 5.3 Application-Level Merge

The application defines how conflicting updates should be combined.

Example: Shopping cart.

```text
Initial cart:
Product A = 1
```

During a partition:

```text
Node A:
Product A = 2

Node B:
Product B = 1
```

A merge can combine both independent changes:

```text
Final cart:
Product A = 2
Product B = 1
```

But consider both nodes modifying the quantity of Product A.

```text
Node A:
Product A = 2

Node B:
Product A = 3
```

The application needs an explicit business rule.

Should it:

- Choose the latest update?
- Add the increments?
- Ask the user to resolve the conflict?
- Apply another rule?

There is no universally correct merge strategy.

### 5.4 CRDTs

CRDT stands for Conflict-Free Replicated Data Type.

CRDTs are data structures designed so that independently updated replicas can be merged in a way that preserves defined mathematical properties and allows convergence.

Examples include:

- Grow-only counters.
- Positive-negative counters.
- Grow-only sets.
- Observed-remove sets.

For example, a grow-only counter can merge replica states by taking the maximum count maintained by each replica's component.

This is different from simply taking the maximum of two displayed totals.

CRDTs are useful when the data operation can be modeled with suitable merge semantics.

They are not a universal solution for arbitrary business transactions.

---

## 6. Eventual Consistency

Eventual consistency is an important concept in availability-oriented distributed systems.

It means:

**If no new updates occur and the system continues to synchronize successfully, replicas will eventually converge to the same state.**

Example:

```text
Initially:

Node A: stock = 10
Node B: stock = 10
```

Node A receives an update:

```text
Node A: stock = 8
Node B: stock = 10
```

After synchronization:

```text
Node A: stock = 8
Node B: stock = 8
```

The replicas have converged.

### 6.1 Strong consistency vs eventual consistency

| Feature                       | Strong consistency (linearizability)               | Eventual consistency                             |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| Read after successful write   | Must observe the latest completed write            | May return an older value                        |
| Replica synchronization       | Coordination is required to preserve the guarantee | Can be asynchronous                              |
| Read behavior                 | Strong ordering guarantee                          | Temporary divergence is possible                 |
| Availability during partition | Some requests may be rejected or delayed           | Can continue responding                          |
| Typical use                   | Account balances and strict inventory operations   | Feeds, counters, and replicated user preferences |

### 6.2 Eventual consistency does not mean random inconsistency

A well-designed eventually consistent system has defined rules for:

- Replication.
- Conflict detection.
- Conflict resolution.
- Retry behavior.
- Convergence.

It is not simply a system where replicas contain random values.

### 6.3 Eventual consistency is not immediate consistency

Suppose a user changes their profile name.

```text
Write:
Name = "Prashant Sharma"
```

The primary node acknowledges the update.

A read from another replica might temporarily return:

```text
Name = "Prashant"
```

After replication catches up, it returns:

```text
Name = "Prashant Sharma"
```

This is why applications sometimes need to route a read to the primary after a write when read-your-writes behavior is important.

---

## 7. Tunable Consistency

Some distributed databases allow applications to choose how many replicas must participate in a read or write.

This is called tunable consistency.

Apache Cassandra is a well-known example.

Suppose a table has a replication factor of 3.

```text
Replication Factor = 3

Node A
Node B
Node C
```

Different consistency levels require different numbers of replica acknowledgements.

### 7.1 Common consistency levels

| Consistency Level | Meaning                                                      |
| ----------------- | ------------------------------------------------------------ |
| ONE               | One replica must respond                                     |
| TWO               | Two replicas must respond                                    |
| THREE             | Three replicas must respond                                  |
| QUORUM            | A majority of replicas must respond                          |
| ALL               | All relevant replicas must respond                           |
| LOCAL_QUORUM      | A majority of replicas in the local data center must respond |

The exact behavior depends on the database version, topology, replication configuration, and operation.

### 7.2 Quorum calculation

A common majority calculation is:

\[
Q = \left\lfloor \frac{N}{2} \right\rfloor + 1
\]

Where:

- \(N\) = number of replicas.
- \(Q\) = quorum size.

Example:

```text
N = 3

Q = floor(3 / 2) + 1
  = 2
```

Two replicas are required for a majority.

For five replicas:

```text
N = 5

Q = floor(5 / 2) + 1
  = 3
```

Three replicas are required.

### 7.3 Read and write quorum

For a simple replicated key-value system, let:

- \(N\) = replication factor.
- \(W\) = write acknowledgement count.
- \(R\) = read response count.

A common design rule is:

\[
R + W > N
\]

This ensures that the read and write replica sets overlap, assuming the replicas participate in the relevant read/write protocol and the system's consistency semantics support this reasoning.

Example:

```text
N = 3
W = 2
R = 2

R + W = 4

4 > 3
```

At least one replica belongs to both sets.

This can help ensure that a read encounters a replica that received the write.

**Important limitations:**

- Quorum overlap alone does not guarantee linearizability.
- Concurrent writes need ordering or conflict-resolution rules.
- Replica versions and read repair behavior matter.
- Cassandra consistency levels have database-specific semantics.
- A quorum is not automatically equivalent to a globally serializable transaction.

### 7.4 What happens when consistency levels change?

With three replicas:

| Write Level | Required acknowledgements | Availability impact                           |
| ----------- | ------------------------: | --------------------------------------------- |
| ONE         |                         1 | Easier to satisfy                             |
| QUORUM      |                         2 | Requires a majority                           |
| ALL         |                         3 | Any unavailable replica can prevent the write |

Higher acknowledgement requirements generally strengthen certain consistency guarantees but can reduce availability and increase latency.

The exact guarantee depends on the database's implementation.

---

## 8. Choosing CP or AP for Real Applications

The decision should be based on business requirements, not database popularity.

### 8.1 Banking application

Requirements:

- Account balances must remain correct.
- Money must not be created or lost through conflicting updates.
- A transaction must not be accepted twice.

Possible design:

```text
Money Transfer
      |
      v
Strongly coordinated transaction
      |
      v
Commit only when correctness conditions are satisfied
```

A CP-oriented approach is generally appropriate for operations requiring strong consistency.

Some requests may need to fail or wait during a partition.

### 8.2 Social media application

Requirements:

- Users should be able to like posts.
- Temporary count differences are acceptable.
- Updates should eventually converge.

Possible design:

```text
User likes post
      |
      v
Local event recorded
      |
      v
Replicated asynchronously
      |
      v
Counts reconciled
```

An AP-oriented approach can be appropriate for the like-count operation.

### 8.3 E-commerce application

An e-commerce platform needs multiple consistency models.

| Feature               | Possible consistency requirement                      |
| --------------------- | ----------------------------------------------------- |
| Product descriptions  | Eventual consistency may be acceptable                |
| Product images        | Eventual consistency is generally acceptable          |
| Product view count    | Eventual consistency is generally acceptable          |
| Shopping cart         | Depends on conflict and merge rules                   |
| Inventory reservation | Strong coordination may be required                   |
| Payment transaction   | Strong correctness guarantees required                |
| Order status display  | May tolerate a short delay, depending on the workflow |

A real application does not need to be entirely CP or entirely AP.

Different operations can use different guarantees.

---

## 9. Designing a Backend Application with Different Consistency Requirements

Consider a Node.js e-commerce backend.

It uses:

- PostgreSQL for orders and payments.
- MongoDB for product catalog information.
- Redis for caching.
- A message queue for asynchronous events.

A simplified architecture:

```text
                 Client
                   |
                   v
             Node.js API
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
   PostgreSQL   MongoDB      Redis
   Orders       Products     Cache
   Payments     Catalog      Sessions
       |
       v
   Event / Queue
       |
       v
   Background Workers
```

Different components can have different consistency requirements.

### 9.1 Product catalog

A product description is updated.

The update reaches the primary database first.

Caches and read replicas may receive the change later.

A short delay is generally acceptable.

### 9.2 Payment processing

A payment request should not be considered successful merely because an asynchronous event was created.

The application must correctly handle:

- Payment provider responses.
- Transaction state.
- Idempotency.
- Duplicate callbacks.
- Database commits.
- Failure recovery.

A strong consistency requirement may apply to the authoritative payment state.

### 9.3 Inventory reservation

Suppose there is one unit left.

Two users attempt to purchase it.

The backend needs an atomic reservation strategy.

A PostgreSQL example:

```sql
UPDATE products
SET stock = stock - 1
WHERE product_id = 101
  AND stock > 0
RETURNING stock;
```

If no row is returned, the stock was not available.

This example protects against two transactions independently decrementing the same last unit in a single authoritative PostgreSQL database.

However, if inventory is independently writable across partitioned database nodes, this local SQL statement alone does not solve the distributed coordination problem.

That requires a distributed consistency and reservation design.

### 9.4 Cache consistency

Suppose PostgreSQL contains:

```text
Product price = ₹2,000
```

Redis contains:

```text
Product price = ₹1,800
```

A user may temporarily receive a stale price if the cache has not been invalidated.

This may be acceptable for displaying a product page, but the backend should validate the authoritative price before accepting an order.

This is an important design principle:

**A stale cache value should not automatically become the source of truth for a financial transaction.**

---

## 10. Important Concepts Related to CP and AP

### 10.1 Read-your-writes consistency

A client should see its own successful writes in subsequent reads.

Example:

```text
User updates profile name.

Write:
Name = "Prashant Sharma"

Next read:
Name = "Prashant Sharma"
```

If the next read goes to a lagging replica, the user may see the old value.

Possible solutions:

- Read from the primary after a write.
- Use session-level consistency mechanisms.
- Track replication positions or versions.
- Use a database feature that provides the required read-your-writes guarantee.

### 10.2 Monotonic reads

Once a client has observed a particular version of data, later reads should not move backward to an older version.

Example:

```text
First read:
Version 5

Second read:
Version 4
```

This is a violation of monotonic reads.

A system may use session affinity or version tracking to avoid this behavior.

### 10.3 Causal consistency

Causal consistency preserves the ordering of causally related operations.

Example:

1. A user creates a post.
2. Another user comments on that post.

The comment depends on the post existing.

A causally consistent system should not expose the comment before exposing the post to a client that observes both operations.

Causal consistency is weaker than linearizability but stronger than some basic eventual-consistency guarantees.

### 10.4 Conflict-free convergence

Some distributed operations can be merged without requiring a central coordinator.

For example:

- Adding unique items to a set.
- Incrementing a properly designed distributed counter.

Other operations are harder:

- Decrementing inventory.
- Transferring money.
- Updating a single shared field concurrently.

The operation's mathematical and business semantics determine whether it can be merged safely.

---

## 11. Practical Decision Framework

When designing a distributed feature, ask these questions:

| Question                                                   | Why it matters                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| Can the user tolerate stale data?                          | Helps determine whether eventual consistency is acceptable |
| Can two nodes update the same record simultaneously?       | Determines whether conflicts are possible                  |
| Can updates be merged safely?                              | Helps identify AP-friendly operations                      |
| Can the operation be rejected temporarily?                 | Determines whether CP-style behavior is acceptable         |
| Does the operation involve money or scarce inventory?      | Usually requires stronger correctness guarantees           |
| What happens if a node cannot communicate with the others? | Defines partition behavior                                 |
| How will the system recover?                               | Determines reconciliation and recovery requirements        |

### Simple decision examples

| Requirement                                         | Likely approach                                       |
| --------------------------------------------------- | ----------------------------------------------------- |
| Must not accept conflicting account transfers       | Strongly coordinated, CP-style behavior               |
| Users can like posts while regions are disconnected | AP-style behavior with mergeable updates              |
| Product catalog can update with a small delay       | Eventual consistency                                  |
| Last item in stock must not be sold twice           | Strong coordination or safe reservation protocol      |
| Analytics events can arrive late                    | Availability-oriented ingestion and later aggregation |

These are design directions, not automatic guarantees provided by a database label.

---

## 12. Common Mistakes

### Mistake 1: Treating CP and AP as permanent database categories

A database can expose multiple consistency levels or use different behavior for reads and writes.

Always inspect the actual configuration and operation.

### Mistake 2: Assuming AP means data will never be consistent

AP systems can converge after partitions are resolved.

Temporary divergence is not permanent inconsistency.

### Mistake 3: Assuming CP means the entire system is unavailable

The majority side of a consensus-based cluster can often continue operating.

Availability is sacrificed for requests that cannot safely be served, not necessarily for every request in the system.

### Mistake 4: Assuming eventual consistency solves every conflict

Eventual consistency does not define how conflicting business operations should be reconciled.

The application still needs correct merge rules.

### Mistake 5: Using last-write-wins for everything

LWW may discard valid updates.

For counters, inventory, and money, blindly choosing one update can cause incorrect business results.

### Mistake 6: Assuming a quorum guarantees every consistency property

Quorum overlap is useful, but linearizability depends on the full protocol, operation ordering, and read/write semantics.

### Mistake 7: Choosing a database before understanding the workload

Database selection should follow requirements.

First understand the operations, correctness requirements, failure behavior, and acceptable latency. Then choose the database architecture.

---

## 13. Interview Questions and Answers

### Q1. What is the main difference between CP and AP?

CP prioritizes strong consistency during a network partition, potentially rejecting or delaying requests. AP prioritizes responding to requests, potentially allowing stale or conflicting data.

### Q2. Does a CP system always reject requests during a partition?

No. A side with sufficient coordination authority, such as a majority quorum, may continue operating. Requests to an isolated minority may be rejected or delayed.

### Q3. Does an AP system always return stale data?

No. It may return current data when replicas are synchronized. It permits responses without requiring global coordination during a partition, so stale data is possible.

### Q4. What is eventual consistency?

It is a consistency model where replicas are expected to converge if updates stop and synchronization continues successfully.

### Q5. What is tunable consistency?

It allows applications to select different consistency levels, often by specifying how many replicas must participate in reads or writes.

### Q6. What is quorum?

A quorum is a required number of participating replicas or nodes needed to complete an operation or make a decision.

### Q7. What is the quorum overlap condition?

For a simple replicated read/write model, `R + W > N` ensures read and write replica sets overlap. This alone does not guarantee linearizability.

### Q8. What is last-write-wins?

A conflict-resolution strategy that selects the update considered to be the latest, often using timestamps or version metadata.

### Q9. Why can last-write-wins be dangerous?

It can overwrite valid concurrent updates, and timestamps can be unreliable when node clocks differ.

### Q10. What is a CRDT?

A Conflict-Free Replicated Data Type is a data structure designed to merge independently updated replicas while preserving defined convergence properties.

### Q11. Can one application use both CP and AP approaches?

Yes. Different operations can use different consistency guarantees according to their business requirements.

### Q12. Why is a payment system different from a like counter?

A like counter can often tolerate temporary divergence and merge increments. A payment system must prevent incorrect or duplicated financial effects and therefore needs stronger coordination and correctness controls.

### Q13. Is eventual consistency the same as causal consistency?

No. Eventual consistency guarantees convergence under suitable conditions. Causal consistency additionally preserves the ordering of causally related operations.

### Q14. Why might a read-after-write return old data?

The read may be served by a replica that has not yet received the latest write.

### Q15. What is read-your-writes consistency?

It guarantees that a client can observe its own successful writes in subsequent reads.

---

## 14. Practical Exercises

### Exercise 1: Classify operations

For each operation, decide whether strong consistency or eventual consistency is more appropriate. Explain why.

1. Updating a bank account balance.
2. Updating a product description.
3. Recording a social media like.
4. Reserving the final unit of a product.
5. Updating a profile picture.
6. Recording application analytics events.
7. Processing a payment callback.

### Exercise 2: Quorum calculation

A distributed database has five replicas.

Calculate:

1. Majority quorum.
2. Minimum write acknowledgement count for a majority.
3. Minimum read acknowledgement count for a majority.
4. Whether `R + W > N` holds when `R = 2` and `W = 3`.

### Exercise 3: Conflict resolution

Initial value:

```text
Product quantity = 10
```

During a network partition:

```text
Node A: quantity = 8
Node B: quantity = 7
```

Questions:

1. Why is choosing 8 or 7 not necessarily correct?
2. What information is needed to understand the updates?
3. Could version metadata help?
4. Would a CRDT be appropriate for this particular business operation?

### Exercise 4: Backend architecture

Design a simplified e-commerce backend with:

- PostgreSQL for orders.
- MongoDB for product catalog.
- Redis for caching.
- A queue for background processing.

Identify which operations require strong consistency and which can tolerate eventual consistency.

Explain what happens when Redis is unavailable and when the database replicas become disconnected.

---

## 15. Chapter Summary

| Concept                  | Key takeaway                                               |
| ------------------------ | ---------------------------------------------------------- |
| CP                       | Prioritizes strong consistency during partitions           |
| AP                       | Prioritizes availability during partitions                 |
| Eventual consistency     | Replicas can converge after updates stop                   |
| Last-write-wins          | Resolves conflicts by choosing an update considered latest |
| Version-based resolution | Uses version metadata to understand update relationships   |
| Application-level merge  | Uses business logic to combine updates                     |
| CRDT                     | Supports safe merging for specific data structures         |
| Tunable consistency      | Allows different consistency levels                        |
| Quorum                   | Requires a specified number of replicas to participate     |
| Read-your-writes         | A client sees its own successful updates                   |
| Monotonic reads          | A client does not move backward to older observed versions |
| Causal consistency       | Preserves causal ordering between operations               |

### The most important engineering lessons

1. CP and AP are not permanent labels for entire applications.
2. Choose consistency requirements at the operation level.
3. Financial transactions and scarce inventory generally need stronger coordination.
4. Feeds, counters, and analytics may tolerate eventual consistency.
5. AP systems need explicit conflict-resolution strategies.
6. Quorum settings affect consistency, availability, and latency.
7. Eventual consistency is a deliberate design choice, not an excuse for incorrect data.

**Final mental model:**

```text
              Network Partition
                      |
             -------------------
             |                 |
             v                 v
            CP                AP
             |                 |
     Preserve strong      Preserve request
       consistency          availability
             |                 |
      Some requests       Temporary stale
      may fail/wait       or conflicting data
             |                 |
             v                 v
       Coordination       Reconciliation
```
