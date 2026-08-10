---
sidebar_label: "Views and Materialized Views in PostgreSQL"
sidebar_position: 1
---

# Views and Materialized Views in PostgreSQL

## 1. Introduction

PostgreSQL provides two important database objects for storing reusable queries:

1. **View**
2. **Materialized View**

Both allow you to save a SQL query and access its result through a database object.

The key difference is:

- A **View** stores the query definition. Its data is retrieved by executing the underlying query when the view is accessed.
- A **Materialized View** stores the result of the query physically. It must be refreshed to reflect changes in the underlying tables.

### Real-world example

Suppose TechBazaar needs a report showing:

- Customer name
- Total orders
- Total amount spent
- Latest order date

Instead of writing the same JOIN and GROUP BY query repeatedly, you can create a view.

---

## 2. What Is a View?

A view is a virtual table based on a SQL query.

It does not normally store a separate copy of the query's result data.

### Syntax

```sql
CREATE VIEW view_name AS
SELECT ...
FROM ...;
```

### Example: Employee view

```sql
CREATE VIEW employee_details AS
SELECT
    e.employee_id,
    e.employee_name,
    d.department_name,
    e.salary,
    e.status
FROM employees e
JOIN departments d
    ON e.department_id = d.department_id;
```

Now query the view:

```sql
SELECT *
FROM employee_details;
```

You can query a view similarly to a regular table.

### Filter a view

```sql
SELECT *
FROM employee_details
WHERE salary > 50000;
```

### Select specific columns

```sql
SELECT
    employee_name,
    department_name
FROM employee_details;
```

**Important:** A normal view stores the query definition, not a snapshot of the data. Changes to the underlying tables are reflected when the view is queried, subject to the transaction's visibility rules.

---

## 3. Why Use Views?

Views are useful for several reasons.

### 3.1 Reusability

Instead of repeating complex SQL queries, create a view once and reuse it.

```sql
SELECT *
FROM employee_details;
```

### 3.2 Simplifying complex queries

Suppose you frequently need employee and department information.

Without a view:

```sql
SELECT
    e.employee_id,
    e.employee_name,
    d.department_name
FROM employees e
JOIN departments d
    ON e.department_id = d.department_id;
```

With a view:

```sql
SELECT *
FROM employee_details;
```

### 3.3 Restricting access to columns

Suppose an employee table contains salary information, but some users should only see basic employee details.

```sql
CREATE VIEW public_employee_details AS
SELECT
    employee_id,
    employee_name,
    department_id,
    status
FROM employees;
```

You can grant users access to the view without granting them access to the underlying table.

This requires appropriate privilege configuration. A view does not automatically provide security merely because it exists.

### 3.4 Consistent business logic

If multiple reports need the same calculation, a view can centralize that logic.

For example, every report can use the same definition of active employees.

---

## 4. Creating a View for Business Analytics

Consider TechBazaar's existing tables:

- customers
- orders
- order_items
- payments

We want a customer order summary.

### Create the view

```sql
CREATE VIEW customer_order_summary AS
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_order_amount,
    MAX(o.created_at) AS latest_order_date
FROM customers c
LEFT JOIN orders o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

### Query the view

```sql
SELECT *
FROM customer_order_summary;
```

### Find high-value customers

```sql
SELECT *
FROM customer_order_summary
WHERE total_order_amount > 50000
ORDER BY total_order_amount DESC;
```

### Find customers with no orders

```sql
SELECT *
FROM customer_order_summary
WHERE total_orders = 0;
```

**Important:** `COUNT(DISTINCT o.order_id)` avoids counting duplicate order IDs if the query is later expanded with additional one-to-many joins. In this particular query, each order appears once.

---

## 5. Updating and Replacing Views

You can modify a view's definition using `CREATE OR REPLACE VIEW`.

### Example

Original view:

```sql
CREATE VIEW active_employees AS
SELECT
    employee_id,
    employee_name
FROM employees
WHERE status = 'active';
```

Replace its definition:

```sql
CREATE OR REPLACE VIEW active_employees AS
SELECT
    employee_id,
    employee_name,
    department_id
FROM employees
WHERE status = 'active';
```

The new definition adds `department_id`.

### Important rules

- Existing columns generally need to retain their names, order and data types when replacing a view.
- New columns can be added at the end.
- To make incompatible structural changes, you may need to drop and recreate the view.
- Dependent objects can prevent a view from being dropped without `CASCADE`.

### Rename a view

```sql
ALTER VIEW active_employees
RENAME TO current_employees;
```

### Drop a view

```sql
DROP VIEW current_employees;
```

Use `DROP VIEW IF EXISTS` when the view may not exist:

```sql
DROP VIEW IF EXISTS current_employees;
```

---

## 6. Can You Insert, Update or Delete Through a View?

Yes, some views are automatically updatable.

A simple view based on a single table is often updatable.

### Example

```sql
CREATE VIEW active_employee_names AS
SELECT
    employee_id,
    employee_name,
    status
FROM employees
WHERE status = 'active';
```

You can insert through the view:

```sql
INSERT INTO active_employee_names (
    employee_name,
    status
)
VALUES (
    'Rahul',
    'active'
);
```

You can update through it:

```sql
UPDATE active_employee_names
SET employee_name = 'Rahul Sharma'
WHERE employee_id = 1;
```

You can delete through it:

```sql
DELETE FROM active_employee_names
WHERE employee_id = 1;
```

These operations affect the underlying `employees` table.

### When is a view automatically updatable?

A view is generally automatically updatable when its top-level query has a single source relation and does not contain constructs that prevent automatic updates, such as:

- DISTINCT
- GROUP BY
- HAVING
- Aggregate functions
- Window functions
- Set operations

A view containing JOINs may have limited automatic update support. PostgreSQL does not automatically make every joined relation updatable through the view.

### WITH CHECK OPTION

Suppose a view only displays active employees.

Without an additional check, an update through the view could change an employee's status to inactive, causing that row to disappear from the view.

Use `WITH CHECK OPTION` to prevent changes through the view that would make the resulting row invisible.

```sql
CREATE OR REPLACE VIEW active_employee_names AS
SELECT
    employee_id,
    employee_name,
    status
FROM employees
WHERE status = 'active'
WITH LOCAL CHECK OPTION;
```

Now this update fails:

```sql
UPDATE active_employee_names
SET status = 'inactive'
WHERE employee_id = 1;
```

Because the updated row no longer satisfies the view condition.

### LOCAL vs CASCADED CHECK OPTION

| Option   | Behaviour                                               |
| -------- | ------------------------------------------------------- |
| LOCAL    | Checks the current view's condition                     |
| CASCADED | Checks the current view and applicable underlying views |

If no option is specified, PostgreSQL uses the default behavior, which does not add a check option.

---

## 7. What Is a Materialized View?

A materialized view stores the result of a SQL query physically.

Unlike a normal view, PostgreSQL does not execute the complete underlying query every time you read a materialized view.

### Syntax

```sql
CREATE MATERIALIZED VIEW view_name AS
SELECT ...
FROM ...;
```

### Example

```sql
CREATE MATERIALIZED VIEW department_salary_summary AS
SELECT
    d.department_id,
    d.department_name,
    COUNT(e.employee_id) AS total_employees,
    AVG(e.salary) AS average_salary,
    SUM(e.salary) AS total_salary
FROM departments d
LEFT JOIN employees e
    ON d.department_id = e.department_id
GROUP BY
    d.department_id,
    d.department_name;
```

Query it:

```sql
SELECT *
FROM department_salary_summary;
```

The result is stored and read from the materialized view.

### Why use materialized views?

Suppose a report joins several large tables and performs expensive aggregation.

Running the complete query repeatedly can be costly.

A materialized view allows you to calculate the result and store it for later queries.

Common use cases:

- Analytics dashboards.
- Monthly sales summaries.
- Business intelligence reports.
- Expensive aggregations.
- Reporting workloads where slightly stale data is acceptable.

---

## 8. Refreshing a Materialized View

A materialized view does not automatically update when its underlying tables change.

You must refresh it.

### Syntax

```sql
REFRESH MATERIALIZED VIEW view_name;
```

Example:

```sql
REFRESH MATERIALIZED VIEW department_salary_summary;
```

PostgreSQL reruns the defining query and replaces the stored contents with the newly calculated result.

### Example workflow

1. An employee's salary changes.
2. The underlying `employees` table is updated.
3. The materialized view still contains the previously calculated salary summary.
4. You refresh the materialized view.
5. The updated summary becomes available.

### Refresh manually

```sql
UPDATE employees
SET salary = 75000
WHERE employee_id = 1;

REFRESH MATERIALIZED VIEW department_salary_summary;
```

Now query the refreshed result:

```sql
SELECT *
FROM department_salary_summary;
```

---

## 9. Concurrent Refresh

A normal refresh can block concurrent readers of the materialized view while it is being refreshed.

PostgreSQL supports concurrent refresh:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY
department_salary_summary;
```

This allows readers to continue accessing the materialized view while PostgreSQL refreshes it.

### Important requirements

`REFRESH MATERIALIZED VIEW CONCURRENTLY` requires:

1. The materialized view must already be populated.
2. At least one qualifying UNIQUE index must exist.
3. The UNIQUE index must use only column names and include all rows.
4. The refresh cannot run inside a transaction block.

### Create a unique index

```sql
CREATE UNIQUE INDEX idx_department_salary_summary
ON department_salary_summary (department_id);
```

Now:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY
department_salary_summary;
```

### Normal vs concurrent refresh

| Feature                | Normal refresh              | Concurrent refresh       |
| ---------------------- | --------------------------- | ------------------------ |
| Readers during refresh | Can be blocked              | Can continue reading     |
| Unique index required  | No                          | Yes                      |
| Transaction block      | Allowed                     | Not allowed              |
| Execution overhead     | Often lower                 | Additional overhead      |
| Availability           | May temporarily block reads | Better read availability |

Concurrent refresh is not automatically faster. It is primarily useful when readers must remain able to access the materialized view during refresh.

---

## 10. Indexing Materialized Views

A materialized view stores physical rows, so you can create indexes on it.

Example:

```sql
CREATE INDEX idx_department_avg_salary
ON department_salary_summary (average_salary);
```

Now this query may benefit from the index:

```sql
SELECT *
FROM department_salary_summary
WHERE average_salary > 50000;
```

The planner decides whether using the index is worthwhile.

**Important:** Indexes on a materialized view are separate from indexes on the underlying tables.

Refreshing the materialized view maintains its stored result and indexes.

---

## 11. Dropping Materialized Views

```sql
DROP MATERIALIZED VIEW department_salary_summary;
```

Safer version:

```sql
DROP MATERIALIZED VIEW IF EXISTS department_salary_summary;
```

To remove dependent objects as well:

```sql
DROP MATERIALIZED VIEW department_salary_summary CASCADE;
```

Use `CASCADE` carefully because it can remove dependent objects.

---

## 12. View vs Materialized View

| Feature                        | View                                        | Materialized View                  |
| ------------------------------ | ------------------------------------------- | ---------------------------------- |
| Stores query definition        | Yes                                         | Yes                                |
| Stores query result physically | No                                          | Yes                                |
| Data freshness                 | Based on underlying data at query time      | Based on last refresh              |
| Query execution                | Underlying query is evaluated when accessed | Reads stored result                |
| Refresh required               | No                                          | Yes                                |
| Indexes on result              | No separate result indexes                  | Yes                                |
| Storage overhead               | Usually minimal                             | Requires storage                   |
| Suitable for                   | Reusable query logic                        | Expensive reports and aggregations |
| Automatic updates              | Reflects underlying changes when queried    | Does not automatically refresh     |

### Practical example

**View:**

```sql
CREATE VIEW active_products AS
SELECT *
FROM products
WHERE price > 0;
```

Every query evaluates the view against the underlying table.

**Materialized View:**

```sql
CREATE MATERIALIZED VIEW product_price_summary AS
SELECT
    COUNT(*) AS total_products,
    AVG(price) AS average_price
FROM products;
```

The result is stored until refreshed.

---

## 13. Views and Materialized Views: Performance Considerations

### Views

A view is not automatically faster than the original query.

PostgreSQL generally expands a normal view into its underlying query and optimizes the overall statement.

For example:

```sql
SELECT *
FROM employee_details
WHERE department_name = 'Engineering';
```

The planner can optimize this together with the underlying JOIN.

A view is primarily a tool for query reuse, abstraction and access control—not automatic performance improvement.

### Materialized Views

Materialized views can improve read performance when:

- The underlying query is expensive.
- The result is reused frequently.
- Data does not need to be immediately fresh.
- The stored result is substantially smaller or cheaper to access than recomputing the query.

However, consider:

- Storage requirements.
- Refresh execution time.
- Refresh frequency.
- Staleness of data.
- Index maintenance.
- Concurrent reader requirements.

### Important

A materialized view is not an automatically maintained cache. PostgreSQL requires explicit refresh operations.

---

## 14. Automating Materialized View Refreshes

PostgreSQL does not automatically schedule materialized view refreshes.

You can schedule refreshes using external scheduling systems, such as:

- Linux cron.
- Application-level schedulers.
- pg_cron extension, when installed and configured.
- Workflow orchestration systems.

Example SQL command:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY
department_salary_summary;
```

A Linux cron job or application scheduler can execute this command periodically.

### Example schedule

| Report                  | Refresh frequency       |
| ----------------------- | ----------------------- |
| Daily sales report      | Every hour              |
| Monthly revenue summary | Daily                   |
| Employee salary summary | After scheduled updates |
| Historical analytics    | Once per day            |

The correct refresh frequency depends on how fresh the data must be.

---

## 15. Security: Views and Materialized Views

Views can be used to expose selected data without giving users direct access to every underlying column.

Example:

```sql
CREATE VIEW employee_public_details AS
SELECT
    employee_id,
    employee_name,
    department_id,
    status
FROM employees;
```

Grant access:

```sql
GRANT SELECT ON employee_public_details TO reporting_user;
```

However, a few details matter:

- A normal view usually checks underlying permissions using its owner’s privileges, subject to PostgreSQL's view security behavior.
- `security_invoker = true` makes a view use the invoking user's permissions for underlying relations.
- `security_barrier = true` can be useful when a view is intended to enforce security-sensitive filtering.
- Materialized views store data and have their own access privileges.

Example of a security-invoker view:

```sql
CREATE VIEW employee_public_details
WITH (security_invoker = true)
AS
SELECT
    employee_id,
    employee_name,
    department_id,
    status
FROM employees;
```

A view is not a substitute for a complete row-level security policy or a carefully designed permissions model.

---

## 16. Practical Real-World Scenarios

### Scenario 1: Employee reporting

Create a view combining employees and departments.

```sql
CREATE VIEW employee_department_report AS
SELECT
    e.employee_id,
    e.employee_name,
    d.department_name,
    e.salary
FROM employees e
JOIN departments d
    ON e.department_id = d.department_id;
```

Use it for employee reports without repeating the JOIN.

### Scenario 2: Customer analytics

Create a materialized view:

```sql
CREATE MATERIALIZED VIEW customer_revenue_report AS
SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM customers c
LEFT JOIN orders o
    ON c.customer_id = o.customer_id
GROUP BY
    c.customer_id,
    c.customer_name;
```

Refresh when required:

```sql
REFRESH MATERIALIZED VIEW customer_revenue_report;
```

### Scenario 3: Reporting user access

Create a view exposing only non-sensitive employee information and grant a reporting role SELECT access.

### Scenario 4: Dashboard performance

Use a materialized view for expensive aggregations that are repeatedly requested by a dashboard and do not need real-time freshness.

---

## 17. Common Mistakes

| Mistake                                                    | Correct understanding                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Assuming a view stores data                                | A normal view stores its query definition                         |
| Assuming a materialized view updates automatically         | It requires refresh                                               |
| Assuming views always improve performance                  | They primarily provide abstraction and reuse                      |
| Assuming materialized views are always faster overall      | Refresh cost and storage must be considered                       |
| Refreshing too frequently                                  | Can create unnecessary database load                              |
| Using concurrent refresh without a qualifying unique index | PostgreSQL rejects it                                             |
| Assuming every view is updatable                           | Aggregates, joins and other query constructs can restrict updates |
| Assuming `WITH CHECK OPTION` applies to every write path   | It constrains applicable writes through the view                  |
| Using `DROP ... CASCADE` carelessly                        | Dependent objects may also be removed                             |

---

## 18. Practice Exercises

Use the TechBazaar schema.

1. Create a view combining employees and departments.
2. Query the view to find employees earning more than ₹50,000.
3. Create a view showing only active employees.
4. Update an employee's name through an automatically updatable view.
5. Add `WITH CHECK OPTION` to an active employee view.
6. Attempt to change an active employee's status to inactive through that view.
7. Create a customer order summary view.
8. Find customers with no orders using the view.
9. Create a materialized view for department salary summaries.
10. Update an employee's salary and check whether the materialized view changes automatically.
11. Refresh the materialized view.
12. Create an index on a materialized view.
13. Create a unique index on a materialized view and try concurrent refresh.
14. Compare normal and concurrent refresh.
15. Create a reporting view that excludes salary information.
16. Grant SELECT permission on that view to a reporting role.
17. Explain when a normal view is preferable to a materialized view.
18. Design a refresh schedule for a sales dashboard.

---

## 19. Interview Questions

**Q1. What is a view in PostgreSQL?**

A named SQL query that behaves like a virtual table.

**Q2. Does a normal view store data?**

No. It stores the query definition.

**Q3. What is a materialized view?**

A database object that physically stores the result of a query.

**Q4. What is the main difference between a view and a materialized view?**

A normal view evaluates its underlying query when accessed, while a materialized view reads its stored result until refreshed.

**Q5. How do you refresh a materialized view?**

Using `REFRESH MATERIALIZED VIEW`.

**Q6. What is concurrent refresh?**

It refreshes a materialized view while allowing concurrent readers to continue accessing it.

**Q7. Is a unique index required for concurrent refresh?**

Yes. A qualifying unique index covering all rows is required.

**Q8. Can you create an index on a normal view?**

No. A normal view has no separately stored result to index. You can index its underlying tables or use a materialized view.

**Q9. Can you update a view?**

Some views are automatically updatable. Others require an `INSTEAD OF` trigger or another appropriate mechanism.

**Q10. What is WITH CHECK OPTION?**

It prevents applicable writes through a view from creating rows that no longer satisfy its view condition.

**Q11. Do views automatically improve query performance?**

No. They primarily provide abstraction and reusable query definitions.

**Q12. When should you use a materialized view?**

For expensive queries whose results are reused and can tolerate some staleness.

**Q13. Does a materialized view update when an underlying table changes?**

No. It must be refreshed.

**Q14. Can materialized views have indexes?**

Yes. They store physical rows and support indexes.

**Q15. Can a materialized view be refreshed concurrently inside a transaction block?**

No.

**Q16. Can a view be used for security?**

Yes, it can expose selected columns or rows, provided privileges and view security behavior are configured correctly.

**Q17. What is the difference between CREATE OR REPLACE VIEW and REFRESH MATERIALIZED VIEW?**

The first changes a normal view's definition. The second recomputes the stored result of a materialized view.

---

## Key Takeaways

- A view stores a reusable SQL query definition.
- A normal view does not store a separate copy of its result.
- A materialized view physically stores query results.
- Materialized views require explicit refreshes.
- `REFRESH MATERIALIZED VIEW CONCURRENTLY` allows readers to continue accessing the view during refresh.
- Concurrent refresh requires a qualifying unique index and cannot run inside a transaction block.
- Materialized views support indexes.
- Some simple views are automatically updatable.
- `WITH CHECK OPTION` protects view conditions during applicable writes.
- Views can simplify SQL and help control data exposure.
- Materialized views are useful for expensive reporting and analytics workloads.
- Neither views nor materialized views automatically guarantee better overall performance.
