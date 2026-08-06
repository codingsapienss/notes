---
sidebar_label: "Conditional and Conversion Functions"
sidebar_position: 1
---

# Conditional and Conversion Functions

## 1. Introduction

Conditional and conversion functions help SQL queries make decisions, handle NULL values, and convert data between different types.

Common use cases:

- Provide fallback values when database columns contain NULL.
- Prevent division-by-zero errors.
- Convert strings into numbers or dates.
- Handle different business conditions.
- Format and normalize query results.
- Safely compare values that may contain NULL.
- Convert API input values into database-compatible types.

Important PostgreSQL functions covered:

| Function       | Purpose                               |
| -------------- | ------------------------------------- |
| COALESCE()     | Return the first non-NULL value       |
| NULLIF()       | Return NULL when two values are equal |
| GREATEST()     | Return the largest value              |
| LEAST()        | Return the smallest value             |
| CAST()         | Convert one data type into another    |
| `::`           | PostgreSQL type-casting operator      |
| TO_CHAR()      | Convert values into formatted text    |
| TO_NUMBER()    | Convert formatted text into numeric   |
| TO_DATE()      | Convert text into DATE                |
| TO_TIMESTAMP() | Convert text into TIMESTAMPTZ         |
| CASE           | Conditional expression                |

---

## 2. COALESCE() — Return First Non-NULL Value

COALESCE() returns the first non-NULL expression from the supplied arguments.

### Syntax

```sql
COALESCE(value1, value2, value3, ...)
```

### Example

```sql
SELECT COALESCE(NULL, NULL, 'TechBazaar', 'SQL');
```

Result:

```text
TechBazaar
```

PostgreSQL checks values from left to right and returns the first non-NULL value.

### Practical example: Customer email

```sql
SELECT
    customer_id,
    customer_name,
    COALESCE(email, 'Email Not Available') AS email
FROM customers;
```

If email is NULL, the query displays `Email Not Available`.

### Multiple fallback values

```sql
SELECT
    COALESCE(
        email,
        phone,
        'No Contact Information'
    ) AS contact_information
FROM customers;
```

Priority:

1. Email.
2. Phone.
3. Default text.

### COALESCE() with calculations

```sql
SELECT
    product_name,
    price,
    COALESCE(price, 0) * 0.10 AS estimated_tax
FROM products;
```

If price is NULL, it is treated as zero for this calculation.

### Important points

- COALESCE() requires arguments that can be converted to a common data type.
- It returns the first non-NULL value.
- It can accept two or more arguments.
- It is part of standard SQL.
- PostgreSQL evaluates only as many arguments as needed to find the first non-NULL value.

---

## 3. NULLIF() — Convert Matching Values to NULL

NULLIF() compares two expressions.

If both are equal, it returns NULL. Otherwise, it returns the first expression.

### Syntax

```sql
NULLIF(value1, value2)
```

### Example

```sql
SELECT NULLIF(10, 10);
```

Result:

```text
NULL
```

Another example:

```sql
SELECT NULLIF(10, 20);
```

Result:

```text
10
```

### Practical example: Prevent division by zero

Incorrect:

```sql
SELECT 100 / 0;
```

This raises a division-by-zero error.

Correct:

```sql
SELECT 100 / NULLIF(0, 0);
```

Result:

```text
NULL
```

### Backend example: Calculate conversion rate

Suppose a campaign statistics table has `total_orders` and `total_visitors`.

```sql
SELECT
    total_orders,
    total_visitors,
    ROUND(
        total_orders::NUMERIC /
        NULLIF(total_visitors, 0) * 100,
        2
    ) AS conversion_rate
FROM campaign_stats;
```

If `total_visitors` is zero, NULLIF() returns NULL and prevents division by zero.

### NULLIF() with empty strings

```sql
SELECT NULLIF('', '');
```

Result:

```text
NULL
```

Useful for treating empty strings as missing values.

```sql
SELECT
    NULLIF(TRIM(email), '') AS cleaned_email
FROM customers;
```

This converts empty or whitespace-only email values into NULL.

**Important:** NULLIF() uses equality comparison. If either argument is NULL, the result is generally NULL.

---

## 4. COALESCE() vs NULLIF()

These functions solve opposite problems.

| COALESCE()                     | NULLIF()                           |
| ------------------------------ | ---------------------------------- |
| Finds the first non-NULL value | Compares two values                |
| Provides fallback values       | Converts matching values into NULL |
| Can accept multiple arguments  | Accepts exactly two arguments      |
| Commonly handles missing data  | Commonly prevents division by zero |

Example:

```sql
SELECT
    COALESCE(NULL, 100) AS fallback_value,
    NULLIF(100, 100) AS converted_null;
```

Result:

| fallback_value | converted_null |
| -------------: | -------------- |
|            100 | NULL           |

---

## 5. GREATEST() — Return Maximum Value

Returns the largest value from multiple expressions.

### Syntax

```sql
GREATEST(value1, value2, ...)
```

### Example

```sql
SELECT GREATEST(10, 50, 30, 20);
```

Result:

```text
50
```

### Practical example: Minimum charge

```sql
SELECT
    product_name,
    price,
    GREATEST(price, 1000) AS minimum_display_price
FROM products;
```

If price is below 1,000, the output is 1,000. Otherwise, the original price is returned.

### NULL behaviour in PostgreSQL

PostgreSQL ignores NULL arguments unless all arguments are NULL.

```sql
SELECT GREATEST(10, NULL, 30);
```

Result:

```text
30
```

This differs from some other database systems.

---

## 6. LEAST() — Return Minimum Value

Returns the smallest value from multiple expressions.

### Syntax

```sql
LEAST(value1, value2, ...)
```

### Example

```sql
SELECT LEAST(10, 50, 30, 20);
```

Result:

```text
10
```

### Practical example: Maximum discount limit

```sql
SELECT
    product_name,
    price,
    LEAST(price * 0.20, 5000) AS discount
FROM products;
```

The discount is 20% of the price, but cannot exceed 5,000.

### NULL behaviour

```sql
SELECT LEAST(10, NULL, 30);
```

Result:

```text
10
```

PostgreSQL ignores NULL arguments unless all arguments are NULL.

---

## 7. CAST() — Convert Data Types

CAST() converts a value from one data type to another.

### Syntax

```sql
CAST(expression AS target_data_type)
```

### Example: Integer to text

```sql
SELECT CAST(123 AS TEXT);
```

Result:

```text
123
```

### Example: Text to integer

```sql
SELECT CAST('500' AS INTEGER);
```

Result:

```text
500
```

### Example: Integer to decimal

```sql
SELECT CAST(10 AS NUMERIC) / 3;
```

Result:

```text
3.3333333333333333
```

### Example: Text to date

```sql
SELECT CAST('2026-11-16' AS DATE);
```

Result:

```text
2026-11-16
```

### Practical example: Convert a numeric string

```sql
SELECT
    CAST('2500.75' AS NUMERIC(10, 2)) AS amount;
```

Result:

```text
2500.75
```

### Common conversions

| Source    | Target  | Example                      |
| --------- | ------- | ---------------------------- |
| INTEGER   | TEXT    | `CAST(100 AS TEXT)`          |
| TEXT      | INTEGER | `CAST('100' AS INTEGER)`     |
| TEXT      | NUMERIC | `CAST('99.50' AS NUMERIC)`   |
| TEXT      | DATE    | `CAST('2026-11-16' AS DATE)` |
| TIMESTAMP | DATE    | `CAST(NOW() AS DATE)`        |
| NUMERIC   | INTEGER | `CAST(99.90 AS INTEGER)`     |

**Important:** Casting invalid text into a numeric or date type raises an error.

```sql
SELECT CAST('hello' AS INTEGER);
```

This fails because `hello` is not a valid integer representation.

---

## 8. PostgreSQL Type-Casting Operator (`::`)

PostgreSQL provides a shorter alternative to CAST().

### Syntax

```sql
expression::target_data_type
```

### Examples

```sql
SELECT '123'::INTEGER;
```

```sql
SELECT 100::TEXT;
```

```sql
SELECT '2026-11-16'::DATE;
```

```sql
SELECT 10::NUMERIC / 3;
```

### CAST() vs `::`

| CAST()                   | `::`                       |
| ------------------------ | -------------------------- |
| Standard SQL syntax      | PostgreSQL-specific syntax |
| More portable            | More concise               |
| `CAST(price AS NUMERIC)` | `price::NUMERIC`           |

Both perform type conversion.

---

## 9. TO_CHAR() — Convert Values to Formatted Text

TO_CHAR() converts numeric or date/time values into formatted text.

### Syntax

```sql
TO_CHAR(value, format)
```

### Example: Format a number

```sql
SELECT TO_CHAR(12345.678, '99,999.99');
```

Possible result:

```text
12,345.68
```

### Common numeric format patterns

| Pattern | Meaning                                |
| ------- | -------------------------------------- |
| 9       | Digit position, blank if insignificant |
| 0       | Digit position, zero-filled            |
| FM      | Remove padding spaces                  |
| D       | Locale-specific decimal separator      |
| G       | Locale-specific grouping separator     |
| L       | Currency symbol from locale            |
| S       | Sign position                          |

### Example: Zero padding

```sql
SELECT TO_CHAR(123, '000000');
```

Result:

```text
000123
```

### Example: Currency formatting

```sql
SELECT TO_CHAR(12500.50, 'FM$99,999.00');
```

Possible result:

```text
$12,500.50
```

### Practical example: Format order amounts

```sql
SELECT
    order_id,
    TO_CHAR(total_amount, 'FM99,999,999.00') AS formatted_amount
FROM orders;
```

**Important:** TO_CHAR() returns TEXT. Do not use the formatted result for numeric calculations or numeric sorting.

---

## 10. TO_NUMBER() — Convert Formatted Text to Numeric

Converts text containing formatted numeric data into a numeric value.

### Syntax

```sql
TO_NUMBER(text, format)
```

### Example

```sql
SELECT TO_NUMBER('12,500.50', '99,999.99');
```

Result:

```text
12500.50
```

### Example: Currency-like text

```sql
SELECT TO_NUMBER('$12,500.50', 'L99,999.99');
```

The `L` pattern represents a locale-specific currency symbol. The exact input must match the active locale's formatting expectations.

### Practical example

Suppose an imported dataset contains formatted price strings:

```sql
SELECT
    TO_NUMBER('25,999.50', '99,999.99') AS product_price;
```

Result:

```text
25999.50
```

**Important:** TO_NUMBER() expects a format pattern. For simple unformatted numeric strings, a direct cast is often sufficient:

```sql
SELECT '25999.50'::NUMERIC;
```

---

## 11. TO_DATE() — Convert Text to Date

Converts text into a DATE value using a specified format.

### Syntax

```sql
TO_DATE(text, format)
```

### Example

```sql
SELECT TO_DATE('16-11-2026', 'DD-MM-YYYY');
```

Result:

```text
2026-11-16
```

### Another example

```sql
SELECT TO_DATE('2026/11/16', 'YYYY/MM/DD');
```

Result:

```text
2026-11-16
```

### Common date format patterns

| Pattern | Meaning                |
| ------- | ---------------------- |
| YYYY    | Four-digit year        |
| YY      | Two-digit year         |
| MM      | Month number           |
| DD      | Day of month           |
| Mon     | Abbreviated month name |
| Month   | Full month name        |
| HH24    | 24-hour time           |
| MI      | Minutes                |
| SS      | Seconds                |

Example:

```sql
SELECT TO_DATE('2026-11-16', 'YYYY-MM-DD');
```

**Important:** TO_DATE() returns DATE, so it does not preserve time information.

---

## 12. TO_TIMESTAMP() — Convert Text to Timestamp

Converts text into a timestamp with time-zone awareness.

### Syntax

```sql
TO_TIMESTAMP(text, format)
```

### Example

```sql
SELECT TO_TIMESTAMP(
    '16-11-2026 14:30:00',
    'DD-MM-YYYY HH24:MI:SS'
);
```

This represents the instant corresponding to 2:30 PM in the current session time zone.

### Practical example

```sql
SELECT *
FROM orders
WHERE order_date >= TO_TIMESTAMP(
    '16-11-2026 00:00:00',
    'DD-MM-YYYY HH24:MI:SS'
);
```

**Important:** If the input text has no time-zone information, PostgreSQL interprets it using the session time zone.

---

## 13. CASE — Conditional Expression

CASE returns different values based on conditions.

### Syntax

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ELSE default_result
END
```

### Example: Product price classification

```sql
SELECT
    product_name,
    price,
    CASE
        WHEN price >= 50000 THEN 'Premium'
        WHEN price >= 10000 THEN 'Mid Range'
        ELSE 'Budget'
    END AS price_category
FROM products;
```

### Example: Employee status

```sql
SELECT
    employee_id,
    first_name,
    CASE
        WHEN status = 'active' THEN 'Currently Working'
        WHEN status = 'inactive' THEN 'Not Working'
        ELSE 'Unknown'
    END AS employment_status
FROM employees;
```

### CASE with NULL

```sql
SELECT
    customer_name,
    CASE
        WHEN email IS NULL THEN 'Email Missing'
        ELSE 'Email Available'
    END AS email_status
FROM customers;
```

Remember:

- CASE evaluates conditions in order.
- The first TRUE condition determines the result.
- Without ELSE, unmatched conditions return NULL.
- Result branches must resolve to a common data type.

---

## 14. NULL-Safe Comparisons

SQL uses three-valued logic:

- TRUE
- FALSE
- UNKNOWN

Comparisons involving NULL generally return UNKNOWN.

For example:

```sql
SELECT NULL = NULL;
```

Result:

```text
NULL
```

Use NULL-safe comparison operators when you need to compare values that might be NULL.

### IS DISTINCT FROM

Returns TRUE when two values are different, treating NULL as a comparable value.

```sql
SELECT
    NULL IS DISTINCT FROM NULL;
```

Result:

```text
FALSE
```

```sql
SELECT
    10 IS DISTINCT FROM NULL;
```

Result:

```text
TRUE
```

### IS NOT DISTINCT FROM

Returns TRUE when two values are equal, including when both are NULL.

```sql
SELECT
    NULL IS NOT DISTINCT FROM NULL;
```

Result:

```text
TRUE
```

```sql
SELECT
    10 IS NOT DISTINCT FROM 10;
```

Result:

```text
TRUE
```

### Comparison table

| Expression                       | Result |
| -------------------------------- | ------ |
| `NULL = NULL`                    | NULL   |
| `NULL <> NULL`                   | NULL   |
| `NULL IS DISTINCT FROM NULL`     | FALSE  |
| `NULL IS NOT DISTINCT FROM NULL` | TRUE   |
| `10 IS DISTINCT FROM NULL`       | TRUE   |
| `10 IS NOT DISTINCT FROM 10`     | TRUE   |

### Practical example

Find customers whose email differs from a supplied value, treating NULL as a real comparable state:

```sql
SELECT *
FROM customers
WHERE email IS DISTINCT FROM 'rahul@gmail.com';
```

This includes rows where email is NULL.

---

## 15. NULL Handling with COALESCE(), NULLIF(), and CASE

These functions are often combined in production queries.

### Example: Clean empty email values

```sql
SELECT
    customer_id,
    COALESCE(
        NULLIF(TRIM(email), ''),
        'Email Not Available'
    ) AS email
FROM customers;
```

Execution order:

1. TRIM() removes leading and trailing spaces.
2. NULLIF() converts an empty string into NULL.
3. COALESCE() replaces NULL with a fallback value.

### Example: Calculate average safely

```sql
SELECT
    total_orders,
    total_visitors,
    COALESCE(
        total_orders::NUMERIC /
        NULLIF(total_visitors, 0),
        0
    ) AS conversion_ratio
FROM campaign_stats;
```

This returns zero when the denominator is zero or the calculation produces NULL.

**Important:** Returning zero is a business decision. Sometimes NULL is more accurate because it indicates that the ratio could not be calculated.

---

## 16. Data Type Conversion in Real Backend Queries

When working with Node.js and PostgreSQL, application input often arrives as strings.

Example:

```javascript
const customerId = "101";
const amount = "2500.50";
```

PostgreSQL can convert parameter values explicitly:

```javascript
const result = await pool.query(
  `SELECT
         customer_id,
         total_amount
     FROM orders
     WHERE customer_id = $1::INTEGER
       AND total_amount >= $2::NUMERIC`,
  [customerId, amount],
);
```

### Important backend practices

- Use parameterized queries.
- Never concatenate untrusted user input into SQL.
- Validate input types in the application layer.
- Use explicit casts where they improve clarity.
- Do not assume every string can be safely converted to a number.
- Handle invalid input before executing the query when possible.

**Important:** SQL parameters represent values, not table names or column names.

---

## 17. Common Mistakes

| Mistake                                | Explanation                                                         |
| -------------------------------------- | ------------------------------------------------------------------- |
| Using `= NULL`                         | Use IS NULL or IS NOT DISTINCT FROM                                 |
| Using COALESCE() incorrectly           | It returns the first non-NULL value, not the first non-empty string |
| Ignoring empty strings                 | Empty string is not NULL                                            |
| Casting invalid text                   | Invalid conversions raise errors                                    |
| Using TO_CHAR() for calculations       | TO_CHAR() returns text                                              |
| Confusing TO_DATE() and TO_TIMESTAMP() | One returns DATE; the other returns TIMESTAMPTZ                     |
| Assuming NULLIF() always returns NULL  | It returns NULL only when its arguments compare equal               |
| Using CASE unnecessarily               | Prefer simpler expressions when possible                            |
| Ignoring type compatibility            | CASE and COALESCE arguments need compatible types                   |
| Assuming GREATEST() propagates NULL    | PostgreSQL ignores NULL arguments unless all are NULL               |

---

## 18. Practice Exercises

Use the TechBazaar database.

1. Display customer emails using COALESCE() with a fallback value.
2. Replace empty email strings with NULL using NULLIF().
3. Combine TRIM(), NULLIF(), and COALESCE() to clean customer emails.
4. Calculate conversion rates while preventing division by zero.
5. Find the maximum of three numeric values using GREATEST().
6. Find the minimum of three numeric values using LEAST().
7. Convert employee IDs into text using CAST().
8. Convert numeric strings into NUMERIC values.
9. Convert date strings into DATE values.
10. Convert timestamp strings into TIMESTAMPTZ values.
11. Format product prices using TO_CHAR().
12. Convert formatted price strings into numbers using TO_NUMBER().
13. Categorize products using CASE.
14. Compare NULL values using IS DISTINCT FROM.
15. Find customers whose email differs from a supplied value, including NULL emails.
16. Demonstrate the difference between NULL and an empty string.
17. Use COALESCE() to provide multiple fallback values.
18. Use NULLIF() to prevent division-by-zero errors in a reporting query.

---

## 19. Interview Questions

**Q1. What is COALESCE()?**

COALESCE() returns the first non-NULL value from its arguments.

**Q2. What is NULLIF()?**

NULLIF() returns NULL if two expressions are equal; otherwise, it returns the first expression.

**Q3. What is the difference between COALESCE() and NULLIF()?**

COALESCE() provides fallback values. NULLIF() converts matching values into NULL.

**Q4. What is the difference between CAST() and `::`?**

Both convert data types. CAST() is standard SQL syntax, while `::` is PostgreSQL-specific shorthand.

**Q5. What is the difference between TO_CHAR() and TO_NUMBER()?**

TO_CHAR() converts values into formatted text. TO_NUMBER() converts formatted text into numeric values.

**Q6. What is the difference between TO_DATE() and TO_TIMESTAMP()?**

TO_DATE() returns DATE. TO_TIMESTAMP() returns TIMESTAMPTZ.

**Q7. What is the difference between NULL and an empty string?**

NULL represents a missing or unknown value. An empty string is a valid text value containing zero characters.

**Q8. What is IS DISTINCT FROM?**

It compares two values while treating NULL as a comparable value rather than producing UNKNOWN.

**Q9. What is the difference between IS DISTINCT FROM and `<>`?**

`<>` produces UNKNOWN when either operand is NULL. IS DISTINCT FROM provides a definite TRUE or FALSE result.

**Q10. Does PostgreSQL GREATEST() return NULL if one argument is NULL?**

No. PostgreSQL ignores NULL arguments unless all arguments are NULL.

**Q11. Can COALESCE() accept multiple arguments?**

Yes. It returns the first non-NULL argument.

**Q12. Why is NULLIF() useful in backend development?**

It can prevent division-by-zero errors and normalize values such as empty strings into NULL.

---

## Key Takeaways

- COALESCE() returns the first non-NULL value.
- NULLIF() returns NULL when two expressions are equal.
- GREATEST() and LEAST() return maximum and minimum values.
- CAST() and `::` convert data types.
- TO_CHAR() formats values as text.
- TO_NUMBER() converts formatted text into numeric values.
- TO_DATE() converts text into DATE.
- TO_TIMESTAMP() converts text into TIMESTAMPTZ.
- CASE handles conditional logic.
- IS DISTINCT FROM and IS NOT DISTINCT FROM provide NULL-safe comparisons.
- NULL and empty strings are different values.
- Parameterized queries and explicit type validation are important in Node.js backend development.
