---
sidebar_label: "Key-Value Databases: Data Modeling & Use Cases"
sidebar_position: 1
---

# Key-Value Databases: Data Modeling & Use Cases

## 1. Introduction

In last 2 sections, we learned the fundamentals of key-value databases and their internal architecture, including hash tables, memory, persistence, replication, and Redis Cluster.

Now we will focus on a practical engineering question:

**How should we design data models when using a key-value database?**

Knowing Redis commands is not enough. Poor key design can create:

- Difficult data retrieval.
- Unnecessary network requests.
- Excessive memory consumption.
- Cache inconsistencies.
- Hot keys.
- Complicated expiration logic.
- Difficult data migrations.

In this chapter, we will learn how to design key-value storage for real backend applications.

We will primarily use Redis and Node.js examples.

---

## 2. Understanding Key-Value Data Modeling

Data modeling means deciding:

- What information should be stored?
- How should it be represented?
- What keys should identify it?
- How should the application retrieve it?
- How long should it remain stored?
- How should it be updated or deleted?

Consider a user:

```json
{
  "userId": 101,
  "name": "Rahul",
  "email": "rahul@example.com",
  "age": 25,
  "city": "Noida"
}
```

We need to decide how to store this information in Redis.

### Approach 1: Store the entire object as a string

```text
Key:
user:101

Value:
{
    "userId": 101,
    "name": "Rahul",
    "email": "rahul@example.com",
    "age": 25,
    "city": "Noida"
}
```

Redis commands:

```bash
SET user:101 '{"userId":101,"name":"Rahul","email":"rahul@example.com","age":25,"city":"Noida"}'

GET user:101
```

The application retrieves the complete JSON string and parses it.

### Approach 2: Store the object as a Redis Hash

```bash
HSET user:101 \
    userId 101 \
    name Rahul \
    email rahul@example.com \
    age 25 \
    city Noida
```

Retrieve the entire hash:

```bash
HGETALL user:101
```

Retrieve an individual field:

```bash
HGET user:101 email
```

### Comparison

| Feature                | JSON String                          | Redis Hash                    |
| ---------------------- | ------------------------------------ | ----------------------------- |
| Storage model          | One serialized value                 | Multiple fields inside a hash |
| Retrieve entire object | GET                                  | HGETALL                       |
| Retrieve one field     | Retrieve and parse the complete JSON | HGET                          |
| Update one field       | Usually replace the serialized value | HSET                          |
| Partial updates        | Application-managed                  | Supported at field level      |
| Data type              | String                               | Hash                          |

### Which approach should we choose?

Use a JSON string when:

- The application generally reads the complete object.
- The object is replaced as a whole.
- Individual field operations are not important.

Use a Redis Hash when:

- You frequently retrieve individual fields.
- You need to update fields independently.
- The data naturally fits a collection of field-value pairs.

The correct choice depends on the access pattern, not just the shape of the original JavaScript object.

---

## 3. Key Naming Conventions

Key naming is one of the most important parts of Redis data modeling.

A good naming convention makes keys:

- Predictable.
- Consistent.
- Easy to understand.
- Easy to manage.
- Easy to debug.

### 3.1 Use prefixes

Consider these keys:

```text
user:101
product:501
order:9001
session:abc123
cart:101
```

The prefix identifies the entity or feature.

### 3.2 Use colons as separators

A common Redis naming convention is:

```text
entity:identifier:attribute
```

Examples:

```text
user:101:profile
user:101:session
user:101:preferences

product:501:details
product:501:inventory

order:9001:status
```

This makes the key structure predictable.

### 3.3 Use consistent naming

Avoid inconsistent keys such as:

```text
user101
user_102
USER:103
```

Prefer:

```text
user:101
user:102
user:103
```

### 3.4 Include environment or application prefixes when needed

If multiple applications or environments share the same Redis deployment, namespacing can prevent collisions.

Examples:

```text
prod:store:user:101
staging:store:user:101
dev:store:user:101
```

This is particularly useful when multiple services share a Redis instance.

### 3.5 Key naming rules

| Rule                            | Example                                               |
| ------------------------------- | ----------------------------------------------------- |
| Use meaningful prefixes         | `user:101`                                            |
| Keep naming consistent          | `product:501`                                         |
| Separate logical sections       | `user:101:session`                                    |
| Avoid unnecessary long keys     | Prefer `cart:101` over an excessively descriptive key |
| Include environment when needed | `prod:api:cache:users`                                |
| Avoid ambiguous names           | Prefer `user:101:profile` over `data:101`             |

**Important:** Redis keys are not hierarchical folders. Colons are naming conventions, not actual directory separators.

---

## 4. Choosing the Right Redis Data Structure

Redis supports multiple data structures.

Choosing the correct one depends on how the application needs to access and modify the data.

| Requirement                  | Suitable Redis structure |
| ---------------------------- | ------------------------ |
| Store a simple value         | String                   |
| Store object-like fields     | Hash                     |
| Store ordered items          | List                     |
| Store unique members         | Set                      |
| Maintain ranked data         | Sorted Set               |
| Store append-oriented events | Stream                   |
| Track bit-level state        | Bitmap                   |
| Estimate unique cardinality  | HyperLogLog              |

### 4.1 Strings

Strings are suitable for:

- Simple values.
- Serialized JSON.
- Counters.
- Tokens.
- Cached responses.

Example:

```bash
SET user:101:name "Rahul"

GET user:101:name
```

### 4.2 Hashes

Hashes store multiple field-value pairs under one key.

Example:

```bash
HSET user:101 name "Rahul" email "rahul@example.com" age 25
```

Retrieve one field:

```bash
HGET user:101 name
```

Retrieve all fields:

```bash
HGETALL user:101
```

Update one field:

```bash
HSET user:101 city "Noida"
```

### 4.3 Lists

Lists store ordered sequences of elements.

Example:

```bash
LPUSH notifications:user:101 "Order placed"
LPUSH notifications:user:101 "Payment successful"
```

Retrieve:

```bash
LRANGE notifications:user:101 0 -1
```

Lists are useful for certain queue-like and ordered collection workloads.

### 4.4 Sets

Sets store unique members.

Example:

```bash
SADD online_users 101 102 103
```

Check membership:

```bash
SISMEMBER online_users 101
```

Add the same member again:

```bash
SADD online_users 101
```

The set still contains only one occurrence of `101`.

### 4.5 Sorted Sets

Sorted Sets store unique members associated with scores.

Example:

```bash
ZADD leaderboard 100 "Rahul"
ZADD leaderboard 150 "Amit"
ZADD leaderboard 120 "Priya"
```

Retrieve members in ascending score order:

```bash
ZRANGE leaderboard 0 -1 WITHSCORES
```

These are useful for leaderboards and ranking systems.

---

## 5. Designing Session Storage

Session management is one of the most common key-value database use cases.

Suppose a user logs into an application.

The backend needs to remember:

- Who the user is.
- Whether the session is valid.
- When the session expires.
- What permissions or roles apply.

### 5.1 Session data model

A possible Redis key:

```text
session:abc123
```

Value:

```json
{
  "userId": 101,
  "role": "admin",
  "createdAt": "2026-11-14T10:00:00Z"
}
```

### 5.2 Store the session

```bash
SET session:abc123 '{"userId":101,"role":"admin"}' EX 3600
```

The session expires after one hour.

### 5.3 Session retrieval flow

```text
               Browser
                  |
                  v
             Session Cookie
                  |
                  v
              Node.js API
                  |
                  v
          Extract Session ID
                  |
                  v
          GET session:abc123
                  |
             +----+----+
             |         |
             v         v
          Exists    Not Found
             |         |
             v         v
       Validate User  Reject Request
             |
             v
        Continue Request
```

### 5.4 Node.js implementation

```javascript
async function getSession(sessionId) {
  const key = `session:${sessionId}`;

  const session = await redisClient.get(key);

  if (!session) {
    return null;
  }

  return JSON.parse(session);
}
```

Create a session:

```javascript
async function createSession(sessionId, user) {
  const key = `session:${sessionId}`;

  const sessionData = {
    userId: user.id,
    role: user.role,
    createdAt: new Date().toISOString(),
  };

  await redisClient.set(key, JSON.stringify(sessionData), {
    EX: 3600,
  });
}
```

Delete a session during logout:

```javascript
async function destroySession(sessionId) {
  await redisClient.del(`session:${sessionId}`);
}
```

### 5.5 Important security considerations

- Generate session identifiers using a cryptographically secure random generator.
- Do not store passwords in session values.
- Use secure, HTTP-only, appropriately configured cookies.
- Expire inactive sessions according to the application's security policy.
- Invalidate sessions during logout and relevant security events.
- Do not expose session identifiers in URLs or logs.
- Consider how session data behaves during Redis failover.

---

## 6. Designing Cache Storage

Caching is one of the most important practical uses of Redis.

A cache stores frequently accessed data so that the application does not repeatedly query the primary database.

### 6.1 Example: Product caching

Suppose your application has a product catalog in PostgreSQL.

A product record:

```json
{
  "productId": 501,
  "name": "Laptop",
  "price": 65000,
  "stock": 20
}
```

Instead of querying PostgreSQL every time, we cache the product in Redis.

Key:

```text
product:501
```

Value:

```json
{
  "productId": 501,
  "name": "Laptop",
  "price": 65000,
  "stock": 20
}
```

### 6.2 Cache-aside pattern

This is a common caching strategy.

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
           Cache Hit   Cache Miss
              |           |
              v           v
         Return Cache  Query PostgreSQL
                          |
                          v
                      Store in Redis
                          |
                          v
                      Return Result
```

### 6.3 Node.js implementation

```javascript
async function getProduct(productId) {
  const cacheKey = `product:${productId}`;

  // Check Redis first
  const cachedProduct = await redisClient.get(cacheKey);

  if (cachedProduct) {
    return JSON.parse(cachedProduct);
  }

  // Cache miss: query PostgreSQL
  const result = await db.query(
    "SELECT * FROM products WHERE product_id = $1",
    [productId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const product = result.rows[0];

  // Cache the result for 10 minutes
  await redisClient.set(cacheKey, JSON.stringify(product), {
    EX: 600,
  });

  return product;
}
```

### 6.4 Cache invalidation

Suppose the product price changes.

PostgreSQL now contains:

```text
product:501
price = 70000
```

But Redis still contains:

```text
product:501
price = 65000
```

The application may return stale information.

A simple solution is to invalidate the cache after a successful database update.

```javascript
async function updateProductPrice(productId, newPrice) {
  await db.query(
    `UPDATE products
         SET price = $1
         WHERE product_id = $2`,
    [newPrice, productId],
  );

  await redisClient.del(`product:${productId}`);
}
```

The next request will retrieve fresh data from PostgreSQL and populate Redis again.

**Important:** Database update and cache deletion are not one atomic transaction. If the database update succeeds but cache invalidation fails, stale data can remain until expiration. Production systems may need retries, outbox events, or other cache-consistency strategies.

---

## 7. Cache Expiration Strategies

A cache should not necessarily keep data forever.

Expiration policies help manage stale data and memory consumption.

### 7.1 Fixed TTL

Store a key with a fixed expiration.

```bash
SET product:501 '{"name":"Laptop","price":65000}' EX 600
```

The key expires after 600 seconds.

Useful for:

- Product cache.
- Configuration cache.
- API response cache.

### 7.2 Sliding expiration

In sliding expiration, the expiration time is extended when the data is accessed.

For example:

- Initial TTL: 30 minutes.
- User accesses the session after 20 minutes.
- TTL is reset to 30 minutes.

This is useful for some session-management policies.

However, frequent expiration updates add write operations. Implement it only when the required session behavior justifies it.

### 7.3 Randomized TTL

Suppose thousands of cache keys all expire at exactly the same time.

The application may receive a large number of cache misses simultaneously.

This can overload the primary database.

A technique called TTL jitter adds a random variation to expiration times.

Example:

```javascript
const baseTTL = 600;
const jitter = Math.floor(Math.random() * 120);

const ttl = baseTTL + jitter;
```

The actual TTL will be between 600 and 719 seconds.

This reduces the likelihood that many keys expire simultaneously.

### 7.4 Cache expiration comparison

| Strategy            | Behavior                                   | Use case                     |
| ------------------- | ------------------------------------------ | ---------------------------- |
| Fixed TTL           | Expires after a predefined duration        | Product cache                |
| Sliding TTL         | Expiration extends on access               | Session management           |
| Randomized TTL      | Expiration varies slightly                 | Large cache workloads        |
| Manual invalidation | Application deletes the key after a change | Updated product or user data |

---

## 8. Designing Rate Limiting

Rate limiting controls how frequently a user or client can access an API.

Example requirement:

```text
Maximum 100 requests per minute per user.
```

We can use Redis counters.

### 8.1 Data model

```text
rate_limit:user:101 → 45
```

The value represents the number of requests in the current time window.

### 8.2 Basic implementation

```bash
INCR rate_limit:user:101
EXPIRE rate_limit:user:101 60
```

However, these two commands are not an atomic combined operation.

If the application crashes between them, the counter may not receive an expiration.

A production implementation should coordinate increment and expiration.

### 8.3 Atomic implementation using Lua

Redis can execute a Lua script atomically.

```lua
local count = redis.call("INCR", KEYS[1])

if count == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
end

return count
```

Node.js example:

```javascript
const rateLimitScript = `
    local count = redis.call("INCR", KEYS[1])

    if count == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
    end

    return count
`;

async function checkRateLimit(userId) {
  const key = `rate_limit:user:${userId}`;

  const count = await redisClient.eval(rateLimitScript, {
    keys: [key],
    arguments: ["60"],
  });

  return {
    allowed: count <= 100,
    count,
  };
}
```

This implements a basic fixed-window rate limiter.

### 8.4 Fixed-window limitation

Suppose the limit is 100 requests per minute.

A user sends:

- 100 requests at 12:00:59.
- Another 100 requests at 12:01:00.

The user can send 200 requests across a very short interval because the counter resets at the window boundary.

More advanced algorithms include:

- Sliding window log.
- Sliding window counter.
- Token bucket.
- Leaky bucket.

These will be useful when designing production API protection.

---

## 9. Designing Counters

Counters are common in backend systems.

Examples:

- Page views.
- Likes.
- Downloads.
- API requests.
- Game scores.
- Product views.

### 9.1 Basic counter

```bash
SET page_views:home 0
INCR page_views:home
INCR page_views:home
GET page_views:home
```

Result:

```text
2
```

### 9.2 Increment by a specific amount

```bash
INCRBY product:501:views 10
```

### 9.3 Decrement

```bash
DECR stock:501
```

### 9.4 Why use Redis counters?

Redis provides atomic counter operations.

This avoids common lost-update problems associated with application-level read-modify-write logic.

### 9.5 Important limitation

If the counter represents important business data, such as confirmed financial transactions or authoritative inventory, Redis should not automatically be treated as the system of record.

Use a durable database with appropriate transaction and integrity guarantees.

Redis can be used for fast counters, temporary aggregation, or caching, depending on the correctness requirements.

---

## 10. Designing Leaderboards

Leaderboards are common in:

- Games.
- Competitions.
- Campaign platforms.
- Reward systems.
- User engagement applications.

Redis Sorted Sets are suitable for ranking members by score.

### 10.1 Data model

```text
Key:
leaderboard:campaign:2026

Member       Score
------------------
Rahul        950
Amit         870
Priya        990
```

### 10.2 Insert scores

```bash
ZADD leaderboard:campaign:2026 950 Rahul
ZADD leaderboard:campaign:2026 870 Amit
ZADD leaderboard:campaign:2026 990 Priya
```

### 10.3 Retrieve top players

```bash
ZREVRANGE leaderboard:campaign:2026 0 9 WITHSCORES
```

This retrieves the top 10 members in descending score order.

### 10.4 Update score

```bash
ZINCRBY leaderboard:campaign:2026 50 Rahul
```

Rahul's score increases by 50.

### 10.5 Retrieve a player's rank

```bash
ZREVRANK leaderboard:campaign:2026 Rahul
```

The returned rank is zero-based.

### 10.6 Why Sorted Sets?

Sorted Sets maintain members in score order.

This makes them suitable for ranking operations without requiring the application to retrieve every player and sort all records itself.

---

## 11. Designing Shopping Cart Storage

A shopping cart is another practical key-value use case.

Suppose a user adds products to their cart.

### 11.1 Data model using a Redis Hash

Key:

```text
cart:user:101
```

Fields:

```text
product:501 → 2
product:502 → 1
product:503 → 3
```

Commands:

```bash
HSET cart:user:101 product:501 2
HSET cart:user:101 product:502 1
HSET cart:user:101 product:503 3
```

Retrieve:

```bash
HGETALL cart:user:101
```

Update quantity:

```bash
HINCRBY cart:user:101 product:501 1
```

Remove a product:

```bash
HDEL cart:user:101 product:502
```

### 11.2 Why use a Hash?

A Redis Hash allows us to:

- Store multiple product quantities under one cart key.
- Update one product quantity.
- Retrieve all cart entries.
- Remove an individual product.

### 11.3 Important business considerations

A Redis cart should not be treated as the final order.

When the user checks out:

1. Validate product availability.
2. Recalculate prices using authoritative product data.
3. Validate quantities.
4. Create the order in the transactional database.
5. Process payment through the payment workflow.
6. Update inventory according to the business rules.

Do not trust cached prices or client-submitted totals as authoritative payment amounts.

---

## 12. Choosing the Right Key Design for Access Patterns

The most important principle in key-value data modeling is:

**Design keys around how the application needs to retrieve data.**

Consider a user profile.

Requirement A:

```text
Retrieve the entire user profile using userId.
```

A suitable key:

```text
user:101
```

Requirement B:

```text
Retrieve all sessions belonging to user 101.
```

Possible key:

```text
user:101:sessions
```

Requirement C:

```text
Retrieve a product using productId.
```

Possible key:

```text
product:501
```

Requirement D:

```text
Retrieve the current rate-limit counter for user 101.
```

Possible key:

```text
rate_limit:user:101
```

### Access-pattern mapping

| Access pattern             | Example key                 |
| -------------------------- | --------------------------- |
| Get user profile           | `user:101`                  |
| Get user session           | `session:abc123`            |
| Get user's cart            | `cart:user:101`             |
| Get product details        | `product:501`               |
| Get OTP                    | `otp:9876543210`            |
| Get API counter            | `rate_limit:user:101`       |
| Get leaderboard            | `leaderboard:campaign:2026` |
| Get campaign configuration | `campaign:2026:config`      |

Before designing keys, identify the actual operations your application needs.

---

## 13. Hot Keys and Hot Partitions

A hot key is a key receiving disproportionately high traffic.

Example:

```text
global:campaign:config
```

Suppose one million users request the same campaign configuration.

Every request accesses the same key.

This can create a bottleneck.

### 13.1 Why are hot keys a problem?

They can cause:

- Uneven workload distribution.
- Excessive traffic to one node.
- Increased latency.
- Resource contention.
- Bottlenecks in distributed clusters.

### 13.2 Mitigation strategies

**1. Local application caching**

Keep frequently accessed, relatively stable values in application memory for a short duration.

```text
Node.js Instance A → Local Cache
Node.js Instance B → Local Cache
Node.js Instance C → Local Cache
```

This reduces repeated Redis requests.

**2. Replicated reads**

Where the database and consistency requirements permit, route suitable reads to replicas.

This does not eliminate every hot-key bottleneck, but can distribute some read traffic.

**3. Split counters**

Instead of incrementing one global counter, use multiple counters.

```text
views:home:0
views:home:1
views:home:2
views:home:3
```

The application can aggregate them when needed.

**4. Redesign the access pattern**

Ask whether the application needs to retrieve the same value on every request.

Sometimes the problem is unnecessary database access rather than insufficient database capacity.

---

## 14. Redis Memory Management and Eviction

Redis stores its active dataset in memory.

Eventually, memory may reach its configured limit.

Redis supports eviction policies to determine which keys should be removed when the configured memory limit is reached and an operation requires additional memory.

### 14.1 Common eviction policies

| Policy            | Behavior                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| `noeviction`      | Rejects writes that require additional memory                                  |
| `allkeys-lru`     | Evicts keys based on approximate least-recently-used behavior                  |
| `allkeys-lfu`     | Evicts keys based on approximate least-frequently-used behavior                |
| `volatile-lru`    | Evicts eligible keys with expiration using approximate LRU                     |
| `volatile-lfu`    | Evicts eligible keys with expiration using approximate LFU                     |
| `volatile-ttl`    | Evicts eligible keys with expiration, favoring keys with shorter remaining TTL |
| `allkeys-random`  | Evicts random keys                                                             |
| `volatile-random` | Evicts random keys with expiration                                             |

### 14.2 LRU vs LFU

**LRU — Least Recently Used**

Evicts keys that have not been accessed recently.

Example:

```text
Key A → Last accessed 2 seconds ago
Key B → Last accessed 10 minutes ago
Key C → Last accessed 1 hour ago
```

Key C is a likely eviction candidate under an LRU-style policy.

**LFU — Least Frequently Used**

Evicts keys that are accessed less frequently.

Example:

```text
Key A → Accessed 10,000 times
Key B → Accessed 500 times
Key C → Accessed 5 times
```

Key C is a likely eviction candidate under an LFU-style policy.

### 14.3 Which policy should we use?

It depends on the workload.

| Workload                              | Possible policy                               |
| ------------------------------------- | --------------------------------------------- |
| General-purpose cache                 | `allkeys-lru`                                 |
| Frequently reused hot data            | `allkeys-lfu`                                 |
| Only temporary keys should be evicted | A suitable `volatile-*` policy                |
| Data must not be silently evicted     | `noeviction`, with explicit capacity planning |

**Important:** Redis eviction is not a substitute for application-level data lifecycle design. If an application relies on a key being present, it must handle expiration and eviction correctly.

---

## 15. Cache-Aside vs Write-Through vs Write-Behind

These are common caching patterns.

### 15.1 Cache-aside

The application checks the cache first.

On a cache miss, it queries the primary database and then populates the cache.

```text
Application
     |
     v
   Cache
     |
  Cache Miss
     |
     v
Primary Database
     |
     v
Populate Cache
```

Advantages:

- Simple to implement.
- Only requested data is cached.
- Works well with existing applications.

Disadvantages:

- Cache misses create additional database load.
- Invalidation must be handled.
- Concurrent misses can create duplicate database requests.

### 15.2 Write-through

The application writes to the cache and primary data store as part of the same logical write workflow.

```text
Application
     |
     v
Cache + Primary Database
```

The goal is to keep cached data updated as writes happen.

However, the two writes are not automatically one atomic transaction. Failure handling and ordering must be designed carefully.

Advantages:

- Cache can remain fresher.
- Read-after-write behavior can be easier to manage when the workflow succeeds.

Disadvantages:

- Additional write latency.
- Partial failures can create inconsistencies.
- More coordination is required.

### 15.3 Write-behind / Write-back

The application writes to the cache first, and the data is persisted to the primary database asynchronously.

```text
Application
     |
     v
Cache
     |
     v
Background Worker
     |
     v
Primary Database
```

Advantages:

- Can reduce synchronous write latency.
- Can batch database writes.

Disadvantages:

- Data may be lost if the cache fails before persistence.
- Requires reliable background processing.
- Error handling and retry logic are critical.
- The primary database may temporarily contain stale information.

This pattern should not be used casually for critical financial or transactional records.

### Comparison

| Pattern       | Write behavior                                             | Main advantage                  | Main risk                         |
| ------------- | ---------------------------------------------------------- | ------------------------------- | --------------------------------- |
| Cache-aside   | Application writes primary DB and manages cache            | Simple and flexible             | Stale cache or cache misses       |
| Write-through | Updates cache and primary DB in the write workflow         | Fresher cache                   | Partial-write failures            |
| Write-behind  | Cache is updated first; database is updated asynchronously | Lower synchronous write latency | Data loss and delayed persistence |

---

## 16. Avoiding Cache Stampedes

A cache stampede occurs when a popular key expires or is evicted and many requests simultaneously attempt to rebuild it.

Example:

```text
product:501 expires
        |
        v
1000 requests arrive
        |
        v
1000 cache misses
        |
        v
1000 database queries
```

This can overload the primary database.

### Possible solutions

**1. Request coalescing**

Allow one request to rebuild the cache while other requests wait for the result.

**2. Distributed locking**

Use a lock so only one application instance rebuilds the cache.

**3. TTL jitter**

Randomize expiration times to avoid synchronized expiration.

**4. Stale-while-revalidate**

Serve slightly stale cached data while refreshing it in the background, if the business requirements allow it.

**5. Prewarming**

Populate important cache entries before predictable traffic spikes.

The correct strategy depends on how expensive the underlying database query is and how much staleness is acceptable.

---

## 17. Real-World Architecture: Node.js + PostgreSQL + Redis

Consider an e-commerce backend.

PostgreSQL is the primary system of record.

Redis handles frequently accessed and temporary data.

```text
                    Client
                      |
                      v
                  Node.js API
                      |
             +--------+--------+
             |                 |
             v                 v
          Redis             PostgreSQL
             |                 |
             v                 v
        Cache / Session    Durable Records
        Rate Limit         Users / Orders
        Cart State         Payments / Products
```

### Responsibilities

| Data          | Storage                                              | Reason                         |
| ------------- | ---------------------------------------------------- | ------------------------------ |
| User account  | PostgreSQL                                           | Durable relational data        |
| Orders        | PostgreSQL                                           | Transactional business records |
| Payments      | PostgreSQL or appropriate payment ledger system      | Integrity and durability       |
| Product cache | Redis                                                | Fast retrieval                 |
| User sessions | Redis                                                | Fast lookup and expiration     |
| OTP           | Redis                                                | Temporary storage with TTL     |
| API counters  | Redis                                                | Atomic increments              |
| Leaderboard   | Redis Sorted Set                                     | Ranking operations             |
| Shopping cart | Redis or durable database, depending on requirements | Fast mutable state             |

### Important architectural principle

Redis should not automatically replace PostgreSQL.

A common architecture uses:

- PostgreSQL as the durable system of record.
- Redis as a cache and fast operational data store.

This separation allows each database to handle workloads suited to its strengths.

---

## 18. Common Data Modeling Mistakes

| Mistake                                      | Why it is problematic                                  | Better approach                                   |
| -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| Inconsistent key naming                      | Difficult to locate and manage keys                    | Establish naming conventions                      |
| Storing excessively large values             | Higher memory and network costs                        | Store appropriately sized values                  |
| No TTL for temporary data                    | Unnecessary memory consumption                         | Set expiration policies                           |
| Caching everything                           | Wastes memory and adds complexity                      | Cache frequently accessed or expensive data       |
| No cache invalidation strategy               | Stale data                                             | Define update and invalidation workflows          |
| Using one global counter for extreme traffic | Potential hot-key bottleneck                           | Split or redesign counter workload                |
| Assuming Redis is durable by default         | Potential data loss                                    | Configure persistence and recovery                |
| Using Redis as the only payment record store | Inadequate durability or integrity for the requirement | Use an appropriate transactional system of record |
| Trusting cached prices during checkout       | May use outdated values                                | Revalidate authoritative prices                   |
| Using many individual network requests       | Unnecessary round trips                                | Use appropriate commands, pipelining, or batching |

---

## 19. Interview Questions and Answers

### Q1. What is key-value data modeling?

It is the process of designing keys, values, data structures, and access patterns for a key-value database.

### Q2. Why are Redis key naming conventions important?

They make keys predictable, organized, easier to debug, and less likely to collide across application features.

### Q3. When should you use Redis Hashes instead of JSON strings?

Use hashes when you need independent field retrieval and updates. Use JSON strings when the application usually reads and writes the complete serialized object.

### Q4. What is cache-aside?

A caching pattern where the application checks the cache first, queries the primary database on a miss, and stores the result in the cache.

### Q5. What is cache invalidation?

The process of removing or updating cached data when the underlying source data changes.

### Q6. What is TTL jitter?

Adding a random variation to cache expiration times to reduce simultaneous cache expiration.

### Q7. What is a cache stampede?

A situation where many requests simultaneously rebuild an expired or missing cache entry, potentially overloading the primary database.

### Q8. What is a hot key?

A key that receives disproportionately high traffic and can become a bottleneck.

### Q9. What is the difference between LRU and LFU?

LRU considers how recently a key was accessed. LFU considers how frequently a key was accessed.

### Q10. What is write-through caching?

A pattern in which the application updates the cache and primary database as part of the same logical write workflow.

### Q11. What is write-behind caching?

A pattern in which changes are written to the cache first and persisted to the primary database asynchronously.

### Q12. Why should we not blindly store payment records in Redis?

Payment records require appropriate durability, transaction guarantees, and integrity controls. A cache or temporary in-memory store should not automatically become the authoritative financial ledger.

### Q13. How can Redis be used for rate limiting?

Use atomic counters with expiration, or implement a more advanced algorithm such as token bucket or sliding window.

### Q14. Why are Sorted Sets useful for leaderboards?

They associate members with scores and maintain ordering, making ranking and top-member queries efficient.

### Q15. Why is data modeling different in key-value databases compared with relational databases?

Relational design often starts with entities, relationships, and constraints. Key-value design focuses heavily on access patterns and the keys needed to retrieve data efficiently.

---

## 20. Practical Exercises

### Exercise 1: Design Redis keys

Design consistent Redis keys for:

1. User profile.
2. User session.
3. Shopping cart.
4. Product details.
5. OTP verification.
6. API rate limit.
7. Campaign leaderboard.
8. Product inventory cache.
9. Password reset token.
10. Feature flag.

### Exercise 2: Choose the data structure

Select a suitable Redis structure for each requirement.

| Requirement                               | Your choice |
| ----------------------------------------- | ----------- |
| Store a serialized product response       | ?           |
| Store user profile fields                 | ?           |
| Maintain a queue of pending notifications | ?           |
| Store unique online user IDs              | ?           |
| Maintain a ranked game leaderboard        | ?           |
| Track append-oriented application events  | ?           |
| Count API requests                        | ?           |

### Exercise 3: Cache invalidation

A product's price changes in PostgreSQL.

Redis still has the old price.

Explain:

1. Why stale data occurs.
2. How cache-aside handles the next request.
3. How to invalidate the cache after an update.
4. What happens if cache invalidation fails.
5. Why TTL alone may not be sufficient.

### Exercise 4: Design rate limiting

Requirement:

```text
Maximum 100 requests per minute per user.
```

Design:

1. Redis key format.
2. Counter strategy.
3. TTL strategy.
4. Atomic update operation.
5. API response when the limit is exceeded.
6. What happens at a fixed-window boundary?

### Exercise 5: Design a leaderboard

Requirement:

- 100,000 players.
- Each player has a score.
- Scores can increase.
- Retrieve the top 10 players.
- Retrieve an individual player's rank.

Explain:

1. Which Redis data structure you would use.
2. How to add a player.
3. How to update a score.
4. How to retrieve the top 10.
5. How to retrieve a player's rank.

### Exercise 6: Design a production cache

Your Node.js application receives 50,000 requests per minute for product information.

Design a Redis caching strategy.

Include:

- Key format.
- Value format.
- TTL.
- Cache invalidation.
- Hot-key mitigation.
- Cache stampede prevention.
- Redis failure handling.
- PostgreSQL fallback.

---

## 21. Chapter Summary

| Concept            | Key takeaway                                              |
| ------------------ | --------------------------------------------------------- |
| Key naming         | Design predictable, consistent keys                       |
| Redis String       | Stores simple values, counters, and serialized data       |
| Redis Hash         | Stores field-value pairs                                  |
| Redis List         | Stores ordered elements                                   |
| Redis Set          | Stores unique elements                                    |
| Redis Sorted Set   | Stores members ordered by scores                          |
| Session storage    | Uses session identifiers as keys                          |
| Cache-aside        | Checks cache before querying the primary database         |
| Cache invalidation | Removes or updates stale cached information               |
| TTL                | Controls key expiration                                   |
| TTL jitter         | Randomizes expiration to reduce synchronized cache misses |
| Rate limiting      | Uses counters and expiration to control request frequency |
| Counter            | Uses atomic increment operations                          |
| Leaderboard        | Uses Sorted Sets for rankings                             |
| Hot key            | A key receiving disproportionate traffic                  |
| Eviction           | Removes keys according to a memory policy                 |
| Cache stampede     | Many requests rebuild the same missing cache entry        |
| Write-through      | Updates cache and primary database in the write workflow  |
| Write-behind       | Persists cache updates asynchronously                     |
| Data modeling      | Starts with application access patterns                   |

### Final mental model

```text
                 KEY-VALUE DATA MODELING
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
          KEY DESIGN   DATA STRUCTURE   LIFECYCLE
             |             |             |
             v             v             v
          Naming       String/Hash     TTL
          Prefixes     List/Set        Expiration
          IDs          Sorted Set      Invalidation
                           |
                           v
                    ACCESS PATTERNS
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
        Cache            Session         Rate Limit
          |                |                |
          v                v                v
      PostgreSQL        Authentication    Counters
       Fallback          and Security      and TTL
```

### The most important points to remember

1. Design Redis keys around actual application access patterns.
2. Use consistent key naming conventions.
3. Choose Redis data structures according to the operations you need.
4. Use TTL for temporary information.
5. Define a cache invalidation strategy.
6. Use atomic Redis commands for counters and other concurrent operations.
7. Use Sorted Sets for ranking and leaderboard workloads.
8. Understand hot keys, cache stampedes, and eviction policies.
9. Do not treat cached information as authoritative business data without an explicit consistency design.
10. Redis and PostgreSQL can complement each other rather than compete.

**Engineering takeaway:** Good key-value data modeling is not about storing everything in Redis. It is about identifying the right access patterns, choosing the appropriate data structures, controlling data lifetime, and designing failure and consistency behavior.
