---
sidebar_label: NewSQL Databases: Fundamentals
sidebar_position: 1
---

# NewSQL Databases: Fundamentals

## 1. Introduction: Why Do We Need NewSQL?

Before understanding NewSQL, let's revisit the database technologies we have studied.

### Traditional relational databases

Examples:

- PostgreSQL
- MySQL
- Microsoft SQL Server
- Oracle Database

They provide:

- Relational data modeling.
- SQL queries.
- ACID transactions.
- Constraints and relationships.
- Strong transactional guarantees.

However, scaling a traditional relational database across multiple machines can be challenging.

For example, suppose an e-commerce application grows significantly.

Initially, one PostgreSQL server handles:

- Customers.
- Orders.
- Payments.
- Inventory.

As traffic grows, we can scale vertically by adding more CPU, RAM, and storage.

But vertical scaling has limits.

We can also use replication to distribute reads, but replication alone does not distribute write transactions across multiple independent database nodes.

Sharding can distribute data across multiple servers, but it introduces application and operational complexity.

### NoSQL databases

Examples:

- MongoDB
- Cassandra
- Redis
- DynamoDB

Many NoSQL databases were designed with distributed operation and horizontal scaling as important architectural goals.

They can provide:

- Horizontal scaling.
- Distributed data storage.
- High availability.
- Flexible data models.
- Distributed partitioning.

However, NoSQL systems vary significantly in their query languages, transaction capabilities, consistency models, and data modeling approaches.

Some support strong transactional guarantees, including multi-document or multi-record transactions.

Therefore, it is incorrect to assume that all NoSQL databases sacrifice transactions or consistency for scalability.

### The challenge

Businesses often want both:

1. SQL and relational database capabilities.
2. Horizontal scaling across multiple machines.

This is the problem space that NewSQL systems aim to address.

---

## 2. What Is NewSQL?

**NewSQL** is a category of modern relational database systems designed to provide SQL and ACID transactional capabilities while supporting distributed, horizontally scalable architectures.

The central objective is to combine:

- Relational data modeling.
- SQL query support.
- ACID transactions.
- Distributed architecture.
- Horizontal scaling.
- High availability.

Traditional relational databases are often optimized around a primary database server, with additional infrastructure for replication or sharding.

NewSQL systems are designed to distribute database responsibilities across multiple nodes as a fundamental part of their architecture.

### Basic definition

NewSQL = Relational SQL capabilities + Distributed architecture + ACID transactions.

This is a simplified conceptual definition, not a guarantee that every NewSQL product implements every feature identically.

### Conceptual architecture

<text id="a">Traditional relational database</text>

```text
             APPLICATION
                  |
                  v
           RELATIONAL DATABASE
              PostgreSQL
                  |
          +-------+-------+
          |               |
          v               v
        CPU             Storage
```

A traditional relational database can be scaled vertically and can use replication and external sharding architectures.

<text id="b">NewSQL database</text>

```text
               APPLICATION
                    |
                    v
              SQL INTERFACE
                    |
                    v
            DISTRIBUTED DATABASE
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Node A    Node B    Node C
          |         |         |
          v         v         v
        Data      Data      Data
       Storage   Storage   Storage
          |         |         |
          +---------+---------+
                    |
                    v
          DISTRIBUTED TRANSACTIONS
```

The distributed database coordinates data and transactions across multiple nodes.

The actual architecture varies by product. Some distribute data automatically, while others require particular partitioning or deployment choices.

---

## 3. Why Was NewSQL Introduced?

Let's understand the problem using a practical example.

Imagine an e-commerce application with:

- 20 million customers.
- 100 million orders.
- High concurrent checkout traffic.
- Multiple application servers.
- Users accessing the application from different geographical regions.

The application needs:

- SQL queries.
- Transactions.
- Referential integrity.
- Consistent inventory updates.
- Horizontal scaling.
- High availability.

### Option 1: Traditional relational database

Use PostgreSQL.

Advantages:

- Mature relational database.
- ACID transactions.
- Powerful SQL.
- Constraints and indexes.
- Mature ecosystem.

Challenges at very large scale:

- A single primary can become a write bottleneck.
- Vertical scaling has practical limits.
- Read replicas do not automatically distribute writes.
- Horizontal sharding introduces routing and coordination complexity.

These are scaling challenges, not proof that PostgreSQL cannot scale. PostgreSQL can be distributed through sharding architectures, extensions, and managed platforms.

### Option 2: NoSQL database

Use MongoDB or Cassandra, depending on the workload.

Advantages:

- Distributed architecture options.
- Horizontal scaling.
- Flexible partitioning.
- High availability.

Potential considerations:

- Data modeling may differ from relational normalization.
- Cross-partition operations can be more expensive.
- Transaction and consistency semantics depend on the specific product.

Again, modern NoSQL systems can support transactions and strong consistency. The capabilities must be evaluated individually.

### Option 3: NewSQL database

Use a distributed SQL database.

Potential advantages:

- SQL interface.
- Relational model.
- Transactional guarantees.
- Distributed data storage.
- Horizontal scaling.

The objective is to reduce the gap between traditional relational databases and distributed database architectures.

---

## 4. Traditional SQL vs NoSQL vs NewSQL

This comparison is central to understanding NewSQL.

| Feature                  | Traditional SQL                           | NoSQL                                                                      | NewSQL                                            |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| Data model               | Relational                                | Document, key-value, wide-column, graph, etc.                              | Relational                                        |
| Query language           | SQL                                       | Product-specific APIs or query languages; some support SQL-like interfaces | SQL                                               |
| Schema                   | Usually predefined relational schema      | Depends on database                                                        | Relational schema                                 |
| Transactions             | Commonly ACID                             | Varies; many support transactions                                          | Designed to support ACID transactions             |
| Horizontal scaling       | Often requires additional architecture    | Commonly a core design capability                                          | A core design goal                                |
| Distributed architecture | Varies                                    | Commonly distributed                                                       | Distributed                                       |
| Joins                    | Native relational joins                   | Varies by database                                                         | SQL joins, subject to distributed execution costs |
| Consistency              | Depends on configuration and architecture | Varies                                                                     | Commonly strong transactional consistency         |
| Examples                 | PostgreSQL, MySQL                         | MongoDB, Cassandra, Redis                                                  | Spanner, CockroachDB, TiDB, YugabyteDB            |

### Important clarification

These categories overlap in modern systems.

For example:

- PostgreSQL can be distributed using extensions or external sharding.
- MongoDB supports multi-document ACID transactions.
- Cassandra supports lightweight transactions for selected operations.
- Some NoSQL systems provide strong consistency.
- Some NewSQL systems have product-specific limitations on SQL features or transaction behavior.

Do not classify a database solely by whether it supports transactions or horizontal scaling.

---

## 5. Core Characteristics of NewSQL

NewSQL systems generally aim to provide the following capabilities.

### 5.1 Relational data model

NewSQL systems support relational tables.

Example:

**customers**

| customer_id | name | email            |
| ----------- | ---- | ---------------- |
| 101         | Amit | amit@example.com |
| 102         | Ravi | ravi@example.com |

**orders**

| order_id | customer_id | amount |
| -------- | ----------- | -----: |
| 501      | 101         |   2500 |
| 502      | 102         |   1500 |

Relationships can be represented through keys.

### 5.2 SQL support

Applications can use SQL to query relational data.

Example:

```sql
SELECT
    c.name,
    o.order_id,
    o.amount
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id;
```

This is one of the major advantages for developers already familiar with relational databases.

However, SQL compatibility differs between products. Some support PostgreSQL wire protocol compatibility, while others implement different SQL dialects or subsets.

### 5.3 ACID transactions

NewSQL systems aim to preserve transactional correctness across distributed infrastructure.

For example, transferring money between accounts requires both updates to succeed or neither to take effect.

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 101;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 102;

COMMIT;
```

A correct implementation must prevent the transfer from leaving the system in a partially updated state.

In a distributed database, the accounts might be stored on different nodes.

The database must coordinate the transaction across those nodes.

This is significantly more complex than updating two rows stored on the same database server.

### 5.4 Horizontal scaling

Horizontal scaling means increasing capacity by adding more machines.

Conceptually:

```text
          DISTRIBUTED DATABASE
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
          |        |        |
          v        v        v
        Data     Data     Data
```

Data can be distributed across nodes or partitions.

The system coordinates queries and transactions that access distributed data.

### 5.5 High availability

A NewSQL system commonly uses replication so that data is available even if a node fails.

For example:

```text
             DATA PARTITION
                   |
          +--------+--------+
          |        |        |
          v        v        v
       Replica  Replica  Replica
          A        B        C
```

If a node becomes unavailable, the system may continue operating using the remaining replicas, provided the required quorum and availability conditions are satisfied.

Replication, consensus, leader election, and failure recovery are major architectural topics. We will cover them in Part 18B.

### 5.6 Distributed query execution

A query may access data stored on multiple nodes.

The database must:

1. Parse the SQL query.
2. Build an execution plan.
3. Identify which nodes contain relevant data.
4. Execute work on those nodes.
5. Combine intermediate results.
6. Return the final result.

The complexity of this process depends on how the data is partitioned and how the query is written.

---

## 6. How NewSQL Solves the Traditional Scaling Problem

Let's compare three approaches.

### 6.1 Traditional relational database scaling

```text
             APPLICATION
                  |
                  v
            PRIMARY DATABASE
                  |
          +-------+-------+
          |               |
          v               v
       Read 1           Read 2
       Replica          Replica
```

This architecture can distribute read traffic.

However, writes still generally go through the primary in a standard primary-replica architecture.

### 6.2 Application-managed sharding

Suppose we divide customer data across three PostgreSQL servers.

```text
             APPLICATION
                  |
             SHARD ROUTER
                  |
        +---------+---------+
        |         |         |
        v         v         v
     Shard A   Shard B   Shard C
     Users     Users     Users
     1-1000    1001-2000 2001-3000
```

The application or routing layer must determine which shard contains the required data.

Challenges include:

- Shard routing.
- Cross-shard queries.
- Distributed transactions.
- Rebalancing.
- Global uniqueness.
- Consistency.
- Operational complexity.

### 6.3 NewSQL approach

A distributed SQL database manages data distribution and coordination as part of the database architecture.

```text
              APPLICATION
                   |
                   v
                SQL API
                   |
                   v
           DISTRIBUTED SQL LAYER
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
          |        |        |
          +--------+--------+
                   |
             DATA DISTRIBUTION
             AND COORDINATION
```

The application can often interact with the database through a SQL interface without manually choosing the physical node for every record.

However, automatic distribution does not eliminate the need for good data modeling, partition-key design, or distributed query awareness.

---

## 7. NewSQL and Distributed Transactions

This is one of the most important concepts.

In a traditional single-node relational database, a transaction can update multiple records within one database instance.

In a distributed database, related records may live on different nodes.

### Example: Bank transfer

Suppose:

- Account A is stored on Node 1.
- Account B is stored on Node 2.

A customer transfers ₹1,000 from Account A to Account B.

```text
             TRANSFER ₹1,000
                    |
          +---------+---------+
          |                   |
          v                   v
      ACCOUNT A           ACCOUNT B
        Node 1              Node 2
          |                   |
          v                   v
      Deduct 1000          Add 1000
          |                   |
          +---------+---------+
                    |
                    v
           TRANSACTION RESULT
```

The database must ensure that:

- Both changes commit, or
- Neither change commits.

Otherwise, money could disappear or be created incorrectly.

### Why is this difficult?

Because distributed systems can experience:

- Network delays.
- Node failures.
- Lost messages.
- Partial execution.
- Leader changes.
- Replication delays.

The database must coordinate transaction outcomes even when nodes cannot communicate reliably.

Distributed transaction protocols and consensus mechanisms are covered in Part 18B.

### Important distinction

A distributed SQL database does not make network failures disappear.

It provides mechanisms to coordinate transactions and recover from failures, but these mechanisms introduce latency, coordination costs, and operational tradeoffs.

---

## 8. NewSQL vs Manual Sharding

NewSQL is often discussed as an alternative to manually sharding a traditional relational database.

Let's understand the difference.

### Manual sharding

Suppose a PostgreSQL application has three shards.

The application determines where a customer's data belongs.

```javascript
function getShard(customerId) {
  if (customerId <= 100000) {
    return "shardA";
  }

  if (customerId <= 200000) {
    return "shardB";
  }

  return "shardC";
}
```

This is only a simplified illustration.

In production, shard routing must handle partition boundaries, resharding, failures, and query routing.

The application or middleware may need to manage:

- Shard selection.
- Connection management.
- Cross-shard joins.
- Distributed transactions.
- Data migration.
- Rebalancing.

### NewSQL

A distributed SQL database may manage partition placement and routing internally.

The application sends SQL to the database system.

The database determines which nodes must participate.

### Comparison

| Feature                  | Manual sharding                                       | NewSQL                               |
| ------------------------ | ----------------------------------------------------- | ------------------------------------ |
| Data distribution        | Application or external middleware                    | Commonly database-managed            |
| Query routing            | Application or router                                 | Distributed SQL layer                |
| Cross-shard queries      | Requires explicit architecture                        | Supported to varying degrees         |
| Distributed transactions | Additional implementation or middleware may be needed | Often built into the database        |
| Rebalancing              | Operational responsibility                            | Often automated or database-managed  |
| Complexity               | Can be high at application level                      | Shifted into database infrastructure |
| Control                  | More application-level control                        | More database-managed behavior       |

**Important:** NewSQL does not eliminate all sharding concerns. Data locality, partitioning, hot spots, and cross-partition transactions still matter.

---

## 9. NewSQL Architecture: A High-Level View

A typical distributed SQL system can contain the following logical components.

```text
                 APPLICATION
                      |
                      v
                  SQL CLIENT
                      |
                      v
               SQL GATEWAY / NODE
                      |
                      v
                QUERY PLANNER
                      |
                      v
             DISTRIBUTED EXECUTOR
                      |
           +----------+----------+
           |          |          |
           v          v          v
        Node A     Node B     Node C
           |          |          |
           v          v          v
       Partition   Partition   Partition
           |          |          |
           +----------+----------+
                      |
                      v
             REPLICATION LAYER
                      |
                      v
             CONSENSUS PROTOCOL
```

This is a conceptual architecture. The components may be combined or implemented differently across products.

### Component responsibilities

| Component            | Responsibility                               |
| -------------------- | -------------------------------------------- |
| SQL interface        | Accepts SQL queries and database connections |
| Query planner        | Creates an execution plan                    |
| Distributed executor | Coordinates query execution across nodes     |
| Data partitioning    | Divides data into distributed units          |
| Replication layer    | Maintains copies of data                     |
| Consensus protocol   | Coordinates agreement among replicas         |
| Transaction manager  | Coordinates transactional operations         |
| Storage engine       | Stores and retrieves records                 |

We will examine these components in more detail in Part 18B.

---

## 10. NewSQL Database Examples

Several well-known distributed SQL databases are commonly associated with NewSQL.

### 10.1 Google Spanner

<AsyncImage query="Google Cloud Spanner distributed database architecture diagram" aspectRatio="16:9" width="100%" />

**Google Spanner** is a globally distributed relational database system.

Important characteristics:

- Relational data model.
- SQL support.
- Distributed data storage.
- Strong consistency.
- Synchronous replication through distributed coordination.
- Globally distributed deployment options.

Spanner is particularly notable for its use of TrueTime, a time API that exposes bounded uncertainty in clock time and helps support globally consistent transaction ordering.

We will explore its architecture later.

### 10.2 CockroachDB

<AsyncImage query="CockroachDB distributed SQL architecture nodes ranges diagram" aspectRatio="16:9" width="100%" />

**CockroachDB** is a distributed SQL database inspired by the goal of providing a scalable, resilient relational database.

Important characteristics:

- SQL interface with PostgreSQL compatibility.
- Distributed data storage.
- Automatic replication and rebalancing capabilities.
- ACID transactions.
- Strongly consistent distributed operations.

### 10.3 TiDB

<AsyncImage query="TiDB distributed SQL architecture TiDB TiKV Placement Driver diagram" aspectRatio="16:9" width="100%" />

**TiDB** is an open-source distributed SQL database.

Important architectural characteristics:

- MySQL protocol and SQL compatibility.
- Distributed SQL processing.
- Distributed storage through TiKV.
- Placement Driver for cluster coordination and scheduling.
- Distributed transactions.

TiDB separates SQL processing from its distributed storage layer.

### 10.4 YugabyteDB

<AsyncImage query="YugabyteDB distributed SQL architecture YSQL YB-TServer YB-Master diagram" aspectRatio="16:9" width="100%" />

**YugabyteDB** is a distributed SQL database with PostgreSQL-compatible and Cassandra-compatible API options.

Important characteristics:

- Distributed data storage.
- PostgreSQL-compatible YSQL interface.
- Distributed transactions.
- Replication and fault tolerance.
- Horizontal scaling.

### Comparison

| Database       | SQL compatibility                                        | Architectural highlights                           |
| -------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Google Spanner | GoogleSQL and PostgreSQL dialect options                 | Globally distributed relational database, TrueTime |
| CockroachDB    | PostgreSQL wire protocol and SQL compatibility           | Distributed SQL, ranges, replication               |
| TiDB           | MySQL compatibility                                      | Separate SQL and distributed storage layers        |
| YugabyteDB     | PostgreSQL-compatible YSQL and Cassandra-compatible YCQL | Distributed storage and transaction coordination   |

The products differ in their supported SQL features, deployment models, transaction behavior, performance characteristics, and operational requirements.

---

## 11. When Should We Consider NewSQL?

NewSQL is not the right choice for every application.

Consider it when the workload requires several of the following:

### 11.1 Large-scale transactional workloads

Your application processes a large number of transactions and needs to distribute storage and processing across multiple nodes.

Examples:

- Banking platforms.
- Large e-commerce systems.
- Payment infrastructure.
- Global SaaS applications.

### 11.2 Horizontal scaling with SQL

You want to distribute data across nodes while keeping a relational SQL interface.

### 11.3 Strong transactional guarantees

Your application needs ACID transactions across distributed data.

Examples:

- Money transfers.
- Inventory reservation.
- Order and payment state changes.
- Financial ledgers.

### 11.4 High availability

The database must continue operating despite individual node failures, subject to the configured replication and quorum requirements.

### 11.5 Geographical distribution

Your application serves users across multiple regions and has requirements around data placement, availability, and latency.

Not every NewSQL product is designed for global deployment in the same way.

---

## 12. When Should You NOT Use NewSQL?

NewSQL introduces distributed-system complexity.

It is not automatically better than PostgreSQL or MySQL.

Avoid introducing it without a concrete requirement.

### Scenario 1: Small application

If your application has moderate traffic and one PostgreSQL instance meets performance requirements, NewSQL may add unnecessary complexity.

### Scenario 2: Simple CRUD application

If the workload consists of ordinary CRUD operations with manageable data volume, a traditional relational database may be sufficient.

### Scenario 3: No horizontal scaling requirement

If vertical scaling, read replicas, and existing optimizations are sufficient, moving to a distributed SQL system may not provide enough value.

### Scenario 4: Latency-sensitive single-region operations

Distributed transactions can introduce network coordination overhead.

If all important data is local and a single-node database meets the requirements, a distributed database may increase latency unnecessarily.

### Scenario 5: Limited operational expertise

Distributed databases require understanding:

- Replication.
- Consensus.
- Network partitions.
- Quorum.
- Transaction retries.
- Distributed query execution.
- Hot spots.
- Rebalancing.

If the team cannot operate and troubleshoot these systems, adopting one prematurely can create more problems than it solves.

---

## 13. NewSQL Tradeoffs

| Advantage                     | Tradeoff                                          |
| ----------------------------- | ------------------------------------------------- |
| SQL interface                 | SQL compatibility differs by product              |
| Relational model              | Distributed joins may be expensive                |
| ACID transactions             | Distributed coordination adds overhead            |
| Horizontal scaling            | Data distribution requires careful design         |
| High availability             | Replication and quorum affect write availability  |
| Distributed storage           | Network communication is unavoidable              |
| Automatic rebalancing         | Rebalancing consumes resources                    |
| Multi-region support          | Geographic latency and consistency tradeoffs      |
| Familiar developer experience | Operational behavior differs from single-node SQL |

### Important principle

A distributed SQL database does not provide unlimited performance simply by adding nodes.

Some operations can scale well when data is distributed appropriately.

Other operations may require cross-node communication, coordination, or data movement.

The performance depends on:

- Data distribution.
- Transaction boundaries.
- Query patterns.
- Network latency.
- Replication strategy.
- Partition-key selection.
- Hotspot behavior.

---

## 14. Practical Example: E-Commerce Database Selection

Suppose you are building an e-commerce application.

### Initial architecture

```text
             NODE.JS / EXPRESS
                    |
                    v
                POSTGRESQL
                    |
          +---------+---------+
          |         |         |
          v         v         v
       Users      Orders   Payments
```

This is a reasonable starting architecture.

As the application grows:

- Traffic increases.
- The number of transactions grows.
- The database becomes a bottleneck.
- More storage is required.
- The application needs higher availability.

You first consider:

1. Query optimization.
2. Indexing.
3. Connection pooling.
4. Vertical scaling.
5. Read replicas.
6. Caching.

If the system still needs distributed transactional write capacity, you evaluate sharding or distributed SQL.

### Distributed SQL architecture

```text
               NODE.JS / EXPRESS
                       |
                       v
                DISTRIBUTED SQL
                       |
            +----------+----------+
            |          |          |
            v          v          v
          Node A     Node B     Node C
            |          |          |
            v          v          v
         Orders     Payments   Customers
```

The database distributes data and coordinates operations across nodes.

The application can continue using SQL, subject to the database's supported SQL interface and compatibility.

### Important decision

Do not migrate to NewSQL just because the application has millions of users.

The relevant questions are:

- What is the actual database bottleneck?
- Is the write workload too large for the current architecture?
- Can vertical scaling solve the problem?
- Are read replicas sufficient?
- Can application-managed sharding meet requirements?
- Do we need distributed ACID transactions?
- Can the team operate a distributed database reliably?

Choose based on measured constraints, not database popularity.

---

## 15. Common Misconceptions

### Misconception 1: NewSQL means a completely new SQL language.

Incorrect.

NewSQL generally refers to database architecture and capabilities, not a new standardized query language.

### Misconception 2: NewSQL is NoSQL with SQL syntax.

Incorrect.

NewSQL systems are relational databases with distributed architectures. Their data models and transactional behavior are designed around relational processing.

### Misconception 3: NoSQL databases do not support transactions.

Incorrect.

Many NoSQL databases support transactions. Their capabilities and semantics vary by product.

### Misconception 4: NewSQL removes the need for sharding.

Not entirely.

NewSQL systems often manage data distribution internally, but partitioning and data placement still exist.

### Misconception 5: NewSQL is always faster than PostgreSQL.

Incorrect.

Performance depends on workload, deployment, data distribution, network communication, and query patterns.

A single-node PostgreSQL deployment can outperform a distributed database for small or local workloads.

### Misconception 6: Adding nodes always improves performance.

Incorrect.

Distributed coordination, cross-node queries, and hotspots can limit scalability.

### Misconception 7: ACID transactions are impossible in distributed databases.

Incorrect.

Distributed databases can provide ACID transactions, but they require coordination protocols and incur associated costs.

---

## 16. Interview Questions

### Beginner level

**Q1. What is NewSQL?**

NewSQL is a category of relational database systems designed to provide SQL and ACID transactions while supporting distributed, horizontally scalable architectures.

**Q2. Why was NewSQL introduced?**

It addresses the need to combine relational database capabilities with distributed horizontal scaling.

**Q3. What is the main difference between traditional SQL and NewSQL?**

Traditional relational databases are commonly deployed around a primary database server, whereas NewSQL systems are designed to distribute database responsibilities across multiple nodes.

**Q4. Does NewSQL support ACID transactions?**

Yes. Supporting ACID transactional behavior is a central design goal of NewSQL systems.

**Q5. Does NewSQL support SQL?**

Yes, although SQL compatibility and supported features differ between products.

### Intermediate level

**Q6. How does NewSQL support horizontal scaling?**

It distributes data and query processing across multiple nodes and coordinates operations through distributed database components.

**Q7. How is NewSQL different from NoSQL?**

NewSQL focuses on relational data models, SQL, and transactional guarantees with distributed architecture. NoSQL includes multiple non-relational data models and different consistency and transaction designs.

**Q8. What is the main challenge with distributed transactions?**

The database must coordinate operations across nodes despite network latency, failures, and partial execution.

**Q9. Does NewSQL eliminate manual sharding?**

It can reduce application-managed sharding by managing data distribution internally, but partitioning and data locality still matter.

**Q10. Name some NewSQL databases.**

Google Spanner, CockroachDB, TiDB, and YugabyteDB.

### Advanced level

**Q11. Why can distributed transactions be slower than single-node transactions?**

They may require network communication, replication, coordination, and consensus among multiple nodes.

**Q12. What is the role of replication in NewSQL?**

Replication maintains multiple copies of data to improve fault tolerance and availability.

**Q13. What is the role of consensus?**

Consensus protocols coordinate agreement among participating replicas about operations or replicated state.

**Q14. Why is a distributed SQL database not automatically faster than PostgreSQL?**

Because network communication, distributed coordination, cross-node queries, and replication introduce overhead.

**Q15. What factors should influence the decision to adopt NewSQL?**

Transaction volume, write scaling, availability, consistency requirements, geographic distribution, operational complexity, and measured limitations of the existing architecture.

---

## 17. Practical Exercises

### Exercise A: Database selection

Choose a suitable direction for each scenario and explain why.

| Scenario                                                | Traditional SQL / NoSQL / NewSQL |
| ------------------------------------------------------- | -------------------------------- |
| Small blog application                                  |                                  |
| High-volume banking transaction platform                |                                  |
| Flexible product catalog                                |                                  |
| Globally distributed financial platform                 |                                  |
| Large-scale event analytics                             |                                  |
| SaaS application requiring distributed SQL transactions |                                  |
| Simple CRUD application                                 |                                  |

There may be multiple valid answers. Justify your selection using workload requirements.

### Exercise B: Architecture

Design a system with:

- Node.js backend.
- SQL interface.
- Three database nodes.
- Distributed data storage.
- Replication.
- Transaction coordination.

Explain how an order transaction is processed if the order and inventory records are on different nodes.

### Exercise C: Compare architectures

Explain the differences between:

1. PostgreSQL with read replicas.
2. PostgreSQL with application-managed sharding.
3. A distributed SQL database.

For each, discuss:

- Write scaling.
- Read scaling.
- Transaction handling.
- Data distribution.
- Operational complexity.

---

## 18. Chapter Summary

| Concept                  | Key takeaway                                    |
| ------------------------ | ----------------------------------------------- |
| NewSQL                   | Distributed relational database architecture    |
| Main objective           | SQL + ACID + horizontal scaling                 |
| Relational model         | Tables, relationships, constraints              |
| SQL support              | Query interface for relational data             |
| ACID                     | Transactional correctness                       |
| Horizontal scaling       | Adding nodes to increase capacity               |
| Replication              | Maintaining copies of data                      |
| Distributed transactions | Coordinating operations across nodes            |
| Consensus                | Coordinating agreement among replicas           |
| Sharding                 | Distributing data across partitions             |
| Distributed SQL          | Executing SQL across distributed infrastructure |
| Tradeoff                 | Coordination and network overhead               |
| Examples                 | Spanner, CockroachDB, TiDB, YugabyteDB          |

### Final mental model

```text
              TRADITIONAL SQL
                     |
              Relational Model
                     |
              SQL + ACID
                     |
              Primary Database
                     |
              Scaling Challenges


                 NEWSQL
                    |
             Relational Model
                    |
               SQL + ACID
                    |
          Distributed Architecture
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Node A    Node B    Node C
          |         |         |
          +---------+---------+
                    |
           Distributed Transactions
                    |
             Horizontal Scaling
```

**The central principle:**

NewSQL aims to combine the relational capabilities and transactional guarantees of traditional SQL databases with the horizontal scalability and distributed architecture required by large-scale applications.

It does not remove distributed-system complexity. It moves much of that complexity into the database architecture.
