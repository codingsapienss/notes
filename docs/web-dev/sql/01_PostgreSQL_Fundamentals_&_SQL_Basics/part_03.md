---
sidebar_label: "SQL Data Types in PostgreSQL"
sidebar_position: 1
---

# SQL Data Types in PostgreSQL

## 1. What are Data Types?

A **data type** defines what kind of values a database column can store.

Examples:

- `INTEGER` → Whole numbers
- `VARCHAR` → Variable-length text
- `BOOLEAN` → True/false
- `DATE` → Calendar date
- `NUMERIC` → Exact decimal values

Choosing the correct data type improves data integrity, storage efficiency, and query performance.

## 2. Numeric Data Types

Used for storing numbers.

| Data type        |  Storage | Range / Precision         | Example    |
| ---------------- | -------: | ------------------------- | ---------- |
| SMALLINT         |  2 bytes | -32,768 to 32,767         | 100        |
| INTEGER / INT    |  4 bytes | About ±2.1 billion        | 50000      |
| BIGINT           |  8 bytes | About ±9.2 quintillion    | 9876543210 |
| NUMERIC(p,s)     | Variable | Exact decimal precision   | 999.99     |
| REAL             |  4 bytes | Approx. 6 decimal digits  | 10.25      |
| DOUBLE PRECISION |  8 bytes | Approx. 15 decimal digits | 10.256789  |

### A. Integer Types

```sql
CREATE TABLE products (
    product_id INTEGER,
    stock_quantity SMALLINT,
    total_sales BIGINT
);
```

- `SMALLINT`: Small integer values.
- `INTEGER`: General-purpose whole numbers.
- `BIGINT`: Large integer values.

**Use case:** IDs, quantities, counters, and numeric counts.

### B. NUMERIC / DECIMAL

Stores exact decimal values.

Syntax:

```sql
NUMERIC(precision, scale)
```

- Precision: Total number of digits.
- Scale: Number of digits after the decimal point.

Example:

```sql
CREATE TABLE payments (
    payment_id INT,
    amount NUMERIC(10, 2)
);
```

`NUMERIC(10,2)` allows up to 10 total digits, including 2 decimal places.

Examples:

```text
12345678.90  -- Valid
99999999.99  -- Maximum positive value
123456789.90 -- Exceeds precision
```

**Important:** Use `NUMERIC` for financial values because it provides exact decimal arithmetic.

### C. REAL vs DOUBLE PRECISION

These are approximate floating-point types.

```sql
CREATE TABLE measurements (
    temperature REAL,
    distance DOUBLE PRECISION
);
```

Floating-point values may produce rounding differences:

```sql
SELECT 0.1::REAL + 0.2::REAL;
```

**Use case:** Scientific calculations, measurements, and approximate numerical data.

Avoid floating-point types for financial calculations.

## 3. Character and String Data Types

Used for storing text.

| Data type  | Description                                     |
| ---------- | ----------------------------------------------- |
| CHAR(n)    | Fixed-length character string                   |
| VARCHAR(n) | Variable-length string with a maximum length    |
| TEXT       | Variable-length string without a declared limit |

### A. CHAR

```sql
CREATE TABLE employees (
    country_code CHAR(2)
);
```

Stores fixed-length strings. PostgreSQL pads shorter values with spaces.

### B. VARCHAR

```sql
CREATE TABLE customers (
    customer_name VARCHAR(100)
);
```

Stores strings up to the specified character limit.

### C. TEXT

```sql
CREATE TABLE articles (
    article_content TEXT
);
```

Stores variable-length text without a declared character limit.

**Important PostgreSQL behaviour:**

- `VARCHAR(n)` enforces a maximum character length.
- `TEXT` has no declared character limit.
- `VARCHAR` without a length behaves like `TEXT`.
- PostgreSQL does not provide a meaningful performance advantage for `VARCHAR(n)` over `TEXT` merely because a length is specified.

**Practical recommendation:** Use `TEXT` by default. Use `VARCHAR(n)` when the maximum length is a genuine data rule.

## 4. Boolean Data Type

Stores logical values.

Possible values:

- `TRUE`
- `FALSE`
- `NULL` (unknown or missing)

Example:

```sql
CREATE TABLE employees (
    employee_id INT,
    employee_name TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

Insert:

```sql
INSERT INTO employees
VALUES (1, 'Rahul', TRUE);
```

Query:

```sql
SELECT *
FROM employees
WHERE is_active = TRUE;
```

PostgreSQL also accepts common boolean input forms such as `true`, `false`, `yes`, `no`, `1`, and `0`.

**Important:** `NULL` is not equivalent to `FALSE`.

## 5. Date and Time Data Types

PostgreSQL provides several types for handling dates and time.

| Data type   | Stores                                | Example                     |
| ----------- | ------------------------------------- | --------------------------- |
| DATE        | Calendar date                         | `2026-11-16`                |
| TIME        | Time of day                           | `14:30:00`                  |
| TIMESTAMP   | Date and time without time zone       | `2026-11-16 14:30:00`       |
| TIMESTAMPTZ | Date and time representing an instant | `2026-11-16 14:30:00+05:30` |
| INTERVAL    | Duration                              | `2 days 3 hours`            |

### A. DATE

```sql
CREATE TABLE employees (
    joining_date DATE
);
```

Insert:

```sql
INSERT INTO employees
VALUES ('2026-11-16');
```

### B. TIME

```sql
CREATE TABLE store_hours (
    opening_time TIME,
    closing_time TIME
);
```

### C. TIMESTAMP

Stores date and time without time-zone conversion.

```sql
CREATE TABLE events (
    event_time TIMESTAMP
);
```

### D. TIMESTAMPTZ

Stores an absolute point in time internally, normalized to UTC. PostgreSQL converts it to the current session's time zone when displaying it.

```sql
CREATE TABLE orders (
    order_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important distinction:**

| TIMESTAMP                                               | TIMESTAMPTZ                              |
| ------------------------------------------------------- | ---------------------------------------- |
| No time-zone information                                | Represents an absolute instant           |
| Does not perform time-zone conversion                   | Converts input to UTC internally         |
| Same stored date/time fields regardless of session zone | Displayed according to session time zone |

**Practical recommendation:** Use `TIMESTAMPTZ` for events such as orders, payments, log entries, and user activity when the actual instant matters.

### E. INTERVAL

Stores a duration.

```sql
SELECT INTERVAL '2 days 3 hours';
```

Date arithmetic:

```sql
SELECT NOW() + INTERVAL '7 days';
```

```sql
SELECT NOW() - INTERVAL '30 minutes';
```

## 6. UUID Data Type

UUID stands for **Universally Unique Identifier**.

It stores a 128-bit identifier.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

Create a table:

```sql
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY,
    customer_name TEXT
);
```

Generate a UUID:

```sql
INSERT INTO customers
VALUES (gen_random_uuid(), 'Rahul');
```

`gen_random_uuid()` generates a version 4 UUID in modern PostgreSQL.

**UUID vs INTEGER**

| INTEGER / BIGINT                             | UUID                                 |
| -------------------------------------------- | ------------------------------------ |
| Smaller storage                              | 16 bytes                             |
| Sequential values are possible               | Usually randomly generated           |
| Easy to read                                 | Longer identifier                    |
| Can expose approximate record creation order | Harder to guess                      |
| Suitable for many internal IDs               | Useful for distributed ID generation |

**Important:** UUIDs reduce dependence on a centralized ID generator, but random UUIDs can have different index-locality characteristics from sequential IDs.

## 7. JSON and JSONB Data Types

PostgreSQL supports JSON data storage.

### A. JSON

Stores JSON text and preserves its original formatting, including whitespace and key order.

```sql
CREATE TABLE products (
    product_id INT,
    specifications JSON
);
```

### B. JSONB

Stores JSON in a decomposed binary representation.

```sql
CREATE TABLE products (
    product_id INT,
    specifications JSONB
);
```

| JSON                                           | JSONB                                            |
| ---------------------------------------------- | ------------------------------------------------ |
| Preserves input text formatting and key order  | Does not preserve formatting or key order        |
| Stores original JSON text                      | Stores decomposed binary representation          |
| Must process text representation when querying | Generally more efficient for repeated processing |
| Limited indexing options                       | Supports GIN indexing                            |

Example insertion:

```sql
INSERT INTO products
VALUES (
    1,
    '{"color": "black", "wireless": true}'::JSONB
);
```

**Practical recommendation:** Prefer `JSONB` for most application use cases involving JSON queries and indexing.

Use relational columns for important structured fields and JSONB for flexible attributes.

## 8. Array Data Type

PostgreSQL supports arrays as column values.

Example:

```sql
CREATE TABLE employees (
    employee_id INT,
    skills TEXT[]
);
```

Insert:

```sql
INSERT INTO employees
VALUES (
    1,
    ARRAY['Node.js', 'PostgreSQL', 'Redis']
);
```

Retrieve:

```sql
SELECT * FROM employees;
```

Access an element:

```sql
SELECT skills[1]
FROM employees;
```

**Important:** PostgreSQL arrays are one-based by default, so the first element is at index `1`.

Arrays are useful for simple collections, but frequently queried many-to-many relationships are generally better modeled using separate tables.

## 9. BYTEA Data Type

`BYTEA` stores binary data as a sequence of bytes.

Example:

```sql
CREATE TABLE files (
    file_id INT,
    file_data BYTEA
);
```

Use cases:

- Binary file content.
- Small images.
- Encrypted binary values.
- Other binary payloads.

For large files, external object storage is often a better choice, with the database storing file metadata and storage references.

## 10. Type Casting and Conversion

Type casting converts a value from one data type to another.

### A. CAST()

```sql
SELECT CAST('100' AS INTEGER);
```

### B. PostgreSQL shorthand (`::`)

```sql
SELECT '100'::INTEGER;
```

Both perform explicit type conversion.

### C. Numeric conversion

```sql
SELECT CAST('99.50' AS NUMERIC(10, 2));
```

### D. Date conversion

```sql
SELECT '2026-11-16'::DATE;
```

### E. Conversion in queries

```sql
SELECT
    employee_name,
    salary::INTEGER
FROM employees;
```

**Important:** A cast can fail if the input cannot be converted into the target type.

```sql
SELECT 'hello'::INTEGER;
```

This produces an error.

## 11. Choosing the Correct Data Type

| Requirement                 | Recommended type                          |
| --------------------------- | ----------------------------------------- |
| Employee ID                 | INTEGER / BIGINT / UUID                   |
| Product quantity            | INTEGER                                   |
| Product price               | NUMERIC(10,2)                             |
| Customer name               | TEXT or VARCHAR                           |
| Email                       | TEXT with a suitable validation rule      |
| Account active status       | BOOLEAN                                   |
| Date of birth               | DATE                                      |
| Order creation time         | TIMESTAMPTZ                               |
| Duration                    | INTERVAL                                  |
| Flexible product attributes | JSONB                                     |
| Employee skills             | TEXT[] or a normalized relationship table |
| Binary file content         | BYTEA or external object storage          |

**Do not choose a data type only because it accepts the sample value. Consider the application's rules, precision, storage, indexing, and future operations.**

## 12. Common Mistakes

1. Using `FLOAT` or `REAL` for money instead of `NUMERIC`.
2. Using `VARCHAR(255)` everywhere without a real length requirement.
3. Treating `TIMESTAMP` and `TIMESTAMPTZ` as interchangeable.
4. Assuming `TIMESTAMPTZ` stores the original time-zone name.
5. Using random numeric IDs without considering collisions.
6. Storing frequently queried relational data inside JSONB unnecessarily.
7. Using arrays for complex relationships that need independent querying.
8. Assuming `NULL` means zero, empty string, or false.
9. Assuming type casting always succeeds.
10. Using `INTEGER` for values that may exceed its range.

## 13. Practice Exercises

1. Create an `employees` table with integer ID, text name, numeric salary, boolean status, and date of birth.
2. Create a `products` table with product name, price, stock quantity, and JSONB specifications.
3. Create an `orders` table with a UUID ID and TIMESTAMPTZ creation time.
4. Insert sample records into all three tables.
5. Insert a JSONB value containing product color and brand.
6. Create an employee table with a `TEXT[]` skills column.
7. Convert a string into INTEGER using both `CAST()` and `::`.
8. Calculate a future date using `INTERVAL`.
9. Explain why NUMERIC is preferred over REAL for financial values.
10. Explain the difference between TIMESTAMP and TIMESTAMPTZ.

## 14. Interview Questions

1. What are SQL data types?
2. What is the difference between INTEGER and BIGINT?
3. What is the difference between NUMERIC and DOUBLE PRECISION?
4. Why should financial values use NUMERIC?
5. What is the difference between CHAR, VARCHAR, and TEXT in PostgreSQL?
6. What is the difference between TIMESTAMP and TIMESTAMPTZ?
7. What is UUID, and when should you use it?
8. What is the difference between JSON and JSONB?
9. What is the BYTEA data type?
10. What is type casting? Explain CAST() and `::`.
11. Are PostgreSQL arrays zero-based or one-based?
12. Why might storing relational data in JSONB be a poor design decision?
