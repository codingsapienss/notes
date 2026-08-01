---
sidebar_label: SQL vs Search Database
sidebar_position: 1
---

# SQL vs Search Database

## 1. Introduction

In the previous chapters, we studied relational databases and search databases independently.

We learned that:

- Relational databases organize data into tables, rows, columns, and relationships.
- Search databases organize documents for efficient text retrieval, relevance ranking, and search-oriented analytics.
- PostgreSQL uses structures such as B-Tree indexes to accelerate structured queries.
- Elasticsearch uses Apache Lucene and inverted indexes to perform full-text search efficiently.

Now we need to answer an important architectural question:

**If PostgreSQL can store text, create indexes, and search records, why would we need Elasticsearch?**

And the opposite question:

**If Elasticsearch can store documents, filter data, sort results, and perform aggregations, why would we need PostgreSQL or MongoDB?**

The answer is that these databases are optimized for different workloads.

A database should not be selected merely because it supports a particular query. It should be selected based on the complete workload, consistency requirements, data model, query patterns, and operational complexity.

This chapter compares SQL databases and search databases from an architectural and backend engineering perspective.

---

# 2. What Is a SQL Database?

A SQL database is a database system designed primarily around structured data, relationships, constraints, and transactional operations.

Examples:

- PostgreSQL
- MySQL
- Microsoft SQL Server
- Oracle Database

Consider an e-commerce application.

We may have the following tables:

### Products

| product_id | name                | price | category_id |
| ---------- | ------------------- | ----: | ----------- |
| P101       | Wireless Headphones |  1999 | 10          |
| P102       | Gaming Mouse        |   999 | 10          |
| P103       | Running Shoes       |  2499 | 20          |

### Categories

| category_id | category_name |
| ----------- | ------------- |
| 10          | Electronics   |
| 20          | Footwear      |

### Orders

| order_id | user_id | total_amount |
| -------- | ------- | -----------: |
| O101     | U101    |         2998 |
| O102     | U102    |         2499 |

A relational database allows us to:

- Store structured data.
- Define relationships using foreign keys.
- Enforce constraints.
- Execute joins.
- Perform transactions.
- Maintain consistency.
- Execute complex SQL queries.

Example:

```sql
SELECT
    p.product_id,
    p.name,
    p.price,
    c.category_name
FROM products p
JOIN categories c
    ON p.category_id = c.category_id
WHERE p.price < 3000;
```

The database retrieves products and their corresponding category information.

## 2.1 What makes SQL databases strong?

### A. Relationships

Relational databases support relationships between tables.

For example:

```text
Users
  |
  | user_id
  |
  v
Orders
  |
  | order_id
  |
  v
Order Items
  |
  | product_id
  |
  v
Products
```

These relationships can be enforced using foreign keys.

### B. Transactions

SQL databases support transactions.

Example:

A user places an order.

The application must:

1. Create the order.
2. Create order items.
3. Update inventory.
4. Record payment information.

If a required operation fails, the transaction can be rolled back.

```sql
BEGIN;

INSERT INTO orders (...);

INSERT INTO order_items (...);

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 'P101';

COMMIT;
```

This is useful when multiple related operations must satisfy transactional requirements.

### C. Constraints

SQL databases can enforce rules such as:

- Primary keys.
- Foreign keys.
- Unique constraints.
- NOT NULL constraints.
- CHECK constraints.

Example:

```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) CHECK (price >= 0)
);
```

The database helps protect data integrity.

### D. Structured queries

SQL supports operations such as:

- Filtering.
- Joining.
- Grouping.
- Sorting.
- Aggregations.
- Subqueries.
- Window functions.

Example:

```sql
SELECT
    category_id,
    COUNT(*) AS total_products,
    AVG(price) AS average_price
FROM products
GROUP BY category_id;
```

These features make SQL databases suitable for transactional and structured business workloads.

---

# 3. What Is a Search Database?

A search database is designed to retrieve information efficiently based on search-oriented access patterns.

Examples:

- Elasticsearch
- OpenSearch
- Apache Solr

These systems are particularly useful for:

- Full-text search.
- Relevance ranking.
- Fuzzy matching.
- Autocomplete.
- Search suggestions.
- Faceted search.
- Search-oriented aggregations.

Consider the same products:

```json
[
  {
    "product_id": "P101",
    "name": "Wireless Bluetooth Headphones",
    "description": "Noise cancelling headphones with deep bass",
    "brand": "Sony",
    "price": 1999
  },
  {
    "product_id": "P102",
    "name": "Gaming Mouse",
    "description": "Wireless gaming mouse with RGB lighting",
    "brand": "Logitech",
    "price": 999
  },
  {
    "product_id": "P103",
    "name": "Running Shoes",
    "description": "Lightweight shoes for daily running",
    "brand": "Nike",
    "price": 2499
  }
]
```

Suppose a user searches:

```text
wireless headphones
```

A search engine can:

1. Analyze the query.
2. Identify matching terms.
3. Find documents through inverted indexes.
4. Calculate relevance scores.
5. Rank documents.
6. Apply filters.
7. Return the most relevant results.

This is different from simply checking whether a column equals a particular value.

## 3.1 What makes search databases strong?

### A. Full-text search

Search engines analyze text using analyzers and inverted indexes.

Example:

```text
Search query:
wireless headphones
```

The engine can find documents containing relevant terms even when the entire field does not exactly match the query.

### B. Relevance scoring

Search databases can rank documents based on how relevant they are to a query.

For example:

| Product                       | Match   | Relevance |
| ----------------------------- | ------- | --------: |
| Wireless Bluetooth Headphones | Strong  |       9.8 |
| Wireless Gaming Headset       | Strong  |       8.9 |
| Headphone Carrying Case       | Partial |       4.2 |

The scores are illustrative.

Search engines commonly use algorithms such as BM25 to calculate relevance.

### C. Fuzzy matching

A search engine can handle small spelling mistakes.

Example:

```text
User searches:
headphons
```

The engine may still find:

```text
headphones
```

This is useful in user-facing search interfaces.

### D. Autocomplete

Search databases can support:

- Prefix matching.
- Edge n-gram indexing.
- Search-as-you-type.
- Completion suggestions.

Example:

```text
User types: wire

Suggestions:
- Wireless Headphones
- Wireless Mouse
- Wireless Keyboard
```

### E. Faceted search

Search engines support search-oriented filtering and aggregations.

Example:

```text
Search: headphones

Brand:
- Sony
- JBL
- Bose

Price:
- Under ₹1,000
- ₹1,000–₹3,000
- Above ₹3,000
```

The user can refine the result set without requiring a separate request for every individual filter calculation.

---

# 4. SQL Indexes vs Inverted Indexes

This is one of the most important differences between relational databases and search databases.

Both systems use indexes, but their indexing structures and intended workloads differ.

## 4.1 How a B-Tree index works

Relational databases commonly use B-Tree or B+ Tree indexes.

Suppose we have:

| product_id | name       | price |
| ---------- | ---------- | ----: |
| P101       | Headphones |  1999 |
| P102       | Mouse      |   999 |
| P103       | Keyboard   |  1499 |
| P104       | Monitor    |  8999 |

Create an index:

```sql
CREATE INDEX idx_products_price
ON products(price);
```

The database maintains an ordered index structure based on price.

Conceptually:

```text
             B-Tree Index
                  |
          -----------------
          |       |       |
         999    1499    1999
                          |
                         8999
```

The diagram is simplified; a real B-Tree has a hierarchical node structure.

This index helps queries such as:

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 3000;
```

It is also useful for suitable equality and ordered access patterns.

## 4.2 How an inverted index works

Search databases commonly use inverted indexes for full-text search.

Suppose we have:

```text
Document 1:
Wireless Bluetooth Headphones

Document 2:
Wireless Gaming Mouse

Document 3:
Bluetooth Speaker
```

The search engine analyzes the documents into terms.

Conceptually:

```text
Term                 Documents
--------------------------------
wireless             1, 2
bluetooth            1, 3
headphones           1
gaming               2
mouse                2
speaker              3
```

Instead of asking:

```text
Which words exist in this document?
```

An inverted index helps answer:

```text
Which documents contain this word?
```

This makes text retrieval efficient.

## 4.3 B-Tree vs inverted index

| Feature                | B-Tree index                                              | Inverted index                                                                 |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Primary purpose        | Structured data lookup and ordered access                 | Text retrieval                                                                 |
| Typical usage          | Equality, ranges, ordering                                | Full-text search                                                               |
| Data organization      | Ordered key structure                                     | Terms mapped to document postings                                              |
| Text relevance ranking | Not its primary purpose                                   | Core search capability                                                         |
| Numeric range queries  | Excellent fit                                             | Supported through suitable field structures, but not its main text-search role |
| Prefix search          | Possible in suitable cases                                | Possible through suitable search structures                                    |
| Full-text search       | Database-specific text-search facilities may be available | Core capability                                                                |

**Important:** This is a comparison of common indexing structures, not a claim that SQL databases cannot perform full-text search or that search databases cannot handle structured filtering.

PostgreSQL, for example, supports full-text search through `tsvector`, `tsquery`, and GIN indexes.

---

# 5. Structured Search vs Full-Text Search

A major architectural distinction is the type of search being performed.

## 5.1 Structured search

Structured search operates on known fields and data types.

Examples:

```sql
SELECT *
FROM products
WHERE category = 'Electronics'
  AND price BETWEEN 1000 AND 3000;
```

This is a structured query.

The application knows exactly which fields and conditions it wants.

Common structured operations include:

- Equality.
- Inequality.
- Range filters.
- Sorting.
- Grouping.
- Joins.

Relational databases are particularly strong at these operations.

## 5.2 Full-text search

Full-text search operates on textual content.

Example:

```text
wireless headphones with noise cancellation
```

A search engine may consider:

- Tokenization.
- Stemming.
- Synonyms.
- Term frequency.
- Document frequency.
- Field relevance.
- Phrase matching.
- Fuzzy matching.

A search query is not necessarily an exact comparison against one database field.

## 5.3 Comparison

| Structured search                  | Full-text search                           |
| ---------------------------------- | ------------------------------------------ |
| Works on defined fields and values | Works on analyzed textual content          |
| Often uses exact values or ranges  | Can use terms, phrases, and fuzzy matching |
| Commonly uses B-Tree indexes       | Commonly uses inverted indexes             |
| Strong for business data retrieval | Strong for text relevance and discovery    |
| SQL databases are a natural fit    | Search databases are a natural fit         |

## 5.4 Example: Product search

Suppose a user searches:

```text
cheap wireless headphones for running
```

The application may need to:

1. Match product names and descriptions.
2. Understand relevant terms.
3. Rank products by relevance.
4. Filter out expensive products.
5. Restrict results to a particular category.
6. Sort by price or relevance.
7. Show brand counts.

A search engine is a natural fit for this type of experience.

However, if the application only needs:

```sql
SELECT *
FROM products
WHERE category = 'Electronics'
  AND price < 2000;
```

A relational database may be sufficient.

Do not introduce Elasticsearch just because the application contains a search box.

---

# 6. Transactions and Consistency

Another major difference is the role each system plays in an application.

## 6.1 SQL databases and ACID transactions

Relational databases such as PostgreSQL provide transactional guarantees.

ACID stands for:

- Atomicity.
- Consistency.
- Isolation.
- Durability.

Example: transferring money between two bank accounts.

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 101;

UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 102;

COMMIT;
```

Both operations must succeed as one transaction.

If a required operation fails, the transaction can be rolled back.

This is essential for financial and business-critical operations.

## 6.2 Search databases and transactional requirements

Elasticsearch supports operations such as:

- Indexing.
- Updating.
- Deleting.
- Bulk indexing.
- Replication.
- Document versioning.

However, it is not designed to replace a relational database's general-purpose multi-row ACID transaction model.

It should not be treated as a transactional system for complex business workflows.

For example, consider an order:

```text
Create Order
      |
      v
Reduce Inventory
      |
      v
Record Payment
      |
      v
Confirm Order
```

These operations involve business invariants across multiple entities.

A transactional database is generally a better system of record for this workflow.

Elasticsearch can then provide search capabilities over derived order or product information.

## 6.3 Consistency comparison

| Requirement                      | Relational database                           | Search database                                   |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Multi-row ACID transactions      | Core capability in systems such as PostgreSQL | Not a general-purpose replacement                 |
| Foreign key constraints          | Supported                                     | No equivalent relational FK enforcement           |
| Complex joins                    | Core capability                               | Limited and not a substitute for relational joins |
| Full-text relevance ranking      | Supported by some systems                     | Core capability                                   |
| Search visibility after indexing | Depends on database implementation            | Near-real-time in Elasticsearch by default        |
| Distributed replicas             | Supported                                     | Supported                                         |
| Business source of truth         | Common choice                                 | Usually a derived projection                      |

**Important:** Do not confuse Elasticsearch's replication consistency mechanisms with relational ACID transactions.

They solve different problems.

---

# 7. Joins vs Search-Oriented Document Retrieval

Relational databases are designed to model relationships.

Search databases are designed to retrieve indexed documents efficiently.

This leads to a difference in data modeling.

## 7.1 Relational data model

Consider:

### Products

| product_id | name       | category_id |
| ---------- | ---------- | ----------- |
| P101       | Headphones | 10          |
| P102       | Mouse      | 10          |

### Categories

| category_id | category_name |
| ----------- | ------------- |
| 10          | Electronics   |

Query:

```sql
SELECT
    p.name,
    c.category_name
FROM products p
JOIN categories c
    ON p.category_id = c.category_id;
```

The database joins the related records.

## 7.2 Search-oriented document model

For search, the application may create a denormalized document:

```json
{
  "product_id": "P101",
  "name": "Wireless Headphones",
  "category": {
    "id": 10,
    "name": "Electronics"
  },
  "brand": "Sony",
  "price": 1999
}
```

Now the search document contains the fields needed for common search operations.

This can reduce the need to join multiple entities during search.

## 7.3 Why denormalize search documents?

Suppose every product search needs:

- Product name.
- Brand.
- Category name.
- Description.
- Price.
- Rating.

If these fields are frequently required, maintaining a search document containing them can make search queries more straightforward.

However, denormalization creates synchronization work.

If the category name changes, every affected product search document may need updating.

## 7.4 SQL joins vs denormalized search documents

| Relational model                             | Search document model                                  |
| -------------------------------------------- | ------------------------------------------------------ |
| Stores normalized entities                   | Often stores denormalized search documents             |
| Relationships represented using keys         | Related fields can be copied into documents            |
| Joins combine related records at query time  | Search queries often retrieve preassembled documents   |
| Updates can be made to one normalized entity | Changes may require updating multiple search documents |
| Strong fit for relational integrity          | Strong fit for search-oriented retrieval               |

**Important:** Denormalization is not automatically faster in every workload. It trades query-time work for data duplication and synchronization complexity.

---

# 8. Relevance Ranking vs Traditional Sorting

This is another major difference.

## 8.1 Traditional sorting

A relational query might use:

```sql
SELECT *
FROM products
ORDER BY price ASC;
```

The database returns products ordered by price.

This is deterministic sorting based on a field.

## 8.2 Relevance ranking

A search engine can calculate relevance scores.

Example query:

```text
wireless headphones
```

Possible results:

| Product                              | Relevance score |
| ------------------------------------ | --------------: |
| Wireless Bluetooth Headphones        |             9.8 |
| Wireless Noise Cancelling Headphones |             9.5 |
| Bluetooth Speaker                    |             4.1 |

The engine can consider:

- Matching terms.
- Term frequency.
- Document frequency.
- Field importance.
- Document length.
- Query structure.

Elasticsearch commonly uses BM25 as its default similarity algorithm for standard text fields.

## 8.3 Can SQL databases do relevance ranking?

Yes.

This is an important correction to a common misconception.

PostgreSQL supports full-text search and relevance ranking functions.

Example:

```sql
SELECT
    product_id,
    name,
    ts_rank(
        search_vector,
        plainto_tsquery('english', 'wireless headphones')
    ) AS rank
FROM products
WHERE search_vector @@
      plainto_tsquery('english', 'wireless headphones')
ORDER BY rank DESC;
```

Therefore, it is incorrect to say:

> SQL databases cannot perform relevance ranking.

They can.

The actual question is whether the database's full-text search capabilities meet the application's search requirements and scale.

## 8.4 Relevance ranking vs sorting

| Relevance ranking                  | Traditional sorting                      |
| ---------------------------------- | ---------------------------------------- |
| Based on query-document relevance  | Based on specified field values          |
| Uses scoring algorithms            | Uses ordering rules                      |
| Commonly used for full-text search | Commonly used for price, date, rating    |
| Results can change with the query  | Ordering depends on selected sort fields |

A search engine can combine both:

```text
First: relevance score
Second: popularity
Third: price
```

For example, the application might prioritize relevant products and use popularity as a tie-breaker.

---

# 9. Aggregations and Analytics

Both SQL databases and search databases support aggregations, but their typical use cases differ.

## 9.1 SQL aggregations

SQL provides:

- COUNT.
- SUM.
- AVG.
- MIN.
- MAX.
- GROUP BY.
- HAVING.
- Window functions.

Example:

```sql
SELECT
    category,
    COUNT(*) AS total_products,
    AVG(price) AS average_price
FROM products
GROUP BY category;
```

This calculates product statistics by category.

SQL is particularly useful for relational reporting and business analysis.

## 9.2 Search database aggregations

Elasticsearch supports aggregations such as:

- Terms aggregations.
- Range aggregations.
- Date histogram aggregations.
- Average aggregations.
- Sum aggregations.
- Cardinality aggregations.
- Nested aggregations.

Example:

```json
{
  "size": 0,
  "aggs": {
    "brands": {
      "terms": {
        "field": "brand"
      }
    },
    "average_price": {
      "avg": {
        "field": "price"
      }
    }
  }
}
```

This can return brand buckets and average price without returning the matching product documents.

## 9.3 Search aggregations vs analytical queries

Search aggregations are especially useful for interactive filtering and exploration.

Example:

```text
User searches: headphones

Filters displayed:

Brands:
- Sony
- JBL
- Bose

Price ranges:
- Under 1000
- 1000–3000
- Above 3000
```

A data warehouse or analytical database may be a better choice for large-scale historical reporting and complex analytical workloads.

Do not automatically treat Elasticsearch as a replacement for a data warehouse.

---

# 10. PostgreSQL Full-Text Search vs Elasticsearch

This comparison matters because PostgreSQL already provides native full-text search.

The decision is not simply SQL versus search engine.

It is often:

**Can PostgreSQL's search capabilities satisfy the application, or does the application need a dedicated search engine?**

## 10.1 PostgreSQL full-text search

PostgreSQL supports:

- `tsvector`.
- `tsquery`.
- Text search configurations.
- Dictionaries.
- Stemming.
- Ranking.
- GIN indexes.

Example:

```sql
ALTER TABLE products
ADD COLUMN search_vector tsvector;

UPDATE products
SET search_vector =
    to_tsvector(
        'english',
        coalesce(name, '') || ' ' ||
        coalesce(description, '')
    );
```

Create a GIN index:

```sql
CREATE INDEX idx_products_search
ON products
USING GIN(search_vector);
```

Search:

```sql
SELECT
    product_id,
    name,
    ts_rank(
        search_vector,
        plainto_tsquery('english', 'wireless headphones')
    ) AS rank
FROM products
WHERE search_vector @@
      plainto_tsquery('english', 'wireless headphones')
ORDER BY rank DESC;
```

This is a real full-text search implementation inside PostgreSQL.

## 10.2 Elasticsearch

Elasticsearch offers a dedicated search architecture with features such as:

- Inverted indexes.
- BM25 relevance scoring.
- Flexible analyzers.
- Synonyms.
- Fuzzy matching.
- Phrase queries.
- Autocomplete structures.
- Distributed search.
- Search aggregations.
- Search-oriented scaling.

It also introduces another distributed system that must be operated and synchronized.

## 10.3 PostgreSQL vs Elasticsearch

| Feature                         | PostgreSQL                                                | Elasticsearch                                       |
| ------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| Primary purpose                 | Relational database                                       | Search and analytics engine                         |
| Data model                      | Relational tables, JSON/JSONB                             | JSON documents                                      |
| Full-text search                | Yes                                                       | Yes                                                 |
| Inverted-index-style structures | GIN and other text-search mechanisms                      | Core search architecture                            |
| Relevance ranking               | Yes, through text-search functions                        | Advanced search scoring and customization           |
| Fuzzy search                    | More limited or requires additional techniques/extensions | Built-in fuzzy query support                        |
| Autocomplete                    | Possible with suitable indexing and query design          | Dedicated autocomplete patterns                     |
| Transactions                    | ACID transactions                                         | Not a general-purpose multi-entity ACID replacement |
| Foreign keys                    | Yes                                                       | No equivalent relational FK constraints             |
| Joins                           | Full relational joins                                     | Limited alternatives, not equivalent                |
| Search distribution             | Depends on architecture and extensions                    | Native distributed search architecture              |
| Operational complexity          | One primary database system if PostgreSQL is sufficient   | Additional cluster and synchronization operations   |

## 10.4 When is PostgreSQL enough?

PostgreSQL may be enough when:

- The dataset is moderate.
- Search requirements are relatively simple.
- Search latency requirements are satisfied.
- The application needs relational consistency.
- Full-text search and GIN indexes meet the requirements.
- Operating another system would add unnecessary complexity.

Example:

An internal admin panel with 50,000 products and basic search may not need Elasticsearch.

## 10.5 When might Elasticsearch be justified?

Elasticsearch may be justified when:

- Search is a central product feature.
- Search relevance is important.
- The application needs sophisticated analyzers.
- Fuzzy search is required.
- Autocomplete is important.
- Search traffic is high.
- Search workloads need to scale independently.
- Faceted search is complex.
- The required search behavior exceeds what the existing database provides efficiently.

Example:

A large marketplace where users search across millions of products using misspellings, synonyms, brand filters, categories, price ranges, and relevance ranking.

---

# 11. MongoDB vs Elasticsearch

Since MongoDB is commonly used as an application database and Elasticsearch as a search engine, it is useful to understand their differences.

## 11.1 MongoDB

MongoDB is a document-oriented database.

It stores data in BSON documents.

Example:

```json
{
  "_id": "P101",
  "name": "Wireless Headphones",
  "price": 1999,
  "brand": "Sony",
  "category": {
    "id": 10,
    "name": "Electronics"
  },
  "inventory": {
    "available": 50
  }
}
```

MongoDB provides:

- Document storage.
- Flexible schemas.
- Secondary indexes.
- Aggregation pipelines.
- Atomic single-document operations.
- Multi-document transactions.
- Replication.
- Sharding.

MongoDB is suitable for many application data workloads.

## 11.2 Elasticsearch

Elasticsearch stores JSON-like documents and builds search-oriented indexes.

It provides:

- Full-text search.
- Relevance ranking.
- Fuzzy search.
- Autocomplete.
- Distributed search.
- Search aggregations.
- Filtering and sorting.

Although both systems store documents, their internal architectures and optimization goals differ.

## 11.3 MongoDB vs Elasticsearch

| Feature                  | MongoDB                                                   | Elasticsearch                                                  |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------- |
| Primary purpose          | Operational document database                             | Search and analytics engine                                    |
| Internal document format | BSON                                                      | JSON-based document API; Lucene-based storage structures       |
| Full-text search         | Supported                                                 | Core capability                                                |
| Flexible schema          | Yes                                                       | Yes, with mappings and dynamic mapping behavior                |
| Aggregations             | Yes                                                       | Yes                                                            |
| Transactions             | Single-document atomicity and multi-document transactions | Not a general-purpose replacement for application transactions |
| Relationships            | Embedding and references; `$lookup` available             | Denormalized search documents are common                       |
| Search relevance         | Available through search capabilities                     | Core functionality                                             |
| Fuzzy search             | Depends on search functionality used                      | Built-in query support                                         |
| Sharding                 | Native sharded-cluster architecture                       | Index shards distributed across nodes                          |
| Typical role             | Source of truth                                           | Derived search projection                                      |

## 11.4 Important: MongoDB can also provide search

MongoDB has search capabilities, including MongoDB Atlas Search.

Atlas Search uses Apache Lucene-based search technology and supports advanced search features.

Therefore, it is incorrect to assume that every MongoDB application must use Elasticsearch for full-text search.

The correct choice depends on:

- Search requirements.
- Deployment environment.
- Cost.
- Operational requirements.
- Existing infrastructure.
- Search performance.

---

# 12. Data Synchronization: The Hidden Cost of Using Two Databases

One of the biggest architectural mistakes is introducing Elasticsearch without considering data synchronization.

Suppose the architecture is:

```text
Node.js
   |
   v
MongoDB
   |
   v
Elasticsearch
```

MongoDB stores the authoritative product record.

Elasticsearch stores a search-optimized copy.

Now consider an update.

```text
Product price changes:

MongoDB:
1999 -> 1799
```

Elasticsearch must eventually receive the new value.

If synchronization fails, the two systems temporarily or permanently disagree.

## 12.1 The dual-write problem

Consider:

```javascript
await Product.updateOne({ _id: productId }, { $set: { price: 1799 } });

await elasticsearch.update({
  index: "products",
  id: productId,
  doc: {
    price: 1799,
  },
});
```

Potential failure:

```text
MongoDB update succeeds
Elasticsearch update fails
```

Now the search result may still show the old price.

The application has a consistency problem.

## 12.2 Common synchronization architecture

A more reliable approach uses an outbox or change-stream-based event pipeline.

```text
                 Node.js API
                      |
                      v
                   MongoDB
                      |
                      v
              Change Stream / Outbox
                      |
                      v
                 Queue / Worker
                      |
                      v
                Elasticsearch
```

The system should handle:

- Duplicate events.
- Out-of-order events.
- Retry policies.
- Dead-letter queues.
- Deletes.
- Reindexing.
- Event replay.
- Monitoring synchronization lag.

## 12.3 Eventual consistency

Elasticsearch may not reflect the latest MongoDB state immediately.

Example:

```text
10:00:00 - MongoDB product updated
10:00:01 - Event published
10:00:02 - Worker processes event
10:00:03 - Elasticsearch updated
```

During this period, search results may be stale.

For many search experiences, this is acceptable.

For inventory, payments, or order confirmation, the application should validate the authoritative database record.

## 12.4 The operational cost

Adding Elasticsearch means operating another system.

You now need to manage:

- Cluster availability.
- Shard allocation.
- Index mappings.
- Index lifecycle.
- Search performance.
- Synchronization workers.
- Event failures.
- Reindexing.
- Backups.
- Monitoring.
- Capacity planning.

The search experience must provide enough value to justify this complexity.

---

# 13. Real-World Architecture: E-Commerce Application

Let's design a realistic architecture.

Requirements:

- User registration.
- Product management.
- Inventory.
- Orders.
- Payments.
- Product search.
- Autocomplete.
- Faceted filtering.
- Search relevance.

Technology choices:

- Node.js + Express.
- PostgreSQL or MongoDB for application data.
- Elasticsearch for advanced search.
- Redis for caching where appropriate.
- Queue or outbox worker for synchronization.

## 13.1 High-level architecture

```text
                       CLIENT
                         |
                         v
                    NODE.JS API
                         |
           ----------------------------
           |                          |
           v                          v
    Application Database          Redis
   (PostgreSQL/MongoDB)          (Optional)
           |
           |
           v
      Event / Outbox
           |
           v
      Queue / Worker
           |
           v
      Elasticsearch
           |
           v
       Search API
```

## 13.2 Responsibility separation

| Component          | Responsibility                                 |
| ------------------ | ---------------------------------------------- |
| PostgreSQL/MongoDB | Authoritative application data                 |
| Elasticsearch      | Product discovery and search                   |
| Redis              | Caching and suitable fast key-value operations |
| Queue              | Event delivery and buffering                   |
| Node.js API        | Business logic and API orchestration           |

## 13.3 Example: Product creation

A seller creates a product.

```text
1. Seller submits product
        |
        v
2. Node.js validates input
        |
        v
3. Product saved in MongoDB
        |
        v
4. Product event created
        |
        v
5. Worker consumes event
        |
        v
6. Elasticsearch document indexed
        |
        v
7. Product becomes searchable after refresh
```

There are two separate visibility delays:

1. Event synchronization delay.
2. Elasticsearch refresh delay.

The application should understand both.

## 13.4 Example: Product search

User searches:

```text
wireless headphones
```

Flow:

```text
Client
  |
  v
Node.js Search API
  |
  v
Elasticsearch
  |
  v
Search + Scoring + Filters
  |
  v
Top Search Results
  |
  v
Client
```

The API may also enrich results with additional authoritative data where needed.

However, avoid making a database request for every search result if the same information can safely be maintained in the search projection.

## 13.5 Example: Place an order

A user clicks Buy.

The application should not trust Elasticsearch's inventory information.

Correct flow:

```text
User clicks Buy
      |
      v
Node.js API
      |
      v
MongoDB / PostgreSQL
      |
      v
Validate Current Inventory
      |
      v
Execute Business Transaction
      |
      v
Confirm Order
```

Elasticsearch is useful for discovering products, not for making the final inventory decision.

---

# 14. When Should You Use SQL, MongoDB, or Elasticsearch?

This is the practical decision-making section.

## 14.1 Use a relational database when:

- Data has strong relationships.
- Transactional integrity is important.
- Foreign key constraints are valuable.
- Complex joins are common.
- Business rules must be enforced.
- Financial or order workflows are involved.
- Structured reporting is important.

Examples:

- Banking systems.
- Payment processing.
- Order management.
- Inventory systems.
- Accounting applications.
- ERP systems.

## 14.2 Use MongoDB when:

- The application naturally works with document-shaped data.
- Nested structures are common.
- Access patterns fit document-oriented storage.
- Flexible document evolution is valuable.
- Single-document atomic operations fit the workload.
- Native sharding is useful for the system's scale.

Examples:

- Content management systems.
- User profiles.
- Campaign platforms.
- Product catalogs.
- Event-driven application data.
- Applications with nested document structures.

MongoDB can also support multi-document transactions and relational-style lookups when needed.

## 14.3 Use Elasticsearch when:

- Full-text search is central.
- Relevance ranking is important.
- Fuzzy search is needed.
- Autocomplete is required.
- Search filters are complex.
- Search aggregations are important.
- Search workloads need independent scaling.

Examples:

- E-commerce product discovery.
- Job search platforms.
- Real estate search.
- Log search.
- Application observability.
- Large content discovery platforms.

## 14.4 Decision table

| Requirement                            | Suitable starting point                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| Financial transactions                 | PostgreSQL or another transactional database                |
| Complex relational queries             | PostgreSQL                                                  |
| Nested application documents           | MongoDB                                                     |
| Product catalog storage                | PostgreSQL or MongoDB, depending on data model              |
| Basic text search                      | PostgreSQL or MongoDB search capabilities                   |
| Advanced full-text search              | Elasticsearch or an appropriate dedicated search solution   |
| Autocomplete at scale                  | Dedicated search engine or suitable database search feature |
| Payment records                        | Transactional database                                      |
| Log search                             | Elasticsearch/OpenSearch or another log-search platform     |
| User profile storage                   | PostgreSQL or MongoDB                                       |
| Search relevance ranking               | Search engine or suitable full-text search implementation   |
| Business-critical inventory validation | Authoritative transactional database                        |

There is no universal database for every requirement.

---

# 15. Common Architectural Mistakes

## Mistake 1: Using Elasticsearch as the primary database without a strong reason

Elasticsearch can store documents, but its main strength is search.

Using it as the only system for transactional application data can create problems around:

- Business transactions.
- Data integrity.
- Relationship management.
- Application consistency.
- Recovery strategy.

Use a transactional database when the application requires transactional business operations.

## Mistake 2: Assuming SQL cannot perform full-text search

Incorrect.

PostgreSQL supports full-text search through `tsvector`, `tsquery`, GIN indexes, and ranking functions.

Elasticsearch is not automatically required whenever text search appears.

## Mistake 3: Assuming MongoDB is only a NoSQL storage layer

MongoDB provides:

- Indexes.
- Aggregations.
- Transactions.
- Replication.
- Sharding.
- Search capabilities through supported products and integrations.

Evaluate its capabilities before introducing another system.

## Mistake 4: Introducing Elasticsearch too early

A small application with basic filtering and search may work perfectly well with PostgreSQL or MongoDB.

Adding Elasticsearch creates another infrastructure dependency.

Do not introduce distributed-system complexity without a measurable need.

## Mistake 5: Treating search results as authoritative business data

Search results may be stale.

A product might have been:

- Deleted.
- Taken out of stock.
- Updated.
- Restricted.
- Made unavailable.

The application must validate critical operations against the source of truth.

## Mistake 6: Ignoring synchronization failures

A synchronization worker can fail.

If failures are silently ignored, the search index can become inconsistent.

Build retry, replay, monitoring, and rebuild mechanisms.

## Mistake 7: Copying every database field into Elasticsearch

Search documents should be designed around search requirements.

Do not blindly duplicate every sensitive or unnecessary application field.

Consider:

- Which fields are searched?
- Which fields are filtered?
- Which fields are sorted?
- Which fields are displayed?
- Which fields are safe to expose?

Minimize unnecessary data duplication.

---

# 16. Interview Questions and Answers

## Q1. What is the main difference between SQL databases and search databases?

SQL databases are primarily designed for structured data, relationships, constraints, and transactions.

Search databases are primarily designed for efficient text retrieval, relevance ranking, and search-oriented analytics.

## Q2. Why is Elasticsearch faster for many full-text search workloads?

Elasticsearch uses Lucene and search-oriented structures such as inverted indexes, allowing it to retrieve documents matching analyzed terms efficiently.

Actual performance still depends on indexing, hardware, queries, and workload.

## Q3. Can PostgreSQL perform full-text search?

Yes. PostgreSQL supports full-text search through `tsvector`, `tsquery`, dictionaries, ranking functions, and GIN indexes.

## Q4. If PostgreSQL supports full-text search, why use Elasticsearch?

Elasticsearch may be preferable when the application needs more advanced search behavior, extensive analyzer customization, fuzzy matching, autocomplete, relevance tuning, distributed search capacity, or search-oriented aggregations.

It is not automatically necessary for every application.

## Q5. What is the difference between a B-Tree and an inverted index?

A B-Tree stores ordered keys and is useful for structured lookups and ranges.

An inverted index maps terms to the documents containing those terms, making it useful for full-text retrieval.

## Q6. Can Elasticsearch replace PostgreSQL?

Not as a general-purpose transactional relational database.

Elasticsearch is not a direct replacement for relational constraints, complex joins, and general-purpose multi-row ACID transactions.

## Q7. Can MongoDB replace Elasticsearch?

Sometimes.

MongoDB supports indexing, aggregation, and search capabilities through products such as Atlas Search.

Whether it can replace Elasticsearch depends on search requirements, deployment, cost, and performance.

## Q8. Why do applications use MongoDB and Elasticsearch together?

MongoDB can serve as the authoritative operational database, while Elasticsearch provides advanced search and relevance ranking.

## Q9. What is eventual consistency in a MongoDB-to-Elasticsearch architecture?

It means Elasticsearch may temporarily contain an older version of data while asynchronous synchronization catches up.

Eventually, successful processing should bring the search projection in line with the authoritative database state.

## Q10. What is the dual-write problem?

It occurs when an application writes to two independent systems and one write succeeds while the other fails.

This can leave the systems inconsistent.

## Q11. How can you solve the dual-write problem?

Use an appropriate synchronization design, such as:

- Transactional outbox.
- MongoDB Change Streams with durable recovery.
- Queue-based workers.
- Retry mechanisms.
- Idempotent event processing.

These approaches still require handling ordering, duplicates, and failure recovery.

## Q12. Why should inventory validation happen in the primary database?

Search indexes can be stale. Inventory validation is a business-critical operation and should use the authoritative current inventory record and appropriate concurrency control.

## Q13. What is denormalization in search architecture?

Denormalization means copying related fields into a search document so that common search operations can retrieve them without performing relational joins.

## Q14. What is the biggest disadvantage of denormalization?

It creates duplicated data and synchronization responsibilities. Changes to one source entity may require updating multiple search documents.

## Q15. What is BM25?

BM25 is a relevance-scoring algorithm commonly used by Elasticsearch to rank documents based on query terms, term frequency, document frequency, and document-length normalization.

## Q16. Can SQL databases rank search results by relevance?

Yes. PostgreSQL provides functions such as `ts_rank` and `ts_rank_cd`.

## Q17. Is Elasticsearch a NoSQL database?

It is commonly classified as a distributed document-oriented search engine or search database. Its primary design goal is search and analytics rather than general-purpose document transactions.

## Q18. Should every application have Redis and Elasticsearch?

No.

Each additional system introduces operational complexity.

Add them when their capabilities solve an actual workload problem.

---

# 17. Practical Exercises

## Exercise 1: Choose the database

Select an appropriate starting database for each scenario.

| Scenario                                        | Your choice |
| ----------------------------------------------- | ----------- |
| Banking transaction system                      | ?           |
| Product discovery with fuzzy search             | ?           |
| User profile storage                            | ?           |
| Order management with multiple related entities | ?           |
| Search across millions of application logs      | ?           |
| Basic internal admin search                     | ?           |
| Financial reporting with complex joins          | ?           |
| Product autocomplete with relevance ranking     | ?           |

Suggested answers:

| Scenario                            | Suitable choice                                          |
| ----------------------------------- | -------------------------------------------------------- |
| Banking transaction system          | PostgreSQL or another transactional database             |
| Product discovery with fuzzy search | Elasticsearch or equivalent search engine                |
| User profile storage                | PostgreSQL or MongoDB                                    |
| Order management                    | PostgreSQL or another transactional database             |
| Log search                          | Elasticsearch/OpenSearch or another log-search platform  |
| Basic internal admin search         | Existing database may be sufficient                      |
| Financial reporting                 | PostgreSQL or an analytical database, depending on scale |
| Product autocomplete                | Elasticsearch or another suitable search solution        |

## Exercise 2: Identify the architecture problem

An application has:

```text
Node.js
   |
   |-- MongoDB
   |
   |-- Elasticsearch
```

The application performs:

```javascript
await Product.updateOne({ _id: "P101" }, { $set: { price: 1799 } });

await elasticsearch.index({
  index: "products",
  id: "P101",
  document: {
    price: 1799,
  },
});
```

Questions:

1. What happens if MongoDB succeeds but Elasticsearch fails?
2. What happens if Elasticsearch succeeds but MongoDB fails?
3. Why is this called a dual-write problem?
4. How would a transactional outbox improve reliability?
5. Why are retries and idempotency necessary?

## Exercise 3: Design product search

Requirements:

- Search by product name.
- Search by description.
- Support spelling mistakes.
- Filter by brand.
- Filter by category.
- Filter by price.
- Sort by price.
- Rank by relevance.
- Show brand counts.

Questions:

1. Would PostgreSQL be sufficient?
2. When would you introduce Elasticsearch?
3. Which fields should be `text`?
4. Which fields should be `keyword`?
5. Which fields should use numeric mappings?
6. Which data should remain authoritative in MongoDB or PostgreSQL?

## Exercise 4: Design a production architecture

Build a system using:

- Node.js.
- MongoDB.
- Elasticsearch.
- A queue or transactional outbox.
- Redis where useful.

Explain:

1. Where product data is stored.
2. How search documents are created.
3. How updates reach Elasticsearch.
4. How failed events are retried.
5. How duplicate events are handled.
6. How stale events are rejected.
7. How deleted products are removed.
8. How Elasticsearch can be rebuilt.
9. How the application handles temporarily stale search results.

---

# 18. Final Revision Sheet

| Concept           | SQL database                                              | Search database                                 |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------- |
| Primary purpose   | Structured data and transactions                          | Search and retrieval                            |
| Data organization | Tables and rows                                           | Search documents                                |
| Relationships     | Foreign keys and joins                                    | Denormalized documents are common               |
| Indexing          | B-Tree, Hash, GIN, GiST, and others depending on database | Inverted indexes and other Lucene structures    |
| Full-text search  | Supported by systems such as PostgreSQL                   | Core capability                                 |
| Relevance ranking | Supported by some systems                                 | Core capability                                 |
| Fuzzy search      | Depends on database and extensions                        | Common built-in capability                      |
| Autocomplete      | Possible with suitable techniques                         | Common search feature                           |
| Transactions      | General-purpose ACID transactions                         | Not a general-purpose transactional replacement |
| Aggregations      | SQL GROUP BY and related operations                       | Search aggregations                             |
| Scaling           | Depends on database architecture                          | Distributed search and shard architecture       |
| Typical role      | Source of truth                                           | Search-optimized projection                     |

---

# 19. The Most Important Mental Model

Do not think:

```text
SQL = Old
NoSQL = New
Elasticsearch = Faster Database
```

That is an incorrect way to understand database architecture.

Think in terms of workload:

```text
                  APPLICATION
                       |
                       v
                  NODE.JS API
                       |
          ---------------------------
          |            |            |
          v            v            v
     PostgreSQL     MongoDB    Elasticsearch
          |            |            |
          v            v            v
     Relational    Document     Search and
       Data          Data       Relevance
          |            |            |
          ---------------------------
                       |
                       v
              Business Application
```

These databases solve different problems.

A production application may use one, two, or several databases.

The goal is not to use more databases.

The goal is to use the smallest number of systems that satisfy the application's actual requirements.

**The uncomfortable architectural truth:** Adding Elasticsearch does not automatically make an application scalable. It creates another distributed system, another data consistency boundary, and another operational responsibility.

Start with the database that already fits the workload. Introduce a dedicated search engine when search requirements justify its additional complexity.
