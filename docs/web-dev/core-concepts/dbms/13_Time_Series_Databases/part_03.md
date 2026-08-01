---
sidebar_label: Time-Series Database Internal Architecture
sidebar_position: 1
---

# Time-Series Database Internal Architecture

## 1. Introduction

In last section, we studied why traditional databases struggle with certain time-series workloads:

- Continuous, high-volume writes.
- Large historical datasets.
- Time-range queries.
- High-cardinality labels and dimensions.
- Storage growth.
- Aggregations over millions or billions of records.
- Out-of-order and late-arriving events.

Time-series databases address these challenges through specialized storage architectures.

Their internal design often focuses on:

1. Efficient ingestion of continuous data.
2. Buffering writes before committing them to long-term storage.
3. Organizing data into time-based partitions or blocks.
4. Storing measurements efficiently, often using column-oriented layouts.
5. Compressing repetitive timestamp and value patterns.
6. Maintaining indexes and metadata for fast filtering.
7. Executing queries across relevant time ranges without scanning the entire dataset.
8. Managing durability, compaction, and retention.

The important point is that **not every time-series database uses the same internal architecture**.

Some use LSM-tree-inspired storage. Others use immutable time-range blocks, PostgreSQL's storage engine, or their own specialized designs.

We will understand the common concepts first and then compare real implementations.

---

# 2. Overall Time-Series Database Architecture

A typical time-series monitoring system can be understood through the following layers.

```text
                    DATA PRODUCERS
                           |
              +------------+------------+
              |            |            |
           Servers       Apps        Devices
              |            |            |
              +------------+------------+
                           |
                           v
                  INGESTION LAYER
               (Agents / Collectors / API)
                           |
                           v
                  WRITE BUFFERING
                  (Batching / Queues)
                           |
                           v
                  DURABILITY LAYER
                         (WAL)
                           |
                           v
                  IN-MEMORY STORAGE
                (Head / Memtable / Cache)
                           |
                           v
                  PERSISTENT STORAGE
             (Chunks / Blocks / Segments)
                           |
             +-------------+-------------+
             |                           |
             v                           v
       INDEX / METADATA             COMPRESSION
             |                           |
             +-------------+-------------+
                           |
                           v
                    QUERY ENGINE
                           |
                           v
                 DASHBOARDS / ALERTS
```

This is a conceptual architecture, not a mandatory sequence used by every database.

For example, a database may write to a WAL before inserting into an in-memory structure. Another may have a different buffering and persistence arrangement.

## 2.1 Data producers

These are the systems generating time-series data.

Examples:

- Application servers.
- Databases.
- Network devices.
- IoT sensors.
- Payment services.
- CPU and memory monitoring agents.

A server might generate:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "metric": "cpu_usage",
  "value": 72.5,
  "host": "server-01",
  "region": "india"
}
```

Each observation has a time component and one or more associated values or dimensions.

## 2.2 Ingestion layer

The ingestion layer receives data from producers.

It may expose:

- HTTP APIs.
- Remote-write protocols.
- TCP or UDP endpoints.
- Message queues.
- Database-specific ingestion protocols.

Its responsibilities can include:

- Parsing incoming measurements.
- Validating timestamps and values.
- Identifying the metric or series.
- Applying labels and metadata.
- Rejecting malformed data.
- Batching incoming records.

Some systems use separate agents or collectors to receive and forward measurements.

## 2.3 Storage layer

The storage layer is responsible for persisting the data.

Depending on the engine, it may contain:

- Write-ahead logs.
- In-memory buffers.
- Memtables.
- Immutable files.
- Time-based blocks.
- Compressed columnar data.
- Indexes and metadata.

## 2.4 Query layer

The query layer accepts requests such as:

```sql
SELECT
    date_trunc('minute', timestamp) AS minute,
    AVG(cpu_usage)
FROM server_metrics
WHERE host = 'server-01'
  AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute;
```

A specialized time-series database may use a different query language, but the conceptual task is similar:

1. Determine the requested time range.
2. Identify relevant metrics or series.
3. Locate the required storage blocks.
4. Read and decompress relevant data.
5. Apply filters and aggregations.
6. Return the results.

---

# 3. Understanding the Write Path

The write path describes what happens internally when new measurements enter a time-series database.

Consider this incoming measurement:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "metric": "cpu_usage",
  "value": 72.5,
  "host": "server-01"
}
```

A simplified write path looks like this:

```text
Client
  |
  v
Ingestion API
  |
  v
Validation and Parsing
  |
  v
Series Identification
  |
  v
Write Buffer / Batch
  |
  +-------> WAL
  |
  v
In-Memory Storage
  |
  v
Flush
  |
  v
Persistent Blocks / Files
  |
  v
Index and Metadata Updates
```

The exact ordering and durability guarantees differ by database.

Let's understand the major stages.

## 3.1 Step 1: Receiving the measurement

The database receives a measurement from a client, agent, or collector.

For example, a Node.js monitoring service sends:

```javascript
const measurement = {
  timestamp: Date.now(),
  metric: "http_requests",
  value: 120,
  labels: {
    service: "payment-api",
    environment: "production",
    region: "india",
  },
};
```

The ingestion system parses the request and checks whether the data is valid.

Possible validations:

- Is the timestamp valid?
- Is the measurement format correct?
- Is the value acceptable?
- Are the required labels present?
- Is the payload within configured limits?

## 3.2 Step 2: Identifying the time series

A time series represents a sequence of observations associated with a particular metric and set of dimensions.

For example:

```text
metric: cpu_usage
labels:
  host = server-01
  region = india
```

This combination identifies a particular series in systems that use metric-plus-label identity.

Another series could be:

```text
metric: cpu_usage
labels:
  host = server-02
  region = india
```

The metric is the same, but the label set is different.

This distinction matters because the database needs to organize and retrieve measurements belonging to the same series.

Not every database uses this exact data model. Relational time-series systems may instead represent these values through rows, columns, and indexes.

## 3.3 Step 3: Buffering and batching

Instead of immediately writing every measurement as an independent disk operation, databases may collect measurements in memory.

For example, an application sends:

```text
Measurement 1
Measurement 2
Measurement 3
Measurement 4
Measurement 5
```

The database can group them into a batch and process them together.

Benefits:

- Fewer individual disk operations.
- Reduced per-write overhead.
- Better sequential I/O behavior.
- Improved ingestion throughput.

However, buffering introduces a tradeoff.

If the database acknowledges a write before the data is safely persisted, a crash could result in data loss unless another durability mechanism protects it.

That is one reason WALs are important.

---

# 4. Write Buffers

A write buffer temporarily holds incoming data before it is written into its long-term storage format.

There are two important ideas:

- Buffering: temporarily collecting data.
- Batching: processing multiple measurements together.

They are related, but not identical.

## 4.1 Why buffering is useful

Suppose a monitoring system receives 100,000 measurements per second.

Writing each measurement independently can create substantial overhead.

Instead, the system might collect measurements into batches:

```text
Incoming measurements:

M1 M2 M3 M4 M5 M6 M7 M8 M9 M10
              |
              v
         Write Buffer
              |
              v
           Batch 1
              |
              v
         Storage Engine
```

The buffer allows the database to process groups of measurements efficiently.

## 4.2 Flush conditions

A buffer cannot remain in memory indefinitely.

The database eventually flushes buffered data into a persistent or immutable storage structure.

Common flush conditions include:

| Condition       | Explanation                                  |
| --------------- | -------------------------------------------- |
| Size threshold  | Buffer reaches a configured size             |
| Time threshold  | A configured interval has elapsed            |
| Memory pressure | Available memory becomes insufficient        |
| Shutdown        | Database performs a controlled shutdown      |
| Internal policy | Storage engine decides flushing is necessary |

For example:

```text
Flush when:

Buffer size >= 64 MB

OR

Time since last flush >= 10 seconds
```

These values are illustrative, not universal defaults.

## 4.3 Buffer size tradeoffs

| Smaller buffer                   | Larger buffer                      |
| -------------------------------- | ---------------------------------- |
| More frequent flushes            | Less frequent flushes              |
| Lower buffering delay            | Potentially higher buffering delay |
| More frequent storage operations | Better batching opportunities      |
| Lower memory consumption         | Higher memory consumption          |

A larger buffer does not automatically mean better performance.

The correct configuration depends on:

- Incoming write rate.
- Available RAM.
- Storage throughput.
- Durability requirements.
- Query workload.
- Database implementation.

## 4.4 Backpressure

One of the most important concepts in high-throughput ingestion is backpressure.

Suppose:

```text
Incoming rate = 100,000 measurements/second

Storage processing rate = 60,000 measurements/second
```

The system receives data faster than it can persist it.

The backlog grows:

```text
Second 1:  40,000 pending
Second 2:  80,000 pending
Second 3: 120,000 pending
Second 4: 160,000 pending
```

If this continues, the database may eventually exhaust available memory or disk space.

Backpressure mechanisms help control this situation.

Possible approaches:

- Slow down producers.
- Reject excess writes.
- Return retryable errors.
- Apply ingestion limits.
- Use bounded queues.
- Temporarily reduce nonessential work.
- Scale the ingestion or storage capacity.

**Important:** An unbounded queue does not solve an ingestion bottleneck. It only delays failure by consuming more memory.

---

# 5. Memtables and Immutable Storage Structures

Many storage engines use a pattern in which writes first enter memory and are later persisted into immutable files.

This is closely associated with LSM-tree architectures.

However, not every time-series database uses an LSM tree.

## 5.1 What is a memtable?

A memtable is an in-memory data structure used by an LSM-based storage engine to organize recently written records.

Consider incoming data:

```text
10:00:01 -> 45
10:00:02 -> 48
10:00:03 -> 51
10:00:04 -> 49
```

The storage engine keeps recent records in an in-memory structure.

Conceptually:

```text
                 Incoming Writes
                        |
                        v
                    Memtable
                        |
             +----------+----------+
             |          |          |
          10:00:01   10:00:02   10:00:03
             |          |          |
             +----------+----------+
                        |
                        v
                  Flush Threshold
                        |
                        v
                 Immutable File
```

The memtable may be organized using an ordered structure, such as a balanced tree or another implementation-specific data structure.

The important property is that it supports efficient in-memory insertion and later flushing.

## 5.2 Why immutable files?

Once the in-memory structure is flushed, the database may create an immutable storage file.

Immutable means the stored file is not modified in place for ordinary new writes.

Instead:

- New records enter a new in-memory structure.
- The current in-memory structure is flushed into another file.
- Existing immutable files remain unchanged.
- Background compaction may combine or rewrite files.

Example:

```text
                Memtable
                    |
                    v
                 Flush
                    |
                    v
              SSTable 1

                Memtable
                    |
                    v
                 Flush
                    |
                    v
              SSTable 2

                Memtable
                    |
                    v
                 Flush
                    |
                    v
              SSTable 3
```

SSTable stands for Sorted String Table.

An SSTable is generally an immutable, sorted data file used in LSM-based storage engines.

## 5.3 Why use immutable storage?

Immutable files offer several advantages:

1. Sequential file creation can be efficient.
2. Existing files do not require in-place modification for every new write.
3. Background compaction can reorganize data.
4. Data structures can be optimized for reads.
5. Crash recovery can be simplified when combined with a WAL.

But immutable files also introduce tradeoffs.

For example, one logical query may need to examine multiple files.

The engine must identify relevant files, merge results, and manage duplicate or superseded records where applicable.

## 5.4 Compaction

Over time, an LSM-based system can accumulate multiple immutable files.

Compaction combines or reorganizes these files.

```text
Before compaction:

SSTable 1
SSTable 2
SSTable 3
SSTable 4
SSTable 5

        |
        v
    Compaction

        |
        v

SSTable A
SSTable B
```

Compaction can:

- Merge sorted data.
- Remove obsolete versions.
- Reorganize records.
- Improve read efficiency.
- Reduce storage overhead.

However, compaction consumes CPU, memory, and disk I/O.

It can also compete with normal ingestion and queries.

This is one reason storage engines carefully manage compaction scheduling and resource limits.

### Important distinction

Do not assume every time-series database uses memtables, SSTables, and classic LSM compaction.

For example:

- Cassandra uses an LSM-tree-based storage architecture.
- Prometheus uses a Head block, WAL, and immutable blocks.
- TimescaleDB uses PostgreSQL storage and its own hypertable/chunk management.
- VictoriaMetrics has its own specialized storage design.

These architectures solve similar problems but are not internally identical.

---

# 6. Time-Based Partitions and Chunks

Time-series data is naturally organized around time.

Instead of storing years of measurements as one undivided dataset, databases often divide the data into time-based partitions, chunks, or blocks.

## 6.1 What is time-based partitioning?

Suppose a monitoring system stores CPU metrics.

It receives:

```text
November 1
November 2
November 3
November 4
November 5
November 6
```

The database could organize data into daily partitions:

```text
metrics
  |
  +-- partition_2026_11_01
  |
  +-- partition_2026_11_02
  |
  +-- partition_2026_11_03
  |
  +-- partition_2026_11_04
  |
  +-- partition_2026_11_05
  |
  +-- partition_2026_11_06
```

A query requesting November 4 may only need to inspect the relevant partition.

This is called partition pruning.

## 6.2 Why partitioning improves query performance

Consider this query:

```sql
SELECT AVG(cpu_usage)
FROM server_metrics
WHERE timestamp >= '2026-11-04 00:00:00'
  AND timestamp <  '2026-11-05 00:00:00';
```

Without effective partition pruning, the database might need to inspect a much larger amount of historical data.

With time-based partitions, it can identify the relevant partition first.

```text
Requested range:
November 4

Available partitions:

Nov 1  -> Skip
Nov 2  -> Skip
Nov 3  -> Skip
Nov 4  -> Read
Nov 5  -> Skip
Nov 6  -> Skip
```

The database avoids unnecessary storage reads.

## 6.3 Chunks

A chunk is a bounded portion of time-series data.

Some databases use the term chunk for their time-partitioned storage units.

For example, a hypertable in TimescaleDB is divided into chunks according to a time dimension and, optionally, additional partitioning dimensions.

```text
Hypertable: server_metrics

       |
       +-- Chunk 1: November 1–7
       |
       +-- Chunk 2: November 8–14
       |
       +-- Chunk 3: November 15–21
       |
       +-- Chunk 4: November 22–28
```

The intervals above are illustrative.

The actual chunk interval is configurable.

## 6.4 Blocks

Some time-series engines organize data into immutable blocks covering specific time ranges.

For example, Prometheus periodically creates persistent blocks from data in its Head block.

```text
Prometheus TSDB

          Head Block
               |
               v
          Persistent
            Blocks

       +-------+-------+
       |       |       |
       v       v       v
     Block 1 Block 2 Block 3
```

Each block covers a time interval and contains data and associated metadata.

Blocks may later be compacted into larger blocks.

## 6.5 Choosing partition or chunk size

The time interval of a partition or chunk affects performance and operational overhead.

| Smaller chunks                              | Larger chunks                                  |
| ------------------------------------------- | ---------------------------------------------- |
| More partitions                             | Fewer partitions                               |
| More metadata overhead                      | Less metadata overhead                         |
| More granular retention operations          | Coarser retention operations                   |
| Potentially better pruning for short ranges | Potentially better efficiency for broad ranges |
| More management overhead                    | Larger individual storage units                |

There is no universally optimal chunk interval.

It depends on:

- Ingestion volume.
- Query range.
- Number of series.
- Data retention period.
- Available storage.
- Compression behavior.
- Maintenance operations.

---

# 7. Column-Oriented Storage

Column-oriented storage is one of the most important techniques for analytical time-series workloads.

To understand it, first compare row-oriented and column-oriented storage.

## 7.1 Row-oriented storage

In row-oriented storage, values belonging to a record are stored together.

Consider this table:

| timestamp | host      | cpu_usage | memory_usage |
| --------- | --------- | --------: | -----------: |
| 10:00     | server-01 |        70 |           65 |
| 10:01     | server-01 |        72 |           68 |
| 10:02     | server-01 |        75 |           70 |

A simplified row-oriented representation is:

```text
Row 1:
[10:00, server-01, 70, 65]

Row 2:
[10:01, server-01, 72, 68]

Row 3:
[10:02, server-01, 75, 70]
```

The values of each row are stored together.

This layout is useful for workloads that frequently retrieve or modify complete records.

## 7.2 Column-oriented storage

In column-oriented storage, values from the same column are stored together.

The same data becomes:

```text
timestamp:
[10:00, 10:01, 10:02]

host:
[server-01, server-01, server-01]

cpu_usage:
[70, 72, 75]

memory_usage:
[65, 68, 70]
```

This layout is particularly useful when a query needs only a few columns from a large dataset.

## 7.3 Why columnar storage helps time-series queries

Suppose we run:

```sql
SELECT AVG(cpu_usage)
FROM server_metrics
WHERE timestamp >= '2026-11-14 00:00:00';
```

The query only needs:

- Timestamp.
- CPU usage.

It does not need memory usage or other unrelated fields.

In a columnar format, the database can often read only the relevant column data and metadata.

This reduces unnecessary data access.

Benefits include:

1. Efficient analytical scans.
2. Better compression for similar values.
3. Reduced I/O when only selected columns are needed.
4. Efficient aggregations over large datasets.

## 7.4 Why similar values compress better

Consider this CPU column:

```text
70, 71, 72, 72, 73, 74, 74, 75
```

These values are relatively similar.

Instead of independently storing every value using its full representation, a compression algorithm can exploit patterns between values.

Similarly, timestamps often increase predictably:

```text
10:00:00
10:00:10
10:00:20
10:00:30
```

The database can encode the differences rather than repeatedly storing complete timestamps.

We will examine these techniques in the next section.

## 7.5 Columnar storage tradeoffs

Columnar storage is not automatically better for every workload.

| Workload                                   | Row-oriented              | Column-oriented                      |
| ------------------------------------------ | ------------------------- | ------------------------------------ |
| Fetch complete records                     | Often suitable            | May require reading multiple columns |
| Scan one column across millions of records | Can be less efficient     | Often highly efficient               |
| Analytical aggregation                     | May read unnecessary data | Often efficient                      |
| Frequent individual updates                | Often more suitable       | Can be more expensive                |
| Compression of similar values              | Depends on format         | Often very effective                 |

Some databases use hybrid storage approaches.

For example, a database may initially store recent data in a row-oriented format and later compress older chunks into a columnar format.

TimescaleDB supports columnar/compressed storage capabilities, but exact implementation and configuration details vary by version.

---

# 8. Compression Techniques in Time-Series Databases

Time-series data often contains predictable patterns.

Examples:

- Timestamps increase continuously.
- Measurements may change gradually.
- Many labels repeat.
- Some values remain constant for long periods.

Compression algorithms exploit these patterns.

The main objective is to reduce storage consumption while keeping data accessible for queries.

## 8.1 Delta Encoding

Delta encoding stores the difference between consecutive values rather than storing every complete value.

Suppose timestamps are:

```text
1000
1010
1020
1030
1040
```

Instead of storing all five values, we can store:

```text
1000, +10, +10, +10, +10
```

The first value is stored directly.

Subsequent values are represented as differences.

This is useful when timestamps have regular intervals.

## 8.2 Delta-of-Delta Encoding

Delta-of-delta encoding stores the difference between consecutive deltas.

Consider timestamps:

```text
1000
1010
1020
1030
1040
```

First, calculate the deltas:

```text
+10
+10
+10
+10
```

Then calculate the differences between the deltas:

```text
0
0
0
```

The sequence can conceptually be represented as:

```text
First timestamp: 1000
First delta:     10
Delta-of-delta:  0, 0, 0
```

Why is this useful?

When measurements arrive at regular intervals, the delta-of-delta values are frequently zero.

Repeated zero values can be represented very efficiently.

Real systems use encoding formats with additional rules for variable intervals and exceptional values.

## 8.3 Run-Length Encoding (RLE)

Run-length encoding stores repeated consecutive values as a value plus a count.

Example:

```text
Original:

0, 0, 0, 0, 0, 1, 1, 1, 2, 2

Compressed:

(0, 5), (1, 3), (2, 2)
```

This is useful when values remain unchanged for long periods.

Example:

```text
Server status:

UP, UP, UP, UP, DOWN, DOWN, UP
```

A run-length representation can reduce repeated data.

However, RLE is less effective when values change frequently.

## 8.4 Dictionary Encoding

Dictionary encoding is useful when a column contains a limited set of repeated strings.

Consider:

```text
region:

india
india
india
us
us
europe
india
```

Instead of repeatedly storing the same strings, a dictionary can map them to compact identifiers:

```text
Dictionary:

1 -> india
2 -> us
3 -> europe
```

Encoded values:

```text
1, 1, 1, 2, 2, 3, 1
```

This can significantly reduce storage when labels repeat.

## 8.5 Bit Packing

Bit packing stores integer values using the minimum number of bits needed for their representation, where the encoding format permits it.

Suppose a sequence contains small integers:

```text
1, 2, 3, 4, 5, 6, 7, 8
```

Each value can be represented using only a small number of bits.

A conventional 32-bit integer representation would use substantially more space.

Bit packing is especially useful when encoding bounded integer values or small deltas.

## 8.6 XOR-based Floating-Point Compression

Floating-point values often change gradually.

Example:

```text
72.50
72.51
72.52
72.53
72.54
```

The binary representations of consecutive values may share many bits.

An XOR-based encoding compares the binary representations of consecutive values and stores the changing information.

A well-known example is the Gorilla compression technique.

Conceptually:

```text
Value 1: 72.50
Value 2: 72.51
Value 3: 72.52

         |
         v

Compare binary representations
         |
         v

Store shared and changing bit information
```

This can be effective for floating-point time-series data.

It is not a guarantee that every sequence compresses equally well. Compression depends on the actual data patterns.

## 8.7 Compression comparison

| Technique           | Main idea                              | Useful for                       |
| ------------------- | -------------------------------------- | -------------------------------- |
| Delta encoding      | Store differences                      | Increasing timestamps and values |
| Delta-of-delta      | Store differences between differences  | Regular timestamp intervals      |
| Run-length encoding | Store repeated values as value + count | Repeated or constant values      |
| Dictionary encoding | Replace repeated strings with IDs      | Labels and categories            |
| Bit packing         | Use fewer bits per integer             | Small integers and deltas        |
| XOR encoding        | Store changes between binary values    | Floating-point measurements      |

### Important tradeoff

Compression reduces storage requirements, but query execution may need to decompress data.

Some engines use techniques that allow filtering or processing encoded data without fully decompressing everything.

The best approach depends on:

- Compression ratio.
- CPU cost.
- Query patterns.
- Data distribution.
- Ingestion requirements.

---

# 9. Indexing and Metadata Structures

Time-series databases need a way to find relevant data quickly.

They often maintain metadata and indexes that answer questions such as:

- Which series contain the metric `cpu_usage`?
- Which series belong to `server-01`?
- Which blocks cover a requested time range?
- Which chunks contain the requested records?
- What is the minimum and maximum timestamp in a block?

Different databases implement these structures differently.

## 9.1 Time-based metadata

A database may maintain information about the time range covered by a block.

For example:

```text
Block A:
Minimum time: 10:00
Maximum time: 10:59

Block B:
Minimum time: 11:00
Maximum time: 11:59

Block C:
Minimum time: 12:00
Maximum time: 12:59
```

Suppose a query requests:

```text
11:15 to 11:45
```

The database can identify Block B as relevant.

It can skip Blocks A and C.

This is an example of metadata-assisted pruning.

## 9.2 Series identity

In metric-oriented systems, a series is often identified by:

```text
Metric name + Label set
```

Example:

```text
cpu_usage{
  host="server-01",
  region="india"
}
```

The same metric with a different label set represents a different series.

A database may maintain a series identifier or internal reference for each unique series.

Conceptually:

```text
Series ID: 101

Metric: cpu_usage

Labels:
  host = server-01
  region = india
```

Incoming measurements can reference this identity rather than repeatedly rebuilding the full label representation.

The exact implementation differs across engines.

## 9.3 Label indexes and postings lists

Prometheus uses an index structure that supports finding series by metric names and labels.

One important concept is a postings list.

A postings list associates a label or label value with the series identifiers that contain it.

Example:

```text
Series:

101 -> cpu_usage, host=server-01
102 -> cpu_usage, host=server-02
103 -> memory_usage, host=server-01
104 -> cpu_usage, host=server-03
```

Conceptual postings:

```text
metric = cpu_usage

[101, 102, 104]

host = server-01

[101, 103]

host = server-02

[102]
```

Now consider:

```text
cpu_usage AND host=server-01
```

The engine can intersect the relevant postings:

```text
[101, 102, 104]
        AND
[101, 103]
        |
        v
       [101]
```

It identifies series 101 as the matching series.

This is conceptually similar to set intersection.

Prometheus postings lists are not identical to Elasticsearch's inverted-index implementation, even though both involve mapping terms or label values to document-like identifiers.

## 9.4 Metadata structures

A time-series database may maintain metadata such as:

- Series identifiers.
- Label indexes.
- Block time ranges.
- Chunk offsets.
- Column locations.
- Compression information.
- Minimum and maximum values.
- Storage file references.

This metadata helps the query engine avoid unnecessary reads.

## 9.5 High-cardinality indexing problem

Suppose we use:

```text
metric = http_requests
labels:
  host
  region
  user_id
  request_id
```

If `user_id` and `request_id` have millions of unique values, the number of distinct series can become enormous.

This creates high cardinality.

Consequences may include:

- Larger index structures.
- Higher memory usage.
- More metadata.
- More expensive series lookup.
- Increased ingestion overhead.
- More complex query execution.

For example, adding a unique `request_id` label to every request can create a separate series for nearly every request.

That is generally a poor metric-label design.

Use labels for bounded dimensions such as:

```text
service
environment
region
status_code
```

Be careful with unbounded dimensions such as:

```text
user_id
request_id
session_id
email
```

---

# 10. Query Execution Architecture

Now let's understand how a time-series database processes a read query.

Consider:

```text
Find average CPU usage for server-01
during the last 24 hours.
```

Conceptually:

```sql
SELECT AVG(cpu_usage)
FROM server_metrics
WHERE host = 'server-01'
  AND timestamp >= NOW() - INTERVAL '24 hours';
```

A simplified query execution pipeline:

```text
             Query Request
                   |
                   v
             Query Parser
                   |
                   v
            Query Planner
                   |
                   v
          Time Range Filtering
                   |
                   v
          Label / Series Lookup
                   |
                   v
         Block / Chunk Selection
                   |
                   v
          Read Relevant Columns
                   |
                   v
          Decompression / Decode
                   |
                   v
           Apply Filters
                   |
                   v
             Aggregation
                   |
                   v
             Merge Results
                   |
                   v
              Response
```

The actual order of operations can vary. Query engines may combine filtering, decoding, and aggregation or execute them in parallel.

## 10.1 Step 1: Query parsing

The database parses the incoming query.

It identifies:

- Requested metric or table.
- Time range.
- Label filters.
- Selected fields.
- Aggregations.
- Grouping conditions.

## 10.2 Step 2: Query planning

The query planner determines how to retrieve the required data efficiently.

It may decide:

- Which indexes to use.
- Which series match.
- Which blocks or chunks are relevant.
- Which columns need to be read.
- Whether operations can run in parallel.
- How intermediate results should be combined.

## 10.3 Step 3: Time-range filtering

Suppose storage contains:

```text
Block 1: 00:00–05:59
Block 2: 06:00–11:59
Block 3: 12:00–17:59
Block 4: 18:00–23:59
```

The query requests:

```text
10:00–15:00
```

Only Blocks 2 and 3 need to be considered.

This reduces unnecessary storage access.

## 10.4 Step 4: Series or label filtering

Suppose the request is:

```text
metric = cpu_usage
host = server-01
region = india
```

The database identifies series matching these conditions.

If indexes are available, it can avoid scanning unrelated series.

## 10.5 Step 5: Reading relevant data

Once the database identifies relevant blocks or chunks, it reads the required data.

For a columnar layout, it may only need:

```text
timestamp column
cpu_usage column
```

It may not need to read unrelated columns.

## 10.6 Step 6: Decompression

Compressed values are decoded as necessary.

Depending on the engine, some filtering and aggregation may be performed directly on encoded or partially decoded data.

## 10.7 Step 7: Filtering and aggregation

The database applies the requested operations.

Example:

```text
CPU values:

70, 72, 74, 76, 78

Average:

(70 + 72 + 74 + 76 + 78) / 5

= 74
```

## 10.8 Step 8: Merging results

If the query reads multiple blocks, partitions, or nodes, intermediate results may need to be combined.

For example:

```text
Block 1 average = 70
Block 2 average = 80
```

Averaging these two averages directly is not always correct.

If the blocks contain different numbers of observations, the engine needs sufficient information to calculate the correct overall average.

Correct combination:

```text
Overall average =
    Total sum of values
    -------------------
    Total number of values
```

This is an important distinction in distributed and partitioned aggregation.

## 10.9 Step 9: Returning results

The query engine returns the final result.

It may return:

- Raw measurements.
- Aggregated time buckets.
- Downsampled values.
- Multiple time series.
- Streaming result sets.

For monitoring systems, the result is often consumed by dashboards and alerting systems.

---

# 11. Write-Ahead Log (WAL)

A Write-Ahead Log is a durability mechanism used by many database systems.

Its purpose is to protect database changes against crashes.

The core idea:

**Record the change in a log before relying on the corresponding data being safely persisted in its main storage structure.**

## 11.1 Why do we need a WAL?

Imagine a database receives:

```text
10:00:00 -> CPU = 70
10:00:10 -> CPU = 72
10:00:20 -> CPU = 75
```

The records are currently in memory.

Suddenly, the server crashes.

Without a durable recovery mechanism, these in-memory measurements may be lost.

A WAL helps recover acknowledged or otherwise logged changes, depending on its durability configuration.

## 11.2 How WAL works

A simplified flow:

```text
             Incoming Write
                    |
                    v
                 WAL Log
                    |
                    v
             In-Memory Data
                    |
                    v
               Flush Later
                    |
                    v
             Persistent Files
```

The database records enough information in the WAL to reconstruct the relevant changes after a crash.

The exact sequence, synchronization behavior, and acknowledgment point depend on the engine and its configuration.

## 11.3 Crash recovery

Suppose:

```text
1. Measurement received.
2. WAL record written.
3. In-memory structure updated.
4. Database crashes before persistent storage flush.
```

After restart:

```text
Database Startup
       |
       v
Read WAL
       |
       v
Replay Valid Records
       |
       v
Reconstruct Recent State
       |
       v
Resume Normal Operation
```

This is called WAL replay or log replay.

The database uses the log to reconstruct changes that were not yet incorporated into its main storage structures.

## 11.4 WAL and fsync

Writing data to an operating system buffer is not necessarily the same as making it durable on physical storage.

The operating system may cache writes in memory.

An `fsync`-like operation requests that buffered file changes be synchronized to the storage device.

A database's durability guarantee depends on:

- When it synchronizes the WAL.
- Its acknowledgment policy.
- Operating system behavior.
- Storage device guarantees.
- Configuration settings.
- Replication and acknowledgment requirements.

For example, a system may acknowledge writes after they enter a buffer, while another may wait for a durable log synchronization.

These choices affect both latency and crash-loss risk.

**Do not assume that every successful write response means the data has already been flushed into its final data block.**

It may be safely represented in a durable WAL instead.

## 11.5 WAL truncation and cleanup

A WAL cannot grow indefinitely.

After data has been safely transferred into persistent storage and the engine has established that older log entries are no longer needed for recovery, it can reclaim or truncate log segments.

Conceptually:

```text
WAL
 |
 +-- Records already persisted
 |
 +-- Records still needed for recovery
 |
 v
Reclaim safe old log segments
```

The actual lifecycle is engine-specific.

## 11.6 WAL vs memtable vs immutable file

These are different components.

| Component                      | Main purpose                               |
| ------------------------------ | ------------------------------------------ |
| WAL                            | Record changes for recovery and durability |
| Memtable / in-memory structure | Hold and organize recent writes            |
| Immutable file / block         | Persist data in a long-term storage format |

A simplified LSM-based flow:

```text
Write
  |
  v
WAL
  |
  v
Memtable
  |
  v
Flush
  |
  v
SSTable
```

The WAL and memtable are not interchangeable.

The WAL is a recovery log. The memtable is an in-memory representation used by the storage engine.

## 11.7 WAL is not a backup

A WAL helps recover recent database changes.

It does not replace:

- Database backups.
- Point-in-time recovery planning.
- Offsite storage.
- Disaster recovery procedures.
- Replication.

A corrupted or deleted database and its required WAL files may not be recoverable merely because WAL was enabled.

A proper backup strategy is still required.

---

# 12. Retention, Compaction, and Storage Lifecycle

Time-series data can grow extremely quickly.

A monitoring system may collect millions of measurements every day.

Keeping every measurement forever is often unnecessary and expensive.

Databases therefore use lifecycle management.

## 12.1 Data lifecycle

A conceptual lifecycle:

```text
          New Measurements
                 |
                 v
          In-Memory Data
                 |
                 v
          Persistent Blocks
                 |
                 v
          Compaction / Merge
                 |
                 v
          Older Historical Data
                 |
                 v
          Retention Expiration
                 |
                 v
              Deletion
```

Not all systems follow this exact sequence.

For example, PostgreSQL partition management, Prometheus block compaction, and LSM compaction are different operations.

## 12.2 Compaction

Compaction reorganizes existing storage structures.

Depending on the engine, it may:

- Merge smaller files or blocks.
- Remove obsolete records.
- Improve data layout.
- Reduce metadata overhead.
- Improve query efficiency.

Compaction can also create significant disk I/O.

It must be managed so that it does not overwhelm ingestion or query workloads.

## 12.3 Retention

Retention determines how long data is kept.

Example:

```text
Raw metrics:       7 days
5-minute rollups:  30 days
Hourly rollups:    1 year
Daily rollups:     5 years
```

The retention mechanism can delete expired partitions, chunks, blocks, or other storage units.

The exact deletion mechanism depends on the database.

Time-based storage organization makes it easier to remove large expired ranges without deleting every individual measurement.

We will examine retention policies and downsampling in detail in Part 16D.

---

# 13. How Different Time-Series Databases Implement These Concepts

The concepts discussed above appear in multiple time-series databases, but their internal designs differ.

This section compares four important systems and one LSM-oriented architecture.

## 13.1 LSM-oriented storage engines

Some storage engines use an LSM-tree architecture.

Examples include Cassandra and storage engines inspired by similar designs.

A simplified architecture:

```text
                 Write
                   |
                   v
                  WAL
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

Key characteristics:

- Writes are buffered in memory.
- WAL supports recovery.
- Memtables hold recent writes.
- Immutable sorted files store flushed data.
- Compaction reorganizes files.

This architecture can support high write throughput.

However, read operations may need to consult multiple storage files, making indexing, caching, and compaction important.

Not every database using an LSM tree is a specialized time-series database.

## 13.2 Prometheus TSDB

<text_placeholder> </text_placeholder>

Prometheus has a distinct architecture based on a Head block, WAL, and immutable blocks.

A simplified view:

```text
             Incoming Samples
                    |
                    v
                Prometheus
                 Head Block
                    |
             +------+------+
             |             |
             v             v
            WAL        In-Memory
                         Index /
                         Samples
             |
             v
        Recovery Data

             Head Block
                  |
                  v
            Persistent
               Blocks
                  |
                  v
             Compaction
```

Important components:

### Head block

The Head block holds recent data that has not yet been fully persisted into the normal immutable block structure.

It includes in-memory structures for recent samples and series information.

### WAL

The WAL records recent changes so that the Head state can be reconstructed after a restart.

### Persistent blocks

Prometheus periodically writes data from the Head into persistent time-range blocks.

These blocks contain samples and associated index and metadata information.

### Compaction

Prometheus can merge smaller blocks into larger blocks.

This helps manage historical data and storage organization.

### Important distinction

Prometheus does not simply use a generic LSM memtable-to-SSTable pipeline.

Its Head/WAL/block architecture is different from a classic LSM-tree storage engine.

## 13.3 TimescaleDB

TimescaleDB is built on PostgreSQL.

Its architecture uses PostgreSQL's database engine and extends it with time-series-oriented capabilities.

A simplified representation:

```text
              SQL Query
                  |
                  v
              PostgreSQL
                  |
                  v
             Hypertable
                  |
                  v
          Time-Based Chunks
                  |
           +------+------+
           |             |
           v             v
        Chunk 1        Chunk 2
           |             |
           v             v
       PostgreSQL    PostgreSQL
       Storage       Storage
```

### Hypertables

A hypertable is a logical abstraction for a time-partitioned dataset.

Users query the hypertable as though it were a regular table.

Internally, the data is divided into chunks.

### Chunks

Chunks represent portions of the hypertable partitioned by time and, optionally, other dimensions.

The query planner can use time constraints to eliminate irrelevant chunks.

### PostgreSQL storage

Because TimescaleDB is based on PostgreSQL, it uses PostgreSQL's underlying storage and durability mechanisms.

These include:

- PostgreSQL heap storage.
- PostgreSQL WAL.
- PostgreSQL indexes.
- PostgreSQL query planning and execution.

### Compression and columnar capabilities

TimescaleDB provides compression and columnar-oriented storage capabilities for appropriate workloads.

The available implementation and configuration depend on the TimescaleDB version and features in use.

### Important distinction

TimescaleDB is not simply an LSM-based database.

It builds time-series functionality on top of PostgreSQL's storage engine.

## 13.4 InfluxDB

InfluxDB is a time-series database with a specialized data model and storage architecture.

Its architecture has evolved across major versions.

Therefore, do not assume that a description of one major version applies to every InfluxDB deployment.

At a high level, InfluxDB architectures provide mechanisms for:

- Receiving measurements.
- Organizing series and fields.
- Buffering recent writes.
- Persisting time-series data.
- Compressing historical data.
- Maintaining metadata and indexes.
- Querying time ranges.

Some InfluxDB versions and storage engines use TSM-oriented storage concepts, while newer versions have different architectural designs.

### TSM-oriented storage concepts

In TSM-based architectures, the storage engine uses specialized time-series storage structures.

Important concepts include:

- Write-ahead logging.
- In-memory caches.
- Time-structured storage files.
- Compaction.
- Series and index metadata.

Do not treat TSM files as identical to generic SSTables merely because both are immutable storage structures.

The exact architecture must be checked against the specific InfluxDB major version.

## 13.5 VictoriaMetrics

VictoriaMetrics is another specialized time-series database.

It uses its own storage architecture, designed for efficient ingestion, compression, and querying.

At a high level, its storage system includes:

- Incoming data processing.
- Buffered writes.
- Specialized time-series storage structures.
- Compression.
- Indexing and metadata.
- Background storage maintenance.
- Query execution.

VictoriaMetrics also supports different deployment configurations, including single-node and clustered deployments.

Do not assume it uses Prometheus's exact Head/WAL/block architecture or Cassandra's exact LSM architecture.

Its internal storage design is specific to VictoriaMetrics.

## 13.6 Architecture comparison

| Feature               | LSM-oriented engine | Prometheus                      | TimescaleDB                      | InfluxDB          | VictoriaMetrics                |
| --------------------- | ------------------- | ------------------------------- | -------------------------------- | ----------------- | ------------------------------ |
| Core design           | LSM tree            | Head + WAL + blocks             | PostgreSQL extension             | Version-dependent | Specialized TSDB               |
| Write buffering       | Memtable            | Head                            | PostgreSQL mechanisms            | Version-dependent | Internal buffering             |
| WAL                   | Common              | Yes                             | PostgreSQL WAL                   | Version-dependent | Internal durability mechanisms |
| Persistent structures | SSTables            | Immutable blocks                | PostgreSQL storage/chunks        | Version-dependent | Specialized storage parts      |
| Time organization     | Depends on schema   | Time-range blocks               | Hypertable chunks                | Version-dependent | Time-series-oriented storage   |
| Compaction            | LSM compaction      | Block compaction                | PostgreSQL/Timescale maintenance | Version-dependent | Background storage maintenance |
| Columnar capabilities | Engine-dependent    | Specialized sample/block format | Supported for suitable chunks    | Version-dependent | Specialized encoding/storage   |

The purpose of this table is to compare broad architectural approaches, not to claim that all implementations have identical internal components.

---

# 14. Node.js Backend Example: Efficient Time-Series Ingestion

Let's connect these concepts to a Node.js backend.

Suppose we have an application monitoring service that collects:

- CPU usage.
- Memory usage.
- HTTP request count.
- Response latency.
- Error count.

A naive implementation might send every measurement to the database independently.

```javascript
async function recordMetric(metric) {
  await database.insert(metric);
}
```

If this function is called thousands of times per second, it can create unnecessary request and database overhead.

A better design can use batching and bounded buffering.

## 14.1 Example measurement structure

```javascript
const measurement = {
  timestamp: Date.now(),

  metric: "http_request_latency",

  value: 125.4,

  labels: {
    service: "payment-api",
    environment: "production",
    region: "india",
    status_code: "200",
  },
};
```

## 14.2 Conceptual ingestion pipeline

```text
Application
    |
    v
Metric Collector
    |
    v
Bounded Queue
    |
    v
Batch Builder
    |
    v
Database Write API
    |
    v
Time-Series Storage
```

## 14.3 Simplified batching example

```javascript
const batch = [];

const MAX_BATCH_SIZE = 500;

async function recordMetric(metric) {
  batch.push(metric);

  if (batch.length >= MAX_BATCH_SIZE) {
    await flushBatch();
  }
}

async function flushBatch() {
  if (batch.length === 0) {
    return;
  }

  const records = batch.splice(0, batch.length);

  await database.insertMany(records);
}
```

This demonstrates batching, but it is not production-ready.

Potential problems include:

- No bounded queue.
- No periodic flush.
- Concurrent flush races.
- No retry strategy.
- No backpressure.
- No shutdown handling.
- No durable local buffering.
- No clear handling of partial failures.

A production implementation must address these issues.

## 14.4 Important production considerations

### Bounded queues

Avoid unlimited in-memory buffering.

If the database becomes unavailable, the queue must not grow forever.

### Retry strategy

Transient failures may require retries.

Use controlled retry behavior, such as exponential backoff, and ensure duplicate writes are handled appropriately.

### Backpressure

If ingestion exceeds database capacity, slow down producers or reject excess work rather than allowing memory usage to grow without limit.

### Batch size

Choose a batch size based on:

- Payload size.
- Database limits.
- Network overhead.
- Ingestion throughput.
- Write latency.

### Shutdown handling

When the application receives a shutdown signal, it should stop accepting new work and attempt to flush pending batches within a controlled timeout.

### Timestamp correctness

Distinguish between:

- Event time: when the measurement actually occurred.
- Ingestion time: when the database received it.

For example:

```javascript
const measurement = {
  eventTime: Date.now(),
  receivedAt: Date.now(),
  metric: "http_requests",
  value: 120,
};
```

In real systems, event time and ingestion time may differ due to network delays, buffering, or late-arriving events.

This distinction matters when analyzing historical metrics.

---

# 15. Common Internal Architecture Bottlenecks

Understanding architecture is not enough. You also need to know where these systems can become slow.

## 15.1 WAL growth

If data is not being flushed or log segments cannot be safely reclaimed, WAL storage can grow.

Possible causes:

- Slow storage.
- Flush failures.
- Long-running recovery requirements.
- Replication or checkpoint constraints, depending on the engine.

Impact:

- Disk consumption.
- Increased operational risk.
- Potential write failures if storage fills.

## 15.2 Buffer pressure

When incoming writes exceed storage processing capacity, buffers grow.

Possible consequences:

- High memory usage.
- Increased write latency.
- Backpressure.
- Rejected writes.

## 15.3 High cardinality

Too many unique metric-label combinations can create large index and metadata structures.

This can increase memory consumption and ingestion overhead.

## 15.4 Compaction pressure

Compaction competes with normal workload for:

- CPU.
- Memory.
- Disk bandwidth.
- Storage I/O.

Poorly managed compaction can affect query latency and ingestion throughput.

## 15.5 Disk I/O bottlenecks

Time-series databases can be storage-intensive.

Common causes:

- Large ingestion volume.
- Inefficient storage layout.
- Excessive compaction.
- Broad historical scans.
- Insufficient storage throughput.

## 15.6 Query fanout

A query spanning many time partitions, blocks, series, or nodes may require substantial work.

For example:

```text
Query: Last 2 years of metrics

Partitions involved: 730 daily partitions
Series involved: 100,000
```

Even with efficient indexing, the query may need to access a large amount of data.

Possible optimizations include:

- Time-range pruning.
- Pre-aggregation.
- Downsampling.
- Better label filtering.
- Query limits.
- Appropriate partition sizing.

## 15.7 Cache pressure

Frequently accessed recent data may benefit from caching.

However, a large working set or unpredictable queries can reduce cache effectiveness.

The database must balance memory among:

- Recent data.
- Indexes.
- Query execution.
- Metadata.
- Caches.
- Write buffers.

---

# 16. Important Design Principles

When designing or operating a time-series system, remember these principles:

| Principle                                 | Why it matters                                        |
| ----------------------------------------- | ----------------------------------------------------- |
| Batch writes                              | Reduces per-write overhead                            |
| Use bounded buffers                       | Prevents uncontrolled memory growth                   |
| Apply backpressure                        | Controls ingestion overload                           |
| Organize data by time                     | Enables efficient pruning and retention               |
| Use appropriate compression               | Reduces storage consumption                           |
| Control cardinality                       | Prevents index and metadata explosion                 |
| Keep WAL durability requirements explicit | Balances write latency and crash safety               |
| Monitor compaction                        | Prevents background work from overwhelming the system |
| Optimize time-range queries               | Avoids unnecessary historical scans                   |
| Separate event time and ingestion time    | Handles late-arriving measurements correctly          |
| Use rollups for long-term analytics       | Reduces historical query cost                         |

---

# 17. Interview Questions and Answers

## Q1. What happens internally when a time-series database receives a write?

**Answer:**

The database receives and validates the measurement, identifies its series or record, and processes it through its ingestion and buffering mechanisms.

Depending on the architecture, it may record the write in a WAL, update an in-memory structure, and later flush data into persistent storage.

It may also update indexes and metadata.

The exact order depends on the database implementation.

## Q2. What is a memtable?

**Answer:**

A memtable is an in-memory structure used by LSM-based storage engines to organize recent writes before flushing them into immutable storage files.

Not every time-series database uses memtables.

## Q3. What is an SSTable?

**Answer:**

An SSTable is an immutable, sorted storage file used by LSM-tree-based engines.

It stores data that has been flushed from an in-memory structure.

Multiple SSTables may later be reorganized through compaction.

## Q4. What is the difference between a memtable and an SSTable?

| Memtable                     | SSTable                   |
| ---------------------------- | ------------------------- |
| In memory                    | Persistent storage        |
| Mutable during normal writes | Immutable                 |
| Holds recent data            | Holds flushed data        |
| Used for ingestion           | Used for persistent reads |

## Q5. Why do time-series databases use time-based partitioning?

**Answer:**

Time-based partitioning divides large datasets into manageable time ranges.

It allows the database to:

- Skip irrelevant historical data.
- Improve time-range query efficiency.
- Simplify retention.
- Manage historical storage more efficiently.

## Q6. Why is columnar storage useful for time-series databases?

**Answer:**

Analytical queries frequently scan a small number of columns across many records.

Columnar storage allows the engine to read only the required columns and often improves compression because similar values are stored together.

## Q7. What is delta encoding?

**Answer:**

Delta encoding stores the difference between consecutive values instead of storing every full value.

For example:

```text
100, 110, 120, 130

Becomes:

100, +10, +10, +10
```

## Q8. What is delta-of-delta encoding?

**Answer:**

It stores the difference between consecutive deltas.

It is useful for regularly spaced timestamps because the delta-of-delta values can frequently be zero.

## Q9. What is the purpose of a WAL?

**Answer:**

A WAL records changes in a recovery log so the database can reconstruct recent state after a crash.

It supports durability and recovery, depending on its synchronization and acknowledgment configuration.

## Q10. Is WAL the same as a database backup?

**Answer:**

No.

A WAL supports recovery of logged database changes. A backup provides a separate recoverable copy of database data.

A production database needs a proper backup and disaster recovery strategy.

## Q11. What is compaction?

**Answer:**

Compaction reorganizes persistent storage structures.

In LSM-based systems, it merges SSTables. In Prometheus, it merges time-range blocks.

These are related maintenance concepts but not identical implementations.

## Q12. Does every time-series database use LSM trees?

**Answer:**

No.

Different systems use different architectures.

Examples:

- Cassandra uses an LSM-tree-based architecture.
- Prometheus uses a Head block, WAL, and immutable blocks.
- TimescaleDB uses PostgreSQL storage and hypertable chunks.
- InfluxDB architecture varies by major version.
- VictoriaMetrics uses its own specialized storage architecture.

## Q13. Why can high cardinality cause problems?

**Answer:**

High cardinality creates many unique series or dimension combinations.

This increases index size, metadata, memory requirements, and ingestion overhead.

## Q14. What is backpressure?

**Answer:**

Backpressure is a mechanism that controls incoming work when a system cannot process data as quickly as it arrives.

It prevents uncontrolled queue growth and resource exhaustion.

## Q15. Why might a time-series query still be slow even when the database has indexes?

**Answer:**

Indexes reduce the search space but do not eliminate the cost of reading and processing large amounts of data.

A broad time range, high-cardinality filtering, decompression, aggregation, compaction pressure, or distributed query fanout can still make a query expensive.

## Q16. How does Prometheus store recent and historical data?

**Answer:**

Prometheus stores recent data in its Head block and uses a WAL for recovery. It periodically persists data into immutable time-range blocks and compacts blocks as part of historical storage management.

## Q17. How is TimescaleDB different from Prometheus internally?

**Answer:**

TimescaleDB is built on PostgreSQL and uses hypertables and time-based chunks on top of PostgreSQL's storage engine.

Prometheus uses its own TSDB architecture based on a Head block, WAL, and immutable blocks.

They solve similar time-series problems using different storage designs.

## Q18. What is the difference between event time and ingestion time?

**Answer:**

Event time is when the measurement actually occurred.

Ingestion time is when the database received the measurement.

They can differ because of network delays, batching, buffering, or late-arriving data.

---

# 18. Practical Exercises

## Exercise 1: Identify the write path

A database receives 10,000 measurements.

Explain what may happen from ingestion to persistent storage.

Your answer should include:

- Validation.
- Buffering.
- WAL.
- In-memory storage.
- Flush.
- Persistent storage.
- Metadata and index updates.

Remember that the exact order varies by database.

## Exercise 2: Understand delta encoding

Given timestamps:

```text
1000
1010
1020
1035
1050
```

Calculate:

1. Delta values.
2. Delta-of-delta values.

Expected calculation:

```text
Timestamps:

1000, 1010, 1020, 1035, 1050

Deltas:

10, 10, 15, 15

Delta-of-deltas:

0, 5, 0
```

## Exercise 3: Choose storage organization

You have a dataset with:

- 500 million measurements.
- A timestamp.
- CPU usage.
- Memory usage.
- Server ID.
- Region.

You need to calculate average CPU usage for the last 30 days.

Explain:

1. Why time-based partitioning helps.
2. Why columnar storage may help.
3. Why compression matters.
4. Which columns are required.
5. Why scanning all historical data is unnecessary.

## Exercise 4: Identify a cardinality problem

Consider:

```text
metric = http_requests

labels:
  service
  environment
  user_id
  request_id
```

Explain why `user_id` and `request_id` may create high cardinality.

Suggest a better label design.

## Exercise 5: Diagnose ingestion overload

Your monitoring system receives:

```text
Incoming writes: 100,000/second
Storage capacity: 60,000/second
```

Answer:

1. What happens to the queue?
2. Why is an unbounded queue dangerous?
3. What is backpressure?
4. What should the ingestion service do?
5. Which metrics would you monitor?

## Exercise 6: Compare architectures

Explain the differences between:

- LSM-based storage.
- Prometheus Head/WAL/block architecture.
- TimescaleDB hypertable/chunk architecture.

Do not describe them as interchangeable.

---

# 19. Part 16C — Quick Revision

| Concept             | Meaning                                                |
| ------------------- | ------------------------------------------------------ |
| Write path          | Internal process of receiving and storing data         |
| Write buffer        | Temporary area for incoming writes                     |
| Batching            | Processing multiple measurements together              |
| Backpressure        | Controlling incoming work when storage is overloaded   |
| Memtable            | In-memory structure in LSM-based engines               |
| SSTable             | Immutable sorted storage file                          |
| Chunk               | A bounded portion of time-series data                  |
| Time partitioning   | Dividing data by time ranges                           |
| Columnar storage    | Storing values by column rather than by row            |
| Delta encoding      | Storing differences between values                     |
| Delta-of-delta      | Storing differences between consecutive deltas         |
| RLE                 | Representing repeated values as value and count        |
| Dictionary encoding | Replacing repeated values with compact IDs             |
| XOR compression     | Encoding changes between binary representations        |
| Postings list       | Mapping a label or term to matching series identifiers |
| Metadata            | Information used to locate and interpret stored data   |
| Query planner       | Determines an execution strategy                       |
| WAL                 | Recovery log used for durability                       |
| Flush               | Moving buffered data into persistent storage           |
| Compaction          | Reorganizing persistent storage                        |
| Retention           | Controlling how long data is kept                      |

## Most important concepts to remember

1. Time-series databases optimize for continuous ingestion and time-range queries.
2. Buffering and batching improve write efficiency but introduce memory and durability tradeoffs.
3. Memtables and SSTables are associated with LSM-based storage engines, not every TSDB.
4. Time-based chunks and blocks allow pruning and easier lifecycle management.
5. Columnar storage can improve analytical scans and compression.
6. Delta, delta-of-delta, RLE, dictionary, bit-packing, and XOR encoding exploit predictable data patterns.
7. Indexes and metadata help locate relevant series and storage blocks.
8. Query execution involves filtering, block selection, reading, decoding, aggregation, and merging.
9. WAL supports crash recovery but is not a backup.
10. Prometheus, TimescaleDB, InfluxDB, and VictoriaMetrics use different architectures.
