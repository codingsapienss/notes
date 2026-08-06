---
sidebar_label: "Understanding SQL Joins"
sidebar_position: 1
---

# Understanding SQL Joins

## 1. Introduction to SQL Joins

A JOIN combines rows from two or more tables based on a related column or a specified condition.

In relational databases, data is usually distributed across multiple tables to reduce duplication and maintain relationships.

For example, TechBazaar stores employee and department information separately.

**departments**

| department_id | department_name |
| ------------: | --------------- |
|             1 | Engineering     |
|             2 | Sales           |
|             3 | Marketing       |
|             4 | HR              |

**employees**

| employee_id | first_name | department_id |
| ----------: | ---------- | ------------: |
|         101 | Rahul      |             1 |
|         102 | Amit       |             2 |
|         103 | Priya      |             1 |
|         104 | Neha       |             3 |
|         105 | Karan      |          NULL |

Suppose you want to display each employee along with their department name.

The employee table contains `department_id`, but the department name exists in the departments table.

A JOIN combines these related records.

---

## 2. Why Do We Need JOINs?

Consider two separate tables:

**customers**

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Priya         |
|           3 | Amit          |

**orders**

| order_id | customer_id | total_amount |
| -------: | ----------: | -----------: |
|      101 |           1 |         2500 |
|      102 |           2 |         5000 |
|      103 |           1 |         1500 |

If you want to display order details along with customer names, you need information from both tables.

Without JOIN, you would need separate queries and application-side matching.

With JOIN:

```sql
SELECT
    orders.order_id,
    customers.customer_name,
    orders.total_amount
FROM orders
INNER JOIN customers
    ON orders.customer_id = customers.customer_id;
```

Result:

| order_id | customer_name | total_amount |
| -------: | ------------- | -----------: |
|      101 | Rahul         |         2500 |
|      102 | Priya         |         5000 |
|      103 | Rahul         |         1500 |

The JOIN combines rows using the matching `customer_id`.

---

## 3. Basic JOIN Syntax

```sql
SELECT
    table1.column1,
    table2.column2
FROM table1
JOIN table2
    ON table1.common_column = table2.common_column;
```

Components:

| Clause | Purpose                            |
| ------ | ---------------------------------- |
| SELECT | Specifies the columns to return    |
| FROM   | Specifies the primary table        |
| JOIN   | Specifies another table to combine |
| ON     | Defines the matching condition     |

**Important:** JOIN does not require the matching columns to have identical names. They must have compatible data types and a meaningful comparison condition.

---

## 4. Understanding the ON Condition

The ON condition determines which rows match between tables.

Example:

```sql
SELECT
    e.employee_id,
    e.first_name,
    d.department_name
FROM employees AS e
JOIN departments AS d
    ON e.department_id = d.department_id;
```

Here:

```sql
ON e.department_id = d.department_id
```

means PostgreSQL matches employee rows with department rows having the same department ID.

### What happens when values match?

Employee:

| employee_id | first_name | department_id |
| ----------: | ---------- | ------------: |
|         101 | Rahul      |             1 |
|         102 | Amit       |             2 |

Department:

| department_id | department_name |
| ------------: | --------------- |
|             1 | Engineering     |
|             2 | Sales           |

Result:

| employee_id | first_name | department_name |
| ----------: | ---------- | --------------- |
|         101 | Rahul      | Engineering     |
|         102 | Amit       | Sales           |

### What happens when no match exists?

With an INNER JOIN, unmatched rows are excluded.

Other JOIN types handle unmatched rows differently. These are covered in Part 7B.

---

## 5. Primary Key and Foreign Key Relationships

JOINs commonly use primary key and foreign key relationships.

Example:

```sql
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL
);
```

```sql
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(department_id)
);
```

Relationship:

```text
departments
    department_id (PRIMARY KEY)
            |
            |
            | referenced by
            |
employees
    department_id (FOREIGN KEY)
```

The employee's `department_id` references the department's `department_id`.

This relationship makes it possible to combine employee and department information.

**Important:** A JOIN does not require a foreign key constraint. You can JOIN any compatible columns using an appropriate condition. Foreign keys enforce referential integrity; JOINs retrieve related data.

---

## 6. Table Aliases in JOINs

Aliases give tables shorter names inside queries.

Instead of:

```sql
SELECT
    employees.employee_id,
    employees.first_name,
    departments.department_name
FROM employees
INNER JOIN departments
    ON employees.department_id = departments.department_id;
```

Use:

```sql
SELECT
    e.employee_id,
    e.first_name,
    d.department_name
FROM employees AS e
INNER JOIN departments AS d
    ON e.department_id = d.department_id;
```

Advantages:

- Shorter queries.
- Easier to read.
- Useful when joining multiple tables.
- Essential when the same table appears more than once.

`AS` is optional for table aliases:

```sql
FROM employees e
JOIN departments d
```

Both forms are valid.

---

## 7. Joining More Than Two Tables

A query can JOIN multiple tables.

Consider TechBazaar's order-related tables:

```text
customers
    |
    | customer_id
    |
orders
    |
    | order_id
    |
order_items
    |
    | product_id
    |
products
```

Suppose you want:

- Customer name.
- Order ID.
- Product name.
- Quantity.

Query:

```sql
SELECT
    c.customer_name,
    o.order_id,
    p.product_name,
    oi.quantity
FROM customers AS c
INNER JOIN orders AS o
    ON c.customer_id = o.customer_id
INNER JOIN order_items AS oi
    ON o.order_id = oi.order_id
INNER JOIN products AS p
    ON oi.product_id = p.product_id;
```

This combines four tables.

Example output:

| customer_name | order_id | product_name | quantity |
| ------------- | -------: | ------------ | -------: |
| Rahul         |      101 | Laptop       |        1 |
| Rahul         |      101 | Mouse        |        2 |
| Priya         |      102 | Keyboard     |        1 |

Each order can produce multiple rows because an order may contain multiple products.

---

## 8. JOINs and Duplicate Rows

One of the most important JOIN concepts is row multiplication.

Consider:

**customers**

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Priya         |

**orders**

| order_id | customer_id |
| -------: | ----------: |
|      101 |           1 |
|      102 |           1 |
|      103 |           2 |

Query:

```sql
SELECT
    c.customer_name,
    o.order_id
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

Result:

| customer_name | order_id |
| ------------- | -------: |
| Rahul         |      101 |
| Rahul         |      102 |
| Priya         |      103 |

Rahul appears twice because he has two orders.

This is correct behaviour, not necessarily a duplicate-data problem.

### Why does this happen?

The relationship is one-to-many:

```text
Rahul
  |
  |------ Order 101
  |
  |------ Order 102
```

One customer can have multiple orders.

### Important rule

A JOIN returns matching row combinations, not automatically one row per entity.

Do not use DISTINCT blindly to remove repeated names. First understand the relationship and the intended result.

---

## 9. JOIN and Aggregation

JOINs are commonly combined with aggregate functions.

### Example: Count orders per customer

```sql
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders
FROM customers AS c
LEFT JOIN orders AS o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

Possible result:

| customer_id | customer_name | total_orders |
| ----------: | ------------- | -----------: |
|           1 | Rahul         |            2 |
|           2 | Priya         |            1 |
|           3 | Amit          |            0 |

This example uses LEFT JOIN so that customers without orders can also appear.

The different JOIN types and their behaviour are covered in Part 7B.

### Important: COUNT(\*) vs COUNT(column)

When using an outer JOIN, COUNT(\*) and COUNT(child_column) can produce different results.

For a customer without orders, the joined result still contains one row with NULL order columns.

Therefore:

```sql
COUNT(*)
```

returns 1 for that customer.

But:

```sql
COUNT(o.order_id)
```

returns 0 because NULL is ignored.

For counting matching child records, COUNT(child_primary_key) is generally the correct choice.

---

## 10. JOIN with WHERE

WHERE filters the result rows after the JOIN's matching conditions are applied.

Example:

```sql
SELECT
    e.employee_id,
    e.first_name,
    d.department_name
FROM employees AS e
INNER JOIN departments AS d
    ON e.department_id = d.department_id
WHERE d.department_name = 'Engineering';
```

This returns employees belonging to Engineering.

### Difference between ON and WHERE

- ON defines how tables match.
- WHERE filters rows from the query result.

For INNER JOINs, moving a simple filtering condition between ON and WHERE often produces equivalent results.

For OUTER JOINs, the placement can change the result. This is covered in Part 7C.

---

## 11. JOIN with ORDER BY

You can sort joined results using columns from either table.

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id
ORDER BY o.total_amount DESC;
```

This displays customer orders from highest to lowest amount.

---

## 12. JOIN with LIMIT

You can limit the number of rows returned by a JOIN.

```sql
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id
ORDER BY o.total_amount DESC
LIMIT 5;
```

This returns the five highest-value matching orders.

Use a deterministic ORDER BY, including a unique tie-breaker, when predictable pagination or repeatable results are required.

---

## 13. JOIN Does Not Automatically Mean a Foreign Key Relationship

Consider:

```sql
SELECT *
FROM employees AS e
JOIN orders AS o
    ON e.employee_id = o.customer_id;
```

PostgreSQL allows this query if the compared columns have compatible types.

But the relationship may be logically incorrect.

A valid JOIN requires:

- Compatible values.
- A meaningful relationship.
- The correct matching condition.

The database cannot always determine whether your business logic is correct.

---

## 14. CROSS JOIN — Cartesian Product

A CROSS JOIN combines every row from the first table with every row from the second table.

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

Query:

```sql
SELECT
    c.color,
    s.size
FROM colors AS c
CROSS JOIN sizes AS s;
```

Result:

| color | size   |
| ----- | ------ |
| Red   | Small  |
| Red   | Medium |
| Red   | Large  |
| Blue  | Small  |
| Blue  | Medium |
| Blue  | Large  |

Total rows:

\[
2 \times 3 = 6
\]

### General formula

If:

- Table A contains M rows.
- Table B contains N rows.

Then:

\[
\text{CROSS JOIN rows} = M \times N
\]

### Practical use cases

- Generate product variations.
- Create combinations of dates and categories.
- Generate test data.
- Build a complete reporting matrix.

**Warning:** A CROSS JOIN can generate a very large result set. Use it intentionally.

---

## 15. Self JOIN — Join a Table With Itself

A self JOIN combines a table with another instance of the same table.

It is useful when records in a table reference other records in that same table.

Example: Employees and their managers.

**employees**

| employee_id | first_name | manager_id |
| ----------: | ---------- | ---------: |
|           1 | Rahul      |       NULL |
|           2 | Amit       |          1 |
|           3 | Priya      |          1 |
|           4 | Neha       |          2 |

Here:

- Rahul has no manager.
- Amit reports to Rahul.
- Priya reports to Rahul.
- Neha reports to Amit.

### Query

```sql
SELECT
    e.employee_id,
    e.first_name AS employee_name,
    m.first_name AS manager_name
FROM employees AS e
LEFT JOIN employees AS m
    ON e.manager_id = m.employee_id;
```

Result:

| employee_id | employee_name | manager_name |
| ----------: | ------------- | ------------ |
|           1 | Rahul         | NULL         |
|           2 | Amit          | Rahul        |
|           3 | Priya         | Rahul        |
|           4 | Neha          | Amit         |

### Why two aliases?

- `e` represents the employee.
- `m` represents the manager.

Both aliases refer to the same physical table but represent different roles in the query.

**Note:** This example uses LEFT JOIN so employees without managers are also included.

---

## 16. JOIN Execution and Performance Basics

JOINs can involve significant work, especially when tables contain millions of rows.

PostgreSQL's query planner chooses an execution strategy based on available statistics, indexes, estimated row counts, and costs.

Common join algorithms:

| Algorithm        | Basic idea                                                      |
| ---------------- | --------------------------------------------------------------- |
| Nested Loop Join | For each row from one input, searches the other input           |
| Hash Join        | Builds a hash table from one input and probes it with the other |
| Merge Join       | Uses sorted inputs to match rows                                |

You do not normally select the algorithm manually. PostgreSQL's query planner chooses one.

### Inspect a JOIN execution plan

```sql
EXPLAIN
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

To execute the query and inspect actual runtime statistics:

```sql
EXPLAIN ANALYZE
SELECT
    c.customer_name,
    o.order_id,
    o.total_amount
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

`EXPLAIN ANALYZE` actually executes the query.

### Important indexing considerations

Suppose you frequently join:

```sql
customers.customer_id = orders.customer_id
```

Typical indexes:

- `customers.customer_id` is indexed because it is a primary key.
- `orders.customer_id` may need an index for efficient lookup patterns.

PostgreSQL automatically creates an index for a primary key, but it does not automatically create an index on the referencing foreign key column.

Example:

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

Whether an index improves a particular JOIN depends on the query plan and data distribution.

---

## 17. Common JOIN Mistakes

| Mistake                                                | Explanation                                             |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Forgetting the ON condition                            | Can accidentally create a Cartesian product             |
| Using incorrect matching columns                       | Produces logically incorrect results                    |
| Assuming one row per customer                          | One-to-many relationships create multiple rows          |
| Using DISTINCT to hide duplicates                      | May hide an incorrect understanding of the relationship |
| Using COUNT(\*) for child counts with an outer JOIN    | Can count the unmatched parent row                      |
| Ignoring NULL foreign keys                             | Such rows do not match using ordinary equality          |
| Joining without understanding cardinality              | Can multiply rows and inflate aggregates                |
| Assuming foreign keys are required for JOINs           | JOINs work without FK constraints                       |
| Assuming PostgreSQL automatically indexes foreign keys | Referencing columns are not automatically indexed       |
| Ignoring query plans                                   | Expensive JOINs can go unnoticed                        |

---

## 18. Practice Exercises

Use the TechBazaar database.

1. Display all employees with their department names.
2. Display all orders with customer names.
3. Display product names with their category names.
4. Display order IDs, product names, and quantities using orders, order_items, and products.
5. Display customer names with their order amounts.
6. Count the total orders placed by each customer.
7. Calculate total revenue generated by each customer.
8. Calculate the number of employees in each department.
9. Display employee names alongside their manager names using a self JOIN.
10. Display all combinations of two small test tables using CROSS JOIN.
11. Sort joined order results by total amount.
12. Return the five highest-value orders with customer names.
13. Compare the row counts before and after joining customers with orders.
14. Identify why one customer appears multiple times in an order JOIN.
15. Use COUNT(o.order_id) and COUNT(\*) in a LEFT JOIN and compare their results.
16. Inspect a JOIN query using EXPLAIN.
17. Inspect actual execution statistics using EXPLAIN ANALYZE.
18. Create an index on orders.customer_id and inspect whether the query plan changes.

---

## 19. Interview Questions

**Q1. What is a JOIN in SQL?**

A JOIN combines rows from multiple tables based on a specified matching condition.

**Q2. Why do we use JOINs?**

To retrieve related information stored across multiple relational tables without manually combining separate query results.

**Q3. What is the purpose of ON?**

ON specifies the condition used to match rows between joined tables.

**Q4. Does JOIN require a foreign key?**

No. JOIN can compare any compatible columns. A foreign key is used to enforce referential integrity.

**Q5. Why can JOINs return duplicate-looking rows?**

Because one row from a table may match multiple rows in another table. This is expected in one-to-many relationships.

**Q6. What is a CROSS JOIN?**

A CROSS JOIN produces every possible combination of rows from two tables.

**Q7. What is a self JOIN?**

A self JOIN joins a table with another instance of itself, often used for hierarchical relationships such as employees and managers.

**Q8. What is the difference between ON and WHERE?**

ON specifies matching conditions. WHERE filters the resulting rows. Their placement can affect OUTER JOIN behaviour.

**Q9. Can you JOIN more than two tables?**

Yes. You can chain multiple JOIN operations in one query.

**Q10. What is a Cartesian product?**

It is the combination of every row from one table with every row from another table.

**Q11. Why is COUNT(child_table.id) useful with LEFT JOIN?**

It counts only matching child rows because COUNT(column) ignores NULL. COUNT(\*) also counts the unmatched parent row.

**Q12. Does PostgreSQL automatically create indexes on foreign key columns?**

No. Primary keys and unique constraints create indexes automatically, but referencing foreign key columns do not automatically receive indexes.

**Q13. What are Nested Loop, Hash, and Merge Joins?**

They are PostgreSQL execution algorithms used by the query planner to combine rows from two inputs.

**Q14. How can you analyze JOIN performance?**

Use EXPLAIN and EXPLAIN ANALYZE to inspect the execution plan and actual execution statistics.

---

## Key Takeaways

- JOIN combines related rows from multiple tables.
- ON defines the matching condition.
- Primary key and foreign key relationships are common JOIN foundations.
- Table aliases improve readability.
- JOINs can involve two or more tables.
- One-to-many relationships naturally produce multiple result rows for one parent.
- CROSS JOIN generates every possible row combination.
- Self JOIN combines a table with itself.
- JOINs can be combined with WHERE, GROUP BY, HAVING, ORDER BY, and aggregate functions.
- COUNT(child_primary_key) is useful for counting matching child records in an OUTER JOIN.
- PostgreSQL chooses a JOIN execution algorithm based on its query plan.
- Use EXPLAIN ANALYZE to investigate actual JOIN performance.
