---
sidebar_label: Wide-Column Databases vs Time-Series Databases
sidebar_position: 1
---

# Wide-Column Databases vs Time-Series Databases

## 1. Introduction

**If wide-column databases can store enormous amounts of time-series data, why do specialized time-series databases exist?**

The answer is that these database categories solve overlapping but different problems.

Wide-column databases are designed for distributed storage of large datasets, flexible column families, high write throughput, and horizontal scalability.

Time-series databases are designed specifically around timestamped observations, time-range queries, time-based storage management, and time-series analytical operations.

A wide-column database can absolutely store time-series data. In fact, systems such as Cassandra are commonly used for time-series workloads.

However, a specialized time-series database may provide features such as:

- Native time-based partitioning.
- Time-range query optimization.
- Time-series compression.
- Automatic retention.
- Downsampling.
- Continuous aggregation.
- Specialized time-series query functions.

The right choice depends on the workload, not simply the database category.

---

# 2. Understanding Wide-Column Databases

A wide-column database is a NoSQL database that organizes data using rows, partition keys, clustering keys, and columns grouped into column families or tables, depending on the database.

Examples:

- Apache Cassandra.
- Apache HBase.
- Google Bigtable.

These databases are designed to handle large distributed datasets.

## 2.1 Basic data model

Consider a Cassandra-style table:

```sql
CREATE TABLE server_metrics (
    server_id TEXT,
    metric_name TEXT,
    recorded_at TIMESTAMP,
    metric_value DOUBLE,
    PRIMARY KEY (
        (server_id, metric_name),
        recorded_at
    )
) WITH CLUSTERING ORDER BY (recorded_at DESC);
```

Here:

- `server_id` identifies the server.
- `metric_name` identifies the metric.
- `recorded_at` identifies the observation time.
- `metric_value` stores the measured value.

The primary key has two parts:

| Component      | Meaning                    |
| -------------- | -------------------------- |
| Partition key  | `(server_id, metric_name)` |
| Clustering key | `recorded_at`              |

All measurements for a particular server and metric are placed in the same logical partition.

Within that partition, observations are organized by timestamp.

Conceptually:

```text
Partition:
(server-01, cpu_usage)

    10:00:00 -> 40
    10:00:10 -> 45
    10:00:20 -> 50
    10:00:30 -> 55
```

This model can be effective for retrieving recent measurements for a particular server and metric.

## 2.2 Why wide-column databases are useful for time-series data

Wide-column databases can provide:

1. Distributed storage across multiple nodes.
2. High write throughput.
3. Horizontal scalability.
4. Replication and fault tolerance.
5. Efficient partition-based queries.
6. Predictable access patterns when data is modeled correctly.

For example, a monitoring platform may collect measurements from millions of devices.

A wide-column database can distribute those devices' data across multiple nodes.

## 2.3 The important limitation

Wide-column databases generally require careful data modeling around expected queries.

For example, this query may fit the table design:

```sql
SELECT *
FROM server_metrics
WHERE server_id = 'server-01'
  AND metric_name = 'cpu_usage'
  AND recorded_at >= '2026-11-14 10:00:00';
```

But a query that asks for CPU usage across every server may require a different table design or another access path.

The database does not automatically provide every analytical query pattern efficiently.

This is an important difference between designing a general-purpose distributed wide-column model and using a specialized time-series engine.

---

# 3. Understanding Time-Series Databases

A time-series database is designed around timestamped observations.

Its data model commonly includes:

- Timestamp.
- Measurement or metric name.
- Tags or labels.
- Fields or values.

Example:

```text
measurement: cpu_usage

timestamp: 2026-11-14T10:00:00Z

tags:
    host = server-01
    region = india

fields:
    value = 72.5
```

A time-series database can organize data into time-based chunks or blocks and maintain specialized metadata and indexes.

It may provide native support for:

- Time-range filtering.
- Time bucketing.
- Aggregations.
- Compression.
- Retention.
- Downsampling.
- Continuous aggregation.

## 3.1 Example query

Suppose we want average CPU usage for every five minutes:

```sql
SELECT
    time_bucket('5 minutes', timestamp) AS bucket,
    host,
    AVG(cpu_usage) AS avg_cpu
FROM server_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY bucket, host
ORDER BY bucket;
```

This example uses TimescaleDB's `time_bucket()` functionality.

The database groups observations into five-minute intervals.

A specialized TSDB may provide similar time-bucketing functionality through its own query language.

## 3.2 Why specialized time-series databases exist

A time-series database can provide features that would otherwise require substantial application-level implementation.

For example, in a general-purpose database, you may need to build and maintain:

- Time-based partitions.
- Aggregate tables.
- Background aggregation jobs.
- Retention cleanup jobs.
- Compression workflows.
- Historical query optimization.

A specialized time-series database may provide built-in mechanisms for many of these operations.

This does not mean every TSDB automatically handles every requirement. Features and limitations vary by product.

---

# 4. Wide-Column vs Time-Series: Fundamental Difference

The most important distinction is their primary design objective.

| Area                    | Wide-column database                                                      | Time-series database                                         |
| ----------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Primary objective       | Distributed storage and scalable access patterns                          | Efficient storage and querying of timestamped data           |
| Data organization       | Partitions, rows, clustering keys, columns                                | Measurements, timestamps, labels, fields, chunks or blocks   |
| Query focus             | Partition-key-oriented access                                             | Time-range and series-oriented access                        |
| Write workload          | High-throughput distributed writes                                        | Continuous time-series ingestion                             |
| Time-based organization | Usually designed into the schema                                          | Often a native storage capability                            |
| Compression             | Depends on database and storage engine                                    | Often specialized for timestamps and measurements            |
| Retention               | Often requires TTL or lifecycle configuration                             | Often provides time-oriented retention features              |
| Aggregation             | Depends on database capabilities and application design                   | Often provides time-bucketing and time-series aggregation    |
| Downsampling            | Usually application-managed or implemented through additional tables/jobs | Often supported through native or integrated mechanisms      |
| Schema                  | Database-specific wide-column model                                       | Often metric/series-oriented or relational time-series model |
| Horizontal scaling      | A central design feature of many systems                                  | Varies by product and deployment architecture                |

**Important:** This is a comparison of database categories, not a claim that every wide-column database lacks time-series capabilities or that every TSDB automatically supports every feature.

---

# 5. Data Modeling Differences

Data modeling is one of the most important differences.

Let's design a monitoring platform that collects CPU and memory measurements from servers.

## 5.1 Wide-column modeling

A Cassandra-style table might look like:

```sql
CREATE TABLE server_metrics (
    server_id TEXT,
    metric_name TEXT,
    recorded_at TIMESTAMP,
    metric_value DOUBLE,
    PRIMARY KEY (
        (server_id, metric_name),
        recorded_at
    )
);
```

Example records:

| server_id | metric_name  | recorded_at | metric_value |
| --------- | ------------ | ----------- | -----------: |
| server-01 | cpu_usage    | 10:00:00    |           70 |
| server-01 | cpu_usage    | 10:00:10    |           72 |
| server-01 | memory_usage | 10:00:00    |           65 |
| server-02 | cpu_usage    | 10:00:00    |           55 |

The partition key is:

```text
(server_id, metric_name)
```

The clustering key is:

```text
recorded_at
```

This design is useful when the application frequently asks:

- What is the CPU history of server-01?
- What is the memory history of server-01?
- What are the latest measurements for server-02?

### Partition sizing problem

Suppose a server generates one measurement per second for one metric.

The partition can continue growing indefinitely if there is no time-bucketing strategy.

Large partitions can create operational and performance problems.

A better design may include a time bucket in the partition key:

```sql
CREATE TABLE server_metrics_by_day (
    server_id TEXT,
    metric_name TEXT,
    day DATE,
    recorded_at TIMESTAMP,
    metric_value DOUBLE,
    PRIMARY KEY (
        (server_id, metric_name, day),
        recorded_at
    )
) WITH CLUSTERING ORDER BY (recorded_at DESC);
```

Now data is divided by day.

Conceptually:

```text
(server-01, cpu_usage, 2026-11-13)
    |
    +-- 00:00
    +-- 00:01
    +-- 00:02
    +-- ...
    +-- 23:59

(server-01, cpu_usage, 2026-11-14)
    |
    +-- 00:00
    +-- 00:01
    +-- ...
```

This provides bounded time-oriented partitions.

The tradeoff is that queries spanning multiple days need to access multiple partitions.

## 5.2 Time-series database modeling

A metric-oriented TSDB may model the same observations as:

```text
Measurement: server_metrics

Tags:
    server_id
    region
    environment

Fields:
    cpu_usage
    memory_usage

Timestamp:
    recorded_at
```

Example:

```text
timestamp: 10:00:00

tags:
    server_id = server-01
    region = india

fields:
    cpu_usage = 70
    memory_usage = 65
```

Another observation:

```text
timestamp: 10:00:10

tags:
    server_id = server-01
    region = india

fields:
    cpu_usage = 72
    memory_usage = 68
```

The database can organize and compress these observations according to its time-series storage model.

Some systems use metric-plus-label series identity. Others use relational tables with time partitioning.

Do not assume every TSDB uses the exact same data model.

## 5.3 Data modeling comparison

| Question                        | Wide-column approach                   | Time-series approach                                 |
| ------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| How is data identified?         | Partition and clustering keys          | Timestamp plus metric/series identity or table keys  |
| How is time organized?          | Often explicitly included in schema    | Often supported by native time-based structures      |
| How are dimensions represented? | Columns and partition/clustering keys  | Tags, labels, dimensions, or relational columns      |
| How are queries optimized?      | Design tables around access patterns   | Use time-range, series, and metadata indexes         |
| How is historical data managed? | TTL, table lifecycle, application jobs | Retention policies and time-based lifecycle features |

---

# 6. Write Performance and Ingestion

Both database categories can support high write throughput.

However, their ingestion architecture and optimization mechanisms differ.

## 6.1 Wide-column write path

A simplified Cassandra-style write path:

```text
             Application
                  |
                  v
             Coordinator
                  |
                  v
          Replica Nodes
                  |
                  v
                 WAL
              (Commit Log)
                  |
                  v
              Memtable
                  |
                  v
              Flush
                  |
                  v
              SSTables
                  |
                  v
              Compaction
```

Key concepts:

- The coordinator routes the write.
- Replicas receive the write according to the replication strategy.
- The commit log supports recovery.
- The memtable holds recent writes.
- Flushing creates immutable SSTables.
- Compaction reorganizes SSTables.

This is an LSM-oriented architecture.

The actual write acknowledgment depends on the configured consistency level and durability settings.

## 6.2 Time-series database write path

A simplified TSDB write path:

```text
            Application
                 |
                 v
             Ingestion
                 |
                 v
             Validation
                 |
                 v
            Write Buffer
                 |
                 v
           WAL / Durability
                 |
                 v
          In-Memory Storage
                 |
                 v
          Persistent Blocks
                 |
                 v
          Index / Metadata
```

This is conceptual.

Different TSDBs have different write pipelines.

For example:

- Prometheus uses a Head block, WAL, and persistent blocks.
- TimescaleDB uses PostgreSQL's storage and WAL mechanisms.
- InfluxDB architecture varies by major version.
- VictoriaMetrics has its own storage architecture.

## 6.3 Write performance comparison

| Factor                | Wide-column database                      | Time-series database                       |
| --------------------- | ----------------------------------------- | ------------------------------------------ |
| High-volume ingestion | Strong capability in many systems         | Core workload in specialized systems       |
| Batching              | Common                                    | Common                                     |
| Distributed writes    | Built into distributed designs            | Depends on product and deployment          |
| Time-aware ingestion  | Requires appropriate schema design        | Often a native concept                     |
| Compression           | Storage-engine dependent                  | Often specialized for time-series patterns |
| Write optimization    | LSM-oriented in systems such as Cassandra | Depends on engine architecture             |

Neither category is automatically faster.

Performance depends on:

- Data model.
- Partition design.
- Write batch size.
- Replication configuration.
- Hardware.
- Compression.
- Number of active series.
- Query workload.

---

# 7. Read Performance and Query Patterns

The most important question when selecting a database is:

**How will the application read the data?**

Two databases can store the same measurements but perform very differently depending on the query pattern.

## 7.1 Wide-column query pattern

Suppose we want the latest CPU measurements for one server.

```sql
SELECT *
FROM server_metrics_by_day
WHERE server_id = 'server-01'
  AND metric_name = 'cpu_usage'
  AND day = '2026-11-14'
LIMIT 100;
```

This query matches the partition-key design.

The database can locate the relevant partition and retrieve the records ordered by the clustering key.

However, a query across all servers may require a different model or a distributed scan.

## 7.2 Time-series query pattern

Suppose we want average CPU usage across all servers in India for the last 24 hours.

Conceptually:

```sql
SELECT
    time_bucket('5 minutes', timestamp) AS bucket,
    AVG(cpu_usage)
FROM server_metrics
WHERE region = 'india'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY bucket
ORDER BY bucket;
```

A time-series database can use time-range filtering, relevant series or indexes, and time-bucket aggregation.

The exact execution strategy depends on the TSDB.

## 7.3 Query pattern comparison

| Query requirement              | Wide-column database                                        | Time-series database                                          |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Latest values for one device   | Good with suitable partition key                            | Good                                                          |
| Historical data for one device | Good with suitable time partitioning                        | Good                                                          |
| Aggregation by time interval   | Possible, often requires application or additional modeling | Common native capability                                      |
| Average across many series     | Depends on query support and data model                     | Often a primary workload                                      |
| Long-range trend analysis      | Possible, but may require precomputed tables                | Often supported through rollups and downsampling              |
| Arbitrary analytical queries   | Limited by access-pattern design                            | Varies; not all TSDBs support arbitrary analytics efficiently |

A wide-column database is not designed to be a general-purpose analytical engine.

Likewise, a TSDB is not automatically the best choice for every distributed key-based workload.

---

# 8. Indexing and Partitioning Differences

Both database categories need to locate relevant data efficiently.

However, their indexing and partitioning approaches differ.

## 8.1 Wide-column partitioning

In Cassandra, the partition key determines which node or replica set stores a partition.

For example:

```text
Partition key:
(server_id, metric_name, day)
```

A partitioner hashes the partition key and uses the result to determine data placement.

Conceptually:

```text
(server-01, cpu_usage, 2026-11-14)
                 |
                 v
              Hashing
                 |
                 v
             Token Range
                 |
                 v
             Node / Replicas
```

This supports horizontal distribution.

The partition key must be chosen carefully.

A poor partition key can create:

- Hot partitions.
- Uneven data distribution.
- Very large partitions.
- Expensive queries.

## 8.2 Time-series partitioning

A TSDB may organize data by:

- Time range.
- Series identity.
- Labels or tags.
- Chunks.
- Blocks.
- Internal storage partitions.

For example:

```text
server_metrics

    |
    +-- Block 1: 10:00–10:59
    |
    +-- Block 2: 11:00–11:59
    |
    +-- Block 3: 12:00–12:59
```

A query requesting 11:15–11:45 may only need Block 2.

This is time-range pruning.

## 8.3 Comparison

| Area                         | Wide-column                               | Time-series                                                              |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| Primary partitioning concern | Distribute data across nodes              | Organize and retrieve time-series data efficiently                       |
| Partition key                | Explicitly designed in schema             | Often managed through engine-specific structures                         |
| Time organization            | Often part of partition or clustering key | Often native time-based chunks or blocks                                 |
| Hotspot risk                 | Poor partition-key design                 | Hot series, ingestion imbalance, or product-specific partitioning issues |
| Query pruning                | Partition-key and clustering-key access   | Time-range and series/block pruning                                      |

The categories can overlap.

A wide-column schema can use time-based partition keys, and a distributed TSDB can partition data across nodes.

---

# 9. Compression and Storage Efficiency

Time-series data often contains patterns that make compression particularly effective.

Examples:

- Increasing timestamps.
- Similar consecutive numeric values.
- Repeated labels.
- Repeated measurement names.
- Regular sampling intervals.

A specialized TSDB may use techniques such as:

- Delta encoding.
- Delta-of-delta encoding.
- Run-length encoding.
- Dictionary encoding.
- Bit packing.
- XOR-based floating-point compression.

These techniques were covered in Part 16C.

## 9.1 Wide-column compression

Wide-column databases also support storage compression.

For example, Cassandra uses compression on SSTable data.

Compression behavior depends on the database, configuration, data format, and workload.

However, a wide-column database's compression strategy is not necessarily optimized specifically for timestamp and measurement patterns.

## 9.2 Storage comparison

| Factor                     | Wide-column database      | Time-series database                       |
| -------------------------- | ------------------------- | ------------------------------------------ |
| General compression        | Supported by many systems | Supported                                  |
| Timestamp compression      | Depends on storage format | Often specialized                          |
| Repeated-value compression | Depends on engine         | Often optimized                            |
| Historical compression     | Storage-engine dependent  | Often integrated with time-based lifecycle |
| Columnar storage           | Depends on product        | Available in some TSDBs                    |

Do not assume every time-series database is columnar or that every wide-column database lacks specialized compression.

---

# 10. Retention and Data Lifecycle

This is another important difference.

Suppose a monitoring platform stores CPU measurements every second.

It wants:

```text
Raw data:       7 days
Minute rollups: 30 days
Hourly rollups: 1 year
```

## 10.1 Wide-column retention

A wide-column database may support TTL.

In Cassandra, TTL allows individual data cells or rows to expire after a configured duration.

Example:

```sql
INSERT INTO server_metrics_by_day (
    server_id,
    metric_name,
    day,
    recorded_at,
    metric_value
)
VALUES (
    'server-01',
    'cpu_usage',
    '2026-11-14',
    '2026-11-14 10:00:00',
    72.5
)
USING TTL 604800;
```

`604800` seconds equals seven days.

When TTL expires, data becomes eligible for removal. Physical disk reclamation is not necessarily immediate; it is handled through storage-engine cleanup and compaction.

TTL can be useful, but it does not automatically create rollups.

You may still need:

- Background aggregation jobs.
- Separate rollup tables.
- Application-level processing.
- Data migration workflows.

## 10.2 Time-series retention

A specialized TSDB may provide retention policies or retention mechanisms based on time ranges.

For example:

```text
Raw measurements:
7 days

Minute-level summaries:
30 days

Hourly summaries:
1 year
```

It may also provide automated downsampling or continuous aggregation.

The exact features depend on the database.

## 10.3 Comparison

| Operation                    | Wide-column database             | Time-series database                                   |
| ---------------------------- | -------------------------------- | ------------------------------------------------------ |
| Expiration                   | TTL or lifecycle jobs            | Retention policies or time-based deletion              |
| Raw-to-rollup transformation | Often application-managed        | May be supported natively                              |
| Downsampling                 | Additional tables and processing | Often integrated or supported                          |
| Historical cleanup           | TTL and compaction behavior      | Time-based chunk/block management, depending on engine |
| Long-term summaries          | Additional schema and jobs       | Often native or integrated aggregation features        |

**Important:** TTL is not equivalent to a complete time-series retention and downsampling system.

---

# 11. Horizontal Scalability

Both database categories can support large datasets, but their scaling mechanisms differ.

## 11.1 Wide-column horizontal scaling

Many wide-column databases are designed around distributed nodes.

For example, Cassandra distributes partitions across a cluster.

```text
                 Application
                      |
                      v
                 Cassandra
                   Cluster
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        Node 1      Node 2      Node 3
          |           |           |
       Data A      Data B      Data C
```

Adding nodes can increase:

- Storage capacity.
- Aggregate write capacity.
- Aggregate read capacity, depending on workload.
- Cluster processing resources.

However, scaling is not free.

It introduces:

- Data redistribution.
- Replication overhead.
- Repair operations.
- Operational complexity.
- Consistency considerations.
- Partitioning challenges.

## 11.2 Time-series database scalability

Time-series databases have different scaling models.

Some are primarily single-node systems.

Some support distributed clusters.

Some integrate with distributed storage or object storage.

Some use sharding or partitioning across nodes.

For example:

- Prometheus can use external systems for long-term or horizontally scalable storage.
- TimescaleDB supports different scaling architectures, including distributed capabilities in applicable configurations and product versions.
- InfluxDB deployment capabilities differ across major versions.
- VictoriaMetrics supports single-node and clustered deployments.

A TSDB should not automatically be assumed to be horizontally distributed.

## 11.3 Scalability comparison

| Area               | Wide-column                                  | Time-series                               |
| ------------------ | -------------------------------------------- | ----------------------------------------- |
| Horizontal scaling | Core design of many systems                  | Product-dependent                         |
| Data distribution  | Partition-based                              | Product-specific partitioning or sharding |
| Replication        | Common                                       | Depends on architecture                   |
| Cluster management | Distributed database operations              | TSDB-specific operations                  |
| Adding capacity    | Often involves rebalancing or redistribution | Depends on product and deployment model   |

---

# 12. Consistency and Transactions

Wide-column databases and time-series databases also differ in their consistency and transaction models.

## 12.1 Wide-column consistency

Consider Cassandra.

Cassandra uses tunable consistency.

A client can choose consistency levels such as:

- ONE.
- QUORUM.
- ALL.

The consistency level determines how many replicas must respond for a read or write operation to succeed.

For example, with replication factor 3:

```text
Replication factor = 3

Consistency level = QUORUM

Required responses = 2
```

This provides a configurable tradeoff between availability, latency, and consistency.

Cassandra's consistency behavior should not be simplified to saying that all reads are eventually consistent or that all writes are immediately consistent.

The result depends on consistency level, replication, conflict resolution, and operational conditions.

## 12.2 Time-series consistency

Time-series databases also have different consistency and durability models.

For example:

- PostgreSQL/TimescaleDB inherits PostgreSQL's transactional behavior.
- Prometheus has its own local storage and ingestion behavior.
- InfluxDB consistency and durability depend on its version and deployment.
- VictoriaMetrics behavior depends on its deployment architecture.

Some monitoring workloads can tolerate a small ingestion delay.

For example, a CPU dashboard may not require every observation to become visible instantaneously.

But other workloads may require stronger guarantees.

For example, financial transaction records should not be treated as ordinary approximate monitoring metrics.

## 12.3 Transaction requirements

A wide-column database such as Cassandra is not a direct replacement for a relational transactional database.

Cassandra supports certain atomic operations and lightweight transactions, but its transaction model is not equivalent to PostgreSQL's general multi-row ACID transaction model.

Similarly, not every TSDB provides the same transactional features as PostgreSQL.

Database selection must account for the consistency and transaction requirements of the application.

---

# 13. Real-World Use Cases

Let's compare where each category is useful.

## 13.1 Wide-column database use cases

<text_placeholder> </text_placeholder>

### IoT device event storage

A platform receives measurements from millions of devices.

Queries frequently retrieve data for a particular device over a specified time range.

A wide-column schema can partition by device and time bucket.

### Large-scale user activity events

An application stores:

- User activity.
- Click events.
- Session events.
- Device events.

The data is distributed across many nodes.

### Messaging and event history

A system stores messages or events partitioned by conversation or account.

The primary access pattern is retrieving ordered records for one entity.

### High-throughput distributed writes

A platform needs to accept large write volumes while distributing data across multiple nodes.

## 13.2 Time-series database use cases

### Infrastructure monitoring

Store:

- CPU usage.
- Memory usage.
- Disk utilization.
- Network traffic.
- Server health.

### Application performance monitoring

Store:

- Request latency.
- Error rates.
- Throughput.
- Database query duration.
- Service availability.

### IoT sensor analytics

Store timestamped temperature, humidity, pressure, and other measurements.

### Financial and operational metrics

Store price observations, operational measurements, and other timestamped values where appropriate.

### Real-time dashboards

Calculate:

- Average response time.
- Request rates.
- Error percentages.
- CPU and memory trends.
- Historical performance.

---

# 14. When Should You Choose a Wide-Column Database?

Choose a wide-column database when the application primarily needs distributed, high-throughput storage with predictable access patterns.

Good indicators:

1. Very large datasets distributed across multiple nodes.
2. High write throughput.
3. Access patterns can be designed around partition keys.
4. Queries are mostly known in advance.
5. The application needs horizontal scalability.
6. You need to retrieve ordered records for particular entities.
7. You can manage aggregation and retention workflows separately.

Example:

A platform stores event history for millions of IoT devices.

Common query:

```text
Get all events for device-123
between two timestamps.
```

A wide-column design can work well for this pattern.

But if the system needs extensive time-based analytical functions, you must account for the extra modeling and processing required.

---

# 15. When Should You Choose a Time-Series Database?

Choose a specialized TSDB when the primary workload is timestamped measurements and time-oriented analytics.

Good indicators:

1. Continuous metric ingestion.
2. Frequent time-range queries.
3. Time-bucket aggregation.
4. Historical trend analysis.
5. Retention and downsampling requirements.
6. Compression of timestamped measurements.
7. Monitoring dashboards.
8. Large numbers of time-series observations.

Example:

A monitoring platform collects CPU measurements from 50,000 servers.

Common queries:

```text
Average CPU usage across all servers
for every five minutes during the last 24 hours.
```

A TSDB may provide a more direct solution because time-based operations are central to its design.

---

# 16. When Should You Use Neither?

Do not choose a database just because it can store the data.

Consider the actual application requirements.

## 16.1 PostgreSQL may be sufficient

Suppose you have:

- 100 servers.
- A moderate ingestion rate.
- A few million observations.
- SQL reporting requirements.
- Relational data relationships.

PostgreSQL may be sufficient.

You can use:

- Timestamp columns.
- B-tree indexes.
- Time-based table partitioning.
- Materialized views.
- Background aggregation jobs.

You may not need a separate specialized TSDB.

## 16.2 MongoDB may be sufficient

MongoDB supports time-series collections.

They are designed for timestamped measurements and include time-series-oriented storage behavior.

Example:

```javascript
db.createCollection("server_metrics", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "seconds",
  },
});
```

Example document:

```javascript
{
  timestamp: ISODate("2026-11-14T10:00:00Z"),

  metadata: {
    server: "server-01",
    region: "india"
  },

  cpu_usage: 72.5,
  memory_usage: 65.3
}
```

MongoDB time-series collections can be useful when the application already uses MongoDB and the workload fits the feature set.

However, a MongoDB time-series collection is not equivalent to every specialized TSDB.

Evaluate its query, indexing, update, retention, compression, and scaling characteristics against your workload.

## 16.3 Redis may be useful for recent metrics

Redis can store short-lived counters, cached aggregates, and recent metric values.

For example:

```text
current_cpu:server-01 = 72.5
```

But Redis is not generally a replacement for durable, long-term time-series storage.

A common architecture may use Redis for fast recent access and a TSDB or another persistent database for historical storage.

---

# 17. Decision Matrix

Use this table as a practical starting point.

| Requirement                         | Wide-column DB              | Time-series DB    | PostgreSQL                                | MongoDB                                    |
| ----------------------------------- | --------------------------- | ----------------- | ----------------------------------------- | ------------------------------------------ |
| Very high distributed write volume  | Strong fit                  | Product-dependent | Depends on architecture                   | Depends on architecture                    |
| Device-specific event history       | Strong fit                  | Good fit          | Good fit at suitable scale                | Good fit                                   |
| Time-range analytical queries       | Requires suitable modeling  | Strong fit        | Good fit                                  | Good fit for suitable workloads            |
| Built-in time-based rollups         | Usually additional work     | Often available   | Requires queries/jobs or extensions       | Requires application or supported features |
| Native retention management         | TTL or lifecycle features   | Often available   | Partition management/jobs                 | TTL indexes and time-series features       |
| Relational transactions             | Limited compared with RDBMS | Product-dependent | Strong fit                                | Multi-document transactions available      |
| Flexible document structure         | Not its main model          | Product-dependent | JSONB available                           | Strong fit                                 |
| Distributed partition-based storage | Strong fit                  | Product-dependent | Requires suitable architecture/extensions | Native sharding available                  |

The table is a high-level guide. Actual product capabilities and deployment choices matter more than category labels.

---

# 18. Real-World Architecture: Monitoring Platform

Let's design a monitoring platform for 20,000 application servers.

Each server sends:

- CPU usage.
- Memory usage.
- Disk utilization.
- Network traffic.
- HTTP request count.
- Request latency.

The platform needs:

1. Continuous ingestion.
2. Real-time dashboards.
3. Historical analysis.
4. Retention.
5. Aggregation.
6. High availability.

## 18.1 Option A: Wide-column architecture

```text
             Monitoring Agents
                     |
                     v
              Ingestion Layer
                     |
                     v
             Message Queue
                     |
                     v
             Cassandra Cluster
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node 1     Node 2     Node 3
```

The application must design:

- Partition keys.
- Clustering keys.
- Time buckets.
- Replication.
- Rollup tables.
- TTL.
- Aggregation workers.

This architecture can work well when distributed write throughput and predictable query patterns dominate.

However, time-series analytical capabilities may require more application-level engineering.

## 18.2 Option B: Specialized TSDB architecture

```text
             Monitoring Agents
                     |
                     v
              Ingestion Layer
                     |
                     v
              Time-Series DB
                     |
           +---------+---------+
           |         |         |
           v         v         v
         Raw      Rollups   Metadata
         Data       |
           |        |
           v        v
        Retention  Dashboards
```

The TSDB may provide:

- Time-oriented storage.
- Time-range query optimization.
- Compression.
- Retention.
- Aggregation.
- Downsampling.

This can reduce the amount of custom application logic needed.

The actual architecture still depends on the selected TSDB and its deployment model.

## 18.3 Option C: Hybrid architecture

A large system may use both.

```text
                 Monitoring Agents
                         |
                         v
                  Ingestion Layer
                         |
                         v
                    Event Queue
                         |
              +----------+----------+
              |                     |
              v                     v
          Time-Series DB       Wide-Column DB
              |                     |
              v                     v
        Metrics & Trends       Long-Term Events
              |                     |
              +----------+----------+
                         |
                         v
                    API Layer
                         |
                         v
                     Dashboard
```

Possible responsibilities:

**Time-series database:**

- CPU and memory metrics.
- Request latency.
- Error rates.
- Time-based aggregations.
- Monitoring dashboards.

**Wide-column database:**

- Large-scale event history.
- Device activity records.
- Entity-oriented event retrieval.
- High-throughput distributed event storage.

This is an example of polyglot persistence.

It introduces additional complexity:

- More infrastructure.
- More operational work.
- Data duplication.
- Synchronization.
- Monitoring.
- Backup and recovery management.

Use a hybrid architecture only when the workloads justify it.

---

# 19. Common Misconceptions

## Misconception 1: Wide-column databases cannot store time-series data

Incorrect.

Cassandra, HBase, and Bigtable can store time-series data.

The difference is that time-series features may require more explicit data modeling and application-level operations.

## Misconception 2: Time-series databases are always faster

Incorrect.

Performance depends on the query pattern, data model, workload, configuration, and deployment.

A properly designed Cassandra table can outperform an unsuitable TSDB for a particular device-history lookup.

Likewise, a TSDB may be much more efficient for broad time-range aggregation.

## Misconception 3: Every TSDB supports automatic downsampling

Incorrect.

Downsampling and continuous aggregation capabilities vary by product.

Some systems require external processing or custom jobs.

## Misconception 4: Wide-column databases do not support aggregation

Incorrect.

Some wide-column databases support certain aggregation operations.

However, their distributed query and analytical capabilities differ from specialized time-series engines and general-purpose analytical databases.

## Misconception 5: A TSDB is always distributed

Incorrect.

Some TSDBs are primarily single-node systems. Others provide clustered or distributed deployment options.

## Misconception 6: Cassandra is a time-series database

Not exactly.

Cassandra is a wide-column distributed database that can be modeled for time-series workloads.

It is not a specialized time-series database simply because it can store timestamped observations.

## Misconception 7: MongoDB cannot store time-series data

Incorrect.

MongoDB provides time-series collections.

Whether MongoDB is the best option depends on ingestion volume, query patterns, retention, compression, and application requirements.

---

# 20. Interview Questions and Answers

## Q1. What is the primary difference between wide-column and time-series databases?

**Answer:**

Wide-column databases focus on distributed storage, high write throughput, and partition-based access patterns.

Time-series databases focus on timestamped observations, time-range queries, compression, aggregation, and time-based data lifecycle operations.

## Q2. Can Cassandra be used as a time-series database?

**Answer:**

Yes.

Cassandra can store time-series data using partition keys, clustering keys, and time buckets.

However, aggregation, downsampling, and retention workflows may require additional modeling or application-level processing.

## Q3. Why is partition-key design important in Cassandra?

**Answer:**

The partition key determines data distribution and query routing.

Poor partition-key design can create:

- Hot partitions.
- Uneven distribution.
- Large partitions.
- Expensive queries.

## Q4. Why include a time bucket in a Cassandra partition key?

**Answer:**

It prevents a single entity's partition from growing indefinitely.

For example:

```text
(server-01, cpu_usage, 2026-11-14)
```

This creates a separate partition for each time bucket.

The tradeoff is that queries spanning multiple buckets must access multiple partitions.

## Q5. Why might a specialized TSDB be better for monitoring?

**Answer:**

It may provide native time-range filtering, time-bucket aggregation, compression, retention, and downsampling.

This reduces the amount of custom data-management logic required.

## Q6. Can a wide-column database perform time-range queries?

**Answer:**

Yes, when the partition and clustering keys are designed appropriately.

For example, a table can partition by server and metric and cluster observations by timestamp.

## Q7. What is the difference between Cassandra TTL and TSDB retention?

**Answer:**

Cassandra TTL expires individual stored data after a configured duration.

A TSDB retention system may manage data through time-based chunks, blocks, or other lifecycle structures.

TTL does not automatically provide rollups or downsampling.

## Q8. Why are time-series databases good at historical analytics?

**Answer:**

Many are designed around time-based storage, indexing, compression, and aggregation.

These features help reduce unnecessary reads and make time-range queries more efficient.

## Q9. Is Cassandra always more scalable than a time-series database?

**Answer:**

No.

Cassandra is designed for distributed scaling, but some TSDBs also support clustering and horizontal scaling.

The correct comparison must use specific products and workloads.

## Q10. What is a hot partition?

**Answer:**

A hot partition is a partition that receives disproportionately high traffic compared with other partitions.

It can create uneven workload distribution and reduce cluster performance.

## Q11. What is the advantage of clustering keys in Cassandra?

**Answer:**

Clustering keys determine the ordering of rows within a partition.

They are useful for retrieving ordered records and performing range queries within a partition.

## Q12. Why is a hybrid architecture sometimes used?

**Answer:**

Different database categories can serve different workloads.

For example, a TSDB can handle monitoring metrics while Cassandra stores large-scale event history.

However, a hybrid design introduces synchronization and operational complexity.

## Q13. Can PostgreSQL be used instead of a specialized TSDB?

**Answer:**

Yes, for suitable workloads.

PostgreSQL supports timestamp columns, indexes, partitioning, aggregation, and materialized views.

Extensions such as TimescaleDB add specialized time-series capabilities.

## Q14. Can MongoDB be used for time-series workloads?

**Answer:**

Yes.

MongoDB provides time-series collections designed for timestamped measurements.

The decision depends on the required query patterns, ingestion volume, retention, and operational constraints.

## Q15. Which database would you choose for monitoring 100,000 servers?

**Answer:**

I would not choose a database based only on the number of servers.

I would first calculate:

- Measurements per second.
- Number of metrics per server.
- Series cardinality.
- Retention requirements.
- Query patterns.
- Availability requirements.
- Storage budget.
- Required deployment model.

Then I would benchmark suitable TSDBs and distributed alternatives using representative data.

---

# 21. Practical Exercises

## Exercise 1: Design a Cassandra time-series table

A monitoring platform stores CPU usage for 50,000 servers.

Each server sends one measurement every 10 seconds.

Design a Cassandra table containing:

- Server ID.
- Metric name.
- Timestamp.
- Metric value.
- Time bucket.

Explain:

1. Partition key.
2. Clustering key.
3. Why a time bucket is needed.
4. How to retrieve the latest 100 records.
5. What happens when a query spans seven days.

## Exercise 2: Choose the correct database

Select a suitable database category for each requirement.

| Requirement                                 | Your choice |
| ------------------------------------------- | ----------- |
| High-throughput device event history        | ?           |
| CPU and memory monitoring                   | ?           |
| Relational order and payment transactions   | ?           |
| Long-term metric rollups                    | ?           |
| Flexible product catalog documents          | ?           |
| Distributed entity-specific event retrieval | ?           |

Explain your decisions.

## Exercise 3: Identify the query problem

A Cassandra table uses:

```text
PRIMARY KEY ((server_id), recorded_at)
```

A server sends one measurement every second.

The data is retained for five years.

Explain:

1. Why the partition may become very large.
2. Why large partitions can create operational problems.
3. How adding a time bucket changes the model.
4. What tradeoffs this introduces.

## Exercise 4: Compare storage lifecycle

Design a lifecycle for a monitoring platform using:

```text
Raw metrics
Minute rollups
Hourly rollups
Daily rollups
```

Explain how you would implement it using:

1. A wide-column database.
2. A specialized time-series database.

## Exercise 5: Evaluate a hybrid architecture

A company already uses Cassandra for event history.

It now needs:

- CPU dashboards.
- Request latency percentiles.
- Five-minute aggregates.
- One-year historical trends.
- Automatic retention.

Should it store everything in Cassandra, introduce a TSDB, or use a hybrid architecture?

Explain the operational and financial tradeoffs.

---

# 22. Complete Revision

| Chapter | Topic                        | Key concepts                                                              |
| ------- | ---------------------------- | ------------------------------------------------------------------------- |
| 16A     | Fundamentals                 | Time-series data, metrics, observations, dimensions, event time           |
| 16B     | Why Traditional DBs Struggle | Write volume, historical data, cardinality, time-range queries            |
| 16C     | Internal Architecture        | Write buffers, WAL, storage blocks, compression, indexes, query execution |
| 16D     | Time-Series Operations       | Downsampling, retention, rollups, continuous aggregation                  |
| 16E     | Wide-Column vs Time-Series   | Data modeling, partitioning, scalability, use cases, tradeoffs            |

## Final concepts to remember

1. Wide-column databases can store time-series data.
2. Cassandra is a wide-column database, not a specialized TSDB.
3. Wide-column databases require careful partition-key and clustering-key design.
4. Specialized TSDBs are optimized around timestamped observations and time-oriented operations.
5. Time-series databases often provide native time-bucketing, compression, retention, and aggregation features.
6. Wide-column databases are strong choices for distributed, predictable access patterns.
7. A TSDB may be a better fit for monitoring and historical time-series analytics.
8. Neither category is automatically faster or more scalable for every workload.
9. PostgreSQL and MongoDB can also support time-series workloads.
10. A hybrid architecture is justified only when separate workloads require separate database capabilities.

**The core decision rule:**

Choose a wide-column database when distributed, high-throughput storage with predictable partition-based access is the primary requirement.

Choose a specialized time-series database when timestamped ingestion, time-range queries, and time-series lifecycle operations are the primary requirements.

Choose neither by default. Evaluate the actual workload, operational cost, and required guarantees.
