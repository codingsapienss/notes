---
sidebar_label: "Functions, Procedures and Triggers in PostgreSQL"
sidebar_position: 1
---

# Functions, Procedures and Triggers in PostgreSQL

## 1. Introduction

PostgreSQL allows you to execute reusable database logic using:

1. Functions
2. Stored Procedures
3. Triggers

These features help move certain business operations and data-processing logic closer to the database.

### Key differences

| Feature                 | Function                                 | Procedure                                              | Trigger                                        |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Purpose                 | Reusable computation or query logic      | Execute a sequence of database operations              | Automatically execute logic on database events |
| Invocation              | `SELECT` or SQL expression               | `CALL`                                                 | Automatically                                  |
| Returns value           | Yes, including `void`                    | No function-style return value; can use OUT parameters | Trigger functions return `trigger`             |
| Can return a result set | Yes                                      | Through OUT parameters or other mechanisms             | Not directly to the original caller            |
| Transaction control     | Cannot commit or roll back independently | Can control transactions in permitted contexts         | Cannot control transactions                    |
| Common use              | Calculations, reusable queries           | Multi-step operations                                  | Auditing, validation, automatic updates        |

---

# 2. PostgreSQL Functions

A function is a reusable block of SQL or procedural code that performs an operation and returns a value.

Functions can be written using different languages, including:

- SQL
- PL/pgSQL
- C
- Other installed procedural languages

For backend development, SQL and PL/pgSQL are the most important.

## 2.1 Basic Function Syntax

```sql
CREATE FUNCTION function_name(parameters)
RETURNS return_type
LANGUAGE plpgsql
AS $$
BEGIN
    -- Logic
    RETURN value;
END;
$$;
```

Important keywords:

| Keyword           | Purpose                               |
| ----------------- | ------------------------------------- |
| `CREATE FUNCTION` | Creates a function                    |
| `RETURNS`         | Defines the return type               |
| `LANGUAGE`        | Specifies the implementation language |
| `AS $$`           | Starts the function body              |
| `BEGIN`           | Starts the procedural block           |
| `RETURN`          | Returns a value                       |

## 2.2 Creating Your First Function

Create a function that adds two numbers.

```sql
CREATE FUNCTION add_numbers(
    a INTEGER,
    b INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN a + b;
END;
$$;
```

Call it:

```sql
SELECT add_numbers(10, 20);
```

Result:

```text
30
```

A function can be used directly inside SQL expressions:

```sql
SELECT
    add_numbers(100, 200) AS total;
```

## 2.3 Function Using SQL Language

For simple SQL expressions, you can use `LANGUAGE SQL`.

```sql
CREATE FUNCTION calculate_gst(
    amount NUMERIC,
    gst_percentage NUMERIC
)
RETURNS NUMERIC
LANGUAGE SQL
AS $$
    SELECT amount * gst_percentage / 100;
$$;
```

Call:

```sql
SELECT calculate_gst(1000, 18);
```

Result:

```text
180
```

Use SQL functions for straightforward SQL logic and PL/pgSQL when procedural logic is needed.

---

# 3. Function Parameters

PostgreSQL supports different parameter modes.

| Mode       | Meaning                                |
| ---------- | -------------------------------------- |
| `IN`       | Input parameter; default mode          |
| `OUT`      | Output parameter                       |
| `INOUT`    | Input and output parameter             |
| `VARIADIC` | Accepts a variable number of arguments |

## 3.1 IN Parameters

```sql
CREATE FUNCTION get_employee_salary(
    IN emp_id BIGINT
)
RETURNS NUMERIC
LANGUAGE SQL
AS $$
    SELECT salary
    FROM employees
    WHERE employee_id = emp_id;
$$;
```

Call:

```sql
SELECT get_employee_salary(1);
```

If no employee matches, the scalar SQL function returns NULL.

## 3.2 OUT Parameters

OUT parameters allow a function to return multiple values.

```sql
CREATE FUNCTION get_employee_details(
    IN emp_id BIGINT,
    OUT emp_name VARCHAR,
    OUT emp_salary NUMERIC
)
LANGUAGE SQL
AS $$
    SELECT
        employee_name,
        salary
    FROM employees
    WHERE employee_id = emp_id;
$$;
```

Call:

```sql
SELECT *
FROM get_employee_details(1);
```

The result contains two output columns.

If no employee matches, the function returns one row containing NULL output values.

## 3.3 INOUT Parameters

An INOUT parameter accepts an input value and returns an updated value.

```sql
CREATE FUNCTION increase_value(
    INOUT amount INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    amount := amount + 100;
END;
$$;
```

Call:

```sql
SELECT increase_value(500);
```

Result:

```text
600
```

## 3.4 VARIADIC Parameters

VARIADIC allows a function to accept a variable number of arguments.

```sql
CREATE FUNCTION calculate_total(
    VARIADIC amounts NUMERIC[]
)
RETURNS NUMERIC
LANGUAGE SQL
AS $$
    SELECT COALESCE(SUM(x), 0)
    FROM unnest(amounts) AS t(x);
$$;
```

Call:

```sql
SELECT calculate_total(100, 200, 300, 400);
```

Result:

```text
1000
```

---

# 4. Functions Returning Tables

A function can return multiple rows and columns.

Use `RETURNS TABLE`.

```sql
CREATE FUNCTION get_employees_by_department(
    dept_id INTEGER
)
RETURNS TABLE (
    employee_id BIGINT,
    employee_name VARCHAR,
    salary NUMERIC
)
LANGUAGE SQL
AS $$
    SELECT
        e.employee_id,
        e.employee_name,
        e.salary
    FROM employees e
    WHERE e.department_id = dept_id;
$$;
```

Call:

```sql
SELECT *
FROM get_employees_by_department(1);
```

You can also filter its output:

```sql
SELECT *
FROM get_employees_by_department(1)
WHERE salary > 50000;
```

### RETURNS TABLE vs RETURNS SETOF

- `RETURNS TABLE` explicitly defines the output column names and types.
- `RETURNS SETOF` returns a set of values or rows of a specified type.

Example:

```sql
CREATE FUNCTION get_all_employees()
RETURNS SETOF employees
LANGUAGE SQL
AS $$
    SELECT *
    FROM employees;
$$;
```

Call:

```sql
SELECT *
FROM get_all_employees();
```

---

# 5. PL/pgSQL Variables and Control Flow

PL/pgSQL supports variables, conditions and loops.

## 5.1 Declaring Variables

Use the `DECLARE` section.

```sql
CREATE FUNCTION calculate_employee_bonus(
    emp_id BIGINT
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    emp_salary NUMERIC;
    bonus NUMERIC;
BEGIN
    SELECT salary
    INTO emp_salary
    FROM employees
    WHERE employee_id = emp_id;

    bonus := emp_salary * 0.10;

    RETURN bonus;
END;
$$;
```

Call:

```sql
SELECT calculate_employee_bonus(1);
```

`SELECT ... INTO` assigns query results to variables in PL/pgSQL.

If the query returns no rows, the target variable is assigned NULL by default. If multiple rows are returned, PL/pgSQL assigns one row unless stricter handling is used.

## 5.2 IF / ELSE

```sql
CREATE FUNCTION employee_category(
    emp_salary NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF emp_salary >= 100000 THEN
        RETURN 'High Salary';

    ELSIF emp_salary >= 50000 THEN
        RETURN 'Medium Salary';

    ELSE
        RETURN 'Low Salary';
    END IF;
END;
$$;
```

Call:

```sql
SELECT employee_category(75000);
```

Result:

```text
Medium Salary
```

## 5.3 CASE Statement

```sql
CREATE FUNCTION get_order_category(
    order_amount NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    CASE
        WHEN order_amount >= 50000 THEN
            RETURN 'Premium';

        WHEN order_amount >= 10000 THEN
            RETURN 'Standard';

        ELSE
            RETURN 'Basic';
    END CASE;
END;
$$;
```

## 5.4 Loops

PL/pgSQL supports:

- LOOP
- WHILE
- FOR
- FOREACH

Example using FOR:

```sql
CREATE FUNCTION print_numbers()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..5 LOOP
        RAISE NOTICE 'Number: %', i;
    END LOOP;
END;
$$;
```

Call:

```sql
SELECT print_numbers();
```

`RAISE NOTICE` prints messages to the PostgreSQL client or application logs, depending on client configuration.

---

# 6. Working with Records and Rows

PL/pgSQL provides `RECORD` and `%ROWTYPE` for storing query results.

## 6.1 RECORD

A RECORD variable can hold a row whose structure is determined at runtime.

```sql
CREATE FUNCTION show_employee(
    emp_id BIGINT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    emp RECORD;
BEGIN
    SELECT *
    INTO emp
    FROM employees
    WHERE employee_id = emp_id;

    IF NOT FOUND THEN
        RETURN 'Employee not found';
    END IF;

    RETURN emp.employee_name;
END;
$$;
```

Call:

```sql
SELECT show_employee(1);
```

## 6.2 %ROWTYPE

`%ROWTYPE` declares a variable with the structure of a table row.

```sql
CREATE FUNCTION get_employee_name(
    emp_id BIGINT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    emp employees%ROWTYPE;
BEGIN
    SELECT *
    INTO emp
    FROM employees
    WHERE employee_id = emp_id;

    IF NOT FOUND THEN
        RETURN 'Employee not found';
    END IF;

    RETURN emp.employee_name;
END;
$$;
```

### RECORD vs %ROWTYPE

| RECORD                           | %ROWTYPE                                           |
| -------------------------------- | -------------------------------------------------- |
| Structure determined at runtime  | Structure based on a known table or composite type |
| Flexible                         | More strongly tied to a defined row structure      |
| Useful for dynamic query results | Useful for complete table rows                     |

---

# 7. Error Handling in Functions

PL/pgSQL supports exception handling using `EXCEPTION`.

```sql
CREATE FUNCTION safe_division(
    a NUMERIC,
    b NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN a / b;

EXCEPTION
    WHEN division_by_zero THEN
        RAISE NOTICE 'Cannot divide by zero';
        RETURN NULL;
END;
$$;
```

Call:

```sql
SELECT safe_division(100, 0);
```

### RAISE levels

| Level     | Purpose                |
| --------- | ---------------------- |
| DEBUG     | Debugging messages     |
| LOG       | Server log messages    |
| INFO      | Informational messages |
| NOTICE    | Notice messages        |
| WARNING   | Warning messages       |
| EXCEPTION | Raises an error        |

Example:

```sql
RAISE EXCEPTION 'Employee not found';
```

An exception normally aborts the current transaction unless handled by an enclosing exception block or caller.

### Important

Do not suppress every exception and return NULL.

That can hide genuine application failures. Handle only errors you can recover from meaningfully.

---

# 8. Function Attributes

PostgreSQL functions support attributes that describe their behavior.

Important attributes include:

### IMMUTABLE

The function always returns the same result for the same arguments and does not depend on database state or external changing data.

```sql
CREATE FUNCTION square_number(n INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT n * n;
$$;
```

### STABLE

The function returns consistent results for the same arguments within a single statement, but may return different results in later statements.

Example: a function that reads table data or uses the current transaction timestamp.

### VOLATILE

The function can change results even within a single statement or have side effects.

This is the default volatility category.

Example:

```sql
CREATE FUNCTION generate_random_number()
RETURNS DOUBLE PRECISION
LANGUAGE SQL
VOLATILE
AS $$
    SELECT random();
$$;
```

### Comparison

| Attribute | Behavior                                                    |
| --------- | ----------------------------------------------------------- |
| IMMUTABLE | Same inputs always produce the same output                  |
| STABLE    | Same inputs produce consistent results within one statement |
| VOLATILE  | Results or side effects may vary during execution           |

**Important:** Never mark a function IMMUTABLE simply to improve performance. Incorrect volatility declarations can produce incorrect results, especially with indexes and query optimization.

---

# 9. Stored Procedures

A stored procedure is a named database routine invoked using `CALL`.

Unlike functions, procedures do not have a function-style `RETURNS` clause.

Procedures are useful for multi-step operations, including:

- Processing batches.
- Administrative operations.
- Data migration tasks.
- Multi-step business workflows.
- Operations that need transaction control.

## 9.1 Basic Procedure Syntax

```sql
CREATE PROCEDURE procedure_name(parameters)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Operations
END;
$$;
```

## 9.2 Creating a Simple Procedure

```sql
CREATE PROCEDURE increase_employee_salary(
    emp_id BIGINT,
    increment_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE employees
    SET salary = salary + increment_amount
    WHERE employee_id = emp_id;
END;
$$;
```

Call:

```sql
CALL increase_employee_salary(1, 5000);
```

Check the result:

```sql
SELECT *
FROM employees
WHERE employee_id = 1;
```

## 9.3 Procedure with Multiple Operations

Suppose you want to update an employee's salary and record the operation in an audit table.

For this example, create a separate audit table:

```sql
CREATE TABLE salary_audit (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    old_salary NUMERIC,
    new_salary NUMERIC,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

Create the procedure:

```sql
CREATE PROCEDURE update_salary_with_audit(
    emp_id BIGINT,
    increment_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    old_amount NUMERIC;
    new_amount NUMERIC;
BEGIN
    SELECT salary
    INTO old_amount
    FROM employees
    WHERE employee_id = emp_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Employee not found';
    END IF;

    new_amount := old_amount + increment_amount;

    UPDATE employees
    SET salary = new_amount
    WHERE employee_id = emp_id;

    INSERT INTO salary_audit (
        employee_id,
        old_salary,
        new_salary
    )
    VALUES (
        emp_id,
        old_amount,
        new_amount
    );
END;
$$;
```

Call:

```sql
CALL update_salary_with_audit(1, 5000);
```

Both changes occur in the same transaction context. If an unhandled error occurs, the transaction can be rolled back.

---

# 10. Transaction Control Inside Procedures

One important difference between functions and procedures is transaction control.

A procedure can execute:

```sql
COMMIT;
```

or:

```sql
ROLLBACK;
```

under permitted invocation conditions.

Functions cannot independently commit or roll back transactions.

### Example procedure

```sql
CREATE PROCEDURE process_salary_batch()
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE employees
    SET salary = salary * 1.05
    WHERE status = 'active';

    COMMIT;
END;
$$;
```

Call it as a top-level command:

```sql
CALL process_salary_batch();
```

### Important restrictions

Transaction control is permitted only in specific procedure invocation contexts.

- The procedure must be called in a context that permits transaction control.
- A `CALL` executed inside an explicit transaction block cannot commit or roll back that surrounding transaction.
- Procedures called through certain nested invocation paths cannot freely control transactions.
- A procedure with a `SECURITY DEFINER` setting or a procedure-level `SET` clause has additional transaction-control restrictions.

For ordinary application transactions, it is usually better for the application to control `BEGIN`, `COMMIT` and `ROLLBACK` using the same database connection.

---

# 11. Functions vs Procedures

| Feature                         | Function                              | Procedure                           |
| ------------------------------- | ------------------------------------- | ----------------------------------- |
| Creation                        | `CREATE FUNCTION`                     | `CREATE PROCEDURE`                  |
| Execution                       | `SELECT function_name()`              | `CALL procedure_name()`             |
| Returns                         | Must specify a return type            | No function-style return type       |
| OUT parameters                  | Supported                             | Supported                           |
| Used in SELECT                  | Yes                                   | No                                  |
| Can return sets                 | Yes                                   | Not as a function-style result set  |
| Independent transaction control | No                                    | Yes, under permitted conditions     |
| Typical use                     | Calculations and reusable query logic | Multi-step operations and workflows |

### Practical decision

Use a function when you need a value or query result.

Use a procedure when you need to execute an operation or workflow.

---

# 12. Triggers

A trigger automatically executes when a specified database event occurs.

Unlike functions and procedures, you do not call a trigger directly.

A trigger is attached to a table, view or other supported database object.

Common trigger events:

- INSERT
- UPDATE
- DELETE
- TRUNCATE

### Real-world example

Whenever an employee's salary changes, automatically record the old and new salary in an audit table.

This is a good use case for a trigger.

---

# 13. Trigger Functions

PostgreSQL triggers execute trigger functions.

A trigger function:

- Must return the special `trigger` type.
- Uses PL/pgSQL or another supported procedural language.
- Can access trigger-specific variables such as `NEW` and `OLD`.

### Important trigger variables

| Variable          | Meaning                                               |
| ----------------- | ----------------------------------------------------- |
| `NEW`             | New row being inserted or updated                     |
| `OLD`             | Existing row being updated or deleted                 |
| `TG_OP`           | Trigger operation: INSERT, UPDATE, DELETE or TRUNCATE |
| `TG_TABLE_NAME`   | Table name                                            |
| `TG_TABLE_SCHEMA` | Schema name                                           |
| `TG_WHEN`         | BEFORE or AFTER                                       |
| `TG_LEVEL`        | ROW or STATEMENT                                      |

`NEW` and `OLD` are row-level trigger variables. They are not available in the same way for statement-level triggers.

---

# 14. Creating Your First Trigger

Create an audit table:

```sql
CREATE TABLE employee_audit (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT,
    old_salary NUMERIC,
    new_salary NUMERIC,
    operation VARCHAR(20),
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Step 1: Create the trigger function

```sql
CREATE FUNCTION log_employee_salary_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO employee_audit (
        employee_id,
        old_salary,
        new_salary,
        operation
    )
    VALUES (
        NEW.employee_id,
        OLD.salary,
        NEW.salary,
        TG_OP
    );

    RETURN NEW;
END;
$$;
```

### Step 2: Create the trigger

```sql
CREATE TRIGGER employee_salary_update_trigger
AFTER UPDATE OF salary
ON employees
FOR EACH ROW
WHEN (OLD.salary IS DISTINCT FROM NEW.salary)
EXECUTE FUNCTION log_employee_salary_change();
```

### Step 3: Update an employee

```sql
UPDATE employees
SET salary = salary + 5000
WHERE employee_id = 1;
```

### Step 4: Check audit records

```sql
SELECT *
FROM employee_audit;
```

The trigger automatically records the salary change.

**Important:** The trigger function and the original UPDATE execute within the same transaction. If the audit insert fails with an unhandled error, the original update also fails.

---

# 15. BEFORE vs AFTER Triggers

PostgreSQL supports different trigger timings.

| Trigger timing | Purpose                                  |
| -------------- | ---------------------------------------- |
| BEFORE         | Executes before the row operation        |
| AFTER          | Executes after the row operation         |
| INSTEAD OF     | Replaces the operation, mainly for views |

## 15.1 BEFORE Trigger

Useful for:

- Validating incoming values.
- Modifying values before insertion.
- Applying automatic transformations.

Example: automatically convert employee names to uppercase.

```sql
CREATE FUNCTION uppercase_employee_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.employee_name := UPPER(NEW.employee_name);

    RETURN NEW;
END;
$$;
```

Create trigger:

```sql
CREATE TRIGGER employee_name_uppercase_trigger
BEFORE INSERT OR UPDATE OF employee_name
ON employees
FOR EACH ROW
EXECUTE FUNCTION uppercase_employee_name();
```

Now:

```sql
INSERT INTO employees (
    employee_name,
    department_id,
    salary,
    status
)
VALUES (
    'rahul',
    1,
    40000,
    'active'
);
```

The stored name becomes:

```text
RAHUL
```

## 15.2 AFTER Trigger

Useful for:

- Audit logging.
- Recording changes.
- Maintaining related records.
- Triggering database-side workflows.

AFTER triggers cannot modify the row being inserted or updated through `NEW`. Their return value is ignored.

## 15.3 INSTEAD OF Trigger

Used mainly for views when you need custom logic for INSERT, UPDATE or DELETE operations.

Example:

```sql
CREATE VIEW employee_name_view AS
SELECT
    employee_id,
    employee_name
FROM employees;
```

Create a trigger function:

```sql
CREATE FUNCTION insert_employee_through_view()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO employees (
        employee_name
    )
    VALUES (
        NEW.employee_name
    )
    RETURNING employee_id INTO NEW.employee_id;

    RETURN NEW;
END;
$$;
```

Create the trigger:

```sql
CREATE TRIGGER employee_view_insert_trigger
INSTEAD OF INSERT
ON employee_name_view
FOR EACH ROW
EXECUTE FUNCTION insert_employee_through_view();
```

Now:

```sql
INSERT INTO employee_name_view (employee_name)
VALUES ('Amit');
```

The trigger performs the actual INSERT into `employees`.

The example assumes the other `employees` columns permit omission or have defaults.

---

# 16. ROW-Level vs STATEMENT-Level Triggers

PostgreSQL supports two trigger granularities.

### FOR EACH ROW

Executes once for every affected row.

```sql
CREATE TRIGGER employee_update_row_trigger
AFTER UPDATE
ON employees
FOR EACH ROW
EXECUTE FUNCTION log_employee_salary_change();
```

If an UPDATE affects 100 rows, the trigger function executes 100 times.

### FOR EACH STATEMENT

Executes once for the entire SQL statement, regardless of how many rows it affects.

```sql
CREATE FUNCTION log_employee_update_statement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE 'Employee table was updated';

    RETURN NULL;
END;
$$;
```

Create trigger:

```sql
CREATE TRIGGER employee_update_statement_trigger
AFTER UPDATE
ON employees
FOR EACH STATEMENT
EXECUTE FUNCTION log_employee_update_statement();
```

If one UPDATE changes 100 rows, this trigger executes once.

### Comparison

| Feature              | ROW                         | STATEMENT                              |
| -------------------- | --------------------------- | -------------------------------------- |
| Execution            | Per affected row            | Once per SQL statement                 |
| `NEW` / `OLD`        | Available where applicable  | Not directly available as a single row |
| Performance overhead | Can be higher for many rows | Usually lower execution count          |
| Common use           | Row validation and auditing | Statement-level logging                |

### Transition Tables

For supported AFTER triggers, PostgreSQL can expose sets of affected rows using transition tables:

- `OLD TABLE`
- `NEW TABLE`

Example:

```sql
CREATE FUNCTION log_bulk_employee_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO employee_audit (
        employee_id,
        old_salary,
        new_salary,
        operation
    )
    SELECT
        old_rows.employee_id,
        old_rows.salary,
        new_rows.salary,
        'UPDATE'
    FROM old_employee_rows old_rows
    JOIN new_employee_rows new_rows
        USING (employee_id);

    RETURN NULL;
END;
$$;
```

Create the trigger:

```sql
CREATE TRIGGER employee_bulk_update_trigger
AFTER UPDATE
ON employees
REFERENCING
    OLD TABLE AS old_employee_rows
    NEW TABLE AS new_employee_rows
FOR EACH STATEMENT
EXECUTE FUNCTION log_bulk_employee_update();
```

Transition tables are useful for processing all changed rows together.

They have restrictions, including limitations on combining transition tables with certain trigger event definitions.

---

# 17. Trigger Conditions

You can restrict when a trigger executes.

### UPDATE OF specific columns

```sql
CREATE TRIGGER salary_change_trigger
AFTER UPDATE OF salary
ON employees
FOR EACH ROW
EXECUTE FUNCTION log_employee_salary_change();
```

This trigger is considered when the UPDATE targets the `salary` column.

### WHEN condition

```sql
CREATE TRIGGER salary_increase_trigger
AFTER UPDATE OF salary
ON employees
FOR EACH ROW
WHEN (NEW.salary > OLD.salary)
EXECUTE FUNCTION log_employee_salary_change();
```

The trigger fires only when the new salary is greater than the old salary.

### NULL-safe comparison

```sql
OLD.salary IS DISTINCT FROM NEW.salary
```

This is generally safer than:

```sql
OLD.salary <> NEW.salary
```

because `IS DISTINCT FROM` handles NULL values as comparable values.

---

# 18. Trigger Execution Order

When multiple triggers of the same kind are defined for the same event, PostgreSQL executes them in alphabetical order by trigger name.

For example:

```text
employee_audit_trigger
employee_validation_trigger
employee_notification_trigger
```

The alphabetical order determines their execution sequence when their timing, event and level match.

Do not design critical workflows around confusing trigger chains. Keep trigger logic simple and explicit.

---

# 19. Dropping and Disabling Triggers

### Drop a trigger

```sql
DROP TRIGGER employee_salary_update_trigger
ON employees;
```

### Drop if it exists

```sql
DROP TRIGGER IF EXISTS employee_salary_update_trigger
ON employees;
```

### Disable a trigger

```sql
ALTER TABLE employees
DISABLE TRIGGER employee_salary_update_trigger;
```

### Enable a trigger

```sql
ALTER TABLE employees
ENABLE TRIGGER employee_salary_update_trigger;
```

### Disable all user triggers

```sql
ALTER TABLE employees
DISABLE TRIGGER USER;
```

### Enable all user triggers

```sql
ALTER TABLE employees
ENABLE TRIGGER USER;
```

**Important:** Disabling triggers can bypass application-level database logic. It should be done only with a clear operational reason and appropriate permissions.

---

# 20. Trigger vs Application-Level Logic

Suppose your Node.js application updates an employee salary.

You have two possible approaches.

### Option A: Handle audit logic in Node.js

```javascript
await client.query("BEGIN");

try {
  const result = await client.query(
    `UPDATE employees
         SET salary = salary + $1
         WHERE employee_id = $2
         RETURNING employee_id, salary`,
    [5000, 1],
  );

  // Insert audit record using returned values.

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
}
```

### Option B: Use a database trigger

Node.js executes only the UPDATE:

```javascript
await client.query(
  `UPDATE employees
     SET salary = salary + $1
     WHERE employee_id = $2`,
  [5000, 1],
);
```

The database trigger handles audit insertion automatically.

### Comparison

| Application logic                               | Database trigger                                          |
| ----------------------------------------------- | --------------------------------------------------------- |
| Logic visible in application code               | Logic stored in database                                  |
| Easier to test with application tooling         | Can enforce behavior across multiple applications         |
| Requires every write path to implement auditing | Automatically executes for applicable database operations |
| Easier to coordinate external services          | Better suited to database-local operations                |
| Can become duplicated across services           | Can make behavior less visible to developers              |

### Recommendation

Use application code for business workflows that need external services, APIs or complex orchestration.

Use database triggers for database-local rules that must apply regardless of which application performs the write.

---

# 21. Important Trigger Limitations and Best Practices

1. Triggers execute as part of the transaction that caused them.
2. An unhandled trigger error can fail the original SQL operation.
3. Avoid calling external APIs directly from triggers.
4. Avoid expensive queries and unnecessary loops inside triggers.
5. Be careful with recursive triggers that modify the same table.
6. Keep audit logic simple and predictable.
7. Use constraints for simple integrity rules whenever possible.
8. Remember that triggers can make application behavior less obvious.
9. Test bulk INSERT, UPDATE and DELETE operations.
10. Ensure the trigger's privileges and execution security are understood.

**Important:** A trigger is not automatically the best solution for every validation requirement. Prefer NOT NULL, UNIQUE, CHECK, FOREIGN KEY and exclusion constraints when they can enforce the rule directly.

---

# 22. Function, Procedure and Trigger: Complete Comparison

| Requirement                                      | Recommended feature  |
| ------------------------------------------------ | -------------------- |
| Calculate tax                                    | Function             |
| Return employee information                      | Function             |
| Return multiple employee rows                    | Function             |
| Execute a multi-step database operation          | Procedure            |
| Run a batch database operation                   | Procedure            |
| Commit between permitted procedure steps         | Procedure            |
| Automatically record salary changes              | Trigger              |
| Automatically normalize a value before insertion | BEFORE trigger       |
| Automatically audit deleted rows                 | AFTER DELETE trigger |
| Custom INSERT behavior through a view            | INSTEAD OF trigger   |

---

# 23. Common Mistakes

| Mistake                                             | Correct understanding                                       |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Calling a procedure using SELECT                    | Use `CALL`                                                  |
| Calling a function using CALL                       | Normally use `SELECT` or an SQL expression                  |
| Assuming a function can commit transactions         | Functions cannot independently control transactions         |
| Assuming every procedure can commit                 | Transaction control has invocation restrictions             |
| Forgetting RETURN in a trigger function             | Trigger functions must return an appropriate trigger result |
| Using NEW in a DELETE trigger                       | DELETE uses OLD; NEW is not available                       |
| Using OLD in an INSERT trigger                      | INSERT uses NEW; OLD is not available                       |
| Assuming AFTER triggers can modify NEW              | AFTER trigger return values are ignored                     |
| Assuming row triggers execute once per query        | They execute once per affected row                          |
| Assuming triggers run independently of transactions | They participate in the triggering transaction              |
| Using triggers for every business rule              | Prefer declarative constraints when appropriate             |
| Declaring a function IMMUTABLE incorrectly          | Volatility declarations must reflect actual behavior        |

---

# 24. Practice Exercises

Use the TechBazaar database.

### Functions

1. Create a function to calculate 18% GST on an amount.
2. Create a function to retrieve an employee's salary by ID.
3. Create a function that returns employees belonging to a department.
4. Create a function using INOUT to increase an amount by 10%.
5. Create a function to categorize orders by total amount.
6. Create a function using `RETURNS TABLE` to return customer order details.
7. Create a function that handles division by zero.
8. Create a function using `RECORD` or `%ROWTYPE`.
9. Create an IMMUTABLE function for a deterministic calculation.
10. Explain when a function should be STABLE or VOLATILE.

### Procedures

11. Create a procedure to increase all active employees' salaries by 5%.
12. Create a procedure to update an employee's salary.
13. Create an audit table for salary changes.
14. Create a procedure that updates salary and inserts an audit record.
15. Add error handling for an employee ID that does not exist.
16. Explain the difference between a procedure and a function.
17. Create a procedure that uses transaction control in an eligible invocation context.

### Triggers

18. Create an audit table for employee changes.
19. Create a trigger function for salary updates.
20. Create an AFTER UPDATE trigger.
21. Create a BEFORE INSERT trigger that converts names to uppercase.
22. Create a trigger that fires only when salary changes.
23. Create a statement-level trigger.
24. Compare row-level and statement-level triggers.
25. Use transition tables to process bulk updates.
26. Disable and re-enable a trigger.
27. Explain why database constraints are preferable for simple integrity rules.

---

# 25. Interview Questions

**Q1. What is a PostgreSQL function?**

A reusable database routine that accepts parameters and returns a value or set of rows.

**Q2. What is a stored procedure?**

A database routine invoked using `CALL`, commonly used for multi-step operations.

**Q3. What is the difference between a function and a procedure?**

Functions are used in SQL expressions and must have a return type. Procedures are invoked using `CALL` and can perform transaction control in permitted contexts.

**Q4. Can a function return multiple rows?**

Yes. Use `RETURNS TABLE` or `RETURNS SETOF`.

**Q5. What are IN, OUT and INOUT parameters?**

IN accepts input, OUT returns output, and INOUT accepts input and returns an updated value.

**Q6. What is PL/pgSQL?**

PostgreSQL's procedural language supporting variables, conditions, loops, exceptions and SQL execution.

**Q7. What is the difference between IMMUTABLE, STABLE and VOLATILE?**

They describe how a function's results can vary with the same arguments and execution context.

**Q8. What is a trigger?**

A database mechanism that automatically executes a trigger function when a specified event occurs.

**Q9. What is the difference between BEFORE and AFTER triggers?**

BEFORE triggers execute before the row operation and can modify NEW. AFTER triggers execute after the operation and are commonly used for auditing.

**Q10. What is an INSTEAD OF trigger?**

A trigger that replaces an operation, commonly used to implement custom writes through views.

**Q11. What is the difference between row-level and statement-level triggers?**

Row-level triggers execute for each affected row. Statement-level triggers execute once per SQL statement.

**Q12. What are NEW and OLD?**

NEW represents the new row for INSERT or UPDATE. OLD represents the existing row for UPDATE or DELETE.

**Q13. Can a trigger commit a transaction?**

No. Trigger functions cannot independently commit or roll back transactions.

**Q14. Can a trigger cause an UPDATE to fail?**

Yes. An unhandled error in a trigger can abort the statement and its transaction.

**Q15. Can PostgreSQL triggers be used for auditing?**

Yes. AFTER triggers are commonly used to record INSERT, UPDATE and DELETE operations.

**Q16. Should external API calls be performed inside triggers?**

Generally no. External operations can create reliability and transaction-consistency problems.

**Q17. What is RAISE EXCEPTION?**

It raises an error and aborts the current execution unless handled appropriately.

**Q18. What is the purpose of `SELECT ... INTO` in PL/pgSQL?**

It assigns a query result to a variable or row structure.

**Q19. What is the purpose of `FOUND`?**

It indicates whether the most recent relevant SQL statement affected or returned at least one row.

**Q20. When should you use a trigger instead of application logic?**

When a database-local action must execute consistently for all applicable writes, regardless of the application performing them.

---

## Key Takeaways

- Functions encapsulate reusable logic and return values or rows.
- Procedures execute database operations using `CALL`.
- Functions cannot independently commit or roll back transactions.
- Procedures can control transactions in permitted invocation contexts.
- PL/pgSQL supports variables, conditions, loops and exception handling.
- `RETURNS TABLE` allows functions to return multiple columns and rows.
- IMMUTABLE, STABLE and VOLATILE describe function behavior.
- Triggers automatically execute when configured database events occur.
- Trigger functions return the special `trigger` type.
- BEFORE triggers can modify `NEW`.
- AFTER triggers are useful for auditing.
- INSTEAD OF triggers support custom writes through views.
- ROW triggers execute per affected row; STATEMENT triggers execute once per statement.
- Database constraints should be preferred for straightforward integrity rules.
- Avoid unnecessary triggers and keep database-side logic predictable.
