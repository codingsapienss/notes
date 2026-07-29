---
sidebar_label: SQL vs NoSQL
sidebar_position: 1
---

# SQL vs NoSQL

## 1. Introduction

In last section, we introduced NoSQL databases and studied their four major categories:

1. Key-Value
2. Document
3. Wide-Column
4. Graph

Now we need to answer a more important question:

**How are SQL and NoSQL databases different, and how do you decide which one to use?**

Consider an e-commerce application.

It needs to store:

- Users
- Products
- Orders
- Payments
- Inventory
- Shopping carts
- User sessions
- Product recommendations

Should we store everything in PostgreSQL?

Should we use MongoDB?

Should we use Redis?

Should we combine multiple databases?

There is no universal answer.

The correct choice depends on the data model, access patterns, consistency requirements, transaction requirements, scalability, and operational complexity.

First, understand the fundamental distinction.

**SQL databases are primarily based on the relational data model. NoSQL databases use other data models, such as key-value, document, wide-column, and graph.**

This distinction is more important than simply comparing SQL syntax with MongoDB queries.

---

## 2. What Is an SQL Database?

SQL databases are commonly called relational databases.

They organize data into tables containing rows and columns.

Example:

**users**

| user_id | name  | email             |
| ------: | ----- | ----------------- |
|     101 | Rahul | rahul@example.com |
|     102 | Amit  | amit@example.com  |

**orders**

| order_id | user_id | total_amount |
| -------: | ------: | -----------: |
|     1001 |     101 |         2500 |
|     1002 |     102 |         1800 |

The tables are related through keys.

For example:

```text
             users
        ----------------
        user_id (PK)
        name
        email
             |
             |
        user_id (FK)
             |
             v
            orders
        ----------------
        order_id (PK)
        user_id (FK)
        total_amount
```

Here:

- `users.user_id` is the primary key.
- `orders.user_id` is a foreign key.
- One user can have multiple orders.

### Example: SQL Query

```sql
SELECT
    users.name,
    orders.order_id,
    orders.total_amount
FROM users
JOIN orders
    ON users.user_id = orders.user_id;
```

The database combines related records using a JOIN.

### Popular SQL Databases

- PostgreSQL
- MySQL
- Microsoft SQL Server
- Oracle Database
- SQLite

---

## 3. What Is a NoSQL Database?

NoSQL databases use data models other than the traditional relational table model.

Different NoSQL databases organize data differently.

For example, a document database stores records as documents.

### Example: MongoDB

A user document might look like this:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "orders": [
    {
      "orderId": 1001,
      "totalAmount": 2500
    },
    {
      "orderId": 1002,
      "totalAmount": 1800
    }
  ]
}
```

The user and order information can be stored together in one document.

Another document could have a different structure:

```json
{
  "_id": 102,
  "name": "Amit",
  "email": "amit@example.com",
  "city": "Noida"
}
```

The collection does not require every document to contain exactly the same fields, although validation rules can enforce a common structure.

### Popular NoSQL Databases

| Database         | Category               |
| ---------------- | ---------------------- |
| MongoDB          | Document               |
| Redis            | Key-Value              |
| Apache Cassandra | Wide-Column            |
| Neo4j            | Graph                  |
| Amazon DynamoDB  | Key-Value and Document |

Remember: NoSQL is a broad category, not one particular database architecture.

---

## 4. SQL vs NoSQL: Fundamental Differences

Let's compare the two categories.

| Feature           | SQL                                                         | NoSQL                                                               |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Data model        | Relational                                                  | Key-value, document, wide-column, graph, etc.                       |
| Storage structure | Tables, rows, columns                                       | Depends on database model                                           |
| Schema            | Usually explicitly defined                                  | Often flexible or database-specific                                 |
| Relationships     | Commonly represented using keys and JOINs                   | Often modeled through embedding, references, or graph relationships |
| Query language    | SQL                                                         | Database-specific APIs or query languages                           |
| Transactions      | Mature ACID transaction support in major relational systems | Varies by database                                                  |
| Scaling           | Vertical and horizontal approaches                          | Many systems emphasize distributed scaling                          |
| Data duplication  | Often reduced through normalization                         | May be intentionally used for access patterns                       |
| JOIN support      | General-purpose relational JOINs                            | Varies; often more limited or model-specific                        |
| Best fit          | Relational data and complex transactional queries           | Workloads that benefit from specialized data models                 |

This table describes common tendencies, not universal rules.

For example:

- PostgreSQL supports horizontal scaling through various architectures.
- MongoDB supports multi-document transactions.
- PostgreSQL supports JSONB.
- Some NoSQL databases provide strong consistency.
- Some NoSQL databases support SQL-like query languages.

Avoid memorizing oversimplified statements.

---

## 5. Data Modeling: Tables vs Documents

This is one of the most important differences.

Let's use a practical example.

Suppose you need to store:

- Users
- Orders
- Products
- Order items

### 5.1 SQL Data Model

A normalized relational design might contain four tables.

**users**

| user_id | name  | email             |
| ------: | ----- | ----------------- |
|     101 | Rahul | rahul@example.com |
|     102 | Amit  | amit@example.com  |

**products**

| product_id | name   | price |
| ---------: | ------ | ----: |
|          1 | Laptop | 50000 |
|          2 | Mouse  |  1200 |

**orders**

| order_id | user_id | order_date |
| -------: | ------: | ---------- |
|     1001 |     101 | 2026-11-14 |
|     1002 |     102 | 2026-11-14 |

**order_items**

| order_item_id | order_id | product_id | quantity |
| ------------: | -------: | ---------: | -------: |
|             1 |     1001 |          1 |        1 |
|             2 |     1001 |          2 |        2 |

Relationships:

```text
users
  |
  | 1:N
  |
orders
  |
  | 1:N
  |
order_items
  |
  | N:1
  |
products
```

The relational model stores entities separately and connects them through keys.

### 5.2 NoSQL Document Model

In MongoDB, an order could be stored as:

```json
{
  "_id": 1001,
  "userId": 101,
  "orderDate": "2026-11-14",
  "items": [
    {
      "productId": 1,
      "productName": "Laptop",
      "quantity": 1,
      "unitPrice": 50000
    },
    {
      "productId": 2,
      "productName": "Mouse",
      "quantity": 2,
      "unitPrice": 1200
    }
  ],
  "totalAmount": 52400
}
```

The order and its items are embedded in one document.

This makes retrieving the complete order straightforward.

### 5.3 Which Model Is Better?

Neither is universally better.

Consider the access pattern.

If the application frequently retrieves an entire order with all its items, embedding can be convenient.

If products are independently updated, shared across many orders, and frequently queried independently, keeping products in a separate collection may be more appropriate.

A document database can also reference other documents instead of embedding everything.

**The important principle: Design the data model around how the application reads and writes data.**

---

## 6. Schema: Fixed vs Flexible

### 6.1 SQL Schema

In PostgreSQL:

```sql
CREATE TABLE employees (
    employee_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    salary NUMERIC(12, 2)
);
```

The table has a defined structure.

For example, PostgreSQL will reject a string value for a column that requires an incompatible numeric type.

The database also enforces declared constraints.

### 6.2 NoSQL Schema

In MongoDB:

```javascript
db.employees.insertMany([
  {
    name: "Rahul",
    email: "rahul@example.com",
    salary: 50000,
  },
  {
    name: "Amit",
    email: "amit@example.com",
    department: "Engineering",
  },
]);
```

The second document does not contain a salary field but contains a department field.

MongoDB allows this flexible structure by default.

### 6.3 Is SQL Always Fixed and NoSQL Always Flexible?

No.

This is an oversimplification.

PostgreSQL supports JSONB:

```sql
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);
```

You can store:

```json
{
  "ram": "16GB",
  "storage": "512GB SSD"
}
```

You can also define constraints and indexes on JSONB data.

MongoDB supports schema validation rules.

Therefore:

- SQL databases can store flexible JSON data.
- NoSQL databases can enforce document structures.
- Schema flexibility is a design capability, not an absolute SQL-versus-NoSQL boundary.

---

## 7. Relationships and JOINs

### 7.1 SQL Relationships

Relational databases are designed to represent relationships between entities.

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
total_amount
```

The `orders.user_id` column references `users.user_id`.

We can retrieve related information using:

```sql
SELECT
    u.name,
    o.order_id,
    o.total_amount
FROM users u
JOIN orders o
    ON u.user_id = o.user_id;
```

Relational databases provide general-purpose JOIN operations.

### 7.2 NoSQL Relationships

Document databases commonly use two approaches.

**Approach 1: Embedding**

Store related data inside the same document.

```json
{
  "_id": 101,
  "name": "Rahul",
  "address": {
    "city": "Noida",
    "country": "India"
  }
}
```

Retrieving the user also retrieves the address.

**Approach 2: Referencing**

Store a reference to another document.

Users collection:

```json
{
  "_id": 101,
  "name": "Rahul"
}
```

Orders collection:

```json
{
  "_id": 1001,
  "userId": 101,
  "totalAmount": 2500
}
```

The application can retrieve the user and orders separately.

MongoDB also provides `$lookup` for joining data from collections.

Example:

```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  },
]);
```

However, `$lookup` is not identical in performance characteristics or execution behavior to a relational database JOIN.

### 7.3 Comparison

| Feature                | SQL                               | Document Database                                     |
| ---------------------- | --------------------------------- | ----------------------------------------------------- |
| Relationships          | Keys and constraints              | Embedding or references                               |
| JOINs                  | General-purpose relational JOINs  | Database-specific capabilities such as `$lookup`      |
| Referential integrity  | Can be enforced with foreign keys | Often managed through application logic or validation |
| Related data retrieval | JOINs or multiple queries         | Embedding, references, or lookup operations           |

### Important Design Consideration

If two pieces of data are almost always accessed together and have a suitable lifecycle, embedding may be useful.

If they have independent lifecycles, are shared by many records, or can grow without bound, references may be more appropriate.

---

## 8. Normalization vs Denormalization

### 8.1 SQL: Normalization

Relational database design commonly uses normalization to reduce unnecessary duplication.

Example:

```text
users
-----
user_id
name
email

orders
------
order_id
user_id
total_amount
```

Customer information is stored once in the users table.

### 8.2 NoSQL: Denormalization

Document databases frequently use denormalization to make common reads efficient.

Example:

```json
{
  "_id": 1001,
  "user": {
    "userId": 101,
    "name": "Rahul",
    "email": "rahul@example.com"
  },
  "totalAmount": 2500
}
```

The user details are copied into the order document.

Now the order can be displayed without fetching the user document.

### 8.3 Does NoSQL Always Mean Denormalization?

No.

A document database can use references and separate collections.

Similarly, relational databases can use denormalization when justified by workload requirements.

### Comparison

| Aspect         | Normalized Design                     | Denormalized Design                |
| -------------- | ------------------------------------- | ---------------------------------- |
| Duplication    | Reduced                               | Intentionally introduced           |
| Data integrity | Easier to maintain centrally          | Requires synchronization           |
| Reads          | May need JOINs                        | Often simpler for selected queries |
| Writes         | Often update one authoritative record | May update multiple copies         |
| Storage        | Often less duplicated data            | May require more storage           |

**Do not normalize or denormalize simply because you selected SQL or NoSQL. Make the decision based on the data and access patterns.**

---

## 9. Transactions and ACID

This is one of the most misunderstood comparisons.

A common statement is:

"SQL supports ACID, but NoSQL does not."

That statement is incorrect.

### 9.1 SQL Transactions

PostgreSQL supports ACID transactions.

Example:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 2;

COMMIT;
```

Both updates are committed together.

If an error occurs, the application can roll back the transaction.

### 9.2 MongoDB Transactions

MongoDB supports multi-document ACID transactions.

Example:

```javascript
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    await accounts.updateOne(
      { _id: 1 },
      { $inc: { balance: -1000 } },
      { session },
    );

    await accounts.updateOne(
      { _id: 2 },
      { $inc: { balance: 1000 } },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```

Both updates participate in the same transaction.

MongoDB transactions have performance and operational considerations, particularly in distributed deployments.

### 9.3 Different Transaction Models

| Feature                        | PostgreSQL                             | MongoDB                                                                                       |
| ------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Atomic single-record operation | Yes                                    | Yes, at document level                                                                        |
| Multi-record transactions      | Yes                                    | Yes                                                                                           |
| ACID transactions              | Yes                                    | Yes                                                                                           |
| Foreign-key constraints        | Yes                                    | No equivalent built-in cross-collection foreign-key mechanism                                 |
| General relational JOINs       | Yes                                    | Database-specific aggregation capabilities                                                    |
| Distributed transactions       | Depends on architecture and extensions | Multi-document transactions across supported deployments, with specific costs and limitations |

### 9.4 What Should You Consider?

Do not compare databases only by asking whether they support ACID.

Consider:

1. What is the transaction scope?
2. Which isolation guarantees are available?
3. How expensive are transactions?
4. What happens when a node fails?
5. Can the transaction span multiple partitions or shards?
6. Does the application actually need a multi-record transaction?

---

## 10. Consistency Models

Consistency describes what values a read is allowed to observe after writes occur.

### 10.1 Strong Consistency

A read observes the latest committed write according to the database's consistency guarantee.

Example:

```text
Write:
Account balance = 5000

Next Read:
Account balance = 5000
```

### 10.2 Eventual Consistency

Replicas may temporarily return different values.

Example:

```text
Node 1: status = ACTIVE
Node 2: status = INACTIVE
```

After replication catches up:

```text
Node 1: status = ACTIVE
Node 2: status = ACTIVE
```

### 10.3 SQL vs NoSQL

It is incorrect to say that SQL always means strong consistency and NoSQL always means eventual consistency.

Examples:

- PostgreSQL provides transactional consistency guarantees.
- MongoDB provides configurable read and write concerns.
- Cassandra offers tunable consistency levels.
- Redis deployments have consistency behavior dependent on architecture and replication configuration.

Consistency depends on the specific database, deployment, and configuration.

### 10.4 Business Requirements Matter

| Operation               | Possible Requirement                   |
| ----------------------- | -------------------------------------- |
| Bank transfer           | Strong transactional correctness       |
| Inventory reservation   | Strong coordination                    |
| Social media like count | Eventual consistency may be acceptable |
| Analytics dashboard     | Delayed data may be acceptable         |
| Product recommendation  | Some staleness may be acceptable       |

A good system may use different consistency guarantees for different operations.

---

## 11. Scaling: Vertical and Horizontal

### 11.1 Vertical Scaling

Increase the resources of an existing server.

```text
Before:
8 CPU cores
32 GB RAM

After:
32 CPU cores
128 GB RAM
```

Both relational and NoSQL databases can use vertical scaling.

### 11.2 Horizontal Scaling

Add more servers and distribute data or workload.

```text
        Application
             |
      ----------------
      |      |       |
      v      v       v
    Node 1 Node 2  Node 3
```

Many NoSQL databases were designed with distributed scaling as a central feature.

Examples:

- MongoDB sharding.
- Cassandra partitioning.
- Redis Cluster.

However, relational databases can also scale horizontally.

Examples include:

- PostgreSQL streaming replication.
- PostgreSQL sharding solutions.
- MySQL replication and sharding architectures.
- Distributed SQL databases.

### 11.3 Scaling Comparison

| Feature                  | SQL                                         | NoSQL                               |
| ------------------------ | ------------------------------------------- | ----------------------------------- |
| Vertical scaling         | Supported                                   | Supported                           |
| Replication              | Supported                                   | Supported                           |
| Horizontal scaling       | Supported through different architectures   | Commonly emphasized by many systems |
| Sharding                 | Supported through different implementations | Supported by several systems        |
| Distributed transactions | Depends on database architecture            | Depends on database architecture    |

**Important:** NoSQL is not automatically more scalable than SQL. Scalability depends on the specific database and workload.

---

## 12. Query Languages

### 12.1 SQL Query Example

Retrieve orders for a particular user:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

Join orders with users:

```sql
SELECT
    u.name,
    o.order_id,
    o.total_amount
FROM users u
JOIN orders o
    ON u.user_id = o.user_id
WHERE u.user_id = 101;
```

SQL is a standardized declarative language, although database-specific extensions and syntax differences exist.

### 12.2 MongoDB Query Example

Retrieve orders for a user:

```javascript
db.orders.find({
  userId: 101,
});
```

Retrieve orders with a particular amount:

```javascript
db.orders.find({
  totalAmount: {
    $gt: 1000,
  },
});
```

Use aggregation for grouping:

```javascript
db.orders.aggregate([
  {
    $group: {
      _id: "$userId",
      totalOrders: {
        $sum: 1,
      },
      totalAmount: {
        $sum: "$totalAmount",
      },
    },
  },
]);
```

### 12.3 Comparison

| SQL      | MongoDB                |
| -------- | ---------------------- |
| SELECT   | find / aggregate       |
| WHERE    | Query filter           |
| JOIN     | `$lookup`              |
| GROUP BY | `$group`               |
| ORDER BY | sort                   |
| LIMIT    | limit                  |
| INSERT   | insertOne / insertMany |
| UPDATE   | updateOne / updateMany |
| DELETE   | deleteOne / deleteMany |

The syntax differs because the database models and query APIs differ.

---

## 13. Performance: Which Is Faster?

This question appears frequently in interviews.

The correct answer is:

**Neither SQL nor NoSQL is universally faster. Performance depends on the workload, data model, query design, indexes, configuration, and hardware.**

Let's examine some examples.

### 13.1 Key-Based Lookup

Suppose you need to retrieve a user's session using a session ID.

```text
session:abc123 -> user data
```

A key-value database such as Redis is a natural fit.

It provides highly efficient key-based access.

### 13.2 Complex Relational Query

Suppose you need:

- Customer information.
- Order details.
- Payment status.
- Product details.
- Aggregated spending.

A relational database can express these operations using JOINs and aggregations.

### 13.3 Document Retrieval

Suppose a product page requires a complete product document with its attributes, images, and embedded metadata.

A document database can retrieve the relevant document directly.

### 13.4 Graph Traversal

Suppose you need to find friends of friends, relationship paths, or connected entities.

A graph database may be more suitable than repeatedly executing complex relational JOINs.

### Performance Comparison

| Workload                                  | Potentially Suitable Model |
| ----------------------------------------- | -------------------------- |
| Key-based lookup                          | Key-Value                  |
| Complex relational queries                | Relational                 |
| Document retrieval                        | Document                   |
| Large distributed partition-key workloads | Wide-Column                |
| Relationship traversal                    | Graph                      |
| Full-text search                          | Search database            |

These are tendencies, not strict rules. A relational database can also handle many key-based, JSON, and search workloads.

---

## 14. Real-World Architecture: SQL and NoSQL Together

A common mistake is thinking that an application must choose either SQL or NoSQL.

It does not.

Many applications use multiple databases for different responsibilities.

Consider an e-commerce application.

### 14.1 Architecture

```text
                    CLIENT
                       |
                       v
                 Node.js Backend
                       |
          -----------------------------
          |             |             |
          v             v             v
       PostgreSQL     MongoDB        Redis
          |             |             |
          v             v             v
       Users,        Product        Sessions,
       Orders,       Documents      Cache
       Payments
          |
          v
      Message Broker
          |
          v
     Search / Analytics
```

### 14.2 Responsibility Breakdown

| Component       | Database                    | Why?                                             |
| --------------- | --------------------------- | ------------------------------------------------ |
| Users           | PostgreSQL                  | Relational data and constraints                  |
| Orders          | PostgreSQL                  | Transactional requirements                       |
| Payments        | PostgreSQL                  | Financial transaction records                    |
| Product catalog | MongoDB or PostgreSQL JSONB | Depends on product structure and access patterns |
| Sessions        | Redis                       | Fast key-based access and expiration             |
| Cache           | Redis                       | Frequently accessed data                         |
| Product search  | Elasticsearch / OpenSearch  | Full-text search and relevance                   |
| Analytics       | Analytical database         | Aggregation over large datasets                  |

### 14.3 Why Not Store Everything in One Database?

You can.

For many applications, PostgreSQL alone may be sufficient.

But as the system grows, specialized workloads may benefit from separate technologies.

For example:

- Redis can reduce repeated database reads.
- A search engine can provide relevance-based search.
- An analytical database can isolate reporting workloads.
- MongoDB can provide a useful document model for certain data.

### 14.4 What Is the Cost?

Using multiple databases introduces complexity:

- More infrastructure.
- More monitoring.
- More backups.
- More failure modes.
- Data synchronization.
- Duplicate data.
- Different query languages.
- Additional operational knowledge.

This architecture should be introduced when the benefits justify the cost.

---

## 15. Decision Framework: SQL or NoSQL?

Use this framework when designing a new backend.

### Choose a Relational Database When:

- Data has well-defined relationships.
- Referential integrity is important.
- Complex JOINs are common.
- Multi-record transactions are important.
- You need strong relational constraints.
- Data consistency is central to the business.

Examples:

- Banking systems.
- Order management.
- Accounting.
- Inventory management.
- Enterprise resource planning.

### Choose a Document Database When:

- Records naturally form documents.
- Many records have varying attributes.
- The application commonly retrieves complete documents.
- Embedding related data makes sense.
- The query patterns align with document-oriented access.

Examples:

- Content management.
- Product catalogs.
- User profiles.
- Certain configuration systems.

### Choose a Key-Value Database When:

- Access is primarily through a known key.
- Very fast lookups are important.
- Expiration or TTL is useful.
- The application needs caching or session storage.

Examples:

- Sessions.
- Caching.
- Temporary tokens.
- Counters.

### Choose a Wide-Column Database When:

- Data volume and write throughput are large.
- Workload can be modeled around partition keys.
- Distributed storage is important.
- Queries are known in advance.

Examples:

- Event ingestion.
- Large-scale activity data.
- Telemetry.

### Choose a Graph Database When:

- Relationships are the primary focus.
- Queries involve multi-hop traversals.
- The application frequently explores connected entities.

Examples:

- Social networks.
- Fraud detection.
- Recommendation relationships.
- Knowledge graphs.

---

## 16. Common Misconceptions

### Misconception 1: SQL databases cannot store JSON.

Incorrect.

PostgreSQL supports JSON and JSONB.

### Misconception 2: NoSQL databases do not support transactions.

Incorrect.

MongoDB supports multi-document ACID transactions. Transaction capabilities vary across NoSQL products.

### Misconception 3: NoSQL is always faster.

Incorrect.

Performance depends on the workload and data model.

### Misconception 4: SQL databases cannot scale horizontally.

Incorrect.

Relational databases can use replication, sharding, and distributed SQL architectures.

### Misconception 5: NoSQL databases have no schema.

Incorrect.

They may have flexible schemas, but validation and data modeling are still required.

### Misconception 6: Relational databases always normalize everything.

Incorrect.

Relational systems can use denormalized tables, JSONB, materialized views, and other structures when justified.

### Misconception 7: NoSQL is always better for large applications.

Incorrect.

Large applications often use relational databases extensively.

### Misconception 8: One application must use only one database type.

Incorrect.

An application can use multiple databases, although each additional database increases operational complexity.

---

## 17. Interview Questions

### Q1. What is the main difference between SQL and NoSQL?

SQL databases primarily use the relational model, while NoSQL databases use other models such as key-value, document, wide-column, and graph.

### Q2. Is NoSQL schema-less?

No. Many NoSQL databases offer flexible schemas, but validation and data modeling are still important.

### Q3. Can MongoDB support ACID transactions?

Yes. MongoDB supports multi-document ACID transactions in supported deployments.

### Q4. Can PostgreSQL store JSON?

Yes. PostgreSQL provides JSON and JSONB data types.

### Q5. What is the difference between embedding and referencing?

Embedding stores related information inside one document.

Referencing stores an identifier that points to another document or record.

### Q6. Why are JOINs important in relational databases?

They allow data from related tables to be combined without requiring all related data to be stored in one table.

### Q7. Why do document databases often use denormalization?

To retrieve commonly accessed related information from fewer documents or operations.

### Q8. Is denormalization exclusive to NoSQL?

No. Relational databases can also use denormalization.

### Q9. Which is better for banking applications?

Relational databases are commonly suitable because of their mature transaction, integrity, and constraint capabilities. The complete architecture still depends on requirements.

### Q10. Which is better for session storage?

A key-value database such as Redis is often suitable because sessions are commonly retrieved using known identifiers and may need expiration.

### Q11. What is eventual consistency?

A model in which replicas may temporarily differ but are expected to converge when updates stop and replication succeeds.

### Q12. Does NoSQL always provide eventual consistency?

No. Consistency guarantees vary by database and configuration.

### Q13. Does adding read replicas improve write throughput?

Not automatically. In a primary-replica design, writes usually remain concentrated on the primary.

### Q14. What is polyglot persistence?

Using multiple database technologies within the same application to support different workloads.

### Q15. What is the biggest disadvantage of using multiple databases?

Operational and architectural complexity, including synchronization, monitoring, backup, recovery, and consistency management.

### Q16. Can SQL and NoSQL be used together?

Yes. For example, PostgreSQL can manage transactions, Redis can handle caching, and MongoDB can manage document-oriented data.

### Q17. Why might you choose PostgreSQL instead of MongoDB for an application with flexible data?

PostgreSQL supports JSONB while also providing relational constraints, transactions, and SQL JOINs. If the application's data relationships and transactional requirements are relational, PostgreSQL may be a better overall fit.

### Q18. Is MongoDB always better for storing JSON?

No. PostgreSQL also supports JSONB, and the correct choice depends on the full data model, query patterns, scaling requirements, and operational considerations.

---

## 18. Practical Learning Exercise

### Exercise A: Choose the Database

Choose a suitable database model for each requirement.

| Requirement                             | Your Choice |
| --------------------------------------- | ----------- |
| Bank account transactions               | ?           |
| User session storage                    | ?           |
| Product catalog with varying attributes | ?           |
| Social network relationships            | ?           |
| Large-scale event ingestion             | ?           |
| Full-text product search                | ?           |
| Order management                        | ?           |

Explain why you selected each one.

### Exercise B: Model the Same Data in SQL and MongoDB

Consider this user:

```json
{
  "userId": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "country": "India"
  }
}
```

Tasks:

1. Create a PostgreSQL table for the user.
2. Create a PostgreSQL table for the user's address or use a JSONB column.
3. Create the equivalent MongoDB document.
4. Explain the tradeoffs between embedding and separating the address.
5. Explain which fields should have unique constraints.

### Exercise C: Analyze a Banking Transaction

A customer transfers ₹1,000 between two accounts.

Questions:

1. Which database model would you initially consider?
2. Why are ACID transactions important?
3. What happens if only the debit operation succeeds?
4. How would you prevent concurrent transactions from causing incorrect balances?
5. Would choosing NoSQL automatically solve or create this problem?

### Exercise D: Design an E-Commerce Backend

Design an architecture using:

- PostgreSQL
- MongoDB
- Redis
- A search engine

For each database, define:

1. What data it stores.
2. Which component owns that data.
3. How the data is updated.
4. Whether data is duplicated.
5. How synchronization is handled.
6. What happens if that database becomes unavailable.

Do not introduce a database unless you can explain the problem it solves.

---

## 19. Final Revision Sheet

| Topic              | SQL                                                  | NoSQL                                        |
| ------------------ | ---------------------------------------------------- | -------------------------------------------- |
| Data model         | Relational                                           | Multiple models                              |
| Structure          | Tables                                               | Documents, key-value pairs, columns, graphs  |
| Schema             | Usually explicit                                     | Often flexible                               |
| Relationships      | Keys and JOINs                                       | Embedding, references, or graph edges        |
| Transactions       | Mature ACID support                                  | Varies by database                           |
| Data duplication   | Often reduced through normalization                  | Often used intentionally for access patterns |
| Querying           | SQL                                                  | Database-specific                            |
| Horizontal scaling | Possible                                             | Common in many systems                       |
| JSON storage       | Supported by several relational databases            | Common in document databases                 |
| Best choice        | Depends on relational and transactional requirements | Depends on data model and access patterns    |

### The Most Important Mental Model

```text
                 DATABASE SELECTION
                         |
                         v
                 UNDERSTAND THE DATA
                         |
              -----------------------
              |          |          |
              v          v          v
          RELATIONS   STRUCTURE   ACCESS PATTERN
              |          |          |
              -----------------------
                         |
                         v
                UNDERSTAND REQUIREMENTS
                         |
              -----------------------
              |          |          |
              v          v          v
          TRANSACTIONS CONSISTENCY SCALABILITY
              |          |          |
              -----------------------
                         |
                         v
                  SELECT DATABASE
```

**The central lesson: Choose the database based on the problem, not based on whether it is SQL or NoSQL.**

A relational database can handle flexible data and large workloads. A NoSQL database can support transactions and structured data. The actual capabilities of the chosen database matter more than the category label.
