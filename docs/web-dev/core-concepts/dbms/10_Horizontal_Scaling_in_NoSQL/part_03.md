---
sidebar_label: Partitioning Strategies
sidebar_position: 1
---

# Partitioning Strategies

## 1. Introduction

In last 2 sections, we studied nodes and partitions, how NoSQL databases use partitioning and replication to scale horizontally.

Now we need to answer an important question:

**How does a distributed database decide which partition should store a particular record?**

Consider an application with 30 million users distributed across three database nodes.

```text
              Users Collection
                30 Million
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
```

The database needs a rule to decide:

- Which user belongs to Node A?
- Which user belongs to Node B?
- Which user belongs to Node C?
- How should new users be distributed?
- What happens when a new node is added?

This rule is determined by the **partitioning strategy**.

A poor strategy can create:

- Uneven data distribution.
- Hot partitions.
- Slow queries.
- Expensive data migration.
- Uneven storage consumption.

A good strategy distributes data according to the application's access patterns and growth requirements.

### Topics covered

1. Range-based partitioning.
2. Hash-based partitioning.
3. List-based partitioning.
4. Consistent hashing.
5. Directory-based partitioning.
6. Partition keys and shard keys.
7. Choosing a partition key.
8. Hot partitions and hotspots.
9. Partitioning strategy comparison.

---

## 2. What Is a Partitioning Strategy?

A partitioning strategy defines how records are divided into partitions and assigned to nodes.

Suppose we have these users:

| User ID | Name   |
| ------: | ------ |
|     101 | User A |
|     102 | User B |
|     103 | User C |
|     104 | User D |
|     105 | User E |
|     106 | User F |

We have three nodes:

```text
Node A
Node B
Node C
```

The database needs a rule to distribute these records.

Different strategies produce different distributions.

For example:

**Range-based:**

```text
Node A → User IDs 101–102
Node B → User IDs 103–104
Node C → User IDs 105–106
```

**Hash-based:**

```text
Hash(User ID) → Partition → Node
```

**List-based:**

```text
India  → Node A
USA    → Node B
UK     → Node C
```

The choice of strategy affects query routing, data distribution, and scalability.

---

## 3. Range-Based Partitioning

Range-based partitioning divides data according to ranges of a selected key.

Each partition is responsible for a particular range of values.

### 3.1 How it works

Suppose we have 9 million users.

We choose `userId` as the partition key.

We divide the records into three ranges:

```text
Partition 1:
userId = 1 to 3,000,000

Partition 2:
userId = 3,000,001 to 6,000,000

Partition 3:
userId = 6,000,001 to 9,000,000
```

Now assign these partitions to nodes:

```text
                 Users Collection
                        |
             +----------+----------+
             |          |          |
             v          v          v
          Node A      Node B      Node C
             |          |          |
             v          v          v
          Range 1     Range 2     Range 3
```

Each node stores the records belonging to its assigned range.

### 3.2 Example with dates

Suppose an application stores orders.

We choose `createdAt` as the partition key.

We create monthly partitions:

```text
Partition 1 → January 2026
Partition 2 → February 2026
Partition 3 → March 2026
Partition 4 → April 2026
```

Example:

| Order ID | Created At | Partition |
| -------- | ---------- | --------- |
| ORD-101  | 2026-01-05 | January   |
| ORD-102  | 2026-01-19 | January   |
| ORD-103  | 2026-02-10 | February  |
| ORD-104  | 2026-03-15 | March     |
| ORD-105  | 2026-04-02 | April     |

This makes time-based queries easier to target.

### 3.3 Query execution

Suppose the application executes:

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-02-01'
  AND created_at < '2026-03-01';
```

The database can identify the February partition.

It does not need to scan unrelated monthly partitions if partition pruning is supported and the query predicates allow it.

### 3.4 Advantages

- Easy to understand.
- Efficient for range queries.
- Supports time-based partitioning.
- Can enable partition pruning.
- Useful for historical data management.
- Old partitions can sometimes be archived or removed independently.

### 3.5 Disadvantages

- Uneven data distribution is possible.
- Sequential keys can create hotspots.
- New data may repeatedly target the newest partition.
- Some partitions may grow much larger than others.
- Rebalancing may be required when ranges become uneven.

### 3.6 The sequential-write problem

Suppose order IDs increase continuously:

```text
ORD-1001
ORD-1002
ORD-1003
ORD-1004
ORD-1005
```

If the latest ID always belongs to the highest range, new writes repeatedly target the same partition.

```text
Node A → Old Orders
Node B → Older Orders
Node C → Newest Orders
                    |
                    v
              Most New Writes
```

Node C may become a hotspot.

This is a major weakness of naive range-based partitioning for write-heavy workloads.

### 3.7 When to use range-based partitioning

Useful for:

- Time-series data.
- Historical orders.
- Logs.
- Financial records organized by time.
- Queries that frequently filter by ranges.
- Data retention and archival workloads.

---

## 4. Hash-Based Partitioning

Hash-based partitioning uses a hash function to distribute records across partitions.

Instead of assigning records according to their original values, the database calculates a hash of the partition key.

### 4.1 How it works

Suppose we have three partitions:

```text
Partition 0
Partition 1
Partition 2
```

We choose `userId` as the partition key.

A simplified formula:

\[
\text{Partition} = \text{hash(userId)} \bmod 3
\]

The hash function generates a number.

The modulo operation determines the destination partition.

### Example

Suppose:

```text
hash(101) = 500
hash(102) = 701
hash(103) = 908
hash(104) = 120
hash(105) = 333
hash(106) = 445
```

Calculate the partition:

| User ID | Hash value | Hash % 3 | Partition |
| ------: | ---------: | -------: | --------- |
|     101 |        500 |        2 | P2        |
|     102 |        701 |        2 | P2        |
|     103 |        908 |        2 | P2        |
|     104 |        120 |        0 | P0        |
|     105 |        333 |        0 | P0        |
|     106 |        445 |        1 | P1        |

The values above are illustrative, not the output of a specific production hash function.

### 4.2 Architecture

```text
                 User Record
                      |
                      v
                Hash Function
                      |
                      v
              Partition Calculation
                      |
           +----------+----------+
           |          |          |
           v          v          v
        Node A     Node B     Node C
         P0         P1         P2
```

The same partition key produces the same destination while the partitioning configuration remains unchanged.

### 4.3 Why use hashing?

Hashing generally distributes keys more evenly than naive range partitioning when the hash function and key distribution are appropriate.

For example, user IDs may be sequential:

```text
101
102
103
104
105
106
```

Range partitioning may group sequential IDs together.

Hashing distributes them across partitions instead.

### 4.4 Advantages

- Generally good distribution of keys.
- Reduces hotspots caused by sequential key ranges.
- Efficient routing when the partition key is known.
- Useful for large distributed datasets.
- Often suitable for high-volume workloads.

### 4.5 Disadvantages

- Range queries become difficult.
- Related values may be distributed across different partitions.
- Adding or removing partitions can require substantial remapping with simple modulo hashing.
- A poor partition key can still create hotspots.
- Queries without the partition key may require scatter-gather execution.

### 4.6 Range query problem

Suppose we partition users using a hash of `userId`.

Now we execute:

```sql
SELECT *
FROM users
WHERE user_id BETWEEN 1000 AND 2000;
```

The user IDs are not necessarily stored together.

The database may need to contact multiple partitions.

Hashing improves distribution, but it can make range-based access less efficient.

### 4.7 When to use hash-based partitioning

Useful for:

- User records.
- Session data.
- High-volume key-value workloads.
- Large collections with point lookups.
- Workloads where evenly distributing writes is important.

---

## 5. List-Based Partitioning

List-based partitioning divides data according to predefined values.

Each partition is assigned a specific set of values.

### 5.1 How it works

Suppose an application stores customer data from different countries.

We can partition using the `country` field.

```text
Partition 1:
India, Nepal, Bangladesh

Partition 2:
USA, Canada, Mexico

Partition 3:
UK, Germany, France
```

Architecture:

```text
               Customer Data
                     |
               Country Value
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
        Asia       Americas   Europe
```

### 5.2 Example

| Customer ID | Country | Partition |
| ----------- | ------- | --------- |
| 101         | India   | P1        |
| 102         | Nepal   | P1        |
| 103         | USA     | P2        |
| 104         | Canada  | P2        |
| 105         | Germany | P3        |
| 106         | France  | P3        |

### 5.3 Query execution

Suppose the application executes:

```sql
SELECT *
FROM customers
WHERE country = 'India';
```

The database can route the query to the partition containing India.

### 5.4 Advantages

- Easy to understand.
- Useful for category-based data separation.
- Queries filtering by partition values can be efficient.
- Can support geographic or tenant-based organization.
- Different categories can have different storage or retention policies.

### 5.5 Disadvantages

- Uneven distribution is possible.
- One category may contain most of the records.
- A popular category can become a hotspot.
- New categories may require configuration or reassignment.
- A large category may need further subdivision.

### 5.6 Example of uneven distribution

Suppose:

```text
India       → 70 Million Users
USA         → 15 Million Users
Germany     → 5 Million Users
Other       → 10 Million Users
```

If all Indian users are assigned to one partition, that partition may become much larger and busier than the others.

List partitioning is easy to understand, but it does not automatically guarantee balance.

### 5.7 When to use list-based partitioning

Useful for:

- Geographic regions.
- Business categories.
- Tenant groups.
- Product categories.
- Regulatory or data residency boundaries.

---

## 6. Consistent Hashing

Consistent hashing is a technique for distributing keys across nodes while minimizing the number of keys that need to move when the cluster changes.

This is especially useful in distributed systems where nodes may be added or removed frequently.

### 6.1 The problem with simple modulo hashing

Earlier, we used:

\[
\text{Partition} = \text{hash(key)} \bmod N
\]

Where:

- `key` is the partition key.
- `N` is the number of partitions or nodes.

Suppose there are three nodes:

```text
hash(key) % 3
```

Now we add a fourth node.

The calculation changes:

```text
hash(key) % 4
```

Many keys may map to different destinations.

This can require moving a large amount of data.

### Example

Suppose:

```text
hash(userId) = 500
```

With three nodes:

```text
500 % 3 = 2
```

The key belongs to Node 2.

After adding a fourth node:

```text
500 % 4 = 0
```

The key now belongs to Node 0.

This is not just one key. Many keys may change their assigned node.

**Important:** Simple modulo hashing can be perfectly reasonable when the partition count is fixed. The problem is that changing the count can cause extensive remapping.

### 6.2 How consistent hashing works

Consistent hashing maps both nodes and data keys onto a logical hash ring.

Imagine a circle representing the hash space.

```text
                 Hash Ring

                    Node A
                      |
               .-------------.
             /                 \
            /                   \
      Node D                     Node B
            \                   /
             \                 /
               '-------------'
                      |
                    Node C
```

Each node is assigned one or more positions on the ring.

A data key is also hashed onto the ring.

The key is assigned to the first node encountered while moving clockwise.

### 6.3 Example

Suppose we have three nodes:

```text
Node A
Node B
Node C
```

A key is hashed to a position on the ring.

```text
Key K1 → Position 120
Key K2 → Position 350
Key K3 → Position 700
```

Each key moves clockwise until it reaches its responsible node.

The exact numeric positions depend on the hash function and node assignments.

### 6.4 Adding a node

Initially:

```text
Ring:

Node A
Node B
Node C
```

Now add Node D.

```text
Ring:

Node A
Node B
Node C
Node D
```

Only keys whose ownership changes because of Node D's new position need to move.

The goal is to avoid remapping every key.

### 6.5 Removing a node

Suppose Node B fails or is removed.

The keys assigned to Node B can be reassigned to the next responsible node according to the ring.

```text
Before:

Node A
Node B
Node C

After:

Node A
Node C
```

Only the affected key range needs reassignment in the idealized model.

In real databases, replica placement and failure-recovery mechanisms add more complexity.

### 6.6 Virtual nodes

A problem with assigning only one position to each physical node is uneven distribution.

One node may receive a much larger range than another.

Virtual nodes solve this by assigning multiple positions to each physical node.

Example:

```text
Node A → A1, A2, A3
Node B → B1, B2, B3
Node C → C1, C2, C3
```

These virtual positions are distributed around the ring.

This can improve balance.

### 6.7 Advantages

- Reduces key movement when nodes are added or removed.
- Supports dynamic cluster membership.
- Useful for distributed caches and storage systems.
- Can improve load distribution through virtual nodes.

### 6.8 Disadvantages

- More complex than simple range or hash partitioning.
- Basic consistent hashing does not guarantee perfectly equal load.
- Virtual-node placement and weighting need careful design.
- Replica placement adds further complexity.
- Hot keys can still overload individual nodes.

### 6.9 Where is consistent hashing used?

Consistent hashing is an important concept in:

- Distributed caching.
- Distributed key-value systems.
- Storage systems.
- Some distributed database architectures.

**Important:** Do not assume every NoSQL database implements a literal hash ring. Databases may use other partition-placement mechanisms.

---

## 7. Directory-Based Partitioning

Directory-based partitioning uses a lookup table or metadata service to map records or tenants to partitions.

Instead of calculating the destination directly from a hash or range, the system consults a mapping.

### 7.1 How it works

Suppose we have three database shards:

```text
Shard A
Shard B
Shard C
```

A directory stores the mapping:

| Tenant ID | Shard   |
| --------- | ------- |
| T101      | Shard A |
| T102      | Shard B |
| T103      | Shard C |
| T104      | Shard A |
| T105      | Shard B |

When the application receives a request for tenant T103, it checks the directory.

```text
              Application
                   |
                   v
              Tenant ID
                T103
                   |
                   v
             Lookup Directory
                   |
                   v
               Shard C
```

### 7.2 Example in Node.js

```javascript
const shardDirectory = {
  T101: "shardA",
  T102: "shardB",
  T103: "shardC",
  T104: "shardA",
  T105: "shardB",
};

function getShardForTenant(tenantId) {
  const shardName = shardDirectory[tenantId];

  if (!shardName) {
    throw new Error("Shard mapping not found");
  }

  return shardName;
}
```

This is a simplified in-memory illustration. A production directory would need durable storage, synchronization, caching, and safe updates.

### 7.3 Advantages

- Flexible partition assignment.
- Individual tenants can be moved without changing the partitioning algorithm.
- Supports custom placement rules.
- Useful for multi-tenant applications.
- Large tenants can be assigned dedicated shards.

### 7.4 Disadvantages

- Directory lookup introduces additional work.
- Directory availability becomes important.
- Mapping updates must be coordinated.
- Stale mappings can route requests incorrectly.
- The directory itself needs scaling and fault tolerance.

### 7.5 When to use directory-based partitioning

Useful for:

- Multi-tenant SaaS applications.
- Enterprise customer isolation.
- Applications with uneven tenant sizes.
- Systems where tenants may need to move between shards.
- Custom data placement requirements.

---

## 8. Partition Key vs Shard Key

These terms are often used together, but their exact meanings depend on the database.

### Partition key

A partition key is the value used to determine which logical partition stores a record.

Example:

```javascript
{
  userId: 1050,
  name: "User A",
  email: "user@example.com"
}
```

If `userId` is the partition key, the database uses that value to determine partition placement.

### Shard key

A shard key is the key used by a sharding system to distribute data across shards.

In MongoDB, the shard key determines how documents are distributed among shards.

Example:

```javascript
sh.shardCollection("app.users", { userId: "hashed" });
```

This is an illustrative MongoDB command for a hashed shard-key configuration, assuming the database and collection have been prepared for sharding.

### Comparison

| Partition Key                          | Shard Key                                     |
| -------------------------------------- | --------------------------------------------- |
| General distributed database concept   | Commonly used in sharded database systems     |
| Determines logical partition placement | Determines document distribution among shards |
| Terminology varies by database         | MongoDB has a specific shard-key concept      |
| Used by databases such as Cassandra    | Used by MongoDB sharding                      |

Some systems use these terms almost interchangeably.

Always check the database's terminology.

---

## 9. Choosing a Good Partition Key

This is one of the most important decisions in distributed database design.

A partition key affects:

- Data distribution.
- Query routing.
- Write throughput.
- Storage balance.
- Hotspot risk.
- Rebalancing.
- Operational complexity.

A poor partition key can undermine horizontal scaling.

### 9.1 High cardinality

Cardinality means the number of distinct values in a field.

Consider:

```text
userId:
101
102
103
104
105
```

This has high cardinality if most users have unique IDs.

Now consider:

```text
status:
active
inactive
```

This has low cardinality.

A low-cardinality field often provides fewer possible partition values and can create uneven distribution.

### 9.2 Even distribution

A good partition key should distribute records and workload reasonably evenly.

For example:

```text
userId
```

may be a reasonable candidate if users have a broad, well-distributed range of IDs and the hashing strategy distributes them effectively.

However, unique values alone do not guarantee balanced workload.

A few highly active users may still create hot partitions.

### 9.3 Query patterns

Choose a key that supports the queries your application performs frequently.

Suppose most requests look like:

```javascript
db.orders.find({
  userId: 1050,
});
```

Partitioning orders by `userId` may help target a user's orders.

But consider a global report:

```javascript
db.orders.find({
  status: "pending",
});
```

If the query does not contain the shard key, it may need to visit multiple shards.

Partition-key selection is a trade-off between distribution and query locality.

### 9.4 Write distribution

A good partition key should avoid concentrating all writes on one partition.

For example, monotonically increasing IDs combined with range partitioning can direct new writes to the newest range.

A hash-based strategy may distribute those writes more evenly.

### 9.5 Stability

A partition key should generally be stable.

If the partition key changes frequently, records may need to move between partitions.

This creates additional write and migration complexity.

### 9.6 Avoid excessive concentration

A field such as:

```text
country
```

may look attractive because it groups related users.

But if 70% of users belong to one country, one partition may become much larger than others.

Always examine actual data distribution.

---

## 10. Comparing Partitioning Strategies

| Strategy           | How it distributes data                                        | Main advantage                              | Main disadvantage                     |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------- |
| Range-based        | According to value ranges                                      | Efficient range queries                     | Sequential hotspots and uneven ranges |
| Hash-based         | Hash of partition key                                          | Generally even key distribution             | Range queries become difficult        |
| List-based         | According to predefined values                                 | Easy category-based placement               | Uneven category sizes                 |
| Consistent hashing | Keys and nodes mapped onto a hash ring or equivalent structure | Minimizes remapping when membership changes | More complex placement                |
| Directory-based    | Lookup table maps keys to partitions                           | Flexible custom placement                   | Directory management and availability |

### Which strategy should you choose?

| Workload                  | Possible strategy                                     |
| ------------------------- | ----------------------------------------------------- |
| Time-based logs           | Range-based                                           |
| User point lookups        | Hash-based                                            |
| Geographic separation     | List-based or directory-based                         |
| Dynamic distributed cache | Consistent hashing                                    |
| Multi-tenant SaaS         | Directory-based                                       |
| Sequential order creation | Hash-based or a carefully designed composite strategy |

These are starting points, not universal rules. The final choice depends on query patterns, data distribution, and the database's implementation.

---

## 11. Composite Partition Keys

Sometimes one field is insufficient to distribute data effectively.

A composite partition key combines multiple fields.

Example:

```text
tenantId + userId
```

Or:

```text
country + userId
```

Suppose a multi-tenant application stores user activity.

A partition key based only on `tenantId` may create hotspots if one tenant is significantly larger than the others.

A composite key can distribute data within a tenant.

### Example

```text
Tenant A + User 101
Tenant A + User 102
Tenant A + User 103

Tenant B + User 201
Tenant B + User 202
```

The database may use both values when determining partition placement.

### Advantages

- Can improve distribution.
- Can preserve some data locality.
- Can reduce concentration on a single key.
- Can align partitioning with application access patterns.

### Disadvantages

- Queries may need both key components for efficient targeting.
- More complicated data modeling.
- Composite keys do not automatically guarantee even distribution.
- Cross-partition queries may become more expensive.

**Important:** A composite partition key does not necessarily mean every database hashes both values in the same way. The exact behavior is database-specific.

---

## 12. Hot Partitions and Hot Keys

A hot partition occurs when one partition receives disproportionately high traffic or expensive operations.

This can happen even when data is distributed evenly by record count.

### Example

Suppose a social media application stores posts.

```text
Node A: 10 Million Posts
Node B: 10 Million Posts
Node C: 10 Million Posts
```

The data distribution looks balanced.

But one viral post receives 100,000 requests per second.

If those requests all target the same partition, the responsible node may become overloaded.

```text
Node A: 10,000 requests/sec
Node B: 10,000 requests/sec
Node C: 100,000 requests/sec
```

Node C becomes the bottleneck.

### Why do hot partitions happen?

Common causes:

- Sequential range keys.
- Low-cardinality partition keys.
- Extremely popular tenants.
- Viral content.
- Highly active users.
- Uneven geographic distribution.
- Poorly chosen shard keys.

### Solutions

**1. Use a better partition key**

Choose a key that distributes workload more evenly.

**2. Use hash-based distribution**

Hashing can reduce concentration caused by sequential key ranges.

**3. Add bucketing or salting**

Instead of placing all records under one logical key, divide them into multiple buckets.

Example:

```text
postId = 100

Buckets:
100:0
100:1
100:2
100:3
```

Writes can be distributed across buckets.

The application may need to query and combine the buckets when reading the total result.

**4. Separate large tenants**

Move an unusually large tenant to a dedicated shard.

**5. Cache popular data**

Frequently accessed read-heavy records may be served from a cache.

**6. Redesign the data model**

Sometimes the partition key is not the only problem. The application may need a different access pattern or aggregation strategy.

---

## 13. Database-Specific Partitioning Examples

Different NoSQL databases implement data placement differently.

### 13.1 MongoDB: Range and Hashed Sharding

MongoDB supports range-based and hashed shard keys, among other shard-key configurations.

**Range sharding:**

Documents are distributed according to ranges of shard-key values.

```javascript
sh.shardCollection("app.users", { userId: 1 });
```

A range shard key can support targeted range queries.

However, monotonically increasing values can cause write concentration on the shard owning the newest range.

**Hashed sharding:**

MongoDB hashes the shard-key value before distributing documents.

```javascript
sh.shardCollection("app.users", { userId: "hashed" });
```

Hashed sharding generally helps distribute sequential key values more evenly.

However, range queries on the original key are less efficient because the hash does not preserve the original ordering.

### 13.2 Cassandra: Partition Keys and Token-Based Distribution

Cassandra uses partition keys to calculate tokens.

The token determines the partition's position in the cluster's token space.

Example:

```sql
CREATE TABLE user_events (
    user_id UUID,
    event_id TIMEUUID,
    event_type TEXT,
    PRIMARY KEY (user_id, event_id)
);
```

Here:

- `user_id` is the partition key.
- `event_id` is a clustering column.

All events for a given user are stored in the same logical partition.

This supports queries such as:

```sql
SELECT *
FROM user_events
WHERE user_id = ?;
```

But if one user generates an enormous number of events, that user's partition may become large or hot.

A bucketing strategy can help:

```sql
CREATE TABLE user_events (
    user_id UUID,
    bucket INT,
    event_id TIMEUUID,
    event_type TEXT,
    PRIMARY KEY ((user_id, bucket), event_id)
);
```

The partition key is now the combination of `user_id` and `bucket`.

The application must calculate or manage the bucket when writing and querying.

### 13.3 Redis Cluster: Hash Slots

Redis Cluster maps keys to 16,384 hash slots.

Conceptually:

```text
Key
 |
 v
CRC16 Hash
 |
 v
Modulo 16384
 |
 v
Hash Slot
 |
 v
Responsible Node
```

Redis Cluster distributes hash slots across primary nodes.

A key can use a hash tag to force related keys into the same hash slot.

Example:

```text
user:{101}:profile
user:{101}:settings
user:{101}:cart
```

The substring inside `{}` is used for the hash calculation.

These keys therefore map to the same hash slot.

This is useful when a multi-key operation requires related keys to reside in the same slot.

However, placing too many keys under one hash tag can create concentration.

---

## 14. Partitioning and Query Performance

Partitioning is not only about where data is stored.

It directly affects query execution.

Consider two queries.

### Query A: Targeted query

```sql
SELECT *
FROM orders
WHERE user_id = 1050;
```

Assume `user_id` is the partition key.

The database can route the request to the responsible partition.

```text
Application
    |
    v
Partition Router
    |
    v
Node B
    |
    v
Return Orders
```

### Query B: Global query

```sql
SELECT *
FROM orders
WHERE status = 'pending';
```

Assume `status` is not part of the partition key.

The database may need to query multiple nodes.

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

### Comparison

| Feature              | Targeted Query         | Scatter-Gather Query                  |
| -------------------- | ---------------------- | ------------------------------------- |
| Partitions contacted | One or a limited set   | Potentially many                      |
| Network overhead     | Lower                  | Higher                                |
| Query coordination   | Less                   | More                                  |
| Performance          | Often more predictable | Depends on all participating nodes    |
| Typical requirement  | Partition key present  | Partition key missing or insufficient |

A good partitioning strategy should align with the application's most important query patterns.

---

## 15. Common Misconceptions

| Misconception                                               | Correct understanding                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hash partitioning always guarantees perfect balance         | It improves distribution but cannot eliminate hot keys or uneven workload |
| Range partitioning is always bad                            | It is useful for range queries and time-based data                        |
| A unique key is automatically a good partition key          | Uniqueness does not guarantee balanced traffic                            |
| Consistent hashing eliminates all data movement             | It reduces remapping but still requires data movement for affected ranges |
| Consistent hashing guarantees equal load                    | Virtual nodes and weighting improve balance, but hotspots remain possible |
| List partitioning always distributes data evenly            | Categories may have very different sizes                                  |
| Directory-based partitioning has no single point of failure | The directory needs replication, caching, and recovery                    |
| Composite keys automatically solve hotspots                 | They help only when the combined key distributes workload appropriately   |
| A targeted query is always fast                             | Local indexes, node load, and query complexity still matter               |
| Shard-key changes are trivial                               | Changing partition placement may require substantial data migration       |

---

## 16. Interview Questions and Answers

### Q1. What is a partitioning strategy?

A partitioning strategy defines how records are divided into logical partitions and assigned to nodes.

### Q2. What is range-based partitioning?

It divides data according to ranges of values, such as user IDs or timestamps.

### Q3. What is hash-based partitioning?

It applies a hash function to the partition key and uses the result to determine partition placement.

### Q4. What is list-based partitioning?

It assigns predefined values or groups of values to specific partitions.

### Q5. What is consistent hashing?

A distribution technique that maps keys and nodes onto a logical hash ring or equivalent structure, minimizing key movement when cluster membership changes.

### Q6. Why is consistent hashing useful?

It reduces the number of keys that need to move when nodes are added or removed.

### Q7. What are virtual nodes?

Virtual nodes are multiple logical positions assigned to one physical node to improve distribution across a consistent hash ring.

### Q8. What is directory-based partitioning?

It uses a lookup table or metadata service to map records or tenants to specific partitions.

### Q9. What is a partition key?

A value used to determine which logical partition stores a record.

### Q10. What is a shard key in MongoDB?

The field or fields MongoDB uses to distribute documents across shards.

### Q11. What makes a good partition key?

A good partition key should provide reasonable distribution, support important query patterns, avoid hotspots, and remain relatively stable.

### Q12. What is cardinality?

Cardinality is the number of distinct values in a field.

### Q13. What is a hot partition?

A partition that receives disproportionately high traffic or computational work.

### Q14. How can hot partitions be reduced?

Use better partition keys, hashing, bucketing, salting, dedicated shards, caching, or data-model redesign.

### Q15. Why can hash partitioning make range queries difficult?

Hashing does not preserve the original ordering of values, so nearby values may be placed in different partitions.

### Q16. What is the difference between range and hash partitioning?

Range partitioning groups nearby values together. Hash partitioning distributes values according to their hash results.

### Q17. What is a composite partition key?

A partition key formed from multiple fields to improve data placement or query locality.

### Q18. Why is a monotonically increasing key risky for range partitioning?

New records can repeatedly target the newest range, creating a write hotspot.

---

## 17. Practical Exercises

### Exercise 1: Choose the partitioning strategy

Select a suitable starting strategy for each workload and explain your reasoning.

| Workload                         | Your choice |
| -------------------------------- | ----------- |
| Time-based application logs      | ?           |
| User profile lookups by user ID  | ?           |
| Customer data grouped by country | ?           |
| Dynamic distributed cache        | ?           |
| Multi-tenant SaaS application    | ?           |
| Sequential order creation        | ?           |

### Exercise 2: Identify the hotspot

A system has three partitions:

```text
Partition A: 10 Million records
Partition B: 10 Million records
Partition C: 10 Million records
```

Request distribution:

```text
Partition A: 10,000 requests/sec
Partition B: 10,000 requests/sec
Partition C: 90,000 requests/sec
```

Answer:

1. Is the data balanced?
2. Is the workload balanced?
3. Which partition is hot?
4. Why might record count be insufficient for evaluating partition balance?
5. Suggest two solutions.

### Exercise 3: Hash partition calculation

Suppose the simplified partitioning formula is:

\[
\text{Partition} = \text{hash(key)} \bmod 4
\]

Given:

| Key | Hash Value |
| --- | ---------: |
| A   |        120 |
| B   |        253 |
| C   |        342 |
| D   |        401 |
| E   |        500 |

Calculate the partition for each key.

Then explain why changing the divisor from 4 to 5 can remap many keys.

### Exercise 4: Design a partition key

You are building a multi-tenant application.

Requirements:

- 100,000 tenants.
- Some tenants have 100 users.
- Some tenants have 5 million users.
- Most queries filter by tenant ID.
- A few large tenants generate very high traffic.

Answer:

1. Would `tenantId` alone be sufficient?
2. What problems could occur?
3. Could a composite key help?
4. Should large tenants receive dedicated shards?
5. How would a directory-based approach help?

### Exercise 5: MongoDB shard-key design

Consider these documents:

```javascript
{
  userId: 101,
  country: "India",
  status: "active",
  createdAt: ISODate("2026-11-14")
}
```

Most application queries are:

```javascript
db.users.findOne({
  userId: 101,
});
```

Additional queries include:

```javascript
db.users.find({
  country: "India",
});
```

Answer:

1. Which field would you initially consider as a shard key?
2. What are the advantages of hashing `userId`?
3. What query may become expensive?
4. What happens if one country has a disproportionately large user base?
5. What metrics would you monitor after deploying the shard key?

---

## 18. Chapter Summary

| Strategy / Concept           | Key takeaway                                     |
| ---------------------------- | ------------------------------------------------ |
| Range-based partitioning     | Divides data according to value ranges           |
| Hash-based partitioning      | Uses a hash function to distribute keys          |
| List-based partitioning      | Groups predefined values into partitions         |
| Consistent hashing           | Reduces remapping when nodes change              |
| Virtual nodes                | Improve distribution across a hash ring          |
| Directory-based partitioning | Uses a lookup mapping to locate partitions       |
| Partition key                | Determines logical partition placement           |
| Shard key                    | Determines data distribution across shards       |
| Cardinality                  | Number of distinct values                        |
| Composite key                | Combines multiple fields                         |
| Hot partition                | Receives disproportionate workload               |
| Bucketing / salting          | Splits concentrated keys into multiple buckets   |
| Targeted query               | Routes to a specific partition                   |
| Scatter-gather               | Queries multiple partitions and combines results |

### The most important points to remember

1. A partitioning strategy decides where records are stored.
2. Range partitioning is useful for ordered and time-based queries.
3. Hash partitioning generally distributes keys more evenly.
4. List partitioning is useful for predefined categories.
5. Consistent hashing reduces remapping when cluster membership changes.
6. Directory-based partitioning provides flexible placement.
7. A good partition key must balance distribution and query efficiency.
8. High cardinality is useful but does not guarantee balanced traffic.
9. Hot partitions can occur even when record counts are balanced.
10. Partition-key design is one of the most important decisions in a distributed database.

### Final mental model

```text
                  Record
                     |
                     v
                Partition Key
                     |
                     v
             Partitioning Strategy
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
     Range          Hash          List
       |             |             |
       +-------------+-------------+
                     |
                     v
               Partition Mapping
                     |
                     v
                  Database
                    Node
```

**Engineering takeaway:** Choosing a partitioning strategy is not just about distributing records evenly. It is about distributing data and workload while keeping important queries efficient. A partition key that looks good on paper can become a production bottleneck if it does not match real traffic patterns.
