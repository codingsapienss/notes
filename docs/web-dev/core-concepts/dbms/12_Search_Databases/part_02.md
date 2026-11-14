---
sidebar_label: "Inverted Index: Internal Working of Search Engines"
sidebar_position: 1
---

# Inverted Index: Internal Working of Search Engines

# 1. Introduction

In last section, we learned that search databases are designed to retrieve relevant documents using text, terms, filters, and relevance scoring.

We also introduced one of the most important concepts in search engines:

**The Inverted Index.**

An inverted index is the fundamental data structure that allows search engines to find documents containing particular terms without scanning every document.

To understand how Elasticsearch, OpenSearch, and Apache Lucene perform text searches, you must understand:

1. Why scanning every document is inefficient.
2. What an inverted index is.
3. How a forward index differs from an inverted index.
4. What a term dictionary contains.
5. What postings lists are.
6. How document IDs and term frequencies are stored.
7. What positional information means.
8. How phrase searches work.
9. How an inverted index is constructed.
10. How search queries use the index.
11. How index compression reduces storage.
12. How Lucene uses inverted indexes.

Let's build the concept from scratch.

---

# 2. Why Do We Need an Inverted Index?

Imagine you have an application containing 10 lakh articles.

Each article has:

- An ID.
- A title.
- A description.
- Content.

Example:

| Document ID | Content                                     |
| ----------- | ------------------------------------------- |
| 1           | Node.js is a JavaScript runtime             |
| 2           | JavaScript is used for frontend development |
| 3           | Node.js is used for backend development     |
| 4           | MongoDB is a document database              |
| 5           | PostgreSQL is a relational database         |

A user searches:

```text
JavaScript
```

The search engine needs to find documents containing the term `JavaScript`.

## 2.1 Approach 1: Scan every document

The simplest approach is to inspect every document.

Conceptually:

```javascript
const documents = [
  "Node.js is a JavaScript runtime",
  "JavaScript is used for frontend development",
  "Node.js is used for backend development",
  "MongoDB is a document database",
  "PostgreSQL is a relational database",
];

const results = documents.filter((document) =>
  document.toLowerCase().includes("javascript"),
);

console.log(results);
```

Output:

```text
Node.js is a JavaScript runtime
JavaScript is used for frontend development
```

This works.

But imagine:

- 10 lakh documents.
- Each document contains thousands of words.
- Hundreds of users search simultaneously.

The system may repeatedly inspect large amounts of text to answer relatively simple queries.

This can become expensive.

A database can use other indexes and specialized algorithms, but the basic full-scan approach does not scale well for repeated text retrieval.

## 2.2 Approach 2: Build an inverted index

Instead of searching every document, preprocess the documents and create a structure that records which documents contain each term.

Example:

```text
javascript → Document 1, Document 2
node       → Document 1, Document 3
mongodb    → Document 4
postgresql → Document 5
database   → Document 4, Document 5
```

Now the user searches:

```text
javascript
```

The search engine looks up `javascript` and immediately gets:

```text
Document 1
Document 2
```

It does not need to scan the original text of every document to discover which documents contain the term.

This structure is called an **Inverted Index**.

---

# 3. What Is an Inverted Index?

An inverted index is a data structure that maps each searchable term to the documents containing that term.

In simple terms:

**Term → List of documents containing that term.**

Consider these documents:

```text
Document 1: Node.js is a JavaScript runtime

Document 2: JavaScript is used for frontend development

Document 3: Node.js is used for backend development

Document 4: MongoDB is a document database

Document 5: PostgreSQL is a relational database
```

After text analysis, suppose the search engine creates the following terms:

```text
node
javascript
runtime
frontend
development
backend
mongodb
document
database
postgresql
relational
```

The inverted index could look like this:

| Term        | Document IDs |
| ----------- | ------------ |
| node        | 1, 3         |
| javascript  | 1, 2         |
| runtime     | 1            |
| frontend    | 2            |
| development | 2, 3         |
| backend     | 3            |
| mongodb     | 4            |
| document    | 4            |
| database    | 4, 5         |
| postgresql  | 5            |
| relational  | 5            |

This is the central idea behind text retrieval in search engines.

## 3.1 Visual representation

<pre>
                DOCUMENTS

        +--------------------------+
        | Document 1               |
        | Node.js JavaScript       |
        +--------------------------+

        +--------------------------+
        | Document 2               |
        | JavaScript frontend      |
        +--------------------------+

        +--------------------------+
        | Document 3               |
        | Node.js backend          |
        +--------------------------+

                    |
                    |
                    v

               INVERTED INDEX

        +--------------------------+
        | node                     |
        |   → Doc 1, Doc 3         |
        +--------------------------+

        +--------------------------+
        | javascript               |
        |   → Doc 1, Doc 2         |
        +--------------------------+

        +--------------------------+
        | frontend                 |
        |   → Doc 2                |
        +--------------------------+

        +--------------------------+
        | backend                  |
        |   → Doc 3                |
        +--------------------------+
</pre>

The search engine can use the inverted index to locate candidate documents efficiently.

---

# 4. Forward Index vs Inverted Index

This is a common interview question.

## 4.1 Forward index

A forward index maps a document to the terms contained in it.

Example:

| Document ID | Terms                             |
| ----------- | --------------------------------- |
| 1           | node, javascript, runtime         |
| 2           | javascript, frontend, development |
| 3           | node, backend, development        |

Conceptually:

```text
Document 1 → node, javascript, runtime

Document 2 → javascript, frontend, development

Document 3 → node, backend, development
```

It answers:

> Which terms are present in this document?

## 4.2 Inverted index

An inverted index maps a term to the documents containing it.

Example:

| Term        | Document IDs |
| ----------- | ------------ |
| node        | 1, 3         |
| javascript  | 1, 2         |
| runtime     | 1            |
| frontend    | 2            |
| backend     | 3            |
| development | 2, 3         |

It answers:

> Which documents contain this term?

## 4.3 Comparison

| Feature           | Forward Index                          | Inverted Index                     |
| ----------------- | -------------------------------------- | ---------------------------------- |
| Mapping           | Document → Terms                       | Term → Documents                   |
| Primary direction | Document-centric                       | Term-centric                       |
| Useful for        | Inspecting document contents           | Finding documents by terms         |
| Search retrieval  | Requires examining document term lists | Direct term lookup                 |
| Typical role      | Document representation                | Core full-text retrieval structure |

The inverted index is particularly useful because users usually start with a query term and expect the system to find matching documents.

---

# 5. Understanding the Three Main Parts of an Inverted Index

A practical inverted index has more information than just:

```text
term → document IDs
```

Three important concepts are:

1. Term dictionary.
2. Postings list.
3. Document metadata.

Let's understand them.

## 5.1 Term Dictionary

A term dictionary stores the unique terms present in the index and provides a way to locate their corresponding postings information.

Example:

```text
Term Dictionary

backend
database
development
frontend
javascript
mongodb
node
postgresql
relational
runtime
```

When a user searches for:

```text
javascript
```

The search engine first needs to find the term in its dictionary.

It then locates the associated postings information.

A production search engine uses efficient data structures rather than simply scanning a normal array of strings.

## 5.2 Postings List

A postings list contains information about the documents associated with a particular term.

A simplified example:

```text
javascript → [1, 2]

node → [1, 3]

database → [4, 5]
```

Real postings can contain additional information, such as:

- Document IDs.
- Term frequency.
- Term positions.
- Offsets.
- Other information needed by the search engine.

The exact stored information depends on the index configuration and implementation.

## 5.3 Document Metadata

A search engine also needs information about indexed documents.

For example:

| Document ID | Product                  |
| ----------- | ------------------------ |
| 1           | Samsung Galaxy S24       |
| 2           | Samsung Galaxy S24 Ultra |
| 3           | iPhone 16                |
| 4           | Google Pixel 9           |

The postings list identifies matching internal document IDs.

The search engine can use its document storage structures and metadata to retrieve the corresponding document fields.

**Important:** Internal Lucene document IDs are not the same as your application's business IDs. They are implementation-level identifiers and can change during index maintenance or rebuilding.

---

# 6. Building an Inverted Index Step by Step

Let's build one manually.

Suppose we have three documents:

```text
Document 1:
Node.js is a JavaScript runtime

Document 2:
JavaScript is used for frontend development

Document 3:
Node.js is used for backend development
```

We will simplify text analysis by:

- Converting everything to lowercase.
- Removing the word `is`.
- Removing the word `a`.
- Removing punctuation.
- Splitting the text into terms.

This is an illustrative analyzer. Actual analyzer behavior depends on configuration.

## Step 1: Normalize the documents

Original:

```text
Node.js is a JavaScript runtime
```

After lowercasing and punctuation handling:

```text
node.js is a javascript runtime
```

## Step 2: Remove stop words

Suppose `is` and `a` are configured as stop words.

Result:

```text
node.js javascript runtime
```

The other documents become:

```text
Document 2:
javascript used for frontend development

Document 3:
node.js used for backend development
```

## Step 3: Tokenize

| Document | Tokens                                       |
| -------- | -------------------------------------------- |
| 1        | node.js, javascript, runtime                 |
| 2        | javascript, used, for, frontend, development |
| 3        | node.js, used, for, backend, development     |

## Step 4: Collect unique terms

```text
node.js
javascript
runtime
used
for
frontend
development
backend
```

## Step 5: Create the postings lists

| Term        | Postings |
| ----------- | -------- |
| node.js     | 1, 3     |
| javascript  | 1, 2     |
| runtime     | 1        |
| used        | 2, 3     |
| for         | 2, 3     |
| frontend    | 2        |
| development | 2, 3     |
| backend     | 3        |

We now have a simplified inverted index.

## Step 6: Search using the index

User query:

```text
javascript
```

Lookup:

```text
javascript → [1, 2]
```

Matching documents:

```text
Document 1
Document 2
```

The search engine can retrieve these candidates without scanning all three original documents.

---

# 7. Document IDs and Postings Lists

Let's go deeper into postings lists.

A postings list is not necessarily just a list of document IDs.

It can store multiple kinds of information.

Consider:

```text
Document 1:
Node.js is a JavaScript runtime

Document 2:
JavaScript is used for frontend development

Document 3:
Node.js is used for backend development
```

Suppose the term `javascript` appears in Documents 1 and 2.

A basic postings list:

```text
javascript → [1, 2]
```

But what if we also want to know how many times the term appears in each document?

We can store term frequency.

## 7.1 Term Frequency

Term Frequency (TF) means how often a term occurs in a document.

Consider:

```text
Document 1:
JavaScript is powerful. JavaScript is popular.
```

Here:

```text
javascript → 2 occurrences
```

Another document:

```text
Document 2:
JavaScript is useful.
```

Here:

```text
javascript → 1 occurrence
```

A simplified postings list could be:

```text
javascript →

    Document 1: TF = 2
    Document 2: TF = 1
```

Or:

| Term       | Document ID | Term Frequency |
| ---------- | ----------: | -------------: |
| javascript |           1 |              2 |
| javascript |           2 |              1 |

Term frequency can contribute to relevance scoring.

However, more occurrences do not automatically mean a document is more relevant. Search algorithms use additional signals and normalization.

## 7.2 Document Frequency

Document Frequency (DF) is the number of documents containing a particular term.

Example:

```text
Document 1: node javascript runtime

Document 2: javascript frontend

Document 3: node backend

Document 4: javascript backend
```

Term statistics:

| Term       | Documents containing term |  DF |
| ---------- | ------------------------- | --: |
| node       | 1, 3                      |   2 |
| javascript | 1, 2, 4                   |   3 |
| runtime    | 1                         |   1 |
| frontend   | 2                         |   1 |
| backend    | 3, 4                      |   2 |

Notice:

- `javascript` appears in three documents.
- `runtime` appears in only one document.

A rare term can be more useful for distinguishing relevant documents.

This idea is important for relevance scoring and is discussed further in Part 15C.

## 7.3 Term Frequency vs Document Frequency

| Metric               | Meaning                                           |
| -------------------- | ------------------------------------------------- |
| TF                   | Number of times a term appears in a document      |
| DF                   | Number of documents containing the term           |
| Total term frequency | Total occurrences of a term across the collection |

Example:

Suppose there are 1,000 documents.

The word `database` appears:

- 5 times in Document 1.
- 2 times in Document 2.
- 1 time in Document 3.

Then:

```text
TF in Document 1 = 5

TF in Document 2 = 2

TF in Document 3 = 1

DF of database = 3
```

Do not confuse TF with DF.

---

# 8. Positional Information in an Inverted Index

So far, we know which documents contain a term.

But this is not enough for every search operation.

Consider these two documents:

```text
Document 1:
Node.js backend development

Document 2:
Backend development using Node.js
```

Both documents contain:

```text
node.js
backend
development
```

Now the user searches:

```text
"Node.js backend"
```

This is a phrase search.

The search engine must know whether the terms occur close together and in the correct order.

For this, an inverted index can store positional information.

## 8.1 What are term positions?

A term position represents the token's position within a field's analyzed token sequence.

Example:

```text
Document 1:
Node.js backend development
```

Token positions:

| Position | Term        |
| -------: | ----------- |
|        0 | node.js     |
|        1 | backend     |
|        2 | development |

Another document:

```text
Document 2:
Backend development using Node.js
```

Token positions:

| Position | Term        |
| -------: | ----------- |
|        0 | backend     |
|        1 | development |
|        2 | using       |
|        3 | node.js     |

The postings information might conceptually look like:

```text
node.js →

    Document 1: positions [0]
    Document 2: positions [3]

backend →

    Document 1: positions [1]
    Document 2: positions [0]
```

Now the search engine has more information than just document membership.

## 8.2 How phrase search works

User query:

```text
"Node.js backend"
```

After analysis:

```text
node.js
backend
```

The search engine checks whether the terms appear:

- In the same document.
- In the correct order.
- At adjacent positions, subject to phrase-query configuration.

Document 1:

```text
node.js → position 0
backend → position 1
```

The terms are adjacent and in the correct order.

Document 2:

```text
backend → position 0
node.js → position 3
```

The order is reversed.

Therefore, Document 1 matches the exact phrase, while Document 2 does not.

## 8.3 Why positions matter

Positions support:

- Phrase queries.
- Proximity queries.
- Some advanced relevance calculations.
- Highlighting and text matching features, depending on the implementation.

Without positional information, an index may know that two terms occur in a document but may not know their relative order or distance.

**Important:** Position information is generally associated with individual fields. A phrase should not be considered to match merely because one term occurs in the title and another occurs in the description.

---

# 9. Offsets and Term Positions

Positions and offsets are different.

Consider:

```text
Node.js backend development
```

The text contains:

```text
Node.js
backend
development
```

Term positions:

| Term        | Position |
| ----------- | -------: |
| Node.js     |        0 |
| backend     |        1 |
| development |        2 |

Character offsets:

| Term        | Start offset | End offset |
| ----------- | -----------: | ---------: |
| Node.js     |            0 |          7 |
| backend     |            8 |         15 |
| development |           16 |         27 |

### Difference

- Position tells us where a token occurs in the token sequence.
- Offset tells us where the token occurs in the original character sequence.

Offsets can be useful for highlighting matching terms in search results.

For example:

```text
Node.js backend development
```

A search for `backend` could highlight:

```text
Node.js <mark>backend</mark> development
```

The actual highlighting mechanism depends on the search engine and field configuration.

---

# 10. Boolean Search Using Inverted Indexes

Search queries can combine terms using logical operators.

Common operators include:

- AND
- OR
- NOT

Let's understand how they work with postings lists.

Suppose the inverted index contains:

```text
javascript → [1, 2, 4, 5]

node → [1, 3, 5]

mongodb → [4, 6]
```

## 10.1 AND operation

Query:

```text
javascript AND node
```

We need documents containing both terms.

Postings:

```text
javascript → [1, 2, 4, 5]

node → [1, 3, 5]
```

Intersection:

```text
[1, 5]
```

Result:

```text
Document 1
Document 5
```

Conceptually:

```text
JavaScript: 1, 2, 4, 5
Node:       1, 3, 5
            ----------
Intersection: 1, 5
```

## 10.2 OR operation

Query:

```text
javascript OR node
```

We need documents containing either term.

Union:

```text
[1, 2, 3, 4, 5]
```

Result:

```text
Documents 1, 2, 3, 4, 5
```

## 10.3 NOT operation

Query:

```text
javascript NOT node
```

We need documents containing JavaScript but not Node.

```text
javascript → [1, 2, 4, 5]

node → [1, 3, 5]
```

Difference:

```text
[2, 4]
```

Result:

```text
Document 2
Document 4
```

## 10.4 Set operations summary

| Operation | Meaning                             | Set operation |
| --------- | ----------------------------------- | ------------- |
| AND       | Documents containing both terms     | Intersection  |
| OR        | Documents containing either term    | Union         |
| NOT       | Exclude documents containing a term | Difference    |

These operations are central to how search engines combine postings lists.

Actual search query languages have more sophisticated semantics, including required, optional, prohibited, and nested clauses.

---

# 11. How Search Engines Process Multiple Terms

Suppose a user searches:

```text
javascript backend development
```

The query analyzer produces:

```text
javascript
backend
development
```

The search engine looks up each term.

Example:

```text
javascript   → [1, 2, 4]
backend      → [1, 3, 4]
development  → [1, 2, 3]
```

Depending on the query type, the search engine can:

- Require all terms.
- Match any term.
- Give different importance to terms.
- Score documents based on term statistics.
- Apply additional filters.

For an AND-style query:

```text
javascript AND backend AND development
```

The intersection is:

```text
[1]
```

Only Document 1 contains all three terms.

For an OR-style query:

```text
javascript OR backend OR development
```

The union is:

```text
[1, 2, 3, 4]
```

Documents containing at least one term are candidates.

A relevance-based query may return all or some candidates ordered by their scores.

---

# 12. How an Inverted Index Is Built Internally

Let's understand the indexing pipeline.

Suppose a search engine receives these documents:

```text
Document 1: JavaScript backend development

Document 2: Node.js backend development

Document 3: JavaScript frontend development
```

A simplified indexing process:

<pre>
        +-------------------------+
        | Incoming Documents      |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Document Parsing        |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Text Analysis           |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Token Generation        |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Collect Term Statistics |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Build Postings Lists    |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Write Index Structures  |
        +-------------------------+
</pre>

## Step 1: Receive documents

The application sends documents to the search engine.

Example:

```json
{
  "id": 1,
  "title": "JavaScript backend development"
}
```

## Step 2: Analyze text

The configured analyzer processes the title.

Possible tokens:

```text
javascript
backend
development
```

## Step 3: Generate postings

The search engine associates each token with the document ID.

```text
javascript → [1]

backend → [1]

development → [1]
```

## Step 4: Add more documents

When Document 2 is indexed:

```text
node.js backend development
```

The postings lists become:

```text
javascript → [1]

backend → [1, 2]

development → [1, 2]

node.js → [2]
```

## Step 5: Add Document 3

```text
javascript frontend development
```

The index becomes:

```text
javascript → [1, 3]

backend → [1, 2]

development → [1, 2, 3]

node.js → [2]

frontend → [3]
```

The search engine has now constructed an inverted index across three documents.

---

# 13. How Updates and Deletions Affect an Inverted Index

An important implementation detail is that search indexes must handle changing documents.

Suppose Document 1 initially contains:

```text
JavaScript backend development
```

Its terms include:

```text
javascript
backend
development
```

Now the document is updated to:

```text
JavaScript frontend development
```

The old `backend` association must no longer be treated as part of the current document.

The index must reflect:

```text
javascript → Document 1

frontend → Document 1

development → Document 1
```

There are different implementation strategies for handling updates.

In Lucene-based systems, an update is commonly implemented logically as a deletion of the old document followed by indexing a replacement document.

Because Lucene segments are immutable, deleted documents are generally marked as deleted rather than immediately removed from every segment.

Later, segment merges can reclaim space and remove deleted document data.

## 13.1 Document deletion

Suppose Document 2 is deleted.

```text
Document 2:
Node.js backend development
```

The search engine must ensure that this document is no longer returned as a valid search result.

In Lucene, deletion information is maintained separately from the immutable segment data.

During later segment merges, deleted document data can be discarded.

**Key concept:** A logical deletion does not necessarily mean that all physical bytes are immediately removed from disk.

---

# 14. Index Compression and Storage Optimization

Imagine an index containing:

- 100 million documents.
- Millions of unique terms.
- Billions of term-document associations.

Storing every term and every document ID as an ordinary string or full integer would consume enormous storage.

Search engines use compression techniques.

## 14.1 Why document IDs are often sorted

Suppose a term appears in these documents:

```text
javascript → [10, 20, 30, 40]
```

The document IDs are sorted.

Instead of storing every full ID, we can store differences between consecutive IDs.

This is called gap encoding or delta encoding.

Example:

Original IDs:

```text
10, 20, 30, 40
```

Differences:

```text
10, 10, 10, 10
```

These smaller values can often be compressed efficiently.

Another example:

Original IDs:

```text
101, 102, 105, 110
```

Differences:

```text
101, 1, 3, 5
```

The gap values may require fewer bits than the original values.

## 14.2 Variable-length integer encoding

Not all integers require the same number of bytes.

A small value can often be represented using fewer bytes than a large value.

Search engines can use variable-length encodings to reduce storage.

## 14.3 Block-based compression

Large postings lists can be divided into blocks.

Each block can be compressed and processed efficiently.

Block-based approaches can improve:

- Storage efficiency.
- Sequential reading.
- Query execution.
- Cache utilization.

Lucene uses specialized postings encodings and compression techniques. Exact formats and implementation details vary across versions.

## 14.4 Why compression matters

| Benefit                   | Explanation                                 |
| ------------------------- | ------------------------------------------- |
| Lower storage             | Fewer bytes are needed                      |
| Better disk efficiency    | Less data must be read                      |
| Better cache utilization  | More index data can fit in memory           |
| Faster transfer           | Smaller data blocks move through the system |
| Lower infrastructure cost | Storage and I/O requirements may decrease   |

Compression introduces CPU work, so implementations balance compression ratio and decoding speed.

---

# 15. How Apache Lucene Uses Inverted Indexes

Apache Lucene is a core search library used by Elasticsearch.

It uses inverted indexes for efficient term-based retrieval.

A simplified Lucene indexing process:

```text
               Documents
                   |
                   v
               Analysis
                   |
                   v
             Token Streams
                   |
                   v
            Inverted Index
                   |
                   v
            Lucene Segments
                   |
                   v
              Search Query
                   |
                   v
          Matching Documents
```

## 15.1 Lucene segments

Lucene stores indexed data in segments.

A segment is an independently searchable part of a Lucene index.

When new documents are indexed, Lucene creates new index data rather than rewriting the entire existing index for every document.

Conceptually:

```text
Lucene Index
     |
     +------ Segment 1
     |
     +------ Segment 2
     |
     +------ Segment 3
```

Each segment contains its own searchable structures.

## 15.2 Why use segments?

Segments allow Lucene to:

- Index new data incrementally.
- Search multiple parts of an index.
- Avoid rewriting the complete index for every update.
- Merge smaller segments into larger ones over time.

The search engine can search multiple segments and combine their results.

## 15.3 Segment merging

Over time, many small segments can accumulate.

Lucene can merge segments into larger segments.

Conceptually:

```text
Before:

Segment 1
Segment 2
Segment 3
Segment 4

       |
       v

    Merge

       |
       v

After:

Segment A
Segment B
```

Merging can:

- Reduce the number of segments.
- Reorganize index data.
- Remove deleted documents.
- Improve some search operations.

However, merging consumes CPU, disk I/O, and temporary storage.

This is why indexing and search workloads can affect one another.

## 15.4 Important distinction

A Lucene segment is not the same thing as an Elasticsearch shard.

- A **segment** is an internal Lucene index structure.
- A **shard** is a partition of an Elasticsearch index.
- A shard contains a Lucene index and can contain multiple segments.

Conceptually:

```text
Elasticsearch Index
       |
       +-------------------+
       |                   |
       v                   v
    Shard 1             Shard 2
       |                   |
       v                   v
   Lucene Index         Lucene Index
       |                   |
   +---+---+           +---+---+
   |       |           |       |
   v       v           v       v
Segment Segment      Segment Segment
```

This distinction is important for interviews and system design.

---

# 16. How a Search Query Uses the Inverted Index

Now let's understand the read path.

Suppose the index contains:

```text
javascript → [1, 2, 4]

backend → [1, 3, 4]

development → [1, 2, 3]
```

A user searches:

```text
javascript backend
```

A simplified execution process:

## Step 1: Analyze the query

Input:

```text
javascript backend
```

Query terms:

```text
javascript
backend
```

## Step 2: Find terms in the dictionary

The engine locates:

```text
javascript
backend
```

## Step 3: Retrieve postings lists

```text
javascript → [1, 2, 4]

backend → [1, 3, 4]
```

## Step 4: Combine candidate documents

Depending on the query semantics:

AND:

```text
[1, 4]
```

OR:

```text
[1, 2, 3, 4]
```

## Step 5: Calculate relevance

The search engine may calculate scores based on:

- Term frequency.
- Document frequency.
- Document length.
- Field boosts.
- Other query-specific signals.

## Step 6: Rank results

Documents are ordered by relevance score, unless the query requests another sorting strategy.

## Step 7: Retrieve results

The engine retrieves the requested document fields and returns them to the application.

The real execution process may include multiple segments, shards, filters, caches, and distributed coordination. This example isolates the basic inverted-index mechanism.

---

# 17. How an Inverted Index Handles Multiple Fields

Consider a product document:

```json
{
  "id": 101,
  "name": "Samsung Galaxy S24",
  "description": "Premium Android smartphone",
  "brand": "Samsung"
}
```

A search engine can maintain separate indexed structures for different fields.

Conceptually:

```text
name field:

samsung → Document 101
galaxy  → Document 101
s24     → Document 101
```

```text
description field:

premium     → Document 101
android     → Document 101
smartphone  → Document 101
```

```text
brand field:

Samsung → Document 101
```

Why separate fields?

Because different fields can have different:

- Analyzers.
- Field types.
- Search behavior.
- Relevance weights.
- Storage requirements.

For example:

- `name` may use full-text analysis.
- `brand` may use exact matching.
- `price` may use numeric indexing.
- `description` may use a language-specific analyzer.

A query can search several fields and combine their scores.

This is why search-engine mappings are important.

---

# 18. Inverted Index vs B-Tree Index

This is another important comparison.

Both are indexes, but they are designed for different access patterns.

## 18.1 B-Tree index

A B-Tree index organizes keys in sorted order.

It is useful for:

- Exact lookups.
- Range queries.
- Sorting.
- Ordered retrieval.

Example:

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

A suitable B-Tree index on `price` can help PostgreSQL locate rows in that range.

## 18.2 Inverted index

An inverted index maps terms to documents.

It is useful for:

- Full-text search.
- Multi-term matching.
- Phrase search when positional information is available.
- Relevance-based document retrieval.

Example:

```text
wireless → [1, 4, 7, 9]

headphones → [1, 3, 4, 8]
```

## 18.3 Comparison table

| Dimension         | B-Tree Index                    | Inverted Index                        |
| ----------------- | ------------------------------- | ------------------------------------- |
| Main mapping      | Key → Record location           | Term → Documents                      |
| Main use          | Structured lookup               | Text retrieval                        |
| Ordering          | Maintains key order             | Uses term dictionary and postings     |
| Range queries     | Strong fit                      | Not its primary purpose               |
| Full-text search  | Not its primary purpose         | Core purpose                          |
| Phrase search     | Not a typical B-Tree capability | Supported with positional information |
| Relevance ranking | Not its main role               | Common search capability              |
| Typical systems   | PostgreSQL, MySQL               | Lucene, Elasticsearch                 |

## 18.4 Important nuance

PostgreSQL also supports inverted-index-style structures through its GIN index type.

For example, PostgreSQL full-text search commonly uses `tsvector` and GIN indexes.

Therefore, inverted indexing is not exclusive to Elasticsearch.

The important distinction is the complete search architecture, text-processing pipeline, ranking features, and workload specialization.

---

# 19. Practical Elasticsearch Example

Let's create a basic product index and search it.

The example uses Elasticsearch's REST API.

## Step 1: Create an index

```http
PUT /products
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "brand": {
        "type": "keyword"
      },
      "description": {
        "type": "text"
      },
      "price": {
        "type": "integer"
      }
    }
  }
}
```

This creates a logical index with the specified field mappings.

## Step 2: Insert documents

```http
POST /products/_doc/1
{
  "name": "Samsung Galaxy S24 Ultra",
  "brand": "Samsung",
  "description": "Premium Android smartphone with advanced camera",
  "price": 99999
}
```

```http
POST /products/_doc/2
{
  "name": "Samsung Galaxy S24",
  "brand": "Samsung",
  "description": "Android smartphone for everyday use",
  "price": 79999
}
```

```http
POST /products/_doc/3
{
  "name": "iPhone 16",
  "brand": "Apple",
  "description": "Premium smartphone with advanced camera",
  "price": 89999
}
```

## Step 3: Search by a text term

```http
GET /products/_search
{
  "query": {
    "match": {
      "name": "Samsung"
    }
  }
}
```

The `match` query analyzes the search text and looks for matching terms in the indexed field.

## Step 4: Search multiple terms

```http
GET /products/_search
{
  "query": {
    "match": {
      "description": "premium smartphone camera"
    }
  }
}
```

This performs a full-text search on the description field.

The default `match` query behavior can match documents containing one or more query terms. It does not necessarily require every term.

## Step 5: Search using an exact field

```http
GET /products/_search
{
  "query": {
    "term": {
      "brand": "Samsung"
    }
  }
}
```

This uses an exact-term query against the `keyword` field.

Remember:

- `match` is commonly used for analyzed text.
- `term` is commonly used for exact indexed terms.

Using `term` directly on an analyzed `text` field can produce surprising results because the original string may have been split into tokens.

---

# 20. Common Misconceptions

| Misconception                                            | Correct understanding                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| An inverted index stores only document IDs               | It can also store term frequencies, positions, offsets, and other information          |
| A forward index and inverted index are identical         | Their mapping directions are opposite                                                  |
| Inverted indexes are exclusive to Elasticsearch          | Other systems, including PostgreSQL GIN indexes, use inverted-index techniques         |
| Every term needs to store the complete document          | The postings list identifies matching documents; document fields are stored separately |
| Phrase search only needs document IDs                    | Positional information is generally needed to verify order and proximity               |
| More term occurrences always mean greater relevance      | Ranking considers multiple signals and normalization                                   |
| Deleting a document immediately removes every index byte | Lucene uses logical deletions and later segment merging                                |
| A shard is the same as a Lucene segment                  | A shard contains a Lucene index, which can contain multiple segments                   |
| Compression is only for saving disk space                | It can also improve I/O and cache efficiency                                           |
| Search engines scan all documents for every query        | Inverted indexes allow term-based candidate retrieval                                  |

---

# 21. Interview Questions and Answers

## Q1. What is an inverted index?

An inverted index is a data structure that maps terms to the documents containing those terms.

It enables efficient full-text retrieval without scanning every document.

## Q2. Why is it called an inverted index?

Because it reverses the document-to-term relationship.

A forward index maps:

```text
Document → Terms
```

An inverted index maps:

```text
Term → Documents
```

## Q3. What is a postings list?

A postings list contains the documents associated with a particular term.

Depending on the implementation, it can include document IDs, term frequencies, positions, and other information.

## Q4. What is a term dictionary?

A term dictionary stores unique indexed terms and provides an efficient way to locate their postings information.

## Q5. What is term frequency?

Term frequency is the number of times a term occurs in a particular document.

## Q6. What is document frequency?

Document frequency is the number of documents containing a particular term.

## Q7. What is the difference between TF and DF?

- TF measures occurrences within a document.
- DF measures how many documents contain the term.

## Q8. Why does an inverted index store positional information?

Positional information helps determine the order and distance between terms.

It supports phrase and proximity searches.

## Q9. What is the difference between term position and offset?

- Position represents a token's location in the analyzed token sequence.
- Offset represents the token's character range in the original text.

## Q10. How does an inverted index execute an AND query?

It retrieves the postings lists for the requested terms and finds their intersection.

## Q11. How does an inverted index execute an OR query?

It retrieves the postings lists and combines their document IDs using a union operation.

## Q12. Why are postings lists sorted?

Sorted document IDs allow efficient intersection, merging, and compression techniques.

## Q13. What is delta encoding?

Delta encoding stores differences between consecutive sorted values instead of storing every complete value.

For example:

```text
Original: 10, 20, 30, 40

Deltas:   10, 10, 10, 10
```

## Q14. What is a Lucene segment?

A segment is an independently searchable part of a Lucene index.

A Lucene index can contain multiple segments.

## Q15. Why does Lucene merge segments?

Segment merging reduces the number of segments and can reclaim space occupied by deleted documents.

It also reorganizes index data, although merging consumes system resources.

## Q16. What is the difference between an Elasticsearch shard and a Lucene segment?

An Elasticsearch shard is a partition of an Elasticsearch index.

A shard contains a Lucene index, which can contain multiple segments.

## Q17. Does PostgreSQL use inverted indexes?

Yes. PostgreSQL's GIN index type is an inverted-index structure and is commonly used with full-text search through `tsvector`.

## Q18. Why is an inverted index useful for large search workloads?

It allows the engine to locate documents containing a term through indexed postings rather than scanning all document contents.

This makes term-based retrieval much more efficient for large collections.

---

# 22. Practical Exercises

## Exercise 1: Build an inverted index manually

Given:

```text
Document 1: Node.js backend developer

Document 2: JavaScript frontend developer

Document 3: Node.js JavaScript developer

Document 4: MongoDB database developer
```

Create:

1. A forward index.
2. A list of unique terms.
3. An inverted index.
4. A postings list for `developer`.
5. A postings list for `javascript`.

Expected postings:

```text
developer → [1, 2, 3, 4]

javascript → [2, 3]
```

## Exercise 2: Perform Boolean operations

Given:

```text
node       → [1, 3, 5, 7]

javascript → [1, 2, 5, 6]

mongodb    → [2, 4, 6]
```

Calculate:

1. `node AND javascript`
2. `javascript OR mongodb`
3. `javascript NOT node`
4. `node AND mongodb`

Answers:

```text
1. [1, 5]

2. [1, 2, 4, 5, 6]

3. [2, 6]

4. []
```

## Exercise 3: Understand positional indexing

Given:

```text
Document 1: Node.js backend developer

Document 2: Backend developer using Node.js

Document 3: Node.js frontend developer
```

Determine which documents match:

```text
"Node.js backend"
```

Assuming an analyzer preserves these tokens and an exact phrase query requires adjacent terms in order:

- Document 1 matches.
- Document 2 does not match because the order is reversed and the terms are not adjacent.
- Document 3 does not match because `backend` is absent.

## Exercise 4: Analyze a product search index

Create an index containing:

```text
Product 1:
Samsung Galaxy S24 Ultra

Product 2:
Samsung Galaxy S24

Product 3:
Apple iPhone 16

Product 4:
Google Pixel 9
```

Questions:

1. What terms would a standard lowercase tokenizer produce?
2. Which documents contain `samsung`?
3. Which documents contain `galaxy`?
4. How would you support exact brand filtering?
5. How would you support phrase matching for `Galaxy S24`?

---

# 23. Final Revision

| Concept            | Key takeaway                                             |
| ------------------ | -------------------------------------------------------- |
| Inverted index     | Maps terms to documents                                  |
| Forward index      | Maps documents to terms                                  |
| Term dictionary    | Stores unique terms and locates postings                 |
| Postings list      | Stores documents associated with a term                  |
| Document ID        | Internal identifier for an indexed document              |
| Term frequency     | Number of occurrences in a document                      |
| Document frequency | Number of documents containing a term                    |
| Position           | Token location in analyzed text                          |
| Offset             | Character range in original text                         |
| Phrase search      | Uses term order and positional information               |
| AND                | Intersection of postings lists                           |
| OR                 | Union of postings lists                                  |
| NOT                | Exclusion or set difference                              |
| Delta encoding     | Stores differences between sorted values                 |
| Compression        | Reduces index storage and I/O                            |
| Lucene             | Search library used by Elasticsearch                     |
| Segment            | Independently searchable Lucene index component          |
| Segment merge      | Combines segments and can reclaim deleted-document space |
| Shard              | Partition of an Elasticsearch index                      |
| GIN                | PostgreSQL inverted-index-style index type               |
