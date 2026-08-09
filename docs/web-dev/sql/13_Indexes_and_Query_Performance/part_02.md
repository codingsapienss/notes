---
sidebar_label: "PostgreSQL Index Types"
sidebar_position: 1
---

# PostgreSQL Index Types

## 1. Introduction

PostgreSQL supports multiple index types, each designed for different query patterns and data structures.

Choosing the correct index type matters because an index optimized for equality searches may not be suitable for full-text search, JSONB queries or geometric data.

PostgreSQL's major index types:

| Index type | Best suited for                                                           |
| ---------- | ------------------------------------------------------------------------- |
| B-tree     | Equality, range comparisons and sorting                                   |
| Hash       | Equality comparisons                                                      |
| GIN        | Multiple values inside one row, arrays, JSONB and full-text search        |
| GiST       | Geometric data, ranges and specialized searches                           |
| SP-GiST    | Partitioned search structures, such as spatial and text-search structures |
| BRIN       | Very large tables where values correlate with physical row order          |

---

## 2. B-tree Index

<badge color="success">Default index type</badge>

B-tree is PostgreSQL's default and most commonly used index type.

It maintains indexed values in an ordered structure.

### Supported operations

- Equality (`=`)
- Greater than (`>`)
- Less than (`<`)
- Greater than or equal (`>=`)
- Less than or equal (`<=`)
- BETWEEN
- IN
- IS NULL
- ORDER BY

### Create a B-tree index

```sql
CREATE INDEX idx_products_price
ON products USING BTREE (price);
```

`USING BTREE` is optional because B-tree is the default.

Equivalent:

```sql
CREATE INDEX idx_products_price
ON products(price);
```

### Example 1: Equality search

```sql
SELECT *
FROM products
WHERE price = 1500;
```

### Example 2: Range search

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

### Example 3: Sorting

```sql
SELECT *
FROM orders
ORDER BY created_at DESC;
```

A suitable B-tree index may help PostgreSQL retrieve rows in the required order.

### Example 4: Multiple conditions

```sql
SELECT *
FROM employees
WHERE salary >= 50000
  AND salary <= 100000;
```

### When to use B-tree

Use B-tree when:

- Searching for exact values.
- Filtering using ranges.
- Sorting query results.
- Searching primary keys.
- Enforcing uniqueness.

**Practical recommendation:** Start with B-tree for ordinary relational columns unless your query pattern requires another index type.

---

## 3. Hash Index

Hash indexes are designed for equality comparisons.

They use a hash function to locate indexed values.

### Create a Hash index

```sql
CREATE INDEX idx_customers_email_hash
ON customers USING HASH (email);
```

### Supported use case

```sql
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

### Important limitations

Hash indexes support equality comparisons, not ordinary range or ordering operations.

These queries cannot use a hash index to support their comparison or sorting:

```sql
SELECT *
FROM products
WHERE price > 1000;
```

```sql
SELECT *
FROM customers
ORDER BY email;
```

### B-tree vs Hash

| B-tree                  | Hash                        |
| ----------------------- | --------------------------- |
| Equality searches       | Equality searches           |
| Range searches          | No range searches           |
| Supports ordering       | No ordering support         |
| Supports unique indexes | Cannot enforce uniqueness   |
| General-purpose         | Specialized equality access |

**Practical recommendation:** B-tree is usually the better default for equality searches too. Use Hash only when measurements show a meaningful benefit for your workload.

---

## 4. GIN Index — Generalized Inverted Index

GIN is designed for values containing multiple searchable components.

It is especially useful for:

- Arrays.
- JSONB.
- Full-text search.
- Multiple keys or elements stored in one column.

A normal B-tree index indexes a value as a whole. GIN can index the individual components of a composite value.

### Example: Array column

The supplied TechBazaar schema does not currently contain an array column. Consider this proposed extension:

```sql
ALTER TABLE products
ADD COLUMN tags TEXT[];
```

Example data:

```sql
UPDATE products
SET tags = ARRAY['electronics', 'mobile', 'premium']
WHERE product_id = 1;
```

### Create a GIN index

```sql
CREATE INDEX idx_products_tags
ON products USING GIN (tags);
```

### Search for an element

```sql
SELECT *
FROM products
WHERE tags @> ARRAY['mobile'];
```

This finds products whose tags contain `mobile`.

### Search for any matching element

```sql
SELECT *
FROM products
WHERE tags && ARRAY['mobile', 'electronics'];
```

The `&&` operator checks whether the arrays have at least one element in common.

### Search for multiple required elements

```sql
SELECT *
FROM products
WHERE tags @> ARRAY['mobile', 'premium'];
```

This finds rows containing both specified elements.

**Important:** GIN supports particular operators through its operator classes. It does not automatically accelerate every possible query on an array.

---

## 5. GIN Index for JSONB

GIN is commonly used with PostgreSQL JSONB columns.

The supplied TechBazaar schema does not currently include a JSONB product metadata column. This is a proposed extension:

```sql
ALTER TABLE products
ADD COLUMN metadata JSONB;
```

Example data:

```sql
UPDATE products
SET metadata = '{
    "brand": "Samsung",
    "color": "Black",
    "features": ["5G", "OLED"]
}'::JSONB
WHERE product_id = 1;
```

### Create a GIN index

```sql
CREATE INDEX idx_products_metadata
ON products USING GIN (metadata);
```

### Search for a JSONB key-value pair

```sql
SELECT *
FROM products
WHERE metadata @> '{"brand": "Samsung"}';
```

### Search for a key

```sql
SELECT *
FROM products
WHERE metadata ? 'brand';
```

### GIN operator classes for JSONB

PostgreSQL provides two commonly used JSONB GIN operator classes:

| Operator class   | Purpose                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `jsonb_ops`      | Supports key existence, containment and JSONPath operators                 |
| `jsonb_path_ops` | Supports containment and JSONPath matching, with narrower operator support |

Default GIN index:

```sql
CREATE INDEX idx_products_metadata
ON products USING GIN (metadata);
```

This uses the default `jsonb_ops` operator class.

Alternative:

```sql
CREATE INDEX idx_products_metadata_path
ON products USING GIN (metadata jsonb_path_ops);
```

**Important:** `jsonb_path_ops` does not support the key-existence operators such as `?`, `?|` and `?&`.

Choose the operator class based on the operators your application actually uses.

---

## 6. GIN Index for Full-Text Search

PostgreSQL provides built-in full-text search functionality.

GIN is commonly used to index searchable document content.

### Example

Suppose you want to search product descriptions.

The supplied schema does not currently contain a description column. This is a proposed extension:

```sql
ALTER TABLE products
ADD COLUMN description TEXT;
```

### Create a GIN index

```sql
CREATE INDEX idx_products_description_search
ON products
USING GIN (
    to_tsvector('english', description)
);
```

### Search products

```sql
SELECT *
FROM products
WHERE to_tsvector('english', description)
      @@ plainto_tsquery('english', 'wireless headphones');
```

The `@@` operator matches a document search vector against a text search query.

For production use, keep the text-search configuration consistent between the index expression and query expression.

---

## 7. GiST Index — Generalized Search Tree

GiST is a flexible index framework used for specialized search operations.

Common applications:

- Geometric data.
- Spatial queries.
- Range types.
- Nearest-neighbor searches.
- Specialized similarity operations.

GiST is particularly useful when ordinary B-tree indexing is not suitable for the data type or operators.

### Example: Range data

PostgreSQL supports range types such as:

- `int4range`
- `int8range`
- `numrange`
- `tsrange`
- `tstzrange`
- `daterange`

Suppose an application stores room reservations.

The supplied TechBazaar schema does not include reservations. Consider this separate example:

```sql
CREATE TABLE room_reservations (
    reservation_id BIGSERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    reserved_period TSTZRANGE NOT NULL
);
```

### Create a GiST index

```sql
CREATE INDEX idx_room_reservations_period
ON room_reservations USING GIST (reserved_period);
```

### Find reservations overlapping a period

```sql
SELECT *
FROM room_reservations
WHERE reserved_period && tstzrange(
    '2026-11-17 10:00:00+00',
    '2026-11-17 12:00:00+00',
    '[)'
);
```

The `&&` operator checks whether two ranges overlap.

### Prevent overlapping reservations

You can also use an exclusion constraint:

```sql
ALTER TABLE room_reservations
ADD CONSTRAINT no_overlapping_room_reservations
EXCLUDE USING GIST (
    room_id WITH =,
    reserved_period WITH &&
);
```

This prevents overlapping reservation periods for the same room.

**Note:** For this example, PostgreSQL's `btree_gist` extension is required to provide GiST equality support for the integer `room_id` column.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

This is an example of GiST doing more than simply speeding up SELECT queries: it can enforce complex data integrity rules.

---

## 8. SP-GiST — Space-Partitioned Generalized Search Tree

SP-GiST is designed for data structures that can be partitioned into non-overlapping search regions.

It supports specialized structures such as:

- Quadtrees.
- K-D trees.
- Radix trees.
- Certain geometric and text-search structures.

### Example: Point data

```sql
CREATE TABLE locations (
    location_id BIGSERIAL PRIMARY KEY,
    coordinates POINT NOT NULL
);
```

Create an SP-GiST index:

```sql
CREATE INDEX idx_locations_coordinates
ON locations USING SPGIST (coordinates);
```

Example query:

```sql
SELECT *
FROM locations
WHERE coordinates <@ box(
    point(0, 0),
    point(100, 100)
);
```

This finds points contained within the specified rectangular box.

### GiST vs SP-GiST

| GiST                                      | SP-GiST                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| Generalized search tree framework         | Space-partitioned search tree framework              |
| Supports overlapping search regions       | Designed for non-overlapping partitions              |
| Useful for ranges and spatial data        | Useful for partitionable spatial and structured data |
| Supports many extensible operator classes | Supports specialized partitioning strategies         |

Use SP-GiST when the data type and its operator class benefit from partitioned search structures.

---

## 9. BRIN — Block Range Index

BRIN stands for Block Range Index.

It is designed for very large tables where indexed values correlate with the physical order of rows on disk.

Unlike B-tree, BRIN does not store a separate index entry for every individual row.

Instead, it stores summaries of values across ranges of table blocks.

### Example use cases

- Event logs.
- Time-series data.
- Large transaction histories.
- Sensor readings.
- Append-heavy tables ordered by timestamp.

### Example: Index order timestamps

```sql
CREATE INDEX idx_orders_created_at_brin
ON orders USING BRIN (created_at);
```

### Query

```sql
SELECT *
FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-11-01 00:00:00+00'
  AND created_at < TIMESTAMPTZ '2026-12-01 00:00:00+00';
```

If rows are physically organized approximately by `created_at`, BRIN can identify relevant block ranges and avoid scanning unrelated portions of the table.

### How BRIN works conceptually

Suppose a large table contains timestamps in approximately increasing order.

| Block range | Minimum timestamp | Maximum timestamp |
| ----------- | ----------------- | ----------------- |
| 1           | Nov 1             | Nov 3             |
| 2           | Nov 4             | Nov 6             |
| 3           | Nov 7             | Nov 9             |
| 4           | Nov 10            | Nov 12            |

A query for November 7–9 can skip block ranges whose summaries prove they cannot contain matching values.

### Advantages

- Small index size.
- Lower storage overhead.
- Useful for very large tables.
- Efficient for correlated data.

### Disadvantages

- Less precise than B-tree.
- May return false-positive block ranges requiring rechecks.
- Not ideal for randomly distributed values.
- Performance depends heavily on physical data correlation.

### Important: BRIN does not sort your table

Creating a BRIN index does not physically reorder table rows.

It summarizes the data as it currently exists.

---

## 10. Compare All PostgreSQL Index Types

| Index type | Equality           | Range                        | Sorting            | Main use                                 |
| ---------- | ------------------ | ---------------------------- | ------------------ | ---------------------------------------- |
| B-tree     | Yes                | Yes                          | Yes                | General-purpose relational queries       |
| Hash       | Yes                | No                           | No                 | Equality-only lookups                    |
| GIN        | Operator-dependent | Operator-dependent           | No                 | Arrays, JSONB, full-text search          |
| GiST       | Operator-dependent | Operator-dependent           | Operator-dependent | Ranges, spatial and specialized searches |
| SP-GiST    | Operator-dependent | Operator-dependent           | Operator-dependent | Partitioned search structures            |
| BRIN       | Operator-dependent | Yes, for supported operators | No                 | Large, physically correlated tables      |

The Yes/No entries are simplified. Actual support depends on the data type and operator class.

---

## 11. Choosing the Correct Index Type

Use the following decision guide.

| Requirement                               | Suitable starting point   |
| ----------------------------------------- | ------------------------- |
| Search customer by email                  | B-tree                    |
| Search product by price range             | B-tree                    |
| Sort orders by created_at                 | B-tree                    |
| Search JSONB containment                  | GIN                       |
| Search array elements                     | GIN                       |
| Full-text search                          | GIN                       |
| Search overlapping date/time ranges       | GiST                      |
| Prevent overlapping reservations          | GiST exclusion constraint |
| Spatial point searches using partitioning | SP-GiST                   |
| Huge append-heavy timestamp table         | BRIN                      |

### Practical TechBazaar examples

```sql
-- Customer email lookup
CREATE INDEX idx_customers_email
ON customers(email);

-- Product price filtering
CREATE INDEX idx_products_price
ON products(price);

-- Order history lookup
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at);
```

For ordinary relational queries, B-tree is usually the correct starting point.

Use GIN, GiST, SP-GiST and BRIN when the query and data structure justify them.

---

## 12. Inspect Index Definitions

Use PostgreSQL's catalog views to inspect existing indexes.

### List all indexes

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef

FROM pg_indexes

WHERE schemaname = 'public'

ORDER BY tablename, indexname;
```

### Inspect index sizes

```sql
SELECT
    indexrelname AS index_name,
    pg_size_pretty(
        pg_relation_size(indexrelid)
    ) AS index_size

FROM pg_stat_user_indexes

ORDER BY pg_relation_size(indexrelid) DESC;
```

### Inspect index usage statistics

```sql
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch

FROM pg_stat_user_indexes

ORDER BY idx_scan DESC;
```

**Important:** Statistics are cumulative since the relevant statistics reset or object creation. A low `idx_scan` count alone does not prove that an index is unnecessary. Consider the observation period and application workload.

---

## 13. Index Maintenance

Indexes require maintenance like other database objects.

### Rebuild an index

```sql
REINDEX INDEX idx_customers_email;
```

### Rebuild all indexes on a table

```sql
REINDEX TABLE customers;
```

### Concurrent index creation

For a production table where writes must continue:

```sql
CREATE INDEX CONCURRENTLY idx_orders_customer_id
ON orders(customer_id);
```

`CREATE INDEX CONCURRENTLY` allows normal INSERT, UPDATE and DELETE operations to continue during index creation, with additional work and restrictions.

Important restrictions:

- It cannot run inside an ordinary transaction block.
- It can take longer than regular index creation.
- A failed concurrent build can leave an invalid index that needs inspection and cleanup.

### Concurrent index removal

```sql
DROP INDEX CONCURRENTLY idx_orders_customer_id;
```

This also cannot run inside an ordinary transaction block.

Production index operations require planning because they can affect performance and consume significant resources.

---

## 14. Common Mistakes

| Mistake                                                              | Correct understanding                            |
| -------------------------------------------------------------------- | ------------------------------------------------ |
| Using Hash for range queries                                         | Hash indexes support equality comparisons        |
| Using B-tree for JSONB containment without an appropriate expression | GIN is often more suitable for JSONB containment |
| Assuming GIN is always faster                                        | GIN has write and maintenance overhead           |
| Using BRIN on randomly distributed data                              | BRIN benefits from physical correlation          |
| Assuming BRIN stores an entry for every row                          | It stores summaries for block ranges             |
| Confusing GiST and SP-GiST                                           | They use different search-tree strategies        |
| Assuming every index supports every operator                         | Operator-class support matters                   |
| Creating indexes without inspecting query plans                      | Measure the actual workload                      |
| Running CREATE INDEX CONCURRENTLY inside a transaction               | PostgreSQL does not allow it                     |

---

## 15. Practice Exercises

1. Create a B-tree index on `customers.email`.
2. Create a Hash index on `customers.email`.
3. Compare the two index definitions and explain their supported operations.
4. Create a GIN index on a proposed `products.tags` array column.
5. Query products containing a particular tag.
6. Add a JSONB metadata column to products and create a GIN index.
7. Compare `jsonb_ops` and `jsonb_path_ops`.
8. Create a GIN index for product full-text search.
9. Create a GiST index on a proposed reservation range column.
10. Explain how an exclusion constraint prevents overlapping reservations.
11. Create an SP-GiST index on a point column.
12. Create a BRIN index on `orders.created_at`.
13. Explain why BRIN works better with physically correlated data.
14. Compare the storage sizes of B-tree and BRIN on a suitable large dataset.
15. Inspect index usage using `pg_stat_user_indexes`.
16. Rebuild an index using REINDEX.
17. Explain why CREATE INDEX CONCURRENTLY cannot run inside a transaction block.

---

## 16. Interview Questions

**Q1. What are the main PostgreSQL index types?**

B-tree, Hash, GIN, GiST, SP-GiST and BRIN.

**Q2. Which index type is the default in PostgreSQL?**

B-tree.

**Q3. What is the difference between B-tree and Hash?**

B-tree supports equality, range and ordering operations. Hash supports equality comparisons.

**Q4. What is GIN used for?**

GIN is useful for indexing composite values such as arrays, JSONB and full-text search documents.

**Q5. What is GiST used for?**

GiST supports specialized searches such as range and geometric queries.

**Q6. What is SP-GiST?**

A space-partitioned search-tree framework designed for data that can be divided into non-overlapping partitions.

**Q7. What is BRIN?**

A block-range index that stores summaries of values across physical table block ranges.

**Q8. Why is BRIN useful for time-series data?**

Time-series records are often inserted in timestamp order, creating physical correlation that BRIN can exploit.

**Q9. What is the difference between GIN and GiST?**

GIN indexes individual components of composite values, while GiST provides a generalized search-tree framework for specialized operators and data structures.

**Q10. What is the difference between GiST and SP-GiST?**

GiST supports generalized search structures, while SP-GiST supports partitioned structures such as quadtrees and radix trees.

**Q11. Which index type is commonly used for JSONB containment?**

GIN.

**Q12. Which index type is suitable for overlapping range searches?**

GiST.

**Q13. Does BRIN physically sort table data?**

No. It summarizes values across physical block ranges.

**Q14. What is an operator class?**

An operator class defines which operators and data types an index method supports and how they are handled.

**Q15. What is CREATE INDEX CONCURRENTLY?**

A PostgreSQL command that creates an index while allowing normal writes to continue, subject to additional work and transaction restrictions.

---

## Key Takeaways

- B-tree is PostgreSQL's default and general-purpose index type.
- Hash is designed for equality comparisons.
- GIN is useful for arrays, JSONB and full-text search.
- GiST supports range, geometric and specialized searches.
- SP-GiST supports partitioned search structures.
- BRIN is useful for huge tables with physically correlated data.
- Operator classes determine which operators an index supports.
- No index type is universally best.
- Choose an index based on the actual data structure and query pattern.
- Use PostgreSQL catalog views and execution plans to inspect index behavior.
- Use CREATE INDEX CONCURRENTLY when production write availability requires it, while accounting for its restrictions.
