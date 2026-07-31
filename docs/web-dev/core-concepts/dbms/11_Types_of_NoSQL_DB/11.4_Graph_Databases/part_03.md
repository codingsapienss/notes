---
sidebar_label: Graph Data Modeling
sidebar_position: 1
---

# Graph Data Modeling

# 1. Introduction to Graph Data Modeling

**How do we design a graph data model for a real application?**

Understanding graph databases is not enough. You must know how to convert business requirements into nodes, relationships, labels, and properties.

Consider an e-commerce application.

It contains:

- Users.
- Products.
- Orders.
- Categories.
- Reviews.
- Payments.
- Recommendations.

The challenge is deciding:

- What should become a node?
- What should become a relationship?
- What information belongs in node properties?
- What information belongs in relationship properties?
- Which relationships should be directed?
- How should the graph support application queries?

These are graph data-modeling decisions.

---

# 2. The Core Principles of Graph Data Modeling

A property graph consists of four important elements.

| Element      | Purpose                   | Example                  |
| ------------ | ------------------------- | ------------------------ |
| Node         | Represents an entity      | User                     |
| Label        | Identifies an entity type | `User`                   |
| Relationship | Connects entities         | `PURCHASED`              |
| Property     | Stores attributes         | `name`, `price`, `since` |

Example:

```text
(:User {
    userId: 101,
    name: "Prashant"
})
       |
       | PURCHASED
       v
(:Product {
    productId: 501,
    name: "Laptop",
    price: 65000
})
```

Let's understand how to make these decisions.

## 2.1 Identify Entities

Start by identifying the important entities in your application.

For an e-commerce application:

```text
User
Product
Order
Category
Payment
Review
```

These are natural candidates for nodes.

Example:

```cypher
CREATE (:User {
    userId: 101,
    name: "Prashant",
    city: "Noida"
});

CREATE (:Product {
    productId: 501,
    name: "Laptop",
    price: 65000
});
```

## 2.2 Identify Relationships

Next, identify how entities interact.

```text
User -> PLACED -> Order

Order -> CONTAINS -> Product

Product -> BELONGS_TO -> Category

User -> REVIEWED -> Product

User -> PAID_WITH -> Payment
```

A graph model makes these connections explicit.

## 2.3 Identify Properties

Properties describe entities and relationships.

Node properties:

```cypher
(:User {
    userId: 101,
    name: "Prashant",
    email: "prashant@example.com"
})
```

Relationship properties:

```cypher
(:User)-[:PLACED {
    orderDate: "2026-11-14",
    totalAmount: 65000
}]->(:Order)
```

A useful modeling rule:

- Put attributes that describe an entity on its node.
- Put attributes that describe a connection or interaction on its relationship.

However, this is a modeling guideline, not an absolute rule. Some information may be modeled as a separate node when it has its own identity, lifecycle, or relationships.

---

# 3. Choosing Nodes vs Relationships

This is one of the most important graph-modeling decisions.

Not everything should become a node, and not everything should become a relationship.

## 3.1 When Should Something Be a Node?

Create a node when something represents an entity that has its own identity or needs to participate in multiple relationships.

Examples:

- User.
- Product.
- Company.
- Order.
- Payment.
- Location.
- Device.

Example:

```text
(User)-[:PLACED]->(Order)
```

An order deserves its own node because it has:

- An order ID.
- A creation date.
- A status.
- Multiple products.
- A payment.
- A shipping address.

## 3.2 When Should Something Be a Relationship?

Use a relationship when something describes a connection or interaction between two entities.

Examples:

```text
(User)-[:FOLLOWS]->(User)

(User)-[:WORKS_AT]->(Company)

(Product)-[:BELONGS_TO]->(Category)

(User)-[:PURCHASED]->(Product)
```

A relationship can also contain properties.

Example:

```cypher
CREATE
    (u:User {userId: 101})
    -[:RATED {
        rating: 5,
        ratedAt: datetime()
    }]->
    (p:Product {productId: 501});
```

The rating describes the user's interaction with the product.

## 3.3 When Should a Relationship Become a Node?

Suppose users transfer money to each other.

A simple model might be:

```text
(Account A)-[:TRANSFERRED_TO]->(Account B)
```

But a real transfer has its own identity and lifecycle:

- Transaction ID.
- Amount.
- Timestamp.
- Status.
- Currency.
- Reference number.
- Failure reason.

A better model may be:

```text
(Account A)-[:INITIATED]->(Transaction)
(Transaction)-[:RECEIVED_BY]->(Account B)
```

Now the transaction is a node.

Why?

Because the transaction is an independent business entity.

It may connect to additional entities:

```text
(Account A)
     |
  INITIATED
     |
     v
(Transaction)
     |
 RECEIVED_BY
     |
     v
(Account B)

(Transaction)-[:PROCESSED_BY]->(PaymentGateway)

(Transaction)-[:HAS_STATUS]->(TransactionStatus)
```

### Decision table

| Question                                                 | Modeling choice                       |
| -------------------------------------------------------- | ------------------------------------- |
| Does it represent an independent entity?                 | Usually a node                        |
| Does it have its own ID?                                 | Strong indication for a node          |
| Does it have its own lifecycle?                          | Usually a node                        |
| Does it mainly describe a connection?                    | Usually a relationship                |
| Does the connection need attributes?                     | Relationship properties may be enough |
| Does it connect to several other entities independently? | Consider a node                       |

Do not create nodes for every property. That creates unnecessarily complicated graphs.

---

# 4. Modeling One-to-One, One-to-Many and Many-to-Many Relationships

Graph databases do not require foreign keys in the same way as relational databases, but the business relationship cardinality still matters.

Let's understand common relationship patterns.

## 4.1 One-to-One Relationship

Example:

One user has one profile.

```text
(User)-[:HAS_PROFILE]->(Profile)
```

Graph:

```text
(User:101)
     |
 HAS_PROFILE
     |
     v
(Profile:501)
```

Cypher:

```cypher
CREATE
    (u:User {userId: 101, name: "Prashant"}),
    (p:Profile {profileId: 501, bio: "Backend Developer"});

MATCH (u:User {userId: 101})
MATCH (p:Profile {profileId: 501})

CREATE (u)-[:HAS_PROFILE]->(p);
```

The graph model allows the relationship to exist, but the business rule that each user has exactly one profile must be enforced by application logic, constraints, or database-specific mechanisms.

A relationship alone does not automatically enforce one-to-one cardinality.

## 4.2 One-to-Many Relationship

Example:

One customer can place multiple orders.

```text
          (Order 1)
          /
(User) --+---- (Order 2)
          \
          (Order 3)
```

Cypher:

```cypher
MATCH (u:User {userId: 101})
MATCH (o:Order {orderId: 5001})

CREATE (u)-[:PLACED]->(o);
```

The user can be connected to multiple order nodes.

## 4.3 Many-to-Many Relationship

Example:

Users can purchase multiple products, and products can be purchased by multiple users.

```text
(User A) ------> (Product X)
   |                  ^
   |                  |
   v                  |
(Product Y)       (User B)
```

A more complete graph:

```text
(User A) ----PURCHASED----> (Product X)
(User A) ----PURCHASED----> (Product Y)
(User B) ----PURCHASED----> (Product X)
```

This is naturally represented through multiple relationships.

### Important distinction

If purchases are independent business events, modeling an `Order` node is often better than directly connecting a user to a product.

For example:

```text
(User)-[:PLACED]->(Order)
(Order)-[:CONTAINS]->(Product)
```

This captures order identity, quantity, pricing, and other purchase-specific details.

---

# 5. Modeling Relationship Properties

One major advantage of a property graph is that relationships can have properties.

Suppose a user follows another user.

You want to store:

- When the follow started.
- Whether the follow is active.
- Whether it was initiated through a recommendation.

You can model:

```text
(Prashant)-[:FOLLOWS {
    since: "2026-01-10",
    source: "recommendation",
    active: true
}]->(Rahul)
```

Cypher:

```cypher
MATCH (p:User {name: "Prashant"})
MATCH (r:User {name: "Rahul"})

CREATE (p)-[:FOLLOWS {
    since: date("2026-01-10"),
    source: "recommendation",
    active: true
}]->(r);
```

Query:

```cypher
MATCH
    (p:User)-[r:FOLLOWS]->(u:User)

WHERE r.active = true

RETURN p.name, u.name, r.since;
```

## 5.1 When Should You Store Data on a Relationship?

Consider these examples:

| Relationship   | Possible properties     |
| -------------- | ----------------------- |
| FOLLOWS        | since, source, active   |
| PURCHASED      | quantity, purchase date |
| WORKS_AT       | start date, designation |
| RATED          | rating, review date     |
| TRANSFERRED_TO | amount, timestamp       |
| CONNECTED_TO   | distance, latency       |

These properties describe the relationship rather than simply describing one endpoint.

## 5.2 When Should You Create a Separate Node Instead?

Suppose a company has many employees, and each employee has an employment record with:

- Employment ID.
- Start date.
- End date.
- Contract type.
- Salary history.
- Approval history.

A simple relationship could store some of these properties:

```text
(Employee)-[:WORKS_AT {
    startDate: "2024-01-01",
    designation: "Developer"
}]->(Company)
```

But if the employment record has an independent lifecycle, history, or relationships to other entities, it may deserve a separate node:

```text
(Employee)-[:HAS_EMPLOYMENT]->(Employment)
(Employment)-[:AT_COMPANY]->(Company)
```

The decision depends on whether the connection is simple or represents an independently meaningful entity.

---

# 6. Graph Modeling Example: Social Network

Let's design a social network.

## 6.1 Requirements

The application supports:

- User registration.
- Following other users.
- Friendships.
- Posts.
- Likes.
- Comments.
- Group membership.

## 6.2 Identify Nodes

```text
User
Post
Comment
Group
```

## 6.3 Identify Relationships

```text
(User)-[:FOLLOWS]->(User)

(User)-[:CREATED]->(Post)

(User)-[:LIKED]->(Post)

(User)-[:COMMENTED_ON]->(Post)

(Post)-[:HAS_COMMENT]->(Comment)

(User)-[:MEMBER_OF]->(Group)
```

## 6.4 Complete Graph

```text
                  (User:Prashant)
                   /     |      \
              FOLLOWS  CREATED  MEMBER_OF
                 /       |         \
                v        v          v
          (User:Rahul) (Post:101)  (Group:Tech)

                           |
                         HAS_COMMENT
                           |
                           v
                       (Comment:1)
```

Another user can like the post:

```text
(User:Rahul)-[:LIKED]->(Post:101)
```

## 6.5 Create Nodes

```cypher
CREATE
    (p:User {
        userId: 101,
        name: "Prashant"
    }),

    (r:User {
        userId: 102,
        name: "Rahul"
    }),

    (post:Post {
        postId: 501,
        content: "Learning graph databases"
    }),

    (g:Group {
        groupId: 201,
        name: "Backend Developers"
    });
```

## 6.6 Create Relationships

```cypher
MATCH (p:User {userId: 101})
MATCH (r:User {userId: 102})
MATCH (post:Post {postId: 501})
MATCH (g:Group {groupId: 201})

CREATE
    (p)-[:FOLLOWS]->(r),
    (p)-[:CREATED]->(post),
    (p)-[:MEMBER_OF]->(g),
    (r)-[:LIKED]->(post);
```

## 6.7 Query Examples

Find users followed by Prashant:

```cypher
MATCH
    (p:User {userId: 101})
    -[:FOLLOWS]->(u:User)

RETURN u.name;
```

Find posts created by Prashant:

```cypher
MATCH
    (p:User {userId: 101})
    -[:CREATED]->(post:Post)

RETURN post;
```

Find users who liked a post:

```cypher
MATCH
    (u:User)-[:LIKED]->(p:Post {postId: 501})

RETURN u.name;
```

Find users in a group:

```cypher
MATCH
    (u:User)-[:MEMBER_OF]->(g:Group {groupId: 201})

RETURN u.name;
```

### Modeling lesson

Social networks contain many types of relationships between the same entities.

For example:

```text
(User A)-[:FOLLOWS]->(User B)

(User A)-[:BLOCKED]->(User B)

(User A)-[:FRIENDS_WITH]->(User B)
```

These are separate business relationships and should not be collapsed into one generic relationship type.

---

# 7. Graph Modeling Example: E-commerce Application

Now let's design an e-commerce graph.

## 7.1 Requirements

The application contains:

- Users.
- Products.
- Categories.
- Orders.
- Payments.
- Reviews.
- Sellers.

## 7.2 Nodes

```text
User
Product
Category
Order
Payment
Review
Seller
```

## 7.3 Relationships

```text
(User)-[:PLACED]->(Order)

(Order)-[:CONTAINS]->(Product)

(Product)-[:BELONGS_TO]->(Category)

(Order)-[:PAID_BY]->(Payment)

(User)-[:WROTE]->(Review)

(Review)-[:REVIEWS]->(Product)

(Seller)-[:SELLS]->(Product)

(Product)-[:SIMILAR_TO]->(Product)
```

## 7.4 Graph Diagram

```text
                  (User)
                    |
                  PLACED
                    |
                    v
                  (Order)
                    |
                 CONTAINS
                    |
                    v
                 (Product)
                 /       \
         BELONGS_TO      SIMILAR_TO
              /              \
             v                v
        (Category)         (Product)

(User)-[:WROTE]->(Review)-[:REVIEWS]->(Product)

(Order)-[:PAID_BY]->(Payment)

(Seller)-[:SELLS]->(Product)
```

## 7.5 Why Is This Model Useful?

It can support queries such as:

- Which products did a user purchase?
- Which category does a product belong to?
- Which products are similar?
- Which seller sells a particular product?
- Which users reviewed a product?
- Which products were purchased by users who purchased another product?

These are relationship-oriented queries.

## 7.6 Modeling Order Items

An important decision is whether `OrderItem` should be a node or whether quantity and price should be properties on the `CONTAINS` relationship.

### Option A: Relationship Properties

```text
(Order)-[:CONTAINS {
    quantity: 2,
    unitPrice: 50000
}]->(Product)
```

This works when the order item is primarily a connection between an order and a product.

### Option B: OrderItem Node

```text
(Order)-[:HAS_ITEM]->(OrderItem)

(OrderItem)-[:REFERS_TO]->(Product)
```

The `OrderItem` node is useful when an order item has its own identity, lifecycle, or multiple relationships.

For example, an order item may have:

- Item ID.
- Quantity.
- Unit price at purchase time.
- Discount.
- Tax.
- Fulfilment status.
- Return status.

It may also connect to shipment or return records.

**Important:** Do not automatically convert every relationship with properties into a node. Choose based on identity, lifecycle, and query requirements.

---

# 8. Modeling Recommendation Systems

Recommendation systems are a particularly useful graph use case.

Suppose an e-commerce application wants to recommend products based on user activity.

## 8.1 Entities

```text
User
Product
Category
Brand
```

## 8.2 Relationships

```text
(User)-[:VIEWED]->(Product)

(User)-[:PURCHASED]->(Product)

(User)-[:ADDED_TO_CART]->(Product)

(Product)-[:BELONGS_TO]->(Category)

(Product)-[:MADE_BY]->(Brand)

(Product)-[:SIMILAR_TO]->(Product)
```

## 8.3 Example Graph

```text
(User A)
   |
 PURCHASED
   |
   v
(Laptop)
   |
 SIMILAR_TO
   |
   v
(Gaming Laptop)
   |
 BELONGS_TO
   |
   v
(Electronics)
```

Another user may have purchased both products:

```text
(User B)-[:PURCHASED]->(Laptop)

(User B)-[:PURCHASED]->(Gaming Laptop)
```

The application can discover product relationships by traversing shared users and product categories.

## 8.4 Recommendation Query

Find products purchased by users who also purchased a particular product:

```cypher
MATCH
    (target:Product {productId: 501})
    <-[:PURCHASED]-
    (otherUser:User)
    -[:PURCHASED]->
    (recommended:Product)

WHERE recommended.productId <> target.productId

RETURN
    recommended.name,
    count(DISTINCT otherUser) AS sharedBuyers

ORDER BY sharedBuyers DESC;
```

This is a simplified collaborative recommendation pattern.

It finds products purchased by users who purchased the target product.

A production recommendation system would need additional logic, such as:

- Excluding already purchased products.
- Applying recency weighting.
- Filtering unavailable products.
- Considering user preferences.
- Preventing popularity bias.
- Combining graph signals with ranking models.

### Modeling lesson

The graph captures relationships between users and products. The recommendation algorithm determines how to interpret those relationships.

A graph database does not automatically produce high-quality recommendations.

---

# 9. Modeling Identity and Unique Constraints

Graph databases need a way to identify entities reliably.

For example:

```text
User ID = 101
Product ID = 501
Order ID = 5001
```

These identifiers should be stable.

## 9.1 Why Are Unique Identifiers Important?

Suppose you create a user twice:

```text
(:User {userId: 101, name: "Prashant"})

(:User {userId: 101, name: "Prashant"})
```

Now you have duplicate logical users.

This can create:

- Duplicate relationships.
- Incorrect recommendations.
- Inconsistent user history.
- Incorrect counts.
- Duplicate business entities.

Use database constraints where supported.

## 9.2 Neo4j Uniqueness Constraint Example

```cypher
CREATE CONSTRAINT user_id_unique
FOR (u:User)
REQUIRE u.userId IS UNIQUE;
```

Now Neo4j enforces uniqueness for the `userId` property among `User` nodes.

You can similarly create a product constraint:

```cypher
CREATE CONSTRAINT product_id_unique
FOR (p:Product)
REQUIRE p.productId IS UNIQUE;
```

Constraint syntax and supported options can vary by Neo4j version.

## 9.3 MERGE vs CREATE

`CREATE` creates new nodes or relationships.

`MERGE` matches an existing pattern or creates it if it does not exist.

Example:

```cypher
MERGE (u:User {userId: 101})
ON CREATE SET
    u.name = "Prashant";
```

This avoids blindly creating another matching user node.

However, `MERGE` should be used with appropriate uniqueness constraints and concurrency-aware design. It is not a substitute for designing reliable identity rules.

---

# 10. Graph Schema Design

Graph databases are often described as schema-flexible, but that does not mean schema design is unnecessary.

You still need to define:

- Node labels.
- Relationship types.
- Property names.
- Data types.
- Identity rules.
- Constraints.
- Indexes.
- Expected query patterns.

## 10.1 Example Schema

For an e-commerce graph:

```text
Node Labels:

User
Product
Order
Category
Payment
Review
Seller
```

Relationship types:

```text
PLACED
CONTAINS
BELONGS_TO
PAID_BY
WROTE
REVIEWS
SELLS
SIMILAR_TO
```

Properties:

```text
User:
    userId
    name
    email

Product:
    productId
    name
    price

Order:
    orderId
    orderDate
    status

Payment:
    paymentId
    amount
    status
```

This is a logical graph schema.

## 10.2 Query-Driven Graph Modeling

As with Cassandra, graph modeling should consider application queries.

However, the modeling approach is different.

In Cassandra, you often design tables around known access patterns.

In a graph database, you design nodes and relationships to represent the domain and support expected traversals.

Example requirements:

1. Find products purchased by a user.
2. Find users who purchased the same product.
3. Find products purchased by those users.
4. Find similar products.
5. Find products in a particular category.

The graph should represent the relevant connections.

Do not blindly copy every relational table into graph nodes and every foreign key into a relationship.

First understand what the application needs to traverse.

---

# 11. Graph Modeling Mistakes

These are common mistakes in graph database design.

## 11.1 Creating Too Many Nodes

Poor model:

```text
(User)-[:HAS_NAME]->(Name)
(User)-[:HAS_EMAIL]->(Email)
(User)-[:HAS_AGE]->(Age)
```

This creates nodes for simple scalar properties.

A better model:

```text
(:User {
    name: "Prashant",
    email: "prashant@example.com",
    age: 25
})
```

Use properties for ordinary attributes.

Create separate nodes when those values represent independent entities that need their own relationships or lifecycle.

## 11.2 Using Generic Relationship Types

Poor model:

```text
(User)-[:CONNECTED_TO]->(User)
```

This does not explain what the connection means.

Better:

```text
(User)-[:FOLLOWS]->(User)

(User)-[:FRIENDS_WITH]->(User)

(User)-[:BLOCKED]->(User)
```

Specific relationship types make queries clearer and can improve modeling discipline.

## 11.3 Ignoring Relationship Direction

Consider:

```text
(A)-[:FOLLOWS]->(B)
```

This means A follows B.

It does not automatically mean B follows A.

If the application treats friendship as symmetric, model and query it accordingly.

Do not accidentally treat directed relationships as bidirectional.

## 11.4 Modeling Everything as a Relationship

Suppose a payment has:

- Payment ID.
- Amount.
- Status.
- Gateway reference.
- Refund history.
- Retry history.

Representing the payment only as a relationship may make the model difficult to extend.

A separate `Payment` node is often more appropriate.

## 11.5 Modeling Everything as a Node

The opposite mistake is creating a node for every connection.

For example:

```text
(User)-[:PURCHASED]->(Product)
```

If the purchase is merely a simple relationship and does not need its own identity, a separate `Purchase` node may add unnecessary complexity.

However, if it represents an order item or independent purchase event, a node may be justified.

The correct model depends on the domain.

## 11.6 Ignoring High-Degree Nodes

A node with millions of relationships can become expensive to traverse.

Examples:

- Celebrity accounts.
- Extremely popular products.
- Large public groups.
- Common IP addresses in fraud networks.

Avoid assuming all nodes have similar numbers of relationships.

Test queries against realistic degree distributions.

## 11.7 Unbounded Variable-Length Traversals

Risky query:

```cypher
MATCH
    (u:User {userId: 101})
    -[:FOLLOWS*]->
    (connected:User)

RETURN connected;
```

This has no explicit maximum traversal depth.

A bounded version:

```cypher
MATCH
    (u:User {userId: 101})
    -[:FOLLOWS*1..3]->
    (connected:User)

RETURN DISTINCT connected;
```

A bounded traversal is often easier to reason about and control.

---

# 12. Graph Data Modeling vs Relational Data Modeling

Let's compare the design process.

| Design aspect           | Relational database                      | Graph database                                      |
| ----------------------- | ---------------------------------------- | --------------------------------------------------- |
| Primary structures      | Tables                                   | Nodes and relationships                             |
| Entity representation   | Rows                                     | Nodes                                               |
| Relationships           | Foreign keys and join tables             | Edges                                               |
| Relationship attributes | Columns in join tables or related tables | Relationship properties or separate nodes           |
| Schema design           | Tables, columns, constraints             | Labels, relationship types, properties, constraints |
| Query focus             | Filtering and joining rows               | Traversing relationships                            |
| Common design concern   | Normalization and joins                  | Relationship semantics and traversal patterns       |

## 12.1 Example: User and Product

Relational model:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE purchases (
    user_id BIGINT REFERENCES users(id),
    product_id BIGINT REFERENCES products(id),
    purchased_at TIMESTAMP,
    PRIMARY KEY (user_id, product_id, purchased_at)
);
```

Graph model:

```text
(User)-[:PURCHASED {
    purchasedAt: datetime()
}]->(Product)
```

The graph model makes the relationship explicit.

The relational model provides strong relational constraints and transactional capabilities.

Neither model is universally superior.

---

# 13. Practical Modeling Workflow

When designing a graph database for a new application, follow this sequence.

## Step 1: Understand the Domain

List the important entities.

Example:

```text
User
Product
Order
Payment
Category
```

## Step 2: Identify Relationships

```text
User -> Order
Order -> Product
Order -> Payment
Product -> Category
```

Give each relationship a meaningful type and direction.

## Step 3: Identify Properties

```text
User:
    userId
    name
    email

Product:
    productId
    name
    price

Order:
    orderId
    status
    createdAt
```

Decide which attributes describe nodes and which describe relationships.

## Step 4: Identify Independent Entities

Ask whether a relationship represents a separate business entity.

For example:

- Is an order item independently identifiable?
- Does a payment have its own lifecycle?
- Does a transaction have multiple related events?

If yes, consider a separate node.

## Step 5: List Application Queries

Example:

```text
Find orders for a user.
Find products in a category.
Find users who purchased a product.
Find similar products.
Find paths between connected users.
```

## Step 6: Design and Validate Traversals

Write representative graph queries.

Check:

- Starting-node lookup.
- Relationship direction.
- Traversal depth.
- Expected result count.
- High-degree nodes.
- Index requirements.

## Step 7: Add Constraints and Indexes

Use unique constraints for identifiers and indexes for important lookup properties.

## Step 8: Test With Realistic Data

Test:

- Normal users.
- High-degree users.
- Large result sets.
- Duplicate creation attempts.
- Concurrent writes.
- Deep traversal queries.

A graph model that works with 100 nodes may behave very differently with 100 million nodes.

---

# 14. Interview Questions and Answers

## Q1. What is graph data modeling?

Graph data modeling is the process of representing application entities as nodes, connections as relationships, and attributes as properties.

The goal is to represent the domain and support the application's relationship-oriented queries.

## Q2. How do you decide whether something should be a node or relationship?

If it represents an independent entity with its own identity or lifecycle, model it as a node.

If it describes a connection between entities, model it as a relationship.

Relationship properties can store information about the connection.

## Q3. Can relationships have properties?

Yes.

Example:

```cypher
(User)-[:PURCHASED {
    amount: 2500,
    purchasedAt: datetime()
}]->(Product)
```

The relationship contains information about the purchase.

## Q4. How do you model a many-to-many relationship?

Create multiple relationships between the relevant nodes.

Example:

```text
(User A)-[:PURCHASED]->(Product X)
(User A)-[:PURCHASED]->(Product Y)
(User B)-[:PURCHASED]->(Product X)
```

If the interaction itself has independent identity or lifecycle, consider modeling it as a separate node.

## Q5. What is the difference between a relationship property and a separate node?

A relationship property describes the connection.

A separate node represents an independent entity.

For example, a simple follow date can be a relationship property.

A financial transaction with its own identity, status, and lifecycle should generally be modeled as a node.

## Q6. Why is relationship direction important?

Direction defines how entities are connected.

For example:

```text
(A)-[:FOLLOWS]->(B)
```

means A follows B.

It does not automatically mean B follows A.

## Q7. Should every foreign key become a graph relationship?

Not automatically.

First understand the business meaning and application queries.

A foreign key may represent a meaningful graph relationship, but mechanically copying every relational schema detail can produce a poor graph model.

## Q8. What is query-driven graph modeling?

It means designing the graph to represent the domain and support the traversals the application needs.

You identify important entities, relationships, and query patterns before finalizing the model.

## Q9. What is a high-degree node?

A high-degree node has a large number of relationships.

For example, a popular social media account with millions of followers.

Queries that traverse all its relationships can be expensive.

## Q10. Why should variable-length traversals be bounded?

Because deeper traversals can expand the search space rapidly.

Bounding traversal depth helps control execution cost and result size.

## Q11. Does a graph database automatically enforce one-to-one relationships?

No.

The graph model can represent the connection, but cardinality rules must be enforced using database constraints where supported or through application logic.

## Q12. Can graph databases replace relational databases?

Not generally.

Graph databases are useful for relationship-centric workloads.

Relational databases remain strong choices for transactional business data, constraints, and flexible SQL queries.

A system can use both when requirements justify it.

---

# 15. Practical Exercises

## Exercise 1 — Model a Social Network

Requirements:

- Users can follow each other.
- Users can create posts.
- Users can like posts.
- Users can comment on posts.
- Users can join groups.

Design:

1. Node labels.
2. Relationship types.
3. Node properties.
4. Relationship properties.
5. Relationship directions.

Do not create a node for every scalar property.

## Exercise 2 — Model a Banking System

Requirements:

- Customers have accounts.
- Accounts can transfer money.
- Transfers have transaction IDs.
- Transactions have statuses.
- Transactions can be processed by payment gateways.
- Transactions may be reversed.

A possible model:

```text
(Customer)-[:OWNS]->(Account)

(Account)-[:INITIATED]->(Transaction)

(Transaction)-[:RECEIVED_BY]->(Account)

(Transaction)-[:PROCESSED_BY]->(PaymentGateway)

(Transaction)-[:REVERSES]->(Transaction)
```

Questions:

1. Why should Transaction be a node?
2. Which attributes belong to Transaction?
3. Why is the transfer direction important?
4. How would you represent a failed transfer?
5. How would you represent a reversal?

## Exercise 3 — Model an E-commerce Recommendation Graph

Requirements:

- Users view products.
- Users purchase products.
- Products belong to categories.
- Products have brands.
- Products can be similar to other products.

Design a graph that supports:

1. Products purchased by similar users.
2. Products in the same category.
3. Products viewed but not purchased.
4. Similar products from different brands.

## Exercise 4 — Identify Modeling Mistakes

Evaluate these designs.

**Design A:**

```text
(User)-[:HAS_NAME]->(Name)
```

**Design B:**

```text
(User)-[:FOLLOWS]->(User)
```

**Design C:**

```text
(Account)-[:TRANSFERRED_TO]->(Account)
```

The transfer has a transaction ID, amount, status, gateway, and reversal history.

**Design D:**

```text
(User)-[:PURCHASED]->(Product)
```

The purchase has an order-item ID, quantity, tax, discount, and fulfilment lifecycle.

For each design, decide whether it should remain as a relationship, use relationship properties, or become a separate node.

---

# 16. Part 14C Summary

| Concept                     | What to remember                               |
| --------------------------- | ---------------------------------------------- |
| Graph data modeling         | Designing nodes, relationships, and properties |
| Entity                      | Usually represented as a node                  |
| Relationship                | Represents a connection between entities       |
| Relationship property       | Describes the connection                       |
| Independent business entity | Often deserves its own node                    |
| One-to-one                  | One entity connected to another                |
| One-to-many                 | One node connected to multiple nodes           |
| Many-to-many                | Multiple nodes connected through relationships |
| Labels                      | Classify nodes                                 |
| Relationship types          | Describe connections                           |
| Unique constraints          | Prevent duplicate identities                   |
| `CREATE`                    | Creates a new pattern                          |
| `MERGE`                     | Matches an existing pattern or creates it      |
| Query-driven modeling       | Design around important graph queries          |
| High-degree node            | Node with many relationships                   |
| Bounded traversal           | Limits graph exploration depth                 |

## The Most Important Mental Model

```text
Business Requirements
        |
        v
Identify Entities
        |
        v
Create Nodes
        |
        v
Identify Connections
        |
        v
Create Relationships
        |
        v
Assign Properties
        |
        v
Identify Independent Entities
        |
        v
Define Constraints and Indexes
        |
        v
Validate Application Queries
```

Three rules to remember:

1. **Entities become nodes; connections become relationships.**
2. **Relationship properties describe connections, while independent business entities deserve their own nodes.**
3. **Model around real application traversals, not by mechanically converting relational tables into graph structures.**

A good graph model makes the important relationships clear and makes the queries your application needs natural to express.
