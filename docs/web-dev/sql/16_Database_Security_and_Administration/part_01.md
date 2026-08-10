---
sidebar_label: "Users, Roles and Permissions in PostgreSQL"
sidebar_position: 1
---

# Users, Roles and Permissions in PostgreSQL

## 1. Introduction

PostgreSQL provides a security and access-control system that determines:

- Who can connect to the database.
- Which databases a user can access.
- Which tables and schemas a user can access.
- Which operations a user can perform.
- Whether a user can create, modify or delete database objects.

PostgreSQL uses **roles** to manage authentication and authorization.

### Important terminology

| Term           | Meaning                                                       |
| -------------- | ------------------------------------------------------------- |
| Role           | Database identity that can own objects and receive privileges |
| Login role     | A role with permission to authenticate                        |
| Group role     | A role used to collect privileges for multiple users          |
| Authentication | Verifying who is connecting                                   |
| Authorization  | Determining what an authenticated role can do                 |
| Privilege      | Permission to perform an operation                            |
| Ownership      | Control over a database object                                |

**Important:** In modern PostgreSQL, users and groups are both roles. A user is essentially a role with the `LOGIN` attribute.

---

## 2. Understanding PostgreSQL Roles

PostgreSQL roles are cluster-wide objects.

This means a role created in one database can potentially connect to other databases in the same PostgreSQL cluster, subject to the relevant privileges.

### Create a role

```sql
CREATE ROLE developer;
```

This creates a role without login permission.

It cannot directly authenticate to PostgreSQL.

### Create a login role

```sql
CREATE ROLE app_user
WITH LOGIN
PASSWORD 'StrongPassword123';
```

Now `app_user` can authenticate, provided the server's authentication configuration permits it.

### Alternative syntax

```sql
CREATE USER app_user
WITH PASSWORD 'StrongPassword123';
```

`CREATE USER` is effectively an alias for creating a role with `LOGIN`.

### Important

Creating a login role does not automatically grant permission to access every database or table.

Authentication and authorization are separate.

---

## 3. CREATE ROLE vs CREATE USER

| CREATE ROLE                      | CREATE USER                        |
| -------------------------------- | ---------------------------------- |
| Creates a PostgreSQL role        | Creates a PostgreSQL role          |
| Does not enable LOGIN by default | Enables LOGIN by default           |
| Supports all role attributes     | Supports all role attributes       |
| Can represent users or groups    | Commonly used for login identities |

Example:

```sql
CREATE ROLE reporting_user LOGIN;
```

Equivalent:

```sql
CREATE USER reporting_user;
```

Both create a login role.

---

## 4. Important Role Attributes

PostgreSQL supports several role attributes.

| Attribute       | Purpose                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `LOGIN`         | Allows authentication                                                       |
| `NOLOGIN`       | Prevents authentication                                                     |
| `SUPERUSER`     | Grants unrestricted administrative privileges                               |
| `NOSUPERUSER`   | Removes superuser status                                                    |
| `CREATEDB`      | Allows database creation                                                    |
| `NOCREATEDB`    | Prevents database creation                                                  |
| `CREATEROLE`    | Allows role creation and certain role management                            |
| `NOCREATEROLE`  | Prevents role creation                                                      |
| `REPLICATION`   | Allows replication-related connections and operations                       |
| `NOREPLICATION` | Removes replication privilege                                               |
| `BYPASSRLS`     | Bypasses row-level security policies                                        |
| `NOBYPASSRLS`   | Does not bypass row-level security                                          |
| `INHERIT`       | Allows automatic use of privileges from roles of which the role is a member |
| `NOINHERIT`     | Prevents automatic privilege inheritance                                    |

### Example: Create a developer role

```sql
CREATE ROLE backend_developer
WITH
    LOGIN
    PASSWORD 'StrongPassword123'
    CREATEDB
    NOSUPERUSER
    NOCREATEROLE;
```

This role:

- Can log in.
- Can create databases.
- Cannot create or manage roles using CREATEROLE privileges.
- Is not a superuser.

### Example: Create a reporting role

```sql
CREATE ROLE reporting_user
WITH
    LOGIN
    PASSWORD 'ReportingPassword123'
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE;
```

This is a restricted login role. It still needs appropriate database and object privileges.

**Security recommendation:** Never use SUPERUSER for normal application accounts.

---

## 5. Viewing Existing Roles

PostgreSQL provides commands to inspect roles.

### Using psql

```sql
\du
```

Displays roles and their attributes.

### Using SQL

```sql
SELECT
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin,
    rolreplication,
    rolbypassrls
FROM pg_roles;
```

`pg_roles` is a system view containing information about database roles.

### Find a particular role

```sql
SELECT *
FROM pg_roles
WHERE rolname = 'app_user';
```

---

## 6. Altering Roles

Use `ALTER ROLE` to modify role attributes.

### Change password

```sql
ALTER ROLE app_user
WITH PASSWORD 'NewStrongPassword456';
```

### Enable database creation

```sql
ALTER ROLE app_user
CREATEDB;
```

### Disable database creation

```sql
ALTER ROLE app_user
NOCREATEDB;
```

### Enable login

```sql
ALTER ROLE developer
LOGIN;
```

### Disable login

```sql
ALTER ROLE developer
NOLOGIN;
```

### Rename a role

```sql
ALTER ROLE app_user
RENAME TO production_app_user;
```

### Set a connection limit

```sql
ALTER ROLE production_app_user
CONNECTION LIMIT 20;
```

This limits the number of concurrent connections for that role. It does not replace connection pooling or application-level connection management.

---

## 7. Dropping Roles

Use `DROP ROLE` to delete a role.

```sql
DROP ROLE app_user;
```

Safer version:

```sql
DROP ROLE IF EXISTS app_user;
```

### Important restriction

You cannot drop a role while it still owns database objects or has dependent privileges in the cluster.

Before dropping a role that owns objects, you may need to transfer ownership and remove its privileges.

Example:

```sql
REASSIGN OWNED BY app_user TO postgres;
```

Then:

```sql
DROP OWNED BY app_user;
```

Finally:

```sql
DROP ROLE app_user;
```

**Warning:** `DROP OWNED` can remove privileges and drop objects owned by the specified role in the current database. Review its impact carefully, especially when operating across multiple databases.

---

## 8. Understanding GRANT and REVOKE

PostgreSQL uses:

- `GRANT` to assign privileges.
- `REVOKE` to remove privileges.

These commands control access to database objects.

### General syntax

```sql
GRANT privilege
ON object
TO role_name;
```

```sql
REVOKE privilege
ON object
FROM role_name;
```

Common privileges include:

| Privilege  | Meaning                                                     |
| ---------- | ----------------------------------------------------------- |
| SELECT     | Read data                                                   |
| INSERT     | Insert rows                                                 |
| UPDATE     | Modify rows                                                 |
| DELETE     | Delete rows                                                 |
| TRUNCATE   | Empty a table                                               |
| REFERENCES | Create foreign keys referencing a table                     |
| TRIGGER    | Create triggers on a table                                  |
| EXECUTE    | Execute functions or procedures                             |
| USAGE      | Use certain database objects, such as schemas and sequences |
| CREATE     | Create objects in a schema                                  |

The available privileges depend on the object type.

---

## 9. Database-Level Permissions

Suppose you have a database named `techbazaar`.

Create a login role:

```sql
CREATE ROLE techbazaar_app
WITH LOGIN PASSWORD 'AppPassword123';
```

Grant database connection:

```sql
GRANT CONNECT
ON DATABASE techbazaar
TO techbazaar_app;
```

### Allow temporary tables

```sql
GRANT TEMPORARY
ON DATABASE techbazaar
TO techbazaar_app;
```

### Allow database creation

```sql
GRANT CREATE
ON DATABASE techbazaar
TO techbazaar_app;
```

**Important:** Database-level CREATE permits creating schemas in that database. It does not automatically grant access to every table or schema.

---

## 10. Schema-Level Permissions

A schema is a namespace that contains database objects.

For example:

```text
techbazaar
   |
   └── public
         |
         ├── employees
         ├── departments
         ├── customers
         └── orders
```

To access objects inside a schema, a role generally needs `USAGE` on that schema.

### Grant schema usage

```sql
GRANT USAGE
ON SCHEMA public
TO techbazaar_app;
```

### Grant schema creation

```sql
GRANT CREATE
ON SCHEMA public
TO techbazaar_app;
```

### Important difference

| Privilege        | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| Database CONNECT | Connect to a database                                                |
| Schema USAGE     | Resolve and access objects in a schema, subject to object privileges |
| Schema CREATE    | Create objects in a schema                                           |
| Table SELECT     | Read table data                                                      |

Having CONNECT does not automatically grant table access.

Having schema USAGE does not automatically grant SELECT on tables.

---

## 11. Table-Level Permissions

Suppose the application needs to read and write customer data.

### Grant SELECT

```sql
GRANT SELECT
ON TABLE customers
TO techbazaar_app;
```

### Grant INSERT

```sql
GRANT INSERT
ON TABLE customers
TO techbazaar_app;
```

### Grant UPDATE

```sql
GRANT UPDATE
ON TABLE customers
TO techbazaar_app;
```

### Grant DELETE

```sql
GRANT DELETE
ON TABLE customers
TO techbazaar_app;
```

### Grant multiple privileges

```sql
GRANT SELECT, INSERT, UPDATE
ON TABLE customers
TO techbazaar_app;
```

### Grant all table privileges

```sql
GRANT ALL PRIVILEGES
ON TABLE customers
TO techbazaar_app;
```

`ALL PRIVILEGES` means all applicable table privileges. It does not make the role the owner or a superuser.

### Grant permissions on multiple tables

```sql
GRANT SELECT
ON TABLE
    employees,
    departments,
    customers,
    products
TO reporting_user;
```

---

## 12. Grant Permissions on All Existing Tables

Suppose a reporting role needs SELECT access to all existing tables in the `public` schema.

Instead of granting permissions individually:

```sql
GRANT SELECT
ON ALL TABLES IN SCHEMA public
TO reporting_user;
```

This applies to tables and other supported relation objects existing at the time the command executes.

**Important:** It does not automatically apply to tables created in the future.

---

## 13. Default Privileges for Future Tables

To grant permissions automatically on future tables created by a particular role, use `ALTER DEFAULT PRIVILEGES`.

Example:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE postgres
IN SCHEMA public
GRANT SELECT
ON TABLES
TO reporting_user;
```

This means:

When `postgres` creates a new table in the `public` schema, `reporting_user` receives SELECT permission on it.

### Important rules

- Default privileges apply only to future objects.
- They are associated with the role that creates the object.
- They do not automatically apply to objects created by every other role.
- Existing objects need separate GRANT commands.
- Default privileges are not inherited from membership in another role.

### Example for an application role

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE techbazaar_app
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE
ON TABLES
TO reporting_user;
```

This applies to future tables created by `techbazaar_app` in the `public` schema.

---

## 14. Sequence Permissions

PostgreSQL sequences are separate database objects.

They are commonly used by identity columns and SERIAL columns.

A role that can INSERT into a table may also need sequence permissions when it explicitly uses sequence functions or works with legacy SERIAL-based columns.

### Grant sequence usage

```sql
GRANT USAGE
ON SEQUENCE employees_employee_id_seq
TO techbazaar_app;
```

### Grant permissions on all existing sequences

```sql
GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO techbazaar_app;
```

### Default privileges for future sequences

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE postgres
IN SCHEMA public
GRANT USAGE, SELECT
ON SEQUENCES
TO techbazaar_app;
```

### Sequence privileges

| Privilege | Meaning                                                          |
| --------- | ---------------------------------------------------------------- |
| USAGE     | Allows `nextval()` and `currval()`                               |
| SELECT    | Allows reading sequence state using `currval()` and `last_value` |
| UPDATE    | Allows `nextval()`, `setval()` and other sequence modifications  |

For ordinary identity-column inserts, PostgreSQL manages the sequence as part of the identity mechanism. Test actual application operations under the intended role rather than granting excessive sequence privileges by default.

---

## 15. Role Membership and Group Roles

PostgreSQL allows roles to be members of other roles.

This makes permission management easier.

Instead of granting privileges separately to every developer, create a group role and grant privileges to it.

### Step 1: Create group roles

```sql
CREATE ROLE developers NOLOGIN;
CREATE ROLE analysts NOLOGIN;
CREATE ROLE admins NOLOGIN;
```

These roles are not login accounts. They are used to organize privileges.

### Step 2: Create login roles

```sql
CREATE ROLE rahul
WITH LOGIN PASSWORD 'RahulPassword123';

CREATE ROLE amit
WITH LOGIN PASSWORD 'AmitPassword123';

CREATE ROLE priya
WITH LOGIN PASSWORD 'PriyaPassword123';
```

### Step 3: Grant group membership

```sql
GRANT developers TO rahul;
GRANT developers TO amit;
GRANT analysts TO priya;
```

Now Rahul and Amit are members of the `developers` role.

Priya is a member of `analysts`.

### Step 4: Grant privileges to group roles

```sql
GRANT SELECT, INSERT, UPDATE
ON ALL TABLES IN SCHEMA public
TO developers;
```

```sql
GRANT SELECT
ON ALL TABLES IN SCHEMA public
TO analysts;
```

Now members can use the privileges according to the role-membership rules.

### Advantages

- Centralized permission management.
- Easier onboarding and offboarding.
- Less repetitive GRANT statements.
- Consistent permissions across teams.

---

## 16. INHERIT vs SET ROLE

Role membership and privilege inheritance are related but different concepts.

### INHERIT

A role with `INHERIT` can automatically use privileges of roles of which it is a member, subject to membership options.

### NOINHERIT

A role with `NOINHERIT` does not automatically use inherited privileges.

It can still explicitly switch into an eligible member role using `SET ROLE`.

Example:

```sql
CREATE ROLE senior_developer
WITH LOGIN PASSWORD 'SeniorPassword123'
NOINHERIT;

GRANT developers TO senior_developer;
```

Switch role:

```sql
SET ROLE developers;
```

Check current role:

```sql
SELECT CURRENT_ROLE;
```

Return to the original session role:

```sql
RESET ROLE;
```

### Important

PostgreSQL role membership supports additional membership options, including `INHERIT`, `SET` and `ADMIN`.

These options determine whether a member can automatically use privileges, explicitly switch to the granted role, or administer membership.

For example:

```sql
GRANT developers TO senior_developer
WITH INHERIT FALSE, SET TRUE;
```

This allows explicit role switching but prevents automatic privilege inheritance from that membership.

---

## 17. Ownership vs Privileges

This is one of the most important PostgreSQL security concepts.

**Ownership is not the same as a GRANT privilege.**

The owner of a database object has inherent control over that object, including the ability to alter or drop it.

Example:

```sql
CREATE TABLE employees_backup (
    employee_id BIGINT,
    employee_name VARCHAR(100)
);
```

The role that creates this table normally becomes its owner.

You can inspect ownership using:

```sql
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'employees_backup';
```

### Change ownership

```sql
ALTER TABLE employees_backup
OWNER TO techbazaar_app;
```

The new owner must be eligible to own the object, and the executing role must have the required authority.

### Important

Granting ALL PRIVILEGES does not make a role the owner.

Likewise, revoking ordinary privileges from an object owner does not remove the owner's inherent rights.

---

## 18. REVOKE Permissions

Suppose a developer should no longer update customer data.

```sql
REVOKE UPDATE
ON TABLE customers
FROM developers;
```

Remove all ordinary table privileges granted to a role:

```sql
REVOKE ALL PRIVILEGES
ON TABLE customers
FROM developers;
```

Remove database connection permission:

```sql
REVOKE CONNECT
ON DATABASE techbazaar
FROM developers;
```

Remove schema usage:

```sql
REVOKE USAGE
ON SCHEMA public
FROM developers;
```

### Important: REVOKE does not always remove effective access

A role may still have access because:

- It is a member of another role with privileges.
- It owns the object.
- It is a superuser.
- It receives privileges through PUBLIC.
- Another applicable access-control mechanism grants access.

Always inspect effective privileges and role memberships before concluding that access has been removed.

---

## 19. The PUBLIC Role

`PUBLIC` is a special pseudo-role representing all database roles.

A privilege granted to PUBLIC applies to all roles, including roles created later.

Example:

```sql
GRANT CONNECT
ON DATABASE techbazaar
TO PUBLIC;
```

Now all roles receive CONNECT permission through PUBLIC, subject to other restrictions.

Revoke it:

```sql
REVOKE CONNECT
ON DATABASE techbazaar
FROM PUBLIC;
```

### Important

New PostgreSQL databases commonly grant CONNECT and TEMPORARY privileges on the database to PUBLIC by default.

Check the actual permissions of your database rather than assuming its defaults.

---

## 20. Granting and Revoking with GRANT OPTION

Sometimes a role should be able to grant its privileges to other roles.

Use `WITH GRANT OPTION`.

```sql
GRANT SELECT
ON TABLE customers
TO reporting_user
WITH GRANT OPTION;
```

Now `reporting_user` can grant the SELECT privilege to another role.

Example:

```sql
GRANT SELECT
ON TABLE customers
TO junior_analyst;
```

### Revoke grant option

```sql
REVOKE GRANT OPTION FOR SELECT
ON TABLE customers
FROM reporting_user;
```

This removes the ability to grant the privilege onward.

The actual privilege may remain, depending on the revoke operation and grant chain.

---

## 21. Checking Object Privileges

PostgreSQL provides functions to inspect access privileges.

### Check table SELECT permission

```sql
SELECT has_table_privilege(
    'reporting_user',
    'public.customers',
    'SELECT'
);
```

Returns:

```text
true
```

or:

```text
false
```

### Check INSERT permission

```sql
SELECT has_table_privilege(
    'techbazaar_app',
    'public.customers',
    'INSERT'
);
```

### Check schema usage

```sql
SELECT has_schema_privilege(
    'techbazaar_app',
    'public',
    'USAGE'
);
```

### Check database connection

```sql
SELECT has_database_privilege(
    'techbazaar_app',
    'techbazaar',
    'CONNECT'
);
```

### Check sequence usage

```sql
SELECT has_sequence_privilege(
    'techbazaar_app',
    'public.employees_employee_id_seq',
    'USAGE'
);
```

These functions are useful when debugging permission errors.

---

## 22. Practical Role Design for TechBazaar

A production application should not use one superuser account for every operation.

Create separate roles according to responsibilities.

### Suggested role structure

| Role               | Responsibility                         |
| ------------------ | -------------------------------------- |
| `techbazaar_owner` | Owns application database objects      |
| `techbazaar_app`   | Application runtime login              |
| `developers`       | Development team permissions           |
| `reporting_user`   | Read-only reporting                    |
| `migration_user`   | Controlled schema migration operations |

### Step 1: Create roles

```sql
CREATE ROLE techbazaar_owner NOLOGIN;

CREATE ROLE techbazaar_app
WITH LOGIN PASSWORD 'AppPassword123';

CREATE ROLE developers NOLOGIN;

CREATE ROLE reporting_user
WITH LOGIN PASSWORD 'ReportingPassword123';

CREATE ROLE migration_user
WITH LOGIN PASSWORD 'MigrationPassword123';
```

### Step 2: Grant database connection

```sql
GRANT CONNECT
ON DATABASE techbazaar
TO techbazaar_app, developers, reporting_user, migration_user;
```

### Step 3: Grant schema usage

```sql
GRANT USAGE
ON SCHEMA public
TO techbazaar_app, developers, reporting_user;
```

### Step 4: Grant application permissions

```sql
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO techbazaar_app;
```

### Step 5: Grant reporting permissions

```sql
GRANT SELECT
ON ALL TABLES IN SCHEMA public
TO reporting_user;
```

### Step 6: Grant developer permissions

```sql
GRANT SELECT, INSERT, UPDATE
ON ALL TABLES IN SCHEMA public
TO developers;
```

### Step 7: Configure future table permissions

For tables created by `techbazaar_owner`:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE techbazaar_owner
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES
TO techbazaar_app;
```

For reporting:

```sql
ALTER DEFAULT PRIVILEGES
FOR ROLE techbazaar_owner
IN SCHEMA public
GRANT SELECT
ON TABLES
TO reporting_user;
```

### Important production considerations

This is an illustrative permission design, not a complete production security configuration.

- Ensure objects are actually created by the intended owner role.
- Configure default privileges for every relevant object-creating role.
- Grant sequence permissions when required by the application's insert patterns.
- Restrict schema CREATE privileges.
- Do not grant developers production access without a clear requirement.
- Use a secrets manager or environment-based secret handling for application passwords.
- Consider separate schemas for application, reporting and internal objects.

---

## 23. PostgreSQL Authentication vs Authorization

These are different security layers.

### Authentication

Authentication answers:

**Who are you?**

PostgreSQL uses its `pg_hba.conf` file to control client authentication.

Common authentication methods include:

- `scram-sha-256`
- `cert`
- `peer`
- `trust`
- `reject`

Example of a `pg_hba.conf` entry:

```text
host    techbazaar    techbazaar_app    127.0.0.1/32    scram-sha-256
```

This specifies that connections matching the entry must authenticate using SCRAM-SHA-256.

The exact configuration and rule ordering matter.

### Authorization

Authorization answers:

**What are you allowed to do?**

PostgreSQL uses:

- Roles.
- Role memberships.
- Object ownership.
- GRANT.
- REVOKE.
- Row-level security policies.

### Comparison

| Authentication                                         | Authorization                                          |
| ------------------------------------------------------ | ------------------------------------------------------ |
| Verifies identity                                      | Controls permissions                                   |
| Uses password, certificates, peer authentication, etc. | Uses role privileges and policies                      |
| Configured partly through `pg_hba.conf`                | Configured through roles, grants and policies          |
| Happens during connection establishment                | Checked when accessing database objects and operations |

A valid password does not automatically grant permission to read a table.

---

## 24. Common Permission Errors

### Error 1: Permission denied for table

```text
ERROR: permission denied for table customers
```

Possible fix:

```sql
GRANT SELECT
ON TABLE customers
TO reporting_user;
```

### Error 2: Permission denied for schema

```text
ERROR: permission denied for schema public
```

Possible fix:

```sql
GRANT USAGE
ON SCHEMA public
TO reporting_user;
```

### Error 3: Database connection denied

```text
FATAL: permission denied for database "techbazaar"
```

Possible fix:

```sql
GRANT CONNECT
ON DATABASE techbazaar
TO reporting_user;
```

### Error 4: Permission denied for sequence

```text
ERROR: permission denied for sequence employees_employee_id_seq
```

Possible fix, if the application needs sequence access:

```sql
GRANT USAGE
ON SEQUENCE employees_employee_id_seq
TO techbazaar_app;
```

### Debugging checklist

When a PostgreSQL permission error occurs, check:

1. Is the role allowed to log in?
2. Can it connect to the database?
3. Does it have USAGE on the schema?
4. Does it have the required table privilege?
5. Does it need sequence privileges?
6. Does it inherit privileges from another role?
7. Is it affected by ownership or PUBLIC privileges?
8. Is row-level security restricting the rows?

---

## 25. Security Best Practices

1. Never use a superuser account for application runtime operations.
2. Follow the principle of least privilege.
3. Create separate roles for application, developers, reporting and migrations.
4. Avoid granting ALL PRIVILEGES without a specific requirement.
5. Use NOLOGIN roles to organize group permissions.
6. Grant only the necessary schema and table privileges.
7. Configure default privileges for future objects.
8. Use strong authentication, preferably SCRAM-SHA-256 for password-based authentication.
9. Avoid storing passwords directly in source code.
10. Rotate credentials when necessary.
11. Review role memberships regularly.
12. Use dedicated migration credentials for schema changes.
13. Be careful with SUPERUSER, CREATEROLE and BYPASSRLS.
14. Remember that ownership provides more control than ordinary GRANT privileges.
15. Test permissions using the actual application login role.

---

## 26. Practice Exercises

Use the TechBazaar database.

### Role management

1. Create a login role named `techbazaar_app`.
2. Create a NOLOGIN role named `developers`.
3. Create a login role named `reporting_user`.
4. Create a role with CREATEDB but without SUPERUSER.
5. Change a role's password.
6. Disable and re-enable login for a role.
7. Rename a role.
8. View all roles using `pg_roles`.

### Permissions

9. Grant CONNECT on `techbazaar` to `techbazaar_app`.
10. Grant USAGE on the `public` schema.
11. Grant SELECT, INSERT and UPDATE on `customers`.
12. Grant SELECT on all existing tables to `reporting_user`.
13. Revoke DELETE from a role.
14. Grant sequence usage where required.
15. Configure default privileges for future tables.
16. Check table privileges using `has_table_privilege()`.

### Role memberships

17. Grant `developers` membership to two login roles.
18. Grant SELECT and UPDATE to the developers group role.
19. Create a NOINHERIT login role.
20. Use SET ROLE and RESET ROLE.
21. Explain the difference between INHERIT and SET ROLE.

### Security

22. Create a reporting role that cannot modify application data.
23. Create a separate application role with only necessary runtime privileges.
24. Explain the difference between authentication and authorization.
25. Investigate a permission-denied error using privilege-checking functions.
26. Explain why the application should not connect as PostgreSQL superuser.

---

## 27. Interview Questions

**Q1. What is a role in PostgreSQL?**

A database identity that can own objects, authenticate and receive privileges.

**Q2. What is the difference between CREATE ROLE and CREATE USER?**

CREATE USER creates a role with LOGIN enabled by default. CREATE ROLE does not enable LOGIN unless specified.

**Q3. What is the difference between authentication and authorization?**

Authentication verifies identity. Authorization determines permitted actions.

**Q4. What does LOGIN do?**

It allows a role to authenticate to PostgreSQL.

**Q5. What is a NOLOGIN role?**

A role that cannot authenticate directly and is commonly used to group privileges.

**Q6. What is SUPERUSER?**

A role attribute granting unrestricted administrative privileges.

**Q7. What is GRANT?**

A command that assigns privileges to a role.

**Q8. What is REVOKE?**

A command that removes granted privileges.

**Q9. What is the difference between database CONNECT and schema USAGE?**

CONNECT allows connecting to a database. USAGE allows access to objects in a schema, subject to their own privileges.

**Q10. Does GRANT ALL PRIVILEGES make a role the owner?**

No. Ownership and ordinary privileges are different.

**Q11. What is a group role?**

A role used to centralize privileges for multiple member roles.

**Q12. What is the purpose of ALTER DEFAULT PRIVILEGES?**

It defines privileges automatically granted to future objects created by a specified role.

**Q13. Do default privileges apply to existing tables?**

No. Existing objects need separate GRANT statements.

**Q14. What is the PUBLIC role?**

A special pseudo-role representing all database roles.

**Q15. What is WITH GRANT OPTION?**

It allows a role to grant a privilege onward to other roles.

**Q16. What is the difference between INHERIT and NOINHERIT?**

INHERIT allows automatic use of inherited role privileges. NOINHERIT prevents automatic inheritance, though eligible explicit role switching may still be possible.

**Q17. What is SET ROLE?**

It changes the current role identity for the session to an eligible role.

**Q18. What is ownership in PostgreSQL?**

Ownership provides inherent control over an object, including the ability to alter or drop it.

**Q19. What is pg_hba.conf?**

The PostgreSQL client authentication configuration file.

**Q20. Why should an application avoid using a superuser account?**

Because a compromised application could gain unrestricted control over the database cluster.

---

## Key Takeaways

- PostgreSQL uses roles for authentication and authorization.
- Users and groups are both roles.
- CREATE USER is effectively CREATE ROLE with LOGIN.
- NOLOGIN roles are useful for group-based permission management.
- GRANT assigns privileges; REVOKE removes them.
- Database CONNECT, schema USAGE and table SELECT are separate permissions.
- Sequence privileges may be needed for certain insert patterns.
- ALTER DEFAULT PRIVILEGES applies to future objects created by a specified role.
- Role membership helps centralize permissions.
- INHERIT and SET ROLE control how membership privileges are used.
- Ownership is more powerful than ordinary GRANT privileges.
- PUBLIC represents all database roles.
- pg_hba.conf controls client authentication.
- Production applications should use restricted, dedicated login roles.
- Follow the principle of least privilege.
