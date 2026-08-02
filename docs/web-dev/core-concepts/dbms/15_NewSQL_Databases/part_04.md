---
sidebar_label: Part 18D — NewSQL Databases: Tradeoffs, Limitations & When to Use
sidebar_position: 1
---

# Part 18D — NewSQL Databases: Tradeoffs, Limitations & When to Use

# 1. Introduction

**Should we actually use a NewSQL database in our application?**

NewSQL databases solve important problems, but they also introduce new costs and complexities.

A distributed database is not automatically better than PostgreSQL or MySQL simply because it can scale horizontally.

The correct choice depends on your workload, consistency requirements, traffic, infrastructure, team expertise, and operational constraints.

This chapter covers:

1. Advantages of NewSQL.
2. Distributed transaction overhead.
3. Network latency.
4. Cross-region performance.
5. Operational complexity.
6. Horizontal scaling limitations.
7. Hotspots and data locality.
8. NewSQL vs traditional SQL.
9. NewSQL vs NoSQL.
10. When NewSQL is worth using and when it is not.

---

# 2. Advantages of NewSQL Databases

NewSQL databases combine relational database capabilities with distributed architecture.

Let's examine their major advantages.

## 2.1 Horizontal Scalability

Traditional relational databases commonly begin with a single primary database server.

As traffic increases, we can upgrade the server:

- More CPU.
- More RAM.
- Faster storage.
- Better networking.

This is vertical scaling.

However, hardware upgrades have practical limits.

NewSQL databases distribute data and processing across multiple nodes.

Example:

```text
Traditional SQL:

        Application
             |
             v
       PostgreSQL
        Server A


Distributed SQL:

        Application
             |
             v
      Distributed SQL
             |
       +-----+-----+
       |     |     |
       v     v     v
     Node A Node B Node C
```

Adding nodes can increase the cluster's available storage and processing capacity.

For example:

| Configuration    | Nodes | Available Resources     |
| ---------------- | ----: | ----------------------- |
| Initial          |     3 | Resources from 3 nodes  |
| Expanded         |     5 | Resources from 5 nodes  |
| Further expanded |    10 | Resources from 10 nodes |

This does not mean performance increases linearly with every added node.

The actual improvement depends on:

- Data distribution.
- Query patterns.
- Partitioning strategy.
- Network bandwidth.
- Replication overhead.
- Transaction coordination.
- Hotspots.

**Key advantage:** NewSQL provides a way to scale relational workloads horizontally without requiring the application to manage every shard manually.

## 2.2 ACID Transactions

Traditional relational databases are known for ACID transactions.

NewSQL aims to preserve these guarantees while distributing data.

Consider a bank transfer:

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

The required business outcome is:

- Both updates commit.
- Or neither update commits.

This requirement becomes more complicated when the accounts are stored on different nodes.

NewSQL databases provide distributed transaction mechanisms to coordinate these operations.

This is useful for:

- Payment processing.
- Banking.
- Inventory management.
- Order processing.
- Financial applications.
- Systems with multiple related records.

However, distributed ACID transactions introduce communication and coordination overhead. We will examine that shortly.

## 2.3 Strong Consistency

Distributed databases maintain multiple copies of data.

This creates a consistency challenge.

Suppose:

```text
Account Balance = ₹10,000
```

The data is replicated:

```text
Node A: ₹10,000
Node B: ₹10,000
Node C: ₹10,000
```

A client withdraws ₹2,000.

The expected result is:

```text
Node A: ₹8,000
Node B: ₹8,000
Node C: ₹8,000
```

The database must ensure that acknowledged writes and subsequent reads follow its documented consistency guarantees.

NewSQL databases commonly use consensus-based replication for strongly consistent writes.

For example:

- CockroachDB uses Raft.
- TiKV uses Raft.
- YugabyteDB uses Raft.
- Google Spanner uses Paxos-family replication.

Strong consistency does not mean every replica is always immediately available.

If a replication group loses its quorum, it may have to reject writes or certain strongly consistent reads until quorum is restored.

## 2.4 High Availability and Fault Tolerance

NewSQL databases replicate data across multiple nodes.

Suppose a partition has three voting replicas:

```text
Partition 1

Node A: Replica 1
Node B: Replica 2
Node C: Replica 3
```

If Node A crashes, the remaining replicas may continue operating.

For a majority-based group:

```text
Total voting replicas = 3
Required quorum = 2
```

Two available replicas can still form a quorum.

The system may elect a new leader and continue processing requests.

This provides fault tolerance against certain node failures.

However:

- Losing a quorum makes the affected group unavailable for operations requiring quorum.
- Replication is not a substitute for backups.
- A replicated logical deletion can affect every replica.
- Geographic failures require appropriate replica placement.

## 2.5 Automatic Data Distribution

Traditional relational databases often require external tooling or application-level logic for sharding.

NewSQL databases generally manage data distribution internally.

For example:

```text
Database
   |
   +---- Partition A
   |
   +---- Partition B
   |
   +---- Partition C
```

The database tracks where partitions live and can move them when the cluster changes.

Depending on the product, it can:

- Split large ranges.
- Move replicas.
- Rebalance data.
- Distribute workload.
- Recover failed replicas.

This reduces the amount of manual sharding logic an application needs to maintain.

## 2.6 Familiar SQL Interface

NewSQL databases provide relational SQL interfaces.

For example:

```sql
SELECT
    customer_id,
    COUNT(*) AS total_orders
FROM orders
GROUP BY customer_id;
```

Developers can work with familiar concepts:

- Tables.
- Rows.
- Columns.
- Primary keys.
- Foreign keys.
- Indexes.
- Joins.
- Transactions.
- SQL queries.

This is useful for applications that already use relational data modeling.

However, SQL compatibility is not identical across all NewSQL products.

PostgreSQL-compatible and MySQL-compatible interfaces may differ in supported features and behavior.

## 2.7 Reduced Application-Level Sharding Complexity

Without a distributed SQL database, an application may need to implement sharding itself.

Example:

```javascript
function getDatabaseForUser(userId) {
  const shardNumber = userId % 4;

  return databaseConnections[shardNumber];
}
```

The application now needs to understand:

- Which shard contains the data.
- How to route queries.
- How to handle shard failures.
- How to execute cross-shard transactions.
- How to migrate data between shards.

With NewSQL, much of this responsibility is handled by the database.

The application can usually continue using a SQL connection and a relational model.

This does not eliminate all distributed-system complexity. It moves much of the complexity into the database platform.

## 2.8 Summary of Advantages

| Advantage               | What It Provides                            |
| ----------------------- | ------------------------------------------- |
| Horizontal scaling      | Distribute data and processing across nodes |
| ACID transactions       | Atomic operations across distributed data   |
| Strong consistency      | Coordinated replicated state                |
| High availability       | Continue operating through certain failures |
| Automatic distribution  | Database-managed partition placement        |
| SQL interface           | Familiar relational development model       |
| Reduced manual sharding | Less application-level routing logic        |

---

# 3. Distributed Transaction Overhead

One of the biggest tradeoffs of NewSQL is distributed transaction overhead.

A local transaction is generally simpler than a transaction spanning multiple partitions.

## 3.1 Local Transaction

Suppose both accounts are stored in the same partition:

```text
Partition A
    |
    +---- Account 101
    |
    +---- Account 202
```

A transfer can execute within one transaction participant.

The database still needs to manage concurrency, logging, and replication, but it does not need to coordinate a second independent partition.

## 3.2 Distributed Transaction

Now suppose:

```text
Partition A:
Account 101

Partition B:
Account 202
```

The transaction must update two different participants.

```text
                 Application
                      |
                      v
             Transaction Coordinator
                      |
              +-------+-------+
              |               |
              v               v
         Partition A      Partition B
              |               |
              v               v
          Replica Group   Replica Group
```

The database must coordinate both participants.

Depending on the implementation, this may involve:

1. Reading data from multiple partitions.
2. Creating write intents.
3. Checking conflicts.
4. Replicating transaction-related state.
5. Preparing participants.
6. Recording the commit decision.
7. Resolving or applying the writes.

Each additional communication step introduces overhead.

## 3.3 Why Does Distributed Coordination Cost More?

Consider a simplified local transaction:

```text
Application
    |
    v
Database
    |
    v
Transaction
    |
    v
Commit
```

Now compare it with a distributed transaction:

```text
Application
    |
    v
SQL Gateway
    |
    v
Transaction Coordinator
    |
    +----------+
    |          |
    v          v
Partition A  Partition B
    |          |
    v          v
Replication Replication
    |          |
    +-----+----+
          |
          v
    Commit Decision
```

The distributed transaction involves additional components and communication.

This increases:

- Network traffic.
- Transaction duration.
- Lock or intent lifetime.
- CPU utilization.
- Retry opportunities.
- Failure-handling complexity.

## 3.4 Example: E-Commerce Order

Suppose an order operation requires:

1. Creating an order.
2. Deducting inventory.
3. Recording payment details.
4. Updating customer purchase history.

These records may belong to different partitions.

A single transaction may need to coordinate multiple participants.

If the transaction touches five partitions instead of one, the coordination workload can increase.

This is why transaction boundaries and data distribution should be considered together.

## 3.5 How to Reduce Distributed Transaction Overhead

### Strategy 1: Keep Related Data Together

If two records are frequently updated together, consider whether they can be colocated.

Example:

```text
Customer Partition
    |
    +---- Customer Details
    |
    +---- Customer Orders
```

This may reduce cross-partition operations.

However, colocating everything under one customer can create large or heavily loaded partitions.

There is no universal rule to embed or colocate every related record.

### Strategy 2: Design Partition Keys Carefully

A good partition key distributes traffic while keeping common operations reasonably local.

Example:

```text
customer_id
```

may be useful when most operations are customer-centric.

But it may not be suitable if one customer generates an extreme amount of traffic.

### Strategy 3: Avoid Unnecessary Multi-Partition Transactions

Do not include unrelated operations in one large transaction merely because the database supports distributed transactions.

For example:

```text
Create order
Update inventory
Send marketing event
Update analytics dashboard
```

These operations do not necessarily need to be part of one database transaction.

External messaging and analytics can often be handled through asynchronous workflows, an outbox pattern, or other consistency mechanisms.

### Strategy 4: Keep Transactions Short

Long-running transactions can hold locks or intents for longer periods.

They can increase:

- Contention.
- Transaction conflicts.
- Resource usage.
- Retry frequency.

Keep transactional work focused.

## 3.6 Important Tradeoff

NewSQL makes distributed transactions possible, but it does not make them free.

**The more partitions a transaction touches, the more coordination it may require.**

---

# 4. Network Latency

Network latency is one of the fundamental costs of distributed database architecture.

A single-node database can perform many operations without sending requests to other machines.

A distributed database must communicate between nodes.

## 4.1 Local Database Operation

Consider:

```text
Application
    |
    v
Database Server
    |
    v
Storage Engine
```

A query may involve:

- CPU execution.
- Memory access.
- Disk access.

There is no need to communicate with another database node for every operation.

## 4.2 Distributed Database Operation

Now consider:

```text
Application
    |
    v
Node A
    |
    v
Node B
    |
    v
Node C
```

A strongly consistent write may require:

1. Sending a request to the leader.
2. Sending replicated log entries to followers.
3. Receiving quorum acknowledgements.
4. Committing and applying the operation.
5. Returning a response to the client.

Every network round trip contributes to latency.

## 4.3 Latency Accumulation

Suppose a transaction requires:

| Operation                | Illustrative Time |
| ------------------------ | ----------------: |
| Application to database  |              2 ms |
| Query processing         |              1 ms |
| Replication round trip   |              4 ms |
| Distributed coordination |              5 ms |
| Final response           |              2 ms |

Total:

\[
2 + 1 + 4 + 5 + 2 = 14\text{ ms}
\]

These numbers are hypothetical and are only meant to demonstrate how multiple communication steps contribute to latency.

Actual latency depends on hardware, network topology, database implementation, replication placement, and workload.

## 4.4 Why More Nodes Can Increase Latency

Adding nodes increases available resources, but it can also introduce additional communication.

For example:

```text
Single Node:

Application -> Database


Distributed:

Application
    |
    v
SQL Node
    |
    +---- Storage Node A
    |
    +---- Storage Node B
    |
    +---- Storage Node C
```

A query that needs data from all three storage nodes may take longer than a query executed locally.

This does not mean distributed queries are always slower. Parallel execution can improve total query time for sufficiently large workloads.

The important distinction is:

- Parallelism can reduce execution time.
- Network coordination can increase execution time.

Both effects exist.

## 4.5 Ways to Reduce Network Latency

1. Keep frequently accessed data close together.
2. Place replicas near application traffic where appropriate.
3. Avoid unnecessary cross-partition transactions.
4. Reduce unnecessary network round trips.
5. Use efficient query plans.
6. Avoid fetching unnecessary rows or columns.
7. Use connection pooling appropriately.
8. Understand the database's read-consistency options.

---

# 5. Cross-Region Performance

Distributed SQL databases can replicate data across geographic regions.

This is useful for global applications, but it introduces another challenge: geographic distance.

## 5.1 Example Global Architecture

Suppose an application serves users in three regions:

```text
             Global Application
                     |
          +----------+----------+
          |          |          |
          v          v          v
         USA       Europe      Asia
          |          |          |
          v          v          v
       Database   Database   Database
        Node A     Node B     Node C
```

The database may distribute replicas across these regions.

This can improve fault tolerance and support regional traffic.

However, network communication between regions is slower than communication within one data center.

## 5.2 Geographic Distance and Latency

Consider:

```text
India -> Singapore
India -> Europe
India -> USA
```

A write that requires acknowledgement from a geographically distant quorum may take substantially longer than a write using nearby replicas.

The actual latency depends on routing, network conditions, and replica placement.

## 5.3 Quorum Placement

Suppose a replication group has three voting replicas:

```text
Replica A -> USA
Replica B -> Europe
Replica C -> Asia
```

A write requires a majority.

The leader sends the operation to the other replicas.

The commit latency depends on obtaining the required quorum acknowledgements.

With three replicas, the leader and one follower may be enough, but which follower responds first matters.

The database's placement policy and leader location can therefore affect write latency.

## 5.4 Locality vs Strong Consistency

There is an important tradeoff.

Suppose an application wants:

- Local reads.
- Local writes.
- Strong consistency.
- High availability across regions.

Achieving all of these simultaneously at low latency is difficult.

A strongly consistent write may need to communicate with replicas outside the local region.

A local read from a follower may be stale unless the database has a safe follower-read mechanism.

Some databases support timestamp-based follower reads or other mechanisms to provide defined consistency guarantees without routing every read to a leader.

## 5.5 Read Locality

A distributed database may place replicas close to users.

Example:

```text
USA Users -> USA Replica
Europe Users -> Europe Replica
Asia Users -> Asia Replica
```

This can improve read performance when the selected read mode permits local replica reads.

However, read locality does not automatically make writes local.

Strongly consistent writes may still require quorum communication.

## 5.6 Regional Failure

Suppose the Europe region becomes unavailable.

```text
USA       Europe       Asia
 A          DOWN         C
```

If the replication group still has a valid quorum, it may continue operating.

If it loses quorum, it cannot safely commit new writes.

Therefore, replica placement must account for:

- Regional failure scenarios.
- Number of voting replicas.
- Network connectivity.
- Quorum requirements.
- Recovery objectives.

## 5.7 When Is Cross-Region Deployment Worth It?

Consider it when:

- Users are geographically distributed.
- Regional disaster recovery is important.
- Data must remain available during certain regional failures.
- The application has appropriate latency tolerance.
- Strong consistency requirements justify the cost.

Do not deploy a globally distributed database simply because the application has users in multiple countries.

A single-region deployment with backups, replicas, and disaster recovery may be sufficient for many applications.

---

# 6. Operational Complexity

NewSQL reduces application-managed sharding complexity, but the database itself is more complex to operate than a simple single-node relational database.

A distributed database is a distributed system.

That means it introduces additional operational responsibilities.

## 6.1 Traditional SQL Operations

A typical PostgreSQL deployment may involve:

```text
Application
    |
    v
PostgreSQL
    |
    v
Storage
```

Operational responsibilities include:

- Database configuration.
- Backups.
- Monitoring.
- Index maintenance.
- Replication.
- Failover.
- Capacity planning.
- Performance tuning.

These responsibilities can already be substantial.

## 6.2 NewSQL Operations

A distributed SQL deployment may look like:

```text
                Application
                     |
                     v
               SQL Gateway
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
          |          |          |
          v          v          v
        Storage   Storage    Storage
          |          |          |
          +----------+----------+
                     |
               Replication
                     |
               Consensus
                     |
              Transaction Layer
```

Now the operational team must also understand:

- Cluster membership.
- Replica placement.
- Quorum availability.
- Leader election.
- Network partitions.
- Range or tablet balancing.
- Distributed transaction failures.
- Clock synchronization requirements where applicable.
- Cross-region latency.
- Replica lag.
- Storage and compute balancing.

## 6.3 More Components

Some NewSQL databases have multiple architectural components.

For example, TiDB includes:

```text
TiDB
TiKV
PD
TiFlash
```

Each component has its own operational requirements.

YugabyteDB includes:

```text
YB-Master
YB-TServer
DocDB
```

CockroachDB and Spanner have their own distributed infrastructure and management mechanisms.

More components mean more things to monitor and troubleshoot.

## 6.4 Monitoring Requirements

A distributed SQL deployment should monitor more than CPU and memory.

Important metrics include:

| Metric                    | Why It Matters                                 |
| ------------------------- | ---------------------------------------------- |
| CPU utilization           | Detect processing bottlenecks                  |
| Memory usage              | Detect memory pressure                         |
| Disk utilization          | Prevent storage exhaustion                     |
| Disk IOPS and latency     | Identify storage bottlenecks                   |
| Network throughput        | Detect communication saturation                |
| Network latency           | Understand distributed operation costs         |
| Replication lag           | Detect delayed replicas                        |
| Raft quorum health        | Detect replication group availability problems |
| Leader distribution       | Detect uneven workload                         |
| Transaction retries       | Detect contention or serialization conflicts   |
| Range/tablet distribution | Detect imbalance                               |
| Hot keys                  | Detect workload concentration                  |

## 6.5 Troubleshooting Is Harder

Consider an application request that takes 5 seconds.

In a traditional database, you might inspect:

- Query execution plan.
- Index usage.
- Locks.
- Disk latency.
- CPU utilization.

In a distributed database, you may additionally need to investigate:

- Which node received the query?
- Which partitions were involved?
- Which replicas were contacted?
- Was a quorum slow?
- Did the query cross regions?
- Was a transaction retried?
- Was the relevant range overloaded?
- Was the leader overloaded?

The problem may not be in the SQL query alone.

## 6.6 Operational Skill Requirements

A production distributed SQL deployment benefits from engineers who understand:

- Database internals.
- Distributed systems.
- Networking.
- Monitoring.
- Capacity planning.
- Failure recovery.
- Transaction semantics.
- Query optimization.

The database may automate many tasks, but automation does not eliminate the need for operational understanding.

**Key takeaway:** NewSQL reduces some application-level complexity while introducing database-cluster complexity.

---

# 7. Horizontal Scaling Limitations

NewSQL supports horizontal scaling, but horizontal scaling has limits.

Adding nodes does not guarantee that every workload will scale linearly.

## 7.1 The Linear Scaling Assumption

Suppose one database node handles:

```text
10,000 requests/second
```

A naive assumption would be:

| Nodes | Expected Throughput |
| ----: | ------------------: |
|     1 |              10,000 |
|     2 |              20,000 |
|     4 |              40,000 |
|     8 |              80,000 |

Real distributed systems rarely behave this perfectly.

Why?

Because some work cannot be divided efficiently.

## 7.2 Coordination Overhead

As nodes increase, the system may require more:

- Network communication.
- Replication traffic.
- Metadata management.
- Transaction coordination.
- Rebalancing.
- Failure detection.

Some workloads benefit greatly from more nodes.

Others are limited by coordination or contention.

## 7.3 Amdahl's Law

Amdahl's Law explains why parallelizing only part of a workload cannot produce unlimited speedup.

Suppose:

- 80% of the workload can be parallelized.
- 20% must remain sequential.

The theoretical speedup is:

\[
Speedup = \frac{1}{(1-P)+\frac{P}{N}}
\]

Where:

- \(P\) = parallelizable portion.
- \(N\) = number of processing units.

For this example:

\[
P = 0.8
\]

With 4 processing units:

\[
Speedup = \frac{1}{0.2+\frac{0.8}{4}}
\]

\[
Speedup = \frac{1}{0.4}=2.5
\]

Even with four processing units, the speedup is 2.5 times rather than 4 times.

With a very large number of processing units, the maximum speedup approaches:

\[
Speedup\_{\max}=\frac{1}{1-P}
\]

For 80% parallelizable work:

\[
Speedup\_{\max}=5
\]

This is a simplified theoretical model, but it explains why adding more nodes eventually provides diminishing returns.

## 7.4 Bottlenecks That Limit Scaling

| Bottleneck               | Effect                                           |
| ------------------------ | ------------------------------------------------ |
| Hot partition            | One partition receives too much traffic          |
| Hot key                  | One key becomes heavily contended                |
| Network                  | Nodes spend too much time communicating          |
| Transaction coordination | Multi-partition transactions become expensive    |
| Storage                  | Disk throughput becomes limiting                 |
| CPU                      | Query processing becomes limiting                |
| Lock contention          | Concurrent transactions block or retry           |
| Metadata bottleneck      | Cluster-management operations become constrained |

## 7.5 Scaling Is Workload-Dependent

Consider two applications.

### Application A: Independent Event Processing

```text
Event 1 -> Partition A
Event 2 -> Partition B
Event 3 -> Partition C
Event 4 -> Partition D
```

Requests are distributed across partitions.

This workload may scale well horizontally.

### Application B: One Highly Contended Account

```text
100,000 requests
       |
       v
Account ID 101
       |
       v
One logical record
```

Even if the database has 100 nodes, the same account may remain a contention hotspot.

Adding nodes does not remove the underlying serialization requirement for conflicting updates to one record.

---

# 8. Hotspots and Data Locality

Hotspots are a major challenge in distributed databases.

## 8.1 What Is a Hotspot?

A hotspot occurs when one partition, range, tablet, or key receives a disproportionate amount of traffic.

Example:

```text
Partition A -> 80% of requests
Partition B -> 10% of requests
Partition C -> 10% of requests
```

The cluster may have many nodes, but Partition A becomes the bottleneck.

## 8.2 Hot Key Example

Suppose an application runs a promotion:

```text
Campaign ID = 5001
```

Millions of users participate in the same campaign.

The database stores campaign participation data using:

```text
campaign_id
```

as the partition key.

All writes may concentrate around the same key range.

```text
Millions of Requests
        |
        v
Campaign 5001
        |
        v
One Hot Partition
```

This can overload a single range or tablet.

## 8.3 Sequential Key Problem

Suppose the primary key is an increasing integer:

```text
1
2
3
4
5
...
```

If the database distributes records by key range, new inserts may concentrate near the end of the key space.

Conceptually:

```text
Range A: 1–1000
Range B: 1001–2000
Range C: 2001–3000

New inserts:
3001
3002
3003
3004
```

The newest range may receive most of the write traffic.

Some databases have mechanisms to split or rebalance ranges, but these mechanisms do not automatically eliminate every hotspot.

## 8.4 Data Locality

Data locality means placing data close to the operations that frequently access it.

Suppose a customer frequently accesses their orders.

A customer-centric key structure can make related records easier to colocate.

```text
Customer 101
    |
    +---- Order 1
    +---- Order 2
    +---- Order 3
```

This can reduce cross-partition operations.

However, if one customer generates millions of writes, that customer can become a hotspot.

Good locality requires balancing two goals:

1. Keep related operations close together.
2. Distribute workload across partitions.

These goals can conflict.

## 8.5 Strategies for Handling Hotspots

### Strategy 1: Choose Better Partition Keys

A partition key should distribute data and traffic appropriately.

Do not select a key based only on its uniqueness.

Consider:

- Cardinality.
- Distribution.
- Access patterns.
- Write frequency.
- Query patterns.
- Contention.

### Strategy 2: Add a Distribution Component

A high-volume campaign might distribute writes using a bucket:

```text
campaign_id + bucket_id
```

For example:

```text
Campaign 5001, Bucket 0
Campaign 5001, Bucket 1
Campaign 5001, Bucket 2
Campaign 5001, Bucket 3
```

Writes can be distributed across buckets.

However, aggregation now needs to combine data from multiple buckets.

This is a tradeoff, not a free improvement.

### Strategy 3: Pre-Split Data

Some systems allow operators to split key ranges ahead of expected traffic.

This can reduce the risk of a single initial range becoming overloaded.

### Strategy 4: Cache Read-Heavy Data

Frequently read product or campaign information may be cached.

This reduces pressure on the database.

However, cache invalidation and consistency must be handled correctly.

### Strategy 5: Redesign the Access Pattern

Sometimes the real solution is to change how data is modeled or updated.

For example, instead of updating one global counter for every user action, maintain multiple distributed counters and aggregate them when needed.

This reduces contention but introduces aggregation complexity.

---

# 9. NewSQL vs Traditional SQL

Now compare NewSQL with traditional relational databases.

For this comparison, assume a conventional deployment such as a single primary PostgreSQL or MySQL server, possibly with read replicas.

## 9.1 Architecture

### Traditional SQL

```text
Application
    |
    v
Primary Database
    |
    v
Storage
```

### NewSQL

```text
Application
    |
    v
Distributed SQL Cluster
    |
    +---------+---------+
    |         |         |
    v         v         v
  Node A    Node B    Node C
    |         |         |
    +---------+---------+
         Replication
         and Consensus
```

## 9.2 Comparison Table

| Feature                  | Traditional SQL                                      | NewSQL                                     |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------ |
| Data model               | Relational                                           | Relational                                 |
| Query language           | SQL                                                  | SQL                                        |
| ACID transactions        | Yes                                                  | Yes                                        |
| Horizontal scaling       | Usually requires additional architecture or sharding | Built into distributed architecture        |
| Vertical scaling         | Yes                                                  | Yes, depending on deployment               |
| Replication              | Supported                                            | Built into distributed design              |
| Distributed transactions | Depends on architecture and extensions               | Core capability in distributed SQL systems |
| Operational complexity   | Lower for simple deployments                         | Generally higher                           |
| Network coordination     | Less for local transactions                          | Often more                                 |
| Data placement           | Often managed at instance or application level       | Managed by distributed database            |
| Fault tolerance          | Depends on replication and failover setup            | Built into distributed replication design  |
| Best fit                 | Many conventional transactional applications         | Large distributed relational workloads     |

## 9.3 Does Traditional SQL Mean It Cannot Scale Horizontally?

No.

This is a common misconception.

Traditional relational databases can scale through:

- Read replicas.
- Table partitioning.
- Sharding.
- Distributed database extensions.
- Application-level routing.
- Specialized clustering architectures.

For example, PostgreSQL can use:

- Streaming replication.
- Logical replication.
- Declarative partitioning.
- External sharding solutions.

The distinction is that conventional PostgreSQL does not provide native automatic distributed sharding and transparent distributed SQL transactions as a standard built-in cluster architecture.

NewSQL is designed around distributed execution and storage from the beginning.

## 9.4 When Traditional SQL Is Better

Traditional SQL may be preferable when:

- The database fits comfortably on one server.
- Vertical scaling is sufficient.
- Transactions are mostly local.
- The workload does not require global distribution.
- The team has strong PostgreSQL or MySQL expertise.
- Operational simplicity is important.
- The cost of a distributed cluster is unjustified.

A well-tuned PostgreSQL database can handle substantial workloads.

Do not replace a working relational database simply because a distributed alternative exists.

---

# 10. NewSQL vs NoSQL

NewSQL and NoSQL solve different architectural problems, although their capabilities can overlap.

## 10.1 Basic Difference

NewSQL aims to provide:

- Relational data model.
- SQL.
- ACID transactions.
- Distributed scalability.

NoSQL is a broad category containing multiple data models:

- Key-value.
- Document.
- Wide-column.
- Graph.

Many NoSQL databases prioritize flexible data models, particular access patterns, or large-scale distributed operation.

Some also support strong consistency and ACID transactions.

Therefore, it is incorrect to say that NoSQL databases do not support transactions or consistency.

## 10.2 Architecture Comparison

| Feature            | NewSQL                                        | NoSQL                                      |
| ------------------ | --------------------------------------------- | ------------------------------------------ |
| Data model         | Relational                                    | Varies by database                         |
| Query interface    | SQL                                           | Varies                                     |
| Schema             | Relational schema                             | Flexible or model-specific                 |
| Transactions       | Distributed ACID transactions in many systems | Depends on database                        |
| Horizontal scaling | Core design goal                              | Common design goal                         |
| Joins              | Relational joins                              | Varies; often less central                 |
| Data access        | Relational queries                            | Often access-pattern-oriented              |
| Examples           | Spanner, CockroachDB, TiDB, YugabyteDB        | MongoDB, Cassandra, Redis, DynamoDB, Neo4j |

## 10.3 Example: E-Commerce Application

Suppose we have:

```text
Customers
Orders
Payments
Products
Inventory
```

### NewSQL Approach

Use relational tables:

```sql
SELECT
    c.customer_id,
    c.name,
    o.order_id,
    o.total_amount
FROM customers c
JOIN orders o
    ON c.customer_id = o.customer_id;
```

The database can distribute the relational data and execute SQL queries across nodes.

### Document Database Approach

A MongoDB document might look like:

```javascript
{
  _id: 101,
  name: "Customer A",
  orders: [
    {
      orderId: 5001,
      totalAmount: 2500
    },
    {
      orderId: 5002,
      totalAmount: 1500
    }
  ]
}
```

This can be useful when the application frequently reads the customer and related order summary together.

However, large or frequently changing arrays may be better modeled separately.

### Key-Value Approach

A Redis key might be:

```text
customer:101:cart
```

Value:

```json
{
  "items": [
    {
      "productId": 501,
      "quantity": 2
    }
  ]
}
```

This is suitable for fast access to a known key, but Redis is not a replacement for every relational workload.

## 10.4 Choosing Between Them

| Requirement                                    | Potential Choice     |
| ---------------------------------------------- | -------------------- |
| Complex relational queries and distributed SQL | NewSQL               |
| Flexible document structures                   | Document database    |
| Extremely fast key-based access                | Key-value database   |
| Large write-heavy time-series workloads        | Time-series database |
| Wide-column access patterns                    | Wide-column database |
| Relationship traversal                         | Graph database       |
| Full-text search                               | Search database      |

The right choice depends on the access patterns and consistency requirements.

---

# 11. When Should You Use NewSQL?

NewSQL is worth considering when the application has specific requirements that justify a distributed relational database.

## 11.1 Large Transactional Workloads

Example:

```text
Millions of orders
Millions of payments
Large inventory operations
High concurrent traffic
```

If a conventional database cannot scale sufficiently through tuning, vertical scaling, and conventional replication, distributed SQL may be worth evaluating.

## 11.2 Strong Consistency Across Distributed Data

Consider a financial platform.

It needs:

- Multiple related updates.
- ACID transactions.
- Strong consistency.
- High availability.
- Data distribution.

A distributed SQL database may be suitable.

## 11.3 Multi-Region Applications

Suppose the application operates in:

- India.
- Europe.
- North America.
- Southeast Asia.

The application may require regional distribution and fault tolerance.

A distributed SQL system can help maintain a relational data model across regions.

However, cross-region write latency and placement design must be evaluated carefully.

## 11.4 Applications That Need SQL and Horizontal Scaling

Suppose the engineering team already uses PostgreSQL or MySQL.

The team wants to scale horizontally without implementing every sharding mechanism in application code.

NewSQL may be a reasonable option.

## 11.5 When to Consider It

| Requirement                      | Why NewSQL May Fit                    |
| -------------------------------- | ------------------------------------- |
| Large relational workload        | Distributed storage and execution     |
| Strong transactional consistency | Distributed transaction support       |
| Multiple regions                 | Geographic replica placement          |
| High availability                | Replication and consensus             |
| Horizontal scaling               | Automatic data distribution           |
| SQL compatibility                | Existing relational application model |

---

# 12. When Should You NOT Use NewSQL?

This section is more important than memorizing its advantages.

Many engineering teams adopt complex infrastructure before they actually need it.

That is an expensive mistake.

## 12.1 Small or Medium Applications

Suppose you are building:

- A company website.
- An admin dashboard.
- A CRM.
- A small SaaS application.
- A campaign management platform.

A conventional PostgreSQL or MySQL database may be sufficient.

You probably do not need a distributed SQL cluster with multiple nodes and consensus groups.

## 12.2 When Vertical Scaling Is Sufficient

Suppose:

```text
Current PostgreSQL Server:

CPU Usage: 30%
RAM Usage: 40%
Disk Usage: 35%
```

The database is not close to its resource limits.

Introducing distributed SQL may add complexity without solving an actual problem.

Measure before migrating.

## 12.3 When Transactions Are Mostly Local

If most operations involve a small number of records stored together, a traditional relational database may be simpler and faster.

NewSQL's distributed transaction capabilities are useful, but unnecessary coordination can become an overhead.

## 12.4 When the Team Lacks Operational Expertise

Distributed databases require understanding:

- Consensus.
- Quorum.
- Replication.
- Network partitions.
- Distributed transactions.
- Failure recovery.
- Cluster monitoring.

If the team cannot operate the system reliably, the theoretical advantages may not justify the risk.

Managed services can reduce operational burden, but they do not eliminate the need to understand transaction behavior, performance, and failure semantics.

## 12.5 When the Workload Is Better Suited to Another Database

Examples:

| Workload                        | Potentially Better Fit           |
| ------------------------------- | -------------------------------- |
| Simple caching                  | Redis                            |
| Flexible nested documents       | MongoDB                          |
| Large write-heavy event streams | Kafka plus suitable storage      |
| Search and relevance ranking    | Elasticsearch or OpenSearch      |
| Graph traversal                 | Neo4j or another graph database  |
| Time-series metrics             | Specialized time-series database |

Do not force every workload into NewSQL.

## 12.6 When Cost Is More Important Than Distributed Scale

A distributed database may require:

- Multiple nodes.
- Replicated storage.
- Higher network usage.
- Additional monitoring.
- More operational effort.
- More expensive managed infrastructure.

If the application does not need distributed scale or availability, this is unnecessary expenditure.

## 12.7 Decision Checklist

Before adopting NewSQL, answer these questions:

1. Have we optimized the current database?
2. Have we measured actual CPU, memory, disk, and network bottlenecks?
3. Is vertical scaling insufficient?
4. Do we genuinely need horizontal relational scaling?
5. Do we need distributed ACID transactions?
6. Do we need multi-region availability?
7. Can our workload tolerate distributed transaction latency?
8. Can the team operate the cluster?
9. Does the migration justify its cost?
10. Have we tested the actual workload?

If you cannot answer these questions, you are not ready to justify a NewSQL migration.

---

# 13. NewSQL Decision Framework

Use this simplified decision process.

```text
              Start
                |
                v
       Do you need relational SQL?
                |
          +-----+-----+
          |           |
         No          Yes
          |           |
          v           v
    Evaluate NoSQL   Continue
          |           |
          v           v
      Choose DB   Does current SQL
                  deployment scale?
                       |
                 +-----+-----+
                 |           |
                Yes          No
                 |           |
                 v           v
            Keep current   Identify bottleneck
            architecture        |
                                v
                        Can vertical scaling,
                        tuning, or replicas
                        solve the problem?
                                |
                          +-----+-----+
                          |           |
                         Yes          No
                          |           |
                          v           v
                     Optimize     Need horizontal
                     current SQL  relational scaling?
                                      |
                                +-----+-----+
                                |           |
                               No          Yes
                                |           |
                                v           v
                          Re-evaluate    Evaluate NewSQL
                          requirements   candidates
```

NewSQL should be an architectural decision based on measured requirements, not a technology preference.

---

# 14. Real-World Architecture: Choosing for an E-Commerce Platform

Consider an e-commerce application.

Current architecture:

```text
Node.js
Express
MongoDB
Redis
```

Suppose the application grows.

New requirements:

- 50 million users.
- 100 million orders.
- High transaction volume.
- Inventory consistency.
- Payment correctness.
- Multiple geographic regions.

Should we immediately migrate to NewSQL?

No.

First, identify the actual bottleneck.

## 14.1 Scenario A: Database Is Not the Bottleneck

Suppose:

```text
Application CPU: 60%
Database CPU: 30%
Database Memory: 40%
Database Latency: Acceptable
```

The database is healthy.

The problem may be in application processing or external APIs.

Moving to NewSQL will not automatically solve it.

## 14.2 Scenario B: Database Capacity Is the Bottleneck

Suppose:

```text
Database CPU: 95%
Disk I/O: Saturated
Write Latency: Increasing
Storage: Near Capacity
```

First investigate:

- Query plans.
- Indexes.
- Connection pooling.
- Database configuration.
- Data model.
- Vertical scaling.
- Read replicas.
- Partitioning.

If these measures are insufficient and the workload requires horizontal relational scaling, NewSQL becomes a serious candidate.

## 14.3 Scenario C: Multi-Region Strong Consistency Is Required

Suppose the business now requires:

- Multiple geographic regions.
- Strongly consistent inventory updates.
- Distributed transaction guarantees.
- Regional fault tolerance.

This is a more compelling NewSQL use case.

The database selection should then compare:

- Spanner.
- CockroachDB.
- TiDB.
- YugabyteDB.

Evaluate their latency, compatibility, transaction behavior, operational model, and cost using representative workloads.

---

# 15. Common Misconceptions

### Misconception 1: NewSQL is always faster than PostgreSQL.

Incorrect.

A distributed database may be slower for local transactions because it introduces network communication and coordination.

### Misconception 2: Adding nodes always increases performance linearly.

Incorrect.

Hotspots, contention, network overhead, and sequential work limit scaling.

### Misconception 3: NewSQL eliminates all database management complexity.

Incorrect.

It reduces some manual sharding responsibilities but introduces distributed-system operations.

### Misconception 4: NewSQL is only for extremely large companies.

Incorrect.

Smaller companies can use it, but they should have a genuine requirement that justifies its complexity and cost.

### Misconception 5: Traditional SQL cannot scale horizontally.

Incorrect.

Traditional SQL databases can scale using replication, sharding, partitioning, and additional distributed architectures.

NewSQL makes distributed relational execution a core design goal.

### Misconception 6: Distributed transactions are free because the database manages them.

Incorrect.

The database handles coordination internally, but network latency, conflict detection, replication, and retries still consume resources.

### Misconception 7: NewSQL replaces every NoSQL database.

Incorrect.

NewSQL is suitable for distributed relational workloads. NoSQL systems remain useful for document, key-value, graph, wide-column, search, and other specialized access patterns.

### Misconception 8: Replication means backup.

Incorrect.

Replication helps maintain availability and redundant copies. It does not protect against every logical deletion, corruption, or malicious update.

### Misconception 9: Multi-region deployment guarantees low latency everywhere.

Incorrect.

Strongly consistent writes may require communication with remote replicas.

### Misconception 10: If the application has millions of users, it needs NewSQL.

Incorrect.

User count alone does not determine database architecture.

What matters is:

- Request rate.
- Read/write ratio.
- Data size.
- Query complexity.
- Transaction volume.
- Contention.
- Latency requirements.
- Availability requirements.

---

# 16. Interview Questions and Answers

## Beginner Level

### Q1. What are the main advantages of NewSQL?

Horizontal scalability, relational SQL support, distributed transactions, strong consistency, and fault tolerance.

### Q2. What is the biggest disadvantage of NewSQL?

Distributed-system complexity and the communication overhead associated with distributed execution and transactions.

### Q3. Why are distributed transactions expensive?

They require coordination across multiple participants, replication groups, and network connections.

### Q4. Does adding more database nodes always improve performance?

No. Performance depends on workload distribution, network communication, hotspots, and transaction coordination.

### Q5. What is a hotspot?

A partition, range, tablet, or key that receives disproportionately high traffic.

### Q6. Why is data locality important?

Keeping frequently accessed data close together can reduce network communication and distributed transaction overhead.

## Intermediate Level

### Q7. Why can a cross-region transaction be slow?

Because it may require network communication and quorum acknowledgements across geographically distant replicas.

### Q8. How can we reduce distributed transaction overhead?

- Keep related data colocated.
- Choose suitable partition keys.
- Avoid unnecessary multi-partition transactions.
- Keep transactions short.
- Use asynchronous workflows for operations that do not require atomic database commits.

### Q9. Why does NewSQL require more operational expertise?

Because engineers must manage distributed replication, consensus, quorum availability, partition placement, network failures, and distributed transaction behavior.

### Q10. What is the difference between NewSQL and traditional SQL?

Both provide relational SQL capabilities and transactions. NewSQL is designed around distributed storage and execution, whereas conventional relational databases often begin with a single primary database instance and require additional architecture for horizontal distribution.

### Q11. What is the difference between NewSQL and NoSQL?

NewSQL focuses on distributed relational databases and SQL. NoSQL includes several data models and systems optimized for different access patterns and scalability requirements.

### Q12. Can PostgreSQL scale horizontally?

Yes. It can use read replicas, partitioning, sharding architectures, and extensions. However, native PostgreSQL does not provide automatic distributed sharding and transparent distributed transactions as a standard built-in cluster architecture.

## Advanced Level

### Q13. Why can a workload fail to scale even with many database nodes?

Because a bottleneck may be concentrated on one key, partition, leader, or transaction participant. Coordination and sequential work can also limit parallelism.

### Q14. How does data locality affect transaction performance?

Colocating related records can reduce cross-node communication and the number of transaction participants.

### Q15. What is the tradeoff of distributing a hot counter across multiple buckets?

It reduces write contention, but reads and aggregations must combine the values from multiple buckets.

### Q16. Why is a quorum important in cross-region deployment?

A quorum determines whether a replication group can safely commit operations despite certain failures or network partitions.

### Q17. Does a successful quorum guarantee that a distributed transaction across multiple ranges has committed?

No. Quorum-based consensus protects replicated state within a group. A multi-range transaction still needs a distributed commit mechanism.

### Q18. When should a team migrate from PostgreSQL to NewSQL?

When measured requirements demonstrate that conventional scaling approaches are insufficient and the application needs distributed relational storage, transactions, or availability that a suitable NewSQL system can provide.

### Q19. What should be measured before adopting NewSQL?

- Request rate.
- Query latency.
- CPU and memory utilization.
- Disk I/O.
- Network latency.
- Storage growth.
- Transaction contention.
- Replication health.
- Failure-recovery requirements.
- Operational and infrastructure cost.

### Q20. Why is NewSQL not automatically the right choice for a high-traffic application?

High traffic alone does not prove that the database needs distributed SQL. The workload may be read-heavy, cacheable, independently partitionable, or manageable with a well-tuned conventional relational database.

---

# 17. Practical Exercises

## Exercise 1: Identify the Tradeoff

For each scenario, identify the likely NewSQL tradeoff.

| Scenario                                                                 | Main Tradeoff                    |
| ------------------------------------------------------------------------ | -------------------------------- |
| Transaction updates five partitions                                      | Distributed transaction overhead |
| Replicas distributed across continents                                   | Cross-region latency             |
| Millions of writes to one campaign ID                                    | Hotspot                          |
| Team operates a multi-node cluster without distributed-system experience | Operational complexity           |
| Add nodes but keep all writes on one key                                 | Limited horizontal scalability   |

## Exercise 2: Traditional SQL or NewSQL?

Choose the more appropriate starting point.

**Scenario A**

A company website has 20,000 users and a small PostgreSQL database.

Likely choice: Traditional SQL.

**Scenario B**

A global financial platform needs strongly consistent transactions across geographically distributed regions.

Likely candidate: Distributed SQL / NewSQL.

**Scenario C**

A small SaaS product uses PostgreSQL and has plenty of unused database capacity.

Likely choice: Continue with PostgreSQL.

**Scenario D**

An existing MySQL application has outgrown its current architecture and needs distributed transactional storage.

Likely candidate: Evaluate TiDB and other distributed SQL options.

**Scenario E**

A product requires fast retrieval of frequently accessed session data by key.

Likely choice: A key-value database such as Redis, rather than adopting NewSQL solely for this requirement.

## Exercise 3: Design a Better Partition Key

An application receives 10 million campaign participation requests.

Current key:

```text
campaign_id
```

Problem:

All users participate in Campaign 5001, causing a hotspot.

Design an alternative using:

```text
campaign_id + bucket_id
```

Questions:

1. How would you distribute writes?
2. How would you calculate the total campaign participation count?
3. What additional complexity does this create?
4. How would you prevent duplicate participation by the same user?

## Exercise 4: Evaluate a Migration

Your current backend:

```text
Node.js
Express
MongoDB
Redis
```

You are considering a move to distributed SQL.

Create a technical evaluation document covering:

- Why the current database is insufficient.
- Required transaction guarantees.
- Data model changes.
- SQL compatibility.
- Partition-key design.
- Cross-partition transactions.
- Expected network latency.
- Monitoring requirements.
- Backup and recovery.
- Operational costs.
- Migration and rollback plan.

Do not recommend migration until you have evidence that it solves a real problem.

---

# 18. Final Summary

## 18.1 NewSQL Advantages

1. Horizontal scalability.
2. Distributed ACID transactions.
3. Strong consistency.
4. High availability.
5. Automatic data distribution.
6. Familiar SQL interface.
7. Reduced manual sharding complexity.

## 18.2 NewSQL Tradeoffs

1. Distributed transaction overhead.
2. Network latency.
3. Cross-region write latency.
4. Operational complexity.
5. Hotspots.
6. Data locality challenges.
7. Limited scaling for highly contended workloads.
8. Higher infrastructure and monitoring costs.

## 18.3 NewSQL vs Traditional SQL vs NoSQL

| Dimension                | Traditional SQL                        | NewSQL                           | NoSQL                                        |
| ------------------------ | -------------------------------------- | -------------------------------- | -------------------------------------------- |
| Data model               | Relational                             | Relational                       | Multiple models                              |
| SQL                      | Yes                                    | Yes                              | Varies                                       |
| ACID                     | Yes                                    | Yes                              | Depends on system                            |
| Horizontal distribution  | Additional architecture often required | Core design goal                 | Common design goal                           |
| Distributed transactions | Depends on architecture                | Core capability in many systems  | Depends on system                            |
| Schema                   | Structured                             | Structured                       | Varies                                       |
| Best suited for          | Conventional relational workloads      | Distributed relational workloads | Model- and access-pattern-specific workloads |

## 18.4 The Most Important Mental Model

NewSQL solves a specific architectural problem:

**How can we preserve relational SQL and transactional guarantees while distributing database storage and processing across multiple machines?**

But it introduces a corresponding cost:

**The database must coordinate machines, replicas, transactions, and failures over a network.**

That coordination is not free.
