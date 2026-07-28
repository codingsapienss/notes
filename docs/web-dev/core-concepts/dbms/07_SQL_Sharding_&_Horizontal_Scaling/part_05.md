---
sidebar_label: Sharding vs Normalization vs Replication
sidebar_position: 1
---

# Sharding vs Normalization vs Replication

## 1. Introduction

So far, we have studied three important database concepts:

- **Normalization:** Organizing data to reduce unnecessary duplication and maintain data integrity.
- **Replication:** Maintaining copies of data across multiple database servers.
- **Sharding:** Dividing data into subsets and distributing those subsets across multiple database servers.

These concepts solve different problems.

However, developers frequently confuse them because all three affect how data is stored and managed.

Consider an e-commerce application with:

- 100 million users
- 500 million orders
- 50 million products
- Millions of daily requests

How would you design its database?

Should you normalize the tables?

Should you replicate the database?

Should you shard the data?

Should you denormalize frequently accessed information?

The answer is not to choose one technique. These techniques can work together.

The objective of this chapter is to understand **what problem each technique solves, when to use it, and how to combine them in a real-world backend architecture.**

---

## 2. Normalization

### 2.1 What Is Normalization?

Normalization is the process of organizing relational database tables to reduce unnecessary data duplication and improve data integrity.

It involves dividing data into logically related tables and defining relationships between them.

Consider this table:

| order_id | customer_name | customer_email  | product_name | quantity |
| -------- | ------------- | --------------- | ------------ | -------: |
| 101      | Rahul         | rahul@gmail.com | Laptop       |        1 |
| 102      | Rahul         | rahul@gmail.com | Mouse        |        2 |
| 103      | Amit          | amit@gmail.com  | Keyboard     |        1 |

Notice that Rahul's information is repeated.

If Rahul changes his email address, multiple rows may need to be updated.

This creates an update anomaly.

### 2.2 Normalized Design

We can separate the data into different tables.

**Users**

| user_id | name  | email           |
| ------: | ----- | --------------- |
|       1 | Rahul | rahul@gmail.com |
|       2 | Amit  | amit@gmail.com  |

**Products**

| product_id | product_name |
| ---------: | ------------ |
|          1 | Laptop       |
|          2 | Mouse        |
|          3 | Keyboard     |

**Orders**

| order_id | user_id |
| -------: | ------: |
|      101 |       1 |
|      102 |       1 |
|      103 |       2 |

**Order Items**

| order_id | product_id | quantity |
| -------: | ---------: | -------: |
|      101 |          1 |        1 |
|      102 |          2 |        2 |
|      103 |          3 |        1 |

Now customer and product information are maintained in their respective tables.

### 2.3 Why Use Normalization?

- Reduces unnecessary duplication.
- Prevents update anomalies.
- Improves data integrity.
- Makes relationships explicit.
- Makes data maintenance easier.

### 2.4 Does Normalization Improve Every Query?

No.

A normalized design may require JOINs to retrieve related information.

For example:

```sql
SELECT
    orders.order_id,
    users.name,
    users.email
FROM orders
JOIN users
    ON orders.user_id = users.user_id;
```

For some read-heavy workloads, retrieving data from multiple tables can increase query complexity and execution cost.

That does not mean normalization is bad. It means database design must consider both data integrity and access patterns.

---

## 3. Denormalization

### 3.1 What Is Denormalization?

Denormalization intentionally introduces some data duplication to improve read performance or simplify frequently executed queries.

It is often used when a system has predictable, read-heavy access patterns.

Consider an orders table.

A normalized design might store:

```text
orders
------
order_id
user_id
total_amount
```

To display an order, the application needs a JOIN with the users table.

An alternative is to store selected customer information directly in the order:

```text
orders
------
order_id
user_id
customer_name
customer_email
total_amount
```

Now the application can retrieve order information without joining the users table for those fields.

### 3.2 Why Is Denormalization Useful?

- Reduces some JOIN operations.
- Makes common read queries simpler.
- Can reduce database round trips.
- Supports read-heavy workloads.
- Can preserve historical snapshots.

### 3.3 Important Example: Order Price

Suppose a customer purchases a product for ₹2,000.

Later, the product price changes to ₹2,500.

Should the old order now show ₹2,500?

No.

The order must preserve the price at the time of purchase.

Therefore, the order item should store a historical price:

```sql
CREATE TABLE order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL
);
```

Here, `unit_price` is a snapshot of the transaction value.

This is not necessarily poor database design. It represents a different business fact: the historical price charged for that order.

### 3.4 The Cost of Denormalization

The main disadvantage is maintaining consistency between duplicated values.

Suppose a customer's email is copied into 10,000 records.

If the email changes, do you update all 10,000 records?

Sometimes you should not update historical snapshots at all. Sometimes you need to update a cached or denormalized value.

The correct behavior depends on the meaning of the data.

**Rule:** Duplicate data intentionally, with a clearly defined source of truth and synchronization strategy.

---

## 4. Replication

### 4.1 What Is Replication?

Replication means maintaining copies of the same database data on multiple database servers.

For example:

```text
                 Primary Database
                       |
              -------------------
              |                 |
              v                 v
          Replica 1         Replica 2
```

The primary generally handles writes, and replicas can serve eligible read queries.

The exact behavior depends on the replication architecture.

### 4.2 Why Do We Need Replication?

Consider a database server handling:

- 20,000 read requests per second.
- 1,000 write requests per second.

The read workload is much higher.

We can introduce read replicas:

```text
                  Application
                       |
               -----------------
               |       |       |
               v       v       v
             Primary Replica Replica
               DB 1    DB 2   DB 3
```

The application routes:

- Writes to the primary.
- Eligible reads to replicas.

This can distribute read workload.

### 4.3 Benefits

**1. Read Scaling**

Multiple replicas can serve read requests.

**2. Availability**

A replica can potentially be promoted if the primary fails.

**3. Disaster Recovery**

Copies in different locations can help with recovery from infrastructure failures.

**4. Reporting Offload**

Read-heavy reporting workloads can run on replicas instead of competing directly with production writes.

### 4.4 Replication Does Not Automatically Increase Write Capacity

Suppose all writes still go to one primary.

Adding five read replicas does not distribute those writes across five independent writable databases.

The primary remains responsible for the write workload.

### 4.5 Replication Lag

In asynchronous replication, a replica may not immediately contain the latest committed changes.

Example:

```text
Primary:
User email = new@example.com

Replica:
User email = old@example.com
```

If the application writes to the primary and immediately reads from a lagging replica, it may receive stale data.

This is called a read-after-write consistency problem.

---

## 5. Sharding

### 5.1 What Is Sharding?

Sharding means dividing a dataset into smaller subsets and distributing those subsets across multiple database servers.

Unlike replication, the goal is not to maintain a complete copy of the same dataset on every server.

Example:

```text
              Application
                   |
               Shard Router
                   |
          ---------------------
          |         |         |
          v         v         v
        Shard 1   Shard 2   Shard 3
       Users 1-   Users     Users
       1M         1M-2M     2M-3M
```

Each shard owns a different portion of the dataset.

### 5.2 Why Do We Need Sharding?

Suppose one PostgreSQL server stores:

- 500 million users.
- 2 billion orders.
- Billions of event records.

The database may eventually reach hardware or workload limits.

Sharding allows the application to distribute data and workload across multiple servers.

### 5.3 Benefits

- Distributes storage.
- Distributes write workload.
- Increases aggregate processing capacity.
- Supports growth beyond a single server's capacity.
- Can isolate large tenants or workloads.

### 5.4 Disadvantages

- Cross-shard queries become more complicated.
- Cross-shard transactions are difficult.
- Global unique ID generation needs consideration.
- Data migration and rebalancing become operational challenges.
- Monitoring and backup management become more complex.

### 5.5 Sharding Is Not Replication

This distinction is critical.

**Replication:**

```text
Primary:  A + B + C
Replica:  A + B + C
Replica:  A + B + C
```

**Sharding:**

```text
Shard 1: A
Shard 2: B
Shard 3: C
```

Replication creates copies.

Sharding divides ownership of the dataset.

A sharded system can also replicate each shard for availability.

We will combine these concepts later in this chapter.

---

## 6. Normalization vs Denormalization vs Replication vs Sharding

Let's compare the four concepts directly.

| Feature           | Normalization                     | Denormalization                      | Replication                                          | Sharding                           |
| ----------------- | --------------------------------- | ------------------------------------ | ---------------------------------------------------- | ---------------------------------- |
| Main objective    | Reduce unnecessary duplication    | Improve selected read patterns       | Maintain copies of data                              | Distribute data                    |
| Data organization | Multiple related tables           | Some duplicated fields or records    | Copies across servers                                | Different subsets across servers   |
| Primary concern   | Integrity and maintainability     | Read performance and access patterns | Availability and read scaling                        | Storage and workload scaling       |
| Data duplication  | Reduced                           | Intentionally introduced             | Entire replicated dataset or selected data is copied | Not inherently required            |
| Write complexity  | Usually simpler consistency model | More synchronization may be needed   | Changes must propagate                               | Writes must route to correct shard |
| Query complexity  | May require JOINs                 | Can simplify selected queries        | Read routing and replica consistency                 | Distributed query routing          |

### Quick Mental Model

```text
NORMALIZATION
    Organize related data properly.

DENORMALIZATION
    Duplicate selected data intentionally.

REPLICATION
    Maintain copies of data on multiple servers.

SHARDING
    Divide data across multiple servers.
```

These are not mutually exclusive techniques.

---

## 7. Partitioning vs Sharding

These two terms are frequently confused.

### 7.1 What Is Partitioning?

Partitioning divides a table into smaller logical or physical pieces.

For example, an orders table may be partitioned by month.

```text
orders
  |
  |-- orders_2026_01
  |-- orders_2026_02
  |-- orders_2026_03
  |-- orders_2026_04
```

In PostgreSQL, table partitioning is commonly implemented within one database cluster.

Example:

```sql
CREATE TABLE orders (
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    total_amount NUMERIC(12, 2)
)
PARTITION BY RANGE (order_date);
```

Create a monthly partition:

```sql
CREATE TABLE orders_2026_11
PARTITION OF orders
FOR VALUES FROM ('2026-11-01')
TO ('2026-12-01');
```

The application can query the parent table:

```sql
SELECT *
FROM orders
WHERE order_date >= '2026-11-01'
  AND order_date < '2026-12-01';
```

PostgreSQL can prune partitions that cannot contain matching rows.

### 7.2 What Is the Difference?

| Feature           | Partitioning                              | Sharding                                          |
| ----------------- | ----------------------------------------- | ------------------------------------------------- |
| Main objective    | Divide a table into smaller parts         | Distribute data across servers                    |
| Typical location  | Within one database cluster               | Across multiple database servers                  |
| Data distribution | Logical/physical table partitions         | Separate shard ownership                          |
| Routing           | Database handles partition pruning        | Application or shard router often routes requests |
| Main use          | Manage large tables and query performance | Scale storage and workload horizontally           |

### 7.3 Can Partitioning and Sharding Work Together?

Yes.

A sharded system can partition tables inside each shard.

Example:

```text
                 Application
                      |
                 Shard Router
                      |
          -----------------------
          |          |          |
          v          v          v
        Shard 1   Shard 2    Shard 3
          |          |          |
        Orders     Orders     Orders
          |          |          |
       Monthly    Monthly    Monthly
       Partitions Partitions Partitions
```

Here:

- Sharding distributes data across database servers.
- Partitioning divides the orders table inside each database.

They solve different problems.

---

## 8. Vertical Scaling vs Horizontal Scaling

Before deciding whether to shard, understand the two fundamental scaling approaches.

### 8.1 Vertical Scaling (Scale Up)

Vertical scaling means increasing the resources of an existing server.

For example:

```text
Before:
8 CPU cores
32 GB RAM
500 GB storage

After:
32 CPU cores
128 GB RAM
2 TB storage
```

Advantages:

- Simple architecture.
- Minimal application changes.
- No distributed query routing required.
- Easier transaction management.

Disadvantages:

- Hardware limits.
- Increasing costs.
- Single-server capacity remains finite.
- May require disruptive upgrades.

### 8.2 Horizontal Scaling (Scale Out)

Horizontal scaling means adding more servers.

```text
        Database Workload
                |
       -------------------
       |        |        |
       v        v        v
     Server 1 Server 2 Server 3
```

Replication and sharding are common horizontal scaling techniques, but they distribute work differently.

| Feature             | Vertical Scaling        | Horizontal Scaling                   |
| ------------------- | ----------------------- | ------------------------------------ |
| Approach            | Upgrade existing server | Add more servers                     |
| Capacity            | Limited by server size  | Can grow across servers              |
| Complexity          | Lower                   | Higher                               |
| Application changes | Usually fewer           | May require routing and coordination |
| Example             | Increase RAM and CPU    | Add shards or read replicas          |

### 8.3 When Should You Scale Vertically First?

Do not jump to sharding simply because your database is growing.

First investigate:

- Slow queries.
- Missing indexes.
- Inefficient JOINs.
- Excessive database connections.
- Poor caching.
- Unnecessary database calls.
- Inefficient data models.
- Inadequate hardware.

A properly indexed and configured single database can handle substantial workloads.

Sharding introduces complexity that should be justified by actual capacity or workload requirements.

---

## 9. How These Techniques Work Together

This is the most important section of the chapter.

A real-world database architecture rarely uses only one technique.

Let's design a growing e-commerce platform.

### 9.1 Initial Architecture

Suppose the application has:

- 100,000 users.
- 500,000 orders.
- 10,000 products.
- Moderate traffic.

A single PostgreSQL database may be sufficient.

```text
              Node.js Application
                      |
                      v
                PostgreSQL
                 Database
```

Inside the database:

- Normalize core relational entities.
- Add indexes for important queries.
- Use transactions for business operations.
- Partition large tables only when useful.

There is no reason to introduce sharding yet.

### 9.2 Stage 2: Read Traffic Increases

Now the application has:

- 5 million users.
- 30 million orders.
- High read traffic.

The primary database is experiencing read pressure.

Introduce read replicas.

```text
               Node.js Application
                       |
             ---------------------
             |         |         |
             v         v         v
           Primary  Replica 1  Replica 2
             DB        DB        DB
```

Now:

- Writes go to the primary.
- Eligible reads go to replicas.
- Strong read-after-write requirements are routed appropriately.

This is replication.

### 9.3 Stage 3: Large Tables Become Difficult to Manage

The orders table grows to hundreds of millions of records.

You may partition it by date.

```text
                PostgreSQL Primary
                       |
                     orders
                       |
          --------------------------
          |           |            |
          v           v            v
       2026 Q1     2026 Q2      2026 Q3
       Partition   Partition    Partition
```

This is partitioning.

It can improve manageability and query performance when queries align with the partition key.

It does not automatically distribute data across multiple database servers.

### 9.4 Stage 4: Single Database Capacity Becomes Insufficient

Now the application has:

- 100 million users.
- 1 billion orders.
- Very high write traffic.
- Storage requirements beyond the capacity of one database server.

You may introduce sharding.

```text
                    Application
                         |
                    Shard Router
                         |
             ------------------------
             |          |           |
             v          v           v
          Shard 1    Shard 2     Shard 3
          Users      Users       Users
          1-33M      33-66M      66-100M
```

Each shard handles a portion of the dataset.

This distributes the workload.

### 9.5 Stage 5: Replicate Each Shard

Sharding helps distribute the data, but each shard can still fail.

We can replicate each shard.

```text
                     Application
                          |
                     Shard Router
                          |
           -------------------------------
           |              |              |
           v              v              v
        Shard 1         Shard 2         Shard 3
           |              |              |
       ----------     ----------     ----------
       |        |     |        |     |        |
       v        v     v        v     v        v
     Primary Replica Primary Replica Primary Replica
```

Now the architecture uses both sharding and replication.

- Sharding distributes different data subsets.
- Replication provides copies of each subset.

This is a common architectural pattern in distributed databases.

### 9.6 Stage 6: Denormalize Selected Read Paths

Suppose the product listing page is extremely read-heavy.

The normalized database contains:

```text
products
categories
product_images
inventory
```

Fetching everything may require multiple JOINs.

For a specific read path, you may maintain a denormalized representation:

```json
{
  "productId": 101,
  "name": "Wireless Mouse",
  "categoryName": "Electronics",
  "price": 1200,
  "imageUrl": "/images/mouse.jpg",
  "available": true
}
```

This representation can be maintained in:

- A denormalized database table.
- A materialized view.
- Redis.
- A search index.
- A document database.

The normalized source of truth can remain intact.

The denormalized representation is optimized for a particular access pattern.

---

## 10. Complete Architecture Example

Consider a large e-commerce platform.

A possible architecture:

```text
                       CLIENT
                         |
                         v
                    API Gateway
                         |
                         v
                   Node.js Backend
                         |
             -------------------------
             |           |           |
             v           v           v
          User API    Order API   Product API
             |           |           |
             v           v           v
          User DB     Order DB    Product DB
             |           |           |
          Sharding    Sharding    Replication
             |           |           |
          Replicas    Replicas    Read Replicas
             |
             v
       Redis Cache
             |
             v
       Message Broker
             |
      -------------------
      |        |        |
      v        v        v
   Search   Analytics  Notifications
   Index    Pipeline   Service
```

This is a conceptual architecture, not a mandatory design.

A production system may use fewer databases, different services, or a distributed SQL database instead.

### Where Do the Techniques Apply?

| Technique          | Example in This Architecture                                    |
| ------------------ | --------------------------------------------------------------- |
| Normalization      | Core relational entities such as users, orders, and order items |
| Denormalization    | Product listing documents or order snapshots                    |
| Replication        | Copies of database shards for availability and read scaling     |
| Sharding           | Distributing users or orders across database servers            |
| Partitioning       | Dividing large orders or event tables by date                   |
| Vertical Scaling   | Increasing CPU, RAM, or storage on a database server            |
| Horizontal Scaling | Adding shards or replicas                                       |
| Caching            | Frequently accessed product and user data                       |

---

## 11. Choosing the Right Technique

Use the actual bottleneck to guide the decision.

| Problem                                               | Potential Solution                                 |
| ----------------------------------------------------- | -------------------------------------------------- |
| Repeated data causes update anomalies                 | Normalization                                      |
| Frequently accessed query requires expensive JOINs    | Denormalization, caching, or a suitable read model |
| Read traffic overwhelms one database                  | Read replicas                                      |
| Single database server lacks CPU/RAM                  | Vertical scaling or workload optimization          |
| One server cannot store or process the total workload | Sharding                                           |
| A very large table is difficult to manage             | Partitioning                                       |
| One shard receives disproportionate traffic           | Better shard key, splitting, or rebalancing        |
| Analytics queries affect production transactions      | Separate analytical workload or OLAP system        |

### Important Decision Rule

Do not choose a database architecture based on the number of users alone.

A system with 10 million mostly inactive users may require fewer resources than a system with 100,000 users generating thousands of requests per second.

Consider:

- Read throughput.
- Write throughput.
- Data volume.
- Query complexity.
- Latency requirements.
- Consistency requirements.
- Availability requirements.
- Growth rate.
- Operational capacity.

---

## 12. Common Mistakes in Database Architecture

### Mistake 1: Sharding Too Early

A team starts with multiple shards before understanding the workload.

Consequences:

- More infrastructure.
- More complex queries.
- More difficult transactions.
- More complicated deployments.

**Better approach:** Optimize the single database first and introduce sharding when there is a demonstrated need.

### Mistake 2: Treating Replication as a Write-Scaling Solution

Adding read replicas does not automatically distribute writes.

**Better approach:** Understand the read/write workload and the capabilities of the replication architecture.

### Mistake 3: Denormalizing Everything

Duplicating every related field creates synchronization problems.

**Better approach:** Denormalize only data that benefits from duplication and define how it is maintained.

### Mistake 4: Normalizing Without Considering Access Patterns

A highly normalized schema may lead to expensive query patterns in a read-heavy application.

**Better approach:** Start with a correct relational model, then optimize measured bottlenecks.

### Mistake 5: Confusing Partitioning With Sharding

Creating PostgreSQL table partitions does not automatically create multiple independent database servers.

**Better approach:** Understand whether the problem is managing a large table or distributing workload across machines.

### Mistake 6: Assuming Sharding Makes Everything Faster

A query that touches every shard may be slower than a query against one database.

**Better approach:** Design shard keys around actual access patterns and avoid unnecessary scatter-gather queries.

### Mistake 7: Ignoring Consistency

Reading from replicas or asynchronously updated denormalized stores can return stale data.

**Better approach:** Identify which operations require strong consistency and route or coordinate them accordingly.

---

## 13. Interview Questions

### Q1. What is the difference between normalization and denormalization?

Normalization reduces unnecessary duplication and improves data integrity.

Denormalization intentionally duplicates selected data to improve read performance or simplify access patterns.

### Q2. What is the difference between replication and sharding?

Replication maintains copies of data across servers.

Sharding distributes different subsets of data across servers.

### Q3. Can replication and sharding be used together?

Yes.

Each shard can have its own replicas.

This provides data distribution as well as replica-based availability and read scaling.

### Q4. Does replication increase write throughput?

Not automatically.

In a primary-replica architecture, writes generally go to the primary.

### Q5. Does sharding improve every query?

No.

Queries targeting one shard can benefit from routing, but queries involving multiple shards may require additional network communication and result merging.

### Q6. What is the difference between partitioning and sharding?

Partitioning divides a table into smaller pieces, often within one database cluster.

Sharding distributes data across independent database servers.

### Q7. Can partitioning and sharding be combined?

Yes.

Tables can be partitioned within each shard.

### Q8. When should you denormalize a database?

When a measured access pattern benefits from duplicated data, fewer JOINs, or a specialized read model, and the synchronization cost is acceptable.

### Q9. What is the difference between vertical and horizontal scaling?

Vertical scaling increases the resources of an existing server.

Horizontal scaling adds servers and distributes workload.

### Q10. Why should you avoid sharding too early?

It introduces distributed transaction, query routing, migration, consistency, and operational complexity.

### Q11. What is read scaling?

Increasing the system's ability to handle read requests, commonly using caching and read replicas.

### Q12. What is write scaling?

Increasing the system's ability to process writes, potentially through better optimization, workload separation, sharding, or other distributed architectures.

### Q13. Why does a denormalized database need synchronization?

Because duplicated values can become inconsistent when the original source data changes.

### Q14. Can a normalized database still be high performance?

Yes.

Good indexes, efficient queries, appropriate hardware, caching, and database configuration can make normalized databases perform very well.

### Q15. How would you scale a database for 100 million users?

There is no universal answer.

A sensible approach is to measure the workload, optimize queries and indexes, scale vertically where appropriate, introduce replicas for read scaling, partition large tables where useful, and consider sharding when a single database can no longer meet capacity or throughput requirements.

---

## 14. Practical Design Exercise

### Scenario

You are designing a social commerce application.

Requirements:

- 50 million users.
- 200 million products.
- 1 billion orders.
- High product browsing traffic.
- High order creation traffic.
- Users must see their latest orders.
- Analytics dashboards can tolerate delayed data.
- Product search must be fast.

### Exercise A: Data Modeling

Identify which entities should be normalized.

Suggested entities:

- Users
- Products
- Categories
- Orders
- Order Items
- Payments
- Inventory

Explain why order item prices should preserve the purchase-time price rather than depend on the current product catalog price.

### Exercise B: Read Scaling

Product browsing traffic is very high.

Which techniques could help?

Possible approaches:

- Read replicas.
- Redis caching.
- Denormalized product read models.
- Search indexes.

### Exercise C: Write Scaling

Order creation is overwhelming one database.

What should you investigate first?

- Query performance.
- Index overhead.
- Connection management.
- Transaction duration.
- Hardware bottlenecks.
- Write distribution.

If one server cannot meet the required capacity, evaluate sharding.

### Exercise D: Data Distribution

You decide to shard orders by `user_id`.

Questions:

1. Why is `user_id` a potentially useful shard key?
2. What happens when a user requests all their orders?
3. What happens when the business asks for all orders across every user?
4. What happens when one tenant generates significantly more orders than others?

Think about targeted routing, scatter-gather queries, and hot shards.

### Exercise E: Complete Architecture

Draw an architecture that combines:

- Normalized transactional data.
- Denormalized product read model.
- Sharded orders.
- Replicas for read scaling.
- Redis caching.
- Partitioned event tables.
- An analytics pipeline.

The objective is not to use every technique everywhere. It is to justify each decision.

---

## 15. Final Revision Sheet

| Concept            | Remember This                                             |
| ------------------ | --------------------------------------------------------- |
| Normalization      | Organize data to reduce unnecessary duplication           |
| Denormalization    | Intentionally duplicate data for selected access patterns |
| Replication        | Maintain copies of data                                   |
| Sharding           | Divide data across servers                                |
| Partitioning       | Divide tables into smaller parts                          |
| Vertical Scaling   | Upgrade an existing server                                |
| Horizontal Scaling | Add more servers                                          |
| Read Replica       | A copy that can serve eligible reads                      |
| Primary Database   | Commonly handles writes in primary-replica architecture   |
| Read-after-write   | Ensuring a user sees their recently committed write       |
| Replication Lag    | Delay between changes on primary and replicas             |
| Shard Key          | Determines where a record belongs                         |
| Hot Shard          | A disproportionately busy shard                           |
| Rebalancing        | Redistribute data or workload                             |
| Read Model         | Data representation optimized for queries                 |
| Source of Truth    | Authoritative location for a particular piece of data     |

### The Complete Mental Model

```text
DATABASE DESIGN
       |
       v
NORMALIZATION
Organize data and protect integrity.
       |
       v
QUERY OPTIMIZATION
Indexes, efficient SQL, and execution plans.
       |
       v
DENORMALIZATION / CACHING
Optimize measured read bottlenecks.
       |
       v
VERTICAL SCALING
Increase server resources when appropriate.
       |
       v
REPLICATION
Distribute reads and improve availability.
       |
       v
PARTITIONING
Manage large tables and data ranges.
       |
       v
SHARDING
Distribute data and workload across servers.
       |
       v
SHARD REPLICATION
Maintain copies of each shard.
```

This is a conceptual progression, not a mandatory sequence. Some applications need only a subset of these techniques.

---

## 16. Completion of Part 7 — SQL Sharding & Horizontal Scaling

You have completed:

| Chapter | Topic                                    | Status    |
| ------- | ---------------------------------------- | --------- |
| 7A      | Sharding Fundamentals                    | Completed |
| 7B      | Sharding Strategies                      | Completed |
| 7C      | Query Execution in Sharded Systems       | Completed |
| 7D      | Sharding Challenges                      | Completed |
| 7E      | Sharding vs Normalization vs Replication | Completed |

### What You Should Be Able to Explain Now

1. Why databases need sharding.
2. How shard keys determine data distribution.
3. Range-based, hash-based, directory-based, geographic, and tenant-based sharding.
4. How targeted and scatter-gather queries work.
5. Why cross-shard JOINs and transactions are difficult.
6. How 2PC and Saga differ.
7. How global unique IDs are generated.
8. Why replication and sharding solve different problems.
9. How partitioning differs from sharding.
10. How normalization, denormalization, replication, and sharding can work together.

**The key architectural principle:**

Start with a correct and efficient data model. Optimize measured bottlenecks. Introduce distributed database architecture only when the workload justifies its additional complexity.
