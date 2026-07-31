---
sidebar_label: Wide-Column Databases: Scaling and Consistency
sidebar_position: 1
---

# Wide-Column Databases: Scaling and Consistency

## 1. Introduction

Let's understand how Cassandra distributes data across multiple nodes and maintains consistency when failures occur.

This is where distributed database concepts become important.

### Topics covered

1. Cassandra replication.
2. Replication factor.
3. Consistency levels.
4. Tunable consistency.
5. Quorum reads and writes.
6. Consistency tradeoffs.
7. Failure handling.
8. Node failures and recovery.
9. Hinted handoff.
10. Read repair.
11. Anti-entropy repair.
12. Replication and consistency examples.

---

## 2. Why Does Cassandra Need Replication?

Consider a Cassandra cluster containing three nodes:

```text
        Cassandra Cluster

       +--------+--------+
       |        |        |
       v        v        v
     Node A   Node B   Node C
```

Suppose the application stores a record on Node A.

What happens if Node A suddenly crashes?

Without replication, the application may lose access to that record until the node recovers.

This creates availability and durability problems.

Cassandra addresses this through **replication**.

Replication means maintaining multiple copies of data across different nodes.

For example:

```text
             user_101
                 |
        +--------+--------+
        |        |        |
        v        v        v
      Node A   Node B   Node C
        |        |        |
      Copy 1   Copy 2   Copy 3
```

If one node becomes unavailable, another replica may still serve the data.

### Why replication matters

- Improves availability.
- Provides fault tolerance.
- Protects against individual node failures.
- Allows distributed read and write operations.
- Supports data distribution across racks and data centers.

**Important:** Replication is not a backup. If an application accidentally deletes data, that deletion can also propagate to replicas.

---

## 3. Replication Factor (RF)

The **Replication Factor (RF)** defines how many copies of each partition Cassandra maintains.

For example:

```text
Replication Factor = 3
```

This means Cassandra maintains three replicas of each partition within the configured replication scope.

### 3.1 Example: RF = 1

```text
Partition: user_101

Node A -> Copy 1
```

Only one replica exists.

If Node A fails, the partition becomes unavailable until the node or data is recovered.

### 3.2 Example: RF = 2

```text
Partition: user_101

Node A -> Copy 1
Node B -> Copy 2
```

The data exists on two nodes.

If one node fails, the other may still serve requests.

### 3.3 Example: RF = 3

```text
Partition: user_101

Node A -> Copy 1
Node B -> Copy 2
Node C -> Copy 3
```

Three replicas are maintained.

This improves fault tolerance but increases storage requirements.

### 3.4 Replication Factor Comparison

| Replication Factor | Copies | Storage requirement | Fault tolerance                                          |
| ------------------ | -----: | ------------------- | -------------------------------------------------------- |
| RF = 1             |      1 | Lowest              | No replica redundancy                                    |
| RF = 2             |      2 | Higher              | Can tolerate one unavailable replica for some operations |
| RF = 3             |      3 | Higher              | More replica redundancy                                  |
| RF = 5             |      5 | Much higher         | More replica redundancy                                  |

The actual ability to serve requests during failures also depends on the consistency level and replica placement.

### 3.5 Does RF = 3 Mean Three Copies on Three Different Machines?

Normally, Cassandra distributes replicas across different nodes according to its replication strategy and topology.

However, correct placement depends on the cluster's topology and replication configuration.

For production systems, replica placement should account for:

- Nodes.
- Racks.
- Availability zones.
- Data centers.

Putting every replica in the same failure domain defeats much of the purpose of replication.

---

## 4. Cassandra Replication Strategy

Cassandra uses replication strategies to determine where replicas should be placed.

The two important strategies are:

1. SimpleStrategy.
2. NetworkTopologyStrategy.

### 4.1 SimpleStrategy

SimpleStrategy is primarily intended for simple or single-data-center environments.

Example:

```sql
CREATE KEYSPACE ecommerce
WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 3
};
```

Here:

- `ecommerce` is the keyspace.
- `SimpleStrategy` determines replica placement.
- `replication_factor: 3` requests three replicas.

SimpleStrategy does not account for rack and data-center topology.

It is generally not recommended for production multi-data-center deployments.

### 4.2 NetworkTopologyStrategy

NetworkTopologyStrategy allows replication to be configured separately for each data center.

Example:

```sql
CREATE KEYSPACE ecommerce
WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'dc1': 3,
    'dc2': 3
};
```

Here:

- `dc1` maintains three replicas.
- `dc2` maintains three replicas.

Conceptually:

```text
                 Cassandra Cluster
                        |
             +----------+----------+
             |                     |
             v                     v
          DC1                     DC2
       RF = 3                  RF = 3
             |                     |
        +----+----+           +----+----+
        |    |    |           |    |    |
        A    B    C           D    E    F
```

This allows replicas to exist across data centers.

NetworkTopologyStrategy also considers rack placement when distributing replicas.

### 4.3 Which Strategy Should You Use?

| Strategy                | Suitable use                                              |
| ----------------------- | --------------------------------------------------------- |
| SimpleStrategy          | Simple development or testing environments                |
| NetworkTopologyStrategy | Production environments, especially multiple data centers |

For production Cassandra deployments, NetworkTopologyStrategy is generally the appropriate choice.

---

## 5. Understanding Consistency in Cassandra

Replication creates multiple copies of data.

But it introduces an important question:

**How many replicas must respond before Cassandra considers an operation successful?**

This is controlled through consistency levels.

A consistency level specifies the number and scope of replica responses required for an operation.

Cassandra supports tunable consistency, meaning the application can choose different consistency requirements for different operations.

### Example

Suppose:

```text
Replication Factor = 3

Node A
Node B
Node C
```

The application performs a write.

Should Cassandra wait for:

- One replica?
- Two replicas?
- All three replicas?

The answer depends on the selected consistency level.

---

## 6. Cassandra Consistency Levels

Some important consistency levels include:

| Consistency Level | Meaning                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| ONE               | One replica must respond                                                   |
| TWO               | Two replicas must respond                                                  |
| THREE             | Three replicas must respond                                                |
| QUORUM            | A quorum of replicas must respond                                          |
| ALL               | All replicas in the relevant replica set must respond                      |
| LOCAL_QUORUM      | A quorum of replicas in the local data center must respond                 |
| EACH_QUORUM       | A quorum in each data center must respond                                  |
| LOCAL_ONE         | One replica in the local data center must respond                          |
| ANY               | A write can be acknowledged after a replica accepts it or a hint is stored |

The exact availability and durability implications depend on the operation, topology, and configuration.

### 6.1 ONE

Suppose RF = 3.

```text
Node A
Node B
Node C
```

With `ONE`, one replica response is sufficient.

For example:

```text
Node A -> Responds
Node B -> Not required
Node C -> Not required
```

**Benefit:** Lower latency and better availability when some replicas are unavailable.

**Tradeoff:** The responding replica may have stale data.

### 6.2 QUORUM

A quorum means a majority of replicas.

The formula is:

\[
Q = \left\lfloor \frac{RF}{2} \right\rfloor + 1
\]

For RF = 3:

\[
Q = \left\lfloor \frac{3}{2} \right\rfloor + 1 = 2
\]

Therefore, two replicas must respond.

```text
RF = 3

Node A -> Responds
Node B -> Responds
Node C -> Not required
```

### 6.3 ALL

With RF = 3:

```text
Node A -> Must respond
Node B -> Must respond
Node C -> Must respond
```

All replicas in the relevant replica set must respond.

**Benefit:** Stronger acknowledgement requirements.

**Tradeoff:** If even one required replica is unavailable, the operation cannot succeed at this consistency level.

### 6.4 LOCAL_QUORUM

LOCAL_QUORUM requires a quorum of replicas in the coordinator's local data center.

Suppose:

```text
DC1:
    Node A
    Node B
    Node C

DC2:
    Node D
    Node E
    Node F
```

If the local data center is DC1, LOCAL_QUORUM requires responses from two replicas in DC1.

This is useful in multi-data-center deployments where local operations should not depend on remote data-center latency.

### 6.5 EACH_QUORUM

EACH_QUORUM requires a quorum in every configured data center for a write.

Suppose:

```text
DC1: RF = 3
DC2: RF = 3
```

The write needs:

- Two responses from DC1.
- Two responses from DC2.

This provides stronger cross-data-center acknowledgement requirements but can increase latency and reduce availability during data-center failures.

---

## 7. Tunable Consistency

One of Cassandra's important features is tunable consistency.

This means the application can choose the consistency level for individual operations.

For example:

```text
User Activity Logging
    -> ONE

User Profile Update
    -> QUORUM

Critical Business Record
    -> QUORUM or another deliberately selected level
```

These are illustrative choices, not universal recommendations.

The correct consistency level depends on the business requirement, replication topology, and failure behavior.

### 7.1 Example: Campaign Platform

Suppose a campaign platform records millions of user interactions.

For a non-critical analytics event:

```sql
CONSISTENCY ONE;

INSERT INTO events_by_user (...);
```

One replica response may be enough if the application can tolerate some replica lag.

For a more important operation:

```sql
CONSISTENCY QUORUM;

INSERT INTO user_settings (...);
```

A quorum acknowledgement may be preferable.

Remember that CQL consistency commands are commonly configured through the Cassandra client or query tool, rather than being part of the INSERT statement itself.

### 7.2 Why Is Tunable Consistency Useful?

Different operations have different requirements.

For example:

| Operation             | Possible requirement                                           |
| --------------------- | -------------------------------------------------------------- |
| Activity logging      | Low latency                                                    |
| Product view tracking | High availability                                              |
| User settings         | More consistent reads and writes                               |
| Financial record      | Stronger correctness guarantees and careful transaction design |

Cassandra allows the application to make these tradeoffs instead of enforcing one consistency level for every operation.

**Important:** Cassandra's tunable consistency does not mean it automatically provides the same transactional guarantees as PostgreSQL.

---

## 8. Quorum Reads and Writes

Quorum is one of the most important consistency concepts in Cassandra.

It helps explain when read and write operations can overlap in their replica sets.

### 8.1 Quorum Formula

For a replica set of size RF:

\[
Q = \left\lfloor \frac{RF}{2} \right\rfloor + 1
\]

Examples:

|  RF | Quorum |
| --: | -----: |
|   1 |      1 |
|   2 |      2 |
|   3 |      2 |
|   4 |      3 |
|   5 |      3 |
|   6 |      4 |

### 8.2 Read and Write Quorum

A commonly used rule is:

\[
R + W > RF
\]

Where:

- R = number of replicas required for a read.
- W = number of replicas required for a write.
- RF = replication factor.

If this condition is satisfied, the read and write replica sets must overlap, assuming they refer to the same replica set.

### 8.3 Example: RF = 3

Suppose:

```text
RF = 3
R = 2
W = 2
```

Then:

\[
R + W = 4
\]

\[
4 > 3
\]

Therefore, the read and write sets must overlap.

Conceptually:

```text
Replica A
Replica B
Replica C

Write reaches:
    A, B

Read reaches:
    B, C
```

Replica B is shared.

This overlap helps the read encounter a replica that received the write.

### 8.4 Does Quorum Guarantee the Latest Value?

Not by itself in every possible situation.

The overlap argument assumes important conditions, including:

- The same replica set is involved.
- The relevant write was successfully acknowledged.
- The read and write use compatible consistency settings.
- There are no conflicting concurrent writes that change the ordering.
- The database's reconciliation behavior is understood.

Cassandra uses timestamps and reconciliation rules to determine the winning value.

Clock configuration, concurrent updates, and repair behavior also matter.

Therefore, do not reduce Cassandra consistency to the formula alone.

### 8.5 QUORUM Write + QUORUM Read

For RF = 3:

```text
Write:
    QUORUM = 2

Read:
    QUORUM = 2
```

This is a common configuration when applications want stronger consistency than ONE while retaining some tolerance for unavailable replicas.

It does not make Cassandra equivalent to a fully serializable relational transaction system.

---

## 9. Consistency Tradeoffs

Consistency, availability, and latency are related.

In Cassandra, selecting a consistency level influences which replicas must respond.

### 9.1 ONE vs QUORUM vs ALL

Assume RF = 3.

| Level  | Required responses | Availability during one replica failure                | Latency tendency |
| ------ | -----------------: | ------------------------------------------------------ | ---------------- |
| ONE    |                  1 | Usually can continue                                   | Lower            |
| QUORUM |                  2 | Can continue if two replicas are available             | Moderate         |
| ALL    |                  3 | Cannot continue if one required replica is unavailable | Higher           |

These are simplified comparisons. Network conditions, data-center placement, and the operation type also matter.

### 9.2 Example: One Node Fails

```text
RF = 3

Node A -> UP
Node B -> UP
Node C -> DOWN
```

Possible outcomes:

| Consistency Level | Can the operation succeed? |
| ----------------- | -------------------------- |
| ONE               | Yes                        |
| QUORUM            | Yes                        |
| ALL               | No                         |

This assumes the two available replicas belong to the relevant replica set and the request can reach them.

### 9.3 Example: Two Nodes Fail

```text
RF = 3

Node A -> UP
Node B -> DOWN
Node C -> DOWN
```

Possible outcomes:

| Consistency Level | Can the operation succeed? |
| ----------------- | -------------------------- |
| ONE               | Yes                        |
| QUORUM            | No                         |
| ALL               | No                         |

The remaining replica can serve a ONE-level operation, but it cannot satisfy a quorum.

### 9.4 The Important Tradeoff

Lower consistency requirements can improve availability and latency.

Higher consistency requirements can improve the chance that operations observe recently acknowledged updates.

There is no single consistency level that is best for every workload.

---

## 10. Failure Handling in Cassandra

Distributed systems must handle failures as normal operating conditions.

In Cassandra, nodes can:

- Crash.
- Become unreachable.
- Lose network connectivity.
- Experience disk failures.
- Restart after maintenance.
- Fall behind in receiving updates.

Cassandra has mechanisms to handle these situations.

We will study three important mechanisms:

1. Hinted handoff.
2. Read repair.
3. Anti-entropy repair.

---

## 11. Hinted Handoff

Hinted handoff is a mechanism that helps Cassandra deliver missed writes to temporarily unavailable replicas.

### 11.1 Why Is It Needed?

Suppose:

```text
RF = 3

Node A -> UP
Node B -> UP
Node C -> DOWN
```

The application sends a write.

The coordinator identifies A, B, and C as replicas.

But C is unavailable.

What happens?

Cassandra may store a hint indicating that Node C missed the mutation.

Conceptually:

```text
                 Write
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
          |        |        |
        Write    Write    DOWN
                           |
                           v
                     Hint Stored
```

### 11.2 What Happens When Node C Recovers?

When Node C becomes available again, Cassandra can replay the stored hints.

```text
Node C Recovers
       |
       v
Hint Delivered
       |
       v
Node C Receives Missed Mutation
```

This helps the recovered replica catch up.

### 11.3 Important Limitation

Hinted handoff is not a complete substitute for repair.

Hints have retention and delivery limitations.

A node that remains unavailable for too long may miss more history than the available hints can cover.

That is why repair mechanisms remain important.

### 11.4 When Is Hinted Handoff Useful?

- Temporary node outages.
- Short network interruptions.
- Brief maintenance periods.
- Temporary replica unavailability.

---

## 12. Read Repair

Read repair is a mechanism that can help reconcile inconsistent replicas during read operations.

### 12.1 Why Is It Needed?

Suppose RF = 3.

A record has different values on different replicas:

```text
Node A -> city: Delhi
Node B -> city: Delhi
Node C -> city: Noida
```

A read operation contacts replicas.

Cassandra compares the returned data using its reconciliation rules.

If it identifies an outdated replica, read-repair behavior can help bring replicas into agreement.

### 12.2 Conceptual Example

```text
               Read Request
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Node A    Node B    Node C
          |         |         |
        Delhi     Delhi     Noida
          |         |         |
          +---------+---------+
                    |
                    v
              Reconciliation
                    |
                    v
              Latest Value
                    |
                    v
          Repair Eligible Replica
```

### 12.3 Important Detail

Read repair behavior depends on Cassandra version and configuration.

It should not be assumed that every read repairs every replica.

Modern Cassandra versions have specific read-repair and reconciliation behavior, and their configuration options have changed across releases.

### 12.4 Read Repair vs Hinted Handoff

| Feature        | Hinted Handoff           | Read Repair                                  |
| -------------- | ------------------------ | -------------------------------------------- |
| Trigger        | A replica misses a write | A read identifies replica differences        |
| Purpose        | Deliver missed mutations | Reconcile inconsistent data                  |
| Main situation | Temporary node outage    | Replicas contain different versions          |
| Operation      | Replays stored hints     | Uses read reconciliation and repair behavior |

---

## 13. Anti-Entropy Repair

Anti-entropy repair is a process that compares replica data and synchronizes differences.

It is important for maintaining consistency over time.

### 13.1 Why Is Repair Needed?

Consider:

```text
Node A -> user_101: Delhi
Node B -> user_101: Delhi
Node C -> user_101: Noida
```

Suppose:

- Node C was unavailable for an extended period.
- Hints were unavailable or expired.
- Some writes were missed.

Even if Node C comes back online, it may not automatically have all the data it missed.

A repair process helps identify and reconcile replica differences.

### 13.2 How Does Repair Work?

Cassandra uses Merkle trees as part of its anti-entropy repair process.

A Merkle tree is a hash-based tree structure that allows two datasets to be compared efficiently.

Instead of comparing every record immediately, Cassandra compares hashes of data ranges.

Conceptually:

```text
           Replica A
               |
          Build Hashes
               |
               v
           Merkle Tree
               |
               |
               v
         Compare with
           Replica B
               |
               v
        Identify Differences
               |
               v
        Stream Required Data
```

If corresponding hash ranges match, the replicas' data for those ranges is considered consistent for the repair comparison.

If hashes differ, Cassandra investigates the relevant ranges and synchronizes differences.

### 13.3 Why Are Merkle Trees Useful?

Suppose two replicas contain millions of records.

Comparing every record directly would be expensive.

Merkle trees allow Cassandra to identify differing ranges more efficiently.

### 13.4 When Should Repair Be Run?

Repair is an important operational task.

It should be scheduled and monitored according to:

- Replication topology.
- Repair strategy.
- Data volume.
- Node availability.
- Tombstone safety requirements.
- Cassandra version and operational guidance.

Repair is not something to run blindly without understanding its resource costs.

---

## 14. Hinted Handoff vs Read Repair vs Anti-Entropy Repair

These mechanisms are related but solve different problems.

| Mechanism           | Main purpose                                              | Typical trigger                        |
| ------------------- | --------------------------------------------------------- | -------------------------------------- |
| Hinted handoff      | Deliver writes missed by temporarily unavailable replicas | Replica was unavailable during a write |
| Read repair         | Reconcile data differences identified during reads        | Read detects inconsistent replica data |
| Anti-entropy repair | Compare and synchronize replica ranges                    | Scheduled or manually initiated repair |

### Example Scenario

Suppose Node C becomes unavailable.

While it is down:

- Node A and Node B receive writes.
- Hints may be stored for Node C.
- Node C later returns.

Possible recovery process:

1. Hinted handoff attempts to deliver missed writes.
2. Reads may identify remaining differences.
3. Anti-entropy repair can compare replica ranges and synchronize data.

No single mechanism should be treated as a complete replacement for the others.

---

## 15. Node Failure and Recovery: Complete Example

Consider a three-node Cassandra cluster.

```text
RF = 3

Node A
Node B
Node C
```

A write is issued with QUORUM consistency.

### Step 1: Normal Operation

```text
Node A -> UP
Node B -> UP
Node C -> UP
```

All replicas are available.

### Step 2: Node C Fails

```text
Node A -> UP
Node B -> UP
Node C -> DOWN
```

### Step 3: Application Writes Data

The coordinator sends the mutation to the relevant replicas.

- Node A receives it.
- Node B receives it.
- Node C is unavailable.

The coordinator receives two acknowledgements.

QUORUM is satisfied.

### Step 4: Hint May Be Stored

Cassandra can store a hint for Node C.

### Step 5: Node C Recovers

Node C rejoins the cluster.

### Step 6: Missed Writes Are Replayed

Hints can be delivered to Node C.

### Step 7: Repair if Necessary

If hints did not cover all missed mutations, anti-entropy repair can synchronize the replicas.

### Complete Diagram

```text
             Normal Cluster
           A        B        C
           |        |        |
           UP       UP       UP
                    |
                    v
              Node C Fails
                    |
           +--------+--------+
           |                 |
           v                 v
        Node A             Node B
        Write              Write
           |                 |
           +--------+--------+
                    |
                    v
             QUORUM Satisfied
                    |
                    v
               Hint Stored
                    |
                    v
               Node C Returns
                    |
                    v
             Hints Replayed
                    |
                    v
            Repair if Required
```

---

## 16. Cassandra Consistency vs PostgreSQL Consistency

You have studied ACID properties, MVCC, and isolation levels in PostgreSQL.

It is important not to confuse Cassandra's tunable consistency with PostgreSQL transaction isolation.

| Feature                | PostgreSQL                                                | Cassandra                                            |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| Main consistency model | Transactional consistency and isolation                   | Tunable replica consistency                          |
| Transaction support    | ACID transactions                                         | Different transaction capabilities                   |
| Isolation levels       | READ COMMITTED, REPEATABLE READ, SERIALIZABLE             | Not equivalent to PostgreSQL isolation levels        |
| Replication            | Primary-based streaming replication in common deployments | Peer-to-peer replica distribution                    |
| Read consistency       | Controlled by transaction snapshots and isolation         | Controlled by consistency level and replica behavior |
| Data synchronization   | WAL-based replication                                     | Replication, hints, repair, and reconciliation       |

### Important distinction

PostgreSQL's ACID consistency and Cassandra's consistency levels describe different concepts.

PostgreSQL isolation levels determine how concurrent transactions observe data.

Cassandra consistency levels determine how many replicas must respond to an operation.

They should not be treated as interchangeable.

---

## 17. Practical Example: Choosing Consistency Levels

Suppose you are building a campaign platform.

Your database stores:

- User events.
- Campaign interactions.
- User preferences.
- Critical business records.

Consider the following possible design:

| Operation                   | Possible consistency choice                              | Reason                                                              |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Record a product view       | ONE                                                      | Low latency may be more important than immediate replica agreement  |
| Record a campaign click     | ONE or LOCAL_QUORUM                                      | Depends on whether event loss or stale reads are acceptable         |
| Update user preferences     | LOCAL_QUORUM                                             | A stronger local acknowledgement and read requirement may be useful |
| Read recent activity        | LOCAL_QUORUM                                             | Reduces the chance of reading stale replica data                    |
| Critical business operation | Carefully evaluated quorum or another suitable mechanism | Requires explicit correctness and transaction design                |

These are starting points, not universal rules.

For critical financial or transactional workflows, evaluate whether Cassandra's transaction and consistency capabilities actually satisfy the business invariants.

Do not select a database or consistency level based only on throughput.

---

## 18. Common Misconceptions

### Misconception 1: RF = 3 means three nodes must respond to every request.

Incorrect.

RF defines the number of replicas. The consistency level determines how many responses are required.

### Misconception 2: QUORUM means all replicas must respond.

Incorrect.

QUORUM requires a majority of replicas.

For RF = 3, quorum is two.

### Misconception 3: ONE always returns stale data.

Incorrect.

ONE can return the latest value, but it does not require enough replica responses to provide the same guarantees as a quorum read.

### Misconception 4: RF = 3 means the system can always tolerate two node failures.

Incorrect.

The ability to serve requests depends on the consistency level and which replicas remain available.

### Misconception 5: Hinted handoff guarantees complete replica synchronization.

Incorrect.

Hints are temporary recovery assistance. Repair is still needed to handle missed data beyond the hint-retention and delivery window.

### Misconception 6: Replication is the same as backup.

Incorrect.

Replication can propagate accidental updates and deletions. Backups provide a separate recovery mechanism.

### Misconception 7: Cassandra provides the same consistency model as PostgreSQL.

Incorrect.

Cassandra's tunable consistency levels and PostgreSQL's transaction isolation levels solve different problems.

### Misconception 8: QUORUM automatically guarantees serializable transactions.

Incorrect.

Quorum overlap does not provide general serializable multi-operation transactions.

---

## 19. Interview Questions

### Q1. What is replication in Cassandra?

Replication means maintaining multiple copies of data across nodes to improve availability and fault tolerance.

### Q2. What is replication factor?

It specifies how many replicas Cassandra maintains for each partition within the configured replication scope.

### Q3. What is the difference between SimpleStrategy and NetworkTopologyStrategy?

SimpleStrategy is a basic replication strategy that does not account for rack topology. NetworkTopologyStrategy supports replication configuration by data center and rack-aware placement.

### Q4. What is tunable consistency?

It allows applications to select the required number and scope of replica responses for individual operations.

### Q5. What is QUORUM?

A consistency level requiring a majority of replicas.

### Q6. How do you calculate quorum?

\[
Q = \left\lfloor \frac{RF}{2} \right\rfloor + 1
\]

### Q7. What does R + W > RF mean?

It is a condition under which read and write replica sets must overlap, assuming they refer to the same replica set.

### Q8. What happens if one node fails with RF = 3 and QUORUM consistency?

The operation can generally continue if two replicas remain available.

### Q9. What is LOCAL_QUORUM?

A consistency level requiring a quorum of replicas in the local data center.

### Q10. What is hinted handoff?

A mechanism that stores hints for temporarily unavailable replicas so missed mutations can be delivered when they recover.

### Q11. What is read repair?

A mechanism that can reconcile replica differences identified during read operations.

### Q12. What is anti-entropy repair?

A process that compares replica data ranges and synchronizes differences, using mechanisms such as Merkle trees.

### Q13. Why are Merkle trees used?

They allow efficient comparison of large datasets by comparing hashes of ranges rather than comparing every record immediately.

### Q14. Is replication a backup?

No. Replication maintains copies of live data, while backups provide independent recovery points.

### Q15. Does Cassandra provide strong consistency?

Cassandra provides configurable consistency guarantees. The guarantees depend on the consistency level, replication configuration, and operation semantics. Do not assume every configuration provides the same guarantees.

---

## 20. Practical Exercises

### Exercise 1 — Calculate Quorum

Calculate quorum for:

- RF = 3.
- RF = 5.
- RF = 7.

Use:

\[
Q = \left\lfloor \frac{RF}{2} \right\rfloor + 1
\]

### Exercise 2 — Node Failure

Suppose:

```text
RF = 3

Node A -> UP
Node B -> DOWN
Node C -> UP
```

Determine whether the following consistency levels can succeed:

- ONE.
- QUORUM.
- ALL.

Assume the available nodes are the relevant replicas.

### Exercise 3 — Quorum Overlap

Suppose:

```text
RF = 5
R = 3
W = 3
```

Calculate:

\[
R + W
\]

Does the read and write replica set have to overlap?

### Exercise 4 — Hinted Handoff

Suppose Node C is unavailable for 15 minutes.

During this period, Node A and Node B receive writes.

Explain:

1. What happens to the write?
2. What is a hint?
3. What happens when Node C returns?
4. What happens if the required hints are unavailable?

### Exercise 5 — Choose a Consistency Level

Consider these operations:

- Product view tracking.
- User profile updates.
- Critical payment records.
- Campaign analytics.

For each operation, choose a possible consistency level and justify the tradeoff.

Do not assume that a consistency level alone solves every transactional correctness requirement.

---

## 21. Chapter Summary

| Concept                 | Key takeaway                                            |
| ----------------------- | ------------------------------------------------------- |
| Replication             | Maintains multiple copies of data                       |
| Replication factor      | Number of replicas for each partition                   |
| SimpleStrategy          | Basic replica placement                                 |
| NetworkTopologyStrategy | Data-center and rack-aware replica placement            |
| Consistency level       | Controls required replica responses                     |
| ONE                     | Requires one replica response                           |
| QUORUM                  | Requires a majority                                     |
| ALL                     | Requires every relevant replica                         |
| LOCAL_QUORUM            | Requires a local data-center quorum                     |
| EACH_QUORUM             | Requires a quorum in every data center                  |
| Tunable consistency     | Allows different consistency requirements per operation |
| Hinted handoff          | Helps deliver missed writes after temporary failures    |
| Read repair             | Helps reconcile replica differences during reads        |
| Anti-entropy repair     | Synchronizes replica data through comparison            |
| Merkle tree             | Efficiently identifies differing data ranges            |

### The most important concepts to remember

1. Replication factor determines the number of copies, not the number of acknowledgements.
2. Consistency level determines how many replica responses are required.
3. QUORUM is a majority of replicas.
4. `R + W > RF` establishes replica-set overlap under the relevant assumptions.
5. Lower consistency levels can improve availability and latency.
6. Higher consistency requirements can make operations unavailable when more replicas fail.
7. Hinted handoff handles temporary missed writes.
8. Read repair can reconcile differences discovered during reads.
9. Anti-entropy repair synchronizes replica ranges.
10. Cassandra consistency levels are not equivalent to PostgreSQL transaction isolation levels.
