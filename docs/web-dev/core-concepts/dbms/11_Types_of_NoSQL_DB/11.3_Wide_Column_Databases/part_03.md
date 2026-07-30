---
sidebar_label: Wide-Column Databases: Data Modeling
sidebar_position: 1
---

# Wide-Column Databases: Data Modeling

## 1. Introduction

Let's understand one of the most important skills when working with Cassandra:

**How to design an efficient data model for an application.**

Data modeling in Cassandra is fundamentally different from relational database modeling.

In PostgreSQL, you commonly:

1. Identify entities.
2. Create normalized tables.
3. Define relationships.
4. Add primary and foreign keys.
5. Use JOINs to retrieve related information.

In Cassandra, you generally:

1. Identify the application's queries.
2. Design tables around those queries.
3. Select appropriate partition keys.
4. Select clustering columns.
5. Duplicate data when necessary.
6. Ensure partitions remain reasonably sized and distributed.

This approach is called **query-driven data modeling**.

### Topics covered

1. Query-driven data modeling.
2. Partition-key selection.
3. Clustering-key design.
4. Composite keys.
5. Time-series data modeling.
6. Denormalization and duplicate tables.
7. Partition sizing.
8. Hotspot prevention.
9. Practical Cassandra data-modeling examples.

---

## 2. The Fundamental Difference: Relational vs Cassandra Data Modeling

Let's start with an e-commerce application.

The application needs to store:

- Users.
- Products.
- Orders.
- Payments.

### 2.1 Relational Database Approach

In PostgreSQL, we might create:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150)
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    amount NUMERIC(12, 2),
    created_at TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id),
    product_id BIGINT,
    quantity INT
);
```

The data is normalized into separate tables.

To retrieve a user's orders:

```sql
SELECT
    u.name,
    o.order_id,
    o.amount,
    o.created_at
FROM users u
JOIN orders o
    ON u.user_id = o.user_id
WHERE u.user_id = 101;
```

This is a natural relational query.

### 2.2 Cassandra Approach

In Cassandra, we start with the queries.

Suppose the application needs:

1. Get all orders for a user.
2. Get a specific order by ID.
3. Get recent orders for a user.
4. Get orders for a particular product.

Instead of creating normalized tables and relying on JOINs, we create tables that support these access patterns.

For example:

```sql
CREATE TABLE orders_by_user (
    user_id UUID,
    created_at TIMESTAMP,
    order_id UUID,
    amount DECIMAL,
    PRIMARY KEY (user_id, created_at, order_id)
);
```

And:

```sql
CREATE TABLE orders_by_id (
    order_id UUID PRIMARY KEY,
    user_id UUID,
    amount DECIMAL,
    created_at TIMESTAMP
);
```

Both tables may contain overlapping information.

This is intentional.

The same logical order can be stored in multiple query-specific tables to support different retrieval patterns.

### Key principle

**In relational databases, we commonly design the schema around entities and relationships. In Cassandra, we commonly design tables around queries and access patterns.**

---

## 3. Query-Driven Data Modeling

Query-driven modeling means that we identify the queries an application needs before designing its Cassandra tables.

This is one of the most important principles in Cassandra.

### 3.1 Start With Application Requirements

Consider a campaign platform that records user interactions.

Each event contains:

```javascript
{
    userId: 101,
    campaignId: 501,
    eventType: "click",
    device: "Android",
    eventTime: "2026-11-14T10:30:00Z"
}
```

The application needs these queries:

| Query ID | Required operation                            |
| -------- | --------------------------------------------- |
| Q1       | Get all events for a user                     |
| Q2       | Get events for a user within a time range     |
| Q3       | Get all events for a campaign                 |
| Q4       | Get events for a campaign within a time range |
| Q5       | Get a particular event by ID                  |

These queries become the foundation of the data model.

### 3.2 Design a Table for Each Access Pattern

For Q1 and Q2:

```sql
CREATE TABLE events_by_user (
    user_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    campaign_id UUID,
    event_type TEXT,
    device TEXT,
    PRIMARY KEY (user_id, event_time, event_id)
);
```

For Q3 and Q4:

```sql
CREATE TABLE events_by_campaign (
    campaign_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    user_id UUID,
    event_type TEXT,
    device TEXT,
    PRIMARY KEY (campaign_id, event_time, event_id)
);
```

For Q5:

```sql
CREATE TABLE event_by_id (
    event_id UUID PRIMARY KEY,
    user_id UUID,
    campaign_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    device TEXT
);
```

Now the application has three tables designed around three query patterns.

### 3.3 Why Not Use One Table?

You might ask:

Why not create one table containing all the event data and query it using different columns?

Because Cassandra's query model is built around partition keys and clustering columns.

A table designed for efficient retrieval by `user_id` is not automatically efficient for retrieval by `campaign_id`.

For example:

```sql
SELECT *
FROM events_by_user
WHERE campaign_id = 501;
```

This is not a normal partition-key-based query.

Cassandra generally requires queries to align with the table's primary-key design.

You should not assume arbitrary filtering will behave like PostgreSQL.

### 3.4 Query-First Workflow

```text
Understand Application Requirements
                 |
                 v
        Identify Read Queries
                 |
                 v
       Identify Write Queries
                 |
                 v
       Design Partition Keys
                 |
                 v
       Design Clustering Keys
                 |
                 v
          Create Tables
                 |
                 v
      Test Query Performance
                 |
                 v
        Refine the Model
```

### Important

Do not start Cassandra data modeling by converting every relational table into a Cassandra table.

Start by identifying how the application reads and writes data.

---

## 4. Partition-Key Selection

The partition key is one of the most important design decisions in Cassandra.

It determines which partition a row belongs to and plays a central role in distributing data across the cluster.

A poor partition key can create:

- Uneven data distribution.
- Hot partitions.
- Very large partitions.
- Performance bottlenecks.

### 4.1 Understanding the Partition Key

Consider:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    PRIMARY KEY (user_id, event_time)
);
```

Here:

- `user_id` is the partition key.
- `event_time` is the clustering column.

All rows with the same `user_id` belong to the same logical partition.

Example:

```text
Partition: user_101
---------------------------
10:00 -> login
10:30 -> page_view
11:00 -> purchase


Partition: user_102
---------------------------
09:00 -> login
09:30 -> logout


Partition: user_103
---------------------------
08:00 -> login
```

Different partitions are distributed across the cluster.

### 4.2 What Makes a Good Partition Key?

A good partition key should generally:

1. Distribute data reasonably evenly.
2. Distribute traffic across the cluster.
3. Support the application's important queries.
4. Avoid creating extremely large partitions.
5. Avoid concentrating too many requests on one partition.

### 4.3 High Cardinality

Cardinality refers to the number of distinct values in a column.

For example:

| Column      | Example cardinality |
| ----------- | ------------------: |
| Country     |                 Low |
| Device type |                 Low |
| Campaign ID |      Medium or high |
| User ID     |                High |
| Event ID    |           Very high |

A high-cardinality column can be useful as a partition key because it may provide many possible partition values.

However, high cardinality alone does not guarantee good distribution.

The actual frequency of each key matters.

### 4.4 Bad Partition-Key Example: Device Type

Suppose you use:

```sql
CREATE TABLE events_by_device (
    device TEXT,
    event_time TIMESTAMP,
    event_type TEXT,
    PRIMARY KEY (device, event_time)
);
```

Possible partition keys:

```text
Android
iPhone
Windows
```

If most application users use Android, the Android partition may receive a disproportionate amount of traffic.

This creates an imbalance.

### 4.5 Better Partition-Key Example

A user identifier may provide more partition values:

```sql
PRIMARY KEY (user_id, event_time)
```

This can distribute data across many user partitions.

But there is an important caveat.

If one user generates an enormous number of events, that user's partition can still become very large or hot.

Therefore, partition-key selection must consider both data distribution and access patterns.

---

## 5. Clustering-Key Design

Clustering columns determine how rows are ordered within a Cassandra partition.

They are also important for supporting range queries.

Consider:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    PRIMARY KEY (user_id, event_time, event_id)
);
```

Here:

- Partition key: `user_id`.
- First clustering column: `event_time`.
- Second clustering column: `event_id`.

### 5.1 How Does It Work?

Suppose the partition contains:

```text
Partition: user_101

2026-11-14 09:00 -> event_001
2026-11-14 10:00 -> event_002
2026-11-14 11:00 -> event_003
2026-11-14 12:00 -> event_004
```

The rows are organized according to the clustering columns.

This makes queries such as the following natural:

```sql
SELECT *
FROM user_events
WHERE user_id = 101
AND event_time >= '2026-11-14T09:00:00Z'
AND event_time < '2026-11-14T12:00:00Z';
```

### 5.2 Clustering Order

By default, Cassandra uses ascending clustering order unless configured otherwise.

You can specify descending order:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    PRIMARY KEY (user_id, event_time, event_id)
)
WITH CLUSTERING ORDER BY (
    event_time DESC,
    event_id ASC
);
```

Now the rows are organized with the newest timestamps first within each partition.

This is useful for applications that frequently retrieve recent events.

### 5.3 Multiple Clustering Columns

Consider:

```sql
PRIMARY KEY (
    (campaign_id, event_date),
    event_time,
    event_id
)
```

Here:

- `campaign_id` and `event_date` form a composite partition key.
- `event_time` and `event_id` are clustering columns.

The logical structure is:

```text
Partition Key:
    campaign_id + event_date

Clustering Columns:
    event_time
    event_id
```

The clustering columns establish ordering inside the partition.

### 5.4 Why Is Clustering Important?

It helps Cassandra retrieve data efficiently within a partition.

It also supports queries using clustering-column restrictions, such as time ranges.

However, clustering columns do not make arbitrary filtering free.

The query must still respect the primary-key structure and its ordering rules.

---

## 6. Composite Keys

A composite key is a key made from multiple columns.

In Cassandra, understanding the difference between a composite partition key and a primary key containing multiple columns is essential.

### 6.1 Composite Partition Key

Example:

```sql
CREATE TABLE events (
    country TEXT,
    campaign_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    PRIMARY KEY (
        (country, campaign_id),
        event_time
    )
);
```

Here:

```text
Partition Key:
    country
    campaign_id

Clustering Column:
    event_time
```

Both `country` and `campaign_id` participate in identifying the partition.

### 6.2 Composite Primary Key Without Composite Partition Key

Consider:

```sql
CREATE TABLE events (
    user_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    PRIMARY KEY (
        user_id,
        event_time,
        event_id
    )
);
```

Here:

```text
Partition Key:
    user_id

Clustering Columns:
    event_time
    event_id
```

The primary key contains multiple columns, but the partition key itself contains only one.

### 6.3 Comparison

| Primary-key declaration                                   | Partition key       | Clustering columns     |
| --------------------------------------------------------- | ------------------- | ---------------------- |
| `PRIMARY KEY (user_id)`                                   | `user_id`           | None                   |
| `PRIMARY KEY (user_id, event_time)`                       | `user_id`           | `event_time`           |
| `PRIMARY KEY ((country, user_id), event_time)`            | `country, user_id`  | `event_time`           |
| `PRIMARY KEY ((campaign_id, date), event_time, event_id)` | `campaign_id, date` | `event_time, event_id` |

### Remember

In Cassandra:

- Parentheses around multiple columns inside the primary-key declaration identify a composite partition key.
- Columns following the partition-key definition are clustering columns.

---

## 7. Time-Series Data Modeling

Wide-column databases are frequently used for time-series workloads.

Examples include:

- Server metrics.
- IoT readings.
- Application logs.
- User activity events.
- Device telemetry.
- Sensor measurements.

Time-series workloads have a particular challenge: data keeps accumulating.

A partition that is reasonable today may become enormous after months or years.

### 7.1 A Simple Time-Series Table

Suppose an IoT platform collects temperature readings.

Each record contains:

```javascript
{
    deviceId: "device_101",
    timestamp: "2026-11-14T10:30:00Z",
    temperature: 29.5
}
```

A simple Cassandra table:

```sql
CREATE TABLE sensor_readings (
    device_id TEXT,
    reading_time TIMESTAMP,
    temperature DOUBLE,
    PRIMARY KEY (device_id, reading_time)
);
```

This organizes readings by device.

However, if a device continuously sends data for years, its partition can grow significantly.

### 7.2 The Problem With Unbounded Partitions

Suppose one device sends a reading every second.

That means:

```text
60 readings per minute
3,600 readings per hour
86,400 readings per day
2,592,000 readings in 30 days
```

A partition that stores all readings for that device forever can become too large.

Large partitions can increase:

- Read latency.
- Memory requirements.
- Compaction work.
- Repair and streaming costs.
- Operational complexity.

### 7.3 Time Bucketing

A common solution is to include a time bucket in the partition key.

For example:

```sql
CREATE TABLE sensor_readings_by_day (
    device_id TEXT,
    reading_date DATE,
    reading_time TIMESTAMP,
    temperature DOUBLE,
    PRIMARY KEY (
        (device_id, reading_date),
        reading_time
    )
);
```

Now each device gets a separate partition for each day.

Conceptually:

```text
Partition: device_101 + 2026-11-14
--------------------------------
10:00 -> 28.5
10:01 -> 28.7
10:02 -> 29.0


Partition: device_101 + 2026-11-15
--------------------------------
10:00 -> 29.1
10:01 -> 28.9
10:02 -> 28.6
```

Instead of allowing one partition to grow indefinitely, the application creates new partitions for new time buckets.

### 7.4 Choosing the Bucket Size

Possible bucket sizes:

| Bucket  | When it might be appropriate  |
| ------- | ----------------------------- |
| Hourly  | Extremely high event volume   |
| Daily   | Moderate to high event volume |
| Weekly  | Lower event volume            |
| Monthly | Relatively low event volume   |

There is no universally correct bucket size.

The decision depends on:

- Events per second.
- Expected retention.
- Average record size.
- Query time ranges.
- Partition-size limits and operational targets.

### 7.5 Querying a Time Bucket

```sql
SELECT *
FROM sensor_readings_by_day
WHERE device_id = 'device_101'
AND reading_date = '2026-11-14'
AND reading_time >= '2026-11-14T10:00:00Z'
AND reading_time < '2026-11-14T11:00:00Z';
```

The query provides the complete partition key and a clustering-column range.

### 7.6 What If the Query Spans Multiple Days?

Suppose the application needs readings from November 12 through November 15.

The data is stored in separate daily partitions.

The application can query the required daily partitions and combine the results.

This is an intentional tradeoff.

A smaller partition improves manageability, but a query covering many buckets may require multiple partition reads.

### 7.7 Time-Series Modeling Diagram

```text
Device: device_101

       2026-11-14
             |
             v
       Daily Partition A
             |
       2026-11-15
             |
             v
       Daily Partition B
             |
       2026-11-16
             |
             v
       Daily Partition C
```

The partition key controls distribution, while the timestamp clustering column orders readings within each time bucket.

---

## 8. Denormalization and Duplicate Tables

Denormalization is a central part of Cassandra data modeling.

It means storing duplicate information to make important queries efficient.

### 8.1 Why Is Denormalization Needed?

In PostgreSQL, you can normalize data and retrieve related records using JOINs.

In Cassandra, arbitrary JOINs are not part of the normal query model.

Therefore, the same logical information may be stored in different tables.

### 8.2 Example: Campaign Events

Suppose you need:

1. Get events by user.
2. Get events by campaign.
3. Get an event by ID.

You can create:

```sql
CREATE TABLE events_by_user (
    user_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    campaign_id UUID,
    event_type TEXT,
    PRIMARY KEY (user_id, event_time, event_id)
);
```

```sql
CREATE TABLE events_by_campaign (
    campaign_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    user_id UUID,
    event_type TEXT,
    PRIMARY KEY (campaign_id, event_time, event_id)
);
```

```sql
CREATE TABLE event_by_id (
    event_id UUID PRIMARY KEY,
    user_id UUID,
    campaign_id UUID,
    event_time TIMESTAMP,
    event_type TEXT
);
```

The same event is written to multiple tables.

### 8.3 Write Duplication

Suppose an event arrives.

The application may execute:

```sql
INSERT INTO events_by_user (...);

INSERT INTO events_by_campaign (...);

INSERT INTO event_by_id (...);
```

The event is stored three times in different table layouts.

This improves the ability to retrieve the event through different access patterns.

### 8.4 Benefits of Denormalization

- Avoids relational JOIN requirements.
- Supports predictable query patterns.
- Makes reads more direct.
- Allows different tables to optimize different access patterns.
- Supports distributed query execution.

### 8.5 Costs of Denormalization

- More storage consumption.
- More write operations.
- More complicated updates.
- Potential inconsistency between tables.
- Additional application logic.
- More complicated failure recovery.

### 8.6 The Dual-Write Problem

Consider the following process:

```text
Insert Event
     |
     v
Write to events_by_user
     |
     v
Write to events_by_campaign
     |
     v
Write to event_by_id
```

What happens if the first two writes succeed but the third fails?

Now the event exists in two tables but not the third.

This creates an application-level consistency problem.

Possible approaches include:

- Retry failed writes.
- Make writes idempotent.
- Use an outbox or durable event-processing workflow.
- Track processing status.
- Reconcile data periodically.

Cassandra offers lightweight transactions for certain conditional operations, but they should not be treated as a universal replacement for relational multi-table transactions.

### Important principle

Denormalization improves read patterns but shifts some consistency and coordination responsibilities to the application.

---

## 9. Partition Sizing

Partition sizing is one of the most important operational considerations in Cassandra.

A partition is a logical grouping of rows that Cassandra distributes as a unit.

A poorly designed partition can become a bottleneck.

### 9.1 What Is a Large Partition?

Consider:

```sql
CREATE TABLE events_by_campaign (
    campaign_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    PRIMARY KEY (campaign_id, event_time, event_id)
);
```

Suppose one campaign receives 50 million events.

All events use the same `campaign_id`.

Therefore, they belong to the same partition.

This may create an extremely large partition.

### 9.2 Why Are Large Partitions Problematic?

Large partitions can cause:

1. Increased read latency.
2. Higher memory pressure.
3. More expensive compaction.
4. Increased repair and streaming costs.
5. Uneven workload distribution.
6. Operational difficulties.

### 9.3 Estimate Partition Size

A rough estimate:

\[
\text{Partition Size}
\approx
\text{Number of Rows}
\times
\text{Average Row Size}
\]

Example:

- Number of rows: 100,000.
- Average row size: 500 bytes.

\[
100,000 \times 500 = 50,000,000
\]

That is approximately 50 MB of raw row data.

This is only a rough estimate. Actual storage requirements depend on cell metadata, keys, indexes, compression, and other storage overhead.

### 9.4 How to Control Partition Size

Common approaches:

- Introduce time buckets.
- Use more appropriate partition keys.
- Avoid grouping unlimited data under one key.
- Estimate expected records per partition.
- Monitor actual partition sizes.
- Consider expected growth, not only current data volume.

### Important

Do not choose a partition key only because it makes a query convenient.

You must also consider how much data and traffic that partition will receive.

---

## 10. Hotspot Prevention

A hotspot occurs when a small number of partitions or nodes receive a disproportionate share of traffic.

Even a large Cassandra cluster can perform poorly if the workload is concentrated.

### 10.1 Example: Sequential Partition Keys

Suppose a system uses an increasing integer as its partition key:

```text
1
2
3
4
5
6
7
...
```

Depending on the partitioner and token distribution, sequential numeric values are not inherently guaranteed to cause a hotspot in Cassandra.

However, monotonic values and poor partition-key designs can still create undesirable distribution or concentrated write patterns.

The more important question is whether the key distributes data and requests evenly.

### 10.2 Example: Popular Campaign

Suppose a platform has:

```text
Campaign A -> 90% of events
Campaign B -> 5% of events
Campaign C -> 5% of events
```

If `campaign_id` is the only partition key, Campaign A may become a hotspot.

### 10.3 Introduce a Time Bucket

One possible design:

```sql
CREATE TABLE events_by_campaign_day (
    campaign_id UUID,
    event_date DATE,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    PRIMARY KEY (
        (campaign_id, event_date),
        event_time,
        event_id
    )
);
```

Now the same campaign has multiple partitions over time.

### 10.4 Introduce a Shard Bucket

For extremely high-volume workloads, you may introduce an additional bucket:

```sql
CREATE TABLE events_by_campaign_bucket (
    campaign_id UUID,
    event_date DATE,
    bucket INT,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    PRIMARY KEY (
        (campaign_id, event_date, bucket),
        event_time,
        event_id
    )
);
```

The application assigns each event to a bucket.

For example:

```text
Campaign 501
    |
    +-- Date: 2026-11-14
           |
           +-- Bucket 0
           +-- Bucket 1
           +-- Bucket 2
           +-- Bucket 3
```

This can distribute a popular campaign's data across multiple partitions.

The tradeoff is that a query covering all events for that campaign and date may need to read multiple buckets.

### 10.5 How Many Buckets Should You Use?

There is no universal number.

Consider:

- Event volume.
- Expected partition size.
- Write throughput.
- Query concurrency.
- Number of nodes.
- Read fan-out.

Too few buckets can preserve hotspots.

Too many buckets can make reads unnecessarily expensive.

---

## 11. Query Restrictions and Data Modeling

Cassandra's query restrictions are closely related to its primary-key design.

You should understand what kinds of queries naturally work.

Consider:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_time TIMESTAMP,
    event_id UUID,
    campaign_id UUID,
    event_type TEXT,
    PRIMARY KEY (user_id, event_time, event_id)
);
```

### 11.1 Query by Partition Key

```sql
SELECT *
FROM user_events
WHERE user_id = 101;
```

This is aligned with the partition key.

### 11.2 Query by Partition Key and Clustering Range

```sql
SELECT *
FROM user_events
WHERE user_id = 101
AND event_time >= '2026-11-14T00:00:00Z'
AND event_time < '2026-11-15T00:00:00Z';
```

This is also aligned with the table design.

### 11.3 Query by Clustering Column Without Partition Key

```sql
SELECT *
FROM user_events
WHERE event_time = '2026-11-14T10:00:00Z';
```

This does not provide the partition key.

Cassandra cannot directly locate the relevant partition through the normal partition-key lookup path.

### 11.4 Query by a Regular Column

```sql
SELECT *
FROM user_events
WHERE campaign_id = 501;
```

`campaign_id` is not part of the primary key.

This query is not naturally supported as an efficient partition-key query.

You should generally create another table designed for this access pattern.

### 11.5 Why Does This Restriction Exist?

Cassandra distributes partitions across a cluster.

When a query supplies the partition key, Cassandra can determine which replicas are responsible for the relevant data.

Without a suitable partition key, the database may need to inspect many nodes or partitions.

That is why query-driven modeling is so important.

---

## 12. Practical Design: E-Commerce Application

Let's design a simplified Cassandra data model for an e-commerce application.

### Requirements

The application needs:

1. Get all orders for a user.
2. Get an order by ID.
3. Get recent orders for a user.
4. Get orders for a particular product.

### Table 1: Orders by User

```sql
CREATE TABLE orders_by_user (
    user_id UUID,
    order_time TIMESTAMP,
    order_id UUID,
    amount DECIMAL,
    status TEXT,
    PRIMARY KEY (user_id, order_time, order_id)
)
WITH CLUSTERING ORDER BY (
    order_time DESC,
    order_id ASC
);
```

Supports:

- Retrieving a user's orders.
- Retrieving recent orders.
- Retrieving orders within a time range.

### Table 2: Order by ID

```sql
CREATE TABLE order_by_id (
    order_id UUID PRIMARY KEY,
    user_id UUID,
    order_time TIMESTAMP,
    amount DECIMAL,
    status TEXT
);
```

Supports:

- Retrieving one order using its ID.

### Table 3: Orders by Product

```sql
CREATE TABLE orders_by_product (
    product_id UUID,
    order_time TIMESTAMP,
    order_id UUID,
    user_id UUID,
    quantity INT,
    PRIMARY KEY (product_id, order_time, order_id)
);
```

Supports:

- Retrieving orders containing a particular product.
- Retrieving product-related orders over a time range.

### Data Flow

```text
             New Order
                 |
                 v
          Application Logic
                 |
        +--------+--------+
        |        |        |
        v        v        v
    Orders   Order by   Orders by
    by User     ID       Product
```

This model stores overlapping data in multiple tables.

The application must manage the writes and account for partial failures.

---

## 13. Practical Design: User Activity Platform

Consider a platform with millions of users.

Each user can generate:

- Login events.
- Page views.
- Product clicks.
- Purchases.
- Campaign interactions.

### Query Requirements

| Query | Description                                 |
| ----- | ------------------------------------------- |
| Q1    | Get a user's recent activity                |
| Q2    | Get activity for a user on a particular day |
| Q3    | Get activity for a campaign                 |
| Q4    | Get the details of an individual event      |

### Possible Data Model

**Table 1 — Activity by user and day**

```sql
CREATE TABLE activity_by_user_day (
    user_id UUID,
    activity_date DATE,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    campaign_id UUID,
    device TEXT,
    PRIMARY KEY (
        (user_id, activity_date),
        event_time,
        event_id
    )
)
WITH CLUSTERING ORDER BY (
    event_time DESC,
    event_id ASC
);
```

**Table 2 — Activity by campaign and day**

```sql
CREATE TABLE activity_by_campaign_day (
    campaign_id UUID,
    activity_date DATE,
    event_time TIMESTAMP,
    event_id UUID,
    user_id UUID,
    event_type TEXT,
    device TEXT,
    PRIMARY KEY (
        (campaign_id, activity_date),
        event_time,
        event_id
    )
)
WITH CLUSTERING ORDER BY (
    event_time DESC,
    event_id ASC
);
```

**Table 3 — Activity by event ID**

```sql
CREATE TABLE activity_by_event_id (
    event_id UUID PRIMARY KEY,
    user_id UUID,
    campaign_id UUID,
    event_time TIMESTAMP,
    event_type TEXT,
    device TEXT
);
```

### Why This Design?

- User activity is grouped by user and day.
- Campaign activity is grouped by campaign and day.
- Individual events can be retrieved by event ID.
- Time bucketing prevents unbounded daily partitions from growing forever.
- Duplicate data supports different query patterns.

### What Could Still Go Wrong?

Suppose one campaign receives extremely high traffic.

Even a daily partition may become too large.

You may need an additional bucket:

```text
(campaign_id, activity_date, bucket)
```

This is why data modeling requires estimating actual workload volume.

---

## 14. Common Data Modeling Mistakes

| Mistake                                                     | Why it is problematic                                    |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Converting relational tables directly into Cassandra tables | Ignores query-driven design                              |
| Choosing a low-cardinality partition key                    | Can create uneven data distribution                      |
| Creating unlimited partitions                               | Can create excessive metadata and operational overhead   |
| Creating extremely large partitions                         | Can increase read, compaction, and repair costs          |
| Ignoring hot partitions                                     | Can overload a subset of the cluster                     |
| Avoiding denormalization entirely                           | Can make important queries difficult or inefficient      |
| Duplicating data without a consistency strategy             | Can create inconsistent query results                    |
| Designing only for current data volume                      | Partitions may become too large as the application grows |
| Using `ALLOW FILTERING` as a general solution               | Can lead to expensive scans                              |
| Ignoring query fan-out                                      | Queries across many partitions can become expensive      |

### A particularly important mistake: Designing for one query only

Suppose your table supports:

```text
Get events by user
```

But the application also needs:

```text
Get events by campaign
```

If you ignore the second query, you may later need a major schema redesign.

Before building the schema, identify the application's important access patterns.

---

## 15. Cassandra Data Modeling vs PostgreSQL Data Modeling

| Area                | PostgreSQL                                           | Cassandra                                                        |
| ------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| Starting point      | Entities and relationships                           | Application queries                                              |
| Normalization       | Common design principle                              | Denormalization is common                                        |
| Relationships       | Foreign keys                                         | Usually represented through duplicated data or application logic |
| JOINs               | Supported                                            | Not part of the normal query model                               |
| Primary key         | Identifies rows and enforces uniqueness              | Defines partitioning and clustering structure                    |
| Partitioning        | Table partitioning and other distribution approaches | Partition key is central to data distribution                    |
| Query flexibility   | Broad SQL query support                              | Queries constrained by table design                              |
| Data duplication    | Often minimized                                      | Often intentional                                                |
| Main design concern | Integrity and efficient relational queries           | Distribution, partition size, and query efficiency               |

### Mental Model

For PostgreSQL:

```text
Entities
   |
   v
Relationships
   |
   v
Normalized Tables
   |
   v
JOIN Queries
```

For Cassandra:

```text
Application Queries
        |
        v
  Partition Keys
        |
        v
  Clustering Keys
        |
        v
  Query-Specific Tables
        |
        v
    Distributed Reads
```

Neither approach is universally superior.

They solve different data-access problems.

---

## 16. Interview Questions

### Q1. What is query-driven data modeling?

It is the practice of designing Cassandra tables based on the application's expected queries and access patterns.

### Q2. Why is Cassandra data modeling different from relational modeling?

Cassandra is designed around distributed partition-based access rather than arbitrary relational queries and JOINs.

### Q3. What makes a good partition key?

A partition key should support important queries, distribute data and traffic reasonably evenly, and avoid excessively large or hot partitions.

### Q4. What is a clustering column?

A clustering column determines how rows are ordered within a Cassandra partition and supports suitable range queries.

### Q5. What is a composite partition key?

A partition key formed from multiple columns.

Example:

```sql
PRIMARY KEY ((country, user_id), event_time)
```

Here, `country` and `user_id` together form the partition key.

### Q6. Why does Cassandra encourage denormalization?

Because query-specific tables allow data to be retrieved efficiently without relying on arbitrary JOINs.

### Q7. What is time bucketing?

Dividing time-series records into separate time-based partitions, such as hourly, daily, or monthly partitions.

### Q8. What is a hot partition?

A partition receiving a disproportionate amount of traffic compared with other partitions.

### Q9. How can you prevent large partitions?

Use suitable partition keys, time buckets, and additional buckets where necessary. Estimate expected records and monitor partition sizes.

### Q10. Why might you create multiple tables for the same data?

Different queries may require different partition keys and clustering orders.

### Q11. What is the disadvantage of denormalization?

It increases storage and write operations and creates additional data consistency responsibilities.

### Q12. Can Cassandra efficiently query any column?

No. Efficient queries should generally align with the partition key and clustering-column design.

### Q13. What happens if you choose a low-cardinality partition key?

It may create uneven data distribution and concentrate traffic on a small number of partitions.

### Q14. Why is partition size important?

Large partitions can increase read latency, memory pressure, compaction costs, repair costs, and operational complexity.

### Q15. What is the difference between a composite primary key and a composite partition key?

A composite primary key can contain a partition key and clustering columns. A composite partition key specifically means that multiple columns together identify the partition.

---

## 17. Practical Exercises

### Exercise 1 — Design a User Activity Table

Requirements:

- Retrieve activity for a user.
- Retrieve activity for a user on a particular date.
- Retrieve the latest events first.

Design the partition key and clustering columns.

**Suggested direction:**

```text
Partition Key:
    user_id + activity_date

Clustering Column:
    event_time
```

### Exercise 2 — Design a Campaign Analytics Table

Requirements:

- Retrieve events by campaign.
- Retrieve events within a time range.
- Campaigns can receive millions of events.

Think about:

- Campaign ID.
- Time bucket.
- Additional bucket for very popular campaigns.
- Clustering order.

### Exercise 3 — Identify the Problem

Consider:

```sql
CREATE TABLE events (
    device_type TEXT,
    event_time TIMESTAMP,
    event_type TEXT,
    PRIMARY KEY (device_type, event_time)
);
```

Questions:

1. What is the partition key?
2. Why might this partition key be problematic?
3. What happens if most users use Android?
4. How could you redesign the table?

### Exercise 4 — Design Duplicate Tables

Your application needs:

1. Orders by user.
2. Orders by product.
3. Order by ID.

Design three Cassandra tables.

Explain why one table is not sufficient for all three access patterns.

### Exercise 5 — Estimate Partition Size

Suppose:

- A device sends 20 readings per second.
- Average stored row size is approximately 300 bytes.
- You store data in daily partitions.

Estimate the raw row-data size of one daily partition.

\[
20 \times 60 \times 60 \times 24 \times 300
\]

Then consider whether a daily bucket is appropriate or whether you need hourly buckets.

Remember that actual disk usage includes additional storage overhead.

---

## 18. Chapter Summary

| Concept                 | Key takeaway                                               |
| ----------------------- | ---------------------------------------------------------- |
| Query-driven modeling   | Design tables around application queries                   |
| Partition key           | Determines partition membership and data distribution      |
| Clustering columns      | Determine row ordering within a partition                  |
| Composite partition key | Uses multiple columns to identify a partition              |
| Denormalization         | Stores duplicate data to support different access patterns |
| Time bucketing          | Splits time-series data into manageable partitions         |
| Partition sizing        | Controls the amount of data stored in a partition          |
| Hot partition           | A partition receiving disproportionate traffic             |
| Query-specific tables   | Separate tables support different retrieval patterns       |
| Data consistency        | Duplicate tables require careful write coordination        |

### The most important principles

1. Start with application queries, not relational entities.
2. Choose partition keys carefully.
3. Use clustering columns to support ordering and range queries.
4. Avoid unbounded partitions.
5. Use time buckets for growing time-series workloads.
6. Denormalize when different queries require different table layouts.
7. Account for consistency when writing duplicate data.
8. Monitor hotspots and partition sizes.
9. Do not rely on arbitrary filtering as a substitute for good data modeling.

### One mental model to remember

```text
                  QUERIES
                     |
                     v
               ACCESS PATTERNS
                     |
                     v
                PARTITION KEY
                     |
                     v
               CLUSTERING KEYS
                     |
                     v
              TABLE DESIGN
                     |
                     v
             DATA DISTRIBUTION
                     |
                     v
             EFFICIENT QUERIES
```
