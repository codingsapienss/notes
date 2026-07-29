---
sidebar_label: Introduction to NoSQL
sidebar_position: 1
---

# Introduction to NoSQL

## 1. Introduction: What Is NoSQL?

Until now, we have primarily studied relational databases such as PostgreSQL and MySQL.

Relational databases organize data into tables consisting of rows and columns. They use relationships, primary keys, foreign keys, SQL, and transactions to manage structured data.

However, modern applications have different data requirements.

Consider applications such as:

- Facebook: Users, posts, comments, likes, relationships, and feeds.
- Amazon: Products, orders, inventory, payments, and recommendations.
- Netflix: Viewing history, recommendations, and streaming activity.
- Uber: Drivers, riders, locations, and real-time trips.
- WhatsApp: Messages, conversations, and delivery status.

These applications may handle enormous data volumes, high request rates, rapidly changing data structures, and geographically distributed workloads.

A traditional relational database can handle many of these requirements. However, certain workloads may benefit from different data models and distributed database architectures.

This is where NoSQL databases become useful.

**NoSQL refers to a broad category of database systems that use data models other than, or in addition to, the traditional relational table model.**

NoSQL databases are commonly associated with:

- Flexible data models.
- Horizontal scaling.
- Distributed architectures.
- High-throughput workloads.
- Specialized query patterns.

Important: NoSQL does not mean SQL is completely absent. Some NoSQL databases support SQL-like query languages or even SQL itself.

---

## 2. Why Did NoSQL Databases Emerge?

To understand NoSQL, first understand the problems and requirements that encouraged its development.

### 2.1 Growth of Web Applications

Earlier applications often had relatively modest workloads.

A traditional architecture might look like this:

```text
          Client
            |
            v
      Backend Server
            |
            v
     Relational Database
```

As applications grew, the requirements changed.

A modern application might need to handle:

- Millions of users.
- Billions of records.
- Thousands of concurrent requests.
- Real-time updates.
- Data distributed across geographical regions.
- Large volumes of semi-structured or unstructured data.

A single relational database server can become a capacity bottleneck under some workloads.

### 2.2 Scaling Challenges

Relational databases can scale vertically.

For example:

```text
Before:

8 CPU cores
32 GB RAM
500 GB storage

After:

32 CPU cores
128 GB RAM
2 TB storage
```

However, vertical scaling has practical limits.

You cannot increase a single server's resources indefinitely.

Horizontal scaling is another approach:

```text
              Application
                   |
             Database Router
                   |
          ---------------------
          |         |         |
          v         v         v
        Server 1  Server 2  Server 3
```

NoSQL databases became popular partly because many were designed with distributed and horizontally scalable architectures in mind.

Important distinction: Relational databases can also scale horizontally through replication, sharding, distributed SQL, and other techniques. Horizontal scaling is not exclusive to NoSQL.

### 2.3 Flexible Data Requirements

Consider an application storing products.

A laptop may have:

```json
{
  "name": "Laptop",
  "brand": "Dell",
  "ram": "16GB",
  "storage": "512GB SSD",
  "processor": "Intel i7"
}
```

A mobile phone may have:

```json
{
  "name": "Smartphone",
  "brand": "Samsung",
  "screenSize": "6.7 inches",
  "battery": "5000mAh",
  "camera": "50MP"
}
```

These products do not have exactly the same attributes.

In a relational model, we could use a common products table with separate attribute tables, nullable columns, or a JSON column.

In a document database, each product can be represented as a document with its own fields.

This makes certain evolving data models easier to represent.

### 2.4 Different Workloads Need Different Data Models

Not every application needs the same kind of database.

| Application Requirement                  | Potentially Suitable Database Model |
| ---------------------------------------- | ----------------------------------- |
| User sessions and caching                | Key-value                           |
| Product catalogs with varying attributes | Document                            |
| Large distributed event workloads        | Wide-column                         |
| Social relationships and recommendations | Graph                               |
| Full-text search                         | Search engine                       |
| Financial transactions                   | Relational                          |

The database should be selected based on the access patterns, consistency requirements, data relationships, and operational constraints.

---

## 3. What Does NoSQL Actually Mean?

NoSQL is commonly expanded as:

**Not Only SQL.**

The phrase emphasizes that applications can use database models beyond relational tables.

It does not mean:

- SQL is always unavailable.
- NoSQL databases never support transactions.
- NoSQL databases cannot enforce constraints.
- NoSQL databases are always faster.
- NoSQL databases are automatically distributed.
- NoSQL databases are always schema-free.

These are common misconceptions.

For example:

- MongoDB supports multi-document ACID transactions.
- Redis supports atomic commands and transactional operations.
- Cassandra provides consistency controls and lightweight transactions with specific limitations.
- Some distributed SQL databases combine relational models with distributed architectures.

NoSQL is a category containing several different database technologies, not one uniform architecture.

---

## 4. Main Categories of NoSQL Databases

There are four major categories commonly studied in DBMS.

<text weight="semibold">1. Key-Value Databases</text>

<AsyncImage query="key value database architecture key value pairs diagram illustration" aspectRatio="16:9" width="100%" />

Data is stored as a key and its associated value.

Example:

```text
user:101 -> {"name":"Rahul","age":25}
user:102 -> {"name":"Amit","age":28}
session:abc123 -> "active"
```

Common use cases:

- Caching.
- Sessions.
- Shopping carts.
- Fast lookups.
- Counters.

Examples:

- <Entity value="Redis" category="software" disambig="In-memory key-value data store" />
- <Entity value="Amazon DynamoDB" category="software" disambig="Managed key-value and document database" />
- <Entity value="Riak KV" category="software" disambig="Distributed key-value database" />

<text weight="semibold">2. Document Databases</text>

<AsyncImage query="document database JSON BSON documents collection architecture diagram" aspectRatio="16:9" width="100%" />

Data is stored as documents, commonly using JSON-like structures.

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "country": "India"
  },
  "skills": ["Node.js", "MongoDB", "Redis"]
}
```

Common use cases:

- Product catalogs.
- User profiles.
- Content management systems.
- Applications with evolving document structures.

Examples:

- <Entity value="MongoDB" category="software" disambig="Document-oriented database" />
- <Entity value="Couchbase" category="software" disambig="Distributed document and key-value database" />
- <Entity value="Apache CouchDB" category="software" disambig="Document-oriented database" />

<text weight="semibold">3. Wide-Column Databases</text>

<AsyncImage query="wide column database column family architecture diagram Cassandra data model" aspectRatio="16:9" width="100%" />

Data is organized around rows and column families, with distributed storage and access patterns designed for large-scale workloads.

Common use cases:

- Event data.
- Time-oriented workloads.
- Large distributed write workloads.
- Activity tracking.
- Telemetry.

Examples:

- <Entity value="Apache Cassandra" category="software" disambig="Distributed wide-column database" />
- <Entity value="Google Bigtable" category="software" disambig="Managed wide-column database service" />
- <Entity value="ScyllaDB" category="software" disambig="Distributed wide-column database" />

<text weight="semibold">4. Graph Databases</text>

<AsyncImage query="graph database nodes edges relationships architecture visualization diagram" aspectRatio="16:9" width="100%" />

Data is represented as nodes and relationships (edges).

Example:

```text
       Rahul
         |
       FOLLOWS
         |
         v
        Amit
         |
       LIKES
         |
         v
       Post 101
```

Common use cases:

- Social networks.
- Recommendation engines.
- Fraud detection.
- Knowledge graphs.
- Relationship-heavy applications.

Examples:

- <Entity value="Neo4j" category="software" disambig="Graph database" />
- <Entity value="Amazon Neptune" category="software" disambig="Managed graph database service" />
- <Entity value="JanusGraph" category="software" disambig="Distributed graph database" />

### Category Comparison

| Category    | Data Model               | Primary Access Pattern        | Example   |
| ----------- | ------------------------ | ----------------------------- | --------- |
| Key-Value   | Key and value            | Lookup by key                 | Redis     |
| Document    | JSON-like documents      | Query and retrieve documents  | MongoDB   |
| Wide-Column | Rows and column families | Partition-key-oriented access | Cassandra |
| Graph       | Nodes and edges          | Traverse relationships        | Neo4j     |

We will study each category in detail in Parts 11–14.

---

## 5. Relational vs NoSQL Data Representation

Let's use the same example: storing user information.

### 5.1 Relational Database

In PostgreSQL:

```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    age INTEGER
);
```

Data:

| user_id | name  | email             | age |
| ------: | ----- | ----------------- | --: |
|     101 | Rahul | rahul@example.com |  25 |
|     102 | Amit  | amit@example.com  |  28 |

Every row follows the table's defined column structure.

The database enforces the declared types and constraints.

### 5.2 Document Database

In MongoDB:

```javascript
db.users.insertMany([
  {
    _id: 101,
    name: "Rahul",
    email: "rahul@example.com",
    age: 25,
  },
  {
    _id: 102,
    name: "Amit",
    email: "amit@example.com",
    age: 28,
    city: "Noida",
  },
]);
```

The second document has a `city` field that the first document does not have.

MongoDB allows documents in a collection to have different fields and structures, subject to any validation rules configured for that collection.

### 5.3 Main Difference

| Feature        | Relational Database             | Document Database                     |
| -------------- | ------------------------------- | ------------------------------------- |
| Main structure | Tables                          | Collections and documents             |
| Record         | Row                             | Document                              |
| Fields         | Columns defined by table schema | Fields stored in individual documents |
| Relationships  | Commonly foreign keys and JOINs | Embedding and references              |
| Schema         | Usually explicitly defined      | Flexible by default                   |
| Query language | SQL                             | Database-specific query language      |

### Important Clarification

Relational databases can also store JSON.

For example, PostgreSQL supports `JSON` and `JSONB`.

```sql
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);
```

Example data:

```json
{
  "ram": "16GB",
  "storage": "512GB SSD",
  "processor": "Intel i7"
}
```

Therefore, flexible or semi-structured data does not automatically require MongoDB.

The decision depends on the complete data model and workload.

---

## 6. Schema: Fixed vs Flexible

One of the most discussed differences between relational and document databases is schema flexibility.

### 6.1 What Is a Schema?

A schema describes the structure of data.

It defines things such as:

- Fields or columns.
- Data types.
- Constraints.
- Relationships.
- Validation rules.

### 6.2 Relational Schema

Consider:

```sql
CREATE TABLE employees (
    employee_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    salary NUMERIC(12, 2),
    department_id INTEGER
);
```

The table has a declared structure.

You cannot insert an arbitrary new column in a row without changing the table schema.

For example:

```sql
INSERT INTO employees (
    employee_id,
    name,
    salary,
    department_id
)
VALUES (
    1,
    'Rahul',
    50000,
    10
);
```

The data must follow the table's declared structure and constraints.

### 6.3 Flexible Document Schema

MongoDB documents can have different structures.

Document 1:

```json
{
  "_id": 1,
  "name": "Rahul",
  "department": "Engineering"
}
```

Document 2:

```json
{
  "_id": 2,
  "name": "Amit",
  "department": "Sales",
  "commission": 5000
}
```

Document 3:

```json
{
  "_id": 3,
  "name": "Priya",
  "department": "Engineering",
  "skills": ["Node.js", "PostgreSQL"]
}
```

All three documents can exist in the same collection.

### 6.4 Does Schema Flexibility Mean No Schema?

No.

The application still has an expected data structure.

For example, your Node.js application might expect:

```javascript
{
  name: String,
  email: String,
  age: Number
}
```

If one document contains:

```json
{
  "name": 123,
  "email": "invalid"
}
```

the application may encounter errors.

Flexible storage does not remove the need for validation.

MongoDB also supports schema validation rules that can restrict document structures and data types.

### 6.5 Schema-on-Write vs Schema-on-Read

These are useful concepts.

**Schema-on-Write**

The structure is validated when data is written.

```text
Incoming Data
     |
     v
Validate Structure
     |
     v
Write to Database
```

Traditional relational databases commonly enforce their table structure during writes.

**Schema-on-Read**

The structure is interpreted when data is read or processed.

```text
Stored Data
     |
     v
Read Data
     |
     v
Interpret / Transform
```

This approach is common in flexible data systems and data lakes.

It does not mean every NoSQL database follows schema-on-read exclusively.

### Comparison

| Feature      | Schema-on-Write                    | Schema-on-Read                             |
| ------------ | ---------------------------------- | ------------------------------------------ |
| Validation   | Primarily before or during writing | Often during reading or processing         |
| Invalid data | Can be rejected at ingestion       | May be stored and handled later            |
| Flexibility  | More controlled                    | More flexible                              |
| Risk         | Changes may require migrations     | Inconsistent data may complicate consumers |

---

## 7. Horizontal Scaling in NoSQL

Many NoSQL systems were designed with distributed storage and horizontal scaling as important architectural goals.

### 7.1 What Is Horizontal Scaling?

Horizontal scaling means increasing capacity by adding more servers.

Instead of upgrading one server:

```text
Server 1:
16 CPU
64 GB RAM
```

We add more servers:

```text
Server 1
Server 2
Server 3
Server 4
```

Workload and data can be distributed across them.

### 7.2 How Can NoSQL Distribute Data?

Consider a user collection with 30 million documents.

A distributed database might divide the data among three nodes:

```text
             NoSQL Cluster
                   |
          ---------------------
          |         |         |
          v         v         v
        Node 1   Node 2    Node 3
        Users    Users     Users
        1-10M    10-20M    20-30M
```

Each node stores a portion of the data.

This is partitioning or sharding, depending on the database's terminology and architecture.

### 7.3 Why Is It Useful?

- Storage capacity can grow across nodes.
- Requests can be distributed.
- Write workload can be distributed when the database architecture supports it.
- Failures can be handled through replication and cluster management.
- The system can expand as requirements grow.

### 7.4 Is Every NoSQL Database Automatically Horizontally Scalable?

No.

NoSQL is a broad category.

Different products have different scaling capabilities and operational requirements.

For example:

- Redis can run as a single instance or as a Redis Cluster.
- MongoDB supports sharded clusters.
- Cassandra is designed as a distributed database.
- Neo4j has its own clustering and scaling architectures.

Do not assume that every NoSQL database automatically distributes data across multiple machines.

---

## 8. NoSQL and Transactions

A common misconception is that NoSQL databases do not support transactions.

That is incorrect.

Transaction capabilities differ by database.

### 8.1 Relational Database Example

In PostgreSQL:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 2;

COMMIT;
```

Both updates can be committed atomically.

If an error occurs and the transaction is rolled back, neither update is committed.

### 8.2 MongoDB Transactions

MongoDB supports multi-document ACID transactions.

Conceptually:

```javascript
const session = client.startSession();

try {
  await session.withTransaction(async () => {
    await accounts.updateOne(
      { _id: 1 },
      { $inc: { balance: -1000 } },
      { session },
    );

    await accounts.updateOne(
      { _id: 2 },
      { $inc: { balance: 1000 } },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```

This example illustrates transaction support, not a complete production banking implementation. Real financial systems also require validation, sufficient-funds checks, idempotency, and appropriate concurrency control.

### 8.3 Different Databases, Different Transaction Models

| Database     | Transaction Capabilities                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| PostgreSQL   | Full ACID transactions                                                                                            |
| MySQL/InnoDB | ACID transactions                                                                                                 |
| MongoDB      | Single-document atomicity and multi-document transactions                                                         |
| Redis        | Atomic commands and transactions using MULTI/EXEC; not equivalent to general relational rollback semantics        |
| Cassandra    | Atomicity within a partition for ordinary mutations; lightweight transactions for specific conditional operations |

### Important Lesson

Do not evaluate a database simply by asking whether it supports transactions.

Ask:

1. What is the transaction scope?
2. What isolation guarantees exist?
3. Are multi-record transactions supported?
4. Are distributed transactions supported?
5. What is the performance cost?
6. What happens during node failure?

---

## 9. NoSQL Consistency

NoSQL databases can offer different consistency guarantees.

Some systems prioritize consistency, while others are designed to remain highly available during certain network failures.

This connects directly to the CAP theorem, which we will study in Part 9.

### 9.1 Strong Consistency

A read observes the latest successfully committed write according to the database's consistency guarantees.

Conceptually:

```text
Write:
Balance = 5000

Next Read:
Balance = 5000
```

The exact guarantee depends on the database and the read/write consistency settings.

### 9.2 Eventual Consistency

In an eventually consistent system, replicas may temporarily contain different values.

However, if updates stop and replication succeeds, replicas are expected to converge.

Example:

```text
Time 1:

Node 1: status = ACTIVE
Node 2: status = INACTIVE


Time 2:

Node 1: status = ACTIVE
Node 2: status = ACTIVE
```

There was a temporary inconsistency, but the replicas eventually converged.

### 9.3 Is Eventual Consistency Always Bad?

No.

Consider a social media like counter.

If the displayed count takes a short time to update, that may be acceptable.

However, a financial balance or inventory reservation may require stronger guarantees.

Consistency requirements depend on the business operation.

### Examples

| Use Case              | Possible Consistency Requirement                            |
| --------------------- | ----------------------------------------------------------- |
| Banking balance       | Strong transactional guarantees                             |
| Inventory reservation | Strong coordination or carefully designed reservation logic |
| Social media likes    | Eventual consistency may be acceptable                      |
| Analytics dashboard   | Delayed consistency is often acceptable                     |
| User profile display  | Depends on whether stale reads are acceptable               |

---

## 10. Advantages of NoSQL Databases

### 10.1 Flexible Data Models

Useful when records have varying attributes or structures.

### 10.2 Horizontal Scaling

Many NoSQL databases support distributing data and workload across multiple nodes.

### 10.3 Specialized Data Models

Different NoSQL categories are optimized for different access patterns.

For example:

- Redis for key-based access.
- MongoDB for document-oriented access.
- Cassandra for distributed wide-column workloads.
- Neo4j for relationship traversal.

### 10.4 High Throughput for Suitable Workloads

Some NoSQL systems can handle high read/write throughput when data modeling and access patterns match their architecture.

### 10.5 Distributed Architecture

Many NoSQL databases include features for replication, partitioning, and cluster management.

---

## 11. Disadvantages and Tradeoffs of NoSQL

NoSQL is not automatically better than relational databases.

### 11.1 Different Query Capabilities

Some NoSQL databases do not provide the same general-purpose JOIN capabilities as relational databases.

Applications may need to:

- Embed related data.
- Maintain references.
- Retrieve records in multiple operations.
- Denormalize data.

### 11.2 Data Duplication

Document and wide-column models may duplicate data to optimize reads.

This creates synchronization responsibilities.

### 11.3 Consistency Tradeoffs

Some distributed databases allow stale reads or weaker consistency under particular configurations.

The application must understand these guarantees.

### 11.4 Vendor-Specific Query Languages

Different NoSQL databases have different query APIs and data models.

Knowledge of MongoDB does not automatically transfer to Cassandra or Neo4j.

### 11.5 Operational Complexity

Distributed databases may require:

- Cluster management.
- Replication monitoring.
- Partition management.
- Failure recovery.
- Capacity planning.
- Consistency configuration.

### 11.6 Not Every Workload Benefits

A small business application with relational data, complex JOINs, and transactional requirements may be better served by PostgreSQL.

Introducing NoSQL without a clear requirement adds complexity without necessarily improving performance.

---

## 12. Real-World Backend Example

Let's design a simplified application using Node.js.

Suppose the application has:

- User accounts.
- Products.
- Shopping carts.
- Orders.
- Sessions.
- Product search.

We can use different database technologies for different responsibilities.

```text
                   CLIENT
                      |
                      v
                Node.js Backend
                      |
        --------------------------------
        |              |               |
        v              v               v
     PostgreSQL      MongoDB          Redis
        |              |               |
        v              v               v
   Orders, Payments  Product Data    Sessions,
   Users, Inventory  Flexible Data   Cache
                      |
                      v
                 Search Engine
                      |
                      v
                  Product Search
```

### Responsibility Breakdown

| Component             | Technology                  | Responsibility                            |
| --------------------- | --------------------------- | ----------------------------------------- |
| Transactional data    | PostgreSQL                  | Orders, payments, users, inventory        |
| Flexible product data | MongoDB                     | Product documents with varying attributes |
| Cache                 | Redis                       | Sessions, frequently accessed data        |
| Search                | Elasticsearch or OpenSearch | Full-text search and filtering            |

This architecture is an example of polyglot persistence: using multiple database technologies within one application.

It is not mandatory. PostgreSQL alone could handle many of these requirements, including JSON storage and full-text search.

The decision depends on workload and operational needs.

### Example: Product Retrieval

A Node.js endpoint might retrieve product data from MongoDB:

```javascript
app.get("/products/:id", async (req, res) => {
  try {
    const product = await db.collection("products").findOne({
      _id: req.params.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
```

The database choice is separate from the HTTP framework. Node.js can communicate with PostgreSQL, MongoDB, Redis, and many other systems.

---

## 13. When Should You Choose NoSQL?

NoSQL may be a good choice when:

- The data model fits a document, key-value, wide-column, or graph structure.
- The application needs flexible records.
- Access patterns are predictable and align with the database's strengths.
- Distributed storage and horizontal scaling are important.
- The workload benefits from a specialized database model.

Examples:

| Requirement                              | Possible Choice |
| ---------------------------------------- | --------------- |
| Fast session lookup                      | Redis           |
| Product catalog with variable attributes | MongoDB         |
| Large distributed event storage          | Cassandra       |
| Social relationship traversal            | Neo4j           |
| Complex financial transactions           | PostgreSQL      |

### When Should You Avoid Choosing NoSQL?

Avoid selecting a NoSQL database simply because:

- It is popular.
- It is considered modern.
- Someone says it is faster.
- You want to avoid learning SQL.
- You assume relational databases cannot scale.

If your application requires complex relationships, multi-table queries, and strong transactional constraints, a relational database may be the better choice.

---

## 14. Common Misconceptions

### Misconception 1: NoSQL means no SQL.

Incorrect.

NoSQL is commonly understood as Not Only SQL. Some NoSQL systems support SQL-like languages.

### Misconception 2: NoSQL databases do not support transactions.

Incorrect.

MongoDB supports multi-document ACID transactions. Other systems provide different forms of atomicity and transactional guarantees.

### Misconception 3: NoSQL is always faster than SQL.

Incorrect.

Performance depends on the workload, data model, query pattern, indexes, hardware, and implementation.

### Misconception 4: NoSQL databases have no schema.

Incorrect.

They may have flexible schemas, but applications still need data validation and consistent data structures.

### Misconception 5: SQL databases cannot scale horizontally.

Incorrect.

Relational databases support various horizontal scaling approaches, including replication, sharding, and distributed SQL architectures.

### Misconception 6: All NoSQL databases are distributed.

Incorrect.

Distribution and clustering capabilities vary by product and deployment.

### Misconception 7: NoSQL is only for unstructured data.

Incorrect.

NoSQL databases can store highly structured data as well.

### Misconception 8: Choosing NoSQL removes the need for data modeling.

Incorrect.

NoSQL data modeling is still essential. In many systems, modeling around query patterns is especially important.

---

## 15. Interview Questions

### Q1. What is NoSQL?

NoSQL refers to a category of database systems that use non-relational data models or extend beyond the traditional relational model.

### Q2. What does NoSQL stand for?

It is commonly expanded as Not Only SQL.

### Q3. Why did NoSQL databases become popular?

The growth of large-scale applications increased demand for flexible data models, distributed architectures, horizontal scaling, and specialized data access patterns.

### Q4. What are the four major types of NoSQL databases?

1. Key-value databases.
2. Document databases.
3. Wide-column databases.
4. Graph databases.

### Q5. What is a document database?

A database that stores records as documents, commonly using JSON-like structures.

### Q6. What is a key-value database?

A database that stores values associated with unique keys and commonly supports efficient key-based retrieval.

### Q7. What is a wide-column database?

A distributed database model organized around rows and column families, often designed for large-scale workloads and partition-key-based access.

### Q8. What is a graph database?

A database that represents entities as nodes and their relationships as edges.

### Q9. What is schema flexibility?

The ability for records to have different fields or structures without requiring every record to follow one rigid table definition.

### Q10. Does schema flexibility mean no validation?

No. Validation can be enforced by the database, application, or both.

### Q11. What is horizontal scaling?

Increasing system capacity by adding more servers and distributing workload.

### Q12. Does every NoSQL database support horizontal scaling?

No. Scaling capabilities depend on the database product and architecture.

### Q13. Do NoSQL databases support ACID?

Some do. The exact transactional capabilities and guarantees vary by database.

### Q14. What is eventual consistency?

A consistency model in which replicas may temporarily disagree but are expected to converge when updates stop and replication succeeds.

### Q15. Can PostgreSQL store JSON data?

Yes. PostgreSQL supports both JSON and JSONB data types.

### Q16. Can PostgreSQL scale horizontally?

Yes. Techniques include replication, sharding, and distributed SQL architectures, although the implementation and complexity vary.

### Q17. When would you choose MongoDB over PostgreSQL?

When the document model and access patterns provide a clear advantage, such as records with varying attributes that are commonly retrieved and updated as complete documents. It is not automatically better for every flexible-data requirement.

### Q18. What is polyglot persistence?

Using multiple database technologies within one application, selecting each according to the needs of a particular workload.

---

## 16. Practical Learning Exercise

### Exercise A: Identify the Database Type

Identify which NoSQL category is suitable for each requirement.

| Requirement                                   | Expected Category |
| --------------------------------------------- | ----------------- |
| Store user sessions using session IDs         | Key-Value         |
| Store product documents with varying fields   | Document          |
| Store billions of distributed activity events | Wide-Column       |
| Store relationships between users and friends | Graph             |
| Store frequently accessed cache entries       | Key-Value         |

### Exercise B: Relational vs Document Modeling

You need to store these product types:

**Laptop**

```json
{
  "name": "Laptop",
  "brand": "Dell",
  "ram": "16GB",
  "storage": "512GB"
}
```

**Mobile**

```json
{
  "name": "Mobile",
  "brand": "Samsung",
  "battery": "5000mAh",
  "camera": "50MP"
}
```

Questions:

1. How would you model this in PostgreSQL?
2. How would you model this in MongoDB?
3. What are the advantages of each approach?
4. How would you validate the product structure?
5. Which approach is better if products have many different attributes?

There is no universal answer. Consider the query patterns and relationships.

### Exercise C: Choose a Database

Choose an appropriate database model for each application:

1. Banking application.
2. Shopping cart.
3. Social network.
4. Product catalog.
5. Real-time analytics event store.
6. User session management.

Explain your reasoning rather than memorizing product names.

### Exercise D: Challenge Your Understanding

Answer these without looking at the notes:

1. Does NoSQL mean no schema?
2. Can MongoDB support transactions?
3. Can PostgreSQL store JSON?
4. Can SQL databases scale horizontally?
5. Does replication automatically increase write capacity?
6. Are all NoSQL databases distributed?
7. Is NoSQL always faster?

---

## 17. Chapter Summary

| Concept              | Key Takeaway                                                    |
| -------------------- | --------------------------------------------------------------- |
| NoSQL                | Database systems beyond the traditional relational model        |
| Not Only SQL         | NoSQL does not necessarily mean SQL is unavailable              |
| Key-Value            | Stores values associated with keys                              |
| Document             | Stores JSON-like documents                                      |
| Wide-Column          | Organizes distributed data around rows and column families      |
| Graph                | Stores entities and relationships                               |
| Flexible Schema      | Documents or records can have varying structures                |
| Schema-on-Write      | Validate structure when writing data                            |
| Schema-on-Read       | Interpret or validate structure during reading or processing    |
| Horizontal Scaling   | Add servers to distribute workload                              |
| Strong Consistency   | Reads observe writes according to strong consistency guarantees |
| Eventual Consistency | Replicas can temporarily disagree and later converge            |
| Polyglot Persistence | Use multiple database technologies for different workloads      |

### The Most Important Mental Model

```text
NO SQL / RELATIONAL DATABASE CHOICE
              |
              v
       Understand Workload
              |
      ---------------------
      |         |         |
      v         v         v
   Data      Queries   Consistency
   Model     Patterns  Requirements
      |         |         |
      ---------------------
              |
              v
       Choose Database Model
              |
      -------------------------
      |          |            |
      v          v            v
   Key-Value  Document   Wide-Column
                           |
                         Graph
```

**The central lesson: NoSQL is not a replacement for SQL. It is an additional set of database models designed to solve different data-management problems.**
