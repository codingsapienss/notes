---
sidebar_label: "Foreign Keys and Referential Integrity"
sidebar_position: 1
---

# Foreign Keys and Referential Integrity

## 1. What is a Foreign Key?

A **Foreign Key (FK)** is a column or combination of columns that references a unique or primary key in another table.

It establishes relationships between tables and ensures that referenced records exist.

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

- `departments.department_id` → Referenced key.
- `employees.department_id` → Foreign key.
- `departments` → Parent table.
- `employees` → Child table.

## 2. How Foreign Keys Work

Insert parent records first:

```sql
INSERT INTO departments
VALUES
(1, 'IT'),
(2, 'HR'),
(3, 'Sales');
```

Insert child records:

```sql
INSERT INTO employees
VALUES
(101, 'Rahul', 1),
(102, 'Priya', 2),
(103, 'Amit', 1);
```

Valid because the referenced department IDs exist.

Invalid:

```sql
INSERT INTO employees
VALUES (104, 'John', 99);
```

PostgreSQL rejects this insertion because department `99` does not exist.

**Core rule:** A non-NULL foreign key value must match a referenced key value.

## 3. Primary Key vs Foreign Key

| Primary Key                          | Foreign Key                              |
| ------------------------------------ | ---------------------------------------- |
| Uniquely identifies a row            | Establishes a relationship               |
| Must be unique                       | Can contain duplicate values             |
| Cannot contain NULL                  | Can contain NULL by default              |
| One primary key constraint per table | Multiple foreign key constraints allowed |
| Usually defined in the parent table  | Usually references a parent table's key  |

Example:

```sql
departments.department_id  -- Primary key
employees.department_id    -- Foreign key
```

Multiple employees can belong to the same department, so foreign key values can repeat.

## 4. Foreign Key and Referential Integrity

**Referential integrity** ensures that relationships between tables remain valid.

Example:

```text
departments
-------------------------
department_id | name
1             | IT
2             | HR

employees
--------------------------------
employee_id | name  | department_id
101         | Rahul | 1
102         | Priya | 2
103         | Amit  | 1
```

Every non-NULL `employees.department_id` must reference an existing department.

Without a foreign key, invalid references could be stored:

```text
employee_id | name | department_id
104         | John | 99
```

The employee references a department that does not exist.

Foreign keys prevent this inconsistency.

## 5. What Can a Foreign Key Reference?

A foreign key can reference:

- A primary key.
- A suitable UNIQUE constraint.

Example:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    email TEXT UNIQUE
);

CREATE TABLE user_profiles (
    profile_id BIGINT PRIMARY KEY,
    user_email TEXT REFERENCES users(email)
);
```

Here, `user_email` references the unique `users.email` column.

**Important:** The referenced columns must have a suitable unique or primary key constraint. A foreign key cannot reference an arbitrary non-unique column.

For composite references, the number and order of referencing columns must match the referenced key columns.

## 6. Foreign Key with NULL Values

A foreign key can contain NULL unless NOT NULL is specified.

Example:

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department_id BIGINT,

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);
```

This is valid:

```sql
INSERT INTO employees
VALUES (105, 'John', NULL);
```

Why?

NULL means the employee currently has no specified department. PostgreSQL does not require a matching parent row for a NULL foreign key.

To make the relationship mandatory:

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department_id BIGINT NOT NULL,

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);
```

Now every employee must have a valid department.

## 7. One-to-One Relationship

One record in a parent table can be associated with at most one record in the child table.

Example: One user has at most one profile.

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    username TEXT NOT NULL
);

CREATE TABLE user_profiles (
    profile_id BIGINT PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(user_id),
    bio TEXT
);
```

The `UNIQUE` constraint on `user_id` prevents multiple profiles from referencing the same user.

To require every profile to belong to a user, use `NOT NULL` as well.

## 8. One-to-Many Relationship

One parent record can be associated with multiple child records.

Example: One department has many employees.

```sql
CREATE TABLE departments (
    department_id BIGINT PRIMARY KEY,
    department_name TEXT NOT NULL
);

CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department_id BIGINT REFERENCES departments(department_id)
);
```

Example data:

```text
departments
---------------------
1 | IT
2 | HR

employees
---------------------
101 | Rahul | 1
102 | Priya | 1
103 | Amit  | 2
```

Department `1` has two employees.

**Important:** The foreign key belongs on the many-side table (`employees`).

## 9. Many-to-Many Relationship

Multiple records in one table can be associated with multiple records in another table.

Example:

- A student can enroll in multiple courses.
- A course can have multiple students.

A junction table (also called a bridge or mapping table) represents this relationship.

```sql
CREATE TABLE students (
    student_id BIGINT PRIMARY KEY,
    student_name TEXT NOT NULL
);

CREATE TABLE courses (
    course_id BIGINT PRIMARY KEY,
    course_name TEXT NOT NULL
);

CREATE TABLE student_courses (
    student_id BIGINT REFERENCES students(student_id),
    course_id BIGINT REFERENCES courses(course_id),

    PRIMARY KEY (student_id, course_id)
);
```

Example:

```text
students
-----------------
1 | Rahul
2 | Priya

courses
-----------------
101 | SQL
102 | PostgreSQL

student_courses
-----------------
1 | 101
1 | 102
2 | 101
```

Rahul is enrolled in both courses, while SQL has two students.

The composite primary key prevents the same student-course combination from being inserted twice.

## 10. Real-World E-commerce Relationships

A simplified TechBazaar database:

```text
customers
    |
    | 1:N
    |
orders
    |
    | 1:N
    |
order_items
    |
    | N:1
    |
products

orders
    |
    | 1:N
    |
payments

departments
    |
    | 1:N
    |
employees
```

Example schema:

```sql
CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT UNIQUE
);

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    product_id BIGINT NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL
);
```

Relationships:

| Parent table | Child table | Relationship |
| ------------ | ----------- | ------------ |
| customers    | orders      | One-to-many  |
| orders       | order_items | One-to-many  |
| products     | order_items | One-to-many  |
| orders       | payments    | One-to-many  |

**Design note:** `unit_price` stores the product price at the time of purchase. It preserves historical order pricing even if the product's current price changes.

## 11. Foreign Key Indexing

PostgreSQL automatically creates an index on the referenced primary key or UNIQUE key.

However, it does **not automatically create an index on the referencing foreign key column**.

Example:

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    department_id BIGINT REFERENCES departments(department_id)
);
```

You may add an index:

```sql
CREATE INDEX idx_employees_department_id
ON employees(department_id);
```

Why can this help?

- Faster joins between employees and departments.
- Faster filtering by department.
- More efficient checks when a referenced department is deleted or updated.

Whether the index is worthwhile depends on query patterns and table size.

## 12. Common Foreign Key Errors

| Situation                                   | Result              |
| ------------------------------------------- | ------------------- |
| Insert child row with nonexistent parent ID | Rejected            |
| Insert NULL into nullable FK                | Allowed             |
| Insert NULL into NOT NULL FK                | Rejected            |
| Delete referenced parent row                | Rejected by default |
| Insert duplicate FK values                  | Allowed             |
| Reference a non-unique parent column        | Rejected            |

**Important:** The default delete behaviour is restrictive. Explicit delete actions such as CASCADE and SET NULL are covered separately.

## 13. Common Mistakes

1. Confusing a primary key with a foreign key.
2. Assuming foreign keys must contain unique values.
3. Assuming foreign keys cannot contain NULL.
4. Assuming a foreign key automatically creates an index on the child table.
5. Referencing a non-unique column.
6. Forgetting to insert the parent record before inserting the child record.
7. Using a foreign key where a junction table is required for a many-to-many relationship.
8. Assuming a foreign key automatically deletes child records when a parent is deleted.
9. Forgetting to enforce NOT NULL when a relationship is mandatory.

## 14. Practice Exercises

Use the `techbazaar` database.

1. Create `departments` and `employees` tables with a foreign key relationship.
2. Insert three departments and five employees.
3. Try inserting an employee with a nonexistent department ID.
4. Insert an employee with a NULL department ID.
5. Make `department_id` mandatory and test NULL insertion.
6. Create a one-to-one relationship between `customers` and `customer_profiles`.
7. Create a many-to-many relationship between `products` and `categories`.
8. Create an `orders` table referencing customers.
9. Create an `order_items` table referencing orders and products.
10. Create an index on `employees.department_id`.
11. Explain why multiple employees can reference the same department.
12. Explain why a junction table is required for many-to-many relationships.

## 15. Interview Questions

1. What is a foreign key?
2. What is referential integrity?
3. What is the difference between a primary key and a foreign key?
4. Can a foreign key contain duplicate values?
5. Can a foreign key contain NULL?
6. Can a foreign key reference a UNIQUE column?
7. What happens when you insert a nonexistent foreign key value?
8. Explain one-to-one, one-to-many, and many-to-many relationships.
9. What is a junction table?
10. Why is a foreign key placed on the many-side in a one-to-many relationship?
11. Does PostgreSQL automatically create an index on a foreign key column?
12. Why should order items store the purchase-time product price?
13. Can one table contain multiple foreign keys?
14. What happens when you delete a parent record that is referenced by child records?
