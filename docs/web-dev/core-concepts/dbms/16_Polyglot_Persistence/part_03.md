---
sidebar_label: Real-World Architecture: Polyglot Persistence, CDC, Synchronization & Eventual Consistency
sidebar_position: 1
---

# Real-World Architecture: Polyglot Persistence, CDC, Synchronization & Eventual Consistency

## 1. Introduction

Consider a real-world e-commerce application.

It needs to support:

- User registration and authentication.
- Product catalog management.
- Product search.
- Shopping carts.
- Order placement.
- Payment processing.
- Inventory management.
- Sales analytics.
- Application monitoring.

Using one database for everything may initially be sufficient. However, as the application grows, different workloads may benefit from specialized databases.

For example:

| Requirement                     | Potential database                |
| ------------------------------- | --------------------------------- |
| Orders, payments, users         | PostgreSQL                        |
| Sessions, caching, leaderboards | Redis                             |
| Flexible product information    | MongoDB or PostgreSQL             |
| Full-text product search        | Elasticsearch / OpenSearch        |
| Historical analytics            | ClickHouse / BigQuery / Snowflake |
| Application metrics             | TimescaleDB / InfluxDB            |

The challenge is not simply connecting these databases.

The real challenge is keeping their data synchronized, maintaining business correctness, handling failures, and controlling operational complexity.

**The central problem of polyglot persistence:**

> How do multiple databases maintain useful, consistent representations of the same business data without creating an unreliable system?

---

## 2. Designing a Real-World E-Commerce Architecture

Let's design an e-commerce backend.

### 2.1 Business Requirements

Our application supports:

```text
Users
  - Register
  - Login
  - Update profile

Products
  - Create products
  - Update products
  - Browse products
  - Search products

Cart
  - Add products
  - Remove products
  - Update quantities

Orders
  - Place orders
  - View order history
  - Cancel orders

Payments
  - Process payments
  - Track payment status
  - Handle payment failures

Analytics
  - Revenue reports
  - Product performance
  - Customer behavior
```

We need to identify the database responsible for each workload.

### 2.2 Proposed Architecture

<escape>`text
                         CLIENT
                           |
                           v
                      BACKEND API
                     (Node.js / Express)
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        PostgreSQL       Redis       Search Engine
             |             |          (Elasticsearch)
             |             |             |
             |             |             |
       Users, Orders,    Sessions,    Product Search
       Payments,         Cache,       Search Index
       Inventory         Cart Cache
             |
             |
             v
       CDC / Event Pipeline
             |
       +-----+------------------+
       |                        |
       v                        v
   Search Index             Data Warehouse
       |                        |
       v                        v
 Product Search             Analytics
</escape>`

This is a conceptual architecture. A production implementation may use a message broker, CDC platform, background workers, or managed cloud services between these components.

### 2.3 Database Responsibilities

**PostgreSQL — Primary transactional database**

Stores authoritative business data:

- Users.
- Orders.
- Payments.
- Inventory.
- Product catalog, if relational modeling is appropriate.

Why?

- Transactions.
- Constraints.
- Relationships.
- Referential integrity.
- Complex queries.

**Redis — Low-latency data access**

Stores or maintains:

- Sessions.
- Frequently accessed cache entries.
- Rate-limiting counters.
- Temporary application state.
- Leaderboard data.

Redis should not automatically become the authoritative store for payments or orders simply because it is fast.

**Elasticsearch — Search**

Maintains searchable product representations.

Supports:

- Full-text search.
- Fuzzy matching.
- Relevance scoring.
- Filtering.
- Faceted search.

**Data warehouse — Analytics**

Stores analytical data for:

- Revenue reports.
- Customer behavior.
- Product performance.
- Historical trends.
- Business intelligence.

The important distinction is that these databases have different responsibilities.

### 2.4 Start With One Database Where Possible

Do not assume that the architecture above is necessary from the beginning.

An early-stage e-commerce application might use:

```text
Node.js / Express
       |
       v
   PostgreSQL
       |
       v
   Application
```

PostgreSQL can initially handle:

- Users.
- Products.
- Orders.
- Payments.
- Basic search.
- Reporting.

Redis can be added when caching or low-latency key-value operations become necessary.

A search engine can be added when search requirements justify its operational cost.

A warehouse can be added when analytical workloads become substantial.

The architecture should evolve in response to actual requirements.

---

## 3. Database Ownership and System of Record

When multiple databases store related information, we must establish ownership.

This is one of the most important rules in a multi-database architecture.

### 3.1 What Is a System of Record?

A system of record is the authoritative source of truth for a particular category of business data.

Example:

```text
PostgreSQL:
  Authoritative product information.

Elasticsearch:
  Searchable representation of products.

Redis:
  Cached product information.
```

Suppose a product has:

```json
{
  "productId": "P101",
  "name": "Gaming Laptop",
  "price": 75000,
  "stock": 20
}
```

The product information is stored authoritatively in PostgreSQL.

Elasticsearch and Redis may contain copies of some of these fields.

If the product price changes, PostgreSQL is the authoritative source for that update.

The other databases must receive the change.

### 3.2 Why Ownership Matters

Imagine that PostgreSQL and Elasticsearch both independently allow product prices to be updated.

```text
PostgreSQL:
  Price = ₹75,000

Elasticsearch:
  Price = ₹72,000
```

Which value should the application trust?

If both databases independently accept authoritative updates, the architecture has no clear source of truth.

This creates:

- Conflicting data.
- Difficult synchronization.
- Unclear recovery procedures.
- Inconsistent API responses.
- Difficult debugging.

A better design is:

```text
              Product Update
                    |
                    v
                PostgreSQL
              (Source of Truth)
                    |
             Change Propagation
                    |
             +------+------+
             |             |
             v             v
        Elasticsearch     Redis
         Search Index      Cache
```

PostgreSQL owns the product information.

Elasticsearch and Redis maintain derived representations.

### 3.3 Source Data vs Derived Data

**Source data** is the authoritative business information.

Examples:

- Payment records.
- Orders.
- User accounts.
- Inventory records.

**Derived data** is generated from source data.

Examples:

- Search indexes.
- Cached product details.
- Daily revenue summaries.
- Leaderboard rankings.
- Analytics aggregates.

| Source data      | Derived data          |
| ---------------- | --------------------- |
| Product record   | Search index document |
| Order records    | Daily revenue summary |
| User record      | Cached user profile   |
| Game submissions | Leaderboard ranking   |
| Payment records  | Payment analytics     |

Derived data can generally be rebuilt from its authoritative source, provided the source retains sufficient information.

This is an important recovery property.

If an Elasticsearch index is corrupted, we should ideally be able to rebuild it from authoritative product records.

---

## 4. The Data Synchronization Problem

Multiple databases introduce a synchronization problem.

Suppose a product's price changes.

The application needs to update:

1. PostgreSQL.
2. Elasticsearch.
3. Redis.

A naive implementation might look like this:

```javascript
async function updateProduct(productId, newPrice) {
  await postgres.updateProduct(productId, newPrice);

  await elasticsearch.updateProduct(productId, newPrice);

  await redis.del(`product:${productId}`);
}
```

This looks simple, but it contains a serious problem.

### 4.1 What Happens When One Operation Fails?

Consider the execution:

```text
Step 1: PostgreSQL update succeeds.
Step 2: Elasticsearch update fails.
Step 3: Redis cache invalidation never happens.
```

Now the system contains:

```text
PostgreSQL:
  Price = ₹70,000

Elasticsearch:
  Price = ₹75,000

Redis:
  Cached price = ₹75,000
```

The application has inconsistent representations.

The PostgreSQL update succeeded, but the other systems did not receive the change.

### 4.2 The Dual-Write Problem

This problem is commonly called the dual-write problem.

More generally, it occurs when an application writes to two or more independent systems and cannot atomically commit all those writes.

Example:

```javascript
await database.save(order);

await messageBroker.publish({
  type: "ORDER_CREATED",
  orderId: order.id,
});
```

What if:

- The database write succeeds.
- The message broker is temporarily unavailable.

The order exists, but no event was published.

The opposite failure is also possible:

- The event is published.
- The database transaction fails.

Now consumers may receive an event describing an order that was never committed.

The application cannot safely assume that both operations will always succeed together.

### 4.3 Why a Normal Database Transaction Cannot Solve This

A PostgreSQL transaction can atomically update multiple PostgreSQL tables.

For example:

```sql
BEGIN;

UPDATE orders
SET status = 'paid'
WHERE id = 101;

INSERT INTO payments (
    order_id,
    amount,
    status
)
VALUES (
    101,
    5000,
    'success'
);

COMMIT;
```

Both changes belong to one database transaction.

However, PostgreSQL cannot automatically include an Elasticsearch update or an ordinary Redis operation in the same local transaction.

These are independent systems.

Distributed transaction protocols such as two-phase commit exist, but they introduce coordination requirements and are not the default solution for most application-level database synchronization.

A common alternative is asynchronous event propagation.

---

## 5. Event-Driven Architecture for Database Synchronization

Instead of directly updating every database from the request handler, we can publish events representing successful business changes.

Example:

```text
User updates product
        |
        v
PostgreSQL
        |
        v
ProductUpdated Event
        |
        +------------------+
        |                  |
        v                  v
 Elasticsearch           Redis
 Update Search           Invalidate Cache
```

This architecture separates the authoritative write from downstream processing.

### 5.1 What Is an Event?

An event represents something that has already happened.

Examples:

```text
USER_REGISTERED
PRODUCT_CREATED
PRODUCT_UPDATED
ORDER_PLACED
PAYMENT_COMPLETED
ORDER_CANCELLED
INVENTORY_UPDATED
```

Example event:

```json
{
  "eventId": "evt_1001",
  "eventType": "PRODUCT_UPDATED",
  "aggregateId": "P101",
  "occurredAt": "2026-11-14T10:30:00Z",
  "data": {
    "productId": "P101",
    "name": "Gaming Laptop",
    "price": 70000
  }
}
```

An event typically contains:

- Unique event ID.
- Event type.
- Entity or aggregate identifier.
- Event timestamp.
- Relevant event data.
- Optional version or sequence number.

### 5.2 What Is a Message Broker?

A message broker transports messages between producers and consumers.

Examples:

- Apache Kafka.
- RabbitMQ.
- Amazon SQS.
- Google Pub/Sub.
- Azure Service Bus.

Conceptual architecture:

```text
             Producer
                |
                v
          Message Broker
                |
        +-------+-------+
        |       |       |
        v       v       v
     Consumer Consumer Consumer
        A       B       C
```

For our e-commerce application:

```text
PostgreSQL Change
        |
        v
  Event Publishing
        |
        v
    Message Broker
        |
   +----+---------+
   |              |
   v              v
Search Worker   Analytics Worker
   |              |
   v              v
Elasticsearch  Data Warehouse
```

The broker decouples producers from consumers.

The producer does not need to know every downstream service.

Consumers can process events independently.

### 5.3 Producer and Consumer

**Producer:** Publishes an event.

**Consumer:** Receives and processes an event.

Example:

```javascript
// Producer
await publishEvent({
  eventType: "PRODUCT_UPDATED",
  productId: "P101",
});
```

Consumer:

```javascript
// Consumer
async function handleProductUpdated(event) {
  await elasticsearch.update({
    productId: event.productId,
    data: event.data,
  });
}
```

The exact publishing and consumption APIs depend on the broker.

---

## 6. Change Data Capture (CDC)

Change Data Capture is a technique for identifying and capturing changes made to a database.

Instead of requiring every application code path to manually publish every change, CDC can observe database changes and make them available to downstream systems.

### 6.1 What Problem Does CDC Solve?

Suppose multiple parts of an application update products.

```text
Admin API
    |
    v
PostgreSQL

Import Worker
    |
    v
PostgreSQL

Internal Service
    |
    v
PostgreSQL
```

If each code path must remember to publish a product update event, one forgotten publishing operation can cause stale downstream data.

CDC provides a database-level mechanism to capture committed changes.

Conceptually:

```text
             PostgreSQL
                  |
                  v
            Change Log
                  |
                  v
             CDC System
                  |
                  v
             Event Stream
                  |
           +------+------+
           |             |
           v             v
      Elasticsearch  Data Warehouse
```

### 6.2 How CDC Works

Many relational databases maintain transaction logs.

PostgreSQL uses Write-Ahead Logging (WAL).

Before modifying the relevant data pages on disk, PostgreSQL records the necessary changes in its WAL.

A CDC process can use logical decoding and logical replication facilities to interpret committed changes and expose them to downstream consumers.

Simplified process:

```text
1. Application updates a product.

2. PostgreSQL processes the transaction.

3. Changes are recorded in WAL.

4. Transaction commits.

5. CDC reads the committed change information.

6. CDC converts the change into an event.

7. Downstream consumers receive the event.

8. Consumers update their own databases.
```

Important:

CDC captures database changes. It does not automatically understand every business meaning behind them.

For example, a database update may tell us:

```text
orders.status changed from pending to paid
```

But a business event such as `PAYMENT_COMPLETED` may require additional context:

- Payment provider reference.
- Payment amount.
- Currency.
- Idempotency key.
- Business validation result.

This distinction matters when choosing between raw CDC and application-defined domain events.

### 6.3 PostgreSQL CDC Example

A common CDC tool is Debezium.

Debezium can capture database changes and publish them to a Kafka-compatible event stream.

Conceptual architecture:

```text
PostgreSQL
    |
    | WAL / Logical Decoding
    v
Debezium Connector
    |
    v
Apache Kafka
    |
    +------------------+
    |                  |
    v                  v
Search Consumer    Analytics Consumer
    |                  |
    v                  v
Elasticsearch      Data Warehouse
```

The exact setup requires database configuration, replication permissions, connector configuration, schema handling, and operational monitoring.

### 6.4 CDC vs Application-Published Events

These approaches are related but not identical.

| Aspect                           | Application events            | CDC                                                                 |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Event source                     | Application business logic    | Database change log                                                 |
| Business meaning                 | Can contain domain meaning    | Usually represents row-level changes                                |
| Captures direct database changes | Only if publishing code runs  | Can capture committed changes regardless of application entry point |
| Requires application changes     | Usually yes                   | Not necessarily for every write path                                |
| Business context                 | Easier to include             | May require enrichment                                              |
| Main use                         | Business events and workflows | Data synchronization and change propagation                         |

**Application event example:**

```json
{
  "eventType": "ORDER_PLACED",
  "orderId": "O101",
  "userId": "U101",
  "totalAmount": 5000
}
```

**CDC-style change example:**

```json
{
  "operation": "UPDATE",
  "table": "orders",
  "before": {
    "status": "pending"
  },
  "after": {
    "status": "paid"
  }
}
```

Application events express what happened from a business perspective.

CDC captures what changed in the database.

Both approaches can be useful. The choice depends on the synchronization and business-event requirements.

### 6.5 When Should You Use CDC?

CDC is useful when:

- Multiple systems need database changes.
- Search indexes need continuous updates.
- Data warehouses need incremental ingestion.
- Large datasets make repeated full exports inefficient.
- Multiple downstream consumers need change streams.
- Direct database changes must be captured reliably.

CDC may be unnecessary for a small application where a simple transactional outbox and background worker are sufficient.

---

## 7. Transactional Outbox Pattern

The transactional outbox pattern solves a common reliability problem:

How do we ensure that a database change and the intention to publish its event are committed together?

### 7.1 The Problem

Consider:

```javascript
await Order.create(orderData);

await kafka.publish({
  type: "ORDER_CREATED",
  orderId: orderData.id,
});
```

Failure scenario:

```text
1. Order inserted successfully.
2. Application crashes.
3. Event never published.
```

The order exists, but downstream consumers do not know about it.

### 7.2 The Outbox Solution

Create an `outbox_events` table in the same database as the business data.

When an order is created:

1. Insert the order.
2. Insert the corresponding outbox event.
3. Commit both operations in one database transaction.

If the transaction commits, both records exist.

If it rolls back, neither record exists.

### 7.3 Outbox Table Example

```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0
);
```

Example event:

```json
{
  "id": "8e8c0c9d-9d42-4e22-98b2-94f2f5a83a11",
  "aggregateType": "ORDER",
  "aggregateId": "O101",
  "eventType": "ORDER_CREATED",
  "payload": {
    "orderId": "O101",
    "userId": "U101",
    "totalAmount": 5000
  }
}
```

### 7.4 Order Creation With Transactional Outbox

```sql
BEGIN;

INSERT INTO orders (
    id,
    user_id,
    total_amount,
    status
)
VALUES (
    'O101',
    'U101',
    5000,
    'pending'
);

INSERT INTO outbox_events (
    id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload
)
VALUES (
    gen_random_uuid(),
    'ORDER',
    'O101',
    'ORDER_CREATED',
    '{
      "orderId": "O101",
      "userId": "U101",
      "totalAmount": 5000
    }'::jsonb
);

COMMIT;
```

The order and event record are committed atomically.

### 7.5 Outbox Worker

A background worker periodically retrieves unpublished events.

Simplified example:

```javascript
async function publishPendingEvents() {
  const events = await db.query(`
    SELECT *
    FROM outbox_events
    WHERE published_at IS NULL
    ORDER BY created_at
    LIMIT 100
  `);

  for (const event of events.rows) {
    try {
      await messageBroker.publish({
        id: event.id,
        type: event.event_type,
        payload: event.payload,
      });

      await db.query(
        `
        UPDATE outbox_events
        SET published_at = NOW()
        WHERE id = $1
        `,
        [event.id],
      );
    } catch (error) {
      console.error("Event publishing failed:", error);
    }
  }
}
```

This is a simplified teaching example.

A production worker needs additional safeguards:

- Multiple workers must coordinate safely.
- Event publishing and marking an event as published are separate operations.
- Retries must be controlled.
- Failed events must remain recoverable.
- Events should be processed in the required order.
- The broker's delivery and acknowledgement behavior must be understood.

### 7.6 The Important Failure Case

Consider:

```text
1. Worker reads an outbox event.
2. Worker publishes it successfully.
3. Worker crashes before marking it as published.
4. Worker restarts.
5. It publishes the same event again.
```

The event is delivered twice.

This means the transactional outbox generally provides reliable event publication with possible duplicate delivery, not automatic exactly-once business processing.

Consumers must be idempotent.

### 7.7 Transactional Outbox Architecture

```text
               API Request
                    |
                    v
               PostgreSQL
                    |
            +-------+-------+
            |               |
            v               v
        Orders Table    Outbox Table
            |               |
            +-------+-------+
                    |
                  COMMIT
                    |
                    v
              Outbox Worker
                    |
                    v
              Message Broker
                    |
             +------+------+
             |             |
             v             v
        Search Worker  Analytics Worker
             |             |
             v             v
        Elasticsearch  Warehouse
```

The transactional outbox is one of the most useful patterns for reliable event-driven applications.

---

## 8. Eventual Consistency in Multi-Database Architectures

When data is copied asynchronously between databases, the copies may not update at exactly the same time.

This is eventual consistency.

### 8.1 What Is Eventual Consistency?

Eventual consistency means that different replicas or derived representations may temporarily contain different values, but they are expected to converge if updates stop and propagation succeeds.

Example:

A product price changes from ₹75,000 to ₹70,000.

```text
Time T1:

PostgreSQL:
  ₹70,000

Elasticsearch:
  ₹75,000

Redis:
  ₹75,000
```

The event has not yet been processed by downstream consumers.

A short time later:

```text
Time T2:

PostgreSQL:
  ₹70,000

Elasticsearch:
  ₹70,000

Redis:
  Cache invalidated
```

The derived representations have caught up.

### 8.2 Why Does Eventual Consistency Exist?

Because propagation takes time.

A typical path:

```text
Database Commit
      |
      v
Event Capture
      |
      v
Message Broker
      |
      v
Consumer Processing
      |
      v
Destination Database
```

Each stage can introduce delay.

For example:

- CDC processing delay.
- Broker queue delay.
- Consumer processing delay.
- Destination database write latency.
- Retry delay.

The time between the source commit and the destination update is propagation lag.

### 8.3 When Is Eventual Consistency Acceptable?

| Data                         | Eventual consistency suitability                   |
| ---------------------------- | -------------------------------------------------- |
| Search index                 | Usually acceptable                                 |
| Product recommendation count | Often acceptable                                   |
| Analytics dashboard          | Usually acceptable                                 |
| Cached product details       | Often acceptable                                   |
| Social media feed            | Depends on product requirements                    |
| Payment status               | Requires careful business-specific handling        |
| Account balance              | Generally requires stronger correctness guarantees |
| Inventory reservation        | Requires transactional correctness                 |

The distinction is important.

It is acceptable for a search result to temporarily show an outdated product price if the final purchase operation validates the current authoritative price.

It is not acceptable to charge a customer using an outdated price simply because the search index has not caught up.

### 8.4 Strong Consistency for Critical Operations

Suppose a customer places an order.

The application should not trust cached or search-index inventory values as the final authority.

A transactional inventory reservation might look like:

```sql
UPDATE inventory
SET available_quantity = available_quantity - 1
WHERE product_id = 'P101'
  AND available_quantity >= 1;
```

The application must check how many rows were updated.

If zero rows were updated, the reservation did not succeed.

The actual transaction should also include the required order and reservation records.

This protects against overselling when concurrent requests attempt to purchase the same item.

### 8.5 Read-Your-Writes Requirements

Suppose an administrator updates a product name.

Immediately afterward, the administrator opens the product page.

If the page reads from an old search index, the old name may appear.

Possible solutions:

- Read the updated product from PostgreSQL.
- Return the updated product from the successful write request.
- Wait for the search index to process the event when the product workflow requires it.
- Use version-aware reads or synchronization status where appropriate.

Do not force every read through the primary database if only certain operations require immediate consistency.

Design consistency at the operation level.

---

## 9. Handling Duplicate Events and Idempotency

Message brokers and background workers commonly use delivery semantics that allow redelivery.

A consumer must not assume it will receive each event exactly once.

### 9.1 Why Duplicate Events Occur

Example:

```text
1. Broker sends ORDER_CREATED.
2. Consumer processes the event.
3. Consumer updates its database.
4. Consumer crashes before acknowledging the message.
5. Broker sends the same event again.
```

The consumer processes the event a second time unless it detects the duplicate.

### 9.2 What Is Idempotency?

An operation is idempotent if repeating it produces the same intended final state as performing it once.

Mathematically:

\[
f(f(x)) = f(x)
\]

Example:

Setting a product's search representation to a particular version is naturally easier to make idempotent than incrementing a counter every time an event is received.

**Non-idempotent operation:**

```javascript
await db.query(
  `
  UPDATE product_stats
  SET update_count = update_count + 1
  WHERE product_id = $1
  `,
  [event.productId],
);
```

If the event is delivered twice, the counter increments twice.

**Idempotent-style operation:**

```javascript
await elasticsearch.index({
  index: "products",
  id: event.productId,
  document: event.product,
});
```

Using a stable document ID and writing the intended representation can make repeated processing converge to the same document state.

This example still requires version handling if older events might arrive after newer events.

### 9.3 Processed Events Table

A consumer can store processed event IDs.

```sql
CREATE TABLE processed_events (
    event_id UUID PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Consumer logic:

```text
1. Receive event.
2. Start destination database transaction.
3. Check whether event ID was processed.
4. If already processed, skip business operation.
5. Otherwise apply the change.
6. Record event ID.
7. Commit transaction.
8. Acknowledge message.
```

Example:

```sql
BEGIN;

INSERT INTO processed_events (event_id)
VALUES ('8e8c0c9d-9d42-4e22-98b2-94f2f5a83a11')
ON CONFLICT DO NOTHING;
```

The consumer must check whether the insert actually created a new row.

If it did not, the event has already been processed.

The business update and processed-event record must be committed in the same transaction when they belong to the same destination database.

This prevents a crash between the business update and duplicate-record tracking from creating inconsistent results.

### 9.4 Idempotency Is Not Just Duplicate Detection

There are two separate problems:

1. The same event may be delivered multiple times.
2. Events may arrive in an unexpected order.

Duplicate detection handles the first.

Version checks and ordering strategies handle the second.

Both are necessary in systems where event ordering affects correctness.

---

## 10. Event Ordering and Out-of-Order Events

Consider a product.

Two updates occur:

```text
Event 1:
Product price = ₹70,000
Version = 1

Event 2:
Product price = ₹65,000
Version = 2
```

But consumers receive them in this order:

```text
Event 2 arrives first.
Event 1 arrives later.
```

If the consumer blindly applies every event:

```text
Current price = ₹65,000

Old event arrives:
Current price = ₹70,000
```

The destination now contains stale information.

### 10.1 Use Version Numbers

Add a version to the source entity or event.

Example:

```json
{
  "eventId": "evt_1002",
  "eventType": "PRODUCT_UPDATED",
  "productId": "P101",
  "version": 2,
  "data": {
    "price": 65000
  }
}
```

The consumer tracks the latest processed version.

```text
Current destination version = 2
Incoming event version = 1

Result:
Ignore the older event.
```

Conceptual logic:

```javascript
async function applyProductEvent(event) {
  const current = await getIndexedProduct(event.productId);

  if (current && current.version >= event.version) {
    return;
  }

  await updateIndexedProduct({
    ...event.data,
    version: event.version,
  });
}
```

In production, the version comparison and update must be atomic or otherwise protected against concurrent consumers.

### 10.2 Ordering Within a Message Broker

Some brokers provide ordering guarantees within a defined scope.

For example, Kafka preserves order within a partition.

If events for the same product are routed to the same partition using `productId` as the key, they can be processed in partition order.

However:

- Different partitions do not have one global ordering.
- Multiple consumers can process different partitions concurrently.
- Retries and downstream processing can still complicate ordering.
- Ordering guarantees depend on the broker and consumer configuration.

### 10.3 Practical Rule

For events that update the same entity:

- Use a stable entity identifier as the partition or routing key when appropriate.
- Include a version or sequence number.
- Make consumers idempotent.
- Reject stale updates.
- Avoid relying on global ordering unless the system explicitly provides it.

---

## 11. Retry Mechanisms and Dead-Letter Queues

A downstream service may fail temporarily.

For example:

```text
PostgreSQL
    |
    v
Message Broker
    |
    v
Search Consumer
    |
    v
Elasticsearch
```

Suppose Elasticsearch is unavailable.

The search consumer cannot complete its work.

What should happen?

### 11.1 Retry Mechanism

The consumer can retry failed operations.

Example:

```text
Attempt 1 -> Failed
Wait 1 second

Attempt 2 -> Failed
Wait 2 seconds

Attempt 3 -> Failed
Wait 4 seconds

Attempt 4 -> Success
```

This is an example of exponential backoff.

A production retry strategy should also consider:

- Maximum attempts.
- Maximum delay.
- Jitter.
- Error classification.
- Consumer timeouts.
- Broker acknowledgement behavior.

Do not retry every error indefinitely.

A malformed event will not become valid simply because it is retried.

### 11.2 Dead-Letter Queue (DLQ)

A dead-letter queue stores messages that cannot be successfully processed after the configured retry policy.

```text
              Message Broker
                    |
                    v
               Consumer
                    |
             Processing Failed
                    |
                Retry
                    |
             +------+------+
             |             |
          Success        Failure
             |             |
             v             v
          Complete       DLQ
```

A DLQ helps prevent repeatedly failing messages from blocking normal processing.

The team can investigate:

- Invalid payloads.
- Schema incompatibilities.
- Missing referenced records.
- Permanent validation failures.
- Unexpected application bugs.

### 11.3 What Should a DLQ Message Contain?

Useful information includes:

- Original event ID.
- Original payload.
- Failure reason.
- Consumer name.
- Retry count.
- First failure timestamp.
- Last failure timestamp.
- Relevant correlation ID.

DLQ messages must be monitored.

A dead-letter queue is not a place to permanently hide errors.

### 11.4 Replaying Failed Events

After fixing the problem, operators may replay failed events.

Before replaying:

1. Identify the failure cause.
2. Verify that the event is still valid.
3. Check whether it was partially processed.
4. Confirm consumer idempotency.
5. Replay a controlled batch.
6. Verify destination state.

Never assume that replaying an event is harmless without checking its side effects.

---

## 12. Cache Synchronization and Cache Invalidation

Redis introduces another synchronization problem.

Suppose PostgreSQL contains:

```text
Product P101
Price = ₹75,000
```

Redis caches:

```text
product:P101
Price = ₹75,000
```

An administrator updates the price to ₹70,000 in PostgreSQL.

Redis still contains ₹75,000.

### 12.1 Cache-Aside Pattern

One common approach is cache-aside.

Read flow:

```text
1. Application checks Redis.
2. If the value exists, return it.
3. If missing, read PostgreSQL.
4. Store the result in Redis.
5. Return the result.
```

Example:

```javascript
async function getProduct(productId) {
  const cacheKey = `product:${productId}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const product = await db.query("SELECT * FROM products WHERE id = $1", [
    productId,
  ]);

  const result = product.rows[0];

  if (result) {
    await redis.set(cacheKey, JSON.stringify(result), { EX: 300 });
  }

  return result;
}
```

This example uses a five-minute expiration.

### 12.2 Cache Invalidation on Update

After updating the product in PostgreSQL:

```javascript
await updateProductInDatabase(productId, newPrice);

await redis.del(`product:${productId}`);
```

The next read will fetch fresh data from PostgreSQL and repopulate Redis.

However, this still has a failure window:

```text
1. PostgreSQL update succeeds.
2. Redis invalidation fails.
3. Stale cache remains.
```

Possible protections:

- Short cache TTL.
- Retryable invalidation events.
- Outbox-driven cache invalidation.
- Versioned cache entries.
- Avoid caching highly sensitive or frequently changing values.

### 12.3 Why Cache Invalidation Is Difficult

A cached object may appear in several keys:

```text
product:P101
category:electronics
homepage:featured-products
search:gaming-laptops
```

Updating one product may affect multiple cached representations.

This makes invalidation difficult.

Possible strategies include:

- TTL-based expiration.
- Explicit key invalidation.
- Versioned cache keys.
- Cache tagging.
- Event-driven invalidation.
- Short-lived caching for highly dynamic data.

The right strategy depends on the application's freshness requirements.

### 12.4 Cache Is Usually Not the Source of Truth

For an authoritative product price or inventory decision, the application should consult the authoritative system or an explicitly designed strongly consistent path.

A cached value is a performance optimization, not automatically a business guarantee.

---

## 13. Handling Synchronization Failure

A production architecture must assume that synchronization will fail occasionally.

Let's examine common failure scenarios.

### 13.1 Database Update Succeeds, Event Publication Fails

```text
PostgreSQL update: SUCCESS
Event publication: FAILED
```

Risk:

Downstream systems never receive the change.

Solution:

Use a transactional outbox or an appropriately configured CDC pipeline.

### 13.2 Event Published, Consumer Fails

```text
Event publication: SUCCESS
Consumer processing: FAILED
```

Risk:

The destination database remains stale.

Solution:

Retries, monitoring, idempotency, and a DLQ.

### 13.3 Consumer Processes Event, Acknowledgement Fails

```text
Destination update: SUCCESS
Message acknowledgement: FAILED
```

Risk:

The event may be delivered again.

Solution:

Idempotent processing and processed-event tracking where appropriate.

### 13.4 Old Event Arrives After New Event

```text
Version 2 arrives.
Version 1 arrives afterward.
```

Risk:

Stale data overwrites newer data.

Solution:

Version checks, entity-level ordering, and conditional updates.

### 13.5 Destination Database Is Down

```text
Message Broker
      |
      v
Consumer
      |
      v
Elasticsearch unavailable
```

Risk:

Messages accumulate and the search index becomes stale.

Solution:

- Retry with backoff.
- Monitor consumer lag.
- Preserve messages.
- Scale consumers after recovery.
- Rebuild the index if necessary.

### 13.6 Full Synchronization Is Needed

Suppose Elasticsearch loses its index.

A robust architecture should support rebuilding it from authoritative data.

```text
PostgreSQL
    |
    v
Read Product Records
    |
    v
Transform Documents
    |
    v
Bulk Index
    |
    v
Elasticsearch
```

During a rebuild, changes may continue happening.

A safe rebuild process must account for concurrent updates, for example by combining a consistent snapshot with a change stream and tracking the relevant position in that stream.

Otherwise, an update occurring during the rebuild may be missed or overwritten by an older snapshot.

---

## 14. Data Synchronization Strategies

There are several ways to keep databases synchronized.

### 14.1 Synchronous Dual Writes

The application directly writes to multiple databases.

```text
Application
    |
    +-------> PostgreSQL
    |
    +-------> Elasticsearch
```

Advantages:

- Simple to understand.
- Can provide immediate destination updates when both operations succeed.

Disadvantages:

- Partial failures.
- Increased request latency.
- Tight coupling.
- Difficult retry and recovery behavior.

Use cautiously. It is generally not a safe default for critical cross-database writes.

### 14.2 Asynchronous Event-Based Synchronization

The application commits source data and publishes an event through a reliable mechanism.

```text
Application
    |
    v
PostgreSQL + Outbox
    |
    v
Message Broker
    |
    v
Consumers
    |
    v
Destination Databases
```

Advantages:

- Decoupling.
- Independent consumers.
- Better failure isolation.
- Natural support for retries.

Disadvantages:

- Eventual consistency.
- More infrastructure.
- Duplicate delivery handling.
- Event ordering and schema management.

### 14.3 Change Data Capture

CDC reads committed database changes and forwards them to other systems.

```text
PostgreSQL WAL
      |
      v
CDC Connector
      |
      v
Message Broker
      |
      v
Consumers
```

Advantages:

- Captures database-level changes.
- Useful for incremental data synchronization.
- Reduces dependence on every application code path manually publishing updates.

Disadvantages:

- Requires database and connector configuration.
- Raw row changes may lack business context.
- Schema evolution needs careful handling.
- CDC infrastructure must be monitored.

### 14.4 Batch Synchronization

Instead of updating destination databases immediately, the system periodically exports and imports data.

Example:

```text
Every 15 minutes:

PostgreSQL
    |
    v
Export Changed Records
    |
    v
Transform
    |
    v
Load Into Warehouse
```

Advantages:

- Simpler infrastructure.
- Suitable for some analytics workloads.
- Efficient for scheduled processing.

Disadvantages:

- Greater data freshness delay.
- Large batch failures can be expensive.
- Incremental tracking and retry handling still matter.

### 14.5 Comparison

| Strategy                | Freshness                    | Complexity                    | Typical use                      |
| ----------------------- | ---------------------------- | ----------------------------- | -------------------------------- |
| Synchronous dual writes | Potentially immediate        | Failure handling is difficult | Carefully controlled workflows   |
| Transactional outbox    | Near real-time, asynchronous | Moderate                      | Reliable application events      |
| CDC                     | Near real-time, asynchronous | Moderate to high              | Database change propagation      |
| Batch synchronization   | Delayed                      | Low to moderate               | Periodic analytics and reporting |

There is no universally best synchronization mechanism.

Choose based on required freshness, reliability, business semantics, and operational capability.

---

## 15. Schema Evolution and Event Versioning

Distributed systems introduce a new problem: consumers and producers may not be upgraded at the same time.

Suppose the original event is:

```json
{
  "eventType": "ORDER_CREATED",
  "orderId": "O101",
  "totalAmount": 5000
}
```

Later, the application adds currency:

```json
{
  "eventType": "ORDER_CREATED",
  "orderId": "O101",
  "totalAmount": 5000,
  "currency": "INR"
}
```

An older consumer may not know about `currency`.

This is schema evolution.

### 15.1 Add Event Versions

Example:

```json
{
  "eventType": "ORDER_CREATED",
  "eventVersion": 2,
  "orderId": "O101",
  "totalAmount": 5000,
  "currency": "INR"
}
```

A consumer can use the version to interpret the payload.

### 15.2 Backward-Compatible Changes

Commonly safer changes include:

- Adding optional fields.
- Providing sensible defaults.
- Keeping existing field meanings unchanged.
- Avoiding unexpected type changes.

Potentially breaking changes include:

- Renaming required fields.
- Removing fields.
- Changing numeric values into strings.
- Changing the meaning of an existing field.
- Changing event semantics without versioning.

### 15.3 Schema Registry

In event-driven systems, a schema registry can manage event schemas and compatibility rules.

Examples include:

- Confluent Schema Registry.
- Other schema management systems compatible with the event platform.

Schema formats may include:

- Avro.
- Protobuf.
- JSON Schema.

A schema registry helps producers and consumers agree on event structure.

It does not automatically guarantee correct business behavior. Consumers still need appropriate validation and compatibility testing.

---

## 16. Observability in a Polyglot Architecture

When one database is involved, debugging may be relatively straightforward.

With multiple databases, a single business operation may cross several systems.

Example:

```text
Customer places order
        |
        v
Node.js API
        |
        v
PostgreSQL
        |
        v
Outbox Worker
        |
        v
Kafka
        |
        +-------------------+
        |                   |
        v                   v
Search Consumer       Analytics Consumer
        |                   |
        v                   v
Elasticsearch         Warehouse
```

If the search result is stale, where did the failure occur?

- Was the database updated?
- Was the outbox event created?
- Was it published?
- Was the message consumed?
- Did the Elasticsearch update fail?

Without observability, finding the answer is difficult.

### 16.1 Important Metrics

| Metric                      | What it tells us                               |
| --------------------------- | ---------------------------------------------- |
| Database query latency      | How long database queries take                 |
| Database connection count   | Connection usage                               |
| Outbox backlog              | Number of unpublished events                   |
| Event publication failures  | Publishing reliability                         |
| Consumer lag                | How far consumers are behind                   |
| Retry count                 | Frequency of processing failures               |
| DLQ message count           | Permanently or repeatedly failing messages     |
| Replication lag             | Delay between replicas                         |
| Search indexing latency     | Time from source change to search availability |
| Cache hit ratio             | How often cache serves reads                   |
| Cache invalidation failures | Whether stale cache entries may remain         |

### 16.2 Correlation IDs

A correlation ID connects logs across multiple services or components.

Example:

```text
Request ID:
req_1001

Order ID:
O101

Event ID:
evt_1001
```

These identifiers allow engineers to trace:

```text
API Request
   |
   v
Order Transaction
   |
   v
Outbox Event
   |
   v
Broker Message
   |
   v
Consumer Processing
```

Use structured logs and propagate relevant identifiers across service boundaries.

### 16.3 Distributed Tracing

Distributed tracing helps visualize how a request or workflow moves through multiple components.

It can reveal:

- Slow database queries.
- Broker delays.
- Consumer processing time.
- External API latency.
- Network bottlenecks.

Tools such as OpenTelemetry can provide instrumentation and trace propagation.

The important point is that multi-database architectures require end-to-end observability, not just database-specific monitoring.

---

## 17. Operational Complexity of Polyglot Persistence

Every additional database creates additional responsibilities.

Suppose an application uses:

```text
PostgreSQL
Redis
MongoDB
Elasticsearch
Kafka
ClickHouse
```

The team must now manage:

- Six technologies.
- Six sets of operational characteristics.
- Multiple backup strategies.
- Multiple monitoring systems.
- Different query languages and data models.
- Multiple security configurations.
- Synchronization pipelines.
- Schema evolution.
- Failure recovery.
- Capacity planning.

This complexity is often underestimated.

### 17.1 Infrastructure Cost

More databases can mean:

- More compute.
- More storage.
- More network traffic.
- More replicas.
- More backups.
- More managed-service fees.

### 17.2 Engineering Cost

Engineers must understand:

- PostgreSQL transactions and indexes.
- Redis memory and eviction.
- Elasticsearch mappings and indexing.
- Kafka partitions and consumer groups.
- CDC configuration.
- Data synchronization.
- Failure handling.

The team also needs to maintain code and deployment processes for all these systems.

### 17.3 Debugging Complexity

Consider this situation:

A customer reports that their order is confirmed, but the order history page does not display it.

Possible causes:

1. PostgreSQL transaction failed.
2. The order exists, but an event was not published.
3. The consumer is delayed.
4. The destination system is unavailable.
5. A search or read model is stale.
6. The application reads from the wrong data source.

More components mean more possible failure locations.

### 17.4 When Is Polyglot Persistence Worth It?

Use multiple databases when:

- A workload has clearly different requirements.
- The primary database is measurably struggling with a specialized workload.
- A specialized database offers substantial value.
- The team can operate the additional infrastructure.
- Data synchronization and recovery can be designed reliably.

Avoid it when:

- The application is small.
- One database already handles the workload.
- There is no measurable performance or capability problem.
- The team lacks the operational capacity.
- Data synchronization creates more complexity than the benefit justifies.

**A specialized database should solve a real problem, not create an architectural achievement for its own sake.**

---

## 18. Complete End-to-End Example: Placing an Order

Let's walk through a practical order workflow.

### 18.1 Business Requirements

A customer places an order for one product.

The application must:

1. Validate the user.
2. Validate product availability.
3. Reserve inventory.
4. Create the order.
5. Initiate payment.
6. Record the payment result.
7. Update the order status.
8. Publish events.
9. Update downstream representations.

### 18.2 Transactional Database Operations

Assume PostgreSQL is the system of record.

A simplified transaction could look like:

```sql
BEGIN;

-- Reserve one unit.
UPDATE inventory
SET available_quantity = available_quantity - 1
WHERE product_id = 'P101'
  AND available_quantity >= 1;

-- Application must verify that exactly one row was updated.

-- Create order.
INSERT INTO orders (
    id,
    user_id,
    total_amount,
    status
)
VALUES (
    'O101',
    'U101',
    5000,
    'pending'
);

-- Create an outbox event.
INSERT INTO outbox_events (
    id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload
)
VALUES (
    gen_random_uuid(),
    'ORDER',
    'O101',
    'ORDER_CREATED',
    '{
      "orderId": "O101",
      "userId": "U101",
      "totalAmount": 5000
    }'::jsonb
);

COMMIT;
```

This example illustrates inventory reservation, order creation, and event creation.

A complete production workflow must also handle the relationship between payment authorization, external payment providers, and order state.

### 18.3 Payment Provider Interaction

An external payment gateway is not part of the PostgreSQL transaction.

A simplified workflow:

```text
Customer
   |
   v
Order API
   |
   v
PostgreSQL
   |
   v
Payment Processing Workflow
   |
   v
Payment Gateway
   |
   v
Payment Result
   |
   v
PostgreSQL Update
   |
   v
Payment Completed Event
```

Do not keep a database transaction open while waiting for a potentially slow external payment API.

Instead, use a controlled workflow:

- Create an order in a pending state.
- Initiate payment using an idempotency key.
- Process the provider response or webhook.
- Verify the payment result.
- Update the authoritative payment and order records in a transaction.
- Write the corresponding outbox event in that same transaction.

If payment fails, the order and inventory reservation must follow a defined cancellation or release workflow.

### 18.4 Downstream Synchronization

After the order is confirmed:

```text
PostgreSQL
    |
    v
Outbox Event
    |
    v
Message Broker
    |
    +---------------------+
    |                     |
    v                     v
Analytics Consumer    Notification Consumer
    |                     |
    v                     v
Data Warehouse        Email / SMS Service
```

Other events may update:

- Search representations.
- Cached order summaries.
- Customer activity projections.
- Reporting systems.

The payment and order records remain authoritative in PostgreSQL.

### 18.5 What If a Consumer Fails?

Suppose the analytics consumer fails.

The order is still successfully committed.

The event remains available for retry, depending on the broker and delivery design.

Analytics may be delayed, but the customer does not need to lose a valid order because a reporting system is temporarily unavailable.

This is an important benefit of separating the transactional system from downstream consumers.

### 18.6 Final Workflow

<escape>`text
                    CUSTOMER
                        |
                        v
                   ORDER API
                        |
                        v
                    POSTGRES
                        |
               +--------+--------+
               |                 |
               v                 v
          Inventory          Create Order
          Reservation             |
               |                  |
               +--------+---------+
                        |
                        v
                 Outbox Event
                        |
                      COMMIT
                        |
                        v
                  Payment Workflow
                        |
                        v
                 Payment Provider
                        |
                        v
                Payment Result
                        |
                        v
                   POSTGRES
                        |
                        v
                 Payment Event
                        |
                        v
                  MESSAGE BROKER
                        |
             +----------+-----------+
             |          |           |
             v          v           v
          Search    Analytics   Notifications
          Consumer  Consumer    Consumer
             |          |           |
             v          v           v
        Search DB   Warehouse    Email/SMS
</escape>`</escape>

This design separates transactional correctness from asynchronous downstream processing.

---

## 19. Important Patterns to Remember

| Pattern                   | Problem it addresses                                 | Main idea                                                   |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| Polyglot persistence      | Different workloads need different data capabilities | Use specialized databases with clear responsibilities       |
| System of record          | Conflicting authoritative data                       | Define one authoritative owner for each data domain         |
| Event-driven architecture | Tight coupling between components                    | Communicate through events                                  |
| Transactional outbox      | Database write succeeds but event publication fails  | Commit business data and event record together              |
| Change Data Capture       | Capturing database changes for downstream systems    | Read committed changes from database logs or change streams |
| Eventual consistency      | Asynchronous copies are temporarily stale            | Allow propagation delay where business requirements permit  |
| Idempotent consumer       | Duplicate event delivery                             | Make repeated processing safe                               |
| Versioning                | Old events overwrite newer state                     | Track entity versions and reject stale updates              |
| Retry with backoff        | Temporary downstream failures                        | Retry without overwhelming the failing system               |
| Dead-letter queue         | Repeatedly failing messages                          | Isolate messages for investigation and controlled replay    |
| Cache-aside               | Repeated expensive reads                             | Cache results and retrieve from the source on a cache miss  |
| Distributed tracing       | Difficult cross-system debugging                     | Trace a workflow using shared identifiers                   |

---

## 20. Common Interview Questions

### Beginner Level

**Q1. What is polyglot persistence?**

Answer:

Polyglot persistence is an architectural approach in which an application uses multiple database technologies, selecting each database according to the workload and data requirements.

For example, PostgreSQL for transactions, Redis for caching, and Elasticsearch for search.

**Q2. What is a system of record?**

Answer:

The authoritative source of truth for a particular category of business data.

For example, PostgreSQL may own product and order data while Elasticsearch maintains a derived search representation.

**Q3. What is eventual consistency?**

Answer:

It is a consistency model in which replicas or derived representations may temporarily differ but are expected to converge after changes are successfully propagated.

**Q4. What is CDC?**

Answer:

Change Data Capture is a technique for capturing changes made to a database and making them available to downstream systems.

**Q5. What is a message broker?**

Answer:

A message broker transports messages between producers and consumers, allowing components to communicate asynchronously.

### Intermediate Level

**Q6. What is the dual-write problem?**

Answer:

The dual-write problem occurs when an application writes to multiple independent systems and one write succeeds while another fails.

This can leave the systems inconsistent.

**Q7. How does the transactional outbox pattern solve the dual-write problem?**

Answer:

It stores the business change and the event record in the same database transaction.

A separate worker publishes the event to a broker.

This prevents the application from losing the intention to publish an event when the database transaction commits.

**Q8. Does the transactional outbox guarantee exactly-once message delivery?**

Answer:

No.

An event can be published successfully and then published again if the worker crashes before recording that publication completed.

Consumers must handle duplicate delivery safely.

**Q9. What is the difference between CDC and the transactional outbox?**

Answer:

- CDC captures committed database changes.
- The outbox explicitly stores application events in the same transaction as business data.

CDC generally captures database-level changes, while outbox events can express business-level meaning.

**Q10. Why should Elasticsearch usually not be the source of truth for orders?**

Answer:

Elasticsearch is optimized for search and retrieval rather than serving as the primary transactional authority for order and payment state.

A transactional database is generally more appropriate for authoritative business records.

### Advanced Level

**Q11. How would you prevent duplicate event processing?**

Answer:

Use a unique event ID and maintain an idempotency or processed-event record.

Apply the destination update and processed-event record atomically where possible.

**Q12. How would you handle out-of-order events?**

Answer:

Use entity-level sequence numbers or versions, route related events consistently where supported, and reject updates older than the current destination version.

**Q13. What happens if Elasticsearch is unavailable for 30 minutes?**

Answer:

The consumer should stop acknowledging messages that have not been processed successfully, or use an equivalent durable retry strategy.

The broker should retain the events according to its configuration.

After recovery, consumers process the backlog. Consumer lag and indexing latency should be monitored.

**Q14. How would you rebuild a corrupted search index?**

Answer:

Recreate the index from the authoritative source database using a controlled bulk backfill.

Capture concurrent changes and apply them after or during the snapshot using a reliable change-stream position, so updates are not lost or overwritten.

**Q15. How would you maintain consistency between PostgreSQL and Redis?**

Answer:

Use cache-aside, explicit invalidation, TTLs, or event-driven invalidation.

For critical values, consult the authoritative database or use a path that satisfies the required consistency guarantees.

**Q16. How would you synchronize PostgreSQL with a data warehouse?**

Answer:

Use CDC or an event pipeline for incremental ingestion, or batch ETL/ELT where delayed updates are acceptable.

The warehouse should be treated as an analytical representation rather than the authoritative transactional database.

**Q17. Why is global event ordering difficult in distributed systems?**

Answer:

Events may be processed across multiple partitions, workers, and network paths.

Many brokers guarantee ordering only within a partition or another limited scope.

Applications should use entity-level ordering and version checks when correctness requires it.

**Q18. What are the biggest challenges of polyglot persistence?**

Answer:

- Data synchronization.
- Eventual consistency.
- Duplicate events.
- Event ordering.
- Schema evolution.
- Failure recovery.
- Monitoring.
- Operational complexity.
- Infrastructure cost.
- Clear ownership of business data.

---

## 21. Practical Exercises

### Exercise 1: Design an E-Commerce Architecture

Design an architecture for the following requirements:

```text
Users:
  10 million registered users

Products:
  5 million product records

Orders:
  50,000 orders per day

Features:
  - User registration
  - Product search
  - Shopping cart
  - Payments
  - Inventory
  - Order history
  - Sales analytics
```

Answer:

1. Which database owns users?
2. Which database owns orders?
3. Where should payment records live?
4. Which database should power product search?
5. Where should shopping cart data live?
6. How should analytics data be generated?
7. How will databases be synchronized?
8. Which data can tolerate eventual consistency?
9. Which operations require stronger consistency?

### Exercise 2: Identify the Dual-Write Problem

Analyze this code:

```javascript
async function createOrder(orderData) {
  const order = await Order.create(orderData);

  await kafka.publish({
    type: "ORDER_CREATED",
    orderId: order.id,
  });

  return order;
}
```

Questions:

1. What happens if Kafka is unavailable?
2. What happens if the application crashes after publishing?
3. Can the event be delivered twice?
4. How would you redesign this using the transactional outbox pattern?

### Exercise 3: Implement an Outbox

Create two PostgreSQL tables:

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL
);

CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id BIGINT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);
```

Implement:

1. An Express order creation endpoint.
2. A PostgreSQL transaction.
3. Order insertion.
4. Outbox event insertion.
5. A background worker.
6. Event publishing.
7. Retry handling.
8. Duplicate-safe consumer processing.

### Exercise 4: Handle Out-of-Order Events

Suppose you receive:

```json
{
  "productId": "P101",
  "version": 3,
  "price": 65000
}
```

Then later receive:

```json
{
  "productId": "P101",
  "version": 2,
  "price": 70000
}
```

Questions:

1. Which update should be applied?
2. Why?
3. How would you implement the version check?
4. What happens if two consumers update the same product concurrently?

### Exercise 5: Failure Scenario Analysis

For each failure, identify the problem and recovery strategy.

| Failure                                         | What should happen? |
| ----------------------------------------------- | ------------------- |
| PostgreSQL commits, but event publisher is down | ?                   |
| Broker delivers the same event twice            | ?                   |
| Elasticsearch is unavailable                    | ?                   |
| Consumer crashes after updating destination     | ?                   |
| Old event arrives after a newer event           | ?                   |
| Search index is accidentally deleted            | ?                   |
| Redis invalidation fails                        | ?                   |
| Event schema changes                            | ?                   |

### Exercise 6: Draw the Complete Architecture

Draw an architecture containing:

- Node.js / Express.
- PostgreSQL.
- Redis.
- Elasticsearch.
- Kafka or another message broker.
- CDC or transactional outbox.
- Data warehouse.
- Background workers.

For each component, explain:

1. What data does it own?
2. What data does it receive?
3. What happens if it becomes unavailable?
4. How is it recovered?
5. How is its correctness monitored?

---

## 22. Final Summary: Polyglot Persistence in Production

Polyglot persistence is about selecting and combining databases to serve different application workloads.

A practical architecture may use:

```text
PostgreSQL:
  Authoritative transactional data.

Redis:
  Cache and low-latency key-value operations.

Elasticsearch:
  Searchable data representation.

Data Warehouse:
  Analytical data.
```

But using multiple databases creates new engineering responsibilities.

You must solve:

1. **Data ownership:** Which database is authoritative?
2. **Synchronization:** How do changes reach other systems?
3. **Dual writes:** What happens when one write succeeds and another fails?
4. **CDC:** How can database changes be captured reliably?
5. **Transactional outbox:** How can business changes and event records be committed together?
6. **Eventual consistency:** Which data can tolerate propagation delay?
7. **Idempotency:** How can duplicate events be processed safely?
8. **Ordering:** How can stale events be prevented from overwriting newer data?
9. **Retries and DLQs:** How can failures be recovered?
10. **Schema evolution:** How can producers and consumers change independently?
11. **Observability:** How can failures be traced across multiple systems?
12. **Operations:** How can the additional infrastructure be maintained?

### Five rules to remember

**Rule 1: Define ownership.**

Every important business data domain needs a clearly defined authoritative source.

**Rule 2: Avoid unsafe dual writes.**

Use a reliable event propagation mechanism such as the transactional outbox or CDC when appropriate.

**Rule 3: Design for duplicate delivery.**

Assume events may be delivered more than once. Build idempotent consumers.

**Rule 4: Protect business correctness.**

Do not use eventually consistent search indexes or caches as the final authority for critical payment, inventory, or order decisions.

**Rule 5: Control architectural complexity.**

Every additional database must provide enough value to justify its operational and synchronization costs.
