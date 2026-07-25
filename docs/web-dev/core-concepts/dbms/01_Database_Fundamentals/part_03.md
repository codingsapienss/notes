---
sidebar_label: Relational Database Fundamentals
sidebar_position: 1
---

# Relational Database Fundamentals

## 1. What Is a Relational Database?

A **relational database** is a database that organizes data into relations, which are commonly represented as tables.

A table stores information about a particular entity or concept.

For example, an e-commerce application might have:

- `users` — stores user information.
- `products` — stores product information.
- `orders` — stores order information.
- `payments` — stores payment information.

Each table contains rows and columns.

Example: `users`

|  id | name     | email                | age |
| --: | -------- | -------------------- | --: |
|   1 | Prashant | prashant@example.com |  25 |
|   2 | Rahul    | rahul@example.com    |  28 |
|   3 | Amit     | amit@example.com     |  22 |

Here:

- The table represents users.
- Each row represents one user.
- Each column represents an attribute of a user.

The important idea is that data is organized into related tables instead of necessarily storing everything in one large structure.

### Examples of relational databases

- PostgreSQL
- MySQL
- Microsoft SQL Server
- Oracle Database
- SQLite

These systems use the relational model and commonly provide SQL for querying and managing data.

---

## 2. Understanding Tables, Rows, and Columns

These are the three most fundamental components of a relational table.

### 2.1 Table

A table is a logical structure used to organize related data.

For example:

```sql
CREATE TABLE users (
    id INTEGER,
    name VARCHAR(100),
    email VARCHAR(255),
    age INTEGER
);
```

This creates a table named `users`.

A table has a defined structure and contains records following that structure.

### 2.2 Row (Record / Tuple)

A row represents one individual record in a table.

Example:

|  id | name     | email                | age |
| --: | -------- | -------------------- | --: |
|   1 | Prashant | prashant@example.com |  25 |

The entire row represents one user.

In relational terminology, a row is also called a **tuple**.

For example:

```text
(1, 'Prashant', 'prashant@example.com', 25)
```

This tuple contains the values for one user record.

### 2.3 Column (Field / Attribute)

A column represents a particular property of the records stored in a table.

For example:

| Column | Meaning            |
| ------ | ------------------ |
| id     | User identifier    |
| name   | User name          |
| email  | User email address |
| age    | User age           |

In relational terminology, a column is also called an **attribute**.

### 2.4 Visual representation

```text
                    users
       +------+-----------+-------------------------+-----+
       |  id  |   name    |          email          | age |
       +------+-----------+-------------------------+-----+
       |  1   | Prashant  | prashant@example.com    |  25 |
       |  2   | Rahul     | rahul@example.com       |  28 |
       |  3   | Amit      | amit@example.com        |  22 |
       +------+-----------+-------------------------+-----+
          ^          ^                ^
          |          |                |
        Column     Column           Column
          |
       Each horizontal record is a row
```

### 2.5 Quick comparison

| Term      | Meaning                       | Example                |
| --------- | ----------------------------- | ---------------------- |
| Table     | Collection of related records | `users`                |
| Row       | One record                    | Prashant's user record |
| Column    | One attribute                 | `email`                |
| Tuple     | Relational term for a row     | `(1, 'Prashant', ...)` |
| Attribute | Relational term for a column  | `name`                 |

**Remember:**

- Table = collection of records.
- Row = one record.
- Column = one property of a record.

---

## 3. Data Types and Domains

A relational database defines the type of values that can be stored in a column.

This helps ensure that data follows the expected format.

Consider:

```sql
CREATE TABLE products (
    id INTEGER,
    name VARCHAR(100),
    price NUMERIC(10, 2),
    stock INTEGER,
    is_available BOOLEAN
);
```

| Column       | Data type      | Example  |
| ------------ | -------------- | -------- |
| id           | INTEGER        | 101      |
| name         | VARCHAR(100)   | Laptop   |
| price        | NUMERIC(10, 2) | 65000.00 |
| stock        | INTEGER        | 15       |
| is_available | BOOLEAN        | TRUE     |

### What is a domain?

In relational database terminology, a domain describes the set of valid values an attribute can contain.

For example:

- An age column may contain non-negative integers.
- A price column may contain non-negative numeric values.
- A status column may allow only a defined set of values.

A data type defines a broad category of values. Additional constraints can narrow the allowed values.

Example:

```sql
CREATE TABLE products (
    id INTEGER,
    name VARCHAR(100),
    price NUMERIC(10, 2)
        CHECK (price >= 0)
);
```

Here, the `CHECK` constraint restricts the price to non-negative values.

**Important:** A column's data type alone does not necessarily enforce every business rule. Constraints are used to define additional restrictions.

---

## 4. What Is a Relational Model?

The relational model is a way of representing data using relations and defining how those relations are connected.

It was introduced by Edgar F. Codd in 1970.

In practical relational databases, tables represent relations.

Consider an e-commerce application.

Instead of storing all information in one large table, we can divide it into separate tables:

### Users

|  id | name     | email                |
| --: | -------- | -------------------- |
|   1 | Prashant | prashant@example.com |
|   2 | Rahul    | rahul@example.com    |

### Products

|  id | name     | price |
| --: | -------- | ----: |
| 101 | Laptop   | 65000 |
| 102 | Mouse    |   800 |
| 103 | Keyboard |  1500 |

### Orders

|   id | user_id | total_amount |
| ---: | ------: | -----------: |
| 1001 |       1 |        65800 |
| 1002 |       2 |         1500 |

Each table represents a different logical entity.

The tables are connected through identifiers.

For example:

- `users.id` identifies a user.
- `orders.user_id` identifies the user who placed an order.

This allows us to store information separately while still connecting related records.

### Why separate tables?

Imagine storing users and all their orders in one table:

| user_id | user_name | order_id | amount |
| ------: | --------- | -------: | -----: |
|       1 | Prashant  |     1001 |   2500 |
|       1 | Prashant  |     1002 |   4500 |
|       1 | Prashant  |     1003 |   1800 |
|       2 | Rahul     |     1004 |   3000 |

The user's information is repeated for every order.

This creates unnecessary duplication and can introduce data-management problems.

A relational design separates users and orders:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**orders**

|   id | user_id | amount |
| ---: | ------: | -----: |
| 1001 |       1 |   2500 |
| 1002 |       1 |   4500 |
| 1003 |       1 |   1800 |
| 1004 |       2 |   3000 |

Now user information is stored once, and orders refer to users through `user_id`.

This separation is one of the foundations of relational database design.

We will study normalization and its rules in detail in Part 4.

---

## 5. What Is a Key in a Relational Database?

A key is an attribute or combination of attributes used to identify records or establish relationships between tables.

Keys are important because they help databases:

- Identify individual records.
- Prevent unwanted duplicates.
- Connect related tables.
- Maintain data integrity.

The two most important keys for this chapter are:

1. Primary key.
2. Foreign key.

---

## 6. Primary Key (PK)

A **primary key** is a column or combination of columns selected to uniquely identify each row in a table.

Every table should generally have a primary key when individual records need to be uniquely identified.

Example:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);
```

Here, `id` is the primary key.

Consider the data:

|  id | name     | email                |
| --: | -------- | -------------------- |
|   1 | Prashant | prashant@example.com |
|   2 | Rahul    | rahul@example.com    |
|   3 | Amit     | amit@example.com     |

Every user has a unique `id`.

### 6.1 Why do we need a primary key?

Suppose we have:

| name  | city  |
| ----- | ----- |
| Rahul | Delhi |
| Rahul | Delhi |
| Amit  | Noida |

If we want to update one particular Rahul's record, how do we identify which one?

Using the name is not reliable because multiple people can have the same name.

A primary key gives each record a unique identifier.

For example:

|  id | name  | city  |
| --: | ----- | ----- |
| 101 | Rahul | Delhi |
| 102 | Rahul | Delhi |
| 103 | Amit  | Noida |

Now we can identify each record using its ID.

```sql
UPDATE users
SET city = 'Noida'
WHERE id = 101;
```

Only the record with ID 101 is updated.

### 6.2 Primary key rules

A primary key must satisfy two important properties.

**Rule 1: Uniqueness**

No two rows can have the same primary key value.

Invalid example:

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   1 | Rahul    |

Both rows have the same primary key, so the database rejects the duplicate.

**Rule 2: NOT NULL**

A primary key cannot contain NULL.

Invalid example:

|   id | name     |
| ---: | -------- |
|    1 | Prashant |
| NULL | Rahul    |

A primary key must identify every row, so a missing identifier is not allowed.

### 6.3 PRIMARY KEY automatically enforces UNIQUE and NOT NULL

In PostgreSQL:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100)
);
```

This is conceptually equivalent to enforcing:

```sql
id INTEGER UNIQUE NOT NULL
```

However, `PRIMARY KEY` also declares the column or columns as the table's primary key.

### 6.4 Can a primary key contain multiple columns?

Yes.

A primary key can consist of more than one column.

This is called a **composite primary key**.

Example:

Suppose we have a table tracking which students enroll in which courses.

**student_courses**

| student_id | course_id | enrollment_date |
| ---------: | --------: | --------------- |
|          1 |       101 | 2026-01-10      |
|          1 |       102 | 2026-01-12      |
|          2 |       101 | 2026-01-15      |

A student can enroll in multiple courses, and a course can have multiple students.

Neither `student_id` nor `course_id` is individually unique.

But their combination can be unique.

```sql
CREATE TABLE student_courses (
    student_id INTEGER,
    course_id INTEGER,
    enrollment_date DATE,

    PRIMARY KEY (student_id, course_id)
);
```

This means:

- Student 1 can enroll in Course 101.
- Student 1 can also enroll in Course 102.
- Student 2 can enroll in Course 101.
- Student 1 cannot enroll in Course 101 twice in this table.

The combination `(student_id, course_id)` must be unique.

### 6.5 Can a table have multiple primary keys?

No.

A table can have only one primary key constraint.

However, that primary key can consist of multiple columns.

For example:

```sql
PRIMARY KEY (student_id, course_id)
```

This is one composite primary key, not two separate primary keys.

### 6.6 Natural key vs surrogate key

There are two common approaches to choosing primary-key values.

**Natural key**

A natural key is an attribute that already has meaning in the real world and can uniquely identify a record.

Examples:

- A government-issued identifier.
- A company registration number.
- A globally unique product code.

Example:

```sql
CREATE TABLE countries (
    country_code CHAR(2) PRIMARY KEY,
    country_name VARCHAR(100)
);
```

Here, `country_code` is a natural key.

**Surrogate key**

A surrogate key is an artificially generated identifier that has no direct business meaning.

Example:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);
```

The database generates the ID.

For many application tables, surrogate keys are convenient because they are stable and independent of changing business attributes.

**Important:** A generated ID does not automatically guarantee that other fields, such as email, are unique. If email must be unique, enforce that separately.

---

## 7. Foreign Key (FK)

A **foreign key** is a column or combination of columns in one table that references a candidate key in another table, commonly its primary key.

It establishes a relationship between tables and helps maintain referential integrity.

### 7.1 Why do we need foreign keys?

Suppose we have two tables.

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |
|   3 | Amit     |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |   2500 |
| 102 |       2 |   1800 |
| 103 |       1 |   4500 |

Notice that `orders.user_id` contains the IDs of users.

This connects orders to their owners.

For example:

```text
Order 101 ---> User 1 ---> Prashant
Order 102 ---> User 2 ---> Rahul
Order 103 ---> User 1 ---> Prashant
```

Here:

- `users.id` is the primary key.
- `orders.user_id` is the foreign key.

### 7.2 Creating a foreign key

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    amount NUMERIC(10, 2),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

The foreign key establishes a relationship between `orders.user_id` and `users.id`.

### 7.3 How does a foreign key protect data?

Suppose the users table contains:

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

Now try inserting:

```sql
INSERT INTO orders (id, user_id, amount)
VALUES (101, 99, 2500);
```

This attempts to create an order for user ID 99.

But user ID 99 does not exist in the `users` table.

The database rejects this insertion because the foreign key would reference a nonexistent user.

This prevents an invalid relationship from being stored.

### 7.4 What is referential integrity?

Referential integrity means maintaining valid relationships between related tables.

For example:

- Every order must reference an existing user when `user_id` is non-NULL.
- A payment should reference an existing order if the schema requires that relationship.
- An order item should reference an existing product if the schema requires that relationship.

Foreign keys enforce these rules at the database level.

**Important:** A nullable foreign-key column may contain NULL unless a `NOT NULL` constraint is also applied. A foreign key does not automatically make its column mandatory.

### 7.5 Can a foreign key contain duplicate values?

Yes.

This is one of the most important differences between a primary key and a foreign key.

Consider:

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |   2500 |
| 102 |       1 |   1800 |
| 103 |       2 |   3000 |
| 104 |       1 |   4500 |

Multiple orders can belong to the same user.

Therefore, `user_id` can contain duplicate values.

The foreign key only ensures that non-NULL values reference valid parent records.

It does not require those values to be unique.

### 7.6 Can a foreign key contain NULL?

Yes, unless the column is also declared `NOT NULL`.

For example:

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

Here, `user_id` can contain NULL.

This may represent an order that is not currently associated with a user, depending on the application's data model.

If every order must have a user:

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

Now `user_id` cannot be NULL.

---

## 8. Primary Key vs Foreign Key

This is a frequently asked interview question.

| Primary Key                            | Foreign Key                                             |
| -------------------------------------- | ------------------------------------------------------- |
| Uniquely identifies a row in its table | References a candidate key in another or the same table |
| Must be unique                         | Duplicates are generally allowed                        |
| Cannot be NULL                         | Can be NULL unless declared NOT NULL                    |
| One primary key constraint per table   | A table can have multiple foreign key constraints       |
| Enforces entity identification         | Enforces referential integrity                          |
| Example: `users.id`                    | Example: `orders.user_id`                               |

### Example

```text
              users
       +------+-----------+
       |  id  |   name    |
       +------+-----------+
       |  1   | Prashant  |
       |  2   | Rahul     |
       +------+-----------+
          ^
          |
          | Foreign Key Reference
          |
       +------+---------+--------+
       |  id  | user_id | amount |
       +------+---------+--------+
       | 101  |    1    |  2500  |
       | 102  |    1    |  1800  |
       | 103  |    2    |  3000  |
       +------+---------+--------+
              orders
```

The parent table is `users`, and the child table is `orders`.

- `users.id` = Primary key.
- `orders.user_id` = Foreign key.

---

## 9. Relationships Between Tables

Relational databases allow us to represent different types of relationships between entities.

Three common relationship types are:

1. One-to-One.
2. One-to-Many.
3. Many-to-Many.

### 9.1 One-to-One Relationship (1:1)

One record in Table A is associated with at most one record in Table B, and vice versa.

Example:

A user and their profile.

```text
User 1 -------- Profile 1
User 2 -------- Profile 2
User 3 -------- Profile 3
```

Possible table design:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**user_profiles**

|  id | user_id | bio               |
| --: | ------: | ----------------- |
| 101 |       1 | Backend Developer |
| 102 |       2 | Software Engineer |

To enforce at most one profile per user:

```sql
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

The `UNIQUE` constraint prevents multiple profile rows from referencing the same user.

### 9.2 One-to-Many Relationship (1:N)

One record in Table A can be associated with multiple records in Table B.

But each record in Table B references at most one record in Table A through the foreign key.

Example:

One user can place multiple orders.

```text
User 1 -------- Order 101
       |-------- Order 102
       |-------- Order 103

User 2 -------- Order 104
       |-------- Order 105
```

Table design:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |   2500 |
| 102 |       1 |   1800 |
| 103 |       1 |   4500 |
| 104 |       2 |   3000 |
| 105 |       2 |   1500 |

The foreign key is placed in the many-side table, `orders`.

This is one of the most common relationship patterns in relational database design.

### 9.3 Many-to-Many Relationship (M:N)

Multiple records in Table A can be associated with multiple records in Table B.

Example:

- One student can enroll in multiple courses.
- One course can have multiple students.

```text
Student 1 -------- Course 101
         |-------- Course 102

Student 2 -------- Course 101
         |-------- Course 103

Student 3 -------- Course 102
         |-------- Course 103
```

A relational design typically uses a junction table (also called a bridge or associative table).

**students**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**courses**

|  id | name          |
| --: | ------------- |
| 101 | Database      |
| 102 | JavaScript    |
| 103 | System Design |

**student_courses**

| student_id | course_id |
| ---------: | --------: |
|          1 |       101 |
|          1 |       102 |
|          2 |       101 |
|          2 |       103 |

SQL:

```sql
CREATE TABLE student_courses (
    student_id INTEGER,
    course_id INTEGER,

    PRIMARY KEY (student_id, course_id),

    FOREIGN KEY (student_id)
        REFERENCES students(id),

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
);
```

The junction table contains two foreign keys.

It converts a many-to-many relationship into two one-to-many relationships.

```text
students
   |
   | One-to-Many
   |
   v
student_courses
   ^
   |
   | Many-to-One
   |
courses
```

This is the standard relational approach to representing many-to-many relationships.

---

## 10. What Happens When We Delete or Update a Referenced Record?

Consider:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |   2500 |
| 102 |       1 |   1800 |

Now suppose we try to delete user 1.

```sql
DELETE FROM users
WHERE id = 1;
```

What happens?

The user still has two orders referencing them.

Deleting the user could leave those orders referencing a nonexistent record.

The foreign-key constraint prevents this by default when dependent rows exist.

However, relational databases provide different referential actions to define what should happen.

### 10.1 ON DELETE RESTRICT / NO ACTION

These options prevent deleting a referenced parent record while dependent records exist.

Example:

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
        ON DELETE RESTRICT
);
```

If orders reference a user, deleting that user is rejected.

`RESTRICT` and `NO ACTION` are similar in intent, but their constraint-checking timing can differ depending on the DBMS and constraint configuration.

### 10.2 ON DELETE CASCADE

Deleting a parent record automatically deletes its dependent child records.

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
        ON DELETE CASCADE
);
```

If user 1 is deleted, orders referencing user 1 are also deleted.

```text
Delete User 1
      |
      v
Delete Orders belonging to User 1
```

Use this carefully. Deleting a parent could delete many child records.

### 10.3 ON DELETE SET NULL

Deleting the parent sets the referencing foreign-key values to NULL.

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);
```

After deleting a user, the orders remain, but their `user_id` becomes NULL.

The column must allow NULL for this action to work.

### 10.4 ON UPDATE CASCADE

If a referenced key changes, the corresponding foreign-key values are automatically updated.

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
);
```

If the referenced user ID changes from 1 to 10, the corresponding `orders.user_id` values are updated.

In practice, primary keys are generally designed to remain stable, so updating them is uncommon.

### 10.5 Referential action comparison

| Action      | What happens to child records?                                                          |
| ----------- | --------------------------------------------------------------------------------------- |
| RESTRICT    | Prevents deleting the referenced parent while dependent rows exist                      |
| NO ACTION   | Rejects the operation if the constraint is violated when checked                        |
| CASCADE     | Deletes dependent rows when the parent is deleted                                       |
| SET NULL    | Sets the child foreign key to NULL                                                      |
| SET DEFAULT | Sets the child foreign key to its default value, if that value satisfies the constraint |

The appropriate action depends on the application's business rules.

For example, deleting a customer should not automatically delete historical financial records in many systems.

---

## 11. How Do We Retrieve Related Data?

Having separate tables is useful, but we often need information from multiple tables together.

Consider:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**orders**

|  id | user_id | amount |
| --: | ------: | -----: |
| 101 |       1 |   2500 |
| 102 |       1 |   1800 |
| 103 |       2 |   3000 |

Suppose we want to retrieve order information along with the user's name.

We can use a JOIN:

```sql
SELECT
    users.name,
    orders.id AS order_id,
    orders.amount
FROM users
INNER JOIN orders
    ON users.id = orders.user_id;
```

Result:

| name     | order_id | amount |
| -------- | -------: | -----: |
| Prashant |      101 |   2500 |
| Prashant |      102 |   1800 |
| Rahul    |      103 |   3000 |

The database combines matching records using the relationship between the tables.

### Important distinction

A foreign key defines and enforces a relationship.

A JOIN retrieves related data from multiple tables.

A JOIN does not strictly require a declared foreign-key constraint. SQL can join tables using any compatible condition.

However, defining appropriate foreign keys helps ensure that the underlying relationships remain valid.

We will study joins and their internal execution in detail in Part 5.

---

## 12. What If We Do Not Use Foreign Keys?

Technically, an application can store identifiers in multiple tables without defining foreign-key constraints.

For example:

**users**

|  id | name     |
| --: | -------- |
|   1 | Prashant |
|   2 | Rahul    |

**orders**

|  id | user_id |
| --: | ------: |
| 101 |       1 |
| 102 |      99 |

Here, order 102 references user 99, but user 99 does not exist.

Without a foreign-key constraint, the database does not reject this relationship merely because the referenced user is missing.

The application would need to prevent such invalid references itself.

### Why can this be dangerous?

Consider multiple services or application instances accessing the same database.

If every service implements relationship validation differently, inconsistent data can appear.

For example:

- Service A validates whether a user exists.
- Service B forgets to validate.
- Service C deletes a user without checking dependent orders.

The database-level foreign-key constraint provides a central integrity rule.

### Are foreign keys always necessary?

Not necessarily.

Some high-scale systems intentionally avoid foreign keys because they want to control relationships at the application level or reduce certain operational constraints.

However, doing so shifts responsibility to application code, background validation, and other integrity mechanisms.

It is not automatically a performance improvement.

For most conventional relational applications, foreign keys are valuable because they protect data integrity.

---

## 13. Complete Example: E-Commerce Database

Let's combine the concepts in a small relational database design.

### 13.1 Users table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);
```

### 13.2 Products table

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),
    stock INTEGER NOT NULL
        CHECK (stock >= 0)
);
```

### 13.3 Orders table

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

### 13.4 Order items table

An order can contain multiple products, and a product can appear in multiple orders.

We use a junction-like table to represent this relationship.

```sql
CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL
        CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
        CHECK (unit_price >= 0),

    PRIMARY KEY (order_id, product_id),

    FOREIGN KEY (order_id)
        REFERENCES orders(id),

    FOREIGN KEY (product_id)
        REFERENCES products(id)
);
```

### 13.5 Relationship overview

```text
              USERS
                |
                | One-to-Many
                |
                v
              ORDERS
                |
                | One-to-Many
                |
                v
           ORDER_ITEMS
                ^
                |
                | Many-to-One
                |
                |
             PRODUCTS
```

The database now has four tables:

| Table       | Primary key            | Foreign key          |
| ----------- | ---------------------- | -------------------- |
| users       | id                     | None                 |
| products    | id                     | None                 |
| orders      | id                     | user_id              |
| order_items | (order_id, product_id) | order_id, product_id |

This design provides:

- Unique identification of records.
- Relationships between users and orders.
- Relationships between orders and products.
- Prevention of references to nonexistent users or products.
- Prevention of duplicate product entries within the same order.

**Important:** The composite key in `order_items` means each product can appear only once per order in this design. Its quantity is represented by the `quantity` column.

Also, `unit_price` is stored in the order item so the application can preserve the price charged at purchase time, even if the product's current price changes later.

---

## 14. Common Misconceptions

### Misconception 1: A primary key must always be an integer.

Incorrect.

A primary key can use different supported data types, including:

- Integer.
- UUID.
- String.
- Composite values.

The important requirement is uniqueness and non-nullness.

### Misconception 2: A table can have multiple primary keys.

Incorrect.

A table can have only one primary-key constraint. That constraint can contain multiple columns.

### Misconception 3: Foreign keys must contain unique values.

Incorrect.

Foreign keys commonly contain duplicates.

For example, many orders can reference the same user.

### Misconception 4: Foreign keys cannot contain NULL.

Incorrect.

A foreign-key column can contain NULL unless it is also declared `NOT NULL`.

### Misconception 5: A foreign key automatically creates a one-to-one relationship.

Incorrect.

A foreign key alone usually establishes a many-to-one relationship from the child table to the referenced table.

To enforce at most one child record per parent, an additional `UNIQUE` constraint is needed.

### Misconception 6: A JOIN requires a foreign key.

Incorrect.

A JOIN can use any valid SQL join condition. A declared foreign key is useful for integrity but is not mandatory for executing a JOIN.

### Misconception 7: Relational databases store all related information in one table.

Incorrect.

Relational databases commonly separate entities into multiple tables and connect them through keys.

### Misconception 8: Every relationship must be enforced using a foreign key.

Incorrect.

Applications can manage relationships without database foreign-key constraints. However, this transfers integrity responsibility to application code and other mechanisms.

---

## 15. Interview Questions

### Q1. What is a relational database?

A relational database organizes data into relations, commonly represented as tables containing rows and columns.

### Q2. What is the difference between a row and a column?

A row represents one record, while a column represents an attribute shared by records in the table.

### Q3. What is a primary key?

A primary key is a column or combination of columns that uniquely identifies each row. It must be unique and cannot contain NULL.

### Q4. Can a primary key contain multiple columns?

Yes. This is called a composite primary key.

### Q5. Can a table have multiple primary keys?

No. A table has one primary-key constraint, although it can contain multiple columns.

### Q6. What is a foreign key?

A foreign key is a column or combination of columns that references a candidate key in another or the same table, helping maintain referential integrity.

### Q7. Can a foreign key contain duplicate values?

Yes. Multiple child records can reference the same parent record.

### Q8. Can a foreign key contain NULL?

Yes, unless the column is also declared `NOT NULL`.

### Q9. What happens if you insert a foreign-key value that does not exist in the parent table?

The database rejects the operation because it would violate referential integrity.

### Q10. What is a composite primary key?

A primary key made up of multiple columns, where the combination uniquely identifies a record.

### Q11. What is a junction table?

A junction table is used to represent a many-to-many relationship by storing foreign keys referencing the related tables.

### Q12. What is referential integrity?

Referential integrity ensures that relationships between related records remain valid.

### Q13. What is the difference between a primary key and a UNIQUE constraint?

Both enforce uniqueness. A primary key additionally identifies the table's primary record identifier and cannot contain NULL. A table can have multiple UNIQUE constraints but only one primary-key constraint.

### Q14. Why should we use foreign keys?

They prevent invalid references and enforce relationships at the database level, reducing the risk of inconsistent data.

### Q15. Can we perform a JOIN without a foreign key?

Yes. JOINs use SQL join conditions. A foreign-key constraint is not required to execute them.

---

## 16. Chapter Summary

| Concept               | Key point                                                           |
| --------------------- | ------------------------------------------------------------------- |
| Relational database   | Organizes data using relations, commonly represented as tables      |
| Table                 | Collection of related records                                       |
| Row                   | One record or tuple                                                 |
| Column                | One attribute                                                       |
| Domain                | Set of valid values for an attribute                                |
| Primary key           | Uniquely identifies a row                                           |
| Composite primary key | Primary key containing multiple columns                             |
| Natural key           | Key with real-world business meaning                                |
| Surrogate key         | Artificially generated identifier                                   |
| Foreign key           | References a candidate key in another or the same table             |
| Referential integrity | Maintains valid relationships                                       |
| One-to-One            | One record corresponds to at most one record on the other side      |
| One-to-Many           | One parent can have multiple child records                          |
| Many-to-Many          | Multiple records on both sides are related through a junction table |
| ON DELETE CASCADE     | Deletes dependent rows when a referenced parent is deleted          |
| JOIN                  | Combines related data from multiple tables                          |

### Final takeaway

The relational model organizes information into separate tables and connects those tables through keys.

- **Tables** organize related information.
- **Rows** represent individual records.
- **Columns** describe record attributes.
- **Primary keys** uniquely identify records.
- **Foreign keys** establish and protect relationships.
- **Constraints** enforce data integrity.

Once these concepts are clear, understanding SQL queries, joins, normalization, transactions, and relational database architecture becomes much easier.
