---
sidebar_label: "Key-Value Databases: Fundamentals"
sidebar_position: 1
---

# Key-Value Databases: Fundamentals

## 1. Introduction to Key-Value Databases

A key-value database is a type of NoSQL database that stores data as a collection of **key-value pairs**.

Each record consists of two main components:

- **Key:** A unique identifier used to locate the data.
- **Value:** The data associated with that key.

Think of it like a dictionary in JavaScript.

```javascript
const user = {
  "user:101": {
    name: "Rahul",
    email: "rahul@example.com",
  },

  "user:102": {
    name: "Amit",
    email: "amit@example.com",
  },
};
```

Here:

| Key        | Value                                           |
| ---------- | ----------------------------------------------- |
| `user:101` | `{ name: "Rahul", email: "rahul@example.com" }` |
| `user:102` | `{ name: "Amit", email: "amit@example.com" }`   |

The database uses the key to locate the corresponding value.

Unlike a relational database, a basic key-value database does not require the value to follow a predefined table structure.

### Simple definition

A key-value database stores information as key-value pairs and primarily retrieves data using its key.

---

## 2. Why Do We Need Key-Value Databases?

Consider a typical application built using PostgreSQL.

Suppose every time a user visits a website, we need to retrieve their session information.

A relational approach might involve a query:

```sql
SELECT *
FROM sessions
WHERE session_id = 'abc123';
```

This is perfectly valid.

However, some workloads need extremely frequent, simple lookups:

- Retrieve a user session.
- Check whether a user is logged in.
- Retrieve cached API responses.
- Check whether a verification code exists.
- Count requests for rate limiting.
- Store temporary application state.

For these workloads, we may not need relational tables, complex JOINs, or flexible SQL queries.

A key-value database provides a simple access pattern:

```text
Key → Value
```

Example:

```text
session:abc123 → {"userId":101,"role":"admin"}
```

The application retrieves the value directly using the key.

### Main motivation

Key-value databases are useful when an application needs fast access to data using a known identifier.

They are particularly effective for workloads involving frequent reads and writes of individual keys.

---

## 3. How Does a Key-Value Database Work?

Let's understand the internal concept using a simple example.

Suppose we have the following records:

```text
user:101 → {"name":"Rahul","age":25}

user:102 → {"name":"Amit","age":28}

user:103 → {"name":"Priya","age":24}
```

Conceptually, the database maintains a mapping between keys and their corresponding values.

```text
                 Key-Value Database
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
          user:101    user:102    user:103
             |           |           |
             v           v           v
          Rahul        Amit        Priya
```

When the application requests:

```text
GET user:102
```

The database uses the key `user:102` to locate its associated value.

It does not need to search through every user record.

The exact lookup mechanism depends on the database implementation. It may use hash tables, in-memory structures, log-structured storage, or other indexing mechanisms.

### Basic operations

Most key-value databases provide operations conceptually similar to:

| Operation | Purpose                                                         |
| --------- | --------------------------------------------------------------- |
| PUT / SET | Store a value for a key                                         |
| GET       | Retrieve a value using its key                                  |
| DELETE    | Remove a key-value pair                                         |
| EXISTS    | Check whether a key exists                                      |
| UPDATE    | Replace or modify a stored value, depending on the database API |

These operations form the foundation of key-value storage.

---

## 4. Understanding Keys

The key is the most important part of a key-value database.

It identifies the value that the application wants to access.

### 4.1 Unique keys

Each key should identify one logical entry within the relevant keyspace.

Example:

```text
user:101
user:102
user:103
```

If two records use the same key, a typical SET operation replaces the existing value rather than creating a second independent record.

### 4.2 Meaningful key naming

A good key naming convention makes application data easier to organize.

Examples:

```text
user:101
user:102

session:abc123
session:xyz789

product:501
product:502

cart:101
cart:102

otp:9876543210
```

The prefix identifies the type of information.

The remaining part identifies the particular record.

This is especially useful when multiple features share one key-value database.

### 4.3 Composite keys

Sometimes a key can contain multiple identifiers.

Example:

```text
user:101:cart
user:101:session
user:101:preferences
```

These keys identify different types of information belonging to the same user.

### 4.4 Good key design

A good key should generally be:

- Unique within its namespace.
- Predictable for the application.
- Easy to construct.
- Consistent in naming.
- Efficient to store and transmit.

Avoid unnecessarily long keys because keys consume storage and may be transmitted repeatedly during operations.

---

## 5. Understanding Values

The value is the information stored against a key.

Depending on the database, values may be:

- Strings.
- Numbers.
- Binary data.
- Serialized JSON.
- Other database-specific data structures.

Example:

```text
Key:
user:101

Value:
{
    "name": "Rahul",
    "email": "rahul@example.com",
    "age": 25
}
```

### 5.1 Values as strings

A simple key-value database may store:

```text
name:101 → Rahul
```

### 5.2 Values as JSON

Some key-value databases allow the application to store serialized JSON:

```text
user:101 → {"name":"Rahul","age":25}
```

The application serializes the object before storing it and deserializes it after retrieving it.

### Node.js example

```javascript
const user = {
  name: "Rahul",
  age: 25,
  email: "rahul@example.com",
};

// Convert object into JSON string
const value = JSON.stringify(user);

// Convert JSON string back into an object
const parsedUser = JSON.parse(value);
```

Important: Storing JSON as a string does not automatically make a database a document database.

In a basic key-value model, the value is generally retrieved through its key. The database may not understand or index individual fields inside that value.

Some products provide additional structured-value features, but those are product-specific capabilities.

---

## 6. Key-Value Database vs Relational Database

Let's compare how the same information is stored in both systems.

### 6.1 Relational database

Consider a PostgreSQL table:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    age INT
);
```

Insert data:

```sql
INSERT INTO users (user_id, name, email, age)
VALUES
(101, 'Rahul', 'rahul@example.com', 25),
(102, 'Amit', 'amit@example.com', 28);
```

Retrieve:

```sql
SELECT *
FROM users
WHERE user_id = 101;
```

The database understands the table structure and individual columns.

### 6.2 Key-value database

Conceptually:

```text
user:101 → {"name":"Rahul","email":"rahul@example.com","age":25}

user:102 → {"name":"Amit","email":"amit@example.com","age":28}
```

Retrieve:

```text
GET user:101
```

The application retrieves the value using the key.

### Comparison

| Feature        | Relational Database      | Basic Key-Value Database                       |
| -------------- | ------------------------ | ---------------------------------------------- |
| Data structure | Tables, rows, columns    | Key-value pairs                                |
| Primary access | SQL queries              | Key-based operations                           |
| Schema         | Defined table structure  | Usually flexible values                        |
| Relationships  | Foreign keys and JOINs   | Usually managed by application                 |
| Querying       | Rich filtering and JOINs | Primarily key-based                            |
| Transactions   | Common ACID support      | Varies by product                              |
| Indexing       | Multiple index types     | Often key-oriented; additional indexing varies |
| Typical use    | Relational business data | Sessions, cache, counters, temporary state     |

**Important:** This is a comparison with a basic key-value model. Some key-value products provide transactions, secondary indexes, queries, or more advanced data structures.

---

## 7. Key-Value Databases vs Document Databases

These two NoSQL categories can look similar because both may store JSON-like values.

However, their data access models differ.

### 7.1 Key-value database

Example:

```text
user:101 → {
    "name": "Rahul",
    "age": 25,
    "city": "Noida"
}
```

The primary operation is:

```text
GET user:101
```

The application already knows the key.

### 7.2 Document database

Example document:

```json
{
  "_id": 101,
  "name": "Rahul",
  "age": 25,
  "city": "Noida"
}
```

A document database may support queries such as:

```javascript
db.users.find({
  city: "Noida",
});
```

The database can query individual document fields using its query engine and indexes.

### Comparison

| Feature             | Key-Value Database                 | Document Database                       |
| ------------------- | ---------------------------------- | --------------------------------------- |
| Main storage model  | Key and value                      | Structured documents                    |
| Primary lookup      | Key                                | Document ID and field queries           |
| Value structure     | May be opaque to the database      | Database understands document fields    |
| Field-based queries | Limited or product-specific        | Commonly supported                      |
| Indexing            | Usually key-oriented               | Often supports secondary indexes        |
| Schema              | Flexible                           | Flexible or schema validation supported |
| Example             | Redis basic string key-value usage | MongoDB                                 |

### Important distinction

If you store JSON in a key-value database, that alone does not make it a document database.

The important difference is how the database understands and queries the stored value.

---

## 8. Redis: A Practical Key-Value Database

One of the most popular key-value databases is Redis.

<text>**Redis**</text> is an in-memory data structure store commonly used for caching, session management, counters, queues, and other low-latency workloads.

<text>Official website:</text> https://redis.io/

Redis is often described as a key-value database, but it supports more than simple string values.

It provides data structures such as:

- Strings.
- Lists.
- Sets.
- Sorted sets.
- Hashes.
- Streams.
- Bitmaps.
- HyperLogLogs.

We will study Redis architecture and data structures in greater detail in later chapters.

For now, focus on its key-value fundamentals.

### 8.1 Basic Redis SET operation

```bash
SET user:101 "Rahul"
```

This stores:

```text
user:101 → Rahul
```

### 8.2 GET operation

```bash
GET user:101
```

Output:

```text
"Rahul"
```

### 8.3 Update a value

```bash
SET user:101 "Prashant"
```

The existing value is replaced.

### 8.4 Delete a key

```bash
DEL user:101
```

### 8.5 Check whether a key exists

```bash
EXISTS user:101
```

Redis returns the number of matching existing keys.

For a single key:

- `1` means it exists.
- `0` means it does not exist.

---

## 9. TTL — Time to Live

TTL is one of the most useful features in key-value databases.

TTL stands for **Time To Live**.

It specifies how long a key should remain available before it expires.

Example:

```bash
SET otp:9876543210 482913 EX 300
```

This stores an OTP with an expiration time of 300 seconds.

After five minutes, Redis automatically treats the key as expired and removes it according to its expiration mechanism.

### Why is TTL useful?

Consider an OTP system.

An OTP should not remain valid forever.

Without expiration:

```text
otp:9876543210 → 482913
```

The key might remain stored until explicitly deleted or overwritten.

With TTL:

```text
otp:9876543210 → 482913
TTL: 300 seconds
```

The key automatically expires.

### More Redis TTL commands

```bash
# Set expiration on an existing key
EXPIRE otp:9876543210 300

# Check remaining TTL
TTL otp:9876543210

# Remove expiration
PERSIST otp:9876543210
```

Redis TTL responses have special values:

- Positive number: Remaining time in seconds.
- `-1`: Key exists but has no expiration.
- `-2`: Key does not exist.

### Real-world TTL use cases

| Use case                     | Example TTL             |
| ---------------------------- | ----------------------- |
| OTP                          | 2–5 minutes             |
| Password reset token         | 10–30 minutes           |
| Temporary session            | Based on session policy |
| API response cache           | 1–10 minutes            |
| Rate-limit counter           | 60 seconds              |
| Temporary verification state | Application-specific    |

TTL is useful for temporary information because the application does not need to manually delete every expired entry.

---

## 10. Real-World Backend Use Cases

Key-value databases are especially useful when the application can identify the required information using a key.

### 10.1 Session management

Suppose a user logs into an application.

The server creates a session:

```text
session:abc123 → {
    "userId": 101,
    "role": "admin"
}
```

When the user makes another request:

1. The browser sends the session identifier.
2. Node.js receives the request.
3. The backend retrieves the session using its key.
4. The application checks the session information.
5. The request is authorized or rejected.

Example:

```bash
SET session:abc123 '{"userId":101,"role":"admin"}' EX 3600
```

This session expires after one hour.

### 10.2 Caching

Suppose your backend frequently retrieves product information from PostgreSQL.

Instead of querying PostgreSQL for every request, you can cache the result.

```text
Key:
product:501

Value:
{
    "name": "Laptop",
    "price": 65000
}
```

A simplified request flow:

```text
              Client Request
                    |
                    v
              Node.js API
                    |
                    v
               Check Redis
                    |
              +-----+-----+
              |           |
            Found       Not Found
              |           |
              v           v
         Return Cache  Query PostgreSQL
                          |
                          v
                      Store in Redis
                          |
                          v
                      Return Data
```

This is commonly called the cache-aside pattern.

It can reduce repeated database queries and improve response times.

However, the application must handle cache expiration and invalidation.

### 10.3 Rate limiting

Suppose an API allows a maximum of 100 requests per minute per user.

We can store a request counter:

```text
rate_limit:user:101 → 45
```

Each request increments the counter.

Redis supports an atomic increment command:

```bash
INCR rate_limit:user:101
```

Set an expiration for the time window:

```bash
EXPIRE rate_limit:user:101 60
```

The backend checks the counter and rejects requests after the limit.

For a production rate limiter, incrementing and setting expiration should be coordinated safely. A Lua script or another atomic operation can prevent race conditions between these commands.

### 10.4 Shopping cart

A shopping cart can be stored using a key associated with the user.

```text
cart:user:101 → {
    "items": [
        {
            "productId": 501,
            "quantity": 2
        },
        {
            "productId": 502,
            "quantity": 1
        }
    ]
}
```

The application retrieves the cart using:

```bash
GET cart:user:101
```

This can be useful for temporary or frequently accessed cart state.

However, the final order and payment records should be stored in an appropriate durable transactional system.

### 10.5 OTP verification

An OTP can be stored using a phone number or verification identifier.

```text
otp:9876543210 → 482913
```

The backend:

1. Generates the OTP.
2. Stores it with a short TTL.
3. Sends it to the user.
4. Retrieves it during verification.
5. Compares it with the submitted value.
6. Deletes or invalidates it after successful verification.

For production systems, OTPs should be protected against brute-force attempts and should not be stored as plaintext when the threat model requires secure verification.

### 10.6 Feature flags

Suppose an application has a feature that should be enabled only for selected users.

```text
feature:new_dashboard:user:101 → true
feature:new_dashboard:user:102 → false
```

The backend checks the key before enabling the feature.

This can be useful for gradual feature rollouts.

---

## 11. Key-Value Databases and In-Memory Storage

Many key-value databases are optimized for in-memory access.

Redis is a prominent example.

### What is in-memory storage?

In-memory storage means that the database keeps data structures in RAM for fast access.

Compare:

```text
Disk-based storage:
Application → Database → Disk

In-memory storage:
Application → Database → RAM
```

RAM access is generally much faster than accessing persistent storage.

However, RAM is:

- More expensive per GB than many storage options.
- Limited by available machine memory.
- Volatile unless persistence mechanisms are used.

### Does in-memory mean data is never stored on disk?

No.

Redis supports persistence mechanisms, including:

- RDB snapshots.
- Append Only File (AOF).

These mechanisms help preserve data across restarts and failures.

We will cover persistence and internal architecture in more detail in Part 11B.

### Important distinction

Not every key-value database is in-memory.

For example, Amazon DynamoDB is a managed key-value and document database service that uses durable distributed storage.

Therefore:

**Key-value describes a data model and access pattern, not necessarily a storage medium.**

---

## 12. Advantages of Key-Value Databases

### 12.1 Fast key-based access

The database can retrieve values directly using known keys.

### 12.2 Simple data model

The basic model is straightforward:

```text
Key → Value
```

Developers do not need to design relational tables for every simple lookup workload.

### 12.3 Flexible values

Values can often be strings, serialized objects, binary data, or other supported types.

### 12.4 Horizontal scaling

Some key-value databases support partitioning and distributing keys across multiple nodes.

This allows data and workload to be distributed across a cluster.

### 12.5 TTL support

Temporary records can expire automatically.

### 12.6 Useful for high-frequency operations

Common workloads include:

- Session lookups.
- Caching.
- Counters.
- Rate limiting.
- Temporary application state.

---

## 13. Limitations of Key-Value Databases

Key-value databases are not suitable for every type of application.

### 13.1 Limited querying

In a basic key-value database, you generally need to know the key.

Suppose you store:

```text
user:101 → {"name":"Rahul","city":"Noida"}

user:102 → {"name":"Amit","city":"Delhi"}

user:103 → {"name":"Priya","city":"Noida"}
```

Now suppose you want:

```text
Find all users whose city is Noida.
```

A basic key-value database may not support efficient field-based queries over these values.

You may need to:

- Retrieve records individually.
- Maintain a separate index.
- Store additional lookup keys.
- Use a database with secondary-query capabilities.

### 13.2 Relationships are not automatically managed

A basic key-value database does not provide relational foreign keys and JOINs in the same way as PostgreSQL.

The application usually manages relationships.

### 13.3 Data duplication

The application may duplicate selected information to make retrieval efficient.

This can introduce synchronization problems.

### 13.4 Complex queries are difficult

Operations involving:

- Multiple conditions.
- Joins.
- Aggregations.
- Relationships.
- Ad hoc filtering.

May be difficult or unsupported in a basic key-value model.

### 13.5 Memory limitations

For in-memory systems, the amount of data that can be held in RAM is constrained by available memory and cost.

Persistence and eviction policies help manage storage, but they do not remove the underlying resource constraints.

---

## 14. Popular Key-Value Databases and Systems

| Database / System | Category and characteristics                                                           | Common use cases                                        |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Redis             | In-memory data structure store; supports key-value operations and rich data structures | Cache, sessions, counters, rate limiting                |
| Amazon DynamoDB   | Managed distributed key-value and document database                                    | Application state, user preferences, high-scale lookups |
| Riak KV           | Distributed key-value database                                                         | Distributed key-value workloads                         |
| Aerospike         | Distributed database supporting key-value access and additional data models            | Low-latency, high-throughput applications               |
| Memcached         | Distributed in-memory caching system                                                   | Simple caching                                          |

### Important distinction: Memcached vs Redis

Both are commonly used for caching.

However:

| Feature                    | Redis                                      | Memcached                                    |
| -------------------------- | ------------------------------------------ | -------------------------------------------- |
| Basic key-value operations | Yes                                        | Yes                                          |
| Data structures            | Multiple built-in structures               | Primarily simple values                      |
| Persistence                | Supported                                  | Not designed as durable persistent storage   |
| TTL                        | Yes                                        | Yes                                          |
| Replication                | Supported                                  | Not a native equivalent of Redis replication |
| Typical role               | Cache and broader in-memory data workloads | Distributed caching                          |

Memcached is generally classified as a caching system rather than a general-purpose persistent database.

---

## 15. When Should You Use a Key-Value Database?

Use a key-value database when:

1. You know the key required to retrieve information.
2. The application performs frequent simple reads and writes.
3. Low-latency access is important.
4. You do not need complex relational queries for that workload.
5. The data fits the database's storage and consistency model.
6. The system benefits from expiration, counters, or other key-oriented operations.

### Good examples

| Requirement                             | Suitable use                                      |
| --------------------------------------- | ------------------------------------------------- |
| Store user sessions                     | Key-value database                                |
| Cache product details                   | Key-value database                                |
| Store temporary OTPs                    | Key-value database                                |
| API rate limiting                       | Key-value database                                |
| Store frequently accessed configuration | Key-value database                                |
| Maintain a temporary leaderboard        | Key-value database with sorted-set support        |
| Store complex financial relationships   | Relational database is generally more appropriate |
| Run complex analytical queries          | Analytical database is generally more appropriate |

### When should you avoid a basic key-value model?

Avoid relying on a basic key-value model as the primary data store when the application requires:

- Complex ad hoc queries.
- Many relational JOINs.
- Extensive referential integrity.
- Complex reporting and aggregation.
- Flexible searches over many value fields.

A database with a more suitable query model may be a better fit.

---

## 16. Practical Node.js Example Using Redis

Let's implement a simple key-value workflow using Node.js.

### Step 1: Install Redis client

```bash
npm install redis
```

### Step 2: Connect to Redis

```javascript
const redis = require("redis");

const client = redis.createClient({
  url: "redis://localhost:6379",
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

async function connectRedis() {
  await client.connect();
  console.log("Connected to Redis");
}

connectRedis();
```

This example assumes Redis is running locally on port `6379`.

### Step 3: Store a value

```javascript
await client.set("user:101", "Rahul");
```

### Step 4: Retrieve a value

```javascript
const user = await client.get("user:101");

console.log(user);
```

Output:

```text
Rahul
```

### Step 5: Store JSON

```javascript
const userData = {
  name: "Rahul",
  email: "rahul@example.com",
  age: 25,
};

await client.set("user:101", JSON.stringify(userData));
```

Retrieve and parse:

```javascript
const result = await client.get("user:101");

const parsedUser = JSON.parse(result);

console.log(parsedUser.name);
```

### Step 6: Store a value with expiration

```javascript
await client.set("otp:9876543210", "482913", {
  EX: 300,
});
```

The OTP expires after 300 seconds.

### Step 7: Delete a key

```javascript
await client.del("user:101");
```

### Complete example

```javascript
const redis = require("redis");

const client = redis.createClient({
  url: "redis://localhost:6379",
});

client.on("error", console.error);

async function main() {
  await client.connect();

  // Store a simple value
  await client.set("user:101", "Rahul");

  // Retrieve it
  const name = await client.get("user:101");

  console.log("User:", name);

  // Store JSON
  const user = {
    name: "Rahul",
    email: "rahul@example.com",
  };

  await client.set("user:101:profile", JSON.stringify(user));

  // Retrieve JSON
  const profile = await client.get("user:101:profile");

  console.log(JSON.parse(profile));

  // Store a temporary OTP
  await client.set("otp:101", "482913", {
    EX: 300,
  });

  // Check existence
  const exists = await client.exists("otp:101");

  console.log("OTP exists:", exists);

  await client.quit();
}

main().catch(console.error);
```

---

## 17. Interview Questions and Answers

### Q1. What is a key-value database?

A key-value database stores data as key-value pairs. The key identifies the value, and the primary access pattern is retrieving data using that key.

### Q2. How is a key-value database different from a relational database?

A relational database stores data in tables with rows, columns, relationships, and a query language such as SQL. A basic key-value database stores values associated with keys and primarily supports key-based access.

### Q3. Is Redis a key-value database?

Redis is commonly described as an in-memory data structure store. It supports key-value operations and multiple data structures, including strings, lists, sets, hashes, and sorted sets.

### Q4. What is TTL?

TTL means Time To Live. It specifies how long a key should remain available before expiration.

### Q5. Why are key-value databases useful for caching?

They provide simple key-based access patterns that are suitable for retrieving frequently accessed data with low latency.

### Q6. Can a key-value database store JSON?

Yes. Many key-value databases can store serialized JSON as a value. However, a basic key-value database may treat that JSON as opaque data rather than supporting queries on its individual fields.

### Q7. What is the difference between a key-value database and a document database?

A basic key-value database primarily retrieves values through keys. A document database understands structured documents and commonly supports queries on individual document fields.

### Q8. Are all key-value databases in-memory?

No. Some are in-memory, while others use durable distributed storage.

### Q9. What happens when you SET an existing Redis key?

The existing value is replaced, unless a conditional operation or different command is used.

### Q10. What are common Redis use cases?

Caching, sessions, rate limiting, counters, temporary data, queues, and leaderboards.

### Q11. What is the disadvantage of a basic key-value database?

It generally provides limited field-based querying and relational capabilities compared with a relational or document database.

### Q12. Is Memcached a database?

Memcached is primarily an in-memory caching system that provides key-value operations. It is not designed as a general-purpose durable database.

### Q13. Does storing JSON in Redis make Redis a document database?

No. In a basic Redis string value, the JSON is serialized data. Redis does not automatically provide document-style querying over its fields.

### Q14. Can key-value databases scale horizontally?

Some key-value databases support partitioning and distributing keys across multiple nodes. The exact scaling behavior depends on the database.

### Q15. Should we store payment records only in Redis?

Generally, no. Financial records require durable storage, appropriate transaction guarantees, and strong integrity controls. Redis may support parts of a payment workflow, but should not replace the system of record without a carefully justified architecture.

---

## 18. Practical Exercises

### Exercise 1: Identify the key and value

For each record, identify the key and value.

```text
user:101 → Rahul

session:abc123 → {"userId":101,"role":"admin"}

cart:101 → {"items":[501,502]}

otp:9876543210 → 482913
```

### Exercise 2: Design keys for an application

Design key names for:

1. User profile.
2. User session.
3. User shopping cart.
4. Product information.
5. OTP verification.
6. API rate limit.
7. Feature flag.
8. Password reset token.

Use consistent naming conventions.

### Exercise 3: Select the appropriate database

Choose a suitable database model for each workload:

| Requirement                                       | Your choice |
| ------------------------------------------------- | ----------- |
| Retrieve session using session ID                 | ?           |
| Retrieve users based on multiple profile fields   | ?           |
| Perform complex joins between orders and payments | ?           |
| Cache frequently requested product data           | ?           |
| Store temporary OTPs                              | ?           |
| Run complex financial reporting queries           | ?           |

### Exercise 4: Redis commands

Write Redis commands to:

1. Store `Rahul` under `user:101`.
2. Retrieve `user:101`.
3. Replace the value with `Prashant`.
4. Check whether the key exists.
5. Store an OTP with a TTL of 300 seconds.
6. Check the remaining TTL.
7. Delete the OTP.

### Exercise 5: Backend design

Design a Redis-based session system for a Node.js application.

Explain:

1. How a session key is generated.
2. What information is stored in its value.
3. How the browser sends the session identifier.
4. How the backend retrieves session information.
5. How TTL is applied.
6. What happens when the session expires.
7. How logout invalidates the session.

---

## 19. Chapter Summary

| Concept            | Key takeaway                                              |
| ------------------ | --------------------------------------------------------- |
| Key-value database | Stores data as key-value pairs                            |
| Key                | Unique identifier used to retrieve a value                |
| Value              | Information associated with a key                         |
| SET                | Stores or replaces a value                                |
| GET                | Retrieves a value                                         |
| DELETE             | Removes a key                                             |
| TTL                | Controls how long a key remains available                 |
| Redis              | In-memory data structure store with key-value operations  |
| Memcached          | Distributed in-memory caching system                      |
| DynamoDB           | Managed distributed key-value and document database       |
| Caching            | Stores frequently accessed data for faster retrieval      |
| Session management | Stores session information using session identifiers      |
| Rate limiting      | Uses counters and expiration to control request frequency |
| In-memory storage  | Keeps data in RAM for low-latency access                  |
| Persistence        | Mechanisms that preserve data beyond process restarts     |

### Final mental model

```text
                 KEY-VALUE DATABASE
                         |
                 +-------+-------+
                 |               |
                 v               v
                KEY             VALUE
                 |               |
                 v               v
            Identifier       Stored Data
                 |               |
                 +-------+-------+
                         |
                         v
                  GET / SET / DEL
                         |
                         v
                 Application Data
```

### The most important points to remember

1. A key-value database stores information as key-value pairs.
2. The key is the primary way to locate the value.
3. Basic key-value databases are optimized for simple lookups rather than complex relational queries.
4. Values can contain strings, serialized JSON, binary data, or other supported structures.
5. TTL is useful for temporary data such as OTPs, sessions, and cache entries.
6. Redis is a widely used in-memory data structure store.
7. Not all key-value databases are in-memory.
8. Storing JSON as a value does not automatically make a database a document database.
9. Key-value databases can complement relational databases instead of replacing them.
10. Choose the database according to the application's access patterns and consistency requirements.
