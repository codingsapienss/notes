---
sidebar_label: "Database, Schema and Table Fundamentals"
sidebar_position: 1
---

# Database, Schema and Table Fundamentals

## 1. Database

A **database** is an organized collection of data that can be stored, accessed, managed, and modified.

Example: `techbazaar` is a database for an e-commerce application.

It may contain information about:

- Employees
- Customers
- Products
- Orders
- Payments
- Inventory

### Create a database

```sql
CREATE DATABASE techbazaar;
```

### Delete a database

```sql
DROP DATABASE techbazaar;
```

**Important:**

- `CREATE DATABASE` creates a new database.
- `DROP DATABASE` permanently removes the database and its contents.
- PostgreSQL does not allow dropping the database to which your current session is connected.

## 2. Schema

A **schema** is a logical namespace inside a database used to organize database objects such as tables, views, functions, and sequences.

A database can contain multiple schemas.

Example:

```text
techbazaar
    |
    |-- public
    |     |-- customers
    |     |-- products
    |
    |-- sales
    |     |-- orders
    |     |-- payments
    |
    |-- inventory
          |-- stock
          |-- warehouses
```

### Create a schema

```sql
CREATE SCHEMA sales;
```

### Create a schema with an owner

```sql
CREATE SCHEMA sales AUTHORIZATION postgres;
```

### Delete a schema

```sql
DROP SCHEMA sales;
```

### Delete a schema and its contained objects

```sql
DROP SCHEMA sales CASCADE;
```

**Important:**

- `DROP SCHEMA` fails if the schema contains objects.
- `CASCADE` removes the schema and its dependent objects.
- Use `CASCADE` carefully because it can delete more than expected.

## 3. Database vs Schema

| Database                             | Schema                                        |
| ------------------------------------ | --------------------------------------------- |
| Top-level logical database container | Namespace inside a database                   |
| Can contain multiple schemas         | Can contain tables, views, functions, etc.    |
| Separate database connections        | Accessed through a connection to its database |
| Created using `CREATE DATABASE`      | Created using `CREATE SCHEMA`                 |

**PostgreSQL-specific behaviour:** Unlike MySQL, PostgreSQL treats a schema and a database as different concepts. In MySQL, `CREATE SCHEMA` is essentially a synonym for `CREATE DATABASE`.

## 4. Table

A **table** stores structured data in rows and columns.

Example: `employees`

| employee_id | employee_name | salary | department |
| ----------: | ------------- | -----: | ---------- |
|           1 | Rahul         |  45000 | IT         |
|           2 | Priya         |  55000 | HR         |
|           3 | Amit          |  40000 | Sales      |

- **Column:** Defines an attribute, such as `employee_name` or `salary`.
- **Row:** Represents one record.
- **Cell:** A single value at the intersection of a row and column.
- **Data type:** Defines what kind of value a column can store.

## 5. CREATE TABLE

Syntax:

```sql
CREATE TABLE table_name (
    column1 DATA_TYPE,
    column2 DATA_TYPE,
    column3 DATA_TYPE
);
```

Example:

```sql
CREATE TABLE employees (
    employee_id INT,
    employee_name VARCHAR(100),
    salary NUMERIC(10, 2),
    joining_date DATE
);
```

This creates an empty table with four columns.

### Insert sample data

```sql
INSERT INTO employees
    (employee_id, employee_name, salary, joining_date)
VALUES
    (1, 'Rahul', 45000, '2025-01-10'),
    (2, 'Priya', 55000, '2025-02-15'),
    (3, 'Amit', 40000, '2025-03-20');
```

### Retrieve table data

```sql
SELECT * FROM employees;
```

## 6. Fully Qualified Table Names

A table can be referenced using its schema name.

```sql
SELECT * FROM public.employees;
```

General syntax:

```sql
SELECT * FROM schema_name.table_name;
```

This is useful when multiple schemas contain tables with the same name.

Example:

```sql
SELECT * FROM sales.orders;

SELECT * FROM inventory.orders;
```

Both references can point to different tables.

## 7. The `public` Schema

PostgreSQL creates a `public` schema by default in a newly created database.

When you create a table without specifying a schema:

```sql
CREATE TABLE employees (
    id INT,
    name VARCHAR(100)
);
```

PostgreSQL uses the schema selected through the `search_path`.

In a default PostgreSQL setup, this commonly means the table is created in `public`.

Explicitly specify the schema when you want to avoid ambiguity:

```sql
CREATE TABLE public.employees (
    id INT,
    name VARCHAR(100)
);
```

## 8. Understanding `search_path`

`search_path` determines the order in which PostgreSQL searches schemas for unqualified object names.

Check the current search path:

```sql
SHOW search_path;
```

Example output:

```text
"$user", public
```

If you execute:

```sql
SELECT * FROM employees;
```

PostgreSQL searches the schemas in the configured order.

### Change search_path

```sql
SET search_path TO sales, public;
```

Now PostgreSQL searches `sales` first, then `public`.

Check it:

```sql
SHOW search_path;
```

**Important:**

- `SET search_path` affects the current database session.
- It does not move or rename existing tables.
- Use fully qualified names when object resolution must be explicit.
- An incorrectly configured search path can cause queries to access an unintended table.

## 9. Inspecting Database Objects

PostgreSQL provides SQL queries and psql meta-commands for inspecting database structures.

### List databases — psql

```sql
\l
```

### Connect to a database — psql

```sql
\c techbazaar
```

### List schemas — psql

```sql
\dn
```

### List tables — psql

```sql
\dt
```

### List tables in a particular schema — psql

```sql
\dt sales.*
```

### Describe a table — psql

```sql
\d employees
```

### Detailed table information — psql

```sql
\d+ employees
```

### Inspect schemas using SQL

```sql
SELECT schema_name
FROM information_schema.schemata;
```

### Inspect tables using SQL

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;
```

### Inspect columns of a table

```sql
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'employees'
ORDER BY ordinal_position;
```

**Important:** Commands such as `\dt`, `\d`, and `\dn` are psql meta-commands, not SQL. Use the `information_schema` views when you need SQL queries that work in tools such as pgAdmin.

## 10. Create Tables in Different Schemas

```sql
CREATE SCHEMA sales;

CREATE SCHEMA inventory;
```

Create a table in `sales`:

```sql
CREATE TABLE sales.orders (
    order_id INT,
    customer_name VARCHAR(100),
    total_amount NUMERIC(10, 2)
);
```

Create a table in `inventory`:

```sql
CREATE TABLE inventory.products (
    product_id INT,
    product_name VARCHAR(100),
    stock_quantity INT
);
```

Insert data:

```sql
INSERT INTO sales.orders
VALUES (1, 'Rahul', 2500.00);

INSERT INTO inventory.products
VALUES (101, 'Keyboard', 50);
```

Retrieve data:

```sql
SELECT * FROM sales.orders;

SELECT * FROM inventory.products;
```

## 11. Important PostgreSQL Rules

| Rule                  | Explanation                                                    |
| --------------------- | -------------------------------------------------------------- |
| Database isolation    | A PostgreSQL connection is connected to one database at a time |
| Multiple schemas      | A database can contain multiple schemas                        |
| Multiple tables       | A schema can contain multiple tables                           |
| Duplicate table names | Different schemas can contain tables with the same name        |
| Default schema        | `public` is commonly available by default                      |
| `search_path`         | Controls schema lookup for unqualified names                   |
| Qualified name        | `schema_name.table_name` explicitly identifies a table         |
| Schema deletion       | `CASCADE` can remove contained objects and dependencies        |

## 12. Practice Exercises

Use the `techbazaar` database.

1. Create a database named `techbazaar`.
2. Create three schemas: `sales`, `inventory`, and `hr`.
3. Create an `employees` table inside `hr`.
4. Create a `products` table inside `inventory`.
5. Create an `orders` table inside `sales`.
6. Insert at least three records into each table.
7. Retrieve data using fully qualified table names.
8. Display all schemas using `information_schema`.
9. Display all tables and their schemas.
10. Inspect the columns of the `employees` table.
11. Change the `search_path` to `sales, public`.
12. Explain the difference between a database, schema, and table.

## 13. Interview Questions

1. What is a database schema?
2. Can one PostgreSQL database contain multiple schemas?
3. Can two schemas contain tables with the same name?
4. What is the `public` schema?
5. What is the purpose of `search_path`?
6. What is a fully qualified table name?
7. What is the difference between `DROP SCHEMA` and `DROP SCHEMA CASCADE`?
8. Can PostgreSQL connect to multiple databases using one connection?
9. What is `information_schema`?
10. How is a schema different in PostgreSQL and MySQL?
