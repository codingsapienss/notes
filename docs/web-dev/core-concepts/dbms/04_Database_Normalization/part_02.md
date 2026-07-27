---
sidebar_label: Normal Forms (0NF/UNF, 1NF, 2NF, 3NF, BCNF)
sidebar_position: 1
---

# Normal Forms (0NF/UNF, 1NF, 2NF, 3NF, BCNF)

## 1. Introduction to Normal Forms

In last section, we studied database normalization, functional dependencies, keys, and data anomalies.

Now we will study the different levels of normalization called **Normal Forms**.

A normal form is a set of rules that a relational database table must satisfy.

The major normal forms covered in this chapter are:

1. UNF / 0NF — Unnormalized Form
2. 1NF — First Normal Form
3. 2NF — Second Normal Form
4. 3NF — Third Normal Form
5. BCNF — Boyce-Codd Normal Form

Each normal form addresses particular problems in database design.

<text weight="semibold" color="default">Normalization progression</text>

```text
       UNF / 0NF
            |
            v
          1NF
            |
            v
          2NF
            |
            v
          3NF
            |
            v
          BCNF
```

Each higher normal form builds on the requirements of the preceding normal forms.

For example:

- A table in 2NF must already satisfy 1NF.
- A table in 3NF must already satisfy 2NF.
- A table in BCNF must already satisfy 3NF.

The purpose is not to blindly reach the highest normal form. It is to design a schema that maintains correctness, integrity, and practical performance.

---

## 2. Unnormalized Form (UNF / 0NF)

UNF represents data that has not yet been organized according to the requirements of 1NF.

It can contain:

- Multiple values in one column.
- Repeating groups.
- Nested or structured values.
- Repeated information.

### 2.1 Example

Consider a student table:

| student_id | student_name | courses             |
| ---------: | ------------ | ------------------- |
|          1 | Rahul        | DBMS, SQL, Java     |
|          2 | Amit         | Python, Java        |
|          3 | Priya        | DBMS, Python, React |

The `courses` column contains multiple values.

This is an example of unnormalized data.

A relational column is intended to represent one value from its defined domain in each row, rather than an embedded list of independent course values.

### 2.2 Another Example: Repeating Groups

| student_id | student_name | course_1 | course_2 | course_3 |
| ---------: | ------------ | -------- | -------- | -------- |
|          1 | Rahul        | DBMS     | SQL      | Java     |
|          2 | Amit         | Python   | Java     | NULL     |
|          3 | Priya        | DBMS     | Python   | React    |

This design also contains repeating groups.

Problems:

- What happens when a student takes four courses?
- What happens when a student takes ten courses?
- How do we search for students enrolled in SQL?
- How do we count students enrolled in each course?
- What happens when a student has no course?

The structure is difficult to maintain and query.

### 2.3 How to Improve It

Instead of storing multiple courses in one row, create separate rows.

| student_id | student_name | course |
| ---------: | ------------ | ------ |
|          1 | Rahul        | DBMS   |
|          1 | Rahul        | SQL    |
|          1 | Rahul        | Java   |
|          2 | Amit         | Python |
|          2 | Amit         | Java   |
|          3 | Priya        | DBMS   |
|          3 | Priya        | Python |
|          3 | Priya        | React  |

This is closer to First Normal Form.

**Key takeaway:** UNF is a starting point where repeating groups and non-atomic structures may exist.

---

## 3. First Normal Form (1NF)

A relation satisfies First Normal Form when every attribute contains a single value from its defined domain in each row, rather than a repeating group or collection of values.

In practical terms:

1. Each cell contains one value.
2. There are no repeating groups of columns.
3. Each row can be uniquely identified.
4. Each column represents a consistent attribute.

### 3.1 Example: Violating 1NF

| student_id | student_name | courses      |
| ---------: | ------------ | ------------ |
|          1 | Rahul        | DBMS, SQL    |
|          2 | Amit         | Python, Java |

The `courses` column contains multiple values.

This violates the intended 1NF structure.

### 3.2 Convert to 1NF

| student_id | student_name | course |
| ---------: | ------------ | ------ |
|          1 | Rahul        | DBMS   |
|          1 | Rahul        | SQL    |
|          2 | Amit         | Python |
|          2 | Amit         | Java   |

Now each cell contains one course value.

### 3.3 SQL Implementation

```sql
CREATE TABLE student_courses (
    student_id BIGINT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,

    PRIMARY KEY (student_id, course)
);
```

The composite primary key prevents the same student-course combination from being inserted twice.

Example inserts:

```sql
INSERT INTO student_courses
(student_id, student_name, course)
VALUES
(1, 'Rahul', 'DBMS'),
(1, 'Rahul', 'SQL'),
(2, 'Amit', 'Python'),
(2, 'Amit', 'Java');
```

### 3.4 What 1NF Does Not Solve

Consider:

| student_id | student_name | course |
| ---------: | ------------ | ------ |
|          1 | Rahul        | DBMS   |
|          1 | Rahul        | SQL    |
|          2 | Amit         | Python |
|          2 | Amit         | Java   |

We have removed the multiple values from individual cells.

However, Rahul's name is repeated.

Suppose Rahul changes his name due to a correction.

We must update multiple rows.

This is still an update anomaly.

1NF solves the problem of repeating groups and non-atomic column values, but it does not eliminate all redundancy.

**Important:** 1NF does not mean that every value in the entire table must be unique. Repeated values across rows are perfectly valid.

---

## 4. Second Normal Form (2NF)

Second Normal Form builds on 1NF.

A relation is in 2NF when:

1. It is already in 1NF.
2. Every non-prime attribute is fully functionally dependent on every candidate key.

In simpler language:

**A non-key attribute must depend on the whole candidate key, not just part of a composite candidate key.**

This is where partial dependencies become important.

### 4.1 Understanding Partial Dependency

A partial dependency occurs when a non-prime attribute depends on only a proper subset of a composite candidate key.

Let's understand through an example.

Consider:

### Student Courses Table

| student_id | course_id | student_name | course_name | grade |
| ---------: | --------: | ------------ | ----------- | ----- |
|          1 |       101 | Rahul        | DBMS        | A     |
|          1 |       102 | Rahul        | SQL         | B     |
|          2 |       101 | Amit         | DBMS        | A     |
|          2 |       103 | Amit         | Java        | B     |

Assume:

- A student can enroll in multiple courses.
- A course can have multiple students.
- Each student-course combination identifies one enrollment.

The candidate key is:

\[
(student_id, course_id)
\]

Now examine the functional dependencies.

\[
student_id \rightarrow student_name
\]

\[
course_id \rightarrow course_name
\]

\[
(student_id, course_id) \rightarrow grade
\]

Notice:

- `student_name` depends only on `student_id`.
- `course_name` depends only on `course_id`.
- `grade` depends on the complete combination of `student_id` and `course_id`.

The first two are partial dependencies.

### 4.2 Why Is This a Problem?

Suppose Rahul enrolls in five courses.

His name will be stored five times.

If his name changes, multiple records must be updated.

Similarly, the course name `DBMS` will be repeated for every student enrolled in that course.

This creates unnecessary redundancy and update anomalies.

### 4.3 Convert to 2NF

Split the original table into three tables.

**Students**

| student_id | student_name |
| ---------: | ------------ |
|          1 | Rahul        |
|          2 | Amit         |

**Courses**

| course_id | course_name |
| --------: | ----------- |
|       101 | DBMS        |
|       102 | SQL         |
|       103 | Java        |

**Enrollments**

| student_id | course_id | grade |
| ---------: | --------: | ----- |
|          1 |       101 | A     |
|          1 |       102 | B     |
|          2 |       101 | A     |
|          2 |       103 | B     |

Now:

- Student details depend on `student_id`.
- Course details depend on `course_id`.
- Grade depends on the complete student-course combination.

The partial dependencies have been removed.

### 4.4 SQL Implementation

```sql
CREATE TABLE students (
    student_id BIGINT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
    course_id BIGINT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL
);

CREATE TABLE enrollments (
    student_id BIGINT REFERENCES students(student_id),
    course_id BIGINT REFERENCES courses(course_id),
    grade VARCHAR(5),

    PRIMARY KEY (student_id, course_id)
);
```

### 4.5 Important Point: 2NF and Single-Column Keys

If a table has only one candidate key and that key consists of a single attribute, it cannot have a partial dependency on a proper subset of that key.

Therefore, a table in 1NF with only single-attribute candidate keys automatically satisfies 2NF.

This is why partial dependency is especially relevant when composite candidate keys exist.

**Key takeaway:** 2NF removes partial dependencies of non-prime attributes on candidate keys.

---

## 5. Third Normal Form (3NF)

Third Normal Form builds on 2NF.

A relation is in 3NF when:

1. It is already in 2NF.
2. It has no disallowed transitive dependency of non-prime attributes on candidate keys.

A commonly used formal definition is:

For every non-trivial functional dependency:

\[
X \rightarrow A
\]

at least one of the following must be true:

- X is a super key.
- A is a prime attribute.

This formal definition is important because the simpler explanation about transitive dependencies does not cover every possible 3NF case.

### 5.1 Example

Consider an employee table:

| employee_id | employee_name | department_id | department_name |
| ----------: | ------------- | ------------: | --------------- |
|           1 | Rahul         |            10 | Engineering     |
|           2 | Amit          |            10 | Engineering     |
|           3 | Priya         |            20 | Sales           |
|           4 | Neha          |            20 | Sales           |

Assume:

- Each employee belongs to one department.
- Each department has one department name.
- `employee_id` uniquely identifies an employee.
- `department_id` uniquely identifies a department.

Functional dependencies:

\[
employee_id \rightarrow employee_name
\]

\[
employee_id \rightarrow department_id
\]

\[
department_id \rightarrow department_name
\]

Therefore:

\[
employee_id \rightarrow department_name
\]

through `department_id`.

This is a transitive dependency.

### 5.2 Why Is This a Problem?

Suppose the Engineering department is renamed to Platform Engineering.

We must update every employee record belonging to that department.

If we update only some rows, the database becomes inconsistent.

Department information should be stored independently of employee information.

### 5.3 Convert to 3NF

Create two tables.

**Employees**

| employee_id | employee_name | department_id |
| ----------: | ------------- | ------------: |
|           1 | Rahul         |            10 |
|           2 | Amit          |            10 |
|           3 | Priya         |            20 |
|           4 | Neha          |            20 |

**Departments**

| department_id | department_name |
| ------------: | --------------- |
|            10 | Engineering     |
|            20 | Sales           |

Now department information exists in one place.

### 5.4 SQL Implementation

```sql
CREATE TABLE departments (
    department_id BIGINT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    department_id BIGINT REFERENCES departments(department_id)
);
```

### 5.5 Querying the Data

Although the data is split into two tables, we can retrieve it using a JOIN.

```sql
SELECT
    e.employee_id,
    e.employee_name,
    d.department_name
FROM employees e
JOIN departments d
ON e.department_id = d.department_id;
```

The application still receives the required information.

The difference is that department information is maintained in one location.

**Key takeaway:** 3NF removes disallowed transitive dependencies and ensures non-key facts are associated with the keys, the whole key, and nothing but the key.

---

## 6. Boyce-Codd Normal Form (BCNF)

BCNF is a stricter version of Third Normal Form.

A relation is in BCNF if, for every non-trivial functional dependency:

\[
X \rightarrow Y
\]

X must be a super key.

In simpler terms:

**Every determinant must be a super key.**

BCNF addresses certain anomalies that can still exist in tables satisfying 3NF.

### 6.1 Example

Consider a university table:

| student_id | course_id | instructor |
| ---------: | --------: | ---------- |
|          1 |       101 | Rahul      |
|          2 |       101 | Rahul      |
|          3 |       102 | Amit       |

Assume these business rules:

1. A student can enroll in multiple courses.
2. Each course has one instructor.
3. Each instructor teaches only one course.

The functional dependencies are:

\[
(student_id, course_id) \rightarrow instructor
\]

\[
instructor \rightarrow course_id
\]

The candidate keys are:

- `(student_id, course_id)`
- `(student_id, instructor)`

Why is `(student_id, instructor)` also a candidate key?

Because the instructor determines the course, and the student plus course identifies an enrollment.

Now examine:

\[
instructor \rightarrow course_id
\]

Is `instructor` a super key?

No.

An instructor can teach multiple students, so instructor alone does not uniquely identify a row.

Therefore, the relation violates BCNF.

### 6.2 Does It Satisfy 3NF?

Yes, under the stated business rules.

For the dependency:

\[
instructor \rightarrow course_id
\]

- `instructor` is not a super key.
- `course_id` is a prime attribute because it belongs to the candidate key `(student_id, course_id)`.

The formal 3NF condition is satisfied.

But the BCNF condition is not satisfied because the determinant is not a super key.

This is an important example of how 3NF and BCNF differ.

### 6.3 Problems in the Original Table

Suppose a new course is assigned to instructor Amit, but no student has enrolled yet.

We cannot represent the instructor-course assignment independently without introducing a student record.

This is an insertion anomaly.

Also, the same instructor-course relationship is repeated for every enrolled student.

### 6.4 Convert to BCNF

Decompose the relation into two tables.

**Instructor Courses**

| instructor | course_id |
| ---------- | --------: |
| Rahul      |       101 |
| Amit       |       102 |

**Student Instructors**

| student_id | instructor |
| ---------: | ---------- |
|          1 | Rahul      |
|          2 | Rahul      |
|          3 | Amit       |

The first table records which course an instructor teaches.

The second records which instructor is associated with a student.

The decomposition is lossless under the stated functional dependencies.

### 6.5 SQL Implementation

```sql
CREATE TABLE instructor_courses (
    instructor VARCHAR(100) PRIMARY KEY,
    course_id BIGINT NOT NULL
);

CREATE TABLE student_instructors (
    student_id BIGINT NOT NULL,
    instructor VARCHAR(100) NOT NULL
        REFERENCES instructor_courses(instructor),

    PRIMARY KEY (student_id, instructor)
);
```

The exact constraints depend on the business rules. For example, if courses also have independent identifiers and course assignments require additional attributes, the schema may need further refinement.

**Key takeaway:** BCNF requires every determinant in every non-trivial functional dependency to be a super key.

---

## 7. Comparison of All Normal Forms

| Normal Form | Main requirement                                    | Problem addressed                                    |
| ----------- | --------------------------------------------------- | ---------------------------------------------------- |
| UNF / 0NF   | No formal normalization requirements                | Repeating groups and unstructured data               |
| 1NF         | Atomic values and no repeating groups               | Multiple values in a cell                            |
| 2NF         | 1NF + no partial dependency of non-prime attributes | Partial dependency                                   |
| 3NF         | 2NF + formal 3NF dependency condition               | Transitive and other disallowed dependencies         |
| BCNF        | Every determinant is a super key                    | Remaining dependency anomalies not eliminated by 3NF |

### Quick Memory Technique

- **1NF:** One value per cell.
- **2NF:** Depend on the whole candidate key.
- **3NF:** Depend on the key, not through a non-key determinant.
- **BCNF:** Every determinant must be a super key.

These are memory aids, not substitutes for the formal definitions.

---

## 8. Complete Example: Normalizing an E-commerce Table

Let's take a larger example and move through the normal forms.

### Initial Table — UNF

| order_id | customer | products       |
| -------: | -------- | -------------- |
|      101 | Rahul    | Laptop, Mouse  |
|      102 | Amit     | Keyboard       |
|      103 | Rahul    | Monitor, Mouse |

The `products` column contains multiple values.

This is UNF.

### Step 1 — Convert to 1NF

Create one row for each order-product combination.

| order_id | customer_id | customer_name | product_id | product_name | quantity |
| -------: | ----------: | ------------- | ---------: | ------------ | -------: |
|      101 |           1 | Rahul         |        501 | Laptop       |        1 |
|      101 |           1 | Rahul         |        502 | Mouse        |        2 |
|      102 |           2 | Amit          |        503 | Keyboard     |        1 |
|      103 |           1 | Rahul         |        504 | Monitor      |        1 |
|      103 |           1 | Rahul         |        502 | Mouse        |        1 |

Assume each product appears at most once per order.

The candidate key is:

\[
(order_id, product_id)
\]

Functional dependencies:

\[
order_id \rightarrow customer_id
\]

\[
customer_id \rightarrow customer_name
\]

\[
product_id \rightarrow product_name
\]

\[
(order_id, product_id) \rightarrow quantity
\]

### Step 2 — Convert to 2NF

The non-prime attributes `customer_id`, `customer_name`, and `product_name` do not all depend on the complete composite key.

For example:

\[
order_id \rightarrow customer_id
\]

\[
product_id \rightarrow product_name
\]

Split the table.

**Orders**

| order_id | customer_id |
| -------: | ----------: |
|      101 |           1 |
|      102 |           2 |
|      103 |           1 |

**Products**

| product_id | product_name |
| ---------: | ------------ |
|        501 | Laptop       |
|        502 | Mouse        |
|        503 | Keyboard     |
|        504 | Monitor      |

**Order Items**

| order_id | product_id | quantity |
| -------: | ---------: | -------: |
|      101 |        501 |        1 |
|      101 |        502 |        2 |
|      102 |        503 |        1 |
|      103 |        504 |        1 |
|      103 |        502 |        1 |

Now the attributes depend on the relevant complete keys.

### Step 3 — Convert to 3NF

Notice:

\[
order_id \rightarrow customer_id
\]

\[
customer_id \rightarrow customer_name
\]

The customer name is transitively dependent on the order ID.

Create a separate Customers table.

**Customers**

| customer_id | customer_name |
| ----------: | ------------- |
|           1 | Rahul         |
|           2 | Amit          |

**Orders**

| order_id | customer_id |
| -------: | ----------: |
|      101 |           1 |
|      102 |           2 |
|      103 |           1 |

**Products**

| product_id | product_name |
| ---------: | ------------ |
|        501 | Laptop       |
|        502 | Mouse        |
|        503 | Keyboard     |
|        504 | Monitor      |

**Order Items**

| order_id | product_id | quantity |
| -------: | ---------: | -------: |
|      101 |        501 |        1 |
|      101 |        502 |        2 |
|      102 |        503 |        1 |
|      103 |        504 |        1 |
|      103 |        502 |        1 |

The design now separates customers, orders, products, and order items.

Under the stated dependencies, these relations satisfy the relevant 3NF conditions and are also in BCNF.

### Important Business Detail: Product Price

In a real e-commerce system, the order item should usually also store the price charged at purchase time:

```sql
CREATE TABLE order_items (
    order_id BIGINT REFERENCES orders(order_id),
    product_id BIGINT REFERENCES products(product_id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,

    PRIMARY KEY (order_id, product_id)
);
```

`unit_price` is a historical transaction value, not necessarily the current product catalog price.

Do not remove it merely because the product table also has a price column.

---

## 9. Practical PostgreSQL Exercise

Use the following exercise to test your understanding.

### Step 1: Create an unnormalized-style table

```sql
CREATE TABLE student_data (
    student_id BIGINT,
    student_name VARCHAR(100),
    course_1 VARCHAR(100),
    course_2 VARCHAR(100),
    course_3 VARCHAR(100)
);
```

Insert data:

```sql
INSERT INTO student_data
VALUES
(1, 'Rahul', 'DBMS', 'SQL', 'Java'),
(2, 'Amit', 'Python', 'Java', NULL),
(3, 'Priya', 'DBMS', 'React', 'Python');
```

### Step 2: Identify the problems

- Repeating groups.
- Difficult course searches.
- Fixed limit of three courses.
- Difficult course counts.
- Repeated student information after restructuring into multiple rows.

### Step 3: Design a 1NF table

```sql
CREATE TABLE student_courses (
    student_id BIGINT,
    student_name VARCHAR(100),
    course_name VARCHAR(100),

    PRIMARY KEY (student_id, course_name)
);
```

### Step 4: Design a 2NF structure

```sql
CREATE TABLE students (
    student_id BIGINT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
    course_id BIGINT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL
);

CREATE TABLE enrollments (
    student_id BIGINT REFERENCES students(student_id),
    course_id BIGINT REFERENCES courses(course_id),

    PRIMARY KEY (student_id, course_id)
);
```

Now student and course details are stored independently.

### Step 5: Verify the relationships

```sql
SELECT
    s.student_name,
    c.course_name
FROM enrollments e
JOIN students s
    ON s.student_id = e.student_id
JOIN courses c
    ON c.course_id = e.course_id;
```

The normalized structure allows us to retrieve the same information without storing student and course names repeatedly in every enrollment row.

---

## 10. Common Mistakes and Misconceptions

### Mistake 1: Assuming 1NF means no duplicate rows

1NF concerns atomic values and repeating groups. It does not prohibit repeated values across different rows.

### Mistake 2: Thinking 2NF applies only to composite primary keys

The formal definition considers all candidate keys, not just the selected primary key.

Partial dependency is particularly relevant when candidate keys are composite.

### Mistake 3: Confusing partial and transitive dependencies

| Partial dependency                                                         | Transitive dependency                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| Depends on part of a composite candidate key                               | Depends through another determinant                      |
| Addressed by 2NF                                                           | Addressed by 3NF                                         |
| Example: `student_id → student_name` when key is `(student_id, course_id)` | Example: `employee_id → department_id → department_name` |

### Mistake 4: Assuming every 3NF table is in BCNF

Incorrect.

BCNF is stricter.

A table can satisfy 3NF because the dependent attribute is prime, while the determinant is not a super key.

### Mistake 5: Assuming BCNF always preserves dependencies

Incorrect.

BCNF decomposition can lose dependency preservation.

This is an important tradeoff when designing schemas.

### Mistake 6: Splitting tables without checking lossless joins

Incorrect decomposition can create spurious tuples or lose relationships.

Always consider the lossless-join property.

### Mistake 7: Normalizing historical transaction values incorrectly

A product's current price and an order's historical purchase price represent different facts.

They should not be treated as interchangeable.

---

## 11. Important Interview Questions

### Q1. What are normal forms?

Normal forms are formal rules used to evaluate and improve relational database design.

### Q2. What is 1NF?

A relation is in 1NF when attributes contain single values from their domains and there are no repeating groups.

### Q3. What is 2NF?

A relation is in 2NF when it is in 1NF and every non-prime attribute is fully functionally dependent on every candidate key.

### Q4. What is partial dependency?

A non-prime attribute depends on a proper subset of a composite candidate key.

### Q5. What is 3NF?

A relation is in 3NF when, for every non-trivial functional dependency X → A, either X is a super key or A is a prime attribute.

### Q6. What is transitive dependency?

A dependency where one attribute determines another through an intermediate attribute.

Example:

\[
A \rightarrow B,\quad B \rightarrow C
\]

### Q7. What is BCNF?

A relation is in BCNF when, for every non-trivial functional dependency, the determinant is a super key.

### Q8. What is the difference between 3NF and BCNF?

3NF permits a dependency whose determinant is not a super key if the dependent attribute is prime. BCNF does not permit this exception.

### Q9. Can a table be in 3NF but not BCNF?

Yes. This can happen when a non-super-key determinant determines a prime attribute.

### Q10. Can BCNF decomposition lose dependency preservation?

Yes. Some BCNF decompositions are lossless but do not preserve all original functional dependencies locally.

### Q11. What is the difference between 1NF and 2NF?

1NF focuses on atomic values and repeating groups. 2NF additionally removes partial dependencies of non-prime attributes on candidate keys.

### Q12. What is the difference between 2NF and 3NF?

2NF removes partial dependencies. 3NF addresses transitive and other disallowed dependencies according to its formal condition.

### Q13. What is the difference between 3NF and denormalization?

3NF is a schema-design normal form. Denormalization intentionally introduces redundancy for selected workload requirements.

### Q14. Which normal form is commonly used in application databases?

Many transactional relational schemas are designed around 3NF or BCNF principles, with selective denormalization where justified.

### Q15. Does normalization guarantee faster queries?

No. It improves logical organization and helps prevent anomalies, but additional joins can affect query performance.

---

## 12. Chapter Summary

| Normal Form | Main Rule                                                                             | Primary Problem Addressed                    |
| ----------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| UNF / 0NF   | Unstructured data may contain repeating groups                                        | Poor initial structure                       |
| 1NF         | Atomic values and no repeating groups                                                 | Multiple values in cells                     |
| 2NF         | No partial dependency of non-prime attributes                                         | Partial dependency                           |
| 3NF         | Every non-trivial dependency has a super-key determinant or prime dependent attribute | Transitive and other disallowed dependencies |
| BCNF        | Every non-trivial determinant must be a super key                                     | Remaining anomalies in some 3NF relations    |

### Final revision technique

Remember these four rules:

1. **1NF:** One value per cell.
2. **2NF:** Every non-prime attribute depends on the whole candidate key.
3. **3NF:** For every non-trivial dependency, the determinant is a super key or the dependent attribute is prime.
4. **BCNF:** Every non-trivial determinant is a super key.

The most important thing is to understand the functional dependencies before attempting normalization.

If you cannot identify the candidate keys and functional dependencies correctly, you cannot reliably determine whether a table satisfies 2NF, 3NF, or BCNF.
