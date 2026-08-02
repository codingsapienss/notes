---
sidebar_label: Polyglot Persistence Fundamentals
sidebar_position: 1
---

# Polyglot Persistence Fundamentals

# 1. Introduction

Until now, we have studied different database categories independently:

- Relational databases.
- Key-value databases.
- Document databases.
- Wide-column databases.
- Graph databases.
- Search databases.
- Time-series databases.
- OLTP and OLAP databases.
- NewSQL databases.

Each database category is designed around particular data models, access patterns, and workload requirements.

But real-world applications rarely have only one type of data or one type of workload.

Consider an e-commerce application.

It may need to:

1. Store customers, orders, and payments.
2. Store shopping carts and user sessions.
3. Store flexible product information.
4. Search products by name, category, and description.
5. Analyze sales and customer behavior.
6. Store application events and metrics.
7. Recommend products based on customer relationships and behavior.

Can one database handle all these requirements?

Technically, a sufficiently capable database may support several of these operations. But that does not mean it is the best choice for every workload.

A relational database is excellent for structured transactional data, but a specialized search engine may provide better full-text search capabilities.

A key-value database may provide faster access to frequently requested session data.

A data warehouse may be more suitable for large analytical queries.

This leads to an important architectural concept:

**Polyglot Persistence.**

It means using multiple types of databases within the same application or system, selecting each database according to the requirements of the data and workload.

This is the final major part of our DBMS roadmap.

---

# 2. What Is Polyglot Persistence?

Polyglot means using multiple languages or approaches.

Persistence refers to storing data so that it remains available beyond the lifetime of an application process.

In database architecture, polyglot persistence means:

**Using multiple database technologies within one application or organization, where each database is selected for a particular data model or workload.**

Instead of forcing every type of data into one database, we select appropriate storage technologies for different requirements.

## 2.1 Single Database Architecture

Consider an application that uses only PostgreSQL.

```text
                 Application
                      |
                      v
                  PostgreSQL
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
    Customers       Orders        Products
       |              |              |
       +--------------+--------------+
                      |
                      v
                   Reports
```

PostgreSQL stores:

- Customer records.
- Orders.
- Payments.
- Product information.
- Application events.
- Search-related data.
- Analytical data.

This architecture is relatively simple.

However, as the application grows, different workloads may compete for the same database resources.

For example:

- Transactional writes compete with analytical queries.
- Full-text search competes with normal application queries.
- High-volume event ingestion increases storage and index-maintenance work.
- Frequently accessed session data creates additional database traffic.

A single database may still handle these workloads successfully, but its performance and operational characteristics must be evaluated.

## 2.2 Polyglot Persistence Architecture

Now consider using multiple databases.

```text
                      Application
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      PostgreSQL          Redis           MongoDB
          |                |                |
          v                v                v
     Transactions        Cache          Documents
     Orders              Sessions       Product Data
     Payments            Cart           Flexible Data

          +----------------+----------------+
                           |
              +------------+------------+
              |                         |
              v                         v
         Elasticsearch             Data Warehouse
              |                         |
              v                         v
          Full-Text Search          Analytics
```

Each database has a specific responsibility.

| Database                   | Responsibility                            |
| -------------------------- | ----------------------------------------- |
| PostgreSQL                 | Customers, orders, payments, transactions |
| Redis                      | Sessions, caching, shopping carts         |
| MongoDB                    | Flexible product documents                |
| Elasticsearch / OpenSearch | Full-text search                          |
| Data warehouse             | Business analytics and reporting          |
| Time-series database       | Metrics and time-based events             |

This is polyglot persistence.

The goal is not to use as many databases as possible.

The goal is to use the right database for each workload.

---

# 3. Why Does Polyglot Persistence Exist?

The main reason is that different workloads have different requirements.

A database optimized for one workload may not be the best choice for another.

Let's understand this through common application requirements.

## 3.1 Different Data Models

Different data naturally fits different storage models.

Consider an e-commerce application.

### Relational Data

```text
Customers
---------
customer_id
name
email

Orders
------
order_id
customer_id
total_amount

Payments
--------
payment_id
order_id
amount
status
```

This data has relationships and transactional requirements.

A relational database such as PostgreSQL or MySQL is a natural choice.

### Document Data

Consider product information.

```json
{
  "productId": 501,
  "name": "Smartphone",
  "brand": "ExampleBrand",
  "specifications": {
    "ram": "8GB",
    "storage": "256GB",
    "screen": "6.7 inch"
  },
  "variants": [
    {
      "color": "Black",
      "price": 45000
    },
    {
      "color": "Blue",
      "price": 46000
    }
  ]
}
```

Products may have different attributes depending on their category.

A document database such as MongoDB can be useful for storing this kind of flexible structure.

A relational database can also represent this information using normalized tables or JSON columns. Choosing a document database is a design decision, not a requirement imposed by the data shape.

### Key-Value Data

Consider a user session.

```text
session:user:101
```

Value:

```json
{
  "userId": 101,
  "loginAt": "2026-11-14T10:00:00Z",
  "role": "customer"
}
```

The application frequently retrieves the session using a known key.

Redis is a natural candidate for this access pattern.

### Search Data

Suppose users search:

```text
"wireless noise cancelling headphones"
```

The search engine may need to support:

- Tokenization.
- Text matching.
- Relevance scoring.
- Fuzzy matching.
- Filtering.
- Faceted search.

Elasticsearch or OpenSearch can be suitable for these workloads.

### Analytical Data

Suppose the business asks:

```sql
SELECT
    product_id,
    SUM(quantity) AS total_sold
FROM sales
GROUP BY product_id;
```

Running large analytical queries on the same database that handles customer orders can interfere with transactional workloads.

A data warehouse or analytical database may be more suitable.

## 3.2 Different Performance Requirements

Different workloads optimize for different performance characteristics.

| Workload            | Important Performance Requirement | Potential Database   |
| ------------------- | --------------------------------- | -------------------- |
| Payment transaction | Atomicity and consistency         | PostgreSQL           |
| Session lookup      | Very fast key access              | Redis                |
| Product retrieval   | Flexible document access          | MongoDB              |
| Product search      | Full-text relevance               | Elasticsearch        |
| Sales analytics     | Large-scale aggregation           | Data warehouse       |
| Application metrics | Time-based ingestion and queries  | Time-series database |

No database is universally best at everything.

## 3.3 Different Scaling Requirements

Different data types can grow at different rates.

Suppose:

```text
Orders:             10 million records
Sessions:            5 million active keys
Search documents:   50 million documents
Application events: 500 million events
```

These workloads have different:

- Storage requirements.
- Read/write patterns.
- Indexing requirements.
- Retention requirements.
- Scaling behavior.

Using specialized databases allows each workload to scale according to its needs.

## 3.4 Different Consistency Requirements

Not every piece of data needs the same consistency guarantees.

Consider an e-commerce application:

| Data                   | Consistency Requirement                                      |
| ---------------------- | ------------------------------------------------------------ |
| Payment status         | Strong correctness required                                  |
| Inventory deduction    | Strong transactional correctness often required              |
| Shopping cart          | Depends on product requirements; conflicts may need handling |
| Search index           | Eventual consistency is often acceptable                     |
| Product recommendation | Some staleness is usually acceptable                         |
| Analytics dashboard    | Delayed updates are often acceptable                         |

For example, when a payment succeeds, the authoritative payment record must be correct.

But the search index does not necessarily need to reflect a product update at the exact same instant.

This allows different databases to use different consistency and update mechanisms.

---

# 4. Database Specialization

Database specialization means selecting a database based on the type of workload it handles.

Let's understand the main categories.

## 4.1 Relational Database — PostgreSQL / MySQL

<text>**Primary responsibility:** Transactional and relational data.</text>

<AsyncImage query="PostgreSQL relational database tables ER diagram illustration" aspectRatio="16:9" width="100%" />

Typical data:

- Users.
- Orders.
- Payments.
- Inventory.
- Transactions.
- Financial records.

Why use it?

- Relational data modeling.
- SQL queries.
- Joins.
- Constraints.
- ACID transactions.
- Referential integrity.
- Structured data validation.

Example:

```sql
BEGIN;

INSERT INTO orders (
    order_id,
    customer_id,
    total_amount
)
VALUES (5001, 101, 2500);

INSERT INTO payments (
    payment_id,
    order_id,
    amount,
    status
)
VALUES (9001, 5001, 2500, 'SUCCESS');

COMMIT;
```

The relational database acts as the authoritative source for these transactional records.

## 4.2 Key-Value Database — Redis

<text>**Primary responsibility:** Fast access using known keys.</text>

<AsyncImage query="Redis key value database architecture diagram" aspectRatio="16:9" width="100%" />

Typical data:

- Sessions.
- Cache entries.
- Temporary tokens.
- Rate-limit counters.
- Shopping cart data.
- Frequently accessed values.

Example:

```javascript
await redis.set(
  "session:user:101",
  JSON.stringify({
    userId: 101,
    role: "customer",
  }),
  {
    EX: 3600,
  },
);
```

Retrieval:

```javascript
const session = await redis.get("session:user:101");
```

Why use Redis?

- Very fast key-based access.
- In-memory data structures.
- TTL support.
- Atomic operations.
- Caching capabilities.
- Pub/Sub and other messaging-related features.

Redis can persist data, but its persistence and durability configuration must be chosen according to the use case.

It should not automatically replace the primary transactional database.

## 4.3 Document Database — MongoDB

<text>**Primary responsibility:** Flexible, document-oriented data.</text>

<AsyncImage query="MongoDB BSON document database collection document architecture diagram" aspectRatio="16:9" width="100%" />

Typical data:

- Product catalogs.
- Content management.
- User preferences.
- Flexible application configurations.
- Campaign metadata.
- Nested application data.

Example:

```javascript
const product = {
  productId: 501,
  name: "Smartphone",
  category: "Electronics",
  specifications: {
    ram: "8GB",
    storage: "256GB",
  },
  variants: [
    {
      color: "Black",
      price: 45000,
    },
    {
      color: "Blue",
      price: 46000,
    },
  ],
};
```

Why use MongoDB?

- Document-oriented data model.
- Flexible schema.
- Nested structures.
- Document-level atomic operations.
- Indexing and aggregation.
- Horizontal sharding support.

MongoDB also supports multi-document ACID transactions. It should not be described as a database without transactional capabilities.

## 4.4 Search Database — Elasticsearch / OpenSearch

<text>**Primary responsibility:** Full-text search and relevance ranking.</text>

<AsyncImage query="Elasticsearch inverted index full text search architecture diagram" aspectRatio="16:9" width="100%" />

Typical data:

- Product search indexes.
- Website search.
- Log search.
- Search suggestions.
- Text-based filtering.

Example query:

```json
{
  "query": {
    "match": {
      "name": "wireless headphones"
    }
  }
}
```

Why use a search database?

- Inverted indexes.
- Full-text search.
- Relevance scoring.
- Fuzzy matching.
- Aggregations.
- Filtering and faceted search.

A search database is usually not the authoritative source for payments or orders.

It commonly stores an indexed representation of data from another system.

## 4.5 Wide-Column Database — Cassandra

<text>**Primary responsibility:** Large-scale distributed workloads with known query patterns.</text>

<AsyncImage query="Apache Cassandra distributed wide column database architecture nodes diagram" aspectRatio="16:9" width="100%" />

Typical data:

- Large event histories.
- High-volume activity records.
- Distributed write-heavy workloads.
- Time-ordered application data.
- Large-scale user activity.

Example table:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    event_data TEXT,
    PRIMARY KEY (user_id, event_time)
);
```

Why use Cassandra?

- Distributed architecture.
- High write throughput for suitable workloads.
- Partition-based data distribution.
- Replication.
- Availability across nodes.
- Query-driven data modeling.

Cassandra is not a general replacement for a relational database with arbitrary joins and multi-row transactions.

## 4.6 Time-Series Database — InfluxDB / TimescaleDB

<text>**Primary responsibility:** Time-stamped data.</text>

<AsyncImage query="time series database architecture metrics timestamps data visualization diagram" aspectRatio="16:9" width="100%" />

Typical data:

- Server CPU metrics.
- Application latency.
- Network measurements.
- IoT sensor data.
- Monitoring metrics.
- Device telemetry.

Example:

```text
timestamp             metric          value
------------------------------------------------
10:00:00               cpu_usage       45
10:00:05               cpu_usage       48
10:00:10               cpu_usage       52
10:00:15               cpu_usage       49
```

Why use a time-series database?

- Time-based indexing.
- Time-window queries.
- Retention policies.
- Downsampling.
- Aggregations over time.
- Efficient ingestion of timestamped measurements.

## 4.7 Analytical Database / Data Warehouse

<text>**Primary responsibility:** Large-scale analytics and reporting.</text>

<AsyncImage query="modern data warehouse OLAP analytics architecture diagram data pipelines" aspectRatio="16:9" width="100%" />

Typical data:

- Sales reports.
- Customer analytics.
- Revenue analysis.
- Marketing performance.
- Business intelligence.
- Historical reporting.

Example:

```sql
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) AS revenue
FROM sales
GROUP BY DATE_TRUNC('month', order_date);
```

Why use an analytical database?

- Columnar storage.
- Large aggregations.
- Analytical query optimization.
- Historical data processing.
- Separation of analytical and transactional workloads.

---

# 5. One Application, Multiple Databases

Let's combine everything into one realistic architecture.

Consider an e-commerce application.

## 5.1 Requirements

The application needs:

1. User registration and authentication.
2. Product catalog.
3. Shopping carts.
4. Order processing.
5. Payment processing.
6. Product search.
7. Recommendations.
8. Sales analytics.
9. Server monitoring.

Using one database for everything may work initially, but specialized databases can become useful as workload requirements grow.

## 5.2 Architecture

```text
                         CLIENT
                           |
                           v
                     Node.js / Express
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
         PostgreSQL      MongoDB       Redis
             |             |             |
             v             v             v
         Customers       Products      Sessions
         Orders          Catalog       Cache
         Payments        Metadata      Cart
         Inventory
             |
             |
       +-----+-------------------------------+
       |                                     |
       v                                     v
  Event / CDC Pipeline                  Application
       |                                     |
       v                                     v
 Elasticsearch                        External Services
       |
       v
 Product Search

       Event / CDC Pipeline
                |
                v
        Analytical Warehouse
                |
                v
          Sales Reports
```

This diagram is conceptual. A production architecture may use queues, event brokers, change-data-capture systems, and separate services between these components.

## 5.3 Responsibility Distribution

| Requirement      | Database             | Reason                         |
| ---------------- | -------------------- | ------------------------------ |
| Customer records | PostgreSQL           | Relational structure           |
| Orders           | PostgreSQL           | Transactional consistency      |
| Payments         | PostgreSQL           | Transactional correctness      |
| Inventory        | PostgreSQL           | Atomic updates and constraints |
| Product catalog  | MongoDB              | Flexible product attributes    |
| User sessions    | Redis                | Fast key-based lookup          |
| Shopping cart    | Redis                | Fast temporary state           |
| Product search   | Elasticsearch        | Full-text search               |
| Sales analytics  | Data warehouse       | Analytical queries             |
| Server metrics   | Time-series database | Time-based measurements        |

Notice that each database has a clear responsibility.

This is the central idea of polyglot persistence.

---

# 6. Why Not Store Everything in One Database?

This is an important architectural question.

You might ask:

"If PostgreSQL supports JSONB, indexes, transactions, partitioning, and full-text search, why do we need MongoDB, Redis, or Elasticsearch?"

That is a valid question.

A specialized database is not automatically necessary just because another database category exists.

Let's examine the tradeoffs.

## 6.1 Can PostgreSQL Handle Multiple Workloads?

Yes.

PostgreSQL supports:

- Relational tables.
- JSONB documents.
- Indexes.
- Full-text search.
- Transactions.
- Table partitioning.
- Replication.
- Extensions.
- Analytical queries.

A single PostgreSQL database can support a large range of application requirements.

For many applications, it is the best starting point.

## 6.2 Why Introduce Redis?

Suppose every request requires checking a session.

Without caching:

```text
Request
   |
   v
Application
   |
   v
PostgreSQL
   |
   v
Session Lookup
```

With Redis:

```text
Request
   |
   v
Application
   |
   v
Redis
   |
   v
Session Result
```

Redis can reduce repeated database reads and provide fast access to session data.

However, caching introduces invalidation, expiration, and consistency concerns.

## 6.3 Why Introduce MongoDB?

Suppose products have very different structures.

```text
Electronics:
RAM, storage, screen size

Clothing:
Size, color, material

Furniture:
Dimensions, weight, material
```

A document model can make it convenient to store category-specific product attributes.

But PostgreSQL can also represent flexible attributes through JSONB or related tables.

MongoDB becomes useful when its document-oriented model and operational characteristics provide a meaningful advantage.

## 6.4 Why Introduce Elasticsearch?

Suppose users search:

```text
"cheap wireless headphones with noise cancellation"
```

A normal relational query can perform text matching, but sophisticated search often requires:

- Token analysis.
- Relevance ranking.
- Fuzzy matching.
- Synonyms.
- Faceted filtering.
- Search suggestions.

A dedicated search engine is designed for this type of workload.

## 6.5 Why Introduce a Data Warehouse?

Suppose the business runs:

```sql
SELECT
    product_id,
    SUM(quantity),
    SUM(revenue)
FROM historical_sales
GROUP BY product_id;
```

This query may scan millions or billions of records.

Running large analytical queries on the transactional database can interfere with normal application traffic.

A data warehouse separates analytical workloads from operational transactions.

## 6.6 The Correct Mental Model

Do not ask:

"Can PostgreSQL technically store this data?"

Ask:

"Does PostgreSQL provide the best operational and performance characteristics for this workload at our scale?"

Technical capability and architectural suitability are different questions.

---

# 7. Polyglot Persistence and Data Ownership

Using multiple databases introduces an important question:

**Which database owns the authoritative version of each piece of data?**

Without clear ownership, different databases may contain conflicting versions of the same record.

## 7.1 System of Record

A system of record is the authoritative source for a particular piece of information.

Example:

| Data                 | Authoritative Database                                          |
| -------------------- | --------------------------------------------------------------- |
| Customer account     | PostgreSQL                                                      |
| Order status         | PostgreSQL                                                      |
| Payment status       | PostgreSQL                                                      |
| Product catalog      | MongoDB                                                         |
| Session state        | Redis, if designed as the authoritative session store           |
| Search index         | Elasticsearch is a derived representation                       |
| Historical analytics | Data warehouse, according to its ingestion and correction model |

The important point is that not every database should independently decide the authoritative state of the same business entity.

## 7.2 Example: Product Data

Suppose MongoDB owns product information.

```text
MongoDB:
Product 501
Name: Smartphone
Price: 45000
Category: Electronics
```

Elasticsearch contains a searchable copy:

```text
Elasticsearch:
Product 501
Name: Smartphone
Price: 45000
Category: Electronics
```

If the product price changes in MongoDB:

```text
MongoDB:
Price = 42000
```

The search index must eventually receive the update.

Until then:

```text
MongoDB:        ₹42,000
Elasticsearch:  ₹45,000
```

This is temporary data inconsistency.

It may be acceptable for search results, depending on the application.

But the checkout process should use the authoritative product and pricing rules, not blindly trust the search index.

## 7.3 Source of Truth vs Derived Data

A useful distinction:

```text
Authoritative Database
          |
          v
   Change Event / CDC
          |
          v
    Derived Database
```

For example:

```text
PostgreSQL
    |
    v
CDC / Event Pipeline
    |
    +------> Elasticsearch
    |
    +------> Data Warehouse
```

PostgreSQL owns the authoritative transactional records.

Elasticsearch and the warehouse contain derived representations.

This separation prevents the search engine or reporting database from becoming an accidental source of truth for transactions.

---

# 8. Advantages of Polyglot Persistence

## 8.1 Workload Optimization

Each database is selected for a specific workload.

This can improve performance and resource utilization.

## 8.2 Independent Scaling

Different workloads can scale separately.

For example:

```text
Search Traffic -> Scale Elasticsearch

Session Traffic -> Scale Redis

Transactions -> Scale PostgreSQL

Analytics -> Scale Data Warehouse
```

Increasing search capacity does not necessarily require increasing transactional database capacity.

## 8.3 Technology Flexibility

Teams can choose the most suitable storage technology for each requirement.

## 8.4 Workload Isolation

Heavy analytical queries do not have to compete directly with transactional workloads on the same database.

## 8.5 Specialized Features

Applications can use:

- Redis TTL and atomic counters.
- MongoDB document modeling.
- Elasticsearch relevance scoring.
- Cassandra partition-based distribution.
- Time-series retention and downsampling.
- Graph traversal.

The application gains access to capabilities designed specifically for each workload.

---

# 9. Disadvantages of Polyglot Persistence

Polyglot persistence solves one problem but introduces another.

Using multiple databases increases architectural complexity.

This is the most important tradeoff in this chapter.

## 9.1 Multiple Databases to Manage

Consider:

```text
PostgreSQL
Redis
MongoDB
Elasticsearch
Data Warehouse
```

Each database needs:

- Deployment.
- Configuration.
- Monitoring.
- Backup.
- Security.
- Capacity planning.
- Upgrades.
- Disaster recovery.
- Operational expertise.

The infrastructure is more complex than operating one database.

## 9.2 Data Synchronization

The same logical information may exist in multiple systems.

Example:

```text
MongoDB -> Product Data
Elasticsearch -> Searchable Product Data
Data Warehouse -> Product Analytics
```

When product data changes, all derived systems must receive the update.

This introduces synchronization requirements.

## 9.3 Eventual Consistency

Different databases may update at different times.

Example:

```text
10:00:00
Product price changes in MongoDB.

10:00:01
Change event is published.

10:00:03
Elasticsearch receives update.

10:00:05
Data warehouse receives update.
```

Between 10:00:00 and 10:00:03, the search index may contain stale information.

This is eventual consistency.

The systems converge toward the same logical state if events are successfully processed and no unresolved errors remain.

## 9.4 Distributed Transactions Across Databases

Suppose an application uses:

- PostgreSQL for orders.
- Redis for carts.
- MongoDB for products.
- Elasticsearch for search.

Can one ACID transaction update all four databases?

Generally, not through one ordinary local SQL transaction.

Each database has its own transaction manager and consistency model.

Coordinating atomic updates across heterogeneous databases is difficult.

Some systems support distributed transaction protocols, but relying on a single atomic transaction across all these different products is usually not the right default architecture.

Instead, applications often use:

- Saga patterns.
- Transactional outbox.
- Change data capture.
- Event-driven synchronization.
- Idempotent consumers.
- Compensating actions.

These topics will be examined in Part 19C.

## 9.5 Operational Complexity

More databases mean more failure scenarios.

For example:

```text
PostgreSQL -> Healthy
Redis -> Healthy
MongoDB -> Healthy
Elasticsearch -> Down
```

The application may still process orders, but product search may fail.

The system must define what happens when each database is unavailable.

## 9.6 Higher Infrastructure Cost

Each database consumes:

- CPU.
- Memory.
- Storage.
- Network bandwidth.
- Backup capacity.
- Monitoring resources.

Using multiple databases without a strong reason can waste money.

## 9.7 Skill Requirements

The team needs to understand multiple database technologies.

A developer familiar with PostgreSQL may not automatically understand:

- Redis eviction policies.
- MongoDB replication and sharding.
- Elasticsearch mappings and shards.
- Cassandra consistency levels.
- Data warehouse partitioning.

Technology diversity increases the team's learning and maintenance burden.

## 9.8 Disadvantages Summary

| Disadvantage             | Consequence                         |
| ------------------------ | ----------------------------------- |
| Multiple databases       | More systems to operate             |
| Data duplication         | Synchronization required            |
| Eventual consistency     | Temporary stale data                |
| Cross-database workflows | More complex transaction management |
| More infrastructure      | Higher cost                         |
| Different query models   | More application logic              |
| More failure scenarios   | More complex recovery               |
| Skill requirements       | Broader team expertise needed       |

---

# 10. When Should You Use Polyglot Persistence?

Polyglot persistence is useful when an application has genuinely different workloads that benefit from specialized database technologies.

## 10.1 Different Access Patterns

Example:

```text
Customer Orders -> Relational Queries
Sessions -> Key-Based Lookup
Product Search -> Full-Text Search
Metrics -> Time-Window Aggregation
```

These workloads have substantially different access patterns.

Using specialized databases may be justified.

## 10.2 Different Scaling Requirements

Suppose:

```text
Search Requests:       100,000/minute
Session Lookups:       500,000/minute
Order Writes:           10,000/minute
Analytics Queries:         100/minute
```

These are illustrative numbers.

The workloads have different scaling characteristics.

Separating them allows capacity to be allocated independently.

## 10.3 Different Data Models

A system may genuinely need:

- Relational data.
- Documents.
- Graph relationships.
- Time-series metrics.
- Search indexes.

Forcing every model into one storage technology may introduce unnecessary complexity or performance compromises.

## 10.4 Workload Isolation

If analytical queries significantly affect transactional performance, separating analytical storage can be valuable.

## 10.5 When to Consider It

| Situation                                          | Polyglot Persistence |
| -------------------------------------------------- | -------------------- |
| Different workloads have different access patterns | Useful               |
| Specialized search requirements                    | Useful               |
| Large-scale analytics                              | Useful               |
| High-volume session and cache access               | Useful               |
| Multiple data models                               | Potentially useful   |
| Small application with simple CRUD operations      | Usually unnecessary  |
| Team cannot operate multiple databases             | Risky                |
| No measurable benefit from specialization          | Unnecessary          |

---

# 11. When Should You NOT Use Polyglot Persistence?

Using multiple databases is not an architectural achievement by itself.

It is a tradeoff.

## 11.1 Small Applications

Suppose an application has:

- 5,000 users.
- Basic authentication.
- CRUD operations.
- Orders.
- A simple dashboard.

PostgreSQL may handle everything adequately.

Introducing Redis, MongoDB, Elasticsearch, and a data warehouse without a clear need is unnecessary.

## 11.2 When One Database Is Sufficient

PostgreSQL can handle:

- Relational data.
- JSONB.
- Transactions.
- Indexing.
- Full-text search.
- Partitioning.
- Reporting workloads of appropriate size.

If the workload is manageable, one database reduces operational and synchronization complexity.

## 11.3 When Consistency Requirements Are Difficult to Separate

Suppose the application requires:

```text
Order Created
Payment Recorded
Inventory Deducted
```

All three operations must maintain strict business correctness.

If these records are spread across different databases, the application needs additional coordination.

A simpler design may keep the authoritative transactional data in one relational database.

## 11.4 When the Team Lacks Operational Capacity

Operating five database systems requires more knowledge than operating one.

If the team cannot reliably monitor, back up, secure, and recover those systems, the architecture becomes fragile.

## 11.5 When the Performance Benefit Is Not Measured

Do not introduce a database because it is popular.

First establish:

- Current bottleneck.
- Expected improvement.
- Operational cost.
- Failure behavior.
- Data synchronization requirements.

If there is no measurable benefit, do not add another database.

---

# 12. Common Misconceptions

### Misconception 1: Polyglot persistence means using as many databases as possible.

Incorrect.

It means selecting appropriate databases for distinct requirements.

Using more databases without a clear reason increases complexity.

### Misconception 2: Every database should store its own independent copy of the data.

Incorrect.

A system should define authoritative ownership and distinguish source data from derived representations.

### Misconception 3: Data synchronization happens automatically.

Incorrect.

The application or infrastructure needs mechanisms to propagate changes between systems.

### Misconception 4: All databases can participate in one ACID transaction.

Incorrect.

Different database products generally have independent transaction managers and consistency guarantees.

Cross-database atomicity requires additional coordination and is usually handled through application-level distributed workflow patterns.

### Misconception 5: Eventual consistency means data is permanently inconsistent.

Incorrect.

Eventual consistency means updates may not be visible everywhere immediately. Under appropriate delivery and recovery assumptions, derived systems eventually converge.

### Misconception 6: Redis should store every important record because it is fast.

Incorrect.

Redis is useful for caching and fast data structures, but its durability, persistence, memory cost, and consistency behavior must match the workload.

### Misconception 7: MongoDB replaces PostgreSQL in every application.

Incorrect.

MongoDB is useful for document-oriented workloads. PostgreSQL remains highly capable for relational and JSON-oriented workloads.

### Misconception 8: Search databases should be the source of truth for products.

Usually incorrect.

Search indexes are commonly derived from authoritative product data. Checkout should validate important information against the authoritative source.

### Misconception 9: Polyglot persistence always improves performance.

Incorrect.

It can improve workload specialization, but synchronization, network communication, and operational overhead may outweigh the benefits.

### Misconception 10: One database is always the best architecture.

Incorrect.

One database can be an excellent starting point, but large systems may benefit from multiple specialized data stores.

---

# 13. Interview Questions and Answers

## Beginner Level

### Q1. What is polyglot persistence?

Polyglot persistence is the architectural approach of using multiple types of databases within one application or organization, selecting each according to the data model and workload requirements.

### Q2. Why do applications use multiple databases?

Different workloads require different capabilities, such as transactions, key-value access, document storage, full-text search, and analytical processing.

### Q3. Give an example of polyglot persistence.

An e-commerce application might use:

- PostgreSQL for orders and payments.
- Redis for sessions and caching.
- MongoDB for flexible product documents.
- Elasticsearch for product search.
- A data warehouse for analytics.

### Q4. What is a system of record?

A system of record is the authoritative source for a particular piece of business data.

### Q5. What is eventual consistency?

Eventual consistency means that updates may take time to propagate across systems, but they converge toward a consistent state if synchronization succeeds.

### Q6. Why use Redis with PostgreSQL?

Redis can provide fast key-based access for caching, sessions, and temporary data, reducing repeated reads against PostgreSQL.

### Q7. Why use Elasticsearch with MongoDB?

MongoDB can remain the authoritative product database while Elasticsearch maintains an index optimized for full-text search and relevance ranking.

## Intermediate Level

### Q8. What is the biggest disadvantage of polyglot persistence?

Increased operational complexity and the need to synchronize data across different database systems.

### Q9. Why is data ownership important?

Without clear ownership, multiple databases may contain conflicting versions of the same business data.

### Q10. What happens if MongoDB updates successfully but Elasticsearch is unavailable?

The authoritative product update may succeed while the search index remains stale. The application needs retry and recovery mechanisms to synchronize the index later.

### Q11. Why should analytics often be separated from OLTP?

Large analytical queries can consume substantial CPU, memory, and I/O resources, potentially affecting transactional performance.

### Q12. Can PostgreSQL replace all specialized databases?

It can handle many workloads, including JSONB, full-text search, and analytics of appropriate scale. However, specialized databases may offer better operational or performance characteristics for particular workloads.

### Q13. What is the difference between source data and derived data?

Source data is the authoritative version. Derived data is generated from it for another purpose, such as search, caching, or analytics.

## Advanced Level

### Q14. Why is a cross-database transaction difficult?

Each database has its own transaction manager, storage engine, failure behavior, and consistency model. Coordinating one atomic outcome across heterogeneous systems is difficult.

### Q15. What is the difference between polyglot persistence and microservices?

Polyglot persistence is about choosing multiple database technologies for different workloads. Microservices is an architectural style based on independently deployable services. They can be used together, but they are not the same concept.

### Q16. Should every microservice have a different database technology?

No. A service should own its data, but that does not mean every service needs a different database product. Multiple services can use the same database technology with appropriate isolation and ownership boundaries.

### Q17. Why should a search index not normally be treated as the source of truth?

Search indexes are optimized for retrieval and relevance ranking. They may be updated asynchronously and may contain stale or derived representations of business data.

### Q18. How can an application keep PostgreSQL and Elasticsearch synchronized?

Common approaches include:

- Transactional outbox.
- Change data capture.
- Event-driven synchronization.
- Retryable indexing workers.
- Periodic reconciliation.

### Q19. What is the most important architectural decision in a polyglot system?

Defining clear data ownership, consistency requirements, and synchronization responsibilities between databases.

### Q20. When should a team avoid polyglot persistence?

When one database handles the workload adequately and additional databases would introduce more operational complexity than measurable benefit.

---

# 14. Practical Exercises

## Exercise 1: Database Selection

Choose an appropriate database for each requirement.

| Requirement                                     | Your Choice |
| ----------------------------------------------- | ----------- |
| Store customer and payment records              | ?           |
| Store user sessions                             | ?           |
| Store flexible product specifications           | ?           |
| Search products by relevance                    | ?           |
| Analyze five years of sales                     | ?           |
| Store server CPU metrics                        | ?           |
| Store large distributed user activity histories | ?           |

Suggested choices:

- PostgreSQL / MySQL.
- Redis.
- MongoDB.
- Elasticsearch / OpenSearch.
- Analytical database.
- Time-series database.
- Cassandra or another suitable wide-column system.

The purpose is to connect workload requirements with data models.

## Exercise 2: Identify the Source of Truth

Consider:

```text
PostgreSQL -> Orders
Elasticsearch -> Search Index
Data Warehouse -> Sales Reports
Redis -> Order Cache
```

Answer:

1. Which system owns the authoritative order status?
2. What happens if Redis contains an old order status?
3. What happens if Elasticsearch is unavailable?
4. Should the data warehouse directly update the order status?
5. How should the search index recover after missing updates?

## Exercise 3: Design a Polyglot E-Commerce Architecture

Design a database architecture for:

- Customers.
- Products.
- Orders.
- Payments.
- Shopping carts.
- Product search.
- Sales reports.
- Application metrics.

For each database, define:

1. Responsibility.
2. Data ownership.
3. Read/write patterns.
4. Consistency requirements.
5. Failure behavior.
6. Synchronization mechanism.

## Exercise 4: Challenge Your Architecture

Suppose you propose:

```text
PostgreSQL
Redis
MongoDB
Elasticsearch
Cassandra
InfluxDB
Data Warehouse
```

Now answer:

1. Why does the application need seven databases?
2. What bottleneck does each database solve?
3. Which databases store authoritative data?
4. Which databases store derived data?
5. How are changes synchronized?
6. What happens if one database is unavailable?
7. Who operates and monitors each system?
8. What is the additional infrastructure cost?

If you cannot justify a database, remove it from the architecture.

---

# 15. Final Summary

## 15.1 What Is Polyglot Persistence?

Using multiple database technologies within one application or organization, selecting each database based on its workload and data requirements.

## 15.2 Why Use It?

- Different data models.
- Different access patterns.
- Different performance requirements.
- Different scaling requirements.
- Different consistency requirements.
- Workload isolation.

## 15.3 Advantages

1. Workload specialization.
2. Independent scaling.
3. Technology flexibility.
4. Workload isolation.
5. Access to specialized database capabilities.

## 15.4 Disadvantages

1. Multiple databases to operate.
2. Data synchronization.
3. Eventual consistency.
4. Cross-database workflow complexity.
5. Higher infrastructure cost.
6. More failure scenarios.
7. Broader engineering expertise required.

## 15.5 Most Important Concepts

| Concept                 | Meaning                                           |
| ----------------------- | ------------------------------------------------- |
| Polyglot persistence    | Multiple database technologies in one system      |
| Database specialization | Selecting a database for a specific workload      |
| System of record        | Authoritative data source                         |
| Derived data            | Data generated from an authoritative source       |
| Data synchronization    | Propagating changes between systems               |
| Eventual consistency    | Updates become visible across systems over time   |
| Workload isolation      | Separating workloads to avoid resource contention |

## 15.6 The Most Important Mental Model

Do not choose databases based on popularity or technology trends.

Choose them based on:

1. What data are you storing?
2. How will the application access that data?
3. What consistency guarantees are required?
4. How much data and traffic will the workload generate?
5. What are the operational costs?
6. Does specialization provide a measurable advantage?

**Start with the simplest architecture that meets the requirements. Introduce additional databases only when a specific workload justifies them.**
