---
sidebar_label: Sharding Fundamentals
sidebar_position: 1
---

# Sharding Fundamentals

## 1. Introduction: Why Do We Need Sharding?

We studied how relational databases scale using:

- Vertical scaling
- Replication
- Synchronous and asynchronous replication
- Failover and replication management

Replication allows us to maintain copies of the same data across multiple database servers.

But consider a different problem.

Imagine an e-commerce application with:

- 100 million users
- 500 million orders
- Billions of order items
- Millions of database operations every day

Your PostgreSQL primary server has already been upgraded with:

- More CPU
- More RAM
- Faster storage
- Better network capacity

You have also introduced replicas to distribute read traffic.

However, the primary is still responsible for the main write workload and the entire dataset.

Eventually, the primary may reach its hardware or operational limits.

What if we could distribute different portions of the data across multiple database servers?

That is the idea behind **sharding**.

---

## 2. What Is Database Sharding?

Sharding is a database architecture in which a large dataset is divided into smaller subsets called **shards**, and those shards are distributed across multiple database servers.

Each shard stores a portion of the overall dataset.

Instead of storing every record on one database server, different records are stored on different servers.

### Without Sharding

Imagine one database server storing every user:

```text
             Application
                  |
                  v
            Database Server
            ----------------
              User 1
              User 2
              User 3
              User 4
              User 5
              ...
              User 10M
            ----------------
```

All user records are stored on the same database server.

### With Sharding

Now divide the users across three database servers:

```text
                 Application
                      |
                 Shard Router
                 /     |     \
                /      |      \
               v       v       v
            Shard 1  Shard 2  Shard 3
            -------- -------- --------
            User     User     User
            1-100    101-200  201-300
            -------- -------- --------
```

Each server stores only a subset of the overall dataset.

The application can access the appropriate shard based on the record it needs.

### Important Definition

**A shard is an individual database partition hosted as part of a distributed database architecture.**

Sharding is the process of distributing those data partitions across multiple database servers.

---

## 3. Why Do We Need Sharding?

Sharding is primarily used when a single database server cannot efficiently handle the application's storage and workload requirements.

Let's understand the main reasons.

### 3.1 Distribute Storage Across Servers

Suppose your application has 2 TB of database data.

Your database server has a practical storage capacity of 1 TB for the workload.

Instead of continuously upgrading one server, you can distribute the dataset.

```text
              Total Dataset: 2 TB

                 Without Sharding
                 ----------------
                 One Database
                      |
                     2 TB


                 With Sharding
                 ----------------
                   Shard Router
                  /            \
                 v              v
             Shard 1         Shard 2
               1 TB            1 TB
```

Each shard stores only part of the dataset.

This allows the overall system to store more data than an individual database server could comfortably handle.

### 3.2 Distribute Write Workload

Consider an application receiving 50,000 write operations per second.

If all writes go to one primary database, that server must process the entire write workload.

With sharding, writes can be distributed across multiple database servers.

```text
                 Application
                      |
                 Shard Router
                 /     |     \
                /      |      \
               v       v       v
           Shard 1  Shard 2  Shard 3
           Writes   Writes   Writes
           17K/s    17K/s    16K/s
```

The numbers are illustrative.

The important point is that different shards can process writes independently because they own different portions of the dataset.

This is one of the major reasons sharding is used for horizontal scaling.

### 3.3 Distribute Read Workload

Sharding can also distribute reads.

For example:

- User 101 belongs to Shard 1.
- User 201 belongs to Shard 2.
- User 301 belongs to Shard 3.

Queries for these users can be routed to different servers.

However, sharding is not the same as replication.

A shard stores a subset of the dataset, while a replica stores a copy of another database's data.

### 3.4 Increase Overall Database Capacity

Suppose each database server can comfortably handle a certain amount of:

- Storage
- CPU usage
- Memory usage
- Database connections
- Query workload

With sharding, you can add more database servers and distribute the data and workload across them.

This allows the system's overall capacity to grow beyond the limits of one database server.

---

## 4. How Does Sharding Work?

Let's understand a simple example.

Suppose you have a `users` table with 9 million users.

You decide to distribute users across three database servers.

For this example:

- Shard 1 stores users 1–3 million.
- Shard 2 stores users 3–6 million.
- Shard 3 stores users 6–9 million.

Conceptually:

```text
                USERS DATASET
                -------------
                 9M Users
                     |
                     v
                Shard Router
                     |
          -------------------------
          |           |           |
          v           v           v
       Shard 1     Shard 2     Shard 3
       1M-3M       3M-6M       6M-9M
```

Now suppose the application requests:

```sql
SELECT *
FROM users
WHERE user_id = 4500000;
```

The routing system identifies that this user belongs to Shard 2.

The query is sent to Shard 2 instead of being executed against every database server.

```text
Application
     |
     | user_id = 4500000
     v
Shard Router
     |
     | Identify destination
     v
Shard 2
     |
     v
Return User
```

The router is responsible for determining where the required data lives.

This is the basic idea of sharded query routing.

---

## 5. Important Terminology

Before going further, understand these terms.

### 5.1 Shard

A shard is one individual data partition in a sharded database system.

Example:

```text
Shard 1: Users 1-1000
Shard 2: Users 1001-2000
Shard 3: Users 2001-3000
```

Each shard stores a different portion of the dataset.

### 5.2 Shard Key

A shard key is the field or combination of fields used to determine which shard should store a particular record.

Examples:

- `user_id`
- `customer_id`
- `tenant_id`
- `region_id`

Suppose `user_id` is selected as the shard key.

The system uses the user ID to determine the destination shard.

```text
User ID
   |
   v
Shard Key
   |
   v
Routing Logic
   |
   v
Destination Shard
```

The choice of shard key is extremely important.

A poor shard key can create uneven data distribution and workload concentration.

We will study shard-key selection and sharding strategies in Part 7B.

### 5.3 Shard Router

A shard router determines which shard should receive a query.

It can be implemented through:

- Application-level routing
- A database proxy
- A distributed database's internal routing mechanism

Example:

```text
              Node.js Application
                       |
                       v
                 Shard Router
                       |
             ---------------------
             |         |         |
             v         v         v
          Shard 1   Shard 2   Shard 3
```

The router uses the shard key or routing metadata to locate the appropriate database server.

### 5.4 Shard Map

A shard map is metadata that describes how data is distributed across shards.

For example:

| User ID Range   | Shard   |
| --------------- | ------- |
| 1–1000000       | Shard 1 |
| 1000001–2000000 | Shard 2 |
| 2000001–3000000 | Shard 3 |

A routing system can use this information to identify the correct shard.

This table is only an illustrative representation. Real systems may use more sophisticated mappings.

### 5.5 Shard Cluster

A shard cluster is the collection of database servers participating in a sharded database architecture.

Example:

```text
              Sharded Database Cluster
              ------------------------

              Shard 1
              Shard 2
              Shard 3
              Shard 4
              Shard 5
```

Each shard stores part of the overall dataset.

---

## 6. Sharding vs Replication

This is one of the most important distinctions in database architecture.

Both concepts involve multiple database servers, but their purposes are different.

### Replication

Replication maintains copies of the same data across multiple servers.

```text
             Primary Database
                    |
              Replication
               /       \
              v         v
          Replica 1  Replica 2

          Same logical dataset
```

### Sharding

Sharding distributes different portions of the data across multiple servers.

```text
                Sharded Database
                       |
                  Shard Router
                 /     |     \
                v      v      v
             Shard 1 Shard 2 Shard 3

             Different data subsets
```

### Comparison

| Feature                | Replication                                                  | Sharding                                   |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| Main purpose           | Maintain copies of data                                      | Distribute data                            |
| Data stored on servers | Copies of the same dataset                                   | Different data subsets                     |
| Storage capacity       | Copies consume additional storage                            | Aggregate capacity increases across shards |
| Write scaling          | Conventional primary–replica setup still has one main writer | Writes can be distributed across shards    |
| Read scaling           | Distribute reads across replicas                             | Distribute queries across shards           |
| Complexity             | Replication and failover management                          | Data routing and distribution              |
| Main concept           | Copy data                                                    | Divide data                                |

### Can We Use Both Together?

Yes.

In production systems, sharding and replication are often combined.

Each shard can have its own primary and replicas.

```text
                  Application
                       |
                  Shard Router
                 /           \
                /             \
               v               v
           Shard 1           Shard 2
           Primary           Primary
              |                 |
          --------           --------
          |      |           |      |
          v      v           v      v
        Rep 1  Rep 2        Rep 1  Rep 2
```

Here:

- Sharding distributes different data subsets.
- Replication creates copies of each shard's data.

This architecture can provide both horizontal capacity and redundancy.

---

## 7. Sharding vs Partitioning

These terms are related, but they are not identical.

### 7.1 What Is Database Partitioning?

Partitioning divides a large table into smaller logical or physical pieces.

For example, suppose an application stores millions of orders in one table.

Instead of storing all records in one physical table structure, PostgreSQL can divide the table into partitions.

Example:

```sql
CREATE TABLE orders (
    order_id BIGINT,
    user_id BIGINT,
    order_date DATE,
    total_amount NUMERIC(12, 2)
)
PARTITION BY RANGE (order_date);
```

Create monthly partitions:

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
          ---------------------
          |         |         |
          v         v         v
       January  February   March
       Partition Partition  Partition
```

The partitions are managed as part of the same PostgreSQL database system.

### 7.2 What Is Sharding?

Sharding distributes data across separate database servers or nodes.

```text
               Application
                    |
               Shard Router
                    |
          ----------------------
          |          |         |
          v          v         v
       Server 1   Server 2  Server 3
        Shard 1    Shard 2   Shard 3
```

Each shard is hosted independently.

### 7.3 Partitioning vs Sharding

| Feature           | Partitioning                                  | Sharding                                                |
| ----------------- | --------------------------------------------- | ------------------------------------------------------- |
| Main purpose      | Divide a table or dataset into smaller pieces | Distribute data across servers                          |
| Physical location | Can exist within one database server          | Across multiple database servers                        |
| Routing           | Usually handled by the database               | Requires shard-aware routing or infrastructure          |
| Scaling           | Helps table management and query performance  | Enables horizontal distribution of storage and workload |
| Complexity        | Usually lower                                 | Usually higher                                          |
| Example           | Monthly orders partitions in PostgreSQL       | Users distributed across three PostgreSQL servers       |

### 7.4 Important: Can Partitioning and Sharding Be Combined?

Yes.

A shard can itself contain partitioned tables.

For example:

```text
                 Sharded System
                       |
             ---------------------
             |                   |
             v                   v
          Shard 1             Shard 2
             |                   |
       --------------      --------------
       |      |     |      |      |     |
       v      v     v      v      v     v
     Jan    Feb   Mar     Jan    Feb   Mar
   Partition Partition Partition ...
```

This allows systems to use both:

- Horizontal distribution across servers.
- Table partitioning within individual shards.

**Remember:** Partitioning does not automatically mean sharding. A partitioned table can exist entirely on one database server.

---

## 8. How Sharding Distributes Workload

Let's compare a single-server database with a sharded database.

Assume an application receives 30,000 write operations per second.

### Without Sharding

```text
            Application
                 |
                 v
            Primary DB
                 |
            30,000 writes/s
```

One primary handles the entire write workload.

### With Three Shards

```text
              Application
                   |
              Shard Router
             /      |      \
            v       v       v
         Shard 1 Shard 2 Shard 3
          10K/s   10K/s   10K/s
```

Each shard handles approximately 10,000 writes per second.

The distribution is illustrative and assumes a balanced workload.

In real applications, different shards may receive different amounts of traffic.

A shard that receives disproportionately more requests becomes a bottleneck. This is one reason shard-key selection matters.

---

## 9. What Happens When a Query Does Not Contain the Shard Key?

Consider a system sharded using `user_id`.

A query such as:

```sql
SELECT *
FROM users
WHERE user_id = 101;
```

contains the shard key.

The router can identify the destination shard.

Now consider:

```sql
SELECT *
FROM users
WHERE email = 'user@example.com';
```

The query does not contain the shard key.

The routing system may not know which shard contains the user.

One possible approach is to send the query to every shard.

```text
               Application
                    |
                    v
               Shard Router
                    |
          -----------------------
          |          |          |
          v          v          v
       Shard 1    Shard 2    Shard 3
          |          |          |
          -----------          |
                    |           |
                    v           v
                Collect Results
                    |
                    v
                Application
```

This is often called a **scatter-gather query**.

The router sends the query to multiple shards, collects their results, and combines them.

This can be more expensive than querying a single shard.

Some systems maintain additional indexes or routing metadata to avoid this, but the fundamental issue remains: queries that cannot identify their target shard may require broader execution.

We will examine query routing and distributed query execution in Part 7C.

---

## 10. What Does a Shard Store?

A shard stores the data assigned to it according to the sharding scheme.

For example, suppose we shard an e-commerce application's users using `user_id`.

| Shard   | Assigned Users  |
| ------- | --------------- |
| Shard 1 | Users 1–1000    |
| Shard 2 | Users 1001–2000 |
| Shard 3 | Users 2001–3000 |

The database schema may be similar across shards.

Each shard could contain:

- Users assigned to that shard
- Orders belonging to those users
- User-related records
- Other data distributed according to the application's data model

For example:

```text
Shard 1
-------
users
orders
payments

Shard 2
-------
users
orders
payments

Shard 3
-------
users
orders
payments
```

The tables may have the same structure, but each shard stores different records.

**Important:** A shard is not necessarily a single table. A shard commonly contains multiple related tables and indexes for its assigned portion of the dataset.

---

## 11. Sharding in a Node.js Backend

Let's connect the concept to a backend application.

Suppose you have a Node.js application using PostgreSQL.

You have three database servers:

- PostgreSQL Shard 1
- PostgreSQL Shard 2
- PostgreSQL Shard 3

Your backend needs to determine which database connection to use.

### 11.1 Conceptual Architecture

```text
              Client Request
                    |
                    v
              Express Server
                    |
                    v
                Shard Router
                    |
             -----------------
             |       |       |
             v       v       v
          Pool 1   Pool 2   Pool 3
             |       |       |
             v       v       v
          Shard 1 Shard 2 Shard 3
```

### 11.2 Example Connection Pools

```javascript
const { Pool } = require("pg");

const shardPools = {
  shard1: new Pool({
    connectionString: process.env.SHARD_1_URL,
  }),

  shard2: new Pool({
    connectionString: process.env.SHARD_2_URL,
  }),

  shard3: new Pool({
    connectionString: process.env.SHARD_3_URL,
  }),
};
```

### 11.3 Simplified Routing Function

For learning purposes, assume users are distributed using numeric ID ranges.

```javascript
function getShard(userId) {
  if (userId <= 1000000) {
    return shardPools.shard1;
  }

  if (userId <= 2000000) {
    return shardPools.shard2;
  }

  return shardPools.shard3;
}
```

Now retrieve a user:

```javascript
async function getUser(userId) {
  const pool = getShard(userId);

  const result = await pool.query(
    `SELECT *
     FROM users
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0];
}
```

The application determines the correct database before executing the query.

### Important Limitations of This Example

This is a simplified demonstration, not a production-ready sharding implementation.

A real system must account for:

- Shard metadata and configuration.
- Data migration when shard assignments change.
- Connection failures.
- Uneven shard workloads.
- Unique identifiers.
- Transactions involving multiple shards.
- Monitoring and recovery.
- Routing consistency across application instances.

Also, the example uses fixed ID ranges. It does not demonstrate a complete strategy for generating globally unique IDs or handling future shard expansion.

Those topics belong to the upcoming chapters.

---

## 12. Does Sharding Mean Every Shard Is Independent?

A shard stores its own portion of the data and can process many operations independently.

However, the overall application may still need to coordinate operations across multiple shards.

Consider:

- User belongs to Shard 1.
- Product belongs to Shard 2.
- An order references both.

A transaction that updates records across both shards may require distributed coordination.

This is more complicated than a transaction involving records on one database server.

For example:

```text
                 Create Order
                      |
             -------------------
             |                 |
             v                 v
          Shard 1           Shard 2
           User             Product
```

If one operation succeeds and another fails, the system must handle the partial outcome.

This introduces distributed transaction and consistency challenges.

We will explore these problems in Part 7D.

For now, remember:

**Operations confined to one shard are generally simpler than operations involving multiple shards.**

---

## 13. Advantages of Sharding

| Advantage           | Explanation                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| Horizontal scaling  | Add more database servers                                                         |
| Distributed storage | Store a large dataset across multiple machines                                    |
| Distributed writes  | Different shards can process writes independently                                 |
| Distributed reads   | Queries can be routed to different shards                                         |
| Resource isolation  | Workload on one shard does not necessarily consume resources on every other shard |
| Capacity growth     | Overall system capacity can grow by adding shards                                 |

### Example

Suppose your application grows from 10 million to 100 million users.

Instead of relying entirely on one database server, you can distribute users across more shards.

This provides a path to scaling beyond a single server's practical limits.

However, adding shards also introduces operational complexity.

---

## 14. Disadvantages of Sharding

Sharding is powerful, but it is not free.

### 14.1 Application Complexity

The application needs to know how to locate data.

Without correct routing, queries may be sent to the wrong shard or multiple unnecessary shards.

### 14.2 Cross-Shard Queries

Queries that require data from multiple shards may require distributed execution.

For example:

```sql
SELECT *
FROM orders
WHERE total_amount > 10000;
```

If orders are distributed across all shards, the system may need to query each shard and combine the results.

### 14.3 Cross-Shard Transactions

Transactions involving multiple shards are more difficult to coordinate.

A transaction that updates one shard but fails on another can create partial outcomes unless the system provides an appropriate distributed transaction mechanism.

### 14.4 Uneven Data Distribution

Some shards may contain much more data or receive much more traffic than others.

This can create hot shards.

### 14.5 Operational Complexity

You must manage:

- Multiple database servers
- Backups for each shard
- Replication for each shard
- Monitoring
- Data movement
- Schema changes
- Failover
- Capacity planning

### 14.6 Rebalancing

As the application grows, some shards may become overloaded.

Data may need to be redistributed across servers.

This process is called rebalancing.

We will study the details of shard distribution, shard-key selection, and rebalancing in Part 7B and Part 7D.

---

## 15. When Should You Use Sharding?

Sharding should not be the first solution to every database performance problem.

Before introducing it, consider:

- Query optimization
- Appropriate indexing
- Connection pooling
- Vertical scaling
- Read replicas
- Caching
- Table partitioning
- Archiving old data

Sharding is appropriate when a single database server has become an actual storage, write-throughput, or resource bottleneck that simpler approaches cannot adequately solve.

### Suitable Situations

**1. Very large datasets**

The dataset exceeds the practical capacity of one database server.

**2. Very high write throughput**

One primary cannot efficiently handle the required write volume.

**3. Large multi-tenant applications**

Different tenants can be distributed across database servers.

**4. Globally distributed applications**

Data may be distributed across regions to support geographic requirements, although this introduces additional consistency and routing decisions.

**5. Workloads with natural data boundaries**

For example, users, customers, tenants, or regional datasets can sometimes be distributed independently.

### When Sharding May Be Unnecessary

Avoid introducing sharding merely because:

- Your database has millions of records.
- Your application has multiple tables.
- Queries are slow.
- You want to use multiple database servers.
- Your database is consuming significant storage.

First identify the actual bottleneck.

A poorly indexed database with 10 million records may perform much worse than a properly indexed database with 100 million records.

Sharding introduces architectural complexity that must be justified by measurable requirements.

---

## 16. Real-World Example: Multi-Tenant SaaS Application

Imagine a SaaS platform with 10,000 companies.

Each company has:

- Employees
- Projects
- Tasks
- Documents
- Activity logs

A single database stores all tenant data.

As the platform grows, the database becomes increasingly large.

You could distribute tenants across shards.

```text
                 SaaS Application
                        |
                   Shard Router
                        |
             -----------------------
             |          |          |
             v          v          v
          Shard 1    Shard 2    Shard 3
          --------   --------   --------
          Tenant     Tenant     Tenant
          1-3000     3001-6000  6001-10000
```

Each shard contains the records belonging to its assigned tenants.

For example:

```text
Shard 1
-------
Tenant 101
  Employees
  Projects
  Tasks
  Documents

Tenant 102
  Employees
  Projects
  Tasks
  Documents
```

When a request arrives:

```text
GET /tenants/101/projects
```

The backend identifies Tenant 101 and routes the query to Shard 1.

This is a natural use case for sharding because tenant identity provides a clear way to locate related data.

The actual tenant distribution strategy must account for tenant size and traffic. A single very large tenant can become a hot shard even when tenant counts are evenly distributed.

---

## 17. Common Misconceptions

### Misconception 1: Sharding and replication are the same.

Incorrect.

Replication creates copies of data. Sharding distributes different subsets of data.

### Misconception 2: Sharding means splitting one table into multiple tables.

Incorrect.

Sharding distributes data across multiple database servers. A shard can contain many tables.

### Misconception 3: Partitioning and sharding are identical.

Incorrect.

Partitioning divides a dataset into smaller parts. Sharding distributes data partitions across separate database servers.

### Misconception 4: Every query becomes faster after sharding.

Incorrect.

Queries that target one shard can be efficient. Queries that require data from every shard may become more expensive.

### Misconception 5: Adding more shards always improves performance.

Incorrect.

Poor shard distribution, inefficient routing, network overhead, and cross-shard queries can reduce performance.

### Misconception 6: Sharding eliminates the need for replication.

Incorrect.

Each shard may also have replicas for availability and read scaling.

### Misconception 7: Sharding should be introduced as early as possible.

Incorrect.

It increases operational and application complexity. Introduce it when simpler scaling approaches are insufficient.

### Misconception 8: A shard is always a separate table.

Incorrect.

A shard is a data partition hosted on a database node. It may contain multiple tables and indexes.

---

## 18. Interview Questions

### Q1. What is database sharding?

Sharding is a horizontal scaling technique that divides a large dataset into smaller subsets and distributes them across multiple database servers.

### Q2. What is a shard?

A shard is an individual data partition hosted as part of a sharded database architecture.

### Q3. Why is sharding needed?

It helps distribute storage and workload when a single database server cannot efficiently handle the application's requirements.

### Q4. What is a shard key?

A shard key is the field or combination of fields used to determine where a record should be stored.

### Q5. What is a shard router?

A shard router determines which database server should receive a query based on shard-routing information.

### Q6. What is the difference between horizontal and vertical scaling?

Vertical scaling increases the resources of one server. Horizontal scaling distributes workload across multiple servers.

### Q7. What is the difference between sharding and replication?

Sharding distributes different subsets of data. Replication maintains copies of data across servers.

### Q8. Can sharding and replication be used together?

Yes. Each shard can have its own replicas.

### Q9. What is the difference between partitioning and sharding?

Partitioning divides a dataset into smaller pieces, potentially within one database server. Sharding distributes data across separate database servers.

### Q10. What is a scatter-gather query?

It is a query that is sent to multiple shards because the router cannot identify a single destination shard or the requested data spans multiple shards. The results are then combined.

### Q11. What is a hot shard?

A hot shard is a shard receiving disproportionately high traffic or workload compared with other shards.

### Q12. What is shard rebalancing?

Rebalancing is the process of redistributing data or workload across shards to improve distribution and capacity utilization.

### Q13. Can a shard contain multiple tables?

Yes. A shard commonly contains multiple related tables and indexes for its assigned portion of the dataset.

### Q14. Does sharding automatically solve slow queries?

No. Slow queries may be caused by missing indexes, inefficient SQL, poor query plans, or other issues. Sharding does not automatically fix them.

### Q15. What are the disadvantages of sharding?

Application complexity, cross-shard queries, distributed transactions, data rebalancing, monitoring, and operational overhead.

### Q16. Should every large database be sharded?

No. Sharding should be introduced only when the application's storage or workload requirements justify its complexity.

---

## 19. Practical Learning Exercise

### Exercise A: Identify the Shard

Assume the following distribution:

| Shard   | User ID Range |
| ------- | ------------- |
| Shard 1 | 1–1000        |
| Shard 2 | 1001–2000     |
| Shard 3 | 2001–3000     |

Identify the destination shard for:

1. User ID 500
2. User ID 1500
3. User ID 2500
4. User ID 999
5. User ID 2001

Expected answers:

| User ID | Shard   |
| ------- | ------- |
| 500     | Shard 1 |
| 1500    | Shard 2 |
| 2500    | Shard 3 |
| 999     | Shard 1 |
| 2001    | Shard 3 |

### Exercise B: Identify the Architecture

For each scenario, identify whether it describes replication, partitioning, or sharding.

1. Three PostgreSQL servers maintain copies of the same database.
2. A PostgreSQL orders table is divided into monthly partitions on one server.
3. Users are distributed across three independent database servers.
4. Each of three shards has its own standby replica.

Expected answers:

| Scenario | Concept                |
| -------- | ---------------------- |
| 1        | Replication            |
| 2        | Partitioning           |
| 3        | Sharding               |
| 4        | Sharding + Replication |

### Exercise C: Identify the Shard Key

Suppose you are designing a multi-tenant SaaS application.

Each tenant has:

- Users
- Projects
- Tasks
- Documents

Questions:

1. Which field could be used as a shard key?
2. Why would it help route requests?
3. What happens if one tenant generates 50% of the total traffic?
4. What happens when a query needs data from multiple tenants?

Expected reasoning:

- `tenant_id` is a natural candidate.
- It identifies which tenant owns the requested records.
- A very large tenant may create a hot shard.
- Cross-tenant queries may need to access multiple shards.

### Exercise D: Understand Scatter-Gather

Assume users are distributed across three shards using `user_id`.

Consider:

```sql
SELECT *
FROM users
WHERE email = 'user@example.com';
```

The query does not include the shard key.

Questions:

1. Can the router directly identify the shard using `user_id`?
2. What might the router do?
3. Why could this be more expensive?

Expected reasoning:

- It cannot identify a shard from the supplied user ID because none was provided.
- It may query multiple shards.
- It must combine results from multiple database servers.

---

## 20. Chapter Summary

| Concept                 | Key Takeaway                                           |
| ----------------------- | ------------------------------------------------------ |
| Sharding                | Distributes a dataset across multiple database servers |
| Shard                   | Individual data partition                              |
| Shard Key               | Determines where records are stored                    |
| Shard Router            | Routes queries to appropriate shards                   |
| Shard Map               | Describes data distribution                            |
| Shard Cluster           | Collection of database nodes participating in sharding |
| Horizontal Scaling      | Adds servers to distribute workload                    |
| Replication             | Creates copies of data                                 |
| Partitioning            | Divides a table or dataset into smaller parts          |
| Scatter-Gather          | Queries multiple shards and combines results           |
| Hot Shard               | A shard with disproportionate workload                 |
| Rebalancing             | Redistributes data or workload                         |
| Cross-Shard Transaction | Transaction involving multiple shards                  |

### The most important mental model

```text
VERTICAL SCALING
Make one database server more powerful.

REPLICATION
Create copies of database data.

PARTITIONING
Divide a table or dataset into smaller parts.

SHARDING
Distribute different data subsets across multiple database servers.
```

The central idea of sharding is simple:

**Instead of making one database server handle everything, distribute the data and workload across multiple servers.**

The difficult part is deciding how to distribute that data and how to route queries efficiently.
