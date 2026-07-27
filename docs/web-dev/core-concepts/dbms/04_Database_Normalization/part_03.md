---
sidebar_label: Normalization in Practice
sidebar_position: 1
---

# Normalization in Practice

## 1. Introduction: Applying Normalization to Real Applications

In the previous chapters, we studied:

- Normalization fundamentals.
- Functional dependencies.
- Insertion, update, and deletion anomalies.
- 1NF, 2NF, 3NF, and BCNF.
- Lossless decomposition and dependency preservation.

Now the important question is:

**How do we apply normalization when designing an actual database for a backend application?**

Knowing the definitions of normal forms is not enough.

A backend developer must be able to:

1. Identify entities and relationships.
2. Identify functional dependencies.
3. Choose primary and candidate keys.
4. Identify unnecessary redundancy.
5. Decompose tables appropriately.
6. Preserve relationships using foreign keys.
7. Decide when normalization is sufficient.
8. Recognize when controlled denormalization is justified.

We will use practical examples from e-commerce, authentication, inventory, and reporting systems.

---

## 2. Start With Business Requirements, Not Normal Forms

A common database-design mistake is starting with tables before understanding the application's requirements.

Consider an e-commerce application.

Requirements:

- Customers can register.
- Customers can place multiple orders.
- Each order can contain multiple products.
- A product can appear in multiple orders.
- Each order has a payment.
- Each product belongs to a category.
- Inventory is maintained by warehouse.
- Orders must preserve the price charged at purchase time.

Before creating tables, identify the entities.

| Entity      | Responsibility              |
| ----------- | --------------------------- |
| Customers   | Customer information        |
| Products    | Product catalog             |
| Categories  | Product categorization      |
| Orders      | Customer purchases          |
| Order Items | Products included in orders |
| Payments    | Payment information         |
| Warehouses  | Warehouse information       |
| Inventory   | Product stock by warehouse  |

Now identify relationships.

```text
Customers
    |
    | 1:N
    v
Orders
    |
    | 1:N
    v
Order Items
    ^
    | N:1
Products
    |
    | N:1
    v
Categories

Orders
    |
    | 1:1 or 1:N, depending on payment model
    v
Payments

Products
    |
    | N:M
    v
Warehouses
```

The Products-Warehouses relationship is many-to-many because a product can exist in multiple warehouses, and a warehouse stores multiple products.

It requires an associative table: Inventory.

**Important:** The relationship diagram is based on business rules. Do not assume every application has exactly these cardinalities.

---

## 3. Step-by-Step Database Design

Let's design the e-commerce database.

### Step 1: Identify the Customers Table

A customer has:

- Customer ID.
- Name.
- Email.
- Phone.
- Registration date.

```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Functional dependencies:

\[
id \rightarrow name, email, phone, created_at
\]

Assuming email must be unique:

\[
email \rightarrow id
\]

The customer ID is the primary key, and email is an alternate candidate key under this business rule.

### Step 2: Identify the Categories Table

```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
```

Functional dependency:

\[
id \rightarrow name
\]

Category information is stored independently rather than repeated in every product record.

### Step 3: Identify the Products Table

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    current_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Functional dependency:

\[
id \rightarrow category_id, name, description, current_price
\]

The category relationship is maintained using a foreign key.

### Step 4: Identify the Orders Table

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    order_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Functional dependency:

\[
id \rightarrow customer_id, order_status, created_at
\]

Each order belongs to one customer.

A customer can have multiple orders.

### Step 5: Identify the Order Items Table

```sql
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);
```

This table represents the many-to-many relationship between orders and products.

An order can contain multiple products.

A product can appear in multiple orders.

The `unit_price` stores the historical price charged when the order was placed.

A possible business constraint is:

```sql
ALTER TABLE order_items
ADD CONSTRAINT unique_order_product
UNIQUE (order_id, product_id);
```

Use this only if the application requires a product to appear at most once per order. Some systems allow multiple separate lines for the same product.

### Step 6: Identify the Payments Table

Suppose an order can have multiple payment attempts, but each payment attempt belongs to one order.

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30),
    payment_status VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(150) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

This models a one-to-many relationship between orders and payment attempts.

If the business allows only one payment record per order, add an appropriate UNIQUE constraint on `order_id`.

### Step 7: Identify Warehouses and Inventory

```sql
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255)
);
```

Inventory connects products and warehouses.

```sql
CREATE TABLE inventory (
    product_id BIGINT NOT NULL REFERENCES products(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    available_quantity INT NOT NULL DEFAULT 0
        CHECK (available_quantity >= 0),

    PRIMARY KEY (product_id, warehouse_id)
);
```

The composite primary key prevents duplicate inventory records for the same product and warehouse.

Functional dependency:

\[
(product_id, warehouse_id)
\rightarrow available_quantity
\]

This is a practical example of a table whose candidate key is composite.

---

## 4. Why This Design Is Better Than One Large Table

Imagine storing everything in one table:

```text
order_id
customer_name
customer_email
product_name
product_price
category_name
warehouse_name
payment_status
quantity
```

This creates several problems.

### 4.1 Customer Redundancy

A customer placing ten orders may have their information repeated across many rows.

Changing their email would require multiple updates.

### 4.2 Product Redundancy

A product purchased by thousands of customers would have its name and current catalog price repeated thousands of times.

### 4.3 Category Redundancy

The category name would be repeated for every product or order involving that category.

### 4.4 Inventory Redundancy

Stock information could be repeated across multiple order records, making inventory maintenance unreliable.

### 4.5 Payment Redundancy

Multiple payment attempts could create repeated order and customer information.

The normalized structure separates these independent facts.

| Table       | Stores                                             |
| ----------- | -------------------------------------------------- |
| customers   | Customer facts                                     |
| categories  | Category facts                                     |
| products    | Product catalog facts                              |
| orders      | Order facts                                        |
| order_items | Order-product relationship and transaction details |
| payments    | Payment attempt facts                              |
| warehouses  | Warehouse facts                                    |
| inventory   | Product stock per warehouse                        |

---

## 5. Normalization Does Not Mean Every Fact Must Exist Only Once

This is an important practical distinction.

Consider:

```text
products.current_price = ₹55,000
```

And:

```text
order_items.unit_price = ₹50,000
```

Why are these values different?

Because the customer purchased the product when its price was ₹50,000.

Later, the product catalog price changed to ₹55,000.

The order must preserve the original transaction price.

These columns represent different business facts:

| Column                 | Meaning                  |
| ---------------------- | ------------------------ |
| products.current_price | Current selling price    |
| order_items.unit_price | Historical price charged |

This is not necessarily a normalization violation.

Similarly, an order may store a snapshot of the shipping address even though the customer has a separate address record.

Why?

Because the customer might change their address later, but the original order must retain its delivery destination.

**Rule:** Before removing repeated-looking information, determine whether the values represent the same fact or different facts at different points in time.

---

## 6. Handling Relationships Correctly

Normalization and relationship modeling go together.

### 6.1 One-to-One Relationship

Example: User and User Profile.

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    bio TEXT,
    date_of_birth DATE
);
```

The UNIQUE constraint on `user_id` ensures that each user has at most one profile.

This relationship can be useful when optional profile information is separated from core authentication information.

However, splitting a table into two is not automatically necessary just to satisfy normalization.

### 6.2 One-to-Many Relationship

Example: Customer and Orders.

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id)
);
```

One customer can have multiple orders.

The foreign key is placed on the many side.

### 6.3 Many-to-Many Relationship

Example: Orders and Products.

An order contains multiple products, and a product appears in multiple orders.

Use an intermediate table:

```sql
CREATE TABLE order_items (
    order_id BIGINT REFERENCES orders(id),
    product_id BIGINT REFERENCES products(id),
    quantity INT NOT NULL,

    PRIMARY KEY (order_id, product_id)
);
```

The junction table is important because the relationship itself contains additional information, such as quantity and historical unit price.

---

## 7. Normalization and Constraints

Normalization organizes data, but database constraints enforce important rules.

A well-designed schema uses both.

### 7.1 PRIMARY KEY

Guarantees unique row identification and disallows NULL values in primary-key columns.

```sql
id BIGSERIAL PRIMARY KEY
```

### 7.2 FOREIGN KEY

Maintains referential integrity.

```sql
customer_id BIGINT REFERENCES customers(id)
```

An order cannot reference a customer that does not exist, unless the constraint is deliberately deferred and satisfied before commit.

### 7.3 UNIQUE

Prevents duplicate values or combinations.

```sql
email VARCHAR(255) UNIQUE
```

### 7.4 NOT NULL

Prevents missing values.

```sql
name VARCHAR(100) NOT NULL
```

### 7.5 CHECK

Enforces conditions on individual rows.

```sql
quantity INT CHECK (quantity > 0)
```

### 7.6 DEFAULT

Provides a default value when a column is omitted.

```sql
created_at TIMESTAMP DEFAULT NOW()
```

**Important:** Constraints enforce business and integrity rules. They do not automatically normalize a table.

---

## 8. Normalization and JOIN Performance

A common concern is:

"If we split data into multiple tables, won't every query require more JOINs?"

Yes, normalization can increase the number of joins required by some queries.

But this does not mean normalization is bad.

Consider:

```sql
SELECT
    o.id AS order_id,
    c.name AS customer_name,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price
FROM orders o
JOIN customers c
    ON c.id = o.customer_id
JOIN order_items oi
    ON oi.order_id = o.id
JOIN products p
    ON p.id = oi.product_id;
```

This query reconstructs the information from multiple normalized tables.

PostgreSQL can choose different join algorithms and execution plans depending on table sizes, indexes, statistics, and query conditions.

### When do JOINs become expensive?

- Large tables.
- Missing or unsuitable indexes.
- Poor join conditions.
- Returning excessive rows.
- Unnecessary columns.
- Inefficient filtering.
- Poor query plans.

### How can we optimize?

- Index frequently used join columns when beneficial.
- Filter rows as early as appropriate.
- Retrieve only required columns.
- Inspect execution plans.
- Avoid unnecessary joins.
- Use pagination for large result sets.

Do not denormalize solely because a query contains several JOINs. First measure the actual performance problem.

---

## 9. When Should You Denormalize?

Denormalization is a deliberate design decision.

Consider a reporting dashboard that frequently retrieves:

- Customer name.
- Order date.
- Product name.
- Quantity.
- Total order amount.

A normalized design requires joins across several tables.

For a heavily read-oriented reporting workload, we might create a reporting table or materialized view.

### 9.1 Example: Materialized View

```sql
CREATE MATERIALIZED VIEW order_summary AS
SELECT
    o.id AS order_id,
    c.id AS customer_id,
    c.name AS customer_name,
    o.created_at,
    SUM(oi.quantity * oi.unit_price) AS order_total
FROM orders o
JOIN customers c
    ON c.id = o.customer_id
JOIN order_items oi
    ON oi.order_id = o.id
GROUP BY
    o.id,
    c.id,
    c.name,
    o.created_at;
```

Now reporting queries can read from the materialized view.

```sql
SELECT *
FROM order_summary
WHERE customer_id = 1;
```

However, materialized views are not automatically kept current after source-table changes.

They need refreshing:

```sql
REFRESH MATERIALIZED VIEW order_summary;
```

For concurrent refresh, PostgreSQL requires an appropriate unique index on the materialized view.

### 9.2 Other Denormalization Techniques

| Technique          | Purpose                                                            |
| ------------------ | ------------------------------------------------------------------ |
| Materialized views | Precompute frequently used query results                           |
| Cached aggregates  | Avoid repeatedly calculating expensive totals                      |
| Snapshot columns   | Preserve historical values                                         |
| Read models        | Optimize data for specific query patterns                          |
| Redis caching      | Store frequently requested results outside the relational database |

These approaches have different consistency and maintenance characteristics.

---

## 10. Normalization in Microservices

Normalization also matters when designing data ownership across services.

Consider an e-commerce architecture:

```text
Customer Service
      |
      v
Customer Database

Product Service
      |
      v
Product Database

Order Service
      |
      v
Order Database

Payment Service
      |
      v
Payment Database
```

Each service owns its data.

The Order Service may store:

- Customer ID.
- Product ID.
- Product name snapshot.
- Purchase price snapshot.

Why store snapshots?

Because the Order Service must preserve historical transaction details even if the Product Service changes its catalog.

This is an example of intentional denormalization across service boundaries.

A relational database within each service can still use normalization.

**Important distinction:**

- Normalization is primarily about relational schema design.
- Microservice data ownership is about system architecture.
- A service may intentionally maintain snapshots of data owned by another service.

These are related design concerns, but they are not the same concept.

---

## 11. Common Database Design Mistakes

### Mistake 1: Putting everything into one table

This creates redundancy and anomalies.

**Better:** Identify entities and relationships before designing tables.

### Mistake 2: Creating too many unnecessary tables

Not every column needs its own table.

For example, splitting a simple product's name and description into separate tables without a meaningful business reason can make the schema unnecessarily complex.

**Better:** Normalize according to actual dependencies and business requirements.

### Mistake 3: Ignoring historical data

Changing a customer's current address should not silently change the shipping address of a completed order.

**Better:** Preserve transaction snapshots where historical accuracy is required.

### Mistake 4: Treating current values and historical values as identical

A product's current price is different from the price charged in a completed order.

**Better:** Model them as separate facts.

### Mistake 5: Using application code as the only integrity mechanism

If the application is the only place enforcing relationships, another script or service could insert invalid data.

**Better:** Use database constraints for rules that belong in the database.

### Mistake 6: Denormalizing without measuring

Adding redundant fields may introduce synchronization bugs.

**Better:** Identify an actual query-performance problem before denormalizing.

### Mistake 7: Ignoring indexes on foreign keys

PostgreSQL does not automatically create an index on the referencing side of a foreign key.

**Better:** Evaluate indexes on frequently searched and joined foreign-key columns.

---

## 12. Practical Database Design Checklist

When designing a relational database, use this sequence.

### Phase 1: Understand the Requirements

- [ ] Identify the main business entities.
- [ ] Identify their attributes.
- [ ] Understand one-to-one, one-to-many, and many-to-many relationships.
- [ ] Identify business rules.
- [ ] Identify historical information that must be preserved.

### Phase 2: Identify Keys and Dependencies

- [ ] Select primary keys.
- [ ] Identify candidate keys.
- [ ] Identify composite keys.
- [ ] Identify functional dependencies.
- [ ] Identify partial dependencies.
- [ ] Identify transitive dependencies.

### Phase 3: Normalize

- [ ] Remove repeating groups and non-atomic structures.
- [ ] Check 1NF.
- [ ] Remove partial dependencies.
- [ ] Check 2NF.
- [ ] Remove disallowed transitive and other dependencies.
- [ ] Check 3NF.
- [ ] Check BCNF where appropriate.
- [ ] Verify lossless decomposition.
- [ ] Consider dependency preservation.

### Phase 4: Implement Constraints

- [ ] Primary keys.
- [ ] Foreign keys.
- [ ] Unique constraints.
- [ ] NOT NULL constraints.
- [ ] CHECK constraints.
- [ ] Appropriate defaults.

### Phase 5: Optimize

- [ ] Identify frequently executed queries.
- [ ] Create appropriate indexes.
- [ ] Analyze JOIN performance.
- [ ] Use EXPLAIN ANALYZE.
- [ ] Evaluate whether denormalization is justified.
- [ ] Monitor read and write performance.

---

## 13. Important Interview Questions

### Q1. How do you design a normalized database for an e-commerce application?

Identify entities such as customers, products, orders, order items, payments, and inventory. Determine their relationships, functional dependencies, and candidate keys. Then decompose relations to remove unnecessary redundancy while preserving required relationships.

### Q2. Why do we use junction tables?

To represent many-to-many relationships between two entities and store attributes belonging to the relationship itself.

### Q3. Why do we store unit_price in order_items if products already have a price?

Because `unit_price` represents the historical price charged when the order was placed, while `products.current_price` represents the current catalog price.

### Q4. Does normalization eliminate the need for JOINs?

No. Normalization often makes JOINs necessary to retrieve related information from separate tables.

### Q5. Does normalization always improve performance?

No. It improves logical organization and reduces unnecessary redundancy, but additional joins may increase query complexity.

### Q6. When should you denormalize?

When a measured workload demonstrates that a particular read pattern needs optimization and the additional redundancy can be maintained reliably.

### Q7. What is the difference between a normalized database and a materialized view?

A normalized database organizes source data into relations according to dependencies. A materialized view stores the results of a query for faster reads and must be refreshed to reflect source changes.

### Q8. Why should historical order data be preserved?

Because historical transactions must remain accurate even when customer details, product prices, or catalog information change.

### Q9. Can two different microservices store the same customer information?

Yes, when justified by service ownership, snapshots, or read requirements. Each service must define how that data is synchronized or preserved.

### Q10. What is the difference between normalization and database indexing?

- Normalization organizes data and reduces unnecessary redundancy.
- Indexing creates access structures to improve query retrieval.

They solve different problems.

---

## 14. Chapter Summary

| Concept                     | Practical takeaway                                             |
| --------------------------- | -------------------------------------------------------------- |
| Requirements analysis       | Understand entities and business rules before designing tables |
| Entity identification       | Separate independent business concepts                         |
| Functional dependencies     | Determine which attributes depend on which keys                |
| Primary and candidate keys  | Identify records and enforce uniqueness                        |
| Relationship modeling       | Represent 1:1, 1:N, and N:M relationships correctly            |
| Junction tables             | Handle many-to-many relationships                              |
| Historical snapshots        | Preserve values that must remain accurate over time            |
| Constraints                 | Enforce database integrity                                     |
| JOINs                       | Retrieve related data from normalized tables                   |
| Denormalization             | Introduce controlled redundancy for justified workloads        |
| Materialized views          | Store precomputed query results                                |
| Microservice data ownership | Keep service data boundaries explicit                          |
| Performance testing         | Measure before changing schema design                          |

### Final mental model

Good database design starts with understanding the business, not memorizing normal forms.

The correct process is:

1. Identify entities.
2. Identify relationships.
3. Identify keys and functional dependencies.
4. Normalize the schema.
5. Enforce integrity using constraints.
6. Optimize actual queries using indexes and execution plans.
7. Denormalize only when a measurable requirement justifies it.

**The goal is not to create the most normalized database possible. The goal is to create a database that preserves data correctness, supports the application's requirements, and performs reliably under its actual workload.**
