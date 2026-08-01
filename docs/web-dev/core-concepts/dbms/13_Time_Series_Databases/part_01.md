---
sidebar_label: Time-Series Database Fundamentals
sidebar_position: 1
---

# Time-Series Database Fundamentals

## 1. Introduction to Time-Series Databases

So far, we have studied several database categories:

- Relational databases — PostgreSQL, MySQL.
- Key-value databases — Redis.
- Document databases — MongoDB.
- Wide-column databases — Cassandra.
- Graph databases — Neo4j.
- Search databases — Elasticsearch.

Now we move to another specialized database category: **Time-Series Databases (TSDBs).**

A time-series database is designed to store, organize, retrieve, and analyze data points associated with time.

The defining characteristic is that every measurement or event is associated with a timestamp.

Examples:

- CPU utilization every second.
- Server memory usage every 10 seconds.
- Website requests per minute.
- Temperature readings from IoT sensors.
- Stock prices over time.
- Vehicle GPS coordinates.
- Application response times.
- Daily active users.
- Electricity consumption.

Consider a monitoring system that collects CPU utilization from a server.

```text
10:00:00 → 35%
10:00:05 → 42%
10:00:10 → 39%
10:00:15 → 51%
10:00:20 → 47%
```

These values are not independent records.

Their timestamps are essential because we want to understand how CPU utilization changes over time.

A time-series database is optimized for this type of workload.

---

# 2. What Is Time-Series Data?

Time-series data is a sequence of data points collected or recorded over time.

Each data point generally contains:

1. A timestamp.
2. One or more measured values.
3. Optional metadata or identifying dimensions.

A general representation:

```text
(timestamp, measurement, metadata)
```

Example:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "cpu_usage": 65.5,
  "server": "server-01",
  "region": "india"
}
```

Another measurement:

```json
{
  "timestamp": "2026-11-14T10:00:05Z",
  "cpu_usage": 72.3,
  "server": "server-01",
  "region": "india"
}
```

Both records represent measurements from the same server at different times.

## 2.1 Characteristics of time-series data

Time-series data has several common characteristics.

### A. Timestamp-oriented

Every observation is associated with a time.

For example:

```text
10:00:00 → 100 requests
10:00:01 → 120 requests
10:00:02 → 115 requests
10:00:03 → 140 requests
```

The timestamp is usually one of the most important fields.

### B. Append-heavy workloads

Many time-series applications continuously insert new measurements.

For example, a monitoring service may collect CPU usage every five seconds.

```text
New measurement
      |
      v
Timestamp: 10:00:00

New measurement
      |
      v
Timestamp: 10:00:05

New measurement
      |
      v
Timestamp: 10:00:10
```

The workload is frequently write-heavy.

Historical data is often retained and queried rather than continuously updated.

### C. Time-range queries

Applications frequently retrieve measurements within a time interval.

Example:

```text
Get CPU usage between:
10:00 AM and 11:00 AM
```

Typical query patterns include:

- Last 5 minutes.
- Last 1 hour.
- Last 24 hours.
- Last 7 days.
- Last 30 days.
- Previous month.

### D. Aggregation-heavy workloads

Applications often calculate statistics over time.

Examples:

- Average CPU usage per minute.
- Maximum memory usage per hour.
- Total requests per day.
- Average response time per endpoint.
- Error count per five-minute interval.

### E. High-volume data generation

A single application can generate millions of measurements.

For example:

```text
100 servers
Each server generates 1 measurement every 5 seconds
```

Measurements per day:

\[
100 \times \frac{86400}{5}
= 1,728,000
\]

That is approximately 1.73 million measurements per day.

At larger scales, time-series workloads can generate billions of data points.

---

# 3. Real-World Examples of Time-Series Data

Time-series databases are used across several industries.

## 3.1 Infrastructure monitoring

Monitoring platforms collect metrics from servers and infrastructure.

Examples:

| Timestamp | Server   | CPU usage | Memory usage |
| --------- | -------- | --------: | -----------: |
| 10:00:00  | Server 1 |       35% |          60% |
| 10:00:05  | Server 1 |       42% |          61% |
| 10:00:10  | Server 1 |       39% |          63% |
| 10:00:15  | Server 1 |       51% |          64% |

Use cases:

- Server monitoring.
- CPU utilization.
- Memory consumption.
- Disk usage.
- Network throughput.
- Request latency.
- Error rates.

Tools and technologies include:

- Prometheus.
- InfluxDB.
- VictoriaMetrics.
- TimescaleDB.

## 3.2 IoT sensor monitoring

Suppose a factory has 10,000 temperature sensors.

Each sensor sends a temperature reading every minute.

```text
Sensor 1 → 28.5°C
Sensor 2 → 29.1°C
Sensor 3 → 27.9°C
```

Each reading includes a timestamp and sensor identifier.

Example:

```json
{
  "sensor_id": "SENSOR-101",
  "timestamp": "2026-11-14T10:00:00Z",
  "temperature": 28.5,
  "unit": "C"
}
```

Use cases:

- Temperature monitoring.
- Pressure monitoring.
- Humidity tracking.
- Industrial equipment monitoring.
- Smart buildings.
- Energy consumption.

## 3.3 Financial market data

Stock markets generate time-dependent data.

Example:

| Timestamp | Stock |  Price |
| --------- | ----- | -----: |
| 09:30:00  | ABC   | 120.50 |
| 09:30:01  | ABC   | 121.00 |
| 09:30:02  | ABC   | 120.75 |
| 09:30:03  | ABC   | 122.10 |

Use cases:

- Stock price history.
- Trading volume.
- Market indicators.
- Price movements.
- Portfolio performance.

Financial workloads can have specialized requirements around precision, ordering, and event processing. A time-series database alone does not automatically satisfy all financial transaction requirements.

## 3.4 Application analytics

Suppose an application receives thousands of requests.

We want to track:

- Requests per second.
- API response time.
- HTTP status codes.
- Error rate.
- Endpoint-level traffic.

Example:

```json
{
  "timestamp": "2026-11-14T10:00:00Z",
  "endpoint": "/api/products",
  "request_count": 250,
  "avg_response_time_ms": 120,
  "error_count": 3
}
```

This information can help identify:

- Traffic spikes.
- Slow APIs.
- Application failures.
- Performance degradation.

## 3.5 User activity and product analytics

Time-series data can also represent user activity.

Examples:

- Daily active users.
- Hourly registrations.
- Campaign impressions.
- Click-through rates.
- Daily game sessions.
- Conversion rates.

Example:

| Date   | Campaign   | Impressions | Clicks |
| ------ | ---------- | ----------: | -----: |
| Nov 12 | Campaign A |       10000 |    850 |
| Nov 13 | Campaign A |       12000 |    920 |
| Nov 14 | Campaign A |       15000 |   1100 |

These metrics can be aggregated over different time windows.

**Important:** Not every event or analytics workload requires a dedicated time-series database. PostgreSQL, MongoDB, data warehouses, and analytical systems can also store and process time-oriented data.

---

# 4. What Is a Time-Series Database?

A Time-Series Database (TSDB) is a database optimized for workloads involving timestamped data.

Its design commonly focuses on:

- High ingestion rates.
- Efficient time-range queries.
- Time-based data organization.
- Aggregations over time.
- Compression.
- Retention policies.
- Downsampling.
- Efficient storage of historical measurements.

Examples include:

| Database        | Category                                            |
| --------------- | --------------------------------------------------- |
| InfluxDB        | Specialized time-series database                    |
| TimescaleDB     | PostgreSQL-based time-series database               |
| Prometheus      | Monitoring and time-series metrics system           |
| VictoriaMetrics | Time-series monitoring database                     |
| QuestDB         | Time-series database                                |
| OpenTSDB        | Distributed time-series database built around HBase |

These systems have different architectures and tradeoffs. They should not be assumed to have identical query languages, storage engines, or consistency behavior.

## 4.1 Why not use a normal database?

A common question:

**Why can't we simply store timestamped data in PostgreSQL or MongoDB?**

We can.

For example, PostgreSQL can store:

```sql
CREATE TABLE server_metrics (
    id BIGSERIAL PRIMARY KEY,
    server_id VARCHAR(50),
    recorded_at TIMESTAMPTZ NOT NULL,
    cpu_usage DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION
);
```

MongoDB can store:

```json
{
  "server_id": "server-01",
  "recorded_at": "2026-11-14T10:00:00Z",
  "cpu_usage": 65.5,
  "memory_usage": 72.1
}
```

Both databases can store and query this data.

The question is whether they can handle the required workload efficiently at the expected scale.

A specialized TSDB may provide better support for:

- High-frequency ingestion.
- Time-oriented storage.
- Compression.
- Time-based partitioning.
- Retention.
- Time-window aggregation.
- Historical metric queries.

The specialized design can reduce the operational cost of handling large time-series workloads.

---

# 5. How Time-Series Data Is Structured

To understand TSDB data modeling, we need to understand four common concepts:

1. Measurement.
2. Timestamp.
3. Tags or dimensions.
4. Fields or values.

These names vary between databases, but the concepts are widely used.

## 5.1 Measurement

A measurement identifies what is being recorded.

Examples:

```text
cpu_usage
memory_usage
temperature
http_requests
response_time
```

Think of it as the name of a metric or observation category.

## 5.2 Timestamp

A timestamp identifies when the measurement was recorded.

Example:

```text
2026-11-14T10:00:00Z
```

Timestamps are often stored or processed with high precision.

Common precision levels include:

- Seconds.
- Milliseconds.
- Microseconds.
- Nanoseconds.

The required precision depends on the workload.

For example:

- Daily website analytics may need second or minute precision.
- Infrastructure monitoring may use seconds.
- High-frequency financial data may require much finer precision.

Do not assume that higher timestamp precision automatically means higher data accuracy.

## 5.3 Tags or dimensions

Tags describe the context of a measurement.

For example:

```json
{
  "server": "server-01",
  "region": "india",
  "environment": "production"
}
```

These dimensions help filter and group measurements.

Example query:

```text
Get CPU usage for:
server = server-01
environment = production
```

Common dimensions include:

- Server ID.
- Region.
- Environment.
- Device ID.
- Application name.
- API endpoint.
- Sensor ID.

## 5.4 Fields or values

Fields contain the actual measurements.

Example:

```json
{
  "cpu_usage": 65.5,
  "memory_usage": 72.1,
  "disk_usage": 80.2
}
```

A complete conceptual time-series record:

```json
{
  "measurement": "server_metrics",
  "timestamp": "2026-11-14T10:00:00Z",
  "tags": {
    "server": "server-01",
    "region": "india",
    "environment": "production"
  },
  "fields": {
    "cpu_usage": 65.5,
    "memory_usage": 72.1,
    "disk_usage": 80.2
  }
}
```

This is a conceptual representation. Individual databases may use different data models.

## 5.5 Tags vs fields

Tags and fields serve different purposes.

| Tags / dimensions                        | Fields / measurements                     |
| ---------------------------------------- | ----------------------------------------- |
| Describe the data source or context      | Store measured values                     |
| Commonly used for filtering and grouping | Commonly used for numerical calculations  |
| Often indexed in specialized TSDBs       | Indexing behavior depends on the database |
| Examples: server, region, environment    | Examples: CPU, memory, temperature        |

Example:

```text
Measurement: server_metrics

Timestamp:
2026-11-14T10:00:00Z

Tags:
server = server-01
region = india

Fields:
cpu_usage = 65.5
memory_usage = 72.1
```

**Important:** Do not put every possible value into a tag or indexed dimension. High-cardinality dimensions can cause serious storage and memory problems in some TSDB architectures. We will examine this in Part 16B and Part 16C.

---

# 6. Time-Series Data vs Traditional Relational Data

Let's compare the structure of a normal business database with a time-series workload.

## 6.1 Traditional relational data

Example: Users table.

| user_id | name  | email             |
| ------- | ----- | ----------------- |
| U101    | Rahul | rahul@example.com |
| U102    | Amit  | amit@example.com  |
| U103    | Neha  | neha@example.com  |

This represents relatively stable business entities.

A user's email may change, but the application does not usually insert a new user row every five seconds just to record the current email.

## 6.2 Time-series data

Example: CPU measurements.

| timestamp | server_id | cpu_usage |
| --------- | --------- | --------: |
| 10:00:00  | S101      |      35.2 |
| 10:00:05  | S101      |      40.1 |
| 10:00:10  | S101      |      38.7 |
| 10:00:15  | S101      |      51.3 |

Each row represents a new observation.

The records are primarily distinguished by time and their associated dimensions.

## 6.3 Main differences

| Traditional relational workload                          | Time-series workload                                 |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Often stores business entities                           | Stores timestamped observations                      |
| Inserts, updates, and deletes                            | Often append-heavy                                   |
| Relationships and constraints are important              | Time and dimensions are central                      |
| Queries vary across business entities                    | Time-range queries are common                        |
| Transactions are frequently important                    | High ingestion and time-based aggregation are common |
| Data may be retained for business lifecycle requirements | Retention often depends on data age and usefulness   |

These are typical patterns, not absolute rules. Relational databases can also handle append-heavy time-series workloads.

---

# 7. Important Time-Series Query Patterns

The defining workload of a TSDB is not merely storing timestamps. It is efficiently answering questions about measurements over time.

## 7.1 Time-range queries

Example:

```text
Get CPU usage between 10:00 AM and 11:00 AM.
```

Conceptually:

```sql
SELECT *
FROM server_metrics
WHERE server_id = 'server-01'
  AND recorded_at >= '2026-11-14 10:00:00+00'
  AND recorded_at <  '2026-11-14 11:00:00+00';
```

The query filters measurements using a time interval.

## 7.2 Average over time

Suppose we want average CPU usage per minute.

```sql
SELECT
    date_trunc('minute', recorded_at) AS minute,
    AVG(cpu_usage) AS average_cpu
FROM server_metrics
WHERE server_id = 'server-01'
GROUP BY minute
ORDER BY minute;
```

Example output:

| Minute | Average CPU |
| ------ | ----------: |
| 10:00  |        38.2 |
| 10:01  |        42.7 |
| 10:02  |        51.3 |

## 7.3 Maximum and minimum

Suppose we want the highest CPU usage during the last hour.

```sql
SELECT
    MAX(cpu_usage) AS maximum_cpu,
    MIN(cpu_usage) AS minimum_cpu
FROM server_metrics
WHERE server_id = 'server-01'
  AND recorded_at >= NOW() - INTERVAL '1 hour';
```

This is useful for identifying resource spikes.

## 7.4 Count measurements over time

Example:

```sql
SELECT
    date_trunc('hour', recorded_at) AS hour,
    COUNT(*) AS measurement_count
FROM server_metrics
GROUP BY hour
ORDER BY hour;
```

This can help analyze ingestion volume or event frequency.

## 7.5 Moving averages

A moving average smooths short-term fluctuations.

Suppose CPU usage changes rapidly:

```text
30%, 80%, 35%, 75%, 40%
```

A moving average can help identify the broader trend rather than reacting to every individual spike.

Example in PostgreSQL:

```sql
SELECT
    recorded_at,
    cpu_usage,
    AVG(cpu_usage) OVER (
        ORDER BY recorded_at
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ) AS moving_average
FROM server_metrics
WHERE server_id = 'server-01';
```

This calculates a rolling average over the current row and up to four preceding rows.

A production implementation may need to define the time window carefully, especially when measurements arrive at irregular intervals.

---

# 8. Time-Series Data and Data Volume

Time-series systems often deal with continuous ingestion.

Let's calculate a realistic example.

Suppose:

- 1,000 servers.
- Each server sends one metric every 10 seconds.
- One day has 86,400 seconds.

Measurements per server per day:

\[
\frac{86,400}{10} = 8,640
\]

Measurements across all servers:

\[
1,000 \times 8,640 = 8,640,000
\]

<text> </text>

<badge color="success">8.64 million measurements/day</badge>

Now assume each stored measurement consumes an average of 100 bytes before considering indexes, metadata, replication, and storage-engine overhead.

Approximate raw daily storage:

\[
8,640,000 \times 100 = 864,000,000 \text{ bytes}
\]

Approximately 864 MB per day using decimal units.

For 30 days:

\[
864 \times 30 = 25,920 \text{ MB}
\]

Approximately 25.92 GB.

This is only an illustrative estimate.

Actual storage depends on:

- Encoding.
- Compression.
- Index structures.
- Metadata.
- Number of fields.
- Cardinality.
- Replication.
- Retention.
- Storage engine.

The key point is that continuous ingestion creates substantial historical data volume.

---

# 9. What Makes Time-Series Databases Different?

Time-series databases commonly introduce specialized features to handle this workload.

## 9.1 Time-based partitioning

Data can be organized into time-based partitions.

Example:

```text
server_metrics
      |
      |-- 2026-11-12
      |-- 2026-11-13
      |-- 2026-11-14
      |-- 2026-11-15
```

When querying a particular time range, the database may only need to access the relevant partitions.

This can reduce unnecessary data scanning.

The exact implementation differs between databases.

For example, PostgreSQL supports table partitioning, and TimescaleDB provides hypertables that organize data into chunks.

## 9.2 Compression

Time-series data often contains patterns that can be compressed efficiently.

Example:

```text
CPU usage:

40.1
40.2
40.3
40.4
40.5
```

Instead of storing every value independently using an inefficient representation, specialized encoding techniques can exploit similarities and patterns.

Potential benefits:

- Reduced disk storage.
- Lower storage costs.
- Improved cache efficiency.
- More economical historical retention.

Different databases use different compression algorithms.

## 9.3 Retention policies

Not all historical measurements need to be stored forever.

Example:

```text
Raw measurements:
Retain for 7 days

Aggregated measurements:
Retain for 1 year

Daily summaries:
Retain for 5 years
```

A retention policy can automatically remove expired data.

This prevents storage from growing indefinitely.

## 9.4 Downsampling

Downsampling reduces the resolution of historical data.

Suppose we collect CPU usage every five seconds.

For recent monitoring, five-second resolution may be useful.

For a report covering the last year, one-minute or one-hour averages may be sufficient.

Example:

Original:

```text
10:00:00 → 30%
10:00:05 → 35%
10:00:10 → 40%
10:00:15 → 45%
10:00:20 → 50%
```

Downsampled into one-minute data:

```text
10:00 → Average CPU: 40%
```

The original observations are replaced or supplemented by a lower-resolution representation, depending on the retention design.

We will study downsampling in detail in Part 16D.

## 9.5 Time-window aggregation

Time-series databases commonly support aggregation over windows.

Examples:

- Average per 10 seconds.
- Maximum per minute.
- Sum per hour.
- Count per day.

These operations are useful for dashboards and monitoring.

---

# 10. Time-Series Database Examples

Let's understand the main systems at a high level.

## 10.1 InfluxDB

<AsyncImage query="InfluxDB logo official" aspectRatio="16:5" fit="contain"/>

<Entity value="InfluxDB" category="software" disambig="Time-series database"/>

InfluxDB is a time-series database designed for metrics, events, and timestamped measurements.

Typical use cases:

- Infrastructure monitoring.
- IoT sensors.
- Application metrics.
- Operational analytics.

Common concepts include:

- Measurements.
- Tags.
- Fields.
- Timestamps.
- Buckets.
- Retention policies.

Its query language and architecture vary across major versions, so do not assume examples for one version work unchanged in another.

## 10.2 TimescaleDB

<AsyncImage query="TimescaleDB official logo" aspectRatio="16:5" fit="contain"/>

<Entity value="TimescaleDB" category="software" disambig="PostgreSQL-based time-series database"/>

TimescaleDB is built on PostgreSQL.

It extends PostgreSQL with time-series capabilities while retaining the PostgreSQL ecosystem.

Common concepts include:

- Hypertables.
- Time-based chunks.
- Compression.
- Retention policies.
- Continuous aggregates.

This can be attractive when an application already relies heavily on PostgreSQL and needs time-series functionality.

## 10.3 Prometheus

<AsyncImage query="Prometheus monitoring official logo" aspectRatio="16:5" fit="contain"/>

<Entity value="Prometheus" category="software" disambig="Monitoring and time-series metrics system"/>

Prometheus is a monitoring and alerting system that stores time-series metrics.

It is widely used for:

- Server monitoring.
- Kubernetes monitoring.
- Application metrics.
- Alerting.
- Infrastructure observability.

Prometheus commonly uses a pull-based model in which it scrapes metrics from configured targets.

Example metric:

```text
http_requests_total{
  method="GET",
  endpoint="/api/products",
  status="200"
} 1500
```

Its query language is PromQL.

## 10.4 VictoriaMetrics

<AsyncImage query="VictoriaMetrics official logo" aspectRatio="16:5" fit="contain"/>

<Entity value="VictoriaMetrics" category="software" disambig="Time-series database and monitoring storage"/>

VictoriaMetrics is a time-series database and monitoring-oriented storage system.

It is commonly used for:

- Large-scale metrics storage.
- Prometheus-compatible workloads.
- Long-term metrics retention.
- Monitoring infrastructure.

## 10.5 QuestDB

<AsyncImage query="QuestDB official logo" aspectRatio="16:5" fit="contain"/>

<Entity value="QuestDB" category="software" disambig="High-performance time-series database"/>

QuestDB is a time-series database designed for high-ingestion and time-oriented analytical workloads.

It supports SQL-oriented querying and is used in areas such as:

- Financial market data.
- IoT.
- Monitoring.
- Event analytics.

## 10.6 Comparison

| Database        | General focus                   | Important characteristic                            |
| --------------- | ------------------------------- | --------------------------------------------------- |
| InfluxDB        | Time-series storage             | Specialized time-series data model                  |
| TimescaleDB     | Time-series on PostgreSQL       | PostgreSQL compatibility and time-series extensions |
| Prometheus      | Monitoring metrics              | Scraping, PromQL, and alerting ecosystem            |
| VictoriaMetrics | Metrics storage                 | Monitoring-oriented scalable storage                |
| QuestDB         | Time-series analytics           | SQL-oriented high-ingestion workloads               |
| OpenTSDB        | Distributed time-series storage | Uses HBase as its underlying storage system         |

These systems are not interchangeable in every deployment.

---

# 11. Time-Series Databases vs General-Purpose Databases

A common mistake is assuming that every timestamped workload requires a TSDB.

That is incorrect.

Consider three examples.

### Example A: User registration

```json
{
  "user_id": "U101",
  "name": "Rahul",
  "email": "rahul@example.com",
  "registered_at": "2026-11-14T10:00:00Z"
}
```

This is ordinary application data.

The registration timestamp does not make the entire user database a time-series workload.

### Example B: Server monitoring

```json
{
  "server_id": "S101",
  "timestamp": "2026-11-14T10:00:00Z",
  "cpu_usage": 65.5,
  "memory_usage": 72.1
}
```

This is a natural time-series workload because the application continuously records measurements and analyzes them over time.

### Example C: Orders

```json
{
  "order_id": "O101",
  "user_id": "U101",
  "total_amount": 2999,
  "created_at": "2026-11-14T10:00:00Z"
}
```

Orders have timestamps, but they are transactional business records.

A relational database or document database is generally a more natural primary system for managing orders.

## 11.1 Comparison

| Requirement                    | General-purpose database     | Time-series database                    |
| ------------------------------ | ---------------------------- | --------------------------------------- |
| User profiles                  | Strong fit                   | Usually unnecessary                     |
| Orders and payments            | Strong fit                   | Usually inappropriate as primary system |
| Continuous sensor measurements | Can work                     | Specialized fit                         |
| High-frequency server metrics  | Can work                     | Specialized fit                         |
| Historical time-range queries  | Supported                    | Core workload                           |
| Time-window aggregation        | Supported                    | Core workload                           |
| Automatic time-based retention | Depends on database features | Common specialized feature              |
| Compression for metric data    | Depends on engine            | Often optimized for it                  |

**Key principle:** A timestamp is a data attribute. A time-series workload is a pattern of data generation, storage, and querying.

---

# 12. Where Time-Series Databases Fit in Backend Architecture

Let's design a simple infrastructure monitoring application.

Requirements:

- Collect CPU usage.
- Collect memory usage.
- Track API response time.
- Display historical graphs.
- Detect abnormal behavior.
- Generate alerts.

Possible architecture:

```text
           APPLICATION SERVERS
             |       |       |
             v       v       v
          Metrics  Metrics  Metrics
          Agent    Agent    Agent
             |       |       |
             -----------------
                     |
                     v
               Metrics Collector
                     |
                     v
              Time-Series Database
                     |
             -------------------
             |                 |
             v                 v
          Dashboard         Alerting
             |
             v
          Graphs
```

The metrics collector gathers measurements and writes them into the TSDB.

A dashboard queries historical measurements and displays them as graphs.

An alerting component evaluates metrics and triggers notifications when configured conditions are met.

## 12.1 Node.js example

Suppose a Node.js application records API response times.

A conceptual metric:

```javascript
{
  timestamp: new Date(),
  endpoint: "/api/products",
  method: "GET",
  responseTimeMs: 125,
  statusCode: 200
}
```

Measurements can be collected for:

- Request count.
- Response time.
- Error count.
- CPU usage.
- Memory usage.

Example:

```javascript
const startedAt = performance.now();

await handleRequest();

const responseTimeMs = performance.now() - startedAt;

const metric = {
  timestamp: new Date(),
  endpoint: "/api/products",
  response_time_ms: responseTimeMs,
};
```

This illustrates how a measurement might be produced.

In a real system, avoid synchronously writing every individual HTTP request to a TSDB if doing so creates significant overhead. Metrics libraries, batching, exporters, and collectors are commonly used.

## 12.2 Why use a metrics collector?

A metrics collector separates measurement generation from storage.

Instead of every application directly managing database writes, a collector can:

- Receive metrics.
- Batch measurements.
- Attach metadata.
- Validate data.
- Buffer temporarily.
- Forward measurements to storage.

This makes the monitoring architecture easier to manage.

---

# 13. Important Time-Series Concepts to Remember

| Concept                 | Meaning                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Time-series data        | Data points associated with timestamps                                                 |
| Measurement             | Name or category of the recorded metric                                                |
| Timestamp               | Time at which the observation was recorded                                             |
| Tag / dimension         | Metadata used to identify or group measurements                                        |
| Field                   | Actual recorded value                                                                  |
| Ingestion               | Writing incoming measurements                                                          |
| Time-range query        | Retrieving data within a time interval                                                 |
| Time-window aggregation | Aggregating measurements over fixed time intervals                                     |
| Compression             | Reducing storage requirements                                                          |
| Retention               | Keeping data for a defined duration                                                    |
| Downsampling            | Reducing historical data resolution                                                    |
| Cardinality             | Number of unique combinations or values in indexed dimensions, depending on the system |

---

# 14. Common Misconceptions

| Misconception                                             | Correct understanding                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Any table containing timestamps is a time-series database | Timestamped data alone does not define a TSDB workload                                 |
| PostgreSQL cannot store time-series data                  | PostgreSQL can store and query time-series data                                        |
| Every time-series workload needs InfluxDB                 | The correct database depends on workload and scale                                     |
| Time-series databases only store numbers                  | They can store timestamps, dimensions, metadata, and different measurement types       |
| All time-series databases use the same data model         | Data models differ across products                                                     |
| Every metric must be stored forever                       | Retention policies can control historical storage                                      |
| More timestamp precision always means better data         | Precision should match the actual measurement requirements                             |
| Time-series databases automatically detect every anomaly  | Anomaly detection requires appropriate queries, rules, models, or monitoring features  |
| A time-series database replaces an application database   | It usually handles a specialized workload rather than every application responsibility |

---

# 15. Interview Questions and Answers

## Q1. What is a time-series database?

A time-series database is a database optimized for storing, querying, and analyzing timestamped measurements and events.

## Q2. What is time-series data?

It is a sequence of observations associated with timestamps, often generated continuously.

## Q3. Give examples of time-series data.

CPU utilization, memory usage, temperature readings, stock prices, network traffic, and API response times.

## Q4. Why are time-series databases useful?

They are designed for workloads involving high-volume ingestion, time-range queries, time-window aggregations, compression, and retention.

## Q5. What is a measurement?

A measurement identifies the type or category of recorded data, such as `cpu_usage` or `temperature`.

## Q6. What is a tag or dimension?

A tag or dimension provides context for a measurement, such as server ID, region, environment, or sensor ID.

## Q7. What is a field?

A field contains the actual measurement value, such as CPU utilization, memory usage, or temperature.

## Q8. What is a retention policy?

A retention policy defines how long data should be retained before it is removed or otherwise expired.

## Q9. What is downsampling?

Downsampling reduces the resolution of historical data, such as converting five-second measurements into one-minute averages.

## Q10. Can PostgreSQL store time-series data?

Yes. PostgreSQL supports timestamped records, indexes, partitioning, range queries, and aggregations. TimescaleDB extends PostgreSQL with specialized time-series capabilities.

## Q11. What is the difference between a relational database and a time-series database?

A relational database is designed for general structured data and relationships. A time-series database is optimized for continuous timestamped measurements and time-oriented queries.

## Q12. What is cardinality?

Cardinality describes the number of unique values or combinations in a dimension or indexed identifier. High cardinality can create storage and memory overhead in some time-series systems.

## Q13. What is a time-range query?

A query that retrieves measurements within a specified time interval.

## Q14. What is a moving average?

A moving average calculates the average of measurements over a moving window, helping smooth short-term fluctuations.

## Q15. Name some time-series databases.

InfluxDB, TimescaleDB, Prometheus, VictoriaMetrics, QuestDB, and OpenTSDB.

## Q16. Should order records be stored in a time-series database just because they contain timestamps?

No. Orders are transactional business records. A relational or document database is usually more suitable as the primary system.

---

# 16. Practical Exercises

## Exercise 1: Identify time-series data

Classify each record as a typical time-series observation or ordinary application entity.

| Record                                          | Classification |
| ----------------------------------------------- | -------------- |
| User profile                                    | ?              |
| CPU usage every 5 seconds                       | ?              |
| Product catalog                                 | ?              |
| Temperature every minute                        | ?              |
| Order record                                    | ?              |
| API response time for each measurement interval | ?              |
| Stock price every second                        | ?              |
| Payment transaction                             | ?              |

Suggested answers:

- User profile — ordinary application entity.
- CPU usage — time-series observation.
- Product catalog — ordinary application entity.
- Temperature — time-series observation.
- Order — transactional business record.
- API response time — time-series observation or metric, depending on collection model.
- Stock price — time-series observation.
- Payment — transactional business record.

## Exercise 2: Calculate ingestion volume

Suppose:

- 500 servers.
- One measurement every 10 seconds.
- 86,400 seconds per day.

Calculate:

1. Measurements per server per day.
2. Total measurements per day.
3. Total measurements per 30 days.

Answers:

```text
Per server:
86,400 / 10 = 8,640

Across 500 servers:
8,640 × 500 = 4,320,000 per day

Across 30 days:
4,320,000 × 30 = 129,600,000
```

Approximately 129.6 million measurements in 30 days.

## Exercise 3: Design a time-series record

Design a measurement for monitoring a Node.js application.

Include:

- Timestamp.
- Application name.
- Environment.
- Endpoint.
- Request count.
- Average response time.
- Error count.

Decide which properties are dimensions and which are measurement values.

## Exercise 4: Design time-range queries

Write SQL queries to calculate:

1. Average CPU usage for the last hour.
2. Maximum memory usage for a server.
3. Request count per minute.
4. Error count per endpoint per hour.
5. Average response time per day.

## Exercise 5: Database selection

Choose a suitable database for:

1. User accounts.
2. Product catalog.
3. Server CPU metrics.
4. Payment transactions.
5. Historical IoT temperature readings.
6. Advanced full-text product search.

Explain why each selection fits the workload.

---

# 17. Final Revision Sheet

| Topic                | Key takeaway                                      |
| -------------------- | ------------------------------------------------- |
| Time-series database | Specialized database for timestamped data         |
| Time-series data     | Sequence of observations over time                |
| Timestamp            | Identifies when a measurement occurred            |
| Measurement          | Identifies what is being measured                 |
| Tags/dimensions      | Describe the source or context                    |
| Fields               | Store measured values                             |
| Ingestion            | Often continuous and append-heavy                 |
| Queries              | Frequently use time ranges                        |
| Aggregations         | Average, minimum, maximum, sum, count             |
| Compression          | Reduces historical storage requirements           |
| Retention            | Controls how long data is kept                    |
| Downsampling         | Reduces historical resolution                     |
| Cardinality          | Number of unique dimension values or combinations |
| InfluxDB             | Specialized time-series database                  |
| TimescaleDB          | PostgreSQL-based time-series extension            |
| Prometheus           | Monitoring and time-series metrics system         |
| VictoriaMetrics      | Monitoring-oriented time-series storage           |
| QuestDB              | SQL-oriented time-series database                 |
