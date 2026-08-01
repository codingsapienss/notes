---
sidebar_label: Data Warehousing
sidebar_position: 1
---

# Data Warehousing

## 1. Introduction: Why Do We Need a Data Warehouse?

In the previous chapters, we studied:

- **OLTP:** Processing day-to-day business transactions.
- **OLAP:** Analyzing large amounts of business data.
- **OLTP vs OLAP architecture:** How transactional and analytical workloads differ.

Now we need to understand how data from operational systems reaches analytical systems and how it is organized for reporting.

Consider an e-commerce company.

It has several operational systems:

- PostgreSQL stores orders.
- MongoDB stores customer information.
- A payment service stores payment records.
- An inventory service manages product quantities.
- A marketing platform tracks campaigns.
- Website events record user activity.

Each system stores data for its own operational purpose.

However, management wants to answer questions such as:

1. What was the company's total revenue last year?
2. Which product category generated the most profit?
3. Which marketing campaign acquired the most customers?
4. How many customers purchased again within 30 days?
5. Which region has the highest customer retention?
6. How has revenue changed over the last three years?

Getting these answers may require combining information from multiple systems.

A data warehouse provides a centralized analytical environment where data can be integrated, organized, stored, and queried.

**Core idea:** A data warehouse brings data from different sources together so that businesses can analyze their operations from a unified perspective.

---

## 2. What Is a Data Warehouse?

A **data warehouse** is a centralized analytical data repository designed to store integrated data from multiple sources for reporting, business intelligence, and decision-making.

It typically stores historical and structured data, although modern warehouses can also handle semi-structured data and continuously ingested information.

### Example

Imagine the following operational systems:

```text
             E-COMMERCE COMPANY
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
   PostgreSQL      MongoDB      Payment API
     Orders       Customers      Payments
       |             |             |
       +-------------+-------------+
                     |
                     v
              DATA INTEGRATION
                     |
                     v
               DATA WAREHOUSE
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Reports   Dashboards  Analytics
```

The data warehouse receives information from different sources and organizes it for analytical queries.

### Data warehouse characteristics

Traditional data warehouse architecture is commonly described using four characteristics.

| Characteristic | Meaning |
|---|---|
| Subject-oriented | Organized around business subjects such as sales, customers, and products |
| Integrated | Combines data from multiple sources into consistent formats and definitions |
| Time-variant | Maintains historical information for analysis over time |
| Nonvolatile | Primarily supports loading and querying rather than frequent operational transactions |

These are classical data warehouse characteristics. Modern architectures can differ in how strictly they implement them.

### Why not run every report directly on the operational database?

Suppose your production PostgreSQL database handles:

- Customer registration.
- Order creation.
- Payment updates.
- Inventory management.

Now a manager executes a query that scans 50 million orders and joins several large tables.

That query can consume substantial CPU, memory, and disk I/O.

It may affect the performance of customer-facing operations.

A data warehouse separates analytical workloads from operational workloads.

---

## 3. Data Warehouse vs Database vs Data Lake

These terms are related, but they are not interchangeable.

### 3.1 Operational database

An operational database stores data required by applications to perform business operations.

Examples:

- PostgreSQL.
- MySQL.
- MongoDB.

Typical responsibilities:

- Create orders.
- Update inventory.
- Store customer profiles.
- Process transactions.

### 3.2 Data warehouse

A data warehouse stores integrated data for analytical processing.

Typical responsibilities:

- Revenue reporting.
- Historical comparisons.
- Business intelligence.
- Customer segmentation.
- Sales analysis.

### 3.3 Data lake

A data lake stores large amounts of data in its original or transformed form.

It can contain:

- Structured data.
- Semi-structured data.
- Unstructured data.
- JSON files.
- CSV files.
- Parquet files.
- Images.
- Logs.
- Event data.

A data lake often uses object storage as its foundation.

### 3.4 Comparison

| Feature | Operational Database | Data Warehouse | Data Lake |
|---|---|---|---|
| Main purpose | Run applications | Analyze business data | Store large amounts of diverse data |
| Data | Operational records | Integrated analytical data | Raw and processed data |
| Structure | Application-oriented | Analytics-oriented | Structured and unstructured |
| Query pattern | Transactional | Analytical | Depends on processing engine |
| Updates | Frequent | Loads and controlled changes | Depends on storage and pipeline |
| Users | Application services | Analysts and BI users | Engineers, analysts, data scientists |
| Examples | PostgreSQL, MySQL, MongoDB | Snowflake, BigQuery, Redshift | Data stored in S3, Azure Data Lake Storage, Google Cloud Storage |

### 3.5 What is a lakehouse?

A **lakehouse** is an architecture that combines aspects of data lakes and data warehouses.

It aims to provide:

- Flexible storage for diverse data.
- Structured analytical access.
- Table-like management.
- Data governance.
- Transactional capabilities over supported data formats.

Technologies commonly associated with lakehouse architectures include:

- Delta Lake.
- Apache Iceberg.
- Apache Hudi.

A lakehouse is an architectural approach, not simply another name for a data lake or warehouse.

---

## 4. Data Warehouse Architecture

Let's understand the complete flow.

A typical data warehouse architecture has several layers.

```text
                  DATA SOURCES
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
   PostgreSQL       MongoDB        External APIs
     Orders        Customers         Payments
       |               |               |
       +---------------+---------------+
                       |
                       v
               DATA INGESTION
                       |
                       v
                STAGING LAYER
                       |
                       v
             TRANSFORMATION LAYER
                       |
                       v
               DATA WAREHOUSE
                       |
             +---------+---------+
             |                   |
             v                   v
         DATA MARTS         ANALYTICAL MODELS
             |                   |
             +---------+---------+
                       |
                       v
                 OLAP ENGINE
                       |
                       v
              BI / REPORTING TOOLS
                       |
                       v
                BUSINESS USERS
```

Let's understand each layer.

### 4.1 Data sources

These are the systems generating business data.

Examples:

- PostgreSQL order database.
- MongoDB customer database.
- Payment gateway.
- Inventory service.
- Marketing platform.
- Website analytics.
- External CSV files.

### 4.2 Data ingestion

Data ingestion means extracting or receiving data from source systems and moving it into the analytical environment.

Common approaches:

- Batch ingestion.
- Change Data Capture (CDC).
- Streaming ingestion.
- API-based extraction.
- File-based ingestion.

### 4.3 Staging layer

The staging layer is an intermediate area where incoming data can be stored before further processing.

It may be used for:

- Initial data loading.
- Temporary storage.
- Data validation.
- Deduplication.
- Type conversion.
- Error handling.

Example:

```text
Raw Orders
    |
    v
Staging Orders
    |
    v
Validate records
    |
    v
Remove duplicates
    |
    v
Transform data
    |
    v
Warehouse tables
```

Not every warehouse architecture uses a separate staging database. The staging layer may exist in the warehouse itself or in an external storage system.

### 4.4 Transformation layer

The transformation layer converts raw data into a consistent analytical structure.

Examples:

- Standardize date formats.
- Convert currency values.
- Normalize region names.
- Remove invalid records.
- Calculate derived business metrics.
- Resolve duplicate customer records.
- Combine information from multiple sources.

### 4.5 Data warehouse

This is where integrated analytical data is stored.

It may contain:

- Fact tables.
- Dimension tables.
- Historical records.
- Aggregated datasets.
- Analytical views.

### 4.6 Data marts

A data mart is a smaller analytical dataset focused on a particular business area.

Examples:

- Sales data mart.
- Marketing data mart.
- Finance data mart.
- Inventory data mart.

A company may create separate data marts to make data easier for specific teams to access.

### 4.7 Reporting and BI layer

This layer provides access to analytical information.

Examples:

- Management dashboards.
- Revenue reports.
- Marketing analytics.
- Customer retention reports.
- Product performance dashboards.

---

## 5. ETL: Extract, Transform, Load

ETL stands for:

- **Extract**
- **Transform**
- **Load**

It is a data integration process used to move data from source systems into a target analytical system.

### 5.1 Extract

Extract means collecting data from source systems.

Example:

```text
PostgreSQL:
Orders

MongoDB:
Customers

Payment API:
Payments

Marketing Platform:
Campaign Data
```

The extraction process retrieves the required data from these sources.

### 5.2 Transform

Transform means cleaning, converting, validating, and preparing the extracted data.

Suppose the source systems contain:

**Orders database**

| order_id | customer_id | amount |
|---|---|---:|
| 101 | 501 | 2500 |

**Payments system**

| payment_id | order_id | payment_status |
|---|---|---|
| 9001 | 101 | SUCCESS |

**Customer database**

| customer_id | name | region |
|---|---|---|
| 501 | Amit | North |

The transformation process can combine these records into a unified analytical dataset.

| order_id | customer_name | region | amount | payment_status |
|---|---|---|---:|---|
| 101 | Amit | North | 2500 | SUCCESS |

Other transformations may include:

- Converting currencies.
- Standardizing timestamps.
- Removing duplicate records.
- Handling missing values.
- Validating business rules.
- Calculating revenue.
- Creating derived columns.

### 5.3 Load

Load means writing the transformed data into the target data warehouse.

```text
SOURCE SYSTEMS
      |
      v
   EXTRACT
      |
      v
  TRANSFORM
      |
      v
    LOAD
      |
      v
DATA WAREHOUSE
```

### 5.4 ETL example

Suppose a company extracts yesterday's completed orders.

The transformation process:

1. Remove duplicate order records.
2. Exclude cancelled orders.
3. Standardize currency.
4. Join customer information.
5. Calculate revenue.
6. Load the resulting dataset into warehouse tables.

### 5.5 ETL advantages

- Data is cleaned before entering the warehouse.
- Business rules can be applied centrally.
- Invalid records can be rejected before loading.
- The warehouse can receive structured, prepared data.

### 5.6 ETL disadvantages

- Transformation infrastructure is required before loading.
- Large transformations can increase pipeline complexity.
- Schema changes can break extraction and transformation jobs.
- Processing can take significant time for large datasets.

---

## 6. ELT: Extract, Load, Transform

ELT stands for:

- **Extract**
- **Load**
- **Transform**

ELT changes the order of the process.

Instead of transforming the data before loading it, raw or lightly processed data is first loaded into the target analytical storage.

Transformations happen afterward, often using the warehouse's own compute engine.

### 6.1 ELT process

```text
SOURCE SYSTEMS
      |
      v
   EXTRACT
      |
      v
     LOAD
      |
      v
RAW DATA LAYER
      |
      v
 TRANSFORM
      |
      v
ANALYTICAL DATA MODELS
      |
      v
REPORTS / DASHBOARDS
```

### 6.2 Example

Suppose the source PostgreSQL database contains:

```json
{
  "order_id": 101,
  "customer_id": 501,
  "amount": 2500,
  "status": "completed"
}
```

In an ELT architecture:

1. Extract the order record.
2. Load it into a raw warehouse table.
3. Execute SQL transformations inside the warehouse.
4. Create clean analytical tables.
5. Use those tables for reporting.

### 6.3 Why ELT is popular

Modern analytical platforms provide scalable compute resources.

Instead of transforming everything outside the warehouse, teams can load the data and use the warehouse's own processing capabilities.

Advantages:

- Raw source data can be retained.
- Transformations can be rerun.
- Warehouse compute can handle large transformations.
- Data ingestion and transformation can be managed separately.

Disadvantages:

- Raw data needs storage.
- Data governance becomes important.
- Poorly managed transformations can increase compute costs.
- Invalid or sensitive raw data must be handled appropriately.

### 6.4 ETL vs ELT

| Feature | ETL | ELT |
|---|---|---|
| Full form | Extract, Transform, Load | Extract, Load, Transform |
| Transformation timing | Before loading into target | After loading into target |
| Initial target data | Prepared data | Raw or lightly processed data |
| Compute | Often external transformation infrastructure | Often target warehouse compute |
| Raw data retention | Depends on architecture | Commonly retained |
| Flexibility | Changes may require pipeline changes | Raw data can support new transformations |
| Common use | Traditional warehouse pipelines | Modern cloud warehouse and lakehouse pipelines |

**Remember:** ETL and ELT are data integration patterns. Neither is universally better.

---

## 7. Batch Processing vs Streaming Ingestion

Data must reach the warehouse. There are different ways to do this.

### 7.1 Batch processing

Batch processing collects data over a period and processes it together.

Example:

Every day at midnight, extract all orders created during the previous day.

```text
Orders created during the day
             |
             v
       Temporary Storage
             |
             v
      Scheduled Batch Job
             |
             v
       Data Warehouse
```

Common use cases:

- Daily revenue reports.
- Monthly financial reports.
- Historical data imports.
- Scheduled customer segmentation.

Advantages:

- Simpler processing model.
- Efficient for large groups of records.
- Easier to schedule and monitor.

Disadvantages:

- Data is not immediately available.
- Large batches can take time to process.
- Failed jobs may delay reporting.

### 7.2 Streaming ingestion

Streaming ingestion processes data continuously or in small increments as events arrive.

Example:

When an order is placed:

```text
Order Created
      |
      v
   Event Stream
      |
      v
  Stream Processor
      |
      v
Analytical Storage
      |
      v
Near-real-time Dashboard
```

Technologies used in streaming architectures include:

- Apache Kafka.
- Apache Flink.
- Apache Spark Structured Streaming.
- Managed cloud streaming services.

Typical use cases:

- Live sales dashboards.
- Fraud monitoring.
- Real-time product analytics.
- Website activity analysis.

### 7.3 Batch vs streaming

| Feature | Batch | Streaming |
|---|---|---|
| Processing | Groups of records | Continuous events or small increments |
| Latency | Usually higher | Usually lower |
| Complexity | Often simpler | Often more complex |
| Use case | Daily reports | Live analytics |
| Failure recovery | Rerun a batch or process a checkpointed range | Resume from offsets or checkpoints |
| Infrastructure | Scheduled jobs | Streaming infrastructure |

Streaming does not automatically mean every record becomes instantly visible in a dashboard. Buffering, processing, and storage introduce latency.

---

## 8. What Is a Fact Table?

Now we reach one of the most important concepts in data warehousing.

A **fact table** stores measurable business events or observations.

It usually contains:

- Foreign keys referencing dimensions.
- Numeric measures.
- Sometimes degenerate dimensions or other event identifiers.

Examples of facts:

- A product was sold.
- A payment was received.
- A customer placed an order.
- A shipment was delivered.
- A website event occurred.

### Example: sales_fact

| date_id | product_id | customer_id | region_id | quantity | revenue |
|---|---|---|---|---:|---:|
| 20260101 | 10 | 501 | 1 | 2 | 2000 |
| 20260102 | 11 | 502 | 2 | 1 | 1500 |
| 20260103 | 10 | 503 | 1 | 3 | 3000 |

Here:

- `date_id` references the date dimension.
- `product_id` references the product dimension.
- `customer_id` references the customer dimension.
- `region_id` references the region dimension.
- `quantity` is a measure.
- `revenue` is a measure.

### 8.1 Why is it called a fact table?

Because it records measurable business facts.

For example:

```text
On 1 January 2026,
Customer 501 purchased
2 units of Product 10
for revenue of 2000.
```

This is a measurable business event.

### 8.2 Common fact table measures

| Measure | Meaning |
|---|---|
| quantity | Number of units sold |
| revenue | Sales amount |
| discount_amount | Discount applied |
| profit | Revenue minus applicable costs |
| shipping_cost | Shipping expense |
| order_count | Number of orders |

### 8.3 Fact table properties

Fact tables often have:

- A large number of rows.
- Foreign keys to dimensions.
- Numeric measures.
- A clearly defined grain.
- Historical records.

Fact tables are commonly among the largest tables in a warehouse.

---

## 9. What Is a Dimension Table?

A **dimension table** stores descriptive information that provides context for facts.

Dimensions answer questions such as:

- Which product?
- Which customer?
- Which region?
- Which date?
- Which sales channel?

### Example: product_dimension

| product_id | product_name | category | brand |
|---|---|---|---|
| 10 | Laptop | Electronics | Brand A |
| 11 | Chair | Furniture | Brand B |
| 12 | Phone | Electronics | Brand C |

### Example: customer_dimension

| customer_id | customer_name | city | region |
|---|---|---|---|
| 501 | Amit | Noida | North |
| 502 | Ravi | Mumbai | West |
| 503 | Neha | Lucknow | North |

### Example: date_dimension

| date_id | full_date | month | quarter | year |
|---|---|---|---|---:|
| 20260101 | 2026-01-01 | January | Q1 | 2026 |
| 20260102 | 2026-01-02 | January | Q1 | 2026 |
| 20260103 | 2026-01-03 | January | Q1 | 2026 |

### 9.1 Why use dimension tables?

Suppose management asks:

> Calculate revenue by product category and region.

The fact table contains the measurable sales information.

The dimension tables provide the descriptive information required to group those facts.

Conceptually:

```text
              PRODUCT DIMENSION
                      |
                      |
CUSTOMER DIMENSION -- SALES FACT -- REGION DIMENSION
                      |
                      |
                DATE DIMENSION
```

### 9.2 Fact vs dimension

| Feature | Fact table | Dimension table |
|---|---|---|
| Stores | Business events and measurements | Descriptive attributes |
| Data | Measures and dimension keys | Names, categories, descriptions |
| Rows | Usually many | Usually fewer |
| Growth | Often grows rapidly | Usually grows more slowly |
| Example | Sales transaction | Product information |
| Query role | Aggregation | Filtering and grouping |

**Remember:**

- Fact = What happened?
- Dimension = Who, what, where, and when did it happen?

---

## 10. Grain: The Most Important Fact Table Design Decision

Before creating a fact table, define its **grain**.

Grain means the exact level of detail represented by one row in the fact table.

In other words:

**What does one row represent?**

### Example 1: Order-level grain

One row represents one complete order.

| order_id | customer_id | order_date | total_amount |
|---|---|---|---:|
| 101 | 501 | 2026-01-01 | 3000 |
| 102 | 502 | 2026-01-02 | 1500 |

### Example 2: Order-item-level grain

One row represents one product line within an order.

| order_id | product_id | quantity | line_amount |
|---|---|---:|---:|
| 101 | 10 | 2 | 2000 |
| 101 | 11 | 1 | 1000 |
| 102 | 12 | 1 | 1500 |

These are different grains.

### Why does grain matter?

Suppose order 101 contains:

- Product A: ₹2,000.
- Product B: ₹1,000.

The order total is ₹3,000.

If the order total is repeated on both order-item rows:

| order_id | product | line_amount | order_total |
|---|---|---:|---:|
| 101 | A | 2000 | 3000 |
| 101 | B | 1000 | 3000 |

Then this query is incorrect for calculating total order revenue:

```sql
SELECT SUM(order_total)
FROM order_item_fact;
```

It returns ₹6,000 instead of ₹3,000.

This is a grain mismatch and double-counting problem.

### Best practice

Define the grain before selecting measures and dimension keys.

Examples:

- One row per order.
- One row per order item.
- One row per payment transaction.
- One row per website event.
- One row per product per day.

Do not mix different grains in one fact table without a deliberate modeling design.

---

## 11. Star Schema

A **star schema** is a dimensional data model in which a central fact table connects directly to multiple dimension tables.

It is called a star schema because the structure resembles a star.

### Example

```text
                  DATE DIMENSION
                        |
                        |
PRODUCT DIMENSION -- SALES FACT -- CUSTOMER DIMENSION
                        |
                        |
                 REGION DIMENSION
```

### 11.1 Structure

Central fact table:

**sales_fact**

| date_id | product_id | customer_id | region_id | quantity | revenue |
|---|---|---|---|---:|---:|

Dimension tables:

- `date_dimension`
- `product_dimension`
- `customer_dimension`
- `region_dimension`

### 11.2 SQL example

```sql
CREATE TABLE date_dimension (
    date_id INTEGER PRIMARY KEY,
    full_date DATE NOT NULL,
    month_name VARCHAR(20),
    quarter_name VARCHAR(2),
    year INTEGER
);

CREATE TABLE product_dimension (
    product_id BIGINT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    brand VARCHAR(50)
);

CREATE TABLE customer_dimension (
    customer_id BIGINT PRIMARY KEY,
    customer_name VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(50)
);

CREATE TABLE sales_fact (
    sales_id BIGINT PRIMARY KEY,
    date_id INTEGER REFERENCES date_dimension(date_id),
    product_id BIGINT REFERENCES product_dimension(product_id),
    customer_id BIGINT REFERENCES customer_dimension(customer_id),
    quantity INTEGER,
    revenue NUMERIC(12, 2)
);
```

This is a simplified star-schema example. A production model might use separate geography dimensions, surrogate keys, and additional measures.

### 11.3 Analytical query

Calculate revenue by product category:

```sql
SELECT
    p.category,
    SUM(f.revenue) AS total_revenue
FROM sales_fact f
JOIN product_dimension p
    ON p.product_id = f.product_id
GROUP BY p.category
ORDER BY total_revenue DESC;
```

Calculate revenue by year:

```sql
SELECT
    d.year,
    SUM(f.revenue) AS total_revenue
FROM sales_fact f
JOIN date_dimension d
    ON d.date_id = f.date_id
GROUP BY d.year
ORDER BY d.year;
```

### 11.4 Advantages

- Simple structure.
- Easy to understand.
- Fewer joins than many normalized models.
- Good for common BI queries.
- Convenient for business reporting.

### 11.5 Disadvantages

- Some descriptive data is duplicated.
- Dimension tables may become wide.
- Maintaining consistent dimension information requires care.
- More complex relationships may require additional modeling.

---

## 12. Snowflake Schema

A **snowflake schema** is a dimensional model in which dimension tables are further normalized into related tables.

Instead of storing all descriptive attributes in one dimension table, some attributes are separated into additional tables.

### Example: Star schema product dimension

| product_id | product_name | category | department |
|---|---|---|---|
| 10 | Laptop | Electronics | Technology |
| 11 | Phone | Electronics | Technology |
| 12 | Chair | Furniture | Home |

The category and department information is repeated.

### Snowflake version

**product_dimension**

| product_id | product_name | category_id |
|---|---|---|
| 10 | Laptop | 1 |
| 11 | Phone | 1 |
| 12 | Chair | 2 |

**category_dimension**

| category_id | category_name | department_id |
|---|---|---|
| 1 | Electronics | 10 |
| 2 | Furniture | 20 |

**department_dimension**

| department_id | department_name |
|---|---|
| 10 | Technology |
| 20 | Home |

### Structure

```text
                 SALES FACT
                     |
                     |
              PRODUCT DIMENSION
                     |
                     v
              CATEGORY DIMENSION
                     |
                     v
             DEPARTMENT DIMENSION
```

Other dimensions may connect directly to the fact table.

### 12.1 Advantages

- Reduces duplication in dimension attributes.
- Creates more structured dimension relationships.
- Can make updates to shared descriptive attributes easier.
- Can be useful for complex dimension hierarchies.

### 12.2 Disadvantages

- Requires additional joins.
- Queries can become more complex.
- BI users may find the model harder to understand.
- More relationships must be maintained.

### 12.3 Star vs snowflake

| Feature | Star schema | Snowflake schema |
|---|---|---|
| Dimension structure | More denormalized | More normalized |
| Dimension relationships | Usually direct from fact | May involve multiple related dimension tables |
| Number of joins | Generally fewer | Generally more |
| Query complexity | Often simpler | Can be more complex |
| Data duplication | Often higher | Often lower |
| Ease of use | Usually easier for BI users | Requires understanding dimension relationships |
| Main priority | Simpler analytical queries | More structured dimension storage |

Neither schema is universally better. Choose based on query patterns, data quality requirements, maintainability, and performance.

---

## 13. Slowly Changing Dimensions (SCD)

One important challenge in data warehousing is handling changes in dimension attributes over time.

Consider a customer who changes their city.

Initially:

| customer_id | name | city |
|---|---|---|
| 501 | Amit | Noida |

Later, the customer moves to Delhi.

| customer_id | name | city |
|---|---|---|
| 501 | Amit | Delhi |

Should the warehouse overwrite Noida with Delhi?

It depends on the analytical requirement.

If the business wants to know the customer's current city, overwriting may be acceptable.

If it wants to analyze historical sales according to the customer's region at the time of purchase, historical information must be preserved.

This is where Slowly Changing Dimensions are used.

### 13.1 SCD Type 0 — Retain original value

The original dimension value is preserved.

Changes are not applied to the tracked attribute.

Example:

```text
Customer 501
Original city: Noida

New city: Delhi

Warehouse still stores: Noida
```

Useful when the original value must remain unchanged.

### 13.2 SCD Type 1 — Overwrite

The old value is replaced with the new value.

Before:

| customer_id | name | city |
|---|---|---|
| 501 | Amit | Noida |

After:

| customer_id | name | city |
|---|---|---|
| 501 | Amit | Delhi |

No historical version is preserved.

Useful when only the latest value matters or an incorrect value must be corrected.

### 13.3 SCD Type 2 — Create a new historical record

SCD Type 2 preserves historical changes by creating a new dimension row.

Example:

| customer_sk | customer_id | name | city | valid_from | valid_to | is_current |
|---:|---|---|---|---|---|---|
| 1001 | 501 | Amit | Noida | 2024-01-01 | 2025-06-30 | false |
| 2001 | 501 | Amit | Delhi | 2025-07-01 | NULL | true |

Here:

- `customer_id` is the business identifier.
- `customer_sk` is a surrogate key.
- `valid_from` records when the version became valid.
- `valid_to` records when the version stopped being valid.
- `is_current` identifies the current version.

The sales fact table references the appropriate surrogate key for the customer version applicable to that sale.

**This is critical:** The fact table should reference the historical dimension version that matches the event's business context.

### 13.4 SCD Type 3 — Add a previous-value column

Type 3 keeps limited history by storing the current and previous values in separate columns.

Example:

| customer_id | current_city | previous_city |
|---|---|---|
| 501 | Delhi | Noida |

This preserves only limited historical information.

If the customer moves again, the previous value may be overwritten.

### 13.5 SCD comparison

| Type | Method | Historical information |
|---|---|---|
| Type 0 | Preserve original | Original value only |
| Type 1 | Overwrite | No history |
| Type 2 | Insert new version | Full tracked history |
| Type 3 | Store previous value in another column | Limited history |

### Important practical distinction

SCD Type 2 is not simply inserting duplicate customer records.

Each row represents a distinct historical version of the same business entity, with a validity period and a unique surrogate key.

---

## 14. What Is a Surrogate Key?

A surrogate key is a warehouse-generated identifier used to uniquely identify a dimension record.

Example:

| customer_sk | customer_id | name |
|---:|---|---|
| 1001 | 501 | Amit |
| 1002 | 502 | Ravi |

Here:

- `customer_sk` is the surrogate key.
- `customer_id` is the business or natural key from the operational system.

### Why use surrogate keys?

1. Operational identifiers may change.
2. Different source systems may generate overlapping IDs.
3. SCD Type 2 requires multiple historical versions of one business entity.
4. Warehouse keys provide stable relationships within the analytical model.

Example:

The customer with business ID `501` may have two historical dimension versions:

| customer_sk | customer_id | city |
|---:|---|---|
| 1001 | 501 | Noida |
| 2001 | 501 | Delhi |

The business ID remains the same, but the surrogate keys identify separate historical versions.

---

## 15. Types of Fact Tables

Fact tables are not all the same. Their design depends on the business process and the type of measurement.

### 15.1 Transaction fact table

Stores one row per individual business event.

Example:

One row per order item.

| order_id | product_id | quantity | revenue |
|---|---|---:|---:|
| 101 | 10 | 2 | 2000 |
| 101 | 11 | 1 | 1000 |
| 102 | 12 | 1 | 1500 |

Typical characteristics:

- Detailed records.
- One row per event or transaction line.
- Useful for detailed analysis.

### 15.2 Periodic snapshot fact table

Stores summarized measurements at regular intervals.

Example:

One row per product per day.

| date | product_id | units_sold | daily_revenue |
|---|---|---:|---:|
| 2026-01-01 | 10 | 20 | 20000 |
| 2026-01-02 | 10 | 25 | 25000 |
| 2026-01-03 | 10 | 18 | 18000 |

Typical characteristics:

- Regular reporting intervals.
- Useful for trends.
- Often summarizes multiple transactions.

### 15.3 Accumulating snapshot fact table

Tracks a business process as it progresses through several stages.

Example: order fulfillment.

| order_id | order_created | payment_completed | shipped | delivered |
|---|---|---|---|---|
| 101 | Jan 1 | Jan 1 | Jan 2 | Jan 5 |
| 102 | Jan 2 | Jan 2 | Jan 3 | Jan 7 |

The same row is updated as the process progresses.

Useful for:

- Order lifecycle analysis.
- Delivery duration.
- Application approval processes.
- Claim processing.

### 15.4 Comparison

| Fact table type | What it stores | Example |
|---|---|---|
| Transaction | Individual business events | Order item |
| Periodic snapshot | State or measurements at regular intervals | Daily inventory |
| Accumulating snapshot | Progress through a business process | Order fulfillment |

---

## 16. Data Mart

A data mart is a smaller analytical dataset focused on a particular department or business function.

Imagine a company with one central warehouse.

Different departments need different information.

### Example

```text
                  DATA WAREHOUSE
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      SALES MART    MARKETING MART   FINANCE MART
          |             |             |
          v             v             v
     Sales Team    Marketing Team   Finance Team
```

### Sales data mart

Contains:

- Orders.
- Products.
- Revenue.
- Regions.
- Sales performance.

### Marketing data mart

Contains:

- Campaigns.
- Impressions.
- Clicks.
- Conversions.
- Customer acquisition cost.

### Finance data mart

Contains:

- Revenue.
- Expenses.
- Refunds.
- Profit.
- Financial reporting metrics.

### Data warehouse vs data mart

| Feature | Data warehouse | Data mart |
|---|---|---|
| Scope | Organization-wide | Department or subject-specific |
| Data | Integrated across business areas | Focused on a particular area |
| Users | Multiple teams | Specific teams |
| Purpose | Enterprise analytics | Departmental analytics |
| Size | Generally larger | Generally smaller |

A data mart may be created from an enterprise warehouse or, in some architectures, directly from operational sources.

---

## 17. Practical E-Commerce Data Warehouse Design

Now let's combine everything into a realistic example.

Suppose we are building an analytical system for an e-commerce company.

### Business requirements

The business wants to analyze:

- Total revenue.
- Orders by month.
- Sales by region.
- Product performance.
- Customer purchasing behavior.
- Payment success rates.
- Marketing campaign performance.

### 17.1 Source systems

```text
PostgreSQL
  |
  +-- Orders
  +-- Order Items
  +-- Payments

MongoDB
  |
  +-- Customer Profiles
  +-- User Activity

Marketing Platform
  |
  +-- Campaigns
  +-- Clicks
  +-- Conversions
```

### 17.2 Data pipeline

```text
SOURCE SYSTEMS
      |
      v
DATA INGESTION
      |
      v
RAW / STAGING TABLES
      |
      v
DATA VALIDATION
      |
      v
TRANSFORMATION
      |
      v
DIMENSION TABLES
      |
      v
FACT TABLES
      |
      v
DATA WAREHOUSE
      |
      v
BI DASHBOARDS
```

### 17.3 Example warehouse model

Dimension tables:

- `dim_date`
- `dim_customer`
- `dim_product`
- `dim_region`
- `dim_campaign`

Fact tables:

- `fact_sales`
- `fact_payments`
- `fact_campaign_performance`

### 17.4 Simplified schema

```text
                      DIM_DATE
                         |
                         |
DIM_PRODUCT ------ FACT_SALES ------ DIM_CUSTOMER
                         |
                         |
                     DIM_REGION
                         |
                         |
                    DIM_CAMPAIGN
```

### 17.5 Example SQL query

Calculate revenue by product category and year.

```sql
SELECT
    d.year,
    p.category,
    SUM(f.revenue) AS total_revenue
FROM fact_sales f
JOIN dim_date d
    ON d.date_key = f.date_key
JOIN dim_product p
    ON p.product_key = f.product_key
GROUP BY
    d.year,
    p.category
ORDER BY
    d.year,
    total_revenue DESC;
```

### 17.6 What happens internally?

1. The warehouse reads relevant fact records.
2. It joins the required dimensions.
3. It groups sales by year and category.
4. It calculates total revenue.
5. It returns summarized results.

This is a typical analytical query.

---

## 18. Data Warehouse Challenges

A data warehouse solves analytical data organization problems, but it introduces new responsibilities.

### 18.1 Data quality

Different sources may contain inconsistent values.

Example:

```text
Source A: North
Source B: NORTH
Source C: Northern
```

These may represent the same region.

The transformation process must establish a consistent definition.

### 18.2 Duplicate records

The same event may be delivered more than once.

For example, a CDC pipeline may replay records after a failure.

The ingestion process must handle duplicates appropriately.

### 18.3 Schema evolution

Operational systems change over time.

Example:

An orders table gains a new column:

```sql
ALTER TABLE orders
ADD COLUMN discount_amount NUMERIC(12, 2);
```

The warehouse pipeline and analytical models must be updated to handle the new field.

### 18.4 Late-arriving data

An event may arrive after its expected reporting period.

Example:

An order was placed on January 31 but the event reaches the warehouse on February 2.

The warehouse must decide how to update the January report.

### 18.5 Historical corrections

A source system may correct an earlier record.

The warehouse needs a process for updating or restating previously loaded data.

### 18.6 Data freshness

A dashboard may show data that is several minutes or hours behind the operational system.

The architecture must define acceptable freshness requirements.

### 18.7 Governance and security

A warehouse may contain sensitive information from several systems.

It needs:

- Access control.
- Data classification.
- Audit logging.
- Retention policies.
- Masking or tokenization where appropriate.
- Clear ownership of business definitions.

---

## 19. Important Data Warehouse Design Principles

Before implementing a warehouse, follow these principles.

### 1. Define business requirements first

Understand which business questions the warehouse must answer.

Do not create tables without knowing the analytical use cases.

### 2. Define fact table grain

Decide exactly what one row represents.

This prevents incorrect aggregations and double counting.

### 3. Separate facts and dimensions

Keep measurable events and descriptive attributes conceptually separate.

### 4. Maintain consistent definitions

For example, define what counts as:

- Revenue.
- Completed order.
- Active customer.
- Refund.
- Conversion.

Different dashboards should not calculate the same metric using conflicting rules.

### 5. Preserve historical information where required

Use appropriate historical modeling techniques such as SCD Type 2.

### 6. Make ingestion reliable

Handle:

- Retries.
- Duplicate events.
- Failed jobs.
- Late-arriving records.
- Schema changes.

### 7. Optimize for analytical queries

Use suitable partitioning, clustering, compression, materialized views, and pre-aggregation where appropriate.

### 8. Monitor the pipeline

Track:

- Records extracted.
- Records loaded.
- Rejected records.
- Pipeline failures.
- Data freshness.
- Processing duration.

### 9. Protect sensitive data

Do not expose personal or financial information to users who do not need it.

### 10. Avoid unnecessary complexity

A small application does not need a large enterprise data warehouse architecture from day one.

---

## 20. Interview Questions

### Beginner level

**Q1. What is a data warehouse?**

A data warehouse is a centralized analytical repository that integrates data from multiple sources for reporting, analytics, and business intelligence.

**Q2. Why do we need a data warehouse?**

To combine data from different systems, maintain historical information, support complex analytical queries, and reduce the impact of reporting workloads on operational databases.

**Q3. What is ETL?**

ETL stands for Extract, Transform, Load. Data is extracted from sources, transformed, and then loaded into the target system.

**Q4. What is ELT?**

ELT stands for Extract, Load, Transform. Data is loaded into the target analytical environment first and transformed afterward.

**Q5. What is a fact table?**

A fact table stores measurable business events or observations, typically along with keys referencing dimensions.

**Q6. What is a dimension table?**

A dimension table stores descriptive attributes used to filter, group, and analyze facts.

### Intermediate level

**Q7. What is the grain of a fact table?**

Grain defines exactly what one row represents in a fact table, such as one order or one order item.

**Q8. What is a star schema?**

A star schema is a dimensional model with a central fact table connected directly to dimension tables.

**Q9. What is a snowflake schema?**

A snowflake schema is a dimensional model in which dimension tables are further normalized into related tables.

**Q10. What is the difference between star and snowflake schemas?**

Star schemas generally have simpler, more denormalized dimensions and fewer joins. Snowflake schemas normalize dimensions further, reducing duplication but increasing joins and complexity.

**Q11. What is a data mart?**

A data mart is a smaller analytical dataset focused on a particular business function or department.

**Q12. What is a surrogate key?**

A surrogate key is a warehouse-generated identifier used to identify a dimension record independently of its source-system business identifier.

### Advanced level

**Q13. What is a Slowly Changing Dimension?**

SCD is a technique for managing changes to dimension attributes over time.

**Q14. What is the difference between SCD Type 1 and Type 2?**

Type 1 overwrites the existing value without preserving history. Type 2 creates a new dimension version to preserve historical changes.

**Q15. Why is grain important?**

Grain defines the level of detail in a fact table. Incorrect or inconsistent grain can cause double counting and inaccurate aggregations.

**Q16. What is the difference between a transaction fact table and a periodic snapshot fact table?**

A transaction fact table records individual events. A periodic snapshot fact table records measurements at regular intervals.

**Q17. What is an accumulating snapshot fact table?**

It tracks a business process through several milestones, such as order creation, payment, shipment, and delivery.

**Q18. What is the difference between a data lake and a data warehouse?**

A data lake can store diverse raw and processed data in multiple formats. A warehouse generally provides integrated, managed analytical data for structured reporting and queries.

**Q19. What is a lakehouse?**

A lakehouse is an architecture combining aspects of data lakes and data warehouses, aiming to support flexible data storage and managed analytical access.

**Q20. What are the major challenges in data warehousing?**

Data quality, schema evolution, duplicate events, late-arriving data, historical corrections, governance, security, and pipeline reliability.

---

## 21. Practical Exercises

### Exercise A: Identify facts and dimensions

Consider an e-commerce business.

It stores:

- Order ID.
- Customer ID.
- Product ID.
- Order date.
- Region.
- Quantity.
- Revenue.
- Discount.
- Campaign.

Classify each field as a measure, dimension attribute, or identifier/key.

| Field | Classification |
|---|---|
| Order ID | |
| Customer ID | |
| Product ID | |
| Order date | |
| Region | |
| Quantity | |
| Revenue | |
| Discount | |
| Campaign | |

Remember that an identifier may be a dimension key or a degenerate dimension, depending on the model.

### Exercise B: Define fact table grain

Design a fact table for each requirement:

1. One row per order.
2. One row per order item.
3. One row per product per day.
4. One row per payment transaction.
5. One row per order fulfillment process.

For each table, specify:

- What one row represents.
- Required dimension keys.
- Measures.
- Whether records are inserted or updated over time.

### Exercise C: Choose the right schema

For each scenario, explain whether a star or snowflake schema is more appropriate.

1. A simple sales dashboard.
2. A large enterprise product hierarchy.
3. A reporting system with many repeated category attributes.
4. A BI environment where users need simple SQL queries.

There is no universally correct answer. Explain the tradeoffs.

### Exercise D: SCD

A customer changes their region:

```text
Customer 501

2024:
Region = North

2025:
Region = South

2026:
Region = West
```

Design an SCD Type 2 dimension table.

Include:

- Surrogate key.
- Customer business ID.
- Region.
- Valid-from date.
- Valid-to date.
- Current-version indicator.

Explain how a 2024 sale can still be associated with the customer's North region.

### Exercise E: ETL vs ELT

Design both pipelines for the same e-commerce data.

Explain:

1. Where transformation happens.
2. Where raw data is stored.
3. How failures are handled.
4. How historical data is reprocessed.
5. Which architecture you would choose and why.

---

## 22. Final Revision Sheet

| Concept | Key takeaway |
|---|---|
| Data warehouse | Centralized analytical data repository |
| Data lake | Storage for diverse raw and processed data |
| Lakehouse | Combines aspects of lakes and warehouses |
| ETL | Extract, Transform, Load |
| ELT | Extract, Load, Transform |
| Batch processing | Processes grouped data periodically |
| Streaming ingestion | Processes continuously arriving events |
| Staging layer | Intermediate area for incoming data |
| Fact table | Stores business events and measures |
| Dimension table | Stores descriptive attributes |
| Grain | Defines what one fact row represents |
| Star schema | Central fact connected to dimensions |
| Snowflake schema | Normalized dimensional structure |
| SCD Type 0 | Preserve original value |
| SCD Type 1 | Overwrite value |
| SCD Type 2 | Preserve historical versions |
| SCD Type 3 | Store limited previous-value history |
| Surrogate key | Warehouse-generated dimension identifier |
| Transaction fact | One row per business event |
| Periodic snapshot | Measurements at regular intervals |
| Accumulating snapshot | Tracks process milestones |
| Data mart | Department-specific analytical dataset |

---

## 23. Complete Data Warehousing Mental Model

```text
                  OPERATIONAL SYSTEMS
                          |
            +-------------+-------------+
            |             |             |
            v             v             v
        PostgreSQL      MongoDB       External APIs
            |             |             |
            +-------------+-------------+
                          |
                          v
                    DATA INGESTION
                          |
                  +-------+-------+
                  |               |
                  v               v
                BATCH          STREAMING
                  |               |
                  +-------+-------+
                          |
                          v
                   RAW / STAGING
                          |
                          v
                  TRANSFORMATION
                    ETL / ELT
                          |
                          v
                   DATA WAREHOUSE
                          |
                +---------+---------+
                |                   |
                v                   v
            FACT TABLES        DIMENSION TABLES
                |                   |
                +---------+---------+
                          |
                          v
                   ANALYTICAL MODEL
                 STAR / SNOWFLAKE
                          |
                          v
                     OLAP ENGINE
                          |
                          v
                   DATA MARTS / BI
                          |
                          v
                 REPORTS / DASHBOARDS
                          |
                          v
                   BUSINESS DECISIONS
```

### The five questions to remember

1. **Where does data come from?**  
   Operational databases, events, APIs, and external systems.

2. **How does data enter the warehouse?**  
   Through batch ingestion, streaming, CDC, and ETL/ELT pipelines.

3. **How is data organized?**  
   Through fact tables, dimension tables, and dimensional models.

4. **How is historical information maintained?**  
   Through historical records and techniques such as Slowly Changing Dimensions.

5. **How is the data consumed?**  
   Through OLAP queries, data marts, reports, and BI dashboards.
