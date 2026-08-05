---
sidebar_label: "Real-World Relational Data Modeling"
sidebar_position: 1
---

# Real-World Relational Data Modeling

## 1. What is Relational Data Modeling?

**Relational data modeling** is the process of designing database tables, columns, keys, constraints, and relationships to represent real-world data accurately.

A good database design should provide:

- Data integrity.
- Minimal unnecessary duplication.
- Clear relationships between entities.
- Efficient querying.
- Maintainable structure.
- Reliable updates and transactions.

Example: An e-commerce application needs to manage customers, products, orders, payments, and inventory.

Instead of storing everything in one table, we create separate related tables.

## 2. Identify Entities and Their Relationships

An **entity** represents a real-world object or concept that needs to be stored.

For TechBazaar:

| Entity      | Purpose                    |
| ----------- | -------------------------- |
| Customers   | Customer information       |
| Categories  | Product categories         |
| Products    | Product details            |
| Orders      | Customer purchases         |
| Order Items | Products within each order |
| Payments    | Payment transactions       |
| Departments | Company departments        |
| Employees   | Employee information       |

Each entity generally becomes a separate table.

## 3. Customers and Orders — One-to-Many

One customer can place multiple orders, but each order belongs to one customer.

```text
customers (1) -------- (N) orders
```

Schema:

```sql
CREATE TABLE customers (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
);
```

**Design rule:** Place the foreign key on the many-side table (`orders`).

## 4. Products and Categories

A simple design assumes each product belongs to one category, while a category can contain multiple products.

```text
categories (1) -------- (N) products
```

```sql
CREATE TABLE categories (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(category_id),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);
```

Example:

| category_id | category_name |
| ----------: | ------------- |
|           1 | Electronics   |
|           2 | Clothing      |

| product_id | product_name | category_id |
| ---------: | ------------ | ----------: |
|        101 | Laptop       |           1 |
|        102 | Mobile       |           1 |
|        103 | T-Shirt      |           2 |

**Important:** If a product can belong to multiple categories, use a many-to-many relationship with a junction table.

## 5. Orders and Order Items

An order can contain multiple products, and a product can appear in multiple orders.

This is a many-to-many relationship.

```text
orders (1) -------- (N) order_items (N) -------- (1) products
```

The `order_items` table acts as a junction table.

```sql
CREATE TABLE order_items (
    order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    product_id BIGINT NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);
```

### Why store quantity and unit_price?

Suppose a customer purchases:

| Product | Quantity | Purchase price |
| ------- | -------: | -------------: |
| Laptop  |        1 |        ₹60,000 |
| Mouse   |        2 |           ₹500 |

The order total is:

\[
(1 \times 60000) + (2 \times 500) = 61000
\]

`unit_price` stores the price at the time of purchase.

If the product's current price changes later, historical order calculations remain correct.

**Important:** Do not calculate historical order totals using the current `products.price`.

## 6. Payments and Orders

A simple payment model can support multiple payment attempts or transactions for one order.

```text
orders (1) -------- (N) payments
```

```sql
CREATE TABLE payments (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_status TEXT NOT NULL
        CHECK (payment_status IN ('pending', 'success', 'failed')),
    transaction_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Why allow multiple payments?

- First payment attempt may fail.
- Customer may retry payment.
- An order may be paid in multiple installments.
- Refunds and payment adjustments may require separate transaction records.

**Design note:** A production payment system often needs separate payment attempts, captured transactions, refunds, and reconciliation records. Do not assume one order always has exactly one payment row.

## 7. Complete TechBazaar Relational Structure

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
    |
    | N:1
    |
categories


orders
    |
    | 1:N
    |
 payments
```

The corresponding relationships:

| Parent table | Child table | Relationship |
| ------------ | ----------- | ------------ |
| customers    | orders      | One-to-many  |
| categories   | products    | One-to-many  |
| orders       | order_items | One-to-many  |
| products     | order_items | One-to-many  |
| orders       | payments    | One-to-many  |

## 8. Complete SQL Schema

The following schema combines the main e-commerce entities.

```sql
CREATE TABLE customers (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name TEXT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories(category_id),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0)
);

CREATE TABLE orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

CREATE TABLE order_items (
    order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    product_id BIGINT NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE payments (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(order_id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_status TEXT NOT NULL
        CHECK (payment_status IN ('pending', 'success', 'failed')),
    transaction_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 9. Avoiding Data Duplication

Consider a poorly designed table:

| order_id | customer_name | customer_email  | product_name | quantity |
| -------: | ------------- | --------------- | ------------ | -------: |
|      101 | Rahul         | rahul@gmail.com | Laptop       |        1 |
|      101 | Rahul         | rahul@gmail.com | Mouse        |        2 |
|      102 | Rahul         | rahul@gmail.com | Keyboard     |        1 |

Problems:

- Customer details are repeated.
- Product details are repeated.
- Updating customer information requires multiple row updates.
- Inconsistent data can appear.

Better design:

- Store customer information in `customers`.
- Store product information in `products`.
- Store purchase information in `orders`.
- Store purchased products in `order_items`.

Use primary keys and foreign keys to connect the tables.

**Important:** Normalization reduces unnecessary duplication, but some deliberate duplication is useful when preserving historical facts, such as `order_items.unit_price`.

## 10. Choosing Between One-to-Many and Many-to-Many

| Requirement                                | Relationship | Design                              |
| ------------------------------------------ | ------------ | ----------------------------------- |
| One customer has multiple orders           | One-to-many  | `customer_id` in orders             |
| One category has multiple products         | One-to-many  | `category_id` in products           |
| One order has multiple products            | Many-to-many | `order_items` junction table        |
| One product belongs to multiple categories | Many-to-many | `product_categories` junction table |
| One order has multiple payment attempts    | One-to-many  | `order_id` in payments              |

### Example: Products Belonging to Multiple Categories

```sql
CREATE TABLE product_categories (
    product_id BIGINT REFERENCES products(product_id),
    category_id BIGINT REFERENCES categories(category_id),

    PRIMARY KEY (product_id, category_id)
);
```

This allows one product to belong to multiple categories.

## 11. Inventory Modeling

A basic inventory design can store current stock directly in the products table.

```sql
CREATE TABLE products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0)
);
```

For more advanced inventory tracking, separate stock by warehouse:

```sql
CREATE TABLE warehouses (
    warehouse_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warehouse_name TEXT NOT NULL
);

CREATE TABLE inventory (
    product_id BIGINT REFERENCES products(product_id),
    warehouse_id BIGINT REFERENCES warehouses(warehouse_id),
    available_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (available_quantity >= 0),

    PRIMARY KEY (product_id, warehouse_id)
);
```

Now the same product can have different stock quantities in different warehouses.

**Design distinction:**

- `products` stores product information.
- `inventory` stores stock information.
- `warehouses` stores warehouse information.

For production inventory systems, stock movements and reservations may also need separate tables.

## 12. Important Data Modeling Rules

| Rule                                               | Reason                                   |
| -------------------------------------------------- | ---------------------------------------- |
| Give each entity a primary key                     | Unique row identification                |
| Use foreign keys                                   | Maintain referential integrity           |
| Use NOT NULL for mandatory values                  | Prevent missing required data            |
| Use UNIQUE for unique business values              | Prevent duplicates                       |
| Use CHECK for row-level validation                 | Enforce business rules                   |
| Use junction tables for many-to-many relationships | Represent relationships correctly        |
| Store purchase-time prices                         | Preserve transaction history             |
| Use NUMERIC for financial values                   | Exact decimal arithmetic                 |
| Index frequently queried foreign keys when useful  | Improve joins and parent-key maintenance |
| Avoid unnecessary duplication                      | Reduce update anomalies                  |

## 13. Common Data Modeling Mistakes

1. Storing customers, orders, and products in one large table.
2. Storing multiple product IDs in one column as comma-separated values.
3. Forgetting junction tables for many-to-many relationships.
4. Storing only the current product price instead of the purchase-time price.
5. Using FLOAT for financial values.
6. Allowing negative quantities or prices.
7. Using CASCADE without considering historical data.
8. Assuming one order always has exactly one payment.
9. Storing inventory for multiple warehouses in a single stock value.
10. Adding indexes to every column without evaluating query patterns.

## 14. Practice Exercises

Build the TechBazaar database.

1. Create customers, categories, products, orders, order_items, and payments.
2. Insert at least three customers.
3. Insert three categories and five products.
4. Create two orders for the same customer.
5. Add multiple products to each order.
6. Store purchase-time product prices in order_items.
7. Insert multiple payment attempts for one order.
8. Create warehouses and an inventory table.
9. Create a product_categories junction table.
10. Draw the complete ER diagram showing primary and foreign keys.
11. Identify all one-to-many and many-to-many relationships.
12. Explain which information belongs in products, orders, and order_items.

## 15. Interview Questions

1. What is relational data modeling?
2. What is an entity?
3. How would you design an e-commerce database?
4. Why should customers and orders be stored separately?
5. How do you model a many-to-many relationship?
6. Why is a junction table required?
7. Why should order_items store unit_price?
8. Why can an order have multiple payment records?
9. How would you design inventory for multiple warehouses?
10. What problems occur when multiple entities are stored in one table?
11. What is the difference between product information and inventory information?
12. How do primary keys and foreign keys support relational database design?
