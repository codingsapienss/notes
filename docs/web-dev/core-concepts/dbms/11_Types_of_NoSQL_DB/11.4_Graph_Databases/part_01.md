---
sidebar_label: Graph Database Fundamentals
sidebar_position: 1
---

# Graph Database Fundamentals

# 1. Introduction to Graph Databases

So far, we have studied several database types:

| Database type | Primary way of organizing data |
| ------------- | ------------------------------ |
| Relational    | Tables, rows, and columns      |
| Key-value     | Keys and values                |
| Document      | Documents and nested fields    |
| Wide-column   | Partitions, rows, and columns  |
| Graph         | Nodes and relationships        |

Graph databases are designed to store and query **relationships between entities**.

In a relational database, relationships are typically represented using foreign keys and retrieved using JOINs.

In a graph database, relationships are first-class elements of the data model.

This distinction becomes important when an application frequently asks questions involving multiple connected entities.

## 1.1 A Simple Example

Imagine a social networking application.

Users can:

- Follow other users.
- Become friends.
- Like posts.
- Comment on posts.
- Join groups.
- Share content.

Consider these relationships:

```text
Prashant ----FOLLOWS----> Rahul
Prashant ----FOLLOWS----> Amit
Rahul ------FRIENDS------> Amit
Amit -------LIKES--------> Post101
Rahul ------CREATED------> Post102
```

This is naturally represented as a graph.

<diagram>
  <escape></escape>
</diagram>

A graph database represents entities as nodes and connections as relationships.

For example:

```text
       (Prashant)
         /    \
    FOLLOWS  FOLLOWS
       /        \
   (Rahul) ---- (Amit)
          FRIENDS
```

The important part is not just storing the users. It is storing how users are connected.

## 1.2 Why Do We Need Graph Databases?

Consider a social media application.

Suppose you want to answer:

1. Who does Prashant follow?
2. Who follows Rahul?
3. Do Prashant and Rahul have common friends?
4. Are two users connected through three intermediate users?
5. What is the shortest connection path between two users?
6. Which users are influential in a particular network?

These questions involve traversing relationships.

A relational database can represent these relationships using tables and JOINs. However, queries involving many levels of relationships can become complicated and expensive, depending on the schema, indexes, data volume, and execution plan.

Graph databases are designed to make relationship traversal a central operation.

**Core idea:**

A graph database is particularly useful when the connections between data are as important as the data itself.

---

# 2. Graph Theory Fundamentals

Before understanding graph databases, you need to understand some basic graph theory.

A graph is a mathematical structure consisting of:

- Vertices (nodes).
- Edges (relationships).

Mathematically:

\[
G = (V, E)
\]

Where:

- \(G\) = Graph.
- \(V\) = Set of vertices.
- \(E\) = Set of edges.

Example:

```text
A ---- B
|      |
|      |
C ---- D
```

Here:

```text
V = {A, B, C, D}

E = {
  (A, B),
  (A, C),
  (B, D),
  (C, D)
}
```

The nodes represent entities, and edges represent connections between them.

## 2.1 Nodes (Vertices)

A node represents an entity in the application.

Examples:

- User.
- Product.
- Company.
- Bank account.
- Transaction.
- Location.
- Movie.
- Device.

Example:

```text
Node: User

{
  id: 101,
  name: "Prashant",
  age: 25
}
```

In a graph database, a node can have properties.

For example:

```text
(:User {
    id: 101,
    name: "Prashant",
    city: "Noida"
})
```

The notation above resembles Cypher, the query language used by Neo4j.

A node can have:

- A label identifying its type.
- Properties describing it.
- Relationships connecting it to other nodes.

## 2.2 Edges (Relationships)

An edge represents a connection between two nodes.

Example:

```text
(Prashant) ----FOLLOWS----> (Rahul)
```

The relationship has:

- A source node.
- A destination node.
- A relationship type.
- Potentially its own properties.

For example:

```text
(Prashant)-[:FOLLOWS {
    since: "2026-01-10"
}]->(Rahul)
```

The relationship itself contains information.

This is an important difference from simply storing a foreign key.

A relationship can represent a meaningful business event or connection.

Examples:

```text
(User)-[:PURCHASED]->(Product)

(User)-[:FOLLOWS]->(User)

(Person)-[:WORKS_AT]->(Company)

(Account)-[:TRANSFERRED_TO]->(Account)

(User)-[:RATED]->(Movie)
```

## 2.3 Properties

Properties are attributes associated with nodes or relationships.

Example:

```text
(:User {
    userId: 101,
    name: "Prashant",
    city: "Noida"
})
```

Relationship properties:

```text
(Prashant)-[:PURCHASED {
    orderId: 5001,
    amount: 2500,
    purchaseDate: "2026-11-14"
}]->(Laptop)
```

Here:

- `userId`, `name`, and `city` are node properties.
- `orderId`, `amount`, and `purchaseDate` are relationship properties.

This allows the relationship itself to carry business information.

---

# 3. Directed vs Undirected Graphs

Graph relationships can be directed or undirected.

## 3.1 Directed Graph

A directed graph has relationships with a defined direction.

Example:

```text
A ------> B
```

This means A points to B.

It does not automatically mean B points to A.

Real-world examples:

- User A follows User B.
- Account A transfers money to Account B.
- Employee A reports to Manager B.
- User A purchased Product B.

In Neo4j-style notation:

```cypher
(A)-[:FOLLOWS]->(B)
```

The direction matters.

If B follows A, a separate relationship is needed:

```cypher
(B)-[:FOLLOWS]->(A)
```

## 3.2 Undirected Graph

An undirected graph represents a connection without a meaningful direction.

Example:

```text
A -------- B
```

A and B are connected.

Examples:

- A road connecting two locations.
- A symmetric friendship relationship.
- Two devices connected through a symmetric link.

In a graph database, undirected relationships can often be represented by a stored relationship with a direction and queried without considering that direction.

For example, a friendship can be represented as:

```cypher
(A)-[:FRIENDS_WITH]->(B)
```

The application may interpret this relationship symmetrically.

**Important:** A graph database may physically store a relationship in a particular direction even when the business meaning is undirected.

## 3.3 Directed vs Undirected Comparison

| Feature            | Directed graph                        | Undirected graph                           |
| ------------------ | ------------------------------------- | ------------------------------------------ |
| Direction          | Has direction                         | No meaningful direction                    |
| Relationship       | A → B                                 | A — B                                      |
| Reverse connection | Not automatically implied             | Same connection works both ways            |
| Example            | FOLLOWS                               | FRIENDS_WITH                               |
| Common use         | Social following, payments, reporting | Symmetric friendships, undirected networks |

---

# 4. Weighted vs Unweighted Graphs

Another important classification is based on whether relationships have weights.

## 4.1 Unweighted Graph

An unweighted graph does not assign a numerical weight to each relationship.

Example:

```text
A ---- B
|
|
C ---- D
```

Each connection is treated equally for a basic traversal.

Possible applications:

- Simple friendship networks.
- Basic dependency relationships.
- Connectivity analysis.

## 4.2 Weighted Graph

A weighted graph assigns a numerical value to a relationship.

Example:

```text
A ----10---- B
|            |
5            3
|            |
C ----8----- D
```

Weights might represent:

- Distance.
- Travel time.
- Cost.
- Similarity.
- Risk.
- Transaction amount.

For example, a delivery application might store:

```text
(Noida)-[:CONNECTED_TO {
    distanceKm: 15
}]->(Delhi)
```

A navigation system can use these weights to calculate routes.

## 4.3 Why Are Weights Important?

Suppose you want to travel from A to D.

There are two possible paths:

```text
A ---- 5 ---- B ---- 10 ---- D

A ---- 2 ---- C ---- 3 ----- D
```

Path 1:

\[
5 + 10 = 15
\]

Path 2:

\[
2 + 3 = 5
\]

The second path has the lower total weight.

This is the foundation of weighted shortest-path algorithms.

Common algorithms include:

- Dijkstra's algorithm.
- Bellman-Ford algorithm.
- A\* search.

These are graph algorithms, not database-specific features. Graph databases can provide ways to execute or integrate such algorithms.

---

# 5. Types of Graphs

Graph structures can be classified in several ways.

## 5.1 Simple Graph

A simple graph has:

- No self-loops.
- No multiple edges between the same pair of vertices.

Example:

```text
A ---- B
|      |
|      |
C ---- D
```

## 5.2 Cyclic Graph

A cyclic graph contains a path that eventually returns to its starting node.

Example:

```text
A ---- B
|      |
|      |
D ---- C
```

One cycle is:

```text
A -> B -> C -> D -> A
```

Real-world example:

A social network where several users follow one another in a loop.

## 5.3 Acyclic Graph

An acyclic graph contains no cycles.

Example:

```text
       CEO
        |
        v
     Manager
        |
        v
     Employee
```

A directed acyclic graph is called a DAG.

DAGs are useful for:

- Task dependencies.
- Build systems.
- Workflow execution.
- Package dependencies.
- Data processing pipelines.

For example:

```text
       Build
         |
         v
       Test
         |
         v
      Deploy
```

A task cannot be completed before its dependencies.

## 5.4 Connected Graph

A connected undirected graph has a path between every pair of vertices.

Example:

```text
A ---- B ---- C
       |
       |
       D
```

Every node can reach every other node.

If a graph has separate disconnected sections, it is a disconnected graph.

Example:

```text
A ---- B       C ---- D
```

There is no path between A and C.

---

# 6. Graph Database Data Model

Now let's understand how graph databases represent application data.

The property graph model is one of the most commonly used graph data models.

It consists of:

1. Nodes.
2. Relationships.
3. Labels.
4. Properties.

## 6.1 Property Graph Model

Consider an e-commerce application.

Entities:

- User.
- Product.
- Order.
- Category.

Relationships:

- User placed an order.
- Order contains a product.
- Product belongs to a category.
- User viewed a product.

Graph:

```text
             (User)
                |
             PLACED
                |
                v
              (Order)
                |
             CONTAINS
                |
                v
             (Product)
                |
            BELONGS_TO
                |
                v
             (Category)
```

Each node can contain properties.

For example:

```text
(:User {
    userId: 101,
    name: "Prashant"
})

(:Product {
    productId: 501,
    name: "Laptop",
    price: 65000
})
```

Relationships can also contain properties:

```text
(User)-[:PLACED {
    orderDate: "2026-11-14",
    orderValue: 65000
}]->(Order)
```

This model makes connections explicit.

## 6.2 Labels

Labels classify nodes.

Examples:

```text
:User
:Product
:Order
:Company
:Movie
```

A node may have multiple labels.

Example:

```cypher
(:User:Customer {
    name: "Prashant"
})
```

This node has both `User` and `Customer` labels.

Labels help identify the type of node when querying.

## 6.3 Relationship Types

Relationship types describe how two nodes are connected.

Examples:

```text
:FOLLOWS
:FRIENDS_WITH
:PURCHASED
:WORKS_AT
:CONTAINS
:REVIEWED
```

Unlike node labels, a relationship has one relationship type in the standard property graph model.

## 6.4 Graph Representation Example

Let's represent a small social network.

```text
         (Prashant)
          /      \
     FOLLOWS    FOLLOWS
        /          \
    (Rahul) ----> (Amit)
          FOLLOWS
```

A corresponding conceptual representation:

**Nodes:**

| Node ID | Label | Name     |
| ------- | ----- | -------- |
| 1       | User  | Prashant |
| 2       | User  | Rahul    |
| 3       | User  | Amit     |

**Relationships:**

| Source   | Relationship | Destination |
| -------- | ------------ | ----------- |
| Prashant | FOLLOWS      | Rahul       |
| Prashant | FOLLOWS      | Amit        |
| Rahul    | FOLLOWS      | Amit        |

Notice that a graph stores relationships as explicit connections rather than requiring the application to reconstruct every connection from separate foreign-key columns.

---

# 7. Graph Database vs Relational Database

This is one of the most important comparisons in this chapter.

Both databases can represent connected data, but their data models and query approaches differ.

## 7.1 Relational Representation

Suppose you have a social network.

You might create two tables.

**users**

| id  | name     |
| --- | -------- |
| 1   | Prashant |
| 2   | Rahul    |
| 3   | Amit     |

**follows**

| follower_id | following_id |
| ----------- | ------------ |
| 1           | 2            |
| 1           | 3            |
| 2           | 3            |

Here:

- `follower_id` references a user.
- `following_id` references another user.

To find everyone Prashant follows:

```sql
SELECT u.name
FROM follows f
JOIN users u
    ON f.following_id = u.id
WHERE f.follower_id = 1;
```

This works well.

Now suppose you want to find:

- Friends of friends.
- Connections three levels away.
- The shortest path between two users.
- All users connected through a particular chain.

The query becomes more complicated as the number of relationship levels grows.

## 7.2 Graph Representation

The same data can be represented as:

```text
(Prashant)-[:FOLLOWS]->(Rahul)

(Prashant)-[:FOLLOWS]->(Amit)

(Rahul)-[:FOLLOWS]->(Amit)
```

A graph query can directly traverse these relationships.

For example, in Cypher:

```cypher
MATCH (p:User {name: "Prashant"})
      -[:FOLLOWS]->(u:User)
RETURN u.name;
```

To find users followed by people Prashant follows:

```cypher
MATCH (p:User {name: "Prashant"})
      -[:FOLLOWS]->(:User)
      -[:FOLLOWS]->(u:User)
RETURN DISTINCT u.name;
```

This query describes a two-hop traversal.

## 7.3 Comparison

| Feature                   | Relational database                         | Graph database                                 |
| ------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Main structure            | Tables                                      | Nodes and relationships                        |
| Relationships             | Foreign keys and join tables                | Explicit edges                                 |
| Query language            | SQL                                         | Cypher, Gremlin, SPARQL, depending on database |
| Relationship traversal    | JOINs and recursive queries                 | Graph traversal                                |
| Schema                    | Tables and columns                          | Nodes, labels, relationships, properties       |
| Complex connected queries | Can become JOIN-heavy                       | Natural graph traversal model                  |
| Transactions              | Strong support in mature relational systems | Depends on graph database                      |
| Best fit                  | Structured business data and transactions   | Relationship-centric queries                   |

**Important:** A graph database is not automatically faster than a relational database. The advantage depends on the query pattern, graph structure, indexes, implementation, and data volume.

A relational database can handle many graph-like workloads effectively, particularly when relationship depth is limited and queries are well indexed.

---

# 8. Graph Database vs Other NoSQL Databases

Let's compare graph databases with the NoSQL databases we have already studied.

| Database type | Main focus                            | Example workload                    |
| ------------- | ------------------------------------- | ----------------------------------- |
| Key-value     | Key-based retrieval                   | Sessions and caching                |
| Document      | Document-shaped data                  | Product and campaign configuration  |
| Wide-column   | Distributed partition-based workloads | High-volume event ingestion         |
| Graph         | Relationships and traversal           | Social networks and recommendations |

Consider an e-commerce application.

**Redis:**

```text
cart:101 -> Shopping cart data
```

**MongoDB:**

```json
{
  "productId": 501,
  "name": "Laptop",
  "specifications": {
    "ram": "16GB",
    "storage": "512GB"
  }
}
```

**Cassandra:**

```text
Partition: user_id + event_date
Rows: user activity events
```

**Graph database:**

```text
(User)-[:PURCHASED]->(Product)

(User)-[:VIEWED]->(Product)

(Product)-[:SIMILAR_TO]->(Product)
```

The graph model focuses on how entities are connected.

---

# 9. Real-World Use Cases

Graph databases become valuable when relationship traversal is a major application requirement.

## 9.1 Social Networks

A social network contains millions or billions of relationships.

Examples:

- Followers.
- Friends.
- Group membership.
- Likes.
- Shares.
- User connections.

Possible queries:

- Who follows this user?
- Who are the mutual connections?
- Which users are connected within three steps?
- Which communities are highly interconnected?

Graph databases are a natural fit for these types of relationship-oriented queries.

## 9.2 Recommendation Engines

Imagine an e-commerce platform.

A user purchases:

- Laptop.
- Mouse.
- Keyboard.

Other users who purchased the same laptop also purchased a monitor.

The graph might look like:

```text
(User A) ----PURCHASED----> (Laptop)
(User A) ----PURCHASED----> (Mouse)

(User B) ----PURCHASED----> (Laptop)
(User B) ----PURCHASED----> (Monitor)
```

A recommendation system can use these connections to identify potentially relevant products.

Other relationships may include:

```text
(User)-[:VIEWED]->(Product)

(User)-[:PURCHASED]->(Product)

(Product)-[:SIMILAR_TO]->(Product)

(Product)-[:BELONGS_TO]->(Category)
```

Graph traversal and graph algorithms can help discover related products.

However, recommendation systems may also use collaborative filtering, embeddings, vector search, and machine learning. A graph database is one possible component, not a complete recommendation solution by itself.

## 9.3 Fraud Detection

Fraud detection often depends on identifying suspicious connections.

Consider:

```text
User A ----USES----> Device X
User B ----USES----> Device X
User C ----USES----> Device X

User A ----USES----> IP Address Y
User B ----USES----> IP Address Y
```

A suspicious network may involve:

- Multiple accounts sharing one device.
- Several accounts using the same payment instrument.
- Repeated transactions between connected accounts.
- Accounts linked to known fraudulent identities.

A graph model makes these relationships explicit and can help investigate suspicious connection patterns.

## 9.4 Knowledge Graphs

A knowledge graph represents real-world entities and their relationships.

Example:

```text
(Person: Albert Einstein)
          |
       BORN_IN
          |
          v
      (Germany)

(Person: Albert Einstein)
          |
      WORKED_ON
          |
          v
      (Relativity)
```

A knowledge graph can connect:

- People.
- Organizations.
- Places.
- Concepts.
- Events.
- Products.
- Scientific topics.

It is useful for search, question answering, entity discovery, and semantic relationships.

## 9.5 Network and IT Infrastructure

An infrastructure graph may represent:

```text
(Application)
     |
  RUNS_ON
     |
     v
  (Server)
     |
 CONNECTED_TO
     |
     v
  (Database)
```

This can help answer:

- Which applications depend on this server?
- Which services are affected if this database fails?
- What is the dependency chain?
- Which components are connected to a particular network?

## 9.6 Route Planning

A route-planning system can model:

- Cities as nodes.
- Roads as relationships.
- Distance or travel time as relationship properties.

Example:

```text
(Noida) ----15 km----> (Delhi)

(Noida) ----35 km----> (Meerut)

(Delhi) ----70 km----> (Agra)
```

Graph algorithms can help identify shortest or lowest-cost paths.

For large-scale navigation, specialized routing engines and spatial systems may be more suitable than a general-purpose graph database alone.

---

# 10. Popular Graph Databases and Query Technologies

Several graph database products and technologies exist.

## 10.1 Neo4j

<escape> </escape>

**Neo4j** is a popular property graph database.

It uses:

- Nodes.
- Relationships.
- Labels.
- Properties.
- Cypher query language.

Example:

```cypher
CREATE (p:User {
    name: "Prashant",
    city: "Noida"
});
```

Create another user:

```cypher
CREATE (r:User {
    name: "Rahul",
    city: "Delhi"
});
```

Create a relationship:

```cypher
MATCH (p:User {name: "Prashant"})
MATCH (r:User {name: "Rahul"})

CREATE (p)-[:FOLLOWS]->(r);
```

Retrieve the relationship:

```cypher
MATCH (p:User)-[:FOLLOWS]->(r:User)
RETURN p.name, r.name;
```

Neo4j is commonly used for:

- Fraud detection.
- Recommendation systems.
- Knowledge graphs.
- Social networks.
- Dependency analysis.

## 10.2 Amazon Neptune

Amazon Neptune is a managed graph database service.

It supports graph models and query technologies including:

- Property graph queries through Gremlin and openCypher.
- RDF graph queries through SPARQL.

It is useful when an organization wants a managed graph database integrated with AWS infrastructure.

## 10.3 JanusGraph

JanusGraph is an open-source, distributed graph database.

It can use distributed storage backends such as Cassandra and HBase, depending on the deployment configuration.

It is designed for large graph workloads that need distributed storage.

## 10.4 ArangoDB

ArangoDB is a multi-model database.

It supports multiple data models, including:

- Document.
- Key-value.
- Graph.

It can be useful when an application needs multiple data models within one database platform.

## 10.5 Query Technologies

Different graph systems use different query languages.

| Technology | Purpose                                                                       |
| ---------- | ----------------------------------------------------------------------------- |
| Cypher     | Declarative graph query language used by Neo4j and supported by other systems |
| Gremlin    | Graph traversal language from Apache TinkerPop                                |
| SPARQL     | Query language for RDF data                                                   |
| openCypher | Open specification based on the Cypher query language                         |

Do not assume every graph database supports the same query language or data model.

---

# 11. Important Graph Terminology

You should understand these terms before moving to internal graph database architecture.

| Term                | Meaning                                            |
| ------------------- | -------------------------------------------------- |
| Graph               | Collection of nodes and relationships              |
| Vertex              | Another name for a node                            |
| Edge                | Another name for a relationship                    |
| Node                | Represents an entity                               |
| Relationship        | Represents a connection between entities           |
| Label               | Identifies a node's category                       |
| Relationship type   | Describes the kind of connection                   |
| Property            | Attribute associated with a node or relationship   |
| Degree              | Number of edges connected to a vertex              |
| In-degree           | Number of incoming directed edges                  |
| Out-degree          | Number of outgoing directed edges                  |
| Path                | Sequence of connected vertices and edges           |
| Traversal           | Process of following relationships through a graph |
| Hop                 | One relationship traversal between two nodes       |
| Cycle               | Path that returns to its starting vertex           |
| Connected component | A maximal connected section of a graph             |
| DAG                 | Directed acyclic graph                             |
| Graph query         | Query that retrieves or traverses graph structures |

## 11.1 What Is Degree?

The degree of a node is the number of edges connected to it in an undirected graph.

Example:

```text
        B
        |
    C---A---D
        |
        E
```

Node A has degree 4.

In a directed graph, we distinguish:

- In-degree: Number of incoming edges.
- Out-degree: Number of outgoing edges.

Example:

```text
A ----> B ----> C
 \
  \
   ---> D
```

For node A:

- In-degree = 0.
- Out-degree = 2.

## 11.2 What Is a Path?

A path is a sequence of nodes connected by edges.

Example:

```text
A ---- B ---- C ---- D
```

One path is:

```text
A -> B -> C -> D
```

The path contains three edges, so it has three hops.

## 11.3 What Is a Traversal?

Traversal means navigating through a graph by following relationships.

Suppose:

```text
Prashant -> Rahul -> Amit -> Karan
```

Starting from Prashant:

1. Visit Rahul.
2. Follow Rahul's relationship to Amit.
3. Follow Amit's relationship to Karan.

This is a traversal through three relationships.

Traversal is one of the most important operations in graph databases.

---

# 12. When Should You Consider a Graph Database?

A graph database is worth evaluating when:

- Relationships are central to the application.
- Queries involve multiple levels of connected entities.
- The application frequently discovers paths between entities.
- Relationship patterns change or evolve.
- You need graph algorithms for network analysis.
- Complex JOIN-based relationship queries are becoming difficult to maintain or optimize.

Examples:

| Application            | Graph requirement                                   |
| ---------------------- | --------------------------------------------------- |
| Social network         | User-to-user relationships                          |
| Fraud detection        | Connections between accounts, devices, and payments |
| Recommendation engine  | User-product-item relationships                     |
| Knowledge graph        | Entity and concept relationships                    |
| IT dependency analysis | Service and infrastructure connections              |
| Network analysis       | Connected devices and routes                        |

## 12.1 When Might You Not Need One?

A graph database may be unnecessary when:

- Your data is primarily transactional.
- Relationships are simple and limited.
- Queries mainly retrieve records by primary key.
- You rarely traverse multiple relationships.
- A relational database already handles your queries efficiently.
- Your team cannot justify the operational cost of another database.

Example:

A simple employee management system may only need:

- Employees.
- Departments.
- Salaries.
- Attendance.
- Leave records.

PostgreSQL can handle this comfortably.

Introducing Neo4j just to represent employees and departments would probably add unnecessary complexity.

---

# 13. Practical Example: Build a Small Social Graph

Let's create a conceptual social graph.

## 13.1 Requirements

Users:

- Prashant.
- Rahul.
- Amit.
- Karan.

Relationships:

- Prashant follows Rahul.
- Prashant follows Amit.
- Rahul follows Karan.
- Amit follows Karan.

Graph:

```text
             Prashant
              /    \
             v      v
          Rahul    Amit
             \      /
              v    v
              Karan
```

## 13.2 Create Nodes in Neo4j

```cypher
CREATE
    (p:User {name: "Prashant"}),
    (r:User {name: "Rahul"}),
    (a:User {name: "Amit"}),
    (k:User {name: "Karan"});
```

## 13.3 Create Relationships

```cypher
MATCH (p:User {name: "Prashant"})
MATCH (r:User {name: "Rahul"})
MATCH (a:User {name: "Amit"})
MATCH (k:User {name: "Karan"})

CREATE
    (p)-[:FOLLOWS]->(r),
    (p)-[:FOLLOWS]->(a),
    (r)-[:FOLLOWS]->(k),
    (a)-[:FOLLOWS]->(k);
```

## 13.4 Find Everyone Prashant Follows

```cypher
MATCH (p:User {name: "Prashant"})
      -[:FOLLOWS]->(u:User)

RETURN u.name;
```

Expected result:

```text
Rahul
Amit
```

## 13.5 Find Users Two Hops Away

```cypher
MATCH (p:User {name: "Prashant"})
      -[:FOLLOWS*2]->(u:User)

RETURN DISTINCT u.name;
```

Expected result:

```text
Karan
```

The expression:

```cypher
[:FOLLOWS*2]
```

means traverse exactly two `FOLLOWS` relationships.

## 13.6 Find a Path Between Two Users

```cypher
MATCH path =
    (p:User {name: "Prashant"})
    -[:FOLLOWS*]->
    (k:User {name: "Karan"})

RETURN path;
```

This finds paths from Prashant to Karan using one or more `FOLLOWS` relationships.

In production, traversal depth should be bounded where appropriate. Unrestricted path searches can become expensive on large or highly connected graphs.

---

# 14. Common Interview Questions

## Q1. What is a graph database?

A graph database is a database that represents information using nodes and relationships.

It is designed for applications where relationships and traversals are important.

## Q2. What is the difference between a node and an edge?

A node represents an entity.

An edge represents a relationship between two entities.

Example:

```text
(User)-[:PURCHASED]->(Product)
```

User and Product are nodes. PURCHASED is the relationship.

## Q3. What is a property graph?

A property graph is a graph model where nodes and relationships can contain properties.

For example:

```text
(:User {name: "Prashant"})
```

And:

```text
-[:PURCHASED {amount: 2500}]->
```

## Q4. What is the difference between directed and undirected graphs?

A directed graph has relationships with a direction.

An undirected graph represents connections without a meaningful direction.

Example:

- FOLLOWS: Directed.
- FRIENDSHIP: Often modeled as undirected in business meaning.

## Q5. What is a graph traversal?

Graph traversal is the process of navigating from one node to another by following relationships.

For example:

```text
A -> B -> C -> D
```

Starting from A and following the edges to D is a traversal.

## Q6. Why use a graph database instead of PostgreSQL?

Use a graph database when the application frequently performs complex relationship traversal.

PostgreSQL can represent relationships and handle JOINs very well, but deep or variable-length relationship queries can become cumbersome for certain workloads.

A graph database makes relationships first-class and provides graph-oriented query capabilities.

## Q7. Is a graph database a NoSQL database?

Many popular graph databases are classified as NoSQL databases, but graph describes a data model rather than one universal implementation or consistency model.

Graph databases differ in query languages, storage architecture, transaction capabilities, and scalability.

## Q8. What is a path in graph theory?

A path is a sequence of vertices connected by edges.

Example:

```text
A -> B -> C
```

This path contains two edges.

## Q9. What is a cycle?

A cycle is a path that starts and ends at the same vertex.

Example:

```text
A -> B -> C -> A
```

## Q10. What is a DAG?

A DAG is a Directed Acyclic Graph.

It contains directed edges but no directed cycles.

It is useful for representing task dependencies, workflows, and build pipelines.

## Q11. What is a weighted graph?

A weighted graph assigns numerical values to edges.

These values can represent distance, cost, time, or another measurable quantity.

## Q12. Name some graph databases.

Examples:

- Neo4j.
- Amazon Neptune.
- JanusGraph.
- ArangoDB.

---

# 15. Practical Exercises

Try these exercises before moving to Part 14B.

### Exercise 1 — Model a Social Network

Create nodes for:

- User A.
- User B.
- User C.
- User D.

Create relationships:

- A follows B.
- A follows C.
- B follows D.
- C follows D.

Answer:

1. Who does A follow?
2. Who is two hops away from A?
3. How many outgoing relationships does A have?
4. Is there a path from A to D?

### Exercise 2 — Model an E-commerce Graph

Create nodes for:

- Users.
- Products.
- Categories.
- Orders.

Create relationships:

```text
User -> PLACED -> Order

Order -> CONTAINS -> Product

Product -> BELONGS_TO -> Category

User -> VIEWED -> Product
```

Think about these questions:

1. Which products has a user purchased?
2. Which users viewed a particular product?
3. Which products belong to a category?
4. Which products were purchased by users who also viewed another product?

### Exercise 3 — Identify the Best Database

Choose between PostgreSQL, MongoDB, Redis, Cassandra, and Neo4j.

| Scenario                                            | Your choice |
| --------------------------------------------------- | ----------- |
| Store payment transactions                          | ?           |
| Store user sessions                                 | ?           |
| Store campaign configuration                        | ?           |
| Store billions of user events                       | ?           |
| Find relationships between suspicious bank accounts | ?           |
| Find friends of friends                             | ?           |

The goal is to identify the database based on the access pattern, not simply the amount of data.

---

# 16. Part 14A Summary

You should now understand the foundational concepts of graph databases.

| Concept          | What to remember                           |
| ---------------- | ------------------------------------------ |
| Graph            | Collection of nodes and relationships      |
| Node             | Represents an entity                       |
| Edge             | Represents a connection                    |
| Property         | Describes a node or relationship           |
| Directed graph   | Relationships have direction               |
| Undirected graph | Relationships have no meaningful direction |
| Weighted graph   | Edges have numerical weights               |
| Unweighted graph | Edges have no numerical weights            |
| Path             | Sequence of connected nodes                |
| Traversal        | Following relationships through a graph    |
| Degree           | Number of edges connected to a node        |
| Cycle            | Path that returns to its starting node     |
| DAG              | Directed graph without cycles              |
| Property graph   | Nodes and relationships with properties    |
| Neo4j            | Popular graph database using Cypher        |

## The Most Important Mental Model

```text
Relational Database:
Data is organized into tables.
Relationships are represented through keys.

Document Database:
Data is organized into documents.
Related information can be embedded or referenced.

Wide-Column Database:
Data is organized around partitions and query patterns.

Graph Database:
Data is organized around entities and their relationships.
```

**Remember:** Graph databases are not automatically better than relational databases. Their primary advantage is making relationship-heavy queries and graph traversal natural parts of the data model.
