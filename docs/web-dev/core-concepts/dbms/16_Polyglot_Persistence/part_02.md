---
sidebar_label: Database Selection
sidebar_position: 1
---

# Database Selection

## 1. Introduction: Choosing the Right Database

Database selection is an architectural decision. It affects application performance, scalability, consistency, reliability, development speed, operational complexity, and infrastructure cost.

A common mistake is choosing a database because it is popular:

- "MongoDB is popular, so let's use MongoDB."
- "PostgreSQL is powerful, so it must be the best choice."
- "Cassandra supports horizontal scaling, so it will handle our traffic better."
- "Redis is fast, so let's store everything in Redis."

These are weak selection criteria. A database should be selected based on the application's actual requirements and workload.

Consider an e-commerce application:

- User accounts and orders need reliable transactions.
- Product search needs text indexing and relevance ranking.
- Shopping carts need fast key-based access.
- Analytics needs aggregation over large historical datasets.
- Application metrics need time-based ingestion and queries.

One database might handle all these requirements adequately at an early stage. At a larger scale, specialized databases may become useful.

The objective is not to use as many databases as possible. It is to choose the simplest architecture that satisfies the requirements.

**Core principle:**

> Choose a database based on how your application stores, reads, updates, and processes data—not based on the database's popularity.

---

## 2. Start With Requirements, Not Database Brands

Before comparing PostgreSQL, MongoDB, Redis, Cassandra, or any other database, identify what the application actually needs.

There are several important dimensions.

### 2.1 Data Shape and Data Model

First, understand the structure of the data.

Ask:

- Is the data highly structured?
- Does it contain relationships between multiple entities?
- Is the structure flexible or frequently changing?
- Is the data naturally represented as documents?
- Does the application primarily retrieve values using keys?
- Does it contain complex relationships between entities?

Example: An e-commerce application.

**Relational data:**

```text
Users
  user_id
  name
  email

Orders
  order_id
  user_id
  total_amount

OrderItems
  order_item_id
  order_id
  product_id
  quantity
```

Users, orders, and order items have explicit relationships.

A relational database such as PostgreSQL or MySQL is a natural fit.

**Document-oriented data:**

```json
{
  "_id": "product_101",
  "name": "Gaming Laptop",
  "category": "Electronics",
  "specifications": {
    "ram": "16GB",
    "storage": "1TB SSD",
    "processor": "Intel i7"
  },
  "images": ["front.jpg", "side.jpg"]
}
```

This data can naturally be represented as a document in MongoDB.

However, don't assume that structured data must use SQL or that nested data must use MongoDB. PostgreSQL also supports JSONB, and MongoDB can model relationships.

The correct choice depends on the complete workload.

### 2.2 Read and Write Patterns

Understand how frequently the application reads and writes data.

Example:

| Application        | Typical workload                            |
| ------------------ | ------------------------------------------- |
| Social media feed  | Frequent reads, writes, and feed generation |
| Payment system     | Transactional writes and reliable reads     |
| Analytics platform | Large scans and aggregations                |
| Logging system     | Continuous high-volume writes               |
| Shopping cart      | Frequent key-based reads and updates        |
| Search application | Text searches and relevance ranking         |

Important questions:

1. How many reads occur per second?
2. How many writes occur per second?
3. Is the workload read-heavy or write-heavy?
4. Are writes evenly distributed or concentrated on a few records?
5. Are there predictable traffic spikes?
6. Does the application require real-time responses?

Consider two applications.

**Application A: Blog platform**

- 90% reads.
- 10% writes.
- Articles are read frequently.
- Publishing happens relatively infrequently.

**Application B: IoT monitoring platform**

- Millions of sensor readings are continuously inserted.
- Data is queried by device and time range.
- Historical data is periodically aggregated.

These workloads have different database requirements.

### 2.3 Query Complexity

Understand the queries the application needs to execute.

| Query requirement      | Relevant database capability                       |
| ---------------------- | -------------------------------------------------- |
| Simple key lookup      | Key-value database                                 |
| Complex joins          | Relational database                                |
| Transactional updates  | Transaction-capable database                       |
| Full-text search       | Search engine or suitable database search features |
| Relationship traversal | Graph database                                     |
| Time-range aggregation | Time-series or analytical database                 |
| Large analytical scans | Data warehouse or OLAP database                    |

Example:

```sql
SELECT
    u.name,
    o.order_id,
    o.total_amount
FROM users u
JOIN orders o
    ON u.user_id = o.user_id
WHERE o.total_amount > 5000;
```

This query uses relationships and filtering across multiple tables.

A relational database handles this naturally.

Now consider a search requirement:

```text
Find products matching:
"wireless noise cancelling headphones"
```

The application may need:

- Tokenization.
- Stemming.
- Fuzzy matching.
- Relevance scoring.
- Filtering.
- Ranking.

A dedicated search engine such as Elasticsearch or OpenSearch may be more suitable when these requirements exceed what the primary database's search capabilities can efficiently provide.

### 2.4 Consistency Requirements

Not every application requires the same consistency guarantees.

Consider a payment system.

A payment of ₹5,000 must not accidentally be deducted twice because of a retry or concurrent request.

Important requirements include:

- Atomic updates.
- Transaction boundaries.
- Isolation.
- Durable commits.
- Idempotency.
- Correct handling of concurrent operations.

A relational database with appropriate transaction support is a natural candidate.

Now consider a product recommendation counter.

If the displayed number of recommendations is temporarily stale, the business may tolerate it.

That workload may allow asynchronous updates and eventual consistency.

**Important:** Do not weaken consistency simply because a database is capable of doing so. Consistency requirements come from business correctness.

### 2.5 Scalability Requirements

Estimate the expected workload.

Consider:

| Dimension    | Questions                                             |
| ------------ | ----------------------------------------------------- |
| Data volume  | How much data will be stored?                         |
| Throughput   | How many reads and writes per second?                 |
| Concurrency  | How many simultaneous operations?                     |
| Latency      | What response time is acceptable?                     |
| Growth       | How quickly will data and traffic increase?           |
| Distribution | Are users located across multiple regions?            |
| Hotspots     | Will a small number of records receive most requests? |

A small application with 5,000 users and a large application with 50 million active users do not necessarily need the same architecture.

But don't prematurely introduce sharding or distributed databases.

A properly designed PostgreSQL or MongoDB deployment can handle substantial workloads.

Scale based on measured bottlenecks.

### 2.6 Availability and Durability

These are different requirements.

**Availability:** Can the application continue serving requests when infrastructure components fail?

**Durability:** Once a successful write is acknowledged, how reliably is that data preserved?

Ask:

- Can the application tolerate temporary database downtime?
- Is automatic failover required?
- Is multi-region availability necessary?
- How much committed data loss is acceptable?
- How quickly must the application recover?

Two useful metrics:

**RPO — Recovery Point Objective**

The maximum acceptable amount of data loss, usually expressed as time.

Example:

```text
RPO = 5 minutes
```

The recovery process must limit data loss to approximately the last five minutes of changes.

**RTO — Recovery Time Objective**

The maximum acceptable recovery time.

Example:

```text
RTO = 30 minutes
```

The application should recover within 30 minutes of the failure.

Backups, replication, failover, and recovery procedures must be designed around these objectives.

### 2.7 Operational and Team Requirements

A database can be technically suitable but operationally inappropriate.

Consider:

- Does the team understand its internals?
- Is the team able to monitor and troubleshoot it?
- Are managed services available?
- How difficult are upgrades?
- How will backups and restores work?
- Is there sufficient budget?
- Does the organization have expertise in distributed systems?

For example, operating a distributed Cassandra cluster requires different operational knowledge from operating a managed PostgreSQL instance.

The cost of running a database includes more than its infrastructure bill.

---

## 3. Classify the Application Workload

Before choosing a database, classify the workload.

A single application can contain multiple workload types.

### 3.1 OLTP Workload

OLTP means Online Transaction Processing.

Characteristics:

- Frequent small transactions.
- Many concurrent users.
- Inserts, updates, and deletes.
- Short-running queries.
- Transactional correctness.

Examples:

- User registration.
- Order creation.
- Payment processing.
- Inventory updates.
- Account management.

Typical candidates:

- PostgreSQL.
- MySQL.
- Distributed SQL databases when distributed transactional requirements justify them.

### 3.2 OLAP Workload

OLAP means Online Analytical Processing.

Characteristics:

- Large data scans.
- Complex aggregations.
- Historical analysis.
- Reporting.
- Analytical queries.

Example:

```sql
SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(total_amount) AS revenue
FROM orders
GROUP BY month
ORDER BY month;
```

This query analyzes revenue across a large collection of orders.

Typical candidates:

- ClickHouse.
- BigQuery.
- Snowflake.
- Amazon Redshift.
- Other analytical databases and data warehouses.

### 3.3 Search Workload

Characteristics:

- Full-text queries.
- Fuzzy matching.
- Relevance ranking.
- Faceted search.
- Autocomplete.

Typical candidates:

- Elasticsearch.
- OpenSearch.
- PostgreSQL full-text search for simpler requirements.

### 3.4 Key-Value Workload

Characteristics:

- Access data using a key.
- Low-latency lookups.
- Simple updates.
- Cache and session operations.

Example:

```text
Key: session:user_101

Value:
{
    "userId": "user_101",
    "role": "admin"
}
```

Typical candidates:

- Redis.
- DynamoDB.
- Other key-value or key-oriented databases.

### 3.5 Document Workload

Characteristics:

- Nested data.
- Flexible document structure.
- Data often retrieved as a complete aggregate.
- Different document types may have different fields.

Typical candidates:

- MongoDB.
- Couchbase.
- PostgreSQL JSONB for workloads where a relational database remains appropriate.

### 3.6 Graph Workload

Characteristics:

- Complex relationships.
- Multi-hop traversal.
- Relationship-centric queries.
- Connected data.

Example:

```text
User A
  -> follows User B
  -> follows User C
  -> shares interests with User D
```

Typical candidate:

- Neo4j.

### 3.7 Time-Series Workload

Characteristics:

- Timestamped data.
- Continuous ingestion.
- Time-range queries.
- Retention policies.
- Downsampling and rollups.

Examples:

- Server metrics.
- CPU utilization.
- Sensor readings.
- Application latency.
- Device telemetry.

Typical candidates:

- TimescaleDB.
- InfluxDB.
- Other time-series platforms.

### 3.8 Mixed Workloads

Most real applications are not limited to one category.

An e-commerce platform may have:

| Feature             | Workload    |
| ------------------- | ----------- |
| User accounts       | OLTP        |
| Orders              | OLTP        |
| Product search      | Search      |
| Shopping cart       | Key-value   |
| Sales reporting     | OLAP        |
| Application metrics | Time-series |

This is why database selection must happen at the workload or application-component level, not only at the overall application level.

---

## 4. Database Selection Based on Data Model

Different databases are optimized around different data representations.

### 4.1 Relational Database

Examples:

- PostgreSQL.
- MySQL.
- Microsoft SQL Server.

Best suited for:

- Structured data.
- Relationships.
- Joins.
- Constraints.
- Transactions.
- Complex queries.

Example:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Why choose it?

- Relationships are explicit.
- Referential integrity can be enforced.
- Transactions support business operations.
- SQL provides powerful querying capabilities.

Do not assume relational databases cannot scale. They can use vertical scaling, replication, partitioning, sharding, and distributed SQL architectures.

### 4.2 Document Database

Examples:

- MongoDB.
- Couchbase.

Best suited for:

- Nested documents.
- Flexible schemas.
- Aggregate-oriented data.
- Applications where records have variable structures.

Example:

```json
{
  "_id": "order_101",
  "userId": "user_10",
  "items": [
    {
      "productId": "p101",
      "quantity": 2,
      "price": 500
    },
    {
      "productId": "p102",
      "quantity": 1,
      "price": 300
    }
  ],
  "totalAmount": 1300,
  "status": "confirmed"
}
```

Why choose it?

- Nested data can be stored naturally.
- Related data can be retrieved together.
- Flexible document structures can simplify certain application models.

Important limitations to consider:

- Duplicated data can create update complexity.
- Cross-document relationships may require additional queries or aggregation.
- Index design remains critical.
- Multi-document transactions are available in MongoDB, but their use and performance should be evaluated against the workload.

### 4.3 Key-Value Database

Examples:

- Redis.
- Amazon DynamoDB in key-oriented usage.

Best suited for:

- Session storage.
- Caching.
- Shopping carts.
- Rate limiting.
- Frequently accessed state.

Example:

```text
cart:user_101
```

Value:

```json
{
  "items": [
    {
      "productId": "p101",
      "quantity": 2
    }
  ]
}
```

Why choose it?

- Simple access patterns.
- Fast key-based operations.
- Useful for high-throughput workloads.

But consider persistence, durability, memory cost, eviction policy, and recovery requirements before treating a key-value store as the authoritative data store.

### 4.4 Wide-Column Database

Examples:

- Apache Cassandra.
- ScyllaDB.

Best suited for:

- High-volume distributed writes.
- Large datasets.
- Predictable query patterns.
- Horizontal scaling across nodes.

Example:

```text
device_id | date       | timestamp           | temperature
-----------------------------------------------------------
D101      | 2026-11-14 | 10:00:00             | 31
D101      | 2026-11-14 | 10:01:00             | 32
D101      | 2026-11-14 | 10:02:00             | 31
```

The schema and partition key should be designed around the queries the application needs.

Do not choose Cassandra simply because the system may eventually have millions of users. It introduces query-modeling and operational constraints.

### 4.5 Graph Database

Example:

- Neo4j.

Best suited for:

- Relationship-heavy data.
- Multi-hop traversals.
- Recommendations.
- Fraud relationship analysis.
- Dependency graphs.

Example:

```text
User A
  -> PURCHASED -> Product X
  -> FOLLOWS -> User B
  -> SHARES_INTEREST -> Category C
```

Choose a graph database when traversing relationships is central to the workload.

A graph database is not automatically better merely because relational data contains foreign keys.

### 4.6 Search Database

Examples:

- Elasticsearch.
- OpenSearch.

Best suited for:

- Full-text search.
- Fuzzy matching.
- Relevance scoring.
- Filtering and faceting.
- Search suggestions.

Important architectural distinction:

A search engine is generally not the authoritative system of record for business transactions.

For example:

```text
PostgreSQL
    |
    | Product data
    v
Elasticsearch
    |
    v
Product search
```

PostgreSQL remains authoritative. Elasticsearch maintains a searchable representation of product data.

### 4.7 Time-Series Database

Examples:

- InfluxDB.
- TimescaleDB.

Best suited for:

- Timestamped records.
- Continuous metric ingestion.
- Time-window queries.
- Retention.
- Aggregation over time.

Example:

```text
timestamp           | server_id | cpu_usage
--------------------------------------------
10:00:00            | server_1  | 45
10:01:00            | server_1  | 52
10:02:00            | server_1  | 61
```

For modest time-series workloads, PostgreSQL can be sufficient. A specialized time-series database becomes useful when its ingestion, compression, retention, or query features solve a measurable problem.

---

## 5. Database Selection Based on Access Patterns

Data model alone is not enough.

Two applications can store similar data but need different databases because they access that data differently.

### 5.1 Key-Based Lookup

Requirement:

```text
Get user by userId
```

Example:

```javascript
const user = await redis.get("user:101");
```

A key-value database is suitable when the application primarily retrieves values using known keys.

A relational or document database can also support indexed key lookups.

### 5.2 Range Queries

Requirement:

```text
Find all orders created between two dates.
```

Example:

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-11-01'
  AND created_at < '2026-12-01';
```

A relational database with a suitable index is a natural choice.

A time-series database may be more suitable if this is a large-scale time-indexed workload involving continuous ingestion and time-based aggregation.

### 5.3 Relationship Queries and Joins

Requirement:

```text
Find all customers who purchased products
from a particular category.
```

This involves multiple related entities.

A relational database is a natural candidate.

If the queries require deep relationship traversal across many hops, a graph database may be worth evaluating.

### 5.4 Full-Text Search

Requirement:

```text
Search:
"wireless headphones with noise cancellation"
```

Potential requirements:

- Match related terms.
- Handle spelling mistakes.
- Rank results.
- Filter by price and category.
- Provide autocomplete.

A search engine may be appropriate.

For simpler search requirements, PostgreSQL full-text search and trigram indexes may be enough.

Do not introduce Elasticsearch before understanding whether the primary database already meets the requirement.

### 5.5 Time-Window Queries

Requirement:

```text
Show average CPU utilization
for every five-minute interval.
```

Example:

```sql
SELECT
    date_trunc('hour', recorded_at) AS hour,
    AVG(cpu_usage) AS average_cpu
FROM server_metrics
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

A relational database can handle this.

At very high ingestion rates and with extensive time-based retention and aggregation, a time-series database may offer more suitable capabilities.

### 5.6 Write-Heavy Ingestion

Requirement:

```text
Insert millions of sensor events continuously.
```

Evaluate:

- Sustained write throughput.
- Batch ingestion.
- Partitioning.
- Write amplification.
- Storage efficiency.
- Retention.
- Replication overhead.
- Query patterns during ingestion.

Possible candidates include wide-column databases, time-series databases, and appropriately designed relational systems.

The correct answer depends on the complete workload.

### 5.7 Query-Driven Data Modeling

A critical principle in database design:

> Design the data model around the application's important access patterns.

For example, a Cassandra table should be designed around the queries it needs to serve.

A relational schema often starts from entities, relationships, constraints, and normalization, then uses indexes and query optimization to support access patterns.

A document schema often considers aggregate boundaries and whether data is commonly read and updated together.

The modeling strategy differs, but all database systems require workload-aware design.

---

## 6. Database Selection Based on Consistency Requirements

Consistency is one of the most important selection dimensions.

A database must support the correctness guarantees required by the business.

### 6.1 Identify Transaction Boundaries

Consider a payment operation:

```text
1. Create payment record.
2. Update order status.
3. Record payment reference.
4. Update account or ledger state.
```

These operations may need to behave as one logical transaction.

If only some operations succeed, the application can enter an inconsistent state.

A relational database with ACID transactions is often suitable for such workflows.

However, the complete architecture matters. A database transaction cannot automatically make an external payment gateway call atomic with a local database update.

For cross-system workflows, patterns such as the transactional outbox and saga may be required.

### 6.2 Single-Record vs Multi-Record Transactions

Ask whether the application needs:

- Atomic updates to a single record.
- Transactions involving multiple records.
- Transactions across multiple tables or collections.
- Transactions spanning multiple partitions.
- Transactions spanning multiple database systems.

The complexity and performance cost can increase as the transaction boundary expands.

Example:

**Single-document operation:**

```javascript
await users.updateOne({ _id: userId }, { $set: { name: "Prashant" } });
```

**Multi-document transaction:**

```javascript
const session = await mongoose.startSession();

try {
  await session.withTransaction(async () => {
    await orders.updateOne(
      { _id: orderId },
      { $set: { status: "paid" } },
      { session },
    );

    await payments.insertOne(
      {
        orderId,
        amount: 5000,
        status: "success",
      },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```

MongoDB supports multi-document transactions. The decision is not simply SQL versus NoSQL.

The real question is whether the database provides the required transaction semantics at an acceptable cost.

### 6.3 Strong Consistency vs Eventual Consistency

**Strong consistency** generally means a read observes the latest successfully committed write according to the system's consistency guarantees.

**Eventual consistency** means replicas or derived copies may temporarily disagree but are expected to converge if updates stop and propagation succeeds.

Example:

A user changes their account email.

The application may require the new email to be visible immediately in subsequent relevant reads.

Now consider a product recommendation count.

A small delay before the updated count appears may be acceptable.

The consistency requirement should be determined by business impact.

| Data                         | Typical consistency requirement          |
| ---------------------------- | ---------------------------------------- |
| Payment state                | Strong correctness guarantees            |
| Account balance              | Strong correctness guarantees            |
| Inventory reservation        | Strong correctness guarantees            |
| Product recommendation count | Eventual consistency may be acceptable   |
| Search index                 | Eventual consistency is often acceptable |
| Analytics dashboard          | Delayed consistency is often acceptable  |

These are typical requirements, not universal rules. The actual business semantics determine the answer.

### 6.4 Read-Your-Writes Consistency

Suppose a user updates their profile:

```text
User updates name:
Old name -> New name
```

Immediately after the update, the application fetches the profile.

If that read goes to a lagging replica, the user may see the old name.

This is a read-after-write consistency problem.

Possible solutions:

- Read from the primary for the relevant request.
- Use a database consistency mode that provides the required guarantee.
- Route reads to a replica only after it has caught up.
- Maintain session-level consistency where supported.

Do not assume that replication automatically gives immediate consistency.

### 6.5 Idempotency and Retry Safety

Distributed systems experience timeouts and retries.

Example:

```text
Client sends payment request.
Server processes payment.
Network response is lost.
Client retries the request.
```

Without idempotency, the application might process the payment twice.

A database alone does not solve every retry problem. The application must define idempotent operations, unique request identifiers, constraints, and appropriate transaction boundaries.

Example:

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL
);
```

The unique constraint prevents duplicate payment records for the same idempotency key.

### 6.6 Practical Consistency Decision

Before choosing a database, answer:

1. Which operations must be atomic?
2. Which records must be updated together?
3. Can stale reads be tolerated?
4. Can data propagation be asynchronous?
5. What happens when a request is retried?
6. Can the system tolerate temporary replica lag?
7. Is cross-partition transactional consistency required?

Do not choose a database only because it advertises strong consistency. Verify the exact guarantees, transaction boundaries, failure behavior, and configuration.

---

## 7. Database Selection Based on Scalability Requirements

Scalability is not a single feature.

It includes storage growth, throughput, concurrency, latency, geographic distribution, and the ability to handle failures.

### 7.1 Start With Vertical Scaling

Vertical scaling means increasing the resources of an existing database server.

Examples:

- More CPU.
- More RAM.
- Faster storage.
- Higher IOPS.
- Better network capacity.

```text
Before:

Database
  4 CPU
  16 GB RAM

After:

Database
  16 CPU
  64 GB RAM
```

Advantages:

- Relatively simple.
- Fewer distributed-system complications.
- Existing database architecture can remain unchanged.

Limitations:

- Hardware has practical limits.
- Larger instances can be expensive.
- A single primary can remain a bottleneck.
- It does not automatically solve availability requirements.

For many applications, vertical scaling is the correct first step.

### 7.2 Read Replicas

Read replicas allow read workloads to be distributed across multiple database instances.

```text
          Application
               |
       +-------+-------+
       |               |
     Primary        Read Router
       |               |
       |          +----+----+
       |          |         |
       v          v         v
     Writes     Replica 1  Replica 2
```

Useful when:

- The application is read-heavy.
- Primary CPU is consumed by read queries.
- Replica lag is acceptable for some operations.

Limitations:

- Replication lag.
- Additional infrastructure cost.
- More complicated read routing.
- Writes still generally go to the primary in common primary-replica designs.

Read replicas do not automatically make a system strongly consistent.

### 7.3 Partitioning

Partitioning divides a large table or dataset into smaller logical pieces.

Example:

```text
orders_2026_01
orders_2026_02
orders_2026_03
```

Partitioning can improve data management and query performance when queries align with partition boundaries.

It is not identical to sharding.

A partitioned table may still reside on one database server.

### 7.4 Sharding

Sharding distributes data across multiple database servers.

```text
Application
    |
    v
Shard Router
    |
    +----------------+
    |                |
    v                v
Shard 1           Shard 2
Users A-M         Users N-Z
```

Useful when:

- A single database server cannot handle the workload.
- Storage requirements exceed a single node's practical capacity.
- Horizontal write capacity is required.
- Data distribution can be designed effectively.

Challenges:

- Choosing shard keys.
- Hot partitions.
- Cross-shard queries.
- Distributed transactions.
- Rebalancing.
- Operational complexity.

Sharding is not automatically faster. A poorly selected shard key can create hotspots and uneven resource usage.

### 7.5 Distributed SQL

Examples:

- Google Spanner.
- CockroachDB.
- TiDB.
- YugabyteDB.

Distributed SQL databases aim to provide relational database capabilities across multiple nodes.

They can be useful when an application needs:

- Distributed storage.
- Horizontal scaling.
- SQL querying.
- Transactional guarantees across distributed data.
- High availability.

But they introduce network coordination, consensus overhead, and operational complexity.

They are not automatic replacements for a well-performing single-node PostgreSQL or MySQL deployment.

### 7.6 Geographic Distribution

If users are located across different countries, network latency becomes important.

Questions:

- Does the application need low-latency reads in multiple regions?
- Can writes be routed to one primary region?
- Must users write locally in multiple regions?
- What happens during a network partition?
- Are there data residency requirements?

A multi-region distributed database may help, but strong consistency across distant regions can require coordination over the network.

That coordination has latency costs.

**Important:** Horizontal scaling does not guarantee lower latency. Distributed systems can increase latency for operations that require communication between nodes.

---

## 8. Availability, Durability, and Recovery Requirements

Database selection must account for failures, not just normal operation.

### 8.1 Replication Is Not Backup

Replication maintains additional copies of data.

If a record is accidentally deleted and the deletion replicates, the replicas may also lose that record.

A backup provides a separate recovery mechanism.

A reliable database strategy may need:

- Replication.
- Automated backups.
- Point-in-time recovery.
- Restore testing.
- Monitoring.
- Disaster recovery procedures.

### 8.2 Single Availability Zone vs Multi-AZ

A deployment in one availability zone may be affected by a zone-level outage.

A multi-AZ deployment can place database replicas across separate availability zones.

```text
Region
  |
  +-------------------+
  |                   |
  v                   v
Availability Zone A   Availability Zone B
  |                   |
  v                   v
Primary Database      Standby Replica
```

The exact failover behavior depends on the database and deployment configuration.

### 8.3 Multi-Region Architecture

A multi-region design can improve geographic resilience.

However, it adds complexity:

- Replication latency.
- Conflict handling.
- Network failures.
- Region failover.
- Data residency.
- Cross-region transaction coordination.

Use it when the availability and geographic requirements justify the cost.

### 8.4 Managed vs Self-Hosted Databases

**Managed database:**

A cloud provider handles some infrastructure and operational responsibilities.

Examples include:

- Amazon RDS.
- Amazon Aurora.
- Azure Database for PostgreSQL.
- MongoDB Atlas.
- Google Cloud SQL.

Advantages:

- Easier provisioning.
- Managed backups and maintenance features.
- Monitoring integrations.
- Managed failover options, depending on the service.

Limitations:

- Service costs.
- Provider-specific limitations.
- Less infrastructure-level control.
- Potential vendor lock-in.

**Self-hosted database:**

The team manages the database on its own infrastructure.

Advantages:

- More control.
- Flexible deployment.
- Potentially useful for specialized environments.

Limitations:

- Backups.
- Upgrades.
- Security.
- Monitoring.
- Replication.
- Failover.
- Capacity management.

Self-hosting does not make the database free. It transfers operational responsibility to the team.

---

## 9. Operational Complexity and Cost

Database selection must include total cost of ownership (TCO).

TCO includes more than the monthly server bill.

### 9.1 Infrastructure Cost

Consider:

- CPU.
- RAM.
- Storage.
- IOPS.
- Network transfer.
- Replicas.
- Backups.
- Cross-region traffic.
- Managed-service fees.

Example:

A database may have a low base instance price but become expensive when additional replicas, storage, and network transfer are included.

### 9.2 Operational Cost

Consider the engineering effort required for:

- Initial deployment.
- Monitoring.
- Troubleshooting.
- Upgrades.
- Backups.
- Recovery.
- Security patches.
- Performance tuning.
- Capacity planning.
- Migration.

A database that saves ₹5,000 per month but requires significant additional engineering effort may be more expensive overall.

### 9.3 Team Expertise

Suppose a team is experienced with PostgreSQL but has limited experience with Cassandra.

Even if Cassandra can technically support a particular workload, the team must account for:

- Learning time.
- Operational training.
- Troubleshooting capability.
- Hiring requirements.
- Production failure risk.

Team expertise is a legitimate architectural constraint.

It should not permanently prevent learning new technologies, but the cost must be acknowledged.

### 9.4 Vendor Lock-In

Some databases and managed services have provider-specific APIs, query languages, operational tooling, and data formats.

Ask:

- How difficult is data export?
- Can the application migrate to another provider?
- Are important features proprietary?
- Does the application depend heavily on vendor-specific functionality?

Avoid treating portability as free. A theoretically portable application may still require substantial migration work.

### 9.5 Total Cost of Ownership

A practical model:

```text
Total Cost of Ownership =
    Infrastructure Cost
  + Storage Cost
  + Network Cost
  + Backup Cost
  + Licensing Cost
  + Engineering Operations Cost
  + Migration Cost
  + Downtime Risk
```

This is a conceptual model, not a literal billing formula.

The correct database is one that meets the workload requirements at an acceptable total cost and operational risk.

---

## 10. Practical Database Selection Matrix

The following table provides a starting point, not rigid rules.

| Database                                  | Strong fit                                                    | Main tradeoffs                                                                           |
| ----------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| PostgreSQL                                | Relational data, transactions, joins, complex queries, JSONB  | Requires query and index tuning; distributed scaling needs additional design             |
| MySQL                                     | Relational OLTP, web applications, transactions               | Feature and query behavior differ from PostgreSQL; scaling architecture still matters    |
| MongoDB                                   | Document-oriented data, nested structures, flexible schema    | Data duplication, document boundaries, and cross-document access require careful design  |
| Redis                                     | Cache, sessions, key-value operations, low-latency state      | Memory cost, eviction, persistence and durability configuration                          |
| Cassandra                                 | High-volume distributed writes and predictable query patterns | Query-driven modeling, limited ad hoc querying, operational complexity                   |
| Elasticsearch / OpenSearch                | Full-text search, relevance, filtering, faceting              | Search index is usually derived data; indexing and synchronization complexity            |
| Neo4j                                     | Relationship traversal and graph queries                      | Specialized data model; not a general replacement for relational databases               |
| TimescaleDB / InfluxDB                    | Time-series ingestion, time-window queries, retention         | Specialized workload; additional technology may not be justified for modest data volumes |
| ClickHouse                                | Large analytical scans and aggregations                       | Not a general transactional OLTP replacement                                             |
| BigQuery / Snowflake / Redshift           | Data warehousing and analytics                                | Analytical workloads and cost models differ from transactional databases                 |
| CockroachDB / Spanner / TiDB / YugabyteDB | Distributed SQL and transactional workloads across nodes      | Coordination overhead, cost, and operational complexity                                  |

### 10.1 Quick Selection Guide

| Requirement                         | First candidates to evaluate              |
| ----------------------------------- | ----------------------------------------- |
| Relational transactions and joins   | PostgreSQL / MySQL                        |
| Flexible document storage           | MongoDB                                   |
| Cache and sessions                  | Redis                                     |
| High-volume distributed writes      | Cassandra / ScyllaDB                      |
| Full-text search                    | Elasticsearch / OpenSearch                |
| Deep relationship traversal         | Neo4j                                     |
| Time-series ingestion and retention | TimescaleDB / InfluxDB                    |
| Large analytical workloads          | ClickHouse / BigQuery / Snowflake         |
| Distributed relational transactions | Spanner / CockroachDB / TiDB / YugabyteDB |

Do not interpret this as an exclusive mapping. Several databases can satisfy the same requirement. Benchmark and validate the shortlisted options.

---

## 11. Step-by-Step Database Selection Framework

Use the following framework when designing a backend system.

### Step 1: Understand Business Requirements

Identify the important business operations.

Example:

```text
E-commerce:
- Register users
- Browse products
- Search products
- Add items to cart
- Place orders
- Process payments
- Track shipments
- Generate sales reports
```

Do not start by selecting a database.

Start by understanding what the application must do.

### Step 2: Classify Workloads

Map each operation to its workload.

| Operation             | Workload                   |
| --------------------- | -------------------------- |
| Register user         | OLTP                       |
| Place order           | OLTP                       |
| Search products       | Search                     |
| Add to cart           | Key-value or transactional |
| Generate sales report | OLAP                       |
| Track server metrics  | Time-series                |

### Step 3: Identify the Data Model

Determine whether the data is primarily:

- Relational.
- Document-oriented.
- Key-value.
- Wide-column.
- Graph-oriented.
- Time-series.
- Analytical.

Also identify which data belongs together and which relationships require enforcement.

### Step 4: Identify Access Patterns

Write down the actual queries.

Example:

```text
1. Get user by ID.
2. Get order by order ID.
3. Get all orders for a user.
4. Search products by name.
5. Filter products by category and price.
6. Get monthly revenue.
```

This makes the database requirements concrete.

### Step 5: Define Consistency and Transaction Guarantees

For each important operation, define:

- Transaction boundary.
- Required atomicity.
- Acceptable staleness.
- Read-after-write behavior.
- Retry and idempotency requirements.

Example:

```text
Payment:
- Must not be duplicated.
- Must be associated with the correct order.
- Must survive a successful commit.
- Must handle retries safely.
```

### Step 6: Quantify Scalability and Latency

Estimate:

```text
Active users:
Requests per second:
Read/write ratio:
Peak concurrency:
Data growth per month:
Average record size:
Maximum acceptable latency:
Retention period:
```

Avoid vague statements such as "we need millions of users."

Millions of registered users do not tell you the database's actual workload.

### Step 7: Define Availability and Recovery

Determine:

```text
Availability target:
RPO:
RTO:
Backup frequency:
Recovery process:
Required failure tolerance:
```

Verify that the proposed deployment can meet these objectives.

### Step 8: Evaluate Operations and Cost

Compare:

- Managed versus self-hosted deployment.
- Team expertise.
- Monitoring requirements.
- Backup and restore complexity.
- Licensing.
- Infrastructure cost.
- Migration risk.

### Step 9: Shortlist Candidates

Select two or three plausible candidates.

For example:

```text
Requirement:
Transactional e-commerce backend.

Candidates:
1. PostgreSQL
2. MySQL
3. Distributed SQL database
```

Don't compare every database in existence. Compare the realistic candidates that satisfy the requirements.

### Step 10: Benchmark Representative Workloads

Build a realistic test.

Include:

- Representative data volume.
- Realistic data distribution.
- Expected indexes.
- Read and write operations.
- Concurrent requests.
- Peak traffic.
- Large and small queries.
- Failure scenarios.

Measure:

- Throughput.
- p50 latency.
- p95 latency.
- p99 latency.
- CPU usage.
- Memory usage.
- Storage consumption.
- Replication lag.
- Error rate.

A single query executed repeatedly against a tiny dataset is not a meaningful production benchmark.

### Step 11: Test Failure and Recovery

Simulate:

- Database node failure.
- Network interruption.
- Replica lag.
- Disk capacity exhaustion.
- Failed deployment.
- Accidental data deletion.
- Backup restoration.

A database that performs well during normal operation may still be unsuitable if its recovery behavior fails business requirements.

### Step 12: Document the Decision

Write a short Architecture Decision Record (ADR).

Example:

```text
Decision:
Use PostgreSQL as the primary transactional database.

Context:
The application requires relational data,
multi-table transactions, constraints,
and complex queries.

Alternatives:
- MongoDB
- MySQL
- Distributed SQL

Reasons:
- Strong fit for relational workload.
- Existing team expertise.
- Mature transaction and indexing features.
- Operationally manageable deployment.

Tradeoffs:
- Requires query and index optimization.
- Read replicas may introduce replication lag.
- Horizontal write scaling may require additional architecture.

Revisit when:
- Measured workload exceeds practical capacity.
- Geographic requirements change.
- A specialized workload becomes a bottleneck.
```

This prevents database selection from becoming an undocumented personal preference.

---

## 12. Real-World Backend Examples

### 12.1 E-Commerce Application

Requirements:

- Users.
- Products.
- Orders.
- Payments.
- Cart.
- Product search.
- Sales analytics.

Possible architecture:

```text
                  Backend API
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      PostgreSQL    Redis     Search Engine
          |           |           |
          |           |           |
       Users        Cart       Product Search
       Orders       Cache      Search Index
       Payments     Sessions
       Inventory
          |
          v
       CDC / Events
          |
          v
     Data Warehouse
          |
          v
      Analytics
```

**PostgreSQL**

Stores authoritative transactional data:

- Users.
- Orders.
- Payments.
- Inventory.
- Product catalog.

**Redis**

Handles:

- Session storage.
- Caching.
- Shopping cart state where appropriate.
- Rate limiting.

The exact cart design depends on durability and consistency requirements. A cart may also be stored transactionally in PostgreSQL.

**Elasticsearch / OpenSearch**

Handles:

- Full-text product search.
- Relevance ranking.
- Faceted filtering.

The search index is derived from authoritative product data.

**Data warehouse**

Handles:

- Sales reporting.
- Revenue analysis.
- Customer behavior.
- Historical analytics.

The important idea is that each database has a defined responsibility.

Do not introduce all these databases on day one. A smaller e-commerce application may start with PostgreSQL alone and add Redis or a search engine only when requirements justify them.

### 12.2 Campaign and Gamification Application

Consider a campaign platform where users participate in games and earn rewards.

Requirements:

```text
- User registration
- Game sessions
- Score submission
- Leaderboards
- Reward allocation
- Campaign analytics
- Fraud detection
```

A possible design:

| Component                        | Candidate                    | Reason                                           |
| -------------------------------- | ---------------------------- | ------------------------------------------------ |
| Users and campaign configuration | PostgreSQL or MongoDB        | Depends on data relationships and existing model |
| Game submissions                 | PostgreSQL or MongoDB        | Durable submissions and query requirements       |
| Leaderboards                     | Redis                        | Sorted-set operations can support ranking        |
| Analytics                        | Data warehouse               | Large historical aggregations                    |
| Fraud relationship analysis      | Graph database, if justified | Complex relationship traversal                   |

Example Redis leaderboard:

```redis
ZADD campaign:101:leaderboard 950 user:101
ZADD campaign:101:leaderboard 870 user:102
ZADD campaign:101:leaderboard 990 user:103
```

Retrieve the highest-ranking users:

```redis
ZREVRANGE campaign:101:leaderboard 0 9 WITHSCORES
```

Important architectural point:

The Redis leaderboard may be a derived representation. The authoritative game submissions and reward decisions should be stored durably in the system of record.

A leaderboard score should not automatically become the only evidence for reward allocation.

### 12.3 SaaS CRUD Application

Consider a basic SaaS application:

```text
- Organizations
- Users
- Roles
- Projects
- Tasks
- Comments
- Subscriptions
```

A relational database such as PostgreSQL is a strong starting choice because:

- Entities have relationships.
- Permissions depend on ownership and membership.
- Transactions may span multiple tables.
- Filtering and reporting require joins.

You may not need MongoDB, Redis, Elasticsearch, or a distributed database initially.

One well-designed database can be enough.

### 12.4 Analytics and Reporting Platform

Suppose the application records millions of events.

Requirements:

- Historical analysis.
- Grouping by date.
- Aggregation by campaign.
- Revenue analysis.
- User behavior reports.

A typical architecture:

```text
Application
    |
    v
Operational Database
    |
    v
CDC / Event Pipeline
    |
    v
Data Warehouse
    |
    v
Analytics and Reports
```

The operational database handles transactions.

The analytical system handles large scans and aggregations.

Avoid running expensive analytical queries against the production OLTP database when they materially interfere with transactional workloads.

---

## 13. Common Database Selection Mistakes

### Mistake 1: Choosing Based on Popularity

Incorrect:

```text
MongoDB is popular.
Therefore, every backend should use MongoDB.
```

Why it fails:

Popularity does not describe your application's access patterns, consistency requirements, or transaction boundaries.

Better approach:

Identify requirements first, then shortlist databases.

### Mistake 2: Assuming NoSQL Is Always Faster

Incorrect:

```text
NoSQL is faster than SQL.
```

Why it fails:

Performance depends on:

- Query shape.
- Indexes.
- Data model.
- Hardware.
- Concurrency.
- Network latency.
- Consistency guarantees.
- Database configuration.

A relational database may outperform a document database for a particular workload, and the reverse may also be true.

### Mistake 3: Choosing a Database Only for Future Scale

Incorrect:

```text
We might have 100 million users in five years.
Let's start with a complicated distributed database.
```

Why it fails:

You are paying complexity costs before proving that the complexity is necessary.

Better approach:

Build an architecture that can evolve. Scale based on measured requirements and realistic growth projections.

### Mistake 4: Using Multiple Databases Without Clear Ownership

Incorrect:

```text
Use PostgreSQL for users.
MongoDB for orders.
Redis for payments.
Elasticsearch for products.
```

Why it fails:

The same business data may become duplicated across multiple systems without clear ownership.

Questions arise:

- Which database is authoritative?
- How are updates synchronized?
- What happens when synchronization fails?
- How are duplicates handled?
- How is consistency maintained?

Every database should have a defined responsibility.

### Mistake 5: Using Redis as the Only Database Without Evaluating Durability

Redis supports persistence, but its durability behavior depends on configuration and deployment.

Before using it as an authoritative store, evaluate:

- Persistence mode.
- AOF and snapshot behavior.
- Replication.
- Failover.
- Backup and recovery.
- Eviction policies.
- Memory limits.

Fast access is not a substitute for durability requirements.

### Mistake 6: Treating Replication as Backup

Replication can copy accidental updates and deletions.

A separate backup and tested restore process are necessary.

### Mistake 7: Ignoring Operational Complexity

A database may look attractive in a benchmark but require expertise the team does not have.

Evaluate the cost of operating it in production, not just the cost of developing against it.

### Mistake 8: Benchmarking Unrealistic Workloads

A benchmark with:

- Tiny datasets.
- No concurrent requests.
- No realistic indexes.
- No network latency.
- No failure testing.

does not establish production suitability.

Benchmark realistic workloads.

### Mistake 9: Ignoring Data Migration

Database migrations become expensive when the application grows.

Evaluate:

- Schema evolution.
- Data export.
- Data import.
- Downtime.
- Backward compatibility.
- Dual-write risks.
- Rollback strategy.

### Mistake 10: Choosing a Database Without Defining a System of Record

If PostgreSQL and Elasticsearch both store product information, which one is authoritative?

A clear answer is necessary.

For example:

```text
PostgreSQL:
  Authoritative product data.

Elasticsearch:
  Derived search representation.
```

This makes synchronization and recovery decisions easier.

---

## 14. Important Misconceptions

| Misconception                                        | Correct understanding                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| SQL databases cannot scale horizontally              | SQL databases can use sharding, distributed SQL, replication, and other scaling techniques |
| NoSQL databases are always faster                    | Performance depends on workload, data model, and configuration                             |
| NoSQL databases do not support ACID                  | Some NoSQL databases support transactions and ACID guarantees                              |
| MongoDB cannot handle transactions                   | MongoDB supports multi-document transactions                                               |
| Relational databases cannot store JSON               | PostgreSQL supports JSON and JSONB                                                         |
| Redis is always a better database because it is fast | Durability, memory cost, and persistence requirements matter                               |
| Replication is equivalent to backup                  | Replication does not protect against every form of data loss                               |
| Sharding always improves performance                 | Poor partitioning can create hotspots and additional coordination                          |
| One application must use one database                | Multiple databases can serve specialized workloads                                         |
| Every large application needs multiple databases     | A single database can remain sufficient for many large applications                        |
| Distributed SQL removes all database tradeoffs       | It introduces coordination, network latency, and operational complexity                    |
| Eventual consistency means incorrect data forever    | Replicas or derived copies are expected to converge under the relevant conditions          |

---

## 15. Interview Questions and Answers

### Beginner Level

**Q1. What factors should be considered when selecting a database?**

Answer:

- Data model.
- Access patterns.
- Query complexity.
- Read/write workload.
- Consistency requirements.
- Scalability.
- Availability and durability.
- Operational complexity.
- Cost.
- Team expertise.

**Q2. When would you choose PostgreSQL over MongoDB?**

Answer:

When the application has relational data, complex joins, constraints, and transactional requirements that fit PostgreSQL's relational model.

MongoDB may be preferable when the application's data is naturally document-oriented and its access patterns benefit from document aggregation.

Neither is universally better.

**Q3. When would you use Redis?**

Answer:

For workloads such as caching, session storage, rate limiting, key-value lookups, and leaderboard operations.

Its persistence and durability capabilities must be evaluated before using it as an authoritative data store.

**Q4. What is the difference between OLTP and OLAP?**

Answer:

- OLTP handles operational transactions such as orders and payments.
- OLAP handles analytical workloads such as historical revenue and user behavior analysis.

**Q5. What is a system of record?**

Answer:

The authoritative source of truth for a particular category of data.

For example, PostgreSQL may be the system of record for orders while Elasticsearch maintains a derived search index.

### Intermediate Level

**Q6. How would you select a database for an e-commerce application?**

Answer:

I would first classify the workloads.

- PostgreSQL for users, orders, payments, and inventory.
- Redis for caching and sessions.
- Elasticsearch for advanced product search if required.
- A warehouse for analytics.

I would start with the minimum necessary architecture and introduce additional databases only when measurable requirements justify them.

**Q7. Why shouldn't we choose Cassandra just because an application may have millions of users?**

Answer:

Registered user count does not determine the database workload.

We need actual read/write throughput, query patterns, data volume, consistency requirements, partition design, and operational capabilities.

Cassandra is useful for specific distributed workloads but introduces query-driven modeling and operational complexity.

**Q8. What is the difference between read replicas and sharding?**

Answer:

- Read replicas copy data to additional database instances and can distribute read traffic.
- Sharding divides data across multiple database instances and can distribute storage and write load.

They solve different scaling problems.

**Q9. How does consistency influence database selection?**

Answer:

Business operations such as payments and inventory reservations may require strong transactional guarantees.

Search indexes and analytics systems can often tolerate delayed propagation.

The database and architecture must provide the required guarantees.

**Q10. Why might a managed database be preferable to a self-hosted database?**

Answer:

A managed database can reduce the team's operational burden through managed provisioning, backups, monitoring, maintenance, and failover features.

However, it introduces service costs and provider-specific limitations.

### Advanced Level

**Q11. How would you choose between PostgreSQL and a distributed SQL database?**

Answer:

I would first determine whether a conventional PostgreSQL deployment can satisfy the required workload.

If the application needs distributed relational transactions, horizontal scaling across nodes, or specific geographic availability requirements, I would evaluate distributed SQL.

I would compare transaction semantics, latency, throughput, failure behavior, and operational cost using representative workloads.

**Q12. Why is a search engine usually not the system of record?**

Answer:

Search engines are optimized for indexing and retrieving searchable representations of data.

Transactional business operations often require constraints, transaction boundaries, and authoritative state management.

A relational or document database is commonly used as the system of record, with search indexes updated through an asynchronous pipeline.

**Q13. How would you handle consistency between PostgreSQL and Elasticsearch?**

Answer:

A common solution is the transactional outbox pattern.

1. Update the authoritative record in PostgreSQL.
2. Insert an outbox event in the same database transaction.
3. A background worker reads pending events.
4. The worker updates Elasticsearch.
5. The worker marks the event as processed.

The worker should be retry-safe and the indexing operation should be idempotent.

This avoids relying on an unsafe dual-write sequence.

**Q14. What is the biggest mistake in database benchmarking?**

Answer:

Testing an unrealistic workload.

A meaningful benchmark should use representative data volume, data distribution, indexes, concurrency, query patterns, and failure scenarios.

**Q15. How would you decide whether to introduce another database into an existing architecture?**

Answer:

I would identify a measurable problem in the existing system.

Examples:

- Search queries are affecting transactional performance.
- Cacheable reads are overwhelming the primary.
- Analytical queries are interfering with OLTP.
- Time-series ingestion requires specialized retention and compression.

Then I would evaluate whether a specialized database solves the problem at an acceptable operational cost.

---

## 16. Practical Exercises

### Exercise 1: Choose a Database

Select an appropriate database for each scenario and explain your reasoning.

| Scenario                              | Your selection |
| ------------------------------------- | -------------- |
| Payment processing                    | ?              |
| User sessions                         | ?              |
| Full-text product search              | ?              |
| Social network relationship traversal | ?              |
| Server CPU metrics                    | ?              |
| Large historical sales analytics      | ?              |
| High-volume device telemetry          | ?              |
| SaaS project management application   | ?              |

For each answer, explain:

1. Why does the database fit?
2. What alternatives could work?
3. What are the tradeoffs?
4. What workload information would change your decision?

### Exercise 2: Design a Database Architecture

Design an architecture for an e-commerce application with:

```text
10 million registered users
500,000 daily active users
50,000 orders per day
5 million product records
High product search traffic
Historical sales analytics
```

Decide:

- Primary database.
- Cache.
- Search engine.
- Analytics database.
- Data synchronization approach.
- Backup and recovery approach.

Do not select technologies only because the numbers look large. Identify the actual throughput, latency, and consistency requirements first.

### Exercise 3: Database Decision Record

Create an ADR for a SaaS application.

Include:

```text
Problem:
Requirements:
Workload:
Data model:
Access patterns:
Consistency requirements:
Scalability requirements:
Availability requirements:
Candidates:
Selected database:
Rejected alternatives:
Tradeoffs:
Operational cost:
Future migration considerations:
```

### Exercise 4: Evaluate Database Candidates

Compare PostgreSQL and MongoDB for an application with:

- Users.
- Orders.
- Payments.
- Product catalog.
- Campaign configurations.
- User activity records.

Discuss:

- Relationships.
- Schema evolution.
- Transactions.
- Query complexity.
- Indexing.
- Scaling.
- Operational complexity.

Do not conclude that one database wins without explaining the workload assumptions.

### Exercise 5: Build a Small Benchmark

Create a Node.js application that performs:

1. 10,000 user inserts.
2. 10,000 user lookups.
3. 10,000 order inserts.
4. Queries for orders by user ID.
5. Aggregation of order totals.

Run the workload against two database candidates.

Record:

| Metric            | Candidate A | Candidate B |
| ----------------- | ----------- | ----------- |
| Insert throughput |             |             |
| Read throughput   |             |             |
| p50 latency       |             |             |
| p95 latency       |             |             |
| p99 latency       |             |             |
| CPU usage         |             |             |
| Memory usage      |             |             |

Use the same dataset and equivalent indexes. Ensure the benchmark is repeatable.

---

## 17. Final Summary

Database selection is a requirement-driven architectural decision.

The major factors are:

1. **Data model:** Relational, document, key-value, graph, time-series, or analytical.
2. **Access patterns:** Key lookups, joins, ranges, search, graph traversal, and aggregations.
3. **Workload:** OLTP, OLAP, search, caching, ingestion, or mixed.
4. **Consistency:** Transaction guarantees, atomicity, stale reads, and retry behavior.
5. **Scalability:** Data volume, throughput, concurrency, latency, and distribution.
6. **Availability:** Replication, failure tolerance, RPO, and RTO.
7. **Operations:** Monitoring, backups, upgrades, troubleshooting, and team expertise.
8. **Cost:** Infrastructure, storage, network, licensing, engineering effort, and migration.

### The most important rules

- Never choose a database only because it is popular.
- Understand access patterns before designing the schema.
- Do not sacrifice business correctness for theoretical scalability.
- Start with the simplest architecture that meets the requirements.
- Add specialized databases when they solve measurable problems.
- Separate authoritative data from derived data.
- Benchmark realistic workloads.
- Test backup restoration and failure recovery.
- Include operational complexity in every database decision.

**The key takeaway:**

A good database architecture is not the one with the most technologies. It is the one that satisfies the application's requirements with the least unnecessary complexity.
