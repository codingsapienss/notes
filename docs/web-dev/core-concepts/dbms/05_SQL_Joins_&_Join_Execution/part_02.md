---
sidebar_label: SQL Join Types
sidebar_position: 1
---

# SQL Join Types

---

## 1. Introduction

In last section, we established why JOINs exist: relational databases store related information in separate tables, and JOINs allow us to retrieve related information together.

In this chapter, we will study the different types of SQL JOINs, how they behave, when to use them, and how to write them in PostgreSQL.

Consider these two tables.

### Users

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Priya |
|   3 | Amit  |
|   4 | Neha  |

### Orders

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |    500 |
| 102 |       1 |    800 |
| 103 |       2 |    300 |
| 104 |       5 |    900 |

Notice:

- Rahul has two orders.
- Priya has one order.
- Amit and Neha have no orders.
- Order 104 references user ID 5, which does not exist in the users table.

We intentionally allow the unmatched order for this example. In a production database, a foreign key would normally prevent this inconsistency.

### Types of JOINs

| JOIN type       | What it returns                                   |
| --------------- | ------------------------------------------------- |
| INNER JOIN      | Only matching rows                                |
| LEFT JOIN       | All left-table rows and matching right-table rows |
| RIGHT JOIN      | All right-table rows and matching left-table rows |
| FULL OUTER JOIN | All rows from both tables                         |
| CROSS JOIN      | Every possible combination                        |
| SELF JOIN       | A table joined with itself                        |
| NATURAL JOIN    | Automatically joins identically named columns     |
| SEMI JOIN       | Left-side rows for which a match exists           |
| ANTI JOIN       | Left-side rows for which no match exists          |

---

## 2. INNER JOIN

### Definition

An INNER JOIN returns only those rows where the join condition matches in both tables.

If a user has no order, that user is excluded.

If an order has no matching user, that order is also excluded.

### Syntax

```sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.column = table2.column;
```

The `INNER` keyword is optional. These queries are equivalent:

```sql
SELECT *
FROM users
INNER JOIN orders
ON users.id = orders.user_id;
```

```sql
SELECT *
FROM users
JOIN orders
ON users.id = orders.user_id;
```

### Example

```sql
SELECT
    users.id,
    users.name,
    orders.id AS order_id,
    orders.amount
FROM users
INNER JOIN orders
ON users.id = orders.user_id;
```

### Result

|  id | name  | order_id | amount |
| --: | ----- | -------: | -----: |
|   1 | Rahul |      101 |    500 |
|   1 | Rahul |      102 |    800 |
|   2 | Priya |      103 |    300 |

Notice:

- Rahul appears twice because he has two matching orders.
- Priya appears once.
- Amit and Neha are excluded because they have no orders.
- Order 104 is excluded because user ID 5 has no matching user.

### Visual representation

```text
USERS                     ORDERS
+----+-------+            +-----+---------+
| 1  | Rahul | ---------> | 101 | 1       |
| 2  | Priya | ---------> | 103 | 2       |
| 3  | Amit  |            | 102 | 1       |
| 4  | Neha  |            | 104 | 5       |
+----+-------+            +-----+---------+

             INNER JOIN

+----+-------+----------+--------+
| id | name  | order_id | amount |
+----+-------+----------+--------+
| 1  | Rahul | 101      | 500    |
| 1  | Rahul | 102      | 800    |
| 2  | Priya | 103      | 300    |
+----+-------+----------+--------+
```

### Real-world use cases

- Fetch orders with customer details.
- Fetch products with their categories.
- Fetch employees with department details.
- Fetch payment records with corresponding orders.

**Important:** INNER JOIN does not guarantee one row per matching parent. One-to-many relationships can produce multiple rows for the same parent.

---

## 3. LEFT JOIN (LEFT OUTER JOIN)

### Definition

A LEFT JOIN returns:

1. Every row from the left table.
2. Matching rows from the right table.
3. NULL values for right-table columns when no match exists.

The left table is the table written before `LEFT JOIN`.

### Syntax

```sql
SELECT columns
FROM table1
LEFT JOIN table2
ON table1.column = table2.column;
```

`LEFT JOIN` and `LEFT OUTER JOIN` are equivalent.

### Example

```sql
SELECT
    users.id,
    users.name,
    orders.id AS order_id,
    orders.amount
FROM users
LEFT JOIN orders
ON users.id = orders.user_id;
```

### Result

|  id | name  | order_id | amount |
| --: | ----- | -------: | -----: |
|   1 | Rahul |      101 |    500 |
|   1 | Rahul |      102 |    800 |
|   2 | Priya |      103 |    300 |
|   3 | Amit  |     NULL |   NULL |
|   4 | Neha  |     NULL |   NULL |

Notice:

- Rahul appears twice.
- Priya appears once.
- Amit and Neha are included even though they have no orders.
- Their order-related columns contain NULL.
- Order 104 is not included because `users` is the left table.

### Visual representation

```text
LEFT TABLE: USERS         RIGHT TABLE: ORDERS

+----+-------+            +-----+---------+
| 1  | Rahul | ---------> | 101 | 1       |
| 2  | Priya | ---------> | 103 | 2       |
| 3  | Amit  |            | 102 | 1       |
| 4  | Neha  |            | 104 | 5       |
+----+-------+            +-----+---------+

              LEFT JOIN

+----+-------+----------+--------+
| id | name  | order_id | amount |
+----+-------+----------+--------+
| 1  | Rahul | 101      | 500    |
| 1  | Rahul | 102      | 800    |
| 2  | Priya | 103      | 300    |
| 3  | Amit  | NULL     | NULL   |
| 4  | Neha  | NULL     | NULL   |
+----+-------+----------+--------+
```

### Important use case: Find users who have never placed an order

```sql
SELECT
    users.id,
    users.name
FROM users
LEFT JOIN orders
ON users.id = orders.user_id
WHERE orders.id IS NULL;
```

Result:

|  id | name |
| --: | ---- |
|   3 | Amit |
|   4 | Neha |

Why does this work?

1. LEFT JOIN preserves every user.
2. Users without orders receive NULL in the order columns.
3. `WHERE orders.id IS NULL` selects only those users.

This is commonly called an **ANTI JOIN pattern**. We will examine the underlying concept later in this chapter.

### Real-world use cases

- Display all registered users, including those who have never purchased.
- Display all products, including those that have never been ordered.
- Display all employees, including those without assigned projects.
- Display all customers with any matching order information.

---

## 4. RIGHT JOIN (RIGHT OUTER JOIN)

### Definition

A RIGHT JOIN returns:

1. Every row from the right table.
2. Matching rows from the left table.
3. NULL values for left-table columns when no match exists.

The right table is the table written after `RIGHT JOIN`.

### Syntax

```sql
SELECT columns
FROM table1
RIGHT JOIN table2
ON table1.column = table2.column;
```

### Example

```sql
SELECT
    users.id AS user_id,
    users.name,
    orders.id AS order_id,
    orders.amount
FROM users
RIGHT JOIN orders
ON users.id = orders.user_id;
```

### Result

| user_id | name  | order_id | amount |
| ------: | ----- | -------: | -----: |
|       1 | Rahul |      101 |    500 |
|       1 | Rahul |      102 |    800 |
|       2 | Priya |      103 |    300 |
|    NULL | NULL  |      104 |    900 |

Notice:

- Every order is included.
- Matching user information is included where available.
- Order 104 remains in the result even though its user does not exist.
- Amit and Neha are excluded because they are on the left side and have no matching orders.

### Visual representation

```text
USERS                     ORDERS
+----+-------+            +-----+---------+
| 1  | Rahul | ---------> | 101 | 1       |
| 2  | Priya | ---------> | 103 | 2       |
| 3  | Amit  |            | 102 | 1       |
| 4  | Neha  |            | 104 | 5       |
+----+-------+            +-----+---------+

             RIGHT JOIN

+---------+-------+----------+--------+
| user_id | name  | order_id | amount |
+---------+-------+----------+--------+
| 1       | Rahul | 101      | 500    |
| 1       | Rahul | 102      | 800    |
| 2       | Priya | 103      | 300    |
| NULL    | NULL  | 104      | 900    |
+---------+-------+----------+--------+
```

### Can RIGHT JOIN be replaced with LEFT JOIN?

Yes. These two queries are equivalent:

```sql
SELECT *
FROM users
RIGHT JOIN orders
ON users.id = orders.user_id;
```

```sql
SELECT *
FROM orders
LEFT JOIN users
ON users.id = orders.user_id;
```

The second query simply reverses the table order.

### Should you use RIGHT JOIN?

RIGHT JOIN is valid SQL, but many developers prefer LEFT JOIN because the preserved table is always written first.

It is generally easier to read a query when the table whose rows must be preserved appears on the left.

---

## 5. FULL OUTER JOIN

### Definition

A FULL OUTER JOIN returns:

1. All matching rows from both tables.
2. Unmatched rows from the left table.
3. Unmatched rows from the right table.

For unmatched rows, the missing side's columns are filled with NULL.

### Syntax

```sql
SELECT columns
FROM table1
FULL OUTER JOIN table2
ON table1.column = table2.column;
```

### Example

```sql
SELECT
    users.id AS user_id,
    users.name,
    orders.id AS order_id,
    orders.amount
FROM users
FULL OUTER JOIN orders
ON users.id = orders.user_id;
```

### Result

| user_id | name  | order_id | amount |
| ------: | ----- | -------: | -----: |
|       1 | Rahul |      101 |    500 |
|       1 | Rahul |      102 |    800 |
|       2 | Priya |      103 |    300 |
|       3 | Amit  |     NULL |   NULL |
|       4 | Neha  |     NULL |   NULL |
|    NULL | NULL  |      104 |    900 |

Notice:

- All users are retained.
- All orders are retained.
- Matching rows are combined.
- Unmatched users and orders are also included.

### Visual representation

```text
USERS                     ORDERS
+----+-------+            +-----+---------+
| 1  | Rahul | ---------> | 101 | 1       |
| 2  | Priya | ---------> | 103 | 2       |
| 3  | Amit  |            | 102 | 1       |
| 4  | Neha  |            | 104 | 5       |
+----+-------+            +-----+---------+

           FULL OUTER JOIN

+---------+-------+----------+--------+
| user_id | name  | order_id | amount |
+---------+-------+----------+--------+
| 1       | Rahul | 101      | 500    |
| 1       | Rahul | 102      | 800    |
| 2       | Priya | 103      | 300    |
| 3       | Amit  | NULL     | NULL   |
| 4       | Neha  | NULL     | NULL   |
| NULL    | NULL  | 104      | 900    |
+---------+-------+----------+--------+
```

### Real-world use cases

FULL OUTER JOIN is particularly useful for comparing two datasets.

Examples:

- Compare users in an old system with users in a new system.
- Find records missing from either dataset.
- Reconcile payment records with bank transaction records.
- Compare expected inventory with actual inventory.

### Find unmatched records from either side

```sql
SELECT
    users.id AS user_id,
    users.name,
    orders.id AS order_id,
    orders.amount
FROM users
FULL OUTER JOIN orders
ON users.id = orders.user_id
WHERE users.id IS NULL
   OR orders.id IS NULL;
```

This returns:

- Users without orders.
- Orders without matching users.

**Important:** PostgreSQL supports FULL OUTER JOIN. Support and syntax can differ across database systems.

---

## 6. CROSS JOIN

### Definition

A CROSS JOIN produces the Cartesian product of two tables.

Every row from the first table is combined with every row from the second table.

If:

- Table A has N rows.
- Table B has M rows.

Then:

\[
\text{Result rows} = N \times M
\]

### Example

Consider two tables.

**Colors**

| color |
| ----- |
| Red   |
| Blue  |

**Sizes**

| size   |
| ------ |
| Small  |
| Medium |
| Large  |

SQL:

```sql
SELECT
    colors.color,
    sizes.size
FROM colors
CROSS JOIN sizes;
```

### Result

| color | size   |
| ----- | ------ |
| Red   | Small  |
| Red   | Medium |
| Red   | Large  |
| Blue  | Small  |
| Blue  | Medium |
| Blue  | Large  |

There are 2 colors and 3 sizes.

Therefore:

\[
2 \times 3 = 6 \text{ rows}
\]

### Visual representation

```text
COLORS           SIZES
+------+         +--------+
| Red  |         | Small  |
| Blue |         | Medium |
+------+         | Large  |
                 +--------+

       CROSS JOIN

+------+--------+
| Red  | Small  |
| Red  | Medium |
| Red  | Large  |
| Blue | Small  |
| Blue | Medium |
| Blue | Large  |
+------+--------+
```

### Real-world use cases

**1. Generate product combinations**

An e-commerce platform sells T-shirts in different sizes and colors.

CROSS JOIN can generate all possible color-size combinations.

```sql
SELECT
    colors.color,
    sizes.size
FROM colors
CROSS JOIN sizes;
```

**2. Generate reporting periods**

Combine months with regions to generate a complete reporting matrix.

**3. Test data generation**

Generate combinations of different test inputs.

### Important warning

CROSS JOIN can produce a huge number of rows.

For example:

- Table A: 10,000 rows.
- Table B: 20,000 rows.

Result:

\[
10,000 \times 20,000 = 200,000,000
\]

That is 200 million combinations.

Use CROSS JOIN intentionally. An accidental Cartesian product caused by a missing join condition can create serious performance problems.

---

## 7. SELF JOIN

### Definition

A SELF JOIN is when a table is joined with itself.

It is useful when rows in the same table have relationships with other rows in that table.

A common example is an employee-manager relationship.

### Example

Consider an `employees` table:

|  id | name  | manager_id |
| --: | ----- | ---------: |
|   1 | Amit  |       NULL |
|   2 | Rahul |          1 |
|   3 | Priya |          1 |
|   4 | Neha  |          2 |
|   5 | Karan |          2 |

Here:

- Amit has no manager.
- Rahul and Priya report to Amit.
- Neha and Karan report to Rahul.

The `manager_id` column references another employee's `id`.

### SQL query

```sql
SELECT
    employee.name AS employee_name,
    manager.name AS manager_name
FROM employees AS employee
LEFT JOIN employees AS manager
ON employee.manager_id = manager.id;
```

### Result

| employee_name | manager_name |
| ------------- | ------------ |
| Amit          | NULL         |
| Rahul         | Amit         |
| Priya         | Amit         |
| Neha          | Rahul        |
| Karan         | Rahul        |

### Why do we need aliases?

Because we are using the same table twice.

```sql
FROM employees AS employee
LEFT JOIN employees AS manager
```

The aliases distinguish the two logical roles:

- `employee`: the employee whose details we want.
- `manager`: the employee acting as their manager.

Without aliases, the query would be ambiguous.

### Another example: Find employees who share the same manager

```sql
SELECT
    e1.name AS employee_1,
    e2.name AS employee_2,
    e1.manager_id
FROM employees AS e1
JOIN employees AS e2
    ON e1.manager_id = e2.manager_id
WHERE e1.id < e2.id;
```

The condition `e1.id < e2.id` prevents:

- Matching an employee with themselves.
- Returning both Rahul–Priya and Priya–Rahul.

### Real-world use cases

- Employee-manager hierarchies.
- Category-parent relationships.
- Comment-reply relationships.
- Referral relationships between users.
- Organizational structures.

**Key point:** SELF JOIN is not a separate join algorithm. It is a way of joining a table to itself using aliases. It can use INNER JOIN, LEFT JOIN, or other join types.

---

## 8. NATURAL JOIN

### Definition

A NATURAL JOIN automatically joins two tables using all columns that have the same names in both tables.

You do not explicitly write the join condition.

### Example

Consider:

**Employees**

| employee_id | name  | department_id |
| ----------: | ----- | ------------: |
|           1 | Rahul |            10 |
|           2 | Priya |            20 |

**Departments**

| department_id | department_name |
| ------------: | --------------- |
|            10 | Engineering     |
|            20 | Sales           |

Both tables contain a column named `department_id`.

SQL:

```sql
SELECT *
FROM employees
NATURAL JOIN departments;
```

The database automatically uses `department_id` as the join column.

Conceptually, it behaves like:

```sql
SELECT *
FROM employees
JOIN departments
USING (department_id);
```

### Why is NATURAL JOIN dangerous?

Imagine someone adds a new column named `location` to both tables.

Initially:

```text
employees:
employee_id, name, department_id

departments:
department_id, department_name
```

Later:

```text
employees:
employee_id, name, department_id, location

departments:
department_id, department_name, location
```

Now NATURAL JOIN automatically joins using both:

- `department_id`
- `location`

The query's behavior has changed even though the SQL itself has not changed.

This can silently produce fewer or different rows.

### Recommendation

Avoid NATURAL JOIN in production code.

Prefer explicit join conditions:

```sql
SELECT *
FROM employees
JOIN departments
ON employees.department_id = departments.department_id;
```

This makes the intended relationship explicit and protects the query from unrelated schema changes.

---

## 9. SEMI JOIN

### Definition

A SEMI JOIN returns rows from the left table when at least one matching row exists in the right table.

Unlike an ordinary INNER JOIN, it does not return columns from the right table.

It also does not duplicate left-side rows when multiple matches exist.

### Example

Suppose Rahul has two orders and Priya has one order.

We want to find users who have placed at least one order.

### Using EXISTS

```sql
SELECT
    users.id,
    users.name
FROM users
WHERE EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.user_id = users.id
);
```

### Result

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Priya |

Notice Rahul appears only once, even though he has two orders.

### Why not simply use INNER JOIN?

Consider:

```sql
SELECT
    users.id,
    users.name
FROM users
INNER JOIN orders
ON users.id = orders.user_id;
```

This returns:

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   1 | Rahul |
|   2 | Priya |

The difference:

| INNER JOIN                          | SEMI JOIN concept                |
| ----------------------------------- | -------------------------------- |
| Returns matching combinations       | Returns matching left-side rows  |
| Can duplicate left-side rows        | Does not multiply left-side rows |
| Can select columns from both tables | Returns only left-side rows      |

### Other SQL forms

You can also use `IN`:

```sql
SELECT *
FROM users
WHERE id IN (
    SELECT user_id
    FROM orders
);
```

For existence checks, `EXISTS` is usually a clear choice.

### Real-world use cases

- Find customers who have placed at least one order.
- Find products that have at least one review.
- Find employees assigned to at least one project.
- Find users who have completed at least one campaign.

**Important:** SEMI JOIN is a relational operation, not a standard SQL keyword you write as `SEMI JOIN` in PostgreSQL. PostgreSQL may internally select a plan node named `Hash Semi Join` or `Nested Loop Semi Join`.

---

## 10. ANTI JOIN

### Definition

An ANTI JOIN returns rows from the left table that have no matching rows in the right table.

It is the opposite of the SEMI JOIN concept.

### Example

Find users who have never placed an order.

### Using NOT EXISTS

```sql
SELECT
    users.id,
    users.name
FROM users
WHERE NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.user_id = users.id
);
```

### Result

|  id | name |
| --: | ---- |
|   3 | Amit |
|   4 | Neha |

### Alternative: LEFT JOIN + IS NULL

```sql
SELECT
    users.id,
    users.name
FROM users
LEFT JOIN orders
ON users.id = orders.user_id
WHERE orders.id IS NULL;
```

Both queries express the same anti-match requirement for this example.

### NOT EXISTS vs NOT IN

Be careful with `NOT IN`.

Consider:

```sql
SELECT *
FROM users
WHERE id NOT IN (
    SELECT user_id
    FROM orders
);
```

If the subquery returns a NULL, `NOT IN` can produce UNKNOWN rather than TRUE for comparisons, potentially causing unexpected results.

For example, if `orders.user_id` contains:

```text
1
2
NULL
```

Then a comparison like:

```sql
3 NOT IN (1, 2, NULL)
```

does not evaluate to TRUE. It evaluates to UNKNOWN.

As a result, the row is excluded.

**Recommended approach:** Use `NOT EXISTS` for anti-match queries unless you have explicitly handled NULLs.

### Real-world use cases

- Find customers who have never purchased.
- Find products that have never been sold.
- Find users who have not completed onboarding.
- Find employees who are not assigned to any project.
- Find orders without corresponding payment records.

---

## 11. Complete comparison of JOIN types

Here is the consolidated comparison using our `users` and `orders` example.

| JOIN type       |                    Rows returned | Includes unmatched users? | Includes unmatched orders? |
| --------------- | -------------------------------: | ------------------------- | -------------------------- |
| INNER JOIN      |                                3 | No                        | No                         |
| LEFT JOIN       |                                5 | Yes                       | No                         |
| RIGHT JOIN      |                                4 | No                        | Yes                        |
| FULL OUTER JOIN |                                6 | Yes                       | Yes                        |
| CROSS JOIN      |      Depends on both table sizes | All combinations          | All combinations           |
| SELF JOIN       |          Depends on relationship | Depends on join           | Not applicable             |
| NATURAL JOIN    | Depends on matching column names | Depends on join           | Depends on join            |
| SEMI JOIN       |                                2 | Only users with orders    | No                         |
| ANTI JOIN       |                                2 | Only users without orders | No                         |

For this particular dataset:

| JOIN type       | Returned rows |
| --------------- | ------------: |
| INNER JOIN      |             3 |
| LEFT JOIN       |             5 |
| RIGHT JOIN      |             4 |
| FULL OUTER JOIN |             6 |
| SEMI JOIN       |             2 |
| ANTI JOIN       |             2 |

CROSS JOIN is excluded from this count comparison because it uses a different example.

---

## 12. Practical PostgreSQL Lab

Run the following SQL in PostgreSQL to understand each JOIN type yourself.

### Step 1: Create tables

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount NUMERIC(10, 2)
);
```

We intentionally do not add a foreign key to `orders.user_id` because we want to demonstrate unmatched orders.

### Step 2: Insert sample data

```sql
INSERT INTO users (id, name)
VALUES
(1, 'Rahul'),
(2, 'Priya'),
(3, 'Amit'),
(4, 'Neha');

INSERT INTO orders (id, user_id, amount)
VALUES
(101, 1, 500),
(102, 1, 800),
(103, 2, 300),
(104, 5, 900);
```

### Step 3: Practice INNER JOIN

```sql
SELECT *
FROM users
INNER JOIN orders
ON users.id = orders.user_id;
```

### Step 4: Practice LEFT JOIN

```sql
SELECT *
FROM users
LEFT JOIN orders
ON users.id = orders.user_id;
```

### Step 5: Find users without orders

```sql
SELECT *
FROM users
WHERE NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.user_id = users.id
);
```

### Step 6: Practice RIGHT JOIN

```sql
SELECT *
FROM users
RIGHT JOIN orders
ON users.id = orders.user_id;
```

### Step 7: Practice FULL OUTER JOIN

```sql
SELECT *
FROM users
FULL OUTER JOIN orders
ON users.id = orders.user_id;
```

### Step 8: Practice SEMI JOIN

```sql
SELECT *
FROM users
WHERE EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.user_id = users.id
);
```

### Step 9: Practice ANTI JOIN

```sql
SELECT *
FROM users
WHERE NOT EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.user_id = users.id
);
```

---

## 13. Common Mistakes and Misconceptions

### Mistake 1: Assuming JOIN always returns one row per parent

Incorrect assumption:

> One user will produce one row after joining with orders.

Reality:

A user with five matching orders can produce five result rows.

### Mistake 2: Thinking LEFT JOIN returns only matching rows

Incorrect:

```sql
SELECT *
FROM users
LEFT JOIN orders
ON users.id = orders.user_id;
```

This does not return only matching users. It preserves all users, including those without orders.

### Mistake 3: Thinking RIGHT JOIN is fundamentally different from LEFT JOIN

It is not. You can reverse the table order and use LEFT JOIN.

### Mistake 4: Using DISTINCT to hide duplicate rows

Example:

```sql
SELECT DISTINCT users.*
FROM users
JOIN orders
ON users.id = orders.user_id;
```

This may be valid if you only want unique users, but it is not a universal fix for duplicate results.

If you want to check whether a matching record exists, `EXISTS` is usually clearer.

### Mistake 5: Forgetting the Cartesian product

A missing join condition can create a huge result set.

For example:

```sql
SELECT *
FROM users
CROSS JOIN orders;
```

This intentionally creates every combination.

An accidental missing join condition in older comma-style SQL can produce the same problem.

### Mistake 6: Confusing NULL with an actual matching NULL key

In an outer join, a NULL on the right side can mean no matching row was found.

It does not mean SQL matched a NULL key to another NULL key.

Ordinary equality comparisons involving NULL evaluate to UNKNOWN, not TRUE.

### Mistake 7: Using NATURAL JOIN without understanding its schema dependency

The database chooses all identically named columns automatically. A future schema change can alter the query's behavior.

Prefer explicit `ON` conditions.

---

## 14. Interview Questions

### Basic questions

**1. What is an INNER JOIN?**

An INNER JOIN returns only rows where the join condition matches in both tables.

**2. What is the difference between LEFT JOIN and RIGHT JOIN?**

LEFT JOIN preserves every row from the left table. RIGHT JOIN preserves every row from the right table.

**3. What is the difference between LEFT JOIN and FULL OUTER JOIN?**

LEFT JOIN preserves all left-side rows and matching right-side rows. FULL OUTER JOIN preserves all rows from both sides.

**4. What is a CROSS JOIN?**

A CROSS JOIN returns the Cartesian product of two tables. If one table has N rows and another has M rows, the result contains N × M combinations.

**5. Can RIGHT JOIN be replaced with LEFT JOIN?**

Yes. Swap the table order and use LEFT JOIN.

**6. What is a SELF JOIN?**

A SELF JOIN joins a table with itself, typically to represent hierarchical or self-referencing relationships.

**7. What is NATURAL JOIN?**

A NATURAL JOIN automatically joins tables using all identically named columns.

**8. What is the difference between SEMI JOIN and INNER JOIN?**

A SEMI JOIN returns matching rows from the left side without multiplying them for multiple matches. INNER JOIN returns matching combinations and can produce duplicate left-side rows.

### Intermediate questions

**9. How would you find users who have never placed an order?**

Using NOT EXISTS:

```sql
SELECT *
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

Or using LEFT JOIN:

```sql
SELECT u.*
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE o.id IS NULL;
```

**10. Why can a LEFT JOIN return more rows than the left table?**

Because one left-side row can match multiple right-side rows.

**11. Why is NATURAL JOIN generally avoided in production?**

Because it automatically joins all same-named columns. Adding a new common column can silently change query behavior.

**12. What is the difference between NOT EXISTS and NOT IN?**

NOT EXISTS checks whether a matching row exists. NOT IN uses SQL comparison semantics and can produce unexpected results if the subquery contains NULL.

**13. Does SELF JOIN require a foreign key?**

No. A foreign key is useful for enforcing the relationship, but a JOIN can be written without a declared foreign key.

**14. Is SEMI JOIN a SQL keyword in PostgreSQL?**

No. It is a relational operation that can be expressed using EXISTS or IN. PostgreSQL may use a semi-join execution plan internally.

---

## 15. Chapter Summary

| Concept         | Remember                               |
| --------------- | -------------------------------------- |
| INNER JOIN      | Only matching rows                     |
| LEFT JOIN       | All left rows, matching right rows     |
| RIGHT JOIN      | All right rows, matching left rows     |
| FULL OUTER JOIN | All rows from both tables              |
| CROSS JOIN      | Every possible combination             |
| SELF JOIN       | A table joined with itself             |
| NATURAL JOIN    | Automatically joins same-named columns |
| SEMI JOIN       | Left rows where a match exists         |
| ANTI JOIN       | Left rows where no match exists        |

### Key takeaways

1. INNER JOIN returns only matching combinations.
2. LEFT JOIN preserves all rows from the left table.
3. RIGHT JOIN preserves all rows from the right table.
4. FULL OUTER JOIN preserves unmatched rows from both tables.
5. CROSS JOIN generates Cartesian products.
6. SELF JOIN is useful for hierarchical relationships.
7. NATURAL JOIN is fragile and generally best avoided.
8. EXISTS expresses a semi-join pattern.
9. NOT EXISTS expresses an anti-join pattern.
10. One-to-many relationships can produce multiple rows for the same parent.
