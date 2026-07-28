---
sidebar_label: Sharding Strategies
sidebar_position: 1
---

# Sharding Strategies

## 1. Introduction: How Do We Decide Which Data Goes to Which Shard?

In last section, we learned that sharding distributes a large dataset across multiple database servers.

But an important question remains:

**How does the system decide which record belongs to which shard?**

Imagine an e-commerce application with:

- 100 million users
- 10 database servers
- 10 million users per server, ideally

You need a strategy to distribute users across those servers.

A poor distribution strategy can create problems:

- One server stores too much data.
- One server receives most of the traffic.
- Some servers remain underutilized.
- Adding a new server becomes difficult.
- Queries become expensive because the router cannot locate the required data efficiently.

The strategy used to distribute records is called a **sharding strategy**.

In this chapter, we will study:

1. Range-based sharding
2. Hash-based sharding
3. Directory-based sharding
4. Geographic sharding
5. Tenant-based sharding
6. Choosing a shard key
7. Data distribution and workload balance
8. Hot shards and hot partitions
9. Consistent hashing
10. Shard expansion and rebalancing

---

## 2. Range-Based Sharding

### 2.1 What Is Range-Based Sharding?

Range-based sharding distributes records according to ranges of a shard key.

For example, suppose you have 100 million users and choose `user_id` as your shard key.

You divide the users into ranges:

| Shard    | User ID Range          |
| -------- | ---------------------- |
| Shard 1  | 1–10,000,000           |
| Shard 2  | 10,000,001–20,000,000  |
| Shard 3  | 20,000,001–30,000,000  |
| Shard 4  | 30,000,001–40,000,000  |
| ...      | ...                    |
| Shard 10 | 90,000,001–100,000,000 |

Each shard stores records whose shard-key values fall within its assigned range.

### 2.2 Architecture

```text
                Application
                     |
                Shard Router
                     |
          -------------------------
          |           |           |
          v           v           v
       Shard 1     Shard 2     Shard 3
       1-1000      1001-2000   2001-3000
```

Suppose the application requests:

```sql
SELECT *
FROM users
WHERE user_id = 1500;
```

The router checks the range:

- 1500 is greater than 1000.
- 1500 is less than or equal to 2000.
- Therefore, the query goes to Shard 2.

### 2.3 How Range-Based Routing Works

Conceptually:

```javascript
function getShard(userId) {
  if (userId <= 1000) {
    return "shard1";
  }

  if (userId <= 2000) {
    return "shard2";
  }

  if (userId <= 3000) {
    return "shard3";
  }

  throw new Error("User ID outside configured ranges");
}
```

This is a simplified example. Production systems usually maintain shard metadata instead of hardcoding every range.

### 2.4 Advantages

**1. Efficient range queries**

Suppose you need users with IDs between 1200 and 1800.

The router knows that the relevant range belongs to Shard 2.

```sql
SELECT *
FROM users
WHERE user_id BETWEEN 1200 AND 1800;
```

Only one shard needs to be queried in this example.

**2. Simple routing**

The router can determine the destination using range boundaries.

**3. Natural ordering**

Range-based sharding can be useful when records are frequently queried by ordered values such as dates or IDs.

### 2.5 Disadvantages

**1. Uneven distribution**

Suppose most new users receive sequential IDs.

New registrations may keep going to the shard that owns the newest ID range.

```text
Shard 1: Older users
Shard 2: Older users
Shard 3: Most recent users
```

Shard 3 may receive most of the new writes.

This creates a hot shard.

**2. Rebalancing complexity**

When a range becomes too large, records may need to be moved to another shard.

**3. Traffic imbalance**

Equal ID ranges do not necessarily mean equal traffic.

Some ranges may contain more active users than others.

### 2.6 When Should You Use Range-Based Sharding?

It can be suitable when:

- Range queries are common.
- The shard key has a meaningful ordering.
- Data distribution is reasonably predictable.
- The system can manage range boundaries and rebalancing.

Examples:

- Time-based event records
- Historical order data
- Sequentially organized datasets

However, sequential keys require special attention because they can concentrate writes on the newest range.

---

## 3. Hash-Based Sharding

### 3.1 What Is Hash-Based Sharding?

Hash-based sharding uses a hash function to calculate which shard should store a record.

Instead of checking numeric ranges, the system applies a hash function to the shard key.

The result determines the destination shard.

For example:

```text
user_id
   |
   v
Hash Function
   |
   v
Hash Value
   |
   v
Shard Selection
```

### 3.2 Example

Suppose you have three shards.

A simplified hash-based strategy might be:

\[
\text{Shard Number} = \text{hash(user_id)} \bmod 3
\]

The modulo operation returns a remainder of 0, 1, or 2.

We map those values to three shards:

| Modulo Result | Destination |
| ------------- | ----------- |
| 0             | Shard 1     |
| 1             | Shard 2     |
| 2             | Shard 3     |

For illustration, assume these hash outputs:

| User ID | Hash Output | Hash % 3 | Shard   |
| ------- | ----------: | -------: | ------- |
| 101     |          42 |        0 | Shard 1 |
| 102     |          76 |        1 | Shard 2 |
| 103     |          83 |        2 | Shard 3 |
| 104     |          57 |        0 | Shard 1 |
| 105     |          91 |        1 | Shard 2 |
| 106     |         120 |        0 | Shard 1 |

The actual hash function and outputs depend on the implementation.

### 3.3 How Routing Works

Conceptual JavaScript example:

```javascript
function getShard(userId) {
  const shardCount = 3;

  const hash = hashFunction(userId);

  const shardIndex = hash % shardCount;

  return `shard${shardIndex + 1}`;
}
```

Here, `hashFunction()` represents a suitable deterministic hash function. It is a placeholder, not a built-in JavaScript function.

The same key must consistently map to the same shard under the same shard configuration.

### 3.4 Advantages

**1. Generally good distribution**

A well-designed hash function can distribute records relatively evenly across shards.

**2. Avoids sequential-key concentration**

Sequential IDs are spread across different shards rather than all new IDs going to the newest range.

**3. Simple routing**

The router can calculate the destination from the shard key.

**4. Useful for equality queries**

A query using the shard key can be routed to one shard.

Example:

```sql
SELECT *
FROM users
WHERE user_id = 105;
```

The router hashes `105` and identifies the destination shard.

### 3.5 Disadvantages

**1. Range queries become expensive**

Suppose you need:

```sql
SELECT *
FROM users
WHERE user_id BETWEEN 100 AND 500;
```

Because IDs are distributed according to hash values, this range may span multiple shards.

The router may need to query several shards.

**2. Adding a shard can be difficult**

With simple modulo hashing:

\[
\text{shard} = \text{hash(key)} \bmod N
\]

Changing the number of shards from 3 to 4 can change the destination for many existing keys.

This can require substantial data movement.

**3. Data locality is reduced**

Records with nearby key values may be stored on different servers.

### 3.6 When Should You Use Hash-Based Sharding?

It is useful when:

- Data should be distributed relatively evenly.
- Equality lookups are common.
- Sequential inserts would otherwise create a hot range.
- Range-query locality is not the primary requirement.

Examples:

- User accounts
- Session records
- Customer records
- High-volume key-based workloads

---

## 4. Directory-Based Sharding

### 4.1 What Is Directory-Based Sharding?

Directory-based sharding uses a lookup mechanism that explicitly maps records or tenants to their assigned shards.

Instead of calculating the destination from a range or hash function, the router looks up a mapping.

Example:

| Tenant ID | Shard   |
| --------- | ------- |
| 101       | Shard 1 |
| 102       | Shard 2 |
| 103       | Shard 1 |
| 104       | Shard 3 |
| 105       | Shard 2 |

The directory stores the relationship between a key and its destination shard.

### 4.2 Architecture

```text
              Application
                   |
                   v
              Shard Router
                   |
                   v
             Shard Directory
                   |
          ---------------------
          |         |         |
          v         v         v
       Shard 1   Shard 2   Shard 3
```

The directory can be implemented using:

- A metadata database
- A distributed key-value store
- A routing metadata service
- A carefully managed configuration system

### 4.3 Example

Suppose a SaaS application has three shards.

Tenant 101 belongs to Shard 1.

Tenant 102 belongs to Shard 2.

Tenant 103 belongs to Shard 1.

A request arrives:

```text
GET /tenants/103/projects
```

The router:

1. Extracts `tenant_id = 103`.
2. Looks up the tenant in the directory.
3. Finds Shard 1.
4. Routes the query to Shard 1.

### 4.4 Conceptual Database Design

A directory might contain:

```sql
CREATE TABLE tenant_shard_mapping (
    tenant_id BIGINT PRIMARY KEY,
    shard_id VARCHAR(50) NOT NULL
);
```

Example records:

```sql
INSERT INTO tenant_shard_mapping
    (tenant_id, shard_id)
VALUES
    (101, 'shard1'),
    (102, 'shard2'),
    (103, 'shard1'),
    (104, 'shard3');
```

A routing service can query this mapping to identify the destination.

This is a conceptual example. In production, the directory must be available, protected against inconsistent updates, and designed to avoid becoming a bottleneck.

### 4.5 Advantages

**1. Flexible distribution**

You can assign different tenants or records to different shards without changing a global hash or range formula.

**2. Easier targeted migration**

You can move a tenant to another shard by updating its mapping, provided the data has been migrated safely.

**3. Supports uneven tenant sizes**

Large tenants can be assigned dedicated shards, while smaller tenants can share shards.

**4. Flexible routing**

The system can make placement decisions using business-specific information.

### 4.6 Disadvantages

**1. Directory dependency**

The routing system depends on the directory being available and correct.

**2. Metadata management**

Mappings must be updated safely when records move.

**3. Potential bottleneck**

If every request performs an expensive directory lookup, the directory can become a performance bottleneck.

Caching and efficient lookup mechanisms can reduce this problem.

### 4.7 When Should You Use Directory-Based Sharding?

It is useful when:

- Tenants have very different sizes.
- Data placement needs flexibility.
- Records need to be moved between shards.
- The system needs explicit control over data location.

Examples:

- Multi-tenant SaaS platforms
- Enterprise applications
- Large customer databases

---

## 5. Geographic Sharding

### 5.1 What Is Geographic Sharding?

Geographic sharding distributes data based on geographical location.

For example, an application may operate in:

- India
- Europe
- North America
- Asia-Pacific

You can assign users to database servers based on their region.

```text
                Global Application
                        |
                  Geographic Router
                 /        |        \
                v         v         v
             India      Europe   North America
              DB          DB         DB
```

A user associated with India may be routed to an India-region database.

A user associated with Europe may be routed to a Europe-region database.

### 5.2 Why Use Geographic Sharding?

**1. Lower latency**

Users can access data from a geographically closer database server.

**2. Data residency requirements**

Some businesses or regulations require certain data to remain within specific geographical boundaries.

**3. Regional workload isolation**

Different regions can process their workloads independently.

**4. Regional autonomy**

A regional database can continue serving some operations even when connectivity to another region is impaired, depending on the architecture.

### 5.3 Example

Imagine an international e-commerce application:

| Region        | Database            |
| ------------- | ------------------- |
| India         | India Shard         |
| Europe        | Europe Shard        |
| North America | North America Shard |

A user in India accesses the India database.

```text
India User
    |
    v
India Application
    |
    v
India Database
```

This can reduce the network distance between the user and database.

### 5.4 Disadvantages

- Users may travel or change regions.
- Some records may need to move.
- Cross-region queries can be expensive.
- Global reporting may require data aggregation.
- Regional failover can be complicated.
- Data residency rules require careful interpretation.

### 5.5 When Should You Use Geographic Sharding?

It is useful for:

- Global applications
- Regional marketplaces
- International SaaS platforms
- Applications with geographical data-residency requirements

Geographic placement must be based on actual business and regulatory requirements, not just user IP addresses.

---

## 6. Tenant-Based Sharding

### 6.1 What Is Tenant-Based Sharding?

Tenant-based sharding distributes data according to the tenant or customer that owns the data.

This is common in multi-tenant SaaS applications.

Imagine a platform used by 10,000 companies.

Each company has:

- Employees
- Projects
- Tasks
- Documents
- Activity logs

The database can distribute tenants across shards.

```text
                SaaS Application
                       |
                  Shard Router
                       |
             ---------------------
             |         |         |
             v         v         v
          Shard 1   Shard 2   Shard 3
          --------  --------  --------
          Tenant    Tenant    Tenant
          1-3000    3001-6000 6001-10000
```

### 6.2 How It Works

Suppose a request arrives:

```text
GET /tenants/105/projects
```

The backend extracts:

```javascript
const tenantId = 105;
```

The shard router identifies which database contains Tenant 105.

All tenant-related queries are routed to that shard.

### 6.3 Example Database Structure

Each shard may contain the same tables:

```text
Shard 1
-------
tenants
users
projects
tasks
documents

Shard 2
-------
tenants
users
projects
tasks
documents
```

However, each shard contains different tenant records.

### 6.4 Advantages

**1. Data locality**

Tenant-related data can remain together on one shard.

**2. Efficient tenant-specific queries**

Queries for a single tenant can usually be routed to one shard.

**3. Isolation**

Large or important tenants can be assigned dedicated database capacity.

**4. Flexible placement**

Tenants can be moved to different shards when capacity requirements change.

### 6.5 Disadvantages

**1. Hot tenants**

One very large or active tenant can overload its shard.

**2. Cross-tenant queries**

Reports covering all tenants may need to query multiple shards.

**3. Tenant migration**

Moving a tenant requires migrating related data and updating routing metadata safely.

### 6.6 When Should You Use Tenant-Based Sharding?

It is useful when:

- The application has a clear tenant identifier.
- Most queries are scoped to one tenant.
- Tenant data can be managed relatively independently.
- The business needs flexible placement of large customers.

---

## 7. Choosing the Right Shard Key

The shard key is one of the most important architectural decisions in sharding.

A shard key determines how data is distributed and how queries are routed.

A poor shard key can make an otherwise powerful architecture inefficient.

### 7.1 What Makes a Good Shard Key?

A good shard key should ideally have:

1. High cardinality
2. Even data distribution
3. Even workload distribution
4. Frequent use in queries
5. Low risk of creating hot shards
6. Stable values
7. A relationship with the application's data access patterns

Let's understand these properties.

### 7.2 High Cardinality

Cardinality refers to the number of distinct values in a field.

Consider:

| Field            | Approximate Distinct Values |
| ---------------- | --------------------------: |
| `country`        |                         200 |
| `account_status` |                           3 |
| `user_id`        |                  10 million |
| `tenant_id`      |                      10,000 |

A high-cardinality field offers many possible values for distributing records.

A field such as `account_status` is usually a poor shard key because it has very few distinct values.

For example:

```text
active   -> Shard 1
inactive -> Shard 2
blocked  -> Shard 3
```

This could create severe imbalance if most accounts are active.

However, high cardinality alone does not guarantee a good shard key.

### 7.3 Even Data Distribution

A good shard key should distribute records reasonably evenly.

Suppose you have three shards:

```text
Shard 1: 33 million records
Shard 2: 33 million records
Shard 3: 34 million records
```

This is relatively balanced.

But consider:

```text
Shard 1: 80 million records
Shard 2: 10 million records
Shard 3: 10 million records
```

Shard 1 is significantly larger.

This may happen when the shard key distribution is skewed.

### 7.4 Even Workload Distribution

Data distribution and workload distribution are not the same.

Suppose each shard contains 10 million users.

However:

- Shard 1 receives 10,000 requests per second.
- Shard 2 receives 1,000 requests per second.
- Shard 3 receives 500 requests per second.

The record counts are balanced, but the workload is not.

A good shard key should consider both:

- How much data is stored.
- How much traffic is generated.

### 7.5 Query Access Patterns

A shard key should ideally appear in the application's common queries.

Suppose most requests look like:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

Using `user_id` as the shard key may allow the router to send these queries directly to one shard.

But if most queries are:

```sql
SELECT *
FROM orders
WHERE order_id = 50001;
```

Then `user_id` might not be sufficient for direct routing.

The best shard key depends on the actual query workload.

### 7.6 Stability

A shard key should preferably have a stable value.

Suppose you use `country` as the shard key.

A user moves from India to Germany.

Now the system may need to move that user's data to another shard.

If the shard key changes frequently, data movement and routing become more complicated.

### 7.7 Shard Key Evaluation Checklist

| Property       | Question                                               |
| -------------- | ------------------------------------------------------ |
| Cardinality    | Does the field have enough distinct values?            |
| Distribution   | Will records be distributed evenly?                    |
| Workload       | Will requests be distributed evenly?                   |
| Query patterns | Do common queries contain this field?                  |
| Stability      | Does the value change frequently?                      |
| Locality       | Does the key keep related records together?            |
| Hotspot risk   | Can one key or range receive disproportionate traffic? |

---

## 8. Hot Shards and Hot Partitions

### 8.1 What Is a Hot Shard?

A hot shard is a database shard receiving disproportionately high traffic or workload compared with other shards.

Example:

```text
Shard 1: 5,000 requests/sec
Shard 2: 1,000 requests/sec
Shard 3: 900 requests/sec
```

Shard 1 is the hot shard.

It may experience:

- High CPU usage
- Increased query latency
- Lock contention
- Connection exhaustion
- Higher storage pressure

### 8.2 What Causes Hot Shards?

**1. Poor shard key**

A shard key may distribute data unevenly.

**2. Sequential writes**

A range-based strategy using sequential IDs can send most new writes to one shard.

**3. Uneven tenant activity**

One tenant may generate much more traffic than others.

**4. Popular records**

A very popular product, account, or customer may receive a large number of requests.

**5. Geographic imbalance**

One region may generate significantly more traffic than others.

### 8.3 Example: Hot Tenant

Imagine a SaaS platform with 1,000 tenants.

Most tenants have 10–20 employees.

One enterprise tenant has 100,000 employees and generates most of the platform's traffic.

If tenant IDs are distributed across three shards, that large tenant might overload the shard containing it.

Possible solutions:

- Give the large tenant a dedicated shard.
- Distribute its workload using a more suitable data model.
- Use caching for highly requested data.
- Revisit the shard key.
- Rebalance other tenants.

The right solution depends on whether the bottleneck is storage, CPU, write throughput, or a particular access pattern.

---

## 9. Consistent Hashing

Consistent hashing is a technique used to distribute keys across a changing set of nodes while minimizing the number of keys that need to move when nodes are added or removed.

It is particularly useful in distributed systems where the number of servers can change.

Before understanding consistent hashing, let's understand the problem with simple modulo hashing.

### 9.1 The Problem With Modulo Hashing

Suppose you have three shards.

You use:

\[
\text{Shard} = \text{hash(key)} \bmod 3
\]

Now you add a fourth shard.

The formula becomes:

\[
\text{Shard} = \text{hash(key)} \bmod 4
\]

Because the modulo divisor changed, many keys may now map to different shards.

Example:

| Key Hash | Modulo 3 | Modulo 4 |
| -------: | -------: | -------: |
|       10 |        1 |        2 |
|       11 |        2 |        3 |
|       12 |        0 |        0 |
|       13 |        1 |        1 |
|       14 |        2 |        2 |
|       15 |        0 |        3 |

Several keys change their destinations.

For a very large dataset, moving so much data can be expensive.

### 9.2 What Is Consistent Hashing?

Consistent hashing maps both:

- Data keys
- Database nodes

onto a logical hash space, often visualized as a ring.

Each key is assigned to a position on the ring.

A node is responsible for a section of the ring.

A key is assigned to the next node encountered when moving around the ring in a specified direction.

### 9.3 Basic Architecture

Imagine a circular hash space:

```text
                  Node A
                    |
             .--------------.
          .-'                '-.
        .'                      '.
       |                          |
       |                          |
 Node D|         HASH RING        |Node B
       |                          |
       |                          |
        '.                      .'
          '-.                .-'
             '--------------'
                    |
                  Node C
```

Data keys and nodes are both hashed into positions on the ring.

Each key belongs to the next responsible node according to the ring's assignment rule.

### 9.4 What Happens When a Node Is Added?

Suppose the system has three nodes:

```text
Node A
Node B
Node C
```

Now you add Node D.

Only the keys in the portion of the ring that changes ownership generally need to move.

The rest of the keys can remain on their existing nodes.

```text
Before:
Node A -> Node B -> Node C

After:
Node A -> Node B -> Node D -> Node C
```

This minimizes data movement compared with recalculating every key using a changed modulo divisor.

### 9.5 Virtual Nodes

A basic consistent-hashing ring may distribute load unevenly.

To improve distribution, systems can assign multiple virtual positions to each physical node.

For example:

```text
Physical Node A:
    A-1
    A-2
    A-3

Physical Node B:
    B-1
    B-2
    B-3

Physical Node C:
    C-1
    C-2
    C-3
```

These are called virtual nodes or vnodes.

They help distribute key ownership more evenly and can make rebalancing more flexible.

### 9.6 Advantages

- Reduces data movement when nodes are added or removed.
- Supports changing cluster sizes.
- Can improve distribution through virtual nodes.
- Useful in distributed storage and caching systems.

### 9.7 Disadvantages

- More complicated than simple modulo hashing.
- Requires ring and ownership management.
- Does not automatically guarantee perfectly balanced storage or workload.
- Data migration and routing still need to be coordinated.

### 9.8 Where Is Consistent Hashing Used?

It is useful in distributed systems such as:

- Distributed caches
- Distributed key-value stores
- Distributed storage systems
- Systems that need to distribute keys across changing node sets

Consistent hashing is a distribution technique, not a complete database replication or transaction system.

---

## 10. Shard Expansion and Rebalancing

### 10.1 What Is Shard Expansion?

Shard expansion means increasing the number of shards as the application grows.

Suppose you start with three shards:

```text
Shard 1
Shard 2
Shard 3
```

Later, your application grows and you add two more:

```text
Shard 1
Shard 2
Shard 3
Shard 4
Shard 5
```

The challenge is deciding which data should move to the new shards.

### 10.2 What Is Rebalancing?

Rebalancing is the process of redistributing data or workload across shards to improve balance.

Example:

Before rebalancing:

```text
Shard 1: 80 million records
Shard 2: 10 million records
Shard 3: 10 million records
```

After rebalancing:

```text
Shard 1: 34 million records
Shard 2: 33 million records
Shard 3: 33 million records
```

The exact distribution depends on the workload and sharding design.

### 10.3 Why Is Rebalancing Needed?

- One shard becomes too large.
- One shard receives too much traffic.
- New servers are added.
- Existing servers are removed.
- Tenant sizes change.
- Data distribution becomes uneven.

### 10.4 What Happens During Rebalancing?

A simplified process:

1. Identify overloaded shards.
2. Determine which data should move.
3. Copy the required data to the destination shard.
4. Track writes that happen during migration.
5. Verify the destination data.
6. Update routing metadata.
7. Direct new requests to the destination.
8. Remove old copies when safe.

```text
Before:

Shard 1       Shard 2       Shard 3
 80M            10M            10M


During:

Shard 1  -------> Shard 2
          Data Migration


After:

Shard 1       Shard 2       Shard 3
 34M            33M            33M
```

This is a conceptual example. Real online migration requires careful coordination so that concurrent writes are not lost and clients do not read inconsistent copies.

### 10.5 Challenges During Rebalancing

- Data movement consumes network bandwidth.
- Source and destination servers need extra resources.
- Writes may continue while data is moving.
- Routing metadata must remain consistent.
- Duplicate or missing records must be avoided.
- Application queries may need to handle migration states.

Rebalancing is not just copying rows from one server to another. It is a distributed data migration problem.

---

## 11. Comparing Sharding Strategies

| Strategy           | How It Distributes Data       | Main Advantage                  | Main Disadvantage                  |
| ------------------ | ----------------------------- | ------------------------------- | ---------------------------------- |
| Range-based        | Key ranges                    | Efficient range queries         | Hot ranges and uneven distribution |
| Hash-based         | Hash of shard key             | Generally even distribution     | Poor range locality                |
| Directory-based    | Explicit key-to-shard mapping | Flexible placement              | Directory management               |
| Geographic         | Region or location            | Regional locality               | Cross-region coordination          |
| Tenant-based       | Tenant identifier             | Tenant data locality            | Hot tenants                        |
| Consistent hashing | Keys and nodes on a hash ring | Less movement when nodes change | More complex ownership management  |

### Which Strategy Should You Choose?

There is no universally best strategy.

| Requirement                           | Potential Strategy |
| ------------------------------------- | ------------------ |
| Frequent range queries                | Range-based        |
| Even key distribution                 | Hash-based         |
| Flexible tenant placement             | Directory-based    |
| Regional data locality                | Geographic         |
| Tenant-isolated workloads             | Tenant-based       |
| Cluster membership changes frequently | Consistent hashing |

Some strategies can be combined.

For example, a SaaS platform could use directory-based tenant placement and then use range or hash distribution within a large tenant.

---

## 12. Practical Backend Example: Choosing a Sharding Strategy

Imagine you are designing a database architecture for an e-commerce platform.

The platform contains:

- Users
- Products
- Orders
- Payments
- Inventory

You need to decide how to distribute the data.

### Option A: User-Based Sharding

Use `user_id` as the shard key.

```text
Shard 1:
Users 1-1000000
Their related orders

Shard 2:
Users 1000001-2000000
Their related orders

Shard 3:
Users 2000001-3000000
Their related orders
```

Suitable when most queries are user-specific.

### Option B: Hash-Based User Sharding

Use a hash of `user_id`.

```text
hash(user_id) % 3

Result 0 -> Shard 1
Result 1 -> Shard 2
Result 2 -> Shard 3
```

Suitable when you want to distribute user records without concentrating sequential IDs on one shard.

### Option C: Tenant-Based Sharding

If the application serves multiple businesses, use `tenant_id`.

```text
Shard 1 -> Tenants A, B, C
Shard 2 -> Tenants D, E, F
Shard 3 -> Tenants G, H, I
```

Suitable when most operations are scoped to one tenant.

### Option D: Geographic Sharding

Use region as the placement key.

```text
India users -> India database
Europe users -> Europe database
US users -> US database
```

Suitable when geographical locality or data residency is a major requirement.

### Final Decision

The correct strategy depends on:

- Most frequent queries
- Data volume
- Write volume
- Tenant distribution
- Regional requirements
- Growth patterns
- Rebalancing requirements

Never choose a shard key based only on the database schema. Choose it based on how the application accesses and modifies data.

---

## 13. Common Misconceptions

### Misconception 1: Hash-based sharding guarantees perfectly equal distribution.

Incorrect.

A good hash function generally improves distribution, but record frequency, workload patterns, and skew can still create hotspots.

### Misconception 2: Range-based sharding is always bad.

Incorrect.

It can be highly effective when range queries are common and the key distribution is suitable.

### Misconception 3: High cardinality automatically makes a good shard key.

Incorrect.

The key must also distribute workload appropriately and match common query patterns.

### Misconception 4: Adding a shard automatically redistributes existing data.

Incorrect.

The system needs an explicit data migration and routing strategy.

### Misconception 5: Consistent hashing eliminates data migration.

Incorrect.

It minimizes the number of keys that need to move when membership changes. The affected data still needs to be transferred safely.

### Misconception 6: Equal record counts mean equal workload.

Incorrect.

Some records may receive much more traffic than others.

### Misconception 7: Tenant-based sharding guarantees tenant isolation.

Incorrect.

It helps with data placement, but authorization and access-control checks are still necessary.

### Misconception 8: Geographic sharding means users must always stay in one region.

Incorrect.

User movement, business requirements, and data-residency rules may require data migration or special routing.

---

## 14. Interview Questions

### Q1. What are the main sharding strategies?

Common strategies include range-based, hash-based, directory-based, geographic, and tenant-based sharding.

Consistent hashing is also an important technique for distributing keys across changing node sets.

### Q2. What is range-based sharding?

It distributes records according to ranges of a shard key.

### Q3. What is hash-based sharding?

It applies a hash function to a shard key and uses the result to select a shard.

### Q4. What is directory-based sharding?

It uses a lookup structure that explicitly maps keys or tenants to their destination shards.

### Q5. What is a shard key?

A shard key is the field or combination of fields used to determine where a record is stored.

### Q6. What are the characteristics of a good shard key?

High cardinality, reasonably even data and workload distribution, stable values, and alignment with common query patterns.

### Q7. What is a hot shard?

A shard that receives disproportionately high traffic or workload compared with other shards.

### Q8. Why can range-based sharding create hot shards?

Sequential keys or skewed key distributions can cause most new writes or queries to target one range.

### Q9. Why is hash-based sharding useful?

It can distribute records more evenly and reduce hotspots caused by sequential keys.

### Q10. What is the disadvantage of hash-based sharding?

It reduces locality for range queries and can make adding shards expensive when simple modulo hashing is used.

### Q11. What is consistent hashing?

It maps keys and nodes into a logical hash space so that adding or removing nodes generally requires moving only a portion of the keys.

### Q12. What are virtual nodes?

Virtual nodes are multiple logical positions assigned to one physical node on a consistent-hashing ring. They help improve distribution and balancing.

### Q13. What is shard rebalancing?

It is the process of redistributing data or workload across shards to improve capacity and balance.

### Q14. What is tenant-based sharding?

It distributes tenant-owned data across shards using a tenant identifier or tenant-placement mapping.

### Q15. What is the difference between range and hash sharding?

Range sharding uses key ranges, while hash sharding uses a hash function to determine placement.

### Q16. What is the difference between directory-based and hash-based sharding?

Hash-based sharding calculates the destination from a hash function. Directory-based sharding looks up an explicit mapping.

### Q17. Why is a shard key important?

It influences data distribution, query routing, workload balance, and the cost of cross-shard operations.

### Q18. What happens when a new shard is added to a simple modulo-hashing system?

The modulo divisor changes, causing many keys to map to different shards. Significant data redistribution may be required.

### Q19. Does consistent hashing guarantee perfectly balanced shards?

No. It reduces redistribution during node changes, but balance depends on the hash distribution, virtual nodes, workload, and key popularity.

### Q20. How would you shard a multi-tenant SaaS application?

Tenant-based sharding is a natural option when most queries are tenant-scoped. Directory-based placement can help distribute tenants according to their size and workload.

---

## 15. Practical Learning Exercise

### Exercise A: Range-Based Sharding

You have three shards:

| Shard   | Range     |
| ------- | --------- |
| Shard 1 | 1–1000    |
| Shard 2 | 1001–2000 |
| Shard 3 | 2001–3000 |

Identify the destination for:

1. User 500
2. User 1500
3. User 2500
4. User 999
5. User 2001

### Exercise B: Hash-Based Sharding

Assume:

\[
\text{Shard} = \text{hash(key)} \bmod 3
\]

Given these hash outputs:

| Key | Hash Output |
| --- | ----------: |
| A   |          15 |
| B   |          22 |
| C   |          34 |
| D   |          45 |
| E   |          53 |

Calculate the modulo result and destination shard.

Use:

- 0 → Shard 1
- 1 → Shard 2
- 2 → Shard 3

### Exercise C: Choose a Shard Key

Consider these applications:

| Application               | Potential Shard Key                                   |
| ------------------------- | ----------------------------------------------------- |
| Social network            | `user_id`                                             |
| Multi-tenant SaaS         | `tenant_id`                                           |
| Regional marketplace      | `region_id`                                           |
| Customer account platform | `customer_id`                                         |
| Time-series event storage | Timestamp or time bucket, with hotspot considerations |

For each, explain:

1. Why the key is suitable.
2. Which common queries it supports.
3. What kind of hotspot it could create.

### Exercise D: Identify the Problem

For each scenario, identify the problem.

1. One shard receives 80% of all writes.
2. Adding a fourth shard changes the destination of most keys under modulo hashing.
3. One tenant consumes most of the database resources.
4. A query needs records from all shards.
5. A range-based system receives most new sequential IDs on the newest shard.

Expected answers:

| Scenario | Problem                        |
| -------- | ------------------------------ |
| 1        | Workload imbalance / hot shard |
| 2        | Expensive redistribution       |
| 3        | Hot tenant                     |
| 4        | Scatter-gather query           |
| 5        | Hot range                      |

---

## 16. Chapter Summary

| Concept                  | Key Takeaway                                     |
| ------------------------ | ------------------------------------------------ |
| Range-Based Sharding     | Distributes records according to key ranges      |
| Hash-Based Sharding      | Uses a hash function to select a shard           |
| Directory-Based Sharding | Uses explicit key-to-shard mappings              |
| Geographic Sharding      | Distributes data by region                       |
| Tenant-Based Sharding    | Distributes data by tenant                       |
| Shard Key                | Determines data placement                        |
| Cardinality              | Number of distinct values in a field             |
| Hot Shard                | A shard with disproportionate workload           |
| Consistent Hashing       | Minimizes key movement when nodes change         |
| Virtual Nodes            | Multiple logical positions for one physical node |
| Shard Expansion          | Adding more shards                               |
| Rebalancing              | Redistributing data or workload                  |

### The most important mental model

```text
RANGE
Choose a shard based on key ranges.

HASH
Calculate a shard using a hash function.

DIRECTORY
Look up the key in a shard mapping.

GEOGRAPHIC
Choose a shard based on region.

TENANT
Choose a shard based on tenant identity.

CONSISTENT HASHING
Distribute keys across nodes while minimizing
movement when nodes are added or removed.
```

The most important architectural lesson:

**A good sharding strategy is not just about distributing records evenly. It must also distribute workload effectively and make common queries easy to route.**
