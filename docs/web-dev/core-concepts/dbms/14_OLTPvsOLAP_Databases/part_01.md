---
sidebar_label: OLTP (Online Transaction Processing)
sidebar_position: 1
---

# OLTP (Online Transaction Processing)

## 1. Introduction

Databases are used for different types of workloads.

Consider an e-commerce application.

Every day, customers perform operations such as:

- Creating accounts.
- Logging in.
- Searching for products.
- Placing orders.
- Making payments.
- Updating addresses.
- Cancelling orders.
- Checking order status.

These operations happen continuously and usually involve relatively small amounts of data per request.

The database must process these operations quickly, correctly, and reliably, even when thousands of users are using the application simultaneously.

This type of workload is called **OLTP — Online Transaction Processing**.

OLTP systems are designed to handle large numbers of short, concurrent transactions that read and modify operational data.

Examples of OLTP systems:

- Banking applications.
- E-commerce platforms.
- Payment systems.
- Airline reservation systems.
- Inventory management systems.
- User authentication systems.
- Order management systems.
- Booking platforms.

The primary objective of OLTP is:

**Process individual business transactions accurately, efficiently, and reliably.**

---

# 2. What Is OLTP?

OLTP stands for Online Transaction Processing.

It refers to database systems designed to process frequent, relatively small, operational transactions in real time.

A transaction may involve:

- Reading a record.
- Inserting a record.
- Updating a record.
- Deleting a record.
- Executing multiple SQL statements as one logical operation.

For example, when a customer places an order:

```text
Customer places order
        |
        v
Check product availability
        |
        v
Create order
        |
        v
Create order items
        |
        v
Update inventory
        |
        v
Record payment status
        |
        v
Commit transaction
```

These operations must be coordinated correctly.

If a critical operation fails, the database should not leave the system in an inconsistent state.

This is where transactions and ACID properties become important.

## 2.1 Characteristics of OLTP

| Characteristic                | Explanation                                        |
| ----------------------------- | -------------------------------------------------- |
| Short transactions            | Most transactions complete quickly                 |
| High concurrency              | Many users execute transactions simultaneously     |
| Frequent writes               | Inserts and updates happen continuously            |
| Fast response time            | Users expect quick results                         |
| Current data                  | Applications work primarily with operational data  |
| High consistency requirements | Business rules must be preserved                   |
| Small query scope             | Queries often access a limited number of records   |
| Transaction support           | ACID transactions are important for many workloads |

## 2.2 Example

Suppose an e-commerce application has 100,000 active customers.

At any given moment:

- 500 users may be placing orders.
- 2,000 users may be checking order status.
- 300 users may be updating their profiles.
- 1,000 users may be adding products to carts.

The database must process these requests concurrently.

It cannot simply process one customer's transaction and then move to the next customer.

It needs concurrency control, indexing, transaction management, and efficient resource utilization.

---

# 3. Understanding an OLTP Transaction

A transaction is a logical unit of database work.

It may contain one or multiple database operations that must succeed or fail together.

Consider a customer purchasing a product.

Product price: ₹2,000

Available inventory: 10 units

Customer purchases: 2 units

The transaction may involve:

1. Creating an order.
2. Creating order items.
3. Reducing inventory.
4. Recording payment information.

Let's understand this with SQL.

## 3.1 Example database schema

```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);
```

## 3.2 Performing a transaction

```sql
BEGIN;

-- Check and reduce inventory
UPDATE products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 101
  AND stock_quantity >= 2;

-- Create order
INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (
    501,
    4000,
    'PENDING'
);

-- Create order item
INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    price
)
VALUES (
    1001,
    101,
    2,
    2000
);

COMMIT;
```

This is a simplified illustration. A production implementation must also verify that the inventory update actually affected a row and must obtain the generated order ID rather than assuming a fixed ID.

The important idea is that multiple operations belong to one logical transaction.

If a required operation fails before the transaction commits, the application can roll back the transaction.

```sql
ROLLBACK;
```

## 3.3 Why transactions matter

Imagine the following situation:

```text
1. Inventory reduced successfully.
2. Order inserted successfully.
3. Order item insertion fails.
```

Without a transaction, the database could be left with:

- Reduced inventory.
- An incomplete order.
- Missing order items.

That is an inconsistent business state.

With a transaction, the database can roll back the changes so the operations do not remain partially committed.

---

# 4. ACID Properties in OLTP

ACID stands for:

- Atomicity.
- Consistency.
- Isolation.
- Durability.

These properties help ensure reliable transaction processing.

## 4.1 Atomicity

Atomicity means a transaction is treated as one indivisible unit.

Either all required operations succeed, or the transaction is rolled back.

Example:

```text
Transfer ₹5,000 from Account A to Account B.
```

Operations:

```text
Debit Account A: ₹5,000

Credit Account B: ₹5,000
```

If the debit succeeds but the credit fails, the transaction must not leave the money missing.

## 4.2 Consistency

Consistency means a successfully committed transaction preserves the database's defined constraints and invariants.

Example:

```text
Account balance must not become negative.
```

A transaction should not violate that rule if it is enforced by the database or application transaction logic.

Consistency depends on correctly defining and enforcing business rules.

## 4.3 Isolation

Isolation controls how concurrent transactions interact.

Suppose two customers try to purchase the last available unit of a product.

Both transactions must not successfully purchase the same unit.

The database uses concurrency-control mechanisms such as:

- Locks.
- MVCC.
- Serializable execution techniques.
- Other transaction scheduling mechanisms.

Isolation guarantees depend on the configured isolation level and database implementation.

## 4.4 Durability

Durability means that once a transaction is committed successfully, its committed changes should survive a crash according to the database's durability guarantees.

Databases use mechanisms such as:

- Write-ahead logging.
- Recovery logs.
- Checkpoints.
- Synchronous storage operations.
- Replication, where configured.

Replication and backups provide additional protection but are not interchangeable with transaction durability.

## 4.5 ACID summary

| Property    | Main purpose                                         |
| ----------- | ---------------------------------------------------- |
| Atomicity   | Prevent partially committed transactions             |
| Consistency | Preserve database constraints and invariants         |
| Isolation   | Control interference between concurrent transactions |
| Durability  | Preserve committed changes across failures           |

OLTP workloads often depend heavily on these properties because incorrect transactions can directly affect money, inventory, orders, and customer records.

---

# 5. Typical OLTP Workload Patterns

OLTP systems usually execute many small queries.

Let's examine common patterns.

## 5.1 INSERT operations

New records are continuously created.

Example:

```sql
INSERT INTO customers (
    name,
    email
)
VALUES (
    'Rahul Sharma',
    'rahul@example.com'
);
```

Common use cases:

- Creating accounts.
- Placing orders.
- Recording payments.
- Creating transactions.
- Storing new events.

## 5.2 UPDATE operations

Existing records are modified.

Example:

```sql
UPDATE orders
SET status = 'SHIPPED'
WHERE order_id = 1001;
```

Common use cases:

- Updating order status.
- Changing customer addresses.
- Updating inventory.
- Recording payment status.

## 5.3 DELETE operations

Records may be removed when business rules permit.

Example:

```sql
DELETE FROM shopping_cart_items
WHERE cart_id = 501;
```

Common use cases:

- Removing cart items.
- Deleting temporary records.
- Removing expired sessions.

Some business systems use soft deletion instead of physically deleting important records.

## 5.4 SELECT operations

OLTP applications also execute frequent read queries.

Example:

```sql
SELECT
    order_id,
    total_amount,
    status
FROM orders
WHERE customer_id = 501
ORDER BY created_at DESC
LIMIT 20;
```

Common use cases:

- Fetching customer details.
- Checking order status.
- Displaying account balances.
- Retrieving inventory.
- Loading recent transactions.

## 5.5 Point queries

A point query retrieves a specific record, often through a primary key or unique index.

Example:

```sql
SELECT *
FROM orders
WHERE order_id = 1001;
```

This is a typical OLTP query.

It retrieves one order rather than scanning millions of historical records.

## 5.6 Small-range queries

Example:

```sql
SELECT *
FROM orders
WHERE customer_id = 501
ORDER BY created_at DESC
LIMIT 10;
```

This retrieves a limited number of recent orders for one customer.

With an appropriate index, the database can avoid scanning the entire orders table.

---

# 6. Why Indexing Is Important in OLTP

OLTP applications frequently retrieve individual records.

Indexes help the database locate those records without scanning the entire table.

Consider:

```sql
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

Without an appropriate index, the database may need to examine many rows.

With an index:

```sql
CREATE UNIQUE INDEX idx_customers_email
ON customers(email);
```

The database can efficiently locate the matching record.

## 6.1 Common OLTP indexes

| Index                    | Typical use                                      |
| ------------------------ | ------------------------------------------------ |
| Primary key index        | Retrieve individual records                      |
| Unique index             | Enforce uniqueness and support lookup            |
| Foreign key column index | Improve joins and related lookups when needed    |
| Composite index          | Support common multi-column filters and ordering |
| B-tree index             | Equality and range searches                      |

Important PostgreSQL detail:

Creating a foreign key does not automatically create an index on the referencing column.

If the application frequently queries or joins using that column, you may need to create an index explicitly.

## 6.2 Indexing tradeoffs

Indexes improve many reads, but they are not free.

Every relevant insert, update, or delete may require index maintenance.

For example:

```sql
INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (
    501,
    4000,
    'PENDING'
);
```

If the table has multiple indexes, the database may need to update those indexes as part of the write.

Too many indexes can increase:

- Write overhead.
- Storage consumption.
- Maintenance work.
- Cache pressure.

Therefore, OLTP databases need carefully selected indexes based on actual query patterns.

---

# 7. Concurrency in OLTP Systems

One of the defining characteristics of OLTP is high concurrency.

Many transactions execute simultaneously.

Consider an inventory table:

| product_id | product_name | stock_quantity |
| ---------- | ------------ | -------------: |
| 101        | Laptop       |              1 |

Two customers try to purchase the final laptop at nearly the same time.

## 7.1 The concurrency problem

Transaction A:

```text
Read stock = 1
```

Transaction B:

```text
Read stock = 1
```

Transaction A:

```text
Purchase 1 unit
```

Transaction B:

```text
Purchase 1 unit
```

If the application handles this incorrectly, both customers may be told that their purchase succeeded.

This is an overselling problem.

## 7.2 Atomic conditional update

One approach is to perform the inventory check and update in a single database statement:

```sql
UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE product_id = 101
  AND stock_quantity >= 1
RETURNING stock_quantity;
```

The application must check whether a row was returned.

- If one row is returned, the stock update succeeded.
- If no row is returned, the product was unavailable or the product ID did not match.

This is safer than reading the stock in application code and then performing an unconditional update.

## 7.3 Row-level locking

Another approach uses a transaction and row-level lock:

```sql
BEGIN;

SELECT stock_quantity
FROM products
WHERE product_id = 101
FOR UPDATE;

-- Application verifies that stock is available.

UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE product_id = 101;

COMMIT;
```

`FOR UPDATE` locks the selected row against conflicting updates until the transaction ends.

The application must still check the quantity before updating.

## 7.4 Why concurrency control matters

OLTP systems must handle:

- Simultaneous payments.
- Concurrent inventory updates.
- Multiple users editing records.
- Concurrent account transfers.
- Booking the same seat.
- Duplicate requests.

Concurrency control prevents incorrect outcomes and maintains the database's transaction guarantees.

---

# 8. OLTP Database Architecture

A simplified OLTP architecture:

```text
                 CLIENTS
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Web App  Mobile App  API
          |         |         |
          +---------+---------+
                    |
                    v
               APPLICATION
                 SERVER
                    |
                    v
              CONNECTION POOL
                    |
                    v
              OLTP DATABASE
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Buffer    Transaction  Storage
        Cache     Manager      Engine
                    |
                    v
                 WAL / LOG
                    |
                    v
               DISK STORAGE
```

This is a conceptual architecture. Actual database implementations differ.

Let's understand its major components.

## 8.1 Application layer

The application receives requests from users.

For example:

```text
POST /orders
```

The application:

1. Authenticates the customer.
2. Validates the request.
3. Checks business rules.
4. Executes database operations.
5. Returns the result.

## 8.2 Connection pooling

Opening a new database connection for every request can be expensive.

Connection pooling maintains a reusable set of database connections.

Example using Node.js and `pg`:

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "ecommerce",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  max: 20,
});
```

A request can use a pooled connection:

```javascript
const result = await pool.query(
  "SELECT * FROM orders WHERE order_id = $1",
  [1001],
);
```

For transactions, use the same checked-out connection for all statements:

```javascript
const client = await pool.connect();

try {
  await client.query("BEGIN");

  await client.query(
    "UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = $1 AND stock_quantity >= 1",
    [101],
  );

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

This is a simplified example. Production code must verify that the inventory update affected exactly one row before committing.

A transaction must not accidentally execute its statements on different pooled connections.

## 8.3 Query processor

The query processor handles incoming database statements.

It generally performs tasks such as:

- Parsing SQL.
- Validating statements.
- Rewriting queries.
- Generating execution plans.
- Executing operations.

For example:

```sql
SELECT *
FROM orders
WHERE order_id = 1001;
```

The query planner considers available indexes and possible execution strategies.

## 8.4 Buffer cache

Databases keep frequently accessed data in memory where possible.

For example, if an application repeatedly reads a popular product record, the database may serve it from its buffer cache rather than reading it from storage every time.

This can reduce disk I/O and improve response time.

PostgreSQL uses shared buffers as part of its memory architecture and also benefits from the operating system's filesystem cache.

## 8.5 Transaction manager

The transaction-management subsystem coordinates transaction execution.

It is responsible for enforcing transaction semantics and coordinating with concurrency-control and recovery mechanisms.

## 8.6 Storage engine

The storage engine manages persistent data structures, indexes, and data access.

For PostgreSQL, this includes its heap storage and index access methods.

For MySQL, InnoDB is the commonly used transactional storage engine.

## 8.7 WAL and recovery

The database records changes in a write-ahead log to support crash recovery.

A simplified idea:

```text
Transaction
    |
    v
Modify data in memory
    |
    v
Record changes in WAL
    |
    v
Commit
    |
    v
Data pages flushed later
```

The precise ordering and durability behavior depend on the database implementation and configuration.

---

# 9. OLTP and Normalization

OLTP databases commonly use relational data models with normalized tables.

Normalization helps reduce unnecessary duplication and maintain data integrity.

Consider an e-commerce database.

A poorly structured table might contain:

| order_id | customer_name | customer_email    | product_name | quantity |
| -------- | ------------- | ----------------- | ------------ | -------: |
| 101      | Rahul         | rahul@example.com | Laptop       |        1 |
| 102      | Rahul         | rahul@example.com | Mouse        |        2 |
| 103      | Amit          | amit@example.com  | Keyboard     |        1 |

Customer information is duplicated across multiple orders.

A normalized design separates entities.

```text
customers
    |
    | customer_id
    v
orders
    |
    | order_id
    v
order_items
    |
    | product_id
    v
products
```

Tables:

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL
);
```

Now:

- Customer information is stored once.
- Product information is stored once.
- Orders reference customers.
- Order items reference products and orders.

This reduces duplication and helps preserve consistency.

## 9.1 Why normalization is useful in OLTP

OLTP systems frequently modify operational data.

For example:

- Customer email changes.
- Product price changes.
- Inventory changes.
- Order status changes.

Normalization reduces update anomalies and makes it easier to maintain consistent relationships.

However, excessive normalization can increase the number of joins needed for reads.

Database design must balance data integrity, query performance, and application requirements.

---

# 10. OLTP Performance Metrics

You need measurable indicators to evaluate an OLTP system.

## 10.1 Transaction throughput

Throughput measures how many transactions a system completes in a given period.

Common unit:

**TPS — Transactions Per Second**

Example:

```text
Completed transactions: 12,000

Time: 60 seconds

TPS = 12,000 / 60

TPS = 200
```

A database completing 200 transactions per second has a throughput of 200 TPS for that workload.

Be precise about what counts as a transaction.

A transaction may contain multiple SQL statements.

## 10.2 Query latency

Latency measures how long a request takes.

Example:

```text
Transaction starts: 10:00:00.000

Transaction completes: 10:00:00.050

Latency = 50 ms
```

Low latency is important because OLTP applications are user-facing.

## 10.3 Percentile latency

Average latency alone is not sufficient.

Suppose:

```text
Request latencies:

10 ms
12 ms
15 ms
20 ms
500 ms
```

Average:

```text
111.4 ms
```

The average is heavily influenced by one slow request.

Monitoring systems often track:

- p50 latency.
- p90 latency.
- p95 latency.
- p99 latency.

For example:

```text
p50 = 20 ms
p95 = 150 ms
p99 = 400 ms
```

These statistics help identify slow transactions that affect a smaller proportion of requests.

## 10.4 Concurrency

Concurrency measures how many operations or transactions are active simultaneously.

High concurrency can improve resource utilization, but excessive concurrency can create:

- Lock contention.
- Connection exhaustion.
- CPU saturation.
- Memory pressure.
- Disk I/O contention.

## 10.5 Error rate

An OLTP system should track failures such as:

- Transaction rollbacks.
- Constraint violations.
- Deadlocks.
- Connection failures.
- Query timeouts.
- Serialization failures.

## 10.6 Important OLTP metrics

| Metric                    | What it measures                  |
| ------------------------- | --------------------------------- |
| TPS                       | Completed transactions per second |
| QPS                       | Queries executed per second       |
| Latency                   | Time taken to complete operations |
| p95/p99 latency           | Tail response times               |
| Active connections        | Current database connections      |
| Lock wait time            | Time spent waiting for locks      |
| Deadlock count            | Number of detected deadlocks      |
| Transaction rollback rate | Frequency of failed transactions  |
| CPU utilization           | Database CPU consumption          |
| Disk I/O                  | Storage read/write activity       |
| Cache hit ratio           | Effectiveness of database caching |

TPS and QPS are not interchangeable.

One transaction may contain several SQL statements, so QPS can be higher than TPS.

---

# 11. OLTP Scaling Strategies

As application traffic grows, the OLTP database may become a bottleneck.

There are several ways to scale it.

## 11.1 Vertical scaling

Increase the resources of the existing database server.

For example:

```text
Before:

4 CPU cores
16 GB RAM
500 GB storage

After:

16 CPU cores
64 GB RAM
2 TB storage
```

Advantages:

- Relatively straightforward.
- No application-level data partitioning required.
- Can improve CPU, memory, and storage capacity.

Disadvantages:

- Hardware costs increase.
- There are practical scaling limits.
- A single primary can remain a bottleneck.

## 11.2 Read replicas

Create replicas to serve read traffic.

```text id="z0cv0p"
               Application
                    |
                    v
                Primary DB
                    |
           +--------+--------+
           |                 |
           v                 v
       Replica 1         Replica 2
           |                 |
           v                 v
        Read APIs         Read APIs
```

The primary handles writes, while replicas can handle eligible reads.

Important limitations:

- Replicas may lag behind the primary.
- Read-after-write consistency may require reading from the primary.
- Replication does not automatically distribute writes.
- Replication is not a backup.

## 11.3 Connection pooling

Connection pooling reduces the overhead of creating and destroying connections.

It also helps control how many concurrent database connections the application opens.

However, connection pools must be sized carefully.

Too many connections can overload the database.

## 11.4 Caching

Frequently accessed data can be cached.

For example:

```text
Product details
User profile
Configuration
```

A Redis cache can reduce repeated database reads.

However, caching introduces cache invalidation and consistency challenges.

## 11.5 Sharding

Sharding distributes data across multiple database nodes.

For example:

```text
Customer ID 1–1,000,000:
Shard 1

Customer ID 1,000,001–2,000,000:
Shard 2

Customer ID 2,000,001–3,000,000:
Shard 3
```

Sharding can increase aggregate storage and write capacity, but introduces:

- Shard-key design.
- Cross-shard queries.
- Distributed transactions.
- Rebalancing.
- Operational complexity.

It should not be the first solution to every database performance problem.

---

# 12. Real-World OLTP Example: E-Commerce Order Processing

Let's put the concepts together.

Suppose an e-commerce platform receives 1,000 orders per minute.

An order contains:

- Customer ID.
- Product IDs.
- Quantities.
- Prices.
- Payment status.
- Shipping information.

## 12.1 Request flow

```text
Customer
   |
   v
Frontend
   |
   v
Node.js API
   |
   v
Authentication
   |
   v
Validate Request
   |
   v
OLTP Database
   |
   +----------------------+
   |                      |
   v                      v
Check Inventory       Create Order
   |                      |
   +----------+-----------+
              |
              v
         Create Items
              |
              v
       Update Inventory
              |
              v
          Commit
              |
              v
       Return Order ID
```

This is a simplified logical flow.

In a real payment system, the payment provider interaction requires additional design.

A database transaction cannot automatically make an external payment API call part of the same ACID transaction.

## 12.2 Payment processing complication

Suppose the application:

1. Creates an order in PostgreSQL.
2. Calls an external payment gateway.
3. Receives payment confirmation.
4. Updates the order status.

The database transaction cannot atomically include the payment gateway's independent system.

A production system may use:

- Payment state machines.
- Idempotency keys.
- Transactional outbox patterns.
- Retry mechanisms.
- Reconciliation jobs.
- Sagas or compensating actions.

Example state transitions:

```text
PENDING
   |
   v
PAYMENT_PROCESSING
   |
   +----------+
   |          |
   v          v
PAID       FAILED
   |
   v
CONFIRMED
```

This is important because a failed external API request does not necessarily mean the payment failed. The payment provider may have processed it while the response was lost.

## 12.3 Idempotency

Suppose a customer clicks the Pay button twice.

Or the frontend retries because it did not receive a response.

Without protection, the application might create duplicate orders or payments.

An idempotency key can identify a logical request.

Example:

```text
Idempotency key:
order-payment-501-abc123
```

The backend records the key and ensures repeated requests do not perform the same logical operation more than once.

This is an application-level reliability technique commonly used with OLTP systems.

---

# 13. OLTP Database Examples

Several relational databases are commonly used for OLTP workloads.

## 13.1 PostgreSQL

PostgreSQL is a relational database that supports:

- ACID transactions.
- MVCC.
- SQL.
- Indexes.
- Foreign keys.
- Constraints.
- Concurrency control.
- WAL-based recovery.
- Replication.
- Partitioning.

It is widely used for transactional applications.

Example use cases:

- E-commerce.
- SaaS platforms.
- Financial applications.
- Order management.
- User account systems.

## 13.2 MySQL / InnoDB

MySQL with InnoDB supports:

- ACID transactions.
- Row-level locking.
- MVCC.
- Foreign keys.
- Redo and undo logging.
- Crash recovery.
- Replication.

It is commonly used for web applications and transactional systems.

## 13.3 Microsoft SQL Server

SQL Server provides:

- Transaction management.
- ACID guarantees.
- Locking and row-versioning mechanisms.
- Indexes.
- Stored procedures.
- Replication and high-availability options.

It is used in enterprise transactional systems.

## 13.4 Oracle Database

Oracle Database is widely used for enterprise transactional workloads.

It provides:

- Transaction management.
- Concurrency control.
- Recovery mechanisms.
- Advanced indexing.
- High availability.
- Enterprise data management capabilities.

## 13.5 OLTP is not limited to relational databases

Although relational databases are common OLTP systems, OLTP describes a workload pattern, not a database category.

Some NoSQL databases also support transactional operational workloads.

For example:

- MongoDB supports atomic single-document operations and multi-document transactions.
- Other distributed databases provide different transaction models.

The important question is whether the database's guarantees and query model fit the application's requirements.

---

# 14. Common OLTP Design Mistakes

## Mistake 1: Long-running transactions

Long transactions can hold locks or retain old row versions for longer than necessary.

This can increase contention and interfere with maintenance.

**Better approach:** Keep transactions short and avoid unnecessary operations inside them.

## Mistake 2: Missing indexes

Queries may scan large tables even when they only need a few records.

**Better approach:** Analyze real query patterns and create appropriate indexes.

## Mistake 3: Too many indexes

Every index adds storage and maintenance overhead.

**Better approach:** Keep indexes that support important queries and constraints. Remove redundant or unused indexes after careful analysis.

## Mistake 4: Uncontrolled connection creation

Creating a new connection for every request can exhaust database resources.

**Better approach:** Use connection pooling and configure reasonable limits.

## Mistake 5: Performing external API calls inside database transactions

A payment API or another network service may be slow or unavailable.

Holding database locks while waiting for it can create unnecessary contention.

**Better approach:** Keep database transactions short and coordinate external operations using patterns such as outbox, saga, and idempotency.

## Mistake 6: Assuming reads are always consistent across replicas

Read replicas may lag behind the primary.

**Better approach:** Route consistency-sensitive reads appropriately.

## Mistake 7: Ignoring deadlocks

Transactions that lock resources in inconsistent orders can deadlock.

**Better approach:** Use consistent lock ordering, short transactions, and appropriate retry handling.

## Mistake 8: Treating application-level checks as concurrency protection

Reading stock and then updating it without a suitable atomic operation can allow concurrent requests to oversell inventory.

**Better approach:** Use conditional updates, row-level locking, or another correct concurrency-control strategy.

## Mistake 9: Using floating-point types for money

JavaScript and floating-point database types can introduce precision problems.

**Better approach:** Use appropriate decimal or integer representations for financial values.

For PostgreSQL, `NUMERIC` is commonly used for exact decimal values.

---

# 15. OLTP Practical Checklist

When designing an OLTP system, evaluate the following.

| Area             | Questions                                                       |
| ---------------- | --------------------------------------------------------------- |
| Transactions     | Which operations must succeed or fail together?                 |
| Consistency      | What business invariants must always hold?                      |
| Isolation        | What concurrency problems can occur?                            |
| Indexing         | Which queries need fast lookups?                                |
| Normalization    | How should entities and relationships be represented?           |
| Connections      | How many concurrent database connections are needed?            |
| Latency          | What are the p95 and p99 targets?                               |
| Throughput       | How many transactions per second are expected?                  |
| Locking          | Which operations may contend for the same rows?                 |
| Recovery         | How will the database recover after a crash?                    |
| Scaling          | Can the workload use caching, replicas, or sharding?            |
| External systems | How are payments and other non-database operations coordinated? |

---

# 16. Interview Questions and Answers

## Q1. What is OLTP?

**Answer:**

OLTP stands for Online Transaction Processing.

It refers to database workloads that process frequent, short, concurrent transactions, such as creating orders, updating inventory, recording payments, and retrieving customer information.

## Q2. What are the main characteristics of OLTP?

**Answer:**

- Short transactions.
- High concurrency.
- Frequent inserts and updates.
- Low response-time requirements.
- Current operational data.
- Transaction and consistency requirements.
- Small, targeted queries.

## Q3. Why are ACID properties important in OLTP?

**Answer:**

OLTP systems often modify important operational data.

ACID properties help prevent partial transactions, preserve database constraints, control concurrency, and protect committed changes.

## Q4. What is the difference between TPS and QPS?

**Answer:**

TPS measures completed transactions per second.

QPS measures queries executed per second.

One transaction may execute multiple SQL statements, so QPS and TPS are not equivalent.

## Q5. Why is normalization commonly used in OLTP?

**Answer:**

Normalization reduces unnecessary duplication and update anomalies.

It helps maintain consistent relationships between entities such as customers, orders, and products.

## Q6. Why is indexing important in OLTP?

**Answer:**

OLTP applications frequently retrieve individual records or small record sets.

Indexes help locate those records without scanning entire tables.

However, excessive indexes increase write and storage overhead.

## Q7. What is concurrency control?

**Answer:**

Concurrency control coordinates simultaneous transactions so that they do not produce invalid database states.

It uses mechanisms such as locking and MVCC.

## Q8. What is the difference between optimistic and pessimistic concurrency control?

**Answer:**

Pessimistic approaches assume conflicts may occur and use locks to control access.

Optimistic approaches allow more concurrent work and detect certain conflicts when validating or committing changes.

The database's implementation determines the exact behavior.

## Q9. Why are long transactions problematic?

**Answer:**

They can hold locks for longer, increase contention, delay other transactions, and interfere with cleanup or maintenance.

## Q10. What is connection pooling?

**Answer:**

Connection pooling maintains reusable database connections.

It avoids repeatedly opening and closing connections and helps control database connection usage.

## Q11. What is a read replica?

**Answer:**

A read replica receives changes from a primary database and can serve eligible read queries.

It can reduce primary read load, but replication lag may cause stale reads.

## Q12. Does replication increase write throughput?

**Answer:**

Not necessarily.

Traditional primary-replica replication generally distributes read load, but writes still go through the primary.

Distributed write scaling requires a different architecture.

## Q13. What is an OLTP deadlock?

**Answer:**

A deadlock occurs when transactions wait on each other's locked resources in a cycle, preventing progress.

The database generally detects the deadlock and aborts one transaction.

## Q14. Why should external API calls not normally happen inside a long database transaction?

**Answer:**

External network operations can be slow or fail unpredictably.

Holding database locks while waiting increases contention and resource usage.

Use appropriate distributed workflow patterns instead.

## Q15. Is OLTP a database type?

**Answer:**

No.

OLTP describes a workload pattern.

PostgreSQL, MySQL, Oracle, SQL Server, and some NoSQL databases can support OLTP workloads.

---

# 17. Practical Exercises

## Exercise 1: Identify OLTP operations

Classify the following operations:

1. Creating a customer account.
2. Updating an order status.
3. Calculating average sales for the last five years.
4. Recording a payment.
5. Updating product inventory.
6. Generating a monthly revenue report.
7. Checking a customer's current account balance.

Identify which are typical OLTP operations and explain why.

## Exercise 2: Design an order transaction

An e-commerce application needs to:

1. Check product stock.
2. Create an order.
3. Create order items.
4. Reduce inventory.

Write a transaction using PostgreSQL.

Ensure:

- Stock cannot become negative.
- All required operations succeed together.
- Failure results in rollback.
- The generated order ID is used when inserting order items.

## Exercise 3: Identify the concurrency bug

Initial inventory:

```text
stock_quantity = 1
```

Two transactions read the stock simultaneously.

Both customers try to purchase the last unit.

Explain:

1. Why a normal read followed by an unconditional update can fail.
2. How an atomic conditional update prevents overselling.
3. How `SELECT ... FOR UPDATE` can solve the problem.

## Exercise 4: Calculate throughput

An OLTP database completes:

```text
Transactions = 30,000

Time = 120 seconds
```

Calculate TPS.

Then explain why this number alone does not tell us whether the database is performing well.

Consider latency, error rate, and transaction complexity.

## Exercise 5: Identify indexing problems

An application frequently executes:

```sql
SELECT *
FROM orders
WHERE customer_id = 501
ORDER BY created_at DESC
LIMIT 20;
```

Suggest an appropriate index and explain why it helps.

## Exercise 6: Design connection pooling

A Node.js API handles 2,000 concurrent HTTP requests.

Should the PostgreSQL pool size also be 2,000?

Explain:

- Why not necessarily.
- What happens when too many database connections are opened.
- How connection pooling controls concurrency.
- Why database connection capacity and HTTP request concurrency are different.

---

# 18. Quick Revision

| Concept         | Meaning                                                               |
| --------------- | --------------------------------------------------------------------- |
| OLTP            | Online Transaction Processing                                         |
| Transaction     | Logical unit of database work                                         |
| ACID            | Atomicity, Consistency, Isolation, Durability                         |
| TPS             | Transactions per second                                               |
| QPS             | Queries per second                                                    |
| Point query     | Query retrieving a specific record                                    |
| Concurrency     | Multiple operations executing simultaneously                          |
| Connection pool | Reusable set of database connections                                  |
| Index           | Structure that speeds up data retrieval                               |
| Normalization   | Organizing data to reduce duplication and anomalies                   |
| Locking         | Controlling concurrent access to resources                            |
| MVCC            | Multi-Version Concurrency Control                                     |
| WAL             | Write-ahead log used for recovery and durability                      |
| Read replica    | Replica used to serve eligible reads                                  |
| Sharding        | Distributing data across multiple database nodes                      |
| Idempotency     | Repeated execution of a logical request does not duplicate its effect |

## Most important concepts to remember

1. OLTP is designed for frequent, short, concurrent operational transactions.
2. E-commerce orders, banking transactions, payments, and inventory updates are common OLTP workloads.
3. ACID properties are important for reliable transaction processing.
4. Indexes improve targeted reads but increase write overhead.
5. Normalization helps maintain operational data consistency.
6. Concurrency control prevents conflicting transactions from producing invalid results.
7. TPS, QPS, and latency measure different aspects of performance.
8. Connection pooling helps manage database connections.
9. Read replicas can distribute read traffic but may return stale data.
10. Sharding can distribute writes and storage but introduces complexity.
11. External payment APIs cannot automatically participate in a normal PostgreSQL transaction.
12. Idempotency, outbox patterns, and sagas help coordinate operations across independent systems.
