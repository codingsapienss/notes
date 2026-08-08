---
sidebar_label: "INTERSECT and EXCEPT"
sidebar_position: 1
---

# INTERSECT and EXCEPT

## 1. Introduction

PostgreSQL provides two additional set operations for comparing SELECT result sets:

| Operator        | Purpose                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| `INTERSECT`     | Returns rows present in both result sets                                                |
| `INTERSECT ALL` | Returns common rows while preserving duplicate multiplicity                             |
| `EXCEPT`        | Returns rows present in the first result but not the second                             |
| `EXCEPT ALL`    | Returns rows from the first result after subtracting matching occurrences in the second |

These operations are useful for:

- Finding customers who satisfy multiple conditions.
- Identifying records missing from another dataset.
- Comparing two query results.
- Finding customers who purchased different product categories.
- Comparing old and new datasets.
- Data reconciliation and auditing.

---

## 2. INTERSECT

`INTERSECT` returns only the distinct rows that exist in both SELECT result sets.

### Syntax

```sql
SELECT column_name
FROM table1

INTERSECT

SELECT column_name
FROM table2;
```

### Example

Suppose:

**Table A — Customers with orders**

| customer_id |
| ----------: |
|         101 |
|         102 |
|         103 |
|         104 |

**Table B — Customers with successful payments**

| customer_id |
| ----------: |
|         102 |
|         103 |
|         105 |

Query:

```sql
SELECT customer_id
FROM orders

INTERSECT

SELECT customer_id
FROM payments;
```

Conceptually, the result is:

| customer_id |
| ----------: |
|         102 |
|         103 |

Only matching customer IDs are returned.

**Important:** INTERSECT removes duplicate rows by default.

---

## 3. Real-World Example — Customers Who Have Both Completed and Pending Orders

```sql
SELECT customer_id
FROM orders
WHERE status = 'completed'

INTERSECT

SELECT customer_id
FROM orders
WHERE status = 'pending';
```

This returns customers who have at least one completed order and at least one pending order.

The result contains each customer only once.

### Example output

| customer_id |
| ----------: |
|         101 |
|         105 |
|         110 |

A customer can have multiple orders with either status, but appears only once in the result.

---

## 4. INTERSECT with Multiple Columns

INTERSECT compares complete selected rows, not just individual columns.

### Example

```sql
SELECT
    customer_id,
    status
FROM orders
WHERE status = 'completed'

INTERSECT

SELECT
    customer_id,
    status
FROM orders
WHERE created_at >= TIMESTAMPTZ '2026-01-01 00:00:00+00';
```

A row is returned only when both its `customer_id` and `status` match in both result sets.

### Important

These two rows are different:

| customer_id | status    |
| ----------: | --------- |
|         101 | completed |
|         101 | pending   |

Even though the customer IDs match, the complete rows do not.

---

## 5. INTERSECT ALL

`INTERSECT ALL` preserves duplicate occurrences according to their frequency in both result sets.

### Example

First result:

| value |
| ----: |
|    10 |
|    10 |
|    20 |
|    30 |

Second result:

| value |
| ----: |
|    10 |
|    10 |
|    10 |
|    20 |
|    40 |

Query:

```sql
SELECT value
FROM table_a

INTERSECT ALL

SELECT value
FROM table_b;
```

Result:

| value |
| ----: |
|    10 |
|    10 |
|    20 |

### How does it work?

For each distinct row, PostgreSQL returns the smaller occurrence count from the two inputs.

| Value | Table A count | Table B count | INTERSECT ALL count |
| ----: | ------------: | ------------: | ------------------: |
|    10 |             2 |             3 |                   2 |
|    20 |             1 |             1 |                   1 |
|    30 |             1 |             0 |                   0 |
|    40 |             0 |             1 |                   0 |

Formula:

\[
\text{INTERSECT ALL count} = \min(A,B)
\]

Use INTERSECT ALL when duplicate occurrences are meaningful and must be preserved.

---

## 6. EXCEPT

`EXCEPT` returns distinct rows from the first SELECT that do not exist in the second SELECT.

### Syntax

```sql
SELECT column_name
FROM table1

EXCEPT

SELECT column_name
FROM table2;
```

### Example

First result:

| customer_id |
| ----------: |
|         101 |
|         102 |
|         103 |
|         104 |

Second result:

| customer_id |
| ----------: |
|         102 |
|         103 |

Query:

```sql
SELECT customer_id
FROM orders

EXCEPT

SELECT customer_id
FROM payments;
```

Conceptually, the result is:

| customer_id |
| ----------: |
|         101 |
|         104 |

These are customer IDs present in the first result but absent from the second.

**Important:** EXCEPT is directional. Reversing the SELECT statements changes the result.

---

## 7. Real-World Example — Customers Without Completed Orders

```sql
SELECT customer_id
FROM customers

EXCEPT

SELECT customer_id
FROM orders
WHERE status = 'completed';
```

This returns customers who do not have any completed order.

It includes customers who:

- Have no orders.
- Have only pending orders.
- Have only cancelled orders.
- Have other non-completed order statuses.

### Alternative using NOT EXISTS

```sql
SELECT c.customer_id
FROM customers c

WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
);
```

Both queries express the same business requirement, assuming the selected customer IDs are handled consistently.

---

## 8. EXCEPT ALL

`EXCEPT ALL` preserves duplicate occurrences from the first result after subtracting occurrences from the second result.

### Example

First result:

| value |
| ----: |
|    10 |
|    10 |
|    10 |
|    20 |
|    30 |

Second result:

| value |
| ----: |
|    10 |
|    10 |
|    20 |

Query:

```sql
SELECT value
FROM table_a

EXCEPT ALL

SELECT value
FROM table_b;
```

Result:

| value |
| ----: |
|    10 |
|    30 |

### How does it work?

For each distinct row, PostgreSQL subtracts the second result's occurrence count from the first, never returning a negative count.

| Value | Table A count | Table B count | EXCEPT ALL count |
| ----: | ------------: | ------------: | ---------------: |
|    10 |             3 |             2 |                1 |
|    20 |             1 |             1 |                0 |
|    30 |             1 |             0 |                1 |

Formula:

\[
\text{EXCEPT ALL count} = \max(A-B,0)
\]

---

## 9. INTERSECT vs EXCEPT

| INTERSECT                         | EXCEPT                                          |
| --------------------------------- | ----------------------------------------------- |
| Returns common rows               | Returns rows only from the first result         |
| Compares both result sets         | Performs directional difference                 |
| Removes duplicates by default     | Removes duplicates by default                   |
| Has ALL variant                   | Has ALL variant                                 |
| Useful for finding common records | Useful for finding missing or unmatched records |

### Example

```sql
SELECT customer_id
FROM orders

INTERSECT

SELECT customer_id
FROM payments;
```

Returns customer IDs present in both results.

```sql
SELECT customer_id
FROM orders

EXCEPT

SELECT customer_id
FROM payments;
```

Returns customer IDs present in orders but absent from payments.

---

## 10. Combining INTERSECT and EXCEPT

You can combine multiple set operations.

### Example: Customers with completed orders but no pending orders

```sql
(
    SELECT customer_id
    FROM orders
    WHERE status = 'completed'
)

EXCEPT

(
    SELECT customer_id
    FROM orders
    WHERE status = 'pending'
);
```

This returns customers who have completed orders but no pending orders.

### Example: Customers who have both completed and pending orders

```sql
(
    SELECT customer_id
    FROM orders
    WHERE status = 'completed'
)

INTERSECT

(
    SELECT customer_id
    FROM orders
    WHERE status = 'pending'
);
```

Parentheses make the intended grouping explicit, especially when combining multiple set operators.

---

## 11. INTERSECT and EXCEPT with CTEs

CTEs can make complex comparisons easier to understand.

### Example: Find customers with orders but no successful payments

```sql
WITH customers_with_orders AS (
    SELECT DISTINCT customer_id
    FROM orders
),

customers_with_successful_payments AS (
    SELECT DISTINCT o.customer_id
    FROM orders o

    JOIN payments p
        ON o.order_id = p.order_id

    WHERE p.payment_status = 'success'
)

SELECT customer_id
FROM customers_with_orders

EXCEPT

SELECT customer_id
FROM customers_with_successful_payments;
```

This returns customers who have placed orders but have no successful payment associated with any of their orders.

**Schema note:** This query assumes the successful payment status is stored as `'success'`. Use the exact status value defined by your application.

### Example: Find customers with both completed orders and successful payments

```sql
WITH completed_order_customers AS (
    SELECT customer_id
    FROM orders
    WHERE status = 'completed'
),

successful_payment_customers AS (
    SELECT o.customer_id
    FROM orders o

    JOIN payments p
        ON o.order_id = p.order_id

    WHERE p.payment_status = 'success'
)

SELECT customer_id
FROM completed_order_customers

INTERSECT

SELECT customer_id
FROM successful_payment_customers;
```

---

## 12. ORDER BY with INTERSECT and EXCEPT

You can sort the final result using ORDER BY.

```sql
SELECT customer_id
FROM orders

INTERSECT

SELECT customer_id
FROM payments

ORDER BY customer_id ASC;
```

Similarly:

```sql
SELECT customer_id
FROM orders

EXCEPT

SELECT customer_id
FROM payments

ORDER BY customer_id DESC;
```

ORDER BY applies to the final combined result.

As with UNION, use parentheses or subqueries when you need ordering or limiting to apply to an individual SELECT component.

---

## 13. NULL Handling

Set operations treat NULL values as equal for duplicate matching.

### Example: INTERSECT

```sql
SELECT NULL::INTEGER AS value

INTERSECT

SELECT NULL::INTEGER;
```

Result: one NULL row.

### Example: EXCEPT

```sql
SELECT NULL::INTEGER AS value

EXCEPT

SELECT 10::INTEGER;
```

Result: one NULL row.

### Important distinction

This behavior differs from ordinary equality comparison:

```sql
SELECT NULL = NULL;
```

Result: NULL, not TRUE.

Set operations use their own duplicate and row-matching semantics, under which NULL values in corresponding positions match.

---

## 14. INTERSECT / EXCEPT vs JOIN / NOT EXISTS

These operations can sometimes solve similar problems, but they are not interchangeable in every query.

### Find customers with completed orders

Using INTERSECT:

```sql
SELECT customer_id
FROM customers

INTERSECT

SELECT customer_id
FROM orders
WHERE status = 'completed';
```

Using EXISTS:

```sql
SELECT c.customer_id
FROM customers c

WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
);
```

### Find customers without completed orders

Using EXCEPT:

```sql
SELECT customer_id
FROM customers

EXCEPT

SELECT customer_id
FROM orders
WHERE status = 'completed';
```

Using NOT EXISTS:

```sql
SELECT c.customer_id
FROM customers c

WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
);
```

### Comparison

| Set operation | Alternative |
| ------------- | ----------- |
| INTERSECT     | EXISTS      |
| EXCEPT        | NOT EXISTS  |

**Performance:** Do not assume one is always faster. PostgreSQL's execution plan, indexes, data distribution and query structure determine performance.

---

## 15. Common Mistakes

| Mistake                                   | Correct understanding                                        |
| ----------------------------------------- | ------------------------------------------------------------ |
| Different column counts                   | All SELECT statements must return the same number of columns |
| Incompatible data types                   | Corresponding columns must have compatible types             |
| Assuming EXCEPT is symmetric              | EXCEPT returns rows from the first result only               |
| Assuming INTERSECT ALL removes duplicates | It preserves matching duplicate multiplicity                 |
| Assuming EXCEPT ALL behaves like EXCEPT   | EXCEPT ALL subtracts duplicate occurrences                   |
| Forgetting column order                   | Set operations match columns by position                     |
| Assuming result order is guaranteed       | Use final ORDER BY                                           |
| Confusing INTERSECT with JOIN             | INTERSECT combines matching rows; JOIN can combine columns   |
| Assuming NULL never matches NULL          | Set operations treat NULLs as matching for row comparison    |

---

## 16. Practice Exercises

Use the TechBazaar database.

1. Find customers who have placed both completed and pending orders.
2. Find customers who have placed orders but have no successful payments.
3. Find customers who have successful payments.
4. Find customers who have never placed an order.
5. Find customers who have placed completed orders but no cancelled orders.
6. Find products appearing in both a high-revenue product list and a low-stock product list. The low-stock list requires an inventory field; define it as a proposed schema extension if needed.
7. Compare two customer ID result sets using INTERSECT.
8. Compare two customer ID result sets using EXCEPT.
9. Demonstrate the difference between INTERSECT and INTERSECT ALL with duplicate rows.
10. Demonstrate the difference between EXCEPT and EXCEPT ALL with duplicate rows.
11. Combine INTERSECT and EXCEPT using parentheses.
12. Find customers who have both orders and payments using INTERSECT.
13. Find orders without corresponding payment records using EXCEPT.
14. Rewrite an INTERSECT query using EXISTS.
15. Rewrite an EXCEPT query using NOT EXISTS.
16. Explain how NULL values are handled by set operations.
17. Explain why EXCEPT is directional.
18. Compare EXPLAIN ANALYZE plans for INTERSECT and EXISTS on suitable datasets.

---

## 17. Interview Questions

**Q1. What is INTERSECT?**

INTERSECT returns distinct rows that exist in both SELECT result sets.

**Q2. What is EXCEPT?**

EXCEPT returns distinct rows from the first SELECT result that do not exist in the second.

**Q3. What is the difference between INTERSECT and INTERSECT ALL?**

INTERSECT removes duplicates. INTERSECT ALL preserves matching duplicate occurrences based on the minimum count in both results.

**Q4. What is the difference between EXCEPT and EXCEPT ALL?**

EXCEPT removes duplicates. EXCEPT ALL subtracts the occurrence count of the second result from the first.

**Q5. Is EXCEPT directional?**

Yes. Reversing the SELECT statements can change the result.

**Q6. Can INTERSECT and EXCEPT work with multiple columns?**

Yes. They compare complete rows, with matching column positions and compatible types.

**Q7. How are NULL values handled in INTERSECT?**

NULL values in corresponding positions are treated as matching during set-operation row comparison.

**Q8. What is the difference between INTERSECT and INNER JOIN?**

INTERSECT returns common selected rows. INNER JOIN combines columns from matching rows and can produce multiple combinations.

**Q9. What is the difference between EXCEPT and NOT EXISTS?**

Both can identify unmatched records. EXCEPT operates on complete result sets, whereas NOT EXISTS checks whether a correlated row exists.

**Q10. Can INTERSECT and EXCEPT be combined with UNION?**

Yes. Set operations can be combined, and parentheses can control grouping.

**Q11. Can ORDER BY be used with INTERSECT and EXCEPT?**

Yes. ORDER BY can sort the final combined result.

**Q12. Which is faster: INTERSECT or EXISTS?**

Neither is universally faster. Compare execution plans and actual performance for the specific workload.

---

## Key Takeaways

- INTERSECT returns rows common to both result sets.
- EXCEPT returns rows from the first result that are absent from the second.
- INTERSECT ALL preserves duplicate occurrences using the minimum count.
- EXCEPT ALL subtracts duplicate occurrences from the first result.
- EXCEPT is directional.
- Set operations compare complete rows, not just one column.
- Corresponding columns must have compatible data types and matching positions.
- NULL values are treated as matching during set-operation row comparison.
- INTERSECT can often be expressed using EXISTS.
- EXCEPT can often be expressed using NOT EXISTS.
- Use ORDER BY to guarantee final result ordering.
- Use EXPLAIN ANALYZE to evaluate performance rather than assuming one approach is faster.
