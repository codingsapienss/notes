---
sidebar_label: Graph Database Internal Storage
sidebar_position: 1
---

# Graph Database Internal Storage

# 1. Introduction

**How does a graph database actually store nodes and relationships internally, and how does it retrieve connected data efficiently?**

Understanding the logical graph model is not enough for a backend engineer. We also need to understand the physical storage structures and how they influence query performance.

Consider this graph:

```text
       (Prashant)
        /      \
   FOLLOWS    FOLLOWS
      /          \
  (Rahul) -----> (Amit)
      |
    FOLLOWS
      |
      v
   (Karan)
```

Logically, this looks simple.

But internally, the database must store:

- Node identities.
- Node properties.
- Relationship identities.
- Relationship types.
- Relationship directions.
- Relationship endpoints.
- Property values.
- Indexes.
- Storage metadata.

Let's understand how this works.

---

# 2. How Graph Databases Store Data

A graph database has two major logical components:

1. Nodes.
2. Relationships.

Properties and indexes provide additional information and retrieval capabilities.

## 2.1 Node Storage

A node represents an entity.

Example:

```text
(:User {
    userId: 101,
    name: "Prashant",
    city: "Noida"
})
```

Conceptually, a database needs to store information such as:

| Field           | Example              |
| --------------- | -------------------- |
| Node ID         | 101                  |
| Label           | User                 |
| Properties      | userId, name, city   |
| Property values | 101, Prashant, Noida |

A simplified internal representation might look like:

```text
Node Record

+---------+---------+------------------+
| Node ID | Label   | Property Ref     |
+---------+---------+------------------+
| 101     | User    | Property Record  |
+---------+---------+------------------+
```

The database uses internal identifiers to locate nodes.

**Important:** This is a conceptual representation, not a universal physical record format. Different graph databases use different storage engines and record layouts.

For example, Neo4j has its own native storage structures, while other graph databases may use different storage backends.

## 2.2 Relationship Storage

Relationships are equally important.

Consider:

```text
(Prashant)-[:FOLLOWS]->(Rahul)
```

The database must know:

- Which node is the source?
- Which node is the destination?
- What is the relationship type?
- What is the relationship ID?
- Does the relationship have properties?

Conceptually:

```text
Relationship Record

+---------------+------------+------------+--------------+
| Relationship  | Start Node | End Node   | Type         |
+---------------+------------+------------+--------------+
| 5001          | 101        | 102        | FOLLOWS      |
+---------------+------------+------------+--------------+
```

This means:

```text
Node 101 ----FOLLOWS----> Node 102
```

A relationship may also have properties:

```text
(Prashant)-[:FOLLOWS {
    since: "2026-01-10"
}]->(Rahul)
```

Conceptually, the relationship record can reference a separate property record.

## 2.3 Why Store Relationships Separately?

Suppose a user has 10,000 connections.

If relationships are represented explicitly, the database can identify each connection and traverse it.

A relationship is not merely a value stored inside a node.

It is a first-class element of the graph model.

This allows the database to support:

- Relationship traversal.
- Relationship filtering.
- Relationship properties.
- Multiple relationship types.
- Direction-aware queries.
- Variable-length paths.

---

# 3. Adjacency Structures

One of the most important concepts in graph storage is **adjacency**.

Adjacency describes which nodes are directly connected to a particular node.

Suppose we have:

```text
        B
       /
      /
     A ---- C
      \
       \
        D
```

Node A is directly connected to:

```text
B, C, D
```

These are A's adjacent nodes, also called its neighbors.

## 3.1 Adjacency List

An adjacency list stores the neighboring nodes for each node.

Example:

```text
A -> B, C, D
B -> A
C -> A
D -> A
```

A table representation:

| Node | Adjacent nodes |
| ---- | -------------- |
| A    | B, C, D        |
| B    | A              |
| C    | A              |
| D    | A              |

This representation is useful because retrieving the neighbors of a node can be straightforward.

### Example in JavaScript

```javascript
const graph = {
  A: ["B", "C", "D"],
  B: ["A"],
  C: ["A"],
  D: ["A"],
};

console.log(graph["A"]);
```

Output:

```javascript
["B", "C", "D"];
```

This is a simple in-memory adjacency-list representation.

It is not a production graph database. A database must also handle persistence, concurrency, indexing, relationship properties, recovery, and distributed storage.

## 3.2 Adjacency List for a Directed Graph

Consider:

```text
A ----> B
|
|
v
C ----> D
```

An adjacency list:

```text
A -> B, C
B -> []
C -> D
D -> []
```

This represents outgoing relationships.

For a directed graph, incoming and outgoing relationships are different.

For example:

```text
A -> B
```

A has an outgoing relationship to B.

B has an incoming relationship from A.

A database may maintain or derive the information needed to support both directions.

## 3.3 Adjacency Matrix

Another way to represent a graph is an adjacency matrix.

For the graph:

```text
A ---- B
|
|
C ---- D
```

An adjacency matrix could be:

|     |   A |   B |   C |   D |
| --- | --: | --: | --: | --: |
| A   |   0 |   1 |   1 |   0 |
| B   |   1 |   0 |   0 |   0 |
| C   |   1 |   0 |   0 |   1 |
| D   |   0 |   0 |   1 |   0 |

Here:

- `1` means an edge exists.
- `0` means no edge exists.

For an unweighted, undirected graph, the matrix is symmetric.

For example:

```text
A -> B = 1
B -> A = 1
```

### Adjacency Matrix vs Adjacency List

| Feature                      | Adjacency list              | Adjacency matrix                           |
| ---------------------------- | --------------------------- | ------------------------------------------ |
| Storage                      | Stores neighbors            | Stores pairwise connections                |
| Space complexity             | \(O(V + E)\)                | \(O(V^2)\)                                 |
| Check whether an edge exists | Depends on neighbor lookup  | \(O(1)\)                                   |
| Find neighbors               | Efficient for sparse graphs | Requires scanning a row                    |
| Suitable for                 | Sparse graphs               | Dense graphs or matrix-oriented algorithms |

Where:

- \(V\) = Number of vertices.
- \(E\) = Number of edges.

**Important:** Adjacency lists and matrices are fundamental graph representations. They should not be confused with the exact on-disk storage implementation of a commercial graph database.

---

# 4. Index-Free Adjacency

This is an important concept when studying graph database internals, particularly Neo4j's native storage architecture.

## 4.1 What Is Index-Free Adjacency?

Index-free adjacency means that once a node is located, its relationships can be accessed directly through stored references rather than searching a global relationship index for every neighboring node.

Conceptually:

```text
Node A
  |
  v
Relationship Record
  |
  v
Node B
  |
  v
Next Relationship
  |
  v
Node C
```

The database can follow stored references to discover connected nodes.

This is useful for relationship traversal.

## 4.2 Why Is It Useful?

Suppose we have:

```text
A -> B -> C -> D -> E
```

You want to find nodes connected to A within three hops.

A graph database can start at A and follow its relationships.

Conceptually:

```text
Start at A
   |
   v
Follow relationship
   |
   v
Reach B
   |
   v
Follow relationship
   |
   v
Reach C
   |
   v
Follow relationship
   |
   v
Reach D
```

The database does not need to reconstruct the entire graph by joining all relationship records globally at every step.

This is particularly valuable when queries repeatedly traverse connected entities.

## 4.3 Relational JOIN vs Graph Traversal

Consider a relational database.

You have:

```text
users
-----
id
name

follows
-------
follower_id
following_id
```

To traverse several levels, you may need repeated joins or a recursive query.

For example:

```sql
WITH RECURSIVE connections AS (
    SELECT
        following_id,
        1 AS depth
    FROM follows
    WHERE follower_id = 101

    UNION ALL

    SELECT
        f.following_id,
        c.depth + 1
    FROM follows f
    JOIN connections c
        ON f.follower_id = c.following_id
    WHERE c.depth < 3
)
SELECT DISTINCT following_id
FROM connections;
```

A graph database can express the same traversal using a variable-length relationship pattern:

```cypher
MATCH
    (u:User {userId: 101})
    -[:FOLLOWS*1..3]->
    (connected:User)

RETURN DISTINCT connected;
```

Both approaches can solve the problem.

The difference is the underlying data model and how the database executes traversal.

**Important:** Index-free adjacency does not mean a graph database never uses indexes. Indexes are still useful for finding the starting node and filtering properties.

---

# 5. How Graph Traversal Works Internally

Traversal means following relationships from one node to another.

Let's understand the process.

Consider:

```text
          A
         / \
        B   C
       /     \
      D       E
       \     /
         F
```

Suppose you start at A and want to find all nodes reachable within two hops.

## 5.1 Step-by-Step Traversal

**Step 1: Find the starting node**

The database locates A.

This may use an index on a property such as `userId`.

**Step 2: Read its relationships**

A is connected to:

```text
B, C
```

**Step 3: Follow the next level**

B is connected to D.

C is connected to E.

**Step 4: Return the results**

Nodes reachable within two hops:

```text
A -> B
A -> C

A -> B -> D
A -> C -> E
```

The result set is:

```text
B, C, D, E
```

## 5.2 Breadth-First Search (BFS)

Breadth-first search explores the graph level by level.

Example:

```text
          A
         / \
        B   C
       / \   \
      D   E   F
```

BFS traversal:

```text
A -> B -> C -> D -> E -> F
```

It visits:

1. Starting node A.
2. All immediate neighbors B and C.
3. Next-level neighbors D, E, and F.

BFS is useful for:

- Finding minimum-hop paths in unweighted graphs.
- Finding nearby connections.
- Discovering nodes within a certain depth.
- Exploring connected components.

### BFS Implementation in JavaScript

```javascript
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();

    result.push(current);

    for (const neighbor of graph[current] ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

const graph = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B"],
  F: ["C"],
};

console.log(bfs(graph, "A"));
```

Possible output:

```text
A, B, C, D, E, F
```

The exact ordering depends on the order in which neighbors are stored.

## 5.3 Depth-First Search (DFS)

Depth-first search explores one branch as far as possible before backtracking.

Using the same graph:

```text
          A
         / \
        B   C
       / \   \
      D   E   F
```

One possible DFS traversal:

```text
A -> B -> D -> E -> C -> F
```

DFS is useful for:

- Exploring graph structures.
- Detecting cycles.
- Finding connected components.
- Dependency analysis.
- Certain path-searching problems.

### DFS Implementation in JavaScript

```javascript
function dfs(graph, start, visited = new Set()) {
  if (visited.has(start)) {
    return [];
  }

  visited.add(start);

  const result = [start];

  for (const neighbor of graph[start] ?? []) {
    result.push(...dfs(graph, neighbor, visited));
  }

  return result;
}

const graph = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B"],
  F: ["C"],
};

console.log(dfs(graph, "A"));
```

Possible output:

```text
A, B, D, E, C, F
```

## 5.4 BFS vs DFS

| Feature                           | BFS                          | DFS                             |
| --------------------------------- | ---------------------------- | ------------------------------- |
| Traversal                         | Level by level               | Depth first                     |
| Common data structure             | Queue                        | Stack or recursion              |
| Shortest path in unweighted graph | Yes                          | Not guaranteed                  |
| Memory usage                      | Can be high for broad graphs | Depends on depth and branching  |
| Common use                        | Minimum-hop connections      | Exploration and cycle detection |

**Important:** These are graph algorithms. A graph database may implement traversals using its own execution engine, indexes, optimizations, and storage structures rather than literally executing the JavaScript implementations above.

---

# 6. How a Graph Database Executes a Query

Let's examine a query using Neo4j-style Cypher.

Requirement:

Find all products purchased by a particular user.

Graph:

```text
(User)-[:PURCHASED]->(Order)
(Order)-[:CONTAINS]->(Product)
```

Query:

```cypher
MATCH
    (u:User {userId: 101})
    -[:PURCHASED]->
    (o:Order)
    -[:CONTAINS]->
    (p:Product)

RETURN p;
```

Conceptually, the execution process looks like this:

```text
              Query
                |
                v
          Query Parser
                |
                v
          Query Planner
                |
                v
          Execution Plan
                |
                v
       Find Starting User
                |
                v
       Traverse PURCHASED
                |
                v
       Reach Order Nodes
                |
                v
       Traverse CONTAINS
                |
                v
       Reach Product Nodes
                |
                v
          Return Results
```

Let's understand each step.

## 6.1 Query Parsing

The database parses the query and checks:

- Syntax.
- Labels.
- Relationship types.
- Property expressions.
- Return expressions.

## 6.2 Query Planning

The database determines how to execute the query.

For example:

- How should the starting user be located?
- Which index can be used?
- Which relationships should be traversed?
- What filters can be applied early?
- What results must be materialized?

The actual planning strategy depends on the graph database and its version.

## 6.3 Find the Starting Node

The database needs to locate:

```text
User with userId = 101
```

An index may help find the node quickly.

This is important because graph traversal usually needs a starting point.

## 6.4 Traverse Relationships

After finding the starting node, the database follows:

```text
PURCHASED
```

Then it follows:

```text
CONTAINS
```

This discovers the connected product nodes.

## 6.5 Apply Filters and Return Results

The database applies the remaining conditions and returns the requested properties or nodes.

The execution plan can avoid unnecessary traversal when filters and indexes allow it.

---

# 7. Why Graph Traversal Can Be Efficient

Consider a network with:

- 1 million users.
- 10 million relationships.
- Each user connected to approximately 10 other users.

You want to find the immediate connections of one user.

If the database can locate the starting node and access its adjacency information efficiently, it can examine the user's local connections without scanning every relationship in the database.

This is the central advantage of adjacency-oriented graph storage.

However, graph performance depends on more than the number of nodes.

Important factors include:

- Number of relationships.
- Degree distribution.
- Traversal depth.
- Starting-node selectivity.
- Relationship types.
- Property filters.
- Memory locality.
- Storage implementation.
- Query planning.
- Network communication in distributed systems.

## 7.1 The High-Degree Node Problem

Suppose one user has 10 million followers.

```text
              User A
           /    |    \
          /     |     \
       User B User C User D
          ... millions ...
```

User A is a high-degree node.

A query that retrieves every follower may require processing millions of relationships.

Even though graph traversal is efficient for many local queries, it does not make enormous result sets cheap.

This is an important performance consideration.

## 7.2 Traversal Depth Matters

Compare these queries:

```text
Query 1: Find direct connections.
Query 2: Find connections within 2 hops.
Query 3: Find connections within 10 hops.
```

As traversal depth increases, the number of reachable nodes can grow rapidly.

For a rough illustration, if each node has an average branching factor of 10:

```text
Depth 1: 10 possible neighbors
Depth 2: 100 possible paths
Depth 3: 1,000 possible paths
Depth 4: 10,000 possible paths
```

This is an illustrative branching estimate, not a guarantee of unique reachable nodes. Real graphs contain overlapping paths, cycles, and highly uneven degree distributions.

Unbounded traversals can be expensive.

---

# 8. Indexes in Graph Databases

A common misconception is:

"Graph databases do not need indexes because relationships are directly connected."

This is incorrect.

Graph databases still need indexes.

## 8.1 Why Are Indexes Needed?

Suppose you have 100 million user nodes.

You want to find:

```text
User where email = "prashant@example.com"
```

Without a suitable index, the database may need to inspect many nodes to find the matching user.

An index can locate the starting node more efficiently.

## 8.2 Index-Based Starting Point

Conceptually:

```text
        User Email Index
               |
               v
     prashant@example.com
               |
               v
           Node ID 101
               |
               v
        Follow Relationships
               |
               v
       Connected User Nodes
```

The index locates the starting node.

The database then traverses relationships from that node.

This combination is important:

- Indexes locate nodes.
- Adjacency structures support traversal.

## 8.3 Common Index Types

The exact index types vary by graph database, but common examples include:

- Property indexes.
- Composite indexes.
- Unique constraints backed by indexes.
- Full-text indexes.
- Point or spatial indexes.
- Vector indexes in systems that support them.

For example, Neo4j supports indexes and constraints for different data access requirements.

Do not assume every graph database supports every index type.

---

# 9. Graph Storage Architecture: Native vs Non-Native

Not all graph databases store graph data in the same way.

A useful high-level distinction is between native graph storage and graph layers built on top of another storage system.

## 9.1 Native Graph Storage

A native graph database is designed with graph structures as a central part of its storage and query architecture.

Conceptual layout:

```text
          Graph Database
                 |
       +---------+---------+
       |                   |
       v                   v
   Node Storage      Relationship Storage
       |                   |
       v                   v
   Properties           Properties
       |                   |
       +---------+---------+
                 |
                 v
              Indexes
```

Some native graph systems optimize storage and traversal around direct node-to-relationship connections.

Neo4j is an example of a database with native graph storage.

## 9.2 Non-Native or Layered Graph Storage

Some graph systems implement graph capabilities over another storage engine.

For example, JanusGraph can use distributed storage backends such as Cassandra or HBase.

Conceptually:

```text
          Application
               |
               v
          JanusGraph
               |
               v
       Graph Query Layer
               |
               v
       Storage Backend
          /       \
         v         v
    Cassandra    HBase
```

The graph layer manages graph-oriented operations while the underlying storage backend persists the data.

This can provide scalability through the underlying storage system, but the architecture introduces additional layers and tradeoffs.

## 9.3 Native vs Layered Comparison

| Feature                | Native graph storage             | Layered graph storage                         |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| Storage design         | Built around graph structures    | Uses an underlying storage backend            |
| Traversal              | Can optimize direct graph access | Depends on graph layer and backend            |
| Backend choice         | Often tightly integrated         | May support multiple backends                 |
| Scaling                | Depends on product architecture  | Can leverage distributed backend capabilities |
| Operational complexity | Depends on the product           | Often includes additional components          |
| Example                | Neo4j                            | JanusGraph with Cassandra or HBase            |

Neither approach is universally better.

Native storage may provide efficient graph traversal, while layered architectures may offer different scalability and storage choices.

---

# 10. Graph Database Storage Challenges

Graph databases solve relationship-heavy queries, but graph storage has its own challenges.

## 10.1 High Relationship Density

Some graphs contain many relationships per node.

For example:

- Social networks.
- Fraud networks.
- Knowledge graphs.
- Recommendation networks.

Highly connected graphs can require substantial memory and processing.

## 10.2 Random Access Patterns

Graph traversal often moves between nodes that are not physically adjacent on disk.

This can produce random storage access.

Database engines may use:

- Caching.
- Memory management.
- Storage locality optimizations.
- Indexes.
- Specialized record layouts.

These techniques help reduce storage access costs, but they do not eliminate the problem.

## 10.3 Memory Requirements

Graph traversals may need to keep track of:

- Visited nodes.
- Traversal frontiers.
- Paths.
- Intermediate results.
- Query execution state.

Large traversals can consume significant memory.

## 10.4 Distributed Graph Traversal

In a distributed graph database, connected nodes may be stored on different machines.

Example:

```text
Node A -> Node B -> Node C

Node A: Server 1
Node B: Server 2
Node C: Server 3
```

Traversing from A to C may require network communication.

This can increase latency.

Distributed graph databases must manage:

- Partition placement.
- Network communication.
- Data replication.
- Cross-partition traversal.
- Consistency.
- Query coordination.

This is one reason graph databases can be more difficult to scale horizontally than simpler partition-oriented workloads.

---

# 11. Practical Example: Implement a Graph Traversal in Node.js

Before working with a real graph database, understand the basic mechanics using JavaScript.

Suppose you want to model users and their following relationships.

```javascript
const graph = {
  Prashant: ["Rahul", "Amit"],
  Rahul: ["Karan"],
  Amit: ["Karan"],
  Karan: ["Rohit"],
  Rohit: [],
};
```

## 11.1 Find Direct Connections

```javascript
function getDirectConnections(graph, user) {
  return graph[user] ?? [];
}

console.log(getDirectConnections(graph, "Prashant"));
```

Output:

```text
["Rahul", "Amit"]
```

## 11.2 Find Connections Within a Maximum Depth

```javascript
function findConnections(graph, start, maxDepth) {
  const visited = new Set([start]);
  const queue = [[start, 0]];
  const result = [];

  while (queue.length > 0) {
    const [current, depth] = queue.shift();

    if (depth === maxDepth) {
      continue;
    }

    for (const neighbor of graph[current] ?? []) {
      if (visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);

      result.push({
        user: neighbor,
        depth: depth + 1,
      });

      queue.push([neighbor, depth + 1]);
    }
  }

  return result;
}

console.log(findConnections(graph, "Prashant", 3));
```

Possible result:

```javascript
[
  { user: "Rahul", depth: 1 },
  { user: "Amit", depth: 1 },
  { user: "Karan", depth: 2 },
  { user: "Rohit", depth: 3 },
];
```

This example uses BFS.

The `visited` set prevents revisiting nodes and helps avoid infinite loops in cyclic graphs.

**Implementation note:** JavaScript's `Array.shift()` is convenient for teaching BFS, but it can be inefficient for large queues because elements need to be reindexed. Production implementations can use a queue with a moving head index or a dedicated deque.

## 11.3 What Did We Learn?

A graph traversal requires:

1. A starting node.
2. A way to retrieve neighboring nodes.
3. A traversal strategy.
4. A visited set or another cycle-handling mechanism.
5. A stopping condition.

Graph databases implement these capabilities with persistent storage, query planning, concurrency control, and other database mechanisms.

---

# 12. Common Misconceptions

| Misconception                                                         | Correct understanding                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Graph databases store only nodes.                                     | They store relationships as first-class data too.                               |
| Relationships are just foreign keys.                                  | Graph databases explicitly model and manage relationships.                      |
| Graph databases do not use indexes.                                   | Indexes help locate starting nodes and filter properties.                       |
| Index-free adjacency means no indexing.                               | It refers to direct relationship access, not the absence of indexes.            |
| Adjacency lists are the exact storage format of every graph database. | They are a fundamental representation, not a universal physical implementation. |
| Graph traversal is always fast.                                       | High-degree nodes and deep traversals can be expensive.                         |
| BFS and DFS are database-specific algorithms.                         | They are general graph algorithms.                                              |
| Native graph databases always scale better.                           | Performance and scalability depend on the product and workload.                 |
| Distributed graph databases avoid network latency.                    | Cross-partition traversal can require network communication.                    |
| More relationships always mean better graph performance.              | Relationship density can increase traversal costs.                              |

---

# 13. Interview Questions and Answers

## Q1. How are nodes and relationships stored in graph databases?

Nodes and relationships are represented as persistent graph records.

A node contains an identity and may reference labels and properties.

A relationship contains information about its source node, destination node, relationship type, and potentially its own properties.

The exact physical layout varies by database.

## Q2. What is adjacency?

Adjacency describes which nodes are directly connected to a particular node.

If A is connected to B and C, then B and C are adjacent nodes of A.

## Q3. What is an adjacency list?

An adjacency list stores the neighbors of each vertex.

Example:

```text
A -> B, C
B -> A
C -> A
```

It is commonly used to represent sparse graphs.

## Q4. What is an adjacency matrix?

An adjacency matrix is a two-dimensional matrix that records whether an edge exists between pairs of vertices.

For a graph with V vertices, it requires \(O(V^2)\) space.

## Q5. What is index-free adjacency?

It refers to directly following stored relationship references from a node to its connected nodes, rather than performing a global lookup for every relationship.

It is an important graph-storage optimization associated with native graph database architectures.

## Q6. Does index-free adjacency mean graph databases do not need indexes?

No.

Indexes are still important for locating starting nodes and filtering properties.

Index-free adjacency concerns how relationships can be accessed after a node has been located.

## Q7. What is the difference between BFS and DFS?

BFS explores level by level using a queue.

DFS explores deeply along a branch before backtracking, commonly using a stack or recursion.

BFS finds shortest paths in unweighted graphs, while DFS does not guarantee the shortest path.

## Q8. Why can graph traversal become expensive?

Traversal can become expensive because of:

- High-degree nodes.
- Deep traversal paths.
- Large result sets.
- Cycles and repeated paths.
- Random storage access.
- Cross-node network communication.

## Q9. Why are indexes needed in graph databases?

Indexes help locate starting nodes based on properties.

After locating the starting node, the database can traverse relationships to retrieve connected entities.

## Q10. What is the difference between native and layered graph storage?

Native graph databases use storage architectures designed around graph structures.

Layered graph systems provide graph functionality over another storage backend, such as Cassandra or HBase.

## Q11. Why is distributed graph traversal challenging?

Connected nodes may be stored on different machines.

Traversing relationships across machines requires network communication and coordination, which can increase latency.

## Q12. What is the difference between graph traversal and SQL JOIN?

A SQL JOIN combines rows from relational tables based on matching conditions.

Graph traversal follows explicit relationships between nodes.

Both can retrieve connected information, but they use different data models and execution strategies.

---

# 14. Practical Exercises

## Exercise 1 — Build an Adjacency List

Represent this graph in JavaScript:

```text
       A
      / \
     B   C
    /     \
   D       E
```

Expected structure:

```javascript
const graph = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "E"],
  D: ["B"],
  E: ["C"],
};
```

Implement:

1. Find the direct neighbors of A.
2. Find all nodes using BFS.
3. Find all nodes using DFS.
4. Count the degree of A.

## Exercise 2 — Understand Traversal Depth

Given:

```text
Prashant -> Rahul
Prashant -> Amit
Rahul -> Karan
Amit -> Karan
Karan -> Rohit
```

Answer:

1. Which users are one hop away from Prashant?
2. Which users are two hops away?
3. Which users are three hops away?
4. Why might an unrestricted traversal be expensive?

## Exercise 3 — Understand Index-Free Adjacency

Assume a graph database has 10 million user nodes.

You need to:

```text
Find a user by email.
Find all users that person follows.
```

Explain:

1. Why an index is useful for finding the starting user.
2. Why adjacency structures are useful for retrieving connections.
3. Why scanning every relationship would be inefficient.

## Exercise 4 — Architecture Decision

A company has a graph with 100 million nodes and 1 billion relationships.

It needs to perform:

- Direct relationship lookup.
- Two-hop traversal.
- Fraud-network analysis.
- Large-scale community detection.

Explain which operations are likely to be straightforward and which may require more sophisticated algorithms, memory, and distributed processing.

---

# 15. Part 14B Summary

| Concept               | What to remember                                               |
| --------------------- | -------------------------------------------------------------- |
| Node storage          | Stores entity identity and references to labels and properties |
| Relationship storage  | Stores source, destination, type, and possibly properties      |
| Adjacency             | Direct connections of a node                                   |
| Adjacency list        | Stores neighboring nodes                                       |
| Adjacency matrix      | Stores pairwise edge information                               |
| Index-free adjacency  | Direct access to stored relationships                          |
| BFS                   | Level-by-level traversal                                       |
| DFS                   | Depth-first traversal                                          |
| Graph traversal       | Following relationships between nodes                          |
| Graph indexes         | Help locate starting nodes and filter properties               |
| Native graph storage  | Storage designed around graph structures                       |
| Layered graph storage | Graph layer backed by another storage system                   |
| High-degree node      | Node with many relationships                                   |
| Distributed traversal | Traversal that may cross machine boundaries                    |

## The Most Important Mental Model

```text
              Graph Query
                   |
                   v
          Locate Starting Node
                   |
                   v
             Use Index
                   |
                   v
          Access Relationships
                   |
                   v
          Traverse Connected Nodes
                   |
                   v
          Apply Filters and Limits
                   |
                   v
              Return Results
```

Remember these three ideas:

1. **Indexes help locate starting nodes.**
2. **Adjacency structures help navigate relationships.**
3. **Traversal depth and relationship density strongly influence performance.**

A graph database is not fast simply because it stores nodes and edges. Its performance comes from how its storage engine, indexing, query planner, and traversal mechanisms work together.
