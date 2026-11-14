---
sidebar_label: "Wide-Column Databases: Internal Architecture"
sidebar_position: 1
---

# Wide-Column Databases: Internal Architecture

## 1. Introduction

In last section, we studied wide-column databases, their data models, and the fundamentals of Cassandra and HBase.

Now we will focus on **how Cassandra stores, writes, reads, and manages data internally**.

Cassandra is designed to handle large write workloads across distributed nodes. One of the main reasons it achieves high write throughput is its storage architecture, which is based on an **LSM Tree (Log-Structured Merge Tree)**.

Unlike a traditional B-Tree-based database, Cassandra does not immediately update an existing record in its primary on-disk data structure.

Instead, it generally follows this process:

1. Receive a write request.
2. Append the write to a commit log.
3. Update an in-memory structure called a memtable.
4. Flush the memtable to disk as an SSTable.
5. Merge and reorganize SSTables through compaction.

To understand Cassandra's performance, you need to understand each of these components.

### Topics covered

- Cassandra storage architecture.
- Commit logs.
- Memtables.
- SSTables.
- LSM Tree architecture.
- Write path.
- Read path.
- Compaction.
- Tombstones.
- Storage and performance tradeoffs.

---

## 2. High-Level Cassandra Storage Architecture

Before looking at individual components, understand how they work together.

```text
                Application
                     |
                     |
              Cassandra Node
                     |
              Write Request
                     |
          +----------+----------+
          |                     |
          v                     v
     Commit Log              Memtable
     (Disk)                  (Memory)
          |                     |
          |                     |
          |              Flush when needed
          |                     |
          |                     v
          |                  SSTable
          |                   (Disk)
          |                     |
          +---------------------+
                                |
                                v
                            Compaction
                                |
                                v
                      New SSTables on Disk
```

Each component has a specific responsibility.

| Component  | Storage                | Responsibility                                               |
| ---------- | ---------------------- | ------------------------------------------------------------ |
| Commit log | Disk                   | Provides durability and recovery                             |
| Memtable   | Memory                 | Holds recent writes in an in-memory sorted structure         |
| SSTable    | Disk                   | Stores flushed, immutable data                               |
| Compaction | Disk operations        | Merges SSTables and manages obsolete data                    |
| LSM Tree   | Overall storage design | Organizes writes and reads across memory and disk structures |

The important idea is that Cassandra separates the process of accepting writes from the process of organizing data permanently on disk.

---

## 3. What Is an LSM Tree?

**LSM stands for Log-Structured Merge Tree.**

It is a storage architecture optimized for write-heavy workloads.

Databases using LSM-based storage generally accept writes into memory and periodically flush batches of data to disk.

Instead of repeatedly modifying existing disk pages, they write new data sequentially and merge data structures later.

### 3.1 Why Is an LSM Tree Needed?

Consider a traditional B-Tree-based database.

Suppose you update a record:

```text
User ID: 101
Name: Prashant
City: Noida
```

You change the city:

```text
User ID: 101
Name: Prashant
City: Delhi
```

A B-Tree-based storage engine may need to locate the relevant page and modify the appropriate data structure, potentially involving additional page writes, logging, and page management.

Now consider an application receiving millions of writes.

Random disk updates can become expensive, particularly when storage devices are involved.

An LSM-based design takes a different approach:

1. Accept writes in memory.
2. Persist them through a sequential commit log.
3. Flush batches of data to disk.
4. Merge disk structures later.

This reduces the need to perform an in-place disk update for every write.

### 3.2 Simplified LSM Tree Structure

```text
              Incoming Writes
                     |
                     v
                 Memtable
                  (RAM)
                     |
              Flush to Disk
                     |
                     v
                SSTable A
                SSTable B
                SSTable C
                     |
                     v
                 Compaction
                     |
                     v
             Merged SSTables
```

An LSM Tree is not necessarily one literal tree-shaped file.

It is a family of memory and disk structures organized to support efficient writes, reads, and merging.

### 3.3 LSM Tree vs B-Tree

| Feature                | B-Tree                                 | LSM Tree                                             |
| ---------------------- | -------------------------------------- | ---------------------------------------------------- |
| Primary write behavior | Updates tree pages                     | Writes to memory and flushes sorted data             |
| Disk writes            | May involve random page updates        | Often uses sequential writes                         |
| Read behavior          | Searches tree structure                | May search memory and multiple disk files            |
| Write throughput       | Depends on implementation and workload | Often strong for write-heavy workloads               |
| Compaction             | Not the same LSM merge process         | Important background operation                       |
| Storage overhead       | Page splits and other maintenance      | Temporary duplicate versions and compaction overhead |
| Typical examples       | PostgreSQL indexes, InnoDB indexes     | Cassandra, RocksDB                                   |

**Important:** Neither structure is universally faster. The correct choice depends on the workload, hardware, query patterns, and implementation.

---

## 4. Commit Log

The **commit log** is a disk-based append-only log that helps Cassandra recover writes after a crash.

It is one of the key durability mechanisms in Cassandra.

### 4.1 Why Does Cassandra Need a Commit Log?

Suppose an application sends a write request.

Cassandra stores the new data in a memtable, which resides in RAM.

What happens if the server suddenly crashes?

RAM is volatile. Data that exists only in memory can disappear.

The commit log protects against this situation.

Before the write is considered successfully persisted according to the relevant acknowledgement conditions, Cassandra records the mutation in its commit log.

The commit log is written to disk so that Cassandra can recover acknowledged mutations after a process or machine failure, subject to the configured durability settings and failure scenario.

### 4.2 How Does It Work?

Suppose the application executes:

```sql
INSERT INTO users (
    user_id,
    name,
    city
)
VALUES (
    101,
    'Prashant',
    'Noida'
);
```

A simplified sequence:

```text
Application
    |
    | INSERT request
    v
Cassandra Node
    |
    +--------------------+
    |                    |
    v                    v
Commit Log            Memtable
(Disk)                (RAM)
    |                    |
    |                    |
    v                    v
Durable record       In-memory record
```

The commit log records the mutation.

The memtable makes the new data available for subsequent reads.

The commit log and memtable serve different purposes:

- Commit log: durability and recovery.
- Memtable: fast in-memory access to recently written data.

### 4.3 Why Is the Commit Log Append-Only?

Instead of repeatedly updating arbitrary positions in a file, Cassandra appends new records to the commit log.

Conceptually:

```text
Commit Log

+---------------------------+
| Mutation 1                |
+---------------------------+
| Mutation 2                |
+---------------------------+
| Mutation 3                |
+---------------------------+
| Mutation 4                |
+---------------------------+
```

Append-oriented writes are generally more efficient than many random disk updates.

### 4.4 What Happens During a Crash?

Suppose Cassandra has:

```text
Commit Log:
    Mutation A
    Mutation B
    Mutation C

Memtable:
    A
    B
    C
```

Now the server crashes before the memtable is flushed to an SSTable.

The memtable is lost because it existed in memory.

However, the commit log still contains the mutations.

During recovery, Cassandra replays the relevant commit-log records to reconstruct the memtable state.

Conceptually:

```text
Server Crash
     |
     v
Memtable Lost
     |
     v
Commit Log Available
     |
     v
Replay Mutations
     |
     v
Rebuild Memtable
```

This allows Cassandra to recover writes that were not yet flushed to SSTables.

### 4.5 Commit Log Synchronization

Cassandra supports different commit-log synchronization strategies.

The important concepts are:

- **Periodic:** Commit-log data is synchronized periodically according to configuration.
- **Batch:** Acknowledgement waits for the required commit-log synchronization for the write.

These settings affect the durability and latency tradeoff.

Do not assume that every write is synchronously forced to durable storage in exactly the same way. The configured synchronization mode and storage behavior matter.

---

## 5. Memtable

A **memtable** is an in-memory data structure that stores recent writes.

It is an essential component of Cassandra's write path.

### 5.1 Why Does Cassandra Use Memtables?

Writing directly to disk for every individual mutation can be expensive.

Instead, Cassandra accumulates writes in memory.

This provides:

- Fast write processing.
- Efficient batching of data before disk flush.
- An in-memory source for recently written data.

### 5.2 How Does a Memtable Work?

Suppose an application inserts three records:

```sql
INSERT INTO users (user_id, name)
VALUES (101, 'Prashant');

INSERT INTO users (user_id, name)
VALUES (102, 'Rahul');

INSERT INTO users (user_id, name)
VALUES (103, 'Amit');
```

The memtable temporarily holds these records.

Conceptually:

```text
Memtable (RAM)
--------------------------------
user_id | name
--------------------------------
101     | Prashant
102     | Rahul
103     | Amit
--------------------------------
```

Cassandra uses an ordered in-memory representation of the data.

The exact internal representation is more complex than this simplified table.

### 5.3 What Happens When a Memtable Becomes Full?

Memtables have memory thresholds and are flushed when configured conditions are reached.

A simplified lifecycle:

```text
          New Writes
               |
               v
           Memtable
               |
               v
       Memory Threshold Reached
               |
               v
         Flush Triggered
               |
               v
       Immutable SSTable
               |
               v
        New Memtable Active
```

Once a memtable is selected for flushing, it becomes immutable for that purpose.

Cassandra can continue accepting new writes into another active memtable.

### 5.4 Why Is the Memtable Important?

Without the memtable, Cassandra would need to organize every incoming write directly into its persistent sorted files.

By buffering writes in memory, Cassandra can efficiently produce larger sorted disk files.

### 5.5 Memtable vs Commit Log

These two are frequently confused.

| Feature           | Memtable                                | Commit Log                                                                     |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| Storage           | RAM                                     | Disk                                                                           |
| Main purpose      | Hold recent data for reads and flushing | Durability and recovery                                                        |
| Data structure    | In-memory sorted structure              | Append-oriented log                                                            |
| Data availability | Used during normal reads                | Primarily used for recovery                                                    |
| Lifecycle         | Flushed to SSTable                      | Segments become eligible for recycling after associated data is safely flushed |

**Remember:**

The commit log protects writes.

The memtable organizes recent writes in memory.

---

## 6. SSTable

**SSTable stands for Sorted String Table.**

It is an immutable, sorted data file stored on disk.

When a memtable is flushed, Cassandra writes its contents to an SSTable.

### 6.1 Why Are SSTables Important?

Instead of continuously modifying existing data files, Cassandra creates new SSTables.

This is a central characteristic of its LSM-based storage architecture.

For example:

```text
Memtable:
--------------------------------
101 -> Prashant
102 -> Rahul
103 -> Amit
--------------------------------

             Flush
               |
               v

SSTable_1.db
--------------------------------
101 -> Prashant
102 -> Rahul
103 -> Amit
--------------------------------
```

Once created, the SSTable is immutable.

If an existing record changes, Cassandra generally writes a newer version rather than modifying the old SSTable in place.

### 6.2 Why Are SSTables Sorted?

Sorted data supports efficient searching and merging.

Cassandra can use indexes, summaries, filters, and other metadata to reduce the amount of disk data that must be examined.

### 6.3 What Happens When Data Is Updated?

Suppose the database initially contains:

```text
SSTable_1

user_101 -> city: Noida
```

The application updates the city:

```sql
UPDATE users
SET city = 'Delhi'
WHERE user_id = 101;
```

A simplified result:

```text
SSTable_1
    user_101 -> city: Noida

SSTable_2
    user_101 -> city: Delhi
```

The old SSTable remains unchanged.

The newer mutation carries a later timestamp and takes precedence during reconciliation.

The actual reconciliation process also accounts for deletion markers, timestamps, and other cell-level metadata.

### 6.4 What Happens When Data Is Deleted?

A delete operation does not simply remove the old value from every SSTable immediately.

Cassandra writes a deletion marker called a **tombstone**.

We will study tombstones separately.

### 6.5 SSTable Components

An SSTable is not just one simple data file.

It consists of multiple related components.

Important examples include:

| Component                                      | Purpose                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Data (`Data.db`)                               | Stores actual row and cell data                                          |
| Primary index (`Index.db`)                     | Helps locate partition data                                              |
| Summary (`Summary.db`)                         | Provides a sampled index to help locate positions efficiently            |
| Bloom filter (`Filter.db`)                     | Helps determine whether a partition is definitely absent from an SSTable |
| Statistics (`Statistics.db`)                   | Stores metadata and statistics                                           |
| Compression information (`CompressionInfo.db`) | Stores information needed for compressed data access                     |

The exact components and naming can vary by Cassandra version and SSTable format.

### 6.6 Bloom Filters

A Bloom filter is a probabilistic data structure used to test whether an element may exist in a set.

In Cassandra, Bloom filters help avoid unnecessary SSTable disk lookups.

A Bloom filter can return:

- **Definitely not present:** Cassandra can skip that SSTable for the partition.
- **Possibly present:** Cassandra must check the SSTable's index and data.

A Bloom filter can produce false positives, but it should not produce false negatives when operating correctly.

Example:

```text
Looking for user_101

SSTable_1 Bloom Filter:
    Definitely absent
    -> Skip SSTable_1

SSTable_2 Bloom Filter:
    Possibly present
    -> Check SSTable_2

SSTable_3 Bloom Filter:
    Definitely absent
    -> Skip SSTable_3
```

This can reduce unnecessary disk I/O.

---

## 7. Understanding the Complete Write Path

Now combine the concepts.

The **write path** describes what happens internally when Cassandra receives a write request.

### 7.1 Step-by-Step Write Path

Suppose an application executes:

```sql
INSERT INTO user_events (
    user_id,
    event_time,
    event_type,
    device
)
VALUES (
    101,
    '2026-11-14T10:30:00Z',
    'login',
    'Android'
);
```

A simplified write flow:

**Step 1: Request reaches Cassandra**

The client sends the request to a Cassandra node.

That node acts as the coordinator for the request.

**Step 2: Determine the replicas**

Cassandra uses the partition key and its replication configuration to determine which nodes own replicas of the relevant partition.

**Step 3: Append to the commit log**

The mutation is recorded in the commit log on the relevant replica nodes.

**Step 4: Update the memtable**

The mutation is applied to the relevant in-memory memtable on those nodes.

**Step 5: Acknowledge the write**

The coordinator waits for the number of replica acknowledgements required by the configured consistency level.

**Step 6: Flush the memtable**

When flush conditions are met, Cassandra writes the memtable contents to SSTables.

**Step 7: Compact SSTables**

Background compaction can merge SSTables and remove obsolete data when it is safe to do so.

### 7.2 Write Path Diagram

```text
                  Client
                    |
                    v
             Coordinator Node
                    |
             Identify Replicas
                    |
          +---------+---------+
          |         |         |
          v         v         v
        Node A    Node B    Node C
          |         |         |
          v         v         v
      Commit Log Commit Log Commit Log
          |         |         |
          v         v         v
       Memtable  Memtable  Memtable
          |         |         |
          +---------+---------+
                    |
          Required acknowledgements
                    |
                    v
             Client Response


        Later, independently:

             Memtable Flush
                    |
                    v
                SSTables
                    |
                    v
                Compaction
```

### 7.3 Does Cassandra Wait for an SSTable Before Responding?

Generally, no.

A write does not normally wait for a memtable flush to SSTable before being acknowledged.

The write's durability and acknowledgement depend on the commit-log configuration and consistency level.

This is one reason Cassandra can handle high write throughput.

### 7.4 What Is a Coordinator?

The coordinator is the node that receives a client request and coordinates the operation across the relevant replicas.

It does not need to be a permanent primary node.

Any Cassandra node can act as a coordinator.

### 7.5 What Is a Consistency Level?

The consistency level determines how many replica responses Cassandra requires before considering an operation successful.

Examples include:

- `ONE`
- `QUORUM`
- `ALL`
- `LOCAL_QUORUM`

For example, suppose the replication factor is three.

With `QUORUM`, Cassandra generally requires acknowledgements from two replicas for a write.

This is a simplified explanation; data-center configuration and operation type also matter.

---

## 8. Understanding the Read Path

The **read path** describes how Cassandra retrieves data when an application executes a query.

Unlike a traditional database that may retrieve data from a single organized disk structure, Cassandra may need to check multiple storage locations.

These can include:

1. Memtables.
2. Multiple SSTables.

### 8.1 Why Does Cassandra Check Multiple Locations?

Suppose the application inserts a record and then updates it several times.

The data may be distributed across different SSTables because SSTables are immutable.

Example:

```text
Memtable:
    user_101 -> city: Mumbai

SSTable_1:
    user_101 -> city: Noida

SSTable_2:
    user_101 -> city: Delhi
```

The latest value must be determined by reconciling the relevant versions and timestamps.

### 8.2 Simplified Read Path

```text
               Read Request
                    |
                    v
               Coordinator
                    |
                    v
             Relevant Replica
                    |
          +---------+---------+
          |                   |
          v                   v
       Memtable             SSTables
          |                   |
          |             Bloom Filters
          |                   |
          |              Index Lookup
          |                   |
          |              Data Read
          |                   |
          +---------+---------+
                    |
                    v
             Reconcile Results
                    |
                    v
              Return Result
```

### 8.3 Step-by-Step Read Process

Suppose the application executes:

```sql
SELECT *
FROM user_events
WHERE user_id = 101;
```

A simplified process:

**Step 1: Identify the partition**

Cassandra uses the partition key to locate the relevant partition.

**Step 2: Check in-memory data**

Cassandra checks the relevant memtable state.

**Step 3: Identify relevant SSTables**

It uses metadata and Bloom filters to avoid checking files that definitely do not contain the partition.

**Step 4: Locate the partition**

If an SSTable may contain the partition, Cassandra uses its index structures to locate the relevant data.

**Step 5: Read and reconcile**

Cassandra combines the relevant values from memtables and SSTables, considering timestamps, tombstones, and other reconciliation rules.

**Step 6: Return the result**

The coordinator returns the result according to the consistency requirements of the query.

### 8.4 Why Can Reads Become Expensive?

Imagine a partition has been updated many times.

Its relevant data may exist in several SSTables.

A read may need to inspect multiple files and reconcile their contents.

```text
Read user_101

Memtable
    user_101

SSTable_1
    user_101

SSTable_2
    user_101

SSTable_3
    user_101

SSTable_4
    user_101
```

More SSTables can mean more work, although Bloom filters, indexes, caching, and other optimizations reduce the cost.

This is one reason compaction is important.

---

## 9. Compaction

**Compaction is the process of merging SSTables and reorganizing their data.**

It is an important background operation in Cassandra.

Remember:

- SSTables are immutable.
- Updates create newer versions.
- Deletes create tombstones.
- Multiple SSTables can contain versions of the same partition.

Without compaction, the number of SSTables and obsolete data could continue increasing.

### 9.1 Why Is Compaction Needed?

Suppose Cassandra has three SSTables:

```text
SSTable_1
-----------------------
user_101 -> city: Noida
user_102 -> city: Delhi


SSTable_2
-----------------------
user_101 -> city: Mumbai
user_103 -> city: Pune


SSTable_3
-----------------------
user_101 -> city: Bangalore
user_102 -> city: Jaipur
```

The same logical records may appear in multiple files.

A read may need to reconcile these versions.

Compaction merges SSTables and produces new SSTables containing reconciled data.

Conceptually:

```text
SSTable_1
     |
SSTable_2
     |          Compaction
SSTable_3      ----------->
                         |
                         v
                  New SSTable
```

The newest valid value for `user_101` is retained according to Cassandra's reconciliation rules.

### 9.2 What Does Compaction Do?

Compaction can:

1. Merge multiple SSTables.
2. Reconcile multiple versions of the same data.
3. Remove obsolete overwritten values when safe.
4. Process deletion markers.
5. Reduce the number of SSTables involved in future reads.
6. Reorganize data according to the selected compaction strategy.

Compaction is not merely a file merge. It is also part of Cassandra's data cleanup process.

### 9.3 Compaction Strategies

Cassandra supports multiple compaction strategies.

The main strategies to understand are:

| Strategy | Main idea                       | Typical workload                                                                    |
| -------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| STCS     | Size-Tiered Compaction Strategy | General workloads with many similarly sized SSTables                                |
| LCS      | Leveled Compaction Strategy     | Workloads where read performance and predictable SSTable organization are important |
| TWCS     | Time-Window Compaction Strategy | Time-series and time-oriented data                                                  |

#### A. Size-Tiered Compaction Strategy (STCS)

STCS groups SSTables of similar sizes and compacts them together.

Example:

```text
SSTable_1: 100 MB
SSTable_2: 110 MB
SSTable_3: 105 MB
SSTable_4: 95 MB

          |
          v
      Compaction
          |
          v
     Larger SSTable
```

This strategy is often suitable for write-heavy workloads.

However, it can temporarily create significant disk-space requirements and may leave many SSTables involved in reads.

#### B. Leveled Compaction Strategy (LCS)

LCS organizes SSTables into levels.

The idea is to keep SSTables within a level organized so that their key ranges do not overlap in the same way they can under tiered strategies.

Conceptually:

```text
Level 0:
   SSTable A
   SSTable B
   SSTable C

          |
          v

Level 1:
   SSTable D
   SSTable E
   SSTable F

          |
          v

Level 2:
   SSTable G
   SSTable H
```

This organization can improve read predictability by limiting the number of relevant SSTables that need to be checked.

However, it generally involves more ongoing compaction work and write amplification.

#### C. Time-Window Compaction Strategy (TWCS)

TWCS groups time-series data into time windows.

For example:

```text
Window 1: 00:00 - 01:00
    SSTable_1
    SSTable_2

Window 2: 01:00 - 02:00
    SSTable_3
    SSTable_4

Window 3: 02:00 - 03:00
    SSTable_5
```

This can be useful when data is written in time order and old data is deleted through retention policies.

For example, an IoT platform may retain sensor data for 30 days.

TWCS can make expiration and cleanup of older time-based data more manageable.

It requires careful handling of data timestamps and late-arriving writes.

### 9.4 Compaction Tradeoffs

Compaction improves some aspects of read performance and storage organization, but it consumes resources.

| Benefit                       | Cost                       |
| ----------------------------- | -------------------------- |
| Fewer SSTables to inspect     | Disk I/O                   |
| Reconciles obsolete versions  | CPU usage                  |
| Processes deletion markers    | Temporary disk-space usage |
| Improves storage organization | Background workload        |
| Can improve read performance  | Write amplification        |

**Write amplification** means that the same logical data may be written multiple times to storage because of compaction and other storage-engine operations.

---

## 10. Tombstones

A **tombstone** is a deletion marker used by Cassandra.

This is an important concept because Cassandra's SSTables are immutable.

### 10.1 Why Does Cassandra Need Tombstones?

Suppose a record exists in an SSTable:

```text
SSTable_1

user_101 -> city: Noida
```

Now the application deletes it:

```sql
DELETE FROM users
WHERE user_id = 101;
```

Cassandra cannot simply modify every SSTable containing that record immediately.

Instead, it writes a tombstone.

Conceptually:

```text
SSTable_1
    user_101 -> city: Noida

New Mutation
    user_101 -> TOMBSTONE
```

The tombstone indicates that the old value has been deleted.

### 10.2 How Does Cassandra Use Tombstones?

During reads, Cassandra considers tombstones while reconciling data.

A tombstone prevents an older value from being returned as if it still exists.

During compaction, obsolete data and tombstones may be removed when Cassandra can safely determine that doing so will not allow deleted data to reappear.

### 10.3 Why Can't Tombstones Be Removed Immediately?

Imagine three replicas.

A deletion reaches two replicas, but the third replica is temporarily unavailable.

If the deletion marker is removed too early, the third replica could later provide an older version of the record.

That can cause deleted data to reappear.

Cassandra therefore retains tombstones according to its deletion and repair safety mechanisms.

### 10.4 Tombstone Accumulation

Too many tombstones can negatively affect read performance.

Example:

```text
Partition user_101

Value A -> Tombstone
Value B -> Tombstone
Value C -> Tombstone
Value D -> Tombstone
Value E -> Current Value
```

A read may need to process many deletion markers.

This can increase CPU and read-processing costs.

### 10.5 Tombstone-Related Best Practices

- Avoid unnecessary high-frequency deletes.
- Avoid repeatedly updating data models in ways that create excessive tombstones.
- Design retention policies carefully.
- Use time-based data modeling for suitable time-series workloads.
- Monitor tombstone-related read warnings and performance.
- Understand repair and grace-period requirements before changing tombstone settings.

**Important:** Tombstones are not simply deleted rows. They are distributed deletion information that must be retained until it is safe to discard.

---

## 11. Complete Lifecycle of a Cassandra Write

Now combine all the concepts into one example.

Suppose a campaign application records this event:

```javascript
{
    userId: 101,
    campaignId: 501,
    eventType: "product_view",
    eventTime: "2026-11-14T10:30:00Z"
}
```

### Stage 1: Write Request

The application sends the mutation to Cassandra.

### Stage 2: Coordinator

The receiving node becomes the coordinator.

It identifies the replicas responsible for the partition.

### Stage 3: Commit Log

The mutation is appended to the relevant replica nodes' commit logs.

### Stage 4: Memtable

The mutation is added to the relevant in-memory memtables.

### Stage 5: Acknowledgement

The coordinator waits for the configured consistency level and responds to the client.

### Stage 6: Flush

When flush conditions are met, memtables are written to SSTables.

### Stage 7: Updates

If the same record is updated, newer mutations can be stored in later SSTables.

### Stage 8: Deletes

If the record is deleted, Cassandra writes a tombstone.

### Stage 9: Compaction

SSTables are merged. Obsolete versions and deletion markers are handled when safe.

### Complete Lifecycle Diagram

```text
             Application
                  |
                  v
             Write Request
                  |
                  v
             Coordinator
                  |
                  v
          Determine Replicas
                  |
          +-------+-------+
          |       |       |
          v       v       v
        Node A  Node B  Node C
          |       |       |
          v       v       v
      Commit Log Commit Log Commit Log
          |       |       |
          v       v       v
       Memtable Memtable Memtable
          |       |       |
          +-------+-------+
                  |
                  v
           Client Acknowledged
                  |
                  v
            Memtable Flush
                  |
                  v
               SSTables
                  |
                  v
              Compaction
                  |
                  v
       Reconciled SSTables on Disk
```

---

## 12. Why Cassandra Is Good at Write-Heavy Workloads

Now that you understand the internal architecture, the performance characteristics become clearer.

Cassandra uses several mechanisms that help it process large write workloads.

### 12.1 Sequential Writes

Commit-log writes are append-oriented.

This helps avoid repeated random updates to the commit-log file.

### 12.2 In-Memory Writes

Recent mutations are applied to memtables in memory.

This avoids requiring every write to immediately reorganize disk data.

### 12.3 Batch Disk Flushes

Memtables are flushed to disk as SSTables.

This allows Cassandra to write organized batches rather than performing a full disk update for every individual mutation.

### 12.4 Distributed Data

Data is distributed across nodes.

The cluster can spread storage and request processing across multiple machines.

### 12.5 Background Compaction

Compaction reorganizes disk data outside the normal client write operation.

This helps maintain a manageable storage layout.

### Important tradeoff

The same architecture that improves write throughput can increase read complexity.

A read may need to examine multiple SSTables and reconcile different versions.

This is one of the fundamental LSM-tree tradeoffs.

---

## 13. Common Performance Problems

Understanding the architecture also helps explain common Cassandra performance problems.

| Problem                  | Why it happens                                   | Possible direction                            |
| ------------------------ | ------------------------------------------------ | --------------------------------------------- |
| Slow reads               | Too many SSTables or expensive reconciliation    | Review compaction and data model              |
| High compaction load     | Large amounts of data being rewritten            | Review compaction strategy and write workload |
| High disk usage          | Compaction temporarily needs additional space    | Monitor free disk capacity                    |
| Tombstone warnings       | Reads encounter too many deletion markers        | Review deletes and retention design           |
| Large partitions         | Too much data is grouped under one partition key | Revisit partition design                      |
| Hot partitions           | Too many requests target the same partition      | Improve partition-key distribution            |
| High write amplification | Data is rewritten during compaction              | Review compaction strategy and workload       |

### 13.1 Large Partitions

Suppose you use:

```text
Partition Key: campaign_id
```

A very popular campaign might receive hundreds of millions of events.

All those events may accumulate in one logical partition.

This can create a large partition and operational problems.

One possible design is to use a time bucket:

```text
Partition Key:
    (campaign_id, date_bucket)
```

For example:

```text
campaign_501_2026-11-14
campaign_501_2026-11-15
campaign_501_2026-11-16
```

This spreads the data across multiple partitions.

The correct partition size depends on the workload and database version. There is no universal partition-size target that works for every application.

### 13.2 Hot Partitions

A hot partition occurs when a disproportionate amount of traffic targets one partition.

For example:

```text
Partition A -> 90% of requests
Partition B -> 5% of requests
Partition C -> 5% of requests
```

Even if the cluster has many nodes, one partition can become a bottleneck.

Good partition-key design is therefore essential.

---

## 14. Cassandra vs PostgreSQL: Internal Storage Comparison

You have studied PostgreSQL indexing and database internals earlier.

Compare the high-level storage approaches.

| Feature                | PostgreSQL                                  | Cassandra                                              |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Main storage model     | Heap tables and indexes                     | Memtables and SSTables                                 |
| Common index structure | B-Tree, plus other index types              | SSTable indexes, Bloom filters, and related structures |
| Write handling         | WAL plus data-page changes                  | Commit log plus memtable                               |
| Updates                | New MVCC tuple versions and page management | New mutations and version reconciliation               |
| Deletes                | MVCC deletion marking and later cleanup     | Tombstones                                             |
| Background cleanup     | VACUUM and related maintenance              | Compaction                                             |
| Storage architecture   | Primarily page-oriented                     | LSM-oriented                                           |
| Query model            | Flexible SQL                                | Query patterns constrained by data model               |

### PostgreSQL write path — simplified

```text
Application
     |
     v
Transaction
     |
     v
WAL
     |
     v
Shared Buffers
     |
     v
Data Pages
     |
     v
Background Checkpoint
```

### Cassandra write path — simplified

```text
Application
     |
     v
Coordinator
     |
     v
Commit Log
     |
     v
Memtable
     |
     v
SSTable
     |
     v
Compaction
```

Both databases use logs and background storage maintenance, but their storage-engine designs are different.

Do not confuse PostgreSQL's WAL with Cassandra's commit log merely because both contribute to durability.

Their responsibilities and implementations are not identical.

---

## 15. Important Interview Questions

### Q1. What is an LSM Tree?

An LSM Tree is a storage architecture that buffers writes in memory and periodically flushes sorted data structures to disk. It merges these structures later through compaction.

### Q2. Why does Cassandra use an LSM-based architecture?

It supports efficient write-heavy workloads by buffering mutations in memory and using append-oriented logging and sorted disk writes.

### Q3. What is a commit log?

A disk-based append-only log used to recover mutations that may not yet have been flushed to SSTables.

### Q4. What is a memtable?

An in-memory sorted data structure that holds recent writes and is eventually flushed to an SSTable.

### Q5. What is an SSTable?

An immutable, sorted disk file created when a memtable is flushed.

### Q6. What happens if Cassandra crashes before a memtable is flushed?

The memtable is lost, but Cassandra can replay relevant commit-log records during recovery to reconstruct the mutations.

### Q7. Why are SSTables immutable?

Immutability simplifies disk storage and allows Cassandra to create new sorted files rather than repeatedly modifying existing ones.

### Q8. What is compaction?

A background process that merges SSTables, reconciles versions, and processes obsolete data and deletion markers when safe.

### Q9. What is a tombstone?

A deletion marker that records that data has been deleted. It prevents older values from reappearing during reconciliation.

### Q10. Why can too many SSTables hurt read performance?

Cassandra may need to inspect multiple SSTables and reconcile their data to produce a result.

### Q11. What is a Bloom filter?

A probabilistic data structure that helps determine whether an SSTable definitely does not contain a particular partition.

### Q12. What is write amplification?

The phenomenon where a logical write causes additional physical writes, such as during compaction.

### Q13. What is the difference between STCS and LCS?

STCS groups similarly sized SSTables for compaction. LCS organizes SSTables into levels to improve read predictability, generally at the cost of more compaction work.

### Q14. Why is Cassandra suitable for time-series data?

It can distribute large write volumes and organize time-oriented records using partition keys, clustering columns, and appropriate compaction strategies.

### Q15. Does Cassandra wait for compaction before acknowledging a write?

No. Compaction is a background storage-maintenance process and is not normally part of the client write acknowledgement path.

---

## 16. Practical Exercise

Consider a campaign platform that receives millions of events.

Each event contains:

```javascript
{
    userId: 101,
    campaignId: 501,
    eventType: "click",
    eventTime: "2026-11-14T10:30:00Z"
}
```

Answer the following questions.

### Exercise 1: Write path

Explain what happens when the application inserts this event into Cassandra.

Your answer should include:

- Coordinator.
- Replicas.
- Commit log.
- Memtable.
- Acknowledgement.
- SSTable flush.

### Exercise 2: Crash recovery

Suppose Cassandra crashes after a write is acknowledged but before the memtable is flushed.

Explain how Cassandra recovers the mutation.

### Exercise 3: Updates

Suppose a record is updated three times.

Why might multiple SSTables contain different versions of the same logical record?

### Exercise 4: Deletes

Why does Cassandra use tombstones instead of immediately removing data from every SSTable?

### Exercise 5: Compaction

Explain why compaction is necessary and identify two potential resource costs.

### Exercise 6: Partition design

Suppose one campaign receives 100 million events.

Why might storing all events under one campaign partition be a problem?

Suggest a partition-key design that includes a time bucket.

---

## 17. Chapter Summary

| Component    | Responsibility                                            |
| ------------ | --------------------------------------------------------- |
| LSM Tree     | Organizes writes and reads across memory and disk         |
| Commit Log   | Durability and crash recovery                             |
| Memtable     | Stores recent writes in memory                            |
| SSTable      | Stores immutable sorted data on disk                      |
| Bloom Filter | Helps avoid unnecessary SSTable lookups                   |
| Read Path    | Reads and reconciles relevant data                        |
| Write Path   | Processes mutations through replicas, logs, and memtables |
| Compaction   | Merges SSTables and processes obsolete data               |
| Tombstone    | Records deletion information                              |
| STCS         | Compacts similarly sized SSTables                         |
| LCS          | Organizes SSTables into levels                            |
| TWCS         | Organizes compaction around time windows                  |

### The complete mental model

Remember this sequence:

```text
WRITE
  |
  v
Commit Log
  |
  v
Memtable
  |
  v
SSTable
  |
  v
Compaction
```

And for reads:

```text
READ
  |
  v
Memtable
  |
  v
Relevant SSTables
  |
  v
Reconciliation
  |
  v
Result
```

The most important concepts to retain:

1. Cassandra uses an LSM-oriented storage architecture.
2. The commit log protects mutations against data loss.
3. Memtables hold recent writes in memory.
4. Flushing produces immutable SSTables.
5. Reads may involve multiple SSTables.
6. Compaction merges SSTables and handles obsolete data.
7. Tombstones represent deletions.
8. Write-heavy performance comes with read and compaction tradeoffs.
9. Good partition-key design remains essential even with an efficient storage engine.
