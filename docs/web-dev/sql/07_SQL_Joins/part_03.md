---
sidebar_label: "JOIN Conditions and Filtering"
sidebar_position: 1
---

# JOIN Conditions and Filtering

## 1. Understanding JOIN Conditions

A JOIN condition determines **which rows from two tables are considered a match**.

In PostgreSQL, JOIN conditions are commonly written using `ON` or `USING`.

### Example schema

```sql
customers (
    customer_id,
    customer_name,
    city
);

orders (
    order_id,
    customer_id,
    total_amount,
    status
);
```

### Basic JOIN using ON

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

Here:

- `customers` is the left table.
- `orders` is the right table.
- `ON` defines the matching condition.
- `customer_id` connects the two tables.

**Important:** A foreign key is not required to use JOIN. JOIN works by evaluating the condition you provide.

---

## 2. ON vs WHERE

This is one of the most important concepts in SQL JOINs.

- `ON` defines how rows from tables match.
- `WHERE` filters the rows produced by the FROM/JOIN operations.

### Example: INNER JOIN

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.status
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.status = 'completed';
```

The database:

1. Matches customers with their orders.
2. Filters the joined rows to retain completed orders.

For INNER JOIN, a condition can often be placed in either `ON` or `WHERE` without changing the result.

These are equivalent for this example:

```sql
-- Condition in ON
SELECT *
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
   AND o.status = 'completed';
```

```sql
-- Condition in WHERE
SELECT *
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.status = 'completed';
```

This equivalence does not generally hold for OUTER JOINs.

---

## 3. ON vs WHERE with LEFT JOIN

This is a critical distinction.

Suppose you need:

**All customers, but only their completed orders.**

### Approach 1: Condition inside ON

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.status
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
   AND o.status = 'completed';
```

Result:

| customer_name | order_id | status    |
| ------------- | -------: | --------- |
| Rahul         |      101 | completed |
| Priya         |     NULL | NULL      |
| Amit          |     NULL | NULL      |

Assume Rahul has one completed and one pending order, while Priya has only pending orders and Amit has no orders.

**What happens?**

- Rahul matches only his completed order.
- Priya remains in the result because LEFT JOIN preserves customers.
- Amit remains in the result because LEFT JOIN preserves customers.
- Non-completed orders are not included as matches.

### Approach 2: Condition inside WHERE

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.status
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.status = 'completed';
```

Result:

| customer_name | order_id | status    |
| ------------- | -------: | --------- |
| Rahul         |      101 | completed |

**What happened?**

- Rahul's completed order passes the WHERE condition.
- Priya's pending order fails the condition.
- Amit's NULL order status also fails the condition because the comparison evaluates to UNKNOWN.
- Priya and Amit disappear.

The LEFT JOIN effectively behaves like an INNER JOIN for this filter.

### Rule

| Requirement                                          | Correct placement           |
| ---------------------------------------------------- | --------------------------- |
| Keep all customers, matching only completed orders   | Condition in ON             |
| Return only customers with completed orders          | Condition in WHERE          |
| Keep all departments, matching only active employees | Employee condition in ON    |
| Return only departments having active employees      | Employee condition in WHERE |

**Remember:** An outer JOIN preserves rows during matching. A WHERE condition can subsequently remove those preserved rows.

---

## 4. Multiple JOIN Conditions

You can use multiple conditions inside ON.

### Example: Match customer and order by multiple columns

```sql
SELECT *
FROM orders AS o
INNER JOIN customers AS c
    ON o.customer_id = c.customer_id
   AND o.city = c.city;
```

This matches records only when both conditions are TRUE.

Logical operators can be used:

```sql
SELECT *
FROM orders AS o
INNER JOIN customers AS c
    ON o.customer_id = c.customer_id
   AND c.city = 'Delhi';
```

You can also use OR:

```sql
SELECT *
FROM employees AS e
INNER JOIN departments AS d
    ON e.department_id = d.department_id
    OR e.backup_department_id = d.department_id;
```

**Warning:** OR conditions in JOINs can produce multiple matches and make query plans more expensive. Use them only when the relationship genuinely requires them.

---

## 5. JOIN Using Multiple Tables

A query can JOIN more than two tables.

### Example: Customer, orders and payments

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount,
    p.payment_id,
    p.payment_status
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
INNER JOIN payments AS p
    ON o.order_id = p.order_id;
```

Relationship:

```text
customers
    |
    | customer_id
    |
  orders
    |
    | order_id
    |
 payments
```

Each JOIN adds another relationship to the result.

### Example: Include customers even without orders or payments

```sql
SELECT
    c.customer_name,
    o.order_id,
    p.payment_id,
    p.payment_status
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
LEFT JOIN payments AS p
    ON o.order_id = p.order_id;
```

This preserves all customers.

- Customers without orders have NULL order and payment columns.
- Orders without payments have NULL payment columns.
- Customers with multiple orders or payments can appear multiple times.

---

## 6. JOIN with AND, OR and IN

JOIN conditions support normal SQL comparison and logical operators.

### AND

Both conditions must be TRUE.

```sql
SELECT *
FROM employees AS e
JOIN departments AS d
    ON e.department_id = d.department_id
   AND e.status = 'active';
```

### OR

At least one condition must be TRUE.

```sql
SELECT *
FROM employees AS e
JOIN departments AS d
    ON e.department_id = d.department_id
    OR e.backup_department_id = d.department_id;
```

### IN

Match against multiple values.

```sql
SELECT
    e.first_name,
    d.department_name
FROM employees AS e
JOIN departments AS d
    ON e.department_id = d.department_id
WHERE d.department_name IN ('Sales', 'Support');
```

### BETWEEN

Match values within an inclusive range.

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.total_amount BETWEEN 1000 AND 5000;
```

---

## 7. JOIN with NULL Values

NULL requires special handling in JOIN conditions.

### Incorrect approach

```sql
SELECT *
FROM table_a AS a
JOIN table_b AS b
    ON a.some_column = b.some_column;
```

If both values are NULL, they do not match because:

```sql
NULL = NULL
```

evaluates to UNKNOWN, not TRUE.

### NULL-safe comparison

PostgreSQL provides `IS NOT DISTINCT FROM`.

```sql
SELECT *
FROM table_a AS a
JOIN table_b AS b
    ON a.some_column IS NOT DISTINCT FROM b.some_column;
```

This treats two NULL values as equal for matching.

**Use carefully:** If many rows have NULL in the join column, multiple NULL-to-NULL matches can produce a large number of combinations.

---

## 8. JOIN with Aggregate Functions

JOINs are frequently combined with GROUP BY and aggregate functions.

### Example: Total orders per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

### Why COUNT(o.order_id), not COUNT(\*)?

For customers without orders, LEFT JOIN still produces one row containing NULL values for order columns.

| Expression        | Customer without orders |
| ----------------- | ----------------------: |
| COUNT(\*)         |                       1 |
| COUNT(o.order_id) |                       0 |

`COUNT(column)` ignores NULL, so it correctly counts matching orders.

`COALESCE()` converts the NULL result of SUM into zero.

---

## 9. JOIN with ORDER BY and LIMIT

You can sort and limit joined results.

### Example: Top 5 most expensive orders with customer details

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
ORDER BY o.total_amount DESC, o.order_id
LIMIT 5;
```

The unique `order_id` tie-breaker makes the ordering deterministic when amounts are equal.

### Important

LIMIT applies to the final joined result, not separately to each customer.

If one customer has many orders, that customer can occupy several rows in the result.

---

## 10. USING vs ON

PostgreSQL supports `USING` when both tables share a column name and that column is used for equality matching.

### Using ON

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

### Using USING

```sql
SELECT
    customer_id,
    customer_name,
    order_id
FROM customers
JOIN orders
    USING (customer_id);
```

### Differences

| ON                                                      | USING                                         |
| ------------------------------------------------------- | --------------------------------------------- |
| Supports different column names                         | Requires the same column name                 |
| Supports complex conditions                             | Performs equality matching on listed columns  |
| Can use multiple operators                              | Uses equality for each listed column          |
| Both join columns remain available as qualified columns | Common join column appears once in `SELECT *` |

Example with multiple shared columns:

```sql
SELECT *
FROM table_a
JOIN table_b
    USING (customer_id, region_id);
```

Both columns must match.

**Best practice:** Use ON for complex relationships. Use USING for simple equality joins with identically named columns.

---

## 11. NATURAL JOIN

NATURAL JOIN automatically joins tables using all columns that have the same names.

```sql
SELECT *
FROM customers
NATURAL JOIN orders;
```

If both tables contain `customer_id`, PostgreSQL uses that column as the join condition.

If they share additional column names, those are also included in the matching condition.

### Why NATURAL JOIN is risky

Suppose both tables initially share only `customer_id`.

Later, someone adds a `status` column to both tables.

The NATURAL JOIN now also matches on `status`, potentially changing query results without changing the SQL statement.

**Recommendation:** Avoid NATURAL JOIN in production queries. Prefer explicit ON or USING conditions.

---

## 12. JOIN Order and Parentheses

For queries involving multiple JOINs, order and grouping can affect results, especially with OUTER JOINs.

### Example

```sql
SELECT *
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
LEFT JOIN payments AS p
    ON o.order_id = p.order_id;
```

This logically preserves all customers, then matches their orders and payments.

For complicated combinations of INNER and OUTER JOINs, use parentheses to make the intended grouping explicit.

```sql
SELECT *
FROM customers AS c
LEFT JOIN (
    orders AS o
    INNER JOIN payments AS p
        ON o.order_id = p.order_id
)
    ON c.customer_id = o.customer_id;
```

This groups the orders-payment INNER JOIN before attaching the result to customers.

The two queries are not necessarily equivalent:

- The first can include orders without payments.
- The second only attaches orders that have matching payments.

---

## 13. Common JOIN Filtering Mistakes

| Mistake                                                  | Why it is wrong                                        |
| -------------------------------------------------------- | ------------------------------------------------------ |
| Putting an optional-side filter in WHERE after LEFT JOIN | Can remove unmatched left-side rows                    |
| Using `= NULL`                                           | NULL comparisons require IS NULL or IS NOT NULL        |
| Forgetting multiple matching rows                        | Produces more output rows than expected                |
| Using COUNT(\*) for child counts                         | Counts the NULL-extended parent row                    |
| Using NATURAL JOIN                                       | Schema changes can silently change matching conditions |
| Using OR without considering cardinality                 | Can create unexpected multiple matches                 |
| Using LIMIT before understanding JOIN output             | Limits final joined rows, not parent records           |
| Assuming ON filters the final output                     | ON controls matching; WHERE filters the resulting rows |

---

## 14. Practice Exercises

Use the TechBazaar database.

1. Display customer names and their order IDs using INNER JOIN and ON.
2. Display all customers but match only completed orders using LEFT JOIN.
3. Display only customers who have completed orders.
4. Explain why moving the completed-order condition from ON to WHERE changes the LEFT JOIN result.
5. Display employees with their department names, considering only active employees.
6. Display customers, orders and payment statuses using three-table JOINs.
7. Find customers who have no orders using LEFT JOIN.
8. Find customers who have no orders using NOT EXISTS.
9. Count the number of orders for every customer, including customers with zero orders.
10. Calculate total spending per customer.
11. Find customers whose total spending exceeds ₹10,000.
12. Display orders between ₹1,000 and ₹5,000.
13. Use USING to join customers and orders.
14. Explain why NATURAL JOIN can become dangerous after a schema change.
15. Write a query that matches employees with either their primary or backup department.
16. Demonstrate the difference between COUNT(\*) and COUNT(o.order_id) after LEFT JOIN.
17. Join orders with payments, but preserve orders that have no payment.
18. Explain how multiple matching payment rows affect the output.

---

## 15. Interview Questions

**Q1. What is the difference between ON and WHERE?**

ON defines matching conditions between tables. WHERE filters rows after the FROM and JOIN operations.

**Q2. Can a condition be placed in ON instead of WHERE?**

For INNER JOIN, many conditions can be moved between ON and WHERE without changing the result. For OUTER JOIN, moving conditions can change which rows are preserved.

**Q3. What happens when a WHERE condition filters a LEFT JOIN's right-side column?**

Unmatched rows generally fail the condition and are removed, making the result behave like an INNER JOIN for that filter.

**Q4. What is the difference between ON and USING?**

ON supports arbitrary matching expressions. USING is shorthand for equality matching on identically named columns and exposes the shared join column once in an unqualified SELECT \*.

**Q5. Can we JOIN more than two tables?**

Yes. Multiple JOIN clauses can be chained in one query.

**Q6. Can NULL values match in a JOIN?**

Not with ordinary equality. Use `IS NOT DISTINCT FROM` for NULL-safe equality in PostgreSQL.

**Q7. Why is COUNT(child_id) preferred over COUNT(\*) after LEFT JOIN?**

COUNT(child_id) ignores NULL values, while COUNT(\*) counts the NULL-extended parent row.

**Q8. What is NATURAL JOIN?**

It automatically joins using all identically named columns in both tables. It is risky because schema changes can alter its behaviour.

**Q9. Does JOIN order matter?**

For INNER JOINs, the planner can often reorder joins while preserving results. With OUTER JOINs, join order and grouping can affect semantics.

**Q10. Can we use aggregate functions with JOINs?**

Yes. JOINs can be combined with GROUP BY, HAVING, COUNT, SUM, AVG and other aggregate functions.

---

## Key Takeaways

- ON defines matching conditions; WHERE filters the resulting rows.
- ON vs WHERE is especially important with LEFT, RIGHT and FULL OUTER JOINs.
- Multiple conditions can be combined using AND and OR.
- NULL does not equal NULL; use IS NOT DISTINCT FROM for NULL-safe matching.
- JOINs can involve multiple tables.
- COUNT(child_id) is generally correct for counting child records after LEFT JOIN.
- USING is useful for simple equality joins with shared column names.
- NATURAL JOIN is risky in production.
- JOINs can be combined with aggregation, sorting and pagination.
- Understand row multiplication before applying DISTINCT or LIMIT.
