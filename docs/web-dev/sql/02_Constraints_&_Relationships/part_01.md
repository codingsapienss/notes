---
sidebar_label: "SQL Constraints Fundamentals"
sidebar_position: 1
---

# SQL Constraints Fundamentals

## 1. What are Constraints?

**Constraints** are rules applied to table columns or entire tables to enforce data integrity and prevent invalid data from being stored.

Example: An employee's salary should not be negative, and their email should be unique.

PostgreSQL supports these main constraints:

| Constraint  | Purpose                                   |
| ----------- | ----------------------------------------- |
| NOT NULL    | Prevents NULL values                      |
| UNIQUE      | Prevents duplicate values                 |
| PRIMARY KEY | Uniquely identifies each row              |
| FOREIGN KEY | Enforces relationships between tables     |
| CHECK       | Validates values against a condition      |
| DEFAULT     | Supplies a value when one is not provided |

## 2. NOT NULL Constraint

Ensures that a column cannot contain NULL.

```sql
CREATE TABLE employees (
    employee_id BIGINT,
    employee_name TEXT NOT NULL,
    salary NUMERIC(10, 2)
);
```

Valid:

```sql
INSERT INTO employees
VALUES (1, 'Rahul', 45000);
```

Invalid:

```sql
INSERT INTO employees
VALUES (2, NULL, 50000);
```

PostgreSQL rejects the second insertion.

**Important:** NOT NULL does not prevent empty strings or zero.

```sql
INSERT INTO employees
VALUES (3, '', 0);
```

This is valid because neither value is NULL.

## 3. UNIQUE Constraint

Ensures that values in a column or combination of columns are unique.

```sql
CREATE TABLE customers (
    customer_id BIGINT,
    email TEXT UNIQUE
);
```

Valid:

```sql
INSERT INTO customers VALUES (1, 'rahul@gmail.com');
INSERT INTO customers VALUES (2, 'priya@gmail.com');
```

Invalid:

```sql
INSERT INTO customers VALUES (3, 'rahul@gmail.com');
```

The duplicate email is rejected.

### UNIQUE on Multiple Columns

```sql
CREATE TABLE employee_contacts (
    employee_id BIGINT,
    contact_type TEXT,
    contact_value TEXT,

    UNIQUE (employee_id, contact_type)
);
```

The combination of `employee_id` and `contact_type` must be unique.

### Important PostgreSQL Behaviour: UNIQUE and NULL

By default, PostgreSQL allows multiple NULL values in a UNIQUE column.

```sql
CREATE TABLE users (
    email TEXT UNIQUE
);

INSERT INTO users VALUES (NULL);
INSERT INTO users VALUES (NULL);
```

Both insertions succeed.

To treat NULL values as equal for uniqueness:

```sql
CREATE TABLE users (
    email TEXT UNIQUE NULLS NOT DISTINCT
);
```

Now only one NULL is allowed.

**Remember:** Use `NOT NULL UNIQUE` when a value must be present and unique, such as a required email address.

## 4. PRIMARY KEY Constraint

A primary key uniquely identifies every row.

```sql
CREATE TABLE departments (
    department_id BIGINT PRIMARY KEY,
    department_name TEXT
);
```

A primary key combines two rules:

- UNIQUE
- NOT NULL

You cannot insert duplicate or NULL primary key values.

### Composite Primary Key

A primary key can consist of multiple columns.

```sql
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    quantity INTEGER,

    PRIMARY KEY (order_id, product_id)
);
```

The combination of `order_id` and `product_id` must be unique.

**Important:** A table can have only one primary key constraint, but that constraint can contain multiple columns.

## 5. FOREIGN KEY Constraint

A foreign key establishes a relationship between two tables and enforces referential integrity.

Example:

```sql
CREATE TABLE departments (
    department_id BIGINT PRIMARY KEY,
    department_name TEXT NOT NULL
);

CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department_id BIGINT,

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);
```

Here:

- `departments.department_id` is the referenced primary key.
- `employees.department_id` is the foreign key.

Valid insertion:

```sql
INSERT INTO departments
VALUES (1, 'IT');

INSERT INTO employees
VALUES (101, 'Rahul', 1);
```

Invalid insertion:

```sql
INSERT INTO employees
VALUES (102, 'Priya', 99);
```

If department `99` does not exist, PostgreSQL rejects the insertion.

### Important Rules

- A foreign key can contain NULL unless NOT NULL is also applied.
- Referenced columns must be backed by a suitable unique or primary key constraint.
- A foreign key does not automatically create an index on the referencing column in PostgreSQL.
- A foreign key can reference a composite primary key or another suitable unique key.

## 6. CHECK Constraint

Validates column values against a Boolean condition.

Example:

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    age INTEGER CHECK (age >= 18),
    salary NUMERIC(10, 2) CHECK (salary >= 0)
);
```

Valid:

```sql
INSERT INTO employees
VALUES (1, 'Rahul', 25, 45000);
```

Invalid:

```sql
INSERT INTO employees
VALUES (2, 'Priya', 16, 30000);
```

The age condition fails.

### Multiple Conditions

```sql
CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2),
    stock_quantity INTEGER,

    CHECK (price >= 0 AND stock_quantity >= 0)
);
```

### IN with CHECK

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended'))
);
```

Only the specified status values are accepted, except NULL, which passes a CHECK condition unless separately prohibited.

**Important:** A CHECK constraint rejects FALSE. TRUE and NULL both pass.

Use NOT NULL when NULL must also be prohibited.

## 7. DEFAULT Constraint

Provides a default value when an INSERT statement does not specify a column value or explicitly uses DEFAULT.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Insert:

```sql
INSERT INTO employees (employee_id, employee_name)
VALUES (1, 'Rahul');
```

PostgreSQL automatically supplies:

- `status = 'active'`
- `created_at = current timestamp`

### Explicit DEFAULT

```sql
INSERT INTO employees
    (employee_id, employee_name, status)
VALUES
    (2, 'Priya', DEFAULT);
```

### DEFAULT vs NULL

```sql
INSERT INTO employees
    (employee_id, employee_name, status)
VALUES
    (3, 'Amit', NULL);
```

Here, status becomes NULL, not `'active'`.

**Important:** DEFAULT is applied when a column is omitted or assigned DEFAULT. It does not replace explicitly supplied NULL values.

## 8. Combining Multiple Constraints

A column can have multiple constraints.

```sql
CREATE TABLE customers (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER CHECK (age >= 18),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

This table enforces:

| Column        | Constraint        | Rule                          |
| ------------- | ----------------- | ----------------------------- |
| customer_id   | PRIMARY KEY       | Unique and non-NULL           |
| customer_name | NOT NULL          | Name is required              |
| email         | NOT NULL, UNIQUE  | Required and unique           |
| age           | CHECK             | Must be at least 18           |
| status        | NOT NULL, DEFAULT | Defaults to active            |
| created_at    | NOT NULL, DEFAULT | Defaults to current timestamp |

## 9. Named Constraints

PostgreSQL allows you to assign explicit names to constraints.

This makes them easier to identify, modify, and remove.

```sql
CREATE TABLE employees (
    employee_id BIGINT,

    CONSTRAINT pk_employees
        PRIMARY KEY (employee_id),

    employee_name TEXT
        CONSTRAINT nn_employee_name NOT NULL,

    email TEXT
        CONSTRAINT uq_employee_email UNIQUE,

    salary NUMERIC(10, 2)
        CONSTRAINT chk_employee_salary CHECK (salary >= 0)
);
```

### Table-Level Constraint Naming

```sql
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    quantity INTEGER,

    CONSTRAINT pk_order_items
        PRIMARY KEY (order_id, product_id),

    CONSTRAINT chk_order_quantity
        CHECK (quantity > 0)
);
```

**Best practice:** Use meaningful constraint names such as:

- `pk_` → Primary key
- `fk_` → Foreign key
- `uq_` → Unique
- `chk_` → Check
- `nn_` → Not null

## 10. Adding Constraints to Existing Tables

Constraints can be added after table creation using ALTER TABLE.

### Add NOT NULL

```sql
ALTER TABLE employees
ALTER COLUMN employee_name SET NOT NULL;
```

Remove NOT NULL:

```sql
ALTER TABLE employees
ALTER COLUMN employee_name DROP NOT NULL;
```

### Add UNIQUE

```sql
ALTER TABLE employees
ADD CONSTRAINT uq_employee_email UNIQUE (email);
```

Remove UNIQUE:

```sql
ALTER TABLE employees
DROP CONSTRAINT uq_employee_email;
```

### Add CHECK

```sql
ALTER TABLE employees
ADD CONSTRAINT chk_employee_salary
CHECK (salary >= 0);
```

Remove CHECK:

```sql
ALTER TABLE employees
DROP CONSTRAINT chk_employee_salary;
```

### Add FOREIGN KEY

```sql
ALTER TABLE employees
ADD CONSTRAINT fk_employee_department
FOREIGN KEY (department_id)
REFERENCES departments(department_id);
```

Remove FOREIGN KEY:

```sql
ALTER TABLE employees
DROP CONSTRAINT fk_employee_department;
```

### Add DEFAULT

```sql
ALTER TABLE employees
ALTER COLUMN status SET DEFAULT 'active';
```

Remove DEFAULT:

```sql
ALTER TABLE employees
ALTER COLUMN status DROP DEFAULT;
```

**Important:** Adding a constraint can fail if existing rows violate it. Validate existing data before applying constraints in production.

## 11. Column-Level vs Table-Level Constraints

Constraints can be declared at column level or table level.

### Column-Level

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    email TEXT UNIQUE,
    salary NUMERIC CHECK (salary >= 0)
);
```

### Table-Level

```sql
CREATE TABLE employees (
    employee_id BIGINT,
    email TEXT,
    salary NUMERIC,

    PRIMARY KEY (employee_id),
    UNIQUE (email),
    CHECK (salary >= 0)
);
```

Both approaches are valid.

**Practical distinction:** Table-level constraints are necessary for composite constraints involving multiple columns, such as composite primary keys and composite UNIQUE constraints.

## 12. UNIQUE vs PRIMARY KEY

| Feature                            | PRIMARY KEY        | UNIQUE                      |
| ---------------------------------- | ------------------ | --------------------------- |
| Enforces uniqueness                | Yes                | Yes                         |
| Allows NULL                        | No                 | Yes, by default             |
| Number per table                   | One                | Multiple                    |
| Automatically creates unique index | Yes                | Yes                         |
| Can contain multiple columns       | Yes                | Yes                         |
| Typical purpose                    | Row identification | Additional uniqueness rules |

Example:

```sql
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE
);
```

Here:

- `customer_id` identifies the customer.
- `email` and `phone` must be unique when non-NULL.

## 13. Important PostgreSQL Behaviour

| Constraint        | Important detail                                    |
| ----------------- | --------------------------------------------------- |
| NOT NULL          | Empty strings and zero are allowed                  |
| UNIQUE            | Multiple NULL values are allowed by default         |
| PRIMARY KEY       | Combines UNIQUE and NOT NULL                        |
| FOREIGN KEY       | Does not automatically index the referencing column |
| CHECK             | NULL passes because the condition is not FALSE      |
| DEFAULT           | Does not replace explicitly supplied NULL           |
| Named constraints | Can be managed using ALTER TABLE                    |
| Existing data     | Must satisfy newly added constraints                |

## 14. Common Mistakes

1. Assuming NOT NULL prevents empty strings.
2. Assuming UNIQUE allows only one NULL by default.
3. Assuming PRIMARY KEY automatically generates IDs.
4. Assuming FOREIGN KEY automatically creates an index on the referencing column.
5. Assuming CHECK rejects NULL values.
6. Assuming DEFAULT replaces explicitly inserted NULL.
7. Adding constraints without checking existing records.
8. Using CHECK for rules that depend on other rows or tables. PostgreSQL CHECK constraints are not designed for cross-row or cross-table validation.
9. Forgetting that a composite UNIQUE constraint applies to the combination, not each column individually.
10. Removing a constraint without understanding which data-integrity rule will be lost.

## 15. Practice Exercises

Use the `techbazaar` database.

1. Create a `departments` table with a primary key and NOT NULL department name.
2. Create an `employees` table with:
   - Primary key
   - Required employee name
   - Unique email
   - Salary CHECK constraint
   - Default active status
   - Department foreign key
3. Try inserting duplicate emails.
4. Try inserting a negative salary.
5. Try inserting an employee with a department ID that does not exist.
6. Insert an employee without specifying status and verify the default.
7. Insert an explicit NULL status and observe the result.
8. Add a CHECK constraint to an existing table.
9. Drop a UNIQUE constraint.
10. Create an `order_items` table with a composite primary key.
11. Create a UNIQUE constraint on a combination of two columns.
12. Explain why a CHECK constraint does not replace a foreign key.

## 16. Interview Questions

1. What are SQL constraints?
2. What is the difference between PRIMARY KEY and UNIQUE?
3. Can a UNIQUE column contain multiple NULL values in PostgreSQL?
4. Can a table have multiple primary keys?
5. What is a composite primary key?
6. What is referential integrity?
7. Does a foreign key automatically create an index in PostgreSQL?
8. What happens when you insert NULL into a NOT NULL column?
9. What is the difference between CHECK and NOT NULL?
10. Does CHECK reject NULL?
11. What is the difference between DEFAULT and explicitly inserting NULL?
12. What are named constraints?
13. How do you add or remove a constraint from an existing table?
14. What happens if existing records violate a newly added constraint?
15. Why should cross-table validation generally use foreign keys rather than CHECK constraints?
