---
sidebar_label: "PostgreSQL Schemas and Access Control"
sidebar_position: 1
---

# PostgreSQL Schemas and Access Control

## 1. Introduction

PostgreSQL schemas are namespaces used to organize database objects.

A single database can contain multiple schemas, and each schema can contain objects such as:

- Tables
- Views
- Materialized views
- Functions
- Procedures
- Sequences
- Types

Schemas help organize database structures, avoid naming conflicts and control access.

### Example: TechBazaar database

Suppose TechBazaar has the following database structure:

```text
techbazaar
│
├── public
│   ├── employees
│   ├── departments
│   └── customers
│
├── sales
│   ├── orders
│   ├── order_items
│   └── payments
│
├── inventory
│   ├── products
│   └── categories
│
└── analytics
    ├── customer_summary
    └── revenue_report
```

Instead of keeping every table inside `public`, you can organize them into logical schemas.

**Important:** A schema is not a separate database. Multiple schemas exist inside the same database and can participate in the same SQL queries and transactions.

---

## 2. Creating Schemas

Use `CREATE SCHEMA`.

### Syntax

```sql
CREATE SCHEMA schema_name;
```

### Example

```sql
CREATE SCHEMA sales;
CREATE SCHEMA inventory;
CREATE SCHEMA analytics;
```

### Create a schema with an owner

```sql
CREATE SCHEMA sales
AUTHORIZATION techbazaar_owner;
```

The specified role becomes the schema owner.

### Create a schema if it does not exist

PostgreSQL does not support `CREATE SCHEMA IF NOT EXISTS` with every possible schema-creation clause in the same way as a simple creation statement. For a basic schema:

```sql
CREATE SCHEMA IF NOT EXISTS sales;
```

This avoids an error if the schema already exists.

---

## 3. Viewing Existing Schemas

### Using psql

```sql
\dn
```

This lists schemas in the current database.

### Using SQL

```sql
SELECT
    schema_name
FROM information_schema.schemata
ORDER BY schema_name;
```

### View schema owners

```sql
SELECT
    n.nspname AS schema_name,
    r.rolname AS schema_owner
FROM pg_namespace n
JOIN pg_roles r
    ON n.nspowner = r.oid
ORDER BY n.nspname;
```

`pg_namespace` is PostgreSQL's system catalog containing schema information.

---

## 4. Creating Tables Inside Schemas

You can create tables inside a specific schema using schema-qualified names.

### Create a table inside sales

```sql
CREATE TABLE sales.orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Create a table inside inventory

```sql
CREATE TABLE inventory.products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL
);
```

### Create a table inside analytics

```sql
CREATE TABLE analytics.revenue_summary (
    summary_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    total_revenue NUMERIC(14, 2),
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Important

The following are different objects:

```sql
public.products
```

```sql
inventory.products
```

Both can exist in the same database because they belong to different schemas.

---

## 5. Accessing Tables Using Schema Names

Use the format:

```sql
schema_name.table_name
```

Example:

```sql
SELECT *
FROM sales.orders;
```

```sql
SELECT *
FROM inventory.products;
```

```sql
SELECT *
FROM analytics.revenue_summary;
```

This is called a schema-qualified reference.

### Why use schema-qualified names?

- Avoid naming conflicts.
- Make queries easier to understand.
- Prevent ambiguity.
- Make database access more predictable.

For production applications, explicitly qualifying important table names is often a good practice.

---

## 6. Moving Tables Between Schemas

You can move an existing table from one schema to another.

### Syntax

```sql
ALTER TABLE old_schema.table_name
SET SCHEMA new_schema;
```

### Example

Suppose `products` currently exists inside `public`.

```sql
ALTER TABLE public.products
SET SCHEMA inventory;
```

Now access it using:

```sql
SELECT *
FROM inventory.products;
```

The table is moved, not copied.

### Move a view

```sql
ALTER VIEW public.active_employees
SET SCHEMA analytics;
```

### Move a sequence

```sql
ALTER SEQUENCE public.employee_id_seq
SET SCHEMA inventory;
```

The sequence must exist and be eligible for the operation.

---

## 7. Renaming and Dropping Schemas

### Rename a schema

```sql
ALTER SCHEMA inventory
RENAME TO product_inventory;
```

### Change schema ownership

```sql
ALTER SCHEMA sales
OWNER TO techbazaar_owner;
```

### Drop an empty schema

```sql
DROP SCHEMA analytics;
```

### Drop a schema if it exists

```sql
DROP SCHEMA IF EXISTS analytics;
```

### Drop a schema and its contained objects

```sql
DROP SCHEMA analytics CASCADE;
```

**Warning:** `CASCADE` can remove dependent objects outside the schema as well. Review dependencies before executing it.

---

## 8. Understanding the Search Path

PostgreSQL provides a setting called `search_path`.

It determines which schemas PostgreSQL searches when an object is referenced without a schema name.

### Check the current search path

```sql
SHOW search_path;
```

A common default is:

```text
"$user", public
```

This means PostgreSQL searches:

1. A schema matching the current role name, if it exists and is usable.
2. The `public` schema.

### Example

Suppose:

```text
sales.orders
public.orders
```

Both tables exist.

If the search path is:

```sql
SET search_path TO sales, public;
```

Then:

```sql
SELECT *
FROM orders;
```

resolves to:

```sql
SELECT *
FROM sales.orders;
```

Because `sales` appears first.

### Change the search path for the current session

```sql
SET search_path TO inventory, public;
```

Now an unqualified reference to `products` searches `inventory` first.

### Reset the search path

```sql
RESET search_path;
```

### Set the search path for a role

```sql
ALTER ROLE techbazaar_app
SET search_path TO sales, public;
```

This setting applies to new sessions for that role.

### Set the search path for a database

```sql
ALTER DATABASE techbazaar
SET search_path TO sales, public;
```

This applies to new sessions connected to that database, subject to role-specific settings.

### Important security consideration

Schemas in `search_path` can affect which objects unqualified names resolve to.

If a role can create objects in a schema searched by a more privileged application, it may be able to influence name resolution.

For security-sensitive SQL:

- Restrict CREATE privileges on searched schemas.
- Use schema-qualified object names.
- Avoid trusting unqualified function or table names from untrusted schemas.
- Review the search path used by security-definer functions.

---

## 9. Schema-Level Access Control

Schemas have their own privileges.

Two important privileges are:

| Privilege | Purpose                                                              |
| --------- | -------------------------------------------------------------------- |
| USAGE     | Allows access to objects in the schema, subject to object privileges |
| CREATE    | Allows creating objects in the schema                                |

### Grant USAGE

```sql
GRANT USAGE
ON SCHEMA sales
TO techbazaar_app;
```

The role can now resolve and access objects in `sales`, provided it also has the required table or object privileges.

### Grant CREATE

```sql
GRANT CREATE
ON SCHEMA sales
TO developers;
```

Developers can create objects in the schema.

### Grant both

```sql
GRANT USAGE, CREATE
ON SCHEMA sales
TO developers;
```

### Revoke CREATE

```sql
REVOKE CREATE
ON SCHEMA sales
FROM developers;
```

### Revoke USAGE

```sql
REVOKE USAGE
ON SCHEMA sales
FROM developers;
```

Revoking USAGE can prevent access to objects in the schema even if the role still has privileges on individual tables.

---

## 10. Schema Access vs Table Access

This distinction is essential.

Suppose:

```text
sales.orders
```

A role generally needs both:

1. USAGE on the `sales` schema.
2. SELECT on the `orders` table.

### Grant schema permission

```sql
GRANT USAGE
ON SCHEMA sales
TO reporting_user;
```

### Grant table permission

```sql
GRANT SELECT
ON TABLE sales.orders
TO reporting_user;
```

Now:

```sql
SELECT *
FROM sales.orders;
```

can succeed, subject to other applicable security rules.

### Permission matrix

| Schema USAGE | Table SELECT | Result                                      |
| ------------ | ------------ | ------------------------------------------- |
| Yes          | Yes          | Can read the table                          |
| Yes          | No           | Cannot read the table                       |
| No           | Yes          | Cannot access the table through that schema |
| No           | No           | Cannot read the table                       |

**Remember:** Schema USAGE does not automatically grant access to every table inside the schema.

---

## 11. Creating a Secure Schema Structure

Suppose TechBazaar wants separate schemas for:

- Application operations.
- Product inventory.
- Analytics.

Create schemas:

```sql
CREATE SCHEMA sales
AUTHORIZATION techbazaar_owner;

CREATE SCHEMA inventory
AUTHORIZATION techbazaar_owner;

CREATE SCHEMA analytics
AUTHORIZATION techbazaar_owner;
```

Create roles:

```sql
CREATE ROLE techbazaar_app
WITH LOGIN PASSWORD 'AppPassword123';

CREATE ROLE reporting_user
WITH LOGIN PASSWORD 'ReportingPassword123';

CREATE ROLE inventory_manager
WITH LOGIN PASSWORD 'InventoryPassword123';
```

Grant schema access:

```sql
GRANT USAGE
ON SCHEMA sales
TO techbazaar_app;
```

```sql
GRANT USAGE
ON SCHEMA inventory
TO techbazaar_app, inventory_manager;
```

```sql
GRANT USAGE
ON SCHEMA analytics
TO reporting_user;
```

Grant table permissions:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA sales
TO techbazaar_app;
```

```sql
GRANT SELECT, INSERT, UPDATE
ON ALL TABLES IN SCHEMA inventory
TO inventory_manager;
```

```sql
GRANT SELECT
ON ALL TABLES IN SCHEMA analytics
TO reporting_user;
```

This creates a basic separation of responsibilities.

**Important:** These commands grant permissions on existing objects. Future objects need appropriate default privileges.

---

## 12. Default Privileges for Future Objects in Schemas

Suppose `techbazaar_owner` creates new tables inside `sales`.

You want `techbazaar_app` to automatically receive access.

Use:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE techbazaar_owner
IN SCHEMA sales
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES
TO techbazaar_app;
```

For future sequences:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE techbazaar_owner
IN SCHEMA sales
GRANT USAGE, SELECT
ON SEQUENCES
TO techbazaar_app;
```

For future functions:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE techbazaar_owner
IN SCHEMA sales
GRANT EXECUTE
ON FUNCTIONS
TO techbazaar_app;
```

### Important

Default privileges:

- Apply only to future objects.
- Apply to objects created by the specified role.
- Do not automatically grant permissions on existing objects.
- Are not automatically inherited from role membership.
- Can be configured globally or for a specific schema.

---

## 13. The PUBLIC Schema

Every PostgreSQL database normally contains a `public` schema.

It is commonly used for objects that do not belong to another explicitly created schema.

### Check its privileges

```sql
SELECT
    nspname,
    nspacl
FROM pg_namespace
WHERE nspname = 'public';
```

### Revoke CREATE from PUBLIC

```sql
REVOKE CREATE
ON SCHEMA public
FROM PUBLIC;
```

This prevents ordinary roles from creating objects in `public` merely because they receive CREATE through PUBLIC.

### Important

The default privileges on `public` can vary by PostgreSQL version and database configuration.

Do not assume every database has identical permissions.

---

## 14. Cross-Schema Queries

You can JOIN tables across schemas in the same database.

Example:

```sql
SELECT
    o.order_id,
    o.total_amount,
    p.product_name
FROM sales.orders o
JOIN sales.order_items oi
    ON o.order_id = oi.order_id
JOIN inventory.products p
    ON oi.product_id = p.product_id;
```

No special cross-database mechanism is required because all referenced objects are inside the same database.

However, the executing role must have the required privileges on every referenced object and schema.

### Important

PostgreSQL does not allow an ordinary SQL JOIN directly between tables in two separate databases in the same cluster.

For cross-database access, consider:

- `postgres_fdw`
- `dblink`
- Application-level queries
- Data replication or ETL

---

## 15. Schema vs Database

A database and a schema are different levels of organization.

### Database structure

```text
PostgreSQL Cluster
│
├── Database: techbazaar
│   ├── public
│   ├── sales
│   ├── inventory
│   └── analytics
│
├── Database: company_hr
│   ├── public
│   └── payroll
│
└── Database: logging
    ├── public
    └── audit
```

### Comparison

| Feature            | Database                           | Schema                                     |
| ------------------ | ---------------------------------- | ------------------------------------------ |
| Purpose            | Separate database environment      | Organize objects within a database         |
| Contains           | Schemas and database-level objects | Tables, views, functions and other objects |
| Connection         | Connect to a database              | Access through a database connection       |
| Transaction scope  | One database                       | Same database transaction                  |
| Cross-object JOINs | Within the same database           | Across schemas in the same database        |
| Creation           | `CREATE DATABASE`                  | `CREATE SCHEMA`                            |
| Removal            | `DROP DATABASE`                    | `DROP SCHEMA`                              |

### When to use separate databases

- Stronger operational separation.
- Different application environments.
- Separate database-level access boundaries.
- Independent backup and restore requirements.
- Different database configurations.

### When to use schemas

- Organizing modules inside one application.
- Separating business domains.
- Managing permissions by functional area.
- Avoiding naming conflicts.

---

## 16. Security-Definer Functions and Search Path

PostgreSQL supports `SECURITY DEFINER` functions.

These functions execute with the privileges of the role that owns the function rather than the invoking role.

This is useful when you want to expose a controlled operation without granting direct access to underlying tables.

### Example

Suppose reporting users should retrieve employee names but should not receive direct SELECT permission on the employees table.

Create a function owned by a privileged role:

```sql
CREATE FUNCTION analytics.get_employee_names()
RETURNS TABLE (
    employee_id BIGINT,
    employee_name VARCHAR
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT
        employee_id,
        employee_name
    FROM public.employees;
$$;
```

Grant execution:

```sql
GRANT EXECUTE
ON FUNCTION analytics.get_employee_names()
TO reporting_user;
```

Now:

```sql
SELECT *
FROM analytics.get_employee_names();
```

### Critical security rules

`SECURITY DEFINER` functions require careful design.

- The function runs with the owner's privileges.
- Use a controlled search path.
- Schema-qualify sensitive object references.
- Prevent untrusted roles from creating objects in schemas used for name resolution.
- Grant EXECUTE only to intended roles.
- Consider revoking default PUBLIC execution privileges.

For example:

```sql
REVOKE ALL
ON FUNCTION analytics.get_employee_names()
FROM PUBLIC;
```

Then grant only to the intended role.

**Important:** A poorly designed SECURITY DEFINER function can become a privilege-escalation vulnerability.

---

## 17. Inspecting Schema and Object Privileges

### Check schema privileges

```sql
SELECT
    has_schema_privilege(
        'reporting_user',
        'analytics',
        'USAGE'
    );
```

### Check CREATE permission

```sql
SELECT
    has_schema_privilege(
        'developers',
        'sales',
        'CREATE'
    );
```

### Check table privileges

```sql
SELECT
    has_table_privilege(
        'reporting_user',
        'sales.orders',
        'SELECT'
    );
```

### Inspect schema objects

```sql
SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema IN (
    'sales',
    'inventory',
    'analytics'
)
ORDER BY table_schema, table_name;
```

### Inspect schema ownership

```sql
SELECT
    schema_name,
    schema_owner
FROM information_schema.schemata
ORDER BY schema_name;
```

---

## 18. Common Mistakes

| Mistake                                                | Correct understanding                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| Treating a schema as a separate database               | A schema is a namespace inside a database                            |
| Assuming CONNECT grants table access                   | Table and schema privileges are separate                             |
| Assuming schema USAGE grants SELECT                    | USAGE only permits access to objects subject to their own privileges |
| Forgetting schema qualification                        | Unqualified names depend on search_path                              |
| Assuming SET search_path is permanent                  | SET affects the current session                                      |
| Assuming default privileges apply to existing tables   | They apply to future objects                                         |
| Assuming default privileges apply to every creator     | They are configured for specific object-creating roles               |
| Granting CREATE on public to everyone                  | This can introduce security risks                                    |
| Using SECURITY DEFINER without controlling search_path | Can create privilege-escalation vulnerabilities                      |
| Using DROP SCHEMA CASCADE carelessly                   | Dependent objects may also be deleted                                |

---

## 19. Practice Exercises

Use the TechBazaar database.

### Schema management

1. Create `sales`, `inventory` and `analytics` schemas.
2. Create a products table inside `inventory`.
3. Create an orders table inside `sales`.
4. Create a revenue summary table inside `analytics`.
5. List all schemas using SQL.
6. Find schema owners.
7. Move an existing table from `public` to `inventory`.
8. Rename a schema.
9. Drop an empty test schema.

### Search path

10. Check the current search path.
11. Change the search path to `sales, public`.
12. Create two tables with the same name in different schemas.
13. Query each table using schema-qualified names.
14. Explain how PostgreSQL resolves an unqualified table name.
15. Set a role-specific search path.

### Access control

16. Create an application login role.
17. Grant USAGE on `sales`.
18. Grant SELECT on `sales.orders`.
19. Attempt to query `sales.orders` without schema USAGE.
20. Grant CREATE on `inventory` to an inventory manager.
21. Revoke CREATE from the inventory manager.
22. Configure default privileges for future tables.
23. Check schema privileges using `has_schema_privilege()`.
24. Create a reporting user with access only to analytics objects.

### Advanced security

25. Create a SECURITY DEFINER function.
26. Restrict its EXECUTE privilege.
27. Configure a safe search path.
28. Explain why untrusted schema creation can be dangerous.
29. Explain why SECURITY DEFINER functions need special care.

---

## 20. Interview Questions

**Q1. What is a schema in PostgreSQL?**

A namespace inside a database used to organize database objects.

**Q2. Can one database contain multiple schemas?**

Yes. A database can contain many schemas.

**Q3. What is the difference between a schema and a database?**

A database is a separate database environment. A schema organizes objects inside that database.

**Q4. How do you create a schema?**

Using `CREATE SCHEMA`.

**Q5. What is a schema-qualified name?**

A reference such as `sales.orders`, where the schema is explicitly specified.

**Q6. What is search_path?**

A PostgreSQL setting that determines which schemas are searched for unqualified object names.

**Q7. What is the difference between schema USAGE and CREATE?**

USAGE allows access to objects in the schema subject to their privileges. CREATE allows creating objects inside it.

**Q8. Does schema USAGE grant SELECT on tables?**

No. Table-level SELECT permission is separate.

**Q9. Can you JOIN tables across schemas?**

Yes, if they belong to the same database and the role has the necessary permissions.

**Q10. Can you JOIN tables from two separate databases directly?**

Not through an ordinary cross-database SQL reference. Use mechanisms such as postgres_fdw or application-level queries.

**Q11. What does ALTER TABLE SET SCHEMA do?**

Moves a table from one schema to another.

**Q12. What are default privileges?**

Rules that determine privileges granted automatically to future objects created by a particular role.

**Q13. What is the public schema?**

A commonly present default schema in PostgreSQL databases.

**Q14. Why should CREATE privileges on public be controlled?**

To prevent untrusted roles from creating objects that could interfere with application behavior or name resolution.

**Q15. What is SECURITY DEFINER?**

A function security mode that executes using the privileges of the function owner.

**Q16. Why is search_path important for SECURITY DEFINER functions?**

An unsafe search path can allow an attacker to influence object-name resolution and potentially execute code with elevated privileges.

**Q17. How do you check schema privileges?**

Use `has_schema_privilege()`.

**Q18. Can two schemas contain tables with the same name?**

Yes. For example, `sales.orders` and `archive.orders`.

---

## Key Takeaways

- A schema is a namespace inside a PostgreSQL database.
- A database can contain multiple schemas.
- Tables, views, functions and other objects can belong to schemas.
- Use `schema_name.object_name` for explicit object references.
- `search_path` controls resolution of unqualified names.
- Schema USAGE and CREATE are separate privileges.
- Schema USAGE does not grant table SELECT.
- Tables can be moved between schemas using `ALTER TABLE ... SET SCHEMA`.
- Default privileges apply to future objects created by a specified role.
- Tables from different schemas in the same database can be joined normally.
- Separate databases cannot be joined directly through ordinary SQL references.
- Restrict CREATE privileges on schemas used by application roles.
- SECURITY DEFINER functions require a controlled search path and careful privilege management.
- Use schemas to organize application modules and establish clear access boundaries.
