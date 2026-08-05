---
sidebar_label: "DDL: Data Definition Language Fundamentals"
sidebar_position: 1
---

# DDL: Data Definition Language Fundamentals

## 1. What is DDL?

**DDL (Data Definition Language)** is a category of SQL commands used to define, create, modify, and remove database structures.

DDL operates on database objects such as:

- Databases
- Schemas
- Tables
- Views
- Indexes
- Sequences

**Main DDL commands:**

| Command  | Purpose                       |
| -------- | ----------------------------- |
| CREATE   | Creates database objects      |
| ALTER    | Modifies existing objects     |
| DROP     | Removes database objects      |
| TRUNCATE | Removes all rows from a table |

## 2. CREATE

Creates a new database object.

### Create a database

```sql
CREATE DATABASE techbazaar;
```

### Create a schema

```sql
CREATE SCHEMA sales;
```

### Create a table

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    salary NUMERIC(10, 2)
);
```

### Create an index

```sql
CREATE INDEX idx_employee_name
ON employees(employee_name);
```

**Key point:** CREATE defines new database structures. It does not insert ordinary table records.

## 3. ALTER

Modifies the structure of an existing database object.

### Add a column

```sql
ALTER TABLE employees
ADD COLUMN email TEXT;
```

### Change a column's data type

```sql
ALTER TABLE employees
ALTER COLUMN salary TYPE NUMERIC(12, 2);
```

### Rename a column

```sql
ALTER TABLE employees
RENAME COLUMN email TO employee_email;
```

### Rename a table

```sql
ALTER TABLE employees
RENAME TO staff;
```

### Add a constraint

```sql
ALTER TABLE staff
ADD CONSTRAINT uq_staff_email UNIQUE (employee_email);
```

**Key point:** ALTER changes the structure of an existing object. It does not normally modify the existing records' business values.

## 4. DROP

Permanently removes a database object.

### Drop a table

```sql
DROP TABLE employees;
```

### Drop a database

```sql
DROP DATABASE techbazaar;
```

### Drop a schema

```sql
DROP SCHEMA sales;
```

### Drop a table and dependent objects

```sql
DROP TABLE employees CASCADE;
```

**Important:**

- DROP removes the object itself.
- Its associated data is also removed.
- CASCADE can remove dependent objects.
- RESTRICT prevents removal when dependent objects exist; it is the default behaviour for DROP TABLE.

## 5. TRUNCATE

Removes all rows from a table while keeping its structure.

```sql
TRUNCATE TABLE employees;
```

After execution:

- All rows are removed.
- The table still exists.
- Columns and constraints remain.
- Indexes remain.
- The table can receive new records.

### Reset identity values

```sql
TRUNCATE TABLE employees RESTART IDENTITY;
```

Resets sequences owned by identity or serial columns.

### Keep identity sequence values

```sql
TRUNCATE TABLE employees CONTINUE IDENTITY;
```

This is the default behaviour.

### Truncate dependent tables

```sql
TRUNCATE TABLE departments CASCADE;
```

This also truncates tables that reference the specified table through foreign keys, subject to PostgreSQL's dependency rules.

**Warning:** CASCADE can remove data from multiple tables. Review dependencies before executing it.

## 6. DDL vs DML vs DQL vs DCL vs TCL

| Category | Full form                    | Purpose                     | Commands                           |
| -------- | ---------------------------- | --------------------------- | ---------------------------------- |
| DDL      | Data Definition Language     | Defines database structures | CREATE, ALTER, DROP, TRUNCATE      |
| DML      | Data Manipulation Language   | Modifies records            | INSERT, UPDATE, DELETE             |
| DQL      | Data Query Language          | Retrieves records           | SELECT                             |
| DCL      | Data Control Language        | Manages permissions         | GRANT, REVOKE                      |
| TCL      | Transaction Control Language | Manages transactions        | BEGIN, COMMIT, ROLLBACK, SAVEPOINT |

Example:

```sql
-- DDL
CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    product_name TEXT
);

-- DML
INSERT INTO products
VALUES (1, 'Laptop');

-- DQL
SELECT * FROM products;

-- DML
UPDATE products
SET product_name = 'Gaming Laptop'
WHERE product_id = 1;

-- DML
DELETE FROM products
WHERE product_id = 1;

-- TCL
BEGIN;
COMMIT;
```

**Important:** These are conventional SQL command classifications. PostgreSQL's SQL language also supports commands that do not fit neatly into these five categories.

## 7. DDL vs DML — Key Differences

| Feature           | DDL                         | DML                         |
| ----------------- | --------------------------- | --------------------------- |
| Purpose           | Defines database structures | Manipulates table records   |
| Works on          | Database objects            | Stored data                 |
| Examples          | CREATE, ALTER, DROP         | INSERT, UPDATE, DELETE      |
| Example operation | Add a column                | Change an employee's salary |
| Changes           | Structure                   | Data                        |

Example:

```sql
-- DDL: Add a new column
ALTER TABLE employees
ADD COLUMN department TEXT;

-- DML: Update its value
UPDATE employees
SET department = 'IT'
WHERE employee_id = 1;
```

## 8. Does PostgreSQL Automatically Commit DDL?

A common misconception is that DDL commands always execute with an automatic commit.

**In PostgreSQL, most DDL commands are transactional.**

Example:

```sql
BEGIN;

CREATE TABLE test_table (
    id INTEGER
);

ROLLBACK;
```

The table creation is rolled back. `test_table` does not remain.

Similarly:

```sql
BEGIN;

DROP TABLE employees;

ROLLBACK;
```

The table drop is rolled back, restoring the table.

**Important:** PostgreSQL has exceptions. For example, `CREATE DATABASE`, `DROP DATABASE`, and `CREATE INDEX CONCURRENTLY` cannot run inside an explicit transaction block.

Do not assume every PostgreSQL command supports transactional rollback.

## 9. Important PostgreSQL DDL Behaviour

| Command         | Removes data?    | Removes structure? | Transactional in PostgreSQL? |
| --------------- | ---------------- | ------------------ | ---------------------------- |
| CREATE TABLE    | No existing data | Creates structure  | Yes                          |
| ALTER TABLE     | Usually no       | Modifies structure | Yes                          |
| DROP TABLE      | Yes              | Yes                | Yes                          |
| TRUNCATE        | Yes, all rows    | No                 | Yes                          |
| CREATE DATABASE | No               | Creates database   | No                           |
| CREATE INDEX    | No               | Creates index      | Yes, except CONCURRENTLY     |

## 10. Common Mistakes

1. Classifying INSERT as DDL instead of DML.
2. Confusing DROP with TRUNCATE.
3. Assuming TRUNCATE deletes the table itself.
4. Assuming ALTER modifies ordinary record values.
5. Using CASCADE without checking dependencies.
6. Assuming all DDL commands automatically commit in PostgreSQL.
7. Assuming TRUNCATE resets sequences by default.
8. Forgetting that TRUNCATE can be rolled back in PostgreSQL.

## 11. Practice Exercises

Use the `techbazaar` database.

1. Create a table named `test_products`.
2. Add a `price` column.
3. Rename `price` to `product_price`.
4. Change its data type to `NUMERIC(10,2)`.
5. Add a UNIQUE constraint.
6. Insert five sample records.
7. Remove all records using TRUNCATE.
8. Truncate the table and restart its identity sequence.
9. Drop the table.
10. Create a table inside an explicit transaction and roll back.
11. Explain the difference between DROP, TRUNCATE, and DELETE.
12. Identify which PostgreSQL DDL commands cannot run inside an explicit transaction block.

## 12. Interview Questions

1. What is DDL?
2. What are the main DDL commands?
3. What is the difference between DDL and DML?
4. What is the difference between DROP and TRUNCATE?
5. Does TRUNCATE remove the table structure?
6. What does CASCADE do?
7. What is the difference between RESTART IDENTITY and CONTINUE IDENTITY?
8. Are PostgreSQL DDL commands transactional?
9. Can you roll back a DROP TABLE in PostgreSQL?
10. Can CREATE DATABASE run inside a transaction block?
11. What is the difference between ALTER and UPDATE?
12. Does TRUNCATE remove indexes and constraints?
