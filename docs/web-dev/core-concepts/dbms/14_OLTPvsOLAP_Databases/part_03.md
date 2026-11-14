---
sidebar_label: "Part 17C — OLTP vs OLAP: Architectural Differences"
sidebar_position: 1
---

# Part 17C — OLTP vs OLAP: Architectural Differences

## 1. Introduction

- **OLTP architecture** is designed to process business transactions reliably and quickly.
- **OLAP architecture** is designed to scan, aggregate, and analyze large volumes of data efficiently.

Consider an e-commerce application.

A customer places an order. The system must:

1. Validate the customer.
2. Check product availability.
3. Create an order.
4. Record payment information.
5. Update inventory.
6. Return the result.

This is an OLTP workload.

Now imagine the business wants to calculate:

- Total revenue by month.
- Top-selling products.
- Customer retention over the last two years.
- Revenue by geographical region.
- Campaign conversion rates.

These are OLAP workloads.

The same business data is involved, but the architecture required to process these workloads efficiently is different.

### What we will compare

1. Row-oriented vs column-oriented storage.
2. Query execution.
3. Indexing strategies.
4. Data organization.
5. Transaction processing vs analytical processing.
6. Memory and caching.
7. Write and read patterns.
8. Workload isolation.
9. Hybrid OLTP/OLAP architectures.
10. Real-world system design decisions.

---

## 2. Architectural Overview

Before comparing individual components, understand the high-level architectures.

### 2.1 OLTP architecture

```text
             CLIENT / APPLICATION
                      |
                      v
               API / BACKEND
                      |
                      v
               CONNECTION POOL
                      |
                      v
                QUERY ENGINE
                      |
          +-----------+-----------+
          |                       |
          v                       v
     Transaction Manager      Query Executor
          |                       |
          +-----------+-----------+
                      |
                      v
                 BUFFER CACHE
                      |
                      v
                 STORAGE ENGINE
                      |
          +-----------+-----------+
          |                       |
          v                       v
      WAL / REDO LOG          DATA FILES
          |
          v
       DURABILITY
```

The architecture focuses on:

- Fast individual record access.
- Concurrent transactions.
- ACID guarantees.
- Efficient inserts and updates.
- Consistent database state.
- Low transaction latency.

### 2.2 OLAP architecture

```text
             DATA SOURCES
                   |
        +----------+----------+
        |          |          |
        v          v          v
      OLTP       Events     External
     Database    Streams     Systems
        |          |          |
        +----------+----------+
                   |
                   v
             DATA INGESTION
                   |
                   v
             DATA STORAGE
                   |
                   v
             COLUMNAR DATA
                   |
                   v
             QUERY ENGINE
                   |
        +----------+----------+
        |          |          |
        v          v          v
     Parallel  Aggregation  Filtering
     Scanning
        |          |          |
        +----------+----------+
                   |
                   v
             ANALYTICAL RESULTS
                   |
                   v
          DASHBOARDS / REPORTS
```

The architecture focuses on:

- Large data scans.
- Aggregations.
- Columnar storage.
- Compression.
- Parallel execution.
- Historical analysis.
- Analytical query throughput.

---

## 3. Row-Oriented vs Column-Oriented Storage

This is one of the most important architectural differences.

### 3.1 Row-oriented storage

In row-oriented storage, values belonging to the same record are stored together.

Consider an `orders` table:

| order_id | customer_id | region | amount | status    |
| -------- | ----------- | ------ | -----: | --------- |
| 101      | 1           | North  |   1500 | completed |
| 102      | 2           | South  |   2500 | pending   |
| 103      | 3           | East   |   3000 | completed |

Conceptually, the physical organization is:

```text
Row 1:
[101, 1, North, 1500, completed]

Row 2:
[102, 2, South, 2500, pending]

Row 3:
[103, 3, East, 3000, completed]
```

The database stores the fields of a record together in its row-oriented representation.

This is useful when an application frequently accesses individual records.

Example:

```sql
SELECT *
FROM orders
WHERE order_id = 101;
```

The database retrieves the record and its required fields.

### 3.2 Why row storage works well for OLTP

Consider a typical application operation:

```sql
UPDATE orders
SET status = 'shipped'
WHERE order_id = 101;
```

The database identifies the relevant record and modifies the required value while maintaining transactional guarantees.

OLTP workloads commonly:

- Insert individual records.
- Update individual records.
- Delete individual records.
- Retrieve records by primary key.
- Retrieve small ranges of records.

Row-oriented storage is a natural fit for these access patterns.

### 3.3 Column-oriented storage

In column-oriented storage, values belonging to the same column are stored together.

The same table can be conceptually organized as:

```text
order_id:
[101, 102, 103]

customer_id:
[1, 2, 3]

region:
[North, South, East]

amount:
[1500, 2500, 3000]

status:
[completed, pending, completed]
```

Instead of grouping all fields of a record together, the system organizes values by column.

### 3.4 Why column storage works well for OLAP

Consider this query:

```sql
SELECT SUM(amount)
FROM orders
WHERE status = 'completed';
```

The query only requires:

- `amount`
- `status`

It does not need:

- `order_id`
- `customer_id`
- `region`

A column-oriented engine can read the required column data without reading unrelated columns.

This reduces unnecessary data access.

### 3.5 Visual comparison

<text id="x">Conceptual storage layout</text>

```text
ROW-ORIENTED

Record 1: | ID | Customer | Region | Amount | Status |
Record 2: | ID | Customer | Region | Amount | Status |
Record 3: | ID | Customer | Region | Amount | Status |


COLUMN-ORIENTED

ID:       | ID | ID | ID |
Customer: | Customer | Customer | Customer |
Region:   | Region | Region | Region |
Amount:   | Amount | Amount | Amount |
Status:   | Status | Status | Status |
```

### 3.6 Comparison

| Property              | Row-oriented              | Column-oriented                           |
| --------------------- | ------------------------- | ----------------------------------------- |
| Organization          | By record                 | By column                                 |
| Typical workload      | OLTP                      | OLAP                                      |
| Point lookup          | Usually efficient         | Depends on engine and layout              |
| Individual updates    | Usually efficient         | Can be more expensive                     |
| Large aggregations    | Often less efficient      | Often highly efficient                    |
| Reading a few columns | May read unrelated fields | Reads selected columns                    |
| Compression           | Varies by implementation  | Often benefits from similar column values |
| Common use            | Transaction processing    | Analytical processing                     |

**Important:** These are architectural tendencies, not absolute rules. Some systems combine multiple storage structures or use hybrid designs.

---

## 4. Why Columnar Storage Improves Analytical Performance

Columnar storage provides several advantages.

### 4.1 Column pruning

Column pruning means reading only the columns required by a query.

Example:

```sql
SELECT SUM(total_amount)
FROM orders;
```

The database does not need every field in the `orders` table.

A column-oriented engine can avoid reading unrelated columns.

This reduces I/O and memory consumption.

### 4.2 Compression

Column values often have similar data types and repeated patterns.

Consider:

```text
status:
completed
completed
completed
pending
completed
completed
pending
```

The database can compress repeated values efficiently.

Other techniques include:

- Dictionary encoding.
- Run-length encoding.
- Bit packing.
- Delta encoding.
- Compression algorithms applied to column data.

The exact techniques vary by database.

**Why does compression matter?**

Less data needs to be stored and transferred from storage into memory.

In many analytical workloads, reducing data movement is a major performance advantage.

### 4.3 Vectorized execution

Traditional execution can process data one value or tuple at a time.

Vectorized execution processes batches of values.

Conceptually:

```text
             COLUMN DATA
                  |
                  v
             READ BATCH
                  |
                  v
          PROCESS MANY VALUES
                  |
                  v
           CALCULATE PARTIAL
               RESULTS
                  |
                  v
            READ NEXT BATCH
                  |
                  v
             FINAL RESULT
```

For example, instead of adding one revenue value at a time through a tuple-processing loop, the engine can process a batch of values using CPU-efficient operations.

This can improve:

- CPU utilization.
- Cache efficiency.
- Throughput.
- Aggregation performance.

### 4.4 Less unnecessary data movement

Consider a table with 30 columns and 100 million records.

A query needs only two columns.

A row-oriented system may read pages containing many additional fields, depending on its storage layout and execution strategy.

A columnar system can read the two relevant columns.

This can substantially reduce the amount of data read.

---

## 5. Query Execution: OLTP vs OLAP

The two workloads execute different kinds of queries.

### 5.1 OLTP query execution

Consider:

```sql
SELECT *
FROM orders
WHERE order_id = 101;
```

Assume `order_id` is the primary key and has an index.

A simplified execution process:

1. Parse and validate the SQL.
2. Generate possible execution plans.
3. Choose an efficient plan.
4. Use the index to locate the record.
5. Fetch the required row.
6. Return the result.

Conceptually:

```text
           SQL QUERY
               |
               v
          QUERY PLANNER
               |
               v
          PRIMARY KEY INDEX
               |
               v
          FIND ROW LOCATION
               |
               v
           FETCH ROW
               |
               v
          RETURN RESULT
```

The goal is to locate a small amount of data quickly.

### 5.2 OLAP query execution

Consider:

```sql
SELECT
    region,
    SUM(total_amount) AS revenue
FROM orders
WHERE order_date >= DATE '2026-01-01'
GROUP BY region;
```

A simplified execution process:

1. Parse and validate the SQL.
2. Generate possible execution plans.
3. Identify relevant data partitions or segments.
4. Read required columns.
5. Filter rows.
6. Aggregate partial results.
7. Combine results from workers.
8. Return the final result.

Conceptually:

```text
             SQL QUERY
                 |
                 v
            QUERY PLANNER
                 |
                 v
         IDENTIFY DATA PARTITIONS
                 |
                 v
         READ REQUIRED COLUMNS
                 |
                 v
          PARALLEL SCANNING
                 |
                 v
          FILTER RECORDS
                 |
                 v
         PARTIAL AGGREGATIONS
                 |
                 v
          COMBINE RESULTS
                 |
                 v
           FINAL RESULT
```

The goal is to process a large amount of data efficiently.

### 5.3 Key difference

| OLTP execution            | OLAP execution              |
| ------------------------- | --------------------------- |
| Locate specific records   | Scan many records           |
| Index lookups are common  | Large scans are common      |
| Small result sets         | Large intermediate datasets |
| Individual row access     | Batch and column processing |
| Transaction-focused       | Aggregation-focused         |
| Low latency per operation | High analytical throughput  |

Do not interpret this as a rule that OLTP always uses indexes or OLAP never uses indexes. Both workload types can use indexes, scans, and other execution strategies depending on the database and query.

---

## 6. Indexing Strategies: OLTP vs OLAP

Indexes help databases locate data efficiently, but index design depends on workload.

### 6.1 OLTP indexing

OLTP databases commonly need fast access to individual records.

Typical indexes include:

- Primary key indexes.
- Unique indexes.
- Foreign key-related indexes.
- Composite indexes for application queries.
- Indexes supporting filtering and sorting.

Example:

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

Query:

```sql
SELECT *
FROM orders
WHERE customer_id = 501;
```

The index can help locate the customer's orders without scanning every record.

However, indexes introduce write overhead.

When a row is inserted, updated, or deleted, relevant indexes may also need maintenance.

Too many indexes can slow down transactional writes and consume storage.

### 6.2 OLAP indexing

Analytical databases may use different data organization and acceleration mechanisms.

Examples include:

- Partitioning.
- Clustering or sorting.
- Zone maps or min/max metadata.
- Data skipping indexes.
- Bitmap indexes in suitable systems.
- Materialized views.
- Pre-aggregated tables.
- Specialized indexes supported by the engine.

Not every analytical database uses the same indexing model.

### 6.3 Why traditional indexes are not always sufficient for OLAP

Imagine a table containing 100 million orders.

The query is:

```sql
SELECT SUM(total_amount)
FROM orders
WHERE order_date >= DATE '2024-01-01';
```

If most of the table matches the date condition, reading the qualifying data sequentially may be more efficient than performing a huge number of index lookups.

This is why analytical databases often focus on efficient scans, data layout, compression, and parallel processing.

### 6.4 Comparison

| Feature            | OLTP                          | OLAP                           |
| ------------------ | ----------------------------- | ------------------------------ |
| Primary key index  | Very common                   | Supported where appropriate    |
| Unique indexes     | Common                        | Supported where appropriate    |
| Composite indexes  | Common                        | Depends on engine and workload |
| Partitioning       | Useful for selected workloads | Often important                |
| Materialized views | Useful in some cases          | Common for repeated reports    |
| Pre-aggregation    | Sometimes                     | Often useful                   |
| Main objective     | Fast record access            | Efficient analytical scans     |

**Remember:** Indexing is not an either/or decision. The right design depends on the database engine, data layout, and query workload.

---

## 7. Data Organization: Current Operational Data vs Historical Analytical Data

OLTP and OLAP systems also differ in how they organize and use data.

### 7.1 OLTP data organization

OLTP systems commonly store the current operational state.

Example:

```text
orders
------
order_id
customer_id
order_date
status
total_amount
```

```text
inventory
---------
product_id
available_quantity
updated_at
```

The application needs the latest valid state to process transactions.

For example, when an order is placed, inventory availability must be updated reliably.

### 7.2 OLAP data organization

OLAP systems commonly maintain integrated and historical data.

For example:

```text
sales_analytics
---------------
order_id
customer_id
product_id
region
category
order_date
quantity
revenue
campaign_id
```

This data may be derived from multiple operational sources.

It can be organized to make analytical queries easier and more efficient.

### 7.3 Historical analysis

Suppose a customer changes their address.

An operational database may simply update the customer's current address.

An analytical system may need to preserve historical regional information so that old sales reports remain accurate.

This can be handled through historical data modeling techniques.

For example:

```text
Customer 501

2024:
Region = North

2025:
Region = South
```

If a business wants to analyze revenue by the customer's region at the time of purchase, it needs a suitable historical representation.

A common dimensional modeling technique for this is a slowly changing dimension, particularly Type 2. We will cover dimensional modeling in Part 17E.

### 7.4 Comparison

| Property       | OLTP                      | OLAP                                      |
| -------------- | ------------------------- | ----------------------------------------- |
| Data focus     | Current operational state | Historical and integrated data            |
| Data structure | Often normalized          | Often analytical or denormalized          |
| Update pattern | Frequent transactions     | Periodic or continuous ingestion          |
| Data sources   | Application services      | Multiple operational and external sources |
| Main purpose   | Operate the application   | Understand business performance           |

---

## 8. Normalization vs Denormalization

Data modeling also reflects the difference between transactional and analytical workloads.

### 8.1 OLTP: Normalization

OLTP systems commonly use normalization to reduce duplication and maintain consistency.

Example:

**customers**

| customer_id | name |
| ----------- | ---- |
| 1           | Amit |
| 2           | Ravi |

**orders**

| order_id | customer_id | total_amount |
| -------- | ----------- | -----------: |
| 101      | 1           |         1500 |
| 102      | 2           |         2500 |

The customer's information is stored once in the customer table.

Orders reference customers through `customer_id`.

This avoids repeating the same customer information in every order record.

### 8.2 OLAP: Denormalization

Analytical systems may use denormalized structures to reduce the number of joins required for frequent reports.

Example:

| order_id | customer_name | region | product_category | revenue |
| -------- | ------------- | ------ | ---------------- | ------: |
| 101      | Amit          | North  | Electronics      |    1500 |
| 102      | Ravi          | South  | Furniture        |    2500 |

The analytical dataset contains attributes from multiple source tables.

This can make certain analytical queries simpler and faster.

### 8.3 Why denormalization can help

Suppose a dashboard repeatedly calculates revenue by region and category.

With a denormalized analytical table, the query might be:

```sql
SELECT
    region,
    product_category,
    SUM(revenue) AS total_revenue
FROM sales_analytics
GROUP BY
    region,
    product_category;
```

Without the required attributes in one dataset, the query might need several joins.

However, denormalization introduces tradeoffs:

- Data duplication.
- More storage.
- Data synchronization complexity.
- Potential inconsistencies if updates are not managed correctly.

**Important:** OLAP does not require denormalization. Analytical systems can use normalized, denormalized, or dimensional models depending on the workload.

Detailed fact tables, dimension tables, star schemas, and snowflake schemas are covered in Part 17E.

---

## 9. Transaction Processing vs Analytical Processing

The transaction model is another major difference.

### 9.1 OLTP: Transaction-oriented

OLTP systems depend heavily on transactions.

Example: placing an order.

```sql
BEGIN;

INSERT INTO orders (
    order_id,
    customer_id,
    total_amount,
    status
)
VALUES (
    101,
    501,
    2500,
    'pending'
);

UPDATE inventory
SET available_quantity = available_quantity - 1
WHERE product_id = 10
  AND available_quantity >= 1;

COMMIT;
```

This example is simplified. A production transaction should verify that the inventory update affected one row before committing. Otherwise, the application must roll back.

The database must ensure that the operations behave consistently.

Important requirements include:

- Atomicity.
- Consistency.
- Isolation.
- Durability.

### 9.2 OLAP: Analytical processing

OLAP systems focus on reading and analyzing data.

Example:

```sql
SELECT
    product_category,
    SUM(revenue) AS total_revenue
FROM sales_analytics
GROUP BY product_category;
```

The query may process millions of records.

The main concern is efficient analytical execution rather than updating one business transaction.

OLAP systems still have transaction and consistency mechanisms where needed. The difference is the dominant workload and optimization priority, not the absence of database correctness guarantees.

### 9.3 Comparison

| Property             | OLTP                      | OLAP                                                   |
| -------------------- | ------------------------- | ------------------------------------------------------ |
| Main operation       | Business transactions     | Analytical queries                                     |
| Write operations     | Frequent                  | Primarily ingestion and refresh                        |
| Transaction size     | Usually small             | Queries can process large datasets                     |
| Concurrency concern  | Conflicting updates       | Concurrent analytical queries and resource sharing     |
| Correctness focus    | Transactional consistency | Accurate and sufficiently fresh analytical results     |
| Typical latency goal | Very low                  | Depends on query complexity and reporting requirements |

---

## 10. Memory and Caching Architecture

Memory is important in both systems, but the data access patterns differ.

### 10.1 OLTP caching

OLTP systems benefit from keeping frequently accessed pages in memory.

Examples:

- Frequently accessed customer records.
- Product records.
- Index pages.
- Recently accessed order records.

In PostgreSQL, the shared buffer cache holds database pages.

The operating system may also cache file data.

The goal is to avoid repeated disk reads for frequently accessed records.

### 10.2 OLAP caching

OLAP systems can benefit from caching:

- Frequently accessed column data.
- Compressed data blocks.
- Query results.
- Intermediate aggregation results.
- Metadata describing data segments.

A dashboard may repeatedly execute the same revenue query.

Caching or precomputing its result can reduce repeated processing.

### 10.3 Comparison

| OLTP caching                        | OLAP caching                                  |
| ----------------------------------- | --------------------------------------------- |
| Frequently accessed records         | Frequently scanned columns or data segments   |
| Index pages                         | Column metadata and data blocks               |
| Recent transaction data             | Historical analytical data                    |
| Low-latency point access            | Repeated scan and aggregation acceleration    |
| Application-level caching is common | Result caching and pre-aggregation are common |

The exact cache architecture depends on the database.

---

## 11. Write and Read Patterns

The most visible difference between OLTP and OLAP is how data is accessed.

### 11.1 OLTP workload

Example operations:

```sql
INSERT INTO orders (...);
```

```sql
UPDATE inventory
SET available_quantity = available_quantity - 1
WHERE product_id = 10;
```

```sql
SELECT *
FROM orders
WHERE order_id = 101;
```

Characteristics:

- Frequent small writes.
- Frequent point lookups.
- Small result sets.
- Concurrent transactions.
- Updates to existing records.

### 11.2 OLAP workload

Example operations:

```sql
SELECT
    region,
    SUM(revenue)
FROM sales_analytics
GROUP BY region;
```

```sql
SELECT
    product_category,
    COUNT(*) AS total_sales
FROM sales_analytics
GROUP BY product_category;
```

Characteristics:

- Large reads.
- Aggregations.
- Complex joins.
- Historical comparisons.
- Large result sets or summarized results.

### 11.3 Comparison

| Property         | OLTP                              | OLAP                                          |
| ---------------- | --------------------------------- | --------------------------------------------- |
| Read pattern     | Point lookups and small ranges    | Large scans                                   |
| Write pattern    | Frequent individual writes        | Batch or streaming ingestion                  |
| Update pattern   | Frequent row updates              | Often append-oriented or managed bulk changes |
| Delete pattern   | Operational deletes and retention | Often partition-level or lifecycle operations |
| Query complexity | Usually lower                     | Often higher                                  |

Do not assume OLAP systems are append-only. Their ingestion and update mechanisms vary.

---

## 12. Workload Isolation: Why Separate OLTP and OLAP?

This is a critical real-world architecture decision.

Imagine your application has:

- 10,000 customers actively using the platform.
- 50 million historical orders.
- A dashboard that calculates revenue across all historical orders.

A large analytical query can consume substantial resources.

### 12.1 What can go wrong?

Suppose the production PostgreSQL database handles both workloads.

```text
              PRODUCTION DATABASE
                       |
          +------------+------------+
          |                         |
          v                         v
      OLTP QUERIES              OLAP QUERIES
          |                         |
          v                         v
     Order creation             Revenue report
     Payment updates            Large table scan
     Inventory updates          Multiple joins
          |                         |
          +------------+------------+
                       |
                       v
              SHARED RESOURCES
             CPU / RAM / I/O
                       |
                       v
              RESOURCE CONTENTION
```

The analytical workload can compete with operational transactions.

Possible consequences:

- Higher query latency.
- Increased CPU usage.
- Memory pressure.
- More disk I/O.
- Connection pool exhaustion.
- Reduced throughput for application requests.

### 12.2 Solution: Workload separation

One approach is to use a read replica for reporting.

```text
                 APPLICATION
                      |
                      v
               PRIMARY DATABASE
                  PostgreSQL
                      |
             Replication Stream
                      |
                      v
                READ REPLICA
                      |
                      v
              REPORTING QUERIES
```

The primary handles writes and operational reads.

The replica handles selected read workloads.

However, a read replica is not automatically a dedicated OLAP warehouse.

It may still be a row-oriented transactional database, and analytical queries can still consume significant resources on that replica.

There may also be replication lag.

### 12.3 Dedicated analytical system

For larger workloads, the architecture may separate analytical storage and compute.

```text
                 APPLICATION
                      |
                      v
               OLTP DATABASE
                      |
              CDC / DATA PIPELINE
                      |
                      v
              ANALYTICAL STORAGE
                      |
                      v
                OLAP ENGINE
                      |
                      v
              REPORTING SYSTEMS
```

This provides stronger workload isolation.

### 12.4 When should you separate them?

Consider separation when:

- Analytical queries affect application performance.
- The dataset has grown substantially.
- Reports require large historical scans.
- Many analysts or dashboards query simultaneously.
- OLTP and OLAP have different scaling requirements.
- Business reporting requires data integration from multiple systems.

For smaller applications, PostgreSQL may be sufficient for both workloads. Do not introduce a warehouse before there is a real workload or operational reason.

---

## 13. Hybrid OLTP/OLAP Architectures

Modern systems do not always require completely separate databases.

Some architectures attempt to support transactional and analytical workloads within one system.

These are often described as HTAP.

HTAP stands for **Hybrid Transactional/Analytical Processing**.

### 13.1 What is HTAP?

HTAP combines transactional and analytical processing capabilities.

The objective is to support operational transactions and analytical queries with reduced data movement or delay between separate systems.

Example:

A retail platform processes an order and wants to analyze updated sales metrics almost immediately.

A traditional architecture might require:

```text
OLTP Database
      |
      v
Data Pipeline
      |
      v
Data Warehouse
      |
      v
Analytics
```

This introduces data movement and possible freshness delays.

An HTAP architecture attempts to reduce this separation.

### 13.2 Conceptual HTAP architecture

```text
                APPLICATION
                     |
                     v
                HTAP SYSTEM
                     |
          +----------+----------+
          |                     |
          v                     v
    Transactional          Analytical
       Engine                 Engine
          |                     |
          +----------+----------+
                     |
                     v
                SHARED DATA
```

This is conceptual. Actual HTAP implementations vary significantly.

Some use separate row and column storage structures. Others use distributed architectures or specialized execution engines.

### 13.3 Examples of HTAP-oriented systems

Examples include:

- TiDB.
- SingleStore.
- SAP HANA.

Their internal architectures and supported capabilities differ. Do not assume every product implements HTAP in the same way.

### 13.4 HTAP advantages

- Reduced delay between transactions and analytics.
- Less need for separate data pipelines in some architectures.
- Potentially simpler data synchronization.
- Near-real-time analytical visibility.

### 13.5 HTAP tradeoffs

- More complex internal architecture.
- Resource contention may still exist.
- Operational and analytical workloads have different optimization needs.
- Scaling and capacity planning can be difficult.
- Not every analytical query is suitable for execution alongside transactions.

HTAP is not automatically better than a separate OLTP and OLAP architecture.

The right decision depends on latency requirements, workload size, consistency needs, and operational complexity.

---

## 14. Real-World Architecture: E-Commerce Example

Let's design an architecture for a growing e-commerce platform.

### Business requirements

The platform needs to:

1. Process customer orders.
2. Update inventory.
3. Record payments.
4. Track customer activity.
5. Calculate revenue.
6. Generate monthly sales reports.
7. Analyze campaign performance.
8. Provide management dashboards.

### 14.1 OLTP layer

Use a transactional database such as PostgreSQL.

It stores:

- Customers.
- Orders.
- Payments.
- Inventory.
- Order items.

The application uses it for transactional operations.

### 14.2 Data ingestion layer

Data moves from operational sources into analytical storage.

Possible approaches:

- Scheduled ETL jobs.
- ELT pipelines.
- Change Data Capture.
- Event streaming.

For example, a CDC pipeline may capture database changes and send them to an analytical platform.

### 14.3 Analytical layer

Use an analytical database such as ClickHouse, BigQuery, Snowflake, or Redshift, depending on workload and deployment requirements.

It stores analytical datasets for:

- Revenue reporting.
- Product analysis.
- Customer segmentation.
- Campaign analysis.
- Historical trends.

### 14.4 Reporting layer

A BI tool or custom dashboard queries the analytical system.

### Complete architecture

```text
                 CUSTOMERS
                     |
                     v
               E-COMMERCE APP
                     |
                     v
              NODE.JS / EXPRESS
                     |
                     v
               POSTGRESQL
                  OLTP
                     |
          +----------+----------+
          |                     |
          v                     v
     CDC PIPELINE          BATCH ETL
          |                     |
          +----------+----------+
                     |
                     v
             ANALYTICAL STORAGE
                     |
                     v
             COLUMNAR OLAP ENGINE
                     |
          +----------+----------+
          |                     |
          v                     v
      BI DASHBOARD          SQL ANALYSIS
          |                     |
          +----------+----------+
                     |
                     v
               BUSINESS INSIGHTS
```

### 14.5 Why this architecture works

- PostgreSQL handles transactional consistency.
- Data ingestion transfers operational changes.
- Analytical storage supports large scans.
- The OLAP engine processes aggregations.
- Dashboards do not need to run heavy historical queries against the production database.

### 14.6 What about MongoDB and Redis?

In a Node.js backend environment, the same separation principle applies.

For example:

| Technology | Possible responsibility                                   |
| ---------- | --------------------------------------------------------- |
| MongoDB    | Operational document storage                              |
| PostgreSQL | Transactional relational data                             |
| Redis      | Caching, sessions, counters, and selected real-time state |
| ClickHouse | Analytical event and business metrics                     |
| BigQuery   | Large-scale cloud analytics                               |

This is an example of polyglot architecture, not a mandatory stack.

Do not add databases just because they are available. Every additional system introduces operational complexity, data synchronization requirements, monitoring, and maintenance.

---

## 15. Database Examples: How Different Systems Fit

| Database             | Common workload positioning                 | Storage or architecture notes                         |
| -------------------- | ------------------------------------------- | ----------------------------------------------------- |
| PostgreSQL           | OLTP and moderate analytics                 | Row-oriented relational storage                       |
| MySQL/InnoDB         | OLTP                                        | Row-oriented transactional storage engine             |
| Microsoft SQL Server | OLTP and OLAP                               | Supports rowstore and columnstore technologies        |
| Oracle Database      | OLTP and OLAP                               | Supports multiple workload and storage optimizations  |
| Snowflake            | OLAP                                        | Cloud data warehouse architecture                     |
| BigQuery             | OLAP                                        | Distributed analytical query platform                 |
| Amazon Redshift      | OLAP                                        | Column-oriented data warehouse                        |
| ClickHouse           | OLAP                                        | Column-oriented analytical database                   |
| DuckDB               | OLAP                                        | Embedded analytical database                          |
| TiDB                 | Distributed SQL and HTAP-oriented workloads | Distributed transactional and analytical capabilities |

The table describes common positioning, not strict limitations.

For example:

- PostgreSQL can run analytical queries.
- SQL Server supports both rowstore and columnstore.
- Some modern analytical platforms support ingestion and update operations.
- Some transactional databases support analytical extensions or specialized storage.

The workload, scale, and execution requirements matter more than the product label.

---

## 16. OLTP vs OLAP: Complete Architectural Comparison

| Dimension         | OLTP                                    | OLAP                                                            |
| ----------------- | --------------------------------------- | --------------------------------------------------------------- |
| Full form         | Online Transaction Processing           | Online Analytical Processing                                    |
| Main objective    | Operate business applications           | Analyze business data                                           |
| Data organization | Commonly row-oriented                   | Commonly column-oriented                                        |
| Data model        | Often normalized                        | Often denormalized or dimensional                               |
| Data focus        | Current operational data                | Historical and integrated data                                  |
| Query pattern     | Point lookups and small ranges          | Large scans and aggregations                                    |
| Query complexity  | Usually simple                          | Often complex                                                   |
| Write workload    | Frequent small writes                   | Primarily ingestion and refresh                                 |
| Read workload     | Frequent targeted reads                 | Large analytical reads                                          |
| Indexing          | Primary, unique, and composite indexes  | Partitioning, clustering, skipping indexes, and pre-aggregation |
| Execution         | Transaction and record focused          | Scan and batch processing focused                               |
| Memory use        | Frequently accessed pages and indexes   | Data blocks, columns, intermediate results, and query results   |
| Concurrency       | Many concurrent transactions            | Concurrent analytical queries                                   |
| Consistency focus | ACID transaction correctness            | Accurate, sufficiently fresh analytical results                 |
| Optimization      | Transaction latency and throughput      | Scan throughput and query efficiency                            |
| Typical users     | Applications and customers              | Analysts, managers, BI tools                                    |
| Example           | Order placement                         | Revenue analysis                                                |
| Scaling focus     | Transaction throughput and availability | Data volume and analytical query throughput                     |

---

## 17. Choosing the Right Architecture

The wrong approach is to choose a database based only on its popularity.

The correct approach is to understand the workload first.

### Use an OLTP-oriented architecture when:

- The application frequently inserts and updates individual records.
- Transactions must maintain consistent business state.
- Queries are mostly targeted.
- Many users perform concurrent operations.
- Low transactional latency is important.

Examples:

- Banking transactions.
- E-commerce checkout.
- Inventory reservation.
- User account management.
- Payment processing.

### Use an OLAP-oriented architecture when:

- Queries scan large datasets.
- Historical comparisons are required.
- Aggregations dominate the workload.
- Dashboards execute complex queries.
- Data comes from multiple sources.
- Business reporting needs to scale independently of the application.

Examples:

- Revenue analytics.
- Customer retention analysis.
- Campaign performance.
- Product sales trends.
- Fraud trend analysis.

### Use an HTAP-oriented architecture when:

- Transactional data must be analyzed with very low delay.
- One platform can satisfy both workload requirements.
- The system's consistency and performance characteristics meet the business needs.
- The benefits justify architectural complexity.

### Decision table

| Requirement                               | Suitable direction                        |
| ----------------------------------------- | ----------------------------------------- |
| Process orders reliably                   | OLTP                                      |
| Update inventory                          | OLTP                                      |
| Retrieve one customer's order history     | OLTP-style access                         |
| Calculate revenue over five years         | OLAP                                      |
| Analyze millions of events                | OLAP                                      |
| Generate management dashboards            | OLAP                                      |
| Analyze transactions almost immediately   | Consider HTAP or streaming analytics      |
| Small application with moderate reporting | One relational database may be sufficient |

---

## 18. Common Misconceptions

### Misconception 1: OLTP always uses row storage and OLAP always uses column storage.

These are common design choices, not absolute requirements.

Modern database engines can support multiple storage structures.

### Misconception 2: OLAP never uses indexes.

Incorrect.

Analytical systems may use indexes, metadata, partitioning, clustering, and data skipping mechanisms.

The important difference is that large analytical scans are often more efficient than many individual lookups.

### Misconception 3: Denormalization is always better for OLAP.

Incorrect.

Denormalization can reduce joins, but it introduces duplication and synchronization costs.

The right model depends on the analytical queries and data governance requirements.

### Misconception 4: A read replica is the same as a data warehouse.

Incorrect.

A read replica usually maintains a copy of the operational database. A data warehouse typically integrates and organizes data for analytical queries.

### Misconception 5: HTAP eliminates all performance tradeoffs.

Incorrect.

Transactional and analytical workloads still compete for resources unless the system isolates them effectively.

### Misconception 6: Every application needs separate OLTP and OLAP databases.

Incorrect.

Small applications may handle both workloads in one database. Separation becomes useful when scale, performance, data integration, or operational requirements justify it.

---

## 19. Interview Questions

### Beginner level

**Q1. What is the main architectural difference between OLTP and OLAP?**

OLTP is optimized for frequent transactional operations and individual record access. OLAP is optimized for large scans, aggregations, and analytical queries.

**Q2. What is row-oriented storage?**

Row-oriented storage organizes values belonging to the same record together. It is commonly used for transactional workloads.

**Q3. What is column-oriented storage?**

Column-oriented storage organizes values belonging to the same column together. It is commonly used for analytical workloads.

**Q4. Why are columnar databases suitable for OLAP?**

They can read only required columns, compress similar values efficiently, and support vectorized execution.

**Q5. Why are OLTP databases commonly normalized?**

Normalization reduces duplication and helps maintain data consistency during frequent transactions.

### Intermediate level

**Q6. Why are full table scans common in OLAP?**

Analytical queries often need to process a large portion of the dataset. Sequential or columnar scans can be more efficient than many individual index lookups.

**Q7. What is column pruning?**

Column pruning is the process of reading only the columns required by a query.

**Q8. What is vectorized execution?**

Vectorized execution processes batches of values instead of processing individual values one at a time.

**Q9. Why should OLTP and OLAP workloads sometimes be separated?**

Large analytical queries can consume CPU, memory, and disk I/O, potentially degrading transactional performance.

**Q10. Why is a read replica not necessarily a complete OLAP solution?**

A read replica may still use the operational database's storage and query architecture. It can reduce primary-database load but may not provide the performance or analytical modeling of a dedicated warehouse.

### Advanced level

**Q11. What is HTAP?**

Hybrid Transactional/Analytical Processing combines transactional and analytical capabilities in one system or architecture.

**Q12. What are the disadvantages of denormalization?**

Data duplication, increased storage, synchronization complexity, and the possibility of inconsistent values.

**Q13. How does columnar compression improve performance?**

Compression reduces the amount of data stored and transferred from storage into memory. This can reduce I/O and improve analytical throughput.

**Q14. When would you choose a dedicated data warehouse over a read replica?**

When the system needs integrated historical data, large analytical scans, independent scaling, analytical modeling, or stronger workload isolation.

**Q15. Can one database support both OLTP and OLAP?**

Yes. Some relational databases support both workloads, and HTAP systems are designed specifically for hybrid use cases. Whether one database is appropriate depends on workload size, concurrency, latency, and isolation requirements.

---

## 20. Practical Exercise

You are designing an e-commerce platform with:

- 5 million customers.
- 50 million orders.
- 100 million order items.
- 10 million payment records.
- 500 million website events.

The platform must support customer transactions and management analytics.

### Exercise A: Workload classification

Classify each operation as OLTP, OLAP, or potentially both.

1. Create a new customer.
2. Place an order.
3. Update inventory.
4. Retrieve one order using its ID.
5. Calculate monthly revenue.
6. Find the top 10 products by sales.
7. Calculate customer retention over 12 months.
8. Analyze website events by device and location.
9. Generate a daily sales dashboard.
10. Show a customer's current payment status.

### Exercise B: Architecture design

Design a system that includes:

- Node.js backend.
- PostgreSQL operational database.
- Data ingestion pipeline.
- Analytical database.
- Reporting dashboard.

Explain:

1. Which system handles order creation?
2. How does data reach the analytical database?
3. Why should heavy historical reports not necessarily run on the production database?
4. How will you handle delays in analytical data?
5. What happens when a new column is added to an operational table?

### Exercise C: Storage and query execution

Explain:

1. Why row storage is suitable for retrieving one order.
2. Why column storage is suitable for calculating revenue across millions of orders.
3. How compression reduces I/O.
4. Why an index is not always the fastest option for a large analytical query.
5. How parallel aggregation works.

---

## 21. Chapter Summary

| Concept                 | Key takeaway                                             |
| ----------------------- | -------------------------------------------------------- |
| OLTP architecture       | Designed for transactional operations                    |
| OLAP architecture       | Designed for analytical processing                       |
| Row-oriented storage    | Stores fields of a record together                       |
| Column-oriented storage | Stores values of a column together                       |
| Column pruning          | Reads only required columns                              |
| Compression             | Reduces storage and data movement                        |
| Vectorized execution    | Processes batches of values efficiently                  |
| OLTP query execution    | Often locates individual records                         |
| OLAP query execution    | Often scans and aggregates large datasets                |
| OLTP indexing           | Commonly supports point lookups and small ranges         |
| OLAP optimization       | Often uses partitioning, clustering, and pre-aggregation |
| Normalization           | Commonly used in transactional data models               |
| Denormalization         | Can simplify repeated analytical queries                 |
| Workload isolation      | Prevents analytical workloads from harming transactions  |
| Read replica            | Can offload reads but is not automatically a warehouse   |
| HTAP                    | Combines transactional and analytical capabilities       |

### Final mental model

```text
                  OLTP
                   |
           Transaction Processing
                   |
                   v
          Row-Oriented Storage
                   |
                   v
         Individual Record Access
                   |
                   v
        Fast Transaction Execution


                  OLAP
                   |
           Analytical Processing
                   |
                   v
         Column-Oriented Storage
                   |
                   v
          Large Data Scanning
                   |
                   v
          Aggregation & Analysis
                   |
                   v
          Reports & Dashboards
```

**The central principle:**

OLTP optimizes how efficiently a database can process individual business transactions. OLAP optimizes how efficiently a database can analyze large amounts of business data.

Neither is universally better. They solve different problems.
