---
sidebar_label: Part 16B — Why Traditional Databases Struggle with Time-Series Workloads
sidebar_position: 1
---

# Part 16B — Why Traditional Databases Struggle with Time-Series Workloads

## 1. Introduction

In Part 16A, we learned what time-series data is and why specialized time-series databases exist.

Now we need to understand a more important question:

**Why can a traditional database struggle when handling large-scale time-series workloads?**

Consider an infrastructure monitoring application.

It monitors:

- 10,000 servers.
- CPU utilization every 5 seconds.
- Memory utilization every 5 seconds.
- Disk utilization every 5 seconds.
- Network traffic every 5 seconds.

Every server continuously generates measurements.

As the system grows, the database must handle:

1. A continuous stream of incoming writes.
2. Millions or billions of historical records.
3. Frequent time-range queries.
4. Aggregations over large time intervals.
5. Storage growth.
6. Retention and deletion of old data.
7. High-cardinality dimensions.

A general-purpose database can handle time-series data, but its performance and operational costs depend on the workload and database architecture.

Specialized time-series databases optimize their storage and query execution around these patterns.

This chapter explains the underlying challenges.

---

# 2. Challenge 1 — High Write Throughput

## 2.1 What is write throughput?

Write throughput is the amount of data a database can successfully write within a given period.

It is commonly measured as:

- Writes per second.
- Inserts per second.
- Records per second.
- Bytes per second.

Suppose a monitoring system has:

- 10,000 servers.
- One measurement every 5 seconds.
- One measurement record per server per interval.

Measurements per second:

\[
\frac{10,000}{5} = 2,000
\]

<badge color="success">2,000 writes/second</badge>

Measurements per day:

\[
2,000 \times 86,400 = 172,800,000
\]

That is 172.8 million records per day.

Now imagine each server produces 10 different metric records per interval.

The ingestion rate becomes:

\[
2,000 \times 10 = 20,000
\]

That is 20,000 records per second.

This is a substantial continuous write workload.

## 2.2 Why can traditional databases struggle?

A general-purpose relational database must manage more than simply writing a value to disk.

Depending on the operation, it may need to handle:

- Transaction processing.
- Index maintenance.
- WAL (Write-Ahead Logging).
- Constraints.
- MVCC metadata.
- Replication.
- Buffer management.
- Storage-engine bookkeeping.

These mechanisms are valuable for general-purpose database correctness and functionality.

However, a workload consisting mostly of continuously inserted measurements may not need every general-purpose feature for every operation.

The cost of maintaining indexes and other structures can become significant.

## 2.3 Index maintenance overhead

Suppose we have this table:

```sql
CREATE TABLE server_metrics (
    id BIGSERIAL PRIMARY KEY,
    server_id VARCHAR(50),
    recorded_at TIMESTAMPTZ,
    cpu_usage DOUBLE PRECISION
);
```

We create indexes:

```sql
CREATE INDEX idx_server_metrics_server
ON server_metrics(server_id);

CREATE INDEX idx_server_metrics_time
ON server_metrics(recorded_at);
```

Now every inserted row must also be reflected in the relevant index structures.

Conceptually:

```text
Incoming Record
      |
      v
Database Table
      |
      |---- Update Primary Key Index
      |
      |---- Update Server Index
      |
      |---- Update Timestamp Index
      |
      v
Write Completion
```

Indexes improve query performance, but maintaining them adds write work.

With millions of records, unnecessary indexes can become expensive.

## 2.4 How do time-series databases address this?

Specialized TSDBs commonly optimize ingestion through techniques such as:

- Batch ingestion.
- Buffered writes.
- Sequential or append-oriented storage.
- Time-based partitioning.
- Efficient encoding.
- Compression.
- Specialized indexing.

The exact implementation varies by database.

For example, a system may buffer incoming measurements and write them in batches instead of independently processing every small record.

Conceptually:

```text
Incoming Measurements
     |   |   |   |
     v   v   v   v
  Write Buffer
       |
       v
  Batch Processing
       |
       v
  Storage Engine
```

Batching can reduce per-operation overhead.

**Important:** Traditional databases can also support batching, partitioning, and efficient bulk ingestion. The advantage of a TSDB comes from optimizing the entire workload, not from possessing a feature that SQL databases lack.

---

# 3. Challenge 2 — Continuous Data Ingestion

Time-series systems often receive data continuously.

Unlike a typical business application where users create or update records occasionally, a monitoring system may receive new measurements every second.

Example:

```text
10:00:00 → CPU = 40%
10:00:05 → CPU = 42%
10:00:10 → CPU = 45%
10:00:15 → CPU = 48%
10:00:20 → CPU = 51%
```

This process continues throughout the day.

## 3.1 Why continuous ingestion is different

Suppose an application has 1,000 servers.

Each server sends one record every second.

```text
1,000 records/second
```

After one minute:

```text
60,000 records
```

After one hour:

```text
3,600,000 records
```

After one day:

```text
86,400,000 records
```

The database must handle the incoming stream without creating excessive write contention or storage overhead.

## 3.2 Write amplification

Write amplification refers to a situation where the storage system performs more physical write work than the amount of new logical data supplied by the application.

For example, a single logical measurement may cause:

- Data-page modifications.
- Index updates.
- WAL or journal writes.
- Metadata updates.
- Later storage-engine maintenance.

The actual physical write volume can exceed the application's logical input volume.

Different storage engines have different write-amplification characteristics.

Specialized time-series systems attempt to reduce unnecessary storage work through buffering, batching, compression, and storage-engine design.

## 3.3 Batch ingestion

Instead of writing every measurement independently, an application can send multiple records in one batch.

Individual writes:

```javascript
for (const metric of metrics) {
  await insertMetric(metric);
}
```

This can create many separate database operations.

Batch-oriented approach:

```javascript
await insertMetrics(metrics);
```

The batch can be written in a single operation or a small number of operations.

Benefits may include:

- Fewer network round trips.
- Lower request overhead.
- Better storage efficiency.
- Improved ingestion throughput.

**Practical point:** Even when using a specialized TSDB, batching and buffering are important ingestion design decisions.

---

# 4. Challenge 3 — Massive Historical Data

Time-series databases accumulate data continuously.

The biggest problem is not always the speed of inserting new records. It is the amount of historical data that accumulates.

## 4.1 Storage growth calculation

Suppose:

- 5,000 servers.
- One measurement every 10 seconds.
- Average logical record size: 200 bytes.

Measurements per second:

\[
\frac{5,000}{10} = 500
\]

Measurements per day:

\[
500 \times 86,400 = 43,200,000
\]

Approximate logical data per day:

\[
43,200,000 \times 200
= 8,640,000,000 \text{ bytes}
\]

Approximately 8.64 GB per day using decimal units.

For 30 days:

\[
8.64 \times 30 = 259.2 \text{ GB}
\]

For one year:

\[
8.64 \times 365 = 3,153.6 \text{ GB}
\]

Approximately 3.15 TB of logical data per year.

This is before considering actual storage-engine overhead, indexes, replication, and compression.

## 4.2 Why historical data creates challenges

As the dataset grows:

- Indexes become larger.
- Queries may touch more storage.
- Disk usage increases.
- Backups take longer.
- Replication transfers more data.
- Retention becomes important.
- Storage costs increase.

A database that performs well with 10 million records may behave very differently with several billion records.

## 4.3 Historical queries

Suppose a monitoring dashboard requests:

```text
Show average CPU usage for the last 90 days.
```

If the database stores one measurement every second for 1,000 servers:

\[
90 \times 86,400 \times 1,000
= 7,776,000,000
\]

That is approximately 7.78 billion measurements.

The database cannot efficiently process every historical record without an appropriate storage layout and query strategy.

Time-series databases use techniques such as partition pruning, compression, and pre-aggregation to reduce the amount of work.

---

# 5. Challenge 4 — Time-Range Query Performance

Time-series applications frequently query records based on time intervals.

Examples:

- Last 5 minutes.
- Last 1 hour.
- Last 24 hours.
- Last 7 days.
- Last 90 days.

This creates a strong need for efficient time-based data access.

## 5.1 Traditional query without a suitable index

Suppose a table contains 100 million records.

```sql
SELECT *
FROM server_metrics
WHERE recorded_at >= '2026-11-14 10:00:00+00'
  AND recorded_at <  '2026-11-14 11:00:00+00';
```

Without a useful index or partition-pruning opportunity, the database may need to examine a large number of rows.

A full table scan can become expensive.

## 5.2 B-Tree indexing on timestamps

A relational database can create a timestamp index.

```sql
CREATE INDEX idx_metrics_recorded_at
ON server_metrics(recorded_at);
```

The index can help the database locate records within a time range.

Conceptually:

```text
Timestamp Index
      |
      v
Ordered timestamp values
      |
      v
Locate start of requested range
      |
      v
Read matching entries
```

This can substantially improve time-range queries.

However, an index does not make every large historical query cheap.

If the requested interval contains hundreds of millions of records, the database still has substantial work to perform.

## 5.3 Time-based partitioning

One approach is to divide data into time-based partitions.

Example:

```text
server_metrics
      |
      |-- metrics_2026_11_12
      |-- metrics_2026_11_13
      |-- metrics_2026_11_14
      |-- metrics_2026_11_15
```

Suppose the application requests data for November 14.

The database may only need to scan the relevant partition instead of considering every historical partition.

This is called partition pruning when the query planner excludes partitions that cannot contain matching rows.

Example in PostgreSQL:

```sql
CREATE TABLE server_metrics (
    server_id TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    cpu_usage DOUBLE PRECISION
) PARTITION BY RANGE (recorded_at);
```

Create a partition:

```sql
CREATE TABLE server_metrics_2026_11_14
PARTITION OF server_metrics
FOR VALUES FROM ('2026-11-14 00:00:00+00')
             TO ('2026-11-15 00:00:00+00');
```

Now a query restricted to that day can potentially use partition pruning.

## 5.4 How TSDBs approach time-range queries

Specialized systems often organize data around time internally.

Depending on the product, they may use:

- Time-based partitions or chunks.
- Time-oriented indexes.
- Compressed blocks.
- Metadata indexes.
- Specialized query execution.

This allows the system to avoid unnecessary historical data access.

**Important:** Time-based partitioning is not exclusive to TSDBs. PostgreSQL and other general-purpose databases support partitioning too.

---

# 6. Challenge 5 — Random I/O vs Sequential I/O

To understand storage performance, we need to understand two important concepts.

## 6.1 Random I/O

Random I/O involves reading or writing data at locations that are not necessarily adjacent on storage.

Example:

```text
Disk blocks:

Block 1
Block 2
Block 3
Block 4
Block 5
Block 6
```

A workload accesses:

```text
Block 2
Block 6
Block 1
Block 5
```

The access pattern jumps between locations.

Random I/O can be expensive, particularly on storage devices where access latency depends heavily on location.

Modern SSDs are much better at random access than traditional HDDs, but random I/O still has performance and resource costs.

## 6.2 Sequential I/O

Sequential I/O accesses data in a more continuous order.

Example:

```text
Block 1
   |
   v
Block 2
   |
   v
Block 3
   |
   v
Block 4
```

Sequential access can improve storage throughput because data is read or written in larger contiguous operations.

## 6.3 Why time-series workloads can benefit from sequential access

Time-series records are naturally associated with a time order.

Example:

```text
10:00:00
10:00:01
10:00:02
10:00:03
10:00:04
```

If storage is organized into time-oriented blocks, the database can read relevant ranges more efficiently.

Specialized TSDB architectures often exploit this property through append-oriented storage, buffering, block-based layouts, and compression.

## 6.4 Important qualification

Sequential storage is not automatically the best approach for every query.

A time-series application may also need to retrieve records for:

- A particular server.
- A particular sensor.
- A specific region.
- A particular metric.

A good storage architecture must balance time ordering with dimension-based access.

---

# 7. Challenge 6 — Indexing Overhead

Indexes improve query performance, but they consume resources.

Consider:

```sql
CREATE TABLE server_metrics (
    id BIGSERIAL PRIMARY KEY,
    server_id TEXT,
    region TEXT,
    recorded_at TIMESTAMPTZ,
    cpu_usage DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION
);
```

Suppose we create:

```sql
CREATE INDEX idx_server
ON server_metrics(server_id);

CREATE INDEX idx_region
ON server_metrics(region);

CREATE INDEX idx_recorded_at
ON server_metrics(recorded_at);

CREATE INDEX idx_cpu
ON server_metrics(cpu_usage);
```

Now every inserted record requires maintaining multiple indexes.

This can create:

- More disk writes.
- More storage usage.
- More cache pressure.
- More index maintenance.
- Slower ingestion.

## 7.1 The indexing tradeoff

| More indexes                 | Fewer indexes                    |
| ---------------------------- | -------------------------------- |
| More query access paths      | Less index maintenance           |
| Can improve selected queries | Can improve ingestion efficiency |
| More storage consumption     | Lower index storage              |
| More write overhead          | Less write overhead              |

The correct solution is not to remove every index.

Instead, identify the queries the application actually executes and build appropriate indexes.

## 7.2 How TSDBs optimize indexing

Time-series systems may use:

- Compact metadata indexes.
- Time-oriented indexes.
- Block-level indexes.
- Column-oriented storage.
- Compressed data blocks.

The goal is to avoid maintaining a large conventional row-oriented index structure for every individual measurement when the workload does not require it.

Implementation differs across databases.

---

# 8. Challenge 7 — High Cardinality

This is one of the most important concepts in time-series database design.

A poorly designed time-series schema can create serious performance and memory problems.

## 8.1 What is cardinality?

Cardinality refers to the number of unique values in a dimension or the number of unique combinations of dimensions.

Consider:

```text
region:
- india
- usa
- uk
```

There are three unique region values.

Now consider:

```text
server:
- server-001
- server-002
- server-003
...
- server-10000
```

There are 10,000 unique server values.

The server dimension has higher cardinality.

## 8.2 Low-cardinality dimensions

Examples:

| Dimension    | Approximate unique values |
| ------------ | ------------------------: |
| Environment  |                         3 |
| Region       |                        10 |
| HTTP method  |                         5 |
| Status class |                         5 |

These are relatively low-cardinality dimensions.

They are commonly useful for grouping and filtering.

## 8.3 High-cardinality dimensions

Examples:

| Dimension                              | Possible unique values |
| -------------------------------------- | ---------------------: |
| User ID                                |               Millions |
| Request ID                             |               Billions |
| Session ID                             |               Millions |
| Random UUID                            |   Potentially enormous |
| Unique URL containing user identifiers |   Potentially enormous |

These can create expensive indexing and metadata structures in some time-series systems.

## 8.4 Example of a cardinality problem

Suppose every API request generates a metric:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "endpoint": "/api/products",
  "request_id": "REQ-839274829",
  "response_time": 120
}
```

Now imagine `request_id` is stored as an indexed tag.

Every request may introduce a new unique value.

After millions of requests, the number of unique tag values becomes extremely large.

This can create excessive index and metadata overhead.

## 8.5 Better design

Instead of indexing every request ID as a metric dimension, consider:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "endpoint": "/api/products",
  "region": "india",
  "status": "200",
  "response_time": 120
}
```

Keep high-cardinality identifiers in a suitable event or trace store if individual-event lookup is required.

Use metrics for aggregated measurements.

## 8.6 Cardinality vs data volume

These are different concepts.

**Data volume** is how much data is stored or ingested.

**Cardinality** is how many distinct dimension values or combinations exist.

Example:

```text
1 billion measurements
3 regions
```

This may have enormous data volume but relatively low region cardinality.

Another example:

```text
1 million measurements
1 million unique request IDs
```

This has lower data volume but extremely high cardinality for the request ID dimension.

A system can struggle with either problem.

## 8.7 Cardinality and dimensional combinations

Suppose metrics use these dimensions:

- 100 servers.
- 10 regions.
- 5 environments.
- 20 endpoints.

The maximum possible combination count is:

\[
100 \times 10 \times 5 \times 20 = 1,000,000
\]

This is a theoretical upper bound if every combination exists.

Adding another dimension with 100,000 unique values can dramatically increase the number of possible combinations.

This is why metric-label and tag design matters.

**Rule:** Avoid using arbitrary unique identifiers as indexed metric dimensions unless the chosen database is designed and sized for that cardinality.

---

# 9. Challenge 8 — Storage Growth and Retention

Time-series data keeps arriving.

If the application never deletes or summarizes old measurements, storage requirements continue increasing.

Example:

```text
Day 1  → 10 GB
Day 2  → 20 GB
Day 3  → 30 GB
Day 4  → 40 GB
...
```

Eventually, storage becomes expensive.

## 9.1 Why not keep everything forever?

Not every historical record needs the same level of detail.

Suppose a monitoring system collects CPU usage every five seconds.

For recent incidents, five-second precision may be valuable.

For a report covering the previous year, one-hour averages may be sufficient.

Keeping all raw data forever can be unnecessarily expensive.

## 9.2 Retention policies

A retention policy defines how long data remains available.

Example:

| Data type                 | Retention |
| ------------------------- | --------- |
| Raw 5-second measurements | 7 days    |
| 1-minute aggregates       | 90 days   |
| 1-hour aggregates         | 2 years   |
| Daily summaries           | 5 years   |

A retention policy can remove expired data automatically.

## 9.3 Why time-based deletion matters

Suppose the database contains:

```text
November 1
November 2
November 3
...
November 30
```

The system needs to remove data older than a configured retention period.

Deleting millions of rows individually can create substantial overhead.

In a partitioned database, dropping or detaching an entire old partition can be much more efficient than deleting every row separately.

Example:

```sql
DROP TABLE server_metrics_2026_01;
```

This is only appropriate when the partition is no longer needed and the database's partition-management process is designed accordingly.

Specialized TSDBs often provide retention features that automate time-based expiration.

---

# 10. Challenge 9 — Aggregating Large Historical Datasets

Suppose an application collects CPU measurements every second.

The user opens a dashboard and requests:

```text
Average CPU usage over the last 12 months.
```

The database may need to process a very large number of records.

If the dashboard only displays monthly averages, scanning every raw observation is often unnecessary.

## 10.1 Raw data aggregation

Suppose we have:

```text
January:
1, 2, 3, 4, 5, ...
February:
1, 2, 3, 4, 5, ...
March:
1, 2, 3, 4, 5, ...
```

The system calculates averages directly from raw data.

For large datasets, this can be expensive.

## 10.2 Pre-aggregation

Instead, the system can calculate and store summarized data.

Example:

Raw data:

```text
10:00:00 → 30%
10:00:01 → 35%
10:00:02 → 40%
10:00:03 → 45%
10:00:04 → 50%
```

One-minute summary:

```text
10:00 → Average CPU: 40%
```

Now a dashboard querying monthly averages can operate on much less data.

## 10.3 Downsampling

Downsampling reduces the time resolution of data.

Example:

```text
Raw:
Every 1 second

Downsampled:
Every 1 minute

Further downsampled:
Every 1 hour
```

This reduces the amount of data needed for long-term analysis.

However, aggregation must preserve the statistics the application needs.

For example, storing only an average may be insufficient if users later need maximum and minimum values.

A better aggregate may store:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "average_cpu": 42.5,
  "minimum_cpu": 20.1,
  "maximum_cpu": 89.7,
  "sample_count": 60
}
```

For mathematically correct rollups, maintain sufficient information to combine aggregates. For averages, this generally means retaining sum and count rather than averaging averages without weighting.

We will study this in Part 16D.

---

# 11. Challenge 10 — Updates and Deletes

Time-series workloads are often append-heavy.

Measurements are usually inserted once and then queried repeatedly.

This means the database can optimize for a different pattern than a transactional application where records are frequently updated.

## 11.1 Traditional application workload

Example:

```text
User profile created
      |
      v
Email updated
      |
      v
Address updated
      |
      v
Profile modified again
```

Records may change over time.

## 11.2 Time-series workload

Example:

```text
10:00:00 → CPU = 40%
10:00:05 → CPU = 45%
10:00:10 → CPU = 43%
10:00:15 → CPU = 48%
```

Each new measurement represents a new observation.

Historical measurements are often not modified.

## 11.3 Why this difference matters

A storage engine optimized for frequent updates and deletes may maintain additional structures to handle those operations efficiently and safely.

A time-series workload often benefits from append-oriented storage because old measurements rarely change.

This can simplify some aspects of storage organization.

However, real time-series systems still need to handle:

- Late-arriving measurements.
- Duplicate measurements.
- Corrections.
- Out-of-order timestamps.
- Data deletion.
- Retention.

Append-heavy does not mean write-once under every circumstance.

---

# 12. Challenge 11 — Out-of-Order Data and Late Arrivals

An important practical issue is that measurements do not always arrive in timestamp order.

Suppose sensors generate:

```text
10:00:00 → 30%
10:00:05 → 35%
10:00:10 → 40%
```

But due to network delays, the database receives:

```text
10:00:00 → 30%
10:00:10 → 40%
10:00:05 → 35%
```

The data arrives out of order.

## 12.1 Why can this happen?

- Network latency.
- Device connectivity problems.
- Buffering.
- Queue delays.
- Batch delivery.
- Clock differences.
- Retries.

## 12.2 Why does it matter?

A TSDB may organize data into time-oriented blocks.

Late-arriving data can require additional work to insert into older time ranges or update existing storage structures.

The exact cost depends on the database.

Applications should distinguish:

- Event time: when the measurement actually occurred.
- Ingestion time: when the database or collector received it.

Example:

```json
{
  "event_time": "2026-11-14T10:00:05Z",
  "ingested_at": "2026-11-14T10:00:12Z",
  "cpu_usage": 35
}
```

This distinction is important for delayed sensor data and event pipelines.

---

# 13. Challenge 12 — Storage and Query Tradeoffs

No storage architecture is optimal for every operation.

Consider three requirements:

1. High write throughput.
2. Fast historical queries.
3. Low storage consumption.

Improving one can affect the others.

For example:

| Design choice                 | Benefit                     | Cost                                   |
| ----------------------------- | --------------------------- | -------------------------------------- |
| More indexes                  | Faster selected queries     | More write overhead and storage        |
| More frequent compression     | Lower storage               | CPU cost and possible write complexity |
| Longer retention              | More historical information | Higher storage requirements            |
| More aggressive downsampling  | Smaller historical datasets | Less detail                            |
| More frequent pre-aggregation | Faster dashboard queries    | Additional storage and processing      |
| Larger batches                | Lower ingestion overhead    | Potentially higher write latency       |

The right architecture depends on the application.

Example:

A real-time monitoring dashboard may prioritize recent metric visibility.

A historical analytics platform may prioritize compression and long-term storage.

They have different requirements.

---

# 14. How Specialized Time-Series Databases Address These Challenges

Let's connect the problems to common TSDB design approaches.

| Challenge                   | Common TSDB approach                                             |
| --------------------------- | ---------------------------------------------------------------- |
| High write throughput       | Buffered and batch ingestion                                     |
| Continuous ingestion        | Append-oriented storage                                          |
| Large historical data       | Compression and retention                                        |
| Slow time-range queries     | Time-based partitioning and indexing                             |
| Excessive random I/O        | Block-oriented and sequential access patterns                    |
| Index overhead              | Specialized metadata and indexing structures                     |
| High cardinality            | Cardinality-aware data modeling and indexing                     |
| Large aggregations          | Time-window aggregation and pre-aggregation                      |
| Storage growth              | Retention and downsampling                                       |
| Frequent updates            | Append-oriented design, with support for corrections as required |
| Late-arriving data          | Out-of-order ingestion handling                                  |
| Long-term dashboard queries | Rollups and compressed historical storage                        |

These are common techniques, not a guarantee that every TSDB implements every feature in the same way.

---

# 15. Practical Example — Monitoring a Node.js Application

Let's design a monitoring workload similar to a production backend.

Suppose we run five Node.js applications.

Each application produces metrics:

- CPU usage.
- Memory usage.
- Request count.
- Average response time.
- Error count.

Assume each application exports one metric batch every five seconds.

## 15.1 Data model

Example:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "application": "campaign-api",
  "environment": "production",
  "region": "india",
  "cpu_usage": 45.5,
  "memory_usage": 72.1,
  "request_count": 250,
  "average_response_time_ms": 125,
  "error_count": 3
}
```

## 15.2 Ingestion calculation

Five applications:

```text
5 applications × 1 batch every 5 seconds
```

Batches per second:

\[
\frac{5}{5} = 1
\]

Batches per day:

\[
1 \times 86,400 = 86,400
\]

If each batch contains 100 individual metric samples:

\[
86,400 \times 100 = 8,640,000
\]

Approximately 8.64 million samples per day.

## 15.3 Query requirements

The monitoring dashboard needs:

- CPU usage for the last hour.
- Maximum memory usage today.
- Error count per application.
- Average response time per endpoint.
- Daily request volume.

These queries are naturally time-oriented.

## 15.4 What problems might appear as the application grows?

1. More applications increase ingestion.
2. More endpoints increase dimension cardinality.
3. Historical data increases storage.
4. Long-range dashboards scan more data.
5. Excessive labels create indexing overhead.
6. Frequent dashboard refreshes create query load.
7. Long retention increases storage costs.

A TSDB architecture can address these challenges through batching, compression, partitioning, aggregation, and retention.

---

# 16. Practical Database Design Guidelines

When designing a time-series system, follow these principles.

## 16.1 Identify the measurement frequency

Ask:

- How often is each metric generated?
- How many devices or applications generate it?
- Can measurements arrive in batches?
- What is the expected peak ingestion rate?

Calculate daily and yearly data volume before selecting infrastructure.

## 16.2 Design dimensions carefully

Use dimensions that support actual query requirements.

Examples:

- Application.
- Environment.
- Region.
- Server.
- Endpoint.

Avoid blindly indexing:

- Request IDs.
- Random UUIDs.
- Unique session IDs.
- Arbitrary user identifiers.

Use a separate event or trace storage design when individual-event lookup is necessary.

## 16.3 Define retention requirements

Decide:

- How long raw data is needed.
- How long aggregated data is needed.
- Which data can be deleted.
- Which metrics require long-term history.

## 16.4 Define dashboard query patterns

Understand the actual queries:

- Last 5 minutes.
- Last 1 hour.
- Last 24 hours.
- Average per minute.
- Maximum per hour.
- Group by server.
- Group by region.

Storage and indexing should support these patterns.

## 16.5 Consider late-arriving data

Determine:

- Whether measurements can arrive late.
- How far back late data can arrive.
- Whether duplicates are possible.
- How timestamps are synchronized.
- How corrections are handled.

## 16.6 Avoid unnecessary metric granularity

Collecting every possible measurement at the highest frequency can create enormous storage and ingestion costs.

The sampling interval should match the operational value of the metric.

For example:

- CPU monitoring may need five-second resolution.
- A daily business KPI may need only daily resolution.

---

# 17. Interview Questions and Answers

## Q1. Why can traditional databases struggle with large time-series workloads?

Because continuous high-volume ingestion, large historical datasets, time-range queries, aggregation workloads, and retention requirements can create substantial indexing, storage, and query overhead.

## Q2. Can PostgreSQL handle time-series data?

Yes. PostgreSQL supports timestamp columns, B-Tree indexes, table partitioning, aggregation, and other useful features. TimescaleDB adds specialized time-series functionality.

## Q3. What is write throughput?

The number of records or amount of data a database can successfully write per unit of time.

## Q4. What is write amplification?

It is the additional physical storage work caused by a logical write, such as data-page writes, index updates, logs, and storage-engine maintenance.

## Q5. Why is indexing expensive in write-heavy workloads?

Every relevant index must be maintained when records are inserted or modified. This increases CPU, storage, and I/O work.

## Q6. What is partition pruning?

Partition pruning is when a database excludes partitions that cannot contain records matching a query.

## Q7. Why is time-based partitioning useful?

It organizes historical records into time ranges, allowing relevant partitions to be accessed while unrelated historical partitions can be skipped.

## Q8. What is the difference between random and sequential I/O?

Random I/O accesses non-adjacent storage locations. Sequential I/O accesses data in a more continuous order.

Sequential access can provide better throughput for suitable workloads.

## Q9. What is cardinality?

Cardinality refers to the number of distinct values or combinations in a dimension or indexed field.

## Q10. Why is high cardinality problematic?

High-cardinality dimensions can create large indexing and metadata structures, consuming memory and storage and making queries more expensive.

## Q11. Is data volume the same as cardinality?

No. Data volume measures how much data exists. Cardinality measures how many distinct values or combinations exist.

## Q12. Why are retention policies important?

They prevent historical data from growing indefinitely by automatically removing data that is no longer required.

## Q13. What is downsampling?

Downsampling reduces the resolution of historical data, such as converting five-second measurements into one-minute summaries.

## Q14. What is pre-aggregation?

Pre-aggregation calculates and stores summaries before a query needs them, reducing repeated computation over raw data.

## Q15. What is out-of-order data?

It is data that arrives in a different order from its event timestamps.

For example, a measurement from 10:00:05 may arrive after a measurement from 10:00:10.

## Q16. What is the difference between event time and ingestion time?

Event time is when the measurement occurred. Ingestion time is when the storage or collection system received it.

## Q17. Why are time-series workloads often append-heavy?

Because monitoring systems continuously generate new observations, while historical measurements are frequently read and aggregated rather than updated.

## Q18. Does every time-series workload require a dedicated TSDB?

No. General-purpose databases can handle many time-series workloads. A dedicated TSDB becomes useful when workload scale, ingestion rates, retention, compression, and query patterns justify its specialized architecture.

---

# 18. Practical Exercises

## Exercise 1 — Calculate ingestion volume

A system has:

- 2,000 servers.
- One metric record every 2 seconds.
- 86,400 seconds per day.

Calculate:

1. Records per second.
2. Records per day.
3. Records per 30 days.

**Answers:**

```text
Records per second:
2,000 / 2 = 1,000

Records per day:
1,000 × 86,400 = 86,400,000

Records per 30 days:
86,400,000 × 30 = 2,592,000,000
```

Approximately 2.592 billion records in 30 days.

## Exercise 2 — Identify cardinality problems

Consider these dimensions:

| Dimension   | Values                           |
| ----------- | -------------------------------- |
| Environment | production, staging, development |
| Region      | India, USA, UK                   |
| HTTP method | GET, POST, PUT, DELETE           |
| Request ID  | Unique for every request         |
| Session ID  | Unique for every user session    |

Questions:

1. Which dimensions have relatively low cardinality?
2. Which dimensions can have very high cardinality?
3. Why might indexing request IDs as metric tags be expensive?
4. Where could individual request details be stored instead?

## Exercise 3 — Design retention policies

A monitoring platform needs:

- Detailed metrics for recent incident investigation.
- Historical trends for management reports.
- Long-term yearly summaries.

Design a retention strategy for:

1. Raw measurements.
2. Minute-level aggregates.
3. Hourly aggregates.
4. Daily summaries.

Explain the storage and information-loss tradeoffs.

## Exercise 4 — Diagnose slow queries

A dashboard displays CPU usage over the last 180 days.

The database contains billions of raw measurements.

Questions:

1. Why might this query be expensive?
2. Would a timestamp index alone solve the problem?
3. How can time-based partitioning help?
4. How can pre-aggregation help?
5. What information would you preserve in the aggregates?

## Exercise 5 — Design a Node.js monitoring system

Your Node.js application has:

- 20 servers.
- 10 API endpoints per server.
- One metric collection interval every 5 seconds.

Design a system that collects:

- Request count.
- Average response time.
- Error count.
- CPU utilization.
- Memory utilization.

Explain:

1. How metrics are collected.
2. How measurements are batched.
3. Which fields should be dimensions.
4. Which values should be measurements.
5. How long raw data should be retained.
6. How long-term dashboards should query summarized data.

---

# 19. Final Revision Sheet

| Challenge                 | Why it matters                               | Common solution                            |
| ------------------------- | -------------------------------------------- | ------------------------------------------ |
| High write throughput     | Continuous ingestion can overwhelm resources | Batching and optimized ingestion           |
| Continuous data ingestion | New records arrive constantly                | Buffering and append-oriented storage      |
| Large historical datasets | Storage and query costs increase             | Compression and retention                  |
| Slow time-range queries   | Large datasets require expensive scans       | Time indexes and partitioning              |
| Random I/O                | Can reduce storage throughput                | Efficient block and sequential access      |
| Index maintenance         | Adds write and storage overhead              | Workload-specific indexing                 |
| High cardinality          | Creates large metadata/index structures      | Careful dimension design                   |
| Large aggregations        | Raw historical scans are expensive           | Pre-aggregation and downsampling           |
| Storage growth            | Data accumulates indefinitely                | Retention policies                         |
| Late-arriving data        | Arrival order differs from event time        | Out-of-order ingestion handling            |
| Frequent updates          | Can conflict with append-heavy optimization  | Appropriate correction and update strategy |
