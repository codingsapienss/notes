---
sidebar_label: Search Database Architecture
sidebar_position: 1
---

# Search Database Architecture

## 1. From Search Queries to Search Engine Internals

Lets understand what happens internally when an application sends a document to Elasticsearch or executes a search query.

Consider an e-commerce application:

- Node.js + Express handles API requests.
- MongoDB stores products as the primary source of truth.
- Elasticsearch maintains a search-optimized copy of product data.
- Users search for products by name, category, brand, description, and other attributes.

Suppose the application has 10 million products.

A single Elasticsearch server may not have sufficient CPU, memory, disk capacity, or throughput to handle the workload efficiently.

Elasticsearch solves this by distributing indexes across multiple machines.

To understand this architecture, we need to understand:

1. Clusters and nodes.
2. Indexes and shards.
3. Primary and replica shards.
4. Document routing.
5. Distributed indexing.
6. Distributed search.
7. Lucene segments.
8. Refresh, flush, and translog.
9. Replication and recovery.
10. Production architecture.

---

# 2. Elasticsearch Cluster Architecture

## 2.1 What is an Elasticsearch cluster?

An Elasticsearch cluster is a collection of one or more nodes that work together to store, index, and search data.

A cluster provides:

- Distributed storage.
- Distributed search.
- Replication.
- Fault tolerance.
- Horizontal scaling.
- Load distribution.

Example:

```text
                 Elasticsearch Cluster
                -----------------------

                  Node 1
                /        \
               /          \
          Node 2          Node 3
```

Each node is an individual Elasticsearch server process.

Nodes communicate with each other over the network and coordinate cluster operations.

A cluster can run on:

- One physical server with multiple node processes.
- Multiple virtual machines.
- Multiple cloud instances.
- Kubernetes containers.
- Managed Elasticsearch services.

**Important:** A cluster is a logical group of nodes, not necessarily a group of physical machines. However, production deployments generally distribute nodes across separate machines or failure zones.

## 2.2 What is a node?

A node is an individual running instance of Elasticsearch.

Each node has:

- Its own process.
- Its own JVM.
- Its own heap.
- Its own CPU and memory allocation.
- Its own local storage.
- Its own network identity.

Example:

```text
Node 1
  ├── Elasticsearch process
  ├── JVM Heap
  ├── CPU
  ├── RAM
  ├── Disk
  └── Network

Node 2
  ├── Elasticsearch process
  ├── JVM Heap
  ├── CPU
  ├── RAM
  ├── Disk
  └── Network
```

Nodes communicate to distribute data and execute operations.

For example, when a user searches for a product:

1. A request reaches one Elasticsearch node.
2. That node coordinates the search.
3. It sends requests to relevant shards on other nodes.
4. Those nodes execute their local searches.
5. Results return to the coordinating node.
6. The coordinating node combines and returns the final response.

## 2.3 Types of Elasticsearch nodes

Elasticsearch nodes can have different roles.

The most important roles are:

| Node role        | Responsibility                                           |
| ---------------- | -------------------------------------------------------- |
| Master-eligible  | Can participate in cluster-manager election              |
| Data             | Stores shards and performs indexing/search operations    |
| Ingest           | Performs document preprocessing through ingest pipelines |
| Coordinating     | Receives requests and coordinates distributed operations |
| Machine Learning | Runs supported machine-learning workloads                |
| Transform        | Runs transform-related workloads where configured        |

The available roles depend on the Elasticsearch version and distribution.

### A. Master-eligible nodes

These nodes are eligible to become the elected cluster manager.

Older Elasticsearch documentation commonly calls this the **master node**.

Newer terminology uses **cluster manager**.

The elected cluster manager handles cluster-wide coordination, including:

- Maintaining cluster state.
- Managing index metadata.
- Tracking node membership.
- Coordinating shard allocation.
- Managing cluster-level configuration changes.
- Coordinating certain recovery and rebalancing decisions.

Example:

```text
             Cluster Manager
                    |
          ---------------------
          |         |         |
        Node 1    Node 2    Node 3
```

A cluster normally uses multiple master-eligible nodes to maintain availability during failures.

A master-eligible node does not necessarily store application data.

### B. Data nodes

Data nodes store shards and perform operations on them.

Responsibilities include:

- Storing indexed documents.
- Executing search queries.
- Performing indexing operations.
- Managing Lucene segments.
- Running aggregations.
- Performing shard recovery.

Example:

```text
             Data Node 1
          -----------------
          Product Shard 0
          Product Shard 1
          User Shard 0
```

Data nodes usually consume significant:

- RAM.
- CPU.
- Disk I/O.
- Network bandwidth.

They are central to search and indexing performance.

### C. Ingest nodes

Ingest nodes process incoming documents before indexing.

They can execute ingest pipelines containing processors such as:

- Set.
- Remove.
- Rename.
- Convert.
- Date.
- Grok.
- Script.

Example incoming document:

```json
{
  "product_name": "   Wireless Headphones   ",
  "price": "1999"
}
```

An ingest pipeline could:

1. Trim whitespace.
2. Convert price into a numeric value.
3. Add an ingestion timestamp.
4. Remove unnecessary fields.

Processed document:

```json
{
  "product_name": "Wireless Headphones",
  "price": 1999,
  "ingested_at": "2026-11-14T10:00:00Z"
}
```

Ingest processing can be performed on nodes with the ingest role.

### D. Coordinating nodes

Every Elasticsearch node can act as a coordinating node.

A coordinating node:

- Receives client requests.
- Determines which shards need to participate.
- Sends requests to the appropriate shard copies.
- Collects responses.
- Merges results.
- Returns the final response.

A dedicated coordinating-only node has no other roles.

Example:

```text
              Application
                   |
                   v
          Coordinating Node
                   |
          -------------------
          |        |        |
          v        v        v
        Node 1   Node 2   Node 3
```

Dedicated coordinating nodes can help separate request coordination from data storage and indexing workloads in larger clusters.

However, adding dedicated coordinating nodes to every small deployment is unnecessary.

---

# 3. Indexes, Shards, Primary Shards and Replica Shards

## 3.1 What is an index?

An index is a logical collection of documents in Elasticsearch.

It is conceptually similar to a table in a relational database or a collection in MongoDB.

Example:

```text
Elasticsearch
   |
   ├── products
   ├── users
   ├── orders
   └── campaigns
```

A product document:

```json
{
  "product_id": "P101",
  "name": "Wireless Headphones",
  "brand": "Sony",
  "price": 1999,
  "category": "Electronics"
}
```

This document belongs to the `products` index.

An index can contain millions or billions of documents.

Elasticsearch divides an index into smaller units called shards.

## 3.2 What is a shard?

A shard is a distributed unit of an Elasticsearch index.

Technically, an Elasticsearch shard is a Lucene index.

A shard stores a subset of the documents belonging to its Elasticsearch index.

Suppose we have an index containing 12 million products.

Instead of keeping all products in one shard, Elasticsearch can distribute them across multiple shards.

```text
                 products index
                       |
          ---------------------------
          |            |            |
       Shard 0      Shard 1      Shard 2
       4 million    4 million    4 million
       documents    documents    documents
```

Each shard can be allocated to a different data node.

This allows Elasticsearch to distribute:

- Storage.
- Indexing workload.
- Search workload.

**Important:** A shard is not a separate Elasticsearch cluster. It is a distributed storage and processing unit inside a cluster.

## 3.3 Why do we need shards?

Suppose we store 100 million documents.

If the entire index exists on one machine, that machine becomes responsible for:

- Storing all documents.
- Building all search indexes.
- Executing all queries.
- Processing all aggregations.

This can create a bottleneck.

With sharding:

```text
                    100 Million Documents
                            |
                  ---------------------
                  |         |         |
                  v         v         v
               Shard 0   Shard 1   Shard 2
               33.3M     33.3M     33.4M
```

Different nodes can process different shards concurrently.

Benefits:

1. Horizontal distribution of data.
2. Parallel search execution.
3. Distribution of indexing workload.
4. Ability to store indexes larger than one node's practical capacity.

## 3.4 Primary shards

A primary shard is the main shard copy responsible for accepting indexing operations for its shard.

Every Elasticsearch index has a configured number of primary shards.

Example:

```text
products index

Primary Shard 0
Primary Shard 1
Primary Shard 2
```

The number of primary shards is configured when the index is created.

For standard Elasticsearch indexes, the primary shard count cannot simply be changed dynamically after creation.

Changing it generally requires an operation such as:

- Reindexing into a new index.
- Splitting an index under supported conditions.
- Shrinking an index under supported conditions.

Choose the initial primary shard count carefully.

## 3.5 Replica shards

A replica shard is a copy of a primary shard.

Replicas provide:

- High availability.
- Fault tolerance.
- Additional search capacity.

Suppose an index has three primary shards and one replica per primary.

```text
                 products index

             Primary       Replica
             -------       -------
             P0            R0
             P1            R1
             P2            R2
```

There are six shard copies in total:

- Three primary shards.
- Three replica shards.

If the node containing P0 fails, Elasticsearch can promote an available replica copy of that shard to primary.

The exact recovery and promotion behavior depends on cluster state and failure conditions.

## 3.6 Primary vs replica shards

| Feature                             | Primary shard                | Replica shard                  |
| ----------------------------------- | ---------------------------- | ------------------------------ |
| Stores documents                    | Yes                          | Yes                            |
| Accepts the initial write operation | Yes                          | Receives replicated operations |
| Serves searches                     | Yes                          | Yes                            |
| Provides redundancy                 | No additional copy by itself | Yes                            |
| Can be promoted                     | Already primary              | Can become primary             |
| Uses storage                        | Yes                          | Yes                            |

**Important:** Replica shards are not backups.

If someone accidentally deletes documents or corrupts the logical data, the change can propagate to replicas.

A separate backup strategy using snapshots is still necessary.

## 3.7 Shard allocation across nodes

Consider a cluster with three data nodes.

An index has:

- Three primary shards.
- One replica per primary.

A possible allocation:

```text
                Elasticsearch Cluster

       Node 1          Node 2          Node 3
     ----------      ----------      ----------
       P0              P1              P2
       R2              R0              R1
```

Elasticsearch avoids placing a primary shard and its replica copy on the same node.

Otherwise, a single node failure could remove both copies.

**Important:** Actual placement depends on shard allocation rules, available capacity, awareness settings, and cluster state.

---

# 4. Document Routing

Document routing determines which primary shard stores a document.

This is a critical concept because Elasticsearch does not normally broadcast every indexing request to every primary shard.

## 4.1 Default document routing

When indexing a document, Elasticsearch needs to determine its destination shard.

By default, it uses a hash-based routing calculation involving the document's routing value.

Conceptually:

```text
shard_number = hash(routing_value) % number_of_primary_shards
```

By default, the routing value is the document ID.

Example:

```json
{
  "product_id": "P101",
  "name": "Wireless Headphones"
}
```

If the document ID is `P101`, Elasticsearch calculates its shard using the default routing behavior.

Suppose the index has three primary shards.

```text
hash(P101) % 3 = 1
```

The document is routed to primary shard 1.

The numerical result above is illustrative, not an actual hash calculation.

## 4.2 Why routing matters

Suppose we have:

```text
products index
    |
    ├── Primary Shard 0
    ├── Primary Shard 1
    └── Primary Shard 2
```

When inserting a document:

```text
POST /products/_doc/P101
```

Elasticsearch calculates the destination shard and sends the operation there.

This avoids sending the write to every primary shard.

## 4.3 Custom routing

Elasticsearch also supports custom routing.

Instead of routing using the document ID, the application can provide another routing value.

Example:

```text
POST /orders/_doc/ORD101?routing=USER101
```

Now the routing value is `USER101`.

Conceptually:

```text
shard_number = hash("USER101") % number_of_primary_shards
```

Why might we do this?

Suppose an application frequently searches orders belonging to a particular user.

If all orders belonging to a user use the same routing value, they can be placed on the same shard.

Example:

```text
USER101
  |
  ├── ORD001
  ├── ORD002
  ├── ORD003
  └── ORD004
```

Searching with:

```text
GET /orders/_search?routing=USER101
```

can restrict the search to the shard selected by that routing value.

This can reduce the number of shards involved in a search.

## 4.4 Custom routing tradeoffs

Custom routing introduces risks.

### Risk 1: Uneven distribution

Suppose one user has 10 million orders while other users have only a few.

If all orders for that user go to one shard, that shard can become a hotspot.

```text
Shard 0: 1 million documents
Shard 1: 1 million documents
Shard 2: 10 million documents
```

### Risk 2: Routing must remain consistent

If a document is indexed using one routing value but later searched using another, the search may not find it.

The application must consistently use the correct routing value.

### Risk 3: Routing does not eliminate all distributed work

A search that does not specify routing may still need to search multiple shards.

**Rule:** Use custom routing only when the access pattern justifies it and the distribution remains acceptable.

---

# 5. Distributed Indexing Architecture

Now let's understand how Elasticsearch processes an indexing request.

Suppose a Node.js application sends this request:

```http
POST /products/_doc/P101
Content-Type: application/json
```

```json
{
  "name": "Wireless Headphones",
  "brand": "Sony",
  "price": 1999
}
```

Assume:

- The index has three primary shards.
- Each primary has one replica.
- The application sends the request to Node 1.

## 5.1 Indexing request lifecycle

```text
             Node.js Application
                      |
                      v
              Coordinating Node
                      |
                      v
              Calculate Routing
                      |
                      v
               Primary Shard P1
                      |
              -------------------
              |                 |
              v                 v
          Local Indexing    Replicate Operation
              |                 |
              |                 v
              |             Replica R1
              |                 |
              -------------------
                      |
                      v
               Return Response
```

Let's break it down.

### Step 1: Application sends request

The application sends the indexing request to any reachable Elasticsearch node.

That node becomes the coordinating node for the request.

### Step 2: Routing calculation

The coordinating node determines which primary shard should receive the document.

For example:

```text
Document ID: P101
Primary shard: P1
```

### Step 3: Forward to primary shard

The coordinating node forwards the indexing operation to the selected primary shard.

### Step 4: Primary shard processes the operation

The primary shard:

- Validates the operation.
- Processes the document.
- Updates the local Lucene indexing structures.
- Records the operation in the translog according to the configured durability behavior.
- Coordinates replication.

The precise internal ordering and acknowledgement conditions are implementation-dependent.

### Step 5: Replication

The primary shard forwards the operation to its replica copies.

For example:

```text
Primary P1
    |
    v
Replica R1
```

The replica applies the replicated operation.

### Step 6: Acknowledgement

Once the required conditions are met, the operation response is returned to the coordinating node and then to the application.

The conditions depend on factors such as:

- Active shard requirements.
- Translog durability configuration.
- Replication success.
- Cluster state.
- Elasticsearch version and implementation details.

Do not assume that every indexing response means every configured replica is necessarily available.

## 5.2 `wait_for_active_shards`

Elasticsearch supports the `wait_for_active_shards` parameter.

It controls how many active shard copies must be available before the indexing operation proceeds.

For example:

```http
PUT /products/_doc/P101?wait_for_active_shards=all
```

This asks Elasticsearch to wait until all configured shard copies are active before proceeding.

It is an availability requirement, not a complete guarantee that every copy will remain healthy or that a future failure cannot cause data loss.

## 5.3 Indexing acknowledgement vs search visibility

This is one of the most important distinctions in Elasticsearch.

A successful indexing response does not necessarily mean the document is immediately searchable.

There are two different concepts:

| Concept               | Meaning                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| Write acknowledgement | The indexing operation was accepted and met the applicable write conditions |
| Search visibility     | The document has become visible to search operations                        |

Example:

```text
10:00:00.000  Document indexing starts
10:00:00.020  Indexing response returned
10:00:00.021  Search request executes
10:00:00.050  Refresh makes the document searchable
```

The search at `10:00:00.021` may not find the document.

This is because Elasticsearch is a near-real-time search engine.

We will examine refresh shortly.

---

# 6. Translog, Refresh and Flush

These three concepts are fundamental to understanding Elasticsearch indexing internals.

They are related, but they are not interchangeable.

## 6.1 What is the translog?

Translog means transaction log.

Elasticsearch maintains a transaction log for shard operations.

Its purpose is to help recover operations that have not yet been safely incorporated into a Lucene commit.

Why is this needed?

Suppose a document is indexed.

The operation has been processed, but the latest Lucene commit does not yet contain it.

Now the machine crashes.

Without a recovery mechanism, the operation could be lost.

The translog helps Elasticsearch replay eligible operations during recovery.

Simplified flow:

```text
          Incoming Document
                  |
                  v
             Primary Shard
                  |
          -------------------
          |                 |
          v                 v
       Translog       Lucene Indexing
          |                 |
          |                 v
          |             Segments
          |                 |
          -------------------
                  |
                  v
             Lucene Commit
```

The diagram is conceptual. Actual internal write ordering, buffering, and durability depend on Elasticsearch implementation and settings.

## 6.2 Translog durability

Elasticsearch supports translog durability settings.

The two commonly discussed modes are:

| Mode      | Behavior                                                                                     |
| --------- | -------------------------------------------------------------------------------------------- |
| `request` | Translog data is synchronized to durable storage as part of the request's durability process |
| `async`   | Synchronization happens periodically rather than being required for each indexing request    |

Example setting:

```json
PUT /products/_settings
{
  "index.translog.durability": "request"
}
```

With `request` durability, Elasticsearch provides stronger protection against losing recently acknowledged operations after a crash, subject to the actual storage system and failure scenario.

With `async`, recent operations may be lost if a failure occurs before the next synchronization.

**Important:** Translog durability and replica acknowledgement are separate concepts.

Replication does not automatically mean every replica has synchronously persisted every operation to durable media.

## 6.3 What is refresh?

Refresh makes recently indexed documents available for search.

Elasticsearch uses Lucene internally.

When documents are indexed, they are processed through in-memory indexing structures and eventually become part of searchable Lucene segments.

A refresh opens a new searchable view of the recently indexed data.

Simplified:

```text
Document Indexed
       |
       v
In-memory Indexing Structures
       |
       v
     Refresh
       |
       v
New Searchable Segment View
       |
       v
Document Available to Search
```

Refresh is primarily about search visibility.

It is not equivalent to a durable Lucene commit.

## 6.4 Refresh interval

Elasticsearch supports an index setting called `refresh_interval`.

Example:

```json
PUT /products/_settings
{
  "index": {
    "refresh_interval": "1s"
  }
}
```

This configures the periodic refresh interval.

The default is commonly one second for indexes that have received search requests, but actual behavior depends on version, index activity, and configuration.

A shorter refresh interval can reduce search visibility latency.

However, it can also create more small segments and increase indexing overhead.

A longer interval can improve indexing efficiency but delay search visibility.

| Short refresh interval               | Long refresh interval                 |
| ------------------------------------ | ------------------------------------- |
| Faster search visibility             | Slower search visibility              |
| More frequent refresh work           | Less frequent refresh work            |
| Can create more small segments       | Can reduce refresh overhead           |
| Potentially higher indexing overhead | Often better bulk indexing efficiency |

## 6.5 `refresh=wait_for`

Sometimes an application needs to ensure that a newly indexed document becomes searchable before it continues.

Elasticsearch provides:

```http
POST /products/_doc/P101?refresh=wait_for
```

This waits for a refresh that makes the operation visible to search.

It does not necessarily force an immediate refresh.

It waits for the relevant refresh event.

Compare:

| Parameter          | Behavior                                                |
| ------------------ | ------------------------------------------------------- |
| `refresh=false`    | Does not request an immediate refresh                   |
| `refresh=true`     | Forces a refresh for the affected shard                 |
| `refresh=wait_for` | Waits for a refresh that makes the operation searchable |

Avoid using `refresh=true` on every write in high-throughput systems. It can significantly reduce indexing performance.

## 6.6 What is flush?

Flush is different from refresh.

A flush creates a Lucene commit and manages the translog lifecycle.

Conceptually:

```text
Indexed Operations
        |
        v
   Translog + Lucene
        |
        v
       Flush
        |
        v
   Lucene Commit
        |
        v
Translog Generation Management
```

A Lucene commit provides a durable index commit point.

Elasticsearch manages flushing automatically.

You generally should not manually flush after every indexing request.

## 6.7 Refresh vs flush vs translog

| Feature                             | Translog                              | Refresh                                     | Flush                                 |
| ----------------------------------- | ------------------------------------- | ------------------------------------------- | ------------------------------------- |
| Main purpose                        | Recovery and durability of operations | Search visibility                           | Lucene commit and translog management |
| Makes documents searchable?         | No, not by itself                     | Yes                                         | Not its primary purpose               |
| Creates searchable Lucene segments? | No, not by itself                     | Opens a new searchable view of indexed data | Works with Lucene commit lifecycle    |
| Important for crash recovery?       | Yes                                   | Not its primary purpose                     | Yes                                   |
| Happens automatically?              | Maintained automatically              | Yes, periodically or on demand              | Yes, automatically                    |

**Interview point:** Refresh is about making documents searchable. Flush is about committing Lucene index state and managing the translog. The translog helps recover operations that have not yet been safely committed.

---

# 7. Near-Real-Time Search

Elasticsearch is generally described as a near-real-time search engine.

It does not guarantee that every successful write is immediately visible to a subsequent search.

Consider:

```text
10:00:00.000
Application indexes product P101

10:00:00.010
Indexing response returned

10:00:00.020
Application searches for P101

10:00:00.050
Refresh occurs

10:00:00.060
P101 becomes visible to search
```

The indexing operation may have succeeded before the document becomes searchable.

This delay is called refresh latency or search visibility delay.

## 7.1 Why not refresh after every write?

Refreshing frequently has a cost.

Lucene segments are created as part of indexing and refresh activity.

Frequent refreshes can produce many small segments.

Those segments increase overhead for:

- Searching.
- Segment management.
- Merging.
- Disk I/O.
- Resource consumption.

Therefore, Elasticsearch balances indexing throughput and search freshness.

## 7.2 Practical example

Suppose a product is created through an API.

```javascript
const response = await elasticsearch.index({
  index: "products",
  id: "P101",
  document: {
    name: "Wireless Headphones",
    price: 1999,
  },
});
```

The response can be successful even if an immediate search does not return the document.

If the next application operation must search for that document immediately, the application can use an appropriate refresh strategy, such as `refresh: "wait_for"`.

Example:

```javascript
await elasticsearch.index({
  index: "products",
  id: "P101",
  document: {
    name: "Wireless Headphones",
    price: 1999,
  },
  refresh: "wait_for",
});
```

Use this selectively.

For normal product catalog ingestion, waiting for every individual write can unnecessarily reduce throughput.

---

# 8. Lucene Segment Architecture

To understand Elasticsearch performance, you must understand Lucene segments.

Elasticsearch is built on top of Apache Lucene.

Lucene is a search library that provides:

- Inverted indexes.
- Document storage structures.
- Term dictionaries.
- Postings lists.
- Stored fields.
- Segment management.
- Search execution primitives.

## 8.1 What is a Lucene segment?

A Lucene segment is an independently searchable unit of an index.

A shard contains multiple segments.

Example:

```text
             Elasticsearch Index
                      |
                      v
                  Shard 0
                      |
          ---------------------------
          |            |            |
          v            v            v
       Segment 1    Segment 2    Segment 3
```

A shard is not the same as a segment.

- An Elasticsearch index contains shards.
- A shard contains Lucene segments.

## 8.2 Why does Lucene use segments?

Instead of rewriting the entire index every time a document changes, Lucene writes new indexed data into new segments.

Segments are immutable.

Once written, a segment is not modified in place.

When new documents are indexed, additional segment data is created.

Example:

```text
Initially:

Shard 0
  └── Segment 1
```

After more indexing:

```text
Shard 0
  ├── Segment 1
  ├── Segment 2
  └── Segment 3
```

After additional indexing:

```text
Shard 0
  ├── Segment 1
  ├── Segment 2
  ├── Segment 3
  ├── Segment 4
  └── Segment 5
```

This architecture makes incremental indexing practical.

## 8.3 What happens when a document is updated?

Lucene segments are immutable.

Therefore, an update is not normally an in-place modification of an existing segment record.

Conceptually:

1. The old document version is marked as deleted.
2. A new document version is indexed.
3. A future segment merge can remove the obsolete version physically.

Example:

```text
Before update:

Segment 1
  ├── Product P101: price 1999
  └── Product P102: price 2999

Update P101:

Segment 1
  ├── Product P101: price 1999 [Deleted]
  └── Product P102: price 2999

Segment 2
  └── Product P101: price 1799
```

The old version may remain physically present until segment merging reclaims its space.

## 8.4 Segment merging

As more documents are indexed, the number of segments can grow.

Having too many segments can increase search and resource overhead.

Lucene merges smaller segments into larger segments in the background.

Example:

```text
Before merge:

Segment 1
Segment 2
Segment 3
Segment 4

        |
        v

Segment 5
```

The new segment contains the live documents from the merged segments.

Deleted documents can be discarded during merging.

Benefits:

- Reduces the number of segments.
- Reclaims space occupied by deleted documents.
- Improves segment organization.

However, merging consumes:

- CPU.
- Disk I/O.
- Temporary disk space.
- Memory and other resources.

Heavy indexing can therefore create merge pressure.

## 8.5 Segment-related performance problems

Suppose a shard has thousands of small segments.

Potential consequences:

- More segment-level search work.
- Increased metadata overhead.
- Greater merge pressure.
- Higher disk I/O.
- Increased resource consumption.

Frequent manual refreshes can contribute to excessive small-segment creation.

**Important:** Segment merging is automatic. Applications generally should not try to manually manage Lucene segments.

---

# 9. Distributed Search Architecture

Now consider the opposite operation: searching documents.

Suppose an index contains three primary shards and three replicas.

A user sends:

```http
GET /products/_search
```

```json
{
  "query": {
    "match": {
      "name": "wireless headphones"
    }
  },
  "size": 10
}
```

Elasticsearch must search the relevant shard copies and combine the results.

## 9.1 Distributed search overview

```text
                  Node.js Application
                           |
                           v
                  Coordinating Node
                           |
              -------------------------
              |           |           |
              v           v           v
           Shard 0     Shard 1     Shard 2
              |           |           |
              v           v           v
           Search      Search      Search
              |           |           |
              -------------------------
                           |
                           v
                 Merge Search Results
                           |
                           v
                  Fetch Required Docs
                           |
                           v
                   Final Response
```

A search request can be served by primary or replica shard copies.

Elasticsearch selects available shard copies according to its routing and allocation mechanisms.

This helps distribute search traffic.

## 9.2 Two major search phases

Distributed search commonly involves two major phases:

1. Query phase.
2. Fetch phase.

### A. Query phase

The coordinating node sends the query to the relevant shard copies.

Each shard executes the query locally.

Suppose the user requests the top 10 products.

Each shard may return its local top 10 candidates, along with the information required to merge and rank the results.

Example:

```text
Shard 0:
  Product A - Score 9.8
  Product B - Score 9.2

Shard 1:
  Product C - Score 9.7
  Product D - Score 8.9

Shard 2:
  Product E - Score 9.5
  Product F - Score 9.0
```

These are local candidates, not necessarily the final global ranking.

### B. Coordinating node merges results

The coordinating node receives the shard responses.

It combines the candidates and determines the global top results.

Example:

```text
Combined candidates:

Product A - 9.8
Product C - 9.7
Product E - 9.5
Product B - 9.2
Product F - 9.0
Product D - 8.9
```

It then selects the requested top 10 results.

The exact amount of candidate data and processing depends on query type, sorting, pagination, and other search features.

### C. Fetch phase

After identifying which documents should be returned, Elasticsearch retrieves the required document fields from the relevant shard copies.

The coordinating node collects these documents and builds the final response.

Example:

```json
{
  "hits": {
    "total": {
      "value": 3,
      "relation": "eq"
    },
    "hits": [
      {
        "_id": "P101",
        "_score": 9.8,
        "_source": {
          "name": "Wireless Headphones",
          "price": 1999
        }
      }
    ]
  }
}
```

## 9.3 Query phase vs fetch phase

| Query phase                           | Fetch phase                      |
| ------------------------------------- | -------------------------------- |
| Executes the search on shards         | Retrieves selected documents     |
| Identifies matching candidates        | Loads the required document data |
| Computes local scores and sort values | Returns document fields          |
| Helps identify global top results     | Builds final response            |

**Interview point:** Query phase determines which documents should be returned. Fetch phase retrieves the selected documents.

---

# 10. Distributed Search and Pagination

Pagination becomes more expensive when the application searches across multiple shards.

## 10.1 `from` and `size`

Example:

```json
{
  "from": 0,
  "size": 10
}
```

This requests the first 10 results.

The next page:

```json
{
  "from": 10,
  "size": 10
}
```

The third page:

```json
{
  "from": 20,
  "size": 10
}
```

For a shallow result page, this is usually straightforward.

However, consider:

```json
{
  "from": 100000,
  "size": 10
}
```

The coordinating node needs to obtain enough candidates from each participating shard to determine the global results.

Each shard may need to return up to:

```text
from + size
```

candidates.

This can become expensive.

## 10.2 Why deep pagination is expensive

Suppose:

```text
from = 100000
size = 10
```

The application wants records 100001 through 100010.

Elasticsearch cannot simply jump directly to the 100001st globally sorted result without performing the necessary distributed collection and sorting work.

The amount of work and data transfer can become large.

## 10.3 `search_after`

For deep pagination, Elasticsearch supports `search_after`.

Instead of specifying an offset, the application provides the sort values of the last document from the previous page.

Example:

```json
{
  "size": 10,
  "sort": [
    {
      "price": "asc"
    },
    {
      "product_id": "asc"
    }
  ]
}
```

Suppose the last result contains:

```json
{
  "sort": [1999, "P101"]
}
```

The next request can use:

```json
{
  "size": 10,
  "sort": [
    {
      "price": "asc"
    },
    {
      "product_id": "asc"
    }
  ],
  "search_after": [1999, "P101"]
}
```

The sort must be deterministic. Include a suitable unique tie-breaker.

## 10.4 Point in Time (PIT)

A Point in Time keeps a consistent view of an index for a series of search requests.

Why is this useful?

Suppose a user is navigating through pages while documents are being added or updated.

Without a stable search view, results can shift between requests.

PIT helps maintain a consistent view while using `search_after`.

Typical flow:

```text
Open PIT
   |
   v
Search First Page
   |
   v
Use search_after
   |
   v
Search Next Page
   |
   v
Continue Pagination
   |
   v
Close PIT
```

PIT contexts consume resources, so they should be closed when no longer needed and configured with sensible lifetimes.

---

# 11. Replication and Consistency

Replication means maintaining multiple copies of shard data.

Suppose:

```text
Primary P0
   |
   v
Replica R0
```

The primary shard receives an indexing operation and coordinates its replication to the replica.

## 11.1 Why does Elasticsearch use replicas?

Replicas provide two major benefits.

### Benefit 1: Availability

If a node containing a primary shard fails, an eligible replica can be promoted.

Example:

```text
Before failure:

Node 1: P0
Node 2: R0
Node 3: P1

Node 1 fails.

After recovery:

Node 2: P0 (promoted)
Node 3: P1
```

This can help keep the index available.

### Benefit 2: Search throughput

Replica shards can serve search requests.

Example:

```text
                Search Traffic
                      |
          -------------------------
          |                       |
          v                       v
       Primary P0              Replica R0
```

More replica copies can provide more capacity for search workloads, assuming the cluster has enough resources.

## 11.2 Replication does not mean a free performance improvement

Replicas require:

- Additional disk space.
- Additional indexing work.
- Network communication.
- Recovery resources.
- More shard management.

Increasing replicas can improve search availability and throughput, but it also increases resource consumption.

## 11.3 Are Elasticsearch replicas strongly consistent?

Do not assume that every replica behaves like a perfectly synchronous database replica under every failure scenario.

Elasticsearch coordinates writes through the primary shard and uses replication mechanisms, sequence numbers, primary terms, and recovery processes to maintain shard-copy consistency.

However, the behavior of acknowledged writes under failures depends on:

- Replication state.
- Active shard requirements.
- Translog durability.
- Failure timing.
- Recovery and promotion behavior.
- Elasticsearch implementation and version.

The important practical point is that a successful response should not be interpreted as an unconditional guarantee against every possible data-loss scenario.

For critical data, keep the authoritative record in the primary application database and maintain a separate backup strategy.

## 11.4 Replicas are not backups

This distinction is important.

Suppose a product is accidentally deleted.

```text
Primary P0:
  Product P101 deleted

Replica R0:
  Product P101 deleted
```

The deletion is replicated.

Therefore, replicas cannot protect against logical mistakes such as:

- Accidental deletion.
- Incorrect bulk updates.
- Application bugs.
- Malicious modifications.

Use snapshots and a recovery strategy for backups.

---

# 12. Node Failure and Shard Recovery

Production systems must handle machine failures.

Suppose we have:

```text
Node 1: P0
Node 2: R0
Node 3: P1
```

Node 1 suddenly becomes unavailable.

Elasticsearch detects the failure through cluster coordination mechanisms.

If R0 is an eligible and sufficiently current copy, it can be promoted to primary.

```text
Before failure:

Node 1       Node 2       Node 3
------       ------       ------
P0           R0           P1

After failure:

Unavailable  P0           P1
```

The cluster can continue operating, subject to the remaining shard copies and cluster state.

## 12.1 Cluster health

Elasticsearch provides three main cluster health states.

<mark>Green</mark>

All primary and replica shards are assigned.

```text
P0 - Assigned
R0 - Assigned
P1 - Assigned
R1 - Assigned
```

<mark>Yellow</mark>

All primary shards are assigned, but at least one replica shard is unassigned.

```text
P0 - Assigned
R0 - Unassigned
P1 - Assigned
R1 - Assigned
```

The index can generally serve reads and writes, but redundancy is reduced.

<mark>Red</mark>

At least one primary shard is unassigned.

```text
P0 - Assigned
R0 - Assigned
P1 - Unassigned
R1 - Unassigned
```

Some data may be unavailable.

| Health | Meaning                                          |
| ------ | ------------------------------------------------ |
| Green  | All primary and replica shards assigned          |
| Yellow | All primaries assigned, some replicas unassigned |
| Red    | At least one primary shard unassigned            |

A yellow cluster is not equivalent to a healthy production cluster. It means redundancy is incomplete.

## 12.2 Shard recovery

When a node returns or a replacement node joins, Elasticsearch may recover shard data.

Recovery can involve:

- Copying data from another shard copy.
- Replaying translog operations.
- Transferring segment files.
- Rebuilding or relocating shard copies.

Example:

```text
Node 1 fails
    |
    v
Replica promoted
    |
    v
Replacement node joins
    |
    v
Shard recovery starts
    |
    v
Replica copy restored
    |
    v
Cluster returns to Green
```

Recovery consumes disk I/O, CPU, and network bandwidth.

Large shard recoveries can affect normal search and indexing performance.

## 12.3 Shard rebalancing

Elasticsearch attempts to distribute shards across available nodes according to allocation rules and cluster state.

Example:

```text
Before:

Node 1: 8 shards
Node 2: 2 shards
Node 3: 2 shards

After rebalancing:

Node 1: 4 shards
Node 2: 4 shards
Node 3: 4 shards
```

This is an illustrative distribution, not a guaranteed target.

Rebalancing helps avoid uneven resource usage.

However, excessive movement of shards can create unnecessary network and disk overhead.

---

# 13. Index Lifecycle Management

Indexes grow over time.

Consider an application collecting search logs or user activity events.

```text
events-2026-11
events-2026-12
events-2027-01
```

Keeping every event forever in one index may not be efficient.

Elasticsearch provides lifecycle management features to manage index growth.

## 13.1 Index Lifecycle Management (ILM)

ILM can automate index lifecycle operations.

Typical phases include:

| Phase  | Purpose                                 |
| ------ | --------------------------------------- |
| Hot    | Frequent writes and queries             |
| Warm   | Less frequent writes and queries        |
| Cold   | Infrequent access                       |
| Frozen | Very infrequent access, where supported |
| Delete | Remove expired data                     |

Exact lifecycle capabilities and phase behavior depend on Elasticsearch version and distribution.

## 13.2 Rollover

Rollover creates a new index when configured conditions are reached.

For example:

```text
events-000001
       |
       | Reaches rollover condition
       v
events-000002
```

Conditions can include:

- Maximum index age.
- Maximum document count.
- Maximum primary shard size.

Example conceptual configuration:

```json
{
  "conditions": {
    "max_age": "7d",
    "max_primary_shard_size": "50gb"
  }
}
```

The values are illustrative. They are not universal recommendations.

Applications generally write through an alias or data stream rather than hardcoding the physical index name.

## 13.3 Aliases

An alias is a logical name that points to one or more indexes.

Example:

```text
products
   |
   v
products-v1
```

Later:

```text
products
   |
   v
products-v2
```

The application continues using the alias:

```http
GET /products/_search
```

The physical index can change without requiring every application to update its index name.

Aliases are useful for:

- Zero-downtime migrations.
- Reindexing.
- Versioned indexes.
- Switching read and write targets.

## 13.4 Reindexing

Suppose we need to change a product mapping.

Existing index:

```text
products-v1
```

New mapping:

```text
products-v2
```

A common migration process:

1. Create the new index with the required mapping and settings.
2. Reindex existing documents.
3. Synchronize writes that occurred during migration.
4. Validate document counts and search behavior.
5. Atomically switch the alias.
6. Retain the old index temporarily for rollback.
7. Delete the old index after validation and retention requirements are satisfied.

Diagram:

```text
                Existing Application
                         |
                         v
                   products alias
                         |
                         v
                    products-v1

             Create products-v2
                         |
                         v
                    Reindex Data
                         |
                         v
                    Validate Data
                         |
                         v
                 Switch Alias Atomically
                         |
                         v
                   products alias
                         |
                         v
                    products-v2
```

A production migration must account for writes that occur while reindexing.

Simply reindexing once and switching the alias can lose updates made during the migration window unless the write synchronization strategy handles them.

## 13.5 Why do we sometimes need a new index?

Some mapping changes cannot be applied to existing indexed data in place.

For example:

- Changing a field's data type.
- Changing an analyzer for an existing field.
- Changing index-time analysis behavior.

A common solution is:

```text
Old Index
    |
    v
Create New Index
    |
    v
Reindex
    |
    v
Switch Alias
```

Not every mapping change requires reindexing. Some fields and mapping properties can be added or updated under supported rules.

---

# 14. Capacity Planning

A common mistake is to think that adding more nodes automatically makes Elasticsearch faster.

It does not.

Capacity planning requires understanding the workload.

## 14.1 Important capacity factors

| Resource         | Why it matters                                      |
| ---------------- | --------------------------------------------------- |
| CPU              | Query execution, indexing, analysis, merging        |
| RAM              | JVM heap, caches, operating system filesystem cache |
| Disk capacity    | Primary and replica shard storage                   |
| Disk I/O         | Segment reads, writes, merges, recovery             |
| Network          | Replication, distributed search, recovery           |
| Shard count      | Coordination, metadata, resource overhead           |
| Document size    | Storage and retrieval costs                         |
| Query complexity | CPU and memory requirements                         |
| Refresh interval | Search freshness and indexing overhead              |

## 14.2 Shard sizing

Suppose:

```text
Total indexed data = 300 GB
Primary shards = 6
```

Average primary shard size:

```text
300 GB / 6 = 50 GB
```

With one replica per primary:

```text
Primary storage = 300 GB
Replica storage = 300 GB

Total approximate shard storage = 600 GB
```

This excludes additional overhead such as:

- Segment merges.
- Translogs.
- Temporary recovery files.
- Operating-system and filesystem requirements.
- Other indexes and metadata.

There is no universal ideal shard size.

The correct choice depends on:

- Elasticsearch version.
- Hardware.
- Search workload.
- Indexing throughput.
- Retention.
- Recovery requirements.
- Query latency targets.

Avoid both extremes:

**Too many tiny shards**

- More cluster metadata.
- More coordination.
- Higher per-shard overhead.
- More resource consumption.

**Too few very large shards**

- Larger recovery operations.
- Potentially uneven workload.
- Reduced parallelism.
- Longer maintenance operations.

## 14.3 Heap and filesystem cache

Elasticsearch runs on the JVM.

It uses JVM heap for various internal data structures.

However, Elasticsearch performance also depends heavily on the operating system's filesystem cache.

Lucene reads many index files from disk.

Frequently accessed index files can benefit from filesystem caching.

Therefore:

- Do not allocate all machine RAM to JVM heap.
- Leave sufficient memory for the operating system and filesystem cache.
- Monitor garbage collection.
- Monitor heap pressure.

The exact heap sizing strategy should follow the supported Elasticsearch guidance for the deployed version and workload.

## 14.4 Indexing and search contention

Suppose the same cluster handles:

- Millions of indexing operations.
- Complex full-text searches.
- Large aggregations.
- Heavy segment merges.

These operations compete for resources.

Example:

```text
               Elasticsearch Data Node
                         |
             -------------------------
             |           |           |
             v           v           v
          Indexing     Searching   Merging
             |           |           |
             -------------------------
                         |
                         v
                    CPU / RAM / Disk
```

A heavy indexing workload can increase search latency.

A complex search workload can reduce indexing throughput.

Production architecture should consider workload isolation when the scale justifies it.

---

# 15. Common Performance Bottlenecks

## 15.1 Too many shards

Excessive shard counts create overhead.

Symptoms:

- High cluster-state management overhead.
- Increased memory usage.
- More coordination.
- Slow cluster operations.

Potential improvements:

- Review primary shard counts.
- Consolidate small indexes where appropriate.
- Use rollover policies.
- Delete expired indexes.

## 15.2 Expensive queries

Examples:

- Broad wildcard queries.
- Expensive regular-expression queries.
- Large aggregations.
- Deep pagination.
- Queries across many indexes.
- High-cardinality aggregation workloads.

Potential improvements:

- Use appropriate mappings.
- Filter before expensive scoring where possible.
- Limit returned fields.
- Avoid unnecessary aggregations.
- Use `search_after` for deep pagination.
- Review query execution and profiling.

## 15.3 Frequent refreshes

Very frequent refreshes can create many small segments.

Potential improvements:

- Increase the refresh interval where acceptable.
- Use bulk indexing.
- Avoid forcing refresh after every write.
- Use `refresh=wait_for` only when necessary.

## 15.4 Heavy segment merging

Merging consumes CPU and disk I/O.

Potential symptoms:

- Increased disk utilization.
- Higher indexing latency.
- Search latency spikes.
- Merge throttling.

Potential improvements:

- Avoid unnecessarily frequent refreshes.
- Use appropriate indexing batch sizes.
- Provide sufficient disk performance.
- Monitor merge activity.

## 15.5 Poor mapping design

Incorrect field mappings can create expensive queries.

Example:

A field containing a numeric price should generally be mapped as a numeric field rather than analyzed text.

Incorrect:

```json
{
  "price": {
    "type": "text"
  }
}
```

More appropriate:

```json
{
  "price": {
    "type": "integer"
  }
}
```

This allows numeric range queries and sorting with appropriate semantics.

## 15.6 Returning unnecessary fields

Suppose the application only needs:

```json
{
  "name": "Wireless Headphones",
  "price": 1999
}
```

But Elasticsearch returns a document containing 100 fields.

This increases:

- Network transfer.
- Response serialization.
- Application memory usage.
- Processing overhead.

Use source filtering when appropriate.

Example:

```json
{
  "_source": ["name", "price"],
  "query": {
    "match": {
      "name": "headphones"
    }
  }
}
```

---

# 16. Production Architecture: Node.js + MongoDB + Elasticsearch

Now let's connect Elasticsearch architecture to a real backend system.

Assume an e-commerce application.

Technology stack:

- Node.js.
- Express.js.
- MongoDB.
- Elasticsearch.
- Redis (optional).
- A queue or event-streaming system (optional).

## 16.1 Why use MongoDB and Elasticsearch together?

MongoDB is the primary application database.

Elasticsearch is the search-optimized projection.

MongoDB is responsible for:

- Creating products.
- Updating products.
- Deleting products.
- Maintaining business data.
- Handling application transactions.

Elasticsearch is responsible for:

- Full-text search.
- Relevance ranking.
- Autocomplete.
- Faceted search.
- Search-oriented filtering.
- Search aggregations.

Architecture:

```text
                  Client
                    |
                    v
              Node.js API
                    |
             ----------------
             |              |
             v              v
          MongoDB        Elasticsearch
        Source of Truth   Search Index
```

However, this simple diagram hides an important problem.

How do we keep MongoDB and Elasticsearch synchronized?

## 16.2 Why not directly write to both databases?

A naive implementation:

```javascript
await Product.create(product);

await elasticsearch.index({
  index: "products",
  id: product._id.toString(),
  document: product,
});
```

This has a consistency problem.

Consider:

```text
Step 1: MongoDB write succeeds
Step 2: Elasticsearch write fails
```

Now:

```text
MongoDB: Product exists
Elasticsearch: Product missing
```

Or the reverse can happen if the application writes to Elasticsearch first and the MongoDB operation fails.

A MongoDB transaction cannot automatically make a separate Elasticsearch operation part of the same atomic transaction.

We need a synchronization strategy.

## 16.3 Architecture using change streams or an outbox

A common architecture:

```text
                  Node.js API
                       |
                       v
                    MongoDB
                       |
                       v
             Change Stream / Outbox
                       |
                       v
                  Queue / Worker
                       |
                       v
                Elasticsearch
```

There are two commonly used approaches.

### Approach A: MongoDB Change Streams

MongoDB Change Streams allow applications to observe database changes.

Example:

```javascript
const changeStream = Product.watch();

changeStream.on("change", async (change) => {
  console.log(change.operationType);
});
```

The application can use these events to update Elasticsearch.

Typical operations include:

- Insert.
- Update.
- Replace.
- Delete.

A production implementation needs to handle:

- Resume tokens.
- Worker restarts.
- Duplicate processing.
- Retry behavior.
- Event ordering.
- Delete events.
- Failed indexing operations.

Change Streams are useful, but they do not create an atomic transaction spanning MongoDB and Elasticsearch.

### Approach B: Transactional outbox

An outbox stores the event alongside the business database change.

Conceptually:

```text
MongoDB Transaction
       |
       |-- Update Product
       |
       |-- Insert Outbox Event
       |
       v
Transaction Commits
       |
       v
Outbox Worker
       |
       v
Elasticsearch
```

The important advantage is that the business update and event creation can be committed together inside MongoDB's transaction.

A worker later reads the outbox and updates Elasticsearch.

This avoids losing the event merely because the process crashed after committing the product update.

The worker must still handle retries and duplicate delivery.

## 16.4 Example outbox event

```json
{
  "event_id": "EVT101",
  "event_type": "PRODUCT_UPDATED",
  "aggregate_id": "P101",
  "version": 5,
  "payload": {
    "name": "Wireless Headphones",
    "price": 1799
  },
  "created_at": "2026-11-14T10:00:00Z",
  "processed": false
}
```

The worker reads the event and updates Elasticsearch.

## 16.5 Example Node.js worker

Simplified example:

```javascript
async function processProductEvent(event) {
  try {
    if (event.event_type === "PRODUCT_UPDATED") {
      await elasticsearch.index({
        index: "products",
        id: event.aggregate_id,
        document: {
          ...event.payload,
          version: event.version,
        },
      });
    }

    if (event.event_type === "PRODUCT_DELETED") {
      await elasticsearch.delete({
        index: "products",
        id: event.aggregate_id,
      });
    }

    await markEventProcessed(event.event_id);
  } catch (error) {
    await scheduleRetry(event, error);
  }
}
```

This is a simplified example, not a complete production implementation.

A production worker must also consider stale events and concurrent processing.

## 16.6 Idempotency

A worker may process the same event more than once.

Example:

```text
Event EVT101
    |
    v
Worker indexes product
    |
    v
Worker crashes before marking event processed
    |
    v
Event is delivered again
```

If the worker cannot safely process duplicate events, data may become inconsistent.

Idempotency means that processing the same event multiple times does not produce an incorrect additional effect.

Using a stable Elasticsearch document ID helps with idempotent indexing.

For example:

```javascript
await elasticsearch.index({
  index: "products",
  id: "P101",
  document: product,
});
```

Repeatedly indexing the same complete product document under the same ID replaces the document's indexed representation rather than creating multiple documents with new IDs.

However, stable IDs alone do not solve out-of-order updates.

## 16.7 Handling out-of-order events

Consider:

```text
Event 1: Product price = 1999, version 4
Event 2: Product price = 1799, version 5
```

Suppose Event 2 is processed first.

Then Event 1 is processed afterward.

The older price could overwrite the newer price.

A production system should use event versions or another ordering mechanism to reject stale updates.

Conceptually:

```text
Incoming Event Version
          |
          v
Compare With Stored Version
          |
     ----------------
     |              |
  Newer Event    Older Event
     |              |
     v              v
   Apply          Ignore
```

The exact implementation can use Elasticsearch versioning mechanisms or application-side version checks, depending on the design.

## 16.8 Handling deletes

Deletion events require special attention.

Suppose:

```text
Product P101 deleted from MongoDB
```

The worker must also remove it from Elasticsearch.

Otherwise, users may continue seeing a product that no longer exists in the application database.

The system must ensure that delayed or duplicated older events do not accidentally recreate deleted products.

Versioning, tombstones, and event ordering strategies can help.

## 16.9 Retry and dead-letter handling

A production worker should distinguish between:

- Temporary failures.
- Permanent mapping errors.
- Invalid documents.
- Elasticsearch unavailability.
- Network timeouts.

Example:

```text
Event Processing
       |
       v
   Success?
    /    \
  Yes     No
  |        |
  v        v
 Mark    Retry
Done       |
           v
      Retry Limit?
        /     \
      No       Yes
      |         |
      v         v
    Retry     Dead Letter
```

A dead-letter queue (DLQ) stores events that cannot be successfully processed after the configured retry policy.

Operators can inspect and replay these events after fixing the problem.

## 16.10 Eventual consistency

MongoDB and Elasticsearch are separate systems.

They may not reflect the same data at exactly the same instant.

Example:

```text
10:00:00 Product updated in MongoDB
10:00:01 Event processed
10:00:02 Elasticsearch updated
```

For a short period, MongoDB and Elasticsearch may contain different versions of the product.

This is called eventual consistency.

For most product-search systems, a small synchronization delay is acceptable.

However:

- Payment decisions should not depend on stale search data.
- Inventory confirmation should use the authoritative application database.
- Critical business validation should not rely exclusively on Elasticsearch results.

**Rule:** Elasticsearch should be treated as a derived search projection, not the source of truth for critical business operations.

## 16.11 Rebuilding Elasticsearch

What happens if the Elasticsearch index is corrupted, deleted, or needs a complete rebuild?

If MongoDB is the source of truth, the application can rebuild the search index.

```text
              MongoDB
                 |
                 v
          Read Product Data
                 |
                 v
          Transform Documents
                 |
                 v
          Bulk Index into ES
                 |
                 v
          Validate New Index
                 |
                 v
           Switch Alias
```

A production rebuild should account for updates occurring while the initial bulk load is running.

Possible approaches:

- Establish a change-stream position before beginning the bulk load.
- Capture events while the snapshot is being loaded.
- Replay events after the initial load.
- Switch the alias only after synchronization and validation.

This is a common pattern for rebuilding derived indexes without losing concurrent updates.

---

# 17. Practical Elasticsearch Commands

These commands are useful when inspecting a cluster.

Exact output and available options depend on Elasticsearch version and configuration.

## 17.1 Check cluster health

```http
GET /_cluster/health
```

Example response:

```json
{
  "cluster_name": "production",
  "status": "green",
  "number_of_nodes": 3,
  "number_of_data_nodes": 3,
  "active_primary_shards": 6,
  "active_shards": 12,
  "unassigned_shards": 0
}
```

## 17.2 List nodes

```http
GET /_cat/nodes?v
```

This provides information about cluster nodes.

## 17.3 List shards

```http
GET /_cat/shards?v
```

Useful for understanding:

- Shard allocation.
- Primary and replica copies.
- Shard state.
- Node placement.

## 17.4 List indexes

```http
GET /_cat/indices?v
```

Useful for checking:

- Index health.
- Document count.
- Primary storage.
- Total storage.

## 17.5 Check index settings

```http
GET /products/_settings
```

## 17.6 Check mappings

```http
GET /products/_mapping
```

## 17.7 Create an index

```http
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "brand": {
        "type": "keyword"
      },
      "price": {
        "type": "integer"
      },
      "category": {
        "type": "keyword"
      }
    }
  }
}
```

This creates:

- Three primary shards.
- One replica per primary.
- A `text` field for full-text search.
- `keyword` fields for exact matching and aggregation.
- An integer field for numeric operations.

The index creation request may fail or remain partially allocated if the cluster cannot satisfy the required shard allocation.

## 17.8 Refresh an index

```http
POST /products/_refresh
```

This requests a refresh.

It should not be used as a routine solution for every write operation.

## 17.9 Index a document

```http
POST /products/_doc/P101
{
  "name": "Wireless Headphones",
  "brand": "Sony",
  "price": 1999,
  "category": "Electronics"
}
```

## 17.10 Search documents

```http
GET /products/_search
{
  "query": {
    "match": {
      "name": "wireless headphones"
    }
  }
}
```

---

# 18. Elasticsearch Architecture: Complete Mental Model

Let's combine everything.

```text
                    CLIENT APPLICATION
                            |
                            v
                      NODE.JS API
                            |
                            v
                  ELASTICSEARCH CLUSTER
                            |
                 -----------------------
                 |                     |
                 v                     v
          Coordinating Node      Cluster Manager
                 |
        -----------------------
        |          |          |
        v          v          v
      Node 1     Node 2     Node 3
        |          |          |
        v          v          v
      Primary    Primary    Primary
      Shard 0    Shard 1    Shard 2
        |          |          |
        v          v          v
      Replica    Replica    Replica
      Shard 0    Shard 1    Shard 2
        |          |          |
        v          v          v
      Lucene     Lucene     Lucene
      Segments   Segments   Segments
```

The major responsibilities:

| Component         | Responsibility                                        |
| ----------------- | ----------------------------------------------------- |
| Cluster           | Group of Elasticsearch nodes                          |
| Node              | Running Elasticsearch instance                        |
| Cluster manager   | Maintains cluster-wide state and coordination         |
| Coordinating node | Coordinates distributed requests                      |
| Index             | Logical collection of documents                       |
| Shard             | Distributed Lucene index                              |
| Primary shard     | Handles initial indexing operations                   |
| Replica shard     | Copy for availability and search capacity             |
| Routing           | Determines the destination primary shard              |
| Translog          | Supports operation recovery and durability            |
| Refresh           | Makes recent operations searchable                    |
| Flush             | Creates Lucene commit and manages translog lifecycle  |
| Segment           | Immutable searchable Lucene structure                 |
| Merge             | Combines segments and reclaims deleted-document space |
| Query phase       | Finds and ranks matching candidates                   |
| Fetch phase       | Retrieves selected documents                          |

---

# 19. Common Misconceptions

| Misconception                                                        | Correct understanding                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| An index is the same as a shard                                      | An index contains shards                                                                         |
| A shard is the same as a segment                                     | A shard is a Lucene index containing multiple segments                                           |
| Replicas are backups                                                 | Replicas provide redundancy, not independent historical backups                                  |
| Every successful write is immediately searchable                     | Search visibility depends on refresh                                                             |
| Refresh and flush are the same                                       | Refresh provides search visibility; flush creates a Lucene commit and manages translog lifecycle |
| Every node stores all documents                                      | Documents are distributed across shard copies                                                    |
| More replicas always make indexing faster                            | Replicas increase indexing and storage work                                                      |
| More nodes automatically improve performance                         | Workload, shard distribution, resources, and coordination matter                                 |
| Search only runs on primary shards                                   | Search can use primary or replica copies                                                         |
| Elasticsearch is a relational database                               | It is a distributed search and analytics engine built on Lucene                                  |
| Elasticsearch should be the source of truth for all application data | It is commonly a derived search projection                                                       |
| A green cluster guarantees perfect durability                        | Green describes shard allocation health, not every possible durability guarantee                 |

---

# 20. Interview Questions and Answers

## Q1. What is an Elasticsearch cluster?

A cluster is a collection of Elasticsearch nodes that work together to store, index, and search data.

## Q2. What is a node?

A node is a running Elasticsearch instance with its own resources and configured roles.

## Q3. What is a shard?

A shard is a distributed unit of an index. Technically, it is a Lucene index.

## Q4. What is the difference between primary and replica shards?

A primary shard handles the initial indexing operation for its shard. Replica shards maintain copies and can serve searches or be promoted when a primary becomes unavailable.

## Q5. Can we change the number of primary shards dynamically?

Not directly for a standard existing index. Changing the primary shard count generally requires reindexing or a supported split/shrink operation.

The replica count can generally be changed dynamically.

## Q6. How does Elasticsearch determine which shard stores a document?

It uses a hash-based routing calculation involving the routing value and the number of primary shards.

By default, the document ID is used as the routing value.

## Q7. What is custom routing?

Custom routing allows the application to choose a routing value other than the document ID.

It can reduce the number of shards involved in queries when the application has a suitable access pattern.

## Q8. What happens when a primary shard fails?

If an eligible replica is available, Elasticsearch can promote it to primary. The cluster then attempts to restore the missing redundancy.

## Q9. What is the difference between green, yellow, and red cluster health?

- Green: All primary and replica shards are assigned.
- Yellow: All primary shards are assigned, but some replicas are not.
- Red: At least one primary shard is unassigned.

## Q10. What is a translog?

The translog records shard operations and helps recover operations that have not yet been safely incorporated into a Lucene commit.

## Q11. What is refresh?

Refresh makes recently indexed operations visible to search by opening a new searchable view of the indexed data.

## Q12. What is flush?

Flush creates a Lucene commit and manages the translog lifecycle.

## Q13. Why is Elasticsearch called near-real-time?

Because a successful indexing operation is not necessarily searchable immediately. The document generally becomes searchable after a refresh.

## Q14. What is a Lucene segment?

A segment is an independently searchable, immutable structure inside a Lucene index.

An Elasticsearch shard contains multiple segments.

## Q15. Why does Lucene merge segments?

To reduce the number of segments, improve index organization, and reclaim space occupied by deleted documents.

## Q16. Explain the query and fetch phases.

During the query phase, participating shards execute the query and return matching candidates.

During the fetch phase, Elasticsearch retrieves the selected documents and returns them through the coordinating node.

## Q17. Why are replicas useful for search?

Replica shards can serve search requests, increasing the available search capacity and improving availability.

## Q18. Why is deep pagination expensive?

Because each shard may need to collect and return a large number of candidates so the coordinating node can determine the global offset and results.

`search_after` with PIT is a better approach for many deep-pagination use cases.

## Q19. What is the difference between Elasticsearch and MongoDB in a production architecture?

MongoDB commonly stores authoritative application data, while Elasticsearch maintains a search-optimized projection for full-text search, relevance scoring, and aggregations.

## Q20. How do you synchronize MongoDB and Elasticsearch?

Common approaches include MongoDB Change Streams or a transactional outbox with a worker.

The system must handle retries, duplicate events, ordering, deletes, and index rebuilding.

## Q21. Why should Elasticsearch not be the source of truth for payment or inventory decisions?

Search indexes can be stale because synchronization is asynchronous. Critical business operations should validate against the authoritative application database.

## Q22. What is index lifecycle management?

It automates index operations such as rollover, retention, deletion, and supported movement between storage tiers.

## Q23. How can you change a field analyzer in an existing index?

For an existing indexed field, changing its index-time analyzer generally requires creating a new index and reindexing the documents.

## Q24. Why can too many shards be a problem?

Every shard has operational overhead. Too many shards increase resource consumption, coordination work, and cluster-management complexity.

## Q25. Are Elasticsearch replicas equivalent to database backups?

No. Replicas can reproduce accidental changes and deletions. Independent snapshots are required for backup and recovery.

---

# 21. Practical Exercises

Use these exercises to check whether you understand the architecture rather than merely memorizing terminology.

## Exercise 1: Shard calculation

An Elasticsearch index contains:

- 4 primary shards.
- 2 replicas per primary.

Answer:

1. How many primary shards exist?
2. How many replica shards exist?
3. How many shard copies exist in total?

**Answer:**

- Primary shards = 4.
- Replica shards = 4 × 2 = 8.
- Total shard copies = 12.

## Exercise 2: Storage calculation

An index contains 240 GB of primary data.

It has one replica per primary.

Estimate total shard storage.

**Answer:**

```text
Primary storage = 240 GB
Replica storage = 240 GB

Total = 480 GB
```

This excludes operational overhead and temporary storage requirements.

## Exercise 3: Cluster health

A cluster has:

- All primary shards assigned.
- Two replica shards unassigned.

What is the health status?

**Answer:** Yellow.

All primaries are assigned, but redundancy is incomplete.

## Exercise 4: Search visibility

A document is indexed successfully.

An immediate search does not find it.

What could explain this?

**Answer:** The indexing operation may not yet have become visible through a refresh.

## Exercise 5: Segment behavior

A document is updated.

Does Lucene directly overwrite the old document inside an immutable segment?

**Answer:** No. Conceptually, the old document is marked deleted and a new version is indexed. Segment merging can later reclaim the obsolete version.

## Exercise 6: Distributed search

An index has five primary shards.

A user searches for the top 10 documents.

Does Elasticsearch search only one shard?

**Answer:** Not normally. Unless routing or other shard-selection mechanisms restrict the search, the request is distributed across the relevant shard copies.

## Exercise 7: MongoDB synchronization

A product update succeeds in MongoDB, but Elasticsearch is unavailable.

What should happen?

**Answer:** The event should remain recoverable through the chosen synchronization mechanism. The worker should retry indexing when Elasticsearch becomes available.

Do not silently discard the update.

## Exercise 8: Design a production search pipeline

Design a system with:

- MongoDB as the source of truth.
- Elasticsearch for product search.
- A queue or outbox.
- A Node.js worker.
- Retry handling.
- Dead-letter handling.
- Index rebuilding.

Explain how your architecture handles duplicate and out-of-order events.

---

# 22. Final Revision Sheet

| Topic                | Key point                                             |
| -------------------- | ----------------------------------------------------- |
| Cluster              | Collection of Elasticsearch nodes                     |
| Node                 | Running Elasticsearch instance                        |
| Cluster manager      | Maintains cluster-wide state                          |
| Data node            | Stores and processes shards                           |
| Ingest node          | Processes incoming documents                          |
| Coordinating node    | Coordinates distributed requests                      |
| Index                | Logical collection of documents                       |
| Shard                | Distributed Lucene index                              |
| Primary shard        | Handles initial indexing operations                   |
| Replica shard        | Copy used for redundancy and search capacity          |
| Routing              | Selects the destination primary shard                 |
| Translog             | Helps recover operations                              |
| Refresh              | Makes recent documents searchable                     |
| Flush                | Creates Lucene commit and manages translog lifecycle  |
| Segment              | Immutable searchable structure                        |
| Segment merge        | Combines segments and reclaims deleted-document space |
| Query phase          | Finds matching candidates                             |
| Fetch phase          | Retrieves selected documents                          |
| `search_after`       | Cursor-like pagination using sort values              |
| PIT                  | Maintains a consistent search view                    |
| ILM                  | Automates index lifecycle management                  |
| Rollover             | Creates a new index when conditions are met           |
| Alias                | Logical name pointing to indexes                      |
| Reindexing           | Copies documents into a new index                     |
| Change Streams       | Captures MongoDB changes                              |
| Transactional outbox | Persists events atomically with business changes      |
| Eventual consistency | Systems converge after asynchronous synchronization   |
