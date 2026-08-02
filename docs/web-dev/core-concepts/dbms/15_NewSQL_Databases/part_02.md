---
sidebar_label: NewSQL Internal Architecture
sidebar_position: 1
---

# NewSQL Internal Architecture

## 1. Introduction

In last section, we established that NewSQL databases combine:

- Relational data models.
- SQL query interfaces.
- ACID transactions.
- Distributed storage and execution.
- Horizontal scalability.

But knowing what NewSQL provides is not enough. To understand how it works, we need to examine its internal architecture.

Consider an e-commerce application:

- Customers create orders.
- Payments are processed.
- Inventory is updated.
- Orders and payments are stored on different database nodes.
- Multiple copies of the data exist for fault tolerance.

Now imagine that a customer places an order and the database must:

1. Insert an order.
2. Deduct inventory.
3. Record the payment.
4. Ensure all operations succeed or fail atomically.
5. Keep data consistent even if a database node crashes.

This is where distributed SQL architecture becomes important.

We will study the internal mechanisms that make this possible:

1. Distributed SQL architecture.
2. Nodes, ranges, and partitions.
3. Data replication.
4. Leader-based replication.
5. Consensus protocols.
6. Raft consensus.
7. Distributed transactions.
8. Two-Phase Commit (2PC).
9. Transaction coordination.
10. Failure handling and recovery.

---

# 2. Distributed SQL Architecture

A traditional relational database commonly runs on one primary database server.

A distributed SQL database spreads data and query execution across multiple nodes while preserving a relational SQL interface.

## 2.1 Traditional SQL Architecture

Consider a traditional PostgreSQL deployment:

```text
              Application
                   |
                   v
             PostgreSQL
              Server
                   |
                   v
             Storage Engine
                   |
                   v
                Disk
```

The application connects to PostgreSQL, PostgreSQL executes queries, and the storage engine reads or writes data.

The database can use multiple CPU cores, disks, and memory resources, but the database instance is still primarily managed by one server.

This creates a scaling limitation when one machine cannot handle the workload.

## 2.2 Distributed SQL Architecture

A distributed SQL database distributes storage and processing across multiple nodes.

```text
                 Application
                      |
                      v
               SQL Gateway Layer
                      |
                      v
              Query Planner / Optimizer
                      |
                      v
              Distributed Execution
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       Node A      Node B      Node C
          |           |           |
          v           v           v
       Storage     Storage     Storage
       Ranges      Ranges      Ranges
          |           |           |
          v           v           v
       Replicas    Replicas    Replicas
```

The SQL interface can look similar to a traditional relational database, but internally the system must coordinate multiple nodes.

For example:

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

The database must determine:

- Where is the relevant data stored?
- Which node should execute the query?
- Does the query need data from multiple nodes?
- Are the replicas sufficiently up to date?
- Does the query require a distributed transaction?

The application generally does not need to know which node stores each row.

## 2.3 Major Architectural Components

A distributed SQL database commonly contains the following components.

### A. SQL Gateway / SQL Layer

This is the entry point for SQL clients.

Responsibilities:

- Accept client connections.
- Parse SQL statements.
- Authenticate and authorize requests.
- Manage sessions.
- Send queries to the execution layer.

Example:

```sql
INSERT INTO orders (customer_id, total_amount)
VALUES (101, 2500);
```

The SQL layer receives this statement and starts processing it.

In some systems, the SQL gateway is also called a SQL node or SQL server.

### B. Query Parser

The parser checks whether the SQL statement follows valid SQL syntax.

For example:

```sql
SELECT * FROM orders;
```

This is syntactically valid.

But:

```sql
SELEC * FORM orders;
```

contains syntax errors.

The parser converts valid SQL into an internal representation, often an abstract syntax tree (AST).

### C. Query Planner and Optimizer

The query planner determines how to execute the query.

The optimizer evaluates possible execution strategies.

For example:

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

The optimizer may determine:

- Which index should be used?
- Which node owns the required data?
- Can the query execute on one node?
- Does it need to execute on multiple nodes?
- Can filtering happen close to the data?

The goal is to reduce execution cost, network communication, and unnecessary data movement.

### D. Distributed Query Execution Layer

This layer executes queries across multiple nodes.

Suppose orders are distributed across three nodes:

```text
Node A: Orders belonging to customers 1–1000
Node B: Orders belonging to customers 1001–2000
Node C: Orders belonging to customers 2001–3000
```

Now consider:

```sql
SELECT COUNT(*)
FROM orders;
```

The query may be divided into smaller operations:

```text
                    COUNT(*)
                       |
              Distributed Executor
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Node A       Node B       Node C
       COUNT(*)     COUNT(*)     COUNT(*)
          |            |            |
          +------------+------------+
                       |
                       v
                  SUM(results)
                       |
                       v
                    Result
```

Each node calculates its local count.

The distributed execution layer combines the results.

For example:

```text
Node A = 1,000
Node B = 1,500
Node C = 2,000

Final result = 4,500
```

This pattern is often described as **fan-out and fan-in**:

- Fan-out: distribute work to multiple nodes.
- Fan-in: collect and combine their results.

Not every query requires fan-out. A query targeting one known partition may execute on a single node or replica group.

### E. Transaction Layer

This layer manages transactions that may involve multiple nodes or partitions.

Responsibilities include:

- Transaction IDs.
- Transaction timestamps.
- Locking or intent management.
- Conflict detection.
- Commit and abort decisions.
- Coordination between transaction participants.

For example:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 101;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 202;

COMMIT;
```

If the two accounts are stored in different partitions, the transaction layer must coordinate work across those partitions.

### F. Distributed Storage Layer

This layer stores actual data.

Instead of keeping the entire database on one machine, data is divided into logical subsets and distributed across storage nodes.

Each logical subset may have multiple replicas.

```text
Database
   |
   +---- Partition 1
   |         |
   |         +---- Replica on Node A
   |         +---- Replica on Node B
   |         +---- Replica on Node C
   |
   +---- Partition 2
             |
             +---- Replica on Node B
             +---- Replica on Node C
             +---- Replica on Node D
```

### G. Metadata and Placement Layer

A distributed database must maintain information about where data lives.

For example:

```text
Partition 1 -> Nodes A, B, C
Partition 2 -> Nodes B, C, D
Partition 3 -> Nodes A, C, D
```

The system needs metadata about:

- Partition boundaries.
- Replica locations.
- Leaders.
- Node health.
- Data placement.
- Rebalancing.
- Cluster membership.

Some databases have dedicated control-plane components for these responsibilities.

For example, TiDB uses a Placement Driver (PD) to manage cluster metadata and scheduling decisions.

---

# 3. Nodes, Partitions, Ranges, and Replicas

These terms are fundamental to distributed database architecture.

They are related, but they do not mean the same thing.

## 3.1 What Is a Node?

A node is a participating server instance in a distributed database cluster.

A node may be:

- A physical server.
- A virtual machine.
- A containerized database process.
- A cloud-hosted database instance.

Example:

```text
Distributed Database Cluster

+------------------+
| Node A           |
| CPU, RAM, Disk   |
+------------------+

+------------------+
| Node B           |
| CPU, RAM, Disk   |
+------------------+

+------------------+
| Node C           |
| CPU, RAM, Disk   |
+------------------+
```

Each node contributes resources to the cluster.

A node may store several partitions or replicas.

## 3.2 What Is a Partition?

A partition is a logical subset of a database's data.

Suppose an orders table contains 3 million records.

The database may divide the data into three partitions:

```text
Orders Table
     |
     +---- Partition 1: Orders 1–1,000,000
     |
     +---- Partition 2: Orders 1,000,001–2,000,000
     |
     +---- Partition 3: Orders 2,000,001–3,000,000
```

Each partition can be stored on different nodes.

Partitioning allows the database to distribute storage and processing.

## 3.3 What Is a Range?

A range is a logical partition defined by a contiguous interval of keys.

Some distributed SQL databases, particularly CockroachDB, organize data into key ranges.

Example:

```text
Range 1: Keys A000 to A999
Range 2: Keys B000 to B999
Range 3: Keys C000 to C999
```

A range is not a universal synonym for partition.

Different databases use different terminology and internal data structures.

For example:

- CockroachDB uses ranges.
- YugabyteDB uses tablets.
- TiKV uses regions.
- Other systems may use partitions or shards.

## 3.4 What Is a Replica?

A replica is a copy of a logical data partition or range.

Suppose Partition 1 is stored on three nodes:

```text
Partition 1
    |
    +---- Replica 1 -> Node A
    |
    +---- Replica 2 -> Node B
    |
    +---- Replica 3 -> Node C
```

All three replicas represent the same logical data.

The database maintains consistency between them using its replication protocol.

Why create replicas?

1. Fault tolerance.
2. High availability.
3. Recovery after node failure.
4. Potentially improved read locality.

## 3.5 Partition vs Node vs Replica

| Term      | Meaning                                    | Example                          |
| --------- | ------------------------------------------ | -------------------------------- |
| Node      | Database server instance                   | Node A                           |
| Partition | Logical subset of data                     | Orders 1–1,000,000               |
| Range     | Contiguous key interval in certain systems | Keys A000–A999                   |
| Replica   | Copy of a partition or range               | Replica of Partition 1 on Node B |

Remember:

**A partition is a logical division of data. A node is a machine or process. A replica is a copy of the data.**

One node can store multiple partitions and replicas.

## 3.6 Data Placement Example

Suppose we have three nodes and two partitions.

```text
                Partition 1
                Partition 2

Node A          Replica 1
Node B          Replica 2       Replica 1
Node C          Replica 3       Replica 2
Node D                          Replica 3
```

The database distributes replicas across nodes to avoid losing all copies when one node fails.

If Node A crashes, Partition 1 still has replicas on Nodes B and C.

The database can continue operating if the remaining replicas satisfy the relevant availability and consistency requirements.

## 3.7 Rebalancing

As a cluster grows, the database may need to redistribute data.

Suppose initially:

```text
Node A: 80% storage used
Node B: 20% storage used
Node C: 25% storage used
```

The database can move partitions or replicas to reduce imbalance.

After rebalancing:

```text
Node A: 45% storage used
Node B: 40% storage used
Node C: 42% storage used
```

Rebalancing helps distribute:

- Storage usage.
- Read traffic.
- Write traffic.
- CPU utilization.

However, rebalancing consumes network bandwidth and disk I/O.

## 3.8 Hot Partitions and Hot Keys

Not all partitions receive equal traffic.

Suppose an application stores campaign participation data.

```text
Campaign A -> 90% of traffic
Campaign B -> 5% of traffic
Campaign C -> 5% of traffic
```

If most requests target Campaign A, its partition may become a hotspot.

Adding more nodes does not automatically solve the problem if traffic continues to concentrate on one key or partition.

Possible solutions include:

- Better partition-key design.
- Splitting ranges.
- Distributing writes across multiple keys.
- Caching frequently accessed data.
- Redesigning the access pattern.

A distributed database can have many nodes and still suffer from a single hot partition.

---

# 4. Data Replication in Distributed SQL

Replication means maintaining multiple copies of data across different nodes.

It is one of the most important mechanisms for availability and fault tolerance.

## 4.1 Why Is Replication Needed?

Consider a database with only one copy of data:

```text
Application
    |
    v
  Node A
    |
    v
  Disk
```

If Node A crashes and its storage is unavailable, the application may lose access to the data.

Now consider three replicas:

```text
             Partition 1
                  |
        +---------+---------+
        |         |         |
        v         v         v
      Node A    Node B    Node C
      Replica   Replica   Replica
```

If one node fails, other replicas may still provide access to the data.

Replication provides:

1. Fault tolerance.
2. Improved availability.
3. Data durability.
4. Potential read scalability.
5. Geographic distribution, depending on placement.

Replication is not the same as backup.

A replicated accidental deletion or corrupted logical update may also propagate to other replicas. Backups and recovery mechanisms remain necessary.

## 4.2 Replication Factor

Replication factor means the number of copies maintained for a partition or data unit.

For example:

```text
Replication Factor = 3
```

Means three replicas are maintained.

| Replication Factor | Copies | Typical implication                                         |
| ------------------ | -----: | ----------------------------------------------------------- |
| 1                  |      1 | No replica redundancy                                       |
| 2                  |      2 | One additional copy                                         |
| 3                  |      3 | Can tolerate one replica failure for majority-based writes  |
| 5                  |      5 | Can tolerate two replica failures for majority-based writes |

The failure tolerance shown here assumes a majority-based consensus group with that number of voting replicas.

A database may have non-voting replicas or other replication arrangements, so replication factor and voting-member count are not always identical.

## 4.3 Synchronous Replication

In synchronous replication, a write is acknowledged only after the required replication condition has been satisfied.

Example with three replicas:

```text
              Client
                |
                v
             Leader
                |
        +-------+-------+
        |       |       |
        v       v       v
      Node A  Node B  Node C
      Leader  Follower Follower
```

Suppose a client inserts an order.

1. The leader receives the write.
2. The leader replicates the operation to followers.
3. The required quorum acknowledges the write.
4. The operation becomes committed according to the replication protocol.
5. The client receives success.

With three voting replicas, a majority is two.

Therefore, the leader and at least one follower may be sufficient for a majority acknowledgement.

It does not necessarily wait for every replica.

**Important:** Synchronous replication does not universally mean that every replica must acknowledge the write. The exact acknowledgement condition depends on the database's replication protocol.

## 4.4 Asynchronous Replication

In asynchronous replication, the primary can acknowledge a write before all replicas have received it.

```text
Client
  |
  v
Primary
  |
  +------> Acknowledge Client
  |
  +------> Replicate Later
              |
         +----+----+
         |         |
         v         v
      Replica B  Replica C
```

This can reduce write latency, but replicas may temporarily lag behind.

If the primary fails before the latest changes are safely replicated, those changes may be lost during failover depending on the system's guarantees.

## 4.5 Synchronous vs Asynchronous Replication

| Feature                 | Synchronous                                        | Asynchronous                                       |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------- |
| Write acknowledgement   | Waits for required replication condition           | May acknowledge before followers catch up          |
| Replication lag         | Bounded by commit protocol for acknowledged writes | Can exist                                          |
| Write latency           | Often higher                                       | Often lower                                        |
| Failover data-loss risk | Lower under protocol guarantees                    | Potentially higher                                 |
| Network dependency      | Stronger                                           | Usually weaker                                     |
| Common use              | Strongly consistent distributed writes             | Read replicas and lower-latency replication setups |

Distributed SQL databases often use synchronous quorum replication for strongly consistent writes.

Do not assume every replication path in every product is synchronous.

---

# 5. Leader-Based Replication

Many distributed databases use leader-based replication.

In this model, one replica is designated as the leader for a particular replication group.

Other replicas act as followers.

## 5.1 Leader and Followers

```text
                Client
                  |
                  v
              Leader
                  |
        +---------+---------+
        |                   |
        v                   v
     Follower B          Follower C
```

The leader coordinates writes for that replication group.

Followers receive replicated log entries and apply committed operations.

A database can have many replication groups, each with a different leader.

Therefore, a cluster does not necessarily have one global leader for all data.

## 5.2 Write Flow

Suppose a client executes:

```sql
INSERT INTO orders (order_id, amount)
VALUES (5001, 2500);
```

Assume the relevant range has three replicas.

The write flow is conceptually:

```text
Step 1: Client sends write
              |
              v
         Leader Node A
              |
              v
Step 2: Leader appends operation
       to its replication log
              |
       +------+------+
       |             |
       v             v
   Follower B    Follower C
       |             |
       +------+------+
              |
              v
Step 3: Required quorum acknowledges
              |
              v
Step 4: Entry becomes committed
              |
              v
Step 5: Replicas apply committed entry
              |
              v
Step 6: Client receives success
```

The exact ordering of replication, commit, application, and acknowledgement can vary by implementation. The important distinction is that an operation must satisfy the protocol's commit condition before it is treated as committed.

## 5.3 Why Use a Leader?

Without a leader, multiple replicas might independently accept conflicting writes.

For example:

```text
Node A: balance = 5000
Node B: balance = 5000
```

Suppose both accept independent writes:

```text
Node A: balance = 4000
Node B: balance = 3000
```

Now the replicas disagree.

A leader-based protocol provides an ordered authority for proposing operations within that replication group.

The consensus protocol ensures that committed operations are consistently ordered across the group.

## 5.4 What Happens if the Leader Fails?

Suppose Node A is the leader:

```text
       Node A (Leader)
          /       \
         v         v
      Node B     Node C
     Follower   Follower
```

Node A crashes.

The remaining replicas detect that the leader is unavailable.

They can elect a new leader if they still have a valid voting quorum.

```text
       Node A (Down)

       Node B       Node C
      Candidate    Candidate
          \          /
           \        /
            New Leader
```

After a successful election, the new leader can coordinate writes.

The database must ensure that the new leader's log is compatible with committed history.

## 5.5 Leader vs Leaseholder

These terms are important in distributed SQL systems.

A leader is a consensus role responsible for coordinating log replication in a replication group.

A leaseholder is a node holding a time-bounded authority to serve certain operations, often reads and writes, for a range.

Some databases use closely related mechanisms, but these concepts are not identical.

For example, CockroachDB uses Raft leaders and leaseholders. They are related but should not be treated as interchangeable concepts.

---

# 6. Consensus Protocols

Replication creates multiple copies of data.

But replication introduces a difficult question:

**How do multiple replicas agree on which operations are committed and in what order?**

This is the problem consensus protocols solve.

## 6.1 What Is Consensus?

Consensus is the process by which multiple distributed nodes agree on a value or an ordered sequence of operations despite certain failures.

In distributed databases, consensus is commonly used to:

- Elect leaders.
- Agree on committed log entries.
- Maintain consistent replicated state.
- Prevent conflicting leaders from independently committing writes.

Imagine three replicas:

```text
Node A
Node B
Node C
```

A client requests:

```text
Balance = 4000
```

The system must ensure that the replicas do not commit incompatible histories.

Consensus provides a mechanism to agree on the committed sequence of operations.

## 6.2 Why Is Consensus Difficult?

Distributed nodes communicate over a network.

Networks can fail in several ways:

- Messages can be delayed.
- Messages can be lost.
- Connections can break.
- A node can crash.
- A node can become temporarily unreachable.
- Two groups of nodes may become isolated from each other.

A node cannot always distinguish between:

1. A failed node.
2. A slow node.
3. A network connection problem.

This makes leader election and write coordination difficult.

## 6.3 Network Partition Example

Suppose we have three replicas:

```text
Node A ---- Node B       Node C
     Network Partition
```

Node C cannot communicate with A and B.

The cluster is divided into:

```text
Group 1: A + B
Group 2: C
```

With three voting replicas, a majority requires two votes.

Therefore:

- A and B can potentially continue committing writes.
- C cannot independently commit majority-based writes.
- C must not accept conflicting writes as if it were an authoritative leader.

This protects consistency at the expense of availability for the minority side.

## 6.4 Quorum

A quorum is the minimum number of voting replicas required to satisfy a consensus decision.

For a simple majority-based group:

\[
Quorum = \left\lfloor \frac{N}{2} \right\rfloor + 1
\]

Where:

- \(N\) = number of voting replicas.

Examples:

| Voting Replicas | Majority Quorum | Crash Failures Tolerated |
| --------------: | --------------: | -----------------------: |
|               1 |               1 |                        0 |
|               3 |               2 |                        1 |
|               5 |               3 |                        2 |
|               7 |               4 |                        3 |

For a majority-based consensus group with \(2f+1\) voters, the group can tolerate up to \(f\) crash failures while retaining a quorum, assuming the protocol's normal safety and timing assumptions.

**Important:** A quorum does not mean every replica must be available.

For three replicas, two can be sufficient.

But if only one replica is available, the group cannot safely commit new majority-based writes.

## 6.5 What Does Consensus Guarantee?

Consensus protocols are designed to provide safety properties such as:

- Committed operations are not contradicted by another committed history.
- Replicas agree on the order of committed operations.
- A valid leader is elected according to protocol rules.

They also provide progress when the necessary quorum and communication conditions are available.

Consensus does not guarantee that every node is always reachable or that every operation completes immediately.

---

# 7. Raft Consensus Algorithm

Raft is a consensus algorithm designed to make distributed consensus easier to understand and implement.

It is used in several distributed database systems.

Examples:

- CockroachDB uses Raft.
- TiKV uses Raft.
- YugabyteDB uses Raft.
- Google Spanner uses Paxos-family consensus rather than Raft.

Raft is not the only consensus protocol used by distributed databases.

## 7.1 Raft Roles

Raft has three main roles:

1. Leader.
2. Follower.
3. Candidate.

### Leader

The leader:

- Accepts or coordinates client writes.
- Appends operations to its log.
- Replicates log entries to followers.
- Tracks replication acknowledgements.
- Determines when entries are committed.

### Follower

The follower:

- Receives replication messages.
- Stores log entries.
- Responds to the leader.
- Applies committed entries.
- Can become a candidate if it does not receive valid leader communication within the election timeout.

### Candidate

A candidate:

- Starts a new election.
- Requests votes from other replicas.
- Becomes leader if it receives the required majority.

## 7.2 Raft Terms

Raft uses a concept called a term.

A term represents an election period.

Each term has a number:

```text
Term 1
Term 2
Term 3
Term 4
```

Terms help nodes recognize stale leaders and outdated messages.

If a node receives communication with a higher term, it updates its term and steps down to follower status when appropriate.

## 7.3 Raft Leader Election

Initially, nodes are followers.

```text
Node A: Follower
Node B: Follower
Node C: Follower
```

If a follower does not receive valid heartbeats within its election timeout, it may become a candidate.

```text
Node A: Candidate
Node B: Follower
Node C: Follower
```

The candidate requests votes.

```text
Candidate A
    |
    +---- Request Vote -> Node B
    |
    +---- Request Vote -> Node C
```

If it receives a majority, it becomes leader.

For three voting replicas:

```text
Votes needed = 2
```

For example:

```text
Node A votes for A
Node B votes for A
Node C votes for A

Node A wins.
```

A candidate that does not obtain a majority may start another election in a later term.

## 7.4 Raft Log Replication

Once a leader is elected, it can coordinate writes.

Suppose the client executes:

```sql
UPDATE accounts
SET balance = 4000
WHERE account_id = 101;
```

Conceptual flow:

```text
Client
  |
  v
Leader A
  |
  v
Append entry to local log
  |
  +-------------------+
  |                   |
  v                   v
Follower B          Follower C
Append entry        Append entry
  |                   |
  +---------+---------+
            |
            v
       Majority reached
            |
            v
       Entry committed
            |
            v
      Apply to state machine
            |
            v
       Return result
```

The operation is committed after the protocol's commit condition is satisfied.

It is not necessary for every replica to acknowledge it.

## 7.5 Raft Log

A Raft log contains ordered entries representing operations.

Example:

| Log Index | Term | Operation          |
| --------: | ---: | ------------------ |
|         1 |    1 | Create account 101 |
|         2 |    1 | Deposit 5000       |
|         3 |    2 | Withdraw 1000      |
|         4 |    2 | Deposit 2000       |

The replicas maintain compatible log histories.

The log is the replicated history from which the database's state is built.

## 7.6 Commit Index

The commit index identifies the highest log position known to be committed.

Example:

```text
Log:

Index:      1   2   3   4   5
            |   |   |   |   |
Status:     C   C   C   P   P
```

Where:

- C = Committed.
- P = Pending / not yet committed.

If the commit index is 3, entries 1, 2, and 3 are committed.

Entries 4 and 5 are not yet known to be committed.

## 7.7 Apply to State Machine

Committing a log entry and applying it are distinct steps.

The database applies committed entries to its state machine.

For example:

```text
Committed Log Entry:
Update account 101 balance to 4000
                 |
                 v
        Apply to State Machine
                 |
                 v
       Stored Database State
                 |
                 v
       account 101 = 4000
```

A replica may know an entry is committed before it has applied that entry to its local state machine.

This distinction matters when understanding replication lag and recovery.

## 7.8 Raft: Complete Write Flow

```text
1. Client sends write request
             |
             v
2. Leader receives request
             |
             v
3. Leader appends entry to log
             |
             v
4. Leader sends entry to followers
             |
             v
5. Followers append entry
             |
             v
6. Required majority acknowledges
             |
             v
7. Entry becomes committed
             |
             v
8. Replicas apply committed entry
             |
             v
9. Client receives success
```

This is the simplified conceptual flow. Actual implementation details, including when a response is sent relative to local application, vary.

## 7.9 What Happens if the Leader Crashes?

Suppose:

```text
Node A = Leader
Node B = Follower
Node C = Follower
```

Node A crashes.

The remaining replicas can elect a new leader if a quorum is available.

```text
Node A = Down

Node B = Candidate
Node C = Follower

Node B = New Leader
```

The new leader must preserve committed history.

Raft uses election restrictions and log matching rules to prevent a candidate with an insufficiently up-to-date log from winning a valid election.

An uncommitted entry from a failed leader may be overwritten during log reconciliation.

A committed entry must remain preserved under Raft's safety guarantees.

## 7.10 Important Raft Concepts

| Concept      | Meaning                                         |
| ------------ | ----------------------------------------------- |
| Term         | Election period / logical epoch                 |
| Leader       | Coordinates log replication                     |
| Follower     | Receives replicated log entries                 |
| Candidate    | Requests votes                                  |
| Log          | Ordered sequence of operations                  |
| Commit index | Highest known committed log position            |
| Apply        | Execute committed operation against local state |
| Heartbeat    | Leader communication used to maintain authority |
| Quorum       | Majority of voting replicas                     |

## 7.11 Is Raft Used by Every NewSQL Database?

No.

| Database       | Consensus / Replication Approach |
| -------------- | -------------------------------- |
| CockroachDB    | Raft                             |
| TiDB / TiKV    | Raft                             |
| YugabyteDB     | Raft                             |
| Google Spanner | Paxos-family replication         |

The broad purpose is similar: coordinate replicated state and maintain safe committed histories.

The specific protocol and architecture differ.

---

# 8. Distributed Transactions

A distributed transaction is a transaction that involves multiple partitions, ranges, or nodes.

A normal SQL transaction might execute entirely within one partition.

A distributed transaction may need coordination across multiple partitions.

## 8.1 Single-Partition Transaction

Suppose the database stores Account 101 and Account 102 in the same partition.

```text
Partition 1
    |
    +---- Account 101
    |
    +---- Account 102
```

A transaction that updates both accounts may execute within the same transaction participant.

The system still uses its transaction and replication mechanisms, but it does not need to coordinate a second independent partition for this operation.

## 8.2 Multi-Partition Transaction

Now suppose:

```text
Partition 1 -> Account 101 -> Node A
Partition 2 -> Account 202 -> Node B
```

A bank transfer requires updating both accounts.

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 101;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 202;

COMMIT;
```

The transaction involves two partitions.

The database must ensure that both changes commit or neither change becomes committed.

This requires distributed transaction coordination.

## 8.3 Why Is It Difficult?

In a single-node database, the transaction manager can coordinate local storage operations.

In a distributed database:

- Participants communicate over a network.
- Messages can be delayed or lost.
- A participant can crash.
- The coordinator can crash.
- Replicas may temporarily be unavailable.
- The transaction may hold locks or intents across multiple nodes.

The system must maintain atomicity and the configured isolation guarantees despite these failures.

## 8.4 Distributed Transaction Flow

A simplified distributed transaction looks like this:

```text
                  Client
                    |
                    v
             SQL Gateway
                    |
                    v
          Transaction Coordinator
                    |
             +------+------+
             |             |
             v             v
        Participant A  Participant B
        Partition 1    Partition 2
             |             |
             v             v
        Replica Group  Replica Group
```

The coordinator tracks the transaction.

Each participant performs its local work.

The system then coordinates the final commit or abort decision.

## 8.5 Transaction Isolation

Distributed SQL databases do not all provide exactly the same isolation semantics.

Some support serializable transactions, while others provide different isolation levels or configurable consistency guarantees.

Do not assume that every distributed SQL database automatically provides serializable isolation for every transaction.

The database's documented isolation model matters.

---

# 9. Two-Phase Commit (2PC)

Two-Phase Commit is a distributed atomic commit protocol.

Its purpose is to ensure that multiple transaction participants make one coordinated commit-or-abort decision.

It is especially important when a transaction spans multiple independent participants.

**2PC and Raft solve different problems.**

- Raft: consensus within a replicated group.
- 2PC: atomic commit coordination across transaction participants.

## 9.1 Why Do We Need 2PC?

Suppose a bank transfer involves two partitions:

```text
Partition A:
Account 101 = ₹10,000

Partition B:
Account 202 = ₹5,000
```

The transaction transfers ₹1,000 from Account 101 to Account 202.

The desired result is:

```text
Account 101 = ₹9,000
Account 202 = ₹6,000
```

What if the first update succeeds but the second fails?

Without distributed atomic commit, the database could leave the system in an inconsistent business state.

We need a protocol that coordinates both participants.

## 9.2 Components of 2PC

Two important roles:

### Coordinator

The coordinator:

- Starts the distributed commit protocol.
- Sends prepare requests.
- Collects votes.
- Determines commit or abort.
- Communicates the final decision.

### Participants

Participants are the transaction groups or resource managers involved in the transaction.

They:

- Execute their local transaction work.
- Prepare the transaction.
- Persist prepared state or intent.
- Vote YES or NO.
- Follow the final commit or abort decision.

## 9.3 Phase 1: Prepare / Voting Phase

The coordinator sends a prepare request to every participant.

```text
             Coordinator
                  |
          +-------+-------+
          |               |
          v               v
     Participant A   Participant B
          |               |
          v               v
      Prepare          Prepare
          |               |
          v               v
       Vote YES         Vote YES
```

Each participant checks whether it can commit.

It may need to:

- Validate constraints.
- Check transaction conflicts.
- Ensure required resources are available.
- Persist prepared state.
- Retain locks or write intents.
- Make its prepared state recoverable.

A participant votes:

- YES: It is prepared to commit.
- NO: It cannot commit.

A YES vote does not mean the transaction is committed.

It means the participant is prepared and will wait for the final decision.

## 9.4 Phase 2: Commit / Abort Phase

The coordinator collects the votes.

### Case 1: All Participants Vote YES

```text
Participant A -> YES
Participant B -> YES

Coordinator
     |
     v
All participants prepared
     |
     v
Commit Decision
     |
 +---+---+
 |       |
 v       v
 A       B
Commit  Commit
```

The coordinator durably records the commit decision and sends it to participants.

Participants commit their prepared work.

### Case 2: Any Participant Votes NO

```text
Participant A -> YES
Participant B -> NO

Coordinator
     |
     v
Abort Decision
     |
 +---+---+
 |       |
 v       v
 A       B
Abort   Abort
```

The transaction is aborted.

No participant should independently commit the distributed transaction.

## 9.5 2PC Complete Flow

```text
                Coordinator
                     |
                     v
              PHASE 1: PREPARE
                     |
          +----------+----------+
          |                     |
          v                     v
     Participant A         Participant B
          |                     |
          v                     v
      Prepare work           Prepare work
          |                     |
          v                     v
       Vote YES               Vote YES
          |                     |
          +----------+----------+
                     |
                     v
              All voted YES?
                     |
                     v
              PHASE 2: COMMIT
                     |
          +----------+----------+
          |                     |
          v                     v
     Participant A         Participant B
          |                     |
          v                     v
        Commit                Commit
```

If any participant votes NO, the coordinator decides to abort instead.

## 9.6 The Blocking Problem in 2PC

The classic weakness of 2PC is that it can block.

Consider this sequence:

1. Coordinator sends PREPARE.
2. Participant A votes YES.
3. Participant B votes YES.
4. Both participants persist their prepared state.
5. Coordinator crashes before participants learn the final decision.

Now what happens?

```text
Coordinator = CRASHED

Participant A = PREPARED
Participant B = PREPARED
```

The participants cannot safely assume that the transaction should commit or abort.

They may need to wait until they can discover the coordinator's durable decision or communicate with a recovery process.

This can keep locks or intents held and block other transactions.

That is why 2PC is described as a blocking atomic commit protocol under certain failures.

## 9.7 How Is 2PC Made More Reliable?

Distributed systems can improve recovery by:

- Persisting coordinator decisions.
- Replicating transaction metadata.
- Using consensus-backed records.
- Providing recovery procedures.
- Allowing participants to discover the final decision.

The exact design differs between database products.

Consensus can help make coordinator state durable and available, but consensus does not turn 2PC into the same protocol. They solve separate coordination problems.

## 9.8 Is Every NewSQL Database Using Textbook 2PC?

No.

The conceptual atomic-commit problem is common, but implementation details differ.

| Database       | High-Level Approach                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Google Spanner | Uses Paxos-replicated groups, TrueTime, and distributed transaction coordination including 2PC           |
| CockroachDB    | Uses transaction records and write intents on top of Raft-replicated ranges                              |
| TiDB           | Uses a Percolator-inspired two-phase commit protocol                                                     |
| YugabyteDB     | Uses distributed transaction coordination and transaction status mechanisms with Raft-replicated tablets |

The goal is distributed atomicity, but the internal implementation is not identical across products.

---

# 10. Transaction Coordination

A distributed transaction needs coordination because different partitions may be managed by different nodes.

The transaction coordinator manages the overall transaction lifecycle.

## 10.1 Coordinator Responsibilities

A transaction coordinator may manage:

1. Transaction identity.
2. Participants.
3. Transaction timestamps.
4. Read and write sets.
5. Conflict handling.
6. Prepare requests.
7. Commit or abort decisions.
8. Recovery after failure.

A coordinator does not necessarily execute every data operation itself.

It coordinates the participants that own the relevant data.

## 10.2 Transaction ID

A distributed transaction needs an identifier.

Example:

```text
Transaction ID: TXN-10001

Participants:
- Partition A
- Partition B
- Partition C

Operations:
- Debit Account 101
- Credit Account 202
- Insert Transaction History
```

The transaction ID helps participants and recovery mechanisms identify the same transaction.

## 10.3 Transaction State

A simplified transaction state machine:

```text
          PENDING
             |
             v
          PREPARED
          /     \
         v       v
      COMMIT   ABORT
         |       |
         v       v
      COMMITTED ABORTED
```

Actual transaction state machines differ between systems, but the key idea is that a transaction's final outcome must be coordinated and recoverable.

## 10.4 Why Does Coordination Add Latency?

Suppose a transaction involves three regions:

```text
Region A
   |
   +---- Region B
   |
   +---- Region C
```

The system must exchange messages between participants.

Every additional network round trip adds latency.

The transaction may need:

- Reads from remote partitions.
- Write-intent creation.
- Replication acknowledgements.
- Prepare messages.
- Commit messages.

A local transaction can be much faster because it avoids much of this distributed coordination.

This is one reason why data locality and transaction-aware data modeling matter.

---

# 11. Failure Handling and Recovery

Distributed systems must assume that failures will happen.

A node can crash. A network can become unavailable. A coordinator can fail. A replica can fall behind.

A distributed database needs mechanisms to recover without violating its consistency guarantees.

## 11.1 Node Failure

Suppose a partition has three replicas:

```text
Node A
Node B
Node C
```

Node A crashes.

If B and C can form the required quorum, the group can continue operating according to its protocol.

When A comes back:

1. It reconnects to the cluster.
2. It determines the latest committed state.
3. It catches up using replicated log entries.
4. It may use a snapshot if it is too far behind.
5. It resumes normal participation.

## 11.2 Leader Failure

Suppose the leader crashes.

```text
Node A = Leader (Down)
Node B = Follower
Node C = Follower
```

The remaining voting replicas can elect a new leader if a quorum is available.

The new leader coordinates future writes.

Committed log entries remain protected by consensus safety guarantees.

## 11.3 Follower Lag

A follower may temporarily fall behind.

For example:

```text
Leader log index:     1000
Follower B index:     1000
Follower C index:      950
```

Follower C is behind by 50 entries.

It needs to catch up before it can serve certain reads safely or participate in operations that require up-to-date state.

The system may send missing log entries or install a snapshot.

## 11.4 Network Partition

Suppose:

```text
Node A ---- Node B       Node C
     Network Partition
```

With three voting replicas:

- A and B have a majority.
- C does not.

The majority side may continue committing writes.

The minority side cannot safely commit majority-based writes independently.

This prevents conflicting histories from being committed.

When connectivity returns, replicas reconcile their logs and state according to the protocol.

## 11.5 Coordinator Failure During a Distributed Transaction

This is more complicated.

Suppose:

```text
Coordinator = Down

Participant A = Prepared
Participant B = Prepared
```

The participants may remain prepared until the final decision can be recovered.

The system needs durable transaction state and recovery logic.

It must not guess that a transaction committed simply because all participants previously voted YES.

## 11.6 Write-Ahead Logs and Recovery

Many databases use logs to make recovery possible.

A write-ahead log (WAL) records changes before the corresponding data pages are considered safely persisted.

A simplified flow:

```text
Transaction
    |
    v
Write WAL / Log
    |
    v
Persist required log data
    |
    v
Commit according to protocol
    |
    v
Apply changes to data pages
```

After a crash, the database can use logs and recovery metadata to reconstruct the correct state.

Distributed databases may combine local storage logs with replicated consensus logs.

These are related but should not be assumed to be one universal log shared by every subsystem.

## 11.7 Snapshots

As logs grow, replaying every historical entry can become expensive.

A snapshot captures a database state at a particular point.

Example:

```text
Log Entries:
1, 2, 3, 4, 5, 6, 7, 8, 9, 10

Snapshot at Entry 8

Recovery:
Load Snapshot
     |
     v
Replay Entries 9 and 10
```

Snapshots can reduce recovery and replica catch-up time.

## 11.8 Retry and Idempotency

Distributed operations can fail with ambiguous outcomes.

Example:

1. The database commits an order.
2. The response is lost due to a network problem.
3. The application receives a timeout.
4. The application cannot know whether the order committed.

Blindly retrying may create a duplicate order.

A common solution is an idempotency key.

Example:

```text
POST /orders

Idempotency-Key: order-request-10001
```

The server stores the key with the transaction result.

If the same request is retried, the application can return the existing result instead of creating another order.

This is particularly important for:

- Payments.
- Order creation.
- Reward allocation.
- Inventory deduction.
- External API calls.

A database transaction retry and an application-level request retry are not the same thing. They require different handling.

## 11.9 Failure Handling Summary

| Failure               | Typical Response                                          |
| --------------------- | --------------------------------------------------------- |
| Node crashes          | Continue if required quorum remains                       |
| Leader crashes        | Elect a new leader                                        |
| Follower falls behind | Catch up through log replication or snapshot              |
| Network partition     | Majority side may continue; minority cannot safely commit |
| Coordinator crashes   | Recover durable transaction decision                      |
| Disk failure          | Recover from replicas, logs, or backups                   |
| Client timeout        | Determine outcome or retry safely using idempotency       |

---

# 12. End-to-End Example: Distributed Bank Transfer

Now combine the concepts.

Suppose we have a distributed SQL database with three nodes:

```text
Node A
Node B
Node C
```

Accounts are distributed across two ranges:

```text
Range 1:
Account 101
Replicas: Node A, Node B, Node C

Range 2:
Account 202
Replicas: Node A, Node B, Node C
```

Each range has its own replication group.

The transaction transfers ₹1,000 from Account 101 to Account 202.

Initial state:

```text
Account 101 = ₹10,000
Account 202 = ₹5,000
```

SQL:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 101;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 202;

COMMIT;
```

## Step 1: Client Sends SQL

```text
Application
    |
    v
SQL Gateway
```

The SQL gateway receives the transaction.

## Step 2: Query Planning

The database identifies the two accounts and their locations.

```text
Account 101 -> Range 1
Account 202 -> Range 2
```

## Step 3: Transaction Coordination

The transaction coordinator identifies two participants:

```text
Participant A -> Range 1
Participant B -> Range 2
```

Each participant performs its local transaction work.

## Step 4: Replication

The relevant changes and transaction metadata are replicated within their respective replica groups.

```text
Range 1:
Node A <-> Node B <-> Node C

Range 2:
Node A <-> Node B <-> Node C
```

Consensus mechanisms such as Raft or Paxos help each replication group maintain its committed history.

## Step 5: Distributed Commit

The transaction coordinator coordinates the final transaction outcome.

In a 2PC-style conceptual flow:

```text
Coordinator
    |
    +---- Prepare Range 1
    |
    +---- Prepare Range 2
    |
    v
Collect Votes
    |
    v
All participants ready?
    |
    v
Commit or Abort
```

A product may implement this using additional transaction records, intents, timestamps, or other mechanisms.

## Step 6: Final State

If the transaction commits:

```text
Account 101 = ₹9,000
Account 202 = ₹6,000
```

If the transaction aborts:

```text
Account 101 = ₹10,000
Account 202 = ₹5,000
```

The database must not expose a partially committed transfer.

## What If Node A Crashes?

If Node A is a replica-group leader, the remaining replicas may elect a new leader if they have quorum.

The transaction's final outcome must still be recovered from durable transaction metadata.

The database must not infer that the transaction committed merely because one participant completed its local work.

This example demonstrates why distributed SQL requires both replication coordination and transaction coordination.

---

# 13. Performance Tradeoffs in Distributed SQL

Distributed SQL provides horizontal scalability, but distributed coordination has a cost.

## 13.1 Network Latency

A local database operation may involve local memory, CPU, and disk access.

A distributed operation may involve multiple network round trips.

For geographically distributed replicas:

```text
Region A
    |
    | Network communication
    |
Region B
    |
    | Network communication
    |
Region C
```

The latency of a strongly consistent write can depend on the placement of the replicas and the quorum acknowledgement path.

## 13.2 Cross-Partition Transactions

A transaction involving one partition is generally simpler than a transaction involving multiple partitions.

| Transaction      | Coordination                        |
| ---------------- | ----------------------------------- |
| Single partition | Local participant coordination      |
| Two partitions   | Distributed coordination            |
| Many partitions  | More communication and coordination |

This is why good partition-key and data-model design matters.

## 13.3 Hotspots

If too many requests target one range or key, that range can become a bottleneck.

Adding nodes does not necessarily distribute the workload if the partitioning strategy keeps the hot key together.

## 13.4 Replication Factor

More replicas can improve fault tolerance, but they can also increase:

- Storage requirements.
- Replication traffic.
- Write coordination overhead.
- Operational complexity.

## 13.5 Read Strategies

Distributed SQL systems may support different read paths.

### Leader / Leaseholder Reads

Reads are served by the node holding the required authority for the relevant data.

This can provide strong consistency according to the database's read protocol.

### Follower Reads

Reads are served by follower replicas.

They may be stale unless the system uses a safe follower-read mechanism.

Some databases support timestamp-based follower reads that preserve defined consistency guarantees.

Do not assume every follower read is automatically safe or automatically stale. The exact semantics matter.

---

# 14. Product-Specific Architecture Overview

The next chapter, Part 18C, will examine these systems in more detail. For now, understand the basic architectural differences.

## 14.1 CockroachDB

```text
Application
    |
    v
SQL Layer
    |
    v
Distributed SQL Execution
    |
    v
Ranges
    |
    v
Raft Replication Groups
```

Key concepts:

- Distributed SQL execution.
- Data divided into ranges.
- Ranges replicated using Raft.
- Leaseholders coordinate certain reads and writes.
- Distributed transactions use transaction records and write intents.

## 14.2 TiDB

```text
Application
    |
    v
TiDB SQL Layer
    |
    v
TiKV Storage Layer
    |
    v
Raft Groups
    |
    v
Placement Driver (PD)
```

Key concepts:

- TiDB provides the SQL layer.
- TiKV provides distributed transactional key-value storage.
- TiKV uses Raft replication.
- PD manages cluster metadata and scheduling.
- Distributed transactions use a Percolator-inspired 2PC design.

## 14.3 YugabyteDB

```text
Application
    |
    v
YSQL / YCQL
    |
    v
Distributed Storage
    |
    v
Tablets
    |
    v
Raft Replication
```

Key concepts:

- YSQL provides PostgreSQL-compatible SQL functionality.
- Data is divided into tablets.
- Tablets are replicated using Raft.
- Distributed transaction coordination manages transactions across tablets.

## 14.4 Google Spanner

```text
Application
    |
    v
Spanner SQL Interface
    |
    v
Distributed Query Execution
    |
    v
Splits / Paxos Groups
    |
    v
Distributed Transaction Coordination
```

Key concepts:

- Data is divided into splits.
- Paxos-family consensus is used for replication groups.
- TrueTime provides a globally meaningful time API with uncertainty bounds.
- Distributed transactions use coordination across groups, including 2PC.

Spanner's architecture is not simply a Raft-based architecture.

---

# 15. Consensus vs Replication vs 2PC

This distinction is extremely important for interviews.

| Concept     | Main Problem Solved                           | Scope                   |
| ----------- | --------------------------------------------- | ----------------------- |
| Replication | Maintain multiple copies of data              | Data copies             |
| Consensus   | Agree on committed order/state among replicas | One consensus group     |
| 2PC         | Coordinate atomic commit across participants  | Distributed transaction |

## 15.1 Replication

Question:

How do we maintain copies of the same data on multiple nodes?

Answer:

Replication.

## 15.2 Consensus

Question:

How do multiple replicas agree on the committed sequence of operations?

Answer:

Consensus protocols such as Raft or Paxos.

## 15.3 Two-Phase Commit

Question:

How do multiple transaction participants commit or abort one transaction atomically?

Answer:

A distributed atomic commit protocol such as 2PC.

## 15.4 How They Work Together

```text
              Distributed Transaction
                        |
                        v
                Transaction Coordinator
                        |
                 Prepare / Commit
                        |
          +-------------+-------------+
          |                           |
          v                           v
     Partition A                 Partition B
          |                           |
          v                           v
     Replication Group          Replication Group
          |                           |
          v                           v
     Consensus Protocol         Consensus Protocol
          |                           |
          v                           v
      Replicated Data            Replicated Data
```

The transaction protocol coordinates the participants.

Each replication group maintains its own consistent replicated state.

The mechanisms complement each other; they are not interchangeable.

---

# 16. Common Misconceptions

### Misconception 1: Every replica must acknowledge a write.

Incorrect.

Majority-based consensus typically requires a quorum, not every replica.

With three voting replicas, two acknowledgements can be sufficient.

### Misconception 2: Replication and consensus are the same.

Incorrect.

Replication creates and maintains copies.

Consensus coordinates agreement on committed history among replicas.

Some replication mechanisms do not use consensus.

### Misconception 3: Raft is used by every NewSQL database.

Incorrect.

CockroachDB, TiKV, and YugabyteDB use Raft-based replication. Google Spanner uses Paxos-family consensus.

### Misconception 4: Raft and 2PC solve the same problem.

Incorrect.

Raft coordinates replicated state within a consensus group.

2PC coordinates an atomic transaction across multiple participants.

### Misconception 5: If a leader crashes, committed data is lost.

Incorrect.

Consensus protocols are designed to preserve committed history across leader changes, provided their safety assumptions hold.

### Misconception 6: A distributed database is always faster than a single-node database.

Incorrect.

Distributed systems introduce network communication, coordination, replication, and transaction overhead.

They provide scaling and availability capabilities, not automatic performance improvements for every workload.

### Misconception 7: More nodes always mean more write throughput.

Incorrect.

A hot partition, hot key, or heavily contended transaction can remain a bottleneck even with many nodes.

### Misconception 8: A YES vote in 2PC means the transaction committed.

Incorrect.

YES means the participant is prepared to commit. The final commit decision comes later.

### Misconception 9: A timeout means a transaction failed.

Incorrect.

A timeout means the caller did not receive a conclusive response in time. The transaction may have committed.

### Misconception 10: Every distributed SQL transaction uses serializable isolation.

Incorrect.

Isolation guarantees vary by product and configuration.

---

# 17. Interview Questions and Answers

## Beginner Level

### Q1. What is distributed SQL architecture?

It is an architecture in which SQL query processing, transaction coordination, and data storage are distributed across multiple nodes while providing relational database capabilities.

### Q2. What is a node?

A node is a participating database server instance in a distributed cluster.

### Q3. What is a partition?

A partition is a logical subset of the database's data.

### Q4. What is a replica?

A replica is a copy of a partition or another logical data unit maintained on a different node.

### Q5. What is leader-based replication?

It is a replication approach in which one replica coordinates writes and propagates operations to follower replicas.

### Q6. What is consensus?

Consensus is a protocol-based process through which distributed replicas agree on committed values or operation order.

### Q7. What is Raft?

Raft is a consensus algorithm that uses leader election and log replication to maintain a consistent replicated state.

### Q8. What is quorum?

Quorum is the minimum number of voting replicas needed for a consensus decision. In a majority-based group, it is more than half of the voting members.

## Intermediate Level

### Q9. What happens if a Raft leader crashes?

The remaining replicas can elect a new leader if they retain a majority quorum. The new leader must preserve committed history.

### Q10. Why is a quorum needed?

A quorum prevents isolated minority groups from independently committing conflicting histories and helps maintain safety during failures.

### Q11. What is the difference between synchronous and asynchronous replication?

Synchronous replication waits for the required replication acknowledgement before confirming a write. Asynchronous replication can acknowledge before all followers catch up.

### Q12. What is a distributed transaction?

A transaction involving multiple partitions, ranges, or nodes that must coordinate to preserve atomicity and the configured isolation guarantees.

### Q13. Why is distributed transaction coordination expensive?

It requires communication between participants, replication groups, and transaction coordination mechanisms. Network round trips increase latency.

### Q14. What is Two-Phase Commit?

2PC is a distributed atomic commit protocol with a prepare/voting phase followed by a commit/abort decision phase.

### Q15. Why can 2PC block?

If the coordinator fails after participants prepare but before they learn the final decision, participants may need to wait for recovery or decision discovery.

## Advanced Level

### Q16. What is the difference between Raft and 2PC?

Raft provides consensus within a replication group. 2PC coordinates atomic commit across multiple transaction participants.

### Q17. Can a three-replica Raft group continue if one replica fails?

Yes, assuming the remaining two replicas can communicate and satisfy the protocol's quorum requirements.

### Q18. Can a three-replica Raft group commit writes if two replicas fail?

No. One remaining voter cannot form a majority quorum.

### Q19. What happens during a network partition?

The side with a majority may continue committing writes. The minority side cannot safely commit majority-based writes independently.

### Q20. Does Raft require all replicas to apply a log entry before it is committed?

No. A majority acknowledgement is sufficient for the relevant commit condition. Applying a committed entry to the state machine is a separate step.

### Q21. What is the difference between a committed log entry and an applied log entry?

A committed entry is part of the agreed replicated history. An applied entry has been executed against the local state machine.

### Q22. How do distributed databases recover a failed replica?

They can replay missing log entries, install snapshots, or use other recovery procedures to bring the replica up to date.

### Q23. Why can cross-region transactions be slow?

They require network communication between geographically separated participants and may require quorum acknowledgements across regions.

### Q24. Is consensus enough to provide distributed transaction atomicity?

No. Consensus helps maintain replicated state. A transaction spanning multiple independent groups still requires a mechanism to coordinate its overall commit outcome.

---

# 18. Practical Exercises

## Exercise 1: Quorum Calculation

Calculate the majority quorum and maximum crash failures tolerated for these voting group sizes.

| Replicas | Quorum | Failures Tolerated |
| -------: | -----: | -----------------: |
|        3 |      2 |                  1 |
|        5 |      3 |                  2 |
|        7 |      4 |                  3 |
|        9 |      5 |                  4 |

Formula:

\[
Quorum = \left\lfloor \frac{N}{2} \right\rfloor + 1
\]

These failure counts assume majority-based consensus with voting replicas and crash failures.

## Exercise 2: Leader Failure

A database has three replicas:

```text
Node A = Leader
Node B = Follower
Node C = Follower
```

Questions:

1. What happens if Node A crashes?
2. Can B and C elect a new leader?
3. Can the system continue accepting writes?
4. What happens if both B and C crash?

Expected reasoning:

- B and C retain a majority of two and can potentially elect a leader.
- One surviving replica cannot form a majority of three.
- The group cannot safely commit new majority-based writes without quorum.

## Exercise 3: Understand 2PC

A transaction involves three participants.

```text
Participant A -> YES
Participant B -> YES
Participant C -> NO
```

Questions:

1. Should the transaction commit?
2. What should the coordinator decide?
3. What should A and B do?
4. Why must a YES participant wait for the final decision?

Expected result:

The transaction must abort because not all participants voted YES.

## Exercise 4: Identify Distributed Transactions

Consider these operations:

```text
Operation A:
Update customer profile.

Operation B:
Update order and payment records in different partitions.

Operation C:
Update inventory across three warehouses.

Operation D:
Read one product record from one partition.
```

Classify which operations may require distributed transaction coordination.

Think about where the data is located, not merely how many SQL statements are executed.

## Exercise 5: Backend Architecture

Design a distributed SQL architecture for an e-commerce application with:

- 10 million customers.
- 50 million orders.
- 3 database nodes.
- Replication factor 3.
- Distributed order and payment transactions.

Identify:

1. Partitioning strategy.
2. Replica placement.
3. Query routing.
4. Leader election.
5. Transaction coordination.
6. Recovery strategy.
7. Handling duplicate payment requests.

The goal is to understand the responsibilities of each layer, not to produce one universally correct production design.

---

# 19. Final Summary

NewSQL databases distribute relational data and query execution across multiple nodes while maintaining transactional guarantees.

The main concepts covered in this chapter:

| Concept                      | Key Idea                                        |
| ---------------------------- | ----------------------------------------------- |
| Distributed SQL architecture | SQL processing and storage operate across nodes |
| Node                         | Database server instance                        |
| Partition                    | Logical subset of data                          |
| Range                        | Contiguous key interval in certain systems      |
| Replica                      | Copy of a partition or range                    |
| Replication                  | Maintaining multiple data copies                |
| Leader-based replication     | One replica coordinates writes                  |
| Consensus                    | Agreement on committed replicated history       |
| Quorum                       | Required majority of voting replicas            |
| Raft                         | Leader-based consensus algorithm                |
| Distributed transaction      | Transaction spanning multiple participants      |
| 2PC                          | Coordinates atomic commit across participants   |
| Transaction coordinator      | Manages distributed transaction progress        |
| Recovery                     | Restores consistent operation after failures    |

## The Three Most Important Distinctions

1. **Replication:** Maintain multiple copies of data.
2. **Consensus:** Agree on the committed order of operations within a replication group.
3. **2PC:** Coordinate whether multiple transaction participants commit or abort together.

Do not confuse these three mechanisms. Understanding their separation is essential to understanding distributed SQL architecture.

## What You Should Be Able to Explain

After this chapter, you should be able to explain:

- How a SQL query reaches distributed storage.
- How nodes, partitions, ranges, and replicas differ.
- How leader-based replication works.
- Why consensus is needed.
- How Raft elects leaders and replicates logs.
- How quorum works.
- Why distributed transactions require coordination.
- How 2PC works and why it can block.
- How a distributed database handles node and network failures.
- Why distributed transactions introduce latency.
