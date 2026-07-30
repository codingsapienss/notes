---
sidebar_label: Document Database Architecture & Scaling
sidebar_position: 1
---

# Document Database Architecture & Scaling

## 1. Introduction

In last 2 sections, we learned the fundamentals of document databases,how to design documents using embedding, referencing, denormalization, and MongoDB schema design patterns.

Now we will understand what happens internally when a document database runs in production.

We will primarily use **MongoDB** as our example.

A production MongoDB deployment must handle several responsibilities:

- Store documents efficiently.
- Manage memory and disk storage.
- Execute read and write operations.
- Preserve data durability.
- Recover after crashes.
- Replicate data across multiple servers.
- Handle node failures.
- Distribute data across multiple machines.
- Scale as application traffic and data volume increase.

To understand these responsibilities, we will study MongoDB's architecture.

### Topics covered

1. MongoDB architecture overview.
2. MongoDB storage engine.
3. WiredTiger storage engine.
4. Memory and cache architecture.
5. Journaling and durability.
6. MongoDB replication architecture.
7. Replica sets.
8. Primary and secondary nodes.
9. Oplog.
10. Elections and failover.
11. MongoDB sharding architecture.
12. Config servers and `mongos`.
13. How MongoDB distributes data across nodes.
14. Practical deployment architecture.

---

## 2. MongoDB Architecture Overview

MongoDB is a document-oriented database that stores data in BSON format.

A simplified MongoDB architecture looks like this:

```text
                 APPLICATION
                      |
                      |
                 MongoDB Driver
                      |
                      v
               MongoDB Server
                      |
             +--------+--------+
             |                 |
             v                 v
        Query Layer       Command Layer
             |                 |
             +--------+--------+
                      |
                      v
                Storage Engine
                      |
             +--------+--------+
             |                 |
             v                 v
          Memory              Disk
          Cache             Storage
```

Let's understand these components.

| Component      | Responsibility                                  |
| -------------- | ----------------------------------------------- |
| Application    | Sends database operations                       |
| MongoDB Driver | Communicates with MongoDB from application code |
| Query Layer    | Parses, plans, and executes queries             |
| Command Layer  | Handles database commands and operations        |
| Storage Engine | Manages how data is stored and retrieved        |
| Memory Cache   | Keeps useful data in memory                     |
| Disk Storage   | Persists database files                         |

This is a conceptual view. MongoDB's actual internal architecture contains additional components and execution stages.

### 2.1 Application layer

Suppose we have a Node.js application using Mongoose.

```javascript
const User = require("./models/User");

const user = await User.findOne({
  email: "rahul@example.com",
});
```

The request travels through:

```text
Node.js Application
       |
       v
Mongoose
       |
       v
MongoDB Node.js Driver
       |
       v
MongoDB Server
```

Mongoose provides an object modeling layer. It does not replace the MongoDB server or storage engine.

### 2.2 Query processing

When MongoDB receives a query, it must determine how to execute it.

For example:

```javascript
db.users.find({
  email: "rahul@example.com",
});
```

MongoDB may:

1. Parse the query.
2. Check available indexes.
3. Generate candidate execution plans.
4. Select an execution plan.
5. Retrieve matching documents.
6. Return results to the client.

The selected plan may use an index scan or a collection scan, depending on the query and available indexes.

### 2.3 Storage engine

The storage engine handles the physical storage and retrieval of database records.

MongoDB uses **WiredTiger** as its default storage engine in modern deployments.

It is responsible for important operations such as:

- Managing data files.
- Managing internal data structures.
- Caching data.
- Handling concurrency.
- Supporting transactions.
- Managing compression.
- Persisting changes to disk.

We will study WiredTiger in detail below.

---

## 3. MongoDB Storage Engine

A storage engine is the component responsible for managing how database data is stored, accessed, and maintained.

Think of the database server as the system that accepts and processes requests, while the storage engine manages the underlying storage operations.

For example:

```text
Application:
"Find the user whose email is rahul@example.com"

MongoDB Query Layer:
"Determine how to execute this query"

Storage Engine:
"Retrieve the required data from the storage structures"
```

### 3.1 Why does MongoDB need a storage engine?

A database cannot simply store documents as independent JSON files and scan all files for every request.

It needs efficient structures and mechanisms for:

- Finding records.
- Updating records.
- Managing indexes.
- Handling concurrent operations.
- Recovering from failures.
- Managing memory.
- Persisting changes.

The storage engine provides these mechanisms.

### 3.2 MongoDB storage engine options

MongoDB has supported different storage engines.

| Storage engine | Description                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| WiredTiger     | General-purpose storage engine and default choice in modern MongoDB deployments |
| In-Memory      | Keeps data in memory rather than providing conventional persistent storage      |
| MMAPv1         | Older storage engine, deprecated and removed from modern MongoDB versions       |

For modern MongoDB applications, WiredTiger is the primary storage engine to understand.

---

## 4. WiredTiger Storage Engine

WiredTiger is MongoDB's default storage engine.

It is designed to support efficient storage, concurrency, caching, and persistence.

Important capabilities include:

- Document-level concurrency control.
- Multi-version concurrency control (MVCC).
- Compression.
- Internal caching.
- Checkpointing.
- Journaling.
- Efficient storage structures.

### 4.1 WiredTiger architecture

A simplified view:

```text
                  MONGODB SERVER
                        |
                        v
                WIREDTIGER ENGINE
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
       Cache         Journal      Checkpoint
          |             |             |
          v             v             v
      Memory          Disk          Disk
          |                           |
          +-------------+-------------+
                        |
                        v
                  Data Files
```

This diagram represents major responsibilities, not a literal execution pipeline.

### 4.2 Document-level concurrency

Older MongoDB storage behavior used coarser locking.

WiredTiger supports document-level concurrency for many operations.

Consider two users:

```text
User A document: _id = 101
User B document: _id = 102
```

Two independent operations update these documents:

```javascript
db.users.updateOne({ _id: 101 }, { $set: { city: "Noida" } });

db.users.updateOne({ _id: 102 }, { $set: { city: "Delhi" } });
```

These operations can execute concurrently without requiring the entire collection to be locked.

However, document-level concurrency does not mean there are no locks.

MongoDB still uses locking at different levels, including global, database, and collection-related coordination, depending on the operation.

### 4.3 MVCC in WiredTiger

MVCC stands for Multi-Version Concurrency Control.

The basic idea is that multiple versions of data can exist so concurrent operations can work with appropriate snapshots.

Suppose a document initially contains:

```json
{
  "_id": 101,
  "balance": 1000
}
```

A transaction updates the balance:

```json
{
  "_id": 101,
  "balance": 800
}
```

During concurrent activity, WiredTiger's MVCC mechanisms allow operations to work with consistent views of data.

This helps reduce conflicts between readers and writers.

Old versions are not necessarily removed immediately. WiredTiger must preserve versions while active operations still need them.

Eventually, obsolete versions can be reconciled and cleaned up.

### 4.4 Compression

WiredTiger supports compression to reduce storage requirements.

It can compress data and indexes using supported compression algorithms.

Benefits:

- Reduced disk consumption.
- Potentially lower storage I/O.
- Better use of available storage capacity.

Tradeoff:

Compression requires CPU resources.

The overall performance impact depends on the workload, data, and compression configuration.

---

## 5. MongoDB Memory and Cache Architecture

Memory plays an important role in database performance.

Reading data from RAM is generally much faster than reading it from disk.

MongoDB's WiredTiger storage engine maintains an internal cache.

### 5.1 WiredTiger cache

The WiredTiger cache stores data and index information in memory.

For example, suppose an application frequently queries:

```javascript
db.products.find({
  category: "Electronics",
});
```

If relevant pages are already available in memory, WiredTiger may be able to serve the operation without reading those pages from disk again.

This can significantly reduce disk I/O.

### 5.2 How much memory does WiredTiger use?

The default WiredTiger internal cache size is generally based on:

- 50% of available RAM minus 1 GB, or
- 256 MB,

whichever is larger.

This is a default sizing rule, not a recommendation to allocate the entire machine's memory to WiredTiger.

The operating system also needs memory for:

- Filesystem cache.
- MongoDB server processes.
- Connections.
- Query execution.
- Other applications.
- Operating system operations.

The cache configuration can be adjusted.

### 5.3 WiredTiger cache vs filesystem cache

This distinction is important.

MongoDB has its own WiredTiger cache, but the operating system also maintains a filesystem cache.

Simplified architecture:

```text
              MongoDB Server
                    |
                    v
             WiredTiger Cache
                    |
                    v
                Data Files
                    |
                    v
             Operating System
              Filesystem Cache
                    |
                    v
               Physical Disk
```

The WiredTiger cache and operating system filesystem cache are different mechanisms.

The operating system can cache database file pages, so data may be available in RAM even when it is not currently in WiredTiger's internal cache.

### 5.4 Why does memory matter?

Suppose your application has:

```text
Total working data: 20 GB
Available RAM:       8 GB
```

The frequently accessed portion may fit in cache even though the entire database does not.

A database does not need to keep every byte of data in RAM to perform well.

What matters is whether the active working set can be served efficiently.

### 5.5 What is a working set?

The working set is the portion of data and indexes that an application actively accesses during a particular period.

Example:

An e-commerce database contains:

```text
Users:       10 GB
Products:     5 GB
Orders:      80 GB
Activity:   100 GB
```

But suppose most application traffic reads:

- Recent orders.
- Active products.
- Frequently accessed users.

The working set may be much smaller than the total database.

If the working set fits reasonably well in memory, performance can improve.

### Important distinction

More RAM does not automatically make every query fast.

A poorly indexed query can still perform a large collection scan.

Memory helps reduce I/O; it does not replace good query design and indexing.

---

## 6. Journaling and Durability

Databases must protect data against unexpected failures.

Consider:

1. An application updates an account balance.
2. MongoDB reports that the update succeeded.
3. The server suddenly loses power.
4. The database process stops.

How does MongoDB recover without losing committed changes?

One important mechanism is journaling.

### 6.1 What is journaling?

Journaling records database changes in a journal before the corresponding data changes are fully persisted to their final data-file locations.

Conceptually:

```text
Application Write
       |
       v
MongoDB Server
       |
       v
WiredTiger
       |
       v
Journal Record
       |
       v
Data Files
```

The journal helps MongoDB recover after an unexpected shutdown.

### 6.2 Why is a journal needed?

Suppose a document is updated:

Before:

```json
{
  "_id": 101,
  "balance": 1000
}
```

After:

```json
{
  "_id": 101,
  "balance": 800
}
```

If the system crashes while data-file updates are incomplete, journal recovery can help restore a consistent state.

### 6.3 Write acknowledgement vs durability

These concepts should not be confused.

A write acknowledgement tells the application whether the requested write was accepted according to the configured write concern.

Durability concerns whether the acknowledged data survives failures.

For example:

```javascript
db.users.updateOne(
  {
    _id: 101,
  },
  {
    $set: {
      balance: 800,
    },
  },
  {
    writeConcern: {
      w: 1,
      j: true,
    },
  },
);
```

Here:

- `w: 1` requests acknowledgement from the primary.
- `j: true` requests acknowledgement after the write is committed to the journal.

The exact durability guarantee still depends on the deployment and failure scenario.

### 6.4 Write concern

Write concern controls the acknowledgement level requested for a write operation.

Common settings:

| Write concern   | Meaning                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| `w: 0`          | Do not wait for acknowledgement                                                    |
| `w: 1`          | Wait for acknowledgement from the primary                                          |
| `w: "majority"` | Wait for acknowledgement from a calculated majority of voting data-bearing members |
| `j: true`       | Request journal durability acknowledgement                                         |

Example:

```javascript
db.orders.insertOne(
  {
    userId: 101,
    total: 2500,
  },
  {
    writeConcern: {
      w: "majority",
      wtimeout: 5000,
    },
  },
);
```

This requests majority acknowledgement, with a five-second write concern timeout.

A timeout does not necessarily mean the write was rolled back. The application may need to determine whether the write actually committed before retrying.

### Important distinction

- Journaling protects against certain local crash scenarios.
- Replication provides copies of data on other nodes.
- Majority write concern provides stronger acknowledgement guarantees across a replica set.

These mechanisms solve related but different problems.

---

## 7. MongoDB Replication Architecture

Replication means maintaining copies of database data across multiple servers.

Why do we need it?

Imagine your application uses one MongoDB server.

```text
Application
     |
     v
MongoDB Server
```

If that server fails:

- The database may become unavailable.
- Applications cannot perform normal database operations.
- Recovery depends on restoring the failed server or its data.

This is a single point of failure.

Replication helps improve availability and provides redundancy.

### 7.1 Replicated architecture

```text
                  Application
                       |
                       v
                  MongoDB Driver
                       |
                       v
                 Primary Node
                       |
                Replication Stream
                 /             \
                v               v
          Secondary 1      Secondary 2
```

MongoDB uses a replica set to maintain multiple copies of data.

### 7.2 What is a replica set?

A replica set is a group of MongoDB instances that maintain the same dataset through replication.

A typical replica set contains:

- One primary.
- One or more secondaries.

The primary accepts writes.

Secondaries replicate changes from the primary.

### 7.3 Why use three nodes?

Consider a three-member replica set:

```text
                Replica Set
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Node A      Node B     Node C
       Primary    Secondary  Secondary
```

If Node A fails, the remaining nodes can participate in an election.

A secondary may become the new primary if the election conditions are satisfied.

This provides automatic failover.

### 7.4 Replication is not backup

This is an important production concept.

Replication copies changes to other nodes.

If an application accidentally deletes important records, the deletion can also replicate.

Therefore:

**Replication improves availability and redundancy, but it does not replace backups.**

A proper production setup should also have backup and recovery procedures.

---

## 8. Primary and Secondary Nodes

A MongoDB replica set has different member roles.

### 8.1 Primary node

The primary is the replica set member that accepts writes.

Example:

```javascript
db.orders.insertOne({
  userId: 101,
  total: 2500,
});
```

The driver sends this write to the primary.

The primary records the write and replicates it to other members.

At a given time, a replica set normally has only one primary.

### 8.2 Secondary node

Secondaries replicate data from the primary.

They maintain their own copies of the database.

A secondary can:

- Maintain replicated data.
- Participate in elections if eligible.
- Serve certain read operations when the client explicitly requests an appropriate read preference.

A secondary does not normally accept ordinary application writes directly.

### 8.3 Can applications read from secondaries?

Yes.

MongoDB provides read preferences.

Common read preferences include:

| Read preference      | Behavior                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `primary`            | Read from the primary                                                       |
| `primaryPreferred`   | Prefer the primary; use a secondary when the primary is unavailable         |
| `secondary`          | Read from a secondary                                                       |
| `secondaryPreferred` | Prefer a secondary; use the primary when no suitable secondary is available |
| `nearest`            | Read from a suitable member with the lowest measured network latency        |

Example using the Node.js driver:

```javascript
const { MongoClient, ReadPreference } = require("mongodb");

const client = new MongoClient(uri, {
  readPreference: ReadPreference.SECONDARY,
});
```

The exact behavior depends on the driver's topology selection and the replica set's available members.

### 8.4 Why read from secondaries?

Suppose:

```text
Write traffic:  20,000 requests/minute
Read traffic:  200,000 requests/minute
```

If suitable read traffic is distributed across secondaries, the primary may have less read workload.

However, there is an important tradeoff.

### 8.5 Replication lag

Secondaries may not have applied the latest writes yet.

Example:

```text
Primary:
Order 5001 = "confirmed"

Secondary:
Order 5001 = Not yet replicated
```

An application that reads from a secondary may temporarily receive older data.

This is replication lag.

Consequences include:

- Recently created records appearing missing.
- Old account balances being displayed.
- Recently updated order statuses not appearing immediately.

Do not use secondary reads blindly for workflows that require immediate read-after-write behavior.

---

## 9. MongoDB Oplog

The Oplog is one of the most important components of MongoDB replication.

Oplog means **Operations Log**.

It is a special capped collection that records operations that modify data in a replica set.

Secondaries use the oplog to replicate changes from the primary.

### 9.1 How does the Oplog work?

Suppose the primary executes:

```javascript
db.users.updateOne(
  {
    _id: 101,
  },
  {
    $set: {
      city: "Noida",
    },
  },
);
```

Conceptually, the primary records the operation in its oplog.

A secondary retrieves and applies the corresponding operation.

```text
              PRIMARY
                 |
                 v
           Write Operation
                 |
                 v
             Oplog Entry
                 |
          +------+------+
          |             |
          v             v
      Secondary 1   Secondary 2
          |             |
          v             v
      Apply Entry    Apply Entry
```

The oplog is an internal replication mechanism. Its entries should not be treated as a normal application event log.

### 9.2 What does an oplog entry look like?

A simplified conceptual example:

```json
{
  "ts": "timestamp",
  "op": "u",
  "ns": "shop.users",
  "o2": {
    "_id": 101
  },
  "o": {
    "$set": {
      "city": "Noida"
    }
  }
}
```

Fields can include:

| Field | Meaning                                                         |
| ----- | --------------------------------------------------------------- |
| `ts`  | Operation timestamp                                             |
| `op`  | Operation type                                                  |
| `ns`  | Namespace, such as database and collection                      |
| `o`   | Operation information                                           |
| `o2`  | Additional criteria, commonly including the document identifier |

This is an illustrative representation, not a guarantee of the exact internal format for every operation.

### 9.3 How do secondaries replicate data?

The general process:

1. The primary performs a write.
2. The primary records the operation in its oplog.
3. Secondaries fetch oplog entries.
4. Secondaries apply the operations.
5. Secondaries continue tracking newer entries.

This is commonly described as asynchronous replication.

The primary does not need to wait for every secondary to apply each write unless the requested write concern requires additional acknowledgements.

### 9.4 What happens if a secondary goes offline?

Suppose:

```text
Primary:
Oplog contains operations 1 to 1000

Secondary:
Last applied operation = 800
```

The secondary goes offline.

The primary continues accepting writes:

```text
New oplog operations: 1001 to 1200
```

When the secondary returns, it can request the missing operations if the required history is still available.

It then catches up.

### 9.5 Oplog window

The oplog is capped and has a limited storage capacity.

The oplog window represents how far back in time the available oplog history extends.

Example:

```text
Current time:  12:00 PM
Oldest entry:  10:00 AM

Oplog window:  2 hours
```

If a secondary has been offline for 30 minutes, the missing operations may still be available.

If it has been offline for several hours and the required entries have been overwritten, it may need an initial synchronization rather than ordinary catch-up.

### 9.6 Why should backend engineers understand the oplog?

Because it affects:

- Replica set recovery.
- Replication lag.
- Initial synchronization.
- Change Data Capture (CDC).
- Oplog-based change streams.
- Backup and recovery strategies.

MongoDB change streams use the replication infrastructure to expose database changes to applications.

---

## 10. Elections and Automatic Failover

What happens if the primary server crashes?

Consider:

```text
              Replica Set
                   |
        +----------+----------+
        |          |          |
        v          v          v
      Node A     Node B     Node C
      Primary   Secondary  Secondary
```

Now Node A fails.

```text
              Replica Set
                   |
        +----------+----------+
        |          |          |
        v          v          v
      Node A     Node B     Node C
      FAILED    Secondary  Secondary
```

The replica set must elect a new primary.

### 10.1 What is an election?

An election is the process through which eligible replica set members select a new primary.

Members communicate and vote according to MongoDB's election protocol.

A candidate must satisfy the necessary eligibility and voting requirements.

### 10.2 Election process

Simplified flow:

```text
           Primary Failure
                  |
                  v
          Members Detect Failure
                  |
                  v
          Election Is Triggered
                  |
                  v
          Eligible Candidate
                  |
                  v
             Voting
                  |
                  v
           New Primary Selected
                  |
                  v
          Application Resumes
```

MongoDB uses a majority voting requirement for elections.

For example, a three-voting-member replica set generally needs two votes to elect a primary.

### 10.3 Example

Initial state:

```text
Node A = Primary
Node B = Secondary
Node C = Secondary
```

Node A fails.

Node B and Node C remain available.

They can elect a new primary.

Possible result:

```text
Node A = Failed
Node B = Primary
Node C = Secondary
```

The MongoDB driver detects topology changes and discovers the new primary.

Applications should use a replica set connection string rather than hardcoding a single member as the only database endpoint.

### 10.4 What is failover?

Failover is the process of moving primary responsibility to another eligible member when the current primary becomes unavailable.

MongoDB replica sets support automatic failover.

However, automatic failover does not mean zero downtime.

During an election:

- Writes may temporarily fail.
- Applications may receive retryable errors.
- The driver may need to rediscover the primary.
- Operations may need to be retried safely.

### 10.5 What happens to unreplicated writes?

Suppose a primary acknowledges a write with `w: 1`, but the write has not reached a majority of replica set members.

Then the primary fails.

Depending on the election and rollback situation, that write may not be present on the newly elected primary.

This is why write concern matters.

For important writes, majority write concern is generally a stronger choice.

### 10.6 Can two primaries exist?

A healthy replica set maintains a single primary.

Network partitions can create situations where members temporarily have different views of the topology.

MongoDB's election and term mechanisms prevent multiple members from simultaneously maintaining valid primary authority for the same replica set term.

A member that loses the required majority cannot continue acting as a valid primary indefinitely.

---

## 11. Replica Set Architecture in Production

A common production setup uses three voting members.

```text
                APPLICATION
                     |
                     v
               MongoDB Driver
                     |
                     v
              REPLICA SET
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Primary   Secondary  Secondary
       Node A      Node B     Node C
          |          |          |
          +----------+----------+
                 Oplog
              Replication
```

Ideally, members are distributed across different failure domains.

For example:

```text
Availability Zone A: Node A
Availability Zone B: Node B
Availability Zone C: Node C
```

If one availability zone fails, the other members may still maintain a voting majority.

### 11.1 Why three voting members?

A majority is required for elections.

For three members:

\[
\text{Majority} = \left\lfloor\frac{3}{2}\right\rfloor + 1 = 2
\]

For five members:

\[
\text{Majority} = \left\lfloor\frac{5}{2}\right\rfloor + 1 = 3
\]

A three-member replica set can tolerate one unavailable voting member while maintaining a majority, assuming the remaining members are otherwise healthy and eligible.

### 11.2 What is an arbiter?

An arbiter is a replica set member that votes in elections but does not store the replicated dataset.

Example:

```text
Node A = Primary
Node B = Secondary
Node C = Arbiter
```

Arbiters can help with voting configurations, but they do not provide an additional copy of the data.

A data-bearing three-member replica set is generally preferable when infrastructure permits.

### 11.3 Hidden and delayed members

MongoDB also supports specialized replica set members.

**Hidden member**

A hidden member is not normally advertised for application read traffic.

It can be useful for dedicated operational or backup-related tasks.

**Delayed member**

A delayed member intentionally applies replicated operations after a configured delay.

It can provide a recovery window for certain accidental application changes.

However, it is not a substitute for independent backups.

---

## 12. MongoDB Sharding Architecture

Replication improves availability by maintaining copies of data.

But what if the database becomes too large or one machine cannot handle the workload?

Replication alone does not distribute the dataset across multiple machines for storage capacity.

This is where sharding becomes useful.

### 12.1 What is sharding?

Sharding means distributing a dataset across multiple machines called shards.

Each shard stores a portion of the overall dataset.

Consider a database containing 500 million user records.

A single server may become a bottleneck because of:

- Storage requirements.
- Memory requirements.
- CPU utilization.
- Query throughput.
- Write throughput.

Instead of storing everything on one server, we distribute the data.

### 12.2 Sharded architecture

```text
                    APPLICATION
                         |
                         v
                      mongos
                         |
              +----------+----------+
              |          |          |
              v          v          v
            Shard 1    Shard 2    Shard 3
              |          |          |
              v          v          v
           Users      Users      Users
           A - H      I - P      Q - Z
```

This is a simplified range-based illustration.

Each shard stores only a portion of the total data.

### 12.3 Important components of MongoDB sharding

MongoDB sharded clusters have three major components:

1. Shards.
2. Config servers.
3. `mongos` routers.

Let's understand each one.

---

## 13. Shards

A shard stores a portion of the sharded dataset.

A shard is commonly deployed as a replica set.

Example:

```text
                 Sharded Cluster
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
       Shard 1       Shard 2       Shard 3
          |             |             |
          v             v             v
       Replica Set   Replica Set   Replica Set
          |             |             |
       +--+--+       +--+--+       +--+--+
       |     |       |     |       |     |
       P     S       P     S       P     S
```

Each shard has its own replica set.

This provides both:

- Horizontal data distribution.
- Replication within each shard.

### Why is this combination useful?

Sharding distributes the dataset across multiple shards.

Replication protects each shard against certain node failures.

These are separate responsibilities.

### Example

Suppose a collection contains 300 million users.

A sharded deployment might distribute them as:

```text
Shard 1: 100 million users
Shard 2: 100 million users
Shard 3: 100 million users
```

The distribution depends on the shard key and actual workload.

Do not assume that every shard always contains exactly the same amount of data.

---

## 14. Config Servers

Config servers store metadata about the sharded cluster.

They maintain information such as:

- Sharded collection metadata.
- Chunk ranges.
- Which shard owns which chunks.
- Cluster configuration information.

Simplified example:

```text
             CONFIG SERVERS
                    |
                    v
          Sharding Metadata
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Shard 1   Shard 2   Shard 3
```

The metadata helps MongoDB determine where data belongs.

### 14.1 Config server replica set

In production, config servers are deployed as a replica set.

This provides redundancy for cluster metadata.

A typical deployment uses three config server members.

### 14.2 Why are config servers important?

Suppose a query requests:

```javascript
db.users.find({
  userId: 101,
});
```

The cluster must know which shard owns the relevant data.

Sharding metadata provides the mapping required for routing.

Without valid cluster metadata, the router cannot correctly coordinate operations across the cluster.

---

## 15. mongos Router

`mongos` is the query router for a MongoDB sharded cluster.

Applications connect to `mongos` rather than connecting directly to individual shards for ordinary sharded-cluster operations.

Architecture:

```text
             NODE.JS APPLICATION
                      |
                      v
                 MongoDB Driver
                      |
                      v
                    mongos
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        Shard 1     Shard 2     Shard 3
```

### 15.1 What does mongos do?

It:

1. Receives client requests.
2. Uses sharding metadata.
3. Determines which shards must participate.
4. Routes operations to the relevant shards.
5. Coordinates responses.
6. Returns the results to the application.

### 15.2 Targeted query

Suppose users are sharded by `userId`.

Query:

```javascript
db.users.find({
  userId: 101,
});
```

If the shard key allows MongoDB to identify the owning shard, `mongos` can route the query to that shard.

This is called targeted routing.

```text
                 mongos
                    |
                    v
               userId = 101
                    |
                    v
                 Shard 1
```

This is generally more efficient than querying every shard.

### 15.3 Scatter-gather query

Now suppose the application runs:

```javascript
db.users.find({
  city: "Noida",
});
```

If `city` is not useful for locating the relevant shard, MongoDB may need to query multiple shards.

```text
                  mongos
                     |
           +---------+---------+
           |         |         |
           v         v         v
         Shard 1   Shard 2   Shard 3
           |         |         |
           +---------+---------+
                     |
                     v
                Merge Results
                     |
                     v
                 Application
```

This is commonly called scatter-gather.

It can be more expensive because multiple shards participate.

### 15.4 Why should backend developers understand mongos?

Because query patterns affect how efficiently a sharded application works.

A query that targets one shard can be much more efficient than a query that must contact every shard.

---

## 16. Shard Key

The shard key determines how MongoDB distributes documents across shards.

Choosing the correct shard key is one of the most important decisions in MongoDB sharding.

Suppose documents look like:

```json
{
  "_id": 101,
  "userId": 101,
  "name": "Rahul",
  "city": "Noida"
}
```

We may choose:

```javascript
{
  userId: 1;
}
```

as the shard key.

MongoDB uses the shard key to determine where documents belong.

### 16.1 Range-based sharding

Range-based sharding distributes data according to ranges of shard-key values.

Example:

```text
Shard 1: userId 1 - 100000
Shard 2: userId 100001 - 200000
Shard 3: userId 200001 - 300000
```

Advantages:

- Range queries can target relevant shards.
- Related key ranges may be stored together.

Disadvantages:

- Sequential or uneven values can cause hotspots.
- One shard may receive disproportionate writes.

### 16.2 Hashed sharding

Hashed sharding distributes documents using a hash of the shard key.

Example:

```javascript
db.users.createIndex({
  userId: "hashed",
});
```

A hashed shard key can distribute values more evenly for some workloads.

However, it can make range queries on the original key less efficient because nearby values do not necessarily map to nearby hash values.

### 16.3 Shard key selection considerations

A good shard key should consider:

- Cardinality.
- Frequency of writes.
- Query patterns.
- Data distribution.
- Monotonicity.
- Hotspot risk.
- Whether queries include the shard key.

A poor shard key can make a sharded cluster perform worse than expected.

---

## 17. How MongoDB Distributes Data Across Shards

MongoDB divides sharded collection data into logical ranges called chunks.

Chunks are associated with shard-key ranges.

The cluster metadata tracks which shard owns each chunk.

Conceptually:

```text
                  USERS COLLECTION
                         |
                  Shard Key: userId
                         |
           +-------------+-------------+
           |             |             |
           v             v             v
        Chunk 1       Chunk 2       Chunk 3
        1-100K        100K-200K     200K-300K
           |             |             |
           v             v             v
        Shard 1       Shard 2       Shard 3
```

This is an illustrative range distribution.

Actual chunk boundaries and placement are managed by MongoDB.

### 17.1 What is a chunk?

A chunk is a logical partition of a sharded collection's data, defined by a range of shard-key values.

MongoDB tracks chunk ownership in cluster metadata.

Chunks allow MongoDB to distribute data and rebalance it as the cluster changes.

### 17.2 What happens when a shard becomes too large?

Suppose:

```text
Shard 1 = 500 GB
Shard 2 = 100 GB
Shard 3 = 100 GB
```

The distribution is uneven.

MongoDB's balancer can migrate chunks between shards to improve distribution.

Simplified process:

```text
             Uneven Distribution
                     |
                     v
               Balancer Detects
                 Imbalance
                     |
                     v
               Chunk Migration
                     |
                     v
             More Balanced Cluster
```

The actual balancing process is more sophisticated and depends on cluster configuration and version.

### 17.3 Why is chunk migration useful?

It helps distribute data as:

- New shards are added.
- Existing shards grow.
- Workloads change.
- Data distribution becomes uneven.

However, migration consumes network, disk, and server resources. It is not free.

---

## 18. Replication vs Sharding

This distinction is essential.

Replication and sharding solve different problems.

### Replication

Replication creates copies of data across multiple nodes.

```text
                Same Dataset
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Node A     Node B     Node C
        Copy       Copy       Copy
```

Primary purpose:

- Availability.
- Redundancy.
- Failover.
- Data durability across node failures, depending on write concern and configuration.

### Sharding

Sharding divides a dataset across multiple nodes.

```text
              Complete Dataset
                     |
          +----------+----------+
          |          |          |
          v          v          v
        Shard 1    Shard 2    Shard 3
        Part A     Part B     Part C
```

Primary purpose:

- Horizontal storage scaling.
- Distributing read and write workloads.
- Increasing total system capacity.

### Comparison

| Feature          | Replication                                            | Sharding                              |
| ---------------- | ------------------------------------------------------ | ------------------------------------- |
| Data arrangement | Copies of the same dataset                             | Different portions of the dataset     |
| Main goal        | Availability and redundancy                            | Horizontal scaling                    |
| Data storage     | Repeated across members                                | Distributed across shards             |
| Failover         | Yes, with suitable replica set configuration           | Each shard typically uses replication |
| Storage capacity | Does not increase unique data capacity in the same way | Adds capacity across shards           |
| Complexity       | Moderate                                               | Higher                                |
| Example          | Primary and secondaries                                | Shard 1, Shard 2, Shard 3             |

### Can MongoDB use both?

Yes.

A production sharded MongoDB cluster commonly uses replica sets for each shard.

This combines:

- Sharding for horizontal scaling.
- Replication for availability.

---

## 19. Complete MongoDB Production Architecture

Let's combine everything.

Consider an e-commerce application with:

- Node.js backend.
- MongoDB.
- Millions of users.
- Hundreds of millions of orders.
- Heavy read and write traffic.

A possible architecture:

```text
                   CLIENT APPLICATIONS
                           |
                           v
                      NODE.JS API
                           |
                           v
                     MONGODB DRIVER
                           |
                           v
                        mongos
                           |
                +----------+----------+
                |          |          |
                v          v          v
              Shard 1    Shard 2    Shard 3
                |          |          |
                v          v          v
             Replica    Replica    Replica
               Set        Set        Set
                |          |          |
          +-----+----+ +---+------+ +--+------+
          |          | |          | |         |
          v          v v          v v         v
        Primary  Secondary Primary Secondary Primary Secondary
          |
          v
       Storage Engine
          |
          v
       WiredTiger
          |
     +----+----+
     |         |
     v         v
   Cache    Data Files
               |
               v
             Journal

          CONFIG SERVER REPLICA SET
                    |
                    v
             Cluster Metadata
                    |
                    v
                  mongos
```

This architecture is designed to support:

- Multiple application connections.
- Distributed storage.
- Replica set failover.
- Replication.
- Memory caching.
- Durable writes.
- Shard-level query routing.

It also introduces operational complexity.

A small application does not automatically need this architecture.

Start with an appropriately sized replica set or managed deployment. Introduce sharding only when workload and capacity requirements justify it.

---

## 20. Practical MongoDB Commands

These commands help inspect MongoDB deployment architecture.

### 20.1 Check server status

```javascript
db.serverStatus();
```

Returns server metrics and internal status information.

### 20.2 Check replica set status

```javascript
rs.status();
```

Shows replica set member states and replication-related information.

### 20.3 Check replica set configuration

```javascript
rs.conf();
```

Shows the replica set configuration.

### 20.4 Check the primary

```javascript
db.hello();
```

Returns information about the current server's topology and role.

### 20.5 Check replication information

```javascript
rs.printReplicationInfo();
```

Prints information about the oplog and its time window.

```javascript
rs.printSecondaryReplicationInfo();
```

Prints replication information for secondary members.

### 20.6 Inspect the oplog

On a replica set member:

```javascript
use local

db.oplog.rs.find().sort({
    $natural: -1
}).limit(5);
```

The `local` database contains replica set-specific data, including the oplog on replica set members.

### 20.7 Check sharding status

On a sharded cluster:

```javascript
sh.status();
```

Displays sharding configuration and distribution information.

### 20.8 Check database statistics

```javascript
db.stats();
```

### 20.9 Check collection statistics

```javascript
db.users.stats();
```

### Important

Some administrative commands require appropriate permissions and must be run against the correct deployment type.

For example, `rs.status()` and `sh.status()` are not interchangeable. They inspect different architectural components.

---

## 21. Common Misconceptions

### Misconception 1: Replication means backup.

Incorrect.

Replication copies changes across members. Accidental deletion can also replicate.

Use independent backups.

### Misconception 2: A secondary always has the latest data.

Incorrect.

Secondaries can experience replication lag.

### Misconception 3: MongoDB automatically distributes all collections across multiple machines.

Incorrect.

Sharding must be configured for the collections that need to be sharded.

### Misconception 4: More replicas automatically increase write throughput.

Incorrect.

A replica set still has a primary that handles writes.

Secondaries can help distribute certain read workloads, but replication itself adds work.

### Misconception 5: Sharding and replication are the same.

Incorrect.

Sharding distributes different portions of data.

Replication maintains copies of data.

### Misconception 6: Journaling replaces replication.

Incorrect.

Journaling helps with local crash recovery. Replication maintains copies across nodes.

### Misconception 7: More RAM fixes every database performance problem.

Incorrect.

Poor indexing, inefficient queries, hotspots, and network bottlenecks can remain.

### Misconception 8: A sharded cluster always makes queries faster.

Incorrect.

Queries that target one shard can be efficient, while scatter-gather queries may be expensive.

### Misconception 9: MongoDB failover means no request will ever fail.

Incorrect.

During elections, applications may temporarily encounter errors or timeouts.

Drivers and application code must handle transient failures.

### Misconception 10: Every MongoDB application needs sharding.

Incorrect.

Sharding introduces operational and architectural complexity. Use it when justified by actual scale requirements.

---

## 22. Interview Questions and Answers

### Q1. What is a storage engine?

A storage engine manages how database records and indexes are stored, retrieved, updated, and persisted.

### Q2. What is WiredTiger?

WiredTiger is MongoDB's default storage engine. It provides caching, concurrency control, compression, journaling, and checkpointing.

### Q3. What is MVCC?

Multi-Version Concurrency Control allows concurrent operations to work with appropriate versions or snapshots of data, reducing conflicts between readers and writers.

### Q4. What is the WiredTiger cache?

It is an internal memory cache used by WiredTiger to keep useful data and index information available in memory.

### Q5. What is the working set?

The working set is the portion of data and indexes that an application actively accesses during a period.

### Q6. What is journaling?

Journaling records changes in a journal to support recovery after unexpected shutdowns.

### Q7. What is write concern?

Write concern controls the acknowledgement level requested for a database write.

### Q8. What is a replica set?

A replica set is a group of MongoDB instances that maintain the same dataset through replication.

### Q9. What is the role of a primary?

The primary accepts writes and records operations for replication.

### Q10. What is the role of a secondary?

A secondary replicates changes from the primary and may serve reads according to the configured read preference.

### Q11. What is the oplog?

The oplog is a special capped collection that records operations used by replica set members to replicate data.

### Q12. What is replication lag?

Replication lag is the delay between an operation being recorded on the primary and being applied by a secondary.

### Q13. What happens when the primary fails?

Eligible replica set members can hold an election and select a new primary if voting requirements are satisfied.

### Q14. What is an arbiter?

An arbiter votes in elections but does not store the replicated dataset.

### Q15. What is sharding?

Sharding distributes a collection's data across multiple machines called shards.

### Q16. What is a shard key?

A shard key is the field or combination of fields MongoDB uses to distribute documents across shards.

### Q17. What is mongos?

`mongos` is the query router that directs client operations to the appropriate shards.

### Q18. What are config servers?

Config servers store sharding metadata, including chunk ownership and cluster configuration.

### Q19. What is scatter-gather?

Scatter-gather is a query execution approach where the router sends an operation to multiple shards and combines their results.

### Q20. What is chunk migration?

Chunk migration moves chunks between shards to improve data distribution.

### Q21. Can MongoDB use replication and sharding together?

Yes. Each shard is commonly configured as a replica set, providing both horizontal distribution and redundancy.

### Q22. Does majority write concern mean every replica has applied the write?

No. Majority acknowledgement does not mean every replica set member has applied the operation. It means the requested majority acknowledgement condition has been satisfied.

### Q23. What is the difference between journaling and replication?

Journaling helps recover changes after local crashes. Replication maintains copies of data across multiple members.

### Q24. Why is shard key selection important?

The shard key affects data distribution, query routing, scalability, and hotspot risk. A poor shard key can create uneven workloads.

---

## 23. Practical Exercises

### Exercise 1: Understand the storage architecture

Explain the responsibilities of:

1. MongoDB server.
2. Query layer.
3. WiredTiger.
4. WiredTiger cache.
5. Filesystem cache.
6. Journal.
7. Data files.

Draw a diagram showing how these components relate.

### Exercise 2: Replica set failure

Consider this replica set:

```text
Node A = Primary
Node B = Secondary
Node C = Secondary
```

Questions:

1. What happens if Node A crashes?
2. How do Node B and Node C select a new primary?
3. What happens to writes that were not replicated?
4. Can the application continue without reconnecting manually?
5. What happens if Node B and Node C cannot communicate with each other?

### Exercise 3: Read scaling

An application receives:

```text
Reads:  100,000 requests/minute
Writes: 10,000 requests/minute
```

Design a replica set strategy.

Explain:

- Which requests should go to the primary?
- Which reads can go to secondaries?
- What consistency issues might occur?
- When should the application prefer primary reads?

### Exercise 4: Sharding architecture

An e-commerce database has:

```text
Users:       100 million
Orders:      500 million
Products:     10 million
```

Design a sharding strategy.

For each collection, decide:

- Whether it needs sharding.
- A possible shard key.
- Whether range or hashed sharding is appropriate.
- Which queries should be targeted.
- Which queries may become scatter-gather.

### Exercise 5: Production failure scenario

Suppose:

- Your primary node fails.
- A secondary becomes primary.
- Some users report that their latest orders are missing.
- The application reports intermittent write errors.

Explain:

1. What could have happened?
2. How does write concern affect the situation?
3. How does replication lag affect reads?
4. What should the application do during failover?
5. How can you reduce the risk of losing acknowledged writes?

---

## 24. Chapter Summary

| Component        | Responsibility                                    |
| ---------------- | ------------------------------------------------- |
| MongoDB server   | Processes database requests                       |
| Query layer      | Parses, plans, and executes queries               |
| WiredTiger       | Manages storage and internal data operations      |
| WiredTiger cache | Keeps useful data and index information in memory |
| Filesystem cache | Uses operating system memory for file pages       |
| Journal          | Supports recovery after unexpected shutdowns      |
| Write concern    | Controls requested write acknowledgement          |
| Replica set      | Maintains replicated copies of data               |
| Primary          | Accepts writes                                    |
| Secondary        | Replicates changes from the primary               |
| Oplog            | Records operations used for replication           |
| Election         | Selects a new primary                             |
| Failover         | Transfers primary responsibility                  |
| Shard            | Stores a portion of the dataset                   |
| Config servers   | Store sharding metadata                           |
| mongos           | Routes client operations                          |
| Shard key        | Determines data distribution                      |
| Chunk            | Logical range of shard-key values                 |
| Balancer         | Coordinates chunk distribution                    |

### Final mental model

```text
                 MONGODB ARCHITECTURE
                         |
          +--------------+--------------+
          |                             |
          v                             v
    STORAGE ENGINE                  DISTRIBUTION
          |                             |
          v                             v
      WiredTiger                    Replication
          |                             |
     +----+----+                        v
     |         |                    Replica Set
     v         v                        |
   Cache    Journal                 +---+---+
     |         |                     |       |
     v         v                     v       v
   Memory     Disk                 Primary Secondary
                         |
                         v
                       Sharding
                         |
              +----------+----------+
              |          |          |
              v          v          v
            Shard 1    Shard 2    Shard 3
              |
              v
       mongos + Config Servers
```

### The most important concepts to remember

1. WiredTiger is MongoDB's default storage engine.
2. WiredTiger uses caching, MVCC, and other mechanisms to manage data efficiently.
3. The operating system filesystem cache is separate from the WiredTiger cache.
4. Journaling supports local crash recovery.
5. Write concern controls how strongly a write must be acknowledged.
6. Replica sets maintain copies of data across multiple nodes.
7. The primary handles writes; secondaries replicate changes.
8. The oplog is central to replica set replication.
9. Elections allow a new primary to be selected after failure.
10. Replication lag can cause stale reads.
11. Sharding distributes different portions of a dataset across machines.
12. `mongos` routes operations to shards.
13. Config servers maintain sharding metadata.
14. Shard keys strongly influence performance and data distribution.
15. MongoDB commonly combines sharding and replication for large production deployments.

**Engineering takeaway:** Understanding MongoDB's document model is only half the job. A backend engineer must also understand how data is stored, cached, replicated, recovered, and distributed. These mechanisms determine how the database behaves under real production workloads.
