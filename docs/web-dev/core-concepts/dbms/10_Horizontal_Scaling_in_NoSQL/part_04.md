---
sidebar_label: SQL Sharding vs NoSQL Partitioning
sidebar_position: 1
---

# SQL Sharding vs NoSQL Partitioning

## 1. Introduction

In the previous sections, we studied:

- Nodes and partitions.
- Horizontal scaling in NoSQL databases.
- Range-based, hash-based, list-based, and directory-based partitioning.
- Partition keys, shard keys, and hot partitions.

Now we need to understand an important architectural difference:

**How do relational SQL databases and NoSQL databases distribute data across multiple machines?**

Both SQL and NoSQL databases can distribute data horizontally. However, their architecture, built-in capabilities, and operational complexity can be quite different.

A common misconception is:

```text
SQL  = Vertical Scaling
NoSQL = Horizontal Scaling
```

This is incorrect.

Relational databases can also scale horizontally through:

- Application-level sharding.
- Native distributed database architectures.
- Replication.
- Partitioning combined with distributed infrastructure.

Similarly, not every NoSQL database automatically scales horizontally.

The important difference is how the database handles distribution, routing, transactions, consistency, and coordination.

---

## 2. First, Understand the Terminology

Before comparing SQL and NoSQL, we need to distinguish three concepts.

### 2.1 Table partitioning

Table partitioning divides one logical table into smaller physical or logical pieces.

Example:

```sql
CREATE TABLE orders (
    order_id BIGINT,
    user_id BIGINT,
    total NUMERIC(12, 2),
    created_at TIMESTAMP
)
PARTITION BY RANGE (created_at);
```

We can create monthly partitions:

```sql
CREATE TABLE orders_2026_01
PARTITION OF orders
FOR VALUES FROM ('2026-01-01')
TO ('2026-02-01');

CREATE TABLE orders_2026_02
PARTITION OF orders
FOR VALUES FROM ('2026-02-01')
TO ('2026-03-01');
```

Conceptually:

```text
                 Orders Table
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       January     February     March
       Partition   Partition   Partition
```

The application can query the logical parent table:

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-02-01'
  AND created_at < '2026-03-01';
```

PostgreSQL can use partition pruning to avoid scanning irrelevant partitions when the query permits it.

**Important:** Table partitioning does not automatically distribute data across multiple database servers. These partitions may all exist on the same PostgreSQL instance.

### 2.2 Sharding

Sharding divides data across multiple independent database instances or servers.

Example:

```text
                 Application
                      |
               Shard Router
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       Shard A     Shard B     Shard C
       Database    Database    Database
```

Each shard stores a subset of the overall dataset.

For example:

```text
Shard A → Users 1–1 Million
Shard B → Users 1–2 Million
Shard C → Users 2–3 Million
```

The exact distribution depends on the sharding strategy.

Sharding is a form of horizontal data distribution.

### 2.3 Native distributed partitioning

Some distributed databases manage data placement and routing internally.

The database may:

- Divide data into partitions.
- Assign partitions to nodes.
- Replicate partitions.
- Route queries.
- Move partitions when nodes are added or removed.

The application may interact with the database through a cluster endpoint instead of managing individual shards.

### 2.4 Comparison

| Concept                         | Meaning                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Table partitioning              | Divides a table into smaller pieces, potentially within one database instance |
| Sharding                        | Distributes data across multiple database instances or servers                |
| Native distributed partitioning | Database-managed partition placement and routing across nodes                 |

**Key distinction:** Partitioning is about dividing data. Sharding is about distributing data across separate database servers. A distributed database can implement sharding internally.

---

## 3. How Traditional SQL Databases Usually Scale

Consider a traditional PostgreSQL deployment.

Initially:

```text
             Application
                  |
                  v
           PostgreSQL Server
                  |
                  v
             All Tables
```

The database runs on one server.

As traffic grows, we can scale vertically:

```text
PostgreSQL Server

CPU: 4 cores  → 16 cores
RAM: 16 GB    → 64 GB
Storage: 500 GB → 2 TB
```

This is relatively straightforward.

But eventually, one server may become insufficient or too expensive.

What happens then?

We need to distribute the workload.

Traditional relational database architectures often introduce additional infrastructure to accomplish this.

---

## 4. SQL Table Partitioning vs SQL Sharding

These two concepts are frequently confused.

### 4.1 SQL table partitioning

Suppose a PostgreSQL database contains 100 million orders.

We partition the table by year:

```text
             PostgreSQL Instance
                      |
                  Orders Table
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        2024        2025        2026
      Partition   Partition   Partition
```

All partitions can still reside on the same database server.

Benefits:

- Partition pruning.
- Easier retention management.
- Smaller indexes per partition.
- Improved maintenance for some workloads.
- Better organization of large tables.

But the CPU, memory, and storage are still constrained by that database instance.

### 4.2 SQL sharding

Now imagine three independent PostgreSQL instances.

```text
                  Application
                       |
                  Shard Router
                       |
          +------------+------------+
          |            |            |
          v            v            v
       PostgreSQL  PostgreSQL  PostgreSQL
       Shard A     Shard B     Shard C
```

Each database stores a portion of the users or orders.

Benefits:

- Distributes storage across machines.
- Distributes write workload.
- Allows independent database capacity.
- Can support horizontal scaling.

However, the application or distributed database infrastructure must handle routing and coordination.

### Comparison

| Feature                   | SQL Table Partitioning                                                | SQL Sharding                         |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| Data distribution         | Within a logical table                                                | Across database instances            |
| Multiple servers required | No                                                                    | Yes                                  |
| Routing                   | Usually handled by the database                                       | Requires shard routing               |
| Storage expansion         | Limited by underlying server unless storage is separately distributed | Across multiple servers              |
| Cross-partition queries   | Usually handled within one database                                   | May require distributed coordination |
| Operational complexity    | Relatively lower                                                      | Higher                               |

---

## 5. How SQL Sharding Works

Traditional relational databases do not all provide automatic distributed sharding in the same way.

A common approach is application-level sharding.

### 5.1 Example: E-commerce application

Suppose we have three PostgreSQL databases:

```text
Shard A
Shard B
Shard C
```

We decide to distribute users according to `userId`.

A simple routing rule:

```javascript
function getShard(userId) {
  const shardNumber = userId % 3;

  return databaseConnections[shardNumber];
}
```

Illustrative mapping:

```text
userId % 3

0 → Shard A
1 → Shard B
2 → Shard C
```

When a request arrives:

```javascript
const userId = 1050;

const shard = getShard(userId);

const user = await shard.query("SELECT * FROM users WHERE user_id = $1", [
  userId,
]);
```

The application determines the destination database before executing the query.

### 5.2 Architecture

```text
                  Node.js API
                       |
                       v
                 Shard Router
                       |
              Calculate Shard
                       |
          +------------+------------+
          |            |            |
          v            v            v
       PostgreSQL  PostgreSQL  PostgreSQL
       Shard A     Shard B     Shard C
```

### 5.3 Advantages

- Can distribute relational data across servers.
- Each shard can operate on its own subset.
- Can increase storage and write capacity.
- Allows independent hardware scaling.
- Preserves relational database capabilities within each shard.

### 5.4 Disadvantages

- Application-level routing becomes complex.
- Cross-shard JOINs are difficult.
- Cross-shard transactions need coordination.
- Global unique IDs need a strategy.
- Rebalancing requires careful data movement.
- Foreign keys generally cannot enforce relationships across independent database servers.

**Important:** PostgreSQL supports table partitioning and replication, but ordinary PostgreSQL installations do not automatically become a transparent, fully distributed sharded database merely by creating multiple servers.

---

## 6. How NoSQL Databases Commonly Scale Horizontally

Many NoSQL databases are designed around distributed data placement.

They commonly provide mechanisms for:

- Partitioning data.
- Assigning partitions to nodes.
- Replicating partitions.
- Routing requests.
- Managing node membership.
- Rebalancing data.

Consider a distributed NoSQL cluster:

```text
                  Application
                       |
                       v
                 Database Router
                       |
          +------------+------------+
          |            |            |
          v            v            v
        Node A       Node B       Node C
          |            |            |
          v            v            v
      Partition 1  Partition 2  Partition 3
```

The database manages partition placement according to its internal architecture.

The application usually works with a logical collection, table, or keyspace.

### Example: Cassandra

Cassandra uses:

- Partition keys.
- Token calculation.
- Token ranges.
- Replication strategies.
- Distributed request coordination.

The partition key determines the token associated with a partition.

The token determines its position in the cluster's token space.

### Example

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);
```

Here, `user_id` is the partition key.

Cassandra uses it to determine partition placement.

The application does not normally need to calculate a database shard number itself.

The Cassandra cluster manages token ownership and request routing.

---

## 7. SQL vs NoSQL: How Data Distribution Differs

Let's compare the common approaches.

### Traditional SQL sharding

```text
                Application
                     |
                Shard Router
                     |
          +----------+----------+
          |          |          |
          v          v          v
       SQL DB A   SQL DB B   SQL DB C
```

The application or middleware may need to know which database contains the required record.

### NoSQL distributed partitioning

```text
                Application
                     |
                     v
             Database Cluster
                     |
              Partition Router
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
```

The database may manage partition metadata and routing internally.

### Comparison

| Feature      | Traditional SQL Sharding                                                     | Distributed NoSQL                                         |
| ------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Partitioning | Often application or middleware managed                                      | Often database-managed                                    |
| Routing      | Application or shard router                                                  | Database driver, router, or coordinator                   |
| Data model   | Relational                                                                   | Document, key-value, wide-column, etc.                    |
| JOINs        | Strong relational support within a database; cross-shard joins are complex   | Depends on database; often modeled around access patterns |
| Transactions | Strong local ACID support; distributed transactions require coordination     | Varies by database                                        |
| Replication  | Supported by many relational databases                                       | Commonly integrated into cluster architecture             |
| Scaling      | Possible, but distributed architecture may require additional infrastructure | Many systems are designed around horizontal distribution  |
| Operations   | Cross-shard management can be complex                                        | Cluster management and partition balancing can be complex |

**Important:** These are common architectural tendencies, not universal SQL-versus-NoSQL rules.

Some SQL databases are fully distributed systems, and some NoSQL databases require significant manual partition management.

---

## 8. JOINs: A Major Difference in Distributed Architectures

Relational databases are designed around relationships between tables.

Consider:

```text
users
-----
user_id
name

orders
------
order_id
user_id
total
```

A normal SQL query:

```sql
SELECT
    users.name,
    orders.order_id,
    orders.total
FROM users
JOIN orders
    ON users.user_id = orders.user_id;
```

In a single PostgreSQL database, the query planner can execute the JOIN locally.

### What happens after sharding?

Suppose:

```text
Shard A:
Users 1–1000

Shard B:
Orders 1–1000
```

But the related user and order records may be distributed across different shards.

The database must retrieve the required data from multiple servers and combine it.

```text
                Application
                     |
                     v
                Query Router
                     |
          +----------+----------+
          |                     |
          v                     v
       Shard A                Shard B
       Users                  Orders
          |                     |
          +----------+----------+
                     |
                     v
                Merge Results
```

This creates additional network communication and coordination.

### Possible approaches

1. Keep related records on the same shard using a shared partition key.
2. Duplicate frequently accessed data.
3. Perform multiple queries in the application.
4. Maintain precomputed views or materialized data.
5. Use a distributed SQL system that supports distributed query execution.

### Data locality

Data locality means keeping data that is frequently accessed together physically close or on the same shard.

For example:

```text
Shard A:
User 101
Orders of User 101

Shard B:
User 102
Orders of User 102
```

A user-specific query can access related data without crossing shards.

This is an important concept in distributed database design.

---

## 9. Transactions: SQL Sharding vs NoSQL

Transactions are another important difference to understand.

### 9.1 SQL transaction on one database

PostgreSQL supports ACID transactions.

Example:

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

Both updates are part of one transaction.

If an error occurs before commit, the transaction can be rolled back.

### 9.2 What happens when accounts are on different shards?

Suppose:

```text
Account 101 → Shard A
Account 102 → Shard B
```

Now the transfer spans two independent PostgreSQL databases.

A normal local transaction cannot automatically provide atomicity across both databases.

A distributed transaction mechanism or application-level workflow is required.

Possible approaches include:

- Two-phase commit (2PC), where supported.
- Sagas with compensating operations.
- Application-level coordination.
- Redesigning the partition key to keep related data together.

We studied 2PC and sagas in Part 7D.

### 9.3 NoSQL transactions

NoSQL transaction support varies.

Examples:

- MongoDB supports multi-document transactions, including transactions across shards in supported deployments.
- Cassandra provides lightweight transactions for particular operations, but they have different semantics and performance characteristics from ordinary relational transactions.
- Redis supports transactions and scripting, but these do not automatically provide a general distributed SQL-style transaction across independent cluster slots.

Never assume all NoSQL databases lack transactions.

### Comparison

| Feature                   | SQL                                                               | NoSQL                                                              |
| ------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Local transactions        | Commonly strong ACID support                                      | Varies by database                                                 |
| Multi-record transactions | Common                                                            | Varies                                                             |
| Cross-node transactions   | Requires distributed coordination or distributed SQL architecture | Varies; some support them, others favor local partition operations |
| Transaction semantics     | Database-specific isolation and constraints                       | Database-specific consistency and transaction semantics            |

---

## 10. Consistency and Replication

Both SQL and NoSQL databases can replicate data.

However, their replication and consistency models differ by product and configuration.

### 10.1 PostgreSQL replication

A common PostgreSQL architecture:

```text
                Application
                     |
                     v
                 Primary
                     |
                Replication
                /        \
               v          v
           Standby A  Standby B
```

PostgreSQL supports:

- Physical replication.
- Logical replication.
- Synchronous replication.
- Asynchronous replication.

With asynchronous replication, a primary may acknowledge a commit before a standby has received the transaction.

A read from that standby may therefore return stale data.

### 10.2 MongoDB replication

MongoDB replica sets have:

- A primary.
- Secondary members.
- Replication through the replica-set mechanism.
- Elections when the primary becomes unavailable.

Read and write concerns influence acknowledgement and read guarantees.

### 10.3 Cassandra replication

Cassandra distributes replicas according to a replication strategy.

It supports tunable consistency levels.

The application can choose how many replicas must participate in particular operations.

### Comparison

| Feature                         | PostgreSQL                                                 | MongoDB                  | Cassandra                                               |
| ------------------------------- | ---------------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| Common replication architecture | Primary/standby                                            | Replica set              | Distributed replicas                                    |
| Replication mode                | Physical and logical; synchronous or asynchronous options  | Replica-set replication  | Peer-to-peer replication                                |
| Write coordination              | Primary                                                    | Primary in a replica set | Coordinator and replica nodes                           |
| Consistency configuration       | Synchronous replication settings and transaction semantics | Read/write concerns      | Tunable consistency levels                              |
| Failover                        | Depends on deployment and failover tooling                 | Replica-set elections    | Node and replica availability handled by cluster design |

The important point is that replication architecture is not determined solely by SQL or NoSQL classification.

---

## 11. Distributed SQL: The Important Exception

Traditional SQL sharding often requires application-level routing.

However, modern distributed SQL databases combine relational query capabilities with distributed architecture.

Examples include:

- Google Spanner.
- CockroachDB.
- TiDB.
- YugabyteDB.

These databases aim to provide SQL interfaces while distributing data and processing across nodes.

### Simplified architecture

```text
                  SQL Application
                        |
                        v
                  Distributed SQL
                        |
             +----------+----------+
             |          |          |
             v          v          v
           Node A     Node B     Node C
             |          |          |
             v          v          v
         Distributed Data Partitions
```

Depending on the product, the system can manage:

- Data partitioning.
- Replication.
- Query routing.
- Distributed transactions.
- Consensus.
- Automatic data movement.

### Example: CockroachDB

CockroachDB uses ranges to distribute data.

Ranges are replicated, and Raft is used to coordinate replicated range operations.

Applications use SQL while the database manages distributed data placement and execution.

### Example: Google Spanner

Spanner distributes data across machines and provides strongly consistent transactions using distributed coordination mechanisms.

It also uses TrueTime to help provide externally consistent transaction ordering.

### Important lesson

Do not assume relational databases cannot scale horizontally.

Distributed SQL systems demonstrate that relational databases can support distributed storage, query processing, and transactions.

The difference is the architecture used to achieve it.

---

## 12. Real-World Example: Same Application, Different Architectures

Consider an e-commerce application.

It has:

```text
Users
Products
Orders
Payments
Inventory
```

Let's compare two possible designs.

### Architecture A: PostgreSQL with application-level sharding

```text
                    Node.js API
                         |
                         v
                    Shard Router
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      PostgreSQL     PostgreSQL     PostgreSQL
       Shard A        Shard B        Shard C
          |              |              |
          v              v              v
        Users A        Users B        Users C
        Orders A       Orders B       Orders C
```

The application:

- Determines the shard for each request.
- Routes queries.
- Handles cross-shard workflows.
- Manages global identifiers.
- Coordinates data migrations.

Advantages:

- Strong relational capabilities within each shard.
- Mature SQL transactions locally.
- Full control over placement.

Disadvantages:

- Cross-shard operations are difficult.
- Application complexity increases.
- Global reporting requires coordination.

### Architecture B: Distributed NoSQL database

```text
                    Node.js API
                         |
                         v
                  NoSQL Cluster Router
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
           Node A      Node B      Node C
             |           |           |
             v           v           v
         Partition  Partition  Partition
             1           2           3
```

The database manages partition placement and routing.

Advantages:

- Built-in distributed data placement in many systems.
- Horizontal scaling mechanisms.
- Integrated replication in many products.
- Convenient routing for supported query patterns.

Disadvantages:

- Data modeling must account for partition keys.
- Cross-partition operations may be expensive.
- Transaction capabilities vary.
- Database-specific behavior matters.

Neither architecture is universally superior.

The correct choice depends on the data model, transaction requirements, query patterns, scale, and operational capabilities.

---

## 13. SQL vs NoSQL: Detailed Comparison

| Dimension               | Traditional Relational SQL                                 | Distributed NoSQL                                                                |
| ----------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Data model              | Tables, rows, relationships                                | Documents, key-value, wide-column, graph, etc.                                   |
| Schema                  | Often explicitly defined                                   | Varies; often more flexible                                                      |
| Scaling                 | Vertical, replication, sharding, or distributed SQL        | Often designed around horizontal partitioning                                    |
| Partition placement     | May require explicit database or application configuration | Often integrated into cluster architecture                                       |
| Request routing         | Application, middleware, or distributed database           | Database driver, router, or coordinator                                          |
| JOINs                   | Strong relational support                                  | Varies; often designed around access patterns                                    |
| Transactions            | Strong local ACID support                                  | Varies by product                                                                |
| Cross-node transactions | Requires coordination unless natively supported            | Varies by product                                                                |
| Replication             | Mature support in many products                            | Common in distributed architectures                                              |
| Query flexibility       | Rich relational queries                                    | Depends on data model and query language                                         |
| Data locality           | Can be designed using sharding keys                        | Commonly central to data modeling                                                |
| Operational complexity  | Increases with sharding                                    | Increases with cluster size and distribution                                     |
| Best fit                | Relational business data and transactional workloads       | Workloads suited to particular NoSQL data models and distributed access patterns |

---

## 14. When Should You Choose SQL Sharding?

SQL sharding can be appropriate when:

1. You need relational data modeling.
2. You depend heavily on SQL queries.
3. You need strong local transaction semantics.
4. Your data can be divided along a stable shard key.
5. Cross-shard operations are limited or can be coordinated.
6. Your team can manage routing, migrations, and operational complexity.

Example:

A large multi-tenant SaaS platform may shard customers by tenant ID.

```text
Tenant A → PostgreSQL Shard A
Tenant B → PostgreSQL Shard B
Tenant C → PostgreSQL Shard C
```

This can provide isolation and predictable data placement.

However, a very large tenant may need its own shard or further partitioning.

---

## 15. When Should You Choose Distributed NoSQL?

A distributed NoSQL database may be appropriate when:

1. The data model fits the database's strengths.
2. The workload can be partitioned effectively.
3. Horizontal storage and throughput are important.
4. Queries can be designed around partition keys.
5. Cross-partition joins and transactions are limited or supported by the selected database.
6. The team understands its consistency and replication behavior.

Example:

An event ingestion system may receive billions of events.

A wide-column database designed for distributed writes and partition-key-based queries may be appropriate.

However, the partition key must be designed carefully to avoid hot partitions and oversized partitions.

---

## 16. Common Misconceptions

| Misconception                                        | Correct understanding                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| SQL cannot scale horizontally                        | SQL databases can use sharding or distributed SQL architectures            |
| NoSQL automatically scales horizontally              | Scaling capabilities and configuration vary by product                     |
| Table partitioning is the same as sharding           | Table partitions may remain on one database instance                       |
| SQL cannot distribute data                           | Traditional SQL sharding and distributed SQL both exist                    |
| NoSQL does not support transactions                  | Transaction capabilities vary across NoSQL products                        |
| NoSQL does not support joins                         | Join support varies by database                                            |
| SQL sharding is always manual                        | Middleware and distributed SQL systems can automate significant parts      |
| NoSQL partitioning eliminates query coordination     | Cross-partition operations may still require coordination                  |
| Replication and sharding are the same                | Replication copies data; sharding distributes different subsets            |
| Distributed SQL has no distributed-system trade-offs | It still deals with network latency, consensus, failures, and coordination |

---

## 17. Interview Questions and Answers

### Q1. What is the difference between partitioning and sharding?

Partitioning divides data into logical subsets. Sharding distributes data across independent database servers or instances.

### Q2. Is PostgreSQL partitioning the same as sharding?

No. PostgreSQL table partitioning divides a table into partitions that can reside on one database instance. Sharding distributes data across multiple database instances.

### Q3. Can SQL databases scale horizontally?

Yes. They can use application-level sharding, middleware, or distributed SQL architectures.

### Q4. Why is SQL sharding difficult?

Because it introduces challenges involving query routing, cross-shard JOINs, transactions, global IDs, foreign keys, and rebalancing.

### Q5. Why are distributed NoSQL databases commonly associated with horizontal scaling?

Many were designed around partitioning, replication, and distributed request routing.

### Q6. Does every NoSQL database support automatic sharding?

No. Capabilities vary by product.

### Q7. What is a cross-shard JOIN?

A JOIN where the required records are stored on different database shards and must be retrieved and combined across servers.

### Q8. Why is data locality important?

Keeping frequently accessed related data together reduces cross-node communication and can improve query performance.

### Q9. Can MongoDB execute transactions across shards?

Yes. MongoDB supports distributed transactions across shards in supported deployments, although they have additional coordination and performance costs.

### Q10. What is distributed SQL?

A database architecture that provides SQL and relational capabilities while distributing data and query execution across multiple nodes.

### Q11. What is the difference between a traditional SQL shard router and a distributed SQL database?

A traditional shard router may rely on application or middleware logic to select an independent database. A distributed SQL database generally manages partition placement, routing, and distributed execution internally.

### Q12. Why might a query become slower after sharding?

It may need to contact multiple shards, transfer data over the network, and merge results.

### Q13. Can a SQL database use replication and partitioning together?

Yes. A relational database can partition tables and replicate database data. Sharded architectures can also use replicas for each shard.

### Q14. What is the biggest design consideration in both SQL and NoSQL sharding?

Choosing an appropriate partition or shard key that supports workload distribution and important query patterns.

### Q15. Is NoSQL always better for large-scale applications?

No. Database selection depends on transaction requirements, data relationships, access patterns, consistency, scale, and operational complexity.

---

## 18. Practical Exercises

### Exercise 1: Identify the architecture

Classify each example:

1. PostgreSQL table partitioned by month on one server.
2. Three independent PostgreSQL databases storing different users.
3. MongoDB sharded cluster with three shards.
4. PostgreSQL primary with two read replicas.
5. CockroachDB distributing ranges across nodes.

For each, explain whether it uses table partitioning, replication, sharding, or native distributed architecture.

### Exercise 2: Design an SQL-sharded application

An application contains:

```text
Users: 20 Million
Orders: 100 Million
Payments: 50 Million
```

Design a PostgreSQL sharding strategy.

Answer:

1. What would you choose as the shard key?
2. How would you route requests?
3. How would you store user-related orders?
4. What happens when a payment references an order on another shard?
5. How would you generate globally unique IDs?
6. How would you rebalance shards?

### Exercise 3: Compare two architectures

Architecture A:

```text
Node.js
   |
Shard Router
   |
PostgreSQL A / PostgreSQL B / PostgreSQL C
```

Architecture B:

```text
Node.js
   |
Distributed NoSQL Cluster
   |
Node A / Node B / Node C
```

Compare:

- Query routing.
- JOINs.
- Transactions.
- Replication.
- Scaling.
- Operational complexity.

### Exercise 4: Query routing

Suppose a collection is sharded by `userId`.

Query A:

```javascript
db.orders.find({
  userId: 1050,
});
```

Query B:

```javascript
db.orders.find({
  status: "pending",
});
```

Explain why Query A can be targeted while Query B may need to contact multiple shards.

### Exercise 5: Database selection

You are designing three services:

1. Payment service.
2. Social media feed.
3. Analytics event ingestion.

For each service:

- Identify the data model.
- Decide whether relational SQL or NoSQL is a reasonable candidate.
- Explain the consistency requirements.
- Explain how the data could scale horizontally.
- Identify the biggest operational risk.

There may be multiple valid answers. Justify the architecture rather than choosing a database based on popularity.

---

## 19. Chapter Summary

| Concept                     | Key takeaway                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| SQL table partitioning      | Divides a table into smaller pieces                                                             |
| SQL sharding                | Distributes relational data across database instances                                           |
| NoSQL partitioning          | Distributes logical partitions across cluster nodes                                             |
| Shard router                | Determines which SQL shard handles a request                                                    |
| Distributed database router | Routes requests to responsible nodes or partitions                                              |
| Cross-shard JOIN            | Requires retrieving and combining data across servers                                           |
| Data locality               | Keeps frequently accessed data together                                                         |
| Distributed transactions    | Coordinate changes across multiple database nodes                                               |
| Replication                 | Maintains additional copies of data                                                             |
| Distributed SQL             | Combines relational SQL with distributed architecture                                           |
| PostgreSQL                  | Supports table partitioning and replication; traditional sharding needs additional architecture |
| MongoDB                     | Supports sharding with `mongos`, config servers, and shards                                     |
| Cassandra                   | Uses partition keys and token-based distribution                                                |
| CockroachDB                 | Distributed SQL using ranges and consensus-based replication                                    |

### The most important points to remember

1. SQL and NoSQL databases can both scale horizontally.
2. Table partitioning is not the same as sharding.
3. Traditional SQL sharding often requires additional routing and coordination infrastructure.
4. Many NoSQL databases manage partition placement and routing internally.
5. Distributed NoSQL databases still face cross-partition query and consistency challenges.
6. Relational JOINs become more complicated when related data is distributed across shards.
7. Distributed SQL systems provide another way to combine relational capabilities with horizontal scaling.
8. The database architecture must match the application's transaction and query requirements.

### Final mental model

```text
                 Horizontal Scaling
                         |
              +----------+----------+
              |                     |
              v                     v
          SQL Systems           NoSQL Systems
              |                     |
              v                     v
       Sharding / Distributed  Partitioning /
           SQL Architecture    Distributed Cluster
              |                     |
              v                     v
        Multiple DB Servers   Multiple DB Nodes
              |                     |
              +----------+----------+
                         |
                         v
               Distributed Workload
```

**Engineering takeaway:** SQL versus NoSQL is not a choice between vertical and horizontal scaling. Both can distribute workloads across machines. The real differences are in their data models, routing mechanisms, transaction semantics, query capabilities, and how much distributed-system complexity the database manages for you.
