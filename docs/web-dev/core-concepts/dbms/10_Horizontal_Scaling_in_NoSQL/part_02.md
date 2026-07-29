---
sidebar_label: How NoSQL Scales Horizontally
sidebar_position: 1
---

# How NoSQL Scales Horizontally

## 1. Introduction

In last section, we studied nodes, partitions, clusters, replication, and partition ownership.

Now we will understand how NoSQL databases use these concepts to scale horizontally.

Suppose you are building an application using Node.js and MongoDB.

Initially, your application has:

- 10,000 users.
- 100,000 orders.
- 1,000 requests per second.

A single database server may handle this workload comfortably.

But over time, the application grows:

- 10 million users.
- 100 million orders.
- 50,000 requests per second.
- Increasing storage and processing requirements.

Eventually, one database server may become a bottleneck.

You have two broad options:

1. **Vertical scaling:** Upgrade the existing server.
2. **Horizontal scaling:** Add more servers and distribute the workload.

NoSQL databases commonly support horizontal scaling through partitioning, replication, and distributed request routing.

**Central idea:** Horizontal scaling increases the system's capacity by distributing data and work across multiple machines rather than depending entirely on one increasingly powerful machine.

---

## 2. Vertical Scaling vs Horizontal Scaling

### 2.1 Vertical scaling

Vertical scaling means increasing the resources of an existing server.

For example:

```text
Before:

Database Server
CPU: 4 cores
RAM: 16 GB
Storage: 500 GB

After:

Database Server
CPU: 16 cores
RAM: 64 GB
Storage: 2 TB
```

The database still runs on one machine, but that machine has more resources.

Advantages:

- Relatively simple architecture.
- No need to distribute data across multiple database nodes.
- Less network coordination.
- Easier operational management.

Limitations:

- Hardware has physical limits.
- Upgrades can be expensive.
- A single machine can remain a failure point.
- Capacity growth eventually becomes difficult.

### 2.2 Horizontal scaling

Horizontal scaling means adding more machines and distributing the workload across them.

```text
Before:

             Application
                  |
                  v
             Database
               Node A


After:

             Application
                  |
                  v
          Distributed Database
                  |
          +-------+-------+
          |       |       |
          v       v       v
        Node A  Node B  Node C
```

Instead of depending on one machine, the database uses multiple machines.

Advantages:

- More total storage capacity.
- More processing resources.
- Potentially higher throughput.
- Better distribution of workload.
- Can support node-level fault tolerance when replication is configured.

Limitations:

- Network communication overhead.
- Distributed consistency challenges.
- More complicated operations.
- Partitioning and rebalancing requirements.
- More difficult monitoring and troubleshooting.

### 2.3 Comparison

| Feature          | Vertical Scaling                          | Horizontal Scaling                                   |
| ---------------- | ----------------------------------------- | ---------------------------------------------------- |
| Approach         | Upgrade existing server                   | Add more servers                                     |
| Resources        | Increase CPU, RAM, storage                | Combine resources across machines                    |
| Architecture     | Usually simpler                           | Distributed                                          |
| Storage capacity | Limited by one machine                    | Can grow across nodes                                |
| Failure handling | Often depends on separate failover design | Can tolerate node failures with suitable replication |
| Complexity       | Lower                                     | Higher                                               |
| Scaling limit    | Hardware limit                            | Infrastructure and architecture limits               |

**Important:** Horizontal scaling does not automatically make an application faster. A poorly distributed workload or a query requiring coordination across many nodes may perform worse.

---

## 3. Why NoSQL Databases Commonly Support Horizontal Scaling

NoSQL databases often use data models and architectures designed around particular access patterns.

Many support:

- Partitioning data across nodes.
- Replicating partitions.
- Routing requests to responsible nodes.
- Adding nodes to increase capacity.
- Rebalancing data when cluster membership changes.

However, NoSQL is a broad category.

Not every NoSQL database scales in exactly the same way.

For example:

| Database         | Common scaling approach                          |
| ---------------- | ------------------------------------------------ |
| MongoDB          | Sharding and replica sets                        |
| Apache Cassandra | Partition-key-based distribution and replication |
| Redis Cluster    | Hash-slot-based key distribution and replication |
| DynamoDB         | Managed partitioning and replication             |
| HBase            | Region-based distribution across RegionServers   |

We will understand the common principles first and examine database-specific implementations afterward.

---

## 4. The Core Mechanism: Partitioning

Partitioning is one of the fundamental mechanisms behind horizontal scaling.

Suppose an application has 90 million users.

Initially, all users are stored on one node:

```text
             Users Collection
                90 Million
                     |
                     v
                  Node A
```

As the dataset grows, we distribute it across three nodes:

```text
              Users Collection
                 90 Million
                      |
              +-------+-------+
              |       |       |
              v       v       v
            Node A  Node B  Node C
              |       |       |
              v       v       v
          30 Million each
```

Each node stores a subset of the total dataset.

This is horizontal partitioning.

### What improves?

1. Storage is distributed.
2. Different nodes can process different requests.
3. Writes can be distributed across partitions.
4. The system can use resources from multiple machines.

### Important limitation

If all requests target Node A, adding Node B and Node C will not necessarily improve performance.

The workload must be distributed effectively.

We will study the strategies used to distribute data in Part 10C.

---

## 5. How a Request Reaches the Correct Node

Adding multiple nodes creates a new problem:

**How does the database know which node contains the requested record?**

Suppose we have three nodes:

```text
Node A → Partition 1
Node B → Partition 2
Node C → Partition 3
```

A client requests:

```http
GET /users/1050
```

The database needs to identify which partition contains user 1050.

A simplified request flow:

```text
              Application
                   |
                   v
              Database Router
                   |
                   v
             Determine Partition
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
                   |
                   v
             User 1050 Found
                   |
                   v
             Return Result
```

The router or coordinator uses partition metadata and the partitioning strategy to identify the responsible node.

The application does not necessarily need to know the physical location of every record.

### Two types of queries

**Targeted query**

A query contains enough information to identify the relevant partition.

```javascript
db.users.findOne({
  userId: 1050,
});
```

If `userId` is the shard key, the database may route the request directly to the responsible shard.

**Scatter-gather query**

A query does not contain enough information to identify a single partition.

```javascript
db.users.find({
  status: "active",
});
```

If `status` is not useful for partition targeting, the database may need to query multiple shards and combine the results.

This can increase network traffic and query latency.

**Engineering principle:** Queries that can be routed to a specific partition are generally more efficient than queries that require scanning many partitions.

---

## 6. How Adding Nodes Increases Capacity

Suppose a database initially runs on three nodes.

```text
Initial Cluster:

Node A
Node B
Node C
```

The dataset is distributed across them.

Now the application grows, and we add Node D.

```text
Expanded Cluster:

Node A
Node B
Node C
Node D
```

The database may redistribute partitions across all four nodes.

### Before adding Node D

```text
Node A: P1, P2, P3
Node B: P4, P5, P6
Node C: P7, P8, P9
```

### After adding Node D

```text
Node A: P1, P2
Node B: P3, P4
Node C: P5, P6
Node D: P7, P8, P9
```

This is only an illustrative redistribution. Actual placement depends on the database's partitioning and balancing mechanism.

### What improves?

- More storage resources become available.
- More CPU resources become available.
- More nodes can process independent operations.
- The system can distribute additional workload.

But adding a node does not guarantee that performance will increase proportionally.

For example:

- Three nodes do not automatically mean three times the throughput.
- Network coordination adds overhead.
- Some queries may need to contact multiple nodes.
- A hot partition can remain a bottleneck.
- The application itself may become the limiting factor.

---

## 7. Replication: Keeping Multiple Copies of Data

Partitioning distributes different portions of data.

Replication creates additional copies of those portions.

Distributed databases commonly use both mechanisms.

Suppose we have three partitions:

```text
Partition 1
Partition 2
Partition 3
```

Each partition has two replicas.

```text
                  Database
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Partition 1 Partition 2 Partition 3
          |          |          |
        +---+      +---+      +---+
        |   |      |   |      |   |
        v   v      v   v      v   v
        A1  A2     B1  B2     C1  C2
```

For example:

- A1 and A2 contain copies of Partition 1.
- B1 and B2 contain copies of Partition 2.
- C1 and C2 contain copies of Partition 3.

### Why replication?

1. Fault tolerance.
2. Higher availability.
3. Read scaling in architectures that permit replica reads.
4. Recovery after node failure.

### What happens when a node fails?

Suppose A1 fails.

```text
Partition 1:

A1 → Failed
A2 → Available
```

The database may continue serving Partition 1 from A2.

The exact behavior depends on:

- Replication configuration.
- Write acknowledgement requirements.
- Election or failover mechanism.
- Read consistency settings.

### Important distinction

Replication improves redundancy, but it introduces synchronization requirements.

Multiple copies of data must be kept consistent according to the database's chosen consistency model.

---

## 8. Combining Partitioning and Replication

This is the foundation of many distributed NoSQL architectures.

Consider a database containing 300 million records.

We divide it into three partitions:

```text
P1: 100 Million Records
P2: 100 Million Records
P3: 100 Million Records
```

Each partition has three replicas.

```text
                 Complete Dataset
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
            P1          P2          P3
             |           |           |
         +---+---+   +---+---+   +---+---+
         |   |   |   |   |   |   |   |   |
         v   v   v   v   v   v   v   v   v
         A1  A2  A3  B1  B2  B3  C1  C2  C3
```

This architecture provides:

- Distributed storage through partitioning.
- Multiple copies through replication.
- Potentially higher read throughput.
- Better fault tolerance when replicas are placed appropriately.

### Storage overhead

If the original dataset is 1 TB and every partition has three total copies, approximate storage becomes:

```text
Logical data = 1 TB
Replication factor = 3

Physical data ≈ 3 TB
```

Actual storage requirements can be higher because of indexes, metadata, logs, and database overhead.

---

## 9. Request Routing in a Distributed NoSQL Database

Let's understand the complete request lifecycle.

Suppose a Node.js application sends:

```javascript
db.orders.findOne({
  orderId: "ORD-10025",
});
```

Assume `orderId` is the partition key.

### Step-by-step flow

**Step 1: Application sends the query**

```text
Node.js Application
        |
        v
Database Driver
```

**Step 2: The database determines the partition**

The partition key is used to determine where the record belongs.

```text
orderId = ORD-10025
        |
        v
Partitioning Function
        |
        v
Partition P5
```

**Step 3: The request is routed**

```text
Database Router
        |
        v
Node B
```

**Step 4: The node processes the query**

Node B locates the record in its local partition data.

**Step 5: The result is returned**

```text
Node B
   |
   v
Database Router
   |
   v
Node.js Application
```

The application receives the result.

### What if the partition key is missing?

Consider:

```javascript
db.orders.find({
  status: "pending",
});
```

If `status` does not help determine the partition, the database may need to send the query to multiple nodes.

```text
             Coordinator
                  |
          +-------+-------+
          |       |       |
          v       v       v
        Node A  Node B  Node C
          |       |       |
          +-------+-------+
                  |
            Merge Results
                  |
                  v
             Application
```

This is a scatter-gather operation.

It can increase:

- Network traffic.
- CPU usage.
- Response latency.
- Coordination overhead.

---

## 10. Parallel Processing Across Nodes

One advantage of horizontal scaling is the ability to execute independent work in parallel.

Suppose a query needs to process 90 million records.

A simplified example:

```text
Total Records = 90 Million
```

The records are distributed:

```text
Node A → 30 Million
Node B → 30 Million
Node C → 30 Million
```

The database may process portions of the query on each node simultaneously.

```text
                 Query
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
          |        |        |
       Process  Process  Process
       30M      30M      30M
          |        |        |
          +--------+--------+
                   |
                   v
              Merge Results
                   |
                   v
              Return Result
```

For suitable workloads, parallel processing can improve execution time.

However, the system must combine the partial results.

Some operations are easier to parallelize than others.

Examples:

| Operation               | Distributed execution considerations               |
| ----------------------- | -------------------------------------------------- |
| Count records           | Partial counts can often be combined               |
| Sum values              | Partial sums can be combined                       |
| Search by partition key | Can target one partition                           |
| Global sorting          | Requires coordination or merging                   |
| JOIN across partitions  | Can require substantial data movement              |
| Global aggregation      | May require partial aggregation and result merging |

**Important:** Distributed query execution is not automatically faster. The cost of transferring and combining data may outweigh the benefit of parallel processing.

---

## 11. Stateless Application Servers and Distributed Databases

Horizontal scaling is not limited to databases.

Application servers can also scale horizontally.

Consider a Node.js application:

```text
             Load Balancer
                   |
          +--------+--------+
          |        |        |
          v        v        v
       App A     App B     App C
          |        |        |
          +--------+--------+
                   |
                   v
          Distributed Database
```

The load balancer distributes incoming requests across application instances.

The application instances should avoid relying on local memory for state that must be shared across instances.

For example, if user sessions are stored only in App A's memory, a request routed to App B may not find the session.

A shared store such as Redis can help:

```text
          App A
          App B  ------ Redis
          App C
```

The database layer also needs distributed routing and partition ownership.

### Two separate scaling problems

| Layer             | Scaling mechanism                                 |
| ----------------- | ------------------------------------------------- |
| Application layer | Add application instances and distribute requests |
| Database layer    | Partition data and distribute database workload   |

Scaling the application layer does not automatically scale the database layer.

Both need appropriate capacity planning.

---

## 12. Automatic vs Manual Sharding

Horizontal scaling can be implemented with different levels of automation.

### 12.1 Manual sharding

The application decides which database stores each record.

Example:

```javascript
function getDatabaseForUser(userId) {
  const shardNumber = userId % 3;

  return databaseConnections[shardNumber];
}
```

The application routes the request according to the user ID.

Illustrative mapping:

```text
userId % 3

0 → Database A
1 → Database B
2 → Database C
```

Advantages:

- Full control over routing.
- Can be designed around application requirements.
- Can work with databases without built-in sharding.

Disadvantages:

- Application code becomes more complex.
- Rebalancing requires application-level coordination.
- Cross-shard queries become difficult.
- Database topology changes affect routing logic.

### 12.2 Automatic sharding

The database manages partition placement and request routing.

The application communicates with a database router or cluster endpoint.

```text
             Application
                  |
                  v
            Database Router
                  |
          +-------+-------+
          |       |       |
          v       v       v
        Shard A Shard B Shard C
```

Advantages:

- Less routing logic in the application.
- Database-managed partition metadata.
- Can support automatic balancing.
- Easier application integration.

Disadvantages:

- Database-specific configuration.
- Operational complexity.
- Not every query can be targeted efficiently.
- Rebalancing and coordination still have costs.

### Comparison

| Feature                | Manual Sharding                           | Automatic Sharding             |
| ---------------------- | ----------------------------------------- | ------------------------------ |
| Routing                | Application                               | Database or router             |
| Control                | High                                      | Database-managed               |
| Application complexity | Higher                                    | Usually lower                  |
| Rebalancing            | Application responsibility                | Often database-managed         |
| Cross-shard queries    | Application must coordinate               | Router/database may coordinate |
| Examples               | Custom application-level database routing | MongoDB sharded cluster        |

---

## 13. Real-World Example: MongoDB Horizontal Scaling

MongoDB supports horizontal scaling through sharding.

A sharded cluster commonly includes:

1. Shards.
2. Config servers.
3. `mongos` routers.

### Architecture

```text
                 Node.js Application
                         |
                         v
                    mongos Router
                         |
                Cluster Metadata
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
       Shard 1        Shard 2        Shard 3
          |              |              |
          v              v              v
      Replica Set    Replica Set    Replica Set
```

### Example

Suppose a collection contains millions of users.

```javascript
{
  userId: 1050,
  name: "User A",
  email: "user@example.com"
}
```

Assume `userId` is selected as the shard key.

MongoDB uses the shard-key value and the collection's sharding configuration to determine the document's placement.

A targeted query:

```javascript
db.users.findOne({
  userId: 1050,
});
```

can be routed to the relevant shard.

A query without the shard key:

```javascript
db.users.find({
  status: "active",
});
```

may need to visit multiple shards.

### What happens when a new shard is added?

The cluster can redistribute data across the expanded set of shards.

MongoDB uses chunks and a balancer to manage data distribution.

A chunk is a range of shard-key values.

The balancer can migrate chunks between shards to improve distribution.

This migration consumes resources and should be considered during capacity planning.

---

## 14. Real-World Example: Cassandra Horizontal Scaling

Apache Cassandra uses a distributed architecture based on partition keys and token ranges.

### Architecture

```text
             Cassandra Cluster
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
```

A partition key determines the token associated with a partition.

The token determines where the partition belongs in the cluster's token space.

Cassandra distributes token ranges across nodes.

### Example

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);
```

Here, `user_id` is the partition key.

When the application writes a row, Cassandra calculates the token for the partition key and identifies the responsible node or replica nodes.

### Adding a node

When a new node joins, token ownership can be redistributed.

The new node receives portions of the token ranges and associated data.

This allows the cluster to expand its capacity.

Cassandra also replicates partitions according to its replication strategy.

The precise behavior depends on the replication factor and consistency level.

---

## 15. Real-World Example: Redis Cluster

Redis Cluster provides another example of horizontal scaling.

It distributes keys across a fixed number of hash slots.

There are 16,384 hash slots.

A key is mapped to a slot using a hash function.

Conceptually:

```text
Key
 |
 v
Hash Function
 |
 v
Hash Slot
 |
 v
Responsible Node
```

For example:

```text
user:101 → Hash Slot 100
user:102 → Hash Slot 250
user:103 → Hash Slot 500
```

The actual slot values are determined by Redis's hashing algorithm, not manually assigned as shown here.

The hash slots are distributed across primary nodes.

Each primary can also have replicas.

When a node is added, hash slots can be reassigned to redistribute the workload.

Redis Cluster also has restrictions on multi-key operations when keys are located in different hash slots.

This encourages application designs that keep related keys together when cross-key operations are needed.

---

## 16. Benefits of Horizontal Scaling in NoSQL

| Benefit                 | Explanation                                              |
| ----------------------- | -------------------------------------------------------- |
| Storage expansion       | Add nodes to distribute more data                        |
| Higher throughput       | Independent partitions can process requests in parallel  |
| Workload distribution   | Spread requests across nodes                             |
| Fault tolerance         | Replicas can serve data after certain failures           |
| Incremental capacity    | Expand the cluster as demand grows                       |
| Geographic distribution | Some systems can distribute replicas across regions      |
| Large dataset support   | Avoid relying entirely on one machine's storage capacity |

These benefits depend on the database's architecture and configuration.

---

## 17. Challenges of Horizontal Scaling

Horizontal scaling introduces problems that do not exist, or are simpler, in a single-node database.

### 17.1 Distributed consistency

Multiple nodes may contain copies of the same data.

The database must coordinate updates and handle replication delays.

### 17.2 Network latency

A query routed to another node introduces network communication.

A query that contacts many nodes can be slower than a local query.

### 17.3 Cross-partition queries

A query may require data from multiple partitions.

The database must gather and combine results.

### 17.4 Hot partitions

A small subset of partitions may receive disproportionate traffic.

Adding nodes does not automatically fix a hot partition.

### 17.5 Rebalancing

Adding or removing nodes can require data movement.

This consumes network, disk, and CPU resources.

### 17.6 Operational complexity

Distributed systems require:

- Cluster monitoring.
- Replication monitoring.
- Capacity planning.
- Failure detection.
- Backup and recovery.
- Data migration.
- Configuration management.

### 17.7 Cost

More nodes mean more infrastructure.

Replication also increases storage consumption.

Horizontal scaling can reduce bottlenecks, but it is not automatically cheaper than vertical scaling.

---

## 18. Common Misconceptions

| Misconception                                       | Correct understanding                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| Adding more nodes always makes queries faster       | Performance depends on partitioning, routing, and coordination overhead   |
| Horizontal scaling is just adding servers           | Data placement, routing, replication, and rebalancing are also required   |
| Partitioning automatically provides fault tolerance | Replication and recovery are needed                                       |
| Replication distributes unique data                 | Replication creates additional copies                                     |
| Every query is executed on one node                 | Some queries require multiple nodes                                       |
| NoSQL databases never need joins                    | Some support joins or related operations; application design varies       |
| Automatic sharding eliminates operational work      | It reduces routing work but does not remove distributed-system complexity |
| A balanced number of records means balanced traffic | Query frequency and computational cost also matter                        |
| Adding application servers scales the database      | Application and database scaling are separate problems                    |
| More replicas always improve write performance      | Replicas may increase coordination and write overhead                     |

---

## 19. Interview Questions and Answers

### Q1. What is horizontal scaling?

Horizontal scaling means increasing system capacity by adding more machines and distributing data or workload across them.

### Q2. Why do NoSQL databases support horizontal scaling?

Many NoSQL databases are designed around partitioning, replication, and distributed request routing, allowing data and workload to be distributed across nodes.

### Q3. What is the role of partitioning?

Partitioning divides a dataset into smaller logical subsets that can be stored and processed across different nodes.

### Q4. What is the role of replication?

Replication maintains multiple copies of data to improve fault tolerance and, depending on the architecture, read availability and read throughput.

### Q5. What happens when a query does not include the partition key?

The database may need to contact multiple partitions or nodes. This is often called scatter-gather execution.

### Q6. What is a targeted query?

A query that contains sufficient partition-key information to route the request to a specific partition or small set of partitions.

### Q7. What is a hot partition?

A partition receiving disproportionate traffic or expensive operations, becoming a performance bottleneck.

### Q8. Does adding a node automatically redistribute existing data?

Not necessarily. The database may need to rebalance or migrate existing partitions.

### Q9. What is the difference between manual and automatic sharding?

Manual sharding requires application-managed routing. Automatic sharding uses database-managed metadata and routing mechanisms.

### Q10. How does MongoDB perform horizontal scaling?

MongoDB uses sharding. The `mongos` router directs requests to shards using cluster metadata, while config servers store metadata about the cluster.

### Q11. How does Cassandra distribute data?

Cassandra uses partition keys, token calculation, and token-range ownership to distribute data across nodes.

### Q12. How does Redis Cluster distribute keys?

Redis Cluster maps keys to one of 16,384 hash slots and distributes those slots across primary nodes.

### Q13. What is scatter-gather?

A query execution pattern in which a request is sent to multiple nodes and their partial results are combined.

### Q14. Why can horizontal scaling increase query latency?

Network communication, distributed coordination, data movement, and merging results can add overhead.

### Q15. What is the difference between application scaling and database scaling?

Application scaling adds application instances to process requests. Database scaling distributes data and database operations across database nodes.

---

## 20. Practical Exercises

### Exercise 1: Design a horizontally scaled database

Suppose your application has:

```text
Users: 50 Million
Orders: 200 Million
Products: 5 Million
```

Design a database architecture using three initial nodes.

Explain:

1. How would you partition the data?
2. How would you distribute partitions?
3. How would you replicate data?
4. How would requests reach the correct node?
5. What happens when a node fails?
6. What happens when you add a fourth node?

### Exercise 2: Targeted query vs scatter-gather

Assume `userId` is the shard key.

Query A:

```javascript
db.users.findOne({
  userId: 1050,
});
```

Query B:

```javascript
db.users.find({
  city: "Noida",
});
```

Answer:

1. Which query can potentially target a single shard?
2. Which query may need to contact multiple shards?
3. Why does the shard key matter?
4. What happens if the shard key has poor distribution?

### Exercise 3: Analyze scaling

A cluster has four nodes.

| Node | Requests/sec |
| ---- | -----------: |
| A    |       10,000 |
| B    |       12,000 |
| C    |       11,000 |
| D    |       80,000 |

Answer:

1. Is the workload balanced?
2. Which node is likely to become a bottleneck?
3. Would adding another node automatically solve the problem?
4. What would you inspect before changing the partitioning strategy?

### Exercise 4: Compare databases

Research or inspect the documentation for:

- MongoDB sharding.
- Cassandra partitioning.
- Redis Cluster hash slots.

Explain how each database:

1. Determines where data belongs.
2. Routes requests.
3. Handles replicas.
4. Handles node addition.
5. Redistributes existing data.

### Exercise 5: Backend architecture

Design a Node.js backend with:

- Three application instances.
- A distributed NoSQL database.
- Redis for caching.
- A load balancer.

Draw the architecture and explain the difference between distributing application requests and distributing database records.

---

## 21. Chapter Summary

| Concept             | Key takeaway                                     |
| ------------------- | ------------------------------------------------ |
| Horizontal scaling  | Add machines to increase capacity                |
| Vertical scaling    | Upgrade an existing machine                      |
| Partitioning        | Divide data into logical subsets                 |
| Replication         | Maintain additional copies                       |
| Request routing     | Direct requests to responsible nodes             |
| Targeted query      | Query routed to a specific partition             |
| Scatter-gather      | Query sent to multiple partitions                |
| Parallel processing | Multiple nodes process work simultaneously       |
| Manual sharding     | Application controls data routing                |
| Automatic sharding  | Database manages partition placement and routing |
| Rebalancing         | Redistribute partitions after cluster changes    |
| Hot partition       | Partition receiving disproportionate workload    |
| MongoDB             | Uses shards, config servers, and `mongos`        |
| Cassandra           | Uses partition keys and token-based placement    |
| Redis Cluster       | Uses 16,384 hash slots                           |

### The most important points to remember

1. Horizontal scaling adds machines rather than only upgrading one machine.
2. Partitioning distributes unique data across nodes.
3. Replication maintains multiple copies of data.
4. Request routing determines which node handles an operation.
5. Queries containing the partition key can often be routed more efficiently.
6. Queries spanning multiple partitions may require scatter-gather execution.
7. Adding nodes may require rebalancing.
8. More nodes do not guarantee proportional performance improvements.
9. MongoDB, Cassandra, and Redis Cluster use different partition-placement mechanisms.
10. Horizontal scaling introduces coordination and operational complexity.

### Final mental model

```text
                 Application
                      |
                      v
               Database Router
                      |
              Partition Mapping
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        Node A      Node B      Node C
          |           |           |
          v           v           v
      Partition 1 Partition 2 Partition 3
          |           |           |
          +-----------+-----------+
                      |
                Distributed Data

        Replicas provide additional copies
        of partitions for fault tolerance.
```

**Engineering takeaway:** Horizontal scaling works when the database can distribute both data and workload effectively. Adding machines is only the infrastructure step; good partitioning, efficient routing, replication, and rebalancing make the architecture useful.
