---
sidebar_label: 1. Introduction
sidebar_position: 1
---

#Graph Database Scaling and Tradeoffs

# 1. Introduction

**How do graph databases scale when the graph grows from thousands of nodes to millions or billions of nodes and relationships?**

Consider a social networking application.

Initially:

- 10,000 users.
- 100,000 relationships.
- A few thousand posts.

A single database server may handle this workload comfortably.

Now imagine the application grows to:

- 100 million users.
- 10 billion relationships.
- Billions of interactions.
- Millions of graph queries per minute.

The database must handle:

- Increasing storage requirements.
- More concurrent queries.
- Higher read and write throughput.
- Large relationship traversals.
- Failures of individual machines.
- Network communication between machines.

This is where graph database scaling becomes important.

---

# 2. Why Is Scaling Graph Databases Challenging?

Before discussing scaling strategies, understand what makes graph databases different from other databases.

Consider this graph:

```text
(User A) ----FOLLOWS----> (User B)
   |                           |
   |                           |
PURCHASED                   PURCHASED
   |                           |
   v                           v
(Product X) <---SIMILAR_TO-- (Product Y)
```

Suppose the database stores:

- User A on Server 1.
- User B on Server 2.
- Product X on Server 1.
- Product Y on Server 3.

A traversal from User A to Product Y may cross multiple servers.

```text
Server 1
   |
   v
User A
   |
   | FOLLOWS
   v
Server 2
   |
   v
User B
   |
   | PURCHASED
   v
Server 3
   |
   v
Product Y
```

Each cross-server traversal may require network communication.

This introduces latency and coordination overhead.

**The central scaling challenge:**

Graph queries frequently follow relationships, but connected nodes may be distributed across different machines.

This is different from a query that accesses one known partition using a partition key.

---

# 3. Vertical Scaling

Vertical scaling means increasing the resources of an existing database server.

You increase:

- CPU.
- RAM.
- Storage.
- Disk I/O capacity.
- Network capacity.

Example:

```text
Before:

+----------------------+
| Graph Database       |
| 4 CPU                |
| 16 GB RAM            |
| 500 GB SSD           |
+----------------------+

After:

+----------------------+
| Graph Database       |
| 32 CPU               |
| 256 GB RAM           |
| 4 TB NVMe SSD        |
+----------------------+
```

## 3.1 Why Is RAM Important?

Graph workloads often involve traversing relationships and processing intermediate results.

Memory can be used for:

- Cached graph records.
- Indexes.
- Frequently accessed properties.
- Query execution state.
- Traversal frontiers.
- Intermediate results.

A larger memory allocation can reduce disk access for frequently accessed data.

## 3.2 Advantages

- Simpler architecture.
- No distributed graph coordination required.
- Easier data locality.
- Lower network communication overhead.
- Often simpler operational management.

## 3.3 Disadvantages

- Hardware has practical limits.
- Large machines can be expensive.
- A single machine remains a failure domain.
- Eventually, the workload may exceed the machine's capacity.

## 3.4 When Is Vertical Scaling Useful?

Vertical scaling is useful when:

- The graph fits comfortably on one machine.
- Workloads benefit from local traversal.
- Operational simplicity is important.
- The database has not reached hardware limits.

Do not introduce distributed graph architecture before demonstrating that a single server is insufficient.

---

# 4. Horizontal Scaling

Horizontal scaling means distributing graph data and processing across multiple machines.

Instead of one powerful server, you use multiple servers.

Example:

```text
             Graph Application
                    |
                    v
              Graph Cluster
                    |
          +---------+---------+
          |         |         |
          v         v         v
       Server 1  Server 2  Server 3
          |         |         |
          v         v         v
       Graph     Graph     Graph
       Data      Data      Data
```

Each server stores or processes part of the graph, depending on the database architecture.

## 4.1 Why Horizontal Scaling?

It can increase:

- Total storage capacity.
- Aggregate processing capacity.
- Read throughput.
- Write throughput.
- Fault tolerance, depending on replication and architecture.

## 4.2 Why Is It Difficult for Graph Databases?

Suppose a graph is partitioned like this:

```text
Server 1:
A, B, C

Server 2:
D, E, F
```

Relationships:

```text
A -> B
B -> C
C -> D
D -> E
E -> F
```

Traversing from A to F requires crossing the partition boundary between C and D.

The database may need network communication to continue the traversal.

This can increase latency.

**Important:** Horizontal scaling does not guarantee that every graph query becomes faster. Some workloads benefit substantially, while others become slower due to distributed coordination.

---

# 5. Graph Partitioning and Sharding

Partitioning means dividing a large graph into smaller sections.

Each partition is stored or managed separately.

The objective is to distribute the graph while keeping frequently connected nodes close together where possible.

## 5.1 Example of Graph Partitioning

Consider:

```text
A ---- B ---- C ---- D ---- E ---- F
```

We divide the graph into two partitions.

```text
Partition 1:
A, B, C

Partition 2:
D, E, F
```

Graph:

```text
Partition 1          Partition 2

A ---- B ---- C  ---- D ---- E ---- F
                   ^
                   |
             Cross-partition edge
```

The relationship between C and D crosses the partition boundary.

This is called a cross-partition relationship.

## 5.2 Why Does Partition Placement Matter?

Suppose users frequently interact with one another.

If closely connected users are stored on different servers, relationship traversal may require repeated network communication.

If frequently connected nodes are stored together, more traversal can happen locally.

This is known as improving **graph locality**.

## 5.3 Graph Partitioning Objectives

A good partitioning strategy tries to:

1. Balance the amount of data across partitions.
2. Reduce cross-partition relationships.
3. Keep frequently traversed nodes close together.
4. Avoid overloaded partitions.
5. Minimize expensive data movement.

These objectives can conflict.

For example, putting all nodes connected to one popular user into the same partition may create an overloaded partition.

---

# 6. Graph Partitioning Strategies

There are several ways to partition graph data.

## 6.1 Hash-Based Partitioning

A hash function determines which partition stores a node.

Example:

```text
partition = hash(node_id) % number_of_partitions
```

Suppose there are four partitions:

```text
Partition 0
Partition 1
Partition 2
Partition 3
```

Node IDs are hashed and distributed.

```text
Node A -> Partition 2
Node B -> Partition 0
Node C -> Partition 3
Node D -> Partition 1
```

### Advantages

- Relatively simple.
- Can distribute nodes across partitions.
- Can reduce some forms of key-based hotspots.

### Disadvantages

- Connected nodes may be distributed randomly.
- Traversals may cross multiple partitions.
- Graph locality is not guaranteed.

Hash-based partitioning is common in distributed data systems, but it is not automatically optimal for relationship-heavy graphs.

## 6.2 Range-Based Partitioning

Nodes are assigned based on ranges of identifiers or another ordered key.

Example:

```text
Partition 1:
Node IDs 1 - 1000

Partition 2:
Node IDs 1001 - 2000

Partition 3:
Node IDs 2001 - 3000
```

### Advantages

- Simple range organization.
- Can support certain range-oriented access patterns.
- May preserve locality when identifiers reflect meaningful grouping.

### Disadvantages

- Sequential or skewed IDs can create hotspots.
- Related nodes may still be separated.
- Uneven data distribution is possible.

## 6.3 Graph-Aware Partitioning

Graph-aware partitioning attempts to place highly connected nodes together.

Example:

```text
Original graph:

A ---- B ---- C
|      |      |
D ---- E ---- F
```

A graph-aware strategy may group strongly connected nodes into the same partition.

```text
Partition 1:
A, B, D, E

Partition 2:
C, F
```

The objective is to reduce cross-partition edges.

### Advantages

- Can improve traversal locality.
- May reduce network communication.
- Useful for relationship-heavy workloads.

### Disadvantages

- Finding good partitions can be computationally expensive.
- Graph relationships can change frequently.
- Rebalancing may require substantial data movement.
- High-degree nodes can still cause hotspots.

## 6.4 Comparison

| Strategy    | Main idea                         | Main limitation                      |
| ----------- | --------------------------------- | ------------------------------------ |
| Hash-based  | Distribute nodes using a hash     | Related nodes may be separated       |
| Range-based | Distribute nodes using key ranges | Can create hotspots                  |
| Graph-aware | Group strongly connected nodes    | More complex to compute and maintain |

**Important:** Not every graph database exposes these strategies as user-configurable options. Some products manage partitioning internally or offer only specific distribution mechanisms.

---

# 7. Relationship Locality

Relationship locality means keeping frequently connected nodes close to each other in storage or execution.

Consider:

```text
User A -> User B -> User C -> User D
```

If all nodes are on one server:

```text
Server 1:
A -> B -> C -> D
```

Traversal can often happen locally.

If nodes are distributed:

```text
Server 1: A
Server 2: B
Server 3: C
Server 4: D
```

Traversal may require several network calls.

## 7.1 Why Is Locality Important?

Network communication is generally more expensive than accessing data already available in local memory.

Poor locality can cause:

- Higher query latency.
- More network traffic.
- Increased coordination.
- Greater sensitivity to slow nodes.
- Reduced throughput.

## 7.2 Can All Connected Nodes Be Stored Together?

Not always.

Imagine one popular user has 10 million followers.

If every follower is placed on the same server, that server may become overloaded.

There is a tradeoff between:

- Keeping connected nodes together.
- Distributing load evenly.

A good partitioning strategy must balance both.

---

# 8. Replication in Graph Databases

Partitioning and replication solve different problems.

**Partitioning:**

Divides graph data across machines.

**Replication:**

Maintains copies of data across machines.

Example:

```text
Partition 1:
Primary Copy -> Server A
Replica      -> Server B

Partition 2:
Primary Copy -> Server C
Replica      -> Server D
```

Replication can improve:

- Availability.
- Fault tolerance.
- Read capacity in some architectures.
- Recovery from node failures.

## 8.1 Why Is Replication Needed?

Suppose a graph database has one server:

```text
Server A:
All graph data
```

If Server A fails, the application may lose access to the database.

With replication:

```text
Server A:
Primary data

Server B:
Replica data
```

If the system supports suitable failover, Server B may take over when Server A becomes unavailable.

## 8.2 Replication Challenges

Replication introduces:

- Additional storage requirements.
- Network traffic.
- Replica synchronization.
- Failover complexity.
- Potentially stale reads.
- Conflict handling in some architectures.

Replication does not automatically guarantee that every read returns the latest committed data.

The actual guarantees depend on the database's consistency and replication model.

---

# 9. Consistency in Distributed Graph Databases

Suppose a user creates a relationship:

```text
(User A)-[:FOLLOWS]->(User B)
```

The database must persist this relationship and make it visible according to its consistency guarantees.

In a distributed database, replicas may need to synchronize.

Consider:

```text
Primary:
A -> B

Replica 1:
A -> B

Replica 2:
A -> B
```

Now suppose a new relationship is created:

```text
A -> C
```

During asynchronous replication:

```text
Primary:
A -> B
A -> C

Replica 1:
A -> B
A -> C

Replica 2:
A -> B
```

Replica 2 is temporarily behind.

This is replication lag.

## 9.1 Strong Consistency

Strong consistency means operations provide guarantees that prevent clients from observing certain stale or inconsistent states.

The precise guarantees differ across database products.

## 9.2 Eventual Consistency

Eventual consistency means replicas may temporarily differ, but under suitable conditions and after updates stop, they are expected to converge.

Example:

```text
Time 1:
Primary = A -> B
Replica = A -> B

Time 2:
Primary = A -> B, A -> C
Replica = A -> B

Time 3:
Primary = A -> B, A -> C
Replica = A -> B, A -> C
```

## 9.3 Why Does Consistency Matter for Graph Queries?

Suppose a fraud detection system creates a relationship:

```text
(Account A)-[:LINKED_TO]->(Account B)
```

A fraud investigation immediately queries the graph.

If it reads from a replica that has not received the relationship, it may miss an important connection.

For some use cases, this delay is acceptable.

For others, it may create business or security risks.

Therefore, consistency requirements should be part of database selection and query design.

---

# 10. Distributed Graph Query Execution

Let's understand what happens when a graph query spans multiple partitions.

Suppose the graph is:

```text
A -> B -> C -> D -> E
```

Partition placement:

```text
Partition 1:
A, B

Partition 2:
C, D

Partition 3:
E
```

Query:

```text
Find all nodes reachable from A within 4 hops.
```

## 10.1 Execution Flow

```text
                 Query
                   |
                   v
            Query Coordinator
                   |
                   v
            Locate Starting A
                   |
                   v
              Partition 1
                   |
                   v
              Traverse A -> B
                   |
                   v
          Cross to Partition 2
                   |
                   v
              Traverse C -> D
                   |
                   v
          Cross to Partition 3
                   |
                   v
              Reach Node E
                   |
                   v
             Combine Results
                   |
                   v
              Return Results
```

The system may need to:

1. Locate the starting node.
2. Identify its neighboring nodes.
3. Determine where those nodes are stored.
4. Send traversal requests to remote partitions.
5. Collect intermediate results.
6. Continue traversal.
7. Combine results.
8. Return the final output.

The actual implementation varies by database.

## 10.2 Why Can This Be Expensive?

Every remote traversal can involve:

- Network latency.
- Request coordination.
- Serialization and deserialization.
- Remote storage access.
- Intermediate result transfer.

A deep traversal across many partitions can become expensive even when the graph itself is relatively small.

## 10.3 How Can We Improve It?

Common approaches include:

- Better partition placement.
- Reducing unnecessary traversal depth.
- Starting from highly selective nodes.
- Using indexes.
- Applying relationship-type filters.
- Limiting result sets.
- Caching frequently accessed data.
- Avoiding unnecessarily broad graph queries.

---

# 11. Graph Database Performance Bottlenecks

Let's examine common production bottlenecks.

## 11.1 High-Degree Nodes

A node with millions of relationships can become expensive to traverse.

Example:

```text
             Celebrity User
           /   |   |   |   \
          /    |   |   |    \
       Millions of followers
```

A query retrieving all followers may generate a huge result set.

Possible mitigations:

- Pagination where supported by the application query.
- More selective relationship filters.
- Avoiding unnecessary full-neighbor retrieval.
- Separating hot aggregates from detailed relationship data.
- Caching suitable read results.

## 11.2 Deep Traversals

A query traversing 10 or 20 levels may explore an enormous number of paths.

Possible mitigations:

- Set maximum traversal depth.
- Filter relationship types.
- Filter node properties early.
- Restrict the starting population.
- Return only necessary data.

## 11.3 Large Result Sets

Consider:

```text
Find every user connected to User A.
```

If User A is connected to 20 million users, returning all those records is expensive.

The bottleneck may be result materialization and network transfer, not just graph traversal.

## 11.4 Poor Starting-Node Selection

Suppose a query begins from a very broad set of nodes.

The database may have to explore far more of the graph than necessary.

Prefer selective starting conditions.

For example:

```cypher
MATCH (u:User {userId: 101})
      -[:FOLLOWS]->(connected:User)
RETURN connected;
```

An indexed `userId` property can help locate the starting node.

## 11.5 Cross-Partition Traversal

If related nodes are spread across different machines, network communication can dominate query execution time.

Possible mitigations include:

- Improving graph locality.
- Choosing a suitable partitioning strategy.
- Reducing traversal depth.
- Avoiding unnecessary remote relationship expansion.

## 11.6 Memory Pressure

Large graph traversals can require substantial memory for:

- Intermediate results.
- Visited-node tracking.
- Paths.
- Query execution state.
- Caches.

Insufficient memory can cause slower execution and resource contention.

---

# 12. Graph Database Scaling vs Relational Database Scaling

Let's compare graph databases with relational databases.

| Feature                    | Relational database                         | Graph database                                          |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Primary data model         | Tables                                      | Nodes and relationships                                 |
| Vertical scaling           | Common                                      | Common                                                  |
| Horizontal scaling         | Replication, sharding, distributed SQL      | Product-specific distributed graph architecture         |
| Data partitioning          | Often based on keys or ranges               | May consider node distribution and graph locality       |
| Cross-partition operations | Distributed joins can be expensive          | Cross-partition traversal can be expensive              |
| Replication                | Widely supported                            | Product-dependent                                       |
| Query challenge            | Joins across distributed data               | Traversals across distributed graph data                |
| Locality concern           | Keep related records efficiently accessible | Keep frequently traversed nodes and relationships close |

## 12.1 Important Difference

Relational systems often distribute data according to partition keys.

Graph systems must consider both:

- How nodes are distributed.
- How relationships connect those nodes.

This makes graph partitioning particularly challenging.

A partitioning strategy that balances node counts may still produce a large number of cross-partition relationships.

---

# 13. Graph Database Scaling vs Cassandra Scaling

Since we studied Cassandra in Part 13, compare the two architectures.

| Feature                | Cassandra                                   | Distributed graph database                        |
| ---------------------- | ------------------------------------------- | ------------------------------------------------- |
| Primary focus          | Partition-oriented distributed data         | Relationship-oriented data                        |
| Data distribution      | Partition key and token placement           | Product-specific graph partitioning               |
| Query model            | Known partition-based access patterns       | Graph traversal                                   |
| Scaling challenge      | Hot partitions and uneven distribution      | Cross-partition traversal and graph locality      |
| Replication            | Built-in distributed replication mechanisms | Depends on the graph database                     |
| Common workload        | High-volume operational writes              | Relationship-heavy queries                        |
| Partitioning objective | Distribute data and load                    | Distribute data while managing graph connectivity |

Cassandra can distribute data effectively for its intended access patterns.

However, Cassandra is not a graph database simply because it can store relationship records.

A graph layer such as JanusGraph can use Cassandra as a storage backend, but that adds another architectural layer.

---

# 14. Practical Architecture Example: Social Network

Imagine a social network with:

- 100 million users.
- 10 billion follow relationships.
- 1 billion posts.
- High-volume likes and comments.

Possible logical graph:

```text
(User)-[:FOLLOWS]->(User)

(User)-[:CREATED]->(Post)

(User)-[:LIKED]->(Post)

(User)-[:COMMENTED_ON]->(Post)
```

A possible distributed architecture:

```text
                  Application
                       |
                       v
                Graph Query Layer
                       |
             +---------+---------+
             |         |         |
             v         v         v
          Graph 1   Graph 2   Graph 3
             |         |         |
             v         v         v
         Partition  Partition  Partition
             |         |         |
             +---------+---------+
                       |
                       v
                 Replication
```

The architecture needs to handle:

- User relationship lookups.
- Friend-of-friend traversal.
- Popular users with millions of followers.
- Frequent relationship updates.
- High-volume post interactions.
- Distributed queries.

## 14.1 Do All Social Network Data Need a Graph Database?

No.

A social network can use multiple storage systems.

For example:

| Data                        | Possible storage                                 |
| --------------------------- | ------------------------------------------------ |
| User profiles               | PostgreSQL or MongoDB                            |
| Sessions                    | Redis                                            |
| Posts                       | Relational or document database                  |
| Follow relationships        | Graph database or relational relationship tables |
| High-volume activity events | Cassandra or another event store                 |
| Search                      | Search engine                                    |
| Analytics                   | Analytical database                              |

The graph database should be used where graph traversal provides real value.

Do not put all application data into a graph database merely because the application contains relationships.

---

# 15. When Should You Scale a Graph Database?

Do not scale because the dataset looks large.

Scale when you have measured bottlenecks.

Look for:

- Increasing query latency.
- CPU saturation.
- Memory pressure.
- Storage bottlenecks.
- High disk I/O.
- High concurrency.
- Excessive network traffic.
- Uneven partition utilization.
- Replication lag.
- Slow cross-partition traversals.

## 15.1 Scaling Decision Framework

```text
              Performance Problem
                      |
                      v
             Identify the Bottleneck
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
         CPU         RAM         Disk
          |           |           |
          v           v           v
      Optimize     Increase    Improve I/O
      Queries      Memory      / Storage
                      |
                      v
              Is One Server Enough?
                      |
                +-----+-----+
                |           |
               Yes          No
                |           |
                v           v
            Vertical    Evaluate Distributed
            Scaling     Graph Architecture
```

Horizontal scaling should be considered after measuring whether vertical scaling and query optimization are sufficient.

---

# 16. Graph Database Tradeoffs

Let's summarize the main advantages and disadvantages.

## 16.1 Advantages

1. Relationships are first-class elements.
2. Relationship traversal is a natural query operation.
3. Complex connected-data queries can be easier to express.
4. Graph algorithms support network analysis.
5. Some graph databases provide efficient local traversal through adjacency-oriented storage.
6. Graph models can represent evolving relationship structures naturally.

## 16.2 Disadvantages

1. Distributed graph partitioning is challenging.
2. Cross-partition traversal can increase latency.
3. High-degree nodes can become bottlenecks.
4. Deep traversals can produce large intermediate result sets.
5. Graph queries may consume substantial memory.
6. Graph database operations require product-specific expertise.
7. Some graph databases have different scaling and transaction capabilities from relational databases.
8. Introducing another database increases operational complexity.

## 16.3 Summary Table

| Concern                 | Potential solution                               |
| ----------------------- | ------------------------------------------------ |
| CPU bottleneck          | Query optimization and additional compute        |
| Memory pressure         | Increase memory and optimize traversal           |
| Disk bottleneck         | Improve storage and caching                      |
| High-degree nodes       | Filter, paginate, cache, or redesign queries     |
| Deep traversals         | Bound traversal depth                            |
| Cross-partition latency | Improve locality and partition placement         |
| Uneven distribution     | Rebalance partitions                             |
| Replication lag         | Review replication and consistency configuration |

---

# 17. Interview Questions and Answers

## Q1. Why is horizontal scaling difficult for graph databases?

Because relationships can connect nodes stored on different machines.

Graph traversal may require network communication across partitions, increasing latency and coordination overhead.

## Q2. What is graph partitioning?

Graph partitioning divides a graph into smaller sections that can be stored or processed separately.

A good partitioning strategy attempts to balance load while minimizing expensive cross-partition relationships.

## Q3. What is graph locality?

Graph locality means keeping frequently connected nodes close together in storage or execution.

It can reduce network communication during traversal.

## Q4. What is a cross-partition traversal?

A cross-partition traversal occurs when a query follows relationships from nodes stored in one partition to nodes stored in another partition.

It may require network communication.

## Q5. What is the difference between vertical and horizontal scaling?

Vertical scaling increases the resources of one machine.

Horizontal scaling distributes data and workload across multiple machines.

## Q6. Why can a high-degree node cause performance problems?

A high-degree node has many relationships.

Queries traversing all its relationships may process huge numbers of edges and produce large result sets.

## Q7. What is the difference between partitioning and replication?

Partitioning divides data across machines.

Replication maintains additional copies of data.

Partitioning primarily supports distribution and capacity; replication primarily supports availability and resilience.

## Q8. Does replication guarantee strong consistency?

No.

Consistency depends on the database's replication and transaction model.

Asynchronous replication may allow replicas to lag behind the primary copy.

## Q9. Why is graph-aware partitioning useful?

It attempts to keep strongly connected nodes together, reducing cross-partition traversal and network communication.

However, it can be expensive to compute and maintain.

## Q10. What happens when a graph query crosses multiple servers?

The database may need to send traversal requests to remote partitions, collect results, and continue execution.

This can increase latency due to network communication and coordination.

## Q11. Is Cassandra a graph database?

No.

Cassandra is a wide-column distributed database.

It can be used as a storage backend for graph systems such as JanusGraph, but Cassandra itself does not provide the same native graph data model and traversal engine.

## Q12. Should you always use horizontal scaling for large graphs?

No.

First identify the bottleneck.

Vertical scaling, indexing, caching, and query optimization may be sufficient.

Distributed graph architecture introduces additional complexity and should be justified by actual requirements.

## Q13. What is the biggest tradeoff in distributed graph databases?

One of the biggest tradeoffs is balancing data distribution and graph locality.

Distributing nodes evenly helps balance resources, while keeping related nodes together can reduce traversal latency.

Achieving both is difficult.

---

# 18. Practical Exercises

## Exercise 1 — Identify the Scaling Problem

A graph database has:

- 20 million nodes.
- 200 million relationships.
- 90% CPU utilization.
- Low memory usage.
- High query latency.

What should you investigate?

Possible areas:

- Expensive traversals.
- Poor starting-node selection.
- Inefficient query plans.
- High-degree nodes.
- Excessive concurrency.

Do not immediately assume that adding more servers is the correct solution.

## Exercise 2 — Identify Cross-Partition Traversal

Graph:

```text
A -> B -> C -> D -> E
```

Partition placement:

```text
Partition 1: A, B
Partition 2: C, D
Partition 3: E
```

Questions:

1. How many partition boundaries does the path cross?
2. Why can these crossings increase latency?
3. How might graph-aware partitioning help?
4. Why might grouping all connected nodes together still create a hotspot?

## Exercise 3 — Design a Partitioning Strategy

A social network contains:

- Normal users with 100 followers.
- Influencers with 10 million followers.
- Millions of small communities.
- Users who frequently interact within the same community.

Propose a partitioning strategy.

Consider:

- User distribution.
- Community locality.
- High-degree users.
- Cross-partition relationships.
- Rebalancing costs.

There is no universally correct answer. Explain the tradeoffs.

## Exercise 4 — Scaling Decision

A graph database has increasing query latency.

Metrics:

| Metric           | Current value |
| ---------------- | ------------- |
| CPU              | 35%           |
| RAM              | 95%           |
| Disk utilization | 40%           |
| Network          | 25%           |
| Query latency    | High          |

What should you investigate first?

A likely starting point is memory pressure and cache behavior, along with query execution state and traversal size.

Adding CPU alone may not solve the problem.

## Exercise 5 — Architecture Design

Design an architecture for a fraud detection system.

Requirements:

- 50 million customer accounts.
- Multiple accounts can share devices.
- Transactions connect accounts.
- Fraud investigators need multi-hop relationship queries.
- The system must ingest new transactions continuously.

Explain:

1. Which entities become nodes?
2. Which connections become relationships?
3. Which data belongs in relationship properties?
4. Which database could serve the transactional system of record?
5. Where could a graph database fit?
6. How would new transactions reach the graph?
7. What happens if the graph is temporarily behind the transactional system?

---

# 19. Part 14D Summary

| Concept                     | What to remember                                 |
| --------------------------- | ------------------------------------------------ |
| Vertical scaling            | Increase resources on one machine                |
| Horizontal scaling          | Distribute workload across machines              |
| Graph partitioning          | Divide graph data into partitions                |
| Hash partitioning           | Distribute nodes using a hash                    |
| Range partitioning          | Distribute nodes using key ranges                |
| Graph-aware partitioning    | Group connected nodes to improve locality        |
| Graph locality              | Keep frequently traversed nodes close            |
| Cross-partition traversal   | Follow relationships across partitions           |
| Replication                 | Maintain additional copies of data               |
| Replication lag             | Delay between updates and replica visibility     |
| Strong consistency          | Provides stronger visibility guarantees          |
| Eventual consistency        | Replicas may temporarily differ but can converge |
| High-degree node            | Node with many relationships                     |
| Traversal depth             | Number of relationship hops explored             |
| Distributed query execution | Coordinates work across partitions or machines   |

## The Most Important Mental Model

```text
              Large Graph
                  |
                  v
          Identify Bottleneck
                  |
                  v
           Optimize Queries
                  |
                  v
          Evaluate Vertical Scale
                  |
                  v
          Evaluate Partitioning
                  |
                  v
          Improve Graph Locality
                  |
                  v
        Manage Replication and Consistency
                  |
                  v
       Monitor Cross-Partition Traversal
```

Remember these five principles:

1. Graph databases can scale vertically and horizontally, but distributed traversal introduces additional complexity.
2. Graph partitioning must consider both load distribution and relationship locality.
3. Cross-partition traversal can increase latency due to network communication.
4. Replication and partitioning solve different problems.
5. Scale only after measuring the actual bottleneck.

**The central architectural tradeoff:** A distributed graph database must balance keeping connected nodes close together with distributing data and workload evenly across machines.
