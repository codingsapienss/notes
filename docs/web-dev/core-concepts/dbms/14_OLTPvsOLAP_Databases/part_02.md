---
sidebar_label: OLAP (Online Analytical Processing)
sidebar_position: 1
---

# OLAP (Online Analytical Processing)

## 1. Introduction: Why OLTP Is Not Ideal for Large Analytical Queries

In last section, we studied OLTP databases, which handle day-to-day business transactions.

Consider an e-commerce application:

- A customer places an order.
- The payment is processed.
- Inventory is reduced.
- The order status is updated.
- A confirmation is generated.

These operations are transactional. They usually involve a small number of records and need to complete quickly.

Now consider a different set of questions:

- How much revenue did the company generate in the last 12 months?
- Which product category generated the highest revenue?
- Which region has the highest customer retention?
- How many customers purchased more than three times?
- How has the average order value changed over the last two years?

These questions require reading and analyzing large amounts of data.

A database designed primarily for individual transactions may not be the best place to execute these analytical queries.

### The fundamental difference

| OLTP requirement                             | OLAP requirement                                          |
| -------------------------------------------- | --------------------------------------------------------- |
| Process individual transactions              | Analyze large amounts of data                             |
| Insert or update individual records          | Read and aggregate many records                           |
| Fast point queries                           | Complex analytical queries                                |
| Current operational data                     | Historical and integrated data                            |
| High transaction concurrency                 | Analytical query concurrency                              |
| Millisecond-level response is often expected | Sub-second to minutes, depending on complexity and system |

**Key idea:** OLTP helps an application operate. OLAP helps a business understand how it is operating.

---

## 2. What Is OLAP?

OLAP stands for **Online Analytical Processing**.

It is a database processing approach designed to analyze large volumes of data and support business intelligence, reporting, dashboards, and decision-making.

OLAP systems are optimized for queries that:

- Read large amounts of data.
- Perform aggregations.
- Group records by different attributes.
- Compare historical performance.
- Identify trends and patterns.
- Combine information from multiple business areas.

### Example

Suppose an e-commerce company has 50 million order records.

An OLTP operation might retrieve one customer's order:

```sql
SELECT *
FROM orders
WHERE order_id = 10501;
```

An OLAP operation might calculate monthly revenue across all regions:

```sql
SELECT
    DATE_TRUNC('month', order_date) AS month,
    region,
    SUM(total_amount) AS revenue
FROM orders
WHERE order_status = 'completed'
GROUP BY
    DATE_TRUNC('month', order_date),
    region
ORDER BY month, region;
```

The first query retrieves a specific transaction.

The second query may examine millions of records and calculate aggregated results.

### Important distinction

OLAP is not a specific database product.

It is a workload and processing approach.

Examples of systems used for analytical workloads include:

- Snowflake
- Google BigQuery
- Amazon Redshift
- ClickHouse
- DuckDB

PostgreSQL can also execute analytical queries, especially for moderate workloads. A database does not automatically become an OLAP system simply because it executes a `GROUP BY` query.

---

## 3. Characteristics of OLAP Workloads

OLAP workloads have different characteristics from OLTP workloads.

### 3.1 Read-heavy workloads

OLAP workloads are generally read-heavy.

They frequently execute:

- SELECT queries
- Aggregations
- Joins
- Grouping operations
- Filtering
- Sorting
- Window functions

There are still writes in OLAP systems. Data must be loaded, refreshed, updated, or ingested from operational sources.

However, analytical queries usually dominate the workload.

### 3.2 Complex queries

OLAP queries can involve multiple tables, large datasets, and complex calculations.

Example:

```sql
SELECT
    region,
    product_category,
    COUNT(DISTINCT customer_id) AS unique_customers,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS average_order_value
FROM sales
WHERE order_date >= DATE '2026-01-01'
GROUP BY
    region,
    product_category
ORDER BY total_revenue DESC;
```

This query calculates several business metrics grouped by region and product category.

### 3.3 Large data scans

OLAP queries frequently scan large portions of datasets.

For example:

```sql
SELECT SUM(total_amount)
FROM orders
WHERE order_date >= DATE '2024-01-01';
```

If the query covers several years of orders, the database may need to examine a large number of records.

This is not necessarily a problem.

A full table scan is not automatically bad. For analytical queries that need a substantial fraction of a table, scanning the data can be more efficient than performing thousands or millions of individual index lookups.

### 3.4 Historical data analysis

OLAP systems often work with historical data.

Businesses need to compare performance over time.

Examples:

- Revenue in 2024 versus 2025.
- Monthly customer acquisition.
- Product sales trends.
- Customer retention over six months.
- Year-over-year business growth.

Historical analysis is one of the major reasons businesses maintain analytical data warehouses.

### 3.5 Different response-time expectations

An OLTP query retrieving one order may need to complete in a few milliseconds.

An OLAP query calculating revenue across several years may take seconds or longer.

However, do not assume every OLAP query is slow.

Modern analytical engines can execute many queries in milliseconds or sub-seconds, especially when data is partitioned, compressed, cached, or pre-aggregated.

The actual response time depends on:

- Dataset size.
- Query complexity.
- Storage architecture.
- Available compute resources.
- Data layout.
- Concurrency.
- Whether the results are already cached or precomputed.

---

## 4. Analytical Queries and Business Metrics

The main purpose of OLAP is to extract useful information from stored data.

Let's use an e-commerce database.

Assume the following table:

### orders

| order_id | customer_id | region | order_date | total_amount | status    |
| -------- | ----------- | ------ | ---------- | -----------: | --------- |
| 101      | 1           | North  | 2026-01-10 |         1500 | completed |
| 102      | 2           | South  | 2026-01-11 |         2500 | completed |
| 103      | 1           | North  | 2026-02-05 |         3000 | completed |
| 104      | 3           | East   | 2026-02-15 |         1000 | cancelled |
| 105      | 4           | West   | 2026-03-01 |         4000 | completed |

An analytical system can answer several business questions.

### 4.1 Total revenue

```sql
SELECT
    SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'completed';
```

This calculates the total revenue from completed orders.

### 4.2 Revenue by region

```sql
SELECT
    region,
    SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY region
ORDER BY revenue DESC;
```

This helps identify which regions generate the most revenue.

### 4.3 Revenue by month

```sql
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) AS monthly_revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

This produces a monthly revenue report.

### 4.4 Top-selling products

Assume a separate `order_items` table:

| order_id | product_id | quantity | unit_price |
| -------- | ---------- | -------: | ---------: |
| 101      | 10         |        2 |        500 |
| 101      | 11         |        1 |        500 |
| 102      | 10         |        3 |        500 |
| 103      | 12         |        2 |       1500 |

Query:

```sql
SELECT
    product_id,
    SUM(quantity) AS total_units_sold,
    SUM(quantity * unit_price) AS total_revenue
FROM order_items
GROUP BY product_id
ORDER BY total_revenue DESC
LIMIT 10;
```

This identifies the top 10 products by revenue.

### 4.5 Average Order Value (AOV)

AOV is the average revenue generated per eligible order.

```text
AOV = Total eligible order revenue / Number of eligible orders
```

SQL:

```sql
SELECT
    SUM(total_amount) / NULLIF(COUNT(*), 0) AS average_order_value
FROM orders
WHERE status = 'completed';
```

The business must define how refunds, cancellations, discounts, and taxes are treated. The query must follow that definition.

### 4.6 Year-over-year growth

Businesses often compare revenue with the same period in the previous year.

For example:

- Revenue in January 2025.
- Revenue in January 2026.
- Percentage change between the two.

This is useful for understanding business growth beyond simple month-to-month changes.

---

## 5. Aggregations and Large Data Scans

Aggregations are among the most important operations in OLAP.

An aggregation combines values from multiple records to produce a summarized result.

### 5.1 Common aggregation functions

| Function  | Purpose           | Example              |
| --------- | ----------------- | -------------------- |
| `COUNT()` | Count records     | Number of orders     |
| `SUM()`   | Calculate total   | Total revenue        |
| `AVG()`   | Calculate average | Average order value  |
| `MIN()`   | Find minimum      | Lowest order amount  |
| `MAX()`   | Find maximum      | Highest order amount |

Example:

```sql
SELECT
    COUNT(*) AS total_orders,
    SUM(total_amount) AS revenue,
    AVG(total_amount) AS average_order_value,
    MIN(total_amount) AS minimum_order,
    MAX(total_amount) AS maximum_order
FROM orders
WHERE status = 'completed';
```

### 5.2 GROUP BY

`GROUP BY` divides records into groups and calculates aggregate values for each group.

```sql
SELECT
    region,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY region;
```

Conceptually:

```text
All completed orders
        |
        v
Group by region
        |
        +---- North
        |
        +---- South
        |
        +---- East
        |
        +---- West
        |
        v
Calculate count and revenue for each group
        |
        v
Return summarized results
```

### 5.3 Why large scans happen

Suppose a company stores 100 million orders.

It wants to calculate revenue for each product category over the last three years.

The database may need to:

1. Read relevant order records.
2. Read associated order-item records.
3. Filter records by date and status.
4. Join the required datasets.
5. Group records by category.
6. Calculate revenue.
7. Sort the aggregated results.
8. Return the final report.

This is fundamentally different from retrieving one order using its primary key.

### 5.4 Parallel processing

Analytical databases often divide work across multiple CPU cores or compute workers.

Conceptual execution:

```text
             100 Million Records
                     |
          Divide into data partitions
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Worker 1   Worker 2   Worker 3
       30M rows   35M rows   35M rows
          |          |          |
          v          v          v
       Partial    Partial    Partial
       Revenue    Revenue    Revenue
          |          |          |
          +----------+----------+
                     |
                     v
              Combine Results
                     |
                     v
              Final Revenue
```

Each worker processes a portion of the data. The system combines partial results into a final result.

This is one reason analytical databases can process very large datasets efficiently.

---

## 6. Row-Oriented Storage vs Column-Oriented Storage

This is one of the most important concepts in OLAP.

To understand why analytical databases often use columnar storage, first understand how data can be physically organized.

### 6.1 Row-oriented storage

In a row-oriented database, values belonging to the same record are stored together.

Consider this table:

| order_id | customer_id | region | amount |
| -------- | ----------- | ------ | -----: |
| 101      | 1           | North  |   1500 |
| 102      | 2           | South  |   2500 |
| 103      | 3           | East   |   3000 |

Conceptually, row-oriented storage looks like:

```text
Row 1: 101, 1, North, 1500
Row 2: 102, 2, South, 2500
Row 3: 103, 3, East, 3000
```

When the database retrieves one order, it can access the values belonging to that record together.

This is useful for OLTP operations.

For example:

```sql
SELECT *
FROM orders
WHERE order_id = 101;
```

The database needs the complete record or several of its fields.

### 6.2 Column-oriented storage

In a column-oriented database, values belonging to the same column are stored together.

The same table can conceptually be organized as:

```text
order_id:     101, 102, 103
customer_id:  1, 2, 3
region:       North, South, East
amount:       1500, 2500, 3000
```

Instead of storing all fields of one row together, the system stores values of individual columns together.

### 6.3 Why columnar storage is useful for OLAP

Consider this query:

```sql
SELECT
    SUM(amount)
FROM orders;
```

The query only needs the `amount` column.

In a row-oriented layout, the database may read pages containing other fields alongside the amount values.

In a column-oriented layout, the engine can read the relevant column data without reading unrelated columns.

This provides several advantages.

**1. Column pruning**

The engine reads only the columns required by the query.

**2. Better compression**

Values within the same column often have similar types and patterns.

For example:

```text
status:
completed
completed
completed
cancelled
completed
completed
```

Repeated or similar values can be compressed efficiently.

**3. Vectorized execution**

Instead of processing one value at a time, analytical engines can process batches of values using CPU-efficient operations.

Conceptually:

```text
Read batch of amount values
             |
             v
       Process values
             |
             v
      Calculate partial sum
             |
             v
       Process next batch
```

**4. Improved analytical throughput**

Reading fewer bytes and processing batches efficiently can significantly improve aggregation performance.

### 6.4 Row store vs column store

| Feature               | Row-oriented storage      | Column-oriented storage               |
| --------------------- | ------------------------- | ------------------------------------- |
| Physical organization | Values grouped by row     | Values grouped by column              |
| Best suited for       | Transactional workloads   | Analytical workloads                  |
| Point lookup          | Usually efficient         | Depends on engine and access pattern  |
| Single-row updates    | Usually efficient         | Can be more expensive                 |
| Large aggregations    | Can be less efficient     | Often highly efficient                |
| Reading a few columns | May read unrelated fields | Reads selected columns                |
| Compression           | Depends on engine         | Often benefits from column similarity |

### 6.5 Why column stores are not always ideal for OLTP

Imagine updating one order:

```sql
UPDATE orders
SET status = 'shipped'
WHERE order_id = 101;
```

A row-oriented database is naturally suited to accessing and modifying one complete record.

A columnar system may need to manage changes across column-oriented structures. Many analytical engines handle this using techniques such as immutable data parts, delta storage, or background merges.

The exact implementation depends on the database.

Columnar storage does not mean updates are impossible. It means the storage organization is generally optimized for analytical scans rather than frequent individual row modifications.

**Important:** Not every OLAP system uses columnar storage, and not every columnar database is exclusively an OLAP system.

---

## 7. What Is a Data Warehouse?

A **data warehouse** is a centralized system that stores integrated data from multiple sources for reporting, analytics, and business intelligence.

Consider an e-commerce company.

Its operational systems may contain:

- Customer records.
- Orders.
- Payments.
- Product catalog.
- Inventory.
- Website events.
- Marketing campaign data.

Each system stores data for its own operational purpose.

The business may want a unified view of all these datasets.

A data warehouse brings relevant data together so analysts and reporting systems can query it consistently.

### 7.1 Example

```text
       E-Commerce Application
                 |
       +---------+---------+
       |         |         |
       v         v         v
     Orders   Payments   Customers
       |         |         |
       +---------+---------+
                 |
                 v
          Data Integration
                 |
                 v
            Data Warehouse
                 |
       +---------+---------+
       |         |         |
       v         v         v
    Reports  Dashboards  Analytics
```

The warehouse is designed for analytical access, not primarily for processing customer checkout transactions.

### 7.2 Classic characteristics of a data warehouse

The traditional data warehouse definition is often described using four characteristics.

| Characteristic   | Meaning                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Subject-oriented | Organized around business subjects such as sales, customers, or products                              |
| Integrated       | Combines data from different sources using consistent definitions and formats                         |
| Time-variant     | Maintains historical information so changes can be analyzed over time                                 |
| Nonvolatile      | Data is primarily loaded and queried rather than constantly modified through operational transactions |

These are classical data warehouse characteristics, not rigid requirements that every modern warehouse must follow identically.

### 7.3 Data warehouse vs OLAP

These terms are related, but they are not interchangeable.

| OLAP                                   | Data warehouse                                       |
| -------------------------------------- | ---------------------------------------------------- |
| Analytical processing approach         | Analytical data repository/system                    |
| Describes the workload and query style | Describes where integrated analytical data is stored |
| Performs analysis and aggregations     | Stores data used for analysis                        |
| Can operate on different data sources  | Commonly serves as a major source for OLAP queries   |

Think of it this way:

- The data warehouse stores and organizes analytical data.
- OLAP queries analyze that data.

A warehouse may support OLAP workloads, but OLAP is not itself a warehouse.

---

## 8. OLAP Architecture

Let's understand how OLAP fits into a real application architecture.

An e-commerce company might have the following architecture:

```text
                OPERATIONAL SYSTEMS
       +-------------+-------------+
       |             |             |
       v             v             v
     Orders        Payments      Customers
       |             |             |
       +-------------+-------------+
                     |
                     v
              DATA INGESTION
                     |
              ETL / ELT Pipeline
                     |
                     v
               DATA STORAGE
                     |
          +----------+----------+
          |                     |
          v                     v
      Data Lake            Data Warehouse
          |                     |
          +----------+----------+
                     |
                     v
              OLAP ENGINE
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Reports   Dashboards  Analytics
```

### 8.1 Operational data sources

These are the systems that generate business data.

Examples:

- PostgreSQL order database.
- MongoDB customer database.
- Payment service.
- Inventory service.
- Website event tracking.
- Marketing platform.

### 8.2 Data ingestion

Data must move from operational systems into analytical storage.

Common methods include:

- Scheduled batch extraction.
- Change Data Capture (CDC).
- Streaming event ingestion.
- Application-generated events.
- Periodic exports.

ETL and ELT are important approaches here. They will be covered in detail in Part 17E.

### 8.3 Data storage

The integrated data may be stored in:

- A data warehouse.
- A data lake.
- A lakehouse architecture.
- Analytical data marts.

These are related but distinct storage and architecture concepts.

### 8.4 OLAP engine

The analytical query engine executes queries against stored data.

It may perform:

- Filtering.
- Aggregation.
- Joins.
- Sorting.
- Parallel processing.
- Distributed query execution.

### 8.5 Reporting and dashboards

Business users interact with the analytical system through:

- BI dashboards.
- Scheduled reports.
- Business intelligence tools.
- SQL clients.
- Custom analytics applications.

Examples of questions:

- What was yesterday's revenue?
- Which products are performing poorly?
- Which marketing campaign generated the most conversions?
- How many customers returned after their first purchase?

---

## 9. Multidimensional Analysis: Dimensions and Measures

OLAP commonly supports multidimensional analysis.

Businesses rarely want only one total number. They want to examine that number from different perspectives.

For example, revenue can be analyzed by:

- Month.
- Region.
- Product category.
- Customer segment.
- Sales channel.

These attributes are called **dimensions**.

The numerical values being analyzed are called **measures**.

### 9.1 Dimensions

Dimensions describe the context of a business event.

Examples:

| Dimension | Example attributes                |
| --------- | --------------------------------- |
| Time      | Date, month, quarter, year        |
| Region    | Country, state, city              |
| Product   | Product name, category, brand     |
| Customer  | Customer type, age group, segment |
| Channel   | Website, mobile app, retail       |

### 9.2 Measures

Measures represent values that can be analyzed or aggregated.

Examples:

- Revenue.
- Quantity sold.
- Number of orders.
- Discount amount.
- Profit.
- Shipping cost.

Example:

```text
Revenue = 500,000
Dimension: Month = January
Dimension: Region = North
Dimension: Category = Electronics
```

This tells us that the company generated 500,000 in revenue from Electronics in the North region during January.

### 9.3 OLAP operations

There are several common operations used in multidimensional analysis.

#### A. Slice

Slice selects one value from a dimension.

Example:

Show revenue only for 2026.

```text
All sales data
      |
      v
Filter Year = 2026
      |
      v
Sales data for 2026
```

#### B. Dice

Dice selects a subset using multiple dimension conditions.

Example:

- Year = 2026.
- Region = North or South.
- Category = Electronics or Furniture.

This creates a smaller analytical subset.

#### C. Drill-down

Drill-down moves from summarized data to more detailed data.

Example:

```text
Yearly Revenue
      |
      v
Quarterly Revenue
      |
      v
Monthly Revenue
      |
      v
Daily Revenue
```

You move from a high-level view to a more detailed view.

#### D. Roll-up

Roll-up moves from detailed data to summarized data.

Example:

```text
Daily Revenue
      |
      v
Monthly Revenue
      |
      v
Quarterly Revenue
      |
      v
Yearly Revenue
```

It is the reverse direction of drill-down.

#### E. Pivot

Pivot changes the orientation of a multidimensional report.

For example, a report may initially show:

| Region | January | February |
| ------ | ------: | -------: |
| North  | 100,000 |  120,000 |
| South  |  80,000 |   95,000 |

After pivoting, the report might display regions as columns and months as rows.

Pivoting changes how the same data is presented. It does not necessarily change the underlying data.

---

## 10. Practical OLAP SQL Examples

Let's use PostgreSQL syntax to understand analytical queries.

Assume these tables:

```sql
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY,
    customer_name VARCHAR(100),
    region VARCHAR(50)
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT,
    order_date TIMESTAMP,
    total_amount NUMERIC(12, 2),
    order_status VARCHAR(30)
);

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50)
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    quantity INTEGER,
    unit_price NUMERIC(12, 2)
);
```

### 10.1 Monthly revenue by region

```sql
SELECT
    DATE_TRUNC('month', o.order_date) AS month,
    c.region,
    SUM(o.total_amount) AS revenue
FROM orders o
JOIN customers c
    ON c.customer_id = o.customer_id
WHERE
    o.order_status = 'completed'
GROUP BY
    DATE_TRUNC('month', o.order_date),
    c.region
ORDER BY
    month,
    revenue DESC;
```

**What happens?**

1. The database reads eligible orders.
2. It joins customers to obtain their regions.
3. It groups records by month and region.
4. It calculates total revenue for each group.
5. It sorts the results.

### 10.2 Top 10 products by revenue

```sql
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p
    ON p.product_id = oi.product_id
JOIN orders o
    ON o.order_id = oi.order_id
WHERE
    o.order_status = 'completed'
GROUP BY
    p.product_id,
    p.product_name
ORDER BY revenue DESC
LIMIT 10;
```

This query joins multiple tables and calculates revenue for every product.

It can become expensive when the order-item dataset contains millions of rows.

### 10.3 Average order value by month

```sql
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) /
        NULLIF(COUNT(*), 0) AS average_order_value
FROM orders
WHERE order_status = 'completed'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

`NULLIF` prevents division by zero.

The definition of eligible orders must match the company's financial reporting rules.

### 10.4 Month-over-month revenue growth

Window functions are particularly useful in analytical queries.

```sql
WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        SUM(total_amount) AS revenue
    FROM orders
    WHERE order_status = 'completed'
    GROUP BY DATE_TRUNC('month', order_date)
),
revenue_comparison AS (
    SELECT
        month,
        revenue,
        LAG(revenue) OVER (
            ORDER BY month
        ) AS previous_month_revenue
    FROM monthly_revenue
)
SELECT
    month,
    revenue,
    previous_month_revenue,
    ROUND(
        (
            (revenue - previous_month_revenue)
            / NULLIF(previous_month_revenue, 0)
        ) * 100,
        2
    ) AS growth_percentage
FROM revenue_comparison
ORDER BY month;
```

**Understanding `LAG()`:**

`LAG()` retrieves a value from a previous row in the ordered result.

For example:

| Month    | Revenue | Previous month revenue |
| -------- | ------: | ---------------------: |
| January  | 100,000 |                   NULL |
| February | 120,000 |                100,000 |
| March    | 150,000 |                120,000 |

The growth formula is:

```text
Growth % = ((Current Revenue - Previous Revenue)
            / Previous Revenue) × 100
```

For production reporting, consider whether months with zero orders must appear. A calendar table or generated date series may be needed to produce continuous monthly results.

---

## 11. Real-World Example: OLTP and OLAP in an E-Commerce Company

Imagine an e-commerce company processing 500,000 orders every month.

### 11.1 OLTP responsibilities

The operational database handles:

- Customer registration.
- Order creation.
- Payment processing records.
- Inventory updates.
- Refunds.
- Order status changes.

Example:

```sql
INSERT INTO orders (
    order_id,
    customer_id,
    order_date,
    total_amount,
    order_status
)
VALUES (
    10001,
    501,
    NOW(),
    2500,
    'pending'
);
```

This is an operational transaction.

The application needs the operation to be reliable and fast.

### 11.2 OLAP responsibilities

The analytical system handles questions such as:

- What is total revenue this year?
- Which region has the highest sales?
- Which products have declining sales?
- How many customers made repeat purchases?
- What percentage of customers purchased again within 30 days?
- Which marketing campaign has the highest conversion rate?

These questions may require analyzing millions of records.

### 11.3 Why separate the workloads?

Imagine executing a report that scans 100 million orders directly against the production database.

That query may consume:

- CPU.
- Memory.
- Disk I/O.
- Database connections.
- Cache capacity.

At the same time, customers are trying to place orders.

The analytical workload may interfere with operational traffic.

Separating OLTP and OLAP workloads helps protect the performance and availability of the application.

### 11.4 Typical architecture

```text
             CUSTOMERS
                 |
                 v
           E-COMMERCE APP
                 |
                 v
           OLTP DATABASE
            PostgreSQL
                 |
          CDC / ETL / ELT
                 |
                 v
          DATA WAREHOUSE
                 |
                 v
            OLAP ENGINE
                 |
          +------+------+
          |             |
          v             v
       Dashboard     Reports
          |             |
          +------+------+
                 |
                 v
          BUSINESS DECISIONS
```

The operational database handles transactions. The warehouse supports analytical workloads.

The analytical data may be slightly delayed depending on the ingestion architecture.

For example, a dashboard might show data that is five minutes behind the operational system.

That tradeoff can be acceptable for many business reports, but not for every use case.

---

## 12. OLAP Technologies and Examples

Different databases and analytical engines are designed for different workloads.

### 12.1 Snowflake

**Snowflake** is a cloud-based data platform commonly used for data warehousing and analytics.

Typical uses:

- Enterprise reporting.
- Large-scale analytical queries.
- Data integration.
- Business intelligence.

### 12.2 Google BigQuery

**BigQuery** is Google's serverless data warehouse platform.

Typical uses:

- Large-scale SQL analytics.
- Event analysis.
- Business reporting.
- Data warehouse workloads.

### 12.3 Amazon Redshift

**Amazon Redshift** is a managed analytical data warehouse service.

Typical uses:

- Enterprise analytics.
- Reporting.
- Large-scale aggregation.
- Business intelligence.

### 12.4 ClickHouse

**ClickHouse** is a column-oriented analytical database.

Typical uses:

- Event analytics.
- Product analytics.
- Observability.
- Real-time dashboards.
- High-volume analytical queries.

### 12.5 DuckDB

**DuckDB** is an analytical database designed to run efficiently within an application or local environment.

Typical uses:

- Local data analysis.
- CSV and Parquet analytics.
- Data science workflows.
- Embedded analytical workloads.

It is not the same deployment model as a managed cloud data warehouse.

### 12.6 Apache Druid and Apache Pinot

These systems are designed for analytical workloads that often require low-latency queries over continuously ingested event data.

Typical uses:

- Real-time dashboards.
- User activity analytics.
- Application metrics.
- High-volume event exploration.

### Technology comparison

| Technology      | Common positioning                  |
| --------------- | ----------------------------------- |
| Snowflake       | Cloud data warehouse                |
| BigQuery        | Serverless cloud data warehouse     |
| Amazon Redshift | Cloud data warehouse                |
| ClickHouse      | Column-oriented analytical database |
| DuckDB          | Embedded analytical database        |
| Apache Druid    | Real-time analytical database       |
| Apache Pinot    | Real-time distributed OLAP database |

Do not assume these systems have identical architectures, deployment models, consistency guarantees, or query capabilities.

### Can PostgreSQL be used for OLAP?

Yes.

PostgreSQL supports:

- Aggregations.
- Joins.
- Window functions.
- Parallel query execution.
- Partitioned tables.
- Materialized views.
- Indexes.

It can handle many analytical workloads.

However, as data volume and analytical concurrency grow, a dedicated analytical system may offer better performance and workload isolation.

---

## 13. OLAP Performance Optimization

OLAP systems process large amounts of data, so their optimization priorities differ from traditional OLTP systems.

### 13.1 Scan throughput

How much data can the system read and process per second?

Analytical systems often optimize for high scan throughput.

### 13.2 Query latency

How long does an analytical query take?

A dashboard query may need to finish quickly even when processing a large dataset.

### 13.3 Bytes scanned

How much data did the query read?

Reading unnecessary columns or partitions increases resource consumption.

### 13.4 Data freshness

How recently was the analytical data updated?

For example:

- Daily refresh.
- Hourly refresh.
- Every five minutes.
- Near-real-time streaming ingestion.

### 13.5 Query concurrency

How many analytical queries can the system execute simultaneously?

A dashboard used by 500 employees may generate substantial concurrent query traffic.

### Common optimization techniques

| Technique          | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| Partition pruning  | Avoid reading irrelevant data partitions              |
| Column pruning     | Read only required columns                            |
| Compression        | Reduce storage and I/O                                |
| Parallel execution | Divide work across CPU cores or workers               |
| Clustering/sorting | Organize data to improve filtering and locality       |
| Materialized views | Store precomputed query results                       |
| Pre-aggregation    | Store summarized data for repeated analytical queries |
| Query optimization | Improve execution plans and reduce unnecessary work   |

### Example: Partition pruning

Suppose an orders table is partitioned by month.

```text
orders
  |
  +--- orders_2026_01
  +--- orders_2026_02
  +--- orders_2026_03
  +--- orders_2026_04
  +--- orders_2026_05
```

Query:

```sql
SELECT SUM(total_amount)
FROM orders
WHERE order_date >= DATE '2026-03-01'
  AND order_date < DATE '2026-04-01';
```

If the partitioning and query predicates align, the database can read only the March partition rather than scanning every partition.

Partition pruning reduces unnecessary I/O.

### Example: Materialized views

Suppose a dashboard repeatedly calculates monthly revenue.

Instead of calculating the same aggregation every time, a materialized view can store the result.

```sql
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) AS revenue
FROM orders
WHERE order_status = 'completed'
GROUP BY DATE_TRUNC('month', order_date);
```

Query:

```sql
SELECT *
FROM monthly_revenue
ORDER BY month;
```

In PostgreSQL, a materialized view stores query results and must be refreshed to reflect newer data.

```sql
REFRESH MATERIALIZED VIEW monthly_revenue;
```

This trades freshness and refresh work for faster repeated reads.

---

## 14. OLAP, Reporting, and Business Intelligence

These concepts are related but have different meanings.

### OLAP

The analytical processing approach used to query and analyze data.

### Reporting

The process of presenting business information in a structured format.

Examples:

- Daily sales report.
- Monthly revenue report.
- Inventory report.
- Customer acquisition report.

### Business Intelligence (BI)

The broader set of tools and processes used to analyze business data and communicate insights.

BI tools commonly provide:

- Dashboards.
- Charts.
- Reports.
- Filters.
- Drill-down functionality.
- Business metrics.

### Example

A sales dashboard might show:

```text
+---------------------------------------+
|             SALES DASHBOARD           |
+---------------------------------------+
| Total Revenue       | ₹50,00,000      |
| Total Orders        | 12,500          |
| Average Order Value | ₹400            |
| Active Customers    | 8,200           |
+---------------------------------------+
|                                       |
|       Monthly Revenue Chart           |
|                                       |
+---------------------------------------+
|                                       |
|       Revenue by Region               |
|                                       |
+---------------------------------------+
```

The dashboard is the presentation layer.

The OLAP engine executes analytical queries.

The data warehouse provides the analytical data.

---

## 15. OLAP Limitations and Tradeoffs

OLAP is powerful, but it is not a replacement for OLTP.

### 15.1 Data freshness

Analytical data may not be updated immediately after an operational transaction.

For example:

```text
Customer places order
        |
        v
OLTP database updated
        |
        v
Data ingestion pipeline
        |
        v
Warehouse updated
        |
        v
Dashboard reflects new order
```

There can be a delay between the transaction and its appearance in reports.

### 15.2 Data pipeline complexity

A data warehouse often receives data from multiple systems.

Maintaining these pipelines introduces complexity:

- Schema changes.
- Duplicate events.
- Missing records.
- Late-arriving data.
- Data validation.
- Failed ingestion jobs.
- Reprocessing.

### 15.3 Storage and compute costs

Large datasets require storage.

Complex analytical queries require compute resources.

Some cloud warehouse platforms also charge based on data scanned, compute usage, or other resource metrics.

Poorly designed queries can become expensive.

### 15.4 Data quality and consistency

Different operational systems may use different definitions.

For example:

- One system considers an order successful after payment authorization.
- Another considers it successful only after fulfillment.
- A reporting system might exclude refunded orders.

Without consistent definitions, dashboards can produce conflicting results.

### 15.5 Not ideal for transactional application operations

An analytical warehouse should not automatically become the primary database for operations such as:

- Customer checkout.
- Inventory reservation.
- Payment state transitions.
- Order creation.

Those operations generally require transactional guarantees and efficient individual-record access.

---

## 16. OLTP vs OLAP — Quick Comparison

| Feature            | OLTP                               | OLAP                                           |
| ------------------ | ---------------------------------- | ---------------------------------------------- |
| Full form          | Online Transaction Processing      | Online Analytical Processing                   |
| Primary purpose    | Run business operations            | Analyze business data                          |
| Workload           | Transactional                      | Analytical                                     |
| Queries            | Simple and frequent                | Complex and often data-intensive               |
| Data access        | Individual records or small ranges | Large datasets and aggregations                |
| Operations         | INSERT, UPDATE, DELETE, SELECT     | Mostly SELECT and aggregation, plus ingestion  |
| Data focus         | Current operational state          | Historical and integrated data                 |
| Storage preference | Commonly row-oriented              | Commonly column-oriented                       |
| Transactions       | Central to the workload            | May exist, but not the primary workload focus  |
| Users              | Applications and customers         | Analysts, managers, BI tools                   |
| Performance focus  | Transaction latency and throughput | Scan throughput, query latency and concurrency |
| Examples           | Order processing, payment updates  | Revenue analysis, trends, reporting            |

**Remember:** OLTP and OLAP describe workload patterns, not necessarily two mutually exclusive database product categories. Some modern database systems support both types of workloads, although workload isolation may still be important.

---

## 17. Common OLAP Mistakes and Misconceptions

### Misconception 1: OLAP is a database product

Incorrect.

OLAP is an analytical processing approach. Snowflake, BigQuery, and ClickHouse are examples of systems used for analytical workloads.

### Misconception 2: OLAP and data warehouse mean the same thing

Incorrect.

A data warehouse stores integrated analytical data. OLAP describes how that data is queried and analyzed.

### Misconception 3: OLAP databases are always slow

Incorrect.

Modern analytical systems can execute many queries in milliseconds or sub-seconds.

Query performance depends on the workload and architecture.

### Misconception 4: Full table scans are always bad

Incorrect.

A query that needs to aggregate most of a table may be more efficient with a sequential or columnar scan than with many index lookups.

### Misconception 5: Every OLAP database uses columnar storage

Incorrect.

Columnar storage is common because it is useful for analytical scans, but it is not a universal requirement.

### Misconception 6: OLAP systems never perform writes

Incorrect.

They ingest, refresh, update, and process data. Their primary workload is generally analytical rather than transactional.

### Misconception 7: We should run every analytical report on production OLTP

Incorrect.

Heavy analytical queries can compete with operational traffic for CPU, memory, I/O, and connections. Separate analytical infrastructure or carefully isolated replicas may be more appropriate.

---

## 18. Practical Exercise

Assume you are building an e-commerce platform.

Your application stores:

- 10 million customers.
- 50 million orders.
- 100 million order items.
- 5 million payment records.
- Website activity events.

Answer these questions.

### Conceptual questions

1. Why should a checkout operation use an OLTP workload?
2. Why is monthly revenue analysis an OLAP workload?
3. Why might columnar storage help when calculating revenue across 100 million order items?
4. Why is a full table scan not necessarily a bad execution plan for analytical queries?
5. What is the difference between a data warehouse and an OLAP engine?
6. Why might a dashboard show slightly outdated data?
7. What is the difference between a dimension and a measure?
8. Why might running a large report directly on a production database cause problems?

### SQL exercises

Write queries to calculate:

1. Total completed orders.
2. Total revenue by region.
3. Monthly revenue for the last 12 months.
4. Top 10 products by revenue.
5. Average order value by month.
6. Number of unique customers by month.
7. Month-over-month revenue growth.
8. Total quantity sold by product category.

### Architecture exercise

Design a basic architecture for an e-commerce application with separate OLTP and OLAP workloads.

Include:

- Operational database.
- Data ingestion pipeline.
- Analytical storage.
- OLAP query engine.
- Reporting/dashboard layer.

Explain how data moves from the operational system to the analytical system.

---

## 19. Interview Questions

### Beginner level

**Q1. What is OLAP?**

OLAP stands for Online Analytical Processing. It is an approach used to analyze large amounts of data through aggregations, complex queries, historical comparisons, and reporting.

**Q2. What is the main difference between OLTP and OLAP?**

OLTP processes individual business transactions. OLAP analyzes large amounts of data to identify trends, patterns, and business insights.

**Q3. What is a data warehouse?**

A data warehouse is a centralized repository that integrates data from multiple sources for analytics and reporting.

**Q4. What is a dimension?**

A dimension is a descriptive attribute used to analyze data, such as time, region, product, or customer segment.

**Q5. What is a measure?**

A measure is a value that can be analyzed or aggregated, such as revenue, quantity sold, or order count.

### Intermediate level

**Q6. Why are column-oriented databases commonly used for OLAP?**

Analytical queries often read a small number of columns across many records. Columnar storage can reduce unnecessary I/O, improve compression, and support efficient vectorized processing.

**Q7. Why are full table scans common in OLAP?**

Analytical queries often need a large percentage of the dataset. Sequential or columnar scans can be more efficient than performing many individual index lookups.

**Q8. What is the difference between a data warehouse and a data lake?**

A data warehouse typically stores integrated and structured analytical data with managed schemas and query models. A data lake can store large amounts of data in varied formats, including raw structured, semi-structured, and unstructured data.

**Q9. What is the difference between slice and dice?**

Slice selects one value from a dimension. Dice selects a subset using multiple conditions across dimensions.

**Q10. What is the difference between drill-down and roll-up?**

Drill-down moves from summarized data to more detailed data. Roll-up moves from detailed data to a higher-level summary.

### Advanced level

**Q11. Why should analytical workloads often be separated from OLTP workloads?**

Large scans and aggregations can consume substantial CPU, memory, and I/O. Separating the workloads helps prevent analytical queries from degrading operational transaction performance.

**Q12. What is vectorized execution?**

Vectorized execution processes batches of values rather than handling each value individually. It can improve CPU efficiency in analytical workloads.

**Q13. What is partition pruning?**

Partition pruning is the process of skipping partitions that cannot contain rows matching a query's filter conditions.

**Q14. What is a materialized view?**

A materialized view stores the result of a query so that repeated reads can avoid recalculating the entire query. Its data must be refreshed or maintained to reflect changes.

**Q15. Can PostgreSQL be used for OLAP?**

Yes. PostgreSQL supports analytical SQL, parallel query execution, partitioning, indexes, and materialized views. For very large analytical workloads, specialized analytical systems may provide better performance and isolation.

---

## 20. Chapter Summary

| Concept              | What to remember                            |
| -------------------- | ------------------------------------------- |
| OLAP                 | Analytical processing of large datasets     |
| Analytical query     | Query designed to extract business insights |
| Aggregation          | Summarizing multiple records                |
| Large scan           | Reading substantial portions of a dataset   |
| Columnar storage     | Stores values by column rather than by row  |
| Column pruning       | Reads only the required columns             |
| Vectorized execution | Processes batches of values efficiently     |
| Data warehouse       | Centralized analytical data repository      |
| Dimension            | Descriptive attribute used for analysis     |
| Measure              | Numeric value used for analysis             |
| Slice                | Select one dimension value                  |
| Dice                 | Select a subset across multiple dimensions  |
| Drill-down           | Move toward more detailed data              |
| Roll-up              | Move toward summarized data                 |
| Pivot                | Change the orientation of a report          |
| Materialized view    | Stores precomputed query results            |
| Partition pruning    | Avoids reading irrelevant partitions        |

### The mental model

```text
OLTP
 |
 | Records business transactions
 |
 v
Operational Database
 |
 | Data ingestion / ETL / ELT
 |
 v
Data Warehouse
 |
 | Stores integrated historical data
 |
 v
OLAP
 |
 | Analytical queries and aggregations
 |
 v
Reports / Dashboards / Business Intelligence
 |
 v
Business Decisions
```

The central idea is:

**OLTP records what happens in a business. OLAP analyzes what has happened and helps determine what should happen next.**
