---
sidebar_label: B-Tree and B+ Tree
sidebar_position: 1
---

# B-Tree and B+ Tree

## 1. Introduction

In last section, we learned that database indexes help locate records without scanning an entire table.

But an important question remains:

**What data structure does a database use internally to organize an index?**

One of the most important answers is the **B-Tree family of data structures**.

Databases commonly use B-Tree-family indexes because they support:

- Efficient searches
- Efficient insertions and deletions
- Range queries
- Ordered traversal
- Predictable lookup performance
- Efficient disk and memory access

To understand B-Trees, we first need to understand ordinary tree data structures.

---

## 2. Understanding Tree Data Structures

A tree is a hierarchical data structure consisting of nodes connected through edges.

Consider this simple tree:

```text
              50
             /  \
           30    70
          / \    / \
        20  40  60  80
```

Here:

- 50 is the root node.
- 30 and 70 are child nodes of 50.
- 20, 40, 60, and 80 are leaf nodes.

### Important terminology

| Term   | Meaning                                                 |
| ------ | ------------------------------------------------------- |
| Root   | Topmost node                                            |
| Parent | Node that has children                                  |
| Child  | Node connected below another node                       |
| Leaf   | Node with no children                                   |
| Edge   | Connection between two nodes                            |
| Height | Number of edges on the longest path from root to a leaf |
| Depth  | Number of edges from root to a particular node          |

Trees are useful for representing hierarchical information and supporting efficient searching.

---

## 3. Binary Search Tree (BST)

A Binary Search Tree is a tree where each node has at most two children.

It follows this ordering rule:

- Values smaller than the current node go to the left.
- Values greater than the current node go to the right.

Example:

```text
              50
             /  \
           30    70
          / \    / \
        20  40  60  80
```

### 3.1 Searching in a BST

Suppose we want to find 60.

```text
              50
             /  \
           30    70
                /
               60
```

Search process:

1. Compare 60 with 50.
2. 60 is greater than 50, so move right.
3. Compare 60 with 70.
4. 60 is smaller than 70, so move left.
5. Found 60.

Only three nodes were examined.

### 3.2 Time Complexity

For a balanced BST:

| Operation | Average/Best Case |
| --------- | ----------------: |
| Search    |          O(log N) |
| Insert    |          O(log N) |
| Delete    |          O(log N) |

However, an ordinary BST can become unbalanced.

Example:

```text
10
  \
   20
     \
      30
        \
         40
           \
            50
```

This structure behaves like a linked list.

Searching for 50 may require examining every node.

Worst-case complexity becomes:

```text
O(N)
```

### 3.3 Why Is an Ordinary BST Not Ideal for Databases?

Databases frequently work with data stored on disk, not just in RAM.

An ordinary BST can have several disadvantages:

1. Each node typically has only two children.
2. A large tree may have many levels.
3. Searching may require visiting many nodes.
4. Visiting different nodes can cause multiple disk page accesses.
5. Random disk I/O can be expensive.

Databases need a structure that reduces the number of storage-page accesses.

This leads us to multiway search trees and B-Trees.

---

## 4. Why Databases Need Multiway Trees

A Binary Search Tree has at most two children per node.

A B-Tree can have many children per node.

Consider a simplified multiway tree:

```text
                 [30 | 60]
                /    |    \
               /     |     \
          [10,20] [40,50] [70,80,90]
```

The root contains multiple keys and divides the key space into multiple ranges.

Searching for 50:

1. Compare 50 with 30 and 60.
2. 50 lies between 30 and 60.
3. Move to the middle child.
4. Find 50.

Instead of traversing many binary nodes, the database can use a node containing multiple keys.

### Why is this useful?

A database storage page can hold a substantial amount of index information.

A node with many keys can have many children.

This reduces the tree height and therefore reduces the number of page accesses needed to locate a key.

---

## 5. What Is a B-Tree?

A **B-Tree** is a self-balancing multiway search tree.

Unlike a binary search tree, a B-Tree node can contain multiple keys and have multiple children.

Its important properties include:

1. Keys inside a node are stored in sorted order.
2. A node can have multiple children.
3. Each child represents a particular key range.
4. All leaves are at the same depth in a standard B-Tree.
5. The tree remains balanced after insertions and deletions.
6. Nodes have limits on the number of keys and children.

The exact limits depend on the B-Tree's order or minimum degree definition.

### 5.1 Example

Consider:

```text
                    [30 | 60]
                   /    |    \
                  /     |     \
          [10 | 20] [40 | 50] [70 | 80]
```

The root contains:

```text
30, 60
```

Its children represent these ranges:

| Child  | Key Range         |
| ------ | ----------------- |
| Left   | Less than 30      |
| Middle | Between 30 and 60 |
| Right  | Greater than 60   |

### 5.2 Searching in a B-Tree

Suppose we want to find 50.

```text
                    [30 | 60]
                   /    |    \
                  /     |     \
          [10 | 20] [40 | 50] [70 | 80]
```

Steps:

1. Start at the root.
2. Compare 50 with 30 and 60.
3. 50 lies between 30 and 60.
4. Move to the middle child.
5. Find 50.

The search takes fewer node visits than a poorly structured binary tree.

### 5.3 B-Tree Complexity

For a balanced B-Tree:

| Operation | Complexity |
| --------- | ---------: |
| Search    |   O(log N) |
| Insert    |   O(log N) |
| Delete    |   O(log N) |
| Traversal |       O(N) |

The tree remains balanced, preventing the linear-height problem of an ordinary BST.

---

## 6. What Is the Order of a B-Tree?

The order of a B-Tree describes the maximum number of children a node can have under one common definition.

For example, suppose a B-Tree has order 4.

Then:

- Maximum children = 4
- Maximum keys = 3

Why?

A node with K keys can have at most K + 1 children.

```text
Maximum children = 4

Maximum keys = 3
```

Example:

```text
             [20 | 40 | 60]
             /    |    |    \
            /     |    |     \
          C1     C2   C3     C4
```

### General Relationship

For a B-Tree of order M:

```text
Maximum children = M

Maximum keys = M - 1
```

The minimum occupancy rules depend on the precise B-Tree definition and whether the node is the root.

**Important:** Some textbooks define B-Trees using minimum degree `t` rather than order `M`. Do not mix these definitions.

---

## 7. How B-Tree Insertion Works

B-Trees maintain a maximum number of keys per node.

When a node becomes full, the tree must reorganize itself.

This process is called a **split**.

Consider a B-Tree with maximum three keys per node.

Initial tree:

```text
              [20 | 40]
```

Insert:

```text
10
```

Result:

```text
          [10 | 20 | 40]
```

The node is now full.

Insert:

```text
30
```

The keys would become:

```text
[10 | 20 | 30 | 40]
```

This exceeds the maximum capacity.

The node must split.

A simplified split operation:

```text
              [20]
             /    \
           [10]  [30 | 40]
```

The middle key is promoted to the parent.

### What If the Root Splits?

Suppose the root itself becomes full and splits.

A new root is created.

This increases the height of the tree by one.

Example:

```text
Before:
          [10 | 20 | 30]

After splitting:
               [20]
              /    \
            [10]   [30]
```

The tree remains balanced.

**Note:** The exact split and promotion rules depend on the B-Tree variant and insertion algorithm. The example illustrates the general idea.

---

## 8. How B-Tree Deletion Works

Deletion is more complicated than insertion because removing a key may leave a node with fewer keys than the permitted minimum.

A B-Tree maintains occupancy rules.

If a node becomes underfull, the tree may:

1. Borrow a key from a sibling.
2. Merge with a sibling.
3. Move a separator key from the parent.
4. Reduce the tree height if the root becomes unnecessary.

### Example: Borrowing

Suppose:

```text
              [30]
             /    \
          [10]   [40 | 50]
```

If the left node needs another key, the tree may redistribute keys using the parent separator.

Conceptually:

```text
              [40]
             /    \
       [10 | 30]   [50]
```

The actual operation depends on the B-Tree variant and occupancy constraints.

### Example: Merging

If borrowing is not possible, nodes may merge.

The goal is to maintain the B-Tree's balancing and occupancy properties.

We do not need to memorize every deletion algorithm for basic database indexing. Understand the purpose of redistribution and merging.

---

## 9. What Is a B+ Tree?

A **B+ Tree** is a variation of the B-Tree designed for efficient searching and ordered traversal.

It is widely used in database indexing.

The key distinction is:

> In a B+ Tree, internal nodes store separator keys, while all actual indexed entries are stored in the leaf level.

In a common B+ Tree design:

- Internal nodes guide searches.
- Leaf nodes contain the indexed keys and their associated row references.
- Leaf nodes are linked to support ordered traversal.

### 9.1 Example

```text
                   [30 | 60]
                  /    |    \
                 /     |     \
                /      |      \
       [10 | 20] -> [30 | 40 | 50] -> [60 | 70 | 80]
```

Here:

- Root: `[30 | 60]`
- Leaf nodes: actual indexed entries.
- Arrows between leaves: linked-leaf structure.

The arrows show the linked-leaf relationship, not the parent-child relationship.

### 9.2 Internal Nodes

Internal nodes contain separator keys used to direct searches.

For example:

```text
                   [30 | 60]
```

The keys divide the search space into ranges:

- Less than 30
- From 30 up to 60
- 60 and above

### 9.3 Leaf Nodes

Leaf nodes contain the actual index entries.

For example:

```text
[10 | 20] -> [30 | 40 | 50] -> [60 | 70 | 80]
```

Each entry is associated with a row reference or another database-specific locator.

All leaf nodes are at the same depth.

---

## 10. Why Are B+ Trees Popular in Databases?

B+ Trees provide several advantages.

### 10.1 High Fan-Out

Fan-out means the number of children a node can have.

A B+ Tree node can have many children.

Higher fan-out means:

- More keys per node.
- Fewer levels in the tree.
- Fewer storage-page accesses for many lookups.

### 10.2 Efficient Range Queries

Consider:

```sql
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 5000;
```

A B+ Tree can:

1. Navigate to the first matching key.
2. Move through the linked leaf nodes.
3. Continue until the upper boundary is reached.

Conceptually:

```text
Root
 |
 v
Find 1000
 |
 v
Leaf: [1000 | 1500 | 2000]
                 |
                 v
Leaf: [2500 | 3000 | 4000]
                 |
                 v
Leaf: [4500 | 5000 | 5500]
                 |
                 v
Stop after 5000
```

The linked leaves make sequential traversal efficient.

### 10.3 Ordered Traversal

B+ Trees keep leaf entries in sorted order.

This makes them useful for:

- `ORDER BY`
- Range searches
- Minimum and maximum key lookups
- Prefix-related operations where supported by the index and query
- Ordered index scans

### 10.4 Efficient Storage-Page Usage

Database indexes are designed around storage pages.

A high fan-out tree can keep its height relatively small, reducing the number of pages that need to be accessed during a lookup.

---

## 11. B-Tree vs B+ Tree

This is one of the most important comparisons in this chapter.

| Feature               | B-Tree                                                  | B+ Tree                                                            |
| --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Internal nodes        | Can contain keys and associated records/references      | Generally contain separator keys                                   |
| Leaf nodes            | Can contain keys and associated records/references      | Contain actual indexed entries                                     |
| Data entry location   | May exist in internal and leaf nodes                    | Stored at leaf level                                               |
| Leaf linking          | Not a defining requirement                              | Commonly linked                                                    |
| Range queries         | Supported                                               | Particularly efficient                                             |
| Ordered traversal     | Supported                                               | Efficient through linked leaves                                    |
| Internal-node fan-out | Can be lower when nodes store record references         | Often higher because internal nodes primarily store separator keys |
| Database usage        | Less common as the main general-purpose index structure | Widely used                                                        |

**Important:** The term B-Tree is sometimes used broadly to refer to B-Tree-family indexes, including B+ Tree-style implementations. Database documentation may use terminology that differs from textbook distinctions.

---

## 12. How Does a Database Use a B+ Tree Index?

Let's connect the theory to PostgreSQL.

Suppose we have:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    city VARCHAR(100)
);
```

We create an index:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

Now execute:

```sql
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

Conceptual execution:

```text
                Query
                  |
                  v
        Find email = prashant@gmail.com
                  |
                  v
            Index Root Page
                  |
                  v
          Internal Index Pages
                  |
                  v
             Leaf Page
                  |
                  v
         Find matching index entry
                  |
                  v
         Obtain row location
                  |
                  v
            Fetch table row
                  |
                  v
               Result
```

In PostgreSQL, the ordinary B-tree index uses an entry containing the indexed key and a tuple identifier (TID) that identifies the corresponding heap tuple.

The database uses this information to retrieve the table row when needed.

---

## 13. What Is a Database Page?

To understand why B+ Trees are useful, we need to understand database pages.

A database does not normally read one individual row directly from storage.

Instead, data is stored and transferred in blocks called pages.

A page contains multiple database records or index entries.

In PostgreSQL, the default database block size is commonly 8 KB.

You can check it using:

```sql
SHOW block_size;
```

Typical output:

```text
 block_size
------------
 8192
```

### 13.1 Why Does Page Size Matter?

Suppose a B+ Tree internal page can store many index entries.

Instead of reading one key per disk operation, the database can read an entire page containing many keys.

This allows the tree to have a high fan-out.

### 13.2 Simplified Example

Imagine a database page can hold 100 index entries.

```text
Page 1:
[10, 20, 30, 40, ...]
```

That page can direct searches into many different key ranges.

The database can therefore navigate a large index with relatively few page accesses.

Actual page capacity depends on:

- Page size
- Key size
- Pointer size
- Page metadata
- Index tuple overhead
- Fill factor and available free space

---

## 14. Why B+ Tree Height Is Usually Small

Consider a hypothetical B+ Tree with fan-out 100.

This means each internal node can have approximately 100 children.

Illustrative structure:

```text
Level 1:
                1 Root

Level 2:
              100 Nodes

Level 3:
           10,000 Nodes

Level 4:
        1,000,000 Nodes
```

The number of entries that can be addressed grows rapidly with each additional level.

This is why database B-Tree-family indexes can remain relatively shallow even when they contain millions of entries.

The exact capacity depends on the actual branching factor and leaf capacity.

### Important takeaway

A shallow tree means fewer page accesses for a lookup.

This is one of the main reasons B+ Tree-family structures work well for database indexes.

---

## 15. How B+ Trees Handle Different Queries

### 15.1 Equality Search

Example:

```sql
SELECT *
FROM users
WHERE id = 100;
```

The database navigates from the root to the relevant leaf and locates the matching entry.

### 15.2 Range Search

Example:

```sql
SELECT *
FROM products
WHERE price >= 1000
  AND price <= 5000;
```

The database finds the first matching leaf entry and traverses the subsequent entries until the range ends.

### 15.3 Sorting

Example:

```sql
SELECT *
FROM products
ORDER BY price;
```

A suitable B-tree index may allow PostgreSQL to read entries in the required order without performing a separate sort.

Whether it chooses that plan depends on the query and estimated costs.

### 15.4 Minimum and Maximum

Example:

```sql
SELECT MIN(price)
FROM products;
```

```sql
SELECT MAX(price)
FROM products;
```

A suitable B-tree index may help PostgreSQL find the smallest or largest indexed value efficiently.

---

## 16. PostgreSQL B-Tree Indexes

PostgreSQL's default index type is B-tree.

When you execute:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

PostgreSQL creates a B-tree index unless you specify another index method.

You can explicitly write:

```sql
CREATE INDEX idx_users_email
ON users USING BTREE(email);
```

### 16.1 Inspect Index Information

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users';
```

### 16.2 Check the Query Plan

```sql
EXPLAIN ANALYZE
SELECT *
FROM users
WHERE email = 'prashant@gmail.com';
```

Possible output:

```text
Index Scan using idx_users_email on users
  Index Cond: (email = 'prashant@gmail.com')
```

The exact output depends on the dataset and planner decisions.

### 16.3 Important PostgreSQL Detail

PostgreSQL documentation calls its default index method `B-tree`.

Its implementation is a B-Tree-family structure with page-based organization and linked leaf pages.

It is not necessary to assume that every implementation detail matches a textbook B+ Tree diagram exactly.

---

## 17. Practical Lab: Understanding B-Tree Indexing

### Step 1: Create a Products Table

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(10, 2),
    category VARCHAR(100)
);
```

### Step 2: Insert Data

```sql
INSERT INTO products (name, price, category)
VALUES
('Keyboard', 1500, 'Electronics'),
('Mouse', 800, 'Electronics'),
('Monitor', 12000, 'Electronics'),
('Chair', 5000, 'Furniture'),
('Table', 8000, 'Furniture'),
('Notebook', 100, 'Stationery');
```

### Step 3: Create a B-Tree Index

```sql
CREATE INDEX idx_products_price
ON products USING BTREE(price);
```

### Step 4: Run an Equality Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
WHERE price = 1500;
```

### Step 5: Run a Range Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
WHERE price BETWEEN 1000 AND 8000;
```

### Step 6: Run an ORDER BY Query

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
ORDER BY price;
```

### Step 7: Inspect Index Size

```sql
SELECT
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE relname = 'products';
```

Because the table is small, PostgreSQL may choose sequential scans. That does not mean the index is incorrectly created.

Use larger datasets to observe meaningful differences.

---

## 18. Common Misconceptions

### Misconception 1: B-Tree is a binary tree.

Incorrect.

A B-Tree is a multiway balanced search tree. A node can have multiple keys and multiple children.

### Misconception 2: B+ Tree stores all data in internal nodes.

Incorrect.

In a typical B+ Tree, internal nodes contain separator keys, while leaf nodes contain the indexed entries.

### Misconception 3: B+ Trees are only useful for equality searches.

Incorrect.

They are particularly useful for range queries and ordered traversal.

### Misconception 4: A B-Tree always has two children.

Incorrect.

The number of children depends on the tree's order or degree.

### Misconception 5: Every database uses exactly the same B+ Tree implementation.

Incorrect.

Databases differ in page layout, metadata, splitting strategies, concurrency control, and how index entries identify rows.

### Misconception 6: A database reads one row directly from disk.

Generally incorrect.

Databases perform page-oriented storage operations. A page can contain multiple rows or index entries.

### Misconception 7: Higher fan-out always means a better index.

Not necessarily.

Larger keys and pointers reduce the number of entries that fit in a page. Index design involves tradeoffs involving page utilization, key size, caching, and maintenance.

---

## 19. Interview Questions and Answers

### Q1. What is a B-Tree?

A B-Tree is a self-balancing multiway search tree in which nodes contain multiple keys and children.

### Q2. Why do databases use B-Tree-family indexes?

They provide efficient searching, insertion, deletion, and ordered traversal while reducing the number of storage-page accesses.

### Q3. What is the difference between a BST and a B-Tree?

A BST has at most two children per node. A B-Tree can have many children and multiple keys per node.

### Q4. What is the difference between a B-Tree and a B+ Tree?

In a typical B-Tree, records or references can be associated with keys in internal and leaf nodes. In a B+ Tree, actual indexed entries are stored at the leaf level, while internal nodes guide searches.

### Q5. Why are B+ Trees useful for range queries?

Because their leaf entries are ordered and commonly linked, allowing efficient traversal from the starting key through the required range.

### Q6. What is fan-out?

Fan-out is the number of children a node can have.

### Q7. Why is a high fan-out useful?

It reduces tree height and can reduce the number of storage-page accesses required for a lookup.

### Q8. What is a node split?

A split occurs when a node exceeds its maximum capacity. Keys and child pointers are redistributed, and a separator key is promoted to the parent.

### Q9. Why do B-Trees remain balanced?

Their insertion and deletion algorithms maintain occupancy constraints and ensure that all leaves remain at the same depth.

### Q10. What is the default index type in PostgreSQL?

B-tree.

### Q11. What is a database page?

A page is a fixed-size unit of database storage and I/O that holds data or index entries.

### Q12. Why is a B-Tree better suited to disk-based databases than an ordinary BST?

B-Tree-family structures have high fan-out, shallow height, and page-oriented organization, reducing the number of storage-page accesses.

---

## 20. Chapter Summary

### B-Tree vs B+ Tree at a Glance

| Concept            | B-Tree                              | B+ Tree                           |
| ------------------ | ----------------------------------- | --------------------------------- |
| Structure          | Balanced multiway tree              | Balanced multiway tree            |
| Internal nodes     | Keys and possibly record references | Separator keys                    |
| Leaf nodes         | May contain records/references      | Contain indexed entries           |
| Linked leaves      | Not required                        | Commonly used                     |
| Range queries      | Supported                           | Particularly efficient            |
| Database relevance | Important tree family               | Widely used database-index design |

### Key Takeaways

1. Ordinary BSTs can become unbalanced.
2. B-Trees solve the multi-level searching problem using multiple keys per node.
3. B-Trees remain balanced after insertions and deletions.
4. B+ Trees store indexed entries at the leaf level.
5. Linked leaf nodes make range scans efficient.
6. High fan-out reduces tree height.
7. Databases organize storage into pages.
8. PostgreSQL's default index method is B-tree.
9. B-Tree-family indexes support equality searches, range searches, and ordered scans.
10. The database's exact index implementation varies by engine.

---
