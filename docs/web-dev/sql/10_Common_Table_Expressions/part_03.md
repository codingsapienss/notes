---
sidebar_label: "Recursive CTEs"
sidebar_position: 1
---

# Recursive CTEs

## 1. What is a Recursive CTE?

A **Recursive CTE** is a CTE that references itself to repeatedly process data until a termination condition is reached.

It is useful for working with hierarchical and tree-structured data.

Common use cases:

- Employee-manager hierarchies.
- Organizational structures.
- Category and subcategory trees.
- Product category hierarchies.
- Parent-child relationships.
- Folder structures.
- Graph traversal.
- Generating sequences and date ranges.

### Basic syntax

```sql
WITH RECURSIVE cte_name AS (

    -- Anchor member
    SELECT ...

    UNION ALL

    -- Recursive member
    SELECT ...
    FROM table_name
    JOIN cte_name
        ON condition

)

SELECT *
FROM cte_name;
```

A recursive CTE contains two main parts:

| Component        | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| Anchor member    | Produces the initial rows                           |
| Recursive member | Uses previously generated rows to produce more rows |

The recursive member continues until it returns no more rows.

---

## 2. Understanding Anchor and Recursive Members

Consider this example:

```sql
WITH RECURSIVE numbers AS (

    -- Anchor member
    SELECT 1 AS number

    UNION ALL

    -- Recursive member
    SELECT number + 1
    FROM numbers
    WHERE number < 5

)

SELECT *
FROM numbers;
```

**Output:**

| number |
| -----: |
|      1 |
|      2 |
|      3 |
|      4 |
|      5 |

### How it works

**Step 1 — Anchor member**

```sql
SELECT 1 AS number;
```

Produces the initial result:

| number |
| -----: |
|      1 |

**Step 2 — First recursive iteration**

```sql
SELECT number + 1
FROM numbers
WHERE number < 5;
```

Produces:

| number |
| -----: |
|      2 |

**Step 3 — Further iterations**

The recursive member continues producing:

- 3
- 4
- 5

**Step 4 — Termination**

When `number = 5`, the condition:

```sql
WHERE number < 5
```

is FALSE.

The recursive member returns no more rows, so recursion stops.

### Important

A recursive CTE must have a termination condition or another mechanism that ensures recursion ends.

---

## 3. Generating a Number Sequence

Recursive CTEs can generate sequences without requiring a physical table.

### Example: Numbers from 1 to 10

```sql
WITH RECURSIVE number_series AS (

    SELECT 1 AS num

    UNION ALL

    SELECT num + 1
    FROM number_series
    WHERE num < 10

)

SELECT *
FROM number_series;
```

### Example: Numbers from 1 to 100

```sql
WITH RECURSIVE number_series AS (

    SELECT 1 AS num

    UNION ALL

    SELECT num + 1
    FROM number_series
    WHERE num < 100

)

SELECT *
FROM number_series;
```

**Alternative PostgreSQL approach:**

For simple numeric sequences, PostgreSQL provides `GENERATE_SERIES()`.

```sql
SELECT *
FROM GENERATE_SERIES(1, 100);
```

Use recursive CTEs when the next value depends on previous query results. Use `GENERATE_SERIES()` for straightforward sequences.

---

## 4. Generating Date Sequences

Recursive CTEs can generate date ranges.

### Example: Generate dates for November 2026

```sql
WITH RECURSIVE date_series AS (

    SELECT DATE '2026-11-01' AS date_value

    UNION ALL

    SELECT date_value + INTERVAL '1 day'
    FROM date_series
    WHERE date_value < DATE '2026-11-30'

)

SELECT *
FROM date_series;
```

### Alternative using GENERATE_SERIES()

```sql
SELECT
    date_value::DATE
FROM GENERATE_SERIES(
    DATE '2026-11-01',
    DATE '2026-11-30',
    INTERVAL '1 day'
) AS date_value;
```

### Business use cases

- Daily sales reports.
- Monthly revenue reports.
- Attendance reports.
- Missing-date detection.
- Daily campaign statistics.

---

## 5. Recursive CTE with Employee Hierarchy

This is one of the most important real-world uses.

Consider the TechBazaar `employees` table:

| employee_id | employee_name | manager_id |
| ----------: | ------------- | ---------: |
|         101 | Rahul         |       NULL |
|         102 | Amit          |        101 |
|         103 | Priya         |        101 |
|         104 | Neha          |        102 |
|         105 | Karan         |        102 |
|         106 | Sneha         |        103 |

Here:

- Rahul is the top-level manager.
- Amit and Priya report to Rahul.
- Neha and Karan report to Amit.
- Sneha reports to Priya.

### Find the complete employee hierarchy

```sql
WITH RECURSIVE employee_hierarchy AS (

    -- Anchor: Find top-level employees
    SELECT
        employee_id,
        employee_name,
        manager_id,
        1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: Find employees reporting to previous level
    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        eh.level + 1
    FROM employees AS e
    JOIN employee_hierarchy AS eh
        ON e.manager_id = eh.employee_id

)

SELECT *
FROM employee_hierarchy
ORDER BY level, employee_id;
```

### Expected result

| employee_id | employee_name | manager_id | level |
| ----------: | ------------- | ---------: | ----: |
|         101 | Rahul         |       NULL |     1 |
|         102 | Amit          |        101 |     2 |
|         103 | Priya         |        101 |     2 |
|         104 | Neha          |        102 |     3 |
|         105 | Karan         |        102 |     3 |
|         106 | Sneha         |        103 |     3 |

### Understanding the recursive logic

**Anchor member:**

```sql
SELECT
    employee_id,
    employee_name,
    manager_id,
    1 AS level
FROM employees
WHERE manager_id IS NULL
```

Finds employees without managers.

**Recursive member:**

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.manager_id,
    eh.level + 1
FROM employees AS e
JOIN employee_hierarchy AS eh
    ON e.manager_id = eh.employee_id
```

Finds employees whose manager belongs to the previously generated hierarchy.

The process continues until no more employees are found.

---

## 6. Find All Subordinates of a Specific Manager

You do not always need the complete organizational hierarchy.

You can start recursion from a specific employee.

### Example: Find everyone reporting directly or indirectly to Rahul

```sql
WITH RECURSIVE subordinates AS (

    -- Anchor: Direct reports of Rahul
    SELECT
        employee_id,
        employee_name,
        manager_id,
        1 AS level
    FROM employees
    WHERE manager_id = 101

    UNION ALL

    -- Recursive: Find indirect reports
    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        s.level + 1
    FROM employees AS e
    JOIN subordinates AS s
        ON e.manager_id = s.employee_id

)

SELECT *
FROM subordinates
ORDER BY level, employee_id;
```

This returns all direct and indirect reports of employee 101.

### Find only direct reports

```sql
SELECT
    employee_id,
    employee_name
FROM employees
WHERE manager_id = 101;
```

### Find only indirect reports

```sql
WITH RECURSIVE subordinates AS (

    SELECT
        employee_id,
        employee_name,
        manager_id,
        1 AS level
    FROM employees
    WHERE manager_id = 101

    UNION ALL

    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        s.level + 1
    FROM employees AS e
    JOIN subordinates AS s
        ON e.manager_id = s.employee_id

)

SELECT *
FROM subordinates
WHERE level > 1;
```

---

## 7. Find the Management Chain of an Employee

The previous examples move downward from a manager to their subordinates.

You can also move upward from an employee to their managers.

### Example: Find the management chain of Neha

```sql
WITH RECURSIVE management_chain AS (

    -- Anchor: Start with Neha
    SELECT
        employee_id,
        employee_name,
        manager_id,
        0 AS level
    FROM employees
    WHERE employee_id = 104

    UNION ALL

    -- Recursive: Find the manager of the previous employee
    SELECT
        m.employee_id,
        m.employee_name,
        m.manager_id,
        mc.level + 1
    FROM employees AS m
    JOIN management_chain AS mc
        ON m.employee_id = mc.manager_id

)

SELECT *
FROM management_chain
ORDER BY level;
```

### Expected result

| employee_id | employee_name | manager_id | level |
| ----------: | ------------- | ---------: | ----: |
|         104 | Neha          |        102 |     0 |
|         102 | Amit          |        101 |     1 |
|         101 | Rahul         |       NULL |     2 |

This follows the chain:

Neha → Amit → Rahul.

---

## 8. Recursive CTE with Path Tracking

Sometimes you need to know the complete path through a hierarchy, not just the current level.

PostgreSQL supports arrays that can store the traversal path.

### Example: Track employee hierarchy paths

```sql
WITH RECURSIVE employee_hierarchy AS (

    SELECT
        employee_id,
        employee_name,
        manager_id,
        ARRAY[employee_id] AS employee_path,
        1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        eh.employee_path || e.employee_id,
        eh.level + 1
    FROM employees AS e
    JOIN employee_hierarchy AS eh
        ON e.manager_id = eh.employee_id

)

SELECT
    employee_id,
    employee_name,
    level,
    employee_path
FROM employee_hierarchy
ORDER BY level, employee_id;
```

### Example output

| employee_name | level | employee_path   |
| ------------- | ----: | --------------- |
| Rahul         |     1 | `{101}`         |
| Amit          |     2 | `{101,102}`     |
| Priya         |     2 | `{101,103}`     |
| Neha          |     3 | `{101,102,104}` |
| Karan         |     3 | `{101,102,105}` |
| Sneha         |     3 | `{101,103,106}` |

The array records the path from the root employee to the current employee.

This is useful for:

- Organizational paths.
- Category paths.
- Folder paths.
- Hierarchical reporting.

---

## 9. Preventing Infinite Recursion and Cycles

A hierarchy may contain invalid circular relationships.

Example:

- Employee 101 reports to 102.
- Employee 102 reports to 103.
- Employee 103 reports to 101.

This creates a cycle.

Without cycle protection, a recursive query may keep generating rows until PostgreSQL reaches a resource or execution limit.

### Example: Cycle-safe employee traversal

```sql
WITH RECURSIVE employee_hierarchy AS (

    SELECT
        employee_id,
        employee_name,
        manager_id,
        ARRAY[employee_id] AS employee_path,
        false AS is_cycle
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id,
        eh.employee_path || e.employee_id,
        e.employee_id = ANY(eh.employee_path) AS is_cycle
    FROM employees AS e
    JOIN employee_hierarchy AS eh
        ON e.manager_id = eh.employee_id
    WHERE NOT eh.is_cycle

)

SELECT *
FROM employee_hierarchy;
```

The path tracks previously visited employee IDs.

If an employee ID already exists in the path, the row is marked as a cycle.

The query does not expand rows that are already marked as cycles.

**Important:** Starting only from `manager_id IS NULL` will not discover a completely disconnected cycle. Detecting all cycles in arbitrary data requires starting traversal from appropriate nodes or using a separate cycle-detection strategy.

### PostgreSQL CYCLE clause

PostgreSQL also supports the SQL-standard `CYCLE` clause for recursive CTEs.

```sql
WITH RECURSIVE employee_hierarchy (
    employee_id,
    employee_name,
    manager_id
) AS (

    SELECT
        employee_id,
        employee_name,
        manager_id
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT
        e.employee_id,
        e.employee_name,
        e.manager_id
    FROM employees AS e
    JOIN employee_hierarchy AS eh
        ON e.manager_id = eh.employee_id

)
CYCLE employee_id SET is_cycle USING employee_path

SELECT *
FROM employee_hierarchy;
```

PostgreSQL automatically tracks visited values and marks detected cycles.

---

## 10. UNION vs UNION ALL in Recursive CTEs

Recursive CTEs use a set operation between the anchor and recursive members.

### UNION ALL

```sql
WITH RECURSIVE numbers AS (

    SELECT 1 AS num

    UNION ALL

    SELECT num + 1
    FROM numbers
    WHERE num < 5

)

SELECT *
FROM numbers;
```

`UNION ALL` preserves all generated rows, including duplicates.

### UNION

```sql
WITH RECURSIVE numbers AS (

    SELECT 1 AS num

    UNION

    SELECT num + 1
    FROM numbers
    WHERE num < 5

)

SELECT *
FROM numbers;
```

`UNION` removes duplicate rows.

### Comparison

| UNION                                                | UNION ALL                                             |
| ---------------------------------------------------- | ----------------------------------------------------- |
| Removes duplicates                                   | Preserves duplicates                                  |
| Requires duplicate elimination                       | Avoids duplicate elimination                          |
| May be useful when duplicate rows must be eliminated | Usually preferred for predictable recursive traversal |

**Important:** UNION is not a universal cycle-prevention mechanism. If recursive rows contain changing values such as a level or path, revisiting the same entity can still produce a different row.

Use explicit cycle detection when traversing graph-like data.

---

## 11. Recursive CTE with Product Categories

Consider a category hierarchy:

| category_id | category_name  | parent_category_id |
| ----------: | -------------- | -----------------: |
|           1 | Electronics    |               NULL |
|           2 | Mobiles        |                  1 |
|           3 | Laptops        |                  1 |
|           4 | Android Phones |                  2 |
|           5 | iPhones        |                  2 |
|           6 | Gaming Laptops |                  3 |

Assume this is an additional example table named `categories`, with the specified parent column.

### Find the complete category hierarchy

```sql
WITH RECURSIVE category_tree AS (

    SELECT
        category_id,
        category_name,
        parent_category_id,
        1 AS level
    FROM categories
    WHERE parent_category_id IS NULL

    UNION ALL

    SELECT
        c.category_id,
        c.category_name,
        c.parent_category_id,
        ct.level + 1
    FROM categories AS c
    JOIN category_tree AS ct
        ON c.parent_category_id = ct.category_id

)

SELECT *
FROM category_tree
ORDER BY level, category_id;
```

### Find all descendants of Electronics

```sql
WITH RECURSIVE category_tree AS (

    SELECT
        category_id,
        category_name,
        parent_category_id,
        1 AS level
    FROM categories
    WHERE category_id = 1

    UNION ALL

    SELECT
        c.category_id,
        c.category_name,
        c.parent_category_id,
        ct.level + 1
    FROM categories AS c
    JOIN category_tree AS ct
        ON c.parent_category_id = ct.category_id

)

SELECT *
FROM category_tree
WHERE level > 1;
```

This returns all subcategories below Electronics.

---

## 12. Recursive CTE vs Self JOIN

A self JOIN joins a table with itself.

It is useful for relationships at a fixed depth.

### Find employees and their direct managers

```sql
SELECT
    e.employee_name AS employee,
    m.employee_name AS manager
FROM employees AS e
LEFT JOIN employees AS m
    ON e.manager_id = m.employee_id;
```

This retrieves one management level.

### Find multiple hierarchy levels

You could manually create multiple self JOINs:

```sql
SELECT
    e.employee_name AS employee,
    m.employee_name AS manager,
    gm.employee_name AS grand_manager
FROM employees AS e
LEFT JOIN employees AS m
    ON e.manager_id = m.employee_id
LEFT JOIN employees AS gm
    ON m.manager_id = gm.employee_id;
```

But this only handles the number of levels explicitly written.

A recursive CTE can traverse an arbitrary number of levels.

### Comparison

| Self JOIN                                  | Recursive CTE                                           |
| ------------------------------------------ | ------------------------------------------------------- |
| Useful for fixed-depth relationships       | Useful for variable-depth hierarchies                   |
| Requires additional JOINs for each level   | Traverses levels recursively                            |
| Simpler for direct relationships           | Better for complete tree traversal                      |
| Does not inherently handle arbitrary depth | Can handle arbitrary depth with a termination condition |

---

## 13. Recursive CTE Execution Model

PostgreSQL evaluates a recursive CTE iteratively using working results.

Conceptually:

1. Execute the anchor member.
2. Put its rows into the working set.
3. Execute the recursive member using the current working set.
4. Add newly generated rows to the result.
5. Use those new rows as the next working set.
6. Stop when the recursive member produces no rows.

This is iterative execution, not ordinary function-style recursion that repeatedly calls itself on the application stack.

### Important PostgreSQL behavior

- The anchor member establishes the initial result.
- The recursive member references the CTE itself.
- The recursive member is evaluated repeatedly.
- The column count and compatible data types must match between anchor and recursive members.
- The recursion stops when no new rows are produced.

---

## 14. Common Mistakes

| Mistake                                                  | Correct understanding                                |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Forgetting `WITH RECURSIVE`                              | PostgreSQL requires it for self-referencing CTEs     |
| Missing the anchor member                                | Recursion needs an initial result                    |
| Missing termination logic                                | Can produce unbounded recursion                      |
| Using incompatible column types                          | Anchor and recursive columns need compatible types   |
| Assuming UNION always prevents cycles                    | Duplicate rows may differ by level or path           |
| Forgetting cycle detection                               | Hierarchical data can contain circular references    |
| Starting only from roots when cycles may be disconnected | Root-based traversal cannot discover rootless cycles |
| Using recursive CTEs for simple sequences                | GENERATE_SERIES is simpler                           |
| Using recursive CTEs for fixed-depth relationships       | A self JOIN may be simpler                           |
| Assuming result order follows traversal order            | Add an explicit ORDER BY                             |

---

## 15. Practice Exercises

Use the TechBazaar database and the additional category hierarchy example.

1. Generate numbers from 1 to 50 using a recursive CTE.
2. Generate dates for an entire month.
3. Generate dates between two user-supplied dates.
4. Display the complete employee hierarchy starting from top-level managers.
5. Find all direct and indirect subordinates of a given employee.
6. Find the management chain of a specific employee.
7. Display employee hierarchy with a path array.
8. Find the top-level manager of each employee.
9. Find all descendants of a given product category.
10. Display category hierarchy with indentation based on level.
11. Compare a recursive CTE with multiple self JOINs.
12. Create circular employee-manager data in a test environment and investigate cycle detection.
13. Rewrite an employee hierarchy query using PostgreSQL's CYCLE clause.
14. Explain why UNION is not sufficient for every cycle-detection problem.
15. Compare recursive CTEs with GENERATE_SERIES for number generation.

---

## 16. Interview Questions

**Q1. What is a recursive CTE?**

A CTE that references itself to repeatedly generate or process rows.

**Q2. What are the two main parts of a recursive CTE?**

The anchor member and the recursive member.

**Q3. What is the anchor member?**

The initial query that generates the starting rows.

**Q4. What is the recursive member?**

The query that references the recursive CTE and generates subsequent rows.

**Q5. When does recursion stop?**

When the recursive member produces no more rows.

**Q6. What is a common use case for recursive CTEs?**

Traversing hierarchical relationships such as employee-manager or category-parent structures.

**Q7. What is the difference between UNION and UNION ALL in recursive CTEs?**

UNION removes duplicate rows, while UNION ALL preserves them.

**Q8. Does UNION guarantee cycle prevention?**

No. A revisited entity can produce a different row if other columns change.

**Q9. How can PostgreSQL detect cycles in recursive CTEs?**

Using explicit path tracking or the CYCLE clause.

**Q10. What is the difference between a recursive CTE and a self JOIN?**

A self JOIN is generally suited to fixed-depth relationships, while recursive CTEs handle variable-depth traversal.

**Q11. What is GENERATE_SERIES()?**

A PostgreSQL set-returning function that generates a sequence of values, often simpler than a recursive CTE for numbers and dates.

**Q12. Is a recursive CTE executed using ordinary application-style recursion?**

No. PostgreSQL evaluates recursive CTEs iteratively using working result sets.

---

## Key Takeaways

- Recursive CTEs use `WITH RECURSIVE`.
- Every recursive CTE has an anchor member and a recursive member.
- The anchor creates starting rows.
- The recursive member generates subsequent rows.
- Recursion stops when no new rows are generated.
- Employee-manager and category-parent relationships are common use cases.
- Arrays can track traversal paths.
- PostgreSQL supports cycle detection using the CYCLE clause.
- UNION does not automatically prevent every recursive cycle.
- Use self JOINs for fixed-depth relationships and recursive CTEs for variable-depth hierarchies.
- Use GENERATE_SERIES() for simple numeric and date sequences.
