---
sidebar_label: Nodes and Partitions
sidebar_position: 1
---

# Nodes and Partitions

## 1. Introduction

We studied distributed systems and CAP theorem.

Now we move into how distributed databases organize and distribute data across multiple machines.

A distributed database does not necessarily store all its data on one server.

Instead, it can distribute data across multiple machines called **nodes**.

Each node stores and manages some portion of the overall data.

To understand horizontal scaling in NoSQL databases, we need to understand two fundamental concepts:

1. Nodes
2. Partitions

These concepts form the foundation of distributed database architecture.

---

## 2. What Is a Node?

A **node** is an individual machine or server participating in a distributed system.

A node can be:

- A physical server.
- A virtual machine.
- A cloud-based compute instance.
- A containerized database instance, depending on the architecture.

Each node runs database software and participates in storing, processing, or managing data.

### Example: Single-node database

Imagine a MongoDB database running on one server.

```text
          Application
               |
               v
       +---------------+
       |   Database    |
       |    Node A     |
       +---------------+
               |
               v
           All Data
```

All database data is stored and managed by Node A.

If the application grows and the database receives more traffic, this single node may eventually become a bottleneck.

### Example: Multi-node database

Now imagine the database runs across three nodes.

```text
              Application
                   |
                   v
           Distributed Database
                   |
          +--------+--------+
          |        |        |
          v        v        v
       Node A   Node B   Node C
```

Each node participates in the distributed database.

Depending on the architecture:

- Nodes may store different portions of the data.
- Nodes may store replicas of the same data.
- Nodes may perform different responsibilities.
- A node may act as a coordinator, leader, or worker.

**Important:** Having multiple nodes does not automatically mean data is partitioned. A cluster can use multiple nodes only for replication.

---

## 3. What Is a Database Cluster?

A **cluster** is a group of connected nodes that work together as one logical system.

For example:

```text
                Database Cluster
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Node A       Node B       Node C
```

An application may connect to the cluster through a database driver, router, coordinator, or service endpoint.

The application does not necessarily need to manage every node directly.

### Why use a cluster?

A cluster can provide:

| Benefit                | Explanation                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| Scalability            | Distribute data and workload across nodes                             |
| Availability           | Continue operating when certain nodes fail, depending on architecture |
| Fault tolerance        | Maintain service despite some failures                                |
| Replication            | Maintain multiple copies of data                                      |
| Distributed processing | Execute work across multiple machines                                 |
| Storage capacity       | Use the combined storage resources of multiple nodes                  |

### Single server vs cluster

| Feature          | Single Node                                  | Cluster                                             |
| ---------------- | -------------------------------------------- | --------------------------------------------------- |
| Machines         | One                                          | Multiple                                            |
| Storage          | Limited to one node's capacity               | Can use storage across nodes                        |
| Processing       | One machine's resources                      | Multiple machines' resources                        |
| Failure handling | Server failure can make database unavailable | Other nodes may continue, depending on architecture |
| Scaling          | Primarily vertical                           | Can support horizontal scaling                      |
| Complexity       | Lower                                        | Higher                                              |

A cluster improves scaling potential, but it also introduces network communication, coordination, replication, and operational complexity.

---

## 4. What Is a Partition?

A **partition** is a logical subset of a database's data.

Instead of storing the entire dataset on one node, the database divides the dataset into smaller pieces.

Each piece is a partition.

These partitions can be distributed across different nodes.

### Example: Users collection

Suppose an application has 9 million users.

Storing and processing all records on one machine may eventually become difficult.

We can divide the users into three partitions:

```text
              Users Dataset
              9 Million Users
                    |
          +---------+---------+
          |         |         |
          v         v         v
      Partition  Partition  Partition
          1         2         3
       3 Million 3 Million 3 Million
```

Now assign these partitions to different nodes:

```text
             Distributed Database
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        Node A      Node B      Node C
          |           |           |
          v           v           v
      Partition 1 Partition 2 Partition 3
```

Each node stores a portion of the total dataset.

This allows the database to distribute storage and potentially distribute query processing.

### Important terminology

| Term      | Meaning                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Dataset   | Complete logical collection of data                                                                                          |
| Partition | A subset of the dataset                                                                                                      |
| Node      | Machine that stores or processes data                                                                                        |
| Cluster   | Group of nodes working together                                                                                              |
| Shard     | Commonly used to describe a horizontally partitioned database unit, often associated with a partition or group of partitions |

Terminology varies between database products.

In some systems, a shard is a physical database instance containing multiple partitions. In others, partition and shard are used more interchangeably.

---

## 5. Why Do We Need Partitions?

Suppose a database contains:

```text
Users = 100 Million
Orders = 500 Million
Products = 5 Million
```

If all data is stored on one machine, the database may face limitations.

### 5.1 Storage limitations

A single machine has finite disk capacity.

As data grows, the machine may run out of storage or require increasingly expensive hardware.

Partitioning distributes data across multiple machines.

```text
Before:

Node A
  |
  +-- 100 Million Users


After:

Node A → 35 Million Users
Node B → 35 Million Users
Node C → 30 Million Users
```

### 5.2 Processing limitations

A single machine has limited CPU and memory.

If queries and writes become too frequent, the server may struggle.

Distributing partitions can allow different nodes to process different requests simultaneously.

### 5.3 Throughput limitations

Suppose a single node can handle a certain workload.

As traffic increases, adding more nodes and distributing requests may increase total system throughput.

However, the improvement depends on workload distribution and coordination overhead.

### 5.4 Workload distribution

Suppose users are distributed across three partitions.

```text
Partition 1 → Users 1 to 3 Million
Partition 2 → Users 3 Million to 6 Million
Partition 3 → Users 6 Million to 9 Million
```

If requests are distributed evenly, multiple nodes can serve requests in parallel.

### 5.5 Independent scaling

Different partitions can have different workload characteristics.

A system may allocate additional resources to heavily used partitions or move them to more powerful nodes.

The exact mechanism depends on the database.

---

## 6. How Are Partitions Distributed Across Nodes?

A distributed database needs a strategy to decide which node stores which partition.

Consider:

```text
Dataset:
User 1
User 2
User 3
User 4
User 5
User 6
```

We want to distribute these records across three nodes.

A simple example:

```text
Node A:
User 1
User 2

Node B:
User 3
User 4

Node C:
User 5
User 6
```

The database needs a rule to determine the destination for every record.

Common approaches include:

1. Range-based partitioning.
2. Hash-based partitioning.
3. List-based partitioning.
4. Consistent hashing.
5. Directory-based partitioning.

These strategies determine how records are assigned to partitions.

We will study the strategies in detail in Part 10C.

For now, remember:

**Partitioning determines how data is divided, while placement determines where those partitions are stored.**

---

## 7. Partitioning vs Replication

These two concepts are closely related but solve different problems.

### 7.1 Partitioning

Partitioning divides data into different subsets.

Example:

```text
Complete Dataset
       |
   Partition
       |
  +----+----+
  |    |    |
  v    v    v
 P1   P2   P3
  |    |    |
  v    v    v
 A    B    C
```

Each node stores a different portion of the dataset.

The main purpose is distributing data and workload.

### 7.2 Replication

Replication creates multiple copies of the same data.

Example:

```text
             Partition 1
                  |
          +-------+-------+
          |               |
          v               v
       Node A           Node B
       Copy 1           Copy 2
```

Both nodes store the same partition.

The main purpose is availability, fault tolerance, and read scaling, depending on the replication architecture.

### 7.3 Combining partitioning and replication

Distributed databases commonly use both.

Suppose we have three partitions, each with two replicas.

```text
                   Dataset
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
     Partition 1 Partition 2 Partition 3
          |           |           |
       +--+--+     +--+--+     +--+--+
       |     |     |     |     |     |
       v     v     v     v     v     v
      A1    A2    B1    B2    C1    C2
```

Here:

- Partition 1 has replicas A1 and A2.
- Partition 2 has replicas B1 and B2.
- Partition 3 has replicas C1 and C2.

The system distributes the dataset while maintaining multiple copies of each partition.

### Comparison

| Feature         | Partitioning                               | Replication                                           |
| --------------- | ------------------------------------------ | ----------------------------------------------------- |
| Main purpose    | Divide data                                | Copy data                                             |
| Data stored     | Different subsets                          | Same subset on multiple nodes                         |
| Storage benefit | Distributes total dataset                  | Requires extra storage                                |
| Write behavior  | Writes routed to the responsible partition | Writes must be propagated to replicas                 |
| Availability    | Does not automatically provide redundancy  | Can improve fault tolerance                           |
| Scaling         | Storage and write distribution             | Read scaling and fault tolerance, depending on design |

**Important:** Replication alone does not increase the total unique data capacity of a database in the same way that partitioning does.

---

## 8. Primary and Secondary Nodes

Many distributed databases use different node roles.

Two common terms are:

- Primary or leader.
- Secondary or follower.

### 8.1 Primary node

The primary is responsible for coordinating or accepting writes in a primary-based replication architecture.

Example:

```text
             Application
                  |
                  v
             Primary Node
                  |
           Replication
             /       \
            v         v
       Secondary  Secondary
         Node        Node
```

The primary processes writes and replicates changes to secondary nodes.

### 8.2 Secondary node

A secondary stores replicated data from the primary.

Depending on the database:

- It may serve reads.
- It may participate in elections.
- It may become the new primary after a failure.
- It may be restricted from accepting ordinary writes.

### 8.3 Important distinction

Primary/secondary roles are associated with replication and coordination.

They are not the same as partition ownership.

A database can have:

- One primary for an entire dataset.
- Different leaders for different partitions.
- Multiple replicas for each partition.

For example, a distributed database may distribute different partitions across several nodes, with each partition having its own leader.

---

## 9. Partition Ownership

Partition ownership determines which node is responsible for managing a particular partition.

Suppose a database has six partitions:

```text
P1
P2
P3
P4
P5
P6
```

These partitions are assigned to three nodes:

```text
Node A:
P1, P2

Node B:
P3, P4

Node C:
P5, P6
```

Each node is responsible for its assigned partitions.

When a request arrives, the system must identify the correct partition and route the request to its owner.

### Example: User lookup

A client requests:

```text
GET /users/1050
```

The database determines which partition contains user 1050.

```text
Application
    |
    v
Find partition for user 1050
    |
    v
Partition P2
    |
    v
Node A
    |
    v
Return user data
```

The application may not know that Node A owns the relevant partition.

The database driver, router, or coordinator may handle routing.

### Why ownership matters

Partition ownership helps the system:

- Route requests.
- Decide where writes should go.
- Coordinate replication.
- Detect unavailable partitions.
- Move partitions during rebalancing.
- Recover after node failures.

---

## 10. Coordinator Nodes

Some distributed databases use a coordinator to route and coordinate requests.

A coordinator receives an application request and determines which node or nodes should handle it.

Example:

```text
              Application
                   |
                   v
             Coordinator
                   |
          +--------+--------+
          |        |        |
          v        v        v
        Node A   Node B   Node C
```

Suppose a query requests a user by ID.

The coordinator:

1. Receives the request.
2. Determines the responsible partition.
3. Routes the request to the relevant node.
4. Receives the result.
5. Returns the result to the application.

For a query spanning multiple partitions, it may need to contact several nodes and combine their results.

### Coordinator vs partition owner

| Coordinator                            | Partition Owner                  |
| -------------------------------------- | -------------------------------- |
| Receives and routes requests           | Manages a specific partition     |
| May coordinate operations across nodes | Stores or manages partition data |
| May not own the requested data         | Responsible for the partition    |
| Can be a separate logical role         | Can also act as coordinator      |

A coordinator is not necessarily a dedicated machine. In some databases, any node can act as a coordinator for a client request.

---

## 11. Partitioning Does Not Guarantee Even Distribution

An important problem is uneven data distribution.

Suppose we have three nodes:

```text
Node A: 30 Million records
Node B: 30 Million records
Node C: 30 Million records
```

This is relatively balanced by record count.

But suppose the traffic is:

```text
Node A: 10,000 requests/sec
Node B: 10,000 requests/sec
Node C: 100,000 requests/sec
```

Node C becomes a bottleneck.

Even though record counts are balanced, the workload is not.

### Two types of imbalance

**Data imbalance**

Some nodes store much more data than others.

**Workload imbalance**

Some nodes receive much more traffic or perform more expensive operations.

A well-designed partitioning strategy should consider:

- Data volume.
- Request distribution.
- Read/write patterns.
- Hot keys.
- Growth patterns.

We will study these problems and their solutions in later chapters.

---

## 12. What Happens When a Node Fails?

Consider three nodes:

```text
Node A
Node B
Node C
```

The dataset is partitioned across them, and each partition has replicas.

Suppose Node B fails.

```text
Node A: Running
Node B: Failed
Node C: Running
```

The result depends on replication and failure-handling configuration.

### Without replication

If Node B contains the only copy of a partition, that partition may become unavailable.

```text
Node A → P1
Node B → P2  (Failed)
Node C → P3
```

Partition P2 may be unavailable until Node B recovers or data is restored.

### With replication

Suppose P2 has another replica on Node C.

```text
Node A → P1
Node B → P2 (Failed)
Node C → P2 Replica + P3
```

The system may continue serving P2 from Node C.

However, the database must also handle:

- Leader or ownership changes.
- Replica synchronization.
- Write consistency.
- Recovery of the failed node.
- Possible loss of recent acknowledged writes, depending on replication guarantees.

**Important:** Partitioning distributes data. Replication provides additional copies. Fault tolerance generally requires a suitable replication and recovery design.

---

## 13. Partition Rebalancing

As a distributed database grows, partitions may need to move between nodes.

This process is called **rebalancing**.

### Initial distribution

```text
Node A: P1, P2
Node B: P3, P4
Node C: P5, P6
```

Now Node C becomes overloaded.

We add Node D.

The database may redistribute some partitions:

```text
Node A: P1, P2
Node B: P3
Node C: P5
Node D: P4, P6
```

The objective is to distribute storage and workload more evenly.

### Why is rebalancing needed?

- A new node is added.
- A node is removed.
- A node becomes overloaded.
- Data grows unevenly.
- A hot partition needs redistribution.
- Infrastructure capacity changes.

### Rebalancing challenges

Moving partitions is not as simple as copying files.

The system needs to handle:

- Data copying.
- Writes occurring during migration.
- Routing metadata updates.
- Replica synchronization.
- Failure during migration.
- Avoiding data loss or duplicate processing.

These challenges become especially important in production systems.

---

## 14. Node vs Partition vs Shard

These terms are frequently confused.

| Term      | What it represents                       | Example                                                 |
| --------- | ---------------------------------------- | ------------------------------------------------------- |
| Node      | A machine or database server             | MongoDB server instance                                 |
| Partition | A logical subset of data                 | Users with IDs in a particular range                    |
| Shard     | A horizontally distributed database unit | A MongoDB shard containing a subset of the overall data |
| Cluster   | A group of nodes working together        | Distributed MongoDB deployment                          |
| Replica   | Another copy of the same data            | Secondary copy of a partition                           |

### Example

```text
                  Cluster
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
          |          |          |
          v          v          v
      Partition 1 Partition 2 Partition 3
          |          |          |
          +----------+----------+
                     |
              Complete Dataset
```

A partition is a logical data unit.

A node is where the partition is stored or managed.

A shard is a database-specific concept that commonly represents a portion of the distributed dataset.

---

## 15. Real-World Example: MongoDB Sharded Cluster

MongoDB provides a practical example of distributed database architecture.

A MongoDB sharded cluster commonly contains three major components:

1. Shards.
2. Config servers.
3. `mongos` routers.

### 15.1 Shards

A shard stores a portion of the sharded collection's data.

In production, a shard is generally deployed as a replica set to provide redundancy.

```text
Shard 1 → Replica Set
Shard 2 → Replica Set
Shard 3 → Replica Set
```

### 15.2 Config servers

Config servers store cluster metadata.

This metadata includes information needed to understand:

- Shard configuration.
- Chunk distribution.
- Namespace and collection metadata.
- Routing information.

Config servers are deployed as a replica set in a production sharded cluster.

### 15.3 `mongos` router

`mongos` acts as the query router.

The application connects to `mongos`, which uses cluster metadata to route operations to the appropriate shard or shards.

### 15.4 Simplified architecture

```text
                  Application
                       |
                       v
                 mongos Router
                       |
              Routing Metadata
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Shard 1      Shard 2      Shard 3
          |            |            |
          v            v            v
      Replica Set  Replica Set  Replica Set
```

### 15.5 Example query

Suppose the users collection is sharded using `userId`.

The application executes:

```javascript
db.users.findOne({
  userId: 1050,
});
```

If the shard key allows MongoDB to identify the relevant shard, `mongos` can route the query directly to that shard.

If a query does not contain sufficient shard-key information, MongoDB may need to contact multiple shards.

This is called a scatter-gather query.

We will study query routing and execution in later chapters.

### Important MongoDB terminology

| Component     | Responsibility                           |
| ------------- | ---------------------------------------- |
| Shard         | Stores a subset of sharded data          |
| Replica set   | Provides redundancy for a shard          |
| Config server | Stores cluster metadata                  |
| `mongos`      | Routes client operations                 |
| Shard key     | Determines how documents are distributed |

**Important:** A MongoDB sharded cluster is not simply a collection of independent databases. The cluster has metadata and routing mechanisms that coordinate how data is distributed and accessed.

---

## 16. Real-World Example: Cassandra Nodes and Partitions

Apache Cassandra uses a distributed architecture in which data is distributed across nodes.

A simplified view:

```text
             Cassandra Cluster
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
```

Cassandra uses partition keys to determine where data belongs.

The partition key is used to calculate a token, which determines the data's position in the cluster's token space.

A partition can be replicated to multiple nodes according to the replication strategy.

### Example table

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);
```

Here, `user_id` is the partition key because it is the only primary-key component.

The database uses the partition key to determine the token and placement of the partition.

### Important concepts

- Partition key: Determines which logical partition a row belongs to.
- Token: A value calculated from the partition key.
- Token ring: The distributed token space used for data placement.
- Replication factor: Number of copies maintained for the data.
- Replica: Another node storing a copy of a partition.

Cassandra's architecture and token placement will be explored further in Part 13B.

---

## 17. Common Misconceptions

| Misconception                                           | Correct understanding                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| A node and a partition are the same                     | A node is a machine; a partition is a logical subset of data              |
| Multiple nodes always mean partitioning                 | Multiple nodes may only be used for replication                           |
| Partitioning automatically provides fault tolerance     | Replication and recovery mechanisms are also needed                       |
| Replication and partitioning are identical              | Partitioning divides data; replication copies data                        |
| Every node stores the entire database                   | In a partitioned cluster, nodes may store only subsets and their replicas |
| Every database has one primary for the entire cluster   | Some distributed databases have leaders or ownership roles per partition  |
| A coordinator must be a separate machine                | Any eligible node may coordinate a request                                |
| Equal record counts mean balanced workload              | Traffic and query cost also matter                                        |
| Adding a node automatically distributes all data evenly | Rebalancing or automatic data movement may be required                    |
| Shard and partition always mean exactly the same thing  | Terminology depends on the database architecture                          |

---

## 18. Interview Questions and Answers

### Q1. What is a node in a distributed database?

A node is an individual machine or database server participating in the distributed system.

### Q2. What is a cluster?

A cluster is a group of connected nodes working together as one logical system.

### Q3. What is a partition?

A partition is a logical subset of a dataset that can be stored and managed separately.

### Q4. Why do distributed databases use partitions?

To distribute storage, processing, and workload across multiple nodes.

### Q5. What is the difference between partitioning and replication?

Partitioning divides data into different subsets. Replication creates multiple copies of the same data.

### Q6. Can a database use partitioning and replication together?

Yes. A partition can have multiple replicas distributed across different nodes.

### Q7. What is partition ownership?

It identifies which node or nodes are responsible for managing a particular partition.

### Q8. What is a coordinator node?

A coordinator receives requests, routes them to the appropriate nodes, and may combine results from multiple nodes.

### Q9. What happens when a node fails?

The affected partitions may become unavailable unless suitable replicas exist. The database may promote another replica or redirect requests depending on its architecture.

### Q10. What is rebalancing?

Rebalancing is the process of redistributing partitions across nodes to improve storage and workload distribution.

### Q11. What is a hot partition?

A partition receiving disproportionately high traffic or expensive operations, potentially becoming a bottleneck.

### Q12. What is the difference between a shard and a node?

A shard is a distributed data unit. A node is a machine that stores or manages data. A shard may consist of multiple nodes through replication.

### Q13. What does `mongos` do in MongoDB?

It routes application queries to the appropriate shards using cluster metadata.

### Q14. What do MongoDB config servers store?

They store metadata required to manage and route operations in the sharded cluster.

### Q15. What is a Cassandra partition key?

It is the key component used to determine a row's partition and its token-based placement in the cluster.

---

## 19. Practical Exercises

### Exercise 1: Understand the architecture

A database contains 90 million users and runs on three nodes.

```text
Node A: 30 Million Users
Node B: 30 Million Users
Node C: 30 Million Users
```

Answer:

1. What is a node?
2. What is a partition?
3. Is the dataset partitioned?
4. Is replication necessarily being used?
5. What happens if Node B fails and no replica exists?

### Exercise 2: Partitioning vs replication

Consider:

```text
Node A: Users 1–1000
Node B: Users 1001–2000
Node C: Users 1–1000 (copy)
```

Answer:

1. Which nodes contain different partitions?
2. Which node contains replicated data?
3. What is the purpose of the copy on Node C?
4. Does replication increase the total number of unique users stored?

### Exercise 3: Identify workload imbalance

A cluster has three nodes:

| Node |    Records | Requests/sec |
| ---- | ---------: | -----------: |
| A    | 10 million |        5,000 |
| B    | 10 million |        5,000 |
| C    | 10 million |       80,000 |

Answer:

1. Is the data balanced?
2. Is the workload balanced?
3. Which node is likely to become a bottleneck?
4. What information would you investigate before rebalancing?

### Exercise 4: MongoDB architecture

Explain the responsibility of:

1. Shards.
2. Replica sets.
3. Config servers.
4. `mongos`.
5. Shard keys.

Also explain what happens when a query includes the shard key and when it does not.

### Exercise 5: Design a cluster

Design a database cluster for an application with 30 million users.

Assume:

- Three initial nodes.
- Each node has limited storage.
- User data grows continuously.
- Read traffic is higher than write traffic.
- The system needs to survive individual node failures.

Draw an architecture showing:

- Nodes.
- Partitions.
- Replicas.
- Request routing.

Explain how your design handles a node failure and how it scales when a new node is added.

---

## 20. Chapter Summary

| Concept                 | Key takeaway                                             |
| ----------------------- | -------------------------------------------------------- |
| Node                    | Individual machine participating in a distributed system |
| Cluster                 | Group of connected nodes                                 |
| Partition               | Logical subset of a dataset                              |
| Shard                   | Database-specific distributed data unit                  |
| Partition ownership     | Determines which node manages a partition                |
| Coordinator             | Routes and coordinates requests                          |
| Primary                 | Coordinates writes in primary-based architectures        |
| Secondary               | Stores replicated data                                   |
| Replication             | Creates additional copies of data                        |
| Rebalancing             | Redistributes partitions across nodes                    |
| Hot partition           | Partition with disproportionately high workload          |
| MongoDB `mongos`        | Routes requests to shards                                |
| MongoDB config server   | Stores cluster metadata                                  |
| Cassandra partition key | Determines partition and token-based placement           |

### The most important points to remember

1. A node is a machine; a partition is a logical portion of data.
2. A cluster consists of multiple cooperating nodes.
3. Partitioning distributes unique data across nodes.
4. Replication creates additional copies of data.
5. Partitioning and replication are commonly used together.
6. A coordinator helps route requests to the correct nodes.
7. Partition ownership determines where operations are managed.
8. Rebalancing redistributes data when cluster capacity or workload changes.
9. Equal data distribution does not necessarily mean equal workload distribution.
10. MongoDB and Cassandra implement partitioning using different architectural mechanisms.

### Final mental model

```text
                  Distributed Database
                           |
                         Cluster
                           |
              +------------+------------+
              |            |            |
              v            v            v
            Node A       Node B       Node C
              |            |            |
              v            v            v
          Partition 1  Partition 2  Partition 3
              |            |            |
              +------------+------------+
                           |
                     Complete Dataset

              Replication creates
              additional copies of
              individual partitions.
```

**Engineering takeaway:** Nodes provide the infrastructure, partitions divide the data, and replication provides additional copies. Understanding how these three concepts work together is essential before learning how a distributed database decides where each record belongs.
