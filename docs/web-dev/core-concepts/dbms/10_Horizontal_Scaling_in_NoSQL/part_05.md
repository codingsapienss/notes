---
sidebar_label: Sharding vs Normalization vs Replication
sidebar_position: 1
---

# Sharding vs Normalization vs Replication

## 1. Introduction

Sharding, normalization, and replication are three important database concepts.

They are often discussed together because all three influence how a database stores, organizes, and serves data.

However, **they solve three different problems**.

| Concept       | Primary purpose                                                           |
| ------------- | ------------------------------------------------------------------------- |
| Normalization | Organizes data to reduce unnecessary duplication and maintain consistency |
| Sharding      | Distributes different subsets of data across multiple database servers    |
| Replication   | Maintains copies of the same data across multiple database servers        |

A simple way to remember:

- **Normalization:** How should we organize data?
- **Sharding:** Where should different parts of data live?
- **Replication:** How should we maintain additional copies of data?

These concepts are not alternatives. A production database architecture can use all three simultaneously.

---

## 2. Normalization

### 2.1 What is normalization?

Normalization is a database design technique that organizes relational data into tables to reduce unnecessary redundancy and prevent data anomalies.

Consider an unnormalized e-commerce table:

| order_id | user_name | user_email        | product_name | quantity |
| -------- | --------- | ----------------- | ------------ | -------- |
| 101      | Rahul     | rahul@example.com | Laptop       | 1        |
| 102      | Rahul     | rahul@example.com | Mouse        | 2        |
| 103      | Amit      | amit@example.com  | Keyboard     | 1        |

Notice that Rahul's name and email are repeated.

If Rahul places 100 orders, his information may be repeated 100 times.

This creates problems:

- Unnecessary data duplication.
- Update anomalies.
- Insert anomalies.
- Delete anomalies.

### 2.2 Normalize the data

We can separate users, orders, and products into different tables.

**Users**

| user_id | name  | email             |
| ------- | ----- | ----------------- |
| 1       | Rahul | rahul@example.com |
| 2       | Amit  | amit@example.com  |

**Orders**

| order_id | user_id | product_id | quantity |
| -------- | ------- | ---------- | -------- |
| 101      | 1       | 10         | 1        |
| 102      | 1       | 11         | 2        |
| 103      | 2       | 12         | 1        |

**Products**

| product_id | product_name |
| ---------- | ------------ |
| 10         | Laptop       |
| 11         | Mouse        |
| 12         | Keyboard     |

Now user information is stored once in the Users table.

Orders reference users through `user_id`.

### 2.3 SQL implementation

```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(150)
);

CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    product_id BIGINT REFERENCES products(product_id),
    quantity INT NOT NULL
);
```

We can retrieve the combined information using JOIN:

```sql
SELECT
    o.order_id,
    u.name,
    u.email,
    p.product_name,
    o.quantity
FROM orders o
JOIN users u
    ON o.user_id = u.user_id
JOIN products p
    ON o.product_id = p.product_id;
```

### 2.4 What problem does normalization solve?

Normalization primarily addresses data organization and integrity.

For example, if Rahul changes his email address, we update one row in the users table instead of updating every order record containing his email.

**Normalization does not distribute data across servers.**

It is a data-modeling technique, not a horizontal-scaling technique.

---

## 3. Sharding

### 3.1 What is sharding?

Sharding divides a dataset into smaller subsets and distributes those subsets across multiple independent database servers.

Each server stores only part of the overall dataset.

Suppose an application has 30 million users.

Instead of storing all users on one database server, we distribute them:

```text
              Users Dataset
               30 Million
                    |
             Shard Distribution
                    |
         +----------+----------+
         |          |          |
         v          v          v
      Shard A    Shard B    Shard C
      10 Million 10 Million 10 Million
```

Each shard stores a different subset of users.

### 3.2 Example: Hash-based sharding

Suppose we use the following routing rule:

```javascript
function getShard(userId) {
  return userId % 3;
}
```

The mapping is:

| User ID | Calculation | Shard   |
| ------- | ----------- | ------- |
| 100     | 100 % 3 = 1 | Shard B |
| 101     | 101 % 3 = 2 | Shard C |
| 102     | 102 % 3 = 0 | Shard A |
| 103     | 103 % 3 = 1 | Shard B |
| 104     | 104 % 3 = 2 | Shard C |

The application routes each user request to the appropriate database.

### 3.3 Architecture

```text
                 Node.js API
                      |
                      v
                 Shard Router
                      |
           +----------+----------+
           |          |          |
           v          v          v
        Shard A    Shard B    Shard C
        Database   Database   Database
```

### 3.4 What problem does sharding solve?

Sharding helps distribute:

- Storage requirements.
- Write workload.
- Query workload for targeted requests.
- Database resource consumption.

It can increase the total capacity of a database system beyond what one server can provide.

However, it introduces additional complexity:

- Shard routing.
- Cross-shard queries.
- Distributed transactions.
- Rebalancing.
- Global ID generation.

**Sharding is a horizontal data-distribution technique.**

---

## 4. Replication

### 4.1 What is replication?

Replication means maintaining copies of the same data across multiple database servers.

Unlike sharding, where each server stores a different subset, replicas maintain copies of the same logical dataset.

Example:

```text
                 Primary Database
                       |
                Replication
                 /         \
                v           v
             Replica A   Replica B
```

All three database servers contain copies of the same database data, subject to replication lag and the configured replication behavior.

### 4.2 Why do we need replication?

Suppose an application has:

- 10,000 read requests per second.
- 1,000 write requests per second.

If every read and write goes to one database server, the primary may become overloaded.

We can distribute read traffic to replicas.

```text
                  Application
                       |
                 Load Balancer
                       |
          +------------+------------+
          |                         |
          v                         v
       Write Requests            Read Requests
          |                         |
          v                    +----+----+
        Primary                |         |
          |                    v         v
          |                 Replica A Replica B
          |
          +------ Replication -------> Replicas
```

A simplified request-routing strategy:

| Request | Database                 |
| ------- | ------------------------ |
| INSERT  | Primary                  |
| UPDATE  | Primary                  |
| DELETE  | Primary                  |
| SELECT  | Replica, when acceptable |

This can improve read capacity.

However, not every SELECT should automatically go to a replica.

With asynchronous replication, a replica may not yet have received the latest committed changes.

For example:

1. A user updates their profile.
2. The primary commits the update.
3. The application immediately reads from a replica.
4. The replica has not received the update yet.
5. The application returns the old profile information.

This is replication lag.

### 4.3 Replication and high availability

Replication can also help with availability.

If the primary becomes unavailable, an eligible replica may be promoted to become the new primary.

However, replication alone is not a complete high-availability solution. Failover detection, promotion, routing changes, and data-loss considerations also matter.

### 4.4 What problem does replication solve?

Replication primarily helps with:

- Read scalability.
- Availability.
- Redundancy.
- Geographic distribution.
- Disaster recovery when combined with appropriate backup and recovery procedures.

**Replication maintains copies of data. It does not divide the original dataset into independent subsets.**

---

## 5. The Core Difference: Side-by-Side Comparison

| Dimension                 | Normalization                           | Sharding                             | Replication                                    |
| ------------------------- | --------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| Main purpose              | Organize data                           | Distribute data                      | Copy data                                      |
| Primary problem solved    | Redundancy and anomalies                | Capacity and horizontal scaling      | Read scaling and availability                  |
| Data duplication          | Usually reduces unnecessary duplication | Each shard stores a different subset | Intentionally creates copies                   |
| Multiple servers required | No                                      | Yes                                  | Yes, in distributed replication                |
| Data distribution         | No                                      | Yes                                  | Copies across servers                          |
| Main concern              | Data integrity and schema design        | Routing and distribution             | Synchronization and consistency                |
| Example                   | Separate users and orders tables        | Users divided across three databases | Three database servers holding replicated data |

The key distinction:

```text
NORMALIZATION
    Organize data
         |
         v
    Users / Orders / Products


SHARDING
    Divide data
         |
         v
    Shard A / Shard B / Shard C


REPLICATION
    Copy data
         |
         v
    Primary / Replica A / Replica B
```

---

## 6. Can We Use All Three Together?

Yes. In fact, a large production system may use all three.

Let's design a realistic e-commerce architecture.

### 6.1 Business requirements

Suppose our application has:

- 50 million users.
- 200 million orders.
- 100,000 products.
- Millions of daily transactions.
- High read traffic.
- Requirements for data integrity and availability.

We need to consider:

1. How should the data be organized?
2. How should it be distributed?
3. How should it remain available if a database server fails?
4. How should read traffic be handled?

We can use normalization, sharding, and replication together.

### 6.2 Step 1: Normalize the database schema

First, organize relational data into tables.

```text
Users
-----
user_id
name
email

Products
--------
product_id
name
price

Orders
------
order_id
user_id
created_at

Order_Items
-----------
order_item_id
order_id
product_id
quantity
```

This provides a structured relational model.

Relationships are maintained using primary and foreign keys within the database where those constraints can be enforced.

### 6.3 Step 2: Shard the data

As the dataset grows, divide users and their associated order data across multiple database shards.

For example:

```text
                  E-commerce Database
                           |
                     Shard Router
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
          Shard A       Shard B       Shard C
             |             |             |
             v             v             v
          Users 1-10M   Users 10-20M  Users 20-30M
          Their orders  Their orders  Their orders
```

A possible strategy is to shard by `user_id`.

This keeps user-specific orders together when the data model and routing design consistently use the same shard key.

However, product catalog data may need a separate distribution strategy because many users access the same products.

### 6.4 Step 3: Replicate each shard

Now suppose each shard has one primary and two replicas.

```text
                        Application
                             |
                        Shard Router
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
           Shard A        Shard B        Shard C
              |              |              |
          +---+---+      +---+---+      +---+---+
          |   |   |      |   |   |      |   |   |
          v   v   v      v   v   v      v   v   v
          P   R   R      P   R   R      P   R   R
```

Legend:

- P = Primary.
- R = Replica.

Each shard contains only its assigned subset of the total dataset.

Its replicas contain copies of that shard's data.

This gives us both:

- **Sharding:** Distributes different subsets across shard groups.
- **Replication:** Copies each subset across multiple servers.

### 6.5 Step 4: Read and write routing

A simplified routing strategy:

```text
WRITE:
Application
    |
Shard Router
    |
Correct Shard Primary


READ:
Application
    |
Shard Router
    |
Correct Shard Replica
```

For read-after-write operations, the application may need to read from the primary or use a consistency-aware strategy.

### 6.6 Complete architecture

<escape>```text
Node.js Application
|
v
Shard Router
|
+-------------+-------------+
| | |
v v v
Shard A Shard B Shard C
| | |
+---+---+ +---+---+ +---+---+
| | | | | | | | |
v v v v v v v v v
P R R P R R P R R

             Each shard contains:
             - Normalized relational tables
             - A subset of the overall dataset

             Each replica contains:
             - A copy of its shard's data

````</escape>

This is an example of combining all three concepts.

---

## 7. Important Distinction: Replication Does Not Mean Sharding

Consider a database with 30 million users.

### Scenario A: Replication

```text
              All 30 Million Users
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Server A     Server B     Server C
       30 Million   30 Million   30 Million
````

Each server contains the same logical dataset.

The total logical dataset is still 30 million users.

Replication improves redundancy and can distribute read traffic, but it does not split the original dataset into smaller independent subsets.

### Scenario B: Sharding

```text
              All 30 Million Users
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Server A     Server B     Server C
       10 Million   10 Million   10 Million
```

Each server stores a different subset.

The complete dataset is distributed across the servers.

### Scenario C: Sharding + Replication

```text
                   30 Million Users
                          |
                    Shard Distribution
                          |
             +------------+------------+
             |            |            |
             v            v            v
           Shard A      Shard B      Shard C
             |            |            |
          +--+--+      +--+--+      +--+--+
          |     |      |     |      |     |
          v     v      v     v      v     v
       Primary Replica Primary Replica Primary Replica
       10M     10M     10M     10M     10M     10M
```

Now:

- Sharding distributes the 30 million users across three shards.
- Replication maintains copies of each shard's 10 million users.

This is a common pattern in distributed database architecture.

---

## 8. Does Normalization Always Improve Performance?

No.

Normalization improves data organization and helps maintain consistency, but it can increase the number of JOINs required by queries.

Consider this normalized structure:

```text
users
orders
order_items
products
```

To retrieve a complete order, the database may need several JOINs.

```sql
SELECT
    o.order_id,
    u.name,
    p.product_name,
    oi.quantity
FROM orders o
JOIN users u
    ON u.user_id = o.user_id
JOIN order_items oi
    ON oi.order_id = o.order_id
JOIN products p
    ON p.product_id = oi.product_id;
```

For some high-read workloads, repeated JOINs may be expensive.

A system might deliberately denormalize selected data.

### Example: Store a product name in order items

```text
order_items
-----------
order_item_id
order_id
product_id
product_name_snapshot
quantity
unit_price_snapshot
```

Why?

Because historical orders should generally preserve the product name and price as they were at the time of purchase.

If the product's current name or price changes, the historical order should not change.

This is a form of intentional duplication with a business purpose.

### Normalization vs denormalization

| Normalization                                         | Denormalization                                        |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Reduces unnecessary duplication                       | Intentionally duplicates selected data                 |
| Improves consistency through structured relationships | Can simplify reads                                     |
| Often requires JOINs                                  | Can reduce JOIN requirements                           |
| Useful for transactional data modeling                | Useful for selected read-heavy access patterns         |
| Reduces update anomalies                              | Requires careful synchronization or snapshot semantics |

**Important:** Denormalization is not automatically bad database design. It is a deliberate trade-off when the benefits justify the added consistency responsibilities.

---

## 9. Does Sharding Automatically Improve Query Performance?

No.

Sharding can increase total system capacity, but an individual query may become slower if it needs to contact multiple shards.

### Targeted query

Suppose we shard by `user_id`.

```sql
SELECT *
FROM orders
WHERE user_id = 1050;
```

The application can identify the responsible shard.

```text
Application
    |
Shard Router
    |
Shard B
```

Only one shard needs to be contacted.

### Scatter-gather query

Now consider:

```sql
SELECT COUNT(*)
FROM orders
WHERE status = 'pending';
```

If `status` is not part of the shard key or another routing mechanism, the query may need to contact all shards.

```text
                 Application
                      |
                 Query Router
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       Shard A     Shard B     Shard C
          |           |           |
          +-----------+-----------+
                      |
                      v
               Merge Results
```

This is called a scatter-gather operation.

The application or distributed query engine combines results from multiple shards.

Therefore:

- Sharding can improve overall throughput.
- Targeted queries can benefit significantly.
- Scatter-gather queries may introduce network and coordination costs.
- Sharding does not automatically make every query faster.

---

## 10. Does Replication Automatically Improve Availability?

No.

Replication provides additional copies, but availability depends on the complete system.

Consider:

```text
Primary Database
      |
   Replicas
```

If the primary fails, the system needs a mechanism to:

1. Detect the failure.
2. Select an eligible replica.
3. Promote the replica.
4. Redirect application traffic.
5. Prevent conflicting primaries.
6. Recover or reconcile any missing data, if necessary.

Other risks include:

- Replication lag.
- Network partitions.
- Incorrect failover configuration.
- Accidental deletion replicated to all replicas.
- Replica corruption.

Also, **replication is not a backup**.

If a user accidentally deletes a record and that deletion is replicated, all replicas may also lose the record.

Backups and point-in-time recovery protect against different failure scenarios.

---

## 11. Comparing the Three Through Real-World Scenarios

| Requirement                                           | Normalization                                | Sharding                                                | Replication                                   |
| ----------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| Reduce repeated user information                      | Yes                                          | No                                                      | No                                            |
| Divide 100 million users across servers               | No                                           | Yes                                                     | No                                            |
| Maintain copies of database data                      | No                                           | No                                                      | Yes                                           |
| Reduce update anomalies                               | Yes                                          | No                                                      | No                                            |
| Distribute read traffic                               | No, not by itself                            | Can distribute queries                                  | Yes, with suitable read routing               |
| Increase total storage capacity across database nodes | No                                           | Yes                                                     | Generally no, because replicas duplicate data |
| Help with database failover                           | No                                           | Not by itself                                           | Yes, with failover infrastructure             |
| Reduce JOIN requirements                              | Not necessarily                              | Not necessarily                                         | No                                            |
| Maintain relational data integrity                    | Yes, with appropriate constraints and design | Within the scope of enforceable shard-local constraints | Copies existing data and constraints          |

---

## 12. Common Misconceptions

| Misconception                                        | Correct understanding                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| Normalization is a scaling technique                 | It is primarily a relational data-modeling technique               |
| Sharding creates copies of data                      | Sharding distributes different subsets                             |
| Replication divides data into smaller subsets        | Replication creates copies of the same logical data                |
| Replication increases total logical storage capacity | It increases physical storage consumption because data is copied   |
| Sharding automatically improves every query          | Cross-shard queries may become more expensive                      |
| Normalization always improves read performance       | It can require additional JOINs                                    |
| Denormalization is always bad                        | It can be useful when duplication is intentional and managed       |
| Replication is a backup                              | Replication alone does not protect against all data-loss scenarios |
| We must choose only one of the three                 | They solve different problems and can be combined                  |

---

## 13. Interview Questions and Answers

### Q1. What is the difference between normalization and sharding?

Normalization organizes data into related tables to reduce unnecessary redundancy. Sharding distributes different subsets of data across multiple database servers.

### Q2. What is the difference between sharding and replication?

Sharding distributes different subsets of data across servers. Replication maintains copies of the same data across servers.

### Q3. Can we use sharding and replication together?

Yes. Each shard can have its own replicas. This distributes the overall dataset and maintains additional copies of each subset.

### Q4. Can we use normalization with sharding?

Yes. Each shard can contain normalized relational tables. The application distributes records across shards according to a shard key.

### Q5. Does replication improve write performance?

Not necessarily. In primary-based replication architectures, writes generally go through the primary. Synchronous replication may add write latency because replicas must acknowledge changes.

Some distributed databases distribute writes differently, but replication itself should not be assumed to increase write capacity.

### Q6. Does sharding improve read performance?

It can. If queries are targeted to individual shards, read workload can be distributed. Scatter-gather queries may become more expensive.

### Q7. Why do we need normalization if we can use JOINs?

JOINs allow related data to be stored separately while still being retrieved together. This reduces unnecessary duplication and update anomalies.

### Q8. What is denormalization?

Denormalization intentionally duplicates selected data to improve query performance or simplify read access. It introduces additional data consistency responsibilities.

### Q9. Is replication a backup?

No. Replication copies changes, including accidental updates and deletions. Backups provide recovery from scenarios that replication cannot protect against.

### Q10. What happens when one shard fails?

The affected data may become unavailable unless the shard has suitable replicas and a configured failover mechanism.

### Q11. Can we replicate each shard independently?

Yes. A common distributed architecture maintains a primary and one or more replicas for every shard.

### Q12. What is the difference between horizontal scaling and replication?

Horizontal scaling adds machines to distribute workload or capacity. Replication copies data across machines. Replication can support horizontal read scaling, but it is not the same as distributing different data subsets.

### Q13. Which is more important: normalization or denormalization?

Neither is universally better. Start with a data model that preserves correctness and supports the required queries. Introduce denormalization when measured workload requirements justify it.

### Q14. Can replication cause stale reads?

Yes. Asynchronous replication can cause replication lag, so a replica may return older data than the primary.

### Q15. What are the three concepts in one sentence?

Normalization organizes data, sharding distributes data, and replication copies data.

---

## 14. Practical Exercises

### Exercise 1: Identify the concept

Identify whether each situation uses normalization, sharding, replication, or a combination.

1. Moving user information into a separate Users table.
2. Dividing 30 million users across three PostgreSQL databases.
3. Maintaining two standby copies of a PostgreSQL primary.
4. Keeping each shard's data on three database servers.
5. Storing a historical product name in an order item.
6. Dividing a large orders table into monthly partitions on one PostgreSQL instance.

### Exercise 2: Design an architecture

You are building an application with:

```text
Users: 50 Million
Orders: 200 Million
Products: 100,000
Payments: 80 Million
```

Design a database architecture.

Answer these questions:

1. Which tables should be normalized?
2. Which data could be intentionally denormalized?
3. Would you shard by `user_id`, `order_id`, or another key?
4. How would you keep a user's orders accessible?
5. Would each shard need replicas?
6. How would you route reads and writes?
7. How would you handle a user update followed immediately by a read?
8. What would happen if one shard's primary failed?

### Exercise 3: Analyze this architecture

```text
                  Application
                       |
                  Shard Router
                       |
          +------------+------------+
          |            |            |
          v            v            v
        Shard A      Shard B      Shard C
          |            |            |
       Replica      Replica      Replica
```

Explain:

1. Where is sharding happening?
2. Where is replication happening?
3. What is the responsibility of the shard router?
4. What happens if Shard B's primary fails?
5. Can a query access data from multiple shards?
6. Does this architecture guarantee that every read is up to date?

### Exercise 4: Choose the correct technique

For each requirement, choose the most relevant technique.

| Requirement                                           | Your answer |
| ----------------------------------------------------- | ----------- |
| Reduce duplicate customer information                 | ?           |
| Store different customers on different servers        | ?           |
| Maintain another copy of the database                 | ?           |
| Reduce read load on the primary                       | ?           |
| Keep historical order prices unchanged                | ?           |
| Increase total storage capacity across database nodes | ?           |

---

## 15. Chapter Summary

| Concept         | Remember                                                               |
| --------------- | ---------------------------------------------------------------------- |
| Normalization   | Organizes relational data and reduces unnecessary duplication          |
| Denormalization | Intentionally duplicates selected data for a workload-specific reason  |
| Sharding        | Distributes different subsets of data across database servers          |
| Replication     | Maintains copies of data across database servers                       |
| Shard key       | Determines how records are distributed                                 |
| Replica         | A copy of data maintained by a replication mechanism                   |
| Scatter-gather  | Queries multiple shards and combines their results                     |
| Replication lag | Delay between a change on the source and its availability on a replica |
| Failover        | Switching service to another eligible database node after a failure    |
| Backup          | A separate recovery mechanism for protecting against data loss         |

### Final mental model

```text
                  DATABASE ARCHITECTURE
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     NORMALIZATION       SHARDING       REPLICATION
          |                |                |
          v                v                v
      Organize           Divide            Copy
       Data               Data              Data
          |                |                |
          v                v                v
    Data Integrity    Horizontal Scale   Availability /
                                        Read Scalability
```

**The engineering takeaway:**

Do not treat normalization, sharding, and replication as competing database strategies.

They address different architectural problems:

- Normalize to organize relational data correctly.
- Shard when one database server cannot efficiently handle the required data volume or workload.
- Replicate when you need additional copies for read scaling, availability, or recovery objectives.

A well-designed distributed database architecture may use all three.
