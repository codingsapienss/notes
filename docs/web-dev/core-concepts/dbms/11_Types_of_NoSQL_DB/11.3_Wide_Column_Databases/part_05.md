---
sidebar_label: Wide-Column Databases: Real-World Use Cases
sidebar_position: 1
---

# Wide-Column Databases: Real-World Use Cases

## 1. Introduction

Let's understand **where wide-column databases are used in real-world applications and why engineering teams choose them**.

Understanding a database's architecture is useful, but understanding the problems it solves is more important when designing backend systems.

### Topics covered

1. Large-scale event logging.
2. Time-series workloads.
3. IoT and telemetry systems.
4. User activity feeds.
5. Messaging and tracking workloads.
6. Real-world Cassandra use cases.
7. Cassandra vs HBase use cases.
8. Workload selection.
9. When wide-column databases are appropriate.
10. When they are not appropriate.

---

## 2. Use Case 1 — Large-Scale Event Logging

Event logging is one of the common workloads for wide-column databases.

Modern applications continuously generate events.

Examples:

- User login.
- Product views.
- Button clicks.
- Purchases.
- Search activity.
- Campaign interactions.
- Application errors.

Consider an application receiving millions of events every day.

Each event contains:

```javascript
{
    eventId: "evt_1001",
    userId: "user_101",
    eventType: "product_view",
    campaignId: "campaign_501",
    device: "Android",
    timestamp: "2026-11-14T10:30:00Z"
}
```

### 2.1 Why Use Cassandra?

A large event-logging system may require:

- High write throughput.
- Distributed storage.
- Horizontal scalability.
- High availability.
- Time-based retrieval.
- Predictable access patterns.

Cassandra can distribute event data across multiple nodes using partition keys.

### 2.2 Example Data Model

Suppose the application frequently retrieves events for a particular user on a particular day.

```sql
CREATE TABLE events_by_user_day (
    user_id TEXT,
    event_date DATE,
    event_time TIMESTAMP,
    event_id UUID,
    event_type TEXT,
    campaign_id TEXT,
    device TEXT,
    PRIMARY KEY (
        (user_id, event_date),
        event_time,
        event_id
    )
)
WITH CLUSTERING ORDER BY (
    event_time DESC,
    event_id ASC
);
```

Here:

- `user_id` and `event_date` form the partition key.
- `event_time` and `event_id` are clustering columns.

### 2.3 Query Example

Retrieve a user's events for a particular day:

```sql
SELECT *
FROM events_by_user_day
WHERE user_id = 'user_101'
AND event_date = '2026-11-14';
```

Retrieve events within a time range:

```sql
SELECT *
FROM events_by_user_day
WHERE user_id = 'user_101'
AND event_date = '2026-11-14'
AND event_time >= '2026-11-14T10:00:00Z'
AND event_time < '2026-11-14T12:00:00Z';
```

### 2.4 Architecture

```text
             User Activity
                   |
                   v
             Backend API
                   |
                   v
              Event Service
                   |
                   v
             Cassandra Cluster
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
```

### 2.5 Important Design Consideration

Event logging and analytics are not exactly the same workload.

Cassandra can be useful for storing large volumes of events and retrieving them through known access patterns.

However, complex analytical queries such as:

- Group all events by city.
- Calculate conversion rates across every campaign.
- Compare daily activity across thousands of dimensions.

may be better handled by an analytical database or data warehouse.

A common architecture stores events in Cassandra or another operational event store and sends them to an analytical system for reporting.

---

## 3. Use Case 2 — Time-Series Data

Time-series data consists of measurements or events associated with timestamps.

Examples:

- CPU utilization.
- Memory usage.
- Network traffic.
- Temperature readings.
- Server response times.
- Financial market observations.
- Application metrics.

### 3.1 Example Scenario

Imagine a monitoring platform managing 10,000 servers.

Every server reports:

```javascript
{
    serverId: "server_101",
    timestamp: "2026-11-14T10:30:00Z",
    cpuUsage: 72.5,
    memoryUsage: 68.2,
    diskUsage: 55.1
}
```

If every server sends one measurement every five seconds, the system receives:

\[
10,000 \times \frac{60}{5} \times 60 \times 24
\]

<text> </text>

\[
= 172,800,000 \text{ measurements per day}
\]

This is a substantial write workload.

### 3.2 Why Use Cassandra?

Cassandra can be useful because:

- Data can be distributed across nodes.
- Writes can be handled across multiple replicas.
- Partition keys can organize measurements by server and time bucket.
- Clustering columns can organize records chronologically.
- Time-window compaction can be useful for time-oriented data.

### 3.3 Example Data Model

```sql
CREATE TABLE server_metrics (
    server_id TEXT,
    metric_date DATE,
    metric_time TIMESTAMP,
    cpu_usage DOUBLE,
    memory_usage DOUBLE,
    disk_usage DOUBLE,
    PRIMARY KEY (
        (server_id, metric_date),
        metric_time
    )
)
WITH CLUSTERING ORDER BY (
    metric_time DESC
);
```

### 3.4 Query Example

Retrieve metrics for a server:

```sql
SELECT *
FROM server_metrics
WHERE server_id = 'server_101'
AND metric_date = '2026-11-14';
```

Retrieve metrics for a time range:

```sql
SELECT *
FROM server_metrics
WHERE server_id = 'server_101'
AND metric_date = '2026-11-14'
AND metric_time >= '2026-11-14T10:00:00Z'
AND metric_time < '2026-11-14T11:00:00Z';
```

### 3.5 Data Retention

Time-series systems frequently have retention requirements.

For example:

```text
Raw metrics:
    Retain for 30 days

Aggregated hourly metrics:
    Retain for 6 months

Daily summaries:
    Retain for 2 years
```

Cassandra supports data expiration through TTL (Time To Live).

Example:

```sql
INSERT INTO server_metrics (
    server_id,
    metric_date,
    metric_time,
    cpu_usage,
    memory_usage,
    disk_usage
)
VALUES (
    'server_101',
    '2026-11-14',
    '2026-11-14T10:30:00Z',
    72.5,
    68.2,
    55.1
)
USING TTL 2592000;
```

Here:

```text
2592000 seconds = 30 days
```

After the TTL expires, Cassandra treats the expired data as deleted and uses tombstone-related mechanisms to handle its removal.

Physical storage cleanup happens later through compaction.

### 3.6 When Is Cassandra Suitable?

Cassandra can be suitable for time-series workloads when:

- Write volume is high.
- Data is distributed across many devices or entities.
- Queries are predictable.
- Time-based partitioning is appropriate.
- Horizontal scalability is important.

For highly specialized time-series workloads, databases such as TimescaleDB or InfluxDB may also be appropriate.

The choice depends on ingestion patterns, queries, retention, and analytical requirements.

---

## 4. Use Case 3 — IoT and Telemetry Systems

IoT stands for **Internet of Things**.

It refers to physical devices connected to networks that collect and transmit data.

Examples:

- Smart electricity meters.
- Industrial machines.
- Vehicle tracking devices.
- Smart home sensors.
- Weather stations.
- Agricultural sensors.

### 4.1 Example Scenario

Imagine a company managing 500,000 IoT sensors.

Each sensor sends readings:

```javascript
{
    sensorId: "sensor_101",
    timestamp: "2026-11-14T10:30:00Z",
    temperature: 28.5,
    humidity: 65.2,
    batteryLevel: 82
}
```

If every sensor sends one reading per minute:

\[
500,000 \times 60 \times 24
\]

\[
= 720,000,000 \text{ readings per day}
\]

The system needs to handle a very large volume of incoming data.

### 4.2 Architecture

```text
         IoT Devices
              |
              v
        MQTT / HTTP
              |
              v
         Ingestion Layer
              |
              v
       Message Broker
              |
              v
        Event Consumers
              |
              v
        Cassandra Cluster
              |
       +------+------+
       |      |      |
       v      v      v
     Node A Node B Node C
```

The message broker is optional but common in larger architectures.

It can decouple device ingestion from database writes.

Examples of message brokers include Kafka and MQTT-based infrastructure.

### 4.3 Why Cassandra?

Cassandra may be useful because:

- It can distribute incoming writes.
- It supports partition-based data access.
- It provides replication.
- It supports high availability.
- It can store large volumes of telemetry records.

### 4.4 Data Modeling

A possible design:

```sql
CREATE TABLE sensor_readings (
    sensor_id TEXT,
    reading_date DATE,
    reading_time TIMESTAMP,
    temperature DOUBLE,
    humidity DOUBLE,
    battery_level INT,
    PRIMARY KEY (
        (sensor_id, reading_date),
        reading_time
    )
);
```

This organizes readings by sensor and day.

However, if a sensor generates extremely high-frequency readings, a smaller time bucket may be needed.

### 4.5 Important Challenges

An IoT platform must consider:

1. Devices sending duplicate events.
2. Devices reconnecting after network failures.
3. Delayed and out-of-order events.
4. High-volume ingestion spikes.
5. Data retention.
6. Hot partitions.
7. Backpressure in ingestion pipelines.

Cassandra is only one part of the architecture. The ingestion system and application-level processing are equally important.

---

## 5. Use Case 4 — User Activity Feeds

Social applications and content platforms generate large amounts of user activity.

Examples:

- User publishes a post.
- User likes a post.
- User comments.
- User follows someone.
- User shares content.

A platform may need to retrieve recent activities quickly.

### 5.1 Example Scenario

Imagine a social platform with 10 million users.

The system records:

```javascript
{
    userId: "user_101",
    activityId: "activity_1001",
    activityType: "liked_post",
    targetId: "post_501",
    timestamp: "2026-11-14T10:30:00Z"
}
```

The application needs:

- Recent activity for a user.
- Activities of followed users.
- Activity history for a particular post.

These are different access patterns.

### 5.2 Data Model: Activity by User

```sql
CREATE TABLE activity_by_user (
    user_id TEXT,
    activity_time TIMESTAMP,
    activity_id UUID,
    activity_type TEXT,
    target_id TEXT,
    PRIMARY KEY (user_id, activity_time, activity_id)
)
WITH CLUSTERING ORDER BY (
    activity_time DESC,
    activity_id ASC
);
```

Query:

```sql
SELECT *
FROM activity_by_user
WHERE user_id = 'user_101';
```

This retrieves a user's activities in descending time order.

### 5.3 Data Model: Activity by Post

```sql
CREATE TABLE activity_by_post (
    post_id TEXT,
    activity_time TIMESTAMP,
    activity_id UUID,
    user_id TEXT,
    activity_type TEXT,
    PRIMARY KEY (post_id, activity_time, activity_id)
);
```

Now the application can retrieve activity associated with a particular post.

### 5.4 Why Duplicate Data?

The user-centric table and post-centric table support different queries.

Cassandra does not automatically join these tables.

The application writes the required data into both table layouts.

### 5.5 Important Design Consideration: Feed Generation

A user activity feed can be generated in different ways.

**Fan-out on write:**

When a user publishes something, the system distributes that activity into followers' feed records.

```text
User A publishes post
        |
        v
Find followers
        |
        v
Write feed entries
        |
        v
Followers retrieve their feeds
```

This makes feed reads faster but can generate many writes.

**Fan-out on read:**

When a user opens their feed, the system fetches activities from followed users and combines them.

```text
User opens feed
        |
        v
Find followed users
        |
        v
Fetch their activities
        |
        v
Merge and sort
        |
        v
Return feed
```

This reduces write amplification but can make reads more expensive.

Large platforms often use hybrid approaches.

Cassandra can store feed data, but the complete feed architecture also involves caching, ranking, fan-out, and application-level aggregation.

---

## 6. Use Case 5 — Messaging and Communication Systems

Messaging systems generate large numbers of messages and delivery events.

Examples:

- Chat messages.
- Message delivery status.
- Read receipts.
- Notifications.
- User presence events.

### 6.1 Example Scenario

Imagine a messaging platform with millions of users.

A message may look like:

```javascript
{
    conversationId: "conversation_101",
    messageId: "message_1001",
    senderId: "user_101",
    message: "Hello",
    timestamp: "2026-11-14T10:30:00Z"
}
```

The application needs to:

1. Retrieve messages in a conversation.
2. Retrieve recent messages.
3. Track message delivery.
4. Retrieve messages using an identifier.

### 6.2 Example Data Model

```sql
CREATE TABLE messages_by_conversation (
    conversation_id TEXT,
    message_time TIMESTAMP,
    message_id UUID,
    sender_id TEXT,
    message TEXT,
    PRIMARY KEY (
        conversation_id,
        message_time,
        message_id
    )
)
WITH CLUSTERING ORDER BY (
    message_time DESC,
    message_id ASC
);
```

### 6.3 Query Example

```sql
SELECT *
FROM messages_by_conversation
WHERE conversation_id = 'conversation_101';
```

This retrieves messages for a known conversation.

### 6.4 What About Delivery Status?

A separate table could be designed around message ID:

```sql
CREATE TABLE message_status_by_id (
    message_id UUID PRIMARY KEY,
    conversation_id TEXT,
    sender_id TEXT,
    delivery_status TEXT,
    updated_at TIMESTAMP
);
```

Different access patterns may require additional tables.

### 6.5 Important Considerations

Messaging systems require more than high write throughput.

They may need:

- Message ordering.
- Idempotent message processing.
- Delivery guarantees.
- Read receipts.
- Unread counts.
- Conversation membership.
- Retention policies.
- Per-conversation consistency.

Cassandra can be useful for message storage, but it does not automatically solve all messaging semantics.

For example, strict ordering across concurrent writers requires deliberate application and data-model design.

---

## 7. Use Case 6 — Tracking and Monitoring Systems

Tracking systems continuously record changes in application or infrastructure state.

Examples:

- Package tracking.
- Vehicle location tracking.
- User session tracking.
- Application request tracing.
- Server health monitoring.

### 7.1 Vehicle Tracking Example

A vehicle sends location updates:

```javascript
{
    vehicleId: "vehicle_101",
    latitude: 28.6139,
    longitude: 77.2090,
    timestamp: "2026-11-14T10:30:00Z"
}
```

The application may need:

- Latest location of a vehicle.
- Historical locations for a vehicle.
- Locations recorded during a time range.

### 7.2 Possible Data Model

```sql
CREATE TABLE vehicle_locations (
    vehicle_id TEXT,
    location_date DATE,
    location_time TIMESTAMP,
    latitude DOUBLE,
    longitude DOUBLE,
    PRIMARY KEY (
        (vehicle_id, location_date),
        location_time
    )
)
WITH CLUSTERING ORDER BY (
    location_time DESC
);
```

This supports historical location retrieval for a vehicle and day.

### 7.3 Important Limitation

Cassandra is not a specialized geospatial database.

Queries such as:

> Find every vehicle within a 500-meter radius of a particular coordinate.

require geospatial indexing or additional geospatial processing.

A database such as PostGIS may be more appropriate for complex geospatial queries.

Cassandra can still be used to store the time-series location history.

---

## 8. Real-World Cassandra Usage

Cassandra has been used in large-scale production systems.

Examples include:

### 8.1 Netflix

Netflix has publicly discussed using Cassandra for distributed data workloads.

The general architectural motivation includes:

- High availability.
- Distributed storage.
- Scalability.
- Handling large application workloads.

### 8.2 Instagram

Instagram has discussed Cassandra-related infrastructure and its use in large-scale data systems.

The important lesson is not that every social application should use Cassandra.

It is that Cassandra can be useful when the workload requires large-scale distributed storage and predictable access patterns.

### 8.3 Apple

Apple has publicly discussed Cassandra deployments at very large scale.

This illustrates Cassandra's ability to operate across substantial distributed infrastructure.

### 8.4 Important Lesson

Do not choose Cassandra simply because large technology companies use it.

Their requirements, engineering teams, traffic patterns, and infrastructure budgets may be very different from yours.

Choose a database based on your own workload.

---

## 9. Cassandra vs HBase: Use-Case Comparison

Both are wide-column databases, but they are suitable for different architectural environments.

| Requirement                  | Cassandra                                      | HBase                                     |
| ---------------------------- | ---------------------------------------------- | ----------------------------------------- |
| Peer-to-peer architecture    | Yes                                            | No                                        |
| Hadoop/HDFS integration      | Not required                                   | Central to traditional HBase architecture |
| Tunable consistency          | Yes                                            | Different consistency model               |
| Strong row-level consistency | Depends on Cassandra consistency configuration | Strong consistency for row operations     |
| High write workloads         | Suitable                                       | Suitable                                  |
| Large distributed datasets   | Suitable                                       | Suitable                                  |
| Query model                  | CQL                                            | HBase APIs and shell                      |
| Operational environment      | Cassandra cluster                              | HBase and Hadoop ecosystem                |

### Choose Cassandra when:

- You need peer-to-peer distributed architecture.
- High availability is important.
- You need tunable consistency.
- Your workload can be modeled around partition keys.
- You want to avoid dependence on an HDFS-based architecture.

### Choose HBase when:

- Your organization already operates a Hadoop ecosystem.
- HDFS integration is important.
- Your workload fits HBase's row-key and column-family model.
- You need HBase's consistency and storage characteristics.

Neither database is universally better.

---

## 10. Wide-Column Databases vs Other Database Types

Understanding when to choose Cassandra becomes easier when comparing it with other database categories.

| Requirement                         | Potentially suitable database    |
| ----------------------------------- | -------------------------------- |
| Relational business transactions    | PostgreSQL, MySQL                |
| Flexible nested documents           | MongoDB                          |
| Caching and key-value access        | Redis                            |
| Large distributed event storage     | Cassandra                        |
| Hadoop-oriented wide-column storage | HBase                            |
| Full-text search                    | Elasticsearch, OpenSearch        |
| Analytical columnar queries         | ClickHouse                       |
| Time-series workloads               | Cassandra, TimescaleDB, InfluxDB |
| Complex geospatial queries          | PostgreSQL with PostGIS          |
| Graph relationships                 | Neo4j                            |

These are starting points, not exclusive mappings. Several databases can support the same workload with different tradeoffs.

---

## 11. When Should You Choose a Wide-Column Database?

A wide-column database is worth evaluating when the application has several of these characteristics:

### Strong fit

1. Very high write throughput.
2. Large distributed datasets.
3. Horizontal scaling requirements.
4. High availability requirements.
5. Predictable query patterns.
6. Data can be partitioned effectively.
7. Reads can be designed around partition keys.
8. Denormalization is acceptable.

### Weak fit

1. Complex relational JOINs.
2. Highly dynamic ad hoc queries.
3. Complex transactional workflows.
4. Heavy reporting across arbitrary dimensions.
5. Strong relational constraints between many entities.
6. Queries that cannot be supported efficiently through the partition-key design.

### Example Decision

Suppose you are building an e-commerce application.

It has:

- Users.
- Products.
- Orders.
- Payments.
- Inventory.
- Campaign interactions.

Would you store everything in Cassandra?

Usually, that would be a poor default decision.

A possible architecture:

```text
                 E-commerce Application
                          |
             +------------+------------+
             |                         |
             v                         v
       PostgreSQL                  Cassandra
             |                         |
       Users, Orders,             User Events,
       Payments, Inventory        Activity Logs
             |                         |
             +------------+------------+
                          |
                          v
                    Analytics Pipeline
                          |
                          v
                   Analytical Database
```

PostgreSQL handles relational transactional data.

Cassandra handles large-scale event or activity workloads.

An analytical database handles complex reporting.

This is an example of **polyglot persistence**, which we will study in Part 19.

---

## 12. When Should You Avoid a Wide-Column Database?

Consider an application that needs:

```sql
SELECT
    users.name,
    orders.order_id,
    payments.payment_status
FROM users
JOIN orders
    ON users.user_id = orders.user_id
JOIN payments
    ON orders.order_id = payments.order_id
WHERE payments.payment_status = 'FAILED';
```

This is a relational query involving multiple entities.

A database such as PostgreSQL is generally a better fit.

Trying to model every possible relational query using duplicate Cassandra tables can create:

- Many duplicated records.
- Complicated writes.
- Difficult consistency management.
- More application code.
- Additional operational work.

Another example:

A financial application may need atomic updates across accounts and a ledger.

Do not choose Cassandra merely because it offers distributed writes.

You must evaluate transaction guarantees and business invariants carefully.

---

## 13. Practical Architecture: Campaign Platform

Let's apply these concepts to a campaign platform.

Suppose the application handles:

- Campaign registrations.
- User interactions.
- Game submissions.
- Scores.
- Winner allocation.
- Reward distribution.

Different data has different access patterns.

### PostgreSQL

Possible responsibilities:

- Campaign configuration.
- Reward allocation.
- Winner records.
- Financial or inventory-related transactions.
- Relational business data.

### MongoDB

Possible responsibilities:

- Flexible campaign configuration.
- Nested campaign content.
- Dynamic form structures.
- Document-oriented application data.

### Cassandra

Possible responsibilities:

- Large-scale interaction events.
- Activity history.
- Telemetry.
- High-volume event ingestion.

### Redis

Possible responsibilities:

- Frequently accessed cache data.
- Temporary session state.
- Rate limiting.
- Short-lived counters.

### Architecture Diagram

```text
                 Campaign Platform
                         |
                         v
                    Backend API
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      PostgreSQL      MongoDB       Cassandra
          |              |              |
          v              v              v
     Transactions    Flexible       Event History
     Business Data   Documents      Activity Logs
                         |
                         |
                         v
                       Redis
                         |
                         v
                    Cache Layer
```

This is only one possible architecture.

Not every campaign platform needs four databases.

Adding databases creates operational and consistency costs. Use multiple databases only when their specialized capabilities justify those costs.

---

## 14. Common Misconceptions

### Misconception 1: Cassandra is always better for high traffic.

Incorrect.

High traffic alone does not determine database choice.

The workload, query patterns, consistency requirements, and data model matter.

### Misconception 2: Cassandra is only used for time-series data.

Incorrect.

It can support event logging, activity feeds, messaging workloads, and other distributed data-access patterns.

### Misconception 3: Cassandra replaces PostgreSQL.

Incorrect.

They solve different problems. PostgreSQL remains a strong choice for relational transactions and complex SQL queries.

### Misconception 4: Cassandra automatically makes every query fast.

Incorrect.

Poor partition-key selection can create hotspots, large partitions, and expensive reads.

### Misconception 5: High availability means data cannot be lost.

Incorrect.

Replication and consistency settings provide specific failure guarantees. Backups, recovery procedures, and operational discipline are still required.

### Misconception 6: Every application should use multiple databases.

Incorrect.

Polyglot persistence can improve workload specialization, but it also increases operational complexity.

---

## 15. Interview Questions

### Q1. What are common use cases for Cassandra?

Large-scale event logging, time-series data, IoT telemetry, activity feeds, messaging workloads, and distributed tracking systems.

### Q2. Why is Cassandra useful for event logging?

It supports distributed storage, high write throughput, replication, and predictable partition-key-based queries.

### Q3. Why is Cassandra used in IoT systems?

IoT systems can generate massive streams of time-stamped measurements. Cassandra can distribute this data across nodes and support time-oriented access patterns.

### Q4. Is Cassandra a specialized time-series database?

No. It can support time-series workloads, but specialized time-series databases may offer additional features and query capabilities.

### Q5. Can Cassandra be used for messaging systems?

Yes, for suitable message-storage and retrieval patterns. However, ordering, delivery guarantees, and conversation semantics require additional design.

### Q6. Can Cassandra replace PostgreSQL in an e-commerce system?

Not universally. Cassandra may be useful for high-volume event data, while PostgreSQL is generally better suited to relational business transactions.

### Q7. What is fan-out on write?

A feed-generation approach in which an activity is distributed to followers' feed records when it is created.

### Q8. What is fan-out on read?

A feed-generation approach in which activities are fetched and combined when a user requests their feed.

### Q9. Why is time bucketing useful?

It limits partition growth by dividing time-series records into separate time-based partitions.

### Q10. What is the difference between Cassandra and HBase?

Cassandra uses peer-to-peer architecture and tunable consistency. HBase is built around HDFS and uses a master/RegionServer architecture.

### Q11. Can Cassandra perform complex analytical queries?

It is not designed as a general-purpose analytical database. Analytical workloads often belong in a data warehouse or analytical database.

### Q12. What is polyglot persistence?

Using multiple database technologies in one application, with each database selected for a particular workload.

---

## 16. Practical Exercises

### Exercise 1 — Choose a Database

For each requirement, choose a suitable database and explain why.

1. Store users, orders, and payments with foreign keys.
2. Store millions of user interaction events.
3. Cache frequently accessed user sessions.
4. Search product descriptions using full-text search.
5. Store IoT sensor readings.
6. Analyze millions of records using complex aggregations.

Possible technologies:

- PostgreSQL.
- MongoDB.
- Redis.
- Cassandra.
- Elasticsearch.
- ClickHouse.

### Exercise 2 — Design an Event Storage System

A platform receives 100 million events per day.

Each event contains:

```javascript
{
    userId: "user_101",
    campaignId: "campaign_501",
    eventType: "click",
    eventTime: "2026-11-14T10:30:00Z"
}
```

Design a system that supports:

1. Events by user and date.
2. Events by campaign and date.
3. Retrieval by event ID.

Think about:

- Partition keys.
- Time buckets.
- Duplicate tables.
- Write coordination.
- Partition sizing.

### Exercise 3 — Feed Generation

A social platform has 10 million users.

A popular user has 5 million followers.

Compare:

- Fan-out on write.
- Fan-out on read.
- Hybrid fan-out.

Explain which approach could be suitable for highly active users and why.

### Exercise 4 — Architecture Design

Design an architecture for an IoT platform with:

- 500,000 sensors.
- One reading per minute.
- 30-day raw-data retention.
- Historical readings by sensor.
- Daily analytics reports.

Identify:

1. Ingestion layer.
2. Message broker.
3. Operational storage.
4. Retention mechanism.
5. Analytical storage.

---

## 17. Chapter Summary

| Use case         | Why wide-column databases can help                   |
| ---------------- | ---------------------------------------------------- |
| Event logging    | High-volume distributed writes                       |
| Time-series data | Time-oriented partitioning and large-scale ingestion |
| IoT telemetry    | Distributed storage for sensor measurements          |
| Activity feeds   | Query-specific activity retrieval                    |
| Messaging        | Distributed storage of messages and events           |
| Tracking systems | Historical records organized by entity and time      |

### Database selection summary

| Requirement                      | Potential database         |
| -------------------------------- | -------------------------- |
| Relational transactions          | PostgreSQL                 |
| Document-oriented data           | MongoDB                    |
| Distributed event storage        | Cassandra                  |
| Hadoop-based wide-column storage | HBase                      |
| Caching                          | Redis                      |
| Full-text search                 | Elasticsearch / OpenSearch |
| Analytical workloads             | ClickHouse                 |

### The most important concepts

1. Cassandra is useful for large-scale distributed workloads.
2. Event logging is a common wide-column database use case.
3. Time-series data requires careful partition and retention design.
4. IoT platforms can benefit from distributed write capacity.
5. Activity feeds require deliberate fan-out and query design.
6. Messaging systems need more than database storage to guarantee delivery and ordering.
7. Cassandra is not a universal replacement for relational or analytical databases.
8. Select a database based on workload requirements, not popularity.
