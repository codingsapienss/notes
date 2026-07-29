---
sidebar_label: When to Choose SQL vs NoSQL
sidebar_position: 1
---

# When to Choose SQL vs NoSQL

## 1. Introduction

In last 2 sections, we studied NoSQL fundamentals and its four major categories.

SQL and NoSQL databases across:

- Data models
- Schema
- Relationships and JOINs
- Normalization and denormalization
- Transactions and ACID
- Consistency
- Scaling
- Query languages
- Performance

Now we need to answer the most practical question:

**When should you actually choose SQL, when should you choose NoSQL, and when should you use both?**

Consider that you are building a new e-commerce application.

It requires:

- User registration and authentication.
- Product catalogs.
- Shopping carts.
- Orders.
- Payments.
- Inventory.
- Product search.
- User sessions.
- Analytics.

Would you use PostgreSQL for everything?

Would you use MongoDB for everything?

Would you introduce Redis and a search engine?

The answer depends on the application's requirements.

A database should not be selected because it is popular or because someone claims it is faster.

The selection should be based on:

1. Data structure.
2. Relationships.
3. Access patterns.
4. Transaction requirements.
5. Consistency requirements.
6. Scalability.
7. Performance.
8. Operational complexity.
9. Cost.

---

## 2. Start With Requirements, Not Database Names

A common mistake is starting database design with a technology choice.

For example:

"I want to use MongoDB, so I will design my entire application around MongoDB."

This is backwards.

First understand the problem.

Consider two applications.

### Application A: Banking System

Requirements:

- Accounts.
- Transactions.
- Deposits.
- Withdrawals.
- Transfers.
- Transaction history.
- Account balances.
- Strong correctness guarantees.

A transfer may require two account updates to succeed together.

The database needs reliable transaction and consistency guarantees.

A relational database such as PostgreSQL is a natural starting point.

### Application B: Content Management System

Requirements:

- Articles.
- Images.
- Metadata.
- Different content types.
- Flexible content structures.
- Frequently changing document fields.

A document database such as MongoDB may be suitable because content can naturally be represented as documents.

### Important Lesson

The correct question is not:

"Which database is better?"

The correct question is:

"Which database model fits the data and operations my application needs?"

---

## 3. When to Choose SQL

SQL databases are particularly suitable when the application has structured relational data and requires strong integrity and transactional guarantees.

### 3.1 Complex Relationships

Consider an e-commerce application.

It has:

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

order_items
-----------
order_item_id
order_id
product_id
quantity

products
--------
product_id
name
price
```

The entities are connected through relationships.

You frequently need queries such as:

- Find all orders for a user.
- Find products inside an order.
- Calculate customer spending.
- Find products purchased by a particular customer.
- Join payments with orders.

Relational databases are designed to handle these relationships using keys and JOINs.

### 3.2 Strong Transaction Requirements

Consider a bank transfer:

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

Both operations can be committed atomically.

If something fails, the transaction can be rolled back.

This is important for:

- Banking.
- Payments.
- Order creation.
- Inventory reservation.
- Financial accounting.

NoSQL databases can also support transactions, but the exact capabilities and performance characteristics depend on the database.

### 3.3 Referential Integrity

Suppose an order references a user.

```sql
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    total_amount NUMERIC(12, 2)
);
```

The database can enforce that the referenced user exists.

This helps prevent invalid relationships.

### 3.4 Complex Queries and Aggregations

Suppose you need:

- Total revenue by month.
- Number of orders by customer.
- Top-selling products.
- Revenue by category.
- Payment success rates.

SQL provides powerful JOIN, GROUP BY, HAVING, window function, and subquery capabilities.

Example:

```sql
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

### 3.5 When SQL Is a Strong Starting Choice

| Requirement               | Why SQL Fits                      |
| ------------------------- | --------------------------------- |
| Financial transactions    | ACID transactions and constraints |
| Complex relationships     | Foreign keys and JOINs            |
| Structured business data  | Relational model                  |
| Data integrity            | Constraints and validation        |
| Complex reporting queries | SQL aggregation and joins         |
| Multi-record updates      | Transaction support               |
| Accounting systems        | Reliable relational consistency   |

**Practical default:** For a typical business application with users, orders, payments, inventory, and relationships, start by evaluating PostgreSQL or another relational database.

---

## 4. When to Choose NoSQL

NoSQL is useful when a particular data model or access pattern benefits from a non-relational database architecture.

Remember that NoSQL includes different database categories. Choosing NoSQL is not enough; you must choose the appropriate category.

### 4.1 Document Database — MongoDB

Choose a document database when:

- Data naturally fits document structures.
- Records have varying attributes.
- Related information is commonly retrieved together.
- Embedding or document references fit the access pattern.
- The application benefits from document-oriented queries.

Example: Product catalog.

Laptop:

```json
{
  "_id": 101,
  "name": "Laptop",
  "category": "Electronics",
  "attributes": {
    "ram": "16GB",
    "storage": "512GB SSD",
    "processor": "Intel i7"
  }
}
```

Mobile:

```json
{
  "_id": 102,
  "name": "Mobile",
  "category": "Electronics",
  "attributes": {
    "battery": "5000mAh",
    "camera": "50MP",
    "screen": "6.7 inches"
  }
}
```

Different product types have different attributes.

MongoDB can represent these structures naturally.

However, PostgreSQL JSONB can also handle this type of data. MongoDB is not automatically necessary.

### 4.2 Key-Value Database — Redis

Choose a key-value database when:

- Data is retrieved primarily using a known key.
- Very low-latency access is important.
- Data may have an expiration time.
- You need caching, session storage, or counters.

Example:

```text
session:abc123 -> user:101
cart:user101 -> shopping cart data
otp:user101 -> 123456
```

Redis commands:

```redis
SET session:abc123 "user:101"

GET session:abc123

EXPIRE session:abc123 3600
```

Redis is particularly useful for:

- Sessions.
- Caching.
- Rate limiting.
- Temporary tokens.
- Counters.
- Real-time data structures.

### 4.3 Wide-Column Database — Cassandra

Choose a wide-column database when:

- You have very large distributed datasets.
- Write throughput is high.
- Queries can be designed around partition keys.
- Data distribution across nodes is important.
- The workload has predictable query patterns.

Example:

A large application records user activity.

```text
user_id | event_time          | event_type
--------|---------------------|-----------
101     | 2026-11-14 10:00:00 | LOGIN
101     | 2026-11-14 10:05:00 | VIEW
101     | 2026-11-14 10:10:00 | PURCHASE
```

Cassandra can be useful for large-scale distributed workloads when the table design matches the queries.

However, it is not a general replacement for PostgreSQL.

### 4.4 Graph Database — Neo4j

Choose a graph database when relationships are central to the application.

Examples:

- Social networks.
- Fraud detection.
- Recommendation systems.
- Knowledge graphs.
- Relationship analysis.

Consider:

```text
Rahul -> FOLLOWS -> Amit
Amit  -> FOLLOWS -> Priya
Priya -> LIKES   -> Product 101
```

You may want to discover connections between users and products.

Graph databases are designed to represent and traverse relationships.

### 4.5 NoSQL Category Selection

| Requirement                      | Database Category | Example   |
| -------------------------------- | ----------------- | --------- |
| Fast lookup by key               | Key-Value         | Redis     |
| Flexible product documents       | Document          | MongoDB   |
| Large distributed event workload | Wide-Column       | Cassandra |
| Relationship traversal           | Graph             | Neo4j     |

---

## 5. Decision Factor 1: Data Structure

Ask how your data naturally behaves.

### Structured Data

Example:

```text
Employee
--------
employee_id
name
email
salary
department_id
```

Fields and relationships are relatively well-defined.

A relational database is a natural choice.

### Semi-Structured Data

Example:

```json
{
  "productId": 101,
  "name": "Laptop",
  "attributes": {
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

The fields inside `attributes` may vary.

A document database or a relational database with JSONB may be suitable.

### Relationship-Centric Data

Example:

```text
User -> Follows -> User
User -> Likes -> Post
Post -> TaggedWith -> Topic
```

A graph database may be appropriate if traversing these relationships is a major workload.

### Decision Table

| Data Characteristic                | Potentially Suitable Model |
| ---------------------------------- | -------------------------- |
| Strongly relational                | Relational                 |
| Document-oriented                  | Document                   |
| Simple key-based access            | Key-Value                  |
| Large distributed partitioned data | Wide-Column                |
| Deep relationship traversal        | Graph                      |

---

## 6. Decision Factor 2: Query Patterns

Data modeling should follow how the application accesses data.

Suppose you are building an order management application.

Typical queries:

1. Get order by ID.
2. Get all orders for a user.
3. Get order items.
4. Get total customer spending.
5. Find orders by payment status.
6. Generate monthly revenue reports.

These queries involve multiple entities and aggregations.

A relational database is a natural starting point.

Now consider a shopping cart:

```text
cart:user101 -> {
    product101: 2,
    product102: 1
}
```

The application usually accesses the cart by user ID.

A key-value database is a natural fit.

### Important Principle

A database should be selected based on the queries the application needs to execute, not only on the shape of the stored data.

Two databases can store similar data but have very different strengths for retrieving it.

---

## 7. Decision Factor 3: Transactions and Consistency

This is one of the most important decision factors.

### Scenario A: Banking

A customer transfers ₹5,000.

The system must:

- Debit one account.
- Credit another account.
- Record the transaction.
- Prevent incorrect concurrent updates.

A relational database with strong transaction guarantees is a sensible starting point.

### Scenario B: Social Media Likes

A user likes a post.

The application updates a like count.

If the displayed count takes a short time to catch up, eventual consistency may be acceptable.

A distributed or cached architecture may be appropriate.

### Scenario C: Inventory Reservation

A customer purchases the last available item.

Two customers must not both successfully reserve the same final unit.

The application needs a correct concurrency-control strategy.

This can be implemented using SQL transactions and atomic updates, or other carefully designed mechanisms.

Choosing NoSQL does not remove the need to solve concurrency.

### Comparison

| Requirement                          | Consideration                               |
| ------------------------------------ | ------------------------------------------- |
| Atomic multi-record financial update | Transaction capabilities are critical       |
| Read-after-write                     | Need suitable consistency guarantees        |
| Temporary stale data acceptable      | Eventual consistency may be acceptable      |
| High concurrency on inventory        | Atomic updates and concurrency control      |
| Distributed multi-node transaction   | Examine exact database guarantees and costs |

---

## 8. Decision Factor 4: Scalability

Consider an application growing from 10,000 users to 100 million users.

You should not immediately conclude that you need NoSQL.

First identify the actual bottleneck.

### Step 1: Optimize the Existing Database

Check:

- Query execution plans.
- Missing indexes.
- Slow queries.
- Excessive JOINs.
- Inefficient transactions.
- Connection pool configuration.
- Database CPU and memory.
- Storage performance.

### Step 2: Scale Vertically

Increase the resources of the database server when appropriate.

```text
Before:
8 CPU cores
32 GB RAM

After:
32 CPU cores
128 GB RAM
```

### Step 3: Introduce Replication

If reads are overwhelming the primary, introduce read replicas.

```text
          Application
               |
       -------------------
       |        |        |
       v        v        v
     Primary  Replica  Replica
```

### Step 4: Partition Large Tables

If a table becomes difficult to manage, consider partitioning.

For example, partition an event table by month.

### Step 5: Consider Sharding

If one database server cannot meet the storage or throughput requirements, consider distributing data across multiple servers.

### Important Point

Relational and NoSQL databases can both support horizontal scaling through different architectures.

Do not choose NoSQL simply because you expect future growth.

Choose the architecture that meets the workload requirements with acceptable complexity.

---

## 9. Decision Factor 5: Performance

Performance depends on the operation.

Consider these examples:

| Operation                          | Potentially Suitable Choice |
| ---------------------------------- | --------------------------- |
| Get session by ID                  | Redis                       |
| Complex order and payment JOIN     | PostgreSQL                  |
| Retrieve complete product document | MongoDB                     |
| Traverse social relationships      | Neo4j                       |
| Large distributed event writes     | Cassandra                   |

These are common patterns, not absolute performance guarantees.

A properly designed PostgreSQL database can handle millions of records and substantial traffic.

A poorly designed MongoDB or Cassandra schema can perform badly.

**The database model must match the access pattern.**

---

## 10. Decision Factor 6: Cost and Operational Complexity

A database decision is not only a technical decision.

It also affects infrastructure, engineering time, maintenance, and reliability.

Consider two options.

### Option A: PostgreSQL Only

```text
Node.js Backend
       |
       v
   PostgreSQL
```

Advantages:

- One primary data platform.
- Simpler monitoring.
- Fewer backups to manage.
- Easier operational ownership.
- SQL can handle many different workloads.

Disadvantages:

- Some specialized workloads may need additional optimization or separate systems.
- One database may eventually become a bottleneck for certain access patterns.

### Option B: Multiple Databases

```text
Node.js Backend
       |
   -------------
   |     |     |
   v     v     v
 Postgres Mongo Redis
```

Advantages:

- Specialized data models.
- Different workloads can be optimized independently.
- Potentially better performance for specific operations.

Disadvantages:

- More infrastructure.
- More monitoring.
- More backup and recovery processes.
- Data synchronization.
- Different consistency guarantees.
- More failure scenarios.
- More knowledge required to operate the system.

### Cost Comparison

| Factor                  | One Database                         | Multiple Databases         |
| ----------------------- | ------------------------------------ | -------------------------- |
| Infrastructure          | Usually simpler                      | More components            |
| Monitoring              | Easier                               | More involved              |
| Backup                  | Fewer systems                        | Multiple backup strategies |
| Data synchronization    | Usually simpler                      | May be required            |
| Operational expertise   | Less breadth                         | More specialized knowledge |
| Workload specialization | Limited to one system's capabilities | More options               |

### Important Lesson

Do not introduce another database unless it solves a real problem.

The cost of operating another database is ongoing, not a one-time development cost.

---

## 11. Real-World Database Selection Scenarios

Let's examine common applications.

### 11.1 Banking Application

Requirements:

- Accounts.
- Transactions.
- Transfers.
- Balance management.
- Audit records.
- Strong transactional guarantees.

<badge color="success">Good starting choice</badge>

**PostgreSQL or another relational database.**

Why?

- ACID transactions.
- Constraints.
- Referential integrity.
- Complex SQL queries.
- Strong relational modeling.

A banking system may also use additional databases for analytics, caching, or other specialized workloads.

### 11.2 Social Media Application

Requirements:

- Users.
- Posts.
- Comments.
- Likes.
- Followers.
- News feeds.
- Recommendations.

Potential architecture:

| Responsibility                       | Potential Database                                   |
| ------------------------------------ | ---------------------------------------------------- |
| User accounts and core business data | PostgreSQL                                           |
| Caching and sessions                 | Redis                                                |
| Relationship traversal               | Graph database, when justified                       |
| Activity feeds                       | Document or wide-column store, depending on workload |
| Analytics                            | Analytical database                                  |

There is no requirement to use all these technologies from the beginning.

### 11.3 E-Commerce Application

Requirements:

- Products.
- Users.
- Orders.
- Payments.
- Inventory.
- Shopping carts.
- Search.

Potential architecture:

| Responsibility   | Potential Database          |
| ---------------- | --------------------------- |
| Users            | PostgreSQL                  |
| Orders           | PostgreSQL                  |
| Payments         | PostgreSQL                  |
| Inventory        | PostgreSQL                  |
| Product catalog  | PostgreSQL or MongoDB       |
| Shopping cart    | Redis or PostgreSQL         |
| Sessions         | Redis                       |
| Full-text search | Elasticsearch or OpenSearch |
| Analytics        | OLAP database               |

The core transactional data can remain in PostgreSQL even if the application uses other databases.

### 11.4 Real-Time Chat Application

Requirements:

- Users.
- Conversations.
- Messages.
- Delivery status.
- Presence.
- Online status.

Possible architecture:

| Responsibility          | Potential Technology                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| User accounts           | PostgreSQL                                                                 |
| Message storage         | Relational or wide-column database, depending on scale and access patterns |
| Online presence         | Redis                                                                      |
| Real-time communication | WebSockets                                                                 |
| Analytics               | Analytical database                                                        |

The choice of message database depends on message volume, retention, ordering, consistency, and retrieval patterns.

### 11.5 Analytics Platform

Requirements:

- Billions of events.
- Large aggregations.
- Time-based analysis.
- Reporting.
- Historical queries.

An OLAP or analytical database may be more suitable than a transactional OLTP database.

Examples include:

- ClickHouse.
- BigQuery.
- Snowflake.
- Amazon Redshift.

These are analytical database systems, not all members of the traditional NoSQL categories.

---

## 12. When Should You Combine SQL and NoSQL?

This brings us to an important architecture concept: Polyglot Persistence.

### 12.1 What Is Polyglot Persistence?

Polyglot persistence means using multiple database technologies within the same application.

Each database is selected according to the workload it handles.

Example:

```text
                  Node.js Backend
                         |
          -------------------------------
          |             |               |
          v             v               v
      PostgreSQL      MongoDB          Redis
          |             |               |
          v             v               v
       Orders        Product          Sessions
       Payments      Documents        Cache
       Users
```

### 12.2 Why Combine Them?

Because different workloads have different requirements.

For example:

- PostgreSQL provides relational transactions.
- MongoDB provides document-oriented storage.
- Redis provides fast key-based access.
- A search engine provides specialized search.

### 12.3 Does This Mean Every Large Application Needs Multiple Databases?

No.

Many production applications can operate successfully with PostgreSQL alone.

A useful architecture should minimize unnecessary components.

### 12.4 When Should You Add Another Database?

Ask:

1. Is the current database unable to handle this workload efficiently?
2. Is there a specialized data model that offers a meaningful advantage?
3. Can the application justify the additional operational complexity?
4. How will data synchronization work?
5. What happens if the additional database becomes unavailable?

If you cannot answer these questions, you probably have not justified adding another database.

---

## 13. Database Selection Decision Tree

Use this as a practical starting framework.

```text
                 START
                   |
                   v
         What is the main data model?
                   |
       -----------------------------
       |             |             |
       v             v             v
   Relational     Documents     Relationships
       |             |             |
       v             v             v
     SQL         Document       Graph DB
   Database      Database
       |
       v
 Are transactions and relational
 integrity central?
       |
    ----------
    |        |
   YES       NO
    |        |
    v        v
   SQL    Evaluate other
          data models


Additional workload requirements:

Key-based access?
       |
       v
     Redis

Large distributed partition-key workload?
       |
       v
     Wide-Column DB

Full-text search?
       |
       v
     Search Engine
```

This is a decision aid, not a strict rule. A single database can support multiple workloads, and some applications require more than one model.

---

## 14. Common Database Selection Mistakes

### Mistake 1: Choosing MongoDB Because the Schema Changes Frequently

A changing schema does not automatically require MongoDB.

PostgreSQL supports JSONB and can handle flexible data structures.

**Better approach:** Evaluate whether the entire document model and query patterns justify a document database.

### Mistake 2: Choosing NoSQL Because the Application Will Have Millions of Users

User count alone does not determine database requirements.

A million mostly inactive users can generate less database traffic than 50,000 highly active users.

**Better approach:** Estimate requests per second, read/write ratio, storage growth, and query patterns.

### Mistake 3: Choosing Redis as the Primary Database for Everything

Redis is excellent for many key-value and in-memory workloads, but it has different persistence, memory, query, and transactional characteristics from a relational database.

**Better approach:** Use it where its data model and durability guarantees fit the requirement.

### Mistake 4: Using MongoDB Without Understanding Document Modeling

Developers sometimes create documents that embed every related entity.

This can cause:

- Large documents.
- Unbounded arrays.
- Duplicate data.
- Difficult updates.
- Complex synchronization.

**Better approach:** Decide carefully between embedding and referencing.

### Mistake 5: Using Multiple Databases Too Early

Every additional database increases operational complexity.

**Better approach:** Start with the simplest architecture that satisfies the requirements.

### Mistake 6: Assuming SQL Cannot Scale

Relational databases can scale significantly through optimization, replication, partitioning, and sharding.

**Better approach:** Identify the actual bottleneck before changing database technologies.

### Mistake 7: Ignoring Consistency Between Databases

If PostgreSQL stores an order and MongoDB stores a separate order representation, how do updates propagate?

**Better approach:** Define ownership, synchronization, retries, and recovery.

---

## 15. A Practical Database Selection Checklist

Before selecting a database for a new project, answer these questions.

### Data Model

- Are records strongly related?
- Is the data naturally represented as documents?
- Are relationships the primary query requirement?
- Do records have substantially different structures?

### Query Patterns

- Do you need complex JOINs?
- Are most reads by primary key?
- Do you need multi-level relationship traversal?
- Are queries known in advance?

### Transactions and Consistency

- Do multiple records need to update atomically?
- Is read-after-write consistency required?
- Can the application tolerate stale data?
- What happens if a node fails during an operation?

### Scalability

- How much data will be stored?
- What is the expected read throughput?
- What is the expected write throughput?
- Can one server handle the workload?
- Will partitioning, replication, or sharding be required?

### Operations

- Can the team operate the database?
- How will backups work?
- How will monitoring work?
- What is the recovery strategy?
- What is the total infrastructure cost?

### Final Decision

Choose the database that meets the requirements with the lowest acceptable complexity.

---

## 16. Interview Questions

### Q1. When should you choose SQL over NoSQL?

When the application has relational data, complex JOINs, strong integrity requirements, and transactional workloads.

### Q2. When should you choose NoSQL?

When a specialized data model or access pattern benefits from key-value, document, wide-column, or graph storage.

### Q3. Should every application use MongoDB because it has a flexible schema?

No. PostgreSQL also supports JSONB. The decision depends on the entire data model and query requirements.

### Q4. Why is PostgreSQL a good default for many backend applications?

It provides relational modeling, transactions, constraints, indexing, JOINs, JSONB, and mature operational capabilities.

### Q5. When would you use Redis?

For caching, sessions, counters, rate limiting, temporary data, and other suitable key-based workloads.

### Q6. When would you use Cassandra?

For large distributed workloads where the data model and queries align with its partition-oriented architecture and consistency model.

### Q7. When would you use Neo4j?

When relationship traversal is central to the application, such as social connections, recommendations, or fraud detection.

### Q8. Can SQL and NoSQL databases be used together?

Yes. This is called polyglot persistence.

### Q9. What is the disadvantage of polyglot persistence?

More infrastructure, synchronization, monitoring, backups, failure handling, and operational complexity.

### Q10. How would you choose a database for an e-commerce application?

I would start with a relational database for core transactional data such as users, orders, payments, and inventory. I would introduce Redis for caching or sessions, a search engine for advanced search, and a document database only if the product data model and workload justify it.

### Q11. How would you choose a database for a social media application?

I would evaluate relational storage for core accounts and transactions, caching for hot data, and specialized storage for feeds, activity, or graph traversal if the workload requires it.

### Q12. What is the biggest mistake in database selection?

Choosing technology based on popularity or assumptions rather than actual requirements and access patterns.

### Q13. Is NoSQL always better for horizontal scaling?

No. Both relational and NoSQL databases can scale horizontally. The implementation, limitations, and operational complexity differ.

### Q14. What is the difference between a database and a cache?

A database is generally the authoritative system for storing and retrieving application data. A cache stores data temporarily or as a derived copy to accelerate access. Some systems can serve both roles, but their durability and consistency characteristics must be considered.

### Q15. When should you introduce a second database?

When a specific workload has requirements that the existing database cannot meet efficiently enough, and the benefits justify the operational and synchronization costs.

---

## 17. Practical Design Exercise

### Scenario: Design a Large E-Commerce Backend

You are building an e-commerce platform with:

- 10 million users.
- 5 million products.
- 100 million orders.
- High product browsing traffic.
- High order creation traffic.
- Shopping cart functionality.
- Payment processing.
- Product search.
- Analytics dashboards.

### Exercise A: Select the Primary Database

Which database would you choose for:

- Users?
- Orders?
- Payments?
- Inventory?

Explain your reasoning.

### Exercise B: Select Supporting Databases

Would you use:

- Redis?
- MongoDB?
- Cassandra?
- Elasticsearch or OpenSearch?

For each one, identify the specific workload it would handle.

### Exercise C: Define Data Ownership

Suppose PostgreSQL stores orders, while an analytics database stores order summaries.

Answer:

1. Which database is the source of truth?
2. How will updates reach the analytics database?
3. What happens if event publishing fails?
4. How will duplicate events be handled?
5. How will delayed analytics data be represented?

### Exercise D: Identify Unnecessary Complexity

Suppose your application has 20,000 users and moderate traffic.

You propose:

- PostgreSQL.
- MongoDB.
- Redis.
- Cassandra.
- Neo4j.
- Elasticsearch.

Explain why this architecture may be unnecessarily complex.

Identify the smallest architecture that satisfies the requirements.

---

## 18. Final Revision Sheet

| Requirement                            | Potential Database Choice  |
| -------------------------------------- | -------------------------- |
| Financial transactions                 | PostgreSQL / relational    |
| Complex relationships                  | Relational                 |
| Flexible document structures           | MongoDB / document         |
| Sessions and caching                   | Redis / key-value          |
| High-volume distributed event workload | Cassandra / wide-column    |
| Relationship traversal                 | Neo4j / graph              |
| Full-text search                       | Elasticsearch / OpenSearch |
| Large analytical queries               | OLAP database              |

### Important Architecture Principles

1. Start with requirements, not technology.
2. Understand data structure and access patterns.
3. Evaluate transaction and consistency requirements.
4. Optimize before introducing additional databases.
5. Do not assume NoSQL is automatically faster or more scalable.
6. Use specialized databases only when they provide meaningful benefits.
7. Define a source of truth for every important piece of data.
8. Plan synchronization and failure recovery when using multiple databases.
9. Account for operational complexity.
10. Choose the simplest architecture that meets the requirements.

### The Most Important Mental Model

```text
                DATABASE SELECTION
                        |
                        v
                 BUSINESS REQUIREMENTS
                        |
           ----------------------------
           |            |             |
           v            v             v
        DATA MODEL   ACCESS PATTERN  CONSISTENCY
           |            |             |
           ----------------------------
                        |
                        v
                 DATABASE SELECTION
                        |
           ----------------------------
           |            |             |
           v            v             v
          SQL          NoSQL       COMBINATION
           |            |             |
           ----------------------------
                        |
                        v
               OPERATIONAL EVALUATION
                        |
                        v
                FINAL ARCHITECTURE
```

**The central lesson: A good database architecture is not the one with the most technologies. It is the simplest architecture that correctly handles the application's data, workload, and growth requirements.**

---

## 19. Completion of Part 8 — NoSQL Fundamentals

You have completed:

| Chapter | Topic                       | Status    |
| ------- | --------------------------- | --------- |
| 8A      | Introduction to NoSQL       | Completed |
| 8B      | SQL vs NoSQL                | Completed |
| 8C      | When to Choose SQL vs NoSQL | Completed |

### What You Should Be Able to Explain Now

1. What NoSQL means.
2. The four major NoSQL database categories.
3. How relational and document data models differ.
4. How embedding and referencing work.
5. Why schema flexibility does not mean no validation.
6. How SQL and NoSQL transaction capabilities differ.
7. How consistency models affect application behavior.
8. Why database selection depends on query patterns.
9. When to use PostgreSQL, MongoDB, Redis, Cassandra, or Neo4j.
10. Why multiple databases introduce operational complexity.

You should now be able to justify a database choice based on technical requirements rather than popularity.
