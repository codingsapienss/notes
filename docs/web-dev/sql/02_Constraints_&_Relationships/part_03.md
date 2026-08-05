---
sidebar_label: "Foreign Key Delete and Update Actions"
sidebar_position: 1
---

# Foreign Key Delete and Update Actions

## 1. What Happens When a Referenced Record Is Deleted?

Suppose a department has multiple employees.

```text
departments
----------------
department_id | name
1             | IT

employees
----------------------------
employee_id | name  | department_id
101         | Rahul | 1
102         | Priya | 1
```

If you try to delete department `1`:

```sql
DELETE FROM departments
WHERE department_id = 1;
```

PostgreSQL rejects the deletion because employees still reference that department.

This is the default foreign key behaviour.

You can control what happens using **referential actions**.

## 2. ON DELETE Actions

PostgreSQL supports these main actions:

| Action      | Behaviour                                             |
| ----------- | ----------------------------------------------------- |
| RESTRICT    | Prevents deletion while references exist              |
| NO ACTION   | Checks the constraint and rejects invalid deletion    |
| CASCADE     | Deletes referencing child records                     |
| SET NULL    | Sets referencing foreign keys to NULL                 |
| SET DEFAULT | Sets referencing foreign keys to their default values |

## 3. ON DELETE RESTRICT

Prevents deletion of a parent record if child records reference it.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT,
    department_id BIGINT,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT
);
```

Attempt:

```sql
DELETE FROM departments
WHERE department_id = 1;
```

Result: Deletion fails while employees reference department `1`.

**Use case:** Prevent deleting departments that still have employees.

## 4. ON DELETE NO ACTION

This is PostgreSQL's default behaviour when no delete action is specified.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT,
    department_id BIGINT REFERENCES departments(department_id)
        ON DELETE NO ACTION
);
```

It rejects a deletion if the foreign key constraint is violated when checked.

### RESTRICT vs NO ACTION

| RESTRICT                           | NO ACTION                                                |
| ---------------------------------- | -------------------------------------------------------- |
| Prevents the operation immediately | Checks the constraint when it is due to be checked       |
| Cannot be deferred                 | Can be deferred if the constraint is declared DEFERRABLE |
| Default is not RESTRICT            | Default is NO ACTION                                     |

**Important:** With ordinary non-deferrable foreign keys, both generally behave the same. The distinction matters when deferred constraint checking is used.

## 5. ON DELETE CASCADE

Automatically deletes child records when the referenced parent record is deleted.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT,
    department_id BIGINT REFERENCES departments(department_id)
        ON DELETE CASCADE
);
```

Suppose:

```text
departments
----------------
1 | IT

employees
----------------
101 | Rahul | 1
102 | Priya | 1
```

Execute:

```sql
DELETE FROM departments
WHERE department_id = 1;
```

Result:

- Department `1` is deleted.
- Employee `101` is deleted.
- Employee `102` is deleted.

**Use case:** Dependent records that should not exist independently of their parent, such as temporary child records or certain junction-table rows.

**Warning:** CASCADE can delete large numbers of records through multiple relationships. Use it only when that deletion behaviour is intentional.

## 6. ON DELETE SET NULL

Sets the child foreign key to NULL when the parent record is deleted.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT,
    department_id BIGINT REFERENCES departments(department_id)
        ON DELETE SET NULL
);
```

Before deletion:

```text
employee_id | name  | department_id
101         | Rahul | 1
102         | Priya | 1
```

Delete:

```sql
DELETE FROM departments
WHERE department_id = 1;
```

After deletion:

```text
employee_id | name  | department_id
101         | Rahul | NULL
102         | Priya | NULL
```

Employees remain, but their department association is removed.

**Important:** The foreign key column must allow NULL. If it is NOT NULL, the action cannot successfully set it to NULL.

**Use case:** Optional relationships, such as an employee whose department may be removed.

## 7. ON DELETE SET DEFAULT

Sets the child foreign key to its declared default value when the parent is deleted.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT,
    department_id BIGINT DEFAULT 0
        REFERENCES departments(department_id)
        ON DELETE SET DEFAULT
);
```

For this to work, department `0` must exist in the parent table.

```sql
INSERT INTO departments
VALUES (0, 'Unassigned');
```

Now deleting another department can move its employees to department `0`.

```sql
DELETE FROM departments
WHERE department_id = 1;
```

Result:

```text
employee_id | name  | department_id
101         | Rahul | 0
102         | Priya | 0
```

**Important:** The default value must still satisfy the foreign key constraint. If the default does not reference an existing parent record, deletion fails.

## 8. ON UPDATE Actions

`ON UPDATE` defines what happens when a referenced parent key is updated.

PostgreSQL supports the same main actions:

- NO ACTION
- RESTRICT
- CASCADE
- SET NULL
- SET DEFAULT

### A. ON UPDATE CASCADE

Automatically updates referencing foreign key values when the parent key changes.

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    employee_name TEXT,
    department_id BIGINT REFERENCES departments(department_id)
        ON UPDATE CASCADE
);
```

Suppose department ID `1` is referenced by employees.

Execute:

```sql
UPDATE departments
SET department_id = 10
WHERE department_id = 1;
```

Result:

- Parent department ID changes from `1` to `10`.
- All referencing employee department IDs change from `1` to `10`.

### B. Other ON UPDATE Actions

| Action      | Behaviour                                                     |
| ----------- | ------------------------------------------------------------- |
| RESTRICT    | Prevents updating a referenced key                            |
| NO ACTION   | Rejects the update if the constraint is violated when checked |
| CASCADE     | Updates child foreign keys                                    |
| SET NULL    | Sets child foreign keys to NULL                               |
| SET DEFAULT | Sets child foreign keys to their defaults                     |

**Practical note:** Primary keys are generally treated as stable identifiers. Updating them is less common than updating ordinary business attributes.

## 9. Complete Comparison

| Action      | Parent deleted/updated                 | Child records                                       |
| ----------- | -------------------------------------- | --------------------------------------------------- |
| RESTRICT    | Blocked if referenced                  | Unchanged                                           |
| NO ACTION   | Blocked if constraint fails            | Unchanged                                           |
| CASCADE     | Operation proceeds                     | Corresponding FK values or rows are updated/deleted |
| SET NULL    | Operation proceeds                     | FK becomes NULL                                     |
| SET DEFAULT | Operation proceeds if default is valid | FK becomes its default                              |

For `ON DELETE`, CASCADE deletes child rows. For `ON UPDATE`, CASCADE updates child foreign key values.

## 10. Real-World E-commerce Examples

Different relationships require different deletion strategies.

| Relationship                  | Possible action      | Reason                                            |
| ----------------------------- | -------------------- | ------------------------------------------------- |
| Customers → Orders            | RESTRICT / NO ACTION | Preserve order history                            |
| Orders → Order Items          | CASCADE              | Order items depend on the order                   |
| Products → Order Items        | RESTRICT / NO ACTION | Preserve historical purchase records              |
| Employees → Departments       | SET NULL             | Employee may remain without a department          |
| Users → Temporary Preferences | CASCADE              | Preferences may not need to survive user deletion |

These are design choices, not universal rules.

### Example: Orders and Order Items

```sql
CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL
        REFERENCES orders(order_id)
        ON DELETE CASCADE,
    product_id BIGINT NOT NULL
        REFERENCES products(product_id)
        ON DELETE RESTRICT,
    quantity INTEGER NOT NULL
);
```

Behaviour:

- Deleting an order deletes its order items.
- Deleting a product is prevented if an order item references it.
- This protects historical order details.

## 11. Changing Foreign Key Actions

To change an existing foreign key's action, drop and recreate the constraint.

```sql
ALTER TABLE employees
DROP CONSTRAINT fk_employee_department;
```

Recreate it:

```sql
ALTER TABLE employees
ADD CONSTRAINT fk_employee_department
FOREIGN KEY (department_id)
REFERENCES departments(department_id)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

**Important:** Dropping the foreign key temporarily removes referential integrity enforcement. In production, plan the migration carefully.

## 12. Deferrable Foreign Key Constraints

PostgreSQL allows certain constraints to be checked at transaction commit rather than immediately after each statement.

Example:

```sql
CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    department_id BIGINT,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        DEFERRABLE INITIALLY DEFERRED
);
```

- `DEFERRABLE`: Allows the constraint-checking time to be changed.
- `INITIALLY DEFERRED`: Checks the constraint at transaction commit by default.

You can change it inside a transaction:

```sql
BEGIN;

SET CONSTRAINTS fk_employee_department IMMEDIATE;

COMMIT;
```

Or defer it:

```sql
BEGIN;

SET CONSTRAINTS fk_employee_department DEFERRED;

COMMIT;
```

**Important:** Deferred constraints do not disable validation. Invalid references must still be corrected before commit.

## 13. Common Mistakes

1. Assuming CASCADE is the default delete behaviour.
2. Using CASCADE without understanding its impact on dependent records.
3. Using SET NULL on a NOT NULL column.
4. Using SET DEFAULT without ensuring the default references an existing parent.
5. Confusing ON DELETE CASCADE with ON UPDATE CASCADE.
6. Assuming RESTRICT and NO ACTION are always identical.
7. Assuming deleting a parent always deletes child records.
8. Forgetting to recreate a foreign key after dropping it to change its action.
9. Using CASCADE on historical business data that must be retained.

## 14. Practice Exercises

Use the `techbazaar` database.

1. Create departments and employees with ON DELETE RESTRICT.
2. Try deleting a department that has employees.
3. Recreate the foreign key using ON DELETE CASCADE and test deletion.
4. Create an employee relationship using ON DELETE SET NULL.
5. Test SET DEFAULT using an `Unassigned` department.
6. Create an ON UPDATE CASCADE relationship and update a department ID.
7. Compare RESTRICT and NO ACTION.
8. Create a DEFERRABLE INITIALLY DEFERRED foreign key.
9. Test an invalid reference inside a transaction and observe what happens at COMMIT.
10. Decide which delete action is appropriate for customers, orders, order items, and products.

## 15. Interview Questions

1. What is ON DELETE CASCADE?
2. What is the difference between RESTRICT and NO ACTION?
3. What is ON DELETE SET NULL?
4. When would you use ON DELETE SET DEFAULT?
5. What is ON UPDATE CASCADE?
6. What happens when you delete a parent record with a CASCADE foreign key?
7. Can SET NULL work on a NOT NULL column?
8. What happens if SET DEFAULT produces a value that does not exist in the parent table?
9. What is a DEFERRABLE constraint?
10. What is the difference between INITIALLY IMMEDIATE and INITIALLY DEFERRED?
11. Why should CASCADE be used carefully in production?
12. What deletion strategy would you choose for orders and order items?
