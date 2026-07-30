---
sidebar_label: Wide-Column Databases: Fundamentals
sidebar_position: 1
---

# Wide-Column Databases: Fundamentals

## 1. What Is a Wide-Column Database?

A **wide-column database** is a type of NoSQL database designed to store and retrieve large amounts of distributed data using a flexible, column-oriented data model.

It organizes data into rows and columns, but its structure and storage model differ significantly from traditional relational databases.

Examples include:

- **Apache Cassandra**
- **Apache HBase**
- Google Bigtable (the system that inspired several wide-column database designs)

Wide-column databases are particularly useful when applications need:

- High write throughput.
- Horizontal scaling across many machines.
- High availability.
- Large-scale event and time-series storage.
- Predictable queries against very large datasets.

### Important distinction

A wide-column database is not simply a relational database with thousands of columns.

It is a distributed data model in which partitioning, data distribution, and query access patterns are fundamental design considerations.

---

## 2. Why Do Wide-Column Databases Exist?

Consider an application that collects activity events from millions of users.

Every time a user performs an action, the application records:

- User ID.
- Event type.
- Timestamp.
- Device information.
- Campaign ID.
- Location.
- Additional event metadata.

Suppose the application generates 100 million events per day.

A traditional relational database can store this data, but at sufficiently large scale, the system may need additional infrastructure to handle:

1. Very high write volume.
2. Increasing storage requirements.
3. Large-scale data distribution.
4. High availability across multiple machines.
5. Queries that retrieve records by a known partition key.

Wide-column databases were designed for workloads where distributing data across many nodes is a core requirement.

### Traditional relational database approach

A relational database might store events in a table:

```sql
CREATE TABLE events (
    event_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_type VARCHAR(100),
    event_time TIMESTAMP,
    device VARCHAR(100),
    campaign_id BIGINT
);
```

As the dataset grows, the database may require indexing, partitioning, replication, and additional scaling infrastructure.

### Wide-column database approach

A wide-column database can distribute records across multiple nodes using a partition key.

For example:

```text
Partition Key: user_id

user_101
    event_1
    event_2
    event_3

user_102
    event_1
    event_2

user_103
    event_1
    event_2
```

Different partitions can be distributed across different machines.

The application can retrieve a user's events by providing the relevant partition key.

**The central idea:** Organize data around the queries the application needs to execute, while distributing that data across a cluster.

---

## 3. Understanding the Data Model

To understand wide-column databases, first understand their basic building blocks.

### 3.1 Rows

A row represents a collection of related data associated with a row key.

For example:

```text
Row Key: user_101

user_id: 101
name: Prashant
email: prashant@example.com
city: Noida
```

Unlike a traditional relational table, different rows in a wide-column system may contain different sets of columns, depending on the database and its data model.

### 3.2 Columns

A column represents an individual data value associated with a row.

For example:

```text
Row Key: user_101

name       = Prashant
email      = prashant@example.com
city       = Noida
created_at = 2026-01-10
```

Another row might contain additional columns or omit some of these columns.

This flexibility is useful when records have different attributes.

### 3.3 Column Families

A column family groups related columns.

For example:

```text
User Row: user_101

Column Family: profile
    name  = Prashant
    email = prashant@example.com
    city  = Noida

Column Family: activity
    last_login = 2026-11-14
    device     = Android
```

Column families are an important concept in systems such as HBase.

However, **do not assume every wide-column database implements column families in exactly the same way.**

Cassandra uses tables, partition keys, clustering columns, and regular columns through its CQL data model. Its internal storage organization is different from HBase's column-family model.

### 3.4 Partitions

A partition is a logical group of rows or data associated with a partition key.

For example:

```text
Partition Key: user_101

    event_001
    event_002
    event_003
    event_004
```

A partition key determines how data is distributed across the database cluster.

This is one of the most important concepts in Cassandra.

### 3.5 Cells

A cell is an individual value associated with a row and a column.

In systems such as HBase, a cell can be identified using:

- Row key.
- Column family.
- Column qualifier.
- Version or timestamp.

For example:

```text
Row Key: user_101

profile:name = Prashant
profile:email = prashant@example.com
```

HBase can maintain multiple versions of a cell, depending on its configuration.

---

## 4. Visualizing a Wide-Column Data Model

Consider a simplified user activity dataset:

```text
Row Key: user_101
-----------------------------------------
Column             | Value
-----------------------------------------
name               | Prashant
city               | Noida
device             | Android
last_login         | 2026-11-14
campaign_id        | 501


Row Key: user_102
-----------------------------------------
Column             | Value
-----------------------------------------
name               | Rahul
city               | Delhi
last_login         | 2026-11-13
subscription       | Premium


Row Key: user_103
-----------------------------------------
Column             | Value
-----------------------------------------
name               | Amit
device             | iPhone
campaign_id        | 503
```

Notice that the rows do not necessarily have identical columns.

This is different from the typical relational table model, where every row belongs to a defined table schema.

The example is conceptual. Actual Cassandra and HBase schemas have their own rules and structures.

---

## 5. Wide-Column vs Relational Databases

Both systems can represent rows and columns, but their data models and scaling approaches differ.

| Feature           | Relational Database                                                             | Wide-Column Database                                                  |
| ----------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Data model        | Tables, rows, columns                                                           | Distributed rows and columns                                          |
| Schema            | Defined table schema                                                            | Depends on database; often more flexible                              |
| Relationships     | Foreign keys and JOINs                                                          | Usually modeled through access patterns                               |
| Data distribution | Often centralized initially; can be distributed through additional architecture | Designed around distributed partitioning                              |
| Query style       | Flexible SQL queries                                                            | Often query-driven and more constrained                               |
| Transactions      | Rich transaction support in systems such as PostgreSQL                          | Depends on database; Cassandra has different transaction capabilities |
| Scaling           | Vertical scaling, replication, partitioning, and distributed extensions         | Horizontal distribution is a central design feature                   |
| Common workloads  | Relational business data and transactional systems                              | Large-scale distributed workloads                                     |

### Example: E-commerce application

A relational database might store:

```text
users
orders
products
payments
```

It can connect these tables using foreign keys and JOINs.

A wide-column database might store:

```text
user_orders
    partition_key = user_id

    order_001
    order_002
    order_003
```

The application retrieves orders for a specific user by using that user's partition key.

### Key difference

Relational databases are generally designed around relationships between entities.

Wide-column databases are generally designed around distributed data access patterns.

This does not mean relational databases cannot scale or wide-column databases cannot maintain consistency. Their design priorities differ.

---

## 6. Wide-Column vs Document Databases

You have already studied MongoDB and document database architecture. Both document and wide-column databases are NoSQL systems, but their data models are different.

### Document database example: MongoDB

A user document might look like this:

```javascript
{
  _id: 101,
  name: "Prashant",
  email: "prashant@example.com",
  city: "Noida",
  devices: [
    "Android",
    "Windows"
  ],
  preferences: {
    notifications: true,
    theme: "dark"
  }
}
```

The document groups related data into a nested structure.

### Wide-column database example

A simplified wide-column representation might look like:

```text
Row Key: user_101

profile:name  = Prashant
profile:email = prashant@example.com
profile:city  = Noida

activity:last_login = 2026-11-14
activity:device     = Android
```

### Comparison

| Feature             | Document Database           | Wide-Column Database                                  |
| ------------------- | --------------------------- | ----------------------------------------------------- |
| Main structure      | Documents                   | Rows, columns, partitions                             |
| Data representation | JSON-like documents         | Column-oriented distributed model                     |
| Nested data         | Natural support             | Not the central model                                 |
| Distribution        | Sharding or partitioning    | Partition-based distribution                          |
| Query design        | Document fields and indexes | Usually designed around partition and clustering keys |
| Examples            | MongoDB                     | Cassandra, HBase                                      |

### When to use each?

Use a document database when:

- Your application works naturally with nested objects.
- Data structures vary between records.
- You need document-oriented queries.
- You need relationships embedded in documents or references between documents.

Use a wide-column database when:

- You need to distribute massive datasets across nodes.
- Your workload has high write throughput.
- Your queries are known and can be designed around partition keys.
- You need large-scale availability and horizontal scaling.

---

## 7. Cassandra Fundamentals

<escape> </escape>**Apache Cassandra** is a distributed wide-column NoSQL database designed to handle large amounts of data across multiple machines.

It is particularly known for:

- Peer-to-peer architecture.
- Horizontal scalability.
- High availability.
- Tunable consistency.
- High write throughput.

<escape> </escape><escape> </escape>Unlike a traditional primary-secondary database architecture, Cassandra uses a peer-to-peer architecture in which nodes can accept requests.

### 7.1 Cassandra Architecture — High-Level View

Imagine a cluster containing three nodes:

```text
                 Application
                      |
                Cassandra Driver
                      |
          +-----------+-----------+
          |           |           |
       Node A       Node B       Node C
          |           |           |
          +-----------+-----------+
               Distributed
                  Cluster
```

Each node participates in the cluster.

Data is distributed across nodes according to the partitioning strategy and replication configuration.

There is no permanent single primary node responsible for all writes.

### 7.2 Cassandra Key Concepts

| Concept            | Meaning                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| Cluster            | Collection of Cassandra nodes                                           |
| Node               | Individual Cassandra server                                             |
| Keyspace           | Logical grouping of tables and replication settings                     |
| Table              | Structured collection of rows                                           |
| Partition key      | Determines which partition a row belongs to and how data is distributed |
| Clustering columns | Determine the ordering of rows within a partition                       |
| Regular columns    | Store additional data attributes                                        |
| Replication factor | Number of replicas maintained for data                                  |

### 7.3 Keyspace

A keyspace is a logical container for tables.

It also defines replication settings.

Example:

```sql
CREATE KEYSPACE ecommerce
WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'datacenter1': 3
};
```

Here:

- `ecommerce` is the keyspace.
- `NetworkTopologyStrategy` is the replication strategy.
- `datacenter1` identifies a data center.
- `3` means Cassandra maintains three replicas for each partition in that data center.

This is a configuration example; actual data-center names depend on the cluster.

### 7.4 Creating a Table

```sql
USE ecommerce;

CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    device TEXT,
    campaign_id INT,
    PRIMARY KEY (user_id, event_time)
);
```

Here:

- `user_id` is the partition key.
- `event_time` is the clustering column.
- `event_type`, `device`, and `campaign_id` are regular columns.

The primary key has an important role in determining both data distribution and row ordering.

### 7.5 Inserting Data

```sql
INSERT INTO user_events (
    user_id,
    event_time,
    event_type,
    device,
    campaign_id
)
VALUES (
    123e4567-e89b-12d3-a456-426614174000,
    '2026-11-14T10:30:00Z',
    'login',
    'Android',
    501
);
```

Another event:

```sql
INSERT INTO user_events (
    user_id,
    event_time,
    event_type,
    device,
    campaign_id
)
VALUES (
    123e4567-e89b-12d3-a456-426614174000,
    '2026-11-14T11:00:00Z',
    'purchase',
    'Android',
    501
);
```

Both rows belong to the same partition because they have the same `user_id`.

Their order within the partition is determined by `event_time`.

### 7.6 Querying Data

```sql
SELECT *
FROM user_events
WHERE user_id = 123e4567-e89b-12d3-a456-426614174000;
```

This query provides the partition key, so Cassandra can locate the relevant partition.

A time-range query can also use the clustering column:

```sql
SELECT *
FROM user_events
WHERE user_id = 123e4567-e89b-12d3-a456-426614174000
AND event_time >= '2026-11-14T00:00:00Z'
AND event_time < '2026-11-15T00:00:00Z';
```

This is aligned with the table's primary-key design.

**Important:** Cassandra is not a drop-in replacement for PostgreSQL. It does not support arbitrary relational JOINs or unrestricted filtering in the same way.

---

## 8. Partition Key vs Clustering Columns

This is one of the most important concepts in Cassandra.

Consider:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    device TEXT,
    PRIMARY KEY (user_id, event_time)
);
```

The primary key contains two parts.

### Partition key

```text
user_id
```

The partition key determines which partition the data belongs to and is central to data distribution across the cluster.

### Clustering column

```text
event_time
```

The clustering column determines how rows are ordered within a partition.

### Visual example

```text
Partition: user_101
|
|-- 2026-11-14 09:00 -> login
|-- 2026-11-14 10:00 -> page_view
|-- 2026-11-14 11:00 -> purchase


Partition: user_102
|
|-- 2026-11-14 08:00 -> login
|-- 2026-11-14 12:00 -> logout
```

The partition key groups records.

The clustering column orders records inside that group.

### Why does this matter?

Suppose your application needs to retrieve the latest events for a particular user.

A partition key based on `user_id` allows Cassandra to locate that user's partition.

The clustering column based on `event_time` allows the events to be organized by time.

This makes the table suitable for that query pattern.

### Composite partition keys

Cassandra also supports composite partition keys.

For example:

```sql
PRIMARY KEY ((country, user_id), event_time)
```

Here:

- `country` and `user_id` together form the partition key.
- `event_time` is the clustering column.

This allows the partitioning design to incorporate multiple values.

Do not add fields to a partition key without considering how they affect data distribution and the application's queries.

---

## 9. Data Modeling in Cassandra

Cassandra uses a query-driven data modeling approach.

This is a major difference from traditional relational database design.

### Relational modeling approach

In PostgreSQL, you might create normalized tables:

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
amount
created_at
```

Then retrieve a user's orders using a JOIN:

```sql
SELECT
    u.name,
    o.order_id,
    o.amount
FROM users u
JOIN orders o
    ON u.user_id = o.user_id
WHERE u.user_id = 101;
```

### Cassandra modeling approach

In Cassandra, you generally design tables around the queries you need.

Suppose the application requires:

1. Get all orders for a user.
2. Get an order by its ID.
3. Get recent orders for a user.

You might create separate tables for these access patterns.

Example:

```sql
CREATE TABLE orders_by_user (
    user_id UUID,
    created_at TIMESTAMP,
    order_id UUID,
    amount DECIMAL,
    PRIMARY KEY (user_id, created_at, order_id)
);
```

And another table:

```sql
CREATE TABLE order_by_id (
    order_id UUID PRIMARY KEY,
    user_id UUID,
    amount DECIMAL,
    created_at TIMESTAMP
);
```

Why duplicate the data?

Because Cassandra is optimized around known access patterns rather than arbitrary relational joins.

This approach is called **denormalization**.

### Important principle

In relational databases, you commonly normalize data to reduce duplication.

In Cassandra, you often duplicate data to make important queries efficient and predictable.

Denormalization is not automatically bad. It is a deliberate tradeoff.

However, duplicate data creates additional write and consistency responsibilities.

---

## 10. HBase Fundamentals

**Apache HBase** is another distributed wide-column database.

It is modeled after Google's Bigtable design and is commonly used for storing very large datasets distributed across a cluster.

HBase is built on top of HDFS (Hadoop Distributed File System).

### 10.1 High-Level Architecture

```text
              Application
                   |
                HBase
                   |
             HBase Master
                   |
          +--------+--------+
          |                 |
      RegionServer A   RegionServer B
          |                 |
       Regions           Regions
          |                 |
          +--------+--------+
                   |
                  HDFS
```

At a high level:

- **HBase Master:** Coordinates cluster-level operations and region assignment.
- **RegionServer:** Handles data operations for assigned regions.
- **Region:** A range of table rows.
- **HDFS:** Provides distributed underlying storage.

The detailed architecture and storage internals belong to Part 13B.

### 10.2 HBase Data Model

HBase organizes data using:

- Tables.
- Rows.
- Row keys.
- Column families.
- Column qualifiers.
- Cells.

Example:

```text
Table: users

Row Key: user_101

Column Family: profile
    name  = Prashant
    email = prashant@example.com
    city  = Noida

Column Family: activity
    device     = Android
    last_login = 2026-11-14
```

### 10.3 Column Families vs Column Qualifiers

A column family is defined as part of the table schema.

A column qualifier identifies an individual column inside that family.

For example:

```text
profile:name
profile:email
profile:city
```

Here:

- `profile` is the column family.
- `name`, `email`, and `city` are column qualifiers.

This differs from Cassandra's CQL table model.

### 10.4 HBase and Consistency

HBase provides strong consistency for row-level operations.

Its architecture and consistency model differ from Cassandra's peer-to-peer architecture and tunable consistency model.

Do not assume all wide-column databases have identical consistency guarantees.

---

## 11. Cassandra vs HBase

Both are wide-column databases, but they have significant architectural differences.

| Feature            | Cassandra                                   | HBase                                                        |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------ |
| Architecture       | Peer-to-peer                                | Master and RegionServer architecture                         |
| Storage foundation | Its own distributed storage engine          | HDFS                                                         |
| Data organization  | Tables, partition keys, clustering columns  | Tables, row keys, column families                            |
| Consistency        | Tunable consistency                         | Strong consistency for row operations                        |
| Distribution       | Partitioning and replication                | Regions distributed across RegionServers                     |
| High availability  | Distributed peer-to-peer design             | Depends on HBase and its underlying Hadoop infrastructure    |
| Query language     | CQL                                         | APIs and HBase shell                                         |
| Typical strengths  | High availability and distributed workloads | Large-scale structured data and Hadoop ecosystem integration |

### Which should you choose?

Choose Cassandra when:

- You need a distributed database with peer-to-peer architecture.
- High write throughput is important.
- You need tunable consistency.
- You want a design centered around predictable partition-key queries.

Choose HBase when:

- You operate in the Hadoop ecosystem.
- Your workload benefits from HDFS-backed storage.
- You need HBase's row-key and column-family model.
- You need large-scale distributed data access.

The correct choice depends on the workload, operational environment, and consistency requirements.

---

## 12. Common Use Cases

Wide-column databases are particularly useful for large distributed workloads.

### 12.1 Event Logging

Applications generate events continuously.

Examples:

- User login.
- Product views.
- Button clicks.
- Purchases.
- Campaign interactions.

A partition key can organize events by user or another access dimension.

### 12.2 Time-Series Data

Applications collect measurements over time.

Examples:

- Server CPU usage.
- Memory utilization.
- IoT sensor readings.
- Application response times.
- Device telemetry.

A common model uses an entity or device identifier as the partition key and time as a clustering column.

For example:

```text
Partition: device_101

10:00 -> temperature = 28
10:05 -> temperature = 29
10:10 -> temperature = 28
10:15 -> temperature = 30
```

For very large time-series workloads, partition design should also account for time buckets so that partitions do not grow indefinitely.

### 12.3 IoT Applications

Imagine 500,000 sensors sending readings every minute.

Each reading contains:

```text
sensor_id
timestamp
temperature
humidity
battery_level
```

A wide-column database can distribute these records across nodes.

### 12.4 Activity Feeds

A social application may need to store large numbers of user activities.

Examples:

- User posted a photo.
- User liked a post.
- User followed another user.
- User commented on a post.

Data can be organized around the application's expected feed queries.

### 12.5 Large-Scale Distributed Applications

Wide-column databases can support systems where:

- Data volume is extremely large.
- Writes are continuous.
- Data is distributed across many nodes.
- High availability is important.
- Query patterns are known in advance.

---

## 13. When Should You Choose a Wide-Column Database?

Use a wide-column database when the workload matches its strengths.

| Requirement                              | Suitability        |
| ---------------------------------------- | ------------------ |
| Very high write throughput               | Strong fit         |
| Massive distributed datasets             | Strong fit         |
| Horizontal scaling                       | Strong fit         |
| High availability                        | Strong fit         |
| Predictable partition-key queries        | Strong fit         |
| Time-series and event workloads          | Often a strong fit |
| Complex relational JOINs                 | Poor fit           |
| Flexible ad hoc analytics                | Usually poor fit   |
| Complex multi-entity transactions        | Often poor fit     |
| Queries without a suitable partition key | Poor fit           |

### Example: Your campaign platform

Suppose a campaign platform receives millions of interactions.

You want to store:

```text
user_id
campaign_id
event_type
event_timestamp
device
```

If your main query is:

> Retrieve all interactions for a particular user during a given time range.

A Cassandra table could be designed around:

```text
Partition key: user_id
Clustering key: event_timestamp
```

But suppose your primary requirement is:

> Generate arbitrary reports grouping interactions by campaign, city, device, date, and user.

That is a different workload.

A relational database or analytical database may be more appropriate, depending on data volume and reporting requirements.

**Do not select a database because it is popular or because it claims to scale. Select it based on the queries, consistency requirements, and operational constraints.**

---

## 14. Common Misconceptions

### Misconception 1: Wide-column databases are just relational databases with more columns.

Incorrect.

Their distributed data model and partitioning behavior are fundamental to how they operate.

### Misconception 2: Wide-column databases are the same as columnar analytical databases.

Incorrect.

A wide-column database such as Cassandra is not the same thing as an analytical columnar database such as ClickHouse.

They serve different workloads and use different storage and query designs.

### Misconception 3: Cassandra and HBase work identically.

Incorrect.

They have different architectures, data models, and consistency approaches.

### Misconception 4: Wide-column databases do not have schemas.

Incorrect.

They have schemas and data-model rules. Their flexibility differs by database.

### Misconception 5: Cassandra supports arbitrary SQL queries.

Incorrect.

Cassandra uses CQL, which resembles SQL syntactically, but query restrictions are tied to its data model.

### Misconception 6: More nodes always make Cassandra faster.

Incorrect.

Poor partition-key selection, hotspots, oversized partitions, network overhead, and inefficient queries can limit performance even with many nodes.

### Misconception 7: Denormalization means data duplication is harmless.

Incorrect.

Duplicated data requires careful write coordination and consistency management.

---

## 15. Practical Exercise

Consider a platform that records campaign interactions.

Each event contains:

```text
user_id
campaign_id
event_type
event_time
device
```

The system receives 50 million events daily.

### Task 1: Identify the database requirements

List the requirements:

- High write throughput.
- Large storage capacity.
- Horizontal scaling.
- Query events by user.
- Query events by campaign.
- Retrieve events within a time range.

### Task 2: Design a Cassandra table

Start with the query:

> Retrieve all events for a particular user during a time range.

A possible table:

```sql
CREATE TABLE events_by_user (
    user_id UUID,
    event_time TIMESTAMP,
    campaign_id UUID,
    event_type TEXT,
    device TEXT,
    PRIMARY KEY (user_id, event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

### Task 3: Query the events

```sql
SELECT *
FROM events_by_user
WHERE user_id = 123e4567-e89b-12d3-a456-426614174000
AND event_time >= '2026-11-14T00:00:00Z'
AND event_time < '2026-11-15T00:00:00Z';
```

### Task 4: Identify the problem

Now suppose the application also needs:

> Retrieve all events for a particular campaign during a time range.

The existing table is not designed for this query because `campaign_id` is not its partition key.

A separate query-specific table may be needed:

```sql
CREATE TABLE events_by_campaign (
    campaign_id UUID,
    event_time TIMESTAMP,
    user_id UUID,
    event_type TEXT,
    device TEXT,
    PRIMARY KEY (campaign_id, event_time, user_id)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

The same event may now be stored in two tables.

This is intentional denormalization.

In a production design, also consider partition sizing, time bucketing, write amplification, retention, and consistency between the two tables.

---

## 16. Interview Questions

### Q1. What is a wide-column database?

A NoSQL database that organizes data into distributed rows and columns, with data distribution and query access patterns central to its design.

### Q2. How is a wide-column database different from a relational database?

Relational databases focus on structured relationships, constraints, and flexible SQL queries. Wide-column databases focus on distributed data access patterns, partitioning, and horizontal scalability.

### Q3. What is a column family?

A logical grouping of related columns, particularly important in HBase's data model.

### Q4. What is the difference between a partition key and a clustering column in Cassandra?

The partition key determines data distribution and partition membership. Clustering columns determine the ordering of rows within a partition.

### Q5. Why does Cassandra use denormalization?

Because Cassandra is designed around known query patterns rather than arbitrary JOINs. Duplicate query-specific tables can make reads efficient and predictable.

### Q6. What is a Cassandra keyspace?

A logical container for tables that also defines replication settings.

### Q7. What is the difference between Cassandra and HBase?

Cassandra uses a peer-to-peer architecture with tunable consistency. HBase uses a master/RegionServer architecture and is built on HDFS, with strong consistency for row operations.

### Q8. Can Cassandra replace PostgreSQL?

Not universally. Cassandra is suitable for large distributed workloads with predictable access patterns. PostgreSQL is generally more suitable for relational workloads requiring complex JOINs, constraints, and rich transactions.

### Q9. Is Cassandra a columnar database?

Not in the same sense as analytical columnar databases. Cassandra is a wide-column NoSQL database with a partitioned row-and-column data model.

### Q10. Why is partition-key selection important?

It affects data distribution, query routing, partition size, and the risk of hotspots.

---

## 17. Chapter Summary

| Concept              | What to remember                                                 |
| -------------------- | ---------------------------------------------------------------- |
| Wide-column database | Distributed NoSQL database organized around rows and columns     |
| Main purpose         | Large-scale distributed workloads                                |
| Row                  | Collection of related column values                              |
| Column               | Individual data attribute                                        |
| Column family        | Group of columns, especially in HBase                            |
| Partition            | Logical data grouping based on a partition key                   |
| Cassandra            | Peer-to-peer wide-column database                                |
| HBase                | HDFS-based wide-column database                                  |
| Partition key        | Determines partition membership and data distribution            |
| Clustering column    | Determines ordering within a Cassandra partition                 |
| Denormalization      | Stores duplicate data to support query-specific access patterns  |
| Main strength        | Horizontal scalability and high-throughput distributed workloads |
| Main limitation      | Not designed for arbitrary relational queries and JOINs          |

### The most important concepts to retain

1. Wide-column databases are designed for distributed data workloads, not simply tables with many columns.
2. Cassandra and HBase have different architectures and data models.
3. Cassandra's partition key controls data distribution.
4. Cassandra's clustering columns control ordering within a partition.
5. Cassandra data modeling is query-driven.
6. Denormalization is common because arbitrary JOINs are not the intended query model.
7. Partition design directly affects performance and scalability.
