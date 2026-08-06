---
sidebar_label: "Part 6A — SQL String Functions"
sidebar_position: 1
---

# Part 6A — SQL String Functions

## 1. Introduction to String Functions

String functions are used to manipulate, analyze, search, and transform text values stored in database columns.

Common use cases:

- Convert names to uppercase or lowercase.
- Remove unwanted spaces.
- Extract part of a string.
- Search for text inside a column.
- Replace specific characters or words.
- Combine multiple strings.
- Validate and format user input.
- Normalize email addresses and phone numbers.

PostgreSQL provides several built-in string functions.

---

## 2. UPPER() — Convert to Uppercase

Converts all alphabetic characters into uppercase.

### Syntax

```sql
UPPER(string)
```

### Example

```sql
SELECT UPPER('techbazaar');
```

Result:

```text
TECHBAZAAR
```

### Practical example

```sql
SELECT
    customer_id,
    UPPER(customer_name) AS customer_name
FROM customers;
```

The original database values remain unchanged. UPPER() only transforms the query output.

---

## 3. LOWER() — Convert to Lowercase

Converts all alphabetic characters into lowercase.

### Syntax

```sql
LOWER(string)
```

### Example

```sql
SELECT LOWER('TECHBAZAAR');
```

Result:

```text
techbazaar
```

### Practical example: Normalize email addresses

```sql
SELECT
    customer_id,
    LOWER(email) AS normalized_email
FROM customers;
```

Useful when comparing email addresses without case differences:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = LOWER('USER@GMAIL.COM');
```

**Note:** LOWER() follows PostgreSQL's locale and collation-related case-conversion behaviour. It is not a universal Unicode normalization operation.

---

## 4. LENGTH() — Get String Length

Returns the number of characters in a string.

### Syntax

```sql
LENGTH(string)
```

### Example

```sql
SELECT LENGTH('PostgreSQL');
```

Result:

```text
10
```

### Practical example

```sql
SELECT
    customer_name,
    LENGTH(customer_name) AS name_length
FROM customers;
```

**Important PostgreSQL detail:**

- `LENGTH(text)` returns the number of characters, not bytes.
- `OCTET_LENGTH(text)` returns the number of bytes.

Example:

```sql
SELECT
    LENGTH('é') AS character_count,
    OCTET_LENGTH('é') AS byte_count;
```

With UTF-8 encoding, the result is typically:

| character_count | byte_count |
| --------------: | ---------: |
|               1 |          2 |

---

## 5. CHAR_LENGTH() — Character Count

Returns the number of characters in a string.

```sql
SELECT CHAR_LENGTH('PostgreSQL');
```

Result:

```text
10
```

In PostgreSQL, `CHAR_LENGTH()` and `LENGTH()` have the same meaning for text values.

---

## 6. CONCAT() — Combine Strings

Combines multiple strings into one string.

### Syntax

```sql
CONCAT(value1, value2, ...)
```

### Example

```sql
SELECT CONCAT('Tech', 'Bazaar');
```

Result:

```text
TechBazaar
```

### Practical example: Combine customer details

```sql
SELECT
    CONCAT(customer_name, ' - ', email) AS customer_details
FROM customers;
```

### Important NULL behaviour

PostgreSQL's `CONCAT()` ignores NULL arguments.

```sql
SELECT CONCAT('Hello', NULL, ' World');
```

Result:

```text
Hello World
```

---

## 7. CONCAT_WS() — Concatenate With a Separator

`CONCAT_WS()` means concatenate with separator.

### Syntax

```sql
CONCAT_WS(separator, value1, value2, ...)
```

### Example

```sql
SELECT CONCAT_WS(' ', 'Prashant', 'Sharma');
```

Result:

```text
Prashant Sharma
```

### Practical example

```sql
SELECT
    CONCAT_WS(' | ', customer_name, email, phone) AS customer_details
FROM customers;
```

Example output:

```text
Rahul | rahul@gmail.com | 9876543210
```

**Important:** CONCAT_WS() skips NULL values after the separator argument. It does not skip empty strings.

---

## 8. TRIM() — Remove Spaces

Removes specified characters from the beginning and end of a string.

By default, it removes spaces.

### Syntax

```sql
TRIM(string)
```

### Example

```sql
SELECT TRIM('   TechBazaar   ');
```

Result:

```text
TechBazaar
```

### Practical example

```sql
SELECT
    TRIM(customer_name) AS cleaned_name
FROM customers;
```

### Remove specific characters

```sql
SELECT TRIM(BOTH '*' FROM '***TechBazaar***');
```

Result:

```text
TechBazaar
```

---

## 9. LTRIM() — Remove Leading Characters

Removes characters from the beginning of a string.

```sql
SELECT LTRIM('   TechBazaar');
```

Result:

```text
TechBazaar
```

### Remove specific characters

```sql
SELECT LTRIM('00012345', '0');
```

Result:

```text
12345
```

---

## 10. RTRIM() — Remove Trailing Characters

Removes characters from the end of a string.

```sql
SELECT RTRIM('TechBazaar   ');
```

Result:

```text
TechBazaar
```

### Remove specific characters

```sql
SELECT RTRIM('TechBazaar****', '*');
```

Result:

```text
TechBazaar
```

---

## 11. SUBSTRING() — Extract Part of a String

Extracts a portion of a string.

### Syntax

```sql
SUBSTRING(string FROM start_position FOR length)
```

### Example

```sql
SELECT SUBSTRING('PostgreSQL' FROM 1 FOR 4);
```

Result:

```text
Post
```

Another syntax:

```sql
SELECT SUBSTRING('PostgreSQL', 1, 4);
```

Result:

```text
Post
```

### Practical example: Extract part of a phone number

```sql
SELECT
    phone,
    SUBSTRING(phone FROM 1 FOR 5) AS phone_prefix
FROM customers;
```

PostgreSQL string positions are 1-based.

---

## 12. LEFT() — Extract Characters From the Left

Returns a specified number of characters from the beginning.

### Syntax

```sql
LEFT(string, number_of_characters)
```

### Example

```sql
SELECT LEFT('PostgreSQL', 4);
```

Result:

```text
Post
```

### Practical example

```sql
SELECT
    customer_name,
    LEFT(customer_name, 3) AS name_prefix
FROM customers;
```

---

## 13. RIGHT() — Extract Characters From the Right

Returns a specified number of characters from the end.

### Syntax

```sql
RIGHT(string, number_of_characters)
```

### Example

```sql
SELECT RIGHT('PostgreSQL', 3);
```

Result:

```text
SQL
```

### Practical example: Last four digits of a phone number

```sql
SELECT
    phone,
    RIGHT(phone, 4) AS last_four_digits
FROM customers;
```

---

## 14. POSITION() — Find Character or Substring Position

Returns the starting position of a substring within a string.

Returns 0 if the substring is not found.

### Syntax

```sql
POSITION(substring IN string)
```

### Example

```sql
SELECT POSITION('SQL' IN 'PostgreSQL');
```

Result:

```text
8
```

### Practical example

```sql
SELECT
    email,
    POSITION('@' IN email) AS at_position
FROM customers;
```

---

## 15. STRPOS() — Find Substring Position

Another PostgreSQL function for finding the position of a substring.

### Syntax

```sql
STRPOS(string, substring)
```

### Example

```sql
SELECT STRPOS('PostgreSQL', 'SQL');
```

Result:

```text
8
```

`STRPOS()` and `POSITION()` return the same type of result.

---

## 16. REPLACE() — Replace Text

Replaces all occurrences of a specified substring with another substring.

### Syntax

```sql
REPLACE(string, old_substring, new_substring)
```

### Example

```sql
SELECT REPLACE('Hello World', 'World', 'PostgreSQL');
```

Result:

```text
Hello PostgreSQL
```

### Practical example

```sql
SELECT
    REPLACE(phone, '-', '') AS cleaned_phone
FROM customers;
```

This removes hyphens from phone numbers.

---

## 17. REVERSE() — Reverse a String

Returns a string with characters in reverse order.

```sql
SELECT REVERSE('PostgreSQL');
```

Result:

```text
LQSergtsoP
```

### Practical example

```sql
SELECT
    customer_name,
    REVERSE(customer_name) AS reversed_name
FROM customers;
```

---

## 18. REPEAT() — Repeat a String

Repeats a string a specified number of times.

### Syntax

```sql
REPEAT(string, number_of_times)
```

### Example

```sql
SELECT REPEAT('SQL ', 3);
```

Result:

```text
SQL SQL SQL
```

### Practical example

```sql
SELECT REPEAT('*', 10);
```

Result:

```text
**********
```

---

## 19. LPAD() — Left Padding

Adds characters to the beginning of a string until it reaches the specified length.

### Syntax

```sql
LPAD(string, target_length, padding_string)
```

### Example

```sql
SELECT LPAD('123', 6, '0');
```

Result:

```text
000123
```

### Practical example: Format employee IDs

```sql
SELECT
    employee_id,
    LPAD(employee_id::TEXT, 6, '0') AS formatted_employee_id
FROM employees;
```

Example:

| employee_id | formatted_employee_id |
| ----------: | --------------------- |
|           1 | 000001                |
|          25 | 000025                |
|         123 | 000123                |

**Important:** LPAD() returns text. It does not change the underlying employee ID.

If the original string is longer than the target length, PostgreSQL truncates it to the target length.

---

## 20. RPAD() — Right Padding

Adds characters to the end of a string until it reaches the specified length.

### Syntax

```sql
RPAD(string, target_length, padding_string)
```

### Example

```sql
SELECT RPAD('SQL', 6, '*');
```

Result:

```text
SQL***
```

### Practical example

```sql
SELECT RPAD(product_name, 20, '.')
FROM products;
```

---

## 21. INITCAP() — Capitalize Each Word

Converts the first letter of each word to uppercase and the remaining letters to lowercase.

```sql
SELECT INITCAP('hello techbazaar platform');
```

Result:

```text
Hello Techbazaar Platform
```

### Practical example

```sql
SELECT
    customer_name,
    INITCAP(customer_name) AS formatted_name
FROM customers;
```

Useful for basic display formatting.

**Note:** INITCAP() follows PostgreSQL's word-boundary and locale rules. It is not a complete personal-name formatting solution.

---

## 22. SPLIT_PART() — Split a String

Returns a specified field from a string separated by a delimiter.

### Syntax

```sql
SPLIT_PART(string, delimiter, field_number)
```

### Example

```sql
SELECT SPLIT_PART('rahul@gmail.com', '@', 1);
```

Result:

```text
rahul
```

Get the domain:

```sql
SELECT SPLIT_PART('rahul@gmail.com', '@', 2);
```

Result:

```text
gmail.com
```

### Practical example

```sql
SELECT
    email,
    SPLIT_PART(email, '@', 1) AS email_username,
    SPLIT_PART(email, '@', 2) AS email_domain
FROM customers;
```

**Important:** SPLIT_PART() uses 1-based field numbering. If the requested field does not exist, it returns an empty string.

---

## 23. STRING_AGG() — Combine Multiple Rows Into One String

`STRING_AGG()` is an aggregate function that combines values from multiple rows into one string.

### Syntax

```sql
STRING_AGG(expression, delimiter)
```

### Example

```sql
SELECT STRING_AGG(customer_name, ', ')
FROM customers;
```

Possible result:

```text
Rahul, Amit, Priya, Neha
```

### Practical example: Employees grouped by department

```sql
SELECT
    department_id,
    STRING_AGG(first_name, ', ' ORDER BY first_name) AS employees
FROM employees
GROUP BY department_id;
```

Example:

| department_id | employees   |
| ------------: | ----------- |
|             1 | Amit, Rahul |
|             2 | Neha, Priya |

**Important:**

- STRING_AGG() ignores NULL input values.
- Use ORDER BY inside STRING_AGG() when the concatenation order matters.
- It is an aggregate function, unlike CONCAT(), which combines values within one row.

---

## 24. REGEXP_REPLACE() — Replace Using Regular Expressions

Replaces text matching a regular expression.

### Syntax

```sql
REGEXP_REPLACE(string, pattern, replacement)
```

### Example: Remove non-numeric characters

```sql
SELECT REGEXP_REPLACE('987-654-3210', '[^0-9]', '', 'g');
```

Result:

```text
9876543210
```

The `g` flag means global replacement.

Without `g`, only the first match is replaced.

### Practical example: Clean phone numbers

```sql
SELECT
    phone,
    REGEXP_REPLACE(phone, '[^0-9]', '', 'g') AS cleaned_phone
FROM customers;
```

### Example: Replace multiple spaces with one space

```sql
SELECT REGEXP_REPLACE('Tech     Bazaar', '\s+', ' ', 'g');
```

Result:

```text
Tech Bazaar
```

---

## 25. REGEXP_MATCHES() — Extract Regex Matches

Returns matching portions of a string as a set of text arrays.

### Example

```sql
SELECT REGEXP_MATCHES(
    'Order ID: 12345',
    '[0-9]+'
);
```

Result:

```text
{12345}
```

### Practical example

```sql
SELECT
    REGEXP_MATCHES(
        'Contact: rahul@gmail.com',
        '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
    ) AS extracted_email;
```

This is useful for extracting text matching a pattern.

**Note:** Regex-based email extraction is not a complete email validation mechanism.

---

## 26. String Concatenation Operator (`||`)

PostgreSQL supports the `||` operator to concatenate strings.

### Example

```sql
SELECT 'Tech' || ' ' || 'Bazaar';
```

Result:

```text
Tech Bazaar
```

### Practical example

```sql
SELECT
    first_name || ' ' || last_name AS full_name
FROM employees;
```

**Important NULL behaviour:**

Unlike CONCAT(), the `||` operator returns NULL if either operand is NULL.

```sql
SELECT 'Hello' || NULL;
```

Result:

```text
NULL
```

To handle NULL values:

```sql
SELECT
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') AS full_name
FROM employees;
```

---

## 27. Common String Function Comparison

| Function         | Purpose                           |
| ---------------- | --------------------------------- |
| UPPER()          | Convert to uppercase              |
| LOWER()          | Convert to lowercase              |
| LENGTH()         | Count characters                  |
| CHAR_LENGTH()    | Count characters                  |
| OCTET_LENGTH()   | Count bytes                       |
| CONCAT()         | Combine strings                   |
| CONCAT_WS()      | Combine strings with separator    |
| TRIM()           | Remove characters from both ends  |
| LTRIM()          | Remove leading characters         |
| RTRIM()          | Remove trailing characters        |
| SUBSTRING()      | Extract part of a string          |
| LEFT()           | Extract from left                 |
| RIGHT()          | Extract from right                |
| POSITION()       | Find substring position           |
| STRPOS()         | Find substring position           |
| REPLACE()        | Replace text                      |
| REVERSE()        | Reverse string                    |
| REPEAT()         | Repeat string                     |
| LPAD()           | Add left padding                  |
| RPAD()           | Add right padding                 |
| INITCAP()        | Capitalize words                  |
| SPLIT_PART()     | Extract delimiter-separated field |
| STRING_AGG()     | Combine values across rows        |
| REGEXP_REPLACE() | Regex-based replacement           |
| REGEXP_MATCHES() | Extract regex matches             |

---

## 28. Important Performance Considerations

### 28.1 Functions in WHERE can prevent ordinary index usage

Suppose an index exists on `email`.

This query applies LOWER() to the column:

```sql
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@gmail.com';
```

A normal index on `email` may not support this expression efficiently.

One option is an expression index:

```sql
CREATE INDEX idx_customers_lower_email
ON customers (LOWER(email));
```

Now PostgreSQL can potentially use this index for matching expressions.

### 28.2 Avoid unnecessary transformations

Instead of repeatedly transforming values in application queries, consider storing normalized values when that is part of the data model.

However, do not blindly normalize every text field. Preserve original user-entered values when they matter.

### 28.3 Use EXPLAIN to inspect performance

```sql
EXPLAIN ANALYZE
SELECT *
FROM customers
WHERE LOWER(email) = 'rahul@gmail.com';
```

This helps inspect the actual query execution plan.

---

## 29. Practice Exercises

Use the TechBazaar database.

1. Display all customer names in uppercase.
2. Display all customer emails in lowercase.
3. Find the character length of every product name.
4. Display customer names after removing leading and trailing spaces.
5. Combine employee first and last names into one column.
6. Extract the first three characters of every product name.
7. Extract the last four digits of customer phone numbers.
8. Find the position of `@` in customer email addresses.
9. Replace hyphens in phone numbers with empty strings.
10. Format employee IDs with leading zeros using LPAD().
11. Extract the username and domain from customer emails.
12. Group employee names into one comma-separated string per department.
13. Remove all non-numeric characters from phone numbers using REGEXP_REPLACE().
14. Replace multiple consecutive spaces with a single space.
15. Find customers whose email contains `gmail.com`.
16. Display product names with a fixed-width padded format.
17. Compare CONCAT(), CONCAT_WS(), and `||` when values contain NULL.
18. Create an expression index on LOWER(email) and inspect its use with EXPLAIN ANALYZE.

---

## 30. Interview Questions

**Q1. What is the difference between LENGTH() and OCTET_LENGTH()?**

LENGTH() returns the character count for text. OCTET_LENGTH() returns the number of bytes.

**Q2. What is the difference between CONCAT() and `||`?**

CONCAT() ignores NULL arguments. The `||` operator returns NULL if either operand is NULL.

**Q3. What is the difference between TRIM(), LTRIM(), and RTRIM()?**

- TRIM(): Removes characters from both ends.
- LTRIM(): Removes characters from the beginning.
- RTRIM(): Removes characters from the end.

**Q4. What is the difference between LEFT() and SUBSTRING()?**

LEFT() extracts characters from the beginning. SUBSTRING() can extract from any specified starting position.

**Q5. What is SPLIT_PART() used for?**

It extracts a particular field from a delimiter-separated string.

**Q6. What is STRING_AGG()?**

It combines values from multiple rows into one string, usually with a separator.

**Q7. What is the purpose of REGEXP_REPLACE()?**

It replaces text matching a regular expression.

**Q8. What does the `g` flag mean in REGEXP_REPLACE()?**

It replaces all matches instead of only the first match.

**Q9. What is the difference between CONCAT() and CONCAT_WS()?**

CONCAT() combines values directly. CONCAT_WS() combines them using a specified separator and skips NULL values after the separator.

**Q10. How can you make a case-insensitive email comparison?**

```sql
SELECT *
FROM customers
WHERE LOWER(email) = LOWER('USER@GMAIL.COM');
```

**Q11. How can you improve performance when querying LOWER(email)?**

Create an expression index:

```sql
CREATE INDEX idx_customers_lower_email
ON customers (LOWER(email));
```

**Q12. Does a string function modify the original database value?**

No. A string function in SELECT transforms the returned expression. The stored value changes only when an appropriate data-modification statement is executed.

---

## Key Takeaways

- String functions manipulate and analyze text values.
- LOWER() and UPPER() handle case conversion.
- LENGTH() counts characters; OCTET_LENGTH() counts bytes.
- TRIM(), LTRIM(), and RTRIM() remove unwanted characters.
- SUBSTRING(), LEFT(), and RIGHT() extract portions of text.
- CONCAT(), CONCAT_WS(), and `||` combine strings with different NULL behaviour.
- REPLACE() and REGEXP_REPLACE() replace text.
- SPLIT_PART() extracts delimiter-separated values.
- STRING_AGG() combines values across multiple rows.
- Expression indexes can improve queries that filter using string expressions.
