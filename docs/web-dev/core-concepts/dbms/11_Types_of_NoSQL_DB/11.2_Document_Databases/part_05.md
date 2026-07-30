---
sidebar_label: SQL vs Document DB
sidebar_position: 1
---

# SQL vs Document DB

## 1. Introduction

Throughout this DBMS roadmap, we have studied relational databases and document databases separately.

Now we will compare them directly.

The two database models approach data storage differently:

- **SQL databases** organize data primarily into tables, rows, and columns.
- **Document databases** organize data into collections and documents.

However, this difference goes deeper than storage format.

It affects:

- Data modeling.
- Relationships.
- Query execution.
- Transactions.
- Consistency.
- Indexing.
- Scaling.
- Application architecture.
- Database selection.

We will primarily compare:

- PostgreSQL as a relational database.
- MongoDB as a document database.

The goal is not to decide which database is universally better.

The goal is to understand which database is more appropriate for a particular workload.

### Topics covered

1. Relational vs document data models.
2. Tables vs collections.
3. Rows vs documents.
4. Relationships and JOINs vs embedding and referencing.
5. Normalization vs denormalization.
6. Schema flexibility.
7. Transactions and consistency.
8. Querying and indexing.
9. Scaling approaches.
10. PostgreSQL vs MongoDB architecture.
11. Real-world database selection scenarios.
12. When to use SQL, MongoDB, or both.

---

## 2. Relational vs Document Data Models

Let's begin with a simple example.

Suppose we are building an e-commerce application.

We need to store:

- Users.
- Products.
- Orders.
- Payments.

Both PostgreSQL and MongoDB can store this information.

However, they organize it differently.

### 2.1 Relational database model

In PostgreSQL, we might create separate tables.

**users**

| id  | name  | email             |
| --- | ----- | ----------------- |
| 101 | Rahul | rahul@example.com |
| 102 | Amit  | amit@example.com  |

**orders**

| id   | user_id | total |
| ---- | ------- | ----: |
| 5001 | 101     |  2500 |
| 5002 | 101     |  1500 |
| 5003 | 102     |  3000 |

The `user_id` column connects orders to users.

Relationship:

```text
users
  |
  | id
  |
  v
orders
  |
  | user_id
  |
  v
users.id
```

More precisely, `orders.user_id` is a foreign key referencing `users.id`.

SQL query:

```sql
SELECT
    users.name,
    orders.id AS order_id,
    orders.total
FROM users
JOIN orders
    ON users.id = orders.user_id;
```

The database combines information from the two tables.

### 2.2 Document database model

In MongoDB, we might create two collections.

Users:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com"
}
```

Orders:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500
}
```

The order stores a reference to the user.

We can retrieve orders using:

```javascript
db.orders.find({
  userId: 101,
});
```

If we also need user information, we can:

- Make another query.
- Use `$lookup`.
- Embed selected user information in the order when appropriate.

### 2.3 Fundamental difference

| Relational database         | Document database                           |
| --------------------------- | ------------------------------------------- |
| Tables                      | Collections                                 |
| Rows                        | Documents                                   |
| Columns                     | Fields                                      |
| Primary keys                | `_id` or another unique identifier          |
| Foreign keys                | Usually application-managed references      |
| JOINs                       | `$lookup`, embedding, or multiple queries   |
| SQL                         | MongoDB Query Language and aggregation      |
| Normalization commonly used | Embedding and denormalization commonly used |

The key difference is the data model, not simply the syntax.

---

## 3. Tables vs Collections

### 3.1 PostgreSQL: Tables

A relational table has a defined structure.

Example:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INTEGER
);
```

The table defines:

- Column names.
- Data types.
- Constraints.
- Relationships through keys.

Insert:

```sql
INSERT INTO users (
    name,
    email,
    age
)
VALUES (
    'Rahul',
    'rahul@example.com',
    25
);
```

### 3.2 MongoDB: Collections

A MongoDB collection stores BSON documents.

Example:

```javascript
db.users.insertOne({
  name: "Rahul",
  email: "rahul@example.com",
  age: 25,
});
```

Another document may have additional fields:

```javascript
db.users.insertOne({
  name: "Amit",
  email: "amit@example.com",
  skills: ["Node.js", "MongoDB"],
  address: {
    city: "Noida",
  },
});
```

MongoDB does not require every document to have exactly the same fields.

However, it supports schema validation, and applications should maintain consistent document structures.

### 3.3 Comparison

| Feature        | PostgreSQL                                        | MongoDB                                          |
| -------------- | ------------------------------------------------- | ------------------------------------------------ |
| Structure      | Table definition                                  | Collection of documents                          |
| Schema         | Explicit table schema                             | Flexible document schema                         |
| Missing fields | Represented using NULL where appropriate          | Field can be absent                              |
| Nested objects | Supported through JSON/JSONB and other structures | Native nested documents                          |
| Arrays         | Supported through array types and JSONB           | Native arrays                                    |
| Validation     | Column types and constraints                      | Collection validation and application validation |

**Important:** PostgreSQL is not restricted to flat data. JSONB allows it to store and query nested structures too.

---

## 4. Rows vs Documents

### 4.1 Relational row

Example:

```text
users table

+-----+--------+---------------------+
| id  | name   | email               |
+-----+--------+---------------------+
| 101 | Rahul  | rahul@example.com   |
+-----+--------+---------------------+
```

Each row follows the table's defined columns.

### 4.2 MongoDB document

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  },
  "skills": ["Node.js", "MongoDB"]
}
```

The document can represent nested objects and arrays directly.

### 4.3 Why does this matter?

Suppose the application frequently retrieves a user with their address and preferences.

In MongoDB, these fields can be embedded in one document.

In PostgreSQL, they could be:

- Stored in separate relational tables and joined.
- Stored as JSONB.
- Stored using a combination of relational columns and JSONB.

The choice depends on how the data is queried, validated, updated, and shared.

---

## 5. Relationships: JOINs vs Embedding and Referencing

This is one of the most important differences between relational and document databases.

### 5.1 Relational relationships

Suppose we have:

```text
users
-----
id
name

orders
------
id
user_id
total
```

A user can have multiple orders.

Relationship:

```text
users (1) -------- (N) orders
```

PostgreSQL enforces the relationship using a foreign key.

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total NUMERIC(12, 2) NOT NULL,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

The foreign key prevents an order from referencing a user that does not exist, subject to the constraint's configured behavior.

Retrieve user orders:

```sql
SELECT
    u.name,
    o.id,
    o.total
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

### 5.2 Document relationships: Embedding

MongoDB can store small, closely related data inside the parent.

```json
{
  "_id": 101,
  "name": "Rahul",
  "addresses": [
    {
      "type": "home",
      "city": "Noida"
    },
    {
      "type": "office",
      "city": "Delhi"
    }
  ]
}
```

The user and addresses can be retrieved together.

### 5.3 Document relationships: Referencing

MongoDB can also keep related data separately.

Users:

```json
{
  "_id": 101,
  "name": "Rahul"
}
```

Orders:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500
}
```

The relationship is maintained using `userId`.

However, MongoDB does not automatically enforce this reference as a foreign-key constraint.

The application must manage the relationship appropriately.

### 5.4 MongoDB `$lookup`

MongoDB also supports JOIN-like operations using `$lookup`.

```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders",
    },
  },
]);
```

This combines user documents with matching order documents.

### 5.5 Comparison

| Feature                     | PostgreSQL                     | MongoDB                                         |
| --------------------------- | ------------------------------ | ----------------------------------------------- |
| Relationship representation | Foreign keys                   | Embedding or references                         |
| Joining data                | SQL JOIN                       | `$lookup` or application queries                |
| Referential integrity       | Database-enforced foreign keys | Usually application-managed                     |
| One-to-many                 | Foreign-key relationship       | Embedded children or referenced child documents |
| Many-to-many                | Junction table                 | Reference arrays or relationship collection     |
| Nested data                 | JSONB or separate tables       | Native nested documents                         |

### Important misconception

MongoDB does not mean JOINs are impossible.

PostgreSQL does not mean every relationship must be joined.

Both databases support different ways of representing related information.

---

## 6. Normalization vs Denormalization

### 6.1 Normalization in relational databases

Normalization reduces unnecessary data duplication and improves data integrity.

Suppose we store:

| order_id | user_name | user_email        | total |
| -------- | --------- | ----------------- | ----: |
| 5001     | Rahul     | rahul@example.com |  2500 |
| 5002     | Rahul     | rahul@example.com |  1500 |
| 5003     | Amit      | amit@example.com  |  3000 |

Rahul's information is repeated.

We can separate the information into two tables.

**users**

| id  | name  | email             |
| --- | ----- | ----------------- |
| 101 | Rahul | rahul@example.com |
| 102 | Amit  | amit@example.com  |

**orders**

| id   | user_id | total |
| ---- | ------- | ----: |
| 5001 | 101     |  2500 |
| 5002 | 101     |  1500 |
| 5003 | 102     |  3000 |

Now user information is stored once in the users table.

### 6.2 Denormalization in document databases

MongoDB may intentionally duplicate information.

Example:

```json
{
  "_id": 5001,
  "userId": 101,
  "userName": "Rahul",
  "total": 2500
}
```

Why duplicate `userName`?

If order listings frequently display the customer's name, storing a copy may reduce additional lookups.

However, we must decide whether this name is:

- A historical snapshot.
- A copy of the customer's current name.

Those are different requirements.

### 6.3 Comparison

| Normalization                          | Denormalization                            |
| -------------------------------------- | ------------------------------------------ |
| Reduces duplication                    | Intentionally duplicates selected data     |
| Improves certain integrity guarantees  | Can simplify and accelerate common reads   |
| May require JOINs                      | May reduce additional queries              |
| Updates often affect one source record | Duplicated values may need synchronization |
| Common in relational modeling          | Common in document modeling                |

### Important clarification

Normalization is not exclusive to SQL.

Denormalization is not exclusive to NoSQL.

Both database types can use either strategy.

The appropriate model depends on the workload.

---

## 7. Schema Flexibility

### 7.1 PostgreSQL schema

Example:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    category VARCHAR(50)
);
```

Adding a column:

```sql
ALTER TABLE products
ADD COLUMN brand VARCHAR(100);
```

A schema change is explicit.

PostgreSQL also supports JSONB:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    attributes JSONB
);
```

Example data:

```sql
INSERT INTO products (
    name,
    attributes
)
VALUES (
    'Laptop',
    '{"processor": "Intel i7", "ram": "16GB"}'
);
```

### 7.2 MongoDB schema

Example:

```javascript
db.products.insertOne({
  name: "Laptop",
  price: 65000,
  attributes: {
    processor: "Intel i7",
    ram: "16GB",
  },
});
```

Another product can have different attributes:

```javascript
db.products.insertOne({
  name: "T-Shirt",
  price: 999,
  attributes: {
    size: "L",
    color: "Black",
    material: "Cotton",
  },
});
```

The documents can have different structures.

### 7.3 Comparison

| Feature           | PostgreSQL                               | MongoDB                                       |
| ----------------- | ---------------------------------------- | --------------------------------------------- |
| Schema definition | Explicit table definitions               | Flexible by default                           |
| Schema changes    | Usually through migrations               | Documents can evolve independently            |
| Validation        | Data types and constraints               | JSON Schema and application validation        |
| Nested structures | JSONB and relational modeling            | Native document structures                    |
| Schema migration  | Commonly managed through migration tools | May require document backfills and versioning |

### Important point

PostgreSQL's schema is not necessarily rigid in the sense that it cannot evolve.

It supports:

- Adding columns.
- Changing data types.
- JSONB.
- Generated columns.
- Constraints.

MongoDB's flexibility also does not remove the need for schema design.

---

## 8. Transactions and Consistency

Both PostgreSQL and MongoDB support ACID transactions.

However, their data models and transaction implementations differ.

### 8.1 PostgreSQL transactions

Suppose a banking transfer moves ₹1,000 from Account A to Account B.

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE id = 101
  AND balance >= 1000;

UPDATE accounts
SET balance = balance + 1000
WHERE id = 102;

COMMIT;
```

In production code, the application must verify that the debit updated exactly one row. Otherwise, the transaction should be rolled back rather than crediting the destination without a successful debit.

If a required operation fails:

```sql
ROLLBACK;
```

PostgreSQL provides multi-row and multi-table transactions with ACID guarantees.

### 8.2 MongoDB single-document atomicity

MongoDB guarantees atomicity for writes affecting a single document.

Example:

```javascript
db.accounts.updateOne(
  {
    _id: 101,
    balance: {
      $gte: 1000,
    },
  },
  {
    $inc: {
      balance: -1000,
    },
  },
);
```

The conditional update can atomically check and modify the same document.

### 8.3 MongoDB multi-document transactions

MongoDB also supports multi-document transactions.

Example:

```javascript
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    await db.collection("orders").insertOne(
      {
        userId: 101,
        total: 2500,
      },
      {
        session,
      },
    );

    await db.collection("payments").insertOne(
      {
        userId: 101,
        amount: 2500,
      },
      {
        session,
      },
    );
  });
} finally {
  await session.endSession();
}
```

If an operation fails and the transaction aborts, the transactional writes are not committed.

### 8.4 Transaction comparison

| Feature                                      | PostgreSQL        | MongoDB                     |
| -------------------------------------------- | ----------------- | --------------------------- |
| Single-record atomicity                      | Yes               | Yes                         |
| Multi-record transactions                    | Yes               | Yes                         |
| Multi-table or multi-collection transactions | Yes               | Yes                         |
| ACID support                                 | Yes               | Yes                         |
| Relational constraints                       | Built in          | Usually application-managed |
| Natural data grouping                        | Relational tables | Documents                   |

### Important clarification

It is incorrect to say that MongoDB does not support transactions.

It supports multi-document transactions.

It is also incorrect to assume that every MongoDB operation requires a multi-document transaction.

Single-document atomicity is a significant part of its data model.

### 8.5 Consistency models

PostgreSQL provides transaction isolation levels and MVCC-based concurrency control.

MongoDB also provides transaction isolation behavior and configurable read/write concerns.

The exact consistency guarantees depend on:

- Transaction boundaries.
- Read concern.
- Write concern.
- Read preference.
- Replica set or sharded deployment configuration.

Do not assume that a read from any secondary immediately reflects every acknowledged write.

---

## 9. Querying and Indexing

Both databases support indexes, but their query models differ.

### 9.1 PostgreSQL query

Find users from Noida:

```sql
SELECT *
FROM users
WHERE city = 'Noida';
```

Create an index:

```sql
CREATE INDEX idx_users_city
ON users(city);
```

PostgreSQL supports multiple index types, including:

- B-tree.
- Hash.
- GIN.
- GiST.
- BRIN.

### 9.2 MongoDB query

Find users from Noida:

```javascript
db.users.find({
  city: "Noida",
});
```

Create an index:

```javascript
db.users.createIndex({
  city: 1,
});
```

MongoDB supports:

- Single-field indexes.
- Compound indexes.
- Multikey indexes.
- Text indexes.
- Geospatial indexes.
- Hashed indexes.
- Wildcard indexes.
- Other specialized index types.

### 9.3 Nested-field querying

MongoDB:

```javascript
db.users.find({
  "address.city": "Noida",
});
```

PostgreSQL with JSONB:

```sql
SELECT *
FROM users
WHERE address ->> 'city' = 'Noida';
```

A suitable expression or GIN index may help, depending on the exact query pattern.

### 9.4 Query model comparison

| Feature        | PostgreSQL                           | MongoDB                            |
| -------------- | ------------------------------------ | ---------------------------------- |
| Query language | SQL                                  | MongoDB Query Language             |
| Filtering      | `WHERE`                              | Query filters                      |
| Sorting        | `ORDER BY`                           | `.sort()`                          |
| Grouping       | `GROUP BY`                           | `$group`                           |
| Joining        | `JOIN`                               | `$lookup`                          |
| Pagination     | `LIMIT`, `OFFSET`, keyset techniques | `limit()`, `skip()`, range queries |
| Nested data    | JSONB operators                      | Dot notation and aggregation       |
| Query analysis | `EXPLAIN`, `EXPLAIN ANALYZE`         | `explain()`                        |

### 9.5 Performance is workload-dependent

Neither database automatically wins.

For example:

- A simple lookup by indexed primary key can be efficient in both.
- A complex relational report may be more natural in PostgreSQL.
- Retrieving a bounded embedded object can be convenient in MongoDB.
- A poorly indexed MongoDB query can be slow.
- A poorly designed PostgreSQL query can also be slow.

Measure actual query performance instead of making decisions based on database stereotypes.

---

## 10. Scaling Approaches

Both databases can scale, but their scaling architectures differ.

### 10.1 Vertical scaling

Vertical scaling means increasing the resources of one server.

```text
Before:

+------------------+
| Database Server  |
| 4 CPU            |
| 8 GB RAM         |
+------------------+

After:

+------------------+
| Database Server  |
| 32 CPU           |
| 128 GB RAM       |
+------------------+
```

Both PostgreSQL and MongoDB can benefit from increased CPU, RAM, and storage resources.

However, vertical scaling has practical limits and increasing costs.

### 10.2 Replication

Replication maintains copies of data across multiple database servers.

PostgreSQL commonly uses primary/standby replication.

MongoDB commonly uses replica sets.

Conceptually:

```text
             Primary
                |
         Replication Stream
            /       \
           v         v
       Standby    Standby
```

Differences in replication architecture, failover, and consistency behavior must be considered separately.

### 10.3 Horizontal scaling

Horizontal scaling means distributing work or data across multiple machines.

MongoDB provides native sharding.

```text
             MongoDB Cluster
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Shard 1   Shard 2   Shard 3
```

PostgreSQL can also be horizontally distributed using approaches such as:

- Application-level sharding.
- Citus.
- Distributed PostgreSQL-compatible systems.
- Other external partitioning and routing architectures.

PostgreSQL also supports table partitioning, but partitioning a table on one server is not the same as distributing it across multiple machines.

### 10.4 Scaling comparison

| Feature                | PostgreSQL                                     | MongoDB                                      |
| ---------------------- | ---------------------------------------------- | -------------------------------------------- |
| Vertical scaling       | Yes                                            | Yes                                          |
| Replication            | Yes                                            | Yes                                          |
| Automatic failover     | Through configured HA solutions                | Replica set elections                        |
| Native sharding        | Not built into core PostgreSQL in the same way | Yes                                          |
| Table partitioning     | Yes                                            | Different collection and sharding mechanisms |
| Distributed deployment | Extensions and external architectures          | Native sharded clusters                      |

**Important:** Native sharding does not mean MongoDB automatically scales every application. Shard keys, query patterns, and operational capacity still matter.

---

## 11. PostgreSQL vs MongoDB Architecture

Let's compare their broad architectural responsibilities.

### 11.1 PostgreSQL architecture

A simplified view:

```text
             APPLICATION
                  |
                  v
             PostgreSQL
                  |
          +-------+-------+
          |               |
          v               v
      Query Engine     Backend Process
          |               |
          +-------+-------+
                  |
                  v
              Storage
                  |
          +-------+-------+
          |               |
          v               v
       Shared Buffers    WAL
          |               |
          v               v
       Data Files      WAL Files
```

Important components include:

- SQL parser and planner.
- Executor.
- Backend processes.
- Shared buffers.
- Write-Ahead Log (WAL).
- Storage files.
- Background writer and checkpointer.
- Autovacuum.

PostgreSQL uses MVCC and writes changes to WAL to support durability and recovery.

### 11.2 MongoDB architecture

A simplified view:

```text
             APPLICATION
                  |
                  v
              MongoDB
                  |
          +-------+-------+
          |               |
          v               v
       Query Layer     Command Layer
          |               |
          +-------+-------+
                  |
                  v
              WiredTiger
                  |
          +-------+-------+
          |               |
          v               v
         Cache          Journal
          |
          v
       Data Files
```

Important components include:

- Query processing.
- BSON document storage.
- WiredTiger.
- WiredTiger cache.
- Journaling.
- Checkpointing.
- Replica set replication.
- Oplog.

### 11.3 Architecture comparison

| Area                        | PostgreSQL                                 | MongoDB                                           |
| --------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Primary data representation | Relational tables                          | BSON documents                                    |
| Query engine                | SQL parser, planner, executor              | Query parser, planner, execution engine           |
| Storage engine              | Integrated PostgreSQL storage architecture | Storage engine abstraction; WiredTiger by default |
| Concurrency                 | MVCC and locking                           | MVCC and locking through storage engine           |
| Durability log              | WAL                                        | WiredTiger journal and checkpoint mechanisms      |
| Replication                 | WAL-based physical/logical replication     | Oplog-based replica set replication               |
| Horizontal distribution     | Extensions and external systems            | Native sharding                                   |
| Data relationships          | Foreign keys and JOINs                     | Embedding, references, `$lookup`                  |

This is a high-level comparison. The internal implementations are substantially more detailed than these diagrams.

---

## 12. Real-World Scenario 1: Banking Application

Consider a banking system.

It needs:

- Customers.
- Accounts.
- Transactions.
- Transfers.
- Loans.
- Branches.
- Audit records.

A transfer may require:

1. Debit Account A.
2. Credit Account B.
3. Create a ledger entry.
4. Record the transfer status.

These operations require carefully defined transactional guarantees.

PostgreSQL is often a natural choice because:

- Relational integrity is important.
- SQL supports complex relationships.
- Transactions are central.
- Constraints can protect important invariants.
- Reporting queries often involve multiple related entities.

MongoDB can also support transactional banking workflows, but the team must explicitly manage relationships and integrity that a relational database can enforce through foreign keys and constraints.

**Likely choice:** PostgreSQL for the core transactional model.

---

## 13. Real-World Scenario 2: Content Management System

Consider a CMS.

A page may contain:

- Title.
- Description.
- Images.
- Sections.
- Widgets.
- Layout configuration.
- Metadata.

Different page types may have different structures.

Example:

```json
{
  "_id": 101,
  "title": "Home Page",
  "sections": [
    {
      "type": "hero",
      "configuration": {
        "heading": "Welcome",
        "image": "hero.jpg"
      }
    },
    {
      "type": "product-grid",
      "configuration": {
        "columns": 4,
        "category": "electronics"
      }
    }
  ]
}
```

MongoDB can naturally represent this nested configuration.

PostgreSQL can also store the sections in JSONB or relational tables.

**Likely choice:** MongoDB can be a strong fit when page structures vary significantly and are commonly retrieved as complete documents. PostgreSQL remains viable when relational reporting and constraints are equally important.

---

## 14. Real-World Scenario 3: E-Commerce Application

E-commerce is more complicated because different parts of the system have different data requirements.

Consider:

| Module          | Possible database choice         | Reason                                         |
| --------------- | -------------------------------- | ---------------------------------------------- |
| Users           | PostgreSQL or MongoDB            | Depends on profile structure and relationships |
| Product catalog | MongoDB or PostgreSQL JSONB      | Flexible product attributes                    |
| Orders          | PostgreSQL or MongoDB            | Depends on transaction and query requirements  |
| Payments        | PostgreSQL or MongoDB            | Strong lifecycle and audit requirements        |
| Inventory       | PostgreSQL is often suitable     | Transactional stock management                 |
| Search          | Dedicated search engine          | Specialized search workloads                   |
| Analytics       | Analytical database or warehouse | Large aggregations                             |

A company does not need to use the same database for every module.

However, adding multiple databases introduces synchronization and operational complexity.

### Example: Product catalog in MongoDB

```json
{
  "_id": 501,
  "name": "Laptop",
  "category": "Electronics",
  "attributes": {
    "processor": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

### Example: Order in PostgreSQL

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

This is a possible architecture, not a mandatory design.

A well-designed PostgreSQL-only or MongoDB-only system can also serve many e-commerce workloads.

---

## 15. Real-World Scenario 4: Campaign and Gamification Platform

Consider a platform with:

- Multiple campaigns.
- Different game configurations.
- Participant records.
- Game sessions.
- Reward allocation.
- Analytics events.

A possible database selection:

| Data                   | Possible storage                 | Reason                                                           |
| ---------------------- | -------------------------------- | ---------------------------------------------------------------- |
| Campaign configuration | MongoDB                          | Nested and evolving configuration                                |
| Participants           | PostgreSQL or MongoDB            | Depends on relationships and query requirements                  |
| Game sessions          | MongoDB or PostgreSQL            | Depends on reporting and transaction needs                       |
| Reward allocation      | PostgreSQL or MongoDB            | Depends on allocation correctness and transactional requirements |
| Analytics events       | Event store or analytical system | High-volume event processing                                     |
| Campaign reports       | Analytical database or warehouse | Aggregation-heavy workload                                       |

A MongoDB campaign document:

```json
{
  "_id": 101,
  "name": "Summer Promotion",
  "configuration": {
    "gameType": "spin-wheel",
    "attempts": 3,
    "rewards": {
      "dailyLimit": 100,
      "enabled": true
    }
  }
}
```

This is a natural fit for hierarchical campaign configuration.

However, reward allocation must be protected against:

- Duplicate allocation.
- Concurrent requests.
- Exceeding inventory limits.
- Incorrect retries.

The database choice does not eliminate these correctness requirements.

---

## 16. Using SQL and MongoDB Together: Polyglot Persistence

An application does not always need one database.

It can use multiple databases for different workloads.

This architecture is called **Polyglot Persistence**.

Example:

```text
                 APPLICATION
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      PostgreSQL   MongoDB    Redis
          |           |           |
          v           v           v
      Transactions  Documents    Cache
      Relationships Config       Sessions
```

Possible responsibilities:

| Technology     | Responsibility                                 |
| -------------- | ---------------------------------------------- |
| PostgreSQL     | Orders, payments, relational records           |
| MongoDB        | Campaign configurations and flexible documents |
| Redis          | Caching, sessions, temporary data              |
| Search engine  | Full-text search                               |
| Data warehouse | Analytics and reporting                        |

### 16.1 Why use multiple databases?

Because different workloads have different requirements.

For example:

- PostgreSQL can manage transactional business records.
- MongoDB can store flexible campaign configurations.
- Redis can cache frequently accessed information.
- A search engine can support full-text search.

### 16.2 The cost of multiple databases

Polyglot persistence introduces:

- More infrastructure.
- More monitoring.
- More backup procedures.
- More operational knowledge.
- Data synchronization.
- Failure coordination.
- Additional deployment complexity.

Do not introduce multiple databases merely because each one is good at something.

Use them only when the benefit justifies the operational cost.

---

## 17. Database Selection Decision Framework

Use this framework when evaluating PostgreSQL and MongoDB.

| Requirement                         | PostgreSQL                       | MongoDB                                       |
| ----------------------------------- | -------------------------------- | --------------------------------------------- |
| Complex relational relationships    | Strong natural fit               | Possible, but may require additional modeling |
| Foreign-key constraints             | Native                           | Usually application-managed                   |
| Complex SQL reporting               | Strong                           | Aggregation framework available               |
| Nested document structures          | JSONB support                    | Native document model                         |
| Flexible evolving documents         | JSONB and schema migrations      | Natural document flexibility                  |
| Multi-document transactions         | Yes                              | Yes                                           |
| Native sharding                     | External extensions/architecture | Native sharded clusters                       |
| Document-oriented reads             | JSONB or relational model        | Natural fit                                   |
| Strict relational integrity         | Strong native support            | Requires deliberate application design        |
| Large-scale horizontal distribution | Requires architectural choices   | Native sharding support                       |

### A practical decision process

```text
                 APPLICATION REQUIREMENTS
                           |
                           v
              Are Relationships Complex?
                           |
                 +---------+---------+
                 |                   |
                Yes                  No
                 |                   |
                 v                   v
          Evaluate SQL       Is Data Naturally
          and Constraints     Document-Oriented?
                                    |
                              +-----+-----+
                              |           |
                             Yes          No
                              |           |
                              v           v
                          Evaluate      Evaluate
                          MongoDB       PostgreSQL
                              |
                              v
                   Compare Query Workloads
                              |
                              v
                    Compare Consistency
                    and Transaction Needs
                              |
                              v
                    Evaluate Scaling and
                    Operational Complexity
                              |
                              v
                       Final Selection
```

The diagram is a starting framework, not an automatic database-selection algorithm.

---

## 18. Common Misconceptions

### Misconception 1: SQL databases cannot store JSON.

Incorrect.

PostgreSQL supports JSON and JSONB, including operators and indexes.

### Misconception 2: MongoDB does not support transactions.

Incorrect.

MongoDB supports multi-document ACID transactions.

### Misconception 3: NoSQL means no relationships.

Incorrect.

MongoDB supports relationships through embedding and references.

### Misconception 4: SQL always requires JOINs.

Incorrect.

Relational data can be denormalized, and PostgreSQL supports JSONB for nested structures.

### Misconception 5: MongoDB is always faster.

Incorrect.

Performance depends on workload, schema design, query execution, indexes, and deployment.

### Misconception 6: MongoDB automatically scales better.

Incorrect.

Sharding requires careful architecture and operational management.

### Misconception 7: PostgreSQL cannot scale horizontally.

Incorrect.

PostgreSQL can be distributed using extensions and external architectures, although its core architecture differs from MongoDB's native sharding model.

### Misconception 8: Document databases do not need schema design.

Incorrect.

Poor document design can create oversized documents, inconsistent fields, and expensive queries.

### Misconception 9: Denormalization is always better for performance.

Incorrect.

It can improve reads but makes updates and consistency management more complicated.

### Misconception 10: A company should use only one database.

Incorrect.

Polyglot persistence is a valid architecture, but additional databases introduce operational costs.

---

## 19. Interview Questions and Answers

### Q1. What is the main difference between SQL and document databases?

SQL databases primarily organize information into relational tables, while document databases organize information into collections of documents.

### Q2. What is the difference between a row and a document?

A row follows a table's column structure. A document can contain nested objects, arrays, and fields that differ between documents.

### Q3. Does MongoDB support JOINs?

Yes. MongoDB supports `$lookup` in aggregation pipelines.

### Q4. Does PostgreSQL support document-like data?

Yes. PostgreSQL supports JSON and JSONB.

### Q5. What is the difference between normalization and denormalization?

Normalization reduces unnecessary duplication. Denormalization intentionally duplicates selected data to improve access patterns.

### Q6. Does MongoDB support ACID transactions?

Yes. MongoDB supports atomic single-document writes and multi-document ACID transactions.

### Q7. Why are foreign keys important?

They enforce referential integrity by preventing invalid references between relational tables, subject to the configured constraint behavior.

### Q8. Does MongoDB automatically enforce references?

No. A field such as `userId` is generally an application-managed reference unless additional application or database logic enforces its validity.

### Q9. Which database is better for complex relational queries?

PostgreSQL is often the more natural choice because SQL and relational JOINs are central to its model.

### Q10. Which database is better for flexible hierarchical documents?

MongoDB is often a natural fit, although PostgreSQL JSONB can also handle many such workloads.

### Q11. Can MongoDB and PostgreSQL be used in the same application?

Yes. This is an example of polyglot persistence.

### Q12. What is the main risk of using multiple databases?

Operational complexity and data synchronization between systems.

### Q13. Is MongoDB schema-less?

Not exactly. MongoDB has a flexible schema by default, but schema validation and application-level schemas can enforce structure.

### Q14. Does PostgreSQL support horizontal scaling?

Yes, through approaches such as extensions, distributed PostgreSQL systems, and application-level sharding. Core PostgreSQL does not provide native automatic sharding in the same way as MongoDB.

### Q15. Would you use MongoDB for a banking system?

I would first evaluate relational integrity, transaction requirements, audit requirements, and reporting. PostgreSQL is often a natural choice for the core banking model.

### Q16. Would you use MongoDB for a product catalog?

It can be a good choice when products have significantly varying attributes and document-oriented access patterns.

### Q17. Is one database always better for an e-commerce application?

No. The correct choice depends on how the catalog, orders, inventory, payments, and reporting workloads behave.

### Q18. What is polyglot persistence?

Using multiple database technologies within one application or system, selecting each based on its workload requirements.

---

## 20. Practical Exercises

### Exercise 1: Compare the data models

Create a simple user-order system in:

1. PostgreSQL.
2. MongoDB.

Implement:

- User creation.
- Order creation.
- Retrieving all orders for a user.
- Retrieving a user with their orders.

Compare the schemas and queries.

### Exercise 2: Model a product catalog

A product catalog contains:

- Electronics.
- Clothing.
- Furniture.

Each category has different attributes.

Design the model in:

1. PostgreSQL using relational tables.
2. PostgreSQL using JSONB.
3. MongoDB using documents.

Compare the complexity and query requirements.

### Exercise 3: Transaction comparison

Implement a money transfer workflow in both databases.

Requirements:

- Debit one account.
- Credit another account.
- Record the transaction.
- Prevent invalid balances.
- Roll back if any required operation fails.

Compare transaction implementation and constraints.

### Exercise 4: Database selection

Choose a database for:

1. Banking system.
2. Campaign configuration system.
3. Social media application.
4. E-commerce platform.
5. Analytics dashboard.
6. Content management system.
7. Inventory management system.

For each, explain:

- Data relationships.
- Query patterns.
- Transaction requirements.
- Schema requirements.
- Scaling requirements.

### Exercise 5: Polyglot architecture

Design a system using:

- PostgreSQL.
- MongoDB.
- Redis.

Decide which data belongs in each system.

Explain:

- Why each database is needed.
- How data moves between systems.
- What happens if one database becomes unavailable.
- How synchronization is maintained.
- What additional operational complexity is introduced.

---

## 21. Chapter Summary

| Concept              | SQL / PostgreSQL                     | Document DB / MongoDB                             |
| -------------------- | ------------------------------------ | ------------------------------------------------- |
| Data model           | Relational                           | Document-oriented                                 |
| Storage organization | Tables and rows                      | Collections and documents                         |
| Schema               | Explicit relational schema           | Flexible document schema                          |
| Relationships        | Foreign keys                         | Embedding and references                          |
| Joins                | Native SQL JOINs                     | `$lookup`                                         |
| Data duplication     | Often reduced through normalization  | Often used intentionally                          |
| Nested structures    | JSONB and relational tables          | Native nested documents                           |
| Transactions         | Multi-row and multi-table ACID       | Single-document atomicity and multi-document ACID |
| Validation           | Data types and constraints           | Collection and application validation             |
| Indexing             | Multiple specialized index types     | Multiple document-oriented index types            |
| Horizontal scaling   | Extensions and external architecture | Native sharding                                   |
| Typical strength     | Relational integrity and SQL         | Hierarchical document modeling                    |

### Final mental model

```text
                    DATABASE MODELS
                           |
              +------------+------------+
              |                         |
              v                         v
        RELATIONAL DB              DOCUMENT DB
              |                         |
              v                         v
       Tables and Rows           Collections and
                                     Documents
              |                         |
              v                         v
       Foreign Keys and          Embedding and
           JOINs                  References
              |                         |
              v                         v
       Normalization              Denormalization
              |                         |
              +------------+------------+
                           |
                           v
                  WORKLOAD EVALUATION
                           |
              +------------+------------+
              |            |             |
              v            v             v
           Queries     Consistency     Scaling
              |            |             |
              +------------+-------------+
                           |
                           v
                   DATABASE SELECTION
```

### The most important points to remember

1. PostgreSQL organizes data primarily into relational tables.
2. MongoDB organizes data into BSON documents.
3. PostgreSQL uses foreign keys and JOINs for relational data.
4. MongoDB uses embedding, references, and `$lookup`.
5. Normalization and denormalization are modeling strategies, not exclusive database features.
6. PostgreSQL supports JSONB and can store nested data.
7. MongoDB supports multi-document ACID transactions.
8. PostgreSQL provides built-in foreign-key constraints.
9. MongoDB provides native sharding, but shard-key selection is critical.
10. Query performance depends on the actual workload and indexes.
11. Different modules of one application can use different databases.
12. Polyglot persistence increases operational and synchronization complexity.

**Engineering takeaway:** Stop thinking in terms of SQL being old and NoSQL being modern. Both solve real engineering problems. Your responsibility is to select the data model that makes the system correct, efficient, scalable, and maintainable.
