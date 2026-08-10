---
sidebar_label: "Production SQL Best Practices"
sidebar_position: 1
---

# Production SQL Best Practices

## 1. Introduction

Writing SQL queries that return correct results is only the first step.

Production SQL must also be:

- Secure.
- Performant.
- Maintainable.
- Reliable under concurrent requests.
- Consistent with business rules.
- Scalable as data grows.
- Safe during deployments.

A query that works with 100 records may perform poorly with 10 million records.

Production database engineering requires understanding both SQL correctness and operational impact.

---

## 2. Use Explicit Column Selection

Avoid using `SELECT *` in production application queries unless retrieving every column is genuinely required.

### Avoid

```sql
SELECT *
FROM customers
WHERE customer_id = 101;
```

### Prefer

```sql
SELECT
    customer_id,
    customer_name,
    email
FROM customers
WHERE customer_id = 101;
```

### Why?

1. Transfers only required data.
2. Reduces unnecessary network traffic.
3. Makes query output predictable.
4. Reduces accidental exposure of sensitive columns.
5. Makes application dependencies clearer.

**Important:** `SELECT *` is not automatically slow. The problem is retrieving unnecessary columns, especially wide or large values.

---

## 3. Always Use Parameterized Queries

Never build SQL queries by directly concatenating user input.

### Unsafe example

```javascript
const email = req.body.email;

const query = `
    SELECT *
    FROM customers
    WHERE email = '${email}'
`;
```

An attacker could provide malicious SQL input.

Example:

```text
' OR '1'='1
```

This can change the meaning of the query.

### Safe approach using node-postgres

```javascript
const email = req.body.email;

const query = `
    SELECT
        customer_id,
        customer_name,
        email
    FROM customers
    WHERE email = $1
`;

const result = await pool.query(query, [email]);
```

PostgreSQL receives the SQL statement and its parameter values separately.

### Multiple parameters

```javascript
const query = `
    SELECT *
    FROM orders
    WHERE customer_id = $1
      AND status = $2
`;

const result = await pool.query(query, [customerId, "completed"]);
```

### Important

- `$1`, `$2`, `$3` are PostgreSQL positional parameters.
- Parameters represent values, not SQL identifiers.
- You cannot parameterize a table name or column name using `$1`.
- Dynamic identifiers require strict allowlisting and safe identifier-quoting utilities.

---

## 4. Avoid SQL Injection

SQL injection occurs when untrusted input changes the structure or meaning of a SQL statement.

### Vulnerable query

```javascript
const query = `
    SELECT *
    FROM customers
    WHERE email = '${req.body.email}'
`;
```

### Protected query

```javascript
const query = `
    SELECT *
    FROM customers
    WHERE email = $1
`;

const result = await pool.query(query, [req.body.email]);
```

### Dynamic sorting example

Suppose users can sort products by price or name.

This is unsafe:

```javascript
const query = `
    SELECT *
    FROM products
    ORDER BY ${req.query.sort}
`;
```

Use an allowlist:

```javascript
const allowedColumns = {
  price: "price",
  name: "product_name",
};

const sortColumn = allowedColumns[req.query.sort] || "product_name";

const query = `
    SELECT
        product_id,
        product_name,
        price
    FROM products
    ORDER BY ${sortColumn}
`;

const result = await pool.query(query);
```

If sort direction is dynamic, allowlist it separately:

```javascript
const allowedDirections = ["ASC", "DESC"];

const direction = allowedDirections.includes(req.query.direction?.toUpperCase())
  ? req.query.direction.toUpperCase()
  : "ASC";
```

Only trusted, allowlisted SQL fragments should be interpolated.

---

## 5. Use Appropriate Indexes

Indexes help PostgreSQL find rows without scanning an entire table in suitable query plans.

Suppose the application frequently searches customers by email.

```sql
SELECT customer_id, customer_name
FROM customers
WHERE email = 'user@example.com';
```

If email is frequently searched and needs to be unique:

```sql
CREATE UNIQUE INDEX idx_customers_email
ON customers(email);
```

This supports lookups and enforces uniqueness.

### Index frequently filtered columns

Example:

```sql
SELECT *
FROM orders
WHERE customer_id = 101;
```

Potential index:

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

### Composite index example

Suppose the application frequently executes:

```sql
SELECT *
FROM orders
WHERE customer_id = 101
  AND status = 'completed'
ORDER BY created_at DESC;
```

A possible index:

```sql
CREATE INDEX idx_orders_customer_status_created
ON orders(customer_id, status, created_at DESC);
```

### Important index rules

- Indexes improve some reads but add write and storage overhead.
- Index usefulness depends on query patterns and data distribution.
- Column order matters in composite indexes.
- PostgreSQL does not automatically index foreign-key referencing columns.
- The query planner decides whether to use an index.
- Do not create an index for every column.

Use `EXPLAIN` and `EXPLAIN ANALYZE` to evaluate actual query plans.

---

## 6. Avoid N+1 Query Problems

The N+1 problem occurs when an application executes one query to retrieve a collection and then one additional query for every returned record.

### Example

Fetch all customers:

```javascript
const customers = await pool.query(`
    SELECT customer_id, customer_name
    FROM customers
`);
```

Then fetch orders separately for every customer:

```javascript
for (const customer of customers.rows) {
  const orders = await pool.query(
    `
        SELECT *
        FROM orders
        WHERE customer_id = $1
        `,
    [customer.customer_id],
  );
}
```

If there are 100 customers:

- 1 query for customers.
- 100 queries for orders.
- Total: 101 queries.

### Better approach: JOIN

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount,
    o.status
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.customer_id
ORDER BY c.customer_id;
```

This retrieves the related data in one query.

### Alternative: Batch query

```sql
SELECT *
FROM orders
WHERE customer_id = ANY($1::INT[]);
```

Node.js:

```javascript
const customerIds = customers.rows.map((customer) => customer.customer_id);

const orders = await pool.query(
  `
    SELECT *
    FROM orders
    WHERE customer_id = ANY($1::INT[])
    `,
  [customerIds],
);
```

### Important

A JOIN can produce duplicate parent rows when one parent has multiple children. Choose the result structure carefully.

For multiple independent one-to-many relationships, aggregate each relationship separately before joining to avoid multiplying rows.

---

## 7. Use Pagination for Large Datasets

Avoid retrieving thousands or millions of records in a single request.

### Basic pagination

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at
FROM orders
ORDER BY created_at DESC, order_id DESC
LIMIT 20 OFFSET 0;
```

Next page:

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at
FROM orders
ORDER BY created_at DESC, order_id DESC
LIMIT 20 OFFSET 20;
```

### Problem with OFFSET

Large offsets can become expensive because PostgreSQL may need to scan and discard many rows.

### Keyset pagination

Instead of skipping rows, use the last row from the previous page as a cursor.

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at
FROM orders
WHERE (created_at, order_id) < ($1, $2)
ORDER BY created_at DESC, order_id DESC
LIMIT 20;
```

Parameters:

- `$1`: Last returned `created_at`.
- `$2`: Last returned `order_id`.

A suitable index:

```sql
CREATE INDEX idx_orders_created_order
ON orders(created_at DESC, order_id DESC);
```

### Comparison

| OFFSET pagination                                    | Keyset pagination                                       |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Uses LIMIT and OFFSET                                | Uses cursor values                                      |
| Large offsets can be expensive                       | Efficient for sequential browsing with a suitable index |
| Page positions can shift as data changes             | More stable traversal                                   |
| Useful for small datasets and direct page navigation | Useful for large datasets and feeds                     |

Keyset pagination is not a universal replacement. It is less convenient when users must jump directly to arbitrary page numbers.

---

## 8. Use Transactions for Related Operations

A transaction groups multiple operations into one logical unit.

Example: placing an order.

The application may need to:

1. Insert an order.
2. Insert order items.
3. Record a payment.
4. Update inventory.

If some operations succeed and others fail, the database could become inconsistent.

### Transaction example

```sql
BEGIN;

INSERT INTO orders (
    customer_id,
    total_amount,
    status
)
VALUES (101, 2500, 'pending')
RETURNING order_id;

-- Insert order items using the returned order_id.

-- Record payment.

COMMIT;
```

If an operation fails:

```sql
ROLLBACK;
```

### Node.js example

```javascript
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const orderResult = await client.query(
    `
        INSERT INTO orders (
            customer_id,
            total_amount,
            status
        )
        VALUES ($1, $2, $3)
        RETURNING order_id
        `,
    [101, 2500, "pending"],
  );

  const orderId = orderResult.rows[0].order_id;

  await client.query(
    `
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price
        )
        VALUES ($1, $2, $3, $4)
        `,
    [orderId, 5, 2, 1250],
  );

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

### Critical rule

All queries in a transaction must use the same database connection.

Do not use separate `pool.query()` calls for different steps of one transaction.

---

## 9. Keep Transactions Short

Long-running transactions can cause:

- Locks to remain held longer.
- Increased contention.
- Deadlocks.
- Delayed cleanup of obsolete row versions.
- Increased operational pressure.

### Avoid

```text
BEGIN

Fetch data
Call external payment API
Wait for user confirmation
Update database

COMMIT
```

An external API call may take several seconds or fail unpredictably.

### Better approach

```text
Perform necessary external operations

BEGIN

Perform database changes
Validate required conditions

COMMIT
```

The exact design depends on business consistency requirements.

For workflows involving external payments, use an appropriate state machine, idempotency keys and reconciliation process rather than assuming a database transaction can include an external service.

---

## 10. Handle NULL Correctly

SQL NULL represents missing or unknown information.

This comparison is incorrect:

```sql
SELECT *
FROM employees
WHERE manager_id = NULL;
```

Use:

```sql
SELECT *
FROM employees
WHERE manager_id IS NULL;
```

For non-NULL:

```sql
SELECT *
FROM employees
WHERE manager_id IS NOT NULL;
```

### Use COALESCE when appropriate

```sql
SELECT
    customer_name,
    COALESCE(email, 'Not provided') AS email
FROM customers;
```

### Important

Do not replace NULL with arbitrary default values unless the business meaning supports it.

NULL and an empty string are different values.

---

## 11. Use Constraints for Data Integrity

Application validation alone is not sufficient.

Data can enter a database through:

- API requests.
- Background jobs.
- Admin tools.
- Scripts.
- Other services.
- Direct SQL operations.

The database should enforce important invariants.

### NOT NULL

```sql
ALTER TABLE customers
ALTER COLUMN customer_name SET NOT NULL;
```

### UNIQUE

```sql
ALTER TABLE customers
ADD CONSTRAINT customers_email_unique
UNIQUE(email);
```

This assumes the existing data has no conflicting non-NULL email values.

### CHECK

```sql
ALTER TABLE products
ADD CONSTRAINT products_price_check
CHECK (price >= 0);
```

### FOREIGN KEY

```sql
ALTER TABLE orders
ADD CONSTRAINT orders_customer_fk
FOREIGN KEY (customer_id)
REFERENCES customers(customer_id);
```

### Important

Use constraints for rules that must remain true regardless of which application or process writes to the database.

Application validation still matters for clear error messages and user experience.

---

## 12. Use Atomic Updates for Concurrent Operations

Consider inventory.

A naive application flow:

1. Read stock quantity.
2. Check whether stock is sufficient.
3. Decrease stock.
4. Save the result.

Two requests may read the same stock value and both attempt to purchase the same inventory.

### Unsafe pattern

```sql
SELECT stock_quantity
FROM products
WHERE product_id = 5;
```

Then the application checks the quantity and separately updates it.

This creates a race condition.

### Better: Conditional atomic UPDATE

```sql
UPDATE products
SET stock_quantity = stock_quantity - 2
WHERE product_id = 5
  AND stock_quantity >= 2
RETURNING stock_quantity;
```

If a row is returned, the stock deduction succeeded.

If no row is returned, the product did not have sufficient stock or the product did not exist.

### Why this works

PostgreSQL coordinates concurrent updates to the same row. The condition is evaluated as part of the update, avoiding the separate read-then-write race.

For an order containing multiple products, use a transaction and handle partial failures correctly.

---

## 13. Use EXPLAIN and EXPLAIN ANALYZE

Do not optimize queries based only on assumptions.

Inspect the query plan.

### EXPLAIN

```sql
EXPLAIN
SELECT *
FROM orders
WHERE customer_id = 101;
```

It shows the planner's estimated execution plan.

### EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE customer_id = 101;
```

It executes the query and reports actual execution details.

### Important information

| Metric       | Meaning                             |
| ------------ | ----------------------------------- |
| Startup Cost | Estimated cost before output begins |
| Total Cost   | Estimated total planner cost        |
| Plan Rows    | Estimated output rows               |
| Actual Rows  | Actual output rows                  |
| Actual Time  | Measured execution time             |
| Loops        | Number of executions of a plan node |
| Buffers      | Data block activity when requested  |

### Include buffer information

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE customer_id = 101;
```

### Warning

`EXPLAIN ANALYZE` executes the statement.

For UPDATE or DELETE, it performs the actual modification. Use a safe test environment or an appropriate transaction and rollback strategy when testing destructive statements.

---

## 14. Avoid Unnecessary DISTINCT

`DISTINCT` removes duplicate result rows.

### Example

```sql
SELECT DISTINCT customer_id
FROM orders;
```

This can be correct when unique customer IDs are required.

But using DISTINCT to hide an incorrectly designed JOIN is a common mistake.

### Problematic example

```sql
SELECT DISTINCT
    c.customer_id,
    c.customer_name
FROM customers c
JOIN orders o
    ON o.customer_id = c.customer_id;
```

If the actual requirement is only to find customers who have placed orders, use EXISTS:

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

Use DISTINCT when duplicate elimination is genuinely part of the required result.

---

## 15. Avoid SELECT Queries Inside Loops

Executing database queries inside application loops can increase database round trips.

### Avoid

```javascript
for (const productId of productIds) {
  const result = await pool.query(
    `
        SELECT *
        FROM products
        WHERE product_id = $1
        `,
    [productId],
  );
}
```

### Better

```javascript
const result = await pool.query(
  `
    SELECT *
    FROM products
    WHERE product_id = ANY($1::INT[])
    `,
  [productIds],
);
```

This performs one query instead of one query per product.

For very large arrays, consider batching.

---

## 16. Use Connection Pooling

Creating a new PostgreSQL connection for every API request is inefficient.

A connection pool maintains reusable database connections.

### Node.js example using pg

Install:

```bash
npm install pg
```

Create `db.js`:

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error);
});

module.exports = pool;
```

Use it:

```javascript
const pool = require("./db");

const result = await pool.query(
  "SELECT * FROM customers WHERE customer_id = $1",
  [101],
);
```

### Important pool settings

| Setting                   | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `max`                     | Maximum connections in the pool                       |
| `idleTimeoutMillis`       | How long an idle connection can remain before removal |
| `connectionTimeoutMillis` | How long to wait for a connection                     |

### Important

The connection count across all application instances matters.

For example:

```text
5 application instances × 20 connections
= 100 possible connections
```

Choose pool sizes based on PostgreSQL capacity and total application workload, not just one Node.js process.

---

## 17. Use LIMIT for Controlled Data Retrieval

Avoid fetching an unbounded number of rows from API endpoints.

### Avoid

```sql
SELECT *
FROM orders
WHERE status = 'completed';
```

If the table contains millions of completed orders, the result may be huge.

### Prefer

```sql
SELECT
    order_id,
    customer_id,
    total_amount,
    created_at
FROM orders
WHERE status = 'completed'
ORDER BY created_at DESC, order_id DESC
LIMIT 50;
```

For user-facing APIs, combine LIMIT with pagination and suitable indexes.

---

## 18. Use Appropriate Data Types

Choosing the correct data type affects correctness, storage and query behavior.

### Monetary values

Prefer:

```sql
price NUMERIC(10, 2)
```

Avoid using floating-point types for values requiring exact decimal arithmetic.

### Dates and timestamps

Use:

```sql
created_at TIMESTAMPTZ DEFAULT NOW()
```

`TIMESTAMPTZ` represents an instant and is generally appropriate for event timestamps.

### Boolean values

Use:

```sql
is_active BOOLEAN DEFAULT TRUE
```

### Identifiers

Use suitable integer, bigint or UUID identifiers depending on system requirements.

### Important

Do not choose data types based only on convenience. Consider precision, range, semantics and application requirements.

---

## 19. Use UPSERT for Safe Conflict Handling

PostgreSQL supports `INSERT ... ON CONFLICT`.

Example:

```sql
INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
)
ON CONFLICT (email)
DO UPDATE
SET customer_name = EXCLUDED.customer_name;
```

This assumes `email` has a suitable unique constraint or unique index.

### DO NOTHING

```sql
INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
)
ON CONFLICT (email)
DO NOTHING;
```

### Important

UPSERT is not a replacement for understanding concurrency and business rules.

For example, a payment operation should not be considered safe merely because it uses ON CONFLICT. Use appropriate unique idempotency keys and transaction logic.

---

## 20. Use RETURNING Instead of Additional SELECT Queries

PostgreSQL supports `RETURNING` for INSERT, UPDATE and DELETE.

### Without RETURNING

```sql
INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
);
```

You may need another query to retrieve the generated ID.

### With RETURNING

```sql
INSERT INTO customers (
    customer_name,
    email
)
VALUES (
    'Rahul',
    'rahul@example.com'
)
RETURNING customer_id, customer_name;
```

### UPDATE example

```sql
UPDATE products
SET price = 1500
WHERE product_id = 5
RETURNING product_id, price;
```

This avoids an additional database round trip when the modified row is needed.

---

## 21. Avoid Overusing JSONB

PostgreSQL supports JSONB for storing structured JSON documents.

Example:

```sql
CREATE TABLE product_metadata (
    metadata_id BIGSERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    metadata JSONB
);
```

Insert:

```sql
INSERT INTO product_metadata (
    product_id,
    metadata
)
VALUES (
    5,
    '{"color": "black", "weight": 2.5}'
);
```

JSONB is useful for flexible attributes.

However, important business attributes should generally be stored in relational columns.

For example:

- Product price.
- Order status.
- Customer email.
- Payment amount.
- Inventory quantity.

These fields often need constraints, relationships, indexing and predictable query behavior.

---

## 22. Avoid Unnecessary Database Round Trips

Suppose you need the total number of orders for a customer.

### Avoid

1. Fetch all orders.
2. Count them in JavaScript.

```javascript
const result = await pool.query(
  "SELECT * FROM orders WHERE customer_id = $1",
  [101],
);

const count = result.rows.length;
```

### Prefer

```sql
SELECT COUNT(*) AS total_orders
FROM orders
WHERE customer_id = 101;
```

Let PostgreSQL perform filtering and aggregation when that is appropriate.

### General rule

Move data-intensive filtering, aggregation and joining close to the data when it reduces unnecessary transfers and application work.

This does not mean every business operation belongs inside SQL. Choose the layer that best preserves correctness and maintainability.

---

## 23. Handle Errors Properly

Production applications should handle database errors deliberately.

Common PostgreSQL SQLSTATE codes:

| SQLSTATE | Meaning                     |
| -------- | --------------------------- |
| `23505`  | Unique constraint violation |
| `23503`  | Foreign key violation       |
| `23502`  | Not-null violation          |
| `23514`  | Check constraint violation  |
| `40001`  | Serialization failure       |
| `40P01`  | Deadlock detected           |
| `57014`  | Query canceled              |

### Node.js example

```javascript
try {
  const result = await pool.query(
    `
        INSERT INTO customers (
            customer_name,
            email
        )
        VALUES ($1, $2)
        `,
    ["Rahul", "rahul@example.com"],
  );
} catch (error) {
  if (error.code === "23505") {
    console.error("Duplicate value");
  } else {
    console.error("Database operation failed");
  }
}
```

### Important

- Do not expose raw database error messages to end users.
- Log useful diagnostic information.
- Do not log passwords, access tokens or sensitive personal data.
- Retry only errors that are appropriate to retry.
- Serialization failures require retrying the entire transaction, not just the failed statement.

---

## 24. Use Idempotency for Critical Operations

An operation is idempotent when repeating it produces the same intended outcome as executing it once.

This is especially important for:

- Payment processing.
- Order creation.
- Payouts.
- Webhook handling.
- Retryable background jobs.

### Example

Suppose a payment provider sends the same webhook multiple times.

Without protection, the application may process the payment more than once.

A common approach is storing a unique provider event ID.

Illustrative extension:

```sql
CREATE TABLE processed_events (
    event_id VARCHAR(150) PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

Process an event:

```sql
INSERT INTO processed_events (event_id)
VALUES ('evt_12345')
ON CONFLICT DO NOTHING
RETURNING event_id;
```

If a row is returned, this transaction acquired the event for processing.

If no row is returned, the event was already recorded.

For reliable processing, the event claim and its corresponding database changes must be coordinated in the same transaction. External side effects need their own idempotency and recovery strategy.

---

## 25. Production Database Security

Database security should follow the principle of least privilege.

Avoid using a PostgreSQL superuser account for ordinary application operations.

Create a dedicated application role:

```sql
CREATE ROLE techbazaar_app
WITH LOGIN PASSWORD 'UseASecretFromYourSecretManager';
```

Grant only the required permissions.

Example:

```sql
GRANT CONNECT ON DATABASE techbazaar
TO techbazaar_app;
```

```sql
GRANT USAGE ON SCHEMA public
TO techbazaar_app;
```

```sql
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO techbazaar_app;
```

Grant sequence privileges separately where required:

```sql
GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO techbazaar_app;
```

For future objects, configure appropriate default privileges for the role that creates those objects.

### Important

- Do not use superuser credentials in application code.
- Store credentials securely.
- Restrict network access.
- Use TLS where appropriate.
- Review permissions regularly.
- Separate application, migration and administrative roles when practical.

---

## 26. Monitoring Production Queries

A production database needs ongoing monitoring.

Useful PostgreSQL views and extensions include:

### pg_stat_activity

Shows current database sessions and queries.

```sql
SELECT
    pid,
    usename,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE datname = current_database();
```

### Find long-running queries

```sql
SELECT
    pid,
    now() - query_start AS duration,
    state,
    query
FROM pg_stat_activity
WHERE state <> 'idle'
ORDER BY duration DESC;
```

### pg_stat_user_tables

Shows table-level activity statistics.

```sql
SELECT
    relname,
    seq_scan,
    idx_scan,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

### pg_stat_statements

The `pg_stat_statements` extension tracks aggregated SQL execution statistics.

It is useful for identifying queries with:

- High total execution time.
- High execution frequency.
- Large average execution time.
- Significant block reads.

It must be installed and configured appropriately.

---

## 27. Production SQL Checklist

Before deploying a query or database change, review the following.

### Query correctness

- Are joins correct?
- Can the query produce duplicate rows?
- Is NULL handled correctly?
- Are aggregates calculated correctly?
- Are constraints enforcing important invariants?

### Performance

- Are only required columns selected?
- Are filters selective where appropriate?
- Are suitable indexes available?
- Has the execution plan been inspected?
- Is pagination used for large result sets?
- Are unnecessary round trips avoided?

### Security

- Are parameters used?
- Are dynamic identifiers allowlisted?
- Are database credentials protected?
- Does the application role have limited privileges?

### Reliability

- Are related writes transactional?
- Are concurrent updates safe?
- Are retryable operations idempotent?
- Are errors handled properly?
- Are transactions kept short?

### Operations

- Are queries monitored?
- Are backups available?
- Have migrations been tested?
- Is there a recovery plan?

---

## 28. Practice Exercises

Use the TechBazaar schema.

1. Rewrite a `SELECT *` query to select only required columns.
2. Write a parameterized customer lookup using Node.js and `pg`.
3. Implement safe dynamic sorting with an allowlist.
4. Find all customers who have placed at least one order using EXISTS.
5. Retrieve customers and their orders without an N+1 query pattern.
6. Implement OFFSET pagination for orders.
7. Implement keyset pagination for orders.
8. Create an appropriate composite index for a common order lookup.
9. Write a transaction for order creation and order-item insertion.
10. Implement an atomic stock deduction.
11. Identify possible race conditions in a read-then-update inventory workflow.
12. Use EXPLAIN ANALYZE to inspect a query.
13. Write an UPSERT for customers with a unique email constraint.
14. Implement an idempotent webhook event record.
15. Find long-running queries using `pg_stat_activity`.
16. Create a restricted application database role.
17. Identify which operations in a payment workflow belong inside a transaction.
18. Explain how connection pooling prevents unnecessary connection creation.

---

## 29. Interview Questions

**Q1. Why should we avoid SELECT \* in production?**

It can retrieve unnecessary data, increase network traffic and create unclear application dependencies.

**Q2. What is SQL injection?**

A vulnerability in which untrusted input changes the structure or meaning of an SQL query.

**Q3. How do parameterized queries prevent SQL injection?**

They separate SQL structure from user-supplied values.

**Q4. What is the N+1 query problem?**

One query retrieves parent records, followed by one additional query per parent to retrieve related data.

**Q5. What is the difference between OFFSET and keyset pagination?**

OFFSET skips rows based on position; keyset pagination continues from the last returned sort key.

**Q6. Why should transactions be short?**

Long transactions increase lock duration, contention and pressure on PostgreSQL's MVCC cleanup.

**Q7. Why should database constraints exist if the backend already validates data?**

Constraints protect data integrity regardless of which application or process writes to the database.

**Q8. How do you prevent inventory overselling?**

Use atomic conditional updates or appropriate locking within a transaction.

**Q9. What is connection pooling?**

Reusing a managed set of database connections instead of repeatedly creating new connections.

**Q10. Why must transaction queries use the same connection?**

A PostgreSQL transaction belongs to one database session. Separate pooled connections do not share that transaction.

**Q11. What is EXPLAIN ANALYZE?**

It executes a query and reports actual execution statistics alongside the plan.

**Q12. Why should we avoid unnecessary DISTINCT?**

It can add duplicate-elimination work and may hide incorrect join logic.

**Q13. What is UPSERT?**

An insert operation that handles uniqueness conflicts using `ON CONFLICT`.

**Q14. What is idempotency?**

Ensuring repeated execution of an operation produces the same intended outcome rather than duplicating effects.

**Q15. How do you handle serialization failures?**

Retry the entire transaction using a controlled retry strategy.

**Q16. How do you monitor slow queries?**

Use query statistics, execution plans, `pg_stat_activity` and `pg_stat_statements`.

**Q17. Why should application users not be superusers?**

Superuser privileges create unnecessary security and operational risk.

**Q18. How do you optimize a slow SQL query?**

Understand the requirement, inspect the execution plan, examine row estimates and actual work, evaluate indexes and query structure, then benchmark the change.

---

## Key Takeaways

- Use parameterized queries to prevent SQL injection.
- Retrieve only the columns required.
- Design indexes around actual query patterns.
- Avoid N+1 queries and unnecessary database round trips.
- Use pagination for large result sets.
- Prefer keyset pagination for deep sequential browsing.
- Use transactions for related database operations.
- Keep transactions short.
- Use constraints to protect data integrity.
- Use atomic updates for concurrent business operations.
- Inspect execution plans instead of guessing.
- Use connection pooling in backend applications.
- Handle database errors using SQLSTATE codes.
- Make critical retryable operations idempotent.
- Apply least-privilege database permissions.
- Monitor production query performance continuously.
