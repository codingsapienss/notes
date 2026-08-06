---
sidebar_label: "SQL Numeric and Mathematical Functions"
sidebar_position: 1
---

# SQL Numeric and Mathematical Functions

## 1. Introduction to Numeric Functions

Numeric functions perform mathematical operations on numeric values stored in database columns.

Common use cases:

- Calculate discounts and taxes.
- Round product prices.
- Calculate order totals.
- Find minimum and maximum values.
- Calculate percentages and averages.
- Generate random numbers.
- Calculate square roots and powers.
- Handle division and numeric precision.

PostgreSQL provides built-in mathematical functions and operators for these operations.

---

## 2. ABS() — Absolute Value

Returns the absolute, non-negative value of a number.

### Syntax

```sql
ABS(number)
```

### Example

```sql
SELECT ABS(-150);
```

Result:

```text
150
```

```sql
SELECT ABS(150);
```

Result:

```text
150
```

### Practical example

```sql
SELECT
    product_name,
    price,
    ABS(price - 10000) AS difference_from_10000
FROM products;
```

This calculates the absolute difference between each product price and 10,000.

---

## 3. ROUND() — Round a Number

Rounds a number to the nearest integer or a specified number of decimal places.

### Syntax

```sql
ROUND(number)
ROUND(number, decimal_places)
```

### Example: Round to integer

```sql
SELECT ROUND(125.678);
```

Result:

```text
126
```

### Example: Round to two decimal places

```sql
SELECT ROUND(125.678, 2);
```

Result:

```text
125.68
```

### Practical example: Calculate discounted price

```sql
SELECT
    product_name,
    price,
    ROUND(price * 0.90, 2) AS discounted_price
FROM products;
```

This calculates a 10% discount and rounds the result to two decimal places.

**Important PostgreSQL detail:**

- `ROUND(numeric, integer)` supports a specified number of decimal places.
- `ROUND(double precision)` supports rounding to an integer.
- `ROUND(double precision, integer)` is not available as a built-in overload. Cast to numeric if you need a specified number of decimal places.

---

## 4. CEIL() / CEILING() — Round Up

Returns the smallest integer greater than or equal to the input.

### Syntax

```sql
CEIL(number)
```

or

```sql
CEILING(number)
```

Both functions behave identically.

### Examples

```sql
SELECT CEIL(10.2);
```

Result:

```text
11
```

```sql
SELECT CEIL(10.9);
```

Result:

```text
11
```

```sql
SELECT CEIL(-10.2);
```

Result:

```text
-10
```

### Practical example

```sql
SELECT
    product_name,
    price,
    CEIL(price * 0.18) AS rounded_tax
FROM products;
```

This rounds the calculated tax upward to the next integer.

---

## 5. FLOOR() — Round Down

Returns the largest integer less than or equal to the input.

### Syntax

```sql
FLOOR(number)
```

### Examples

```sql
SELECT FLOOR(10.9);
```

Result:

```text
10
```

```sql
SELECT FLOOR(10.2);
```

Result:

```text
10
```

```sql
SELECT FLOOR(-10.2);
```

Result:

```text
-11
```

### Practical example

```sql
SELECT
    product_name,
    price,
    FLOOR(price * 0.90) AS discounted_price
FROM products;
```

---

## 6. TRUNC() — Truncate Decimal Places

Removes decimal digits without rounding.

### Syntax

```sql
TRUNC(number)
TRUNC(number, decimal_places)
```

### Example

```sql
SELECT TRUNC(125.678);
```

Result:

```text
125
```

### Truncate to two decimal places

```sql
SELECT TRUNC(125.678, 2);
```

Result:

```text
125.67
```

### Negative decimal places

```sql
SELECT TRUNC(12567.89, -2);
```

Result:

```text
12500
```

This truncates to the hundreds position.

### ROUND() vs TRUNC() vs FLOOR() vs CEIL()

| Function         |  Input | Result |
| ---------------- | -----: | -----: |
| ROUND()          | 10.678 |     11 |
| TRUNC()          | 10.678 |     10 |
| FLOOR()          | 10.678 |     10 |
| CEIL()           | 10.678 |     11 |
| ROUND(10.678, 2) | 10.678 |  10.68 |
| TRUNC(10.678, 2) | 10.678 |  10.67 |

**Important:** TRUNC() removes digits toward zero. FLOOR() rounds toward negative infinity. They differ for negative numbers.

---

## 7. MOD() — Modulus / Remainder

Returns the remainder after division.

### Syntax

```sql
MOD(dividend, divisor)
```

### Examples

```sql
SELECT MOD(10, 3);
```

Result:

```text
1
```

```sql
SELECT MOD(20, 5);
```

Result:

```text
0
```

### Practical example: Find even and odd employee IDs

```sql
SELECT
    employee_id,
    CASE
        WHEN MOD(employee_id, 2) = 0 THEN 'Even'
        ELSE 'Odd'
    END AS id_type
FROM employees;
```

---

## 8. POWER() — Exponentiation

Raises a number to a specified power.

### Syntax

```sql
POWER(base, exponent)
```

### Examples

```sql
SELECT POWER(2, 3);
```

Result:

```text
8
```

```sql
SELECT POWER(5, 2);
```

Result:

```text
25
```

### Practical example

```sql
SELECT POWER(1.10, 3);
```

Result:

```text
1.331
```

This represents the growth multiplier for 10% annual compound growth over three periods.

---

## 9. SQRT() — Square Root

Returns the square root of a number.

### Syntax

```sql
SQRT(number)
```

### Examples

```sql
SELECT SQRT(25);
```

Result:

```text
5
```

```sql
SELECT SQRT(144);
```

Result:

```text
12
```

**Important:** SQRT() requires a non-negative input. Negative inputs result in a domain error.

---

## 10. SIGN() — Determine Number Sign

Returns:

- `-1` for negative numbers.
- `0` for zero.
- `1` for positive numbers.

### Examples

```sql
SELECT SIGN(-100);
```

Result:

```text
-1
```

```sql
SELECT SIGN(0);
```

Result:

```text
0
```

```sql
SELECT SIGN(100);
```

Result:

```text
1
```

### Practical example

```sql
SELECT
    product_name,
    price - 10000 AS price_difference,
    SIGN(price - 10000) AS comparison_result
FROM products;
```

---

## 11. GREATEST() — Find the Largest Value

Returns the largest value from a list of expressions.

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

### Practical example

```sql
SELECT
    product_name,
    price,
    GREATEST(price, 1000) AS minimum_display_price
FROM products;
```

If the product price is below 1,000, the result is 1,000. Otherwise, the original price is returned.

**PostgreSQL NULL behaviour:** NULL arguments are ignored unless all arguments are NULL.

---

## 12. LEAST() — Find the Smallest Value

Returns the smallest value from a list of expressions.

### Example

```sql
SELECT LEAST(10, 50, 30, 20);
```

Result:

```text
10
```

### Practical example: Apply a maximum discount limit

```sql
SELECT
    product_name,
    price,
    LEAST(price * 0.20, 5000) AS discount
FROM products;
```

The discount is 20% of the price, capped at 5,000.

**PostgreSQL NULL behaviour:** NULL arguments are ignored unless all arguments are NULL.

---

## 13. DIV() — Integer Division

Returns the integer quotient of a division operation.

### Syntax

```sql
DIV(dividend, divisor)
```

### Example

```sql
SELECT DIV(10, 3);
```

Result:

```text
3
```

### Another example

```sql
SELECT DIV(25, 4);
```

Result:

```text
6
```

The fractional portion is discarded.

**Important:** Division by zero raises an error.

---

## 14. EXP() — Exponential Function

Returns Euler's number raised to the specified power.

\[
e^x
\]

### Syntax

```sql
EXP(number)
```

### Example

```sql
SELECT EXP(1);
```

Result is approximately:

```text
2.718281828
```

Another example:

```sql
SELECT EXP(2);
```

Returns approximately:

```text
7.389056099
```

Useful in mathematical and statistical calculations.

---

## 15. LN() and LOG() — Logarithmic Functions

### LN()

Returns the natural logarithm (base e).

```sql
SELECT LN(10);
```

### LOG()

Returns the base-10 logarithm.

```sql
SELECT LOG(100);
```

Result:

```text
2
```

### LOG() with custom base

PostgreSQL also supports:

```sql
SELECT LOG(2, 8);
```

Result:

```text
3
```

Because:

\[
2^3 = 8
\]

**Important:** Logarithms require positive inputs. Invalid domains result in errors.

---

## 16. PI() — Mathematical Constant

Returns the value of pi.

```sql
SELECT PI();
```

Result is approximately:

```text
3.141592653589793
```

### Practical example: Calculate circle area

```sql
SELECT
    PI() * POWER(5, 2) AS circle_area;
```

Result is approximately:

```text
78.5398163397
```

---

## 17. RANDOM() — Generate Random Numbers

Returns a random floating-point number greater than or equal to 0 and less than 1.

### Example

```sql
SELECT RANDOM();
```

Possible result:

```text
0.738291
```

### Generate a random integer between 1 and 100

```sql
SELECT FLOOR(RANDOM() * 100 + 1)::INT;
```

### Practical example: Select random products

```sql
SELECT *
FROM products
ORDER BY RANDOM()
LIMIT 5;
```

This returns five randomly ordered products.

**Performance warning:** `ORDER BY RANDOM()` can be expensive on large tables because PostgreSQL may need to generate and sort random values for many rows.

**Security warning:** RANDOM() is not cryptographically secure. Do not use it to generate passwords, authentication tokens, or security-sensitive identifiers.

---

## 18. Numeric Operators

PostgreSQL also supports mathematical operators.

| Operator | Meaning        | Example  |    Result |
| -------- | -------------- | -------- | --------: | --- | --- | ----- | --- |
| `+`      | Addition       | `10 + 5` |        15 |
| `-`      | Subtraction    | `10 - 5` |         5 |
| `*`      | Multiplication | `10 * 5` |        50 |
| `/`      | Division       | `10 / 5` |         2 |
| `%`      | Modulus        | `10 % 3` |         1 |
| `^`      | Exponentiation | `2 ^ 3`  |         8 |
| `\|/`    | Square root    | `\|/ 25` |         5 |
| `        |                | /`       | Cube root | `   |     | / 27` | 3   |

### Important: Integer division

PostgreSQL performs integer division when both operands are integers.

```sql
SELECT 10 / 3;
```

Result:

```text
3
```

To get a decimal result:

```sql
SELECT 10.0 / 3;
```

Result:

```text
3.3333333333333333
```

Or explicitly cast:

```sql
SELECT 10::NUMERIC / 3;
```

Result:

```text
3.3333333333333333
```

This distinction is important when calculating percentages and averages.

---

## 19. Numeric Data Types and Precision

PostgreSQL provides different numeric types.

| Data type        | Description           |
| ---------------- | --------------------- |
| SMALLINT         | 2-byte integer        |
| INTEGER          | 4-byte integer        |
| BIGINT           | 8-byte integer        |
| NUMERIC(p,s)     | Exact decimal numeric |
| DECIMAL(p,s)     | Equivalent to NUMERIC |
| REAL             | 4-byte floating-point |
| DOUBLE PRECISION | 8-byte floating-point |

### NUMERIC example

```sql
CREATE TABLE product_prices (
    product_id INT,
    price NUMERIC(10, 2)
);
```

`NUMERIC(10, 2)` means:

- Maximum 10 digits in total.
- Maximum 2 digits after the decimal point.
- Up to 8 digits before the decimal point.

Example:

```sql
INSERT INTO product_prices
VALUES (1, 12345678.99);
```

### Why NUMERIC for money?

For financial calculations, NUMERIC is generally preferable because it stores exact decimal values within its defined precision.

Floating-point types can introduce representation and rounding differences.

**Important:** NUMERIC does not automatically solve every financial rounding problem. Define your rounding rules explicitly.

---

## 20. Division by Zero Protection

Division by zero raises an error in PostgreSQL.

Incorrect:

```sql
SELECT 100 / 0;
```

Use `NULLIF()` to prevent division by zero.

```sql
SELECT 100 / NULLIF(0, 0);
```

Result:

```text
NULL
```

### Practical example: Calculate conversion rate

Suppose a campaign statistics table contains `total_orders` and `total_visitors`.

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

If `total_visitors` is zero, the conversion rate becomes NULL instead of causing a division error.

---

## 21. Conditional Numeric Calculations

Numeric functions are frequently combined with CASE.

### Example: Calculate shipping charges

```sql
SELECT
    order_id,
    total_amount,
    CASE
        WHEN total_amount >= 5000 THEN 0
        WHEN total_amount >= 2000 THEN 50
        ELSE 100
    END AS shipping_charge
FROM orders;
```

### Example: Calculate final amount

```sql
SELECT
    order_id,
    total_amount,
    CASE
        WHEN total_amount >= 5000 THEN total_amount
        WHEN total_amount >= 2000 THEN total_amount + 50
        ELSE total_amount + 100
    END AS final_amount
FROM orders;
```

These are calculated values. They do not update the stored order amounts.

---

## 22. Numeric Functions with Aggregate Functions

Numeric functions can be combined with aggregate functions.

### Average product price

```sql
SELECT ROUND(AVG(price), 2) AS average_price
FROM products;
```

### Highest and lowest product price

```sql
SELECT
    MAX(price) AS highest_price,
    MIN(price) AS lowest_price
FROM products;
```

### Total inventory quantity

If your inventory data is represented by a `quantity` column in `order_items`, this query calculates the total ordered quantity, not current stock:

```sql
SELECT SUM(quantity) AS total_ordered_quantity
FROM order_items;
```

### Calculate average order value

```sql
SELECT
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders;
```

---

## 23. Common Numeric Function Mistakes

| Mistake                                     | Explanation                                       |
| ------------------------------------------- | ------------------------------------------------- |
| Using integer division unintentionally      | Integer operands produce integer division         |
| Using ROUND() when truncation is required   | ROUND() changes the value based on rounding rules |
| Confusing FLOOR() and TRUNC()               | They behave differently for negative numbers      |
| Dividing by zero                            | Raises a runtime error                            |
| Using floating-point for financial values   | Can introduce precision differences               |
| Ignoring numeric precision                  | NUMERIC(p,s) has defined precision and scale      |
| Using RANDOM() for security tokens          | RANDOM() is not cryptographically secure          |
| Using ORDER BY RANDOM() on huge tables      | Can be expensive                                  |
| Assuming CEIL() always increases the number | Negative values may move closer to zero           |

---

## 24. Practice Exercises

Use the TechBazaar database.

1. Display the absolute difference between every product price and 10,000.
2. Round all product prices to two decimal places.
3. Calculate a 10% discount and round the final price.
4. Use CEIL() to round tax amounts upward.
5. Use FLOOR() to round product prices downward.
6. Compare ROUND() and TRUNC() using positive and negative numbers.
7. Find even and odd employee IDs using MOD().
8. Calculate the square of every product price using POWER().
9. Calculate the square root of positive numeric values.
10. Find the maximum and minimum values using GREATEST() and LEAST().
11. Generate a random integer between 1 and 100.
12. Select five random products.
13. Calculate the average product price rounded to two decimal places.
14. Calculate order conversion rates while preventing division by zero.
15. Demonstrate the difference between integer and decimal division.
16. Create a table using NUMERIC(10, 2) and insert sample prices.
17. Calculate shipping charges using CASE and numeric operations.
18. Calculate the average order value using AVG() and ROUND().

---

## 25. Interview Questions

**Q1. What is the difference between ROUND() and TRUNC()?**

ROUND() rounds a number. TRUNC() removes decimal digits without rounding.

**Q2. What is the difference between FLOOR() and CEIL()?**

FLOOR() returns the largest integer less than or equal to the number. CEIL() returns the smallest integer greater than or equal to it.

**Q3. What does MOD() do?**

It returns the remainder after division.

**Q4. What is the difference between INTEGER and NUMERIC?**

INTEGER stores whole numbers. NUMERIC stores exact decimal values with configurable precision and scale.

**Q5. Why should NUMERIC be preferred for financial calculations?**

It provides exact decimal arithmetic within its defined precision, avoiding common binary floating-point representation issues.

**Q6. What happens when you divide two integers in PostgreSQL?**

PostgreSQL performs integer division and discards the fractional portion.

**Q7. How can you prevent division by zero?**

Use NULLIF():

```sql
SELECT amount / NULLIF(quantity, 0);
```

**Q8. What does RANDOM() return?**

A random floating-point number in the range `[0, 1)`.

**Q9. What is the difference between ABS() and SIGN()?**

ABS() returns the non-negative magnitude. SIGN() identifies whether a number is negative, zero, or positive.

**Q10. What is the purpose of GREATEST() and LEAST()?**

GREATEST() returns the largest expression value, while LEAST() returns the smallest.

**Q11. What does POWER() do?**

It raises a number to a specified exponent.

**Q12. Why can ORDER BY RANDOM() be inefficient?**

PostgreSQL may need to calculate random values and sort a large number of rows before returning the requested results.

---

## Key Takeaways

- ABS() returns absolute values.
- ROUND() rounds; TRUNC() removes decimal digits without rounding.
- CEIL() rounds toward positive infinity; FLOOR() rounds toward negative infinity.
- MOD() calculates remainders.
- POWER() and SQRT() perform exponentiation and square-root calculations.
- GREATEST() and LEAST() compare multiple values.
- RANDOM() generates pseudo-random values.
- PostgreSQL performs integer division when both operands are integers.
- NUMERIC is generally preferable for financial calculations requiring exact decimal arithmetic.
- Use NULLIF() to protect division operations from zero denominators.
- Combine numeric functions with CASE and aggregate functions for real-world calculations.
