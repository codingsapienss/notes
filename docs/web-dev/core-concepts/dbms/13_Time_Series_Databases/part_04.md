---
sidebar_label: Part 16D — Time-Series Operations: Downsampling, Retention & Rollups
sidebar_position: 1
---

# Part 16D — Time-Series Operations: Downsampling, Retention & Rollups

## 1. Introduction

In Part 16C, we studied how time-series databases ingest, organize, compress, index, and retrieve measurements.

Now consider a monitoring platform that collects CPU usage every second.

One server generates:

- 60 measurements per minute.
- 3,600 measurements per hour.
- 86,400 measurements per day.
- 2,592,000 measurements per 30 days.

If the platform monitors 1,000 servers:

```text
Measurements per day:

86,400 × 1,000

= 86,400,000 measurements
```

That is approximately 86.4 million measurements every day for just one metric.

Now imagine monitoring:

- CPU usage.
- Memory usage.
- Disk usage.
- Network traffic.
- Request latency.
- HTTP request count.
- Error count.

The dataset grows rapidly.

Keeping every raw measurement forever creates unnecessary storage consumption and makes long-term analytical queries increasingly expensive.

Time-series databases therefore use several operational techniques:

1. **Retention:** Decide how long data should be stored.
2. **Downsampling:** Reduce the resolution of historical data.
3. **Aggregation:** Calculate statistical summaries over time intervals.
4. **Rollups:** Store aggregated results for faster future queries.
5. **Continuous aggregation:** Automatically maintain summaries as new data arrives.
6. **Data lifecycle management:** Move data through different storage and retention stages.

These techniques help balance storage cost, query performance, and analytical accuracy.

---

# 2. Raw Data vs Aggregated Data

Before understanding downsampling, distinguish between raw measurements and aggregated measurements.

Suppose we collect CPU usage every second:

| Timestamp | CPU Usage |
| --------- | --------: |
| 10:00:00  |       50% |
| 10:00:01  |       52% |
| 10:00:02  |       55% |
| 10:00:03  |       53% |
| 10:00:04  |       58% |
| 10:00:05  |       60% |
| 10:00:06  |       57% |
| 10:00:07  |       55% |
| 10:00:08  |       52% |
| 10:00:09  |       50% |

These are raw measurements.

Every measurement preserves the original observation.

Now suppose we calculate the average CPU usage over these 10 seconds.

\[
\text{Average} = \frac{50+52+55+53+58+60+57+55+52+50}{10}
\]

\[
\text{Average} = 54.2\%
\]

Instead of retaining all ten values in the summary, we can store:

| Time Window       | Average CPU |
| ----------------- | ----------: |
| 10:00:00–10:00:09 |       54.2% |

This is aggregated data.

The aggregated record is smaller, but it does not preserve every original measurement.

**Important:** Aggregation is a transformation of data. Once raw measurements are discarded, information that was not preserved in the aggregate cannot generally be reconstructed.

For example, an average of 54.2% does not tell us the exact maximum CPU usage or when it occurred.

---

# 3. What Is Downsampling?

Downsampling is the process of reducing the number of stored observations by representing multiple measurements with fewer measurements at a lower time resolution.

For example:

```text
Original data:

One measurement every second

10:00:00
10:00:01
10:00:02
10:00:03
10:00:04
10:00:05
...

Downsampled data:

One measurement every minute

10:00
10:01
10:02
10:03
...
```

The database may calculate a statistical summary for each interval.

Common summaries include:

- Average.
- Minimum.
- Maximum.
- Sum.
- Count.
- First value.
- Last value.
- Percentiles, where supported and appropriately calculated.

## 3.1 Why do we need downsampling?

Imagine retaining CPU measurements every second for five years.

The database would need to store an enormous number of observations.

But consider how people usually analyze historical monitoring data.

For recent activity, they may need second-level detail.

For last month's activity, minute-level detail may be sufficient.

For last year's activity, hourly or daily summaries may be sufficient.

Therefore, storing all historical data at the original resolution is often unnecessary.

## 3.2 Example of downsampling

Original data:

| Timestamp | CPU |
| --------- | --: |
| 10:00:00  |  40 |
| 10:00:10  |  50 |
| 10:00:20  |  60 |
| 10:00:30  |  70 |
| 10:00:40  |  80 |
| 10:00:50  |  90 |

Suppose we downsample into one-minute intervals.

The average is:

\[
\frac{40+50+60+70+80+90}{6}=65
\]

The resulting data:

| Time Window | Average CPU |
| ----------- | ----------: |
| 10:00–10:01 |          65 |

We have replaced six measurements with one summary.

The original values are no longer available from this summary alone.

## 3.3 Downsampling does not necessarily mean deleting data

Downsampling and retention are separate operations.

A system can:

- Generate downsampled data.
- Keep the original raw data.
- Delete raw data later according to its retention policy.

For example:

```text
Raw data:
1-second resolution
Retained for 7 days

Downsampled data:
1-minute resolution
Retained for 30 days

Further downsampled data:
1-hour resolution
Retained for 1 year
```

This is a common lifecycle strategy.

---

# 4. Choosing the Correct Aggregation Function

Downsampling requires choosing what information to preserve.

The correct aggregation depends on the metric.

## 4.1 Average

Average represents the typical value over an interval.

Example:

```text
CPU values:

40, 50, 60, 70, 80

Average:

60
```

Useful for:

- Average CPU usage.
- Average memory consumption.
- Average response time, when an ordinary mean is appropriate.

However, averages can hide short-lived spikes.

Example:

```text
CPU:

10, 10, 10, 10, 100

Average:

28
```

The average is 28%, but the system experienced a 100% CPU spike.

If we store only the average, that spike becomes invisible.

## 4.2 Minimum and Maximum

Minimum and maximum preserve the lowest and highest observations in a window.

Example:

```text
CPU values:

40, 50, 60, 70, 100

MIN = 40
MAX = 100
AVG = 64
```

A useful summary:

| Window      | Min | Avg | Max |
| ----------- | --: | --: | --: |
| 10:00–10:01 |  40 |  64 | 100 |

This provides more information than average alone.

It is particularly useful for monitoring:

- CPU spikes.
- Memory pressure.
- Response-time spikes.
- Temperature.
- Network utilization.

## 4.3 Sum

Sum adds all values in an interval.

Example:

```text
HTTP requests per second:

10, 15, 20, 25, 30

SUM = 100
```

Useful for:

- Total requests.
- Total transactions.
- Total events.
- Total bytes transferred, when the stored values represent interval increments.

Be careful about the meaning of the metric.

If a metric represents a cumulative counter, summing its readings is usually incorrect.

For example:

```text
Cumulative requests:

100
110
125
140
```

The total number of requests is not:

```text
100 + 110 + 125 + 140 = 475
```

The values represent a running total.

The increase over the observed interval is:

```text
140 - 100 = 40
```

Counter resets and missing observations require additional handling.

## 4.4 Count

Count records how many observations were received in an interval.

Example:

```text
Measurements:

40, 50, 60, 70, 80

COUNT = 5
```

Count is useful for:

- Measuring event volume.
- Identifying missing measurements.
- Understanding sampling frequency.
- Supporting weighted aggregation.

## 4.5 First and Last

These preserve the first and last observations in a time window.

Example:

```text
Values:

40, 50, 60, 70, 80

FIRST = 40
LAST  = 80
```

Useful for:

- Financial price data.
- State changes.
- Cumulative counters.
- Tracking the beginning and end of an interval.

The database must define what first and last mean when timestamps are duplicated or observations arrive out of order.

## 4.6 Percentiles

Percentiles describe the distribution of observations.

For example:

- p50: median.
- p90: 90th percentile.
- p95: 95th percentile.
- p99: 99th percentile.

Suppose an API receives these response times:

```text
20, 25, 30, 35, 40, 50, 60, 100, 200, 500 ms
```

The average is:

```text
106 ms
```

But the average does not describe the slower requests particularly well.

A percentile provides more information about the distribution.

For API monitoring, p95 and p99 are often more useful than average latency alone.

**Important:** You cannot generally calculate an accurate percentile of all original observations by simply averaging or taking the maximum of previously calculated percentiles.

Percentile rollups require an appropriate representation of the underlying distribution, such as retained samples, mergeable sketches, or another supported summary structure.

## 4.7 Aggregation comparison

| Function | What it preserves        | Common use                         |
| -------- | ------------------------ | ---------------------------------- |
| AVG      | Average value            | Typical CPU usage                  |
| MIN      | Lowest value             | Minimum temperature                |
| MAX      | Highest value            | CPU spikes                         |
| SUM      | Total of interval values | Event counts or traffic increments |
| COUNT    | Number of observations   | Measurement volume                 |
| FIRST    | First observation        | Opening value                      |
| LAST     | Last observation         | Latest state                       |
| P50      | Median                   | Typical latency                    |
| P95      | 95th percentile          | Slow-request analysis              |
| P99      | 99th percentile          | Tail latency                       |

A good downsampling design often preserves multiple statistics rather than just one average.

---

# 5. What Are Rollups?

A rollup is a precomputed summary of data over a larger time interval.

For example, instead of repeatedly calculating hourly CPU averages from millions of raw measurements, a database can store hourly summaries.

Consider:

```text
Raw measurements:
Every second

Rollup:
Every minute

Further rollup:
Every hour

Further rollup:
Every day
```

Conceptually:

```text
              RAW DATA
          1-second measurements
                  |
                  v
             1-minute
               ROLLUP
                  |
                  v
              1-hour
               ROLLUP
                  |
                  v
              1-day
               ROLLUP
```

Each stage stores a smaller representation of historical data.

## 5.1 Why rollups are useful

Suppose a dashboard needs average CPU usage for the last 365 days.

Without rollups:

```text
Read potentially billions of raw measurements
                  |
                  v
             Aggregate data
                  |
                  v
             Return result
```

With daily rollups:

```text
Read 365 daily summaries
          |
          v
    Combine summaries
          |
          v
     Return result
```

The query processes far fewer records.

This can improve:

- Query latency.
- CPU consumption.
- Disk I/O.
- Dashboard responsiveness.
- Cost of historical analytics.

## 5.2 Rollups vs downsampling

These concepts are related but not identical.

| Downsampling                       | Rollup                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| Reduces temporal resolution        | Stores precomputed summaries                               |
| Produces fewer observations        | Produces aggregated records                                |
| Focuses on reducing data density   | Focuses on reusable aggregate results                      |
| Often uses average, min, max, etc. | Can use average, count, sum, min, max, and other summaries |

In practical systems, a downsampled dataset is frequently implemented as a rollup.

The distinction is useful conceptually, but database products may use these terms differently.

## 5.3 Example: Raw measurements and rollups

Raw data:

| Time  | CPU |
| ----- | --: |
| 10:00 |  40 |
| 10:01 |  50 |
| 10:02 |  60 |
| 10:03 |  70 |
| 10:04 |  80 |
| 10:05 |  90 |

Minute-level observations are already shown here for simplicity.

A 5-minute rollup:

| Window      | Average | Min | Max | Count |
| ----------- | ------: | --: | --: | ----: |
| 10:00–10:05 |      60 |  40 |  80 |     5 |

A larger rollup can be produced by combining smaller rollups, provided the required statistics are retained.

For example, if the first interval has:

```text
sum = 300
count = 5
```

and the second interval has:

```text
sum = 450
count = 5
```

Then:

```text
Combined sum = 300 + 450 = 750

Combined count = 5 + 5 = 10

Combined average = 750 / 10 = 75
```

Notice that the combined average is not calculated by blindly averaging the two averages unless their counts are equal.

This distinction is important when combining rollups.

---

# 6. Multi-Level Data Resolution

A production monitoring system may maintain different resolutions for different historical periods.

Example:

| Data tier        | Resolution | Retention |
| ---------------- | ---------- | --------- |
| Raw              | 1 second   | 7 days    |
| Fine rollup      | 1 minute   | 30 days   |
| Medium rollup    | 5 minutes  | 90 days   |
| Coarse rollup    | 1 hour     | 1 year    |
| Long-term rollup | 1 day      | 5 years   |

These values are illustrative.

A system may use fewer tiers or different intervals.

## 6.1 Visualizing the lifecycle

```text
                 RAW DATA
             1-second samples
                7 days
                    |
                    v
             1-MINUTE ROLLUP
                 30 days
                    |
                    v
              5-MINUTE ROLLUP
                 90 days
                    |
                    v
              1-HOUR ROLLUP
                  1 year
                    |
                    v
              1-DAY ROLLUP
                  5 years
```

As data gets older:

- Its resolution decreases.
- Its storage requirements decrease.
- Its retention period can increase.

This creates a practical balance between detailed recent monitoring and long-term historical analysis.

## 6.2 Why not keep only one resolution?

Because different queries need different levels of detail.

For example:

| Query                                       | Suitable resolution |
| ------------------------------------------- | ------------------- |
| Investigate a CPU spike from 10 minutes ago | 1 second            |
| Analyze average CPU over the last 24 hours  | 1 minute            |
| Compare server usage over the last month    | 5 minutes           |
| Analyze annual infrastructure trends        | 1 hour or 1 day     |

Using raw data for every historical query is often wasteful.

Using daily data for recent debugging is too coarse.

Multiple resolutions support different analytical needs.

---

# 7. Retention Policies

A retention policy defines how long data should be stored before it becomes eligible for removal.

For example:

```text
Raw metrics:
Keep for 7 days.

Minute-level rollups:
Keep for 30 days.

Hourly rollups:
Keep for 1 year.
```

After the configured retention period, expired data is deleted according to the database's lifecycle mechanism.

## 7.1 Why retention is necessary

Suppose an application generates 100 million measurements daily.

Keeping all data forever would create continuous storage growth.

Retention helps control:

- Storage costs.
- Index size.
- Metadata size.
- Maintenance workload.
- Historical query scope.

## 7.2 Retention and partitioning

Time-based partitioning makes retention easier.

Suppose a database stores daily partitions:

```text
metrics_2026_11_01
metrics_2026_11_02
metrics_2026_11_03
metrics_2026_11_04
metrics_2026_11_05
```

If raw data is retained for seven days, the database can remove expired partitions or chunks rather than deleting every old row individually.

This can be much more efficient.

The exact mechanism depends on the database.

For PostgreSQL partitioned tables, dropping or detaching a partition can be much more efficient than deleting millions of rows individually.

Other time-series systems may delete entire blocks or storage ranges.

## 7.3 Retention is not the same as downsampling

These operations solve different problems.

| Retention                            | Downsampling                              |
| ------------------------------------ | ----------------------------------------- |
| Controls how long data exists        | Reduces data resolution                   |
| Removes expired data                 | Creates fewer representative observations |
| Controls historical storage duration | Controls historical detail                |
| Can delete raw or aggregated data    | Usually produces aggregated data          |

They are often used together.

## 7.4 Example retention lifecycle

```text
Day 1:
Raw measurements are collected.

Day 2:
Raw measurements remain available.

Day 7:
Raw data reaches its retention limit.

Before deletion:
Required rollups must already be available.

After expiration:
Raw measurements are deleted.

Historical analysis:
Uses retained rollup data.
```

A critical operational requirement is to ensure that rollups have been successfully generated before deleting the raw source data.

Otherwise, the system may permanently lose information needed for historical analysis.

---

# 8. Continuous Aggregation

A conventional aggregation query calculates results when someone requests them.

For example:

```sql
SELECT
    date_trunc('minute', timestamp) AS minute,
    AVG(cpu_usage)
FROM server_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY minute;
```

If a dashboard executes this query every few seconds, the database may repeatedly scan and aggregate similar data.

Continuous aggregation reduces repeated work by maintaining precomputed summaries.

## 8.1 What is continuous aggregation?

Continuous aggregation automatically maintains aggregate results as new data arrives.

Conceptually:

```text
Incoming Measurements
          |
          v
      Raw Table
          |
          v
  Aggregation Process
          |
          v
  Precomputed Summary
          |
          v
      Dashboard
```

Instead of recalculating everything for every request, the dashboard can query the precomputed result.

## 8.2 Example

Raw table:

```sql
CREATE TABLE server_metrics (
    timestamp TIMESTAMPTZ NOT NULL,
    host TEXT NOT NULL,
    cpu_usage DOUBLE PRECISION
);
```

A PostgreSQL materialized view can store a summary:

```sql
CREATE MATERIALIZED VIEW cpu_minute_summary AS
SELECT
    date_trunc('minute', timestamp) AS minute,
    host,
    AVG(cpu_usage) AS avg_cpu,
    MIN(cpu_usage) AS min_cpu,
    MAX(cpu_usage) AS max_cpu,
    COUNT(*) AS sample_count
FROM server_metrics
GROUP BY
    date_trunc('minute', timestamp),
    host;
```

This demonstrates precomputed aggregation.

However, a normal PostgreSQL materialized view does not automatically update whenever new rows arrive.

It needs to be refreshed.

TimescaleDB provides continuous aggregate functionality specifically designed to maintain time-based aggregate results incrementally.

## 8.3 Why continuous aggregation is better for repeated queries

Without precomputed summaries:

```text
Dashboard request
       |
       v
Scan raw data
       |
       v
Aggregate raw data
       |
       v
Return result
```

Repeated request:

```text
Dashboard request
       |
       v
Scan raw data again
       |
       v
Aggregate again
       |
       v
Return result
```

With continuous aggregation:

```text
New measurements
       |
       v
Maintain summary
       |
       v
Precomputed aggregate
       |
       v
Dashboard reads summary
```

The database performs maintenance work as data changes rather than repeating the full calculation for every dashboard request.

## 8.4 Continuous aggregation is not necessarily immediate

A common misconception is that continuous aggregation means every new measurement immediately appears in the aggregate.

In practice, systems may use scheduled refreshes, background jobs, invalidation tracking, or other maintenance mechanisms.

There can be a delay between:

- When the raw measurement arrives.
- When the aggregate becomes available.

The exact behavior depends on the database and configuration.

---

# 9. Late-Arriving Data and Historical Corrections

Real systems do not always receive measurements in chronological order.

Suppose a device produces:

```text
10:00 -> 40
10:01 -> 50
10:02 -> 60
```

But network delays cause the database to receive them in this order:

```text
10:00 -> 40
10:02 -> 60
10:01 -> 50
```

The 10:01 measurement is late-arriving data.

This creates a challenge for rollups and continuous aggregation.

## 9.1 Why late data matters

Suppose a minute-level summary was already calculated:

```text
10:00–10:01

Average = 40
Count = 1
```

Later, another observation arrives for the same interval:

```text
10:00:30 -> 60
```

The correct summary becomes:

```text
Average = (40 + 60) / 2

= 50
```

The previous aggregate is now incomplete.

The database must account for the late observation.

## 9.2 Possible approaches

Databases may handle late-arriving data through:

- Refreshing affected aggregate windows.
- Recomputing historical summaries.
- Maintaining invalidation information.
- Using allowed-lateness windows.
- Updating stored aggregate state.

The exact approach differs between systems.

## 9.3 Event time vs ingestion time

Remember the distinction:

| Time type      | Meaning                       |
| -------------- | ----------------------------- |
| Event time     | When the measurement occurred |
| Ingestion time | When the database received it |

For time-series analytics, aggregation is generally based on event time when the goal is to represent when something actually happened.

Ingestion time remains useful for diagnosing delivery delays.

## 9.4 Handling late-arriving data in Node.js

A backend might send:

```javascript
const measurement = {
  eventTime: new Date("2026-11-14T10:01:00Z"),
  receivedAt: new Date(),
  metric: "cpu_usage",
  value: 50,
  host: "server-01",
};
```

The system should not automatically replace event time with the current server time.

Doing so would distort historical analysis.

---

# 10. Hierarchical Rollups

Large systems may create multiple aggregation levels.

For example:

```text
Raw data
   |
   v
1-minute aggregates
   |
   v
5-minute aggregates
   |
   v
1-hour aggregates
   |
   v
1-day aggregates
```

This is called hierarchical aggregation or hierarchical rollups.

## 10.1 Example

Suppose we collect one CPU measurement every minute.

We calculate:

- Average CPU for each minute.
- Average CPU for each five-minute interval.
- Average CPU for each hour.
- Average CPU for each day.

The hourly summary can be generated from minute-level summaries.

However, it must preserve enough information to calculate the correct result.

## 10.2 Why storing count and sum matters

Suppose two one-minute intervals have:

| Interval | Average | Count |
| -------- | ------: | ----: |
| Minute 1 |      20 |    10 |
| Minute 2 |      80 |   100 |

A naive average of averages gives:

\[
\frac{20+80}{2}=50
\]

But the actual combined average is:

\[
\frac{(20\times10)+(80\times100)}{10+100}
\]

\[
=\frac{8200}{110}
\]

\[
\approx74.55
\]

The two intervals contain different numbers of observations.

Therefore, storing only the average is insufficient for correctly combining arbitrary rollups.

A better aggregate state includes:

```text
sum
count
min
max
```

Then:

```text
combined_sum = sum_1 + sum_2

combined_count = count_1 + count_2

combined_average =
    combined_sum / combined_count
```

This allows correct hierarchical average calculation.

## 10.3 Mergeable aggregate states

For scalable aggregation, databases often maintain intermediate aggregate states that can be combined.

Examples:

| Desired result | Useful intermediate state                                                |
| -------------- | ------------------------------------------------------------------------ |
| Average        | Sum + count                                                              |
| Minimum        | Minimum                                                                  |
| Maximum        | Maximum                                                                  |
| Count          | Count                                                                    |
| Sum            | Sum                                                                      |
| Variance       | Suitable count, sum, and squared-deviation state or mergeable equivalent |
| Percentile     | Mergeable sketch or retained distribution representation                 |

Not every statistic can be combined accurately from a single scalar summary.

For example, an average of averages is not generally sufficient, and an average of p99 values does not produce the combined p99.

---

# 11. Storage Savings: A Practical Calculation

Let's calculate how much storage downsampling can save.

Assume:

```text
Servers: 1,000

Measurements per second per server: 1

Metrics per server: 5
```

Total measurements per second:

\[
1000 \times 1 \times 5 = 5000
\]

Measurements per day:

\[
5000 \times 86400 = 432,000,000
\]

That is 432 million measurements per day.

Assume each stored measurement requires approximately 100 bytes, including its allocated storage overhead for this simplified estimate.

Daily storage:

\[
432,000,000 \times 100
\]

\[
=43,200,000,000 \text{ bytes}
\]

Approximately 43.2 GB per day using decimal units.

For 30 days:

\[
43.2 \times 30 = 1296 \text{ GB}
\]

Approximately 1.296 TB.

This is an illustrative estimate, not a storage prediction for a particular database. Actual storage depends heavily on compression, indexing, labels, metadata, replication, and storage format.

## 11.1 Storage after downsampling

Suppose we aggregate every 60 seconds.

The number of observations becomes approximately:

\[
\frac{432,000,000}{60}=7,200,000
\]

The resulting number of aggregate records is about 7.2 million per day, assuming one aggregate record per original series and time bucket.

That is a 60-fold reduction in record count.

If each rollup record is still approximately 100 bytes:

```text
7.2 million × 100 bytes

= 720 MB per day
```

Actual rollup records may be larger because they can contain several statistics.

Still, the reduction in record count can be substantial.

## 11.2 Important qualification

Downsampling by a factor of 60 does not guarantee exactly 60 times less storage.

Why?

Because:

- Each rollup may store multiple statistics.
- Index and metadata overhead differs.
- Raw data may compress better than expected.
- Series labels may be shared.
- Storage engines have different formats.
- Rollups may need additional indexes.

The correct comparison must use measured storage consumption.

---

# 12. Querying Across Multiple Resolutions

When a database stores raw data and several rollup levels, the query engine may select the appropriate resolution.

Example:

```text
Requested query: Last 2 hours

Use:
Raw or 1-minute data

Requested query: Last 30 days

Use:
5-minute rollups

Requested query: Last 2 years

Use:
Hourly or daily rollups
```

The resolution-selection policy depends on the database, query, and application.

## 12.1 Why query resolution matters

Suppose a dashboard displays the last year of CPU usage on a screen that is only 1,000 pixels wide.

Returning every second-level observation is unnecessary.

There are 31,536,000 seconds in a non-leap year.

The screen cannot meaningfully display more than a small fraction of those individual points.

A lower-resolution dataset may be sufficient for the visualization.

This is an important reason for downsampling.

## 12.2 Avoid losing spikes

If the dashboard uses only averages, short-lived spikes may disappear.

For example:

```text
Raw CPU:

10, 10, 10, 100, 10, 10, 10

Average:

22.86
```

A graph showing only 22.86% may hide the fact that CPU reached 100%.

A better rollup can preserve:

```text
Average = 22.86
Minimum = 10
Maximum = 100
```

This provides a more informative historical view.

---

# 13. Time-Series Operations in PostgreSQL and TimescaleDB

Let's connect the concepts to SQL.

## 13.1 PostgreSQL aggregation using time buckets

PostgreSQL supports grouping by time expressions.

For example:

```sql
SELECT
    date_trunc('minute', timestamp) AS minute,
    host,
    AVG(cpu_usage) AS avg_cpu,
    MIN(cpu_usage) AS min_cpu,
    MAX(cpu_usage) AS max_cpu,
    COUNT(*) AS sample_count
FROM server_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY
    date_trunc('minute', timestamp),
    host
ORDER BY minute;
```

This calculates minute-level summaries.

It is a regular SQL aggregation query, not automatically a persistent rollup.

## 13.2 TimescaleDB time_bucket()

TimescaleDB provides `time_bucket()` for grouping observations into fixed time intervals.

Example:

```sql
SELECT
    time_bucket('1 minute', timestamp) AS minute,
    host,
    AVG(cpu_usage) AS avg_cpu,
    MIN(cpu_usage) AS min_cpu,
    MAX(cpu_usage) AS max_cpu
FROM server_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY
    minute,
    host
ORDER BY minute;
```

The `time_bucket()` function groups timestamps into time intervals.

For example:

```text
10:00:05 -> 10:00
10:00:25 -> 10:00
10:00:55 -> 10:00

10:01:10 -> 10:01
10:01:45 -> 10:01
```

All measurements in the same interval are grouped together.

## 13.3 Creating a continuous aggregate in TimescaleDB

A conceptual example:

```sql
CREATE MATERIALIZED VIEW cpu_minute_summary
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', timestamp) AS minute,
    host,
    AVG(cpu_usage) AS avg_cpu,
    MIN(cpu_usage) AS min_cpu,
    MAX(cpu_usage) AS max_cpu,
    COUNT(*) AS sample_count
FROM server_metrics
GROUP BY
    minute,
    host;
```

This creates a continuous aggregate.

TimescaleDB can maintain the aggregate through its continuous aggregate refresh mechanisms.

The exact syntax, refresh behavior, and supported features can vary by TimescaleDB version.

## 13.4 Querying the aggregate

```sql
SELECT
    minute,
    host,
    avg_cpu,
    min_cpu,
    max_cpu
FROM cpu_minute_summary
WHERE minute >= NOW() - INTERVAL '24 hours'
ORDER BY minute;
```

Instead of repeatedly aggregating all raw measurements, the application can query the precomputed summary.

## 13.5 Refresh policies

Continuous aggregates can use refresh policies to maintain summaries automatically.

Conceptually:

```text
Every configured interval:

Identify the time range needing refresh.

Recalculate affected aggregate windows.

Update the stored summary.
```

A refresh policy may use:

- Start offset.
- End offset.
- Schedule interval.

The exact policy should account for late-arriving data.

For example, if measurements may arrive several minutes late, refreshing only the newest completed minute may be insufficient.

The system needs a refresh window that includes the expected late-arrival period.

---

# 14. Example: Building a Monitoring Data Lifecycle

Let's design a monitoring system for an application with 100 servers.

It collects:

- CPU usage.
- Memory usage.
- Disk usage.
- HTTP request count.
- Response latency.

## 14.1 Raw ingestion

The monitoring agent sends one measurement per second per metric.

The system stores detailed measurements.

```text
Data source:
100 servers

Metrics:
5

Sampling:
1 second
```

Measurements per second:

\[
100 \times 5 = 500
\]

Measurements per day:

\[
500 \times 86400 = 43,200,000
\]

## 14.2 Short-term raw retention

Keep raw measurements for seven days.

This supports:

- Debugging recent incidents.
- Investigating CPU spikes.
- Understanding latency changes.
- Identifying short-lived failures.

## 14.3 Minute-level rollups

Generate one-minute summaries containing:

```text
avg
min
max
count
sum
```

Keep these for 30 days.

This supports:

- Daily performance reports.
- Incident analysis.
- Service comparisons.
- Short-term trends.

## 14.4 Hourly rollups

Generate hourly summaries.

Keep them for one year.

This supports:

- Monthly reports.
- Capacity planning.
- Performance comparisons.
- Long-term infrastructure analysis.

## 14.5 Daily rollups

Generate daily summaries.

Keep them for five years.

This supports:

- Annual performance trends.
- Infrastructure growth analysis.
- Long-term reporting.

## 14.6 Final architecture

```text
              Monitoring Agents
                      |
                      v
                Raw Ingestion
                      |
                      v
               Raw Measurements
                 1-second data
                      |
             +--------+--------+
             |                 |
             v                 v
        Raw Queries       Aggregation
                               |
                               v
                       Minute Rollups
                               |
                               v
                       Hourly Rollups
                               |
                               v
                        Daily Rollups

Retention:

Raw:       7 days
Minute:   30 days
Hourly:    1 year
Daily:     5 years
```

This architecture separates detailed recent monitoring from long-term analytical storage.

---

# 15. Common Mistakes and Misconceptions

## Mistake 1: Keeping only averages

An average can hide spikes and extreme values.

**Better approach:** Preserve min, max, count, and other useful statistics according to the metric.

## Mistake 2: Treating downsampling and retention as the same thing

Downsampling reduces resolution. Retention controls how long data is kept.

**Better approach:** Design them as separate policies.

## Mistake 3: Deleting raw data before rollups are ready

This can permanently destroy information needed for historical analysis.

**Better approach:** Generate, validate, and verify rollups before deleting source data.

## Mistake 4: Averaging averages

A simple average of averages is incorrect when the underlying groups have different observation counts.

**Better approach:** Preserve sum and count, then calculate the weighted average.

## Mistake 5: Assuming p99 values can be averaged

Percentiles are not generally composable by averaging their scalar values.

**Better approach:** Use an appropriate mergeable distribution representation or recompute from retained observations.

## Mistake 6: Using coarse data for incident investigation

Daily averages cannot explain a five-second outage.

**Better approach:** Retain sufficiently detailed raw data for the incident investigation window.

## Mistake 7: Ignoring late-arriving measurements

A completed aggregate may become incorrect when older observations arrive later.

**Better approach:** Configure refresh windows or correction mechanisms based on expected data lateness.

## Mistake 8: Assuming downsampling always saves storage proportionally

Rollups may store multiple statistics and additional metadata.

**Better approach:** Measure actual storage consumption.

## Mistake 9: Using the same resolution for every query

A recent debugging query and a five-year trend analysis have different precision requirements.

**Better approach:** Select the appropriate data resolution for the query's time range and purpose.

---

# 16. Practical Design Guidelines

When designing a time-series data lifecycle, follow these principles.

| Requirement                     | Recommended approach                          |
| ------------------------------- | --------------------------------------------- |
| Recent debugging                | Retain raw measurements                       |
| Long-term trends                | Use aggregated rollups                        |
| Detect spikes                   | Preserve minimum and maximum                  |
| Calculate accurate averages     | Preserve sum and count                        |
| Analyze request latency         | Preserve suitable percentile information      |
| Control storage growth          | Apply retention policies                      |
| Avoid repeated historical scans | Use precomputed summaries                     |
| Handle late measurements        | Refresh or correct affected windows           |
| Maintain data integrity         | Verify rollups before deleting raw data       |
| Support different dashboards    | Maintain multiple resolutions where justified |

A good lifecycle design should answer five questions:

1. How much detail is required for recent data?
2. How long should raw measurements remain available?
3. Which statistics must be preserved?
4. How should late-arriving data be handled?
5. What historical resolution is sufficient for long-term analysis?

---

# 17. Interview Questions and Answers

## Q1. What is downsampling?

**Answer:**

Downsampling reduces the temporal resolution of time-series data by representing multiple measurements with fewer observations or aggregated summaries.

For example, converting one-second measurements into one-minute summaries.

## Q2. Why do time-series databases use downsampling?

**Answer:**

To reduce historical storage consumption and make long-range analytical queries more efficient while preserving useful information.

## Q3. What is a rollup?

**Answer:**

A rollup is a precomputed aggregate over a time interval.

For example, storing hourly CPU averages instead of calculating them from raw measurements every time a dashboard requests them.

## Q4. What is the difference between downsampling and rollups?

**Answer:**

Downsampling reduces data resolution. Rollups store precomputed aggregate results.

They are often implemented together, but they describe different aspects of the operation.

## Q5. What is a retention policy?

**Answer:**

A retention policy defines how long data should be stored before it becomes eligible for deletion.

## Q6. Why should raw data and aggregated data have different retention periods?

**Answer:**

Raw data is useful for detailed debugging but consumes more storage.

Aggregated data is smaller and can support long-term trend analysis.

Keeping raw data for a shorter period and summaries for longer periods balances detail and cost.

## Q7. Why is storing only average values dangerous?

**Answer:**

An average can hide short-lived spikes and extreme values.

For example, CPU usage could reach 100% for a short period while the average remains relatively low.

Storing min and max alongside average preserves more information.

## Q8. Why should rollups store sum and count?

**Answer:**

They allow accurate averages to be calculated when combining multiple aggregate intervals.

A simple average of averages is incorrect when the intervals contain different numbers of observations.

## Q9. Can you calculate p99 from the average and count?

**Answer:**

No.

Average and count do not preserve the distribution of individual observations.

Percentiles require retained samples, suitable distribution data, or a mergeable statistical sketch.

## Q10. What is continuous aggregation?

**Answer:**

Continuous aggregation automatically maintains precomputed aggregate results as data arrives or changes.

It reduces the need to repeatedly calculate the same summaries from raw measurements.

## Q11. Does continuous aggregation guarantee immediate results?

**Answer:**

No.

Depending on the database and configuration, aggregates may be updated through scheduled refreshes or background maintenance.

There may be a delay between raw ingestion and aggregate availability.

## Q12. How should a database handle late-arriving measurements?

**Answer:**

It must update or recompute the affected aggregate windows.

Possible techniques include refresh windows, invalidation tracking, and incremental aggregate maintenance.

## Q13. What is hierarchical rollup?

**Answer:**

It is a multi-level aggregation process in which lower-resolution summaries are combined into higher-level summaries.

Example:

```text
1-minute -> 5-minute -> hourly -> daily
```

## Q14. Why is partitioning useful for retention?

**Answer:**

Time-based partitions allow databases to remove entire expired data ranges instead of deleting millions of individual records.

## Q15. How do rollups improve dashboard performance?

**Answer:**

They reduce the number of records that must be scanned and aggregated for historical queries.

## Q16. What is the difference between event time and ingestion time?

**Answer:**

Event time represents when the measurement occurred. Ingestion time represents when the database received it.

Late-arriving data makes this distinction important for accurate time-based aggregation.

## Q17. Can a one-hour average be calculated from minute-level averages?

**Answer:**

Yes, if the minute-level summaries preserve sufficient information, such as sum and count.

Simply averaging the minute averages is only correct when each minute contributes the same number of observations.

## Q18. How would you design retention for a monitoring platform?

**Answer:**

I would retain detailed raw measurements for a short period, generate minute-level summaries for medium-term analysis, and maintain hourly or daily rollups for long-term reporting.

The exact retention durations would depend on debugging requirements, storage cost, compliance, and analytical needs.

---

# 18. Practical Exercises

## Exercise 1: Calculate downsampled values

Given:

```text
CPU measurements:

20, 30, 40, 50, 60, 70
```

Calculate:

1. Average.
2. Minimum.
3. Maximum.
4. Sum.
5. Count.

Expected:

```text
Average = 45

Minimum = 20

Maximum = 70

Sum = 270

Count = 6
```

## Exercise 2: Calculate a weighted average

Two intervals have:

| Interval   |   Sum | Count |
| ---------- | ----: | ----: |
| Interval 1 |   500 |    10 |
| Interval 2 | 2,000 |    40 |

Calculate the combined average.

Solution:

```text
Combined sum = 500 + 2000
             = 2500

Combined count = 10 + 40
               = 50

Combined average = 2500 / 50
                 = 50
```

## Exercise 3: Design retention

You are building a monitoring platform.

Requirements:

- Recent data must support detailed debugging.
- Monthly reports must remain available.
- Annual trends must be available for five years.
- Storage cost must remain controlled.

Design:

1. Raw data retention.
2. Minute-level rollup retention.
3. Hourly rollup retention.
4. Daily rollup retention.

Explain why you chose each duration and resolution.

## Exercise 4: Identify the aggregation problem

A system stores only:

```text
Minute 1 average = 20
Minute 2 average = 80
```

A developer calculates:

```text
(20 + 80) / 2 = 50
```

But Minute 1 contains 10 observations and Minute 2 contains 100 observations.

Explain why the result is incorrect and calculate the correct combined average.

## Exercise 5: Design latency rollups

Your API generates 10,000 response-time measurements per minute.

The dashboard must display:

- Average latency.
- p50 latency.
- p95 latency.
- p99 latency.
- Maximum latency.

Explain which statistics or intermediate representations you need to preserve.

## Exercise 6: Handle late-arriving data

An hourly aggregate has already been generated.

A measurement arrives 20 minutes late but belongs to that hour.

Explain:

1. Why the aggregate may now be incorrect.
2. How the affected window can be identified.
3. How the aggregate can be refreshed.
4. Why deleting raw data too early is dangerous.

## Exercise 7: Calculate storage savings

A system produces:

```text
10,000 measurements per second
```

Calculate:

1. Measurements per day.
2. Measurements per 30 days.
3. Measurements per day after one-minute downsampling.
4. Reduction factor in record count.

Assume one rollup record is produced per original series per minute.

---

# 19. Part 16D — Quick Revision

| Concept                | Meaning                                            |
| ---------------------- | -------------------------------------------------- |
| Raw data               | Original individual measurements                   |
| Aggregation            | Calculating summaries over a group of observations |
| Downsampling           | Reducing the temporal resolution of data           |
| Rollup                 | Precomputed aggregate over a time interval         |
| Retention              | How long data is stored                            |
| Continuous aggregation | Automatically maintaining aggregate results        |
| Time bucket            | A fixed interval used to group observations        |
| Hierarchical rollup    | Combining smaller summaries into larger summaries  |
| Late-arriving data     | Data received after its event time                 |
| Event time             | When the event actually occurred                   |
| Ingestion time         | When the database received the event               |
| Weighted average       | Average calculated using group sizes               |
| p50                    | Median                                             |
| p95                    | 95th percentile                                    |
| p99                    | 99th percentile                                    |

## Most important concepts to remember

1. Raw measurements provide the highest detail but consume more storage.
2. Downsampling reduces the number of observations by reducing time resolution.
3. Rollups store reusable precomputed summaries.
4. Retention controls how long raw and aggregated data remains available.
5. Different historical periods can use different resolutions.
6. Average alone can hide important spikes; preserve min and max when needed.
7. Sum and count are important for correctly combining averages.
8. Percentiles cannot generally be combined by averaging percentile values.
9. Continuous aggregates reduce repeated query work but may have refresh delays.
10. Late-arriving data can require historical aggregate corrections.
11. Generate and verify rollups before deleting raw source data.
12. Choose data resolution based on the actual query and debugging requirements.

---

# 20. What Comes Next?

## Part 16E — Wide-Column vs Time-Series Databases

The final chapter of Part 16 will compare wide-column databases and specialized time-series databases.

Topics:

- Wide-column databases vs time-series databases.
- Data modeling differences.
- Write and read patterns.
- Storage architecture differences.
- Indexing and partitioning.
- Compression and retention.
- Scalability.
- Use cases.
- When to choose Cassandra, HBase, or a specialized TSDB.

Part 16C covered internal storage architecture. Part 16D covered the operational lifecycle of time-series data. Part 16E will connect these concepts to wide-column database design and help determine when each database category is appropriate.
