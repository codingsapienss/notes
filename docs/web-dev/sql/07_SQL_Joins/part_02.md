---
sidebar_label: "Types of SQL Joins"
sidebar_position: 1
---

# Types of SQL Joins

## 1. Introduction to JOIN Types

SQL provides different JOIN types depending on how you want to handle matching and non-matching rows between tables.

The major JOIN types in PostgreSQL are:

| JOIN type       | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| INNER JOIN      | Returns only matching rows                                            |
| LEFT JOIN       | Returns all rows from the left table and matching rows from the right |
| RIGHT JOIN      | Returns all rows from the right table and matching rows from the left |
| FULL OUTER JOIN | Returns all rows from both tables                                     |
| CROSS JOIN      | Returns every possible combination of rows                            |
| SELF JOIN       | Joins a table with itself                                             |

This chapter focuses on understanding each JOIN type and when to use it.

---

## 2. Sample Tables

Use these tables to understand JOIN behaviour.

### customers

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Priya         |
|           3 | Amit          |
|           4 | Neha          |

### orders

| order_id | customer_id | total_amount |
| -------: | ----------: | -----------: |
|      101 |           1 |         2500 |
|      102 |           2 |         5000 |
|      103 |           1 |         1500 |
|      104 |           5 |         3000 |

Notice:

- Rahul has two orders.
- Priya has one order.
- Amit and Neha have no orders.
- Order 104 references customer ID 5, which does not exist in the customers table.

The last row is possible in this illustration because the tables are assumed not to enforce a foreign key constraint between these columns.

### Sample table creation

```sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    total_amount NUMERIC(10, 2)
);
```

```sql
INSERT INTO customers VALUES
(1, 'Rahul'),
(2, 'Priya'),
(3, 'Amit'),
(4, 'Neha');

INSERT INTO orders VALUES
(101, 1, 2500),
(102, 2, 5000),
(103, 1, 1500),
(104, 5, 3000);
```

---

## 3. INNER JOIN

<badge color="success">Matching rows only</badge>

INNER JOIN returns rows where the join condition matches in both tables.

Rows without a matching record are excluded.

### Syntax

```sql
SELECT columns
FROM table1
INNER JOIN table2
    ON table1.column = table2.column;
```

### Example

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

### Result

| customer_id | customer_name | order_id | total_amount |
| ----------: | ------------- | -------: | -----------: |
|           1 | Rahul         |      101 |         2500 |
|           1 | Rahul         |      103 |         1500 |
|           2 | Priya         |      102 |         5000 |

### What happened?

- Rahul matched two orders.
- Priya matched one order.
- Amit and Neha were excluded because they have no orders.
- Order 104 was excluded because customer ID 5 does not exist in customers.

### When to use INNER JOIN

- Find customers who have placed orders.
- Find employees who belong to valid departments.
- Find products that belong to categories.
- Retrieve payments associated with existing orders.

**Important:** `JOIN` without specifying a type means `INNER JOIN` in PostgreSQL.

These are equivalent:

```sql
SELECT *
FROM customers
JOIN orders
    ON customers.customer_id = orders.customer_id;
```

```sql
SELECT *
FROM customers
INNER JOIN orders
    ON customers.customer_id = orders.customer_id;
```

---

## 4. LEFT JOIN / LEFT OUTER JOIN

<badge color="success">All left-side rows</badge>

LEFT JOIN returns:

- Every row from the left table.
- Matching rows from the right table.
- NULL values for right-table columns when no match exists.

### Syntax

```sql
SELECT columns
FROM table1
LEFT JOIN table2
    ON table1.column = table2.column;
```

### Example

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

### Result

| customer_id | customer_name | order_id | total_amount |
| ----------: | ------------- | -------: | -----------: |
|           1 | Rahul         |      101 |         2500 |
|           1 | Rahul         |      103 |         1500 |
|           2 | Priya         |      102 |         5000 |
|           3 | Amit          |     NULL |         NULL |
|           4 | Neha          |     NULL |         NULL |

### What happened?

- All four customers are returned.
- Rahul appears twice because he has two orders.
- Amit and Neha are included even though they have no orders.
- Order 104 is excluded because customers is the left table.

### Practical example: Find customers without orders

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

Result:

| customer_id | customer_name |
| ----------: | ------------- |
|           3 | Amit          |
|           4 | Neha          |

This is a common anti-join pattern.

### When to use LEFT JOIN

- Display all customers, including those without orders.
- Display all departments, including empty departments.
- Display all products, including products that have never been ordered.
- Find records in one table without matching records in another.

**Important:** LEFT JOIN preserves the left table's rows, not necessarily one row per left-table record. Matching multiple right-side rows can multiply the output.

---

## 5. RIGHT JOIN / RIGHT OUTER JOIN

<badge color="success">All right-side rows</badge>

RIGHT JOIN returns:

- Every row from the right table.
- Matching rows from the left table.
- NULL values for left-table columns when no match exists.

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
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
RIGHT JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

### Result

| customer_id | customer_name | order_id | total_amount |
| ----------: | ------------- | -------: | -----------: |
|           1 | Rahul         |      101 |         2500 |
|           2 | Priya         |      102 |         5000 |
|           1 | Rahul         |      103 |         1500 |
|        NULL | NULL          |      104 |         3000 |

### What happened?

- Every order is returned.
- Orders 101, 102, and 103 matched customers.
- Order 104 has no matching customer, so customer columns are NULL.
- Amit and Neha are excluded because they have no orders.

### When to use RIGHT JOIN

Use it when you want to preserve every row from the right-side table.

However, RIGHT JOIN is less common because the same query can usually be written using LEFT JOIN by reversing the table order.

Equivalent LEFT JOIN:

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM orders AS o
LEFT JOIN customers AS c
    ON o.customer_id = c.customer_id;
```

**Best practice:** Prefer LEFT JOIN when it makes the query easier to understand. RIGHT JOIN is valid SQL, not an incorrect operation.

---

## 6. FULL OUTER JOIN

<badge color="success">All rows from both sides</badge>

FULL OUTER JOIN returns:

- Matching rows from both tables.
- Unmatched rows from the left table.
- Unmatched rows from the right table.

Unmatched columns from the opposite table contain NULL.

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
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
FULL OUTER JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

### Result

| customer_id | customer_name | order_id | total_amount |
| ----------: | ------------- | -------: | -----------: |
|           1 | Rahul         |      101 |         2500 |
|           1 | Rahul         |      103 |         1500 |
|           2 | Priya         |      102 |         5000 |
|           3 | Amit          |     NULL |         NULL |
|           4 | Neha          |     NULL |         NULL |
|        NULL | NULL          |      104 |         3000 |

### What happened?

- Matching customers and orders are returned.
- Customers without orders are returned.
- Orders without matching customers are returned.

### When to use FULL OUTER JOIN

- Compare records between two datasets.
- Reconcile imported and existing records.
- Find missing relationships on either side.
- Compare two reporting datasets.

### Practical example: Identify unmatched records

```sql
SELECT
    c.customer_id,
    c.customer_name,
    o.order_id,
    o.customer_id AS order_customer_id
FROM customers AS c
FULL OUTER JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE c.customer_id IS NULL
   OR o.order_id IS NULL;
```

This returns records that exist on only one side of the relationship.

---

## 7. CROSS JOIN

<badge color="info">Every possible combination</badge>

CROSS JOIN returns the Cartesian product of two tables.

It does not require an ON condition.

### Syntax

```sql
SELECT *
FROM table1
CROSS JOIN table2;
```

### Example

**colors**

| color |
| ----- |
| Red   |
| Blue  |

**sizes**

| size   |
| ------ |
| Small  |
| Medium |
| Large  |

```sql
SELECT
    c.color,
    s.size
FROM colors AS c
CROSS JOIN sizes AS s;
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

If table A contains M rows and table B contains N rows:

\[
\text{Result rows} = M \times N
\]

### Practical use cases

- Generate all product colour-size combinations.
- Create calendar and category combinations.
- Generate test data.
- Build complete reporting matrices.

**Warning:** CROSS JOIN can produce a very large result set. For example, joining 10,000 rows with 5,000 rows produces 50 million combinations.

---

## 8. SELF JOIN

A SELF JOIN joins a table with itself.

It is useful when records in a table refer to other records in the same table.

### Example: Employee and manager

**employees**

| employee_id | first_name | manager_id |
| ----------: | ---------- | ---------: |
|           1 | Rahul      |       NULL |
|           2 | Amit       |          1 |
|           3 | Priya      |          1 |
|           4 | Neha       |          2 |

Query:

```sql
SELECT
    e.employee_id,
    e.first_name AS employee_name,
    m.first_name AS manager_name
FROM employees AS e
LEFT JOIN employees AS m
    ON e.manager_id = m.employee_id;
```

### Result

| employee_id | employee_name | manager_name |
| ----------: | ------------- | ------------ |
|           1 | Rahul         | NULL         |
|           2 | Amit          | Rahul        |
|           3 | Priya         | Rahul        |
|           4 | Neha          | Amit         |

### Other use cases

- Employee-manager relationships.
- Parent-child category structures.
- Referral relationships.
- Related products.
- Hierarchical organizational structures.

A self JOIN is not a separate JOIN operator. It is a normal JOIN where both table references point to the same table.

---

## 9. JOIN Type Comparison

| JOIN type       | Left unmatched rows  | Right unmatched rows | Matching rows        |
| --------------- | -------------------- | -------------------- | -------------------- |
| INNER JOIN      | Excluded             | Excluded             | Included             |
| LEFT JOIN       | Included             | Excluded             | Included             |
| RIGHT JOIN      | Excluded             | Included             | Included             |
| FULL OUTER JOIN | Included             | Included             | Included             |
| CROSS JOIN      | Not applicable       | Not applicable       | All combinations     |
| SELF JOIN       | Depends on JOIN type | Depends on JOIN type | Depends on condition |

### Visual understanding

<grid columns={2} gap={3}>
  <grid-item>
    <box border radius="lg" padding={2} gap={1}>
      **INNER JOIN**
      <svg viewBox="0 0 160 90" width="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="62" cy="45" r="32" fill="#60A5FA" fillOpacity="0.65"/>
        <circle cx="98" cy="45" r="32" fill="#F59E0B" fillOpacity="0.65"/>
        <path d="M80 16 A32 32 0 0 0 80 74 A32 32 0 0 0 80 16" fill="#16A34A" fillOpacity="0.85"/>
      </svg>
      <text color="secondary" size="xs">Only the intersection.</text>
    </box>
  </grid-item>
  <grid-item>
    <box border radius="lg" padding={2} gap={1}>
      **LEFT JOIN**
      <svg viewBox="0 0 160 90" width="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="62" cy="45" r="32" fill="#16A34A" fillOpacity="0.85"/>
        <circle cx="98" cy="45" r="32" fill="#F59E0B" fillOpacity="0.65"/>
      </svg>
      <text color="secondary" size="xs">Entire left circle.</text>
    </box>
  </grid-item>
  <grid-item>
    <box border radius="lg" padding={2} gap={1}>
      **RIGHT JOIN**
      <svg viewBox="0 0 160 90" width="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="62" cy="45" r="32" fill="#60A5FA" fillOpacity="0.65"/>
        <circle cx="98" cy="45" r="32" fill="#16A34A" fillOpacity="0.85"/>
      </svg>
      <text color="secondary" size="xs">Entire right circle.</text>
    </box>
  </grid-item>
  <grid-item>
    <box border radius="lg" padding={2} gap={1}>
      **FULL OUTER JOIN**
      <svg viewBox="0 0 160 90" width="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="62" cy="45" r="32" fill="#16A34A" fillOpacity="0.85"/>
        <circle cx="98" cy="45" r="32" fill="#16A34A" fillOpacity="0.85"/>
      </svg>
      <text color="secondary" size="xs">Both circles entirely.</text>
    </box>
  </grid-item>
</grid>

The diagrams illustrate which portions are included. Actual query results depend on the matching condition and row cardinality.

---

## 10. Anti JOIN — Find Records Without Matches

An anti-join returns rows from one table that have no matching rows in another table.

It is commonly implemented using LEFT JOIN with IS NULL or NOT EXISTS.

### Method 1: LEFT JOIN + IS NULL

Find customers without orders:

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

### Method 2: NOT EXISTS

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

Both queries return customers without matching orders.

**Important:** PostgreSQL does not have a separate `ANTI JOIN` keyword. Anti-join describes the query operation, which PostgreSQL may implement using an anti-join execution plan.

### When to use anti-joins

- Find customers who never placed orders.
- Find products that have never been purchased.
- Find employees without assigned projects.
- Find records missing from another dataset.

---

## 11. Semi JOIN — Find Records With Matches

A semi-join returns rows from one table when at least one matching row exists in another table.

It is commonly implemented using EXISTS.

### Example: Customers who have placed orders

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

Result:

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Priya         |

Rahul appears once even though he has multiple orders.

### EXISTS vs INNER JOIN

INNER JOIN:

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

Rahul appears twice because he has two matching orders.

EXISTS:

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

Rahul appears once because EXISTS checks whether a match exists rather than returning each matching order.

**Important:** Use EXISTS when you only need to determine whether related records exist. Use JOIN when you need columns from the related table.

---

## 12. Important Difference: JOIN vs UNION

These operations solve different problems.

### JOIN

Combines columns from related rows.

```sql
SELECT
    c.customer_name,
    o.order_id
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

Result combines customer and order columns horizontally.

### UNION

Combines compatible query results vertically.

```sql
SELECT customer_name AS name
FROM customers

UNION

SELECT first_name AS name
FROM employees;
```

Result combines names from both query results into one column.

| JOIN                               | UNION                                       |
| ---------------------------------- | ------------------------------------------- |
| Combines columns from related rows | Combines rows from query results            |
| Usually uses ON                    | Requires compatible column counts and types |
| Used for relational data retrieval | Used to combine result sets                 |

---

## 13. Common JOIN Mistakes

| Mistake                                            | Explanation                                                    |
| -------------------------------------------------- | -------------------------------------------------------------- |
| Assuming LEFT JOIN returns one row per left record | Multiple right-side matches multiply rows                      |
| Confusing LEFT and RIGHT JOIN                      | They preserve different sides                                  |
| Using INNER JOIN when unmatched rows matter        | Unmatched records disappear                                    |
| Forgetting that unmatched columns become NULL      | Outer JOINs introduce NULL values                              |
| Using WHERE incorrectly with OUTER JOIN            | Can unintentionally remove preserved rows                      |
| Using DISTINCT to hide row multiplication          | May conceal an incorrect query design                          |
| Using COUNT(\*) for child counts                   | Can count unmatched parent rows                                |
| Using CROSS JOIN without considering row counts    | Can create huge result sets                                    |
| Assuming SELF JOIN is a separate keyword           | It is a normal JOIN against the same table                     |
| Using NOT IN with nullable subquery results        | NULL can make the condition UNKNOWN; NOT EXISTS is often safer |

---

## 14. Practice Exercises

Use the TechBazaar database.

1. Display customers who have placed orders using INNER JOIN.
2. Display all customers, including customers without orders, using LEFT JOIN.
3. Display all orders, including orders without matching customers, using RIGHT JOIN.
4. Display all customers and all orders using FULL OUTER JOIN.
5. Find customers who have never placed orders.
6. Find customers who have placed at least one order using EXISTS.
7. Compare EXISTS with INNER JOIN for customers having multiple orders.
8. Display employee names alongside manager names using SELF JOIN.
9. Generate all possible combinations of two sample tables using CROSS JOIN.
10. Count orders for every customer using LEFT JOIN.
11. Calculate total spending for every customer, including customers with zero orders.
12. Find products that have never appeared in order_items.
13. Find departments that currently have no employees.
14. Identify orders with no matching customer.
15. Compare JOIN and UNION using customers and employees.
16. Write an anti-join using LEFT JOIN and IS NULL.
17. Write the equivalent anti-join using NOT EXISTS.
18. Explain why Rahul appears multiple times in the customer-order INNER JOIN.

---

## 15. Interview Questions

**Q1. What is INNER JOIN?**

Returns only rows that satisfy the matching condition in both tables.

**Q2. What is LEFT JOIN?**

Returns every row from the left table and matching rows from the right table. Unmatched right-side columns contain NULL.

**Q3. What is RIGHT JOIN?**

Returns every row from the right table and matching rows from the left table.

**Q4. What is FULL OUTER JOIN?**

Returns matching and unmatched rows from both tables.

**Q5. What is the difference between LEFT JOIN and INNER JOIN?**

INNER JOIN excludes unmatched rows. LEFT JOIN preserves all rows from the left table.

**Q6. What is CROSS JOIN?**

It returns every possible combination of rows from two tables.

**Q7. What is SELF JOIN?**

It joins a table with itself, commonly used for hierarchical relationships.

**Q8. What is an anti-join?**

It returns rows from one table that have no matching rows in another table.

**Q9. What is a semi-join?**

It returns rows from one table when a matching row exists in another table, commonly implemented using EXISTS.

**Q10. What is the difference between EXISTS and INNER JOIN?**

EXISTS checks whether matching rows exist without multiplying the outer rows. INNER JOIN returns matching row combinations.

**Q11. What is the difference between JOIN and UNION?**

JOIN combines related columns horizontally. UNION combines compatible query results vertically.

**Q12. Can RIGHT JOIN be rewritten as LEFT JOIN?**

Yes. Reverse the table order and use LEFT JOIN.

**Q13. Does FULL OUTER JOIN return duplicate rows?**

It can return multiple rows when a row matches multiple rows on the opposite side. This is a consequence of the matching relationship.

**Q14. Does PostgreSQL have explicit SEMI JOIN and ANTI JOIN keywords?**

No. They are logical join operations commonly expressed using EXISTS and NOT EXISTS.

---

## Key Takeaways

- INNER JOIN returns only matching rows.
- LEFT JOIN preserves every row from the left table.
- RIGHT JOIN preserves every row from the right table.
- FULL OUTER JOIN preserves rows from both tables.
- CROSS JOIN produces every possible combination.
- SELF JOIN joins a table with itself.
- Anti-joins find records without matching records.
- Semi-joins find records with at least one matching record.
- EXISTS is useful when checking whether related rows exist without multiplying results.
- JOIN combines columns; UNION combines result rows.
- Choose a JOIN based on which unmatched records must remain in the result.
