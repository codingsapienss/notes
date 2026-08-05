---
sidebar_label: "ALTER TABLE: Complete Guide"
sidebar_position: 1
---

# ALTER TABLE: Complete Guide

## 1. What is ALTER TABLE?

`ALTER TABLE` is a DDL command used to modify the structure of an existing table without recreating it.

Common operations:

- Add or remove columns.
- Rename tables and columns.
- Change column data types.
- Add or remove constraints.
- Set or remove default values.
- Set or remove NOT NULL.

General syntax:

```sql
ALTER TABLE table_name
action;
```

## 2. ADD COLUMN

Adds a new column to an existing table.

```sql
ALTER TABLE employees
ADD COLUMN email TEXT;
```

Add multiple columns:

```sql
ALTER TABLE employees
ADD COLUMN phone TEXT,
ADD COLUMN joining_date DATE,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

### Add a column with NOT NULL

```sql
ALTER TABLE employees
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
```

PostgreSQL populates existing rows with the default value for this column.

**Important:** Adding a NOT NULL column without a default fails when the table already contains rows.

## 3. DROP COLUMN

Removes a column and its stored values.

```sql
ALTER TABLE employees
DROP COLUMN email;
```

Remove multiple columns:

```sql
ALTER TABLE employees
DROP COLUMN phone,
DROP COLUMN joining_date;
```

### DROP COLUMN CASCADE

```sql
ALTER TABLE employees
DROP COLUMN department_id CASCADE;
```

Removes dependent objects that rely on the column, such as certain constraints and views.

**Warning:** CASCADE can remove more objects than expected. Inspect dependencies before using it.

## 4. RENAME COLUMN

Changes an existing column's name.

```sql
ALTER TABLE employees
RENAME COLUMN employee_name TO full_name;
```

The existing column data is preserved.

## 5. RENAME TABLE

Changes the name of a table.

```sql
ALTER TABLE employees
RENAME TO staff;
```

The table's data, columns, and constraints remain.

**Important:** PostgreSQL updates internal object references, but application code, SQL queries, and external integrations that use the old table name may need updates.

## 6. ALTER COLUMN TYPE

Changes the data type of an existing column.

```sql
ALTER TABLE employees
ALTER COLUMN salary TYPE NUMERIC(12, 2);
```

### Using USING for Explicit Conversion

When PostgreSQL cannot automatically convert existing values, specify a conversion expression.

Example: Convert a text column containing numeric strings into INTEGER.

```sql
ALTER TABLE employees
ALTER COLUMN salary TYPE INTEGER
USING salary::INTEGER;
```

**Important:**

- Every existing value must be convertible.
- Invalid values cause the operation to fail.
- Type changes can require table rewrites and locks.
- Some type changes can invalidate assumptions in application code.

## 7. SET DEFAULT

Sets a default value for future INSERT operations when the column is omitted or DEFAULT is specified.

```sql
ALTER TABLE employees
ALTER COLUMN status SET DEFAULT 'active';
```

Now:

```sql
INSERT INTO employees (employee_id, employee_name)
VALUES (101, 'Rahul');
```

If `status` is omitted, PostgreSQL uses `'active'`.

**Important:** SET DEFAULT does not automatically update existing rows.

## 8. DROP DEFAULT

Removes an existing default value.

```sql
ALTER TABLE employees
ALTER COLUMN status DROP DEFAULT;
```

Future inserts that omit the column receive NULL unless another rule applies.

Existing records remain unchanged.

## 9. SET NOT NULL

Prevents NULL values in a column.

```sql
ALTER TABLE employees
ALTER COLUMN employee_name SET NOT NULL;
```

**Important:** This fails if existing records contain NULL in `employee_name`.

Find NULL records first:

```sql
SELECT *
FROM employees
WHERE employee_name IS NULL;
```

Correct the data:

```sql
UPDATE employees
SET employee_name = 'Unknown'
WHERE employee_name IS NULL;
```

Then apply NOT NULL.

## 10. DROP NOT NULL

Allows a column to contain NULL values again.

```sql
ALTER TABLE employees
ALTER COLUMN employee_name DROP NOT NULL;
```

Existing records remain unchanged.

**Important:** PostgreSQL does not allow dropping the NOT NULL requirement from a primary key column while the primary key constraint remains.

## 11. ADD CONSTRAINT

Adds a new constraint to an existing table.

### A. Add PRIMARY KEY

```sql
ALTER TABLE employees
ADD CONSTRAINT pk_employees
PRIMARY KEY (employee_id);
```

Existing values must be unique and non-NULL.

### B. Add UNIQUE

```sql
ALTER TABLE employees
ADD CONSTRAINT uq_employee_email
UNIQUE (email);
```

Existing non-NULL values must not contain duplicates under the default NULL-distinct behaviour.

### C. Add CHECK

```sql
ALTER TABLE employees
ADD CONSTRAINT chk_employee_salary
CHECK (salary >= 0);
```

Existing rows must satisfy the condition.

### D. Add FOREIGN KEY

```sql
ALTER TABLE employees
ADD CONSTRAINT fk_employee_department
FOREIGN KEY (department_id)
REFERENCES departments(department_id);
```

Every existing non-NULL `department_id` must reference a valid department.

**Important:** Adding a constraint can fail if existing records violate it.

## 12. DROP CONSTRAINT

Removes a named constraint.

```sql
ALTER TABLE employees
DROP CONSTRAINT uq_employee_email;
```

Other examples:

```sql
ALTER TABLE employees
DROP CONSTRAINT chk_employee_salary;

ALTER TABLE employees
DROP CONSTRAINT fk_employee_department;
```

For a primary key:

```sql
ALTER TABLE employees
DROP CONSTRAINT pk_employees;
```

**Important:** Dropping a primary key can fail if other tables have foreign keys referencing it. CASCADE may remove dependent constraints as well.

## 13. Multiple ALTER Operations in One Statement

PostgreSQL allows multiple alterations in one ALTER TABLE command.

```sql
ALTER TABLE employees
ADD COLUMN email TEXT,
ADD COLUMN status TEXT DEFAULT 'active',
ALTER COLUMN salary TYPE NUMERIC(12, 2);
```

This reduces the need for separate ALTER TABLE statements.

## 14. Adding Columns to Populated Tables

Suppose `employees` already contains 100,000 records.

You execute:

```sql
ALTER TABLE employees
ADD COLUMN status TEXT DEFAULT 'active';
```

Existing rows will have the default value.

For a constant default, modern PostgreSQL versions can often add the column without physically rewriting every existing row immediately.

However, volatile defaults such as `DEFAULT NOW()` can require a table rewrite to populate existing rows.

### Safer Production Approach

For large tables or complex changes, use a staged migration:

**Step 1 — Add a nullable column**

```sql
ALTER TABLE employees
ADD COLUMN status TEXT;
```

**Step 2 — Backfill existing records**

```sql
UPDATE employees
SET status = 'active'
WHERE status IS NULL;
```

**Step 3 — Set the default**

```sql
ALTER TABLE employees
ALTER COLUMN status SET DEFAULT 'active';
```

**Step 4 — Enforce NOT NULL**

```sql
ALTER TABLE employees
ALTER COLUMN status SET NOT NULL;
```

For very large production tables, perform backfills in batches and consider lock duration and concurrent application writes.

## 15. Production Considerations: Locks and Performance

`ALTER TABLE` can acquire strong table locks.

Potential effects:

- Queries may wait while the alteration runs.
- Writes may be blocked.
- Type changes may rewrite large tables.
- Adding constraints may require scanning existing records.
- Long-running transactions can delay schema changes.

### NOT VALID Constraints

PostgreSQL supports adding certain CHECK and FOREIGN KEY constraints without immediately validating all existing rows.

Example:

```sql
ALTER TABLE employees
ADD CONSTRAINT chk_employee_salary
CHECK (salary >= 0)
NOT VALID;
```

New inserts and updates must satisfy the constraint, but existing rows are not scanned immediately.

Validate later:

```sql
ALTER TABLE employees
VALIDATE CONSTRAINT chk_employee_salary;
```

**Important:** `NOT VALID` is supported for CHECK and FOREIGN KEY constraints, not as a general option for every constraint type.

## 16. Inspecting Table Structure

### Using psql

```sql
\d employees
```

Detailed information:

```sql
\d+ employees
```

### Using information_schema

```sql
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

## 17. Common ALTER TABLE Mistakes

1. Adding NOT NULL without checking existing NULL values.
2. Changing a data type without checking whether existing values can be converted.
3. Assuming SET DEFAULT updates existing records.
4. Assuming DROP DEFAULT removes values already stored.
5. Dropping a column without checking dependent objects.
6. Using CASCADE without understanding its impact.
7. Running large schema changes during peak traffic without planning locks.
8. Assuming every ALTER TABLE operation is instant.
9. Forgetting to update application queries after renaming columns.
10. Adding constraints without validating existing data.

## 18. Practice Exercises

Use the `techbazaar` database.

1. Add an `email` column to employees.
2. Add `joining_date` and `status` columns.
3. Set the default status to `'active'`.
4. Rename `employee_name` to `full_name`.
5. Change salary to `NUMERIC(12,2)`.
6. Add a UNIQUE constraint on email.
7. Add a CHECK constraint preventing negative salaries.
8. Add a foreign key referencing departments.
9. Set `full_name` to NOT NULL.
10. Remove the default from status.
11. Drop the email UNIQUE constraint.
12. Remove a column using DROP COLUMN.
13. Add a CHECK constraint using NOT VALID and validate it later.
14. Inspect the final table structure.

## 19. Interview Questions

1. What is ALTER TABLE?
2. How do you add multiple columns to an existing table?
3. What is the difference between DROP COLUMN and DROP CONSTRAINT?
4. How do you rename a column or table?
5. What is the purpose of the USING clause in ALTER COLUMN TYPE?
6. Does SET DEFAULT update existing records?
7. What happens when you apply NOT NULL to a column containing NULL values?
8. How do you add a foreign key to an existing table?
9. What happens if existing records violate a newly added constraint?
10. What is a NOT VALID constraint?
11. What does VALIDATE CONSTRAINT do?
12. Why can ALTER TABLE affect production performance?
13. What is a safe strategy for adding a mandatory column to a large table?
14. Can you drop a primary key that is referenced by another table?
