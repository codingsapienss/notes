---
sidebar_label: Types of Database Indexes
sidebar_position: 1
---

# Types of Database Indexes

## 1. Introduction

In last 2 sections, we learned why databases need indexes, B-Trees and B+ Trees, which explain how database indexes organize and locate data efficiently.

Now we need to understand another important question:

**Are all database indexes implemented using B-Trees?**

No.

Different queries require different types of indexes.

For example:

- Finding a user by email requires efficient equality lookup.
- Finding products within a price range requires range searching.
- Searching JSON documents requires indexing document contents.
- Searching text requires full-text indexing.
- Searching geographical locations requires spatial indexing.
- Finding records in massive time-ordered tables may benefit from block-range indexing.

Databases provide different index structures to handle these workloads.

In this chapter, we will focus primarily on PostgreSQL and its available index methods.

---

## 2. Overview of Index Types

PostgreSQL supports several index access methods.

| Index Type | Primary Purpose                      | Typical Use Case                          |
| ---------- | ------------------------------------ | ----------------------------------------- |
| B-Tree     | Equality, range, ordering            | Email, price, timestamps                  |
| Hash       | Equality comparisons                 | Exact key lookup                          |
| GiST       | Generalized search structures        | Geospatial and range operations           |
| GIN        | Inverted indexing                    | JSONB, arrays, full-text search           |
| BRIN       | Block-range summaries                | Very large, physically correlated tables  |
| SP-GiST    | Partitioned search structures        | Certain spatial and geometric data        |
| Bloom      | Multi-column probabilistic filtering | Large tables with many searchable columns |

We will cover the main types in detail.

---

# 3. B-Tree Index

<badge color="success">General-purpose index</badge>

### 3.1 What Is a B-Tree Index?

A B-Tree index is a balanced tree-based index structure that keeps indexed values organized in sorted order.

It is PostgreSQL's default index type.

Example:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

PostgreSQL creates a B-Tree index by default.

You can explicitly specify it:

```sql
CREATE INDEX idx_users_email
ON users USING BTREE(email);
```

### 3.2 How Does It Work?

Suppose the email values are:

```text
amit@gmail.com
karan@gmail.com
neha@gmail.com
prashant@gmail.com
rahul@gmail.com
```

The B-Tree index organizes these values in sorted order.

Conceptually:

```text
                 [karan@gmail.com]
                /                 \
       [amit@gmail.com]       [neha@gmail.com]
                                   |
                          [prashant@gmail.com]
                                   |
                             [rahul@gmail.com]
```

This is only an illustrative representation, not an actual PostgreSQL index layout.

When a query searches for a particular email, the database navigates through the tree to find the matching entry.

### 3.3 Supported Operations

B-Tree indexes are useful for:

**Equality**

```sql
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

**Greater than**

```sql
SELECT *
FROM products
WHERE price > 1000;
```

**Less than**

```sql
SELECT *
FROM products
WHERE price < 5000;
```

**Range**

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

**Sorting**

```sql
SELECT *
FROM products
ORDER BY price;
```

**Minimum and maximum**

```sql
SELECT MIN(price)
FROM products;
```

```sql
SELECT MAX(price)
FROM products;
```

A suitable B-Tree index can help these queries.

### 3.4 When Should You Use B-Tree?

Use B-Tree for common relational database workloads:

- User lookup by email.
- Finding orders by creation date.
- Finding products within a price range.
- Sorting records by timestamp.
- Searching by primary key.
- Filtering records using equality or range conditions.

### 3.5 When Is B-Tree Not the Best Choice?

B-Tree is not designed to efficiently support every type of search.

For example:

```sql
SELECT *
FROM products
WHERE description ILIKE '%wireless%';
```

A normal B-Tree index generally cannot efficiently support a leading-wildcard substring search like this.

For such requirements, consider specialized approaches such as GIN with full-text search or the `pg_trgm` extension.

---

# 4. Hash Index

### 4.1 What Is a Hash Index?

A Hash Index uses a hash function to map a key to a location in an index structure.

It is primarily designed for equality comparisons.

Example:

```sql
CREATE INDEX idx_users_email_hash
ON users USING HASH(email);
```

### 4.2 How Does It Work?

Suppose we have:

```text
email = prashant@gmail.com
```

A hash function processes the email value:

```text
Hash Function
      |
      v
Hash(email)
      |
      v
Bucket Location
      |
      v
Find Matching Entry
```

Conceptually:

```text
Email                  Hash Bucket

amit@gmail.com         Bucket 1
karan@gmail.com        Bucket 2
prashant@gmail.com     Bucket 3
rahul@gmail.com        Bucket 4
```

The database calculates the hash value for the search key and uses it to locate the corresponding bucket.

The hash value does not uniquely identify the original value. Different values can produce hash collisions, so the database must still verify the actual key.

### 4.3 Supported Operations

Hash indexes support equality comparisons.

Example:

```sql
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

### 4.4 What Cannot Hash Indexes Efficiently Support?

Hash indexes do not support ordered range searches.

For example:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

A hash index cannot efficiently navigate values in sorted order because it does not maintain the same ordered structure as a B-Tree.

It also cannot directly provide ordered index traversal for:

```sql
ORDER BY price;
```

### 4.5 B-Tree vs Hash Index

| Feature             | B-Tree        | Hash         |
| ------------------- | ------------- | ------------ |
| Equality search     | Yes           | Yes          |
| Range search        | Yes           | No           |
| Sorting             | Yes           | No           |
| Ordered traversal   | Yes           | No           |
| Main structure      | Balanced tree | Hash buckets |
| General-purpose use | Very common   | Specialized  |

### 4.6 When Should You Use Hash Index?

Use a Hash Index when:

- Queries primarily use equality comparisons.
- You have a specific workload where benchmarking demonstrates an advantage.

However, do not assume Hash Index is automatically faster than B-Tree for equality queries.

B-Tree is often sufficient and provides more query capabilities.

**Practical recommendation:** Start with B-Tree unless you have a measured reason to use Hash.

---

# 5. GIN Index — Generalized Inverted Index

<badge color="success">Useful for JSONB and arrays</badge>

### 5.1 What Is a GIN Index?

GIN stands for:

**Generalized Inverted Index.**

A GIN index is designed for values that contain multiple searchable elements.

Examples:

- JSONB documents
- Arrays
- Full-text search documents

Unlike a typical B-Tree index, which organizes a key value and its row references, a GIN index maintains entries that map individual components to the rows containing those components.

### 5.2 Understanding Inverted Indexing

Suppose we have these product records:

| Product ID | Tags                  |
| ---------: | --------------------- |
|          1 | electronics, wireless |
|          2 | electronics, gaming   |
|          3 | furniture, office     |
|          4 | wireless, accessories |

A normal row-oriented representation looks like:

```text
Product 1 → electronics, wireless
Product 2 → electronics, gaming
Product 3 → furniture, office
Product 4 → wireless, accessories
```

An inverted index reorganizes the information:

```text
electronics → Product 1, Product 2
wireless    → Product 1, Product 4
gaming      → Product 2
furniture   → Product 3
office      → Product 3
accessories → Product 4
```

Now the database can efficiently locate records containing a particular element.

### 5.3 GIN Index on an Array

Create a table:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT,
    tags TEXT[]
);
```

Insert data:

```sql
INSERT INTO products (name, tags)
VALUES
('Laptop', ARRAY['electronics', 'computer']),
('Mouse', ARRAY['electronics', 'wireless']),
('Chair', ARRAY['furniture', 'office']),
('Keyboard', ARRAY['electronics', 'wireless']);
```

Create a GIN index:

```sql
CREATE INDEX idx_products_tags
ON products USING GIN(tags);
```

Search for products containing a particular tag:

```sql
SELECT *
FROM products
WHERE tags @> ARRAY['wireless'];
```

The `@>` operator checks whether the left array contains the right array.

The GIN index can help locate matching rows.

### 5.4 GIN Index on JSONB

JSONB is a PostgreSQL data type for storing JSON documents in a binary representation that supports indexing and efficient processing.

Example table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    metadata JSONB
);
```

Insert records:

```sql
INSERT INTO users (name, metadata)
VALUES
(
    'Prashant',
    '{"city": "Noida", "skills": ["Node.js", "PostgreSQL"]}'
),
(
    'Rahul',
    '{"city": "Delhi", "skills": ["React", "JavaScript"]}'
),
(
    'Neha',
    '{"city": "Noida", "skills": ["Python", "PostgreSQL"]}'
);
```

Create a GIN index:

```sql
CREATE INDEX idx_users_metadata
ON users USING GIN(metadata);
```

Search JSONB documents:

```sql
SELECT *
FROM users
WHERE metadata @> '{"city": "Noida"}';
```

This asks PostgreSQL to find documents containing the specified JSON structure.

### 5.5 GIN Operator Classes

PostgreSQL provides different GIN operator classes.

Two important JSONB choices are:

**Default `jsonb_ops`:**

```sql
CREATE INDEX idx_users_metadata
ON users USING GIN(metadata);
```

It supports a broader set of JSONB operators, including containment and key-existence operations.

**`jsonb_path_ops`:**

```sql
CREATE INDEX idx_users_metadata_path
ON users USING GIN(metadata jsonb_path_ops);
```

It supports a narrower set of operators, particularly containment and JSONPath match operations.

It is often smaller and can be more efficient for workloads centered on those supported operations.

It does not support every operation available with `jsonb_ops`.

### 5.6 GIN Advantages

- Useful for JSONB containment queries.
- Useful for array element searches.
- Useful for full-text search.
- Can efficiently map elements to matching rows.

### 5.7 GIN Disadvantages

- Can require significant storage.
- Index maintenance can be expensive.
- Inserts and updates can be slower than with simpler indexes.
- Some GIN configurations use pending-list mechanisms that require maintenance.

### 5.8 When Should You Use GIN?

Use GIN when searching inside structured values containing multiple elements.

Examples:

- Find users with a particular skill in a JSONB document.
- Find products containing a particular tag.
- Search documents containing multiple terms.
- Search array values.

---

# 6. GiST Index — Generalized Search Tree

### 6.1 What Is a GiST Index?

GiST stands for:

**Generalized Search Tree.**

It is a flexible indexing framework that supports different kinds of search structures.

Unlike B-Tree, which focuses on ordering, GiST can support more complex search operations through operator classes.

Common use cases include:

- Geospatial data
- Geometric objects
- Range types
- Similarity and specialized searches

### 6.2 Understanding the Concept

Imagine an application storing geographical locations.

Each location has:

```text
Latitude
Longitude
```

Example:

```text
User A → Noida
User B → Delhi
User C → Mumbai
```

Suppose we want to find all locations within a particular distance of a point.

A simple approach could calculate the distance for every record.

For a large dataset, that may be expensive.

A suitable spatial index can help narrow down the candidate locations.

### 6.3 PostgreSQL Geospatial Example

PostgreSQL supports spatial functionality through the PostGIS extension.

Example:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Create a locations table:

```sql
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name TEXT,
    location GEOGRAPHY(POINT, 4326)
);
```

Insert locations:

```sql
INSERT INTO locations (name, location)
VALUES
(
    'Noida',
    ST_SetSRID(ST_MakePoint(77.3910, 28.5355), 4326)::geography
),
(
    'Delhi',
    ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography
);
```

Create a GiST index:

```sql
CREATE INDEX idx_locations_geo
ON locations USING GIST(location);
```

Find locations within 10 kilometres of a given point:

```sql
SELECT *
FROM locations
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(77.3910, 28.5355), 4326)::geography,
    10000
);
```

The distance is specified in metres for the geography type.

The GiST index can help the spatial operation identify candidate rows efficiently.

### 6.4 GiST for Range Types

PostgreSQL also supports range data types.

Example:

```sql
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT,
    booking_period DATERANGE
);
```

Create a GiST index:

```sql
CREATE INDEX idx_reservations_period
ON reservations USING GIST(booking_period);
```

Find reservations overlapping a particular period:

```sql
SELECT *
FROM reservations
WHERE booking_period &&
      daterange('2026-11-14', '2026-11-20', '[)');
```

The `&&` operator checks whether the ranges overlap.

### 6.5 When Should You Use GiST?

- Spatial searches
- Geometric operations
- Range overlap queries
- Specialized operator classes
- Similarity searches with appropriate extensions

---

# 7. BRIN Index — Block Range Index

<badge color="success">Useful for very large tables</badge>

### 7.1 What Is a BRIN Index?

BRIN stands for:

**Block Range Index.**

Unlike B-Tree and GIN, BRIN does not normally maintain an individual index entry for every row.

Instead, it stores summary information for ranges of physical table blocks.

This makes BRIN indexes relatively small.

### 7.2 Why Do We Need BRIN?

Imagine an analytics application storing 500 million event records.

The table contains:

```text
id
user_id
event_type
created_at
```

Records are mostly inserted in chronological order.

For example:

```text
Earlier pages:
Events from January

Middle pages:
Events from February

Later pages:
Events from March
```

Now suppose we query:

```sql
SELECT *
FROM events
WHERE created_at >= '2026-03-01'
  AND created_at < '2026-03-02';
```

A BRIN index can store summaries describing the minimum and maximum timestamps found in each range of table blocks.

### 7.3 How Does BRIN Work?

Suppose the table is divided into block ranges:

```text
Block Range 1:
Minimum date = January 1
Maximum date = January 10

Block Range 2:
Minimum date = January 11
Maximum date = January 20

Block Range 3:
Minimum date = February 1
Maximum date = February 10

Block Range 4:
Minimum date = March 1
Maximum date = March 10
```

The query asks for March 5.

The BRIN index can identify block ranges whose summaries might contain that date.

It can skip ranges that definitely cannot contain matching records.

Conceptually:

```text
Search for March 5
       |
       v
Check BRIN summaries
       |
       v
Skip January ranges
       |
       v
Skip February range
       |
       v
Read March block range
       |
       v
Check individual rows
```

Important: BRIN is a lossy index. It identifies potentially matching page ranges, so PostgreSQL must recheck individual rows.

### 7.4 Create a BRIN Index

```sql
CREATE INDEX idx_events_created_at
ON events USING BRIN(created_at);
```

You can configure the number of table pages summarized by each BRIN range:

```sql
CREATE INDEX idx_events_created_at
ON events USING BRIN(created_at)
WITH (pages_per_range = 128);
```

Smaller ranges generally provide more detailed summaries but increase index size.

Larger ranges generally make the index smaller but can produce more false-positive candidate pages.

### 7.5 When Should You Use BRIN?

BRIN works particularly well when:

- Tables contain very large amounts of data.
- Values correlate with physical row order.
- Data is inserted in a relatively ordered manner.
- Queries commonly filter by ranges.

Examples:

- Event timestamps
- Log records
- Sensor readings
- Historical measurements

### 7.6 When Is BRIN Not Suitable?

Suppose a table's timestamps are completely random relative to physical row placement.

Each block range might contain a wide range of timestamps.

The BRIN summaries become less selective.

In that case, BRIN may not eliminate many block ranges.

**Important:** BRIN is not simply a smaller replacement for B-Tree. It is useful for a different workload.

---

# 8. SP-GiST Index

SP-GiST stands for:

**Space-Partitioned Generalized Search Tree.**

It supports partitioned search structures.

Unlike GiST, which is a generalized tree framework, SP-GiST is designed for data structures that partition a search space into non-overlapping regions.

Examples include:

- Quadtrees
- Tries
- Radix trees
- Certain geometric and spatial searches

### 8.1 Conceptual Example

Suppose geographical points are distributed across a two-dimensional space.

A quadtree divides the space into four regions:

```text
+----------------+----------------+
|                |                |
|   Region 1     |    Region 2    |
|                |                |
+----------------+----------------+
|                |                |
|   Region 3     |    Region 4    |
|                |                |
+----------------+----------------+
```

Each region can be subdivided further.

The search can navigate only relevant partitions rather than examining every point.

### 8.2 PostgreSQL Example

PostgreSQL supports SP-GiST for certain data types, including point data.

```sql
CREATE TABLE points (
    id SERIAL PRIMARY KEY,
    location POINT
);
```

Create an index:

```sql
CREATE INDEX idx_points_location
ON points USING SPGIST(location);
```

Search for points using supported geometric operators:

```sql
SELECT *
FROM points
WHERE location <@ box(point(0, 0), point(100, 100));
```

The exact usefulness depends on the operator class and query.

### 8.3 When Should You Use SP-GiST?

Use it when the data and query pattern fit a supported partitioned search structure.

It is a specialized index, not a default choice for ordinary relational lookups.

---

# 9. Bloom Index

### 9.1 What Is a Bloom Index?

A Bloom index is based on a probabilistic data structure called a Bloom filter.

It is designed to efficiently test whether a record might match values across multiple columns.

It can help with queries that filter on different combinations of columns.

### 9.2 Understanding Bloom Filters

A Bloom filter uses a bit array and multiple hash functions.

When an element is inserted:

1. The element is processed by hash functions.
2. Each hash function identifies a bit position.
3. Those bits are set to 1.

When checking an element:

1. The hash functions calculate the corresponding positions.
2. If any required bit is 0, the element definitely is not present.
3. If all required bits are 1, the element may be present.

A Bloom filter can produce false positives but not false negatives under its standard operation.

This means it may say that an element could exist even when it does not.

The actual row values must still be checked.

### 9.3 PostgreSQL Bloom Extension

PostgreSQL provides Bloom indexing through an extension.

```sql
CREATE EXTENSION bloom;
```

Example table:

```sql
CREATE TABLE users (
    id INT,
    age INT,
    city TEXT,
    department TEXT
);
```

Create a Bloom index:

```sql
CREATE INDEX idx_users_bloom
ON users USING BLOOM(id, age, city, department);
```

This can support certain equality conditions across indexed columns.

Example:

```sql
SELECT *
FROM users
WHERE age = 25
  AND city = 'Noida';
```

### 9.4 When Should You Use Bloom?

It may be useful when:

- Tables are very large.
- Queries filter on different combinations of columns.
- Exact-match searches are common.
- Traditional composite indexes would require many index combinations.

### 9.5 Limitations

- It is lossy.
- It can generate false positives.
- It does not provide ordinary ordered traversal.
- It does not replace B-Tree indexes for general-purpose queries.
- It requires the PostgreSQL Bloom extension.

---

# 10. Full-Text Search Indexing

Full-text search is different from searching for an exact value.

Consider:

```sql
SELECT *
FROM articles
WHERE content LIKE '%database indexing%';
```

This is a substring search.

It does not understand language, word normalization, or search relevance.

PostgreSQL provides full-text search using:

- `tsvector`
- `tsquery`
- GIN indexes

### 10.1 What Is tsvector?

A `tsvector` is PostgreSQL's normalized representation of a document for full-text search.

For example:

```text
"The database indexes are useful"
```

PostgreSQL can process the text into normalized searchable terms.

Common words may be removed as stop words, and words may be reduced to normalized lexemes.

### 10.2 What Is tsquery?

A `tsquery` represents the search expression.

Example:

```sql
SELECT to_tsvector('english', 'Database indexing is useful');
```

Search:

```sql
SELECT to_tsquery('english', 'database & indexing');
```

The `&` operator means both terms must match.

### 10.3 Create a Full-Text Search Index

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT
);
```

Create a GIN index:

```sql
CREATE INDEX idx_articles_search
ON articles
USING GIN(
    to_tsvector('english', title || ' ' || content)
);
```

Search:

```sql
SELECT *
FROM articles
WHERE to_tsvector('english', title || ' ' || content)
      @@ to_tsquery('english', 'database & indexing');
```

The `@@` operator matches a document vector against a search query.

### 10.4 When Should You Use Full-Text Search?

- Article search
- Blog search
- Product description search
- Documentation search
- Knowledge-base search

For production workloads, consider storing a generated `tsvector` column or using a suitable expression index, and make sure the query expression matches the index definition.

---

# 11. Expression Index

### 11.1 What Is an Expression Index?

An expression index stores the result of an expression rather than indexing a column value directly.

Example:

```sql
CREATE INDEX idx_users_lower_email
ON users(LOWER(email));
```

This is useful for case-insensitive searches.

Query:

```sql
SELECT *
FROM users
WHERE LOWER(email) = 'prashant@gmail.com';
```

Without a matching expression index, PostgreSQL may need to evaluate `LOWER(email)` for many rows.

With the index, it can potentially locate matching entries efficiently.

### 11.2 Another Example

Suppose we frequently search by the year of an order:

```sql
SELECT *
FROM orders
WHERE EXTRACT(YEAR FROM created_at) = 2026;
```

A matching expression index could be:

```sql
CREATE INDEX idx_orders_year
ON orders(EXTRACT(YEAR FROM created_at));
```

However, a normal timestamp range query with a B-Tree index is often a better design:

```sql
SELECT *
FROM orders
WHERE created_at >= '2026-01-01'
  AND created_at < '2027-01-01';
```

Do not create expression indexes without understanding the actual query workload.

---

# 12. Partial Index

### 12.1 What Is a Partial Index?

A partial index contains entries only for rows satisfying a specified condition.

Suppose an orders table contains:

```text
Total orders = 10 million
Pending orders = 50,000
Completed orders = 8 million
Cancelled orders = 1.95 million
```

If the application frequently fetches pending orders, indexing every row may be unnecessary.

Create:

```sql
CREATE INDEX idx_pending_orders
ON orders(created_at)
WHERE status = 'pending';
```

Now the index contains only pending orders.

Query:

```sql
SELECT *
FROM orders
WHERE status = 'pending'
ORDER BY created_at;
```

PostgreSQL may use the partial index if the query predicate implies its index condition.

### 12.2 Advantages

- Smaller index.
- Less index storage.
- Less maintenance for rows outside the indexed subset.
- Useful for frequently queried subsets.

### 12.3 Common Use Cases

- Active users
- Pending orders
- Unprocessed jobs
- Non-deleted records
- Available inventory

---

# 13. Unique Index

### 13.1 What Is a Unique Index?

A unique index ensures that duplicate indexed key values are not allowed, according to the database's uniqueness and NULL semantics.

Example:

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email);
```

Now duplicate non-NULL email values are rejected.

### 13.2 Unique Index vs Unique Constraint

You can also define uniqueness as a constraint:

```sql
ALTER TABLE users
ADD CONSTRAINT users_email_unique
UNIQUE(email);
```

PostgreSQL creates a unique B-Tree index to enforce this constraint.

The difference is primarily in the database schema semantics:

- A unique constraint expresses a relational integrity rule.
- A unique index is an index object that enforces uniqueness.

For ordinary use, a unique constraint is often the clearer choice when the goal is to enforce a business rule.

### 13.3 NULL Behavior

PostgreSQL's default unique constraint permits multiple NULL values because NULL values are treated as distinct for uniqueness checking.

If you need NULL values to be treated as equal for uniqueness, PostgreSQL supports:

```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email) NULLS NOT DISTINCT;
```

This is a PostgreSQL-specific feature available in modern PostgreSQL versions.

---

# 14. Index Type Comparison

This is the main comparison table for the chapter.

| Index Type | Equality           | Range                             | Ordered Search               | Specialized Use                      |
| ---------- | ------------------ | --------------------------------- | ---------------------------- | ------------------------------------ |
| B-Tree     | Yes                | Yes                               | Yes                          | General-purpose                      |
| Hash       | Yes                | No                                | No                           | Equality lookup                      |
| GIN        | Operator-dependent | Not general numeric range         | No                           | JSONB, arrays, full-text             |
| GiST       | Operator-dependent | Range/spatial operations          | Not general ordering         | Spatial and range data               |
| BRIN       | Operator-dependent | Yes, with suitable operator class | No general ordered traversal | Huge correlated tables               |
| SP-GiST    | Operator-dependent | Specialized                       | No general ordering          | Partitioned spatial/text structures  |
| Bloom      | Equality-oriented  | No                                | No                           | Multi-column probabilistic filtering |

Additional index structures:

| Index Type          | Main Purpose                     |
| ------------------- | -------------------------------- |
| Expression Index    | Index computed expressions       |
| Partial Index       | Index only selected rows         |
| Unique Index        | Enforce uniqueness               |
| Full-Text GIN Index | Search normalized document terms |

**Important:** Expression, partial, and unique indexes describe index properties or definitions, not separate PostgreSQL index access methods like B-Tree or GIN.

---

# 15. Choosing the Right Index: Real Backend Scenarios

Consider an e-commerce application.

### Scenario 1: Find User by Email

```sql
SELECT *
FROM users
WHERE email = 'user@gmail.com';
```

Recommended:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

Reason: B-Tree supports equality lookup.

### Scenario 2: Find Products by Price Range

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

Recommended:

```sql
CREATE INDEX idx_products_price
ON products(price);
```

Reason: B-Tree supports range searches.

### Scenario 3: Search Products by Tags

```sql
SELECT *
FROM products
WHERE tags @> ARRAY['wireless'];
```

Recommended:

```sql
CREATE INDEX idx_products_tags
ON products USING GIN(tags);
```

Reason: GIN supports searches over multiple array elements.

### Scenario 4: Search JSONB User Metadata

```sql
SELECT *
FROM users
WHERE metadata @> '{"city": "Noida"}';
```

Recommended:

```sql
CREATE INDEX idx_users_metadata
ON users USING GIN(metadata);
```

Reason: GIN supports JSONB containment queries.

### Scenario 5: Find Nearby Stores

```sql
SELECT *
FROM stores
WHERE ST_DWithin(location, target_location, 5000);
```

Potentially suitable:

```sql
CREATE INDEX idx_stores_location
ON stores USING GIST(location);
```

Reason: GiST supports appropriate spatial operator classes.

### Scenario 6: Find Recent Events in a Massive Table

```sql
SELECT *
FROM events
WHERE created_at >= '2026-11-01'
  AND created_at < '2026-11-02';
```

Potentially suitable:

```sql
CREATE INDEX idx_events_created_at
ON events USING BRIN(created_at);
```

Reason: BRIN can efficiently eliminate irrelevant block ranges when timestamps correlate with physical row order.

---

# 16. How to Inspect Indexes in PostgreSQL

### 16.1 List Indexes

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

### 16.2 Inspect Index Usage Statistics

```sql
SELECT
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes;
```

These statistics can help identify which indexes have been scanned and how many index entries and table tuples were involved.

Remember that statistics are collected over the current statistics-reset period and may not represent every workload or application instance.

### 16.3 Inspect Index Size

```sql
SELECT
    indexrelname AS index_name,
    pg_size_pretty(
        pg_relation_size(indexrelid)
    ) AS index_size
FROM pg_stat_user_indexes;
```

### 16.4 Check Query Execution

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

Do not select an index type based only on its name. Verify that the actual query plan uses it effectively.

---

# 17. Important Production Considerations

### 17.1 Indexes Are Not Free

Every additional index consumes storage and requires maintenance.

Do not create multiple overlapping indexes without a reason.

### 17.2 Index Selectivity Matters

An index is often most useful when it narrows a query to a relatively small subset of rows.

However, selectivity is not the only consideration. The query plan, table size, clustering, and index type also matter.

### 17.3 Indexes Need Maintenance

Index structures can experience bloat and require maintenance depending on the database and workload.

PostgreSQL provides operations such as:

```sql
REINDEX INDEX idx_users_email;
```

For a large production index, consider the impact of locking and the concurrent alternative:

```sql
REINDEX INDEX CONCURRENTLY idx_users_email;
```

### 17.4 Use EXPLAIN ANALYZE

Always inspect query plans when performance matters.

An index existing in the database does not prove that it improves a particular query.

### 17.5 Match the Index to the Query

Examples:

- B-Tree for common equality and range queries.
- GIN for JSONB containment and array membership.
- GiST for suitable spatial and range operations.
- BRIN for very large, physically correlated datasets.
- Hash for specialized equality-only workloads.

---

# 18. Common Misconceptions

### Misconception 1: B-Tree is the only index type.

Incorrect. PostgreSQL supports multiple index access methods, including B-Tree, Hash, GiST, GIN, BRIN, and SP-GiST.

### Misconception 2: Hash indexes are always faster than B-Tree for equality.

Incorrect. Performance depends on the workload and implementation. B-Tree is generally the sensible default.

### Misconception 3: GIN and GiST are interchangeable.

Incorrect. They support different indexing models and workloads.

- GIN maps components to rows.
- GiST provides a generalized tree framework for supported search operations.

### Misconception 4: BRIN stores an entry for every row.

Incorrect. BRIN stores summaries for ranges of table blocks.

### Misconception 5: GIN is only for JSONB.

Incorrect. GIN also supports arrays and full-text search, among other operator classes.

### Misconception 6: Partial indexes are a separate index access method.

Incorrect. A partial index is an index defined over a subset of rows. It can use an underlying access method such as B-Tree or GIN.

### Misconception 7: Every query can use every index type.

Incorrect. Index usability depends on the operators supported by the index's operator class and the query expression.

### Misconception 8: A BRIN index is always better for large tables.

Incorrect. BRIN works best when the indexed values correlate with physical row order. Without that correlation, its summaries may be too broad to be useful.

---

# 19. Interview Questions and Answers

### Q1. What are the main index types in PostgreSQL?

B-Tree, Hash, GiST, GIN, BRIN, and SP-GiST. Bloom is also available through an extension.

### Q2. Which index type is the default in PostgreSQL?

B-Tree.

### Q3. What is the difference between B-Tree and Hash?

B-Tree supports equality, range searches, and ordered traversal. Hash primarily supports equality comparisons.

### Q4. What is GIN?

Generalized Inverted Index. It indexes components of composite values such as JSONB documents, arrays, and full-text search vectors.

### Q5. What is GiST?

Generalized Search Tree. It is a flexible indexing framework used by suitable spatial, geometric, range, and other operator classes.

### Q6. What is BRIN?

Block Range Index. It stores summaries for ranges of physical table blocks and is useful for very large tables whose values correlate with physical row order.

### Q7. What is the difference between GIN and GiST?

GIN maps individual components to matching rows, making it useful for multi-element values. GiST provides a generalized tree framework for different search strategies, including spatial and range searches.

### Q8. What is an expression index?

An index created on the result of an expression.

Example:

```sql
CREATE INDEX idx_users_lower_email
ON users(LOWER(email));
```

### Q9. What is a partial index?

An index containing only rows that satisfy a specified condition.

### Q10. What is a unique index?

An index that enforces uniqueness of indexed key values according to the database's NULL rules.

### Q11. Which index is suitable for JSONB containment queries in PostgreSQL?

GIN is commonly suitable.

### Q12. Which index is suitable for spatial searches in PostGIS?

GiST is commonly used, although the appropriate access method depends on the spatial operation and operator class.

### Q13. Which index is useful for huge time-series tables?

BRIN can be effective when timestamps correlate with physical row order. B-Tree may be more appropriate for other access patterns.

### Q14. What is a Bloom filter?

A probabilistic data structure that can test whether an element might be present. It can produce false positives but not false negatives under its standard operation.

---

# 20. Chapter Summary

## Index Types at a Glance

| Index      | Remember It For                              |
| ---------- | -------------------------------------------- |
| B-Tree     | General-purpose lookups, ranges, sorting     |
| Hash       | Equality-only indexing                       |
| GIN        | JSONB, arrays, full-text search              |
| GiST       | Spatial, geometric, and range operations     |
| BRIN       | Large tables with physically correlated data |
| SP-GiST    | Partitioned search structures                |
| Bloom      | Probabilistic multi-column filtering         |
| Expression | Computed values                              |
| Partial    | Selected rows only                           |
| Unique     | Uniqueness enforcement                       |

## Most Important Takeaways

1. Different queries require different index structures.
2. B-Tree is the general-purpose default in PostgreSQL.
3. Hash indexes are primarily designed for equality comparisons.
4. GIN is useful for JSONB, arrays, and full-text search.
5. GiST supports specialized searches such as spatial and range operations.
6. BRIN is useful for huge tables with physical data correlation.
7. Expression indexes support computed search values.
8. Partial indexes index only selected rows.
9. Unique indexes enforce uniqueness.
10. Always verify index effectiveness using query plans and actual workload measurements.
