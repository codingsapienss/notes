---
sidebar_label: "NewSQL Database Examples: Google Spanner, CockroachDB, TiDB & YugabyteDB"
sidebar_position: 1
---

# NewSQL Database Examples: Google Spanner, CockroachDB, TiDB & YugabyteDB

# 1. Introduction

In last sections, we studied what NewSQL databases are and why they emerged, the internal mechanisms behind distributed SQL:

- Distributed SQL architecture.
- Nodes, partitions, ranges, and replicas.
- Leader-based replication.
- Consensus and Raft.
- Distributed transactions.
- Two-Phase Commit (2PC).
- Transaction coordination and recovery.

Now we will study how real database systems implement these concepts.

We will cover four important distributed SQL databases:

1. Google Spanner.
2. CockroachDB.
3. TiDB.
4. YugabyteDB.

Each database aims to provide relational database capabilities while distributing storage and computation across multiple machines.

However, their internal architectures are different.

## 1.1 Quick Comparison

| Feature                  | Google Spanner                                      | CockroachDB                                           | TiDB                                         | YugabyteDB                                         |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| SQL interface            | GoogleSQL and PostgreSQL dialect                    | PostgreSQL-compatible SQL                             | MySQL-compatible SQL                         | PostgreSQL-compatible YSQL and YCQL                |
| Data distribution        | Splits                                              | Ranges                                                | Regions                                      | Tablets                                            |
| Consensus                | Paxos family                                        | Raft                                                  | Raft                                         | Raft                                               |
| Storage architecture     | Distributed storage                                 | Distributed KV storage                                | TiKV                                         | DocDB                                              |
| Transaction coordination | Distributed transaction coordination, including 2PC | Transaction records and intents                       | Percolator-inspired 2PC                      | Distributed transaction manager and status records |
| Special concept          | TrueTime                                            | Range leases                                          | Placement Driver                             | Transaction status tablets                         |
| Main design goal         | Globally distributed relational database            | Distributed SQL with automatic scaling and resilience | Separate SQL compute and distributed storage | PostgreSQL-compatible distributed SQL              |

The table is a high-level overview. Exact capabilities, compatibility, and implementation details depend on product versions and configuration.

---

# 2. Google Spanner

<text>**Google Spanner**</text> is Google's globally distributed relational database.

It is designed to provide:

- Relational data modeling.
- SQL queries.
- ACID transactions.
- Strong consistency.
- Automatic data distribution.
- Synchronous replication.
- High availability across regions.

Spanner is particularly interesting because it combines distributed consensus with a globally meaningful time API called **TrueTime**.

## 2.1 Why Was Spanner Developed?

Imagine a large financial platform operating in multiple countries:

```text
              Global Application
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        USA         Europe       Asia
       Region       Region      Region
```

The application needs:

- Data distributed geographically.
- High availability.
- Strong consistency.
- Transactions involving records stored in different locations.
- The ability to scale without relying on one central database server.

A traditional single-node relational database is not designed to provide this combination at global scale.

Spanner was designed to address this problem.

## 2.2 Spanner Architecture

A simplified architecture:

```text
                 Application
                      |
                      v
                Spanner API
                      |
                      v
              Query Processing
                      |
                      v
              Distributed Storage
                      |
              +-------+-------+
              |       |       |
              v       v       v
           Split A  Split B  Split C
              |       |       |
              v       v       v
          Paxos     Paxos     Paxos
          Group     Group     Group
              |       |       |
              v       v       v
           Replicas Replicas Replicas
```

Important components:

1. SQL and query processing.
2. Splits.
3. Paxos replication groups.
4. Distributed transaction coordination.
5. TrueTime.

## 2.3 What Are Splits?

Spanner divides the database's key space into smaller units called **splits**.

A split contains a range of keys.

Suppose a table contains customer records:

```text
customer_id = 1
customer_id = 2
customer_id = 3
...
customer_id = 10,000,000
```

Spanner may divide the key space like this:

```text
Database
   |
   +---- Split 1: Keys 1–1,000,000
   |
   +---- Split 2: Keys 1,000,001–2,000,000
   |
   +---- Split 3: Keys 2,000,001–3,000,000
   |
   +---- Split 4: Remaining keys
```

These splits can be distributed across servers.

As the database grows or workload changes, Spanner can manage and redistribute splits.

**Important:** A split is a logical data unit. It is not a physical server.

## 2.4 Paxos Replication

Spanner uses Paxos-family consensus for replicated data.

A split is replicated across multiple machines.

Conceptually:

```text
                  Split 1
                     |
              Paxos Group
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Replica A  Replica B  Replica C
```

Each Paxos group has its own replication and leadership mechanisms.

A leader coordinates write proposals.

The write is accepted after the required majority of replicas accepts the proposal.

For example, with three voting replicas:

```text
Replica A -> Accept
Replica B -> Accept
Replica C -> Unavailable

Majority = 2

Proposal can be accepted.
```

Paxos provides agreement about the replicated operation sequence.

This is conceptually similar to Raft's purpose, but Paxos and Raft are different consensus algorithms.

## 2.5 What Is TrueTime?

TrueTime is one of Spanner's most important architectural innovations.

Distributed databases have a clock problem.

Consider two machines:

```text
Machine A Clock: 10:00:00.100
Machine B Clock: 10:00:00.080
```

The clocks differ by 20 milliseconds.

Now suppose:

1. Transaction A commits on Machine A.
2. Transaction B starts on Machine B.
3. The machines have slightly different clock readings.

How can the database establish a globally correct transaction order?

Simply trusting local machine clocks is unsafe.

Spanner addresses this with **TrueTime**.

TrueTime provides an interval representing the possible current time rather than pretending that a physical clock reading is perfectly exact.

Conceptually:

```text
TrueTime.now()

Earliest possible time: 10:00:00.090
Latest possible time:   10:00:00.110
```

The actual time is understood to fall within this interval.

The interval accounts for clock uncertainty.

TrueTime uses a combination of time sources and clock synchronization infrastructure to provide these bounds.

## 2.6 Why Does TrueTime Matter?

Suppose two transactions must be ordered:

```text
Transaction A
      |
      v
Transaction B
```

If Transaction B begins after Transaction A has committed, the database must preserve the required ordering.

Spanner uses timestamps and TrueTime's uncertainty bounds to support externally consistent transaction ordering.

This property is commonly called **external consistency** or strict serializability.

In simplified terms:

If transaction A completes before transaction B starts, the database's serialization order must place A before B.

This is stronger than merely assigning arbitrary transaction timestamps.

## 2.7 Commit Wait

TrueTime also affects commit processing.

Spanner may need to wait until the uncertainty interval has passed the assigned commit timestamp before reporting a read-write transaction as committed.

This is called commit wait.

Why?

Because the database needs to ensure that the assigned timestamp is safely in the past relative to real time, within TrueTime's guarantees.

Simplified flow:

```text
Transaction Executes
        |
        v
Assign Commit Timestamp
        |
        v
Check TrueTime Uncertainty
        |
        v
Wait Until Timestamp Is Safe
        |
        v
Return Commit Success
```

This introduces some latency, but supports the external consistency guarantee.

## 2.8 Distributed Transactions in Spanner

Suppose a transaction modifies data stored in two different splits.

```text
Split A:
Account 101

Split B:
Account 202
```

A transfer requires:

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

Spanner coordinates the transaction across the relevant groups.

At a high level:

1. The transaction reads and modifies the required data.
2. The relevant participants prepare their work.
3. Distributed commit coordination determines the transaction outcome.
4. Replication groups durably record their operations.
5. TrueTime helps establish the externally consistent commit timestamp.

Spanner uses distributed transaction coordination, including 2PC-style coordination across groups.

The Paxos protocol protects replicated state within groups. It does not replace the distributed transaction protocol.

## 2.9 Spanner Data Modeling

Spanner supports relational tables, primary keys, indexes, and interleaved table relationships.

Consider:

```sql
CREATE TABLE Customers (
    CustomerId INT64 NOT NULL,
    Name STRING(100)
) PRIMARY KEY (CustomerId);

CREATE TABLE Orders (
    CustomerId INT64 NOT NULL,
    OrderId INT64 NOT NULL,
    Amount NUMERIC
) PRIMARY KEY (CustomerId, OrderId),
  INTERLEAVE IN PARENT Customers ON DELETE CASCADE;
```

Interleaving allows related child rows to be physically organized with their parent rows according to their key structure.

This can improve locality for workloads that frequently access a customer and that customer's orders together.

It is not a general replacement for relational joins. Data modeling still needs to consider access patterns and distribution.

## 2.10 Advantages of Spanner

- Strong transactional consistency.
- Global distribution.
- Synchronous replication.
- Automatic splitting and distribution.
- High availability.
- SQL support.
- Strong ordering guarantees using TrueTime.

## 2.11 Tradeoffs of Spanner

- Distributed transactions can introduce network latency.
- Cross-region writes can be expensive.
- TrueTime and distributed coordination add architectural complexity.
- It is a managed Google Cloud service rather than a self-hosted database in the traditional sense.
- Data modeling and locality decisions still matter.
- It may be unnecessary for applications that do not need global distribution.

## 2.12 When Would You Use Spanner?

Consider:

- Global financial applications.
- Large payment systems.
- Globally distributed customer platforms.
- Applications requiring strong consistency across regions.
- Systems where high availability and horizontal scalability are essential.

**Core takeaway:** Spanner combines Paxos-based replication, distributed transactions, and TrueTime to provide strongly consistent relational data across geographic locations.

---

# 3. CockroachDB

<text>**CockroachDB**</text> is a distributed SQL database designed to provide relational SQL functionality, automatic data distribution, fault tolerance, and horizontal scalability.

It is inspired by Google's Spanner architecture, but its implementation is different.

Important concepts:

- SQL layer.
- Distributed key-value layer.
- Ranges.
- Raft.
- Range leases.
- Transaction records.
- Write intents.

## 3.1 CockroachDB Architecture

```text
                  Application
                       |
                       v
                 SQL Gateway
                       |
                       v
              SQL Query Processing
                       |
                       v
               Distributed KV Layer
                       |
             +---------+---------+
             |         |         |
             v         v         v
          Node A    Node B    Node C
             |         |         |
             v         v         v
          Ranges    Ranges    Ranges
             |         |         |
             v         v         v
           Raft      Raft      Raft
          Groups    Groups    Groups
```

CockroachDB separates SQL query processing from the distributed storage mechanisms conceptually.

An application can connect to different nodes in the cluster.

A node receiving the query does not necessarily store all the data needed by that query.

## 3.2 What Are Ranges?

CockroachDB organizes its distributed key-value data into ranges.

A range is a contiguous interval of keys.

Example:

```text
Range 1: [A, B)
Range 2: [B, C)
Range 3: [C, D)
```

The ranges collectively represent the database's key space.

Each range is replicated across multiple nodes.

```text
                 Database
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Range 1    Range 2    Range 3
          |          |          |
          v          v          v
       Raft       Raft       Raft
       Group      Group      Group
```

Ranges are split and merged as data size and workload change.

This allows CockroachDB to distribute storage and workload across the cluster.

## 3.3 Raft Replication

Each range has a group of replicas.

The replicas form a Raft group.

Example:

```text
                Range 1
                   |
              Raft Group
                   |
         +---------+---------+
         |         |         |
         v         v         v
       Node A    Node B    Node C
       Leader   Follower  Follower
```

The leader coordinates writes.

Followers replicate log entries.

A write becomes committed when the required Raft quorum condition is satisfied.

For three voting replicas, two are needed for a majority.

Different ranges can have different Raft leaders.

Therefore, the cluster does not need one global leader for every write.

## 3.4 What Is a Range Lease?

CockroachDB has a concept called a **range lease**.

The leaseholder has authority to serve certain operations for a range, especially authoritative reads and writes.

Why is this needed?

Imagine that a range has three replicas:

```text
Node A
Node B
Node C
```

The database needs a mechanism to determine which replica should handle authoritative operations for that range.

The lease helps establish that authority.

A simplified view:

```text
Range 1
   |
   +---- Node A: Leaseholder
   |
   +---- Node B: Follower
   |
   +---- Node C: Follower
```

The leaseholder can serve appropriate reads without requiring every read to perform a full Raft replication round trip.

Writes are proposed through the Raft replication mechanism.

## 3.5 Raft Leader vs Leaseholder

Do not confuse these two concepts.

| Raft Leader                       | Leaseholder                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| Coordinates Raft log replication  | Holds authority for certain range operations                         |
| Part of the consensus protocol    | Part of CockroachDB's range lease mechanism                          |
| Maintains replicated log progress | Helps serve authoritative reads and coordinate writes                |
| Elected through Raft              | Lease authority is established through CockroachDB's lease mechanism |

They are often colocated, but they are conceptually distinct and do not have to be treated as the same role.

## 3.6 How Does a Write Work?

Suppose the application executes:

```sql
INSERT INTO orders (order_id, amount)
VALUES (5001, 2500);
```

Conceptually:

```text
Application
    |
    v
SQL Node
    |
    v
Find Relevant Range
    |
    v
Range Leaseholder
    |
    v
Raft Leader
    |
    v
Replicate Log Entry
    |
    v
Quorum Acknowledgement
    |
    v
Commit and Apply
    |
    v
Return Result
```

The SQL node coordinates query execution, while the range's replication group maintains the replicated state.

## 3.7 Distributed Transactions in CockroachDB

Suppose an order and payment are stored in different ranges.

```text
Range 1:
Orders

Range 2:
Payments
```

A transaction updates both:

```sql
BEGIN;

INSERT INTO orders (order_id, customer_id)
VALUES (5001, 101);

INSERT INTO payments (payment_id, order_id, amount)
VALUES (9001, 5001, 2500);

COMMIT;
```

CockroachDB must coordinate the transaction across the ranges.

Important mechanisms include:

- Transaction records.
- Write intents.
- Transaction timestamps.
- Conflict detection.
- Distributed commit coordination.

### What Are Write Intents?

A write intent represents a provisional write associated with an ongoing transaction.

Instead of immediately exposing every write as a committed value, the database records transaction-related state.

Conceptually:

```text
Transaction TXN-100

Range 1:
Order write intent

Range 2:
Payment write intent
```

The transaction's status determines whether those intents should be treated as committed or aborted.

This helps prevent readers from observing partially committed transaction changes.

CockroachDB's implementation uses transaction records and intents on top of its replicated range architecture. Do not reduce the entire implementation to a textbook 2PC diagram; its transaction protocol has additional mechanisms.

## 3.8 Transaction Isolation

CockroachDB provides serializable transaction semantics by default.

Serializable isolation means that committed concurrent transactions must behave as if they executed in some valid serial order.

However, transactions can encounter serialization conflicts.

For example:

```text
Transaction A reads inventory = 10
Transaction B reads inventory = 10

Transaction A updates inventory = 8
Transaction B updates inventory = 7
```

The database may detect that the transactions cannot both safely commit under the required serialization order.

One transaction may need to retry.

Application code must handle retryable transaction errors.

## 3.9 Automatic Scaling and Rebalancing

CockroachDB distributes ranges across nodes.

When a new node joins:

```text
Before:

Node A: Range 1, Range 2, Range 3
Node B: Range 4, Range 5
Node C: Range 6
```

The cluster can rebalance ranges:

```text
After:

Node A: Range 1, Range 2
Node B: Range 3, Range 4
Node C: Range 5, Range 6
```

The goal is to distribute storage and workload more evenly.

Rebalancing is not instantaneous or free. It consumes resources and depends on cluster capacity and placement constraints.

## 3.10 Advantages of CockroachDB

- Distributed SQL.
- PostgreSQL-compatible SQL interface.
- Raft-based replication.
- Automatic range splitting and rebalancing.
- Strong transaction guarantees.
- Fault tolerance.
- Support for multi-region deployments.

## 3.11 Tradeoffs of CockroachDB

- Cross-range transactions introduce coordination overhead.
- Cross-region quorum writes can increase latency.
- Transaction retries must be handled correctly.
- Hot ranges can become bottlenecks.
- Distributed SQL adds operational complexity compared with a simple single-node database.

## 3.12 When Would You Use CockroachDB?

Consider:

- Applications needing PostgreSQL-style relational modeling with distributed scaling.
- Multi-region transactional systems.
- Financial or commerce applications requiring strong transaction guarantees.
- Applications requiring automatic data distribution and fault tolerance.

**Core takeaway:** CockroachDB uses ranges, Raft replication, range leases, and distributed transaction records to provide distributed SQL.

---

# 4. TiDB

<text>**TiDB**</text> is an open-source distributed SQL database designed for MySQL compatibility and horizontal scalability.

Its architecture is particularly interesting because it separates the SQL compute layer from the storage layer.

Important components:

1. TiDB.
2. TiKV.
3. Placement Driver (PD).
4. TiFlash.

## 4.1 TiDB Architecture

```text
                    Application
                         |
                         v
                   MySQL Protocol
                         |
                         v
                    TiDB Server
                    SQL Layer
                         |
              +----------+----------+
              |                     |
              v                     v
           TiKV                  TiFlash
        Row Storage           Column Storage
              |                     |
              v                     v
           Regions              Analytical
              |                 Replicas
              v
          Raft Groups
              |
              v
          Placement
          Driver (PD)
```

Each component has a specific responsibility.

## 4.2 TiDB Server

TiDB is the SQL processing layer.

Responsibilities:

- Accept MySQL protocol connections.
- Parse SQL statements.
- Optimize queries.
- Generate execution plans.
- Execute distributed queries.
- Coordinate transactions.
- Send storage requests to TiKV or TiFlash.

An important characteristic:

**TiDB servers are stateless with respect to the actual database records.**

They do not store the primary table data.

You can run multiple TiDB instances behind a load balancer.

```text
             Application
                  |
             Load Balancer
                  |
          +-------+-------+
          |       |       |
          v       v       v
        TiDB A  TiDB B  TiDB C
```

Adding more TiDB instances increases SQL processing capacity, subject to storage and network bottlenecks.

## 4.3 TiKV

TiKV is the distributed transactional key-value storage engine.

It stores the actual data.

TiDB converts SQL operations into key-value requests that TiKV processes.

Example:

```sql
SELECT *
FROM users
WHERE user_id = 101;
```

The TiDB layer determines the required keys and sends requests to the relevant TiKV nodes.

TiKV provides:

- Persistent storage.
- Data distribution.
- Replication.
- Transactional operations.
- MVCC support.

TiKV uses RocksDB as its underlying storage engine.

## 4.4 Placement Driver (PD)

PD is the cluster's metadata and scheduling component.

It maintains information such as:

- Region distribution.
- Node status.
- Cluster topology.
- Scheduling decisions.
- Timestamp allocation.

It helps determine where data should live and how it should be balanced.

Conceptually:

```text
                  PD
                   |
          +--------+--------+
          |        |        |
          v        v        v
        TiKV A   TiKV B   TiKV C
          |        |        |
          +--------+--------+
                   |
             Region Metadata
```

PD is an important control-plane component.

It is commonly deployed as a highly available cluster rather than a single standalone server.

## 4.5 What Are Regions?

TiKV divides data into key ranges called **Regions**.

A Region stores a particular interval of keys.

Example:

```text
Region 1: [A, B)
Region 2: [B, C)
Region 3: [C, D)
```

Regions are the basic units for data distribution and scheduling.

A TiKV node can store multiple Regions.

Each Region has multiple replicas distributed across different nodes.

## 4.6 Raft Replication in TiKV

Each Region's replicas form a Raft group.

Example:

```text
                 Region 1
                     |
                 Raft Group
                     |
          +----------+----------+
          |          |          |
          v          v          v
        TiKV A    TiKV B    TiKV C
        Leader   Follower  Follower
```

The leader handles the relevant write coordination.

Followers replicate the log.

A majority is required for the relevant consensus operations.

If one replica fails, the group can continue if a quorum remains.

## 4.7 What Is TiFlash?

TiFlash is a columnar storage engine used to accelerate analytical workloads.

This is important because transactional and analytical queries often have different access patterns.

Consider:

```sql
SELECT *
FROM orders
WHERE order_id = 5001;
```

This is a typical point lookup.

Now consider:

```sql
SELECT
    customer_id,
    SUM(amount)
FROM orders
GROUP BY customer_id;
```

This is an analytical aggregation.

TiKV provides row-oriented transactional storage.

TiFlash provides column-oriented storage that can accelerate analytical queries.

Conceptually:

```text
                   TiDB
                     |
              Query Optimizer
                     |
           +---------+---------+
           |                   |
           v                   v
         TiKV               TiFlash
      Row Storage        Column Storage
           |                   |
           v                   v
       OLTP Queries        OLAP Queries
```

TiFlash maintains data replicated from TiKV and uses the learner role in the replication architecture.

It is not simply an independent database with manually copied data.

## 4.8 How Does a TiDB Query Work?

Suppose:

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

Execution flow:

```text
Application
    |
    v
TiDB Server
    |
    v
Parse SQL
    |
    v
Optimize Query
    |
    v
Generate Execution Plan
    |
    v
Identify Relevant Regions
    |
    v
Send Requests to TiKV
    |
    v
Retrieve Results
    |
    v
Return Result to Application
```

For a distributed aggregation, TiDB may send work to multiple TiKV nodes and combine the results.

## 4.9 TiDB Transactions

TiDB supports distributed ACID transactions.

Its transaction architecture is inspired by Google's Percolator design.

A key mechanism is **Two-Phase Commit (2PC)**.

TiDB supports both optimistic and pessimistic transaction modes.

Pessimistic transaction mode is the default for newly created clusters in the documented modern transaction model, though behavior and defaults should always be checked against the deployed version.

## 4.10 Percolator-Inspired 2PC

Consider:

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

Suppose the two accounts are stored in different Regions.

TiDB must coordinate the changes.

A simplified transaction flow:

```text
             TiDB
              |
              v
        Transaction Coordinator
              |
       +------+------+
       |             |
       v             v
    Region A      Region B
       |             |
       v             v
    Prewrite      Prewrite
       |             |
       +------+------+
              |
              v
         Commit Phase
              |
       +------+------+
       |             |
       v             v
    Commit A      Commit B
```

### Phase 1: Prewrite

TiDB sends prewrite requests to the relevant participants.

The participants:

- Check conflicts.
- Write transaction-related intent information.
- Prepare the mutations.
- Persist the required state.

The data is not yet visible as a fully committed transaction.

### Phase 2: Commit

The transaction coordinator determines the commit outcome.

The primary key's commit decision is an important part of the protocol.

After the transaction is committed, secondary keys can be committed or finalized according to the protocol.

TiDB uses additional mechanisms such as MVCC timestamps and lock resolution to ensure that transactions are read consistently.

Do not assume that every participant independently becomes visible at exactly the same physical instant. The transaction protocol ensures the database presents the required atomic transaction semantics.

## 4.11 Timestamp Oracle and PD

TiDB uses timestamps to order transactions.

PD provides timestamp allocation through its Timestamp Oracle functionality.

A simplified view:

```text
TiDB Transaction
       |
       v
Request Timestamp
       |
       v
      PD
       |
       v
Timestamp Returned
       |
       v
Transaction Uses Timestamp
```

Timestamps are important for:

- MVCC.
- Snapshot reads.
- Transaction ordering.
- Conflict detection.
- Commit processing.

PD is therefore more than a node-placement manager.

It also plays a role in the transaction timestamp architecture.

## 4.12 Advantages of TiDB

- MySQL protocol compatibility.
- Distributed SQL.
- Horizontal scaling.
- Separate SQL compute and storage.
- Raft-based Region replication.
- Distributed ACID transactions.
- TiFlash for analytical workloads.
- Open-source architecture.

## 4.13 Tradeoffs of TiDB

- Multiple components increase operational complexity.
- Distributed transactions add network overhead.
- PD and storage scheduling require careful operation.
- MySQL compatibility does not mean perfect compatibility with every MySQL feature or behavior.
- Analytical performance depends on query routing, data replication, and TiFlash configuration.
- A distributed deployment requires suitable network and storage resources.

## 4.14 When Would You Use TiDB?

Consider:

- Applications currently using MySQL that need horizontal scaling.
- Large transactional applications.
- Workloads requiring distributed SQL.
- Applications with both OLTP and analytical workloads.
- Systems that benefit from separate compute and storage scaling.

**Core takeaway:** TiDB separates SQL compute from distributed storage. TiDB handles SQL, TiKV stores transactional data, PD manages cluster metadata and timestamps, and TiFlash supports analytical workloads.

---

# 5. YugabyteDB

<text>**YugabyteDB**</text> is an open-source distributed database designed to provide SQL compatibility, horizontal scalability, strong consistency, and high availability.

It is particularly interesting for PostgreSQL developers because it provides a PostgreSQL-compatible SQL API called YSQL.

Important concepts:

- YSQL.
- YCQL.
- DocDB.
- Tablets.
- Raft.
- YB-Master.
- YB-TServer.
- Distributed transaction manager.

## 5.1 YugabyteDB Architecture

```text
                  Application
                       |
              +--------+--------+
              |                 |
              v                 v
            YSQL              YCQL
       PostgreSQL API      Cassandra-like API
              |                 |
              +--------+--------+
                       |
                       v
                Query Layer
                       |
                       v
                 YB-TServer
                       |
                       v
                    DocDB
                       |
                       v
                    Tablets
                       |
                       v
                  Raft Groups
                       |
                       v
                    Replicas
```

YugabyteDB logically separates the query layer from the storage layer.

## 5.2 YSQL

YSQL is the PostgreSQL-compatible SQL API.

It supports relational database functionality such as:

- SQL queries.
- Tables.
- Indexes.
- Joins.
- Transactions.
- Referential integrity.
- PostgreSQL-compatible client connectivity.

Example:

```sql
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY,
    name TEXT
);

INSERT INTO customers
VALUES (101, 'Prashant');

SELECT *
FROM customers
WHERE customer_id = 101;
```

A PostgreSQL application can often use its existing PostgreSQL driver and familiar SQL interface, subject to YugabyteDB's compatibility differences.

## 5.3 YCQL

YCQL is a Cassandra Query Language-inspired API.

It is designed for distributed workloads that benefit from a more Cassandra-like data model and access pattern.

YSQL and YCQL are separate APIs.

You should choose the API based on the application's data model and access patterns rather than assuming they are interchangeable interfaces over identical semantics.

For a traditional relational backend with joins and PostgreSQL compatibility, YSQL is generally the relevant interface.

## 5.4 YB-Master

YB-Master is responsible for cluster-level metadata and orchestration.

Responsibilities include:

- Managing table metadata.
- Tracking tablet locations.
- Managing cluster topology.
- Coordinating placement and balancing.
- Managing background cluster operations.

Simplified:

```text
                YB-Master
                    |
          +---------+---------+
          |         |         |
          v         v         v
       TServer A TServer B TServer C
```

YB-Master is part of the control plane.

It does not directly replace the tablet servers that process application data requests.

## 5.5 YB-TServer

YB-TServer is responsible for serving application data requests and managing tablet peers.

A TServer can host multiple tablets or tablet replicas.

Responsibilities include:

- Processing read and write requests.
- Managing tablet data.
- Participating in Raft replication.
- Serving distributed query operations.
- Handling storage operations.

## 5.6 What Is DocDB?

DocDB is YugabyteDB's distributed document-oriented storage layer.

It is built on top of RocksDB.

It provides the underlying storage representation for YugabyteDB's data.

Conceptually:

```text
YSQL / YCQL
     |
     v
 Query Layer
     |
     v
   DocDB
     |
     v
  RocksDB
     |
     v
 Local Disk
```

Do not confuse DocDB with a general-purpose document database such as MongoDB.

DocDB is an internal storage engine used by YugabyteDB.

## 5.7 What Are Tablets?

YugabyteDB divides table data into smaller units called **tablets**.

A tablet is a logical shard of a table.

Example:

```text
Orders Table
     |
     +---- Tablet 1
     |
     +---- Tablet 2
     |
     +---- Tablet 3
     |
     +---- Tablet 4
```

Tablets are distributed across YB-TServer nodes.

A tablet can have multiple replicas.

When a tablet grows or the workload changes, tablet splitting and rebalancing can help distribute the data and load.

## 5.8 Raft Replication in YugabyteDB

Each tablet's replicas form a Raft group.

Example:

```text
                 Tablet 1
                     |
                 Raft Group
                     |
          +----------+----------+
          |          |          |
          v          v          v
       TServer A TServer B TServer C
        Leader   Follower  Follower
```

The leader coordinates writes.

Followers replicate log entries.

Strongly consistent writes require the relevant majority acknowledgement.

If the leader fails and quorum remains, another replica can be elected.

## 5.9 Distributed Transactions in YugabyteDB

YugabyteDB supports ACID transactions across multiple rows and tablets.

Its transaction architecture includes:

- Transaction coordinator.
- Transaction status records.
- Provisional records, also called intents.
- Hybrid logical timestamps.
- Transaction resolution.

Suppose an application transfers money between two accounts stored in different tablets.

```text
Tablet A:
Account 101

Tablet B:
Account 202
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

The transaction can span multiple tablets.

## 5.10 Provisional Records / Intents

A distributed transaction must not expose partially applied writes.

YugabyteDB stores uncommitted distributed transaction changes as provisional records.

These records are stored separately from regular committed records.

Conceptually:

```text
Tablet A
   |
   +---- Regular Records
   |
   +---- IntentsDB
          |
          +---- Uncommitted Transaction Data

Tablet B
   |
   +---- Regular Records
   |
   +---- IntentsDB
          |
          +---- Uncommitted Transaction Data
```

The intents are associated with a transaction ID.

They are not treated as ordinary committed values.

The database checks transaction status to determine how the intents should be interpreted.

## 5.11 Transaction Status Tablet

YugabyteDB maintains transaction status information.

A simplified transaction lifecycle:

```text
Transaction Begins
       |
       v
Coordinator Created
       |
       v
Transaction Status = PENDING
       |
       v
Write Intents to Tablets
       |
       v
Determine Commit / Abort
       |
       v
Update Transaction Status
       |
       v
Resolve Intents
```

The transaction status information allows other operations and recovery processes to determine the transaction's outcome.

YugabyteDB's implementation uses transaction status tablets and transaction management mechanisms to coordinate distributed transactions.

## 5.12 Hybrid Logical Clock

Distributed systems need a way to order events across machines.

YugabyteDB uses Hybrid Logical Clocks (HLC) to generate monotonically ordered logical timestamps.

An HLC combines physical clock information with logical counters.

Conceptually:

```text
Timestamp:
Physical Time + Logical Counter
```

Why is this useful?

Suppose two machines generate events at nearly the same time.

Their physical clocks may differ slightly.

A logical component helps preserve a consistent event ordering according to the system's clock protocol.

HLC is different from Spanner's TrueTime.

- TrueTime exposes a bounded uncertainty interval around current time.
- HLC combines physical time and logical ordering information.

Do not treat them as the same mechanism.

## 5.13 Advantages of YugabyteDB

- PostgreSQL-compatible YSQL API.
- Horizontal scalability.
- Tablet-based partitioning.
- Raft-based replication.
- Distributed ACID transactions.
- Automatic data distribution.
- Support for multiple SQL-style APIs.

## 5.14 Tradeoffs of YugabyteDB

- Distributed transactions introduce communication overhead.
- Cross-tablet operations are more expensive than local operations.
- The architecture has more moving parts than a standalone PostgreSQL deployment.
- PostgreSQL compatibility does not mean every PostgreSQL feature behaves identically.
- Operational expertise is required for production deployments.

## 5.15 When Would You Use YugabyteDB?

Consider:

- PostgreSQL-based applications that need horizontal scalability.
- Distributed transactional applications.
- Multi-region systems.
- Applications requiring strong consistency and high availability.
- Systems where tablet-based distribution is useful.

**Core takeaway:** YugabyteDB uses YSQL/YCQL APIs, DocDB storage, tablet-based distribution, Raft replication, and transaction status mechanisms to provide distributed database capabilities.

---

# 6. Architecture Comparison: All Four Databases

Now compare the internal architecture directly.

## 6.1 High-Level Architecture

### Google Spanner

```text
Application
    |
    v
Spanner SQL
    |
    v
Query Processing
    |
    v
Splits
    |
    v
Paxos Groups
    |
    v
Replicas
    |
    v
TrueTime + Distributed Transactions
```

### CockroachDB

```text
Application
    |
    v
SQL Layer
    |
    v
Distributed KV
    |
    v
Ranges
    |
    v
Raft Groups
    |
    v
Replicas
    |
    v
Range Leases + Transaction Records
```

### TiDB

```text
Application
    |
    v
TiDB SQL Layer
    |
    v
TiKV Storage
    |
    v
Regions
    |
    v
Raft Groups
    |
    v
Replicas

PD -> Metadata, Scheduling, Timestamps
TiFlash -> Analytical Storage
```

### YugabyteDB

```text
Application
    |
    v
YSQL / YCQL
    |
    v
YB-TServer
    |
    v
DocDB
    |
    v
Tablets
    |
    v
Raft Groups
    |
    v
Replicas

YB-Master -> Metadata and Orchestration
Transaction Manager -> Distributed Transactions
```

## 6.2 Data Distribution Comparison

| Database    | Data Unit | Meaning                     |
| ----------- | --------- | --------------------------- |
| Spanner     | Split     | Logical range of key space  |
| CockroachDB | Range     | Contiguous interval of keys |
| TiDB        | Region    | Key-range unit in TiKV      |
| YugabyteDB  | Tablet    | Logical shard of a table    |

All four systems distribute data into smaller logical units.

But their names, internal management, and transaction boundaries are product-specific.

## 6.3 Consensus Comparison

| Database    | Consensus    | Replication Unit        |
| ----------- | ------------ | ----------------------- |
| Spanner     | Paxos family | Paxos group for a split |
| CockroachDB | Raft         | Range                   |
| TiDB        | Raft         | Region                  |
| YugabyteDB  | Raft         | Tablet                  |

The important distinction:

Spanner uses Paxos-family consensus. The other three use Raft-based replication.

## 6.4 Transaction Architecture Comparison

| Database    | Transaction Mechanism                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Spanner     | Distributed transaction coordination, including 2PC, with timestamp ordering supported by TrueTime       |
| CockroachDB | Transaction records, write intents, and distributed transaction coordination over Raft-replicated ranges |
| TiDB        | Percolator-inspired 2PC with MVCC timestamps                                                             |
| YugabyteDB  | Transaction manager, status tablets, provisional records/intents, and hybrid logical timestamps          |

All aim to provide distributed transaction guarantees, but their implementation details differ.

## 6.5 SQL Compatibility

| Database    | SQL Compatibility                |
| ----------- | -------------------------------- |
| Spanner     | GoogleSQL and PostgreSQL dialect |
| CockroachDB | PostgreSQL-compatible SQL        |
| TiDB        | MySQL-compatible SQL             |
| YugabyteDB  | PostgreSQL-compatible YSQL       |

Compatibility is important when migrating an existing application.

However, protocol and syntax compatibility do not guarantee that every feature, extension, execution behavior, or operational characteristic is identical.

Always validate application-specific queries and drivers.

---

# 7. Choosing Between the Four Databases

There is no universally best NewSQL database.

The correct choice depends on workload, deployment model, SQL compatibility, consistency requirements, operational capabilities, and cost.

## 7.1 If You Are Building a Global Application

Example:

```text
Users:
USA
Europe
India
Singapore
```

You need:

- Global availability.
- Strong consistency.
- Distributed transactions.
- Data across multiple regions.

Spanner is a strong candidate, particularly when operating within Google Cloud.

CockroachDB and YugabyteDB are also candidates depending on deployment requirements and latency expectations.

## 7.2 If Your Application Uses PostgreSQL

Suppose the existing application uses:

```text
Node.js
Express
PostgreSQL
```

You want distributed SQL without replacing your SQL-oriented data model.

Candidates:

- CockroachDB.
- YugabyteDB.
- Spanner's PostgreSQL dialect, if its supported feature set matches your application.

But do not assume that migration is just changing the connection string.

Check:

- SQL compatibility.
- PostgreSQL extensions.
- Isolation behavior.
- Index support.
- DDL behavior.
- Driver behavior.
- Query plans.
- Transaction retry requirements.

## 7.3 If Your Application Uses MySQL

Suppose:

```text
Node.js
Express
MySQL
```

TiDB is a natural candidate to evaluate because it provides MySQL protocol compatibility.

It is especially relevant when the application needs:

- Distributed transactional storage.
- Horizontal scaling.
- MySQL-oriented application compatibility.
- Analytical capabilities through TiFlash.

Again, validate the exact MySQL features your application depends on.

## 7.4 If You Need Open-Source Distributed SQL

CockroachDB, TiDB, and YugabyteDB are open-source distributed database options.

The correct comparison should include:

- Community and enterprise features.
- Managed versus self-hosted deployment.
- Operational complexity.
- PostgreSQL or MySQL compatibility.
- Transaction behavior.
- Backup and disaster recovery.
- Monitoring and tooling.
- Cost at the expected workload.

Spanner is a Google Cloud managed service.

---

# 8. Real-World Backend Example

Consider an e-commerce application.

The application has these tables:

```sql
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    stock INT
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT,
    total_amount DECIMAL(12, 2)
);

CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY,
    order_id BIGINT,
    amount DECIMAL(12, 2),
    status VARCHAR(30)
);
```

Now imagine the application has:

- 50 million customers.
- 100 million orders.
- 20 million products.
- 100 million payment records.
- Users distributed across multiple countries.

A single database server may eventually become a bottleneck.

You consider distributed SQL.

## 8.1 With CockroachDB

Possible architecture:

```text
Node.js Application
        |
        v
CockroachDB SQL Nodes
        |
        v
Distributed Ranges
        |
        v
Raft Replication
```

You can retain a relational SQL model while the database distributes ranges.

Transactions may span multiple ranges.

## 8.2 With TiDB

Possible architecture:

```text
Node.js Application
        |
        v
TiDB SQL Layer
        |
        +------------------+
        |                  |
        v                  v
      TiKV              TiFlash
   Transactional       Analytics
     Storage
        |
        v
     Regions
        |
        v
    Raft Groups

PD manages metadata and scheduling.
```

This architecture is useful when separating transactional and analytical processing is important.

## 8.3 With YugabyteDB

Possible architecture:

```text
Node.js Application
        |
        v
YSQL
        |
        v
YB-TServers
        |
        v
DocDB
        |
        v
Tablets
        |
        v
Raft Groups
```

A PostgreSQL-oriented application can use YSQL, subject to compatibility validation.

## 8.4 With Spanner

Possible architecture:

```text
Global Node.js Application
           |
           v
      Spanner SQL
           |
           v
         Splits
           |
           v
      Paxos Groups
           |
           v
       Replicas
           |
           v
       TrueTime
```

This is particularly relevant for global applications that need strong transactional consistency.

---

# 9. Important Differences You Must Understand

## 9.1 Paxos vs Raft

Both are consensus algorithms.

Their goal is to maintain agreement among distributed replicas.

| Paxos                              | Raft                                     |
| ---------------------------------- | ---------------------------------------- |
| Consensus protocol family          | Consensus algorithm                      |
| Used by Google Spanner             | Used by CockroachDB, TiKV, YugabyteDB    |
| Leader-based implementations exist | Explicit leader-based design             |
| Uses proposals and acceptors       | Uses leader election and log replication |

Do not assume that a system using Paxos and one using Raft have identical internal architectures.

## 9.2 TrueTime vs Hybrid Logical Clock

| TrueTime                                    | Hybrid Logical Clock                                   |
| ------------------------------------------- | ------------------------------------------------------ |
| Exposes a bounded interval for current time | Combines physical and logical time                     |
| Used by Spanner                             | Used by YugabyteDB                                     |
| Helps establish external consistency        | Helps order events and transactions                    |
| Explicitly represents clock uncertainty     | Uses logical counters to preserve ordering information |

These mechanisms solve related distributed-time problems but are not interchangeable.

## 9.3 Split vs Range vs Region vs Tablet

| Term   | Database    |
| ------ | ----------- |
| Split  | Spanner     |
| Range  | CockroachDB |
| Region | TiDB / TiKV |
| Tablet | YugabyteDB  |

All represent logical units of distributed data, but their internal implementation and management differ.

## 9.4 Stateless SQL Layer vs Storage Layer

TiDB provides a particularly clear example of separating compute and storage.

```text
TiDB = SQL Processing
TiKV = Transactional Storage
PD = Metadata and Scheduling
TiFlash = Analytical Storage
```

This allows SQL compute capacity to scale separately from storage capacity.

CockroachDB and YugabyteDB also have layered architectures, but their components and execution models differ.

## 9.5 Distributed Transactions

All four databases support distributed transactional behavior, but the transaction architecture differs.

Remember:

- Spanner uses Paxos-based replication and distributed transaction coordination.
- CockroachDB uses transaction records and intents over Raft-replicated ranges.
- TiDB uses a Percolator-inspired 2PC protocol.
- YugabyteDB uses transaction status mechanisms and provisional records across tablets.

Do not claim that all four implement the same textbook 2PC design.

---

# 10. Common Misconceptions

### Misconception 1: All NewSQL databases use Raft.

Incorrect.

Google Spanner uses Paxos-family consensus.

### Misconception 2: Spanner uses Raft internally.

Incorrect.

Spanner's replication architecture is based on Paxos.

### Misconception 3: TiDB stores data inside TiDB servers.

Incorrect.

TiDB is the SQL compute layer. TiKV stores transactional data.

### Misconception 4: PD is the storage engine in TiDB.

Incorrect.

PD manages cluster metadata, scheduling, and timestamp allocation. TiKV is the transactional storage engine.

### Misconception 5: CockroachDB has one leader for the entire cluster.

Incorrect.

Each range has its own Raft group and leadership.

### Misconception 6: CockroachDB's Raft leader and leaseholder are exactly the same concept.

Incorrect.

They are related roles with different responsibilities.

### Misconception 7: YugabyteDB is simply PostgreSQL with replication.

Incorrect.

YugabyteDB is a distributed database with its own storage layer, tablet architecture, replication, and transaction coordination.

### Misconception 8: DocDB is MongoDB.

Incorrect.

DocDB is YugabyteDB's internal storage engine. It is not MongoDB.

### Misconception 9: PostgreSQL compatibility means zero migration work.

Incorrect.

SQL syntax, extensions, transaction behavior, execution plans, and operational characteristics may differ.

### Misconception 10: Distributed SQL automatically makes every query faster.

Incorrect.

Distributed query execution and cross-node communication can increase latency.

Good partitioning and locality are still important.

---

# 11. Interview Questions and Answers

## Beginner Level

### Q1. Name four popular distributed SQL databases.

Google Spanner, CockroachDB, TiDB, and YugabyteDB.

### Q2. Which consensus algorithm does Google Spanner use?

Paxos-family consensus.

### Q3. Which databases in this chapter use Raft?

CockroachDB, TiDB through TiKV, and YugabyteDB.

### Q4. What is TrueTime?

TrueTime is Spanner's time API that provides a bounded interval for the current time, accounting for clock uncertainty.

### Q5. What is a range in CockroachDB?

A range is a contiguous interval of keys in CockroachDB's distributed key-value data.

### Q6. What is TiKV?

TiKV is TiDB's distributed transactional key-value storage engine.

### Q7. What is PD in TiDB?

Placement Driver. It manages cluster metadata, scheduling, and timestamp allocation.

### Q8. What is a tablet in YugabyteDB?

A tablet is a logical shard of table data distributed across the cluster.

### Q9. What is DocDB?

DocDB is YugabyteDB's internal distributed storage layer built on RocksDB.

## Intermediate Level

### Q10. Why does Spanner need TrueTime?

To account for clock uncertainty and support externally consistent transaction ordering across distributed machines.

### Q11. What is the difference between Spanner and CockroachDB replication?

Spanner uses Paxos-family replication, while CockroachDB uses Raft replication.

### Q12. What is the role of TiFlash?

TiFlash provides columnar storage to accelerate analytical queries.

### Q13. Why does TiDB separate compute and storage?

It allows SQL processing capacity and data storage capacity to scale independently.

### Q14. What is the difference between a Raft leader and a leaseholder in CockroachDB?

The Raft leader coordinates replicated log operations. The leaseholder holds authority to serve certain range operations, especially authoritative reads and writes.

### Q15. How does YugabyteDB prevent partially committed distributed writes from becoming visible?

It uses transaction-related provisional records or intents and transaction status information to determine whether those writes are committed.

## Advanced Level

### Q16. How does TrueTime contribute to external consistency?

It provides bounded time uncertainty. Spanner uses those bounds and commit-wait behavior to ensure that transaction timestamps respect real-time ordering requirements.

### Q17. Does a successful Raft quorum automatically commit a multi-range transaction?

No. Raft establishes replicated consensus within a group. A transaction spanning multiple groups requires distributed transaction coordination.

### Q18. Why can a CockroachDB transaction need to retry?

Concurrent transactions may conflict with the required serializable execution order. The database can return a retryable error so the transaction can be executed again safely.

### Q19. Why is TiDB's architecture different from CockroachDB's?

TiDB explicitly separates SQL compute into TiDB servers and transactional storage into TiKV, with PD providing cluster coordination. CockroachDB uses its own integrated distributed SQL and KV architecture.

### Q20. What is the difference between TiKV Regions and YugabyteDB tablets?

Both are logical units used to distribute and replicate data, but they belong to different storage architectures and have different internal management mechanisms.

### Q21. Why does YugabyteDB use a transaction status mechanism?

To coordinate transaction outcomes across tablets and allow participants to determine whether provisional writes should be committed or aborted.

### Q22. Is Spanner's TrueTime equivalent to YugabyteDB's HLC?

No. TrueTime provides bounded clock uncertainty intervals. HLC combines physical time with logical ordering information.

### Q23. What makes a distributed transaction more expensive than a local transaction?

Additional network round trips, replication acknowledgements, transaction coordination, and possible cross-region communication.

### Q24. Which database would you evaluate for an existing MySQL application?

TiDB is a natural candidate because of its MySQL protocol compatibility, but the application's exact SQL features and behavior must be validated.

### Q25. Which databases would you evaluate for a PostgreSQL-oriented application?

CockroachDB and YugabyteDB are candidates. Spanner's PostgreSQL dialect may also be relevant depending on the application's compatibility requirements.

---

# 12. Practical Exercises

## Exercise 1: Identify the Database

Match each concept with its database.

| Concept                    | Database       |
| -------------------------- | -------------- |
| TrueTime                   | Google Spanner |
| Range leases               | CockroachDB    |
| TiKV                       | TiDB           |
| Placement Driver           | TiDB           |
| Tablets                    | YugabyteDB     |
| Paxos replication          | Google Spanner |
| Raft-replicated ranges     | CockroachDB    |
| DocDB                      | YugabyteDB     |
| TiFlash                    | TiDB           |
| Transaction status tablets | YugabyteDB     |

## Exercise 2: Architecture Comparison

Draw the architecture of all four databases from memory.

Your diagram should include:

**Spanner**

- SQL processing.
- Splits.
- Paxos.
- TrueTime.

**CockroachDB**

- SQL layer.
- Distributed KV.
- Ranges.
- Raft.
- Leaseholder.

**TiDB**

- TiDB.
- TiKV.
- PD.
- Regions.
- TiFlash.

**YugabyteDB**

- YSQL.
- YB-Master.
- YB-TServer.
- DocDB.
- Tablets.
- Raft.

## Exercise 3: Choose a Database

For each scenario, identify which database you would evaluate first and explain why.

1. Existing MySQL application requiring horizontal transactional scaling.
2. Existing PostgreSQL application requiring distributed SQL.
3. Global financial application requiring strong consistency across regions.
4. Transactional application requiring separate analytical storage.

Possible starting points:

| Scenario                                      | Initial Candidate         |
| --------------------------------------------- | ------------------------- |
| MySQL compatibility                           | TiDB                      |
| PostgreSQL compatibility                      | CockroachDB or YugabyteDB |
| Global consistency                            | Spanner                   |
| Separate transactional and analytical storage | TiDB with TiFlash         |

These are starting points for evaluation, not automatic recommendations.

## Exercise 4: Understand Distributed Data

Assume:

```text
3 database nodes
3 replicas per data partition
6 logical partitions
```

Answer:

1. How many logical partitions exist?
2. How many replica copies exist in total if every partition has three replicas?
3. Can one node store multiple replicas from different partitions?
4. What happens if one node crashes?
5. What happens if two replicas of the same three-voter group become unavailable?

Expected reasoning:

- There are six logical partitions.
- There are eighteen replica copies in total.
- A node can host replicas of multiple partitions, subject to placement constraints.
- A three-voter group can retain quorum with two available voters.
- One available voter cannot form a majority quorum.

## Exercise 5: Migration Planning

Suppose your existing backend is:

```text
Node.js
Express
PostgreSQL
Redis
```

You are considering moving to a distributed SQL database.

Prepare a migration checklist covering:

- SQL compatibility.
- Data types.
- Indexes.
- Constraints.
- Transactions.
- Isolation levels.
- Query plans.
- Connection pooling.
- Retryable transaction errors.
- Backup and recovery.
- Monitoring.
- Load testing.
- Operational cost.

Do not assume that distributed SQL is automatically a better choice than a properly configured PostgreSQL deployment.

---

# 13. Final Summary

## 13.1 Four Databases at a Glance

| Database       | Core Architecture                | Consensus         | Key Concept                    |
| -------------- | -------------------------------- | ----------------- | ------------------------------ |
| Google Spanner | Distributed relational storage   | Paxos family      | TrueTime                       |
| CockroachDB    | Distributed SQL and KV           | Raft              | Ranges and leases              |
| TiDB           | Separate SQL compute and storage | Raft through TiKV | PD and Regions                 |
| YugabyteDB     | Distributed SQL over DocDB       | Raft              | Tablets and transaction status |

## 13.2 What You Must Remember

**Google Spanner**

- Globally distributed relational database.
- Uses Paxos-family replication.
- Uses TrueTime.
- Supports externally consistent transactions.
- Divides data into splits.

**CockroachDB**

- Distributed SQL database.
- Uses Raft.
- Divides data into ranges.
- Uses range leases.
- Coordinates distributed transactions through transaction records and intents.

**TiDB**

- MySQL-compatible SQL interface.
- TiDB is the SQL layer.
- TiKV is the transactional storage layer.
- PD manages metadata, scheduling, and timestamps.
- TiFlash provides analytical storage.
- Uses Raft and Percolator-inspired 2PC.

**YugabyteDB**

- PostgreSQL-compatible YSQL API.
- Also provides YCQL.
- Uses DocDB storage.
- Divides data into tablets.
- Uses Raft replication.
- Uses transaction status mechanisms and provisional records for distributed transactions.

## 13.3 The Most Important Mental Model

Do not memorize these databases as four unrelated products.

Understand them through five architectural questions:

1. **SQL layer:** How does the application send queries?
2. **Data distribution:** How is the database divided across nodes?
3. **Replication:** How are multiple copies maintained?
4. **Consensus:** How do replicas agree on committed operations?
5. **Transactions:** How does the database coordinate atomic operations across partitions?

If you can answer these five questions for each database, you understand the core of its distributed SQL architecture.
