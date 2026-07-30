---
sidebar_label: Key-Value Database Architecture
sidebar_position: 1
---

# Key-Value Database Architecture

## 1. Introduction

In last section, we learned what key-value databases are, how they store data, and where they are used.

Now we will understand **how key-value databases work internally**.

Consider this operation:

```bash
SET user:101 "Rahul"
```

When we execute this command, what actually happens?

- How does the database store the key?
- How does it locate the value so quickly?
- Where is the data stored: RAM or disk?
- What happens when the server restarts?
- How does replication work?
- How is data distributed across multiple nodes?
- How does Redis process a request?

These are architectural questions.

Understanding them will help you make better decisions when using Redis or other key-value databases in backend applications.

---

## 2. High-Level Architecture of a Key-Value Database

A simplified key-value database architecture looks like this:

```text
                 Application
                      |
                      v
                 Database API
                      |
                      v
                 Request Handler
                      |
                      v
                Key Lookup Engine
                      |
                      v
                 Storage Engine
                      |
              +-------+-------+
              |               |
              v               v
           Memory          Persistent
            (RAM)            Storage
```

Let's understand the components.

| Component          | Responsibility                                                        |
| ------------------ | --------------------------------------------------------------------- |
| Application        | Sends database requests                                               |
| Database API       | Accepts commands such as GET, SET, DELETE                             |
| Request handler    | Processes and validates incoming requests                             |
| Key lookup engine  | Locates the value associated with a key                               |
| Storage engine     | Manages how data is stored and retrieved                              |
| Memory             | Holds data for fast access                                            |
| Persistent storage | Preserves data beyond process restarts, when supported and configured |

This is a conceptual architecture. Actual implementations differ significantly between databases.

For example, Redis is primarily an in-memory data structure store, while DynamoDB uses a managed distributed storage architecture.

---

## 3. How Does a Key-Value Database Store Data Internally?

Let's understand the simplest implementation.

Suppose we execute:

```bash
SET user:101 "Rahul"
SET user:102 "Amit"
SET user:103 "Priya"
```

Conceptually, the database maintains a mapping:

```text
Key          Value
---------------------
user:101     Rahul
user:102     Amit
user:103     Priya
```

But how does it locate a particular value efficiently?

One common data structure used for this purpose is a **Hash Table**.

---

## 4. Hash Tables: The Foundation of Key Lookup

### 4.1 What is a hash table?

A hash table is a data structure that stores key-value pairs and uses a hash function to determine where an entry should be stored.

It is commonly used to implement dictionaries and maps.

JavaScript provides a similar data structure through `Map`.

```javascript
const users = new Map();

users.set("user:101", "Rahul");
users.set("user:102", "Amit");
users.set("user:103", "Priya");

console.log(users.get("user:102"));
```

Output:

```text
Amit
```

The important operation is:

```javascript
users.get("user:102");
```

The map can locate the entry without scanning every entry sequentially.

### 4.2 How does a hash function work?

A hash function takes an input key and produces a numeric hash value.

Conceptually:

```text
Key → Hash Function → Hash Value
```

Example:

```text
user:101 → hash() → 125
user:102 → hash() → 472
user:103 → hash() → 891
```

The hash value is then mapped to a location in an underlying hash table.

For a simplified implementation:

```text
index = hash(key) % table_size
```

Suppose the hash table has 10 buckets.

```text
index = hash(key) % 10
```

If:

```text
hash("user:101") = 125
```

Then:

```text
125 % 10 = 5
```

The entry is stored in bucket 5.

### 4.3 Visual representation

```text
                 Key: user:101
                       |
                       v
                  Hash Function
                       |
                       v
                  Hash Value: 125
                       |
                       v
                125 % 10 = 5
                       |
                       v
                 Hash Table
              +----------------+
           0  |                |
           1  |                |
           2  |                |
           3  |                |
           4  |                |
           5  | user:101       |
           6  |                |
           7  |                |
           8  |                |
           9  |                |
              +----------------+
```

The database can use the same process when retrieving the key.

### 4.4 How does GET work?

Suppose we execute:

```bash
GET user:101
```

Conceptually:

1. Receive the key `user:101`.
2. Pass the key to the hash function.
3. Calculate the corresponding bucket.
4. Search for the key in that bucket.
5. Return its associated value.

```text
GET user:101
      |
      v
 Hash Function
      |
      v
 Bucket Index
      |
      v
 Find Matching Key
      |
      v
 Return Value
```

### 4.5 What is a hash collision?

A hash collision happens when two different keys produce the same hash-table bucket.

Example:

```text
hash("user:101") % 10 = 5

hash("user:205") % 10 = 5
```

Both keys map to bucket 5.

This does not mean the keys are identical.

The hash table needs a collision-handling mechanism.

Common techniques include:

**1. Separate chaining**

Multiple entries can be stored in a collection associated with the same bucket.

```text
Bucket 5
   |
   v
+----------+      +----------+
| user:101 | ---> | user:205 |
+----------+      +----------+
```

**2. Open addressing**

If the calculated bucket is occupied, the implementation searches for another available position according to a probing strategy.

Different hash table implementations use different approaches.

### 4.6 Time complexity

For a well-designed hash table:

| Operation | Average time complexity |
| --------- | ----------------------- |
| Insert    | O(1)                    |
| Lookup    | O(1)                    |
| Delete    | O(1)                    |

In the worst case, severe collisions can degrade operations to O(n).

**Important:** O(1) is an average-case expectation for a well-behaved hash table, not a guarantee that every database request takes constant time.

Real database latency also includes networking, serialization, memory allocation, persistence, and other work.

---

## 5. In-Memory Storage Architecture

Many key-value systems are optimized for keeping data in RAM.

Redis is a prominent example.

### 5.1 What is RAM?

RAM stands for Random Access Memory.

It is the primary working memory used by a computer while applications are running.

Compared with traditional disk storage, RAM generally provides much lower access latency.

Conceptually:

```text
Application
     |
     v
Database Process
     |
     v
     RAM
     |
     v
Data Structures
```

When a key is stored in an in-memory database, the database maintains its value in memory.

Example:

```bash
SET user:101 "Rahul"
```

Conceptually:

```text
RAM

+-------------------------+
| Key: user:101           |
| Value: Rahul            |
+-------------------------+
```

### 5.2 Why is in-memory access fast?

RAM provides direct access to memory locations without requiring the database to retrieve every value from a disk-based data structure.

This makes it useful for workloads involving frequent small reads and writes.

However, performance is not determined by RAM alone.

Other factors include:

- CPU processing.
- Network latency.
- Data serialization.
- Memory allocation.
- Database command execution.
- Persistence configuration.
- Contention and workload.

### 5.3 RAM vs disk

| Feature                | RAM                  | SSD / Disk      |
| ---------------------- | -------------------- | --------------- |
| Typical access latency | Lower                | Higher          |
| Cost per GB            | Generally higher     | Generally lower |
| Capacity               | Usually more limited | Usually larger  |
| Volatility             | Volatile             | Persistent      |
| Typical use            | Active working data  | Durable storage |

### 5.4 Is all key-value data stored in RAM?

No.

The key-value model does not require in-memory storage.

Examples:

- Redis primarily uses RAM for its active dataset and supports persistence.
- Memcached is an in-memory caching system.
- DynamoDB uses managed durable distributed storage.
- Other key-value databases may use disk-oriented or hybrid storage architectures.

Remember:

**Key-value describes the data model. In-memory describes the storage approach.**

---

## 6. What Happens When Data Is Stored in RAM and the Server Restarts?

This is an important problem.

RAM is volatile.

If a server loses power or its database process stops unexpectedly, information held only in RAM can be lost.

Example:

```text
Before Restart:

RAM
---------------------
user:101 → Rahul
user:102 → Amit
user:103 → Priya
```

After a restart, if no persistence mechanism exists:

```text
RAM
---------------------
Empty
```

This creates a problem for applications that depend on the stored data.

For example:

- User sessions may disappear.
- Cached values may need to be rebuilt.
- Counters may reset.
- Temporary state may be lost.

Some applications can tolerate this. Others cannot.

To address this, databases use persistence mechanisms.

---

## 7. Redis Persistence: RDB and AOF

Redis supports two major persistence mechanisms:

1. RDB snapshots.
2. Append Only File (AOF).

These mechanisms can be configured independently or together.

### 7.1 RDB — Redis Database Snapshots

RDB creates snapshots of the dataset at particular points in time.

Think of it as periodically saving the current state of the database.

Example:

```text
Time
 |
 v
10:00 AM → Snapshot
10:05 AM → Snapshot
10:10 AM → Snapshot
```

Conceptually:

```text
Redis RAM
    |
    v
Create Snapshot
    |
    v
Dump File
    |
    v
Disk
```

A simplified representation:

```text
RAM:
user:101 → Rahul
user:102 → Amit
user:103 → Priya

              |
              v

        RDB Snapshot

              |
              v

          dump.rdb
```

If Redis restarts, it can load the available snapshot.

#### Advantages

- Compact representation of a dataset at a point in time.
- Efficient recovery from a snapshot.
- Useful for backups.
- Can be convenient for moving or restoring datasets.

#### Disadvantages

- Changes made after the most recent snapshot may be lost.
- Snapshot creation consumes CPU and can introduce memory overhead.
- Snapshot frequency affects the potential recovery point.

#### Example

Suppose snapshots are created every five minutes.

```text
10:00 → Snapshot
10:01 → User A added
10:02 → User B added
10:03 → User C added
10:04 → User D added
10:05 → Snapshot
```

If the server crashes at 10:04:30, the latest snapshot is from 10:00.

Changes after that snapshot may be lost during recovery.

The exact recovery behavior depends on the configured persistence and failure scenario.

### 7.2 AOF — Append Only File

AOF records write operations so that they can be replayed during recovery.

For example, suppose we execute:

```bash
SET user:101 "Rahul"
SET user:102 "Amit"
DEL user:101
```

Conceptually, the AOF contains a sequence of commands representing these changes.

```text
AOF File
-------------------------
SET user:101 "Rahul"
SET user:102 "Amit"
DEL user:101
```

During recovery, Redis replays the recorded operations to reconstruct the dataset.

#### Advantages

- Can provide a smaller recovery-point window than periodic snapshots.
- Supports configurable fsync policies.
- Records write operations rather than relying only on periodic complete snapshots.

#### Disadvantages

- AOF files can grow.
- Replaying commands can increase restart time.
- Disk writes and fsync policies introduce performance trade-offs.
- AOF rewrite operations are needed to reduce file size over time.

### 7.3 AOF fsync policies

Redis provides different AOF synchronization policies.

| Policy                 | Behavior                                          | Trade-off                                                 |
| ---------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| `appendfsync always`   | Synchronizes the AOF after every write operation  | Stronger durability behavior, higher write cost           |
| `appendfsync everysec` | Synchronizes approximately once per second        | Common compromise between performance and durability      |
| `appendfsync no`       | Lets the operating system determine when to flush | Better potential performance, less predictable durability |

The exact amount of data that can be lost depends on the operating system, storage behavior, and failure scenario.

### 7.4 RDB vs AOF

| Feature        | RDB                             | AOF                                         |
| -------------- | ------------------------------- | ------------------------------------------- |
| Storage method | Dataset snapshots               | Recorded write operations                   |
| Recovery       | Load snapshot                   | Replay recorded operations                  |
| Recovery point | Last successful snapshot        | Depends on fsync policy                     |
| File behavior  | Snapshot files                  | Append-oriented log, periodically rewritten |
| File size      | Often compact                   | Can become larger without rewriting         |
| Restart time   | Often faster to load            | May take longer due to replay               |
| Main advantage | Efficient snapshots and backups | More frequent persistence of changes        |

### 7.5 Can we use both?

Yes.

Redis can use both RDB and AOF.

They address persistence through different mechanisms.

A production configuration should be chosen based on:

- How much data loss is acceptable.
- Recovery time requirements.
- Memory and disk capacity.
- Write volume.
- Durability requirements.

Do not assume that enabling persistence alone guarantees that every acknowledged write survives every possible failure.

---

## 8. Redis Architecture: Request Execution

Let's understand what happens when Node.js sends a Redis command.

Example:

```javascript
await client.set("user:101", "Rahul");
```

A simplified request flow:

```text
               Node.js Application
                        |
                        v
                  Redis Client
                        |
                        v
                  TCP Connection
                        |
                        v
                  Redis Server
                        |
                        v
                  Command Parser
                        |
                        v
                  Command Execution
                        |
                        v
                   Data Lookup
                        |
                        v
                  Memory Update
                        |
                        v
                   Response
```

Let's understand each step.

### Step 1: Application creates a command

```javascript
await client.set("user:101", "Rahul");
```

The Redis client prepares the command for transmission.

### Step 2: Client sends the command

The client communicates with the Redis server over a network connection.

Redis commonly listens on port `6379` by default.

### Step 3: Redis receives and parses the command

Redis interprets the incoming command and its arguments.

### Step 4: Command execution

Redis executes the requested operation.

For example:

```text
SET user:101 Rahul
```

The database stores or replaces the value associated with the key.

### Step 5: Response

Redis sends a response to the client.

The Node.js promise resolves when the client receives the response.

### Important distinction

A fast in-memory lookup does not mean the entire request has zero latency.

The application still needs to:

- Send a network request.
- Wait for the server.
- Process the command.
- Receive the response.

This is why network latency and the number of round trips matter.

---

## 9. Redis's Single-Threaded Command Execution Model

Redis is commonly associated with a single-threaded command execution model.

This means that Redis processes commands through a main execution thread in a largely sequential manner.

Conceptually:

```text
Client A ──┐
           |
Client B ──+──> Redis Event Loop
           |          |
Client C ──┘          v
                  Execute Commands
                      One by One
```

### 9.1 Why does Redis use this model?

For many in-memory operations, the command execution itself is extremely fast.

A single-threaded execution model can simplify:

- Shared data access.
- Command execution.
- Synchronization.
- Avoiding many locking problems.

For example, consider:

```bash
INCR page_views
```

The increment is executed atomically as one Redis command.

Two clients issuing the command do not need to implement their own read-modify-write sequence.

### 9.2 Does Redis use only one thread for everything?

No.

Modern Redis uses additional threads for certain work, depending on version and configuration.

For example:

- Network I/O can use I/O threads.
- Background persistence operations can use child processes.
- Other internal tasks can execute outside the main command execution path.

The important distinction is:

**Redis's core command execution model is primarily single-threaded, but the entire Redis server is not limited to one operating-system thread for every task.**

### 9.3 Why can Redis still handle many clients?

Redis uses an event-driven, non-blocking I/O model.

It can manage many client connections without creating one execution thread per connection.

This is an important reason it can handle high concurrency efficiently.

---

## 10. Redis Atomic Operations

An operation is atomic when it is executed as one indivisible operation from the perspective of concurrent clients.

Consider this incorrect application-level counter update:

```javascript
const value = await client.get("counter");

await client.set("counter", Number(value) + 1);
```

Suppose two requests execute at the same time.

Initial value:

```text
counter = 10
```

Possible sequence:

```text
Request A reads 10
Request B reads 10

Request A writes 11
Request B writes 11
```

Expected value:

```text
12
```

Actual value:

```text
11
```

One increment is lost.

This is a race condition.

### Use Redis INCR

```bash
INCR counter
```

Redis executes the increment as one atomic command.

Starting from 10:

```text
Request A → INCR counter
Request B → INCR counter
```

Final value:

```text
12
```

This is why Redis provides atomic commands for common operations.

### Important lesson

Prefer a suitable atomic database operation over implementing a read-modify-write sequence in application code.

---

## 11. Replication in Key-Value Databases

Replication means maintaining copies of data across multiple database nodes.

Consider a Redis primary-replica architecture.

```text
                Application
                     |
                     v
                  Primary
                     |
               Replication
                 /       \
                v         v
           Replica A   Replica B
```

The primary accepts writes and propagates changes to replicas.

Replicas maintain copies of the primary's dataset.

### 11.1 Why use replication?

- Additional copies of data.
- Read scaling.
- Potential failover support.
- Improved availability when combined with suitable orchestration.

### 11.2 Example

Application executes:

```bash
SET user:101 "Rahul"
```

The primary processes the write.

The update is propagated to replicas.

Conceptually:

```text
Primary:
user:101 → Rahul

Replica A:
user:101 → Rahul

Replica B:
user:101 → Rahul
```

### 11.3 Is replication always synchronous?

No.

Redis replication is generally asynchronous.

A primary can acknowledge a write before all replicas have processed it.

This creates a possibility of replication lag.

Example:

```text
1. Primary receives a write.
2. Primary acknowledges the write.
3. Replica has not received the update yet.
4. Application reads from the replica.
5. Replica may return an older value.
```

### 11.4 What happens if the primary fails?

A replica may be promoted to primary by a failover mechanism.

Redis Sentinel can monitor Redis instances and coordinate failover for non-clustered Redis deployments.

Redis Cluster provides its own cluster-based failure detection and failover mechanisms.

However, asynchronous replication means some recently acknowledged writes may be lost during failover.

Replication is therefore not an unconditional guarantee of zero data loss.

---

## 12. Partitioning and Sharding in Key-Value Databases

When the dataset becomes too large for one server, a key-value database may distribute keys across multiple nodes.

Consider:

```text
user:101
user:102
user:103
user:104
user:105
user:106
```

Instead of storing every key on one server, the system distributes keys.

```text
                 Key-Value Dataset
                         |
                  Partitioning
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
        Node A         Node B         Node C
          |              |              |
          v              v              v
       user:101       user:102       user:103
       user:104       user:105       user:106
```

This is horizontal data distribution.

### 12.1 Hash-based distribution

A system can use a hash function to determine the partition for a key.

Conceptually:

```text
partition = hash(key) % number_of_nodes
```

Example:

```text
hash("user:101") % 3 → Node A
hash("user:102") % 3 → Node B
hash("user:103") % 3 → Node C
```

Actual distributed databases use different placement algorithms and metadata.

### 12.2 What happens when a new node is added?

Suppose we have three nodes:

```text
Node A
Node B
Node C
```

Now we add Node D.

With a simple modulo-based placement strategy:

```text
hash(key) % 3
```

becomes:

```text
hash(key) % 4
```

Many keys may map to different nodes after this change.

This can require significant data movement.

Distributed systems may use consistent hashing, partition maps, virtual nodes, or other mechanisms to reduce and manage rebalancing costs.

### 12.3 Why is partitioning important?

It helps distribute:

- Storage.
- Request traffic.
- Memory consumption.
- Processing workload.

However, a poor partition key can create hot partitions.

We studied partition keys and hot partitions in Part 10C.

---

## 13. Redis Cluster Architecture

Redis Cluster provides a way to distribute Redis data across multiple nodes.

It uses **16,384 hash slots**.

Each key is assigned to a hash slot.

The cluster assigns ranges or groups of slots to different primary nodes.

### 13.1 How hash slots work

Conceptually:

```text
HASH_SLOT = CRC16(key) % 16384
```

The resulting slot determines which cluster node is responsible for the key.

### 13.2 Architecture

```text
                  Application
                       |
                       v
                  Redis Client
                       |
                 Redis Cluster
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Node A       Node B       Node C
       Slots        Slots        Slots
       0-5460       5461-10922   10923-16383
```

The slot ranges above are illustrative.

Redis Cluster distributes hash slots among primary nodes.

Each primary can also have one or more replicas.

```text
                  Redis Cluster
                       |
          +------------+------------+
          |            |            |
          v            v            v
       Primary A    Primary B    Primary C
          |            |            |
          v            v            v
       Replica A    Replica B    Replica C
```

### 13.3 Why use hash slots?

Hash slots provide a stable partitioning abstraction.

When nodes are added or removed, slots can be reassigned without changing the fundamental key-to-slot calculation.

The cluster moves slot ownership and migrates the associated keys.

### 13.4 Hash tags

Redis supports hash tags to force related keys into the same hash slot.

Example:

```text
user:{101}:profile
user:{101}:cart
user:{101}:session
```

Redis calculates the hash slot using the content inside `{101}`.

All three keys therefore map to the same hash slot.

This is useful when an operation needs multiple related keys to reside in the same cluster slot.

For example, certain multi-key commands and transactions require keys to be in the same slot.

### 13.5 Redis Cluster vs Redis replication

| Feature                    | Redis Replication                            | Redis Cluster                                   |
| -------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Primary purpose            | Maintain copies of data                      | Distribute data across multiple primaries       |
| Data distribution          | Same logical dataset on primary and replicas | Different slots assigned to different primaries |
| Horizontal storage scaling | Not by itself                                | Yes                                             |
| Read scaling               | Possible using replicas                      | Possible using replicas and suitable routing    |
| Failover                   | Can use Sentinel or other orchestration      | Built-in cluster failover mechanisms            |
| Partitioning               | Not provided by replication alone            | Uses hash slots                                 |

Replication and clustering solve different problems, although Redis Cluster also uses replication.

---

## 14. Important Redis Data Structures

Redis is more than a simple string-based key-value store.

It supports several data structures.

| Data structure | What it stores                | Example use case          |
| -------------- | ----------------------------- | ------------------------- |
| String         | Text, numbers, binary values  | Cache, counters           |
| Hash           | Field-value pairs             | User profile              |
| List           | Ordered sequence of values    | Queues                    |
| Set            | Unique unordered values       | Unique visitors           |
| Sorted Set     | Values associated with scores | Leaderboards              |
| Stream         | Append-oriented event records | Event processing          |
| Bitmap         | Bit-level information         | Activity tracking         |
| HyperLogLog    | Approximate cardinality       | Unique visitor estimation |

Examples:

**String**

```bash
SET username:101 "Rahul"
GET username:101
```

**Hash**

```bash
HSET user:101 name "Rahul" age 25
HGET user:101 name
HGETALL user:101
```

**List**

```bash
LPUSH notifications:user:101 "Welcome"
LRANGE notifications:user:101 0 -1
```

**Set**

```bash
SADD online_users 101 102 103
SISMEMBER online_users 101
```

**Sorted Set**

```bash
ZADD leaderboard 100 "Rahul"
ZADD leaderboard 150 "Amit"
ZRANGE leaderboard 0 -1 WITHSCORES
```

These structures allow Redis to support different application workloads without requiring a separate database for every simple use case.

We will explore these structures in more detail when studying practical Redis data modeling.

---

## 15. Key-Value Database Architecture: Complete View

Let's combine the concepts.

```text
                    Node.js Application
                            |
                            v
                       Redis Client
                            |
                            v
                     Network Connection
                            |
                            v
                     Redis Server
                            |
                    Command Processing
                            |
                            v
                     Data Structures
                            |
                    +-------+-------+
                    |               |
                    v               v
                 Memory          Persistence
                  (RAM)          (RDB / AOF)
                    |
                    v
                Key Lookup
                    |
                    v
                 Response
```

For a distributed architecture:

```text
                    Node.js Application
                            |
                            v
                     Redis Cluster
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
          Primary A      Primary B      Primary C
             |              |              |
             v              v              v
          Replica A      Replica B      Replica C
```

Each primary manages a subset of the hash slots.

Replicas maintain copies of their corresponding primary's data.

Persistence mechanisms can also be configured on individual nodes.

---

## 16. Performance Considerations

Even an in-memory database can become slow if used incorrectly.

Important factors include:

### 16.1 Network round trips

Consider two approaches.

**Approach A: Multiple requests**

```javascript
await client.set("user:101:name", "Rahul");
await client.set("user:101:age", "25");
await client.set("user:101:city", "Noida");
```

This involves multiple client-server interactions.

**Approach B: Use a Redis hash**

```javascript
await client.hSet("user:101", {
  name: "Rahul",
  age: "25",
  city: "Noida",
});
```

This groups related fields into one Redis hash and can reduce the number of commands needed.

Pipelining can also reduce round trips when multiple independent commands must be executed.

### 16.2 Large values

Large values can:

- Consume substantial memory.
- Increase network transfer time.
- Increase serialization costs.
- Make updates more expensive.

Keep cached values appropriately sized.

### 16.3 Hot keys

A hot key receives disproportionately high traffic.

Example:

```text
global:homepage:config
```

If every application request reads the same key, it may become a bottleneck.

Possible mitigation strategies include:

- Local application caching.
- Replicated reads where appropriate.
- Splitting counters or workloads.
- Redesigning the access pattern.
- Using a different distribution strategy.

### 16.4 Memory management

In-memory databases need memory management policies.

Redis supports eviction policies that determine what happens when memory reaches its configured limit.

Examples include:

- `noeviction`
- `allkeys-lru`
- `allkeys-lfu`
- `volatile-lru`
- `volatile-lfu`
- `volatile-ttl`
- `allkeys-random`
- `volatile-random`

These policies have different behaviors.

For example:

- LRU approximates least-recently-used eviction.
- LFU approximates least-frequently-used eviction.
- `noeviction` rejects writes that require additional memory rather than evicting keys.

Choosing the correct policy depends on whether Redis is used as a disposable cache or stores important application state.

---

## 17. Common Misconceptions

| Misconception                                                    | Correct understanding                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Every key-value database stores data in RAM                      | Some use durable disk-based or managed distributed storage                                                   |
| In-memory means data is always lost after restart                | Persistence mechanisms can preserve data                                                                     |
| Redis uses only one thread for everything                        | Core command execution is primarily single-threaded, but other tasks can use additional threads or processes |
| Hash lookup is always O(1)                                       | Average-case O(1); collisions and implementation details matter                                              |
| Replication increases storage capacity                           | Replication creates additional copies rather than distributing unique subsets                                |
| Redis replication is always synchronous                          | Redis replication is generally asynchronous                                                                  |
| Redis Cluster is the same as Redis replication                   | Cluster distributes hash slots; replication maintains copies                                                 |
| AOF and RDB are identical                                        | RDB uses snapshots; AOF records write operations                                                             |
| Redis is only a cache                                            | Redis can support several in-memory application workloads                                                    |
| A successful Redis SET always means the data is permanently safe | Durability depends on persistence configuration and failure conditions                                       |
| In-memory operations have no latency                             | Network, CPU, serialization, and execution costs still exist                                                 |

---

## 18. Interview Questions and Answers

### Q1. What data structure is commonly used to implement key-value lookup?

A hash table is a common implementation. It uses a hash function to map keys to storage locations.

### Q2. What is a hash collision?

A collision occurs when different keys map to the same hash-table bucket or location.

### Q3. What is the average time complexity of hash table lookup?

O(1) on average, assuming a suitable hash function and controlled collision behavior.

### Q4. Why is Redis fast?

Redis keeps its active dataset in memory, uses efficient data structures, and processes commands through an event-driven architecture with a primarily single-threaded command execution model.

### Q5. What happens when Redis restarts?

Without persistence, in-memory data can be lost. With RDB or AOF configured, Redis can recover data from persisted information, subject to the configured durability guarantees.

### Q6. What is RDB persistence?

RDB creates snapshots of the Redis dataset at particular points in time.

### Q7. What is AOF persistence?

AOF records write operations so Redis can replay them during recovery.

### Q8. What is the difference between RDB and AOF?

RDB stores snapshots, while AOF records write operations. Their recovery behavior, file characteristics, and performance trade-offs differ.

### Q9. What is Redis replication?

Redis replication maintains copies of data from a primary on one or more replicas.

### Q10. Is Redis replication synchronous?

Redis replication is generally asynchronous, so replicas may temporarily lag behind the primary.

### Q11. What is Redis Cluster?

Redis Cluster is a distributed Redis deployment that divides keyspace into 16,384 hash slots and distributes them across multiple primary nodes.

### Q12. What is a Redis hash slot?

A hash slot is a logical partition used by Redis Cluster to determine which primary node owns a key.

### Q13. What are Redis hash tags?

Hash tags allow related keys to be mapped to the same hash slot by using a common substring inside curly braces.

### Q14. Why does Redis use an event loop?

An event-driven, non-blocking I/O architecture allows Redis to manage many concurrent connections efficiently without requiring one execution thread per client.

### Q15. What is a hot key?

A hot key is a key receiving disproportionately high traffic, potentially creating a performance bottleneck.

### Q16. What is the difference between Redis and Memcached?

Both support in-memory key-value caching. Redis offers additional data structures, persistence, replication, and broader application capabilities.

### Q17. What is the difference between Redis replication and Redis Cluster?

Replication maintains copies of data. Redis Cluster distributes different hash slots across multiple primary nodes and also supports replicas.

### Q18. Does Redis guarantee zero data loss?

No. Durability depends on persistence configuration, replication behavior, failover, and the failure scenario.

---

## 19. Practical Exercises

### Exercise 1: Understand hash tables

Suppose a hash table contains 10 buckets.

A simplified hash function returns:

```text
hash("user:101") = 125
hash("user:102") = 472
hash("user:103") = 891
```

Calculate the bucket index using:

```text
index = hash(key) % 10
```

Then explain what happens if two keys map to the same bucket.

### Exercise 2: Redis persistence

Answer:

1. What is RDB?
2. What is AOF?
3. What happens if Redis crashes after a snapshot but before the next snapshot?
4. What is the purpose of AOF fsync?
5. Why might we enable both RDB and AOF?

### Exercise 3: Redis replication

Consider:

```text
Primary
   |
   +---- Replica A
   |
   +---- Replica B
```

Answer:

1. Which node normally accepts writes?
2. How are updates propagated?
3. What is replication lag?
4. What happens if the primary fails?
5. Why is asynchronous replication a possible source of data loss during failover?

### Exercise 4: Redis Cluster

Suppose you have three primary nodes.

Answer:

1. How many hash slots does Redis Cluster use?
2. How is a key assigned to a hash slot?
3. What happens when a node is added?
4. What is the purpose of hash tags?
5. Why might related keys need to be in the same hash slot?

### Exercise 5: Design a Redis architecture

Design a Redis setup for a Node.js application with:

- 1 million active users.
- Session management.
- API rate limiting.
- Product caching.
- Temporary OTP storage.

Decide:

1. Which Redis data structures would you use?
2. Which keys need TTL?
3. What persistence configuration is appropriate?
4. Would you use replication?
5. When would Redis Cluster become useful?
6. What happens if Redis becomes unavailable?
7. How would you prevent stale cached product information?

---

## 20. Chapter Summary

| Concept           | Key takeaway                                         |
| ----------------- | ---------------------------------------------------- |
| Hash table        | Common data structure for key-based lookup           |
| Hash function     | Maps a key to a hash value                           |
| Collision         | Different keys map to the same bucket                |
| In-memory storage | Keeps active data in RAM                             |
| Persistence       | Preserves data beyond process restarts               |
| RDB               | Snapshot-based persistence                           |
| AOF               | Records write operations                             |
| Redis event loop  | Manages requests using an event-driven model         |
| Atomic command    | Executes an operation as one indivisible command     |
| Replication       | Maintains copies of data across nodes                |
| Redis Cluster     | Distributes keys through 16,384 hash slots           |
| Hash tags         | Force related keys into the same hash slot           |
| Hot key           | A key receiving disproportionately high traffic      |
| Eviction          | Removes keys according to a configured memory policy |

### Final mental model

```text
                 KEY-VALUE DATABASE
                         |
              +----------+----------+
              |          |          |
              v          v          v
           LOOKUP     STORAGE    DISTRIBUTION
              |          |          |
              v          v          v
          Hash Table    RAM       Partitioning
                         |
                    Persistence
                    /         \
                   v           v
                  RDB          AOF
```

### The most important points to remember

1. Hash tables are a common foundation for fast key-value lookup.
2. Average hash-table lookup complexity is O(1).
3. In-memory databases use RAM for low-latency access.
4. RAM is volatile, so persistence is important when data must survive restarts.
5. Redis provides RDB snapshots and AOF persistence.
6. Redis processes core commands primarily through a single-threaded execution model, while using additional threads or processes for certain tasks.
7. Atomic Redis commands help prevent application-level race conditions.
8. Replication maintains copies of data.
9. Redis Cluster distributes data using 16,384 hash slots.
10. Replication and partitioning solve different problems and can be used together.

**Engineering takeaway:** Understanding Redis commands is not enough. You should understand where data lives, how keys are located, how persistence works, and what happens when a node fails. These architectural details determine whether Redis is being used safely and effectively.
