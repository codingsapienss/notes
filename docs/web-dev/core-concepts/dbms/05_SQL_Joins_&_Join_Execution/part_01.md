---
sidebar_label: Why Joins Exist
sidebar_position: 1
---

# Why Joins Exist

## 1. Introduction to SQL Joins

In relational databases, data is usually organized into multiple tables.

For example, an e-commerce application might have:

- `customers` — customer information.
- `orders` — customer orders.
- `products` — product information.
- `order_items` — products included in each order.
- `payments` — payment information.

Why don't we store everything in one table?

Because storing unrelated and repeatedly used information together can create data redundancy, update anomalies, and maintenance problems.

Instead, we organize data into separate tables and connect them using relationships.

But this creates another requirement:

**How do we retrieve related information from multiple tables in a single query?**

This is where SQL JOINs are used.

### Definition

A JOIN combines rows from two or more tables based on a related column or join condition.

For example, suppose we have two tables.

**Customers**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Amit  |
|   3 | Priya |

**Orders**

|  id | customer_id | total |
| --: | ----------: | ----: |
| 101 |           1 |  5000 |
| 102 |           1 |  2000 |
| 103 |           2 |  3000 |

We want to retrieve customer names along with their orders.

Without JOINs, we would need multiple queries and application-side processing.

With JOIN:

```sql
SELECT
    customers.name,
    orders.id AS order_id,
    orders.total
FROM customers
JOIN orders
    ON customers.id = orders.customer_id;
```

Result:

| name  | order_id | total |
| ----- | -------: | ----: |
| Rahul |      101 |  5000 |
| Rahul |      102 |  2000 |
| Amit  |      103 |  3000 |

The database combines related records using the specified condition.

---

## 2. Why Do We Need JOINs?

There are several reasons.

### 2.1 Data Is Stored in Separate Tables

Consider a normalized database.

**Users**

|  id | name  | email           |
| --: | ----- | --------------- |
|   1 | Rahul | rahul@gmail.com |
|   2 | Amit  | amit@gmail.com  |

**Orders**

|  id | user_id | total |
| --: | ------: | ----: |
| 101 |       1 |  5000 |
| 102 |       1 |  2000 |
| 103 |       2 |  3000 |

Suppose we want:

```text
Customer Name | Order ID | Total
```

The customer name is in `users`.

The order ID and total are in `orders`.

Neither table contains all the required information.

A JOIN retrieves the related information together.

### 2.2 Avoid Data Duplication

Imagine storing everything in one table:

| order_id | user_name | user_email      | total |
| -------: | --------- | --------------- | ----: |
|      101 | Rahul     | rahul@gmail.com |  5000 |
|      102 | Rahul     | rahul@gmail.com |  2000 |
|      103 | Amit      | amit@gmail.com  |  3000 |

Rahul's information is repeated.

If Rahul changes his email, multiple records may need updating.

Instead, we store user information once and reference it through `user_id`.

JOINs allow us to retrieve the information whenever required.

### 2.3 Retrieve Related Information in One Query

Without a JOIN, the application might execute:

```sql
SELECT *
FROM users
WHERE id = 1;
```

Then:

```sql
SELECT *
FROM orders
WHERE user_id = 1;
```

The application combines the results.

With a JOIN:

```sql
SELECT
    u.name,
    o.id,
    o.total
FROM users u
JOIN orders o
    ON u.id = o.user_id
WHERE u.id = 1;
```

The database performs the relational operation and returns the combined result.

Benefits:

- Fewer database round trips.
- Less application-side data matching.
- Centralized query execution.
- Easier filtering, sorting, and aggregation across related tables.

However, a JOIN is not automatically faster than multiple queries in every situation. Query plans, result sizes, network costs, and application requirements matter.

---

## 3. Understanding Primary Keys and Foreign Keys in JOINs

JOINs commonly use primary-key and foreign-key relationships.

Consider:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    total NUMERIC(10, 2)
);
```

Here:

- `users.id` is the primary key.
- `orders.id` is the primary key.
- `orders.user_id` is a foreign key referencing `users.id`.

Relationship:

```text
Users
-----
id (PK)
name

       1
       |
       |
       | 1:N
       |
       N

Orders
------
id (PK)
user_id (FK)
total
```

One user can have multiple orders.

Each order references one user, assuming `user_id` is non-NULL and the foreign key is enforced.

### 3.1 JOIN Condition

```sql
SELECT *
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

The condition:

```sql
ON u.id = o.user_id
```

tells the database how rows from the two tables are related.

The database compares the values and combines matching rows.

### 3.2 Does JOIN Require a Foreign Key?

No.

A JOIN only requires a valid join condition.

For example:

```sql
SELECT *
FROM users u
JOIN orders o
    ON u.email = o.customer_email;
```

This query can execute even if no foreign-key constraint exists.

However, a foreign key is useful for enforcing referential integrity.

**Important distinction:**

- JOIN is a query operation.
- Foreign key is a database constraint.
- Primary key identifies a row.
- JOIN condition defines how rows are matched.

They are related concepts, but they are not interchangeable.

---

## 4. How JOIN Works Conceptually

Suppose we have:

**Users**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Amit  |
|   3 | Priya |

**Orders**

|  id | user_id | total |
| --: | ------: | ----: |
| 101 |       1 |  5000 |
| 102 |       1 |  2000 |
| 103 |       2 |  3000 |

Query:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.total
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

Conceptually, the database evaluates combinations of rows and keeps the pairs satisfying the join condition.

Matching pairs:

```text
Users                 Orders

Rahul (id=1)  ------>  Order 101 (user_id=1)
Rahul (id=1)  ------>  Order 102 (user_id=1)
Amit  (id=2)  ------>  Order 103 (user_id=2)
Priya (id=3)  ------>  No matching order
```

The result:

| name  | order_id | total |
| ----- | -------: | ----: |
| Rahul |      101 |  5000 |
| Rahul |      102 |  2000 |
| Amit  |      103 |  3000 |

Priya does not appear because the query uses an INNER JOIN, which returns only matching pairs.

We will study the different JOIN types in Part 5B.

---

## 5. A JOIN Can Return More Rows Than Either Table

This is a critical concept.

Suppose:

**Users**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Amit  |

**Orders**

|  id | user_id | total |
| --: | ------: | ----: |
| 101 |       1 |  5000 |
| 102 |       1 |  2000 |
| 103 |       1 |  3000 |
| 104 |       2 |  4000 |

Query:

```sql
SELECT
    u.name,
    o.id
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

Result:

| name  | order_id |
| ----- | -------: |
| Rahul |      101 |
| Rahul |      102 |
| Rahul |      103 |
| Amit  |      104 |

There are:

- 2 users.
- 4 orders.
- 4 resulting rows.

Why?

Rahul has three matching orders, so Rahul appears three times.

This is expected behavior.

### Important rule

A JOIN does not necessarily return one row per record in the first table.

The number of rows depends on how many matching records exist in the other table.

For a one-to-many relationship, one row from the parent table can match multiple rows from the child table.

---

## 6. JOIN vs Multiple Database Queries

Let's compare two approaches in a Node.js backend.

### Approach A: Multiple Queries

```javascript
const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [1]);

const ordersResult = await pool.query(
  "SELECT * FROM orders WHERE user_id = $1",
  [1],
);

const response = {
  user: userResult.rows[0],
  orders: ordersResult.rows,
};
```

This performs two database queries.

### Approach B: JOIN

```javascript
const result = await pool.query(
  `
    SELECT
        u.id AS user_id,
        u.name,
        u.email,
        o.id AS order_id,
        o.total
    FROM users u
    LEFT JOIN orders o
        ON u.id = o.user_id
    WHERE u.id = $1
    `,
  [1],
);
```

This retrieves the combined information through one SQL statement.

The application receives a flattened result, which may need to be grouped into a nested response.

Example API response:

```json
{
  "user": {
    "id": 1,
    "name": "Rahul",
    "email": "rahul@gmail.com"
  },
  "orders": [
    {
      "id": 101,
      "total": 5000
    },
    {
      "id": 102,
      "total": 2000
    }
  ]
}
```

### Comparison

| Feature                     | Multiple queries            | JOIN                 |
| --------------------------- | --------------------------- | -------------------- |
| Database round trips        | Multiple                    | Usually one          |
| Application-side processing | Often more                  | Can be less          |
| Query complexity            | May be simpler individually | Can become complex   |
| Data matching               | Application may perform it  | Database performs it |
| Network overhead            | Can be higher               | Often lower          |
| Best choice                 | Depends on workload         | Depends on workload  |

### Important: N+1 Query Problem

A common backend mistake is fetching a list of users and then executing a separate order query for every user.

Example:

```javascript
const users = await pool.query("SELECT * FROM users");

for (const user of users.rows) {
  const orders = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
    user.id,
  ]);

  user.orders = orders.rows;
}
```

If there are 100 users:

- 1 query retrieves users.
- 100 queries retrieve their orders.
- Total: 101 queries.

This is called the N+1 query problem.

A JOIN or batched query can often reduce the number of database round trips.

---

## 7. JOINs and Database Normalization

JOINs are closely related to normalization.

Normalization separates independent entities into different tables.

JOINs allow us to retrieve related information across those tables.

Consider:

```text
Customers
   |
   v
Orders
   |
   v
Order Items
   |
   v
Products
```

Suppose we want a customer's order history with product names.

```sql
SELECT
    c.name AS customer_name,
    o.id AS order_id,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price
FROM customers c
JOIN orders o
    ON o.customer_id = c.id
JOIN order_items oi
    ON oi.order_id = o.id
JOIN products p
    ON p.id = oi.product_id
WHERE c.id = 1;
```

The query combines four tables.

The database returns the information in one result set.

This is a major advantage of relational databases: data can be stored separately while still being queried together.

---

## 8. JOINs Are Not the Same as UNION

These two SQL operations are often confused.

### JOIN

JOIN combines columns from related rows in multiple tables.

Example:

```sql
SELECT
    u.name,
    o.total
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

Result:

| name  | total |
| ----- | ----: |
| Rahul |  5000 |
| Rahul |  2000 |
| Amit  |  3000 |

### UNION

UNION combines the results of multiple SELECT statements vertically.

Example:

```sql
SELECT name AS person_name
FROM customers

UNION

SELECT name AS person_name
FROM employees;
```

Result:

| person_name |
| ----------- |
| Rahul       |
| Amit        |
| Priya       |

UNION removes duplicate result rows.

`UNION ALL` retains duplicates.

### Comparison

| Feature                        | JOIN                      | UNION                       |
| ------------------------------ | ------------------------- | --------------------------- |
| Operation                      | Horizontal combination    | Vertical combination        |
| Combines                       | Columns from related rows | Rows from query results     |
| Requires matching column count | No                        | Yes                         |
| Uses join condition            | Usually yes               | No                          |
| Typical use                    | Retrieve related data     | Combine similar result sets |

---

## 9. JOINs vs Subqueries

Sometimes a JOIN and a subquery can solve the same problem.

Example: Find customers who have placed at least one order.

### Using JOIN

```sql
SELECT DISTINCT
    u.id,
    u.name
FROM users u
JOIN orders o
    ON o.user_id = u.id;
```

### Using EXISTS

```sql
SELECT
    u.id,
    u.name
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

Both can return customers with at least one order.

However, they express different logical operations:

- JOIN combines matching rows.
- EXISTS checks whether at least one matching row exists.

The optimizer may produce similar plans for some queries, but you should choose the expression that best represents the requirement.

In particular, EXISTS avoids producing duplicate customer rows when multiple orders match.

---

## 10. When Should You Use JOINs?

Use JOINs when you need related information from multiple tables.

Examples:

| Requirement                 | Tables                            |
| --------------------------- | --------------------------------- |
| Display customer orders     | Customers + Orders                |
| Display order products      | Orders + Order Items + Products   |
| Display employee department | Employees + Departments           |
| Display student courses     | Students + Enrollments + Courses  |
| Display payment information | Orders + Payments                 |
| Display warehouse stock     | Products + Inventory + Warehouses |

### When might you avoid a JOIN?

Not every query needs a JOIN.

Examples:

**1. When all required data exists in one table**

```sql
SELECT *
FROM products
WHERE id = 501;
```

**2. When checking whether related data exists**

```sql
SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

**3. When a precomputed reporting structure is appropriate**

A materialized view or reporting table may be suitable for a frequently executed, expensive reporting query.

However, this introduces data freshness and maintenance considerations.

---

## 11. Common JOIN Mistakes

### Mistake 1: Joining on the Wrong Column

Incorrect:

```sql
SELECT *
FROM users u
JOIN orders o
    ON u.id = o.id;
```

This matches unrelated identifiers.

Correct:

```sql
SELECT *
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

Always understand the relationship between the tables.

### Mistake 2: Forgetting the JOIN Condition

```sql
SELECT *
FROM users
CROSS JOIN orders;
```

This intentionally produces every possible combination of users and orders.

If there are 10 users and 100 orders, the result contains 1,000 rows.

Accidentally writing a query without the intended join condition can create a very large result set.

### Mistake 3: Assuming JOIN Returns One Row Per Parent

If one user has five orders, a one-to-many JOIN can return five rows for that user.

This is expected behavior.

### Mistake 4: Using DISTINCT to Hide Incorrect JOIN Logic

Developers sometimes add:

```sql
SELECT DISTINCT ...
```

to remove duplicate-looking rows.

But duplicates may be caused by an incorrect relationship or an unintended one-to-many join.

Understand the cardinality before using DISTINCT.

### Mistake 5: Ignoring NULL Values

SQL comparisons involving NULL do not behave like ordinary equality comparisons.

For example:

```sql
ON u.id = o.user_id
```

does not match a NULL `user_id` to any user ID.

NULL handling becomes particularly important with OUTER JOINs.

### Mistake 6: Retrieving Unnecessary Columns

Avoid:

```sql
SELECT *
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

when the application needs only a few fields.

Prefer:

```sql
SELECT
    u.name,
    o.id,
    o.total
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

This reduces unnecessary data transfer and can simplify result handling.

---

## 12. Practical Lab

Let's build a small relational database and practice JOINs.

### Step 1: Create tables

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total NUMERIC(10, 2) NOT NULL
);
```

### Step 2: Insert users

```sql
INSERT INTO users (name, email)
VALUES
('Rahul', 'rahul@gmail.com'),
('Amit', 'amit@gmail.com'),
('Priya', 'priya@gmail.com');
```

### Step 3: Insert orders

```sql
INSERT INTO orders (user_id, total)
VALUES
(1, 5000),
(1, 2000),
(2, 3000);
```

### Step 4: Retrieve users and their orders

```sql
SELECT
    u.id AS user_id,
    u.name,
    o.id AS order_id,
    o.total
FROM users u
INNER JOIN orders o
    ON u.id = o.user_id;
```

Expected result:

| user_id | name  | order_id | total |
| ------: | ----- | -------: | ----: |
|       1 | Rahul |        1 |  5000 |
|       1 | Rahul |        2 |  2000 |
|       2 | Amit  |        3 |  3000 |

### Step 5: Find users with orders

```sql
SELECT DISTINCT
    u.id,
    u.name
FROM users u
JOIN orders o
    ON u.id = o.user_id;
```

### Step 6: Find users without orders

```sql
SELECT
    u.id,
    u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

Expected result:

|  id | name  |
| --: | ----- |
|   3 | Priya |

### Step 7: Calculate total spending per user

```sql
SELECT
    u.id,
    u.name,
    SUM(o.total) AS total_spending
FROM users u
JOIN orders o
    ON u.id = o.user_id
GROUP BY
    u.id,
    u.name;
```

Expected result:

|  id | name  | total_spending |
| --: | ----- | -------------: |
|   1 | Rahul |           7000 |
|   2 | Amit  |           3000 |

---

## 13. Important Interview Questions

### Q1. What is a JOIN?

A JOIN combines rows from two or more tables based on a related column or join condition.

### Q2. Why do relational databases need JOINs?

Because normalized databases store related information in separate tables. JOINs allow us to retrieve that information together.

### Q3. Does a JOIN require a foreign key?

No. A JOIN requires a valid join condition. A foreign key is an optional schema constraint used to enforce referential integrity.

### Q4. Can a JOIN return more rows than the first table?

Yes. In a one-to-many relationship, one row from the first table can match multiple rows in the second table.

### Q5. What is the difference between JOIN and UNION?

JOIN combines columns from related rows. UNION combines rows from compatible query results.

### Q6. What is the N+1 query problem?

It occurs when an application retrieves a collection using one query and then executes an additional query for each collection item.

### Q7. Can we retrieve data from three or more tables using JOINs?

Yes. Multiple JOIN operations can be used in one SQL query.

### Q8. What is the difference between JOIN and EXISTS?

JOIN combines matching rows. EXISTS checks whether at least one matching row exists.

### Q9. Does using JOIN always improve performance compared with multiple queries?

No. It often reduces round trips and application-side matching, but actual performance depends on the query plan, result size, network costs, and workload.

### Q10. What happens when a JOIN condition matches multiple rows?

The result contains a row for every matching combination.

### Q11. Can we JOIN tables without a foreign-key relationship?

Yes. SQL JOINs are based on conditions, not necessarily foreign-key constraints.

### Q12. Why should we avoid SELECT \* in large JOIN queries?

It retrieves unnecessary columns, increases data transfer, and can make result handling more complicated.

---

## 14. Chapter Summary

| Concept          | Key takeaway                                              |
| ---------------- | --------------------------------------------------------- |
| JOIN             | Combines related rows from multiple tables                |
| Purpose          | Retrieve information stored in separate relational tables |
| Primary key      | Uniquely identifies a record                              |
| Foreign key      | Enforces a relationship between tables                    |
| JOIN condition   | Defines how records are matched                           |
| One-to-many JOIN | Can return multiple rows for one parent                   |
| N+1 problem      | Excessive database queries caused by per-record fetching  |
| JOIN vs UNION    | Horizontal combination vs vertical combination            |
| JOIN vs EXISTS   | Combine rows vs check for existence                       |
| Normalization    | Organizes data into separate logical tables               |
| Denormalization  | May reduce JOIN requirements for selected workloads       |

### Final mental model

Relational databases separate data into logical tables to reduce unnecessary duplication and maintain data integrity.

JOINs make this separation practical by allowing the database to reconstruct related information when required.

Remember:

- Normalization decides how data should be organized.
- Primary keys identify records.
- Foreign keys maintain relationships.
- JOINs retrieve related records.
- The query optimizer decides how those JOINs are executed.
