---
sidebar_label: "PostgreSQL with Node.js and Express"
sidebar_position: 1
---

# PostgreSQL with Node.js and Express

## 1. Introduction

Node.js applications commonly use PostgreSQL as their relational database.

A typical backend architecture looks like this:

```text
Client (Browser / Mobile App)
          |
          v
      Express API
          |
          v
   Business Logic
          |
          v
   PostgreSQL Driver
          |
          v
      PostgreSQL
```

Example request:

1. Client sends `GET /api/customers/101`.
2. Express receives the request.
3. Controller validates the customer ID.
4. Database layer executes a parameterized SQL query.
5. PostgreSQL returns the result.
6. Express sends a JSON response.

This chapter covers practical PostgreSQL integration using Node.js, Express and the `pg` package.

---

## 2. Install PostgreSQL Driver

The most commonly used PostgreSQL driver for Node.js is `pg`, also known as node-postgres.

Install:

```bash
npm install express pg dotenv
```

Development dependency:

```bash
npm install --save-dev nodemon
```

### Package responsibilities

| Package   | Purpose                                      |
| --------- | -------------------------------------------- |
| `express` | HTTP server and API routing                  |
| `pg`      | PostgreSQL database connectivity             |
| `dotenv`  | Load environment variables                   |
| `nodemon` | Restart development server when files change |

---

## 3. Configure Environment Variables

Create `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=techbazaar
DB_USER=postgres
DB_PASSWORD=your_password
```

Never commit production database credentials to Git.

Add `.env` to `.gitignore`:

```gitignore
node_modules/
.env
```

For production, use your deployment platform's secret-management mechanism rather than relying on a committed configuration file.

---

## 4. Create a PostgreSQL Connection Pool

Create `src/config/db.js`:

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log("PostgreSQL client connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

module.exports = pool;
```

### What is Pool?

A pool manages reusable database connections.

Without pooling, the application might repeatedly establish new connections for every API request.

With pooling:

```text
Request 1 ──┐
Request 2 ──┼──> Connection Pool ──> PostgreSQL
Request 3 ──┤
Request 4 ──┘
```

### Important pool options

| Option                    | Meaning                                   |
| ------------------------- | ----------------------------------------- |
| `max`                     | Maximum number of connections in the pool |
| `idleTimeoutMillis`       | Time before an idle connection is closed  |
| `connectionTimeoutMillis` | Maximum time to wait for a connection     |

**Important:** Pool size must be planned across all application instances. Five instances with a pool maximum of 20 can potentially create 100 connections.

---

## 5. Test the Database Connection

Create `src/config/test-db.js`:

```javascript
const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query(`
            SELECT
                NOW() AS current_time,
                current_database() AS database_name,
                version() AS postgres_version
        `);

    console.log("Database connected successfully");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await pool.end();
  }
}

testConnection();
```

Execute:

```bash
node src/config/test-db.js
```

This verifies that Node.js can communicate with PostgreSQL.

---

## 6. Understand pool.query()

The `pool.query()` method executes SQL using a connection acquired from the pool.

Example:

```javascript
const result = await pool.query("SELECT * FROM customers");
```

The result object contains several properties.

```javascript
console.log(result.rows);
console.log(result.rowCount);
console.log(result.command);
console.log(result.fields);
```

### Important properties

| Property   | Meaning                                                   |
| ---------- | --------------------------------------------------------- |
| `rows`     | Returned records                                          |
| `rowCount` | Number of rows affected or returned, depending on command |
| `command`  | SQL command type                                          |
| `fields`   | Column metadata                                           |

Example:

```javascript
const result = await pool.query(
  "SELECT customer_id, customer_name FROM customers",
);

console.log(result.rows);
```

Possible output:

```javascript
[
  {
    customer_id: 101,
    customer_name: "Rahul",
  },
  {
    customer_id: 102,
    customer_name: "Amit",
  },
];
```

---

## 7. Execute Parameterized Queries

Always use parameterized queries for user-supplied values.

### Avoid

```javascript
const email = req.query.email;

const result = await pool.query(`
    SELECT *
    FROM customers
    WHERE email = '${email}'
`);
```

This creates SQL injection risk.

### Correct approach

```javascript
const email = req.query.email;

const result = await pool.query(
  `
    SELECT
        customer_id,
        customer_name,
        email
    FROM customers
    WHERE email = $1
    `,
  [email],
);
```

### Multiple parameters

```javascript
const result = await pool.query(
  `
    SELECT *
    FROM orders
    WHERE customer_id = $1
      AND status = $2
    `,
  [101, "completed"],
);
```

PostgreSQL placeholders start from `$1`, not `?`.

### Important

Parameterized values cannot represent:

- Table names.
- Column names.
- SQL keywords.
- Sort directions.

Use strict allowlists for dynamic SQL identifiers and keywords.

---

## 8. Build a Basic Express Application

Project structure:

```text
techbazaar-api/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── customer.controller.js
│   │
│   ├── routes/
│   │   └── customer.routes.js
│   │
│   ├── services/
│   │   └── customer.service.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
└── package.json
```

### app.js

```javascript
require("dotenv").config();

const express = require("express");
const customerRoutes = require("./routes/customer.routes");

const app = express();

app.use(express.json());

app.use("/api/customers", customerRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 9. Implement GET API — Fetch All Customers

### customer.routes.js

```javascript
const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");

router.get("/", customerController.getCustomers);

module.exports = router;
```

### customer.controller.js

```javascript
const pool = require("../config/db");

exports.getCustomers = async (req, res, next) => {
  try {
    const result = await pool.query(`
            SELECT
                customer_id,
                customer_name,
                email
            FROM customers
            ORDER BY customer_id
        `);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
```

Request:

```http
GET /api/customers
```

Example response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "customer_id": 101,
      "customer_name": "Rahul",
      "email": "rahul@example.com"
    },
    {
      "customer_id": 102,
      "customer_name": "Amit",
      "email": "amit@example.com"
    }
  ]
}
```

---

## 10. Implement GET API — Fetch Customer by ID

Route:

```javascript
router.get("/:id", customerController.getCustomerById);
```

Controller:

```javascript
exports.getCustomerById = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const result = await pool.query(
      `
            SELECT
                customer_id,
                customer_name,
                email
            FROM customers
            WHERE customer_id = $1
            `,
      [customerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
```

Request:

```http
GET /api/customers/101
```

### Important

Do not assume that a valid-looking ID exists in the database. Validate the input and handle missing records separately.

---

## 11. Implement POST API — Create Customer

Route:

```javascript
router.post("/", customerController.createCustomer);
```

Controller:

```javascript
exports.createCustomer = async (req, res, next) => {
  try {
    const { customer_name, email } = req.body;

    if (!customer_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required",
      });
    }

    const result = await pool.query(
      `
            INSERT INTO customers (
                customer_name,
                email
            )
            VALUES ($1, $2)
            RETURNING customer_id, customer_name, email
            `,
      [customer_name, email],
    );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
```

Request:

```http
POST /api/customers
Content-Type: application/json
```

Body:

```json
{
  "customer_name": "Prashant",
  "email": "prashant@example.com"
}
```

### Why RETURNING?

PostgreSQL can return generated IDs and inserted values directly.

This avoids an additional SELECT query.

---

## 12. Implement PUT API — Update Customer

Route:

```javascript
router.put("/:id", customerController.updateCustomer);
```

Controller:

```javascript
exports.updateCustomer = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const { customer_name, email } = req.body;

    if (!customer_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required",
      });
    }

    const result = await pool.query(
      `
            UPDATE customers
            SET
                customer_name = $1,
                email = $2
            WHERE customer_id = $3
            RETURNING customer_id, customer_name, email
            `,
      [customer_name, email, customerId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
```

### PUT vs PATCH

| PUT                                                      | PATCH                           |
| -------------------------------------------------------- | ------------------------------- |
| Usually represents replacing the resource representation | Represents partial modification |
| Commonly requires all editable fields                    | Can accept selected fields      |
| Repeating the same replacement is generally idempotent   | Depends on the operation        |

A PATCH endpoint should dynamically update only validated, allowlisted columns. Never interpolate arbitrary request-body keys into SQL.

---

## 13. Implement DELETE API — Delete Customer

Route:

```javascript
router.delete("/:id", customerController.deleteCustomer);
```

Controller:

```javascript
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const result = await pool.query(
      `
            DELETE FROM customers
            WHERE customer_id = $1
            RETURNING customer_id
            `,
      [customerId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
```

### Important

A customer may be referenced by orders.

The foreign-key configuration determines whether deletion is:

- Rejected.
- Cascaded.
- Handled through another configured action.

Do not use cascading deletes without understanding the business consequences.

---

## 14. Separate Controllers and Services

For a larger application, keep HTTP handling separate from business logic and database operations.

### Controller

Responsible for:

- Reading request parameters.
- Validating HTTP-level input.
- Calling service functions.
- Returning HTTP responses.

### Service

Responsible for:

- Business rules.
- Database operations.
- Coordinating transactions.
- Returning application-level results.

Example structure:

```text
src/
│
├── controllers/
│   └── customer.controller.js
│
├── services/
│   └── customer.service.js
│
├── routes/
│   └── customer.routes.js
│
└── config/
    └── db.js
```

### customer.service.js

```javascript
const pool = require("../config/db");

exports.getCustomerById = async (customerId) => {
  const result = await pool.query(
    `
        SELECT
            customer_id,
            customer_name,
            email
        FROM customers
        WHERE customer_id = $1
        `,
    [customerId],
  );

  return result.rows[0] || null;
};
```

### customer.controller.js

```javascript
const customerService = require("../services/customer.service");

exports.getCustomerById = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await customerService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
```

**Important:** The service layer does not need to exist in every small application. Introduce it when it improves separation, reuse and testability.

---

## 15. Implement Pagination in an API

A production API should not return an unlimited number of records.

### Controller

```javascript
exports.getOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
    );

    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
            SELECT
                order_id,
                customer_id,
                total_amount,
                status,
                created_at
            FROM orders
            ORDER BY created_at DESC, order_id DESC
            LIMIT $1
            OFFSET $2
            `,
      [limit, offset],
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
```

Request:

```http
GET /api/orders?page=2&limit=20
```

### Important

- Validate query parameters.
- Set a maximum page size.
- Use a deterministic ORDER BY.
- Consider keyset pagination for large datasets.
- If the API returns a total count, calculate it separately or use an appropriate query design.

---

## 16. Implement Search and Filtering

Example requirement:

Find orders by customer ID and status.

```javascript
exports.searchOrders = async (req, res, next) => {
  try {
    const { customer_id, status } = req.query;

    const result = await pool.query(
      `
            SELECT
                order_id,
                customer_id,
                total_amount,
                status,
                created_at
            FROM orders
            WHERE ($1::INT IS NULL OR customer_id = $1)
              AND ($2::TEXT IS NULL OR status = $2)
            ORDER BY created_at DESC, order_id DESC
            `,
      [customer_id ? Number(customer_id) : null, status || null],
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
```

### Request examples

```http
GET /api/orders?customer_id=101
```

```http
GET /api/orders?status=completed
```

```http
GET /api/orders?customer_id=101&status=completed
```

### Important performance note

Optional-filter expressions such as:

```sql
($1 IS NULL OR customer_id = $1)
```

are convenient but may not produce the best plan for every workload.

For complex search endpoints, consider building SQL from a fixed set of allowlisted conditions and parameterized values.

---

## 17. Execute Transactions Correctly in Node.js

A transaction must use one database connection.

### Example: Create an order and order item

```javascript
const pool = require("../config/db");

exports.createOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { customer_id, total_amount, product_id, quantity, unit_price } =
      req.body;

    await client.query("BEGIN");

    const orderResult = await client.query(
      `
            INSERT INTO orders (
                customer_id,
                total_amount,
                status
            )
            VALUES ($1, $2, $3)
            RETURNING order_id
            `,
      [customer_id, total_amount, "pending"],
    );

    const orderId = orderResult.rows[0].order_id;

    await client.query(
      `
            INSERT INTO order_items (
                order_id,
                product_id,
                quantity,
                unit_price
            )
            VALUES ($1, $2, $3, $4)
            `,
      [orderId, product_id, quantity, unit_price],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order_id: orderId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};
```

### Critical rules

1. Acquire one client using `pool.connect()`.
2. Execute `BEGIN` on that client.
3. Execute every transaction query using that same client.
4. Commit only after all operations succeed.
5. Roll back on failure.
6. Release the client in `finally`.

The example demonstrates transaction structure. A production order endpoint must also validate inputs, verify product availability, calculate totals on the server and handle concurrent inventory changes.

---

## 18. Handle Transactions With Multiple Products

An order can contain multiple products.

Example request:

```json
{
  "customer_id": 101,
  "items": [
    {
      "product_id": 5,
      "quantity": 2
    },
    {
      "product_id": 8,
      "quantity": 1
    }
  ]
}
```

A safe workflow:

1. Validate the customer.
2. Validate each product and quantity.
3. Start a transaction.
4. Lock or conditionally update the required inventory rows.
5. Calculate prices using trusted database values.
6. Insert the order.
7. Insert all order items.
8. Commit.
9. Roll back if any required operation fails.

Do not trust client-submitted prices or totals.

### Example inventory deduction

This assumes a `stock_quantity` column has been added to `products`.

```sql
UPDATE products
SET stock_quantity = stock_quantity - $1
WHERE product_id = $2
  AND stock_quantity >= $1
RETURNING product_id, price, stock_quantity;
```

If no row is returned, the requested quantity cannot be fulfilled.

---

## 19. Implement Error Handling

Centralized error handling keeps controllers cleaner.

### Error middleware

Add this after registering application routes:

```javascript
app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});
```

### Handle PostgreSQL constraint errors

PostgreSQL provides SQLSTATE codes.

| SQLSTATE | Meaning               |
| -------- | --------------------- |
| `23505`  | Unique violation      |
| `23503`  | Foreign-key violation |
| `23502`  | Not-null violation    |
| `23514`  | Check violation       |
| `40001`  | Serialization failure |
| `40P01`  | Deadlock detected     |

Example:

```javascript
try {
  await pool.query(
    `
        INSERT INTO customers (customer_name, email)
        VALUES ($1, $2)
        `,
    ["Rahul", "rahul@example.com"],
  );
} catch (error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Email already exists",
    });
  }

  throw error;
}
```

Do not expose raw database errors, SQL statements, credentials or internal stack traces to clients.

---

## 20. Handle Database Connection Shutdown

A production application should close its pool cleanly during shutdown.

Example:

```javascript
const pool = require("./config/db");

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log("PostgreSQL pool closed");
      process.exit(0);
    } catch (error) {
      console.error("Error closing PostgreSQL pool:", error);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

In production, also consider a shutdown timeout so a stuck request cannot keep the process alive indefinitely.

---

## 21. Use Database Migrations in Node.js Projects

Avoid manually creating or altering production tables during deployment.

Use a migration tool such as:

- `node-pg-migrate`
- `Knex`
- `Sequelize CLI`
- `TypeORM`
- `Prisma Migrate`

Example using `node-pg-migrate`:

Install:

```bash
npm install --save-dev node-pg-migrate
```

Create migration:

```bash
npx node-pg-migrate create add-phone-to-customers
```

Example migration:

```javascript
exports.up = (pgm) => {
  pgm.addColumn("customers", {
    phone: {
      type: "varchar(15)",
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("customers", "phone");
};
```

Run:

```bash
npx node-pg-migrate up
```

Roll back the latest migration:

```bash
npx node-pg-migrate down
```

### Production rules

- Run migrations in a controlled deployment step.
- Avoid multiple application instances running migrations simultaneously.
- Test migrations in staging.
- Do not edit migrations that have already been applied.
- Use backward-compatible changes where possible.
- Keep backups independent of migration rollback.

---

## 22. SQL Query Performance in Node.js Applications

A query can be correct but still perform poorly under real application traffic.

### Example

```sql
SELECT *
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC;
```

A potential index:

```sql
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at DESC);
```

The index can help filter by customer and retrieve orders in the requested order.

But actual usage depends on the query plan and data distribution.

### Inspect the plan

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    order_id,
    total_amount,
    created_at
FROM orders
WHERE customer_id = 101
ORDER BY created_at DESC;
```

### Backend performance considerations

- Avoid N+1 queries.
- Use connection pooling.
- Use pagination.
- Avoid unnecessary SELECT queries after INSERT or UPDATE.
- Select only required columns.
- Keep transactions short.
- Avoid fetching huge result sets into Node.js memory.
- Monitor query execution time.
- Use appropriate indexes.
- Avoid executing CPU-intensive work while holding database transactions open.

---

## 23. Prevent Duplicate API Operations

Network retries can cause the same request to reach the backend multiple times.

This matters for:

- Order creation.
- Payment processing.
- Payouts.
- Webhooks.
- Background jobs.

A common solution is an idempotency key.

Illustrative table:

```sql
CREATE TABLE idempotency_records (
    idempotency_key VARCHAR(150) PRIMARY KEY,
    response_status INT,
    response_body JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Example insert:

```sql
INSERT INTO idempotency_records (idempotency_key)
VALUES ($1)
ON CONFLICT DO NOTHING
RETURNING idempotency_key;
```

If no row is returned, another request has already claimed that key.

### Important

A complete implementation must coordinate the idempotency record and business operation transactionally. It must also define what happens when a request is still processing, fails, or is retried with a different payload.

A unique key alone does not automatically implement a complete idempotency workflow.

---

## 24. Use Prepared Statements When Appropriate

PostgreSQL supports prepared statements.

Example:

```sql
PREPARE customer_lookup(INT) AS
SELECT
    customer_id,
    customer_name,
    email
FROM customers
WHERE customer_id = $1;
```

Execute:

```sql
EXECUTE customer_lookup(101);
```

Remove:

```sql
DEALLOCATE customer_lookup;
```

In node-postgres, named queries can be used:

```javascript
const result = await pool.query({
  name: "customer-by-id",
  text: `
        SELECT customer_id, customer_name, email
        FROM customers
        WHERE customer_id = $1
    `,
  values: [101],
});
```

The driver can use a named prepared statement on a particular connection.

### Important

Prepared statements are not automatically faster for every query. PostgreSQL may use custom or generic plans depending on execution behavior. Measure performance before introducing named statements everywhere.

---

## 25. Use the Correct Database Role

The application should connect using a dedicated role with only the required permissions.

Example:

```sql
CREATE ROLE techbazaar_app
WITH LOGIN PASSWORD 'UseASecureSecret';
```

Grant access:

```sql
GRANT CONNECT ON DATABASE techbazaar
TO techbazaar_app;

GRANT USAGE ON SCHEMA public
TO techbazaar_app;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO techbazaar_app;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO techbazaar_app;
```

For future objects, configure default privileges for the role that creates those objects.

### Separate roles where practical

| Role                   | Responsibility                 |
| ---------------------- | ------------------------------ |
| `techbazaar_app`       | Runtime application queries    |
| `techbazaar_migrator`  | Schema migrations              |
| `techbazaar_readonly`  | Reporting and read-only access |
| Database administrator | Administrative operations      |

Do not give the runtime application superuser privileges.

---

## 26. Complete Mini Project — Customer API

### Step 1: Create database

```sql
CREATE DATABASE techbazaar;
```

### Step 2: Create table

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE
);
```

### Step 3: Insert sample data

```sql
INSERT INTO customers (
    customer_name,
    email
)
VALUES
    ('Rahul', 'rahul@example.com'),
    ('Amit', 'amit@example.com'),
    ('Priya', 'priya@example.com');
```

### Step 4: Create Express application

```bash
mkdir techbazaar-api
cd techbazaar-api

npm init -y

npm install express pg dotenv
npm install --save-dev nodemon
```

### Step 5: Configure package.json

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }
}
```

### Step 6: Create connection file

`src/config/db.js`

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
});

module.exports = pool;
```

### Step 7: Create routes

`src/routes/customer.routes.js`

```javascript
const express = require("express");
const router = express.Router();

const controller = require("../controllers/customer.controller");

router.get("/", controller.getCustomers);
router.get("/:id", controller.getCustomerById);
router.post("/", controller.createCustomer);

module.exports = router;
```

### Step 8: Create controller

`src/controllers/customer.controller.js`

```javascript
const pool = require("../config/db");

exports.getCustomers = async (req, res, next) => {
  try {
    const result = await pool.query(`
            SELECT customer_id, customer_name, email
            FROM customers
            ORDER BY customer_id
        `);

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const result = await pool.query(
      `
            SELECT customer_id, customer_name, email
            FROM customers
            WHERE customer_id = $1
            `,
      [customerId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { customer_name, email } = req.body;

    if (
      typeof customer_name !== "string" ||
      !customer_name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid customer name and email are required",
      });
    }

    const result = await pool.query(
      `
            INSERT INTO customers (customer_name, email)
            VALUES ($1, $2)
            RETURNING customer_id, customer_name, email
            `,
      [customer_name.trim(), email.trim()],
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    next(error);
  }
};
```

### Step 9: Create app.js

```javascript
require("dotenv").config();

const express = require("express");
const customerRoutes = require("./routes/customer.routes");

const app = express();

app.use(express.json());

app.use("/api/customers", customerRoutes);

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 10: Run application

```bash
npm run dev
```

Test:

```http
GET http://localhost:3000/api/customers
```

```http
GET http://localhost:3000/api/customers/1
```

```http
POST http://localhost:3000/api/customers
```

---

## 27. Common Mistakes in Node.js + PostgreSQL

| Mistake                                                 | Correct approach                              |
| ------------------------------------------------------- | --------------------------------------------- |
| Concatenating user input into SQL                       | Use parameterized queries                     |
| Creating a new connection for every request             | Use a connection pool                         |
| Using `pool.query()` for every transaction step         | Acquire one client and use it throughout      |
| Forgetting to release a client                          | Use `finally`                                 |
| Returning unlimited records                             | Use pagination                                |
| Trusting client-submitted prices                        | Calculate using trusted database values       |
| Exposing raw SQL errors                                 | Return safe error responses                   |
| Running queries inside loops                            | Batch queries or use JOINs                    |
| Keeping transactions open during API calls              | Keep database transactions short              |
| Using superuser credentials in the application          | Use a restricted runtime role                 |
| Manually modifying production schemas                   | Use version-controlled migrations             |
| Retrying every failed query                             | Retry only appropriate transient failures     |
| Assuming one unique key solves all idempotency concerns | Coordinate the full operation transactionally |

---

## 28. Practice Exercises

Build the following APIs using Node.js, Express and PostgreSQL.

### Customer APIs

1. Create a customer.
2. Fetch all customers.
3. Fetch a customer by ID.
4. Update a customer's email.
5. Delete a customer.
6. Search customers by name.
7. Implement pagination.
8. Handle duplicate emails.

### Order APIs

9. Create an order.
10. Add multiple items to an order.
11. Fetch an order with its items.
12. Fetch all orders for a customer.
13. Filter orders by status.
14. Calculate total spending for a customer.
15. Retrieve the latest order for each customer.
16. Implement safe order pagination.

### Payment APIs

17. Record a payment.
18. Fetch all payments for an order.
19. Find orders without successful payments.
20. Implement an idempotent webhook event handler.
21. Calculate payment totals.
22. Handle duplicate payment events.

### Production engineering

23. Configure connection pooling.
24. Implement graceful database shutdown.
25. Add centralized error handling.
26. Create a database migration.
27. Add a database index and inspect its query plan.
28. Implement a transaction with multiple queries.
29. Handle serialization failures using a controlled retry strategy.
30. Create separate runtime and migration roles.

---

## 29. Interview Questions

**Q1. Which PostgreSQL package is commonly used in Node.js?**

`pg`, also known as node-postgres.

**Q2. What is the difference between Pool and Client in node-postgres?**

Pool manages reusable connections. Client represents an individual database connection.

**Q3. Why use connection pooling?**

It reduces connection creation overhead and controls the number of active database connections.

**Q4. How do you prevent SQL injection in Node.js?**

Use parameterized queries with `$1`, `$2` placeholders.

**Q5. Why should all transaction queries use the same client?**

A PostgreSQL transaction belongs to a single database session.

**Q6. What is RETURNING in PostgreSQL?**

It returns rows affected by INSERT, UPDATE or DELETE without requiring a separate SELECT.

**Q7. What happens if you forget to release a pooled client?**

The connection remains checked out and can eventually exhaust the pool.

**Q8. How do you implement pagination?**

Use LIMIT and OFFSET or keyset pagination.

**Q9. How do you handle database errors in Express?**

Use try/catch and centralized error middleware, mapping known SQLSTATE codes to appropriate HTTP responses.

**Q10. How do you prevent duplicate order creation during retries?**

Use an idempotency key, enforce uniqueness and coordinate the business operation transactionally.

**Q11. Why should the application not connect as PostgreSQL superuser?**

It gives the application unnecessary administrative privileges and increases security risk.

**Q12. How do you optimize database operations in a Node.js API?**

Use efficient SQL, indexes based on actual workload, pagination, batching, connection pooling and execution-plan analysis.

**Q13. Can `pool.query()` be used for a multi-statement transaction?**

No, not as separate independent calls. Acquire a client and use that same client for BEGIN, all transaction statements, COMMIT or ROLLBACK.

**Q14. How do you handle a database connection failure?**

Use bounded connection timeouts, appropriate error handling, monitoring and controlled retry or recovery behavior. Do not blindly retry non-idempotent operations.

**Q15. What is the purpose of database migrations?**

To manage schema changes in a version-controlled and repeatable way across development, staging and production.

---

## Key Takeaways

- Use `pg` to connect Node.js applications to PostgreSQL.
- Use a connection pool for normal application workloads.
- Store credentials in secure configuration.
- Use parameterized SQL for all user-supplied values.
- Separate routing, controllers and services when it improves maintainability.
- Use `RETURNING` to retrieve modified rows.
- Use transactions for related database operations.
- Use one checked-out client for the entire transaction.
- Release pooled clients reliably.
- Validate inputs and handle missing records.
- Implement pagination and avoid N+1 queries.
- Keep database transactions short.
- Use migrations for schema changes.
- Use least-privilege database roles.
- Implement idempotency for retryable critical operations.
- Monitor database performance and connection usage.
