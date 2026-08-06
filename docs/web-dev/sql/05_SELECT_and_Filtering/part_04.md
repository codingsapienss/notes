---
sidebar_label: "Sorting, Limiting and Pagination"
sidebar_position: 1
---

# Sorting, Limiting and Pagination

## 1. Introduction

Sorting, limiting, and pagination control how query results are presented and retrieved.

These operations are essential in backend applications for:

- Product listing pages.
- Customer dashboards.
- Order history.
- Admin panels.
- Search results.
- Large database tables.

PostgreSQL provides several clauses for controlling query results:

| Clause        | Purpose                                       |
| ------------- | --------------------------------------------- |
| `ORDER BY`    | Sorts records                                 |
| `ASC`         | Sorts in ascending order                      |
| `DESC`        | Sorts in descending order                     |
| `NULLS FIRST` | Places NULL values first                      |
| `NULLS LAST`  | Places NULL values last                       |
| `LIMIT`       | Restricts returned rows                       |
| `OFFSET`      | Skips rows                                    |
| `FETCH`       | SQL-standard alternative to LIMIT             |
| `WITH TIES`   | Includes additional rows tied at the boundary |

---

## 2. ORDER BY — Sorting Records

`ORDER BY` sorts query results based on one or more columns or expressions.

### Syntax

```sql
SELECT column1, column2
FROM table_name
ORDER BY column_name ASC;
```

### Ascending order

```sql
SELECT *
FROM products
ORDER BY price ASC;
```

Sorts products from lowest price to highest price.

`ASC` is the default direction.

Equivalent:

```sql
SELECT *
FROM products
ORDER BY price;
```

### Descending order

```sql
SELECT *
FROM products
ORDER BY price DESC;
```

Sorts products from highest price to lowest price.

### Sorting employee names

```sql
SELECT *
FROM employees
ORDER BY first_name ASC;
```

Names are sorted alphabetically according to the applicable collation.

---

## 3. ORDER BY Multiple Columns

You can sort records using multiple columns.

```sql
SELECT *
FROM employees
ORDER BY department_id ASC, first_name ASC;
```

PostgreSQL sorts:

1. First by `department_id`.
2. Then by `first_name` for employees with the same department ID.

### Example: Different sort directions

```sql
SELECT *
FROM products
ORDER BY category_id ASC, price DESC;
```

- Categories are sorted in ascending order.
- Products within each category are sorted from highest price to lowest price.

### Important

The order of columns in `ORDER BY` matters.

```sql
ORDER BY department_id, first_name;
```

is not equivalent to:

```sql
ORDER BY first_name, department_id;
```

The first expression has the highest sorting priority.

---

## 4. ORDER BY with Expressions

You can sort using calculations and expressions.

### Sort by discounted price

```sql
SELECT
    product_name,
    price,
    price * 0.90 AS discounted_price
FROM products
ORDER BY price * 0.90 ASC;
```

### Sort by calculated employee name

```sql
SELECT
    first_name,
    last_name
FROM employees
ORDER BY first_name || ' ' || last_name;
```

### Sort using a column alias

```sql
SELECT
    product_name,
    price * 1.18 AS price_with_tax
FROM products
ORDER BY price_with_tax DESC;
```

PostgreSQL allows output column aliases in `ORDER BY`.

---

## 5. ORDER BY Column Position

PostgreSQL allows sorting using the position of a selected column.

```sql
SELECT
    product_name,
    price,
    category_id
FROM products
ORDER BY 2 DESC;
```

Here, `2` refers to the second SELECT expression: `price`.

This sorts products by price in descending order.

**Best practice:** Prefer column names or aliases. Positional sorting becomes difficult to maintain when SELECT columns change.

---

## 6. NULLS FIRST and NULLS LAST

PostgreSQL allows explicit control over where NULL values appear during sorting.

### NULLS FIRST

```sql
SELECT *
FROM customers
ORDER BY email ASC NULLS FIRST;
```

NULL values appear before non-NULL values.

### NULLS LAST

```sql
SELECT *
FROM customers
ORDER BY email ASC NULLS LAST;
```

NULL values appear after non-NULL values.

### PostgreSQL default behaviour

| Sort direction | Default NULL position |
| -------------- | --------------------- |
| ASC            | NULLS LAST            |
| DESC           | NULLS FIRST           |

**Important:** Specify NULL ordering explicitly when the application requires a predictable position.

---

## 7. LIMIT — Restricting Rows

`LIMIT` restricts the maximum number of rows returned.

### Syntax

```sql
SELECT *
FROM table_name
LIMIT number;
```

### Example

```sql
SELECT *
FROM products
LIMIT 5;
```

Returns at most five rows.

### Top five expensive products

```sql
SELECT *
FROM products
ORDER BY price DESC
LIMIT 5;
```

Returns the five most expensive products.

### Important

`LIMIT` without `ORDER BY` does not guarantee which records will be returned.

The database may return different rows depending on the execution plan, table changes, or physical data layout.

---

## 8. OFFSET — Skipping Rows

`OFFSET` skips a specified number of rows before returning results.

### Syntax

```sql
SELECT *
FROM table_name
OFFSET number;
```

### Example

```sql
SELECT *
FROM products
ORDER BY product_id
OFFSET 5;
```

Skips the first five rows and returns the remaining rows.

### LIMIT with OFFSET

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 5 OFFSET 10;
```

- Skips the first 10 rows.
- Returns the next five rows.

### Equivalent syntax

```sql
SELECT *
FROM products
ORDER BY product_id
OFFSET 10 ROWS
FETCH NEXT 5 ROWS ONLY;
```

---

## 9. Pagination Using LIMIT and OFFSET

Pagination divides a large result set into smaller pages.

Suppose the products table contains 100 records and the page size is 10.

| Page | OFFSET | LIMIT |
| ---: | -----: | ----: |
|    1 |      0 |    10 |
|    2 |     10 |    10 |
|    3 |     20 |    10 |
|    4 |     30 |    10 |
|    5 |     40 |    10 |

### Pagination formula

\[
OFFSET = (page - 1) \times page_size
\]

Where:

- `page` = requested page number.
- `page_size` = number of records per page.

### Example: Page 1

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 0;
```

### Example: Page 2

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 10;
```

### Example: Page 3

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10 OFFSET 20;
```

### Dynamic pagination

In a backend application, calculate the offset:

```javascript
const page = 3;
const pageSize = 10;

const offset = (page - 1) * pageSize;
```

Use the calculated values in a parameterized query:

```javascript
const result = await pool.query(
  `SELECT product_id, product_name, price
     FROM products
     ORDER BY product_id
     LIMIT $1 OFFSET $2`,
  [pageSize, offset],
);
```

Validate `page` and `pageSize` before executing the query. They should be positive integers, and page size should have a reasonable maximum.

---

## 10. The Problem with Large OFFSET

OFFSET pagination works well for small and moderate datasets.

However, it becomes inefficient for large datasets.

Example:

```sql
SELECT *
FROM orders
ORDER BY order_id
LIMIT 20 OFFSET 100000;
```

PostgreSQL still has to identify and skip the preceding rows before returning the requested page.

The larger the OFFSET, the more work may be required.

Other problems:

- Records can shift between pages when new rows are inserted.
- Records can disappear from later pages when earlier rows are deleted.
- Different requests may return inconsistent page boundaries.

For large datasets, consider keyset pagination.

---

## 11. Keyset Pagination (Cursor-Based Pagination)

Keyset pagination retrieves records relative to the last record from the previous page.

Instead of skipping thousands of rows, it uses a comparison condition.

Suppose products are ordered by `product_id`.

### First page

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10;
```

Suppose the last product ID returned is `10`.

### Second page

```sql
SELECT *
FROM products
WHERE product_id > 10
ORDER BY product_id
LIMIT 10;
```

This retrieves the next ten products.

### Third page

If the last product ID was `20`:

```sql
SELECT *
FROM products
WHERE product_id > 20
ORDER BY product_id
LIMIT 10;
```

### Comparison

| Feature                 | OFFSET pagination         | Keyset pagination                      |
| ----------------------- | ------------------------- | -------------------------------------- |
| Uses                    | LIMIT + OFFSET            | WHERE + ORDER BY + LIMIT               |
| Large datasets          | Can become expensive      | Usually more efficient                 |
| Random page access      | Supported                 | Not naturally supported                |
| Sequential navigation   | Supported                 | Well suited                            |
| Insert/delete stability | Can shift page boundaries | More stable with a unique ordering key |
| Implementation          | Simpler                   | Requires cursor management             |

**Important:** Keyset pagination does not automatically provide a consistent snapshot across separate requests. Updates to sort keys and concurrent changes can still affect navigation.

---

## 12. Keyset Pagination with Multiple Columns

Sometimes a single column is not enough to provide a unique ordering.

Suppose orders are sorted by `created_at`, but multiple orders can have the same timestamp.

Use a unique tie-breaker such as `order_id`.

### First page

```sql
SELECT *
FROM orders
ORDER BY created_at DESC, order_id DESC
LIMIT 10;
```

Suppose the last returned record has:

```text
created_at = 2026-11-10 10:30:00
order_id = 150
```

### Next page

```sql
SELECT *
FROM orders
WHERE (created_at, order_id)
    < (TIMESTAMP '2026-11-10 10:30:00', 150)
ORDER BY created_at DESC, order_id DESC
LIMIT 10;
```

PostgreSQL supports row comparisons.

The next page contains records that come after the cursor in the descending ordering.

**Important:**

- The cursor must contain all ordering columns.
- The ordering should be deterministic.
- A unique final tie-breaker is important.
- NULL sort keys require additional handling because ordinary row comparisons involving NULL can produce UNKNOWN.

---

## 13. Pagination with a WHERE Filter

Pagination is commonly combined with filters.

Example: Retrieve active employees from department 1.

```sql
SELECT *
FROM employees
WHERE department_id = 1
  AND status = 'active'
ORDER BY employee_id
LIMIT 10 OFFSET 20;
```

This retrieves the third page when the page size is 10.

The filtering is applied before the final ordering and pagination in the logical query processing model.

---

## 14. FETCH — SQL Standard Alternative to LIMIT

PostgreSQL supports `FETCH` as an alternative to `LIMIT`.

### FETCH FIRST

```sql
SELECT *
FROM products
ORDER BY price DESC
FETCH FIRST 5 ROWS ONLY;
```

### OFFSET with FETCH

```sql
SELECT *
FROM products
ORDER BY product_id
OFFSET 10 ROWS
FETCH NEXT 5 ROWS ONLY;
```

These are alternatives to:

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 5 OFFSET 10;
```

### WITH TIES

PostgreSQL supports `FETCH ... WITH TIES`.

```sql
SELECT *
FROM products
ORDER BY price DESC
FETCH FIRST 5 ROWS WITH TIES;
```

This returns at least five rows and includes additional rows tied with the fifth row according to the complete `ORDER BY` expressions.

Example:

| Product | Price |
| ------- | ----: |
| A       | 10000 |
| B       |  9000 |
| C       |  8000 |
| D       |  7000 |
| E       |  6000 |
| F       |  6000 |
| G       |  5000 |

The query returns six rows because products E and F are tied at the boundary.

**Important:** If you add a unique column such as `product_id` to the ORDER BY, ties may disappear because the complete ordering values are no longer equal.

---

## 15. ORDER BY with Aggregate Results

You can sort grouped or aggregated results.

Example: Departments with the highest employee count.

```sql
SELECT
    department_id,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
ORDER BY employee_count DESC;
```

### Top three departments by employee count

```sql
SELECT
    department_id,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
ORDER BY employee_count DESC, department_id ASC
LIMIT 3;
```

This combines:

- GROUP BY
- COUNT
- ORDER BY
- LIMIT

---

## 16. Pagination in Node.js with PostgreSQL

### Example using pg

```javascript
async function getProducts(page, pageSize) {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Invalid page number");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error("Invalid page size");
  }

  const offset = (page - 1) * pageSize;

  const result = await pool.query(
    `SELECT product_id, product_name, price
         FROM products
         ORDER BY product_id
         LIMIT $1 OFFSET $2`,
    [pageSize, offset],
  );

  return result.rows;
}
```

### Example usage

```javascript
const products = await getProducts(2, 10);

console.log(products);
```

This retrieves page 2 with 10 records per page.

### Returning total record count

Applications often need:

- Current page.
- Page size.
- Total records.
- Total pages.
- Current page data.

Example:

```javascript
const countResult = await pool.query(
  `SELECT COUNT(*) AS total
     FROM products`,
);

const totalRecords = Number(countResult.rows[0].total);
const totalPages = Math.ceil(totalRecords / pageSize);
```

The count query and page query are separate statements. If concurrent changes occur between them, the count and returned records may not represent exactly the same database snapshot unless you use an appropriate transaction and isolation level.

---

## 17. Indexes and Sorting Performance

Indexes can help PostgreSQL retrieve sorted data efficiently.

### Example

```sql
SELECT *
FROM products
ORDER BY product_id
LIMIT 10;
```

A primary key creates a unique B-tree index by default. PostgreSQL may use it to retrieve rows in the required order.

### Index for price sorting

```sql
CREATE INDEX idx_products_price
ON products (price);
```

This may help queries such as:

```sql
SELECT *
FROM products
ORDER BY price DESC
LIMIT 10;
```

### Composite index

```sql
CREATE INDEX idx_products_category_price
ON products (category_id, price DESC);
```

Can help queries such as:

```sql
SELECT *
FROM products
WHERE category_id = 2
ORDER BY price DESC
LIMIT 10;
```

**Important:**

- Indexes do not guarantee that PostgreSQL will avoid sorting.
- The planner chooses the execution plan based on estimated cost.
- Indexes increase storage and write overhead.
- Use `EXPLAIN ANALYZE` to inspect actual query execution.

---

## 18. Common Mistakes

| Mistake                                           | Problem                                                    |
| ------------------------------------------------- | ---------------------------------------------------------- |
| LIMIT without ORDER BY                            | Returned rows are not predictable                          |
| OFFSET without LIMIT                              | May return a very large result                             |
| Large OFFSET values                               | Can become expensive                                       |
| ORDER BY non-unique column only                   | Rows tied on that column have no guaranteed relative order |
| Incorrect pagination formula                      | Causes skipped or repeated records                         |
| Ignoring NULL ordering                            | Results may not appear in the expected order               |
| Using SELECT \* in large listings                 | Retrieves unnecessary data                                 |
| Assuming pagination creates a consistent snapshot | Concurrent changes can alter results                       |
| Creating indexes without checking query plans     | Adds overhead without guaranteed benefit                   |

---

## 19. Practice Exercises

Use the TechBazaar database.

1. Retrieve all products sorted by price in ascending order.
2. Retrieve the five most expensive products.
3. Retrieve employees sorted by department ID and first name.
4. Retrieve customers with NULL emails appearing last.
5. Retrieve page 1 with ten products per page.
6. Retrieve page 3 with ten products per page.
7. Write the pagination formula for page 5 with a page size of 20.
8. Retrieve the five highest-count departments.
9. Retrieve the next ten products using keyset pagination.
10. Implement keyset pagination using `created_at` and a unique ID.
11. Retrieve the top five products including ties using FETCH WITH TIES.
12. Create an index that may help retrieve products by category and descending price.
13. Compare OFFSET and keyset pagination using EXPLAIN ANALYZE.
14. Implement validated pagination in Node.js using `pg`.

---

## 20. Interview Questions

**Q1. What is ORDER BY?**

It sorts query results in ascending or descending order.

**Q2. What is the default ORDER BY direction?**

Ascending (`ASC`).

**Q3. What is the default NULL ordering in PostgreSQL?**

- ASC: NULLS LAST.
- DESC: NULLS FIRST.

**Q4. What is LIMIT?**

It restricts the maximum number of rows returned.

**Q5. What is OFFSET?**

It skips a specified number of rows before returning results.

**Q6. What is the pagination formula?**

`OFFSET = (page - 1) × page_size`.

**Q7. Why should LIMIT be used with ORDER BY?**

Without ORDER BY, PostgreSQL does not guarantee which rows will be returned.

**Q8. What is the problem with large OFFSET values?**

PostgreSQL may need to identify and skip many preceding rows, increasing query cost.

**Q9. What is keyset pagination?**

A pagination technique that retrieves records using a cursor based on the last record's ordering values.

**Q10. When should keyset pagination be preferred?**

For large datasets and sequential navigation where efficient retrieval is more important than jumping directly to arbitrary page numbers.

**Q11. What is the difference between LIMIT and FETCH?**

Both restrict returned rows. FETCH is SQL-standard syntax, while LIMIT is widely used in PostgreSQL and other databases.

**Q12. What does FETCH WITH TIES do?**

It includes additional rows tied with the last row at the requested boundary, according to the complete ORDER BY expressions.

---

## Key Takeaways

- ORDER BY sorts query results.
- ASC is ascending; DESC is descending.
- Multiple columns can be used for sorting.
- PostgreSQL supports NULLS FIRST and NULLS LAST.
- LIMIT restricts returned rows.
- OFFSET skips rows.
- Always use deterministic ordering for pagination.
- OFFSET pagination can become expensive for large datasets.
- Keyset pagination is generally better for large sequential result sets.
- Use a unique tie-breaker in cursor-based pagination.
- FETCH is a SQL-standard alternative to LIMIT.
- FETCH WITH TIES includes rows tied at the result boundary.
- Indexes can improve sorting and pagination performance.
- Validate page numbers and page sizes in backend applications.
