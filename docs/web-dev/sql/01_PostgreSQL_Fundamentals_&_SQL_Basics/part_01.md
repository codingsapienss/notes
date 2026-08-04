---
sidebar_label: "Introduction to SQL and PostgreSQL"
sidebar_position: 1
---

# Introduction to SQL and PostgreSQL

## 1. What is SQL?

**SQL (Structured Query Language)** is a language used to communicate with relational databases.

It allows you to:

- Create and modify database structures.
- Insert, retrieve, update, and delete data.
- Define relationships and constraints.
- Control access and permissions.
- Manage transactions.

Example:

```sql
SELECT * FROM employees;
```

This retrieves all rows and columns from the `employees` table.

## 2. What is PostgreSQL?

**PostgreSQL** is an open-source, object-relational database management system (ORDBMS) that uses SQL.

Key features:

- ACID-compliant transactions.
- Primary keys, foreign keys, and constraints.
- Advanced indexing and query optimization.
- JSON and JSONB support.
- Views, triggers, functions, and stored procedures.
- Concurrent access through MVCC.
- Extensible architecture.

## 3. SQL vs PostgreSQL

| SQL                                                  | PostgreSQL                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Query language                                       | Database management system                                   |
| Defines how to communicate with relational databases | Executes SQL queries and manages data                        |
| Has standardized syntax                              | Implements SQL standards with PostgreSQL-specific extensions |
| Not a database itself                                | An actual database system                                    |

**Other SQL database systems:** MySQL, Microsoft SQL Server, Oracle Database, SQLite.

The same SQL query may behave differently across database systems because each implements its own extensions and rules.

## 4. Categories of SQL Commands

SQL commands are commonly grouped into five categories:

| Category | Purpose                    | Common commands                    |
| -------- | -------------------------- | ---------------------------------- |
| DDL      | Define database structures | CREATE, ALTER, DROP, TRUNCATE      |
| DML      | Modify table data          | INSERT, UPDATE, DELETE             |
| DQL      | Retrieve data              | SELECT                             |
| DCL      | Manage permissions         | GRANT, REVOKE                      |
| TCL      | Manage transactions        | BEGIN, COMMIT, ROLLBACK, SAVEPOINT |

**Important:** These are conventional learning classifications, not five separate languages. PostgreSQL supports these command types.

Example:

```sql
-- DDL
CREATE TABLE employees (
    id INT,
    name VARCHAR(100)
);

-- DML
INSERT INTO employees VALUES (1, 'John');

-- DQL
SELECT * FROM employees;

-- DML
UPDATE employees SET name = 'Alex' WHERE id = 1;

-- DML
DELETE FROM employees WHERE id = 1;

-- TCL
BEGIN;
UPDATE employees SET name = 'David' WHERE id = 2;
COMMIT;
```

## 5. SQL Syntax Rules in PostgreSQL

### A. SQL keywords are case-insensitive

Both queries work identically:

```sql
SELECT * FROM employees;

select * from employees;
```

**Best practice:** Use uppercase SQL keywords for readability.

### B. Table and column identifiers

PostgreSQL treats unquoted and quoted identifiers differently.

```sql
CREATE TABLE employees (
    employee_id INT,
    employee_name VARCHAR(100)
);
```

Unquoted identifiers are automatically converted to lowercase.

```sql
SELECT employee_id FROM employees;
```

Quoted identifiers preserve their exact case:

```sql
CREATE TABLE "EmployeeDetails" (
    "EmployeeId" INT
);
```

You must use the exact quoted spelling:

```sql
SELECT "EmployeeId" FROM "EmployeeDetails";
```

**Best practice:** Use lowercase `snake_case` names and avoid quoted identifiers.

### C. Semicolon (`;`)

A semicolon terminates an SQL statement.

```sql
SELECT * FROM employees;

SELECT * FROM departments;
```

It is especially important when executing multiple statements together.

### D. Comments

Single-line comment:

```sql
-- Retrieve all employees
SELECT * FROM employees;
```

Multi-line comment:

```sql
/*
This query retrieves
all employees.
*/
SELECT * FROM employees;
```

Comments are ignored during SQL execution.

## 6. Connecting to PostgreSQL

You can interact with PostgreSQL using:

| Tool         | Purpose                                     |
| ------------ | ------------------------------------------- |
| pgAdmin      | Graphical interface for managing PostgreSQL |
| psql         | Command-line PostgreSQL client              |
| Node.js `pg` | Connect PostgreSQL to backend applications  |
| DBeaver      | GUI database management tool                |

### PostgreSQL connection details

Common default configuration:

| Parameter | Default                 |
| --------- | ----------------------- |
| Host      | localhost               |
| Port      | 5432                    |
| Username  | postgres                |
| Password  | Set during installation |
| Database  | postgres                |

Example connection string:

```text
postgresql://postgres:password@localhost:5432/postgres
```

Format:

```text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

Never expose database credentials in frontend code or commit them to Git.

## 7. Creating and Connecting to a Database

### Create a database

```sql
CREATE DATABASE techbazaar;
```

### List databases — psql

```sql
\l
```

### Connect to a database — psql

```sql
\c techbazaar
```

**Important:** `\l` and `\c` are psql meta-commands, not standard SQL statements. They will not work as SQL queries in pgAdmin's Query Tool.

In pgAdmin, select the `techbazaar` database and open its Query Tool.

### Check the current database

```sql
SELECT current_database();
```

### Check the current user

```sql
SELECT current_user;
```

### Check the PostgreSQL version

```sql
SELECT version();
```

## 8. PostgreSQL Database Hierarchy

```text
PostgreSQL Server
    |
    |-- Database: techbazaar
    |       |
    |       |-- Schema: public
    |       |       |
    |       |       |-- Table: employees
    |       |       |-- Table: customers
    |       |       |-- Table: products
    |       |       |-- Table: orders
    |       |
    |       |-- Schema: sales
    |
    |-- Database: another_database
```

- **Server:** PostgreSQL database server instance.
- **Database:** A separate database within that server.
- **Schema:** A namespace used to organize database objects.
- **Table:** Stores structured data in rows and columns.

A PostgreSQL server can host multiple databases. A connection is made to one database at a time.

## 9. Important PostgreSQL vs MySQL Differences

| Feature                           | PostgreSQL                | MySQL                                                           |
| --------------------------------- | ------------------------- | --------------------------------------------------------------- |
| Default port                      | 5432                      | 3306                                                            |
| Auto-generated IDs                | SERIAL / IDENTITY         | AUTO_INCREMENT                                                  |
| JSON support                      | JSON / JSONB              | JSON                                                            |
| String concatenation              | `\|\|`                    | `CONCAT()`                                                      |
| Case-insensitive pattern matching | ILIKE                     | Commonly LIKE with case-insensitive collation                   |
| Returning inserted rows           | RETURNING                 | RETURNING support varies by version; not historically supported |
| Upsert                            | ON CONFLICT               | ON DUPLICATE KEY UPDATE                                         |
| Default storage engine            | PostgreSQL storage engine | InnoDB                                                          |

**Important:** SQL knowledge transfers between databases, but syntax and behaviour are not always interchangeable.

## 10. Quick Revision

| Concept              | Remember                                               |
| -------------------- | ------------------------------------------------------ |
| SQL                  | Language used to communicate with relational databases |
| PostgreSQL           | Open-source relational/object-relational DBMS          |
| DDL                  | Defines database structures                            |
| DML                  | Modifies data                                          |
| DQL                  | Retrieves data                                         |
| DCL                  | Controls permissions                                   |
| TCL                  | Controls transactions                                  |
| `;`                  | Terminates SQL statements                              |
| `--`                 | Single-line comment                                    |
| `/* */`              | Multi-line comment                                     |
| `\l`                 | Lists databases in psql                                |
| `\c`                 | Connects to a database in psql                         |
| `current_database()` | Returns current database name                          |

## 11. Practice Exercises

1. Write a query to display the current PostgreSQL version.
2. Write a query to display the current database and user.
3. Create a database named `techbazaar`.
4. Connect to `techbazaar` using psql.
5. Write two SELECT statements using uppercase and lowercase SQL keywords.
6. Write a query containing both single-line and multi-line comments.
7. Explain the difference between SQL and PostgreSQL.
8. Classify CREATE, INSERT, SELECT, UPDATE, GRANT, and COMMIT into their respective categories.

## 12. Interview Questions

1. What is SQL, and why is it used?
2. What is PostgreSQL?
3. Is SQL a programming language or a query language?
4. What is the difference between SQL and PostgreSQL?
5. Explain DDL, DML, DQL, DCL, and TCL.
6. Are SQL keywords case-sensitive in PostgreSQL?
7. What is the difference between single quotes and double quotes?
8. What is the difference between a PostgreSQL server and a database?
9. What is the default PostgreSQL port?
10. What are psql meta-commands? Are they SQL statements?
