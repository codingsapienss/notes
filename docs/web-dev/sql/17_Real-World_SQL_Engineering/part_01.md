---
sidebar_label: "SQL Migrations"
sidebar_position: 1
---

# SQL Migrations

## 1. What Are Database Migrations?

A database migration is a controlled, versioned change to a database schema or structure.

As an application evolves, its database requirements change.

Examples:

- Adding a new column.
- Creating a new table.
- Adding an index.
- Changing a column's data type.
- Adding a foreign key.
- Renaming a column.
- Removing an unused column.
- Modifying constraints.

Instead of manually executing SQL changes on every environment, migrations provide a repeatable and trackable process.

### Example

Initially, the `customers` table contains:

```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100),
    email VARCHAR(150)
);
```

Later, the application requires a phone number.

A migration adds the column:

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
```

This SQL change is a database migration.

---

## 2. Why Are Migrations Necessary?

Imagine you have three environments:

| Environment | Database              |
| ----------- | --------------------- |
| Development | Local PostgreSQL      |
| Staging     | Staging PostgreSQL    |
| Production  | Production PostgreSQL |

You add a new column locally:

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
```

Your application now expects `customers.phone` to exist.

But production still has the old schema.

The application may fail when deployed.

Migrations solve this by providing a consistent sequence of database changes that can be applied across environments.

### Without migrations

- Manual SQL execution.
- Different database structures across environments.
- Forgotten schema changes.
- Difficult deployments.
- Poor rollback visibility.
- Unclear database history.

### With migrations

- Version-controlled schema changes.
- Repeatable deployments.
- Consistent environments.
- Migration history.
- Easier collaboration.
- Controlled production changes.

---

## 3. Migration Files and Versioning

A migration is normally stored as a separate file.

Example project structure:

```text
project/
│
├── migrations/
│   ├── 001_create_departments.sql
│   ├── 002_create_employees.sql
│   ├── 003_create_customers.sql
│   ├── 004_add_phone_to_customers.sql
│   └── 005_create_orders_index.sql
│
├── src/
├── package.json
└── server.js
```

Each migration represents a specific database change.

### Example: 001_create_departments.sql

```sql
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL
);
```

### Example: 002_create_employees.sql

```sql
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(department_id),
    salary NUMERIC(10, 2)
);
```

### Example: 004_add_phone_to_customers.sql

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
```

### Why numbered migrations?

Migration numbers establish an execution order.

A database must generally apply migrations in the intended sequence, particularly when later migrations depend on earlier objects.

---

## 4. Migration Tracking Table

A migration system needs to know which migrations have already been executed.

A common approach is maintaining a migration tracking table.

Example:

```sql
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

After successfully applying a migration, its version is recorded.

Example:

```sql
INSERT INTO schema_migrations (version)
VALUES ('001_create_departments');
```

### Example tracking data

| version                | executed_at            |
| ---------------------- | ---------------------- |
| 001_create_departments | 2026-11-16 10:00:00+00 |
| 002_create_employees   | 2026-11-16 10:02:00+00 |
| 003_create_customers   | 2026-11-16 10:05:00+00 |

The migration system checks this table before executing a migration.

### Important

A migration must not be recorded as successfully applied if its database changes failed.

Migration tools generally manage execution and tracking together, often using transactions when the migration operations support transactional execution.

---

## 5. Running Migrations in Order

Suppose the migration directory contains:

```text
001_create_departments.sql
002_create_employees.sql
003_create_customers.sql
004_add_phone_to_customers.sql
```

The migration runner should:

1. Read available migration files.
2. Sort them in version order.
3. Check the migration tracking table.
4. Identify migrations not yet executed.
5. Execute pending migrations.
6. Record successful executions.
7. Stop or report an error if a migration fails.

### Example

Initially:

```text
Applied migrations: None
```

After execution:

```text
001_create_departments.sql
002_create_employees.sql
003_create_customers.sql
004_add_phone_to_customers.sql
```

The tracking table now contains all four migration versions.

If you run the migration command again, those four migrations should not execute again.

---

## 6. Writing Safe Migrations

A migration can modify production data and affect application availability.

Poorly designed migrations can cause:

- Data loss.
- Application downtime.
- Long-running locks.
- Failed deployments.
- Inconsistent application behavior.

### Example 1: Adding a nullable column

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
```

This is generally a straightforward schema change.

Existing rows receive NULL for the new column.

### Example 2: Adding a NOT NULL column

This migration may fail if existing rows cannot satisfy the constraint:

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15) NOT NULL;
```

A safer approach for a populated table is often a staged migration.

**Step 1: Add the column as nullable.**

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
```

**Step 2: Backfill existing rows.**

```sql
UPDATE customers
SET phone = 'UNKNOWN'
WHERE phone IS NULL;
```

Use a valid business value rather than a placeholder if the column represents real customer information.

**Step 3: Add the NOT NULL constraint.**

```sql
ALTER TABLE customers
ALTER COLUMN phone SET NOT NULL;
```

For a large production table, backfill in controlled batches and assess locking and write impact before applying the constraint.

---

## 7. Transactional Migrations

PostgreSQL supports transactional execution for many DDL statements.

This means multiple changes can be grouped into one transaction.

Example:

```sql
BEGIN;

ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);

CREATE INDEX idx_customers_phone
ON customers(phone);

COMMIT;
```

If an operation fails before COMMIT, the transaction can be rolled back:

```sql
ROLLBACK;
```

### Why use transactions?

Suppose a migration performs:

1. Add a column.
2. Create an index.
3. Add a constraint.

If the constraint creation fails, you may want all earlier changes in that migration rolled back.

A transaction provides that atomicity.

### Important exceptions

Not every PostgreSQL operation can run inside a transaction block.

For example:

```sql
CREATE INDEX CONCURRENTLY idx_customers_email
ON customers(email);
```

`CREATE INDEX CONCURRENTLY` cannot run inside an ordinary transaction block.

Some database-level operations, such as `CREATE DATABASE`, also cannot run inside a transaction block.

Migration tools must account for these restrictions.

---

## 8. Up Migrations and Down Migrations

Some migration systems support two directions.

- **Up migration:** Applies a database change.
- **Down migration:** Attempts to reverse that change.

### Example: Up migration

```sql
ALTER TABLE customers
ADD COLUMN phone VARCHAR(15);
```

### Example: Down migration

```sql
ALTER TABLE customers
DROP COLUMN phone;
```

### Important

A down migration is not always a true restoration of the original state.

For example:

```sql
ALTER TABLE customers
DROP COLUMN phone;
```

This removes the column and its stored values.

Running the reverse operation later cannot recover those values.

Similarly, deleting rows, overwriting data or changing data types can be irreversible without a backup.

### Best practice

- Write reversible migrations when practical.
- Clearly identify destructive changes.
- Back up important data before destructive operations.
- Test rollback scripts.
- Never assume every migration can be safely reversed.

---

## 9. Schema Migration vs Data Migration

These are related but different concepts.

### Schema migration

Changes the structure of the database.

Example:

```sql
ALTER TABLE products
ADD COLUMN description TEXT;
```

### Data migration

Changes existing records to match new application requirements.

Example:

```sql
UPDATE products
SET description = 'Description unavailable'
WHERE description IS NULL;
```

### Comparison

| Schema migration                  | Data migration                  |
| --------------------------------- | ------------------------------- |
| Changes database structure        | Changes stored data             |
| CREATE, ALTER, DROP               | INSERT, UPDATE, DELETE          |
| Adds columns or constraints       | Transforms existing values      |
| Changes indexes and relationships | Backfills or normalizes records |

A single migration can contain both schema and data changes.

For production systems, separating them can make deployment safer and easier to monitor.

---

## 10. Zero-Downtime Migration Strategy

A common production mistake is changing the database structure in a way that immediately breaks the currently deployed application.

Consider renaming:

```text
customers.phone
```

to:

```text
customers.mobile_number
```

If the database column is renamed immediately, an older application version that still queries `phone` may fail.

A safer approach is the **Expand-and-Contract** pattern.

### Phase 1: Expand

Add the new column without removing the old one.

```sql
ALTER TABLE customers
ADD COLUMN mobile_number VARCHAR(15);
```

### Phase 2: Support both columns

Deploy application code that can read the new column and, during transition, supports both representations.

New writes should keep both columns synchronized if both application versions may still use them.

### Phase 3: Backfill

```sql
UPDATE customers
SET mobile_number = phone
WHERE mobile_number IS NULL;
```

For large tables, use batches rather than one massive update.

### Phase 4: Switch application reads

Deploy application code that reads from `mobile_number`.

Verify that no running application version depends on `phone`.

### Phase 5: Contract

Remove the old column in a later deployment:

```sql
ALTER TABLE customers
DROP COLUMN phone;
```

### Expand-and-Contract flow

```text
Old database structure
        |
        v
Add new database column
        |
        v
Deploy backward-compatible application
        |
        v
Backfill existing records
        |
        v
Switch application to new column
        |
        v
Verify old column is no longer used
        |
        v
Remove old column
```

### Why this matters

In production, application deployments and database changes are not always instantaneous.

Multiple application instances may run different versions simultaneously during rolling deployments.

Database migrations should account for that.

---

## 11. Migration Locking and Concurrency

Two deployment processes should not accidentally execute the same migration simultaneously.

A migration system should provide protection against concurrent migration execution.

Common approaches include:

- Advisory locks.
- Migration-runner locks.
- Deployment orchestration that allows only one migration process.

PostgreSQL advisory locks can be used for application-defined coordination.

Example:

```sql
SELECT pg_advisory_lock(123456);
```

Release:

```sql
SELECT pg_advisory_unlock(123456);
```

Advisory locks are cooperative: processes must follow the same locking convention.

They do not automatically prevent unrelated SQL commands from changing the database.

### Migration history consistency

A migration runner should also ensure that:

- A failed migration is not marked successful.
- Applied migrations are not silently modified.
- The same migration version is not executed twice.
- Conflicting migration histories are detected.

---

## 12. PostgreSQL Migration Best Practices

### 1. Never modify an already-applied migration

Once a migration has been deployed, treat it as immutable.

If you need another change, create a new migration.

Example:

```text
001_create_customers.sql
002_add_phone_to_customers.sql
003_add_email_index.sql
```

Do not edit migration 002 after it has already run in production.

### 2. Use descriptive migration names

Prefer:

```text
004_add_phone_to_customers.sql
```

Avoid:

```text
004_update.sql
```

### 3. Test migrations before production

Run them against a development or staging database with representative data.

### 4. Avoid destructive changes during the first deployment

Prefer staged changes when older application versions may still be running.

### 5. Monitor locks and execution time

Large updates and index operations can affect production traffic.

### 6. Use backups

Backups protect against unexpected data loss. A migration rollback is not a substitute for a backup.

### 7. Keep application and migration versions coordinated

Application code should not assume a database change exists before that migration has been applied.

### 8. Use transactions where appropriate

Group related operations when PostgreSQL supports transactional execution.

### 9. Review generated SQL

Do not blindly execute generated migrations. Review the SQL for destructive operations, locks and data transformations.

### 10. Maintain migration history

Keep migration files in version control and migration execution history in the database.

---

## 13. Using Migrations with Node.js and PostgreSQL

In a Node.js backend, migration tools can manage database changes.

Common options include:

- `node-pg-migrate`
- `Knex`
- `Sequelize CLI`
- `TypeORM`
- `Prisma Migrate`

These tools provide different migration workflows and conventions.

For a backend using PostgreSQL with the `pg` package, `node-pg-migrate` is one option.

### Install

```bash
npm install pg
npm install --save-dev node-pg-migrate
```

### Configure database connection

For example, define environment variables:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/techbazaar
```

Do not commit real credentials to Git.

### Create a migration

```bash
npx node-pg-migrate create add-phone-to-customers
```

The tool generates a migration file.

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

### Run migrations

```bash
DATABASE_URL="postgres://postgres:password@localhost:5432/techbazaar" \
npx node-pg-migrate up
```

### Roll back the latest migration

```bash
DATABASE_URL="postgres://postgres:password@localhost:5432/techbazaar" \
npx node-pg-migrate down
```

Use environment variables or a secure configuration mechanism instead of embedding production credentials in shell history or source code.

### Important

The exact migration API and configuration depend on the installed tool version. Follow the version-specific documentation when configuring production deployments.

---

## 14. Migration Workflow in a Real Backend Project

A typical workflow:

```text
Developer changes database requirements
             |
             v
Create migration file
             |
             v
Review migration SQL
             |
             v
Run migration locally
             |
             v
Test application with new schema
             |
             v
Commit migration + application changes
             |
             v
Deploy to staging
             |
             v
Run staging migrations and tests
             |
             v
Deploy to production
             |
             v
Run production migration
             |
             v
Verify application and database
```

### Important deployment ordering

For backward-compatible changes:

1. Apply the additive database migration.
2. Deploy application code that uses the new structure.
3. Verify application behavior.
4. Remove old database structures in a later deployment.

For changes that cannot be backward-compatible, plan a coordinated maintenance window or a more sophisticated transition.

---

## 15. Practical Example — TechBazaar

Suppose TechBazaar introduces a product inventory feature.

Initially, the `products` table contains:

```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(150),
    category_id INT,
    price NUMERIC(10, 2)
);
```

The application now requires inventory tracking.

### Migration 001: Add stock quantity

```sql
ALTER TABLE products
ADD COLUMN stock_quantity INT;
```

### Migration 002: Backfill existing products

```sql
UPDATE products
SET stock_quantity = 0
WHERE stock_quantity IS NULL;
```

### Migration 003: Add constraint

```sql
ALTER TABLE products
ALTER COLUMN stock_quantity SET NOT NULL;

ALTER TABLE products
ADD CONSTRAINT products_stock_quantity_check
CHECK (stock_quantity >= 0);
```

### Migration 004: Add index if the workload needs it

```sql
CREATE INDEX idx_products_stock_quantity
ON products(stock_quantity);
```

Do not add indexes automatically for every new column. Add them based on actual query patterns and performance requirements.

### Verify

```sql
SELECT
    product_id,
    product_name,
    stock_quantity
FROM products
ORDER BY product_id;
```

Check the constraint:

```sql
SELECT
    conname,
    contype
FROM pg_constraint
WHERE conrelid = 'products'::regclass;
```

---

## 16. Common Migration Mistakes

| Mistake                                        | Why it is problematic                                   |
| ---------------------------------------------- | ------------------------------------------------------- |
| Editing already-applied migrations             | Environments can develop different histories            |
| Running SQL manually in production             | Migration history may become inconsistent               |
| Adding NOT NULL without handling existing rows | Existing data may violate the constraint                |
| Dropping columns immediately                   | Older application versions may still depend on them     |
| Running huge updates without planning          | Can create long transactions, locks and substantial WAL |
| Assuming rollback restores deleted data        | Down migrations may be destructive or incomplete        |
| Running migrations concurrently                | Can cause conflicts or duplicate execution              |
| Ignoring migration failures                    | Application and database versions can diverge           |
| Never testing on staging                       | Production may expose data-dependent failures           |
| Adding unnecessary indexes                     | Increases storage and write overhead                    |

---

## 17. Practice Exercises

Use the TechBazaar schema.

1. Create a migration to add `phone` to `customers`.
2. Create a migration to add `description` to `products`.
3. Create a migration to add a non-negative stock quantity to `products`.
4. Write a migration that creates an index on `orders.created_at`.
5. Write a down migration for a newly created index.
6. Create a migration tracking table.
7. Explain how a migration runner identifies pending migrations.
8. Explain why applied migration files should remain immutable.
9. Design a safe migration to rename `phone` to `mobile_number`.
10. Explain how you would backfill 10 million rows without one massive UPDATE.
11. Explain how to prevent two deployment processes from running migrations simultaneously.
12. Identify which PostgreSQL operations cannot run inside an ordinary transaction block.
13. Design a deployment sequence that supports old and new application versions simultaneously.
14. Explain why a down migration is not always a reliable recovery strategy.

---

## 18. Interview Questions

**Q1. What is a database migration?**

A version-controlled database change used to evolve database structure or data consistently across environments.

**Q2. Why are migrations important?**

They provide a controlled, repeatable and traceable way to apply database changes.

**Q3. What is a migration tracking table?**

A table that records which migration versions have successfully executed.

**Q4. What is an up migration?**

A migration that applies a database change.

**Q5. What is a down migration?**

A migration intended to reverse a previously applied change.

**Q6. Are all migrations reversible?**

No. Destructive data changes may not be recoverable through a down migration.

**Q7. What is the difference between schema and data migrations?**

Schema migrations modify database structure; data migrations transform existing records.

**Q8. Why should applied migrations not be modified?**

Different environments may already have executed the original version. Modifying it creates inconsistent migration histories.

**Q9. What is Expand-and-Contract?**

A migration strategy that introduces new structures, transitions application usage, and removes old structures only after they are no longer needed.

**Q10. Why are database migrations risky during rolling deployments?**

Different application versions may run simultaneously and depend on different database structures.

**Q11. How do you handle a NOT NULL column addition on a large populated table?**

Typically add it as nullable, backfill in controlled batches, then validate and enforce NOT NULL.

**Q12. How do you prevent concurrent migration execution?**

Use migration-runner locking, advisory locks or deployment orchestration that permits only one migration process.

**Q13. Can every PostgreSQL DDL operation run inside a transaction?**

No. For example, `CREATE INDEX CONCURRENTLY` and `CREATE DATABASE` cannot run inside an ordinary transaction block.

**Q14. Is a migration rollback equivalent to restoring a backup?**

No. A rollback executes reverse database operations where possible. A backup restores previously saved data and database state.

**Q15. How would you deploy a database change without downtime?**

Use backward-compatible schema changes, deploy compatible application versions, backfill data, switch application behavior, verify usage and remove old structures later.

---

## Key Takeaways

- Migrations are version-controlled database changes.
- Migration files should be ordered and immutable after deployment.
- A migration tracking table records successfully applied versions.
- Schema migrations change database structure; data migrations transform records.
- PostgreSQL supports transactions for many DDL operations, but not all.
- Down migrations are not guaranteed to restore lost data.
- Expand-and-Contract helps support rolling deployments.
- Large data changes require careful batching and lock management.
- Migration execution should be controlled and coordinated.
- Always test migrations in staging before production.
- Keep backups independent of migration rollback mechanisms.
