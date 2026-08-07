---
sidebar_label: "Subquery Fundamentals"
sidebar_position: 1
---

# Subquery Fundamentals

## 1. What is a Subquery?

A **subquery** is a SQL query written inside another SQL query.

The outer query uses the result of the inner query to perform further operations.

Subqueries are also called:

- Inner queries
- Nested queries
- Inner SELECT statements

### Basic syntax

```sql
SELECT column_name
FROM table_name
WHERE column_name = (
    SELECT column_name
    FROM another_table
);
```

The inner query executes as part of the outer query.

### Example: Employees earning more than the company average salary

```sql
SELECT
    employee_id,
    employee_name,
    salary
FROM employees
WHERE salary > (
    SELECT AVG(salary)
    FROM employees
);
```

**How it works:**

1. Inner query calculates the average salary.
2. Outer query compares each employee's salary against that average.
3. Employees earning more than the average are returned.

The inner query returns a single value, so it can be used with `>`.

---

## 2. Why Do We Need Subqueries?

Subqueries help when a query depends on the result of another query.

Common use cases:

- Finding employees earning above average salary.
- Finding products priced above the average product price.
- Finding customers who have placed orders.
- Finding orders with amounts greater than a specific threshold.
- Finding the highest-paid employee.
- Filtering records based on aggregate calculations.

Without subqueries, some of these problems require more complicated JOINs or CTEs.

---

## 3. How Subqueries Execute

Consider:

```sql
SELECT
    product_id,
    product_name,
    price
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

Conceptually:

**Step 1 — Inner query**

```sql
SELECT AVG(price)
FROM products;
```

Suppose the result is:

|  avg |
| ---: |
| 1500 |

**Step 2 — Outer query**

```sql
SELECT
    product_id,
    product_name,
    price
FROM products
WHERE price > 1500;
```

The final result contains products priced above 1500.

**Important:** This is a conceptual execution explanation. PostgreSQL's query optimizer may transform the query internally rather than literally executing the inner query first.

---

## 4. Types of Subqueries Based on Return Values

Subqueries can return different types of results.

| Type                     | Result                                | Example                   |
| ------------------------ | ------------------------------------- | ------------------------- |
| Scalar subquery          | One value                             | Average salary            |
| Single-row subquery      | One row, potentially multiple columns | Highest-paid employee     |
| Multiple-row subquery    | Multiple rows                         | All active department IDs |
| Multiple-column subquery | Multiple columns                      | Employee ID and salary    |

The expected result determines which operators can be used.

### 4.1 Scalar subquery

Returns exactly one column and at most one row.

```sql
SELECT
    product_name,
    price
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

If a scalar subquery returns:

- One row: its value is used.
- Zero rows: its result is NULL.
- More than one row: PostgreSQL raises an error.

### 4.2 Single-row, multiple-column subquery

Example:

```sql
SELECT
    employee_id,
    employee_name,
    salary
FROM employees
WHERE (salary, department_id) = (
    SELECT
        MAX(salary),
        department_id
    FROM employees
    WHERE employee_id = 101
);
```

This compares two values as a row expression.

The subquery must return at most one row, and the number and types of compared columns must be compatible.

### 4.3 Multiple-row subquery

Example:

```sql
SELECT *
FROM employees
WHERE department_id IN (
    SELECT department_id
    FROM departments
);
```

The inner query may return several department IDs.

`IN` checks whether the outer value matches any value returned by the subquery.

### 4.4 Multiple-column subquery

Example:

```sql
SELECT
    employee_id,
    salary,
    department_id
FROM employees
WHERE (salary, department_id) IN (
    SELECT
        MAX(salary),
        department_id
    FROM employees
    GROUP BY department_id
);
```

This compares the pair `(salary, department_id)` against pairs returned by the subquery.

---

## 5. Subqueries in WHERE Clause

The WHERE clause is one of the most common places to use subqueries.

### Example 1: Products above average price

```sql
SELECT
    product_id,
    product_name,
    price
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

### Example 2: Employees in a particular department

```sql
SELECT *
FROM employees
WHERE department_id = (
    SELECT department_id
    FROM departments
    WHERE department_name = 'Sales'
);
```

This assumes the department name identifies at most one department.

If multiple departments can have the same name, use `IN` or enforce uniqueness.

### Example 3: Customers who have placed orders

```sql
SELECT *
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
);
```

### Example 4: Orders above average order amount

```sql
SELECT *
FROM orders
WHERE total_amount > (
    SELECT AVG(total_amount)
    FROM orders
);
```

---

## 6. Subqueries in SELECT Clause

A subquery can also appear inside the SELECT list.

It is commonly used to calculate an additional value alongside each result row.

### Example: Show company-wide average salary alongside employees

```sql
SELECT
    employee_id,
    employee_name,
    salary,

    (
        SELECT AVG(salary)
        FROM employees
    ) AS company_avg_salary

FROM employees;
```

Every employee row includes the same company-wide average.

### Example: Show total orders for each customer

```sql
SELECT
    customer_id,
    customer_name,

    (
        SELECT COUNT(*)
        FROM orders
        WHERE orders.customer_id = customers.customer_id
    ) AS total_orders

FROM customers;
```

This is a correlated subquery because the inner query references the outer query's `customers.customer_id`.

Correlated subqueries are covered in Part 9C.

---

## 7. Subqueries in FROM Clause

A subquery in the FROM clause acts as a derived table.

A derived table is a temporary result set available to the outer query.

### Example: Calculate average customer spending

```sql
SELECT
    customer_id,
    total_spent
FROM (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS customer_summary
WHERE total_spent > 10000;
```

**How it works:**

1. Inner query calculates spending per customer.
2. Its result becomes a derived table named `customer_summary`.
3. Outer query filters customers spending more than 10000.

**Important:** A subquery used as a FROM item must have an alias in PostgreSQL.

---

## 8. Subqueries in HAVING Clause

Subqueries can also be used in HAVING to compare group-level aggregates against another calculated value.

### Example: Departments whose average salary is above company average

```sql
SELECT
    department_id,
    AVG(salary) AS avg_department_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) > (
    SELECT AVG(salary)
    FROM employees
);
```

**How it works:**

1. Inner query calculates company-wide average salary.
2. Outer query groups employees by department.
3. HAVING retains departments whose average salary is higher.

---

## 9. Subqueries vs JOINs

Both can solve overlapping problems, but they express different query requirements.

### Using a subquery

Find employees belonging to the Sales department:

```sql
SELECT *
FROM employees
WHERE department_id = (
    SELECT department_id
    FROM departments
    WHERE department_name = 'Sales'
);
```

### Using a JOIN

```sql
SELECT
    e.*
FROM employees AS e
JOIN departments AS d
    ON e.department_id = d.department_id
WHERE d.department_name = 'Sales';
```

### Comparison

| Subquery                                        | JOIN                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| Uses the result of another query                | Combines rows from tables                      |
| Useful for filtering based on calculated values | Useful for retrieving related columns          |
| Can express existence checks                    | Can produce multiple matching row combinations |
| Can be scalar or multi-row                      | Combines relational datasets                   |

Neither is automatically faster.

PostgreSQL's optimizer may transform equivalent queries into similar execution plans. Choose based on correctness, clarity and actual performance measurements.

---

## 10. Subqueries vs CTEs

A CTE provides a named query result using `WITH`.

### Subquery

```sql
SELECT
    customer_id,
    total_spent
FROM (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
) AS summary
WHERE total_spent > 10000;
```

### CTE

```sql
WITH customer_summary AS (
    SELECT
        customer_id,
        SUM(total_amount) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT
    customer_id,
    total_spent
FROM customer_summary
WHERE total_spent > 10000;
```

### Comparison

| Subquery                                 | CTE                                     |
| ---------------------------------------- | --------------------------------------- |
| Written inside another query             | Defined using WITH                      |
| Useful for compact nested logic          | Useful for named, multi-step logic      |
| Can be nested                            | Can define multiple named query results |
| Can be harder to read when deeply nested | Often improves readability              |

CTEs are covered in detail in Part 10.

---

## 11. Important Rules and Common Mistakes

### Rule 1: Scalar subqueries must return at most one row

Incorrect when multiple departments match:

```sql
SELECT *
FROM employees
WHERE department_id = (
    SELECT department_id
    FROM departments
    WHERE department_name LIKE '%Sales%'
);
```

If multiple rows are returned, PostgreSQL raises:

```text
ERROR: more than one row returned by a subquery used as an expression
```

Use `IN` if multiple results are expected:

```sql
SELECT *
FROM employees
WHERE department_id IN (
    SELECT department_id
    FROM departments
    WHERE department_name LIKE '%Sales%'
);
```

### Rule 2: A scalar subquery must return one column

Incorrect:

```sql
SELECT *
FROM employees
WHERE salary > (
    SELECT employee_id, salary
    FROM employees
);
```

A scalar expression cannot accept two columns.

### Rule 3: Empty scalar subqueries return NULL

```sql
SELECT *
FROM products
WHERE price > (
    SELECT price
    FROM products
    WHERE product_id = -1
);
```

If no product matches, the inner query returns NULL.

The comparison becomes UNKNOWN, so no rows pass the WHERE condition.

### Rule 4: Be careful with NULL and NOT IN

```sql
SELECT *
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
);
```

If the subquery returns even one NULL, comparisons can become UNKNOWN and produce unexpected results.

For exclusion checks, `NOT EXISTS` is generally safer. It is covered in Part 9B.

### Rule 5: Avoid unnecessary nesting

Hard-to-maintain query:

```sql
SELECT *
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM (
        SELECT price
        FROM products
    ) AS product_data
);
```

Simpler:

```sql
SELECT *
FROM products
WHERE price > (
    SELECT AVG(price)
    FROM products
);
```

Use nesting only when it adds meaningful logic.

---

## 12. Practice Exercises

Use the TechBazaar database.

1. Find employees earning more than the company-wide average salary.
2. Find products priced above the average product price.
3. Find orders whose total amount is greater than the average order amount.
4. Find customers who have placed at least one order.
5. Find employees working in the Sales department using a subquery.
6. Find employees earning the maximum salary in the company.
7. Show every customer along with their total order count using a SELECT subquery.
8. Calculate total spending per customer using a derived table and return customers spending above 20000.
9. Find departments whose average salary is greater than the company-wide average salary.
10. Find products priced higher than the average price of their category. This requires a correlated subquery and belongs to Part 9C.
11. Rewrite a subquery-based department lookup using a JOIN.
12. Explain what happens when a scalar subquery returns multiple rows.
13. Explain the difference between a scalar subquery and a multiple-row subquery.
14. Explain why NOT IN can behave unexpectedly when NULL is present.

---

## 13. Interview Questions

**Q1. What is a subquery?**

A SQL query nested inside another query.

**Q2. What is a scalar subquery?**

A subquery that returns one column and at most one row.

**Q3. What happens when a scalar subquery returns multiple rows?**

PostgreSQL raises a cardinality violation error.

**Q4. Can subqueries be used in SELECT?**

Yes. They can calculate additional values for result rows.

**Q5. What is a derived table?**

A subquery used in the FROM clause. It must have an alias in PostgreSQL.

**Q6. Can we use a subquery in HAVING?**

Yes. It can provide a value used to filter grouped results.

**Q7. What is the difference between a subquery and a JOIN?**

A subquery provides a nested query result; a JOIN combines rows from related datasets.

**Q8. Are subqueries slower than JOINs?**

Not necessarily. PostgreSQL's optimizer can transform equivalent queries. Compare execution plans when performance matters.

**Q9. What is the difference between a subquery and a CTE?**

A subquery is nested inside another query. A CTE is a named query result defined using WITH.

**Q10. What happens when a scalar subquery returns zero rows?**

Its result is NULL.

---

## Key Takeaways

- A subquery is a query nested inside another SQL query.
- Subqueries can appear in SELECT, FROM, WHERE and HAVING.
- Scalar subqueries return one column and at most one row.
- Multiple-row subqueries commonly work with IN, ANY and ALL.
- A subquery in FROM is called a derived table and requires an alias.
- Correlated subqueries reference columns from an outer query.
- Subqueries and JOINs solve overlapping problems but have different semantics.
- CTEs offer another way to organize nested query logic.
- Be careful with scalar subqueries returning multiple rows and NOT IN involving NULL values.
