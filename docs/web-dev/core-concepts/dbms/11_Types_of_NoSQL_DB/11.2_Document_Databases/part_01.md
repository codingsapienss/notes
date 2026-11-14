---
sidebar_label: "Document Databases: Fundamentals"
sidebar_position: 1
---

# Document Databases: Fundamentals

## 1. Introduction to Document Databases

A document database is a type of NoSQL database that stores data as **documents instead of relational rows and columns**.

A document represents an individual record and typically contains structured data in a JSON-like format.

For example, consider a user:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "age": 25,
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  },
  "skills": ["Node.js", "MongoDB", "Redis"]
}
```

This entire structure can be stored as one document.

Unlike a traditional relational database, we do not necessarily need to divide every related piece of information into separate tables.

A document can contain:

- Simple fields.
- Nested objects.
- Arrays.
- Arrays of objects.
- Different data types.

### Simple definition

A document database stores data as structured documents, usually using JSON-like formats, and provides mechanisms to retrieve and query those documents.

### Popular document databases

| Database          | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| MongoDB           | Popular document-oriented database                           |
| Couchbase         | Distributed document database with key-value capabilities    |
| CouchDB           | Document database using JSON documents and HTTP APIs         |
| Amazon DocumentDB | Managed document database service with MongoDB compatibility |
| Firestore         | Managed document-oriented database from Google Cloud         |

We will primarily use MongoDB examples because it is widely used in Node.js backend development.

---

## 2. Why Do We Need Document Databases?

Let's understand the motivation through a practical example.

Suppose we are building an e-commerce application.

A user record contains:

```json
{
  "userId": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  },
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

In a relational database, we might organize this information into multiple tables:

```text
users
-----
user_id
name
email

addresses
---------
address_id
user_id
city
state

preferences
-----------
user_id
theme
language
```

To retrieve the complete user information, we may need JOINs.

In a document database, we can store the related information together:

```text
users collection
       |
       v
One User Document
       |
       +-- Basic Information
       |
       +-- Address
       |
       +-- Preferences
```

This makes it convenient to retrieve information that is commonly accessed together.

### Why document databases became popular

- Flexible data structures.
- Natural representation of nested objects.
- Support for arrays and embedded documents.
- Convenient mapping to application objects.
- Ability to model related data together.
- Horizontal scaling in supported distributed deployments.

**Important:** Document databases are not automatically better than relational databases. They are useful when their data model matches the application's access patterns.

---

## 3. What Is a Document?

A document is a structured record containing fields and values.

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "age": 25,
  "isActive": true,
  "skills": ["Node.js", "MongoDB"],
  "address": {
    "city": "Noida",
    "pincode": 201301
  }
}
```

Let's break it down.

| Field      | Value            | Data type         |
| ---------- | ---------------- | ----------------- |
| `_id`      | 101              | Identifier        |
| `name`     | Rahul            | String            |
| `age`      | 25               | Number            |
| `isActive` | true             | Boolean           |
| `skills`   | Array of strings | Array             |
| `address`  | Nested object    | Embedded document |

A document can represent a complete logical entity.

### 3.1 Nested documents

A document can contain another document.

Example:

```json
{
  "userId": 101,
  "name": "Rahul",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh",
    "country": "India"
  }
}
```

Here, `address` is an embedded document.

### 3.2 Arrays

A document can also contain arrays.

```json
{
  "userId": 101,
  "name": "Rahul",
  "skills": ["Node.js", "MongoDB", "Redis"]
}
```

### 3.3 Arrays of objects

Documents can contain arrays of embedded documents.

```json
{
  "userId": 101,
  "orders": [
    {
      "orderId": 5001,
      "amount": 2500,
      "status": "delivered"
    },
    {
      "orderId": 5002,
      "amount": 1500,
      "status": "pending"
    }
  ]
}
```

This structure is useful when the embedded records are naturally associated with their parent document and are commonly retrieved together.

---

## 4. Documents, Collections, and Databases

MongoDB organizes data into three main levels.

```text
Database
   |
   +-- Collection
          |
          +-- Document
          |
          +-- Document
          |
          +-- Document
```

### 4.1 Database

A database is a logical container for collections.

Example:

```text
ecommerce
```

### 4.2 Collection

A collection is a group of documents.

Examples:

```text
users
products
orders
payments
```

A collection is broadly comparable to a table in a relational database, but the data model is different.

### 4.3 Document

A document is an individual record inside a collection.

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com"
}
```

### Comparison with relational databases

| Relational Database | MongoDB                                              |
| ------------------- | ---------------------------------------------------- |
| Database            | Database                                             |
| Table               | Collection                                           |
| Row                 | Document                                             |
| Column              | Field                                                |
| Primary key         | `_id`                                                |
| JOIN                | `$lookup` or application-level relationship handling |

This comparison is useful for understanding the concepts, but collections and tables do not have identical behavior.

---

## 5. JSON vs BSON

MongoDB documents are commonly represented using JSON-like syntax.

However, MongoDB stores documents internally using a format called **BSON**.

BSON stands for Binary JSON.

### 5.1 What is JSON?

JSON stands for JavaScript Object Notation.

Example:

```json
{
  "name": "Rahul",
  "age": 25,
  "isActive": true
}
```

JSON is a text-based data interchange format.

It is widely used in APIs and JavaScript applications.

### 5.2 What is BSON?

BSON is a binary-encoded serialization format designed to represent document-like data.

MongoDB uses BSON for storing documents.

It supports additional data types beyond standard JSON.

Examples include:

- ObjectId.
- Date.
- Binary data.
- 64-bit integers.
- Decimal128.
- Regular expressions.
- Timestamps.

### 5.3 JSON vs BSON

| Feature           | JSON                            | BSON                                  |
| ----------------- | ------------------------------- | ------------------------------------- |
| Format            | Text-based                      | Binary                                |
| Human readability | Easy to read                    | Not directly human-readable           |
| Data types        | Limited standard types          | Supports additional BSON types        |
| Date type         | Usually represented as a string | Native BSON Date type                 |
| ObjectId          | No standard native type         | Supported                             |
| Binary data       | Requires encoding conventions   | Native binary type                    |
| Primary use       | Data interchange                | MongoDB document encoding and storage |

### 5.4 Example: Date

JSON:

```json
{
  "createdAt": "2026-11-14T10:30:00.000Z"
}
```

This is a string.

BSON:

```javascript
{
  createdAt: new Date();
}
```

This represents a native date value.

### 5.5 Example: ObjectId

MongoDB commonly uses ObjectId as the default `_id` type when an identifier is not supplied.

Example:

```javascript
{
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "Rahul"
}
```

An ObjectId is a BSON type, not an ordinary JSON string.

**Important:** BSON is not simply compressed JSON. It is a binary encoding with its own type system and representation.

---

## 6. Flexible Schema

One of the major characteristics of document databases is flexible schema support.

Consider two documents in the same MongoDB collection.

Document A:

```json
{
  "_id": 101,
  "name": "Rahul",
  "age": 25,
  "city": "Noida"
}
```

Document B:

```json
{
  "_id": 102,
  "name": "Amit",
  "email": "amit@example.com",
  "skills": ["Node.js", "MongoDB"]
}
```

Notice:

- Document A has `age` and `city`.
- Document B has `email` and `skills`.
- Their structures are different.

MongoDB can store both documents in the same collection.

### 6.1 Does flexible schema mean no schema?

No.

It means the database does not necessarily require every document in a collection to have an identical structure.

Your application still needs a data model.

For example, suppose your application expects every user to have:

- `name`
- `email`
- `createdAt`

You should enforce these expectations using:

- Application-level validation.
- Mongoose schemas.
- MongoDB collection validation.
- Appropriate database constraints and indexes.

### 6.2 Schema validation in MongoDB

MongoDB supports collection validation using JSON Schema.

Example:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: {
          bsonType: "string",
        },
        email: {
          bsonType: "string",
        },
        age: {
          bsonType: "int",
          minimum: 0,
        },
      },
    },
  },
});
```

Now MongoDB validates documents according to the configured rules.

### Important lesson

Flexible schema does not mean careless schema design.

A production application still needs clear rules about data structure, validation, and compatibility.

---

## 7. How Document Databases Differ from Key-Value Databases

Both are NoSQL database categories, but their data access models differ.

### 7.1 Key-value database

Example:

```text
user:101 → {
    "name": "Rahul",
    "city": "Noida"
}
```

The primary access pattern is:

```text
GET user:101
```

The database may treat the stored JSON as an opaque value.

### 7.2 Document database

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "city": "Noida"
}
```

MongoDB can query individual fields:

```javascript
db.users.find({
  city: "Noida",
});
```

It can also create an index on `city`:

```javascript
db.users.createIndex({
  city: 1,
});
```

This enables indexed field-based queries.

### Comparison

| Feature             | Key-Value Database             | Document Database                 |
| ------------------- | ------------------------------ | --------------------------------- |
| Storage             | Key-value pairs                | Structured documents              |
| Main lookup         | Key                            | Document ID and fields            |
| Nested structures   | May be stored as opaque values | Native document model             |
| Field-based queries | Limited or product-specific    | Commonly supported                |
| Secondary indexes   | Product-specific               | Commonly supported                |
| Relationships       | Usually application-managed    | Embedded documents and references |
| Example             | Redis basic string operations  | MongoDB                           |

**Key takeaway:** A document database understands the internal structure of its documents and can query individual fields.

---

## 8. MongoDB Fundamentals

MongoDB is a document-oriented NoSQL database.

It stores documents in BSON format inside collections.

Let's understand its basic operations.

### 8.1 Insert a document

```javascript
db.users.insertOne({
  name: "Rahul",
  email: "rahul@example.com",
  age: 25,
  city: "Noida",
});
```

MongoDB automatically generates an `_id` if one is not supplied.

### 8.2 Insert multiple documents

```javascript
db.users.insertMany([
  {
    name: "Amit",
    email: "amit@example.com",
    age: 28,
  },
  {
    name: "Priya",
    email: "priya@example.com",
    age: 24,
  },
]);
```

### 8.3 Find documents

Retrieve all users:

```javascript
db.users.find();
```

Retrieve one user:

```javascript
db.users.findOne({
  email: "rahul@example.com",
});
```

Retrieve users from Noida:

```javascript
db.users.find({
  city: "Noida",
});
```

### 8.4 Update a document

```javascript
db.users.updateOne(
  {
    email: "rahul@example.com",
  },
  {
    $set: {
      age: 26,
    },
  },
);
```

### 8.5 Delete a document

```javascript
db.users.deleteOne({
  email: "rahul@example.com",
});
```

These operations are the foundation of MongoDB CRUD.

We will study MongoDB querying and document modeling in more detail in subsequent chapters.

---

## 9. Embedding vs Referencing

One of the most important decisions in document database design is deciding whether related information should be stored inside the same document or separately.

This is different from simply deciding whether to normalize a relational database.

### 9.1 Embedding

Embedding means storing related information inside a parent document.

Example:

```json
{
  "_id": 101,
  "name": "Rahul",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  }
}
```

The address is embedded inside the user document.

Advantages:

- Related information can be retrieved together.
- Fewer separate queries may be required.
- Updates to a single document are atomic.
- Data locality can improve read performance.

Disadvantages:

- Documents can become large.
- Repeated data can increase duplication.
- Frequently changing embedded data can create update complexity.
- MongoDB documents have a 16 MiB maximum BSON document size.

### 9.2 Referencing

Referencing means storing related information in separate documents and connecting them using identifiers.

Users collection:

```json
{
  "_id": 101,
  "name": "Rahul",
  "addressId": 501
}
```

Addresses collection:

```json
{
  "_id": 501,
  "city": "Noida",
  "state": "Uttar Pradesh"
}
```

The user document stores the reference to the address.

Advantages:

- Avoids large embedded documents.
- Shared data can be stored once.
- Independently updated entities are easier to manage.
- Useful for many-to-many and large one-to-many relationships.

Disadvantages:

- Multiple queries may be required.
- Data retrieval can become more complicated.
- Application-level coordination may be necessary.
- `$lookup` can be used for supported join-like queries, but has execution costs.

### 9.3 Comparison

| Feature             | Embedding                              | Referencing                                               |
| ------------------- | -------------------------------------- | --------------------------------------------------------- |
| Storage             | Related data in one document           | Related data in separate documents                        |
| Retrieval           | Often one query                        | May require multiple queries or `$lookup`                 |
| Data duplication    | Can increase                           | Can reduce                                                |
| Document size       | Can become large                       | Smaller individual documents                              |
| Independent updates | Less convenient for separate lifecycle | More convenient                                           |
| Atomicity           | Single-document operations are atomic  | Multi-document operations require additional coordination |
| Suitable for        | Data commonly accessed together        | Independently managed or shared data                      |

### 9.4 When should we embed?

Consider a user's contact details:

```json
{
  "_id": 101,
  "name": "Rahul",
  "contact": {
    "email": "rahul@example.com",
    "phone": "9876543210"
  }
}
```

If contact information belongs exclusively to that user and is usually retrieved with the user profile, embedding is reasonable.

### 9.5 When should we reference?

Consider orders and products.

A product can appear in thousands of orders.

Storing a complete product document inside every order may create unnecessary duplication.

A reference can connect the order to the product:

```json
{
  "_id": 5001,
  "userId": 101,
  "productIds": [501, 502]
}
```

However, real order systems often store a snapshot of important product details such as name and price at purchase time.

This is intentional duplication because historical order information should remain stable even if the current product changes.

---

## 10. Document Databases and Relationships

A common misconception is that document databases cannot represent relationships.

They can represent relationships through:

- Embedded documents.
- References.
- Application-level queries.
- Database-supported join-like operations.

Consider:

Users:

```json
{
  "_id": 101,
  "name": "Rahul"
}
```

Orders:

```json
{
  "_id": 5001,
  "userId": 101,
  "total": 2500
}
```

The `userId` field represents a relationship.

MongoDB can perform a join-like operation using `$lookup`.

Example:

```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders",
    },
  },
]);
```

This joins users with matching orders.

### Important distinction

MongoDB supports relationships and `$lookup`, but it does not automatically behave like a relational database with universally enforced foreign-key constraints.

The application or database design must handle relationship integrity appropriately.

---

## 11. Document Database vs Relational Database

Let's compare how an e-commerce application might store user information.

### Relational model

```text
users
-----
user_id
name
email

addresses
---------
address_id
user_id
city
state
```

Retrieve a user with address:

```sql
SELECT
    u.user_id,
    u.name,
    u.email,
    a.city,
    a.state
FROM users u
LEFT JOIN addresses a
    ON a.user_id = u.user_id;
```

### Document model

```json
{
  "_id": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  }
}
```

Retrieve:

```javascript
db.users.findOne({
  _id: 101,
});
```

### Comparison

| Feature        | Relational Database                                           | Document Database                                            |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Data model     | Tables and relationships                                      | Documents and collections                                    |
| Structure      | Defined columns and data types                                | Flexible document structure                                  |
| Nested objects | Usually modeled using separate tables                         | Native support                                               |
| Relationships  | Foreign keys and JOINs                                        | Embedding, references, `$lookup`                             |
| Schema changes | Often require schema migrations                               | Different document shapes can coexist                        |
| Transactions   | Strong ACID support is common                                 | Support varies; MongoDB supports multi-document transactions |
| Querying       | SQL                                                           | Database-specific query language                             |
| Normalization  | Common design technique                                       | Often uses embedding and selective duplication               |
| Best fit       | Highly relational data and complex transactional requirements | Document-oriented data and access patterns                   |

Neither model is universally better.

---

## 12. Document Databases and Application Objects

Document databases are convenient for JavaScript applications because their data structures closely resemble JavaScript objects.

Consider a Node.js object:

```javascript
const user = {
  name: "Rahul",
  age: 25,
  address: {
    city: "Noida",
    state: "Uttar Pradesh",
  },
  skills: ["Node.js", "MongoDB"],
};
```

This maps naturally to a MongoDB document.

```javascript
await db.collection("users").insertOne(user);
```

Retrieve it:

```javascript
const user = await db.collection("users").findOne({
  name: "Rahul",
});
```

This reduces the conceptual distance between the application's data structures and the database's document model.

However, MongoDB BSON types are not identical to JavaScript types. Drivers convert values between JavaScript and BSON representations.

---

## 13. Mongoose: Document Modeling in Node.js

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.

It provides:

- Schemas.
- Models.
- Validation.
- Middleware.
- Query helpers.
- Population for references.

### 13.1 Define a schema

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  age: {
    type: Number,
    min: 0,
  },

  skills: [String],

  address: {
    city: String,
    state: String,
  },
});
```

### 13.2 Create a model

```javascript
const User = mongoose.model("User", userSchema);
```

### 13.3 Insert a document

```javascript
const user = await User.create({
  name: "Rahul",
  email: "rahul@example.com",
  age: 25,
  skills: ["Node.js", "MongoDB"],
  address: {
    city: "Noida",
    state: "Uttar Pradesh",
  },
});
```

### 13.4 Find a document

```javascript
const user = await User.findOne({
  email: "rahul@example.com",
});
```

### 13.5 Update a document

```javascript
await User.updateOne(
  {
    email: "rahul@example.com",
  },
  {
    $set: {
      age: 26,
    },
  },
);
```

### Important distinction

Mongoose schemas are application-level modeling and validation tools.

MongoDB itself does not require every collection to use Mongoose.

You can also interact with MongoDB directly through the official Node.js driver.

---

## 14. Advantages of Document Databases

### 14.1 Flexible schema

Different documents in a collection can have different fields.

This can be useful when application data evolves.

### 14.2 Natural nested data representation

Objects and arrays can be stored directly inside documents.

### 14.3 Convenient application integration

Documents map naturally to objects in languages such as JavaScript.

### 14.4 Data locality

Related data can be embedded and retrieved together.

### 14.5 Horizontal scaling

Databases such as MongoDB support sharding, allowing data to be distributed across multiple machines.

### 14.6 Rich queries

Document databases commonly support:

- Filtering.
- Sorting.
- Projection.
- Indexes.
- Aggregations.
- Nested field queries.

### 14.7 Single-document atomicity

MongoDB guarantees atomicity for operations on an individual document.

This is useful when related changes can be modeled inside one document.

---

## 15. Limitations of Document Databases

### 15.1 Data duplication

Embedding and denormalization can duplicate information.

If duplicated data changes, the application may need to update multiple documents.

### 15.2 Complex relationships

Workloads involving many interconnected entities may require multiple queries or `$lookup` operations.

### 15.3 Document size limits

MongoDB documents have a maximum BSON document size of 16 MiB.

Very large embedded arrays can become problematic.

### 15.4 Schema inconsistency

Flexible schema can lead to inconsistent document structures if validation is not designed carefully.

For example:

Document A:

```json
{
  "age": 25
}
```

Document B:

```json
{
  "age": "twenty-five"
}
```

The same field has different types.

This can complicate queries and application logic.

### 15.5 Cross-document transactions

Single-document operations are atomic, but operations spanning multiple documents require additional coordination.

MongoDB supports multi-document transactions, including transactions across shards in supported deployments, but they introduce additional cost and complexity.

### 15.6 Not ideal for every workload

A document database may not be the best choice for applications that depend heavily on complex relational queries, extensive foreign-key enforcement, or sophisticated cross-entity transactional workflows.

---

## 16. When Should You Use a Document Database?

Document databases are useful when:

1. Application data naturally maps to nested documents.
2. Related information is commonly accessed together.
3. Data structures evolve over time.
4. The application needs rich field-based queries.
5. The workload benefits from embedding and document-level atomicity.
6. The database's consistency, transaction, and scaling capabilities match the requirements.

### Common use cases

| Application                | Why a document database can fit             |
| -------------------------- | ------------------------------------------- |
| User profiles              | Nested addresses, preferences, and settings |
| Product catalogs           | Products can have different attributes      |
| Content management systems | Flexible content structures                 |
| Campaign platforms         | Different campaign configurations           |
| Event metadata             | Structured, evolving event information      |
| Product configuration      | Nested configuration objects                |
| Application settings       | Flexible nested configuration               |

### When should you avoid it?

Consider a relational database when:

- Relationships dominate the data model.
- Complex JOINs are central to the workload.
- Strong relational constraints are important.
- Cross-entity transactions are frequent.
- Complex SQL reporting is a major requirement.

These are design considerations, not absolute restrictions.

---

## 17. Real-World Example: E-Commerce Product Catalog

Suppose an e-commerce application sells different categories of products.

A laptop has:

```json
{
  "_id": 501,
  "name": "Laptop",
  "category": "Electronics",
  "price": 65000,
  "specifications": {
    "processor": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

A T-shirt has:

```json
{
  "_id": 502,
  "name": "T-Shirt",
  "category": "Clothing",
  "price": 799,
  "specifications": {
    "size": "L",
    "color": "Black",
    "material": "Cotton"
  }
}
```

Both documents can be stored in the same `products` collection.

Why is this useful?

Different product categories have different attributes.

A rigid table design could require many nullable columns or additional tables for category-specific attributes.

A document model can represent these differences naturally.

However, important fields such as product ID, category, and price should still be validated consistently.

---

## 18. Common Misconceptions

| Misconception                                             | Correct understanding                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Document databases do not have schemas                    | They support flexible schemas and can enforce validation                  |
| Every document in a collection must have identical fields | Different document shapes can coexist                                     |
| MongoDB stores documents as ordinary JSON text            | MongoDB uses BSON internally                                              |
| Document databases cannot represent relationships         | They support embedding and references                                     |
| MongoDB does not support JOINs                            | It supports `$lookup` for join-like operations                            |
| Document databases do not support transactions            | MongoDB supports multi-document transactions                              |
| Embedding is always better than referencing               | The correct choice depends on access patterns and data lifecycle          |
| MongoDB is automatically faster than PostgreSQL           | Performance depends on workload, schema, indexes, and architecture        |
| Flexible schema means validation is unnecessary           | Production systems still need validation                                  |
| Every related object should be embedded                   | Large, shared, or independently managed entities may be better referenced |

---

## 19. Interview Questions and Answers

### Q1. What is a document database?

A NoSQL database that stores data as structured documents, commonly using JSON-like data models.

### Q2. What is the difference between a document and a row?

A relational row follows a table's column structure. A document can contain nested objects, arrays, and a flexible set of fields.

### Q3. What is BSON?

BSON is a binary-encoded serialization format used by MongoDB to represent documents and additional data types.

### Q4. What is the difference between JSON and BSON?

JSON is text-based, while BSON is binary-encoded and supports additional types such as ObjectId, Date, and binary data.

### Q5. What is a collection?

A collection is a group of documents in MongoDB. It is conceptually similar to a table, but does not require every document to have the same structure.

### Q6. What is schema flexibility?

It means documents in a collection can have different structures, unless stricter validation rules are configured.

### Q7. What is embedding?

Embedding means storing related information inside a parent document.

### Q8. What is referencing?

Referencing means storing related information separately and connecting it through identifiers.

### Q9. When should you embed data?

When related data is commonly accessed together, has a suitable size, and shares a lifecycle with the parent document.

### Q10. When should you use references?

When related data is large, shared across multiple records, or independently managed.

### Q11. Does MongoDB support transactions?

Yes. MongoDB supports single-document atomicity and multi-document transactions.

### Q12. Does MongoDB support JOINs?

MongoDB supports join-like operations using `$lookup` in aggregation pipelines.

### Q13. What is the maximum BSON document size in MongoDB?

16 MiB.

### Q14. What is Mongoose?

Mongoose is an ODM library for Node.js that provides schemas, models, validation, middleware, and query helpers for MongoDB.

### Q15. Is a document database always better for JavaScript applications?

No. Although its document model maps naturally to JavaScript objects, database selection should depend on data relationships, queries, transactions, consistency, and operational requirements.

### Q16. What is the difference between a key-value database and a document database?

A basic key-value database primarily retrieves values through keys. A document database understands the internal structure of documents and supports field-based queries.

### Q17. Why should we avoid embedding unlimited arrays?

They can cause document growth, increased update costs, and eventually hit MongoDB's 16 MiB document size limit.

### Q18. What is the difference between flexible schema and schema-less?

Flexible schema means the database does not require every document to have an identical structure. It does not mean the application has no data-modeling rules.

---

## 20. Practical Exercises

### Exercise 1: Identify document components

Consider:

```json
{
  "_id": 101,
  "name": "Rahul",
  "age": 25,
  "skills": ["Node.js", "MongoDB"],
  "address": {
    "city": "Noida",
    "state": "Uttar Pradesh"
  }
}
```

Identify:

1. Document ID.
2. Scalar fields.
3. Array field.
4. Embedded document.
5. Data types of each field.

### Exercise 2: Design a document model

Design a MongoDB document for:

1. User profile.
2. Product catalog.
3. Campaign configuration.
4. Shopping cart.
5. Order.

Decide which information should be embedded and which should be referenced.

### Exercise 3: Embedding vs referencing

Consider:

```text
Users
Orders
Products
Payments
```

Answer:

1. Should an address be embedded inside a user?
2. Should every product's full document be copied into every order?
3. Should an order contain a snapshot of the purchased product name and price?
4. Should payment records be embedded in an order or stored separately?
5. What happens if a product is deleted after an order is placed?

Explain your decisions using access patterns and data lifecycle.

### Exercise 4: MongoDB CRUD

Write commands to:

1. Create a `users` collection.
2. Insert a user document.
3. Insert multiple users.
4. Find a user by email.
5. Find users from Noida.
6. Update a user's age.
7. Delete a user by `_id`.

### Exercise 5: SQL vs MongoDB

Represent this relational model as MongoDB documents:

```text
users
-----
user_id
name
email

addresses
---------
address_id
user_id
city
state
```

Create:

1. An embedded-document design.
2. A referenced-document design.

Compare the trade-offs.

---

## 21. Chapter Summary

| Concept            | Key takeaway                                       |
| ------------------ | -------------------------------------------------- |
| Document database  | Stores structured documents                        |
| Document           | Individual record containing fields and values     |
| Collection         | Group of documents                                 |
| Database           | Container for collections                          |
| BSON               | Binary-encoded format used by MongoDB              |
| Flexible schema    | Different documents can have different structures  |
| Schema validation  | Enforces expected document structures              |
| Embedding          | Stores related data inside a document              |
| Referencing        | Connects separate documents through identifiers    |
| `$lookup`          | MongoDB aggregation stage for join-like operations |
| ObjectId           | BSON identifier type commonly used for `_id`       |
| Mongoose           | Node.js ODM for MongoDB                            |
| Document atomicity | Operations on a single document are atomic         |
| Document size      | MongoDB's maximum BSON document size is 16 MiB     |

### Final mental model

```text
                 DOCUMENT DATABASE
                         |
                         v
                      DATABASE
                         |
                         v
                     COLLECTION
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
         Document 1  Document 2  Document 3
             |           |           |
             v           v           v
          Fields      Fields      Fields
             |           |           |
             v           v           v
         Objects      Arrays      Values
```

### The most important points to remember

1. Document databases store structured documents rather than relational rows.
2. Documents can contain nested objects and arrays.
3. MongoDB stores documents using BSON.
4. Flexible schema does not mean the absence of validation.
5. Embedding is useful when related data is commonly accessed together.
6. Referencing is useful when data is shared or independently managed.
7. MongoDB supports rich field-based queries and aggregation.
8. MongoDB supports `$lookup` and multi-document transactions.
9. Document databases can scale horizontally through supported distributed architectures.
10. Choose document modeling strategies according to access patterns, data lifecycle, and consistency requirements.

**Engineering takeaway:** The main advantage of a document database is not simply that it stores JSON-like data. Its real value comes from modeling related information in documents that match how the application reads and updates that information.
