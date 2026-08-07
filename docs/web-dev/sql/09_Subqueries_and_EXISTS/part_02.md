---
sidebar_label: "Subquery Operators"
sidebar_position: 1
---

# Subquery Operators

## 1. Introduction

Subquery operators allow an outer query to compare values against the results returned by an inner query.

The most important operators are:

| Operator     | Purpose                                                            |
| ------------ | ------------------------------------------------------------------ |
| `IN`         | Checks whether a value matches any value in a result set           |
| `NOT IN`     | Checks whether a value does not match any value in a result set    |
| `ANY`        | Compares a value against at least one value returned by a subquery |
| `SOME`       | Synonym for ANY                                                    |
| `ALL`        | Compares a value against every value returned by a subquery        |
| `EXISTS`     | Checks whether a subquery returns at least one row                 |
| `NOT EXISTS` | Checks whether a subquery returns no rows                          |

---

## 2. IN Operator

`IN` checks whether a value matches any value returned by a subquery.

### Syntax

```sql
SELECT columns
FROM table_name
WHERE column_name IN (
    SELECT column_name
    FROM another_table
);
```

### Example: Employees belonging to existing departments

```sql
SELECT
    employee_id,
    employee_name,
    department_id
FROM employees
WHERE department_id IN (
    SELECT department_id
    FROM departments
);
```

The inner query returns department IDs.

The outer query returns employees whose department ID matches one of those IDs.

### Example: Customers who have placed orders

```sql
SELECT
    customer_id,
    customer_name
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
);
```

### IN with multiple values

`IN` can also use a manually supplied list:

```sql
SELECT *
FROM employees
WHERE status IN ('active', 'on_leave');
```

**Important:** IN is useful when a subquery can return multiple rows.

---

## 3. NOT IN Operator

`NOT IN` checks whether a value does not match any value returned by a subquery.

### Example: Customers who have never placed orders

```sql
SELECT
    customer_id,
    customer_name
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
);
```

This returns customers whose IDs do not appear in the orders table, provided the subquery does not introduce problematic NULL values.

### The NULL problem with NOT IN

Consider:

```sql
SELECT *
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id
    FROM orders
);
```

Suppose the subquery returns:

| customer_id |
| ----------: |
|         101 |
|         102 |
|        NULL |

For a customer with ID 103, PostgreSQL evaluates:

```sql
103 NOT IN (101, 102, NULL)
```

Conceptually, this becomes:

```sql
103 <> 101
AND 103 <> 102
AND 103 <> NULL
```

The first two comparisons are TRUE.

The third comparison is UNKNOWN.

Therefore:

```text
TRUE AND TRUE AND UNKNOWN = UNKNOWN
```

WHERE retains only TRUE rows, so customer 103 is not returned.

### Safer alternative: NOT EXISTS

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

This avoids the NULL problem associated with NOT IN.

**Recommendation:** Prefer NOT EXISTS for anti-join checks, especially when the subquery's result may contain NULL.

---

## 4. ANY Operator

`ANY` compares a value against the results returned by a subquery.

The condition becomes TRUE if at least one comparison is TRUE.

### Syntax

```sql
SELECT *
FROM table_name
WHERE column_name operator ANY (
    SELECT column_name
    FROM another_table
);
```

### Example: Products more expensive than at least one product in category 1

```sql
SELECT
    product_id,
    product_name,
    price
FROM products
WHERE price > ANY (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

Suppose category 1 contains these prices:

| price |
| ----: |
|   500 |
|  1000 |
|  1500 |

The condition is equivalent to:

```sql
price > 500
OR price > 1000
OR price > 1500
```

A product priced at 800 satisfies the condition because it is more expensive than at least one category 1 product.

### ANY with different operators

```sql
-- Greater than at least one value
WHERE salary > ANY (subquery);

-- Less than at least one value
WHERE salary < ANY (subquery);

-- Equal to at least one value
WHERE salary = ANY (subquery);
```

`= ANY (subquery)` is equivalent to `IN (subquery)` for ordinary equality comparisons, including their NULL-related behavior.

---

## 5. SOME Operator

`SOME` is a synonym for `ANY`.

Both operators have identical behavior.

```sql
SELECT *
FROM products
WHERE price > SOME (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

This is equivalent to:

```sql
SELECT *
FROM products
WHERE price > ANY (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

You will encounter ANY more frequently, but you should recognize SOME in SQL queries.

---

## 6. ALL Operator

`ALL` requires the comparison to be TRUE for every value returned by the subquery.

### Example: Products more expensive than every product in category 1

```sql
SELECT
    product_id,
    product_name,
    price
FROM products
WHERE price > ALL (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

Suppose category 1 contains:

| price |
| ----: |
|   500 |
|  1000 |
|  1500 |

The condition is equivalent to:

```sql
price > 500
AND price > 1000
AND price > 1500
```

A product priced at 2000 satisfies all comparisons.

### More examples

```sql
-- Greater than every salary
SELECT *
FROM employees
WHERE salary > ALL (
    SELECT salary
    FROM employees
    WHERE department_id = 2
);
```

```sql
-- Less than every product price in category 1
SELECT *
FROM products
WHERE price < ALL (
    SELECT price
    FROM products
    WHERE category_id = 1
);
```

### Important: ALL and empty subqueries

If the subquery returns zero rows, `ALL` evaluates to TRUE.

For example:

```sql
SELECT *
FROM products
WHERE price > ALL (
    SELECT price
    FROM products
    WHERE category_id = -1
);
```

If category -1 has no products, the condition is TRUE for every product, including products with NULL prices only if the comparison itself is TRUE. A comparison involving NULL remains UNKNOWN.

---

## 7. ANY vs ALL

This is an important interview topic.

| ANY                                           | ALL                                    |
| --------------------------------------------- | -------------------------------------- |
| At least one comparison must be TRUE          | Every comparison must be TRUE          |
| Similar to OR logic                           | Similar to AND logic                   |
| `> ANY` means greater than at least one value | `> ALL` means greater than every value |
| Empty subquery generally gives FALSE          | Empty subquery gives TRUE              |

### Example

Assume the inner query returns:

```text
500, 1000, 1500
```

| Product price | `price > ANY` | `price > ALL` |
| ------------: | ------------- | ------------- |
|           400 | FALSE         | FALSE         |
|           800 | TRUE          | FALSE         |
|          1200 | TRUE          | FALSE         |
|          1600 | TRUE          | TRUE          |

### Useful equivalences

For non-NULL values:

```sql
price > ALL (subquery)
```

is equivalent to:

```sql
price > (
    SELECT MAX(price)
    FROM products
);
```

And:

```sql
price > ANY (subquery)
```

is equivalent to:

```sql
price > (
    SELECT MIN(price)
    FROM products
);
```

However, these rewrites are not universally equivalent when NULLs or empty result sets are involved.

For example, `MAX()` and `MIN()` ignore NULL values and return NULL for an empty or all-NULL input. `ANY` and `ALL` have their own three-valued comparison behavior.

Use the original operator when its NULL and empty-set semantics matter.

---

## 8. EXISTS Operator

`EXISTS` checks whether a subquery returns at least one row.

It does not matter what columns the subquery selects.

### Syntax

```sql
SELECT columns
FROM table_name AS outer_table
WHERE EXISTS (
    SELECT 1
    FROM another_table AS inner_table
    WHERE condition
);
```

### Example: Customers who have placed orders

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

**How it works:**

1. PostgreSQL considers a customer row.
2. The subquery checks whether a matching order exists.
3. If at least one matching order exists, the customer is returned.
4. Otherwise, the customer is excluded.

### Why SELECT 1?

```sql
SELECT 1
```

is a conventional choice because EXISTS checks row existence, not the selected value.

These are equivalent for EXISTS:

```sql
WHERE EXISTS (
    SELECT 1
    FROM orders
    WHERE customer_id = c.customer_id
);
```

```sql
WHERE EXISTS (
    SELECT *
    FROM orders
    WHERE customer_id = c.customer_id
);
```

---

## 9. NOT EXISTS Operator

`NOT EXISTS` checks whether a subquery returns zero rows.

### Example: Customers who have never placed an order

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

### Example: Products that have never been ordered

```sql
SELECT
    p.product_id,
    p.product_name
FROM products AS p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items AS oi
    WHERE oi.product_id = p.product_id
);
```

### Example: Departments with no employees

```sql
SELECT
    d.department_id,
    d.department_name
FROM departments AS d
WHERE NOT EXISTS (
    SELECT 1
    FROM employees AS e
    WHERE e.department_id = d.department_id
);
```

**Business use cases:**

- Customers who never purchased anything.
- Products that have never sold.
- Departments without employees.
- Orders without successful payments.
- Records missing related entries.

---

## 10. EXISTS vs IN

Both can be used to check whether matching records exist.

### Using IN

```sql
SELECT *
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM orders
);
```

### Using EXISTS

```sql
SELECT *
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

### Comparison

| IN                                           | EXISTS                                                 |
| -------------------------------------------- | ------------------------------------------------------ |
| Compares a value against a result set        | Checks whether matching rows exist                     |
| Commonly used with non-correlated subqueries | Commonly used with correlated subqueries               |
| NULL behavior matters                        | NULL-safe for ordinary equality-based existence checks |
| Useful for membership checks                 | Useful for existence checks                            |

Neither is universally faster. PostgreSQL can transform both into similar execution strategies.

Choose based on the intended logic and validate performance with EXPLAIN ANALYZE when necessary.

---

## 11. EXISTS vs JOIN

Consider finding customers who have placed orders.

### Using JOIN

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

If a customer has five orders, that customer can appear five times.

### Using DISTINCT with JOIN

```sql
SELECT DISTINCT
    c.customer_id,
    c.customer_name
FROM customers AS c
JOIN orders AS o
    ON c.customer_id = o.customer_id;
```

### Using EXISTS

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.customer_id
);
```

EXISTS naturally preserves one outer row per customer.

**Mental model:**

- Use JOIN when you need matching data from another table.
- Use EXISTS when you only need to know whether a matching row exists.

---

## 12. Practical Comparison: Finding Customers by Purchase Activity

### Customers who have purchased products

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    JOIN order_items AS oi
        ON o.order_id = oi.order_id
    WHERE o.customer_id = c.customer_id
);
```

### Customers who have never purchased products

```sql
SELECT
    c.customer_id,
    c.customer_name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders AS o
    JOIN order_items AS oi
        ON o.order_id = oi.order_id
    WHERE o.customer_id = c.customer_id
);
```

Notice that the second query checks for the absence of a complete matching order-to-item relationship.

A customer may have an order with no order items, so checking only `orders` would answer a different question.

---

## 13. Important NULL Behavior

SQL uses three-valued logic:

- TRUE
- FALSE
- UNKNOWN

Subquery operators can produce UNKNOWN when NULL participates in a comparison.

### Example: ANY with NULL

Suppose the subquery returns:

```text
500, 1000, NULL
```

Consider:

```sql
SELECT 800 > ANY (
    SELECT price
    FROM products
);
```

The comparisons are:

```text
800 > 500  = TRUE
800 > 1000 = FALSE
800 > NULL = UNKNOWN
```

Because at least one comparison is TRUE, ANY returns TRUE.

### Example: ALL with NULL

```sql
SELECT 1600 > ALL (
    SELECT price
    FROM products
);
```

Comparisons:

```text
1600 > 500  = TRUE
1600 > 1000 = TRUE
1600 > NULL = UNKNOWN
```

ALL returns UNKNOWN because not every comparison is TRUE.

### Summary

| Operator   | Effect of NULL in the subquery                                            |
| ---------- | ------------------------------------------------------------------------- |
| IN         | Can produce UNKNOWN if no match exists and a NULL is present              |
| NOT IN     | Can produce UNKNOWN and unexpectedly exclude rows                         |
| ANY        | Can produce UNKNOWN if no comparison is TRUE and at least one is UNKNOWN  |
| ALL        | Can produce UNKNOWN if no comparison is FALSE and at least one is UNKNOWN |
| EXISTS     | Selected NULL values do not matter; row existence matters                 |
| NOT EXISTS | Selected NULL values do not matter; row existence matters                 |

---

## 14. Common Mistakes

| Mistake                                           | Correct understanding                                     |
| ------------------------------------------------- | --------------------------------------------------------- |
| Using `=` with a subquery returning multiple rows | Use IN, ANY or ALL as appropriate                         |
| Assuming ANY means every value                    | ANY requires at least one TRUE comparison                 |
| Assuming ALL means at least one value             | ALL requires every comparison to be TRUE                  |
| Using NOT IN without considering NULL             | Prefer NOT EXISTS for anti-join checks                    |
| Using EXISTS to retrieve related columns          | Use JOIN when related columns are needed                  |
| Assuming EXISTS checks the selected value         | EXISTS checks whether rows are returned                   |
| Assuming IN is always slower than EXISTS          | Compare actual execution plans                            |
| Forgetting empty-set behavior                     | ANY returns FALSE; ALL returns TRUE for an empty subquery |

---

## 15. Practice Exercises

Use the TechBazaar database.

1. Find customers who have placed orders using IN.
2. Find customers who have never placed orders using NOT IN, then test what happens if the subquery contains NULL.
3. Rewrite the previous query using NOT EXISTS.
4. Find products more expensive than at least one product in category 1 using ANY.
5. Find products more expensive than every product in category 1 using ALL.
6. Find employees whose salary is greater than at least one employee in department 2.
7. Find employees whose salary is greater than every employee in department 2.
8. Find departments that have at least one employee using EXISTS.
9. Find departments that have no employees using NOT EXISTS.
10. Find products that have never been included in an order using NOT EXISTS.
11. Find customers who have purchased at least one product.
12. Find customers who have never purchased a product.
13. Rewrite an IN query using EXISTS.
14. Rewrite an EXISTS query using JOIN and explain the duplicate-row risk.
15. Test ANY and ALL with an empty subquery.
16. Test ANY and ALL when the subquery contains NULL.
17. Explain why NOT IN can return no rows unexpectedly.

---

## 16. Interview Questions

**Q1. What is the difference between IN and EXISTS?**

IN checks membership in a result set. EXISTS checks whether a matching row exists.

**Q2. What is the difference between ANY and ALL?**

ANY requires at least one TRUE comparison. ALL requires every comparison to be TRUE.

**Q3. What is SOME?**

SOME is another name for ANY.

**Q4. Why is NOT IN dangerous with NULL?**

If the subquery returns NULL and no matching value exists, the comparison can become UNKNOWN instead of TRUE.

**Q5. Why is NOT EXISTS often preferred over NOT IN?**

It avoids the NULL-related behavior of NOT IN and directly expresses the absence of matching rows.

**Q6. Does EXISTS care about the columns selected by the subquery?**

No. It checks whether at least one row is returned.

**Q7. Can EXISTS return duplicate outer rows?**

No. EXISTS acts as a Boolean condition on each outer row; it does not multiply outer rows.

**Q8. Is EXISTS always faster than IN?**

No. PostgreSQL can optimize both. Actual performance depends on query structure, indexes, statistics and data distribution.

**Q9. What happens when ANY receives an empty result set?**

It evaluates to FALSE.

**Q10. What happens when ALL receives an empty result set?**

It evaluates to TRUE.

---

## Key Takeaways

- `IN` checks membership in a result set.
- `NOT IN` checks non-membership but requires careful NULL handling.
- `ANY` requires at least one successful comparison.
- `SOME` is equivalent to `ANY`.
- `ALL` requires every comparison to succeed.
- `EXISTS` checks whether at least one row exists.
- `NOT EXISTS` checks whether no matching row exists.
- EXISTS is particularly useful for semi-join and anti-join queries.
- Use JOIN when related columns are needed; use EXISTS when only existence matters.
- Do not assume one operator is always faster. Validate with execution plans.
