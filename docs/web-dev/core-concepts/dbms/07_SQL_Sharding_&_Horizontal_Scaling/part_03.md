---
sidebar_label: Query Execution in Sharded Systems
sidebar_position: 1
---

# Query Execution in Sharded Systems

## 1. Introduction: How Does a Query Execute Across Multiple Shards?

In last 2 sections, we learned the fundamentals of sharding, different sharding strategies and how records are distributed across database servers.

Now we need to understand an important question:

**When data is distributed across multiple database servers, how does the database execute queries?**

Consider an e-commerce application with three PostgreSQL shards:

- Shard 1 stores some users and their orders.
- Shard 2 stores another group of users and their orders.
- Shard 3 stores the remaining users and their orders.

```text
                 Node.js Application
                         |
                    Shard Router
                         |
              ---------------------
              |         |         |
              v         v         v
           Shard 1   Shard 2   Shard 3
```

Suppose a user requests:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

If `user_id` is the shard key, the router can identify the correct shard and execute the query there.

But consider:

```sql
SELECT SUM(total_amount)
FROM orders;
```

This query needs information from every shard.

The system must:

1. Send the query to multiple shards.
2. Execute it on each shard.
3. Collect partial results.
4. Combine those results.
5. Return the final answer.

This is the fundamental idea behind distributed query execution.

In this chapter, we will study:

1. Shard routing
2. Targeted queries
3. Scatter-gather queries
4. Distributed JOINs
5. Distributed aggregations
6. Sorting and pagination across shards
7. Query result merging
8. Application-level routing
9. Distributed query execution
10. Performance and network overhead

---

## 2. Shard Routing

### 2.1 What Is Shard Routing?

Shard routing is the process of determining which database shard should execute a query.

A sharded application needs some mechanism to identify where the required data is stored.

This mechanism can be implemented through:

- Application-level routing
- A database proxy
- A distributed database's internal query router
- Shard metadata or a directory service

### 2.2 Example

Suppose users are distributed using `user_id`.

| Shard   | User ID Range |
| ------- | ------------- |
| Shard 1 | 1–1000        |
| Shard 2 | 1001–2000     |
| Shard 3 | 2001–3000     |

The application executes:

```sql
SELECT *
FROM users
WHERE user_id = 1500;
```

The router identifies:

```text
user_id = 1500
       |
       v
Shard 2
       |
       v
Execute Query
       |
       v
Return Result
```

Only Shard 2 needs to execute the query.

This is called targeted query routing.

### 2.3 Why Is Shard Routing Important?

Without effective routing, the application might send every query to every shard.

That creates unnecessary:

- Database workload
- Network traffic
- Query execution
- Result processing

Good routing allows the application to access only the database servers that contain the required data.

---

## 3. Targeted Queries

### 3.1 What Is a Targeted Query?

A targeted query is a query that can be routed to one specific shard using the shard key or routing metadata.

Example:

```sql
SELECT *
FROM users
WHERE user_id = 1500;
```

Assume `user_id` is the shard key.

The router can directly identify the destination.

```text
             Application
                  |
             Shard Router
                  |
                  v
               Shard 2
                  |
                  v
              Query Result
```

### 3.2 Another Example: Creating an Order

Suppose orders are sharded by `user_id`.

The application receives:

```json
{
  "userId": 1500,
  "totalAmount": 2500
}
```

The backend identifies the destination shard and executes:

```sql
INSERT INTO orders (
    user_id,
    total_amount
)
VALUES (
    1500,
    2500
);
```

The query is sent to the shard responsible for user 1500.

### 3.3 Targeted Query Advantages

- Only one shard needs to execute the query.
- Less network communication.
- Lower coordination overhead.
- Easier query result handling.
- Better scalability for shard-key-based access patterns.

### 3.4 Important Limitation

Consider:

```sql
SELECT *
FROM users
WHERE email = 'user@example.com';
```

If the shard key is `user_id`, the router cannot determine the destination using this query alone.

It may need to:

- Query multiple shards.
- Use a separate email-to-user lookup.
- Maintain a secondary routing index.
- Use a directory that maps email addresses to shards.

The query's efficiency depends heavily on the shard key and available routing metadata.

---

## 4. Scatter-Gather Queries

### 4.1 What Is a Scatter-Gather Query?

A scatter-gather query is a query that is sent to multiple shards, after which the system collects and combines their results.

It is needed when the router cannot identify a single destination shard or when the requested data spans multiple shards.

### 4.2 Example

Suppose an application has three shards:

```text
Shard 1: Orders belonging to some users
Shard 2: Orders belonging to other users
Shard 3: Orders belonging to remaining users
```

The application executes:

```sql
SELECT *
FROM orders
WHERE total_amount > 10000;
```

Assume the shard key is `user_id`.

The query does not contain `user_id`.

The router cannot identify a single shard.

It sends the query to all three shards.

```text
                 Application
                      |
                 Shard Router
                      |
          -------------------------
          |           |           |
          v           v           v
       Shard 1     Shard 2     Shard 3
          |           |           |
          v           v           v
       Results     Results     Results
          |           |           |
          -----------+-----------
                      |
                      v
               Merge Results
                      |
                      v
                Application
```

This is scatter-gather execution.

### 4.3 Example With Actual Results

Suppose each shard returns:

**Shard 1**

| Order ID | Amount |
| -------- | -----: |
| 101      |  12000 |
| 102      |  15000 |

**Shard 2**

| Order ID | Amount |
| -------- | -----: |
| 201      |  11000 |
| 202      |  18000 |

**Shard 3**

| Order ID | Amount |
| -------- | -----: |
| 301      |  13000 |
| 302      |   9000 |

The router collects the results and combines them.

Final result:

| Order ID | Amount |
| -------- | -----: |
| 101      |  12000 |
| 102      |  15000 |
| 201      |  11000 |
| 202      |  18000 |
| 301      |  13000 |

Order 302 is excluded because its amount is below 10000.

### 4.4 Advantages

- Supports queries that span multiple shards.
- Enables global reporting.
- Allows aggregation across distributed datasets.
- Makes it possible to retrieve records without knowing their shard in advance.

### 4.5 Disadvantages

- More network communication.
- More database work.
- Additional result-merging overhead.
- Query latency can depend on the slowest participating shard.
- Large result sets can consume substantial memory and bandwidth.

### 4.6 When Is Scatter-Gather Useful?

Examples:

- Global sales reports.
- Searching across all customers.
- Finding orders matching a condition across all shards.
- Calculating total registrations.
- Generating platform-wide analytics.

**Important:** Scatter-gather is not inherently bad. It is necessary for some distributed queries. The goal is to avoid unnecessary scatter-gather for common transactional operations.

---

## 5. Distributed Aggregations

Aggregation becomes more interesting when records are distributed across multiple shards.

Consider:

```sql
SELECT SUM(total_amount)
FROM orders;
```

The orders table is distributed across three shards.

How does the system calculate the total?

### 5.1 Basic Approach

Each shard calculates a partial sum.

**Shard 1**

```sql
SELECT SUM(total_amount)
FROM orders;
```

Result:

```text
150000
```

**Shard 2**

```sql
SELECT SUM(total_amount)
FROM orders;
```

Result:

```text
200000
```

**Shard 3**

```sql
SELECT SUM(total_amount)
FROM orders;
```

Result:

```text
250000
```

The router combines the partial results:

\[
150000 + 200000 + 250000 = 600000
\]

Final result:

```text
Total Sales = 600000
```

### 5.2 Architecture

```text
                  Application
                       |
                  Shard Router
                       |
           ------------------------
           |          |           |
           v          v           v
        Shard 1    Shard 2     Shard 3
        SUM=150K   SUM=200K    SUM=250K
           |          |           |
           ------------+-----------
                       |
                       v
                Combine Partial Sums
                       |
                       v
                 Final SUM = 600K
```

This approach is called partial aggregation followed by final aggregation.

### 5.3 COUNT Aggregation

Consider:

```sql
SELECT COUNT(*)
FROM orders;
```

Each shard calculates its own count.

| Shard   | Local Count |
| ------- | ----------: |
| Shard 1 |        1000 |
| Shard 2 |        1500 |
| Shard 3 |        2000 |

The router adds them:

\[
1000 + 1500 + 2000 = 4500
\]

The total count is 4500.

### 5.4 AVG Aggregation

Average requires more care.

Suppose the shards return:

| Shard   | Local Average | Row Count |
| ------- | ------------: | --------: |
| Shard 1 |           100 |        10 |
| Shard 2 |           200 |       100 |
| Shard 3 |           300 |        10 |

A common mistake is to calculate:

\[
\frac{100+200+300}{3}=200
\]

This is incorrect because the shards contain different numbers of records.

The correct calculation is a weighted average:

\[
\text{Global Average}
=
\frac{\sum \text{Shard Sums}}
{\sum \text{Shard Counts}}
\]

Calculate the sums:

- Shard 1: \(100 \times 10 = 1000\)
- Shard 2: \(200 \times 100 = 20000\)
- Shard 3: \(300 \times 10 = 3000\)

Total sum:

\[
1000+20000+3000=24000
\]

Total count:

\[
10+100+10=120
\]

Final average:

\[
\frac{24000}{120}=200
\]

The global average is 200.

The local averages happened to produce the same result in this example, but that is not guaranteed.

### 5.5 GROUP BY Across Shards

Consider:

```sql
SELECT
    status,
    COUNT(*)
FROM orders
GROUP BY status;
```

Each shard calculates local counts.

**Shard 1**

| Status  | Count |
| ------- | ----: |
| PAID    |   100 |
| PENDING |    50 |

**Shard 2**

| Status  | Count |
| ------- | ----: |
| PAID    |   200 |
| PENDING |    70 |

**Shard 3**

| Status    | Count |
| --------- | ----: |
| PAID      |   150 |
| CANCELLED |    30 |

The router combines matching groups.

Final result:

| Status    | Total Count |
| --------- | ----------: |
| PAID      |         450 |
| PENDING   |         120 |
| CANCELLED |          30 |

The router must merge groups with the same grouping key.

### 5.6 Which Aggregations Can Be Combined Easily?

| Aggregation    | How to Combine                       |
| -------------- | ------------------------------------ |
| SUM            | Add partial sums                     |
| COUNT          | Add partial counts                   |
| MIN            | Take minimum of local minimums       |
| MAX            | Take maximum of local maximums       |
| AVG            | Combine total sums and counts        |
| GROUP BY COUNT | Merge counts for matching groups     |
| DISTINCT       | Requires deduplication across shards |

`DISTINCT` deserves special attention.

For example, if the same email address appears on two shards, simply adding local distinct counts would overcount the global distinct number.

The system needs a way to identify and remove duplicates across shards.

---

## 6. Distributed JOINs

JOIN operations become more complicated when related tables are stored on different shards.

Let's understand the problem.

### 6.1 JOIN Within One Shard

Suppose users and their orders are distributed together using `user_id`.

```text
Shard 1
-------
users
orders

Shard 2
-------
users
orders

Shard 3
-------
users
orders
```

A user and their related orders are stored on the same shard.

The query:

```sql
SELECT
    users.name,
    orders.total_amount
FROM users
JOIN orders
    ON users.user_id = orders.user_id
WHERE users.user_id = 101;
```

Can execute entirely on the shard responsible for user 101.

This is relatively straightforward.

### 6.2 Co-Located Data

When related records are placed on the same shard, they are called co-located for that access pattern.

Co-location can make JOINs more efficient because the database does not need to transfer large amounts of data between servers.

This is one of the reasons data modeling and shard-key selection are closely related.

### 6.3 Cross-Shard JOIN

Now suppose:

- Users are stored on Shard 1.
- Orders are stored on Shard 2.
- Products are stored on Shard 3.

The query requires data from multiple servers.

```text
Shard 1          Shard 2          Shard 3
-------          -------          -------
users            orders           products
```

A JOIN may need to combine records from different servers.

This is called a distributed JOIN or cross-shard JOIN.

### 6.4 How Can Distributed JOINs Execute?

There are several possible approaches.

**Approach 1: Data Movement**

One system can retrieve rows from one shard and transfer them to another shard for joining.

**Approach 2: Application-Level JOIN**

The application queries multiple shards and combines the records in application memory.

**Approach 3: Distributed Query Engine**

A distributed database system coordinates query execution and data movement internally.

### 6.5 Example: Application-Level JOIN

Suppose the backend needs a user's orders.

First, retrieve the user:

```javascript
const user = await userPool.query(
  `SELECT *
   FROM users
   WHERE user_id = $1`,
  [101],
);
```

Then retrieve the user's orders:

```javascript
const orders = await orderPool.query(
  `SELECT *
   FROM orders
   WHERE user_id = $1`,
  [101],
);
```

Finally, combine the results:

```javascript
const response = {
  user: user.rows[0],
  orders: orders.rows,
};
```

This is a simplified application-level combination.

It is not necessarily a database JOIN, and it may require additional handling for:

- Missing records
- Concurrent updates
- Pagination
- Large result sets
- Partial failures
- Consistent snapshots

### 6.6 Why Distributed JOINs Are Expensive

A local JOIN might involve reading data from one database server.

A distributed JOIN may involve:

- Network transfer
- Multiple database queries
- Data serialization
- Data deserialization
- Result merging
- Coordination across servers

Therefore, a distributed JOIN can be significantly more expensive than a local JOIN.

### 6.7 How to Reduce Cross-Shard JOINs

- Co-locate related data when possible.
- Choose shard keys based on common query patterns.
- Keep frequently accessed related records together.
- Use carefully designed denormalized data where appropriate.
- Avoid unnecessary cross-shard relationships.

This does not mean normalization should be abandoned. It means distributed data placement must be considered during schema design.

---

## 7. Sorting Across Multiple Shards

Sorting is another important distributed-query problem.

Consider:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

Orders are distributed across three shards.

Each shard contains different orders.

The system needs the ten newest orders globally, not just the ten newest orders from one shard.

### 7.1 Incorrect Approach

Suppose the router asks Shard 1 for its newest ten orders and returns those results directly.

This is incorrect because Shard 2 or Shard 3 might contain newer orders.

### 7.2 Correct Conceptual Approach

The router asks each shard for its local top ten.

**Shard 1**

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

**Shard 2**

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

**Shard 3**

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

The router receives up to 30 records.

It then merges them by `created_at` and returns the global top ten.

```text
                Shard Router
                     |
          -----------------------
          |          |          |
          v          v          v
       Shard 1    Shard 2    Shard 3
       Top 10     Top 10     Top 10
          |          |          |
          ------------+----------
                     |
                     v
              Merge and Sort
                     |
                     v
                Global Top 10
```

### 7.3 Why Is This Possible?

A record that is not in the local top ten of its shard cannot be in the global top ten, assuming all shards use the same ordering rules and the requested sort is correctly applied.

Therefore, retrieving the local top ten from each shard is sufficient to construct the global top ten.

In practice, the system must also handle:

- NULL ordering
- Consistent sort rules
- Ties
- Deterministic ordering

### 7.4 Use a Stable Secondary Sort Key

If multiple records have the same timestamp, ordering only by `created_at` may not be deterministic.

A better query is:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC, order_id DESC
LIMIT 10;
```

The secondary key makes the ordering more deterministic, assuming `order_id` provides a suitable unique ordering within the relevant result set.

---

## 8. Pagination Across Shards

Pagination becomes more difficult when records are distributed across multiple database servers.

### 8.1 Simple Pagination on One Database

Consider:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;
```

This returns records 21–30 from the ordered result set.

### 8.2 Pagination Across Multiple Shards

Suppose you have three shards.

Each shard contains orders sorted by creation time.

You need global records 21–30.

The router cannot simply request records 21–30 from each shard and combine them.

Why?

Because each shard has its own local ordering, not the global ordering.

### 8.3 Example

Suppose:

| Shard   | Local Ordered Records |
| ------- | --------------------- |
| Shard 1 | 100, 90, 80, 70       |
| Shard 2 | 110, 85, 75, 65       |
| Shard 3 | 120, 95, 60, 50       |

The global order is:

```text
120, 110, 100, 95, 90, 85, 80, 75, 70, 65, 60, 50
```

If the application requests records 5–8, the result is:

```text
90, 85, 80, 75
```

The system must merge the local sorted results before determining the global offset.

### 8.4 Why OFFSET Can Become Expensive

Suppose the application requests:

```sql
LIMIT 10 OFFSET 100000;
```

A distributed query may require fetching and processing a large number of records across multiple shards before determining the required global page.

This can create significant network and processing overhead.

### 8.5 Cursor-Based Pagination

Cursor-based pagination can be more efficient for large datasets.

For example:

```sql
SELECT *
FROM orders
WHERE created_at < $1
ORDER BY created_at DESC, order_id DESC
LIMIT 10;
```

The application passes the last record's ordering values as the cursor.

In a sharded architecture, the router must coordinate the cursor across the relevant shards.

A cursor may need to contain:

- Last `created_at`
- Last `order_id`
- Additional routing information

Cursor pagination reduces reliance on large offsets, but distributed pagination still requires global ordering and careful handling of concurrent data changes.

---

## 9. Query Result Merging

After multiple shards execute a query, the system must combine their results.

This process is called result merging.

The merging strategy depends on the query.

| Query Type | Result-Merging Operation      |
| ---------- | ----------------------------- |
| SELECT     | Combine rows                  |
| SUM        | Add partial sums              |
| COUNT      | Add partial counts            |
| AVG        | Combine sums and counts       |
| MIN        | Select smallest local minimum |
| MAX        | Select largest local maximum  |
| GROUP BY   | Merge matching groups         |
| ORDER BY   | Merge sorted results          |
| DISTINCT   | Deduplicate across shards     |

### Example: Global Revenue

Each shard calculates its local revenue.

```text
Shard 1 -> ₹1,00,000
Shard 2 -> ₹2,00,000
Shard 3 -> ₹1,50,000
```

The router combines the results:

\[
100000 + 200000 + 150000 = 450000
\]

Final result:

```text
Total Revenue = ₹4,50,000
```

### Important Consideration

The final result is only as accurate and consistent as the data and snapshots used by the participating shards.

If the shards are being updated while the query executes, they may not represent exactly the same point in time.

Distributed databases may provide coordination mechanisms for consistent distributed reads. A basic application-level scatter-gather implementation does not automatically provide a globally consistent snapshot.

---

## 10. Application-Level Shard Routing in Node.js

Let's implement a simplified example.

Assume you have three PostgreSQL shards and use `user_id` ranges.

### 10.1 Create Connection Pools

```javascript
const { Pool } = require("pg");

const shardPools = {
  shard1: new Pool({
    connectionString: process.env.SHARD_1_URL,
  }),

  shard2: new Pool({
    connectionString: process.env.SHARD_2_URL,
  }),

  shard3: new Pool({
    connectionString: process.env.SHARD_3_URL,
  }),
};
```

### 10.2 Create a Routing Function

```javascript
function getShardPool(userId) {
  if (userId <= 1000000) {
    return shardPools.shard1;
  }

  if (userId <= 2000000) {
    return shardPools.shard2;
  }

  return shardPools.shard3;
}
```

### 10.3 Execute a Targeted Query

```javascript
async function getUserOrders(userId) {
  const pool = getShardPool(userId);

  const result = await pool.query(
    `SELECT *
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
}
```

The query is executed only on the shard responsible for the user.

### 10.4 Execute a Scatter-Gather Query

Suppose you need total revenue across all shards.

```javascript
async function getTotalRevenue() {
  const pools = Object.values(shardPools);

  const results = await Promise.all(
    pools.map((pool) =>
      pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) AS revenue
         FROM orders`,
      ),
    ),
  );

  const totalRevenue = results.reduce(
    (total, result) => total + Number(result.rows[0].revenue),
    0,
  );

  return totalRevenue;
}
```

The execution flow:

```text
               Node.js Backend
                      |
                Execute Query
                      |
           -----------------------
           |          |          |
           v          v          v
        Shard 1    Shard 2    Shard 3
        SUM        SUM        SUM
           |          |          |
           ------------+----------
                      |
                      v
                Node.js Merge
                      |
                      v
                 Total Revenue
```

### Important Limitations

This is an educational example, not a production-ready distributed query engine.

A real implementation must consider:

- Query failures on individual shards.
- Timeouts.
- Retry behavior.
- Numeric precision.
- Consistent snapshots.
- Large result sets.
- Partial results.
- Connection-pool limits.
- Shard membership changes.

For example, PostgreSQL `NUMERIC` values are often returned by the `pg` Node.js driver as strings. Converting monetary values to JavaScript `Number` can introduce floating-point precision problems.

For financial calculations, use a decimal arithmetic library or perform appropriate exact numeric aggregation.

Also, if one shard fails, `Promise.all()` rejects. The application needs an explicit policy for whether to fail the entire request, retry, or return a clearly marked partial result.

---

## 11. Distributed Query Execution Architecture

A distributed query system generally needs multiple components.

```text
                Application
                     |
                     v
               Query Router
                     |
              Query Analysis
                     |
              Shard Selection
                     |
          ------------------------
          |          |           |
          v          v           v
       Shard 1    Shard 2     Shard 3
          |          |           |
          v          v           v
       Execute    Execute     Execute
          |          |           |
          -----------+-----------
                     |
               Result Merger
                     |
               Final Response
                     |
                     v
                 Application
```

### 11.1 Query Router

Determines which shards need to execute the query.

### 11.2 Query Analysis

Identifies:

- Referenced tables
- Filter conditions
- Shard-key values
- JOIN requirements
- Aggregations
- Sorting and pagination

### 11.3 Shard Selection

Chooses one or more destination shards.

### 11.4 Local Query Execution

Each selected shard executes its part of the query.

### 11.5 Result Merger

Combines local results into the final response.

### 11.6 Return Results

The system returns the final result to the application.

Not every distributed database implements these components in exactly this way, but they are useful conceptual building blocks.

---

## 12. Network Overhead and Query Performance

Network communication is one of the biggest differences between local and distributed query execution.

### 12.1 Local Query

```text
Application
    |
    v
Database
    |
    v
Result
```

The application communicates with one database server.

### 12.2 Distributed Query

```text
                 Application
                      |
                 Query Router
                      |
           ------------------------
           |          |           |
           v          v           v
        Shard 1    Shard 2     Shard 3
           |          |           |
           -----------+-----------
                      |
                  Merge Results
                      |
                      v
                 Application
```

The system must communicate with multiple servers.

### 12.3 Why Network Overhead Matters

A distributed query can involve:

- Network round trips
- Request serialization
- Response serialization
- Data transfer
- Coordination
- Result merging

Even if each shard executes its local query quickly, the overall query may be slow because of network and coordination costs.

### 12.4 Parallel Execution

One advantage is that multiple shards can execute their queries concurrently.

Suppose:

| Shard   | Execution Time |
| ------- | -------------: |
| Shard 1 |         100 ms |
| Shard 2 |         120 ms |
| Shard 3 |          90 ms |

If executed sequentially, local execution alone takes approximately:

\[
100 + 120 + 90 = 310\text{ ms}
\]

If executed concurrently, the execution phase may take approximately:

\[
\max(100,120,90)=120\text{ ms}
\]

This ignores network, coordination, and result-merging overhead.

Parallel execution can reduce query time, but the slowest participating shard often determines when the complete result is available.

### 12.5 More Shards Do Not Always Mean Faster Queries

Consider a query that needs to access all 50 shards.

Even if each shard is relatively fast, the system must coordinate 50 operations and combine their results.

This can increase:

- Network traffic
- Connection usage
- Result-merging costs
- Failure probability
- Operational complexity

The objective is not to involve as many shards as possible.

The objective is to involve only the shards needed for the query.

---

## 13. Best Practices for Querying Sharded Databases

### 13.1 Include the Shard Key in Common Queries

Prefer:

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

When `user_id` is the shard key.

This helps route the query to one shard.

### 13.2 Avoid Unnecessary Scatter-Gather Queries

Do not broadcast every request to every shard if the destination can be identified.

### 13.3 Co-Locate Related Data

If users and their orders are frequently queried together, consider distributing them using a common ownership key.

This can reduce distributed JOINs.

### 13.4 Design Global Aggregations Carefully

For operations such as:

- SUM
- COUNT
- AVG
- GROUP BY

Understand how partial results must be combined.

### 13.5 Prefer Cursor Pagination for Large Datasets

Large OFFSET values can be expensive across shards.

Use stable ordering keys and cursor-based pagination where appropriate.

### 13.6 Limit Result Sizes

Avoid retrieving millions of rows from every shard and merging everything in application memory.

Push filters and aggregations down to individual shards whenever possible.

### 13.7 Handle Partial Failures

A distributed query can fail on one shard while other shards succeed.

Decide whether the operation:

- Must fail entirely.
- Can retry the failed shard.
- Can return a clearly identified partial result.

Never silently present incomplete results as complete.

### 13.8 Monitor Each Shard

Track:

- Query latency
- CPU usage
- Memory
- Connections
- Disk I/O
- Error rates
- Request volume
- Network transfer

A global average can hide one overloaded shard.

---

## 14. Common Misconceptions

### Misconception 1: Every query goes to every shard.

Incorrect.

A query containing sufficient shard-routing information can be sent to one shard.

### Misconception 2: Scatter-gather is always bad.

Incorrect.

It is necessary for queries that span multiple shards. The goal is to avoid unnecessary scatter-gather operations.

### Misconception 3: Adding more shards automatically makes every query faster.

Incorrect.

Distributed queries introduce network and coordination overhead.

### Misconception 4: You can calculate AVG by averaging shard averages.

Incorrect.

You need a weighted calculation using each shard's sum and count.

### Misconception 5: Distributed JOINs are equivalent to local JOINs.

Incorrect.

Distributed JOINs may require network transfer, coordination, and result merging.

### Misconception 6: Pagination can be performed independently on each shard.

Incorrect.

Global pagination requires globally ordered results, not merely local pages.

### Misconception 7: Parallel execution guarantees low latency.

Incorrect.

The slowest shard and the coordination overhead can determine the final response time.

### Misconception 8: Application-level result merging guarantees a consistent snapshot.

Incorrect.

Queries executed independently on different shards may observe different database states unless the architecture provides an appropriate distributed consistency mechanism.

---

## 15. Interview Questions

### Q1. What is shard routing?

Shard routing is the process of determining which database shard should execute a query.

### Q2. What is a targeted query?

A targeted query can be routed to one specific shard using the shard key or routing metadata.

### Q3. What is a scatter-gather query?

It is a query sent to multiple shards, with results collected and combined by the router or query engine.

### Q4. What is a distributed aggregation?

It is an aggregation performed across multiple shards by calculating local partial results and combining them into a global result.

### Q5. How do you calculate SUM across shards?

Calculate the sum on each shard and add the partial sums.

### Q6. How do you calculate COUNT across shards?

Calculate the count on each shard and add the partial counts, assuming the distributed query semantics do not introduce duplicate counting.

### Q7. How do you calculate AVG across shards?

Combine the total sums and total counts:

\[
\text{Global Average}
=
\frac{\text{Total Sum Across Shards}}
{\text{Total Count Across Shards}}
\]

### Q8. What is a distributed JOIN?

A JOIN that requires data from multiple database shards.

### Q9. How can distributed JOIN performance be improved?

Co-locate related data, choose appropriate shard keys, reduce data transfer, and avoid unnecessary cross-shard relationships.

### Q10. What is result merging?

It is the process of combining partial query results from multiple shards into one final result.

### Q11. How does ORDER BY work across shards?

Each shard can return locally sorted results. The router then merges the sorted streams to produce a globally sorted result.

### Q12. Why is pagination difficult across shards?

Because each shard has its own local ordering. The system must establish global ordering before determining the requested page.

### Q13. Why can OFFSET be expensive in distributed databases?

The system may need to process and merge many records across shards before reaching the requested global offset.

### Q14. Why is the shard key important for query execution?

It determines whether the router can target one shard or must involve multiple shards.

### Q15. What is the main performance cost of distributed query execution?

Network communication, coordination, data transfer, and result merging.

### Q16. Can multiple shards execute a query in parallel?

Yes. Independent shard operations can often execute concurrently.

### Q17. What happens if one shard fails during scatter-gather?

The overall query may fail, retry, or return partial results depending on the application's failure policy.

### Q18. What is co-location?

Co-location means storing related records on the same shard so common operations can execute locally.

### Q19. Does application-level merging guarantee transaction consistency?

No. Independent shard queries do not automatically share one globally consistent snapshot.

### Q20. Why should aggregations be pushed down to shards?

It reduces the amount of data transferred over the network because each shard returns a smaller partial result instead of every underlying row.

---

## 16. Practical Learning Exercise

### Exercise A: Identify the Query Type

Assume `user_id` is the shard key.

Identify whether each query is targeted or scatter-gather.

**Query 1**

```sql
SELECT *
FROM users
WHERE user_id = 101;
```

**Query 2**

```sql
SELECT *
FROM orders
WHERE user_id = 101;
```

**Query 3**

```sql
SELECT *
FROM orders
WHERE total_amount > 5000;
```

**Query 4**

```sql
SELECT COUNT(*)
FROM orders;
```

Expected reasoning:

| Query   | Likely Execution                                       |
| ------- | ------------------------------------------------------ |
| Query 1 | Targeted                                               |
| Query 2 | Targeted if orders use compatible routing by `user_id` |
| Query 3 | Scatter-gather if no other routing information exists  |
| Query 4 | Distributed aggregation across relevant shards         |

### Exercise B: Global Aggregation

Three shards return:

| Shard   |   SUM | COUNT |
| ------- | ----: | ----: |
| Shard 1 | 10000 |    10 |
| Shard 2 | 20000 |    20 |
| Shard 3 | 30000 |    30 |

Calculate:

1. Global SUM
2. Global COUNT
3. Global AVG

Expected answers:

\[
\text{SUM}=10000+20000+30000=60000
\]

\[
\text{COUNT}=10+20+30=60
\]

\[
\text{AVG}=\frac{60000}{60}=1000
\]

### Exercise C: Distributed JOIN

Suppose:

- `users` is stored on Shard 1.
- `orders` is stored on Shard 2.

You need to retrieve a user and their orders.

Answer:

1. Why is this a cross-shard operation?
2. What data needs to move?
3. Could application-level merging be used?
4. What would happen if the order query failed after the user query succeeded?

### Exercise D: Pagination

Three shards return locally sorted timestamps:

```text
Shard 1: 100, 80, 60
Shard 2: 110, 90, 70
Shard 3: 120, 95, 50
```

Determine the global descending order.

Expected result:

```text
120, 110, 100, 95, 90, 80, 70, 60, 50
```

The router must merge the results before applying global pagination.

### Exercise E: Identify Performance Problems

For each situation, identify the issue:

1. Every query is sent to all 20 shards.
2. The application averages local averages without considering record counts.
3. A global JOIN transfers millions of rows between servers.
4. A query waits for one slow shard.
5. The application returns a partial result without indicating a shard failure.

Expected answers:

| Situation | Problem                       |
| --------- | ----------------------------- |
| 1         | Unnecessary scatter-gather    |
| 2         | Incorrect aggregation         |
| 3         | Excessive data movement       |
| 4         | Slowest-shard bottleneck      |
| 5         | Incorrect result completeness |

---

## 17. Chapter Summary

| Concept                 | Key Takeaway                                   |
| ----------------------- | ---------------------------------------------- |
| Shard Routing           | Identifies which shard executes a query        |
| Targeted Query          | Executes on one identified shard               |
| Scatter-Gather          | Queries multiple shards and combines results   |
| Distributed Aggregation | Combines local aggregation results             |
| Distributed JOIN        | Combines data stored on different shards       |
| Co-Location             | Stores related records together                |
| Result Merging          | Combines partial results                       |
| Global Sorting          | Merges locally sorted results                  |
| Distributed Pagination  | Requires global ordering                       |
| Parallel Execution      | Runs independent shard operations concurrently |
| Network Overhead        | Communication cost between servers             |
| Partial Failure         | Some shards may fail while others succeed      |

### The most important mental model

```text
TARGETED QUERY

Application
     |
Shard Router
     |
One Shard
     |
Result


SCATTER-GATHER QUERY

Application
     |
Shard Router
     |
  -----------------
  |       |       |
Shard 1 Shard 2 Shard 3
  |       |       |
  -----------------
     |
Merge Results
     |
Final Result
```

The central principle:

**Efficient sharded query execution depends on sending each query to the smallest possible set of shards and minimizing the amount of data transferred between them.**
