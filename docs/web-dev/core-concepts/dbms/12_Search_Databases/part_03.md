---
sidebar_label: Search Query Types, Relevance Scoring and Ranking
sidebar_position: 1
---

# Search Query Types, Relevance Scoring and Ranking

# 1. Introduction

**Once a search engine has indexed documents, how does it understand and execute different types of search queries?**

Consider an e-commerce application with 10 lakh products.

A user searches:

```text
samsung galaxy phone
```

The search engine needs to determine:

- Which products contain these terms?
- Should all three terms be required?
- Should a product containing only two terms also appear?
- Should an exact phrase receive a higher score?
- Should the product name matter more than the description?
- Should spelling mistakes be tolerated?
- How should the matching products be ranked?
- How should price and availability filters be applied?

These are problems handled by search query types and relevance-scoring algorithms.

In this chapter, we will cover:

1. Exact-match queries.
2. Full-text queries.
3. Match queries.
4. Phrase queries.
5. Prefix queries.
6. Wildcard queries.
7. Fuzzy queries.
8. Boolean queries.
9. Range queries.
10. Filtering vs scoring.
11. Relevance scoring.
12. TF-IDF.
13. BM25.
14. Sorting and aggregations.
15. Autocomplete and search-as-you-type.

Examples will primarily use Elasticsearch Query DSL.

---

# 2. Understanding Search Query Types

Different search requirements need different query types.

Consider these product documents:

```json
[
  {
    "id": 1,
    "name": "Samsung Galaxy S24 Ultra",
    "brand": "Samsung",
    "category": "Smartphones",
    "description": "Premium Android smartphone with advanced camera",
    "price": 99999,
    "in_stock": true
  },
  {
    "id": 2,
    "name": "Samsung Galaxy S24",
    "brand": "Samsung",
    "category": "Smartphones",
    "description": "Android smartphone for everyday use",
    "price": 79999,
    "in_stock": true
  },
  {
    "id": 3,
    "name": "Apple iPhone 16",
    "brand": "Apple",
    "category": "Smartphones",
    "description": "Premium smartphone with advanced camera",
    "price": 89999,
    "in_stock": false
  },
  {
    "id": 4,
    "name": "Google Pixel 9",
    "brand": "Google",
    "category": "Smartphones",
    "description": "Android smartphone with computational photography",
    "price": 74999,
    "in_stock": true
  }
]
```

Suppose users can search products in different ways.

| User requirement                              | Query type                      |
| --------------------------------------------- | ------------------------------- |
| Find brand exactly equal to Samsung           | Term query                      |
| Find products related to Samsung phone        | Match query                     |
| Find the exact phrase Galaxy S24              | Match phrase query              |
| Find names starting with Sam                  | Prefix query                    |
| Find terms matching `sams*`                   | Wildcard query                  |
| Find Samsung despite a small spelling mistake | Fuzzy query                     |
| Find Samsung products under ₹90,000           | Boolean query with range filter |
| Find products between two prices              | Range query                     |

Let's understand each.

---

# 3. Exact-Match Queries

An exact-match query searches for a specific indexed term or value.

In Elasticsearch, the `term` query is commonly used for exact matching.

Example:

```json
GET /products/_search
{
  "query": {
    "term": {
      "brand": "Samsung"
    }
  }
}
```

This searches for the exact indexed term `Samsung` in the `brand` field.

It is appropriate when the field is mapped as `keyword`.

## 3.1 Why use keyword fields?

Suppose the document contains:

```json
{
  "brand": "Samsung Electronics"
}
```

If `brand` is mapped as `keyword`, the entire value is generally indexed as one term:

```text
Samsung Electronics
```

A term query for:

```text
Samsung Electronics
```

can match the complete value.

A term query for:

```text
Samsung
```

will not match that complete keyword value.

This is different from a `text` field, where an analyzer may split the value into tokens.

## 3.2 Term query vs Match query

| Term query                                                   | Match query                         |
| ------------------------------------------------------------ | ----------------------------------- |
| Searches exact indexed terms                                 | Analyzes the query text             |
| Does not analyze input text in the same way as a match query | Applies the field's search analyzer |
| Commonly used for keyword fields                             | Commonly used for text fields       |
| Suitable for exact identifiers and categories                | Suitable for full-text search       |

Example mapping:

```json
{
  "mappings": {
    "properties": {
      "brand": {
        "type": "keyword"
      },
      "name": {
        "type": "text"
      }
    }
  }
}
```

Exact brand search:

```json
GET /products/_search
{
  "query": {
    "term": {
      "brand": "Samsung"
    }
  }
}
```

Full-text product-name search:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung Galaxy"
    }
  }
}
```

**Important:** A term query does not automatically mean that the original string is compared byte-for-byte. It matches indexed terms. Normalizers, keyword field configuration, and case handling can affect the indexed representation.

---

# 4. Full-Text Search and Match Query

A full-text query searches analyzed text.

The most common Elasticsearch query for this purpose is `match`.

Example:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung Galaxy phone"
    }
  }
}
```

The search engine:

1. Receives the query.
2. Analyzes the query text.
3. Generates terms.
4. Looks up those terms in the inverted index.
5. Finds candidate documents.
6. Calculates relevance scores.
7. Returns ranked results.

## 4.1 How does a match query work?

Suppose the analyzer produces:

```text
Input:
Samsung Galaxy phone

Tokens:
samsung
galaxy
phone
```

The search engine looks up the postings for these terms.

A document containing multiple matching terms can receive a higher score than a document containing only one term, depending on the scoring model and query configuration.

## 4.2 OR behavior by default

A standard `match` query generally uses `OR` as its default operator.

Example:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung Galaxy"
    }
  }
}
```

Conceptually, this can match documents containing:

```text
Samsung OR Galaxy
```

It does not require both terms by default.

## 4.3 Using the AND operator

If you want all terms to match:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": {
        "query": "Samsung Galaxy",
        "operator": "and"
      }
    }
  }
}
```

Conceptually:

```text
Samsung AND Galaxy
```

A document must contain both analyzed terms to match.

## 4.4 Minimum should match

Sometimes requiring every term is too restrictive.

Suppose the user searches:

```text
samsung galaxy ultra smartphone
```

You may want at least two terms to match.

Example:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": {
        "query": "samsung galaxy ultra smartphone",
        "minimum_should_match": 2
      }
    }
  }
}
```

This allows documents to match if at least two of the generated optional clauses match.

The exact behavior can depend on the query structure and how the text is analyzed.

## 4.5 When to use match queries

Use `match` for:

- Product-name search.
- Article search.
- Description search.
- Blog search.
- Documentation search.
- General full-text retrieval.

---

# 5. Match Phrase Query

A match query searches analyzed terms.

A `match_phrase` query adds positional requirements.

It searches for terms occurring in the specified order and within the allowed phrase distance.

Consider:

```text
Document 1:
Samsung Galaxy S24 Ultra

Document 2:
Galaxy Samsung S24 Ultra

Document 3:
Samsung Galaxy S24
```

Search:

```text
"Samsung Galaxy"
```

Example:

```json
GET /products/_search
{
  "query": {
    "match_phrase": {
      "name": "Samsung Galaxy"
    }
  }
}
```

Conceptually:

- Document 1 matches.
- Document 2 does not match because the order is reversed.
- Document 3 matches.

## 5.1 Why does phrase search need positions?

From Part 15B, we learned that inverted indexes can store term positions.

For Document 1:

```text
Samsung → position 0
Galaxy  → position 1
S24     → position 2
Ultra   → position 3
```

For Document 2:

```text
Galaxy  → position 0
Samsung → position 1
S24     → position 2
Ultra   → position 3
```

The phrase query checks the relative positions of the terms.

## 5.2 Slop

Sometimes users want to allow a small gap between terms.

Example:

```text
Document:
Samsung Galaxy S24 Ultra
```

Query:

```text
Samsung S24
```

These terms are not adjacent.

A phrase query with a suitable `slop` can allow positional movement or intervening terms.

Example:

```json
GET /products/_search
{
  "query": {
    "match_phrase": {
      "name": {
        "query": "Samsung S24",
        "slop": 2
      }
    }
  }
}
```

The `slop` parameter controls how much positional distance or movement is permitted.

It is not simply a universal count of words between terms; its exact positional semantics matter, especially when terms are reordered.

## 5.3 When to use phrase queries

- Product model names.
- Exact titles.
- Legal document phrases.
- Technical error messages.
- Documentation search.
- Searches where word order matters.

---

# 6. Prefix Query

A prefix query matches indexed terms that begin with a particular sequence of characters.

Example:

```text
Query: sams
```

Possible matches:

```text
samsung
samsara
samson
```

Elasticsearch example:

```json
GET /products/_search
{
  "query": {
    "prefix": {
      "name.keyword": {
        "value": "Sams"
      }
    }
  }
}
```

This assumes `name.keyword` exists as a keyword field.

A prefix query does not perform ordinary full-text analysis in the same way as a match query.

Its matching behavior depends on the indexed terms and field mapping.

## 6.1 Prefix query vs Match query

| Prefix query                                  | Match query                           |
| --------------------------------------------- | ------------------------------------- |
| Matches terms beginning with a prefix         | Matches analyzed query terms          |
| Useful for partial term matching              | Useful for full-text search           |
| Commonly used for autocomplete-style behavior | Commonly used for general search      |
| Can be expensive for broad prefixes           | Uses analyzed term lookup and scoring |

**Important:** Prefix queries can be expensive on large term dictionaries if not designed carefully. Specialized prefix indexing or completion structures can improve performance.

---

# 7. Wildcard Query

A wildcard query allows pattern-based matching.

Common wildcard symbols:

| Symbol | Meaning                         |
| ------ | ------------------------------- |
| `*`    | Matches zero or more characters |
| `?`    | Matches exactly one character   |

Example:

```text
sams*
```

Could match:

```text
samsung
samsara
samson
```

Elasticsearch example:

```json
GET /products/_search
{
  "query": {
    "wildcard": {
      "name.keyword": {
        "value": "sams*"
      }
    }
  }
}
```

Another example:

```json
GET /products/_search
{
  "query": {
    "wildcard": {
      "name.keyword": {
        "value": "galaxy s2?"
      }
    }
  }
}
```

This could match terms such as:

```text
galaxy s20
galaxy s21
galaxy s22
```

depending on the indexed value and pattern.

## 7.1 Wildcard query vs Prefix query

| Prefix                                      | Wildcard                               |
| ------------------------------------------- | -------------------------------------- |
| Matches a starting sequence                 | Matches a general pattern              |
| Simpler query                               | More flexible query                    |
| Example: `sams`                             | Example: `sams*`                       |
| Usually a better choice for simple prefixes | Useful when patterns require wildcards |

## 7.2 Why can wildcard queries be expensive?

Consider:

```text
*phone
```

The search engine may need to consider many indexed terms that end with `phone`.

A leading wildcard can be particularly expensive because it cannot simply narrow the search using the beginning of the term.

Use wildcard queries carefully, especially on large indexes.

---

# 8. Fuzzy Query

Users make spelling mistakes.

Example:

```text
User searches:
samsng
```

But the actual product name is:

```text
Samsung
```

A normal exact term lookup may not find it.

Fuzzy queries allow approximate term matching using edit-distance concepts.

## 8.1 Levenshtein distance

Levenshtein distance measures the minimum number of single-character operations required to transform one string into another.

Common operations:

1. Insertion.
2. Deletion.
3. Substitution.

Example:

```text
samsng
samsung
```

One possible transformation is inserting `u`.

Therefore, the edit distance is 1.

Another example:

```text
cat
cut
```

Replace `a` with `u`.

Edit distance = 1.

## 8.2 Elasticsearch fuzzy query

Example:

```json
GET /products/_search
{
  "query": {
    "fuzzy": {
      "brand": {
        "value": "samsng",
        "fuzziness": 1
      }
    }
  }
}
```

This can match an indexed term such as `Samsung` if it falls within the configured edit distance and other query conditions.

## 8.3 Fuzziness

The `fuzziness` parameter controls how much variation is permitted.

Conceptually:

| Fuzziness | Meaning                       |
| --------- | ----------------------------- |
| 0         | Exact term                    |
| 1         | Allow approximately one edit  |
| 2         | Allow approximately two edits |

Elasticsearch also supports `AUTO` fuzziness, which chooses edit-distance behavior based on term length.

Exact behavior and limits depend on the engine version and query configuration.

## 8.4 Fuzzy search tradeoffs

Fuzzy search can:

- Improve user experience.
- Handle typing mistakes.
- Retrieve approximate matches.

But it can also:

- Increase query cost.
- Generate more candidate terms.
- Produce irrelevant matches.
- Become problematic for very short terms.

For example, allowing two edits on a three-character word can produce too many unrelated matches.

Use fuzzy search selectively.

## 8.5 Fuzzy query vs Prefix query

| Fuzzy query                    | Prefix query                     |
| ------------------------------ | -------------------------------- |
| Handles spelling differences   | Handles incomplete starting text |
| Uses approximate term matching | Uses starting-character matching |
| Example: `samsng` → `samsung`  | Example: `sams` → `samsung`      |
| Useful for typo tolerance      | Useful for partial input         |

---

# 9. Boolean Queries

Real-world searches often combine several conditions.

For example:

> Find Samsung smartphones priced below ₹90,000 that are in stock.

This requires:

- Full-text or exact brand matching.
- Category filtering.
- Price filtering.
- Availability filtering.

Elasticsearch provides the `bool` query for combining conditions.

The main clauses are:

| Clause     | Meaning                                                 |
| ---------- | ------------------------------------------------------- |
| `must`     | Must match; contributes to scoring                      |
| `filter`   | Must match; does not contribute to relevance score      |
| `should`   | Optional matching clause, unless configured as required |
| `must_not` | Must not match                                          |

## 9.1 Must

A `must` clause requires a query to match and contributes to the relevance score.

Example:

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "Samsung Galaxy"
          }
        }
      ]
    }
  }
}
```

The product name must match the analyzed query.

## 9.2 Filter

A filter restricts results without contributing to the relevance score.

Example:

```json
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "term": {
            "brand": "Samsung"
          }
        }
      ]
    }
  }
}
```

This restricts results to documents with the exact indexed brand term.

Filters are useful for:

- Brand.
- Category.
- Availability.
- Date ranges.
- Price ranges.
- Status.

## 9.3 Should

A `should` clause expresses optional matching conditions.

Example:

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "Samsung"
          }
        }
      ],
      "should": [
        {
          "match": {
            "description": "premium"
          }
        }
      ]
    }
  }
}
```

Here:

- The name must match Samsung.
- A premium description can increase relevance.

A `should` clause is not always required.

Its required/optional behavior depends on the presence of other clauses and the `minimum_should_match` setting.

When a `bool` query has a `must` or `filter` clause, `should` clauses are generally optional by default.

## 9.4 Must Not

A `must_not` clause excludes matching documents.

Example:

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must_not": [
        {
          "term": {
            "in_stock": false
          }
        }
      ]
    }
  }
}
```

This excludes products where `in_stock` is false.

## 9.5 Complete Boolean query

Requirement:

- Product name should match Samsung.
- Brand must be Samsung.
- Price must be below ₹90,000.
- Product must be in stock.
- Premium products should receive an additional relevance boost.

Example:

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "Samsung"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "brand": "Samsung"
          }
        },
        {
          "range": {
            "price": {
              "lt": 90000
            }
          }
        },
        {
          "term": {
            "in_stock": true
          }
        }
      ],
      "should": [
        {
          "match": {
            "description": "premium"
          }
        }
      ]
    }
  }
}
```

This is a practical example of combining relevance-based matching with structured filtering.

---

# 10. Range Queries

A range query retrieves documents whose field values fall within a specified range.

It is useful for:

- Price.
- Dates.
- Age.
- Ratings.
- Numeric metrics.

Example:

```json
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 50000,
        "lte": 100000
      }
    }
  }
}
```

This retrieves products priced between ₹50,000 and ₹1,00,000, inclusive.

## 10.1 Range operators

| Operator | Meaning                  |
| -------- | ------------------------ |
| `gt`     | Greater than             |
| `gte`    | Greater than or equal to |
| `lt`     | Less than                |
| `lte`    | Less than or equal to    |

Example:

```json
{
  "range": {
    "price": {
      "gt": 50000,
      "lt": 100000
    }
  }
}
```

This excludes both boundary values.

## 10.2 Date range example

```json
GET /orders/_search
{
  "query": {
    "range": {
      "created_at": {
        "gte": "2026-11-01",
        "lt": "2026-12-01"
      }
    }
  }
}
```

This searches orders created during November 2026, assuming the field is mapped as a date and the date values are interpreted as intended.

Use an exclusive upper bound for month-based ranges when possible. It avoids ambiguity around the last moment of the month.

---

# 11. Filtering vs Scoring

This is one of the most important concepts in search system design.

Search engines need to answer two separate questions:

1. Does this document qualify?
2. How relevant is this document?

These are different operations.

## 11.1 Filtering

Filtering determines whether a document should be included.

Example:

```text
brand = Samsung

price < 90000

in_stock = true
```

These conditions determine eligibility.

A product either satisfies the filter or it does not.

## 11.2 Scoring

Scoring determines how relevant a matching document is to the search query.

Example:

```text
Search: Samsung Galaxy phone
```

Consider:

| Product                  | Matching terms  |
| ------------------------ | --------------- |
| Samsung Galaxy S24 Ultra | Samsung, Galaxy |
| Samsung Galaxy S24       | Samsung, Galaxy |
| Samsung phone case       | Samsung         |
| Galaxy phone cover       | Galaxy, phone   |

The search engine may assign different relevance scores based on term matches, field importance, and other factors.

## 11.3 Comparison

| Filtering                                         | Scoring                        |
| ------------------------------------------------- | ------------------------------ |
| Determines eligibility                            | Determines relevance           |
| Usually binary                                    | Numeric score                  |
| Does not contribute to `_score` in filter context | Contributes to `_score`        |
| Useful for category, price, status                | Useful for text relevance      |
| Can benefit from filter caching                   | Requires relevance computation |

## 11.4 Why separate them?

Suppose a user searches:

```text
Samsung Galaxy phone
```

And applies filters:

```text
Brand = Samsung
Price < ₹90,000
In stock = true
```

The application should first restrict the result set to eligible products.

Then it can rank those products based on relevance.

This avoids treating every business constraint as a relevance signal.

A filter should not make a product more relevant merely because it is in stock.

It should simply determine whether the product is eligible to appear.

## 11.5 Elasticsearch example

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "Samsung Galaxy phone"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "brand": "Samsung"
          }
        },
        {
          "range": {
            "price": {
              "lt": 90000
            }
          }
        },
        {
          "term": {
            "in_stock": true
          }
        }
      ]
    }
  }
}
```

Here:

- `must` handles relevance-based matching.
- `filter` handles eligibility.

---

# 12. Relevance Scoring

Suppose a user searches:

```text
database indexing
```

The search engine finds:

| Document | Content                              |
| -------- | ------------------------------------ |
| 1        | Database indexing fundamentals       |
| 2        | Database transactions                |
| 3        | Understanding indexing in PostgreSQL |
| 4        | Introduction to databases            |

Which document should appear first?

Document 1 contains both search terms.

Document 3 contains `indexing` but not necessarily `database` as an exact analyzed term.

Document 2 contains `database` but not `indexing`.

Document 4 contains `database` but not `indexing`.

The search engine needs a ranking mechanism.

This is called relevance scoring.

## 12.1 What is a relevance score?

A relevance score is a numeric value estimating how well a document matches a query.

In Elasticsearch, the relevance score is commonly exposed as:

```json
"_score": 4.82
```

A higher score generally indicates a stronger match.

However:

- Scores are not probabilities.
- A score of 10 does not mean 10% relevance.
- Scores are generally meaningful within the context of a query.
- Scores from unrelated queries should not be compared as if they were on a universal scale.

## 12.2 What influences relevance?

Common signals include:

1. Term frequency.
2. Document frequency.
3. Document length.
4. Field importance.
5. Phrase matching.
6. Query structure.
7. Custom scoring rules.

Different search engines and query types use different scoring models.

Lucene-based systems commonly use BM25 by default for many text-scoring queries.

---

# 13. TF-IDF: Term Frequency–Inverse Document Frequency

TF-IDF is a classical information retrieval scoring approach.

It combines two ideas:

1. Term Frequency (TF).
2. Inverse Document Frequency (IDF).

The goal is to give more importance to terms that are useful for identifying relevant documents.

## 13.1 Term Frequency

Term Frequency measures how frequently a term appears in a document.

Example:

```text
Document 1:
Database indexing is important.
Database indexing improves search.
```

The term `database` appears twice.

The term `indexing` appears twice.

A simplified raw term frequency:

```text
TF(database, Document 1) = 2

TF(indexing, Document 1) = 2
```

Some TF-IDF implementations normalize or transform raw term frequency rather than using the raw count directly.

## 13.2 Inverse Document Frequency

Suppose an index contains 1,000 documents.

The term `database` appears in 800 documents.

The term `postgresql` appears in 50 documents.

The term `btree` appears in only 5 documents.

Which term is more useful for identifying a specific document?

Often, the rarer term provides more distinguishing information.

IDF assigns higher weight to terms that appear in fewer documents.

A simplified IDF formula is:

\[
IDF(t) = \log\left(\frac{N}{DF(t)}\right)
\]

Where:

- \(N\) = total number of documents.
- \(DF(t)\) = number of documents containing term \(t\).

Some implementations use smoothing to avoid edge cases and improve numerical behavior.

## 13.3 Example calculation

Suppose:

\[
N = 1000
\]

Term statistics:

| Term       | Document Frequency |
| ---------- | -----------------: |
| database   |                800 |
| postgresql |                 50 |
| btree      |                  5 |

Using the simplified formula:

\[
IDF(t) = \log\left(\frac{N}{DF(t)}\right)
\]

For `database`:

\[
IDF(database) = \log(1000/800)
\]

\[
\approx 0.223
\]

For `postgresql`:

\[
IDF(postgresql) = \log(1000/50)
\]

\[
\approx 2.996
\]

For `btree`:

\[
IDF(btree) = \log(1000/5)
\]

\[
\approx 5.298
\]

<text></text>

The rarer term receives a higher IDF value.

## 13.4 Combining TF and IDF

A simplified TF-IDF score:

\[
TFIDF(t,d) = TF(t,d) \times IDF(t)
\]

Where:

- \(t\) = term.
- \(d\) = document.

A document receives a stronger score for a term when:

- The term appears frequently in that document.
- The term is relatively rare across the collection.

## 13.5 TF-IDF limitations

TF-IDF is useful conceptually, but it has limitations:

- Raw term frequency can over-reward repeated words.
- Document length needs consideration.
- It does not fully capture word order.
- It does not understand semantic meaning.
- It can be sensitive to collection statistics.

Modern search engines commonly use more advanced ranking models.

One important model is BM25.

---

# 14. BM25: Best Matching 25

BM25 is a probabilistic relevance-ranking function widely used in information retrieval.

It is the default similarity model in many Lucene-based search configurations unless changed.

BM25 improves on simpler term-frequency approaches by incorporating:

1. Term frequency.
2. Inverse document frequency.
3. Document length normalization.
4. Tunable saturation parameters.

## 14.1 Why do we need BM25?

Suppose a user searches:

```text
database indexing
```

Consider two documents.

Document A:

```text
Database indexing is important.
```

Document B:

```text
Database indexing is important.
Database indexing is useful.
Database indexing improves performance.
Database indexing helps searching.
```

Document B contains the terms more frequently.

Should it always receive a proportionally higher score?

No.

Repeated occurrences should provide additional evidence, but their value should diminish.

BM25 uses term-frequency saturation to prevent unlimited linear growth.

It also considers document length so that longer documents are not automatically rewarded simply because they contain more words.

## 14.2 BM25 formula

A common form of the BM25 score for a query is:

\[
Score(Q,D) =
\sum\_{t \in Q}
IDF(t)
\cdot
\frac{f(t,D)(k_1+1)}
{f(t,D)+k_1\left(1-b+b\frac{|D|}{avgdl}\right)}
\]

Where:

| Symbol     | Meaning                                   |
| ---------- | ----------------------------------------- | --- | --------------- |
| \(Q\)      | Query terms                               |
| \(D\)      | Document                                  |
| \(t\)      | Query term                                |
| \(f(t,D)\) | Frequency of term \(t\) in document \(D\) |
| \(IDF(t)\) | Inverse document frequency                |
| \(         | D                                         | \)  | Document length |
| \(avgdl\)  | Average document length                   |
| \(k_1\)    | Controls term-frequency saturation        |
| \(b\)      | Controls document-length normalization    |

The precise IDF formulation can vary by implementation.

## 14.3 Term-frequency saturation

BM25 does not increase the contribution of a term linearly forever.

As term frequency increases, the additional contribution becomes smaller.

This prevents a document from dominating merely because it repeats the same search term many times.

## 14.4 Document-length normalization

Suppose:

Document A has 100 words.

Document B has 10,000 words.

Both contain `database` five times.

A simple term-frequency model gives them equal TF.

But the term may be more significant in the shorter document.

BM25 accounts for document length using the ratio:

\[
\frac{|D|}{avgdl}
\]

This helps normalize the score.

## 14.5 Parameters \(k_1\) and \(b\)

### \(k_1\)

Controls term-frequency saturation.

A higher value generally allows term frequency to have a stronger influence before saturation.

### \(b\)

Controls document-length normalization.

- \(b = 0\): No document-length normalization.
- \(b = 1\): Full length normalization according to the BM25 formulation.

Common Lucene defaults have historically used approximately:

- \(k_1 = 1.2\)
- \(b = 0.75\)

Always verify the defaults for the actual product and version.

## 14.6 TF-IDF vs BM25

| Feature                       | TF-IDF                                    | BM25                                 |
| ----------------------------- | ----------------------------------------- | ------------------------------------ |
| Term frequency                | Yes                                       | Yes                                  |
| Inverse document frequency    | Yes                                       | Yes                                  |
| Document length normalization | Depends on implementation                 | Built into the formulation           |
| Term-frequency saturation     | Not inherent in basic TF-IDF              | Yes                                  |
| Parameters                    | Depends on TF-IDF variant                 | \(k_1\), \(b\)                       |
| Modern search use             | Classical model and conceptual foundation | Widely used in modern search engines |

**Key takeaway:** BM25 is not simply TF-IDF with a different name. It introduces a more sophisticated term-frequency saturation and document-length normalization model.

---

# 15. Field Boosting

Not every field has equal importance.

Suppose a product contains:

```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "Premium Android smartphone with advanced camera",
  "brand": "Samsung"
}
```

A match in the product name may be more important than a match in the description.

We can assign different weights to fields.

Example:

| Field       | Importance |
| ----------- | ---------: |
| Name        |          5 |
| Brand       |          4 |
| Category    |          2 |
| Description |          1 |

Elasticsearch supports field boosting in multi-field queries.

Example:

```json
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "Samsung Galaxy",
      "fields": [
        "name^5",
        "brand^4",
        "category^2",
        "description"
      ]
    }
  }
}
```

The `^` notation applies a boost.

For example:

```text
name^5
```

gives the name field a boost of 5.

This influences relevance scoring, but does not guarantee that every name match will rank above every description match.

Other scoring factors still matter.

## 15.1 Why is field boosting useful?

Imagine:

Product A:

```text
Name: Samsung Galaxy S24
Description: Smartphone
```

Product B:

```text
Name: Budget Android Phone
Description: Samsung Galaxy smartphone
```

For the query:

```text
Samsung Galaxy
```

You may want Product A to rank higher because the product name directly matches the query.

Field boosting helps express that preference.

---

# 16. Multi-Match Query

A `multi_match` query searches multiple fields.

Example:

```json
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "Samsung camera phone",
      "fields": [
        "name",
        "brand",
        "description",
        "category"
      ]
    }
  }
}
```

This searches the selected fields and combines their relevance according to the chosen multi-match type and scoring behavior.

## 16.1 Common multi-match types

| Type            | General behavior                                                 |
| --------------- | ---------------------------------------------------------------- |
| `best_fields`   | Uses the best-scoring field, with optional tie-breaking behavior |
| `most_fields`   | Combines matches across fields                                   |
| `cross_fields`  | Treats compatible fields as a combined search field              |
| `phrase`        | Performs phrase matching across fields                           |
| `phrase_prefix` | Performs phrase matching with prefix behavior on the final term  |

The exact behavior and suitability depend on field mappings and analyzers.

## 16.2 Best fields example

```json
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "Samsung Galaxy",
      "type": "best_fields",
      "fields": [
        "name^5",
        "description"
      ]
    }
  }
}
```

This is useful when one field is expected to contain the strongest match.

## 16.3 Cross fields example

Suppose a person record has:

```json
{
  "first_name": "Prashant",
  "last_name": "Sharma"
}
```

A user searches:

```text
Prashant Sharma
```

A cross-fields query can treat compatible fields as a combined search area.

Example:

```json
GET /users/_search
{
  "query": {
    "multi_match": {
      "query": "Prashant Sharma",
      "type": "cross_fields",
      "fields": [
        "first_name",
        "last_name"
      ],
      "operator": "and"
    }
  }
}
```

This can match the terms across the two fields rather than requiring both terms in one individual field.

---

# 17. Sorting vs Relevance Ranking

Search engines commonly support two different result-ordering approaches.

## 17.1 Relevance ranking

By default, relevance-based queries commonly return documents ordered by descending `_score`.

Example:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung Galaxy"
    }
  }
}
```

The most relevant matches are generally returned first.

## 17.2 Sorting

Sometimes the user explicitly wants sorting.

Examples:

- Lowest price first.
- Highest price first.
- Newest products first.
- Highest rating first.

Example:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung"
    }
  },
  "sort": [
    {
      "price": {
        "order": "asc"
      }
    }
  ]
}
```

This sorts matching documents by ascending price.

## 17.3 Does sorting replace relevance scoring?

When an explicit sort is applied, the primary ordering follows the sort fields.

The `_score` can still be calculated and returned depending on the query and request configuration, but it is not necessarily the primary sort key.

Example:

```text
Search: Samsung Galaxy

Sort: Price ascending
```

A less relevant Samsung product can appear before a more relevant one if it has a lower price.

This may be intentional.

## 17.4 Combining relevance and sorting

You can sort by multiple fields.

Example:

```json
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung Galaxy"
    }
  },
  "sort": [
    {
      "_score": {
        "order": "desc"
      }
    },
    {
      "price": {
        "order": "asc"
      }
    }
  ]
}
```

This means:

1. Higher relevance first.
2. Lower price as a tie-breaker.

---

# 18. Aggregations and Faceted Search

Search engines can also aggregate information about matching documents.

Suppose a user searches:

```text
smartphone
```

The application wants to display:

- Products per brand.
- Products per category.
- Average price.
- Minimum price.
- Maximum price.

Elasticsearch provides aggregations for these tasks.

## 18.1 Terms aggregation

Example:

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "brands": {
      "terms": {
        "field": "brand"
      }
    }
  }
}
```

This groups matching documents by brand and returns bucket counts.

Example conceptual result:

```text
Samsung → 120
Apple   → 90
Google  → 45
OnePlus → 60
```

## 18.2 Average aggregation

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "average_price": {
      "avg": {
        "field": "price"
      }
    }
  }
}
```

This calculates the average price across matching documents.

## 18.3 Price range aggregation

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          {
            "to": 10000
          },
          {
            "from": 10000,
            "to": 50000
          },
          {
            "from": 50000
          }
        ]
      }
    }
  }
}
```

This groups products into price ranges.

## 18.4 Why are aggregations useful?

They power user-interface features such as:

```text
Brand:
Samsung (120)
Apple (90)
Google (45)

Price:
Under ₹10,000
₹10,000–₹50,000
Above ₹50,000
```

These filters help users narrow down large result sets.

**Important:** Terms aggregations on distributed indexes can involve shard-level candidate collection and merging. For high-cardinality fields or exact counts, understand the aggregation's accuracy and cost characteristics.

---

# 19. Autocomplete and Search-as-You-Type

Autocomplete suggests possible search terms while users type.

Example:

```text
User types: sams
```

Suggestions:

```text
Samsung Galaxy S24
Samsung Galaxy S24 Ultra
Samsung Galaxy Buds
Samsung Smart TV
```

Autocomplete improves the user experience because users do not need to enter the complete query.

## 19.1 Prefix-based autocomplete

A simple strategy is prefix matching.

For example:

```text
s
sa
sam
sams
```

Each prefix can match indexed terms beginning with those characters.

However, performing expensive prefix searches over a huge index for every keystroke can become inefficient.

## 19.2 Edge n-grams

Edge n-grams generate prefixes from the beginning of a token.

Input:

```text
samsung
```

With a suitable configuration, generated terms might be:

```text
sa
sam
sams
samsu
samsun
samsung
```

When the user types `sams`, the index can retrieve documents containing that prefix.

### How does it work?

During indexing:

```text
samsung
```

Becomes:

```text
sa
sam
sams
samsu
samsun
samsung
```

During searching:

```text
sams
```

The query can match the indexed prefix term.

This increases index size because additional terms are stored.

## 19.3 Search-as-you-type

Search-as-you-type is designed for interactive search experiences.

A user might type:

```text
s
sa
sam
sams
samsu
```

The application sends search requests as input changes.

A complete implementation should also consider:

- Debouncing requests.
- Minimum query length.
- Cancellation of outdated requests.
- Response latency.
- Result caching.
- Ranking suggestions.
- Rate limiting.

For example, a frontend may wait 200–300 milliseconds after the user stops typing before sending a request.

This prevents sending a request for every individual keystroke.

## 19.4 Completion suggester

Elasticsearch provides a completion suggester for autocomplete use cases.

Example:

```json
PUT /product_suggestions
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion"
      }
    }
  }
}
```

Index a suggestion:

```json
PUT /product_suggestions/_doc/1
{
  "suggest": {
    "input": [
      "Samsung Galaxy S24",
      "Samsung Galaxy S24 Ultra",
      "Samsung Galaxy Buds"
    ]
  }
}
```

Search suggestions:

```json
POST /product_suggestions/_search
{
  "suggest": {
    "product_suggest": {
      "prefix": "sams",
      "completion": {
        "field": "suggest"
      }
    }
  }
}
```

The completion suggester uses specialized data structures and is designed for fast suggestion retrieval.

It is not the same thing as ordinary full-text search.

---

# 20. Designing a Real Product Search Query

Let's combine the concepts.

## Requirement

A user searches:

```text
samsung galaxy phone
```

The application should:

1. Search product names and descriptions.
2. Give more importance to product names.
3. Require at least two query terms to match.
4. Restrict results to Samsung products.
5. Exclude out-of-stock products.
6. Restrict prices to under ₹1,00,000.
7. Rank results by relevance.
8. Use price as a tie-breaker.

## Elasticsearch query

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "samsung galaxy phone",
            "fields": [
              "name^5",
              "description"
            ],
            "minimum_should_match": 2
          }
        }
      ],
      "filter": [
        {
          "term": {
            "brand": "Samsung"
          }
        },
        {
          "term": {
            "in_stock": true
          }
        },
        {
          "range": {
            "price": {
              "lt": 100000
            }
          }
        }
      ]
    }
  },
  "sort": [
    {
      "_score": {
        "order": "desc"
      }
    },
    {
      "price": {
        "order": "asc"
      }
    }
  ],
  "size": 20
}
```

## What happens?

| Step | Operation                                   |
| ---- | ------------------------------------------- |
| 1    | Analyze the user's search text              |
| 2    | Search the name and description fields      |
| 3    | Apply the minimum matching-term requirement |
| 4    | Restrict results to Samsung                 |
| 5    | Remove out-of-stock products                |
| 6    | Apply the price limit                       |
| 7    | Calculate relevance scores                  |
| 8    | Sort by score and then price                |
| 9    | Return the top 20 results                   |

This is the type of query you might implement in a real product-search backend.

---

# 21. Common Mistakes and Misconceptions

| Mistake                                          | Correct understanding                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Using `term` on every text field                 | Use it primarily for exact indexed terms; use `match` for analyzed text |
| Assuming `match` requires every word             | Its default operator is generally OR                                    |
| Assuming phrase search is ordinary text matching | Phrase queries use positional constraints                               |
| Using wildcard queries everywhere                | Broad wildcard patterns can be expensive                                |
| Enabling fuzzy search for every field            | Fuzzy search increases query cost and can reduce precision              |
| Putting every condition in `must`                | Use filters for structured eligibility conditions                       |
| Treating `_score` as a probability               | It is a relevance score, not a probability                              |
| Assuming higher TF always means higher relevance | Term-frequency saturation and document length matter                    |
| Confusing TF and DF                              | TF is within a document; DF is across the collection                    |
| Sorting by price while expecting relevance order | Explicit sort determines the primary ordering                           |
| Treating autocomplete as ordinary search         | Autocomplete often uses specialized indexing structures                 |
| Boosting every field equally                     | Fields may have different business importance                           |
| Ignoring mappings                                | Query behavior depends heavily on field types and analyzers             |

---

# 22. Interview Questions and Answers

## Q1. What is the difference between `term` and `match`?

A `term` query searches for an exact indexed term and does not analyze its input like a `match` query.

A `match` query analyzes the input text and searches for the resulting terms.

Use `term` for keyword fields and exact values. Use `match` for full-text search.

## Q2. What is the difference between `match` and `match_phrase`?

A `match` query searches analyzed terms and generally does not require them to appear next to each other.

A `match_phrase` query checks their positional order and proximity.

## Q3. What is a fuzzy query?

A fuzzy query finds terms similar to the query term using edit-distance concepts.

It helps handle spelling mistakes.

## Q4. What is the difference between prefix and wildcard queries?

A prefix query matches terms beginning with a specific prefix.

A wildcard query supports general patterns using `*` and `?`.

Prefix queries are usually preferable when only prefix matching is needed.

## Q5. What is a Boolean query?

A Boolean query combines multiple conditions using clauses such as `must`, `filter`, `should`, and `must_not`.

## Q6. What is the difference between `must` and `filter`?

Both can require documents to match.

However:

- `must` contributes to relevance scoring.
- `filter` does not contribute to relevance scoring and is suitable for structured conditions.

## Q7. What is the difference between filtering and scoring?

Filtering determines whether a document qualifies.

Scoring determines how relevant an eligible document is to the query.

## Q8. What is TF-IDF?

TF-IDF is a classical information retrieval approach that combines term frequency and inverse document frequency.

It gives more importance to terms that occur frequently in a document but are relatively rare across the collection.

## Q9. What is BM25?

BM25 is a probabilistic relevance-ranking function that considers term frequency, inverse document frequency, and document length normalization.

It also uses term-frequency saturation to avoid unlimited linear growth.

## Q10. Why is BM25 generally preferred over basic TF-IDF in modern search systems?

BM25 handles term-frequency saturation and document-length normalization through a more sophisticated scoring formulation.

It generally provides a more useful ranking model for document retrieval.

## Q11. What is field boosting?

Field boosting assigns different importance to different fields.

For example, a product-name match may be more important than a description match.

## Q12. What is the difference between sorting and relevance ranking?

Relevance ranking orders documents based on their search scores.

Sorting orders documents based on specified fields such as price, date, or rating.

## Q13. What is faceted search?

Faceted search allows users to narrow search results using categories and attributes such as brand, price, availability, and category.

## Q14. What are edge n-grams?

Edge n-grams generate prefixes from the beginning of a token.

They are commonly used to support autocomplete and partial-word search.

## Q15. What is the completion suggester?

It is a specialized Elasticsearch feature for fast autocomplete and suggestion retrieval.

It uses a dedicated completion-oriented data structure rather than relying only on ordinary full-text queries.

---

# 23. Practical Exercises

## Exercise 1: Select the right query

Choose the most suitable Elasticsearch query type.

| Requirement                                      | Your answer |
| ------------------------------------------------ | ----------- |
| Find brand exactly equal to Samsung              | ?           |
| Search descriptions for Android smartphone       | ?           |
| Find the phrase Samsung Galaxy                   | ?           |
| Find terms starting with sams                    | ?           |
| Match a misspelled term such as samsng           | ?           |
| Find products priced between ₹10,000 and ₹50,000 | ?           |
| Exclude products that are out of stock           | ?           |

Suggested answers:

| Requirement             | Query type                                    |
| ----------------------- | --------------------------------------------- |
| Exact brand             | `term`                                        |
| Description search      | `match`                                       |
| Phrase search           | `match_phrase`                                |
| Starting characters     | `prefix`                                      |
| Typographical tolerance | `fuzzy`                                       |
| Numeric range           | `range`                                       |
| Exclusion               | `must_not` or an appropriate filter condition |

## Exercise 2: Design a Boolean query

Requirement:

Find:

- Samsung products.
- Price below ₹80,000.
- In-stock products.
- Product names matching Galaxy.

Write a `bool` query using:

- `must`.
- `filter`.

## Exercise 3: Understand scoring

Suppose the user searches:

```text
database indexing
```

Three documents:

```text
Document A:
Database indexing fundamentals

Document B:
Database systems and indexing

Document C:
Introduction to database systems
```

Questions:

1. Which document contains both terms?
2. Which document contains only `indexing`?
3. Which document contains only `database`?
4. Why might Document A rank highest?
5. What role does document frequency play?
6. How could field boosting affect ranking?

## Exercise 4: Design product search

Build a query that supports:

- Search across `name` and `description`.
- Give `name` a boost of 5.
- Require at least two query terms.
- Filter by brand.
- Filter by availability.
- Filter by price.
- Sort by relevance.

---

# 24. Final Revision

| Concept              | Key takeaway                                                    |
| -------------------- | --------------------------------------------------------------- |
| Term query           | Exact indexed-term matching                                     |
| Match query          | Analyzed full-text matching                                     |
| Match phrase         | Ordered positional matching                                     |
| Prefix query         | Matches terms beginning with a prefix                           |
| Wildcard query       | Matches terms using wildcard patterns                           |
| Fuzzy query          | Approximate matching using edit distance                        |
| Boolean query        | Combines multiple query conditions                              |
| Must                 | Required and contributes to scoring                             |
| Filter               | Required but does not contribute to scoring                     |
| Should               | Optional matching clause unless required by query configuration |
| Must not             | Excludes matching documents                                     |
| Range query          | Numeric or date range matching                                  |
| Relevance score      | Estimates how well a document matches                           |
| TF                   | Term frequency within a document                                |
| DF                   | Number of documents containing a term                           |
| IDF                  | Gives greater weight to rarer terms                             |
| TF-IDF               | Combines term frequency and inverse document frequency          |
| BM25                 | Ranking model with saturation and length normalization          |
| Field boosting       | Gives greater importance to selected fields                     |
| Multi-match          | Searches multiple fields                                        |
| Sorting              | Orders results by specified fields                              |
| Aggregation          | Calculates grouped statistics                                   |
| Faceted search       | Filters results using categories and attributes                 |
| Edge n-grams         | Generates token prefixes                                        |
| Completion suggester | Specialized autocomplete mechanism                              |
