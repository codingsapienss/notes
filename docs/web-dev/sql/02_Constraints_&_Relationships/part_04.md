---
sidebar_label: "Self-Referencing and Recursive Relationships"
sidebar_position: 1
---

# Self-Referencing and Recursive Relationships

## 1. What is a Self-Referencing Relationship?

A **self-referencing relationship** occurs when a table contains a foreign key that references the primary key of the same table.

It allows records within one table to be related to other records in that table.

Example: An employee reports to another employee.

```text
employees
--------------------------------
employee_id | employee_name | manager_id
1           | Rahul         | NULL
2           | Priya         | 1
3           | Amit          | 1
4           | John          | 2
```

Here:

- Rahul has no manager.
- Priya and Amit report to Rahul.
- John reports to Priya.

`manager_id` references `employee_id` in the same table.

## 2. Creating a Self-Referencing Foreign Key

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    manager_id BIGINT,

    CONSTRAINT fk_employee_manager
        FOREIGN KEY (manager_id)
        REFERENCES employees(employee_id)
);
```

The foreign key references the same table.

### Insert Sample Data

```sql
INSERT INTO employees
    (employee_id, employee_name, manager_id)
VALUES
    (1, 'Rahul', NULL),
    (2, 'Priya', 1),
    (3, 'Amit', 1),
    (4, 'John', 2);
```

### Important Rules

- `manager_id` can contain NULL if an employee has no manager.
- A non-NULL `manager_id` must reference an existing employee.
- Multiple employees can have the same manager.
- The foreign key prevents references to nonexistent employees.
- A foreign key alone does not prevent an employee from referencing themselves.

## 3. Understanding the Relationship

```text
          Rahul (1)
          /       \
     Priya (2)   Amit (3)
        |
      John (4)
```

This is a hierarchical relationship.

The same table represents both:

- Parent records: Managers.
- Child records: Employees reporting to managers.

## 4. Retrieving Employee and Manager Details — SELF JOIN

A **self join** joins a table with itself.

Use table aliases to distinguish the two references.

```sql
SELECT
    e.employee_name AS employee,
    m.employee_name AS manager
FROM employees e
LEFT JOIN employees m
    ON e.manager_id = m.employee_id;
```

Result:

| employee | manager |
| -------- | ------- |
| Rahul    | NULL    |
| Priya    | Rahul   |
| Amit     | Rahul   |
| John     | Priya   |

Explanation:

- `e` represents the employee.
- `m` represents the manager.
- `e.manager_id = m.employee_id` connects an employee to their manager.
- LEFT JOIN keeps employees who do not have managers.

### Retrieve Only Employees Who Have Managers

```sql
SELECT
    e.employee_name AS employee,
    m.employee_name AS manager
FROM employees e
INNER JOIN employees m
    ON e.manager_id = m.employee_id;
```

Rahul is excluded because his `manager_id` is NULL.

## 5. Finding Employees Under a Particular Manager

Find employees reporting directly to Rahul:

```sql
SELECT
    employee_id,
    employee_name
FROM employees
WHERE manager_id = 1;
```

Find all employees reporting directly to Priya:

```sql
SELECT
    employee_id,
    employee_name
FROM employees
WHERE manager_id = 2;
```

These queries retrieve only direct reports, not employees at deeper hierarchy levels.

## 6. Finding the Complete Hierarchy — Recursive CTE

When a hierarchy has multiple levels, a normal self join is not sufficient.

Example:

```text
Rahul
  |
  Priya
    |
    John
      |
      Alex
```

A recursive CTE can traverse the hierarchy at every level.

```sql
WITH RECURSIVE employee_hierarchy AS (

    -- Anchor: Start with the top-level manager
    SELECT
        employee_id,
        employee_name,
        manager_id,
        1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: Find employees reporting to the previous level
    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh
        ON e.manager_id = eh.employee_id
)

SELECT *
FROM employee_hierarchy
ORDER BY level, employee_id;
```

### Recursive CTE Components

| Component       | Purpose                                   |
| --------------- | ----------------------------------------- |
| WITH RECURSIVE  | Defines a recursive query                 |
| Anchor query    | Identifies the starting records           |
| UNION ALL       | Combines anchor and recursive results     |
| Recursive query | Finds the next level of related records   |
| Termination     | Stops when no more matching records exist |

**Important:** The recursive query repeatedly uses previously discovered rows to find the next level.

## 7. Other Real-World Use Cases

Self-referencing relationships are useful for more than employee hierarchies.

### A. Categories and Subcategories

```sql
CREATE TABLE categories (
    category_id BIGINT PRIMARY KEY,
    category_name TEXT NOT NULL,
    parent_category_id BIGINT REFERENCES categories(category_id)
);
```

Example:

```text
Electronics
    |
    |-- Mobiles
    |     |-- Smartphones
    |     |-- Feature Phones
    |
    |-- Computers
          |-- Laptops
          |-- Desktops
```

### B. Comments and Replies

```sql
CREATE TABLE comments (
    comment_id BIGINT PRIMARY KEY,
    comment_text TEXT NOT NULL,
    parent_comment_id BIGINT REFERENCES comments(comment_id)
);
```

A comment can have replies, and replies can have their own replies.

### C. Referral Systems

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    username TEXT NOT NULL,
    referred_by BIGINT REFERENCES users(user_id)
);
```

Each user can optionally reference the user who referred them.

### D. Organizational Structures

```text
CEO
 |
 |-- Engineering Head
 |      |-- Backend Lead
 |      |      |-- Developer
 |
 |-- Sales Head
        |-- Sales Manager
```

A self-referencing foreign key models the hierarchy.

## 8. Preventing Invalid Self-References

A foreign key prevents references to nonexistent records, but it does not prevent an employee from becoming their own manager.

For example:

```sql
UPDATE employees
SET manager_id = employee_id
WHERE employee_id = 1;
```

To prevent direct self-reference, add a CHECK constraint:

```sql
ALTER TABLE employees
ADD CONSTRAINT chk_employee_not_own_manager
CHECK (manager_id IS DISTINCT FROM employee_id);
```

`IS DISTINCT FROM` treats NULL as a comparable value, so a NULL manager ID passes this condition.

**Important:** This prevents direct self-reference, not longer cycles.

Example of a cycle:

```text
Rahul → Priya → John → Rahul
```

Preventing arbitrary hierarchy cycles requires additional validation, often through recursive queries and controlled application logic or database triggers.

## 9. Indexing Self-Referencing Foreign Keys

PostgreSQL does not automatically create an index on the referencing foreign key column.

For frequent manager-based queries:

```sql
CREATE INDEX idx_employees_manager_id
ON employees(manager_id);
```

This can improve:

- Finding direct reports.
- Self joins.
- Recursive hierarchy traversal.

Create indexes based on actual query patterns and table size.

## 10. Common Mistakes

1. Confusing a self join with a self-referencing foreign key.
2. Assuming a self join automatically retrieves every hierarchy level.
3. Using INNER JOIN when employees without managers must also appear.
4. Assuming a foreign key prevents an employee from managing themselves.
5. Assuming a foreign key prevents all hierarchy cycles.
6. Forgetting that recursive CTEs need a termination condition.
7. Forgetting to index frequently queried self-referencing foreign keys.
8. Using a normal JOIN when the requirement needs recursive traversal.

## 11. Practice Exercises

Use the `techbazaar` database.

1. Create an employees table with `manager_id` referencing `employee_id`.
2. Insert one CEO, two managers, and four employees.
3. Retrieve each employee with their manager's name using a self join.
4. Find employees who do not have a manager.
5. Find all employees reporting directly to a particular manager.
6. Use a recursive CTE to retrieve the complete employee hierarchy.
7. Create a categories table with a parent-category relationship.
8. Insert Electronics, Mobiles, Smartphones, and Laptops as a hierarchy.
9. Retrieve the complete category hierarchy using a recursive CTE.
10. Add a CHECK constraint preventing direct self-management.
11. Explain why a CHECK constraint alone cannot prevent arbitrary hierarchy cycles.

## 12. Interview Questions

1. What is a self-referencing foreign key?
2. What is a self join?
3. What is the difference between a self join and a self-referencing relationship?
4. How would you model an employee-manager hierarchy?
5. How do you retrieve an employee's manager using SQL?
6. What is a recursive CTE?
7. What are the anchor and recursive queries?
8. Can a foreign key prevent an employee from becoming their own manager?
9. Can a foreign key prevent circular references?
10. How would you model nested product categories?
11. Why is LEFT JOIN useful when retrieving employee-manager relationships?
12. How would you retrieve all levels of an organizational hierarchy?
