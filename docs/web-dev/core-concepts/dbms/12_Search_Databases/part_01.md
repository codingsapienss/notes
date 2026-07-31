---
sidebar_label: Search Database Fundamentals
sidebar_position: 1
---

# Search Database Fundamentals

# 1. Introduction to Search Databases

**Search Databases**.

Search databases are designed to find relevant information efficiently, especially when users search using words, phrases, partial text, or concepts rather than exact database identifiers.

Examples:

- Searching products by name or description.
- Searching articles by keywords.
- Finding documents containing specific phrases.
- Searching logs for error messages.
- Finding relevant content even when the user does not type the exact wording.
- Filtering millions of records by text, category, date, or other attributes.

Common search technologies include:

- Elasticsearch
- OpenSearch
- Apache Solr
- Apache Lucene

## 1.1 Why do we need search databases?

Imagine you are building an e-commerce application.

Your MongoDB collection contains 10 lakh products.

Example document:

```javascript
{
    _id: 101,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    description: "Premium Android smartphone with advanced camera",
    price: 99999,
    tags: ["android", "5g", "flagship", "smartphone"]
}
```

A user searches:

```text
samsung phone
```

Your application needs to find relevant products.

A basic database query might be:

```javascript
db.products.find({
  name: {
    $regex: "samsung",
    $options: "i",
  },
});
```

This can work for simple requirements.

However, as the dataset grows and search requirements become more advanced, problems appear:

1. Searching arbitrary text can be expensive.
2. A query may need to inspect many documents.
3. Partial-word matching needs careful handling.
4. Typographical errors may produce no results.
5. Relevance ranking is difficult to implement manually.
6. Searching across multiple fields becomes complicated.
7. Synonyms and language-specific processing require additional logic.
8. Complex filtering and scoring can become difficult to maintain.

A dedicated search engine is designed to handle these kinds of workloads.

## 1.2 What is a Search Database?

A search database is a system optimized for searching and retrieving information based on text, terms, filters, and relevance.

Unlike a traditional database query that commonly retrieves records through exact conditions, a search engine can evaluate how closely documents match a search query.

For example, a user searches:

```text
wireless headphones
```

The search engine might return:

1. Wireless Bluetooth Headphones
2. Noise Cancelling Headphones
3. Bluetooth Earbuds
4. Wireless Audio Devices

These results may be relevant even when they do not contain the exact phrase `wireless headphones`.

The search engine can use:

- Text analysis.
- Tokenization.
- Inverted indexes.
- Relevance scoring.
- Query matching.
- Filtering.
- Ranking.

We will study these mechanisms in detail in the upcoming chapters.

---

# 2. Traditional Database Search vs Search Engine

Let's understand the fundamental difference.

## 2.1 Traditional database query

Suppose PostgreSQL contains:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    price NUMERIC
);
```

You want products with a specific name:

```sql
SELECT *
FROM products
WHERE name = 'Samsung Galaxy S24 Ultra';
```

This is an exact-match query.

With an appropriate B-tree index, PostgreSQL can efficiently locate the matching record.

Now consider:

```sql
SELECT *
FROM products
WHERE name ILIKE '%samsung%';
```

This searches for a substring.

A normal B-tree index generally cannot efficiently support an arbitrary leading-wildcard search such as `%samsung%`.

PostgreSQL has specialized options, such as trigram indexes, that can accelerate certain substring and similarity searches.

The point is not that relational databases cannot perform text search. They can.

The point is that search engines provide specialized indexing and ranking capabilities for large-scale text retrieval.

## 2.2 Search engine query

A search engine can index product information and evaluate a query such as:

```text
samsung phone
```

It can analyze the text into searchable terms and retrieve documents matching one or more terms.

It can also score documents based on relevance.

For example:

| Product                  | Possible relevance                  |
| ------------------------ | ----------------------------------- |
| Samsung Galaxy S24 Ultra | Very high                           |
| Samsung Galaxy S24       | High                                |
| Samsung phone case       | Medium                              |
| Apple iPhone 16          | Low or no match, depending on query |

The engine can consider:

- Which terms matched.
- Where the terms appeared.
- How frequently the terms occur.
- How rare the terms are across the index.
- Field importance.
- Other scoring signals.

This is more sophisticated than simply checking whether a string contains another string.

## 2.3 Comparison

| Feature                 | Traditional Database                               | Search Database                                      |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Primary purpose         | Store and retrieve structured data                 | Search and rank documents                            |
| Exact lookup            | Excellent                                          | Supported                                            |
| Relational transactions | Often a core capability                            | Product-dependent; generally not the primary purpose |
| Full-text search        | Supported by many databases                        | Core capability                                      |
| Relevance ranking       | Limited or specialized features                    | Core capability                                      |
| Typo tolerance          | Requires specialized features or application logic | Supported through configurable search features       |
| Tokenization            | Product-specific text features                     | Core indexing process                                |
| Inverted index          | Available in some databases                        | Fundamental search structure                         |
| Aggregations            | Strong, especially in SQL systems                  | Supported, but optimized for search workloads        |
| Typical use             | Orders, payments, users                            | Product search, logs, documents                      |

**Important:** This is a comparison of primary design goals, not a claim that relational databases cannot perform advanced search.

---

# 3. Understanding Full-Text Search

Full-text search is the process of searching for words and phrases inside textual content.

It is different from matching an entire field against an exact value.

## 3.1 Exact matching

Suppose we have these documents:

```text
Document 1: The quick brown fox jumps
Document 2: The quick red fox runs
Document 3: A brown dog jumps
```

An exact search might look for:

```text
The quick brown fox jumps
```

Only Document 1 matches the complete phrase.

## 3.2 Full-text matching

Now search for:

```text
brown fox
```

A full-text search engine can identify:

- Document 1: Contains both terms.
- Document 2: Contains `fox`, but not `brown`.
- Document 3: Contains `brown`, but not `fox`.

Depending on the query operator, the engine can return documents containing both terms or either term.

This is important because users generally do not know the exact text stored in a database.

They search using words that describe what they want.

## 3.3 Phrase search

Suppose the indexed content is:

```text
Document 1: wireless noise cancelling headphones
Document 2: noise cancelling wireless headphones
Document 3: wireless headphones with noise cancellation
```

A phrase search for:

```text
noise cancelling
```

looks for the terms appearing together in the specified order, subject to the search engine's phrase-query semantics and text analysis.

Phrase search is different from simply checking whether both words exist somewhere in a document.

## 3.4 Search across multiple fields

Consider a product:

```javascript
{
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    description: "Premium smartphone with advanced camera",
    category: "Mobile Phones"
}
```

A user searches:

```text
samsung camera phone
```

The search engine can search across multiple fields:

- Product name.
- Brand.
- Description.
- Category.

It can also assign different importance to each field.

For example:

| Field        | Boost |
| ------------ | ----: |
| Product name |     5 |
| Brand        |     4 |
| Category     |     2 |
| Description  |     1 |

This means a match in the product name can contribute more to the relevance score than a match in the description.

The exact scoring and query syntax depend on the search engine.

---

# 4. What Is a Document in a Search Database?

In search engines, a document is the unit of information being indexed and retrieved.

It does not necessarily mean a PDF or Word document.

A document can represent:

- A product.
- A user profile.
- A blog article.
- A support ticket.
- A log entry.
- A campaign.
- A web page.

Example product document:

```json
{
  "id": 101,
  "name": "Samsung Galaxy S24 Ultra",
  "brand": "Samsung",
  "category": "Smartphones",
  "description": "Premium Android smartphone with advanced camera",
  "price": 99999,
  "in_stock": true
}
```

A search engine processes this document and builds internal search structures.

When a query arrives, it searches those structures instead of simply scanning every original document.

## 4.1 Document vs database row

| Database row                             | Search document                                   |
| ---------------------------------------- | ------------------------------------------------- |
| A record in a relational table           | A searchable unit in an index                     |
| Organized around a relational schema     | Organized around searchable fields                |
| Retrieved through SQL operations         | Retrieved through search queries                  |
| May be normalized across tables          | Often indexed as a denormalized document          |
| Indexes support database access patterns | Search indexes support text retrieval and ranking |

A search document can contain fields from multiple source tables or collections.

For example, a product search document might combine:

- Product details.
- Brand name.
- Category name.
- Stock availability.
- Review summary.

This can reduce the need for multiple joins during search execution.

However, it introduces a synchronization problem when the original data changes.

We will cover this later when studying search architecture.

---

# 5. Introduction to Elasticsearch

One of the most widely used search engines is **Elasticsearch**.

Elasticsearch is a distributed search and analytics engine built on Apache Lucene.

Website: https://www.elastic.co/elasticsearch

It is commonly used for:

- Full-text search.
- Product search.
- Log analytics.
- Application monitoring.
- Observability.
- Document retrieval.
- Search-driven applications.

## 5.1 What is Apache Lucene?

Apache Lucene is a high-performance information retrieval library.

Website: https://lucene.apache.org/

It provides the underlying search capabilities used by Elasticsearch.

Lucene handles important search-engine operations such as:

- Text analysis.
- Inverted indexing.
- Query execution.
- Relevance scoring.
- Index segment management.

Elasticsearch provides a distributed service and API around Lucene.

Conceptually:

```text
                 Application
                      |
                      v
                Elasticsearch
                      |
                      v
                 Apache Lucene
                      |
                      v
              Search Index Structures
```

Lucene is a library, not a standalone distributed search service equivalent to Elasticsearch.

Elasticsearch provides cluster management, APIs, distributed search, and other capabilities around Lucene.

## 5.2 What is OpenSearch?

OpenSearch is an open-source distributed search and analytics suite.

Website: https://opensearch.org/

It originated as a fork of Elasticsearch and Kibana.

It supports capabilities such as:

- Full-text search.
- Distributed indexing.
- Search APIs.
- Aggregations.
- Observability use cases.
- Dashboards and visualization.

Elasticsearch and OpenSearch have similarities, but they are separate products with differences in versions, APIs, features, and ecosystem.

Do not assume every Elasticsearch feature or API is compatible with every OpenSearch version.

## 5.3 Elasticsearch vs PostgreSQL vs MongoDB

| Feature            | PostgreSQL                             | MongoDB                                | Elasticsearch                                    |
| ------------------ | -------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| Primary purpose    | Relational database                    | Document database                      | Search and analytics engine                      |
| Data model         | Tables and rows                        | BSON documents                         | Indexed documents                                |
| SQL                | Yes                                    | No, uses MongoDB query APIs            | Query DSL and other interfaces                   |
| Transactions       | Strong relational transactions         | Multi-document transactions            | Not designed as a transactional system of record |
| Full-text search   | Built-in full-text search              | Text indexes and other search options  | Core capability                                  |
| Relevance ranking  | Available through text-search features | Available through search capabilities  | Core capability                                  |
| Distributed search | Not its primary design                 | Sharding and distributed query support | Core architecture                                |
| Typical role       | Source of truth                        | Source of truth                        | Search projection/index                          |

**Architectural principle:** Elasticsearch should not automatically replace your main application database.

A common design is:

- PostgreSQL or MongoDB stores authoritative application data.
- Elasticsearch stores a searchable representation of that data.

---

# 6. How a Search Engine Works: High-Level Overview

Before learning the inverted index in Part 15B, understand the complete lifecycle.

A search engine generally has two major workflows:

1. Indexing documents.
2. Searching indexed documents.

## 6.1 Indexing workflow

Suppose your application sends this product:

```json
{
  "id": 101,
  "name": "Samsung Galaxy S24 Ultra",
  "description": "Premium Android smartphone"
}
```

A simplified indexing workflow:

```text
        Original Document
                |
                v
         Document Parsing
                |
                v
          Text Analysis
                |
                v
           Tokenization
                |
                v
        Index Construction
                |
                v
         Search Index
```

The search engine:

1. Receives the document.
2. Reads its fields.
3. Analyzes text fields.
4. Splits text into tokens.
5. Applies configured text-processing rules.
6. Builds searchable index structures.
7. Stores the indexed information.

The original document and the structures used for searching are related, but they are not necessarily stored in the same form.

## 6.2 Searching workflow

Now the user searches:

```text
samsung smartphone
```

A simplified workflow:

```text
          User Query
               |
               v
         Query Parsing
               |
               v
          Text Analysis
               |
               v
          Query Terms
               |
               v
         Index Lookup
               |
               v
        Matching Documents
               |
               v
        Relevance Scoring
               |
               v
          Result Ranking
               |
               v
        Return Results
```

The search engine:

1. Receives the query.
2. Analyzes its terms.
3. Looks up matching terms in the index.
4. Identifies matching documents.
5. Calculates relevance scores.
6. Sorts results.
7. Returns the requested results.

The actual execution architecture can be more complex, especially in a distributed cluster.

We will study that in Part 15D.

---

# 7. Text Analysis: How Search Engines Understand Text

A search engine generally does not treat every text field as an indivisible string.

It can process text using an analyzer.

An analyzer is a pipeline that transforms text into searchable terms.

A typical analyzer can contain:

1. Character filters.
2. A tokenizer.
3. Token filters.

We will explore each in detail.

## 7.1 Character filters

Character filters modify the input text before tokenization.

For example:

```text
Input:
"I love <b>Node.js</b>!"
```

A character filter might remove HTML tags:

```text
"I love Node.js!"
```

Character filters are optional and depend on the analyzer configuration.

## 7.2 Tokenizer

A tokenizer splits text into individual tokens.

Example:

```text
Input:
"Samsung Galaxy S24 Ultra"
```

Possible tokens:

```text
samsung
galaxy
s24
ultra
```

A tokenizer determines how the text is divided.

Different languages and text formats may require different tokenization strategies.

## 7.3 Token filters

Token filters modify the generated tokens.

Examples include:

- Lowercasing.
- Stop-word removal.
- Stemming.
- Synonym expansion.
- Character normalization.

Input:

```text
"THE Running Shoes"
```

After lowercasing:

```text
the running shoes
```

After stop-word removal:

```text
running shoes
```

After stemming, depending on the configured stemmer:

```text
run shoe
```

Stemming and stop-word removal are configuration-dependent. They are not automatically applied in every search engine or analyzer.

## 7.4 Example complete analysis

Input:

```text
"The Running Shoes are Comfortable"
```

Possible processing:

| Stage             | Result                                |
| ----------------- | ------------------------------------- |
| Original text     | The Running Shoes are Comfortable     |
| Lowercase         | the running shoes are comfortable     |
| Tokenization      | the, running, shoes, are, comfortable |
| Stop-word removal | running, shoes, comfortable           |
| Stemming          | run, shoe, comfortable                |

The final searchable terms may be:

```text
run
shoe
comfortable
```

This allows a query using a related word form to match the indexed content, depending on how the query is analyzed.

**Important:** The same or compatible analysis strategy must generally be used when indexing and searching a field. Otherwise, the query terms may not match the indexed terms as expected.

---

# 8. Important Search Concepts

Before going deeper into indexing, understand the vocabulary.

## 8.1 Token

A token is a unit produced during text analysis.

Example:

```text
"Node.js backend developer"
```

Possible tokens:

```text
node.js
backend
developer
```

The exact result depends on the tokenizer.

## 8.2 Term

A term is a searchable token stored in the index.

The terms are used to locate documents.

## 8.3 Analyzer

An analyzer processes text into searchable terms.

It can use:

- Character filters.
- Tokenizers.
- Token filters.

## 8.4 Inverted index

An inverted index maps terms to the documents containing them.

Example:

```text
samsung → Document 1, Document 3
iphone  → Document 2
android → Document 1, Document 4
```

Instead of scanning every document to find a term, the search engine can look up the term in the index.

This is the central concept of Part 15B.

## 8.5 Relevance scoring

Relevance scoring estimates how well a document matches a query.

A document with a stronger match may receive a higher score.

Scoring can consider:

- Term frequency.
- Term rarity.
- Field importance.
- Document length.
- Query configuration.

BM25 is a widely used relevance-ranking algorithm in Lucene-based search systems.

We will cover scoring in more detail in Part 15C.

## 8.6 Filtering

Filtering restricts results based on conditions.

Example:

```text
Search:
wireless headphones

Filters:
price < 5000
brand = Sony
in_stock = true
```

Search engines often distinguish between relevance-scored queries and filter conditions.

A filter generally determines whether a document qualifies rather than how relevant it is.

## 8.7 Faceted search

Faceted search lets users narrow results using categories or attributes.

Example:

```text
Search: headphones

Brand:
[ ] Sony
[ ] JBL
[ ] Bose

Price:
[ ] Under ₹1,000
[ ] ₹1,000–₹5,000
[ ] Above ₹5,000

Availability:
[ ] In stock
```

Search engines can calculate aggregations that power these facets.

## 8.8 Fuzzy search

Fuzzy search can match terms that are similar but not exactly equal.

For example:

```text
Query: samsng
```

Might match:

```text
Samsung
```

This can help with typographical errors.

However, fuzzy matching can increase query cost and may introduce irrelevant matches if configured too broadly.

It should be used deliberately.

## 8.9 Autocomplete

Autocomplete suggests possible queries while a user types.

Example:

```text
User types: sams

Suggestions:
Samsung Galaxy
Samsung TV
Samsung Galaxy S24
Samsung Galaxy Buds
```

Autocomplete can use:

- Prefix matching.
- Edge n-grams.
- Completion-specific index structures.
- Search-as-you-type features.

These approaches have different storage and performance tradeoffs.

---

# 9. Search Database Architecture: Basic Components

Let's understand the basic components of a search system.

```text
                   Application
                        |
                        v
                    Search API
                        |
                        v
                  Search Cluster
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
       Node 1         Node 2         Node 3
          |             |             |
          v             v             v
       Shards         Shards         Shards
          |             |             |
          v             v             v
      Index Data    Index Data    Index Data
```

This is a conceptual distributed search architecture.

The actual roles and shard placement depend on the product and cluster configuration.

## 9.1 Index

An index is a logical collection of searchable documents.

For example:

```text
products
users
articles
logs
orders
```

A product index might contain millions of product documents.

An index is not equivalent to a relational database index.

In Elasticsearch, an index is closer to a logical collection of documents, although its internal implementation involves Lucene indexes and shards.

## 9.2 Document

A document is one searchable record inside an index.

Example:

```json
{
  "id": 101,
  "name": "Samsung Galaxy S24",
  "price": 79999,
  "category": "Smartphones"
}
```

## 9.3 Field

A field represents an individual property of a document.

Example:

```text
id
name
price
category
```

Different field types have different indexing and query behavior.

For example:

- `text`: commonly analyzed for full-text search.
- `keyword`: commonly indexed as an exact value.
- `integer`: numeric values.
- `date`: date and time values.
- `boolean`: true or false values.

## 9.4 Shard

A shard is a partition of an index.

Large indexes can be distributed across multiple shards.

Sharding helps distribute storage and search work across nodes.

## 9.5 Replica

A replica is a copy of a shard.

Replicas can provide:

- High availability.
- Additional search capacity.
- Redundancy during node failures.

The exact behavior depends on the search engine and cluster configuration.

We will study distributed search architecture and shard behavior in Part 15D.

---

# 10. Elasticsearch Basic Terminology

If you work with Elasticsearch, these terms are important.

| Term           | Meaning                                            |
| -------------- | -------------------------------------------------- |
| Cluster        | Collection of Elasticsearch nodes working together |
| Node           | One running Elasticsearch instance                 |
| Index          | Logical collection of documents                    |
| Document       | Searchable record                                  |
| Field          | Property inside a document                         |
| Mapping        | Defines field types and indexing behavior          |
| Analyzer       | Processes text into searchable terms               |
| Shard          | Partition of an index                              |
| Replica        | Copy of a shard                                    |
| Query DSL      | JSON-based Elasticsearch query language            |
| Inverted index | Maps terms to documents containing them            |

## 10.1 Example index mapping

A simplified Elasticsearch mapping:

```json
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "brand": {
        "type": "keyword"
      },
      "price": {
        "type": "float"
      },
      "category": {
        "type": "keyword"
      },
      "description": {
        "type": "text"
      },
      "in_stock": {
        "type": "boolean"
      }
    }
  }
}
```

Notice the difference:

- `text` is suitable for analyzed full-text search.
- `keyword` is suitable for exact-value matching, sorting, and aggregations in many common scenarios.

A field's mapping matters because it determines how the field is indexed and which queries are appropriate.

## 10.2 Why are text and keyword different?

Consider:

```text
Samsung Galaxy S24 Ultra
```

If the field is mapped as `text`, an analyzer may produce:

```text
samsung
galaxy
s24
ultra
```

This supports full-text matching.

If it is mapped as `keyword`, the entire value is generally treated as one exact term:

```text
Samsung Galaxy S24 Ultra
```

This is useful for exact matching, sorting, and aggregations.

A common mapping pattern is to use both representations through multi-fields:

```json
{
  "name": {
    "type": "text",
    "fields": {
      "keyword": {
        "type": "keyword"
      }
    }
  }
}
```

This allows:

- Full-text searching through `name`.
- Exact-value operations through `name.keyword`.

---

# 11. Search Database vs Traditional Database: Practical Example

Suppose your application has 10 lakh products.

A user searches:

```text
best samsung camera phone
```

They expect:

1. Products related to Samsung.
2. Products related to cameras.
3. Relevant phones.
4. Higher-quality matches first.
5. Price filtering.
6. Brand filtering.
7. Typo tolerance where appropriate.

A traditional database can handle many of these requirements, but implementing advanced search behavior may require substantial custom logic and specialized indexing.

A search engine is designed for this category of workload.

## 11.1 Search architecture

```text
                User
                 |
                 v
           Frontend Search
                 |
                 v
             Backend API
                 |
                 v
           Elasticsearch
                 |
                 v
        Relevant Product Results
                 |
                 v
             Frontend
```

But where does Elasticsearch get the product data?

A common architecture:

```text
              Backend Application
                       |
                       v
                   MongoDB
                (Source of Truth)
                       |
                       v
                 Change Events
                       |
                       v
                Sync Consumer
                       |
                       v
                Elasticsearch
                (Search Index)
                       |
                       v
                 Search API
```

MongoDB stores the authoritative product data.

Elasticsearch stores an indexed representation optimized for searching.

When a product changes, the application or a synchronization process updates the corresponding search document.

This means search results may briefly be stale if indexing is asynchronous.

We will study synchronization and indexing architecture in Part 15D.

---

# 12. When Should You Use a Search Database?

A search database becomes useful when search is a major feature rather than a simple lookup.

## Good use cases

### 1. E-commerce search

Users search:

- Products.
- Brands.
- Categories.
- Descriptions.
- Product attributes.

Search engines can support relevance ranking, filters, facets, and autocomplete.

### 2. Log search

An application generates logs:

```text
2026-11-14 ERROR Payment service timeout
2026-11-14 INFO User logged in
2026-11-14 WARN Database connection slow
```

You need to search:

- Error messages.
- Time ranges.
- Service names.
- Log levels.
- Request IDs.

Search and analytics engines are useful for this workload.

### 3. Documentation search

Users search across:

- Technical documentation.
- Tutorials.
- Articles.
- Internal knowledge bases.

Search engines can retrieve relevant content even when the query does not exactly match a document title.

### 4. Website search

A website may contain thousands or millions of pages.

A search engine can index the content and retrieve relevant pages.

### 5. Support ticket search

A customer support platform may need to find tickets using:

- Issue descriptions.
- Error messages.
- Product names.
- Customer identifiers.
- Status and date filters.

A search engine can combine text relevance with structured filtering.

## When a search database may be unnecessary

Avoid introducing one when:

- The dataset is small.
- Searches are mostly exact lookups.
- Search requirements are simple.
- The existing database already performs well.
- The additional infrastructure is not justified.

For example:

If your application only needs to find a user by email:

```sql
SELECT *
FROM users
WHERE email = 'rahul@example.com';
```

PostgreSQL with a suitable index is sufficient.

Adding Elasticsearch for this query would be unnecessary complexity.

---

# 13. Search Database Tradeoffs

Search databases provide specialized capabilities, but they introduce tradeoffs.

| Tradeoff                           | Explanation                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Additional infrastructure          | Another cluster or managed service to operate                                      |
| Data synchronization               | Search indexes must reflect source database changes                                |
| Eventual consistency               | Search results may temporarily be stale                                            |
| Storage overhead                   | Search indexes require additional storage                                          |
| Mapping decisions                  | Incorrect field types can cause query problems                                     |
| Reindexing                         | Mapping or analyzer changes may require rebuilding indexes                         |
| Query complexity                   | Advanced search queries require search-specific knowledge                          |
| Cost                               | Storage, memory, CPU, and replicas add expense                                     |
| Not a replacement for transactions | The source database should generally handle authoritative transactional operations |

## 13.1 Source of truth vs search index

This distinction is critical.

Suppose a product's price changes from ₹50,000 to ₹45,000.

MongoDB stores the authoritative product record.

Elasticsearch stores the searchable product representation.

If the synchronization process is delayed, search results may temporarily show the old price.

Therefore:

- Use the source database for authoritative business operations.
- Use the search engine for discovery and relevance-based retrieval.
- Define how and when the search index is synchronized.

Do not assume that a search index is always perfectly synchronized with the source database.

---

# 14. Common Misconceptions

| Misconception                                    | Correct understanding                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Search databases are only for searching PDFs     | They index products, logs, articles, users, and other documents                         |
| SQL databases cannot perform full-text search    | PostgreSQL and other databases provide full-text capabilities                           |
| Elasticsearch is a replacement for PostgreSQL    | They have different primary responsibilities                                            |
| Elasticsearch stores only text                   | Search documents can contain text, numbers, dates, booleans, and other supported fields |
| Every search query is a substring search         | Search engines use analyzers, tokens, query types, and scoring                          |
| Search engines always return exact matches       | They can rank results by relevance                                                      |
| Elasticsearch is Apache Lucene                   | Elasticsearch is a distributed engine built on Lucene                                   |
| Every search engine uses the same query language | Products have different APIs and query languages                                        |
| A search index is always up to date              | Asynchronous indexing can create temporary staleness                                    |
| Adding more shards always improves performance   | Excessive shards introduce overhead                                                     |
| Fuzzy search should be enabled everywhere        | It can increase query cost and produce unwanted matches                                 |

---

# 15. Practical Exercise

Let's design a product search system.

## Requirements

You are building an e-commerce platform with:

- 10 lakh products.
- Product names.
- Descriptions.
- Brands.
- Categories.
- Prices.
- Stock availability.

Users should be able to:

1. Search by product name.
2. Search by description.
3. Filter by brand.
4. Filter by category.
5. Filter by price.
6. Search with minor spelling mistakes.
7. Sort by price.
8. Receive relevant products first.

## Exercise A: Choose the database

Which system should store the authoritative product data?

Possible answer:

MongoDB or PostgreSQL, depending on the application's data model and transactional requirements.

Which system should power advanced search?

Possible answer:

Elasticsearch or OpenSearch, if their capabilities and operational costs justify introducing a dedicated search system.

## Exercise B: Design the document

Example search document:

```json
{
  "product_id": 101,
  "name": "Samsung Galaxy S24 Ultra",
  "brand": "Samsung",
  "category": "Smartphones",
  "description": "Premium Android smartphone with advanced camera",
  "price": 99999,
  "in_stock": true
}
```

## Exercise C: Design the mapping

Decide which fields should be:

- `text`
- `keyword`
- Numeric
- Boolean

Suggested mapping:

| Field       | Type                              | Reason                          |
| ----------- | --------------------------------- | ------------------------------- |
| product_id  | keyword                           | Exact identifier                |
| name        | text                              | Full-text search                |
| brand       | keyword                           | Exact filtering and aggregation |
| category    | keyword                           | Filtering and aggregation       |
| description | text                              | Full-text search                |
| price       | float or appropriate numeric type | Numeric filtering and sorting   |
| in_stock    | boolean                           | Availability filtering          |

For currency, consider using integer minor units or an appropriate precise representation rather than relying on floating-point arithmetic for authoritative financial calculations.

## Exercise D: Design synchronization

What happens when:

- A product is created?
- A product is updated?
- A product is deleted?
- An indexing request fails?
- The search cluster becomes unavailable?

Think about event processing, retries, idempotency, deletion handling, and rebuilding the index.

---

# 16. Interview Questions

### Q1. What is a search database?

A search database is a system optimized for retrieving relevant documents based on text, terms, filters, and relevance scoring.

Examples include Elasticsearch, OpenSearch, and Solr.

### Q2. What is full-text search?

Full-text search searches textual content using analyzed terms rather than requiring an exact match of the entire field.

### Q3. What is Apache Lucene?

Apache Lucene is a search and information retrieval library that provides indexing, querying, and relevance-scoring capabilities.

Elasticsearch uses Lucene as its underlying search engine.

### Q4. What is Elasticsearch?

Elasticsearch is a distributed search and analytics engine built on Apache Lucene.

It provides APIs and cluster-level capabilities for indexing, searching, aggregating, and managing data.

### Q5. What is an inverted index?

An inverted index maps terms to the documents containing those terms.

It allows a search engine to find documents containing a term without scanning every document.

Detailed internal structure is covered in Part 15B.

### Q6. What is an analyzer?

An analyzer processes text into searchable terms using character filters, tokenization, and token filters.

### Q7. What is the difference between `text` and `keyword`?

A `text` field is generally analyzed into tokens for full-text search.

A `keyword` field is generally indexed as a single exact value and is useful for exact matching, sorting, and aggregations.

### Q8. What is relevance scoring?

Relevance scoring estimates how closely a document matches a search query.

Documents with higher scores are generally ranked above documents with lower scores.

### Q9. Why should Elasticsearch not automatically replace PostgreSQL?

PostgreSQL is designed for authoritative relational data and transactional workloads.

Elasticsearch is designed for search and analytics.

Using Elasticsearch as the only source of truth can introduce unnecessary complexity and may not satisfy the application's transactional requirements.

### Q10. What is the difference between Elasticsearch and Lucene?

Lucene is a search library.

Elasticsearch is a distributed search engine built around Lucene.

### Q11. What is the difference between a search index and a relational index?

A relational index is an access structure used by a database to locate or order rows.

An Elasticsearch index is a logical collection of searchable documents, internally represented using Lucene index structures and shards.

### Q12. Why can search results be stale?

Because source data and search indexes are often synchronized asynchronously.

A change may be committed in the source database before the corresponding search document becomes searchable.

---

# 17. Part 15A — Final Revision

| Concept           | Key takeaway                                                |
| ----------------- | ----------------------------------------------------------- |
| Search database   | Optimized for text retrieval and relevance                  |
| Full-text search  | Searches textual content using analyzed terms               |
| Search document   | Unit of searchable information                              |
| Token             | Unit produced during text analysis                          |
| Analyzer          | Converts text into searchable terms                         |
| Character filter  | Modifies text before tokenization                           |
| Tokenizer         | Splits text into tokens                                     |
| Token filter      | Modifies generated tokens                                   |
| Inverted index    | Maps terms to documents                                     |
| Relevance scoring | Estimates how well a document matches                       |
| Fuzzy search      | Allows approximate term matching                            |
| Autocomplete      | Suggests queries as users type                              |
| Faceted search    | Allows filtering by categories and attributes               |
| Elasticsearch     | Distributed search engine                                   |
| Apache Lucene     | Search library used by Elasticsearch                        |
| OpenSearch        | Open-source search and analytics suite                      |
| Index             | Logical collection of searchable documents in Elasticsearch |
| Mapping           | Defines field types and indexing behavior                   |
| Shard             | Partition of an index                                       |
| Replica           | Copy of a shard                                             |
| Source of truth   | Authoritative application data store                        |
