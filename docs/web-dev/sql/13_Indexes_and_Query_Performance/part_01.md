---
sidebar_label: "Index Fundamentals"
sidebar_position: 1
---

# Index Fundamentals

## 1. Introduction

An index is a database object that helps PostgreSQL locate rows faster without scanning the entire table.

Think of an index like the index at the back of a book.

- Without an index, you may need to scan every page to find a topic.
- With an index, you can locate the relevant page directly.

Database indexes serve a similar purpose.

### Without an index

```sql
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

PostgreSQL may perform a **Sequential Scan**, checking rows one by one.

### With an index

```sql
CREATE INDEX idx_customers_email
ON customers(email);
```

PostgreSQL can potentially use the index to locate matching rows without scanning the entire table.

**Important:** Creating an index does not guarantee PostgreSQL will use it. The query planner chooses the execution plan based on estimated costs.

---

## 2. Why Do We Need Indexes?

Consider a table containing 1 million customers.

```sql
SELECT *
FROM customers
WHERE customer_id = 50000;
```

Without a suitable index, PostgreSQL may examine a large number of rows.

With an index on `customer_id`, PostgreSQL can efficiently locate the matching row.

Indexes are particularly useful for:

- WHERE conditions.
- JOIN conditions.
- ORDER BY operations.
- GROUP BY operations in suitable cases.
- Enforcing UNIQUE constraints.
- Finding rows using range conditions.

### Example: Frequently searched email

```sql
SELECT *
FROM customers
WHERE email = 'prashant@example.com';
```

An index on `email` can improve this lookup when the table and query characteristics make index access beneficial.

---

## 3. How Does an Index Work?

PostgreSQL's default index type is **B-tree**.

A B-tree index maintains an ordered search structure that allows PostgreSQL to locate values efficiently.

Conceptual example:

Suppose customer IDs are:

```text
10, 20, 30, 40, 50, 60, 70
```

An index organizes search keys in an ordered structure.

Searching for `50` does not require checking every table row sequentially. PostgreSQL traverses the index structure to locate the relevant entry and then accesses the corresponding table row when necessary.

### Typical B-tree complexity

| Operation    | Typical complexity       |
| ------------ | ------------------------ |
| Search       | O(log n)                 |
| Insert       | O(log n)                 |
| Delete       | O(log n)                 |
| Range search | O(log n + matching rows) |

These are simplified complexity descriptions, not guarantees of actual query execution time.

**Important:** An index is not a separate copy of the entire table. It stores indexed values and references that help PostgreSQL locate table rows.

---

## 4. Create an Index

Syntax:

```sql
CREATE INDEX index_name
ON table_name(column_name);
```

### Example: Index on customer email

```sql
CREATE INDEX idx_customers_email
ON customers(email);
```

### Example: Index on employee salary

```sql
CREATE INDEX idx_employees_salary
ON employees(salary);
```

### Example: Index on product price

```sql
CREATE INDEX idx_products_price
ON products(price);
```

### Naming convention

A practical naming convention:

```text
idx_<table_name>_<column_name>
```

Examples:

```text
idx_customers_email
idx_orders_customer_id
idx_products_price
idx_employees_department_id
```

Consistent names make index management easier.

---

## 5. Querying an Indexed Column

After creating an index:

```sql
CREATE INDEX idx_customers_email
ON customers(email);
```

You can execute:

```sql
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

PostgreSQL may choose an index-based execution plan.

You do not need to explicitly tell PostgreSQL to use the index.

The query planner evaluates available execution strategies automatically.

### Important

This query can use the email index:

```sql
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

But the following query may not use a normal B-tree index on email efficiently:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@example.com';
```

The expression `LOWER(email)` differs from the indexed column expression.

A suitable expression index can solve this:

```sql
CREATE INDEX idx_customers_lower_email
ON customers(LOWER(email));
```

Now PostgreSQL can potentially use the index for:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@example.com';
```

Expression indexes are covered in more detail in Part 13C.

---

## 6. Indexes and WHERE Conditions

Indexes can help with equality and range conditions.

### Equality condition

```sql
SELECT *
FROM products
WHERE product_id = 101;
```

A primary key index can support this lookup.

### Greater than / less than

```sql
SELECT *
FROM products
WHERE price > 1000;
```

An index on price may help.

### BETWEEN

```sql
SELECT *
FROM products
WHERE price BETWEEN 500 AND 2000;
```

A B-tree index can support range lookups.

### IN

```sql
SELECT *
FROM employees
WHERE department_id IN (1, 2, 3);
```

An index on department_id may help.

### LIKE

A normal B-tree index may support suitable prefix searches:

```sql
SELECT *
FROM customers
WHERE email LIKE 'rahul%';
```

However, a leading wildcard generally prevents an ordinary B-tree index from supporting this search efficiently:

```sql
SELECT *
FROM customers
WHERE email LIKE '%gmail.com';
```

PostgreSQL has specialized indexing options for pattern searches, covered in Part 13B and 13C.

---

## 7. Indexes and JOIN Operations

Indexes can improve queries that match rows using join columns.

### Example

```sql
SELECT
    o.order_id,
    o.customer_id,
    c.customer_name,
    o.total_amount

FROM orders o

JOIN customers c
    ON o.customer_id = c.customer_id;
```

Useful indexes may include:

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

The customers table already has a primary key index on `customer_id`.

**Important:** PostgreSQL automatically creates an index for a primary key and a unique constraint. It does not automatically create an index on the referencing side of a foreign key.

For example, declaring:

```sql
FOREIGN KEY (customer_id)
REFERENCES customers(customer_id)
```

does not automatically create an index on `orders.customer_id`.

You may need to create one based on your workload.

---

## 8. Indexes and ORDER BY

An index can sometimes help PostgreSQL retrieve rows in the required order without an additional sort.

### Example

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at);
```

Query:

```sql
SELECT *
FROM orders
ORDER BY created_at DESC;
```

PostgreSQL may use the index to retrieve rows in the required order.

B-tree indexes can be scanned in either direction.

### Important

An index does not guarantee that sorting will be avoided.

For example:

```sql
SELECT *
FROM orders
ORDER BY total_amount DESC;
```

An index on `created_at` does not directly support ordering by `total_amount`.

A suitable index would be:

```sql
CREATE INDEX idx_orders_total_amount
ON orders(total_amount DESC);
```

Whether PostgreSQL uses it depends on the query and estimated costs.

---

## 9. Unique Indexes

A unique index prevents duplicate indexed values.

### Example

```sql
CREATE UNIQUE INDEX idx_customers_email_unique
ON customers(email);
```

Now PostgreSQL rejects duplicate non-NULL email values.

### Example

```sql
INSERT INTO customers(customer_name, email)
VALUES ('Rahul', 'rahul@example.com');
```

A second row with the same email will violate the unique index.

### Important: UNIQUE constraint vs UNIQUE index

You can also enforce uniqueness through a constraint:

```sql
ALTER TABLE customers
ADD CONSTRAINT customers_email_unique
UNIQUE(email);
```

PostgreSQL creates a unique B-tree index to enforce this constraint.

Use a UNIQUE constraint when uniqueness is a business rule.

Use a standalone unique index when you specifically need index-level behavior, such as certain partial or expression indexes.

---

## 10. Primary Keys and Indexes

When you define a primary key:

```sql
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL
);
```

PostgreSQL automatically creates a unique B-tree index to enforce the primary key.

You do not need to create another index on `department_id` just for ordinary primary key lookups.

### Verify

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'departments';
```

This displays indexes defined on the table.

**Important:** A primary key index and a foreign key index serve different purposes.

- Primary key index: Supports uniqueness and lookups on the referenced key.
- Foreign key column index: Can improve lookups and operations involving referencing rows.

---

## 11. Drop an Index

Syntax:

```sql
DROP INDEX index_name;
```

Example:

```sql
DROP INDEX idx_customers_email;
```

To avoid an error if the index does not exist:

```sql
DROP INDEX IF EXISTS idx_customers_email;
```

### Important

Dropping an index used by a UNIQUE or PRIMARY KEY constraint is not the same as dropping an ordinary standalone index.

PostgreSQL generally requires you to remove the owning constraint instead.

For example:

```sql
ALTER TABLE customers
DROP CONSTRAINT customers_email_unique;
```

This removes the constraint and its associated index.

---

## 12. View Existing Indexes

### Using pg_indexes

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

### View indexes for one table

```sql
SELECT
    indexname,
    indexdef

FROM pg_indexes

WHERE tablename = 'orders';
```

### Using psql

```sql
\di
```

To list indexes in the current schema.

```sql
\d orders
```

To inspect a table's columns, constraints and indexes.

These commands are PostgreSQL client commands, not ordinary SQL statements.

---

## 13. Indexes Have Costs

Indexes improve some read operations, but they are not free.

Every index consumes storage and adds maintenance work.

### Disadvantages

1. **Storage overhead:** Indexes occupy additional disk space.
2. **INSERT overhead:** PostgreSQL must maintain relevant indexes when inserting rows.
3. **UPDATE overhead:** Updating indexed columns may require index changes.
4. **DELETE overhead:** Deleted rows and index entries require maintenance and cleanup.
5. **Maintenance:** Indexes can become bloated and may need maintenance.
6. **Planning complexity:** More indexes can increase the number of possible plans the planner evaluates.

### Example

Suppose you create ten indexes on a frequently updated table.

Every insert may need to maintain all ten indexes.

This can increase write latency and storage consumption.

**Rule:** Do not create indexes on every column automatically. Create indexes based on actual query patterns and workload measurements.

---

## 14. When Should You Create an Index?

Consider an index when:

- A column is frequently used in selective WHERE conditions.
- A column is frequently used in JOIN conditions.
- Queries repeatedly sort by a particular column.
- A composite query pattern benefits from a multi-column index.
- A uniqueness rule must be enforced.
- Query execution plans show expensive scans or sorting that an index could improve.

### When an index may not help much

- The table is very small.
- A query returns a large percentage of the table.
- The indexed column has very low selectivity.
- The query applies an unsupported expression to the indexed column.
- The query uses a leading-wildcard LIKE pattern with an ordinary B-tree index.
- The planner estimates a sequential scan to be cheaper.

---

## 15. Index Selectivity

Selectivity describes how effectively a condition narrows down the matching rows.

Consider a table with 1 million employees.

### High-selectivity column

```sql
SELECT *
FROM employees
WHERE employee_id = 1001;
```

A unique employee ID generally identifies at most one row.

This is highly selective.

### Low-selectivity column

```sql
SELECT *
FROM employees
WHERE status = 'active';
```

If 95% of employees are active, the condition matches most rows.

A normal index may not provide much benefit because PostgreSQL may need to retrieve a large portion of the table.

### Comparison

| Column / condition | Typical selectivity     |
| ------------------ | ----------------------- |
| Unique employee_id | High                    |
| Unique email       | High                    |
| department_id      | Depends on distribution |
| status             | Often low               |
| Boolean is_active  | Often low               |

Selectivity alone does not determine index usefulness. Table size, data distribution, query shape and the cost of accessing table rows also matter.

---

## 16. Verify Index Usage with EXPLAIN

Use EXPLAIN to inspect PostgreSQL's planned execution strategy.

### Example

```sql
EXPLAIN
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

Possible plan:

```text
Index Scan using idx_customers_email
on customers
```

This indicates that PostgreSQL plans to use the index.

### Another possible plan

```text
Seq Scan on customers
```

This means PostgreSQL plans to scan the table sequentially.

That is not necessarily a problem.

For a small table or a query returning most rows, a sequential scan can be faster.

### Use EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT *
FROM customers
WHERE email = 'rahul@example.com';
```

`EXPLAIN ANALYZE` executes the query and reports actual execution details.

It helps compare:

- Estimated rows.
- Actual rows.
- Planning time.
- Execution time.
- Scan methods.
- Index usage.

**Warning:** EXPLAIN ANALYZE actually executes the statement. Be cautious with INSERT, UPDATE and DELETE statements. Use a transaction and roll it back when appropriate.

---

## 17. Practical Example — Indexing TechBazaar

Suppose your application frequently executes these queries:

### Query 1: Find orders for a customer

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

### Query 2: Find products within a price range

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

Potential index:

```sql
CREATE INDEX idx_products_price
ON products(price);
```

### Query 3: Find employees in a department

```sql
SELECT *
FROM employees
WHERE department_id = 2;
```

Potential index:

```sql
CREATE INDEX idx_employees_department_id
ON employees(department_id);
```

### Query 4: Find recent orders

```sql
SELECT *
FROM orders
ORDER BY created_at DESC
LIMIT 20;
```

Potential index:

```sql
CREATE INDEX idx_orders_created_at
ON orders(created_at DESC);
```

These are candidate indexes, not automatic recommendations to create all of them. Validate their usefulness against real queries and data.

---

## 18. Common Mistakes

| Mistake                                                     | Correct understanding                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| Assuming every index is always used                         | PostgreSQL chooses the execution plan                         |
| Indexing every column                                       | Indexes consume storage and slow down writes                  |
| Assuming foreign keys automatically create indexes          | PostgreSQL does not automatically index referencing columns   |
| Creating another index on a primary key                     | The primary key already has an index                          |
| Assuming an index guarantees fast queries                   | Query selectivity and execution strategy matter               |
| Assuming low-selectivity columns never benefit from indexes | Workload and query shape still matter                         |
| Assuming ORDER BY always uses an index                      | The planner may choose an explicit sort                       |
| Forgetting expression differences                           | An index on a column may not support a transformed expression |
| Using EXPLAIN ANALYZE without considering side effects      | It executes the statement                                     |

---

## 19. Practice Exercises

Use the TechBazaar database.

1. Create an index on `customers.email`.
2. Create an index on `orders.customer_id`.
3. Create an index on `products.price`.
4. Create an index on `employees.department_id`.
5. Create an index on `orders.created_at`.
6. Run EXPLAIN on a customer email lookup.
7. Run EXPLAIN ANALYZE on an order lookup by customer ID.
8. Compare query plans before and after creating an index.
9. List all indexes on the orders table.
10. Drop an ordinary index using DROP INDEX.
11. Create a unique index on a column that contains no duplicate non-NULL values.
12. Explain why a primary key already has an index.
13. Explain why a foreign key does not automatically create an index on the referencing column.
14. Compare the likely usefulness of indexes on employee_id and status.
15. Explain why an index might not be used for a query returning most table rows.
16. Identify which columns in the TechBazaar schema are already indexed because of primary key or unique constraints.

---

## 20. Interview Questions

**Q1. What is a database index?**

A data structure that helps PostgreSQL locate rows more efficiently without necessarily scanning the entire table.

**Q2. What is the default PostgreSQL index type?**

B-tree.

**Q3. What is the main advantage of an index?**

It can reduce the amount of work needed for suitable read queries.

**Q4. What are the disadvantages of indexes?**

Additional storage, write overhead and maintenance costs.

**Q5. Does PostgreSQL automatically create indexes for primary keys?**

Yes. A primary key creates a unique B-tree index by default.

**Q6. Does PostgreSQL automatically create indexes on foreign key columns?**

No. You may need to create them based on the workload.

**Q7. Can PostgreSQL ignore an existing index?**

Yes. The planner may choose a sequential scan or another plan if it estimates that to be cheaper.

**Q8. What is a unique index?**

An index that enforces uniqueness of indexed values.

**Q9. What is index selectivity?**

A measure of how effectively a condition narrows down the matching rows.

**Q10. Why can indexing a Boolean column be ineffective?**

If most rows have the same Boolean value, the index may not reduce the amount of data that needs to be retrieved enough to justify index access.

**Q11. How do you check whether PostgreSQL uses an index?**

Use EXPLAIN or EXPLAIN ANALYZE.

**Q12. What is the difference between EXPLAIN and EXPLAIN ANALYZE?**

EXPLAIN displays the planned execution strategy. EXPLAIN ANALYZE executes the query and reports actual execution statistics.

**Q13. Can an index improve ORDER BY?**

Yes. A suitable index may allow PostgreSQL to retrieve rows in the required order without an additional sort.

**Q14. Why should you avoid creating unnecessary indexes?**

They increase storage usage and write costs without necessarily improving query performance.

**Q15. Does creating an index guarantee faster query execution?**

No. The planner considers the full query, table size, selectivity, statistics and estimated costs.

---

## Key Takeaways

- An index helps PostgreSQL locate rows efficiently.
- B-tree is PostgreSQL's default index type.
- Indexes can help with WHERE, JOIN, ORDER BY and range conditions.
- Primary keys and UNIQUE constraints automatically create supporting unique indexes.
- Foreign key declarations do not automatically index referencing columns.
- Indexes improve suitable read operations but add storage and write overhead.
- Selectivity influences whether an index is useful.
- PostgreSQL chooses whether to use an available index.
- Use EXPLAIN and EXPLAIN ANALYZE to inspect execution plans.
- Do not index every column; create indexes based on actual workload requirements.
