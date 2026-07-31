---
sidebar_label: Wide-Column Databases: When to Use and When Not to Use
sidebar_position: 1
---

# Wide-Column Databases: When to Use and When Not to Use

## 1. Introduction

**When should we actually choose a wide-column database, and when should we avoid it?**

Understanding how Cassandra or HBase works is not enough. A backend engineer must understand whether a database is suitable for a particular workload.

For example, imagine you are building an e-commerce platform.

You have several types of data:

| Data                 | Typical access pattern                   |
| -------------------- | ---------------------------------------- |
| Users                | Find user by ID or email                 |
| Products             | Search, filter, sort products            |
| Orders               | Find orders by user, update order status |
| Payments             | Transactional payment processing         |
| User activity events | Continuously ingest millions of events   |
| Application logs     | Write and retrieve large volumes of logs |
| Product analytics    | Run aggregations over large datasets     |
| Shopping cart cache  | Fast key-based reads and writes          |

Would you use Cassandra for all of these?

No. That would be a poor architectural decision.

A wide-column database is designed for particular distributed data workloads. It is not a universal replacement for relational, document, key-value, or analytical databases.

---

# 2. Core Strengths of Wide-Column Databases

Let's understand where wide-column databases are particularly useful.

## 2.1 Horizontal Scalability

One of the biggest strengths of wide-column databases is their ability to distribute data across multiple machines.

Suppose your application receives:

- 10 million events per day.
- 100 million events per day.
- 1 billion events per day.

A single database server may eventually become a bottleneck.

A distributed wide-column database can partition data across multiple nodes.

Example:

```text
             Application
                  |
                  v
           Cassandra Cluster
                  |
       +----------+----------+
       |          |          |
       v          v          v
    Node 1     Node 2     Node 3
       |          |          |
    Partitions Partitions Partitions
```

As the workload grows, you can add more nodes and redistribute data.

This can increase:

- Storage capacity.
- Aggregate write throughput.
- Aggregate read throughput.
- Cluster processing capacity.

**Important:** Adding nodes does not guarantee perfectly linear performance improvements. Replication traffic, partition distribution, network bandwidth, disk I/O, and coordination overhead all matter.

## 2.2 High Write Throughput

Wide-column databases such as Cassandra use an LSM-tree-oriented storage architecture.

A simplified write path:

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
Commit Log
    |
    v
Memtable
    |
    v
SSTable
```

Writes are initially handled through memory and sequential disk-oriented operations rather than requiring every update to modify an existing on-disk B-tree structure.

This architecture is useful for workloads involving:

- Continuous event ingestion.
- IoT sensor readings.
- Application telemetry.
- User activity tracking.
- Large-scale logging.

However, high write throughput does not mean every write is free or equally efficient. Replication, consistency levels, compaction, disk capacity, and partition design still affect performance.

## 2.3 Distributed Replication and Availability

Cassandra distributes replicas across nodes.

For example:

```text
Replication Factor = 3

Partition P1:

Node A -> Replica
Node B -> Replica
Node C -> Replica
```

If one node becomes unavailable, the remaining replicas may continue serving requests, depending on the configured consistency level and the availability of the required replicas.

Cassandra also supports replication across data centers.

This is useful when an application needs to serve geographically distributed users.

**Remember:**

Replication improves availability and resilience. It does not replace backups.

A replicated accidental deletion can propagate to other replicas.

## 2.4 Predictable Query Performance for Known Access Patterns

Wide-column databases work particularly well when application queries are known in advance.

Suppose an application needs these queries:

1. Find all events for a user.
2. Find a user's events for a particular day.
3. Find the latest events for a campaign.

You can create tables specifically designed for these queries.

For example:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_date DATE,
    event_time TIMESTAMP,
    event_type TEXT,
    event_data TEXT,
    PRIMARY KEY ((user_id, event_date), event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

The partition key is:

```text
(user_id, event_date)
```

The clustering column is:

```text
event_time
```

This allows the application to retrieve events for a particular user and date in time order.

The key principle:

**Design the data model around the queries the application must execute.**

This is different from designing a normalized relational model first and then writing arbitrary queries against it.

## 2.5 Handling Large Datasets

Wide-column databases are designed to distribute large datasets across multiple machines.

They are useful when data grows beyond what is practical to keep on a single database server.

Examples include:

- Billions of application events.
- Large IoT telemetry datasets.
- Historical user activity.
- Distributed messaging metadata.
- High-volume tracking information.

But large dataset size alone is not a reason to choose Cassandra.

A database should be selected based on access patterns, write/read characteristics, consistency requirements, query requirements, and operational capabilities.

---

# 3. Limitations and Tradeoffs

The strengths of wide-column databases come with tradeoffs.

## 3.1 Query-First Data Modeling

In a relational database, you can normalize data into multiple tables and use JOINs to retrieve related information.

For example:

```sql
SELECT
    users.name,
    orders.order_id,
    orders.total_amount
FROM users
JOIN orders
    ON users.id = orders.user_id;
```

This is a normal relational query.

Cassandra does not provide this kind of arbitrary relational JOIN capability in its normal query model.

Instead, you design tables around individual queries.

For example:

```text
users_by_id
orders_by_user
orders_by_status
```

The same logical information may be stored in multiple tables.

This is called **denormalization**.

### Why is this a limitation?

Suppose a user changes their name.

If their name is duplicated across multiple query-specific tables, the application may need to update multiple records.

```text
users_by_id
    |
    +-- User name

orders_by_user
    |
    +-- User name

user_activity
    |
    +-- User name
```

Keeping duplicated information consistent becomes an application responsibility.

This increases write complexity and the possibility of inconsistent data.

## 3.2 Limited Ad-Hoc Query Flexibility

Relational databases support flexible filtering, JOINs, grouping, sorting, and complex queries.

Cassandra queries must generally align with the table's primary-key design.

For example, if the primary key is:

```sql
PRIMARY KEY ((user_id, event_date), event_time)
```

A query filtering by `user_id` and `event_date` is aligned with the partition key.

```sql
SELECT *
FROM user_events
WHERE user_id = ?
AND event_date = ?;
```

But asking for every user's events for an arbitrary event type is not naturally supported by that table design.

You may need another table designed for that access pattern.

**Key takeaway:** Cassandra is not designed to be a general-purpose ad-hoc query engine.

## 3.3 Denormalization Increases Storage and Write Complexity

Suppose you have three query requirements:

```text
Query 1: Find orders by user.
Query 2: Find orders by status.
Query 3: Find recent orders by date.
```

You might create:

```text
orders_by_user
orders_by_status
orders_by_date
```

The same order can appear in all three tables.

Advantages:

- Queries can access data efficiently.
- Joins are avoided.
- Tables are optimized for their specific access patterns.

Disadvantages:

- Duplicate storage.
- Multiple writes for one logical change.
- More complex failure handling.
- Potentially inconsistent copies.
- More complicated schema evolution.

You are trading storage and write simplicity for predictable query access.

## 3.4 Consistency Requires Deliberate Configuration

Cassandra offers tunable consistency levels.

For example:

```text
Replication Factor = 3

ONE
QUORUM
ALL
```

With a replication factor of 3:

| Consistency level | Required replica acknowledgements |
| ----------------- | --------------------------------: |
| ONE               |                                 1 |
| QUORUM            |                                 2 |
| ALL               |                                 3 |

The quorum formula is:

\[
QUORUM = \left\lfloor \frac{RF}{2} \right\rfloor + 1
\]

For RF = 3:

\[
QUORUM = \left\lfloor \frac{3}{2} \right\rfloor + 1 = 2
\]

A higher consistency level can provide stronger guarantees for an operation, but may reduce availability or increase latency when replicas are unavailable or slow.

### Important distinction

Cassandra consistency levels are not the same as PostgreSQL transaction isolation levels.

For example:

- PostgreSQL `READ COMMITTED` controls transaction visibility.
- Cassandra `QUORUM` controls how many replicas must respond successfully for an operation.

They solve different problems.

Also, `R + W > RF` can create overlap between read and write replica sets under suitable assumptions. It does not automatically guarantee universal linearizability or serializable transactions.

## 3.5 Partition Design Is Critical

A poor partition key can create hotspots or oversized partitions.

Example:

```sql
PRIMARY KEY (event_date, user_id)
```

If every application event uses the same date as its partition key, all events for that date may be concentrated in one logical partition.

A very popular partition can become a bottleneck.

A more deliberate design might be:

```sql
PRIMARY KEY ((user_id, event_date), event_time)
```

This distributes data across user-and-date combinations.

However, this design also has tradeoffs. A user with an extremely high event volume can still generate a large partition.

Partition size, data distribution, and query requirements must be evaluated together.

## 3.6 Compaction and Tombstones Add Operational Costs

Cassandra's LSM-based storage architecture uses SSTables and background compaction.

Compaction:

- Merges SSTables.
- Removes obsolete versions when safe.
- Reclaims eligible deleted data.
- Creates new SSTables.

This consumes disk I/O, CPU, and temporary disk space.

Deletes create tombstones rather than immediately removing the data from all storage files.

If tombstones accumulate excessively, reads can become slower and compaction can become more expensive.

A production cluster requires monitoring of:

- Tombstone density.
- Compaction backlog.
- Pending compactions.
- Disk utilization.
- Read latency.
- Repair status.

**Important:** Tombstone cleanup must respect the cluster's repair and garbage-collection safety requirements. Reducing tombstones too aggressively can risk deleted data reappearing from an unrepaired replica.

---

# 4. Cassandra vs HBase

Both Cassandra and HBase are wide-column databases, but their architectures and operating models differ.

## 4.1 Cassandra Architecture

Cassandra uses a peer-to-peer architecture.

```text
             Application
                  |
                  v
              Node A
                  |
       +----------+----------+
       |          |          |
       v          v          v
     Node A     Node B     Node C
       |          |          |
    Partitions Partitions Partitions
```

There is no traditional single master that coordinates every operation.

Nodes can participate in request coordination, and data is distributed across the cluster.

Key characteristics:

- Peer-to-peer architecture.
- Partitioning and replication.
- Tunable consistency.
- CQL query interface.
- LSM-oriented storage.
- Multi-data-center replication support.

## 4.2 HBase Architecture

HBase is modeled after Google's Bigtable architecture and commonly runs on top of HDFS.

Its architecture includes:

- HMaster.
- RegionServers.
- Regions.
- HDFS.
- ZooKeeper in traditional deployments.

Simplified architecture:

```text
               Application
                    |
                    v
                 HBase
                    |
              +-----+-----+
              |           |
              v           v
           HMaster    ZooKeeper
              |
       +------+------+
       |             |
       v             v
  RegionServer A  RegionServer B
       |             |
       v             v
     Regions       Regions
       |             |
       +------+------+
              |
              v
             HDFS
```

HMaster handles cluster-level coordination and administrative responsibilities.

RegionServers serve data requests for the regions they host.

HBase provides strong consistency for row-level operations.

## 4.3 Comparison

| Feature                  | Cassandra                                    | HBase                                                  |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| Architecture             | Peer-to-peer                                 | HMaster and RegionServers                              |
| Storage model            | Wide-column tables                           | Wide-column key/value model                            |
| Storage foundation       | Local SSTables on nodes                      | Commonly HDFS                                          |
| Data distribution        | Consistent hashing / token ranges            | Regions and region assignment                          |
| Consistency              | Tunable consistency                          | Strong consistency for row operations                  |
| Query interface          | CQL                                          | Java API, REST and other integrations                  |
| Joins                    | No arbitrary relational joins                | No arbitrary relational joins                          |
| Multi-data-center design | Built-in replication mechanisms              | Depends on deployment and replication architecture     |
| Ecosystem                | Cassandra ecosystem                          | Hadoop ecosystem                                       |
| Typical fit              | Distributed, always-on operational workloads | Large-scale data workloads integrated with Hadoop/HDFS |

### When would you choose Cassandra?

Choose Cassandra when:

- You need a distributed, highly available operational database.
- Your application has predictable query patterns.
- You need high write throughput.
- You want built-in multi-data-center replication capabilities.
- Your team understands Cassandra's partitioning and operational requirements.

### When would you choose HBase?

Choose HBase when:

- Your architecture is already integrated with Hadoop and HDFS.
- You need a distributed table store with row-level consistency.
- You have large-scale data workloads that fit HBase's access model.
- Your organization has experience operating the HBase ecosystem.

**Do not treat Cassandra and HBase as interchangeable products.** Their storage foundations, consistency models, architecture, and operational requirements differ.

---

# 5. Wide-Column vs Relational Databases

Let's compare Cassandra with PostgreSQL.

| Feature           | PostgreSQL                                                       | Cassandra                                                 |
| ----------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| Database type     | Relational                                                       | Wide-column NoSQL                                         |
| Data model        | Tables, rows, columns                                            | Partitioned wide-column tables                            |
| Schema            | Defined schema                                                   | Defined table schema                                      |
| Relationships     | Foreign keys and relationships                                   | Usually modeled through application-level access patterns |
| JOINs             | Supported                                                        | No arbitrary relational JOINs                             |
| Transactions      | Full ACID transaction support                                    | Different transaction and consistency capabilities        |
| Query flexibility | High                                                             | Query patterns constrained by data model                  |
| Scaling           | Vertical scaling, replication, partitioning, distributed options | Designed for distributed horizontal scaling               |
| Write workload    | Strong transactional capabilities                                | Particularly suitable for high-volume distributed writes  |
| Consistency       | Strong transactional guarantees                                  | Tunable consistency                                       |
| Best fit          | Transactional business data                                      | Distributed high-volume operational data                  |

## 5.1 Example: E-commerce Orders

Consider an order-processing system.

An order may involve:

- User information.
- Products.
- Inventory.
- Payment.
- Shipping.
- Refunds.

These entities have relationships and business constraints.

For example:

```text
Order
  |
  +-- User
  |
  +-- Order Items
  |      |
  |      +-- Product
  |
  +-- Payment
  |
  +-- Shipment
```

A relational database is a natural fit because you need:

- Referential integrity.
- Transactions.
- Consistent updates.
- Relationships.
- Flexible queries.

PostgreSQL is often a better choice for the core order and payment workflow.

Now consider recording every user interaction:

```text
User viewed product
User clicked campaign
User opened page
User added product to wishlist
User searched for product
```

This could generate millions of events.

A wide-column database may be a better fit for the event-ingestion workload if its access patterns and scale requirements match Cassandra's model.

### Architectural conclusion

Do not replace PostgreSQL with Cassandra just because your application has high traffic.

Use each database for the workload it handles well.

---

# 6. Wide-Column vs Document Databases

Now compare Cassandra with MongoDB.

| Feature                | MongoDB                                                   | Cassandra                                        |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| Data model             | Documents                                                 | Wide-column tables                               |
| Storage representation | BSON documents                                            | Partitioned rows and columns                     |
| Schema                 | Flexible, validation optional                             | Defined table schema                             |
| Nested structures      | Natural support                                           | Not a general document model                     |
| Query model            | Document-oriented queries                                 | Partition-key and clustering-oriented queries    |
| Indexing               | Multiple index types                                      | More constrained indexing model                  |
| Joins                  | `$lookup` available                                       | No arbitrary relational joins                    |
| Transactions           | Single-document atomicity and multi-document transactions | Different transactional capabilities             |
| Horizontal scaling     | Sharding                                                  | Partitioning and replication                     |
| Typical fit            | Document-shaped application data                          | High-volume distributed query-specific workloads |

## 6.1 Example: Campaign Platform

Imagine you are building a campaign platform.

A campaign document might look like:

```json
{
  "_id": "campaign_101",
  "name": "Summer Rewards",
  "status": "active",
  "configuration": {
    "startDate": "2026-11-01",
    "endDate": "2026-11-30"
  },
  "prizes": [
    {
      "name": "Gift Box",
      "quantity": 100
    },
    {
      "name": "Cap",
      "quantity": 200
    }
  ]
}
```

MongoDB naturally represents this structure.

It is useful when:

- Data contains nested objects.
- Application entities have flexible attributes.
- The application retrieves and updates documents.
- Queries need document-level filtering and indexing.

Now suppose the platform records 500 million gameplay events.

```text
User 101 -> Game Started
User 101 -> Game Completed
User 102 -> Game Started
User 103 -> Game Completed
...
```

If the workload requires extremely high write throughput and predictable queries by user, campaign, and time bucket, Cassandra may be worth evaluating.

### Architectural conclusion

MongoDB is a natural fit for document-shaped application entities.

Cassandra is a candidate for high-volume distributed operational data with known query patterns.

Neither is automatically faster or better. The workload determines the choice.

---

# 7. Wide-Column vs Key-Value Databases

A key-value database stores information using a key and its associated value.

For example, Redis:

```text
Key: user:101
Value: {"name":"Prashant","role":"developer"}
```

A wide-column database has a richer partitioned table model.

| Feature           | Key-value                 | Wide-column                                            |
| ----------------- | ------------------------- | ------------------------------------------------------ |
| Basic model       | Key -> Value              | Partitioned rows and columns                           |
| Access            | Primarily by key          | Partition key and clustering columns                   |
| Query flexibility | Usually limited           | Structured queries within data-model constraints       |
| Data organization | Keys and values           | Tables, partitions, rows, columns                      |
| Common use        | Cache, sessions, counters | Event storage, telemetry, distributed operational data |
| Example           | Redis                     | Cassandra                                              |

## 7.1 Example: User Sessions

Suppose a backend needs to store user sessions.

```text
session:abc123 -> user_id:101
session:def456 -> user_id:102
```

The application primarily needs to retrieve a session using its key.

Redis is a natural fit.

Using Cassandra for this simple workload may introduce unnecessary operational complexity.

## 7.2 Example: User Activity History

Now consider:

```text
Find all events for user 101 on 14 November.
Return the latest 100 events.
```

This is a structured query over partitioned data.

A wide-column model may be more suitable than a simple key-value model, depending on throughput, retention, and query requirements.

**Key takeaway:** Key-value databases optimize simple key-based access. Wide-column databases support a richer partitioned data model for known query patterns.

---

# 8. Operational Complexity

This is one of the most important sections for backend engineers.

A database that performs well in a benchmark can still be a poor choice if your team cannot operate it reliably.

Cassandra is a distributed database. Operating it requires understanding more than CRUD operations.

## 8.1 Cluster Sizing

You must estimate:

- Total data volume.
- Write throughput.
- Read throughput.
- Replication factor.
- Network capacity.
- Disk capacity.
- CPU requirements.
- Growth rate.
- Compaction overhead.

Example:

Suppose:

```text
Daily incoming data = 100 GB
Retention period = 30 days
Replication factor = 3
```

Logical retained data:

\[
100 \times 30 = 3000\ GB
\]

Approximate replicated data:

\[
3000 \times 3 = 9000\ GB
\]

This is approximately 9 TB before accounting for:

- Compression.
- Compaction temporary space.
- Operational headroom.
- Backups.
- Snapshots.
- Metadata and other storage overhead.

Do not size a production cluster using only logical application data size.

## 8.2 Monitoring

A production Cassandra cluster needs monitoring for:

| Metric                      | Why it matters                             |
| --------------------------- | ------------------------------------------ |
| Read latency                | Detects slow read operations               |
| Write latency               | Detects write bottlenecks                  |
| Pending compactions         | Indicates compaction backlog               |
| Disk utilization            | Prevents storage exhaustion                |
| CPU utilization             | Detects processing bottlenecks             |
| Heap and garbage collection | Detects memory pressure                    |
| Dropped messages            | Indicates overloaded or delayed processing |
| Tombstones                  | Can degrade read performance               |
| Node availability           | Detects failed or unreachable nodes        |
| Repair status               | Helps maintain replica consistency         |

Monitoring only whether the application server is running is insufficient.

You must monitor the database cluster itself.

## 8.3 Repair Operations

Cassandra replicas can become inconsistent due to node failures, network problems, or missed updates.

Repair operations help synchronize replica data.

Important mechanisms:

- **Hinted handoff:** Stores hints for unavailable replicas and attempts to deliver missed mutations later.
- **Read repair:** Can reconcile replica differences during certain read paths, depending on the version and configuration.
- **Anti-entropy repair:** Compares replica data and repairs inconsistencies using mechanisms such as Merkle trees.

These mechanisms have different roles.

Hinted handoff is not a replacement for regular repair.

## 8.4 Backup and Recovery

Replication is not backup.

Suppose an application accidentally deletes a large number of records.

If the deletion is replicated, the replicas can all reflect the deletion.

A backup provides a separate recovery point.

A production backup strategy should define:

- Backup frequency.
- Retention period.
- Recovery point objective (RPO).
- Recovery time objective (RTO).
- Restore testing.
- Off-cluster or otherwise protected backup storage.

A backup that has never been restored successfully is not a proven recovery strategy.

## 8.5 Compaction Management

Compaction merges SSTables.

It can cause:

- Increased disk I/O.
- CPU usage.
- Temporary disk-space requirements.
- Write amplification.
- Performance fluctuations.

The compaction strategy must match the workload.

For example:

- TimeWindowCompactionStrategy (TWCS) can suit time-series workloads with time-oriented SSTable windows.
- SizeTieredCompactionStrategy (STCS) is commonly used for write-heavy workloads with similarly sized SSTables.
- LeveledCompactionStrategy (LCS) can offer more predictable read behavior at the cost of additional write amplification.

The right choice depends on the workload and Cassandra version.

## 8.6 Schema and Data Model Changes

In Cassandra, changing a table's primary-key design is not equivalent to changing an ordinary relational column.

A different access pattern may require:

1. A new table.
2. Backfilling existing data.
3. Updating application writes.
4. Validating the new query path.
5. Migrating reads.
6. Retiring the old table when safe.

This means data modeling decisions have long-term consequences.

## 8.7 Multi-Data-Center Operations

Multi-data-center deployments introduce additional concerns:

- Network latency.
- Replication traffic.
- Consistency levels.
- Failure handling.
- Data-center topology.
- Capacity planning.
- Recovery procedures.

Cross-data-center replication is not free.

You must design the application around the actual consistency and latency guarantees required by the workload.

---

# 9. Database Selection Checklist

Before choosing a wide-column database, answer these questions.

## 9.1 Workload Questions

| Question                                   | What it tells you                                      |
| ------------------------------------------ | ------------------------------------------------------ |
| Do I have very high write throughput?      | Whether write-optimized distributed storage may help   |
| Is my dataset extremely large?             | Whether distributed storage is necessary               |
| Are query patterns predictable?            | Whether query-first modeling is practical              |
| Do I need horizontal scaling?              | Whether a distributed architecture is appropriate      |
| Do I need multi-data-center replication?   | Whether the database's replication model fits          |
| Do I need arbitrary JOINs?                 | Whether a relational model is more appropriate         |
| Do I need complex transactions?            | Whether transactional relational storage is preferable |
| Do I need flexible nested documents?       | Whether a document database is more suitable           |
| Do I need simple key-based retrieval?      | Whether a key-value database is enough                 |
| Can my team operate a distributed cluster? | Whether operational complexity is manageable           |

## 9.2 Decision Tree

```text
                  Start
                    |
                    v
       Do you need relational transactions?
                    |
             +------+------+
             |             |
            Yes            No
             |             |
             v             v
         PostgreSQL    Is data document-shaped?
                           |
                     +-----+-----+
                     |           |
                    Yes          No
                     |           |
                     v           v
                  MongoDB   Is access primarily
                            key-based?
                                |
                          +-----+-----+
                          |           |
                         Yes          No
                          |           |
                          v           v
                        Redis   Is workload distributed,
                                high-volume, and query-
                                pattern driven?
                                      |
                                +-----+-----+
                                |           |
                               Yes          No
                                |           |
                                v           v
                            Cassandra   Evaluate other
                                or       database types
                              HBase
```

This is a starting point, not an automatic selection algorithm.

Real architecture decisions also depend on latency, consistency, data volume, operational expertise, cost, ecosystem, and migration constraints.

---

# 10. Real-World Architecture Decisions

Let's apply the concepts to backend systems.

## 10.1 Campaign Platform Architecture

Suppose you are building a consumer-facing campaign platform.

It includes:

- User registration.
- Campaign configuration.
- Gameplay.
- Score submission.
- Winner allocation.
- Analytics.
- Event tracking.

A possible architecture:

```text
                 Frontend
                    |
                    v
              Node.js API
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
    PostgreSQL   MongoDB      Redis
        |           |           |
        |           |           |
        v           v           v
    Users and   Campaign     Sessions and
    payments    documents    temporary data

                    |
                    v
               Event Queue
                    |
                    v
               Cassandra
                    |
                    v
             Event History
```

Possible responsibilities:

| Component           | Responsibility                                               |
| ------------------- | ------------------------------------------------------------ |
| PostgreSQL          | Transactional orders, payments, and relational business data |
| MongoDB             | Campaign configuration and document-shaped application data  |
| Redis               | Sessions, caching, temporary state, and rate limiting        |
| Cassandra           | High-volume event history, if workload justifies it          |
| Analytical database | Reporting and large-scale aggregations, if required          |

This is an example of polyglot persistence: using multiple databases for different workloads.

Do not add Cassandra just because the architecture diagram looks more advanced.

If MongoDB or PostgreSQL can comfortably handle the event workload, adding another database may create more problems than it solves.

## 10.2 E-commerce Architecture

Consider an e-commerce application.

```text
                 E-commerce API
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
    PostgreSQL       Redis         MongoDB
        |              |              |
        v              v              v
    Orders and      Cache and      Product
    Payments        Sessions       Catalog

                       |
                       v
                  Event Queue
                       |
                       v
                   Cassandra
                       |
                       v
                User Activity
                and Event History
```

Why this separation?

- Orders and payments need transactional guarantees.
- Sessions need fast key-based retrieval.
- Product information may fit a document model.
- User activity events may need high-volume distributed ingestion.

The key is workload separation, not database variety.

## 10.3 IoT Telemetry Architecture

Suppose you have 1 million devices.

Each device sends a reading every 10 seconds.

Approximate events per second:

\[
\frac{1,000,000}{10} = 100,000
\]

That is 100,000 incoming readings per second, assuming all devices report evenly.

A possible architecture:

```text
          IoT Devices
               |
               v
        Message Broker
               |
               v
        Ingestion Service
               |
               v
        Cassandra Cluster
               |
               v
        Historical Read APIs
```

Cassandra may be suitable when:

- Writes are continuous.
- Data is partitioned by device and time.
- Queries are predictable.
- Distributed availability is important.

However, if the main requirement is analytical aggregation across huge time ranges, a columnar analytical database or specialized time-series system may be a better fit.

---

# 11. Common Mistakes and Misconceptions

| Misconception                                                       | Correct understanding                                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Wide-column databases are just relational tables with many columns. | They use a different partitioned data model and query approach.                        |
| Cassandra is always faster than PostgreSQL.                         | Performance depends on workload and data model.                                        |
| More nodes always mean proportionally more throughput.              | Replication, coordination, hotspots, and network overhead affect scaling.              |
| Cassandra supports arbitrary SQL queries.                           | CQL is SQL-like but has important query-model restrictions.                            |
| Replication means data is backed up.                                | Replication and backup solve different problems.                                       |
| QUORUM means serializable transactions.                             | Quorum is a replica acknowledgement policy, not a general transaction isolation level. |
| Cassandra never has consistency problems.                           | Replica divergence and repair requirements still exist.                                |
| Hinted handoff replaces repair.                                     | Hints and anti-entropy repair have different purposes.                                 |
| Deletes immediately remove data from disk.                          | Tombstones represent deletes; physical cleanup occurs later.                           |
| Cassandra is suitable for every high-traffic application.           | Traffic volume alone is insufficient to justify Cassandra.                             |
| Cassandra and HBase are identical.                                  | They have different architectures, storage foundations, and consistency models.        |
| Denormalization is always better.                                   | It improves certain reads but adds storage and write complexity.                       |

---

# 12. Interview Questions and Answers

## Q1. What is a wide-column database?

A wide-column database is a NoSQL database that organizes data into partitioned rows and columns. It is designed for distributed storage and access patterns that fit its data model.

Examples include Apache Cassandra and Apache HBase.

## Q2. Why does Cassandra use denormalization?

Cassandra does not provide arbitrary relational JOINs as part of its normal query model.

Instead, tables are designed around application queries.

Denormalization allows the database to serve those queries efficiently without requiring relational joins.

The tradeoff is duplicated data and more complex write coordination.

## Q3. Why is Cassandra suitable for write-heavy workloads?

Cassandra uses an LSM-oriented storage architecture.

Writes are initially recorded through a commit log and memtable, then flushed into immutable SSTables.

This architecture can support high write throughput, especially for workloads with predictable partition-based access patterns.

## Q4. What is the difference between partition keys and clustering columns?

**Partition key:**

- Determines the partition.
- Determines how data is distributed across the cluster.
- Defines which rows are grouped together.

**Clustering columns:**

- Determine the ordering of rows within a partition.
- Help define the row's primary-key identity.
- Support efficient queries over ordered values within the partition.

## Q5. What happens if you choose a bad partition key?

A poor partition key can cause:

- Hot partitions.
- Uneven data distribution.
- Large partitions.
- Uneven node utilization.
- Increased read and write latency.

Partition-key design is one of the most important Cassandra data-modeling decisions.

## Q6. What is the difference between replication factor and consistency level?

Replication factor determines how many replicas are maintained for a partition.

Consistency level determines how many replica responses are required for a particular operation.

Example:

```text
RF = 3
QUORUM = 2
```

Three replicas are maintained, and two acknowledgements are required for a quorum write.

## Q7. Does Cassandra support transactions?

Cassandra supports certain atomic operations and lightweight transactions using Paxos-based mechanisms, but it does not provide the same general-purpose multi-row and multi-table ACID transaction model as PostgreSQL.

Do not assume that Cassandra transactions are equivalent to relational database transactions.

## Q8. What is a tombstone?

A tombstone is a marker representing deleted data.

It allows the database to propagate deletion information across replicas.

The actual deleted data is cleaned up later during compaction when it is safe to do so.

## Q9. What is the difference between Cassandra and HBase?

Cassandra uses a peer-to-peer architecture and provides tunable consistency.

HBase uses a RegionServer-based architecture, commonly runs on HDFS, and provides strong consistency for row operations.

Their architecture and operational models are different.

## Q10. Why is Cassandra not suitable for every application?

Because it has tradeoffs:

- Limited ad-hoc query flexibility.
- No arbitrary relational joins.
- Query-driven data modeling.
- Denormalization.
- Distributed cluster operations.
- Repair and compaction management.
- Different transaction capabilities from relational databases.

If the application requires relational transactions and complex queries, PostgreSQL may be a better choice.

## Q11. Can Cassandra replace Redis?

Not necessarily.

Redis is optimized for fast key-value access and offers features such as expiration, data structures, and in-memory operations.

Cassandra is designed for distributed, persistent, partitioned data workloads.

They solve different problems.

## Q12. Can Cassandra be used for analytics?

It can support certain query-specific operational summaries and retrieval workloads.

However, it is not a general-purpose analytical database.

For large analytical aggregations, systems such as ClickHouse or data warehouse platforms may be more appropriate.

## Q13. What is the difference between Cassandra replication and backup?

Replication maintains copies of data across nodes.

Backup provides recoverable historical copies that can be restored after accidental deletion, corruption, or other failures.

Replication alone cannot protect against every data-loss scenario.

## Q14. Why might an organization use PostgreSQL and Cassandra together?

PostgreSQL can handle transactional business entities, relationships, and consistency constraints.

Cassandra can handle high-volume distributed event ingestion and query-specific event retrieval.

The application uses each database for the workload it handles best.

---

# 13. Practical Architecture Exercises

These exercises test whether you can select a database based on requirements rather than popularity.

## Exercise 1: Choose the Database

For each requirement, select a suitable database and explain why.

| Requirement                                            | Possible choice                                 |
| ------------------------------------------------------ | ----------------------------------------------- |
| Store user sessions                                    | Redis                                           |
| Store customer orders                                  | PostgreSQL                                      |
| Store nested campaign configurations                   | MongoDB                                         |
| Store billions of user activity events                 | Cassandra, if access patterns fit               |
| Run large analytical aggregations                      | ClickHouse or a data warehouse                  |
| Store device telemetry at high ingestion volume        | Cassandra or a specialized time-series database |
| Store product relationships and inventory transactions | PostgreSQL                                      |
| Search application logs by text                        | A search engine such as OpenSearch              |

These are starting recommendations. Actual selection requires workload measurements and requirements.

## Exercise 2: Design a Cassandra Table

Requirement:

Find the latest 100 events for a user on a particular date.

Possible schema:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_date DATE,
    event_time TIMESTAMP,
    event_type TEXT,
    event_data TEXT,
    PRIMARY KEY ((user_id, event_date), event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

Query:

```sql
SELECT *
FROM user_events
WHERE user_id = ?
AND event_date = ?
LIMIT 100;
```

Explain:

1. Why `user_id` is part of the partition key.
2. Why `event_date` is part of the partition key.
3. Why `event_time` is a clustering column.
4. Why descending order is useful.
5. What happens if one user generates an unusually large number of events.

## Exercise 3: Identify the Architecture Mistake

A startup has:

- 5,000 users.
- 20,000 orders per month.
- PostgreSQL running comfortably.
- No significant write bottleneck.

The engineering team decides to migrate everything to Cassandra because Cassandra is horizontally scalable.

What is wrong with this decision?

**Expected reasoning:**

The team has not demonstrated a scaling problem that requires Cassandra.

The migration would introduce:

- Data-model redesign.
- Loss of convenient relational querying.
- Denormalization.
- New operational responsibilities.
- Migration risk.
- More complex transactional workflows.

Horizontal scalability is not automatically a business requirement.

## Exercise 4: Design a Hybrid Architecture

Requirement:

A campaign platform needs:

- User registration.
- Campaign configuration.
- Game scores.
- Session storage.
- Billions of historical gameplay events.
- Daily campaign analytics.

Propose a database for each responsibility.

One possible design:

| Responsibility                          | Database                                |
| --------------------------------------- | --------------------------------------- |
| User accounts and transactional records | PostgreSQL                              |
| Campaign configuration                  | MongoDB or PostgreSQL                   |
| Sessions and temporary state            | Redis                                   |
| Historical gameplay events              | Cassandra, if the workload justifies it |
| Daily analytics                         | ClickHouse or a warehouse               |

Explain how events move from the application into the analytical system.

A common approach is:

```text
Application
    |
    v
Message Broker
    |
    v
Event Consumers
    |
    +-------> Cassandra
    |
    +-------> Analytical Database
```

This decouples event ingestion from downstream processing.

---

# 14. Final Revision: Wide-Column Databases

## 14.1 Core Concepts

| Concept              | Meaning                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| Wide-column database | Distributed database with partitioned rows and columns                   |
| Partition key        | Determines data partition placement                                      |
| Clustering column    | Defines ordering within a partition                                      |
| Replication factor   | Number of replicas maintained                                            |
| Consistency level    | Number of replica acknowledgements required                              |
| Memtable             | In-memory structure holding recent writes                                |
| Commit log           | Durable record of mutations                                              |
| SSTable              | Immutable on-disk storage file                                           |
| LSM tree             | Storage design based on memory structures and sorted files               |
| Compaction           | Merges SSTables and processes obsolete data                              |
| Tombstone            | Marker representing deleted data                                         |
| Denormalization      | Storing duplicated data to support query patterns                        |
| Hinted handoff       | Attempts to deliver missed mutations to temporarily unavailable replicas |
| Anti-entropy repair  | Reconciles differences between replicas                                  |

## 14.2 Cassandra vs HBase vs PostgreSQL vs MongoDB vs Redis

| Requirement                                | Strong candidate            |
| ------------------------------------------ | --------------------------- |
| Relational transactions                    | PostgreSQL                  |
| Complex JOINs                              | PostgreSQL                  |
| Flexible nested documents                  | MongoDB                     |
| Fast key-value caching                     | Redis                       |
| Distributed high-volume operational writes | Cassandra                   |
| Hadoop/HDFS-integrated wide-column storage | HBase                       |
| Large-scale analytical aggregation         | ClickHouse / Data Warehouse |

These are workload-oriented recommendations, not universal performance rankings.

## 14.3 Final Mental Model

Remember these distinctions:

```text
PostgreSQL
    |
    +-- Relationships
    +-- Transactions
    +-- Constraints
    +-- Flexible SQL queries

MongoDB
    |
    +-- Documents
    +-- Nested data
    +-- Flexible document structures

Redis
    |
    +-- Key-value access
    +-- Caching
    +-- Sessions
    +-- Fast in-memory operations

Cassandra
    |
    +-- Distributed data
    +-- High-volume writes
    +-- Partition-based queries
    +-- Replication

HBase
    |
    +-- Distributed wide-column storage
    +-- HDFS ecosystem
    +-- Region-based architecture
```

---

# 15. Chapter Summary

Wide-column databases are useful when an application needs distributed storage, high write throughput, horizontal scalability, and predictable query patterns.

However, they require deliberate data modeling and operational expertise.

The most important lessons from Part 13:

1. Wide-column databases are not simply relational databases with more columns.
2. Cassandra uses a peer-to-peer architecture and an LSM-oriented storage engine.
3. HBase uses a RegionServer-based architecture and is commonly built on HDFS.
4. Partition-key design determines data distribution and strongly influences performance.
5. Clustering columns organize rows within a partition.
6. Cassandra data modeling is query-driven.
7. Denormalization reduces some read costs but increases write and storage complexity.
8. Replication factor and consistency level solve different problems.
9. Replication is not backup.
10. Tombstones, compaction, and repair require operational attention.
11. PostgreSQL, MongoDB, Redis, Cassandra, and HBase solve different classes of problems.
12. A database should be selected based on workload requirements, not popularity or theoretical scalability.

**The most important architectural principle:**

Choose the simplest database architecture that satisfies the application's actual requirements. Introduce distributed databases when the workload justifies their benefits and the team can manage their operational costs.
