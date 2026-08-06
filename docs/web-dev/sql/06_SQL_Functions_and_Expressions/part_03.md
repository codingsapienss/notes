---
sidebar_label: "SQL Date and Time Functions"
sidebar_position: 1
---

# SQL Date and Time Functions

## 1. Introduction to Date and Time Functions

Date and time functions are used to store, manipulate, calculate, format, and compare dates and timestamps.

Common backend use cases:

- Calculate order delivery dates.
- Find users registered within a date range.
- Calculate employee experience.
- Generate daily, monthly, and yearly reports.
- Track login and transaction timestamps.
- Calculate time differences.
- Filter records based on specific dates.
- Schedule events and expiration periods.

PostgreSQL provides several date and time data types and built-in functions.

---

## 2. PostgreSQL Date and Time Data Types

Before learning functions, understand the important date and time types.

| Data type   | Description                                                 | Example                     |
| ----------- | ----------------------------------------------------------- | --------------------------- |
| DATE        | Stores a calendar date                                      | `2026-11-16`                |
| TIME        | Stores time without date                                    | `14:30:00`                  |
| TIMESTAMP   | Stores date and time without time zone                      | `2026-11-16 14:30:00`       |
| TIMESTAMPTZ | Stores an instant in time with time-zone-aware input/output | `2026-11-16 14:30:00+05:30` |
| INTERVAL    | Stores a duration or time interval                          | `2 days 03:00:00`           |

### Example: Create a table

```sql
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100),
    event_date DATE,
    event_time TIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMPTZ
);
```

### Important: TIMESTAMP vs TIMESTAMPTZ

**TIMESTAMP**

- Stores date and time without time-zone information.
- PostgreSQL does not automatically convert it between time zones.

**TIMESTAMPTZ**

- Represents an absolute instant in time.
- PostgreSQL converts input to UTC internally.
- Output is displayed according to the current session time zone.
- It does not preserve the original time-zone name supplied during insertion.

For backend applications, TIMESTAMPTZ is generally preferable for event timestamps such as registrations, payments, and logins.

---

## 3. NOW() — Current Date and Time

Returns the current transaction start timestamp.

### Syntax

```sql
NOW()
```

### Example

```sql
SELECT NOW();
```

Possible result:

```text
2026-11-16 23:36:00+05:30
```

The displayed value depends on the session time zone.

### Practical example

```sql
SELECT
    order_id,
    total_amount,
    NOW() AS current_timestamp
FROM orders;
```

### Important PostgreSQL behaviour

`NOW()` is equivalent to `CURRENT_TIMESTAMP`.

It returns the start time of the current transaction, not a continuously changing clock value.

For an actual wall-clock reading that changes during statement execution, PostgreSQL provides:

```sql
SELECT CLOCK_TIMESTAMP();
```

Other related functions:

```sql
SELECT
    CURRENT_DATE,
    CURRENT_TIME,
    CURRENT_TIMESTAMP,
    LOCALTIME,
    LOCALTIMESTAMP;
```

| Function          | Returns                             |
| ----------------- | ----------------------------------- |
| CURRENT_DATE      | Current date                        |
| CURRENT_TIME      | Current time with time zone         |
| CURRENT_TIMESTAMP | Current timestamp with time zone    |
| LOCALTIME         | Current time without time zone      |
| LOCALTIMESTAMP    | Current timestamp without time zone |

---

## 4. CURRENT_DATE — Get Current Date

Returns the current date.

```sql
SELECT CURRENT_DATE;
```

Possible result:

```text
2026-11-16
```

### Practical example: Find today's orders

```sql
SELECT *
FROM orders
WHERE order_date::DATE = CURRENT_DATE;
```

**Performance note:** Applying a cast or function to an indexed timestamp column can prevent an ordinary index from being used efficiently.

For timestamp columns, prefer a range:

```sql
SELECT *
FROM orders
WHERE order_date >= CURRENT_DATE
  AND order_date < CURRENT_DATE + INTERVAL '1 day';
```

This is usually more index-friendly.

---

## 5. CURRENT_TIMESTAMP — Current Timestamp

Returns the current transaction timestamp with time-zone awareness.

```sql
SELECT CURRENT_TIMESTAMP;
```

It is equivalent to:

```sql
SELECT NOW();
```

### Practical example

```sql
INSERT INTO orders (
    customer_id,
    order_date,
    total_amount
)
VALUES (
    1,
    CURRENT_TIMESTAMP,
    2500
);
```

Use this when you want PostgreSQL to assign the current transaction timestamp.

---

## 6. AGE() — Calculate Age or Time Difference

Returns an interval representing the difference between two timestamps or dates.

### Syntax

```sql
AGE(timestamp1, timestamp2)
```

### Example

```sql
SELECT AGE(
    DATE '2026-11-16',
    DATE '2000-05-10'
);
```

Possible result:

```text
26 years 6 mons 6 days
```

### Calculate age using the current date

```sql
SELECT AGE(
    CURRENT_DATE,
    DATE '2000-05-10'
);
```

### Practical example: Employee experience

```sql
SELECT
    employee_id,
    first_name,
    AGE(CURRENT_DATE, joining_date) AS experience
FROM employees;
```

**Important:** AGE() returns a symbolic interval expressed in years, months, and days. It is not simply a count of elapsed seconds or days.

---

## 7. EXTRACT() — Extract Date and Time Components

Extracts a specific component from a date, timestamp, or interval.

### Syntax

```sql
EXTRACT(field FROM source)
```

### Example: Extract year

```sql
SELECT EXTRACT(YEAR FROM DATE '2026-11-16');
```

Result:

```text
2026
```

### Common fields

| Field   | Description                             |
| ------- | --------------------------------------- |
| YEAR    | Year                                    |
| MONTH   | Month                                   |
| DAY     | Day of month                            |
| HOUR    | Hour                                    |
| MINUTE  | Minute                                  |
| SECOND  | Second                                  |
| DOW     | Day of week (Sunday = 0)                |
| ISODOW  | ISO day of week (Monday = 1)            |
| DOY     | Day of year                             |
| WEEK    | ISO week number                         |
| QUARTER | Quarter                                 |
| EPOCH   | Seconds since Unix epoch for timestamps |

### Examples

```sql
SELECT
    EXTRACT(YEAR FROM CURRENT_DATE) AS current_year,
    EXTRACT(MONTH FROM CURRENT_DATE) AS current_month,
    EXTRACT(DAY FROM CURRENT_DATE) AS current_day;
```

Extract the hour:

```sql
SELECT EXTRACT(HOUR FROM TIME '14:35:45');
```

Result:

```text
14
```

### Practical example: Orders by year

```sql
SELECT
    EXTRACT(YEAR FROM order_date) AS order_year,
    COUNT(*) AS total_orders
FROM orders
GROUP BY EXTRACT(YEAR FROM order_date)
ORDER BY order_year;
```

**Note:** EXTRACT() returns a numeric value. In PostgreSQL, EXTRACT() returns `numeric`.

---

## 8. DATE_PART() — Extract Date Components

`DATE_PART()` provides functionality similar to EXTRACT().

### Syntax

```sql
DATE_PART('field', source)
```

### Example

```sql
SELECT DATE_PART('YEAR', CURRENT_DATE);
```

Result:

```text
2026
```

Another example:

```sql
SELECT DATE_PART('MONTH', CURRENT_DATE);
```

Result:

```text
11
```

### EXTRACT() vs DATE_PART()

| EXTRACT()                 | DATE_PART()               |
| ------------------------- | ------------------------- |
| SQL-standard syntax       | PostgreSQL function       |
| `EXTRACT(YEAR FROM date)` | `DATE_PART('year', date)` |
| Returns numeric           | Returns double precision  |

Prefer EXTRACT() when writing standard SQL-style queries.

---

## 9. DATE_TRUNC() — Truncate Date or Timestamp

Truncates a timestamp to a specified precision.

This is particularly useful for grouping records by day, month, quarter, or year.

### Syntax

```sql
DATE_TRUNC('precision', timestamp)
```

### Common precision values

- millennium
- century
- decade
- year
- quarter
- month
- week
- day
- hour
- minute
- second

### Example: Truncate to year

```sql
SELECT DATE_TRUNC(
    'year',
    TIMESTAMP '2026-11-16 14:35:45'
);
```

Result:

```text
2026-01-01 00:00:00
```

### Example: Truncate to month

```sql
SELECT DATE_TRUNC(
    'month',
    TIMESTAMP '2026-11-16 14:35:45'
);
```

Result:

```text
2026-11-01 00:00:00
```

### Example: Truncate to day

```sql
SELECT DATE_TRUNC(
    'day',
    TIMESTAMP '2026-11-16 14:35:45'
);
```

Result:

```text
2026-11-16 00:00:00
```

### Practical example: Monthly order report

```sql
SELECT
    DATE_TRUNC('month', order_date) AS order_month,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY order_month;
```

This groups orders into calendar months.

---

## 10. TO_CHAR() — Format Date and Time

Converts a date, timestamp, or numeric value into formatted text.

### Syntax

```sql
TO_CHAR(value, format)
```

### Example: Format date

```sql
SELECT TO_CHAR(
    CURRENT_DATE,
    'DD-MM-YYYY'
);
```

Possible result:

```text
16-11-2026
```

### Common date formatting patterns

| Pattern | Meaning             | Example  |
| ------- | ------------------- | -------- |
| YYYY    | Four-digit year     | 2026     |
| YY      | Two-digit year      | 26       |
| MM      | Month number        | 11       |
| Month   | Full month name     | November |
| Mon     | Abbreviated month   | Nov      |
| DD      | Day of month        | 16       |
| Day     | Full weekday name   | Monday   |
| Dy      | Abbreviated weekday | Mon      |
| HH24    | 24-hour format      | 14       |
| HH12    | 12-hour format      | 02       |
| MI      | Minutes             | 35       |
| SS      | Seconds             | 45       |
| AM      | AM/PM indicator     | PM       |

### Example: Format timestamp

```sql
SELECT TO_CHAR(
    NOW(),
    'DD Mon YYYY HH12:MI:SS AM'
);
```

Possible result:

```text
16 Nov 2026 11:36:00 PM
```

### Practical example: Format order dates

```sql
SELECT
    order_id,
    TO_CHAR(order_date, 'DD Mon YYYY') AS formatted_date
FROM orders;
```

**Important:** TO_CHAR() returns text, not a date or timestamp.

Use it for display formatting, not as the default method for date filtering or sorting.

---

## 11. TO_DATE() — Convert Text to Date

Converts a text value into a DATE using a specified format.

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

### Practical example

```sql
SELECT *
FROM orders
WHERE order_date >= TO_DATE('01-11-2026', 'DD-MM-YYYY');
```

**Important:** TO_DATE() converts text into DATE. It does not preserve time information.

PostgreSQL may normalize some out-of-range date fields depending on the input and format. Do not use TO_DATE() as a substitute for strict application-level date validation.

---

## 12. TO_TIMESTAMP() — Convert Text to Timestamp

Converts text into a timestamp with time-zone awareness using a specified format.

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

Result represents:

```text
2026-11-16 14:30:00
```

The displayed time-zone offset depends on the session time zone.

### Practical example

```sql
SELECT *
FROM orders
WHERE order_date >= TO_TIMESTAMP(
    '16-11-2026 00:00:00',
    'DD-MM-YYYY HH24:MI:SS'
);
```

**Important:** TO_TIMESTAMP() returns `TIMESTAMPTZ`. If the input text has no time-zone information, PostgreSQL interprets it using the session time zone.

For predictable application behaviour, define the time zone or pass a timestamp with an explicit offset.

---

## 13. INTERVAL — Add or Subtract Time

INTERVAL represents a duration or period of time.

It can be used to add or subtract time from dates and timestamps.

### Examples

```sql
SELECT CURRENT_DATE + INTERVAL '7 days';
```

```sql
SELECT NOW() + INTERVAL '2 hours';
```

```sql
SELECT NOW() - INTERVAL '30 minutes';
```

```sql
SELECT CURRENT_DATE + INTERVAL '3 months';
```

### Common interval units

| Unit    | Example                 |
| ------- | ----------------------- |
| Years   | `INTERVAL '1 year'`     |
| Months  | `INTERVAL '2 months'`   |
| Weeks   | `INTERVAL '2 weeks'`    |
| Days    | `INTERVAL '7 days'`     |
| Hours   | `INTERVAL '5 hours'`    |
| Minutes | `INTERVAL '30 minutes'` |
| Seconds | `INTERVAL '45 seconds'` |

### Practical example: Find orders from the last seven days

```sql
SELECT *
FROM orders
WHERE order_date >= NOW() - INTERVAL '7 days';
```

This returns orders from the previous seven days relative to the current transaction timestamp.

### Practical example: Calculate a delivery date

```sql
SELECT
    order_id,
    order_date,
    order_date + INTERVAL '5 days' AS expected_delivery
FROM orders;
```

**Important:** Calendar months and years are not fixed numbers of seconds. Adding one month to a date can produce different elapsed-day durations depending on the month.

---

## 14. EXTRACT(EPOCH FROM ...) — Convert Time Difference to Seconds

EPOCH extracts the number of seconds represented by a timestamp or interval relative to the Unix epoch.

### Example

```sql
SELECT EXTRACT(
    EPOCH FROM INTERVAL '2 hours'
);
```

Result:

```text
7200
```

### Calculate time difference in seconds

```sql
SELECT EXTRACT(
    EPOCH FROM (
        TIMESTAMP '2026-11-16 15:00:00'
        -
        TIMESTAMP '2026-11-16 14:00:00'
    )
);
```

Result:

```text
3600
```

### Practical example: Calculate order processing time

Suppose an orders table has `created_at` and `updated_at` timestamp columns.

```sql
SELECT
    order_id,
    EXTRACT(
        EPOCH FROM (updated_at - created_at)
    ) AS processing_seconds
FROM orders;
```

This calculates the elapsed time in seconds.

**Important:** For `TIMESTAMPTZ`, epoch represents elapsed time between absolute instants. For `TIMESTAMP` without time zone, epoch conversion uses the session time zone.

---

## 15. DATE Arithmetic

PostgreSQL supports direct arithmetic with dates.

### Add days

```sql
SELECT DATE '2026-11-16' + 7;
```

Result:

```text
2026-11-23
```

### Subtract days

```sql
SELECT DATE '2026-11-16' - 5;
```

Result:

```text
2026-11-11
```

### Difference between dates

```sql
SELECT DATE '2026-11-16' - DATE '2026-11-01';
```

Result:

```text
15
```

The result is an integer representing the number of days.

### Practical example: Employee joining duration

```sql
SELECT
    employee_id,
    first_name,
    CURRENT_DATE - joining_date AS days_employed
FROM employees;
```

This returns the number of calendar days between joining_date and the current date.

---

## 16. DATE_PART() and DATE_TRUNC() Comparison

These functions are often confused.

| DATE_PART() / EXTRACT()                          | DATE_TRUNC()                            |
| ------------------------------------------------ | --------------------------------------- |
| Extracts one component                           | Resets smaller components               |
| Returns a numeric value                          | Returns a date/time value               |
| Useful for filtering or reporting by a component | Useful for grouping by calendar periods |

Example:

```sql
SELECT EXTRACT(MONTH FROM NOW());
```

Result:

```text
11
```

```sql
SELECT DATE_TRUNC('month', NOW());
```

Result:

```text
2026-11-01 00:00:00+05:30
```

---

## 17. AT TIME ZONE — Time Zone Conversion

PostgreSQL provides `AT TIME ZONE` for converting between timestamps and time zones.

### Example 1: Interpret a local timestamp in a time zone

```sql
SELECT
    TIMESTAMP '2026-11-16 14:30:00'
    AT TIME ZONE 'Asia/Kolkata';
```

This treats the timestamp as 2:30 PM in India and returns the corresponding `TIMESTAMPTZ` instant.

### Example 2: Display a timestamp in another time zone

```sql
SELECT
    TIMESTAMPTZ '2026-11-16 14:30:00+05:30'
    AT TIME ZONE 'UTC';
```

This returns a timestamp without time zone representing the same instant in UTC.

### Important behaviour

| Input type  | `AT TIME ZONE` result |
| ----------- | --------------------- |
| TIMESTAMP   | TIMESTAMPTZ           |
| TIMESTAMPTZ | TIMESTAMP             |

### Practical example: Display UTC timestamp in India

```sql
SELECT
    created_at AT TIME ZONE 'Asia/Kolkata' AS india_time
FROM orders;
```

This is useful when an application stores event instants and needs to display them in a specific region.

---

## 18. Generate Date Series with GENERATE_SERIES()

PostgreSQL provides `GENERATE_SERIES()` to generate a sequence of values.

It can generate dates and timestamps using intervals.

### Example: Generate seven dates

```sql
SELECT GENERATE_SERIES(
    DATE '2026-11-01',
    DATE '2026-11-07',
    INTERVAL '1 day'
)::DATE AS calendar_date;
```

Result:

| calendar_date |
| ------------- |
| 2026-11-01    |
| 2026-11-02    |
| 2026-11-03    |
| 2026-11-04    |
| 2026-11-05    |
| 2026-11-06    |
| 2026-11-07    |

### Practical example: Daily order count including days with zero orders

```sql
SELECT
    calendar.day::DATE AS order_date,
    COUNT(orders.order_id) AS total_orders
FROM GENERATE_SERIES(
    DATE '2026-11-01',
    DATE '2026-11-07',
    INTERVAL '1 day'
) AS calendar(day)
LEFT JOIN orders
    ON orders.order_date >= calendar.day
   AND orders.order_date < calendar.day + INTERVAL '1 day'
GROUP BY calendar.day
ORDER BY calendar.day;
```

This produces one row per day, including days without orders.

**Important:** This example assumes `orders.order_date` is a timestamp column. If it is DATE, use a direct date equality comparison instead.

---

## 19. Date Filtering — Important Production Pattern

Date filtering is one of the most common SQL operations in backend systems.

### Incorrect or less efficient approach

```sql
SELECT *
FROM orders
WHERE DATE(order_date) = DATE '2026-11-16';
```

Applying a function to an indexed timestamp column can prevent a normal index on that column from being used efficiently.

### Better approach: Inclusive lower, exclusive upper bound

```sql
SELECT *
FROM orders
WHERE order_date >= TIMESTAMP '2026-11-16 00:00:00'
  AND order_date < TIMESTAMP '2026-11-17 00:00:00';
```

This pattern:

- Includes all times on November 16.
- Excludes midnight on November 17.
- Works regardless of fractional-second precision.
- Can use a normal B-tree index on `order_date`.

### Example: Monthly filtering

```sql
SELECT *
FROM orders
WHERE order_date >= TIMESTAMP '2026-11-01 00:00:00'
  AND order_date < TIMESTAMP '2026-12-01 00:00:00';
```

Use the appropriate timestamp type and time-zone boundaries for the column being queried.

---

## 20. Common Date and Time Mistakes

| Mistake                                           | Explanation                                                     |
| ------------------------------------------------- | --------------------------------------------------------------- |
| Confusing TIMESTAMP and TIMESTAMPTZ               | One has no time-zone semantics; the other represents an instant |
| Assuming NOW() changes continuously               | NOW() remains fixed at transaction start                        |
| Using TO_CHAR() for date filtering                | It converts the date into text                                  |
| Using `DATE(timestamp_column)` in indexed filters | May prevent efficient use of a normal index                     |
| Ignoring time zones                               | Can produce incorrect reporting boundaries                      |
| Assuming a month is always 30 days                | Calendar months have different lengths                          |
| Confusing AGE() with elapsed seconds              | AGE() returns a symbolic interval                               |
| Forgetting integer date subtraction               | DATE minus DATE returns an integer number of days               |
| Assuming TO_TIMESTAMP() preserves input zone      | It returns a TIMESTAMPTZ instant, not the original zone name    |
| Using inclusive end-of-day timestamps             | Can miss fractional-second values                               |

---

## 21. Practice Exercises

Use the TechBazaar database.

1. Display the current date and timestamp.
2. Display the current date, time, and transaction timestamp together.
3. Calculate employee experience using AGE().
4. Calculate the number of days each employee has worked.
5. Extract the year, month, and day from order dates.
6. Count orders grouped by year.
7. Count orders grouped by month using DATE_TRUNC().
8. Format order dates using TO_CHAR().
9. Convert a text date into DATE using TO_DATE().
10. Convert a text timestamp using TO_TIMESTAMP().
11. Find orders created during the last seven days.
12. Calculate expected delivery dates by adding five days to order dates.
13. Calculate processing duration in seconds using EXTRACT(EPOCH).
14. Convert a UTC timestamp to Asia/Kolkata time.
15. Generate a date series for an entire month.
16. Generate a daily order report that includes days with zero orders.
17. Retrieve all orders from a particular date using an inclusive lower and exclusive upper bound.
18. Retrieve all orders from a particular month using timestamp ranges.
19. Compare EXTRACT(), DATE_PART(), and DATE_TRUNC().
20. Demonstrate the difference between NOW() and CLOCK_TIMESTAMP() inside a transaction.

---

## 22. Interview Questions

**Q1. What is the difference between DATE, TIMESTAMP, and TIMESTAMPTZ?**

- DATE stores a calendar date.
- TIMESTAMP stores date and time without time-zone information.
- TIMESTAMPTZ represents an absolute instant and displays it according to the session time zone.

**Q2. What is the difference between NOW() and CLOCK_TIMESTAMP()?**

NOW() returns the transaction start timestamp. CLOCK_TIMESTAMP() returns the actual current wall-clock time and can change within a transaction.

**Q3. What is the purpose of AGE()?**

AGE() calculates a symbolic difference between dates or timestamps, expressed in years, months, and days.

**Q4. What is the difference between EXTRACT() and DATE_TRUNC()?**

EXTRACT() returns a component such as month or year. DATE_TRUNC() resets smaller components to create a period boundary.

**Q5. What does EXTRACT(EPOCH FROM ...) return?**

It returns the number of seconds represented by a timestamp or interval relative to the Unix epoch.

**Q6. What is the difference between TO_DATE() and TO_TIMESTAMP()?**

TO_DATE() converts text into DATE. TO_TIMESTAMP() converts text into TIMESTAMPTZ.

**Q7. What is INTERVAL?**

INTERVAL represents a duration or time period that can be added to or subtracted from dates and timestamps.

**Q8. Why should you avoid formatting dates using TO_CHAR() in WHERE conditions?**

It converts date values to text, often making comparisons less efficient and potentially preventing ordinary index usage.

**Q9. How do you filter records for an entire day efficiently?**

Use an inclusive lower bound and exclusive upper bound:

```sql
WHERE created_at >= TIMESTAMP '2026-11-16 00:00:00'
  AND created_at < TIMESTAMP '2026-11-17 00:00:00'
```

**Q10. Does TIMESTAMPTZ preserve the original time-zone name?**

No. PostgreSQL stores the instant, not the original zone name supplied with the input.

**Q11. What does AT TIME ZONE do?**

It interprets a timestamp in a specified time zone or converts a timestamp instant into a local timestamp for a specified zone.

**Q12. What is GENERATE_SERIES() used for?**

It generates a sequence of numbers, dates, or timestamps. It is useful for calendar reports and filling missing dates in reporting results.

---

## Key Takeaways

- PostgreSQL provides DATE, TIME, TIMESTAMP, TIMESTAMPTZ, and INTERVAL.
- TIMESTAMPTZ is generally preferable for storing real-world event instants.
- NOW() returns transaction start time; CLOCK_TIMESTAMP() returns actual wall-clock time.
- AGE() calculates symbolic date differences.
- EXTRACT() and DATE_PART() retrieve date/time components.
- DATE_TRUNC() is useful for grouping records by day, month, quarter, and year.
- TO_CHAR() formats date/time values as text.
- TO_DATE() and TO_TIMESTAMP() convert formatted text into date/time values.
- INTERVAL supports date and timestamp arithmetic.
- EXTRACT(EPOCH FROM ...) calculates elapsed seconds.
- AT TIME ZONE handles time-zone interpretation and conversion.
- GENERATE_SERIES() helps build calendar-based reports.
- For timestamp filtering, use inclusive lower and exclusive upper bounds to avoid precision and index-usage problems.
