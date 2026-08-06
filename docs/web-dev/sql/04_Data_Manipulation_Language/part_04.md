---
sidebar_label: "UPSERT and Conflict Handling"
sidebar_position: 1
---

# UPSERT and Conflict Handling

## 1. Introduction to UPSERT

UPSERT combines two operations:

- **INSERT:** Add a new record if it does not exist.
- **UPDATE:** Modify an existing record if a specified conflict occurs.

PostgreSQL supports UPSERT through:

```sql
INSERT INTO table_name (...)
VALUES (...)
ON CONFLICT (...)
DO UPDATE SET ...;
```

It is useful when:

- A customer may already exist.
- A product's SKU must remain unique.
- An API receives repeated requests to create or update records.
- An application synchronizes data from external systems.
- You want to avoid duplicate records.

**Important:** PostgreSQL UPSERT is based on unique or exclusion constraints/indexes. It is not a general-purpose mechanism that checks arbitrary conditions.

---

## 2. Understanding ON CONFLICT

Suppose we have a customers table:

```sql
CREATE TABLE customers (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    city VARCHAR(100)
);
```

Insert a customer:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Sharma', 'rahul@example.com', 'Noida');
```

Now try inserting the same email again:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Verma', 'rahul@example.com', 'Delhi');
```

PostgreSQL raises a unique constraint violation because `email` must be unique.

Instead of allowing the error, we can handle the conflict using `ON CONFLICT`.

---

## 3. ON CONFLICT DO NOTHING

`DO NOTHING` tells PostgreSQL to skip the conflicting insertion.

### Syntax

```sql
INSERT INTO table_name (column1, column2)
VALUES (value1, value2)
ON CONFLICT (column1)
DO NOTHING;
```

### Example

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Verma', 'rahul@example.com', 'Delhi')
ON CONFLICT (email)
DO NOTHING;
```

If the email already exists:

- No new row is inserted.
- The existing row remains unchanged.
- PostgreSQL does not raise a unique violation for this handled conflict.

If the email does not exist, the row is inserted.

### Multiple unique constraints

Suppose a table has multiple unique constraints. You can omit the conflict target:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Verma', 'rahul@example.com', 'Delhi')
ON CONFLICT DO NOTHING;
```

This handles conflicts against usable unique or exclusion constraints/indexes that can be inferred without a target.

**Best practice:** Specify the conflict target when you want to handle a particular uniqueness conflict rather than silently ignore other conflicts.

---

## 4. ON CONFLICT DO UPDATE

`DO UPDATE` performs an update when the specified unique conflict occurs.

### Syntax

```sql
INSERT INTO table_name (column1, column2)
VALUES (value1, value2)
ON CONFLICT (column1)
DO UPDATE SET
    column2 = EXCLUDED.column2;
```

### Example

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Verma', 'rahul@example.com', 'Delhi')
ON CONFLICT (email)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    city = EXCLUDED.city;
```

Behaviour:

| Situation            | Result                                        |
| -------------------- | --------------------------------------------- |
| Email does not exist | New customer is inserted                      |
| Email already exists | Existing customer's name and city are updated |

This is the standard PostgreSQL UPSERT pattern.

---

## 5. Understanding EXCLUDED

`EXCLUDED` is a special table reference available inside the `DO UPDATE` clause.

It represents the row that PostgreSQL attempted to insert but could not insert because of the conflict.

Example:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Verma', 'rahul@example.com', 'Delhi')
ON CONFLICT (email)
DO UPDATE SET
    city = EXCLUDED.city;
```

Suppose the existing record is:

| customer_name | email             | city  |
| ------------- | ----------------- | ----- |
| Rahul Sharma  | rahul@example.com | Noida |

The attempted insert contains:

| customer_name | email             | city  |
| ------------- | ----------------- | ----- |
| Rahul Verma   | rahul@example.com | Delhi |

`EXCLUDED.city` refers to `Delhi`, the incoming value.

After UPSERT:

| customer_name | email             | city  |
| ------------- | ----------------- | ----- |
| Rahul Sharma  | rahul@example.com | Delhi |

Only `city` changes because that is the only column included in the UPDATE clause.

### Existing table value vs EXCLUDED value

You can use both:

```sql
INSERT INTO products (product_name, sku, price)
VALUES ('Laptop', 'SKU-101', 55000)
ON CONFLICT (sku)
DO UPDATE SET
    price = products.price + EXCLUDED.price;
```

Here:

- `products.price` is the existing price.
- `EXCLUDED.price` is the incoming price.

This example adds the incoming price to the existing price. It is illustrative; a real pricing system would normally use a deliberate replacement or adjustment rule.

---

## 6. UPSERT with Multiple Columns

You can update multiple columns when a conflict occurs.

```sql
INSERT INTO customers (
    customer_name,
    email,
    city
)
VALUES (
    'Priya Singh',
    'priya@example.com',
    'Noida'
)
ON CONFLICT (email)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    city = EXCLUDED.city;
```

You can also update only selected columns:

```sql
INSERT INTO customers (
    customer_name,
    email,
    city
)
VALUES (
    'Priya Singh',
    'priya@example.com',
    'Noida'
)
ON CONFLICT (email)
DO UPDATE SET
    city = EXCLUDED.city;
```

The customer's name remains unchanged if a conflict occurs.

---

## 7. UPSERT with RETURNING

PostgreSQL supports `RETURNING` with UPSERT.

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Sharma', 'rahul@example.com', 'Noida')
ON CONFLICT (email)
DO UPDATE SET
    city = EXCLUDED.city
RETURNING *;
```

It returns the inserted or updated row.

You can also return selected columns:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Sharma', 'rahul@example.com', 'Noida')
ON CONFLICT (email)
DO UPDATE SET
    city = EXCLUDED.city
RETURNING customer_id, customer_name, email, city;
```

Useful in backend applications because you can retrieve the resulting record in one statement.

---

## 8. Conditional UPSERT with WHERE

You can add a `WHERE` condition to the `DO UPDATE` clause.

This determines whether the conflicting row should actually be updated.

### Example: Update only when the incoming price is higher

```sql
INSERT INTO products (product_name, sku, price)
VALUES ('Laptop', 'SKU-101', 60000)
ON CONFLICT (sku)
DO UPDATE SET
    price = EXCLUDED.price
WHERE EXCLUDED.price > products.price;
```

Behaviour:

| Existing price | Incoming price | Result            |
| -------------: | -------------: | ----------------- |
|         50,000 |         60,000 | Updated to 60,000 |
|         60,000 |         50,000 | No update         |
|         60,000 |         60,000 | No update         |

This is useful when incoming data should replace existing data only under specific conditions.

**Important:** If the conflict occurs but the `WHERE` condition is false, the existing row is locked but not updated. It is also not returned by `RETURNING`.

---

## 9. Choosing the Conflict Target

The conflict target identifies which uniqueness rule PostgreSQL should use to detect a conflict.

### Primary key conflict

```sql
INSERT INTO departments (department_id, department_name)
VALUES (1, 'Engineering')
ON CONFLICT (department_id)
DO UPDATE SET
    department_name = EXCLUDED.department_name;
```

### Unique column conflict

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Amit Sharma', 'amit@example.com', 'Delhi')
ON CONFLICT (email)
DO UPDATE SET
    city = EXCLUDED.city;
```

### Named constraint

You can reference a named constraint directly:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Amit Sharma', 'amit@example.com', 'Delhi')
ON CONFLICT ON CONSTRAINT customers_email_key
DO UPDATE SET
    city = EXCLUDED.city;
```

The constraint name must exist in your actual table definition.

### Composite unique constraint

Suppose a table has:

```sql
CREATE TABLE product_prices (
    product_id BIGINT,
    region VARCHAR(50),
    price NUMERIC(10, 2),
    UNIQUE (product_id, region)
);
```

The combination of `product_id` and `region` must be unique.

UPSERT:

```sql
INSERT INTO product_prices (product_id, region, price)
VALUES (10, 'North', 50000)
ON CONFLICT (product_id, region)
DO UPDATE SET
    price = EXCLUDED.price;
```

A conflict occurs when both values match an existing unique combination.

---

## 10. UPSERT with Partial Unique Indexes

PostgreSQL supports partial unique indexes, which enforce uniqueness only for rows matching a condition.

Example:

```sql
CREATE UNIQUE INDEX unique_active_customer_email
ON customers (email)
WHERE email IS NOT NULL;
```

An UPSERT can infer a suitable partial unique index using an index predicate:

```sql
INSERT INTO customers (customer_name, email, city)
VALUES ('Rahul Sharma', 'rahul@example.com', 'Noida')
ON CONFLICT (email) WHERE email IS NOT NULL
DO UPDATE SET
    city = EXCLUDED.city;
```

The conflict target must match an applicable unique index.

Partial unique indexes are useful when uniqueness should apply only to a subset of records.

---

## 11. UPSERT vs UPDATE vs INSERT

| Operation | Behaviour                                                                             |
| --------- | ------------------------------------------------------------------------------------- |
| INSERT    | Adds a new row; raises a uniqueness error if an unhandled conflict occurs             |
| UPDATE    | Modifies matching existing rows                                                       |
| UPSERT    | Inserts a row or handles a specified uniqueness conflict by updating or doing nothing |

### INSERT

```sql
INSERT INTO customers (customer_name, email)
VALUES ('Rahul', 'rahul@example.com');
```

### UPDATE

```sql
UPDATE customers
SET customer_name = 'Rahul Sharma'
WHERE email = 'rahul@example.com';
```

### UPSERT

```sql
INSERT INTO customers (customer_name, email)
VALUES ('Rahul Sharma', 'rahul@example.com')
ON CONFLICT (email)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name;
```

**Key distinction:** UPSERT does not mean "check whether a row exists using any condition." Its conflict handling is based on an applicable unique or exclusion constraint/index.

---

## 12. UPSERT with Multiple Rows

You can UPSERT multiple rows in one statement.

```sql
INSERT INTO products (product_name, sku, price)
VALUES
    ('Keyboard', 'SKU-101', 1000),
    ('Mouse', 'SKU-102', 500),
    ('Monitor', 'SKU-103', 12000)
ON CONFLICT (sku)
DO UPDATE SET
    price = EXCLUDED.price
RETURNING *;
```

For each incoming row:

- Insert it if its SKU does not conflict.
- Update the existing product's price if its SKU conflicts.

**Important:** PostgreSQL does not allow one `INSERT ... ON CONFLICT DO UPDATE` statement to affect the same existing row more than once. If the input contains duplicate conflict keys, the statement can fail with a cardinality violation.

Deduplicate incoming data before performing a multi-row UPSERT.

---

## 13. UPSERT and Concurrency

One important advantage of PostgreSQL UPSERT is its concurrency handling.

Consider two requests attempting to insert the same email simultaneously:

```sql
INSERT INTO customers (customer_name, email)
VALUES ('Rahul', 'rahul@example.com')
ON CONFLICT (email)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name;
```

PostgreSQL coordinates the conflicting operations using its unique-index and locking mechanisms.

Under normal operation, the statement provides an atomic insert-or-update outcome for the selected conflict target, even when concurrent transactions attempt the same unique key.

This is safer than implementing the following application-side logic:

1. SELECT to check whether the customer exists.
2. If it exists, UPDATE.
3. Otherwise, INSERT.

That pattern has a race condition: another transaction can insert the same email after the SELECT but before the INSERT.

**Better approach:** Use a single UPSERT statement.

---

## 14. UPSERT in Node.js with PostgreSQL

Use parameterized queries with the `pg` library.

### Example: Insert or update a customer

```javascript
const result = await pool.query(
  `INSERT INTO customers (customer_name, email, city)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET
         customer_name = EXCLUDED.customer_name,
         city = EXCLUDED.city
     RETURNING *`,
  ["Rahul Sharma", "rahul@example.com", "Noida"],
);

console.log(result.rows[0]);
```

### Example: Insert only if the customer does not exist

```javascript
const result = await pool.query(
  `INSERT INTO customers (customer_name, email, city)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO NOTHING
     RETURNING customer_id`,
  ["Rahul Sharma", "rahul@example.com", "Noida"],
);

if (result.rowCount === 0) {
  console.log("Customer already exists");
} else {
  console.log("Inserted customer ID:", result.rows[0].customer_id);
}
```

### Important

- `rowCount = 1`: A row was inserted or updated, or inserted without conflict.
- `rowCount = 0`: No row was inserted or updated, for example because `DO NOTHING` handled a conflict.
- Always use parameterized queries for user input.
- The conflict target must have a matching applicable unique constraint or index.

---

## 15. Common UPSERT Mistakes

| Mistake                                      | Explanation                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| Missing unique constraint                    | PostgreSQL has no applicable uniqueness rule for the conflict target      |
| Wrong conflict column                        | The specified target does not match an applicable unique constraint/index |
| Confusing EXCLUDED with existing data        | `EXCLUDED` represents the attempted incoming row                          |
| Updating every column unnecessarily          | Can overwrite valid existing data                                         |
| Duplicate conflict keys in one batch         | Can cause a cardinality violation                                         |
| Using UPSERT for arbitrary conditions        | UPSERT conflict handling is based on uniqueness/exclusion conflicts       |
| Ignoring concurrent updates                  | A successful UPSERT does not automatically enforce every business rule    |
| Assuming DO NOTHING returns the existing row | It returns no row for the skipped conflicting insertion                   |

---

## 16. Real-World Backend Scenarios

### Scenario 1: Customer registration

Prevent duplicate customer emails:

```sql
INSERT INTO customers (customer_name, email)
VALUES ('Rahul Sharma', 'rahul@example.com')
ON CONFLICT (email)
DO NOTHING;
```

### Scenario 2: Product synchronization

Update product information when the SKU already exists:

```sql
INSERT INTO products (product_name, sku, price)
VALUES ('Laptop', 'SKU-101', 55000)
ON CONFLICT (sku)
DO UPDATE SET
    product_name = EXCLUDED.product_name,
    price = EXCLUDED.price;
```

### Scenario 3: Daily analytics

Suppose you have a table:

```sql
CREATE TABLE daily_sales (
    sale_date DATE PRIMARY KEY,
    total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0
);
```

Add today's sales to the existing total, or create the record if it does not exist:

```sql
INSERT INTO daily_sales (sale_date, total_sales)
VALUES (CURRENT_DATE, 5000)
ON CONFLICT (sale_date)
DO UPDATE SET
    total_sales = daily_sales.total_sales + EXCLUDED.total_sales;
```

### Scenario 4: Update a user's latest score

Suppose a table stores the latest score for each user:

```sql
CREATE TABLE user_scores (
    user_id BIGINT PRIMARY KEY,
    score INTEGER NOT NULL
);
```

UPSERT:

```sql
INSERT INTO user_scores (user_id, score)
VALUES (101, 950)
ON CONFLICT (user_id)
DO UPDATE SET
    score = EXCLUDED.score
WHERE EXCLUDED.score > user_scores.score;
```

The score changes only when the incoming score is higher.

---

## 17. Practice Exercises

Use the TechBazaar database.

1. Insert a customer. If the email already exists, do nothing.
2. Insert a customer. If the email exists, update the customer's city.
3. UPSERT a product using its unique SKU.
4. Return the inserted or updated product using `RETURNING`.
5. UPSERT a product only if the incoming price is higher.
6. UPSERT multiple products in one statement.
7. Create a table with a composite unique constraint and UPSERT using both columns.
8. Implement an UPSERT query in Node.js using parameterized values.
9. Explain why SELECT-then-INSERT can cause a race condition.
10. Create a daily sales table and use UPSERT to accumulate sales totals.

---

## 18. Interview Questions

**Q1. What is UPSERT?**

An operation that inserts a new row or handles a uniqueness conflict by updating an existing row or doing nothing.

**Q2. How does PostgreSQL implement UPSERT?**

Using `INSERT ... ON CONFLICT`.

**Q3. What is the difference between DO NOTHING and DO UPDATE?**

- `DO NOTHING`: Skips the conflicting insertion.
- `DO UPDATE`: Updates the conflicting existing row.

**Q4. What is EXCLUDED in PostgreSQL?**

A special reference to the row that was proposed for insertion but encountered a conflict.

**Q5. Can UPSERT return records?**

Yes, using `RETURNING`.

**Q6. Does UPSERT require a unique constraint?**

The conflict target must be backed by an applicable unique constraint/index or exclusion constraint. `DO UPDATE` does not support exclusion constraints as arbiters.

**Q7. Can we UPSERT multiple rows at once?**

Yes, using multiple value groups in one INSERT statement.

**Q8. What happens if the same conflict key appears twice in one multi-row UPSERT?**

PostgreSQL can raise a cardinality violation because the same existing row cannot be affected twice by one `ON CONFLICT DO UPDATE` statement.

**Q9. Why is UPSERT safer than SELECT followed by INSERT?**

It handles the insert-or-update decision atomically with respect to the selected uniqueness conflict, avoiding the common race condition in application-side existence checks.

**Q10. Can we add a condition to DO UPDATE?**

Yes, using `WHERE` after the `SET` clause.

---

## Key Takeaways

- UPSERT means insert or handle an existing-row conflict.
- PostgreSQL uses `INSERT ... ON CONFLICT`.
- `DO NOTHING` skips conflicting insertions.
- `DO UPDATE` modifies the conflicting existing row.
- `EXCLUDED` refers to the incoming row.
- `RETURNING` retrieves the resulting inserted or updated record.
- Conflict targets rely on applicable unique constraints or indexes.
- Composite unique constraints can be used as conflict targets.
- UPSERT supports multiple rows in one statement.
- Duplicate conflict keys in one multi-row UPSERT can cause a cardinality violation.
- UPSERT is safer than application-side SELECT-then-INSERT logic for handling uniqueness races.
- Use parameterized queries in Node.js applications.
