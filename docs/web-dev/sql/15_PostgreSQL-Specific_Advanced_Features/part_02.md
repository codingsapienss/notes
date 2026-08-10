---
sidebar_label: "JSON and JSONB in PostgreSQL"
sidebar_position: 1
---

# JSON and JSONB in PostgreSQL

## 1. Introduction

PostgreSQL supports JSON data types for storing and querying semi-structured data.

The two primary types are:

1. `JSON`
2. `JSONB`

JSON is useful when an application needs to store structured data that does not always fit neatly into fixed relational columns.

For example, an e-commerce application may store product specifications:

```json
{
  "brand": "Logitech",
  "color": "Black",
  "wireless": true,
  "connectivity": ["Bluetooth", "USB"]
}
```

Instead of creating separate columns for every possible product attribute, you can store flexible attributes in a JSON column.

### Common use cases

- Product specifications.
- User preferences.
- Application settings.
- API request and response payloads.
- Event metadata.
- Configuration data.
- Flexible attributes.

**Important:** JSON should not replace relational database design. Frequently queried, indexed, joined or constrained business fields should generally remain normal relational columns.

---

## 2. JSON vs JSONB

PostgreSQL provides two JSON data types.

### JSON

- Stores an exact copy of the input JSON text.
- Preserves whitespace.
- Preserves object key order.
- Preserves duplicate object keys in the stored text.
- Requires parsing when processing JSON values.

### JSONB

- Stores JSON in a decomposed binary representation.
- Does not preserve whitespace.
- Does not preserve object key order.
- Keeps only the last value when duplicate object keys are supplied.
- Supports efficient indexing and querying.

### Comparison

| Feature                 | JSON                          | JSONB                            |
| ----------------------- | ----------------------------- | -------------------------------- |
| Storage                 | Original JSON text            | Decomposed binary representation |
| Whitespace preservation | Yes                           | No                               |
| Object key order        | Preserved                     | Not preserved                    |
| Duplicate keys          | Preserved in input text       | Only last value retained         |
| Processing              | Requires reparsing            | Usually faster to process        |
| Indexing                | Limited                       | Supports GIN indexing            |
| Common recommendation   | When exact input text matters | Most queryable JSON workloads    |

**Recommendation:** Prefer JSONB for most application use cases involving querying, filtering and indexing JSON data.

Use JSON when preserving the original JSON text is important.

---

## 3. Creating Tables with JSON and JSONB

### JSON example

```sql
CREATE TABLE api_logs (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_data JSON
);
```

### JSONB example

```sql
CREATE TABLE products_json (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    specifications JSONB
);
```

The `specifications` column can store flexible product attributes.

### Insert JSON data

```sql
INSERT INTO products_json (
    product_name,
    specifications
)
VALUES (
    'Wireless Mouse',
    '{
        "brand": "Logitech",
        "color": "Black",
        "wireless": true,
        "dpi": 1600
    }'::JSONB
);
```

The `::JSONB` syntax explicitly casts the string to JSONB.

### Insert multiple records

```sql
INSERT INTO products_json (
    product_name,
    specifications
)
VALUES
(
    'Keyboard',
    '{
        "brand": "Logitech",
        "layout": "QWERTY",
        "wireless": true
    }'::JSONB
),
(
    'Monitor',
    '{
        "brand": "Dell",
        "size": 27,
        "resolution": "4K"
    }'::JSONB
);
```

---

## 4. Reading JSONB Data

PostgreSQL provides operators to extract values from JSON and JSONB.

Consider:

```json
{
  "brand": "Logitech",
  "color": "Black",
  "wireless": true,
  "dpi": 1600,
  "connectivity": ["Bluetooth", "USB"]
}
```

### 4.1 `->` Operator

Returns a JSON or JSONB value.

```sql
SELECT specifications -> 'brand'
FROM products_json;
```

Result:

```json
"Logitech"
```

### 4.2 `->>` Operator

Returns the extracted value as TEXT.

```sql
SELECT specifications ->> 'brand'
FROM products_json;
```

Result:

```text
Logitech
```

### Difference

| Operator | Returns    |
| -------- | ---------- |
| `->`     | JSON/JSONB |
| `->>`    | TEXT       |

### Example

```sql
SELECT
    specifications -> 'wireless' AS wireless_json,
    specifications ->> 'wireless' AS wireless_text
FROM products_json;
```

The first expression returns a JSON boolean. The second returns the text representation.

---

## 5. Accessing Nested JSON Values

Consider:

```json
{
  "brand": "Logitech",
  "dimensions": {
    "height": 5,
    "width": 12,
    "unit": "cm"
  }
}
```

### Using chained operators

```sql
SELECT
    specifications -> 'dimensions' -> 'height'
FROM products_json;
```

Result:

```json
5
```

### Extract nested text

```sql
SELECT
    specifications -> 'dimensions' ->> 'unit'
FROM products_json;
```

Result:

```text
cm
```

### Using path operators

PostgreSQL also provides:

- `#>` — extracts a JSON/JSONB value at a path.
- `#>>` — extracts a value at a path as TEXT.

Example:

```sql
SELECT
    specifications #> '{dimensions,height}'
FROM products_json;
```

Text result:

```sql
SELECT
    specifications #>> '{dimensions,unit}'
FROM products_json;
```

---

## 6. Accessing JSON Arrays

Consider:

```json
{
  "brand": "Logitech",
  "connectivity": ["Bluetooth", "USB", "Wireless Receiver"]
}
```

PostgreSQL JSON array indexing starts at zero.

### Extract an array

```sql
SELECT
    specifications -> 'connectivity'
FROM products_json;
```

### Extract an array element

```sql
SELECT
    specifications -> 'connectivity' -> 0
FROM products_json;
```

Result:

```json
"Bluetooth"
```

### Extract as TEXT

```sql
SELECT
    specifications -> 'connectivity' ->> 1
FROM products_json;
```

Result:

```text
USB
```

### Extract using a path

```sql
SELECT
    specifications #>> '{connectivity,2}'
FROM products_json;
```

Result:

```text
Wireless Receiver
```

---

## 7. Filtering JSONB Data

You can use JSONB operators inside WHERE clauses.

### Filter by string value

```sql
SELECT *
FROM products_json
WHERE specifications ->> 'brand' = 'Logitech';
```

### Filter by boolean value

```sql
SELECT *
FROM products_json
WHERE specifications -> 'wireless' = 'true'::JSONB;
```

### Filter by numeric value

```sql
SELECT *
FROM products_json
WHERE (specifications ->> 'dpi')::INTEGER > 1000;
```

The `->>` operator returns TEXT, so numeric values may need explicit casting.

### Filter nested values

```sql
SELECT *
FROM products_json
WHERE specifications -> 'dimensions' ->> 'unit' = 'cm';
```

### Important

Use appropriate casts when comparing extracted text with numeric, date or other typed values.

Invalid stored values can cause casting errors. Validate JSON structure and values when inserting data.

---

## 8. Important JSONB Operators

PostgreSQL provides several useful JSONB operators.

| Operator | Purpose                                                                  |
| -------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------ |
| `->`     | Extract JSON object field or array element                               |
| `->>`    | Extract as TEXT                                                          |
| `#>`     | Extract JSON value at a path                                             |
| `#>>`    | Extract TEXT at a path                                                   |
| `@>`     | Check containment                                                        |
| `<@`     | Check whether the left JSONB value is contained in the right             |
| `?`      | Check whether a top-level key or string array element exists             |
| `?       | `                                                                        | Check whether any supplied top-level key or string array element exists |
| `?&`     | Check whether all supplied top-level keys or string array elements exist |
| `        |                                                                          | `                                                                       | Concatenate JSONB values |
| `-`      | Remove a top-level key or array element                                  |
| `#-`     | Remove a value at a specified path                                       |

### 8.1 Containment operator `@>`

Checks whether the left JSONB value contains the right JSONB value.

```sql
SELECT *
FROM products_json
WHERE specifications @> '{"brand": "Logitech"}'::JSONB;
```

### Nested containment

```sql
SELECT *
FROM products_json
WHERE specifications @> '{
    "dimensions": {
        "unit": "cm"
    }
}'::JSONB;
```

### Array containment

```sql
SELECT *
FROM products_json
WHERE specifications @> '{
    "connectivity": ["Bluetooth"]
}'::JSONB;
```

### 8.2 Key existence operator `?`

```sql
SELECT *
FROM products_json
WHERE specifications ? 'brand';
```

This checks for a top-level key named `brand`.

It also checks for a matching string element when the left JSONB value is a top-level JSON array.

### 8.3 Any key exists: `?|`

```sql
SELECT *
FROM products_json
WHERE specifications ?| ARRAY['brand', 'color'];
```

Returns rows containing at least one of those top-level keys.

### 8.4 All keys exist: `?&`

```sql
SELECT *
FROM products_json
WHERE specifications ?& ARRAY['brand', 'color'];
```

Returns rows containing both top-level keys.

---

## 9. Updating JSONB Data

PostgreSQL provides `jsonb_set()` to update a value at a specified path.

### Syntax

```sql
jsonb_set(
    target_jsonb,
    path,
    new_value,
    create_if_missing
)
```

### Update an existing value

```sql
UPDATE products_json
SET specifications = jsonb_set(
    specifications,
    '{color}',
    '"White"'::JSONB
)
WHERE product_id = 1;
```

The color changes from Black to White.

### Add a new key

```sql
UPDATE products_json
SET specifications = jsonb_set(
    specifications,
    '{warranty}',
    '"2 years"'::JSONB,
    true
)
WHERE product_id = 1;
```

The final argument `true` allows creation of the final path element when it is missing.

### Update a nested value

```sql
UPDATE products_json
SET specifications = jsonb_set(
    specifications,
    '{dimensions,height}',
    '6'::JSONB,
    true
)
WHERE product_id = 1;
```

### Important

Intermediate objects in a path generally need to exist for `jsonb_set()` to update a deeper nested value.

---

## 10. Adding and Removing JSONB Keys

### Add or replace a key using `||`

```sql
UPDATE products_json
SET specifications = specifications ||
    '{"warranty": "2 years"}'::JSONB
WHERE product_id = 1;
```

The `||` operator concatenates JSONB values.

For objects, right-hand values replace matching top-level keys.

### Remove a top-level key

```sql
UPDATE products_json
SET specifications = specifications - 'color'
WHERE product_id = 1;
```

### Remove a nested key

```sql
UPDATE products_json
SET specifications = specifications #- '{dimensions,height}'
WHERE product_id = 1;
```

### Important

JSONB concatenation is not a general recursive deep-merge operation.

For nested updates, use appropriate functions and paths.

---

## 11. JSONB Functions

PostgreSQL provides useful JSON and JSONB functions.

| Function               | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `jsonb_build_object()` | Constructs a JSONB object                    |
| `jsonb_build_array()`  | Constructs a JSONB array                     |
| `jsonb_typeof()`       | Returns the JSON value type                  |
| `jsonb_array_length()` | Returns array length                         |
| `jsonb_object_keys()`  | Returns top-level object keys                |
| `jsonb_each()`         | Expands an object into key/value pairs       |
| `jsonb_each_text()`    | Expands an object into text key/value pairs  |
| `jsonb_strip_nulls()`  | Removes object fields with JSON null values  |
| `jsonb_set()`          | Updates a value at a path                    |
| `jsonb_insert()`       | Inserts a value into an array or object path |
| `to_jsonb()`           | Converts a SQL value to JSONB                |

### 11.1 jsonb_build_object()

```sql
SELECT jsonb_build_object(
    'brand', 'Logitech',
    'color', 'Black',
    'wireless', true
);
```

Result:

```json
{
  "brand": "Logitech",
  "color": "Black",
  "wireless": true
}
```

### 11.2 jsonb_build_array()

```sql
SELECT jsonb_build_array(
    'Bluetooth',
    'USB',
    'Wireless Receiver'
);
```

### 11.3 jsonb_typeof()

```sql
SELECT jsonb_typeof(
    '{"brand": "Logitech"}'::JSONB
);
```

Result:

```text
object
```

Other possible values include:

- `array`
- `string`
- `number`
- `boolean`
- `null`

### 11.4 jsonb_array_length()

```sql
SELECT jsonb_array_length(
    '["Bluetooth", "USB", "WiFi"]'::JSONB
);
```

Result:

```text
3
```

This function expects a JSON array.

### 11.5 jsonb_object_keys()

```sql
SELECT jsonb_object_keys(
    '{"brand": "Logitech", "color": "Black"}'::JSONB
);
```

Returns the object's top-level keys as rows.

### 11.6 jsonb_each()

```sql
SELECT *
FROM jsonb_each(
    '{"brand": "Logitech", "color": "Black"}'::JSONB
);
```

Possible output:

| key   | value        |
| ----- | ------------ |
| brand | `"Logitech"` |
| color | `"Black"`    |

### 11.7 to_jsonb()

```sql
SELECT to_jsonb(
    ROW(101, 'Keyboard', 1500)
);
```

Converts a SQL value or composite row into JSONB.

---

## 12. Expanding JSON Arrays with jsonb_array_elements()

Sometimes you need to convert JSON array elements into separate SQL rows.

Consider:

```json
{
  "connectivity": ["Bluetooth", "USB", "Wireless Receiver"]
}
```

### Query

```sql
SELECT
    jsonb_array_elements(
        specifications -> 'connectivity'
    ) AS connectivity
FROM products_json;
```

Possible output:

| connectivity          |
| --------------------- |
| `"Bluetooth"`         |
| `"USB"`               |
| `"Wireless Receiver"` |

### Extract as text

```sql
SELECT
    jsonb_array_elements_text(
        specifications -> 'connectivity'
    ) AS connectivity
FROM products_json;
```

### Use WITH ORDINALITY

```sql
SELECT
    p.product_id,
    item.value,
    item.position
FROM products_json p
CROSS JOIN LATERAL jsonb_array_elements_text(
    p.specifications -> 'connectivity'
) WITH ORDINALITY AS item(value, position);
```

`WITH ORDINALITY` adds a 1-based position number to each expanded row.

This is useful when processing arrays in relational queries.

---

## 13. JSONB Indexing

One major advantage of JSONB is its support for indexing.

Without an appropriate index, PostgreSQL may need to scan many rows and evaluate JSON conditions individually.

### GIN index

GIN stands for Generalized Inverted Index.

It is commonly used for JSONB containment and key-existence queries.

```sql
CREATE INDEX idx_products_specifications_gin
ON products_json
USING GIN (specifications);
```

This can help queries such as:

```sql
SELECT *
FROM products_json
WHERE specifications @> '{"brand": "Logitech"}'::JSONB;
```

It can also support suitable key-existence operators.

### jsonb_ops vs jsonb_path_ops

PostgreSQL provides different JSONB GIN operator classes.

#### Default jsonb_ops

```sql
CREATE INDEX idx_products_specifications_ops
ON products_json
USING GIN (specifications jsonb_ops);
```

Supports a broader set of JSONB operators, including:

- `?`
- `?|`
- `?&`
- `@>`
- `@?`
- `@@`

#### jsonb_path_ops

```sql
CREATE INDEX idx_products_specifications_path
ON products_json
USING GIN (specifications jsonb_path_ops);
```

Supports a more specialized set of operations, particularly:

- `@>`
- `@?`
- `@@`

It can be smaller and efficient for supported containment and JSONPath queries.

However, it does not support the key-existence operators `?`, `?|` and `?&`.

### Comparison

| Feature                    | jsonb_ops    | jsonb_path_ops |
| -------------------------- | ------------ | -------------- |
| Default GIN operator class | Yes          | No             |
| Containment `@>`           | Yes          | Yes            |
| Key existence `?`          | Yes          | No             |
| Any/all key existence      | Yes          | No             |
| JSONPath operators         | Yes          | Yes            |
| Typical index size         | Often larger | Often smaller  |

**Important:** Choose the operator class according to the operators your application actually uses.

---

## 14. Expression Index on JSONB

You do not always need a GIN index for every JSONB query.

For a frequently queried specific field, a B-tree expression index may be more appropriate.

### Example

```sql
CREATE INDEX idx_products_brand
ON products_json (
    (specifications ->> 'brand')
);
```

Query:

```sql
SELECT *
FROM products_json
WHERE specifications ->> 'brand' = 'Logitech';
```

This can use the expression index.

### Numeric JSONB field

```sql
CREATE INDEX idx_products_dpi
ON products_json (
    ((specifications ->> 'dpi')::INTEGER)
);
```

Query:

```sql
SELECT *
FROM products_json
WHERE (specifications ->> 'dpi')::INTEGER > 1000;
```

**Important:** The indexed expression must match the query expression sufficiently for PostgreSQL to recognize it.

Ensure the JSON values are valid for the cast. Invalid values can make index creation or query execution fail.

---

## 15. JSONB vs Relational Columns

Suppose you are designing a product table.

### Option A: Separate columns

```sql
CREATE TABLE products_relational (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    color VARCHAR(50),
    wireless BOOLEAN,
    dpi INTEGER
);
```

### Option B: Flexible JSONB attributes

```sql
CREATE TABLE products_flexible (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    specifications JSONB
);
```

### Comparison

| Relational columns                | JSONB                                |
| --------------------------------- | ------------------------------------ |
| Strong column-level types         | Flexible structure                   |
| Easier constraints                | More flexible validation             |
| Straightforward joins and filters | JSON operators and indexing required |
| Better for stable business fields | Better for variable attributes       |
| Clearer schema                    | Less rigid schema                    |

### Recommended hybrid approach

Use normal columns for core business data and JSONB for flexible attributes.

```sql
CREATE TABLE products_hybrid (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    specifications JSONB
);
```

Here:

- `product_name` is a core business field.
- `price` is a core business field.
- `specifications` contains flexible product attributes.

This is often a practical design.

---

## 16. JSON vs JSONB vs MongoDB

Since PostgreSQL and MongoDB can both store JSON-like data, it is important to understand their differences.

| Feature       | PostgreSQL JSON                    | PostgreSQL JSONB                                    | MongoDB BSON                                |
| ------------- | ---------------------------------- | --------------------------------------------------- | ------------------------------------------- |
| Data model    | Relational database with JSON text | Relational database with binary JSON representation | Document database                           |
| Schema        | Relational schema plus JSON values | Relational schema plus JSONB values                 | Flexible document schema                    |
| Joins         | Native relational JOINs            | Native relational JOINs                             | Aggregation `$lookup`                       |
| Transactions  | ACID transactions                  | ACID transactions                                   | ACID transactions                           |
| JSON querying | Available                          | Rich JSONB operators and functions                  | Native document querying                    |
| Indexing      | Limited                            | GIN and expression indexes                          | Document and compound indexes               |
| Foreign keys  | Native                             | Native                                              | No native relational foreign-key constraint |

### Important

PostgreSQL JSONB does not turn PostgreSQL into MongoDB.

PostgreSQL remains a relational database with JSON support.

Choose based on data relationships, query patterns, consistency requirements and application architecture.

---

## 17. Handling Missing Keys, JSON Null and SQL NULL

This is an important edge case.

Consider:

```json
{
  "brand": "Logitech",
  "color": null
}
```

There are three different situations:

1. A key exists with a JSON null value.
2. A key does not exist.
3. The entire SQL column contains SQL NULL.

### Check key existence

```sql
SELECT specifications ? 'color'
FROM products_json;
```

Returns true if the top-level key exists, even if its JSON value is null.

### Check JSON null

```sql
SELECT *
FROM products_json
WHERE specifications -> 'color' = 'null'::JSONB;
```

### Check missing key

```sql
SELECT *
FROM products_json
WHERE NOT (specifications ? 'color');
```

### Check SQL NULL

```sql
SELECT *
FROM products_json
WHERE specifications IS NULL;
```

### Comparison

| Situation   | Example              | Check                                       |
| ----------- | -------------------- | ------------------------------------------- |
| JSON null   | `{"color": null}`    | `specifications -> 'color' = 'null'::JSONB` |
| Missing key | `{}`                 | `NOT (specifications ? 'color')`            |
| SQL NULL    | Column value is NULL | `specifications IS NULL`                    |

Do not confuse JSON null with SQL NULL.

---

## 18. JSONPath in PostgreSQL

PostgreSQL supports SQL/JSON path expressions for querying JSON documents.

Important operators:

| Operator | Purpose                                               |
| -------- | ----------------------------------------------------- |
| `@?`     | Checks whether a JSONPath expression returns any item |
| `@@`     | Evaluates a JSONPath predicate                        |

### Example

```sql
SELECT *
FROM products_json
WHERE specifications @?
    '$.dpi ? (@ > 1000)';
```

This finds products where the `dpi` value is greater than 1000.

### Another example

```sql
SELECT *
FROM products_json
WHERE specifications @@
    '$.wireless == true';
```

This evaluates a JSONPath predicate.

### Important

JSONPath provides flexible querying, but the exact supported index behavior depends on the JSONPath expression and GIN operator class.

---

## 19. Common Mistakes

| Mistake                                              | Correct understanding                             |
| ---------------------------------------------------- | ------------------------------------------------- | --------------------------------- | -------------------------------- |
| Treating JSON and JSONB as identical                 | Their storage and processing behavior differ      |
| Using JSONB for every column                         | Keep stable, important business fields relational |
| Forgetting `->` vs `->>`                             | One returns JSONB; the other returns TEXT         |
| Comparing numeric JSON values as text                | Cast to an appropriate numeric type               |
| Assuming JSON array indexing starts at 1             | JSON array indexing starts at 0                   |
| Assuming JSON null is SQL NULL                       | They are different values                         |
| Assuming `                                           |                                                   | ` performs a recursive deep merge | It concatenates at the top level |
| Creating GIN indexes without considering operators   | Choose the appropriate operator class             |
| Assuming every JSONB query automatically uses GIN    | Query expression and operator support matter      |
| Storing frequently joined foreign keys only in JSONB | Prefer normal relational columns                  |

---

## 20. Practice Exercises

Use the `products_json` table.

1. Create a JSONB column for product specifications.
2. Insert five products with different JSON structures.
3. Extract the brand using `->`.
4. Extract the brand as text using `->>`.
5. Access a nested JSON object.
6. Extract the second element from a JSON array.
7. Filter products by a JSON string.
8. Filter products by a numeric JSON value.
9. Check whether a key exists using `?`.
10. Find rows containing a JSONB object using `@>`.
11. Update a JSON value using `jsonb_set()`.
12. Add a new key using `||`.
13. Remove a key using `-`.
14. Expand a JSON array using `jsonb_array_elements_text()`.
15. Create a GIN index using `jsonb_ops`.
16. Create another GIN index using `jsonb_path_ops` on a test table.
17. Compare their supported operators.
18. Create a B-tree expression index on the brand field.
19. Distinguish missing keys from JSON null and SQL NULL.
20. Query JSONB using JSONPath.
21. Design a hybrid table with relational columns and JSONB attributes.
22. Explain why JSONB should not replace all relational columns.

---

## 21. Interview Questions

**Q1. What is JSON in PostgreSQL?**

A data type that stores JSON text and validates its JSON syntax.

**Q2. What is JSONB?**

A binary representation of JSON optimized for processing and indexing.

**Q3. What is the difference between JSON and JSONB?**

JSON preserves the original input text, while JSONB stores a decomposed representation and supports richer indexing.

**Q4. Which one should you generally prefer?**

JSONB for most queryable application data.

**Q5. What is the difference between `->` and `->>`?**

`->` returns JSON/JSONB, while `->>` returns TEXT.

**Q6. What does `@>` do?**

Checks whether the left JSONB value contains the right JSONB value.

**Q7. What does the `?` operator do?**

Checks for a top-level object key or matching string element in a top-level JSON array.

**Q8. What is a GIN index?**

A Generalized Inverted Index, useful for indexing composite values such as JSONB documents and arrays.

**Q9. What is the difference between jsonb_ops and jsonb_path_ops?**

jsonb_ops supports a broader set of JSONB operators. jsonb_path_ops specializes in containment and JSONPath operations.

**Q10. How do you update a nested JSONB value?**

Use `jsonb_set()` with the target path and replacement value.

**Q11. How do you expand a JSON array into rows?**

Use `jsonb_array_elements()` or `jsonb_array_elements_text()`.

**Q12. What is the difference between SQL NULL and JSON null?**

SQL NULL means the column has no SQL value. JSON null is a value inside a JSON document.

**Q13. Does JSONB preserve object key order?**

No.

**Q14. Does JSONB support indexing?**

Yes. It supports GIN and expression indexes, among other applicable index strategies.

**Q15. Should you store customer_id inside JSONB instead of a relational column?**

Usually not if it is an important relationship used for joins, constraints and filtering.

**Q16. Can PostgreSQL replace MongoDB using JSONB?**

It can support many document-oriented use cases, but the data model and query architecture remain different.

**Q17. What is JSONPath?**

A query language for navigating and filtering JSON data.

**Q18. When should you use JSONB instead of relational columns?**

When attributes are flexible, variable or naturally represented as semi-structured documents, while important stable business fields remain relational.

---

## Key Takeaways

- PostgreSQL supports JSON and JSONB.
- JSON preserves input text; JSONB stores a decomposed representation.
- JSONB is generally preferred for queryable application data.
- `->` returns JSONB; `->>` returns TEXT.
- JSON arrays use zero-based indexing.
- `@>` performs containment checks.
- `?`, `?|` and `?&` check top-level key or array-element existence.
- `jsonb_set()` updates values at JSON paths.
- `jsonb_array_elements()` expands arrays into rows.
- GIN indexes support suitable JSONB queries.
- `jsonb_ops` and `jsonb_path_ops` support different operator sets.
- Expression indexes are useful for frequently queried JSON fields.
- Missing keys, JSON null and SQL NULL are different.
- Use relational columns for core business data and JSONB for flexible attributes.
