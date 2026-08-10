---
sidebar_label: "Arrays and Advanced Data Types in PostgreSQL"
sidebar_position: 1
---

# Arrays and Advanced Data Types in PostgreSQL

## 1. Introduction

PostgreSQL supports several advanced data types beyond basic types such as INTEGER, VARCHAR, BOOLEAN and DATE.

These types help represent structured data, ranges, identifiers, network addresses and collections of values.

Important PostgreSQL data types covered in this chapter:

1. Arrays
2. ENUM
3. UUID
4. Range Types
5. Composite Types
6. Domain Types
7. Network Address Types
8. Full-Text Search Types

**Important:** Advanced data types should solve specific modeling problems. Do not use them simply because PostgreSQL supports them.

---

## 2. PostgreSQL Arrays

An array allows you to store multiple values of the same data type in a single column.

For example, a product may support multiple colors:

```text
["Black", "White", "Blue"]
```

Instead of creating separate columns for each color, you can store them in an array.

### Creating a table with an array

```sql
CREATE TABLE products_array (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    available_colors TEXT[]
);
```

`TEXT[]` means an array of TEXT values.

Other examples:

```sql
INTEGER[]
NUMERIC[]
BOOLEAN[]
DATE[]
UUID[]
```

### Inserting array values

```sql
INSERT INTO products_array (
    product_name,
    available_colors
)
VALUES (
    'Wireless Mouse',
    ARRAY['Black', 'White', 'Blue']
);
```

You can also use array literals:

```sql
INSERT INTO products_array (
    product_name,
    available_colors
)
VALUES (
    'Keyboard',
    '{"Black", "Grey", "White"}'
);
```

### Reading array values

```sql
SELECT *
FROM products_array;
```

---

## 3. Accessing Array Elements

PostgreSQL arrays are normally indexed starting from 1, unlike JSON arrays, which start from 0.

```sql
SELECT
    product_name,
    available_colors[1] AS first_color
FROM products_array;
```

Result:

| product_name   | first_color |
| -------------- | ----------- |
| Wireless Mouse | Black       |

### Access a specific element

```sql
SELECT available_colors[2]
FROM products_array;
```

### Access a range of elements

```sql
SELECT available_colors[1:2]
FROM products_array;
```

Result:

```text
{Black,White}
```

### Check array dimensions and length

```sql
SELECT
    array_length(available_colors, 1) AS total_colors,
    cardinality(available_colors) AS total_elements
FROM products_array;
```

- `array_length(array, dimension)` returns the length of a specific dimension.
- `cardinality(array)` returns the total number of elements across all dimensions.

For an empty array, `array_length()` returns NULL, while `cardinality()` returns 0.

---

## 4. Updating Arrays

### Replace an element

```sql
UPDATE products_array
SET available_colors[2] = 'Red'
WHERE product_id = 1;
```

### Append an element

Use `array_append()`:

```sql
UPDATE products_array
SET available_colors = array_append(
    available_colors,
    'Green'
)
WHERE product_id = 1;
```

You can also use concatenation:

```sql
UPDATE products_array
SET available_colors = available_colors || ARRAY['Yellow']
WHERE product_id = 1;
```

### Remove an element by value

```sql
UPDATE products_array
SET available_colors = array_remove(
    available_colors,
    'Red'
)
WHERE product_id = 1;
```

### Remove an element by index

```sql
UPDATE products_array
SET available_colors = available_colors[:1]
    || available_colors[3:]
WHERE product_id = 1;
```

This example removes the second element.

---

## 5. Searching Arrays

PostgreSQL provides several operators and functions for array searches.

Consider:

```sql
SELECT *
FROM products_array
WHERE 'Black' = ANY(available_colors);
```

This finds products whose color array contains `Black`.

### Important array operators

| Operator | Meaning                                       |
| -------- | --------------------------------------------- |
| `@>`     | Left array contains right array               |
| `<@`     | Left array is contained by right array        |
| `&&`     | Arrays have at least one common element       |
| `=`      | Arrays are equal                              |
| `<>`     | Arrays are not equal                          |
| `ANY()`  | Comparison matches at least one array element |
| `ALL()`  | Comparison matches every array element        |

### 5.1 Contains: `@>`

```sql
SELECT *
FROM products_array
WHERE available_colors @> ARRAY['Black'];
```

Finds arrays containing Black.

To require both Black and White:

```sql
SELECT *
FROM products_array
WHERE available_colors @> ARRAY['Black', 'White'];
```

### 5.2 Overlap: `&&`

```sql
SELECT *
FROM products_array
WHERE available_colors && ARRAY['Blue', 'Green'];
```

Returns products having at least one matching color.

### 5.3 ANY

```sql
SELECT *
FROM products_array
WHERE 'Blue' = ANY(available_colors);
```

Returns rows where at least one element matches Blue.

### 5.4 ALL

```sql
SELECT *
FROM products_array
WHERE 'Black' = ALL(available_colors);
```

Every element must equal Black.

An empty array makes `ALL()` evaluate to TRUE because there are no elements that violate the comparison.

---

## 6. Expanding Arrays into Rows

Sometimes you need each array element as a separate row.

Use `unnest()`.

```sql
SELECT
    product_name,
    unnest(available_colors) AS color
FROM products_array;
```

Possible output:

| product_name   | color |
| -------------- | ----- |
| Wireless Mouse | Black |
| Wireless Mouse | White |
| Wireless Mouse | Blue  |

### Preserve element position

```sql
SELECT
    p.product_name,
    c.color,
    c.position
FROM products_array p
CROSS JOIN LATERAL unnest(p.available_colors)
WITH ORDINALITY AS c(color, position);
```

`WITH ORDINALITY` provides the element's position, starting at 1.

### Use array aggregation

The reverse operation is possible with `array_agg()`:

```sql
SELECT
    product_name,
    array_agg(available_colors[1]) AS first_colors
FROM products_array
GROUP BY product_name;
```

`array_agg()` collects values into an array. In this example, it is only illustrative; aggregating all colors from expanded rows is generally more useful.

---

## 7. Indexing Arrays

GIN indexes are commonly used for array containment and overlap queries.

```sql
CREATE INDEX idx_products_colors_gin
ON products_array
USING GIN (available_colors);
```

This can help queries such as:

```sql
SELECT *
FROM products_array
WHERE available_colors @> ARRAY['Black'];
```

And:

```sql
SELECT *
FROM products_array
WHERE available_colors && ARRAY['Blue', 'Green'];
```

The planner decides whether to use the index based on query conditions, statistics and estimated cost.

**Important:** An index does not guarantee faster queries. Measure with `EXPLAIN ANALYZE`.

---

## 8. When Should You Use Arrays?

Arrays are useful when:

- Values naturally belong together.
- Elements are simple and have the same data type.
- You commonly retrieve or filter the collection as a whole.
- You do not need independent relationships for each element.

### When not to use arrays

Suppose you have products and categories.

A product can belong to multiple categories, and categories can contain multiple products.

Storing category IDs in a product array may seem convenient:

```text
category_ids = [1, 2, 3]
```

However, a relational junction table is generally better:

```sql
CREATE TABLE product_categories (
    product_id BIGINT REFERENCES products(product_id),
    category_id BIGINT REFERENCES categories(category_id),
    PRIMARY KEY (product_id, category_id)
);
```

Why?

- Foreign key constraints can validate every relationship.
- Individual relationships can have additional attributes.
- Joins become straightforward.
- Referential integrity is enforced by the database.

**Rule:** Use arrays for simple collections, not as a replacement for relational modeling.

---

## 9. ENUM Data Type

ENUM represents a predefined set of allowed values.

For example, an order can have only these statuses:

- pending
- processing
- shipped
- delivered
- cancelled

### Create an ENUM type

```sql
CREATE TYPE order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);
```

### Use ENUM in a table

```sql
CREATE TABLE enum_orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_status order_status NOT NULL DEFAULT 'pending'
);
```

### Insert records

```sql
INSERT INTO enum_orders (order_status)
VALUES
('pending'),
('processing'),
('shipped');
```

This fails:

```sql
INSERT INTO enum_orders (order_status)
VALUES ('refunded');
```

Because `refunded` is not part of the ENUM definition.

### Add a new ENUM value

```sql
ALTER TYPE order_status
ADD VALUE 'refunded';
```

### Rename an ENUM value

```sql
ALTER TYPE order_status
RENAME VALUE 'processing' TO 'in_progress';
```

### ENUM characteristics

- Values have a defined ordering based on their declaration order.
- Invalid values are rejected.
- Values are case-sensitive.
- Existing values cannot simply be removed or reordered through a normal `ALTER TYPE` operation.
- ENUM types are reusable across tables.

### ENUM vs CHECK constraint

| ENUM                                     | CHECK constraint                                  |
| ---------------------------------------- | ------------------------------------------------- |
| Creates a reusable data type             | Defines a rule on a column or table               |
| Values are predefined                    | Values can be constrained by an expression        |
| Adding values requires altering the type | Updating the constraint can change allowed values |
| Has declaration-based ordering           | Ordering depends on the underlying data type      |

Example using CHECK:

```sql
CREATE TABLE check_orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_status VARCHAR(30)
        CHECK (
            order_status IN (
                'pending',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            )
        )
);
```

Use ENUM for stable, reusable value sets. Use CHECK when constraints need greater flexibility.

For highly dynamic statuses managed by administrators, a separate lookup table may be more appropriate.

---

## 10. UUID Data Type

UUID stands for Universally Unique Identifier.

It represents a 128-bit identifier.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

Unlike sequential IDs, UUIDs are designed to provide a very low probability of collisions across independently generated identifiers.

### Create a table with UUID

```sql
CREATE TABLE uuid_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(100) NOT NULL
);
```

`gen_random_uuid()` generates a version 4 UUID.

### Insert without providing UUID

```sql
INSERT INTO uuid_users (user_name)
VALUES
('Rahul'),
('Amit'),
('Priya');
```

PostgreSQL automatically generates UUID values.

### Insert a specific UUID

```sql
INSERT INTO uuid_users (user_id, user_name)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Rahul'
);
```

### UUID vs BIGINT

| UUID                                                   | BIGINT                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| 128-bit identifier                                     | 64-bit integer                                                |
| Usually larger                                         | Smaller                                                       |
| Can be generated independently across systems          | Commonly generated using sequences or identity                |
| Harder to guess than sequential IDs                    | Sequential values can be predictable                          |
| Random UUIDs can cause less sequential index insertion | Sequential IDs often have favorable B-tree insertion locality |

### When to use UUID

- Distributed systems.
- Multiple independent services generating IDs.
- Public-facing identifiers.
- Data synchronization across systems.
- Systems where IDs need to be generated before database insertion.

### Important

UUIDs are not authorization tokens.

Knowing or hiding an identifier does not replace access control.

---

## 11. Range Types

PostgreSQL supports range types for representing a range of values.

Examples:

- Salary range.
- Date range.
- Booking period.
- Numeric intervals.
- Reservation availability.

Built-in range types include:

| Range type  | Underlying value |
| ----------- | ---------------- |
| `int4range` | INTEGER          |
| `int8range` | BIGINT           |
| `numrange`  | NUMERIC          |
| `daterange` | DATE             |
| `tsrange`   | TIMESTAMP        |
| `tstzrange` | TIMESTAMPTZ      |

### Example: Booking table

```sql
CREATE TABLE room_bookings (
    booking_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id INTEGER NOT NULL,
    booking_period TSTZRANGE NOT NULL
);
```

### Insert a range

```sql
INSERT INTO room_bookings (
    room_id,
    booking_period
)
VALUES (
    101,
    '[2026-11-20 10:00+05:30, 2026-11-20 12:00+05:30)'
);
```

The range represents a booking interval.

### Range boundary symbols

| Symbol | Meaning                  |
| ------ | ------------------------ |
| `[`    | Inclusive lower boundary |
| `]`    | Inclusive upper boundary |
| `(`    | Exclusive lower boundary |
| `)`    | Exclusive upper boundary |

Example:

```text
[10, 20]
```

Includes both 10 and 20.

```text
[10, 20)
```

Includes 10 but excludes 20.

PostgreSQL's built-in discrete range types such as `int4range`, `int8range` and `daterange` use canonical representations. For example, `[1, 5]` in an integer range is normalized to `[1, 6)`.

### Check whether a value belongs to a range

Use `@>`:

```sql
SELECT *
FROM room_bookings
WHERE booking_period @> '2026-11-20 11:00+05:30'::TIMESTAMPTZ;
```

### Check overlapping ranges

Use `&&`:

```sql
SELECT *
FROM room_bookings
WHERE booking_period &&
    '[2026-11-20 11:30+05:30, 2026-11-20 13:00+05:30)'::TSTZRANGE;
```

Returns bookings that overlap the supplied interval.

### Range operators

| Operator | Meaning                                       |
| -------- | --------------------------------------------- | --------------- |
| `@>`     | Contains a value or range                     |
| `<@`     | Is contained by another range                 |
| `&&`     | Overlaps                                      |
| `-       | -`                                            | Adjacent ranges |
| `<<`     | Strictly left of                              |
| `>>`     | Strictly right of                             |
| `&<`     | Does not extend to the right of               |
| `&>`     | Does not extend to the left of                |
| `+`      | Union, when the result is a single range      |
| `-`      | Difference, when the result is a single range |

### Prevent overlapping bookings

A booking system often needs to prevent two bookings for the same room from overlapping.

PostgreSQL supports exclusion constraints.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

```sql
ALTER TABLE room_bookings
ADD CONSTRAINT no_overlapping_room_bookings
EXCLUDE USING GIST (
    room_id WITH =,
    booking_period WITH &&
);
```

This prevents overlapping booking periods for the same room.

The `btree_gist` extension supplies GiST operator classes for scalar types such as INTEGER.

**Important:** An exclusion constraint is stronger than checking availability in application code before inserting. The database enforces the rule even when concurrent requests arrive.

---

## 12. Composite Types

A composite type groups multiple fields into one reusable type.

Think of it as a custom structured data type.

### Create a composite type

```sql
CREATE TYPE address_type AS (
    street VARCHAR(100),
    city VARCHAR(50),
    postal_code VARCHAR(10)
);
```

### Use it in a table

```sql
CREATE TABLE composite_customers (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name VARCHAR(100),
    address address_type
);
```

### Insert composite data

```sql
INSERT INTO composite_customers (
    customer_name,
    address
)
VALUES (
    'Rahul',
    ROW('MG Road', 'Noida', '201301')
);
```

### Access composite fields

```sql
SELECT
    customer_name,
    (address).street,
    (address).city
FROM composite_customers;
```

Parentheses around the composite column are important when accessing its fields.

### Update one field

```sql
UPDATE composite_customers
SET address.city = 'Ghaziabad'
WHERE customer_id = 1;
```

Composite types are useful when multiple columns logically form a reusable structured value.

However, if individual fields require foreign keys, independent constraints or frequent joins, separate relational columns and tables may be preferable.

---

## 13. Domain Types

A domain is a user-defined type based on an existing data type, optionally with constraints.

It allows reusable validation rules.

For example, an application may require every discount percentage to be between 0 and 100.

### Create a domain

```sql
CREATE DOMAIN discount_percentage AS NUMERIC(5, 2)
CHECK (
    VALUE >= 0 AND VALUE <= 100
);
```

### Use the domain

```sql
CREATE TABLE product_discounts (
    discount_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100),
    discount discount_percentage
);
```

### Valid insertion

```sql
INSERT INTO product_discounts (
    product_name,
    discount
)
VALUES (
    'Keyboard',
    15.50
);
```

### Invalid insertion

```sql
INSERT INTO product_discounts (
    product_name,
    discount
)
VALUES (
    'Mouse',
    150
);
```

This fails because the value violates the domain's CHECK constraint.

### Add a constraint to an existing domain

```sql
ALTER DOMAIN discount_percentage
ADD CONSTRAINT discount_not_null
CHECK (VALUE IS NOT NULL);
```

A domain does not automatically make a column NOT NULL. The added CHECK above rejects NULL values, but using `NOT NULL` directly on a column is usually clearer when the requirement is specific to that column.

### When to use domains

- Reusable email format rules.
- Percentage limits.
- Positive monetary values.
- Phone number format restrictions.
- Business-specific numeric constraints.

**Important:** A domain is not a replacement for a complete validation system. It enforces database-level rules, not every business rule.

---

## 14. Network Address Types

PostgreSQL provides dedicated data types for storing IP addresses and network ranges.

| Data type  | Purpose                           |
| ---------- | --------------------------------- |
| `inet`     | IPv4 or IPv6 host/network address |
| `cidr`     | IPv4 or IPv6 network              |
| `macaddr`  | MAC address                       |
| `macaddr8` | EUI-64 MAC address                |

### Example table

```sql
CREATE TABLE server_logs (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_ip INET,
    network_range CIDR
);
```

### Insert values

```sql
INSERT INTO server_logs (
    client_ip,
    network_range
)
VALUES (
    '192.168.1.10',
    '192.168.1.0/24'
);
```

### Query IP addresses

```sql
SELECT *
FROM server_logs
WHERE client_ip << '192.168.1.0/24'::CIDR;
```

The `<<` operator checks whether the address or network is strictly contained to the left of another network in network-order terms.

For ordinary subnet membership, use:

```sql
SELECT *
FROM server_logs
WHERE client_ip <<= '192.168.1.0/24'::CIDR;
```

### Why use INET instead of VARCHAR?

- PostgreSQL validates IP address formats.
- Network-specific operators are available.
- Comparisons are network-aware.
- Specialized indexing is supported.

For server logs, IP addresses, access-control rules and network monitoring, these types are more appropriate than plain strings.

---

## 15. Full-Text Search Types

PostgreSQL provides built-in full-text search capabilities.

Important types:

- `tsvector`
- `tsquery`

### tsvector

Stores a processed representation of searchable text.

It typically contains normalized lexemes rather than the original text.

### tsquery

Represents a search query.

### Example

```sql
SELECT to_tsvector(
    'english',
    'PostgreSQL is a powerful database'
);
```

PostgreSQL processes the text into searchable lexemes.

### Search using tsquery

```sql
SELECT to_tsvector(
    'english',
    'PostgreSQL is a powerful database'
)
@@
to_tsquery('english', 'database');
```

Result:

```text
true
```

The `@@` operator checks whether a `tsvector` matches a `tsquery`.

### Search a product table

```sql
SELECT *
FROM products
WHERE to_tsvector('english', product_name)
      @@ plainto_tsquery('english', 'wireless mouse');
```

`plainto_tsquery()` converts ordinary user text into a query without requiring the user to provide tsquery syntax.

### Create a full-text search index

```sql
CREATE INDEX idx_products_name_fts
ON products
USING GIN (
    to_tsvector('english', product_name)
);
```

The query should use the matching expression for PostgreSQL to use this expression index.

### Common functions

| Function                 | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `to_tsvector()`          | Converts text into searchable lexemes        |
| `to_tsquery()`           | Converts tsquery syntax into a search query  |
| `plainto_tsquery()`      | Converts plain text into a search query      |
| `websearch_to_tsquery()` | Converts web-style search input into a query |
| `phraseto_tsquery()`     | Builds a phrase-oriented search query        |
| `ts_headline()`          | Generates highlighted search-result text     |

Full-text search is useful for searching descriptions, articles, product names and documentation.

It is not the same as substring matching with `LIKE` or `ILIKE`.

---

## 16. Choosing the Right Advanced Data Type

| Requirement                             | Recommended type   |
| --------------------------------------- | ------------------ |
| Multiple simple values of the same type | ARRAY              |
| Fixed set of allowed values             | ENUM               |
| Distributed unique identifier           | UUID               |
| Booking or date intervals               | RANGE              |
| Group related fields into one value     | COMPOSITE          |
| Reusable data validation                | DOMAIN             |
| IP addresses and network ranges         | INET / CIDR        |
| MAC addresses                           | MACADDR / MACADDR8 |
| Full-text document search               | TSVECTOR / TSQUERY |
| Flexible nested attributes              | JSONB              |

---

## 17. Common Mistakes

| Mistake                                                | Correct understanding                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Assuming PostgreSQL arrays start at zero               | PostgreSQL arrays normally start at 1                               |
| Using arrays for many-to-many relationships            | Prefer junction tables with foreign keys                            |
| Assuming ENUM values can be freely removed             | Removing or reordering values requires more involved type migration |
| Using UUIDs as authorization                           | UUIDs do not replace authorization                                  |
| Treating range boundaries as always inclusive          | Boundary inclusivity is explicitly represented                      |
| Checking booking availability only in application code | Use exclusion constraints for database-enforced overlap prevention  |
| Assuming a domain makes every column NOT NULL          | Domain constraints and column nullability are separate concerns     |
| Storing IP addresses as VARCHAR                        | Use INET or CIDR where appropriate                                  |
| Confusing full-text search with substring matching     | They solve different search problems                                |

---

## 18. Practice Exercises

Use the TechBazaar database and create separate test tables where necessary.

### Arrays

1. Create a table with a TEXT array for product colors.
2. Insert five products with multiple colors.
3. Extract the first color from every product.
4. Find products containing Black.
5. Find products containing both Black and White.
6. Find products containing either Blue or Green.
7. Append a new color.
8. Remove a color.
9. Expand array values into separate rows using `unnest()`.
10. Create a GIN index on the array column.

### ENUM and UUID

11. Create an ENUM for payment statuses.
12. Use it in a payments table.
13. Insert valid and invalid status values.
14. Add a new ENUM value.
15. Create a users table with UUID primary keys.
16. Insert users without explicitly providing UUIDs.

### Range and other advanced types

17. Create a room-booking table using `TSTZRANGE`.
18. Find bookings containing a specific timestamp.
19. Find overlapping bookings.
20. Prevent overlapping bookings for the same room using an exclusion constraint.
21. Create a composite address type.
22. Create a domain for percentage values.
23. Store IP addresses using INET.
24. Create a full-text search index on product names.
25. Search products using `plainto_tsquery()`.

---

## 19. Interview Questions

**Q1. What is an array in PostgreSQL?**

A collection of values of the same data type stored in one column.

**Q2. What is the default array indexing convention?**

PostgreSQL arrays normally use 1-based indexing.

**Q3. What is the difference between `ANY()` and `ALL()`?**

ANY requires at least one comparison to be TRUE. ALL requires every comparison to be TRUE.

**Q4. What is `unnest()`?**

A function that expands array elements into individual rows.

**Q5. When should you use an array instead of a junction table?**

Use arrays for simple collections that do not require independent relationships or referential integrity. Use junction tables for relational associations.

**Q6. What is ENUM?**

A user-defined type containing a fixed set of allowed values.

**Q7. Can you add a value to an ENUM?**

Yes, using `ALTER TYPE ... ADD VALUE`.

**Q8. What is UUID?**

A 128-bit identifier designed to be globally unique with an extremely low collision probability.

**Q9. What is a range type?**

A type representing a continuous interval of values, such as dates, timestamps or numbers.

**Q10. What is an exclusion constraint?**

A constraint that prevents rows from having conflicting values according to specified operators. It is commonly used to prevent overlapping bookings.

**Q11. What is a composite type?**

A custom type containing multiple named fields.

**Q12. What is a domain type?**

A user-defined type based on an existing type, with optional reusable constraints.

**Q13. What is the difference between INET and CIDR?**

INET represents an IP address or network, while CIDR represents a network with a prefix length.

**Q14. What is TSVECTOR?**

A processed representation of text used by PostgreSQL full-text search.

**Q15. What is TSQUERY?**

A structured search query used to match a TSVECTOR.

**Q16. What is the difference between full-text search and LIKE?**

LIKE performs pattern matching on text. Full-text search tokenizes and normalizes text and supports linguistic search operations.

**Q17. Which index type is commonly used for PostgreSQL arrays?**

GIN.

**Q18. Can UUID replace BIGINT as a primary key?**

Yes. Both can be primary keys, but they have different storage, generation and indexing characteristics.

---

## Key Takeaways

- Arrays store multiple values of the same type in one column.
- PostgreSQL arrays normally use 1-based indexing.
- `ANY`, `ALL`, `@>`, `<@` and `&&` support array queries.
- `unnest()` expands arrays into rows.
- GIN indexes support suitable array queries.
- ENUM represents a fixed set of allowed values.
- UUID provides distributed identifier generation.
- Range types represent intervals and support overlap queries.
- Exclusion constraints can prevent conflicting bookings.
- Composite types group related fields.
- Domains provide reusable validation rules.
- INET and CIDR represent network addresses.
- TSVECTOR and TSQUERY support full-text search.
- Use advanced data types when they improve the data model, not merely to avoid relational tables.
