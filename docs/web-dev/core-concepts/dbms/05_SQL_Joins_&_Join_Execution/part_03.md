---
sidebar_label: JOIN vs WHERE, ON vs AND
sidebar_position: 1
---

# JOIN vs WHERE, ON vs AND

## 1. Introduction

When writing SQL queries involving JOINs, one of the most common sources of bugs is placing conditions in the wrong location.

Consider these three clauses:

- `ON`
- `WHERE`
- `AND`

They can all appear in a JOIN query, but they do not perform the same job.

The most important distinction:

| Clause  | Purpose                                                 |
| ------- | ------------------------------------------------------- |
| `ON`    | Defines the condition used to match rows between tables |
| `WHERE` | Filters the rows produced by the query                  |
| `AND`   | Combines multiple Boolean conditions within a clause    |

The biggest problem occurs when using `LEFT JOIN`, `RIGHT JOIN`, or `FULL OUTER JOIN`.

Moving a condition from `ON` to `WHERE` can change which rows are returned.

Let's understand why.

---

## 2. First, understand ON

The `ON` clause specifies the condition that determines whether rows from two tables match.

### Example

Consider these tables.

**users**

|  id | name  |
| --: | ----- |
|   1 | Rahul |
|   2 | Priya |
|   3 | Amit  |
|   4 | Neha  |

**orders**

|  id | user_id | amount | status    |
| --: | ------: | -----: | --------- |
| 101 |       1 |    500 | completed |
| 102 |       1 |    800 | pending   |
| 103 |       2 |    300 | completed |
| 104 |       3 |    900 | pending   |

We want to retrieve users with their orders.

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

Here:

```sql
ON users.id = orders.user_id
```

defines the matching condition.

The database matches a user with an order when:

```text
users.id = orders.user_id
```

### Result

|  id | name  | order_id | amount |
| --: | ----- | -------: | -----: |
|   1 | Rahul |      101 |    500 |
|   1 | Rahul |      102 |    800 |
|   2 | Priya |      103 |    300 |
|   3 | Amit  |      104 |    900 |

Neha does not appear because she has no matching order and we used INNER JOIN.

**Remember:** `ON` determines how rows from the joined tables are matched.

---

## 3. Understanding WHERE

The `WHERE` clause filters rows based on a condition.

### Example

Suppose we want only completed orders.

```sql
SELECT
    users.id,
    users.name,
    orders.id AS order_id,
    orders.amount,
    orders.status
FROM users
INNER JOIN orders
ON users.id = orders.user_id
WHERE orders.status = 'completed';
```

### Result

|  id | name  | order_id | amount | status    |
| --: | ----- | -------: | -----: | --------- |
|   1 | Rahul |      101 |    500 | completed |
|   2 | Priya |      103 |    300 | completed |

The JOIN first defines the matching relationship, and the WHERE condition filters the resulting rows.

**Remember:** `WHERE` filters rows based on the specified condition.

---

## 4. The important difference: ON vs WHERE with INNER JOIN

For an INNER JOIN, a condition can often be placed in either `ON` or `WHERE` without changing the result.

Consider this query:

### Query A — Condition inside ON

```sql
SELECT
    users.name,
    orders.id AS order_id,
    orders.status
FROM users
INNER JOIN orders
ON users.id = orders.user_id
AND orders.status = 'completed';
```

### Query B — Condition inside WHERE

```sql
SELECT
    users.name,
    orders.id AS order_id,
    orders.status
FROM users
INNER JOIN orders
ON users.id = orders.user_id
WHERE orders.status = 'completed';
```

For this INNER JOIN, both queries return the same result:

| name  | order_id | status    |
| ----- | -------: | --------- |
| Rahul |      101 | completed |
| Priya |      103 | completed |

Why?

Because INNER JOIN only retains matching rows. Rows that do not satisfy the additional condition are excluded either way.

### Important distinction

Although these queries produce the same result here, the clauses still have different logical responsibilities:

- `ON` defines matching conditions.
- `WHERE` filters the resulting rows.

For INNER JOIN, the optimizer can often treat these conditions equivalently.

Do not generalize this equivalence to OUTER JOINs.

---

## 5. The critical difference: ON vs WHERE with LEFT JOIN

This is the most important section of this chapter.

With LEFT JOIN, moving a condition between `ON` and `WHERE` can completely change the result.

Let's use the same tables.

### Query A — Condition inside ON

```sql
SELECT
    users.id,
    users.name,
    orders.id AS order_id,
    orders.status
FROM users
LEFT JOIN orders
ON users.id = orders.user_id
AND orders.status = 'completed';
```

### Result

|  id | name  | order_id | status    |
| --: | ----- | -------: | --------- |
|   1 | Rahul |      101 | completed |
|   2 | Priya |      103 | completed |
|   3 | Amit  |     NULL | NULL      |
|   4 | Neha  |     NULL | NULL      |

Notice something important:

- Rahul's completed order is included.
- Rahul's pending order is not included.
- Priya's completed order is included.
- Amit and Neha are still included.
- Users without a completed order receive NULL in the order columns.

Why?

Because the condition is part of the matching process.

The database tries to match each user with orders satisfying both conditions:

```sql
users.id = orders.user_id
AND orders.status = 'completed'
```

If no qualifying order exists, LEFT JOIN preserves the user and fills the order columns with NULL.

### Query B — Condition inside WHERE

```sql
SELECT
    users.id,
    users.name,
    orders.id AS order_id,
    orders.status
FROM users
LEFT JOIN orders
ON users.id = orders.user_id
WHERE orders.status = 'completed';
```

### Result

|  id | name  | order_id | status    |
| --: | ----- | -------: | --------- |
|   1 | Rahul |      101 | completed |
|   2 | Priya |      103 | completed |

What happened to Amit and Neha?

They disappeared.

What happened to Rahul's pending order?

It also disappeared.

Why?

Because the WHERE clause filters the rows after the LEFT JOIN has produced its result.

For users without orders, the joined order columns contain NULL.

The condition:

```sql
orders.status = 'completed'
```

evaluates to UNKNOWN when `orders.status` is NULL.

SQL WHERE retains only rows for which the condition evaluates to TRUE. Both FALSE and UNKNOWN are excluded.

### The key difference

| Query                                                        | What it means                                     |
| ------------------------------------------------------------ | ------------------------------------------------- |
| LEFT JOIN ... ON matching condition AND status = 'completed' | Return all users, attaching only completed orders |
| LEFT JOIN ... WHERE status = 'completed'                     | Return only joined rows having completed orders   |

The second query effectively removes unmatched users, making its result behave like an INNER JOIN for this condition.

**This is one of the most important SQL JOIN concepts to understand.**

---

## 6. Visualizing the difference

Imagine we want:

> All users, but attach only their completed orders.

This is the correct query:

```sql
SELECT *
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
AND o.status = 'completed';
```

Conceptually:

```text
USERS
+----+-------+
| 1  | Rahul |
| 2  | Priya |
| 3  | Amit  |
| 4  | Neha  |
+----+-------+

              LEFT JOIN
              ON user_id matches
              AND status = completed

RESULT
+-------+----------+-----------+
| User  | Order ID | Status    |
+-------+----------+-----------+
| Rahul | 101      | completed |
| Priya | 103      | completed |
| Amit  | NULL     | NULL      |
| Neha  | NULL     | NULL      |
+-------+----------+-----------+
```

Now consider:

```sql
SELECT *
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE o.status = 'completed';
```

Conceptually:

```text
LEFT JOIN RESULT
+-------+----------+-----------+
| Rahul | 101      | completed |
| Rahul | 102      | pending   |
| Priya | 103      | completed |
| Amit  | NULL     | NULL      |
| Neha  | NULL     | NULL      |
+-------+----------+-----------+

             WHERE status = completed

FINAL RESULT
+-------+----------+-----------+
| Rahul | 101      | completed |
| Priya | 103      | completed |
+-------+----------+-----------+
```

Amit and Neha are removed because their status is NULL.

---

## 7. Understanding AND inside ON

You can specify multiple matching conditions inside the ON clause using AND.

### Example

Suppose we want to match:

1. The user ID.
2. Only completed orders.
3. Orders with an amount greater than 400.

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.amount,
    o.status
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
AND o.status = 'completed'
AND o.amount > 400;
```

### Result

| name  | order_id | amount | status    |
| ----- | -------: | -----: | --------- |
| Rahul |      101 |    500 | completed |
| Priya |     NULL |   NULL | NULL      |
| Amit  |     NULL |   NULL | NULL      |
| Neha  |     NULL |   NULL | NULL      |

Why does Priya receive NULL?

Her completed order has an amount of 300, which does not satisfy `o.amount > 400`.

Therefore, she has no matching order under the specified ON conditions.

However, she is still retained because users is the left table.

### Important

These conditions:

```sql
ON u.id = o.user_id
AND o.status = 'completed'
AND o.amount > 400
```

do not mean that users must have a completed order above 400.

They mean that the database should attach only orders satisfying those conditions while preserving every user.

---

## 8. Understanding AND inside WHERE

Now consider:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.amount,
    o.status
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE o.status = 'completed'
AND o.amount > 400;
```

### Result

| name  | order_id | amount | status    |
| ----- | -------: | -----: | --------- |
| Rahul |      101 |    500 | completed |

Why?

The WHERE clause filters the joined result.

Only rows satisfying both conditions survive:

```sql
o.status = 'completed'
AND o.amount > 400
```

All users without a qualifying order are removed.

### Comparison

| Condition placement | Behavior                                         |
| ------------------- | ------------------------------------------------ |
| AND inside ON       | Controls which right-side rows match             |
| AND inside WHERE    | Filters the joined result                        |
| AND inside both     | Applies conditions during matching and filtering |

---

## 9. The common mistake: Trying to preserve unmatched rows using WHERE

Suppose the requirement is:

> Show every user and their pending orders, if they have any.

A common incorrect query is:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.status
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE o.status = 'pending';
```

This removes users without orders because their order status is NULL.

It returns only users with pending orders.

### Correct query

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.status
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
AND o.status = 'pending';
```

Now every user is preserved, and only pending orders are attached.

### Mental model

Ask yourself:

**Question 1:** Do I want to control which records from the right table can match?

Use `ON`.

**Question 2:** Do I want to remove rows from the final result?

Use `WHERE`.

This distinction is especially important with OUTER JOINs.

---

## 10. Filtering on the preserved table vs the optional table

There is another useful distinction.

Suppose we want all users whose names start with `R`, along with their orders.

```sql
SELECT
    u.name,
    o.id AS order_id
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE u.name LIKE 'R%';
```

Here, filtering users in WHERE is appropriate.

Why?

Because we only want users whose names start with R. Removing other users is intentional.

Now consider this requirement:

> Show every user, but attach orders above 500 only.

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.amount
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
AND o.amount > 500;
```

Here, filtering the optional table's matching records belongs in ON.

### General rule

For a LEFT JOIN:

- Filtering the preserved left table in WHERE is usually appropriate when you want to restrict which left-side rows appear.
- Filtering the optional right table in ON is appropriate when you want to restrict which right-side rows can match without removing left-side rows.

This is a useful guideline, not a rule that every condition must follow. The correct placement depends on the intended result.

---

## 11. What happens with RIGHT JOIN and FULL OUTER JOIN?

The same underlying principle applies to other OUTER JOINs.

### RIGHT JOIN

A RIGHT JOIN preserves all rows from the right table.

For example:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.status
FROM users u
RIGHT JOIN orders o
ON u.id = o.user_id
AND u.name = 'Rahul';
```

The condition on `u.name` restricts which user records can match an order.

However, every order is still preserved because `orders` is on the right side.

If an order does not match Rahul, the user columns can be NULL.

Moving that condition to WHERE would filter out rows where the user columns are NULL.

### FULL OUTER JOIN

A FULL OUTER JOIN preserves unmatched rows from both tables.

Consider:

```sql
SELECT
    u.name,
    o.id AS order_id,
    o.status
FROM users u
FULL OUTER JOIN orders o
ON u.id = o.user_id
AND o.status = 'completed';
```

This preserves all users and all orders, while only completed orders can match users.

Moving `o.status = 'completed'` into WHERE would remove unmatched orders and rows where the status is NULL.

**Key point:** With OUTER JOINs, moving a condition from ON to WHERE can change which unmatched rows survive.

---

## 12. Logical processing order: A useful preview

SQL queries are not conceptually processed in the exact order in which we write their clauses.

A simplified logical processing order is:

1. FROM
2. JOIN and ON
3. Outer-join row preservation
4. WHERE
5. GROUP BY
6. HAVING
7. SELECT
8. DISTINCT
9. ORDER BY
10. LIMIT / OFFSET

This is a logical model, not a guarantee of the database's physical execution sequence.

For this chapter, remember the important part:

- ON participates in determining matching rows.
- OUTER JOIN preserves unmatched rows.
- WHERE filters the resulting rows.

We will study the broader logical execution order in Part 5E.

---

## 13. Common mistakes

### Mistake 1: Putting a right-table condition in WHERE unintentionally

Incorrect for the requirement "show all users and their completed orders":

```sql
SELECT *
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE o.status = 'completed';
```

Correct:

```sql
SELECT *
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
AND o.status = 'completed';
```

### Mistake 2: Assuming AND is a JOIN operator

AND is a logical operator that combines conditions.

It can be used in ON, WHERE, HAVING, and other Boolean expressions.

### Mistake 3: Assuming ON and WHERE always produce the same results

They can often be equivalent for INNER JOINs, but not for OUTER JOINs.

### Mistake 4: Trying to filter unmatched rows with equality to NULL

Incorrect:

```sql
WHERE o.id = NULL
```

Correct:

```sql
WHERE o.id IS NULL
```

SQL uses `IS NULL` to test for NULL values.

### Mistake 5: Adding OR conditions without considering NULL behavior

For example:

```sql
WHERE o.status = 'completed'
   OR o.id IS NULL
```

This preserves users with no orders, but it does not preserve users who have orders that are all pending.

Why?

Those users have matching order rows, so the LEFT JOIN does not generate a NULL-extended row for them. Their pending rows fail both WHERE conditions.

If the requirement is to preserve all users and attach only completed orders, put the status condition in ON instead.

### Mistake 6: Using DISTINCT to repair incorrect filtering

DISTINCT removes duplicate result rows. It does not correct a condition placed in the wrong clause.

Understand the intended row-preservation behavior before modifying the query.

---

## 14. Practical PostgreSQL Lab

Use the following dataset to test the behavior yourself.

### Step 1: Create tables

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount NUMERIC(10, 2),
    status VARCHAR(30)
);
```

### Step 2: Insert data

```sql
INSERT INTO users (id, name)
VALUES
(1, 'Rahul'),
(2, 'Priya'),
(3, 'Amit'),
(4, 'Neha');

INSERT INTO orders (id, user_id, amount, status)
VALUES
(101, 1, 500, 'completed'),
(102, 1, 800, 'pending'),
(103, 2, 300, 'completed'),
(104, 3, 900, 'pending');
```

### Exercise 1

Return every user and only their completed orders.

Expected behavior:

- Rahul has his completed order.
- Priya has her completed order.
- Amit and Neha remain with NULL order information.

### Exercise 2

Return only users who have completed orders.

Expected behavior:

- Rahul.
- Priya.
- Amit and Neha should not appear.

### Exercise 3

Return every user and only orders with an amount greater than 400.

Expected behavior:

- Rahul has his two orders because both amounts are above 400.
- Priya remains with NULL because her order is 300.
- Amit has his pending order of 900.
- Neha remains with NULL.

### Exercise 4

Return all users whose names start with R, along with their orders.

Expected behavior:

- Only Rahul appears, with both matching orders.

### Exercise 5

Return every user, but only attach completed orders above 400.

Expected behavior:

- Rahul has order 101.
- Priya remains with NULL.
- Amit remains with NULL because his order is pending.
- Neha remains with NULL.

### Exercise 6

Write two queries that return the same result using INNER JOIN:

- One with the completed-order condition inside ON.
- One with the completed-order condition inside WHERE.

Verify that their results are equivalent.

---

## 15. Interview Questions

### Basic questions

**1. What is the difference between ON and WHERE?**

ON specifies matching conditions between joined tables. WHERE filters rows from the resulting query.

**2. Can a condition be placed inside ON using AND?**

Yes. AND combines multiple conditions in the ON clause.

**3. Are ON and WHERE interchangeable?**

Not always. For INNER JOIN, many conditions can be moved between them without changing the result. For OUTER JOINs, moving conditions can change row preservation.

**4. What happens when a right-table condition is placed in WHERE after a LEFT JOIN?**

Rows with no matching right-side record may be removed because the condition evaluates to UNKNOWN for NULL values.

### Intermediate questions

**5. You need all customers, but only their completed orders. Where should the status condition go?**

Inside ON:

```sql
SELECT *
FROM customers c
LEFT JOIN orders o
ON c.id = o.customer_id
AND o.status = 'completed';
```

**6. You need only customers who have completed orders. Where should the condition go?**

A LEFT JOIN followed by WHERE can work:

```sql
SELECT *
FROM customers c
LEFT JOIN orders o
ON c.id = o.customer_id
WHERE o.status = 'completed';
```

An INNER JOIN is more direct:

```sql
SELECT *
FROM customers c
INNER JOIN orders o
ON c.id = o.customer_id
AND o.status = 'completed';
```

**7. Why does `WHERE o.status = 'completed'` remove users with no orders?**

Because `o.status` is NULL for unmatched rows, and the equality comparison evaluates to UNKNOWN. WHERE retains only TRUE conditions.

**8. What is the difference between these queries?**

```sql
SELECT *
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
AND o.status = 'completed';
```

```sql
SELECT *
FROM users u
LEFT JOIN orders o
ON u.id = o.user_id
WHERE o.status = 'completed';
```

The first preserves every user and attaches only completed orders. The second returns only rows with completed orders, excluding users without a completed match.

**9. Does putting a condition in ON guarantee that all left-side rows are returned?**

For a LEFT JOIN, yes, provided the condition is part of the ON clause and there are no later filters that remove those left-side rows.

**10. What does SQL do when a WHERE comparison involves NULL?**

Most ordinary comparisons involving NULL evaluate to UNKNOWN, not TRUE or FALSE. WHERE keeps only rows for which its condition evaluates to TRUE.

---

## 16. Chapter Summary

| Concept         | Remember                                                                      |
| --------------- | ----------------------------------------------------------------------------- |
| ON              | Defines matching conditions                                                   |
| WHERE           | Filters the query result                                                      |
| AND             | Combines Boolean conditions                                                   |
| INNER JOIN      | ON and WHERE conditions can often be equivalent                               |
| LEFT JOIN       | Moving right-table conditions from ON to WHERE can remove unmatched left rows |
| RIGHT JOIN      | Moving left-table conditions to WHERE can remove unmatched right rows         |
| FULL OUTER JOIN | Moving conditions to WHERE can remove unmatched rows from either side         |
| IS NULL         | Correct way to check for NULL                                                 |
| IS NOT NULL     | Correct way to check for non-NULL                                             |

### The mental model to remember

**Use ON when deciding which rows should match.**

**Use WHERE when deciding which rows should remain in the final result.**

For OUTER JOINs, this distinction is critical because the database preserves unmatched rows before applying the WHERE filter.
