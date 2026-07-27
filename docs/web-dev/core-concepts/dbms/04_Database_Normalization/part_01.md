---
sidebar_label: Normalization Fundamentals
sidebar_position: 1
---

# Normalization Fundamentals

## 1. Introduction to Database Normalization

Database normalization is the process of organizing data in relational database tables to:

1. Reduce unnecessary data duplication.
2. Prevent data inconsistencies.
3. Avoid insertion, update, and deletion anomalies.
4. Improve data integrity.
5. Create logical relationships between tables.

Consider an e-commerce application.

Initially, we might store everything in one table:

| order_id | customer_name | customer_email  | product_name | product_price |
| -------: | ------------- | --------------- | ------------ | ------------: |
|      101 | Rahul         | rahul@gmail.com | Laptop       |         50000 |
|      102 | Rahul         | rahul@gmail.com | Mouse        |           800 |
|      103 | Amit          | amit@gmail.com  | Keyboard     |          1500 |
|      104 | Rahul         | rahul@gmail.com | Keyboard     |          1500 |

This table contains customer information repeatedly.

Rahul's name and email appear three times.

If Rahul changes his email address, we need to update multiple rows.

What happens if we update only two rows and forget the third?

Our database now contains inconsistent information.

This is one of the problems database normalization aims to solve.

### Definition

**Database normalization is a systematic process of decomposing relational tables into smaller, logically related tables to reduce redundancy and prevent data anomalies while preserving the required relationships between data.**

---

## 2. Why Do We Need Normalization?

Let's understand the problems using a practical example.

Suppose we have this table:

### Orders Table

| order_id | customer_id | customer_name | customer_email  | product_id | product_name | product_price |
| -------: | ----------: | ------------- | --------------- | ---------: | ------------ | ------------: |
|      101 |           1 | Rahul         | rahul@gmail.com |        501 | Laptop       |         50000 |
|      102 |           1 | Rahul         | rahul@gmail.com |        502 | Mouse        |           800 |
|      103 |           2 | Amit          | amit@gmail.com  |        503 | Keyboard     |          1500 |
|      104 |           1 | Rahul         | rahul@gmail.com |        503 | Keyboard     |          1500 |

Notice the duplication:

- Rahul's information appears three times.
- The Keyboard product information appears twice.
- Product and customer information are stored alongside order information.

This creates several problems.

### Problem 1: Data Redundancy

Data redundancy means storing the same information unnecessarily in multiple places.

For example:

| order_id | customer_name | customer_email  |
| -------: | ------------- | --------------- |
|      101 | Rahul         | rahul@gmail.com |
|      102 | Rahul         | rahul@gmail.com |
|      104 | Rahul         | rahul@gmail.com |

The customer's information is duplicated.

**Why is this a problem?**

- More storage is consumed.
- Updates become repetitive.
- Inconsistent values can appear.
- Maintaining data becomes difficult.

Normalization helps store each fact in an appropriate place.

### Problem 2: Data Inconsistency

Suppose Rahul changes his email.

We update only two rows:

| order_id | customer_name | customer_email         |
| -------: | ------------- | ---------------------- |
|      101 | Rahul         | rahul.sharma@gmail.com |
|      102 | Rahul         | rahul.sharma@gmail.com |
|      104 | Rahul         | rahul@gmail.com        |

Now the same customer has two different email addresses.

Which one is correct?

This is a data inconsistency problem.

Normalization reduces the chance of this happening by storing customer information separately.

### Problem 3: Difficult Data Maintenance

Suppose the product price changes from ₹50,000 to ₹55,000.

If the product appears in multiple rows, we may need to update all those rows.

Missing even one row can create inconsistent product information.

However, there is an important business distinction:

An order often needs to preserve the price actually charged at the time of purchase. That historical order-item price should not automatically change when the current catalog price changes.

Normalization separates current product information from historical transaction facts. It does not mean every repeated-looking value should always be updated together.

---

## 3. Three Types of Database Anomalies

One of the most important reasons for normalization is preventing data anomalies.

There are three major anomalies:

1. Insertion anomaly.
2. Update anomaly.
3. Deletion anomaly.

Let's understand each one.

### 3.1 Insertion Anomaly

An insertion anomaly occurs when we cannot insert certain information without inserting unrelated information as well.

Consider this table:

| order_id | customer_name | product_name |
| -------: | ------------- | ------------ |
|      101 | Rahul         | Laptop       |
|      102 | Amit          | Mouse        |

Suppose we want to add a new product:

```text
Product: Monitor
Price: 12000
```

But no customer has purchased it yet.

Our current table requires an `order_id` and `customer_name` to store a product.

We cannot independently add the product without creating unrelated order information or allowing missing values.

This is an insertion anomaly.

**Solution:** Store product information separately from order information.

### 3.2 Update Anomaly

An update anomaly occurs when the same information is stored in multiple rows and must be updated consistently.

Example:

| order_id | customer_id | customer_email  |
| -------: | ----------: | --------------- |
|      101 |           1 | rahul@gmail.com |
|      102 |           1 | rahul@gmail.com |
|      104 |           1 | rahul@gmail.com |

Suppose Rahul changes his email address.

We must update all three rows.

If we update only two, the database becomes inconsistent.

**Solution:** Store customer email once in a separate customers table.

### 3.3 Deletion Anomaly

A deletion anomaly occurs when deleting one record unintentionally removes other information that should have been preserved.

Consider:

| order_id | customer_name | product_name |
| -------: | ------------- | ------------ |
|      101 | Rahul         | Laptop       |
|      102 | Amit          | Mouse        |
|      103 | Priya         | Keyboard     |

Suppose Amit cancels his only order.

We delete the row:

```sql
DELETE FROM orders
WHERE order_id = 102;
```

If customer information exists only in this table, Amit's customer information is also lost.

We may have wanted to delete only the order, not the customer.

**Solution:** Store customers and orders independently.

### 3.4 Comparison

| Anomaly           | Problem                                       | Example                                        |
| ----------------- | --------------------------------------------- | ---------------------------------------------- |
| Insertion anomaly | Cannot insert information independently       | Cannot add a product without an order          |
| Update anomaly    | Same fact must be updated in multiple rows    | Customer email changes in multiple records     |
| Deletion anomaly  | Deleting one fact removes another useful fact | Deleting an order removes customer information |

**Remember:** Normalization is primarily about organizing data so that independent facts can be stored and maintained independently.

---

## 4. Understanding Functional Dependency

Before learning normal forms, we need to understand functional dependency.

Functional dependency is a relationship between attributes (columns) in a relational table.

If one attribute determines another attribute, we express it as:

\[
A \rightarrow B
\]

This means:

**If we know the value of A, we can uniquely determine the value of B.**

Here:

- A is called the determinant.
- B is the dependent attribute.

### 4.1 Example: Customer Table

| customer_id | customer_name | customer_email  |
| ----------: | ------------- | --------------- |
|           1 | Rahul         | rahul@gmail.com |
|           2 | Amit          | amit@gmail.com  |
|           3 | Priya         | priya@gmail.com |

Assuming `customer_id` uniquely identifies a customer:

\[
customer_id \rightarrow customer_name
\]

\[
customer_id \rightarrow customer_email
\]

This means customer ID determines the customer's name and email.

For example:

```text
customer_id = 1

customer_name = Rahul
customer_email = rahul@gmail.com
```

### 4.2 Functional Dependency Does Not Mean One-to-One

Consider:

\[
customer_id \rightarrow customer_name
\]

This does not mean every customer name must be unique.

Two different customers can have the same name.

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Rahul         |

The functional dependency still holds because each customer ID identifies exactly one name value.

### 4.3 Another Example: Product Table

| product_id | product_name | price |
| ---------: | ------------ | ----: |
|        501 | Laptop       | 50000 |
|        502 | Mouse        |   800 |
|        503 | Keyboard     |  1500 |

Dependencies:

\[
product_id \rightarrow product_name
\]

\[
product_id \rightarrow price
\]

The product ID determines the product name and its current catalog price.

### 4.4 Functional Dependency and Business Rules

Functional dependencies are based on the rules of the data model, not just the values currently present in a sample table.

For example, two customers may currently have different email addresses. That alone does not prove that email uniquely identifies customers.

The application must have a business rule such as:

```text
Every customer must have a unique email address.
```

Then we can model:

\[
email \rightarrow customer_id
\]

A database can enforce this rule using a UNIQUE constraint.

```sql
ALTER TABLE customers
ADD CONSTRAINT customers_email_unique
UNIQUE(email);
```

---

## 5. Types of Functional Dependencies

There are several functional dependency concepts used when studying normalization.

### 5.1 Trivial Functional Dependency

A functional dependency is trivial when the right-hand side is already a subset of the left-hand side.

Example:

\[
\{A,B\} \rightarrow A
\]

Knowing A and B obviously determines A.

Another example:

\[
\{A,B\} \rightarrow \{A,B\}
\]

These dependencies are always true.

### 5.2 Non-Trivial Functional Dependency

A dependency is non-trivial when the right-hand side is not a subset of the left-hand side.

Example:

\[
customer_id \rightarrow customer_name
\]

The customer name is not part of the determinant.

### 5.3 Fully Non-Trivial Functional Dependency

A dependency is fully non-trivial when the left-hand and right-hand sides have no attributes in common.

Example:

\[
customer_id \rightarrow customer_email
\]

There are no common attributes between the two sides.

### 5.4 Transitive Dependency

A transitive dependency occurs when one attribute determines another through an intermediate attribute.

Consider:

| employee_id | department_id | department_name |
| ----------: | ------------: | --------------- |
|           1 |            10 | Engineering     |
|           2 |            10 | Engineering     |
|           3 |            20 | Sales           |

Assume:

\[
employee_id \rightarrow department_id
\]

And:

\[
department_id \rightarrow department_name
\]

Therefore:

\[
employee_id \rightarrow department_name
\]

through `department_id`.

This is a transitive dependency.

It becomes important when studying Third Normal Form (3NF).

---

## 6. Keys and Their Relationship With Normalization

Keys help identify records and understand functional dependencies.

### 6.1 Super Key

A super key is any set of one or more attributes that uniquely identifies a row.

Consider:

| student_id | email         | name  |
| ---------: | ------------- | ----- |
|          1 | a@example.com | Rahul |
|          2 | b@example.com | Amit  |

Possible super keys:

- `student_id`
- `email`
- `(student_id, email)`
- `(student_id, name)` if `student_id` is unique

A super key may contain unnecessary attributes.

### 6.2 Candidate Key

A candidate key is a minimal super key.

Minimal means removing any attribute would cause it to stop uniquely identifying a row.

In the example:

- `student_id`
- `email`

can both be candidate keys, assuming both are unique and non-null.

### 6.3 Primary Key

A primary key is the candidate key selected as the main identifier for the table.

```sql
CREATE TABLE students (
    student_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100)
);
```

Here:

- `student_id` is the primary key.
- `email` is an alternate candidate key, assuming the business rule requires uniqueness.

### 6.4 Composite Key

A composite key contains multiple columns.

Consider an enrollment table:

| student_id | course_id | enrollment_date |
| ---------: | --------: | --------------- |
|          1 |       101 | 2026-01-01      |
|          1 |       102 | 2026-01-02      |
|          2 |       101 | 2026-01-03      |

A student can enroll in multiple courses, and a course can have multiple students.

The combination uniquely identifies an enrollment:

\[
(student_id, course_id)
\rightarrow enrollment_date
\]

SQL:

```sql
CREATE TABLE enrollments (
    student_id BIGINT,
    course_id BIGINT,
    enrollment_date DATE,

    PRIMARY KEY (student_id, course_id)
);
```

### 6.5 Prime and Non-Prime Attributes

These concepts become important in 2NF and 3NF.

- **Prime attribute:** An attribute that belongs to at least one candidate key.
- **Non-prime attribute:** An attribute that does not belong to any candidate key.

Example:

| student_id | course_id | student_name | course_name       |
| ---------: | --------: | ------------ | ----------------- |
|          1 |       101 | Rahul        | DBMS              |
|          1 |       102 | Rahul        | Operating Systems |
|          2 |       101 | Amit         | DBMS              |

Assume the candidate key is:

\[
(student_id, course_id)
\]

Then:

| Attribute    | Classification |
| ------------ | -------------- |
| student_id   | Prime          |
| course_id    | Prime          |
| student_name | Non-prime      |
| course_name  | Non-prime      |

---

## 7. Understanding Decomposition

Decomposition means splitting one table into smaller tables.

This is the primary technique used in normalization.

Consider:

### Original Table

| order_id | customer_id | customer_name | product_id | product_name |
| -------: | ----------: | ------------- | ---------: | ------------ |
|      101 |           1 | Rahul         |        501 | Laptop       |
|      102 |           1 | Rahul         |        502 | Mouse        |
|      103 |           2 | Amit          |        503 | Keyboard     |

We can decompose it into three tables.

### Customers

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Amit          |

### Products

| product_id | product_name |
| ---------: | ------------ |
|        501 | Laptop       |
|        502 | Mouse        |
|        503 | Keyboard     |

### Orders

| order_id | customer_id | product_id |
| -------: | ----------: | ---------: |
|      101 |           1 |        501 |
|      102 |           1 |        502 |
|      103 |           2 |        503 |

Now customer information exists in one place, and product information exists in another.

The relationships are maintained through foreign keys.

### SQL Implementation

```sql
CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(customer_id),
    product_id BIGINT REFERENCES products(product_id)
);
```

### 7.1 Why is decomposition useful?

- Reduces duplicated information.
- Makes updates easier.
- Separates independent entities.
- Improves consistency.
- Makes relationships explicit.

However, decomposition must be performed carefully.

Splitting tables incorrectly can introduce problems such as losing information when joining them back together.

This brings us to two important properties.

---

## 8. Properties of Good Decomposition

A good decomposition should ideally satisfy two important properties:

1. Lossless Join.
2. Dependency Preservation.

### 8.1 Lossless Join Decomposition

A decomposition is lossless when joining the decomposed tables reconstructs exactly the original relation, without losing information or introducing spurious rows.

Consider the original table:

| employee_id | department_id | department_name |
| ----------: | ------------: | --------------- |
|           1 |            10 | Engineering     |
|           2 |            10 | Engineering     |
|           3 |            20 | Sales           |

We decompose it into:

**Employee**

| employee_id | department_id |
| ----------: | ------------: |
|           1 |            10 |
|           2 |            10 |
|           3 |            20 |

**Department**

| department_id | department_name |
| ------------: | --------------- |
|            10 | Engineering     |
|            20 | Sales           |

Now join them:

```sql
SELECT
    e.employee_id,
    e.department_id,
    d.department_name
FROM employees e
JOIN departments d
ON e.department_id = d.department_id;
```

The original information can be reconstructed correctly.

This is a lossless decomposition.

**Why does it work?**

Because `department_id` uniquely identifies a department in the Department table.

For a binary decomposition of relation R into R1 and R2, a standard lossless-join condition is that their common attributes functionally determine all attributes of at least one of the two decomposed relations.

### 8.2 Lossy Decomposition

A lossy decomposition can create incorrect combinations when the decomposed tables are joined.

Consider the original relation:

| student | course            |
| ------- | ----------------- |
| Rahul   | DBMS              |
| Amit    | Operating Systems |

Suppose we decompose it incorrectly.

**Students**

| student |
| ------- |
| Rahul   |
| Amit    |

**Courses**

| course            |
| ----------------- |
| DBMS              |
| Operating Systems |

Joining these tables without a relationship produces:

| student | course            |
| ------- | ----------------- |
| Rahul   | DBMS              |
| Rahul   | Operating Systems |
| Amit    | DBMS              |
| Amit    | Operating Systems |

Two extra combinations have been introduced.

These are called spurious tuples.

The original relationship between students and courses has been lost.

### 8.3 Dependency Preservation

A decomposition is dependency-preserving when the original functional dependencies can be enforced by checking the decomposed relations individually, without requiring joins.

Consider:

\[
A \rightarrow B
\]

\[
B \rightarrow C
\]

Suppose the original relation is:

```text
R(A, B, C)
```

We decompose it into:

```text
R1(A, B)
R2(B, C)
```

The first dependency can be checked in R1.

The second dependency can be checked in R2.

Both dependencies are preserved.

However, some decompositions may lose the ability to enforce all original dependencies locally.

In those situations, enforcing the original rules may require joining tables.

### 8.4 Lossless Join vs Dependency Preservation

| Property                | Main purpose                                                                      |
| ----------------------- | --------------------------------------------------------------------------------- |
| Lossless Join           | Ensures no information is lost or invented during reconstruction                  |
| Dependency Preservation | Ensures functional dependencies can be enforced without joining decomposed tables |

A good normalization design aims to satisfy both where possible.

---

## 9. Normalization vs Denormalization

Normalization and denormalization are related but different database design approaches.

### 9.1 Normalization

Normalization separates independent entities into logically related tables.

Example:

```text
Customers
    |
    v
Orders
    |
    v
Products
```

More precisely, orders and products are commonly connected through an order-items table in a real e-commerce system.

Benefits:

- Reduced unnecessary duplication.
- Better data integrity.
- Easier independent updates.
- Clear relationships.

Potential tradeoffs:

- More tables.
- More JOIN operations.
- Some queries become more complex.

### 9.2 Denormalization

Denormalization intentionally introduces redundancy to improve certain query patterns or simplify reads.

For example, consider an order table:

| order_id | customer_id | customer_name | total |
| -------: | ----------: | ------------- | ----: |
|      101 |           1 | Rahul         | 50800 |
|      102 |           1 | Rahul         |   800 |

Here, `customer_name` is stored alongside order data even though it can be retrieved through the customer relationship.

Why might we do this?

A reporting system may frequently need the customer's name with every order.

However, storing the current customer name redundantly requires a clear update strategy.

Another example is storing an order's historical customer name or product price as a transaction snapshot. This redundancy may be intentional because historical values must remain unchanged even when the customer profile or product catalog changes.

### 9.3 Comparison

| Feature          | Normalization                                 | Denormalization                           |
| ---------------- | --------------------------------------------- | ----------------------------------------- |
| Data duplication | Reduces unnecessary duplication               | Introduces controlled redundancy          |
| Data integrity   | Easier to maintain through centralized facts  | Requires additional synchronization rules |
| Read queries     | May require more JOINs                        | Can simplify some reads                   |
| Write operations | Often simpler for independent facts           | May require updating redundant copies     |
| Storage          | Often more space-efficient for repeated facts | May consume more space                    |
| Main goal        | Data consistency and logical organization     | Query performance or read simplicity      |

### 9.4 When should you denormalize?

Consider denormalization when:

- A specific read query is demonstrably expensive.
- The same joins are repeatedly required.
- Read performance is more important than write simplicity.
- Redundant data can be maintained reliably.
- Caching or materialized views are insufficient or unsuitable.

**Important:** Denormalization should be a deliberate optimization, not an excuse for poor database design.

---

## 10. Normalization in Real-World Backend Applications

Consider an e-commerce system.

Initially, developers may create a single table:

```sql
CREATE TABLE order_data (
    order_id BIGINT,
    customer_id BIGINT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    product_id BIGINT,
    product_name VARCHAR(100),
    product_price NUMERIC(10, 2),
    quantity INT
);
```

This combines several independent concepts:

- Customers.
- Products.
- Orders.
- Order items.

A better logical design is:

### Customers

```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);
```

### Products

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    current_price NUMERIC(10, 2) NOT NULL
);
```

### Orders

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Order Items

```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);
```

Notice that `unit_price` is stored in `order_items`.

Why?

Because the price charged at the time of purchase is a historical transaction fact.

Suppose:

```text
Product catalog price: ₹50,000
Order placed at: ₹48,000
```

Later, the catalog price changes to ₹55,000.

The historical order must still show ₹48,000.

This is not accidental redundancy. It is an intentional snapshot of the transaction.

This example demonstrates an important principle:

**Normalization does not mean eliminating every repeated value. It means identifying which facts belong to which entities and relationships.**

---

## 11. Common Misconceptions

### Misconception 1: Normalization means creating as many tables as possible.

Incorrect.

The objective is to organize data according to dependencies and business rules, not maximize table count.

### Misconception 2: Normalization always improves query performance.

Incorrect.

Normalization can reduce redundant storage and improve consistency, but queries may require additional joins.

Performance depends on the workload and execution plan.

### Misconception 3: Duplicate values are always bad.

Incorrect.

Some repeated values are intentional.

For example, historical order prices should remain fixed even if product prices change.

### Misconception 4: Foreign keys automatically solve normalization.

Incorrect.

Foreign keys enforce referential integrity. They do not automatically eliminate redundancy or guarantee that a schema satisfies a normal form.

### Misconception 5: A primary key means a table is normalized.

Incorrect.

A table can have a primary key and still contain partial or transitive dependencies.

### Misconception 6: Denormalization is always bad.

Incorrect.

Controlled denormalization can be useful for performance, reporting, and historical snapshots.

### Misconception 7: Normalization is only about storage optimization.

Incorrect.

Its central purpose is sound data organization and avoiding anomalies caused by inappropriate dependencies and redundancy.

---

## 12. Important Interview Questions

### Q1. What is database normalization?

It is the process of organizing relational tables to reduce unnecessary redundancy and prevent data anomalies.

### Q2. Why do we need normalization?

To reduce duplication, improve consistency, simplify updates, and maintain data integrity.

### Q3. What are the three data anomalies?

- Insertion anomaly.
- Update anomaly.
- Deletion anomaly.

### Q4. What is functional dependency?

A relationship where one set of attributes uniquely determines another set of attributes.

Example:

\[
customer_id \rightarrow customer_name
\]

### Q5. What is a trivial functional dependency?

A dependency where the right-hand side is a subset of the left-hand side.

Example:

\[
(A,B) \rightarrow A
\]

### Q6. What is a transitive dependency?

A dependency where one attribute determines another through an intermediate attribute.

Example:

\[
A \rightarrow B,\quad B \rightarrow C
\]

Therefore, A determines C transitively.

### Q7. What is the difference between a super key and a candidate key?

A super key uniquely identifies a row. A candidate key is a minimal super key.

### Q8. What is a prime attribute?

An attribute that belongs to at least one candidate key.

### Q9. What is decomposition?

Splitting a relation into smaller relations while maintaining the required information and dependencies.

### Q10. What is lossless decomposition?

A decomposition that allows the original relation to be reconstructed without losing information or generating spurious tuples.

### Q11. What is dependency preservation?

A property that allows the original functional dependencies to be enforced using the decomposed tables without requiring joins.

### Q12. What is denormalization?

The intentional introduction of redundancy to improve selected read patterns or simplify queries.

### Q13. Is normalization always better than denormalization?

No. Normalization supports data integrity and logical organization. Denormalization can improve certain workloads but introduces synchronization responsibilities.

### Q14. Can a table with a primary key still have redundancy?

Yes. A primary key guarantees row identification, not compliance with all normal forms.

### Q15. Does normalization eliminate all duplicate data?

No. It reduces unnecessary redundancy. Some repeated values are valid and intentional.

---

## 13. Chapter Summary

| Concept                 | Key takeaway                                           |
| ----------------------- | ------------------------------------------------------ |
| Normalization           | Organizing tables to reduce unnecessary redundancy     |
| Data redundancy         | Repeated storage of the same fact                      |
| Insertion anomaly       | Difficulty inserting independent information           |
| Update anomaly          | Inconsistent updates across repeated records           |
| Deletion anomaly        | Deleting one fact unintentionally removes another      |
| Functional dependency   | One attribute set determines another                   |
| Trivial dependency      | Right-hand side is a subset of the left-hand side      |
| Non-trivial dependency  | Right-hand side is not a subset of the left-hand side  |
| Transitive dependency   | Dependency through an intermediate attribute           |
| Super key               | Any unique identifier                                  |
| Candidate key           | Minimal super key                                      |
| Primary key             | Selected candidate key                                 |
| Prime attribute         | Attribute belonging to a candidate key                 |
| Decomposition           | Splitting a relation into smaller relations            |
| Lossless join           | Reconstruction without losing or inventing information |
| Dependency preservation | Dependencies remain enforceable without joins          |
| Denormalization         | Intentional redundancy for selected workloads          |

### The most important mental model

Normalization is not simply about splitting one large table into multiple smaller tables.

It is about understanding:

1. What facts are being stored?
2. Which attributes determine other attributes?
3. Which facts belong to independent entities?
4. What anomalies can occur when facts are stored together?
5. How can tables be decomposed without losing relationships or dependencies?

Once you understand functional dependencies and anomalies, the different normal forms become much easier to understand.
